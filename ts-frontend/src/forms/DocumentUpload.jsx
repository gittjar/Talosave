import React, { useState, useRef } from 'react';
import axios from 'axios';
import config from '../configuration/config.js';
import { toast } from 'react-toastify';
import { Form, Button, Card, ProgressBar, Badge, Row, Col } from 'react-bootstrap';
import { CloudArrowUp, FileEarmarkText, XCircleFill, CheckCircleFill, ExclamationCircleFill } from 'react-bootstrap-icons';

const DocumentUpload = ({ propertyId, folderId, onUpload }) => {
  const [files, setFiles] = useState([]); // Array of { file, name, description, status, progress }
  const [isUploading, setIsUploading] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const fileInputRef = useRef();

  const token = localStorage.getItem('token') || localStorage.getItem('userToken');

  const handleFilesChange = (event) => {
    const selectedFiles = Array.from(event.target.files);
    const maxSize = 10 * 1024 * 1024;
    const newFiles = [];
    let rejected = 0;

    selectedFiles.forEach((f) => {
      if (f.size > maxSize) {
        rejected++;
        return;
      }
      newFiles.push({
        id: Date.now() + Math.random(),
        file: f,
        name: f.name.split('.').slice(0, -1).join('.') || f.name,
        description: '',
        status: 'pending', // pending | uploading | done | error
        progress: 0
      });
    });

    if (rejected > 0) {
      toast.error(`${rejected} tiedosto${rejected > 1 ? 'a' : ''} liian suuri (max 10MB)`);
    }
    if (newFiles.length > 0) {
      setFiles(prev => [...prev, ...newFiles]);
    }
    // Reset input so same files can be re-selected
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const removeFile = (id) => {
    setFiles(prev => prev.filter(f => f.id !== id));
  };

  const updateFile = (id, updates) => {
    setFiles(prev => prev.map(f => f.id === id ? { ...f, ...updates } : f));
  };

  const submitFiles = async (event) => {
    event.preventDefault();

    const pendingFiles = files.filter(f => f.status === 'pending');
    if (pendingFiles.length === 0) {
      toast.error('Ei ladattavia tiedostoja');
      return;
    }

    setIsUploading(true);
    let successCount = 0;
    let errorCount = 0;

    for (const item of pendingFiles) {
      updateFile(item.id, { status: 'uploading', progress: 0 });

      const formData = new FormData();
      formData.append('file', item.file);
      formData.append('name', item.name);
      formData.append('description', item.description);
      formData.append('propertyId', propertyId);
      if (folderId) formData.append('folderId', folderId);

      try {
        await axios.post(`${config.baseURL}/api/upload-file`, formData, {
          headers: {
            'Content-Type': 'multipart/form-data',
            'Authorization': `Bearer ${token}`
          },
          onUploadProgress: (progressEvent) => {
            const pct = Math.round((progressEvent.loaded * 100) / progressEvent.total);
            updateFile(item.id, { progress: pct });
          }
        });
        updateFile(item.id, { status: 'done', progress: 100 });
        successCount++;
      } catch (error) {
        console.error('Upload error:', error);
        updateFile(item.id, { status: 'error', progress: 0 });
        errorCount++;
        
        // Handle quota exceeded error
        if (error.response?.status === 413) {
          const message = error.response.data?.error || 'Tallennustila täynnä';
          toast.error(message, { autoClose: 5000 });
          // Stop uploading remaining files
          break;
        }
      }
    }

    setIsUploading(false);

    if (successCount > 0) {
      toast.success(`${successCount} tiedosto${successCount > 1 ? 'a' : ''} ladattu onnistuneesti!`);
      if (onUpload) onUpload();
    }
    if (errorCount > 0) {
      toast.error(`${errorCount} tiedoston lataus epäonnistui`);
    }

    // Remove completed files after a short delay
    setTimeout(() => {
      setFiles(prev => prev.filter(f => f.status !== 'done'));
      // If all done, close form
      setFiles(prev => {
        if (prev.length === 0) setShowForm(false);
        return prev;
      });
    }, 1500);
  };

  const resetForm = () => {
    setFiles([]);
    setShowForm(false);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const pendingCount = files.filter(f => f.status === 'pending').length;

  if (!showForm) {
    return (
      <div className="mb-3">
        <Button variant="primary" size="sm" onClick={() => setShowForm(true)}>
          <CloudArrowUp size={16} className="me-2" />
          Lataa tiedostoja
        </Button>
      </div>
    );
  }

  return (
    <Card className="border shadow-sm mb-3" style={{ borderRadius: '6px' }}>
      <Card.Body className="p-3">
        <div className="d-flex justify-content-between align-items-center mb-2">
          <h6 className="mb-0">
            <CloudArrowUp size={16} className="me-2" />
            Lataa dokumentteja
            {files.length > 0 && (
              <Badge bg="primary" className="ms-2" style={{ fontSize: '0.7rem' }}>{files.length}</Badge>
            )}
          </h6>
          <Button variant="link" size="sm" className="text-muted p-0" onClick={resetForm}>
            Peruuta
          </Button>
        </div>

        <Form onSubmit={submitFiles}>
          {/* File input - always visible for adding more */}
          <Form.Group className="mb-2">
            <Form.Control
              ref={fileInputRef}
              type="file"
              onChange={handleFilesChange}
              accept=".pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.png,.jpg,.jpeg,.gif,.webp,.heic,.heif,.zip,.rar"
              disabled={isUploading}
              size="sm"
              multiple
            />
            <Form.Text className="text-muted" style={{ fontSize: '0.7rem' }}>
              PDF, Word, Excel, PowerPoint, kuvat, arkistot (max 10MB / tiedosto). Voit valita useita kerralla.
            </Form.Text>
          </Form.Group>

          {/* File list */}
          {files.length > 0 && (
            <div className="mb-2" style={{ maxHeight: '300px', overflowY: 'auto' }}>
              {files.map((item) => (
                <div
                  key={item.id}
                  className="mb-2 p-2"
                  style={{
                    backgroundColor: item.status === 'done' ? '#d4edda' : item.status === 'error' ? '#f8d7da' : '#f8f9fa',
                    borderRadius: '6px', border: '1px solid #e9ecef',
                    transition: 'background-color 0.3s'
                  }}
                >
                  {/* File header row */}
                  <div className="d-flex align-items-center gap-2 mb-1" style={{ fontSize: '0.8rem' }}>
                    {item.status === 'done' ? (
                      <CheckCircleFill size={14} className="text-success flex-shrink-0" />
                    ) : item.status === 'error' ? (
                      <ExclamationCircleFill size={14} className="text-danger flex-shrink-0" />
                    ) : (
                      <FileEarmarkText size={14} className="text-primary flex-shrink-0" />
                    )}
                    <span className="text-truncate" style={{ flex: 1 }}>{item.file.name}</span>
                    <Badge bg="secondary" style={{ fontSize: '0.6rem' }}>
                      {(item.file.size / 1024).toFixed(0)} KB
                    </Badge>
                    {item.status === 'pending' && !isUploading && (
                      <XCircleFill
                        size={14}
                        className="text-danger flex-shrink-0"
                        style={{ cursor: 'pointer' }}
                        onClick={() => removeFile(item.id)}
                      />
                    )}
                  </div>

                  {/* Name and description inputs - only for pending */}
                  {item.status === 'pending' && (
                    <Row className="g-1 mb-1">
                      <Col sm={6}>
                        <Form.Control
                          type="text"
                          value={item.name}
                          onChange={(e) => updateFile(item.id, { name: e.target.value })}
                          placeholder="Nimi"
                          disabled={isUploading}
                          size="sm"
                          style={{ fontSize: '0.75rem' }}
                        />
                      </Col>
                      <Col sm={6}>
                        <Form.Control
                          type="text"
                          value={item.description}
                          onChange={(e) => updateFile(item.id, { description: e.target.value })}
                          placeholder="Kuvaus (valinnainen)"
                          disabled={isUploading}
                          size="sm"
                          style={{ fontSize: '0.75rem' }}
                        />
                      </Col>
                    </Row>
                  )}

                  {/* Progress bar during upload */}
                  {item.status === 'uploading' && (
                    <ProgressBar
                      now={item.progress}
                      label={`${item.progress}%`}
                      animated
                      variant="success"
                      style={{ height: '14px', fontSize: '0.65rem' }}
                    />
                  )}
                </div>
              ))}
            </div>
          )}

          <Button
            variant="success"
            type="submit"
            size="sm"
            disabled={isUploading || pendingCount === 0}
          >
            <CloudArrowUp size={14} className="me-1" />
            {isUploading
              ? 'Ladataan...'
              : pendingCount > 1
                ? `Lataa ${pendingCount} tiedostoa`
                : 'Lataa'}
          </Button>
        </Form>
      </Card.Body>
    </Card>
  );
};

export default DocumentUpload;
