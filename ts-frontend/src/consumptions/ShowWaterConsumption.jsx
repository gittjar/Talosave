import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import Table from 'react-bootstrap/Table';
import config from '../configuration/config';
import AddYearlyWaterForm from '../forms/AddYearlyWaterForm';
import { PlusLg } from 'react-bootstrap-icons';
import { toast } from 'react-toastify';
import colorMap from '../components/colorMap';
import DeleteConfirmationWater from '../notifications/DeleteConfirmationWaterYearly';
import EditWaterYearlyForm from '../forms/EditWaterYearlyForm';
import { VictoryChart, VictoryLine, VictoryAxis, VictoryTheme, VictoryLabel, VictoryTooltip, VictoryBar } from 'victory';


const ShowWaterConsumption = () => {

    const { id } = useParams(); // Get the property ID from the URL
    const [yearlyWaterConsumptions, setYearlyWaterConsumptions] = useState([]);
    const [selectedYears, setSelectedYears] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showYearlyForm, setShowYearlyForm] = useState(false);
    const [sortConfig, setSortConfig] = useState({ key: 'year', direction: 'ascending' });
    const [activeButton, setActiveButton] = useState('');
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
    const [deletingItem, setDeletingItem] = useState(null);
    const [showEditForm, setShowEditForm] = useState(false);
    const [editingItem, setEditingItem] = useState(null);




    const fetchYearlyWaterConsumptions = async (propertyId) => {
        const token = localStorage.getItem('userToken'); // Get the token from local storage
        try {
            const response = await fetch(`${config.baseURL}/api/waterconsumptions/${propertyId}`, {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            });
    
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
    
            const data = await response.json(); // Parse the response as JSON
            console.log('Yearly Data:', data); // Log the data
    
            return data; // Return the data
        } catch (error) {
            console.error('Error fetching yearly water consumptions:', error);
            return []; // Return an empty array in case of error
        }
    }

// PUT request to update the yearly water consumption
const updateYearlyWaterConsumption = async (propertyid, year, m3, euros) => {
    console.log('In updateYearlyWaterConsumption:', { propertyid, year, m3, euros }); // Log the values
    // Retrieve the JWT token from storage
    const token = localStorage.getItem('userToken'); // Replace this with the correct code to retrieve the JWT
    console.log('Token:', token); // Log the token

    // Check if the token is in the correct format
    if (!token || token.split('.').length !== 3) {
        throw new Error('Invalid JWT');
    }

    // Prepare the request body
    const requestBody = {
        propertyid: parseInt(propertyid, 10),
        year: parseInt(year, 10),
        m3: parseFloat(m3),
        euros: parseFloat(euros)
    };

    console.log('Request body:', requestBody); // Log the request body

    // Make the PUT request
    const response = await fetch(`${config.baseURL}/api/waterconsumptions/yearly`, {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(requestBody)
    });

    console.log('Response:', response); // Log the response



    // Handle the response from the server
    const data = await response.json();
    toast.dark('Vuosi ' + year + ' päivitetty onnistuneesti.');
    console.log('Response data:', data); // Log the response data
    return data;
}

const handleEditSubmit = async (propertyid, year, m3, euros) => {
    try {
        await updateYearlyWaterConsumption(propertyid, year, m3, euros);
        await fetchYearlyData();
        setShowEditForm(false); // This line should close the form
    } catch (error) {
        console.error('Error updating yearly water consumption:', error);
        toast.error('Failed to update yearly water data.');
    }
};



    const deleteYearlyWaterConsumption = async (propertyId, year) => {
        const token = localStorage.getItem('userToken'); // Get the token from local storage
    
        return new Promise(async (resolve, reject) => {
            try {
                const response = await fetch(`${config.baseURL}/api/waterconsumptions/yearly`, {
                    method: 'DELETE',
                    headers: {
                        'Content-Type': 'application/json',
                        Authorization: `Bearer ${token}`
                    },
                    body: JSON.stringify({ propertyid: propertyId, year })
                });
    
                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }
    
                // Remove the deleted record from the state
                setYearlyWaterConsumptions(prevData => prevData.filter(item => item.year !== year));
                toast.success('Vuosi: ' + year + ' poistettu onnistuneesti.');
                resolve();
            } catch (error) {
                console.error('Error deleting yearly water consumption:', error);
                toast.error('Failed to delete yearly water data.');
                reject();
            }
        });
    }

    useEffect(() => {
        console.log('Property ID:', id); // Log the property ID
        setLoading(true); // Set loading to true before fetching data
        fetchYearlyData();
    }, [id]);
    
    const fetchYearlyData = async () => {
        const yearlyData = await fetchYearlyWaterConsumptions(id);
        setYearlyWaterConsumptions(yearlyData);
        setSelectedYears(yearlyData.filter(item => item.m3).map(item => item.year)); // Select all years with M3 data by default
        setLoading(false);
    }

    const handleDeleteClick = (item) => {
        setDeletingItem(item);
        setShowDeleteConfirm(true);
    };

    const handleYearCheck = (year) => {
        setSelectedYears(prevYears => {
            if (prevYears.includes(year)) {
                return prevYears.filter(y => y !== year);
            } else {
                return [...prevYears, year];
            }
        });
    }

    const handleEditClick = (item) => {
        setEditingItem(item);
        setShowEditForm(true);
        console.log('Editing:', item);
    };

    const filteredData = yearlyWaterConsumptions.filter(item => selectedYears.includes(item.year));
    const validData = filteredData.filter(item => !isNaN(item.m3) && !isNaN(item.euros));
    const maxEuros = validData.length > 0 ? Math.max(...validData.map(item => item.euros)) : 0;

    const sortedData = React.useMemo(() => {
        let sortableData = [...filteredData];
        sortableData = sortableData.filter(item => !isNaN(item.m3) && !isNaN(item.euros)); // Filter out invalid data
        sortableData.sort((a, b) => {
            if (a[sortConfig.key] < b[sortConfig.key]) {
                return sortConfig.direction === 'ascending' ? -1 : 1;
            }
            if (a[sortConfig.key] > b[sortConfig.key]) {
                return sortConfig.direction === 'ascending' ? 1 : -1;
            }
            return 0;
        });
        return sortableData;
    }, [filteredData, sortConfig]);


    return (
        <div>
            <h2>Vedenkulutus</h2>

            <section>
    <button onClick={() => setShowYearlyForm(prevShowForm => !prevShowForm)} className='edit-link'>
        <PlusLg /> {showYearlyForm ? 'Sulje vuosittainen vedenkulutus' : 'Lisää vuosittainen vedenkulutus'}
    </button>
    {showYearlyForm && <AddYearlyWaterForm propertyId={id} refreshData={fetchYearlyData} />}
    </section>
<hr />
            <section className='water-labels-year'>
            {yearlyWaterConsumptions.filter(item => item.m3).map(item => (
    <button
        key={item.year}
        style={{
            backgroundColor: selectedYears.includes(item.year) ? colorMap.getColor(item.year) : 'grey',
            padding: '5px',
            margin: '5px'
        }}
        className='m3-box'
        onClick={() => handleYearCheck(item.year)}
    >
        <section style={{ display: 'inline-block', marginLeft: '10px' }}>
            {item.year} ({item.m3.toFixed(1)} m³)
        </section>
    </button>
))}
            </section>
            <div style={{
    position: 'relative',
    width: '100%',
    height: '100%',
    borderRadius: '10px',
}}>
    <div style={{
        position: 'absolute',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        backgroundImage: `url(/assets/images/IMG_2727.WEBP)`,
        backgroundSize: 'cover',
        borderRadius: '10px',
        opacity: 0.1, // Adjust this value to make the background image lighter or darker
        zIndex: 1
    }}></div>
            <VictoryChart domainPadding={20} theme={VictoryTheme.material}
                     style={{
                        parent: { background: 'none', position: 'relative', zIndex: 2 } // This makes the chart background transparent
                    }}
            >
    <VictoryAxis
        tickValues={sortedData.map(item => item.year.toString())}
    />
    <VictoryAxis
        dependentAxis
        tickValues={sortedData.length > 0 ? Array.from({length: 5}, (_, i) => (sortedData.map(item => item.m3).reduce((a, b) => Math.max(a, b)) / 4) * i) : [0]}
        tickFormat={(t) => t.toFixed(1)}
    />
    <VictoryBar
        data={sortedData.map(item => ({ ...item, year: item.year.toString() }))}
        x="year"
        y="m3"
        sortKey={undefined} // Disable sorting
        style={{
            data: {
                fill: ({ datum }) => colorMap.getColor(parseInt(datum.year))
            }
        }}
        labels={({ datum }) => `Year: ${datum.year}\nm³: ${datum.m3.toFixed(1)}\nEuros: ${datum.euros}`}
        labelComponent={<VictoryTooltip
            style={{ fontSize: 8, padding: 10 }}
            cornerRadius={10}
            flyoutStyle={{ fill: 'lightgrey', stroke: 'black', strokeWidth: 1, filter: 'drop-shadow( 2px 2px black)' }}
        />}
    />
    <VictoryLabel
        text="m³"
        x={30} // Adjust this value to position the label correctly
        y={30}  // Adjust this value to position the label correctly
        textAnchor="middle"
    />
</VictoryChart>
</div>

<div>
    <button className={`link-black ${activeButton === 'cheapest' ? 'active' : ''}`} onClick={() => {setSortConfig({ key: 'euros', direction: 'ascending' }); setActiveButton('cheapest');}}>Cheapest</button>
    <button className={`link-black ${activeButton === 'expensive' ? 'active' : ''}`} onClick={() => {setSortConfig({ key: 'euros', direction: 'descending' }); setActiveButton('expensive');}}>Most expensive</button>
    <button className={`link-black ${activeButton === 'oldest' ? 'active' : ''}`} onClick={() => {setSortConfig({ key: 'year', direction: 'ascending' }); setActiveButton('oldest');}}>Oldest year</button>
    <button className={`link-black ${activeButton === 'newest' ? 'active' : ''}`} onClick={() => {setSortConfig({ key: 'year', direction: 'descending' }); setActiveButton('newest');}}>Newest year</button>
</div>

{showEditForm && 
<EditWaterYearlyForm waterYearly={editingItem} 
updateYearlyWaterConsumption={updateYearlyWaterConsumption}
onSubmit={handleEditSubmit}
setShowEditForm={setShowEditForm}
/>}

            <Table striped bordered hover>
                <thead>
                    <tr>
                        <th>Year</th>
                        <th>Consumption (m³)</th>
                        <th>Euros</th>
                        <th>Actions</th>
                    </tr>
                </thead>
                <tbody>
                    {sortedData.filter(item => item.m3 && item.euros).map((item, index) => (
                        <tr key={index}>
                            <td>{item.year}</td>
                            <td>{item.m3}</td>
                            <td>{item.euros}</td>
                            <td>
                            <button className='edit-link' onClick={() => handleEditClick(item)}>Edit</button>
                            <button className='delete-link' onClick={() => handleDeleteClick(item)}>Delete</button>                            </td>
                        </tr>
                    ))}
                </tbody>
            </Table>

                                    
            <DeleteConfirmationWater 
                show={showDeleteConfirm}
                deleteItem={() => {
                    deleteYearlyWaterConsumption(id, deletingItem.year)
                        .then(() => setShowDeleteConfirm(false));
                }} 
                setShowDeleteConfirm={setShowDeleteConfirm} 
                deletingItem={deletingItem} 
            />

            {loading && <p>Loading...</p>}
        </div>
    );
};

export default ShowWaterConsumption;