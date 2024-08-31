import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import config from '../configuration/config.js';

const UserSettings = () => {
    const [user, setUser] = useState(null);

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

    return (
        <div>
            <h2>User Settings</h2>
            {user ? (
                <>
                    <p>Username: {user.username}</p>
                    <p>Email: {user.email}</p>
                    <p>Phone: {user.phone}</p>
                    <p>Role: {user.role}</p>
                </>
            ) : (
                <p>Loading...</p>
            )}
            <Link to='/mypage'>Minun rakennukset</Link>
        </div>
    );
}

export default UserSettings;