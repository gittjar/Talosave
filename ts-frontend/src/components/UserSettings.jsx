import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Container, Row, Col, Card, Button, Spinner, Alert } from 'react-bootstrap';
import { PersonGear, PencilSquare, ArrowLeft, PersonFill, Envelope, Telephone, Person } from 'react-bootstrap-icons';
import config from '../configuration/config.js';
import EditUserForm from '../forms/EditUserForm.jsx';

const UserSettings = () => {
    const [user, setUser] = useState(null);
    const [isEditing, setIsEditing] = useState(false);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchUser = async () => {
            const username = localStorage.getItem('username');
            
            if (!username) {
                setError('Käyttäjätunnus ei löytynyt. Kirjaudu uudelleen sisään.');
                setLoading(false);
                return;
            }

            try {
                const response = await fetch(`${config.baseURL}/api/users/${username}`, {
                    method: 'GET',
                    headers: {
                        'Authorization': `Bearer ${localStorage.getItem('userToken')}`
                    }
                });

                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }

                const data = await response.json();
                setUser(data);
            } catch (error) {
                console.error('Error:', error);
                setError('Käyttäjätietojen lataaminen epäonnistui.');
            } finally {
                setLoading(false);
            }
        };

        fetchUser();
    }, []);

    const toggleEdit = () => {
        setIsEditing(!isEditing);
    };

    const handleUserUpdate = async (updatedUser) => {
        const username = localStorage.getItem('username');
        
        if (!username) {
            setError('Käyttäjätunnus ei löytynyt');
            return;
        }

        try {
            const response = await fetch(`${config.baseURL}/api/users/${username}`, {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('userToken')}`
                }
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const data = await response.json();
            setUser(data);
            setIsEditing(false);
        } catch (error) {
            console.error('Error:', error);
            setError('Käyttäjätietojen päivittäminen epäonnistui.');
        }
    };

    if (loading) {
        return (
            <div className="user-settings">
                <Container fluid className="min-vh-100 d-flex align-items-center justify-content-center">
                    <div className="text-center">
                        <Spinner animation="border" variant="primary" className="mb-3" />
                        <p className="text-muted">Ladataan käyttäjätietoja...</p>
                    </div>
                </Container>
            </div>
        );
    }

    return (
        <div className="user-settings">
            <Container fluid className="min-vh-100 d-flex align-items-center justify-content-center">
                <Row className="w-100 justify-content-center">
                    <Col xs={12} sm={10} md={8} lg={6} xl={5}>
                        {/* User Settings Card */}
                        <Card className="user-settings-card shadow-sm border-0">
                            <Card.Body className="p-4">
                                {/* Header */}
                                <div className="text-center mb-4">
                                    <div className="user-settings-icon mb-3">
                                        <PersonGear size={32} className="text-primary" />
                                    </div>
                                    <h2 className="fw-bold text-dark mb-2">Tilin asetukset</h2>
                                    <p className="text-muted">Hallitse käyttäjätietojasi</p>
                                </div>

                                {/* Error Alert */}
                                {error && (
                                    <Alert variant="danger" className="mb-4" dismissible onClose={() => setError(null)}>
                                        {error}
                                    </Alert>
                                )}

                                {/* User Information */}
                                {user && !isEditing && (
                                    <div className="user-info mb-4">
                                        <div className="info-item mb-3">
                                            <div className="d-flex align-items-center mb-2">
                                                <Person size={16} className="text-primary me-2" />
                                                <small className="text-muted fw-medium">Käyttäjä ID</small>
                                            </div>
                                            <div className="info-value">
                                                {user.userid}
                                            </div>
                                        </div>

                                        <div className="info-item mb-3">
                                            <div className="d-flex align-items-center mb-2">
                                                <Person size={16} className="text-primary me-2" />
                                                <small className="text-muted fw-medium">Käyttäjätunnus</small>
                                            </div>
                                            <div className="info-value">
                                                {user.username}
                                            </div>
                                        </div>

                                        <div className="info-item mb-3">
                                            <div className="d-flex align-items-center mb-2">
                                                <PersonFill size={16} className="text-primary me-2" />
                                                <small className="text-muted fw-medium">Koko nimi</small>
                                            </div>
                                            <div className="info-value">
                                                {user.fullname || 'Ei määritelty'}
                                            </div>
                                        </div>

                                        <div className="info-item mb-3">
                                            <div className="d-flex align-items-center mb-2">
                                                <Envelope size={16} className="text-primary me-2" />
                                                <small className="text-muted fw-medium">Sähköposti</small>
                                            </div>
                                            <div className="info-value">
                                                {user.email || 'Ei määritelty'}
                                            </div>
                                        </div>

                                        <div className="info-item mb-4">
                                            <div className="d-flex align-items-center mb-2">
                                                <Telephone size={16} className="text-primary me-2" />
                                                <small className="text-muted fw-medium">Puhelin</small>
                                            </div>
                                            <div className="info-value">
                                                {user.phone || 'Ei määritelty'}
                                            </div>
                                        </div>

                                        {/* Edit Button */}
                                        <div className="d-grid mb-3">
                                            <Button 
                                                variant="primary" 
                                                onClick={toggleEdit}
                                                className="fw-semibold"
                                            >
                                                <PencilSquare size={16} className="me-2" />
                                                Muokkaa tietoja
                                            </Button>
                                        </div>
                                    </div>
                                )}

                                {/* Edit Form */}
                                {isEditing && (
                                    <div className="edit-form mb-4">
                                        <div className="d-flex justify-content-between align-items-center mb-3">
                                            <h5 className="mb-0">Muokkaa tietoja</h5>
                                            <Button 
                                                variant="outline-secondary" 
                                                size="sm"
                                                onClick={toggleEdit}
                                            >
                                                Peruuta
                                            </Button>
                                        </div>
                                        <EditUserForm 
                                            user={user} 
                                            onUserUpdate={handleUserUpdate} 
                                            toggleEdit={toggleEdit} 
                                        />
                                    </div>
                                )}

                                {/* Navigation */}
                                <div className="text-center">
                                    <hr className="my-4" />
                                    <Button 
                                        as={Link} 
                                        to="/mypage" 
                                        variant="outline-primary"
                                        className="fw-semibold"
                                    >
                                        <ArrowLeft size={16} className="me-2" />
                                        Takaisin rakennuksiin
                                    </Button>
                                </div>
                            </Card.Body>
                        </Card>
                    </Col>
                </Row>
            </Container>
        </div>
    );
};

export default UserSettings;