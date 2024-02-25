// Initilize the express router
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
      console.log('Token:', token); // Log the token
  
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
    const { propertyname } = req.body;
    const userid = req.user.id; // Get userid from the token
    //console.log('userid:',userid, 'propertyname:',propertyname);
    try {
      const sqlQuery = `
      INSERT INTO TS_Properties (propertyname, userid)
      OUTPUT INSERTED.propertyid
      VALUES (@propertyname, @userid)
      `;

      const sqlRequest = new sql.Request(); // Create a new sql.Request instance
      await sqlRequest
        .input('propertyname', sql.NVarChar, propertyname) // Specify the type of the propertyname parameter
        .input('userid', sql.Int, userid)
        .query(sqlQuery);
  
      res.status(201).send();
    } catch (err) {
      res.status(500).send(err.message);
    }
});

module.exports = router;
