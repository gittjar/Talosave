import { useState } from 'react';
import { Form, Button, Alert, Spinner, ProgressBar, Image, Badge, CloseButton, Row, Col } from 'react-bootstrap';
import { CloudUpload, FileImage, XCircleFill } from 'react-bootstrap-icons';
import { toast } from 'react-toastify';
import config from '../configuration/config';

function PropertyImageUpload({ propertyId, onUploadSuccess }) {
    const [selectedFiles, setSelectedFiles] = useState([]);
    const [previewUrls, setPreviewUrls] = useState([]);
    const [description, setDescription] = useState('');
    const [loading, setLoading] = useState(false);
    const [uploadProgress, setUploadProgress] = useState(0);
    const [error, setError] = useState(null);
    const [showForm, setShowForm] = useState(false);

    const validExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.webp', '.heic', '.heif'];

    const handleFileSelect = (e) => {
        const files = Array.from(e.target.files);
        if (files.length === 0) return;

        const validFiles = [];
        const newPreviews = [];

        for (const file of files) {
            const fileExtension = file.name.toLowerCase().substring(file.name.lastIndexOf('.'));

            if (!file.type.startsWith('image/') && !validExtensions.includes(fileExtension)) {
                setError(`"${file.name}" ei ole kuvatiedosto — ohitetaan`);
                continue;
            }

            if (file.size > 10 * 1024 * 1024) {
                setError(`"${file.name}" on liian suuri (max 10MB) — ohitetaan`);
                continue;
            }

            validFiles.push(file);

            // Create preview
            const isHeic = /\.(heic|heif)$/i.test(file.name);
            if (file.type.startsWith('image/') && !isHeic) {
                const reader = new FileReader();
                reader.onloadend = () => {
                    setPreviewUrls(prev => {
                        const updated = [...prev];
                        const idx = validFiles.indexOf(file);
                        updated[idx] = reader.result;
                        return updated;
                    });
                };
                reader.readAsDataURL(file);
                newPreviews.push(null); // placeholder
            } else {
                newPreviews.push('heic');
            }
        }

        if (validFiles.length > 0) {
            setSelectedFiles(prev => [...prev, ...validFiles]);
            setPreviewUrls(prev => [...prev, ...newPreviews]);
            setError(null);
        }
    };

    const removeFile = (index) => {
        setSelectedFiles(prev => prev.filter((_, i) => i !== index));
        setPreviewUrls(prev => prev.filter((_, i) => i !== index));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (selectedFiles.length === 0) {
            setError('Valitse vähintään yksi kuvatiedosto');
            return;
        }

        try {
            setLoading(true);
            setError(null);
            setUploadProgress(0);

            const token = localStorage.getItem('token');
            const formData = new FormData();
            
            selectedFiles.forEach(file => {
                formData.append('images', file);
            });

            if (description.trim()) {
                formData.append('description', description.trim());
            }

            // XMLHttpRequest for real upload progress tracking
            const result = await new Promise((resolve, reject) => {
                const xhr = new XMLHttpRequest();

                xhr.upload.addEventListener('progress', (e) => {
                    if (e.lengthComputable) {
                        const percent = Math.round((e.loaded / e.total) * 95); // 0-95% for upload
                        setUploadProgress(percent);
                    }
                });

                xhr.addEventListener('load', () => {
                    if (xhr.status >= 200 && xhr.status < 300) {
                        setUploadProgress(100);
                        try {
                            resolve(JSON.parse(xhr.responseText));
                        } catch {
                            resolve({});
                        }
                    } else {
                        try {
                            const errorData = JSON.parse(xhr.responseText);
                            reject(new Error(errorData.error || 'Kuvien lataus epäonnistui'));
                        } catch {
                            reject(new Error(`Lataus epäonnistui (${xhr.status})`));
                        }
                    }
                });

                xhr.addEventListener('error', () => reject(new Error('Verkkovirhe')));
                xhr.addEventListener('abort', () => reject(new Error('Lataus peruutettu')));

                xhr.open('POST', `${config.apiUrl}/properties/${propertyId}/images`);
                xhr.setRequestHeader('Authorization', `Bearer ${token}`);
                xhr.send(formData);
            });

            const count = result.count || selectedFiles.length;
            toast.success(`${count} ${count === 1 ? 'kuva' : 'kuvaa'} ladattu onnistuneesti`);
            
            if (result.errors && result.errors.length > 0) {
                toast.warn(`${result.errors.length} kuvaa epäonnistui`);
            }

            resetForm();

            if (onUploadSuccess) {
                onUploadSuccess();
            }
        } catch (err) {
            console.error('Error uploading property images:', err);
            setError(err.message);
            toast.error(err.message);
        } finally {
            setLoading(false);
            setUploadProgress(0);
        }
    };

    const resetForm = () => {
        setSelectedFiles([]);
        setPreviewUrls([]);
        setDescription('');
        setShowForm(false);
        setError(null);
        setUploadProgress(0);
    };

    const totalSize = selectedFiles.reduce((sum, f) => sum + f.size, 0);

    if (!showForm) {
        return (
            <div className="mb-3">
                <Button
                    variant="primary"
                    onClick={() => setShowForm(true)}
                >
                    <CloudUpload className="me-2" />
                    Lisää kuvia
                </Button>
            </div>
        );
    }

    return (
        <div className="mb-4 p-3 border rounded bg-light">
            <h5 className="mb-3">Lisää kuvia kohteeseen</h5>

            {error && <Alert variant="danger" dismissible onClose={() => setError(null)}>{error}</Alert>}

            <Form onSubmit={handleSubmit}>
                <Form.Group className="mb-3">
                    <Form.Label>Valitse kuvat *</Form.Label>
                    <Form.Control
                        type="file"
                        accept="image/*"
                        onChange={handleFileSelect}
                        disabled={loading}
                        multiple
                    />
                    <Form.Text className="text-muted">
                        Voit valita useita kuvia kerralla. Tuetut formaatit: JPEG, PNG, GIF, WEBP, HEIC. Max 10MB/kuva, max 20 kuvaa.
                    </Form.Text>
                </Form.Group>

                {/* File previews */}
                {selectedFiles.length > 0 && (
                    <div className="mb-3">
                        <div className="d-flex justify-content-between align-items-center mb-2">
                            <span className="fw-bold">
                                Valitut kuvat <Badge bg="primary" pill>{selectedFiles.length}</Badge>
                            </span>
                            <small className="text-muted">
                                Yhteensä: {(totalSize / (1024 * 1024)).toFixed(1)} MB
                            </small>
                        </div>
                        <Row xs={3} sm={4} md={5} lg={6} className="g-2">
                            {selectedFiles.map((file, index) => (
                                <Col key={index}>
                                    <div 
                                        style={{ 
                                            position: 'relative', 
                                            borderRadius: '8px', 
                                            overflow: 'hidden',
                                            border: '1px solid #dee2e6',
                                            backgroundColor: '#fff',
                                            aspectRatio: '1'
                                        }}
                                    >
                                        {previewUrls[index] && previewUrls[index] !== 'heic' ? (
                                            <img
                                                src={previewUrls[index]}
                                                alt={file.name}
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
                                                    {file.name.length > 15 ? file.name.substring(0, 12) + '...' : file.name}
                                                </small>
                                            </div>
                                        )}
                                        <button
                                            type="button"
                                            onClick={() => removeFile(index)}
                                            style={{
                                                position: 'absolute',
                                                top: '2px',
                                                right: '2px',
                                                background: 'rgba(255,255,255,0.9)',
                                                border: 'none',
                                                borderRadius: '50%',
                                                padding: '0',
                                                cursor: 'pointer',
                                                lineHeight: '1',
                                                display: 'flex'
                                            }}
                                            title="Poista"
                                        >
                                            <XCircleFill size={18} className="text-danger" />
                                        </button>
                                        <div
                                            style={{
                                                position: 'absolute',
                                                bottom: 0,
                                                left: 0,
                                                right: 0,
                                                background: 'rgba(0,0,0,0.6)',
                                                color: 'white',
                                                fontSize: '0.6rem',
                                                padding: '2px 4px',
                                                textAlign: 'center'
                                            }}
                                        >
                                            {(file.size / 1024).toFixed(0)} KB
                                        </div>
                                    </div>
                                </Col>
                            ))}
                        </Row>
                    </div>
                )}

                <Form.Group className="mb-3">
                    <Form.Label>Kuvaus <small className="text-muted">(koskee kaikkia kuvia)</small></Form.Label>
                    <Form.Control
                        as="textarea"
                        rows={2}
                        placeholder="Lyhyt kuvaus kuvista..."
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        disabled={loading}
                        maxLength={500}
                    />
                    <Form.Text className="text-muted">
                        Max 500 merkkiä
                    </Form.Text>
                </Form.Group>

                {loading && uploadProgress > 0 && (
                    <ProgressBar
                        now={uploadProgress}
                        label={`${uploadProgress}%`}
                        className="mb-3"
                        animated
                    />
                )}

                <div className="d-flex gap-2">
                    <Button
                        variant="success"
                        type="submit"
                        disabled={loading || selectedFiles.length === 0}
                    >
                        {loading ? (
                            <>
                                <Spinner as="span" animation="border" size="sm" className="me-2" />
                                Ladataan {selectedFiles.length} {selectedFiles.length === 1 ? 'kuvaa' : 'kuvaa'}...
                            </>
                        ) : (
                            <>
                                <CloudUpload className="me-2" />
                                Lataa {selectedFiles.length > 0 ? `${selectedFiles.length} ` : ''}
                                {selectedFiles.length === 1 ? 'kuva' : 'kuvaa'}
                            </>
                        )}
                    </Button>
                    <Button
                        variant="dark"
                        onClick={resetForm}
                        disabled={loading}
                    >
                        Peruuta
                    </Button>
                </div>
            </Form>
        </div>
    );
}

export default PropertyImageUpload;
