
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

// POST endpoint for creating a new todo
router.post('/todo', verifyToken, async (req, res) => {
    const { action, isCompleted, date, cost, propertyid, userid } = req.body;
    try {
      const sqlQuery = `
      INSERT INTO TS_Todo (action, isCompleted, date, cost, propertyid, userid)
      VALUES (@action, @isCompleted, @date, @cost, @propertyid, @userid)
      `;
  
      const sqlRequest = new sql.Request();
      await sqlRequest
        .input('action', sql.NVarChar, action)
        .input('isCompleted', sql.Bit, isCompleted)
        .input('date', sql.Date, date)
        .input('cost', sql.Decimal(10, 2), cost)
        .input('propertyid', sql.Int, propertyid)
        .input('userid', sql.Int, userid)
        .query(sqlQuery);
  
      res.status(201).send('Todo created successfully');
    } catch (err) {
      res.status(500).send(err.message);
    }
});
  
// GET endpoint for fetching a todo by propertyId
router.get('/todo/:propertyId', verifyToken, async (req, res) => {
    const propertyId = req.params.propertyId; // Changed from id to propertyId
    try {
      const sqlQuery = `
      SELECT * FROM TS_Todo WHERE propertyId = @propertyId
      `;
  
      const sqlRequest = new sql.Request(); // Create a new sql.Request instance
      const result = await sqlRequest
        .input('propertyId', sql.Int, propertyId)
        .query(sqlQuery);
  
      res.status(200).json(result.recordset);
    } catch (err) {
      res.status(500).send(err.message);
    }
  });
  
  // PUT endpoint for updating a todo by id
  router.put('/todo/:id', verifyToken, async (req, res) => {
    const id = req.params.id;
    const { action, isCompleted, date, cost, propertyid, userid } = req.body;
    try {
      const sqlQuery = `
      UPDATE TS_Todo
      SET action = @action, isCompleted = @isCompleted, date = @date, cost = @cost, propertyid = @propertyid, userid = @userid
      WHERE id = @id
      `;
  
      const sqlRequest = new sql.Request();
      await sqlRequest
        .input('action', sql.NVarChar, action)
        .input('isCompleted', sql.Bit, isCompleted)
        .input('date', sql.Date, date)
        .input('cost', sql.Decimal(10, 2), cost)
        .input('propertyid', sql.Int, propertyid)
        .input('userid', sql.Int, userid)
        .input('id', sql.Int, id)
        .query(sqlQuery);
  
      res.status(200).send('Todo updated successfully');
    } catch (err) {
      res.status(500).send(err.message);
    }
  });
  
  // DELETE endpoint for deleting a todo by id
  router.delete('/todo/:id', verifyToken, async (req, res) => {
    const id = req.params.id;
    try {
      const sqlQuery = `
      DELETE FROM TS_Todo WHERE id = @id
      `;
  
      const sqlRequest = new sql.Request();
      await sqlRequest
        .input('id', sql.Int, id)
        .query(sqlQuery);
  
      res.status(200).send('Todo deleted successfully');
    } catch (err) {
      res.status(500).send(err.message);
    }
  });

  module.exports = router;