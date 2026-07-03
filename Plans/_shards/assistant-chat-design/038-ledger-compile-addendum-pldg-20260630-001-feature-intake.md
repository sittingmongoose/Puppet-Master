# Shard 038: Ledger Compile Addendum - pldg-20260630-001-feature-intake

Source: `Plans/assistant-chat-design.md`

Source lines: L2671-L2739

Source SHA256: `3c8761c64b24d6e82739aa89979ebf1977095f52bcf621cdc7c91a6e466fc6fa`

---

## Ledger Compile Addendum - pldg-20260630-001-feature-intake

This addendum compiles Assistant Chat containerized-host projection obligations from bootstrap ledger `pldg-20260630-001-feature-intake`. It does not create WorkNodes, NodeSeeds, executable queues, implementation files, runtime dispatch, production build tasks, generated governance artifacts, or a governance seal.

### ACD-430 - Assistant Chat Host Readiness Cards And Docker/Hosts Pivots

```yaml
plan_unit_id: ACD-430
unit_type: requirement
status: accepted
owner_doc: Plans/assistant-chat-design.md
canonical_text: >-
  Assistant Chat surfaces containerized-host readiness, blocked/degraded/unavailable states, access URL confidence, and
  Docker/Hosts pivots as shared PM capability context. Chat may show host readiness cards, Open App/Open Container pivots,
  recent host/test receipts, and blocked-action summaries linked to Docker/Hosts, Runtime Artifacts, Executor attempts,
  and Automated Testing receipts. Chat does not own Docker, Kubernetes, SSH, file, terminal, or cleanup mutation
  semantics; any action request resolves through UI_Command_Catalog, HostCapabilityCommand, Executor/Tools/ATS,
  Permissions, FileSafe, and receipt paths. Stale or missing projections degrade the chat card rather than authorizing
  sensitive actions.
gui_related: true
gui_classification_reason: This PlanUnit defines visible Assistant Chat cards, pivots, and user-facing host readiness presentation.
depends_on: [F3-410, UCC-105, RAP-042, CV-303]
unblocks: []
acceptance_criteria:
  - Assistant Chat can display host readiness, blocked/unavailable/degraded states, access confidence, stale state, and next-action summaries.
  - Chat cards deep-link to Docker/Hosts, Runtime Artifacts, Orchestrator/Executor run details, and test receipts without becoming mutation authorities.
  - Open App and Open Container pivots use UI_Command_Catalog and port_access_record evidence rather than guessed localhost URLs.
  - Chat does not hide disabled, stale, unsupported, host-untrusted, FileSafe-blocked, or permission-required states behind optimistic UI.
validation_surfaces:
  - python3 scripts/pm-plan-index.py validate
  - future Assistant Chat host-readiness card fixture
risk_class: chat_host_projection_authority_drift
reasoning_tier: standard
context_scope: assistant_chat_containerized_host_projection
implementation_surfaces:
  - Plans/assistant-chat-design.md
  - future Assistant Chat host readiness and action cards
node_compile_hint:
  mode: assistant_chat_host_readiness_projection
  create_worknodes: false
  create_nodeseeds: false
source_lineage:
  - Plans/ledgers/v2/pldg-20260630-001-feature-intake/records/design_atoms.jsonl:atom-0040
  - Plans/ledgers/v2/pldg-20260630-001-feature-intake/records/design_atoms.jsonl:atom-0041
  - Plans/ledgers/v2/pldg-20260630-001-feature-intake/records/design_atoms.jsonl:atom-0073
  - Plans/ledgers/v2/pldg-20260630-001-feature-intake/records/design_atoms.jsonl:atom-0075
  - Plans/ledgers/v2/pldg-20260630-001-feature-intake/records/design_atoms.jsonl:atom-0079
  - Plans/ledgers/v2/pldg-20260630-001-feature-intake/records/design_atoms.jsonl:atom-0080
  - Plans/ledgers/v2/pldg-20260630-001-feature-intake/records/design_atoms.jsonl:atom-0081
  - Plans/ledgers/v2/pldg-20260630-001-feature-intake/source_shards/implementation_readiness_hardening_20260701.json#docker_hosts_gui_ia
  - Plans/ledgers/v2/pldg-20260630-001-feature-intake/source_shards/implementation_readiness_hardening_20260701.json#control_plane_contract
source_atom_ids: [atom-0040, atom-0041, atom-0073, atom-0075, atom-0079, atom-0080, atom-0081]
preserved_exact_tokens:
  - "chat assistant"
  - "all the different areas of PM"
  - "Docker/Hosts"
  - "Open App"
  - "Open Container"
  - "blocked/unavailable/degraded"
negative_constraints:
  - Do not scatter mutation ownership into Assistant Chat.
  - Do not hide blocked, unavailable, disabled, stale, or degraded states behind optimistic UI.
  - Do not guess localhost URLs when port_access_record evidence is missing or low-confidence.
owner_hints:
  - Plans/assistant-chat-design.md
  - Plans/FinalGUISpec.md
  - Plans/UI_Command_Catalog.md
  - Plans/Runtime_Artifacts_Panel.md
```
