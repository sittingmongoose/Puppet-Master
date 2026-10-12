# ER13 — sixteen original FULL assessments

Exactly six frozen original FULL blocks: **B02-P01, B06-P01, B09-P02, B10-P01, A-F01 and A-F02**. Their verification entries identify **16 originals: 13 source PASS / 2 FAIL / 1 UNASSESSED; 15 COMPLETE / 1 PARTIAL declared assessment coverage**. The separate closed COMPONENT publications remain unchanged. This edition makes no all-80 completion, campaign winner, discovery effectiveness, repeatable saving, equal-quality saving, optimizer qualification, integration, deployment or provider-ranking claim.

The thin rows come from the exact `output-verification.json` original entries, not assumptions about nested assessment schemas. Read all seven dimensions and all six axes in the complete originals. Pair blocks use `control/` and `treatment/`; factorial blocks use exact arm-ID directories. `assessment-rows.json` preserves full verification entries, including axes and structured dimension conditions. Rows below are navigation only.

| Original arm | Source | Declared coverage | Delivery | Time | Method | Native provenance | Resources |
|---|---|---|---|---|---|---|---|
| B02-P01-control | PASS | COMPLETE | DELIVERED | ELIGIBLE_ON_OBSERVED_COMPLETE_FROZEN_DELIVERY | OBSERVED_ARTIFACT_REQUIREMENTS_MET_PROCESS_ISOLATION_PARTIAL | PARTIAL | PARTIAL_RECEIPTS_ONLY |
| B02-P01-treatment | PASS | COMPLETE | DELIVERED | ELIGIBLE_ON_OBSERVED_COMPLETE_FROZEN_DELIVERY | OBSERVED_ARTIFACT_REQUIREMENTS_MET_PROCESS_ISOLATION_PARTIAL | PARTIAL | PARTIAL_RECEIPTS_ONLY |
| B06-P01-control | PASS | COMPLETE | DELIVERED | ELIGIBLE_WITH_OBSERVATION_LIMITS | PARTIAL_EVIDENCE | PARTIAL_EVIDENCE | PARTIAL |
| B06-P01-treatment | PASS | COMPLETE | DELIVERED | ELIGIBLE_WITH_OBSERVATION_LIMITS | PARTIAL_EVIDENCE | PARTIAL_EVIDENCE | PARTIAL |
| B09-P02-control | PASS | COMPLETE | DELIVERED | See full original record | RECEIPT_SUPPORTED_WITH_UNOBSERVABLE_PROCESS_LIMITS | See full original record | See full original record |
| B09-P02-treatment | PASS | COMPLETE | DELIVERED | See full original record | RECEIPT_SUPPORTED_WITH_UNOBSERVABLE_PROCESS_LIMITS | See full original record | See full original record |
| B10-P01-control | PASS | COMPLETE | DELIVERED | ELIGIBLE_BY_AVAILABLE_FROZEN_RECEIPTS | OBSERVED_CONFORMING_WITH_UNOBSERVABLE_LIMITS | PARTIAL | PARTIAL |
| B10-P01-treatment | PASS | COMPLETE | DELIVERED | ELIGIBLE_BY_AVAILABLE_FROZEN_RECEIPTS | OBSERVED_CONFORMING_WITH_UNOBSERVABLE_LIMITS | PARTIAL | PARTIAL |
| A-F01-R0 | PASS | COMPLETE | COMPLETE_SCIENCE_DELIVERY | PARTIAL_UNKNOWN_ELIGIBILITY | PARTIAL | PARTIAL | PARTIAL_UNKNOWN_BILLING |
| A-F01-A1 | FAIL | COMPLETE | COMPLETE_SCIENCE_DELIVERY | PARTIAL_UNKNOWN_ELIGIBILITY | PARTIAL | PARTIAL | PARTIAL_UNKNOWN_BILLING |
| A-F01-A8 | PASS | COMPLETE | COMPLETE_SCIENCE_DELIVERY | PARTIAL_UNKNOWN_ELIGIBILITY | PARTIAL | PARTIAL | PARTIAL_UNKNOWN_BILLING |
| A-F01-A1_A8 | PASS | COMPLETE | COMPLETE_SCIENCE_DELIVERY | PARTIAL_UNKNOWN_ELIGIBILITY | FAIL | PARTIAL | PARTIAL_UNKNOWN_BILLING |
| A-F02-R0 | FAIL | COMPLETE | COMPLETE | ELIGIBLE_BY_FROZEN_NATIVE_TERMINAL_MARKERS | PARTIAL | PARTIAL | PARTIAL |
| A-F02-A1 | PASS | COMPLETE | COMPLETE | ELIGIBLE_BY_FROZEN_NATIVE_TERMINAL_MARKERS | PARTIAL | PARTIAL | PARTIAL |
| A-F02-A8 | UNASSESSED | PARTIAL | UNASSESSED | INELIGIBLE_ORIGINAL_STAGE_CAP | PARTIAL | PARTIAL | PARTIAL |
| A-F02-A1_A8 | PASS | COMPLETE | COMPLETE | ELIGIBLE_BY_FROZEN_NATIVE_TERMINAL_MARKERS | PARTIAL | PARTIAL | PARTIAL |

## Preserve the original assessment scope

Read `mechanics/evaluation-dispatch-v2/<block>/<arm-directory>/assessment.md/json`, `coverage.json`, `defects.json`, `primary-source-index.json`, shared original assessment/index/evidence records where present, and each original comparison. Full original judgments, valid criticisms, defects, source conditions, known scope and UNASSESSED actual/future work survive privacy normalization. No scientific capsule, new conclusion, repair or regrade is added. Source PASS is a finite original source-quality judgment, not universal correctness or a method/delivery/time/provenance/billing certificate.

B02/B06 retain each original timing proxy, Goal residence interval, handoff/custody observation and unavailable artifact/activity boundary separately. Residence is not active provider time or optimizer evidence. Original counters are not billing; unknown is not zero. A-F01-A1's source FAIL, A-F02-R0's source FAIL, A-F02-A8's original missing final and UNASSESSED complete science, A-F01-A1_A8's independent method FAIL and scope-drift finding, and A-F01-R0's initially unknown exact T0/time eligibility remain as authored. Factorial interaction limitations and all partial/UNASSESSED families remain; no missing final is reconstructed or treated as comparable PASS.

## Immutable authority and actual evaluator configuration

`state/eval-coordinator-v2/<block>-output-verification.json` binds the exact original arm assessment and manifest hashes and original comparison. `original-public-hashes.json` maps **original-private SHA-256 => public SHA-256**. Source original manifests and their embedded pins identify original bytes; they do not certify changed public bytes. Original comparisons and evidence remain in their historical layouts. `checks/source-integrity.json` records every verified source-manifest entry. Source verification paths are normalized locators with unchanged original hashes.

Complete actual evaluator tasks/configuration are in `<block>-request.json`. `evaluators/<block>/dispatch-terminal.json` contains scoped actual returned task/run identities, returned model, terminal status and pending-child state extracted from exact dispatch/terminal captures, plus requested options and original capture hashes. Requested reasoning/tier options do not prove actual backend configuration. No terminal narrative transfer envelope or full transcript is published; original scientific findings and native observations are retained in full assessments. No admitted/active or case-C/D contents were consulted to construct this edition.

Root alone owns Git/selection; dispatcher alone owns scientific candidates; evaluation-v2 owns these original graders. Packaging made no native product starts, new graders, Goal or scientific feedback. Independent science costs remain `independent_evaluation`; this worker's publication-helper cost is recorded separately in private readiness state. Unknown provider activity, resources or billing are not estimated as zero.

## Source bodies and public coverage

`source-body-coverage.json` explicitly lists retained original authored primary-source indexes/context evidence and the policy/availability limits found in each. These frozen evaluator records are authored observations/capsules, exact pins, locators, compact permitted code tokens and retrieval fingerprints. **No arbitrary full HTML/PDF/paper corpus is published.** No such full body is present in the admitted immutable output-manifest set; those historical response hashes/byte counts remain source fingerprints, not a claim that their bodies are in this public edition. No new source retrieval or scientific summary fills a gap. The originals' source/license notices and allowed pin/locator context remain exactly authored, including license-by-reference limits; no absent full license body is invented or fetched. Retained minimal code/context evidence has its original declared terms. `source-index.json` resolves retained evidence files. `privacy-exceptions.json` binds any reviewed public upstream license/contact literal to exact file hashes; private account, route, home, localhost and host metadata is never an exception.

## Portable inspection

```sh
python3 -B restore_source_layout.py --destination /absolute/new/local/review
```

The existing reviewed restore mechanics verify public manifest hashes and reproduce the exact retained public review layout in a new directory, rejecting unsafe paths/symlinks and an existing destination. They invoke no historical recipe, evaluator, candidate or source lookup. `path-resolution.json` distinguishes retained public files from external historical inputs/receipts; external locators are not silently presented as restored bodies. Runtime/provider placeholders are private-locator normalization, not authorized launch identities.

`public-manifest.json` records copied public bytes; its `source_sha256` is the normalized staging hash used by the explicit-list helper. Frozen original lineage is in `original-public-hashes.json`. `FILELIST.json` and `SHA256SUMS` enumerate final public bytes. `redactions.json` records privacy-only substitutions and scoped transport extraction, with zero judgment changes. `checks/privacy.json` records bounded explicit-list checks; no exhaustive privacy guarantee follows. This worker has not committed, landed or changed prior publication editions. Root receives the exact ready list and manifest SHA for its finite publication decision.
