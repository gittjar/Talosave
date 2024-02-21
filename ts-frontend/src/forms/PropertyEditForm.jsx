import PropTypes from 'prop-types';

const PropertyEditForm = ({
    handleUpdateProperty,
    handleCancelClick,
    setNewPropertyName,
    setNewStreetAddress,
    setNewPostNumber,
    setNewCity,
    setNewLand,
    setNewHouseType,
    setNewBuildingYear,
    setNewTotalSqm,
    setNewLivingSqm,
    newPropertyName,
    newStreetAddress,
    newPostNumber,
    newCity,
    newLand,
    newHouseType,
    newBuildingYear,
    newTotalSqm,
    newLivingSqm
}) => {
    return (
        <div>
            <input
                type="text"
                value={newPropertyName}
                onChange={(e) => setNewPropertyName(e.target.value)}
                placeholder="New Property Name"
            />
            <input
                type="text"
                value={newStreetAddress}
                onChange={(e) => setNewStreetAddress(e.target.value)}
                placeholder="New Street Address"
            />
            <input
                type="text"
                value={newPostNumber}
                onChange={(e) => setNewPostNumber(e.target.value)}
                placeholder="New Post Number"
            />
            <input
                type="text"
                value={newCity}
                onChange={(e) => setNewCity(e.target.value)}
                placeholder="New City"
            />
            <input
                type="text"
                value={newLand}
                onChange={(e) => setNewLand(e.target.value)}
                placeholder="New Land"
            />
            <input
                type="text"
                value={newHouseType}
                onChange={(e) => setNewHouseType(e.target.value)}
                placeholder="New House Type"
            />
            <input
                type="text"
                value={newBuildingYear}
                onChange={(e) => setNewBuildingYear(e.target.value)}
                placeholder="New Building Year"
            />
            <input
                type="text"
                value={newTotalSqm}
                onChange={(e) => setNewTotalSqm(e.target.value)}
                placeholder="New Total Sqm"
            />
            <input
                type="text"
                value={newLivingSqm}
                onChange={(e) => setNewLivingSqm(e.target.value)}
                placeholder="New Living Sqm"
            />
            <br />
            
            <button onClick={handleUpdateProperty} className="primary-button">Save</button>
            <button onClick={handleCancelClick} className="danger-button">Cancel</button>
        </div>
    );
};

PropertyEditForm.propTypes = {
    handleUpdateProperty: PropTypes.func.isRequired,
    handleCancelClick: PropTypes.func.isRequired,
    setNewPropertyName: PropTypes.func.isRequired,
    setNewStreetAddress: PropTypes.func.isRequired,
    setNewPostNumber: PropTypes.func.isRequired,
    setNewCity: PropTypes.func.isRequired,
    setNewLand: PropTypes.func.isRequired,
    setNewHouseType: PropTypes.func.isRequired,
    setNewBuildingYear: PropTypes.func.isRequired,
    setNewTotalSqm: PropTypes.func.isRequired,
    setNewLivingSqm: PropTypes.func.isRequired,
    newPropertyName: PropTypes.string.isRequired,
    newStreetAddress: PropTypes.string.isRequired,
    newPostNumber: PropTypes.string.isRequired,
    newCity: PropTypes.string.isRequired,
    newLand: PropTypes.string.isRequired,
    newHouseType: PropTypes.string.isRequired,
    newBuildingYear: PropTypes.string.isRequired,
    newTotalSqm: PropTypes.string.isRequired,
    newLivingSqm: PropTypes.string.isRequired
};

export default PropertyEditForm;