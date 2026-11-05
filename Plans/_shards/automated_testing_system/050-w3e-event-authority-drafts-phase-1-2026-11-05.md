# Shard 050: W3E event authority drafts - phase 1 (2026-11-05)

Source: `Plans/Automated_Testing_System.md`

Source lines: L7238-L7360

Source SHA256: `c53c48d3acfecbf1b557f7aa0ca115cdd1ab03445609122b8bf1db4ff9f13d43`

---

## W3E event authority drafts - phase 1 (2026-11-05)

Each unit below is a newly authored per-family contract. All current writer gates remain closed pending separate admission.

### ATS-1240 - W3E phase-1 per-family oracle plan

```yaml
plan_unit_id: ATS-1240
unit_type: contract
status: accepted
owner_doc: Plans/Automated_Testing_System.md
canonical_text: Newly authored oracle plan for the exact twenty W3E families listed in Plans/event_authority_w3e_oracle_plan.json.
  Each family has its own guard inventory, positives, single-defect negatives, source schema, owner method and retention
  question. prepared without admission; membership ABSENT, retention PENDING_RETENTION_DECISION, criterion 12 PARTIAL.
  This plan is not executed oracle code. Eagerly resolve every payload/source/token reference, including unvisited
  branches; exact type/full-string and all encoded-part 16384-byte checks remain required. SP-278 actual all-partition
  read proof and SP-286/CV-339 original first/full-value receipt proof are independent prerequisites; SP-337 supplies
  large-body custody. Existing owner suites validate inherited shape only and do not discharge these family oracles.
  Native execution NOT_RUN.
gui_related: false
gui_classification_reason: Defines event data, source custody, replay and internal checkpoints; existing surfaces
  only.
depends_on:
- CV-317
- CV-339
- SP-278
- SP-286
- SP-337
unblocks: []
acceptance_criteria:
- This exact family remains prepared without admission; current writes stay missing_event_registration.
- Every stated join and refusal has a positive and a single-defect negative planned; native execution is NOT_RUN.
- Retention is unresolved where explicitly marked; no lifetime or deletion policy is inferred.
validation_surfaces:
- Plans/event_authority_w3e_oracle_plan.json
- python3 scripts/pm-plan-index.py validate
risk_class: event_authority_identity_custody_or_replay
reasoning_tier: high
context_scope: ats-1240_w3e_phase1
implementation_surfaces:
- Plans/Automated_Testing_System.md
node_compile_hint:
  mode: owner_contract_only
  create_worknodes: false
  create_nodeseeds: false
  runtime_enabled: false
source_lineage:
- source_ref:decision:E-CARDS-2:9.a:A:2026-11-05
- /mnt/Cursor/PuppetMaster-Evidence/event-authority-20261104/decision-answers/ANSWERS_E-CARDS-2_20261105.md
- /mnt/Cursor/PuppetMaster-Evidence/event-authority-20261104/lanes/wave3/W3E-rows.jsonl
preserved_exact_tokens:
- prepared without admission
- PENDING_RETENTION_DECISION
- SP-278
- SP-286
- CV-339
- SP-337
negative_constraints:
- No admission, registry family append, Decision Log entry or native execution claim.
- No independent number/timestamp implementation or retention decision.
```

### ATS-1241 - W3E phase-2 guard isolation and shared profile gate

```yaml
plan_unit_id: ATS-1241
unit_type: contract
status: accepted
owner_doc: Plans/Automated_Testing_System.md
canonical_text: 'For every W3E family use its own plan in Plans/event_authority_w3e_oracle_plan.json, prepared without
  admission. Phase 2 begins only after the lead rebases onto the reviewed shared number/timestamp and scripts/pm_guard_isolation.py
  foundation. Invent no number/timestamp or proof implementation here. One negative violates one field/predicate;
  keep hashes, copies, keys and post-state coherent except the targeted join. Cut a compound guard per predicate.
  Duplicates mean the same field and same predicate at several sites: removing each site alone still rejects for
  that exact defect, removing all makes it pass. Shared refusal code, shared allOf/if/runtime site or several related
  fields never combines invariants. Cover every real schema and semantic guard and every actual enforcement site,
  history/current-writer separation, authentic old recipe, storage uint64 domain, RFC8785 qualification, SP-236
  physical numeric types and owner timestamp profiles. No oracle/proof PASS until executed coverage and shared-tool
  proof exist. Criterion 12 remains PARTIAL and retention PENDING_RETENTION_DECISION; adopt SP-278, SP-286 and SP-337
  unchanged.'
gui_related: false
gui_classification_reason: Defines event data, source custody, replay and internal checkpoints; existing surfaces
  only.
depends_on:
- ATS-1240
- CV-317
- CV-339
- SP-278
- SP-286
- SP-337
unblocks: []
acceptance_criteria:
- This exact family remains prepared without admission; current writes stay missing_event_registration.
- Every stated join and refusal has a positive and a single-defect negative planned; native execution is NOT_RUN.
- Retention is unresolved where explicitly marked; no lifetime or deletion policy is inferred.
validation_surfaces:
- Plans/event_authority_w3e_oracle_plan.json
- python3 scripts/pm-plan-index.py validate
risk_class: event_authority_identity_custody_or_replay
reasoning_tier: high
context_scope: ats-1241_w3e_phase1
implementation_surfaces:
- Plans/Automated_Testing_System.md
node_compile_hint:
  mode: owner_contract_only
  create_worknodes: false
  create_nodeseeds: false
  runtime_enabled: false
source_lineage:
- source_ref:decision:E-CARDS-2:9.a:A:2026-11-05
- /mnt/Cursor/PuppetMaster-Evidence/event-authority-20261104/decision-answers/ANSWERS_E-CARDS-2_20261105.md
- /mnt/Cursor/PuppetMaster-Evidence/event-authority-20261104/lanes/wave3/W3E-rows.jsonl
preserved_exact_tokens:
- prepared without admission
- PENDING_RETENTION_DECISION
- SP-278
- SP-286
- CV-339
- SP-337
negative_constraints:
- No admission, registry family append, Decision Log entry or native execution claim.
- No independent number/timestamp implementation or retention decision.
```
