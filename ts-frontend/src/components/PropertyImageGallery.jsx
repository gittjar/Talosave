import { useState, useEffect } from 'react';
import { Card, Row, Col, Button, Spinner, Alert, Modal, Image, Form, ButtonGroup, ListGroup } from 'react-bootstrap';
import { Trash3, PencilSquare, Grid3x3GapFill, ListUl, GripVertical, SortDown, SortUp, ChevronLeft, ChevronRight, XLg, Download } from 'react-bootstrap-icons';
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
    const [showEditPanel, setShowEditPanel] = useState(false);
    const [draggedIndex, setDraggedIndex] = useState(null);
    const [dropIndicator, setDropIndicator] = useState(null); // { index, action: 'before'|'after' }
    const [savingOrder, setSavingOrder] = useState(false);
    const [sortMode, setSortMode] = useState('custom');
    const scrollIntervalRef = { current: null };

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
            setImages(sortImages(data, sortMode));
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
        // If lightbox is open, show inline panel; otherwise open modal
        if (showModal) {
            setShowEditPanel(true);
        } else {
            setShowEditModal(true);
        }
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
            setShowEditPanel(false);
            // Update selected image in lightbox if open
            if (showModal && editingImage) {
                const updated = { ...editingImage, ...editFormData };
                setSelectedImage(updated);
            }
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
        const idx = images.findIndex(img => img.id === image.id);
        setSelectedImage(image);
        setSelectedIndex(idx >= 0 ? idx : 0);
        setShowModal(true);
    };

    const [selectedIndex, setSelectedIndex] = useState(0);

    const navigateImage = (direction) => {
        const newIndex = selectedIndex + direction;
        if (newIndex >= 0 && newIndex < images.length) {
            setSelectedIndex(newIndex);
            setSelectedImage(images[newIndex]);
            setShowEditPanel(false);
        }
    };

    // Keyboard navigation
    useEffect(() => {
        if (!showModal) return;
        const handleKeyDown = (e) => {
            if (e.key === 'ArrowLeft') navigateImage(-1);
            else if (e.key === 'ArrowRight') navigateImage(1);
            else if (e.key === 'Escape') setShowModal(false);
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [showModal, selectedIndex, images]);

    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleDateString('fi-FI');
    };

    const formatFileSize = (bytes) => {
        if (!bytes) return 'N/A';
        if (bytes < 1024) return bytes + ' B';
        if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
        return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
    };

    // Sorting
    const sortImages = (imgs, mode) => {
        const sorted = [...imgs];
        switch (mode) {
            case 'custom':
                return sorted.sort((a, b) => (a.sort_order ?? 0) - (b.sort_order ?? 0));
            case 'date-new':
                return sorted.sort((a, b) => new Date(b.upload_date) - new Date(a.upload_date));
            case 'date-old':
                return sorted.sort((a, b) => new Date(a.upload_date) - new Date(b.upload_date));
            case 'name-asc':
                return sorted.sort((a, b) => (a.image_name || '').localeCompare(b.image_name || '', 'fi'));
            case 'name-desc':
                return sorted.sort((a, b) => (b.image_name || '').localeCompare(a.image_name || '', 'fi'));
            case 'size-large':
                return sorted.sort((a, b) => (b.file_size || 0) - (a.file_size || 0));
            case 'size-small':
                return sorted.sort((a, b) => (a.file_size || 0) - (b.file_size || 0));
            default:
                return sorted;
        }
    };

    const handleSortChange = (mode) => {
        setSortMode(mode);
        setImages(prev => sortImages(prev, mode));
    };

    // Drag & drop handlers
    // Auto-scroll: track mouse Y globally during drag
    const dragMouseY = { current: null };

    const startAutoScroll = () => {
        const edgeSize = 100;
        const tick = () => {
            const y = dragMouseY.current;
            if (y == null) { scrollIntervalRef.current = requestAnimationFrame(tick); return; }
            const vh = window.innerHeight;
            if (y < edgeSize) {
                const speed = Math.max(2, ((edgeSize - y) / edgeSize) * 18);
                window.scrollBy(0, -speed);
            } else if (y > vh - edgeSize) {
                const speed = Math.max(2, ((y - (vh - edgeSize)) / edgeSize) * 18);
                window.scrollBy(0, speed);
            }
            scrollIntervalRef.current = requestAnimationFrame(tick);
        };
        scrollIntervalRef.current = requestAnimationFrame(tick);
    };

    const stopAutoScroll = () => {
        if (scrollIntervalRef.current) {
            cancelAnimationFrame(scrollIntervalRef.current);
            scrollIntervalRef.current = null;
        }
        dragMouseY.current = null;
    };

    const globalDragOver = (e) => {
        dragMouseY.current = e.clientY;
    };

    const handleDragStart = (e, index) => {
        setDraggedIndex(index);
        e.dataTransfer.effectAllowed = 'move';
        e.dataTransfer.setData('text/plain', index);

        // Create small 40x40 thumbnail as drag image
        const img = new window.Image();
        img.src = images[index].image_url;
        const canvas = document.createElement('canvas');
        canvas.width = 40;
        canvas.height = 40;
        const ctx = canvas.getContext('2d');
        ctx.fillStyle = '#000';
        ctx.fillRect(0, 0, 40, 40);
        if (img.complete && img.naturalWidth > 0) {
            ctx.drawImage(img, 0, 0, 40, 40);
        }
        ctx.strokeStyle = '#0d6efd';
        ctx.lineWidth = 2;
        ctx.strokeRect(0, 0, 40, 40);
        canvas.style.position = 'absolute';
        canvas.style.top = '-9999px';
        document.body.appendChild(canvas);
        e.dataTransfer.setDragImage(canvas, 20, 20);

        // Start global auto-scroll
        document.addEventListener('dragover', globalDragOver);
        startAutoScroll();

        setTimeout(() => {
            document.body.removeChild(canvas);
            e.target.style.opacity = '0.4';
        }, 0);
    };

    const handleDragEnd = (e) => {
        e.target.style.opacity = '1';
        setDraggedIndex(null);
        setDropIndicator(null);
        document.removeEventListener('dragover', globalDragOver);
        stopAutoScroll();
    };

    const handleDragOver = (e, index) => {
        e.preventDefault();
        e.dataTransfer.dropEffect = 'move';
        if (draggedIndex === index) return;
        const rect = e.currentTarget.getBoundingClientRect();
        if (viewMode === 'grid') {
            const relX = (e.clientX - rect.left) / rect.width;
            setDropIndicator({ index, action: relX < 0.5 ? 'before' : 'after' });
        } else {
            const relY = (e.clientY - rect.top) / rect.height;
            setDropIndicator({ index, action: relY < 0.5 ? 'before' : 'after' });
        }
    };

    const handleDragLeave = (e) => {
        if (!e.currentTarget.contains(e.relatedTarget)) {
            setDropIndicator(null);
        }
    };

    const handleDrop = async (e, dropIndex) => {
        e.preventDefault();
        const fromIndex = draggedIndex;
        const indicator = dropIndicator;
        setDraggedIndex(null);
        setDropIndicator(null);
        document.removeEventListener('dragover', globalDragOver);
        stopAutoScroll();

        if (fromIndex === null || fromIndex === dropIndex) return;

        // Reorder locally
        const reordered = [...images];
        const [moved] = reordered.splice(fromIndex, 1);
        let insertIdx = indicator ? reordered.findIndex((_, i) => {
            const origIdx = i >= fromIndex ? i + 1 : i;
            return origIdx === dropIndex;
        }) : dropIndex;
        if (insertIdx === -1) insertIdx = dropIndex > fromIndex ? dropIndex - 1 : dropIndex;
        if (indicator?.action === 'after') insertIdx += 1;
        reordered.splice(insertIdx, 0, moved);
        setImages(reordered);

        // Save to backend
        try {
            setSavingOrder(true);
            const token = localStorage.getItem('token');
            const response = await fetch(`${config.apiUrl}/properties/${propertyId}/images/reorder`, {
                method: 'PUT',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ imageIds: reordered.map(img => img.id) })
            });

            if (!response.ok) throw new Error('Järjestyksen tallennus epäonnistui');
            toast.success('Järjestys päivitetty', { autoClose: 1500 });
        } catch (err) {
            console.error('Error saving order:', err);
            toast.error(err.message);
            fetchImages(); // Revert on failure
        } finally {
            setSavingOrder(false);
        }
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
            {/* Controls: sort + view mode */}
            <div className="d-flex justify-content-between align-items-center mb-3 flex-wrap gap-2">
                <div className="d-flex align-items-center gap-2">
                    <small className="text-muted">{images.length} kuvaa</small>
                    <Form.Select
                        size="sm"
                        value={sortMode}
                        onChange={(e) => handleSortChange(e.target.value)}
                        style={{ width: 'auto', fontSize: '0.8rem' }}
                    >
                        <option value="custom">↕ Oma järjestys (raahaa)</option>
                        <option value="date-new">↓ Päivämäärä, uusin ensin</option>
                        <option value="date-old">↑ Päivämäärä, vanhin ensin</option>
                        <option value="name-asc">↓ Nimi A–Ö</option>
                        <option value="name-desc">↑ Nimi Ö–A</option>
                        <option value="size-large">↓ Koko, suurin ensin</option>
                        <option value="size-small">↑ Koko, pienin ensin</option>
                    </Form.Select>
                </div>
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
                    {images.map((image, index) => (
                        <div key={image.id} style={{ position: 'relative' }}
                            onDragOver={sortMode === 'custom' ? (e) => handleDragOver(e, index) : undefined}
                            onDragLeave={sortMode === 'custom' ? handleDragLeave : undefined}
                            onDrop={sortMode === 'custom' ? (e) => handleDrop(e, index) : undefined}
                        >
                            {dropIndicator?.index === index && dropIndicator?.action === 'before' && (
                                <div style={{
                                    position: 'absolute', top: '-2px', left: 0, right: 0, height: '4px',
                                    backgroundColor: '#0d6efd', borderRadius: '2px', zIndex: 10
                                }}>
                                    <div style={{
                                        position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)',
                                        backgroundColor: '#0d6efd', color: '#fff', padding: '2px 10px', borderRadius: '4px',
                                        fontSize: '0.65rem', whiteSpace: 'nowrap', zIndex: 11, fontWeight: '600'
                                    }}>Siirrä tähän</div>
                                </div>
                            )}
                            {dropIndicator?.index === index && dropIndicator?.action === 'after' && (
                                <div style={{
                                    position: 'absolute', bottom: '-2px', left: 0, right: 0, height: '4px',
                                    backgroundColor: '#0d6efd', borderRadius: '2px', zIndex: 10
                                }}>
                                    <div style={{
                                        position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)',
                                        backgroundColor: '#0d6efd', color: '#fff', padding: '2px 10px', borderRadius: '4px',
                                        fontSize: '0.65rem', whiteSpace: 'nowrap', zIndex: 11, fontWeight: '600'
                                    }}>Siirrä tähän</div>
                                </div>
                            )}
                        <ListGroup.Item
                            className="d-flex justify-content-between align-items-center"
                            draggable={sortMode === 'custom'}
                            onDragStart={sortMode === 'custom' ? (e) => handleDragStart(e, index) : undefined}
                            onDragEnd={sortMode === 'custom' ? handleDragEnd : undefined}
                            style={{
                                padding: '0.5rem 0.6rem',
                                transition: 'background-color 0.2s ease',
                                cursor: sortMode === 'custom' ? 'grab' : 'pointer'
                            }}
                            onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#f8f9fa'}
                            onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                            onClick={() => handleImageClick(image)}
                        >
                            <div className="d-flex align-items-center flex-grow-1">
                                {sortMode === 'custom' && (
                                    <GripVertical size={14} style={{ cursor: 'grab', color: '#aaa', marginRight: '0.4rem', flexShrink: 0 }} />
                                )}
                                <div
                                    style={{
                                        width: '45px',
                                        height: '45px',
                                        marginRight: '0.6rem',
                                        borderRadius: '6px',
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
                                    <div style={{ fontWeight: '600', color: '#2c3e50', marginBottom: '0.15rem', fontSize: '0.85rem' }}>
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
                                    <div className="d-flex align-items-center gap-2 mt-1">
                                        <span style={{
                                            fontSize: '0.7rem',
                                            color: '#888',
                                            backgroundColor: '#f7f7f7',
                                            padding: '1px 6px',
                                            borderRadius: '8px',
                                            border: '1px solid #e8e8e8'
                                        }}>
                                            {formatDate(image.upload_date)}
                                        </span>
                                        <span style={{
                                            fontSize: '0.7rem',
                                            color: '#888',
                                            backgroundColor: '#f7f7f7',
                                            padding: '1px 6px',
                                            borderRadius: '8px',
                                            border: '1px solid #e8e8e8'
                                        }}>
                                            {formatFileSize(image.file_size)}
                                        </span>
                                    </div>
                                </div>
                            </div>
                            <div className="d-flex gap-1" style={{ flexShrink: 0 }}>
                                <Button
                                    variant="outline-primary"
                                    size="sm"
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        handleEdit(image);
                                    }}
                                    style={{ borderRadius: '4px', padding: '2px 6px', fontSize: '0.7rem', lineHeight: 1 }}
                                >
                                    <PencilSquare size={12} />
                                </Button>
                                <Button
                                    variant="outline-danger"
                                    size="sm"
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        handleDelete(image);
                                    }}
                                    disabled={deleting === image.id}
                                    style={{ borderRadius: '4px', padding: '2px 6px', fontSize: '0.7rem', lineHeight: 1 }}
                                >
                                    {deleting === image.id ? (
                                        <Spinner animation="border" size="sm" />
                                    ) : (
                                        <Trash3 size={12} />
                                    )}
                                </Button>
                            </div>
                        </ListGroup.Item>
                        </div>
                    ))}
                </ListGroup>
            )}

            {/* Grid View */}
            {viewMode === 'grid' && (
                <Row xs={1} sm={2} md={3} className="g-3">
                    {images.map((image, index) => (
                        <Col key={image.id}>
                            <div style={{ position: 'relative' }}
                                onDragOver={sortMode === 'custom' ? (e) => handleDragOver(e, index) : undefined}
                                onDragLeave={sortMode === 'custom' ? handleDragLeave : undefined}
                                onDrop={sortMode === 'custom' ? (e) => handleDrop(e, index) : undefined}
                            >
                                {dropIndicator?.index === index && dropIndicator?.action === 'before' && (
                                    <div style={{
                                        position: 'absolute', left: '-6px', top: 0, bottom: 0, width: '4px',
                                        backgroundColor: '#0d6efd', borderRadius: '2px', zIndex: 10
                                    }}>
                                        <div style={{
                                            position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)',
                                            backgroundColor: '#0d6efd', color: '#fff', padding: '2px 8px', borderRadius: '4px',
                                            fontSize: '0.65rem', whiteSpace: 'nowrap', zIndex: 11, fontWeight: '600'
                                        }}>Siirrä tähän</div>
                                    </div>
                                )}
                                {dropIndicator?.index === index && dropIndicator?.action === 'after' && (
                                    <div style={{
                                        position: 'absolute', right: '-6px', top: 0, bottom: 0, width: '4px',
                                        backgroundColor: '#0d6efd', borderRadius: '2px', zIndex: 10
                                    }}>
                                        <div style={{
                                            position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)',
                                            backgroundColor: '#0d6efd', color: '#fff', padding: '2px 8px', borderRadius: '4px',
                                            fontSize: '0.65rem', whiteSpace: 'nowrap', zIndex: 11, fontWeight: '600'
                                        }}>Siirrä tähän</div>
                                    </div>
                                )}
                            <Card
                                className="shadow-sm border-0"
                                draggable={sortMode === 'custom'}
                                onDragStart={sortMode === 'custom' ? (e) => handleDragStart(e, index) : undefined}
                                onDragEnd={sortMode === 'custom' ? handleDragEnd : undefined}
                                style={{
                                    transition: 'all 0.3s ease',
                                    overflow: 'hidden',
                                    borderRadius: '3px',
                                    cursor: sortMode === 'custom' ? 'grab' : 'default'
                                }}
                            >
                                {/* Kuva + ylä- ja alakaista päällä */}
                                <div
                                    style={{
                                        cursor: 'pointer',
                                        backgroundColor: '#f0f0f0',
                                        aspectRatio: '4 / 3',
                                        overflow: 'hidden',
                                        position: 'relative'
                                    }}
                                    onClick={() => handleImageClick(image)}
                                >
                                    {/* Yläkaista — kuvan päällä */}
                                    <div
                                        style={{
                                            position: 'absolute',
                                            top: 0,
                                            left: 0,
                                            right: 0,
                                            display: 'flex',
                                            justifyContent: 'space-between',
                                            alignItems: 'center',
                                            padding: '3px 8px',
                                            backgroundColor: 'rgba(0, 0, 0, 0.4)',
                                            color: '#ccc',
                                            fontSize: '0.65rem',
                                            zIndex: 1
                                        }}
                                    >
                                        <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                                            {sortMode === 'custom' && <GripVertical size={10} style={{ cursor: 'grab', color: '#aaa' }} />}
                                            {formatDate(image.upload_date)}
                                        </span>
                                        <span style={{ color: '#fff', fontWeight: '500', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: '50%', textAlign: 'center' }}>
                                            {image.image_name || 'Nimetön kuva'}
                                        </span>
                                        <span>{formatFileSize(image.file_size)}</span>
                                    </div>
                                    <Card.Img
                                        src={image.image_url}
                                        alt={image.image_name || 'Kohteen kuva'}
                                        style={{
                                            width: '100%',
                                            height: '100%',
                                            objectFit: 'cover',
                                            transition: 'transform 0.3s ease',
                                            borderRadius: '0'
                                        }}
                                        onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.05)'}
                                        onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
                                        onError={(e) => {
                                            e.target.onerror = null;
                                            e.target.src = 'https://via.placeholder.com/400x300?text=Kuva+ei+saatavilla';
                                        }}
                                    />
                                    {/* Alakaista — kuvan päällä */}
                                    <div
                                        onClick={(e) => e.stopPropagation()}
                                        style={{
                                            position: 'absolute',
                                            bottom: 0,
                                            left: 0,
                                            right: 0,
                                            display: 'flex',
                                            justifyContent: 'space-between',
                                            alignItems: 'center',
                                            padding: '3px 8px',
                                            backgroundColor: 'rgba(0, 0, 0, 0.7)',
                                            fontSize: '0.65rem'
                                        }}
                                    >
                                        <span
                                            onClick={() => handleEdit(image)}
                                            style={{ color: '#8cb4ff', cursor: 'pointer', flexShrink: 0 }}
                                            onMouseEnter={(e) => e.currentTarget.style.color = '#fff'}
                                            onMouseLeave={(e) => e.currentTarget.style.color = '#8cb4ff'}
                                        >
                                            Muokkaa
                                        </span>
                                        {image.description && (
                                            <span
                                                title={image.description}
                                                style={{
                                                    color: '#ddd',
                                                    overflow: 'hidden',
                                                    textOverflow: 'ellipsis',
                                                    whiteSpace: 'nowrap',
                                                    margin: '0 8px',
                                                    textAlign: 'center',
                                                    flex: 1
                                                }}
                                            >
                                                {image.description}
                                            </span>
                                        )}
                                        <span
                                            onClick={() => handleDelete(image)}
                                            style={{ color: '#ff8c8c', cursor: deleting === image.id ? 'wait' : 'pointer', flexShrink: 0 }}
                                            onMouseEnter={(e) => e.currentTarget.style.color = '#fff'}
                                            onMouseLeave={(e) => e.currentTarget.style.color = '#ff8c8c'}
                                        >
                                            {deleting === image.id ? 'Poistetaan...' : 'Poista'}
                                        </span>
                                    </div>
                                </div>
                            </Card>
                            </div>
                        </Col>
                    ))}
                </Row>
            )}

            {/* Image Preview Lightbox */}
            <Modal
                show={showModal}
                onHide={() => { setShowModal(false); setShowEditPanel(false); }}
                size="xl"
                centered
                contentClassName="bg-transparent border-0"
                dialogClassName="modal-fullscreen-lg-down"
            >
                <Modal.Body
                    className="p-0 d-flex align-items-center justify-content-center position-relative"
                    style={{ backgroundColor: 'rgba(0,0,0,0.92)', minHeight: '80vh', borderRadius: '8px' }}
                    onClick={() => { setShowModal(false); setShowEditPanel(false); }}
                >
                    {selectedImage && (
                        <>
                            {/* Close button */}
                            <button
                                onClick={(e) => { e.stopPropagation(); setShowModal(false); setShowEditPanel(false); }}
                                style={{
                                    position: 'absolute', top: 12, right: 16, zIndex: 10,
                                    background: 'rgba(255,255,255,0.15)', border: 'none', borderRadius: '50%',
                                    width: 36, height: 36, display: 'flex', alignItems: 'center', justifyContent: 'center',
                                    cursor: 'pointer', transition: 'background 0.2s'
                                }}
                                onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.3)'}
                                onMouseLeave={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.15)'}
                            >
                                <XLg size={16} color="#fff" />
                            </button>

                            {/* Counter */}
                            <div style={{
                                position: 'absolute', top: 14, left: '50%', transform: 'translateX(-50%)',
                                color: '#aaa', fontSize: '0.8rem', zIndex: 10
                            }}>
                                {selectedIndex + 1} / {images.length}
                            </div>

                            {/* Previous arrow */}
                            {selectedIndex > 0 && (
                                <button
                                    onClick={(e) => { e.stopPropagation(); navigateImage(-1); }}
                                    style={{
                                        position: 'absolute', left: 8, top: '50%', transform: 'translateY(-50%)',
                                        background: 'rgba(255,255,255,0.1)', border: 'none', borderRadius: '50%',
                                        width: 44, height: 44, display: 'flex', alignItems: 'center', justifyContent: 'center',
                                        cursor: 'pointer', zIndex: 10, transition: 'background 0.2s'
                                    }}
                                    onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.25)'}
                                    onMouseLeave={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.1)'}
                                >
                                    <ChevronLeft size={22} color="#fff" />
                                </button>
                            )}

                            {/* Next arrow */}
                            {selectedIndex < images.length - 1 && (
                                <button
                                    onClick={(e) => { e.stopPropagation(); navigateImage(1); }}
                                    style={{
                                        position: 'absolute', right: 8, top: '50%', transform: 'translateY(-50%)',
                                        background: 'rgba(255,255,255,0.1)', border: 'none', borderRadius: '50%',
                                        width: 44, height: 44, display: 'flex', alignItems: 'center', justifyContent: 'center',
                                        cursor: 'pointer', zIndex: 10, transition: 'background 0.2s'
                                    }}
                                    onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.25)'}
                                    onMouseLeave={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.1)'}
                                >
                                    <ChevronRight size={22} color="#fff" />
                                </button>
                            )}

                            {/* Image */}
                            <img
                                src={selectedImage.image_url}
                                alt={selectedImage.image_name || 'Kohteen kuva'}
                                onClick={(e) => e.stopPropagation()}
                                style={{
                                    maxHeight: '78vh', maxWidth: '90%', objectFit: 'contain',
                                    borderRadius: '4px', userSelect: 'none'
                                }}
                            />

                            {/* Bottom info bar */}
                            <div
                                onClick={(e) => e.stopPropagation()}
                                style={{
                                    position: 'absolute', bottom: 0, left: 0, right: 0,
                                    background: 'linear-gradient(transparent, rgba(0,0,0,0.7))',
                                    padding: '24px 20px 14px', display: 'flex',
                                    justifyContent: 'space-between', alignItems: 'flex-end'
                                }}
                            >
                                <div>
                                    <div style={{ color: '#fff', fontWeight: 600, fontSize: '0.95rem', marginBottom: 2 }}>
                                        {selectedImage.image_name || 'Nimetön kuva'}
                                    </div>
                                    {selectedImage.description && (
                                        <div style={{ color: '#bbb', fontSize: '0.8rem', marginBottom: 2 }}>
                                            {selectedImage.description}
                                        </div>
                                    )}
                                    <div style={{ color: '#888', fontSize: '0.72rem' }}>
                                        {formatDate(selectedImage.upload_date)} · {formatFileSize(selectedImage.file_size)}
                                    </div>
                                </div>
                                <div className="d-flex gap-2">
                                    <button
                                        onClick={(e) => { e.stopPropagation(); handleEdit(selectedImage); }}
                                        style={{
                                            background: 'rgba(255,255,255,0.15)', border: 'none', borderRadius: '6px',
                                            padding: '5px 12px', color: '#8cb4ff', fontSize: '0.78rem', cursor: 'pointer',
                                            transition: 'background 0.2s'
                                        }}
                                        onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.25)'}
                                        onMouseLeave={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.15)'}
                                    >
                                        <PencilSquare size={12} className="me-1" />Muokkaa
                                    </button>
                                    <button
                                        onClick={() => { handleDelete(selectedImage); setShowModal(false); }}
                                        style={{
                                            background: 'rgba(255,100,100,0.15)', border: 'none', borderRadius: '6px',
                                            padding: '5px 12px', color: '#ff8c8c', fontSize: '0.78rem', cursor: 'pointer',
                                            transition: 'background 0.2s'
                                        }}
                                        onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(255,100,100,0.3)'}
                                        onMouseLeave={(e) => e.currentTarget.style.background = 'rgba(255,100,100,0.15)'}
                                    >
                                        <Trash3 size={12} className="me-1" />Poista
                                    </button>
                                </div>
                            </div>
                        </>
                    )}

                    {/* Inline edit side panel */}
                    {showEditPanel && editingImage && (
                        <div
                            onClick={(e) => e.stopPropagation()}
                            style={{
                                position: 'absolute', top: 0, right: 0, bottom: 0,
                                width: '320px', maxWidth: '85vw',
                                backgroundColor: 'rgba(30, 30, 30, 0.95)',
                                borderLeft: '1px solid rgba(255,255,255,0.1)',
                                padding: '20px',
                                display: 'flex', flexDirection: 'column',
                                zIndex: 20,
                                animation: 'slideInRight 0.25s ease'
                            }}
                        >
                            <div className="d-flex justify-content-between align-items-center mb-3">
                                <span style={{ color: '#fff', fontWeight: 600, fontSize: '0.9rem' }}>Muokkaa tietoja</span>
                                <button
                                    onClick={() => setShowEditPanel(false)}
                                    style={{
                                        background: 'rgba(255,255,255,0.1)', border: 'none', borderRadius: '50%',
                                        width: 28, height: 28, display: 'flex', alignItems: 'center', justifyContent: 'center',
                                        cursor: 'pointer'
                                    }}
                                >
                                    <XLg size={12} color="#aaa" />
                                </button>
                            </div>

                            <div className="mb-3">
                                <label style={{ color: '#aaa', fontSize: '0.75rem', marginBottom: 4, display: 'block' }}>Kuvan nimi</label>
                                <input
                                    type="text"
                                    value={editFormData.image_name}
                                    onChange={(e) => setEditFormData({ ...editFormData, image_name: e.target.value })}
                                    placeholder="Esim. Talon julkisivu"
                                    style={{
                                        width: '100%', padding: '8px 10px', borderRadius: '6px',
                                        border: '1px solid rgba(255,255,255,0.15)', backgroundColor: 'rgba(255,255,255,0.08)',
                                        color: '#fff', fontSize: '0.85rem', outline: 'none'
                                    }}
                                    onFocus={(e) => e.target.style.borderColor = '#0d6efd'}
                                    onBlur={(e) => e.target.style.borderColor = 'rgba(255,255,255,0.15)'}
                                />
                            </div>

                            <div className="mb-3">
                                <label style={{ color: '#aaa', fontSize: '0.75rem', marginBottom: 4, display: 'block' }}>Kuvaus</label>
                                <textarea
                                    value={editFormData.description}
                                    onChange={(e) => setEditFormData({ ...editFormData, description: e.target.value })}
                                    placeholder="Lisää tarkempi kuvaus..."
                                    rows={3}
                                    style={{
                                        width: '100%', padding: '8px 10px', borderRadius: '6px',
                                        border: '1px solid rgba(255,255,255,0.15)', backgroundColor: 'rgba(255,255,255,0.08)',
                                        color: '#fff', fontSize: '0.85rem', outline: 'none', resize: 'vertical'
                                    }}
                                    onFocus={(e) => e.target.style.borderColor = '#0d6efd'}
                                    onBlur={(e) => e.target.style.borderColor = 'rgba(255,255,255,0.15)'}
                                />
                                <small style={{ color: '#666', fontSize: '0.7rem' }}>Max 500 merkkiä</small>
                            </div>

                            <div className="d-flex gap-2 mt-auto">
                                <button
                                    onClick={() => setShowEditPanel(false)}
                                    style={{
                                        flex: 1, padding: '8px', borderRadius: '6px',
                                        border: '1px solid rgba(255,255,255,0.2)', background: 'transparent',
                                        color: '#aaa', fontSize: '0.8rem', cursor: 'pointer'
                                    }}
                                >
                                    Peruuta
                                </button>
                                <button
                                    onClick={handleSaveEdit}
                                    disabled={saving}
                                    style={{
                                        flex: 1, padding: '8px', borderRadius: '6px',
                                        border: 'none', background: '#0d6efd',
                                        color: '#fff', fontSize: '0.8rem', cursor: saving ? 'wait' : 'pointer',
                                        opacity: saving ? 0.7 : 1
                                    }}
                                >
                                    {saving ? 'Tallennetaan...' : 'Tallenna'}
                                </button>
                            </div>
                        </div>
                    )}
                </Modal.Body>
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
