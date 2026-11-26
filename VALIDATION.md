# Oplevercontrole

Gecontroleerd op 26 november 2026 met Node.js 24, Next.js 16.4.6 en Microsoft Edge op Windows. De vormgeving gebruikt nu één lokaal gehoste letterfamilie, Source Sans 3, met grotere tekst en consistente knoppen, kaarten en formulieren. Desktop, tablet en mobiel hebben passende kolommen en witruimte. De veertien gerechten, vier categorieën, foto's, bedrijfsgegevens en formulierwerking zijn behouden; Mix Sabzi blijft één keer vegan vermeld.

## Uitgevoerde controles

Aanvullende controle op 26 november: de zin onder “Ons menu” is verwijderd en de afstanden onder de navigatie, tussen kop en inhoud en rond categoriekoppen zijn verkleind. Typecheck en diffcheck slagen. De menupagina is opnieuw visueel gecontroleerd op 1280 en 390 px: geen lege introductie-alinea, kop zichtbaar onder de header en geen horizontale overflow. De onderstaande volledige suite betreft de voorafgaande vormgevingsronde.

| Controle | Resultaat |
| --- | --- |
| `npm run lint` | Laatst geslaagd op 25 november; niet opnieuw uitgevoerd voor deze vormgevingsronde |
| `npm run typecheck` | Geslaagd |
| `npm test` | 50 tests geslaagd, inclusief catalogus, niet-publieke redactienotities, centrale bedrijfsgegevens, minimumgroep, datumgrenzen en drie e-mailvarianten |
| `npm run build` | Productiebuild geslaagd met Webpack; aparte `.next-e2e`-uitvoermap om de actieve preview te behouden |
| Playwright | Alle 35 scenario's geslaagd met `E2E_CATALOG_DEMO=false` en de veertien gepubliceerde gerechten |
| Toegankelijkheid | Zes axe-scans zonder overtredingen van de geselecteerde WCAG A/AA-regels |
| Schermbreedtes | Alle zes pagina's gecontroleerd op 320, 390, 768, 1024 en 1440 px zonder horizontale overflow; mobiele navigatie en offerte stap 2 ook in de browsersuite |
| Kaartweergave | Veertien foto's geladen; labels zichtbaar en toegankelijk; verhoudingen 60/20/20 en geen afgeknipte inhoud op 320, 768 en 1280 px |
| Visuele controle | Home, menu, B2B en offerteformulier beoordeeld op desktop en mobiel; lange naan-naam, label, beschrijving en buffetfoto volledig zichtbaar op 320 px |
| Typografie en bediening | Lokaal Source Sans 3; gewone tekst 18 px op desktop en 17 px op mobiel, invoervelden 17 px; menuknop 44×44 px en ruimere actieknoppen |
| Lokale preview | Bijgewerkte pagina's op poort 3000 succesvol geladen voor de visuele controle |
| `git diff --check` | Geen whitespacefouten; alleen Git-meldingen over LF/CRLF |

De browsercontroles gebruiken de gepubliceerde catalogus. Naast de bestaande formulier- en navigatiescenario's controleert de suite de categorievolgorde, toelichtingen, directe categorielinks en het daadwerkelijk laden van iedere gekoppelde gerechtfoto, zonder vervangend beeldvlak. De afzonderlijke demonstratiecatalogus blijft beschikbaar als standaard testfixture.

De gecontroleerde publieke routes zijn `/`, `/menu`, `/over-ons`, `/b2b`, `/offerte` en `/privacy`. Oude links geven HTTP 308 naar de passende nieuwe pagina. Alleen de zes publieke routes staan in de sitemap.

## Gecontroleerd gedrag

- Navigatie: Home, Menu, Over ons, B2B en Offerte aanvragen; mobiel menu werkt met toetsenbord en Escape.
- Vormgeving: introducties stapelen op tablet bij 860 px, menukaarten gaan van drie naar twee naar één kolom. Offerte- en privacykoppen lijnen uit met hun inhoud. De mobiele footer en offerteacties breken leesbaar om.
- Categorienavigatie: links boven het menu worden afgeleid uit de gepubliceerde categorieën en springen naar de bestaande koppen, met ruimte voor de vaste header.
- Menu: Hoofdgerechten, Biryani Gerechten, Bijgerechten en Nagerechten, in die volgorde. Iedere categorie toont haar bewerkbare `description` onder de kop; een lege tekst wordt weggelaten. Elke productkaart heeft foto, naam met labels en beschrijving; de gemeten verhoudingen zijn 60%, 20% en 20%. De kaart kan groeien om langere inhoud te tonen.
- Redactiehulp: optionele `_comment`-velden in gerechten en categorieën worden bij het inlezen verwijderd. Notities verschijnen niet op de website of in de publieke catalogusgegevens. De bestanden blijven geldige JSON.
- Labels: bestaande `type` geeft Vegetarisch, Vegan, Vleesgerecht of Visgerecht. Optionele `labels` voegen maximaal drie eigen labels van maximaal 18 tekens toe. De standaardnamen staan centraal in `src/data/dish-labels.json`; bestaande gerechtgegevens zijn niet vervangen.
- Offerte: compacte gerechtselectie met checkboxes, kleine foto's, namen en labels. Checkboxnamen blijven de gerechtnaam, met de labels als toegankelijke beschrijving. Zonder selectie doorgaan werkt. Keuzes blijven behouden tijdens navigatie en herladen binnen dezelfde sessie.
- Beide offertestappen blijven gemount. Terug/Volgende bewaart naam, e-mail, datum, aantal personen, radiokeuzes en kennisname van het privacybeleid.
- Particulier en Zakelijk gebruiken dezelfde verplichte gegevens. Minimaal 15 personen, minimaal twee Amsterdam-kalenderdagen vooraf, expliciete servieskeuze en kennisname van het privacybeleid worden in browser en server gecontroleerd. Er is geen bedrijfsmatig maximum voor groepsgrootte; invoer moet wel een veilig geheel getal zijn.
- De datumgrens wordt tijdens gebruik ververst; daggrens, zomer-/wintertijd en jaarwisseling zijn gecontroleerd. De offerte blijft een aanvraag, geen automatische bestelling.
- Bij de offerte staat een uitklapbare toelichting op betaling, wijzigingen en annuleren. Minimaal 24 uur vooraf: volledige aanbetaling terug; later: helft van de betaalde aanbetaling terug.
- Contactformulieren op Over ons en B2B vragen naam, e-mail, telefoon en bericht. De doelgroep komt correct in het bericht terecht. Contact bevat geen afzonderlijke toestemmingscheckbox of onjuiste toestemmingsclaim.
- E-mailfouten behouden invoer; dubbele klikken en retries gebruiken een stabiel aanvraagnummer. Ontvangst wordt niet voorgewend bij een mislukte interne verzending.
- Offerte, particulier contact en zakelijk contact hebben verschillende onderwerpen, koppen en bevestigingsteksten. Contactmails suggereren geen bestelling of geregistreerd privacyakkoord. De e-mails gebruiken een eenvoudig schreefloos lettertype.
- Herderplein 13, 3533 BN Utrecht en 0624845749 staan op de contactpagina's. Telefoon, e-mail en WhatsApp zijn aanklikbaar. Bereikbaarheid behalve donderdag en bezoek alleen op afspraak zijn zichtbaar. KvK en btw-id staan in de footer.
- Productie toont veertien gerechten met elk een eigen buffetfoto: zeven hoofdgerechten, twee biryani-gerechten, drie bijgerechten en twee nagerechten. Mix Sabzi staat één keer als vegan vermeld. Een optionele fototoelichting wordt beheerd via `menu-content.json` → `imageNote`; de huidige lege tekst is behouden. Aanvragen zonder gerechtkeuze blijft mogelijk.
- Een wijziging van `site.json` werkt door in privacytekst, formulierfouten, e-mailteksten, standaard mailontvanger en afzendernaam. Technische omgevingsvariabelen kunnen de ontvanger en publieke URL expliciet overschrijven.
- Home- en Over-ons-foto's zijn via `content.json` instelbaar. Overbodige, niet gebruikte gegevensbestanden voor FAQ en paginalabels zijn verwijderd.
- `CONTENT_GUIDE.md`, `README.md`, `CONFIGURATION.md` en `ASSETS.md` zijn bijgewerkt voor de vier categorieën, bewerkbare categorie-intro's, redactienotities en buffetbeelden. De exacte gebruikte prompts en beeldbestemmingen zijn vastgelegd in drie JSON-bestanden onder `docs/`.

## Grenzen van de verificatie

Het e-mailtransport is in tests nagebootst. Er zijn geen echte e-mails verstuurd, geen externe accounts ingericht, geen DNS-records gewijzigd en geen Netlify-deployment uitgevoerd. Netlify, Resend en Turnstile zijn volgens de eigenaar geconfigureerd. Resend-domeinverificatie, aflevering in beide mailboxen, de live Turnstile-widget en de uiteindelijke Netlify-runtime zijn niet door deze lokale tests geverifieerd.

De privacytekst is aangepast aan de bevestigde onderneming, STRATO-mailbox, eigenaar/manager, beperkte gegevens voor de bezorger, allergie-informatie zonder namen voor de chef, feedback en toestemming voor publicatie. De tekst onderscheidt het ontbreken van een website-database van daadwerkelijke mailopslag. **Alleen de concrete bewaartermijnen voor eigen correspondentie en WhatsApp zijn inhoudelijk nog open.** Het beleid is op dat punt niet definitief; ook verwijdering uit het mailarchief moet praktisch worden ingericht. Providerinformatie is gecontroleerd aan officiële bronnen, maar accountinstellingen zoals Resend-tracking en verwerkersafspraken zijn niet ingezien.

Zonder de vereiste mail- en beveiligingsconfiguratie weigert de applicatie verzending met een begrijpelijke melding. De extra IP-begrenzer is per serverinstantie en geen gedistribueerde beveiliging. Geautomatiseerde toegankelijkheidscontrole is geen formele certificering. De eigenaar beheert gerechten en omschrijvingen via `dishes.json`. De gegenereerde foto's zijn illustratief en kunnen door eigen fotografie worden vervangen.

## Afhankelijkheden

Bij de controle van 16 november rapporteerde `npm audit --omit=dev` geen bekende kwetsbaarheden. De volledige audit meldde matige kwetsbaarheden in de ontwikkelketen `typescript-eslint` → `minimatch` ([GHSA-g3hv-75wg-m249](https://github.com/advisories/GHSA-g3hv-75wg-m249)). De toen beschikbare compatibele correctie loste die nog niet op. Deze afhankelijkheden zijn bij de vereenvoudiging niet gewijzigd. Controleer bij onderhoud opnieuw op updates.
