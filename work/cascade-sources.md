# Prescribing cascades and adverse-effect lookup

Reviewed 2026-11-04. Norwegian labels and matching logic are local adaptations,
not a validated clinical algorithm. The module does not make treatment changes.

## Primary sources

- Rochon PA et al. International expert panel's potentially inappropriate
  prescribing cascades (PIPC) list. European Geriatric Medicine (2025).
  DOI: 10.1007/s41999-025-01215-x.
  <https://pmc.ncbi.nlm.nih.gov/articles/PMC12712104/>, Table 1, 65 rows.
- Correction, DOI: 10.1007/s41999-025-01378-7.
  <https://pmc.ncbi.nlm.nih.gov/articles/PMC12945913/>.
  This changes the article's access/copyright to CC BY 4.0; it does not replace
  or clinically amend Table 1. Attribution and a link to the correction are
  displayed in the app. <https://creativecommons.org/licenses/by/4.0/>.
- Norsk legemiddelhåndbok, bivirkninger og legemiddelovervåking:
  <https://www.legemiddelhandboka.no/extended/farmakologi/bivirkninger-og-legemiddelovervaking>.
  Causality needs clinical assessment, exposure/time course and other causes.
- Norsk legemiddelhåndbok, kalsiumantagonister:
  <https://www.legemiddelhandboka.no/virkestoff/kalsiumantagonister>.
- DMP, Bivirkninger av ditt legemiddel:
  <https://www.dmp.no/bivirkninger-og-sikkerhet/bivirkningsrapporter-og-oversikter/bivirkninger-av-ditt-legemiddel>.
- DMP FEST implementation guide v3.6, §5.12 (page 43): centrally authorised
  products carry SPC links on packages, other authorisations on brands.
  <https://www.dmp.no/contentassets/3cb9b85e742745d4b1db7d899eb987b7/202511_implementeringsveiledning-fest-v3.6.pdf>.

## Traceability and interpretation

`cascade-policy.js` keeps all 65 table rows in order. `PIPC-01` through `PIPC-65`
are local IDs, not identifiers assigned by the authors. There are seven areas:
cardiovascular, CNS, endocrine, gastrointestinal, musculoskeletal, urogenital,
and miscellaneous. This is not a complete index of all possible cascades in
every specialty, nor of every possible adverse effect.

62 rows support selective automatic matches. Three remain reference-only:

- 27: bismuth subsalicylate lacks an unambiguous local ATC identification.
- 49: Table 1 repeats “Vitamin or Mineral Deficiency” in the drug B column.
  No treatment is inferred from that apparent editorial error.
- 57: saliva substitutes cannot safely be identified using a broad shared ATC.

ATC mappings use the FEST code hierarchy. Mapping is deliberately narrower
than some classes: selected oral iron, thiazide/loop diuretics for gout,
specified SNRIs/TCAs and combination codes, systemic NSAIDs/erythromycin/
corticosteroids, and oral bisphosphonates. Form is required for the last group.
Combination coverage is explicit and incomplete; no ingredient is inferred
from a brand name. Current and former gabapentinoid ATCs are recognised.
Lithium, maprotiline, beta-3 bladder agonists and sacubitril/valsartan do not
inherit unrelated antipsychotic, TCA, antimuscarinic or CCB rules.

PIPC concerns older adults. The local automatic screen requires age >=65 and
<140; blank/invalid age does not trigger it. Two active medicines are required.
The first evidence path uses a positive symptom in medicine B's indication.
The second permits a labelled **patient-context candidate** when B's indication
is absent, explicitly unknown, or a whole generic medicine-class label such as
“vanndrivende”. Diagnoses and symptoms already entered in the patient background
are then checked for the same event. A specific different indication is not
replaced. These are local screening rules, not a diagnostic algorithm from PIPC.
The flag identifies which evidence path was used. Diagnosis text is never copied
into the medicine's indication, and source URLs carry only the public rule/ATC/
FEST IDs plus the non-identifying `basis=patient` flag. No patient text is sent.
ICD/ICPC labels are matched as recorded text, not guessed from an ATC or code.

Negation, historical/family context and prophylaxis are excluded conservatively
on both evidence paths. Depression, hypertension, arrhythmia, hyperglycaemia,
cognitive impairment, psychosis, heart failure, osteoporosis and seizures also
require new/worsening/drug-related wording in the matching clause. A chronic
hypertension diagnosis alone therefore does not trigger the NSAID/BP cascade.
An explicit alternative cause of edema in the matching indication/diagnosis,
e.g. heart failure, suppresses that edema match. A separate diagnosis alone is
not assumed to establish the cause of the edema. These choices trade missed
cases against incidental co-prescribing alerts; manual review remains necessary.

Paused/stopped/non-use entries are excluded. Where recorded duration shows B
predating A, no match is emitted. The ordinary registration date is not used as
an initiation date. No unknown time course or causality is assumed confirmed.
The warning means “check this possible relationship”, not “stop medication”.
No absence of a flag is presented as a negative clinical finding.

## Common adverse effects

FEST supplies product identifiers and SPC links, not a complete structured
frequency table. A PIPC event must never be labelled common just because it
appears in that list. Reviewed hover excerpts require matching composition, formulation and ATC,
with direct SPC matches preferred and representative-source matches labelled.
The first three entries have been expanded to 39 reviewed SPCs on 2026-11-03.
See [adverse-sources.md](adverse-sources.md) and `adverse-effects.js` for exact
sources, formulation/composition gates, labelled representative-product
lookups, frequency exceptions and maintenance. This is not FEST-wide coverage
and is not an automatic live SPC import.

## Validation and maintenance

`test_cascades.cjs` covers every active table row plus exclusions, age boundaries,
combination/route specificity, non-use, cache invalidation, HTML escaping, source
URL privacy, Help, SPC coverage and runtime. Build and staged sync share
`app-files.json` so a newly added module cannot silently disappear in tests.
The SPC parser keeps direct brand URLs and only uses a package fallback when
the exact brand reference has one unique URL. Conflicting links are not guessed.

Before expanding: verify the source, indication and route, add positive and
negative examples, review frequency against the exact SPC, then update date
and coverage text. No automatic broadening to an entire ATC family.
