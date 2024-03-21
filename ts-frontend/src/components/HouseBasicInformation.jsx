import PropTypes from 'prop-types';
import React, { useState } from 'react';

const HouseBasicInformation = ({ property }) => {
    const [isExpanded, setIsExpanded] = useState(false);

    return (
        <div>
            <h4 className='text-body-tertiary'>{property.propertyname}</h4>
            <p>{property.street_address}, {property.post_number}, {property.city}</p>
            <button className='edit-link' onClick={() => setIsExpanded(!isExpanded)}>
                {isExpanded ? 'Sulje perustiedot' : 'Näytä perustiedot'}
            </button>
            {isExpanded && (
                <table className="table table-bordered border-secondary-subtle table-sm">
                    <tbody>
                        {property.property_id && <tr><td>Kiinteistötunnus</td><td>{property.property_id}</td></tr>}
                        {property.land && <tr><td>Maa</td><td>{property.land}</td></tr>}

                        {property.house_type && <tr><td>Talotyyppi</td><td>{property.house_type}</td></tr>}
                        {property.building_year && <tr><td>Building Year</td><td>{property.building_year}</td></tr>}
                        {property.total_sqm && <tr><td>Total Sqm</td><td>{property.total_sqm}</td></tr>}
                        {property.living_sqm && <tr><td>Living Sqm</td><td>{property.living_sqm}</td></tr>}
                        {property.created_at && <tr><td>Created At</td><td>{property.created_at}</td></tr>}
                        {property.room_list && <tr><td>Room List</td><td>{property.room_list}</td></tr>}
                        {property.floors && <tr><td>Floors</td><td>{property.floors}</td></tr>}
                        {property.dataconnection && <tr><td>Data Connection</td><td>{property.dataconnection}</td></tr>}
                        {property.TV_system && <tr><td>TV System</td><td>{property.TV_system}</td></tr>}
                        {property.drain && <tr><td>Drain</td><td>{property.drain}</td></tr>}
                        {property.water && <tr><td>Water</td><td>{property.water}</td></tr>}
                        {property.electricity && <tr><td>Electricity</td><td>{property.electricity}</td></tr>}
                        {property.main_heat_system && <tr><td>Main Heat System</td><td>{property.main_heat_system}</td></tr>}
                        {property.sauna && <tr><td>Sauna</td><td>{property.sauna}</td></tr>}
                        {property.pipes && <tr><td>Pipes</td><td>{property.pipes}</td></tr>}
                        {property.roof_type && <tr><td>Roof Type</td><td>{property.roof_type}</td></tr>}
                        {property.ground && <tr><td>Ground</td><td>{property.ground}</td></tr>}
                        {property.rasite && <tr><td>Rasite</td><td>{property.rasite}</td></tr>}
                        {property.ranta && <tr><td>Ranta</td><td>{property.ranta}</td></tr>}
                        {property.userid && <tr><td>User ID</td><td>{property.userid}</td></tr>}
                        {property.latitude && <tr><td>Latitude</td><td>{property.latitude}</td></tr>}
                        {property.longitude && <tr><td>Longitude</td><td>{property.longitude}</td></tr>}
                        {property.description && <tr><td>Description</td><td>{property.description}</td></tr>}


                    </tbody>
                </table>
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