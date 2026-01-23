import React, { useState } from 'react';
import { Form, Button, Row, Col } from 'react-bootstrap';
import config from '../configuration/config';
import { toast } from 'react-toastify';

const EditServiceForm = ({ service, onSuccess, onCancel }) => {
  const [formData, setFormData] = useState({
    servicename: service.servicename || '',
    servicetype: service.servicetype || 'Huolto',
    description: service.description || '',
    provider: service.provider || '',
    contactperson: service.contactperson || '',
    phone: service.phone || '',
    email: service.email || '',
    servicedate: service.servicedate ? service.servicedate.split('T')[0] : '',
    nextservicedate: service.nextservicedate ? service.nextservicedate.split('T')[0] : '',
    isrecurring: service.isrecurring || false,
    recurringinterval: service.recurringinterval || '',
    cost: service.cost || '',
    status: service.status || 'Suunniteltu',
    priority: service.priority || 'Normaali',
    notes: service.notes || '',
    documenturl: service.documenturl || ''
  });

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      const token = localStorage.getItem('userToken');
      
      const response = await fetch(`${config.baseURL}/api/services/${service.serviceid}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          ...formData,
          cost: formData.cost ? parseFloat(formData.cost) : null,
          recurringinterval: formData.recurringinterval ? parseInt(formData.recurringinterval) : null
        })
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      toast.success('Huolto päivitetty onnistuneesti');
      onSuccess();
    } catch (error) {
      console.error('Error updating service:', error);
      toast.error('Virhe huollon päivityksessä');
    }
  };

  return (
    <Form onSubmit={handleSubmit}>
      <h5 className="mb-3">Muokkaa huoltoa</h5>
      
      <Row>
        <Col md={6}>
          <Form.Group className="mb-3">
            <Form.Label>Huollon nimi *</Form.Label>
            <Form.Control
              type="text"
              name="servicename"
              value={formData.servicename}
              onChange={handleChange}
              required
            />
          </Form.Group>
        </Col>
        
        <Col md={6}>
          <Form.Group className="mb-3">
            <Form.Label>Tyyppi</Form.Label>
            <Form.Select
              name="servicetype"
              value={formData.servicetype}
              onChange={handleChange}
            >
              <option value="Huolto">Huolto</option>
              <option value="Korjaus">Korjaus</option>
              <option value="Tarkastus">Tarkastus</option>
              <option value="Siivous">Siivous</option>
              <option value="Puutarha">Puutarha</option>
              <option value="Maalaus">Maalaus</option>
              <option value="Sähkö">Sähkö</option>
              <option value="LVI">LVI</option>
              <option value="Muu">Muu</option>
            </Form.Select>
          </Form.Group>
        </Col>
      </Row>

      <Form.Group className="mb-3">
        <Form.Label>Kuvaus</Form.Label>
        <Form.Control
          as="textarea"
          rows={2}
          name="description"
          value={formData.description}
          onChange={handleChange}
        />
      </Form.Group>

      <Row>
        <Col md={6}>
          <Form.Group className="mb-3">
            <Form.Label>Palveluntarjoaja</Form.Label>
            <Form.Control
              type="text"
              name="provider"
              value={formData.provider}
              onChange={handleChange}
            />
          </Form.Group>
        </Col>
        
        <Col md={6}>
          <Form.Group className="mb-3">
            <Form.Label>Yhteyshenkilö</Form.Label>
            <Form.Control
              type="text"
              name="contactperson"
              value={formData.contactperson}
              onChange={handleChange}
            />
          </Form.Group>
        </Col>
      </Row>

      <Row>
        <Col md={6}>
          <Form.Group className="mb-3">
            <Form.Label>Puhelin</Form.Label>
            <Form.Control
              type="tel"
              name="phone"
              value={formData.phone}
              onChange={handleChange}
            />
          </Form.Group>
        </Col>
        
        <Col md={6}>
          <Form.Group className="mb-3">
            <Form.Label>Sähköposti</Form.Label>
            <Form.Control
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
            />
          </Form.Group>
        </Col>
      </Row>

      <Row>
        <Col md={4}>
          <Form.Group className="mb-3">
            <Form.Label>Huoltopäivä</Form.Label>
            <Form.Control
              type="date"
              name="servicedate"
              value={formData.servicedate}
              onChange={handleChange}
            />
          </Form.Group>
        </Col>
        
        <Col md={4}>
          <Form.Group className="mb-3">
            <Form.Label>Hinta (€)</Form.Label>
            <Form.Control
              type="number"
              step="0.01"
              name="cost"
              value={formData.cost}
              onChange={handleChange}
            />
          </Form.Group>
        </Col>

        <Col md={4}>
          <Form.Group className="mb-3">
            <Form.Label>Prioriteetti</Form.Label>
            <Form.Select
              name="priority"
              value={formData.priority}
              onChange={handleChange}
            >
              <option value="Matala">Matala</option>
              <option value="Normaali">Normaali</option>
              <option value="Korkea">Korkea</option>
              <option value="Kiireellinen">Kiireellinen</option>
            </Form.Select>
          </Form.Group>
        </Col>
      </Row>

      <Row>
        <Col md={6}>
          <Form.Group className="mb-3">
            <Form.Label>Tila</Form.Label>
            <Form.Select
              name="status"
              value={formData.status}
              onChange={handleChange}
            >
              <option value="Suunniteltu">Suunniteltu</option>
              <option value="Käynnissä">Käynnissä</option>
              <option value="Valmis">Valmis</option>
              <option value="Peruttu">Peruttu</option>
            </Form.Select>
          </Form.Group>
        </Col>

        <Col md={6}>
          <Form.Group className="mb-3">
            <Form.Check
              type="checkbox"
              label="Toistuva huolto"
              name="isrecurring"
              checked={formData.isrecurring}
              onChange={handleChange}
              className="mt-4"
            />
          </Form.Group>
        </Col>
      </Row>

      {formData.isrecurring && (
        <Row>
          <Col md={6}>
            <Form.Group className="mb-3">
              <Form.Label>Seuraava huolto</Form.Label>
              <Form.Control
                type="date"
                name="nextservicedate"
                value={formData.nextservicedate}
                onChange={handleChange}
              />
            </Form.Group>
          </Col>
          
          <Col md={6}>
            <Form.Group className="mb-3">
              <Form.Label>Toistoväli (kuukautta)</Form.Label>
              <Form.Control
                type="number"
                name="recurringinterval"
                value={formData.recurringinterval}
                onChange={handleChange}
              />
            </Form.Group>
          </Col>
        </Row>
      )}

      <Form.Group className="mb-3">
        <Form.Label>Muistiinpanot</Form.Label>
        <Form.Control
          as="textarea"
          rows={3}
          name="notes"
          value={formData.notes}
          onChange={handleChange}
        />
      </Form.Group>

      <Form.Group className="mb-3">
        <Form.Label>Dokumentin URL</Form.Label>
        <Form.Control
          type="url"
          name="documenturl"
          value={formData.documenturl}
          onChange={handleChange}
          placeholder="https://..."
        />
      </Form.Group>

      <div className="d-flex gap-2">
        <Button variant="primary" type="submit">
          Päivitä huolto
        </Button>
        <Button variant="secondary" onClick={onCancel}>
          Peruuta
        </Button>
      </div>
    </Form>
  );
};

export default EditServiceForm;
