# Shard 018: Ledger Compile Addendum - pldg-20260703-001-feature-intake

Source: `Plans/Prompt_Pipeline.md`

Source lines: L4014-L5018

Source SHA256: `c9e42dad47823889bfcbf99bf1c29c9c42da839afb6f77a0dc8857b9c4ec7d50`

---

## Ledger Compile Addendum - pldg-20260703-001-feature-intake

This addendum compiles source-lineage obligations from bootstrap ledger `pldg-20260703-001-feature-intake` into this owner doc. The ledger remains source/planning memory; these PlanUnits are the live canonical evidence. This compile does not create WorkNodes, NodeSeeds, executable queues, implementation files, production build tasks, generated governance artifacts, or a governance seal.

### PP-059 - P1-CONTEXT-SKILL-BUDGETS

```yaml
plan_unit_id: PP-059
unit_type: requirement
status: accepted
owner_doc: Plans/Prompt_Pipeline.md
canonical_text: >-
  P1-CONTEXT-SKILL-BUDGETS (P1) is compiled as canonical Puppet Master intent for Skill/context catalog progressive disclosure: Add ContextCatalogBudget for skills, MCP tools, provider models, memories, and terminal transcript summaries. The preserved PM gap/delta is: Need explicit skill/tool/catalog listing budgets and omission warnings in GUI. The observed external-repo signal remains source-lineage evidence: Codex official skills docs use progressive disclosure and cap initial skill listing at 2% context or 8k chars; Cline/Agent Zero/Pi all hit compaction/context/provider issues.
gui_related: true
gui_classification_reason: User-visible GUI, built-in terminal, accessibility, visual, multimodal, or desktop surface is directly implicated.
depends_on:
- PDS-003
- PNC-001
unblocks: []
acceptance_criteria:
- Skill list cannot crowd out run context; omitted skills/tools are visible in context inspector with reason.
- Selected skill loads full instructions only when chosen.
- No WorkNodes, NodeSeeds, executable queues, implementation files, production build tasks, generated governance artifacts, or governance seal outputs are created by this compile.
validation_surfaces:
- python3 scripts/pm-plan-index.py validate
- python3 scripts/pm-bootstrap-ledger-validate.py Plans/ledgers/v2/pldg-20260703-001-feature-intake
- Skill list cannot crowd out run context; omitted skills/tools are visible in context inspector with reason.
- Selected skill loads full instructions only when chosen.
risk_class: p1_context_cache_hardening
reasoning_tier: standard
context_scope: context_cache
implementation_surfaces:
- Plans/Prompt_Pipeline.md
- Plans/Skills_System.md
- Plans/Tools.md
- Plans/Models_System.md
node_compile_hint:
  mode: p1_context_skill_budgets
  create_worknodes: false
  create_nodeseeds: false
source_lineage:
- pldg-20260703-001-feature-intake:atom-0018
- Plans/ledgers/v2/pldg-20260703-001-feature-intake/records/design_atoms.jsonl:atom-0018
- Plans/ledgers/v2/pldg-20260703-001-feature-intake/source_shards/external_repo_import_20260703/02_LEDGER_READY_ATOMS.jsonl:extrepo-20260703-0014/P1-CONTEXT-SKILL-BUDGETS@line=14
- Plans/ledgers/v2/pldg-20260703-001-feature-intake/source_shards/external_repo_import_20260703/02_LEDGER_READY_ATOMS.jsonl:extrepo-20260703-0014/P1-CONTEXT-SKILL-BUDGETS
- Plans/ledgers/v2/pldg-20260703-001-feature-intake/source_shards/external_repo_import_20260703/01_FULL_SOURCE_PACKET.md
- Plans/ledgers/v2/pldg-20260703-001-feature-intake/source_shards/external_repo_import_20260703/04_EVIDENCE_REGISTRY.json
- Plans/ledgers/v2/pldg-20260703-001-feature-intake/source_shards/external_repo_import_20260703/raw_source_artifacts/pm_external_repo_action_backlog_2026-07-03.jsonl:14
- Plans/ledgers/v2/pldg-20260703-001-feature-intake/source_shards/external_repo_import_20260703/01_FULL_SOURCE_PACKET.md:833-1329
source_atom_ids:
- atom-0018
external_atom_id: extrepo-20260703-0014
source_row_id: P1-CONTEXT-SKILL-BUDGETS
priority: P1
finding_family: Skill/context catalog progressive disclosure
source_repos:
- openai/codex
- cline/cline
- earendil-works/pi
target_docs:
- Plans/Prompt_Pipeline.md
- Plans/Skills_System.md
- Plans/Tools.md
- Plans/Models_System.md
owner_hints:
- Plans/Prompt_Pipeline.md
- Plans/Skills_System.md
- Plans/Tools.md
- Plans/Models_System.md
preserved_exact_tokens:
- extrepo-20260703-0014
- P1-CONTEXT-SKILL-BUDGETS
- P1
- Skill/context catalog progressive disclosure
- openai/codex
- cline/cline
- earendil-works/pi
negative_constraints: []
observed_signal: Codex official skills docs use progressive disclosure and cap initial skill listing at 2% context or 8k chars; Cline/Agent Zero/Pi all hit compaction/context/provider issues.
pm_current_coverage: PM Prompt Pipeline owns skill bundling and compaction algorithms.
pm_gap_or_delta: Need explicit skill/tool/catalog listing budgets and omission warnings in GUI.
proposal_or_recommendation: Add ContextCatalogBudget for skills, MCP tools, provider models, memories, and terminal transcript summaries.
compile_disposition: create_new_planunit
```

### PP-060 - P0-HISTORY-ADMISSION-SANITIZATION

```yaml
plan_unit_id: PP-060
unit_type: requirement
status: accepted
owner_doc: Plans/Prompt_Pipeline.md
canonical_text: >-
  P0-HISTORY-ADMISSION-SANITIZATION (P0) is compiled as canonical Puppet Master intent for Malformed provider/tool turns must not poison durable history: Imported external-repo finding extrepo-20260703-0022 / P0-HISTORY-ADMISSION-SANITIZATION (P0). The preserved PM gap/delta is: Add a HistoryAdmissionGate before persistence/replay for assistant/tool turns with name/id/JSON/type/reasoning/role checks and quarantine outcomes. The observed external-repo signal remains source-lineage evidence: Pi reports JSON plus trailing reasoning, same-delta content/reasoning/tool calls, empty/duplicate tool calls, and stringified MCP params; Agent Zero issue list includes truncated tool calls treated as success.
gui_related: true
gui_classification_reason: User-visible GUI, built-in terminal, accessibility, visual, multimodal, or desktop surface is directly implicated.
depends_on:
- PDS-003
- PNC-001
unblocks: []
acceptance_criteria:
- Malformed empty tool name quarantined and not replayed
- JSON tool args followed by reasoning text recovered or rejected deterministically
- Length-truncated tool call cannot be persisted as success
- No WorkNodes, NodeSeeds, executable queues, implementation files, production build tasks, generated governance artifacts, or governance seal outputs are created by this compile.
validation_surfaces:
- python3 scripts/pm-plan-index.py validate
- python3 scripts/pm-bootstrap-ledger-validate.py Plans/ledgers/v2/pldg-20260703-001-feature-intake
- Malformed empty tool name quarantined and not replayed
- JSON tool args followed by reasoning text recovered or rejected deterministically
- Length-truncated tool call cannot be persisted as success
risk_class: p0_provider_capability_and_metadata_hardening
reasoning_tier: high
context_scope: provider_capability_and_metadata
implementation_surfaces:
- Plans/Prompt_Pipeline.md
- Plans/storage-plan.md
- Plans/Tools.md
- Plans/CLI_Bridged_Providers.md
node_compile_hint:
  mode: p0_history_admission_sanitization
  create_worknodes: false
  create_nodeseeds: false
source_lineage:
- pldg-20260703-001-feature-intake:atom-0026
- Plans/ledgers/v2/pldg-20260703-001-feature-intake/records/design_atoms.jsonl:atom-0026
- Plans/ledgers/v2/pldg-20260703-001-feature-intake/source_shards/external_repo_import_20260703/02_LEDGER_READY_ATOMS.jsonl:extrepo-20260703-0022/P0-HISTORY-ADMISSION-SANITIZATION@line=22
- Plans/ledgers/v2/pldg-20260703-001-feature-intake/source_shards/external_repo_import_20260703/02_LEDGER_READY_ATOMS.jsonl:extrepo-20260703-0022/P0-HISTORY-ADMISSION-SANITIZATION
- Plans/ledgers/v2/pldg-20260703-001-feature-intake/source_shards/external_repo_import_20260703/01_FULL_SOURCE_PACKET.md
- Plans/ledgers/v2/pldg-20260703-001-feature-intake/source_shards/external_repo_import_20260703/04_EVIDENCE_REGISTRY.json
- Plans/ledgers/v2/pldg-20260703-001-feature-intake/source_shards/external_repo_import_20260703/raw_source_artifacts/pm_second_pass_delta_backlog_2026-07-03.jsonl:2
source_atom_ids:
- atom-0026
external_atom_id: extrepo-20260703-0022
source_row_id: P0-HISTORY-ADMISSION-SANITIZATION
priority: P0
finding_family: Malformed provider/tool turns must not poison durable history
source_repos:
- earendil-works/pi
- agent0ai/agent-zero
- anomalyco/opencode
target_docs:
- Plans/Prompt_Pipeline.md
- Plans/storage-plan.md
- Plans/Tools.md
- Plans/CLI_Bridged_Providers.md
owner_hints:
- Plans/Prompt_Pipeline.md
- Plans/storage-plan.md
- Plans/Tools.md
- Plans/CLI_Bridged_Providers.md
preserved_exact_tokens:
- extrepo-20260703-0022
- P0-HISTORY-ADMISSION-SANITIZATION
- P0
- Malformed provider/tool turns must not poison durable history
- earendil-works/pi
- agent0ai/agent-zero
- anomalyco/opencode
negative_constraints: []
observed_signal: Pi reports JSON plus trailing reasoning, same-delta content/reasoning/tool calls, empty/duplicate tool calls, and stringified MCP params; Agent Zero issue list includes truncated tool calls treated as success.
pm_current_coverage: Tools T-077/T-078 already reject invalid args and truncated invocations before dispatch or success.
pm_gap_or_delta: Add a HistoryAdmissionGate before persistence/replay for assistant/tool turns with name/id/JSON/type/reasoning/role checks and quarantine outcomes.
compile_disposition: create_new_planunit
```

### PP-061 - P0-CONTEXT-EPOCH-BASELINE

```yaml
plan_unit_id: PP-061
unit_type: requirement
status: accepted
owner_doc: Plans/Prompt_Pipeline.md
canonical_text: >-
  P0-CONTEXT-EPOCH-BASELINE (P0) is compiled as canonical Puppet Master intent for Add ContextEpoch and stable baseline context: Provider turns reference context_epoch_id; baseline hash stable across volatile date/git/file-list changes; compaction/model/provider switches create explicit epoch outcomes.
gui_related: false
gui_classification_reason: Backend/orchestration contract; not itself GUI implementation work.
depends_on:
- PDS-003
- PNC-001
unblocks: []
acceptance_criteria:
- Provider turns reference context_epoch_id
- baseline hash stable across volatile date/git/file-list changes
- compaction/model/provider switches create explicit epoch outcomes.
- No WorkNodes, NodeSeeds, executable queues, implementation files, production build tasks, generated governance artifacts, or governance seal outputs are created by this compile.
validation_surfaces:
- python3 scripts/pm-plan-index.py validate
- python3 scripts/pm-bootstrap-ledger-validate.py Plans/ledgers/v2/pldg-20260703-001-feature-intake
- Provider turns reference context_epoch_id
- baseline hash stable across volatile date/git/file-list changes
- compaction/model/provider switches create explicit epoch outcomes.
risk_class: p0_context_cache_hardening
reasoning_tier: high
context_scope: context_cache
implementation_surfaces:
- Plans/Prompt_Pipeline.md
- Plans/storage-plan.md
- Plans/Models_System.md
- Plans/usage-feature.md
node_compile_hint:
  mode: p0_context_epoch_baseline
  create_worknodes: false
  create_nodeseeds: false
source_lineage:
- pldg-20260703-001-feature-intake:atom-0041
- Plans/ledgers/v2/pldg-20260703-001-feature-intake/records/design_atoms.jsonl:atom-0041
- Plans/ledgers/v2/pldg-20260703-001-feature-intake/source_shards/external_repo_import_20260703/02_LEDGER_READY_ATOMS.jsonl:extrepo-20260703-0037/P0-CONTEXT-EPOCH-BASELINE@line=37
- Plans/ledgers/v2/pldg-20260703-001-feature-intake/source_shards/external_repo_import_20260703/02_LEDGER_READY_ATOMS.jsonl:extrepo-20260703-0037/P0-CONTEXT-EPOCH-BASELINE
- Plans/ledgers/v2/pldg-20260703-001-feature-intake/source_shards/external_repo_import_20260703/01_FULL_SOURCE_PACKET.md
- Plans/ledgers/v2/pldg-20260703-001-feature-intake/source_shards/external_repo_import_20260703/04_EVIDENCE_REGISTRY.json
- Plans/ledgers/v2/pldg-20260703-001-feature-intake/source_shards/external_repo_import_20260703/raw_source_artifacts/pm_context_cache_websocket_backlog_2026-07-03.jsonl:1
source_atom_ids:
- atom-0041
external_atom_id: extrepo-20260703-0037
source_row_id: P0-CONTEXT-EPOCH-BASELINE
priority: P0
finding_family: Add ContextEpoch and stable baseline context
target_docs:
- Plans/Prompt_Pipeline.md
- Plans/storage-plan.md
- Plans/Models_System.md
- Plans/usage-feature.md
owner_hints:
- Plans/Prompt_Pipeline.md
- Plans/storage-plan.md
- Plans/Models_System.md
- Plans/usage-feature.md
preserved_exact_tokens:
- extrepo-20260703-0037
- P0-CONTEXT-EPOCH-BASELINE
- P0
- Add ContextEpoch and stable baseline context
negative_constraints: []
proposal_or_recommendation: Provider turns reference context_epoch_id; baseline hash stable across volatile date/git/file-list changes; compaction/model/provider switches create explicit epoch outcomes.
compile_disposition: create_new_planunit
```

### PP-062 - P0-PROMPT-CACHE-POLICY

```yaml
plan_unit_id: PP-062
unit_type: requirement
status: accepted
owner_doc: Plans/Prompt_Pipeline.md
canonical_text: >-
  P0-PROMPT-CACHE-POLICY (P0) is compiled as canonical Puppet Master intent for Add provider-neutral prompt cache policy plus provider adapters: Cache support states distinguish automatic, explicit, implicit, unsupported, unknown, not reported, and disabled; adapter fixtures cover OpenAI, Anthropic/Bedrock/Vertex, Gemini, Alibaba/Qwen, and OpenCode bridge evidence.
gui_related: true
gui_classification_reason: User-visible GUI, built-in terminal, accessibility, visual, multimodal, or desktop surface is directly implicated.
depends_on:
- PDS-003
- PNC-001
unblocks: []
acceptance_criteria:
- Cache support states distinguish automatic, explicit, implicit, unsupported, unknown, not reported, and disabled
- adapter fixtures cover OpenAI, Anthropic/Bedrock/Vertex, Gemini, Alibaba/Qwen, and OpenCode bridge evidence.
- No WorkNodes, NodeSeeds, executable queues, implementation files, production build tasks, generated governance artifacts, or governance seal outputs are created by this compile.
validation_surfaces:
- python3 scripts/pm-plan-index.py validate
- python3 scripts/pm-bootstrap-ledger-validate.py Plans/ledgers/v2/pldg-20260703-001-feature-intake
- Cache support states distinguish automatic, explicit, implicit, unsupported, unknown, not reported, and disabled
- adapter fixtures cover OpenAI, Anthropic/Bedrock/Vertex, Gemini, Alibaba/Qwen, and OpenCode bridge evidence.
risk_class: p0_context_cache_hardening
reasoning_tier: high
context_scope: context_cache
implementation_surfaces:
- Plans/Prompt_Pipeline.md
- Plans/Models_System.md
- Plans/Provider_OpenCode.md
- Plans/CLI_Bridged_Providers.md
- Plans/usage-feature.md
node_compile_hint:
  mode: p0_prompt_cache_policy
  create_worknodes: false
  create_nodeseeds: false
source_lineage:
- pldg-20260703-001-feature-intake:atom-0042
- Plans/ledgers/v2/pldg-20260703-001-feature-intake/records/design_atoms.jsonl:atom-0042
- Plans/ledgers/v2/pldg-20260703-001-feature-intake/source_shards/external_repo_import_20260703/02_LEDGER_READY_ATOMS.jsonl:extrepo-20260703-0038/P0-PROMPT-CACHE-POLICY@line=38
- Plans/ledgers/v2/pldg-20260703-001-feature-intake/source_shards/external_repo_import_20260703/02_LEDGER_READY_ATOMS.jsonl:extrepo-20260703-0038/P0-PROMPT-CACHE-POLICY
- Plans/ledgers/v2/pldg-20260703-001-feature-intake/source_shards/external_repo_import_20260703/01_FULL_SOURCE_PACKET.md
- Plans/ledgers/v2/pldg-20260703-001-feature-intake/source_shards/external_repo_import_20260703/04_EVIDENCE_REGISTRY.json
- Plans/ledgers/v2/pldg-20260703-001-feature-intake/source_shards/external_repo_import_20260703/raw_source_artifacts/pm_context_cache_websocket_backlog_2026-07-03.jsonl:2
source_atom_ids:
- atom-0042
external_atom_id: extrepo-20260703-0038
source_row_id: P0-PROMPT-CACHE-POLICY
priority: P0
finding_family: Add provider-neutral prompt cache policy plus provider adapters
target_docs:
- Plans/Models_System.md
- Plans/Provider_OpenCode.md
- Plans/CLI_Bridged_Providers.md
- Plans/usage-feature.md
owner_hints:
- Plans/Models_System.md
- Plans/Provider_OpenCode.md
- Plans/CLI_Bridged_Providers.md
- Plans/usage-feature.md
preserved_exact_tokens:
- extrepo-20260703-0038
- P0-PROMPT-CACHE-POLICY
- P0
- Add provider-neutral prompt cache policy plus provider adapters
negative_constraints: []
proposal_or_recommendation: Cache support states distinguish automatic, explicit, implicit, unsupported, unknown, not reported, and disabled; adapter fixtures cover OpenAI, Anthropic/Bedrock/Vertex, Gemini, Alibaba/Qwen, and OpenCode bridge evidence.
compile_disposition: create_new_planunit
```

### PP-063 - P0-VOLATILE-CONTEXT-QUARANTINE

```yaml
plan_unit_id: PP-063
unit_type: requirement
status: accepted
owner_doc: Plans/Prompt_Pipeline.md
canonical_text: >-
  P0-VOLATILE-CONTEXT-QUARANTINE (P0) is compiled as canonical Puppet Master intent for Separate volatile context from cacheable baseline: Date/workspace root/git flag/file-list/active pane changes do not mutate baseline prompt; they enter metadata or mid-conversation update at safe boundary.
gui_related: true
gui_classification_reason: Target docs include GUI/UI command or user-visible surfaces; mixed work is conservatively GUI-related.
depends_on:
- PDS-003
- PNC-001
unblocks: []
acceptance_criteria:
- Date/workspace root/git flag/file-list/active pane changes do not mutate baseline prompt
- they enter metadata or mid-conversation update at safe boundary.
- No WorkNodes, NodeSeeds, executable queues, implementation files, production build tasks, generated governance artifacts, or governance seal outputs are created by this compile.
validation_surfaces:
- python3 scripts/pm-plan-index.py validate
- python3 scripts/pm-bootstrap-ledger-validate.py Plans/ledgers/v2/pldg-20260703-001-feature-intake
- Date/workspace root/git flag/file-list/active pane changes do not mutate baseline prompt
- they enter metadata or mid-conversation update at safe boundary.
risk_class: p0_context_cache_hardening
reasoning_tier: high
context_scope: context_cache
implementation_surfaces:
- Plans/Prompt_Pipeline.md
- Plans/assistant-chat-design.md
node_compile_hint:
  mode: p0_volatile_context_quarantine
  create_worknodes: false
  create_nodeseeds: false
source_lineage:
- pldg-20260703-001-feature-intake:atom-0044
- Plans/ledgers/v2/pldg-20260703-001-feature-intake/records/design_atoms.jsonl:atom-0044
- Plans/ledgers/v2/pldg-20260703-001-feature-intake/source_shards/external_repo_import_20260703/02_LEDGER_READY_ATOMS.jsonl:extrepo-20260703-0040/P0-VOLATILE-CONTEXT-QUARANTINE@line=40
- Plans/ledgers/v2/pldg-20260703-001-feature-intake/source_shards/external_repo_import_20260703/02_LEDGER_READY_ATOMS.jsonl:extrepo-20260703-0040/P0-VOLATILE-CONTEXT-QUARANTINE
- Plans/ledgers/v2/pldg-20260703-001-feature-intake/source_shards/external_repo_import_20260703/01_FULL_SOURCE_PACKET.md
- Plans/ledgers/v2/pldg-20260703-001-feature-intake/source_shards/external_repo_import_20260703/04_EVIDENCE_REGISTRY.json
- Plans/ledgers/v2/pldg-20260703-001-feature-intake/source_shards/external_repo_import_20260703/raw_source_artifacts/pm_context_cache_websocket_backlog_2026-07-03.jsonl:4
source_atom_ids:
- atom-0044
external_atom_id: extrepo-20260703-0040
source_row_id: P0-VOLATILE-CONTEXT-QUARANTINE
priority: P0
finding_family: Separate volatile context from cacheable baseline
target_docs:
- Plans/Prompt_Pipeline.md
- Plans/assistant-chat-design.md
owner_hints:
- Plans/Prompt_Pipeline.md
- Plans/assistant-chat-design.md
preserved_exact_tokens:
- extrepo-20260703-0040
- P0-VOLATILE-CONTEXT-QUARANTINE
- P0
- Separate volatile context from cacheable baseline
negative_constraints: []
proposal_or_recommendation: Date/workspace root/git flag/file-list/active pane changes do not mutate baseline prompt; they enter metadata or mid-conversation update at safe boundary.
compile_disposition: create_new_planunit
```

### PP-064 - P1-COMPACTION-CACHE-EFFECT

```yaml
plan_unit_id: PP-064
unit_type: requirement
status: accepted
owner_doc: Plans/Prompt_Pipeline.md
canonical_text: >-
  P1-COMPACTION-CACHE-EFFECT (P1) is compiled as canonical Puppet Master intent for Make compaction cache impact explicit: Compaction starts/continues epoch per rule; UI and usage explain cache lineage effect; manual compact does not mint lineage without logical context change.
gui_related: true
gui_classification_reason: User-visible GUI, built-in terminal, accessibility, visual, multimodal, or desktop surface is directly implicated.
depends_on:
- PDS-003
- PNC-001
unblocks: []
acceptance_criteria:
- Compaction starts/continues epoch per rule
- UI and usage explain cache lineage effect
- manual compact does not mint lineage without logical context change.
- No WorkNodes, NodeSeeds, executable queues, implementation files, production build tasks, generated governance artifacts, or governance seal outputs are created by this compile.
validation_surfaces:
- python3 scripts/pm-plan-index.py validate
- python3 scripts/pm-bootstrap-ledger-validate.py Plans/ledgers/v2/pldg-20260703-001-feature-intake
- Compaction starts/continues epoch per rule
- UI and usage explain cache lineage effect
- manual compact does not mint lineage without logical context change.
risk_class: p1_context_cache_hardening
reasoning_tier: standard
context_scope: context_cache
implementation_surfaces:
- Plans/Prompt_Pipeline.md
- Plans/Automated_Testing_System.md
- Plans/usage-feature.md
node_compile_hint:
  mode: p1_compaction_cache_effect
  create_worknodes: false
  create_nodeseeds: false
source_lineage:
- pldg-20260703-001-feature-intake:atom-0049
- Plans/ledgers/v2/pldg-20260703-001-feature-intake/records/design_atoms.jsonl:atom-0049
- Plans/ledgers/v2/pldg-20260703-001-feature-intake/source_shards/external_repo_import_20260703/02_LEDGER_READY_ATOMS.jsonl:extrepo-20260703-0045/P1-COMPACTION-CACHE-EFFECT@line=45
- Plans/ledgers/v2/pldg-20260703-001-feature-intake/source_shards/external_repo_import_20260703/02_LEDGER_READY_ATOMS.jsonl:extrepo-20260703-0045/P1-COMPACTION-CACHE-EFFECT
- Plans/ledgers/v2/pldg-20260703-001-feature-intake/source_shards/external_repo_import_20260703/01_FULL_SOURCE_PACKET.md
- Plans/ledgers/v2/pldg-20260703-001-feature-intake/source_shards/external_repo_import_20260703/04_EVIDENCE_REGISTRY.json
- Plans/ledgers/v2/pldg-20260703-001-feature-intake/source_shards/external_repo_import_20260703/raw_source_artifacts/pm_context_cache_websocket_backlog_2026-07-03.jsonl:9
source_atom_ids:
- atom-0049
external_atom_id: extrepo-20260703-0045
source_row_id: P1-COMPACTION-CACHE-EFFECT
priority: P1
finding_family: Make compaction cache impact explicit
target_docs:
- Plans/Prompt_Pipeline.md
- Plans/Automated_Testing_System.md
- Plans/usage-feature.md
owner_hints:
- Plans/Prompt_Pipeline.md
- Plans/Automated_Testing_System.md
- Plans/usage-feature.md
preserved_exact_tokens:
- extrepo-20260703-0045
- P1-COMPACTION-CACHE-EFFECT
- P1
- Make compaction cache impact explicit
negative_constraints: []
proposal_or_recommendation: Compaction starts/continues epoch per rule; UI and usage explain cache lineage effect; manual compact does not mint lineage without logical context change.
compile_disposition: create_new_planunit
```

### PP-065 - P1-PROVIDER-CAPABILITY-EPOCH-CACHE

```yaml
plan_unit_id: PP-065
unit_type: requirement
status: accepted
owner_doc: Plans/Prompt_Pipeline.md
canonical_text: >-
  P1-PROVIDER-CAPABILITY-EPOCH-CACHE (P1) is compiled as canonical Puppet Master intent for Extend provider capability epoch with cache/freshness/source metadata: Model metadata source/freshness/account/route-limit/cache support are recorded; stale/ghost model or route-specific limit changes produce explicit capability epoch.
gui_related: false
gui_classification_reason: Backend/orchestration contract; not itself GUI implementation work.
depends_on:
- PDS-003
- PNC-001
unblocks: []
acceptance_criteria:
- Model metadata source/freshness/account/route-limit/cache support are recorded
- stale/ghost model or route-specific limit changes produce explicit capability epoch.
- No WorkNodes, NodeSeeds, executable queues, implementation files, production build tasks, generated governance artifacts, or governance seal outputs are created by this compile.
validation_surfaces:
- python3 scripts/pm-plan-index.py validate
- python3 scripts/pm-bootstrap-ledger-validate.py Plans/ledgers/v2/pldg-20260703-001-feature-intake
- Model metadata source/freshness/account/route-limit/cache support are recorded
- stale/ghost model or route-specific limit changes produce explicit capability epoch.
risk_class: p1_context_cache_hardening
reasoning_tier: standard
context_scope: context_cache
implementation_surfaces:
- Plans/Prompt_Pipeline.md
- Plans/Models_System.md
- Plans/Provider_OpenCode.md
node_compile_hint:
  mode: p1_provider_capability_epoch_cache
  create_worknodes: false
  create_nodeseeds: false
source_lineage:
- pldg-20260703-001-feature-intake:atom-0050
- Plans/ledgers/v2/pldg-20260703-001-feature-intake/records/design_atoms.jsonl:atom-0050
- Plans/ledgers/v2/pldg-20260703-001-feature-intake/source_shards/external_repo_import_20260703/02_LEDGER_READY_ATOMS.jsonl:extrepo-20260703-0046/P1-PROVIDER-CAPABILITY-EPOCH-CACHE@line=46
- Plans/ledgers/v2/pldg-20260703-001-feature-intake/source_shards/external_repo_import_20260703/02_LEDGER_READY_ATOMS.jsonl:extrepo-20260703-0046/P1-PROVIDER-CAPABILITY-EPOCH-CACHE
- Plans/ledgers/v2/pldg-20260703-001-feature-intake/source_shards/external_repo_import_20260703/01_FULL_SOURCE_PACKET.md
- Plans/ledgers/v2/pldg-20260703-001-feature-intake/source_shards/external_repo_import_20260703/04_EVIDENCE_REGISTRY.json
- Plans/ledgers/v2/pldg-20260703-001-feature-intake/source_shards/external_repo_import_20260703/raw_source_artifacts/pm_context_cache_websocket_backlog_2026-07-03.jsonl:10
source_atom_ids:
- atom-0050
external_atom_id: extrepo-20260703-0046
source_row_id: P1-PROVIDER-CAPABILITY-EPOCH-CACHE
priority: P1
finding_family: Extend provider capability epoch with cache/freshness/source metadata
target_docs:
- Plans/Models_System.md
- Plans/Provider_OpenCode.md
owner_hints:
- Plans/Models_System.md
- Plans/Provider_OpenCode.md
preserved_exact_tokens:
- extrepo-20260703-0046
- P1-PROVIDER-CAPABILITY-EPOCH-CACHE
- P1
- Extend provider capability epoch with cache/freshness/source metadata
negative_constraints: []
proposal_or_recommendation: Model metadata source/freshness/account/route-limit/cache support are recorded; stale/ghost model or route-specific limit changes produce explicit capability epoch.
compile_disposition: create_new_planunit
```

### PP-066 - P1-MODEL-SWITCH-REPLAY-SANITIZER

```yaml
plan_unit_id: PP-066
unit_type: requirement
status: accepted
owner_doc: Plans/Prompt_Pipeline.md
canonical_text: >-
  P1-MODEL-SWITCH-REPLAY-SANITIZER (P1) is compiled as canonical Puppet Master intent for Sanitize provider-native reasoning/item/cache metadata on model switch: Provider-native reasoning signatures/item ids/cache keys/tool histories are retained only when compatible; otherwise dropped with replay receipt.
gui_related: false
gui_classification_reason: Backend/orchestration contract; not itself GUI implementation work.
depends_on:
- PDS-003
- PNC-001
unblocks: []
acceptance_criteria:
- Provider-native reasoning signatures/item ids/cache keys/tool histories are retained only when compatible
- otherwise dropped with replay receipt.
- No WorkNodes, NodeSeeds, executable queues, implementation files, production build tasks, generated governance artifacts, or governance seal outputs are created by this compile.
validation_surfaces:
- python3 scripts/pm-plan-index.py validate
- python3 scripts/pm-bootstrap-ledger-validate.py Plans/ledgers/v2/pldg-20260703-001-feature-intake
- Provider-native reasoning signatures/item ids/cache keys/tool histories are retained only when compatible
- otherwise dropped with replay receipt.
risk_class: p1_context_cache_hardening
reasoning_tier: standard
context_scope: context_cache
implementation_surfaces:
- Plans/Prompt_Pipeline.md
- Plans/Models_System.md
- Plans/CLI_Bridged_Providers.md
node_compile_hint:
  mode: p1_model_switch_replay_sanitizer
  create_worknodes: false
  create_nodeseeds: false
source_lineage:
- pldg-20260703-001-feature-intake:atom-0051
- Plans/ledgers/v2/pldg-20260703-001-feature-intake/records/design_atoms.jsonl:atom-0051
- Plans/ledgers/v2/pldg-20260703-001-feature-intake/source_shards/external_repo_import_20260703/02_LEDGER_READY_ATOMS.jsonl:extrepo-20260703-0047/P1-MODEL-SWITCH-REPLAY-SANITIZER@line=47
- Plans/ledgers/v2/pldg-20260703-001-feature-intake/source_shards/external_repo_import_20260703/02_LEDGER_READY_ATOMS.jsonl:extrepo-20260703-0047/P1-MODEL-SWITCH-REPLAY-SANITIZER
- Plans/ledgers/v2/pldg-20260703-001-feature-intake/source_shards/external_repo_import_20260703/01_FULL_SOURCE_PACKET.md
- Plans/ledgers/v2/pldg-20260703-001-feature-intake/source_shards/external_repo_import_20260703/04_EVIDENCE_REGISTRY.json
- Plans/ledgers/v2/pldg-20260703-001-feature-intake/source_shards/external_repo_import_20260703/raw_source_artifacts/pm_context_cache_websocket_backlog_2026-07-03.jsonl:11
source_atom_ids:
- atom-0051
external_atom_id: extrepo-20260703-0047
source_row_id: P1-MODEL-SWITCH-REPLAY-SANITIZER
priority: P1
finding_family: Sanitize provider-native reasoning/item/cache metadata on model switch
target_docs:
- Plans/Models_System.md
- Plans/Prompt_Pipeline.md
- Plans/CLI_Bridged_Providers.md
owner_hints:
- Plans/Models_System.md
- Plans/Prompt_Pipeline.md
- Plans/CLI_Bridged_Providers.md
preserved_exact_tokens:
- extrepo-20260703-0047
- P1-MODEL-SWITCH-REPLAY-SANITIZER
- P1
- Sanitize provider-native reasoning/item/cache metadata on model switch
negative_constraints: []
proposal_or_recommendation: Provider-native reasoning signatures/item ids/cache keys/tool histories are retained only when compatible; otherwise dropped with replay receipt.
compile_disposition: create_new_planunit
```

### PP-067 - P1-LOCAL-LLM-CONTEXT-CAPS

```yaml
plan_unit_id: PP-067
unit_type: requirement
status: accepted
owner_doc: Plans/Prompt_Pipeline.md
canonical_text: >-
  P1-LOCAL-LLM-CONTEXT-CAPS (P1) is compiled as canonical Puppet Master intent for Apply context caps to utility/memory/subagent models: Local utility/memory/subagent contexts enforce model caps and bounded summaries; no hidden full-history stuffing.
gui_related: false
gui_classification_reason: Backend/orchestration contract; not itself GUI implementation work.
depends_on:
- PDS-003
- PNC-001
unblocks: []
acceptance_criteria:
- Local utility/memory/subagent contexts enforce model caps and bounded summaries
- no hidden full-history stuffing.
- No WorkNodes, NodeSeeds, executable queues, implementation files, production build tasks, generated governance artifacts, or governance seal outputs are created by this compile.
validation_surfaces:
- python3 scripts/pm-plan-index.py validate
- python3 scripts/pm-bootstrap-ledger-validate.py Plans/ledgers/v2/pldg-20260703-001-feature-intake
- Local utility/memory/subagent contexts enforce model caps and bounded summaries
- no hidden full-history stuffing.
risk_class: p1_context_cache_hardening
reasoning_tier: standard
context_scope: context_cache
implementation_surfaces:
- Plans/Prompt_Pipeline.md
- Plans/Models_System.md
- Plans/assistant-memory-subsystem.md
- Plans/Goal_Runtime_System.md
node_compile_hint:
  mode: p1_local_llm_context_caps
  create_worknodes: false
  create_nodeseeds: false
source_lineage:
- pldg-20260703-001-feature-intake:atom-0052
- Plans/ledgers/v2/pldg-20260703-001-feature-intake/records/design_atoms.jsonl:atom-0052
- Plans/ledgers/v2/pldg-20260703-001-feature-intake/source_shards/external_repo_import_20260703/02_LEDGER_READY_ATOMS.jsonl:extrepo-20260703-0048/P1-LOCAL-LLM-CONTEXT-CAPS@line=48
- Plans/ledgers/v2/pldg-20260703-001-feature-intake/source_shards/external_repo_import_20260703/02_LEDGER_READY_ATOMS.jsonl:extrepo-20260703-0048/P1-LOCAL-LLM-CONTEXT-CAPS
- Plans/ledgers/v2/pldg-20260703-001-feature-intake/source_shards/external_repo_import_20260703/01_FULL_SOURCE_PACKET.md
- Plans/ledgers/v2/pldg-20260703-001-feature-intake/source_shards/external_repo_import_20260703/04_EVIDENCE_REGISTRY.json
- Plans/ledgers/v2/pldg-20260703-001-feature-intake/source_shards/external_repo_import_20260703/raw_source_artifacts/pm_context_cache_websocket_backlog_2026-07-03.jsonl:12
source_atom_ids:
- atom-0052
external_atom_id: extrepo-20260703-0048
source_row_id: P1-LOCAL-LLM-CONTEXT-CAPS
priority: P1
finding_family: Apply context caps to utility/memory/subagent models
target_docs:
- Plans/Models_System.md
- Plans/assistant-memory-subsystem.md
- Plans/Goal_Runtime_System.md
owner_hints:
- Plans/Models_System.md
- Plans/assistant-memory-subsystem.md
- Plans/Goal_Runtime_System.md
preserved_exact_tokens:
- extrepo-20260703-0048
- P1-LOCAL-LLM-CONTEXT-CAPS
- P1
- Apply context caps to utility/memory/subagent models
negative_constraints: []
proposal_or_recommendation: Local utility/memory/subagent contexts enforce model caps and bounded summaries; no hidden full-history stuffing.
compile_disposition: create_new_planunit
```

### PP-068 - P1-PROMPT-CACHE-STABILITY-LINTER

```yaml
plan_unit_id: PP-068
unit_type: requirement
status: accepted
owner_doc: Plans/Prompt_Pipeline.md
canonical_text: >-
  P1-PROMPT-CACHE-STABILITY-LINTER (P1) is compiled as canonical Puppet Master intent for Prompt/cache/token efficiency hygiene: Add PromptCacheStabilityLinter: stable_prefix_hash, volatile_context_hashes, tool/schema ordering hash, skill catalog slice hash, file-list volatility, date/time/cwd injection warnings, provider cache marker support, and cache hit expectation. The preserved PM gap/delta is: PM should add a linter/diagnostic that explains why cache hit rate is low, not only record usage. The observed external-repo signal remains source-lineage evidence: OpenCode reports system-environment prompt cache invalidation and provider cache-marker gaps; Pi changelog includes prompt caching and cached-token accounting; Codex skills use progressive disclosure; Cline fixes prompt-cache detection and compaction routing.
gui_related: true
gui_classification_reason: User-visible GUI, built-in terminal, accessibility, visual, multimodal, or desktop surface is directly implicated.
depends_on:
- PDS-003
- PNC-001
unblocks: []
acceptance_criteria:
- Two identical tasks show stable prefix preserved.
- Moving cwd/date/git status to late volatile block improves cache expectation.
- Dynamic tool result not placed before stable instructions.
- GUI explains cache miss source.
- No WorkNodes, NodeSeeds, executable queues, implementation files, production build tasks, generated governance artifacts, or governance seal outputs are created by this compile.
validation_surfaces:
- python3 scripts/pm-plan-index.py validate
- python3 scripts/pm-bootstrap-ledger-validate.py Plans/ledgers/v2/pldg-20260703-001-feature-intake
- Two identical tasks show stable prefix preserved.
- Moving cwd/date/git status to late volatile block improves cache expectation.
- Dynamic tool result not placed before stable instructions.
- GUI explains cache miss source.
risk_class: p1_context_cache_hardening
reasoning_tier: standard
context_scope: context_cache
implementation_surfaces:
- Plans/Prompt_Pipeline.md
- Plans/Models_System.md
- Plans/usage-feature.md
- Plans/Tools.md
node_compile_hint:
  mode: p1_prompt_cache_stability_linter
  create_worknodes: false
  create_nodeseeds: false
source_lineage:
- pldg-20260703-001-feature-intake:atom-0071
- Plans/ledgers/v2/pldg-20260703-001-feature-intake/records/design_atoms.jsonl:atom-0071
- Plans/ledgers/v2/pldg-20260703-001-feature-intake/source_shards/external_repo_import_20260703/02_LEDGER_READY_ATOMS.jsonl:extrepo-20260703-0067/P1-PROMPT-CACHE-STABILITY-LINTER@line=67
- Plans/ledgers/v2/pldg-20260703-001-feature-intake/source_shards/external_repo_import_20260703/02_LEDGER_READY_ATOMS.jsonl:extrepo-20260703-0067/P1-PROMPT-CACHE-STABILITY-LINTER
- Plans/ledgers/v2/pldg-20260703-001-feature-intake/source_shards/external_repo_import_20260703/01_FULL_SOURCE_PACKET.md
- Plans/ledgers/v2/pldg-20260703-001-feature-intake/source_shards/external_repo_import_20260703/04_EVIDENCE_REGISTRY.json
- Plans/ledgers/v2/pldg-20260703-001-feature-intake/source_shards/external_repo_import_20260703/raw_source_artifacts/pm_missed_domains_backlog_2026-07-03.jsonl:13
source_atom_ids:
- atom-0071
external_atom_id: extrepo-20260703-0067
source_row_id: P1-PROMPT-CACHE-STABILITY-LINTER
priority: P1
finding_family: Prompt/cache/token efficiency hygiene
source_repos:
- OpenCode
- Cline
- Pi
- Codex
target_docs:
- Plans/Models_System.md
- Plans/Prompt_Pipeline.md
- Plans/usage-feature.md
- Plans/Tools.md
owner_hints:
- Plans/Models_System.md
- Plans/Prompt_Pipeline.md
- Plans/usage-feature.md
- Plans/Tools.md
preserved_exact_tokens:
- extrepo-20260703-0067
- P1-PROMPT-CACHE-STABILITY-LINTER
- P1
- Prompt/cache/token efficiency hygiene
- OpenCode
- Cline
- Pi
- Codex
negative_constraints: []
observed_signal: OpenCode reports system-environment prompt cache invalidation and provider cache-marker gaps; Pi changelog includes prompt caching and cached-token accounting; Codex skills use progressive disclosure; Cline fixes prompt-cache detection and compaction routing.
pm_current_coverage: Previous pass recommended ContextEpoch/PromptCachePolicy; PM has provider cache metadata boundaries and compaction metadata.
pm_gap_or_delta: PM should add a linter/diagnostic that explains why cache hit rate is low, not only record usage.
proposal_or_recommendation: 'Add PromptCacheStabilityLinter: stable_prefix_hash, volatile_context_hashes, tool/schema ordering hash, skill catalog slice hash, file-list volatility, date/time/cwd injection warnings, provider cache marker support, and cache hit expectation.'
compile_disposition: create_new_planunit
```

### PP-069 - P1-INSTRUCTION-SOURCE-INTEGRITY-EPOCH

```yaml
plan_unit_id: PP-069
unit_type: requirement
status: accepted
owner_doc: Plans/Prompt_Pipeline.md
canonical_text: >-
  P1-INSTRUCTION-SOURCE-INTEGRITY-EPOCH (P1) is compiled as canonical Puppet Master intent for AGENTS/rules/skills/plugin instruction source fidelity and invalid encoding handling: Imported external-repo finding extrepo-20260703-0080 / P1-INSTRUCTION-SOURCE-INTEGRITY-EPOCH (P1). The preserved PM gap/delta is: ContextEpoch covered instruction hashes, but the source-integrity side should explicitly track missing/invalid/duplicate/stale instruction sources, encodings, and loaded-scope precedence. The observed external-repo signal remains source-lineage evidence: Codex changelog includes reliable AGENTS loading, invalid UTF-8 warnings, plugin skill path handling, and root marketplace layout fixes. | Cline/OpenCode expose custom rules/skills/prompts/provider configs that can drift across session/resume/import paths.
gui_related: true
gui_classification_reason: User-visible GUI, built-in terminal, accessibility, visual, multimodal, or desktop surface is directly implicated.
depends_on:
- PDS-003
- PNC-001
unblocks: []
acceptance_criteria:
- InstructionSetEpoch includes source path, encoding status, parse status, precedence, hash, loaded scope, and denial reason.
- Invalid UTF-8 or unreadable instruction files generate user-visible warnings and do not silently drop rules.
- Resume/fork/import preserves or intentionally re-resolves instruction scope with a receipt.
- No WorkNodes, NodeSeeds, executable queues, implementation files, production build tasks, generated governance artifacts, or governance seal outputs are created by this compile.
validation_surfaces:
- python3 scripts/pm-plan-index.py validate
- python3 scripts/pm-bootstrap-ledger-validate.py Plans/ledgers/v2/pldg-20260703-001-feature-intake
- InstructionSetEpoch includes source path, encoding status, parse status, precedence, hash, loaded scope, and denial reason.
- Invalid UTF-8 or unreadable instruction files generate user-visible warnings and do not silently drop rules.
- Resume/fork/import preserves or intentionally re-resolves instruction scope with a receipt.
risk_class: p1_agent_control_subagents_hardening
reasoning_tier: standard
context_scope: agent_control_subagents
implementation_surfaces:
- Plans/Prompt_Pipeline.md
node_compile_hint:
  mode: p1_instruction_source_integrity_epoch
  create_worknodes: false
  create_nodeseeds: false
source_lineage:
- pldg-20260703-001-feature-intake:atom-0084
- Plans/ledgers/v2/pldg-20260703-001-feature-intake/records/design_atoms.jsonl:atom-0084
- Plans/ledgers/v2/pldg-20260703-001-feature-intake/source_shards/external_repo_import_20260703/02_LEDGER_READY_ATOMS.jsonl:extrepo-20260703-0080/P1-INSTRUCTION-SOURCE-INTEGRITY-EPOCH@line=80
- Plans/ledgers/v2/pldg-20260703-001-feature-intake/source_shards/external_repo_import_20260703/02_LEDGER_READY_ATOMS.jsonl:extrepo-20260703-0080/P1-INSTRUCTION-SOURCE-INTEGRITY-EPOCH
- Plans/ledgers/v2/pldg-20260703-001-feature-intake/source_shards/external_repo_import_20260703/01_FULL_SOURCE_PACKET.md
- Plans/ledgers/v2/pldg-20260703-001-feature-intake/source_shards/external_repo_import_20260703/04_EVIDENCE_REGISTRY.json
- Plans/ledgers/v2/pldg-20260703-001-feature-intake/source_shards/external_repo_import_20260703/raw_source_artifacts/pm_final_external_repo_closure_backlog_2026-07-03.jsonl:7
source_atom_ids:
- atom-0084
external_atom_id: extrepo-20260703-0080
source_row_id: P1-INSTRUCTION-SOURCE-INTEGRITY-EPOCH
priority: P1
finding_family: AGENTS/rules/skills/plugin instruction source fidelity and invalid encoding handling
target_docs:
- Plans/Prompt_Pipeline.md
- Plans/Skills_System.md
- Goal_Runtime_System.md
- Models_System.md
- Contracts_V0.md
owner_hints:
- Plans/Prompt_Pipeline.md
- Plans/Skills_System.md
- Goal_Runtime_System.md
- Models_System.md
- Contracts_V0.md
preserved_exact_tokens:
- extrepo-20260703-0080
- P1-INSTRUCTION-SOURCE-INTEGRITY-EPOCH
- P1
- AGENTS/rules/skills/plugin instruction source fidelity and invalid encoding handling
negative_constraints: []
observed_signal: Codex changelog includes reliable AGENTS loading, invalid UTF-8 warnings, plugin skill path handling, and root marketplace layout fixes. | Cline/OpenCode expose custom rules/skills/prompts/provider configs that can drift across session/resume/import paths.
pm_gap_or_delta: ContextEpoch covered instruction hashes, but the source-integrity side should explicitly track missing/invalid/duplicate/stale instruction sources, encodings, and loaded-scope precedence.
relationship_to_prior_reports: Refines ContextEpoch with instruction integrity semantics.
compile_disposition: create_new_planunit
```

### PP-070 - P0-CONTEXT-OBJECT-BUDGET

```yaml
plan_unit_id: PP-070
unit_type: requirement
status: accepted
owner_doc: Plans/Prompt_Pipeline.md
canonical_text: >-
  P0-CONTEXT-OBJECT-BUDGET (P0) is compiled as canonical Puppet Master intent for Context object/media budget and dedupe: Imported external-repo finding extrepo-20260703-0093 / P0-CONTEXT-OBJECT-BUDGET (P0). The preserved PM gap/delta is: ContextEpoch should budget media/object artifacts separately from text tokens and dedupe repeated objects. The observed external-repo signal remains source-lineage evidence: Compaction checkpoints re-embed screenshots until multi-GB state/RSS runaway.
gui_related: true
gui_classification_reason: User-visible GUI, built-in terminal, accessibility, visual, multimodal, or desktop surface is directly implicated.
depends_on:
- PDS-003
- PNC-001
unblocks: []
acceptance_criteria:
- Identical screenshots are referenced by hash across checkpoints
- Object budget warnings trigger before runaway RSS
- Replay uses artifact refs instead of repeated by-value embedding
- No WorkNodes, NodeSeeds, executable queues, implementation files, production build tasks, generated governance artifacts, or governance seal outputs are created by this compile.
validation_surfaces:
- python3 scripts/pm-plan-index.py validate
- python3 scripts/pm-bootstrap-ledger-validate.py Plans/ledgers/v2/pldg-20260703-001-feature-intake
- Identical screenshots are referenced by hash across checkpoints
- Object budget warnings trigger before runaway RSS
- Replay uses artifact refs instead of repeated by-value embedding
risk_class: p0_context_cache_hardening
reasoning_tier: high
context_scope: context_cache
implementation_surfaces:
- Plans/Prompt_Pipeline.md
node_compile_hint:
  mode: p0_context_object_budget
  create_worknodes: false
  create_nodeseeds: false
source_lineage:
- pldg-20260703-001-feature-intake:atom-0097
- Plans/ledgers/v2/pldg-20260703-001-feature-intake/records/design_atoms.jsonl:atom-0097
- Plans/ledgers/v2/pldg-20260703-001-feature-intake/source_shards/external_repo_import_20260703/02_LEDGER_READY_ATOMS.jsonl:extrepo-20260703-0093/P0-CONTEXT-OBJECT-BUDGET@line=93
- Plans/ledgers/v2/pldg-20260703-001-feature-intake/source_shards/external_repo_import_20260703/02_LEDGER_READY_ATOMS.jsonl:extrepo-20260703-0093/P0-CONTEXT-OBJECT-BUDGET
- Plans/ledgers/v2/pldg-20260703-001-feature-intake/source_shards/external_repo_import_20260703/01_FULL_SOURCE_PACKET.md
- Plans/ledgers/v2/pldg-20260703-001-feature-intake/source_shards/external_repo_import_20260703/04_EVIDENCE_REGISTRY.json
- Plans/ledgers/v2/pldg-20260703-001-feature-intake/source_shards/external_repo_import_20260703/raw_source_artifacts/pm_one_more_external_repo_backlog_2026-07-03.jsonl:6
source_atom_ids:
- atom-0097
external_atom_id: extrepo-20260703-0093
source_row_id: P0-CONTEXT-OBJECT-BUDGET
priority: P0
finding_family: Context object/media budget and dedupe
source_repos:
- OpenAI Codex
preserved_exact_tokens:
- extrepo-20260703-0093
- P0-CONTEXT-OBJECT-BUDGET
- P0
- Context object/media budget and dedupe
- OpenAI Codex
negative_constraints: []
observed_signal: Compaction checkpoints re-embed screenshots until multi-GB state/RSS runaway.
pm_gap_or_delta: ContextEpoch should budget media/object artifacts separately from text tokens and dedupe repeated objects.
compile_disposition: create_new_planunit
```

### PP-071 - P1-INSTRUCTION-IMPORT-GRAPH

```yaml
plan_unit_id: PP-071
unit_type: requirement
status: accepted
owner_doc: Plans/Prompt_Pipeline.md
canonical_text: >-
  P1-INSTRUCTION-IMPORT-GRAPH (P1) is compiled as canonical Puppet Master intent for Instruction import graph integrity: Imported external-repo finding extrepo-20260703-0095 / P1-INSTRUCTION-IMPORT-GRAPH (P1). The preserved PM gap/delta is: Instruction imports need hashes, cycle checks, scope, trust source, staleness, and inclusion in ContextEpoch. The observed external-repo signal remains source-lineage evidence: AGENTS @path import feature request; Codex instructions/skills make imported instructions a live context source.
gui_related: false
gui_classification_reason: Backend/orchestration contract; not itself GUI implementation work.
depends_on:
- PDS-003
- PNC-001
unblocks: []
acceptance_criteria:
- Import cycles block or cap safely
- Changed imported file changes instruction epoch
- External/untrusted import cannot gain broader scope silently
- No WorkNodes, NodeSeeds, executable queues, implementation files, production build tasks, generated governance artifacts, or governance seal outputs are created by this compile.
validation_surfaces:
- python3 scripts/pm-plan-index.py validate
- python3 scripts/pm-bootstrap-ledger-validate.py Plans/ledgers/v2/pldg-20260703-001-feature-intake
- Import cycles block or cap safely
- Changed imported file changes instruction epoch
- External/untrusted import cannot gain broader scope silently
risk_class: p1_instruction_integrity_hardening
reasoning_tier: standard
context_scope: instruction_integrity
implementation_surfaces:
- Plans/Prompt_Pipeline.md
node_compile_hint:
  mode: p1_instruction_import_graph
  create_worknodes: false
  create_nodeseeds: false
source_lineage:
- pldg-20260703-001-feature-intake:atom-0099
- Plans/ledgers/v2/pldg-20260703-001-feature-intake/records/design_atoms.jsonl:atom-0099
- Plans/ledgers/v2/pldg-20260703-001-feature-intake/source_shards/external_repo_import_20260703/02_LEDGER_READY_ATOMS.jsonl:extrepo-20260703-0095/P1-INSTRUCTION-IMPORT-GRAPH@line=95
- Plans/ledgers/v2/pldg-20260703-001-feature-intake/source_shards/external_repo_import_20260703/02_LEDGER_READY_ATOMS.jsonl:extrepo-20260703-0095/P1-INSTRUCTION-IMPORT-GRAPH
- Plans/ledgers/v2/pldg-20260703-001-feature-intake/source_shards/external_repo_import_20260703/01_FULL_SOURCE_PACKET.md
- Plans/ledgers/v2/pldg-20260703-001-feature-intake/source_shards/external_repo_import_20260703/04_EVIDENCE_REGISTRY.json
- Plans/ledgers/v2/pldg-20260703-001-feature-intake/source_shards/external_repo_import_20260703/raw_source_artifacts/pm_one_more_external_repo_backlog_2026-07-03.jsonl:8
source_atom_ids:
- atom-0099
external_atom_id: extrepo-20260703-0095
source_row_id: P1-INSTRUCTION-IMPORT-GRAPH
priority: P1
finding_family: Instruction import graph integrity
source_repos:
- Pi
- OpenAI Codex
preserved_exact_tokens:
- extrepo-20260703-0095
- P1-INSTRUCTION-IMPORT-GRAPH
- P1
- Instruction import graph integrity
- Pi
- OpenAI Codex
negative_constraints: []
observed_signal: AGENTS @path import feature request; Codex instructions/skills make imported instructions a live context source.
pm_gap_or_delta: Instruction imports need hashes, cycle checks, scope, trust source, staleness, and inclusion in ContextEpoch.
compile_disposition: create_new_planunit
```

### PP-072 - context_epoch

```yaml
plan_unit_id: PP-072
unit_type: requirement
status: accepted
owner_doc: Plans/Prompt_Pipeline.md
canonical_text: >-
  context_epoch (P0) is compiled as canonical Puppet Master intent for context_epoch: Add CONTEXT-EPOCH-RECORD with instruction/tool/MCP/provider/catalog/cache/history hashes The preserved PM gap/delta is: No first-class ContextEpoch object found in repo scan The observed external-repo signal remains source-lineage evidence: OpenCode v2 session/context epochs, compaction as active representation replacement
gui_related: true
gui_classification_reason: Target docs include GUI/UI command or user-visible surfaces; mixed work is conservatively GUI-related.
depends_on:
- PDS-003
- PNC-001
unblocks: []
acceptance_criteria:
- Plan index validate
- context epoch replay fixtures
- model-switch compaction tests
- No WorkNodes, NodeSeeds, executable queues, implementation files, production build tasks, generated governance artifacts, or governance seal outputs are created by this compile.
validation_surfaces:
- python3 scripts/pm-plan-index.py validate
- python3 scripts/pm-bootstrap-ledger-validate.py Plans/ledgers/v2/pldg-20260703-001-feature-intake
- Plan index validate
- context epoch replay fixtures
- model-switch compaction tests
risk_class: p0_context_cache_hardening
reasoning_tier: high
context_scope: context_cache
implementation_surfaces:
- Plans/Prompt_Pipeline.md
- Plans/storage-plan.md
- Plans/assistant-chat-design.md
- Plans/usage-feature.md
node_compile_hint:
  mode: context_epoch
  create_worknodes: false
  create_nodeseeds: false
source_lineage:
- pldg-20260703-001-feature-intake:atom-0104
- Plans/ledgers/v2/pldg-20260703-001-feature-intake/records/design_atoms.jsonl:atom-0104
- Plans/ledgers/v2/pldg-20260703-001-feature-intake/source_shards/external_repo_import_20260703/02_LEDGER_READY_ATOMS.jsonl:extrepo-20260703-0100/context_epoch@line=100
- Plans/ledgers/v2/pldg-20260703-001-feature-intake/source_shards/external_repo_import_20260703/02_LEDGER_READY_ATOMS.jsonl:extrepo-20260703-0100/context_epoch
- Plans/ledgers/v2/pldg-20260703-001-feature-intake/source_shards/external_repo_import_20260703/01_FULL_SOURCE_PACKET.md
- Plans/ledgers/v2/pldg-20260703-001-feature-intake/source_shards/external_repo_import_20260703/04_EVIDENCE_REGISTRY.json
- Plans/ledgers/v2/pldg-20260703-001-feature-intake/source_shards/external_repo_import_20260703/raw_source_artifacts/opencode_pm_plan_change_matrix.csv:2
- Plans/ledgers/v2/pldg-20260703-001-feature-intake/source_shards/external_repo_import_20260703/01_FULL_SOURCE_PACKET.md:3448-3472
source_atom_ids:
- atom-0104
external_atom_id: extrepo-20260703-0100
source_row_id: context_epoch
priority: P0
finding_family: context_epoch
target_docs:
- Plans/Prompt_Pipeline.md
- Plans/storage-plan.md
- Plans/assistant-chat-design.md
- Plans/usage-feature.md
owner_hints:
- Plans/Prompt_Pipeline.md
- Plans/storage-plan.md
- Plans/assistant-chat-design.md
- Plans/usage-feature.md
preserved_exact_tokens:
- extrepo-20260703-0100
- context_epoch
- P0
negative_constraints: []
observed_signal: OpenCode v2 session/context epochs, compaction as active representation replacement
pm_current_coverage: Compaction rules, context usage UI, low-context warnings, reasoning replay
pm_gap_or_delta: No first-class ContextEpoch object found in repo scan
proposal_or_recommendation: Add CONTEXT-EPOCH-RECORD with instruction/tool/MCP/provider/catalog/cache/history hashes
compile_disposition: create_new_planunit
```

<!-- FABLE_REMAINING_ACTION_PLAN_REPAIR_20260708_BEGIN -->
