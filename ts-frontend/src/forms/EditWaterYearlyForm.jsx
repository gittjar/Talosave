import { useState, useEffect } from 'react';
import Form from 'react-bootstrap/Form';
import Button from 'react-bootstrap/Button';

const EditWaterYearlyForm = ({ waterYearly, updateYearlyWaterConsumption }) => {
    const [updatedWaterYearly, setUpdatedWaterYearly] = useState({
        propertyid: waterYearly.propertyid || 0,
        year: waterYearly.year || 0,
        m3: waterYearly.m3 || 0,
        euros: waterYearly.euros || 0
    });

    useEffect(() => {
        setUpdatedWaterYearly(waterYearly);
    }, [waterYearly]);

    const handleChange = (event) => {
        setUpdatedWaterYearly({
            ...updatedWaterYearly,
            [event.target.name]: Number(event.target.value)
        });
    };

    const validateInput = (propertyid, year, m3, euros) => {
        if (isNaN(propertyid) || isNaN(year) || isNaN(m3) || isNaN(euros)) {
            throw new Error('All fields must be numbers');
        }
    }

 
    const handleSubmit = async (event) => {
        event.preventDefault();

        const { propertyid, year, m3, euros } = updatedWaterYearly;
        try {
            validateInput(propertyid, year, m3, euros);
            await updateYearlyWaterConsumption(propertyid, year, m3, euros); // Call the function
        } catch (error) {
            alert(error.message);
            return;
        }
    };

    // Check if updatedWaterYearly is defined before rendering the form
    return updatedWaterYearly ? (
        <Form onSubmit={handleSubmit} className=''>
            <h4 className='mt-3'>Muokkaa vedenkulutusta</h4>
            <Form.Group controlId="formWaterYear">
                <Form.Label>Vuosi</Form.Label>
                <Form.Control type="number" name="year" placeholder="Syötä vuosi" value={updatedWaterYearly.year || ''} onChange={handleChange} />
            </Form.Group>
            <Form.Group controlId="formWaterConsumption">
                <Form.Label>Vedenkulutus</Form.Label>
                <Form.Control type="number" step="0.01" name="m3" placeholder="Syötä vedenkulutus" value={updatedWaterYearly.m3 || ''} onChange={handleChange} />
            </Form.Group>
            <Form.Group controlId="formWaterCost">
                <Form.Label>Veden hinta</Form.Label>
                <Form.Control type="number" step="0.01" name="euros" placeholder="Syötä veden hinta" value={updatedWaterYearly.euros || ''} onChange={handleChange} />            </Form.Group>
            <Button className="primary-button mt-2 mb-2" type="submit">
                Tallenna
            </Button>
            <Button className="secondary-button mt-2 mb-2" onClick={() => setUpdatedWaterYearly(null)}>
                Peruuta
            </Button>
        </Form>
    ) : null;
}

export default EditWaterYearlyForm;