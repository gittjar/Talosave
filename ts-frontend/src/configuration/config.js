// config.js
const config = {
  // Automatically detect environment and use appropriate backend URL
  baseURL: import.meta.env.PROD 
    ? 'https://talosave-backend.azurewebsites.net'  // Production (Azure)
    : 'http://localhost:3000',                       // Development (Local)
  
  // API URL for new endpoints (aliases baseURL for consistency)
  apiUrl: import.meta.env.PROD 
    ? 'https://talosave-backend.azurewebsites.net/api'
    : 'http://localhost:3000/api'
};
  
  export default config;



