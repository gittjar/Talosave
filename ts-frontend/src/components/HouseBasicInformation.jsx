import PropTypes from 'prop-types';
import React, { useState } from 'react';
import { ChevronDown, ChevronUp, House, GeoAlt, Calendar, Rulers, Lightning, Droplet, Tv, Wifi, Building } from 'react-bootstrap-icons';
import { Card, Row, Col, Badge, Button } from 'react-bootstrap';


const HouseBasicInformation = ({ property }) => {
    const [isExpanded, setIsExpanded] = useState(false);

    // Group property data into logical sections
    const basicInfo = [
        { label: 'Kiinteistötunnus', value: property.property_id, icon: <Building size={16} /> },
        { label: 'Talotyyppi', value: property.house_type, icon: <House size={16} /> },
        { label: 'Rakennusvuosi', value: property.building_year, icon: <Calendar size={16} /> },
        { label: 'Kokonaispinta-ala', value: property.total_sqm ? `${property.total_sqm} m²` : null, icon: <Rulers size={16} /> },
        { label: 'Asuinpinta-ala', value: property.living_sqm ? `${property.living_sqm} m²` : null, icon: <Rulers size={16} /> },
        { label: 'Kerrokset', value: property.floors, icon: <Building size={16} /> },
        { label: 'Huoneluettelo', value: property.room_list, icon: <House size={16} /> }
    ];

    const systemsInfo = [
        { label: 'Pääasiallinen lämmitysjärjestelmä', value: property.main_heat_system, icon: <Lightning size={16} /> },
        { label: 'Sähköt', value: property.electricity, icon: <Lightning size={16} /> },
        { label: 'Vesijohto', value: property.water, icon: <Droplet size={16} /> },
        { label: 'Viemäröinti', value: property.drain, icon: <Droplet size={16} /> },
        { label: 'Tietoliikenneyhteydet', value: property.dataconnection, icon: <Wifi size={16} /> },
        { label: 'TV-järjestelmä', value: property.TV_system, icon: <Tv size={16} /> },
        { label: 'Sauna', value: property.sauna, icon: <House size={16} /> },
        { label: 'Hormit', value: property.pipes, icon: <Building size={16} /> }
    ];

    const propertyInfo = [
        { label: 'Maa-alue', value: property.land, icon: <GeoAlt size={16} /> },
        { label: 'Kattotyyppi', value: property.roof_type, icon: <Building size={16} /> },
        { label: 'Tontti', value: property.ground, icon: <GeoAlt size={16} /> },
        { label: 'Rasitteet', value: property.rasite, icon: <GeoAlt size={16} /> },
        { label: 'Ranta', value: property.ranta, icon: <GeoAlt size={16} /> }
    ];

    const additionalInfo = [
        { label: 'Kohdekuvaus', value: property.description, icon: <House size={16} /> },
        { label: 'Luotu', value: property.created_at ? new Date(property.created_at).toLocaleDateString('fi-FI') : null, icon: <Calendar size={16} /> },
        { label: 'Latitude', value: property.latitude, icon: <GeoAlt size={16} /> },
        { label: 'Longitude', value: property.longitude, icon: <GeoAlt size={16} /> }
    ];

    const PropertySection = ({ title, items, bgColor = "light" }) => (
        <Card className="mb-3 border-0 shadow-sm">
            <Card.Header className={`bg-${bgColor} border-0`}>
                <h6 className="mb-0 text-dark fw-bold">{title}</h6>
            </Card.Header>
            <Card.Body className="p-3">
                <Row>
                    {items.filter(item => item.value).map((item, index) => (
                        <Col xs={12} md={6} lg={4} key={index} className="mb-3">
                            <div className="d-flex align-items-start">
                                <div className="text-primary me-2 mt-1">
                                    {item.icon}
                                </div>
                                <div className="flex-grow-1">
                                    <div className="text-muted small fw-medium mb-1">
                                        {item.label}
                                    </div>
                                    <div className="text-dark fw-semibold">
                                        {item.value}
                                    </div>
                                </div>
                            </div>
                        </Col>
                    ))}
                </Row>
            </Card.Body>
        </Card>
    );

    return (
        <div className="house-basic-info">
            {/* Property Header */}
            <Card className="mb-4 border-0 shadow">
                <Card.Body className="p-4">
                    <div className="d-flex flex-column flex-md-row justify-content-between align-items-start">
                        <div className="mb-3 mb-md-0">
                            <h3 className="text-primary fw-bold mb-2 d-flex align-items-center">
                                <House className="me-2" size={24} />
                                {property.propertyname}
                            </h3>
                            <p className="text-muted mb-2 d-flex align-items-center">
                                <GeoAlt className="me-2" size={16} />
                                {property.street_address}, {property.post_number} {property.city}
                            </p>
                            {property.building_year && (
                                <Badge bg="secondary" className="me-2">
                                    Rakennettu {property.building_year}
                                </Badge>
                            )}
                            {property.total_sqm && (
                                <Badge bg="info">
                                    {property.total_sqm} m²
                                </Badge>
                            )}
                        </div>
                        
                        <Button
                            variant={isExpanded ? "outline-secondary" : "primary"}
                            onClick={() => setIsExpanded(!isExpanded)}
                            className="d-flex align-items-center"
                        >
                            {isExpanded ? (
                                <>
                                    <ChevronUp className="me-2" size={16} />
                                    Sulje perustiedot
                                </>
                            ) : (
                                <>
                                    <ChevronDown className="me-2" size={16} />
                                    Näytä perustiedot
                                </>
                            )}
                        </Button>
                    </div>
                </Card.Body>
            </Card>

            {/* Expanded Details */}
            {isExpanded && (
                <div className="property-details">
                    <PropertySection 
                        title="Perustiedot" 
                        items={basicInfo}
                        bgColor="primary"
                    />
                    
                    <PropertySection 
                        title="Järjestelmät ja tekniikka" 
                        items={systemsInfo}
                        bgColor="success"
                    />
                    
                    <PropertySection 
                        title="Kiinteistötiedot" 
                        items={propertyInfo}
                        bgColor="info"
                    />
                    
                    <PropertySection 
                        title="Lisätiedot" 
                        items={additionalInfo}
                        bgColor="warning"
                    />
                </div>
            )}
        </div>
    );
};

HouseBasicInformation.propTypes = {
    property: PropTypes.shape({
        propertyname: PropTypes.string,
        street_address: PropTypes.string,
        post_number: PropTypes.string,
        city: PropTypes.string,
        land: PropTypes.string,
        house_type: PropTypes.string,
        building_year: PropTypes.number,
        created_at: PropTypes.string,
        description: PropTypes.string,
        total_sqm: PropTypes.number,
        living_sqm: PropTypes.number,
        room_list: PropTypes.string,
        floors: PropTypes.number,
        dataconnection: PropTypes.string,
        TV_system: PropTypes.string,
        drain: PropTypes.string,
        water: PropTypes.string,
        electricity: PropTypes.string,
        main_heat_system: PropTypes.string,
        sauna: PropTypes.string,
        pipes: PropTypes.number,
        roof_type: PropTypes.string,
        ground: PropTypes.string,
        property_id: PropTypes.string,
        rasite: PropTypes.string,
        ranta: PropTypes.string,
        userid: PropTypes.number,
        latitude: PropTypes.number,
        longitude: PropTypes.number,
    }).isRequired,
};

export default HouseBasicInformation;