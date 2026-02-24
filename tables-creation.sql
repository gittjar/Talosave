-- Jos päivität olemassa olevaa tietokantaa, lisää seuraava:
-- ALTER TABLE TS_MaintenanceEntry ADD is_recurring BIT DEFAULT 0, recurring_months NVARCHAR(50), year INT;
CREATE TABLE TS_Properties (
    propertyid INT IDENTITY(1,1) PRIMARY KEY,
    propertyname NVARCHAR(255),
    street_address NVARCHAR(255),
    post_number NVARCHAR(255),
    city NVARCHAR(255),
    land NVARCHAR(255),
    description NVARCHAR(255),
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
    id INT IDENTITY(1,1) PRIMARY KEY,
    propertyid INT,
    month INT,
    year INT,
    kwh FLOAT,
    euros FLOAT,
    FOREIGN KEY (propertyid) REFERENCES TS_Properties(propertyid)
);

CREATE TABLE TS_HeatingConsumption (
    id INT IDENTITY(1,1) PRIMARY KEY,
    propertyid INT,
    month INT,
    year INT,
    kwh FLOAT,
    euros FLOAT,
    mwh FLOAT,
    m3 FLOAT,
    liters FLOAT,
    FOREIGN KEY (propertyid) REFERENCES TS_Properties(propertyid)
);

CREATE TABLE TS_WaterConsumption (
    id INT IDENTITY(1,1) PRIMARY KEY,
    propertyid INT,
    month INT,
    year INT,
    liters FLOAT,
    euros FLOAT,
    m3 FLOAT,
    FOREIGN KEY (propertyid) REFERENCES TS_Properties(propertyid)
);

CREATE TABLE TS_WasteConsumption (
    id INT IDENTITY(1,1) PRIMARY KEY,
    propertyid INT,
    month INT,
    year INT,
    kg FLOAT,
    euros FLOAT,
    FOREIGN KEY (propertyid) REFERENCES TS_Properties(propertyid)
);

CREATE TABLE TS_PropertyExpenses (
    id INT IDENTITY(1,1) PRIMARY KEY,
    propertyid INT,
    month INT,
    year INT,
    taxes FLOAT,
    land_rent FLOAT,
    FOREIGN KEY (propertyid) REFERENCES TS_Properties(propertyid)
);

CREATE TABLE TS_OtherExpenses (
    id INT IDENTITY(1,1) PRIMARY KEY,
    expensesid INT,
    description NVARCHAR(255),
    amount FLOAT,
    FOREIGN KEY (expensesid) REFERENCES TS_PropertyExpenses(id)
);

CREATE TABLE TS_Renovations (
    id INT IDENTITY(1,1) PRIMARY KEY,
    propertyid INT,
    construction_company NVARCHAR(255),
    renovation NVARCHAR(255),
    date DATE,
    cost FLOAT,
    userid INT,
    FOREIGN KEY (propertyid) REFERENCES TS_Properties(propertyid)
);

CREATE TABLE TS_RenovationDetails (
    id INT IDENTITY(1,1) PRIMARY KEY,
    renovationid INT,
    detail NVARCHAR(255),
    userid INT,
    FOREIGN KEY (renovationid) REFERENCES TS_Renovations(id)
);

CREATE TABLE TS_Images (
    id INT IDENTITY(1,1) PRIMARY KEY,
    propertyid INT,
    image_url NVARCHAR(255),
    FOREIGN KEY (propertyid) REFERENCES TS_Properties(propertyid)
);

CREATE TABLE TS_Tutkimukset (
    id INT IDENTITY(1,1) PRIMARY KEY,
    propertyid INT,
    kuntotutkimus_company NVARCHAR(255),
    kuntotutkimus NVARCHAR(255),
    extra_information NVARCHAR(255),
    DATE DATE,
    report_url NVARCHAR(255),
    FOREIGN KEY (propertyid) REFERENCES TS_Properties(propertyid)
);

CREATE TABLE TS_Notes (
    id INT IDENTITY(1,1) PRIMARY KEY,
    propertyid INT,
    note NVARCHAR(MAX),
    FOREIGN KEY (propertyid) REFERENCES TS_Properties(propertyid)
);

CREATE TABLE TS_Todo (
    id INT IDENTITY(1,1) PRIMARY KEY,
    action NVARCHAR(255),
    isCompleted BIT,
    date DATE,
    cost DECIMAL(10, 2),
    propertyid INT,
    userid INT,
    FOREIGN KEY (propertyid) REFERENCES TS_Properties(propertyid)
);

CREATE TABLE TS_PropertyUsers (
    userid INT IDENTITY(1,1) PRIMARY KEY,
    username NVARCHAR(255),
    fullname NVARCHAR(255),
    password NVARCHAR(255),
    email NVARCHAR(255),
    phone NVARCHAR(255),
    role NVARCHAR(255),
    storageUsed BIGINT NOT NULL DEFAULT 0,  -- Documents storage in bytes (50MB free tier)
    propertyImagesUsed BIGINT NOT NULL DEFAULT 0,  -- Property images storage in bytes (20MB free tier)
    renovationImagesUsed BIGINT NOT NULL DEFAULT 0  -- Renovation images storage in bytes (50MB free tier)
);

CREATE TABLE TS_UserProperties (
    userid INT,
    propertyid INT,
    PRIMARY KEY (userid, propertyid),
    FOREIGN KEY (userid) REFERENCES TS_PropertyUsers(userid),
    FOREIGN KEY (propertyid) REFERENCES TS_Properties(propertyid)
);

CREATE TABLE TS_Services (
    serviceid INT PRIMARY KEY IDENTITY(1,1),
    propertyid INT NOT NULL,
    userid INT NOT NULL,
    
    -- Service details
    servicename NVARCHAR(200) NOT NULL,
    servicetype NVARCHAR(100),  -- 'Huolto', 'Korjaus', 'Tarkastus', 'Siivous', 'Puutarha', etc.
    description NVARCHAR(MAX),
    
    -- Service provider
    provider NVARCHAR(200),
    contactperson NVARCHAR(100),
    phone NVARCHAR(50),
    email NVARCHAR(100),
    
    -- Dates and scheduling
    servicedate DATE,
    nextservicedate DATE,
    isrecurring BIT DEFAULT 0,
    recurringinterval INT,  -- months
    
    -- Cost
    cost DECIMAL(10, 2),
    currency NVARCHAR(10) DEFAULT 'EUR',
    
    -- Status
    status NVARCHAR(50) DEFAULT 'Suunniteltu',  -- 'Suunniteltu', 'Käynnissä', 'Valmis', 'Peruttu'
    priority NVARCHAR(20),  -- 'Matala', 'Normaali', 'Korkea', 'Kiireellinen'
    
    -- Documentation
    notes NVARCHAR(MAX),
    documenturl NVARCHAR(500),
    
    -- Timestamps
    createdat DATETIME DEFAULT GETDATE(),
    updatedat DATETIME DEFAULT GETDATE(),
    
    -- Foreign keys
    FOREIGN KEY (propertyid) REFERENCES TS_Properties(propertyid),
    FOREIGN KEY (userid) REFERENCES TS_PropertyUsers(userid)
      
);

CREATE TABLE TS_RenovationImages (
    id INT PRIMARY KEY IDENTITY(1,1),
    renovation_id INT NOT NULL,
    image_url NVARCHAR(500) NOT NULL,
    image_name NVARCHAR(255),
    description NVARCHAR(500),
    upload_date DATETIME DEFAULT GETDATE(),
    file_size INT,
    sort_order INT DEFAULT 0,
    FOREIGN KEY (renovation_id) REFERENCES TS_Renovations(id) ON DELETE CASCADE
);
-- ALTER TABLE TS_RenovationImages ADD sort_order INT DEFAULT 0;

CREATE TABLE TS_PropertyImages (
    id INT PRIMARY KEY IDENTITY(1,1),
    property_id INT NOT NULL,
    image_url NVARCHAR(500) NOT NULL,
    image_name NVARCHAR(255),
    description NVARCHAR(500),
    upload_date DATETIME DEFAULT GETDATE(),
    file_size INT,
    sort_order INT DEFAULT 0,
    FOREIGN KEY (property_id) REFERENCES TS_Properties(propertyid) ON DELETE CASCADE
);

-- Maintenance tracking tables for Huoltokirja
CREATE TABLE TS_MaintenanceTasks (
    id INT IDENTITY(1,1) PRIMARY KEY,
    name NVARCHAR(100) NOT NULL,
    description NVARCHAR(255),
    recommended_frequency NVARCHAR(50) -- e.g. 'Kevät', 'Syksy', 'Q1', 'Q2', 'Q3', 'Q4', 'Vuosi', 'Kuukausi'
);

CREATE TABLE TS_MaintenanceChecks (
    id INT IDENTITY(1,1) PRIMARY KEY,
    task_id INT NOT NULL,
    propertyid INT NOT NULL,
    user_id INT NOT NULL,
    check_date DATE NOT NULL,
    year INT NOT NULL,
    period NVARCHAR(20), -- esim. 'Q1', 'Q2', 'Q3', 'Q4', 'Kevät', 'Syksy', 'Tammikuu'
    note NVARCHAR(255),
    FOREIGN KEY (task_id) REFERENCES TS_MaintenanceTasks(id),
    FOREIGN KEY (propertyid) REFERENCES TS_Properties(propertyid)
);

-- Unified Huoltokirja tables
CREATE TABLE TS_PropertyMaintenanceBook (
    id INT IDENTITY(1,1) PRIMARY KEY,
    propertyid INT NOT NULL,
    name NVARCHAR(100) NOT NULL,
    created_at DATETIME DEFAULT GETDATE(),
    FOREIGN KEY (propertyid) REFERENCES TS_Properties(propertyid)
);

CREATE TABLE TS_MaintenanceEntry (
    id INT IDENTITY(1,1) PRIMARY KEY,
    maintenancebook_id INT NOT NULL,
    task_name NVARCHAR(100) NOT NULL,
    description NVARCHAR(255),
    recommended_frequency NVARCHAR(50),
    done BIT DEFAULT 0,
    done_date DATE,
    note NVARCHAR(255),
    user_id INT,
    created_at DATETIME DEFAULT GETDATE(),
    -- Recurring/periodic fields
    is_recurring BIT DEFAULT 0, -- 1 = toistuva vuosittain
    recurring_months NVARCHAR(50), -- esim. '1,2,3,4,5,6,7,8,9,10,11,12' (valitut kuukaudet)
    year INT -- mille vuodelle tehtävä kuuluu
    FOREIGN KEY (maintenancebook_id) REFERENCES TS_PropertyMaintenanceBook(id),
    FOREIGN KEY (user_id) REFERENCES TS_PropertyUsers(userid)
);

CREATE TABLE TS_MaintenanceMonthDone (
    id INT IDENTITY(1,1) PRIMARY KEY,
    maintenanceentry_id INT NOT NULL, -- FK to TS_MaintenanceEntry
    year INT NOT NULL,
    month INT NOT NULL, -- 1-12
    done BIT DEFAULT 0,
    done_date DATE,
    user_id INT,
    note NVARCHAR(255),
    created_at DATETIME DEFAULT GETDATE(),
    FOREIGN KEY (maintenanceentry_id) REFERENCES TS_MaintenanceEntry(id)
);