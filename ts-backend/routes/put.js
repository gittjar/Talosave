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

  router.put('/:id', verifyToken, async (req, res) => {
    const id = parseInt(req.params.id, 10);
    const userid = req.user.id; 
    const { 
      propertyname, 
      street_address, 
      post_number, 
      city, 
      land, 
      house_type, 
      building_year, 
      total_sqm, 
      living_sqm, 
      room_list, 
      floors, 
      dataconnection, 
      TV_system, 
      drain, 
      water, 
      electricity, 
      main_heat_system, 
      sauna, 
      pipes, 
      roof_type, 
      ground, 
      property_id, 
      rasite, 
      ranta, 
      latitude, 
      longitude 
    } = req.body;
  
    try {
      const sqlRequest = new sql.Request();
      const result = await sqlRequest
        .input('id', sql.Int, id)
        .input('userid', sql.Int, userid)
        .input('propertyname', sql.NVarChar, propertyname)
        .input('street_address', sql.NVarChar, street_address)
        .input('post_number', sql.NVarChar, post_number)
        .input('city', sql.NVarChar, city)
        .input('land', sql.NVarChar, land)
        .input('house_type', sql.NVarChar, house_type)
        .input('building_year', sql.Int, building_year)
        .input('total_sqm', sql.Float, total_sqm)
        .input('living_sqm', sql.Float, living_sqm)
        .input('room_list', sql.NVarChar, room_list)
        .input('floors', sql.Int, floors)
        .input('dataconnection', sql.NVarChar, dataconnection)
        .input('TV_system', sql.NVarChar, TV_system)
        .input('drain', sql.NVarChar, drain)
        .input('water', sql.NVarChar, water)
        .input('electricity', sql.NVarChar, electricity)
        .input('main_heat_system', sql.NVarChar, main_heat_system)
        .input('sauna', sql.NVarChar, sauna)
        .input('pipes', sql.Int, pipes)
        .input('roof_type', sql.NVarChar, roof_type)
        .input('ground', sql.NVarChar, ground)
        .input('property_id', sql.NVarChar, property_id)
        .input('rasite', sql.NVarChar, rasite)
        .input('ranta', sql.NVarChar, ranta)
        .input('latitude', sql.Float, latitude)
        .input('longitude', sql.Float, longitude)
        .query(`
          UPDATE TS_Properties 
          SET propertyname = @propertyname, 
              street_address = @street_address, 
              post_number = @post_number, 
              city = @city, 
              land = @land, 
              house_type = @house_type, 
              building_year = @building_year, 
              total_sqm = @total_sqm, 
              living_sqm = @living_sqm, 
              room_list = @room_list, 
              floors = @floors, 
              dataconnection = @dataconnection, 
              TV_system = @TV_system, 
              drain = @drain, 
              water = @water, 
              electricity = @electricity, 
              main_heat_system = @main_heat_system, 
              sauna = @sauna, 
              pipes = @pipes, 
              roof_type = @roof_type, 
              ground = @ground, 
              property_id = @property_id, 
              rasite = @rasite, 
              ranta = @ranta, 
              latitude = @latitude, 
              longitude = @longitude 
          WHERE propertyid = @id AND userid = @userid
        `);
  
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
