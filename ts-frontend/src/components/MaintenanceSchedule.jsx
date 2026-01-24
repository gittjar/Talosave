import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Form, Button, Badge, ProgressBar, Alert } from 'react-bootstrap';
import { Calendar, Plus, Trash, Tools, ExclamationTriangle, CheckCircle, Clock } from 'react-bootstrap-icons';

const MaintenanceSchedule = () => {
  const currentYear = new Date().getFullYear();
  
  // Standard component lifespans (in years)
  const componentLifespans = {
    'Katto (Tiili)': { lifespan: 50, category: 'Rakenteet' },
    'Katto (Pelti)': { lifespan: 40, category: 'Rakenteet' },
    'Katto (Huopa)': { lifespan: 25, category: 'Rakenteet' },
    'Ikkunat (Puu)': { lifespan: 40, category: 'Rakenteet' },
    'Ikkunat (Muovi)': { lifespan: 30, category: 'Rakenteet' },
    'Ulko-ovet': { lifespan: 40, category: 'Rakenteet' },
    'Julkisivu (Puu)': { lifespan: 30, category: 'Rakenteet' },
    'Julkisivu (Rappu)': { lifespan: 40, category: 'Rakenteet' },
    'Lämmitysjärjestelmä': { lifespan: 20, category: 'Talotekniikka' },
    'Ilmanvaihtolaitteet': { lifespan: 25, category: 'Talotekniikka' },
    'Lämminvesivaraaja': { lifespan: 15, category: 'Talotekniikka' },
    'Viemärit': { lifespan: 50, category: 'Talotekniikka' },
    'Vesijohdot (Kupari)': { lifespan: 50, category: 'Talotekniikka' },
    'Vesijohdot (Muovi)': { lifespan: 50, category: 'Talotekniikka' },
    'Sähköjärjestelmä': { lifespan: 40, category: 'Talotekniikka' },
    'Ulkomaalaus': { lifespan: 8, category: 'Pinnoitteet' },
    'Sisämaalaus': { lifespan: 12, category: 'Pinnoitteet' },
    'Keittiö': { lifespan: 20, category: 'Pinnoitteet' },
    'Kylpyhuone': { lifespan: 25, category: 'Pinnoitteet' },
    'Lattiat (Parketti)': { lifespan: 30, category: 'Pinnoitteet' },
    'Lattiat (Laatta)': { lifespan: 40, category: 'Pinnoitteet' },
  };

  const [components, setComponents] = useState(() => {
    const saved = localStorage.getItem('maintenanceSchedule');
    return saved ? JSON.parse(saved) : [];
  });

  const [newComponent, setNewComponent] = useState({
    name: '',
    installYear: currentYear,
    customLifespan: ''
  });

  useEffect(() => {
    localStorage.setItem('maintenanceSchedule', JSON.stringify(components));
  }, [components]);

  const addComponent = () => {
    if (!newComponent.name) return;

    const standardLifespan = componentLifespans[newComponent.name]?.lifespan || 20;
    const lifespan = newComponent.customLifespan || standardLifespan;
    const category = componentLifespans[newComponent.name]?.category || 'Muu';

    const component = {
      id: Date.now(),
      name: newComponent.name,
      installYear: parseInt(newComponent.installYear),
      lifespan: parseInt(lifespan),
      category: category,
      replacementYear: parseInt(newComponent.installYear) + parseInt(lifespan)
    };

    setComponents([...components, component]);
    setNewComponent({ name: '', installYear: currentYear, customLifespan: '' });
  };

  const removeComponent = (id) => {
    setComponents(components.filter(c => c.id !== id));
  };

  const getYearsRemaining = (replacementYear) => {
    return replacementYear - currentYear;
  };

  const getStatusColor = (yearsRemaining) => {
    if (yearsRemaining < 0) return { color: 'danger', text: 'Huom! Ylittänyt', icon: <ExclamationTriangle /> };
    if (yearsRemaining < 2) return { color: 'danger', text: 'Kriittinen', icon: <ExclamationTriangle /> };
    if (yearsRemaining < 5) return { color: 'warning', text: 'Huomio', icon: <Clock /> };
    return { color: 'success', text: 'Hyvä', icon: <CheckCircle /> };
  };

  const getProgressPercentage = (installYear, replacementYear) => {
    const totalYears = replacementYear - installYear;
    const elapsed = currentYear - installYear;
    return Math.min(100, Math.max(0, (elapsed / totalYears) * 100));
  };

  const sortedComponents = [...components].sort((a, b) => {
    const yearsA = getYearsRemaining(a.replacementYear);
    const yearsB = getYearsRemaining(b.replacementYear);
    return yearsA - yearsB;
  });

  const groupedByCategory = sortedComponents.reduce((acc, component) => {
    if (!acc[component.category]) {
      acc[component.category] = [];
    }
    acc[component.category].push(component);
    return acc;
  }, {});

  // Timeline data for visualization
  const getTimelineYears = () => {
    if (components.length === 0) return [];
    const years = new Set();
    components.forEach(c => {
      years.add(c.installYear);
      years.add(c.replacementYear);
    });
    years.add(currentYear);
    const sortedYears = Array.from(years).sort((a, b) => a - b);
    const minYear = Math.min(...sortedYears);
    const maxYear = Math.max(...sortedYears);
    const range = [];
    for (let year = minYear; year <= maxYear + 5; year += 5) {
      range.push(year);
    }
    return range;
  };

  return (
    <Container className="mt-4 mb-5">
      <Row className="mb-4">
        <Col>
          <div className="d-flex align-items-center mb-3">
            <Tools size={32} className="text-primary me-3" />
            <div>
              <h2 className="mb-0">Huoltoaikataulusuunnittelu</h2>
              <p className="text-muted mb-0">Seuraa rakennusosien käyttöikiä ja suunnittele huoltoja</p>
            </div>
          </div>
        </Col>
      </Row>

      {/* Add Component Form */}
      <Card className="mb-4 shadow-sm">
        <Card.Header className="bg-primary text-white">
          <Plus size={20} className="me-2" />
          Lisää komponentti
        </Card.Header>
        <Card.Body>
          <Row>
            <Col md={4}>
              <Form.Group className="mb-3">
                <Form.Label>Rakennusosa *</Form.Label>
                <Form.Select
                  value={newComponent.name}
                  onChange={(e) => {
                    setNewComponent({ 
                      ...newComponent, 
                      name: e.target.value,
                      customLifespan: ''
                    });
                  }}
                >
                  <option value="">Valitse...</option>
                  <optgroup label="Rakenteet">
                    {Object.entries(componentLifespans)
                      .filter(([_, data]) => data.category === 'Rakenteet')
                      .map(([name, data]) => (
                        <option key={name} value={name}>
                          {name} ({data.lifespan} v)
                        </option>
                      ))}
                  </optgroup>
                  <optgroup label="Talotekniikka">
                    {Object.entries(componentLifespans)
                      .filter(([_, data]) => data.category === 'Talotekniikka')
                      .map(([name, data]) => (
                        <option key={name} value={name}>
                          {name} ({data.lifespan} v)
                        </option>
                      ))}
                  </optgroup>
                  <optgroup label="Pinnoitteet">
                    {Object.entries(componentLifespans)
                      .filter(([_, data]) => data.category === 'Pinnoitteet')
                      .map(([name, data]) => (
                        <option key={name} value={name}>
                          {name} ({data.lifespan} v)
                        </option>
                      ))}
                  </optgroup>
                </Form.Select>
              </Form.Group>
            </Col>
            <Col md={3}>
              <Form.Group className="mb-3">
                <Form.Label>Asennusvuosi *</Form.Label>
                <Form.Control
                  type="number"
                  min="1900"
                  max={currentYear}
                  value={newComponent.installYear}
                  onChange={(e) => setNewComponent({ ...newComponent, installYear: e.target.value })}
                />
              </Form.Group>
            </Col>
            <Col md={3}>
              <Form.Group className="mb-3">
                <Form.Label>Käyttöikä (v)</Form.Label>
                <Form.Control
                  type="number"
                  min="1"
                  max="100"
                  placeholder={newComponent.name ? componentLifespans[newComponent.name]?.lifespan : 'Auto'}
                  value={newComponent.customLifespan}
                  onChange={(e) => setNewComponent({ ...newComponent, customLifespan: e.target.value })}
                />
                <Form.Text className="text-muted">
                  Tyhjä = oletusarvo
                </Form.Text>
              </Form.Group>
            </Col>
            <Col md={2} className="d-flex align-items-end">
              <Button 
                variant="primary" 
                onClick={addComponent} 
                className="mb-3 w-100"
                disabled={!newComponent.name}
              >
                <Plus size={20} /> Lisää
              </Button>
            </Col>
          </Row>
        </Card.Body>
      </Card>

      {components.length === 0 ? (
        <Alert variant="info">
          <Calendar size={20} className="me-2" />
          Ei lisättyjä komponentteja. Aloita lisäämällä rakennusosia yllä olevalla lomakkeella.
        </Alert>
      ) : (
        <>
          {/* Timeline Visualization */}
          <Card className="mb-4 shadow-sm">
            <Card.Header className="bg-light">
              <strong>Aikajana</strong>
              <Badge bg="secondary" className="ms-2">{currentYear}</Badge>
            </Card.Header>
            <Card.Body>
              <div style={{ position: 'relative', minHeight: '150px' }}>
                {/* Current year line */}
                <div 
                  style={{
                    position: 'absolute',
                    left: '50%',
                    top: 0,
                    bottom: 0,
                    width: '3px',
                    backgroundColor: '#0d6efd',
                    zIndex: 1
                  }}
                >
                  <div 
                    style={{
                      position: 'absolute',
                      top: '-25px',
                      left: '50%',
                      transform: 'translateX(-50%)',
                      backgroundColor: '#0d6efd',
                      color: 'white',
                      padding: '2px 8px',
                      borderRadius: '3px',
                      fontSize: '12px',
                      fontWeight: 'bold',
                      whiteSpace: 'nowrap'
                    }}
                  >
                    NYT {currentYear}
                  </div>
                </div>

                {/* Components on timeline */}
                {sortedComponents.map((component, index) => {
                  const yearsRemaining = getYearsRemaining(component.replacementYear);
                  const status = getStatusColor(yearsRemaining);
                  const leftPercent = yearsRemaining < 0 ? 10 : Math.max(10, Math.min(90, 50 + (yearsRemaining * 2)));
                  
                  return (
                    <div
                      key={component.id}
                      style={{
                        position: 'absolute',
                        left: `${leftPercent}%`,
                        top: `${index * 30 + 40}px`,
                        transform: 'translateX(-50%)',
                        zIndex: 0
                      }}
                    >
                      <div className={`badge bg-${status.color}`} style={{ fontSize: '11px', whiteSpace: 'nowrap' }}>
                        {component.name}: {component.replacementYear}
                        {yearsRemaining >= 0 && ` (${yearsRemaining}v)`}
                      </div>
                    </div>
                  );
                })}
              </div>
              <div style={{ marginTop: `${sortedComponents.length * 30 + 60}px` }}>
                <div className="d-flex justify-content-between text-muted small">
                  <span>← Mennyt</span>
                  <span>Tulevaisuus →</span>
                </div>
              </div>
            </Card.Body>
          </Card>

          {/* Components by Category */}
          {Object.entries(groupedByCategory).map(([category, categoryComponents]) => (
            <Card key={category} className="mb-3 shadow-sm">
              <Card.Header className="bg-light">
                <strong>{category}</strong>
                <Badge bg="secondary" className="ms-2">{categoryComponents.length}</Badge>
              </Card.Header>
              <Card.Body className="p-0">
                {categoryComponents.map((component) => {
                  const yearsRemaining = getYearsRemaining(component.replacementYear);
                  const status = getStatusColor(yearsRemaining);
                  const progress = getProgressPercentage(component.installYear, component.replacementYear);
                  const age = currentYear - component.installYear;

                  return (
                    <div key={component.id} className="border-bottom p-3">
                      <Row className="align-items-center">
                        <Col md={4}>
                          <div className="d-flex align-items-center">
                            {status.icon}
                            <div className="ms-2">
                              <strong>{component.name}</strong>
                              <div className="text-muted small">
                                Asennettu: {component.installYear} (ikä: {age}v)
                              </div>
                            </div>
                          </div>
                        </Col>
                        <Col md={6}>
                          <div className="mb-2">
                            <div className="d-flex justify-content-between mb-1">
                              <small className="text-muted">
                                Käyttöikä: {component.lifespan} vuotta
                              </small>
                              <Badge bg={status.color}>{status.text}</Badge>
                            </div>
                            <ProgressBar 
                              now={progress} 
                              variant={status.color}
                              style={{ height: '20px' }}
                            />
                            <div className="d-flex justify-content-between mt-1">
                              <small className="text-muted">
                                {component.installYear}
                              </small>
                              <small className={`text-${status.color} fw-bold`}>
                                {yearsRemaining >= 0 
                                  ? `Vaihto ${component.replacementYear} (${yearsRemaining}v)`
                                  : `Ylittänyt ${Math.abs(yearsRemaining)}v sitten`
                                }
                              </small>
                            </div>
                          </div>
                        </Col>
                        <Col md={2} className="text-end">
                          <Button
                            variant="outline-danger"
                            size="sm"
                            onClick={() => removeComponent(component.id)}
                          >
                            <Trash />
                          </Button>
                        </Col>
                      </Row>
                    </div>
                  );
                })}
              </Card.Body>
            </Card>
          ))}

          {/* Summary Statistics */}
          <Row className="mt-4">
            <Col md={4}>
              <Card className="border-danger shadow-sm">
                <Card.Body>
                  <div className="d-flex justify-content-between align-items-center">
                    <div>
                      <ExclamationTriangle size={24} className="text-danger" />
                      <h5 className="mt-2 mb-0">Kriittiset</h5>
                      <small className="text-muted">&lt; 2 vuotta</small>
                    </div>
                    <h2 className="text-danger mb-0">
                      {components.filter(c => getYearsRemaining(c.replacementYear) < 2).length}
                    </h2>
                  </div>
                </Card.Body>
              </Card>
            </Col>
            <Col md={4}>
              <Card className="border-warning shadow-sm">
                <Card.Body>
                  <div className="d-flex justify-content-between align-items-center">
                    <div>
                      <Clock size={24} className="text-warning" />
                      <h5 className="mt-2 mb-0">Huomio</h5>
                      <small className="text-muted">2-5 vuotta</small>
                    </div>
                    <h2 className="text-warning mb-0">
                      {components.filter(c => {
                        const years = getYearsRemaining(c.replacementYear);
                        return years >= 2 && years < 5;
                      }).length}
                    </h2>
                  </div>
                </Card.Body>
              </Card>
            </Col>
            <Col md={4}>
              <Card className="border-success shadow-sm">
                <Card.Body>
                  <div className="d-flex justify-content-between align-items-center">
                    <div>
                      <CheckCircle size={24} className="text-success" />
                      <h5 className="mt-2 mb-0">Hyvä kunto</h5>
                      <small className="text-muted">&gt; 5 vuotta</small>
                    </div>
                    <h2 className="text-success mb-0">
                      {components.filter(c => getYearsRemaining(c.replacementYear) >= 5).length}
                    </h2>
                  </div>
                </Card.Body>
              </Card>
            </Col>
          </Row>
        </>
      )}
    </Container>
  );
};

export default MaintenanceSchedule;
