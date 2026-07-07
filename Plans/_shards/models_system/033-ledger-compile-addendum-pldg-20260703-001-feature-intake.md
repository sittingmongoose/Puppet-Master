# Shard 033: Ledger Compile Addendum - pldg-20260703-001-feature-intake

Source: `Plans/Models_System.md`

Source lines: L8422-L9346

Source SHA256: `1cb6c90beff8f25fe7a4e73492591a6633aa0604bb00de41849855bcbee3887a`

---

## Ledger Compile Addendum - pldg-20260703-001-feature-intake

This addendum compiles source-lineage obligations from bootstrap ledger `pldg-20260703-001-feature-intake` into this owner doc. The ledger remains source/planning memory; these PlanUnits are the live canonical evidence. This compile does not create WorkNodes, NodeSeeds, executable queues, implementation files, production build tasks, generated governance artifacts, or a governance seal.

### MS-123 - P0-PROVIDER-METADATA-REPLAY

```yaml
plan_unit_id: MS-123
unit_type: requirement
status: accepted
owner_doc: Plans/Models_System.md
canonical_text: >-
  P0-PROVIDER-METADATA-REPLAY (P0) is compiled as canonical Puppet Master intent for Provider-native reasoning/thinking/message metadata replay: Add ProviderNativeMetadataPolicy table: per provider/model capability, fields to retain, redact, drop-on-cross-provider, replay-only-same-account, or canonicalize. Include cache keys and model catalog version. The preserved PM gap/delta is: Need a typed provider-native artifact replay/drop/canonicalize policy for thinking blocks, signatures, reasoning IDs, nullable content, model variants, image/video content, provider account scoping. The observed external-repo signal remains source-lineage evidence: Cline PRs/issues target model catalogs, reasoning effort controls, provider IDs, image capability omission, transient empty model responses, string agent messages, tool invocation repair; Pi issues include thinking-block normalization and Bedrock/OpenAI Responses provider work; Codex PR scopes model cache by provider/account.
gui_related: true
gui_classification_reason: User-visible GUI, built-in terminal, accessibility, visual, multimodal, or desktop surface is directly implicated.
depends_on:
- PDS-003
- PNC-001
unblocks: []
acceptance_criteria:
- Switching provider/model never replays incompatible native reasoning blocks.
- Model cache scoped by provider+account+capability catalog version.
- Image/tool/reasoning content gates check capabilities before sending.
- No WorkNodes, NodeSeeds, executable queues, implementation files, production build tasks, generated governance artifacts, or governance seal outputs are created by this compile.
validation_surfaces:
- python3 scripts/pm-plan-index.py validate
- python3 scripts/pm-bootstrap-ledger-validate.py Plans/ledgers/v2/pldg-20260703-001-feature-intake
- Switching provider/model never replays incompatible native reasoning blocks.
- Model cache scoped by provider+account+capability catalog version.
- Image/tool/reasoning content gates check capabilities before sending.
risk_class: p0_provider_capability_and_metadata_hardening
reasoning_tier: high
context_scope: provider_capability_and_metadata
implementation_surfaces:
- Plans/Models_System.md
- Plans/CLI_Bridged_Providers.md
- Plans/Prompt_Pipeline.md
- Plans/Multi-Account.md
node_compile_hint:
  mode: p0_provider_metadata_replay
  create_worknodes: false
  create_nodeseeds: false
source_lineage:
- pldg-20260703-001-feature-intake:atom-0010
- Plans/ledgers/v2/pldg-20260703-001-feature-intake/records/design_atoms.jsonl:atom-0010
- Plans/ledgers/v2/pldg-20260703-001-feature-intake/source_shards/external_repo_import_20260703/02_LEDGER_READY_ATOMS.jsonl:extrepo-20260703-0006/P0-PROVIDER-METADATA-REPLAY@line=6
- Plans/ledgers/v2/pldg-20260703-001-feature-intake/source_shards/external_repo_import_20260703/02_LEDGER_READY_ATOMS.jsonl:extrepo-20260703-0006/P0-PROVIDER-METADATA-REPLAY
- Plans/ledgers/v2/pldg-20260703-001-feature-intake/source_shards/external_repo_import_20260703/01_FULL_SOURCE_PACKET.md
- Plans/ledgers/v2/pldg-20260703-001-feature-intake/source_shards/external_repo_import_20260703/04_EVIDENCE_REGISTRY.json
- Plans/ledgers/v2/pldg-20260703-001-feature-intake/source_shards/external_repo_import_20260703/raw_source_artifacts/pm_external_repo_action_backlog_2026-07-03.jsonl:6
- Plans/ledgers/v2/pldg-20260703-001-feature-intake/source_shards/external_repo_import_20260703/01_FULL_SOURCE_PACKET.md:833-1329
source_atom_ids:
- atom-0010
external_atom_id: extrepo-20260703-0006
source_row_id: P0-PROVIDER-METADATA-REPLAY
priority: P0
finding_family: Provider-native reasoning/thinking/message metadata replay
source_repos:
- cline/cline
- agent0ai/agent-zero
- earendil-works/pi
- openai/codex
target_docs:
- Plans/Models_System.md
- Plans/CLI_Bridged_Providers.md
- Plans/Prompt_Pipeline.md
- Plans/Multi-Account.md
owner_hints:
- Plans/Models_System.md
- Plans/CLI_Bridged_Providers.md
- Plans/Prompt_Pipeline.md
- Plans/Multi-Account.md
preserved_exact_tokens:
- extrepo-20260703-0006
- P0-PROVIDER-METADATA-REPLAY
- P0
- Provider-native reasoning/thinking/message metadata replay
- cline/cline
- agent0ai/agent-zero
- earendil-works/pi
- openai/codex
negative_constraints: []
observed_signal: Cline PRs/issues target model catalogs, reasoning effort controls, provider IDs, image capability omission, transient empty model responses, string agent messages, tool invocation repair; Pi issues include thinking-block normalization and Bedrock/OpenAI Responses provider work; Codex PR scopes model cache by provider/account.
pm_current_coverage: PM has requested/effective provider/model/account identity and provider facade normalization.
pm_gap_or_delta: Need a typed provider-native artifact replay/drop/canonicalize policy for thinking blocks, signatures, reasoning IDs, nullable content, model variants, image/video content, provider account scoping.
proposal_or_recommendation: 'Add ProviderNativeMetadataPolicy table: per provider/model capability, fields to retain, redact, drop-on-cross-provider, replay-only-same-account, or canonicalize. Include cache keys and model catalog version.'
compile_disposition: create_new_planunit
```

### MS-124 - P0-PROVIDER-CAPABILITY-EPOCH

```yaml
plan_unit_id: MS-124
unit_type: requirement
status: accepted
owner_doc: Plans/Models_System.md
canonical_text: >-
  P0-PROVIDER-CAPABILITY-EPOCH (P0) is compiled as canonical Puppet Master intent for Provider capability epoch and model-switch sanitizer: Imported external-repo finding extrepo-20260703-0023 / P0-PROVIDER-CAPABILITY-EPOCH (P0). The preserved PM gap/delta is: Extend ContextEpoch with ProviderCapabilityEpoch: metadata source, freshness, account/profile scope, route-imposed limits, dynamic discovery provenance, and model-switch sanitizer. The observed external-repo signal remains source-lineage evidence: Static/stale/route-specific model metadata caused wrong context windows, ghost models, maxTokens/context mismatch, and dynamic local model discovery needs.
gui_related: false
gui_classification_reason: Backend/orchestration contract; not itself GUI implementation work.
depends_on:
- PDS-003
- PNC-001
unblocks: []
acceptance_criteria:
- Stale static catalog warning
- Route-imposed context lower than provider-native context is honored
- Switching from vision/thinking model strips or blocks incompatible history with receipt
- No WorkNodes, NodeSeeds, executable queues, implementation files, production build tasks, generated governance artifacts, or governance seal outputs are created by this compile.
validation_surfaces:
- python3 scripts/pm-plan-index.py validate
- python3 scripts/pm-bootstrap-ledger-validate.py Plans/ledgers/v2/pldg-20260703-001-feature-intake
- Stale static catalog warning
- Route-imposed context lower than provider-native context is honored
- Switching from vision/thinking model strips or blocks incompatible history with receipt
risk_class: p0_provider_capability_and_metadata_hardening
reasoning_tier: high
context_scope: provider_capability_and_metadata
implementation_surfaces:
- Plans/Models_System.md
- Plans/Provider_OpenCode.md
- Plans/CLI_Bridged_Providers.md
- Plans/Prompt_Pipeline.md
node_compile_hint:
  mode: p0_provider_capability_epoch
  create_worknodes: false
  create_nodeseeds: false
source_lineage:
- pldg-20260703-001-feature-intake:atom-0027
- Plans/ledgers/v2/pldg-20260703-001-feature-intake/records/design_atoms.jsonl:atom-0027
- Plans/ledgers/v2/pldg-20260703-001-feature-intake/source_shards/external_repo_import_20260703/02_LEDGER_READY_ATOMS.jsonl:extrepo-20260703-0023/P0-PROVIDER-CAPABILITY-EPOCH@line=23
- Plans/ledgers/v2/pldg-20260703-001-feature-intake/source_shards/external_repo_import_20260703/02_LEDGER_READY_ATOMS.jsonl:extrepo-20260703-0023/P0-PROVIDER-CAPABILITY-EPOCH
- Plans/ledgers/v2/pldg-20260703-001-feature-intake/source_shards/external_repo_import_20260703/01_FULL_SOURCE_PACKET.md
- Plans/ledgers/v2/pldg-20260703-001-feature-intake/source_shards/external_repo_import_20260703/04_EVIDENCE_REGISTRY.json
- Plans/ledgers/v2/pldg-20260703-001-feature-intake/source_shards/external_repo_import_20260703/raw_source_artifacts/pm_second_pass_delta_backlog_2026-07-03.jsonl:3
source_atom_ids:
- atom-0027
external_atom_id: extrepo-20260703-0023
source_row_id: P0-PROVIDER-CAPABILITY-EPOCH
priority: P0
finding_family: Provider capability epoch and model-switch sanitizer
source_repos:
- cline/cline
- earendil-works/pi
- anomalyco/opencode
target_docs:
- Plans/Models_System.md
- Plans/Provider_OpenCode.md
- Plans/CLI_Bridged_Providers.md
- Plans/Prompt_Pipeline.md
owner_hints:
- Plans/Models_System.md
- Plans/Provider_OpenCode.md
- Plans/CLI_Bridged_Providers.md
- Plans/Prompt_Pipeline.md
preserved_exact_tokens:
- extrepo-20260703-0023
- P0-PROVIDER-CAPABILITY-EPOCH
- P0
- Provider capability epoch and model-switch sanitizer
- cline/cline
- earendil-works/pi
- anomalyco/opencode
negative_constraints: []
observed_signal: Static/stale/route-specific model metadata caused wrong context windows, ghost models, maxTokens/context mismatch, and dynamic local model discovery needs.
pm_current_coverage: PM has provider/model requested/effective identity and prior ContextEpoch recommendation.
pm_gap_or_delta: 'Extend ContextEpoch with ProviderCapabilityEpoch: metadata source, freshness, account/profile scope, route-imposed limits, dynamic discovery provenance, and model-switch sanitizer.'
compile_disposition: create_new_planunit
```

### MS-125 - P0-REASONING-REPLAY-MATRIX

```yaml
plan_unit_id: MS-125
unit_type: requirement
status: accepted
owner_doc: Plans/Models_System.md
canonical_text: >-
  P0-REASONING-REPLAY-MATRIX (P0) is compiled as canonical Puppet Master intent for Cross-provider reasoning/thinking replay/drop matrix: Imported external-repo finding extrepo-20260703-0024 / P0-REASONING-REPLAY-MATRIX (P0). The preserved PM gap/delta is: Add explicit ProviderNativeReplayMatrix fields for reasoning_content required/forbidden, signatures, user-first role order, images, tool-result role mapping, and same-delta ordering. The observed external-repo signal remains source-lineage evidence: DeepSeek, Kimi, MiMo, HuggingFace, OpenRouter, GLM, and Claude-like routes fail when reasoning_content/details/signatures/role order are replayed or dropped incorrectly.
gui_related: true
gui_classification_reason: User-visible GUI, built-in terminal, accessibility, visual, multimodal, or desktop surface is directly implicated.
depends_on:
- PDS-003
- PNC-001
unblocks: []
acceptance_criteria:
- Multi-turn tool-call replay tests for DeepSeek/Kimi/MiMo/Claude-compatible routes
- Model-switch tests from thinking to non-thinking models
- No WorkNodes, NodeSeeds, executable queues, implementation files, production build tasks, generated governance artifacts, or governance seal outputs are created by this compile.
validation_surfaces:
- python3 scripts/pm-plan-index.py validate
- python3 scripts/pm-bootstrap-ledger-validate.py Plans/ledgers/v2/pldg-20260703-001-feature-intake
- Multi-turn tool-call replay tests for DeepSeek/Kimi/MiMo/Claude-compatible routes
- Model-switch tests from thinking to non-thinking models
risk_class: p0_provider_capability_and_metadata_hardening
reasoning_tier: high
context_scope: provider_capability_and_metadata
implementation_surfaces:
- Plans/Models_System.md
- Plans/Prompt_Pipeline.md
- Plans/CLI_Bridged_Providers.md
- Plans/Provider_OpenCode.md
node_compile_hint:
  mode: p0_reasoning_replay_matrix
  create_worknodes: false
  create_nodeseeds: false
source_lineage:
- pldg-20260703-001-feature-intake:atom-0028
- Plans/ledgers/v2/pldg-20260703-001-feature-intake/records/design_atoms.jsonl:atom-0028
- Plans/ledgers/v2/pldg-20260703-001-feature-intake/source_shards/external_repo_import_20260703/02_LEDGER_READY_ATOMS.jsonl:extrepo-20260703-0024/P0-REASONING-REPLAY-MATRIX@line=24
- Plans/ledgers/v2/pldg-20260703-001-feature-intake/source_shards/external_repo_import_20260703/02_LEDGER_READY_ATOMS.jsonl:extrepo-20260703-0024/P0-REASONING-REPLAY-MATRIX
- Plans/ledgers/v2/pldg-20260703-001-feature-intake/source_shards/external_repo_import_20260703/01_FULL_SOURCE_PACKET.md
- Plans/ledgers/v2/pldg-20260703-001-feature-intake/source_shards/external_repo_import_20260703/04_EVIDENCE_REGISTRY.json
- Plans/ledgers/v2/pldg-20260703-001-feature-intake/source_shards/external_repo_import_20260703/raw_source_artifacts/pm_second_pass_delta_backlog_2026-07-03.jsonl:4
source_atom_ids:
- atom-0028
external_atom_id: extrepo-20260703-0024
source_row_id: P0-REASONING-REPLAY-MATRIX
priority: P0
finding_family: Cross-provider reasoning/thinking replay/drop matrix
source_repos:
- anomalyco/opencode
- earendil-works/pi
- agent0ai/agent-zero
target_docs:
- Plans/Models_System.md
- Plans/Prompt_Pipeline.md
- Plans/CLI_Bridged_Providers.md
- Plans/Provider_OpenCode.md
owner_hints:
- Plans/Models_System.md
- Plans/Prompt_Pipeline.md
- Plans/CLI_Bridged_Providers.md
- Plans/Provider_OpenCode.md
preserved_exact_tokens:
- extrepo-20260703-0024
- P0-REASONING-REPLAY-MATRIX
- P0
- Cross-provider reasoning/thinking replay/drop matrix
- anomalyco/opencode
- earendil-works/pi
- agent0ai/agent-zero
negative_constraints: []
observed_signal: DeepSeek, Kimi, MiMo, HuggingFace, OpenRouter, GLM, and Claude-like routes fail when reasoning_content/details/signatures/role order are replayed or dropped incorrectly.
pm_current_coverage: Prior report recommended provider-native metadata policy; PM has bridge/provider planning docs.
pm_gap_or_delta: Add explicit ProviderNativeReplayMatrix fields for reasoning_content required/forbidden, signatures, user-first role order, images, tool-result role mapping, and same-delta ordering.
compile_disposition: create_new_planunit
```

### MS-126 - P0-EFFORT-POLICY-SETTLEMENT

```yaml
plan_unit_id: MS-126
unit_type: requirement
status: accepted
owner_doc: Plans/Models_System.md
canonical_text: >-
  P0-EFFORT-POLICY-SETTLEMENT (P0) is compiled as canonical Puppet Master intent for Reasoning/thinking/effort requested-vs-effective: Add EffortSettlementReceipt with requested_effort, policy_effort, effective_wire_effort, provider_native_field, display_label, support_source, transform_version, fallback_reason, reset_detection, first_response_latency_bucket, and model-switch replay rule. The preserved PM gap/delta is: PM needs a settlement object that proves whether effort was honored, clamped, ignored, transformed, blocked, reset during continuation, or unsupported per provider attempt and per child/subagent. The observed external-repo signal remains source-lineage evidence: OpenCode issues report subagent reasoning-effort config gaps, Anthropic thinking signature failures, and TUI display mismatches; Codex issues report reasoning resetting, ignored custom model slugs, xhigh stalls, and model/effort change failures; Pi and Cline show provider-specific thinking controls causing errors or
  stale settings.
gui_related: true
gui_classification_reason: User-visible GUI, built-in terminal, accessibility, visual, multimodal, or desktop surface is directly implicated.
depends_on:
- PDS-003
- PNC-001
unblocks: []
acceptance_criteria:
- A model switch, compaction, resume, or subagent spawn emits a fresh effort settlement.
- Unsupported xhigh/high cannot display as honored.
- If provider accepts request but GUI label lags, diagnostic flags display_mismatch.
- Stalls before first token/reasoning item are typed separately from ordinary thinking time.
- No WorkNodes, NodeSeeds, executable queues, implementation files, production build tasks, generated governance artifacts, or governance seal outputs are created by this compile.
validation_surfaces:
- python3 scripts/pm-plan-index.py validate
- python3 scripts/pm-bootstrap-ledger-validate.py Plans/ledgers/v2/pldg-20260703-001-feature-intake
- A model switch, compaction, resume, or subagent spawn emits a fresh effort settlement.
- Unsupported xhigh/high cannot display as honored.
- If provider accepts request but GUI label lags, diagnostic flags display_mismatch.
- Stalls before first token/reasoning item are typed separately from ordinary thinking time.
risk_class: p0_provider_capability_and_metadata_hardening
reasoning_tier: high
context_scope: provider_capability_and_metadata
implementation_surfaces:
- Plans/Models_System.md
- Plans/Provider_OpenCode.md
- Plans/Goal_Runtime_System.md
- Plans/usage-feature.md
node_compile_hint:
  mode: p0_effort_policy_settlement
  create_worknodes: false
  create_nodeseeds: false
source_lineage:
- pldg-20260703-001-feature-intake:atom-0060
- Plans/ledgers/v2/pldg-20260703-001-feature-intake/records/design_atoms.jsonl:atom-0060
- Plans/ledgers/v2/pldg-20260703-001-feature-intake/source_shards/external_repo_import_20260703/02_LEDGER_READY_ATOMS.jsonl:extrepo-20260703-0056/P0-EFFORT-POLICY-SETTLEMENT@line=56
- Plans/ledgers/v2/pldg-20260703-001-feature-intake/source_shards/external_repo_import_20260703/02_LEDGER_READY_ATOMS.jsonl:extrepo-20260703-0056/P0-EFFORT-POLICY-SETTLEMENT
- Plans/ledgers/v2/pldg-20260703-001-feature-intake/source_shards/external_repo_import_20260703/01_FULL_SOURCE_PACKET.md
- Plans/ledgers/v2/pldg-20260703-001-feature-intake/source_shards/external_repo_import_20260703/04_EVIDENCE_REGISTRY.json
- Plans/ledgers/v2/pldg-20260703-001-feature-intake/source_shards/external_repo_import_20260703/raw_source_artifacts/pm_missed_domains_backlog_2026-07-03.jsonl:2
source_atom_ids:
- atom-0060
external_atom_id: extrepo-20260703-0056
source_row_id: P0-EFFORT-POLICY-SETTLEMENT
priority: P0
finding_family: Reasoning/thinking/effort requested-vs-effective
source_repos:
- OpenCode
- Codex
- Cline
- Pi
target_docs:
- Plans/Models_System.md
- Plans/Provider_OpenCode.md
- Plans/Goal_Runtime_System.md
- Plans/usage-feature.md
owner_hints:
- Plans/Models_System.md
- Plans/Provider_OpenCode.md
- Plans/Goal_Runtime_System.md
- Plans/usage-feature.md
preserved_exact_tokens:
- extrepo-20260703-0056
- P0-EFFORT-POLICY-SETTLEMENT
- P0
- Reasoning/thinking/effort requested-vs-effective
- OpenCode
- Codex
- Cline
- Pi
negative_constraints: []
observed_signal: OpenCode issues report subagent reasoning-effort config gaps, Anthropic thinking signature failures, and TUI display mismatches; Codex issues report reasoning resetting, ignored custom model slugs, xhigh stalls, and model/effort change failures; Pi and Cline show provider-specific thinking controls causing errors or stale settings.
pm_current_coverage: Models_System already requires requested effort, effective provider wire value, unsupported/clamped effort disclosure, and runtime-qualified effort capability.
pm_gap_or_delta: PM needs a settlement object that proves whether effort was honored, clamped, ignored, transformed, blocked, reset during continuation, or unsupported per provider attempt and per child/subagent.
proposal_or_recommendation: Add EffortSettlementReceipt with requested_effort, policy_effort, effective_wire_effort, provider_native_field, display_label, support_source, transform_version, fallback_reason, reset_detection, first_response_latency_bucket, and model-switch replay rule.
compile_disposition: create_new_planunit
```

### MS-127 - P0-PROVIDER-CAPABILITY-EPOCH-2

```yaml
plan_unit_id: MS-127
unit_type: requirement
status: accepted
owner_doc: Plans/Models_System.md
canonical_text: >-
  P0-PROVIDER-CAPABILITY-EPOCH-2 (P0) is compiled as canonical Puppet Master intent for Provider/model capability freshness and route-specific support: Define ProviderCapabilityEpoch with source, fetched_at, account/profile scope, route scope, provider endpoint, cache policy, modalities, tool capability, reasoning support, context limits, usage fields, transport support, evidence state, and invalidation triggers. The preserved PM gap/delta is: Capabilities need epoch identity and source confidence across model catalog, context window, cache support, tool-calling, vision/media, reasoning effort, usage accounting, transport, and provider-native replay. The observed external-repo signal remains source-lineage evidence: Repos show stale/wrong context-window metadata, route-specific limits, ghost models, model variant quirks, modality gaps, effort support uncertainty, and provider-native reasoning/tool replay drift.
gui_related: true
gui_classification_reason: User-visible GUI, built-in terminal, accessibility, visual, multimodal, or desktop surface is directly implicated.
depends_on:
- PDS-003
- PNC-001
unblocks: []
acceptance_criteria:
- Changing account/profile/route/model invalidates capability epoch.
- Unknown or stale capabilities cannot present controls as supported.
- Model limit and cached-token accounting show measured/provider_reported/estimated/unknown.
- Provider-native replay rules are keyed by epoch.
- No WorkNodes, NodeSeeds, executable queues, implementation files, production build tasks, generated governance artifacts, or governance seal outputs are created by this compile.
validation_surfaces:
- python3 scripts/pm-plan-index.py validate
- python3 scripts/pm-bootstrap-ledger-validate.py Plans/ledgers/v2/pldg-20260703-001-feature-intake
- Changing account/profile/route/model invalidates capability epoch.
- Unknown or stale capabilities cannot present controls as supported.
- Model limit and cached-token accounting show measured/provider_reported/estimated/unknown.
- Provider-native replay rules are keyed by epoch.
risk_class: p0_provider_capability_and_metadata_hardening
reasoning_tier: high
context_scope: provider_capability_and_metadata
implementation_surfaces:
- Plans/Models_System.md
- Plans/Provider_OpenCode.md
- Plans/MCP_Integration.md
- Plans/usage-feature.md
node_compile_hint:
  mode: p0_provider_capability_epoch_2
  create_worknodes: false
  create_nodeseeds: false
source_lineage:
- pldg-20260703-001-feature-intake:atom-0064
- Plans/ledgers/v2/pldg-20260703-001-feature-intake/records/design_atoms.jsonl:atom-0064
- Plans/ledgers/v2/pldg-20260703-001-feature-intake/source_shards/external_repo_import_20260703/02_LEDGER_READY_ATOMS.jsonl:extrepo-20260703-0060/P0-PROVIDER-CAPABILITY-EPOCH-2@line=60
- Plans/ledgers/v2/pldg-20260703-001-feature-intake/source_shards/external_repo_import_20260703/02_LEDGER_READY_ATOMS.jsonl:extrepo-20260703-0060/P0-PROVIDER-CAPABILITY-EPOCH-2
- Plans/ledgers/v2/pldg-20260703-001-feature-intake/source_shards/external_repo_import_20260703/01_FULL_SOURCE_PACKET.md
- Plans/ledgers/v2/pldg-20260703-001-feature-intake/source_shards/external_repo_import_20260703/04_EVIDENCE_REGISTRY.json
- Plans/ledgers/v2/pldg-20260703-001-feature-intake/source_shards/external_repo_import_20260703/raw_source_artifacts/pm_missed_domains_backlog_2026-07-03.jsonl:6
source_atom_ids:
- atom-0064
external_atom_id: extrepo-20260703-0060
source_row_id: P0-PROVIDER-CAPABILITY-EPOCH-2
priority: P0
finding_family: Provider/model capability freshness and route-specific support
source_repos:
- OpenCode
- Cline
- Pi
- Codex
target_docs:
- Plans/Models_System.md
- Plans/Provider_OpenCode.md
- Plans/MCP_Integration.md
- Plans/usage-feature.md
owner_hints:
- Plans/Models_System.md
- Plans/Provider_OpenCode.md
- Plans/MCP_Integration.md
- Plans/usage-feature.md
preserved_exact_tokens:
- extrepo-20260703-0060
- P0-PROVIDER-CAPABILITY-EPOCH-2
- P0
- Provider/model capability freshness and route-specific support
- OpenCode
- Cline
- Pi
- Codex
negative_constraints: []
observed_signal: Repos show stale/wrong context-window metadata, route-specific limits, ghost models, model variant quirks, modality gaps, effort support uncertainty, and provider-native reasoning/tool replay drift.
pm_current_coverage: Models_System has provider-owned catalogs, capability/cost gating, requested/effective identity, provider capability matrix application gate, and Vision Bridge route resolution.
pm_gap_or_delta: Capabilities need epoch identity and source confidence across model catalog, context window, cache support, tool-calling, vision/media, reasoning effort, usage accounting, transport, and provider-native replay.
proposal_or_recommendation: Define ProviderCapabilityEpoch with source, fetched_at, account/profile scope, route scope, provider endpoint, cache policy, modalities, tool capability, reasoning support, context limits, usage fields, transport support, evidence state, and invalidation triggers.
compile_disposition: create_new_planunit
```

### MS-128 - P1-MODEL-SELECTION-ROUTER

```yaml
plan_unit_id: MS-128
unit_type: requirement
status: accepted
owner_doc: Plans/Models_System.md
canonical_text: >-
  P1-MODEL-SELECTION-ROUTER (P1) is compiled as canonical Puppet Master intent for Model selection per role/skill/tool/subagent: Add ModelSelectionRouter with task_kind, risk_class, context_size, modalities, tool_need, verification_tier, cost_policy, latency_policy, provider availability, and fallback chain. Do not hardcode model names; use capability tiers. The preserved PM gap/delta is: PM should map tasks to model/effort through a scored router instead of static defaults while preserving user policy and certification-tier rules. The observed external-repo signal remains source-lineage evidence: Codex discussions request per-skill model selection and issues show custom subagent model config not honored; OpenCode issues request model variants and subagent model/effort selection; Cline SDK centralizes session/Plan/Act coordination and provider migration.
gui_related: true
gui_classification_reason: User-visible GUI, built-in terminal, accessibility, visual, multimodal, or desktop surface is directly implicated.
depends_on:
- PDS-003
- PNC-001
unblocks: []
acceptance_criteria:
- Low-risk summarization can select cheaper model only when certification policy allows.
- Verifier/adjudicator model cannot downgrade below risk tier.
- Router output is requested/effective and auditable.
- User can pin or forbid providers per project/account.
- No WorkNodes, NodeSeeds, executable queues, implementation files, production build tasks, generated governance artifacts, or governance seal outputs are created by this compile.
validation_surfaces:
- python3 scripts/pm-plan-index.py validate
- python3 scripts/pm-bootstrap-ledger-validate.py Plans/ledgers/v2/pldg-20260703-001-feature-intake
- Low-risk summarization can select cheaper model only when certification policy allows.
- Verifier/adjudicator model cannot downgrade below risk tier.
- Router output is requested/effective and auditable.
- User can pin or forbid providers per project/account.
risk_class: p1_provider_capability_and_metadata_hardening
reasoning_tier: standard
context_scope: provider_capability_and_metadata
implementation_surfaces:
- Plans/Models_System.md
- Plans/Goal_Runtime_System.md
- Plans/Plan_To_Node_Compilation.md
node_compile_hint:
  mode: p1_model_selection_router
  create_worknodes: false
  create_nodeseeds: false
source_lineage:
- pldg-20260703-001-feature-intake:atom-0068
- Plans/ledgers/v2/pldg-20260703-001-feature-intake/records/design_atoms.jsonl:atom-0068
- Plans/ledgers/v2/pldg-20260703-001-feature-intake/source_shards/external_repo_import_20260703/02_LEDGER_READY_ATOMS.jsonl:extrepo-20260703-0064/P1-MODEL-SELECTION-ROUTER@line=64
- Plans/ledgers/v2/pldg-20260703-001-feature-intake/source_shards/external_repo_import_20260703/02_LEDGER_READY_ATOMS.jsonl:extrepo-20260703-0064/P1-MODEL-SELECTION-ROUTER
- Plans/ledgers/v2/pldg-20260703-001-feature-intake/source_shards/external_repo_import_20260703/01_FULL_SOURCE_PACKET.md
- Plans/ledgers/v2/pldg-20260703-001-feature-intake/source_shards/external_repo_import_20260703/04_EVIDENCE_REGISTRY.json
- Plans/ledgers/v2/pldg-20260703-001-feature-intake/source_shards/external_repo_import_20260703/raw_source_artifacts/pm_missed_domains_backlog_2026-07-03.jsonl:10
source_atom_ids:
- atom-0068
external_atom_id: extrepo-20260703-0064
source_row_id: P1-MODEL-SELECTION-ROUTER
priority: P1
finding_family: Model selection per role/skill/tool/subagent
source_repos:
- Codex
- OpenCode
- Cline
target_docs:
- Plans/Models_System.md
- Plans/Goal_Runtime_System.md
- Plans/Plan_To_Node_Compilation.md
owner_hints:
- Plans/Models_System.md
- Plans/Goal_Runtime_System.md
- Plans/Plan_To_Node_Compilation.md
preserved_exact_tokens:
- extrepo-20260703-0064
- P1-MODEL-SELECTION-ROUTER
- P1
- Model selection per role/skill/tool/subagent
- Codex
- OpenCode
- Cline
negative_constraints: []
observed_signal: Codex discussions request per-skill model selection and issues show custom subagent model config not honored; OpenCode issues request model variants and subagent model/effort selection; Cline SDK centralizes session/Plan/Act coordination and provider migration.
pm_current_coverage: PM already has provider/model precedence by scope and Goal Runtime model-role policy.
pm_gap_or_delta: PM should map tasks to model/effort through a scored router instead of static defaults while preserving user policy and certification-tier rules.
proposal_or_recommendation: Add ModelSelectionRouter with task_kind, risk_class, context_size, modalities, tool_need, verification_tier, cost_policy, latency_policy, provider availability, and fallback chain. Do not hardcode model names; use capability tiers.
compile_disposition: create_new_planunit
```

### MS-129 - P2-MODEL-CATALOG-CONFIDENCE-UI

```yaml
plan_unit_id: MS-129
unit_type: requirement
status: accepted
owner_doc: Plans/Models_System.md
canonical_text: >-
  P2-MODEL-CATALOG-CONFIDENCE-UI (P2) is compiled as canonical Puppet Master intent for Provider/catalog confidence and user explanation: Add ModelCapabilityConfidence UI: verified_live, provider_reported, inferred, configured_static, stale, unknown, unsupported, with last_refresh and route/account scope. The preserved PM gap/delta is: Expose capability source confidence in Settings/model picker so users understand why a model shows/hides vision, effort, cache, or context controls. The observed external-repo signal remains source-lineage evidence: Recent issues show model catalogs with wrong context windows, missing modalities, ghost models, static capability assumptions, and route-specific gaps.
gui_related: true
gui_classification_reason: User-visible GUI, built-in terminal, accessibility, visual, multimodal, or desktop surface is directly implicated.
depends_on:
- PDS-003
- PNC-001
unblocks: []
acceptance_criteria:
- A custom OpenAI-compatible model with unknown vision shows unknown/not supported until proven.
- User can refresh/retest capability.
- Hidden controls include reason.
- No WorkNodes, NodeSeeds, executable queues, implementation files, production build tasks, generated governance artifacts, or governance seal outputs are created by this compile.
validation_surfaces:
- python3 scripts/pm-plan-index.py validate
- python3 scripts/pm-bootstrap-ledger-validate.py Plans/ledgers/v2/pldg-20260703-001-feature-intake
- A custom OpenAI-compatible model with unknown vision shows unknown/not supported until proven.
- User can refresh/retest capability.
- Hidden controls include reason.
risk_class: p2_provider_capability_and_metadata_coverage
reasoning_tier: standard
context_scope: provider_capability_and_metadata
implementation_surfaces:
- Plans/Models_System.md
- Plans/FinalGUISpec.md
- Plans/Provider_OpenCode.md
node_compile_hint:
  mode: p2_model_catalog_confidence_ui
  create_worknodes: false
  create_nodeseeds: false
source_lineage:
- pldg-20260703-001-feature-intake:atom-0077
- Plans/ledgers/v2/pldg-20260703-001-feature-intake/records/design_atoms.jsonl:atom-0077
- Plans/ledgers/v2/pldg-20260703-001-feature-intake/source_shards/external_repo_import_20260703/02_LEDGER_READY_ATOMS.jsonl:extrepo-20260703-0073/P2-MODEL-CATALOG-CONFIDENCE-UI@line=73
- Plans/ledgers/v2/pldg-20260703-001-feature-intake/source_shards/external_repo_import_20260703/02_LEDGER_READY_ATOMS.jsonl:extrepo-20260703-0073/P2-MODEL-CATALOG-CONFIDENCE-UI
- Plans/ledgers/v2/pldg-20260703-001-feature-intake/source_shards/external_repo_import_20260703/01_FULL_SOURCE_PACKET.md
- Plans/ledgers/v2/pldg-20260703-001-feature-intake/source_shards/external_repo_import_20260703/04_EVIDENCE_REGISTRY.json
- Plans/ledgers/v2/pldg-20260703-001-feature-intake/source_shards/external_repo_import_20260703/raw_source_artifacts/pm_missed_domains_backlog_2026-07-03.jsonl:19
source_atom_ids:
- atom-0077
external_atom_id: extrepo-20260703-0073
source_row_id: P2-MODEL-CATALOG-CONFIDENCE-UI
priority: P2
finding_family: Provider/catalog confidence and user explanation
source_repos:
- OpenCode
- Cline
- Pi
target_docs:
- Plans/Models_System.md
- Plans/FinalGUISpec.md
- Plans/Provider_OpenCode.md
owner_hints:
- Plans/Models_System.md
- Plans/FinalGUISpec.md
- Plans/Provider_OpenCode.md
preserved_exact_tokens:
- extrepo-20260703-0073
- P2-MODEL-CATALOG-CONFIDENCE-UI
- P2
- Provider/catalog confidence and user explanation
- OpenCode
- Cline
- Pi
negative_constraints: []
observed_signal: Recent issues show model catalogs with wrong context windows, missing modalities, ghost models, static capability assumptions, and route-specific gaps.
pm_current_coverage: Models_System has provider-owned catalogs and evidence states; GUI disclosure surfaces exist.
pm_gap_or_delta: Expose capability source confidence in Settings/model picker so users understand why a model shows/hides vision, effort, cache, or context controls.
proposal_or_recommendation: 'Add ModelCapabilityConfidence UI: verified_live, provider_reported, inferred, configured_static, stale, unknown, unsupported, with last_refresh and route/account scope.'
compile_disposition: create_new_planunit
```

### MS-130 - P0-ENTITLEMENT-QUOTA-SETTLEMENT

```yaml
plan_unit_id: MS-130
unit_type: requirement
status: accepted
owner_doc: Plans/Models_System.md
canonical_text: >-
  P0-ENTITLEMENT-QUOTA-SETTLEMENT (P0) is compiled as canonical Puppet Master intent for Provider/product entitlement, quota, credit, subscription, and rate-limit state: Imported external-repo finding extrepo-20260703-0079 / P0-ENTITLEMENT-QUOTA-SETTLEMENT (P0). The preserved PM gap/delta is: UsageCacheEnvelope and model/provider identity covered token accounting, but PM also needs billing/entitlement/quota classification and user-visible remediation.  The observed external-repo signal remains source-lineage evidence: OpenCode recent issues include active subscription reporting as free-tier exceeded. | Cline recent issues include payment succeeding but no credits. | Warp fixed quota/credit errors being misclassified as Warp faults. | Codex issue #20301 shows token-cache/cost anomalies can be operationally severe.
gui_related: true
gui_classification_reason: Target docs include GUI/UI command or user-visible surfaces; mixed work is conservatively GUI-related.
depends_on:
- PDS-003
- PNC-001
unblocks: []
acceptance_criteria:
- 'Every provider attempt returns EntitlementQuotaSettlement: quota_exhausted|billing_inactive|subscription_mismatch|rate_limited|cache_anomaly|provider_fault|pm_fault|unknown.'
- Quota/credit/subscription errors are not shown as generic PM faults.
- Usage anomaly guard ties cache-hit drop, context size, selected model, account, and billing state into one diagnostic bundle.
- No WorkNodes, NodeSeeds, executable queues, implementation files, production build tasks, generated governance artifacts, or governance seal outputs are created by this compile.
validation_surfaces:
- python3 scripts/pm-plan-index.py validate
- python3 scripts/pm-bootstrap-ledger-validate.py Plans/ledgers/v2/pldg-20260703-001-feature-intake
- 'Every provider attempt returns EntitlementQuotaSettlement: quota_exhausted|billing_inactive|subscription_mismatch|rate_limited|cache_anomaly|provider_fault|pm_fault|unknown.'
- Quota/credit/subscription errors are not shown as generic PM faults.
- Usage anomaly guard ties cache-hit drop, context size, selected model, account, and billing state into one diagnostic bundle.
risk_class: p0_provider_capability_and_metadata_hardening
reasoning_tier: high
context_scope: provider_capability_and_metadata
implementation_surfaces:
- Plans/Models_System.md
node_compile_hint:
  mode: p0_entitlement_quota_settlement
  create_worknodes: false
  create_nodeseeds: false
source_lineage:
- pldg-20260703-001-feature-intake:atom-0083
- Plans/ledgers/v2/pldg-20260703-001-feature-intake/records/design_atoms.jsonl:atom-0083
- Plans/ledgers/v2/pldg-20260703-001-feature-intake/source_shards/external_repo_import_20260703/02_LEDGER_READY_ATOMS.jsonl:extrepo-20260703-0079/P0-ENTITLEMENT-QUOTA-SETTLEMENT@line=79
- Plans/ledgers/v2/pldg-20260703-001-feature-intake/source_shards/external_repo_import_20260703/02_LEDGER_READY_ATOMS.jsonl:extrepo-20260703-0079/P0-ENTITLEMENT-QUOTA-SETTLEMENT
- Plans/ledgers/v2/pldg-20260703-001-feature-intake/source_shards/external_repo_import_20260703/01_FULL_SOURCE_PACKET.md
- Plans/ledgers/v2/pldg-20260703-001-feature-intake/source_shards/external_repo_import_20260703/04_EVIDENCE_REGISTRY.json
- Plans/ledgers/v2/pldg-20260703-001-feature-intake/source_shards/external_repo_import_20260703/raw_source_artifacts/pm_final_external_repo_closure_backlog_2026-07-03.jsonl:6
source_atom_ids:
- atom-0083
external_atom_id: extrepo-20260703-0079
source_row_id: P0-ENTITLEMENT-QUOTA-SETTLEMENT
priority: P0
finding_family: Provider/product entitlement, quota, credit, subscription, and rate-limit state
target_docs:
- Models_System.md
- Provider_OpenCode.md
- FinalGUISpec.md
- Runtime_Artifacts_Panel.md
- Contracts_V0.md
owner_hints:
- Models_System.md
- Provider_OpenCode.md
- FinalGUISpec.md
- Runtime_Artifacts_Panel.md
- Contracts_V0.md
preserved_exact_tokens:
- extrepo-20260703-0079
- P0-ENTITLEMENT-QUOTA-SETTLEMENT
- P0
- Provider/product entitlement, quota, credit, subscription, and rate-limit state
negative_constraints: []
observed_signal: 'OpenCode recent issues include active subscription reporting as free-tier exceeded. | Cline recent issues include payment succeeding but no credits. | Warp fixed quota/credit errors being misclassified as Warp faults. | Codex issue #20301 shows token-cache/cost anomalies can be operationally severe.'
pm_gap_or_delta: 'UsageCacheEnvelope and model/provider identity covered token accounting, but PM also needs billing/entitlement/quota classification and user-visible remediation. '
relationship_to_prior_reports: New P0 operational UX/cost surface.
compile_disposition: create_new_planunit
```

### MS-131 - provider_policy

```yaml
plan_unit_id: MS-131
unit_type: requirement
status: accepted
owner_doc: Plans/Models_System.md
canonical_text: >-
  provider_policy (P0) is compiled as canonical Puppet Master intent for provider_policy: Add ProviderPolicyRuleset owner section and precedence rules The preserved PM gap/delta is: Provider use policy not separated from generic permissions with same clarity The observed external-repo signal remains source-lineage evidence: OpenCode v2 separates provider config from provider policy with wildcard/precedence
gui_related: false
gui_classification_reason: Backend/orchestration contract; not itself GUI implementation work.
depends_on:
- PDS-003
- PNC-001
unblocks: []
acceptance_criteria:
- Provider denied/configured fixtures
- repo cannot re-enable user deny
- No WorkNodes, NodeSeeds, executable queues, implementation files, production build tasks, generated governance artifacts, or governance seal outputs are created by this compile.
validation_surfaces:
- python3 scripts/pm-plan-index.py validate
- python3 scripts/pm-bootstrap-ledger-validate.py Plans/ledgers/v2/pldg-20260703-001-feature-intake
- Provider denied/configured fixtures
- repo cannot re-enable user deny
risk_class: p0_provider_capability_and_metadata_hardening
reasoning_tier: high
context_scope: provider_capability_and_metadata
implementation_surfaces:
- Plans/Models_System.md
- Plans/Permissions_System.md
- Plans/Multi-Account.md
node_compile_hint:
  mode: provider_policy
  create_worknodes: false
  create_nodeseeds: false
source_lineage:
- pldg-20260703-001-feature-intake:atom-0106
- Plans/ledgers/v2/pldg-20260703-001-feature-intake/records/design_atoms.jsonl:atom-0106
- Plans/ledgers/v2/pldg-20260703-001-feature-intake/source_shards/external_repo_import_20260703/02_LEDGER_READY_ATOMS.jsonl:extrepo-20260703-0102/provider_policy@line=102
- Plans/ledgers/v2/pldg-20260703-001-feature-intake/source_shards/external_repo_import_20260703/02_LEDGER_READY_ATOMS.jsonl:extrepo-20260703-0102/provider_policy
- Plans/ledgers/v2/pldg-20260703-001-feature-intake/source_shards/external_repo_import_20260703/01_FULL_SOURCE_PACKET.md
- Plans/ledgers/v2/pldg-20260703-001-feature-intake/source_shards/external_repo_import_20260703/04_EVIDENCE_REGISTRY.json
- Plans/ledgers/v2/pldg-20260703-001-feature-intake/source_shards/external_repo_import_20260703/raw_source_artifacts/opencode_pm_plan_change_matrix.csv:4
- Plans/ledgers/v2/pldg-20260703-001-feature-intake/source_shards/external_repo_import_20260703/01_FULL_SOURCE_PACKET.md:3448-3472
source_atom_ids:
- atom-0106
external_atom_id: extrepo-20260703-0102
source_row_id: provider_policy
priority: P0
finding_family: provider_policy
target_docs:
- Plans/Models_System.md
- Plans/Permissions_System.md
- Plans/Multi-Account.md
owner_hints:
- Plans/Models_System.md
- Plans/Permissions_System.md
- Plans/Multi-Account.md
preserved_exact_tokens:
- extrepo-20260703-0102
- provider_policy
- P0
negative_constraints: []
observed_signal: OpenCode v2 separates provider config from provider policy with wildcard/precedence
pm_current_coverage: Requested/effective model/account identity and permission ceilings
pm_gap_or_delta: Provider use policy not separated from generic permissions with same clarity
proposal_or_recommendation: Add ProviderPolicyRuleset owner section and precedence rules
compile_disposition: create_new_planunit
```

### MS-132 - provider_metadata_replay

```yaml
plan_unit_id: MS-132
unit_type: requirement
status: accepted
owner_doc: Plans/Models_System.md
canonical_text: >-
  provider_metadata_replay (P0) is compiled as canonical Puppet Master intent for provider_metadata_replay: Add ProviderMetadataReplayPolicy by provider/model/context boundary The preserved PM gap/delta is: No explicit provider-native replay-required/forbidden matrix The observed external-repo signal remains source-lineage evidence: Anthropic thinking/signature preservation PRs; stale provider item ID fixes
gui_related: true
gui_classification_reason: User-visible GUI, built-in terminal, accessibility, visual, multimodal, or desktop surface is directly implicated.
depends_on:
- PDS-003
- PNC-001
unblocks: []
acceptance_criteria:
- Anthropic/OpenAI/Copilot replay/model-switch tests
- No WorkNodes, NodeSeeds, executable queues, implementation files, production build tasks, generated governance artifacts, or governance seal outputs are created by this compile.
validation_surfaces:
- python3 scripts/pm-plan-index.py validate
- python3 scripts/pm-bootstrap-ledger-validate.py Plans/ledgers/v2/pldg-20260703-001-feature-intake
- Anthropic/OpenAI/Copilot replay/model-switch tests
risk_class: p0_provider_capability_and_metadata_hardening
reasoning_tier: high
context_scope: provider_capability_and_metadata
implementation_surfaces:
- Plans/Models_System.md
- Plans/CLI_Bridged_Providers.md
- Plans/Prompt_Pipeline.md
node_compile_hint:
  mode: provider_metadata_replay
  create_worknodes: false
  create_nodeseeds: false
source_lineage:
- pldg-20260703-001-feature-intake:atom-0107
- Plans/ledgers/v2/pldg-20260703-001-feature-intake/records/design_atoms.jsonl:atom-0107
- Plans/ledgers/v2/pldg-20260703-001-feature-intake/source_shards/external_repo_import_20260703/02_LEDGER_READY_ATOMS.jsonl:extrepo-20260703-0103/provider_metadata_replay@line=103
- Plans/ledgers/v2/pldg-20260703-001-feature-intake/source_shards/external_repo_import_20260703/02_LEDGER_READY_ATOMS.jsonl:extrepo-20260703-0103/provider_metadata_replay
- Plans/ledgers/v2/pldg-20260703-001-feature-intake/source_shards/external_repo_import_20260703/01_FULL_SOURCE_PACKET.md
- Plans/ledgers/v2/pldg-20260703-001-feature-intake/source_shards/external_repo_import_20260703/04_EVIDENCE_REGISTRY.json
- Plans/ledgers/v2/pldg-20260703-001-feature-intake/source_shards/external_repo_import_20260703/raw_source_artifacts/opencode_pm_plan_change_matrix.csv:5
- Plans/ledgers/v2/pldg-20260703-001-feature-intake/source_shards/external_repo_import_20260703/01_FULL_SOURCE_PACKET.md:3448-3472
source_atom_ids:
- atom-0107
external_atom_id: extrepo-20260703-0103
source_row_id: provider_metadata_replay
priority: P0
finding_family: provider_metadata_replay
target_docs:
- Plans/CLI_Bridged_Providers.md
- Plans/Prompt_Pipeline.md
- Plans/Models_System.md
owner_hints:
- Plans/CLI_Bridged_Providers.md
- Plans/Prompt_Pipeline.md
- Plans/Models_System.md
preserved_exact_tokens:
- extrepo-20260703-0103
- provider_metadata_replay
- P0
negative_constraints: []
observed_signal: Anthropic thinking/signature preservation PRs; stale provider item ID fixes
pm_current_coverage: Bridge preserves normalized provider output; reasoning blocks replay-safe
pm_gap_or_delta: No explicit provider-native replay-required/forbidden matrix
proposal_or_recommendation: Add ProviderMetadataReplayPolicy by provider/model/context boundary
compile_disposition: create_new_planunit
```

### MS-133 - provider_error_observability

```yaml
plan_unit_id: MS-133
unit_type: requirement
status: accepted
owner_doc: Plans/Models_System.md
canonical_text: >-
  provider_error_observability (P1) is compiled as canonical Puppet Master intent for provider_error_observability: Add ProviderErrorEnvelope fields: HTTP/status/body-class/request-id/retryability The preserved PM gap/delta is: Need provider error detail minimums per endpoint type The observed external-repo signal remains source-lineage evidence: Generic provider returned error issues, custom provider config forwarding bugs
gui_related: false
gui_classification_reason: Backend/orchestration contract; not itself GUI implementation work.
depends_on:
- PDS-003
- PNC-001
unblocks: []
acceptance_criteria:
- Provider error fixtures for OpenAI-compatible, Kimi, OpenRouter, Copilot
- No WorkNodes, NodeSeeds, executable queues, implementation files, production build tasks, generated governance artifacts, or governance seal outputs are created by this compile.
validation_surfaces:
- python3 scripts/pm-plan-index.py validate
- python3 scripts/pm-bootstrap-ledger-validate.py Plans/ledgers/v2/pldg-20260703-001-feature-intake
- Provider error fixtures for OpenAI-compatible, Kimi, OpenRouter, Copilot
risk_class: p1_provider_capability_and_metadata_hardening
reasoning_tier: standard
context_scope: provider_capability_and_metadata
implementation_surfaces:
- Plans/Models_System.md
- Plans/CLI_Bridged_Providers.md
- Plans/Runtime_Artifacts_Panel.md
node_compile_hint:
  mode: provider_error_observability
  create_worknodes: false
  create_nodeseeds: false
source_lineage:
- pldg-20260703-001-feature-intake:atom-0114
- Plans/ledgers/v2/pldg-20260703-001-feature-intake/records/design_atoms.jsonl:atom-0114
- Plans/ledgers/v2/pldg-20260703-001-feature-intake/source_shards/external_repo_import_20260703/02_LEDGER_READY_ATOMS.jsonl:extrepo-20260703-0110/provider_error_observability@line=110
- Plans/ledgers/v2/pldg-20260703-001-feature-intake/source_shards/external_repo_import_20260703/02_LEDGER_READY_ATOMS.jsonl:extrepo-20260703-0110/provider_error_observability
- Plans/ledgers/v2/pldg-20260703-001-feature-intake/source_shards/external_repo_import_20260703/01_FULL_SOURCE_PACKET.md
- Plans/ledgers/v2/pldg-20260703-001-feature-intake/source_shards/external_repo_import_20260703/04_EVIDENCE_REGISTRY.json
- Plans/ledgers/v2/pldg-20260703-001-feature-intake/source_shards/external_repo_import_20260703/raw_source_artifacts/opencode_pm_plan_change_matrix.csv:12
- Plans/ledgers/v2/pldg-20260703-001-feature-intake/source_shards/external_repo_import_20260703/01_FULL_SOURCE_PACKET.md:3448-3472
source_atom_ids:
- atom-0114
external_atom_id: extrepo-20260703-0110
source_row_id: provider_error_observability
priority: P1
finding_family: provider_error_observability
target_docs:
- Plans/CLI_Bridged_Providers.md
- Plans/Models_System.md
- Plans/Runtime_Artifacts_Panel.md
owner_hints:
- Plans/CLI_Bridged_Providers.md
- Plans/Models_System.md
- Plans/Runtime_Artifacts_Panel.md
preserved_exact_tokens:
- extrepo-20260703-0110
- provider_error_observability
- P1
negative_constraints: []
observed_signal: Generic provider returned error issues, custom provider config forwarding bugs
pm_current_coverage: Bridge preserves errors/truncation/usage/correlation IDs
pm_gap_or_delta: Need provider error detail minimums per endpoint type
proposal_or_recommendation: 'Add ProviderErrorEnvelope fields: HTTP/status/body-class/request-id/retryability'
compile_disposition: create_new_planunit
```

### MS-134 - Platform Specs Retirement And Capability Snapshot Authority

```yaml
plan_unit_id: MS-134
unit_type: constraint
status: accepted
owner_doc: Plans/Models_System.md
canonical_text: >-
  Models_System owns the active provider/model capability snapshot authority for
  context-window and max-token limits, fallback-chain eligibility, capability
  provenance, and requested/effective model disclosure. Legacy `platform_specs`
  and `platform_specs.rs` are retired source-lineage only and must not be called
  as active capability functions such as `platform_specs::context_window(provider)`
  or `platform_specs::fallback_model_ids(platform)`.
gui_related: false
gui_classification_reason: This unit defines provider/model capability authority and runtime data contracts, not visual presentation.
depends_on: [MS-017, MS-083]
unblocks: [ACD-009, ACD-184, ACD-220, ACD-255, ACD-257, ACD-262, ACD-268]
acceptance_criteria:
  - Active context-window and max-token consumers use Models_System capability snapshot fields.
  - Active fallback consumers use `fallback_chain[]`; `fallback_model_ids[]` is compatibility projection only.
  - Capability snapshots carry provider/model/source provenance, verification state, and staleness state.
  - Requested/effective model identity, fallback, clamp, unsupported, opaque, inferred, and stale states remain visible to consumers.
  - Legacy `platform_specs` and `platform_specs.rs` are present only in explicit source-lineage or compatibility notes.
validation_surfaces:
  - python3 scripts/pm-plan-index.py validate
  - python3 scripts/pm-plans-verify.py lint-contractrefs
risk_class: platform_specs_authority_regression
reasoning_tier: high
context_scope: provider_model_capability_authority
implementation_surfaces:
  - Plans/Models_System.md
  - Plans/assistant-chat-design.md
  - Plans/Contracts_V0.md
  - Plans/Provider_OpenCode.md
node_compile_hint:
  mode: platform_specs_retirement_capability_snapshot_authority
  create_worknodes: false
  create_nodeseeds: false
source_lineage:
  - fablereport.md
  - Plans/.audits/fable-20260706/buildability_repair_registry.jsonl:7
source_atom_ids: []
preserved_exact_tokens:
  - "`platform_specs`"
  - "`platform_specs.rs`"
  - "`context_window_tokens`"
  - "`max_input_tokens`"
  - "`max_output_tokens`"
  - "`effective_context_window_tokens`"
  - "`fallback_chain[]`"
  - "`fallback_model_ids[]`"
negative_constraints:
  - Do not call `platform_specs::context_window(provider)` as active context-window authority.
  - Do not call `platform_specs::fallback_model_ids(platform)` as active fallback authority.
  - Do not treat Provider_OpenCode, Assistant Chat, Contracts_V0, or CLI bridge docs as replacement owners for provider/model capability snapshot fields.
compatibility_only_notes:
  - Legacy platform_specs tokens remain traceable only as source-lineage from the removed Rust/Iced implementation.
owner_hints:
  - Plans/Models_System.md
  - Plans/assistant-chat-design.md
  - Plans/Contracts_V0.md
  - Plans/Provider_OpenCode.md
```
