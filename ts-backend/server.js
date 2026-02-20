const express = require('express');
const multer = require('multer');
const upload = multer();
const { File } = require('./mongo');
require('dotenv').config();
const sql = require('mssql');
const app = express();
const cors = require('cors');
const serveStaticFiles = require('./middleware/staticFiles');
const setupRoutes = require('./routes/index');

// Middleware
app.use(express.json());

// CORS configuration - Simplified for production
const allowedOrigins = [
  'http://localhost:5173', 
  'http://localhost:5174',
  'http://localhost:3000',
  'https://talosave-frontend.azurewebsites.net',
  'https://talotieto.netlify.app'
];

const corsOptions = {
  origin: function (origin, callback) {
    // Allow requests with no origin (Postman, mobile apps, etc.)
    if (!origin) return callback(null, true);
    
    // In development, allow any localhost
    if (origin.includes('localhost')) {
      return callback(null, true);
    }
    
    // Check if origin is in allowed list
    if (allowedOrigins.includes(origin)) {
      return callback(null, true);
    }
    
    // Reject other origins
    console.log('CORS blocked origin:', origin);
    callback(new Error('Not allowed by CORS: ' + origin));
  },
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true,
  optionsSuccessStatus: 200
};

app.use(cors(corsOptions));

// Handle preflight requests
app.options('*', cors(corsOptions));

serveStaticFiles(app);

// Database configuration
const config = {
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    server: process.env.DB_SERVER,
    port: 1433,
    database: process.env.DB_NAME,
    options: {
        encrypt: true,
        trustServerCertificate: true,
        enableArithAbort: true
    },
    pool: {
        max: 10,
        min: 0,
        idleTimeoutMillis: 30000
    }
};

// Connect to SQL database with retry logic
const connectToSQL = async (retries = 3) => {
    for (let i = 0; i < retries; i++) {
        try {
            console.log(`Attempting to connect to SQL Server (attempt ${i + 1}/${retries})...`);
            const pool = await sql.connect(config);
            console.log('Connected to the SQL database!');
            app.locals.sqlRequest = new sql.Request(pool);
            return;
        } catch (err) {
            console.error(`Connection attempt ${i + 1} failed:`, err.message);
            if (err.code === 'ELOGIN') {
                console.error('Login failed. Please check your database credentials in .env file:');
                console.error('- DB_USER:', process.env.DB_USER);
                console.error('- DB_SERVER:', process.env.DB_SERVER);
                console.error('- DB_NAME:', process.env.DB_NAME);
                console.error('Password is set:', !!process.env.DB_PASSWORD);
                break; // Don't retry on authentication failures
            }
            if (i < retries - 1) {
                console.log('Retrying in 5 seconds...');
                await new Promise(resolve => setTimeout(resolve, 5000));
            }
        }
    }
    console.error('Could not connect to SQL Server. Server will continue but database operations will fail.');
};

connectToSQL();

// Setup all routes
setupRoutes(app);

// Error handling middleware
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({ error: err.message || 'Something broke!' });
});

// Start the server
const port = process.env.PORT || 3000;

// Verify critical environment variables
const requiredEnvVars = ['DB_USER', 'DB_PASSWORD', 'DB_SERVER', 'DB_NAME'];
const missingVars = requiredEnvVars.filter(varName => !process.env[varName]);

if (missingVars.length > 0) {
    console.error('❌ Missing required environment variables:', missingVars.join(', '));
    console.error('Server cannot start without database configuration');
    process.exit(1);
}

console.log('✅ Environment variables verified');
console.log('🚀 Starting server on port', port);
console.log('📊 Database:', process.env.DB_NAME);
console.log('🌐 Environment:', process.env.NODE_ENV || 'development');

app.listen(port, () => {
    console.log(`✅ Server is running on port ${port}`);
    console.log(`🔗 Health check: http://localhost:${port}/`);
}).on('error', (err) => {
    console.error('❌ Failed to start server:', err);
    process.exit(1);
});
