/* Curated adult SPC 4.8 summaries. See adverse-sources.md for scope and review.
 * A shared ATC is insufficient: ingredient composition and formulation must match.
 * No frequency is inferred from a class, spontaneous reports, or a cascade rule. */
(function(root){
'use strict';
const records=[
  {
    "atc": "C08CA01",
    "source": "Amlodipin Accord tab 10 mg",
    "url": "https://produktinformasjon.legemiddelsok.no/preparatomtaler/16-11439.pdf",
    "checked": "2026-11-03",
    "sha256": "892658678e8840c1cadf5ee63cc72f1d62b5f82b12307a7a65ad08c15cea4d34",
    "pages": [
      4
    ],
    "forms": [
      "Tablett",
      "Tablett, filmdrasjert"
    ],
    "ingredients": [
      "Amlodipin"
    ],
    "very": [
      "Ødem"
    ],
    "common": [
      "Hodepine og svimmelhet",
      "Hjertebank og rødme",
      "Kvalme og magesmerter",
      "Ankelhevelse og tretthet"
    ],
    "note": "",
    "contexts": []
  },
  {
    "atc": "C03CA01",
    "source": "Furix tab 20 mg",
    "url": "https://produktinformasjon.legemiddelsok.no/preparatomtaler/0000-07324.pdf",
    "checked": "2026-11-03",
    "sha256": "614739aeb7b541a101cb558afca30d362177ce341c41f0f201eab3be376d51d2",
    "pages": [
      5
    ],
    "forms": [
      "Tablett",
      "Tablett, filmdrasjert"
    ],
    "ingredients": [
      "Furosemid"
    ],
    "very": [
      "Elektrolyttforstyrrelser",
      "Dehydrering og redusert blodvolum"
    ],
    "common": [
      "Lavt kalium eller natrium",
      "Økt urinsyre og risiko for urinsyregikt"
    ],
    "note": "",
    "contexts": []
  },
  {
    "atc": "C03DA01",
    "source": "Spirix tab 100 mg",
    "url": "https://produktinformasjon.legemiddelsok.no/preparatomtaler/0000-07145.pdf",
    "checked": "2026-11-03",
    "sha256": "50a10f091198c55a46c282350216892cf8de3de6ac57e358b8c92fb7ab38856a",
    "pages": [
      4
    ],
    "forms": [
      "Tablett",
      "Tablett, filmdrasjert"
    ],
    "ingredients": [
      "Spironolakton"
    ],
    "very": [],
    "common": [
      "Brystforstørrelse hos menn",
      "Menstruasjonsforstyrrelser",
      "Døsighet, tretthet og hodepine",
      "Kvalme og diaré",
      "Erektil dysfunksjon"
    ],
    "note": "",
    "contexts": []
  },
  {
    "atc": "C09AA05",
    "source": "Ramipril Hexal tab 1,25 mg",
    "url": "https://produktinformasjon.legemiddelsok.no/preparatomtaler/03-2353.pdf",
    "checked": "2026-11-03",
    "sha256": "76411985e99c3b842523c51810dac8b7893067a2b14fd6e2b3e57f5d8b3f7907",
    "pages": [
      9,
      10,
      11,
      12
    ],
    "forms": [
      "Tablett",
      "Tablett, filmdrasjert"
    ],
    "ingredients": [
      "Ramipril"
    ],
    "very": [],
    "common": [
      "Tørrhoste",
      "Svimmelhet og hodepine",
      "Lavt blodtrykk, også ved oppreising",
      "Økt kalium",
      "Kvalme, diaré og mageubehag",
      "Utslett"
    ],
    "note": "",
    "contexts": []
  },
  {
    "atc": "C09CA06",
    "source": "Atacand tab 16 mg",
    "url": "https://produktinformasjon.legemiddelsok.no/preparatomtaler/1996-02907.pdf",
    "checked": "2026-11-03",
    "sha256": "1f9f719e39e0110e2a6661121ad2923685b80d91bd006e448eaa797e3a586a48",
    "pages": [
      7
    ],
    "forms": [
      "Tablett",
      "Tablett, filmdrasjert"
    ],
    "ingredients": [
      "Kandesartancileksetil"
    ],
    "very": [],
    "common": [],
    "note": "Preparatomtalen oppgir forskjellige frekvenser ved hypertensjon og hjertesvikt. Bruk avsnittet for aktuell indikasjon.",
    "contexts": [
      {
        "label": "Ved hypertensjon hos voksne",
        "very": [],
        "common": [
          "Svimmelhet og hodepine",
          "Luftveisinfeksjon"
        ]
      },
      {
        "label": "Ved hjertesvikt hos voksne",
        "very": [],
        "common": [
          "Økt kalium",
          "Lavt blodtrykk",
          "Nedsatt nyrefunksjon"
        ]
      }
    ]
  },
  {
    "atc": "C07AB02",
    "source": "Bloxazoc depottab 100 mg",
    "url": "https://produktinformasjon.legemiddelsok.no/preparatomtaler/14-10497.pdf",
    "checked": "2026-11-03",
    "sha256": "1ae3d70d8d07c705b2730010585f964c9f874b515d7295a729e2342ba193e096",
    "pages": [
      6
    ],
    "forms": [
      "Depottablett"
    ],
    "ingredients": [
      "Metoprolol"
    ],
    "very": [
      "Tretthet"
    ],
    "common": [
      "Svimmelhet og hodepine",
      "Langsom puls",
      "Kalde hender og føtter",
      "Hjertebank",
      "Tungpust ved anstrengelse",
      "Kvalme, mageplager og endret avføring"
    ],
    "note": "",
    "contexts": []
  },
  {
    "atc": "C10AA05",
    "source": "Atorvastatin Accord tab 10 mg",
    "url": "https://produktinformasjon.legemiddelsok.no/preparatomtaler/16-11026.pdf",
    "checked": "2026-11-03",
    "sha256": "7ff6fc7409a3ee1642f9d41b059f77ee244e16db3189676b3b2b1736319d0224",
    "pages": [
      11
    ],
    "forms": [
      "Tablett",
      "Tablett, filmdrasjert"
    ],
    "ingredients": [
      "Atorvastatin"
    ],
    "very": [],
    "common": [
      "Muskelsmerter og muskelkramper",
      "Leddsmerter",
      "Hodepine",
      "Kvalme, forstoppelse eller diaré",
      "Økt blodsukker",
      "Forhøyede leverenzymer eller kreatinkinase"
    ],
    "note": "",
    "contexts": []
  },
  {
    "atc": "C10AA01",
    "source": "Simvastatin Bluefish tab 10 mg",
    "url": "https://produktinformasjon.legemiddelsok.no/preparatomtaler/08-5739.pdf",
    "checked": "2026-11-03",
    "sha256": "d1db14f34d872cccfb4d8cf3c96bdc4a3b949ebd60dc908bde632bba3d2e83c6",
    "pages": [
      12
    ],
    "forms": [
      "Tablett",
      "Tablett, filmdrasjert"
    ],
    "ingredients": [
      "Simvastatin"
    ],
    "very": [],
    "common": [],
    "note": "Denne preparatomtalen har ingen generell liste klassifisert som vanlige eller svært vanlige bivirkninger. Blant annet muskelsmerter og mageplager er klassifisert som sjeldne. Den omtaler separat en doseavhengig risiko for myopati; se punkt 4.8. Dette betyr ikke at preparatet er uten bivirkninger.",
    "contexts": []
  },
  {
    "atc": "B01AF02",
    "source": "Eliquis tab 2,5 mg",
    "url": "https://www.ema.europa.eu/no/documents/product-information/eliquis-epar-product-information_no.pdf",
    "checked": "2026-11-03",
    "sha256": "071279c64f0c94a5ccb6a02c62b031184059ae96816e574ea7cb80951023ee76",
    "pages": [
      14,
      47,
      78,
      101
    ],
    "forms": [
      "Tablett",
      "Tablett, filmdrasjert"
    ],
    "ingredients": [
      "Apiksaban"
    ],
    "very": [],
    "common": [
      "Anemi",
      "Blødning og hematom",
      "Kvalme",
      "Blåmerker"
    ],
    "note": "Fellesutvalget gjelder voksne. Hyppighet varierer med indikasjonen. Tabellen for tromboseprofylakse etter hofte-/kneoperasjon må ikke erstattes med tabellen for atrieflimmer eller behandling av blodpropp.",
    "contexts": [
      {
        "label": "Ytterligere vanlige ved atrieflimmer",
        "very": [],
        "common": [
          "Neseblødning",
          "Blødning fra mage/tarm eller urinveier",
          "Lavt blodtrykk"
        ]
      },
      {
        "label": "Ytterligere vanlige ved behandling/forebygging av ny DVT eller lungeemboli",
        "very": [],
        "common": [
          "Neseblødning",
          "Blødning fra mage/tarm eller urinveier",
          "Lavt antall blodplater",
          "Utslett"
        ]
      }
    ]
  },
  {
    "atc": "B01AA03",
    "source": "Marevan tab 2,5 mg",
    "url": "https://produktinformasjon.legemiddelsok.no/preparatomtaler/0000-04456.pdf",
    "checked": "2026-11-03",
    "sha256": "6985119a7de76fde5a830ed398f2a8983bfc3b774314f338f25d400f5644a937",
    "pages": [
      9
    ],
    "forms": [
      "Tablett",
      "Tablett, filmdrasjert"
    ],
    "ingredients": [
      "Warfarin"
    ],
    "very": [
      "Blødninger"
    ],
    "common": [],
    "note": "Blødninger kan oppstå i ulike organer. Oversikten angir ikke alvorlighetsgrad eller individuell blødningsrisiko.",
    "contexts": []
  },
  {
    "atc": "B01AC06",
    "source": "Acetylsalisylsyre Actavis enterotab 75 mg",
    "url": "https://produktinformasjon.legemiddelsok.no/preparatomtaler/10-7441.pdf",
    "checked": "2026-11-03",
    "sha256": "e70c3f58c843adbe188004f5bdc1293b810148e4b6750bf187eb39ea213d213d",
    "pages": [
      6
    ],
    "forms": [
      "Enterotablett"
    ],
    "ingredients": [
      "Acetylsalisylsyre"
    ],
    "very": [],
    "common": [
      "Økt blødningstendens",
      "Fordøyelsesbesvær"
    ],
    "note": "",
    "contexts": []
  },
  {
    "atc": "B01AC04",
    "source": "Clopidogrel Accord tab 75 mg",
    "url": "https://produktinformasjon.legemiddelsok.no/preparatomtaler/12-9273.pdf",
    "checked": "2026-11-03",
    "sha256": "56c61f2476171219f8cbf9a354211da95ee5db2c48738aadf6be040a770d76c6",
    "pages": [
      8
    ],
    "forms": [
      "Tablett",
      "Tablett, filmdrasjert"
    ],
    "ingredients": [
      "Klopidogrel"
    ],
    "very": [],
    "common": [
      "Blåmerker og hematom",
      "Neseblødning",
      "Blødning fra mage/tarm",
      "Diaré, magesmerter og fordøyelsesbesvær",
      "Blødning på punksjonssted"
    ],
    "note": "",
    "contexts": []
  },
  {
    "atc": "A10BA02",
    "source": "Glucophage tab 1000 mg",
    "url": "https://produktinformasjon.legemiddelsok.no/preparatomtaler/2001-01628.pdf",
    "checked": "2026-11-03",
    "sha256": "d4ccb6f37858a7d6047c81b255412409f14768a2066ba77d856009867d6a5068",
    "pages": [
      7
    ],
    "forms": [
      "Tablett",
      "Tablett, filmdrasjert"
    ],
    "ingredients": [
      "Metformin"
    ],
    "very": [
      "Kvalme, oppkast og diaré",
      "Magesmerter og nedsatt appetitt"
    ],
    "common": [
      "Smaksforstyrrelser",
      "Redusert vitamin B12 / B12-mangel"
    ],
    "note": "Mageplagene er særlig aktuelle ved behandlingsstart.",
    "contexts": []
  },
  {
    "atc": "A10BK03",
    "source": "Jardiance tab 10 mg",
    "url": "https://www.ema.europa.eu/no/documents/product-information/jardiance-epar-product-information_no.pdf",
    "checked": "2026-11-03",
    "sha256": "4cc185905c344938738af7768bc3a27c436675a809711634240d25a3cb723983",
    "pages": [
      8
    ],
    "forms": [
      "Tablett",
      "Tablett, filmdrasjert"
    ],
    "ingredients": [
      "Empagliflozin"
    ],
    "very": [
      "Væsketap / redusert blodvolum",
      "Hypoglykemi ved samtidig sulfonylurea eller insulin"
    ],
    "common": [
      "Genitale infeksjoner",
      "Urinveisinfeksjon",
      "Økt vannlating og tørste",
      "Forstoppelse",
      "Kløe eller utslett"
    ],
    "note": "Frekvensene er fra samlet bivirkningstabell. Væsketap var hyppigere i hjertesviktstudiene enn i diabetesstudiene; frekvensen gjelder ikke likt i alle pasientgrupper.",
    "contexts": []
  },
  {
    "atc": "A10BK01",
    "source": "Forxiga tab 10 mg",
    "url": "https://www.ema.europa.eu/no/documents/product-information/forxiga-epar-product-information_no.pdf",
    "checked": "2026-11-03",
    "sha256": "b3543a2bd779f71731bc1e46e45ed310706cee2d7af8fa08dd3caa03e626089b",
    "pages": [
      8
    ],
    "forms": [
      "Tablett",
      "Tablett, filmdrasjert"
    ],
    "ingredients": [
      "Dapagliflozin"
    ],
    "very": [
      "Hypoglykemi ved samtidig sulfonylurea eller insulin"
    ],
    "common": [
      "Genitale infeksjoner",
      "Urinveisinfeksjon",
      "Økt vannlating eller ubehag ved vannlating",
      "Svimmelhet",
      "Ryggsmerter",
      "Utslett"
    ],
    "note": "Utvalget følger preparatomtalens tabell fra placebokontrollerte studier og erfaring etter markedsføring. Forekomst kan variere med indikasjonen.",
    "contexts": []
  },
  {
    "atc": "A10BH01",
    "source": "Januvia tab 100 mg",
    "url": "https://www.ema.europa.eu/no/documents/product-information/januvia-epar-product-information_no.pdf",
    "checked": "2026-11-03",
    "sha256": "2474db171a7154946f550ced1d6f1131299130c54d8f9782f275da1e9c00887a",
    "pages": [
      6
    ],
    "forms": [
      "Tablett",
      "Tablett, filmdrasjert"
    ],
    "ingredients": [
      "Sitagliptin"
    ],
    "very": [],
    "common": [
      "Hodepine",
      "Hypoglykemi"
    ],
    "note": "Utvalget følger tabellen for sitagliptin alene. Hypoglykemi kan være hyppigere sammen med insulin eller sulfonylurea; preparatomtalen beskriver kombinasjonene separat.",
    "contexts": []
  },
  {
    "atc": "A02BC01",
    "source": "Losec Mups enterotab 10 mg",
    "url": "https://produktinformasjon.legemiddelsok.no/preparatomtaler/1997-00452.pdf",
    "checked": "2026-11-03",
    "sha256": "8838a57791ddccfc7ed3279c06357968888a3a37300351c13e7174b5d9655794",
    "pages": [
      8
    ],
    "forms": [
      "Enterotablett"
    ],
    "ingredients": [
      "Omeprazol"
    ],
    "very": [],
    "common": [
      "Hodepine",
      "Magesmerter",
      "Forstoppelse eller diaré",
      "Luftplager",
      "Kvalme og oppkast",
      "Godartede kjertelpolypper i magesekken"
    ],
    "note": "",
    "contexts": []
  },
  {
    "atc": "A02BC02",
    "source": "Pantoprazol Actavis enterotab 20 mg",
    "url": "https://produktinformasjon.legemiddelsok.no/preparatomtaler/07-4730.pdf",
    "checked": "2026-11-03",
    "sha256": "492601ef9d01c33c248f9590fd309175aad24792ed4c4cee72a349dba7192195",
    "pages": [
      5
    ],
    "forms": [
      "Enterotablett"
    ],
    "ingredients": [
      "Pantoprazol"
    ],
    "very": [],
    "common": [
      "Godartede kjertelpolypper i magesekken"
    ],
    "note": "Hodepine, svimmelhet, diaré og kvalme er i denne preparatomtalen mindre vanlige, ikke vanlige. Frekvenser overføres ikke fra andre protonpumpehemmere.",
    "contexts": []
  },
  {
    "atc": "A07DA03",
    "source": "Imodium smeltetab 2 mg",
    "url": "https://produktinformasjon.legemiddelsok.no/preparatomtaler/22-14584.pdf",
    "checked": "2026-11-03",
    "sha256": "fc3a57205a518d8037e8e31525d3fab38235dd1ff9e7036d9a989e5d14823afc",
    "pages": [
      4
    ],
    "forms": [
      "Smeltetablett",
      "Tablett",
      "Tablett, filmdrasjert",
      "Kapsel, hard"
    ],
    "ingredients": [
      "Loperamid"
    ],
    "very": [],
    "common": [
      "Forstoppelse",
      "Kvalme",
      "Luftplager"
    ],
    "note": "",
    "contexts": [
      {
        "label": "Ved akutt diaré",
        "very": [],
        "common": [
          "Hodepine"
        ]
      },
      {
        "label": "Ved kronisk diaré",
        "very": [],
        "common": [
          "Svimmelhet"
        ]
      }
    ]
  },
  {
    "atc": "N02BF01",
    "source": "Neurontin kaps 100 mg",
    "url": "https://produktinformasjon.legemiddelsok.no/preparatomtaler/2000-02995.pdf",
    "checked": "2026-11-03",
    "sha256": "674e7202efd087cc4549d6927f58deaf249ad8c092880682af28b338a9d7cd97",
    "pages": [
      8
    ],
    "forms": [
      "Kapsel, hard"
    ],
    "ingredients": [
      "Gabapentin"
    ],
    "very": [
      "Søvnighet og svimmelhet",
      "Ustøhet / ataksi",
      "Tretthet"
    ],
    "common": [
      "Perifert ødem",
      "Vektøkning",
      "Kvalme, oppkast og mageplager",
      "Synsforstyrrelser",
      "Hodepine"
    ],
    "note": "",
    "contexts": []
  },
  {
    "atc": "N02BF02",
    "source": "Lyrica kaps 150 mg",
    "url": "https://www.ema.europa.eu/no/documents/product-information/lyrica-epar-product-information_no.pdf",
    "checked": "2026-11-03",
    "sha256": "65e100950a255ef5fffaa123133d7e13f61ac54a7f928b5afe904b85b2e0e1c3",
    "pages": [
      9,
      26,
      42
    ],
    "forms": [
      "Kapsel, hard"
    ],
    "ingredients": [
      "Pregabalin"
    ],
    "very": [
      "Svimmelhet, søvnighet og hodepine"
    ],
    "common": [
      "Perifert ødem",
      "Vektøkning og økt appetitt",
      "Ustøhet og koordinasjonsvansker",
      "Munntørrhet, kvalme eller forstoppelse",
      "Synsforstyrrelser",
      "Tretthet"
    ],
    "note": "",
    "contexts": []
  },
  {
    "atc": "N02AA05",
    "source": "Oxycodone Actavis kaps 10 mg",
    "url": "https://produktinformasjon.legemiddelsok.no/preparatomtaler/11-8801.pdf",
    "checked": "2026-11-03",
    "sha256": "af2ebed16d93574edc252de3b95ff80a3336d75e92fa236a7fcd8085451e87be",
    "pages": [
      8
    ],
    "forms": [
      "Kapsel, hard"
    ],
    "ingredients": [
      "Oksykodon"
    ],
    "very": [
      "Forstoppelse, kvalme og oppkast",
      "Søvnighet, svimmelhet og hodepine",
      "Kløe"
    ],
    "common": [
      "Munntørrhet og mageplager",
      "Nedsatt appetitt",
      "Forvirring og søvnvansker",
      "Svetting",
      "Tretthet"
    ],
    "note": "",
    "contexts": []
  },
  {
    "atc": "N02AX02",
    "source": "Nobligan kaps 50 mg",
    "url": "https://produktinformasjon.legemiddelsok.no/preparatomtaler/0000-08268.pdf",
    "checked": "2026-11-03",
    "sha256": "0848ca9753aa7d2d4f267bfff662aafaafe12818903b63ccd373bba6909a3920",
    "pages": [
      6
    ],
    "forms": [
      "Kapsel, hard"
    ],
    "ingredients": [
      "Tramadol"
    ],
    "very": [
      "Kvalme og svimmelhet"
    ],
    "common": [
      "Forstoppelse",
      "Munntørrhet og oppkast",
      "Hodepine og søvnighet",
      "Svetting og tretthet"
    ],
    "note": "",
    "contexts": []
  },
  {
    "atc": "N06AB06",
    "source": "Sertralin Bluefish tab 100 mg",
    "url": "https://produktinformasjon.legemiddelsok.no/preparatomtaler/07-5253.pdf",
    "checked": "2026-11-03",
    "sha256": "865223c25b7df581a745df0856119c9473f4f3a45e67b65848d9366d58f8154c",
    "pages": [
      9
    ],
    "forms": [
      "Tablett",
      "Tablett, filmdrasjert"
    ],
    "ingredients": [
      "Sertralin"
    ],
    "very": [
      "Kvalme, diaré og munntørrhet",
      "Søvnløshet",
      "Svimmelhet, søvnighet og hodepine",
      "Tretthet",
      "Ejakulasjonssvikt"
    ],
    "common": [
      "Nedsatt libido",
      "Skjelving",
      "Mageplager og forstoppelse",
      "Økt svetting",
      "Vektøkning"
    ],
    "note": "",
    "contexts": []
  },
  {
    "atc": "N06AX21",
    "source": "Cymbalta enterokaps 60 mg",
    "url": "https://www.ema.europa.eu/no/documents/product-information/cymbalta-epar-product-information_no.pdf",
    "checked": "2026-11-03",
    "sha256": "762ac9e60fc5bc9886c2bd42b11fb077bcbdc485c5c63c4b3c89419acd9ec113",
    "pages": [
      9
    ],
    "forms": [
      "Enterokapsel, hard"
    ],
    "ingredients": [
      "Duloksetin"
    ],
    "very": [
      "Kvalme og munntørrhet",
      "Hodepine og søvnighet"
    ],
    "common": [
      "Svimmelhet",
      "Forstoppelse, diaré og mageplager",
      "Økt svetting",
      "Søvnproblemer",
      "Seksuelle funksjonsforstyrrelser"
    ],
    "note": "",
    "contexts": []
  },
  {
    "atc": "N06AA09",
    "source": "Amitriptylin Abcur tab 10 mg",
    "url": "https://produktinformasjon.legemiddelsok.no/preparatomtaler/16-11418.pdf",
    "checked": "2026-11-03",
    "sha256": "33e294ea01fe1bcb1275b9f4a3e4d3f8778faa50815adebca812fd88a7532a5c",
    "pages": [
      8
    ],
    "forms": [
      "Tablett",
      "Tablett, filmdrasjert"
    ],
    "ingredients": [
      "Amitriptylin"
    ],
    "very": [
      "Munntørrhet, forstoppelse og kvalme",
      "Søvnighet, svimmelhet og skjelving",
      "Blodtrykksfall ved oppreising",
      "Hjertebank",
      "Vektøkning",
      "Økt svetting"
    ],
    "common": [
      "Forvirring",
      "Vannlatingsvansker",
      "Erektil dysfunksjon",
      "Tretthet"
    ],
    "note": "",
    "contexts": []
  },
  {
    "atc": "N05CF01",
    "source": "Imovane tab 7,5 mg",
    "url": "https://produktinformasjon.legemiddelsok.no/preparatomtaler/0000-07999.pdf",
    "checked": "2026-11-03",
    "sha256": "1b37d70786f1b90de7dac6f6494e9d707dba3d1c37efa728ed5b91cb5635923d",
    "pages": [
      5
    ],
    "forms": [
      "Tablett",
      "Tablett, filmdrasjert"
    ],
    "ingredients": [
      "Zopiklon"
    ],
    "very": [],
    "common": [
      "Bitter smak",
      "Døsighet og tretthet neste morgen",
      "Munntørrhet"
    ],
    "note": "",
    "contexts": []
  },
  {
    "atc": "N05BA04",
    "source": "Delipam tab 10 mg",
    "url": "https://produktinformasjon.legemiddelsok.no/preparatomtaler/22-14742.pdf",
    "checked": "2026-11-03",
    "sha256": "df462bcb37fcb30bf001649dc22a31d2f8abf26b90ff1a265f7f32f27297c543",
    "pages": [
      4
    ],
    "forms": [
      "Tablett",
      "Tablett, filmdrasjert"
    ],
    "ingredients": [
      "Oksazepam"
    ],
    "very": [],
    "common": [],
    "note": "Døsighet beskrives som den hyppigste bivirkningen (10–15 %), men står som «vanlig» i tabellen i denne preparatomtalen. Derfor vises den uten entydig frekvensgruppe her. Bivirkningene er doseavhengige, og eldre er mer følsomme.",
    "contexts": []
  },
  {
    "atc": "N06DA02",
    "source": "Donepezil Accord tab 10 mg",
    "url": "https://produktinformasjon.legemiddelsok.no/preparatomtaler/11-8285.pdf",
    "checked": "2026-11-03",
    "sha256": "e0762c49b562484475d46ff4c8d14415ff5c6ca6e7b8182643b13bee7f760a77",
    "pages": [
      4
    ],
    "forms": [
      "Tablett",
      "Tablett, filmdrasjert"
    ],
    "ingredients": [
      "Donepezil"
    ],
    "very": [
      "Diaré, kvalme og hodepine"
    ],
    "common": [
      "Oppkast og mageplager",
      "Muskelkramper",
      "Søvnvansker og unormale drømmer",
      "Svimmelhet og besvimelse",
      "Urininkontinens",
      "Tretthet"
    ],
    "note": "",
    "contexts": []
  },
  {
    "atc": "N04BA02",
    "source": "Carbidopa/Levodopa Fair-Med tab 12,5 mg/50 mg",
    "url": "https://produktinformasjon.legemiddelsok.no/preparatomtaler/14-10069.pdf",
    "checked": "2026-11-03",
    "sha256": "3c0fa99fa5812d055f66b2a095a33eb0ad0101a8eb7c1cb565323a86f21d5096",
    "pages": [
      6
    ],
    "forms": [
      "Tablett",
      "Tablett, filmdrasjert"
    ],
    "ingredients": [
      "Karbidopa",
      "Levodopa"
    ],
    "very": [
      "Urinveisinfeksjon"
    ],
    "common": [
      "Ufrivillige bevegelser / dyskinesier",
      "Kvalme og munntørrhet",
      "Hallusinasjoner og forvirring",
      "Søvnighet",
      "Blodtrykksfall ved oppreising"
    ],
    "note": "Gjelder karbidopa/levodopa tabletter. Andre kombinasjoner og formuleringer har egne preparatomtaler.",
    "contexts": []
  },
  {
    "atc": "M01AE01",
    "source": "Brufen Retard depottab 800 mg",
    "url": "https://produktinformasjon.legemiddelsok.no/preparatomtaler/0000-07614.pdf",
    "checked": "2026-11-03",
    "sha256": "574479587b81318d0e98cb73df81bea00c776715004ff8015354d266b589cf6c",
    "pages": [
      6
    ],
    "forms": [
      "Depottablett"
    ],
    "ingredients": [
      "Ibuprofen"
    ],
    "very": [],
    "common": [
      "Fordøyelsesbesvær og magesmerter",
      "Kvalme, oppkast og diaré",
      "Forstoppelse og luftplager",
      "Blødning fra mage/tarm",
      "Hodepine og svimmelhet",
      "Utslett"
    ],
    "note": "",
    "contexts": []
  },
  {
    "atc": "M05BA04",
    "source": "Alendronat Bluefish tab 70 mg",
    "url": "https://produktinformasjon.legemiddelsok.no/preparatomtaler/08-5760.pdf",
    "checked": "2026-11-03",
    "sha256": "f899a71621d4e8a91276994f7b50c6e3fcd4f0344634da1eab5fd89275919cc8",
    "pages": [
      5
    ],
    "forms": [
      "Tablett",
      "Tablett, filmdrasjert"
    ],
    "ingredients": [
      "Alendronsyre"
    ],
    "very": [
      "Smerter i muskler, ledd eller skjelett"
    ],
    "common": [
      "Magesmerter og fordøyelsesbesvær",
      "Forstoppelse, diaré og luftplager",
      "Sure oppstøt",
      "Svelgevansker eller sår i spiserøret",
      "Hodepine og svimmelhet"
    ],
    "note": "",
    "contexts": []
  },
  {
    "atc": "H02AB06",
    "source": "Prednisolon tab 2,5 mg",
    "url": "https://produktinformasjon.legemiddelsok.no/preparatomtaler/0000-06689.pdf",
    "checked": "2026-11-03",
    "sha256": "983fbcd714537a5305ba922bca511c2652c70e2f4e23a72fb7c2fd78370a72b8",
    "pages": [
      6
    ],
    "forms": [
      "Tablett",
      "Tablett, filmdrasjert"
    ],
    "ingredients": [
      "Prednisolon"
    ],
    "very": [],
    "common": [
      "Økt infeksjonsutsatthet",
      "Væskeretensjon / ødem",
      "Lavt kalium",
      "Tynnere hud",
      "Muskelatrofi",
      "Humørendringer, depresjon eller psykose"
    ],
    "note": "Risikoen avhenger blant annet av dose og behandlingsvarighet. Økt blodsukker og osteoporose er omtalt uten kjent frekvens i denne preparatomtalen og inngår derfor ikke i frekvensgruppen over.",
    "contexts": []
  },
  {
    "atc": "B03AA07",
    "source": "Duroferon depottab 100 mg",
    "url": "https://produktinformasjon.legemiddelsok.no/preparatomtaler/0000-05680.pdf",
    "checked": "2026-11-03",
    "sha256": "ee71cf4907bdb9a7c6825ade9f5d9abb71bd22cdfdd3b281953921c47c294cec",
    "pages": [
      3
    ],
    "forms": [
      "Depottablett"
    ],
    "ingredients": [
      "Jern(II)ion"
    ],
    "very": [],
    "common": [
      "Uvelhet og magesmerter",
      "Diaré eller forstoppelse"
    ],
    "note": "",
    "contexts": []
  },
  {
    "atc": "R03AC02",
    "source": "Airomir Autohaler inh aerosol, susp 0,1 mg/dose",
    "url": "https://produktinformasjon.legemiddelsok.no/preparatomtaler/1997-04923.pdf",
    "checked": "2026-11-03",
    "sha256": "c3f5a71ea40d0ad0d6b1ff38cb4c6a70fb88c18291195c8ee74d3116a4e47343",
    "pages": [
      4
    ],
    "forms": [
      "Inhalasjonsaerosol, suspensjon"
    ],
    "ingredients": [
      "Salbutamol"
    ],
    "very": [],
    "common": [
      "Skjelving",
      "Hodepine og svimmelhet",
      "Rask puls"
    ],
    "note": "",
    "contexts": []
  },
  {
    "atc": "R03BA02",
    "source": "Giona Easyhaler inh pulv 100 mikrog/dose",
    "url": "https://produktinformasjon.legemiddelsok.no/preparatomtaler/03-2340.pdf",
    "checked": "2026-11-03",
    "sha256": "f3b1c04ae25cc15e3745b61a550c62294af623a77b62b8a6860c1debf5ffad30",
    "pages": [
      6
    ],
    "forms": [
      "Inhalasjonspulver"
    ],
    "ingredients": [
      "Budesonid"
    ],
    "very": [],
    "common": [
      "Soppinfeksjon i munn eller svelg",
      "Hoste og halsirritasjon",
      "Svelgevansker"
    ],
    "note": "Dette utvalget gjelder Giona Easyhaler inhalasjonspulver. Heshet er klassifisert som sjelden i denne preparatomtalen.",
    "contexts": []
  },
  {
    "atc": "H03AA01",
    "source": "Euthyrox tab 100 mikrog",
    "url": "https://produktinformasjon.legemiddelsok.no/preparatomtaler/2001-0523.pdf",
    "checked": "2026-11-03",
    "sha256": "c1d6f353657ef75034aea350954be2ac68d2c9a5f8b5d56d5beaa200c8982acc",
    "pages": [
      6
    ],
    "forms": [
      "Tablett",
      "Tablett, filmdrasjert"
    ],
    "ingredients": [
      "Levotyroksin"
    ],
    "very": [],
    "common": [],
    "note": "Preparatomtalen angir ikke tallfestede frekvensgrupper. Ved for høy dose eller for rask doseøkning kan symptomer som hjertebank, skjelving, svetting, søvnvansker og diaré forekomme. Dette er ikke en liste klassifisert som vanlige bivirkninger.",
    "contexts": []
  },
  {
    "atc": "J01CA04",
    "source": "Amoxicillin Sandoz disperg tab 1000 mg",
    "url": "https://produktinformasjon.legemiddelsok.no/preparatomtaler/03-2054.pdf",
    "checked": "2026-11-03",
    "sha256": "29263f3ba5c9defbf20211a3bcad93a51e6274cfc97a874033d33d796ba9963b",
    "pages": [
      8
    ],
    "forms": [
      "Dispergerbar tablett"
    ],
    "ingredients": [
      "Amoksicillin"
    ],
    "very": [],
    "common": [
      "Diaré og kvalme",
      "Hudutslett"
    ],
    "note": "",
    "contexts": []
  },
  {
    "atc": "J01FA09",
    "source": "Clarithromycin Accord tab 250 mg",
    "url": "https://produktinformasjon.legemiddelsok.no/preparatomtaler/16-11072.pdf",
    "checked": "2026-11-03",
    "sha256": "5846076eef28867ed0459a73e1347eb4d72ab273405f066eae6bb94d46c29171",
    "pages": [
      10
    ],
    "forms": [
      "Tablett",
      "Tablett, filmdrasjert",
      "Depottablett"
    ],
    "ingredients": [
      "Klaritromycin"
    ],
    "very": [],
    "common": [
      "Diaré, kvalme, oppkast og magesmerter",
      "Smaksforstyrrelser",
      "Hodepine",
      "Søvnvansker",
      "Utslett og økt svetting"
    ],
    "note": "Utvalget utelater bivirkninger som i kilden bare er knyttet til intravenøs administrasjon.",
    "contexts": []
  }
];
const norm=s=>String(s||'').normalize('NFKC').trim().toLocaleLowerCase('nb');
const composition=xs=>Array.isArray(xs)?xs.map(norm).sort().join('|'):'';
function find(product){
 if(!product||!product.atc||!product.form||!composition(product.ingredients))return null;
 const candidates=records.filter(r=>r.atc===product.atc&&r.forms.some(f=>norm(f)===norm(product.form))&&composition(r.ingredients)===composition(product.ingredients));
 const r=candidates.find(r=>r.url===product.spc)||candidates[0];
 return r?{...r,exact:r.url===product.spc}:null;
}
const api={records,find};root.IMMAdverse=api;
if(typeof module!=='undefined'&&module.exports)module.exports=api;
})(typeof window!=='undefined'?window:globalThis);
