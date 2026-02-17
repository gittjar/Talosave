require('dotenv').config();
const mongoose = require('mongoose');

const db = mongoose.connection;

// Add connection options for better stability
const options = {
  serverSelectionTimeoutMS: 5000,
  socketTimeoutMS: 45000,
};

// Handle MongoDB connection
if (process.env.MONGODB_URI) {
  mongoose.connect(process.env.MONGODB_URI, options)
    .then(() => console.log('✅ Connected to MongoDB!'))
    .catch(err => {
      console.error('❌ MongoDB connection error:', err.message);
      console.warn('⚠️  Server will continue without MongoDB (file uploads may not work)');
    });
} else {
  console.warn('⚠️  MONGODB_URI not configured. File uploads will not work.');
}

db.on('error', (err) => {
  console.error('MongoDB error:', err.message);
});

db.on('disconnected', () => {
  console.warn('⚠️  MongoDB disconnected');
});

const fileSchema = new mongoose.Schema({
  name: String,
  description: String, // Description of the document
  propertyId: Number,
  folderId: { type: mongoose.Schema.Types.ObjectId, ref: 'Folder', default: null },
  url: String, // This will store the URL (or Azure Blob URL)
  blobName: String, // Azure Blob name for deletion (optional, only for uploaded files)
  fileType: { type: String, default: 'link' }, // 'link' or 'upload'
  uploadedAt: { type: Date, default: Date.now }
});

const folderSchema = new mongoose.Schema({
  name: { type: String, required: true },
  propertyId: { type: Number, required: true },
  parentFolderId: { type: mongoose.Schema.Types.ObjectId, ref: 'Folder', default: null },
  createdAt: { type: Date, default: Date.now }
});

const File = mongoose.model('File', fileSchema);
const Folder = mongoose.model('Folder', folderSchema);

module.exports = {
  db,
  File,
  Folder
};