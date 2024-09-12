// postWater.js
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

router.post('/', verifyToken, async (req, res) => {
    const userid = req.user.id; // Get userid from the token
    const { propertyid, month, year, liters, euros } = req.body; // Get data from the request body

    try {
        const sqlRequest1 = new sql.Request();
        const checkResult = await sqlRequest1
            .input('propertyid', sql.Int, propertyid)
            .input('month', sql.Int, month)
            .input('year', sql.Int, year)
            .query(`
                SELECT * FROM TS_WaterConsumption 
                WHERE propertyid = @propertyid
                AND month = @month
                AND year = @year
            `);

        if (checkResult.recordset.length > 0) {
            return res.status(400).send('Data for this month and year has already been saved.');
        }

        const sqlRequest2 = new sql.Request();
        await sqlRequest2
            .input('propertyid', sql.Int, propertyid)
            .input('month', sql.Int, month)
            .input('year', sql.Int, year)
            .input('liters', sql.Float, liters)
            .input('euros', sql.Float, euros)
            .query(`
                INSERT INTO TS_WaterConsumption (propertyid, month, year, liters, euros)
                VALUES (@propertyid, @month, @year, @liters, @euros)
            `);

        res.sendStatus(201);
        console.log('Water data added successfully. Property ID: ', propertyid, ' Month: ', month, ' Year: ', year, ' Liters: ', liters, ' Euros: ', euros);
    } catch (err) {
        console.error('Error executing query:', err); // Log the error
        res.status(500).send(err.message);
    }
});



module.exports = router;