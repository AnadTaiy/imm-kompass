# Indication suggestions: provenance and boundaries

Reviewed 2026-11-04 following an edema/amlodipine report.

## Defect and correction

The empty indication field previously prepended **every patient diagnosis** to product-related FEST labels. Those diagnosis entries had a source hint, but their placement in an indication-suggestion list implied a product/indication relationship that had never been checked. This affected all medicines, not just amlodipine. The cascade module did not write the indication field.

The common builder now offers unsolicited choices only from the selected product's own `BruksomradeEtikett` references (FEST code system 7488). It does not infer indications from ATC, patient diagnoses, adverse events, cascade rules or other medicines. Route-only, duration-only and generic action labels are not offered as treatment causes; retained labels explicitly describe a disease/symptom, prevention, or specific treatment purpose. This is a deliberately narrower subset of dispensing labels, **not** an exhaustive or validated SmPC indication database.

A manual search of two or more characters can still look up ICD-10, ICPC-2 and matching recorded diagnoses, under a separate heading explaining that diagnosis-code results are not verified indications for the medicine. Explicit user selection is required. Free text remains possible. Default choices remain visible for an empty field on re-edit. The current product's SmPC 4.1 is linked, with catalog-ID/ATC consistency checked. Natural-product switching clears a previous product's indication rather than silently reusing it.

Existing saved entries are not retrospectively erased or medically reclassified. The app cannot determine the actual clinical rationale for an existing manually confirmed treatment solely from an ATC or diagnosis code. Pharmacist review remains necessary for previously selected incorrect indications.

## Amlodipine cross-check

[EMA Norvasc harmonisation](https://www.ema.europa.eu/en/medicines/human/referrals/norvasc), section 4.1: hypertension, chronic stable angina and vasospastic/Prinzmetal angina. Edema is not a therapeutic indication. Local FEST product labels were also inspected: the amlodipine records link to blood-pressure/angina labels, not the edema label 858.

## Verification

`test_indications.cjs` checks that patient diagnoses cannot alter empty-field choices for **every product** in the bundled catalog. Tests cover amlodipine/edema, correct pressure/angina labels, route-only labels, explicit manual diagnosis search, abbreviations and ICD coding, deduplication, escaping, catalog/ATC mismatch, and no automatic field/state mutation. The age-78 amlodipine (hypertension) + furosemide (vague diuretic indication) + patient-level localized edema case must still detect PIPC-05 without rewriting either treatment indication. Existing cascade tests cover all supported PIPC entries independently.
