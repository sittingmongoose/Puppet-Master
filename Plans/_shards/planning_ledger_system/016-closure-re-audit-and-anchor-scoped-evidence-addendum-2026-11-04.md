# Shard 016: Closure Re-Audit And Anchor-Scoped Evidence Addendum (2026-11-04)

Source: `Plans/Planning_Ledger_System.md`

Source lines: L1541-L1615

Source SHA256: `010912b75edb54c36ec87c28f4097dc2170f2000ad41006ad0c9fefad1572fde`

---

## Closure Re-Audit And Anchor-Scoped Evidence Addendum (2026-11-04)

Jared's answer of 2026-11-04 to the governance-residuals question on audit closure ("B then add C") makes closure re-audits and anchor-scoped evidence hashes owner canon. PLS-012 keeps the registry contract; this unit adds how a closure whose evidence changed is re-audited and recorded without rewriting history.

### PLS-025 - Closure Re-Audit Records And Anchor-Scoped Evidence Hashes

```yaml
plan_unit_id: PLS-025
unit_type: requirement
status: accepted
owner_doc: Plans/Planning_Ledger_System.md
canonical_text: The global semantic closure registry stays append-only. No row is rewritten, restamped or deleted,
  and no refreshed evidence hash is written without the re-audit that justifies it. A closure whose evidence changed
  is re-audited against the current Plans text and recorded by appending one row that keeps its finding_key, names
  the row it supersedes by closure_id, line and the SHA-256 of that row's exact JSONL line, and binds a per-row
  re-audit record by path and canonical SHA-256. The record carries the claim, the dependency anchors, verbatim
  evidence quotes and the verdicts of the recheck worker and two blind reviewers, and all three verdicts agree.
  supported keeps the closure_status; resolved_differently records the closed status that now fits;
  superseded_by_later_closure defers to a later closure of the same finding; not_supported appends a reopened row
  that stays open until a later re-audit closes it. Re-audit rows use hash_scope anchor.v1, whose owner and closure
  evidence hashes cover only the PlanUnit, Markdown section, JSON pointer, JSONL row or Python definition the closure
  depends on, so an edit elsewhere in the same file does not stale it. Derived Plans/.plan_index, Plans/_shards and
  Plans/.evidence files and line numbers are never anchors; a whole file is hashed only for immutable audit artifacts
  under Plans/.audits. Rows without hash_scope keep whole-file hashes for every ref. A stale row stops failing
  validation only when a valid re-audit row supersedes it.
gui_related: false
gui_classification_reason: Governs audit-closure records and validator semantics; no GUI surface.
depends_on:
- PLS-012
- PDS-014
unblocks: []
acceptance_criteria:
- python3 scripts/pm-audit-closure.py self-test passes, covering edited, reused, duplicated and finding-key-mismatched
  supersession, missing or disagreeing reviewers, quotes outside the anchored text, derived and whole-file anchors,
  edits inside and outside an anchor, reopen and re-close, and an idempotent reaudit-append that holds back records
  whose anchors moved since the recheck.
- Rows without hash_scope validate exactly as before.
- validate-audit-closure counts a reopened row as open until a valid re-audit row supersedes it.
validation_surfaces:
- python3 scripts/pm-audit-closure.py self-test
- python3 scripts/pm-audit-closure.py validate
- python3 scripts/pm-plans-verify.py validate-audit-closure
risk_class: governance_integrity
reasoning_tier: high
context_scope: semantic_audit_closure
implementation_surfaces:
- scripts/pm-audit-closure.py
- scripts/pm-plans-verify.py
- Plans/.audits/_semantic_closure_registry.jsonl
node_compile_hint:
  mode: contract_specification
  create_worknodes: false
  create_nodeseeds: false
source_lineage:
- 'Jared, 2026-11-04, answering question 3 of share/puppet-master/2026-11-04-governance-residuals/REPORT.md: "B then
  add C"'
- Plans/Decision_Log.md#DL-039
preserved_exact_tokens:
- hash_scope
- anchor.v1
- supersedes
- reaudit
- reaudit-append
- resolved_differently
- superseded_by_later_closure
- not_supported
negative_constraints:
- No restamping or rewriting of closure-registry rows or hashes (DL-039).
- No supersession without a hash-bound re-audit record whose three verdicts agree.
- No latest-row-per-finding shortcut; a reopened row stays open until a re-audit row validly supersedes it.
owner_hints:
- Plans/Planning_Ledger_System.md
```

ContractRef: ContractName:Plans/Planning_Ledger_System.md#PLS-025, ContractName:Plans/Planning_Ledger_System.md#PLS-012, ContractName:Plans/Plan_Document_System.md#PDS-014, ContractName:Plans/Decision_Log.md#DL-039
