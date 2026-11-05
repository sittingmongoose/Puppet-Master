# Shard 017: Legacy Audit Format Rule And Supplemental Closure Addendum (2026-11-05)

Source: `Plans/Planning_Ledger_System.md`

Source lines: L1617-L1707

Source SHA256: `8e4a5c546e27ae92b08a9525f310e9ee0b29a7c5b44d022316b1a4b074342cbf`

---

## Legacy Audit Format Rule And Supplemental Closure Addendum (2026-11-05)

Jared's answer of 2026-11-05 to stream C's question 7 (DL-334) splits the per-audit completeness failures of the June audits in two: format and schema-evolution errors get a bounded legacy rule, and a real coverage gap gets an append-only supplemental closure pass. This addendum loosens the per-audit check for those June directories only, and says exactly where the loosening stops.

### PLS-026 - Legacy Audit Format Rule And Supplemental Closure Passes

```yaml
plan_unit_id: PLS-026
unit_type: requirement
status: accepted
owner_doc: Plans/Planning_Ledger_System.md
canonical_text: The per-audit closure check of scripts/pm-audit-closure.py applies the legacy format rule
  pm.audit_closure.legacy_format.v1 to the 55 audit directories written in June 2026 that the validator names in its
  closed LEGACY_AUDIT_DIRS list, and to no other directory, and only while each is still its historical self - the
  real directory Plans/.audits/<name> with no symlink in its path, whose files match the frozen inventory
  Plans/.audits/_legacy_format_inventory.json (pinned by SHA-256 in the validator; only repair_closure_matrix.jsonl
  may grow, by appended lines, and only its frozen rows count as historical). Appended matrix rows, files added after
  the freeze (a new report, source artifact or matrix), new content under a listed name and edited historical files
  get the full rules. For those directories only, it reports these format and
  schema-evolution errors as one warning per directory instead of as errors - missing or empty audit_id, ledger_id,
  baseline_ref, subject_ref or observation_ref; an absent audit_scope_manifest.jsonl or repair_impact_matrix.jsonl,
  and the scope manifest's family coverage while that file is absent, but only while every report and source
  artifact the check reads is frozen; audit-finding and closure-matrix row fields
  that came with the newer schema (finding_family, the identity lists, repair_required, finding_level, finding_key)
  when the row lacks them; finding keys built by the older key algorithm (for a closure-matrix row, only when its
  identity fields give the same deterministic key as the identity fields of the registry closure it links to); an
  audit_report.json without repair_required_count or without a status; and historical closure rows over source rows
  that the compatibility inference, not an explicit repair_required or finding_level field on any row with that key,
  treats as non-actionable. The rule never excuses a missing
  closure row or any other substantive gap. An uncovered actionable source row, a missing closure matrix, a closure
  row without its source row, status, evidence, reason or registry closure, a registry link that does not hold,
  missing evidence, a stated status that contradicts the computed one, an artifact that is present but incomplete,
  and every message the rule does not name stay errors. Audits written from July 2026 on, and any audit directory
  added later, are checked under the full rules; no directory joins the list after 2026-11-05. An uncovered
  actionable row is closed only by an append-only supplemental closure pass, which appends one closure row that meets
  the full current matrix-row schema, names a registry closure whose finding covers that source row or appends a new
  registry row, cites anchored evidence at a named commit, and records the pass, its decision and its blind reviews
  in a supplemental_closure_pass record in the audit directory. No existing matrix or registry row is edited.
gui_related: false
gui_classification_reason: Governs audit-closure validation of historical audit directories; no GUI surface.
depends_on:
- PDS-014
- PLS-012
- PLS-025
unblocks: []
acceptance_criteria:
- python3 scripts/pm-audit-closure.py self-test passes, covering the closed list and its pre-July dates, symlinked
  leaves and parents, external and unlisted directories, edited historical files and matrix prefixes, a changed
  inventory pin, appended matrix rows, a historical row whose identity disagrees with its registry closure, duplicate
  validator-result names with a stated classification, every demoted and every kept kind, the conditions on report status, scope
  manifest and over-coverage, explicit versus inferred over-coverage, the single warning, and that a listed and a
  July directory with the same files produce the same messages, only classified differently.
- On the repository, every audit directory outside the list reports exactly the errors and warnings it reported
  before the rule, and in each listed directory the kept and the demoted errors together equal the errors before.
- audit-20260619-002-prd-planning-wizard-head-semantic-fidelity validates with --require-closure-matrix and
  --require-effective-status after its supplemental closure pass.
validation_surfaces:
- python3 scripts/pm-audit-closure.py self-test
- python3 scripts/pm-audit-closure.py validate --audit-dir Plans/.audits/<audit_id> --require-closure-matrix
- python3 -m unittest tests/test_pm_audit_closure.py
risk_class: governance_integrity
reasoning_tier: high
context_scope: semantic_audit_closure
implementation_surfaces:
- scripts/pm-audit-closure.py
- Plans/.audits/audit-20260619-002-prd-planning-wizard-head-semantic-fidelity/repair_closure_matrix.jsonl
- Plans/.audits/audit-20260619-002-prd-planning-wizard-head-semantic-fidelity/supplemental_closure_pass-20261105.json
- Plans/.audits/_legacy_format_inventory.json
node_compile_hint:
  mode: contract_specification
  create_worknodes: false
  create_nodeseeds: false
source_lineage:
- 'Jared, 2026-11-05, "approve all" (T3 thread 1338d738-7bb4-47b2-852e-38a876cb8521, 2026-11-05T02:48:03Z), answering
  stream C question 7 in share/puppet-master/2026-11-04-program/streams/C-REPORT.md'
- Plans/Decision_Log.md#DL-334
preserved_exact_tokens:
- pm.audit_closure.legacy_format.v1
- LEGACY_AUDIT_DIRS
- _legacy_format_inventory.json
- supplemental_closure_pass
- never excuses a missing closure row or any other substantive gap
negative_constraints:
- The legacy format rule never excuses a missing closure row or any other substantive gap.
- No audit directory joins LEGACY_AUDIT_DIRS after 2026-11-05.
- A supplemental closure pass never edits or removes an existing matrix or registry row.
owner_hints:
- Plans/Planning_Ledger_System.md
```

ContractRef: ContractName:Plans/Planning_Ledger_System.md#PLS-026, ContractName:Plans/Plan_Document_System.md#PDS-014, ContractName:Plans/Planning_Ledger_System.md#PLS-025, ContractName:Plans/Decision_Log.md#DL-334
