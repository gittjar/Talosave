const express = require('express');
const router = express.Router();
const sql = require('mssql');

router.put('/:serviceid', async (req, res) => {
    try {
        const { serviceid } = req.params;
        const {
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
            UPDATE TS_Services
            SET servicename = ${servicename},
                servicetype = ${servicetype},
                description = ${description},
                provider = ${provider},
                contactperson = ${contactperson},
                phone = ${phone},
                email = ${email},
                servicedate = ${servicedate},
                nextservicedate = ${nextservicedate},
                isrecurring = ${isrecurring},
                recurringinterval = ${recurringinterval},
                cost = ${cost},
                currency = ${currency},
                status = ${status},
                priority = ${priority},
                notes = ${notes},
                documenturl = ${documenturl},
                updatedat = GETDATE()
            WHERE serviceid = ${serviceid}
        `;

        res.json({ message: 'Service updated successfully' });
    } catch (error) {
        console.error('Error updating service:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

module.exports = router;
