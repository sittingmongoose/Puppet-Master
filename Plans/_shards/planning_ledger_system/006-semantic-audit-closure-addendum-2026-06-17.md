# Shard 006: Semantic Audit Closure Addendum - 2026-06-17

Source: `Plans/Planning_Ledger_System.md`

Source lines: L490-L612

Source SHA256: `9aa7510cb8c1c644ba7e9659fbba88da8064c7ad89863f1e5b6bae3b394b9723`

---

## Semantic Audit Closure Addendum - 2026-06-17

### PLS-012 - Semantic Closure Registry And Reopen Contract

```yaml
plan_unit_id: PLS-012
unit_type: requirement
status: accepted
owner_doc: Plans/Planning_Ledger_System.md
canonical_text: >-
  Deep semantic audit and repair cycles use the global
  Plans/.audits/_semantic_closure_registry.jsonl registry to make audit
  findings durable across runs. Registry rows preserve closure_id, finding_key,
  finding_family, ledger_id, audit_ids, source_atom_ids, plan_unit_ids,
  owner_docs, consumer_docs, detail_keys, exact_tokens, closure_status,
  closure_evidence, closure_reason, hashes, created_at, updated_at,
  closed_by_audit_id, and reopen_conditions. Audit findings carry
  repair_required:boolean and finding_level:blocker|warning|observation.
  BLOCKED is reserved for repair_required=true findings, validator failures or
  validator state mutation, forbidden artifacts, or required user decisions.
  PASS_WITH_WARNINGS is terminal when all findings have repair_required=false;
  PASS means no findings. Audits read the registry before emitting new semantic
  risks; if an unchanged finding is already closed with valid evidence and
  hashes, the audit classifies it as previously_closed with repair_required=false
  rather than a new warning. A finding reopens only when the source atom hash,
  PlanUnit hash, owner evidence hash, or closure evidence hash changes, or when
  the current closure_status is blocked_requires_user_decision or reopened.
  Audits record subject_ref as the latest substantive commit touching live
  Plans, target-ledger governing state, .plan_index, governance, or process
  scripts, excluding Plans/.audits/** and closure-registry-only or hygiene
  commits; HEAD is recorded separately as observation_ref. Ledger latest_audit_*
  tracks the latest state-certifying audit or repair that changed or validated
  canonical Plans, ledger governing state, index, or governance. Audit-only
  observations and hygiene repairs do not stale or restamp ledger projections.
  Deep audits may schema-check prior audit artifacts but must not emit
  semantic/currentness findings about old report wording, review/commit text, or
  missing pointers to audit-only runs. Chat-sourced semantic closure support is
  recorded as source-lineage process support unless a v2 ledger atom or decision
  explicitly owns it.
gui_related: false
gui_classification_reason: Audit closure durability and reopen policy are process/governance behavior, not GUI implementation work.
depends_on:
  - PLS-005
  - PLS-010
unblocks:
  - PDS-014
acceptance_criteria:
  - The global closure registry exists at Plans/.audits/_semantic_closure_registry.jsonl.
  - Deep audits treat unchanged closed findings as previously_closed, not new semantic_risks.
  - Every new audit finding records repair_required:boolean and finding_level:blocker|warning|observation.
  - PASS_WITH_WARNINGS is terminal when every finding has repair_required=false.
  - subject_ref excludes Plans/.audits/** and closure-registry-only or hygiene commits; observation_ref records HEAD separately.
  - latest_audit_* projections track only state-certifying audits or repairs, not audit-only observations or hygiene repairs.
  - Planning Wizard, PlanCompile, and WorkNode audit findings reuse closed registry rows when evidence has not changed.
  - Reopen decisions are based on changed source atom, PlanUnit, owner evidence, or closure evidence hashes, or on blocked/reopened closure status.
  - Closure rows preserve the allowed statuses repaired, false_positive, explicitly_deferred, source_lineage_only, not_for_plan, stale_retired, blocked_requires_user_decision, and reopened.
  - Chat-sourced closure-support PlanUnits are not represented as outputs of a target ledger compile unless their source_lineage names that ledger atom or decision.
validation_surfaces:
  - python3 scripts/pm-audit-closure.py validate
  - python3 scripts/pm-audit-closure.py validate --audit-dir Plans/.audits/<audit_id> --require-closure-matrix
  - python3 -m unittest tests/test_pm_audit_closure.py
risk_class: repeated_audit_loop
reasoning_tier: high
context_scope: bootstrap_audit_repair
implementation_surfaces:
  - Plans/.audits/_semantic_closure_registry.jsonl
  - Plans/.audits/audit-*/repair_closure_matrix.jsonl
  - Plans/bootstrap/Codex_Prompts.md
  - scripts/pm-audit-closure.py
  - tests/test_pm_audit_closure.py
node_compile_hint:
  mode: audit_registry_process
  create_worknodes: false
source_lineage:
  - pldg-20260617-001-plans-to-code-handoff:atom-0054
  - source_ref:chat:2026-06-17-semantic-closure-registry-support
preserved_exact_tokens:
  - "Plans/.audits/_semantic_closure_registry.jsonl"
  - "Planning Wizard"
  - "Plan Wizard"
  - "closure_id"
  - "finding_key"
  - "finding_family"
  - "ledger_id"
  - "audit_ids"
  - "source_atom_ids"
  - "plan_unit_ids"
  - "owner_docs"
  - "consumer_docs"
  - "detail_keys"
  - "exact_tokens"
  - "closure_status"
  - "closure_evidence"
  - "closure_reason"
  - "hashes"
  - "created_at"
  - "updated_at"
  - "closed_by_audit_id"
  - "reopen_conditions"
  - "previously_closed"
  - "repair_required"
  - "finding_level"
  - "subject_ref"
  - "observation_ref"
  - "PASS_WITH_WARNINGS"
  - "source-lineage process support"
compatibility_only_notes:
  - Plan Wizard is a retired compatibility/search term; active audit prose uses Planning Wizard.
stale_retired_dispositions:
  - Plan Wizard is retained only as compatibility/source-lineage terminology and not as the current product name.
negative_constraints:
  - Do not re-emit unchanged closed findings as new warnings.
  - Do not require repair closure rows for previously_closed, exact_present, equivalent_with_evidence, repair_required=false warnings, ordinary validator warnings, or audit-artifact wording.
  - Do not stale ledger latest_audit_* projections because of audit-only observations or hygiene-only commits.
  - Do not hide a finding when source/canonical/owner/closure evidence hashes changed.
  - Do not create WorkNodes, NodeSeeds, executable queues, final node manifests, implementation files, or production build tasks from audit closure state.
  - Do not place chat-sourced closure-support PlanUnits under a target-ledger compile addendum as though they were compiled from that ledger.
owner_hints:
  - Plans/Planning_Ledger_System.md
  - Plans/Plan_Document_System.md
```

ContractRef: ContractName:Plans/Planning_Ledger_System.md, ContractName:Plans/Plan_Document_System.md
