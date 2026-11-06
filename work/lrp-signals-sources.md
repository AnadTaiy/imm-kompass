# Avgrensede LRP-kontroller

Gjennomgått 5. november 2026. Reglene er oppslagspunkter, ikke en validert beslutningsalgoritme. Ingen allergikontroll er lagt til.

## Dobbeltbehandling

Samme FEST-virkestoff-ID i flere aktive preparater innen samme overordnede administrasjonsvei. Ingen navnegjetting, klassemapping eller automatisk konklusjon om feil. Behovsmedisin og forskjellige styrker kan være tilsiktet. Preparater uten verifisert produkt-ID og samsvarende ATC utelates fra denne sammenligningen. Saltformer som FEST gir ulike ID-er kan bli oversett. Medisinene trenger ikke være samstemt for å gi et mulig treff.

[Helsedirektoratet: gjennomføring av LMG](https://www.helsedirektoratet.no/faglige-rad/legemiddelsamstemming-og-legemiddelgjennomgang/gjennomforing-av-legemiddelgjennomgang). Preparatomtaler for de aktuelle produktene følger med i oppslaget.

## Elektrolytter

Bare S-kalium og S-natrium, mmol/L, ingen dato. Fürsts eksempelintervall for voksne er K 3,6–5,0 og Na 137–145. Strengt mindre/større gir oppslag når legemidlet også matcher. Disse er **referansegrenser, ikke behandlingsgrenser eller akuttgrader**. Laboratoriets eget intervall, prøvetype, hemolyse, glukose, symptomer, EKG og sykdomsforløp må vurderes separat. Ingen automatisk dosering, seponering eller påstand om årsak. Ingen grønne friskmeldinger.

- [Fürst, referanseområder](https://www.furst.no/analyse-og-klinikk/referanseomrader)
- [Legemiddelhåndboka, hypokalemi](https://www.legemiddelhandboka.no/extended/ernaering-vaeskesubstitusjon-og-elektrolyttforstyrrelser/behandling-av-elektrolyttforstyrrelser/hypokalemi): kaliumtapende diuretika; økt arytmirisiko med digitalis ved lavt kalium.
- [Hyperkalemi](https://www.legemiddelhandboka.no/extended/ernaering-vaeskesubstitusjon-og-elektrolyttforstyrrelser/behandling-av-elektrolyttforstyrrelser/hyperkalemi): RAAS-hemmere, kaliumsparende diuretika, kaliumtilførsel og trimetoprim.
- [Hyponatremi](https://www.legemiddelhandboka.no/extended/ernaering-vaeskesubstitusjon-og-elektrolyttforstyrrelser/behandling-av-elektrolyttforstyrrelser/hyponatremi): SSRI, karbamazepin/okskarbazepin, tiazider og trimetoprim.
- [Diabetes insipidus](https://www.legemiddelhandboka.no/extended/endokrine-sykdommer/hypofysesykdommer/hypofysesvikt/sentral-diabetes-insipidus): desmopressin/hyponatremi og litium/nefrogen DI.
- [Hypernatremi](https://www.legemiddelhandboka.no/extended/ernaering-vaeskesubstitusjon-og-elektrolyttforstyrrelser/behandling-av-elektrolyttforstyrrelser/hypernatremi): vanntap ved nefrogen DI. Litium–høyt Na er en mekanistisk kobling fra disse to kildene, ikke en påvist årsak hos pasienten.

Kombinasjonsprodukter deles etter FESTs virkestoff-ID-er. Disse kobles til enkeltstoffenes fullstendige ATC-koder i samme katalog. Rene produkter bruker sin egen ATC, slik at lokalbehandling ikke blir systemisk behandling gjennom et stoffoppslag. Lokale former utelates. Listen er bevisst avgrenset og dekker ikke alle medikamentelle elektrolyttforstyrrelser.

## Legemiddel–sykdom

Krever eksplisitt og gyldig ICD-10/ICPC-2-kode i pasientgrunnlaget eller indikasjonen for et aktivt legemiddel. Ingen tolkning av fri journaltekst eller FEST-bruksområder som diagnoser. Tidligere sykdom kan fortsatt gi et kontrollpunkt; automatisk slutning om aktiv sykdom eller alvorlighetsgrad unngås.

| Diagnose | Legemiddel | Klassifisering og avgrensning |
|---|---|---|
| G20 | A03FA01 metoklopramid | Rødt: Parkinsons sykdom er kontraindikasjon, SPC 4.3. |
| G21 / N87 | A03FA01 | Rav: parkinsonisme er bredere enn Parkinsons sykdom. G20 overstyrer dette treffet hvis begge er angitt. |
| J45/J46 / R96 | C07AA05 propranolol | Rødt: astma, også i sykehistorien, er kontraindikasjon. Ikke overført til alle betablokkere eller KOLS. |
| I50/I11.0/I13.0/I13.2 / K77 | Systemisk NSAID | Rav: avklar sviktgrad og preparatspesifikke kontraindikasjoner. |
| K25–K28 / D85/D86 | Systemisk NSAID | Rav: avklar aktivt/tidligere ulcus, blødning og residiv. Historisk kode fastslår ikke aktivt ulcus. |

Systemiske NSAID: M01AA/AB/AC/AE/AG/AH og M01AX01. Kombinasjonsprodukter med disse stoffene inngår. M02-lokalbehandling, glukosamin og ASA som platehemmer inngår ikke.

- [Afipran SPC 4.3/4.4](https://produktinformasjon.legemiddelsok.no/preparatomtaler/1994-03424.pdf), bekreftet Parkinsons sykdom kontraindisert på side 2–3.
- [Propranolol SPC 4.3/4.4](https://www.medicines.org.uk/emc/product/100086/smpc), astma/bronchospasme kontraindisert, ikke brå avslutning.
- [Legemiddelhåndboka, NSAID](https://www.legemiddelhandboka.no/extended/ikke-steroide-antiinflammatoriske-midler-nsaid), avsnitt om ulcus, nyre/kretsløp, forsiktighet og kontraindikasjoner.

## Data og vedlikehold

Prøve- og sykdomsregler gjelder voksne; ukjent alder gir et generelt voksenoppslag, oppgitt alder <18 utelates. Pause/seponering og eksplisitt ikke-bruk utelates; manglende dosering beviser ikke ikke-bruk. Import og lokal lagring følger eksisterende skjema. Tall og pasienttekst sendes ikke i lenken. Lenken inneholder bare offentlige regel-ID-er og produkt-ID-er/ATC. Ingen foreslåtte indikasjoner endres.

FEST-synk oppdaterer produkt- og virkestoffkoblingene. De kliniske reglene oppdateres ikke automatisk av FEST og krever egen kildekontroll. Regresjonstester ligger i `test_lrp_signals.cjs` og kjøres også ved bygg og datasynk.
