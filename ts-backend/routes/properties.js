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

  router.get('/', verifyToken, async (req, res) => {
    const userid = req.user.id; // Get userid from the token
    try {
        const sqlRequest = new sql.Request();
        const result = await sqlRequest
            .input('userid', sql.Int, userid)
            .query('SELECT * FROM TS_Properties WHERE userid = @userid');
        console.log('Query result:', result); // Log the query result
        res.json(result.recordset);
    } catch (err) {
        console.error('Error executing query:', err); // Log the error
        res.status(500).send(err.message);
    }
});

router.get('/:id', verifyToken, async (req, res) => {
    const id = parseInt(req.params.id, 10);
    const userid = req.user.id; // Get userid from the token
    console.log('property id:' + id); // Log the id value
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


router.post('/', verifyToken, async (req, res) => {
    const { propertyname } = req.body;
    const userid = req.user.id; // Get userid from the token
    console.log('userid:',userid, 'propertyname:',propertyname);
    try {
      const sqlQuery = `
      INSERT INTO TS_Properties (propertyname, userid)
      OUTPUT INSERTED.propertyid
      VALUES (@propertyname, @userid)
      `;

      const sqlRequest = req.app.locals.sqlRequest;
      await sqlRequest
        .input('propertyname', sql.NVarChar, propertyname) // Specify the type of the propertyname parameter
        .input('userid', sql.Int, userid)
        .query(sqlQuery);
  
      res.status(201).send();
    } catch (err) {
      res.status(500).send(err.message);
    }
});

router.delete('/:id', verifyToken, async (req, res) => {
    const id = parseInt(req.params.id, 10);
    const userid = req.user.id; // Get userid from the token
    console.log('delete property id:' + id); // Log the id value
    try {
        const sqlRequest = new sql.Request();
        const result = await sqlRequest
            .input('id', sql.Int, id)
            .input('userid', sql.Int, userid)
            .query('DELETE FROM TS_Properties WHERE propertyid = @id AND userid = @userid');
        if (result.rowsAffected[0] > 0) {
            res.status(200).send('Property deleted');
        } else {
            res.status(404).send('Property not found');
        }
    } catch (err) {
        res.status(500).send(err.message);
    }
});

router.put('/:id', verifyToken, async (req, res) => {
    const id = parseInt(req.params.id, 10);
    const userid = req.user.id; 
    const { propertyname } = req.body;
  
    try {
      const sqlRequest = new sql.Request();
      const result = await sqlRequest
        .input('id', sql.Int, id)
        .input('userid', sql.Int, userid)
        .input('propertyname', sql.NVarChar, propertyname)
        .query('UPDATE TS_Properties SET propertyname = @propertyname WHERE propertyid = @id AND userid = @userid');
  
      if (result.rowsAffected[0] > 0) {
        res.status(200).send('Property updated');
      } else {
        res.status(404).send('Property not found');
      }
    } catch (err) {
      res.status(500).send(err.message);
    }
  });

module.exports = router;