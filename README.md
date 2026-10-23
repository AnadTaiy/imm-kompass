# IMM Kompass

Laget av Mohanad Taiy, 2026 – Til egen læring. Et selvstendig studentprosjekt; ikke et offisielt UiT-verktøy eller klinisk beslutningsstøtte.

Et eget prosjekt for legemiddelsamstemming, legemiddelgjennomgang og journalutkast.

Nettadresse: https://anadtaiy.github.io/imm-kompass/

Gjennomganger lagres i brukerens nettleser. Bruk fiktive øvingskasus. Eksporter før du bytter nettleser, datamaskin eller nettadresse. Ingen gjennomganger skal legges i dette repositoriet.

FEST og diagnosekodeverk kontrolleres hver sjette time gjennom GitHub Actions. Siste kontrollerte versjon beholdes ved nettfeil. Versjonsdato og kontrolltidspunkt vises separat. Planlagte kjøringer kan bli forsinket eller deaktiveres av GitHub ved inaktivitet; appen varsler når registrert kontroll er eldre enn 30 timer. Kliniske kontrollpunkter krever separat faglig vedlikehold.

Byggmiljø: Python 3.13 og Node 24. Ingen tilleggspakker. Kjør `python build_site.py --sync`. Bare mappen `site` publiseres.

FEST: Direktoratet for medisinske produkter, NLOD. Lokal presentasjon er ikke godkjent av DMP. ICD-10/ICPC-2: Helsedirektoratet. STOPP/START: O’Mahony et al. (2023), CC BY 4.0; kilde og lokale tillegg er merket i appen. Betalte oppslagsverk åpnes hos utgiver med brukerens egen tilgang.