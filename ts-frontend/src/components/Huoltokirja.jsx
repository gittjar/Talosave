
import React, { useEffect, useState } from 'react';
import { toast } from 'react-toastify';
import axios from 'axios';
import config from '../configuration/config';
import { useAuth } from '../contexts/AuthContext.jsx';
import { Container, Card, Row, Col, Button, Badge, ButtonGroup, Table, Alert, Modal, Form } from 'react-bootstrap';
import { Grid3x3GapFill, ListUl, PencilSquare, Trash, CheckCircleFill, Circle, InfoCircle } from 'react-bootstrap-icons';

const Huoltokirja = ({ propertyId: propPropertyId }) => {
  const [entries, setEntries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState('cards'); // 'cards' or 'list'
  // Per-entry: { [entryId]: { [month]: { done, note, done_date } } }
  const [monthDone, setMonthDone] = useState({});
  const [noteInput, setNoteInput] = useState({});
  const currentYear = new Date().getFullYear();
  const [newEntry, setNewEntry] = useState({
    task_name: '',
    description: '',
    recommended_frequency: '',
    note: '',
    is_recurring: false,
    recurring_months: [],
    year: currentYear
  });
  const [adding, setAdding] = useState(false);
  const [editId, setEditId] = useState(null);
  const [editEntry, setEditEntry] = useState({ task_name: '', description: '', recommended_frequency: '' });
  const [showEditModal, setShowEditModal] = useState(false);

  const handleEditClick = (entry) => {
    setEditId(entry.id);
    setEditEntry({
      task_name: entry.task_name,
      description: entry.description,
      recommended_frequency: entry.recommended_frequency
    });
    setShowEditModal(true);
  };


  const handleEditSave = async () => {
    try {
      await axios.put(`${config.apiUrl}/maintenance/entries/${editId}`, {
        task_name: editEntry.task_name,
        description: editEntry.description,
        recommended_frequency: editEntry.recommended_frequency
      });
      const entriesRes = await axios.get(`${config.apiUrl}/maintenance/entries/${propertyId}`);
      setEntries(entriesRes.data);
      setEditId(null);
      setShowEditModal(false);
      toast.success(`Huolto muokattu: ${editEntry.task_name}`);
    } catch (err) {
      toast.error(`Huollon muokkaus epäonnistui: ${editEntry.task_name}`);
    }
  };


  const handleEditCancel = () => {
    setEditId(null);
    setShowEditModal(false);
  };
    const handleAddEntry = async (e) => {
      e.preventDefault();
      if (!newEntry.task_name || typeof newEntry.task_name !== 'string' || newEntry.task_name.trim() === '') {
        toast.error('Täytä tehtävän nimi!');
        return;
      }
      setAdding(true);
      try {
        await axios.post(`${config.apiUrl}/maintenance/entries`, {
          propertyid: propertyId,
          task_name: newEntry.task_name,
          description: newEntry.description,
          recommended_frequency: newEntry.recommended_frequency,
          note: newEntry.note,
          user_id: user?.userid,
          is_recurring: newEntry.is_recurring,
          recurring_months: newEntry.recurring_months.join(','),
          year: newEntry.year
        });
        setNewEntry({ task_name: '', description: '', recommended_frequency: '', note: '', is_recurring: false, recurring_months: [], year: currentYear });
        const entriesRes = await axios.get(`${config.apiUrl}/maintenance/entries/${propertyId}`);
        setEntries(entriesRes.data);
        toast.success(`Huolto lisätty: ${newEntry.task_name}`);
      } catch (err) {
        toast.error(`Huollon lisäys epäonnistui: ${newEntry.task_name || '-'}`);
      }
      setAdding(false);
    };

    const handleDeleteEntry = async (entryId) => {
      if (!window.confirm('Poistetaanko tämä huolto/tehtävä?')) return;
      try {
        await axios.delete(`${config.apiUrl}/maintenance/entries/${entryId}`);
        const entriesRes = await axios.get(`${config.apiUrl}/maintenance/entries/${propertyId}`);
        setEntries(entriesRes.data);
        const entry = entries.find(e => e.id === entryId);
        toast.success(`Huolto poistettu: ${entry?.task_name || '-'}`);
      } catch (err) {
        const entry = entries.find(e => e.id === entryId);
        toast.error(`Huollon poisto epäonnistui: ${entry?.task_name || '-'}`);
      }
    };
  const { user } = useAuth();
  const propertyId = propPropertyId || user?.propertyid;

  useEffect(() => {
    if (!user) return;
    const fetchData = async () => {
      setLoading(true);
      try {
        const entriesRes = await axios.get(`${config.apiUrl}/maintenance/entries/${propertyId}`);
        setEntries(entriesRes.data);
        // Hae kuukausikohtaiset suoritukset kaikille entryille
        const allMonthDone = {};
        for (const entry of entriesRes.data) {
          if (entry.is_recurring) {
            const res = await axios.get(`${config.apiUrl}/maintenance/entries/${entry.id}/monthdone`, { params: { year: entry.year } });
            allMonthDone[entry.id] = {};
            for (const md of res.data) {
              allMonthDone[entry.id][md.month] = { done: !!md.done, note: md.note, done_date: md.done_date };
            }
          }
        }
        setMonthDone(allMonthDone);
      } catch (err) {
        // handle error
      }
      setLoading(false);
    };
    fetchData();
  }, [user, propertyId]);

  const handleCheck = async (entryId) => {
    try {
      await axios.put(`${config.apiUrl}/maintenance/entries/${entryId}`, {
        done: true,
        done_date: new Date().toISOString().slice(0, 10),
        note: noteInput[entryId] || ''
      });
      const entriesRes = await axios.get(`${config.apiUrl}/maintenance/entries/${propertyId}`);
      setEntries(entriesRes.data);
      setNoteInput({ ...noteInput, [entryId]: '' });
    } catch (err) {
      // handle error
    }
  };

  const handleUncheck = async (entryId) => {
    try {
      await axios.put(`${config.apiUrl}/maintenance/entries/${entryId}`, {
        done: false,
        done_date: null,
        note: noteInput[entryId] || ''
      });
      const entriesRes = await axios.get(`${config.apiUrl}/maintenance/entries/${propertyId}`);
      setEntries(entriesRes.data);
    } catch (err) {
      // handle error
    }
  };

  const isChecked = (entry) => {
    return !!entry.done;
  };

  if (!propertyId) return <div>Valitse kiinteistö nähdäksesi huoltokirjan.</div>;
  if (loading) return <div>Ladataan...</div>;

  // Statistics
  const totalCount = entries.length;
  const recurringCount = entries.filter(e => e.is_recurring).length;
  const nonRecurringCount = totalCount - recurringCount;

  return (
    <Container fluid className="py-4">
      <h2 className="h3 mb-3">Huoltokirja</h2>
      {/* Statistics */}
      <Row className="mb-4 g-3">
        <Col xs={12} md={4}>
          <Card className="border-0 shadow-sm text-center">
            <Card.Body>
              <div className="text-muted small mb-1">Yhteensä</div>
              <div className="h4 mb-0">{totalCount}</div>
            </Card.Body>
          </Card>
        </Col>
        <Col xs={6} md={4}>
          <Card className="border-0 shadow-sm text-center bg-info text-white">
            <Card.Body>
              <div className="small mb-1">Toistuvat</div>
              <div className="h4 mb-0">{recurringCount}</div>
            </Card.Body>
          </Card>
        </Col>
        <Col xs={6} md={4}>
          <Card className="border-0 shadow-sm text-center bg-secondary text-white">
            <Card.Body>
              <div className="small mb-1">Kertaluonteiset</div>
              <div className="h4 mb-0">{nonRecurringCount}</div>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* View mode toggle */}
      <Row className="mb-3">
        <Col className="text-end">
          <ButtonGroup size="sm">
            <Button 
              variant={viewMode === 'cards' ? 'primary' : 'outline-primary'}
              onClick={() => setViewMode('cards')}
            >
              <Grid3x3GapFill size={16} className="me-1" /> Kortit
            </Button>
            <Button 
              variant={viewMode === 'list' ? 'primary' : 'outline-primary'}
              onClick={() => setViewMode('list')}
            >
              <ListUl size={16} className="me-1" /> Lista
            </Button>
          </ButtonGroup>
        </Col>
      </Row>

      {/* Add form */}
      <form onSubmit={handleAddEntry} style={{ marginBottom: '2em', background: '#f8f9fa', padding: '1em', borderRadius: '8px' }}>
        <h4>Lisää uusi huolto/tehtävä</h4>
        <div style={{ marginBottom: '0.5em' }}>
          <label style={{ fontWeight: 500 }}>
            Tehtävän nimi <span style={{ color: 'red' }}>*</span>
            <input
              type="text"
              placeholder="Tehtävän nimi"
              value={newEntry.task_name}
              onChange={e => setNewEntry({ ...newEntry, task_name: e.target.value })}
              style={{ marginTop: '0.2em', width: '100%' }}
            />
          </label>
        </div>
        <input
          type="text"
          placeholder="Kuvaus"
          value={newEntry.description}
          onChange={e => setNewEntry({ ...newEntry, description: e.target.value })}
          style={{ marginBottom: '0.5em', width: '100%' }}
        />
        <input
          type="text"
          placeholder="Suositeltu taajuus (esim. vuosittain, kevät, ... )"
          value={newEntry.recommended_frequency}
          onChange={e => setNewEntry({ ...newEntry, recommended_frequency: e.target.value })}
          style={{ marginBottom: '0.5em', width: '100%' }}
        />
        <input
          type="text"
          placeholder="Huomio (valinnainen)"
          value={newEntry.note}
          onChange={e => setNewEntry({ ...newEntry, note: e.target.value })}
          style={{ marginBottom: '0.5em', width: '100%' }}
        />
        <div style={{ marginBottom: '0.5em' }}>
          <label>
            <input
              type="checkbox"
              checked={newEntry.is_recurring}
              onChange={e => setNewEntry({ ...newEntry, is_recurring: e.target.checked })}
              style={{ marginRight: '0.5em' }}
            />
            Toistuva vuosittain
          </label>
        </div>
        <div style={{ marginBottom: '0.5em' }}>
          <span>Vuosi: </span>
          <input
            type="number"
            min={currentYear}
            value={newEntry.year}
            onChange={e => setNewEntry({ ...newEntry, year: parseInt(e.target.value) })}
            style={{ width: '90px', marginLeft: '0.5em' }}
          />
        </div>
        <div style={{ marginBottom: '0.5em' }}>
          <span>Kuukaudet: </span>
          {[...Array(12)].map((_, i) => (
            <label key={i} style={{ marginRight: '0.5em' }}>
              <input
                type="checkbox"
                checked={newEntry.recurring_months.includes(i + 1)}
                onChange={e => {
                  const months = newEntry.recurring_months.includes(i + 1)
                    ? newEntry.recurring_months.filter(m => m !== i + 1)
                    : [...newEntry.recurring_months, i + 1];
                  setNewEntry({ ...newEntry, recurring_months: months });
                }}
              />
              {i + 1}
            </label>
          ))}
        </div>
        <button type="submit" disabled={adding} style={{ marginTop: '0.5em' }}>Lisää huolto</button>
      </form>
      {/* Entries display */}
      {entries.length === 0 ? (
        <Alert variant="info" className="d-flex align-items-center">
          <InfoCircle size={24} className="me-3" />
          <div>
            <strong>Ei huoltoja</strong>
            <br />
            <small>Lisää ensimmäinen huolto yllä olevalla lomakkeella</small>
          </div>
        </Alert>
      ) : viewMode === 'cards' ? (
        <Row className="g-3">
          {entries.map(entry => {
            const recurringMonths = entry.recurring_months
              ? entry.recurring_months.split(',').map(m => parseInt(m)).filter(Boolean)
              : [];
            const entryMonthDone = monthDone[entry.id] || {};
            const handleMonthCheck = async (month, checked) => {
              try {
                await axios.post(`${config.apiUrl}/maintenance/entries/${entry.id}/monthdone`, {
                  year: entry.year,
                  month,
                  done: checked,
                  user_id: user?.userid || null,
                  note: ''
                });
                setMonthDone(prev => ({
                  ...prev,
                  [entry.id]: {
                    ...prev[entry.id],
                    [month]: { ...prev[entry.id]?.[month], done: checked }
                  }
                }));
              } catch (err) {}
            };
            return (
              <Col key={entry.id} xs={12} md={6} lg={4}>
                <Card className="h-100 border-0 shadow-sm hover-lift mb-3">
                  <Card.Body className="d-flex flex-column">
                    <div className="d-flex justify-content-between align-items-start mb-2">
                      <div className="me-2">
                        {entry.is_recurring ? (
                          <CheckCircleFill size={28} className="text-info" title="Toistuva" />
                        ) : (
                          <Circle size={28} className="text-secondary" title="Kertaluonteinen" />
                        )}
                      </div>
                      <Badge bg={entry.is_recurring ? 'info' : 'secondary'}>
                        {entry.is_recurring ? 'Toistuva' : 'Kertaluonteinen'}
                      </Badge>
                    </div>
                    <h5 className="mb-2">{entry.task_name}</h5>
                    <div className="mb-2 text-muted small">{entry.recommended_frequency}</div>
                    <div className="mb-2" style={{ color: '#555' }}>{entry.description}</div>
                    {recurringMonths.length > 0 && (
                      <div className="mb-2">
                        <span className="small">Kuukaudet: </span>
                        {[...Array(12)].map((_, i) => (
                          <label key={i} style={{ marginRight: '0.5em', opacity: recurringMonths.includes(i + 1) ? 1 : 0.3 }}>
                            <input
                              type="checkbox"
                              disabled={!recurringMonths.includes(i + 1)}
                              checked={recurringMonths.includes(i + 1) && !!entryMonthDone[i + 1]?.done}
                              onChange={e => handleMonthCheck(i + 1, e.target.checked)}
                            />
                            {i + 1}
                          </label>
                        ))}
                      </div>
                    )}
                    <div className="d-flex gap-2 mt-auto">
                      <>
                        <Button size="sm" variant="outline-primary" onClick={() => handleEditClick(entry)} className="me-2">
                          <PencilSquare size={16} className="me-1" /> Muokkaa
                        </Button>
                        <Button size="sm" variant="outline-danger" onClick={() => handleDeleteEntry(entry.id)}>
                          <Trash size={16} /> Poista
                        </Button>
                      </>
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
              <th style={{ width: '50px' }}>Tyyppi</th>
              <th>Tehtävä</th>
              <th>Suositus</th>
              <th>Kuvaus</th>
              <th>Vuosi</th>
              <th>Kuukaudet</th>
              <th style={{ width: '180px' }}>Toiminnot</th>
            </tr>
          </thead>
          <tbody>
            {entries.map(entry => {
              const recurringMonths = entry.recurring_months
                ? entry.recurring_months.split(',').map(m => parseInt(m)).filter(Boolean)
                : [];
              const entryMonthDone = monthDone[entry.id] || {};
              const handleMonthCheck = async (month, checked) => {
                try {
                  await axios.post(`${config.apiUrl}/maintenance/entries/${entry.id}/monthdone`, {
                    year: entry.year,
                    month,
                    done: checked,
                    user_id: user?.userid || null,
                    note: ''
                  });
                  setMonthDone(prev => ({
                    ...prev,
                    [entry.id]: {
                      ...prev[entry.id],
                      [month]: { ...prev[entry.id]?.[month], done: checked }
                    }
                  }));
                } catch (err) {}
              };
              return (
                <tr key={entry.id}>
                  <td className="text-center">
                    {entry.is_recurring ? (
                      <CheckCircleFill size={20} className="text-info" title="Toistuva" />
                    ) : (
                      <Circle size={20} className="text-secondary" title="Kertaluonteinen" />
                    )}
                  </td>
                  <td><strong>{entry.task_name}</strong></td>
                  <td>{entry.recommended_frequency}</td>
                  <td>{entry.description}</td>
                  <td>{entry.year}</td>
                  <td>
                    {recurringMonths.length > 0 && (
                      <div>
                        {[...Array(12)].map((_, i) => (
                          <label key={i} style={{ marginRight: '0.5em', opacity: recurringMonths.includes(i + 1) ? 1 : 0.3 }}>
                            <input
                              type="checkbox"
                              disabled={!recurringMonths.includes(i + 1)}
                              checked={recurringMonths.includes(i + 1) && !!entryMonthDone[i + 1]?.done}
                              onChange={e => handleMonthCheck(i + 1, e.target.checked)}
                            />
                            {i + 1}
                          </label>
                        ))}
                      </div>
                    )}
                  </td>
                  <td>
                    <>
                      <Button size="sm" variant="outline-primary" onClick={() => handleEditClick(entry)} className="me-2">
                        <PencilSquare size={14} className="me-1" /> Muokkaa
                      </Button>
                      <Button size="sm" variant="outline-danger" onClick={() => handleDeleteEntry(entry.id)}>
                        <Trash size={14} /> Poista
                      </Button>
                    </>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </Table>
      )}
      {/* End entries display */}

      {/* Edit Modal (single, outside map) */}
      <Modal show={showEditModal} onHide={handleEditCancel} centered>
        <Modal.Header closeButton>
          <Modal.Title>Muokkaa huoltoa</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form>
            <Form.Group className="mb-3">
              <Form.Label>Tehtävän nimi <span style={{ color: 'red' }}>*</span></Form.Label>
              <Form.Control
                type="text"
                value={editEntry.task_name}
                onChange={e => setEditEntry({ ...editEntry, task_name: e.target.value })}
                autoFocus
              />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Kuvaus</Form.Label>
              <Form.Control
                type="text"
                value={editEntry.description}
                onChange={e => setEditEntry({ ...editEntry, description: e.target.value })}
              />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Suositeltu taajuus</Form.Label>
              <Form.Control
                type="text"
                value={editEntry.recommended_frequency}
                onChange={e => setEditEntry({ ...editEntry, recommended_frequency: e.target.value })}
              />
            </Form.Group>
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={handleEditCancel}>Peruuta</Button>
          <Button variant="primary" onClick={handleEditSave}>Tallenna</Button>
        </Modal.Footer>
      </Modal>
    </Container>
  );
};

export default Huoltokirja;
