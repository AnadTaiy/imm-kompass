# Palliasjon og blodtrykk – kontrollgrunnlag

Kontrollert 13.11.2026. Kortfattede, selvstendig formulerte oppslag; ingen automatisk diagnose, doseendring eller seponering.

## Palliativ behandlingskontekst

- [Helsedirektoratet – behandlingsavklaringer](https://www.helsedirektoratet.no/veiledere/behandlingsavklaringer-ved-livsbegrensende-eller-alvorlig-langvarig-sykdom/beslutningsprosesser-for-behandlingsavklaringer): behandlingsmål, legemiddelnytte, belastning og forebyggende behandling.
- [Legemiddelhåndboka – praktisk avmedisinering](https://www.legemiddelhandboka.no/extended/oppfolging-og-optimalisering-av-legemiddelbehandling/avmedisinering/praktisk-gjennomforing-hvordan-avmedisinere): revurdering, nedtrapping og oppfølging.
- [Helsedirektoratet – sykdomsfaser og behandlingsintensjon](https://www.helsedirektoratet.no/retningslinjer/palliasjon-i-kreftomsorgen-handlingsprogram/innledning/sykdomsfaser-og-behandlingsintensjon): palliasjon er ikke synonymt med døende fase.

Varslet krever eksplisitt registrert behandlingskontekst, en presis palliativ fritekstdiagnose, importert Z51.5/Z51.50, eller eksisterende registrering av lindrende mål i livets sluttfase. Historiske/internasjonale koder legges ikke til som nye norske kodeforslag. Kreft, alder og opioidbruk er utilstrekkelig alene. Felt for prognose, skrøpelighet, START og CHA₂DS₂-VA endres ikke. Legemiddelmarkering krever aktiv behandling og eksplisitt registrert primær- eller sekundærforebygging.

## Blodtrykk

- [ESC 2024, originalartikkel](https://academic.oup.com/eurheartj/article/45/38/3912/7741010), kap. 5 (måling), 8.5.2–8.5.3 og figur 20 (mål og individualisering), 9.3 (eldre/skjørhet), 9.7.4 (nyresykdom), 10.1.1 (alvorlig hypertensjon). PDF av den samme retningslinjen hos [ISCP](https://api.iscpcardio.org/storage/guidelines/_24_HTA_ESC.pdf): side 19, 53–54, 60–62, 65. Disse sidetallene gjelder denne PDF-versjonen.
- [Helsedirektoratet – oppfølging og mål, avsnitt Blodtrykk](https://www.helsedirektoratet.no/retningslinjer/forebygging-av-hjerte-og-karsykdom/oppfolging-og-mal-for-kontroll-ved-forebygging-av-hjerte-og-karsykdom): norske mål vises separat fra ESC.
- [NHS – lavt blodtrykk](https://www.nhs.uk/conditions/low-blood-pressure-hypotension/): symptomer, legemiddelbidrag og individuell vurdering.

Markering gjelder registrerte målinger hos voksne, ikke oppnåelse av et automatisk valgt mål. Høy systolisk **eller** diastolisk verdi kan utløse kontroll. Stående enkeltmåling fastslår ikke ortostase. Ukjent målemetode gir ingen ordinær høyt-blodtrykk-klassifisering; svært høy eller lav verdi beholdes som kontrollpunkt. Alder må være kjent. Graviditet og barn får beskjed om egne råd, uten bruk av rutinegrensene for voksne. Legemiddelmarkering gjelder bare aktive preparater i ATC C02/C03/C07/C08/C09, og er ikke en påstand om årsak. kPa konverteres med 7,500616827 mmHg/kPa; enhetsbytte omregner eksisterende tall.

## Kilderekkefølge

Relevante retningslinjer før andre kildetyper, deretter etablert utgiverrekkefølge. Eksplisitte unntak: GINA først ved astma, GOLD først ved KOLS og Legemiddelhåndbokas praktiske nedtrappingsråd først ved seponering. Alle eksisterende relevans-, tilgangs- og temafiltre gjelder fortsatt. Rekkefølgen testes for ICD, ICPC, norsk og engelsk søk.


## Palliativ oversikt og lindrende skrin – kontroll 14.11.2026

- Hovedkilde: Helsedirektoratet, https://www.helsedirektoratet.no/faglige-rad/lindrende-behandling-i-livets-sluttfase . Generelle legemiddelråd og kapitlet «Legemidler for fremtidig behov» lest. Palliativ kontekst er ikke ensbetydende med livets sluttfase.
- Helse Bergen: https://www.helse-bergen.no/49b62b/siteassets/seksjon/klb/-/medikamentskrin/de_fire_viktigste_medikamentene.pdf , revidert mai 2025, lest. Morfin/oksykodon, midazolam, haloperidol og glykopyrronium. Doseringsalgoritmen er ikke gjengitt i appen.
- Metodebok: https://metodebok.no/emne/PTE9us96/lindrende-skrin/lindrende-behandling-(lindring-i-nord) , oppdatert 16.07.2026, lest i nettleser (web-parser fikk 403). Gjelder voksne i livets sluttfase.
- Kliniske ordinasjoner for midazolam/glykopyrronium og subkutan bruk kan ligge utenfor preparatomtalens godkjente indikasjon/administrasjonsmåte. De føyes ikke til godkjente indikasjonsforslag.
- Lokal oversiktslogikk: aktive N02A/N02B/M01A/M02A vises som registrerte smertestillende/opioider, ikke som bevist faktisk indikasjon eller automatisk seponeringskandidat. Andre skrin-koblinger krever injeksjonsform og presis ATC; depotinjeksjon, epidural/intratekal form og inhalasjon utelukkes. Ingen beskjed om manglende skrinmedisin utledes.
- Et manuelt forebyggende formål på slike symptommidler gir beskjed om å kontrollere registreringen. Opprinnelig data bevares. Produktbytte nullstiller behandlingsårsak og forebyggingsformål i kladden; redigering av samme preparat bevarer verdiene.

## Preparatspesifikke indikasjonsforslag

`indication-evidence.js` har kontrollerte, korte oppsummeringer fra de oppgitte produktinformasjonene, lest 14.11.2026. Match krever preparatnavn, legemiddelform og ATC, ikke bare ATC. Felles preparatomtaler dekker styrkene som er oppført i dokumentets navn. EMA-siden for Prialt bekrefter intratekal indikasjon; norsk PDF ga 429 ved kontroll, derfor siteres EMA-siden.

Dette dekker de identifiserte hullene for ordinære N02-preparater i katalogen, inkludert injeksjonsopioider. Det er ikke en komplett godkjent indikasjonsdatabase for alle FEST-preparater. Et forslag er et registreringshjelpemiddel, ikke en beslutning om egnet behandling. Pasientdiagnoser og bivirkninger brukes ikke til å produsere standardforslag. Detaljerte kontraindikasjoner, alder, dose og administrasjon må kontrolleres i produktinformasjonen.
