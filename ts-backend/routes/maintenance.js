
const express = require('express');
const router = express.Router();
const sql = require('mssql');


// Mark a recurring maintenance entry as done for a specific month
router.post('/entries/:id/monthdone', async (req, res) => {
    // id = maintenanceentry_id
    const { id } = req.params;
    const { year, month, done, note, user_id } = req.body;
    try {
        const pool = await sql.connect();
        // Check if already exists
        const checkRes = await pool.request()
            .input('maintenanceentry_id', sql.Int, id)
            .input('year', sql.Int, year)
            .input('month', sql.Int, month)
            .query('SELECT * FROM TS_MaintenanceMonthDone WHERE maintenanceentry_id = @maintenanceentry_id AND year = @year AND month = @month');
        if (checkRes.recordset.length > 0) {
            // Update existing
            await pool.request()
                .input('id', sql.Int, checkRes.recordset[0].id)
                .input('done', sql.Bit, done ? 1 : 0)
                .input('done_date', sql.Date, done ? new Date() : null)
                .input('note', sql.NVarChar(255), note || '')
                .query('UPDATE TS_MaintenanceMonthDone SET done = @done, done_date = @done_date, note = @note WHERE id = @id');
        } else {
            // Insert new
            await pool.request()
                .input('maintenanceentry_id', sql.Int, id)
                .input('year', sql.Int, year)
                .input('month', sql.Int, month)
                .input('done', sql.Bit, done ? 1 : 0)
                .input('done_date', sql.Date, done ? new Date() : null)
                .input('user_id', sql.Int, user_id)
                .input('note', sql.NVarChar(255), note || '')
                .query('INSERT INTO TS_MaintenanceMonthDone (maintenanceentry_id, year, month, done, done_date, user_id, note) VALUES (@maintenanceentry_id, @year, @month, @done, @done_date, @user_id, @note)');
        }
        res.json({ message: 'Month status updated' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Get all month done statuses for a maintenance entry (for a year)
router.get('/entries/:id/monthdone', async (req, res) => {
    const { id } = req.params;
    const { year } = req.query;
    try {
        const pool = await sql.connect();
        let query = 'SELECT * FROM TS_MaintenanceMonthDone WHERE maintenanceentry_id = @id';
        if (year) query += ' AND year = @year';
        const reqSql = pool.request().input('id', sql.Int, id);
        if (year) reqSql.input('year', sql.Int, year);
        const result = await reqSql.query(query);
        res.json(result.recordset);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});



// Get or create property maintenance book
router.get('/book/:propertyid', async (req, res) => {
    const { propertyid } = req.params;
    try {
        const pool = await sql.connect();
        let result = await pool.request()
            .input('propertyid', sql.Int, propertyid)
            .query('SELECT * FROM TS_PropertyMaintenanceBook WHERE propertyid = @propertyid');
        if (result.recordset.length === 0) {
            // Create new book if not exists
            await pool.request()
                .input('propertyid', sql.Int, propertyid)
                .input('name', sql.NVarChar(100), 'Kiinteistön huoltokirja')
                .query('INSERT INTO TS_PropertyMaintenanceBook (propertyid, name) VALUES (@propertyid, @name)');
            result = await pool.request()
                .input('propertyid', sql.Int, propertyid)
                .query('SELECT * FROM TS_PropertyMaintenanceBook WHERE propertyid = @propertyid');
        }
        res.json(result.recordset[0]);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Get all maintenance entries for a property (by book)
router.get('/entries/:propertyid', async (req, res) => {
    const { propertyid } = req.params;
    try {
        const pool = await sql.connect();
        const bookRes = await pool.request()
            .input('propertyid', sql.Int, propertyid)
            .query('SELECT id FROM TS_PropertyMaintenanceBook WHERE propertyid = @propertyid');
        if (bookRes.recordset.length === 0) return res.json([]);
        const bookId = bookRes.recordset[0].id;
        const entriesRes = await pool.request()
            .input('bookId', sql.Int, bookId)
            .query('SELECT * FROM TS_MaintenanceEntry WHERE maintenancebook_id = @bookId');
        res.json(entriesRes.recordset);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Add a maintenance entry
router.post('/entries', async (req, res) => {
    const { propertyid, task_name, description, recommended_frequency, user_id, note, is_recurring, recurring_months, year } = req.body;
    try {
        const pool = await sql.connect();
        // Get or create book
        let bookRes = await pool.request()
            .input('propertyid', sql.Int, propertyid)
            .query('SELECT id FROM TS_PropertyMaintenanceBook WHERE propertyid = @propertyid');
        let bookId;
        if (bookRes.recordset.length === 0) {
            await pool.request()
                .input('propertyid', sql.Int, propertyid)
                .input('name', sql.NVarChar(100), 'Kiinteistön huoltokirja')
                .query('INSERT INTO TS_PropertyMaintenanceBook (propertyid, name) VALUES (@propertyid, @name)');
            bookRes = await pool.request()
                .input('propertyid', sql.Int, propertyid)
                .query('SELECT id FROM TS_PropertyMaintenanceBook WHERE propertyid = @propertyid');
        }
        bookId = bookRes.recordset[0].id;
        await pool.request()
            .input('maintenancebook_id', sql.Int, bookId)
            .input('task_name', sql.NVarChar(100), task_name)
            .input('description', sql.NVarChar(255), description)
            .input('recommended_frequency', sql.NVarChar(50), recommended_frequency)
            .input('user_id', sql.Int, user_id)
            .input('note', sql.NVarChar(255), note)
            .input('is_recurring', sql.Bit, is_recurring ? 1 : 0)
            .input('recurring_months', sql.NVarChar(50), recurring_months)
            .input('year', sql.Int, year)
            .query('INSERT INTO TS_MaintenanceEntry (maintenancebook_id, task_name, description, recommended_frequency, user_id, note, is_recurring, recurring_months, year) VALUES (@maintenancebook_id, @task_name, @description, @recommended_frequency, @user_id, @note, @is_recurring, @recurring_months, @year)');
        res.status(201).json({ message: 'Entry added' });
    } catch (err) {
        console.error('POST /api/maintenance/entries error:', err);
        res.status(500).json({ error: err.message });
    }
});

// Update a maintenance entry (mark done, edit note, etc)
router.put('/entries/:id', async (req, res) => {
    const { id } = req.params;
    const { done, done_date, note, task_name, description, recommended_frequency, is_recurring, recurring_months, year } = req.body;
    try {
        const pool = await sql.connect();
        await pool.request()
            .input('id', sql.Int, id)
            .input('done', sql.Bit, done)
            .input('done_date', sql.Date, done_date)
            .input('note', sql.NVarChar(255), note)
            .input('task_name', sql.NVarChar(100), task_name)
            .input('description', sql.NVarChar(255), description)
            .input('recommended_frequency', sql.NVarChar(50), recommended_frequency)
            .input('is_recurring', sql.Bit, is_recurring ? 1 : 0)
            .input('recurring_months', sql.NVarChar(50), recurring_months)
            .input('year', sql.Int, year)
            .query(`UPDATE TS_MaintenanceEntry SET 
                done = @done, 
                done_date = @done_date, 
                note = @note,
                task_name = ISNULL(@task_name, task_name),
                description = ISNULL(@description, description),
                recommended_frequency = ISNULL(@recommended_frequency, recommended_frequency),
                is_recurring = @is_recurring,
                recurring_months = @recurring_months,
                year = @year
                WHERE id = @id`);
        res.json({ message: 'Entry updated' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Delete a maintenance entry
router.delete('/entries/:id', async (req, res) => {
    const { id } = req.params;
    try {
        const pool = await sql.connect();
        await pool.request()
            .input('id', sql.Int, id)
            .query('DELETE FROM TS_MaintenanceEntry WHERE id = @id');
        res.json({ message: 'Entry deleted' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;
