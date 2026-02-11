const express = require('express');
const router = express.Router();
const multer = require('multer');
const { BlobServiceClient } = require('@azure/storage-blob');
const getUserFromToken = require('../middleware/getUserFromToken');
const { File } = require('../mongo');
require('dotenv').config();

// Configure multer for memory storage
const upload = multer({
    storage: multer.memoryStorage(),
    limits: {
        fileSize: 10 * 1024 * 1024 // 10MB limit
    }
});

// Azure Storage configuration for documents
const AZURE_STORAGE_CONNECTION_STRING = process.env.AZURE_STORAGE_CONNECTION_STRING;
const DOCUMENTS_CONTAINER_NAME = 'property-documents';

let documentsContainerClient;

try {
    if (AZURE_STORAGE_CONNECTION_STRING) {
        const blobServiceClient = BlobServiceClient.fromConnectionString(AZURE_STORAGE_CONNECTION_STRING);
        documentsContainerClient = blobServiceClient.getContainerClient(DOCUMENTS_CONTAINER_NAME);
        
        // Create container if it doesn't exist
        documentsContainerClient.createIfNotExists({ access: 'blob' })
            .then(() => console.log(`Azure Blob Storage container '${DOCUMENTS_CONTAINER_NAME}' ready`))
            .catch(err => console.error('Documents container initialization error:', err.message));
    }
} catch (error) {
    console.error('Failed to initialize documents container:', error.message);
}

// POST endpoint for file upload
router.post('/upload-file', getUserFromToken, upload.single('file'), async (req, res) => {
    try {
        if (!documentsContainerClient) {
            return res.status(500).json({ 
                success: false, 
                error: 'Azure Blob Storage ei ole konfiguroitu' 
            });
        }

        if (!req.file) {
            return res.status(400).json({ 
                success: false, 
                error: 'Tiedostoa ei ole valittu' 
            });
        }

        const { name, description, propertyId } = req.body;

        if (!name || !propertyId) {
            return res.status(400).json({ 
                success: false, 
                error: 'Nimi ja propertyId ovat pakollisia' 
            });
        }

        // Generate unique blob name
        const timestamp = Date.now();
        const fileExtension = req.file.originalname.split('.').pop();
        const sanitizedName = name.replace(/[^a-zA-Z0-9.-]/g, '_');
        const blobName = `${propertyId}/${timestamp}-${sanitizedName}.${fileExtension}`;

        // Upload to Azure
        const blockBlobClient = documentsContainerClient.getBlockBlobClient(blobName);
        await blockBlobClient.upload(req.file.buffer, req.file.buffer.length, {
            blobHTTPHeaders: {
                blobContentType: req.file.mimetype
            }
        });

        // Save to MongoDB
        const newFile = new File({
            name: name,
            description: description || '',
            url: blockBlobClient.url,
            propertyId: propertyId,
            blobName: blobName, // Store blob name for deletion
            fileType: 'upload', // Distinguish from URL links
            uploadedAt: new Date()
        });

        await newFile.save();

        res.json({ 
            success: true, 
            file: newFile,
            message: 'Tiedosto ladattu onnistuneesti' 
        });

    } catch (error) {
        console.error('File upload error:', error);
        res.status(500).json({ 
            success: false, 
            error: 'Virhe tiedoston latauksessa',
            message: error.message 
        });
    }
});

module.exports = router;
