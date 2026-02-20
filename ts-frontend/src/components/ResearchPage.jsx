import React, { useState, useEffect } from 'react';
import axios from 'axios';
import UrlUpload from '../forms/UrlUpload';
import config from '../configuration/config';
import { toast } from 'react-toastify';
import { Container, Card, Row, Col, Button, Badge, Alert, ButtonGroup, Table } from 'react-bootstrap';
import { Link45deg, Trash, FileEarmarkText, InfoCircle, Download, EyeFill, Grid3x3GapFill, ListUl } from 'react-bootstrap-icons';
import DeleteConfirmation from '../notifications/DeleteConfirmation';

const ResearchPage = ({ propertyId }) => {
  const [files, setFiles] = useState([]);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [fileToDelete, setFileToDelete] = useState(null);
  const [viewMode, setViewMode] = useState('cards'); // 'cards' or 'list'

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
          <div className="d-flex justify-content-between align-items-center mb-3">
            <h4 className="mb-0">
              <FileEarmarkText size={20} className="me-2" />
              Tallennetut tiedostot
              <Badge bg="primary" className="ms-2">{files.length}</Badge>
            </h4>
            
            <ButtonGroup size="sm">
              <Button 
                variant={viewMode === 'cards' ? 'primary' : 'outline-primary'}
                onClick={() => setViewMode('cards')}
              >
                <Grid3x3GapFill size={16} className="me-1" />
                Kortit
              </Button>
              <Button 
                variant={viewMode === 'list' ? 'primary' : 'outline-primary'}
                onClick={() => setViewMode('list')}
              >
                <ListUl size={16} className="me-1" />
                Lista
              </Button>
            </ButtonGroup>
          </div>
          
          {files.length === 0 ? (
            <Alert variant="info" className="d-flex align-items-center">
              <InfoCircle size={24} className="me-3" />
              <div>
                <strong>Ei tallennettuja tiedostoja</strong>
                <br />
                <small>Lataa ensimmäinen dokumentti yllä olevalla lomakkeella</small>
              </div>
            </Alert>
          ) : viewMode === 'cards' ? (
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
                        {file.description && file.description.trim() !== '' && (
                          <p className="text-muted mb-2" style={{
                            display: '-webkit-box',
                            WebkitLineClamp: 2,
                            WebkitBoxOrient: 'vertical',
                            overflow: 'hidden',
                            fontSize: '0.9rem'
                          }}>
                            {file.description}
                          </p>
                        )}
                        <p className="text-muted mb-3" style={{ fontSize: '0.8rem' }}>
                          <small>📅 {new Date(file.uploadedAt).toLocaleDateString('fi-FI', { 
                            year: 'numeric', 
                            month: 'long', 
                            day: 'numeric' 
                          })}</small>
                        </p>
                        <div className="mt-auto d-flex flex-column gap-2">
                          <div className="d-flex gap-2">
                            <Button 
                              variant="outline-primary" 
                              size="sm" 
                              href={validUrl} 
                              target="_blank" 
                              rel="noopener noreferrer"
                              className="flex-grow-1"
                            >
                              <EyeFill size={16} className="me-1" />
                              Esikatsele
                            </Button>
                            <Button 
                              variant="primary" 
                              size="sm" 
                              href={validUrl}
                              download
                              className="flex-grow-1"
                            >
                              <Download size={16} className="me-1" />
                              Lataa
                            </Button>
                          </div>
                          <Button 
                            variant="outline-danger" 
                            size="sm"
                            onClick={() => { 
                              setFileToDelete(file._id); 
                              setShowDeleteConfirm(true); 
                            }}
                          >
                            <Trash size={16} className="me-1" />
                            Poista
                          </Button>
                        </div>
                      </Card.Body>
                    </Card>
                  </Col>
                );
              })}
            </Row>
          ) : (
            <Table hover responsive className="border">
              <thead className="table-light">
                <tr>
                  <th style={{ width: '40px' }}></th>
                  <th>Nimi</th>
                  <th>Kuvaus</th>
                  <th style={{ width: '150px' }}>Ladattu</th>
                  <th style={{ width: '250px' }}>Toiminnot</th>
                </tr>
              </thead>
              <tbody>
                {files.map(file => {
                  let validUrl = file.url;
                  if (validUrl && !validUrl.match(/^https?:\/\//i)) {
                    validUrl = 'https://' + validUrl;
                  }
                  
                  return (
                    <tr key={file._id}>
                      <td className="text-center">
                        <FileEarmarkText size={24} className="text-primary" />
                      </td>
                      <td>
                        <strong>{file.name}</strong>
                      </td>
                      <td>
                        <span className="text-muted" style={{
                          display: '-webkit-box',
                          WebkitLineClamp: 2,
                          WebkitBoxOrient: 'vertical',
                          overflow: 'hidden'
                        }}>
                          {file.description || '-'}
                        </span>
                      </td>
                      <td className="text-muted small">
                        {new Date(file.uploadedAt).toLocaleDateString('fi-FI')}
                      </td>
                      <td>
                        <div className="d-flex gap-2">
                          <Button 
                            variant="outline-primary" 
                            size="sm" 
                            href={validUrl} 
                            target="_blank" 
                            rel="noopener noreferrer"
                          >
                            <EyeFill size={14} className="me-1" />
                            Esikatsele
                          </Button>
                          <Button 
                            variant="primary" 
                            size="sm" 
                            href={validUrl}
                            download
                          >
                            <Download size={14} className="me-1" />
                            Lataa
                          </Button>
                          <Button 
                            variant="outline-danger" 
                            size="sm"
                            onClick={() => { 
                              setFileToDelete(file._id); 
                              setShowDeleteConfirm(true); 
                            }}
                          >
                            <Trash size={14} />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </Table>
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