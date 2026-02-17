import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import config from '../configuration/config';
import { toast } from 'react-toastify';
import { Container, Card, Row, Col, Button, Badge, Alert, ButtonGroup, Table, Modal, Form, Spinner, Breadcrumb, ListGroup } from 'react-bootstrap';
import { FolderFill, FolderPlus, Trash, FileEarmarkText, InfoCircle, Download, EyeFill, Grid3x3GapFill, ListUl, ArrowLeft, PencilSquare, Folder2Open, ThreeDotsVertical, HouseFill } from 'react-bootstrap-icons';
import DeleteConfirmation from '../notifications/DeleteConfirmation';
import DocumentUpload from '../forms/DocumentUpload';

const DocumentsPage = ({ propertyId }) => {
  const [files, setFiles] = useState([]);
  const [folders, setFolders] = useState([]);
  const [currentFolderId, setCurrentFolderId] = useState(null);
  const [folderPath, setFolderPath] = useState([]); // breadcrumb trail [{_id, name}, ...]
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

  const [viewMode, setViewMode] = useState('cards');

  const token = localStorage.getItem('token') || localStorage.getItem('userToken');

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

  // Navigation
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

  // Folder CRUD
  const createFolder = async () => {
    if (!newFolderName.trim()) return;
    try {
      setCreatingFolder(true);
      await axios.post(`${config.baseURL}/api/folders`, {
        name: newFolderName.trim(),
        propertyId,
        parentFolderId: currentFolderId
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      toast.success('Kansio luotu');
      setNewFolderName('');
      setShowCreateFolder(false);
      fetchContents();
    } catch (err) {
      console.error('Error creating folder:', err);
      toast.error('Kansion luonti epäonnistui');
    } finally {
      setCreatingFolder(false);
    }
  };

  const renameFolder = async () => {
    if (!renameFolderName.trim() || !renamingFolder) return;
    try {
      await axios.put(`${config.baseURL}/api/folders/${renamingFolder._id}`, {
        name: renameFolderName.trim()
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      toast.success('Kansio nimetty uudelleen');
      setShowRenameFolder(false);
      setRenamingFolder(null);
      fetchContents();
    } catch (err) {
      console.error('Error renaming folder:', err);
      toast.error('Kansion nimeäminen epäonnistui');
    }
  };

  const deleteFolder = async () => {
    if (!folderToDelete) return;
    try {
      setDeleting(true);
      await axios.delete(`${config.baseURL}/api/folders/${folderToDelete._id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      toast.success('Kansio ja sen sisältö poistettu');
      setShowDeleteFolderConfirm(false);
      setFolderToDelete(null);
      fetchContents();
    } catch (err) {
      console.error('Error deleting folder:', err);
      toast.error('Kansion poisto epäonnistui');
    } finally {
      setDeleting(false);
    }
  };

  // File delete
  const deleteFile = async () => {
    if (!fileToDelete) return;
    try {
      setDeleting(true);
      await axios.delete(`${config.baseURL}/api/files/${fileToDelete}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      toast.success('Tiedosto poistettu');
      setShowDeleteConfirm(false);
      setFileToDelete(null);
      fetchContents();
    } catch (err) {
      console.error('Error deleting file:', err);
      toast.error('Tiedoston poisto epäonnistui');
    } finally {
      setDeleting(false);
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('fi-FI', {
      year: 'numeric',
      month: 'numeric',
      day: 'numeric'
    });
  };

  const getValidUrl = (url) => {
    if (url && !url.match(/^https?:\/\//i)) {
      return 'https://' + url;
    }
    return url;
  };

  const totalItems = folders.length + files.length;

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
            Hallitse dokumenttejasi kansioissa. Lataa tiedostoja, kuvia ja muuta.
          </p>
        </Col>
      </Row>

      {/* Breadcrumb + Actions bar */}
      <div className="d-flex justify-content-between align-items-center mb-3 flex-wrap gap-2" style={{ backgroundColor: '#f8f9fa', padding: '8px 12px', borderRadius: '6px' }}>
        <div className="d-flex align-items-center gap-2 flex-wrap">
          {folderPath.length > 0 && (
            <Button variant="outline-secondary" size="sm" onClick={navigateBack} style={{ padding: '3px 8px' }}>
              <ArrowLeft size={14} />
            </Button>
          )}
          <Breadcrumb className="mb-0" style={{ fontSize: '0.85rem' }}>
            <Breadcrumb.Item
              onClick={navigateToRoot}
              active={folderPath.length === 0}
              style={{ cursor: folderPath.length > 0 ? 'pointer' : 'default' }}
            >
              <HouseFill size={12} className="me-1" />
              Juuri
            </Breadcrumb.Item>
            {folderPath.map((folder, index) => (
              <Breadcrumb.Item
                key={folder._id}
                onClick={() => navigateToBreadcrumb(index)}
                active={index === folderPath.length - 1}
                style={{ cursor: index < folderPath.length - 1 ? 'pointer' : 'default' }}
              >
                {folder.name}
              </Breadcrumb.Item>
            ))}
          </Breadcrumb>
        </div>
        <div className="d-flex align-items-center gap-2">
          <Button
            variant="outline-primary"
            size="sm"
            onClick={() => { setShowCreateFolder(true); setNewFolderName(''); }}
          >
            <FolderPlus size={14} className="me-1" />
            Uusi kansio
          </Button>
          <ButtonGroup size="sm">
            <Button
              variant={viewMode === 'cards' ? 'primary' : 'outline-secondary'}
              onClick={() => setViewMode('cards')}
            >
              <Grid3x3GapFill size={12} />
            </Button>
            <Button
              variant={viewMode === 'list' ? 'primary' : 'outline-secondary'}
              onClick={() => setViewMode('list')}
            >
              <ListUl size={12} />
            </Button>
          </ButtonGroup>
        </div>
      </div>

      {/* Upload area */}
      <Row className="mb-3">
        <Col lg={8} xl={6}>
          <DocumentUpload
            propertyId={propertyId}
            folderId={currentFolderId}
            onUpload={fetchContents}
          />
        </Col>
      </Row>

      {/* Loading */}
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
        /* Card view */
        <Row className="g-3">
          {/* Folders first */}
          {folders.map(folder => (
            <Col key={folder._id} xs={6} sm={4} md={3} lg={2}>
              <Card
                className="h-100 border-0 shadow-sm text-center"
                style={{ cursor: 'pointer', transition: 'all 0.2s', borderRadius: '8px' }}
                onMouseEnter={(e) => { e.currentTarget.style.transform = 'translateY(-3px)'; e.currentTarget.style.boxShadow = '0 6px 16px rgba(0,0,0,0.12)'; }}
                onMouseLeave={(e) => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = ''; }}
                onDoubleClick={() => navigateToFolder(folder)}
                onClick={() => navigateToFolder(folder)}
              >
                <Card.Body className="d-flex flex-column align-items-center py-3 px-2">
                  <FolderFill size={40} className="text-warning mb-2" />
                  <div
                    style={{
                      fontWeight: '600',
                      fontSize: '0.8rem',
                      wordBreak: 'break-word',
                      lineHeight: '1.2',
                      maxHeight: '2.4rem',
                      overflow: 'hidden',
                      display: '-webkit-box',
                      WebkitLineClamp: 2,
                      WebkitBoxOrient: 'vertical'
                    }}
                    title={folder.name}
                  >
                    {folder.name}
                  </div>
                  <div className="mt-auto pt-2 d-flex gap-1">
                    <Button
                      variant="outline-secondary"
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        setRenamingFolder(folder);
                        setRenameFolderName(folder.name);
                        setShowRenameFolder(true);
                      }}
                      style={{ padding: '1px 5px', fontSize: '0.65rem', lineHeight: 1 }}
                    >
                      <PencilSquare size={10} />
                    </Button>
                    <Button
                      variant="outline-danger"
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        setFolderToDelete(folder);
                        setShowDeleteFolderConfirm(true);
                      }}
                      style={{ padding: '1px 5px', fontSize: '0.65rem', lineHeight: 1 }}
                    >
                      <Trash size={10} />
                    </Button>
                  </div>
                </Card.Body>
              </Card>
            </Col>
          ))}

          {/* Files */}
          {files.map(file => {
            const validUrl = getValidUrl(file.url);
            return (
              <Col key={file._id} xs={12} md={6} lg={4}>
                <Card className="h-100 border-0 shadow-sm">
                  <Card.Body className="d-flex flex-column">
                    <div className="mb-2">
                      <FileEarmarkText size={28} className="text-primary" />
                    </div>
                    <h6 className="mb-1" style={{ fontWeight: '600' }}>{file.name}</h6>
                    {file.description && file.description.trim() !== '' && (
                      <p className="text-muted mb-1" style={{
                        display: '-webkit-box',
                        WebkitLineClamp: 2,
                        WebkitBoxOrient: 'vertical',
                        overflow: 'hidden',
                        fontSize: '0.8rem'
                      }}>
                        {file.description}
                      </p>
                    )}
                    <p className="text-muted mb-2" style={{ fontSize: '0.75rem' }}>
                      {formatDate(file.uploadedAt)}
                    </p>
                    <div className="mt-auto d-flex gap-2">
                      <Button
                        variant="outline-primary"
                        size="sm"
                        href={validUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex-grow-1"
                        style={{ fontSize: '0.75rem' }}
                      >
                        <EyeFill size={12} className="me-1" />
                        Esikatsele
                      </Button>
                      <Button
                        variant="primary"
                        size="sm"
                        href={validUrl}
                        download
                        className="flex-grow-1"
                        style={{ fontSize: '0.75rem' }}
                      >
                        <Download size={12} className="me-1" />
                        Lataa
                      </Button>
                      <Button
                        variant="outline-danger"
                        size="sm"
                        onClick={() => {
                          setFileToDelete(file._id);
                          setShowDeleteConfirm(true);
                        }}
                        style={{ fontSize: '0.75rem' }}
                      >
                        <Trash size={12} />
                      </Button>
                    </div>
                  </Card.Body>
                </Card>
              </Col>
            );
          })}
        </Row>
      ) : (
        /* List view */
        <ListGroup>
          {/* Folders */}
          {folders.map(folder => (
            <ListGroup.Item
              key={folder._id}
              className="d-flex justify-content-between align-items-center"
              style={{ cursor: 'pointer', padding: '0.5rem 0.75rem' }}
              onClick={() => navigateToFolder(folder)}
              onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#f8f9fa'}
              onMouseLeave={(e) => e.currentTarget.style.backgroundColor = ''}
            >
              <div className="d-flex align-items-center gap-2">
                <FolderFill size={20} className="text-warning flex-shrink-0" />
                <span style={{ fontWeight: '600', fontSize: '0.85rem' }}>{folder.name}</span>
              </div>
              <div className="d-flex gap-1">
                <span style={{ fontSize: '0.7rem', color: '#888', backgroundColor: '#f7f7f7', padding: '1px 6px', borderRadius: '8px', border: '1px solid #e8e8e8', marginRight: '6px' }}>
                  {formatDate(folder.createdAt)}
                </span>
                <Button
                  variant="outline-secondary"
                  size="sm"
                  onClick={(e) => {
                    e.stopPropagation();
                    setRenamingFolder(folder);
                    setRenameFolderName(folder.name);
                    setShowRenameFolder(true);
                  }}
                  style={{ borderRadius: '4px', padding: '2px 6px', fontSize: '0.7rem', lineHeight: 1 }}
                >
                  <PencilSquare size={10} />
                </Button>
                <Button
                  variant="outline-danger"
                  size="sm"
                  onClick={(e) => {
                    e.stopPropagation();
                    setFolderToDelete(folder);
                    setShowDeleteFolderConfirm(true);
                  }}
                  style={{ borderRadius: '4px', padding: '2px 6px', fontSize: '0.7rem', lineHeight: 1 }}
                >
                  <Trash size={10} />
                </Button>
              </div>
            </ListGroup.Item>
          ))}
          {/* Files */}
          {files.map(file => {
            const validUrl = getValidUrl(file.url);
            return (
              <ListGroup.Item
                key={file._id}
                className="d-flex justify-content-between align-items-center"
                style={{ padding: '0.5rem 0.75rem' }}
              >
                <div className="d-flex align-items-center gap-2 flex-grow-1" style={{ minWidth: 0 }}>
                  <FileEarmarkText size={18} className="text-primary flex-shrink-0" />
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
                  <span style={{ fontSize: '0.7rem', color: '#888', backgroundColor: '#f7f7f7', padding: '1px 6px', borderRadius: '8px', border: '1px solid #e8e8e8' }}>
                    {formatDate(file.uploadedAt)}
                  </span>
                  <Button
                    variant="outline-primary"
                    size="sm"
                    href={validUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{ borderRadius: '4px', padding: '2px 6px', fontSize: '0.7rem', lineHeight: 1 }}
                  >
                    <EyeFill size={10} />
                  </Button>
                  <Button
                    variant="primary"
                    size="sm"
                    href={validUrl}
                    download
                    style={{ borderRadius: '4px', padding: '2px 6px', fontSize: '0.7rem', lineHeight: 1 }}
                  >
                    <Download size={10} />
                  </Button>
                  <Button
                    variant="outline-danger"
                    size="sm"
                    onClick={() => {
                      setFileToDelete(file._id);
                      setShowDeleteConfirm(true);
                    }}
                    style={{ borderRadius: '4px', padding: '2px 6px', fontSize: '0.7rem', lineHeight: 1 }}
                  >
                    <Trash size={10} />
                  </Button>
                </div>
              </ListGroup.Item>
            );
          })}
        </ListGroup>
      )}

      {/* Create Folder Modal */}
      <Modal show={showCreateFolder} onHide={() => setShowCreateFolder(false)} centered size="sm">
        <Modal.Header closeButton>
          <Modal.Title style={{ fontSize: '1rem' }}>
            <FolderPlus className="me-2" />
            Uusi kansio
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form onSubmit={(e) => { e.preventDefault(); createFolder(); }}>
            <Form.Group>
              <Form.Label>Kansion nimi</Form.Label>
              <Form.Control
                type="text"
                placeholder="Esim. Energiatodistukset"
                value={newFolderName}
                onChange={(e) => setNewFolderName(e.target.value)}
                autoFocus
                maxLength={100}
              />
            </Form.Group>
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" size="sm" onClick={() => setShowCreateFolder(false)} disabled={creatingFolder}>
            Peruuta
          </Button>
          <Button variant="primary" size="sm" onClick={createFolder} disabled={creatingFolder || !newFolderName.trim()}>
            {creatingFolder ? <><Spinner animation="border" size="sm" className="me-1" />Luodaan...</> : 'Luo kansio'}
          </Button>
        </Modal.Footer>
      </Modal>

      {/* Rename Folder Modal */}
      <Modal show={showRenameFolder} onHide={() => setShowRenameFolder(false)} centered size="sm">
        <Modal.Header closeButton>
          <Modal.Title style={{ fontSize: '1rem' }}>Nimeä kansio uudelleen</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form onSubmit={(e) => { e.preventDefault(); renameFolder(); }}>
            <Form.Group>
              <Form.Label>Uusi nimi</Form.Label>
              <Form.Control
                type="text"
                value={renameFolderName}
                onChange={(e) => setRenameFolderName(e.target.value)}
                autoFocus
                maxLength={100}
              />
            </Form.Group>
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" size="sm" onClick={() => setShowRenameFolder(false)}>
            Peruuta
          </Button>
          <Button variant="primary" size="sm" onClick={renameFolder} disabled={!renameFolderName.trim()}>
            Tallenna
          </Button>
        </Modal.Footer>
      </Modal>

      {/* Delete File Confirmation */}
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
            <Button variant="secondary" onClick={() => { setShowDeleteConfirm(false); setFileToDelete(null); }} disabled={deleting}>
              Peruuta
            </Button>
            <Button variant="danger" onClick={deleteFile} disabled={deleting}>
              {deleting ? <><Spinner animation="border" size="sm" className="me-1" />Poistetaan...</> : <><Trash className="me-1" />Poista</>}
            </Button>
          </Modal.Footer>
        </Modal>
      )}

      {/* Delete Folder Confirmation */}
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
            <Button variant="secondary" onClick={() => { setShowDeleteFolderConfirm(false); setFolderToDelete(null); }} disabled={deleting}>
              Peruuta
            </Button>
            <Button variant="danger" onClick={deleteFolder} disabled={deleting}>
              {deleting ? <><Spinner animation="border" size="sm" className="me-1" />Poistetaan...</> : <><Trash className="me-1" />Poista kansio</>}
            </Button>
          </Modal.Footer>
        </Modal>
      )}
    </Container>
  );
};

export default DocumentsPage;
