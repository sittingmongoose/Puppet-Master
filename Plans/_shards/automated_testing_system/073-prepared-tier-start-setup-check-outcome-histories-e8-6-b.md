# Shard 073: Prepared tier-start setup-check outcome histories (E8-6 B)

Source: `Plans/Automated_Testing_System.md`

Source lines: L15770-L15864

Source SHA256: `022812a0667e9e2c543506623d998f841be02b338dcb9375c55482b9eab95fc8`

---

## Prepared tier-start setup-check outcome histories (E8-6 B)

### ATS-3200 — config.validation.passed: prepared setup-history oracle obligations

`python3 scripts/pm-setup-validation-events.py check --out <evidence>` selects `config.validation.passed` and its CV-3200/SP-3200 contract in `Plans/setup_validation_event_families.json`. `guards --out <evidence>` runs at most eight actual checker predicates per table on the gated Method B tool. Owner schemas retain their keywords; new payload schema sites have individual refusal witnesses. Every mutation names its exact expected refusal; parser errors, crashes, wrong rows and unrelated failures are not kills. Positive controls include exact outcome precedence, nonempty pass findings, broad EventRecord/receipt timestamps and strict Storage timestamps. Distinct thread/node/attempt/requested/effective-account values expose cross-copy wiring errors.

Required vectors: missing/unknown/wrong-type and per-keyword payload failures; source-result contradiction; producer/scope/identity/schema and original runtime joins; new occurrence versus same-key full-value retry/conflict; uncertain-receipt recovery; real stored-byte/pack size and hash boundaries; retained reads selected only by sealed original receipt/store snapshot (missing, ambiguous, foreign, unsupported and tampered originals); late append and access/deletion/hold/withdrawal fence changes; compatibility reads and replay-only current-write refusal. Frozen history must survive changed live result/writer policy without side effects. Shared numbers, 4,400-digit input and both timestamp profiles are required. Executable deterministic models establish relational contracts only; native authentication, redb snapshot/CAS, durable append/pack/first-receipt recovery, held restore and concurrency require later runtime proof and remain NOT_RUN. Do not claim those as passed from fixture flags. Retention oracles verify signed E9-2 A / DL-086 authority and the exact existing RP-RUNTIME-365D@1.0.0 policy, including canonical Run-completion anchoring, the 31,536,000-second lifetime, per-Run/Project caps, successor rollover and holds. Missing or contradictory binding still refuses.

```yaml
plan_unit_id: ATS-3200
unit_type: contract
status: accepted
owner_doc: Plans/Automated_Testing_System.md
canonical_text: >-
  config.validation.passed has executable source, payload, identity, Storage/receipt, replay, retained-store and disclosure oracles; Method B and exact-refusal mutations grade only demonstrated static evidence, with runtime NOT_RUN and the existing DL-086 policy bound by signed E9-2 A.
gui_related: false
gui_classification_reason: Storage and deterministic contract validation only.
split_recommended: false
depends_on: ["CV-3200", "SP-3200", "ATS-003", "ATS-004"]
unblocks: []
acceptance_criteria:
- Each negative fails at its expected guard; only expected refusal counts as a mutation kill.
- Shared number/time calls and sealed-store retained reads are exercised.
- Report incomplete oracle obligations honestly.
negative_constraints:
- No current append before merge-2 admission and the exact existing retention binding under E9-2 A / DL-086.
- No native producer, redb, durability or access-race proof is claimed.
validation_surfaces:
- scripts/pm-setup-validation-events.py
- tests/fixtures/setup_validation_history/controls.json
- scripts/pm-shard-plans.py
- scripts/pm-plan-index.py
risk_class: setup_history_identity_custody_and_replay_drift
reasoning_tier: high
context_scope: event_authority_pnc019_s6v
implementation_surfaces:
- Plans/setup_validation_event_contracts.schema.json
- Plans/setup_validation_event_families.json
- scripts/pm_setup_validation_oracles.py
- scripts/pm-setup-validation-events.py
node_compile_hint:
  mode: owner_contract_only
  create_worknodes: false
  create_nodeseeds: false
  runtime_enabled: false
source_lineage: [Plans/orchestrator-subagent-integration.md#OSI-109, Plans/orchestrator-subagent-integration.md#OSI-680, Plans/Decision_Log.md#DL-086]
preserved_exact_tokens: ["config.validation.passed", "RP-RUNTIME-365D@1.0.0", "E9-2"]
```

### ATS-3201 — config.validation.warning: prepared setup-history oracle obligations

`python3 scripts/pm-setup-validation-events.py check --out <evidence>` selects `config.validation.warning` and its CV-3201/SP-3201 contract in `Plans/setup_validation_event_families.json`. `guards --out <evidence>` runs at most eight actual checker predicates per table on the gated Method B tool. Owner schemas retain their keywords; new payload schema sites have individual refusal witnesses. Every mutation names its exact expected refusal; parser errors, crashes, wrong rows and unrelated failures are not kills. Positive controls include exact outcome precedence, nonempty pass findings, broad EventRecord/receipt timestamps and strict Storage timestamps. Distinct thread/node/attempt/requested/effective-account values expose cross-copy wiring errors.

Required vectors: missing/unknown/wrong-type and per-keyword payload failures; source-result contradiction; producer/scope/identity/schema and original runtime joins; new occurrence versus same-key full-value retry/conflict; uncertain-receipt recovery; real stored-byte/pack size and hash boundaries; retained reads selected only by sealed original receipt/store snapshot (missing, ambiguous, foreign, unsupported and tampered originals); late append and access/deletion/hold/withdrawal fence changes; compatibility reads and replay-only current-write refusal. Frozen history must survive changed live result/writer policy without side effects. Shared numbers, 4,400-digit input and both timestamp profiles are required. Executable deterministic models establish relational contracts only; native authentication, redb snapshot/CAS, durable append/pack/first-receipt recovery, held restore and concurrency require later runtime proof and remain NOT_RUN. Do not claim those as passed from fixture flags. Retention oracles verify signed E9-2 A / DL-086 authority and the exact existing RP-RUNTIME-365D@1.0.0 policy, including canonical Run-completion anchoring, the 31,536,000-second lifetime, per-Run/Project caps, successor rollover and holds. Missing or contradictory binding still refuses.

```yaml
plan_unit_id: ATS-3201
unit_type: contract
status: accepted
owner_doc: Plans/Automated_Testing_System.md
canonical_text: >-
  config.validation.warning has executable source, payload, identity, Storage/receipt, replay, retained-store and disclosure oracles; Method B and exact-refusal mutations grade only demonstrated static evidence, with runtime NOT_RUN and the existing DL-086 policy bound by signed E9-2 A.
gui_related: false
gui_classification_reason: Storage and deterministic contract validation only.
split_recommended: false
depends_on: ["CV-3201", "SP-3201", "ATS-003", "ATS-004"]
unblocks: []
acceptance_criteria:
- Each negative fails at its expected guard; only expected refusal counts as a mutation kill.
- Shared number/time calls and sealed-store retained reads are exercised.
- Report incomplete oracle obligations honestly.
negative_constraints:
- No current append before merge-2 admission and the exact existing retention binding under E9-2 A / DL-086.
- No native producer, redb, durability or access-race proof is claimed.
validation_surfaces:
- scripts/pm-setup-validation-events.py
- tests/fixtures/setup_validation_history/controls.json
- scripts/pm-shard-plans.py
- scripts/pm-plan-index.py
risk_class: setup_history_identity_custody_and_replay_drift
reasoning_tier: high
context_scope: event_authority_pnc019_s6v
implementation_surfaces:
- Plans/setup_validation_event_contracts.schema.json
- Plans/setup_validation_event_families.json
- scripts/pm_setup_validation_oracles.py
- scripts/pm-setup-validation-events.py
node_compile_hint:
  mode: owner_contract_only
  create_worknodes: false
  create_nodeseeds: false
  runtime_enabled: false
source_lineage: [Plans/orchestrator-subagent-integration.md#OSI-109, Plans/orchestrator-subagent-integration.md#OSI-680, Plans/Decision_Log.md#DL-086]
preserved_exact_tokens: ["config.validation.warning", "RP-RUNTIME-365D@1.0.0", "E9-2"]
```
