
import PropTypes from 'prop-types';

const HouseBasicInformation = ({ property }) => (
    <div>
        <h1>{property.propertyname}</h1>
        {property.street_address ? <p>Street Address: {property.street_address}</p> : null}
        {property.post_number ? <p>Post Number: {property.post_number}</p> : null}
        {property.city ? <p>City: {property.city}</p> : null}
        {property.land ? <p>Land: {property.land}</p> : null}
        {property.house_type ? <p>House Type: {property.house_type}</p> : null}
        {property.building_year ? <p>Building Year: {property.building_year}</p> : null}
        {property.total_sqm ? <p>Total Sqm: {property.total_sqm}</p> : null}
        {property.living_sqm ? <p>Living Sqm: {property.living_sqm}</p> : null}
        {property.created_at ? <p>Created At: {property.created_at}</p> : null}
        {property.description ? <p>Description: {property.description}</p> : null}
    </div>
);

HouseBasicInformation.propTypes = {
    property: PropTypes.shape({
        propertyname: PropTypes.string,
        street_address: PropTypes.string,
        post_number: PropTypes.string,
        city: PropTypes.string,
        land: PropTypes.string, // Add prop validation for 'property.land'
        house_type: PropTypes.string,
        building_year: PropTypes.string,
        total_sqm: PropTypes.string,
        living_sqm: PropTypes.string,
        created_at: PropTypes.string,
        description: PropTypes.string,
    }).isRequired,
};


export default HouseBasicInformation;