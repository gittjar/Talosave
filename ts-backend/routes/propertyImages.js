const express = require('express');
const router = express.Router();
const sql = require('mssql');
const multer = require('multer');

// Try to load sharp, but don't crash if it fails
let sharp = null;
try {
    sharp = require('sharp');
} catch (error) {
    console.warn('⚠️  Sharp module not available for property images:', error.message);
}

const convert = require('heic-convert');
const { uploadToAzure, deleteFromAzure, extractBlobName, isAzureConfigured } = require('../azureStorage');

const PROPERTY_IMAGES_CONTAINER = 'property-images';

// Configure multer for memory storage
const upload = multer({
    storage: multer.memoryStorage(),
    limits: {
        fileSize: 10 * 1024 * 1024, // 10MB limit
    },
    fileFilter: (req, file, cb) => {
        const allowedMimes = [
            'image/jpeg', 'image/jpg', 'image/png', 'image/gif',
            'image/webp', 'image/heic', 'image/heif'
        ];
        const allowedExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.webp', '.heic', '.heif'];
        const fileExtension = file.originalname.toLowerCase().substring(file.originalname.lastIndexOf('.'));

        if (file.mimetype.startsWith('image/') || allowedMimes.includes(file.mimetype) || allowedExtensions.includes(fileExtension)) {
            cb(null, true);
        } else {
            cb(new Error('Vain kuvatiedostot sallittu (JPEG, PNG, GIF, WEBP, HEIC)'));
        }
    }
});

// GET - Hae kohteen kuvat
router.get('/:propertyId/images', async (req, res) => {
    try {
        const sqlRequest = new sql.Request();
        const result = await sqlRequest
            .input('propertyId', sql.Int, req.params.propertyId)
            .query('SELECT * FROM TS_PropertyImages WHERE property_id = @propertyId ORDER BY sort_order ASC, upload_date DESC');

        res.json(result.recordset);
    } catch (err) {
        console.error('Error fetching property images:', err);
        res.status(500).json({ error: 'Kuvien haku epäonnistui' });
    }
});

// POST - Lisää kuvia kohteeseen (tukee useaa tiedostoa kerralla)
router.post('/:propertyId/images', upload.array('images', 20), async (req, res) => {
    try {
        const propertyId = req.params.propertyId;

        if (!req.files || req.files.length === 0) {
            return res.status(400).json({
                error: 'Lähetä vähintään yksi kuvatiedosto'
            });
        }

        if (!isAzureConfigured()) {
            return res.status(503).json({
                error: 'Azure Blob Storage ei ole konfiguroitu.'
            });
        }

        const description = req.body.description || null;
        const uploadedImages = [];
        const errors = [];

        for (let i = 0; i < req.files.length; i++) {
            const file = req.files[i];
            try {
                let processedBuffer = file.buffer;
                let processedMimetype = file.mimetype;
                let processedFilename = file.originalname;

                // Check if file is HEIC/HEIF
                const isHeic = file.mimetype === 'image/heic' ||
                    file.mimetype === 'image/heif' ||
                    /\.(heic|heif)$/i.test(file.originalname);

                // Convert HEIC/HEIF to JPEG
                if (isHeic) {
                    console.log(`Converting HEIC/HEIF to JPEG: ${file.originalname}`);
                    const outputBuffer = await convert({
                        buffer: file.buffer,
                        format: 'JPEG',
                        quality: 0.9
                    });

                    if (sharp) {
                        processedBuffer = await sharp(outputBuffer)
                            .jpeg({ quality: 90 })
                            .toBuffer();
                    } else {
                        processedBuffer = outputBuffer;
                    }
                    processedMimetype = 'image/jpeg';
                    processedFilename = file.originalname.replace(/\.(heic|heif)$/i, '.jpg');
                }
                // Optimize other images if sharp available
                else if (sharp && file.mimetype.startsWith('image/')) {
                    const metadata = await sharp(file.buffer).metadata();

                    if (metadata.width > 3840 || metadata.height > 2160) {
                        console.log(`Resizing large image: ${metadata.width}x${metadata.height}`);
                        processedBuffer = await sharp(file.buffer)
                            .resize(3840, 2160, { fit: 'inside', withoutEnlargement: true })
                            .jpeg({ quality: 85 })
                            .toBuffer();
                        processedMimetype = 'image/jpeg';
                        processedFilename = processedFilename.replace(/\.[^.]+$/, '.jpg');
                    }
                }

                // Upload to Azure Blob Storage
                const uploadResult = await uploadToAzure(
                    processedBuffer,
                    processedFilename,
                    processedMimetype,
                    PROPERTY_IMAGES_CONTAINER
                );

                // Save to database
                const sqlRequest = new sql.Request();
                const result = await sqlRequest
                    .input('propertyId', sql.Int, propertyId)
                    .input('imageUrl', sql.NVarChar(500), uploadResult.url)
                    .input('imageName', sql.NVarChar(255), processedFilename)
                    .input('description', sql.NVarChar(500), description)
                    .input('fileSize', sql.Int, processedBuffer.length)
                    .input('sortOrder', sql.Int, i)
                    .query(`
                        INSERT INTO TS_PropertyImages (property_id, image_url, image_name, description, file_size, sort_order)
                        OUTPUT INSERTED.*
                        VALUES (@propertyId, @imageUrl, @imageName, @description, @fileSize,
                            ISNULL((SELECT MAX(sort_order) FROM TS_PropertyImages WHERE property_id = @propertyId), -1) + 1)
                    `);

                uploadedImages.push(result.recordset[0]);
            } catch (uploadErr) {
                console.error(`Error uploading ${file.originalname}:`, uploadErr);
                errors.push({ file: file.originalname, error: uploadErr.message });
            }
        }

        if (uploadedImages.length === 0) {
            return res.status(500).json({
                error: 'Yhdenkään kuvan lataus ei onnistunut',
                details: errors
            });
        }

        res.status(201).json({
            uploaded: uploadedImages,
            count: uploadedImages.length,
            errors: errors.length > 0 ? errors : undefined
        });
    } catch (err) {
        console.error('Error adding property images:', err);
        res.status(500).json({ error: 'Kuvien lisäys epäonnistui' });
    }
});

// PUT - Päivitä kuvien järjestys (MUST be before /images/:imageId to avoid route conflict)
router.put('/:propertyId/images/reorder', async (req, res) => {
    try {
        const { imageIds } = req.body; // array of image ids in new order
        if (!Array.isArray(imageIds) || imageIds.length === 0) {
            return res.status(400).json({ error: 'imageIds array required' });
        }

        const transaction = new sql.Transaction();
        await transaction.begin();
        try {
            for (let i = 0; i < imageIds.length; i++) {
                const request = new sql.Request(transaction);
                await request
                    .input('id', sql.Int, imageIds[i])
                    .input('sortOrder', sql.Int, i)
                    .input('propertyId', sql.Int, req.params.propertyId)
                    .query('UPDATE TS_PropertyImages SET sort_order = @sortOrder WHERE id = @id AND property_id = @propertyId');
            }
            await transaction.commit();
            res.json({ message: 'Järjestys päivitetty' });
        } catch (txErr) {
            await transaction.rollback();
            throw txErr;
        }
    } catch (err) {
        console.error('Error reordering property images:', err);
        res.status(500).json({ error: 'Järjestyksen päivitys epäonnistui' });
    }
});

// PUT - Päivitä kuvan tiedot
router.put('/images/:imageId', async (req, res) => {
    try {
        const { image_name, description } = req.body;
        const imageId = req.params.imageId;

        const sqlRequest = new sql.Request();
        await sqlRequest
            .input('imageId', sql.Int, imageId)
            .input('imageName', sql.NVarChar(255), image_name)
            .input('description', sql.NVarChar(500), description)
            .query('UPDATE TS_PropertyImages SET image_name = @imageName, description = @description WHERE id = @imageId');

        res.json({ message: 'Kuvan tiedot päivitetty' });
    } catch (err) {
        console.error('Error updating property image:', err);
        res.status(500).json({ error: 'Kuvan päivitys epäonnistui' });
    }
});

// DELETE - Poista kuva
router.delete('/images/:imageId', async (req, res) => {
    try {
        const sqlRequest = new sql.Request();
        const imageResult = await sqlRequest
            .input('imageId', sql.Int, req.params.imageId)
            .query('SELECT image_url FROM TS_PropertyImages WHERE id = @imageId');

        if (imageResult.recordset.length === 0) {
            return res.status(404).json({ error: 'Kuvaa ei löytynyt' });
        }

        const imageUrl = imageResult.recordset[0].image_url;

        // Delete from database
        const deleteRequest = new sql.Request();
        await deleteRequest
            .input('imageId', sql.Int, req.params.imageId)
            .query('DELETE FROM TS_PropertyImages WHERE id = @imageId');

        // Try to delete from Azure Blob Storage
        if (isAzureConfigured() && imageUrl.includes('.blob.core.windows.net')) {
            try {
                const blobName = extractBlobName(imageUrl);
                if (blobName) {
                    await deleteFromAzure(blobName, PROPERTY_IMAGES_CONTAINER);
                    console.log(`Deleted property image blob: ${blobName}`);
                }
            } catch (blobErr) {
                console.warn('Failed to delete blob from Azure:', blobErr.message);
            }
        }

        res.json({ message: 'Kuva poistettu onnistuneesti' });
    } catch (err) {
        console.error('Error deleting property image:', err);
        res.status(500).json({ error: 'Kuvan poisto epäonnistui' });
    }
});

module.exports = router;
