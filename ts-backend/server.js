const express = require('express');
const path = require('path');
const formidable = require('formidable');
const crypto = require('crypto');
const fs = require('fs');
//const upload = multer({ dest: 'uploads/' });
const { File } = require('./mongo');
require('dotenv').config();
const sql = require('mssql');
const app = express();
const cors = require('cors');
const serveStaticFiles = require('./middleware/staticFiles');
serveStaticFiles(app);

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




app.post('/upload', (req, res) => {
  const form = new formidable.IncomingForm();
  form.parse(req, (err, fields, files) => {
    console.log('Received fields:', fields);
    if (err) {
      console.error('Upload error:', err);
      return res.status(500).send(err);
    }

    let propertyId = fields.propertyId;
    if (Array.isArray(propertyId)) {
      propertyId = Number(propertyId[0]);
    }

    const file = files.file[0];
    const filename = new Date().toISOString() + path.extname(file.originalFilename);
    console.log('File:', file);
    const newFile = new File({
      name: file.name,
      size: file.size,
      path: '/uploads/' + filename, // save the path to the file
      propertyId: propertyId, // save the propertyId with the file
      // other file metadata...
    });

    // Move the file to the uploads directory
    const oldPath = file.filepath;
    const newPath = path.join(__dirname, '/uploads/' + filename);
    fs.rename(oldPath, newPath, function(err) {
      // handle error
    });

    newFile.save()
      .then(() => {
        console.log('Saved file:', newFile);
        res.send(newFile);
      })
      .catch(err => {
        console.error('Save error:', err);
        res.status(500).send(err);
      });
  });
});

  

app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).send('Something broke!');
});

app.get('/download/:filename', (req, res) => {
    const filename = req.params.filename;
    const file = `${__dirname}/uploads/${filename}`;

    res.sendFile(file); // Send the file to be opened in the browser.
});


app.listen(port, () => console.log(`Server is running on port ${port}`));