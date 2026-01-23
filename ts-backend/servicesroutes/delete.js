const express = require('express');
const router = express.Router();
const sql = require('mssql');

router.delete('/:serviceid', async (req, res) => {
    try {
        const { serviceid } = req.params;

        await sql.query`DELETE FROM TS_Services WHERE serviceid = ${serviceid}`;

        res.json({ message: 'Service deleted successfully' });
    } catch (error) {
        console.error('Error deleting service:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

module.exports = router;
