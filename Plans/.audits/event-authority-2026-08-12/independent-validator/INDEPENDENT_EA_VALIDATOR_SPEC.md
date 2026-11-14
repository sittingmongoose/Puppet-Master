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

## DL-039 holding bucket (receipted, fail closed)

The only authorized validator repair is the DL-039 `quarantined_not_admitted` holding path. Its scope is exactly 26 machine-scan emit candidates plus the 28 non-alias July40 residuals, independently derived and matched to the implementation receipt's exact population. No compaction, August, J248 or alias member may enter through this permission. The owner sheet contains exactly the original eight IDs above; the invented ninth answer is invalid.

`INDIVIDUAL_DISPOSITION_SCHEMA.md` defines the required per-row `holding_authority`, genuine EMIT/J40 answer provenance, `KEEP_QUARANTINED` disposition, and retained evidence-object hash. `reports/event-authority-20260911/step-03-holding-bucket-receipt.json` binds the live DL-039 section, implementation, cohort and machine-scan bytes and identifies the actual author/lander task forbidden to apply the seal. Receipt flags never authorize closure. Existing forged rows fail until explicitly reapplied with genuine row provenance; missing/malformed authority or receipt, unauthorized population, registry/denominator overlap, changed retained evidence or invalid disposition all produce `holding_bucket_invalid`. This and `owner_decision_sheet_exact_eight_required` block denominator, depth and overall pass. Diagnostic receipt input pins include the new change receipt and Decision Log source.

Holding recognizes a non-admitted classification only. It preserves contract evidence gaps and all existing depth, census, freeze and seal checks. The implementation receipt's evidence hashes preserve history, not evidence correctness. This Step 3 repair neither applies rows nor changes frozen hashes, historical validator receipts, registration, readiness or a seal.

## DL-077 post-August admission records (receipted, fail closed)

DL-077 authorizes the second and last receipted change, after the DL-039 holding bucket. A family registered beyond Known37 and the two August families is accepted only through its complete admission record, `reports/event-authority-20260911/admission-records/<event_type>.json` (schema `pm.assurance.event_authority.post_august_admission_record.v1`). A complete record names Jared's decision entry for that family and the SHA-256 of its prose section, where the cited entry must name the family's exact event type and cannot be DL-077 or DL-078; the registry revision, SHA-256 and family count before and after the family's admission, with exactly one more family; the SHA-256 of the live registry row; and a depth assessment under `reports/`, pinned by SHA-256, whose row for the family has the live registry row's family_id and family_revision and all twelve criteria at PASS, each PASS carrying at least one evidence item whose path is under `Plans/`. Each record also pins the SHA-256 of the receipt below (`implementation_receipt_sha256`), as each Step 3 holding row pins its receipt, so a changed receipt fails every record until they are rewritten. Currentness is judged per family against the live registry: a record's assessment row is current when its family_id and family_revision equal the live registry row. The assessment as a whole need not have been made against the live registry, which would force re-grading every family at every registration (coordinator ruling on review V-10, 2026-09-24). `reports/event-authority-20260911/step-10-post-august-admission-receipt.json` binds the live DL-077 section, the Step 3 validator pin it chains from, the current validator bytes and the author/lander task that must never apply the seal. The Step 3 holding check accepts its older validator pin only through that chain.

A missing, unreadable, misnamed, duplicate, stale or incomplete record, a record for a family outside that set, or an invalid receipt produces `post_august_admission_incomplete`, which blocks depth and overall pass. The family then stays outside the accepted set, so `unexpected_august_set` still fails for it. A completely recorded family is represented by its record: its old ledger row no longer counts toward the owner-veto, evidence-gap, unresolved or quarantine blocking checks, while every other row check still applies to it, and its depth comes from the pinned assessment instead of that row's cells. Every other rule is unchanged. The amendment admits, registers and certifies nothing, and restamps no freeze digest, closure hash or historical validator receipt.

## DL-412 multi-family registry steps (receipted, fail closed)

DL-412 (Jared, 2026-11-04, card E-CARDS-1 item 4c, option B) authorizes a third receipted change, after the DL-039 holding bucket and DL-077. DL-077's "second and last" is superseded for this change only; no other change is authorized. An admission record may describe a truthful registry step that added several families at once by carrying `registry_step_event_types`: a sorted list of two or more distinct event types, including the record's own, naming every family that step added. Such a record is complete only when `registry_after.family_count` equals `registry_before.family_count` plus the number of listed families and the two SHA-256 differ; every listed family is registered beyond Known37 and the August pair and has its own record carrying the identical list and the identical `registry_before` and `registry_after` (revision, SHA-256 and family count); no other record file in the record directory names the same before and after SHA-256; and every listed family's record is complete on its own, so a step counts only as a whole. On the multi-family path every record-directory entry is read strictly: duplicate keys at any depth, non-JSON constants, non-object roots, unreadable files and noncanonical registry state types or SHA-256 (including nested registry_before/registry_after claims) invalidate every step they could touch, conservatively all steps when disambiguation is impossible, naming the file. A strictly read foreign record mentioning either step SHA anywhere in keys or values, including nested containers and normalized Unicode/case/whitespace/numeric text, fails that step. Decimal and exponent numeric tokens retain their exact text for discovery, including `.0`, `e0`, fractional and overflow forms; no binary-float rounding may erase a mention. Any numeric representation in a registry SHA field remains noncanonical. Ordinary parsed numeric equality is preserved for the matching own-file exemption. Only a listed member's own strictly read matching record is exempt. Rejected-file claimants count. A no-field record keeps exactly its own DL-077 judgment. A step record pins the SHA-256 of the DL-412 receipt (`implementation_receipt_sha256`) instead of DL-077's. Every other rule of a DL-077 record applies to each record unchanged: its own decision entry naming its exact event type (DL-077 and DL-078 cannot be cited, and a step record cannot cite DL-412 either), its live registry row, and its own depth assessment row at the live family_id and family_revision with all twelve criteria at PASS, each PASS with evidence under `Plans/`. A record without `registry_step_event_types` is judged exactly as DL-077 judges it: exactly one more family, the DL-077 receipt, and DL-077 and DL-078 as the only barred decision entries. No step judgment ever adds a problem to it, whatever step records exist. `reports/event-authority-20261104/seal-check-multifamily-step-receipt.json` binds the live DL-412 section, the DL-077 receipt's bytes and the validator pin it chains from, the current validator bytes, and the author task and a named lander, both barred from applying the seal. The DL-077 receipt check recomputes SHA-256 from the validator's own live bytes on every call. Its observer presents the frozen DL-077 validator hash (`190a86f23e06362bdb98e27eb23268c9691db46cc41bc9f97e1fbb6bde1abc20`) at the original predicate position only when the live hash equals DL-412's `validator_after_sha256`, exactly one `Plans/Spec_Lock.json` `canonical_ssot_hashes.files` entry has path `reports/event-authority-20261104/seal-check-multifamily-step-receipt.json` and SHA-256 of that receipt's complete bytes, and DL-412's `validator_before_sha256` equals DL-077's `validator_after_sha256`. The bridge reads Spec Lock and the DL-412 receipt strictly as UTF-8 JSON objects, refusing duplicate keys at any depth, `NaN`, `Infinity`, `-Infinity`, BOM and trailing garbage. Selected lock fields require exact object/array/string types and the unique exact-path entry's hash must be a canonical lowercase 64-hex string. Parser or type failure means the anchor is absent. The shared legacy reader and the separate full DL-412 semantic predicate are unchanged. If either link or the exact unique anchor fails, or a chain input is missing, unreadable or not an object, the observer presents the live hash instead: DL-077 then rejects altered bytes with its original message and null returned pin, and holding fails through the same original predicate. The observer does not invoke the full DL-412 semantic predicate. With an exact matching receipt anchor and intact byte links, DL-412 authority, identity, lander, prior-receipt byte-pin and descriptive-text faults do not change DL-077's messages, predicate order, per-record diagnostics or returned receipt hash, nor Step 3 holding. Full DL-412 receipt integrity remains separately required for step records. The output adds only `multi_family_step_receipt_sha256`, null when the new receipt is invalid.

An unreadable, ambiguous or noncanonical record-directory file, a foreign mention of either step digest, a malformed list, a step of the wrong size, a missing, mismatched or extra record for the step, or a member that is incomplete on its own produces `post_august_admission_incomplete` for every record of the step (`registry_step_event_types`, `registry_before_after_not_exactly_step_families`, `registry_step_partial`, `registry_step_member_incomplete`), and none of its families is accepted, so `unexpected_august_set` still fails for each. The change relaxes exactly one thing: a family registered in a registry step that added several families can have a complete record whose before and after are that step's true states. It admits, registers and certifies nothing, waives no depth criterion or decision entry, restamps no freeze digest, closure hash, cohort pin, historical validator receipt, earlier change receipt or admission record, and leaves every other rule unchanged. As for one-family records, the check reads the records and the live registry only: whether the pinned before and after SHA-256 are the true registry bytes of the step is the record writer's claim, checked in review against git history, and edits to existing rows made in the same step are not examined.

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


## DL-451 separately frozen recount — fourth recorded change

DL-451 (E-CARDS-2 item 9.b A, Jared's answer “i approve all of it”) authorizes only this fourth recorded input change. The supplied 2026-11-05 05:00Z ruling, mail `1105050013-eb00`, is **pm7-build's reading of 9.b, not Jared's words**: final approval is one run in which all unchanged August checks pass and each of the 249 separately frozen recount names has its complete per-name outcome. A single-snapshot result is diagnostic only. This section supplements the August contracts above; it never replaces their denominator, fingerprint, freeze digest or predicate. If canon moving since August makes an August check impossible, stop and return that owner question to pm7-build; do not re-stamp or route around it.

The new reader opens `reports/event-authority-20261104/census-recount-20261104/RECEIPT.json` (SHA-256 `1d0ef48f472f2a6c521c6879e4c0b6ab0da98467dfe5b1a7546b3dbcef09a709`) and `NEW-LIST.json` in that directory (SHA-256 `2515ae5af31178a7d7a93581e982977bfb803d4494d779c72bebad9e7700376c`). It verifies complete bytes before strictly parsing them. The receipt must retain its original schema, false closure claim, frozen source revision `16acf7594a3fe8559af89491b895f440b314b99e`, list digest and byte count, and all 597 input fingerprints. The list must remain exactly 249 sorted unique named candidate objects, buckets b=51/c=18/d=32/e=148, with both original membership flags false. An August fingerprint beside recount membership cannot satisfy this separate identity.

Every receipt input must verify its own SHA-256 and exact byte count. Relative tracked sources are read from Git at the frozen source revision; `git:<full-40-hex-revision>:<safe-relative-path>` lineage inputs use their own revision. Absolute historical evidence inputs are read at their recorded paths. All missing, unreadable or mismatched inputs fail closed. Ignored files are not presumed to exist in Git. An optional environment input `PM_EA_RECOUNT_SOURCE_MAP` names a strict JSON object with exactly `schema_id: "pm.event_authority.recount_source_locations.v1"` and `locations`, an object mapping only original receipt input keys to explicit absolute saved-file locations. A mapped read never falls back. Every mapped file must still match its original receipt fingerprint and length; location remapping cannot select a new snapshot or source digest. The result records the complete map byte digest and locations. A newer edition or reproduced generator output does not substitute for original pinned bytes.

All new JSON readers reject duplicate keys at any depth, NaN/Infinity/-Infinity, numeric overflow to infinity, BOM, trailing data and wrong root/selected-field types. Byte counts and citation bounds require exact integers, excluding booleans, strings and fractional/exponent float representations. Source digests require canonical lowercase 64-hex strings. Revisions and safe relative paths are checked before Git reads. Existing legacy JSON readers and predicates remain unchanged.

The new audit input `Plans/.audits/event-authority-2026-08-12/recount/OUTCOMES.json` has `schema_id: "pm.assurance.event_authority.recount_outcomes.v1"`, `recount_receipt_sha256`, `recount_list_sha256`, and a `rows` array identifying all exact frozen names once in sorted order. No real outcome is created by this amendment. Each row has `event_type` and one `outcome`:

- `registered`: these are the only two row fields. The exact name must be in the existing DL-077/DL-412 accepted set, which requires its own complete original admission record, per-family decision and all twelve depth criteria. No new admission format or approval shortcut is added.
- `excluded`: the row additionally has `disposition: "RECLASSIFY_TO_EXCLUDED"`, its own `decision_ref` (`Plans/Decision_Log.md#DL-NNN`), the exact `decision_section_sha256`, nonempty `rationale`, and nonempty `source_citations`. Each citation has exactly `path`, `sha256`, `line_start`, `line_end`: a current Plans file, full-file byte digest and valid inclusive line span containing the exact event token, bounded on both sides by the absence of `[A-Za-z0-9_.]`. Prefix, suffix and dotted-sibling identifiers do not supply own-name evidence. The decision section must contain the exact name and match its pin. A name accepted as registered cannot simultaneously be excluded. These are mechanical custody and coverage checks; independent semantic review must verify that the own decision and cited owner evidence support exclusion, just as the unchanged admission predicate's section-name check does not independently adjudicate its decision's meaning.
- `decision_card`: the row additionally has only `card`, containing exactly a `reports/` path and full-byte `sha256`; that saved card must contain the exact name. Cards stay visible as unresolved and block combined approval. They are never converted into final approval or registration.

Malformed, missing, duplicate, extra, unknown, mixed-snapshot or contradictory outcome rows fail closed. A saved card supplies accounting, not closure. No all-pass count, copied receipt flag, missing record or source-integrity result may set approval.

The fourth receipt is `reports/event-authority-20261105/seal-check-recount-receipt.json`. It binds DL-451's exact section, the validator ID/path and before/after complete-byte hashes, the unchanged DL-412 receipt's bytes, both frozen recount byte pins, fixed author, actual nonempty lander, checked author/lander seal-applier exclusions and false authority flags. Its before-hash is `319f6bffddb07a36e633fd949146e4ce9149819ea5e817b13897a74314163a91`. A unique exact-path entry in `Plans/Spec_Lock.json` `canonical_ssot_hashes.files`, with a canonical SHA-256 matching the new receipt's complete final bytes, anchors this new link. Only when that anchor, the live fourth after-hash and third-to-fourth before-link match does the byte observer present the third frozen hash to the original DL-412 byte observation. The original FIX8 DL-412 anchor and its link to DL-077 are still required. Full fourth-receipt authority/identity/lander/prior-byte semantics are checked separately; no existing receipt is rewritten. Broken fourth links expose the live hash and fail the old chain closed. This cannot defend against rewriting the trusted anchors and enforcing code together; historical and semantic review remains required.

`main()` retains the complete original August computation, records its result in `named_checks.august_result_before_recount`, then ANDs each closure/depth/approval/pre-seal result with the separately verified recount outcomes in that same invocation. New failures block approval. `build_receipt()` also refuses final `pass` without both computed results. `input_pins.snapshots` identifies August's original receipt by `receipt_path` qualified by immutable `receipt_revision: "17c842445a2623bb0334ba8d6932e7a6bf088967"` and original `receipt_sha256: "9c75a19775c29ef64cd49084543e11a1a706fcda376b2b176a905928b6fae38e"`. It never reads historical identity from the working-tree receipt path, which remains the inherited runtime output and can contain a previous run. The recount receipt is likewise qualified by frozen revision `c53e4199ae94ca853a197354f3f9e7f296cf1efc` and its original byte hash; `observed_receipt_sha256` separately reports current input bytes. These revision/path/hash triples resolve to saved original bytes after consecutive default-output runs. Source inventory/denominator fingerprints and recount list expected/observed fingerprints remain separate, including on required-input failures. No historical receipt is moved or re-stamped. No selector certifies one snapshot alone. The receipt schema is unchanged; additions are inside its existing object-valued `input_pins` and `named_checks` fields.

Landing requires the decision and recount dependencies first, CA-SEAL before CA-SEAL2 in the same reviewed final E landing, actual lander slots filled, and the exact third and fourth receipt byte anchors supplied by `claude-projects-refresh`. The fourth writer is `reports/event-authority-20261105/write_recount_receipt.py`; it fills only the new receipt, never Spec Lock. Recompute its anchor after actual lander/prior-byte changes. Review before and after remains required. Author, actual lander, the stream lead/session, CA-SEAL and FIX1–FIX8, CA-SEAL2, and every other fix worker are procedurally barred from applying the seal. No admission, registry edit, definition-writing grant, application recording, seal or August re-stamp is performed.
