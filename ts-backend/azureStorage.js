const { BlobServiceClient } = require('@azure/storage-blob');
require('dotenv').config();

// Azure Storage configuration
const AZURE_STORAGE_CONNECTION_STRING = process.env.AZURE_STORAGE_CONNECTION_STRING;
const CONTAINER_NAME = process.env.AZURE_STORAGE_CONTAINER_NAME || 'renovation-images';

// Supported containers
const CONTAINERS = {
    'renovation-images': null,
    'property-images': null,
    'property-documents': null
};

// Create blob service client
let blobServiceClient;

try {
    if (AZURE_STORAGE_CONNECTION_STRING) {
        blobServiceClient = BlobServiceClient.fromConnectionString(AZURE_STORAGE_CONNECTION_STRING);
        
        // Initialize all containers
        for (const containerName of Object.keys(CONTAINERS)) {
            const client = blobServiceClient.getContainerClient(containerName);
            CONTAINERS[containerName] = client;
            
            client.createIfNotExists({ access: 'blob' })
                .then(() => console.log(`Azure Blob Storage container '${containerName}' ready`))
                .catch(err => console.error(`Azure container '${containerName}' initialization error:`, err.message));
        }
    } else {
        console.warn('Azure Storage connection string not found in .env - file uploads will use fallback method');
    }
} catch (error) {
    console.error('Failed to initialize Azure Blob Storage:', error.message);
}

/**
 * Get container client by name
 * @param {string} containerName - Container name (default: CONTAINER_NAME from env)
 * @returns {ContainerClient}
 */
function getContainerClient(containerName) {
    return CONTAINERS[containerName] || CONTAINERS[CONTAINER_NAME];
}

/**
 * Upload a file buffer to Azure Blob Storage
 * @param {Buffer} fileBuffer - File content as buffer
 * @param {string} fileName - Original file name
 * @param {string} mimeType - File MIME type
 * @param {string} [containerName] - Target container (default: renovation-images)
 * @returns {Promise<{url: string, blobName: string}>}
 */
async function uploadToAzure(fileBuffer, fileName, mimeType, containerName) {
    const client = getContainerClient(containerName);
    if (!client) {
        throw new Error('Azure Blob Storage not configured');
    }

    // Generate unique blob name
    const timestamp = Date.now();
    const sanitizedFileName = fileName.replace(/[^a-zA-Z0-9.-]/g, '_');
    const blobName = `${timestamp}-${sanitizedFileName}`;

    // Get block blob client
    const blockBlobClient = client.getBlockBlobClient(blobName);

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
 * @param {string} [containerName] - Container name (default: renovation-images)
 * @returns {Promise<boolean>}
 */
async function deleteFromAzure(blobName, containerName) {
    const client = getContainerClient(containerName);
    if (!client) {
        throw new Error('Azure Blob Storage not configured');
    }

    const blockBlobClient = client.getBlockBlobClient(blobName);
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
    getContainerClient,
    isAzureConfigured: () => !!blobServiceClient
};
