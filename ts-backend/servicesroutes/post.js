const express = require('express');
const router = express.Router();
const sql = require('mssql');

router.post('/', async (req, res) => {
    try {
        const {
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
            documenturl
        } = req.body;

        await sql.query`
            INSERT INTO TS_Services (
                propertyid, userid, servicename, servicetype, description,
                provider, contactperson, phone, email, servicedate,
                nextservicedate, isrecurring, recurringinterval, cost, currency,
                status, priority, notes, documenturl
            )
            VALUES (
                ${propertyid}, ${userid}, ${servicename}, ${servicetype}, ${description},
                ${provider}, ${contactperson}, ${phone}, ${email}, ${servicedate},
                ${nextservicedate}, ${isrecurring || 0}, ${recurringinterval}, ${cost}, ${currency || 'EUR'},
                ${status || 'Suunniteltu'}, ${priority}, ${notes}, ${documenturl}
            )
        `;

        res.status(201).json({ message: 'Service added successfully' });
    } catch (error) {
        console.error('Error adding service:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

module.exports = router;
