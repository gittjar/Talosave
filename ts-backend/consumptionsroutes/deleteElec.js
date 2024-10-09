// deleteElec.js
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

router.delete('/:id', verifyToken, async (req, res) => {
    const userid = req.user.id; // Get userid from the token
    const id = req.params.id; // Get id from the URL parameters
  
    try {
      const sqlRequest = new sql.Request();
      await sqlRequest
        .input('id', sql.Int, id)
        .query(`
          DELETE FROM TS_ElectricityConsumption 
          WHERE id = @id
        `);

        res.sendStatus(200);
        console.log('Electricity data deleted successfully.');
        console.log(`Deleting data with id: ${id}`);
    } catch (err) {
        console.error('Error executing query:', err); // Log the error
        res.status(500).send(err.message);
    }
});

module.exports = router;