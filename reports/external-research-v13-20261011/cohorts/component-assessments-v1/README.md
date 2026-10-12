# ER13 — first six original independent paired assessments

Exactly **B05-P01/P02, B04-P01/P02 and B08-P01/P02: six COMPONENT pairs, twelve arms**. Original source judgments: **4 PASS / 8 FAIL**. Declared assessment coverage: **10 COMPLETE / 2 PARTIAL**. These are finite original planning assessments. This cohort supports no campaign winner, campaign completion, discovery-effectiveness, cold full-pipeline, provider ranking, equal-quality saving or deployment claim. A delivery or native lifecycle completion is distinct from source quality.

Read each complete `mechanics/evaluation-dispatch-v2/<block>/<control|treatment>/assessment.md`, `assessment.json`, `coverage.json`, `defects.json`, `primary-source-index.json` and necessary original evidence, then the original paired `comparison.md/json`. Full conditions, rejected criticisms, material/nonmaterial defects and COMPLETE/PARTIAL/UNASSESSED limits survive. “COMPLETE” applies to each evaluator's declared assessment scope; external UNASSESSED families, actual target execution, backend linkage and unavailable billing remain limited. Thin rows below are navigation, not replacement grades; `assessment-rows.json` preserves each verification entry's exact dimension labels.

| Original arm | Source | Coverage | Time | Method | Native provenance | Resources |
|---|---|---|---|---|---|---|
| B05-P01-control | PASS | COMPLETE | ELIGIBLE | PARTIALLY_VERIFIABLE | OBSERVED_RECEIPTS_WITH_UNKNOWN_LINKAGE | PARTIAL_OBSERVATION_UNKNOWN_BILLING |
| B05-P01-treatment | FAIL | COMPLETE | ELIGIBLE | PARTIALLY_VERIFIABLE | OBSERVED_RECEIPTS_WITH_UNKNOWN_LINKAGE | PARTIAL_OBSERVATION_UNKNOWN_BILLING |
| B05-P02-control | FAIL | COMPLETE | ELIGIBLE | PARTIAL | PARTIAL | PARTIAL |
| B05-P02-treatment | PASS | COMPLETE | ELIGIBLE | PARTIAL | PARTIAL | PARTIAL |
| B04-P01-control | FAIL | PARTIAL | ELIGIBLE_ON_SUPPLIED_FROZEN_CUSTODY | PARTIAL | PARTIAL | PARTIAL |
| B04-P01-treatment | FAIL | PARTIAL | ELIGIBLE_ON_SUPPLIED_FROZEN_CUSTODY | PARTIAL | PARTIAL | PARTIAL |
| B04-P02-control | FAIL | COMPLETE | ELIGIBLE | PARTIAL_VERIFICATION | BOUND_RECEIPTS_WITH_LINKAGE_LIMIT | PARTIAL_WITH_UNAVAILABLE_BILLING |
| B04-P02-treatment | FAIL | COMPLETE | ELIGIBLE | PARTIAL_VERIFICATION | BOUND_RECEIPTS_WITH_LINKAGE_LIMIT | PARTIAL_WITH_UNAVAILABLE_BILLING |
| B08-P01-control | PASS | COMPLETE | ELIGIBLE_ON_FROZEN_CUSTODY_BOUND | METHOD_DELTA_SUPPORTED; FULL_PROCEDURAL_COMPLIANCE_UNKNOWN | MATCHED_FROZEN_RECEIPTS; INDEPENDENT_SESSION_LINKAGE_UNKNOWN | PARTIAL_OBSERVATIONS; BILLING_UNKNOWN |
| B08-P01-treatment | PASS | COMPLETE | ELIGIBLE_ON_FROZEN_CUSTODY_BOUND | METHOD_DELTA_SUPPORTED; FULL_PROCEDURAL_COMPLIANCE_UNKNOWN | MATCHED_FROZEN_RECEIPTS; INDEPENDENT_SESSION_LINKAGE_UNKNOWN | PARTIAL_OBSERVATIONS; BILLING_UNKNOWN |
| B08-P02-control | FAIL | COMPLETE | ELIGIBLE_WITH_OBSERVABILITY_LIMITS | PARTIAL_VERIFIABLE | PARTIAL | PARTIAL |
| B08-P02-treatment | FAIL | COMPLETE | ELIGIBLE_WITH_OBSERVABILITY_LIMITS | PARTIAL_VERIFIABLE | PARTIAL | PARTIAL |

The frozen authority is `state/eval-coordinator-v2/<block>-output-verification.json` plus `cohort-001-delivery-summary.json`, whose **original private SHA-256 is `c9cf8fd847302f094cf55a90b2877509091eb9a493f8ef40a9cd89e4aadfa655`**. Their normalized copies are included. Root owns selection and Git; the designated dispatcher owns candidate execution; evaluation-v2 owns these original graders. This packaging did not start candidates, graders or a native Goal and supplied no author feedback or repair.

## Evaluator configuration and custody

The complete actual evaluator tasks and requested model, reasoning effort and service tier are in `state/eval-coordinator-v2/<block>-request.json`. `evaluators/<block>/dispatch-terminal.json` extracts the actual dispatch and terminal bound fields from the exact captured responses and binds their original hashes: task/run identities, returned model, status and pending-child state. Private route names are placeholders. Requested options do not establish actual backend options. Transport duplicate envelopes, terminal narrative summaries and transfer pointers are excluded from these capsules; complete scientific judgments remain in their original outputs. Terminal verification is completed with zero pending children for these six pairs only. No full native transcripts, private account/provider aliases, home paths, host metadata or private publication policy are published.

`original-public-hashes.json` maps every admitted original-private hash to its sanitized public hash. Embedded original manifest/evidence/request pins remain **original-byte pins**, not public-byte pins. Sanitization changes locators and private route/account literals only; it is not an edited regrade. `public-manifest.json` records copied public bytes; its `source_sha256` is the normalized staging hash used by the explicit-list copier. Consult the original-public mapping for frozen upstream lineage. `checks/source-integrity.json` records verified immutable manifest entries; `SHA256SUMS` verifies this final public edition.

## Sources, licensing and portable inspection

Licensed primary source/context bodies, original lookup records, exact pins and full retained license texts remain as frozen. Upstream public author/contact/license notices and the public GitHub SSH locator have reviewed, file-scoped privacy exceptions in `privacy-exceptions.json`; they are not private campaign account data. Papers are authored capsules and locators only. Sources deliberately not retained by the original evaluator are still represented by that evaluator's exact locator/hash/context and body-retention limits; this edition neither fetches them anew nor claims complete corpus retention. Inspect `source-index.json` and the full per-arm primary source indexes.

The public tree preserves the historical logical structure. Restore the included files to a **new review-only directory**, without invoking any candidate or evaluator:

```sh
python3 -B restore_source_layout.py --destination /absolute/new/local/review
```

The restore verifies all manifest hashes and rejects an existing destination or unsafe paths. `path-resolution.json` resolves retained `ER13_RUNTIME/...` locators. External scientific input/candidate references are historical pins to the separate frozen science/preparation editions; they are explicitly external, not missing assessment bodies. This restore is runnable inspection mechanics, not authorization to replay old tasks or deadlines. It does not claim the historical requests can run today. Full campaign reconstruction requires the separately published input/science cohorts and fresh authorized routes; preserve old judgments and pins.

Independent evaluator costs remain `independent_evaluation`; packaging helper costs are separately recorded for root in private readiness state. Candidate product costs, unknown billing and native Goal API counters are not interchangeable. This edition preserves the original counters' stated limits and introduces no new cost estimates.

`checks/privacy.json` records the final explicit-list heuristic scan. Reviewed exceptions and literal checks do not prove exhaustive privacy. Root receives readiness and exact manifest hashes for its publication decision; this directory has not been committed or landed by the packaging worker.
