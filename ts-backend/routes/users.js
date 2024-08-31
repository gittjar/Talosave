// users.js
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

    router.get('/:username', async (req, res) => {
        const { username } = req.params;
    
        // Connect to the database
        let pool = await sql.connect(config);
    
        // Fetch the user from the database
        let result = await pool.request()
            .input('username', sql.NVarChar, username)
            .query('SELECT * FROM TS_PropertyUsers WHERE username = @username');

            console.log('Result:', result); // Log the result of the database query

    
        if (result.recordset.length > 0) {
            const user = result.recordset[0];
            res.status(200).json({
                username: user.username,
                fullname: user.fullname,
                email: user.email,
                phone: user.phone,
                role: user.role
            });
        } else {
            res.status(404).send('User not found');
        }
    });

    router.put('/:username', getUserFromToken, async (req, res) => {
        const { username } = req.params;
        const { email, phone } = req.body;
      
        // Connect to the database
        let pool = await sql.connect(config);
      
        // Update the user in the database
        let result = await pool.request()
            .input('username', sql.NVarChar, username)
            .input('email', sql.NVarChar, email)
            .input('phone', sql.NVarChar, phone)
            .query('UPDATE TS_PropertyUsers SET email = @email, phone = @phone WHERE username = @username');
      
        if (result.rowsAffected[0] > 0) {
            res.status(200).send('User updated');
        } else {
            res.status(404).send('User not found');
        }
    });
    
    module.exports = router;