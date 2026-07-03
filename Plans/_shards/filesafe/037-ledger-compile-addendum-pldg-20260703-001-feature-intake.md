# Shard 037: Ledger Compile Addendum - pldg-20260703-001-feature-intake

Source: `Plans/FileSafe.md`

Source lines: L13506-L13822

Source SHA256: `a185b2e6e46438574d986a2ac598729ef9751e85d3b0d737daf728434bf3f6f6`

---

## Ledger Compile Addendum - pldg-20260703-001-feature-intake

This addendum compiles source-lineage obligations from bootstrap ledger `pldg-20260703-001-feature-intake` into this owner doc. The ledger remains source/planning memory; these PlanUnits are the live canonical evidence. This compile does not create WorkNodes, NodeSeeds, executable queues, implementation files, production build tasks, generated governance artifacts, or a governance seal.

### F2-195 - P1-SECURITY-CREDENTIAL-LOGGING

```yaml
plan_unit_id: F2-195
unit_type: requirement
status: accepted
owner_doc: Plans/FileSafe.md
canonical_text: >-
  P1-SECURITY-CREDENTIAL-LOGGING (P1) is compiled as canonical Puppet Master intent for Credential and sensitive output redaction timing: Add RedactionSettlement stage before UI/render/persistence for tool/terminal/model outputs; keep secure raw vault only when required for replay with explicit policy. The preserved PM gap/delta is: Need a redaction-time ordering contract: raw tool output must not hit UI/transcript before redaction policy has a chance to apply, unless explicitly marked sensitive/raw local-only. The observed external-repo signal remains source-lineage evidence: Agent Zero security issue raises credential leakage concerns; Codex issue list has PostToolUse redaction-before-transcript-rendering problem; Cline PRs add credential lifecycle debug logging.
gui_related: true
gui_classification_reason: User-visible GUI, built-in terminal, accessibility, visual, multimodal, or desktop surface is directly implicated.
depends_on:
- PDS-003
- PNC-001
unblocks: []
acceptance_criteria:
- Secret fixture in tool output is redacted before GUI transcript render.
- Privilege metadata logs actor/target/realm/transport without command secrets.
- No WorkNodes, NodeSeeds, executable queues, implementation files, production build tasks, generated governance artifacts, or governance seal outputs are created by this compile.
validation_surfaces:
- python3 scripts/pm-plan-index.py validate
- python3 scripts/pm-bootstrap-ledger-validate.py Plans/ledgers/v2/pldg-20260703-001-feature-intake
- Secret fixture in tool output is redacted before GUI transcript render.
- Privilege metadata logs actor/target/realm/transport without command secrets.
risk_class: p1_provider_capability_and_metadata_hardening
reasoning_tier: standard
context_scope: provider_capability_and_metadata
implementation_surfaces:
- Plans/FileSafe.md
- Plans/Permissions_System.md
- Plans/Tools.md
- Plans/storage-plan.md
node_compile_hint:
  mode: p1_security_credential_logging
  create_worknodes: false
  create_nodeseeds: false
source_lineage:
- pldg-20260703-001-feature-intake:atom-0019
- Plans/ledgers/v2/pldg-20260703-001-feature-intake/records/design_atoms.jsonl:atom-0019
- Plans/ledgers/v2/pldg-20260703-001-feature-intake/source_shards/external_repo_import_20260703/02_LEDGER_READY_ATOMS.jsonl:extrepo-20260703-0015/P1-SECURITY-CREDENTIAL-LOGGING@line=15
- Plans/ledgers/v2/pldg-20260703-001-feature-intake/source_shards/external_repo_import_20260703/02_LEDGER_READY_ATOMS.jsonl:extrepo-20260703-0015/P1-SECURITY-CREDENTIAL-LOGGING
- Plans/ledgers/v2/pldg-20260703-001-feature-intake/source_shards/external_repo_import_20260703/01_FULL_SOURCE_PACKET.md
- Plans/ledgers/v2/pldg-20260703-001-feature-intake/source_shards/external_repo_import_20260703/04_EVIDENCE_REGISTRY.json
- Plans/ledgers/v2/pldg-20260703-001-feature-intake/source_shards/external_repo_import_20260703/raw_source_artifacts/pm_external_repo_action_backlog_2026-07-03.jsonl:15
- Plans/ledgers/v2/pldg-20260703-001-feature-intake/source_shards/external_repo_import_20260703/01_FULL_SOURCE_PACKET.md:833-1329
source_atom_ids:
- atom-0019
external_atom_id: extrepo-20260703-0015
source_row_id: P1-SECURITY-CREDENTIAL-LOGGING
priority: P1
finding_family: Credential and sensitive output redaction timing
source_repos:
- agent0ai/agent-zero
- cline/cline
- openai/codex
target_docs:
- Plans/FileSafe.md
- Plans/Permissions_System.md
- Plans/Tools.md
- Plans/storage-plan.md
owner_hints:
- Plans/FileSafe.md
- Plans/Permissions_System.md
- Plans/Tools.md
- Plans/storage-plan.md
preserved_exact_tokens:
- extrepo-20260703-0015
- P1-SECURITY-CREDENTIAL-LOGGING
- P1
- Credential and sensitive output redaction timing
- agent0ai/agent-zero
- cline/cline
- openai/codex
negative_constraints: []
observed_signal: Agent Zero security issue raises credential leakage concerns; Codex issue list has PostToolUse redaction-before-transcript-rendering problem; Cline PRs add credential lifecycle debug logging.
pm_current_coverage: PM has FileSafe and privileged session metadata minimization.
pm_gap_or_delta: 'Need a redaction-time ordering contract: raw tool output must not hit UI/transcript before redaction policy has a chance to apply, unless explicitly marked sensitive/raw local-only.'
proposal_or_recommendation: Add RedactionSettlement stage before UI/render/persistence for tool/terminal/model outputs; keep secure raw vault only when required for replay with explicit policy.
compile_disposition: create_new_planunit
```

### F2-196 - P1-TRACE-REDACTION-BEFORE-WRITE

```yaml
plan_unit_id: F2-196
unit_type: requirement
status: accepted
owner_doc: Plans/FileSafe.md
canonical_text: >-
  P1-TRACE-REDACTION-BEFORE-WRITE (P1) is compiled as canonical Puppet Master intent for Trace/debug log redaction before persistence: Imported external-repo finding extrepo-20260703-0033 / P1-TRACE-REDACTION-BEFORE-WRITE (P1): None The preserved PM gap/delta is: Add invariant that full prompts, requests, provider payloads, WebSocket frames, and tool raw outputs cannot hit trace/debug logs before redaction/bounding unless explicit encrypted local debug capture is enabled. The observed external-repo signal remains source-lineage evidence: Codex 0.142.5 fixed full Responses WebSocket request payloads being written to trace logs.
gui_related: false
gui_classification_reason: Backend/orchestration contract; not itself GUI implementation work.
depends_on:
- PDS-003
- PNC-001
unblocks: []
acceptance_criteria:
- Trace log search cannot find full prompt/tool payload under default config
- Raw debug capture has opt-in, expiry, encryption, and export warnings
- No WorkNodes, NodeSeeds, executable queues, implementation files, production build tasks, generated governance artifacts, or governance seal outputs are created by this compile.
validation_surfaces:
- python3 scripts/pm-plan-index.py validate
- python3 scripts/pm-bootstrap-ledger-validate.py Plans/ledgers/v2/pldg-20260703-001-feature-intake
- Trace log search cannot find full prompt/tool payload under default config
- Raw debug capture has opt-in, expiry, encryption, and export warnings
risk_class: p1_memory_history_logging_hardening
reasoning_tier: standard
context_scope: memory_history_logging
implementation_surfaces:
- Plans/FileSafe.md
- Plans/Permissions_System.md
- Plans/storage-plan.md
- Plans/Runtime_Artifacts_Panel.md
node_compile_hint:
  mode: p1_trace_redaction_before_write
  create_worknodes: false
  create_nodeseeds: false
source_lineage:
- pldg-20260703-001-feature-intake:atom-0037
- Plans/ledgers/v2/pldg-20260703-001-feature-intake/records/design_atoms.jsonl:atom-0037
- Plans/ledgers/v2/pldg-20260703-001-feature-intake/source_shards/external_repo_import_20260703/02_LEDGER_READY_ATOMS.jsonl:extrepo-20260703-0033/P1-TRACE-REDACTION-BEFORE-WRITE@line=13
- Plans/ledgers/v2/pldg-20260703-001-feature-intake/source_shards/external_repo_import_20260703/02_LEDGER_READY_ATOMS.jsonl:extrepo-20260703-0033/P1-TRACE-REDACTION-BEFORE-WRITE
- Plans/ledgers/v2/pldg-20260703-001-feature-intake/source_shards/external_repo_import_20260703/01_FULL_SOURCE_PACKET.md
- Plans/ledgers/v2/pldg-20260703-001-feature-intake/source_shards/external_repo_import_20260703/04_EVIDENCE_REGISTRY.json
- Plans/ledgers/v2/pldg-20260703-001-feature-intake/source_shards/external_repo_import_20260703/raw_source_artifacts/pm_second_pass_delta_backlog_2026-07-03.jsonl:13
source_atom_ids:
- atom-0037
external_atom_id: extrepo-20260703-0033
source_row_id: P1-TRACE-REDACTION-BEFORE-WRITE
priority: P1
finding_family: Trace/debug log redaction before persistence
source_repos:
- openai/codex
target_docs:
- Plans/Permissions_System.md
- Plans/storage-plan.md
- Plans/Runtime_Artifacts_Panel.md
owner_hints:
- Plans/Permissions_System.md
- Plans/storage-plan.md
- Plans/Runtime_Artifacts_Panel.md
preserved_exact_tokens:
- extrepo-20260703-0033
- P1-TRACE-REDACTION-BEFORE-WRITE
- P1
- Trace/debug log redaction before persistence
- openai/codex
negative_constraints: []
observed_signal: Codex 0.142.5 fixed full Responses WebSocket request payloads being written to trace logs.
pm_current_coverage: Permissions requires provider exposure scrub and persisted/export/screenshot redaction profiles.
pm_gap_or_delta: Add invariant that full prompts, requests, provider payloads, WebSocket frames, and tool raw outputs cannot hit trace/debug logs before redaction/bounding unless explicit encrypted local debug capture is enabled.
compile_disposition: create_new_planunit
```

### F2-197 - P0-LOG-REDACTION-BEFORE-WRITE

```yaml
plan_unit_id: F2-197
unit_type: requirement
status: accepted
owner_doc: Plans/FileSafe.md
canonical_text: >-
  P0-LOG-REDACTION-BEFORE-WRITE (P0) is compiled as canonical Puppet Master intent for Logging, traces, diagnostics, and privacy: Add ObservabilityEnvelope and TracePersistencePolicy: sensitivity classification before persistence, bounded per-run log quotas, log sampling levels, per-character terminal log suppression, OTLP export adapter as optional, support-bundle redaction, and trace-to-usage correlation IDs. The preserved PM gap/delta is: Observability needs a redaction-before-write and log-volume contract shared by provider traces, WebSockets/SSE, terminal streams, subagents, tools, MCP, memory, and support bundles. The observed external-repo signal remains source-lineage evidence: Codex issues show raw logs with paths/env/account/token-like data, heavy idle I/O, and stale helper processes; Pi exposes OpenTelemetry hooks; OpenCode supports Helicone/monitoring headers; Warp issue logs show per-character terminal event floods.
gui_related: true
gui_classification_reason: User-visible GUI, built-in terminal, accessibility, visual, multimodal, or desktop surface is directly implicated.
depends_on:
- PDS-003
- PNC-001
unblocks: []
acceptance_criteria:
- Raw provider requests/WS payloads are scrubbed before disk.
- Terminal huge-output fixture cannot create unbounded per-character logs.
- Support bundle validator rejects secrets/env/token-like fields.
- Usage/cost/log traces join by attempt_id without exposing hidden content.
- No WorkNodes, NodeSeeds, executable queues, implementation files, production build tasks, generated governance artifacts, or governance seal outputs are created by this compile.
validation_surfaces:
- python3 scripts/pm-plan-index.py validate
- python3 scripts/pm-bootstrap-ledger-validate.py Plans/ledgers/v2/pldg-20260703-001-feature-intake
- Raw provider requests/WS payloads are scrubbed before disk.
- Terminal huge-output fixture cannot create unbounded per-character logs.
- Support bundle validator rejects secrets/env/token-like fields.
- Usage/cost/log traces join by attempt_id without exposing hidden content.
risk_class: p0_memory_history_logging_hardening
reasoning_tier: high
context_scope: memory_history_logging
implementation_surfaces:
- Plans/FileSafe.md
- Plans/storage-plan.md
- Plans/usage-feature.md
- Plans/FinalGUISpec.md
- Plans/Executor_Protocol.md
- Plans/Provider_OpenCode.md
node_compile_hint:
  mode: p0_log_redaction_before_write
  create_worknodes: false
  create_nodeseeds: false
source_lineage:
- pldg-20260703-001-feature-intake:atom-0066
- Plans/ledgers/v2/pldg-20260703-001-feature-intake/records/design_atoms.jsonl:atom-0066
- Plans/ledgers/v2/pldg-20260703-001-feature-intake/source_shards/external_repo_import_20260703/02_LEDGER_READY_ATOMS.jsonl:extrepo-20260703-0062/P0-LOG-REDACTION-BEFORE-WRITE@line=8
- Plans/ledgers/v2/pldg-20260703-001-feature-intake/source_shards/external_repo_import_20260703/02_LEDGER_READY_ATOMS.jsonl:extrepo-20260703-0062/P0-LOG-REDACTION-BEFORE-WRITE
- Plans/ledgers/v2/pldg-20260703-001-feature-intake/source_shards/external_repo_import_20260703/01_FULL_SOURCE_PACKET.md
- Plans/ledgers/v2/pldg-20260703-001-feature-intake/source_shards/external_repo_import_20260703/04_EVIDENCE_REGISTRY.json
- Plans/ledgers/v2/pldg-20260703-001-feature-intake/source_shards/external_repo_import_20260703/raw_source_artifacts/pm_missed_domains_backlog_2026-07-03.jsonl:8
source_atom_ids:
- atom-0066
external_atom_id: extrepo-20260703-0062
source_row_id: P0-LOG-REDACTION-BEFORE-WRITE
priority: P0
finding_family: Logging, traces, diagnostics, and privacy
source_repos:
- Codex
- OpenCode
- Warp
- Pi
- Agent Zero
target_docs:
- Plans/storage-plan.md
- Plans/usage-feature.md
- Plans/FinalGUISpec.md
- Plans/Executor_Protocol.md
- Plans/Provider_OpenCode.md
owner_hints:
- Plans/storage-plan.md
- Plans/usage-feature.md
- Plans/FinalGUISpec.md
- Plans/Executor_Protocol.md
- Plans/Provider_OpenCode.md
preserved_exact_tokens:
- extrepo-20260703-0062
- P0-LOG-REDACTION-BEFORE-WRITE
- P0
- Logging, traces, diagnostics, and privacy
- Codex
- OpenCode
- Warp
- Pi
- Agent Zero
negative_constraints: []
observed_signal: Codex issues show raw logs with paths/env/account/token-like data, heavy idle I/O, and stale helper processes; Pi exposes OpenTelemetry hooks; OpenCode supports Helicone/monitoring headers; Warp issue logs show per-character terminal event floods.
pm_current_coverage: PM has seglog, usage records, provider/usage join fields, terminal persistence, and runtime artifact identity.
pm_gap_or_delta: Observability needs a redaction-before-write and log-volume contract shared by provider traces, WebSockets/SSE, terminal streams, subagents, tools, MCP, memory, and support bundles.
proposal_or_recommendation: 'Add ObservabilityEnvelope and TracePersistencePolicy: sensitivity classification before persistence, bounded per-run log quotas, log sampling levels, per-character terminal log suppression, OTLP export adapter as optional, support-bundle redaction, and trace-to-usage correlation IDs.'
compile_disposition: create_new_planunit
```

### F2-198 - filesystem_boundary_regressions

```yaml
plan_unit_id: F2-198
unit_type: requirement
status: accepted
owner_doc: Plans/FileSafe.md
canonical_text: >-
  filesystem_boundary_regressions (P1) is compiled as canonical Puppet Master intent for filesystem_boundary_regressions: Add external path/symlink regression suite The preserved PM gap/delta is: Need exhaustive fixtures across read/bash/grep/glob/edit and child contexts The observed external-repo signal remains source-lineage evidence: OpenCode Plan-mode outside-project read/symlink/search bug family
gui_related: true
gui_classification_reason: User-visible GUI, built-in terminal, accessibility, visual, multimodal, or desktop surface is directly implicated.
depends_on:
- PDS-003
- PNC-001
unblocks: []
acceptance_criteria:
- Permission/FileSafe test matrix
- No WorkNodes, NodeSeeds, executable queues, implementation files, production build tasks, generated governance artifacts, or governance seal outputs are created by this compile.
validation_surfaces:
- python3 scripts/pm-plan-index.py validate
- python3 scripts/pm-bootstrap-ledger-validate.py Plans/ledgers/v2/pldg-20260703-001-feature-intake
- Permission/FileSafe test matrix
risk_class: p1_security_release_supply_chain_hardening
reasoning_tier: standard
context_scope: security_release_supply_chain
implementation_surfaces:
- Plans/FileSafe.md
- Plans/Permissions_System.md
- Plans/Tools.md
node_compile_hint:
  mode: filesystem_boundary_regressions
  create_worknodes: false
  create_nodeseeds: false
source_lineage:
- pldg-20260703-001-feature-intake:atom-0113
- Plans/ledgers/v2/pldg-20260703-001-feature-intake/records/design_atoms.jsonl:atom-0113
- Plans/ledgers/v2/pldg-20260703-001-feature-intake/source_shards/external_repo_import_20260703/02_LEDGER_READY_ATOMS.jsonl:extrepo-20260703-0109/filesystem_boundary_regressions@line=11
- Plans/ledgers/v2/pldg-20260703-001-feature-intake/source_shards/external_repo_import_20260703/02_LEDGER_READY_ATOMS.jsonl:extrepo-20260703-0109/filesystem_boundary_regressions
- Plans/ledgers/v2/pldg-20260703-001-feature-intake/source_shards/external_repo_import_20260703/01_FULL_SOURCE_PACKET.md
- Plans/ledgers/v2/pldg-20260703-001-feature-intake/source_shards/external_repo_import_20260703/04_EVIDENCE_REGISTRY.json
- Plans/ledgers/v2/pldg-20260703-001-feature-intake/source_shards/external_repo_import_20260703/raw_source_artifacts/opencode_pm_plan_change_matrix.csv:11
- Plans/ledgers/v2/pldg-20260703-001-feature-intake/source_shards/external_repo_import_20260703/01_FULL_SOURCE_PACKET.md:3448-3472
source_atom_ids:
- atom-0113
external_atom_id: extrepo-20260703-0109
source_row_id: filesystem_boundary_regressions
priority: P1
finding_family: filesystem_boundary_regressions
target_docs:
- Plans/Permissions_System.md
- Plans/FileSafe.md
- Plans/Tools.md
owner_hints:
- Plans/Permissions_System.md
- Plans/FileSafe.md
- Plans/Tools.md
preserved_exact_tokens:
- extrepo-20260703-0109
- filesystem_boundary_regressions
- P1
negative_constraints: []
observed_signal: OpenCode Plan-mode outside-project read/symlink/search bug family
pm_current_coverage: Path normalization/symlink fail-closed/external_directory guard strong
pm_gap_or_delta: Need exhaustive fixtures across read/bash/grep/glob/edit and child contexts
proposal_or_recommendation: Add external path/symlink regression suite
compile_disposition: create_new_planunit
```
