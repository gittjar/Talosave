// MyPage.jsx
import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom'; 
import { useProperties } from '../hooks/PropertyProvider.jsx';
import { createContext } from 'react';

export const PropertyContext = createContext();

const MyPage = () => {
    const { properties, fetchProperties } = useProperties();
    const navigate = useNavigate(); 

    useEffect(() => {
      fetchProperties();
    }, [fetchProperties]);

    const handleAddProperty = () => {
        navigate('/add-property'); 
    };

    return (
      <div>
        <h1>My Properties</h1>
    
        {properties.map(property => (
            <div className="card" style={{width: "18rem"}} key={property.id}>
          <img src="image.jpg" className="card-img-top" alt="..." />
            <div className="card-body">
              <h5 className="card-title">{property.propertyname}</h5>
              {/* Display other property details as needed */}
              <p className="card-text">{property.description}</p>
              <a href="#" className="btn btn-primary">Go somewhere</a>
            </div>
          </div>
        ))}

        <div>
          <button onClick={handleAddProperty} className="addbutton">Add Property</button>
        </div>
      </div>
    );
};

export default MyPage;