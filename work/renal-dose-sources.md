# Nyrefunksjon og legemiddelspesifikke dosekilder

Gjennomgått 2. november 2026.

## Avgrensning

Kalkulatoren beregner nyrefunksjonsestimater og hjelper brukeren å finne legemiddelspesifikke doseringskilder. Den beregner ikke en legemiddeldose og utleder ikke doser, kontraindikasjoner, maksimaldoser, nyreintervaller eller valg av vekt fra ATC alene. Brukeren velger uttrykkelig hvilket nyrefunksjonsmål doseringskilden krever.

Indeksert eGFR beholdes i pasientgrunnlaget. Omregning til absolutt eGFR skjer separat med Mostellers kroppsoverflate. Laboratoriets EKFC kan registreres; appen implementerer ikke en ny EKFC-formel. Metodebytte skal ikke fremstilles som en sikker endring i nyrefunksjon. Eksisterende CKD-EPI- og Cockcroft–Gault-formler er beholdt.

## Faglig grunnlag

- [NIDDK: Determining Drug Dosing in Adults with CKD](https://www.niddk.nih.gov/research-funding/research-programs/kidney-clinical-research-epidemiology/laboratory/ckd-drug-dosing-providers): metode, dosegrenser, kombinert kreatinin/cystatin C og kroppsoverflate.
- [NHS SPS: Calculating kidney function](https://sps.nhs.uk/articles/calculating-kidney-function/): stabilitet, valg av CrCl versus eGFR, usikkerhet ved avvikende kroppsbygning og vektvalg.
- [Legemiddelhåndboka: Nedsatt nyrefunksjon, med underkapitler](https://www.legemiddelhandboka.no/extended/spesielle-pasientgrupper/legemiddelbruk-og-dosering-ved-nedsatt-nyrefunksjon/nedsatt-nyrefunksjon): eliminasjon, metabolitter, metningsdose, vedlikeholdsdose og oppfølging. Generelle prinsipper brukes; doseringstabellen er ikke kopiert til automatisk beslutningslogikk.
- [OUS: Dosering av antiinfektiva ved kronisk nyresykdom, dialyse og overvekt](https://ehandboken.ous-hf.no/document/133140): inngang til gjeldende lokal prosedyre. [Offentlig tabell, versjon 5, 16.12.2024](https://www.antibiotika.no/48ced7/contentassets/49baa2cc729f460387c29ec9d98c715c/tabell-dosering-av-antiinfektiva-ved-kronisk-nyresykdom-dialyse-og-overvektfedme-des-2024.pdf), side 1, er kilde for de valgfrie vektformlene. De er ikke en universell anbefaling om å bruke justert vekt.
- [UNN: Ny eGFR-formel](https://www.unn.no/fag-og-forskning/fastlegenytt/ny-egfr-formel/): EKFC fra 1. juni 2026.
- [National Kidney Foundation: eGFR calculator](https://www.kidney.org/professionals/gfr_calculator): CKD-EPI og enheter. Denne nettsiden kan bruke en annen BSA-formel enn Mosteller; identisk BSA-metode er nødvendig ved sammenligning.
- [Aciclovir Accord, preparatomtale](https://produktinformasjon.legemiddelsok.no/preparatomtaler/18-12554.pdf): brukt til å kontrollere at FEST-valget åpner riktig preparatomtale. Ingen aciklovirregel er hardkodet.

Betalte kilder, inkludert UpToDate Kidney Dosing, beholdes som oppslagslenker. Fullstendige lisensbelagte doseringsråd er ikke lastet ned eller gjengitt. Tilgang til betalt innhold er ikke testet med en brukerlisens.

## Kontrollmekanismer

- Ingen automatisk erstatning av CrCl med eGFR eller av indeksert verdi med absolutt verdi.
- Sammenligningsverdien i dosekildeseksjonen krever voksen alder og stabil nyrefunksjon. Dialyse, graviditet eller akutt/skiftende funksjon blokkerer standardestimatene. Oppslagskildene er fortsatt tilgjengelige.
- OUS-vektberegning begrenses her til voksne fra 152,4 cm; justert vekt beregnes bare når faktisk vekt er minst idealvekten. Vektvalg for CrCl er ikke automatisk et vektvalg for legemiddeldosering.
- Laboratoriets eGFR må være et eksakt tall med angitt metode; en verdi som «>90» omregnes ikke til et eksakt estimat. Valgt laboratorieverdi beholdes ved sammenligning med CKD-EPI og ved lokal gjenåpning.
- Metningsdose, vedlikeholdsdose, aktive metabolitter og oppfølging omtales kort med kildelenker.
- Det tidligere dosearket og feltet for prøvedato/tidspunkt er fjernet etter brukerens ønske.

Se `test_renal_dose.cjs` for regnekontroller og integrasjonstester. Hele sjekkpakken kjøres også ved GitHub Pages-publisering.
