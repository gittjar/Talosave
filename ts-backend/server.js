const express = require('express');
require('dotenv').config();
const sql = require('mssql');
const app = express();
const cors = require('cors');
// routes
const getRoute = require('./routes/get');
const loginRouter = require('./routes/login');
const putRoute = require('./routes/put');
const deleteRoute = require('./routes/delete');
const postRoute = require('./routes/post');
// renervations
const postRenovation = require('./routesrenovations/post');
const getRenovation = require('./routesrenovations/get');
const deleteRenovation = require('./routesrenovations/delete');
const putRenovation = require('./routesrenovations/put');
// users
const createUserRouter = require('./routes/users');
// todo
const todoRouter = require('./todoroutes/rodocrud');
// consumption
const getElectricConsumption = require('./consumptionsroutes/get');

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
app.use('/api/login', loginRouter);
app.use('/api/create', createUserRouter);
app.use('/api/get', getRoute);
app.use('/api/put', putRoute);
app.use('/api/delete', deleteRoute);
app.use('/api/post', postRoute);

// renovations
app.use('/api', postRenovation);
app.use('/api', getRenovation);
app.use('/api', deleteRenovation);
app.use('/api', putRenovation);
// todo
app.use('/api', todoRouter);
// consumption
app.use('/api/electricconsumptions', getElectricConsumption);



app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).send('Something broke!');
  });

app.listen(port, () => console.log(`Server is running on port ${port}`));