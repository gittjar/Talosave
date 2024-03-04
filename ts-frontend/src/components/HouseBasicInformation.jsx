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
                        {property.land && <tr><td>Land</td><td>{property.land}</td></tr>}
                        {property.house_type && <tr><td>House Type</td><td>{property.house_type}</td></tr>}
                        {property.building_year && <tr><td>Building Year</td><td>{property.building_year}</td></tr>}
                        {property.total_sqm && <tr><td>Total Sqm</td><td>{property.total_sqm}</td></tr>}
                        {property.living_sqm && <tr><td>Living Sqm</td><td>{property.living_sqm}</td></tr>}
                        {property.created_at && <tr><td>Created At</td><td>{property.created_at}</td></tr>}
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
        total_sqm: PropTypes.number,
        living_sqm: PropTypes.number,
        created_at: PropTypes.string,
        description: PropTypes.string,
    }).isRequired,
};

export default HouseBasicInformation;