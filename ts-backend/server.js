const express = require('express');
const multer = require('multer');
const upload = multer();
const { File } = require('./mongo');
require('dotenv').config();
const sql = require('mssql');
const app = express();
const cors = require('cors');
const serveStaticFiles = require('./middleware/staticFiles');

// Middleware
app.use(express.json());

// CORS configuration
const corsOptions = {
  origin: function (origin, callback) {
    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin) return callback(null, true);
    
    const allowedOrigins = [
      'http://localhost:5173', 
      'http://localhost:5174',
      'http://localhost:3000',
      'https://talosave-frontend.azurewebsites.net',
      'https://talotieto.netlify.app'
    ];
    
    // In development, allow any localhost origin
    if (process.env.NODE_ENV !== 'production' && origin.includes('localhost')) {
      return callback(null, true);
    }
    
    if (allowedOrigins.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  methods: 'GET,POST,PUT,DELETE,OPTIONS',
  allowedHeaders: 'Content-Type,Authorization',
  credentials: true
};

app.use(cors(corsOptions));
serveStaticFiles(app);

// Routes
const getRoute = require('./routes/get');
const loginRouter = require('./routes/login');
const putPropertyRoute = require('./routes/putProperty');
const deleteRoute = require('./routes/delete');
const postRoute = require('./routes/post');
const changeOwnerRouter = require('./routes/changeowner');
const postRenovation = require('./routesrenovations/post');
const getRenovation = require('./routesrenovations/get');
const deleteRenovation = require('./routesrenovations/delete');
const putRenovation = require('./routesrenovations/put');
const createUserRouter = require('./routes/users');
const getUserRouter = require('./routes/users');
const putUserRouter = require('./routes/users');
const todoRouter = require('./todoroutes/todocrud');
const getElectricConsumption = require('./consumptionsroutes/getElec');
const postElectricConsumption = require('./consumptionsroutes/postElec');
const getHeatingConsumption = require('./consumptionsroutes/getHeat');
const postHeatingConsumption = require('./consumptionsroutes/postHeat');
const deleteHeatingConsumption = require('./consumptionsroutes/deleteHeat');
const deleteElectricConsumption = require('./consumptionsroutes/deleteElec');
const getWaterConsumption = require('./consumptionsroutes/getWater');
const postWaterConsumption = require('./consumptionsroutes/postWater');
const deleteWaterConsumption = require('./consumptionsroutes/deleteWater');
const postWaterConsumptionYearly = require('./consumptionsroutes/postWaterYearly');
const getWaterConsumptionYearly = require('./consumptionsroutes/getWaterYearly');
const deleteWaterConsumptionYearly = require('./consumptionsroutes/deleteWaterYearly');
const putWaterConsumptionYearly = require('./consumptionsroutes/putWaterYearly');
const getResearch = require('./researchroutes/get');
const deleteResearch = require('./researchroutes/delete');
const uploadRouter = require('./uploads/post');
const nordpoolRouter = require('./routes/nordpool');
const getServices = require('./servicesroutes/get');
const postServices = require('./servicesroutes/post');
const putServices = require('./servicesroutes/put');
const deleteServices = require('./servicesroutes/delete');
const renovationImages = require('./routesrenovations/images');

// Root route
app.get('/', (req, res) => {
    res.send('Hello World');
});

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

// Use routes
app.use('/api/login', loginRouter);
app.use('/api/create', createUserRouter);
app.use('/api/users', getUserRouter);
app.use('/api/put', putUserRouter);
app.use('/api/putProperty', putPropertyRoute);
app.use('/api/changeowner', changeOwnerRouter);
app.use('/api/get', getRoute);
// app.use('/api/put', putRoute);
app.use('/api/delete', deleteRoute);
app.use('/api/post', postRoute);
app.use('/api', postRenovation);
app.use('/api', getRenovation);
app.use('/api', deleteRenovation);
app.use('/api', putRenovation);
app.use('/api/renovations', renovationImages);
app.use('/api', todoRouter);
app.use('/api/electricconsumptions', getElectricConsumption);
app.use('/api/electricconsumptions', postElectricConsumption);
app.use('/api/electricconsumptions', deleteElectricConsumption);
app.use('/api/heatingconsumptions', getHeatingConsumption);
app.use('/api/heatingconsumptions', postHeatingConsumption);
app.use('/api/heatingconsumptions', deleteHeatingConsumption);
app.use('/api/waterconsumptions', getWaterConsumption);
app.use('/api/waterconsumptions', postWaterConsumption);
app.use('/api/waterconsumptions', deleteWaterConsumption);
app.use('/api/waterconsumptions', postWaterConsumptionYearly);
app.use('/api/waterconsumptions', getWaterConsumptionYearly);
app.use('/api/waterconsumptions', deleteWaterConsumptionYearly);
app.use('/api/waterconsumptions', putWaterConsumptionYearly);
app.use('/api', getResearch);
app.use('/api', deleteResearch);
app.use('/api', uploadRouter);
app.use('/api/nordpool', nordpoolRouter);
app.use('/api/services', getServices);
app.use('/api/services', postServices);
app.use('/api/services', putServices);
app.use('/api/services', deleteServices);

// Error handling middleware
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).send('Something broke!');
});

// Start the server
const port = process.env.PORT || 3000;
app.listen(port, () => console.log(`Server is running on port ${port}`));