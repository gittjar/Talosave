import React from 'react';
import '../../src/assets/ProgramInfoPage.css';

const ProgramInfoPage = () => {
  return (
    <div className="program-info-page">
      <h1>Ohjelman tiedot</h1>
      
      <section>
        <h2>1. Yleistä</h2>
        <p>
          Tervetuloa <strong>TaloSave / Talotieto</strong> -sovellukseen, versio 2.0 (2026). Tämä on ilmainen, ei-kaupallinen 
          kiinteistönhallintasovellus, joka auttaa sinua hallitsemaan kiinteistöjen tietoja, seuraamaan 
          kulutuksia (sähkö, vesi, lämpö) ja pitämään kirjaa remonteista sekä huoltotarpeista.
        </p>
        <p>
          <strong>Toteutus:</strong> Sovellus on rakennettu modernilla web-teknologialla:
        </p>
        <ul>
          <li><strong>Frontend:</strong> React 18.2, Vite 5.4, Bootstrap 5.3, React Bootstrap, Victory.js (kaaviot)</li>
          <li><strong>Backend:</strong> Node.js 22.17, Express, JWT-autentikointi, rate limiting</li>
          <li><strong>Tietokannat:</strong> Microsoft Azure SQL Server, MongoDB Atlas</li>
          <li><strong>Hosting:</strong> Netlify (frontend), Azure App Service (backend)</li>
          <li><strong>Tietoturva:</strong> BCrypt-salaus, HTTPS, CORS-suojaus, sessio-tokenit</li>
        </ul>
      </section>

      <section>
        <h2>2. Ominaisuudet</h2>
        <p>TaloSave tarjoaa seuraavat toiminnot:</p>
        <ul>
          <li><strong>Kiinteistöhallinta:</strong> Useiden kiinteistöjen tiedot (osoite, rakennusvuosi, pinta-ala, lämmitystapa)</li>
          <li><strong>Kulutusseuranta:</strong> Sähkön, veden ja lämmön kulutustietojen kirjaus ja visualisointi</li>
          <li><strong>Sähkön hinnat:</strong> Reaaliaikaiset Nord Pool -sähköpörssin hinnat (tänään + huomenna)</li>
          <li><strong>Remontit ja huollot:</strong> Korjaustoimenpiteiden kirjaus, kustannuslaskenta, liitteet</li>
          <li><strong>Huoltoaikataulu:</strong> Rakennuskomponenttien elinikäseuranta (21 komponenttia, perustuu VTT:n tietoihin)</li>
          <li><strong>Tehtävälistat (TODO):</strong> Huolto- ja korjaustehtävien hallinta</li>
          <li><strong>Käyttäjähallinta:</strong> Oma tili, salasanan vaihto, datan hallinta</li>
          <li><strong>Mobiilioptimoidut kaaviot:</strong> Responsiiviset kulutusanalyysit</li>
        </ul>
      </section>

      <section>
        <h2>3. Palvelun luonne ja rajoitukset</h2>
        <p>
          <strong>TaloSave on ilmainen, ei-kaupallinen beta-versio.</strong> Palvelua tarjotaan "as is" -periaatteella:
        </p>
        <ul>
          <li>Sovellus on <strong>kehitysvaiheessa</strong> ja uusia ominaisuuksia lisätään jatkuvasti</li>
          <li>Saattaa sisältää virheitä, puutteita tai teknisiä häiriöitä</li>
          <li>Ei korvaa virallisia kiinteistönhallintajärjestelmiä tai ammattimaisia palveluita</li>
          <li>Kulutustiedot ja analyysit ovat <strong>ohjeellisia</strong> - virallisiin laskutuksiin käytä palveluntarjoajien lukemia</li>
          <li>Palvelun jatkuvuutta tai tietojen säilymistä ei taata</li>
        </ul>
        <p className='mt-3'>
          <strong>Vastuu:</strong>
        </p>
        <ul>
          <li><strong>Käyttäjän vastuulla:</strong> Syöttämiesi tietojen oikeellisuus, varmuuskopiointi, salasanan turvallisuus</li>
          <li><strong>Kehittäjä ei vastaa:</strong> Tietojen menetyksestä, virheellisistä tiedoista, palvelukatkoksista tai käytöstä aiheutuvista vahingoista</li>
          <li><strong>Suositus:</strong> Varmuuskopioi tärkeät tiedot säännöllisesti sovelluksen ulkopuolelle</li>
        </ul>
      </section>

      <section>
        <h2>4. Yksityisyys ja tietosuoja</h2>
        <p>
          TaloSave noudattaa EU:n GDPR-tietosuoja-asetusta. Tärkeimmät periaatteet:
        </p>
        <ul>
          <li>Tallennamme vain tarvittavat käyttäjätiedot (sähköposti, salasana, kiinteistötiedot)</li>
          <li>Salasanat salattu BCrypt-algoritmilla (ei tallenneta selkokielisinä)</li>
          <li>Tietoja <strong>ei myydä, vuokrata tai jaeta kolmansille osapuolille</strong></li>
          <li>Ei evästeitä markkinointiin tai seurantaan</li>
          <li>Käyttäjä voi milloin tahansa poistaa tietonsa</li>
          <li>Tiedot tallennettu turvallisesti EU-alueelle (Azure, MongoDB Atlas)</li>
        </ul>
        <p className='mt-2'>
          Katso tarkemmat tiedot: <a href="/data-protection">Tietosuojaseloste</a>
        </p>
      </section>

      <section>
        <h2>5. Hinnoittelu</h2>
        <p>
          <strong>TaloSave on tällä hetkellä täysin ilmainen</strong> kaikille käyttäjille. 
          Kehittäjä pidättää oikeuden muuttaa hinnoittelua tulevaisuudessa, mutta ilmoittaa tällaisista 
          muutoksista etukäteen käyttäjille.
        </p>
      </section>

      <section>
        <h2>6. Kehitys ja palaute</h2>
        <p>
          Sovellusta kehitetään aktiivisesti käyttäjäpalautteen pohjalta. Voit lähettää:
        </p>
        <ul>
          <li>Ehdotuksia uusista ominaisuuksista</li>
          <li>Vikailmoituksia tai teknisiä ongelmia</li>
          <li>Palautetta käyttökokemuksesta</li>
        </ul>
        <p>
          <strong>Yhteystiedot:</strong><br />
          Sähköposti: <a href="mailto:info@koodimaa.fi">info@koodimaa.fi</a>
        </p>
      </section>

      <section>
        <h2>7. Tekninen tuki</h2>
        <p>
          Tekninen tuki tarjotaan "best effort" -periaatteella sähköpostin kautta. 
          Vastausaika vaihtelee 1-7 arkipäivän välillä. Kiireellisissä tietoturvaongelmissa 
          pyrimme vastaamaan nopeammin.
        </p>
        <p className='mt-2'>
          <strong>Yleisimmät ongelmat:</strong>
        </p>
        <ul>
          <li><strong>Kirjautuminen ei onnistu:</strong> Tarkista salasana, tyhjennä selaimen välimuisti</li>
          <li><strong>Tiedot eivät tallennu:</strong> Varmista internet-yhteys, yritä uudelleen</li>
          <li><strong>Kaaviot eivät näy:</strong> Päivitä sivu (F5), tarkista selaimen JavaScript-asetukset</li>
          <li><strong>Sähkön hinnat eivät näy:</strong> Huomisen hinnat julkaistaan klo 15:00 (Nord Pool)</li>
        </ul>
      </section>

      <section>
        <h2>8. Lisenssi ja tekijänoikeudet</h2>
        <p>
          © 2024-2026 Jarno K. / Koodimaa. Kaikki oikeudet pidätetään.
        </p>
        <p>
          Tämä ohjelmisto on suojattu tekijänoikeuslailla ja kansainvälisillä sopimuksilla. 
          Sovelluksen käyttö on sallittu vain henkilökohtaisiin, ei-kaupallisiin tarkoituksiin. 
        </p>
        <p>
          <strong>Kiellettyä:</strong>
        </p>
        <ul>
          <li>Sovelluksen tai sen osien kaupallinen hyödyntäminen ilman lupaa</li>
          <li>Lähdekoodin kopiointi, muokkaaminen tai jakelu</li>
          <li>Reverse engineering tai muiden teknisten suojausten kiertäminen</li>
          <li>Sovelluksen brändäys omalla nimellä</li>
        </ul>
      </section>

      <section>
        <h2>9. Muutokset ehtoihin</h2>
        <p>
          Kehittäjä pidättää oikeuden päivittää näitä ehtoja tarvittaessa. Merkittävistä muutoksista 
          ilmoitetaan käyttäjille sovelluksen kautta tai sähköpostitse. Jatkamalla sovelluksen käyttöä 
          muutosten jälkeen hyväksyt päivitetyt ehdot.
        </p>
        <p className='mt-2'>
          <strong>Viimeksi päivitetty:</strong> 28.1.2026
        </p>
      </section>

      <section>
        <h2>10. Kiitokset</h2>
        <p>
          TaloSave hyödyntää seuraavia avoimen lähdekoodin projekteja ja julkisia palveluita:
        </p>
        <ul>
          <li><strong>React</strong> (Meta) - Käyttöliittymäkirjasto</li>
          <li><strong>Bootstrap</strong> - UI-komponentit</li>
          <li><strong>Victory.js</strong> - Kaaviokirjasto</li>
          <li><strong>Nord Pool</strong> - Sähkön hintadata (julkinen API)</li>
          <li><strong>VTT</strong> - Rakennuskomponenttien elinikätiedot</li>
        </ul>
        <p className='mt-2'>
          Kiitos kaikille avoimen lähdekoodin kehittäjille ja yhteisölle!
        </p>
      </section>
    </div>
  );
};

export default ProgramInfoPage;