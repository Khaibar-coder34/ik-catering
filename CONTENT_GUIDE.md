# Website-inhoud aanpassen

De website gebruikt **geen database**. Gerechten, teksten en bedrijfsgegevens staan in gewone JSON-bestanden in `src/data/`. Je kunt deze bestanden in je editor of op GitHub aanpassen. Afbeeldingen staan in `public/images/`. Klantaanvragen worden per e-mail verstuurd en worden niet in deze bestanden opgeslagen.

## Welke bestanden mag je aanpassen?

| Wat wil je wijzigen? | Bestand | Belangrijkste velden |
| --- | --- | --- |
| Gerechten toevoegen, aanpassen, verbergen of sorteren | [`src/data/dishes.json`](src/data/dishes.json) | `name`, `description`, `categoryId`, `image`, `sortOrder`, `isPublished` |
| Namen en volgorde van de drie categorieën | [`src/data/categories.json`](src/data/categories.json) | `name`, `sortOrder`, `isPublished` |
| Bedrijfsnaam, e-mail, telefoon en adres | [`src/data/site.json`](src/data/site.json) | `name`, `email`, `phone`, `address`, `postalCode`, `city` |
| Korte bedrijfsomschrijving, werkgebied en standaard website-URL | [`src/data/site.json`](src/data/site.json) | `tagline`, `serviceArea`, `url` |
| KvK, btw en sociale profielen | [`src/data/site.json`](src/data/site.json) | `kvk`, `vat`, `socials` |
| Knoppen in de navigatie en tekst onderaan de website | [`src/data/site.json`](src/data/site.json) | `navigation[].label`, `quoteLabel`, `footer.intro`, `footer.privacyLabel` |
| Homepage | [`src/data/content.json`](src/data/content.json) | `home` |
| Introductie van het menu | [`src/data/content.json`](src/data/content.json) | `menu` |
| Bedrijfsverhaal en particuliere contactintroductie | [`src/data/content.json`](src/data/content.json) | `about` |
| Samenwerkingstekst voor organisaties | [`src/data/content.json`](src/data/content.json) | `b2b` |
| Introductie van de offertepagina | [`src/data/content.json`](src/data/content.json) | `quote` |
| Contactlabels en privacytekst | [`src/data/content.json`](src/data/content.json) | `contact`, `privacy` |
| Meldingen bij het menu en de gerechtselectie | [`src/data/menu-content.json`](src/data/menu-content.json) | `imageNote`, `emptyCategory`, `emptyMenuNote`, `selectionEmpty`, `selectedSingular`, `selectedPlural` |
| Formulierlabels, knopteksten en foutmeldingen | [`src/data/forms-content.json`](src/data/forms-content.json) | `fields`, `submit`, `next`, `back`, `validation`, `apiErrors` |
| Teksten in de ontvangstbevestiging | [`src/data/forms-content.json`](src/data/forms-content.json) | `email` |
| Gerechtfoto's | [`public/images/dishes/`](public/images/dishes/) | Afbeeldingsbestand; verwijs ernaar via `dishes.json` → `image` |
| Foto op Home of Over ons | [`src/data/content.json`](src/data/content.json) + [`public/images/catering/`](public/images/catering/) | `home.image`, `home.imageAlt`, `home.imageCaption`, `about.image`, `about.imageAlt` |

Voor gewone inhoudswijzigingen hoef je geen `.tsx`- of `.ts`-bestanden aan te passen. Behoud bestaande veldnamen: verander de tekst rechts van de dubbele punt, niet de sleutel links ervan. Nieuwe pagina's of nieuwe formuliervelden vereisen wel een codewijziging.

## Het ingevulde menu

Er zijn negen startgerechten ingevuld, drie per categorie:

| Categorie | Gerechten | `categoryId` |
| --- | --- | --- |
| Hoofdgerechten | Butter chicken, Palak paneer, Chana masala | `hoofdgerechten` |
| Bijgerechten | Basmatirijst, Naan, Samosa | `bijgerechten` |
| Nagerechten | Kheer, Gulab jamun, Mango kulfi | `nagerechten` |

Deze gerechten staan in `src/data/dishes.json` en verschijnen zowel in het menu als in stap 1 van de offerteaanvraag. Pas de omschrijvingen aan je eigen bereiding aan. De foto's zijn illustratief; je kunt ze vervangen door eigen fotografie. De beeldbronnen staan in [ASSETS.md](ASSETS.md).

## Een gerecht aanpassen of toevoegen

Een gerecht is één object tussen `{` en `}` binnen de lijst in `dishes.json`. Voor een bestaand gerecht wijzig je bijvoorbeeld `name`, `description` of `image`. Voor een nieuw gerecht kopieer je een object, voeg je het toe aan de bestaande lijst en geef je het een unieke `id` en `slug`.

Dit is een compleet voorbeeldobject voor een nieuw gerecht. Voeg eerst de bijbehorende foto toe en zet daarna `isPublished` op `true` om het te tonen:

```json
{
  "id": "groentecurry",
  "slug": "groentecurry",
  "name": "Groentecurry",
  "categoryId": "hoofdgerechten",
  "description": "Groenten in een kruidige tomatensaus.",
  "image": "/images/dishes/groentecurry.webp",
  "type": "vegan",
  "sortOrder": 4,
  "isPublished": false
}
```

Voeg dit object **binnen de bestaande `[` en `]`** toe. Zet een komma tussen twee gerechten, maar geen komma na het laatste gerecht. Vervang niet de hele lijst door één object.

| Veld | Betekenis |
| --- | --- |
| `id` | Unieke interne sleutel. Gebruik kleine letters, cijfers en streepjes; bijvoorbeeld `groentecurry`. Verander een bestaande sleutel liever niet. |
| `slug` | Unieke leesbare sleutel, meestal gelijk aan `id`. |
| `name` | Naam op de productkaart en in de offerte. Wordt ook als beeldbeschrijving gebruikt. |
| `categoryId` | Exact één van de drie waarden uit de categorietabel hierboven. |
| `description` | Korte beschrijving van het gerecht. Houd deze bij één of twee korte zinnen. |
| `image` | Lokaal afbeeldingspad, bijvoorbeeld `/images/dishes/groentecurry.webp`. |
| `type` | `vegetarian`, `vegan` of `meat`. Dit veld is vereist voor de gegevenscontrole; het staat niet als extra label op de kaart. |
| `sortOrder` | Geheel getal vanaf 0. Lager betekent eerder binnen de categorie. |
| `isPublished` | `true` toont het gerecht; `false` verbergt het uit zowel menu als offerte. |

Een gerecht kan alleen zichtbaar zijn als ook zijn categorie `isPublished: true` heeft. Tijdelijk verbergen gaat het makkelijkst met `isPublished: false`; verwijderen kan door het hele object weg te halen en de omliggende komma's te controleren. De categorieën zelf beheer je in `categories.json`. Behoud hun bestaande `id` en `slug`, zodat verwijzingen vanuit gerechten blijven werken.

Het optionele veld `allergens` is een lijst met gecontroleerde allergenen. Voeg dit alleen toe als de keuken de gegevens heeft bevestigd. Het wordt momenteel niet op de kaart getoond; het ontbreken ervan zegt niets over allergenen of kruiscontact.

## Foto's toevoegen of vervangen

1. Plaats de foto in `public/images/dishes/`, bijvoorbeeld `groentecurry.webp`.
2. Vul bij het gerecht `"image": "/images/dishes/groentecurry.webp"` in.
3. Gebruik voor een vervangende foto bij voorkeur een nieuwe naam, bijvoorbeeld `groentecurry-v2.webp`, en pas het pad aan. Zo voorkom je dat een browser de oude afbeelding uit zijn cache toont.
4. Controleer de uitsnede op desktop en mobiel.

Het pad in JSON begint met `/images/`, **zonder `public/`**. Een volledig Windows-pad of een externe afbeeldings-URL werkt hier niet. De ondersteunde bestandstypen zijn WebP, AVIF, PNG, JPG, JPEG en SVG. Voor foto's is WebP van ongeveer 900–1200 px breed een praktische keuze. Gebruik eenvoudige bestandsnamen zonder spaties.

Bij `"image": ""` verschijnt een verzorgd vervangend beeldvlak. Voor een volledige kaart vul je een echte foto in. De kaart verdeelt de hoogte over foto (60%), naam (20%) en beschrijving (20%). In de offerte worden dezelfde foto's kleiner getoond, met alleen naam en checkbox.

Voor de grote foto's pas je `content.json` → `home.image` of `about.image` aan. De beeldbeschrijving staat in `imageAlt`; het onderschrift van de homepage staat in `home.imageCaption`. Gebruik foto's waarvoor je publicatierechten hebt en houd de bronvermelding in [ASSETS.md](ASSETS.md) bij.

## Bedrijfs- en contactgegevens

Pas de gegevens centraal aan in `src/data/site.json`:

```json
"name": "Indiase Keuken",
"email": "info@indiasekeuken.nl",
"phone": "0684875866",
"address": "Herderplein 13",
"postalCode": "",
"city": "Utrecht"
```

Dit is een fragment van het bestaande bestand, geen vervanging van het hele bestand. `address` bevat straat en huisnummer; de stad hoort in `city`. Houd `phone` geschikt voor een telefoonlink, bijvoorbeeld `0684875866` of `+31684875866`.

`kvk` en `vat` mogen leeg blijven zolang ze niet bekend zijn. Sociale profielen voeg je toe aan `socials`, bijvoorbeeld:

```json
"socials": [
  { "label": "Instagram", "href": "https://www.instagram.com/uw-profiel/" }
]
```

Vervang het voorbeeldadres door je eigen profiel. Laat `socials` als `[]` staan als je geen profiel wilt tonen.

De privacytekst en formulier-/e-mailteksten kunnen verwijzingen zoals `{site.email}` bevatten. Die worden automatisch uit `site.json` ingevuld. Beschikbare verwijzingen zijn `{site.name}`, `{site.email}`, `{site.phone}`, `{site.address}`, `{site.postalCode}`, `{site.city}`, `{site.serviceArea}` en `{site.url}`. Laat deze verwijzingen staan als je wilt dat een wijziging centraal doorwerkt. Gewone beschrijvende teksten, zoals een zin over bezorgen in Utrecht, pas je zelf aan wanneer het werkgebied verandert.

De interne ontvanger van aanvragen volgt standaard `site.email`. Als `NOTIFICATION_TO_EMAIL` is ingesteld, gaat die technische instelling voor. Het afzenderadres wordt apart ingesteld met `RESEND_FROM_EMAIL`; dit moet op een door Resend geverifieerd domein staan. Het wijzigen van de zichtbare e-mailtekst configureert Resend niet automatisch.

`tagline` en `serviceArea` worden onder meer in de zoekmachinegegevens gebruikt. `url` is de standaard publieke website-URL; een ingestelde `NEXT_PUBLIC_SITE_URL` gaat voor. Losse zinnen over je bedrijf in `footer.intro` of `content.json` blijven afzonderlijk bewerkbaar.

## Paginakoppen en bedrijfsteksten

Open `src/data/content.json` en kies de juiste groep:

- `home`: `title`, `description`, `services[].title`, `services[].text`, `bottomTitle`, `bottomText` en knopteksten.
- `menu`: `title`, `description` en `cta`.
- `about`: `title`, `description`, `detail`, `contactTitle` en `contactText`.
- `b2b`: `title`, `description`, `detail` en `formTitle`.
- `quote`: `title` en `description`.
- `contact`: de kop en labels bij e-mail, telefoon en adres.
- `privacy`: `title`, `description`, `sections[].title`, `sections[].text` en `links`.

De groepen `home`, `menu`, `about`, `b2b`, `quote` en `privacy` hebben ook `metaTitle` en `metaDescription` voor browser- en zoekmachinegegevens. Houd deze passend bij de inhoud. Een `\n` in een JSON-tekst is een regelafbreking, bijvoorbeeld `"Goed eten.\nSamen genieten."`.

De contactformulieren zelf staan op Over ons (particulier) en B2B (zakelijk). Hun woorden beheer je in `forms-content.json`. Laat de technische waarden `private`, `business`, `yes` en `no` staan; je kunt de zichtbare labels wijzigen. Behoud ook de invultekens `{count}` en `{field}` in meldingen: de website vervangt die door aantallen of veldnamen.

## Welke bestanden zijn niet voor dagelijks inhoudsbeheer?

- `src/data/demo/`: afzonderlijke gegevens voor ontwikkeltests. Normaal bewerk je `src/data/dishes.json`. Laat `CATALOG_DEMO=false` staan als je jouw eigen inhoud wilt zien.
- `src/data/arrangements.json`: gereserveerde catalogusgegevens; er is geen publieke arrangementkeuze. Laat deze lijst leeg.
- `src/components/`, `src/lib/`, `app/`: applicatiecode. Alleen aanpassen voor nieuwe functies, ander gedrag of een gewijzigde pagina-indeling.
- `app/globals.css`: vormgeving, afstanden en lettertypen.
- `.env.local` en de Netlify-omgevingsvariabelen: technische instellingen en geheime sleutels. Zet die nooit in een publiek JSON-bestand of in GitHub.
- `package.json`, `package-lock.json`, `next.config.ts`, `netlify.toml`: technische configuratie, geen website-inhoud.
- `.next/` en `node_modules/`: automatisch aangemaakte bestanden; niet handmatig bewerken.

## Opslaan, bekijken en publiceren

1. Bewerk de JSON en voeg eventuele afbeeldingen toe.
2. Gebruik dubbele aanhalingstekens. Schrijf `true` en `false` zonder aanhalingstekens. Gebruik geen comments en geen komma na het laatste veld of object.
3. Start `npm run dev` en bekijk `/menu`, `/offerte` en de aangepaste pagina. De ontwikkelserver toont opgeslagen wijzigingen automatisch. Een reeds draaiende productieversie via `npm run start` vereist eerst een nieuwe `npm run build` en daarna een herstart.
4. Controleer voor publicatie met `npm run typecheck`, `npm test` en `npm run build`. De cataloguscontrole meldt onder meer ontbrekende velden, dubbele ID's en onbekende categorieën.
5. Commit en push de wijzigingen naar de gekoppelde productiebranch. Zodra GitHub en Netlify zijn gekoppeld, bouwt Netlify de nieuwe website. Alleen lokaal opslaan verandert de online versie niet.
6. Controleer de online pagina na de geslaagde deployment.

Hosting, e-mail en spamcontrole worden ingericht volgens [README.md](README.md) en [CONFIGURATION.md](CONFIGURATION.md). De resultaten van de laatste technische controles staan in [VALIDATION.md](VALIDATION.md).
