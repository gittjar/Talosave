import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Container, Row, Col, Card, Form, Button, Alert, FloatingLabel, Spinner } from 'react-bootstrap';
import { PersonCheck, Eye, EyeSlash, House } from 'react-bootstrap-icons';
import { useAuth } from '../contexts/AuthContext.jsx';
import { useApi } from '../hooks/useApi.js';
import { useForm } from '../hooks/useForm.js';

const LoginPage = () => {
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();
  const { login } = useAuth();
  const { loading, error, post, clearError } = useApi();
  
  const { values, handleChange, handleSubmit } = useForm(
    { username: '', password: '' },
    async (formData) => {
      try {
        const response = await post('/api/login', formData);
        
        if (response.token) {
          login(response.token, formData.username);
          // Store user ID if provided in response
          if (response.id) {
            localStorage.setItem('userId', response.id.toString());
          }
          navigate('/mypage');
        }
      } catch (error) {
        throw new Error('Väärä käyttäjätunnus tai salasana!');
      }
    }
  );

  const onSubmit = (e) => {
    const validationRules = {
      username: { required: true },
      password: { required: true }
    };
    handleSubmit(e, validationRules);
  };

  return (
    <div className="login-page">
      <Container fluid className="min-vh-100 d-flex align-items-center justify-content-center">
        <Row className="w-100 justify-content-center">
          <Col xs={12} sm={10} md={8} lg={6} xl={4}>
            {/* Login Card */}
            <Card className="login-card shadow-lg border-0">
              <Card.Body className="p-5">
                {/* Header */}
                <div className="text-center mb-4">
                  <div className="login-icon mb-3">
                    <House size={32} className="text-primary" />
                  </div>
                  <h2 className="fw-bold text-dark mb-2">Kirjaudu sisään</h2>
                  <p className="text-muted">Anna käyttäjätunnuksesi ja salasanasi</p>
                </div>

                {/* Error Alert */}
                {error && (
                  <Alert variant="danger" className="mb-4" dismissible onClose={clearError}>
                    {error}
                  </Alert>
                )}

                {/* Login Form */}
                <Form onSubmit={onSubmit}>
                  <div className="mb-3">
                    <FloatingLabel controlId="floatingUsername" label="Käyttäjätunnus">
                      <Form.Control 
                        type="text" 
                        name="username"
                        placeholder="Käyttäjätunnus"
                        value={values.username} 
                        onChange={handleChange}
                        required
                        className="login-input"
                      />
                    </FloatingLabel>
                  </div>

                  <div className="mb-4 position-relative">
                    <FloatingLabel controlId="floatingPassword" label="Salasana">
                      <Form.Control 
                        type={showPassword ? "text" : "password"}
                        name="password"
                        placeholder="Salasana"
                        value={values.password} 
                        onChange={handleChange}
                        required
                        className="login-input pe-5"
                      />
                    </FloatingLabel>
                    <Button
                      variant="link"
                      className="password-toggle position-absolute top-50 end-0 translate-middle-y me-3 p-0 border-0"
                      onClick={() => setShowPassword(!showPassword)}
                      tabIndex={-1}
                    >
                      {showPassword ? <EyeSlash size={20} /> : <Eye size={20} />}
                    </Button>
                  </div>

                  <div className="d-grid mb-3">
                    <Button 
                      type="submit" 
                      variant="primary" 
                      size="lg"
                      disabled={loading}
                      className="fw-semibold"
                    >
                      {loading ? (
                        <div className="d-flex flex-column align-items-center">
                          <div>
                            <Spinner size="sm" className="me-2" />
                            Kirjaudutaan...
                          </div>
                          <small style={{fontSize: '0.75rem', opacity: 0.9}}>Palvelin käynnistyy, odota hetki</small>
                        </div>
                      ) : (
                        <>
                          <PersonCheck size={20} className="me-2" />
                          Kirjaudu sisään
                        </>
                      )}
                    </Button>
                  </div>
                </Form>

                {/* Divider */}
                <hr className="my-4" />

                {/* Register Link */}
                <div className="text-center">
                  <p className="text-muted mb-2">Eikö sinulla ole vielä tiliä?</p>
                  <Button 
                    as={Link} 
                    to="/create-user" 
                    variant="outline-primary"
                    className="fw-semibold"
                  >
                    Luo uusi tili
                  </Button>
                </div>

                {/* Demo Info */}
                <div className="demo-info mt-4 p-3 bg-light rounded">
                  <h6 className="fw-bold mb-2 text-center">
                    Demo-tunnukset
                  </h6>
                  <div className="row">
                    <div className="col-6 text-center">
                      <small className="text-muted d-block">Käyttäjätunnus</small>
                      <code>smith</code>
                    </div>
                    <div className="col-6 text-center">
                      <small className="text-muted d-block">Salasana</small>
                      <code>salasana</code>
                    </div>
                  </div>
                </div>
              </Card.Body>
            </Card>
          </Col>
        </Row>
      </Container>
    </div>
  );
};

export default LoginPage;