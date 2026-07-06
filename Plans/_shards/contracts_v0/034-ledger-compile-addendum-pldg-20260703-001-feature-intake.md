# Shard 034: Ledger Compile Addendum - pldg-20260703-001-feature-intake

Source: `Plans/Contracts_V0.md`

Source lines: L19111-L19318

Source SHA256: `95764e679d8f5e19964eb92f4eada69292b875f1f9e8645507710e2bbb9746b3`

---

## Ledger Compile Addendum - pldg-20260703-001-feature-intake

This addendum compiles source-lineage obligations from bootstrap ledger `pldg-20260703-001-feature-intake` into this owner doc. The ledger remains source/planning memory; these PlanUnits are the live canonical evidence. This compile does not create WorkNodes, NodeSeeds, executable queues, implementation files, production build tasks, generated governance artifacts, or a governance seal.

### CV-306 - P0-WEBSOCKET-SECURITY-BOUNDARIES

```yaml
plan_unit_id: CV-306
unit_type: requirement
status: accepted
owner_doc: Plans/Contracts_V0.md
canonical_text: >-
  P0-WEBSOCKET-SECURITY-BOUNDARIES (P0) is compiled as canonical Puppet Master intent for Add WebSocket origin/auth/CSRF/runtime-id security gates: Remote/tunnel WS requires configured auth; wrong Origin/CSRF/runtime id is rejected before initialize; security receipts are visible and redacted.
gui_related: true
gui_classification_reason: User-visible GUI, built-in terminal, accessibility, visual, multimodal, or desktop surface is directly implicated.
depends_on:
- PDS-003
- PNC-001
unblocks: []
acceptance_criteria:
- Remote/tunnel WS requires configured auth
- wrong Origin/CSRF/runtime id is rejected before initialize
- security receipts are visible and redacted.
- No WorkNodes, NodeSeeds, executable queues, implementation files, production build tasks, generated governance artifacts, or governance seal outputs are created by this compile.
validation_surfaces:
- python3 scripts/pm-plan-index.py validate
- python3 scripts/pm-bootstrap-ledger-validate.py Plans/ledgers/v2/pldg-20260703-001-feature-intake
- Remote/tunnel WS requires configured auth
- wrong Origin/CSRF/runtime id is rejected before initialize
- security receipts are visible and redacted.
risk_class: p0_terminal_runtime_hardening
reasoning_tier: high
context_scope: terminal_runtime
implementation_surfaces:
- Plans/Contracts_V0.md
- Plans/Executor_Protocol.md
- Plans/Permissions_System.md
- Plans/storage-plan.md
node_compile_hint:
  mode: p0_websocket_security_boundaries
  create_worknodes: false
  create_nodeseeds: false
source_lineage:
- pldg-20260703-001-feature-intake:atom-0047
- Plans/ledgers/v2/pldg-20260703-001-feature-intake/records/design_atoms.jsonl:atom-0047
- Plans/ledgers/v2/pldg-20260703-001-feature-intake/source_shards/external_repo_import_20260703/02_LEDGER_READY_ATOMS.jsonl:extrepo-20260703-0043/P0-WEBSOCKET-SECURITY-BOUNDARIES@line=43
- Plans/ledgers/v2/pldg-20260703-001-feature-intake/source_shards/external_repo_import_20260703/02_LEDGER_READY_ATOMS.jsonl:extrepo-20260703-0043/P0-WEBSOCKET-SECURITY-BOUNDARIES
- Plans/ledgers/v2/pldg-20260703-001-feature-intake/source_shards/external_repo_import_20260703/01_FULL_SOURCE_PACKET.md
- Plans/ledgers/v2/pldg-20260703-001-feature-intake/source_shards/external_repo_import_20260703/04_EVIDENCE_REGISTRY.json
- Plans/ledgers/v2/pldg-20260703-001-feature-intake/source_shards/external_repo_import_20260703/raw_source_artifacts/pm_context_cache_websocket_backlog_2026-07-03.jsonl:7
source_atom_ids:
- atom-0047
external_atom_id: extrepo-20260703-0043
source_row_id: P0-WEBSOCKET-SECURITY-BOUNDARIES
priority: P0
finding_family: Add WebSocket origin/auth/CSRF/runtime-id security gates
target_docs:
- Plans/Executor_Protocol.md
- Plans/Permissions_System.md
- Plans/storage-plan.md
owner_hints:
- Plans/Executor_Protocol.md
- Plans/Permissions_System.md
- Plans/storage-plan.md
preserved_exact_tokens:
- extrepo-20260703-0043
- P0-WEBSOCKET-SECURITY-BOUNDARIES
- P0
- Add WebSocket origin/auth/CSRF/runtime-id security gates
negative_constraints: []
proposal_or_recommendation: Remote/tunnel WS requires configured auth; wrong Origin/CSRF/runtime id is rejected before initialize; security receipts are visible and redacted.
compile_disposition: create_new_planunit
```

### CV-307 - P0-RUNTIME-SURFACE-READINESS-PROBE

```yaml
plan_unit_id: CV-307
unit_type: requirement
status: accepted
owner_doc: Plans/Contracts_V0.md
canonical_text: >-
  P0-RUNTIME-SURFACE-READINESS-PROBE (P0) is compiled as canonical Puppet Master intent for Runtime surface readiness probe: Imported external-repo finding extrepo-20260703-0092 / P0-RUNTIME-SURFACE-READINESS-PROBE (P0). The preserved PM gap/delta is: Configured tool/browser/terminal/MCP surfaces must prove started, injected, model-visible, UI-visible, and roundtrip-ready after restart/restore. The observed external-repo signal remains source-lineage evidence: Browser port forwarding fails until restart; computer-use plugin unavailable after restart; WSL path/bridge mismatch; OpenCode V2 MCP lifecycle need.
gui_related: true
gui_classification_reason: User-visible GUI, built-in terminal, accessibility, visual, multimodal, or desktop surface is directly implicated.
depends_on:
- PDS-003
- PNC-001
unblocks: []
acceptance_criteria:
- Restarted workspace probes every configured surface before run
- Unavailable plugin is shown before model attempts tool use
- WSL path namespace translation is explicit and tested
- No WorkNodes, NodeSeeds, executable queues, implementation files, production build tasks, generated governance artifacts, or governance seal outputs are created by this compile.
validation_surfaces:
- python3 scripts/pm-plan-index.py validate
- python3 scripts/pm-bootstrap-ledger-validate.py Plans/ledgers/v2/pldg-20260703-001-feature-intake
- Restarted workspace probes every configured surface before run
- Unavailable plugin is shown before model attempts tool use
- WSL path namespace translation is explicit and tested
risk_class: p0_terminal_runtime_hardening
reasoning_tier: high
context_scope: terminal_runtime
implementation_surfaces:
- Plans/Contracts_V0.md
node_compile_hint:
  mode: p0_runtime_surface_readiness_probe
  create_worknodes: false
  create_nodeseeds: false
source_lineage:
- pldg-20260703-001-feature-intake:atom-0096
- Plans/ledgers/v2/pldg-20260703-001-feature-intake/records/design_atoms.jsonl:atom-0096
- Plans/ledgers/v2/pldg-20260703-001-feature-intake/source_shards/external_repo_import_20260703/02_LEDGER_READY_ATOMS.jsonl:extrepo-20260703-0092/P0-RUNTIME-SURFACE-READINESS-PROBE@line=92
- Plans/ledgers/v2/pldg-20260703-001-feature-intake/source_shards/external_repo_import_20260703/02_LEDGER_READY_ATOMS.jsonl:extrepo-20260703-0092/P0-RUNTIME-SURFACE-READINESS-PROBE
- Plans/ledgers/v2/pldg-20260703-001-feature-intake/source_shards/external_repo_import_20260703/01_FULL_SOURCE_PACKET.md
- Plans/ledgers/v2/pldg-20260703-001-feature-intake/source_shards/external_repo_import_20260703/04_EVIDENCE_REGISTRY.json
- Plans/ledgers/v2/pldg-20260703-001-feature-intake/source_shards/external_repo_import_20260703/raw_source_artifacts/pm_one_more_external_repo_backlog_2026-07-03.jsonl:5
source_atom_ids:
- atom-0096
external_atom_id: extrepo-20260703-0092
source_row_id: P0-RUNTIME-SURFACE-READINESS-PROBE
priority: P0
finding_family: Runtime surface readiness probe
source_repos:
- OpenAI Codex
- OpenCode
preserved_exact_tokens:
- extrepo-20260703-0092
- P0-RUNTIME-SURFACE-READINESS-PROBE
- P0
- Runtime surface readiness probe
- OpenAI Codex
- OpenCode
negative_constraints: []
observed_signal: Browser port forwarding fails until restart; computer-use plugin unavailable after restart; WSL path/bridge mismatch; OpenCode V2 MCP lifecycle need.
pm_gap_or_delta: Configured tool/browser/terminal/MCP surfaces must prove started, injected, model-visible, UI-visible, and roundtrip-ready after restart/restore.
compile_disposition: create_new_planunit
```

### CV-308 - prompt_admission_execution

```yaml
plan_unit_id: CV-308
unit_type: requirement
status: accepted
owner_doc: Plans/Contracts_V0.md
canonical_text: >-
  prompt_admission_execution (P0) is compiled as canonical Puppet Master intent for prompt_admission_execution: Add SESSION-PROMPT-ADMISSION-INBOX events and idempotency semantics The preserved PM gap/delta is: No explicit session prompt admission inbox/event family The observed external-repo signal remains source-lineage evidence: OpenCode v2 session_input admission inbox and prompt/execution split; session seq/storage bugs
gui_related: true
gui_classification_reason: Target docs include GUI/UI command or user-visible surfaces; mixed work is conservatively GUI-related.
depends_on:
- PDS-003
- PNC-001
unblocks: []
acceptance_criteria:
- Crash/retry/duplicate prompt tests
- seglog replay tests
- No WorkNodes, NodeSeeds, executable queues, implementation files, production build tasks, generated governance artifacts, or governance seal outputs are created by this compile.
validation_surfaces:
- python3 scripts/pm-plan-index.py validate
- python3 scripts/pm-bootstrap-ledger-validate.py Plans/ledgers/v2/pldg-20260703-001-feature-intake
- Crash/retry/duplicate prompt tests
- seglog replay tests
risk_class: p0_cross_system_runtime_contracts_hardening
reasoning_tier: high
context_scope: cross_system_runtime_contracts
implementation_surfaces:
- Plans/Contracts_V0.md
- Plans/storage-plan.md
- Plans/assistant-chat-design.md
node_compile_hint:
  mode: prompt_admission_execution
  create_worknodes: false
  create_nodeseeds: false
source_lineage:
- pldg-20260703-001-feature-intake:atom-0105
- Plans/ledgers/v2/pldg-20260703-001-feature-intake/records/design_atoms.jsonl:atom-0105
- Plans/ledgers/v2/pldg-20260703-001-feature-intake/source_shards/external_repo_import_20260703/02_LEDGER_READY_ATOMS.jsonl:extrepo-20260703-0101/prompt_admission_execution@line=101
- Plans/ledgers/v2/pldg-20260703-001-feature-intake/source_shards/external_repo_import_20260703/02_LEDGER_READY_ATOMS.jsonl:extrepo-20260703-0101/prompt_admission_execution
- Plans/ledgers/v2/pldg-20260703-001-feature-intake/source_shards/external_repo_import_20260703/01_FULL_SOURCE_PACKET.md
- Plans/ledgers/v2/pldg-20260703-001-feature-intake/source_shards/external_repo_import_20260703/04_EVIDENCE_REGISTRY.json
- Plans/ledgers/v2/pldg-20260703-001-feature-intake/source_shards/external_repo_import_20260703/raw_source_artifacts/opencode_pm_plan_change_matrix.csv:3
- Plans/ledgers/v2/pldg-20260703-001-feature-intake/source_shards/external_repo_import_20260703/01_FULL_SOURCE_PACKET.md:3448-3472
source_atom_ids:
- atom-0105
external_atom_id: extrepo-20260703-0101
source_row_id: prompt_admission_execution
priority: P0
finding_family: prompt_admission_execution
target_docs:
- Plans/storage-plan.md
- Plans/Contracts_V0.md
- Plans/assistant-chat-design.md
owner_hints:
- Plans/storage-plan.md
- Plans/Contracts_V0.md
- Plans/assistant-chat-design.md
preserved_exact_tokens:
- extrepo-20260703-0101
- prompt_admission_execution
- P0
negative_constraints: []
observed_signal: OpenCode v2 session_input admission inbox and prompt/execution split; session seq/storage bugs
pm_current_coverage: Seglog/redb/Tantivy design; exclusive writer lock; projector checkpoints
pm_gap_or_delta: No explicit session prompt admission inbox/event family
proposal_or_recommendation: Add SESSION-PROMPT-ADMISSION-INBOX events and idempotency semantics
compile_disposition: create_new_planunit
```
