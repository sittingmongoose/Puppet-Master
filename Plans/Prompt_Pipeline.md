# Prompt Pipeline (Canonical SSOT)

> **Compliance:** This document follows `Plans/DRY_Rules.md` and references SSOT contracts in `Plans/Contracts_V0.md`. Naming: "Puppet Master" only. No open questions; deterministic defaults per `Plans/Decision_Policy.md`.

## 0. Scope and SSOT status

This document is the **single canonical source of truth** for:
- prompt assembly stages (system + instructions + compiled context + conversation + tools)
- how the context compiler output is incorporated into the final prompt
- detailed context compilation algorithms (role-specific selection, delta context, cache heuristics, marker files, skill bundling)
- compaction/pruning and rotation boundaries as they relate to prompt construction
- plugin hook points that can inject or replace prompt content

ContractRef: Primitive:DRYRules, ContractName:Plans/DRY_Rules.md, ContractName:Plans/Contracts_V0.md

Other plans MAY describe how they consume compiled output, but they MUST NOT redefine context-selection, delta-context, cache, marker-file, skill-bundling, or compaction algorithms as separate SSOTs. `Plans/FileSafe.md` owns safety checks over compiled output; it does not own prompt/context compilation policy.

ContractRef: ContractName:Plans/FileSafe.md, ContractName:Plans/Run_Modes.md, ContractName:Plans/Architecture_Invariants.md

### SSOT references (DRY)
- Locked decisions: `Plans/Spec_Lock.json`
- Canonical contracts (events/tools/auth): `Plans/Contracts_V0.md`
- DRY + ContractRef rule: `Plans/DRY_Rules.md`
- Canonical terms: `Plans/Glossary.md`
- Deterministic ambiguity handling: `Plans/Decision_Policy.md` + `Plans/auto_decisions.jsonl`
- FileSafe safety checks over compiled output: `Plans/FileSafe.md`
- Run-mode context deltas + rotation outcome: `Plans/Run_Modes.md`
- Persona injection semantics: `Plans/Personas.md#PERSONA-INJECTION`
- Tool registry shapes (tool schema injection): `Plans/Tools.md`
- Plugins prompt hooks: `Plans/Plugins_System.md`
- GUI/context detail consumers: `Plans/FinalGUISpec.md`, `Plans/assistant-chat-design.md`
- OpenCode baseline (assembly + compaction): `Plans/OpenCode_Deep_Extraction.md` §7B

---

## 1. Prompt assembly pipeline

<a id="ASSEMBLY"></a>

### 1.1 Inputs

The prompt pipeline consumes the following deterministic inputs:
- Run envelope (session/timestamp identity, node/package/lane execution context, selected Persona ID(s), selected model/variant)
- Rules context (`Plans/agent-rules-context.md`)
- Resolved Personas (`Plans/Personas.md`)
- Discovered Skills registry (`Plans/Skills_System.md`) and any Persona `default_skill_refs`
- Tool registry definitions (`Plans/Tools.md`) and permission state (`Plans/Permissions_System.md`)
- Conversation history + evidence context (`Plans/storage-plan.md` projections)
- Compiled context artifacts produced by the prompt pipeline context compiler

Canonical run envelope fields:
- `session_id`
- `timestamp`
- `thread_id`
- `run_id`
- `node_id: string`
- `package_id: string`
- `lane_id: string?`
- `seam_id: string?`
- selected Persona identifier(s)
- requested/effective model and variant refs
- active surface and execution-strategy refs when present

Node/package/lane/seam identity is the canonical execution context; any surviving tier labels are derived grouping metadata only.

ContractRef: ContractName:Plans/Run_Modes.md, ContractName:Plans/Contracts_V0.md

### 1.2 Stage ordering (canonical)

<a id="ASSEMBLY-PIPELINE"></a>

The prompt MUST be assembled in this stage order:

ContractRef: ContractName:Plans/assistant-chat-design.md, ContractName:Plans/Tools.md, ContractName:Plans/Plugins_System.md

1. **Resolve run config and surface context**: finalize the run envelope (node/package/lane execution context, platform/model, and surface identity), identify the active surface, and load the permissions snapshot.
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
- active execution context (`node_id`, `package_id`, `lane_id?`, `seam_id?`)
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
- external instruction files and policy documents (for example `AGENTS.md` or `CLAUDE.md`-style sources) are compiled under a bounded instruction-source budget instead of being injected in full by default
- when an instruction source would exceed the current budget, PM includes a bounded excerpt plus provenance (`path`, byte count, truncation reason) and loads additional segments only on demand through context selection or explicit reads
- system prompt, persona instructions, and active tool schemas remain in the untouchable set even when oversized instruction sources are clipped

ContractRef: ContractName:Plans/storage-plan.md, ContractName:Plans/Runtime_Artifacts_Panel.md, ContractName:Plans/Contracts_V0.md

## 2. Compaction and pruning
### 2.0 Compaction-immune content

The following content MUST survive compaction unchanged unless the user explicitly removes it:
- system prompt and persona instructions
- active tool schemas
- user-pinned context
- blocks tagged `compaction_immune: true`
- current and recent reasoning blocks required for correct continuation

ContractRef: ContractName:Plans/assistant-chat-design.md, ContractName:Plans/Contracts_V0.md

The total immune set MUST NOT exceed `max_compaction_immune_pct` (default: 30, overridable per model metadata) percent of the effective context window.

ContractRef: ContractName:Plans/Models_System.md, ContractName:Plans/Architecture_Invariants.md

#### 2.0.1 Compaction overflow algorithm

The compaction-immune set is partitioned into two tiers with distinct truncation rules:

**Untouchable set** (never truncated under any circumstances):
- system prompt
- persona instructions
- active tool schemas

ContractRef: ContractName:Plans/Architecture_Invariants.md, ContractName:Plans/Contracts_V0.md

**Truncatable set** (trimmed only when total immune content exceeds `max_compaction_immune_pct`):
- user-pinned context
- blocks tagged `compaction_immune: true`
- current and recent reasoning blocks required for correct continuation
- ordered lowest-priority first and FIFO within each priority tier

ContractRef: ContractName:Plans/Models_System.md, ContractName:Plans/Architecture_Invariants.md

Overflow handling:
1. If the total immune set exceeds `max_compaction_immune_pct`, trim only the truncatable set until the total is within cap.
2. If the untouchable set alone exceeds the cap, keep it intact, emit `diag.compaction_immune_overflow`, and continue execution.

ContractRef: ContractName:Plans/Contracts_V0.md, ContractName:Plans/Executor_Protocol.md

### 2.1 Context assembly and cache preservation

Prompt assembly preserves cache-friendly stable prefixes. PM keeps role-specific context compilation, compaction-aware re-reads, and once-per-phase skill bundling so repeated turns do not re-inject the same bulky context unnecessarily.

ContractRef: ContractName:Plans/FileSafe.md, ContractName:Plans/Tools.md

Provider-specific cache strategy is explicit:
- **Anthropic:** ephemeral/cache-control marker strategy. PM emits `cache_control: { type: "ephemeral" }` on eligible message blocks. Anthropic's server-side cache handles TTL and invalidation transparently; PM does not manage Anthropic cache state.
- **Google/Gemini family:** provider-native `cachedContent` strategy. PM creates a `cachedContent` resource via the Gemini Caching API with a configurable TTL (default: 5 minutes). The returned `cachedContent` resource name is passed in subsequent `generateContent` requests via the `cachedContent` field. PM tracks the resource TTL and proactively refreshes cached content before expiry when the underlying context has not changed. Token savings are calculated as the difference between the full context token count and `cachedContentTokenCount` reported in provider usage metadata. When `cache_with_oauth` is `false` for the active Gemini surface, cache-marker emission is suppressed entirely.
- **OpenAI family:** metadata or adapter-controlled cache-hint strategy. PM sets cache-hint headers or metadata per OpenAI conventions. Server-side cache behavior is provider-managed; PM does not track cache state for OpenAI surfaces.
- **Unsupported surfaces:** disable cache-marker emission and fall back safely. No cache-related fields are emitted in the request.

ContractRef: ContractName:Plans/Models_System.md, ContractName:Plans/CLI_Bridged_Providers.md

Reasoning blocks MUST be preserved through replay and compaction. PM MUST first prefer provider-compatible replay or conversion of reasoning/assistant state; lossy summarization is allowed only when the target surface cannot accept the original form, and the summary MUST remain explicit about being synthesized from prior reasoning.

ContractRef: ContractName:Plans/usage-feature.md, ContractName:Plans/Contracts_V0.md, ContractName:Plans/Architecture_Invariants.md

Historical assistant serialization rules:
- historical turns serialize the final user-visible assistant answer plus any tool/result or lineage metadata needed for causal replay
- transient progress/status chatter, partial streaming fragments, and superseded intermediate assistant states are omitted unless they remain unresolved or are explicitly pinned
- message boundaries remain explicit across user, assistant, system, and synthetic-continue turns so replay cannot merge stale assistant progress into a new request

ContractRef: ContractName:Plans/storage-plan.md, ContractName:Plans/Contracts_V0.md, ContractName:Plans/Run_Modes.md

#### 2.1.1 Synthetic-continue state machine and loop prevention

Synthetic continue is the bounded fallback used when a provider stops because of length or context pressure but PM still has an incomplete answer that should continue within the same run segment.

ContractRef: ContractName:Plans/Run_Modes.md, ContractName:Plans/storage-plan.md

Eligibility rules:
- only `regular` and `yolo` runs may auto-inject synthetic continue
- PM considers synthetic continue only after normal compaction and cache-preserving reassembly have already run
- synthetic continue is prohibited once a terminal `done` outcome, explicit user cancellation, HITL pause, or parent-mediated defer decision exists

ContractRef: ContractName:Plans/Executor_Protocol.md, ContractName:Plans/assistant-chat-design.md

State tracked per run segment:
- `synthetic_continue_count`
- `last_assistant_tail_hash`
- `last_continue_prompt_hash`
- `last_continue_reason`

ContractRef: ContractName:Plans/storage-plan.md, ContractName:Plans/Contracts_V0.md

State machine:
1. **Idle** -> default state while no continuation is needed.
2. **Eligible** -> provider stopped for `length` or equivalent incomplete-output condition and PM still needs continuation.
3. **ContinueInjected** -> PM injects one canonical continuation turn using the prior assistant tail and current run lineage.
4. **ContinueObserved** -> provider emits new assistant content after the synthetic continue.
5. **Suppressed** -> PM blocks further synthetic continue because loop-prevention rules fired.

ContractRef: ContractName:Plans/Contracts_V0.md, ContractName:Plans/Run_Modes.md

Loop-prevention rules:
- automatic synthetic continue is capped at 2 attempts per run segment
- PM MUST compare the latest assistant tail hash against `last_assistant_tail_hash`; if the tail is unchanged after a synthetic continue, PM suppresses further auto-continue
- PM suppresses further auto-continue if the provider returns effectively empty continuation output or repeats the same continuation prompt hash without net new content
- suppression emits `diag.synthetic_continue_loop_prevented` with the reason and leaves the run to normal failure or rotation handling instead of silently retrying forever

ContractRef: ContractName:Plans/Architecture_Invariants.md, ContractName:Plans/Executor_Protocol.md

### 2.2 Dynamic context shrinking

Thresholds are model-owned metadata:
- `pressure_start_pct = 70`
- `pressure_aggressive_pct = 85`
- `large_block_threshold = 1200`

ContractRef: ContractName:Plans/Models_System.md, ContractName:Plans/storage-plan.md

Low-context warning rule: if remaining context falls below 15% of the effective window after adding tool output or injected context, PM emits a diagnostic warning so the agent can adapt before hard compaction.

ContractRef: ContractName:Plans/Contracts_V0.md, ContractName:Plans/Executor_Protocol.md

Agent-visible context budget contract:
- the instruction bundle or equivalent runtime metadata exposes the effective context window, latest estimated used tokens/bytes, remaining percent, current pressure state, and whether compaction ran on the previous turn
- after large tool output or injected context, PM updates this snapshot before the next provider turn so the agent can choose shorter replies, narrower reads, or earlier summarization
- the budget snapshot is advisory rather than a perfect preflight predictor, but it MUST reflect the latest post-assembly estimate rather than a stale earlier value

ContractRef: ContractName:Plans/Contracts_V0.md, ContractName:Plans/assistant-chat-design.md, ContractName:Plans/Architecture_Invariants.md

### 2.3 Post-filter integrity rules

After filtering, pruning, or compaction, PM MUST validate role alternation and message-boundary correctness. Plugin transforms MUST NOT delete system or persona content, reorder messages in a way that breaks alternation, or modify immune content.

ContractRef: ContractName:Plans/Plugins_System.md, ContractName:Plans/Architecture_Invariants.md

Repair behavior when filtering would leave malformed history:
- if filtering, pruning, or transform output empties a required message position, PM emits an explicit warning diagnostic before serialization continues
- PM then injects the smallest placeholder or structural no-op needed to preserve canonical role alternation and replay-safe message boundaries
- placeholder repair preserves structure only; it MUST NOT invent substantive user intent, assistant claims, tool calls, or hidden policy content
- if no safe placeholder exists for the target surface, PM aborts serialization and surfaces a structured error instead of emitting malformed history

ContractRef: ContractName:Plans/Contracts_V0.md, ContractName:Plans/storage-plan.md, ContractName:Plans/Architecture_Invariants.md
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

### 6.2.1 Canonical requested-Persona precedence

Requested Persona precedence remains unchanged:
1. explicit run-envelope or manual surface override
2. active scoped natural-language override
3. surface-specific explicit mapping
4. surface auto resolver candidate
5. config default
6. canonical fallback

Runtime/provider selection occurs after requested Persona resolution and MUST NOT rewrite the winning requested-Persona source.

### 6.2.2 Runtime, account, and profile resolution stages

Provider/runtime resolution rules:
- `requested_platform` and `effective_platform` identify the concrete provider entry or runtime surface selected for execution
- `provider_family_id` is additive and groups equivalent or pooled runtime surfaces without replacing the concrete provider entry
- account-backed providers resolve an effective account row
- server-bridged providers resolve an effective `connection_profile_id`
- providers whose quota semantics depend on billing or organization context may also resolve an effective billing/entity bucket

Examples:
- `Gemini` direct and `Gemini CLI` are separate runtime surfaces that may belong to the same family pool
- `Codex` resolves separate account rows for `ChatGPT` and `API key` auth families
- `GitHub Copilot` resolves one auth-backed account row plus a selected billing entity when premium-request semantics require it
- `OpenCode` resolves a managed or attached server profile rather than an account row

### 6.2A Settings, persona, and resolver model

Runtime resolution depends on:
- Active persona (role, scope, available tools)
- Resolver chain (user → coordinator → escalation owner → DAE)
- Requested/effective account identity (for provider and permission scoping)
- execution_role and operational_identity (for attribution)
- blocked_sequence and approval state (for recovery path)

Rules:
- Persona is NOT an actor kind; it is a role and scope selection within a single actor (e.g., chat assistant can switch personas but remains "assistant").
- Resolver chain is determined by approval_scope_key and execution_role, not by tier or persona.
- Requested/effective account identity is resolved BEFORE persona selection so that provider/model choices are scoped to the available account.
- operational_identity is derived from execution_role + requested/effective account; it remains canonical for usage attribution and approval scoping.

ContractRef: ContractName:Plans/Contracts_V0.md, ContractName:Plans/Personas.md

### 6.3 Natural-language Persona invocation in prompt assembly

Natural-language Persona invocation remains conservative and applies only to Persona resolution.

It MUST NOT be used to silently rewrite:
- the requested provider entry
- the requested auth family
- the selected billing entity
- the selected server profile

Those selections remain explicit policy or configuration decisions surfaced through Agent-Config and runtime inspectors.

### 6.4 Effective resolution record

Effective resolution record captures:
```
{
  resolution_id: string,
  attempt_id: string,
  persona: string,
  requested_account_id?: string,
  effective_account_id: string,
  execution_role: string,
  operational_identity: string,
  resolver_chain: ResolverFrame[],
  blocked_sequence?: number,
  approval_id?: string,
  model: string,
  model_variant?: string,
  provider: string,
  trace_level: string,
  created_utc: string,
  wizard_lineage?: WizardFrame[]
}
```

Rules:
- Effective resolution record is immutable once created.
- resolver_chain shows the canonical decision path; audit trails and replay logic must traverse resolver_chain, not run history.
- wizard_lineage is a list of wizard invocations (including persona/settings selections) that led to this resolution.
- approval_id and blocked_sequence survive resolution reuse and approval reuse across attempts.
- model selection is final per resolution_id; no mid-resolution model switching.

ContractRef: ContractName:Plans/Contracts_V0.md §Requested/effective account, ContractName:Plans/chain-wizard-flexibility.md

### 6.5 PM-native skills, MCP, and instruction assembly

Skill/tool/MCP resolution is part of the prompt pipeline, not a provider-specific afterthought.

Required rules:
- PM resolves skills from the PM registry and compatibility roots before provider execution begins
- skill readiness is computed from `required_tool_refs` and `optional_tool_refs` plus permission state
- PM-owned MCP availability is computed before run handoff and may generate CLI adapter config for bridged runtimes when required
- provider-native skill or MCP files are optional projections and are never the canonical runtime source of truth
- bundling the selected PM-native skill content is mandatory for runtime correctness; the `skill` tool is the on-demand augmentation path

### 6.6 UI transparency requirement

Before the run starts, Agent-Config and other detailed inspectors MUST be able to predict the likely effective runtime from the same resolution pipeline.

After the run starts, the frozen snapshot and any observed provider deviations MUST remain visible without heuristically recomputing the original decision.

### Runtime Attempt Snapshot and Handoff Bundle

Each attempt creates a snapshot:
```
{
  attempt_id: string,
  blocked_sequence: number,
  resolution_id: string,
  execution_unit_context: {
    execution_unit_id: string,
    execution_unit_type: 'run' | 'seam' | 'package' | 'node' | 'overseer' | 'delegated_subagent',
    execution_role: string
  },
  requested_account_id?: string,
  effective_account_id: string,
  operational_identity: string,
  approval_scope_key: string,
  blocked_episode_id: string,
  wizard_lineage: WizardFrame[],
  safe_points: SafePoint[],
  usage_attribution: UsageAttribution,
  evidence_refs: EvidenceRef[],
  created_utc: string,
  handoff_destination?: string
}
```

Rules:
- attempt_id is unique per blocked_sequence increment.
- wizard_lineage is cumulative; it preserves all wizard invocations across attempt retries within the same blocked_episode.
- safe_points are deterministic checkpoints that allow resume from a specific state without replay.
- usage_attribution links to the canonical usage event record in seglog/ledger, not ephemeral provider tokens.
- Handoff bundles reference this snapshot plus execution output, concerns, artifacts, and route/open artifacts.

ContractRef: ContractName:Plans/runtime_safe_points.md, ContractName:Plans/usage-feature.md, ContractName:Plans/storage-plan.md

## Runtime Attempt Snapshot and Handoff Consolidation Addendum (2026-03-09)

This addendum is retained as historical reconciliation context only.

Canonical runtime handoff fields and rules now live in `### Runtime Attempt Snapshot and Handoff Bundle` inside `## 6. Effective Persona and Runtime Resolution Pipeline (2026-03-06)`.

Nothing in this historical note may override the owner section in §6.