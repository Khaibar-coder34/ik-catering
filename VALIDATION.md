# Oplevercontrole

Gecontroleerd op 18 november 2026 met Node.js 24, Next.js 16.4.6 en Microsoft Edge op Windows. De huidige versie bevat negen startgerechten met foto's en centraal beheerde bedrijfsteksten voor particulieren én bedrijven.

## Uitgevoerde controles

| Controle | Resultaat |
| --- | --- |
| `npm run lint` | Geslaagd, zonder waarschuwingen |
| `npm run typecheck` | Geslaagd |
| `npm test` | 42 tests geslaagd, inclusief drie controles op centrale bedrijfsgegevens |
| `npm run build` | Productiebuild geslaagd met Webpack |
| Playwright | Alle 35 scenario's geslaagd in één run met `E2E_CATALOG_DEMO=false`, dus met de negen gepubliceerde gerechten |
| Toegankelijkheid | Zes axe-scans zonder overtredingen van de geselecteerde WCAG A/AA-regels |
| Mobiel | Alle zes pagina's gecontroleerd op 390 en 320 px zonder horizontale overflow |
| Productiecontrole | Negen gerechten, drie per categorie, alle negen foto's geladen, selectie werkt, privacygegevens ingevuld; geen browserfouten |
| Visuele controle | Gevuld menu op desktop en compacte gerechtselectie op mobiel; eerdere algemene pagina- en formuliercontroles behouden |
| `git diff --check` | Geen whitespacefouten; alleen Git-meldingen over LF/CRLF |

De volledige browserrun gebruikt nu op verzoek de gepubliceerde catalogus. Naast de bestaande formulier- en navigatiescenario's controleert de suite dat iedere gekoppelde gerechtfoto daadwerkelijk laadt, zonder vervangend beeldvlak. De afzonderlijke demonstratiecatalogus blijft beschikbaar als standaard testfixture.

De gecontroleerde publieke routes zijn `/`, `/menu`, `/over-ons`, `/b2b`, `/offerte` en `/privacy`. Oude links geven HTTP 308 naar de passende nieuwe pagina. Alleen de zes publieke routes staan in de sitemap.

## Gecontroleerd gedrag

- Navigatie: Home, Menu, Over ons, B2B en Offerte aanvragen; mobiel menu werkt met toetsenbord en Escape.
- Menu: precies Hoofdgerechten, Bijgerechten en Nagerechten. Elke productkaart heeft uitsluitend foto, naam en beschrijving; de gemeten verhoudingen zijn 60%, 20% en 20%.
- Offerte: compacte gerechtselectie met checkboxes, kleine foto's en namen. Zonder selectie doorgaan werkt. Keuzes blijven behouden tijdens navigatie en herladen binnen dezelfde sessie.
- Beide offertestappen blijven gemount. Terug/Volgende bewaart naam, e-mail, datum, aantal personen, radiokeuzes en privacyakkoord.
- Particulier en Zakelijk gebruiken dezelfde verplichte gegevens. Datum, positief geheel aantal personen, expliciete servieskeuze en privacyakkoord worden gecontroleerd.
- Contactformulieren op Over ons en B2B vragen naam, e-mail, telefoon en bericht. De doelgroep komt correct in het bericht terecht. Contact bevat geen afzonderlijke toestemmingscheckbox of onjuiste toestemmingsclaim.
- E-mailfouten behouden invoer; dubbele klikken en retries gebruiken een stabiel aanvraagnummer. Ontvangst wordt niet voorgewend bij een mislukte interne verzending.
- Herderplein 13, Utrecht en 0684875866 staan op de contactpagina's. Het telefoonnummer is aanklikbaar.
- Productie toont de negen aangevraagde startgerechten met illustratieve stockfoto's en geen ontwikkelbanner. Aanvragen zonder gerechtkeuze blijft mogelijk.
- Een wijziging van `site.json` werkt door in privacytekst, formulierfouten, e-mailteksten, standaard mailontvanger en afzendernaam. Technische omgevingsvariabelen kunnen de ontvanger en publieke URL expliciet overschrijven.
- Home- en Over-ons-foto's zijn via `content.json` instelbaar. Overbodige, niet gebruikte gegevensbestanden voor FAQ en paginalabels zijn verwijderd.
- `CONTENT_GUIDE.md`, `README.md`, `CONFIGURATION.md` en `ASSETS.md` zijn bijgewerkt voor het gevulde menu, inhoudsbeheer en de nieuwe fotoverantwoording.

## Grenzen van de verificatie

Het e-mailtransport is in tests nagebootst. Er zijn geen echte e-mails verstuurd, geen externe accounts ingericht, geen DNS-records gewijzigd en geen Netlify-deployment uitgevoerd. Resend-domeinverificatie, aflevering in beide mailboxen, de live Turnstile-widget en de uiteindelijke Netlify-runtime vereisen de eigenaarinstellingen volgens `README.md` en `CONFIGURATION.md`.

Zonder de vereiste mail- en beveiligingsconfiguratie weigert de applicatie verzending met een begrijpelijke melding. De extra IP-begrenzer is per serverinstantie en geen gedistribueerde beveiliging. Geautomatiseerde toegankelijkheidscontrole is geen formele certificering. De startgerechten zijn op verzoek ingevuld; omschrijvingen kunnen via `dishes.json` worden aangepast aan de eigen bereiding. De foto's zijn illustratief en kunnen door eigen fotografie worden vervangen.

## Afhankelijkheden

Bij de controle van 16 november rapporteerde `npm audit --omit=dev` geen bekende kwetsbaarheden. De volledige audit meldde matige kwetsbaarheden in de ontwikkelketen `typescript-eslint` → `minimatch` ([GHSA-g3hv-75wg-m249](https://github.com/advisories/GHSA-g3hv-75wg-m249)). De toen beschikbare compatibele correctie loste die nog niet op. Deze afhankelijkheden zijn bij de vereenvoudiging niet gewijzigd. Controleer bij onderhoud opnieuw op updates.
