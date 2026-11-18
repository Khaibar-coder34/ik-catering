# Nog te configureren door de eigenaar

De applicatie bevat werkende pagina's, negen startgerechten en integratiecode voor formulieren. Accountgegevens en overige nog onbekende bedrijfsgegevens zijn niet ingevuld. Deze lijst beschrijft de laatste stappen voor echte verzending en online ingebruikname. Voor het aanpassen van gerechten en teksten gebruik je [CONTENT_GUIDE.md](CONTENT_GUIDE.md).

## Bedrijfsinformatie en inhoud

| Onderdeel | Bestand / instelling | Status bij oplevering |
| --- | --- | --- |
| Bedrijfsnaam | `src/data/site.json` → `name` | Indiase Keuken |
| E-mailadres | `src/data/site.json` → `email` | info@indiasekeuken.nl |
| Vestigingsplaats / werkgebied | `city`, `serviceArea` | Utrecht / provincie Utrecht; grotere opdrachten elders in overleg |
| Telefoonnummer | `phone` | 06 8487 5866, door de eigenaar aangeleverd |
| Straat + huisnummer | `address` | Herderplein 13, Utrecht, door de eigenaar aangeleverd |
| Postcode | `postalCode` | Leeg |
| KvK-nummer | `kvk` | Leeg |
| Btw-nummer | `vat` | Leeg |
| Socialmedia | `socials` | Lege lijst; alleen echte profiel-URL's toevoegen |
| Menu | `src/data/categories.json`, `src/data/dishes.json` | Negen ingevulde startgerechten, drie per categorie: hoofdgerechten, bijgerechten en nagerechten. Direct zichtbaar en selecteerbaar; omschrijvingen kunnen worden aangepast aan de eigen bereiding |
| Eigen fotografie | `public/images/` + bijbehorende inhoud | Illustratieve, gedocumenteerde stockbeelden aanwezig |
| Definitief logo | Woordmerkcomponent / `public/images/branding/` | Tijdelijk typografisch woordmerk |
| Privacypraktijk | Privacytekst in `src/data/content.json`, Resend en mailboxbeheer | Controleer verwerkingsafspraken, bewaarbeleid, contactgegevens en werkelijke processen vóór publicatie |

Onbekende gegevens blijven uit de interface. Vul uitsluitend feiten in die u kunt bevestigen. Aanvullende diensten zoals bediening en volledige schoonmaak staan niet in de aangeboden service.

De website richt zich op particulieren én bedrijven. Voor de B2B-pagina zijn nog geen concrete klantnamen of samenwerkingen bevestigd. Beschrijf daarom de uitnodiging tot samenwerking met zorginstellingen, bedrijven en overheidsorganisaties; claim geen bestaande opdrachten of relaties zonder onderbouwing.

## Technische inrichting

- [ ] GitHub-repository aanmaken of koppelen en productiebranch kiezen.
- [ ] Broncode, lockfile en documentatie pushen; geen geheimen of klantaanvragen committen.
- [ ] Netlify-project via de GitHub-koppeling aanmaken; `netlify.toml` controleren.
- [ ] Resend-account beheren, verzenddomein verifiëren en server-key instellen.
- [ ] `RESEND_FROM_EMAIL` op een geverifieerd afzenderadres instellen.
- [ ] Interne ontvanger bevestigen: `site.json` → `email` (nu `info@indiasekeuken.nl`) of een override via `NOTIFICATION_TO_EMAIL`.
- [ ] Cloudflare Turnstile-widget aanmaken; beide sleutels en juiste hostnames instellen.
- [ ] `ALLOW_UNPROTECTED_FORMS=false` behouden voor publieke productie.
- [ ] `NEXT_PUBLIC_SITE_URL` op de werkelijke Netlify-test-URL zetten en deployen.
- [ ] Offerteflow voor particulier en zakelijk doorlopen, met en zonder gerechtselectie; beide e-mails daadwerkelijk ontvangen en Reply-To controleren.
- [ ] Kort contactformulier op `/over-ons` en `/b2b` controleren met naam, e-mailadres, telefoonnummer en bericht.
- [ ] Gedrag bij afgewezen invoer, ongeldige botcontrole en mailproblemen controleren.
- [ ] Het ingevulde menu controleren en omschrijvingen/foto's waar nodig aanpassen aan de eigen bereiding. Voor normale inhoudscontrole `CATALOG_DEMO=false` gebruiken.
- [ ] `catering.indiasekeuken.nl` via CNAME koppelen; bestaand domein en mailrecords behouden.
- [ ] HTTPS controleren; publieke URL aanpassen en opnieuw deployen.
- [ ] Mobiele weergave, navigatie naar `/menu` en `/b2b`, oude doorverwijzingen, canonicals, sitemap, privacytekst en contactgegevens controleren.
- [ ] Gebruikslimieten en beschikbare waarschuwingen van Netlify/Resend opvolgen.

Zie [README.md](README.md) voor de concrete installatie-, beveiligings- en deploymentstappen en [CONTENT_GUIDE.md](CONTENT_GUIDE.md) voor inhoudsbeheer. Er is bij oplevering geen Netlify-site gepubliceerd, geen DNS-record gewijzigd en geen echte e-mail verstuurd zonder de accountconfiguratie van de eigenaar.
