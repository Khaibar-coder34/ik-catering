# Nog te configureren door de eigenaar

De bedrijfsgegevens en werkwijze zijn op 24 november 2026 door de eigenaar aangeleverd. Netlify, Resend en Cloudflare Turnstile zijn volgens de eigenaar ingericht; de mailbox staat bij STRATO. Deze accountinstellingen en echte aflevering zijn niet via deze lokale controles geverifieerd. Voor inhoudsbeheer gebruik je [CONTENT_GUIDE.md](CONTENT_GUIDE.md).

## Bedrijfsinformatie en inhoud

| Onderdeel | Bestand / instelling | Status bij oplevering |
| --- | --- | --- |
| Website / onderneming | `src/data/site.json` → `name`, `legalName`, `legalForm`, `foundedYear` | Indiase Keuken Catering, cateringafdeling van Indiase Keuken VOF; gestart in 2020 |
| E-mailadres | `src/data/site.json` → `email` | info@indiasekeuken.nl |
| Vestigingsplaats / werkgebied | `city`, `serviceArea` | Utrecht; grotere opdrachten elders in overleg. Geen bezorgkosten gepubliceerd |
| Telefoonnummer | `phone` | 06 2484 5749, definitief bevestigd op 23 november 2026 |
| Straat + huisnummer | `address` | Herderplein 13, Utrecht, door de eigenaar aangeleverd |
| Postcode | `postalCode` | 3533 BN |
| KvK-nummer | `kvk` | 83513817 |
| Btw-nummer | `vat` | NL862900487B01 |
| Bereikbaarheid | `content.json` → `contact` | Alle dagen behalve donderdag; bezoek alleen op afspraak. WhatsApp via hetzelfde telefoonnummer |
| Aanvraaggrenzen | `catering-settings.json` | Minimaal 15 personen, minimaal twee Amsterdam-kalenderdagen vooraf. Geen bedrijfsmatig maximum ingesteld |
| Betalen en annuleren | `content.json` → `quote.conditions` | Aanbetaling meestal 50%; annuleren minimaal 24 uur vóór de afgesproken catering: volledige aanbetaling terug; later: helft van de betaalde aanbetaling terug |
| Socialmedia | `socials` | Lege lijst; alleen echte profiel-URL's toevoegen |
| Menu | `src/data/categories.json`, `src/data/dishes.json` | Negen ingevulde startgerechten, drie per categorie: hoofdgerechten, bijgerechten en nagerechten. Direct zichtbaar en selecteerbaar; omschrijvingen kunnen worden aangepast aan de eigen bereiding |
| Eigen fotografie | `public/images/` + bijbehorende inhoud | Illustratieve, gedocumenteerde stockbeelden aanwezig |
| Definitief logo | `public/images/branding/indiase-keuken-logo.png` | Origineel aangeleverd logo in header en footer; overige foto's behouden |
| Gerechtlabels | `dishes.json` → `type`, `labels`; `dish-labels.json` | Standaard dieet-/gerechtlabel plus maximaal drie eigen labels; bestaande gerechten blijven door de eigenaar beheerd |
| Privacypraktijk | Privacytekst in `src/data/content.json`, Resend en mailboxbeheer | Gebaseerd op bevestigde werkwijze; concrete bewaartermijnen voor mailarchief/WhatsApp nog open |

De medewerker stelt het buffet op en levert de benodigde warmhoudmaterialen. Borden en bestek zijn optioneel tegen meerprijs. Ophalen en eventuele aanwezigheid tijdens de catering worden afgestemd. De website belooft geen algemene bediening of volledige schoonmaak.

De website richt zich op particulieren én bedrijven. B2B biedt catering, terugkerende maaltijdleveringen en overleg over maatwerk. Op verzoek worden geen klantnamen gepubliceerd.

## Privacy en opvolging

- Eigenaar en manager lezen aanvragen in de STRATO-mailbox en nemen contact op. De bezorger ontvangt alleen adres en telefoonnummer. De chef ontvangt allergie-informatie zonder namen; tijdelijke chefnotities worden na de opdracht verwijderd.
- Formulieren slaan geen aanvraag in een website-database of JSON op. E-mails, mailboxarchieven en de opslag van dienstverleners zijn wel gegevensopslag. Archiveren is geen verwijderen.
- **Nog te bepalen:** verwijdertermijnen vanaf afhandeling voor losse vragen, offertes zonder opdracht, overige opdrachtcorrespondentie en eventuele WhatsApp-kopieën. Daarna de paragraaf 'Bewaren en verwijderen' definitief maken en het mailarchief volgens die termijnen beheren. De website verwijdert geen STRATO- of WhatsApp-berichten automatisch.
- Feedback kan na een opdracht worden gevraagd; publicatie van een herkenbare review of samenwerking vereist afzonderlijke toestemming. Er is geen nieuwsbrief of bezoekersanalyse toegevoegd.
- Controleer de verwerkersafspraken in de gebruikte accounts, waaronder STRATO, en houd Resend open- en kliktracking uit. De code schakelt die domeininstellingen niet zelfstandig uit. Bij gebruik van WhatsApp gelden ook de voorwaarden van die dienst.
- Resend bewaart verzonden inhoud en logs in de VS, ook bij een Europese verzendregio. De actuele standaardtermijn is 30 dagen, met back-ups tot zeven dagen; een ander abonnement kan afwijken. [Resend GDPR](https://resend.com/security/gdpr)
- Er zijn drie afzonderlijke ontvangstbevestigingen: offerte, particulier contact en zakelijk contact. Er is geen automatische feedbackmail of publicatieverzoek toegevoegd.

## Technische inrichting

- [ ] GitHub-repository aanmaken of koppelen en productiebranch kiezen.
- [ ] Broncode, lockfile en documentatie pushen; geen geheimen of klantaanvragen committen.
- [ ] Netlify-project via de GitHub-koppeling aanmaken; `netlify.toml` controleren.
- [ ] Resend-account beheren, verzenddomein verifiëren en server-key instellen.
- [ ] `RESEND_FROM_EMAIL` op een geverifieerd afzenderadres instellen.
- [ ] Controleren dat de ingestelde interne ontvanger `info@indiasekeuken.nl` is. Een override via `NOTIFICATION_TO_EMAIL` mag niet onbedoeld afwijken van dit bevestigde adres.
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

Zie [README.md](README.md) voor de installatie-, beveiligings- en deploymentstappen en [CONTENT_GUIDE.md](CONTENT_GUIDE.md) voor inhoudsbeheer. De bovenstaande technische lijst is een verificatielijst voor de bestaande inrichting. Tijdens deze wijziging is niet gedeployd, zijn geen DNS-records gewijzigd en zijn geen echte e-mails verstuurd.
