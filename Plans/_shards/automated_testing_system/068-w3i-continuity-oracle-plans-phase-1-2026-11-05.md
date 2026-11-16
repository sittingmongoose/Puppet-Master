# Shard 068: W3I continuity oracle plans — phase 1 (2026-11-05)

Source: `Plans/Automated_Testing_System.md`

Source lines: L13871-L14149

Source SHA256: `a14faaeeff125d0ccc2775d3f1bcc4372b8ff689a01b632bcd508e52a2e5d14e`

---

## W3I continuity oracle plans — phase 1 (2026-11-05)

### ATS-1280 — `continuity.actor_identified` criterion-12 oracle plan

**NEWLY AUTHORED plan**, not oracle code. Phase-1 grade is PARTIAL. Phase 2 adopts the reviewed shared number/timestamp helper and `scripts/pm_guard_isolation.py`; it implements and executes these cases for this family itself. Native execution is NOT_RUN.

Positive base: genuine Project `p-w3i` (encoded partition `project~cC13M2k`), one authenticated already-issued original source, a complete `actor_identified` payload and exact matching EventRecord/source/receipt, successful append after admission, matching current projection and nine-field checkpoint. Include exact retry after a lost acknowledgement, original retained history after a live-source change, authentic supported compatibility/replay-only rebuild, actual SP-337 body above 16 KiB where an owner-valid payload permits one (otherwise the size-refusal boundary), source-frame relocation through authenticated translation, held retention/restore, CAS success, withdrawal plus verified successor, and this family's own fact predicate: actor_ref and actor_kind equal the independently resolved original source principal and principal kind. Non-admission is the current positive refusal case, not a success fixture.

For each row in `W3I-oracle-plan.json`, create a valid base and exactly one defective input invariant for this family. Guards include separate checks for every required property/type/const/ref/length, unknown root/nested keys, every source fact join, family/schema/version/scope, recomputed event ID and key, each semantic-body field on retry, each original first-receipt field, each token/cursor/root/dataset/publication/coverage join, original recipe selection, body/reference byte size/hash/media type, access/deletion/holds, transition order/CAS, and writer/reader withdrawal. Wrong-type variants include string booleans/numbers, null, arrays and objects only where one is the isolated type defect. Every identifier gets a trailing-LF negative; every formatted time gets malformed and boundary negatives via the shared owner profile. Current-writer replay-only, same-key changed body, unsupported reference/version, missing original source/receipt, substituted original identity, and a failed outcome reported as success each have their own refusal case.

Fixture construction must update derived dependent copies/hashes from the changed upstream value when those are not the invariant being tested; otherwise it has multiple defects. Recompute all remaining valid relationships, assert the intended single mismatch, and use shared predicate-level guard removal. Sites enforcing the same field/predicate are inventoried individually; cutting one leaves its true duplicate sites active, and cutting all and only that duplicate predicate must admit the negative. Distinct predicates sharing one rule/refusal are never merged. Record the target guard, exact defect, remaining valid guards, removal results and fixture provenance. No lane-local number/time/proof machinery is authored.

```yaml
plan_unit_id: ATS-1280
unit_type: requirement
status: accepted
owner_doc: Plans/Automated_Testing_System.md
canonical_text: NEWLY AUTHORED phase-1 criterion-12 plan for continuity.actor_identified; execution and guard isolation
  remain PARTIAL until the reviewed shared number/timestamp and predicate-level isolation tools are adopted in phase
  2.
gui_related: false
gui_classification_reason: Audit lineage, storage, and test contracts; no new presentation behavior.
depends_on:
- OSI-1600
- CV-1600
- SP-1600
unblocks: []
acceptance_criteria:
- Own positives and single-defect negatives cover every named guard.
- No oracle PASS or native/runtime readiness claim in phase 1.
validation_surfaces:
- reports/event-authority-20261105/W3I-oracle-plan.json
risk_class: continuity_source_custody_drift
reasoning_tier: high
context_scope: event_authority_w3i_phase1
implementation_surfaces:
- Plans/Automated_Testing_System.md
- Plans/continuity_event_contracts.schema.json
node_compile_hint:
  mode: prepared_without_admission
  create_worknodes: false
  create_nodeseeds: false
  runtime_enabled: false
source_lineage:
- E-CARDS-2 item 9.a A; answer i approve all of it; DL-450 on plans/ea-cards2-answers-20261105
- reports/event-authority-20261105/W3I.md#ats-1280
preserved_exact_tokens:
- continuity.actor_identified
- PARTIAL
- NOT_RUN
negative_constraints:
- No event-family admission, native execution, registry append, or PNC-019 clearance.
- No runtime_continuity alias or receipt reconstructed from current state.
```

### ATS-1281 — `continuity.provenance_recorded` criterion-12 oracle plan

**NEWLY AUTHORED plan**, not oracle code. Phase-1 grade is PARTIAL. Phase 2 adopts the reviewed shared number/timestamp helper and `scripts/pm_guard_isolation.py`; it implements and executes these cases for this family itself. Native execution is NOT_RUN.

Positive base: genuine Project `p-w3i` (encoded partition `project~cC13M2k`), one authenticated already-issued original source, a complete `provenance_recorded` payload and exact matching EventRecord/source/receipt, successful append after admission, matching current projection and nine-field checkpoint. Include exact retry after a lost acknowledgement, original retained history after a live-source change, authentic supported compatibility/replay-only rebuild, actual SP-337 body above 16 KiB where an owner-valid payload permits one (otherwise the size-refusal boundary), source-frame relocation through authenticated translation, held retention/restore, CAS success, withdrawal plus verified successor, and this family's own fact predicate: provenance_ref resolves the exact retained output or handoff version that names source_event_id; a route target is not provenance evidence. Non-admission is the current positive refusal case, not a success fixture.

For each row in `W3I-oracle-plan.json`, create a valid base and exactly one defective input invariant for this family. Guards include separate checks for every required property/type/const/ref/length, unknown root/nested keys, every source fact join, family/schema/version/scope, recomputed event ID and key, each semantic-body field on retry, each original first-receipt field, each token/cursor/root/dataset/publication/coverage join, original recipe selection, body/reference byte size/hash/media type, access/deletion/holds, transition order/CAS, and writer/reader withdrawal. Wrong-type variants include string booleans/numbers, null, arrays and objects only where one is the isolated type defect. Every identifier gets a trailing-LF negative; every formatted time gets malformed and boundary negatives via the shared owner profile. Current-writer replay-only, same-key changed body, unsupported reference/version, missing original source/receipt, substituted original identity, and a failed outcome reported as success each have their own refusal case.

Fixture construction must update derived dependent copies/hashes from the changed upstream value when those are not the invariant being tested; otherwise it has multiple defects. Recompute all remaining valid relationships, assert the intended single mismatch, and use shared predicate-level guard removal. Sites enforcing the same field/predicate are inventoried individually; cutting one leaves its true duplicate sites active, and cutting all and only that duplicate predicate must admit the negative. Distinct predicates sharing one rule/refusal are never merged. Record the target guard, exact defect, remaining valid guards, removal results and fixture provenance. No lane-local number/time/proof machinery is authored.

```yaml
plan_unit_id: ATS-1281
unit_type: requirement
status: accepted
owner_doc: Plans/Automated_Testing_System.md
canonical_text: NEWLY AUTHORED phase-1 criterion-12 plan for continuity.provenance_recorded; execution and guard
  isolation remain PARTIAL until the reviewed shared number/timestamp and predicate-level isolation tools are adopted
  in phase 2.
gui_related: false
gui_classification_reason: Audit lineage, storage, and test contracts; no new presentation behavior.
depends_on:
- OSI-1601
- CV-1601
- SP-1601
unblocks: []
acceptance_criteria:
- Own positives and single-defect negatives cover every named guard.
- No oracle PASS or native/runtime readiness claim in phase 1.
validation_surfaces:
- reports/event-authority-20261105/W3I-oracle-plan.json
risk_class: continuity_source_custody_drift
reasoning_tier: high
context_scope: event_authority_w3i_phase1
implementation_surfaces:
- Plans/Automated_Testing_System.md
- Plans/continuity_event_contracts.schema.json
node_compile_hint:
  mode: prepared_without_admission
  create_worknodes: false
  create_nodeseeds: false
  runtime_enabled: false
source_lineage:
- E-CARDS-2 item 9.a A; answer i approve all of it; DL-450 on plans/ea-cards2-answers-20261105
- reports/event-authority-20261105/W3I.md#ats-1281
preserved_exact_tokens:
- continuity.provenance_recorded
- PARTIAL
- NOT_RUN
negative_constraints:
- No event-family admission, native execution, registry append, or PNC-019 clearance.
- No runtime_continuity alias or receipt reconstructed from current state.
```

### ATS-1282 — `continuity.redaction_applied` criterion-12 oracle plan

**NEWLY AUTHORED plan**, not oracle code. Phase-1 grade is PARTIAL. Phase 2 adopts the reviewed shared number/timestamp helper and `scripts/pm_guard_isolation.py`; it implements and executes these cases for this family itself. Native execution is NOT_RUN.

Positive base: genuine Project `p-w3i` (encoded partition `project~cC13M2k`), one authenticated already-issued original source, a complete `redaction_applied` payload and exact matching EventRecord/source/receipt, successful append after admission, matching current projection and nine-field checkpoint. Include exact retry after a lost acknowledgement, original retained history after a live-source change, authentic supported compatibility/replay-only rebuild, actual SP-337 body above 16 KiB where an owner-valid payload permits one (otherwise the size-refusal boundary), source-frame relocation through authenticated translation, held retention/restore, CAS success, withdrawal plus verified successor, and this family's own fact predicate: redaction_profile_id and redaction_decision equal the actual original redaction owner result for provenance_ref, including its transform/version; a requested transform is not an applied result. Non-admission is the current positive refusal case, not a success fixture.

For each row in `W3I-oracle-plan.json`, create a valid base and exactly one defective input invariant for this family. Guards include separate checks for every required property/type/const/ref/length, unknown root/nested keys, every source fact join, family/schema/version/scope, recomputed event ID and key, each semantic-body field on retry, each original first-receipt field, each token/cursor/root/dataset/publication/coverage join, original recipe selection, body/reference byte size/hash/media type, access/deletion/holds, transition order/CAS, and writer/reader withdrawal. Wrong-type variants include string booleans/numbers, null, arrays and objects only where one is the isolated type defect. Every identifier gets a trailing-LF negative; every formatted time gets malformed and boundary negatives via the shared owner profile. Current-writer replay-only, same-key changed body, unsupported reference/version, missing original source/receipt, substituted original identity, and a failed outcome reported as success each have their own refusal case.

Fixture construction must update derived dependent copies/hashes from the changed upstream value when those are not the invariant being tested; otherwise it has multiple defects. Recompute all remaining valid relationships, assert the intended single mismatch, and use shared predicate-level guard removal. Sites enforcing the same field/predicate are inventoried individually; cutting one leaves its true duplicate sites active, and cutting all and only that duplicate predicate must admit the negative. Distinct predicates sharing one rule/refusal are never merged. Record the target guard, exact defect, remaining valid guards, removal results and fixture provenance. No lane-local number/time/proof machinery is authored.

```yaml
plan_unit_id: ATS-1282
unit_type: requirement
status: accepted
owner_doc: Plans/Automated_Testing_System.md
canonical_text: NEWLY AUTHORED phase-1 criterion-12 plan for continuity.redaction_applied; execution and guard isolation
  remain PARTIAL until the reviewed shared number/timestamp and predicate-level isolation tools are adopted in phase
  2.
gui_related: false
gui_classification_reason: Audit lineage, storage, and test contracts; no new presentation behavior.
depends_on:
- OSI-1602
- CV-1602
- SP-1602
unblocks: []
acceptance_criteria:
- Own positives and single-defect negatives cover every named guard.
- No oracle PASS or native/runtime readiness claim in phase 1.
validation_surfaces:
- reports/event-authority-20261105/W3I-oracle-plan.json
risk_class: continuity_source_custody_drift
reasoning_tier: high
context_scope: event_authority_w3i_phase1
implementation_surfaces:
- Plans/Automated_Testing_System.md
- Plans/continuity_event_contracts.schema.json
node_compile_hint:
  mode: prepared_without_admission
  create_worknodes: false
  create_nodeseeds: false
  runtime_enabled: false
source_lineage:
- E-CARDS-2 item 9.a A; answer i approve all of it; DL-450 on plans/ea-cards2-answers-20261105
- reports/event-authority-20261105/W3I.md#ats-1282
preserved_exact_tokens:
- continuity.redaction_applied
- PARTIAL
- NOT_RUN
negative_constraints:
- No event-family admission, native execution, registry append, or PNC-019 clearance.
- No runtime_continuity alias or receipt reconstructed from current state.
```

### ATS-1283 — `continuity.replay_checkpointed` criterion-12 oracle plan

**NEWLY AUTHORED plan**, not oracle code. Phase-1 grade is PARTIAL. Phase 2 adopts the reviewed shared number/timestamp helper and `scripts/pm_guard_isolation.py`; it implements and executes these cases for this family itself. Native execution is NOT_RUN.

Positive base: genuine Project `p-w3i` (encoded partition `project~cC13M2k`), one authenticated already-issued original source, a complete `replay_checkpointed` payload and exact matching EventRecord/source/receipt, successful append after admission, matching current projection and nine-field checkpoint. Include exact retry after a lost acknowledgement, original retained history after a live-source change, authentic supported compatibility/replay-only rebuild, actual SP-337 body above 16 KiB where an owner-valid payload permits one (otherwise the size-refusal boundary), source-frame relocation through authenticated translation, held retention/restore, CAS success, withdrawal plus verified successor, and this family's own fact predicate: replay_checkpoint_ref resolves the original source stream checkpoint, whose complete SP-278 durable token and examined prefix include source_event_id; it is an upstream checkpoint, never this event or its downstream continuity checkpoint. Non-admission is the current positive refusal case, not a success fixture.

For each row in `W3I-oracle-plan.json`, create a valid base and exactly one defective input invariant for this family. Guards include separate checks for every required property/type/const/ref/length, unknown root/nested keys, every source fact join, family/schema/version/scope, recomputed event ID and key, each semantic-body field on retry, each original first-receipt field, each token/cursor/root/dataset/publication/coverage join, original recipe selection, body/reference byte size/hash/media type, access/deletion/holds, transition order/CAS, and writer/reader withdrawal. Wrong-type variants include string booleans/numbers, null, arrays and objects only where one is the isolated type defect. Every identifier gets a trailing-LF negative; every formatted time gets malformed and boundary negatives via the shared owner profile. Current-writer replay-only, same-key changed body, unsupported reference/version, missing original source/receipt, substituted original identity, and a failed outcome reported as success each have their own refusal case.

Fixture construction must update derived dependent copies/hashes from the changed upstream value when those are not the invariant being tested; otherwise it has multiple defects. Recompute all remaining valid relationships, assert the intended single mismatch, and use shared predicate-level guard removal. Sites enforcing the same field/predicate are inventoried individually; cutting one leaves its true duplicate sites active, and cutting all and only that duplicate predicate must admit the negative. Distinct predicates sharing one rule/refusal are never merged. Record the target guard, exact defect, remaining valid guards, removal results and fixture provenance. No lane-local number/time/proof machinery is authored.

```yaml
plan_unit_id: ATS-1283
unit_type: requirement
status: accepted
owner_doc: Plans/Automated_Testing_System.md
canonical_text: NEWLY AUTHORED phase-1 criterion-12 plan for continuity.replay_checkpointed; execution and guard
  isolation remain PARTIAL until the reviewed shared number/timestamp and predicate-level isolation tools are adopted
  in phase 2.
gui_related: false
gui_classification_reason: Audit lineage, storage, and test contracts; no new presentation behavior.
depends_on:
- OSI-1603
- CV-1603
- SP-1603
unblocks: []
acceptance_criteria:
- Own positives and single-defect negatives cover every named guard.
- No oracle PASS or native/runtime readiness claim in phase 1.
validation_surfaces:
- reports/event-authority-20261105/W3I-oracle-plan.json
risk_class: continuity_source_custody_drift
reasoning_tier: high
context_scope: event_authority_w3i_phase1
implementation_surfaces:
- Plans/Automated_Testing_System.md
- Plans/continuity_event_contracts.schema.json
node_compile_hint:
  mode: prepared_without_admission
  create_worknodes: false
  create_nodeseeds: false
  runtime_enabled: false
source_lineage:
- E-CARDS-2 item 9.a A; answer i approve all of it; DL-450 on plans/ea-cards2-answers-20261105
- reports/event-authority-20261105/W3I.md#ats-1283
preserved_exact_tokens:
- continuity.replay_checkpointed
- PARTIAL
- NOT_RUN
negative_constraints:
- No event-family admission, native execution, registry append, or PNC-019 clearance.
- No runtime_continuity alias or receipt reconstructed from current state.
```


### ATS-1230 - BSD W3D phase-1 oracle plan

```yaml
plan_unit_id: ATS-1230
unit_type: validation_contract
status: draft
owner_doc: Plans/Automated_Testing_System.md
canonical_text: |-
  Newly authored criterion-12 oracle plan for exactly the fifteen W3D BSD families at proposed 1.0.0, prepared without admission. Plans/bsd_event_oracle_plan.json contains each exact name, its own positive paths and field/predicate-level negative inventory, including every required payload field, exact type/value, source identity/custody, transition, first receipt, storage metadata, 16 KiB value/reference path, retention, replay, checkpoint and withdrawal guard. Every planned negative has one semantic defect and valid unrelated identities/copies/digests/source/post-state. Split compound rules by field/predicate; only identical predicates on the same field at multiple sites form duplicate sets. In phase 2 use the reviewed scripts/pm_guard_isolation.py foundation and prove each site separately, then all duplicate sites together. No lane-local number/timestamp implementation or guard-proof engine is authored. Current integer/digest/physical domains and timestamp profiles come from the reviewed plans/ea-numrule-20261105 foundation; retained old recipes use authenticated original dispatch and cannot select a weaker recipe by assertion. Each family independently plans current write-permission refusal with read access valid, registered-owner and writer-generation fences, effective Stop, and every applicable current-epoch and source/envelope join. Each envelope thread/run/account/actor/causation/parent/correlation/node/attempt join changes only its target field; regenerate all unrelated commitments without changing the authentic source. The thirteen assignment-backed rows test envelope run_id against the actual assignment primary_run_id independently of the payload run join. Configuration rows explicitly keep assignment/run/epoch/generation null rather than inventing a live epoch. Current epoch tests preserve valid old-epoch historical originals; finding clearance retains its separate authenticated replacement-control positive and rejects a substituted current replacement control independently. Assignment-start positives preserve Auto and On exactly, with independent Off/lowercase/inherit negatives. Review-start positives have authentic immutable admission facts and no result yet; independent negatives cover invalid admission source, premature result and each terminal-to-start join. Writer negatives include projector_replay_only; historical positives include valid retained replay-only/original history after live state changes. Malformed/unvisited $ref branches fail eagerly; formatted strings require the shared fail-closed profile, never silent jsonschema format omission. Every reference/identifier has trailing-LF/CR negatives, every exact type has disallowed string boolean/number/null/container cases, and every guard has a positive plus a single-defect negative plan. File existence, schema validation and this inventory are not executed event-oracle, mutation, native or buildability proof. The exact per-family plans adopt SP-278 source/checkpoint guards and SP-286 first-receipt guards. Criterion 12 is PARTIAL for every family until actual phase-2 fixtures/checkers and shared guard-isolation evidence pass Sol and Astra review. No event registry membership or physical family admission is granted.
gui_related: false
gui_classification_reason: Defines internal event, identity, Storage custody or validation, without changing presentation.
depends_on:
- BSD-1350
- BSD-1351
- BSD-1352
- BSD-1353
- BSD-1354
- BSD-1355
- BSD-1356
- BSD-1357
- BSD-1358
- BSD-1359
- BSD-1360
- BSD-1361
- BSD-1362
- BSD-1363
- BSD-1364
unblocks: []
acceptance_criteria:
- Exact family semantics, payload, original-source identity and retry custody are bound.
- No unregistered append, physical admission or native/runtime success is implied.
- Phase-2 oracle and shared guard-isolation proof remain mandatory before review/admission.
validation_surfaces:
- python3 scripts/pm-shard-plans.py --check --config Plans/sharding_config.json
- python3 scripts/pm-plan-index.py validate
- Plans/bsd_event_oracle_plan.json
risk_class: advisory_history_identity_custody_or_replay_drift
reasoning_tier: high
context_scope: event_authority_w3d_phase1
implementation_surfaces:
- Plans/Automated_Testing_System.md
- Plans/bsd_event_payloads.schema.json
- Plans/bsd_event_storage_contracts.schema.json
- Plans/bsd_event_storage_candidates.json
node_compile_hint:
  mode: owner_contract_only
  create_worknodes: false
  create_nodeseeds: false
  runtime_enabled: false
source_lineage:
- reports/event-authority-20261105/W3D.md
- Deck-2 item 9.a A (answer record 2026-11-05; DL-450 application pending)
preserved_exact_tokens:
- PARTIAL
- projector_replay_only
- SP-278
- SP-286
- pm_guard_isolation.py
negative_constraints:
- Do not append a registry family, admit an event, enable BSD commands or treat static definitions as runtime evidence.
- Do not define a local number/timestamp implementation or guard-isolation proof engine.
owner_hints:
- Plans/Automated_Testing_System.md
```
