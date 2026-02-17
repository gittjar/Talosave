import React, { useState, useRef } from 'react';
import axios from 'axios';
import config from '../configuration/config.js';
import { toast } from 'react-toastify';
import { Form, Button, Card, ProgressBar, Badge, Row, Col } from 'react-bootstrap';
import { CloudArrowUp, FileEarmarkText, XCircleFill } from 'react-bootstrap-icons';

const DocumentUpload = ({ propertyId, folderId, onUpload }) => {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [file, setFile] = useState(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isUploading, setIsUploading] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const formRef = useRef();

  const token = localStorage.getItem('token') || localStorage.getItem('userToken');

  const submitFile = async (event) => {
    event.preventDefault();

    if (!file) {
      toast.error('Valitse tiedosto ensin!');
      return;
    }

    const formData = new FormData();
    formData.append('file', file);
    formData.append('name', name);
    formData.append('description', description);
    formData.append('propertyId', propertyId);
    if (folderId) {
      formData.append('folderId', folderId);
    }

    setIsUploading(true);
    setUploadProgress(0);

    try {
      await axios.post(`${config.baseURL}/api/upload-file`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
          'Authorization': `Bearer ${token}`
        },
        onUploadProgress: (progressEvent) => {
          const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
          setUploadProgress(percentCompleted);
        }
      });

      resetForm();
      toast.success('Tiedosto ladattu onnistuneesti!');
      if (onUpload) onUpload();
    } catch (error) {
      console.error('Upload error:', error);
      toast.error(error.response?.data?.error || 'Tiedoston lataus epäonnistui!');
    } finally {
      setIsUploading(false);
      setUploadProgress(0);
    }
  };

  const handleFileChange = (event) => {
    const selectedFile = event.target.files[0];
    if (selectedFile) {
      if (selectedFile.size > 10 * 1024 * 1024) {
        toast.error('Tiedosto on liian suuri (max 10MB)');
        return;
      }
      setFile(selectedFile);
      if (!name) {
        setName(selectedFile.name.split('.').slice(0, -1).join('.') || selectedFile.name);
      }
    }
  };

  const resetForm = () => {
    setFile(null);
    setName('');
    setDescription('');
    setShowForm(false);
    setUploadProgress(0);
    if (formRef.current) formRef.current.reset();
  };

  if (!showForm) {
    return (
      <div className="mb-3">
        <Button variant="primary" size="sm" onClick={() => setShowForm(true)}>
          <CloudArrowUp size={16} className="me-2" />
          Lataa tiedosto
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
            Lataa dokumentti
          </h6>
          <Button variant="link" size="sm" className="text-muted p-0" onClick={resetForm}>
            Peruuta
          </Button>
        </div>

        <Form ref={formRef} onSubmit={submitFile}>
          <Form.Group className="mb-2">
            <Form.Control
              type="file"
              onChange={handleFileChange}
              accept=".pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.png,.jpg,.jpeg,.gif,.webp,.heic,.heif,.zip,.rar"
              required
              disabled={isUploading}
              size="sm"
            />
            <Form.Text className="text-muted" style={{ fontSize: '0.7rem' }}>
              PDF, Word, Excel, PowerPoint, kuvat, arkistot (max 10MB)
            </Form.Text>
          </Form.Group>

          {file && (
            <div className="mb-2 d-flex align-items-center gap-2 p-2" style={{ backgroundColor: '#f8f9fa', borderRadius: '4px', fontSize: '0.8rem' }}>
              <FileEarmarkText size={16} className="text-primary flex-shrink-0" />
              <span className="text-truncate">{file.name}</span>
              <Badge bg="secondary" style={{ fontSize: '0.65rem' }}>{(file.size / 1024).toFixed(0)} KB</Badge>
              <XCircleFill
                size={14}
                className="text-danger ms-auto flex-shrink-0"
                style={{ cursor: 'pointer' }}
                onClick={() => { setFile(null); if (formRef.current) formRef.current.reset(); }}
              />
            </div>
          )}

          <Row className="g-2 mb-2">
            <Col sm={6}>
              <Form.Control
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Dokumentin nimi"
                required
                disabled={isUploading}
                size="sm"
              />
            </Col>
            <Col sm={6}>
              <Form.Control
                type="text"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Kuvaus (valinnainen)"
                disabled={isUploading}
                size="sm"
              />
            </Col>
          </Row>

          {isUploading && (
            <ProgressBar
              now={uploadProgress}
              label={`${uploadProgress}%`}
              animated
              variant="success"
              className="mb-2"
              style={{ height: '18px' }}
            />
          )}

          <Button
            variant="success"
            type="submit"
            size="sm"
            disabled={isUploading || !file}
          >
            <CloudArrowUp size={14} className="me-1" />
            {isUploading ? 'Ladataan...' : 'Lataa'}
          </Button>
        </Form>
      </Card.Body>
    </Card>
  );
};

export default DocumentUpload;
