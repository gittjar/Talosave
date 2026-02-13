import { useState, useEffect } from 'react';
import { Card, Row, Col, Button, Spinner, Alert, Modal, Image, Form, ButtonGroup, ListGroup } from 'react-bootstrap';
import { Trash3, PencilSquare, Grid3x3GapFill, ListUl } from 'react-bootstrap-icons';
import { toast } from 'react-toastify';
import config from '../configuration/config';

function PropertyImageGallery({ propertyId }) {
    const [images, setImages] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [showModal, setShowModal] = useState(false);
    const [selectedImage, setSelectedImage] = useState(null);
    const [deleting, setDeleting] = useState(null);
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
    const [imageToDelete, setImageToDelete] = useState(null);
    const [showEditModal, setShowEditModal] = useState(false);
    const [editingImage, setEditingImage] = useState(null);
    const [editFormData, setEditFormData] = useState({ image_name: '', description: '' });
    const [saving, setSaving] = useState(false);
    const [viewMode, setViewMode] = useState('grid');

    useEffect(() => {
        fetchImages();

        // Listen for upload events
        const handleUpload = (event) => {
            if (event.detail.propertyId === propertyId) {
                fetchImages();
            }
        };

        document.addEventListener('property-image-uploaded', handleUpload);
        return () => document.removeEventListener('property-image-uploaded', handleUpload);
    }, [propertyId]);

    const fetchImages = async () => {
        try {
            setLoading(true);
            setError(null);
            const token = localStorage.getItem('token');

            const response = await fetch(`${config.apiUrl}/properties/${propertyId}/images`, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            if (!response.ok) {
                throw new Error('Kuvien haku epäonnistui');
            }

            const data = await response.json();
            setImages(data);
        } catch (err) {
            console.error('Error fetching property images:', err);
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = (image) => {
        setImageToDelete(image);
        setShowDeleteConfirm(true);
    };

    const handleEdit = (image) => {
        setEditingImage(image);
        setEditFormData({
            image_name: image.image_name || '',
            description: image.description || ''
        });
        setShowEditModal(true);
    };

    const handleSaveEdit = async () => {
        if (!editingImage) return;

        try {
            setSaving(true);
            const token = localStorage.getItem('token');

            const response = await fetch(`${config.apiUrl}/properties/images/${editingImage.id}`, {
                method: 'PUT',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(editFormData)
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || 'Kuvan päivitys epäonnistui');
            }

            toast.success('Kuvan tiedot päivitetty');
            setShowEditModal(false);
            fetchImages();
        } catch (err) {
            console.error('Error updating image:', err);
            toast.error(err.message);
        } finally {
            setSaving(false);
        }
    };

    const confirmDelete = async () => {
        if (!imageToDelete) return;

        try {
            setDeleting(imageToDelete.id);
            const token = localStorage.getItem('token');

            const response = await fetch(`${config.apiUrl}/properties/images/${imageToDelete.id}`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            if (!response.ok) {
                throw new Error('Kuvan poisto epäonnistui');
            }

            toast.success('Kuva poistettu onnistuneesti');
            setImages(images.filter(img => img.id !== imageToDelete.id));
        } catch (err) {
            console.error('Error deleting image:', err);
            toast.error(err.message);
        } finally {
            setDeleting(null);
            setShowDeleteConfirm(false);
            setImageToDelete(null);
        }
    };

    const handleImageClick = (image) => {
        setSelectedImage(image);
        setShowModal(true);
    };

    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleDateString('fi-FI');
    };

    const formatFileSize = (bytes) => {
        if (!bytes) return 'N/A';
        if (bytes < 1024) return bytes + ' B';
        if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
        return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
    };

    if (loading) {
        return (
            <div className="text-center p-4">
                <Spinner animation="border" role="status">
                    <span className="visually-hidden">Ladataan...</span>
                </Spinner>
            </div>
        );
    }

    if (error) {
        return <Alert variant="danger">Virhe: {error}</Alert>;
    }

    if (images.length === 0) {
        return (
            <Alert variant="info" className="text-center">
                <div className="mb-2">
                    <strong>Ei kuvia</strong>
                </div>
                <p className="mb-0">
                    Klikkaa <strong>"Lisää kuva"</strong> -nappia lisätäksesi ensimmäisen kuvan.
                </p>
            </Alert>
        );
    }

    return (
        <>
            {/* View Mode Toggle */}
            <div className="d-flex justify-content-between align-items-center mb-3">
                <small className="text-muted">{images.length} kuvaa</small>
                <ButtonGroup size="sm">
                    <Button
                        variant={viewMode === 'grid' ? 'primary' : 'outline-secondary'}
                        onClick={() => setViewMode('grid')}
                    >
                        <Grid3x3GapFill className="me-1" />
                        Kortit
                    </Button>
                    <Button
                        variant={viewMode === 'list' ? 'primary' : 'outline-secondary'}
                        onClick={() => setViewMode('list')}
                    >
                        <ListUl className="me-1" />
                        Lista
                    </Button>
                </ButtonGroup>
            </div>

            {/* List View */}
            {viewMode === 'list' && (
                <ListGroup className="mb-3">
                    {images.map((image) => (
                        <ListGroup.Item
                            key={image.id}
                            className="d-flex justify-content-between align-items-center"
                            style={{
                                padding: '0.75rem 1rem',
                                transition: 'background-color 0.2s ease',
                                cursor: 'pointer'
                            }}
                            onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#f8f9fa'}
                            onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                            onClick={() => handleImageClick(image)}
                        >
                            <div className="d-flex align-items-center flex-grow-1">
                                <div
                                    style={{
                                        width: '60px',
                                        height: '60px',
                                        marginRight: '1rem',
                                        borderRadius: '8px',
                                        overflow: 'hidden',
                                        flexShrink: 0,
                                        backgroundColor: '#f8f9fa'
                                    }}
                                >
                                    <img
                                        src={image.image_url}
                                        alt={image.image_name || 'Thumbnail'}
                                        style={{
                                            width: '100%',
                                            height: '100%',
                                            objectFit: 'cover'
                                        }}
                                        onError={(e) => {
                                            e.target.src = 'https://via.placeholder.com/60x60?text=?';
                                        }}
                                    />
                                </div>
                                <div className="flex-grow-1">
                                    <div style={{ fontWeight: '600', color: '#2c3e50', marginBottom: '0.25rem' }}>
                                        {image.image_name || 'Nimetön kuva'}
                                    </div>
                                    {image.description && (
                                        <div
                                            className="small text-muted"
                                            style={{
                                                overflow: 'hidden',
                                                textOverflow: 'ellipsis',
                                                whiteSpace: 'nowrap',
                                                maxWidth: '400px'
                                            }}
                                        >
                                            {image.description}
                                        </div>
                                    )}
                                    <div className="small text-muted mt-1">
                                        📅 {formatDate(image.upload_date)} • 💾 {formatFileSize(image.file_size)}
                                    </div>
                                </div>
                            </div>
                            <div className="d-flex gap-2">
                                <Button
                                    variant="outline-primary"
                                    size="sm"
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        handleEdit(image);
                                    }}
                                    style={{ borderRadius: '6px' }}
                                >
                                    <PencilSquare />
                                </Button>
                                <Button
                                    variant="outline-danger"
                                    size="sm"
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        handleDelete(image);
                                    }}
                                    disabled={deleting === image.id}
                                    style={{ borderRadius: '6px' }}
                                >
                                    {deleting === image.id ? (
                                        <Spinner animation="border" size="sm" />
                                    ) : (
                                        <Trash3 />
                                    )}
                                </Button>
                            </div>
                        </ListGroup.Item>
                    ))}
                </ListGroup>
            )}

            {/* Grid View */}
            {viewMode === 'grid' && (
                <Row xs={1} sm={2} md={3} lg={4} className="g-4">
                    {images.map((image) => (
                        <Col key={image.id}>
                            <Card
                                className="h-100 shadow-sm border-0"
                                style={{
                                    transition: 'all 0.3s ease',
                                    overflow: 'hidden'
                                }}
                                onMouseEnter={(e) => {
                                    e.currentTarget.style.transform = 'translateY(-5px)';
                                    e.currentTarget.style.boxShadow = '0 8px 16px rgba(0,0,0,0.15)';
                                }}
                                onMouseLeave={(e) => {
                                    e.currentTarget.style.transform = 'translateY(0)';
                                    e.currentTarget.style.boxShadow = '0 2px 4px rgba(0,0,0,0.1)';
                                }}
                            >
                                <div
                                    style={{
                                        height: '220px',
                                        overflow: 'hidden',
                                        cursor: 'pointer',
                                        position: 'relative',
                                        backgroundColor: '#f8f9fa'
                                    }}
                                    onClick={() => handleImageClick(image)}
                                >
                                    <Card.Img
                                        variant="top"
                                        src={image.image_url}
                                        alt={image.image_name || 'Kohteen kuva'}
                                        style={{
                                            width: '100%',
                                            height: '100%',
                                            objectFit: 'cover',
                                            transition: 'transform 0.3s ease'
                                        }}
                                        onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.05)'}
                                        onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
                                        onError={(e) => {
                                            e.target.onerror = null;
                                            e.target.src = 'https://via.placeholder.com/400x300?text=Kuva+ei+saatavilla';
                                        }}
                                    />
                                    <div
                                        style={{
                                            position: 'absolute',
                                            top: 0,
                                            left: 0,
                                            right: 0,
                                            bottom: 0,
                                            background: 'linear-gradient(to bottom, transparent 60%, rgba(0,0,0,0.5))',
                                            opacity: 0,
                                            transition: 'opacity 0.3s ease',
                                            display: 'flex',
                                            alignItems: 'flex-end',
                                            padding: '15px',
                                            color: 'white'
                                        }}
                                        onMouseEnter={(e) => e.currentTarget.style.opacity = 1}
                                        onMouseLeave={(e) => e.currentTarget.style.opacity = 0}
                                    >
                                        <small>Klikkaa suurentaaksesi</small>
                                    </div>
                                </div>
                                <Card.Body className="d-flex flex-column" style={{ padding: '1rem' }}>
                                    <Card.Title
                                        style={{
                                            fontSize: '1rem',
                                            fontWeight: '600',
                                            marginBottom: '0.5rem',
                                            color: '#2c3e50',
                                            display: '-webkit-box',
                                            WebkitLineClamp: 2,
                                            WebkitBoxOrient: 'vertical',
                                            overflow: 'hidden',
                                            minHeight: '2.5rem'
                                        }}
                                        title={image.image_name}
                                    >
                                        {image.image_name || 'Nimetön kuva'}
                                    </Card.Title>
                                    {image.description && (
                                        <Card.Text
                                            className="small text-muted mb-3"
                                            style={{
                                                display: '-webkit-box',
                                                WebkitLineClamp: 3,
                                                WebkitBoxOrient: 'vertical',
                                                overflow: 'hidden',
                                                lineHeight: '1.4',
                                                minHeight: '3.6rem'
                                            }}
                                        >
                                            {image.description}
                                        </Card.Text>
                                    )}
                                    <div className="small text-muted mb-3" style={{ marginTop: 'auto' }}>
                                        <div className="d-flex justify-content-between align-items-center">
                                            <span>📅 {formatDate(image.upload_date)}</span>
                                            <span>💾 {formatFileSize(image.file_size)}</span>
                                        </div>
                                    </div>
                                    <div className="d-flex gap-2">
                                        <Button
                                            variant="outline-primary"
                                            size="sm"
                                            onClick={() => handleEdit(image)}
                                            className="flex-grow-1"
                                            style={{ borderRadius: '8px', fontWeight: '500' }}
                                        >
                                            <PencilSquare className="me-1" />
                                            Muokkaa
                                        </Button>
                                        <Button
                                            variant="danger"
                                            size="sm"
                                            onClick={() => handleDelete(image)}
                                            disabled={deleting === image.id}
                                            className="flex-grow-1"
                                            style={{ borderRadius: '8px', fontWeight: '500' }}
                                        >
                                            {deleting === image.id ? (
                                                <Spinner animation="border" size="sm" />
                                            ) : (
                                                <>
                                                    <Trash3 className="me-1" />
                                                    Poista
                                                </>
                                            )}
                                        </Button>
                                    </div>
                                </Card.Body>
                            </Card>
                        </Col>
                    ))}
                </Row>
            )}

            {/* Image Preview Modal */}
            <Modal show={showModal} onHide={() => setShowModal(false)} size="lg" centered>
                <Modal.Header closeButton>
                    <Modal.Title>
                        {selectedImage?.image_name || 'Kohteen kuva'}
                    </Modal.Title>
                </Modal.Header>
                <Modal.Body className="text-center">
                    {selectedImage && (
                        <>
                            <Image
                                src={selectedImage.image_url}
                                alt={selectedImage.image_name || 'Kohteen kuva'}
                                fluid
                                style={{ maxHeight: '70vh' }}
                            />
                            {selectedImage.description && (
                                <p className="mt-3 text-muted">{selectedImage.description}</p>
                            )}
                            <div className="mt-2 text-muted small">
                                <span>Lisätty: {formatDate(selectedImage.upload_date)}</span>
                                <span className="ms-3">Koko: {formatFileSize(selectedImage.file_size)}</span>
                            </div>
                        </>
                    )}
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={() => setShowModal(false)}>
                        Sulje
                    </Button>
                    <Button
                        variant="danger"
                        onClick={() => {
                            handleDelete(selectedImage);
                            setShowModal(false);
                        }}
                    >
                        <Trash3 className="me-2" />
                        Poista kuva
                    </Button>
                </Modal.Footer>
            </Modal>

            {/* Delete Confirmation Modal */}
            <Modal show={showDeleteConfirm} onHide={() => setShowDeleteConfirm(false)} centered>
                <Modal.Header closeButton>
                    <Modal.Title>Vahvista poisto</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <p>
                        Haluatko varmasti poistaa kuvan <strong>{imageToDelete?.image_name || 'Nimetön kuva'}</strong>?
                    </p>
                    <Alert variant="warning" className="mb-0">
                        <small>Tämä toiminto ei ole palautettavissa.</small>
                    </Alert>
                </Modal.Body>
                <Modal.Footer>
                    <Button
                        variant="secondary"
                        onClick={() => {
                            setShowDeleteConfirm(false);
                            setImageToDelete(null);
                        }}
                        disabled={deleting}
                    >
                        Peruuta
                    </Button>
                    <Button
                        variant="danger"
                        onClick={confirmDelete}
                        disabled={deleting}
                    >
                        {deleting ? (
                            <>
                                <Spinner as="span" animation="border" size="sm" className="me-2" />
                                Poistetaan...
                            </>
                        ) : (
                            <>
                                <Trash3 className="me-2" />
                                Poista kuva
                            </>
                        )}
                    </Button>
                </Modal.Footer>
            </Modal>

            {/* Edit Image Modal */}
            <Modal show={showEditModal} onHide={() => setShowEditModal(false)} centered>
                <Modal.Header closeButton>
                    <Modal.Title>Muokkaa kuvan tietoja</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <Form>
                        <Form.Group className="mb-3">
                            <Form.Label>Kuvan nimi</Form.Label>
                            <Form.Control
                                type="text"
                                placeholder="Esim. Talon julkisivu"
                                value={editFormData.image_name}
                                onChange={(e) => setEditFormData({
                                    ...editFormData,
                                    image_name: e.target.value
                                })}
                            />
                        </Form.Group>
                        <Form.Group className="mb-3">
                            <Form.Label>Kuvaus</Form.Label>
                            <Form.Control
                                as="textarea"
                                rows={3}
                                placeholder="Lisää tarkempi kuvaus kuvasta..."
                                value={editFormData.description}
                                onChange={(e) => setEditFormData({
                                    ...editFormData,
                                    description: e.target.value
                                })}
                            />
                            <Form.Text className="text-muted">
                                Max 500 merkkiä
                            </Form.Text>
                        </Form.Group>
                    </Form>
                </Modal.Body>
                <Modal.Footer>
                    <Button
                        variant="secondary"
                        onClick={() => setShowEditModal(false)}
                        disabled={saving}
                    >
                        Peruuta
                    </Button>
                    <Button
                        variant="primary"
                        onClick={handleSaveEdit}
                        disabled={saving}
                    >
                        {saving ? (
                            <>
                                <Spinner as="span" animation="border" size="sm" className="me-2" />
                                Tallennetaan...
                            </>
                        ) : (
                            'Tallenna'
                        )}
                    </Button>
                </Modal.Footer>
            </Modal>
        </>
    );
}

export default PropertyImageGallery;
