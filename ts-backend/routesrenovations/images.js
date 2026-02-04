const express = require('express');
const router = express.Router();
const sql = require('mssql');
const multer = require('multer');
const sharp = require('sharp');
const convert = require('heic-convert');
const { uploadToAzure, deleteFromAzure, extractBlobName, isAzureConfigured } = require('../azureStorage');

// Configure multer for memory storage
const upload = multer({
    storage: multer.memoryStorage(),
    limits: {
        fileSize: 10 * 1024 * 1024, // 10MB limit
    },
    fileFilter: (req, file, cb) => {
        // Accept images including HEIC/HEIF from iOS
        const allowedMimes = [
            'image/jpeg', 'image/jpg', 'image/png', 'image/gif', 
            'image/webp', 'image/heic', 'image/heif'
        ];
        
        // Also check file extension for HEIC/HEIF (some browsers don't send correct mimetype)
        const allowedExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.webp', '.heic', '.heif'];
        const fileExtension = file.originalname.toLowerCase().substring(file.originalname.lastIndexOf('.'));
        
        if (file.mimetype.startsWith('image/') || allowedMimes.includes(file.mimetype) || allowedExtensions.includes(fileExtension)) {
            cb(null, true);
        } else {
            cb(new Error('Vain kuvatiedostot sallittu (JPEG, PNG, GIF, WEBP, HEIC)'));
        }
    }
});

// GET - Hae remontin kuvat
router.get('/:renovationId/images', async (req, res) => {
    try {
        const sqlRequest = new sql.Request();
        const result = await sqlRequest
            .input('renovationId', sql.Int, req.params.renovationId)
            .query('SELECT * FROM TS_RenovationImages WHERE renovation_id = @renovationId ORDER BY upload_date DESC');
        
        res.json(result.recordset);
    } catch (err) {
        console.error('Error fetching renovation images:', err);
        res.status(500).json({ error: 'Error fetching images' });
    }
});

// POST - Lisää kuva remonttiin (tukee sekä URL:ia että suoraa tiedostolatausta)
router.post('/:renovationId/images', upload.single('image'), async (req, res) => {
    try {
        const renovationId = req.params.renovationId;
        let image_url, image_name, file_size;

        // Check if file was uploaded
        if (req.file) {
            // Direct file upload
            if (!isAzureConfigured()) {
                return res.status(503).json({ 
                    error: 'Azure Blob Storage ei ole konfiguroitu. Käytä URL-latausta.' 
                });
            }

            try {
                let processedBuffer = req.file.buffer;
                let processedMimetype = req.file.mimetype;
                let processedFilename = req.file.originalname;

                // Check if file is HEIC/HEIF by mimetype or extension
                const isHeic = req.file.mimetype === 'image/heic' || 
                               req.file.mimetype === 'image/heif' || 
                               /\.(heic|heif)$/i.test(req.file.originalname);

                // Convert HEIC/HEIF to JPEG for browser compatibility
                if (isHeic) {
                    console.log(`Converting HEIC/HEIF to JPEG: ${req.file.originalname}`);
                    
                    // Use heic-convert to convert HEIC to JPEG buffer
                    const outputBuffer = await convert({
                        buffer: req.file.buffer,
                        format: 'JPEG',
                        quality: 0.9
                    });
                    
                    // Then use Sharp for further optimization if needed
                    processedBuffer = await sharp(outputBuffer)
                        .jpeg({ quality: 90 })
                        .toBuffer();
                    processedMimetype = 'image/jpeg';
                    processedFilename = req.file.originalname.replace(/\.(heic|heif)$/i, '.jpg');
                }
                
                // Optimize other images (resize if too large, compress)
                else if (req.file.mimetype.startsWith('image/')) {
                    const metadata = await sharp(req.file.buffer).metadata();
                    
                    // Resize if larger than 4K resolution
                    if (metadata.width > 3840 || metadata.height > 2160) {
                        console.log(`Resizing large image: ${metadata.width}x${metadata.height}`);
                        processedBuffer = await sharp(req.file.buffer)
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
                    processedMimetype
                );
                
                image_url = uploadResult.url;
                image_name = processedFilename;
                file_size = processedBuffer.length;
            } catch (uploadErr) {
                console.error('Azure upload error:', uploadErr);
                return res.status(500).json({ 
                    error: 'Kuvan lataus Azure Blob Storageen epäonnistui' 
                });
            }
        } else if (req.body.image_url) {
            // URL-based upload (existing method)
            image_url = req.body.image_url;
            image_name = req.body.image_name || null;
            file_size = req.body.file_size || null;
        } else {
            return res.status(400).json({ 
                error: 'Lähetä joko tiedosto (image) tai URL (image_url)' 
            });
        }

        const sqlRequest = new sql.Request();
        const result = await sqlRequest
            .input('renovationId', sql.Int, renovationId)
            .input('imageUrl', sql.NVarChar(500), image_url)
            .input('imageName', sql.NVarChar(255), image_name || null)
            .input('fileSize', sql.Int, file_size || null)
            .query(`
                INSERT INTO TS_RenovationImages (renovation_id, image_url, image_name, file_size)
                OUTPUT INSERTED.*
                VALUES (@renovationId, @imageUrl, @imageName, @fileSize)
            `);
        
        res.status(201).json(result.recordset[0]);
    } catch (err) {
        console.error('Error adding renovation image:', err);
        res.status(500).json({ error: 'Error adding image' });
    }
});

// PUT - Päivitä kuvan tiedot (nimi ja kuvaus)
router.put('/images/:imageId', async (req, res) => {
    try {
        const { image_name, description } = req.body;
        const imageId = req.params.imageId;

        const sqlRequest = new sql.Request();
        await sqlRequest
            .input('imageId', sql.Int, imageId)
            .input('imageName', sql.NVarChar(255), image_name)
            .input('description', sql.NVarChar(500), description)
            .query('UPDATE TS_RenovationImages SET image_name = @imageName, description = @description WHERE id = @imageId');

        res.json({ message: 'Kuvan tiedot päivitetty' });
    } catch (err) {
        console.error('Error updating image:', err);
        res.status(500).json({ error: 'Kuvan päivitys epäonnistui' });
    }
});

// DELETE - Poista kuva (ja Azure Blob jos mahdollista)
router.delete('/images/:imageId', async (req, res) => {
    try {
        // First, get the image info to extract blob name if needed
        const sqlRequest = new sql.Request();
        const imageResult = await sqlRequest
            .input('imageId', sql.Int, req.params.imageId)
            .query('SELECT image_url FROM TS_RenovationImages WHERE id = @imageId');
        
        if (imageResult.recordset.length === 0) {
            return res.status(404).json({ error: 'Kuvaa ei löytynyt' });
        }

        const imageUrl = imageResult.recordset[0].image_url;

        // Delete from database
        const deleteRequest = new sql.Request();
        await deleteRequest
            .input('imageId', sql.Int, req.params.imageId)
            .query('DELETE FROM TS_RenovationImages WHERE id = @imageId');

        // Try to delete from Azure Blob Storage if it's an Azure URL
        if (isAzureConfigured() && imageUrl.includes('.blob.core.windows.net')) {
            try {
                const blobName = extractBlobName(imageUrl);
                if (blobName) {
                    await deleteFromAzure(blobName);
                    console.log(`Deleted blob: ${blobName}`);
                }
            } catch (blobErr) {
                console.warn('Failed to delete blob from Azure:', blobErr.message);
                // Continue anyway - database entry is already deleted
            }
        }
        
        res.json({ message: 'Image deleted successfully' });
    } catch (err) {
        console.error('Error deleting renovation image:', err);
        res.status(500).json({ error: 'Error deleting image' });
    }
});

module.exports = router;
