const express = require('express');
require('dotenv').config();
const sql = require('mssql');
const app = express();
const cors = require('cors');
const getRoute = require('./routes/get');
const loginRouter = require('./routes/login');
const putRoute = require('./routes/put');
const deleteRoute = require('./routes/delete');
const postRoute = require('./routes/post');

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
app.use('/api/login', loginRouter);
app.use('/api/create', createUserRouter);
app.use('/api/get', getRoute);
app.use('/api/put', putRoute);
app.use('/api/delete', deleteRoute);
app.use('/api/post', postRoute);



app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).send('Something broke!');
  });

app.listen(port, () => console.log(`Server is running on port ${port}`));