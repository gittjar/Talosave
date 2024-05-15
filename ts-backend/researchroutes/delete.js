const express = require('express');
const router = express.Router();
const { File } = require('../mongo'); // adjust the path to your mongo.js file as needed

// Delete a file by ID

router.delete('/files/:id', async (req, res) => {
  try {
    const file = await File.findById(req.params.id);
    if (!file) {
      return res.status(404).send('File not found');
    }

    // Delete the file from the database
    await File.findByIdAndDelete(req.params.id);

    res.send('Tiedostolinkki poistettu onnistuneesti');
    console.log('File deleted successfully');
  } catch (err) {
    console.error(err);
    res.status(500).send('Error deleting file from MongoDB');
  }
});

module.exports = router;