const express = require('express');
const router = express.Router();
const { File } = require('../mongo');
const { BlobServiceClient } = require('@azure/storage-blob');
require('dotenv').config();

// Azure Storage configuration
const AZURE_STORAGE_CONNECTION_STRING = process.env.AZURE_STORAGE_CONNECTION_STRING;
const DOCUMENTS_CONTAINER_NAME = 'property-documents';

let documentsContainerClient;
if (AZURE_STORAGE_CONNECTION_STRING) {
  const blobServiceClient = BlobServiceClient.fromConnectionString(AZURE_STORAGE_CONNECTION_STRING);
  documentsContainerClient = blobServiceClient.getContainerClient(DOCUMENTS_CONTAINER_NAME);
}

// Delete a file by ID
router.delete('/files/:id', async (req, res) => {
  try {
    const file = await File.findById(req.params.id);
    if (!file) {
      return res.status(404).send('File not found');
    }

    // If file was uploaded to Azure, delete from blob storage
    if (file.fileType === 'upload' && file.blobName && documentsContainerClient) {
      try {
        const blockBlobClient = documentsContainerClient.getBlockBlobClient(file.blobName);
        await blockBlobClient.delete();
        console.log('File deleted from Azure Blob Storage:', file.blobName);
      } catch (azureError) {
        console.error('Error deleting from Azure:', azureError.message);
        // Continue with MongoDB deletion even if Azure deletion fails
      }
    }

    // Delete the file from the database
    await File.findByIdAndDelete(req.params.id);

    res.send('Tiedosto poistettu onnistuneesti');
    console.log('File deleted successfully');
  } catch (err) {
    console.error(err);
    res.status(500).send('Error deleting file');
  }
});

module.exports = router;