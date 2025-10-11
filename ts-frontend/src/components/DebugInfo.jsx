// DebugInfo.jsx - Temporary debug component
import React, { useEffect } from 'react';
import { useAuth } from '../hooks/useAuth.js';
import { useProperties } from '../hooks/PropertyProvider.jsx';

const DebugInfo = () => {
  const { isLoggedIn, user } = useAuth();
  const { properties, loading, error } = useProperties();

  useEffect(() => {
    console.log('=== DEBUG INFO ===');
    console.log('isLoggedIn:', isLoggedIn);
    console.log('user:', user);
    console.log('properties:', properties);
    console.log('loading:', loading);
    console.log('error:', error);
    console.log('token:', localStorage.getItem('userToken'));
    console.log('userId:', localStorage.getItem('userId'));
    console.log('username:', localStorage.getItem('username'));
  }, [isLoggedIn, user, properties, loading, error]);

  if (!isLoggedIn) {
    return <div>User not logged in</div>;
  }

  return (
    <div style={{ padding: '20px', backgroundColor: '#f0f0f0', margin: '10px' }}>
      <h3>Debug Info</h3>
      <p><strong>Logged in:</strong> {isLoggedIn ? 'Yes' : 'No'}</p>
      <p><strong>User:</strong> {JSON.stringify(user)}</p>
      <p><strong>Properties count:</strong> {properties.length}</p>
      <p><strong>Loading:</strong> {loading ? 'Yes' : 'No'}</p>
      <p><strong>Error:</strong> {error ? JSON.stringify(error) : 'None'}</p>
      <p><strong>Token exists:</strong> {localStorage.getItem('userToken') ? 'Yes' : 'No'}</p>
      <p><strong>User ID:</strong> {localStorage.getItem('userId')}</p>
      
      {properties.length > 0 && (
        <div>
          <h4>Properties:</h4>
          <pre>{JSON.stringify(properties, null, 2)}</pre>
        </div>
      )}
    </div>
  );
};

export default DebugInfo;