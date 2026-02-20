# Tietokantayhteydet ja tiedostojen tallennus

## Käytössä olevat tietokannat ja tallennusratkaisut

Sovellus käyttää kolmea erillistä tallennusratkaisua eri tarkoituksiin:

### 1. **Azure SQL Server** (Pääasiallinen tietokanta)
- **Käyttötarkoitus**: Kaikki päätiedot (properties, renovations, consumptions, users, todos)
- **Yhteys**: `mssql`-kirjaston kautta
- **Konfiguraatio**: 
  ```
  SQL_SERVER=<server-osoite>
  SQL_DATABASE=yourdatabasenameDB
  SQL_USER=<käyttäjätunnus>
  SQL_PASSWORD=<salasana>
  ```
- **Tiedostot**: Kaikki `routes/`, `routesrenovations/`, `consumptionsroutes/` käyttävät SQL:ää

### 2. **MongoDB Atlas** (Dokumenttien metatiedot)
- **Käyttötarkoitus**: Ladattujen dokumenttien metatietojen tallennus
- **Yhteys**: `mongoose`-kirjaston kautta
- **Konfiguraatio**: 
  ```
  MONGODB_URI=mongodb+srv://<käyttäjä>:<salasana>@<cluster>.mongodb.net/<tietokanta>
  ```
- **Tallennetut tiedot**:
  - `name`: Dokumentin nimi (esim. "Energiatodistus")
  - `propertyId`: Mihin kiinteistöön dokumentti liittyy
  - `url`: Azure Blob Storage URL (mistä tiedosto avataan)
  - `blobName`: Blobin nimi Azuressa (tarvitaan poistoa varten)
  - `fileType`: "upload" (eroaa linkki-tyyppisistä, joita ei enää käytetä)
  - `uploadedAt`: Aikaleima
- **Tiedostot**: `researchroutes/`-kansion endpointit

### 3. **Azure Blob Storage** (Varsinaiset tiedostot)
- **Käyttötarkoitus**: Varsinaisten tiedostojen (PDF, Word, Excel, kuvat) tallennus
- **Yhteys**: `@azure/storage-blob`-kirjaston kautta
- **Konfiguraatio**: 
  ```
  AZURE_STORAGE_CONNECTION_STRING=DefaultEndpointsProtocol=https;AccountName=...
  ```
- **Säiliöt (Containers)**:
  - `property-documents`: Dokumentit (PDF, Word, Excel jne.)
  - `renovation-images`: Remontointikuvat

---

## Miksi MongoDB dokumenteille?

**Perustelu**: Vaihtoehtoinen lähestymistapa kuvia varten

### Kuvia varten (olemassa oleva järjestelmä):
- Kuvatiedot tallennetaan **Azure SQL** -tauluun (`renovation_images`)
- Kuvat itse tallennetaan **Azure Blob Storage**:een (`renovation-images` container)
- SQL:ssä on taulussa kentät:
  - `image_id`, `renovation_id`, `image_url`, `uploaded_at`

### Dokumentteja varten (uusi järjestelmä):
- Dokumenttien metatiedot tallennetaan **MongoDB**:hen
- Dokumentit itse tallennetaan **Azure Blob Storage**:een (`property-documents` container)
- MongoDB:ssa on kentät:
  - `_id`, `name`, `propertyId`, `url`, `blobName`, `fileType`, `uploadedAt`

**Syyt MongoDB:n valintaan dokumenteille:**
1. **Joustavuus**: Schemaless-rakenne mahdollistaa helpomman metatietojen laajentamisen tulevaisuudessa
2. **Skaalautuvuus**: MongoDB on optimoitu dokumenttipohjaisille rakenteille
3. **Keveys**: Ei vaadi SQL-taulun luontia tai migraatioita
4. **Erillisyys**: Pitää dokumenttien hallinnan erillään päätietokannasta

**Vaihtoehtoinen lähestymistapa (ei toteutettu):**
Voitaisiin käyttää myös Azure SQL:ää dokumenteille luomalla uusi taulu:
```sql
CREATE TABLE property_documents (
    document_id INT IDENTITY(1,1) PRIMARY KEY,
    name NVARCHAR(255),
    property_id INT,
    document_url NVARCHAR(500),
    blob_name NVARCHAR(255),
    file_type NVARCHAR(50),
    uploaded_at DATETIME DEFAULT GETDATE(),
    FOREIGN KEY (property_id) REFERENCES properties(propertyid)
);
```

---

## Tiedostojen lataus ja hallinta

### 1. **Dokumenttien lataus** (`/api/upload-file`)
**Tiedosto**: `researchroutes/uploadfile.js`

**Prosessi:**
1. Käyttäjä valitsee tiedoston frontendissä
2. Backend vastaanottaa tiedoston (Multer, max 10MB)
3. **Azure Blob Storage**: Tiedosto ladataan `property-documents`-säiliöön
   - Blob-nimi: `{propertyId}/{timestamp}-{nimi}.{ext}`
   - Esim: `9/1739294750123-Energiatodistus.pdf`
4. **MongoDB**: Metatiedot tallennetaan
   - Sisältää Azure Blob URL:n ja muut tiedot
5. Frontend hakee listan MongoDB:sta ja näyttää käyttäjälle

### 2. **Dokumenttien hakeminen** (`/api/files`)
**Tiedosto**: `researchroutes/get.js`

**Prosessi:**
1. Frontend pyytää dokumentit tietylle kiinteistölle
2. Backend hakee MongoDB:sta kaikki dokumentit joissa `propertyId` täsmää
3. Palautetaan lista dokumenteista (sisältää Azure Blob URL:t)
4. Frontend näyttää dokumentit korttina ja linkittää Azure Blob URL:iin

### 3. **Dokumenttien poisto** (`/api/files/:id`)
**Tiedosto**: `researchroutes/delete.js`

**Prosessi:**
1. Frontend lähettää poistopyynnön dokumentin ID:llä
2. Backend hakee dokumentin MongoDB:sta
3. **Azure Blob Storage**: Poistetaan tiedosto blobista (`blobName`)
4. **MongoDB**: Poistetaan metatiedot
5. Jos Azure-poisto epäonnistuu, MongoDB-tieto poistetaan silti (graceful fallback)

---

## Ympäristömuuttujat (.env)

Tarvittavat muuttujat backend-sovellukselle:

```env
# Azure SQL Server (pääasiallinen tietokanta)
SQL_SERVER=your-server.database.windows.net
SQL_DATABASE=yourdatabasenameDB
SQL_USER=your-username
SQL_PASSWORD=your-password

# MongoDB Atlas (dokumenttien metatiedot)
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/database

# Azure Blob Storage (tiedostot)
AZURE_STORAGE_CONNECTION_STRING=DefaultEndpointsProtocol=https;AccountName=...

# JWT ja muut
SECRET=your-jwt-secret-key
PORT=3000
```

---

## Tiedostorakenne

### Dokumenttihallinta (MongoDB + Azure Blob)
```
researchroutes/
├── uploadfile.js    # POST /api/upload-file - Lataa tiedosto Azure Blobiin
├── get.js          # GET /api/files - Hae dokumentit MongoDB:sta
└── delete.js       # DELETE /api/files/:id - Poista MongoDB:sta ja Azuresta

mongo.js            # MongoDB-yhteys ja fileSchema
```

### Kuvahallinnat (Azure SQL + Azure Blob)
```
uploads/
└── post.js         # POST /api/upload - Lataa kuva Azure Blobiin ja tallenna SQL:ään
```

---

## Yhteenveto

| Komponentti | Tietokanta | Käyttötarkoitus |
|------------|-----------|----------------|
| Kiinteistöt, remontit, kulutukset, käyttäjät | **Azure SQL** | Pääasiallinen tietokanta |
| Remontointikuvat (metatiedot) | **Azure SQL** | Kuvatiedot taulussa |
| Dokumentit (metatiedot) | **MongoDB** | Dokumenttitiedot kokoelmassa |
| Kaikki tiedostot (varsinaiset tiedostot) | **Azure Blob Storage** | Blob-tallennus |

**Huom**: Molemmat järjestelmät (kuvat ja dokumentit) käyttävät Azure Blob Storagea varsinaiseen tiedostotallennukseen, mutta eroavat metatietojen tallennuksessa (SQL vs. MongoDB).
