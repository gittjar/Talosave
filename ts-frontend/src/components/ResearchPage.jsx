import React, { useState, useEffect } from 'react';
import axios from 'axios';
import UrlUpload from '../forms/UrlUpload';
import config from '../configuration/config';
import { toast } from 'react-toastify';
import { Container, Card, Row, Col, Button, Badge, Alert } from 'react-bootstrap';
import { Link45deg, Trash, FileEarmarkText, InfoCircle } from 'react-bootstrap-icons';
import DeleteConfirmation from '../notifications/DeleteConfirmation';

const ResearchPage = ({ propertyId }) => {
  const [files, setFiles] = useState([]);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [fileToDelete, setFileToDelete] = useState(null);

  const fetchFiles = async () => {
    try {
      const response = await axios.get(`${config.baseURL}/api/files`, {
        params: {
          propertyId: propertyId,
        },
      });
      setFiles(response.data);
    } catch (err) {
      console.error(err);
    }
  };

  const deleteFile = async () => {
    try {
      await axios.delete(`${config.baseURL}/api/files/${fileToDelete}`);
      fetchFiles();
      toast.success('Linkki poistettu onnistuneesti');
    } catch (err) {
      console.error(err);
      toast.error('Virhe poistettaessa linkkiä');
    }
  };

  useEffect(() => {
    fetchFiles();
  }, [propertyId]);

  return (
    <Container fluid className="py-4">
      <Row className="mb-4">
        <Col>
          <h2 className="h3 mb-2">
            <FileEarmarkText size={28} className="me-2 text-primary" />
            Tutkimukset ja dokumentit
          </h2>
          <p className="text-muted">
            Lataa tärkeät dokumentit pilvipalveluun talteen.
          </p>
        </Col>
      </Row>

      <Row className="mb-4">
        <Col lg={8} xl={6}>
          <UrlUpload propertyId={propertyId} onUpload={fetchFiles} />
        </Col>
      </Row>

      <Row>
        <Col>
          <h4 className="mb-3">
            <FileEarmarkText size={20} className="me-2" />
            Tallennetut tiedostot
            <Badge bg="primary" className="ms-2">{files.length}</Badge>
          </h4>
          
          {files.length === 0 ? (
            <Alert variant="info" className="d-flex align-items-center">
              <InfoCircle size={24} className="me-3" />
              <div>
                <strong>Ei tallennettuja tiedostoja</strong>
                <br />
                <small>Lataa ensimmäinen dokumentti yllä olevalla lomakkeella</small>
              </div>
            </Alert>
          ) : (
            <Row className="g-3">
              {files.map(file => {
                let validUrl = file.url;
                if (validUrl && !validUrl.match(/^https?:\/\//i)) {
                  validUrl = 'https://' + validUrl;
                }
                
                return (
                  <Col key={file._id} xs={12} md={6} lg={4}>
                    <Card className="h-100 border-0 shadow-sm hover-lift">
                      <Card.Body className="d-flex flex-column">
                        <div className="mb-3">
                          <FileEarmarkText size={32} className="text-primary" />
                        </div>
                        <h5 className="mb-2">{file.name}</h5>
                        {file.description && (
                          <p className="text-muted small mb-2" style={{
                            display: '-webkit-box',
                            WebkitLineClamp: 2,
                            WebkitBoxOrient: 'vertical',
                            overflow: 'hidden'
                          }}>
                            {file.description}
                          </p>
                        )}
                        <p className="text-muted small mb-3">
                          <small>Ladattu: {new Date(file.uploadedAt).toLocaleDateString('fi-FI')}</small>
                        </p>
                        <div className="mt-auto d-flex gap-2">
                          <Button 
                            variant="primary" 
                            size="sm" 
                            href={validUrl} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="flex-grow-1"
                          >
                            <FileEarmarkText size={16} className="me-1" />
                            Avaa tiedosto
                          </Button>
                          <Button 
                            variant="outline-danger" 
                            size="sm"
                            onClick={() => { 
                              setFileToDelete(file._id); 
                              setShowDeleteConfirm(true); 
                            }}
                          >
                            <Trash size={16} />
                          </Button>
                        </div>
                      </Card.Body>
                    </Card>
                  </Col>
                );
              })}
            </Row>
          )}
        </Col>
      </Row>

      {showDeleteConfirm && (
        <DeleteConfirmation 
          handleDeleteProperty={deleteFile} 
          setShowDeleteConfirm={setShowDeleteConfirm} 
          fileName={files.find(file => file._id === fileToDelete)?.name} 
        />
      )}
    </Container>
  );
};

export default ResearchPage;