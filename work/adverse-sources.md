# Bivirkningsoppslag – kildegrunnlag og vedlikehold

Gjennomgått 03.11.2026. `adverse-effects.js` inneholder korte, selvstendig
formulerte utvalg fra punkt 4.8 i 39 offentlige preparatomtaler hos DMP/EMA.
Hver post har kildepreparat, URL, kontrolltidspunkt, SHA-256 for gjennomgått PDF,
sidetall, ATC, virkestoffsammensetning og eksplisitte formuleringer. PDF-ene
distribueres ikke med appen. Sidetall er én-baserte PDF-sider der 4.8 begynner;
tabellen fortsetter ofte over flere sider.

Dette er ikke et komplett FEST-register over bivirkninger. FEST gir lenker til
preparatomtaler, ikke en enhetlig frekvenstabell som kan importeres uten kontroll.
Kortoversikten er for voksne og inkluderer ikke alle vanlige, sjeldne eller
alvorlige bivirkninger. «Vanlige» og «svært vanlige» beholdes som separate
frekvensgrupper; utvalget rangeres ikke innen gruppen.

## Presis kobling

- Oppslag krever et identifisert katalogpreparat med samsvarende ATC,
  virkestoffsammensetning og godkjent formulering. Fritekst/ATC alene er ikke nok.
- Direkte treff mot gjennomgått preparatomtale prioriteres.
- Andre produkter med identisk sammensetning og tilsvarende formulering kan få
  et tydelig merket **virkestoffoppslag fra navngitt kildepreparat**. Dette hevder
  ikke at det andre produktets preparatomtale er lest, eller at alle frekvenser
  er identiske. Begge kildelenkene er tilgjengelige.
- Tabletter og filmdrasjerte tabletter grupperes. Depot, entero, inhalasjon,
  væsker og kombinasjoner utvides ikke automatisk. Loperamidutvalget bygger på
  samlet tabell for peroral bruk og utelater smeltetablett-spesifikke hendelser.
  Klaritromycinutvalget bygger på samlet tabell som eksplisitt inkluderer depot;
  intravenøse hendelser er utelatt.
- Karbidopa/levodopa overføres ikke til levodopa/benserazid, selv om ATC er lik.
- Candesartan har egne avsnitt for hypertensjon og hjertesvikt. Apiksaban har
  felles voksenutvalg og merket indikasjonsspesifikk informasjon. Ingen
  pediatrisk frekvens overføres til voksne. Ingen pasientindikasjon gjettes.

## Viktige kontrollfunn

- Simvastatin Bluefish oppgir ikke et generelt utvalg klassifisert som vanlige;
  atorvastatinets frekvenser overføres ikke.
- Pantoprazols hodepine/diaré er mindre vanlige i valgt kilde, i motsetning til
  omeprazol. Spironolaktons hyperkalemi er også mindre vanlig i valgt SPC.
- Delipam beskriver døsighet hos 10–15 %, men plasserer den i tabellens «vanlige»
  kolonne. Motsetningen opplyses; ingen entydig frekvensgruppe konstrueres.
- Euthyrox har ingen tallfestet frekvenstabell; symptomer ved for høy dose er
  merket særskilt, ikke «vanlige».
- SGLT2-hemmernes hypoglykemi beholder vilkåret om samtidig insulin/SU.
- Mørk avføring ved Duroferon og steroidutløst diabetes/osteoporose ved valgt
  prednisolonpreparat gis ikke en oppdiktet «vanlig»-frekvens.
- Bivirkningstabellenes kolonner er kontrollert med layoutbevarende uttrekk og
  visuell kontroll av blant annet furosemid, spironolakton, metoprolol,
  empagliflozin, apiksaban, sertralin, duloksetin, donepezil og oksazepam.

## Oppdatering

Dette er manuelt gjennomgåtte sammendrag. FEST-synk oppdaterer ikke selve
bivirkningsteksten. Kontrolltidspunktet vises i oppslaget. Ved utvidelse eller
endret kilde: hent riktig SPC, kontroller punkt 4.8 inkludert fotnoter, indikasjon,
aldersgruppe og formulering, oppdater hash/dato og kjør `test_cascades.cjs` samt
hele byggkontrollen. Ikke legg uverifisert PDF-uttrekk direkte inn i appen.
Spontanrapporterte antall er ikke et mål på bivirkningsfrekvens.

Bakgrunn: [DMP – bivirkninger av ditt legemiddel](https://www.dmp.no/bivirkninger-og-sikkerhet/bivirkningsrapporter-og-oversikter/bivirkninger-av-ditt-legemiddel).
