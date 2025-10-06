# 🏠 TaloSave

<div align="center">

**Talon omistajan digitaalinen tietopankki**

[![Version](https://img.shields.io/badge/version-1.0.0--beta-blue.svg)](https://github.com/yourusername/talosave)
[![Status](https://img.shields.io/badge/status-active--development-green.svg)]()
[![License](https://img.shields.io/badge/license-All%20Rights%20Reserved-red.svg)]()

[🌐 Live Demo](https://talosave-frontend.azurewebsites.net) • [📋 Features](#-ominaisuudet) • [🚀 Getting Started](#-aloittaminen) • [📖 Documentation](#-dokumentaatio)

</div>

---

## 📖 Kuvaus

TaloSave on modernin teknologian hyödyntämä web-sovellus kiinteistöjen hallintaan. Se tarjoaa kattavan alustan kiinteistöjen tietojen, kulutusten ja huoltotöiden seurantaan.

### 🎯 Tavoite
Keskittää kaikki kiinteistöön liittyvät tiedot yhteen helppokäyttöiseen sovellukseen, joka auttaa kiinteistönomistajia:
- 📊 Seuraamaan kulutuksia ja kustannuksia
- 🔧 Hallinnoimaan huoltotöitä ja remontteja
- 📝 Pitämään kirjaa tärkeistä tiedoista
- 💡 Tekemään tietoisia päätöksiä kiinteistön kehittämisestä

---

## ✨ Ominaisuudet

### 🏘️ **Kiinteistöhallinta**
- ✅ Useiden kiinteistöjen hallinta
- ✅ Kiinteistötietojen tallennus ja muokkaus
- ✅ Osoite- ja yhteystietojen hallinta
- ✅ Kiinteistökuvien tallentaminen

### 📊 **Kulutusseuranta**
- ⚡ **Sähkönkulutus** - Kuukausittainen seuranta (kWh, €)
- 🔥 **Lämmityskulutus** - Lämmityskustannusten kirjaaminen
- 💧 **Vedenkulutus** - Kuukausi- ja vuositason seuranta
- 📈 **Visualisointi** - Interaktiiviset kaaviot Victory.js:llä
- 💰 **Reaaliaikaiset sähkön hinnat** - Suomen sähköpörssin hintatiedot

### 🔨 **Remontti- ja huoltoseuranta**
- 📋 Remonttien kirjaaminen ja luokittelu
- 💸 Kustannusten seuranta
- 📅 Aikataulujen hallinta
- 📎 Dokumenttien liittäminen

### ✅ **Tehtävähallinta**
- 📝 Todo-lista kiinteistökohtaisesti
- ⏰ Aikataulujen asettaminen
- 🏷️ Tehtävien luokittelu ja priorisrointi

### 👤 **Käyttäjähallinta**
- 🔐 Turvallinen kirjautuminen (JWT)
- 👥 Käyttäjäprofiilit ja asetukset
- 🔄 Kiinteistöjen omistajuuden siirto

---

## 🛠️ Tekniset tiedot

### **Frontend**
- ⚛️ **React 18** - Moderni komponenttipohjainen käyttöliittymä
- 🎨 **Bootstrap 5** - Responsiivinen ja moderni ulkoasu
- 📊 **Victory.js** - Interaktiiviset kaaviot ja visualisoinnit
- 🔗 **React Router** - Client-side reititys
- 📱 **Responsive Design** - Toimii kaikilla laitteilla

### **Backend**
- 🟢 **Node.js & Express** - RESTful API
- 🗄️ **SQL Server** - Pääasiallinen tietokanta
- 🍃 **MongoDB** - Tiedostojen tallennus
- 🔐 **JWT Authentication** - Turvallinen kirjautuminen
- ☁️ **Azure Cloud** - Pilvipalveluissa

### **Kehitystyökalut**
- ⚡ **Vite** - Nopea build-työkalu
- 🧪 **Jest** - Testausympäristö
- 📦 **npm** - Paketinhallinta
- 🔧 **ESLint** - Koodin laadunvalvonta

---

## 🚀 Aloittaminen

### Esivalmistelut
```bash
# Vaaditaan:
- Node.js (v18+)
- npm (v8+)
- SQL Server -tietokanta
- MongoDB -instanssi
```

### Asennus

1. **Kloonaa repositorio**
```bash
git clone https://github.com/yourusername/talosave.git
cd talosave
```

2. **Asenna riippuvuudet**
```bash
# Frontend
cd ts-frontend
npm install

# Backend
cd ../ts-backend
npm install
```

3. **Ympäristömuuttujat**
```bash
# Luo .env-tiedosto backend-kansioon
cp .env.example .env
# Täytä tarvittavat tiedot (tietokanta, JWT secret, jne.)
```

4. **Käynnistä sovellus**
```bash
# Backend (portti 3000)
cd ts-backend
npm start

# Frontend (portti 5173)
cd ts-frontend
npm run dev
```

### 🗃️ Tietokannan alustus
```sql
-- Suorita tables-creation.sql SQL Server -tietokannassa
-- Luo tarvittavat taulut sovellukselle
```

---

## 📱 Käyttöliittymä

<div align="center">

### 🎨 Moderni & Responsiivinen

| Desktop | Mobile |
|---------|--------|
| ![Desktop View](docs/desktop-preview.png) | ![Mobile View](docs/mobile-preview.png) |

</div>

### 🌟 Käyttökokemuksen ominaisuudet
- 🎯 **Intuitiivinen navigaatio** - Selkeä ja helppokäyttöinen
- 📱 **Mobile-first design** - Optimoitu mobiililaitteille
- 🌙 **Moderni ulkoasu** - Siisti ja ammattimais design
- ⚡ **Nopea latautuminen** - Optimoitu suorituskyky
- ♿ **Saavutettavuus** - Helppokäyttöisyys huomioitu

---

## 📊 API-dokumentaatio

### Pääreitit
```
GET    /api/get/properties/:username     # Hae käyttäjän kiinteistöt
POST   /api/post/property              # Lisää kiinteistö
PUT    /api/putProperty/:propertyid    # Päivitä kiinteistö
DELETE /api/delete/property/:id        # Poista kiinteistö

GET    /api/electricconsumptions/:propertyid  # Sähkönkulutus
POST   /api/electricconsumptions              # Lisää sähkönkulutus
```

[📖 Täydellinen API-dokumentaatio](docs/api.md)

---

## 🤖 AI-avustettu kehitys

### Käytetty teknologia
Tämä sovellus on kehitetty hyödyntäen **Claude Sonnet 4** -tekoälyä kehitysavustajana - Anthropicin uusinta ja tehokkainta mallia.

### ⚖️ **Legaalisuus ja käyttöehdot**

#### ✅ **AI:n käyttö kaupallisessa kehityksessä**
- AI-avustettu ohjelmointi on **laillista** kaupallisessa kehityksessä
- Claude Sonnet tuottama koodi on **käyttäjän omaisuutta**
- Ei rajoituksia kaupalliselle käytölle tai jakelulle

#### 📋 **Vastuuvapauslauseke**
```
⚠️  KÄYTTÖ OMALLA VASTUULLA
Tämä sovellus on kehitetty AI-avustuksella. Vaikka koodi on 
huolellisesti testattu, käyttäjä vastaa:
- Sovelluksen käytöstä omassa ympäristössään
- Tietoturvan varmistamisesta
- Backup-käytännöistä
- Sovelluksen sopivuudesta käyttötarkoitukseen
```

#### 🛡️ **Tietoturva ja yksityisyys**
- Kaikki data tallennetaan käyttäjän omiin tietokantoihin
- Ei kolmannen osapuolen analytiikkaa
- Salasanat hashataan turvallisesti
- JWT-pohjinen autentikointi

---

## 🧪 Testaaminen

```bash
# Suorita testit
npm test

# Testikattavuus
npm run test:coverage

# E2E-testit
npm run test:e2e
```

---

## 📦 Deployment

### Azure Cloud
```bash
# Frontend (Static Web App)
npm run build
# Deploy dist-kansio Azure Static Web Appsiin

# Backend (App Service)
# Deploy Azure App Serviceen Node.js-ympäristöön
```

### Docker (valinnainen)
```bash
# Rakenna ja käynnistä Dockerilla
docker-compose up --build
```

---

## 🤝 Kehitys ja kontribuutiot

### Kehitysympäristö
```bash
# Kehitysmoodin käynnistys
npm run dev

# Koodin formatointi
npm run format

# Linting
npm run lint
```

### Versiohistoria
- **v1.0.0-beta** - Ensimmäinen beta-julkaisu
- Katso [CHANGELOG.md](CHANGELOG.md) täydellinen historia

---

## 📄 Lisenssi ja tekijänoikeudet

```
📋 Kaikki oikeudet pidätetään
👨‍💻 Kehittäjä: gittjar
📅 Vuosi: 2024-2025
🤖 AI-avustaja: Claude Sonnet 4 (Anthropic)

Tämä sovellus on yksityinen projekti. 
Koodi on saatavilla tarkastelua ja oppimista varten.
Kaupallinen käyttö ilman lupaa kielletty.
```


---

<div align="center">

**🏠 TaloSave - Älykkää kiinteistöhallintaa modernilla teknologialla**

*Kehitetty ❤️:llä Suomessa 🇫🇮*

[![Built with AI](https://img.shields.io/badge/Built%20with-Claude%20Sonnet%204-blueviolet.svg)](https://claude.ai)
[![Made in Finland](https://img.shields.io/badge/Made%20in-Finland%20🇫🇮-blue.svg)]()

</div>