const express = require('express');
const router = express.Router();
const sql = require('mssql');

// Get all maintenance calendar entries for a property and user (optionally filter by year)
router.get('/', async (req, res) => {
    const { propertyid, userid, year } = req.query;
    if (!propertyid || !userid) {
        return res.status(400).json({ error: 'propertyid and userid are required' });
    }
    try {
        const pool = await sql.connect();
        let query = 'SELECT * FROM TS_MaintenanceCalendar WHERE propertyid = @propertyid AND userid = @userid';
        if (year) query += ' AND year = @year';
        const request = pool.request()
            .input('propertyid', sql.Int, propertyid)
            .input('userid', sql.Int, userid);
        if (year) request.input('year', sql.Int, year);
        const result = await request.query(query);
        res.json(result.recordset);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Add a new maintenance calendar entry (supports custom and fixed tasks)
router.post('/', async (req, res) => {
    const { propertyid, userid, task, season, year, checked, is_custom } = req.body;
    if (!propertyid || !userid || !task || !season || !year) {
        return res.status(400).json({ error: 'propertyid, userid, task, season, and year are required' });
    }
    try {
        const pool = await sql.connect();
        await pool.request()
            .input('propertyid', sql.Int, propertyid)
            .input('userid', sql.Int, userid)
            .input('task', sql.NVarChar(255), task)
            .input('season', sql.NVarChar(50), season)
            .input('year', sql.Int, year)
            .input('checked', sql.Bit, checked ? 1 : 0)
            .input('is_custom', sql.Bit, is_custom ? 1 : 0)
            .query('INSERT INTO TS_MaintenanceCalendar (propertyid, userid, task, season, year, checked, is_custom) VALUES (@propertyid, @userid, @task, @season, @year, @checked, @is_custom)');
        res.status(201).json({ message: 'Entry added' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Update a maintenance calendar entry (e.g. check/uncheck, edit task)
router.put('/:id', async (req, res) => {
    const { id } = req.params;
    const { checked, task } = req.body;
    if (checked === undefined && !task) {
        return res.status(400).json({ error: 'Nothing to update' });
    }
    try {
        const pool = await sql.connect();
        let query = 'UPDATE TS_MaintenanceCalendar SET ';
        const updates = [];
        if (checked !== undefined) updates.push('checked = @checked');
        if (task) updates.push('task = @task');
        query += updates.join(', ') + ', updated_at = GETDATE() WHERE id = @id';
        const request = pool.request().input('id', sql.Int, id);
        if (checked !== undefined) request.input('checked', sql.Bit, checked ? 1 : 0);
        if (task) request.input('task', sql.NVarChar(255), task);
        await request.query(query);
        res.json({ message: 'Entry updated' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Delete a maintenance calendar entry (custom row or fixed row for a year)
router.delete('/:id', async (req, res) => {
    const { id } = req.params;
    try {
        const pool = await sql.connect();
        await pool.request()
            .input('id', sql.Int, id)
            .query('DELETE FROM TS_MaintenanceCalendar WHERE id = @id');
        res.json({ message: 'Entry deleted' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;
