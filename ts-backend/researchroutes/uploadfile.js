const express = require('express');
const router = express.Router();
const multer = require('multer');
const { BlobServiceClient } = require('@azure/storage-blob');
const getUserFromToken = require('../middleware/getUserFromToken');
const { File } = require('../mongo');
require('dotenv').config();

// Try to load sharp for image processing
let sharp = null;
try {
    sharp = require('sharp');
} catch (error) {
    console.warn('⚠️  Sharp module not available for documents:', error.message);
}
const convert = require('heic-convert');

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

        const { name, description, propertyId, folderId } = req.body;

        if (!name || !propertyId) {
            return res.status(400).json({ 
                success: false, 
                error: 'Nimi ja propertyId ovat pakollisia' 
            });
        }

        // Process image if HEIC/HEIF — convert to JPEG
        let processedBuffer = req.file.buffer;
        let processedMimetype = req.file.mimetype;
        let processedFilename = req.file.originalname;

        const isHeic = req.file.mimetype === 'image/heic' ||
            req.file.mimetype === 'image/heif' ||
            /\.(heic|heif)$/i.test(req.file.originalname);

        if (isHeic) {
            console.log(`Converting HEIC/HEIF to JPEG: ${req.file.originalname}`);
            const outputBuffer = await convert({
                buffer: req.file.buffer,
                format: 'JPEG',
                quality: 0.9
            });

            if (sharp) {
                processedBuffer = await sharp(outputBuffer)
                    .jpeg({ quality: 90 })
                    .toBuffer();
            } else {
                processedBuffer = Buffer.from(outputBuffer);
            }
            processedMimetype = 'image/jpeg';
            processedFilename = req.file.originalname.replace(/\.(heic|heif)$/i, '.jpg');
        }
        // Optimize other images if sharp available
        else if (sharp && req.file.mimetype.startsWith('image/')) {
            try {
                const metadata = await sharp(req.file.buffer).metadata();
                if (metadata.width > 3840 || metadata.height > 2160) {
                    console.log(`Resizing large image: ${metadata.width}x${metadata.height}`);
                    processedBuffer = await sharp(req.file.buffer)
                        .resize(3840, 2160, { fit: 'inside', withoutEnlargement: true })
                        .toBuffer();
                }
            } catch (sharpErr) {
                console.warn('Sharp processing skipped:', sharpErr.message);
            }
        }

        // Generate unique blob name
        const timestamp = Date.now();
        const fileExtension = processedFilename.split('.').pop();
        const sanitizedName = name.replace(/[^a-zA-Z0-9.-]/g, '_');
        const blobName = `${propertyId}/${timestamp}-${sanitizedName}.${fileExtension}`;

        // Upload to Azure
        const blockBlobClient = documentsContainerClient.getBlockBlobClient(blobName);
        await blockBlobClient.upload(processedBuffer, processedBuffer.length, {
            blobHTTPHeaders: {
                blobContentType: processedMimetype
            }
        });

        // Save to MongoDB
        const newFile = new File({
            name: name,
            description: description || '',
            url: blockBlobClient.url,
            propertyId: propertyId,
            folderId: folderId || null,
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
