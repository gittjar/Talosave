
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

// GET endpoint for TS_Renovations
router.get('/renovations', verifyToken, async (req, res) => {
    const userid = req.user.id; // Get userid from the token
    try {
      const sqlQuery = `
      SELECT * FROM TS_Renovations WHERE userid = @userid
      `;
  
      const sqlRequest = new sql.Request(); // Create a new sql.Request instance
      const result = await sqlRequest
        .input('userid', sql.Int, userid)
        .query(sqlQuery);
  
      res.status(200).json(result.recordset);
    } catch (err) {
      res.status(500).send(err.message);
    }
  });
  
  // GET endpoint for TS_RenovationDetails
  router.get('/renovationdetails', verifyToken, async (req, res) => {
    const userid = req.user.id; // Get userid from the token
    try {
      const sqlQuery = `
      SELECT * FROM TS_RenovationDetails WHERE userid = @userid
      `;
  
      const sqlRequest = new sql.Request(); // Create a new sql.Request instance
      const result = await sqlRequest
        .input('userid', sql.Int, userid)
        .query(sqlQuery);
  
      res.status(200).json(result.recordset);
    } catch (err) {
      res.status(500).send(err.message);
    }
  });

  module.exports = router;