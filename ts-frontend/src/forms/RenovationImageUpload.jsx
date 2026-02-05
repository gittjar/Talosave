import { useState } from 'react';
import { Form, Button, Alert, Spinner, ButtonGroup, ProgressBar, Image } from 'react-bootstrap';
import { CloudUpload, FileImage } from 'react-bootstrap-icons';
import { toast } from 'react-toastify';
import config from '../configuration/config';

function RenovationImageUpload({ renovationId, onUploadSuccess }) {
    const [imageUrl, setImageUrl] = useState('');
    const [imageName, setImageName] = useState('');
    const [fileSize, setFileSize] = useState('');
    const [selectedFile, setSelectedFile] = useState(null);
    const [previewUrl, setPreviewUrl] = useState(null);
    const [uploadMethod, setUploadMethod] = useState('file'); // 'file' or 'url'
    const [loading, setLoading] = useState(false);
    const [uploadProgress, setUploadProgress] = useState(0);
    const [error, setError] = useState(null);
    const [showForm, setShowForm] = useState(false);

    const handleFileSelect = (e) => {
        const file = e.target.files[0];
        if (file) {
            // Validate file type - check both mimetype and extension for HEIC support
            const validExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.webp', '.heic', '.heif'];
            const fileExtension = file.name.toLowerCase().substring(file.name.lastIndexOf('.'));
            
            if (!file.type.startsWith('image/') && !validExtensions.includes(fileExtension)) {
                setError('Valitse kuvatiedosto (JPEG, PNG, GIF, WEBP, HEIC)');
                return;
            }

            // Validate file size (10MB limit)
            if (file.size > 10 * 1024 * 1024) {
                setError('Tiedosto on liian suuri (max 10MB)');
                return;
            }

            setSelectedFile(file);
            setError(null);

            // Create preview - HEIC won't show preview in browser but that's ok
            if (file.type.startsWith('image/') && !fileExtension.match(/\.heic$/i) && !fileExtension.match(/\.heif$/i)) {
                const reader = new FileReader();
                reader.onloadend = () => {
                    setPreviewUrl(reader.result);
                };
                reader.readAsDataURL(file);
            } else if (fileExtension.match(/\.heic$/i) || fileExtension.match(/\.heif$/i)) {
                // HEIC/HEIF - no preview, just show filename
                setPreviewUrl(null);
            }
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        if (uploadMethod === 'file') {
            if (!selectedFile) {
                setError('Valitse kuvatiedosto');
                return;
            }
            await uploadFile();
        } else {
            if (!imageUrl.trim()) {
                setError('Kuvan URL on pakollinen');
                return;
            }

            // Basic URL validation
            try {
                new URL(imageUrl);
            } catch {
                setError('Anna kelvollinen URL-osoite');
                return;
            }

            await uploadUrl();
        }
    };

    const uploadFile = async () => {
        try {
            setLoading(true);
            setError(null);
            setUploadProgress(10);

            const token = localStorage.getItem('token');
            const formData = new FormData();
            formData.append('image', selectedFile);

            setUploadProgress(30);

            const response = await fetch(`${config.apiUrl}/renovations/${renovationId}/images`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`
                },
                body: formData
            });

            setUploadProgress(80);

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || 'Kuvan lataus epäonnistui');
            }

            setUploadProgress(100);
            toast.success('Kuva ladattu onnistuneesti');
            
            resetForm();
            
            if (onUploadSuccess) {
                onUploadSuccess();
            }
        } catch (err) {
            console.error('Error uploading file:', err);
            setError(err.message);
            toast.error(err.message);
        } finally {
            setLoading(false);
            setUploadProgress(0);
        }
    };

    const uploadUrl = async () => {
        try {
            setLoading(true);
            setError(null);
            const token = localStorage.getItem('token');

            const response = await fetch(`${config.apiUrl}/renovations/${renovationId}/images`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({
                    image_url: imageUrl,
                    image_name: imageName || null,
                    file_size: fileSize ? parseInt(fileSize) : null
                })
            });

            if (!response.ok) {
                throw new Error('Kuvan lisääminen epäonnistui');
            }

            toast.success('Kuva lisätty onnistuneesti');
            resetForm();
            
            if (onUploadSuccess) {
                onUploadSuccess();
            }
        } catch (err) {
            console.error('Error uploading URL:', err);
            setError(err.message);
            toast.error(err.message);
        } finally {
            setLoading(false);
        }
    };

    const resetForm = () => {
        setImageUrl('');
        setImageName('');
        setFileSize('');
        setSelectedFile(null);
        setPreviewUrl(null);
        setShowForm(false);
        setError(null);
        setUploadProgress(0);
    };

    if (!showForm) {
        return (
            <div className="mb-3">
                <Button 
                    variant="primary" 
                    onClick={() => setShowForm(true)}
                >
                    <CloudUpload className="me-2" />
                    Lisää kuva
                </Button>
            </div>
        );
    }

    return (
        <div className="mb-4 p-3 border rounded bg-light">
            <h5 className="mb-3">Lisää kuva remonttiin</h5>
            
            {error && <Alert variant="danger" dismissible onClose={() => setError(null)}>{error}</Alert>}

            {/* Upload method selector */}
            <div className="mb-3">
                <ButtonGroup className="w-100">
                    <Button 
                        variant={uploadMethod === 'file' ? 'primary' : 'outline-primary'}
                        onClick={() => setUploadMethod('file')}
                        disabled={loading}
                    >
                        <FileImage className="me-2" />
                        Lataa tiedosto
                    </Button>
                    <Button 
                        variant={uploadMethod === 'url' ? 'primary' : 'outline-primary'}
                        onClick={() => setUploadMethod('url')}
                        disabled={loading}
                    >
                        <CloudUpload className="me-2" />
                        URL-osoite
                    </Button>
                </ButtonGroup>
            </div>

            <Form onSubmit={handleSubmit}>
                {uploadMethod === 'file' ? (
                    <>
                        <Form.Group className="mb-3">
                            <Form.Label>Valitse kuva *</Form.Label>
                            <Form.Control
                                type="file"
                                accept="image/*"
                                onChange={handleFileSelect}
                                disabled={loading}
                            />
                            <Form.Text className="text-muted">
                                Tuetut formaatit: JPEG, PNG, GIF, WEBP, HEIC (iOS). Maksimikoko: 10MB
                            </Form.Text>
                        </Form.Group>

                        {previewUrl && (
                            <div className="mb-3 text-center">
                                <Image 
                                    src={previewUrl} 
                                    alt="Esikatselu" 
                                    thumbnail 
                                    style={{ maxHeight: '200px', maxWidth: '100%' }}
                                />
                                <div className="mt-2 text-muted small">
                                    {selectedFile?.name} ({(selectedFile?.size / 1024).toFixed(1)} KB)
                                </div>
                            </div>
                        )}

                        {selectedFile && !previewUrl && (
                            <div className="mb-3 text-center">
                                <div className="alert alert-info">
                                    <FileImage size={32} className="mb-2" />
                                    <div className="fw-bold">{selectedFile.name}</div>
                                    <div className="text-muted small">
                                        {(selectedFile.size / 1024).toFixed(1)} KB
                                    </div>
                                    <div className="text-muted small mt-1">
                                        HEIC/HEIF kuva muunnetaan JPEG-muotoon palvelimella
                                    </div>
                                </div>
                            </div>
                        )}

                        {loading && uploadProgress > 0 && (
                            <ProgressBar 
                                now={uploadProgress} 
                                label={`${uploadProgress}%`} 
                                className="mb-3"
                                animated
                            />
                        )}
                    </>
                ) : (
                    <>
                        <Form.Group className="mb-3">
                            <Form.Label>Kuvan URL-osoite *</Form.Label>
                            <Form.Control
                                type="url"
                                placeholder="https://example.com/image.jpg"
                                value={imageUrl}
                                onChange={(e) => setImageUrl(e.target.value)}
                                required
                                disabled={loading}
                            />
                            <Form.Text className="text-muted">
                                Lataa kuva esim. Azure Blob Storageen, Google Driveen tai OneDriveen ja kopioi julkinen linkki tähän.
                            </Form.Text>
                        </Form.Group>

                        <Form.Group className="mb-3">
                            <Form.Label>Kuvan nimi (valinnainen)</Form.Label>
                            <Form.Control
                                type="text"
                                placeholder="Esim. Keittiöremontti ennen"
                                value={imageName}
                                onChange={(e) => setImageName(e.target.value)}
                                disabled={loading}
                                maxLength={255}
                            />
                        </Form.Group>

                        <Form.Group className="mb-3">
                            <Form.Label>Tiedoston koko (tavua, valinnainen)</Form.Label>
                            <Form.Control
                                type="number"
                                placeholder="Esim. 524288"
                                value={fileSize}
                                onChange={(e) => setFileSize(e.target.value)}
                                disabled={loading}
                                min="0"
                            />
                            <Form.Text className="text-muted">
                                Tiedoston koko tavuina. Voit jättää tyhjäksi jos et tiedä.
                            </Form.Text>
                        </Form.Group>
                    </>
                )}

                <ButtonGroup>
                    <Button 
                        variant="success" 
                        type="submit" 
                        disabled={loading || (uploadMethod === 'file' && !selectedFile)}
                    >
                        {loading ? (
                            <>
                                <Spinner
                                    as="span"
                                    animation="border"
                                    size="sm"
                                    role="status"
                                    aria-hidden="true"
                                    className="me-2"
                                />
                                {uploadMethod === 'file' ? 'Ladataan...' : 'Lisätään...'}
                            </>
                        ) : (
                            <>
                                <CloudUpload className="me-2" />
                                {uploadMethod === 'file' ? 'Lataa kuva' : 'Lisää kuva'}
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
                </ButtonGroup>
            </Form>
        </div>
    );
}

export default RenovationImageUpload;
