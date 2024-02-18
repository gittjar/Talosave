// MyPage.jsx
import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom'; 
import { useProperties } from '../hooks/PropertyProvider.jsx';
import { createContext } from 'react';
import { Link } from 'react-router-dom';

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
        <h1>My Page</h1>
      <section className='card-grid'>
        {properties.map(property => (
            <div className="card" style={{width: "18rem"}} key={property.id}>
          <img src="src/assets/images/house-1.jpeg" className="card-img-top" />
            <div className="card-body">
              <h5 className="card-title">{property.propertyname}</h5>
              {/* Display other property details as needed */}
              <p className="card-text">{property.description}</p>
              <Link to={`/properties/${property.propertyid}`}>View Details</Link>
            </div>
          </div>
        ))}

    
        </section>
        <article className='thinline'></article>
        <div>
          <button onClick={handleAddProperty} className="primary-button">Add Property</button>
        </div>
      </div>
    );
};

export default MyPage;