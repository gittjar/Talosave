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

  // POST endpoint for TS_Renovations
  router.post('/renovations', verifyToken, async (req, res) => {
    console.log('POST /api/renovations'); // Log that a request was received
    console.log('Request body:', req.body); // Log the request body

    const { propertyid, construction_company, renovation, date } = req.body;
    const userid = req.user.id; // Get userid from the token

    try {
      const sqlQuery = `
      INSERT INTO TS_Renovations (propertyid, construction_company, renovation, date, userid)
      OUTPUT INSERTED.id
      VALUES (@propertyid, @construction_company, @renovation, @date, @userid)
      `;
  
      const sqlRequest = new sql.Request(); // Create a new sql.Request instance
      await sqlRequest
        .input('propertyid', sql.Int, propertyid)
        .input('construction_company', sql.NVarChar, construction_company)
        .input('renovation', sql.NVarChar, renovation)
        .input('date', sql.Date, date)
        .input('userid', sql.Int, userid)
        .query(sqlQuery);
  
      console.log('Insert successful'); // Log successful insert
      res.status(201).send();
    } catch (err) {
      console.error('Error:', err.message); // Log any errors
      res.status(500).send(err.message);
    }
});
  
  // POST endpoint for TS_RenovationDetails
  router.post('/renovationdetails', verifyToken, async (req, res) => {
    const { renovationid, detail } = req.body;
    const userid = req.user.id; // Get userid from the token
    try {
      const sqlQuery = `
      INSERT INTO TS_RenovationDetails (renovationid, detail, userid)
      OUTPUT INSERTED.id
      VALUES (@renovationid, @detail, @userid)
      `;
  
      const sqlRequest = new sql.Request(); // Create a new sql.Request instance
      await sqlRequest
        .input('renovationid', sql.Int, renovationid)
        .input('detail', sql.NVarChar, detail)
        .input('userid', sql.Int, userid)
        .query(sqlQuery);
  
      res.status(201).send();
    } catch (err) {
      res.status(500).send(err.message);
    }
  });

module.exports = router;

