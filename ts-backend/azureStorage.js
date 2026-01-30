const { BlobServiceClient } = require('@azure/storage-blob');
require('dotenv').config();

// Azure Storage configuration
const AZURE_STORAGE_CONNECTION_STRING = process.env.AZURE_STORAGE_CONNECTION_STRING;
const CONTAINER_NAME = process.env.AZURE_STORAGE_CONTAINER_NAME || 'renovation-images';

// Create blob service client
let blobServiceClient;
let containerClient;

try {
    if (AZURE_STORAGE_CONNECTION_STRING) {
        blobServiceClient = BlobServiceClient.fromConnectionString(AZURE_STORAGE_CONNECTION_STRING);
        containerClient = blobServiceClient.getContainerClient(CONTAINER_NAME);
        
        // Create container if it doesn't exist
        containerClient.createIfNotExists({ access: 'blob' })
            .then(() => console.log(`Azure Blob Storage container '${CONTAINER_NAME}' ready`))
            .catch(err => console.error('Azure Blob Storage initialization error:', err.message));
    } else {
        console.warn('Azure Storage connection string not found in .env - file uploads will use fallback method');
    }
} catch (error) {
    console.error('Failed to initialize Azure Blob Storage:', error.message);
}

/**
 * Upload a file buffer to Azure Blob Storage
 * @param {Buffer} fileBuffer - File content as buffer
 * @param {string} fileName - Original file name
 * @param {string} mimeType - File MIME type
 * @returns {Promise<{url: string, blobName: string}>}
 */
async function uploadToAzure(fileBuffer, fileName, mimeType) {
    if (!containerClient) {
        throw new Error('Azure Blob Storage not configured');
    }

    // Generate unique blob name
    const timestamp = Date.now();
    const sanitizedFileName = fileName.replace(/[^a-zA-Z0-9.-]/g, '_');
    const blobName = `${timestamp}-${sanitizedFileName}`;

    // Get block blob client
    const blockBlobClient = containerClient.getBlockBlobClient(blobName);

    // Upload buffer
    await blockBlobClient.upload(fileBuffer, fileBuffer.length, {
        blobHTTPHeaders: {
            blobContentType: mimeType
        }
    });

    return {
        url: blockBlobClient.url,
        blobName: blobName
    };
}

/**
 * Delete a blob from Azure Blob Storage
 * @param {string} blobName - Name of the blob to delete
 * @returns {Promise<boolean>}
 */
async function deleteFromAzure(blobName) {
    if (!containerClient) {
        throw new Error('Azure Blob Storage not configured');
    }

    const blockBlobClient = containerClient.getBlockBlobClient(blobName);
    await blockBlobClient.delete();
    return true;
}

/**
 * Extract blob name from Azure Blob Storage URL
 * @param {string} url - Full blob URL
 * @returns {string|null}
 */
function extractBlobName(url) {
    try {
        const urlObj = new URL(url);
        const pathname = urlObj.pathname;
        const parts = pathname.split('/');
        return parts[parts.length - 1]; // Last part is the blob name
    } catch {
        return null;
    }
}

module.exports = {
    uploadToAzure,
    deleteFromAzure,
    extractBlobName,
    isAzureConfigured: () => !!containerClient
};
