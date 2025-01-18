import React from 'react';
import { Link, useParams } from 'react-router-dom';
import { Tab, Nav } from 'react-bootstrap';
import ShowElectricityConsumption from '../consumptions/ShowElectricityConsumption';
import ShowHeatingConsumption from '../consumptions/ShowHeatingConsumption';
import { BarChart } from 'react-bootstrap-icons';
import ShowWaterConsumption from '../consumptions/ShowWaterConsumption';
const image_house1 = '/assets/images/IMG_2727.WEBP';

const ConsumptionDetails = () => {
  const { id } = useParams();

  
  return (
    <div>



<Tab.Container id="left-tabs-example" defaultActiveKey="0">

  <Nav variant="tabs" className="nav-propertydetails">
  <Nav.Item>
    <Nav.Link eventKey="1" className='navlinks'>Sähkö <BarChart /></Nav.Link>
  </Nav.Item>
  <Nav.Item>
    <Nav.Link eventKey="2" className='navlinks'>Lämmitys <BarChart /></Nav.Link>
  </Nav.Item>
  <Nav.Item>
    <Nav.Link eventKey="3" className='navlinks'>Vesi <BarChart /></Nav.Link>
  </Nav.Item>
  <Nav.Item>
    <Nav.Link eventKey="4" className='navlinks'>Jätehuolto <BarChart /></Nav.Link>
  </Nav.Item>
</Nav>



<Tab.Content>
<Tab.Pane eventKey="0">
            <h4>Kohteen kulutuslukemat</h4>
            <figure>
  <img 
    src={image_house1} 
    style={{
      borderRadius: '10px', // This gives the image a border radius
      width: '50%', // This makes the image a bit smaller
      height: 'auto' // This maintains the aspect ratio of the image
    }} 
  />
</figure>

          </Tab.Pane>

  <Tab.Pane eventKey="1">
    {/* SÄHKÖ */}
  <ShowElectricityConsumption /> 
  </Tab.Pane>
  <Tab.Pane eventKey="2">
  <ShowHeatingConsumption />
      
  </Tab.Pane>
  <Tab.Pane eventKey="3">
    <section>
      <ShowWaterConsumption />
  </section>
  </Tab.Pane>
  <Tab.Pane eventKey="4">
  <p>Jäte kulutus - Coming soon</p>
  </Tab.Pane>
</Tab.Content>
</Tab.Container>

</div>

  );
};

export default ConsumptionDetails;