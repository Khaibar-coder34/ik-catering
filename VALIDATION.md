# Oplevercontrole

Gecontroleerd op 24 november 2026 met Node.js 24, Next.js 16.4.6 en Microsoft Edge op Windows. De website bevat de aangeleverde bedrijfsgegevens, het officiële logo, teksten met je/jouw, drie afzonderlijke bevestigingsmails en de aanvraaggrenzen van minimaal 15 personen en twee kalenderdagen voorbereidingstijd. De gerechten en overige foto's zijn behouden. De volledige browsersuite is opnieuw uitgevoerd.

## Uitgevoerde controles

| Controle | Resultaat |
| --- | --- |
| `npm run lint` | Geslaagd, zonder waarschuwingen |
| `npm run typecheck` | Geslaagd |
| `npm test` | 48 tests geslaagd, inclusief centrale bedrijfsgegevens, minimumgroep, datumgrenzen rond zomertijd/jaarwisseling en drie e-mailvarianten |
| `npm run build` | Productiebuild geslaagd met Webpack |
| Playwright | Alle 35 scenario's geslaagd met `E2E_CATALOG_DEMO=false`, dus met de negen gepubliceerde gerechten |
| Toegankelijkheid | Zes axe-scans zonder overtredingen van de geselecteerde WCAG A/AA-regels |
| Mobiel | Alle zes pagina's gecontroleerd op 390 en 320 px zonder horizontale overflow |
| Kaartweergave | Negen foto's geladen; labels zichtbaar en toegankelijk; verhoudingen 60/20/20 en geen afgeknipte inhoud op 320, 768 en 1280 px |
| Visuele controle | Homepage met nieuw logo beoordeeld op desktop (1280 px) en mobiel (390 px); oorspronkelijke logo en sfeerfoto behouden |
| Bestaande lokale preview | HTTP 200 op poort 3000; nieuwe merknaam, logo en minimumgroep in de geleverde pagina bevestigd |
| `git diff --check` | Geen whitespacefouten; alleen Git-meldingen over LF/CRLF |

De browsercontroles gebruiken op verzoek de gepubliceerde catalogus. Naast de bestaande formulier- en navigatiescenario's controleert de suite dat iedere gekoppelde gerechtfoto daadwerkelijk laadt, zonder vervangend beeldvlak. De afzonderlijke demonstratiecatalogus blijft beschikbaar als standaard testfixture.

De gecontroleerde publieke routes zijn `/`, `/menu`, `/over-ons`, `/b2b`, `/offerte` en `/privacy`. Oude links geven HTTP 308 naar de passende nieuwe pagina. Alleen de zes publieke routes staan in de sitemap.

## Gecontroleerd gedrag

- Navigatie: Home, Menu, Over ons, B2B en Offerte aanvragen; mobiel menu werkt met toetsenbord en Escape.
- Menu: precies Hoofdgerechten, Bijgerechten en Nagerechten. Elke productkaart heeft foto, naam met labels en beschrijving; de gemeten verhoudingen zijn 60%, 20% en 20%. De kaart kan groeien om langere inhoud te tonen.
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
- Productie toont de negen aangevraagde startgerechten met illustratieve stockfoto's en geen ontwikkelbanner. Aanvragen zonder gerechtkeuze blijft mogelijk.
- Een wijziging van `site.json` werkt door in privacytekst, formulierfouten, e-mailteksten, standaard mailontvanger en afzendernaam. Technische omgevingsvariabelen kunnen de ontvanger en publieke URL expliciet overschrijven.
- Home- en Over-ons-foto's zijn via `content.json` instelbaar. Overbodige, niet gebruikte gegevensbestanden voor FAQ en paginalabels zijn verwijderd.
- `CONTENT_GUIDE.md`, `README.md`, `CONFIGURATION.md` en `ASSETS.md` zijn bijgewerkt voor bedrijfsgegevens, logo, instellingen, e-mailvarianten en de resterende bewaartermijnvraag.

## Grenzen van de verificatie

Het e-mailtransport is in tests nagebootst. Er zijn geen echte e-mails verstuurd, geen externe accounts ingericht, geen DNS-records gewijzigd en geen Netlify-deployment uitgevoerd. Netlify, Resend en Turnstile zijn volgens de eigenaar geconfigureerd. Resend-domeinverificatie, aflevering in beide mailboxen, de live Turnstile-widget en de uiteindelijke Netlify-runtime zijn niet door deze lokale tests geverifieerd.

De privacytekst is aangepast aan de bevestigde onderneming, STRATO-mailbox, eigenaar/manager, beperkte gegevens voor de bezorger, allergie-informatie zonder namen voor de chef, feedback en toestemming voor publicatie. De tekst onderscheidt het ontbreken van een website-database van daadwerkelijke mailopslag. **Alleen de concrete bewaartermijnen voor eigen correspondentie en WhatsApp zijn inhoudelijk nog open.** Het beleid is op dat punt niet definitief; ook verwijdering uit het mailarchief moet praktisch worden ingericht. Providerinformatie is gecontroleerd aan officiële bronnen, maar accountinstellingen zoals Resend-tracking en verwerkersafspraken zijn niet ingezien.

Zonder de vereiste mail- en beveiligingsconfiguratie weigert de applicatie verzending met een begrijpelijke melding. De extra IP-begrenzer is per serverinstantie en geen gedistribueerde beveiliging. Geautomatiseerde toegankelijkheidscontrole is geen formele certificering. De startgerechten zijn op verzoek ingevuld; omschrijvingen kunnen via `dishes.json` worden aangepast aan de eigen bereiding. De foto's zijn illustratief en kunnen door eigen fotografie worden vervangen.

## Afhankelijkheden

Bij de controle van 16 november rapporteerde `npm audit --omit=dev` geen bekende kwetsbaarheden. De volledige audit meldde matige kwetsbaarheden in de ontwikkelketen `typescript-eslint` → `minimatch` ([GHSA-g3hv-75wg-m249](https://github.com/advisories/GHSA-g3hv-75wg-m249)). De toen beschikbare compatibele correctie loste die nog niet op. Deze afhankelijkheden zijn bij de vereenvoudiging niet gewijzigd. Controleer bij onderhoud opnieuw op updates.
