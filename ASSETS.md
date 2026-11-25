# Afbeeldingen, lettertypen en rechten

Alle hieronder genoemde bestanden zijn lokaal opgeslagen. Bezoekers hoeven voor foto's en lettertypen geen externe beeldbank- of Google Fonts-verbinding op te bouwen. Het actuele menu gebruikt op verzoek AI-gegenereerde buffetbeelden. De sfeerfoto's op de overige pagina's zijn stockbeelden. Het zijn geen foto's van uitgevoerde opdrachten van Indiase Keuken; presentatie, garnering en porties kunnen afwijken van de uiteindelijke catering.

## Actuele buffetfoto's — 25 november 2026

Voor de veertien gerechten zijn veertien afzonderlijke beelden gegenereerd met de ingebouwde `image_gen`-tool. De namen en beschrijvingen uit het aangepaste menu vormden het uitgangspunt. Alle geselecteerde beelden tonen het betreffende gerecht in een grote roestvrijstalen buffetpan, met zachte natuurlijke belichting. Mix Sabzi staat één keer als vegan gerecht op het menu. De variantgroep naan deelt één foto van een assortiment naanbroden.

De geselecteerde originelen staan als PNG van 1536×1024 in `public/images/dishes/buffet/`. `dishes.json` verwijst naar die projectbestanden; de website is niet afhankelijk van de werkmap van de beeldgenerator. Next.js optimaliseert de afbeeldingen bij het aanbieden. De bestaande stockbestanden zijn behouden en niet overschreven.

| Bestand in `public/images/dishes/buffet/` | Gerecht |
| --- | --- |
| `butter-chicken.png` | Butter chicken |
| `chicken-korma.png` | Chicken Korma, volgens de opgegeven bereiding met kip en gele linzen in tomatencurry |
| `chicken-seekh-kebap.png` | Chicken Seekh Kebap |
| `lamb-tikka-masala.png` | Lamb Tikka Masala |
| `palak-paneer.png` | Palak Paneer |
| `mix-sabzi.png` | Mix Sabzi, vegan |
| `daal-aaloo-korma.png` | Daal Aaloo Korma |
| `vegetarische-biryani.png` | Vegetarische Biryani |
| `chicken-biryani.png` | Chicken Biryani met tandoorikip |
| `samosa-chaat.png` | Samosa Chaat met linzencurry en yoghurt |
| `naan-assortiment.png` | De verschillende naanvarianten |
| `samosa.png` | Samosa met aardappel en doperwten |
| `fruit-chaat.png` | Fruit Chaat |
| `gulab-jamun.png` | Gulab jamun |

De volledige gebruikte prompts, oorspronkelijke uitvoerpaden en projectbestemmingen staan in [buffet-meat-prompts.json](docs/buffet-meat-prompts.json), [buffet-vegetable-prompts.json](docs/buffet-vegetable-prompts.json) en [buffet-additional-prompts.json](docs/buffet-additional-prompts.json). Een extra, niet geselecteerde biryani-variant is uitsluitend in de promptregistratie vermeld en wordt niet door de website gebruikt. De menupagina vermeldt dat het AI-gegenereerde sfeerbeelden zijn; die toelichting staat in `menu-content.json` → `imageNote`.

De oorspronkelijke sfeerbeelden zijn gecontroleerd op 15 november 2026 en vallen onder de **Unsplash License**, niet onder Unsplash+. De negen gerechtfoto's zijn toegevoegd en gecontroleerd op 18 november 2026; hun bronnen en licenties staan hieronder afzonderlijk vermeld.

## Foto's

| Lokaal bestand | Fotograaf | Bronpagina | Onderwerp en gebruik |
| --- | --- | --- | --- |
| `public/images/catering/hero.webp` | LOLA AZIZADA | [Curry, rice and pita bread](https://unsplash.com/photos/a-bowl-of-curry-rice-and-pita-bread-LxkWpGMEwlM) | Bovenaanzicht van curry, gele rijst en brood; sfeerbeeld voor Indiase gerechten |
| `public/images/catering/table.webp` | Swipe (naam op de bronpagina) | [Buffet table with many plates of food](https://unsplash.com/photos/a-buffet-table-with-many-plates-of-food-on-it-QoH5d7E0jCk) | Buffetlijn in Hyderabad; uitsluitend inspiratie voor een opstelling, geen eigen locatie of personeel |
| `public/images/catering/spices.webp` | Deepak Adhikari | [Colorful spices in metal bowls](https://unsplash.com/photos/various-colorful-spices-arranged-in-metal-bowls-on-a-tray-SvM3z6WcYO8) | Masala-doos met specerijen; sfeerbeeld |
| `public/images/catering/event.webp` | Filip Rankovic Grobgaard | [Elegant table setting for a formal event](https://unsplash.com/photos/elegant-table-setting-for-a-formal-event-pa4S4aQs40o) | Gedekte evenementtafels; inspiratie, geen uitgevoerde opdracht |

Downloadlocaties voor reproduceerbaarheid:

- Hero: `https://images.unsplash.com/photo-1710091691780-c7eb0dc50cf8`
- Buffet: `https://images.unsplash.com/photo-1696940823960-ee5242bddc47`
- Specerijen: `https://images.unsplash.com/photo-1771541897176-44a3e01dc484`
- Evenement: `https://images.unsplash.com/photo-1768508948334-541161d1cb5c`

De [Unsplash License](https://unsplash.com/license) staat gratis commercieel gebruik en bewerking toe. Ongewijzigde foto's mogen niet als zelfstandig product worden verkocht; ook een concurrerende fotodatabank bouwen valt buiten deze toestemming. Naamsvermelding is niet verplicht, maar de bronvermelding blijft hier bewaard. Publicatie van deze foto's in de vormgeving impliceert geen samenwerking of aanbeveling door de fotografen of afgebeelde locaties.

Bestanden zijn verkleind en naar WebP omgezet met Sharp, kwaliteit 84. Er zijn geen personen toegevoegd of als medewerkers benoemd. De website kan voor een kader bijsnijden via CSS `object-fit`. Afmetingen: hero 1920×1280, buffet 1400×1867, specerijen 1400×934, evenement 1600×1067. Originele tijdelijke downloads zijn na optimalisatie verwijderd.

## Eerdere gerechtfoto's — behouden, toegevoegd op 18 november 2026

Alle negen bestanden staan onder `public/images/dishes/`. De afbeeldingen zijn visueel gecontroleerd op het bedoelde gerecht en dienen als illustratie van het startmenu. Het zijn echte stockfoto's, geen gegenereerde beelden. Namen, ingrediënten en werkelijk aanbod blijven inhoudelijk te beheren in `src/data/dishes.json`.

| Bestand | Fotograaf | Bronpagina | Licentie |
| --- | --- | --- | --- |
| `butter-chicken.webp` | shibani Mishra | [Butter chicken with rice and pappdam](https://unsplash.com/photos/a-bowl-of-red-curry-next-to-a-bowl-of-rice-and-a-bowl-of-soup-PPgBVHj0ecQ) | Unsplash License |
| `palak-paneer.webp` | Kanwardeep Kaur | [Palak Paneer — Cottage Cheese and Spinach Curry](https://unsplash.com/photos/sliced-cucumber-in-white-ceramic-bowl-jTv_cWxEtFs) | Unsplash License |
| `chana-masala.webp` | Nosh Caterers | [Chickpea curry in a serving pan](https://unsplash.com/photos/a-large-pot-of-food-on-a-table-XCL-jHI4BTU) | Unsplash License |
| `basmati.webp` | Audy of Course | [Cooked basmati rice in a white dish](https://www.pexels.com/photo/rice-in-a-dish-20500495/) | Pexels License |
| `naan.webp` | Rashpal Singh | [Naan](https://unsplash.com/photos/a-bowl-filled-with-pita-bread-and-a-fork-h7cZs0aFicw) | Unsplash License |
| `samosa.webp` | kabir cheema | [Samosas with green chili and pomegranate](https://unsplash.com/photos/samosas-with-green-chili-and-pomegranate-8T9AVksyt7s) | Unsplash License |
| `kheer.webp` | Deep Dasgupta | [Traditional Indian kheer in ceramic bowl](https://www.pexels.com/photo/traditional-indian-kheer-in-ceramic-bowl-31109623/) | Pexels License |
| `gulab-jamun.webp` | Anish Takke | [Gulab Jamun](https://unsplash.com/photos/a-red-bowl-filled-with-oranges-on-top-of-a-table-wZjJYDw39o4) | Unsplash License |
| `mango-kulfi.webp` | kuldeepnegibombay | [Mango Kulfi](https://pixabay.com/photos/mango-kulfi-dessert-ice-cream-5549586/) | Pixabay Content License |

De bronpagina's kunnen automatisch gegenereerde, onnauwkeurige URL-titels hebben. De omschrijving van de fotograaf en de afbeelding zelf zijn daarom gecontroleerd: de palak-paneerfoto toont bijvoorbeeld kaas in spinaziecurry en geen kom komkommer; de gulab-jamunfoto toont het dessert en geen sinaasappels.

De [Unsplash License](https://unsplash.com/license), [Pexels License](https://www.pexels.com/license/) en [Pixabay Content License](https://pixabay.com/service/license-summary/) staan gebruik in deze website en beeldbewerking toe zonder verplichte naamsvermelding. Bron en auteur blijven hier bewaard. Verkoop of verspreid de foto's niet als losse stockproducten en suggereer geen aanbeveling door de fotografen of beeldbanken.

Directe downloadlocaties voor reproduceerbaarheid:

- Butter chicken: `https://images.unsplash.com/photo-1707448829764-9474458021ed`
- Palak paneer: `https://images.unsplash.com/photo-1589647363585-f4a7d3877b10`
- Chana masala: `https://images.unsplash.com/photo-1736680056470-948527554276`
- Basmatirijst: `https://images.pexels.com/photos/20500495/pexels-photo-20500495.jpeg`
- Naan: `https://images.unsplash.com/photo-1697155406014-04dc649b0953`
- Samosa: `https://images.unsplash.com/photo-1601050690597-df0568f70950`
- Kheer: `https://images.pexels.com/photos/31109623/pexels-photo-31109623.jpeg`
- Gulab jamun: `https://images.unsplash.com/photo-1681476747916-8a8fc7e2001e`
- Mango-kulfi: `https://cdn.pixabay.com/photo/2020/09/06/17/23/mango-5549586_1280.jpg`

Optimalisatie: Sharp, automatische EXIF-rotatie, breedte 900 px zonder opschalen, WebP-kwaliteit 84. Verhoudingen blijven behouden; `object-fit: cover` bepaalt de uitsnede in de website. De negen bestanden zijn samen circa 717 KiB. Er zijn geen watermerken verwijderd en geen personen, merken of gerechten toegevoegd.

## Lettertypen

De huidige website gebruikt **Manrope** voor zowel koppen als gewone tekst. De eerder opgenomen Cormorant Garamond-bestanden blijven met hun licentie in de repository aanwezig, maar worden niet meer als actief websitelettertype ingeladen.

| Bestand | Familie / bereik | Bron | Licentie |
| --- | --- | --- | --- |
| `public/fonts/cormorant-garamond-latin-variable.woff2` | Cormorant Garamond, normaal 300–700 | [Google Fonts-bron](https://github.com/google/fonts/tree/main/ofl/cormorantgaramond) | SIL Open Font License 1.1 |
| `public/fonts/cormorant-garamond-latin-italic-variable.woff2` | Cormorant Garamond, cursief 300–700 | [Google Fonts-bron](https://github.com/google/fonts/tree/main/ofl/cormorantgaramond) | SIL Open Font License 1.1 |
| `public/fonts/manrope-latin-variable.woff2` | Manrope, normaal 200–800 | [Google Fonts-bron](https://github.com/google/fonts/tree/main/ofl/manrope) | SIL Open Font License 1.1 |

WOFF2-bestanden zijn de Latin-subsets die de officiële Google Fonts CSS-service verstrekt. Downloadlocaties:

- `https://fonts.gstatic.com/s/cormorantgaramond/v21/co3bmX5slCNuHLi8bLeY9MK7whWMhyjYqXtK.woff2`
- `https://fonts.gstatic.com/s/cormorantgaramond/v21/co3ZmX5slCNuHLi8bLeY9MK7whWMhyjYrEtImSo.woff2`
- `https://fonts.gstatic.com/s/manrope/v23/xn7gYHE41ni1AdIRggexSg.woff2`

Copyright Cormorant: © 2015 the Cormorant Project Authors. Copyright Manrope: © 2018 The Manrope Project Authors. Volledige originele licenties zijn meegeleverd als `public/fonts/OFL-CormorantGaramond.txt` en `public/fonts/OFL-Manrope.txt`. Behoud deze bestanden bij herdistributie. De bestanden zijn alleen gedownload; de fontsoftware is niet aangepast.

## Logo en iconen

De eigenaar heeft op 24 november 2026 `Indiase Keuken Culinary Logo.png` aangeleverd voor gebruik op deze cateringwebsite. Het originele bestand staat ongewijzigd in `public/images/branding/indiase-keuken-logo.png`. De header en footer tonen dit logo met de aanduiding Catering. Next.js verzorgt de beeldoptimalisatie bij het aanbieden; er is geen nieuwe logo-illustratie gemaakt. Vervang het bronbestand alleen door een door de eigenaar goedgekeurd logo. De zichtbare aanduiding staat in `site.json` → `ui.brandCaption`.

De interface gebruikt Lucide-iconen uit `lucide-react`; de [Lucide-licentie](https://lucide.dev/license) is ISC. De toepasselijke licentietekst wordt met het npm-pakket geleverd.

`public/images/branding/social-preview.svg` en `apple-touch-icon.svg` zijn originele, eenvoudige vectorcomposities voor deze website. Zij gebruiken de merknaam, een eigen geometrisch ornament en systeemlettertypen; er is geen beeld van een derde partij verwerkt. De bijbehorende exports `social-preview.jpg` (1200×630) en `apple-touch-icon.png` (180×180) zijn met Sharp uit deze bronbestanden gemaakt. De social preview is op 17 november 2026 aangepast naar “Indiase catering” voor particulieren en bedrijven, met schreefloze tekst. Het Apple-icoon is een afzonderlijk statisch monogram. Bij een merkupdate kunnen de SVG-bronnen worden aangepast en opnieuw geëxporteerd.

## Nieuwe assets toevoegen

Leg bron, auteur, exacte licentie en datum vast voordat een afbeelding wordt gepubliceerd. Controleer daarnaast herkenbare personen, merken en locaties; een fotolicentie is geen algemene toestemming om een zakelijke relatie te suggereren. Vervang stockfoto's bij voorkeur door eigen, goedgekeurde fotografie van het werkelijke aanbod. Pas bij een vervanging ook alt-tekst en het eventuele onderschrift aan.
