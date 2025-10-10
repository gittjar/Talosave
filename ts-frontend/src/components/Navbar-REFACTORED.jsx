// components/Navbar.jsx - REFACTORED VERSION
import React from 'react';
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
  PersonCircle
} from 'react-bootstrap-icons';
import { useAuth } from '../hooks/useAuth.js';

const NavBar = () => {
  const { isLoggedIn, user, logout } = useAuth();
  const location = useLocation();

  const handleLogout = () => {
    logout();
  };

  return (
    <Navbar expand="lg" className="modern-navbar shadow-sm" sticky="top">
      <Container>
        {/* Brand */}
        <Navbar.Brand as={Link} to="/home" className="brand-link">
          <div className="d-flex align-items-center">
            <div className="brand-icon me-2">
              <Buildings size={24} />
            </div>
            <div>
              <span className="brand-name">TaloSave</span>
              <Badge bg="secondary" className="ms-2 brand-badge">Beta</Badge>
            </div>
          </div>
        </Navbar.Brand>

        {/* Mobile Toggle */}
        <Navbar.Toggle aria-controls="navbar-nav" className="border-0" />
        
        <Navbar.Collapse id="navbar-nav">
          {/* Main Navigation */}
          <Nav className="me-auto">
            <Nav.Link as={Link} to="/home" className="nav-item-modern">
              <House size={16} className="me-2" />
              Etusivu
            </Nav.Link>
            
            {!isLoggedIn && (
              <Nav.Link as={Link} to="/create-user" className="nav-item-modern">
                <PersonPlus size={16} className="me-2" />
                Rekisteröidy
              </Nav.Link>
            )}
          </Nav>

          {/* User Navigation */}
          <Nav className="ms-auto">
            {isLoggedIn ? (
              <>
                <Nav.Link as={Link} to="/mypage" className="nav-item-modern">
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
                  <NavDropdown.Item as={Link} to="/usersettings" className="dropdown-item-modern">
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
              <Nav.Link as={Link} to="/login" className="nav-item-modern login-btn">
                <BoxArrowInRight size={16} className="me-2" />
                Kirjaudu sisään
              </Nav.Link>
            )}

            {/* Info Dropdown */}
            <NavDropdown 
              title={<InfoCircle size={16} />}
              id="info-dropdown" 
              className="info-dropdown"
              align="end"
            >
              <NavDropdown.Item as={Link} to="/data-protection" className="dropdown-item-modern">
                <ShieldCheck size={14} className="me-2" />
                Tietosuoja
              </NavDropdown.Item>
              
              <NavDropdown.Item as={Link} to="/program-info" className="dropdown-item-modern">
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