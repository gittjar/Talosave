const express = require('express');
const router = express.Router();
const sql = require('mssql');
const { poolPromise } = require('../mongo'); // adjust if needed

// Get all maintenance tasks
router.get('/tasks', async (req, res) => {
    try {
        const pool = await sql.connect();
        const result = await pool.request().query('SELECT * FROM TS_MaintenanceTasks');
        res.json(result.recordset);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Add a maintenance task
router.post('/tasks', async (req, res) => {
    const { name, description, recommended_frequency } = req.body;
    try {
        const pool = await sql.connect();
        await pool.request()
            .input('name', sql.NVarChar(100), name)
            .input('description', sql.NVarChar(255), description)
            .input('recommended_frequency', sql.NVarChar(50), recommended_frequency)
            .query('INSERT INTO TS_MaintenanceTasks (name, description, recommended_frequency) VALUES (@name, @description, @recommended_frequency)');
        res.status(201).json({ message: 'Task added' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Get all maintenance checks for a property/user
router.get('/checks', async (req, res) => {
    const { propertyid, user_id } = req.query;
    try {
        const pool = await sql.connect();
        const result = await pool.request()
            .input('propertyid', sql.Int, propertyid)
            .input('user_id', sql.Int, user_id)
            .query('SELECT * FROM TS_MaintenanceChecks WHERE propertyid = @propertyid AND user_id = @user_id');
        res.json(result.recordset);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Add a maintenance check
router.post('/checks', async (req, res) => {
    const { task_id, propertyid, user_id, check_date, year, period, note } = req.body;
    try {
        const pool = await sql.connect();
        await pool.request()
            .input('task_id', sql.Int, task_id)
            .input('propertyid', sql.Int, propertyid)
            .input('user_id', sql.Int, user_id)
            .input('check_date', sql.Date, check_date)
            .input('year', sql.Int, year)
            .input('period', sql.NVarChar(20), period)
            .input('note', sql.NVarChar(255), note)
            .query('INSERT INTO TS_MaintenanceChecks (task_id, propertyid, user_id, check_date, year, period, note) VALUES (@task_id, @propertyid, @user_id, @check_date, @year, @period, @note)');
        res.status(201).json({ message: 'Check added' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Delete a maintenance check
router.delete('/checks/:id', async (req, res) => {
    const { id } = req.params;
    try {
        const pool = await sql.connect();
        await pool.request()
            .input('id', sql.Int, id)
            .query('DELETE FROM TS_MaintenanceChecks WHERE id = @id');
        res.json({ message: 'Check deleted' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;
