# Shard 068: W3I continuity oracle plans — phase 1 (2026-11-05)

Source: `Plans/Automated_Testing_System.md`

Source lines: L13871-L14083

Source SHA256: `f8ea41765327d5d0508d27999695154fbd7dbbff24b2317b2fc5cc971f3b737f`

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
