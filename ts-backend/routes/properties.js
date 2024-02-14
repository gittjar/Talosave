const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
require('dotenv').config();


// This is a middleware that verifies the JWT
const verifyToken = (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (authHeader) {
    const token = authHeader.split(' ')[1];

    jwt.verify(token, process.env.SECRET, (err, user) => {
      if (err) {
        return res.sendStatus(403);
      }

      req.user = user;
      next();
    });
  } else {
    res.sendStatus(401);
  }
};


router.get('/', async (req, res) => {
    try {
        const result = await req.app.locals.sqlRequest.query('SELECT * FROM TS_Properties');
        res.json(result.recordset);
    } catch (err) {
        res.status(500).send(err.message);
    }
});

router.post('/', verifyToken, async (req, res) => {
    const { propertyname } = req.body;
    const userid = req.user.id; // Get userid from the token

    try {
      const sqlQuery = `
        INSERT INTO TS_Properties (propertyname, userid)
        VALUES (@propertyname, @userid)
      `;
  
      await req.app.locals.sqlRequest
        .input('propertyname', propertyname)
        .input('userid', userid)
        .query(sqlQuery);
  
      res.status(201).send();
    } catch (err) {
      res.status(500).send(err.message);
    }
});

module.exports = router;