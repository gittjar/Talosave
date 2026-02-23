Database
│
├── TS_Properties
│   ├── propertyid (PK)
│   ├── propertyname
│   ├── street_address
│   ├── post_number
│   ├── city
│   ├── land
│   ├── description
│   ├── house_type
│   ├── building_year
│   ├── total_sqm
│   ├── living_sqm
│   ├── room_list
│   ├── floors
│   ├── dataconnection
│   ├── TV_system
│   ├── drain
│   ├── water
│   ├── electricity
│   ├── main_heat_system
│   ├── sauna
│   ├── pipes
│   ├── roof_type
│   ├── ground
│   ├── property_id
│   ├── rasite
│   ├── ranta
│   ├── userid
│   ├── latitude
│   └── longitude
│
├── TS_ElectricityConsumption
│   ├── id (PK)
│   ├── propertyid (FK -> TS_Properties)
│   ├── month
│   ├── year
│   ├── kwh
│   ├── euros
│
├── TS_HeatingConsumption
│   ├── id (PK)
│   ├── propertyid (FK -> TS_Properties)
│   ├── month
│   ├── year
│   ├── kwh
│   ├── euros
│   ├── mwh
│   ├── m3
│   ├── liters
│
├── TS_WaterConsumption
│   ├── id (PK)
│   ├── propertyid (FK -> TS_Properties)
│   ├── month
│   ├── year
│   ├── liters
│   ├── euros
│   ├── m3
│
├── TS_WasteConsumption
│   ├── id (PK)
│   ├── propertyid (FK -> TS_Properties)
│   ├── month
│   ├── year
│   ├── kg
│   ├── euros
│
├── TS_PropertyExpenses
│   ├── id (PK)
│   ├── propertyid (FK -> TS_Properties)
│   ├── month
│   ├── year
│   ├── taxes
│   ├── land_rent
│
├── TS_OtherExpenses
│   ├── id (PK)
│   ├── expensesid (FK -> TS_PropertyExpenses)
│   ├── description
│   ├── amount
│
├── TS_Renovations
│   ├── id (PK)
│   ├── propertyid (FK -> TS_Properties)
│   ├── construction_company
│   ├── renovation
│   ├── date
│   ├── cost
│   ├── userid
│
├── TS_RenovationDetails
│   ├── id (PK)
│   ├── renovationid (FK -> TS_Renovations)
│   ├── detail
│   ├── userid
│
├── TS_RenovationImages
│   ├── id (PK)
│   ├── renovation_id (FK -> TS_Renovations, CASCADE DELETE)
│   ├── image_url (Azure Blob Storage URL or external URL)
│   ├── image_name
│   ├── description (kuvan kuvaus/selite, max 500 merkkiä)
│   ├── upload_date
│   ├── file_size (bytes)
│   ├── sort_order (kuvien järjestys, drag & drop)
│
├── TS_Images
│   ├── id (PK)
│   ├── propertyid (FK -> TS_Properties)
│   ├── image_url
│
├── TS_PropertyImages
│   ├── id (PK)
│   ├── property_id (FK -> TS_Properties, CASCADE DELETE)
│   ├── image_url (Azure Blob Storage URL)
│   ├── image_name
│   ├── description (kuvan kuvaus/selite, max 500 merkkiä)
│   ├── upload_date
│   ├── file_size (bytes)
│   ├── sort_order (kuvien järjestys, drag & drop)
│
├── TS_Tutkimukset
│   ├── id (PK)
│   ├── propertyid (FK -> TS_Properties)
│   ├── kuntotutkimus_company
│   ├── kuntotutkimus
│   ├── extra_information
│   ├── DATE
│   ├── report_url
│
├── TS_Notes
│   ├── id (PK)
│   ├── propertyid (FK -> TS_Properties)
│   ├── note
│
├── TS_Todo
│   ├── id (PK)
│   ├── action
│   ├── isCompleted
│   ├── date
│   ├── cost
│   ├── propertyid (FK -> TS_Properties)
│   ├── userid
│
├── TS_PropertyUsers
│   ├── userid (PK)
│   ├── username
│   ├── fullname
│   ├── password
│   ├── email
│   ├── phone
│   ├── role
│   ├── storageUsed (BIGINT, dokumenttien tallennustila tavuina, 50MB vapaa)
│   ├── propertyImagesUsed (BIGINT, kiinteistökuvien tallennustila tavuina, 20MB vapaa)
│   └── renovationImagesUsed (BIGINT, remonttikuvien tallennustila tavuina, 50MB vapaa)
│
├── TS_UserProperties
│   ├── userid (PK, FK -> TS_PropertyUsers)
│   └── propertyid (PK, FK -> TS_Properties)
│
└── TS_Services
    ├── serviceid (PK)
    ├── propertyid (FK -> TS_Properties)
    ├── userid (FK -> TS_PropertyUsers)
    ├── servicename
    ├── servicetype (Huolto, Korjaus, Tarkastus, Siivous, Puutarha, etc.)
    ├── description
    ├── provider
    ├── contactperson
    ├── phone
    ├── email
    ├── servicedate
    ├── nextservicedate
    ├── isrecurring
    ├── recurringinterval (months)
    ├── cost
    ├── currency (default: EUR)
    ├── status (Suunniteltu, Käynnissä, Valmis, Peruttu)
    ├── priority (Matala, Normaali, Korkea, Kiireellinen)
    ├── notes
    ├── documenturl
    ├── createdat
    └── updatedat

Maintenance Tracking (Huoltokirja)
└── TS_MaintenanceTasks
    ├── id (PK)
    ├── name (tehtävän nimi, esim. "Tarkista vesimittari")
    ├── description (kuvaus, ohjeet)
    ├── recommended_frequency (esim. "Kevät", "Syksy", "Vuosi", "Kuukausi")
└── TS_MaintenanceChecks
    ├── id (PK)
    ├── task_id (FK -> TS_MaintenanceTasks)
    ├── propertyid (FK -> TS_Properties)
    ├── user_id (FK -> TS_PropertyUsers)
    ├── check_date (Date)
    ├── year (Number)
    ├── period (esim. "Q1", "Q2", "Kevät", "Syksy")
    ├── note (vapaa tekstikenttä)

- Huoltokirja tallentaa käyttäjän tekemät huoltotehtävät ja tarkastukset.
- Tehtävät voidaan esittää checkbox-listana, ja käyttäjä voi merkitä ne tehdyksi.
- Ylläpito voi lisätä uusia tehtäviä ja suositeltuja aikavälejä.
- Käyttäjä voi lisätä huomioita ja tarkastuspäivän.