const express = require('express');
const multer = require('multer');
const upload = multer();
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
const todoRouter = require('./todoroutes/todocrud');

// consumption
const getElectricConsumption = require('./consumptionsroutes/getElec');
const postElectricConsumption = require('./consumptionsroutes/postElec');
const getHeatingConsumption = require('./consumptionsroutes/getHeat');
const postHeatingConsumption = require('./consumptionsroutes/postHeat');
const deleteHeatingConsumption = require('./consumptionsroutes/deleteHeat');

// research
const getResearch = require('./researchroutes/get');
const deleteResearch = require('./researchroutes/delete');

// uoload links
const uploadRouter = require('./uploads/post');

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

sql.connect(config).then(pool => {
    console.log('Connected to the SQL database!');
    app.locals.sqlRequest = new sql.Request(pool);
}).catch(err => console.error('Could not connect to the database. ', err));

app.use('/api/login', loginRouter);
app.use('/api/create', createUserRouter);
app.use('/api/get', getRoute);
app.use('/api/put', putRoute);
app.use('/api/delete', deleteRoute);
app.use('/api/post', postRoute);

app.use('/api', postRenovation);
app.use('/api', getRenovation);
app.use('/api', deleteRenovation);
app.use('/api', putRenovation);

app.use('/api', todoRouter);

app.use('/api/electricconsumptions', getElectricConsumption);
app.use('/api/electricconsumptions', postElectricConsumption);
app.use('/api/heatingconsumptions', getHeatingConsumption);
app.use('/api/heatingconsumptions', postHeatingConsumption);
app.use('/api/heatingconsumptions', deleteHeatingConsumption);

app.use('/api', getResearch);
app.use('/api', deleteResearch);

app.use('/api', uploadRouter);

/*
app.post('/upload', upload.none(), async (req, res) => {
  try {
      // Save the file information in the database
      const newFile = new File({
          name: req.body.name,
          propertyId: req.body.propertyId,
          url: req.body.url,
      });

      newFile.save()
          .then(() => res.json(newFile))
          .catch(err => res.status(500).json({ error: err.message }));
  } catch (err) {
      res.status(500).json({ error: err.message });
  }
});

app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).send('Something broke!');
});
*/
app.listen(port, () => console.log(`Server is running on port ${port}`));