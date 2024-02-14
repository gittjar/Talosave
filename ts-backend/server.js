const express = require('express');
require('dotenv').config();
const sql = require('mssql');
const app = express();
const cors = require('cors');
const propertiesRouter = require('./routes/properties');
const loginRouter = require('./routes/login');
const createUserRouter = require('./routes/users');

app.use(express.json());
app.use(cors());


const port = process.env.PORT || 3000;

const config = {
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    server: process.env.DB_SERVER,
    database: process.env.DB_NAME,
    options: {
        encrypt: true
    }
};

// Connect to your database.
sql.connect(config).then(pool => {
    console.log('Connected to the database.');

// Create a SQL request for use in our routes.
    app.locals.sqlRequest = new sql.Request(pool);
}).catch(err => console.error('Could not connect to the database. ', err));

// Use our routes.
app.use('/api/properties', propertiesRouter);
app.use('/api/login', loginRouter);
app.use('/api/create', createUserRouter);

app.listen(port, () => console.log(`Server is running on port ${port}`));