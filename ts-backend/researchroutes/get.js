const express = require('express');
const router = express.Router();
const { File } = require('../mongo'); // adjust the path to your mongo.js file as needed

router.get('/files', async (req, res) => {
  try {
    const files = await File.find({});
    res.send(files);
  } catch (err) {
    console.error(err);
    res.status(500).send('Error retrieving files from MongoDB');
  }
});

module.exports = router;