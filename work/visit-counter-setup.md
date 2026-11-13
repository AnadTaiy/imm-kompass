# Privat besøksstatistikk

Telleren er avslått når byggvariabelen `IMM_GOATCOUNTER_SITE` er tom. Admin-knappen åpner da GoatCounters nettside.

## Aktivering

1. Opprett en GoatCounter-konto utenfor appen. Velg et offentlig kontonavn. Kontoadressen er synlig i nettleseren og er ingen innloggingshemmelighet.
2. Velg **Dashboard viewable by → Only logged in users**. Behold bare eierkontoen under Users. Ikke opprett en hemmelig delingslenke.
3. La **Allow adding visitor counts on your website** være avslått, og ikke tillat innbygging av dashbordet.
4. Begrens Data collection til besøk/sesjoner. Deaktiver detaljert lagring av individuelle sidevisninger, sted, nettleser, system, språk, skjermstørrelse og referanser hvis disse valgene vises. Nettverkstilkoblingen bruker fremdeles tekniske opplysninger som IP og User-Agent.
5. Sett repository-variabelen `IMM_GOATCOUNTER_SITE` i GitHub Actions til `https://<kontonavn>.goatcounter.com`. Ingen passord, API-nøkler eller innloggingstokener skal ligge i repo, byggefiler eller appen.
6. Kjør Pages-arbeidsflyten. Bekreft at besøket telles og at dashbordet krever innlogging også fra en utlogget nettleser.

For lokal byggkontroll kan samme miljøvariabel brukes. Localhost og andre domener enn IMM Kompass på GitHub Pages sender aldri besøk. Tøm variabelen og bygg på nytt for å deaktivere telleren.

## Hva som sendes

Kun en GET til GoatCounters dokumenterte `/count` med den faste adressen `/imm-kompass/`, den faste tittelen `IMM Kompass` og tom referanse. Ingen kliniske opplysninger, URL-parametere, fritekst, skjemainnhold, lagrede gjennomganger, informasjonskapsler eller innloggingstoken leses eller sendes av integrasjonen. HTTP Referer utelates. Ingen ekstern JavaScript-kode lastes inn.

Telleren venter til siden er synlig, ignorerer iframes, automatiserte nettlesere, Do Not Track og Global Privacy Control, og lar appen fungere hvis telling blokkeres eller feiler. GoatCounter avgrenser besøk i sesjoner; dette er ikke et eksakt antall personer per kalenderdag.

Admin-knappen er en lenke til GoatCounter, ikke en lokal innloggingsmekanisme. Tilgangskontrollen utføres av GoatCounters server.

Kilder: [Tracking pixel](https://www.goatcounter.com/help/pixel), [tilgangsinnstillinger](https://github.com/arp242/goatcounter/blob/main/tpl/settings_main.gohtml), [personvern](https://www.goatcounter.com/help/privacy), [sesjoner](https://www.goatcounter.com/help/sessions).
