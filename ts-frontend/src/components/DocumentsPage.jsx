import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import config from '../configuration/config';
import { toast } from 'react-toastify';
import { Container, Card, Row, Col, Button, Badge, Alert, ButtonGroup, Modal, Form, Spinner, Breadcrumb, ListGroup } from 'react-bootstrap';
import { FolderFill, FolderPlus, Trash, FileEarmarkText, FileEarmarkPdf, FileEarmarkWord, FileEarmarkExcel, FileEarmarkPpt, FileEarmarkZip, FileEarmarkImage, InfoCircle, Download, EyeFill, Grid3x3GapFill, ListUl, ArrowLeft, PencilSquare, Folder2Open, HouseFill, ChevronLeft, ChevronRight, XLg, GripVertical } from 'react-bootstrap-icons';
import DocumentUpload from '../forms/DocumentUpload';

// ─── Utility: check if file is an image ─────────────────────
// file.name is user-given (e.g. "Kattokuva") and may lack extension,
// so we check blobName and url first which contain the actual filename.
function getFileExtension(file) {
  // Prefer blobName/url which always have the real extension
  const source = file.blobName || file.url || file.name || '';
  // Strip query params from URL before extracting extension
  const clean = source.split('?')[0];
  return clean.split('.').pop()?.toLowerCase() || '';
}

function isImageFile(file) {
  const ext = getFileExtension(file);
  // HEIC/HEIF excluded — browsers can't render them natively.
  // New uploads are auto-converted to JPEG server-side.
  return ['png', 'jpg', 'jpeg', 'gif', 'webp', 'bmp', 'svg'].includes(ext);
}

function getFileIcon(file, size = 28) {
  const ext = getFileExtension(file);
  if (['pdf'].includes(ext)) return <FileEarmarkPdf size={size} className="text-danger" />;
  if (['doc', 'docx'].includes(ext)) return <FileEarmarkWord size={size} className="text-primary" />;
  if (['xls', 'xlsx'].includes(ext)) return <FileEarmarkExcel size={size} className="text-success" />;
  if (['ppt', 'pptx'].includes(ext)) return <FileEarmarkPpt size={size} className="text-warning" />;
  if (['zip', 'rar', '7z'].includes(ext)) return <FileEarmarkZip size={size} className="text-secondary" />;
  if (['png', 'jpg', 'jpeg', 'gif', 'webp', 'heic', 'bmp', 'svg'].includes(ext)) return <FileEarmarkImage size={size} className="text-info" />;
  return <FileEarmarkText size={size} className="text-primary" />;
}

const DocumentsPage = ({ propertyId }) => {
  const [files, setFiles] = useState([]);
  const [folders, setFolders] = useState([]);
  const [currentFolderId, setCurrentFolderId] = useState(null);
  const [folderPath, setFolderPath] = useState([]);
  const [loading, setLoading] = useState(true);

  // Delete states
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [fileToDelete, setFileToDelete] = useState(null);
  const [showDeleteFolderConfirm, setShowDeleteFolderConfirm] = useState(false);
  const [folderToDelete, setFolderToDelete] = useState(null);
  const [deleting, setDeleting] = useState(false);

  // Folder create/rename states
  const [showCreateFolder, setShowCreateFolder] = useState(false);
  const [newFolderName, setNewFolderName] = useState('');
  const [creatingFolder, setCreatingFolder] = useState(false);
  const [showRenameFolder, setShowRenameFolder] = useState(false);
  const [renamingFolder, setRenamingFolder] = useState(null);
  const [renameFolderName, setRenameFolderName] = useState('');

  const [viewMode, setViewMode] = useState('list');

  // Edit states
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingFile, setEditingFile] = useState(null);
  const [editFormData, setEditFormData] = useState({ name: '', description: '' });
  const [saving, setSaving] = useState(false);
  const [showEditPanel, setShowEditPanel] = useState(false);

  // Lightbox states
  const [showLightbox, setShowLightbox] = useState(false);
  const [lightboxIndex, setLightboxIndex] = useState(0);

  // Drag & drop states
  const [draggedItem, setDraggedItem] = useState(null);
  const [dragOverTarget, setDragOverTarget] = useState(null); // breadcrumb only
  const [dropIndicator, setDropIndicator] = useState(null);   // { targetId, action: 'before'|'after'|'into', groupType: 'folder'|'file', folderName? }

  // Storage quota states
  const [storageQuota, setStorageQuota] = useState(null);
  const [loadingQuota, setLoadingQuota] = useState(false);

  const token = localStorage.getItem('token') || localStorage.getItem('userToken');

  // ─── Data fetching ────────────────────────────────────────
  const fetchContents = useCallback(async () => {
    try {
      setLoading(true);
      const folderParam = currentFolderId || 'root';

      const [filesRes, foldersRes] = await Promise.all([
        axios.get(`${config.baseURL}/api/files`, {
          params: { propertyId, folderId: folderParam },
          headers: { Authorization: `Bearer ${token}` }
        }),
        axios.get(`${config.baseURL}/api/folders`, {
          params: { propertyId, parentFolderId: folderParam },
          headers: { Authorization: `Bearer ${token}` }
        })
      ]);

      setFiles(filesRes.data);
      setFolders(foldersRes.data);
    } catch (err) {
      console.error('Error fetching documents:', err);
    } finally {
      setLoading(false);
    }
  }, [propertyId, currentFolderId, token]);

  useEffect(() => {
    fetchContents();
  }, [fetchContents]);

  // ─── Storage quota fetching ───────────────────────────────
  const fetchStorageQuota = useCallback(async () => {
    try {
      setLoadingQuota(true);
      const response = await axios.get(`${config.baseURL}/api/storage-quota`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setStorageQuota(response.data);
    } catch (err) {
      console.error('Error fetching storage quota:', err);
    } finally {
      setLoadingQuota(false);
    }
  }, [token]);

  useEffect(() => {
    fetchStorageQuota();
  }, [fetchStorageQuota]);

  // ─── Lightbox keyboard navigation ─────────────────────────
  const imageFiles = files.filter(f => isImageFile(f));

  useEffect(() => {
    if (!showLightbox) return;
    const handleKeyDown = (e) => {
      if (e.key === 'ArrowLeft') navigateLightbox(-1);
      else if (e.key === 'ArrowRight') navigateLightbox(1);
      else if (e.key === 'Escape') setShowLightbox(false);
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [showLightbox, lightboxIndex, imageFiles.length]);

  const navigateLightbox = (direction) => {
    const newIndex = lightboxIndex + direction;
    if (newIndex >= 0 && newIndex < imageFiles.length) {
      setLightboxIndex(newIndex);
    }
  };

  const openLightbox = (file) => {
    const idx = imageFiles.findIndex(f => f._id === file._id);
    if (idx >= 0) {
      setLightboxIndex(idx);
      setShowLightbox(true);
    }
  };

  // ─── Navigation ────────────────────────────────────────────
  const navigateToFolder = (folder) => {
    setFolderPath(prev => [...prev, { _id: folder._id, name: folder.name }]);
    setCurrentFolderId(folder._id);
  };

  const navigateToRoot = () => {
    setFolderPath([]);
    setCurrentFolderId(null);
  };

  const navigateToBreadcrumb = (index) => {
    if (index < 0) {
      navigateToRoot();
    } else {
      const newPath = folderPath.slice(0, index + 1);
      setFolderPath(newPath);
      setCurrentFolderId(newPath[newPath.length - 1]._id);
    }
  };

  const navigateBack = () => {
    if (folderPath.length <= 1) {
      navigateToRoot();
    } else {
      const newPath = folderPath.slice(0, -1);
      setFolderPath(newPath);
      setCurrentFolderId(newPath[newPath.length - 1]._id);
    }
  };

  // ─── Folder name validation ───────────────────────────────
  const validateFolderName = (name) => {
    const trimmed = name.trim();
    
    if (!trimmed) {
      return { valid: false, error: 'Kansion nimi ei voi olla tyhjä' };
    }
    
    if (trimmed.length > 50) {
      return { valid: false, error: 'Kansion nimi on liian pitkä (max 50 merkkiä)' };
    }
    
    if (trimmed !== name) {
      return { valid: false, error: 'Kansion nimi ei voi alkaa tai loppua välilyönnillä' };
    }
    
    // Check for invalid characters (filesystem-unsafe chars)
    const invalidChars = /[\/\\:*?"<>|]/;
    if (invalidChars.test(trimmed)) {
      return { valid: false, error: 'Kansion nimi ei voi sisältää merkkejä: / \\ : * ? " < > |' };
    }
    
    // Check for only dots or spaces
    if (/^[\.\s]+$/.test(trimmed)) {
      return { valid: false, error: 'Kansion nimi ei voi koostua pelkistä pisteistä tai välilyönneistä' };
    }
    
    return { valid: true };
  };

  // ─── Folder CRUD ──────────────────────────────────────────
  const createFolder = async () => {
    const validation = validateFolderName(newFolderName);
    if (!validation.valid) {
      toast.error(validation.error);
      return;
    }
    try {
      setCreatingFolder(true);
      await axios.post(`${config.baseURL}/api/folders`, {
        name: newFolderName.trim(),
        propertyId,
        parentFolderId: currentFolderId
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      toast.success(`Kansio "${newFolderName.trim()}" luotu`);
      setNewFolderName('');
      setShowCreateFolder(false);
      fetchContents();
    } catch (err) {
      console.error('Error creating folder:', err);
      toast.error(`Kansion "${newFolderName.trim()}" luonti epäonnistui`);
    } finally {
      setCreatingFolder(false);
    }
  };

  const renameFolder = async () => {
    if (!renamingFolder) return;
    
    const validation = validateFolderName(renameFolderName);
    if (!validation.valid) {
      toast.error(validation.error);
      return;
    }
    try {
      await axios.put(`${config.baseURL}/api/folders/${renamingFolder._id}`, {
        name: renameFolderName.trim()
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      toast.success(`Kansio nimetty: "${renameFolderName.trim()}"`);
      setShowRenameFolder(false);
      setRenamingFolder(null);
      fetchContents();
    } catch (err) {
      console.error('Error renaming folder:', err);
      toast.error(`Kansion nimeäminen epäonnistui: "${renameFolderName.trim()}"`);
    }
  };

  const deleteFolder = async () => {
    if (!folderToDelete) return;
    try {
      setDeleting(true);
      await axios.delete(`${config.baseURL}/api/folders/${folderToDelete._id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      toast.success(`Kansio "${folderToDelete.name}" poistettu`);
      setShowDeleteFolderConfirm(false);
      setFolderToDelete(null);
      fetchContents();
    } catch (err) {
      console.error('Error deleting folder:', err);
      toast.error(`Kansion "${folderToDelete?.name || 'tuntematon'}" poisto epäonnistui`);
    } finally {
      setDeleting(false);
    }
  };

  // ─── File delete ──────────────────────────────────────────
  const deleteFile = async () => {
    if (!fileToDelete) return;
    const fileName = files.find(f => f._id === fileToDelete)?.name || 'Tiedosto';
    try {
      setDeleting(true);
      await axios.delete(`${config.baseURL}/api/files/${fileToDelete}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      toast.success(`Tiedosto "${fileName}" poistettu`);
      setShowDeleteConfirm(false);
      setFileToDelete(null);
      fetchContents();
      fetchStorageQuota(); // Refresh quota after deletion
    } catch (err) {
      console.error('Error deleting file:', err);
      toast.error(`Tiedoston "${fileName}" poisto epäonnistui`);
    } finally {
      setDeleting(false);
    }
  };

  // ─── File edit ────────────────────────────────────────────
  const handleEdit = (file) => {
    setEditingFile(file);
    setEditFormData({
      name: file.name || '',
      description: file.description || ''
    });
    if (showLightbox) {
      setShowEditPanel(true);
    } else {
      setShowEditModal(true);
    }
  };

  const handleSaveEdit = async () => {
    if (!editingFile) return;
    try {
      setSaving(true);
      await axios.put(`${config.baseURL}/api/files/${editingFile._id}`, editFormData, {
        headers: { Authorization: `Bearer ${token}` }
      });
      toast.success(`Tiedosto "${editFormData.name}" päivitetty`);
      setShowEditModal(false);
      setShowEditPanel(false);
      if (showLightbox && editingFile) {
        // Update lightbox display immediately
        const updatedFiles = files.map(f =>
          f._id === editingFile._id ? { ...f, ...editFormData } : f
        );
        setFiles(updatedFiles);
      } else {
        fetchContents();
      }
    } catch (err) {
      console.error('Error updating file:', err);
      toast.error(`Tiedoston "${editFormData.name}" päivitys epäonnistui`);
    } finally {
      setSaving(false);
    }
  };

  // ─── Drag & Drop ──────────────────────────────────────────
  const handleDragStart = (e, type, item) => {
    e.stopPropagation();
    setDraggedItem({ type, item });
    e.dataTransfer.effectAllowed = 'move';
    setTimeout(() => {
      if (e.target) e.target.style.opacity = '0.4';
    }, 0);
  };

  const handleDragEnd = (e) => {
    e.target.style.opacity = '1';
    setDraggedItem(null);
    setDragOverTarget(null);
    setDropIndicator(null);
  };

  // Unified drag over handler for items (folders & files)
  const handleItemDragOver = (e, item, itemType) => {
    e.preventDefault();
    e.stopPropagation();
    e.dataTransfer.dropEffect = 'move';
    if (!draggedItem) return;
    if (draggedItem.item._id === item._id) return;

    const rect = e.currentTarget.getBoundingClientRect();

    if (itemType === 'folder') {
      // Folders have 3 zones: edges for reorder, center for move-into
      if (viewMode === 'cards') {
        const relX = (e.clientX - rect.left) / rect.width;
        if (relX < 0.25) {
          setDropIndicator({ targetId: item._id, action: 'before', groupType: 'folder', folderName: item.name });
        } else if (relX > 0.75) {
          setDropIndicator({ targetId: item._id, action: 'after', groupType: 'folder', folderName: item.name });
        } else {
          setDropIndicator({ targetId: item._id, action: 'into', groupType: 'folder', folderName: item.name });
        }
      } else {
        const relY = (e.clientY - rect.top) / rect.height;
        if (relY < 0.25) {
          setDropIndicator({ targetId: item._id, action: 'before', groupType: 'folder', folderName: item.name });
        } else if (relY > 0.75) {
          setDropIndicator({ targetId: item._id, action: 'after', groupType: 'folder', folderName: item.name });
        } else {
          setDropIndicator({ targetId: item._id, action: 'into', groupType: 'folder', folderName: item.name });
        }
      }
    } else {
      // Files: left/right half (cards) or top/bottom half (list) for reorder
      if (viewMode === 'cards') {
        const relX = (e.clientX - rect.left) / rect.width;
        setDropIndicator({ targetId: item._id, action: relX < 0.5 ? 'before' : 'after', groupType: 'file' });
      } else {
        const relY = (e.clientY - rect.top) / rect.height;
        setDropIndicator({ targetId: item._id, action: relY < 0.5 ? 'before' : 'after', groupType: 'file' });
      }
    }
  };

  const handleItemDragLeave = (e) => {
    e.preventDefault();
    if (!e.currentTarget.contains(e.relatedTarget)) {
      setDropIndicator(null);
    }
  };

  const handleItemDrop = async (e, targetItem, targetType) => {
    e.preventDefault();
    e.stopPropagation();

    if (!draggedItem || !dropIndicator) {
      setDropIndicator(null);
      setDraggedItem(null);
      return;
    }

    const { action } = dropIndicator;

    // Move into folder
    if (action === 'into' && targetType === 'folder') {
      if (draggedItem.type === 'folder' && draggedItem.item._id === targetItem._id) return;
      try {
        if (draggedItem.type === 'file') {
          await axios.put(`${config.baseURL}/api/folders/move-file/${draggedItem.item._id}`,
            { targetFolderId: targetItem._id }, { headers: { Authorization: `Bearer ${token}` } });
          toast.success(`"${draggedItem.item.name}" siirretty kansioon "${targetItem.name}"`);
        } else {
          await axios.put(`${config.baseURL}/api/folders/${draggedItem.item._id}/move`,
            { targetFolderId: targetItem._id }, { headers: { Authorization: `Bearer ${token}` } });
          toast.success(`Kansio "${draggedItem.item.name}" siirretty kansioon "${targetItem.name}"`);
        }
        fetchContents();
      } catch (err) {
        console.error('Error moving item:', err);
        toast.error(err.response?.data?.error || 'Siirto epäonnistui');
      }
      setDropIndicator(null);
      setDraggedItem(null);
      return;
    }

    // Reorder
    const sourceType = draggedItem.type;
    const sourceItem = draggedItem.item;

    if (sourceType === 'folder' && targetType === 'folder') {
      const newOrder = [...folders];
      const fromIdx = newOrder.findIndex(f => f._id === sourceItem._id);
      if (fromIdx === -1) { setDropIndicator(null); setDraggedItem(null); return; }
      newOrder.splice(fromIdx, 1);
      let insertIdx = newOrder.findIndex(f => f._id === targetItem._id);
      if (insertIdx === -1) { setDropIndicator(null); setDraggedItem(null); return; }
      if (action === 'after') insertIdx += 1;
      newOrder.splice(insertIdx, 0, sourceItem);
      setFolders(newOrder);
      saveReorder(newOrder.map(f => f._id), null);
    } else if (sourceType === 'file' && targetType === 'file') {
      const newOrder = [...files];
      const fromIdx = newOrder.findIndex(f => f._id === sourceItem._id);
      if (fromIdx === -1) { setDropIndicator(null); setDraggedItem(null); return; }
      newOrder.splice(fromIdx, 1);
      let insertIdx = newOrder.findIndex(f => f._id === targetItem._id);
      if (insertIdx === -1) { setDropIndicator(null); setDraggedItem(null); return; }
      if (action === 'after') insertIdx += 1;
      newOrder.splice(insertIdx, 0, sourceItem);
      setFiles(newOrder);
      saveReorder(null, newOrder.map(f => f._id));
    }
    // Cross-type reorder onto non-folder: ignore

    setDropIndicator(null);
    setDraggedItem(null);
  };

  const saveReorder = async (folderOrder, fileOrder) => {
    try {
      await axios.put(`${config.baseURL}/api/folders/reorder`, {
        folderOrder,
        fileOrder
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });
    } catch (err) {
      console.error('Error saving reorder:', err);
      toast.error('Järjestyksen tallennus epäonnistui');
      fetchContents();
    }
  };

  // Breadcrumb drag handlers (unchanged)
  const handleDragOverBreadcrumb = (e, targetId) => {
    e.preventDefault();
    e.stopPropagation();
    e.dataTransfer.dropEffect = 'move';
    setDragOverTarget({ type: 'breadcrumb', id: targetId });
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    if (!e.currentTarget.contains(e.relatedTarget)) {
      setDragOverTarget(null);
    }
  };

  const handleDropOnBreadcrumb = async (e, targetFolderId) => {
    e.preventDefault();
    e.stopPropagation();
    setDragOverTarget(null);
    if (!draggedItem) return;

    try {
      if (draggedItem.type === 'file') {
        await axios.put(`${config.baseURL}/api/folders/move-file/${draggedItem.item._id}`,
          { targetFolderId }, { headers: { Authorization: `Bearer ${token}` } });
        toast.success(`"${draggedItem.item.name}" siirretty`);
      } else {
        await axios.put(`${config.baseURL}/api/folders/${draggedItem.item._id}/move`,
          { targetFolderId }, { headers: { Authorization: `Bearer ${token}` } });
        toast.success(`Kansio "${draggedItem.item.name}" siirretty`);
      }
      fetchContents();
    } catch (err) {
      console.error('Error moving item:', err);
      toast.error(err.response?.data?.error || 'Siirto epäonnistui');
    }
    setDraggedItem(null);
  };

  // ─── Helpers ──────────────────────────────────────────────
  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('fi-FI', {
      year: 'numeric', month: 'numeric', day: 'numeric'
    });
  };

  const getValidUrl = (url) => {
    if (url && !url.match(/^https?:\/\//i)) return 'https://' + url;
    return url;
  };

  // Drop indicator helpers
  const isDropBefore = (itemId) =>
    dropIndicator?.targetId === itemId && dropIndicator?.action === 'before';
  const isDropAfter = (itemId) =>
    dropIndicator?.targetId === itemId && dropIndicator?.action === 'after';
  const isDropInto = (itemId) =>
    dropIndicator?.targetId === itemId && dropIndicator?.action === 'into';

  const isDragOverBreadcrumb = (targetId) =>
    dragOverTarget?.type === 'breadcrumb' && dragOverTarget?.id === targetId;

  const totalItems = folders.length + files.length;

  // ─────────────────────────────────────────────────────────
  // RENDER
  // ─────────────────────────────────────────────────────────
  return (
    <Container fluid className="py-4">
      {/* Header */}
      <Row className="mb-3">
        <Col>
          <h2 className="h3 mb-1">
            <Folder2Open size={28} className="me-2 text-primary" />
            Dokumentit
          </h2>
          <p className="text-muted mb-0">
            Hallitse dokumenttejasi kansioissa. Raahaa tiedostoja ja kansioita siirtääksesi niitä.
          </p>
        </Col>
      </Row>

      {/* Breadcrumb + Actions bar */}
      <div className="d-flex justify-content-between align-items-center mb-3 flex-wrap gap-2" style={{ backgroundColor: '#f8f9fa', padding: '10px 16px', borderRadius: '8px', border: '1px solid #e9ecef' }}>
        <div className="d-flex align-items-center gap-2">
          {/* Back button */}
          {folderPath.length > 0 && (
            <Button 
              variant="light" 
              size="sm" 
              onClick={navigateBack} 
              style={{ 
                padding: '4px 10px', 
                border: '1px solid #dee2e6',
                display: 'flex',
                alignItems: 'center',
                gap: '4px'
              }}
              className="shadow-sm"
            >
              <ArrowLeft size={14} />
              <span style={{ fontSize: '0.85rem' }}>Takaisin</span>
            </Button>
          )}

          {/* Breadcrumb path */}
          <div className="d-flex align-items-center gap-1" style={{ fontSize: '0.9rem' }}>
            {/* Root/Home */}
            <div
              onClick={navigateToRoot}
              onDragOver={(e) => folderPath.length > 0 && handleDragOverBreadcrumb(e, 'root')}
              onDragLeave={handleDragLeave}
              onDrop={(e) => folderPath.length > 0 && handleDropOnBreadcrumb(e, null)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '4px',
                padding: '4px 8px',
                borderRadius: '4px',
                cursor: folderPath.length > 0 ? 'pointer' : 'default',
                fontWeight: folderPath.length === 0 ? '600' : '500',
                color: folderPath.length === 0 ? '#0d6efd' : '#495057',
                backgroundColor: isDragOverBreadcrumb('root') ? '#cfe2ff' : 'transparent',
                transition: 'all 0.2s'
              }}
              onMouseEnter={(e) => folderPath.length > 0 && (e.currentTarget.style.backgroundColor = '#e9ecef')}
              onMouseLeave={(e) => !isDragOverBreadcrumb('root') && (e.currentTarget.style.backgroundColor = 'transparent')}
            >
              <HouseFill size={14} style={{ marginBottom: '1px' }} />
              <span>Koti</span>
            </div>

            {/* Folder path with separators */}
            {folderPath.map((folder, index) => (
              <div key={folder._id} className="d-flex align-items-center gap-1">
                <span style={{ color: '#6c757d', fontSize: '0.9rem' }}>/</span>
                <div
                  onClick={() => navigateToBreadcrumb(index)}
                  onDragOver={(e) => index < folderPath.length - 1 && handleDragOverBreadcrumb(e, folder._id)}
                  onDragLeave={handleDragLeave}
                  onDrop={(e) => index < folderPath.length - 1 && handleDropOnBreadcrumb(e, folder._id)}
                  style={{
                    padding: '4px 8px',
                    borderRadius: '4px',
                    cursor: index < folderPath.length - 1 ? 'pointer' : 'default',
                    fontWeight: index === folderPath.length - 1 ? '600' : '500',
                    color: index === folderPath.length - 1 ? '#0d6efd' : '#495057',
                    backgroundColor: isDragOverBreadcrumb(folder._id) ? '#cfe2ff' : 'transparent',
                    transition: 'all 0.2s',
                    whiteSpace: 'nowrap'
                  }}
                  onMouseEnter={(e) => index < folderPath.length - 1 && (e.currentTarget.style.backgroundColor = '#e9ecef')}
                  onMouseLeave={(e) => !isDragOverBreadcrumb(folder._id) && (e.currentTarget.style.backgroundColor = 'transparent')}
                >
                  {folder.name}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Action buttons */}
        <div className="d-flex align-items-center gap-2">
          <Button variant="outline-primary" size="sm"
            onClick={() => { setShowCreateFolder(true); setNewFolderName(''); }}>
            <FolderPlus size={14} className="me-1" />
            Uusi kansio
          </Button>
          <ButtonGroup size="sm">
            <Button variant={viewMode === 'list' ? 'primary' : 'outline-secondary'}
              onClick={() => setViewMode('list')}
              className="d-flex align-items-center justify-content-center">
              <ListUl size={14} />
            </Button>
            <Button variant={viewMode === 'cards' ? 'primary' : 'outline-secondary'}
              onClick={() => setViewMode('cards')}
              className="d-flex align-items-center justify-content-center">
              <Grid3x3GapFill size={14} />
            </Button>
          </ButtonGroup>
        </div>
      </div>

      {/* Upload area */}
      <Row className="mb-3">
        <Col lg={8} xl={6}>
          <DocumentUpload propertyId={propertyId} folderId={currentFolderId} onUpload={() => { fetchContents(); fetchStorageQuota(); }} />
          
          {/* Storage quota display */}
          {storageQuota && (
            <div className="mt-2 p-2 border rounded bg-light d-flex align-items-center justify-content-between" style={{ fontSize: '0.85rem' }}>
              <div className="d-flex align-items-center gap-2 flex-grow-1">
                <span className="text-muted">Tallennustila:</span>
                <div className="flex-grow-1" style={{ maxWidth: '200px' }}>
                  <div className="progress" style={{ height: '8px' }}>
                    <div 
                      className={`progress-bar ${parseFloat(storageQuota.percentUsed) > 90 ? 'bg-danger' : parseFloat(storageQuota.percentUsed) > 75 ? 'bg-warning' : 'bg-success'}`}
                      role="progressbar"
                      style={{ width: `${storageQuota.percentUsed}%` }}
                      aria-valuenow={storageQuota.percentUsed}
                      aria-valuemin="0"
                      aria-valuemax="100"
                    />
                  </div>
                </div>
                <span>
                  <strong>{storageQuota.usedMB}</strong> / {storageQuota.limitMB} MB
                </span>
              </div>
              {parseFloat(storageQuota.percentUsed) > 90 && (
                <Badge bg="danger" className="ms-2">Lähes täynnä</Badge>
              )}
            </div>
          )}
        </Col>
      </Row>

      {/* Loading / Empty / Content */}
      {loading ? (
        <div className="text-center p-4">
          <Spinner animation="border" role="status">
            <span className="visually-hidden">Ladataan...</span>
          </Spinner>
        </div>
      ) : totalItems === 0 ? (
        <Alert variant="info" className="d-flex align-items-center">
          <InfoCircle size={24} className="me-3 flex-shrink-0" />
          <div>
            <strong>{folderPath.length > 0 ? 'Tyhjä kansio' : 'Ei dokumentteja'}</strong>
            <br />
            <small>
              {folderPath.length > 0
                ? 'Luo alikansio tai lataa tiedostoja tähän kansioon.'
                : 'Luo kansio tai lataa ensimmäinen dokumentti yllä olevalla lomakkeella.'}
            </small>
          </div>
        </Alert>
      ) : viewMode === 'cards' ? (
        /* ═══════════ CARD VIEW ═══════════ */
        <Row className="g-3">
          {/* ── Folders ── */}
          {folders.map(folder => (
            <Col key={folder._id} xs={6} sm={4} md={3} lg={2}>
              <div style={{ position: 'relative' }}
                onDragOver={(e) => handleItemDragOver(e, folder, 'folder')}
                onDragLeave={handleItemDragLeave}
                onDrop={(e) => handleItemDrop(e, folder, 'folder')}
              >
                {/* Left insertion indicator */}
                {isDropBefore(folder._id) && (
                  <div style={{
                    position: 'absolute', left: '-6px', top: 0, bottom: 0, width: '4px',
                    backgroundColor: '#0d6efd', borderRadius: '2px', zIndex: 10
                  }}>
                    <div style={{
                      position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)',
                      backgroundColor: '#0d6efd', color: '#fff', padding: '2px 8px', borderRadius: '4px',
                      fontSize: '0.65rem', whiteSpace: 'nowrap', zIndex: 11, fontWeight: '600'
                    }}>Siirrä tähän</div>
                  </div>
                )}
                {/* Right insertion indicator */}
                {isDropAfter(folder._id) && (
                  <div style={{
                    position: 'absolute', right: '-6px', top: 0, bottom: 0, width: '4px',
                    backgroundColor: '#0d6efd', borderRadius: '2px', zIndex: 10
                  }}>
                    <div style={{
                      position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)',
                      backgroundColor: '#0d6efd', color: '#fff', padding: '2px 8px', borderRadius: '4px',
                      fontSize: '0.65rem', whiteSpace: 'nowrap', zIndex: 11, fontWeight: '600'
                    }}>Siirrä tähän</div>
                  </div>
                )}
                {/* Move into folder overlay */}
                {isDropInto(folder._id) && (
                  <div style={{
                    position: 'absolute', inset: 0, zIndex: 10,
                    backgroundColor: 'rgba(13, 110, 253, 0.15)',
                    border: '2px dashed #0d6efd', borderRadius: '8px',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    pointerEvents: 'none'
                  }}>
                    <span style={{
                      backgroundColor: 'rgba(13, 110, 253, 0.9)', color: '#fff',
                      padding: '4px 10px', borderRadius: '6px', fontSize: '0.7rem',
                      fontWeight: '600', textAlign: 'center', lineHeight: '1.3'
                    }}>Siirrä kansioon<br />"{folder.name}"</span>
                  </div>
                )}
                <Card
                  className="h-100 border-0 shadow-sm text-center"
                  draggable
                  onDragStart={(e) => handleDragStart(e, 'folder', folder)}
                  onDragEnd={handleDragEnd}
                  style={{
                    cursor: 'pointer', transition: 'all 0.2s', borderRadius: '8px',
                    ...(isDropInto(folder._id) ? {
                      outline: '2px dashed #0d6efd', outlineOffset: '-2px',
                      backgroundColor: 'rgba(13, 110, 253, 0.06)', transform: 'scale(1.03)'
                    } : {})
                  }}
                  onMouseEnter={(e) => { if (!isDropInto(folder._id)) { e.currentTarget.style.transform = 'translateY(-3px)'; e.currentTarget.style.boxShadow = '0 6px 16px rgba(0,0,0,0.12)'; } }}
                  onMouseLeave={(e) => { if (!isDropInto(folder._id)) { e.currentTarget.style.transform = ''; e.currentTarget.style.boxShadow = ''; } }}
                  onClick={() => navigateToFolder(folder)}
                >
                <Card.Body className="d-flex flex-column align-items-center py-3 px-2">
                  <GripVertical size={12} className="text-muted mb-1" style={{ cursor: 'grab' }} />
                  <FolderFill size={40} className="text-warning mb-2" />
                  <div style={{ fontWeight: '600', fontSize: '0.8rem', wordBreak: 'break-word', lineHeight: '1.2', maxHeight: '2.4rem', overflow: 'hidden', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical' }} title={folder.name}>
                    {folder.name}
                  </div>
                  <div className="mt-auto pt-2 d-flex gap-1">
                    <Button variant="outline-secondary" size="sm"
                      onClick={(e) => { e.stopPropagation(); setRenamingFolder(folder); setRenameFolderName(folder.name); setShowRenameFolder(true); }}
                      style={{ padding: '1px 5px', fontSize: '0.65rem', lineHeight: 1 }}>
                      <PencilSquare size={10} />
                    </Button>
                    <Button variant="outline-danger" size="sm"
                      onClick={(e) => { e.stopPropagation(); setFolderToDelete(folder); setShowDeleteFolderConfirm(true); }}
                      style={{ padding: '1px 5px', fontSize: '0.65rem', lineHeight: 1 }}>
                      <Trash size={10} />
                    </Button>
                  </div>
                </Card.Body>
              </Card>
              </div>
            </Col>
          ))}

          {/* ── Files — card with thumbnail or file icon ── */}
          {files.map(file => {
            const validUrl = getValidUrl(file.url);
            const isImage = isImageFile(file);
            return (
              <Col key={file._id} xs={6} sm={4} md={3} lg={3}>
                <div style={{ position: 'relative' }}
                  onDragOver={(e) => handleItemDragOver(e, file, 'file')}
                  onDragLeave={handleItemDragLeave}
                  onDrop={(e) => handleItemDrop(e, file, 'file')}
                >
                  {/* Left insertion indicator */}
                  {isDropBefore(file._id) && (
                    <div style={{
                      position: 'absolute', left: '-6px', top: 0, bottom: 0, width: '4px',
                      backgroundColor: '#0d6efd', borderRadius: '2px', zIndex: 10
                    }}>
                      <div style={{
                        position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)',
                        backgroundColor: '#0d6efd', color: '#fff', padding: '2px 8px', borderRadius: '4px',
                        fontSize: '0.65rem', whiteSpace: 'nowrap', zIndex: 11, fontWeight: '600'
                      }}>Siirrä tähän</div>
                    </div>
                  )}
                  {/* Right insertion indicator */}
                  {isDropAfter(file._id) && (
                    <div style={{
                      position: 'absolute', right: '-6px', top: 0, bottom: 0, width: '4px',
                      backgroundColor: '#0d6efd', borderRadius: '2px', zIndex: 10
                    }}>
                      <div style={{
                        position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)',
                        backgroundColor: '#0d6efd', color: '#fff', padding: '2px 8px', borderRadius: '4px',
                        fontSize: '0.65rem', whiteSpace: 'nowrap', zIndex: 11, fontWeight: '600'
                      }}>Siirrä tähän</div>
                    </div>
                  )}
                <Card
                  className="h-100 border-0 shadow-sm"
                  draggable
                  onDragStart={(e) => handleDragStart(e, 'file', file)}
                  onDragEnd={handleDragEnd}
                  style={{ borderRadius: '8px', overflow: 'hidden', cursor: 'grab', transition: 'all 0.2s' }}
                  onMouseEnter={(e) => { e.currentTarget.style.transform = 'translateY(-3px)'; e.currentTarget.style.boxShadow = '0 6px 16px rgba(0,0,0,0.12)'; }}
                  onMouseLeave={(e) => { e.currentTarget.style.transform = ''; e.currentTarget.style.boxShadow = ''; }}
                >
                  {/* Thumbnail area */}
                  <div
                    style={{
                      aspectRatio: '4 / 3', overflow: 'hidden', position: 'relative',
                      backgroundColor: isImage ? '#000' : '#f0f2f5',
                      cursor: isImage ? 'pointer' : 'default',
                      display: 'flex', alignItems: 'center', justifyContent: 'center'
                    }}
                    onClick={() => isImage && openLightbox(file)}
                  >
                    {isImage ? (
                      <>
                        <img
                          src={validUrl}
                          alt={file.name}
                          style={{ width: '100%', height: '100%', objectFit: 'cover', transition: 'transform 0.3s ease' }}
                          onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.05)'}
                          onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
                          onError={(e) => { e.target.style.display = 'none'; if (e.target.nextSibling) e.target.nextSibling.style.display = 'flex'; }}
                        />
                        <div style={{ display: 'none', alignItems: 'center', justifyContent: 'center', width: '100%', height: '100%', position: 'absolute' }}>
                          {getFileIcon(file, 48)}
                        </div>
                      </>
                    ) : (
                      <div className="d-flex flex-column align-items-center justify-content-center" style={{ padding: '1rem' }}>
                        {getFileIcon(file, 48)}
                        <Badge bg="secondary" className="mt-2" style={{ fontSize: '0.6rem', textTransform: 'uppercase' }}>
                          {getFileExtension(file) || 'file'}
                        </Badge>
                      </div>
                    )}
                    {/* Top overlay bar */}
                    <div style={{
                      position: 'absolute', top: 0, left: 0, right: 0,
                      display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                      backgroundColor: 'rgba(0,0,0,0.45)', color: '#fff',
                      padding: '3px 8px', fontSize: '0.65rem'
                    }}>
                      <span><GripVertical size={10} className="me-1" style={{ cursor: 'grab' }} />{formatDate(file.uploadedAt)}</span>
                      <span style={{ maxWidth: '60%', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{file.name || 'Nimetön'}</span>
                    </div>
                    {/* Bottom overlay bar */}
                    <div
                      onClick={(e) => e.stopPropagation()}
                      style={{
                        position: 'absolute', bottom: 0, left: 0, right: 0,
                        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                        backgroundColor: 'rgba(0,0,0,0.75)', color: '#fff',
                        padding: '6px 10px', fontSize: '0.7rem'
                      }}
                    >
                      <span
                        onClick={() => handleEdit(file)}
                        style={{ color: '#8cb4ff', cursor: 'pointer', flexShrink: 0 }}
                        onMouseEnter={(e) => e.currentTarget.style.color = '#fff'}
                        onMouseLeave={(e) => e.currentTarget.style.color = '#8cb4ff'}
                      >
                        Muokkaa
                      </span>
                      {file.description && (
                        <span
                          title={file.description}
                          style={{
                            color: '#ddd', overflow: 'hidden', textOverflow: 'ellipsis',
                            whiteSpace: 'nowrap', margin: '0 8px', textAlign: 'center', flex: 1
                          }}
                        >
                          {file.description}
                        </span>
                      )}
                      <span
                        onClick={() => { setFileToDelete(file._id); setShowDeleteConfirm(true); }}
                        style={{ color: '#ff8c8c', cursor: 'pointer', flexShrink: 0 }}
                        onMouseEnter={(e) => e.currentTarget.style.color = '#fff'}
                        onMouseLeave={(e) => e.currentTarget.style.color = '#ff8c8c'}
                      >
                        Poista
                      </span>
                    </div>
                  </div>
                </Card>
                </div>
              </Col>
            );
          })}
        </Row>
      ) : (
        /* ═══════════ LIST VIEW ═══════════ */
        <ListGroup>
          {/* ── Folders ── */}
          {folders.map(folder => (
            <div key={folder._id} style={{ position: 'relative' }}
              onDragOver={(e) => handleItemDragOver(e, folder, 'folder')}
              onDragLeave={handleItemDragLeave}
              onDrop={(e) => handleItemDrop(e, folder, 'folder')}
            >
              {/* Top insertion indicator */}
              {isDropBefore(folder._id) && (
                <div style={{
                  position: 'absolute', top: '-2px', left: 0, right: 0, height: '4px',
                  backgroundColor: '#0d6efd', borderRadius: '2px', zIndex: 10
                }}>
                  <div style={{
                    position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)',
                    backgroundColor: '#0d6efd', color: '#fff', padding: '2px 10px', borderRadius: '4px',
                    fontSize: '0.65rem', whiteSpace: 'nowrap', zIndex: 11, fontWeight: '600'
                  }}>Siirrä tähän</div>
                </div>
              )}
              {/* Bottom insertion indicator */}
              {isDropAfter(folder._id) && (
                <div style={{
                  position: 'absolute', bottom: '-2px', left: 0, right: 0, height: '4px',
                  backgroundColor: '#0d6efd', borderRadius: '2px', zIndex: 10
                }}>
                  <div style={{
                    position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)',
                    backgroundColor: '#0d6efd', color: '#fff', padding: '2px 10px', borderRadius: '4px',
                    fontSize: '0.65rem', whiteSpace: 'nowrap', zIndex: 11, fontWeight: '600'
                  }}>Siirrä tähän</div>
                </div>
              )}
              {/* Move into folder overlay */}
              {isDropInto(folder._id) && (
                <div style={{
                  position: 'absolute', inset: 0, zIndex: 10,
                  backgroundColor: 'rgba(13, 110, 253, 0.12)',
                  border: '2px dashed #0d6efd', borderRadius: '4px',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  pointerEvents: 'none'
                }}>
                  <span style={{
                    backgroundColor: 'rgba(13, 110, 253, 0.9)', color: '#fff',
                    padding: '4px 12px', borderRadius: '6px', fontSize: '0.75rem',
                    fontWeight: '600'
                  }}>Siirrä kansioon "{folder.name}"</span>
                </div>
              )}
            <ListGroup.Item
              className="d-flex justify-content-between align-items-center"
              draggable
              onDragStart={(e) => handleDragStart(e, 'folder', folder)}
              onDragEnd={handleDragEnd}
              style={{
                cursor: 'pointer', padding: '0.5rem 0.75rem',
                ...(isDropInto(folder._id) ? {
                  outline: '2px dashed #0d6efd', outlineOffset: '-2px',
                  backgroundColor: 'rgba(13, 110, 253, 0.08)'
                } : {})
              }}
              onClick={() => navigateToFolder(folder)}
              onMouseEnter={(e) => { if (!isDropInto(folder._id)) e.currentTarget.style.backgroundColor = '#f8f9fa'; }}
              onMouseLeave={(e) => { if (!isDropInto(folder._id)) e.currentTarget.style.backgroundColor = ''; }}
            >
              <div className="d-flex align-items-center gap-2">
                <GripVertical size={12} className="text-muted" style={{ cursor: 'grab' }} />
                <FolderFill size={20} className="text-warning flex-shrink-0" />
                <span style={{ fontWeight: '600', fontSize: '0.85rem' }}>{folder.name}</span>
              </div>
              <div className="d-flex gap-1 align-items-center">
                <span style={{ fontSize: '0.7rem', color: '#888', backgroundColor: '#f7f7f7', padding: '1px 6px', borderRadius: '8px', border: '1px solid #e8e8e8', marginRight: '6px' }}>
                  {formatDate(folder.createdAt)}
                </span>
                <Button variant="outline-secondary" size="sm"
                  onClick={(e) => { e.stopPropagation(); setRenamingFolder(folder); setRenameFolderName(folder.name); setShowRenameFolder(true); }}
                  style={{ borderRadius: '4px', padding: '2px 6px', fontSize: '0.7rem', lineHeight: 1 }}>
                  <PencilSquare size={10} />
                </Button>
                <Button variant="outline-danger" size="sm"
                  onClick={(e) => { e.stopPropagation(); setFolderToDelete(folder); setShowDeleteFolderConfirm(true); }}
                  style={{ borderRadius: '4px', padding: '2px 6px', fontSize: '0.7rem', lineHeight: 1 }}>
                  <Trash size={10} />
                </Button>
              </div>
            </ListGroup.Item>
            </div>
          ))}

          {/* ── Files ── */}
          {files.map(file => {
            const validUrl = getValidUrl(file.url);
            const isImage = isImageFile(file);
            return (
              <div key={file._id} style={{ position: 'relative' }}
                onDragOver={(e) => handleItemDragOver(e, file, 'file')}
                onDragLeave={handleItemDragLeave}
                onDrop={(e) => handleItemDrop(e, file, 'file')}
              >
                {/* Top insertion indicator */}
                {isDropBefore(file._id) && (
                  <div style={{
                    position: 'absolute', top: '-2px', left: 0, right: 0, height: '4px',
                    backgroundColor: '#0d6efd', borderRadius: '2px', zIndex: 10
                  }}>
                    <div style={{
                      position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)',
                      backgroundColor: '#0d6efd', color: '#fff', padding: '2px 10px', borderRadius: '4px',
                      fontSize: '0.65rem', whiteSpace: 'nowrap', zIndex: 11, fontWeight: '600'
                    }}>Siirrä tähän</div>
                  </div>
                )}
                {/* Bottom insertion indicator */}
                {isDropAfter(file._id) && (
                  <div style={{
                    position: 'absolute', bottom: '-2px', left: 0, right: 0, height: '4px',
                    backgroundColor: '#0d6efd', borderRadius: '2px', zIndex: 10
                  }}>
                    <div style={{
                      position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)',
                      backgroundColor: '#0d6efd', color: '#fff', padding: '2px 10px', borderRadius: '4px',
                      fontSize: '0.65rem', whiteSpace: 'nowrap', zIndex: 11, fontWeight: '600'
                    }}>Siirrä tähän</div>
                  </div>
                )}
              <ListGroup.Item
                className="d-flex justify-content-between align-items-center"
                draggable
                onDragStart={(e) => handleDragStart(e, 'file', file)}
                onDragEnd={handleDragEnd}
                style={{ padding: '0.5rem 0.75rem' }}
              >
                <div className="d-flex align-items-center gap-2 flex-grow-1" style={{ minWidth: 0 }}>
                  <GripVertical size={12} className="text-muted flex-shrink-0" style={{ cursor: 'grab' }} />
                  {/* Small thumbnail or file type icon */}
                  {isImage ? (
                    <div
                      style={{
                        width: '36px', height: '36px', borderRadius: '4px', overflow: 'hidden',
                        flexShrink: 0, cursor: 'pointer', border: '1px solid #dee2e6'
                      }}
                      onClick={() => openLightbox(file)}
                    >
                      <img src={validUrl} alt={file.name}
                        style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                        onError={(e) => { e.target.style.display = 'none'; }}
                      />
                    </div>
                  ) : (
                    <div className="flex-shrink-0">{getFileIcon(file, 22)}</div>
                  )}
                  <div style={{ minWidth: 0 }}>
                    <div style={{ fontWeight: '600', fontSize: '0.85rem', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                      {file.name}
                    </div>
                    {file.description && (
                      <div className="text-muted" style={{ fontSize: '0.72rem', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: '300px' }}>
                        {file.description}
                      </div>
                    )}
                  </div>
                </div>
                <div className="d-flex align-items-center gap-1 flex-shrink-0">
                  <Badge bg="light" text="dark" style={{ fontSize: '0.6rem', textTransform: 'uppercase', border: '1px solid #e8e8e8' }}>
                    {getFileExtension(file)}
                  </Badge>
                  <span style={{ fontSize: '0.7rem', color: '#888', backgroundColor: '#f7f7f7', padding: '1px 6px', borderRadius: '8px', border: '1px solid #e8e8e8' }}>
                    {formatDate(file.uploadedAt)}
                  </span>
                  {isImage && (
                    <Button variant="outline-info" size="sm" onClick={() => openLightbox(file)}
                      style={{ borderRadius: '4px', padding: '2px 6px', fontSize: '0.7rem', lineHeight: 1 }}>
                      <EyeFill size={10} />
                    </Button>
                  )}
                  <Button variant="outline-primary" size="sm"
                    onClick={(e) => { e.stopPropagation(); handleEdit(file); }}
                    style={{ borderRadius: '4px', padding: '2px 6px', fontSize: '0.7rem', lineHeight: 1 }}>
                    <PencilSquare size={10} />
                  </Button>
                  <Button variant="outline-primary" size="sm"
                    href={validUrl} target="_blank" rel="noopener noreferrer"
                    style={{ borderRadius: '4px', padding: '2px 6px', fontSize: '0.7rem', lineHeight: 1 }}>
                    {isImage ? <Download size={10} /> : <EyeFill size={10} />}
                  </Button>
                  <Button variant="outline-danger" size="sm"
                    onClick={() => { setFileToDelete(file._id); setShowDeleteConfirm(true); }}
                    style={{ borderRadius: '4px', padding: '2px 6px', fontSize: '0.7rem', lineHeight: 1 }}>
                    <Trash size={10} />
                  </Button>
                </div>
              </ListGroup.Item>
              </div>
            );
          })}
        </ListGroup>
      )}

      {/* ═══════════ LIGHTBOX ═══════════ */}
      {showLightbox && imageFiles.length > 0 && (
        <Modal
          show
          onHide={() => { setShowLightbox(false); setShowEditPanel(false); }}
          size="xl"
          centered
          contentClassName="bg-transparent border-0 shadow-none"
          dialogClassName="modal-fullscreen-lg-down"
          style={{ zIndex: 1060 }}
        >
          <div
            onClick={() => { setShowLightbox(false); setShowEditPanel(false); }}
            style={{
              position: 'fixed', inset: 0,
              backgroundColor: 'rgba(0,0,0,0.92)',
              display: 'flex', flexDirection: 'column',
              alignItems: 'center', justifyContent: 'center',
              zIndex: 1061
            }}
          >
            {/* Close */}
            <button
              onClick={(e) => { e.stopPropagation(); setShowLightbox(false); setShowEditPanel(false); }}
              style={{
                position: 'absolute', top: '16px', right: '16px',
                background: 'rgba(255,255,255,0.15)', border: 'none', borderRadius: '50%',
                width: '40px', height: '40px', display: 'flex', alignItems: 'center', justifyContent: 'center',
                color: '#fff', cursor: 'pointer', zIndex: 1070, transition: 'background 0.2s'
              }}
              onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.3)'}
              onMouseLeave={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.15)'}
            >
              <XLg size={18} />
            </button>

            {/* Counter */}
            <div style={{
              position: 'absolute', top: '18px', left: '50%', transform: 'translateX(-50%)',
              color: 'rgba(255,255,255,0.7)', fontSize: '0.85rem', zIndex: 1065
            }}>
              {lightboxIndex + 1} / {imageFiles.length}
            </div>

            {/* Prev */}
            {lightboxIndex > 0 && (
              <button
                onClick={(e) => { e.stopPropagation(); navigateLightbox(-1); }}
                style={{
                  position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)',
                  background: 'rgba(255,255,255,0.15)', border: 'none', borderRadius: '50%',
                  width: '48px', height: '48px', display: 'flex', alignItems: 'center', justifyContent: 'center',
                  color: '#fff', cursor: 'pointer', zIndex: 1065, transition: 'background 0.2s'
                }}
                onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.3)'}
                onMouseLeave={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.15)'}
              >
                <ChevronLeft size={24} />
              </button>
            )}

            {/* Next */}
            {lightboxIndex < imageFiles.length - 1 && (
              <button
                onClick={(e) => { e.stopPropagation(); navigateLightbox(1); }}
                style={{
                  position: 'absolute', right: '16px', top: '50%', transform: 'translateY(-50%)',
                  background: 'rgba(255,255,255,0.15)', border: 'none', borderRadius: '50%',
                  width: '48px', height: '48px', display: 'flex', alignItems: 'center', justifyContent: 'center',
                  color: '#fff', cursor: 'pointer', zIndex: 1065, transition: 'background 0.2s'
                }}
                onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.3)'}
                onMouseLeave={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.15)'}
              >
                <ChevronRight size={24} />
              </button>
            )}

            {/* Main image */}
            <img
              src={getValidUrl(imageFiles[lightboxIndex]?.url)}
              alt={imageFiles[lightboxIndex]?.name}
              onClick={(e) => e.stopPropagation()}
              style={{
                maxHeight: '78vh', maxWidth: '90%',
                objectFit: 'contain', borderRadius: '4px',
                boxShadow: '0 8px 32px rgba(0,0,0,0.5)'
              }}
            />

            {/* Bottom info bar */}
            <div
              onClick={(e) => e.stopPropagation()}
              style={{
                position: 'absolute', bottom: 0, left: 0, right: 0,
                background: 'linear-gradient(transparent, rgba(0,0,0,0.7))',
                padding: '40px 24px 16px', color: '#fff'
              }}
            >
              <div className="d-flex justify-content-between align-items-end flex-wrap gap-2">
                <div>
                  <div style={{ fontWeight: '600', fontSize: '1rem' }}>
                    {imageFiles[lightboxIndex]?.name || 'Nimetön'}
                  </div>
                  {imageFiles[lightboxIndex]?.description && (
                    <div style={{ color: 'rgba(255,255,255,0.7)', fontSize: '0.85rem', marginTop: '2px' }}>
                      {imageFiles[lightboxIndex].description}
                    </div>
                  )}
                  <div style={{ color: 'rgba(255,255,255,0.5)', fontSize: '0.75rem', marginTop: '4px' }}>
                    {formatDate(imageFiles[lightboxIndex]?.uploadedAt)}
                  </div>
                </div>
                <div className="d-flex gap-2">
                  <Button variant="outline-light" size="sm"
                    onClick={(e) => { e.stopPropagation(); handleEdit(imageFiles[lightboxIndex]); }}
                    style={{ borderColor: 'rgba(255,255,255,0.4)' }}>
                    <PencilSquare size={14} className="me-1" />Muokkaa
                  </Button>
                  <Button variant="outline-light" size="sm"
                    href={getValidUrl(imageFiles[lightboxIndex]?.url)}
                    download onClick={(e) => e.stopPropagation()}>
                    <Download size={14} className="me-1" />Lataa
                  </Button>
                  <Button variant="outline-danger" size="sm"
                    onClick={(e) => {
                      e.stopPropagation();
                      setFileToDelete(imageFiles[lightboxIndex]?._id);
                      setShowDeleteConfirm(true);
                      setShowLightbox(false);
                    }}>
                    <Trash size={14} className="me-1" />Poista
                  </Button>
                </div>
              </div>
            </div>

          {/* ─── Inline Edit Side Panel ─── */}
          {showEditPanel && (
            <div
              onClick={(e) => e.stopPropagation()}
              style={{
                position: 'absolute', top: 0, right: 0, bottom: 0,
                width: '320px', maxWidth: '85vw',
                backgroundColor: 'rgba(30, 30, 30, 0.95)',
                borderLeft: '1px solid rgba(255,255,255,0.1)',
                padding: '20px',
                display: 'flex', flexDirection: 'column',
                zIndex: 1082,
                animation: 'slideInRight 0.25s ease'
              }}
            >
              <div className="d-flex justify-content-between align-items-center mb-3">
                <span style={{ color: '#fff', fontWeight: 600, fontSize: '0.9rem' }}>Muokkaa tietoja</span>
                <button
                  onClick={() => setShowEditPanel(false)}
                  style={{
                    background: 'rgba(255,255,255,0.1)', border: 'none', borderRadius: '50%',
                    width: 28, height: 28, display: 'flex', alignItems: 'center', justifyContent: 'center',
                    cursor: 'pointer'
                  }}
                >
                  <XLg size={12} color="#aaa" />
                </button>
              </div>

              <div className="mb-3">
                <label style={{ color: '#aaa', fontSize: '0.75rem', marginBottom: 4, display: 'block' }}>Nimi</label>
                <input
                  type="text"
                  value={editFormData.name}
                  onChange={(e) => setEditFormData({ ...editFormData, name: e.target.value })}
                  placeholder="Esim. Energiatodistus"
                  style={{
                    width: '100%', padding: '8px 10px', borderRadius: '6px',
                    border: '1px solid rgba(255,255,255,0.15)', backgroundColor: 'rgba(255,255,255,0.08)',
                    color: '#fff', fontSize: '0.85rem', outline: 'none'
                  }}
                  onFocus={(e) => e.target.style.borderColor = '#0d6efd'}
                  onBlur={(e) => e.target.style.borderColor = 'rgba(255,255,255,0.15)'}
                />
              </div>

              <div className="mb-3">
                <label style={{ color: '#aaa', fontSize: '0.75rem', marginBottom: 4, display: 'block' }}>Kuvaus</label>
                <textarea
                  value={editFormData.description}
                  onChange={(e) => setEditFormData({ ...editFormData, description: e.target.value })}
                  placeholder="Lisää tarkempi kuvaus..."
                  rows={3}
                  style={{
                    width: '100%', padding: '8px 10px', borderRadius: '6px',
                    border: '1px solid rgba(255,255,255,0.15)', backgroundColor: 'rgba(255,255,255,0.08)',
                    color: '#fff', fontSize: '0.85rem', outline: 'none', resize: 'vertical'
                  }}
                  onFocus={(e) => e.target.style.borderColor = '#0d6efd'}
                  onBlur={(e) => e.target.style.borderColor = 'rgba(255,255,255,0.15)'}
                />
                <small style={{ color: '#666', fontSize: '0.7rem' }}>Max 500 merkkiä</small>
              </div>

              <div className="d-flex gap-2 mt-auto">
                <button
                  onClick={() => setShowEditPanel(false)}
                  style={{
                    flex: 1, padding: '8px', borderRadius: '6px',
                    border: '1px solid rgba(255,255,255,0.2)', background: 'transparent',
                    color: '#aaa', fontSize: '0.8rem', cursor: 'pointer'
                  }}
                >
                  Peruuta
                </button>
                <button
                  onClick={handleSaveEdit}
                  disabled={saving}
                  style={{
                    flex: 1, padding: '8px', borderRadius: '6px',
                    border: 'none', background: '#0d6efd',
                    color: '#fff', fontSize: '0.8rem', cursor: saving ? 'wait' : 'pointer',
                    opacity: saving ? 0.7 : 1
                  }}
                >
                  {saving ? 'Tallennetaan...' : 'Tallenna'}
                </button>
              </div>
            </div>
          )}
          </div>

          <style>{`
            @keyframes slideInRight {
              from { transform: translateX(100%); opacity: 0; }
              to { transform: translateX(0); opacity: 1; }
            }
          `}</style>
        </Modal>
      )}

      {/* ═══════════ MODALS ═══════════ */}

      {/* Create Folder */}
      <Modal show={showCreateFolder} onHide={() => setShowCreateFolder(false)} centered size="sm">
        <Modal.Header closeButton>
          <Modal.Title style={{ fontSize: '1rem' }}>
            <FolderPlus className="me-2" />Uusi kansio
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form onSubmit={(e) => { e.preventDefault(); createFolder(); }}>
            <Form.Group>
              <Form.Label>Kansion nimi</Form.Label>
              <Form.Control type="text" placeholder="Esim. Energiatodistukset"
                value={newFolderName} onChange={(e) => setNewFolderName(e.target.value)}
                autoFocus maxLength={50} />
              <Form.Text className="text-muted" style={{ fontSize: '0.75rem' }}>
                Max 50 merkkiä. Ei erikoismerkkejä: / \ : * ? " &lt; &gt; |
              </Form.Text>
            </Form.Group>
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" size="sm" onClick={() => setShowCreateFolder(false)} disabled={creatingFolder}>
            Peruuta
          </Button>
          <Button variant="primary" size="sm" onClick={createFolder} disabled={creatingFolder || !validateFolderName(newFolderName).valid}>
            {creatingFolder ? <><Spinner animation="border" size="sm" className="me-1" />Luodaan...</> : 'Luo kansio'}
          </Button>
        </Modal.Footer>
      </Modal>

      {/* Rename Folder */}
      <Modal show={showRenameFolder} onHide={() => setShowRenameFolder(false)} centered size="sm">
        <Modal.Header closeButton>
          <Modal.Title style={{ fontSize: '1rem' }}>Nimeä kansio uudelleen</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form onSubmit={(e) => { e.preventDefault(); renameFolder(); }}>
            <Form.Group>
              <Form.Label>Uusi nimi</Form.Label>
              <Form.Control type="text" value={renameFolderName}
                onChange={(e) => setRenameFolderName(e.target.value)} autoFocus maxLength={50} />
              <Form.Text className="text-muted" style={{ fontSize: '0.75rem' }}>
                Max 50 merkkiä. Ei erikoismerkkejä: / \ : * ? " &lt; &gt; |
              </Form.Text>
            </Form.Group>
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" size="sm" onClick={() => setShowRenameFolder(false)}>Peruuta</Button>
          <Button variant="primary" size="sm" onClick={renameFolder} disabled={!validateFolderName(renameFolderName).valid}>Tallenna</Button>
        </Modal.Footer>
      </Modal>

      {/* Delete File */}
      {showDeleteConfirm && (
        <Modal show centered onHide={() => { setShowDeleteConfirm(false); setFileToDelete(null); }}>
          <Modal.Header closeButton>
            <Modal.Title>Vahvista poisto</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <p>Haluatko varmasti poistaa tiedoston <strong>{files.find(f => f._id === fileToDelete)?.name || 'tuntematon'}</strong>?</p>
            <Alert variant="warning" className="mb-0">
              <small>Tämä toiminto ei ole palautettavissa.</small>
            </Alert>
          </Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" onClick={() => { setShowDeleteConfirm(false); setFileToDelete(null); }} disabled={deleting}>Peruuta</Button>
            <Button variant="danger" onClick={deleteFile} disabled={deleting}>
              {deleting ? <><Spinner animation="border" size="sm" className="me-1" />Poistetaan...</> : <><Trash className="me-1" />Poista</>}
            </Button>
          </Modal.Footer>
        </Modal>
      )}

      {/* Delete Folder */}
      {showDeleteFolderConfirm && (
        <Modal show centered onHide={() => { setShowDeleteFolderConfirm(false); setFolderToDelete(null); }}>
          <Modal.Header closeButton>
            <Modal.Title>Vahvista kansion poisto</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <p>Haluatko varmasti poistaa kansion <strong>{folderToDelete?.name}</strong>?</p>
            <Alert variant="danger" className="mb-0">
              <small><strong>Varoitus:</strong> Kaikki kansion sisältämät tiedostot ja alikansiot poistetaan pysyvästi.</small>
            </Alert>
          </Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" onClick={() => { setShowDeleteFolderConfirm(false); setFolderToDelete(null); }} disabled={deleting}>Peruuta</Button>
            <Button variant="danger" onClick={deleteFolder} disabled={deleting}>
              {deleting ? <><Spinner animation="border" size="sm" className="me-1" />Poistetaan...</> : <><Trash className="me-1" />Poista kansio</>}
            </Button>
          </Modal.Footer>
        </Modal>
      )}
      {/* Edit File Modal */}
      {showEditModal && editingFile && (
        <Modal show centered onHide={() => { setShowEditModal(false); setEditingFile(null); }}>
          <Modal.Header closeButton>
            <Modal.Title style={{ fontSize: '1rem' }}>
              <PencilSquare className="me-2" />Muokkaa tiedostoa
            </Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <Form.Group className="mb-3">
              <Form.Label>Nimi</Form.Label>
              <Form.Control
                type="text" value={editFormData.name}
                onChange={(e) => setEditFormData({ ...editFormData, name: e.target.value })}
              />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Kuvaus</Form.Label>
              <Form.Control
                as="textarea" rows={3} value={editFormData.description}
                onChange={(e) => setEditFormData({ ...editFormData, description: e.target.value })}
              />
            </Form.Group>
          </Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" size="sm" onClick={() => { setShowEditModal(false); setEditingFile(null); }} disabled={saving}>
              Peruuta
            </Button>
            <Button variant="primary" size="sm" onClick={handleSaveEdit} disabled={saving}>
              {saving ? <><Spinner animation="border" size="sm" className="me-1" />Tallennetaan...</> : 'Tallenna'}
            </Button>
          </Modal.Footer>
        </Modal>
      )}
    </Container>
  );
};

export default DocumentsPage;
