# 📷 Kuvien Latausohje - TaloSave

## Yleistä

TaloSave tukee kahta tapaa lisätä kuvia remontteihin:
1. **Suora tiedostolatus** - Lataa kuva suoraan puhelimesta tai koneelta
2. **URL-linkki** - Lisää kuva antamalla julkinen URL-osoite

---

## 🔹 Tapa 1: Suora Tiedostolatus (Suositeltu)

### Edut
✅ Nopea ja helppo  
✅ Ei tarvitse ulkoista tallennuspalvelua  
✅ Kuvat tallennetaan turvallisesti Azure Blob Storageen  
✅ Automaattinen tiedoston koon tunnistus  

### Käyttöohje

1. **Avaa remontti**
   - Mene haluamasi kiinteistön "Remontit"-välilehdelle
   - Klikkaa remonttia avataksesi tiedot
   
2. **Aloita kuvien lataus**
   - Klikkaa "Lisää kuva" -nappia
   - Valitse "Lataa tiedosto" -välilehti

3. **Valitse kuva**
   - Klikkaa "Valitse kuva" -kenttää
   - **Puhelimella:** Valitse ottaako uusi kuva vai valitaanko galleriasta
   - **Tietokoneella:** Selaa ja valitse kuva koneeltasi
   
4. **Tarkista esikatselu**
   - Valittu kuva näkyy esikatseluna
   - Tiedoston nimi ja koko näytetään
   
5. **Lataa**
   - Klikkaa "Lataa kuva"
   - Odota latauspalkin täyttymistä
   - Kuva ilmestyy galleriaan automaattisesti

### Vaatimukset
- **Tiedostotyyppi:** JPEG, PNG, GIF tai muu kuvaformaatti
- **Maksimikoko:** 10 MB per kuva
- **Azure Storage:** Backend-palvelimella oltava Azure Blob Storage konfiguroitu

### Rajoitukset
⚠️ Jos näet virheilmoituksen "Azure Blob Storage ei ole konfiguroitu", käytä vaihtoehtoa 2 (URL-linkki).

---

## 🔹 Tapa 2: URL-Linkki

### Edut
✅ Toimii aina (ei vaadi Azure-konfiguraatiota)  
✅ Voit käyttää mitä tahansa pilvipalvelua  
✅ Hyvä isoille tiedostoille tai videolinkeille  

### Käyttöohje

1. **Lataa kuva pilvipalveluun**
   Valitse jokin seuraavista:
   - **Google Drive:** Lataa kuva, klikkaa oikealla → "Jaa" → "Hanki linkki" → Vaihda "Kuka tahansa, jolla on linkki"
   - **OneDrive:** Lataa kuva → "Jaa" → Kopioi linkki
   - **Dropbox:** Lataa kuva → "Jaa" → Kopioi linkki
   - **Imgur:** Lataa kuva → Kopioi "Direct Link"
   - **Azure Blob Storage:** Lataa container:iin ja kopioi blob URL

2. **Lisää linkki TaloSave:en**
   - Klikkaa "Lisää kuva"
   - Valitse "URL-osoite" -välilehti
   - Liitä kuvan URL "Kuvan URL-osoite" -kenttään
   
3. **Lisätiedot (valinnainen)**
   - Kuvan nimi: Anna kuvaava nimi (esim. "Keittiö ennen remonttia")
   - Tiedoston koko: Anna koko tavuina (voit jättää tyhjäksi)
   
4. **Tallenna**
   - Klikkaa "Lisää kuva"
   - Kuva ilmestyy galleriaan

### Tärkeää
⚠️ **URL:n on oltava julkinen** - Yksityiset linkit eivät näy muille käyttäjille  
⚠️ **Suora kuvalinkki** - Linkin tulee osoittaa suoraan kuvatiedostoon (päättyy .jpg, .png, .gif)  
⚠️ **HTTPS suositeltu** - Käytä turvallista yhteyttä aina kun mahdollista  

---

## 📸 Kuva-Galleria

### Kuvien Katselu
- Klikkaa pikkukuvaa avataksesi suuremman version
- Modal-ikkuna näyttää kuvan koko näytössä
- Tiedot (lisäyspäivä, koko) näytetään kuvan alla

### Kuvien Poistaminen
1. Klikkaa "Poista" -nappia kuvan kortissa, tai
2. Avaa kuva isompana ja klikkaa "Poista kuva"
3. Vahvista poisto

⚠️ **Huom:** Kuvien poisto on pysyvää ja sitä ei voi perua!

### Gallerianäkymä
- **Mobiili:** 1 kuva per rivi
- **Tabletti:** 2-3 kuvaa per rivi
- **Tietokone:** 4 kuvaa per rivi
- Automaattinen responsiivisuus

---

## ❓ Ongelmatilanteet

### "Valitse kuvatiedosto"
**Syy:** Et ole valinnut tiedostoa  
**Ratkaisu:** Klikkaa "Valitse kuva" ja valitse tiedosto

### "Tiedosto on liian suuri (max 10MB)"
**Syy:** Kuva ylittää 10 MB:n rajan  
**Ratkaisu:**
1. Pienennä kuvaa kuvankäsittelyohjelmalla
2. Käytä puhelimen "Optimoi koko" -ominaisuutta
3. Käytä URL-menetelmää

### "Vain kuvatiedostot sallittu"
**Syy:** Yritit ladata ei-kuvatiedostoa (PDF, video, jne.)  
**Ratkaisu:** Valitse kuvatiedosto (JPEG, PNG, GIF)

### "Azure Blob Storage ei ole konfiguroitu"
**Syy:** Palvelimella ei ole Azure Storage käytössä  
**Ratkaisu:** Käytä URL-menetelmää (Tapa 2)

### "Kuvan lataus epäonnistui"
**Mahdolliset syyt:**
- Verkkoyhteys katkesi
- Palvelin ei vastaa
- Tiedosto korruptoitunut

**Ratkaisu:**
1. Tarkista internet-yhteys
2. Yritä uudelleen
3. Kokeile toista kuvaa
4. Käytä URL-menetelmää vaihtoehtona

### Kuva ei näy galleriassa
**Syy 1:** URL ei ole julkinen  
**Ratkaisu:** Tarkista pilvipalvelun jakoasetukset

**Syy 2:** URL ei osoita suoraan kuvatiedostoon  
**Ratkaisu:** Kopioi "Direct Link" tai "Suora linkki"

**Syy 3:** Kuva on poistettu lähteestä  
**Ratkaisu:** Lataa kuva uudelleen

---

## 💡 Vinkkejä

### Kuvien Organisointi
- Anna kuville kuvaavat nimet: "Keittiö_ennen.jpg", "Keittiö_jälkeen.jpg"
- Ota kuvia ennen ja jälkeen remontin
- Ota lähikuvia ongelmallisista kohdista
- Dokumentoi työn etenemistä säännöllisesti

### Kuvien Laatu
- Ota kuvia hyvässä valaistuksessa
- Käytä korkeinta mahdollista resoluutiota
- Vältä epätarkkautta (blur)
- Ota useita kulmia samasta kohteesta

### Tallennustila
- Azure Blob Storage: ~0.018€/GB/kk
- Google Drive: 15 GB ilmaiseksi
- OneDrive: 5 GB ilmaiseksi
- Dropbox: 2 GB ilmaiseksi

### Tietoturva
- Älä jaa URL-linkkejä tuntemattomille
- Käytä pilvipalveluiden salasanasuojausta
- Poista vanhat kuvat säännöllisesti
- Varmuuskopioi tärkeät kuvat paikallisesti

---

## 📞 Tuki

Jos kohtaat ongelmia:
1. Lue tämä ohje uudelleen
2. Tarkista internet-yhteys
3. Yritä toista lataustapaa
4. Ota yhteyttä tukeen tai kehittäjään

---

**TaloSave** - Talon omistajan digitaalinen tietopankki  
© 2024-2026
