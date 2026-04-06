/**
 * Central route configuration
 * All route imports and mounting logic in one place
 */

// Property routes
const getRoute = require('./get');
const loginRouter = require('./login');
const putPropertyRoute = require('./putProperty');
const deleteRoute = require('./delete');
const postRoute = require('./post');
const changeOwnerRouter = require('./changeowner');
const nordpoolRouter = require('./nordpool');

// User routes
const createUserRouter = require('./users');
const getUserRouter = require('./users');
const putUserRouter = require('./users');

// Renovation routes
const postRenovation = require('../routesrenovations/post');
const getRenovation = require('../routesrenovations/get');
const deleteRenovation = require('../routesrenovations/delete');
const putRenovation = require('../routesrenovations/put');
const renovationImages = require('../routesrenovations/images');
const propertyImages = require('./propertyImages');

// Consumption routes
const getElectricConsumption = require('../consumptionsroutes/getElec');
const postElectricConsumption = require('../consumptionsroutes/postElec');
const deleteElectricConsumption = require('../consumptionsroutes/deleteElec');
const getHeatingConsumption = require('../consumptionsroutes/getHeat');
const postHeatingConsumption = require('../consumptionsroutes/postHeat');
const deleteHeatingConsumption = require('../consumptionsroutes/deleteHeat');
const getWaterConsumption = require('../consumptionsroutes/getWater');
const postWaterConsumption = require('../consumptionsroutes/postWater');
const deleteWaterConsumption = require('../consumptionsroutes/deleteWater');
const postWaterConsumptionYearly = require('../consumptionsroutes/postWaterYearly');
const getWaterConsumptionYearly = require('../consumptionsroutes/getWaterYearly');
const deleteWaterConsumptionYearly = require('../consumptionsroutes/deleteWaterYearly');
const putWaterConsumptionYearly = require('../consumptionsroutes/putWaterYearly');

// Document/Research routes
const getResearch = require('../researchroutes/get');
const deleteResearch = require('../researchroutes/delete');
const uploadFileRouter = require('../researchroutes/uploadfile');
const foldersRouter = require('../researchroutes/folders');

// Upload routes
const uploadRouter = require('../uploads/post');

// Todo routes
const todoRouter = require('../todoroutes/todocrud');


// Maintenance routes
const maintenanceRouter = require('./maintenance');
const maintenanceCalendarRouter = require('./maintenancecalendar');


/**
 * Mount all routes to the Express app
 * @param {Express} app - Express application instance
 */
function setupRoutes(app) {
    // Root route
    app.get('/', (req, res) => {
        res.send('Hello World');
    });

    // Authentication & User routes
    app.use('/api/login', loginRouter);
    app.use('/api/create', createUserRouter);
    app.use('/api/users', getUserRouter);
    app.use('/api/put', putUserRouter);

    // Property routes
    app.use('/api/get', getRoute);
    app.use('/api/post', postRoute);
    app.use('/api/delete', deleteRoute);
    app.use('/api/putProperty', putPropertyRoute);
    app.use('/api/changeowner', changeOwnerRouter);

    // Renovation routes
    app.use('/api', postRenovation);
    app.use('/api', getRenovation);
    app.use('/api', deleteRenovation);
    app.use('/api', putRenovation);
    app.use('/api/renovations', renovationImages);

    // Property images routes
    app.use('/api/properties', propertyImages);

    // Todo routes
    app.use('/api', todoRouter);

    // Consumption routes - Electric
    app.use('/api/electricconsumptions', getElectricConsumption);
    app.use('/api/electricconsumptions', postElectricConsumption);
    app.use('/api/electricconsumptions', deleteElectricConsumption);

    // Consumption routes - Heating
    app.use('/api/heatingconsumptions', getHeatingConsumption);
    app.use('/api/heatingconsumptions', postHeatingConsumption);
    app.use('/api/heatingconsumptions', deleteHeatingConsumption);

    // Consumption routes - Water
    app.use('/api/waterconsumptions', getWaterConsumption);
    app.use('/api/waterconsumptions', postWaterConsumption);
    app.use('/api/waterconsumptions', deleteWaterConsumption);
    app.use('/api/waterconsumptions', postWaterConsumptionYearly);
    app.use('/api/waterconsumptions', getWaterConsumptionYearly);
    app.use('/api/waterconsumptions', deleteWaterConsumptionYearly);
    app.use('/api/waterconsumptions', putWaterConsumptionYearly);

    // Document/Research routes
    app.use('/api', getResearch);
    app.use('/api', deleteResearch);
    app.use('/api', uploadFileRouter);
    app.use('/api', uploadRouter);
    app.use('/api/folders', foldersRouter);

    // External API routes
    app.use('/api/nordpool', nordpoolRouter);


    // Maintenance routes
    app.use('/api/maintenance', maintenanceRouter);
    app.use('/api/maintenancecalendar', maintenanceCalendarRouter);
}

module.exports = setupRoutes;
