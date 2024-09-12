
// postWaterYearly.js
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
      // console.log('Token:', token); 
  
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

  router.post('/yearly', verifyToken, async (req, res) => {
    const userid = req.user.id; // Get userid from the token
    const { propertyid, year, m3, euros } = req.body; // Get data from the request body

    try {
        const sqlRequest = new sql.Request();
        await sqlRequest
            .input('propertyid', sql.Int, propertyid)
            .input('year', sql.Int, year)
            .input('m3', sql.Float, m3)
            .input('euros', sql.Float, euros)
            .query(`
                INSERT INTO TS_WaterConsumption (propertyid, year, m3, euros)
                VALUES (@propertyid, @year, @m3, @euros)
            `);

        res.sendStatus(201);
        console.log('Yearly water data added successfully. Property ID: ', propertyid, ' Year: ', year, ' m3: ', m3, ' Euros: ', euros);
    } catch (err) {
        console.error('Error executing query:', err); // Log the error
        res.status(500).send(err.message);
    }
});
 

module.exports = router;