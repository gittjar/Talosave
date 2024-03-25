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

  router.post('/renovations', verifyToken, async (req, res) => {
    console.log('POST /api/renovations'); // Log that a request was received
    console.log('Request body:', req.body); // Log the request body
  
    const { propertyid, construction_company, renovation, date, cost } = req.body;
    const userid = req.user.id; // Get userid from the token

      // Add this code to format the date
  const dateObj = new Date(date);
  const formattedDate = date;
  console.log('Formatted date:', formattedDate); 

    try {
      const sqlQuery = `
      INSERT INTO TS_Renovations (propertyid, construction_company, renovation, date, cost, userid)
      OUTPUT INSERTED.id
      VALUES (@propertyid, @construction_company, @renovation, @date, @cost, @userid)
      `;
  
      const sqlRequest = new sql.Request(); // Create a new sql.Request instance
      await sqlRequest
        .input('propertyid', sql.Int, propertyid)
        .input('construction_company', sql.NVarChar, construction_company)
        .input('renovation', sql.NVarChar, renovation)
        .input('date', sql.DateTime, formattedDate) // Use the formatted date here        
        .input('cost', sql.Float, cost)
        .input('userid', sql.Int, userid)
        .query(sqlQuery);
      console.log('Insert successful'); // Log successful insert

          // After the first query has completed, perform another query
        const anotherSqlQuery = `SELECT * from TS_Renovations`; 
        const result = await sqlRequest.query(anotherSqlQuery);
        console.log('Second query result:', result);

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

// PUT endpoint for TS_RenovationDetails
router.put('/renovationdetails/:id', verifyToken, async (req, res) => {
  const { detail } = req.body;
  const userid = req.user.id; // Get userid from the token
  const id = req.params.id; // Get the id from the URL parameters

  try {
    const sqlQuery = `
    UPDATE TS_RenovationDetails
    SET detail = @detail, userid = @userid
    WHERE id = @id
    `;

    let sqlRequest = new sql.Request(); // Create a new sql.Request instance
    await sqlRequest
      .input('detail', sql.NVarChar, detail)
      .input('userid', sql.Int, userid)
      .input('id', sql.Int, id)
      .query(sqlQuery);

    console.log('PUT /api/renovationdetails/:id'); // Log that a request was received
    console.log('Request body:', req.body); // Log the request body
    console.log('ID:', id); // Log the id
    console.log('UserID:', userid); // Log the userid

    // Fetch the updated detail
    const updatedDetailQuery = `
    SELECT * FROM TS_RenovationDetails WHERE id = @id
    `;

    sqlRequest = new sql.Request(); // Create a new sql.Request instance for the SELECT query
    const updatedDetail = await sqlRequest
      .input('id', sql.Int, id)
      .query(updatedDetailQuery);

    res.status(200).json(updatedDetail.recordset[0]);
  } catch (err) {
    res.status(500).send(err.message);
  }
});

// DELETE endpoint for TS_RenovationDetails
router.delete('/renovationdetails/:id', verifyToken, async (req, res) => {
  const userid = req.user.id; // Get userid from the token
  const id = req.params.id; // Get the id from the URL parameters

  try {
    const sqlQuery = `
    DELETE FROM TS_RenovationDetails
    WHERE id = @id AND userid = @userid
    `;

    const sqlRequest = new sql.Request(); // Create a new sql.Request instance
    await sqlRequest
      .input('userid', sql.Int, userid)
      .input('id', sql.Int, id)
      .query(sqlQuery);

    res.status(200).send();
  } catch (err) {
    res.status(500).send(err.message);
  }
});



module.exports = router;

