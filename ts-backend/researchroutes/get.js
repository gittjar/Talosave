const express = require('express');
const router = express.Router();
const { File } = require('../mongo'); // adjust the path to your mongo.js file as needed
const path = require('path');
const fs = require('fs');

router.get('/files', async (req, res) => {
  try {
    const propertyId = req.query.propertyId;
    const files = await File.find({ propertyId: propertyId });
    res.send(files);
  } catch (err) {
    console.error(err);
    res.status(500).send('Error retrieving files from MongoDB');
  }
});

router.get('/files/:id', async (req, res) => {
  try {
    const file = await File.findById(req.params.id);
    if (!file) {
      return res.status(404).send('File not found');
    }

    // Update the path to use the uploads directory
    const filePath = path.join(__dirname, '../uploads', file.path);
    res.sendFile(filePath);
  } catch (err) {
    console.error(err);
    res.status(500).send('Error retrieving file');
  }
});

module.exports = router;