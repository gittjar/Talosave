import React, { useState, useRef } from 'react';
import axios from 'axios';
import config from '../configuration/config.js';
import { toast } from 'react-toastify';
import { Form, Button, Card, Row, Col, InputGroup } from 'react-bootstrap';
import { Link45deg, FileText, Plus } from 'react-bootstrap-icons';

const UrlUpload = ({ propertyId, onUpload }) => {
  const [url, setUrl] = useState('');
  const [name, setName] = useState('');
  const formRef = useRef();

  const submitUrl = async (event) => {
    event.preventDefault();
    const formData = new FormData();
    formData.append('url', url);
    formData.append('name', name);
    formData.append('propertyId', propertyId);

    for (var pair of formData.entries()) {
      console.log(pair[0]+ ', ' + pair[1]); 
    }

    await axios.post(`${config.baseURL}/api/upload`, formData, {
      headers: {
          'Content-Type': 'multipart/form-data',
      },
    })
    .then(() => {
      formRef.current.reset();
      setUrl('');
      setName('');
      toast.success('Linkki lisätty onnistuneesti!');
      onUpload();
    })
    .catch(() => {
      toast.error('Linkin lisääminen epäonnistui!');
    });
  };

  const handleUrlChange = (event) => {
    setUrl(event.target.value);
  };

  const handleNameChange = (event) => {
    setName(event.target.value);
  };

  return (
    <Card className="border-0 shadow-sm mb-4">
      <Card.Body className="p-4">
        <h5 className="mb-3">
          <Plus size={20} className="me-2" />
          Lisää uusi linkki
        </h5>
        <Form ref={formRef} onSubmit={submitUrl}>
          <Row className="g-3">
            <Col md={12}>
              <Form.Group>
                <Form.Label>Linkin nimi</Form.Label>
                <InputGroup>
                  <InputGroup.Text>
                    <FileText size={16} />
                  </InputGroup.Text>
                  <Form.Control 
                    type="text" 
                    onChange={handleNameChange} 
                    placeholder="Esim. Energiatodistus, Asemapiirros, Kuntotutkimus..." 
                    required
                  />
                </InputGroup>
              </Form.Group>
            </Col>
            <Col md={12}>
              <Form.Group>
                <Form.Label>URL-osoite</Form.Label>
                <InputGroup>
                  <InputGroup.Text>
                    <Link45deg size={16} />
                  </InputGroup.Text>
                  <Form.Control 
                    type="text" 
                    onChange={handleUrlChange} 
                    placeholder="https://drive.google.com/..." 
                    required
                  />
                </InputGroup>
                <Form.Text className="text-muted">
                  Voit käyttää Google Driveä, OneDriveä tai mitä tahansa pilvipalvelua
                </Form.Text>
              </Form.Group>
            </Col>
            <Col md={12}>
              <Button variant="primary" type="submit" className="w-100">
                <Plus size={20} className="me-2" />
                Lisää linkki
              </Button>
            </Col>
          </Row>
        </Form>
      </Card.Body>
    </Card>
  );
};

export default UrlUpload;
