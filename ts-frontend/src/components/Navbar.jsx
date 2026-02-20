import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Container, Nav, Navbar, NavDropdown, Badge } from 'react-bootstrap';
import { 
  House, 
  PersonPlus, 
  BoxArrowInRight, 
  BoxArrowRight, 
  Buildings, 
  GearFill, 
  InfoCircle, 
  ShieldCheck,
  PersonCircle,
  Lightning,
  Calendar2Check
} from 'react-bootstrap-icons';
import { useAuth } from '../contexts/AuthContext.jsx';

const NavBar = () => {
  const { isLoggedIn, user, logout } = useAuth();
  const location = useLocation();
  const [expanded, setExpanded] = useState(false);

  const handleLogout = () => {
    logout();
    setExpanded(false);
  };

  const closeNav = () => {
    setExpanded(false);
  };

  return (
    <Navbar expanded={expanded} onToggle={setExpanded} expand="lg" className="modern-navbar shadow-sm" sticky="top">
      <Container>
        {/* Brand */}
        <Navbar.Brand as={Link} to="/home" onClick={closeNav} className="brand-link">
          <div className="d-flex align-items-center">
            <div className="brand-icon me-2">
              <Buildings size={24} />
            </div>
            <div>
              <span className="brand-name">Talotieto</span>
              <Badge bg="secondary" className="ms-2 brand-badge">Beta</Badge>
            </div>
          </div>
        </Navbar.Brand>

        {/* Mobile Toggle */}
        <Navbar.Toggle aria-controls="navbar-nav" className="border-0" />
        
        <Navbar.Collapse id="navbar-nav">
          {/* Main Navigation */}
          <Nav className="me-auto">
            <Nav.Link 
              as={Link} 
              to="/home" 
              onClick={closeNav}
              className={`nav-item-modern ${location.pathname === '/home' || location.pathname === '/' ? 'active' : ''}`}
            >
              <House size={16} className="me-2" />
              Etusivu
            </Nav.Link>
            
            <Nav.Link 
              as={Link} 
              to="/electricity-price" 
              onClick={closeNav}
              className={`nav-item-modern ${location.pathname === '/electricity-price' ? 'active' : ''}`}
            >
              <Lightning size={16} className="me-2" />
              Pörssisähkö
            </Nav.Link>
            
            <Nav.Link 
              as={Link} 
              to="/maintenance-schedule" 
              onClick={closeNav}
              className={`nav-item-modern ${location.pathname === '/maintenance-schedule' ? 'active' : ''}`}
            >
              <Calendar2Check size={16} className="me-2" />
              Huoltoaikataulu
            </Nav.Link>
            
            {!isLoggedIn && (
              <Nav.Link 
                as={Link} 
                to="/create-user" 
                onClick={closeNav}
                className={`nav-item-modern ${location.pathname === '/create-user' ? 'active' : ''}`}
              >
                <PersonPlus size={16} className="me-2" />
                Rekisteröidy
              </Nav.Link>
            )}
          </Nav>

          {/* User Navigation */}
          <Nav className="ms-auto">
            {isLoggedIn ? (
              <>
                <Nav.Link 
                  as={Link} 
                  to="/mypage" 
                  onClick={closeNav}
                  className={`nav-item-modern ${location.pathname === '/mypage' ? 'active' : ''}`}
                >
                  <Buildings size={16} className="me-2" />
                  Rakennukset
                </Nav.Link>
                
                {/* User Dropdown */}
                <NavDropdown 
                  title={
                    <span className="user-dropdown-title">
                      <PersonCircle size={18} className="me-2" />
                      {user?.username || 'Käyttäjä'}
                    </span>
                  }
                  id="user-dropdown" 
                  className="user-dropdown"
                  align="end"
                >
                  <NavDropdown.Item as={Link} to="/usersettings" onClick={closeNav} className="dropdown-item-modern">
                    <GearFill size={14} className="me-2" />
                    Tilin asetukset
                  </NavDropdown.Item>
                  
                  <NavDropdown.Divider />
                  
                  <NavDropdown.Item as={Link} to="/login" onClick={handleLogout} className="dropdown-item-modern logout-item">
                    <BoxArrowRight size={14} className="me-2" />
                    Kirjaudu ulos
                  </NavDropdown.Item>
                </NavDropdown>
              </>
            ) : (
              <Nav.Link 
                as={Link} 
                to="/login" 
                onClick={closeNav}
                className={`nav-item-modern login-btn ${location.pathname === '/login' ? 'active' : ''}`}
              >
                <BoxArrowInRight size={16} className="me-2" />
                Kirjaudu sisään
              </Nav.Link>
            )}

            {/* Info Dropdown */}
            <NavDropdown 
              title={
                <span>
                  <InfoCircle size={16} />
                </span>
              }
              id="info-dropdown" 
              className="info-dropdown"
              align="end"
            >
              <NavDropdown.Item as={Link} to="/data-protection" onClick={closeNav} className="dropdown-item-modern">
                <ShieldCheck size={14} className="me-2" />
                Tietosuoja
              </NavDropdown.Item>
              
              <NavDropdown.Item as={Link} to="/program-info" onClick={closeNav} className="dropdown-item-modern">
                <InfoCircle size={14} className="me-2" />
                Ohjelman tiedot
              </NavDropdown.Item>
            </NavDropdown>
          </Nav>
        </Navbar.Collapse>
      </Container>
    </Navbar>
  );
};

export default NavBar;