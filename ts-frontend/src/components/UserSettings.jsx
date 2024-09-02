import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import config from '../configuration/config.js';
import EditUserForm from '../forms/EditUserForm.jsx';

const UserSettings = () => {
    const [user, setUser] = useState({}); // Initialize user with an empty object
    const [isEditing, setIsEditing] = useState(false); 

    useEffect(() => {
        const username = localStorage.getItem('username'); // Get the username from local storage
    
        if (username) {
            fetch(`${config.baseURL}/api/users/${username}`, { // Fetch the user's data
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('userToken')}`
                }
            })
            .then(response => {
                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }
                return response.json();
            })
            .then(data => setUser(data))
            .catch(error => console.error('Error:', error));
        } else {
            console.error('Username is null');
        }
    }, []);

    const toggleEdit = () => {
        setIsEditing(!isEditing);
    };

    const handleUserUpdate = async (updatedUser) => {
        const username = localStorage.getItem('username'); // Get the username from local storage
    
        if (username) {
            try {
                const response = await fetch(`${config.baseURL}/api/users/${username}`, { // Fetch the user's data
                    method: 'GET',
                    headers: {
                        'Authorization': `Bearer ${localStorage.getItem('userToken')}`
                    }
                });
    
                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }
    
                const data = await response.json();
                setUser(data);
            } catch (error) {
                console.error('Error:', error);
            }
        } else {
            console.error('Username is null');
        }
    };

    return (
        <div>
            <h2>Tilin asetukset</h2>
            {user ? (
                <>
                 <div className="user-card">
                    <p>ID: {user.userid}</p>
                    <p>Käyttäjätunnus: {user.username}</p>
                    <p>Nimi: {user.fullname}</p>
                    <p>Sähköposti: {user.email}</p>
                    <p>Puhelin: {user.phone}</p>
                    </div>
                    <button className='edit-link' onClick={toggleEdit}>{isEditing ? 'Cancel' : 'Edit'}</button>
                    {isEditing && <EditUserForm user={user} onUserUpdate={handleUserUpdate} toggleEdit={toggleEdit} />}
                              
                </>
            )
                               : (
                <p>Loading...</p>
            )}
            <hr></hr>
            <Link to='/mypage'>Omat rakennukset</Link>
        </div>
    );
}

export default UserSettings;