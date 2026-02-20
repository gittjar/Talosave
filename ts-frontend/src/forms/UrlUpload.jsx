import React, { useState, useRef } from 'react';
import axios from 'axios';
import config from '../configuration/config.js';
import { toast } from 'react-toastify';
import { Form, Button, Card, ProgressBar } from 'react-bootstrap';
import { CloudArrowUp, FileEarmarkText } from 'react-bootstrap-icons';

const UrlUpload = ({ propertyId, onUpload }) => {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [file, setFile] = useState(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isUploading, setIsUploading] = useState(false);
  const formRef = useRef();

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

    const token = localStorage.getItem('userToken');

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

      formRef.current.reset();
      setFile(null);
      setName('');
      setDescription('');
      setUploadProgress(0);
      toast.success('Tiedosto ladattu onnistuneesti!');
      onUpload();
    } catch (error) {
      console.error('Upload error:', error);
      toast.error(error.response?.data?.error || 'Tiedoston lataus epäonnistui!');
    } finally {
      setIsUploading(false);
    }
  };

  const handleNameChange = (event) => {
    setName(event.target.value);
  };

  const handleDescriptionChange = (event) => {
    setDescription(event.target.value);
  };

  const handleFileChange = (event) => {
    const selectedFile = event.target.files[0];
    if (selectedFile) {
      setFile(selectedFile);
      if (!name) {
        setName(selectedFile.name.split('.')[0]);
      }
    }
  };

  return (
    <Card className="border-0 shadow-sm mb-4">
      <Card.Body className="p-4">
        <h5 className="mb-3">
          <CloudArrowUp size={20} className="me-2" />
          Lataa dokumentti
        </h5>
        
        <Form ref={formRef} onSubmit={submitFile}>
          <Form.Group className="mb-3">
            <Form.Label>Valitse tiedosto</Form.Label>
            <Form.Control 
              type="file" 
              onChange={handleFileChange}
              accept=".pdf,.doc,.docx,.xls,.xlsx,.png,.jpg,.jpeg"
              required
              disabled={isUploading}
            />
            <Form.Text className="text-muted">
              Tuetut tiedostotyypit: PDF, Word, Excel, kuvat (max 10MB)
            </Form.Text>
          </Form.Group>

          <Form.Group className="mb-3">
            <Form.Label>Dokumentin nimi</Form.Label>
            <Form.Control 
              type="text" 
              value={name}
              onChange={handleNameChange} 
              placeholder="Esim. Energiatodistus" 
              required
              disabled={isUploading}
            />
          </Form.Group>

          <Form.Group className="mb-3">
            <Form.Label>Kuvaus</Form.Label>
            <Form.Control 
              as="textarea"
              rows={3}
              value={description}
              onChange={handleDescriptionChange} 
              placeholder="Kerro lyhyesti mitä dokumentti sisältää..."
              disabled={isUploading}
            />
          </Form.Group>

          {isUploading && (
            <div className="mb-3">
              <ProgressBar 
                now={uploadProgress} 
                label={`${uploadProgress}%`}
                animated
                variant="success"
              />
            </div>
          )}

          <Button 
            variant="primary" 
            type="submit" 
            className="w-100"
            disabled={isUploading}
          >
            <CloudArrowUp size={20} className="me-2" />
            {isUploading ? 'Ladataan...' : 'Lataa tiedosto'}
          </Button>
        </Form>
      </Card.Body>
    </Card>
  );
};

export default UrlUpload;
