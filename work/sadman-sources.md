# SADMAN / SADMANS and CYPinfo

Reviewed 2026-11-04. This is a curated source-navigation feature, not an instruction to stop medicines and not a diagnosis of dehydration. It never changes dose, status or LRP records. FEST synchronization updates product identifiers/ATCs, not the clinical advice below; clinical review remains a separate task.

## Evidence and interpretation

- Watson et al., AJKD 2023;81:564–574. Modified Delphi, PMID [36470530](https://pubmed.ncbi.nlm.nih.gov/36470530/), DOI 10.1053/j.ajkd.2022.10.012. Consensus on medicine handling during volume-depleting illness. Sulfonylureas require glucose-specific assessment; do not apply blanket withholding. The 24–48-hour recovery suggestion is not an unconditional restart timer.
- Fink et al., Kidney Medicine 2022;4:100527. Pragmatic RCT, 315 people with CKD; PMID [36046613](https://pubmed.ncbi.nlm.nih.gov/36046613/). No demonstrated AKI/GFR benefit; limited events and implementation challenges. Account for heart failure/congestion and harm from indiscriminate withholding.
- Watson et al., Kidney Medicine 2022;4:100491. Systematic scoping review, PMID [36046611](https://pubmed.ncbi.nlm.nih.gov/36046611/). Limited clinical outcome evidence and heterogeneous advice.
- [KDIGO 2024](https://kdigo.org/wp-content/uploads/2024/03/KDIGO-2024-CKD-Guideline.pdf#page=136), section 4.3.2, printed S251. SADMANS includes direct renin inhibitors. Explicit restart planning and the risk of failure to resume treatment.
- [Norsk nyremedisinsk forening, April 2026](https://www.nephro.no/veileder/CKD_veileder_fastleger_minirevisjon_april_2026.pdf): intercurrent illness and temporary withholding of RAAS inhibitors, diuretics, SGLT2 inhibitors, metformin.
- [Helsedirektoratet: intercurrent illness in diabetes](https://www.helsedirektoratet.no/retningslinjer/diabetes/behandling-med-blodsukkersenkende-legemidler-ved-diabetes/blodsukkersenkende-behandling-ved-interkurrent-sykdom-og-steroidbehandling).
- [Diabetes Canada appendix 8](https://www.diabetes.ca/for-professionals/appendices/appendix-8): SADMANS mnemonic. Sulfonylurea advice differs from the Delphi consensus; the UI explicitly communicates this and requests individualized glucose/intake assessment.

Texts are short original Norwegian summaries. They are not copied treatment instructions. Insulin is not automatically withheld. SGLT2-associated ketoacidosis can occur without marked hyperglycemia. AKI, heart failure and suspected ketoacidosis require individual reassessment before resumption.

## ATC mapping and boundaries

`sadman-policy.js` holds explicit single-class prefixes and enumerated mixed-product codes. Checked against the WHO ATC/DDD index (updated 2026-01-20): [A10BD](https://atcddd.fhi.no/atc_ddd_index/?code=A10BD&showdescription=no), [C10BX](https://atcddd.fhi.no/atc_ddd_index/?code=C10BX&showdescription=no), [C09BX](https://atcddd.fhi.no/atc_ddd_index/?code=C09BX&showdescription=no), [C09DX](https://atcddd.fhi.no/atc_ddd_index/?code=C09DX&showdescription=no), [C09XA](https://atcddd.fhi.no/atc_ddd_index/?code=C09XA&showdescription=no), [C03DA](https://atcddd.fhi.no/atc_ddd_index/?code=C03DA&showdescription=no), [M01AX](https://atcddd.fhi.no/atc_ddd_index/?code=M01AX&showdescription=no). Combination pills retain all matched groups, including ARB + diuretic, ACE + diuretic, metformin + SGLT2, and eplerenone + dapagliflozin. An entire A10BD/C10BX/M01AX chapter is never treated as one clinical class.

Systemic NSAIDs exclude topical ATCs/formulations, platelet-dose aspirin, glucosamine, chondroitin and diacerein. Spironolactone/eplerenone are included; finerenone and tolvaptan are not automatically included and are explicitly named as requiring separate product-specific advice. No inference from a medicine's name. No automatic annotation for unknown ATCs, recorded age under 18, invalid age, paused/stopped medicine, actual use 0/S, or schedule 'Bruker ikke'. PRN medicines remain eligible. Unknown age permits a general adult lookup. No requirement for reduced eGFR: this is class information for a potential future sick-day situation, not a current renal alert.

Source-tab URLs contain only public catalog ID/ATC, tool/topic selection; no patient number, entered name, indication, genotype or other patient context. The source tab resolves the product from the public catalog and checks ID/ATC agreement before linking its SPC. The generic panel never claims a specific patient is dehydrated.

## CYPinfo

[CYPinfo](https://cypinfo.no/), [about](https://cypinfo.no/om-oss), and [OUS announcement 2026-07-02](https://www.oslo-universitetssykehus.no/avdelinger/klinikk-for-laboratoriemedisin/avdeling-for-farmakologi/cypinfono-forbedret/) were checked. Add as a Norwegian pharmacogenetic interpretation source, not a drug–drug interaction database. Link next to the CYP field and in the monitoring review. A recorded CYP-test makes the resource relevant in the patient-default source view; no genotype is interpreted or transmitted automatically, and unrelated drug-only searches are not broadened.

## Verification

`test_sadman.cjs` covers named single/combination products, nonmember controls, age, renal independence, status/actual reporter use, source-tab privacy, escaped content, exact SPC identity, live refresh, bilingual retrieval, source priority and CYP scope. Included in the normal pre-build and sync checks. Existing interaction layout and other clinical/navigation/persistence suites must also pass before publication.
