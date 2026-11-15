# Shard 051: CS-1565 — Automation pause event route (newly authored, no admission)

Source: `Plans/Commands_System.md`

Source lines: L11253-L11305

Source SHA256: `967f23cf3fa0b7747ebae49b3c8636472572e8f842698d6f75c0de31f0348f7b`

---

## CS-1565 — Automation pause event route (newly authored, no admission)

```yaml
plan_unit_id: CS-1565
unit_type: interface_contract
status: accepted
owner_doc: Plans/Commands_System.md
canonical_text: The existing cmd.runtime.automation_pause.set and handlers::scheduling::automation_pause_set remain
  the only pause command route. SQR-1565 is the sole prepared runtime.automation_pause_changed semantic owner under
  SQR-018/020; CS-1565 is a command routing reference only, grants no event emission and does not own pause lifecycle.
gui_related: false
gui_classification_reason: Persisted semantic facts and source/recovery contracts only; existing presentation owners
  remain authoritative.
depends_on:
- CS-114
- SQR-1565
unblocks: []
acceptance_criteria:
- This exact family stays prepared without admission and retains each original owner boundary.
- Closed payload, authentic original source joins, receipt custody and read-only recovery satisfy the adjacent family-specific
  contract.
- Phase 2 must implement and prove every planned guard before criterion 12 can pass.
validation_surfaces:
- python3 scripts/pm-plan-index.py validate
- reports/event-authority-20261105/W3H-oracle-plan.json
risk_class: event_source_identity_or_replay_drift
reasoning_tier: high
context_scope: event_authority_w3h_phase1
implementation_surfaces:
- Plans/Commands_System.md
- Plans/Scheduling_and_Quota_Resume.md
node_compile_hint:
  mode: owner_contract_only
  create_worknodes: false
  create_nodeseeds: false
  runtime_enabled: false
source_lineage:
- E-CARDS-1 4b A (DL-411); exact original answer and deck SHA-256 in reports/event-authority-20261105/W3H.md
- reports/event-authority-20261105/W3H-search-evidence.json
preserved_exact_tokens:
- cmd.runtime.automation_pause.set
- runtime.automation_pause_changed
- SQR-1565
negative_constraints:
- No event admission, registry family append, Decision Log mutation, new feature or changed deletion rule.
- No local numeric/timestamp codec or proof machinery; adopt reviewed shared foundations in phase 2.
owner_hints:
- Plans/Scheduling_and_Quota_Resume.md#SQR-1565
```

`cmd.runtime.automation_pause.set` retains its existing sole handler and source/result shapes. `runtime.automation_pause_changed` is prepared only at Scheduling’s SQR-1565; this command index confers no admission, default, automatic clear, per-run Stop release or other pause semantics. Same-value sets still emit nothing.

ContractRef: ContractName:Plans/Scheduling_and_Quota_Resume.md#SQR-1565, ContractName:Plans/Commands_System.md#CS-114
