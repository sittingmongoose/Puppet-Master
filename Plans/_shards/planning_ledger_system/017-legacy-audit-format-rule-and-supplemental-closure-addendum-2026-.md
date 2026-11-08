# Shard 017: Legacy Audit Format Rule And Supplemental Closure Addendum (2026-11-05)

Source: `Plans/Planning_Ledger_System.md`

Source lines: L1617-L1781

Source SHA256: `147eb1bc79ef183592956804f65a2a446ae7fbb76f25171c1866afd442a99afc`

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
  the freeze (a new report, source artifact or matrix), new content under a listed name, edited historical files and
  any symbolically linked input get the full rules, and a run that lists the closure matrix, the audit report, the
  effective status, the scope manifest or the impact matrix as a source artifact gets the full rules for the whole
  directory, since each of those files is checked in its own role. The rule decides from what each check recorded about the error
  (the file it read, the row, the kind of error and the fields involved), never from the message text, so no file
  name or message content can make one error pass for another. For those directories only, it reports these format and
  schema-evolution errors as one warning per directory instead of as errors - missing or empty audit_id, ledger_id,
  baseline_ref, subject_ref or observation_ref; an absent audit_scope_manifest.jsonl or repair_impact_matrix.jsonl,
  and the scope manifest's family coverage while that file is absent, but only while every report and source
  artifact the check reads is frozen; audit-finding and closure-matrix row fields
  that came with the newer schema (finding_family, the identity lists, repair_required, finding_level, finding_key)
  when the row lacks them; finding keys built by the older key algorithm (for a closure-matrix row, only when its
  identity fields give the same deterministic key as the identity fields of the registry closure it links to); an
  audit_report.json without repair_required_count or without a status; and historical closure rows over source rows
  that the compatibility inference, not an explicit repair_required or finding_level field on any row with that key,
  treats as non-actionable. In those directories, when the run requests none of those companion files as a source
  and reads no input through a symlink, and only for a frozen file other than the closure matrix, the compatibility
  inference also reads four older words as passed (DL-340) - the claim statuses
  pass, supported_by_source_atoms and previously_closed, and a validator result whose status is expected_fail when its
  command is one of the five governance commands the June audits expected to fail on stale generated files
  (pm-plans-verify.py run-gates, verify-spec-lock, validate-evidence and validate-plan-graph, and pm-shard-plans.py
  --check). Every other field of such a row (an issue list, an overclaim list, a failing status) keeps its meaning,
  and every other expected_fail result stays actionable. The rule never excuses a missing
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
  inventory pin, appended matrix rows, a historical row whose identity disagrees with its registry closure, a
  companion file listed as a source artifact, duplicate
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

### PLS-027 - Append-Only Audit Correction Records

```yaml
plan_unit_id: PLS-027
unit_type: requirement
status: accepted
owner_doc: Plans/Planning_Ledger_System.md
canonical_text: >-
  An audit may add one audit_correction-<YYYYMMDD>.json with schema_id
  pm.audit_closure.audit_correction.v1 under DL-470. The receipt names its audit, date and Decision Log
  reference, binds audit_report.json, repair_closure_matrix.jsonl and every standard source artifact by SHA-256,
  and gives a reason for each correction. It may only correct the historical status to BLOCKED when the original
  computed repair_required_count is positive, or identify matrix-covered source rows that never needed repair.
  historical_status is null or contains from, to and reason; non_actionable_rows contains only source_artifact,
  source_row and reason. v1 row addresses are physical JSONL line numbers or named validator_results.json
  results and invalid_invocations. The validator requires the complete standard source selection, independently
  computes actionability, rejects actionable, nonexistent, uncovered or duplicate listed rows, and applies nothing
  on any invalid receipt. Unknown schemas or fields, mismatched or missing hashes, symlinked bound inputs or receipts, invalid dates,
  other corrections and multiple correction files fail closed. Only the listed non-actionable over-coverage is
  excused; missing coverage and every matrix, evidence, registry and legacy-format check keep their force.
  Validation shows both the historical and corrected status. Corrected history participates in the effective
  status projection while its recorded value remains visible. The receipt rewrites no historical file, source
  classification, closure status, registry row or evidence hash and grants no semantic closure. Real repairs and
  terminal projections are checked separately; registry supersession still requires PLS-025.
gui_related: false
gui_classification_reason: Audit correction receipts and validation have no GUI surface.
depends_on: [PLS-012, PLS-025, PLS-026]
unblocks: []
acceptance_criteria:
- self-test covers valid status and row corrections, unchanged historical bytes, each fail-closed rule, missing coverage,
  unlisted over-coverage, partial source selection and historical versus effective status.
- audit-20260619-004 preserves its June files and all 21 matrix rows, corrects its original status to BLOCKED,
  identifies exactly 16 never-actionable rows and still requires the five actionable closures.
validation_surfaces:
- python3 scripts/pm-audit-closure.py self-test
- python3 scripts/pm-audit-closure.py validate
risk_class: governance_integrity
reasoning_tier: high
context_scope: semantic_audit_closure
implementation_surfaces:
- scripts/pm-audit-closure.py
- Plans/.audits/audit-20260619-004-prd-planning-wizard-post-repair-head-fidelity/audit_correction-20261108.json
node_compile_hint:
  mode: contract_specification
  create_worknodes: false
  create_nodeseeds: false
source_lineage:
- Plans/Decision_Log.md#DL-470
preserved_exact_tokens:
- pm.audit_closure.audit_correction.v1
- audit_correction-<YYYYMMDD>.json
- BLOCKED
- non_actionable_rows
negative_constraints:
- No correction excuses missing coverage or supersedes a registry row.
- No historical file or evidence hash is rewritten by a correction.
owner_hints:
- Plans/Planning_Ledger_System.md
```

ContractRef: ContractName:Plans/Planning_Ledger_System.md#PLS-027, ContractName:Plans/Decision_Log.md#DL-470
