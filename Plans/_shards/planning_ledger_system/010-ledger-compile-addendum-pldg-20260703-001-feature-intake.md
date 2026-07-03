# Shard 010: Ledger Compile Addendum - pldg-20260703-001-feature-intake

Source: `Plans/Planning_Ledger_System.md`

Source lines: L942-L1150

Source SHA256: `cb580376db1e90d4841e57353b845f6a4f4850cff858f1cee682a15178cc9808`

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
- Plans/ledgers/v2/pldg-20260703-001-feature-intake/source_shards/external_repo_import_20260703/02_LEDGER_READY_ATOMS.jsonl:extrepo-20260703-0087/P2-UPSTREAM-TRIAGE-CLOSURE-REGISTRY@line=14
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

### PLS-017 - P2-AI-TRIAGE-CLOSURE-CONFIDENCE

```yaml
plan_unit_id: PLS-017
unit_type: requirement
status: accepted
owner_doc: Plans/Planning_Ledger_System.md
canonical_text: >-
  P2-AI-TRIAGE-CLOSURE-CONFIDENCE (P2) is compiled as canonical Puppet Master intent for AI triage closure confidence and reopen policy: Imported external-repo finding extrepo-20260703-0099 / P2-AI-TRIAGE-CLOSURE-CONFIDENCE (P2). The preserved PM gap/delta is: Semantic closure registry should extend to external issue triage with confidence, actor, evidence quality, and reopen triggers. The observed external-repo signal remains source-lineage evidence: Auto-closed/untriaged issue surfaces can bury real UI/input bugs while recurring warnings create noise.
gui_related: true
gui_classification_reason: User-visible GUI, built-in terminal, accessibility, visual, multimodal, or desktop surface is directly implicated.
depends_on:
- PDS-003
- PNC-001
unblocks: []
acceptance_criteria:
- Closed issue with new repro reopens by key
- Bot closure reason is user-visible
- Previously closed unchanged finding is suppressed with evidence
- No WorkNodes, NodeSeeds, executable queues, implementation files, production build tasks, generated governance artifacts, or governance seal outputs are created by this compile.
validation_surfaces:
- python3 scripts/pm-plan-index.py validate
- python3 scripts/pm-bootstrap-ledger-validate.py Plans/ledgers/v2/pldg-20260703-001-feature-intake
- Closed issue with new repro reopens by key
- Bot closure reason is user-visible
- Previously closed unchanged finding is suppressed with evidence
risk_class: p2_external_handoff_and_triage_coverage
reasoning_tier: standard
context_scope: external_handoff_and_triage
implementation_surfaces:
- Plans/Planning_Ledger_System.md
node_compile_hint:
  mode: p2_ai_triage_closure_confidence
  create_worknodes: false
  create_nodeseeds: false
source_lineage:
- pldg-20260703-001-feature-intake:atom-0103
- Plans/ledgers/v2/pldg-20260703-001-feature-intake/records/design_atoms.jsonl:atom-0103
- Plans/ledgers/v2/pldg-20260703-001-feature-intake/source_shards/external_repo_import_20260703/02_LEDGER_READY_ATOMS.jsonl:extrepo-20260703-0099/P2-AI-TRIAGE-CLOSURE-CONFIDENCE@line=12
- Plans/ledgers/v2/pldg-20260703-001-feature-intake/source_shards/external_repo_import_20260703/02_LEDGER_READY_ATOMS.jsonl:extrepo-20260703-0099/P2-AI-TRIAGE-CLOSURE-CONFIDENCE
- Plans/ledgers/v2/pldg-20260703-001-feature-intake/source_shards/external_repo_import_20260703/01_FULL_SOURCE_PACKET.md
- Plans/ledgers/v2/pldg-20260703-001-feature-intake/source_shards/external_repo_import_20260703/04_EVIDENCE_REGISTRY.json
- Plans/ledgers/v2/pldg-20260703-001-feature-intake/source_shards/external_repo_import_20260703/raw_source_artifacts/pm_one_more_external_repo_backlog_2026-07-03.jsonl:12
source_atom_ids:
- atom-0103
external_atom_id: extrepo-20260703-0099
source_row_id: P2-AI-TRIAGE-CLOSURE-CONFIDENCE
priority: P2
finding_family: AI triage closure confidence and reopen policy
source_repos:
- Pi
- Ghostty
- Cline
preserved_exact_tokens:
- extrepo-20260703-0099
- P2-AI-TRIAGE-CLOSURE-CONFIDENCE
- P2
- AI triage closure confidence and reopen policy
- Pi
- Ghostty
- Cline
negative_constraints: []
observed_signal: Auto-closed/untriaged issue surfaces can bury real UI/input bugs while recurring warnings create noise.
pm_gap_or_delta: Semantic closure registry should extend to external issue triage with confidence, actor, evidence quality, and reopen triggers.
compile_disposition: create_new_planunit
```

### PLS-018 - external_issue_closure

```yaml
plan_unit_id: PLS-018
unit_type: requirement
status: accepted
owner_doc: Plans/Planning_Ledger_System.md
canonical_text: >-
  external_issue_closure (P1) is compiled as canonical Puppet Master intent for external_issue_closure: Add ExternalIssueClosureRegistry The preserved PM gap/delta is: External issue/PR closure governance not clearly extended The observed external-repo signal remains source-lineage evidence: OpenCode needs:compliance auto-close user frustration
gui_related: false
gui_classification_reason: Backend/orchestration contract; not itself GUI implementation work.
depends_on:
- PDS-003
- PNC-001
unblocks: []
acceptance_criteria:
- No auto-close without evidence/triage schema
- reopen conditions
- No WorkNodes, NodeSeeds, executable queues, implementation files, production build tasks, generated governance artifacts, or governance seal outputs are created by this compile.
validation_surfaces:
- python3 scripts/pm-plan-index.py validate
- python3 scripts/pm-bootstrap-ledger-validate.py Plans/ledgers/v2/pldg-20260703-001-feature-intake
- No auto-close without evidence/triage schema
- reopen conditions
risk_class: p1_external_handoff_and_triage_hardening
reasoning_tier: standard
context_scope: external_handoff_and_triage
implementation_surfaces:
- Plans/Planning_Ledger_System.md
node_compile_hint:
  mode: external_issue_closure
  create_worknodes: false
  create_nodeseeds: false
source_lineage:
- pldg-20260703-001-feature-intake:atom-0116
- Plans/ledgers/v2/pldg-20260703-001-feature-intake/records/design_atoms.jsonl:atom-0116
- Plans/ledgers/v2/pldg-20260703-001-feature-intake/source_shards/external_repo_import_20260703/02_LEDGER_READY_ATOMS.jsonl:extrepo-20260703-0112/external_issue_closure@line=14
- Plans/ledgers/v2/pldg-20260703-001-feature-intake/source_shards/external_repo_import_20260703/02_LEDGER_READY_ATOMS.jsonl:extrepo-20260703-0112/external_issue_closure
- Plans/ledgers/v2/pldg-20260703-001-feature-intake/source_shards/external_repo_import_20260703/01_FULL_SOURCE_PACKET.md
- Plans/ledgers/v2/pldg-20260703-001-feature-intake/source_shards/external_repo_import_20260703/04_EVIDENCE_REGISTRY.json
- Plans/ledgers/v2/pldg-20260703-001-feature-intake/source_shards/external_repo_import_20260703/raw_source_artifacts/opencode_pm_plan_change_matrix.csv:14
- Plans/ledgers/v2/pldg-20260703-001-feature-intake/source_shards/external_repo_import_20260703/01_FULL_SOURCE_PACKET.md:3448-3472
source_atom_ids:
- atom-0116
external_atom_id: extrepo-20260703-0112
source_row_id: external_issue_closure
priority: P1
finding_family: external_issue_closure
target_docs:
- Plans/Planning_Ledger_System.md
- Plans/Prompt_Packet_Update_Process_Defect_Repair equivalent
- audit closure docs
owner_hints:
- Plans/Planning_Ledger_System.md
- Plans/Prompt_Packet_Update_Process_Defect_Repair equivalent
- audit closure docs
preserved_exact_tokens:
- extrepo-20260703-0112
- external_issue_closure
- P1
negative_constraints: []
observed_signal: OpenCode needs:compliance auto-close user frustration
pm_current_coverage: Semantic closure registry exists for audits
pm_gap_or_delta: External issue/PR closure governance not clearly extended
proposal_or_recommendation: Add ExternalIssueClosureRegistry
compile_disposition: create_new_planunit
```
