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
          console.error('Token verification error:', err);
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
    const userid = req.user.id;
    const propertyid = req.params.propertyid;
    try {
      const sqlRequest = new sql.Request();
      const result = await sqlRequest
        .input('userid', sql.Int, userid)
        .input('propertyid', sql.Int, propertyid)
        .query(`
        SELECT W.*, P.propertyname 
            FROM TS_WaterConsumption W
            INNER JOIN TS_Properties P ON W.propertyid = P.propertyid
            WHERE P.userid = @userid AND P.propertyid = @propertyid
        `);
        res.json(result.recordset);
    } catch (err) {
        console.error('Error executing query:', err);
        res.status(500).send(err.message);
    }
});

module.exports = router;