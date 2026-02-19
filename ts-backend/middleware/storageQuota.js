const sql = require('mssql');
require('dotenv').config();

const config = {
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    server: process.env.DB_SERVER,
    database: process.env.DB_NAME,
    options: {
        encrypt: true
    }
};

// Free tier limit: 50MB in bytes
const FREE_TIER_LIMIT = 50 * 1024 * 1024; // 50MB

/**
 * Get user's current storage usage
 * @param {number} userId - User ID
 * @returns {Promise<{used: number, limit: number, available: number}>}
 */
async function getUserStorageUsage(userId) {
    try {
        const pool = await sql.connect(config);
        const result = await pool.request()
            .input('userid', sql.Int, userId)
            .query('SELECT storageUsed FROM TS_PropertyUsers WHERE userid = @userid');

        if (result.recordset.length === 0) {
            throw new Error('Käyttäjää ei löydy');
        }

        const used = result.recordset[0].storageUsed || 0;
        const available = Math.max(0, FREE_TIER_LIMIT - used);

        return {
            used,
            limit: FREE_TIER_LIMIT,
            available
        };
    } catch (error) {
        console.error('Error getting storage usage:', error);
        // If column doesn't exist yet, return default values
        if (error.message && error.message.includes('Invalid column name')) {
            console.warn('⚠️  storageUsed column not found - quota tracking disabled');
            return {
                used: 0,
                limit: FREE_TIER_LIMIT,
                available: FREE_TIER_LIMIT
            };
        }
        throw error;
    }
}

/**
 * Check if user has enough storage space for a file
 * @param {number} userId - User ID
 * @param {number} fileSize - File size in bytes
 * @returns {Promise<{allowed: boolean, message: string, usage: object}>}
 */
async function checkStorageQuota(userId, fileSize) {
    try {
        const usage = await getUserStorageUsage(userId);

        if (fileSize > usage.available) {
            const usedMB = (usage.used / (1024 * 1024)).toFixed(2);
            const limitMB = (usage.limit / (1024 * 1024)).toFixed(0);
            
            return {
                allowed: false,
                message: `Tallennustila täynnä. Käytössä ${usedMB} MB / ${limitMB} MB. Poista tiedostoja vapauttaaksesi tilaa.`,
                usage
            };
        }

        return {
            allowed: true,
            message: 'Tallennustila riittää',
            usage
        };
    } catch (error) {
        console.error('Error checking storage quota:', error);
        throw error;
    }
}

/**
 * Add storage usage for a user
 * @param {number} userId - User ID
 * @param {number} fileSize - File size in bytes to add
 * @returns {Promise<void>}
 */
async function addStorageUsage(userId, fileSize) {
    try {
        const pool = await sql.connect(config);
        await pool.request()
            .input('userid', sql.Int, userId)
            .input('fileSize', sql.BigInt, fileSize)
            .query(`
                UPDATE TS_PropertyUsers 
                SET storageUsed = ISNULL(storageUsed, 0) + @fileSize
                WHERE userid = @userid
            `);
        
        console.log(`Added ${fileSize} bytes to user ${userId} storage usage`);
    } catch (error) {
        console.error('Error adding storage usage:', error);
        // If column doesn't exist, just log a warning and continue
        if (error.message && error.message.includes('Invalid column name')) {
            console.warn('⚠️  storageUsed column not found - skipping quota tracking');
            return;
        }
        throw error;
    }
}

/**
 * Remove storage usage for a user
 * @param {number} userId - User ID
 * @param {number} fileSize - File size in bytes to remove
 * @returns {Promise<void>}
 */
async function removeStorageUsage(userId, fileSize) {
    try {
        const pool = await sql.connect(config);
        await pool.request()
            .input('userid', sql.Int, userId)
            .input('fileSize', sql.BigInt, fileSize)
            .query(`
                UPDATE TS_PropertyUsers 
                SET storageUsed = CASE 
                    WHEN ISNULL(storageUsed, 0) - @fileSize < 0 THEN 0
                    ELSE ISNULL(storageUsed, 0) - @fileSize
                END
                WHERE userid = @userid
            `);
        
        console.log(`Removed ${fileSize} bytes from user ${userId} storage usage`);
    } catch (error) {
        console.error('Error removing storage usage:', error);
        // If column doesn't exist, just log a warning and continue
        if (error.message && error.message.includes('Invalid column name')) {
            console.warn('⚠️  storageUsed column not found - skipping quota tracking');
            return;
        }
        throw error;
    }
}

module.exports = {
    getUserStorageUsage,
    checkStorageQuota,
    addStorageUsage,
    removeStorageUsage,
    FREE_TIER_LIMIT
};
