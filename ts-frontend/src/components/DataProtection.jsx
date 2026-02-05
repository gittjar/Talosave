import React from 'react';
import '../../src/assets/ProgramInfoPage.css';

const DataProtection = () => {
    return (
        <div className='mx-5'>
            <h3 className='mb-3'>Tietosuojaseloste</h3>

            <section className='mb-4'>
                <h2>1. Rekisterinpitäjä</h2>
                <p>
                    TaloSave / Talotieto<br />
                    Sähköposti: <a href="mailto:info@koodimaa.fi">info@koodimaa.fi</a>
                </p>
            </section>

            <section className='mb-4'>
                <h2>2. Rekisterin nimi</h2>
                <p>TaloSave-sovelluksen käyttäjä- ja kiinteistörekisteri</p>
            </section>

            <section className='mb-4'>
                <h2>3. Palvelun luonne ja vastuunrajoitukset</h2>
                <p>
                    <strong>TaloSave on ilmainen, ei-kaupallinen versio</strong> kiinteistönhallintasovelluksesta. 
                    Palvelua tarjotaan "as is" -periaatteella ilman takuita tai vastuusitoumuksia.
                </p>
                <p className='mt-2'>
                    <strong>Käyttäjän vastuu:</strong>
                </p>
                <ul>
                    <li>Käyttäjä vastaa itse syöttämiensä tietojen oikeellisuudesta ja säännöllisestä varmuuskopioinnista</li>
                    <li>Sovellus on työkalu tietojen hallintaan, mutta ei korvaa virallisia kiinteistönhallintajärjestelmiä tai ammattimaisia palveluita</li>
                    <li>Käyttäjä vastaa salasanansa turvallisuudesta ja tilin väärinkäytön estämisestä</li>
                    <li>Kulutustiedot ja analyysit ovat ohjeellisia - virallisiin laskutuksiin tulee käyttää palveluntarjoajien omia lukemia</li>
                </ul>
                <p className='mt-2'>
                    <strong>Rekisterinpitäjän vastuunrajoitukset:</strong>
                </p>
                <ul>
                    <li>Emme vastaa mahdollisista palvelukatkoksista, tietojen menetyksistä tai teknisistä häiriöistä</li>
                    <li>Emme vastaa käyttäjän syöttämien tietojen virheellisyydestä tai niiden käytöstä tehdyistä päätöksistä</li>
                    <li>Emme vastaa kolmansien osapuolten palveluiden (Azure, MongoDB Atlas, Netlify, Nord Pool) toiminnasta</li>
                    <li>Pyrimme parhaamme mukaan suojaamaan tietoja, mutta emme voi taata 100% suojaa kaikissa tilanteissa</li>
                    <li>Palvelun käyttö on käyttäjän omalla vastuulla</li>
                </ul>
                <p className='mt-2'>
                    <strong>Suositus:</strong> Varmuuskopioi tärkeät tiedot säännöllisesti ja säilytä virallisia asiakirjoja 
                    (esim. remonttikulut, takuutiedot) myös sovelluksen ulkopuolella.
                </p>
            </section>

            <section className='mb-4'>
                <h2>4. Oikeusperuste ja henkilötietojen käsittelyn tarkoitus</h2>
                <p>
                    Henkilötietojen käsittely perustuu EU:n yleiseen tietosuoja-asetukseen (GDPR) ja käyttäjän suostumukseen. 
                    Tietoja käsitellään seuraaviin tarkoituksiin:
                </p>
                <ul>
                    <li>Käyttäjätilin luominen ja ylläpito</li>
                    <li>Palvelun tekninen toteutus ja ylläpito</li>
                    <li>Kiinteistöjen tietojen hallinta ja seuranta</li>
                    <li>Kulutustietojen (sähkö, vesi, lämpö) kirjaaminen ja analysointi</li>
                    <li>Remontti- ja huoltotietojen tallentaminen</li>
                    <li>Yhteydenpito käyttäjiin</li>
                </ul>
            </section>

            <section className='mb-4'>
                <h2>5. Rekisterin tietosisältö</h2>
                <p>Sovellukseen tallennettavat henkilötiedot:</p>
                <ul>
                    <li><strong>Käyttäjätiedot:</strong> Käyttäjänimi, sähköpostiosoite, salasana (salattu BCrypt-algoritmilla), tilin luontipäivä</li>
                    <li><strong>Kiinteistötiedot:</strong> Kiinteistön osoite, rakennusvuosi, pinta-ala, kerrokset, huoneistojen määrä, lämmitystapa, omistaja (linkki käyttäjään)</li>
                    <li><strong>Kulutustiedot:</strong> Sähkön, veden ja lämmön kulutuslukemat sekä päivämäärät</li>
                    <li><strong>Remontit ja huollot:</strong> Korjaustoimenpiteiden kuvaukset, päivämäärät, kustannukset, liitteet</li>
                    <li><strong>Huoltoaikataulut:</strong> Rakennuskomponenttien asennusvuodet ja elinikätiedot (tallennettu selaimen localStorage-muistiin)</li>
                    <li><strong>Tehtävälistat:</strong> Käyttäjän luomat TODO-tehtävät ja niiden tila</li>
                    <li><strong>Tekninen data:</strong> JWT-autentikointitokenit, kirjautumisyritykset (rate limiting), istuntotiedot</li>
                </ul>
                <p className='mt-3'><strong>Sovellus EI kerää:</strong></p>
                <ul>
                    <li>Henkilötunnuksia tai muita virallisia tunnistenumeroita</li>
                    <li>Sijaintitietoja tai IP-osoitteita pysyvästi</li>
                    <li>Evästeitä markkinointi- tai seurantatarkoituksiin</li>
                    <li>Kolmansien osapuolten analytiikkatietoja (ei Google Analytics tms.)</li>
                </ul>
            </section>

            <section className='mb-4'>
                <h2>6. Säännönmukaiset tietolähteet</h2>
                <p>
                    Kaikki tiedot saadaan käyttäjältä itseltään sovelluksen käyttöliittymän kautta. 
                    Lisäksi haetaan julkista sähkön hintadataa Nord Pool -sähköpörssistä (ei henkilötietoja).
                </p>
            </section>

            <section className='mb-4'>
                <h2>7. Tietojen säilytysaika</h2>
                <p>
                    Henkilötiedot säilytetään niin kauan kuin käyttäjätili on aktiivinen. Käyttäjä voi milloin tahansa poistaa:
                </p>
                <ul>
                    <li>Yksittäisiä kiinteistöjä ja niihin liittyviä tietoja</li>
                    <li>Kulutustietoja, remontteja ja huoltotietoja</li>
                    <li>Koko käyttäjätilin ja kaikki siihen liittyvät tiedot</li>
                </ul>
                <p>
                    Tilin poiston jälkeen kaikki käyttäjän tiedot poistetaan pysyvästi tietokannasta 30 päivän sisällä. 
                    Lakisääteisistä syistä (esim. kirjanpito) säilytettävät tiedot poistetaan lakisääteisen säilytysajan umpeuduttua.
                </p>
            </section>

            <section className='mb-4'>
                <h2>8. Tietojen luovutus ja siirto</h2>
                <p>
                    <strong>Tietoja ei myydä, vuokrata tai luovuteta kolmansille osapuolille</strong> markkinointi- tai muihin kaupallisiin tarkoituksiin.
                </p>
                <p className='mt-2'>Tietoja käsittelevät seuraavat palveluntarjoajat:</p>
                <ul>
                    <li><strong>Microsoft Azure:</strong> Backend-palvelin (Azure App Service, EU-alue) ja SQL Server -tietokanta</li>
                    <li><strong>MongoDB Atlas:</strong> NoSQL-tietokanta (EU-alue)</li>
                    <li><strong>Netlify:</strong> Frontend-sovelluksen hosting (EU/USA)</li>
                </ul>
                <p className='mt-2'>
                    Kaikki palveluntarjoajat ovat GDPR-yhteensopivia ja noudattavat EU:n tietosuojalainsäädäntöä. 
                    Tietojen siirto EU/ETA-alueen ulkopuolelle tapahtuu vain EU:n hyväksymien suojatoimien mukaisesti.
                </p>
            </section>

            <section className='mb-4'>
                <h2>9. Rekisterin suojaus</h2>
                <p>Henkilötietoja suojataan seuraavilla teknisillä ja organisatorisilla toimenpiteillä:</p>
                <ul>
                    <li><strong>Salasanat:</strong> Salattu BCrypt-algoritmilla (ei tallenneta selkokielellä)</li>
                    <li><strong>Autentikointi:</strong> JWT (JSON Web Token) -pohjainen turvallinen kirjautuminen</li>
                    <li><strong>Rate limiting:</strong> Kirjautumisyritysten rajoitus (5 yritystä / 10 minuuttia) brute force -hyökkäysten estämiseksi</li>
                    <li><strong>HTTPS:</strong> Kaikki tietoliikenne salattu SSL/TLS-protokollalla</li>
                    <li><strong>CORS:</strong> Rajattu pääsy vain hyväksytyistä domain-osoitteista</li>
                    <li><strong>Pääsynhallinta:</strong> Käyttäjä näkee ja muokkaa vain omia tietojaan</li>
                    <li><strong>Tietokanta:</strong> Suojattu salasanoilla ja palomuureilla, säännölliset varmuuskopiot</li>
                    <li><strong>LocalStorage:</strong> Vain ei-arkaluonteista dataa (huoltoaikataulut) käyttäjän laitteella</li>
                </ul>
            </section>

            <section className='mb-4'>
                <h2>10. Käyttäjän oikeudet</h2>
                <p>GDPR:n mukaan käyttäjällä on seuraavat oikeudet:</p>
                <ul>
                    <li><strong>Tarkastusoikeus (Art. 15):</strong> Oikeus saada pääsy omiin henkilötietoihin ja tietää, miten niitä käsitellään</li>
                    <li><strong>Oikeus tietojen oikaisemiseen (Art. 16):</strong> Oikeus korjata virheelliset tai puutteelliset tiedot sovelluksessa</li>
                    <li><strong>Oikeus tietojen poistamiseen (Art. 17):</strong> Oikeus poistaa tietonsa sovelluksesta ("oikeus tulla unohdetuksi")</li>
                    <li><strong>Oikeus käsittelyn rajoittamiseen (Art. 18):</strong> Oikeus pyytää tietojen käsittelyn rajoittamista tietyin edellytyksin</li>
                    <li><strong>Oikeus siirtää tiedot (Art. 20):</strong> Oikeus saada omat tiedot koneellisesti luettavassa muodossa</li>
                    <li><strong>Vastustamisoikeus (Art. 21):</strong> Oikeus vastustaa tietojen käsittelyä tietyin perustein</li>
                    <li><strong>Oikeus tehdä valitus (Art. 77):</strong> Oikeus tehdä valitus valvontaviranomaiselle (Tietosuojavaltuutetun toimisto)</li>
                </ul>
                <p className='mt-3'>
                    Oikeuksiasi voit käyttää ottamalla yhteyttä sähköpostitse: <a href="mailto:info@koodimaa.fi">info@koodimaa.fi</a>. 
                    Vastaamme pyyntöihin 30 päivän kuluessa.
                </p>
            </section>

            <section className='mb-4'>
                <h2>11. Evästeet ja selaintallennus</h2>
                <p>
                    Sovellus käyttää selaimen <strong>localStorage</strong>-muistia seuraaviin tarkoituksiin:
                </p>
                <ul>
                    <li>Autentikointitoken (JWT) kirjautumistilan ylläpitoon</li>
                    <li>Käyttöliittymän asetukset (esim. kaavion tyyppi, yksikkövalinnat)</li>
                    <li>Huoltoaikataulun tiedot (rakennuskomponenttien asennusvuodet)</li>
                </ul>
                <p className='mt-2'>
                    <strong>Sovellus ei käytä evästeitä (cookies)</strong> markkinointiin, analytiikkaan tai kolmansien osapuolten seurantaan. 
                    Käyttäjä voi tyhjentää selaimen localStorage-muistin selaimen asetuksista.
                </p>
            </section>

            <section className='mb-4'>
                <h2>12. Automaattinen päätöksenteko ja profilointi</h2>
                <p>
                    Sovellus ei käytä henkilötietoja automaattiseen päätöksentekoon tai profilointiin. 
                    Kaikki kulutusanalyysit ja huoltoaikataulut ovat käyttäjän itse syöttämän datan perusteella 
                    laskettuja tilastoja ilman automaattista profilointia.
                </p>
            </section>

            <section className='mb-4'>
                <h2>13. Tietosuojaselosteen muutokset</h2>
                <p>
                    Pidätämme oikeuden päivittää tätä tietosuojaselostetta tarvittaessa. Merkittävistä muutoksista 
                    ilmoitetaan käyttäjille sovelluksen kautta tai sähköpostitse. Suosittelemme tarkistamaan tämän 
                    sivun säännöllisesti.
                </p>
                <p className='mt-2'>
                    <strong>Viimeksi päivitetty:</strong> 27.1.2026
                </p>
            </section>

            <section className='mb-4'>
                <h2>14. Yhteystiedot ja lisätiedot</h2>
                <p>
                    Jos sinulla on kysymyksiä tietosuojasta, henkilötietojesi käsittelystä tai haluat käyttää 
                    GDPR-oikeuksiasi, ota yhteyttä:
                </p>
                <p className='mt-2'>
                    <strong>Sähköposti:</strong> <a href="mailto:info@koodimaa.fi">info@koodimaa.fi</a>
                </p>
                <p className='mt-3'>
                    <strong>Valvontaviranomainen Suomessa:</strong><br />
                    Tietosuojavaltuutetun toimisto<br />
                    <a href="https://tietosuoja.fi" target="_blank" rel="noopener noreferrer">www.tietosuoja.fi</a>
                </p>
            </section>
        </div>
    );
};

export default DataProtection;