# Shard 012: Ledger Compile Addendum - pldg-20260703-001-feature-intake

Source: `Plans/GitHub_Integration.md`

Source lines: L1991-L2063

Source SHA256: `c44f594d267869446f6df0181c183fe13f176c531d47bdb647a83d9c8ec4312f`

---

## Ledger Compile Addendum - pldg-20260703-001-feature-intake

This addendum compiles source-lineage obligations from bootstrap ledger `pldg-20260703-001-feature-intake` into this owner doc. The ledger remains source/planning memory; these PlanUnits are the live canonical evidence. This compile does not create WorkNodes, NodeSeeds, executable queues, implementation files, production build tasks, generated governance artifacts, or a governance seal.

### GI-034 - github_update_workflow

```yaml
plan_unit_id: GI-034
unit_type: requirement
status: accepted
owner_doc: Plans/GitHub_Integration.md
canonical_text: >-
  github_update_workflow (P1) is compiled as canonical Puppet Master intent for github_update_workflow: Add GitHubUpdateCurrentness and ReleaseTagVerifier The preserved PM gap/delta is: Need rate-limit-safe updater and release/action tag currentness guard The observed external-repo signal remains source-lineage evidence: OpenCode upgrade GitHub API 403 and stale github@latest action issues
gui_related: true
gui_classification_reason: Target docs include GUI/UI command or user-visible surfaces; mixed work is conservatively GUI-related.
depends_on:
- PDS-003
- PNC-001
unblocks: []
acceptance_criteria:
- Unauthenticated/authenticated API fallback tests
- stale tag detection
- No WorkNodes, NodeSeeds, executable queues, implementation files, production build tasks, generated governance artifacts, or governance seal outputs are created by this compile.
validation_surfaces:
- python3 scripts/pm-plan-index.py validate
- python3 scripts/pm-bootstrap-ledger-validate.py Plans/ledgers/v2/pldg-20260703-001-feature-intake
- Unauthenticated/authenticated API fallback tests
- stale tag detection
risk_class: p1_security_release_supply_chain_hardening
reasoning_tier: standard
context_scope: security_release_supply_chain
implementation_surfaces:
- Plans/GitHub_Integration.md
- Plans/BinaryLocator_Spec.md
- Plans/FinalGUISpec.md
node_compile_hint:
  mode: github_update_workflow
  create_worknodes: false
  create_nodeseeds: false
source_lineage:
- pldg-20260703-001-feature-intake:atom-0115
- Plans/ledgers/v2/pldg-20260703-001-feature-intake/records/design_atoms.jsonl:atom-0115
- Plans/ledgers/v2/pldg-20260703-001-feature-intake/source_shards/external_repo_import_20260703/02_LEDGER_READY_ATOMS.jsonl:extrepo-20260703-0111/github_update_workflow@line=13
- Plans/ledgers/v2/pldg-20260703-001-feature-intake/source_shards/external_repo_import_20260703/02_LEDGER_READY_ATOMS.jsonl:extrepo-20260703-0111/github_update_workflow
- Plans/ledgers/v2/pldg-20260703-001-feature-intake/source_shards/external_repo_import_20260703/01_FULL_SOURCE_PACKET.md
- Plans/ledgers/v2/pldg-20260703-001-feature-intake/source_shards/external_repo_import_20260703/04_EVIDENCE_REGISTRY.json
- Plans/ledgers/v2/pldg-20260703-001-feature-intake/source_shards/external_repo_import_20260703/raw_source_artifacts/opencode_pm_plan_change_matrix.csv:13
- Plans/ledgers/v2/pldg-20260703-001-feature-intake/source_shards/external_repo_import_20260703/01_FULL_SOURCE_PACKET.md:3448-3472
source_atom_ids:
- atom-0115
external_atom_id: extrepo-20260703-0111
source_row_id: github_update_workflow
priority: P1
finding_family: github_update_workflow
target_docs:
- Plans/GitHub_Integration.md
- Plans/BinaryLocator_Spec.md
- Plans/FinalGUISpec.md
owner_hints:
- Plans/GitHub_Integration.md
- Plans/BinaryLocator_Spec.md
- Plans/FinalGUISpec.md
preserved_exact_tokens:
- extrepo-20260703-0111
- github_update_workflow
- P1
negative_constraints: []
observed_signal: OpenCode upgrade GitHub API 403 and stale github@latest action issues
pm_current_coverage: Broad GitHub/Auth/Setup surfaces exist
pm_gap_or_delta: Need rate-limit-safe updater and release/action tag currentness guard
proposal_or_recommendation: Add GitHubUpdateCurrentness and ReleaseTagVerifier
compile_disposition: create_new_planunit
```
