import React from 'react';
import { Link, useParams } from 'react-router-dom';
import { Tab, Nav } from 'react-bootstrap';
import ShowElectricityConsumption from '../consumptions/ShowElectricityConsumption';
import { BarChart } from 'react-bootstrap-icons';

const ConsumptionDetails = () => {
  const { id } = useParams();

  
  return (
    <div>


<Tab.Container id="left-tabs-example" defaultActiveKey="first">
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
  <Tab.Pane eventKey="1">
    {/* SÄHKÖ */}
  <ShowElectricityConsumption /> 
  </Tab.Pane>
  <Tab.Pane eventKey="2">
  <div className='d-flex'>
  Lämmitys kulutus - Coming soon
  </div>
  </Tab.Pane>
  <Tab.Pane eventKey="3">
    <section>
Vesi kulutus - Coming soon
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