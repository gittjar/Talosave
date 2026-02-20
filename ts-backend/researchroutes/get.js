const express = require('express');
const router = express.Router();
const { File } = require('../mongo');
const { BlobServiceClient, BlobSASPermissions, StorageSharedKeyCredential, generateBlobSASQueryParameters } = require('@azure/storage-blob');
const path = require('path');
const fs = require('fs');
const getUserFromToken = require('../middleware/getUserFromToken');
const { getUserStorageUsage, getAllStorageUsage } = require('../middleware/storageQuota');
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

// PUT update file name and description
router.put('/files/:id', async (req, res) => {
  try {
    const { name, description } = req.body;
    const file = await File.findById(req.params.id);
    if (!file) {
      return res.status(404).json({ error: 'Tiedostoa ei löydy' });
    }

    if (name !== undefined) file.name = name;
    if (description !== undefined) file.description = description;
    await file.save();

    res.json(file);
  } catch (err) {
    console.error('Error updating file:', err);
    res.status(500).json({ error: 'Tiedoston päivitys epäonnistui' });
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

// Get user's storage quota/usage
router.get('/storage-quota', getUserFromToken, async (req, res) => {
  try {
    const userId = req.user.id;
    const allUsage = await getAllStorageUsage(userId);
    
    // Convert to MB for easier display (return numbers, not strings)
    const response = {
      documents: {
        used: allUsage.documents.used,
        usedMB: allUsage.documents.used / (1024 * 1024),
        limit: allUsage.documents.limit,
        limitMB: allUsage.documents.limit / (1024 * 1024),
        available: allUsage.documents.available,
        availableMB: allUsage.documents.available / (1024 * 1024),
        percentUsed: (allUsage.documents.used / allUsage.documents.limit) * 100
      },
      propertyImages: {
        used: allUsage.propertyImages.used,
        usedMB: allUsage.propertyImages.used / (1024 * 1024),
        limit: allUsage.propertyImages.limit,
        limitMB: allUsage.propertyImages.limit / (1024 * 1024),
        available: allUsage.propertyImages.available,
        availableMB: allUsage.propertyImages.available / (1024 * 1024),
        percentUsed: (allUsage.propertyImages.used / allUsage.propertyImages.limit) * 100
      },
      renovationImages: {
        used: allUsage.renovationImages.used,
        usedMB: allUsage.renovationImages.used / (1024 * 1024),
        limit: allUsage.renovationImages.limit,
        limitMB: allUsage.renovationImages.limit / (1024 * 1024),
        available: allUsage.renovationImages.available,
        availableMB: allUsage.renovationImages.available / (1024 * 1024),
        percentUsed: (allUsage.renovationImages.used / allUsage.renovationImages.limit) * 100
      },
      total: {
        used: allUsage.total.used,
        usedMB: allUsage.total.used / (1024 * 1024),
        limit: allUsage.total.limit,
        limitMB: allUsage.total.limit / (1024 * 1024),
        available: allUsage.total.available,
        availableMB: allUsage.total.available / (1024 * 1024),
        percentUsed: (allUsage.total.used / allUsage.total.limit) * 100
      }
    };

    res.json(response);
  } catch (err) {
    console.error('Error getting storage quota:', err);
    // Return null/empty if quota not configured yet
    if (err.message && err.message.includes('Invalid column name')) {
      console.warn('⚠️  Storage quota not configured - column missing');
      return res.json(null);
    }
    res.status(500).json({ error: 'Virhe tallennustilan tietojen haussa' });
  }
});

module.exports = router;