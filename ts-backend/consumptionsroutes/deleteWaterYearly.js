// deleteWaterYearly.js
const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
require('dotenv').config();
const sql = require('mssql');

// This is a middleware that verifies the JWT
const verifyToken = (req, res, next) => {
    const authHeader = req.headers.authorization;
  
    if (authHeader) {
      const token = authHeader.split(' ')[1];
  
      jwt.verify(token, process.env.SECRET, (err, user) => {
        if (err) {
          console.error('Token verification error:', err);
          return res.sendStatus(403);
        }
  
        req.user = user;
        next();
      });
    } else {
      res.sendStatus(401);
    }
};

router.delete('/yearly', verifyToken, async (req, res) => {
    const userid = req.user.id; // Get userid from the token
    const { propertyid, year } = req.body; // Get data from the request body

    try {
        const sqlRequest = new sql.Request();
        await sqlRequest
            .input('propertyid', sql.Int, propertyid)
            .input('year', sql.Int, year)
            .query(`
                DELETE FROM TS_WaterConsumption WHERE propertyid = @propertyid AND year = @year
            `);

        res.sendStatus(200);
        console.log('Yearly water data deleted successfully. Property ID: ', propertyid, ' Year: ', year);
    } catch (err) {
        console.error('Error executing query:', err);
        res.status(500).send(err.message);
    }
});

module.exports = router;