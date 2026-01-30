import { useState, useEffect } from 'react';
import { Card, Row, Col, Button, Spinner, Alert, Modal, Image } from 'react-bootstrap';
import { Trash3 } from 'react-bootstrap-icons';
import { toast } from 'react-toastify';
import config from '../configuration/config';

function RenovationImageGallery({ renovationId, onUpdate }) {
    const [images, setImages] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [showModal, setShowModal] = useState(false);
    const [selectedImage, setSelectedImage] = useState(null);
    const [deleting, setDeleting] = useState(null);

    useEffect(() => {
        fetchImages();
        
        // Listen for upload events to refresh gallery
        const handleUpload = (event) => {
            if (event.detail.renovationId === renovationId) {
                fetchImages();
            }
        };
        
        document.addEventListener('renovation-image-uploaded', handleUpload);
        return () => document.removeEventListener('renovation-image-uploaded', handleUpload);
    }, [renovationId]);

    const fetchImages = async () => {
        try {
            setLoading(true);
            setError(null);
            const token = localStorage.getItem('token');
            
            const response = await fetch(`${config.apiUrl}/renovations/${renovationId}/images`, {
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
            console.error('Error fetching images:', err);
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (imageId) => {
        if (!window.confirm('Haluatko varmasti poistaa tämän kuvan?')) {
            return;
        }

        try {
            setDeleting(imageId);
            const token = localStorage.getItem('token');

            const response = await fetch(`${config.apiUrl}/renovations/images/${imageId}`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            if (!response.ok) {
                throw new Error('Kuvan poisto epäonnistui');
            }

            toast.success('Kuva poistettu onnistuneesti');
            setImages(images.filter(img => img.id !== imageId));
            if (onUpdate) onUpdate();
        } catch (err) {
            console.error('Error deleting image:', err);
            toast.error(err.message);
        } finally {
            setDeleting(null);
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
            <Alert variant="info">
                Ei kuvia. Lisää kuvia käyttämällä yllä olevaa lomaketta.
            </Alert>
        );
    }

    return (
        <>
            <Row xs={1} sm={2} md={3} lg={4} className="g-3">
                {images.map((image) => (
                    <Col key={image.id}>
                        <Card className="h-100">
                            <div 
                                style={{ 
                                    height: '200px', 
                                    overflow: 'hidden', 
                                    cursor: 'pointer',
                                    position: 'relative'
                                }}
                                onClick={() => handleImageClick(image)}
                            >
                                <Card.Img 
                                    variant="top" 
                                    src={image.image_url} 
                                    alt={image.image_name || 'Remonttikuva'}
                                    style={{ 
                                        width: '100%', 
                                        height: '100%', 
                                        objectFit: 'cover' 
                                    }}
                                    onError={(e) => {
                                        e.target.onerror = null;
                                        e.target.src = 'https://via.placeholder.com/400x300?text=Kuva+ei+saatavilla';
                                    }}
                                />
                            </div>
                            <Card.Body>
                                <Card.Title 
                                    style={{ 
                                        fontSize: '0.9rem', 
                                        whiteSpace: 'nowrap', 
                                        overflow: 'hidden', 
                                        textOverflow: 'ellipsis' 
                                    }}
                                    title={image.image_name}
                                >
                                    {image.image_name || 'Nimetön kuva'}
                                </Card.Title>
                                <Card.Text className="small text-muted">
                                    <div>Lisätty: {formatDate(image.upload_date)}</div>
                                    <div>Koko: {formatFileSize(image.file_size)}</div>
                                </Card.Text>
                                <Button 
                                    variant="danger" 
                                    size="sm" 
                                    onClick={() => handleDelete(image.id)}
                                    disabled={deleting === image.id}
                                    className="w-100"
                                >
                                    {deleting === image.id ? (
                                        <Spinner animation="border" size="sm" />
                                    ) : (
                                        <>
                                            <Trash3 className="me-2" />
                                            Poista
                                        </>
                                    )}
                                </Button>
                            </Card.Body>
                        </Card>
                    </Col>
                ))}
            </Row>

            <Modal show={showModal} onHide={() => setShowModal(false)} size="lg" centered>
                <Modal.Header closeButton>
                    <Modal.Title>
                        {selectedImage?.image_name || 'Remonttikuva'}
                    </Modal.Title>
                </Modal.Header>
                <Modal.Body className="text-center">
                    {selectedImage && (
                        <>
                            <Image 
                                src={selectedImage.image_url} 
                                alt={selectedImage.image_name || 'Remonttikuva'}
                                fluid
                                style={{ maxHeight: '70vh' }}
                            />
                            <div className="mt-3 text-muted">
                                <div>Lisätty: {formatDate(selectedImage.upload_date)}</div>
                                <div>Koko: {formatFileSize(selectedImage.file_size)}</div>
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
                            handleDelete(selectedImage.id);
                            setShowModal(false);
                        }}
                    >
                        <Trash3 className="me-2" />
                        Poista kuva
                    </Button>
                </Modal.Footer>
            </Modal>
        </>
    );
}

export default RenovationImageGallery;
