require('dotenv').config();
const mongoose = require('mongoose');

const db = mongoose.connection;

mongoose.connect(process.env.MONGODB_URI, { useNewUrlParser: true, useUnifiedTopology: true });


db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', function() {
  console.log('Connected to MongoDB!');
});

const fileSchema = new mongoose.Schema({
  name: String,
  propertyId: Number,
  url: String, // This will store the URL
});

const File = mongoose.model('File', fileSchema);

module.exports = {
  db,
  File
};