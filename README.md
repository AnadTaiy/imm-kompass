# IMM Kompass

Laget av Mohanad Taiy, 2026 – Til egen læring. Et selvstendig studentprosjekt; ikke et offisielt UiT-verktøy eller klinisk beslutningsstøtte.

Et eget prosjekt for legemiddelsamstemming, legemiddelgjennomgang og journalutkast.

Nettadresse: https://anadtaiy.github.io/imm-kompass/

Gjennomganger lagres i brukerens nettleser. Bruk fiktive øvingskasus. Eksporter før du bytter nettleser, datamaskin eller nettadresse. Ingen gjennomganger skal legges i dette repositoriet.

FEST og diagnosekodeverk kontrolleres hver sjette time gjennom GitHub Actions. Siste kontrollerte versjon beholdes ved nettfeil. Versjonsdato og kontrolltidspunkt vises separat. Planlagte kjøringer kan bli forsinket eller deaktiveres av GitHub ved inaktivitet; appen varsler når registrert kontroll er eldre enn 30 timer. Kliniske kontrollpunkter krever separat faglig vedlikehold.

Byggmiljø: Python 3.13 og Node 24. Ingen tilleggspakker. Kjør `python build_site.py --sync`. Bare mappen `site` publiseres.

FEST: Direktoratet for medisinske produkter, NLOD. Lokal presentasjon er ikke godkjent av DMP. ICD-10/ICPC-2: Helsedirektoratet. STOPP/START: O’Mahony et al. (2023), CC BY 4.0; kilde og lokale tillegg er merket i appen. Betalte oppslagsverk åpnes hos utgiver med brukerens egen tilgang.

STOPP-filtrering: ATC-gruppe alene gir ikke et personlig kontrollpunkt. `work/stopp-context.js` krever registrert kontekst og skiller automatiske forslag fra manuelle oppslag. Ukjente opplysninger tolkes ikke som fravær av sykdom. Alle 133 STOPP-kriterier finnes manuelt. Bare uttrykkelig modellerte vilkår eller en gyldig, manuell bekreftelse kan gi en STOPP-markering. Kliniske bekreftelser blir ugyldige når relevante opplysninger eller regelversjonen endres.

`work/stopp-nb.json` er en lokal norsk oversettelse/bearbeiding av den lisensierte originalen (2023), kontrollert mot [norsk STOPP i Legemiddelhåndboka](https://www.legemiddelhandboka.no/stopp-2), revidert 01.12.2024. Forskjeller er oppgitt i `work/stopp-notes-nb.json`, blant annet tidsgrensen for lungeemboli og enkelte unntak. Oversettelsen og ATC-/diagnosekoblingene er ikke en klinisk validert implementering av forfatternes kriterier. Gjennomgått 26.10.2026. Regresjonstester: `node work/test_stopp_context.cjs`. En lokal testfil kan gis som ekstra argument; pasientdata skal aldri legges i repo eller publiseringsdata.
