import { useState, useEffect } from 'react';
import config from '../configuration/config.js';
import DeleteConfirmation from '../notifications/DeleteConfirmation.jsx';
import EditTodoForm from '../forms/EditTodoForm.jsx';
import AddTodoForm from '../forms/AddTodoForm.jsx';
import { Plus } from 'react-bootstrap-icons';
import { toast } from 'react-toastify';


const getRandomColor = () => {
  let color = '#';
  for (let i = 0; i < 3; i++) {
    let part = Math.floor(Math.random() * 128 + 127).toString(16); // Generate a random number between 127 and 255 and convert it to hexadecimal
    color += part.length < 2 ? '0' + part : part; // Ensure each part has two digits
  }
  return color;
};

const Todos = ({ propertyId }) => {
    const [todos, setTodos] = useState([]);
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
    const [todoToDelete, setTodoToDelete] = useState(null);
    const [showEditForm, setShowEditForm] = useState(false);
    const [showFormId, setShowFormId] = useState(null);
    const [refreshTodos, setRefreshTodos] = useState(false); 
    const [activeButton, setActiveButton] = useState(null);
    const [colorMap, setColorMap] = useState({});
    const [isAddTodoFormVisible, setIsAddTodoFormVisible] = useState(false);
    const [viewMode, setViewMode] = useState('list'); // 'list' or 'cards'
    const [showAddForm, setShowAddForm] = useState(false);
    const handleOpenForm = () => setShowAddForm(true);
    const [selectedYears, setSelectedYears] = useState([]);
    const [todoTitle, setTodoTitle] = useState('');



const handleCloseForm = () => {
  setShowAddForm(false);
  //setShowFormId(null);
  setShowEditForm(false);
};

    const handleShowForm = (id) => {
        setShowFormId(id);
        setShowEditForm(true);
    }

    
/*
    const handleCloseForm = () => {
        setShowFormId(null);
        setShowEditForm(false);
    }*/
/*
    const toggleAddTodoForm = () => {setIsAddTodoFormVisible(!isAddTodoFormVisible);};
    const closeForm = () => {setIsAddTodoFormVisible(false);};
*/

    useEffect(() => {
      const token = localStorage.getItem('userToken');
    
      fetch(`${config.baseURL}/api/todo/${propertyId}`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      })
        .then(response => response.json())
        .then(data => {
          const colorMap = {};
          data.forEach(todo => {
            const year = new Date(todo.date).getFullYear();
            if (!colorMap[year]) {
              colorMap[year] = getRandomColor();
            }
          });
          setTodos(data);
          setColorMap(colorMap);
        })
        .catch(error => console.error('Error:', error));
    }, [propertyId, refreshTodos]);
    
         
    const sortNewest = () => {
      let sortedData = [...todos];
      sortedData.sort((a, b) => {
        const dateA = new Date(a.date);
        const dateB = new Date(b.date);
        return dateB - dateA; // Newest first
      });
      setTodos(sortedData);
    }

    const sortOldest = () => {
      let sortedData = [...todos];
      sortedData.sort((a, b) => {
        const dateA = new Date(a.date);
        const dateB = new Date(b.date);
        return dateA - dateB; // Oldest first
      });
      setTodos(sortedData);
    }
    
    const sortCheapest = () => {
      let sortedData = [...todos];
      sortedData.sort((a, b) => {
        const costA = parseFloat(a.cost);
        const costB = parseFloat(b.cost);
        return costA - costB; // Cheapest first
      });
      setTodos(sortedData);
    }

    const sortExpensive = () => {
      let sortedData = [...todos];
      sortedData.sort((a, b) => {
        const costA = parseFloat(a.cost);
        const costB = parseFloat(b.cost);
        return costB - costA; // Most expensive first
      });
      setTodos(sortedData);
    }

    const sortDone = () => {  
      let sortedData = [...todos];
      sortedData.sort((a, b) => {
        return b.isCompleted - a.isCompleted;
      });
      setTodos(sortedData);
    }

    const sortNotDone = () => {
      let sortedData = [...todos];
      sortedData.sort((a, b) => {
        return a.isCompleted - b.isCompleted; 
      });
      setTodos(sortedData);
    }

    const handleYearSelection = (year) => {
      setSelectedYears((prevSelectedYears) =>
        prevSelectedYears.includes(year)
          ? prevSelectedYears.filter((y) => y !== year)
          : [...prevSelectedYears, year]
      );
    };
  
    const filteredTodos = selectedYears.length
      ? todos.filter((todo) => selectedYears.includes(new Date(todo.date).getFullYear()))
      : todos;
  
    const uniqueYears = [...new Set(todos.map((todo) => new Date(todo.date).getFullYear()))];



    
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
          deleteTodo(todoToDelete.id);
          setShowDeleteConfirm(false);
          toast.success(' Tehtävä poistettu onnistuneesti');
        })
        .catch(error => console.error('Error:', error));
    };
  
    const deleteTodo = (id) => {
      const newTodos = todos.filter(todo => todo.id !== id);
      setTodos(newTodos);
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
          })
          .catch(error => console.error('Error:', error));
      }

    const handleEditTodo = (id) => {
        setShowEditForm(true);
        setShowFormId(id);
      }

      const handleShowDeleteConfirm = (todo) => {
        console.log('Setting todo to delete:', todo);
        setTodoToDelete(todo);
        setShowDeleteConfirm(true);
      };

    const handleCloseDeleteConfirm = () => {
        setShowDeleteConfirm(false);
        setTodoToDelete(null);
      }



  return (
    <div>
<button className='primary-button mb-2 d-flex align-items-center' onClick={handleOpenForm}>
  <Plus size={25} />
  <span className='ml-2'>Lisää uusi tehtävä</span>
  
</button>
      <AddTodoForm
        propertyId={propertyId}
        refreshData={refreshData}
        closeForm={handleCloseForm}
        show={showAddForm}
      />

      <section className='todopage'>
        <h4>Tehtäviä</h4>
        <section className='d-flex justify-content-between'>
        <span>Tehtävien määrä: {filteredTodos.length}</span>
        <p>Tehtävien hinta yhteensä: {filteredTodos.reduce((acc, todo) => acc + parseFloat(todo.cost), 0)} €</p>
        </section>
        <hr></hr>
        <section className='d-flex justify-content-between mb-3'>
          <section className='d-flex'>
            <button className={`link-black ${activeButton === 'sortNewest' ? 'active' : ''}`} onClick={() => { sortNewest(); setActiveButton('sortNewest'); }}>Uusin</button>
            <button className={`link-black ${activeButton === 'sortOldest' ? 'active' : ''}`} onClick={() => { sortOldest(); setActiveButton('sortOldest'); }}>Vanhin</button>
            <button className={`link-black ${activeButton === 'sortCheapest' ? 'active' : ''}`} onClick={() => { sortCheapest(); setActiveButton('sortCheapest'); }}>Halvin</button>
            <button className={`link-black ${activeButton === 'sortExpensive' ? 'active' : ''}`} onClick={() => { sortExpensive(); setActiveButton('sortExpensive'); }}>Kallein</button>
            <button className={`link-black ${activeButton === 'sortDone' ? 'active' : ''}`} onClick={() => { sortDone(); setActiveButton('sortDone'); }}>Tehty</button>
            <button className={`link-black ${activeButton === 'sortNotDone' ? 'active' : ''}`} onClick={() => { sortNotDone(); setActiveButton('sortNotDone'); }}>Tekemättä</button>
          </section>
          <section className='d-flex'>
            <button className={`link-black ${viewMode === 'list' ? 'active' : ''}`} onClick={() => setViewMode('list')}>List View</button>
            <button className={`link-black ${viewMode === 'cards' ? 'active' : ''}`} onClick={() => setViewMode('cards')}>Card View</button>
          </section>
        </section>

        <section className='mb-3 ml-3'>
          {uniqueYears.map((year) => (
            <div key={year} className='form-check form-check-inline border border-primary p-2 rounded px-4'>
              <input
                className='form-check-input p-2 border border-primary'
                type='checkbox'
                id={`year-${year}`}
                value={year}
                onChange={() => handleYearSelection(year)}
                checked={selectedYears.includes(year)}
              />
              <label className='form-check-label' htmlFor={`year-${year}`}>{year}</label>
            </div>
          ))}
        </section>

        {viewMode === 'list' ? (
          <table className='table table-striped'>
            <thead className='thead-dark'>
              <tr>
                <th>Todo</th>
                <th>Tehty</th>
                <th>Hinta</th>
                <th>Päiväys</th>
                <th>Muokkaa</th>
              </tr>
            </thead>
            <tbody>
              {filteredTodos.map((todo, index) => {
                const currentYear = new Date(todo.date).getFullYear();
                const nextYear = index < filteredTodos.length - 1 ? new Date(filteredTodos[index + 1].date).getFullYear() : null;
                const addBottomLine = nextYear && currentYear !== nextYear;
                const backgroundColor = colorMap[currentYear];

                return (
                  <tr key={todo.id} style={{ backgroundColor }} className={`panel ${todo.isCompleted ? 'panel-success' : 'panel-danger'} ${addBottomLine ? 'bottom-line' : ''}`}>
                    <td className='bg-light'>{todo.action}</td>
                    <td style={{ backgroundColor: todo.isCompleted ? 'lightgreen' : 'lightcoral' }}>
                      {todo.isCompleted ? 'Kyllä' : 'Ei'}
                    </td>
                    <td className='bg-light'>{todo.cost} €</td>
                    <td>{new Date(todo.date).toLocaleDateString()}</td>
                    <td className='bg-light'>
                      <button className='edit-link' onClick={() => handleEditTodo(todo.id)}>Muokkaa</button>
                      <button className='delete-link' onClick={() => handleShowDeleteConfirm(todo)}>Poista</button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        ) : (
          <div className='row'>
            {filteredTodos.map((todo, index) => {
              const currentYear = new Date(todo.date).getFullYear();
              const nextYear = index < filteredTodos.length - 1 ? new Date(filteredTodos[index + 1].date).getFullYear() : null;
              const addBottomLine = nextYear && currentYear !== nextYear;
              const backgroundColor = colorMap[currentYear];

              return (
                <div key={todo.id} className={`col-12 col-sm-6 col-md-4 col-lg-3 mb-3`}>
                  <div className='card' style={{ backgroundColor }}>
                    <div className='card-body'>
                      <section className='d-flex justify-content-between'>
                      <h5 className='card-title p-1'>{todo.action}</h5> 
                      <h5 className='card-title'>
                        <span className=' border border-dark p-1 rounded'>
                        {new Date(todo.date).getFullYear()}</span></h5>
                      </section>

                      
                        Tehty: <span className={`card-text ${todo.isCompleted ? 'bg-success p-1 rounded' : 'bg-warning p-1 rounded'}`}>{todo.isCompleted ? 'Kyllä' : 'Ei'}
                      </span>                      
<p className='card-text'>Hinta: {todo.cost} €</p>
                      <p className='card-text'>Päiväys: {new Date(todo.date).toLocaleDateString()}</p>
                      <section className=''>
                        <button className='edit-link bg-light rounded p-1' onClick={() => handleEditTodo(todo.id)}>Muokkaa</button>
                        <button className='delete-link bg-light rounded p-1 ml-1' onClick={() => handleShowDeleteConfirm(todo)}>Poista</button>
                      </section>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

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
      </section>
    </div>
  );
};

export default Todos;