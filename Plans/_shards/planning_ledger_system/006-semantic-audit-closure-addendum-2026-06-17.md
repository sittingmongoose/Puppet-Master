# Shard 006: Semantic Audit Closure Addendum - 2026-06-17

Source: `Plans/Planning_Ledger_System.md`

Source lines: L485-L577

Source SHA256: `18635de76072c35159674c06e12e43934dad39178dc5615cec2bf48127cdac46`

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
  closed_by_audit_id, and reopen_conditions. Audits read the registry before
  emitting new semantic risks; if an unchanged finding is already closed with
  valid evidence and hashes, the audit classifies it as previously_closed rather
  than a new warning. A finding reopens only when the source atom hash,
  PlanUnit hash, owner evidence hash, or closure evidence hash changes, or when
  the current closure_status is blocked_requires_user_decision or reopened.
  Plans-to-code audits reuse this registry for repeated Plan Wizard,
  PlanCompile, and WorkNode verification findings when source, canonical
  PlanUnit, owner, and closure evidence have not changed.
  Chat-sourced semantic closure support is recorded as source-lineage process
  support unless a v2 ledger atom or decision explicitly owns it.
  This is the semantic closure registry contract for finding_key, previously_closed reuse, and reopen checks across Plan Wizard, PlanCompile, and WorkNode verification findings.
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
  - Plan Wizard, PlanCompile, and WorkNode audit findings reuse closed registry rows when evidence has not changed.
  - Reopen decisions are based on changed source atom, PlanUnit, owner evidence, or closure evidence hashes, or on blocked/reopened closure status.
  - Closure rows preserve the allowed statuses repaired, false_positive, explicitly_deferred, source_lineage_only, not_for_plan, stale_retired, blocked_requires_user_decision, and reopened.
  - Chat-sourced closure-support PlanUnits are not represented as outputs of a target ledger compile unless their source_lineage names that ledger atom or decision.
validation_surfaces:
  - python3 scripts/pm-audit-closure.py validate
  - python3 scripts/pm-audit-closure.py validate --audit-dir Plans/.audits/<audit_id> --require-closure-matrix
risk_class: repeated_audit_loop
reasoning_tier: high
context_scope: bootstrap_audit_repair
implementation_surfaces:
  - Plans/.audits/_semantic_closure_registry.jsonl
  - Plans/.audits/audit-*/repair_closure_matrix.jsonl
  - Plans/bootstrap/Codex_Prompts.md
  - scripts/pm-audit-closure.py
node_compile_hint:
  mode: audit_registry_process
  create_worknodes: false
source_lineage:
  - pldg-20260617-001-plans-to-code-handoff:atom-0054
  - source_ref:chat:2026-06-17-semantic-closure-registry-support
preserved_exact_tokens:
  - "Plans/.audits/_semantic_closure_registry.jsonl"
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
  - "source-lineage process support"
negative_constraints:
  - Do not re-emit unchanged closed findings as new warnings.
  - Do not hide a finding when source/canonical/owner/closure evidence hashes changed.
  - Do not create WorkNodes, NodeSeeds, executable queues, final node manifests, implementation files, or production build tasks from audit closure state.
  - Do not place chat-sourced closure-support PlanUnits under a target-ledger compile addendum as though they were compiled from that ledger.
owner_hints:
  - Plans/Planning_Ledger_System.md
  - Plans/Plan_Document_System.md
```

ContractRef: ContractName:Plans/Planning_Ledger_System.md, ContractName:Plans/Plan_Document_System.md
