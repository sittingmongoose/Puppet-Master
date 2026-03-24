# Prompt Pipeline (Canonical SSOT)

> **Compliance:** This document follows `Plans/DRY_Rules.md` and references SSOT contracts in `Plans/Contracts_V0.md`. Naming: "Puppet Master" only. No open questions; deterministic defaults per `Plans/Decision_Policy.md`.

## 0. Scope and SSOT status

This document is the **single canonical source of truth** for:
- Prompt assembly stages (system + instructions + compiled context + conversation + tools)
- How the context compiler output is incorporated into the final prompt
- Compaction/pruning and rotation boundaries as they relate to prompt construction
- Plugin hook points that can inject/replace prompt content

Detailed context compilation algorithms (role-specific file selection, delta context, cache, marker files, skill bundling) remain owned by `Plans/FileSafe.md` Part B; this SSOT defines the **pipeline ordering and contracts**.

ContractRef: Primitive:DRYRules, ContractName:Plans/DRY_Rules.md

### SSOT references (DRY)
- Locked decisions: `Plans/Spec_Lock.json`
- Canonical contracts (events/tools/auth): `Plans/Contracts_V0.md`
- DRY + ContractRef rule: `Plans/DRY_Rules.md`
- Canonical terms: `Plans/Glossary.md`
- Deterministic ambiguity handling: `Plans/Decision_Policy.md` + `Plans/auto_decisions.jsonl`
- Context compilation + compaction marker + skill bundling: `Plans/FileSafe.md` Part B
- Run-mode context deltas + rotation outcome: `Plans/Run_Modes.md`
- Persona injection semantics: `Plans/Personas.md#PERSONA-INJECTION`
- Tool registry shapes (tool schema injection): `Plans/Tools.md`
- Plugins prompt hooks: `Plans/Plugins_System.md` (prompt transform hooks)
- GUI: `Plans/FinalGUISpec.md` (Injected Context breakdown; prompt preview UX)
- OpenCode baseline (assembly + compaction): `Plans/OpenCode_Deep_Extraction.md` §7B

---

## 1. Prompt assembly pipeline

<a id="ASSEMBLY"></a>

### 1.1 Inputs

The prompt pipeline consumes the following deterministic inputs:
- Run envelope (tier, mode, selected Persona ID(s), selected model/variant)
- Rules context (`Plans/agent-rules-context.md`)
- Resolved Personas (`Plans/Personas.md`)
- Discovered Skills registry (`Plans/Skills_System.md`) and any Persona `default_skill_refs`
- Tool registry definitions (`Plans/Tools.md`) and permission state (`Plans/Permissions_System.md`)
- Conversation history + evidence context (`Plans/storage-plan.md` projections)
- Context compiler outputs (`Plans/FileSafe.md` Part B)

ContractRef: ContractName:Plans/Run_Modes.md, ContractName:Plans/FileSafe.md

### 1.2 Stage ordering (canonical)

<a id="ASSEMBLY-PIPELINE"></a>

The prompt MUST be assembled in this stage order:

ContractRef: ContractName:Plans/assistant-chat-design.md, ContractName:Plans/Tools.md, ContractName:Plans/Plugins_System.md

1. **Resolve run config and surface context**: finalize the run envelope (tier/mode/platform/model), identify the active surface, and load the permissions snapshot.
2. **Resolve Persona selection inputs**: detect Persona mode (`manual` / `auto` / `hybrid`), inspect natural-language Persona requests, and compute the requested Persona when present.
3. **Resolve effective Persona and runtime state**: resolve Persona files, aliases, requested/effective platform/model/variant/runtime controls, and provider capability filtering.
4. **Resolve skills**: resolve `default_skill_refs` and compute skill bundle inputs.
5. **Compile context**: invoke the context compiler to produce compiled context artifacts and an `Injected Context` breakdown.
6. **Normalize structured attachments**: normalize browser and native selection attachments and stage them in deterministic thread-prep order.
7. **Assemble Instruction Bundle**: combine rules, Persona instructions, compiled context references, normalized attachment payloads, and effective runtime metadata needed for observability.
8. **Apply plugin transforms and attach tool schemas**: apply allowed plugin prompt transforms, then include canonical tool definitions and any custom tool schemas.
9. **Finalize**: emit the final prompt payload and effective-resolution metadata to the provider runner and event/history surfaces.

Rule: stages 1–9 MUST be deterministic given the same inputs and filesystem state.

ContractRef: ContractName:Plans/Plugins_System.md, ContractName:Plans/Tools.md, PolicyRule:Decision_Policy.md§3

Additional orchestration rules:
- mode-specific context overlays are applied during **Stage 5 / Compile context**, before structured attachments and the Injected Context breakdown are emitted
- `ask` and `plan` use the `read_only` overlay; `plan` additionally applies `plan_output_scaffold_v1`; `regular` and `yolo` use `full_execution`
- child/subagent/rotated runs may narrow an inherited overlay, but they MUST NOT widen a read-only overlay into `full_execution`
- when the active surface is **Orchestrator** or a delegated child/subagent run, the Instruction Bundle MUST carry the canonical orchestration flow contract `assess -> understand -> decompose -> act -> verify`

ContractRef: ContractName:Plans/orchestrator-subagent-integration.md, ContractName:Plans/Run_Modes.md, ContractName:Plans/assistant-chat-design.md

### 1.2B Skill resolution and runtime delivery

Skill runtime delivery is part of prompt assembly and context compilation.

Canonical order:
1. resolve requested skill refs from the skill registry
2. apply permission filtering
3. de-duplicate by canonical skill id
4. bundle selected skill content into compiled context when the compiler decides it is needed
5. preserve on-demand access through the `skill` tool for later runtime lookup

Provider-native skill directories and formats are not the canonical runtime delivery stage for MVP. They are discovery/import/export/interoperability inputs only.

ContractRef: ContractName:Plans/Skills_System.md, ContractName:Plans/FileSafe.md, ContractName:Plans/Tools.md

### 1.2A Structured attachment normalization for browser element context

Before final conversation payload emission, the prompt pipeline MUST normalize structured user attachments created by chat/composer surfaces, browser surfaces, and native document review surfaces.

For `browser_element_context` attachments:
- normalization occurs after context compilation and before final conversation serialization
- the structured attachment is serialized before the user's freeform message text
- bounded fields are serialized first: `tag_name`, `element_ref?`, bounded `text_content?`, `role?`, `rect`, `parent_path?`
- optional truncated HTML excerpt is included only if still within attachment budget
- attachment metadata MUST record when truncation occurred

ContractRef: ContractName:Plans/assistant-chat-design.md, ContractName:Plans/storage-plan.md, ContractName:Plans/FileSafe.md

For `browser_selection_context` attachments:
- normalization occurs after context compilation and before final conversation serialization
- attachments are serialized in stable thread-prep order before the user's freeform message text
- bounded fields are serialized first: `browser_session_id`, `session_class`, `page_url`, bounded `selected_text`, `selection_anchor?`, `requested_target`, `effective_target?`, and `truncation_state`
- raw unbounded DOM dumps or page bodies MUST NOT be injected into the prompt through this attachment path
- blocked or expired chips MUST NOT be serialized as successful user attachments

ContractRef: ContractName:Plans/assistant-chat-design.md, ContractName:Plans/storage-plan.md, ContractName:Plans/Section15_MVP_Promoted_Features_Spec.md

For `document_selection_context` attachments:
- normalization occurs after context compilation and before final conversation serialization
- attachments are serialized in stable thread-prep order before the user's freeform message text
- bounded fields are serialized first: `source_surface`, `bundle_id?`, `doc_id`, `doc_path/display_name`, bounded `selected_text`, anchor data, `requested_target`, `effective_target?`, `sensitivity_state`, and `truncation_state`
- raw unbounded document bodies MUST NOT be injected into the prompt through this attachment path
- blocked or expired chips MUST NOT be serialized as successful user attachments

ContractRef: ContractName:Plans/assistant-chat-design.md, ContractName:Plans/storage-plan.md, ContractName:Plans/FileSafe.md

This keeps browser capture and native document selection handoff deterministic across chat, document review, preview, and prompt assembly implementations.

ContractRef: ContractName:Plans/FileManager.md, ContractName:Plans/assistant-chat-design.md, ContractName:Plans/storage-plan.md

### 1.2C Investigation Context normalization for Debug Mode

Before final conversation payload emission, the prompt pipeline MUST normalize visible Investigation Context items for active Debug investigations.

Required normalization rules:
- normalization occurs after context compilation and before final conversation serialization
- the investigation header summary is serialized before individual evidence items
- items are sorted deterministically by operational priority (`target summary`, `baseline`, `active instrumentation`, `latest repro evidence`, `verification summary`) and then by capture time
- only bounded summaries, refs, and structured fields are inlined; raw logs, traces, screenshots, and recordings remain external artifact refs
- revoked, blocked, expired, and omitted items must not be serialized as successful prompt content

ContractRef: ContractName:Plans/assistant-chat-design.md, ContractName:Plans/Contracts_V0.md, ContractName:Plans/storage-plan.md

Minimum serialized fields are:
- `investigation_id`
- `debug_target_kind`
- bounded `primary_target_summary`
- `current_phase`
- `state`
- `verification_strength?`
- bounded per-item `summary`
- `artifact_refs?`
- `redaction_state`
- `truncation_state`

ContractRef: ContractName:Plans/Contracts_V0.md, ContractName:Plans/Runtime_Artifacts_Panel.md, ContractName:Plans/assistant-chat-design.md

### 1.3 Instruction Bundle structure

<a id="INSTRUCTION-BUNDLE"></a>

The compiled prompt MUST include an Instruction Bundle section that contains, at minimum:
ContractRef: ContractName:Plans/Contracts_V0.md#InstructionBundleAssembly, ContractName:Plans/FinalGUISpec.md, ContractName:Plans/assistant-chat-design.md
- active runtime mode and tier
- requested and effective workflow overlay when present
- active Persona identifier(s)
- rules context
- tool-policy snapshot
- Injected Context breakdown (paths + byte counts; truncation reason)
- active Investigation Context summary when a Debug investigation is active or an imported investigation bundle is attached

The canonical event-level contract for instruction-bundle assembly is defined in `Plans/Contracts_V0.md`.

ContractRef: ContractName:Plans/Contracts_V0.md#InstructionBundleAssembly, ContractName:Plans/FinalGUISpec.md, ContractName:Plans/assistant-chat-design.md

Rules:
- Investigation Context inclusion is additive to the normal instruction/work/memory bundle ordering; it does not create a parallel prompt path
- Debug investigations include bounded header fields and bounded item summaries only
- revoked, blocked, expired, and omitted investigation items remain visible in UI history but do not serialize as successful prompt inputs
- imported bundles use the same structured Investigation Context shape as live investigations, with provenance indicating imported origin

ContractRef: ContractName:Plans/storage-plan.md, ContractName:Plans/Runtime_Artifacts_Panel.md, ContractName:Plans/Contracts_V0.md

## 2. Compaction and pruning

<a id="COMPACTION"></a>

### 2.1 When compaction occurs

Compaction is triggered when:
- The platform reports context overflow, or
- The run exceeds configured context budgets, or
- The user requests compaction explicitly.

Mode-specific deltas are defined in `Plans/Run_Modes.md`; compaction marker lifecycle is defined in `Plans/FileSafe.md` Part B.

ContractRef: ContractName:Plans/Run_Modes.md, ContractName:Plans/FileSafe.md

### 2.2 Pruning contract

Rule: Pruning MUST be deterministic and MUST preserve the most recent, relevant context.

Rule: Tool-call outputs for protected tools MUST NOT be pruned. The protected-tool set includes `skill` (see `Plans/OpenCode_Deep_Extraction.md` baseline and `Plans/Run_Modes.md`).

ContractRef: ContractName:Plans/Run_Modes.md, ContractName:Plans/OpenCode_Deep_Extraction.md

---

## 3. Rotation (follow-up run spawning)

<a id="ROTATION"></a>

Rotation is the act of terminating a run and spawning a follow-up run (typically due to overflow/compaction constraints) while preserving continuity.


Rotation decision boundary (canonical):
- Deterministic compaction/pruning is attempted first against the **final assembled payload**. Rotation is considered only if the payload still cannot fit after compaction.
- `ask` and `plan` are **rotation-ineligible**. If the payload still does not fit after deterministic compaction, the run terminates under the normal failure/budget taxonomy rather than spawning a follow-up run.
- `regular` and `yolo` are **rotation-eligible**. A rotated follow-up run MUST inherit `thread_id`, `mode`, `strategy`, effective Persona/runtime state, and a narrowed-or-equal tool-policy snapshot.

Rule: When rotation occurs, the run outcome MUST be `done.rotated` per `Plans/Run_Modes.md`.

ContractRef: ContractName:Plans/Run_Modes.md

---

## 4. GUI integration

<a id="GUI"></a>

The GUI MUST expose:
- An "Injected Context" breakdown per run/turn (paths + byte counts; truncation reason)
- A safe preview of the compiled prompt (or its major sections) for transparency and debugging

ContractRef: ContractName:Plans/FinalGUISpec.md

---

## 5. Acceptance criteria

<a id="ACCEPTANCE"></a>

<a id="AC-PP01"></a>
**AC-PP01:** Prompt assembly MUST follow the canonical stage ordering in §1.2.

ContractRef: ContractName:Plans/Prompt_Pipeline.md#ASSEMBLY-PIPELINE

<a id="AC-PP02"></a>
**AC-PP02:** Compaction MUST preserve protected tool outputs; `skill` outputs MUST NOT be pruned.

ContractRef: ContractName:Plans/Prompt_Pipeline.md#COMPACTION, ContractName:Plans/Run_Modes.md
## 6. Effective Persona and Runtime Resolution Pipeline (2026-03-06)
This section locks the final requested/effective runtime pipeline for provider family selection, account or server-profile resolution, billing/entity attribution, and PM-native skills/MCP assembly.

ContractRef: ContractName:Plans/Contracts_V0.md, ContractName:Plans/Multi-Account.md, ContractName:Plans/Models_System.md

### 6.1 Expanded pre-prompt resolution stages

Before final prompt payload emission, the runtime MUST resolve the following in order:

ContractRef: ContractName:Plans/Skills_System.md, ContractName:Plans/Tools.md, ContractName:Plans/Provider_OpenCode.md

1. surface context and workflow overlay
2. requested provider entry and requested runtime controls
3. provider family and runtime-platform candidate set
4. eligible account rows and server-profile rows
5. entitlement or billing-entity selection where required
6. effective provider/runtime/model/auth/account-or-profile resolution
7. PM-native skill readiness and permission filtering
8. PM-owned MCP/tool availability
9. instruction bundle assembly
10. final run snapshot freeze and provider handoff

ContractRef: ContractName:Plans/Skills_System.md, ContractName:Plans/Tools.md, ContractName:Plans/Provider_OpenCode.md

### 6.2 Selection-source enumeration

`persona_selection_source` remains the canonical requested-Persona source enum.

`runtime_selection_source` is additive and SHOULD distinguish at least:
- `manual_ui`
- `surface_default`
- `config_default`
- `persona_preference`
- `auto_family_pool`
- `fallback`

The runtime MUST also persist a human-readable `selection_reason` suitable for detailed inspectors and audit history.

ContractRef: ContractName:Plans/FinalGUISpec.md, ContractName:Plans/Contracts_V0.md, ContractName:Plans/storage-plan.md

### 6.2.1 Canonical requested-Persona precedence

Requested Persona precedence remains unchanged:
1. explicit run-envelope or manual surface override
2. active scoped natural-language override
3. surface-specific explicit mapping
4. surface auto resolver candidate
5. config default
6. canonical fallback

Runtime/provider selection occurs after requested Persona resolution and MUST NOT rewrite the winning requested-Persona source.

ContractRef: ContractName:Plans/Personas.md, ContractName:Plans/Decision_Policy.md, ContractName:Plans/Contracts_V0.md

### 6.2.2 Runtime, account, and profile resolution stages

Provider/runtime resolution rules:
- `requested_platform` and `effective_platform` identify the concrete provider entry or runtime surface selected for execution.
- `provider_family_id` is additive and groups equivalent or pooled runtime surfaces without replacing the concrete provider entry.
- account-backed providers resolve an effective account row.
- server-bridged providers resolve an effective `connection_profile_id`.
- providers whose quota semantics depend on billing or organization context may also resolve an effective billing/entity bucket.

Examples:
- `Gemini` direct and `Gemini CLI` are separate runtime surfaces that may belong to the same family pool.
- `Codex` resolves separate account rows for `ChatGPT` and `API key` auth families.
- `GitHub Copilot` resolves one auth-backed account row plus a selected billing entity when premium-request semantics require it.
- `OpenCode` resolves a managed or attached server profile rather than an account row.

ContractRef: ContractName:Plans/Multi-Account.md, ContractName:Plans/CLI_Bridged_Providers.md, ContractName:Plans/Provider_OpenCode.md

### 6.3 Natural-language Persona invocation in prompt assembly

Natural-language Persona invocation remains conservative and applies only to Persona resolution.

It MUST NOT be used to silently rewrite:
- the requested provider entry
- the requested auth family
- the selected billing entity
- the selected server profile

Those selections remain explicit policy or configuration decisions surfaced through Agent-Config and runtime inspectors.

ContractRef: ContractName:Plans/Personas.md, ContractName:Plans/FinalGUISpec.md, ContractName:Plans/Multi-Account.md

<a id="EFFECTIVE-RESOLUTION-RECORD"></a>
### 6.4 Effective resolution record

The frozen requested/effective runtime snapshot MUST preserve these canonical base fields:

ContractRef: ContractName:Plans/Contracts_V0.md, ContractName:Plans/storage-plan.md, ContractName:Plans/usage-feature.md

- `requested_platform`
- `effective_platform`
- `requested_model`
- `effective_model`
- `requested_auth_mode`
- `effective_auth_mode`
- `effective_account_id`
- `effective_provider_identity`

Additive runtime-disclosure fields MAY include:
- `provider_family_id`
- `connection_profile_id`
- `requested_runtime_platform_id`
- `effective_runtime_platform_id`
- `requested_model_provider_id`
- `effective_model_provider_id`
- `requested_billing_entity_id`
- `effective_billing_entity_id`
- `effective_billing_entity_label`
- `effective_entitlement_class`
- `effective_project_id`
- `account_switch_reason`
- `usage_signal_confidence`

ContractRef: ContractName:Plans/Contracts_V0.md, ContractName:Plans/storage-plan.md, ContractName:Plans/usage-feature.md

Rules:
- additive fields MUST NOT shadow or rename the canonical base fields.
- the frozen snapshot is captured before provider handoff and is not recomputed from later UI state.
- if the provider internally re-routes to another effective model or runtime surface, the actual outcome is captured as runtime/event evidence while the frozen requested snapshot remains auditable.
- `selectable_unit_id` remains a scheduler/debug artifact and MUST NOT be promoted into the base frozen record.

ContractRef: ContractName:Plans/Contracts_V0.md, ContractName:Plans/Models_System.md, ContractName:Plans/CLI_Bridged_Providers.md

### 6.5 PM-native skills, MCP, and instruction assembly

Skill/tool/MCP resolution is part of the prompt pipeline, not a provider-specific afterthought.

Required rules:
- PM resolves skills from the PM registry and compatibility roots before provider execution begins.
- skill readiness is computed from `required_tool_refs` and `optional_tool_refs` plus permission state.
- PM-owned MCP availability is computed before run handoff and may generate CLI adapter config for bridged runtimes when required.
- provider-native skill or MCP files are optional projections. They are never the canonical runtime source of truth.
- bundling the selected PM-native skill content is mandatory for runtime correctness; the `skill` tool is the on-demand augmentation path.

ContractRef: ContractName:Plans/Skills_System.md, ContractName:Plans/Tools.md, ContractName:Plans/MiscPlan.md

### 6.6 UI transparency requirement

Before the run starts, Agent-Config and other detailed inspectors MUST be able to predict the likely effective runtime from the same resolution pipeline.

After the run starts, the frozen snapshot and any observed provider deviations MUST remain visible without heuristically recomputing the original decision.

ContractRef: ContractName:Plans/FinalGUISpec.md, ContractName:Plans/storage-plan.md, ContractName:Plans/usage-feature.md
## Remediation and Retry Metadata Addendum (2026-03-08)

Prompt assembly must carry the minimum metadata needed for deterministic remediation, retry, and audit behavior without widening execution authority.

Required runtime metadata when applicable:
- `failure_class`
- `blocked_reason_code`
- `retry_count`
- `safe_point_id`
- `remediation_root_id`
- `remediation_parent_attempt_id`
- `replan_generation`
- `wake_reason` when a run is resumed from blocked/backoff/remediation state

Rules:
- this metadata is for observability and deterministic continuation, not for speculative prompt stuffing
- child/remediation runs may narrow inherited context but must preserve lineage metadata needed for replay/debugging
- prompt assembly must not silently drop remediation lineage between parent attempt and remediation child

Acceptance criteria:
- remediation/retry runs receive the lineage metadata needed to continue coherently
- prompt assembly does not become the hidden source of truth; canonical truth remains in event/storage contracts
## Attempt Snapshot / Runtime Correlation Addendum (2026-03-09)

Prompt assembly and provider invocation handoff must preserve runtime correlation state.

### Required handoff bundle
Before provider invocation, the pipeline MUST assemble and retain:
- requested/effective persona and runtime state already defined elsewhere
- requested/effective model identifiers
- effective permission snapshot identifier
- `run_id`, `thread_id`, `node_id`, `attempt_id`
- `replan_generation`
- `safe_point_id` when present
- remediation lineage fields when present

### Stability rule
Once an attempt starts, the persisted handoff bundle for that attempt is immutable. A later retry or resumed blocked attempt creates a new attempt snapshot rather than mutating the old one in place.
## Attempt Snapshot Reconciliation Addendum (2026-03-09)

Prompt assembly and provider handoff MUST preserve runtime attempt identity without mutating prior attempts.

Rules:
- once an attempt starts, its handoff bundle is immutable
- retry, prerequisite-resumed work, and safe-point-restored reruns create new handoff bundles keyed by new `attempt_id` values
- new bundles MUST preserve lineage references (`safe_point_id`, remediation lineage, generation, requested/effective snapshots)
- prompt assembly MUST NOT become an alternate source of truth for blocked or retry state; canonical truth remains in events/projections
## Runtime Attempt Snapshot and Handoff Consolidation Addendum (2026-03-09)

The prompt pipeline MUST emit the same immutable runtime handoff bundle used by the provider envelope.

Required fields:
- `run_id`
- `node_id`
- `attempt_id`
- `scheduler_pass_id`
- `replan_generation`
- requested/effective model snapshot ids
- requested/effective permission snapshot ids
- `mutation_capable`
- `safe_point_id?`
- remediation lineage refs when present

Rules:
- snapshots are captured at attempt start and are immutable for that attempt
- retry/resume/rerun flows always create a new handoff bundle with a new `attempt_id`
- downstream providers and consumers MUST NOT infer missing runtime identity from prompt text alone
## Runtime Attempt Snapshot and Handoff Bundle

The prompt pipeline MUST emit the same immutable runtime handoff bundle used by the provider envelope.

Required fields:
- `run_id`
- `node_id`
- `attempt_id`
- `scheduler_pass_id`
- `replan_generation`
- requested/effective model snapshot ids
- requested/effective permission snapshot ids
- `mutation_capable`
- `safe_point_id?`
- remediation lineage refs when present

Rules:
- snapshots are captured at attempt start and are immutable for that attempt
- retry/resume/rerun flows always create a new handoff bundle with a new `attempt_id`
- downstream providers and consumers MUST NOT infer missing runtime identity from prompt text alone
