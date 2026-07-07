# Shard 010: Ledger Compile Addendum - pldg-20260703-001-feature-intake

Source: `Plans/Planning_Ledger_System.md`

Source lines: L957-L1030

Source SHA256: `8df9c0e932c9ad97f837db1d87d8546baa5a1cb68ef9007756c082ae9003df07`

---

## Ledger Compile Addendum - pldg-20260703-001-feature-intake

This addendum compiles source-lineage obligations from bootstrap ledger `pldg-20260703-001-feature-intake` into this owner doc. The ledger remains source/planning memory; these PlanUnits are the live canonical evidence. This compile does not create WorkNodes, NodeSeeds, executable queues, implementation files, production build tasks, generated governance artifacts, or a governance seal.

### PLS-016 - P2-UPSTREAM-TRIAGE-CLOSURE-REGISTRY

```yaml
plan_unit_id: PLS-016
unit_type: requirement
status: accepted
owner_doc: Plans/Planning_Ledger_System.md
canonical_text: >-
  P2-UPSTREAM-TRIAGE-CLOSURE-REGISTRY (P2) is compiled as canonical Puppet Master intent for Tracking auto-closed/needs-repro/upstream issues without rediscovering them every pass: Imported external-repo finding extrepo-20260703-0087 / P2-UPSTREAM-TRIAGE-CLOSURE-REGISTRY (P2). The preserved PM gap/delta is: PM has a semantic closure registry for plan audits, but external-upstream watch findings need similar durable status/disposition to avoid repeated rediscovery. The observed external-repo signal remains source-lineage evidence: Pi issue #6280 was auto-closed/untriaged despite containing a real architectural request. | OpenCode issue/PR volume is very high and uses needs-compliance/repro style triage. | PM already discovered semantic closure registry needs internally.
gui_related: false
gui_classification_reason: Backend/orchestration contract; not itself GUI implementation work.
depends_on:
- PDS-003
- PNC-001
unblocks: []
acceptance_criteria:
- ExternalRepoFinding records have finding_key, upstream_url, observed_state, PM disposition, reopen conditions, and freshness window.
- Auto-closed upstream issue is not treated as false merely because upstream closed it; PM can keep it as design evidence with status=upstream_auto_closed_pm_relevant.
- Repeated external audits reuse closed findings unless upstream content, PM coverage, or source family changed.
- No WorkNodes, NodeSeeds, executable queues, implementation files, production build tasks, generated governance artifacts, or governance seal outputs are created by this compile.
validation_surfaces:
- python3 scripts/pm-plan-index.py validate
- python3 scripts/pm-bootstrap-ledger-validate.py Plans/ledgers/v2/pldg-20260703-001-feature-intake
- ExternalRepoFinding records have finding_key, upstream_url, observed_state, PM disposition, reopen conditions, and freshness window.
- Auto-closed upstream issue is not treated as false merely because upstream closed it; PM can keep it as design evidence with status=upstream_auto_closed_pm_relevant.
- Repeated external audits reuse closed findings unless upstream content, PM coverage, or source family changed.
risk_class: p2_transport_websocket_streaming_coverage
reasoning_tier: standard
context_scope: transport_websocket_streaming
implementation_surfaces:
- Plans/Planning_Ledger_System.md
node_compile_hint:
  mode: p2_upstream_triage_closure_registry
  create_worknodes: false
  create_nodeseeds: false
source_lineage:
- pldg-20260703-001-feature-intake:atom-0091
- Plans/ledgers/v2/pldg-20260703-001-feature-intake/records/design_atoms.jsonl:atom-0091
- Plans/ledgers/v2/pldg-20260703-001-feature-intake/source_shards/external_repo_import_20260703/02_LEDGER_READY_ATOMS.jsonl:extrepo-20260703-0087/P2-UPSTREAM-TRIAGE-CLOSURE-REGISTRY@line=87
- Plans/ledgers/v2/pldg-20260703-001-feature-intake/source_shards/external_repo_import_20260703/02_LEDGER_READY_ATOMS.jsonl:extrepo-20260703-0087/P2-UPSTREAM-TRIAGE-CLOSURE-REGISTRY
- Plans/ledgers/v2/pldg-20260703-001-feature-intake/source_shards/external_repo_import_20260703/01_FULL_SOURCE_PACKET.md
- Plans/ledgers/v2/pldg-20260703-001-feature-intake/source_shards/external_repo_import_20260703/04_EVIDENCE_REGISTRY.json
- Plans/ledgers/v2/pldg-20260703-001-feature-intake/source_shards/external_repo_import_20260703/raw_source_artifacts/pm_final_external_repo_closure_backlog_2026-07-03.jsonl:14
source_atom_ids:
- atom-0091
external_atom_id: extrepo-20260703-0087
source_row_id: P2-UPSTREAM-TRIAGE-CLOSURE-REGISTRY
priority: P2
finding_family: Tracking auto-closed/needs-repro/upstream issues without rediscovering them every pass
target_docs:
- Planning_Ledger_System.md
- GitHub_Integration.md
- Research_Mode / audit prompts
- Contracts_V0.md
owner_hints:
- Planning_Ledger_System.md
- GitHub_Integration.md
- Research_Mode / audit prompts
- Contracts_V0.md
preserved_exact_tokens:
- extrepo-20260703-0087
- P2-UPSTREAM-TRIAGE-CLOSURE-REGISTRY
- P2
- Tracking auto-closed/needs-repro/upstream issues without rediscovering them every pass
negative_constraints: []
observed_signal: 'Pi issue #6280 was auto-closed/untriaged despite containing a real architectural request. | OpenCode issue/PR volume is very high and uses needs-compliance/repro style triage. | PM already discovered semantic closure registry needs internally.'
pm_gap_or_delta: PM has a semantic closure registry for plan audits, but external-upstream watch findings need similar durable status/disposition to avoid repeated rediscovery.
relationship_to_prior_reports: Meta-process addition rather than product runtime P0.
compile_disposition: create_new_planunit
```
