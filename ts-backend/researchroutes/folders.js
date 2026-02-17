const express = require('express');
const router = express.Router();
const { Folder, File } = require('../mongo');
const { BlobServiceClient } = require('@azure/storage-blob');
const getUserFromToken = require('../middleware/getUserFromToken');
require('dotenv').config();

// Azure Storage configuration for cleanup on folder delete
const AZURE_STORAGE_CONNECTION_STRING = process.env.AZURE_STORAGE_CONNECTION_STRING;
const DOCUMENTS_CONTAINER_NAME = 'property-documents';

let documentsContainerClient;
if (AZURE_STORAGE_CONNECTION_STRING) {
  const blobServiceClient = BlobServiceClient.fromConnectionString(AZURE_STORAGE_CONNECTION_STRING);
  documentsContainerClient = blobServiceClient.getContainerClient(DOCUMENTS_CONTAINER_NAME);
}

// GET all folders for a property (optionally filtered by parentFolderId)
router.get('/', getUserFromToken, async (req, res) => {
  try {
    const { propertyId, parentFolderId } = req.query;

    if (!propertyId) {
      return res.status(400).json({ error: 'propertyId vaaditaan' });
    }

    const filter = { propertyId: Number(propertyId) };

    if (parentFolderId && parentFolderId !== 'null' && parentFolderId !== 'root') {
      filter.parentFolderId = parentFolderId;
    } else {
      filter.parentFolderId = null;
    }

    const folders = await Folder.find(filter).sort({ name: 1 });
    res.json(folders);
  } catch (err) {
    console.error('Error fetching folders:', err);
    res.status(500).json({ error: 'Kansioiden haku epäonnistui' });
  }
});

// POST create a new folder
router.post('/', getUserFromToken, async (req, res) => {
  try {
    const { name, propertyId, parentFolderId } = req.body;

    if (!name || !propertyId) {
      return res.status(400).json({ error: 'Kansion nimi ja propertyId ovat pakollisia' });
    }

    const folder = new Folder({
      name: name.trim(),
      propertyId: Number(propertyId),
      parentFolderId: parentFolderId || null
    });

    await folder.save();
    res.status(201).json(folder);
  } catch (err) {
    console.error('Error creating folder:', err);
    res.status(500).json({ error: 'Kansion luonti epäonnistui' });
  }
});

// PUT rename a folder
router.put('/:id', getUserFromToken, async (req, res) => {
  try {
    const { name } = req.body;

    if (!name) {
      return res.status(400).json({ error: 'Kansion nimi on pakollinen' });
    }

    const folder = await Folder.findByIdAndUpdate(
      req.params.id,
      { name: name.trim() },
      { new: true }
    );

    if (!folder) {
      return res.status(404).json({ error: 'Kansiota ei löydy' });
    }

    res.json(folder);
  } catch (err) {
    console.error('Error renaming folder:', err);
    res.status(500).json({ error: 'Kansion nimeäminen epäonnistui' });
  }
});

// PUT move a folder to another parent folder
router.put('/:id/move', getUserFromToken, async (req, res) => {
  try {
    const { targetFolderId } = req.body; // null = move to root

    const folder = await Folder.findById(req.params.id);
    if (!folder) {
      return res.status(404).json({ error: 'Kansiota ei löydy' });
    }

    // Prevent moving a folder into itself or its own descendants
    if (targetFolderId) {
      const collectDescendants = async (parentId) => {
        const ids = [parentId.toString()];
        const children = await Folder.find({ parentFolderId: parentId });
        for (const child of children) {
          ids.push(...await collectDescendants(child._id));
        }
        return ids;
      };
      const descendantIds = await collectDescendants(folder._id);
      if (descendantIds.includes(targetFolderId)) {
        return res.status(400).json({ error: 'Kansiota ei voi siirtää omaan alikansioonsa' });
      }
    }

    folder.parentFolderId = targetFolderId || null;
    await folder.save();
    res.json(folder);
  } catch (err) {
    console.error('Error moving folder:', err);
    res.status(500).json({ error: 'Kansion siirto epäonnistui' });
  }
});

// PUT move a file to another folder
router.put('/move-file/:fileId', getUserFromToken, async (req, res) => {
  try {
    const { targetFolderId } = req.body; // null = move to root

    const file = await File.findById(req.params.fileId);
    if (!file) {
      return res.status(404).json({ error: 'Tiedostoa ei löydy' });
    }

    file.folderId = targetFolderId || null;
    await file.save();
    res.json(file);
  } catch (err) {
    console.error('Error moving file:', err);
    res.status(500).json({ error: 'Tiedoston siirto epäonnistui' });
  }
});

// DELETE a folder and all its contents (recursive)
router.delete('/:id', getUserFromToken, async (req, res) => {
  try {
    const folder = await Folder.findById(req.params.id);
    if (!folder) {
      return res.status(404).json({ error: 'Kansiota ei löydy' });
    }

    // Recursively collect all folder IDs to delete
    const folderIdsToDelete = [folder._id];
    const collectSubfolders = async (parentId) => {
      const subfolders = await Folder.find({ parentFolderId: parentId });
      for (const sub of subfolders) {
        folderIdsToDelete.push(sub._id);
        await collectSubfolders(sub._id);
      }
    };
    await collectSubfolders(folder._id);

    // Delete all files in these folders from Azure + MongoDB
    const filesToDelete = await File.find({ folderId: { $in: folderIdsToDelete } });

    for (const file of filesToDelete) {
      if (file.fileType === 'upload' && file.blobName && documentsContainerClient) {
        try {
          const blockBlobClient = documentsContainerClient.getBlockBlobClient(file.blobName);
          await blockBlobClient.delete();
        } catch (azureError) {
          console.error('Error deleting blob:', azureError.message);
        }
      }
    }

    await File.deleteMany({ folderId: { $in: folderIdsToDelete } });

    // Also delete files directly in these folders (with null folderId won't match, only explicit ones)
    // Delete all subfolders and the folder itself
    await Folder.deleteMany({ _id: { $in: folderIdsToDelete } });

    res.json({ message: 'Kansio ja sen sisältö poistettu', deletedFolders: folderIdsToDelete.length, deletedFiles: filesToDelete.length });
  } catch (err) {
    console.error('Error deleting folder:', err);
    res.status(500).json({ error: 'Kansion poisto epäonnistui' });
  }
});

module.exports = router;
