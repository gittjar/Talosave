const express = require('express');
const multer = require('multer');
//const upload = multer({ dest: 'uploads/' });
const { File } = require('./mongo');
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

// renovations
const postRenovation = require('./routesrenovations/post');
const getRenovation = require('./routesrenovations/get');
const deleteRenovation = require('./routesrenovations/delete');
const putRenovation = require('./routesrenovations/put');

// users
const createUserRouter = require('./routes/users');

// todo
const todoRouter = require('./todoroutes/rodocrud');

// consumption
const getElectricConsumption = require('./consumptionsroutes/getElec');
const postElectricConsumption = require('./consumptionsroutes/postElec');

// research
const getResearch = require('./researchroutes/get');

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
    console.log('Connected to the SQL database!');

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
app.use('/api/electricconsumptions', postElectricConsumption);

// research
app.use('/api', getResearch);

// File upload route
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
      cb(null, 'uploads/')
    },
    filename: function (req, file, cb) {
      cb(null, Date.now() + '-' + file.originalname)
    }
  })

    const upload = multer({ storage: storage });

  
    app.post('/upload', upload.single('file'), (req, res) => {
        const newFile = new File({
          name: req.file.originalname,
          size: req.file.size,
          path: '/uploads/' + req.file.filename, // save the path to the file
          propertyId: req.body.propertyId, // save the propertyId with the file
          // other file metadata...
        });
      
        newFile.save()
          .then(() => res.send('File uploaded and data saved to MongoDB'))
          .catch(err => {
            console.error(err);
            res.status(500).send('Error saving file to MongoDB');
          });
      });

app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).send('Something broke!');
});

app.use(express.static('uploads')); // add this line to serve static files

app.listen(port, () => console.log(`Server is running on port ${port}`));