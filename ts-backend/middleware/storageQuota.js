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

// Free tier limits in bytes
const QUOTA_LIMITS = {
    documents: 50 * 1024 * 1024,        // 50MB for documents
    propertyImages: 20 * 1024 * 1024,   // 20MB for property images
    renovationImages: 50 * 1024 * 1024  // 50MB for renovation images
};

// Column names for each quota type
const QUOTA_COLUMNS = {
    documents: 'storageUsed',
    propertyImages: 'propertyImagesUsed',
    renovationImages: 'renovationImagesUsed'
};

/**
 * Get user's current storage usage for a specific type
 * @param {number} userId - User ID
 * @param {string} type - 'documents', 'propertyImages', or 'renovationImages'
 * @returns {Promise<{used: number, limit: number, available: number}>}
 */
async function getUserStorageUsage(userId, type = 'documents') {
    const columnName = QUOTA_COLUMNS[type];
    const limit = QUOTA_LIMITS[type];

    if (!columnName || !limit) {
        throw new Error(`Invalid storage type: ${type}`);
    }

    try {
        const pool = await sql.connect(config);
        const result = await pool.request()
            .input('userid', sql.Int, userId)
            .query(`SELECT ${columnName} FROM TS_PropertyUsers WHERE userid = @userid`);

        if (result.recordset.length === 0) {
            throw new Error('Käyttäjää ei löydy');
        }

        // Convert to number to ensure proper arithmetic operations (SQL returns as string)
        const used = Number(result.recordset[0][columnName]) || 0;
        const available = Math.max(0, limit - used);

        return {
            used,
            limit,
            available
        };
    } catch (error) {
        console.error(`Error getting ${type} storage usage:`, error);
        // If column doesn't exist yet, return default values
        if (error.message && error.message.includes('Invalid column name')) {
            console.warn(`⚠️  ${columnName} column not found - quota tracking disabled`);
            return {
                used: 0,
                limit,
                available: limit
            };
        }
        throw error;
    }
}

/**
 * Check if user has enough storage space for a file
 * @param {number} userId - User ID
 * @param {number} fileSize - File size in bytes
 * @param {string} type - 'documents', 'propertyImages', or 'renovationImages'
 * @returns {Promise<{allowed: boolean, message: string, usage: object}>}
 */
async function checkStorageQuota(userId, fileSize, type = 'documents') {
    try {
        const usage = await getUserStorageUsage(userId, type);

        if (fileSize > usage.available) {
            const usedMB = (usage.used / (1024 * 1024)).toFixed(2);
            const limitMB = (usage.limit / (1024 * 1024)).toFixed(0);
            
            const typeNames = {
                documents: 'dokumentit',
                propertyImages: 'kiinteistökuvat',
                renovationImages: 'remonttikuvat'
            };
            
            return {
                allowed: false,
                message: `Tallennustila täynnä (${typeNames[type]}). Käytössä ${usedMB} MB / ${limitMB} MB. Poista tiedostoja vapauttaaksesi tilaa.`,
                usage
            };
        }

        return {
            allowed: true,
            message: 'Tallennustila riittää',
            usage
        };
    } catch (error) {
        console.error(`Error checking ${type} storage quota:`, error);
        throw error;
    }
}

/**
 * Add storage usage for a user
 * @param {number} userId - User ID
 * @param {number} fileSize - File size in bytes to add
 * @param {string} type - 'documents', 'propertyImages', or 'renovationImages'
 * @returns {Promise<void>}
 */
async function addStorageUsage(userId, fileSize, type = 'documents') {
    const columnName = QUOTA_COLUMNS[type];
    
    if (!columnName) {
        throw new Error(`Invalid storage type: ${type}`);
    }

    try {
        const pool = await sql.connect(config);
        await pool.request()
            .input('userid', sql.Int, userId)
            .input('fileSize', sql.BigInt, fileSize)
            .query(`
                UPDATE TS_PropertyUsers 
                SET ${columnName} = ISNULL(${columnName}, 0) + @fileSize
                WHERE userid = @userid
            `);
        
        console.log(`Added ${fileSize} bytes to user ${userId} ${type} storage usage`);
    } catch (error) {
        console.error(`Error adding ${type} storage usage:`, error);
        // If column doesn't exist, just log a warning and continue
        if (error.message && error.message.includes('Invalid column name')) {
            console.warn(`⚠️  ${columnName} column not found - skipping quota tracking`);
            return;
        }
        throw error;
    }
}

/**
 * Remove storage usage for a user
 * @param {number} userId - User ID
 * @param {number} fileSize - File size in bytes to remove
 * @param {string} type - 'documents', 'propertyImages', or 'renovationImages'
 * @returns {Promise<void>}
 */
async function removeStorageUsage(userId, fileSize, type = 'documents') {
    const columnName = QUOTA_COLUMNS[type];
    
    if (!columnName) {
        throw new Error(`Invalid storage type: ${type}`);
    }

    try {
        const pool = await sql.connect(config);
        await pool.request()
            .input('userid', sql.Int, userId)
            .input('fileSize', sql.BigInt, fileSize)
            .query(`
                UPDATE TS_PropertyUsers 
                SET ${columnName} = CASE 
                    WHEN ISNULL(${columnName}, 0) - @fileSize < 0 THEN 0
                    ELSE ISNULL(${columnName}, 0) - @fileSize
                END
                WHERE userid = @userid
            `);
        
        console.log(`Removed ${fileSize} bytes from user ${userId} ${type} storage usage`);
    } catch (error) {
        console.error(`Error removing ${type} storage usage:`, error);
        // If column doesn't exist, just log a warning and continue
        if (error.message && error.message.includes('Invalid column name')) {
            console.warn(`⚠️  ${columnName} column not found - skipping quota tracking`);
            return;
        }
        throw error;
    }
}

/**
 * Get all storage quotas for a user (documents, property images, renovation images)
 * @param {number} userId - User ID
 * @returns {Promise<object>} Object with all three quota types
 */
async function getAllStorageUsage(userId) {
    try {
        const [docs, propImages, renImages] = await Promise.all([
            getUserStorageUsage(userId, 'documents'),
            getUserStorageUsage(userId, 'propertyImages'),
            getUserStorageUsage(userId, 'renovationImages')
        ]);

        const total = {
            used: docs.used + propImages.used + renImages.used,
            limit: docs.limit + propImages.limit + renImages.limit,
            available: docs.available + propImages.available + renImages.available
        };

        return {
            documents: docs,
            propertyImages: propImages,
            renovationImages: renImages,
            total
        };
    } catch (error) {
        console.error('Error getting all storage usage:', error);
        throw error;
    }
}

module.exports = {
    getUserStorageUsage,
    checkStorageQuota,
    addStorageUsage,
    removeStorageUsage,
    getAllStorageUsage,
    QUOTA_LIMITS
};
