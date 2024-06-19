import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import Container from 'react-bootstrap/Container';
import Nav from 'react-bootstrap/Nav';
import Navbar from 'react-bootstrap/Navbar';
import NavDropdown from 'react-bootstrap/NavDropdown';

const NavBar = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const location = useLocation();

  useEffect(() => {
    const token = localStorage.getItem('userToken');
    setIsLoggedIn(!!token);
  }, [location]); // Re-render when the location changes

  const handleLogout = () => {
    localStorage.removeItem('userToken');
    setIsLoggedIn(false);
  };

  return (
    <nav className='navibar'>
    <Navbar expand="lg" className="bg-body-tertiary navibar-color">
      <Container>
        <Navbar.Brand as={Link} to="/home">TaloSave App (v.1.0)</Navbar.Brand>
        <Navbar.Toggle aria-controls="basic-navbar-nav" />
        <Navbar.Collapse id="basic-navbar-nav">
          <Nav className="me-auto">
            <Nav.Link as={Link} to="/home">Home</Nav.Link>
            <Nav.Link as={Link} to="/create-user">Create User</Nav.Link>
            {isLoggedIn ? (
              <>
                <Nav.Link as={Link} to="/login" onClick={handleLogout}>Logout</Nav.Link>
                <Nav.Link as={Link} to="/mypage">My Page</Nav.Link>
              </>
            ) : (
              <Nav.Link as={Link} to="/login">Login</Nav.Link>
            )}
            <NavDropdown title="Dropdown" id="basic-nav-dropdown">
              <NavDropdown.Item href="#action/3.1">Action</NavDropdown.Item>
              <NavDropdown.Item href="#action/3.2">Another action</NavDropdown.Item>
              <NavDropdown.Item href="#action/3.3">Something</NavDropdown.Item>
              <NavDropdown.Divider />
              <NavDropdown.Item href="#action/3.4">Copyright JarnoK 2024</NavDropdown.Item>
            </NavDropdown>
          </Nav>
        </Navbar.Collapse>

      </Container>

    </Navbar>
    </nav>
  );
};

export default NavBar;