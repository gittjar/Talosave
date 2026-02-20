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

MongoDB Collections
│
├── Files (Document Storage)
│   ├── _id (ObjectId, PK)
│   ├── name (dokumentin nimi)
│   ├── description (kuvaus)
│   ├── propertyId (Number, viittaus TS_Properties)
│   ├── folderId (ObjectId, viittaus Folder, null = juuressa)
│   ├── url (Azure Blob URL tai linkki)
│   ├── blobName (Azure Blob nimi poistoa varten)
│   ├── fileType ('link' tai 'upload')
│   ├── sortOrder (järjestys drag & drop)
│   ├── uploadedAt (Date)
│   ├── fileSize (bytes, käytetään kiintiölaskennassa)
│   └── userId (Number, viittaus TS_PropertyUsers, tiedoston lataaja)
│
└── Folders (Document Organization)
    ├── _id (ObjectId, PK)
    ├── name (kansion nimi, max 50 merkkiä, ei erikoismerkkejä)
    ├── propertyId (Number, viittaus TS_Properties)
    ├── parentFolderId (ObjectId, viittaus Folder, null = juuressa)
    ├── sortOrder (järjestys drag & drop)
    └── createdAt (Date)

Storage Quota
- Free tier total: 120 MB per user
  - Documents: 50 MB (tracked in TS_PropertyUsers.storageUsed)
  - Property Images: 20 MB (tracked in TS_PropertyUsers.propertyImagesUsed)
  - Renovation Images: 50 MB (tracked in TS_PropertyUsers.renovationImagesUsed)
- Quota check on file upload via /api/storage-quota endpoint (returns all three quotas)
- Usage updated automatically on upload/delete operations for each type
- Frontend displays total usage bar + breakdown by category with color coding
- Warning when total or individual quota approaching limit