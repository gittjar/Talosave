const express = require('express');
const router = express.Router();
const sql = require('mssql');

router.get('/:propertyid', async (req, res) => {
    try {
        const { propertyid } = req.params;
        
        const result = await sql.query`
            SELECT 
                serviceid,
                propertyid,
                userid,
                servicename,
                servicetype,
                description,
                provider,
                contactperson,
                phone,
                email,
                servicedate,
                nextservicedate,
                isrecurring,
                recurringinterval,
                cost,
                currency,
                status,
                priority,
                notes,
                documenturl,
                createdat,
                updatedat
            FROM TS_Services 
            WHERE propertyid = ${propertyid}
            ORDER BY servicedate DESC
        `;
        
        res.json(result.recordset);
    } catch (error) {
        console.error('Error fetching services:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

module.exports = router;
