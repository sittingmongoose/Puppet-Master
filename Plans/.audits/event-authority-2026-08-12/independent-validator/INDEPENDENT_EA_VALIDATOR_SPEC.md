# Independent Event Authority Validator Specification

## Status and authority

A repository implementation is present at the canonical path:

`Plans/.audits/event-authority-2026-08-12/independent-validator/pm_event_authority_independent_validator.py`

The implementation is a Plans-side, deterministic, fail-closed computational validator. It is closure-ineligible until every required closure predicate is implemented and its live checks earn a pass. It does not presently certify closure: the fresh denominator is not closed, individual disposition rows remain provisional, the executable oracle harness is missing or has not passed, July exclusion cohorts still need full affirmative revalidation, and unresolved-disposition states still surface live denominator blockers. Accordingly:

- `existing_validator_found=true`
- `existing_validator_in_scripts=false`
- `repository_implementation_present=true`
- `closure_capable_validator_found=false` until the live checks earn a pass
- `scripts_promotion_forbidden=true`

“Closure-capable” is a result-qualified state, not an implementation-existence claim. The validator computes its current `complete_denominator_known`, `contract_depth_complete`, and `pass` values from live check results; it has no unconditional open failure and no hardcoded `pass:false`. However, those computed values are not eligible to certify closure until the remaining exclusion-depth and substantive unresolved-row blockers are cleared. A generated receipt records the computation; it cannot authorize itself or override a failed or absent check.

## Location and integration boundary

The validator and its receipts remain under `Plans/.audits/event-authority-2026-08-12/independent-validator/`. Validator files under `scripts/**` are forbidden. Existing scripts are outside this implementation scope.

The current Plans-side receipt is diagnostic and certification evidence within this audit surface. It is not, by itself, a closing PNC/currentness receipt. Any future authorized binding to checkpoint currentness must rehash the canonical validator and inputs and recompute the same semantics from live artifacts. It must never trust copied receipt flags, counts, hashes, or prose as authority.


## Independent census-adjudication partition (Advisor-2 anti-circularity)

`PARTITION.json` is a **derived artifact**, not an authoritative expected-count source.

The validator derives expected category → `event_type` sets independently from:

1. `cohort-pins/IMMUTABLE_COHORT_PINS.json` (Known37, August2, July248/40/68/26 pin sets)
2. `closed-world-census/admission/MACHINE_CONTRACT_EVENT_BINDING_SCAN.json` (`false_rejects_restored` → unresolved emit candidates)
3. `closed-world-census/rejected-lexical/REJECTED_LEXICAL_CANDIDATES.json` (81 remaining lexical rejects)

Derivation rules (disjoint partition, 528 rows):

- `registered_keep` = known37 ∪ august2 (39)
- `persisted_unregistered_quarantine` = july248 ∪ auth.github reclass dual-pins (253)
- `unresolved` = july40 ∪ emit restores (66; 40 july40 unresolved rows plus 26 emit-restore evidence-gap rows)
- `exact_excluded` = july68 − auth.github reclass (63)
- `non_exact_excluded` = july26 (26)
- `rejected_lexical_candidate` = rejected lexical ledger (81)

The validator compares **exact event-type sets** (not self-declared counts) to `census-adjudication/LEDGER.jsonl`. `PARTITION.json` must agree with ledger counts and record `independent_set_equality_ok=true`; stale or self-referential partition artifacts fail with `census_adjudication_partition_artifact_stale`.

## Fresh denominator admitted-family scope (Advisor-2)

`FRESH_CENSUS_DENOMINATOR.json` admitted persisted event families = **255** (253 unregistered quarantine + 2 August live registered).

Unresolved rows (66 total: 28 `NEEDS_OWNER_VETO`, 12 `RECLASSIFY_ALIAS`, 26 `NEEDS_MORE_EVIDENCE`) are tracked under `persistence_open_not_admitted` and in IndividualDisposition `unresolved` bucket but are **not** admitted denominator members until per-row persistence proof/disposition.

When `closed=true`, ledger equality compares only IndividualDisposition rows with bucket ∈ `{confirmed_persisted_unregistered, august}`.

## Canonical inputs

The implementation resolves its inputs relative to `Plans/.audits/event-authority-2026-08-12/` and requires at least:

- `known37/KNOWN37_FROM_PLANS.json`
- `cohort-pins/IMMUTABLE_COHORT_PINS.json`
- `closed-world-census/denominator/FRESH_CENSUS_DENOMINATOR.json`
- the sealed full census-adjudication ledger spanning the immutable cohort universe and rejected lexical candidates
- the census freeze artifact named by the implementation
- `Plans/event_family_registry.json`

Missing, malformed, stale, or inconsistent required inputs fail closed.

## Known37 authority

Known37 is derived only from `Plans/storage-plan.md` section `RET-K37`, represented by `known37/KNOWN37_FROM_PLANS.json`. The closing contract requires that artifact to identify `Plans/storage-plan.md`, prohibit noncanonical paths, contain exactly 37 unique event types, preserve every member in the live registry, and prove no row-local contract-depth regression.

There is no `C:` fallback, working-directory fallback, or candidate-generated replacement trust anchor. The implementation checks source declaration, length 37, and live-registry presence, but it does not independently prove set uniqueness or full live-registry no-regression depth. Those missing predicates keep it closure-ineligible.

## Owner decision sheet (fail closed)

`OWNER_DECISION_SHEET.json` is a required input. Missing file, empty `decisions` list, or absence of required IDs (`AUG-CP-WLC-001`, `AUG-CP-TWM-001`, `EXCL-OD-done_budget_exceeded`, `EXCL-OD-stop_identical_failure`, `EMIT-PERSIST-026`, `J248-VETO-BATCH-252`, `J40-VETO-BATCH`, `COMPACT-001`) is an explicit failure. `owner_decision_sheet_all_applied` is true only when every required ID is present and each `owner_response` is a dict whose `chosen_option` is one of that decision's `options`. A truthy string or emptied list must not fail open.

Exclusion revalidation summary + ledger are also required inputs. Empty ledger fails via row-count mismatch, not as `all_rows_pass`.

## August checkpoint drafts (fail closed)

`august-checkpoint-drafts/AUGUST_CHECKPOINT_DRAFTS.jsonl` is a required input (`required_paths.august_checkpoint_drafts`). Missing file, empty ledger, or absence of either expected August event (`workspace.layout_changed`, `terminal.workgroup_moved`) is an explicit failure (`august_checkpoint_drafts_missing` / `august_checkpoint_drafts_empty` / `august_checkpoint_events_missing`) **before** veto-status evaluation. `august_checkpoint_decisions_applied` is true only when both expected events are present and none remain `PENDING`. Deleting the artifact must not fail open.

## Artifact seal vs checkpoint close (anti-circularity)

`FRESH_CENSUS_DENOMINATOR.json` `closed=true` is a **constructed input**. The validator does not write it. While `closed=false`, the validator **unconditionally** emits `fresh_census_denominator_not_closed` and forces `complete_denominator_known=false` / `pass=false`.

Therefore `pass=true` cannot be a pre-seal gate. The pre-seal executable gate is `named_checks.seal_prerequisites_met` (all failures except the unavoidable `fresh_census_denominator_not_closed`). Empty, unspecified, or mismatched admitted `event_types` are pre-seal and must not be excluded from that gate. Sequence: apply closure prerequisites → write proposed nonempty exact admitted set → seal the artifact → re-run this validator. Checkpoint close (`complete_denominator_known`, `contract_depth_complete`, `pass`) is computed only after the sealed artifact exists and equality holds. August drafts require exactly one row per event and `veto_status` in `{PENDING, AFFIRM_DRAFT_AS_PROPOSED, VETO_KEEP_REGISTERED_PROVISIONAL, RECLASSIFY_OUT_OF_REGISTRY}`.

## Fresh closed-world denominator

`closed-world-census/denominator/FRESH_CENSUS_DENOMINATOR.json` (schema v2) is the sole fresh denominator contract. Closure requires all of the following:

1. `closed=true`;
2. a nonempty exact `admitted_persisted_event_families.event_types` set;
3. exact set equality between that admitted set and `individual-disposition/LEDGER.jsonl`;
4. no duplicate individual-disposition event type;
5. a matching census-freeze digest;
6. `census-adjudication/` exact-partition completeness covering registered/keep, persisted-unregistered/quarantine, unresolved, exact-excluded, non-exact-excluded, and rejected lexical candidates; and
7. satisfaction of all denominator-blocking cohort, Known37, and required-input checks.

The IndividualDisposition equality is scoped only to admitted persisted families. July exact exclusions, July non-exact rows, Known37 registered/keep rows, and rejected lexical candidates are outside that equality. They remain explicit in the full census-adjudication partition, whose immutable cohort pins and category coverage are independently validated. Multi-cohort reclassification rows appear once with every cohort pin retained.

There is no 295-row coverage floor. Historical cohort counts and progress unions are diagnostics, never a substitute for a sealed admitted exact set and complete partition. With the current denominator at `closed=false` and admitted `event_types=null`, `complete_denominator_known` must remain false.

## Immutable cohort validation

The validator loads the pinned immutable cohorts from `IMMUTABLE_COHORT_PINS.json`, including the July exact and non-exact populations, August live additions, and Known37. Pin-set coverage for **all** original cohorts—including july68 and july26—is checked against `census-adjudication/LEDGER.jsonl` cohort pins. Admitted-family cohorts (july248/july40/august2) remain covered on the individual-disposition ledger as well. Known37 preservation is independently registry-based. Working buckets cannot redefine, shrink, or silently drop the original cohorts.

Current limitation: census-adjudication restores cohort **scope** and partition completeness, but per-row exclusion revalidation depth (affirmative reason/citation quality for each of the 63/26) may still be incomplete for closure. Closure remains ineligible until those depth predicates and admitted-set sealing also pass.

## Twelve-field evidence contract

Each in-scope registered or retained row must carry typed evidence cells for all twelve fields:

1. membership and family/schema version;
2. semantic and payload owner;
3. producer and persistence;
4. payload schema;
5. scope and identity;
6. replay and idempotency;
7. retention and migration;
8. redaction and custody;
9. transitions and concurrency;
10. consumers and checkpoints;
11. compatibility and withdrawal; and
12. positive and negative oracles.

Every cell must use an allowed status. A `PASS` cell requires a row-local `Plans/` citation; a bare string or uncited pass is not evidence. For contract depth, all twelve fields must pass, the row must be non-provisional, and all registered rows must be covered. Inference, analogy, bulk treatment, and dependence on an earlier campaign conclusion are forbidden substitutes for row-local evidence.

## Executable oracle requirement

Citations describing positive and negative oracles are necessary but not sufficient. `contract_depth_complete` also requires an executable oracle-harness receipt that reports execution, pass, and coverage of registered families. The validator checks the canonical local audit location and the campaign-level oracle-harness location. A missing, non-executable, failing, or incomplete harness fails contract depth.

## Derived flag predicates

`complete_denominator_known=true` may be certification-eligible only when the fresh denominator is closed, its admitted persisted-family set exactly equals IndividualDisposition, the census-adjudication partition is complete, immutable exclusion rows are individually revalidated, rejected lexical candidates remain explicit non-members, all unresolved/quarantine/conflict/unknown/owner-veto/evidence-gap states receive the required fail-closed treatment, and no denominator-blocking result exists. The implementation binds both ledgers, but its per-row exclusion and unresolved-state predicates remain narrower than this closing contract, so a computed true value would not yet be closure authority.

`contract_depth_complete=true` may be certification-eligible only when the denominator predicate is fully eligible and true, registered rows have complete cited twelve-field evidence, the evidence shape is valid, the executable oracle harness passes with registered-family coverage, and no depth-blocking result exists.

`pass=true` only when both flags are true and the failure list is empty. All three values are computed from results. Inputs cannot force them, and a receipt cannot self-approve.

## Current fail-closed result

The implementation exists, but current data and predicate coverage do not earn closure. The computed result is fail-closed because:

- `FRESH_CENSUS_DENOMINATOR.json` declares `closed=false` and does not provide a closing `event_types` set;
- 64 individual-disposition rows are provisional in the latest computed receipt;
- an executable, passing oracle-harness receipt covering registered families is absent; and
- per-row July exclusion revalidation remains incomplete, and unresolved rows still block closure until their live dispositions are resolved.

These are data/check outcomes, not unconditional failures embedded to keep the validator open. When authoritative artifacts change, the validator must rerun and recompute every predicate.

## Machine receipt and failure flow

The validator writes `receipts/event_authority_validator_receipt.json` with schema ID/version, generation time, validator ID and canonical path, the two derived checkpoint flags, overall `pass`, counts, cryptographic input pins, named check results, stable structured failures, scripts-binding facts, and a claim-boundary note. A closing-grade receipt must additionally pin the sealed full census-adjudication ledger and its admitted/non-member partition digest, every immutable cohort and exclusion disposition, complete twelve-field row evidence, and the executable oracle-harness result.

Any future currentness/readiness binding must consume and independently verify at least these six result fields: `validator_path`, `complete_denominator_known`, `contract_depth_complete`, `pass`, `named_checks`, and `failures`. It must rehash every `input_pins` target, reconstruct the admitted/non-member partition, and rerun the predicates. Failure flow is monotonic: any missing input, failed named check, structured failure, hash drift, or eligibility gap forces `pass=false`; currentness must keep the applicable flag false; readiness must surface the residual; and no downstream checkpoint receipt may be written as closed. Receipt flags are outputs, never trusted inputs.

## Existing checkpoint and readiness map

The existing `EventAuthorityCheckpoint` surface comprises `registry_schema_id`, `registry_schema_version`, `registry_revision`, `registered_kernel_rows`, `complete_denominator_known`, and `contract_depth_complete`. Registry identity/count checks are structural context only. A checkpoint change, denominator failure, or depth failure must produce its distinct stable failure code rather than being collapsed into a generic pass/fail.

The currentness layer is responsible for detecting checkpoint changes and exposing denominator/depth failure codes. Readiness imports that helper, performs its structural registry subset, appends the EA residuals, preserves self-tests for fail-closed behavior, and validates any claimed receipt against live EA clearance. The PNC certification harness must run EA preflight before constructing or writing a PNC receipt. This describes the future binding contract only; it does not authorize edits under `scripts/**`, and the Plans-side receipt remains non-closing until a separately authorized integration rehashes inputs and recomputes semantics.

## Closure-eligibility gaps

1. `FRESH_CENSUS_DENOMINATOR.json` is not closed and has no exact closing admitted event-type set.
2. July 68 exact exclusions and July 26 non-exact rows lack validator-enforced per-row affirmative revalidation.
3. Unresolved, quarantine, conflict, unknown, owner-veto, and evidence-gap states are explicit blockers, but the remaining unresolved rows are still substantively open.
4. Known37 exact set uniqueness is not independently enforced.
5. Known37 live-registry no-regression contract-depth coverage is incomplete.
6. Sixty-four IndividualDisposition rows remain provisional and registered contract depth is incomplete.
7. No executable, passing oracle-harness receipt covers all registered families.
8. No authorized future currentness/readiness binding independently rehashes inputs and recomputes these semantics.

## Required negative fixtures

The closing suite must prove failure for: missing or open fresh denominator; denominator/admitted-set mismatch; duplicate adjudication key or event type; omitted immutable cohort row; unsupported exclusion; targetless reclassification; rejected lexical candidate injected into denominator or IndividualDisposition; unresolved or provisional disposition; fabricated or non-Plans Known37 source; removed or changed Known37 member; missing or uncited twelve-field cell; copied foreign evidence; missing producer or owner authority; absent, non-executable, failing, or incomplete oracle harness; stale input hash; validator drift; receipt flag tamper; receipt restamp without semantic recomputation; and a changed registry at unchanged row count.

## Wave1 protocol precedents

`SUMMARY.json.protocol_precedents` MUST name both Wave1 documents below; this binding records protocol provenance only and does not close either checkpoint.

### WAVE1_CITATION_HONESTY.md

Path/name: `orchestration-2026-07-17/phase3/wave1/WAVE1_CITATION_HONESTY.md`

#### Reusable predicates

- reconcile declared physical and parsed citation populations within an expressly bounded corpus;
- independently rehash cited source bytes and compare digest and byte count;
- verify path existence, ordering, bounds, nonblank ranges, and direct-token occurrence;
- reconcile citation identifiers, links, and occurrence counts; and
- preserve failure-to-correction chronology, action boundaries, and caveats.

Non-closure limit: this precedent establishes bounded citation mechanics and evidence hygiene only. It expressly does not make a semantic judgment and does not establish a fresh closed-world producer census, row disposition truth, owner authority, Known37 preservation, twelve-field depth, or executable event-correct oracles. It cannot set either checkpoint flag.

### WAVE1_EVENT_AUTHORITY_CITATION_CORRECTION_REVIEW.md

Path/name: `orchestration-2026-07-17/phase3/wave1/WAVE1_EVENT_AUTHORITY_CITATION_CORRECTION_REVIEW.md`

#### Reusable predicates

- report mechanical citation validity separately from semantic sufficiency;
- require cited bytes to support the specific row-level claim;
- preserve original stage verdicts and record correction as a later action;
- remove or reject unsupported evidence rather than restamping it to superficially plausible bytes; and
- rerun mechanics and contextual-relevance checks against final bytes.

Non-closure limit: this precedent evaluates citation-correction mappings only. It does not prove current closed-world membership, exclusion truth, producer or owner authority, Known37 no-regression, twelve-field contract depth, or executable oracle behavior. It cannot set either checkpoint flag.

## Anti-fraud and currentness rules

- No input, option, prose assertion, or copied receipt value may force a flag.
- Identity and hash matches do not prove semantic adequacy.
- No count-only closure, coverage floor, additive slice arithmetic, or silent row drop.
- No analogy, namespace inference, copied foreign evidence, or uncited bare pass.
- Any unknown, conflict, provisional row, unresolved evidence, denominator mismatch, cohort mismatch, or oracle gap fails the applicable predicate.
- Validator or input changes require full recomputation, even when row counts do not change.
- Historical failed receipts remain evidence of their run; they are not rewritten into passes.
- Future integration must preserve the Plans-side authority boundary and recompute semantics rather than accepting self-reported receipt booleans.
