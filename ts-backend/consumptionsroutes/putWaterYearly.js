
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
      console.log('Token:', token); 
  
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

  router.put('/yearly', verifyToken, async (req, res) => {
    const userid = req.user.id; // Get userid from the token
    const propertyid = parseInt(req.body.propertyid, 10);
    const year = parseInt(req.body.year, 10);
    const m3 = parseFloat(req.body.m3);
    const euros = parseFloat(req.body.euros);

    console.log('Request body:', req.body); // Log the request body

    // Check if propertyid is a number
    if (isNaN(propertyid)) {
        return res.status(400).send('Invalid propertyid.');
    }

    try {
        let sqlRequest = new sql.Request();
        const checkYear = await sqlRequest
            .input('propertyid', sql.Int, propertyid)
            .input('year', sql.Int, year)
            .query(`
                SELECT year FROM TS_WaterConsumption WHERE propertyid = @propertyid AND year = @year
            `);
    
        if (checkYear.recordset.length === 0) {
            res.status(400).send('Year does not exist for this property.');
            console.error('Year does not exist for this property.');
            console.log('ERROR Year:', year);
        } else {
            sqlRequest = new sql.Request();
            await sqlRequest
                .input('propertyid', sql.Int, propertyid)
                .input('year', sql.Int, year)
                .input('m3', sql.Float, m3)
                .input('euros', sql.Float, euros)
                .query(`
                    UPDATE TS_WaterConsumption 
                    SET m3 = @m3, euros = @euros
                    WHERE propertyid = @propertyid AND year = @year
                `);
    
            // After updating the record, get the updated record
            sqlRequest = new sql.Request();
            const updatedRecord = await sqlRequest
                .input('propertyid', sql.Int, propertyid)
                .input('year', sql.Int, year)
                .query(`
                    SELECT * FROM TS_WaterConsumption WHERE propertyid = @propertyid AND year = @year
                `);
    
            // Send the updated record back to the client
            res.status(200).json(updatedRecord.recordset[0]);
            console.log('Yearly water data updated successfully. Property ID: ', propertyid, ' Year: ', year, ' m3: ', m3, ' Euros: ', euros);
        } 
    } catch (err) {
        console.error('Error executing query:', err);
        res.status(500).send(err.message);
    }
}
);


module.exports = router;