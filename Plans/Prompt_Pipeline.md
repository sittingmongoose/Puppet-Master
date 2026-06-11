# Prompt Pipeline (Canonical SSOT)


## Canonical owner-section requirements

These requirements are canonical live specification text for this owner document and preserve the required product, runtime, storage, UI, and governance details in owner-section form.

### Requested/effective account identity contract


- Compatibility-only source vocabulary is noncanonical; live wording uses the owner terminology below.
> **Compliance:** This document follows `Plans/DRY_Rules.md` and references SSOT contracts in `Plans/Contracts_V0.md`. Naming: "Puppet Master" only. No open questions; deterministic defaults per `Plans/Decision_Policy.md`.

## 0. Scope and SSOT status


This document is the **single canonical source of truth** for:
- prompt assembly stages (system + instructions + compiled context + conversation + tools)
- how the context compiler output is incorporated into the final prompt
- detailed context compilation algorithms (role-specific selection, delta context, cache heuristics, marker files, skill bundling)
- compaction/pruning and rotation boundaries as they relate to prompt construction
- plugin hook points that can inject or replace prompt content

ContractRef: Primitive:DRYRules, ContractName:Plans/DRY_Rules.md, ContractName:Plans/Contracts_V0.md

Other plans MAY describe how they consume compiled output, but they MUST NOT redefine context-selection, delta-context, cache, marker-file, skill-bundling, or compaction algorithms as separate SSOTs. `Plans/FileSafe.md` owns safety checks over compiled output; it does not own prompt/context compilation policy, and rewrite-era fallback wording must not turn FileSafe into a second context-compilation SSOT.

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
- LSP diagnostics context from `Plans/LSPSupport.md` may enter compiled context only through the permission, FileSafe, and event-contract boundaries in `Plans/Permissions_System.md`, `Plans/FileSafe.md`, and `Plans/Contracts_V0.md`; Prompt Pipeline consumes that context but does not own LSP behavior.
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

Browser capture normalization consumes only explicit chip-based attachment records from composer prep. Text-selection chips and element-pick chips remain distinct so `browser_selection_context` and `browser_element_context` preserve their separate capture paths through serialization.

For `browser_element_context` attachments:
- normalization occurs after context compilation and before final conversation serialization
- the structured attachment is serialized before the user's freeform message text
- bounded fields are serialized first: `tag_name`, `element_ref?`, bounded `text_content?`, `role?`, `rect`, `parent_path?`
- optional truncated HTML excerpt is included only if still within attachment budget
- attachment metadata MUST record when truncation occurred
- raw unbounded DOM dumps or page bodies MUST NOT be injected into the prompt through this attachment path
- blocked or expired chips MUST NOT be serialized as successful user attachments

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
- `requested_target` and `effective_target` must be preserved for annotation and send-to-chat handoff so the UI can show requested-vs-effective routing.
- `sensitivity_state` is forwarded into revision-prompt payloads and structured-output validation metadata so downstream providers and local validators receive the same disclosure boundary that context compilation used.
- When the user requests targeted revision, the revision-prompt payload is a deterministic list ordered by `doc_id`, source position, and `annotation_id`; each record includes `annotation_id`, `operation`, `intent_kind`, bounded `selected_text`, `operation_payload`, `anchor`, and provenance.
- Providers with transport-native `/structured-output` may use `schema_enforced_structured_revision`; providers without that guarantee may use `validated_structured_revision` only after local validation of ids, `/order/shape`, and anchor applicability.

ContractRef: ContractName:Plans/assistant-chat-design.md, ContractName:Plans/storage-plan.md, ContractName:Plans/FileSafe.md

This keeps browser capture and native document selection handoff deterministic across chat, document review, preview, and prompt assembly implementations.

ContractRef: ContractName:Plans/FileManager.md, ContractName:Plans/assistant-chat-design.md, ContractName:Plans/storage-plan.md

### 1.2C Investigation Context normalization for Debug Mode

Before final conversation payload emission, the prompt pipeline MUST normalize visible Investigation Context items for active Debug investigations.

Required normalization rules:
- normalization occurs after context compilation and before final conversation serialization
- the investigation header summary is serialized before individual evidence items
- items are sorted deterministically by operational priority (`target summary`, `baseline`, `active instrumentation`, `latest repro evidence`, `verification summary`) and then by capture time
- the higher-level `investigation_id` / `bundle_id?` grouping identity travels with each Debug prompt payload: `investigation_id` groups evidence across `terminal_session_id`, `dev_session_id`, `browser_session_id`, and DAP-style debug identity; `bundle_id?` applies to imported or exported evidence bundles and does not replace those source anchors
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
- external instruction-file sources and policy documents (for example `AGENTS.md` or `CLAUDE.md`-style sources) are compiled under a bounded instruction-source budget instead of being injected in full by default
- PM-owned `AGENTS.md` content remains the canonical instruction source for PM-managed provider projections; provider-native instruction files are generated/import/export projections, not peer authorities
- when an instruction source would exceed the current budget, PM includes a bounded excerpt plus provenance (`path`, byte count, truncation reason) and loads additional segments only on demand through context selection or explicit reads
- system prompt, persona instructions, and active tool schemas remain in the untouchable set even when oversized instruction sources are clipped

ContractRef: ContractName:Plans/storage-plan.md, ContractName:Plans/Runtime_Artifacts_Panel.md, ContractName:Plans/Contracts_V0.md

## 2. Compaction and pruning
### 2.0 Compaction-immune content

Post-compaction prompt reconstruction MUST preserve system, persona, and instruction-source commitments such as `AGENTS.md` or `CLAUDE.md`; a compaction LLM or summary pass must never replace those commitments with an empty or weakened system prompt.

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

**Truncatable set** (`/truncatable`, trimmed only when total immune content exceeds `max_compaction_immune_pct`):
- user-pinned context
- blocks tagged `compaction_immune: true` (`/compaction-immune`)
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

Provider-specific / per-provider cache strategy is explicit:
- **Anthropic:** ephemeral/cache-control marker strategy. PM emits `cache_control: { type: "ephemeral" }` on eligible message blocks. Anthropic's server-side cache handles TTL and invalidation transparently; PM does not manage Anthropic cache state.
- **Google/Gemini family:** provider-native `cachedContent` strategy. PM creates a `cachedContent` resource via the Gemini Caching API with a configurable TTL (default: 5 minutes). The returned `cachedContent` resource name is passed in subsequent `generateContent` requests via the `cachedContent` field. PM tracks the resource TTL and proactively refreshes cached content before expiry when the underlying context has not changed. Token savings are calculated as the difference between the full context token count and `cachedContentTokenCount` reported in provider usage metadata. When `cache_with_oauth` is `false` for the active Gemini surface, cache-marker emission is suppressed entirely.
- **OpenAI family:** metadata or adapter-controlled cache-hint strategy. PM sets cache-hint headers or metadata per OpenAI conventions. Server-side cache behavior is provider-managed; PM does not track cache state for OpenAI surfaces.
- **Unsupported surfaces:** disable cache-marker emission and fall back safely. No cache-related fields are emitted in the request.

ContractRef: ContractName:Plans/Models_System.md, ContractName:Plans/CLI_Bridged_Providers.md

Reasoning-block payloads MUST be preserved through replay and compaction. PM MUST first prefer provider-compatible replay or conversion of reasoning/assistant state; lossy summarization is allowed only when the target surface cannot accept the original form, and the summary MUST remain explicit about being synthesized from prior reasoning.

`/reasoning` blocks are `/replay`-safe state: PM preserves or converts them before compaction, records provider `reasoning_tokens` on each `UsageEvent`, and MUST NOT silently strip thinking/reasoning content merely because an adapter lacks a native replay field.

Out-of-order reasoning-block delivery through LiteLLM/Bedrock-style proxies is tolerated by the replay state machine: PM buffers or reorders provider-compatible reasoning state instead of crashing or collapsing it into lossy summary by default.

ContractRef: ContractName:Plans/usage-feature.md, ContractName:Plans/Contracts_V0.md, ContractName:Plans/Architecture_Invariants.md

Context-compression references such as Xeditor `_context_updates` are implementation references only. PM preserves the referenced behavior as incremental per-tool-call tool-result compression evaluated at every tool-call boundary rather than whole-session compaction; summaries retain causal replay metadata and canonical tool/result lineage.

OpenCode replay evidence from `message-v2` / `message-v2.ts` is a compatibility hazard, not PM canon: synthetic compaction text such as "What did we do so far?" must be tagged as synthetic continuation or compaction metadata and must not replay as a user-authored instruction.

Historical assistant serialization rules:
- historical turns serialize the final user-visible assistant answer plus any tool/result or lineage metadata needed for causal replay
- transient progress/status chatter, partial streaming fragments, and superseded intermediate assistant states are omitted unless they remain unresolved or are explicitly pinned
- message boundaries remain explicit across user, assistant, system, and synthetic-continue turns so replay cannot merge stale assistant progress into a new request; the compatibility marker `/assistant/system/synthetic` resolves to these boundary markers only

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
5. **Suppressed** -> PM blocks further synthetic continue because /loop-prevention rules fired.

ContractRef: ContractName:Plans/Contracts_V0.md, ContractName:Plans/Run_Modes.md

Loop-prevention rules:
- automatic synthetic continue is capped at 2 attempts per run segment
- PM MUST compare the latest assistant tail hash against `last_assistant_tail_hash`; if the tail is unchanged after a synthetic continue, PM suppresses further auto-continue
- PM suppresses further auto-continue if the provider returns effectively empty continuation output or repeats the same continuation prompt hash without net new content
- suppression emits `diag.synthetic_continue_loop_prevented` with the reason and leaves the run to normal failure or rotation handling instead of silently retrying forever

Task-based checkpoint markers in seglog preserve prompt/session recovery points for long sessions; this recovery lesson keeps checkpoint recovery separate from synthetic-continue injection.

ContractRef: ContractName:Plans/Architecture_Invariants.md, ContractName:Plans/Executor_Protocol.md

### 2.2 Dynamic context shrinking

Thresholds are model-owned metadata:
- `pressure_start_pct = 70`
- `pressure_aggressive_pct = 85`
- `large_block_threshold = 1200`

ContractRef: ContractName:Plans/Models_System.md, ContractName:Plans/storage-plan.md

Low-context warning rule: if remaining context falls below 15% of the effective window after adding tool output or injected context, PM emits a model-visible diagnostic warning so the agent can adapt before hard compaction. This is based on post-execution accounting, not pre-flight prediction, and large tool-output markers use the 512 KiB policy boundary where truncation is applied.

ContractRef: ContractName:Plans/Contracts_V0.md, ContractName:Plans/Executor_Protocol.md

Agent-visible context-budget contract:
- the instruction bundle or equivalent runtime metadata exposes the effective context window, latest estimated used tokens/bytes, remaining percent, current pressure state, and whether compaction ran on the previous turn
- after large tool output or injected context, PM updates this snapshot before the next provider turn so the agent can choose shorter replies, narrower reads, or earlier summarization
- the budget snapshot is advisory rather than a perfect preflight predictor, but it MUST reflect the latest post-assembly estimate rather than a stale earlier value
- per-tool default context policies for tool-result shaping use the enum `full`, `summarize`, `meta_only`, and `exclude`; these policies guide effective context assembly and never rewrite canonical tool-call or tool-result history
- token-budget allocation reserves budget in this order: provider/system/persona instructions, tool definitions, current user turn, required runtime identity and safety state, selected/retrieved context, then optional tool-result context. When the post-assembly estimate exceeds the effective window, optional blocks are summarized, marked `meta_only`, or excluded according to their owner policy; required identity and safety state cannot be silently dropped.
- Default `/token/budget` allocation targets are `immune(30%)`, `history(30%)`, `current_turn(15%)`, `tool_results(20%)`, and `contingency(5%)`; model metadata MAY override percentages, but the live snapshot must name each bucket and preserve deterministic truncation order across priority classes `P0`-`P3`.

ContractRef: ContractName:Plans/Contracts_V0.md, ContractName:Plans/assistant-chat-design.md, ContractName:Plans/Architecture_Invariants.md

### 2.3 Post-filter integrity rules

After filtering, pruning, or compaction, PM MUST validate role alternation and message-boundary correctness. Plugin transforms (`plugin-transform` surfaces) MUST NOT delete system or persona content, reorder messages in a way that breaks alternation, or modify immune content.

ContractRef: ContractName:Plans/Plugins_System.md, ContractName:Plans/Architecture_Invariants.md

Repair behavior when filtering would leave malformed history (`warn + placeholder if needed`):
- if filtering, pruning, or transform output empties a required message position, PM emits an explicit warning diagnostic before serialization continues
- PM then injects the smallest placeholder or structural no-op needed to preserve canonical role alternation and replay-safe message boundaries
- placeholder repair preserves structure only; it MUST NOT invent substantive user intent, assistant claims, tool calls, or hidden policy content
- if no safe placeholder exists for the target surface, PM aborts serialization and surfaces a structured error instead of emitting malformed history
- This path is `warn-and-repair`, not `validation-only`: validation detects malformed post-filter history, and the owner pipeline either repairs it with an audited placeholder or aborts before provider serialization.

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

PM-native skill and tool readiness uses explicit dependency metadata instead of heuristics from skill body text. `required_tool_refs` and `optional_tool_refs` use canonical PM tool registry names and can refer to MCP-backed tools, built-in PM tools, or provider-exposed tools when those tools are canonically registered. The resolver computes per-skill `/runtime`, `/readiness`, and `/effective` state from skill validity, permission state, required-tool availability, and effective provider/runtime tool availability.

Runner contract for PM-native skills during provider execution:
1. call `list_skills_for_agent(project_root, permissions)` to resolve the allowed-skill universe;
2. permission-filter that universe before prompt compilation;
3. bundle selected skill content into compiled `/context/tool` material before provider execution;
4. expose the PM `skill` tool for on-demand lookup during the run;
5. send the provider request envelope with `prompt_parts`, context files, and `tool_policy` like any other run.

This flow is transport-agnostic. CLI-backed providers, direct providers, and server-bridged providers receive PM skill context through normal compiled prompt/context assembly rather than through a mandatory provider-native install path or by passing raw skill names/paths to platform CLIs/SDKs.

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
- For OpenAI/Codex setup, `Sign in with ChatGPT` is an account-linking authentication path that connects a ChatGPT identity to an API account and stores local credentials; prompt/runtime evidence keeps that ChatGPT-backed identity separate from API-key-backed accounts.
- `GitHub Copilot` resolves one auth-backed account row plus a selected billing entity when premium-request semantics require it
- `OpenCode` resolves a managed or attached server profile rather than an account row

### 6.2A Settings, persona, and resolver model


Runtime resolution freezes a requested/effective identity envelope before provider/model execution begins.

#### Requested/effective account identity contract
- Add `requested_account_id` alongside `requested_account_policy`.
- Model `requested_account_id` separately from `requested_account_policy` so account choice and policy posture never collapse into one field.
- Add `requested_account_binding` and govern `provider_account_id` as subordinate provider-native metadata.
- `requested_account_binding` uses the exact value set `none | preferred | required`.
- Add `requested_account_binding` with `none` / `preferred` / `required` semantics and display `Requested account / Requested binding / Effective account / Switch reason`.
- Carry requested/effective account identity through runtime, bridged-provider, and permission envelopes.
- Retire `provider_account_id` from canonical account-identity naming; it stays as a provider-native echo field only.

The shared identity envelope emitted before prompt assembly contains at least `requested_account_id`, `requested_account_policy`, `requested_account_binding`, `effective_account_id`, `effective_provider_identity`, `execution_role`, `operational_identity`, and `account_switch_reason`.

#### Three-axis settings model and resolver emit shape
- Define the three-axis settings model `source` / `request` / `execution`.
- `source` records where a candidate value came from, `request` records what the caller asked for, and `execution` records what the runtime actually receives after capability and policy checks.
- The display grammar preserves requested versus effective values for provider, model, variant, auth mode, account identity, and worker policy.
- Resolver inputs include Persona choice, run-envelope overrides, surface defaults, scope policy, capability snapshot, account/profile availability, worktree assignment, and execution-role context.
- Assistant worktree execution remains cwd-based: prompt assembly may reference the canonical `execution_unit_context`, but it does not inject a separate worktree prompt block merely to make tools operate in the worktree. `working_directory`, FileSafe, tool `cwd`, and provider handoff carry the worktree context.
- Deterministic resolver matrix order: explicit override -> scoped owner policy -> Persona preference -> surface/stage default -> project/global default -> last-used state when permitted -> provider default.
- Resolver emit shape includes `requested_platform`, `effective_platform`, `requested_model`, `effective_model`, `requested_variant`, `effective_variant`, `requested_auth_mode`, `effective_auth_mode`, `requested_account_id`, `effective_account_id`, `execution_role`, `selection_reason`, `resolver_matrix_entry`, and `worker_policy_display`.

### P5 prompt/runtime identity recovery requirements

- `Plans/Orchestrator_Page.md`, `Plans/storage-plan.md`, `Plans/FinalGUISpec.md`, `Plans/Models_System.md`, `Plans/Multi-Account.md`, `Plans/Personas.md`, `Plans/Prompt_Pipeline.md` - The rerun confirms additional concrete misses: - three-way export taxonomy (`record` / `bundle` / `view`) - shared Orchestrator export manifest contract - export-family distinctions (Evidence / Artifact / Ledger / Run / Record) - three-axis settings model (`source` / `request` / `execution`) - named display grammar (`Inherited from`, `Overridden by`, `Requested`, `Effective`, `Reason`, `Support`) - explicit source-layer enumeration - worker-policy display under the same requested/effective grammar - Orchestrator actor-type and operation-type resolver inputs - deterministic resolver matrix and actor→persona defaults - resolver emit shape (ranked candidates, winner, fallback reason)
- `newtools.md` and assistant-memory still ended with unresolved canonicalization gaps: - the remaining missing orchestrator command gap set is now tight and explicit. - doctor-ID canonicalization is still broken internally. - `CustomHeadlessTool` still lacks stable config/identity/permission ownership and still conflicts with state/config SSOT. - `live.*` remains plan-local instead of contract-registered. - `memory.gist.*`, AutoRunBoundary/AutoMilestone, project-switch handoff, and `attention_required` durability still lack a consistent event/persistence/command ownership story.
- required for all provider-executed attempts: - requested/effective persona snapshot ref - requested/effective model snapshot ref - requested/effective permission snapshot ref - `requested_auth_mode?` - `effective_auth_mode?` - `requested_account_policy?` - `effective_account_id?` - `account_switch_reason?`
- The highest-risk Prompt Pipeline ownership cleanup is requested/effective runtime identity duplication: Prompt Pipeline owns prompt-assembly handoff shape, storage owns durable records, and tier context survives only as compatibility/derived grouping, not a third runtime identity authority.
- Prompt Pipeline MUST NOT teach `tier-tree` or `active-tier` widget semantics as reusable widget `SSOT`; prompt examples and context bundles may reference derived tier labels only as compatibility display metadata while Widget_System owns widget taxonomy.
- Conversational/shared-runtime and actor-scoped permission consequences are still under-modeled: - `Permissions_System.md` resolves by tool/context/mode but not by invoking runtime entity, lane, or account - session approval carryover and reject-cascade semantics are still effectively single-session/single-lane even though the rewrite requires parallel actors sharing provider runtime
- `Contracts_V0.md` - add/own canonical snapshot field names such as: - `requested_account_id` - `requested_account_binding` - `execution_role` - operational-identity snapshot block names - own stable event names for: - account pressure / switch history - any new blocked/recovery/governance event families - own route-payload envelope name only if it becomes a generic cross-cutting contract
- `Plans/Personas.md` - still violates canonical field naming in its own SSOT and still has no structural slot for overseer-class actor types
- `Plans/Prompt_Pipeline.md` - still the highest-leverage SSOT for requested/effective identity, but still carries tier-era persisted values, missing scope fields, and no durable account-switch history model
- `Plans/Prompt_Pipeline.md` still uses tier-era scope in owner-level text: - run envelope still says `tier` - assembly stages still say `tier/mode/platform/model` - orchestration rules still say the prompt flow must not create new execution tiers - Persona resolver text still refers to stage/tier/task context - `persona_override_owner_id` still allows `tier_id`
- `Prompt_Pipeline.md` and `Contracts_V0.md` carry `requested_account_policy`, but no parallel requested-side concrete account field exists, so downstream docs are forced to guess how explicit account pinning is represented.
- Storage/usage contracts still carry tier-era runtime assumptions in places the broader second sweep now makes more obviously risky: - `storage-plan.md` still leans on `tier_id` / `run.tier_*` - `usage-feature.md` still treats `tier_id` as a core attribution dimension and does not yet pivot to `seam_id` / `package_id` / `lane_id` - neither doc is yet explicit enough about graph-patch lineage or degraded projection-trust states
- `Plans/Contracts_V0.md` - still the primary SSOT for canonical payloads, but now clearly needs addendum consolidation plus actor-envelope ownership
- Prompt Pipeline has become internally split on what the dispatch boundary actually carries: - §6.5 defines a rich runtime identity record with auth/account/switch fields - later handoff/addenda collapse the bundle back to IDs + model/permission refs and even lose `thread_id` - this now creates a concrete SSOT fracture between Prompt Pipeline, bridged providers, and conversational surfaces
- Replace worker/verifier/page contracts with canonical runtime snapshot refs or inline canonical runtime bundles instead of ad hoc persona/provider/model strings.
- Prompt Pipeline still has the sharpest canonical gap for requested-vs-effective truth: - `requested_account_policy` exists - `effective_account_id` exists - but there is still no canonical requested concrete-account field, so explicit account pinning cannot be shown truthfully when runtime falls back or switches
- Prompt Pipeline still has one last schema ownership hole: it requires explicit blocked/degraded behavior when no eligible account exists, but the canonical effective-resolution record still lacks a first-class blocked/degraded reason family and still only carries singleton `account_switch_reason?`
- Tool/runtime surface gaps also remain sharply defined: - `Formatters_System.md`, `LSPSupport.md`, `Plugins_System.md`, and `Skills_System.md` still lack clean ownership boundaries for mutation-capable semantics, hosted-vs-DAE execution reachability, tool/event identity, and plugin/skill introspection or isolation guarantees. - `agent-rules-context.md` still under-scopes actor coverage and execution-role inputs relative to Prompt Pipeline, Multi-Account, and Assistant chat identity disclosure requirements.
- But the owner doc still frames those fields through stale scope vocabulary: - `Run envelope (tier, mode, selected Persona ID(s), selected model/variant)` - `Active mode and tier` - `plan_or_tier_default` - `Orchestrator tier override` - `stage/tier/task/repo context` - `persona_override_owner_id` still allows `tier_id`
- Introduce `execution_role` / `actor_role` into effective-resolution, event, and usage contracts.
- Extend `validation_pass_report` identity so it carries the planning/governance lineage needed for audit and routing: - `wizard_id` - `project_id` - `thread_id?` - `phase_plan_ref?` - input/output artifact-bundle refs - `requirements_quality_report_ref?` when applicable
- `Plans/Orchestrator_Page.md` - still acts as a practical UI SSOT while encoding the old tab/widget/tier structure
- `Contracts_V0.md` is closer to the target than many downstream docs, but it still needs addendum consolidation to stop reintroducing ambiguity from inside the supposed SSOT. - destructive Git/worktree actions should resolve through Source Control semantics, even if launched from Orchestrator.
- The gap is real and now very concrete: - canonical docs already model `requested_account_policy` - canonical docs already model `effective_account_id` - but there is still no canonical way to represent a requested concrete account on the requested side
- 5. **Pathing migration.** Design the replacement for `<phase>/<task>/<subtask>` canonical paths. Candidates: `<package_id>/<node_id>`, `<seam_id>/<package_id>/<node_id>`, or content-addressed.
- The remaining work splits cleanly into two buckets: - **structural gaps still needing research decisions** - **reconciliation-heavy gaps where the direction exists but SSOT ownership/field naming/event families still conflict**
- Extend the shared effective-resolution/runtime identity model with: - `execution_role` - `requested_operational_identity?` - `effective_operational_identity?`
- But it is still not safe to call this `ready_for_reconciliation` because at least a few remaining gaps are not just stale wording; they are missing canonical owners or broken SSOT integrity.
- Topic is known: `Orchestrator`. - User asked to hold off on substantive work until the follow-up prompt arrived; this initialization prompt is the first explicit action request after topic confirmation.
- `blocked_reason_code` should remain the SSOT instead of ad hoc blocked strings - `attempt_id` must stay unique per dispatch; retry/resume should not reuse old attempt ids
- Recommended `requested_account_binding` values: - `none` - `preferred` - `required`
- The repo still lacks a coherent owner for several rewrite-era operational nouns and primitives, so adjacent docs can cite terms (`Overseer`, `attempt`, `Seglog`, promotion senses, handoff kinds) that no SSOT doc actually defines.
- This is a cross-cutting SSOT problem, not just a page-local doc issue. - `Widget_System.md` can re-spread stale Orchestrator assumptions if it is not reconciled early.
- `FinalGUISpec.md` aligns with only one of those outcomes. - Because `Widget_System.md` claims SSOT precedence for widget layout key handling, this contradiction is more than editorial drift.
- `manual_preferred_account_id` now exists as a concrete preferred-account override, but it still does not solve the broader missing `requested_account_id` asymmetry in the shared runtime identity grammar.
- After this merge, the remaining partial tail should sit uniformly at `Gemini + Opus + Sonnet + GPT-5.4`.
- After this merge, the remaining partial tail should sit uniformly at `Gemini + Opus + Sonnet + GPT-5.4 + GPT-5.2`.
- **Prompt pipeline carries tier identity.** `Prompt_Pipeline.md` §1.2 embeds tier/mode in the run envelope and instruction bundle. No node-identity, package-identity, or lane-identity fields exist.


ContractRef: ContractName:Plans/Models_System.md, ContractName:Plans/Multi-Account.md, ContractName:Plans/Contracts_V0.md

### 6.3 Natural-language Persona invocation in prompt assembly

Natural-language Persona invocation remains conservative and applies only to Persona resolution.

Assistant worktree execution is cwd-based. Prompt assembly may reference the canonical `execution_unit_context`, but it does not inject a separate worktree prompt block merely to make tools operate in the worktree; `working_directory`, FileSafe, tool `cwd`, and provider handoff carry that context.

It MUST NOT be used to silently rewrite:
- the requested provider entry
- the requested auth family
- the selected billing entity
- the selected server profile

Those selections remain explicit policy or configuration decisions surfaced through Agent-Config and runtime inspectors.

### 6.4 Effective resolution record

#### Shared runtime identity fields
- Carry `execution_role` plus requested/effective operational identity in shared runtime identity.
- Project them into effective-resolution, attempt, usage, and inspector surfaces.
- Transfer execution_role, requested_account_id, operational_identity, account-switch and pressure ownership, blocked_sequence minting, startup recovery handshake, and DAE jail/approval policy into owner and consumer docs.
- Carry usage switch-history and usage execution-role follow-through.

The effective-resolution record therefore preserves `requested_account_id`, `effective_account_id`, `requested_operational_identity`, `effective_operational_identity`, `execution_role`, `account_switch_lineage[]`, `account_pressure_owner`, `blocked_sequence`, `approval_id?`, and `dae_jail_posture`.

#### execution_unit_context canonical record
- Introduce `execution_unit_context` as canonical runtime-facing context object.
- Demote `TierContext` to a derived or compatibility-only selection/decomposition helper.
- Anchor worker spawn, recovery, remediation, coordination, and UI inspection to `execution_unit_context`.
- Retire `tier_id`; canonical selection now keys from `execution_unit_type` plus `execution_unit_id` inside `execution_unit_context`.

```typescript
execution_unit_context {
  execution_unit_id: string,
  execution_unit_type: 'run' | 'seam' | 'package' | 'node' | 'overseer' | 'delegated_subagent',
  parent_execution_unit_id?: string,
  execution_role: string,
  worktree_id?: string,
  ownership_transition_from?: string
}
```

#### Blocked-policy and usage transfer
- `blocked_sequence` is minted once per blocked episode lineage and reused by startup recovery instead of being reminted.
- Startup recovery handshake must rebind the preserved `execution_unit_context`, runtime identity, and `blocked_sequence` before deferred work resumes.
- DAE jail posture and approval posture stay attached to the same effective-resolution record so recovery, remediation, and usage inspection all read one canonical blocked-policy source.
- Usage surfaces preserve execution role, requested/effective account identity, and switch history even when the effective provider or account changes during recovery.

ContractRef: ContractName:Plans/Models_System.md, ContractName:Plans/Contracts_V0.md, ContractName:Plans/Multi-Account.md

### 6.5 PM-native skills, MCP, and instruction assembly

Skill/tool/MCP resolution is part of the prompt pipeline, not a provider-specific afterthought. /web/skills/runtime packets are implementation-ready reconciliation inputs only; they do not become a second `SSOT` for prompt assembly, tool contracts, skill resolution, or runtime identity.

Required rules:
- PM resolves skills from the PM registry and compatibility roots before provider execution begins
- skill readiness is computed from `required_tool_refs` and `optional_tool_refs` plus permission state
- PM-owned MCP availability is computed before run handoff and may generate CLI adapter config for bridged runtimes when required
- provider-native skill or MCP files are optional projections and are never the canonical runtime source of truth
- provider-native skill files, `/systems`-style compatibility trees, and other external surfaces are optional `/projection` layers for interoperability; they are not the canonical MVP runtime path and do not replace PM registry/bundling/`skill` `/tool` delivery
- the optional compatibility layer is not mandatory by default because it can introduce duplication and drift against the PM skill registry, projection failures can make a provider look misconfigured even when PM-native skills remain ready, CLI multi-account sandboxes would duplicate projected state unless projection is centralized, and provider-specific provider-native files can imply semantics weaker or different than canonical PM skill/tool behavior
- skill resolution/bundling happens before provider execution; bundling the selected PM-native skill content is mandatory for runtime correctness, and the `skill` tool is the on-demand augmentation path

### 6.6 UI transparency requirement

Before the run starts, Agent-Config and other detailed inspectors MUST be able to predict the likely effective runtime from the same resolution pipeline.

After the run starts, the frozen snapshot and any observed provider deviations MUST remain visible without heuristically recomputing the original decision.

### Runtime Attempt Snapshot and Handoff Bundle

#### Attempt snapshot fields
- Extend wizard/interview handoff with project/thread/wizard/runtime identity and execution_role.
- Every attempt snapshot preserves `project_id`, `thread_id`, `wizard_id`, `resolution_id`, `execution_unit_context`, requested/effective account identity, `execution_role`, `operational_identity`, `blocked_sequence`, `approval_scope_key`, and `launched_run_request_ref`.
- The attempt snapshot remains the canonical bridge between planning-time wizard state and the run that actually executes the approved work.

#### Wizard/interview lineage bridge
- Extend `validation_pass_report` with planning/governance lineage and an explicit bridge into the launched run.
- `validation_pass_report` preserves `phase_plan_ref`, `requirements_quality_report_ref`, `workflow_run_id`, `pass_verdict`, `wizard_snapshot_ref`, and `launched_run_id` / `launched_run_ref`.
- Review, preview, resume, and drill-through surfaces follow that launched-run bridge instead of reconstructing lineage from timestamps, filenames, or ad hoc provider metadata.

ContractRef: ContractName:Plans/interview-subagent-integration.md, ContractName:Plans/Contracts_V0.md

## Runtime Attempt Snapshot and Handoff Consolidation Addendum (2026-03-09)

This addendum is retained as historical reconciliation context only.

Canonical runtime handoff fields and rules now live in `### Runtime Attempt Snapshot and Handoff Bundle` inside `## 6. Effective Persona and Runtime Resolution Pipeline (2026-03-06)`.

Nothing in this historical note may override the owner section in §6.

## Owner / Consumer Map

This source-preserving standardization keeps the owner and consumer boundaries stated in the original document body. During this batch, `Plans/Prompt_Pipeline.md` remains the owner doc for the behavior described by its preserved sections, while cross-doc ownership follows the ContractRefs and boundary notes already present in the original text.

ContractRef: ContractName:Plans/Plan_Document_System.md, ContractName:Plans/Bootstrap_Planning_Migration.md

## PlanUnits

### PP-001 - Prompt Pipeline (Canonical SSOT) Source-Preserving PlanUnit

```yaml
plan_unit_id: PP-001
unit_type: requirement
status: accepted
owner_doc: Plans/Prompt_Pipeline.md
canonical_text: Plans/Prompt_Pipeline.md keeps its pre-migration canonical source content losslessly in place while exposing a source-preserving PlanUnit for Plan Document System indexing. Fine-grained requirement splitting may occur in a later controlled batch using the recorded span_map and coverage_map.
gui_related: true
gui_classification_reason: The preserved source spans include GUI/UI/user-visible presentation or interactive control requirements.
split_recommended: true
depends_on: []
unblocks: []
acceptance_criteria:
- Original source spans remain available for exact-text audit.
- Every original span for this doc has one coverage_map disposition.
- ContractRefs, anchors or aliases, negative constraints, compatibility-only notes, stale/retired dispositions, owner/consumer boundaries, and source lineage are preserved by span_map and coverage_map.
- No WorkNodes, NodeSeeds, or executable build tasks are created by this PlanUnit.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-001-standardize-plans
- python3 scripts/pm-plans-verify.py run-gates
- python3 scripts/pm-shard-plans.py --check
risk_class: source_preservation
reasoning_tier: standard
context_scope: single_plan_doc
implementation_surfaces:
- Plans/Prompt_Pipeline.md
node_compile_hint:
  mode: source_preserving_planunit
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:Prompt_Pipeline-S0001
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:Prompt_Pipeline-S0002
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:Prompt_Pipeline-S0003
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:Prompt_Pipeline-S0004
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:Prompt_Pipeline-S0005
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:Prompt_Pipeline-S0006
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:Prompt_Pipeline-S0007
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:Prompt_Pipeline-S0008
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:Prompt_Pipeline-S0009
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:Prompt_Pipeline-S0010
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:Prompt_Pipeline-S0011
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:Prompt_Pipeline-S0012
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:Prompt_Pipeline-S0013
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:Prompt_Pipeline-S0014
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:Prompt_Pipeline-S0015
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:Prompt_Pipeline-S0016
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:Prompt_Pipeline-S0017
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:Prompt_Pipeline-S0018
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:Prompt_Pipeline-S0019
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:Prompt_Pipeline-S0020
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:Prompt_Pipeline-S0021
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:Prompt_Pipeline-S0022
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:Prompt_Pipeline-S0023
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:Prompt_Pipeline-S0024
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:Prompt_Pipeline-S0025
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:Prompt_Pipeline-S0026
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:Prompt_Pipeline-S0027
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:Prompt_Pipeline-S0028
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:Prompt_Pipeline-S0029
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:Prompt_Pipeline-S0030
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:Prompt_Pipeline-S0031
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:Prompt_Pipeline-S0032
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:Prompt_Pipeline-S0033
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:Prompt_Pipeline-S0034
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:Prompt_Pipeline-S0035
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:Prompt_Pipeline-S0036
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:Prompt_Pipeline-S0037
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:Prompt_Pipeline-S0038
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:Prompt_Pipeline-S0039
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:Prompt_Pipeline-S0040
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:Prompt_Pipeline-S0041
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:Prompt_Pipeline-S0042
preserved_exact_tokens:
- Prompt Pipeline (Canonical SSOT)
- Canonical owner-section requirements
- Requested/effective account identity contract
- 0. Scope and SSOT status
- 'ContractRef: Primitive:DRYRules, ContractName:Plans/DRY_Rules.md, ContractName:Plans/Contracts_V0.md'
- 'ContractRef: ContractName:Plans/FileSafe.md, ContractName:Plans/Run_Modes.md, ContractName:Plans/Architecture_Invariants.md'
- SSOT references (DRY)
- 1. Prompt assembly pipeline
- 1.1 Inputs
- 'ContractRef: ContractName:Plans/Run_Modes.md, ContractName:Plans/Contracts_V0.md'
- 1.2 Stage ordering (canonical)
- 'ContractRef: ContractName:Plans/assistant-chat-design.md, ContractName:Plans/Tools.md, ContractName:Plans/Plugins_System.md'
- 'ContractRef: ContractName:Plans/Plugins_System.md, ContractName:Plans/Tools.md, PolicyRule:Decision_Policy.md§3'
- 'ContractRef: ContractName:Plans/orchestrator-subagent-integration.md, ContractName:Plans/Run_Modes.md, ContractName:Plans/assistant-chat-design.md'
- 1.2B Skill resolution and runtime delivery
- 'ContractRef: ContractName:Plans/Skills_System.md, ContractName:Plans/FileSafe.md, ContractName:Plans/Tools.md'
- 1.2A Structured attachment normalization for browser element context
- 'ContractRef: ContractName:Plans/assistant-chat-design.md, ContractName:Plans/storage-plan.md, ContractName:Plans/FileSafe.md'
- 'ContractRef: ContractName:Plans/assistant-chat-design.md, ContractName:Plans/storage-plan.md, ContractName:Plans/Section15_MVP_Promoted_Features_Spec.md'
- 1.2C Investigation Context normalization for Debug Mode
- 'ContractRef: ContractName:Plans/assistant-chat-design.md, ContractName:Plans/Contracts_V0.md, ContractName:Plans/storage-plan.md'
- 'ContractRef: ContractName:Plans/Contracts_V0.md, ContractName:Plans/Runtime_Artifacts_Panel.md, ContractName:Plans/assistant-chat-design.md'
- 1.3 Instruction Bundle structure
- 'ContractRef: ContractName:Plans/Contracts_V0.md#InstructionBundleAssembly, ContractName:Plans/FinalGUISpec.md, ContractName:Plans/assistant-chat-design.md'
negative_constraints:
- Other plans MAY describe how they consume compiled output, but they MUST NOT redefine context-selection, delta-context, cache, marker-file, skill-bundling, or compaction algorithms as separate SSOTs. `Plans/FileSafe.md` owns safety checks over compiled output; it does not own prompt/context compilat
- '- child/subagent/rotated runs may narrow an inherited overlay, but they MUST NOT widen a read-only overlay into `full_execution`'
- '- raw unbounded DOM dumps or page bodies MUST NOT be injected into the prompt through this attachment path'
- '- blocked or expired chips MUST NOT be serialized as successful user attachments'
- '- raw unbounded document bodies MUST NOT be injected into the prompt through this attachment path'
- '- revoked, blocked, expired, and omitted items must not be serialized as successful prompt content'
- 'The total immune set MUST NOT exceed `max_compaction_immune_pct` (default: 30, overridable per model metadata) percent of the effective context window.'
- '`/reasoning` blocks are `/replay`-safe state: PM preserves or converts them before compaction, records provider `reasoning_tokens` on each `UsageEvent`, and MUST NOT silently strip thinking/reasoning content merely because an adapter lacks a native replay field.'
- 'OpenCode replay evidence from `message-v2` / `message-v2.ts` is a compatibility hazard, not PM canon: synthetic compaction text such as "What did we do so far?" must be tagged as synthetic continuation or compaction metadata and must not replay as a user-authored instruction.'
- After filtering, pruning, or compaction, PM MUST validate role alternation and message-boundary correctness. Plugin transforms (`plugin-transform` surfaces) MUST NOT delete system or persona content, reorder messages in a way that breaks alternation, or modify immune content.
- '- placeholder repair preserves structure only; it MUST NOT invent substantive user intent, assistant claims, tool calls, or hidden policy content'
- '**AC-PP02:** Compaction MUST preserve protected tool outputs; `skill` outputs MUST NOT be pruned.'
- Runtime/provider selection occurs after requested Persona resolution and MUST NOT rewrite the winning requested-Persona source.
- '- Prompt Pipeline MUST NOT teach `tier-tree` or `active-tier` widget semantics as reusable widget `SSOT`; prompt examples and context bundles may reference derived tier labels only as compatibility display metadata while Widget_System owns widget taxonomy.'
- '- `Plans/Prompt_Pipeline.md` still uses tier-era scope in owner-level text: - run envelope still says `tier` - assembly stages still say `tier/mode/platform/model` - orchestration rules still say the prompt flow must not create new execution tiers - Persona resolver text still refers to stage/tier/t'
- 'It MUST NOT be used to silently rewrite:'
compatibility_only_notes:
- '- Compatibility-only source vocabulary is noncanonical; live wording uses the owner terminology below.'
- 'OpenCode replay evidence from `message-v2` / `message-v2.ts` is a compatibility hazard, not PM canon: synthetic compaction text such as "What did we do so far?" must be tagged as synthetic continuation or compaction metadata and must not replay as a user-authored instruction.'
- '- message boundaries remain explicit across user, assistant, system, and synthetic-continue turns so replay cannot merge stale assistant progress into a new request; the compatibility marker `/assistant/system/synthetic` resolves to these boundary markers only'
- '- The highest-risk Prompt Pipeline ownership cleanup is requested/effective runtime identity duplication: Prompt Pipeline owns prompt-assembly handoff shape, storage owns durable records, and tier context survives only as compatibility/derived grouping, not a third runtime identity authority.'
- '- Prompt Pipeline MUST NOT teach `tier-tree` or `active-tier` widget semantics as reusable widget `SSOT`; prompt examples and context bundles may reference derived tier labels only as compatibility display metadata while Widget_System owns widget taxonomy.'
- '- Demote `TierContext` to a derived or compatibility-only selection/decomposition helper.'
- '- PM resolves skills from the PM registry and compatibility roots before provider execution begins'
- '- provider-native skill files, `/systems`-style compatibility trees, and other external surfaces are optional `/projection` layers for interoperability; they are not the canonical MVP runtime path and do not replace PM registry/bundling/`skill` `/tool` delivery'
- '- the optional compatibility layer is not mandatory by default because it can introduce duplication and drift against the PM skill registry, projection failures can make a provider look misconfigured even when PM-native skills remain ready, CLI multi-account sandboxes would duplicate projected state'
stale_retired_dispositions:
- '- message boundaries remain explicit across user, assistant, system, and synthetic-continue turns so replay cannot merge stale assistant progress into a new request; the compatibility marker `/assistant/system/synthetic` resolves to these boundary markers only'
- '- the budget snapshot is advisory rather than a perfect preflight predictor, but it MUST reflect the latest post-assembly estimate rather than a stale earlier value'
- '- But the owner doc still frames those fields through stale scope vocabulary: - `Run envelope (tier, mode, selected Persona ID(s), selected model/variant)` - `Active mode and tier` - `plan_or_tier_default` - `Orchestrator tier override` - `stage/tier/task/repo context` - `persona_override_owner_id` '
- '- But it is still not safe to call this `ready_for_reconciliation` because at least a few remaining gaps are not just stale wording; they are missing canonical owners or broken SSOT integrity.'
- '- This is a cross-cutting SSOT problem, not just a page-local doc issue. - `Widget_System.md` can re-spread stale Orchestrator assumptions if it is not reconciled early.'
owner_boundary_notes:
- '# Prompt Pipeline (Canonical SSOT)'
- '## Canonical owner-section requirements'
- These requirements are canonical live specification text for this owner document and preserve the required product, runtime, storage, UI, and governance details in owner-section form.
- '- Compatibility-only source vocabulary is noncanonical; live wording uses the owner terminology below.'
- '> **Compliance:** This document follows `Plans/DRY_Rules.md` and references SSOT contracts in `Plans/Contracts_V0.md`. Naming: "Puppet Master" only. No open questions; deterministic defaults per `Plans/Decision_Policy.md`.'
- '## 0. Scope and SSOT status'
- 'This document is the **single canonical source of truth** for:'
- Other plans MAY describe how they consume compiled output, but they MUST NOT redefine context-selection, delta-context, cache, marker-file, skill-bundling, or compaction algorithms as separate SSOTs. `Plans/FileSafe.md` owns safety checks over compiled output; it does not own prompt/context compilat
- '### SSOT references (DRY)'
- '- Canonical contracts (events/tools/auth): `Plans/Contracts_V0.md`'
- '- Canonical terms: `Plans/Glossary.md`'
- 'Canonical run envelope fields:'
- Node/package/lane/seam identity is the canonical execution context; any surviving tier labels are derived grouping metadata only.
- '### 1.2 Stage ordering (canonical)'
- '8. **Apply plugin transforms and attach tool schemas**: apply allowed plugin prompt transforms, then include canonical tool definitions and any custom tool schemas.'
- '- when the active surface is **Orchestrator** or a delegated child/subagent run, the Instruction Bundle MUST carry the canonical orchestration flow contract `assess -> understand -> decompose -> act -> verify`'
- 'Canonical order:'
- 3. de-duplicate by canonical skill id
- Provider-native skill directories and formats are not the canonical runtime delivery stage for MVP. They are discovery/import/export/interoperability inputs only.
- '- `sensitivity_state` is forwarded into revision-prompt payloads and structured-output validation metadata so downstream providers and local validators receive the same disclosure boundary that context compilation used.'
- The canonical event-level contract for instruction-bundle assembly is defined in `Plans/Contracts_V0.md`.
- '- PM-owned `AGENTS.md` content remains the canonical instruction source for PM-managed provider projections; provider-native instruction files are generated/import/export projections, not peer authorities'
- Context-compression references such as Xeditor `_context_updates` are implementation references only. PM preserves the referenced behavior as incremental per-tool-call tool-result compression evaluated at every tool-call boundary rather than whole-session compaction; summaries retain causal replay m
- '- message boundaries remain explicit across user, assistant, system, and synthetic-continue turns so replay cannot merge stale assistant progress into a new request; the compatibility marker `/assistant/system/synthetic` resolves to these boundary markers only'
owner_hints:
- Plans/Prompt_Pipeline.md
split_recommendation_reason: The doc-level source-preserving unit covers both GUI-related and non-GUI spans; future fine-grained PlanUnits should split those surfaces when safe.
```

## Migration Coverage

Original hash: `7344aebefa758505ec0fd7b76c5a98b69768cc9253b2e8bd873cd30cdd0e8be7`.

Run-scoped proof artifacts:
- `Plans/.plan_migration/pds-20260611-001-standardize-plans/original_hashes.json`
- `Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl`
- `Plans/.plan_migration/pds-20260611-001-standardize-plans/coverage_map.jsonl`
- `Plans/.plan_migration/pds-20260611-001-standardize-plans/anchor_aliases.json`

All original spans from `Prompt_Pipeline-S0001` through `Prompt_Pipeline-S0042` are preserved in place and mapped in `coverage_map.jsonl` to `PP-001`. This batch did not update Spec Lock, generated shards, evidence bundles, auto_decisions, or plan_graph, and it did not create WorkNodes, NodeSeeds, or executable build tasks.
