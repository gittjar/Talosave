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

  router.get('/', verifyToken, async (req, res) => {
    const userid = req.user.id; // Get userid from the token
    try {
        const sqlRequest = new sql.Request();
        const result = await sqlRequest
            .input('userid', sql.Int, userid)
            .query('SELECT * FROM TS_Properties WHERE userid = @userid');
       // console.log('Query result:', result); // Log the query result
        res.json(result.recordset);
    } catch (err) {
        console.error('Error executing query:', err); // Log the error
        res.status(500).send(err.message);
    }
});

router.get('/:id', verifyToken, async (req, res) => {
    const id = parseInt(req.params.id, 10);
    const userid = req.user.id; // Get userid from the token
    // console.log('property id:' + id); // Log the id value
    try {
        const sqlRequest = new sql.Request();
        const result = await sqlRequest
            .input('id', sql.Int, id)
            .input('userid', sql.Int, userid)
            .query('SELECT * FROM TS_Properties WHERE propertyid = @id AND userid = @userid');
        if (result.recordset.length > 0) {
            res.json(result.recordset[0]);
        } else {
            res.status(404).send('Property not found');
        }
    } catch (err) {
        res.status(500).send(err.message);
    }
});


module.exports = router;