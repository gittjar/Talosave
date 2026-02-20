import { useState, useRef } from 'react';
import { Form, Button, ProgressBar, Image, Badge, Row, Col } from 'react-bootstrap';
import { CloudUpload, FileImage, XCircleFill, CheckCircleFill, ExclamationCircleFill } from 'react-bootstrap-icons';
import { toast } from 'react-toastify';
import config from '../configuration/config';

function RenovationImageUpload({ renovationId, onUploadSuccess }) {
    const [images, setImages] = useState([]); // Array of { id, file, name, description, previewUrl, status, progress }
    const [isUploading, setIsUploading] = useState(false);
    const [showForm, setShowForm] = useState(false);
    const fileInputRef = useRef();

    const token = localStorage.getItem('token') || localStorage.getItem('userToken');
    const validExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.webp', '.heic', '.heif'];

    const handleFileSelect = (e) => {
        const files = Array.from(e.target.files);
        if (files.length === 0) return;

        const maxSize = 10 * 1024 * 1024;
        const newImages = [];
        let rejected = 0;

        files.forEach((file) => {
            const fileExtension = file.name.toLowerCase().substring(file.name.lastIndexOf('.'));

            if (!file.type.startsWith('image/') && !validExtensions.includes(fileExtension)) {
                rejected++;
                return;
            }

            if (file.size > maxSize) {
                rejected++;
                return;
            }

            const imageId = Date.now() + Math.random();
            const isHeic = /\.(heic|heif)$/i.test(file.name);
            let previewUrl = 'heic';

            // Generate preview for non-HEIC images
            if (file.type.startsWith('image/') && !isHeic) {
                const reader = new FileReader();
                reader.onloadend = () => {
                    setImages(prev => prev.map(img =>
                        img.id === imageId ? { ...img, previewUrl: reader.result } : img
                    ));
                };
                reader.readAsDataURL(file);
                previewUrl = null; // Will be set by FileReader
            }

            newImages.push({
                id: imageId,
                file,
                name: file.name.split('.').slice(0, -1).join('.') || file.name,
                description: '',
                previewUrl,
                status: 'pending', // pending | uploading | done | error
                progress: 0
            });
        });

        if (rejected > 0) {
            toast.error(`${rejected} tiedosto${rejected > 1 ? 'a' : ''} ohitettu (liian suuri tai väärä tyyppi)`);
        }
        if (newImages.length > 0) {
            setImages(prev => [...prev, ...newImages]);
        }
        if (fileInputRef.current) fileInputRef.current.value = '';
    };

    const removeImage = (id) => {
        setImages(prev => prev.filter(img => img.id !== id));
    };

    const updateImage = (id, updates) => {
        setImages(prev => prev.map(img => (img.id === id ? { ...img, ...updates } : img)));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        const pendingImages = images.filter(img => img.status === 'pending');
        if (pendingImages.length === 0) {
            toast.error('Ei ladattavia kuvia');
            return;
        }

        setIsUploading(true);
        let successCount = 0;
        let errorCount = 0;

        for (const img of pendingImages) {
            updateImage(img.id, { status: 'uploading', progress: 0 });

            const formData = new FormData();
            formData.append('images', img.file);
            if (img.description) formData.append('description', img.description);

            try {
                await new Promise((resolve, reject) => {
                    const xhr = new XMLHttpRequest();

                    xhr.upload.addEventListener('progress', (event) => {
                        if (event.lengthComputable) {
                            const percent = Math.round((event.loaded / event.total) * 100);
                            updateImage(img.id, { progress: percent });
                        }
                    });

                    xhr.addEventListener('load', () => {
                        if (xhr.status >= 200 && xhr.status < 300) {
                            resolve();
                        } else {
                            try {
                                const errorData = JSON.parse(xhr.responseText);
                                reject(new Error(errorData.error || 'Lataus epäonnistui'));
                            } catch {
                                reject(new Error(`Lataus epäonnistui (${xhr.status})`));
                            }
                        }
                    });

                    xhr.addEventListener('error', () => reject(new Error('Verkkovirhe')));
                    xhr.addEventListener('abort', () => reject(new Error('Lataus peruutettu')));

                    xhr.open('POST', `${config.apiUrl}/renovations/${renovationId}/images`);
                    xhr.setRequestHeader('Authorization', `Bearer ${token}`);
                    xhr.send(formData);
                });

                updateImage(img.id, { status: 'done', progress: 100 });
                successCount++;
            } catch (error) {
                console.error('Upload error:', error);
                updateImage(img.id, { status: 'error', progress: 0 });
                errorCount++;
            }
        }

        setIsUploading(false);

        if (successCount > 0) {
            toast.success(`${successCount} kuva${successCount > 1 ? 'a' : ''} ladattu onnistuneesti!`);
            if (onUploadSuccess) onUploadSuccess();
        }
        if (errorCount > 0) {
            toast.error(`${errorCount} kuvan lataus epäonnistui`);
        }

        // Remove completed images after delay
        setTimeout(() => {
            setImages(prev => prev.filter(img => img.status !== 'done'));
            setImages(prev => {
                if (prev.length === 0) setShowForm(false);
                return prev;
            });
        }, 1500);
    };

    const resetForm = () => {
        setImages([]);
        setShowForm(false);
        if (fileInputRef.current) fileInputRef.current.value = '';
    };

    const pendingCount = images.filter(img => img.status === 'pending').length;
    const totalSize = images.reduce((sum, img) => sum + img.file.size, 0);

    if (!showForm) {
        return (
            <div className="mb-3">
                <Button variant="primary" onClick={() => setShowForm(true)}>
                    <CloudUpload className="me-2" />
                    Lisää kuvia
                </Button>
            </div>
        );
    }

    return (
        <div className="mb-4 p-3 border rounded bg-light">
            <div className="d-flex justify-content-between align-items-center mb-3">
                <h5 className="mb-0">
                    Lisää kuvia remonttiin
                    {images.length > 0 && (
                        <Badge bg="primary" className="ms-2">{images.length}</Badge>
                    )}
                </h5>
                <Button variant="link" size="sm" className="text-muted p-0" onClick={resetForm}>
                    Peruuta
                </Button>
            </div>

            <Form onSubmit={handleSubmit}>
                <Form.Group className="mb-3">
                    <Form.Label>Valitse kuvat</Form.Label>
                    <Form.Control
                        ref={fileInputRef}
                        type="file"
                        accept="image/*"
                        onChange={handleFileSelect}
                        disabled={isUploading}
                        multiple
                    />
                    <Form.Text className="text-muted" style={{ fontSize: '0.8rem' }}>
                        JPEG, PNG, GIF, WEBP, HEIC. Max 10MB/kuva. Voit valita useita kerralla.
                    </Form.Text>
                </Form.Group>

                {images.length > 0 && (
                    <>
                        <div className="mb-2 d-flex justify-content-between align-items-center">
                            <span className="fw-bold">
                                Valitut kuvat <Badge bg="secondary">{images.length}</Badge>
                            </span>
                            <small className="text-muted">
                                Yhteensä: {(totalSize / (1024 * 1024)).toFixed(1)} MB
                            </small>
                        </div>

                        <div className="mb-3" style={{ maxHeight: '400px', overflowY: 'auto' }}>
                            <Row xs={2} sm={3} md={4} lg={5} className="g-2">
                                {images.map((img) => (
                                    <Col key={img.id}>
                                        <div
                                            style={{
                                                position: 'relative',
                                                borderRadius: '8px',
                                                overflow: 'hidden',
                                                border: img.status === 'done' ? '2px solid #28a745' : img.status === 'error' ? '2px solid #dc3545' : '1px solid #dee2e6',
                                                backgroundColor: img.status === 'done' ? '#d4edda' : img.status === 'error' ? '#f8d7da' : '#fff',
                                                aspectRatio: '1',
                                                transition: 'all 0.3s'
                                            }}
                                        >
                                            {/* Preview */}
                                            {img.previewUrl && img.previewUrl !== 'heic' ? (
                                                <img
                                                    src={img.previewUrl}
                                                    alt={img.name}
                                                    style={{
                                                        width: '100%',
                                                        height: '100%',
                                                        objectFit: 'cover'
                                                    }}
                                                />
                                            ) : (
                                                <div className="d-flex flex-column align-items-center justify-content-center h-100 p-1">
                                                    <FileImage size={24} className="text-muted" />
                                                    <small className="text-muted text-center" style={{ fontSize: '0.65rem', wordBreak: 'break-all' }}>
                                                        {img.file.name.length > 15 ? img.file.name.substring(0, 12) + '...' : img.file.name}
                                                    </small>
                                                </div>
                                            )}

                                            {/* Status icon */}
                                            <div style={{ position: 'absolute', top: '4px', left: '4px' }}>
                                                {img.status === 'done' && <CheckCircleFill size={20} className="text-success" />}
                                                {img.status === 'error' && <ExclamationCircleFill size={20} className="text-danger" />}
                                            </div>

                                            {/* Remove button */}
                                            {img.status === 'pending' && !isUploading && (
                                                <button
                                                    type="button"
                                                    onClick={() => removeImage(img.id)}
                                                    style={{
                                                        position: 'absolute',
                                                        top: '4px',
                                                        right: '4px',
                                                        background: 'rgba(255,255,255,0.9)',
                                                        border: 'none',
                                                        borderRadius: '50%',
                                                        padding: '0',
                                                        cursor: 'pointer',
                                                        lineHeight: '1',
                                                        display: 'flex'
                                                    }}
                                                >
                                                    <XCircleFill size={18} className="text-danger" />
                                                </button>
                                            )}

                                            {/* Size badge */}
                                            <div
                                                style={{
                                                    position: 'absolute',
                                                    bottom: 0,
                                                    left: 0,
                                                    right: 0,
                                                    background: 'rgba(0,0,0,0.7)',
                                                    color: 'white',
                                                    fontSize: '0.6rem',
                                                    padding: '2px 4px',
                                                    textAlign: 'center'
                                                }}
                                            >
                                                {(img.file.size / 1024).toFixed(0)} KB
                                            </div>

                                            {/* Progress bar */}
                                            {img.status === 'uploading' && (
                                                <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0 }}>
                                                    <ProgressBar
                                                        now={img.progress}
                                                        variant="success"
                                                        style={{ height: '8px', borderRadius: 0 }}
                                                    />
                                                </div>
                                            )}
                                        </div>

                                        {/* Name/description inputs for pending images */}
                                        {img.status === 'pending' && (
                                            <div className="mt-1">
                                                <Form.Control
                                                    size="sm"
                                                    type="text"
                                                    placeholder="Kuvaus"
                                                    value={img.description}
                                                    onChange={(e) => updateImage(img.id, { description: e.target.value })}
                                                    disabled={isUploading}
                                                    style={{ fontSize: '0.75rem' }}
                                                />
                                            </div>
                                        )}
                                    </Col>
                                ))}
                            </Row>
                        </div>
                    </>
                )}

                <div className="d-flex gap-2">
                    <Button
                        variant="success"
                        type="submit"
                        disabled={isUploading || pendingCount === 0}
                    >
                        <CloudUpload className="me-2" />
                        {isUploading
                            ? 'Ladataan...'
                            : pendingCount > 1
                                ? `Lataa ${pendingCount} kuvaa`
                                : 'Lataa'}
                    </Button>
                    <Button variant="dark" onClick={resetForm} disabled={isUploading}>
                        Peruuta
                    </Button>
                </div>
            </Form>
        </div>
    );
}

export default RenovationImageUpload;
