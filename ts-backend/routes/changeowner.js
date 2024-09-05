//changeowner.js
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
      // console.log('Token:', token); // Log the token
  
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


  const checkUserExists = async (newOwnerId) => {
    const sqlRequest = new sql.Request();
    const result = await sqlRequest
        .input('newOwnerId', sql.Int, newOwnerId)
        .query(`
            SELECT * FROM TS_PropertyUsers 
            WHERE userid = @newOwnerId
        `);
    return result.recordset.length > 0;
};

const UserPropertyAllReadyOwner = async (id, newOwnerId) => {
    const sqlRequest = new sql.Request();
    const result = await sqlRequest
        .input('id', sql.Int, id)
        .input('newOwnerId', sql.Int, newOwnerId)
        .query(`
            SELECT * FROM TS_Properties 
            WHERE propertyid = @id AND userid = @newOwnerId
        `);
    return result.recordset.length > 0;
}

router.put('/:id/owner', verifyToken, async (req, res) => {
    const id = parseInt(req.params.id, 10);
    const newOwnerId = req.body.newOwnerId;
  
    try {
        // Check if the user ID exists in the database
        const userExists = await checkUserExists(newOwnerId);

        if (!userExists) {
            return res.status(400).send('User ID not found');
        }

        // Check if the property is already owned by the new owner
        const propertyAllReadyOwner = await UserPropertyAllReadyOwner(id, newOwnerId);
        if (propertyAllReadyOwner) {
            return res.status(400).send('Property already owned by the new owner');
        }


        // Update the owner
        const sqlRequest = new sql.Request();
        const result = await sqlRequest
            .input('id', sql.Int, id)
            .input('newOwnerId', sql.Int, newOwnerId)
            .query(`
                UPDATE TS_Properties 
                SET userid = @newOwnerId
                WHERE propertyid = @id
            `);
  
        if (result.rowsAffected[0] > 0) {
            res.status(200).send('Owner updated!');
            console.log('Owner updated ID --> ' + 'ID: ', id + ' New owner ID: ', newOwnerId);
        } else {
            res.status(404).send('Property not found');
        }
    } catch (err) {
        console.error(err.message);
        console.error(err.stack);
        res.status(500).send(err.message);
    }
});

module.exports = router;