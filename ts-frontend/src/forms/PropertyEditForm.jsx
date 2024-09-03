import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { toast } from 'react-toastify';


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
  setNewDescription,
  setNewRoomList,
  setNewFloors,
  setNewDataconnection,
  setNewTVSystem,
  setNewDrain,
  setNewWater,
  setNewElectricity,
  setNewMainHeatSystem,
  setNewSauna,
  setNewPipes,
  setNewRoofType,
  setNewGround,
  setNewPropertyId,
  setNewRasite,
  setNewRanta,
  setNewUserid,
  setNewLatitude,
  setNewLongitude,
  setNewTotalSqm,
  setNewLivingSqm,
  newPropertyName,
  newStreetAddress,
  newPostNumber,
  newCity,
  newLand,
  newHouseType,
  newBuildingYear,
  newDescription,
  newRoomList,
  newFloors,
  newDataconnection,
  newTVSystem,
  newDrain,
  newWater,
  newElectricity,
  newMainHeatSystem,
  newSauna,
  newPipes,
  newRoofType,
  newGround,
  newPropertyId,
  newRasite,
  newRanta,
  newUserid,
  newLatitude,
  newLongitude,
  newTotalSqm,
  newLivingSqm,
}) => {
    const [submitSuccess, setSubmitSuccess] = useState(false);

    const handleUpdatePropertySuccess = () => {
        handleUpdateProperty();
      setSubmitSuccess(true);
      toast.dark('Tiedot päivitetty onnistuneesti!');
    };




    return (
        <div className='property-edit-form'>
            <label className="mb-1">Rakennuksen nimi</label>
            <input
                type="text"
                value={newPropertyName}
                onChange={(e) => setNewPropertyName(e.target.value)}
                placeholder="Rakennuksen nimi"
            />
        
            <label className="mb-1">Katuosoite</label>
            <input
                type="text"
                value={newStreetAddress}
                onChange={(e) => setNewStreetAddress(e.target.value)}
                placeholder="Katuosoite"
            />
            <label className="mb-1">Postinumero</label>
            <input
                type="text"
                value={newPostNumber}
                onChange={(e) => setNewPostNumber(e.target.value)}
                placeholder="Postinumero"
            />
            <label className="mb-1">Kaupunki</label>
            <input
                type="text"
                value={newCity}
                onChange={(e) => setNewCity(e.target.value)}
                placeholder="Kaupunki"
            />
            <label className="mb-1">Maa</label>
            <input
                type="text"
                value={newLand}
                onChange={(e) => setNewLand(e.target.value)}
                placeholder="Maa"
            />
            <label className="mb-1">Talotyyppi</label>
            <input
                type="text"
                value={newHouseType}
                onChange={(e) => setNewHouseType(e.target.value)}
                placeholder="Talotyyppi"
            />
            <label className="mb-1">Rakennusvuosi</label>
            <input
                type="text"
                value={newBuildingYear}
                onChange={(e) => setNewBuildingYear(e.target.value)}
                placeholder="Rakennusvuosi"
            />
            <label className="mb-1">Kokonais pinta-ala m2</label>
            <input
                type="text"
                value={newTotalSqm}
                onChange={(e) => setNewTotalSqm(e.target.value)}
                placeholder="Kokonais pinta-ala m2"
            />
            <label className="mb-1">Asuinpinta-ala m2</label>
            <input
                type="text"
                value={newLivingSqm}
                onChange={(e) => setNewLivingSqm(e.target.value)}
                placeholder="Asuinpinta-ala m2"
            />
            <br />
    
   
            <label className="mb-1">Huoneluettelo</label>
            <input
                type="text"
                value={newRoomList}
                onChange={(e) => setNewRoomList(e.target.value)}
                placeholder="Huoneluettelo"
            />
            <label className="mb-1">Kerrokset</label>
            <input
                type="text"
                value={newFloors}
                onChange={(e) => setNewFloors(e.target.value)}
                placeholder="Kerrokset"
            />
            <label className="mb-1">Tietoliikenne</label>
            <input
                type="text"
                value={newDataconnection}
                onChange={(e) => setNewDataconnection(e.target.value)}
                placeholder="Tietoliikenne"
            />
            <label className="mb-1">TV yhteys</label>
            <input
                type="text"
                value={newTVSystem}
                onChange={(e) => setNewTVSystem(e.target.value)}
                placeholder="TV yhteys"
            />
            <label className="mb-1">Viemäröinti</label>
            <input
                type="text"
                value={newDrain}
                onChange={(e) => setNewDrain(e.target.value)}
                placeholder="Viemäröinti"
            />
            <label className="mb-1">Vesi</label>
            <input
                type="text"
                value={newWater}
                onChange={(e) => setNewWater(e.target.value)}
                placeholder="Vesi"
            />
            <label className="mb-1">Sähköt</label>
            <input
                type="text"
                value={newElectricity}
                onChange={(e) => setNewElectricity(e.target.value)}
                placeholder="Sähköt"
            />
            <label className="mb-1">Pää-asiallinen lämmitysjärjestelmä</label>
            <input
                type="text"
                value={newMainHeatSystem}
                onChange={(e) => setNewMainHeatSystem(e.target.value)}
                placeholder="Pää-asiallinen lämmitysjärjestelmä"
            />
            <label className="mb-1">Saunan tyyppi</label>
            <input
                type="text"
                value={newSauna}
                onChange={(e) => setNewSauna(e.target.value)}
                placeholder="Saunan tyyppi"
            />
            <label className="mb-1">Hormit</label>
            <input
                type="text"
                value={newPipes}
                onChange={(e) => setNewPipes(e.target.value)}
                placeholder="Hormien määrä"
            />
            <label className="mb-1">Kattotyyppi</label>
            <input
                type="text"
                value={newRoofType}
                onChange={(e) => setNewRoofType(e.target.value)}
                placeholder="Kattotyyppi"
            />
            <label className="mb-1">Tontti</label>
            <input
                type="text"
                value={newGround}
                onChange={(e) => setNewGround(e.target.value)}
                placeholder="Tontti"
            />
            <label className="mb-1">Kiinteistötunnus</label>
            <input
                type="text"
                value={newPropertyId}
                onChange={(e) => setNewPropertyId(e.target.value)}
                placeholder="Syötä kiinteistötunnus"
            />
            <label className="mb-1">Rasitteet</label>
            <input
                type="text"
                value={newRasite}
                onChange={(e) => setNewRasite(e.target.value)}
                placeholder="Rasitteet"
            />
            <label className="mb-1">Ranta</label>
            <input
                type="text"
                value={newRanta}
                onChange={(e) => setNewRanta(e.target.value)}
                placeholder="Ranta"
            />
            <label className="mb-1">New User ID</label>
            <input
                type="text"
                value={newUserid}
                onChange={(e) => setNewUserid(e.target.value)}
                placeholder="New User ID"
                disabled
            />
                    <label className="mb-1">Latitude</label>
                    <input
                        type="text"
                        value={newLatitude}
                        onChange={(e) => {
                            if (!isNaN(e.target.value)) {
                                setNewLatitude(e.target.value);
                            }
                        }}
                        placeholder="Latitude"
                    />
                    <label className="mb-1">Longitude</label>
                    <input
                        type="text"
                        value={newLongitude}
                        onChange={(e) => {
                            if (!isNaN(e.target.value)) {
                                setNewLongitude(e.target.value);
                            }
                        }}
                        placeholder="Longitude"
                    />

                    <label className="mb-1">Kohdekuvaus</label><br></br>
                    <textarea className="w-100 bg-white text-secondary"
                        value={newDescription}
                        onChange={(e) => setNewDescription(e.target.value)}
                        placeholder="Kohdekuvaus"
                    />
            <br />

            <br />

            
            <button onClick={handleUpdatePropertySuccess} className="primary-button">Save</button>
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
    setNewCreatedAt: PropTypes.func.isRequired,
    setNewDescription: PropTypes.func.isRequired,
    setNewRoomList: PropTypes.func.isRequired,
    setNewFloors: PropTypes.func.isRequired,
    setNewDataconnection: PropTypes.func.isRequired,
    setNewTVSystem: PropTypes.func.isRequired,
    setNewDrain: PropTypes.func.isRequired,
    setNewWater: PropTypes.func.isRequired,
    setNewElectricity: PropTypes.func.isRequired,
    setNewMainHeatSystem: PropTypes.func.isRequired,
    setNewSauna: PropTypes.func.isRequired,
    setNewPipes: PropTypes.func.isRequired,
    setNewRoofType: PropTypes.func.isRequired,
    setNewGround: PropTypes.func.isRequired,
    setNewPropertyId: PropTypes.func.isRequired,
    setNewRasite: PropTypes.func.isRequired,
    setNewRanta: PropTypes.func.isRequired,
    setNewUserid: PropTypes.func.isRequired,
    setNewLatitude: PropTypes.func.isRequired,
    setNewLongitude: PropTypes.func.isRequired,
    setNewTotalSqm: PropTypes.func.isRequired,
    setNewLivingSqm: PropTypes.func.isRequired,
    newPropertyName: PropTypes.string.isRequired,
    newStreetAddress: PropTypes.string.isRequired,
    newPostNumber: PropTypes.string.isRequired,
    newCity: PropTypes.string.isRequired,
    newLand: PropTypes.string.isRequired,
    newHouseType: PropTypes.string.isRequired,
    newBuildingYear: PropTypes.string.isRequired,
    newCreatedAt: PropTypes.string.isRequired,
    newDescription: PropTypes.string.isRequired,
    newRoomList: PropTypes.string.isRequired,
    newFloors: PropTypes.string.isRequired,
    newDataconnection: PropTypes.string.isRequired,
    newTVSystem: PropTypes.string.isRequired,
    newDrain: PropTypes.string.isRequired,
    newWater: PropTypes.string.isRequired,
    newElectricity: PropTypes.string.isRequired,
    newMainHeatSystem: PropTypes.string.isRequired,
    newSauna: PropTypes.string.isRequired,
    newPipes: PropTypes.string.isRequired,
    newRoofType: PropTypes.string.isRequired,
    newGround: PropTypes.string.isRequired,
    newPropertyId: PropTypes.string.isRequired,
    newRasite: PropTypes.string.isRequired,
    newRanta: PropTypes.string.isRequired,
    newUserid: PropTypes.string.isRequired,
    newLatitude: PropTypes.string.isRequired,
    newLongitude: PropTypes.string.isRequired,
    newTotalSqm: PropTypes.string.isRequired,
    newLivingSqm: PropTypes.string.isRequired
};

export default PropertyEditForm;