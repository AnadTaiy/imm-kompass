# Respirasjonsrisiko og medikamentoverforbrukshodepine

Gjennomgått 06.11.2026. Lokale, avgrensede kontrollregler. Ingen automatisk diagnose, dosering, seponering eller tallfestet risiko.

## Kilder og hva de underbygger

- [Helsedirektoratet: trygg bruk av avhengighetsskapende legemidler](https://www.helsedirektoratet.no/veiledere/avhengighetsskapende-legemidler/trygg-bruk-av-avhengighetsskapende-legemidler): behandlingsplan, oppfølging og nedtrapping. Oppdatert inngang; tidligere opioidside videresendes til ny veileder.
- [Legemiddelhåndboka: opioidanalgetika](https://www.legemiddelhandboka.no/extended/virkestoff/opioidanalgetika): respirasjonshemming, lungesykdom, dempende kombinasjoner og individuell vurdering.
- [MHRA 18.03.2020](https://www.gov.uk/drug-safety-update/benzodiazepines-and-opioids-reminder-of-risk-of-potentially-fatal-respiratory-depression): opioider med benzodiazepiner eller beslektede sovemidler kan gi additiv sedasjon og respirasjonsdepresjon. Krever særskilt vurdering og monitorering; ikke automatisk kontraindisert i appen.
- [MHRA 18.02.2021](https://www.gov.uk/drug-safety-update/pregabalin-lyrica-reports-of-severe-respiratory-depression) og [FDA 19.12.2019](https://www.fda.gov/safety/medical-product-safety-information/neurontin-gralise-horizant-gabapentin-and-lyrica-lyrica-cr-pregabalin-drug-safety-communication): gabapentin/pregabalin, opioider og redusert lungefunksjon. KOLS, høy alder og nyresvikt er relevante vurderingsmomenter.
- [OxyNorm mikstur, godkjent preparatomtale, punkt 4.3–4.5](https://preparatomtaler.blob.core.windows.net/spc/2001-09979.pdf): alvorlig KOLS/alvorlig bronkialastma er kontraindikasjoner for dette preparatet. Brukes som tydelig merket eksempel, ikke som en generell kontraindikasjon for alle opioider eller enhver astmakode. Valgt preparats egen SPC lenkes separat fra FEST.
- [Legemiddelhåndboka: medikamentoverforbrukshodepine](https://www.legemiddelhandboka.no/extended/nevrologiske-sykdommer/hodepine-og-ansiktssmerter/medikamentoverforbrukshodepine-moh): anamnese, hodepinedagbok, hyppig anfallsmedisin og behov for avklaring. Forebyggende behandling er ikke MOH-gruppe.
- [IHS / ICHD-3 kapittel 8.2](https://ichd-3.org/8-headache-attributed-to-a-substance-or-its-withdrawal/8-2-medication-overuse-headache-moh/) og [8.2.5 kombinasjonsanalgetika](https://ichd-3.org/8-headache-attributed-to-a-substance-or-its-withdrawal/8-2-medication-overuse-headache-moh/8-2-5-combination-analgesic-overuse-headache/): grenser på 10 eller 15 bruksdager/måned, over tre måneder, minst 15 hodepinedager/måned og underliggende hodepine. To ikke-opioide analgetika uten adjuvans teller ikke som 10-dagers kombinasjonsanalgetikum.

## Kodeavgrensning

Respirasjon: N02A; N07BC01/02/03/05/06/51; R05DA01/03/04 og R05FA01/02. Kombinasjoner kan også identifiseres via sikre FEST-virkestoffkoblinger. N07BC04 (lofeksidin), noskapin, dekstrometorfan og loperamid klassifiseres ikke som respirasjonshemmende opioid her. R05DA20 alene er for uspesifikk. Plaster og nasal fentanyl skal være med.

Kombinasjonspartner: N05BA, N05CD, N05CF og N03AE (benzodiazepiner/Z-hypnotika); N02BF01/02 og eldre N03AX12/16 (gabapentin/pregabalin). Andre CNS-dempende legemidler må fortsatt vurderes manuelt/FEST. Ingen antagelse om faktisk samtidig inntak eller dose ut fra listen alene.

Lungekontekst: gyldige ICD-10 J43/J44/J45/J46 eller ICPC-2 R95/R96 fra pasientgrunnlag eller kodet indikasjon ved aktiv behandling. Diagnosegrad, aktuell forverring eller redusert lungefunksjon utledes ikke fra koden. Varslet er oransje.

Hodepinekontekst: ICD-10 G43/G44/R51 eller ICPC-2 N01/N89/N90/N95. For teksten «Mulig overforbrukshodepine» kreves presis primær hodepinekode (G43, G44.0, G44.2; N89/N90/N95), minst 15 hodepinedager/måned, minst preparatets 10-/15-dagersgrense og eksplisitt bekreftet bruksmønster i mer enn tre måneder. Også da gjenstår klinisk vurdering av årsak og andre diagnoser.

10 dager: N02A, N02CC, ergotamin/dihydroergotamin N02CA01/02/51/52; verifiserte analgetikakombinasjoner med opioid/koffein. 15 dager: N02BE01, enkle N02BA/N02BB og systemiske NSAID. To enkle ikke-opioide analgetika i samme FEST-preparat beholder 15 dager. Ukjent kombinasjonsinnhold gir kun oppslag, ingen gjettet grense. Lavdose-ASA B01AC06, lokale NSAID, LAR, gabapentinoider, gepanter og forebyggende midler får ikke en automatisk MOH-grense.

Manglende/ugyldige bruksdager gir avklaringspunkt, ikke høy-bruk-treff. Registrerte dager under grensen gir ikke treff for enkeltpreparatet. Dager summeres aldri mellom preparater (kalenderoverlapp er ukjent). Dermed kan blandet/vekslende overforbruk overses; dette står i felthjelp, kildeoppslag og Hjelp. Dosekode erstatter ikke faktisk antall bruksdager.

## Vedlikehold og kontroll

`test_pain_safety.cjs` prøver terskler, negative eksempler, kombinasjonspreparater, gjeldende/tidligere ATC, KOLS/astma, pauset behandling, kildevalg, personvern og import/eksport. `test_lrp_signals.cjs` dekker den felles varslingsvisningen. Alle inngår i publiseringskontrollen. FEST-synk oppdaterer katalogen, men endrer ikke automatisk disse faglig vurderte reglene.

Varslene deler ingen prøvetall, diagnosetekst eller bruksdager i nye kildefaners URL. Bare offentlige regel-, preparat- og ATC-identifikatorer brukes. Hvert symbol er en egen SVG, og eksisterende interaksjonsbokser og forbindelseslinjer beholdes.
