const express = require('express');
const router = express.Router();


router.get('/', async (req, res) => {
    try {
        const result = await req.app.locals.sqlRequest.query('SELECT * FROM TS_Properties');
        res.json(result.recordset);
    } catch (err) {
        res.status(500).send(err.message);
    }
});

module.exports = router;