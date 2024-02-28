Database
│
├── TS_Properties
│   ├── propertyid (PK)
│   ├── propertyname
│   ├── street_address
│   ├── post_number
│   ├── city
│   ├── land
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
│   ├── longitude
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
│
├── TS_WaterConsumption
│   ├── id (PK)
│   ├── propertyid (FK -> TS_Properties)
│   ├── month
│   ├── year
│   ├── liters
│   ├── euros
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
├── TS_Images
│   ├── id (PK)
│   ├── propertyid (FK -> TS_Properties)
│   ├── image_url
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
│
└── TS_UserProperties
    ├── userid (PK, FK -> TS_PropertyUsers)
    ├── propertyid (PK, FK -> TS_Properties)