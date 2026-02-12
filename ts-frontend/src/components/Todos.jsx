import { useState, useEffect } from 'react';
import config from '../configuration/config.js';
import DeleteConfirmation from '../notifications/DeleteConfirmation.jsx';
import EditTodoForm from '../forms/EditTodoForm.jsx';
import AddTodoForm from '../forms/AddTodoForm.jsx';
import { toast } from 'react-toastify';
import { 
  Container, Card, Row, Col, Button, Badge, ButtonGroup, 
  Table, Form, Alert 
} from 'react-bootstrap';
import { 
  Plus, CheckCircleFill, Circle, PencilSquare, Trash, 
  Grid3x3GapFill, ListUl, Calendar, CurrencyEuro,
  CheckCircle, SortDown, SortUp, InfoCircle
} from 'react-bootstrap-icons';

const Todos = ({ propertyId }) => {
  const [todos, setTodos] = useState([]);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [todoToDelete, setTodoToDelete] = useState(null);
  const [showEditForm, setShowEditForm] = useState(false);
  const [showFormId, setShowFormId] = useState(null);
  const [refreshTodos, setRefreshTodos] = useState(false); 
  const [showAddForm, setShowAddForm] = useState(false);
  const [selectedYears, setSelectedYears] = useState([]);
  const [viewMode, setViewMode] = useState('cards'); // 'list' or 'cards'
  const [sortBy, setSortBy] = useState('newest'); // newest, oldest, cheapest, expensive, done, notdone

  const handleCloseForm = () => {
    setShowAddForm(false);
    setShowEditForm(false);
    setShowFormId(null);
  };

  const handleOpenForm = () => setShowAddForm(true);

  useEffect(() => {
    const token = localStorage.getItem('userToken');
  
    fetch(`${config.baseURL}/api/todo/${propertyId}`, {
      headers: {
        Authorization: `Bearer ${token}`
      }
    })
      .then(response => response.json())
      .then(data => {
        setTodos(data);
      })
      .catch(error => console.error('Error:', error));
  }, [propertyId, refreshTodos]);

  const refreshData = () => {
    setRefreshTodos(!refreshTodos);
  };

  const handleDeleteTodo = () => {
    if (!todoToDelete) {
      console.error('No todo selected for deletion');
      return;
    }

    const token = localStorage.getItem('userToken');
    
    fetch(`${config.baseURL}/api/todo/${todoToDelete.id}`, {
      method: 'DELETE',
      headers: {
        Authorization: `Bearer ${token}`
      }
    })
      .then(() => {
        const newTodos = todos.filter(todo => todo.id !== todoToDelete.id);
        setTodos(newTodos);
        setShowDeleteConfirm(false);
        toast.success('Tehtävä poistettu onnistuneesti');
      })
      .catch(error => console.error('Error:', error));
  };

  const handleUpdateTodo = (id, updatedTodo) => {
    const token = localStorage.getItem('userToken');

    fetch(`${config.baseURL}/api/todo/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`
      },
      body: JSON.stringify(updatedTodo)
    })
      .then(response => response.json())
      .then(data => {
        const updatedTodos = todos.map(todo => 
          todo.id === id ? data : todo
        );
        setTodos(updatedTodos);
        handleCloseForm();
        setRefreshTodos(!refreshTodos); 
        toast.success(`Tehtävä päivitetty: ${updatedTodo.action}`);
      })
      .catch(error => console.error('Error:', error));
  };

  const handleEditTodo = (id) => {
    setShowEditForm(true);
    setShowFormId(id);
  };

  const handleShowDeleteConfirm = (todo) => {
    setTodoToDelete(todo);
    setShowDeleteConfirm(true);
  };

  const handleYearSelection = (year) => {
    setSelectedYears((prevSelectedYears) =>
      prevSelectedYears.includes(year)
        ? prevSelectedYears.filter((y) => y !== year)
        : [...prevSelectedYears, year]
    );
  };

  // Get unique years from todos
  const uniqueYears = [...new Set(todos.map((todo) => new Date(todo.date).getFullYear()))].sort((a, b) => b - a);

  // Filter by selected years
  const filteredByYear = selectedYears.length
    ? todos.filter((todo) => selectedYears.includes(new Date(todo.date).getFullYear()))
    : todos;

  // Sort todos
  const sortedTodos = [...filteredByYear].sort((a, b) => {
    switch (sortBy) {
      case 'newest':
        return new Date(b.date) - new Date(a.date);
      case 'oldest':
        return new Date(a.date) - new Date(b.date);
      case 'cheapest':
        return parseFloat(a.cost) - parseFloat(b.cost);
      case 'expensive':
        return parseFloat(b.cost) - parseFloat(a.cost);
      case 'done':
        return b.isCompleted - a.isCompleted;
      case 'notdone':
        return a.isCompleted - b.isCompleted;
      default:
        return 0;
    }
  });

  // Calculate statistics
  const totalCost = sortedTodos.reduce((acc, todo) => acc + parseFloat(todo.cost || 0), 0);
  const completedCount = sortedTodos.filter(todo => todo.isCompleted).length;
  const pendingCount = sortedTodos.length - completedCount;

  return (
    <Container fluid className="py-4">
      <Row className="mb-4">
        <Col>
          <div className="d-flex justify-content-between align-items-center mb-3">
            <div>
              <h2 className="h3 mb-2">
                <CheckCircle size={28} className="me-2 text-primary" />
                Tehtävät
              </h2>
              <p className="text-muted mb-0">
                Hallinnoi kiinteistön huolto- ja korjaustehtäviä
              </p>
            </div>
            <Button variant="primary" size="lg" onClick={handleOpenForm}>
              <Plus size={20} className="me-2" />
              Lisää tehtävä
            </Button>
          </div>

          {/* Statistics */}
          <Row className="mb-4 g-3">
            <Col xs={6} md={3}>
              <Card className="border-0 shadow-sm text-center">
                <Card.Body>
                  <div className="text-muted small mb-1">Yhteensä</div>
                  <div className="h4 mb-0">{sortedTodos.length}</div>
                </Card.Body>
              </Card>
            </Col>
            <Col xs={6} md={3}>
              <Card className="border-0 shadow-sm text-center bg-success text-white">
                <Card.Body>
                  <div className="small mb-1">Valmiit</div>
                  <div className="h4 mb-0">{completedCount}</div>
                </Card.Body>
              </Card>
            </Col>
            <Col xs={6} md={3}>
              <Card className="border-0 shadow-sm text-center bg-warning text-dark">
                <Card.Body>
                  <div className="small mb-1">Kesken</div>
                  <div className="h4 mb-0">{pendingCount}</div>
                </Card.Body>
              </Card>
            </Col>
            <Col xs={6} md={3}>
              <Card className="border-0 shadow-sm text-center">
                <Card.Body>
                  <div className="text-muted small mb-1">Kokonaiskustannus</div>
                  <div className="h4 mb-0">{totalCost.toFixed(2)} €</div>
                </Card.Body>
              </Card>
            </Col>
          </Row>

          {/* Filters and View Toggle */}
          <Card className="border-0 shadow-sm mb-4">
            <Card.Body>
              <Row className="g-3">
                {/* Year filters */}
                {uniqueYears.length > 0 && (
                  <Col xs={12}>
                    <div className="small text-muted mb-2">Suodata vuoden mukaan:</div>
                    <div className="d-flex flex-wrap gap-2">
                      {uniqueYears.map((year) => (
                        <Badge
                          key={year}
                          bg={selectedYears.includes(year) ? 'primary' : 'light'}
                          text={selectedYears.includes(year) ? 'white' : 'dark'}
                          className="p-2"
                          style={{ cursor: 'pointer' }}
                          onClick={() => handleYearSelection(year)}
                        >
                          {year}
                        </Badge>
                      ))}
                    </div>
                  </Col>
                )}

                {/* Sort buttons */}
                <Col md={8}>
                  <div className="small text-muted mb-2">Järjestä:</div>
                  <ButtonGroup size="sm" className="flex-wrap">
                    <Button 
                      variant={sortBy === 'newest' ? 'primary' : 'outline-primary'}
                      onClick={() => setSortBy('newest')}
                    >
                      <SortDown size={14} className="me-1" />
                      Uusin
                    </Button>
                    <Button 
                      variant={sortBy === 'oldest' ? 'primary' : 'outline-primary'}
                      onClick={() => setSortBy('oldest')}
                    >
                      <SortUp size={14} className="me-1" />
                      Vanhin
                    </Button>
                    <Button 
                      variant={sortBy === 'cheapest' ? 'primary' : 'outline-primary'}
                      onClick={() => setSortBy('cheapest')}
                    >
                      Halvin
                    </Button>
                    <Button 
                      variant={sortBy === 'expensive' ? 'primary' : 'outline-primary'}
                      onClick={() => setSortBy('expensive')}
                    >
                      Kallein
                    </Button>
                    <Button 
                      variant={sortBy === 'done' ? 'primary' : 'outline-primary'}
                      onClick={() => setSortBy('done')}
                    >
                      <CheckCircleFill size={14} className="me-1" />
                      Valmiit
                    </Button>
                    <Button 
                      variant={sortBy === 'notdone' ? 'primary' : 'outline-primary'}
                      onClick={() => setSortBy('notdone')}
                    >
                      <Circle size={14} className="me-1" />
                      Kesken
                    </Button>
                  </ButtonGroup>
                </Col>

                {/* View mode toggle */}
                <Col md={4} className="text-md-end">
                  <div className="small text-muted mb-2">Näkymä:</div>
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
                </Col>
              </Row>
            </Card.Body>
          </Card>

          {/* Todos Display */}
          {sortedTodos.length === 0 ? (
            <Alert variant="info" className="d-flex align-items-center">
              <InfoCircle size={24} className="me-3" />
              <div>
                <strong>Ei tehtäviä</strong>
                <br />
                <small>Lisää ensimmäinen tehtävä yllä olevalla painikkeella</small>
              </div>
            </Alert>
          ) : viewMode === 'cards' ? (
            <Row className="g-3">
              {sortedTodos.map((todo) => (
                <Col key={todo.id} xs={12} md={6} lg={4}>
                  <Card className={`h-100 border-0 shadow-sm hover-lift ${todo.isCompleted ? 'border-start border-success border-4' : 'border-start border-warning border-4'}`}>
                    <Card.Body className="d-flex flex-column">
                      <div className="d-flex justify-content-between align-items-start mb-3">
                        <div className="me-2">
                          {todo.isCompleted ? (
                            <CheckCircleFill size={32} className="text-success" />
                          ) : (
                            <Circle size={32} className="text-warning" />
                          )}
                        </div>
                        <Badge bg={todo.isCompleted ? 'success' : 'warning'} text="dark">
                          {todo.isCompleted ? 'Valmis' : 'Kesken'}
                        </Badge>
                      </div>

                      <h5 className="mb-3">{todo.action}</h5>

                      <div className="mt-auto">
                        <div className="d-flex justify-content-between text-muted small mb-2">
                          <span>
                            <Calendar size={14} className="me-1" />
                            {new Date(todo.date).toLocaleDateString('fi-FI', {
                              year: 'numeric',
                              month: 'long',
                              day: 'numeric'
                            })}
                          </span>
                        </div>
                        <div className="d-flex justify-content-between align-items-center mb-3">
                          <span className="h5 mb-0 text-primary">
                            <CurrencyEuro size={20} />
                            {parseFloat(todo.cost || 0).toFixed(2)}
                          </span>
                        </div>

                        <div className="d-flex gap-2">
                          <Button 
                            variant="outline-primary" 
                            size="sm"
                            onClick={() => handleEditTodo(todo.id)}
                            className="flex-grow-1"
                          >
                            <PencilSquare size={16} className="me-1" />
                            Muokkaa
                          </Button>
                          <Button 
                            variant="outline-danger" 
                            size="sm"
                            onClick={() => handleShowDeleteConfirm(todo)}
                          >
                            <Trash size={16} />
                          </Button>
                        </div>
                      </div>
                    </Card.Body>
                  </Card>
                </Col>
              ))}
            </Row>
          ) : (
            <Table hover responsive className="border">
              <thead className="table-light">
                <tr>
                  <th style={{ width: '50px' }}>Tila</th>
                  <th>Tehtävä</th>
                  <th style={{ width: '150px' }}>Päivämäärä</th>
                  <th style={{ width: '120px' }}>Hinta</th>
                  <th style={{ width: '180px' }}>Toiminnot</th>
                </tr>
              </thead>
              <tbody>
                {sortedTodos.map((todo) => (
                  <tr key={todo.id}>
                    <td className="text-center">
                      {todo.isCompleted ? (
                        <CheckCircleFill size={24} className="text-success" />
                      ) : (
                        <Circle size={24} className="text-warning" />
                      )}
                    </td>
                    <td>
                      <strong>{todo.action}</strong>
                    </td>
                    <td className="text-muted small">
                      {new Date(todo.date).toLocaleDateString('fi-FI')}
                    </td>
                    <td>
                      <Badge bg="light" text="dark" className="fw-normal">
                        {parseFloat(todo.cost || 0).toFixed(2)} €
                      </Badge>
                    </td>
                    <td>
                      <div className="d-flex gap-2">
                        <Button 
                          variant="outline-primary" 
                          size="sm"
                          onClick={() => handleEditTodo(todo.id)}
                        >
                          <PencilSquare size={14} className="me-1" />
                          Muokkaa
                        </Button>
                        <Button 
                          variant="outline-danger" 
                          size="sm"
                          onClick={() => handleShowDeleteConfirm(todo)}
                        >
                          <Trash size={14} />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </Table>
          )}
        </Col>
      </Row>

      {/* Modals */}
      <AddTodoForm
        propertyId={propertyId}
        refreshData={refreshData}
        closeForm={handleCloseForm}
        show={showAddForm}
      />

      {showEditForm && (
        <EditTodoForm
          todo={todos.find(todo => todo.id === showFormId)}
          handleUpdateTodo={handleUpdateTodo}
          handleCloseForm={handleCloseForm}
        />
      )}

      {showDeleteConfirm && (
        <DeleteConfirmation
          handleDeleteProperty={handleDeleteTodo}
          setShowDeleteConfirm={setShowDeleteConfirm}
          todoTitle={todoToDelete?.action}
        />
      )}
    </Container>
  );
};

export default Todos;
