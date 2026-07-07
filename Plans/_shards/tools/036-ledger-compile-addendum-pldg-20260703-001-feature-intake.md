# Shard 036: Ledger Compile Addendum - pldg-20260703-001-feature-intake

Source: `Plans/Tools.md`

Source lines: L11409-L12095

Source SHA256: `bac28d46265a27f980d8a49d2431cbe03bd4fdc376207edd0d2b4da2f8d5b574`

---

## Ledger Compile Addendum - pldg-20260703-001-feature-intake

This addendum compiles source-lineage obligations from bootstrap ledger `pldg-20260703-001-feature-intake` into this owner doc. The ledger remains source/planning memory; these PlanUnits are the live canonical evidence. This compile does not create WorkNodes, NodeSeeds, executable queues, implementation files, production build tasks, generated governance artifacts, or a governance seal.

### T-167 - P0-TOOL-RESULT-SETTLEMENT

```yaml
plan_unit_id: T-167
unit_type: requirement
status: accepted
owner_doc: Plans/Tools.md
canonical_text: >-
  P0-TOOL-RESULT-SETTLEMENT (P0) is compiled as canonical Puppet Master intent for Partial/truncated/nullable provider tool turns cannot count as success: Add no-lossy-success rule: a tool/model turn is not successful until required content/result/error/truncation metadata is retained and normalized. Length truncation is `partial_truncated`, not success. The preserved PM gap/delta is: Need explicit `ToolTurnSettlement` state machine for provider native turns: success, partial, truncated, malformed, nullable-content, redacted, retained, retryable, fatal. The observed external-repo signal remains source-lineage evidence: Agent Zero issue list reports finish_reason=length treated as success and causing unbounded retry; Cline issue list reports large MCP tool_result crash; Pi issue list reports null content/reasoning during tool use; Codex issue list has redaction-hook timing for tool output.
gui_related: true
gui_classification_reason: User-visible GUI, built-in terminal, accessibility, visual, multimodal, or desktop surface is directly implicated.
depends_on:
- PDS-003
- PNC-001
unblocks: []
acceptance_criteria:
- finish_reason=length with tool call is classified partial_truncated.
- nullable reasoning/content arrays are normalized without crashing and without dropping provider-native metadata.
- large MCP tool_result is stored as managed output ref or rejected with explicit retention failure.
- No WorkNodes, NodeSeeds, executable queues, implementation files, production build tasks, generated governance artifacts, or governance seal outputs are created by this compile.
validation_surfaces:
- python3 scripts/pm-plan-index.py validate
- python3 scripts/pm-bootstrap-ledger-validate.py Plans/ledgers/v2/pldg-20260703-001-feature-intake
- finish_reason=length with tool call is classified partial_truncated.
- nullable reasoning/content arrays are normalized without crashing and without dropping provider-native metadata.
- large MCP tool_result is stored as managed output ref or rejected with explicit retention failure.
risk_class: p0_provider_capability_and_metadata_hardening
reasoning_tier: high
context_scope: provider_capability_and_metadata
implementation_surfaces:
- Plans/Tools.md
- Plans/CLI_Bridged_Providers.md
- Plans/Models_System.md
- Plans/storage-plan.md
node_compile_hint:
  mode: p0_tool_result_settlement
  create_worknodes: false
  create_nodeseeds: false
source_lineage:
- pldg-20260703-001-feature-intake:atom-0009
- Plans/ledgers/v2/pldg-20260703-001-feature-intake/records/design_atoms.jsonl:atom-0009
- Plans/ledgers/v2/pldg-20260703-001-feature-intake/source_shards/external_repo_import_20260703/02_LEDGER_READY_ATOMS.jsonl:extrepo-20260703-0005/P0-TOOL-RESULT-SETTLEMENT@line=5
- Plans/ledgers/v2/pldg-20260703-001-feature-intake/source_shards/external_repo_import_20260703/02_LEDGER_READY_ATOMS.jsonl:extrepo-20260703-0005/P0-TOOL-RESULT-SETTLEMENT
- Plans/ledgers/v2/pldg-20260703-001-feature-intake/source_shards/external_repo_import_20260703/01_FULL_SOURCE_PACKET.md
- Plans/ledgers/v2/pldg-20260703-001-feature-intake/source_shards/external_repo_import_20260703/04_EVIDENCE_REGISTRY.json
- Plans/ledgers/v2/pldg-20260703-001-feature-intake/source_shards/external_repo_import_20260703/raw_source_artifacts/pm_external_repo_action_backlog_2026-07-03.jsonl:5
- Plans/ledgers/v2/pldg-20260703-001-feature-intake/source_shards/external_repo_import_20260703/01_FULL_SOURCE_PACKET.md:833-1329
source_atom_ids:
- atom-0009
external_atom_id: extrepo-20260703-0005
source_row_id: P0-TOOL-RESULT-SETTLEMENT
priority: P0
finding_family: Partial/truncated/nullable provider tool turns cannot count as success
source_repos:
- agent0ai/agent-zero
- cline/cline
- earendil-works/pi
- openai/codex
target_docs:
- Plans/Tools.md
- Plans/CLI_Bridged_Providers.md
- Plans/Models_System.md
- Plans/storage-plan.md
owner_hints:
- Plans/Tools.md
- Plans/CLI_Bridged_Providers.md
- Plans/Models_System.md
- Plans/storage-plan.md
preserved_exact_tokens:
- extrepo-20260703-0005
- P0-TOOL-RESULT-SETTLEMENT
- P0
- Partial/truncated/nullable provider tool turns cannot count as success
- agent0ai/agent-zero
- cline/cline
- earendil-works/pi
- openai/codex
negative_constraints: []
observed_signal: Agent Zero issue list reports finish_reason=length treated as success and causing unbounded retry; Cline issue list reports large MCP tool_result crash; Pi issue list reports null content/reasoning during tool use; Codex issue list has redaction-hook timing for tool output.
pm_current_coverage: PM has normalized tool outcomes and provider bridge output preservation requirements.
pm_gap_or_delta: 'Need explicit `ToolTurnSettlement` state machine for provider native turns: success, partial, truncated, malformed, nullable-content, redacted, retained, retryable, fatal.'
proposal_or_recommendation: 'Add no-lossy-success rule: a tool/model turn is not successful until required content/result/error/truncation metadata is retained and normalized. Length truncation is `partial_truncated`, not success.'
compile_disposition: create_new_planunit
```

### T-168 - P2-CACHEABLE-TOOL-OUTPUT-REFS

```yaml
plan_unit_id: T-168
unit_type: requirement
status: accepted
owner_doc: Plans/Tools.md
canonical_text: >-
  P2-CACHEABLE-TOOL-OUTPUT-REFS (P2) is compiled as canonical Puppet Master intent for Hash-addressed cache refs for stable large tool outputs: Large stable outputs use refs with TTL/redaction; secrets are never cached; model-visible preview references complete retained output.
gui_related: false
gui_classification_reason: Backend/orchestration contract; not itself GUI implementation work.
depends_on:
- PDS-003
- PNC-001
unblocks: []
acceptance_criteria:
- Large stable outputs use refs with TTL/redaction
- secrets are never cached
- model-visible preview references complete retained output.
- No WorkNodes, NodeSeeds, executable queues, implementation files, production build tasks, generated governance artifacts, or governance seal outputs are created by this compile.
validation_surfaces:
- python3 scripts/pm-plan-index.py validate
- python3 scripts/pm-bootstrap-ledger-validate.py Plans/ledgers/v2/pldg-20260703-001-feature-intake
- Large stable outputs use refs with TTL/redaction
- secrets are never cached
- model-visible preview references complete retained output.
risk_class: p2_context_cache_coverage
reasoning_tier: standard
context_scope: context_cache
implementation_surfaces:
- Plans/Tools.md
- Plans/storage-plan.md
- Plans/Runtime_Artifacts_Panel.md
node_compile_hint:
  mode: p2_cacheable_tool_output_refs
  create_worknodes: false
  create_nodeseeds: false
source_lineage:
- pldg-20260703-001-feature-intake:atom-0056
- Plans/ledgers/v2/pldg-20260703-001-feature-intake/records/design_atoms.jsonl:atom-0056
- Plans/ledgers/v2/pldg-20260703-001-feature-intake/source_shards/external_repo_import_20260703/02_LEDGER_READY_ATOMS.jsonl:extrepo-20260703-0052/P2-CACHEABLE-TOOL-OUTPUT-REFS@line=52
- Plans/ledgers/v2/pldg-20260703-001-feature-intake/source_shards/external_repo_import_20260703/02_LEDGER_READY_ATOMS.jsonl:extrepo-20260703-0052/P2-CACHEABLE-TOOL-OUTPUT-REFS
- Plans/ledgers/v2/pldg-20260703-001-feature-intake/source_shards/external_repo_import_20260703/01_FULL_SOURCE_PACKET.md
- Plans/ledgers/v2/pldg-20260703-001-feature-intake/source_shards/external_repo_import_20260703/04_EVIDENCE_REGISTRY.json
- Plans/ledgers/v2/pldg-20260703-001-feature-intake/source_shards/external_repo_import_20260703/raw_source_artifacts/pm_context_cache_websocket_backlog_2026-07-03.jsonl:16
source_atom_ids:
- atom-0056
external_atom_id: extrepo-20260703-0052
source_row_id: P2-CACHEABLE-TOOL-OUTPUT-REFS
priority: P2
finding_family: Hash-addressed cache refs for stable large tool outputs
target_docs:
- Plans/Tools.md
- Plans/storage-plan.md
- Plans/Runtime_Artifacts_Panel.md
owner_hints:
- Plans/Tools.md
- Plans/storage-plan.md
- Plans/Runtime_Artifacts_Panel.md
preserved_exact_tokens:
- extrepo-20260703-0052
- P2-CACHEABLE-TOOL-OUTPUT-REFS
- P2
- Hash-addressed cache refs for stable large tool outputs
negative_constraints: []
proposal_or_recommendation: Large stable outputs use refs with TTL/redaction; secrets are never cached; model-visible preview references complete retained output.
compile_disposition: create_new_planunit
```

### T-169 - P0-TOOL-CALL-MALFORMATION-GATE

```yaml
plan_unit_id: T-169
unit_type: requirement
status: accepted
owner_doc: Plans/Tools.md
canonical_text: >-
  P0-TOOL-CALL-MALFORMATION-GATE (P0) is compiled as canonical Puppet Master intent for Malformed/truncated/partial tool-turn admission: Add ProviderToolTurnAdmissionGate. Only settled tool calls with valid schema, args, IDs, provider-native metadata, and truncation state can enter replayable history. Rejected turns become provider_turn_malformed records with raw-redacted reference and loop policy. The preserved PM gap/delta is: Malformed provider output must be stopped before durable history admission, not only before actual tool execution. The observed external-repo signal remains source-lineage evidence: OpenCode, Cline, Agent Zero, and Pi all show broken tool-call deltas, XML/JSON fragments, nullable reasoning/content, stringified MCP params, truncation, empty tool calls, and loops when malformed turns reach history or repair logic.
gui_related: true
gui_classification_reason: User-visible GUI, built-in terminal, accessibility, visual, multimodal, or desktop surface is directly implicated.
depends_on:
- PDS-003
- PNC-001
unblocks: []
acceptance_criteria:
- Partial streamed JSON/tool XML never becomes replayable assistant history.
- A length finishReason on tool-call deltas blocks/retries under typed policy, not as ordinary no-tool response.
- Replayed history never includes malformed or duplicate tool_call IDs.
- No WorkNodes, NodeSeeds, executable queues, implementation files, production build tasks, generated governance artifacts, or governance seal outputs are created by this compile.
validation_surfaces:
- python3 scripts/pm-plan-index.py validate
- python3 scripts/pm-bootstrap-ledger-validate.py Plans/ledgers/v2/pldg-20260703-001-feature-intake
- Partial streamed JSON/tool XML never becomes replayable assistant history.
- A length finishReason on tool-call deltas blocks/retries under typed policy, not as ordinary no-tool response.
- Replayed history never includes malformed or duplicate tool_call IDs.
risk_class: p0_mcp_tools_and_tool_settlement_hardening
reasoning_tier: high
context_scope: mcp_tools_and_tool_settlement
implementation_surfaces:
- Plans/Tools.md
- Plans/Prompt_Pipeline.md
- Plans/Provider_OpenCode.md
- Plans/storage-plan.md
node_compile_hint:
  mode: p0_tool_call_malformation_gate
  create_worknodes: false
  create_nodeseeds: false
source_lineage:
- pldg-20260703-001-feature-intake:atom-0065
- Plans/ledgers/v2/pldg-20260703-001-feature-intake/records/design_atoms.jsonl:atom-0065
- Plans/ledgers/v2/pldg-20260703-001-feature-intake/source_shards/external_repo_import_20260703/02_LEDGER_READY_ATOMS.jsonl:extrepo-20260703-0061/P0-TOOL-CALL-MALFORMATION-GATE@line=61
- Plans/ledgers/v2/pldg-20260703-001-feature-intake/source_shards/external_repo_import_20260703/02_LEDGER_READY_ATOMS.jsonl:extrepo-20260703-0061/P0-TOOL-CALL-MALFORMATION-GATE
- Plans/ledgers/v2/pldg-20260703-001-feature-intake/source_shards/external_repo_import_20260703/01_FULL_SOURCE_PACKET.md
- Plans/ledgers/v2/pldg-20260703-001-feature-intake/source_shards/external_repo_import_20260703/04_EVIDENCE_REGISTRY.json
- Plans/ledgers/v2/pldg-20260703-001-feature-intake/source_shards/external_repo_import_20260703/raw_source_artifacts/pm_missed_domains_backlog_2026-07-03.jsonl:7
source_atom_ids:
- atom-0065
external_atom_id: extrepo-20260703-0061
source_row_id: P0-TOOL-CALL-MALFORMATION-GATE
priority: P0
finding_family: Malformed/truncated/partial tool-turn admission
source_repos:
- OpenCode
- Cline
- Agent Zero
- Pi
target_docs:
- Plans/Tools.md
- Plans/Prompt_Pipeline.md
- Plans/Provider_OpenCode.md
- Plans/storage-plan.md
owner_hints:
- Plans/Tools.md
- Plans/Prompt_Pipeline.md
- Plans/Provider_OpenCode.md
- Plans/storage-plan.md
preserved_exact_tokens:
- extrepo-20260703-0061
- P0-TOOL-CALL-MALFORMATION-GATE
- P0
- Malformed/truncated/partial tool-turn admission
- OpenCode
- Cline
- Agent Zero
- Pi
negative_constraints: []
observed_signal: OpenCode, Cline, Agent Zero, and Pi all show broken tool-call deltas, XML/JSON fragments, nullable reasoning/content, stringified MCP params, truncation, empty tool calls, and loops when malformed turns reach history or repair logic.
pm_current_coverage: Tools already has invalid arg/truncated invocation structured failures and a rich tool outcome taxonomy.
pm_gap_or_delta: Malformed provider output must be stopped before durable history admission, not only before actual tool execution.
proposal_or_recommendation: Add ProviderToolTurnAdmissionGate. Only settled tool calls with valid schema, args, IDs, provider-native metadata, and truncation state can enter replayable history. Rejected turns become provider_turn_malformed records with raw-redacted reference and loop policy.
compile_disposition: create_new_planunit
```

### T-170 - P1-PROGRESSIVE-DISCLOSURE-TOOLS-SKILLS

```yaml
plan_unit_id: T-170
unit_type: requirement
status: accepted
owner_doc: Plans/Tools.md
canonical_text: >-
  P1-PROGRESSIVE-DISCLOSURE-TOOLS-SKILLS (P1) is compiled as canonical Puppet Master intent for Token efficiency for tools, skills, MCP, and docs: Define CapabilityCatalogMaterialization: L0 names/descriptions, L1 selected metadata, L2 full schema/instructions, L3 runtime docs/examples; all permission-filtered and cache-stable. The preserved PM gap/delta is: PM needs an explicit L0/L1/L2 materialization policy for tool, skill, MCP, media, terminal, browser, and memory capabilities. The observed external-repo signal remains source-lineage evidence: Codex Skills use progressive disclosure; OpenCode/Cline show tool/MCP schema bloat; Agent Zero issue notes full tool descriptions repeated into prompts.
gui_related: true
gui_classification_reason: User-visible GUI, built-in terminal, accessibility, visual, multimodal, or desktop surface is directly implicated.
depends_on:
- PDS-003
- PNC-001
unblocks: []
acceptance_criteria:
- Default context never includes all full MCP schemas.
- Tool search can materialize a selected tool without losing rich-result parser path.
- Permission changes invalidate catalog slice.
- Token budget reports catalog materialization cost.
- No WorkNodes, NodeSeeds, executable queues, implementation files, production build tasks, generated governance artifacts, or governance seal outputs are created by this compile.
validation_surfaces:
- python3 scripts/pm-plan-index.py validate
- python3 scripts/pm-bootstrap-ledger-validate.py Plans/ledgers/v2/pldg-20260703-001-feature-intake
- Default context never includes all full MCP schemas.
- Tool search can materialize a selected tool without losing rich-result parser path.
- Permission changes invalidate catalog slice.
- Token budget reports catalog materialization cost.
risk_class: p1_mcp_tools_and_tool_settlement_hardening
reasoning_tier: standard
context_scope: mcp_tools_and_tool_settlement
implementation_surfaces:
- Plans/Tools.md
- Plans/MCP_Integration.md
- Plans/Models_System.md
- Plans/Prompt_Pipeline.md
node_compile_hint:
  mode: p1_progressive_disclosure_tools_skills
  create_worknodes: false
  create_nodeseeds: false
source_lineage:
- pldg-20260703-001-feature-intake:atom-0072
- Plans/ledgers/v2/pldg-20260703-001-feature-intake/records/design_atoms.jsonl:atom-0072
- Plans/ledgers/v2/pldg-20260703-001-feature-intake/source_shards/external_repo_import_20260703/02_LEDGER_READY_ATOMS.jsonl:extrepo-20260703-0068/P1-PROGRESSIVE-DISCLOSURE-TOOLS-SKILLS@line=68
- Plans/ledgers/v2/pldg-20260703-001-feature-intake/source_shards/external_repo_import_20260703/02_LEDGER_READY_ATOMS.jsonl:extrepo-20260703-0068/P1-PROGRESSIVE-DISCLOSURE-TOOLS-SKILLS
- Plans/ledgers/v2/pldg-20260703-001-feature-intake/source_shards/external_repo_import_20260703/01_FULL_SOURCE_PACKET.md
- Plans/ledgers/v2/pldg-20260703-001-feature-intake/source_shards/external_repo_import_20260703/04_EVIDENCE_REGISTRY.json
- Plans/ledgers/v2/pldg-20260703-001-feature-intake/source_shards/external_repo_import_20260703/raw_source_artifacts/pm_missed_domains_backlog_2026-07-03.jsonl:14
source_atom_ids:
- atom-0072
external_atom_id: extrepo-20260703-0068
source_row_id: P1-PROGRESSIVE-DISCLOSURE-TOOLS-SKILLS
priority: P1
finding_family: Token efficiency for tools, skills, MCP, and docs
source_repos:
- Codex
- OpenCode
- Cline
- Agent Zero
target_docs:
- Plans/Tools.md
- Plans/MCP_Integration.md
- Plans/Models_System.md
- Plans/Prompt_Pipeline.md
owner_hints:
- Plans/Tools.md
- Plans/MCP_Integration.md
- Plans/Models_System.md
- Plans/Prompt_Pipeline.md
preserved_exact_tokens:
- extrepo-20260703-0068
- P1-PROGRESSIVE-DISCLOSURE-TOOLS-SKILLS
- P1
- Token efficiency for tools, skills, MCP, and docs
- Codex
- OpenCode
- Cline
- Agent Zero
negative_constraints: []
observed_signal: Codex Skills use progressive disclosure; OpenCode/Cline show tool/MCP schema bloat; Agent Zero issue notes full tool descriptions repeated into prompts.
pm_current_coverage: PM has MCP schema caps, tool registry, skill/tool GUI surfaces, and tool usage rollups.
pm_gap_or_delta: PM needs an explicit L0/L1/L2 materialization policy for tool, skill, MCP, media, terminal, browser, and memory capabilities.
proposal_or_recommendation: 'Define CapabilityCatalogMaterialization: L0 names/descriptions, L1 selected metadata, L2 full schema/instructions, L3 runtime docs/examples; all permission-filtered and cache-stable.'
compile_disposition: create_new_planunit
```

### T-171 - P0-COMMAND-INVOCATION-CONTRACT

```yaml
plan_unit_id: T-171
unit_type: requirement
status: accepted
owner_doc: Plans/Tools.md
canonical_text: >-
  P0-COMMAND-INVOCATION-CONTRACT (P0) is compiled as canonical Puppet Master intent for Command intent shape: shell-string vs argv vs PowerShell wrapper vs PTY/TUI command: Imported external-repo finding extrepo-20260703-0077 / P0-COMMAND-INVOCATION-CONTRACT (P0). The preserved PM gap/delta is: Terminal protocol/paste safety was covered, but PM still needs an explicit CommandInvocationContract separate from terminal rendering and tool settlement. The observed external-repo signal remains source-lineage evidence: Cline issue #12047 reports structured {command: 'ls -la foo'} being posix_spawned as the entire executable, causing ENOENT. | Codex recent issues include one-shot approval for inspected PowerShell wrappers and command-safety hardening prevents unsafe helpers/hooks/parser execution. | Ghostty paste security fixes show terminal input can become command execution unexpectedly.
gui_related: true
gui_classification_reason: User-visible GUI, built-in terminal, accessibility, visual, multimodal, or desktop surface is directly implicated.
depends_on:
- PDS-003
- PNC-001
unblocks: []
acceptance_criteria:
- Every command tool call states invocation_kind=shell_string|argv|powershell_script|pty_input|tui_automation and interpreter identity.
- Approval UI displays the exact effective command form and quoting/escaping interpretation.
- A shell string cannot be silently executed as argv[0], and argv cannot be silently routed through a shell.
- PowerShell wrapper execution requires inspected-wrapper receipts and one-shot approval when configured.
- No WorkNodes, NodeSeeds, executable queues, implementation files, production build tasks, generated governance artifacts, or governance seal outputs are created by this compile.
validation_surfaces:
- python3 scripts/pm-plan-index.py validate
- python3 scripts/pm-bootstrap-ledger-validate.py Plans/ledgers/v2/pldg-20260703-001-feature-intake
- Every command tool call states invocation_kind=shell_string|argv|powershell_script|pty_input|tui_automation and interpreter identity.
- Approval UI displays the exact effective command form and quoting/escaping interpretation.
- A shell string cannot be silently executed as argv[0], and argv cannot be silently routed through a shell.
- PowerShell wrapper execution requires inspected-wrapper receipts and one-shot approval when configured.
risk_class: p0_terminal_runtime_hardening
reasoning_tier: high
context_scope: terminal_runtime
implementation_surfaces:
- Plans/Tools.md
node_compile_hint:
  mode: p0_command_invocation_contract
  create_worknodes: false
  create_nodeseeds: false
source_lineage:
- pldg-20260703-001-feature-intake:atom-0081
- Plans/ledgers/v2/pldg-20260703-001-feature-intake/records/design_atoms.jsonl:atom-0081
- Plans/ledgers/v2/pldg-20260703-001-feature-intake/source_shards/external_repo_import_20260703/02_LEDGER_READY_ATOMS.jsonl:extrepo-20260703-0077/P0-COMMAND-INVOCATION-CONTRACT@line=77
- Plans/ledgers/v2/pldg-20260703-001-feature-intake/source_shards/external_repo_import_20260703/02_LEDGER_READY_ATOMS.jsonl:extrepo-20260703-0077/P0-COMMAND-INVOCATION-CONTRACT
- Plans/ledgers/v2/pldg-20260703-001-feature-intake/source_shards/external_repo_import_20260703/01_FULL_SOURCE_PACKET.md
- Plans/ledgers/v2/pldg-20260703-001-feature-intake/source_shards/external_repo_import_20260703/04_EVIDENCE_REGISTRY.json
- Plans/ledgers/v2/pldg-20260703-001-feature-intake/source_shards/external_repo_import_20260703/raw_source_artifacts/pm_final_external_repo_closure_backlog_2026-07-03.jsonl:4
source_atom_ids:
- atom-0081
external_atom_id: extrepo-20260703-0077
source_row_id: P0-COMMAND-INVOCATION-CONTRACT
priority: P0
finding_family: 'Command intent shape: shell-string vs argv vs PowerShell wrapper vs PTY/TUI command'
target_docs:
- Tools.md
- Plans/Section15_MVP_Promoted_Features_Spec.md
- Executor_Protocol.md
- Permissions_System.md
- Contracts_V0.md
owner_hints:
- Tools.md
- Plans/Section15_MVP_Promoted_Features_Spec.md
- Executor_Protocol.md
- Permissions_System.md
- Contracts_V0.md
preserved_exact_tokens:
- extrepo-20260703-0077
- P0-COMMAND-INVOCATION-CONTRACT
- P0
- 'Command intent shape: shell-string vs argv vs PowerShell wrapper vs PTY/TUI command'
negative_constraints: []
observed_signal: 'Cline issue #12047 reports structured {command: ''ls -la foo''} being posix_spawned as the entire executable, causing ENOENT. | Codex recent issues include one-shot approval for inspected PowerShell wrappers and command-safety hardening prevents unsafe helpers/hooks/parser execution. | Ghostty paste security fixes show terminal input can become command execution unexpectedly.'
pm_gap_or_delta: Terminal protocol/paste safety was covered, but PM still needs an explicit CommandInvocationContract separate from terminal rendering and tool settlement.
relationship_to_prior_reports: New P0; complements terminal and tool-call settlement.
compile_disposition: create_new_planunit
```

### T-172 - P0-SESSION-TOOL-NAMESPACE-ACTIVATION

```yaml
plan_unit_id: T-172
unit_type: requirement
status: accepted
owner_doc: Plans/Tools.md
canonical_text: >-
  P0-SESSION-TOOL-NAMESPACE-ACTIVATION (P0) is compiled as canonical Puppet Master intent for Runtime-valid plugins/tools that are not actually injected into the session: Imported external-repo finding extrepo-20260703-0078 / P0-SESSION-TOOL-NAMESPACE-ACTIVATION (P0). The preserved PM gap/delta is: Capability catalogs and tool registries were covered, but not the final active-session namespace proof that a tool family is both configured and injected into this run. The observed external-repo signal remains source-lineage evidence: Codex issue #31023 described a Computer Use/plugin/cache/runtime configuration that was valid, but session tools were not injected and node_repl did not start. | Warp and Codex changelogs show explicit tool/plugin/runtime capability stages and immediate tool refreshes. | Cline and Warp both expose imported third-party agent/tool configs and custom model/provider flows.
gui_related: true
gui_classification_reason: User-visible GUI, built-in terminal, accessibility, visual, multimodal, or desktop surface is directly implicated.
depends_on:
- PDS-003
- PNC-001
unblocks: []
acceptance_criteria:
- Each session has ActiveToolNamespaceReceipt with configured, allowed, injected, visible_to_model, visible_to_ui, and startup status per tool namespace.
- Computer-use/browser/device/media tools are denied with explicit reason if model/provider/session does not receive them.
- Tool mentions, UI chips, and model-visible tool schemas are reconciled from the same session namespace snapshot.
- No WorkNodes, NodeSeeds, executable queues, implementation files, production build tasks, generated governance artifacts, or governance seal outputs are created by this compile.
validation_surfaces:
- python3 scripts/pm-plan-index.py validate
- python3 scripts/pm-bootstrap-ledger-validate.py Plans/ledgers/v2/pldg-20260703-001-feature-intake
- Each session has ActiveToolNamespaceReceipt with configured, allowed, injected, visible_to_model, visible_to_ui, and startup status per tool namespace.
- Computer-use/browser/device/media tools are denied with explicit reason if model/provider/session does not receive them.
- Tool mentions, UI chips, and model-visible tool schemas are reconciled from the same session namespace snapshot.
risk_class: p0_terminal_runtime_hardening
reasoning_tier: high
context_scope: terminal_runtime
implementation_surfaces:
- Plans/Tools.md
node_compile_hint:
  mode: p0_session_tool_namespace_activation
  create_worknodes: false
  create_nodeseeds: false
source_lineage:
- pldg-20260703-001-feature-intake:atom-0082
- Plans/ledgers/v2/pldg-20260703-001-feature-intake/records/design_atoms.jsonl:atom-0082
- Plans/ledgers/v2/pldg-20260703-001-feature-intake/source_shards/external_repo_import_20260703/02_LEDGER_READY_ATOMS.jsonl:extrepo-20260703-0078/P0-SESSION-TOOL-NAMESPACE-ACTIVATION@line=78
- Plans/ledgers/v2/pldg-20260703-001-feature-intake/source_shards/external_repo_import_20260703/02_LEDGER_READY_ATOMS.jsonl:extrepo-20260703-0078/P0-SESSION-TOOL-NAMESPACE-ACTIVATION
- Plans/ledgers/v2/pldg-20260703-001-feature-intake/source_shards/external_repo_import_20260703/01_FULL_SOURCE_PACKET.md
- Plans/ledgers/v2/pldg-20260703-001-feature-intake/source_shards/external_repo_import_20260703/04_EVIDENCE_REGISTRY.json
- Plans/ledgers/v2/pldg-20260703-001-feature-intake/source_shards/external_repo_import_20260703/raw_source_artifacts/pm_final_external_repo_closure_backlog_2026-07-03.jsonl:5
source_atom_ids:
- atom-0082
external_atom_id: extrepo-20260703-0078
source_row_id: P0-SESSION-TOOL-NAMESPACE-ACTIVATION
priority: P0
finding_family: Runtime-valid plugins/tools that are not actually injected into the session
target_docs:
- Tools.md
- MCP_Integration.md
- Browser_Integration.md
- Media_Generation_and_Capabilities.md
- FinalGUISpec.md
- Contracts_V0.md
owner_hints:
- Tools.md
- MCP_Integration.md
- Browser_Integration.md
- Media_Generation_and_Capabilities.md
- FinalGUISpec.md
- Contracts_V0.md
preserved_exact_tokens:
- extrepo-20260703-0078
- P0-SESSION-TOOL-NAMESPACE-ACTIVATION
- P0
- Runtime-valid plugins/tools that are not actually injected into the session
negative_constraints: []
observed_signal: 'Codex issue #31023 described a Computer Use/plugin/cache/runtime configuration that was valid, but session tools were not injected and node_repl did not start. | Warp and Codex changelogs show explicit tool/plugin/runtime capability stages and immediate tool refreshes. | Cline and Warp both expose imported third-party agent/tool configs and custom model/provider flows.'
pm_gap_or_delta: Capability catalogs and tool registries were covered, but not the final active-session namespace proof that a tool family is both configured and injected into this run.
relationship_to_prior_reports: Sharpens CapabilityCatalogMaterialization and MultimodalInputSettlement.
compile_disposition: create_new_planunit
```

### T-173 - P0-TOOL-RESULT-TRUTHFULNESS-GATE

```yaml
plan_unit_id: T-173
unit_type: requirement
status: accepted
owner_doc: Plans/Tools.md
canonical_text: >-
  P0-TOOL-RESULT-TRUTHFULNESS-GATE (P0) is compiled as canonical Puppet Master intent for Tool result truthfulness gate: Imported external-repo finding extrepo-20260703-0094 / P0-TOOL-RESULT-TRUTHFULNESS-GATE (P0). The preserved PM gap/delta is: ToolTurnSettlement must forbid fabricated placeholders and non-lossy success when resource retention/parse fails. The observed external-repo signal remains source-lineage evidence: Empty tool output can fabricate image placeholder; malformed JSON/tool-call and raw history pollution issues recur.
gui_related: true
gui_classification_reason: User-visible GUI, built-in terminal, accessibility, visual, multimodal, or desktop surface is directly implicated.
depends_on:
- PDS-003
- PNC-001
unblocks: []
acceptance_criteria:
- Empty output remains empty with reason
- Missing image does not become fake caption
- Malformed JSON records parse error and raw captured bytes
- No WorkNodes, NodeSeeds, executable queues, implementation files, production build tasks, generated governance artifacts, or governance seal outputs are created by this compile.
validation_surfaces:
- python3 scripts/pm-plan-index.py validate
- python3 scripts/pm-bootstrap-ledger-validate.py Plans/ledgers/v2/pldg-20260703-001-feature-intake
- Empty output remains empty with reason
- Missing image does not become fake caption
- Malformed JSON records parse error and raw captured bytes
risk_class: p0_mcp_tools_and_tool_settlement_hardening
reasoning_tier: high
context_scope: mcp_tools_and_tool_settlement
implementation_surfaces:
- Plans/Tools.md
node_compile_hint:
  mode: p0_tool_result_truthfulness_gate
  create_worknodes: false
  create_nodeseeds: false
source_lineage:
- pldg-20260703-001-feature-intake:atom-0098
- Plans/ledgers/v2/pldg-20260703-001-feature-intake/records/design_atoms.jsonl:atom-0098
- Plans/ledgers/v2/pldg-20260703-001-feature-intake/source_shards/external_repo_import_20260703/02_LEDGER_READY_ATOMS.jsonl:extrepo-20260703-0094/P0-TOOL-RESULT-TRUTHFULNESS-GATE@line=94
- Plans/ledgers/v2/pldg-20260703-001-feature-intake/source_shards/external_repo_import_20260703/02_LEDGER_READY_ATOMS.jsonl:extrepo-20260703-0094/P0-TOOL-RESULT-TRUTHFULNESS-GATE
- Plans/ledgers/v2/pldg-20260703-001-feature-intake/source_shards/external_repo_import_20260703/01_FULL_SOURCE_PACKET.md
- Plans/ledgers/v2/pldg-20260703-001-feature-intake/source_shards/external_repo_import_20260703/04_EVIDENCE_REGISTRY.json
- Plans/ledgers/v2/pldg-20260703-001-feature-intake/source_shards/external_repo_import_20260703/raw_source_artifacts/pm_one_more_external_repo_backlog_2026-07-03.jsonl:7
source_atom_ids:
- atom-0098
external_atom_id: extrepo-20260703-0094
source_row_id: P0-TOOL-RESULT-TRUTHFULNESS-GATE
priority: P0
finding_family: Tool result truthfulness gate
source_repos:
- Pi
- Agent Zero
- Cline
- OpenCode
preserved_exact_tokens:
- extrepo-20260703-0094
- P0-TOOL-RESULT-TRUTHFULNESS-GATE
- P0
- Tool result truthfulness gate
- Pi
- Agent Zero
- Cline
- OpenCode
negative_constraints: []
observed_signal: Empty tool output can fabricate image placeholder; malformed JSON/tool-call and raw history pollution issues recur.
pm_gap_or_delta: ToolTurnSettlement must forbid fabricated placeholders and non-lossy success when resource retention/parse fails.
compile_disposition: create_new_planunit
```

### T-174 - tool_output_retention

```yaml
plan_unit_id: T-174
unit_type: requirement
status: accepted
owner_doc: Plans/Tools.md
canonical_text: >-
  tool_output_retention (P0) is compiled as canonical Puppet Master intent for tool_output_retention: Add ToolManagedOutputRef and retention-failure semantics The preserved PM gap/delta is: No hard no-lossy-success rule for managed tool output retention The observed external-repo signal remains source-lineage evidence: OpenCode v2 Tool output bounding/managed storage; large body issues
gui_related: false
gui_classification_reason: Backend/orchestration contract; not itself GUI implementation work.
depends_on:
- PDS-003
- PNC-001
unblocks: []
acceptance_criteria:
- Large output fixtures
- retention failure returns ToolFailure/runtime blocker
- No WorkNodes, NodeSeeds, executable queues, implementation files, production build tasks, generated governance artifacts, or governance seal outputs are created by this compile.
validation_surfaces:
- python3 scripts/pm-plan-index.py validate
- python3 scripts/pm-bootstrap-ledger-validate.py Plans/ledgers/v2/pldg-20260703-001-feature-intake
- Large output fixtures
- retention failure returns ToolFailure/runtime blocker
risk_class: p0_mcp_tools_and_tool_settlement_hardening
reasoning_tier: high
context_scope: mcp_tools_and_tool_settlement
implementation_surfaces:
- Plans/Tools.md
- Plans/Runtime_Artifacts_Panel.md
- Plans/storage-plan.md
node_compile_hint:
  mode: tool_output_retention
  create_worknodes: false
  create_nodeseeds: false
source_lineage:
- pldg-20260703-001-feature-intake:atom-0108
- Plans/ledgers/v2/pldg-20260703-001-feature-intake/records/design_atoms.jsonl:atom-0108
- Plans/ledgers/v2/pldg-20260703-001-feature-intake/source_shards/external_repo_import_20260703/02_LEDGER_READY_ATOMS.jsonl:extrepo-20260703-0104/tool_output_retention@line=104
- Plans/ledgers/v2/pldg-20260703-001-feature-intake/source_shards/external_repo_import_20260703/02_LEDGER_READY_ATOMS.jsonl:extrepo-20260703-0104/tool_output_retention
- Plans/ledgers/v2/pldg-20260703-001-feature-intake/source_shards/external_repo_import_20260703/01_FULL_SOURCE_PACKET.md
- Plans/ledgers/v2/pldg-20260703-001-feature-intake/source_shards/external_repo_import_20260703/04_EVIDENCE_REGISTRY.json
- Plans/ledgers/v2/pldg-20260703-001-feature-intake/source_shards/external_repo_import_20260703/raw_source_artifacts/opencode_pm_plan_change_matrix.csv:6
- Plans/ledgers/v2/pldg-20260703-001-feature-intake/source_shards/external_repo_import_20260703/01_FULL_SOURCE_PACKET.md:3448-3472
source_atom_ids:
- atom-0108
external_atom_id: extrepo-20260703-0104
source_row_id: tool_output_retention
priority: P0
finding_family: tool_output_retention
target_docs:
- Plans/Tools.md
- Plans/Runtime_Artifacts_Panel.md
- Plans/storage-plan.md
owner_hints:
- Plans/Tools.md
- Plans/Runtime_Artifacts_Panel.md
- Plans/storage-plan.md
preserved_exact_tokens:
- extrepo-20260703-0104
- tool_output_retention
- P0
negative_constraints: []
observed_signal: OpenCode v2 Tool output bounding/managed storage; large body issues
pm_current_coverage: Timeouts and content_ref/map_ref patterns exist
pm_gap_or_delta: No hard no-lossy-success rule for managed tool output retention
proposal_or_recommendation: Add ToolManagedOutputRef and retention-failure semantics
compile_disposition: create_new_planunit
```

### T-175 - tool_heartbeat

```yaml
plan_unit_id: T-175
unit_type: requirement
status: accepted
owner_doc: Plans/Tools.md
canonical_text: >-
  tool_heartbeat (P0) is compiled as canonical Puppet Master intent for tool_heartbeat: Add ToolProgressHeartbeat contract The preserved PM gap/delta is: Need uniform ProgressHeartbeat, max silent interval, visible stalled state The observed external-repo signal remains source-lineage evidence: OpenCode indefinite task/tool hang issues; MCP progress timeout reset fixes
gui_related: true
gui_classification_reason: User-visible GUI, built-in terminal, accessibility, visual, multimodal, or desktop surface is directly implicated.
depends_on:
- PDS-003
- PNC-001
unblocks: []
acceptance_criteria:
- Long-running MCP/subagent/browser/device tests
- No WorkNodes, NodeSeeds, executable queues, implementation files, production build tasks, generated governance artifacts, or governance seal outputs are created by this compile.
validation_surfaces:
- python3 scripts/pm-plan-index.py validate
- python3 scripts/pm-bootstrap-ledger-validate.py Plans/ledgers/v2/pldg-20260703-001-feature-intake
- Long-running MCP/subagent/browser/device tests
risk_class: p0_mcp_tools_and_tool_settlement_hardening
reasoning_tier: high
context_scope: mcp_tools_and_tool_settlement
implementation_surfaces:
- Plans/Tools.md
- Plans/Executor_Protocol.md
- Plans/MCP_Integration.md
- Plans/Automated_Testing_System.md
node_compile_hint:
  mode: tool_heartbeat
  create_worknodes: false
  create_nodeseeds: false
source_lineage:
- pldg-20260703-001-feature-intake:atom-0109
- Plans/ledgers/v2/pldg-20260703-001-feature-intake/records/design_atoms.jsonl:atom-0109
- Plans/ledgers/v2/pldg-20260703-001-feature-intake/source_shards/external_repo_import_20260703/02_LEDGER_READY_ATOMS.jsonl:extrepo-20260703-0105/tool_heartbeat@line=105
- Plans/ledgers/v2/pldg-20260703-001-feature-intake/source_shards/external_repo_import_20260703/02_LEDGER_READY_ATOMS.jsonl:extrepo-20260703-0105/tool_heartbeat
- Plans/ledgers/v2/pldg-20260703-001-feature-intake/source_shards/external_repo_import_20260703/01_FULL_SOURCE_PACKET.md
- Plans/ledgers/v2/pldg-20260703-001-feature-intake/source_shards/external_repo_import_20260703/04_EVIDENCE_REGISTRY.json
- Plans/ledgers/v2/pldg-20260703-001-feature-intake/source_shards/external_repo_import_20260703/raw_source_artifacts/opencode_pm_plan_change_matrix.csv:7
- Plans/ledgers/v2/pldg-20260703-001-feature-intake/source_shards/external_repo_import_20260703/01_FULL_SOURCE_PACKET.md:3448-3472
source_atom_ids:
- atom-0109
external_atom_id: extrepo-20260703-0105
source_row_id: tool_heartbeat
priority: P0
finding_family: tool_heartbeat
target_docs:
- Plans/Tools.md
- Plans/Executor_Protocol.md
- Plans/MCP_Integration.md
- Plans/Automated_Testing_System.md
owner_hints:
- Plans/Tools.md
- Plans/Executor_Protocol.md
- Plans/MCP_Integration.md
- Plans/Automated_Testing_System.md
preserved_exact_tokens:
- extrepo-20260703-0105
- tool_heartbeat
- P0
negative_constraints: []
observed_signal: OpenCode indefinite task/tool hang issues; MCP progress timeout reset fixes
pm_current_coverage: Timeouts for many tool classes exist
pm_gap_or_delta: Need uniform ProgressHeartbeat, max silent interval, visible stalled state
proposal_or_recommendation: Add ToolProgressHeartbeat contract
compile_disposition: create_new_planunit
```
