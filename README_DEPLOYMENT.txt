===========================================
TALOSAVE - DEPLOYMENT OHJEET
===========================================

PROJEKTIN RAKENNE
-----------------
- develop     = Kehityshaara (ei automaattista deploymenttia)
- production  = Tuotantohaara (Netlify + Azure deployt)

NETLIFY FRONTEND DEPLOYMENT
---------------------------
Frontend: https://talotieto.netlify.app

Netlify kuuntelee VAIN 'production' haaraa.
Deployment tapahtuu automaattisesti kun pusket production-haaraan.

Asetukset:
- Base directory: ts-frontend
- Build command: npm run build
- Publish directory: ts-frontend/dist
- Production branch: production

AZURE BACKEND DEPLOYMENT
------------------------
Backend: https://talosave-backend.azurewebsites.net

Azure App Service deployt GitHub Actionsin kautta.
Katso: .github/workflows/

KEHITYSTYÖSKENTELY
------------------

1. Kehitystyö develop-haarassa:
   git checkout develop
   git add .
   git commit -m "feature: uusi ominaisuus"
   git push origin develop
   
   → Ei käynnistä Netlify buildia (säästää krediittejä)

2. Kun valmis julkaisuun:
   git checkout production
   git merge develop
   git push origin production
   
   → Käynnistää Netlify + Azure deployt

GITHUB ACTIONS
--------------
GitHub Actions hoitaa automaattiset deployt:
- Backend → Azure App Service
- Frontend → Netlify (kun production-haara päivittyy)

Katso workflows: .github/workflows/

CORS-ASETUKSET
--------------
Backend server.js CORS allowed origins:
- http://localhost:5173 (local dev)
- https://talosave-frontend.azurewebsites.net
- https://talotieto.netlify.app

YMPÄRISTÖMUUTTUJAT
------------------
Frontend (config.js):
- Development: http://localhost:3000
- Production: https://talosave-backend.azurewebsites.net

Backend (.env):
- DATABASE_URL
- MONGODB_URI
- JWT_SECRET

TÄRKEÄÄ
-------
- ÄLÄ pushaa suoraan production-haaraan ilman testausta
- Testaa muutokset ensin develop-haarassa
- Merge production-haaraan vain toimivat versiot
- Netlify build kuluttaa krediittejä → käytä harkiten

ONGELMATILANTEET
----------------
1. Netlify build epäonnistuu:
   - Tarkista build logs Netlify dashboardista
   - Varmista että ts-frontend/package.json on kunnossa
   
2. CORS-virheet:
   - Lisää origin server.js allowedOrigins-listaan
   - Redeploy backend Azure:en

3. Backend ei vastaa:
   - Tarkista Azure App Service logs
   - Varmista että ympäristömuuttujat on asetettu

===========================================
Päivitetty: 25.1.2026
===========================================
