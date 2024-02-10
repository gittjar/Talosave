CREATE TABLE TS_Properties (
    propertyid INT PRIMARY KEY,
    propertyname NVARCHAR(255),
    street_address NVARCHAR(255),
    post_number NVARCHAR(255),
    city NVARCHAR(255),
    land NVARCHAR(255),
    house_type NVARCHAR(255),
    building_year INT,
    total_sqm FLOAT,
    living_sqm FLOAT,
    room_list NVARCHAR(255),
    floors INT,
    dataconnection NVARCHAR(255),
    TV_system NVARCHAR(255),
    drain NVARCHAR(255),
    water NVARCHAR(255),
    electricity NVARCHAR(255),
    main_heat_system NVARCHAR(255),
    sauna NVARCHAR(255),
    pipes INT,
    roof_type NVARCHAR(255),
    ground NVARCHAR(255),
    property_id NVARCHAR(255),
    rasite NVARCHAR(255),
    ranta NVARCHAR(255),
    userid INT,
    latitude FLOAT,
    longitude FLOAT
);

CREATE TABLE TS_ElectricityConsumption (
    id INT PRIMARY KEY,
    propertyid INT,
    month INT,
    year INT,
    kwh FLOAT,
    euros FLOAT,
    FOREIGN KEY (propertyid) REFERENCES TS_Properties(propertyid)
);

CREATE TABLE TS_HeatingConsumption (
    id INT PRIMARY KEY,
    propertyid INT,
    month INT,
    year INT,
    kwh FLOAT,
    euros FLOAT,
    FOREIGN KEY (propertyid) REFERENCES TS_Properties(propertyid)
);

CREATE TABLE TS_WaterConsumption (
    id INT PRIMARY KEY,
    propertyid INT,
    month INT,
    year INT,
    liters FLOAT,
    euros FLOAT,
    FOREIGN KEY (propertyid) REFERENCES TS_Properties(propertyid)
);

CREATE TABLE TS_WasteConsumption (
    id INT PRIMARY KEY,
    propertyid INT,
    month INT,
    year INT,
    kg FLOAT,
    euros FLOAT,
    FOREIGN KEY (propertyid) REFERENCES TS_Properties(propertyid)
);

CREATE TABLE TS_PropertyExpenses (
    id INT PRIMARY KEY,
    propertyid INT,
    month INT,
    year INT,
    taxes FLOAT,
    land_rent FLOAT,
    FOREIGN KEY (propertyid) REFERENCES TS_Properties(propertyid)
);

CREATE TABLE TS_OtherExpenses (
    id INT PRIMARY KEY,
    expensesid INT,
    description NVARCHAR(255),
    amount FLOAT,
    FOREIGN KEY (expensesid) REFERENCES TS_PropertyExpenses(id)
);

CREATE TABLE TS_Renovations (
    id INT PRIMARY KEY,
    propertyid INT,
    construction_company NVARCHAR(255),
    renovation NVARCHAR(255),
    date DATE,
    FOREIGN KEY (propertyid) REFERENCES TS_Properties(propertyid)
);

CREATE TABLE TS_RenovationDetails (
    id INT PRIMARY KEY,
    renovationid INT,
    detail NVARCHAR(255),
    FOREIGN KEY (renovationid) REFERENCES TS_Renovations(id)
);

CREATE TABLE TS_Images (
    id INT PRIMARY KEY,
    propertyid INT,
    image_url NVARCHAR(255),
    FOREIGN KEY (propertyid) REFERENCES TS_Properties(propertyid)
);

CREATE TABLE TS_Tutkimukset (
    id INT PRIMARY KEY,
    propertyid INT,
    kuntotutkimus_company NVARCHAR(255),
    kuntotutkimus NVARCHAR(255),
    extra_information NVARCHAR(255),
    DATE DATE,
    report_url NVARCHAR(255),
    FOREIGN KEY (propertyid) REFERENCES TS_Properties(propertyid)
);

CREATE TABLE TS_Notes (
    id INT PRIMARY KEY,
    propertyid INT,
    note NVARCHAR(MAX),
    FOREIGN KEY (propertyid) REFERENCES TS_Properties(propertyid)
);

CREATE TABLE TS_PropertyUsers (
    userid INT PRIMARY KEY,
    username NVARCHAR(255),
    password NVARCHAR(255),
    email NVARCHAR(255),
    phone NVARCHAR(255),
    role NVARCHAR(255)
);

CREATE TABLE TS_UserProperties (
    userid INT,
    propertyid INT,
    PRIMARY KEY (userid, propertyid),
    FOREIGN KEY (userid) REFERENCES TS_PropertyUsers(userid),
    FOREIGN KEY (propertyid) REFERENCES TS_Properties(propertyid)
);

