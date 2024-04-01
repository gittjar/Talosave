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

  router.get('/:propertyid', verifyToken, async (req, res) => {
    const userid = req.user.id; // Get userid from the token
    const propertyid = req.params.propertyid; // Get propertyid from the URL
    try {
      const sqlRequest = new sql.Request();
      const result = await sqlRequest
        .input('userid', sql.Int, userid)
        .input('propertyid', sql.Int, propertyid)
        .query(`
          SELECT E.*, P.propertyname 
          FROM TS_ElectricityConsumption E
          INNER JOIN TS_Properties P ON E.propertyid = P.propertyid
          WHERE P.userid = @userid AND P.propertyid = @propertyid
        `);
      // console.log('Query result:', result); // Log the query result
      res.json(result.recordset);
    } catch (err) {
      console.error('Error executing query:', err); // Log the error
      res.status(500).send(err.message);
    }
  });

module.exports = router;