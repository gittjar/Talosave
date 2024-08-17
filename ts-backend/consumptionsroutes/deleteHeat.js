// deleteHeat.js
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
          console.error('Token verification error:', err); // Log the error
          return res.sendStatus(403);
        }
  
        req.user = user;
        next();
      });
    } else {
      res.sendStatus(401);
    }
};

router.delete('/', verifyToken, async (req, res) => {
    const userid = req.user.id; // Get userid from the token
    const { propertyid, month, year } = req.body; // Get data from the request body
  
    try {
      const sqlRequest = new sql.Request();
      await sqlRequest
        .input('propertyid', sql.Int, propertyid)
        .input('month', sql.Int, month)
        .input('year', sql.Int, year)
        .query(`
          DELETE FROM TS_HeatingConsumption 
          WHERE propertyid = @propertyid
            AND month = @month
            AND year = @year
        `);

        res.sendStatus(200);
        console.log('Heating data deleted successfully.');
        console.log(`Deleting data for property: ${propertyid}, month: ${month}, year: ${year}`);
    } catch (err) {
        console.error('Error executing query:', err); // Log the error
        res.status(500).send(err.message);
    }
});

module.exports = router;