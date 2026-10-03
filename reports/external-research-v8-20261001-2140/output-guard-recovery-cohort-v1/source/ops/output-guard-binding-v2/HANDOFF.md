# Output guard binding v2 — narrow source-only scope repair

Actual root preflight V10 HOLD metadata is `ops/recovery-v1/OUTPUT_GUARD_RELEASE_V10_PREFLIGHT_HOLD.json` SHA256590d860b50b569c665d8f7d1f1eabefbe579bbd49bd1025df36b2e00c519d101. It records zero added native starts and the four required predecessor metadata paths rejected by the original common scope filter. This author reads that public HOLD and frozen source metadata only. Root reports the existing actual output guard install and BIOCOND-S8 append remain valid: reservation_receipt_id `v8-s8-bio-cond-reservation-v2`,99 starts/133557.2167 protected occupied seconds, selected case IDs still un-born. Those live facts were not reobserved by this author.

Only recovery-control positive_binding_files adds the four exact predecessor paths:

- ops/attempt-control-binding-v1/HANDOFF.md
- ops/attempt-control-binding-v1/MANIFEST.json
- ops/attempt-control-binding-v1/FREEZE.json
- ops/attempt-control-binding-v1/integrated-controller/SOURCE_FREEZE.json

Their existing exact dependency hashes and closure selection remain pinned. Existing v1 allowed paths are retained. Three necessary new v2-owned control_binding.py/DEPENDENCIES.json/recovery-control.json references are explicitly allowed; there is no wildcard, new allowed root, private/native/SDK scope expansion or changed original common scope rule. The six actors and common.py are byte-identical to output-guard-binding-v1. control_binding.py changes exactly two acceptance/review path constants to V2 paths. Every other recovery-control field, including the API f2f63bbfc7386186e51f79d00449fd0964821b1f0cb48e9d8d70b9ee7fe112b3, empty default queue, original campaign clock and route/config/planning resolver, stays unchanged. All case_sources/scientific declarations/native boundaries remain unchanged.

## Exact independent/root binding acceptance

Reviewer writes `ops/output-guard-binding-review-v2/REVIEW.json`:

- schema `pm.er8.output-guard-control-binding-independent-review.v1`
- accepted:true, independent:true
- controller_snapshot exact {path,sha256} reference to this tree's integrated-controller/SOURCE_FREEZE.json
- control exact {path,sha256} reference to this tree's recovery-control.json

Root only after actual accepted review writes `ops/recovery-v1/OUTPUT_GUARD_CONTROL_BINDING_ACCEPTANCE_V2.json`:

- schema `pm.er8.output-guard-control-binding-root-acceptance.v1`
- root_authority:true, accepted:true, finite accepted_epoch within original campaign
- same exact controller_snapshot/control references
- independent_review exact {path,sha256} reference to actual V2 review

The schema names remain v1 by the unchanged source contract; the artifact paths are V2. Old V1 acceptance/review/source stays immutable. This author creates no accepted review, root acceptance, release or live receipt.

## Corrected root release recipe, not executed

Generate the same selected source interface with exactly supported arguments:

```sh
/usr/bin/python3 -B LAB_ROOT/ops/output-guard-binding-v2/control_binding.py --pair V8-BIO-COND
```

The CLI prints its explicitly unaccepted interface to stdout. There is no --out argument. `--pair` repeats only when root chooses multiple already declared wholepairs. BIOCOND selects exactly V8-BIO-COND-C-Z-S8 and V8-BIO-P-Z-S8 and their six original S8 job identities.

Root copies the returned fields_for_root_release_after_separate_acceptance in memory into a new successor release: case_queue/allowed_jobs/case_sources/planning_input_sha256, new production_entry/controller_snapshot, unchanged resume_ledger, original predecessor_release/preserved and unchanged max_component/outside-native caps. Merge the entire new snapshot closure_sha256 into selected_positive_files. Set controller_acceptance to the actual V2 independent review and attempt_control_binding.source_acceptance to the actual V2 root binding acceptance; retain exact existing attempt_control_binding pair_ids/declaration_closure/predecessor_release/v7_quiet and actual `v8-s8-bio-cond-reservation-v2` reservation_receipt_id. Preserve output_guard_binding with actual installed authority/source_acceptance/install_receipt references. Do not reinstall the API/guard or repeat the append. Preserve every route/config/account/model/SDK/native/privacy/clock/cap/usage/outcome/reservation field; predecessor releases stay frozen. Accept the new release only after actual root observations and independent review succeed.

Root then performs actual common.check_release and positively verifies current owned candidate/admission execution quiet and original global deadline before any launch. Missing metadata repaired here does not itself establish live readiness or external quiet. No launch/install/Goal/admission/native/process/unit/Git/ledger call is executed by this author.

## Fixture evidence and timing qualification

Four new meaningful source/metadata checks pass: exact four repaired paths allowed/hash-pinned/selected; every full controller closure path accepted by an executed AST copy of the unchanged original common scope filter with mocked digest lookup (no SDK/runtime file reads), with the known omission reproduced negatively; seven copied modules byte-identical and every other control field unchanged; BIOCOND wholepair/interface/case-source consistency, exact new root/review constants and supported --pair-only CLI. The source fixtures import only the metadata-only binding module, never API/ledger/native/provider/SDK/runtime/auth/private/profile/candidate/evaluation bodies.

Prior15 API/binding fixture passes and prior11 independent review passes are retained as inherited records reported by root; the prior PASS/LATE qualifications and unknown full-helper completion tail are not reclassified or repeated. This repair does not rerun full API fixtures or requalify the stack. Inherited runtime hashes are opaque copied metadata and will be checked by root actual production preflight.

Fresh helper original birth1791007487.4675505/cutoff1791007787.4675505 inclusive300 seconds remain fixed. INCLUSIVE_ENDPOINT.json records actual source endpoint after preparation/tests/freeze; final-return tail is unobserved at capture. No full-helper or campaign timeliness is inferred in advance. Publication uses only the explicit positive owned/dependency inventory in MANIFEST/FREEZE. No frozen V1 artifact is edited.
