# Legemiddelkontroll – omfang og kildekontroll

Gjennomgått 15.11.2026. Kode: `medicine-checks.js`; presentasjon: `medicine-checks-ui.js` og `lrp-signals-ui.js`. Dette er kildebaserte kontrollpunkter for vurdering, ikke en validert algoritme som påviser mangel, feilbehandling eller forsinkede prøver.

## Avgrensning

- Den nye kategorien krever registrert voksen alder og aktiv behandling. Pausert/seponert behandling og oppgitt «bruker ikke» utelates.
- Treff bygger på ATC og sikre FEST-virkestoffkoblinger. Kombinasjonspreparater støttes når katalog-ID og ATC stemmer. Manglende kobling gir ikke grunnlag for å gjette virkestoff.
- Tilleggsbehandling som ikke gjenkjennes i listen må avklares; fritekst og tilskudd uten sikker kode kan ikke sikkert utelukkes.
- Ingen nye prøvedatoer eller automatiske doseringsråd. Pasientopplysninger og prøvetall legges ikke i lenken til kildefanen.
- Gul sirkel med utropstegn skiller kategorien fra interaksjonstrekanten. Fargen angir kontrolltype, ikke alvorlighetsgrad. Flere treff samles i én knapp per legemiddel.

## Automatiske kontrollpunkter

| Regel | Viktige vilkår | Kildereferanser i koden |
| --- | --- | --- |
| Metformin / B12 | Risiko og symptomer må vurderes. Ikke tilskudd til alle. | mcMetformin, mcB12 |
| PPI / varighet, B12 og Mg | Fast behandling, ukjent varighet eller minst 13 uker. 13 uker er en lokal avgrensning, ikke en dokumentert terskel for B12-mangel. | mcB12, mcMg |
| Metotreksat / folsyre | Ukentlig faktisk dose; inflammatorisk ATC eller kodet inflammatorisk indikasjon; folsyre/folinat ikke gjenkjent i aktiv liste. Onkologisk ATC uten slik indikasjon er utelatt. | mcMtx |
| Metotreksat / intervall og oppfølging | Skiller inflammatorisk ukentlig behandling fra kreftprotokoller; påminnelse om blodstatus, lever og nyre. | mcMtx, mcMtxMonitor |
| Litium | Konsentrasjon, væske/salt, nyre, elektrolytter, tyreoidea og kalsium. | mcLithium |
| Amiodaron | Langtidsoppfølging; injeksjon/infusjon utelates. Lungesymptomer utredes målrettet. | mcAmiodarone |
| DOAK | Preparat- og indikasjonsspesifikt dosegrunnlag, blødning, blodstatus, nyre og lever. | mcDoac |
| ACE-hemmer / ARB | Kalium, nyrefunksjon og blodtrykk. | mcRaas |
| Spironolakton | Kalium og nyre; oppfølging tilpasses indikasjon. SPS-kilden beskriver hjertesvikt. | mcSpironolactone |
| Opioid / laksantia | Fast bruk, ikke behovsbruk, ingen aktive laksantia gjenkjent. Registrert diaré/ileus/ileostomi undertrykker treffet. | mcOpioid, mcStart |
| NSAID / gastrobeskyttelse | Systemisk middel og alder minst 65, ulcusanamnese eller antitrombotisk/glukokortikoid behandling. Ingen PPI/misoprostol gjenkjent. Vurder først om NSAID er egnet. | mcNsaid, mcScottish |
| Glukokortikoid / beinhelse | Fast peroral behandling med registrert varighet over 13 uker; samlet frakturrisiko må vurderes. | mcSteroid |
| Tredobbel nyrekombinasjon | Aktiv NSAID + ACE-hemmer/ARB + diuretikum. Faktisk samtidig bruk må avklares; ingen automatisk seponering. | mcScottish |

START-referansen har sin egen målgruppe. De generelle kontrollpunktene anvender også legemiddelspesifikke kilder; dette utvider ikke START-reglenes aldersvilkår. Helsedirektoratets opioidkapittel omhandler palliasjon ved kreft; øvrige situasjoner krever kontroll av preparatomtale, tarmfunksjon og indikasjon.

## Dekning av den innsendte LRP-oversikten

De eksisterende STOPP/START-, STOPPFrail-, STOPPFall-, NorGeP-, Beers-, ACB-, PIPC- og SADMAN-oppslagene beholdes. DMPs sjekkliste, ThinkCascades, PINCER, skotske risikoindikatorer og SPS-oppfølging er lagt til som kilder og samlet i Hjelp og praktisk støtte i gjennomgangen.

Åtte gjennomgangsspørsmål dekker formål, kombinasjoner, nye symptomer, mulig manglende behandling, oppfølging, dose/bruk, samlet belastning og akutt sykdom/endring. Det er også manuelle kontrollpunkter for beinhelse, sekundærforebygging, hjertesvikt og ICS ved astma. Disse er ikke alle nye automatiske varsler. Eksisterende START og CHA₂DS₂-VA brukes der deres vilkår gjelder. Datoavhengige PINCER-indikatorer beregnes ikke automatisk.

## Kildegrunnlag og vedlikehold

Fullstendige URL-er finnes i `IMMMedicineChecks.sources` og i fagkildebiblioteket. Tekstene er egne sammendrag. Gjennomgangen brukte MHRA, NICE NG239, Legemiddelhåndboka, Helsedirektoratet, NHS SPS, DMP, Scottish Government 2026–2029, den opprinnelige ThinkCascades-publikasjonen og OpenSAFELYs PINCER-beskrivelse. NICE-siden ble kontrollert i nettleseren etter at teksthenting ble avvist.

Kildeendringer og medisinske terskler må gjennomgås faglig. FEST-synk oppdaterer preparatkoblinger, ikke automatisk innholdet i disse faglige reglene. Ved utvidelse kreves referanse, tydelig målgruppe, relevante unntak og tester med både treff og ikke-treff.

## Kontroll

`test_medicine_checks.cjs` dekker 61 positive/negative tilfeller, inaktiv behandling, varighet, onkologisk/inflammatorisk metotreksat, registrert tilleggsbehandling, kombinasjonspreparater, katalogmismatch, uendret pasientdata, kildelenker, symbol og Hjelp. Hele bygge- og regresjonsløpet ble kjørt. Nettleserkontroll brukte kun syntetiske tilfeller på en separat lokal opprinnelse.

Dette verifiserer implementerte regler og grensesnitt; det dokumenterer ikke full klinisk validering eller uttømmende dekning av alle LRP.
