# Indiase Keuken Catering

Nederlandstalige website voor Indiase catering aan particulieren en bedrijven in Utrecht en omgeving. De applicatie gebruikt Next.js App Router, TypeScript strict, Tailwind CSS, Motion, Zod, Lucide en de officiële Resend SDK. De inhoud staat in JSON in deze repository; er is geen database, accountomgeving, CMS of betaalfunctie. De vormgeving gebruikt lokaal gehoste Manrope voor koppen en gewone tekst.

**Gerechten, bedrijfsteksten of contactgegevens aanpassen?** Begin bij [CONTENT_GUIDE.md](CONTENT_GUIDE.md). Daar staat per onderdeel welk JSON-bestand en welk veld je kunt wijzigen, inclusief een compleet gerechtvoorbeeld en instructies voor foto's. Voor dagelijks inhoudsbeheer hoef je geen applicatiecode aan te passen.

## Lokaal starten

Benodigd: Node.js 24 LTS en npm. Gebruik de vastgelegde versies in `package-lock.json`.

```sh
npm ci
```

Kopieer `.env.example` naar `.env.local` en vul alleen de instellingen in die u heeft. In PowerShell:

```powershell
Copy-Item .env.example .env.local
```

```sh
npm run dev
```

Open de lokale URL die Next.js afdrukt, doorgaans `http://localhost:3000`. Zonder Resend-configuratie blijft de website bruikbaar; formulieren melden eerlijk dat verzending niet beschikbaar is. Er wordt geen schijnsucces getoond.

De scripts voor ontwikkeling en productie gebruiken expliciet Webpack (`next dev --webpack` en `next build --webpack`). Tailwind wordt via `@tailwindcss/postcss` verwerkt. Gebruik daarom de npm-scripts, zodat lokaal en op Netlify dezelfde buildconfiguratie wordt toegepast. Lettertypen en afbeeldingen zijn lokaal aanwezig; de build hoeft geen Google Fonts-bestanden op te halen.

Het menu bevat negen startgerechten: drie hoofdgerechten, drie bijgerechten en drie nagerechten. Ze staan in `src/data/dishes.json`, verschijnen in het menu en zijn direct selecteerbaar in de offerte. Het veld `type` toont automatisch een label zoals Vegetarisch, Vegan, Vleesgerecht of Visgerecht; met `labels` voegt u maximaal drie korte eigen labels toe. De standaard labelteksten staan in `src/data/dish-labels.json`. Houd voor normaal inhoudsbeheer `CATALOG_DEMO=false`. Met `CATALOG_DEMO=true` wordt **uitsluitend lokaal** een afzonderlijke testcatalogus geladen; daardoor ziet u wijzigingen in de gewone gerechtenlijst niet. Een productiebuild negeert deze instelling. Beheer gerechten en foto's volgens [CONTENT_GUIDE.md](CONTENT_GUIDE.md).

## Controles

```sh
npm run lint
npm run typecheck
npm test
npm run build
npm run start
```

De geautomatiseerde tests gebruiken nagebootste e-mailafhankelijkheden en versturen geen berichten. Ze controleren onder meer catalogusvalidatie, selectie, formuliervereisten, ontsnapping van gebruikersinvoer en de volgorde en foutafhandeling bij verzending. De productiebuild valideert de geïmporteerde catalogus opnieuw. De actuele uitvoerstatus staat in [VALIDATION.md](VALIDATION.md).

Voer de browsercontroles apart uit:

```sh
npm run test:e2e
```

Playwright gebruikt op Windows standaard de geïnstalleerde Microsoft Edge. Op andere systemen gebruikt het Chromium; installeer die browser zo nodig met `npx playwright install chromium` (Linux CI: `npx playwright install --with-deps chromium`). Met `PLAYWRIGHT_CHANNEL` kunt u de browserkeuze overschrijven. De configuratie start zelf een ontwikkelserver op poort 3100, met een aparte `.next-e2e`-buildmap en de duidelijk gemarkeerde demonstratiecatalogus. Houd die poort vrij. E-mail- en Turnstile-sleutels worden voor deze testserver bewust leeggemaakt; de tests versturen geen echte aanvragen. De gewone GitHub CI voert de browsercontroles niet uit.

Om ook de gewone gerechtenlijst en de bijbehorende afbeeldingen te controleren, kunt u de browsercontroles in PowerShell tegen de gepubliceerde catalogus uitvoeren:

```powershell
$env:E2E_CATALOG_DEMO = "false"
npm run test:e2e
Remove-Item Env:E2E_CATALOG_DEMO
```

Zonder deze tijdelijke instelling gebruikt de browsersuite de afzonderlijke testcatalogus. `E2E_CATALOG_DEMO` is een testinstelling; de gewone website gebruikt `CATALOG_DEMO`.

De GitHub Actions-workflow voert lint, types, tests en build uit bij pushes en pull requests. De workflow deployt niet zelfstandig; Netlify verzorgt deployments via zijn GitHub-koppeling. Stel branchbescherming in als alleen goedgekeurde, geslaagde wijzigingen naar de productiebranch mogen.

## Structuur

```text
app/                         App Router-pagina's, metadata en API-route
  api/aanvragen/route.ts      Server-side verwerking van alle formulieren
src/
  components/                Gedeelde UI, menu, selectie en formulieren
  data/                      Gepubliceerde inhoud en centrale configuratie
    demo/                    Alleen expliciete lokale demonstratiegegevens
  emails/                    HTML- en tekstversies van e-mails
  lib/                       Catalogus, validatie en serverfunctionaliteit
public/
  fonts/                     Lokaal gehoste WOFF2-fonts en OFL-licenties
  images/                    Lokale geoptimaliseerde WebP-afbeeldingen
tests/                       Geautomatiseerde controles
```

De hoofdpagina's zijn `/`, `/menu`, `/over-ons`, `/b2b` en `/offerte`. Daarnaast zijn er `/privacy` en een 404-pagina. Oude pagina-URL's worden doorverwezen naar een passende nieuwe pagina. Er is geen aparte publieke arrangementen-, samenwerkings- of kennismakingsflow.

De offerteflow bestaat uit twee stappen en werkt met of zonder geselecteerde gerechten. De bezoeker kiest particulier of zakelijk en vult naam, e-mailadres, telefoonnummer, plaats, aantal personen, datum en een expliciete keuze voor borden en bestek (ja/nee) in. Kennisname van het privacybeleid is vereist; dit is geen marketingtoestemming. Minimaal 15 personen en twee Amsterdam-kalenderdagen voorbereidingstijd worden in formulier en server gecontroleerd via `src/data/catering-settings.json`. De datum moet bekend zijn. De aanvraag is geen bestelling. De betaal- en annuleringsafspraken staan in een uitklapbare toelichting bij de offerte.

Op `/over-ons` staat het particuliere contactformulier; `/b2b` bevat het zakelijke contactformulier. Beide vragen alleen naam, e-mailadres, telefoonnummer en bericht. Een privacytoelichting met link legt het gebruik van de gegevens uit; deze contactformulieren vragen geen afzonderlijke toestemmingscheckbox. Het systeem verwerkt alleen de aanvraagtypen `quote` en `contact` en geeft het gekozen particuliere of zakelijke onderwerp mee aan de interne e-mail.

De klant krijgt een eigen ontvangstbevestiging voor een offerteaanvraag, particulier contact of zakelijk contact. De teksten staan in `forms-content.json` → `email.confirmations`. De eigenaar/manager volgt op via de STRATO-mailbox. Een WhatsApp-link en bereikbaarheid staan op de contactpagina's; de website verstuurt zelf geen WhatsApp-berichten.

## Omgevingsvariabelen

| Variabele | Betekenis |
| --- | --- |
| `NEXT_PUBLIC_SITE_URL` | Absolute publieke URL zonder afsluitende slash. Voor productie `https://catering.indiasekeuken.nl`; gebruik vóór domeinkoppeling de Netlify-URL. |
| `RESEND_API_KEY` | Geheime Resend API-key met verzendrechten. Alleen server-side. |
| `RESEND_FROM_EMAIL` | Een enkel e-mailadres op een door Resend geverifieerd afzenderdomein. Geen weergavenaam opnemen. |
| `NOTIFICATION_TO_EMAIL` | Optionele ontvanger van interne aanvragen; standaard het e-mailadres in `src/data/site.json` → `email` (nu `info@indiasekeuken.nl`). |
| `NEXT_PUBLIC_TURNSTILE_SITE_KEY` | Publieke sitekey van de Cloudflare Turnstile-widget. |
| `TURNSTILE_SECRET_KEY` | Geheime sleutel voor server-side Turnstile-verificatie. |
| `ALLOW_UNPROTECTED_FORMS` | Standaard `false`. Alleen een bewuste uitzondering: `true` laat productie zonder Turnstile toe, met zwakkere spambescherming. |
| `CATALOG_DEMO` | Standaard `false`. Alleen in niet-productie met waarde `true` worden aparte demogegevens ingeladen. |

Nooit geheime waarden onder een `NEXT_PUBLIC_`-naam plaatsen, in JSON zetten of committen. `.env.local` staat in `.gitignore`; `.env.example` bevat geen echte geheimen. Publieke `NEXT_PUBLIC_`-waarden moeten tijdens de build beschikbaar zijn; een wijziging vereist een nieuwe build. Maak servergeheimen beschikbaar voor de Functions-runtime van het actieve Netlify-deploy-context. De productiebuild zelf heeft geen werkende Resend-key nodig.

## GitHub en Netlify

1. Maak een GitHub-repository aan, of gebruik een bestaande repository. Controleer vóór de eerste commit dat `.env.local` en geheimen niet worden meegenomen.
2. Koppel de repository indien nodig met `git remote add origin <uw-repository-url>`. Commit de broncode en `package-lock.json`, en push naar uw gekozen productiebranch.
3. Kies in Netlify **Add new project → Import an existing project → GitHub**. Geef Netlify toegang tot deze repository en kies de productiebranch, bijvoorbeeld `main`.
4. Controleer de instellingen uit `netlify.toml`: build command `npm run build`, publish directory `.next` en Node.js `24`.
5. Laat Netlify zijn actuele officiële Next.js/OpenNext-adapter automatisch toepassen. Voeg geen verouderde gepinde plugin en geen `output: "export"` toe: de formulieren hebben een server nodig. [Officiële Next.js-integratie](https://docs.netlify.com/build/frameworks/framework-setup-guides/nextjs/overview/).
6. Voeg de omgevingsvariabelen toe via Netlify. Stel `NEXT_PUBLIC_SITE_URL` eerst in op uw echte `https://<project>.netlify.app`-URL. Zet geen echte productiekeys in onbetrouwbare pull-requestpreviews; gebruik aparte testinstellingen of laat verzending daar uitgeschakeld.
7. Configureer Resend en Turnstile zoals hieronder. Start vervolgens een nieuwe deploy.
8. Controleer alle pagina's, mobiel menu, metadata, afbeeldingen, beide offertestappen met en zonder gerechtselectie en de particuliere/zakelijke contactformulieren. Verstuur vervolgens bewust een testofferte en een contactbericht met uw eigen e-mailadres. Controleer interne melding, doelgroep, Reply-To en ontvangstbevestiging in de echte mailboxen én het Resend-dashboard. Gebruik uitsluitend bevestigd eigen aanbod; verwijder eventuele tijdelijke testinhoud vóór publieke ingebruikname.
9. Iedere volgende push naar de gekozen productiebranch leidt via de GitHub-koppeling tot een nieuwe Netlify-build en deployment. Bij een mislukte build blijft de vorige geslaagde deploy beschikbaar.

Een lokale geslaagde build bewijst niet dat een externe mailbox e-mail ontvangt of dat DNS en Turnstile correct zijn gekoppeld. Die eindcontroles vereisen de accounts en instellingen van de eigenaar.

### Resend instellen

1. Maak een Resend-account aan en voeg een afzenderdomein toe dat u beheert. Een apart verzendsubdomein, bijvoorbeeld `mail.indiasekeuken.nl`, kan bestaande mailstromen gescheiden houden. Dit is een configuratievoorbeeld; het is niet automatisch aangemaakt.
2. Voeg bij de huidige DNS-provider exact de records toe die Resend toont. Behoud bestaande MX-, SPF- en DKIM-records. Voeg niet blind een tweede SPF-record op hetzelfde hostname toe. Laat bij conflicten de bestaande mailbeheerder de records afstemmen.
3. Wacht totdat Resend het domein als geverifieerd toont. Maak daarna een API-key aan, bij voorkeur beperkt tot het bedoelde verzenddomein.
4. Zet `RESEND_API_KEY` en `RESEND_FROM_EMAIL` in Netlify; gebruik een adres op het geverifieerde domein. De interne ontvanger volgt `site.json` → `email`, tenzij u expliciet `NOTIFICATION_TO_EMAIL` instelt.
5. Laat open- en kliktracking uit als u die niet bewust nodig heeft. Controleer uw verwerkersafspraken en bewaarbeleid in Resend en de mailbox.

De server verstuurt eerst de interne melding. Alleen na acceptatie door Resend volgt een succesantwoord en de ontvangstbevestiging. Mislukt alleen die bevestiging, dan blijft de aanvraag ingediend en vermeldt de interface dat de bevestiging niet kon worden verstuurd. Acceptatie door Resend is geen aflevergarantie: volg bounces en afleverproblemen in het Resend-dashboard op. [Domeinverificatie](https://resend.com/docs/dashboard/domains/introduction).

### Turnstile instellen

Maak in Cloudflare een Turnstile-widget aan en voeg uw precieze productiehostnames toe, inclusief de gebruikte Netlify-testhost en later `catering.indiasekeuken.nl`. Kies een gebruikelijke managed-widget. U hoeft DNS of nameservers hiervoor niet naar Cloudflare te verhuizen. Vul **beide** Turnstile-variabelen in en bouw opnieuw. De server controleert ieder token; alleen de widget tonen is onvoldoende. [Officiële installatiehandleiding](https://developers.cloudflare.com/turnstile/get-started/).

Een gedeeltelijke configuratie blokkeert verzending. In productie blokkeert ook volledig ontbrekende Turnstile-configuratie standaard de formulieren. Lokaal mogen beide sleutels ontbreken. `ALLOW_UNPROTECTED_FORMS=true` is uitsluitend bedoeld als expliciete, door de eigenaar geaccepteerde uitzondering: de overige maatregelen zijn geen gelijkwaardige vervanging voor botcontrole. Gebruik Cloudflare-testsleutels alleen voor testen, nooit als productiebeveiliging.

### Eigen subdomein koppelen

1. Voeg in Netlify bij **Domain management → Production domains** alleen `catering.indiasekeuken.nl` toe.
2. Bekijk **Pending DNS verification** en neem het exacte CNAME-doel over dat Netlify voor dit project geeft.
3. Voeg bij de bestaande DNS-provider één CNAME toe: host `catering`, doel `<uw-project>.netlify.app` (gebruik het werkelijk opgegeven doel).
4. Verwijder of wijzig bestaande conflicterende records op host `catering` uitsluitend na controle. Wijzig geen nameservers, geen rootdomeinrecords en geen bestaande e-mailrecords.
5. Wacht op DNS-verificatie en het automatische HTTPS-certificaat. Stel dit subdomein in als primary domain.
6. Zet `NEXT_PUBLIC_SITE_URL=https://catering.indiasekeuken.nl`, voeg die hostname aan Turnstile toe en deploy opnieuw. Controleer canonicals, sitemap, SSL en de formulieren.

[Netlify: subdomein via externe DNS](https://docs.netlify.com/manage/domains/configure-domains/configure-external-dns/).

## Beveiliging en beperkingen

Formulieren gebruiken server-side Zod-validatie, invoer- en requestlimieten, same-origincontrole, een honeypot, tijdcontrole, uitschakeling van de verzendknop tijdens verwerking en Turnstile indien geconfigureerd. Selectie-ID's worden server-side opnieuw aan de gepubliceerde catalogus getoetst; willekeurige namen uit de browser worden niet vertrouwd.

De aanvullende begrenzer werkt per warme serverinstantie: maximaal vijf aanvragen per tien minuten per tijdelijk gehashte IP-sleutel. Hij is bewust niet gedistribueerd en kan door schaalvergroting of een koude start opnieuw beginnen. Turnstile is daarom de primaire aanvullende botbescherming. Technische logs bevatten gebeurteniscodes en referenties, geen volledige aanvraaginhoud.

Iedere inzending krijgt een UUID en een aanvraagreferentie. Herhaalde verzending van dezelfde aanvraag vanuit het actieve formulier gebruikt dezelfde idempotency key. Resend bewaart zulke sleutels 24 uur; na die periode, na een nieuwe browsersessie of bij een bewust nieuwe aanvraag is dit geen permanente deduplicatie. Er is geen duurzame verzoekwachtrij of database. Bij een onzekere netwerkuitkomst kan dezelfde ongewijzigde aanvraag opnieuw worden geprobeerd; controleer bij twijfel de interne mailbox en het Resend-dashboard op de referentie. [Resend-idempotency](https://resend.com/docs/dashboard/emails/idempotency-keys).

Aanvragen worden niet in GitHub of lokale JSON opgeslagen. De mailbox en Resend zijn de ontvangst- en opvolgkanalen. Alleen de gerechtselectie wordt tijdelijk in `sessionStorage` van de bezoeker bewaard. Er zijn geen advertentietrackers of onnodige trackingcookies.

## Gratis gebruik en beheer

De website gebruikt geen verplicht betaalde dienst. Netlify Free, Resend Free en Turnstile Free hebben wel voorwaarden en gebruikslimieten; e-mail, builds, requests, verkeer en beeldverwerking kunnen quota verbruiken. Iedere geslaagde aanvraag gebruikt normaal twee e-mails. Controleer het verbruik, stel beschikbare meldingen in en beoordeel het plan bij groei. Dit project belooft geen onbeperkte gratis capaciteit. Raadpleeg [Netlify-plannen](https://www.netlify.com/pricing/), [Resend-plannen](https://resend.com/pricing) en [Turnstile-plannen](https://developers.cloudflare.com/turnstile/plans/).

Werk dependencies regelmatig gecontroleerd bij, voer lint/types/tests/build uit en test daarna de formulieren op een preview. Herstel een problematische publicatie via een vorige Netlify-deploy en corrigeer de bron in GitHub.

## Nog invullen door de eigenaar

De uitgevoerde controles en concrete verificatiegrenzen staan in [VALIDATION.md](VALIDATION.md).

Zie [CONFIGURATION.md](CONFIGURATION.md) voor de actuele inrichting en verificatiepunten. Bedrijfsgegevens, bedrijfsverhaal, logo, bereikbaarheid en werkwijze zijn op 24 november 2026 verwerkt. Het adres is Herderplein 13, 3533 BN Utrecht; telefoon 06 2484 5749, KvK 83513817 en btw-id NL862900487B01. Netlify, Resend en Turnstile zijn volgens de eigenaar ingericht; echte aflevering en accountinstellingen zijn niet door de lokale tests bevestigd. Het privacybeleid beschrijft mailboxopslag, leveranciers en de afgesproken verwerking; concrete verwijdertermijnen voor correspondentie moeten nog worden vastgesteld. De gerechten en foto's blijven door de eigenaar te beheren. Er zijn geen klantnamen of sociale profielen toegevoegd.

[CONTENT_GUIDE.md](CONTENT_GUIDE.md) beschrijft het inhoudsbeheer. [ASSETS.md](ASSETS.md) bevat herkomst, rechten en vervanginstructies voor de illustratieve stockfoto's en lokale lettertypen.
