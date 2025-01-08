import React from 'react';
import '../../src/assets/ProgramInfoPage.css';

const DataProtection = () => {
    return (
        <div className='mx-5'>
            <h3 className='mb-3'>Tietosuoja</h3>

            <section>
                <h2>GDPR</h2>
                <ol>
                    <li>
                        <p>
                            TaloSave-sovellus noudattaa GDPR-asetusta. Sovellus ei kerää henkilökohtaisia tietoja käyttäjistä. Sovellus ei myöskään jaa tietoja kolmansille osapuolille. Sovellus tallentaa käyttäjän antamat tiedot tietokantaan, joka on suojattu salasanalla. Tietokantaan tallennetut tiedot ovat käyttäjän vastuulla. Sovellus ei vastaa mahdollisista tietoturvaongelmista tai tietojen menetyksestä.
                        </p>
                    </li>
                    <li>
                        <p>
                            Käyttäjällä on oikeus pyytää pääsyä omiin tietoihinsa, oikaista virheellisiä tietoja, poistaa tietoja, rajoittaa tietojen käsittelyä, vastustaa tietojen käsittelyä ja siirtää tiedot järjestelmästä toiseen. Käyttäjä voi käyttää näitä oikeuksia ottamalla yhteyttä sovelluksen ylläpitoon.
                        </p>
                    </li>
                    <li>
                        <p>
                            Sovellus käyttää evästeitä käyttäjäkokemuksen parantamiseksi. Evästeet ovat pieniä tekstitiedostoja, jotka tallennetaan käyttäjän laitteelle. Käyttäjä voi hallita evästeiden käyttöä selaimen asetuksista.
                        </p>
                    </li>
                    <li>
                        <p>
                            Sovellus ei kerää tietoja käyttäjän sijainnista. Sovellus ei myöskään käytä tietoja markkinointitarkoituksiin.
                        </p>
                    </li>
                    <li>
                        <p>
                            Sovellus voi sisältää linkkejä kolmansien osapuolten verkkosivustoille. Sovellus ei vastaa näiden sivustojen tietosuojakäytännöistä.
                        </p>
                    </li>
                    <li>
                        <p>
                            Käyttäjän tulee olla tietoinen siitä, että tietojen siirto internetin kautta ei ole täysin turvallista. Sovellus pyrkii suojaamaan käyttäjän tiedot parhaalla mahdollisella tavalla, mutta ei voi taata tietojen täydellistä turvallisuutta. Käyttäjän tietoja voidaan siirtää EU/ETA alueen ulkopuolelle. Sovellus pyrkii varmistamaan, että tietojen siirto tapahtuu turvallisesti ja GDPR-asetuksen mukaisesti.
                        </p>
                    </li>
                    <li>
                        <p>
                            Käyttäjän tulee ilmoittaa mahdollisista tietoturvaloukkauksista sovelluksen ylläpidolle välittömästi.
                        </p>
                    </li>
                    <li>
                        <p>
                            Sovellus pidättää oikeuden päivittää tätä tietosuojaselostetta tarvittaessa. Käyttäjää kehotetaan tarkistamaan tämä sivu säännöllisesti muutosten varalta.
                        </p>
                    </li>
                    <li>
                        <p>
                            Jos käyttäjällä on kysyttävää tietosuojasta, hän voi ottaa yhteyttä sovelluksen ylläpitoon sähköpostitse osoitteeseen: <a href="mailto:info@koodimaa.fi">info@koodimaa.fi</a>.
                        </p>
                    </li>
                </ol>
            </section>
        </div>
    );
};

export default DataProtection;