const express = require('express');
const router = express.Router();
const { File } = require('../mongo');
const { BlobServiceClient, BlobSASPermissions, StorageSharedKeyCredential, generateBlobSASQueryParameters } = require('@azure/storage-blob');
const path = require('path');
const fs = require('fs');
require('dotenv').config();

// Azure SAS URL generation setup
const AZURE_STORAGE_CONNECTION_STRING = process.env.AZURE_STORAGE_CONNECTION_STRING;
const DOCUMENTS_CONTAINER_NAME = 'property-documents';

let sharedKeyCredential;
let accountName;

if (AZURE_STORAGE_CONNECTION_STRING) {
  try {
    // Parse connection string for account name and key
    const parts = {};
    AZURE_STORAGE_CONNECTION_STRING.split(';').forEach(part => {
      const [key, ...valueParts] = part.split('=');
      if (key && valueParts.length) parts[key] = valueParts.join('=');
    });
    accountName = parts['AccountName'];
    const accountKey = parts['AccountKey'];
    if (accountName && accountKey) {
      sharedKeyCredential = new StorageSharedKeyCredential(accountName, accountKey);
    }
  } catch (err) {
    console.error('Error parsing Azure connection string for SAS:', err.message);
  }
}

/**
 * Generate a SAS URL for an Azure blob (valid for 4 hours)
 */
function generateSasUrl(blobName) {
  if (!sharedKeyCredential || !accountName) return null;

  const sasOptions = {
    containerName: DOCUMENTS_CONTAINER_NAME,
    blobName: blobName,
    permissions: BlobSASPermissions.parse('r'), // read only
    startsOn: new Date(Date.now() - 5 * 60 * 1000), // 5 min ago (clock skew)
    expiresOn: new Date(Date.now() + 4 * 60 * 60 * 1000), // 4 hours
  };

  const sasToken = generateBlobSASQueryParameters(sasOptions, sharedKeyCredential).toString();
  return `https://${accountName}.blob.core.windows.net/${DOCUMENTS_CONTAINER_NAME}/${blobName}?${sasToken}`;
}

router.get('/files', async (req, res) => {
  try {
    const { propertyId, folderId } = req.query;
    const filter = { propertyId: propertyId };

    // Filter by folder
    if (folderId && folderId !== 'null' && folderId !== 'root') {
      filter.folderId = folderId;
    } else if (folderId === 'root' || folderId === 'null') {
      filter.folderId = null;
    }
    // If no folderId param at all, return all files for the property (backwards compatible)

    const files = await File.find(filter).sort({ sortOrder: 1, uploadedAt: -1 });

    // Generate SAS URLs for uploaded files (type 'upload' with blobName)
    const filesWithSas = files.map(f => {
      const fileObj = f.toObject();
      if (fileObj.fileType === 'upload' && fileObj.blobName) {
        const sasUrl = generateSasUrl(fileObj.blobName);
        if (sasUrl) {
          fileObj.url = sasUrl;
        }
      }
      return fileObj;
    });

    res.send(filesWithSas);
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