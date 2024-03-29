const express = require('express');
const router = express.Router();
const sql = require('mssql');
const sha256 = require('crypto-js/sha256');
const hmacSHA512 = require('crypto-js/hmac-sha512');
const Base64 = require('crypto-js/enc-base64');
const getUserFromToken = require('../middleware/getUserFromToken');
require('dotenv').config();

const config = {
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    server: process.env.DB_SERVER,
    database: process.env.DB_NAME,
    options: {
        encrypt: true
    }
    };

    router.post('/', async (req, res) => {
        const { username, fullname, password, email, phone, role } = req.body;
      
        // Hash the password
        const hashDigest = sha256(password);
        const hashedPassword = Base64.stringify(hmacSHA512(password + hashDigest, password));
      
        // Connect to the database
        let pool = await sql.connect(config);
      
        // Check if the user already exists
        let userExists = await pool.request()
            .input('username', sql.NVarChar, username)
            .query('SELECT * FROM TS_PropertyUsers WHERE username = @username');
    
        if (userExists.recordset.length > 0) {
            res.status(400).send('User already exists');
        } else {
            // Insert the new user into the database
            let result = await pool.request()
                .input('username', sql.NVarChar, username)
                .input('fullname', sql.NVarChar, fullname)
                .input('password', sql.NVarChar, hashedPassword)
                .input('email', sql.NVarChar, email)
                .input('phone', sql.NVarChar, phone)
                .input('role', sql.NVarChar, role)
                .query('INSERT INTO TS_PropertyUsers (username, fullname, password, email, phone, role) VALUES (@username, @fullname, @password, @email, @phone, @role)');
    
            if (result.rowsAffected[0] > 0) {
                res.status(201).send('User added');
                console.log('User added: ' + username + ' * ' + fullname + ' * ' + email + ' * ' + phone + ' * ' + role);
            } else {
                res.status(500).send('Error executing query');
            }
        }
    });
    
    module.exports = router;