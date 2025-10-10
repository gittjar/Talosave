// config.js
const config = {
  // Automatically detect environment and use appropriate backend URL
  baseURL: import.meta.env.PROD 
    ? 'https://talosave-backend.azurewebsites.net'  // Production (Azure)
    : 'http://localhost:3000'                        // Development (Local)
};
  
  export default config;



