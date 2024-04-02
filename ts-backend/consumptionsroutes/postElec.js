
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
    const { propertyid, month, year, kwh, euros } = req.body; // Get data from the request body
  
    try {
      const sqlRequest = new sql.Request();
      await sqlRequest
        .input('userid', sql.Int, userid)
        .input('propertyid', sql.Int, propertyid)
        .input('month', sql.Int, month)
        .input('year', sql.Int, year)
        .input('kwh', sql.Float, kwh)
        .input('euros', sql.Float, euros)
        .query(`
          INSERT INTO TS_ElectricityConsumption (propertyid, month, year, kwh, euros)
          VALUES (@propertyid, @month, @year, @kwh, @euros)
        `);
  
      res.status(201).send('Electricity data added successfully');
    } catch (err) {
      console.error('Error executing query:', err); // Log the error
      res.status(500).send(err.message);
    }
  });

  module.exports = router;