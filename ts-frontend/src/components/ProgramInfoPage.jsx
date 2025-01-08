import React from 'react';
import '../../src/assets/ProgramInfoPage.css';

const ProgramInfoPage = () => {
  return (
    <div className="program-info-page">
      <h1>Ohjelman tiedot</h1>
      <section>
        <h2>1. Yleistä</h2>
        <p>
          Tervetuloa TaloSave-sovellukseen, versio 1.0. Tämä sovellus on suunniteltu auttamaan sinua hallitsemaan rakennuksen tietoja, seurata kulutustietoja ja pitää kirjaa tehtävistä. TaloSave on toteutettu käyttäen modernia web-teknologiaa, mukaan lukien React ja Node.js, tarjoten käyttäjille intuitiivisen ja tehokkaan työkalun rakennusten hallintaan.
        </p>
        <p>
          Ohjelma on kehitysvaiheessa ja uusia ominaisuuksia lisätään jatkuvasti. Käyttäjät voivat antaa palautetta ja ehdotuksia ohjelman kehittämiseksi. Ohjelman kehittäjä on Jarno K.
          Ohjelma voi sisältää virheitä ja puutteita, joten käyttäjän tulee tarkistaa kaikki tiedot ennen niiden käyttöä.
          Vastuu ohjelman käytöstä ja sen tuottamista tuloksista on käyttäjällä.
        </p>
        <p>
          Vastuu ohjelman käytöstä ja sen tuottamista tuloksista on käyttäjällä. Ohjelma ei vastaa mahdollisista virheistä tai puutteista. Käyttäjän tulee tarkistaa kaikki tiedot ennen niiden käyttöä.
          Mahdolliset ongelmat tai puutteet ohjelmassa voi ilmoittaa osoitteeseen: <a href="mailto:info@koodimaa.fi">Koodimaa info</a> 
        </p>
        <p>
          TaloSave ohjelma on toistaiseksi ilmainen käyttää. Ohjelman kehittäjä pidättää oikeuden muuttaa ohjelman käyttöehtoja ja hinnoittelua ilman erillistä ilmoitusta.
        </p>
      </section>

      <section>
        <h2>2. Yksityisyys</h2>
        <p>
          TaloSave-sovellus ei kerää henkilökohtaisia tietoja käyttäjistä. Sovellus ei myöskään jaa tietoja kolmansille osapuolille. Sovellus käyttää evästeitä käyttäjäkokemuksen parantamiseksi.
        </p>
        <p>
          Sovelluksen käyttäjät voivat luoda käyttäjätilin, joka mahdollistaa tietojen tallentamisen ja hallinnan. Käyttäjätilin luomiseksi tarvitaan sähköpostiosoite ja salasana. Käyttäjätilin poistaminen on mahdollista milloin tahansa.
          Sovellus ei kerää eikä tallenna henkilökohtaisia tietoja käyttäjistä. Sovellus tallentaa ainoastaan käyttäjän antamat tiedot, kuten rakennuksen tiedot ja kulutustiedot. Sovellus ei jaa tietoja kolmansille osapuolille. 
        </p>
        <p>
          Sovellus tallentaa käyttäjän antamat tiedot tietokantaan, joka on suojattu salasanalla. Tietokantaan tallennetut tiedot ovat käyttäjän vastuulla. Sovellus ei vastaa mahdollisista tietoturvaongelmista tai tietojen menetyksestä. 
        </p>
        <p>
          Ohjelma on Beta versio ja kehitysvaiheessa. Käyttäjän tulee tarkistaa kaikki tiedot ennen niiden käyttöä. Ohjelman kehittäjä ei vastaa mahdollisista virheistä tai puutteista. Käyttäjän tulee tarkistaa kaikki tiedot ennen niiden käyttöä.
          Ohjelman käyttöön liittyy riskejä, ja käyttäjän tulee olla tietoinen näistä riskeistä. Käyttäjän tulee käyttää ohjelmaa omalla vastuullaan.
        </p>
      </section>


      
      <section>
        <h2>3. Lisenssi</h2>
        <p>
          © JarnoK 2024. Kaikki oikeudet pidätetään. Tämä ohjelmisto on suojattu tekijänoikeuslailla ja kansainvälisillä sopimuksilla. Tämän ohjelmiston käyttö on sallittu vain sen lisenssiehtojen mukaisesti. Luvaton kopiointi, jakelu tai muu tämän ohjelmiston osan käyttö on ehdottomasti kielletty.
        </p>
      </section>
    </div>
  );
};

export default ProgramInfoPage;