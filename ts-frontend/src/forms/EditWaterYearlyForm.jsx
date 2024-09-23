import { useState, useEffect } from 'react';
import FloatingLabel from 'react-bootstrap/FloatingLabel';
import Form from 'react-bootstrap/Form';
import Button from 'react-bootstrap/Button';

const EditWaterYearlyForm = ({ waterYearly, updateYearlyWaterConsumption, onSubmit }) => {
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
            onSubmit(propertyid, year, m3, euros); // Pass the updated data to the onSubmit function
        } catch (error) {
            alert(error.message);
            return;
        }
    };

    // Check if updatedWaterYearly is defined before rendering the form
    return updatedWaterYearly ? (
<Form onSubmit={handleSubmit} className=''>
    <h4 className='mt-3'>Muokkaa vedenkulutusta</h4>
    <FloatingLabel controlId="floatingInput" label="Vuosi" className="mb-3">
        <Form.Control type="text" name="year" placeholder="Syötä vuosi" value={updatedWaterYearly.year || ''} disabled />
    </FloatingLabel>
    <FloatingLabel controlId="floatingInput" label="Vedenkulutus m³" className="mb-3">
        <Form.Control type="number" step="0.01" name="m3" placeholder="Syötä vedenkulutus" value={updatedWaterYearly.m3 || ''} onChange={handleChange} />
    </FloatingLabel>
    <FloatingLabel controlId="floatingInput" label="Veden hinta €" className="mb-3">
        <Form.Control type="number" step="0.01" name="euros" placeholder="Syötä veden hinta" value={updatedWaterYearly.euros || ''} onChange={handleChange} />            
    </FloatingLabel>
    <Button className="primary-button mt-2 mb-2" type="submit">
        Tallenna
    </Button>
    <Button className="secondary-button mt-2 mb-2" onClick={onSubmit}>
        Peruuta
    </Button>
</Form>
    ) : null;
}

export default EditWaterYearlyForm;