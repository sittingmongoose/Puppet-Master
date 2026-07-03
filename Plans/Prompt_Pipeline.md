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
- Extend `auditor_cycle_report` identity so it carries the planning/governance lineage needed for audit and routing. Legacy `validation_pass_report` mirrors may carry the same lineage only with `compatibility_only: true` and `cycle_report_ref`: - `wizard_id` - `project_id` - `thread_id?` - `phase_plan_ref?` - input/output artifact-bundle refs - `requirements_quality_report_ref?` when applicable
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
- Extend `auditor_cycle_report` with planning/governance lineage and an explicit bridge into the launched run. Legacy `validation_pass_report` mirrors may expose the same bridge only with `compatibility_only: true` and `cycle_report_ref`.
- `auditor_cycle_report` preserves `phase_plan_ref`, `requirements_quality_report_ref`, `workflow_run_id`, `pass_verdict`, `wizard_snapshot_ref`, and `launched_run_id` / `launched_run_ref`.
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

### PP-002 - Prompt Pipeline SSOT Document Identity

```yaml
plan_unit_id: PP-002
unit_type: requirement
status: accepted
owner_doc: Plans/Prompt_Pipeline.md
canonical_text: >-
  Prompt Pipeline is the canonical SSOT owner document for prompt pipeline behavior.
gui_related: false
gui_classification_reason: This unit preserves document identity rather than UI behavior.
split_recommended: false
depends_on: []
unblocks: []
acceptance_criteria:
  - "Prompt Pipeline SSOT Document Identity remains addressable as a fine-grained Prompt Pipeline PlanUnit."
  - "ContractRefs, anchors, exact tokens, negative constraints, compatibility-only notes, stale/retired dispositions, owner/consumer boundaries, and source lineage from the source spans remain preserved."
  - "No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created by this PlanUnit."
validation_surfaces:
  - "python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits"
  - "python3 scripts/pm-plan-index.py validate"
risk_class: prompt_pipeline_drift
reasoning_tier: standard
context_scope: prompt_pipeline
implementation_surfaces:
  - Plans/Prompt_Pipeline.md
node_compile_hint:
  mode: requirement
  create_worknodes: false
source_lineage:
  - Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Prompt_Pipeline-S0001
preserved_exact_tokens:
  - "Prompt Pipeline (Canonical SSOT)"
negative_constraints: []
preserved_contractrefs: []
owner_hints:
  - "Plans/Prompt_Pipeline.md"
```

### PP-003 - Canonical Owner-Section Requirement Banner

```yaml
plan_unit_id: PP-003
unit_type: requirement
status: accepted
owner_doc: Plans/Prompt_Pipeline.md
canonical_text: >-
  Prompt Pipeline owner-section requirements preserve product, runtime, storage, UI, and governance details in owner-section form.
gui_related: true
gui_classification_reason: The source span explicitly names UI details as preserved owner-section requirements.
split_recommended: false
depends_on:
  - "PP-002"
unblocks: []
acceptance_criteria:
  - "Canonical Owner-Section Requirement Banner remains addressable as a fine-grained Prompt Pipeline PlanUnit."
  - "ContractRefs, anchors, exact tokens, negative constraints, compatibility-only notes, stale/retired dispositions, owner/consumer boundaries, and source lineage from the source spans remain preserved."
  - "No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created by this PlanUnit."
validation_surfaces:
  - "python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits"
  - "python3 scripts/pm-plan-index.py validate"
risk_class: prompt_pipeline_drift
reasoning_tier: standard
context_scope: prompt_pipeline
implementation_surfaces:
  - Plans/Prompt_Pipeline.md
node_compile_hint:
  mode: requirement
  create_worknodes: false
source_lineage:
  - Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Prompt_Pipeline-S0002
preserved_exact_tokens:
  - "Canonical owner-section requirements"
  - "product, runtime, storage, UI, and governance details"
negative_constraints: []
preserved_contractrefs: []
owner_hints:
  - "Plans/Prompt_Pipeline.md"
```

### PP-004 - Requested Effective Compatibility Vocabulary

```yaml
plan_unit_id: PP-004
unit_type: constraint
status: accepted
owner_doc: Plans/Prompt_Pipeline.md
canonical_text: >-
  Compatibility-only source vocabulary is noncanonical; live Prompt Pipeline wording uses the requested/effective owner terminology and the Puppet Master compliance baseline.
gui_related: false
gui_classification_reason: This unit defines terminology and compliance rather than visual presentation.
split_recommended: false
depends_on:
  - "PP-002"
unblocks: []
acceptance_criteria:
  - "Requested Effective Compatibility Vocabulary remains addressable as a fine-grained Prompt Pipeline PlanUnit."
  - "ContractRefs, anchors, exact tokens, negative constraints, compatibility-only notes, stale/retired dispositions, owner/consumer boundaries, and source lineage from the source spans remain preserved."
  - "No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created by this PlanUnit."
validation_surfaces:
  - "python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits"
  - "python3 scripts/pm-plan-index.py validate"
risk_class: prompt_pipeline_drift
reasoning_tier: standard
context_scope: prompt_pipeline
implementation_surfaces:
  - Plans/Prompt_Pipeline.md
node_compile_hint:
  mode: constraint
  create_worknodes: false
source_lineage:
  - Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Prompt_Pipeline-S0003
preserved_exact_tokens:
  - "Requested/effective account identity contract"
  - "Compatibility-only source vocabulary is noncanonical"
  - "Puppet Master"
  - "Plans/DRY_Rules.md"
  - "Plans/Contracts_V0.md"
negative_constraints: []
preserved_contractrefs: []
compatibility_only_notes:
  - "Compatibility-only source vocabulary is noncanonical; live wording uses the owner terminology below."
owner_hints:
  - "Plans/Prompt_Pipeline.md"
```

### PP-005 - Prompt Pipeline Scope And SSOT Boundary

```yaml
plan_unit_id: PP-005
unit_type: requirement
status: accepted
owner_doc: Plans/Prompt_Pipeline.md
canonical_text: >-
  Prompt Pipeline owns prompt assembly stages, context compiler output incorporation, context compilation algorithms, compaction/pruning, rotation boundaries, and plugin prompt hook points, while other plans may consume outputs without redefining these algorithms.
gui_related: false
gui_classification_reason: This unit defines ownership and prompt/context compilation policy rather than visual presentation.
split_recommended: false
depends_on:
  - "PP-002"
unblocks: []
acceptance_criteria:
  - "Prompt Pipeline Scope And SSOT Boundary remains addressable as a fine-grained Prompt Pipeline PlanUnit."
  - "ContractRefs, anchors, exact tokens, negative constraints, compatibility-only notes, stale/retired dispositions, owner/consumer boundaries, and source lineage from the source spans remain preserved."
  - "No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created by this PlanUnit."
validation_surfaces:
  - "python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits"
  - "python3 scripts/pm-plan-index.py validate"
risk_class: prompt_pipeline_drift
reasoning_tier: standard
context_scope: prompt_pipeline
implementation_surfaces:
  - Plans/Prompt_Pipeline.md
node_compile_hint:
  mode: requirement
  create_worknodes: false
source_lineage:
  - Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Prompt_Pipeline-S0004
preserved_exact_tokens:
  - "prompt assembly stages"
  - "context compiler output"
  - "context-selection"
  - "delta-context"
  - "cache heuristics"
  - "marker files"
  - "skill bundling"
  - "compaction/pruning"
  - "rotation boundaries"
  - "plugin hook points"
negative_constraints:
  - "Other plans MAY describe how they consume compiled output, but they MUST NOT redefine context-selection, delta-context, cache, marker-file, skill-bundling, or compaction algorithms as separate SSOTs."
  - "Plans/FileSafe.md owns safety checks over compiled output; it does not own prompt/context compilation policy, and rewrite-era fallback wording must not turn FileSafe into a second context-compilation SSOT."
preserved_contractrefs:
  - "ContractRef: Primitive:DRYRules, ContractName:Plans/DRY_Rules.md, ContractName:Plans/Contracts_V0.md"
  - "ContractRef: ContractName:Plans/FileSafe.md, ContractName:Plans/Run_Modes.md, ContractName:Plans/Architecture_Invariants.md"
owner_hints:
  - "Plans/Prompt_Pipeline.md"
  - "Plans/FileSafe.md"
  - "Plans/Run_Modes.md"
  - "Plans/Architecture_Invariants.md"
```

### PP-006 - Prompt Pipeline DRY Reference Map

```yaml
plan_unit_id: PP-006
unit_type: requirement
status: accepted
owner_doc: Plans/Prompt_Pipeline.md
canonical_text: >-
  Prompt Pipeline preserves its DRY reference map to locked decisions, canonical contracts, terms, deterministic decisions, FileSafe checks, run-mode context, Personas, Tools, Plugins, GUI/context consumers, and OpenCode baseline extraction.
gui_related: true
gui_classification_reason: This unit includes GUI/context consumer references.
split_recommended: false
depends_on:
  - "PP-005"
unblocks: []
acceptance_criteria:
  - "Prompt Pipeline DRY Reference Map remains addressable as a fine-grained Prompt Pipeline PlanUnit."
  - "ContractRefs, anchors, exact tokens, negative constraints, compatibility-only notes, stale/retired dispositions, owner/consumer boundaries, and source lineage from the source spans remain preserved."
  - "No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created by this PlanUnit."
validation_surfaces:
  - "python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits"
  - "python3 scripts/pm-plan-index.py validate"
risk_class: prompt_pipeline_drift
reasoning_tier: standard
context_scope: prompt_pipeline
implementation_surfaces:
  - Plans/Prompt_Pipeline.md
node_compile_hint:
  mode: requirement
  create_worknodes: false
source_lineage:
  - Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Prompt_Pipeline-S0005
preserved_exact_tokens:
  - "Plans/Spec_Lock.json"
  - "Plans/Contracts_V0.md"
  - "Plans/DRY_Rules.md"
  - "Plans/Glossary.md"
  - "Plans/Decision_Policy.md"
  - "Plans/auto_decisions.jsonl"
  - "Plans/FileSafe.md"
  - "Plans/Run_Modes.md"
  - "Plans/Personas.md#PERSONA-INJECTION"
  - "Plans/Tools.md"
  - "Plans/Plugins_System.md"
  - "Plans/FinalGUISpec.md"
  - "Plans/assistant-chat-design.md"
  - "Plans/OpenCode_Deep_Extraction.md §7B"
negative_constraints: []
preserved_contractrefs: []
owner_hints:
  - "Plans/Prompt_Pipeline.md"
```

### PP-007 - Assembly Inputs And Run Envelope

```yaml
plan_unit_id: PP-007
unit_type: requirement
status: accepted
owner_doc: Plans/Prompt_Pipeline.md
canonical_text: >-
  The assembly pipeline consumes deterministic inputs and canonical run envelope fields, with node/package/lane/seam identity as canonical execution context and tier labels only derived grouping metadata.
gui_related: false
gui_classification_reason: This unit defines runtime input identity rather than visual presentation.
split_recommended: false
depends_on:
  - "PP-005"
unblocks: []
acceptance_criteria:
  - "Assembly Inputs And Run Envelope remains addressable as a fine-grained Prompt Pipeline PlanUnit."
  - "ContractRefs, anchors, exact tokens, negative constraints, compatibility-only notes, stale/retired dispositions, owner/consumer boundaries, and source lineage from the source spans remain preserved."
  - "No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created by this PlanUnit."
validation_surfaces:
  - "python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits"
  - "python3 scripts/pm-plan-index.py validate"
risk_class: prompt_pipeline_drift
reasoning_tier: standard
context_scope: prompt_pipeline
implementation_surfaces:
  - Plans/Prompt_Pipeline.md
node_compile_hint:
  mode: requirement
  create_worknodes: false
source_lineage:
  - Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Prompt_Pipeline-S0006
  - Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Prompt_Pipeline-S0007
preserved_exact_tokens:
  - "ASSEMBLY"
  - "Run envelope"
  - "session_id"
  - "timestamp"
  - "thread_id"
  - "run_id"
  - "node_id: string"
  - "package_id: string"
  - "lane_id: string?"
  - "seam_id: string?"
  - "requested/effective model and variant refs"
  - "active surface"
  - "Node/package/lane/seam identity"
negative_constraints: []
preserved_contractrefs:
  - "ContractRef: ContractName:Plans/Run_Modes.md, ContractName:Plans/Contracts_V0.md"
owner_hints:
  - "Plans/Prompt_Pipeline.md"
```

### PP-008 - Canonical Prompt Assembly Stage Ordering

```yaml
plan_unit_id: PP-008
unit_type: requirement
status: accepted
owner_doc: Plans/Prompt_Pipeline.md
canonical_text: >-
  Prompt assembly follows deterministic stages 1 through 9, applies mode-specific overlays during context compilation, applies plugin transforms and tool schemas, and carries the canonical orchestration flow contract for Orchestrator or delegated child runs.
gui_related: false
gui_classification_reason: This unit defines prompt assembly ordering and orchestration metadata rather than visual presentation.
split_recommended: false
depends_on:
  - "PP-007"
unblocks: []
acceptance_criteria:
  - "Canonical Prompt Assembly Stage Ordering remains addressable as a fine-grained Prompt Pipeline PlanUnit."
  - "ContractRefs, anchors, exact tokens, negative constraints, compatibility-only notes, stale/retired dispositions, owner/consumer boundaries, and source lineage from the source spans remain preserved."
  - "No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created by this PlanUnit."
validation_surfaces:
  - "python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits"
  - "python3 scripts/pm-plan-index.py validate"
risk_class: prompt_pipeline_drift
reasoning_tier: standard
context_scope: prompt_pipeline
implementation_surfaces:
  - Plans/Prompt_Pipeline.md
node_compile_hint:
  mode: requirement
  create_worknodes: false
source_lineage:
  - Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Prompt_Pipeline-S0008
preserved_exact_tokens:
  - "ASSEMBLY-PIPELINE"
  - "Resolve run config and surface context"
  - "Resolve Persona selection inputs"
  - "Resolve effective Persona and runtime state"
  - "Resolve skills"
  - "Compile context"
  - "Normalize structured attachments"
  - "Assemble Instruction Bundle"
  - "Apply plugin transforms and attach tool schemas"
  - "Finalize"
  - "read_only"
  - "plan_output_scaffold_v1"
  - "full_execution"
  - "assess -> understand -> decompose -> act -> verify"
negative_constraints:
  - "Child/subagent/rotated runs may narrow an inherited overlay, but they MUST NOT widen a read-only overlay into full_execution."
preserved_contractrefs:
  - "ContractRef: ContractName:Plans/assistant-chat-design.md, ContractName:Plans/Tools.md, ContractName:Plans/Plugins_System.md"
  - "ContractRef: ContractName:Plans/Plugins_System.md, ContractName:Plans/Tools.md, PolicyRule:Decision_Policy.md§3"
  - "ContractRef: ContractName:Plans/orchestrator-subagent-integration.md, ContractName:Plans/Run_Modes.md, ContractName:Plans/assistant-chat-design.md"
owner_hints:
  - "Plans/Prompt_Pipeline.md"
```

### PP-009 - Skill Resolution Runtime Delivery

```yaml
plan_unit_id: PP-009
unit_type: requirement
status: accepted
owner_doc: Plans/Prompt_Pipeline.md
canonical_text: >-
  Skill runtime delivery resolves requested skill refs from the PM registry, filters by permissions, de-duplicates by canonical skill id, bundles selected skill content when needed, and preserves on-demand access through the skill tool; provider-native skill directories are discovery/import/export/interoperability inputs only.
gui_related: false
gui_classification_reason: This unit defines skill delivery and registry behavior rather than visual presentation.
split_recommended: false
depends_on:
  - "PP-008"
unblocks: []
acceptance_criteria:
  - "Skill Resolution Runtime Delivery remains addressable as a fine-grained Prompt Pipeline PlanUnit."
  - "ContractRefs, anchors, exact tokens, negative constraints, compatibility-only notes, stale/retired dispositions, owner/consumer boundaries, and source lineage from the source spans remain preserved."
  - "No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created by this PlanUnit."
validation_surfaces:
  - "python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits"
  - "python3 scripts/pm-plan-index.py validate"
risk_class: prompt_pipeline_drift
reasoning_tier: standard
context_scope: prompt_pipeline
implementation_surfaces:
  - Plans/Prompt_Pipeline.md
node_compile_hint:
  mode: requirement
  create_worknodes: false
source_lineage:
  - Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Prompt_Pipeline-S0009
preserved_exact_tokens:
  - "default_skill_refs"
  - "skill"
  - "canonical skill id"
  - "provider-native skill directories"
  - "discovery/import/export/interoperability inputs only"
negative_constraints: []
preserved_contractrefs:
  - "ContractRef: ContractName:Plans/Skills_System.md, ContractName:Plans/FileSafe.md, ContractName:Plans/Tools.md"
owner_hints:
  - "Plans/Prompt_Pipeline.md"
  - "Plans/Skills_System.md"
  - "Plans/Tools.md"
  - "Plans/FileSafe.md"
```

### PP-010 - Browser Element Attachment Normalization

```yaml
plan_unit_id: PP-010
unit_type: requirement
status: accepted
owner_doc: Plans/Prompt_Pipeline.md
canonical_text: >-
  Browser element attachments serialize after context compilation and before final conversation payload emission, preserving chip-based element context distinctions, bounded fields, truncation metadata, and DOM/page-body exclusion.
gui_related: true
gui_classification_reason: This unit concerns browser/composer UI attachment behavior.
split_recommended: false
depends_on:
  - "PP-008"
unblocks: []
acceptance_criteria:
  - "Browser Element Attachment Normalization remains addressable as a fine-grained Prompt Pipeline PlanUnit."
  - "ContractRefs, anchors, exact tokens, negative constraints, compatibility-only notes, stale/retired dispositions, owner/consumer boundaries, and source lineage from the source spans remain preserved."
  - "No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created by this PlanUnit."
validation_surfaces:
  - "python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits"
  - "python3 scripts/pm-plan-index.py validate"
risk_class: prompt_pipeline_drift
reasoning_tier: standard
context_scope: prompt_pipeline
implementation_surfaces:
  - Plans/Prompt_Pipeline.md
node_compile_hint:
  mode: requirement
  create_worknodes: false
source_lineage:
  - Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Prompt_Pipeline-S0010
preserved_exact_tokens:
  - "browser_element_context"
  - "Text-selection chips"
  - "element-pick chips"
  - "tag_name"
  - "element_ref?"
  - "text_content?"
  - "role?"
  - "rect"
  - "parent_path?"
  - "truncation occurred"
negative_constraints:
  - "Raw unbounded DOM dumps or page bodies MUST NOT be injected into the prompt through this attachment path."
  - "Blocked or expired chips MUST NOT be serialized as successful user attachments."
preserved_contractrefs:
  - "ContractRef: ContractName:Plans/assistant-chat-design.md, ContractName:Plans/storage-plan.md, ContractName:Plans/FileSafe.md"
owner_hints:
  - "Plans/Prompt_Pipeline.md"
  - "Plans/assistant-chat-design.md"
  - "Plans/storage-plan.md"
  - "Plans/FileSafe.md"
```

### PP-011 - Browser Selection Attachment Normalization

```yaml
plan_unit_id: PP-011
unit_type: requirement
status: accepted
owner_doc: Plans/Prompt_Pipeline.md
canonical_text: >-
  Browser selection attachments serialize after context compilation in stable thread-prep order before the user freeform message, preserving bounded browser selection fields and rejecting raw page bodies or blocked/expired chips.
gui_related: true
gui_classification_reason: This unit concerns browser selection UI attachment behavior.
split_recommended: false
depends_on:
  - "PP-010"
unblocks: []
acceptance_criteria:
  - "Browser Selection Attachment Normalization remains addressable as a fine-grained Prompt Pipeline PlanUnit."
  - "ContractRefs, anchors, exact tokens, negative constraints, compatibility-only notes, stale/retired dispositions, owner/consumer boundaries, and source lineage from the source spans remain preserved."
  - "No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created by this PlanUnit."
validation_surfaces:
  - "python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits"
  - "python3 scripts/pm-plan-index.py validate"
risk_class: prompt_pipeline_drift
reasoning_tier: standard
context_scope: prompt_pipeline
implementation_surfaces:
  - Plans/Prompt_Pipeline.md
node_compile_hint:
  mode: requirement
  create_worknodes: false
source_lineage:
  - Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Prompt_Pipeline-S0010
preserved_exact_tokens:
  - "browser_selection_context"
  - "stable thread-prep order"
  - "browser_session_id"
  - "session_class"
  - "page_url"
  - "selected_text"
  - "selection_anchor?"
  - "requested_target"
  - "effective_target?"
  - "truncation_state"
negative_constraints:
  - "Raw unbounded DOM dumps or page bodies MUST NOT be injected into the prompt through this attachment path."
  - "Blocked or expired chips MUST NOT be serialized as successful user attachments."
preserved_contractrefs:
  - "ContractRef: ContractName:Plans/assistant-chat-design.md, ContractName:Plans/storage-plan.md, ContractName:Plans/Section15_MVP_Promoted_Features_Spec.md"
owner_hints:
  - "Plans/Prompt_Pipeline.md"
```

### PP-012 - Document Selection Structured Revision Payloads

```yaml
plan_unit_id: PP-012
unit_type: requirement
status: accepted
owner_doc: Plans/Prompt_Pipeline.md
canonical_text: >-
  Document selection attachments serialize in stable order with bounded selection, routing, sensitivity, truncation, and revision payload metadata; structured revision providers use schema-enforced or locally validated revision shapes.
gui_related: true
gui_classification_reason: This unit concerns document review UI selection and revision prompt behavior.
split_recommended: false
depends_on:
  - "PP-010"
unblocks: []
acceptance_criteria:
  - "Document Selection Structured Revision Payloads remains addressable as a fine-grained Prompt Pipeline PlanUnit."
  - "ContractRefs, anchors, exact tokens, negative constraints, compatibility-only notes, stale/retired dispositions, owner/consumer boundaries, and source lineage from the source spans remain preserved."
  - "No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created by this PlanUnit."
validation_surfaces:
  - "python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits"
  - "python3 scripts/pm-plan-index.py validate"
risk_class: prompt_pipeline_drift
reasoning_tier: standard
context_scope: prompt_pipeline
implementation_surfaces:
  - Plans/Prompt_Pipeline.md
node_compile_hint:
  mode: requirement
  create_worknodes: false
source_lineage:
  - Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Prompt_Pipeline-S0010
preserved_exact_tokens:
  - "document_selection_context"
  - "source_surface"
  - "bundle_id?"
  - "doc_id"
  - "doc_path/display_name"
  - "selected_text"
  - "requested_target"
  - "effective_target?"
  - "sensitivity_state"
  - "truncation_state"
  - "annotation_id"
  - "operation"
  - "intent_kind"
  - "operation_payload"
  - "anchor"
  - "schema_enforced_structured_revision"
  - "validated_structured_revision"
  - "/order/shape"
negative_constraints:
  - "Raw unbounded document bodies MUST NOT be injected into the prompt through this attachment path."
  - "Blocked or expired chips MUST NOT be serialized as successful user attachments."
preserved_contractrefs:
  - "ContractRef: ContractName:Plans/assistant-chat-design.md, ContractName:Plans/storage-plan.md, ContractName:Plans/FileSafe.md"
  - "ContractRef: ContractName:Plans/FileManager.md, ContractName:Plans/assistant-chat-design.md, ContractName:Plans/storage-plan.md"
owner_hints:
  - "Plans/Prompt_Pipeline.md"
```

### PP-013 - Debug Investigation Context Normalization

```yaml
plan_unit_id: PP-013
unit_type: requirement
status: accepted
owner_doc: Plans/Prompt_Pipeline.md
canonical_text: >-
  Active Debug investigation context is normalized after context compilation and before final conversation serialization, with deterministic evidence ordering, source grouping identities, bounded summaries/refs, and explicit redaction/truncation state.
gui_related: false
gui_classification_reason: This unit defines debug prompt context normalization rather than visual presentation.
split_recommended: false
depends_on:
  - "PP-008"
unblocks: []
acceptance_criteria:
  - "Debug Investigation Context Normalization remains addressable as a fine-grained Prompt Pipeline PlanUnit."
  - "ContractRefs, anchors, exact tokens, negative constraints, compatibility-only notes, stale/retired dispositions, owner/consumer boundaries, and source lineage from the source spans remain preserved."
  - "No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created by this PlanUnit."
validation_surfaces:
  - "python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits"
  - "python3 scripts/pm-plan-index.py validate"
risk_class: prompt_pipeline_drift
reasoning_tier: standard
context_scope: prompt_pipeline
implementation_surfaces:
  - Plans/Prompt_Pipeline.md
node_compile_hint:
  mode: requirement
  create_worknodes: false
source_lineage:
  - Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Prompt_Pipeline-S0011
preserved_exact_tokens:
  - "investigation_id"
  - "bundle_id?"
  - "terminal_session_id"
  - "dev_session_id"
  - "browser_session_id"
  - "debug_target_kind"
  - "primary_target_summary"
  - "current_phase"
  - "state"
  - "verification_strength?"
  - "artifact_refs?"
  - "redaction_state"
  - "truncation_state"
negative_constraints:
  - "Revoked, blocked, expired, and omitted items must not be serialized as successful prompt content."
preserved_contractrefs:
  - "ContractRef: ContractName:Plans/assistant-chat-design.md, ContractName:Plans/Contracts_V0.md, ContractName:Plans/storage-plan.md"
  - "ContractRef: ContractName:Plans/Contracts_V0.md, ContractName:Plans/Runtime_Artifacts_Panel.md, ContractName:Plans/assistant-chat-design.md"
owner_hints:
  - "Plans/Prompt_Pipeline.md"
```

### PP-014 - Instruction Bundle Minimum Fields

```yaml
plan_unit_id: PP-014
unit_type: requirement
status: accepted
owner_doc: Plans/Prompt_Pipeline.md
canonical_text: >-
  The compiled prompt includes an Instruction Bundle with active execution context, requested/effective overlay, Persona IDs, rules context, tool policy, Injected Context breakdown, and active Investigation Context summary when applicable.
gui_related: true
gui_classification_reason: This unit includes user-visible Injected Context and Debug investigation bundle surfaces.
split_recommended: false
depends_on:
  - "PP-008"
  - "PP-013"
unblocks: []
acceptance_criteria:
  - "Instruction Bundle Minimum Fields remains addressable as a fine-grained Prompt Pipeline PlanUnit."
  - "ContractRefs, anchors, exact tokens, negative constraints, compatibility-only notes, stale/retired dispositions, owner/consumer boundaries, and source lineage from the source spans remain preserved."
  - "No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created by this PlanUnit."
validation_surfaces:
  - "python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits"
  - "python3 scripts/pm-plan-index.py validate"
risk_class: prompt_pipeline_drift
reasoning_tier: standard
context_scope: prompt_pipeline
implementation_surfaces:
  - Plans/Prompt_Pipeline.md
node_compile_hint:
  mode: requirement
  create_worknodes: false
source_lineage:
  - Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Prompt_Pipeline-S0012
preserved_exact_tokens:
  - "INSTRUCTION-BUNDLE"
  - "InstructionBundleAssembly"
  - "node_id"
  - "package_id"
  - "lane_id?"
  - "seam_id?"
  - "requested and effective workflow overlay"
  - "active Persona identifier(s)"
  - "rules context"
  - "tool-policy snapshot"
  - "Injected Context breakdown"
  - "active Investigation Context summary"
negative_constraints: []
preserved_contractrefs:
  - "ContractRef: ContractName:Plans/Contracts_V0.md#InstructionBundleAssembly, ContractName:Plans/FinalGUISpec.md, ContractName:Plans/assistant-chat-design.md"
owner_hints:
  - "Plans/Prompt_Pipeline.md"
```

### PP-015 - Instruction Source Budgeting And Projection Boundary

```yaml
plan_unit_id: PP-015
unit_type: requirement
status: accepted
owner_doc: Plans/Prompt_Pipeline.md
canonical_text: >-
  Instruction Bundle rules keep Investigation Context additive, bound debug summaries, preserve revoked/blocked/expired/omitted visibility without serialization success, budget external instruction sources, treat PM-owned AGENTS.md as canonical, and keep provider-native instruction files as generated/import/export projections.
gui_related: false
gui_classification_reason: This unit defines instruction source authority and budgeting rather than visual presentation.
split_recommended: false
depends_on:
  - "PP-014"
unblocks: []
acceptance_criteria:
  - "Instruction Source Budgeting And Projection Boundary remains addressable as a fine-grained Prompt Pipeline PlanUnit."
  - "ContractRefs, anchors, exact tokens, negative constraints, compatibility-only notes, stale/retired dispositions, owner/consumer boundaries, and source lineage from the source spans remain preserved."
  - "No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created by this PlanUnit."
validation_surfaces:
  - "python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits"
  - "python3 scripts/pm-plan-index.py validate"
risk_class: prompt_pipeline_drift
reasoning_tier: standard
context_scope: prompt_pipeline
implementation_surfaces:
  - Plans/Prompt_Pipeline.md
node_compile_hint:
  mode: requirement
  create_worknodes: false
source_lineage:
  - Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Prompt_Pipeline-S0012
preserved_exact_tokens:
  - "Investigation Context"
  - "AGENTS.md"
  - "CLAUDE.md"
  - "bounded instruction-source budget"
  - "path"
  - "byte count"
  - "truncation reason"
  - "system prompt"
  - "persona instructions"
  - "active tool schemas"
  - "untouchable set"
negative_constraints:
  - "Provider-native instruction files are generated/import/export projections, not peer authorities."
preserved_contractrefs:
  - "ContractRef: ContractName:Plans/storage-plan.md, ContractName:Plans/Runtime_Artifacts_Panel.md, ContractName:Plans/Contracts_V0.md"
owner_hints:
  - "Plans/Prompt_Pipeline.md"
```

### PP-016 - Compaction Immune Content Cap

```yaml
plan_unit_id: PP-016
unit_type: requirement
status: accepted
owner_doc: Plans/Prompt_Pipeline.md
canonical_text: >-
  Compaction and pruning preserve system, persona, instruction-source commitments, active tool schemas, user-pinned context, compaction_immune blocks, and required reasoning blocks while enforcing max_compaction_immune_pct default 30 for the total immune set.
gui_related: false
gui_classification_reason: This unit defines compaction policy rather than visual presentation.
split_recommended: false
depends_on:
  - "PP-015"
unblocks: []
acceptance_criteria:
  - "Compaction Immune Content Cap remains addressable as a fine-grained Prompt Pipeline PlanUnit."
  - "ContractRefs, anchors, exact tokens, negative constraints, compatibility-only notes, stale/retired dispositions, owner/consumer boundaries, and source lineage from the source spans remain preserved."
  - "No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created by this PlanUnit."
validation_surfaces:
  - "python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits"
  - "python3 scripts/pm-plan-index.py validate"
risk_class: prompt_pipeline_drift
reasoning_tier: standard
context_scope: prompt_pipeline
implementation_surfaces:
  - Plans/Prompt_Pipeline.md
node_compile_hint:
  mode: requirement
  create_worknodes: false
source_lineage:
  - Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Prompt_Pipeline-S0013
  - Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Prompt_Pipeline-S0014
preserved_exact_tokens:
  - "Compaction and pruning"
  - "compaction_immune: true"
  - "max_compaction_immune_pct"
  - "default: 30"
  - "system prompt"
  - "persona instructions"
  - "active tool schemas"
  - "user-pinned context"
negative_constraints:
  - "A compaction LLM or summary pass must never replace those commitments with an empty or weakened system prompt."
  - "The total immune set MUST NOT exceed max_compaction_immune_pct default 30 percent of the effective context window."
preserved_contractrefs:
  - "ContractRef: ContractName:Plans/assistant-chat-design.md, ContractName:Plans/Contracts_V0.md"
  - "ContractRef: ContractName:Plans/Models_System.md, ContractName:Plans/Architecture_Invariants.md"
owner_hints:
  - "Plans/Prompt_Pipeline.md"
```

### PP-017 - Compaction Overflow Algorithm

```yaml
plan_unit_id: PP-017
unit_type: requirement
status: accepted
owner_doc: Plans/Prompt_Pipeline.md
canonical_text: >-
  The compaction-immune set is partitioned into untouchable and truncatable tiers; only truncatable content is trimmed when over cap, and untouchable overflow emits diag.compaction_immune_overflow while execution continues.
gui_related: false
gui_classification_reason: This unit defines overflow handling rather than visual presentation.
split_recommended: false
depends_on:
  - "PP-016"
unblocks: []
acceptance_criteria:
  - "Compaction Overflow Algorithm remains addressable as a fine-grained Prompt Pipeline PlanUnit."
  - "ContractRefs, anchors, exact tokens, negative constraints, compatibility-only notes, stale/retired dispositions, owner/consumer boundaries, and source lineage from the source spans remain preserved."
  - "No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created by this PlanUnit."
validation_surfaces:
  - "python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits"
  - "python3 scripts/pm-plan-index.py validate"
risk_class: prompt_pipeline_drift
reasoning_tier: standard
context_scope: prompt_pipeline
implementation_surfaces:
  - Plans/Prompt_Pipeline.md
node_compile_hint:
  mode: requirement
  create_worknodes: false
source_lineage:
  - Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Prompt_Pipeline-S0015
preserved_exact_tokens:
  - "Untouchable set"
  - "/truncatable"
  - "/compaction-immune"
  - "diag.compaction_immune_overflow"
  - "system prompt"
  - "persona instructions"
  - "active tool schemas"
  - "FIFO"
negative_constraints: []
preserved_contractrefs:
  - "ContractRef: ContractName:Plans/Architecture_Invariants.md, ContractName:Plans/Contracts_V0.md"
  - "ContractRef: ContractName:Plans/Models_System.md, ContractName:Plans/Architecture_Invariants.md"
  - "ContractRef: ContractName:Plans/Contracts_V0.md, ContractName:Plans/Executor_Protocol.md"
owner_hints:
  - "Plans/Prompt_Pipeline.md"
```

### PP-018 - Context Assembly Cache Strategies

```yaml
plan_unit_id: PP-018
unit_type: requirement
status: accepted
owner_doc: Plans/Prompt_Pipeline.md
canonical_text: >-
  Context assembly preserves cache-friendly stable prefixes and applies explicit provider cache strategies for Anthropic, Google/Gemini, OpenAI, and unsupported surfaces without PM managing provider-owned cache state where not applicable.
gui_related: false
gui_classification_reason: This unit defines provider cache strategy rather than visual presentation.
split_recommended: false
depends_on:
  - "PP-007"
unblocks: []
acceptance_criteria:
  - "Context Assembly Cache Strategies remains addressable as a fine-grained Prompt Pipeline PlanUnit."
  - "ContractRefs, anchors, exact tokens, negative constraints, compatibility-only notes, stale/retired dispositions, owner/consumer boundaries, and source lineage from the source spans remain preserved."
  - "No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created by this PlanUnit."
validation_surfaces:
  - "python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits"
  - "python3 scripts/pm-plan-index.py validate"
risk_class: prompt_pipeline_drift
reasoning_tier: standard
context_scope: prompt_pipeline
implementation_surfaces:
  - Plans/Prompt_Pipeline.md
node_compile_hint:
  mode: requirement
  create_worknodes: false
source_lineage:
  - Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Prompt_Pipeline-S0016
preserved_exact_tokens:
  - "cache_control"
  - "type: \"ephemeral\""
  - "cachedContent"
  - "Gemini Caching API"
  - "default: 5 minutes"
  - "cachedContentTokenCount"
  - "cache_with_oauth"
  - "OpenAI"
  - "Unsupported surfaces"
negative_constraints: []
preserved_contractrefs:
  - "ContractRef: ContractName:Plans/FileSafe.md, ContractName:Plans/Tools.md"
  - "ContractRef: ContractName:Plans/Models_System.md, ContractName:Plans/CLI_Bridged_Providers.md"
owner_hints:
  - "Plans/Prompt_Pipeline.md"
```

### PP-019 - Reasoning Replay Preservation

```yaml
plan_unit_id: PP-019
unit_type: requirement
status: accepted
owner_doc: Plans/Prompt_Pipeline.md
canonical_text: >-
  Reasoning-block payloads are replay-safe state: PM preserves or converts them before compaction, records provider reasoning_tokens on UsageEvent, tolerates out-of-order proxy delivery, and does not silently strip reasoning content due to adapter limitations.
gui_related: false
gui_classification_reason: This unit defines replay and usage preservation rather than visual presentation.
split_recommended: false
depends_on:
  - "PP-016"
unblocks: []
acceptance_criteria:
  - "Reasoning Replay Preservation remains addressable as a fine-grained Prompt Pipeline PlanUnit."
  - "ContractRefs, anchors, exact tokens, negative constraints, compatibility-only notes, stale/retired dispositions, owner/consumer boundaries, and source lineage from the source spans remain preserved."
  - "No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created by this PlanUnit."
validation_surfaces:
  - "python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits"
  - "python3 scripts/pm-plan-index.py validate"
risk_class: prompt_pipeline_drift
reasoning_tier: standard
context_scope: prompt_pipeline
implementation_surfaces:
  - Plans/Prompt_Pipeline.md
node_compile_hint:
  mode: requirement
  create_worknodes: false
source_lineage:
  - Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Prompt_Pipeline-S0016
preserved_exact_tokens:
  - "/reasoning"
  - "/replay"
  - "reasoning_tokens"
  - "UsageEvent"
  - "LiteLLM/Bedrock-style proxies"
negative_constraints:
  - "PM MUST NOT silently strip thinking/reasoning content merely because an adapter lacks a native replay field."
preserved_contractrefs:
  - "ContractRef: ContractName:Plans/usage-feature.md, ContractName:Plans/Contracts_V0.md, ContractName:Plans/Architecture_Invariants.md"
owner_hints:
  - "Plans/Prompt_Pipeline.md"
```

### PP-020 - Tool Result Compression And Replay Compatibility

```yaml
plan_unit_id: PP-020
unit_type: constraint
status: accepted
owner_doc: Plans/Prompt_Pipeline.md
canonical_text: >-
  Tool-result compression is evaluated incrementally at every tool-call boundary with causal replay metadata, and OpenCode synthetic compaction text is treated as compatibility hazard rather than user-authored instruction.
gui_related: false
gui_classification_reason: This unit defines replay compatibility and compression semantics rather than visual presentation.
split_recommended: false
depends_on:
  - "PP-019"
unblocks: []
acceptance_criteria:
  - "Tool Result Compression And Replay Compatibility remains addressable as a fine-grained Prompt Pipeline PlanUnit."
  - "ContractRefs, anchors, exact tokens, negative constraints, compatibility-only notes, stale/retired dispositions, owner/consumer boundaries, and source lineage from the source spans remain preserved."
  - "No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created by this PlanUnit."
validation_surfaces:
  - "python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits"
  - "python3 scripts/pm-plan-index.py validate"
risk_class: prompt_pipeline_drift
reasoning_tier: standard
context_scope: prompt_pipeline
implementation_surfaces:
  - Plans/Prompt_Pipeline.md
node_compile_hint:
  mode: constraint
  create_worknodes: false
source_lineage:
  - Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Prompt_Pipeline-S0016
preserved_exact_tokens:
  - "_context_updates"
  - "incremental per-tool-call tool-result compression"
  - "message-v2"
  - "message-v2.ts"
  - "What did we do so far?"
  - "synthetic continuation"
  - "compaction metadata"
  - "/assistant/system/synthetic"
negative_constraints:
  - "Synthetic compaction text must not replay as a user-authored instruction."
preserved_contractrefs:
  - "ContractRef: ContractName:Plans/storage-plan.md, ContractName:Plans/Contracts_V0.md, ContractName:Plans/Run_Modes.md"
compatibility_only_notes:
  - "OpenCode replay evidence from message-v2 / message-v2.ts is a compatibility hazard, not PM canon."
  - "Message boundaries remain explicit across user, assistant, system, and synthetic-continue turns."
stale_retired_dispositions:
  - "The compatibility marker /assistant/system/synthetic resolves to boundary markers only."
owner_hints:
  - "Plans/Prompt_Pipeline.md"
```

### PP-021 - Synthetic Continue Eligibility And State

```yaml
plan_unit_id: PP-021
unit_type: requirement
status: accepted
owner_doc: Plans/Prompt_Pipeline.md
canonical_text: >-
  Synthetic continue is a bounded fallback for incomplete provider output in regular and yolo runs after compaction/cache reassembly, with state tracked by continue count, assistant tail hash, continue prompt hash, and reason.
gui_related: false
gui_classification_reason: This unit defines runtime continuation state rather than visual presentation.
split_recommended: false
depends_on:
  - "PP-020"
unblocks: []
acceptance_criteria:
  - "Synthetic Continue Eligibility And State remains addressable as a fine-grained Prompt Pipeline PlanUnit."
  - "ContractRefs, anchors, exact tokens, negative constraints, compatibility-only notes, stale/retired dispositions, owner/consumer boundaries, and source lineage from the source spans remain preserved."
  - "No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created by this PlanUnit."
validation_surfaces:
  - "python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits"
  - "python3 scripts/pm-plan-index.py validate"
risk_class: prompt_pipeline_drift
reasoning_tier: standard
context_scope: prompt_pipeline
implementation_surfaces:
  - Plans/Prompt_Pipeline.md
node_compile_hint:
  mode: requirement
  create_worknodes: false
source_lineage:
  - Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Prompt_Pipeline-S0017
preserved_exact_tokens:
  - "Synthetic continue"
  - "regular"
  - "yolo"
  - "HITL pause"
  - "synthetic_continue_count"
  - "last_assistant_tail_hash"
  - "last_continue_prompt_hash"
  - "last_continue_reason"
negative_constraints: []
preserved_contractrefs:
  - "ContractRef: ContractName:Plans/Run_Modes.md, ContractName:Plans/storage-plan.md"
  - "ContractRef: ContractName:Plans/Executor_Protocol.md, ContractName:Plans/assistant-chat-design.md"
  - "ContractRef: ContractName:Plans/storage-plan.md, ContractName:Plans/Contracts_V0.md"
owner_hints:
  - "Plans/Prompt_Pipeline.md"
```

### PP-022 - Synthetic Continue State Machine And Loop Prevention

```yaml
plan_unit_id: PP-022
unit_type: requirement
status: accepted
owner_doc: Plans/Prompt_Pipeline.md
canonical_text: >-
  Synthetic continue transitions through Idle, Eligible, ContinueInjected, ContinueObserved, and Suppressed, caps automatic attempts at 2, compares tail and prompt hashes, and emits diag.synthetic_continue_loop_prevented instead of retrying forever.
gui_related: false
gui_classification_reason: This unit defines continuation state machine behavior rather than visual presentation.
split_recommended: false
depends_on:
  - "PP-021"
unblocks: []
acceptance_criteria:
  - "Synthetic Continue State Machine And Loop Prevention remains addressable as a fine-grained Prompt Pipeline PlanUnit."
  - "ContractRefs, anchors, exact tokens, negative constraints, compatibility-only notes, stale/retired dispositions, owner/consumer boundaries, and source lineage from the source spans remain preserved."
  - "No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created by this PlanUnit."
validation_surfaces:
  - "python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits"
  - "python3 scripts/pm-plan-index.py validate"
risk_class: prompt_pipeline_drift
reasoning_tier: standard
context_scope: prompt_pipeline
implementation_surfaces:
  - Plans/Prompt_Pipeline.md
node_compile_hint:
  mode: requirement
  create_worknodes: false
source_lineage:
  - Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Prompt_Pipeline-S0017
preserved_exact_tokens:
  - "Idle"
  - "Eligible"
  - "ContinueInjected"
  - "ContinueObserved"
  - "Suppressed"
  - "2 attempts"
  - "diag.synthetic_continue_loop_prevented"
  - "Task-based checkpoint markers"
  - "seglog"
negative_constraints: []
preserved_contractrefs:
  - "ContractRef: ContractName:Plans/Contracts_V0.md, ContractName:Plans/Run_Modes.md"
  - "ContractRef: ContractName:Plans/Architecture_Invariants.md, ContractName:Plans/Executor_Protocol.md"
owner_hints:
  - "Plans/Prompt_Pipeline.md"
```

### PP-023 - Dynamic Context Thresholds And Low Context Warning

```yaml
plan_unit_id: PP-023
unit_type: requirement
status: accepted
owner_doc: Plans/Prompt_Pipeline.md
canonical_text: >-
  Dynamic context shrinking uses model-owned thresholds and emits low-context diagnostics when remaining context falls below 15 percent after tool output or injected context, with large tool-output markers using the 512 KiB policy boundary.
gui_related: false
gui_classification_reason: This unit defines context pressure thresholds rather than visual presentation.
split_recommended: false
depends_on:
  - "PP-016"
unblocks: []
acceptance_criteria:
  - "Dynamic Context Thresholds And Low Context Warning remains addressable as a fine-grained Prompt Pipeline PlanUnit."
  - "ContractRefs, anchors, exact tokens, negative constraints, compatibility-only notes, stale/retired dispositions, owner/consumer boundaries, and source lineage from the source spans remain preserved."
  - "No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created by this PlanUnit."
validation_surfaces:
  - "python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits"
  - "python3 scripts/pm-plan-index.py validate"
risk_class: prompt_pipeline_drift
reasoning_tier: standard
context_scope: prompt_pipeline
implementation_surfaces:
  - Plans/Prompt_Pipeline.md
node_compile_hint:
  mode: requirement
  create_worknodes: false
source_lineage:
  - Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Prompt_Pipeline-S0018
preserved_exact_tokens:
  - "pressure_start_pct = 70"
  - "pressure_aggressive_pct = 85"
  - "large_block_threshold = 1200"
  - "below 15%"
  - "512 KiB"
negative_constraints: []
preserved_contractrefs:
  - "ContractRef: ContractName:Plans/Models_System.md, ContractName:Plans/storage-plan.md"
  - "ContractRef: ContractName:Plans/Contracts_V0.md, ContractName:Plans/Executor_Protocol.md"
owner_hints:
  - "Plans/Prompt_Pipeline.md"
```

### PP-024 - Context Budget Snapshot And Allocation

```yaml
plan_unit_id: PP-024
unit_type: requirement
status: accepted
owner_doc: Plans/Prompt_Pipeline.md
canonical_text: >-
  The agent-visible context-budget snapshot exposes effective window, used tokens/bytes, remaining percent, pressure state, previous compaction, tool-result shaping policy, deterministic budget allocation buckets, and priority classes.
gui_related: false
gui_classification_reason: This unit defines runtime budget metadata rather than visual presentation.
split_recommended: false
depends_on:
  - "PP-023"
unblocks: []
acceptance_criteria:
  - "Context Budget Snapshot And Allocation remains addressable as a fine-grained Prompt Pipeline PlanUnit."
  - "ContractRefs, anchors, exact tokens, negative constraints, compatibility-only notes, stale/retired dispositions, owner/consumer boundaries, and source lineage from the source spans remain preserved."
  - "No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created by this PlanUnit."
validation_surfaces:
  - "python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits"
  - "python3 scripts/pm-plan-index.py validate"
risk_class: prompt_pipeline_drift
reasoning_tier: standard
context_scope: prompt_pipeline
implementation_surfaces:
  - Plans/Prompt_Pipeline.md
node_compile_hint:
  mode: requirement
  create_worknodes: false
source_lineage:
  - Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Prompt_Pipeline-S0018
preserved_exact_tokens:
  - "full"
  - "summarize"
  - "meta_only"
  - "exclude"
  - "immune(30%)"
  - "history(30%)"
  - "current_turn(15%)"
  - "tool_results(20%)"
  - "contingency(5%)"
  - "P0"
  - "P1"
  - "P2"
  - "P3"
negative_constraints:
  - "Required identity and safety state cannot be silently dropped."
preserved_contractrefs:
  - "ContractRef: ContractName:Plans/Contracts_V0.md, ContractName:Plans/assistant-chat-design.md, ContractName:Plans/Architecture_Invariants.md"
stale_retired_dispositions:
  - "The budget snapshot is advisory rather than a perfect preflight predictor, but it MUST reflect the latest post-assembly estimate rather than a stale earlier value."
owner_hints:
  - "Plans/Prompt_Pipeline.md"
```

### PP-025 - Post Filter Integrity And Warn Repair

```yaml
plan_unit_id: PP-025
unit_type: requirement
status: accepted
owner_doc: Plans/Prompt_Pipeline.md
canonical_text: >-
  After filtering, pruning, or compaction, PM validates role alternation and message boundaries, prevents plugin transforms from deleting or reordering protected content, and either repairs malformed history with audited structural placeholders or aborts serialization.
gui_related: false
gui_classification_reason: This unit defines message integrity validation and repair behavior rather than visual presentation.
split_recommended: false
depends_on:
  - "PP-020"
unblocks: []
acceptance_criteria:
  - "Post Filter Integrity And Warn Repair remains addressable as a fine-grained Prompt Pipeline PlanUnit."
  - "ContractRefs, anchors, exact tokens, negative constraints, compatibility-only notes, stale/retired dispositions, owner/consumer boundaries, and source lineage from the source spans remain preserved."
  - "No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created by this PlanUnit."
validation_surfaces:
  - "python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits"
  - "python3 scripts/pm-plan-index.py validate"
risk_class: prompt_pipeline_drift
reasoning_tier: standard
context_scope: prompt_pipeline
implementation_surfaces:
  - Plans/Prompt_Pipeline.md
node_compile_hint:
  mode: requirement
  create_worknodes: false
source_lineage:
  - Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Prompt_Pipeline-S0019
preserved_exact_tokens:
  - "plugin-transform"
  - "role alternation"
  - "message-boundary correctness"
  - "warn-and-repair"
  - "placeholder"
  - "structural no-op"
negative_constraints:
  - "Plugin transforms MUST NOT delete system or persona content, reorder messages in a way that breaks alternation, or modify immune content."
  - "Placeholder repair preserves structure only; it MUST NOT invent substantive user intent, assistant claims, tool calls, or hidden policy content."
preserved_contractrefs:
  - "ContractRef: ContractName:Plans/Plugins_System.md, ContractName:Plans/Architecture_Invariants.md"
  - "ContractRef: ContractName:Plans/Contracts_V0.md, ContractName:Plans/storage-plan.md, ContractName:Plans/Architecture_Invariants.md"
owner_hints:
  - "Plans/Prompt_Pipeline.md"
```

### PP-026 - Rotation Follow-Up Run Boundary

```yaml
plan_unit_id: PP-026
unit_type: requirement
status: accepted
owner_doc: Plans/Prompt_Pipeline.md
canonical_text: >-
  Rotation terminates a run and spawns a follow-up only after deterministic compaction/pruning fails against the final assembled payload; ask and plan are rotation-ineligible, regular and yolo are eligible, and rotated runs inherit continuity state and finish with done.rotated.
gui_related: false
gui_classification_reason: This unit defines follow-up run spawning behavior rather than visual presentation.
split_recommended: false
depends_on:
  - "PP-022"
  - "PP-024"
unblocks: []
acceptance_criteria:
  - "Rotation Follow-Up Run Boundary remains addressable as a fine-grained Prompt Pipeline PlanUnit."
  - "ContractRefs, anchors, exact tokens, negative constraints, compatibility-only notes, stale/retired dispositions, owner/consumer boundaries, and source lineage from the source spans remain preserved."
  - "No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created by this PlanUnit."
validation_surfaces:
  - "python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits"
  - "python3 scripts/pm-plan-index.py validate"
risk_class: prompt_pipeline_drift
reasoning_tier: standard
context_scope: prompt_pipeline
implementation_surfaces:
  - Plans/Prompt_Pipeline.md
node_compile_hint:
  mode: requirement
  create_worknodes: false
source_lineage:
  - Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Prompt_Pipeline-S0020
preserved_exact_tokens:
  - "ROTATION"
  - "final assembled payload"
  - "ask"
  - "plan"
  - "regular"
  - "yolo"
  - "thread_id"
  - "mode"
  - "strategy"
  - "effective Persona/runtime state"
  - "tool-policy snapshot"
  - "done.rotated"
negative_constraints: []
preserved_contractrefs:
  - "ContractRef: ContractName:Plans/Run_Modes.md"
owner_hints:
  - "Plans/Prompt_Pipeline.md"
```

### PP-027 - GUI Injected Context Transparency

```yaml
plan_unit_id: PP-027
unit_type: requirement
status: accepted
owner_doc: Plans/Prompt_Pipeline.md
canonical_text: >-
  The GUI exposes an Injected Context breakdown per run or turn, including paths, byte counts, truncation reason, and a safe preview of compiled prompt sections for transparency and debugging.
gui_related: true
gui_classification_reason: This unit defines GUI inspection and user-visible prompt transparency behavior.
split_recommended: false
depends_on:
  - "PP-014"
  - "PP-024"
unblocks: []
acceptance_criteria:
  - "GUI Injected Context Transparency remains addressable as a fine-grained Prompt Pipeline PlanUnit."
  - "ContractRefs, anchors, exact tokens, negative constraints, compatibility-only notes, stale/retired dispositions, owner/consumer boundaries, and source lineage from the source spans remain preserved."
  - "No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created by this PlanUnit."
validation_surfaces:
  - "python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits"
  - "python3 scripts/pm-plan-index.py validate"
risk_class: prompt_pipeline_drift
reasoning_tier: standard
context_scope: prompt_pipeline
implementation_surfaces:
  - "Plans/Prompt_Pipeline.md"
node_compile_hint:
  mode: requirement
  create_worknodes: false
source_lineage:
  - "Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Prompt_Pipeline-S0021"
preserved_exact_tokens:
  - "GUI"
  - "Injected Context"
  - "paths + byte counts"
  - "truncation reason"
  - "safe preview"
  - "compiled prompt"
negative_constraints: []
preserved_contractrefs:
  - "ContractRef: ContractName:Plans/FinalGUISpec.md"
owner_hints:
  - "Plans/Prompt_Pipeline.md"
  - "Plans/FinalGUISpec.md"
```

### PP-028 - Prompt Pipeline Acceptance Gates

```yaml
plan_unit_id: PP-028
unit_type: acceptance_criteria
status: accepted
owner_doc: Plans/Prompt_Pipeline.md
canonical_text: >-
  Prompt assembly must follow the canonical stage ordering, and compaction must preserve protected tool outputs so skill outputs are not pruned.
gui_related: false
gui_classification_reason: This unit preserves prompt assembly and compaction acceptance criteria rather than visual presentation.
split_recommended: false
depends_on:
  - "PP-008"
  - "PP-009"
  - "PP-016"
  - "PP-020"
unblocks: []
acceptance_criteria:
  - "Prompt Pipeline Acceptance Gates remains addressable as a fine-grained Prompt Pipeline PlanUnit."
  - "ContractRefs, anchors, exact tokens, negative constraints, compatibility-only notes, stale/retired dispositions, owner/consumer boundaries, and source lineage from the source spans remain preserved."
  - "No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created by this PlanUnit."
validation_surfaces:
  - "python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits"
  - "python3 scripts/pm-plan-index.py validate"
risk_class: prompt_pipeline_drift
reasoning_tier: standard
context_scope: prompt_pipeline
implementation_surfaces:
  - "Plans/Prompt_Pipeline.md"
node_compile_hint:
  mode: acceptance_criteria
  create_worknodes: false
source_lineage:
  - "Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Prompt_Pipeline-S0022"
preserved_exact_tokens:
  - "AC-PP01"
  - "AC-PP02"
  - "canonical stage ordering"
  - "protected tool outputs"
  - "skill"
negative_constraints:
  - "Compaction MUST preserve protected tool outputs; skill outputs MUST NOT be pruned."
preserved_contractrefs:
  - "ContractRef: ContractName:Plans/Prompt_Pipeline.md#ASSEMBLY-PIPELINE"
  - "ContractRef: ContractName:Plans/Prompt_Pipeline.md#COMPACTION, ContractName:Plans/Run_Modes.md"
owner_hints:
  - "Plans/Prompt_Pipeline.md"
```

### PP-029 - Effective Runtime Resolution Pipeline Boundary

```yaml
plan_unit_id: PP-029
unit_type: requirement
status: accepted
owner_doc: Plans/Prompt_Pipeline.md
canonical_text: >-
  The requested/effective runtime pipeline is locked for provider family selection, account or server-profile resolution, billing or entity attribution, and PM-native skills/MCP assembly before provider handoff.
gui_related: false
gui_classification_reason: This unit defines runtime resolver ownership rather than visual presentation.
split_recommended: false
depends_on:
  - "PP-008"
unblocks: []
acceptance_criteria:
  - "Effective Runtime Resolution Pipeline Boundary remains addressable as a fine-grained Prompt Pipeline PlanUnit."
  - "ContractRefs, anchors, exact tokens, negative constraints, compatibility-only notes, stale/retired dispositions, owner/consumer boundaries, and source lineage from the source spans remain preserved."
  - "No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created by this PlanUnit."
validation_surfaces:
  - "python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits"
  - "python3 scripts/pm-plan-index.py validate"
risk_class: prompt_pipeline_drift
reasoning_tier: standard
context_scope: prompt_pipeline
implementation_surfaces:
  - "Plans/Prompt_Pipeline.md"
node_compile_hint:
  mode: requirement
  create_worknodes: false
source_lineage:
  - "Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Prompt_Pipeline-S0023"
preserved_exact_tokens:
  - "Effective Persona and Runtime Resolution Pipeline"
  - "provider family selection"
  - "account or server-profile resolution"
  - "billing/entity attribution"
  - "PM-native skills/MCP assembly"
negative_constraints: []
preserved_contractrefs:
  - "ContractRef: ContractName:Plans/Contracts_V0.md, ContractName:Plans/Multi-Account.md, ContractName:Plans/Models_System.md"
owner_hints:
  - "Plans/Prompt_Pipeline.md"
  - "Plans/Contracts_V0.md"
  - "Plans/Multi-Account.md"
  - "Plans/Models_System.md"
```

### PP-030 - Pre-Prompt Resolution And Skill Readiness Order

```yaml
plan_unit_id: PP-030
unit_type: requirement
status: accepted
owner_doc: Plans/Prompt_Pipeline.md
canonical_text: >-
  Before final prompt payload emission, runtime resolution follows the ordered surface, provider, account/profile, entitlement, effective runtime, skill readiness, MCP/tool availability, instruction bundle, and frozen snapshot stages, with PM-native skill/tool readiness derived from explicit dependency metadata and transported through normal prompt/context assembly.
gui_related: false
gui_classification_reason: This unit defines pre-prompt resolver and skill readiness ordering rather than visual presentation.
split_recommended: false
depends_on:
  - "PP-029"
  - "PP-009"
unblocks: []
acceptance_criteria:
  - "Pre-Prompt Resolution And Skill Readiness Order remains addressable as a fine-grained Prompt Pipeline PlanUnit."
  - "ContractRefs, anchors, exact tokens, negative constraints, compatibility-only notes, stale/retired dispositions, owner/consumer boundaries, and source lineage from the source spans remain preserved."
  - "No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created by this PlanUnit."
validation_surfaces:
  - "python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits"
  - "python3 scripts/pm-plan-index.py validate"
risk_class: prompt_pipeline_drift
reasoning_tier: standard
context_scope: prompt_pipeline
implementation_surfaces:
  - "Plans/Prompt_Pipeline.md"
node_compile_hint:
  mode: requirement
  create_worknodes: false
source_lineage:
  - "Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Prompt_Pipeline-S0024"
preserved_exact_tokens:
  - "surface context and workflow overlay"
  - "requested provider entry"
  - "provider family"
  - "eligible account rows"
  - "server-profile rows"
  - "entitlement or billing-entity selection"
  - "PM-native skill readiness"
  - "required_tool_refs"
  - "optional_tool_refs"
  - "list_skills_for_agent(project_root, permissions)"
  - "prompt_parts"
  - "tool_policy"
  - "transport-agnostic"
negative_constraints:
  - "PM skill context is delivered through compiled prompt/context assembly, not through a mandatory provider-native install path or raw skill names/paths."
preserved_contractrefs: []
owner_hints:
  - "Plans/Prompt_Pipeline.md"
```

### PP-031 - Selection Source And Reason Enumeration

```yaml
plan_unit_id: PP-031
unit_type: requirement
status: accepted
owner_doc: Plans/Prompt_Pipeline.md
canonical_text: >-
  Prompt Pipeline preserves persona_selection_source as the canonical requested-Persona source enum and adds runtime_selection_source plus a human-readable selection_reason for inspectors and audit history.
gui_related: false
gui_classification_reason: This unit defines resolver source metadata rather than visual presentation.
split_recommended: false
depends_on:
  - "PP-029"
unblocks: []
acceptance_criteria:
  - "Selection Source And Reason Enumeration remains addressable as a fine-grained Prompt Pipeline PlanUnit."
  - "ContractRefs, anchors, exact tokens, negative constraints, compatibility-only notes, stale/retired dispositions, owner/consumer boundaries, and source lineage from the source spans remain preserved."
  - "No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created by this PlanUnit."
validation_surfaces:
  - "python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits"
  - "python3 scripts/pm-plan-index.py validate"
risk_class: prompt_pipeline_drift
reasoning_tier: standard
context_scope: prompt_pipeline
implementation_surfaces:
  - "Plans/Prompt_Pipeline.md"
node_compile_hint:
  mode: requirement
  create_worknodes: false
source_lineage:
  - "Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Prompt_Pipeline-S0025"
preserved_exact_tokens:
  - "persona_selection_source"
  - "runtime_selection_source"
  - "manual_ui"
  - "surface_default"
  - "config_default"
  - "persona_preference"
  - "auto_family_pool"
  - "fallback"
  - "selection_reason"
negative_constraints: []
preserved_contractrefs: []
owner_hints:
  - "Plans/Prompt_Pipeline.md"
```

### PP-032 - Requested Persona Precedence Non-Rewrite

```yaml
plan_unit_id: PP-032
unit_type: constraint
status: accepted
owner_doc: Plans/Prompt_Pipeline.md
canonical_text: >-
  Requested Persona precedence remains explicit override, scoped natural-language override, surface mapping, surface auto resolver candidate, config default, then canonical fallback; runtime/provider selection happens afterward and cannot rewrite the winning requested-Persona source.
gui_related: false
gui_classification_reason: This unit defines Persona resolver precedence and non-rewrite rules rather than visual presentation.
split_recommended: false
depends_on:
  - "PP-031"
unblocks: []
acceptance_criteria:
  - "Requested Persona Precedence Non-Rewrite remains addressable as a fine-grained Prompt Pipeline PlanUnit."
  - "ContractRefs, anchors, exact tokens, negative constraints, compatibility-only notes, stale/retired dispositions, owner/consumer boundaries, and source lineage from the source spans remain preserved."
  - "No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created by this PlanUnit."
validation_surfaces:
  - "python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits"
  - "python3 scripts/pm-plan-index.py validate"
risk_class: prompt_pipeline_drift
reasoning_tier: standard
context_scope: prompt_pipeline
implementation_surfaces:
  - "Plans/Prompt_Pipeline.md"
node_compile_hint:
  mode: constraint
  create_worknodes: false
source_lineage:
  - "Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Prompt_Pipeline-S0026"
preserved_exact_tokens:
  - "Canonical requested-Persona precedence"
  - "explicit run-envelope or manual surface override"
  - "active scoped natural-language override"
  - "surface-specific explicit mapping"
  - "surface auto resolver candidate"
  - "config default"
  - "canonical fallback"
negative_constraints:
  - "Runtime/provider selection occurs after requested Persona resolution and MUST NOT rewrite the winning requested-Persona source."
preserved_contractrefs: []
owner_hints:
  - "Plans/Prompt_Pipeline.md"
```

### PP-033 - Runtime Account Profile Resolution Rules

```yaml
plan_unit_id: PP-033
unit_type: requirement
status: accepted
owner_doc: Plans/Prompt_Pipeline.md
canonical_text: >-
  Provider/runtime resolution preserves requested_platform, effective_platform, provider_family_id, effective account rows, effective connection_profile_id, and billing/entity bucket semantics while keeping provider examples distinct by runtime surface and auth family.
gui_related: false
gui_classification_reason: This unit defines runtime/account/profile resolver fields rather than visual presentation.
split_recommended: false
depends_on:
  - "PP-031"
  - "PP-032"
unblocks: []
acceptance_criteria:
  - "Runtime Account Profile Resolution Rules remains addressable as a fine-grained Prompt Pipeline PlanUnit."
  - "ContractRefs, anchors, exact tokens, negative constraints, compatibility-only notes, stale/retired dispositions, owner/consumer boundaries, and source lineage from the source spans remain preserved."
  - "No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created by this PlanUnit."
validation_surfaces:
  - "python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits"
  - "python3 scripts/pm-plan-index.py validate"
risk_class: prompt_pipeline_drift
reasoning_tier: standard
context_scope: prompt_pipeline
implementation_surfaces:
  - "Plans/Prompt_Pipeline.md"
node_compile_hint:
  mode: requirement
  create_worknodes: false
source_lineage:
  - "Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Prompt_Pipeline-S0027"
preserved_exact_tokens:
  - "requested_platform"
  - "effective_platform"
  - "provider_family_id"
  - "effective account row"
  - "connection_profile_id"
  - "billing/entity bucket"
  - "Gemini CLI"
  - "ChatGPT"
  - "API key"
  - "GitHub Copilot"
  - "OpenCode"
negative_constraints: []
preserved_contractrefs: []
owner_hints:
  - "Plans/Prompt_Pipeline.md"
```

### PP-034 - Requested Effective Account Identity Fields

```yaml
plan_unit_id: PP-034
unit_type: requirement
status: accepted
owner_doc: Plans/Prompt_Pipeline.md
canonical_text: >-
  The shared requested/effective account identity contract adds requested_account_id beside requested_account_policy, models requested_account_binding independently, carries effective account identity through runtime envelopes, and treats provider_account_id only as subordinate provider-native echo metadata.
gui_related: false
gui_classification_reason: This unit defines account identity schema fields rather than visual presentation.
split_recommended: false
depends_on:
  - "PP-033"
unblocks: []
acceptance_criteria:
  - "Requested Effective Account Identity Fields remains addressable as a fine-grained Prompt Pipeline PlanUnit."
  - "ContractRefs, anchors, exact tokens, negative constraints, compatibility-only notes, stale/retired dispositions, owner/consumer boundaries, and source lineage from the source spans remain preserved."
  - "No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created by this PlanUnit."
validation_surfaces:
  - "python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits"
  - "python3 scripts/pm-plan-index.py validate"
risk_class: prompt_pipeline_drift
reasoning_tier: standard
context_scope: prompt_pipeline
implementation_surfaces:
  - "Plans/Prompt_Pipeline.md"
node_compile_hint:
  mode: requirement
  create_worknodes: false
source_lineage:
  - "Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Prompt_Pipeline-S0028"
  - "Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Prompt_Pipeline-S0029"
preserved_exact_tokens:
  - "requested_account_id"
  - "requested_account_policy"
  - "requested_account_binding"
  - "provider_account_id"
  - "none | preferred | required"
  - "effective_account_id"
  - "effective_provider_identity"
  - "execution_role"
  - "operational_identity"
  - "account_switch_reason"
negative_constraints:
  - "Account choice and policy posture never collapse into one field."
preserved_contractrefs: []
stale_retired_dispositions:
  - "provider_account_id is retired from canonical account-identity naming and remains provider-native echo metadata only."
owner_hints:
  - "Plans/Prompt_Pipeline.md"
```

### PP-035 - Account Identity Display Grammar

```yaml
plan_unit_id: PP-035
unit_type: requirement
status: accepted
owner_doc: Plans/Prompt_Pipeline.md
canonical_text: >-
  Requested/effective account identity must be visible with Requested account, Requested binding, Effective account, Switch reason, named display grammar, and worker-policy display under the same requested/effective grammar.
gui_related: true
gui_classification_reason: This unit preserves user-visible runtime identity display grammar and switch reason labels.
split_recommended: false
depends_on:
  - "PP-034"
unblocks: []
acceptance_criteria:
  - "Account Identity Display Grammar remains addressable as a fine-grained Prompt Pipeline PlanUnit."
  - "ContractRefs, anchors, exact tokens, negative constraints, compatibility-only notes, stale/retired dispositions, owner/consumer boundaries, and source lineage from the source spans remain preserved."
  - "No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created by this PlanUnit."
validation_surfaces:
  - "python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits"
  - "python3 scripts/pm-plan-index.py validate"
risk_class: prompt_pipeline_drift
reasoning_tier: standard
context_scope: prompt_pipeline
implementation_surfaces:
  - "Plans/Prompt_Pipeline.md"
node_compile_hint:
  mode: requirement
  create_worknodes: false
source_lineage:
  - "Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Prompt_Pipeline-S0029"
  - "Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Prompt_Pipeline-S0030"
  - "Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Prompt_Pipeline-S0031"
preserved_exact_tokens:
  - "Requested account"
  - "Requested binding"
  - "Effective account"
  - "Switch reason"
  - "Inherited from"
  - "Overridden by"
  - "Requested"
  - "Effective"
  - "Reason"
  - "Support"
  - "worker-policy display"
negative_constraints: []
preserved_contractrefs: []
owner_hints:
  - "Plans/Prompt_Pipeline.md"
  - "Plans/FinalGUISpec.md"
  - "Plans/Orchestrator_Page.md"
```

### PP-036 - Three Axis Resolver Emit Shape

```yaml
plan_unit_id: PP-036
unit_type: requirement
status: accepted
owner_doc: Plans/Prompt_Pipeline.md
canonical_text: >-
  The resolver uses the source/request/execution settings model, preserves requested versus effective display values, accepts Persona, override, default, policy, capability, account/profile, worktree, and execution-role inputs, follows the deterministic resolver matrix, and emits requested/effective platform, model, variant, auth mode, account, role, reason, matrix entry, and worker policy fields.
gui_related: false
gui_classification_reason: This unit defines resolver mechanics and emitted fields rather than visual presentation.
split_recommended: false
depends_on:
  - "PP-034"
unblocks: []
acceptance_criteria:
  - "Three Axis Resolver Emit Shape remains addressable as a fine-grained Prompt Pipeline PlanUnit."
  - "ContractRefs, anchors, exact tokens, negative constraints, compatibility-only notes, stale/retired dispositions, owner/consumer boundaries, and source lineage from the source spans remain preserved."
  - "No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created by this PlanUnit."
validation_surfaces:
  - "python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits"
  - "python3 scripts/pm-plan-index.py validate"
risk_class: prompt_pipeline_drift
reasoning_tier: standard
context_scope: prompt_pipeline
implementation_surfaces:
  - "Plans/Prompt_Pipeline.md"
node_compile_hint:
  mode: requirement
  create_worknodes: false
source_lineage:
  - "Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Prompt_Pipeline-S0028"
  - "Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Prompt_Pipeline-S0030"
preserved_exact_tokens:
  - "source"
  - "request"
  - "execution"
  - "working_directory"
  - "FileSafe"
  - "tool cwd"
  - "explicit override -> scoped owner policy -> Persona preference -> surface/stage default -> project/global default -> last-used state when permitted -> provider default"
  - "requested_platform"
  - "effective_platform"
  - "requested_model"
  - "effective_model"
  - "requested_variant"
  - "effective_variant"
  - "requested_auth_mode"
  - "effective_auth_mode"
  - "resolver_matrix_entry"
  - "worker_policy_display"
negative_constraints:
  - "Prompt assembly may reference execution_unit_context but does not inject a separate worktree prompt block merely to make tools operate in the worktree."
preserved_contractrefs: []
owner_hints:
  - "Plans/Prompt_Pipeline.md"
  - "Plans/FileSafe.md"
```

### PP-037 - P5 Export Resolver Gap Packet

```yaml
plan_unit_id: PP-037
unit_type: source_lineage_reconciliation
status: accepted
owner_doc: Plans/Prompt_Pipeline.md
canonical_text: >-
  The P5 recovery packet is source-lineage-only reconciliation evidence for export taxonomy, export-family distinctions, source-layer enumeration, resolver actor inputs, deterministic resolver matrix, ranked candidates, winner, and fallback reason. It is not implementation canon for the current runtime/compiler packet and does not block accepted runtime flow.
gui_related: true
gui_classification_reason: The preserved recovery packet includes GUI/export/Orchestrator display grammar and cross-surface inspection gaps.
split_recommended: false
depends_on:
  - "PP-035"
  - "PP-036"
unblocks: []
acceptance_criteria:
  - "P5 Export Resolver Gap Packet remains addressable as source-lineage-only reconciliation evidence."
  - "ContractRefs, anchors, exact tokens, negative constraints, compatibility-only notes, stale/retired dispositions, owner/consumer boundaries, and source lineage from the source spans remain preserved."
  - "No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created by this PlanUnit."
validation_surfaces:
  - "python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits"
  - "python3 scripts/pm-plan-index.py validate"
risk_class: source_lineage_reconciliation_not_current_blocker
reasoning_tier: standard
context_scope: prompt_pipeline_reconciliation_gap
implementation_surfaces:
  - "Plans/Prompt_Pipeline.md"
node_compile_hint:
  mode: source_lineage_only_not_required_for_current_runtime
  create_worknodes: false
source_lineage:
  - "Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Prompt_Pipeline-S0031"
preserved_exact_tokens:
  - "record"
  - "bundle"
  - "view"
  - "Evidence / Artifact / Ledger / Run / Record"
  - "source-layer enumeration"
  - "actor-type"
  - "operation-type"
  - "ranked candidates"
  - "winner"
  - "fallback reason"
negative_constraints: []
preserved_contractrefs: []
owner_hints:
  - "Plans/Prompt_Pipeline.md"
  - "Plans/Orchestrator_Page.md"
  - "Plans/storage-plan.md"
  - "Plans/FinalGUISpec.md"
  - "Plans/Models_System.md"
  - "Plans/Multi-Account.md"
  - "Plans/Contracts_V0.md"
```

### PP-038 - Provider Attempt Snapshot Requirements

```yaml
plan_unit_id: PP-038
unit_type: requirement
status: accepted
owner_doc: Plans/Prompt_Pipeline.md
canonical_text: >-
  Every provider-executed attempt requires requested/effective persona, model, and permission snapshot refs plus requested/effective auth/account policy and account-switch fields so runtime evidence can show requested and effective truth.
gui_related: false
gui_classification_reason: This unit defines provider attempt evidence fields rather than visual presentation.
split_recommended: false
depends_on:
  - "PP-034"
  - "PP-036"
unblocks: []
acceptance_criteria:
  - "Provider Attempt Snapshot Requirements remains addressable as a fine-grained Prompt Pipeline PlanUnit."
  - "ContractRefs, anchors, exact tokens, negative constraints, compatibility-only notes, stale/retired dispositions, owner/consumer boundaries, and source lineage from the source spans remain preserved."
  - "No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created by this PlanUnit."
validation_surfaces:
  - "python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits"
  - "python3 scripts/pm-plan-index.py validate"
risk_class: prompt_pipeline_drift
reasoning_tier: standard
context_scope: prompt_pipeline
implementation_surfaces:
  - "Plans/Prompt_Pipeline.md"
node_compile_hint:
  mode: requirement
  create_worknodes: false
source_lineage:
  - "Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Prompt_Pipeline-S0031"
preserved_exact_tokens:
  - "requested/effective persona snapshot ref"
  - "requested/effective model snapshot ref"
  - "requested/effective permission snapshot ref"
  - "requested_auth_mode?"
  - "effective_auth_mode?"
  - "requested_account_policy?"
  - "effective_account_id?"
  - "account_switch_reason?"
negative_constraints: []
preserved_contractrefs: []
owner_hints:
  - "Plans/Prompt_Pipeline.md"
```

### PP-039 - Tier Compatibility And Runtime Identity Owner Boundary

```yaml
plan_unit_id: PP-039
unit_type: constraint
status: accepted
owner_doc: Plans/Prompt_Pipeline.md
canonical_text: >-
  Prompt Pipeline owns prompt-assembly handoff shape, storage owns durable records, and tier context survives only as compatibility or derived grouping; stale tier-era scope vocabulary must not become a third runtime identity authority.
gui_related: false
gui_classification_reason: This unit constrains runtime identity ownership and compatibility vocabulary rather than visual presentation.
split_recommended: false
depends_on:
  - "PP-007"
  - "PP-034"
unblocks: []
acceptance_criteria:
  - "Tier Compatibility And Runtime Identity Owner Boundary remains addressable as a fine-grained Prompt Pipeline PlanUnit."
  - "ContractRefs, anchors, exact tokens, negative constraints, compatibility-only notes, stale/retired dispositions, owner/consumer boundaries, and source lineage from the source spans remain preserved."
  - "No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created by this PlanUnit."
validation_surfaces:
  - "python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits"
  - "python3 scripts/pm-plan-index.py validate"
risk_class: prompt_pipeline_drift
reasoning_tier: standard
context_scope: prompt_pipeline
implementation_surfaces:
  - "Plans/Prompt_Pipeline.md"
node_compile_hint:
  mode: constraint
  create_worknodes: false
source_lineage:
  - "Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Prompt_Pipeline-S0031"
preserved_exact_tokens:
  - "tier context"
  - "compatibility/derived grouping"
  - "requested/effective runtime identity duplication"
  - "tier"
  - "tier/mode/platform/model"
  - "stage/tier/task context"
  - "persona_override_owner_id"
  - "tier_id"
  - "node-identity"
  - "package-identity"
  - "lane-identity"
negative_constraints:
  - "Tier context must not become a third runtime identity authority."
preserved_contractrefs: []
compatibility_only_notes:
  - "Surviving tier labels are compatibility or derived grouping metadata only."
stale_retired_dispositions:
  - "Run envelope, active mode/tier, plan_or_tier_default, Orchestrator tier override, stage/tier/task/repo context, and persona_override_owner_id tier_id are stale scope vocabulary."
owner_hints:
  - "Plans/Prompt_Pipeline.md"
  - "Plans/storage-plan.md"
  - "Plans/Widget_System.md"
```

### PP-040 - Prompt Widget UI Non Ownership Constraint

```yaml
plan_unit_id: PP-040
unit_type: constraint
status: accepted
owner_doc: Plans/Prompt_Pipeline.md
canonical_text: >-
  Prompt Pipeline must not teach tier-tree or active-tier widget semantics as reusable widget SSOT; prompt examples and context bundles may reference derived tier labels only as compatibility display metadata while Widget_System owns widget taxonomy.
gui_related: true
gui_classification_reason: This unit constrains GUI/widget ownership and display metadata.
split_recommended: false
depends_on:
  - "PP-039"
unblocks: []
acceptance_criteria:
  - "Prompt Widget UI Non Ownership Constraint remains addressable as a fine-grained Prompt Pipeline PlanUnit."
  - "ContractRefs, anchors, exact tokens, negative constraints, compatibility-only notes, stale/retired dispositions, owner/consumer boundaries, and source lineage from the source spans remain preserved."
  - "No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created by this PlanUnit."
validation_surfaces:
  - "python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits"
  - "python3 scripts/pm-plan-index.py validate"
risk_class: widget_owner_boundary_drift
reasoning_tier: standard
context_scope: prompt_pipeline
implementation_surfaces:
  - "Plans/Prompt_Pipeline.md"
node_compile_hint:
  mode: blocked_cross_owner_reconciliation
  create_worknodes: false
source_lineage:
  - "Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Prompt_Pipeline-S0031"
preserved_exact_tokens:
  - "tier-tree"
  - "active-tier"
  - "widget SSOT"
  - "compatibility display metadata"
  - "Widget_System"
  - "Orchestrator_Page.md"
  - "FinalGUISpec.md"
negative_constraints:
  - "Prompt Pipeline MUST NOT teach tier-tree or active-tier widget semantics as reusable widget SSOT."
preserved_contractrefs: []
owner_hints:
  - "Plans/Prompt_Pipeline.md"
  - "Plans/Widget_System.md"
  - "Plans/FinalGUISpec.md"
  - "Plans/Orchestrator_Page.md"
```

### PP-041 - Cross Doc Operational Gap Register

```yaml
plan_unit_id: PP-041
unit_type: source_lineage_reconciliation
status: accepted
owner_doc: Plans/Prompt_Pipeline.md
canonical_text: >-
  Prompt Pipeline preserves operational gap evidence for newtools, Contracts, Permissions, Personas, storage/usage, tool/runtime surfaces, Source Control, and rewrite-era operational nouns as source-lineage-only reconciliation input. Ownership for current runtime/compiler implementation readiness is resolved by the active owner docs named by each current PlanUnit, not by this historical register.
gui_related: false
gui_classification_reason: This unit preserves cross-document owner gaps rather than visual presentation.
split_recommended: false
depends_on:
  - "PP-039"
unblocks: []
acceptance_criteria:
  - "Cross Doc Operational Gap Register remains addressable as source-lineage-only reconciliation evidence."
  - "ContractRefs, anchors, exact tokens, negative constraints, compatibility-only notes, stale/retired dispositions, owner/consumer boundaries, and source lineage from the source spans remain preserved."
  - "No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created by this PlanUnit."
validation_surfaces:
  - "python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits"
  - "python3 scripts/pm-plan-index.py validate"
risk_class: source_lineage_owner_gap_not_current_blocker
reasoning_tier: standard
context_scope: prompt_pipeline_reconciliation_gap
implementation_surfaces:
  - "Plans/Prompt_Pipeline.md"
node_compile_hint:
  mode: source_lineage_only_not_required_for_current_runtime
  create_worknodes: false
source_lineage:
  - "Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Prompt_Pipeline-S0031"
preserved_exact_tokens:
  - "newtools.md"
  - "doctor-ID"
  - "CustomHeadlessTool"
  - "live.*"
  - "memory.gist.*"
  - "AutoRunBoundary/AutoMilestone"
  - "attention_required"
  - "Permissions_System.md"
  - "Contracts_V0.md"
  - "Personas.md"
  - "storage-plan.md"
  - "usage-feature.md"
  - "Formatters_System.md"
  - "LSPSupport.md"
  - "Plugins_System.md"
  - "Skills_System.md"
  - "agent-rules-context.md"
  - "Overseer"
  - "attempt"
  - "Seglog"
negative_constraints: []
preserved_contractrefs: []
owner_hints:
  - "Plans/Prompt_Pipeline.md"
  - "Plans/Contracts_V0.md"
  - "Plans/Permissions_System.md"
  - "Plans/Personas.md"
  - "Plans/storage-plan.md"
  - "Plans/usage-feature.md"
  - "Plans/Tools.md"
  - "Plans/Plugins_System.md"
  - "Plans/Skills_System.md"
  - "Plans/LSPSupport.md"
```

### PP-042 - Dispatch Boundary And Blocked Attempt Integrity

```yaml
plan_unit_id: PP-042
unit_type: requirement
status: accepted
owner_doc: Plans/Prompt_Pipeline.md
canonical_text: >-
  Prompt Pipeline preserves the dispatch-boundary fracture as a reconciliation target and requires runtime snapshot refs or canonical runtime bundles, first-class blocked/degraded reason ownership, blocked_reason_code as SSOT, and unique attempt_id values across retry or resume.
gui_related: false
gui_classification_reason: This unit defines dispatch and blocked-attempt integrity fields rather than visual presentation.
split_recommended: false
depends_on:
  - "PP-038"
  - "PP-041"
unblocks: []
acceptance_criteria:
  - "Dispatch Boundary And Blocked Attempt Integrity remains addressable as a fine-grained Prompt Pipeline PlanUnit."
  - "ContractRefs, anchors, exact tokens, negative constraints, compatibility-only notes, stale/retired dispositions, owner/consumer boundaries, and source lineage from the source spans remain preserved."
  - "No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created by this PlanUnit."
validation_surfaces:
  - "python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits"
  - "python3 scripts/pm-plan-index.py validate"
risk_class: runtime_identity_ssot_fracture
reasoning_tier: standard
context_scope: prompt_pipeline
implementation_surfaces:
  - "Plans/Prompt_Pipeline.md"
node_compile_hint:
  mode: blocked_cross_owner_reconciliation
  create_worknodes: false
source_lineage:
  - "Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Prompt_Pipeline-S0031"
preserved_exact_tokens:
  - "dispatch boundary"
  - "runtime snapshot refs"
  - "inline canonical runtime bundles"
  - "requested-vs-effective truth"
  - "requested_account_policy"
  - "effective_account_id"
  - "requested concrete account"
  - "blocked/degraded reason family"
  - "account_switch_reason?"
  - "blocked_reason_code"
  - "attempt_id"
negative_constraints:
  - "Retry/resume should not reuse old attempt ids."
preserved_contractrefs: []
owner_hints:
  - "Plans/Prompt_Pipeline.md"
  - "Plans/Contracts_V0.md"
  - "Plans/Multi-Account.md"
  - "Plans/assistant-chat-design.md"
```

### PP-043 - Pathing Migration And Source Lineage Tail

```yaml
plan_unit_id: PP-043
unit_type: source_lineage_residual_disposition
status: accepted
owner_doc: Plans/Prompt_Pipeline.md
canonical_text: >-
  Pathing migration candidates and source-lineage tail tokens are preserved as source-lineage-only residuals, including package/node, seam/package/node, content-addressed candidates, topic initialization context, and model-tail notes, without converting them into implementation requirements or current runtime/compiler dependencies.
gui_related: false
gui_classification_reason: This unit preserves pathing and lineage notes rather than visual presentation.
split_recommended: false
depends_on:
  - "PP-039"
unblocks: []
acceptance_criteria:
  - "Pathing Migration And Source Lineage Tail remains addressable as source-lineage-only residual evidence."
  - "ContractRefs, anchors, exact tokens, negative constraints, compatibility-only notes, stale/retired dispositions, owner/consumer boundaries, and source lineage from the source spans remain preserved."
  - "No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created by this PlanUnit."
validation_surfaces:
  - "python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits"
  - "python3 scripts/pm-plan-index.py validate"
risk_class: source_lineage_pathing_residual_not_current_blocker
reasoning_tier: standard
context_scope: prompt_pipeline_reconciliation_gap
implementation_surfaces:
  - "Plans/Prompt_Pipeline.md"
node_compile_hint:
  mode: source_lineage_residual_not_required_for_current_runtime
  create_worknodes: false
source_lineage:
  - "Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Prompt_Pipeline-S0031"
preserved_exact_tokens:
  - "<phase>/<task>/<subtask>"
  - "<package_id>/<node_id>"
  - "<seam_id>/<package_id>/<node_id>"
  - "content-addressed"
  - "Orchestrator"
  - "source_ref"
  - "Gemini + Opus + Sonnet + GPT-5.4"
  - "Gemini + Opus + Sonnet + GPT-5.4 + GPT-5.2"
negative_constraints: []
preserved_contractrefs: []
owner_hints:
  - "Plans/Prompt_Pipeline.md"
```

### PP-044 - Natural Language Persona Invocation Guardrails

```yaml
plan_unit_id: PP-044
unit_type: constraint
status: accepted
owner_doc: Plans/Prompt_Pipeline.md
canonical_text: >-
  Natural-language Persona invocation remains conservative and applies only to Persona resolution; it must not silently rewrite requested provider entry, requested auth family, selected billing entity, or selected server profile.
gui_related: false
gui_classification_reason: This unit defines Persona invocation guardrails rather than visual presentation.
split_recommended: false
depends_on:
  - "PP-032"
  - "PP-036"
unblocks: []
acceptance_criteria:
  - "Natural Language Persona Invocation Guardrails remains addressable as a fine-grained Prompt Pipeline PlanUnit."
  - "ContractRefs, anchors, exact tokens, negative constraints, compatibility-only notes, stale/retired dispositions, owner/consumer boundaries, and source lineage from the source spans remain preserved."
  - "No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created by this PlanUnit."
validation_surfaces:
  - "python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits"
  - "python3 scripts/pm-plan-index.py validate"
risk_class: prompt_pipeline_drift
reasoning_tier: standard
context_scope: prompt_pipeline
implementation_surfaces:
  - "Plans/Prompt_Pipeline.md"
node_compile_hint:
  mode: constraint
  create_worknodes: false
source_lineage:
  - "Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Prompt_Pipeline-S0032"
preserved_exact_tokens:
  - "Natural-language Persona invocation"
  - "execution_unit_context"
  - "working_directory"
  - "FileSafe"
  - "tool cwd"
  - "Agent-Config"
  - "requested provider entry"
  - "requested auth family"
  - "selected billing entity"
  - "selected server profile"
negative_constraints:
  - "Natural-language Persona invocation MUST NOT silently rewrite provider, auth, billing entity, or server profile selections."
preserved_contractrefs: []
owner_hints:
  - "Plans/Prompt_Pipeline.md"
  - "Plans/FileSafe.md"
```

### PP-045 - Effective Resolution Record Identity Fields

```yaml
plan_unit_id: PP-045
unit_type: requirement
status: accepted
owner_doc: Plans/Prompt_Pipeline.md
canonical_text: >-
  The effective-resolution record carries execution role, requested/effective account identity, requested/effective operational identity, account switch lineage, account pressure owner, blocked sequence, optional approval, and DAE jail posture across attempt, usage, inspector, recovery, remediation, and consumer docs.
gui_related: false
gui_classification_reason: This unit defines effective-resolution identity fields rather than visual presentation.
split_recommended: false
depends_on:
  - "PP-034"
  - "PP-038"
unblocks: []
acceptance_criteria:
  - "Effective Resolution Record Identity Fields remains addressable as a fine-grained Prompt Pipeline PlanUnit."
  - "ContractRefs, anchors, exact tokens, negative constraints, compatibility-only notes, stale/retired dispositions, owner/consumer boundaries, and source lineage from the source spans remain preserved."
  - "No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created by this PlanUnit."
validation_surfaces:
  - "python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits"
  - "python3 scripts/pm-plan-index.py validate"
risk_class: prompt_pipeline_drift
reasoning_tier: standard
context_scope: prompt_pipeline
implementation_surfaces:
  - "Plans/Prompt_Pipeline.md"
node_compile_hint:
  mode: requirement
  create_worknodes: false
source_lineage:
  - "Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Prompt_Pipeline-S0033"
  - "Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Prompt_Pipeline-S0034"
preserved_exact_tokens:
  - "execution_role"
  - "requested_account_id"
  - "effective_account_id"
  - "requested_operational_identity"
  - "effective_operational_identity"
  - "account_switch_lineage[]"
  - "account_pressure_owner"
  - "blocked_sequence"
  - "approval_id?"
  - "dae_jail_posture"
negative_constraints: []
preserved_contractrefs: []
owner_hints:
  - "Plans/Prompt_Pipeline.md"
```

### PP-046 - Execution Unit Context Runtime Record

```yaml
plan_unit_id: PP-046
unit_type: requirement
status: accepted
owner_doc: Plans/Prompt_Pipeline.md
canonical_text: >-
  execution_unit_context is the canonical runtime-facing context object for worker spawn, recovery, remediation, and coordination; TierContext is compatibility/decomposition metadata, tier_id is retired, and canonical selection keys from execution_unit_type plus execution_unit_id.
gui_related: false
gui_classification_reason: This unit defines runtime context identity rather than visual presentation.
split_recommended: false
depends_on:
  - "PP-045"
unblocks: []
acceptance_criteria:
  - "Execution Unit Context Runtime Record remains addressable as a fine-grained Prompt Pipeline PlanUnit."
  - "ContractRefs, anchors, exact tokens, negative constraints, compatibility-only notes, stale/retired dispositions, owner/consumer boundaries, and source lineage from the source spans remain preserved."
  - "No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created by this PlanUnit."
validation_surfaces:
  - "python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits"
  - "python3 scripts/pm-plan-index.py validate"
risk_class: prompt_pipeline_drift
reasoning_tier: standard
context_scope: prompt_pipeline
implementation_surfaces:
  - "Plans/Prompt_Pipeline.md"
node_compile_hint:
  mode: requirement
  create_worknodes: false
source_lineage:
  - "Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Prompt_Pipeline-S0035"
preserved_exact_tokens:
  - "execution_unit_context"
  - "TierContext"
  - "tier_id"
  - "execution_unit_id"
  - "execution_unit_type"
  - "run"
  - "seam"
  - "package"
  - "node"
  - "overseer"
  - "delegated_subagent"
  - "parent_execution_unit_id"
  - "execution_role"
  - "worktree_id"
  - "ownership_transition_from"
negative_constraints: []
preserved_contractrefs: []
compatibility_only_notes:
  - "TierContext is a derived or compatibility-only selection/decomposition helper."
stale_retired_dispositions:
  - "tier_id is retired as canonical selection identity."
owner_hints:
  - "Plans/Prompt_Pipeline.md"
```

### PP-047 - Execution Unit Context UI Inspection Hook

```yaml
plan_unit_id: PP-047
unit_type: requirement
status: accepted
owner_doc: Plans/Prompt_Pipeline.md
canonical_text: >-
  UI inspection consumes execution_unit_context for runtime inspection without owning or redefining the runtime-facing context record.
gui_related: true
gui_classification_reason: This unit preserves UI inspection as a visible consumer of execution_unit_context.
split_recommended: false
depends_on:
  - "PP-046"
unblocks: []
acceptance_criteria:
  - "Execution Unit Context UI Inspection Hook remains addressable as a fine-grained Prompt Pipeline PlanUnit."
  - "ContractRefs, anchors, exact tokens, negative constraints, compatibility-only notes, stale/retired dispositions, owner/consumer boundaries, and source lineage from the source spans remain preserved."
  - "No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created by this PlanUnit."
validation_surfaces:
  - "python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits"
  - "python3 scripts/pm-plan-index.py validate"
risk_class: prompt_pipeline_drift
reasoning_tier: standard
context_scope: prompt_pipeline
implementation_surfaces:
  - "Plans/Prompt_Pipeline.md"
node_compile_hint:
  mode: requirement
  create_worknodes: false
source_lineage:
  - "Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Prompt_Pipeline-S0035"
preserved_exact_tokens:
  - "UI inspection"
  - "execution_unit_context"
  - "runtime-facing context object"
negative_constraints: []
preserved_contractrefs: []
owner_hints:
  - "Plans/Prompt_Pipeline.md"
  - "Plans/FinalGUISpec.md"
```

### PP-048 - Blocked Policy And Usage Transfer

```yaml
plan_unit_id: PP-048
unit_type: requirement
status: accepted
owner_doc: Plans/Prompt_Pipeline.md
canonical_text: >-
  Blocked policy and usage transfer reuse blocked_sequence for blocked episode lineage, rebind execution_unit_context, runtime identity, and blocked_sequence during startup recovery, keep DAE jail and approval posture on the same effective-resolution record, and preserve execution role, account identity, and switch history in usage surfaces.
gui_related: false
gui_classification_reason: This unit defines blocked-policy, recovery, and usage behavior rather than visual presentation.
split_recommended: false
depends_on:
  - "PP-045"
  - "PP-046"
unblocks: []
acceptance_criteria:
  - "Blocked Policy And Usage Transfer remains addressable as a fine-grained Prompt Pipeline PlanUnit."
  - "ContractRefs, anchors, exact tokens, negative constraints, compatibility-only notes, stale/retired dispositions, owner/consumer boundaries, and source lineage from the source spans remain preserved."
  - "No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created by this PlanUnit."
validation_surfaces:
  - "python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits"
  - "python3 scripts/pm-plan-index.py validate"
risk_class: prompt_pipeline_drift
reasoning_tier: standard
context_scope: prompt_pipeline
implementation_surfaces:
  - "Plans/Prompt_Pipeline.md"
node_compile_hint:
  mode: requirement
  create_worknodes: false
source_lineage:
  - "Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Prompt_Pipeline-S0036"
preserved_exact_tokens:
  - "blocked_sequence"
  - "Startup recovery handshake"
  - "execution_unit_context"
  - "runtime identity"
  - "DAE jail posture"
  - "approval posture"
  - "effective-resolution record"
  - "execution role"
  - "requested/effective account identity"
  - "switch history"
negative_constraints: []
preserved_contractrefs:
  - "ContractRef: ContractName:Plans/Models_System.md, ContractName:Plans/Contracts_V0.md, ContractName:Plans/Multi-Account.md"
owner_hints:
  - "Plans/Prompt_Pipeline.md"
  - "Plans/Contracts_V0.md"
  - "Plans/Multi-Account.md"
  - "Plans/Models_System.md"
```

### PP-049 - PM Native Skills MCP Assembly Boundary

```yaml
plan_unit_id: PP-049
unit_type: constraint
status: accepted
owner_doc: Plans/Prompt_Pipeline.md
canonical_text: >-
  Skill/tool/MCP resolution is part of the prompt pipeline; PM resolves and bundles skills from the PM registry and compatibility roots before provider execution, computes readiness from required and optional tool refs plus permission state, and treats provider-native files, /systems trees, and other external surfaces as optional projections rather than canonical runtime sources.
gui_related: false
gui_classification_reason: This unit defines skill/MCP assembly ownership rather than visual presentation.
split_recommended: false
depends_on:
  - "PP-030"
  - "PP-009"
unblocks: []
acceptance_criteria:
  - "PM Native Skills MCP Assembly Boundary remains addressable as a fine-grained Prompt Pipeline PlanUnit."
  - "ContractRefs, anchors, exact tokens, negative constraints, compatibility-only notes, stale/retired dispositions, owner/consumer boundaries, and source lineage from the source spans remain preserved."
  - "No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created by this PlanUnit."
validation_surfaces:
  - "python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits"
  - "python3 scripts/pm-plan-index.py validate"
risk_class: prompt_pipeline_drift
reasoning_tier: standard
context_scope: prompt_pipeline
implementation_surfaces:
  - "Plans/Prompt_Pipeline.md"
node_compile_hint:
  mode: constraint
  create_worknodes: false
source_lineage:
  - "Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Prompt_Pipeline-S0037"
preserved_exact_tokens:
  - "Skill/tool/MCP resolution"
  - "/web/skills/runtime packets"
  - "SSOT"
  - "required_tool_refs"
  - "optional_tool_refs"
  - "PM-owned MCP availability"
  - "provider-native skill files"
  - "/systems"
  - "/projection"
  - "PM registry/bundling/skill /tool delivery"
negative_constraints:
  - "Provider-native skill or MCP files are optional projections and are never the canonical runtime source of truth."
preserved_contractrefs: []
compatibility_only_notes:
  - "Provider-native skill files, /systems-style compatibility trees, and other external surfaces are optional /projection layers for interoperability."
owner_hints:
  - "Plans/Prompt_Pipeline.md"
  - "Plans/Skills_System.md"
  - "Plans/Tools.md"
```

### PP-050 - Runtime Resolution UI Transparency

```yaml
plan_unit_id: PP-050
unit_type: requirement
status: accepted
owner_doc: Plans/Prompt_Pipeline.md
canonical_text: >-
  Agent-Config and other detailed inspectors must predict likely effective runtime from the same resolution pipeline before a run starts, then show the frozen snapshot and observed provider deviations after the run starts without heuristically recomputing the original decision.
gui_related: true
gui_classification_reason: This unit defines visible runtime inspector transparency before and after a run.
split_recommended: false
depends_on:
  - "PP-029"
  - "PP-035"
  - "PP-045"
unblocks: []
acceptance_criteria:
  - "Runtime Resolution UI Transparency remains addressable as a fine-grained Prompt Pipeline PlanUnit."
  - "ContractRefs, anchors, exact tokens, negative constraints, compatibility-only notes, stale/retired dispositions, owner/consumer boundaries, and source lineage from the source spans remain preserved."
  - "No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created by this PlanUnit."
validation_surfaces:
  - "python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits"
  - "python3 scripts/pm-plan-index.py validate"
risk_class: prompt_pipeline_drift
reasoning_tier: standard
context_scope: prompt_pipeline
implementation_surfaces:
  - "Plans/Prompt_Pipeline.md"
node_compile_hint:
  mode: requirement
  create_worknodes: false
source_lineage:
  - "Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Prompt_Pipeline-S0038"
preserved_exact_tokens:
  - "UI transparency requirement"
  - "Agent-Config"
  - "detailed inspectors"
  - "likely effective runtime"
  - "frozen snapshot"
  - "observed provider deviations"
  - "heuristically recomputing"
negative_constraints: []
preserved_contractrefs: []
owner_hints:
  - "Plans/Prompt_Pipeline.md"
  - "Plans/FinalGUISpec.md"
```

### PP-051 - Runtime Attempt Snapshot Handoff Bundle

```yaml
plan_unit_id: PP-051
unit_type: requirement
status: accepted
owner_doc: Plans/Prompt_Pipeline.md
canonical_text: >-
  Every attempt snapshot preserves project, thread, wizard, resolution, execution_unit_context, requested/effective account identity, execution role, operational identity, blocked sequence, approval scope, and launched run request references as the canonical bridge from planning-time wizard state to the executing run.
gui_related: false
gui_classification_reason: This unit defines attempt snapshot handoff fields rather than visual presentation.
split_recommended: false
depends_on:
  - "PP-045"
  - "PP-046"
unblocks: []
acceptance_criteria:
  - "Runtime Attempt Snapshot Handoff Bundle remains addressable as a fine-grained Prompt Pipeline PlanUnit."
  - "ContractRefs, anchors, exact tokens, negative constraints, compatibility-only notes, stale/retired dispositions, owner/consumer boundaries, and source lineage from the source spans remain preserved."
  - "No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created by this PlanUnit."
validation_surfaces:
  - "python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits"
  - "python3 scripts/pm-plan-index.py validate"
risk_class: prompt_pipeline_drift
reasoning_tier: standard
context_scope: prompt_pipeline
implementation_surfaces:
  - "Plans/Prompt_Pipeline.md"
node_compile_hint:
  mode: requirement
  create_worknodes: false
source_lineage:
  - "Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Prompt_Pipeline-S0039"
  - "Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Prompt_Pipeline-S0040"
preserved_exact_tokens:
  - "Runtime Attempt Snapshot and Handoff Bundle"
  - "project_id"
  - "thread_id"
  - "wizard_id"
  - "resolution_id"
  - "execution_unit_context"
  - "requested/effective account identity"
  - "execution_role"
  - "operational_identity"
  - "blocked_sequence"
  - "approval_scope_key"
  - "launched_run_request_ref"
negative_constraints: []
preserved_contractrefs: []
owner_hints:
  - "Plans/Prompt_Pipeline.md"
```

### PP-052 - Wizard Interview Lineage Bridge

```yaml
plan_unit_id: PP-052
unit_type: requirement
status: accepted
owner_doc: Plans/Prompt_Pipeline.md
canonical_text: >-
  auditor_cycle_report preserves planning/governance lineage and an explicit launched-run bridge so review, preview, resume, and drill-through surfaces follow launched_run_id or launched_run_ref rather than timestamps, filenames, or ad hoc provider metadata. Legacy validation_pass_report mirrors may expose the same bridge only with compatibility_only true and cycle_report_ref.
gui_related: false
gui_classification_reason: This unit defines wizard/interview lineage fields rather than visual presentation.
split_recommended: false
depends_on:
  - "PP-051"
unblocks: []
acceptance_criteria:
  - "Wizard Interview Lineage Bridge remains addressable as a fine-grained Prompt Pipeline PlanUnit."
  - "ContractRefs, anchors, exact tokens, negative constraints, compatibility-only notes, stale/retired dispositions, owner/consumer boundaries, and source lineage from the source spans remain preserved."
  - "No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created by this PlanUnit."
validation_surfaces:
  - "python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits"
  - "python3 scripts/pm-plan-index.py validate"
risk_class: prompt_pipeline_drift
reasoning_tier: standard
context_scope: prompt_pipeline
implementation_surfaces:
  - "Plans/Prompt_Pipeline.md"
node_compile_hint:
  mode: requirement
  create_worknodes: false
source_lineage:
  - "Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Prompt_Pipeline-S0041"
preserved_exact_tokens:
  - "auditor_cycle_report"
  - "validation_pass_report"
  - "cycle_report_ref"
  - "compatibility_only"
  - "phase_plan_ref"
  - "requirements_quality_report_ref"
  - "workflow_run_id"
  - "pass_verdict"
  - "wizard_snapshot_ref"
  - "launched_run_id"
  - "launched_run_ref"
negative_constraints: []
preserved_contractrefs:
  - "ContractRef: ContractName:Plans/interview-subagent-integration.md, ContractName:Plans/Contracts_V0.md"
owner_hints:
  - "Plans/Prompt_Pipeline.md"
  - "Plans/interview-subagent-integration.md"
  - "Plans/Contracts_V0.md"
```

### PP-053 - Historical Runtime Handoff Addendum Disposition

```yaml
plan_unit_id: PP-053
unit_type: compatibility_disposition
status: accepted
owner_doc: Plans/Prompt_Pipeline.md
canonical_text: >-
  The Runtime Attempt Snapshot and Handoff Consolidation Addendum is retained as historical reconciliation context only; canonical runtime handoff fields and rules live in section 6 and this historical note may not override the owner section.
gui_related: false
gui_classification_reason: This unit preserves historical reconciliation context rather than visual presentation.
split_recommended: false
depends_on:
  - "PP-051"
  - "PP-052"
unblocks: []
acceptance_criteria:
  - "Historical Runtime Handoff Addendum Disposition remains addressable as a fine-grained Prompt Pipeline PlanUnit."
  - "ContractRefs, anchors, exact tokens, negative constraints, compatibility-only notes, stale/retired dispositions, owner/consumer boundaries, and source lineage from the source spans remain preserved."
  - "No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created by this PlanUnit."
validation_surfaces:
  - "python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits"
  - "python3 scripts/pm-plan-index.py validate"
risk_class: historical_handoff_drift
reasoning_tier: standard
context_scope: prompt_pipeline_historical_disposition
implementation_surfaces:
  - "Plans/Prompt_Pipeline.md"
node_compile_hint:
  mode: compatibility_disposition
  create_worknodes: false
source_lineage:
  - "Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Prompt_Pipeline-S0042"
preserved_exact_tokens:
  - "Runtime Attempt Snapshot and Handoff Consolidation Addendum (2026-03-09)"
  - "historical reconciliation context only"
  - "Runtime Attempt Snapshot and Handoff Bundle"
  - "Nothing in this historical note may override the owner section"
negative_constraints:
  - "The historical addendum must not override the owner section in section 6."
preserved_contractrefs: []
compatibility_only_notes:
  - "Historical runtime handoff note is retained for reconciliation context only."
owner_hints:
  - "Plans/Prompt_Pipeline.md"
```

### PP-001 - Prompt Pipeline Retired Source-Preserving Bridge

```yaml
plan_unit_id: PP-001
unit_type: compatibility_disposition
status: retired
owner_doc: Plans/Prompt_Pipeline.md
canonical_text: >-
  PP-001 is retired to migration-lineage-only compatibility disposition after Phase 2B batch 155. Prompt_Pipeline-S0001 through Prompt_Pipeline-S0020 are covered by PP-002 through PP-026, Prompt_Pipeline-S0021 through Prompt_Pipeline-S0042 are covered by PP-027 through PP-053, and Prompt_Pipeline-S0043 through Prompt_Pipeline-S0046 are generated structural/audit dispositions. PP-001 must not re-own or override implementation-facing PlanUnits and must not use source_preserving_planunit compile mode.
gui_related: false
gui_classification_reason: The live retired bridge is migration/audit metadata only; historical GUI-related bridge tokens remain preserved by span_map and coverage_map.
split_recommended: false
depends_on:
  - "PP-002"
  - "PP-003"
  - "PP-004"
  - "PP-005"
  - "PP-006"
  - "PP-007"
  - "PP-008"
  - "PP-009"
  - "PP-010"
  - "PP-011"
  - "PP-012"
  - "PP-013"
  - "PP-014"
  - "PP-015"
  - "PP-016"
  - "PP-017"
  - "PP-018"
  - "PP-019"
  - "PP-020"
  - "PP-021"
  - "PP-022"
  - "PP-023"
  - "PP-024"
  - "PP-025"
  - "PP-026"
  - "PP-027"
  - "PP-028"
  - "PP-029"
  - "PP-030"
  - "PP-031"
  - "PP-032"
  - "PP-033"
  - "PP-034"
  - "PP-035"
  - "PP-036"
  - "PP-037"
  - "PP-038"
  - "PP-039"
  - "PP-040"
  - "PP-041"
  - "PP-042"
  - "PP-043"
  - "PP-044"
  - "PP-045"
  - "PP-046"
  - "PP-047"
  - "PP-048"
  - "PP-049"
  - "PP-050"
  - "PP-051"
  - "PP-052"
  - "PP-053"
unblocks: []
acceptance_criteria:
  - "PP-001 does not override PP-002 through PP-053 for Prompt_Pipeline-S0001 through Prompt_Pipeline-S0042."
  - "Generated Owner / Consumer Map, PlanUnits heading, retired bridge, and Migration Coverage spans remain available for exact-text audit."
  - "Plans/Prompt_Pipeline.md has no residual source_preserving_planunit product coverage after this bridge retirement."
  - "No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created by this disposition."
validation_surfaces:
  - "python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits"
  - "python3 scripts/pm-plan-index.py validate"
risk_class: residual_bridge_overreach
reasoning_tier: standard
context_scope: prompt_pipeline_residual_bridge
implementation_surfaces:
  - "Plans/Prompt_Pipeline.md"
node_compile_hint:
  mode: retired_source_preserving_bridge
  create_worknodes: false
source_lineage:
  - "Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Prompt_Pipeline-S0043"
  - "Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Prompt_Pipeline-S0044"
  - "Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Prompt_Pipeline-S0045"
  - "Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Prompt_Pipeline-S0046"
preserved_exact_tokens:
  - "PP-001"
  - "Prompt Pipeline Residual Source-Preserving Bridge"
  - "Prompt Pipeline Retired Source-Preserving Bridge"
  - "Prompt Pipeline (Canonical SSOT) Source-Preserving PlanUnit"
  - "source_preserving_planunit"
  - "retired_source_preserving_bridge"
  - "source_preserving_bridge_retired"
  - "Owner / Consumer Map"
  - "PlanUnits"
  - "Migration Coverage"
  - "PP-002"
  - "PP-053"
  - "Prompt_Pipeline-S0043"
  - "Prompt_Pipeline-S0044"
  - "Prompt_Pipeline-S0045"
  - "Prompt_Pipeline-S0046"
negative_constraints:
  - "PP-001 must not be used as implementation-ready product coverage for spans now mapped to PP-002 through PP-053."
  - "PP-001 must not use source_preserving_planunit compile mode after Phase 2B batch 155."
preserved_contractrefs:
  - "ContractRef: ContractName:Plans/Plan_Document_System.md, ContractName:Plans/Bootstrap_Planning_Migration.md"
compatibility_only_notes:
  - "The retired bridge remains only as migration-lineage compatibility metadata."
stale_retired_dispositions:
  - "source_preserving_bridge_retired"
owner_hints:
  - "Plans/Prompt_Pipeline.md"
```

## Migration Coverage

Original hash: `7344aebefa758505ec0fd7b76c5a98b69768cc9253b2e8bd873cd30cdd0e8be7`.

Run-scoped proof artifacts:
- `Plans/.plan_migration/pds-20260611-001-standardize-plans/original_hashes.json`
- `Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl`
- `Plans/.plan_migration/pds-20260611-001-standardize-plans/coverage_map.jsonl`
- `Plans/.plan_migration/pds-20260611-001-standardize-plans/anchor_aliases.json`

Original spans from `Prompt_Pipeline-S0001` through `Prompt_Pipeline-S0020` are preserved in place and atomized into fine-grained PlanUnits `PP-002` through `PP-026`. Original spans from `Prompt_Pipeline-S0021` through `Prompt_Pipeline-S0042` are preserved in place and atomized into fine-grained PlanUnits `PP-027` through `PP-053`. Generated structural/audit spans `Prompt_Pipeline-S0043` through `Prompt_Pipeline-S0046` are dispositioned in Phase 2B batch 155, and `PP-001` is retired to migration-lineage-only compatibility disposition. `Plans/Prompt_Pipeline.md` has no residual source-preserving product coverage. This batch did not update Spec Lock, generated shards, evidence bundles, auto_decisions, or plan_graph, and it did not create WorkNodes, NodeSeeds, executable queues, final node manifests, production build tasks, implementation files, or source code.

## Ledger Compile Addendum - pldg-20260624-001-provider-updates

This addendum compiles accepted provider-update ledger atoms into prompt pipeline requirements. It does not create WorkNodes, NodeSeeds, executable queues, implementation files, generated governance artifacts, or production build tasks.

### PP-054 - Requested Effective Provider Route Snapshot

```yaml
plan_unit_id: PP-054
unit_type: requirement
status: accepted
owner_doc: Plans/Prompt_Pipeline.md
canonical_text: >-
  Prompt Pipeline records must snapshot requested and effective provider route identity for provider_entry_id, provider_family_id, account_profile_ref, transport_kind, auth_surface, model_id, effort intent, effective effort wire mapping, media_route_id, fallback_used, fallback_reason, support_state, verification_state, and capability gates for each provider attempt. This snapshot feeds usage, runtime artifacts, GUI run status, and audits without letting consumers infer route identity from model names alone.
gui_related: false
gui_classification_reason: Prompt/runtime identity snapshot contract rather than visual presentation.
depends_on: [CV-293, MS-113, MA-062]
unblocks: [UF-074, RAP-032, ACD-424]
acceptance_criteria:
  - Requested and effective provider/model/account/effort/media route identities are recorded per attempt.
  - Fallback and effort-clamp reasons remain queryable.
  - Usage, artifacts, and GUI consumers reuse this snapshot rather than creating independent provider identity guesses.
  - Secret material is not stored in prompt pipeline snapshots.
validation_surfaces:
  - python3 scripts/pm-plan-index.py validate
  - python3 scripts/pm-bootstrap-ledger-validate.py Plans/ledgers/v2/pldg-20260624-001-provider-updates
risk_class: provider_identity_snapshot_drift
reasoning_tier: high
context_scope: prompt_provider_route_snapshot
implementation_surfaces: [Plans/Prompt_Pipeline.md, Plans/Contracts_V0.md, Plans/Models_System.md, Plans/Multi-Account.md]
node_compile_hint: {mode: requested_effective_provider_route_snapshot, create_worknodes: false, create_nodeseeds: false}
source_lineage:
  - pldg-20260624-001-provider-updates:atom-0119
  - pldg-20260624-001-provider-updates:atom-0122
  - pldg-20260624-001-provider-updates:atom-0139
source_atom_ids: [atom-0017, atom-0052, atom-0117, atom-0118, atom-0119, atom-0122, atom-0129, atom-0131, atom-0132, atom-0139, atom-0140]
preserved_exact_tokens: ["requested", "effective", "provider_entry_id", "provider_family_id", "account_profile_ref", "transport_kind", "auth_surface", "model_id", "media_route_id", "fallback_used", "fallback_reason", "support_state", "verification_state"]
negative_constraints:
  - Do not infer provider route identity from model name alone.
  - Do not store secrets in prompt pipeline snapshots.
  - Do not let usage, GUI, or artifact consumers invent separate requested/effective route schemas.
owner_hints: [Plans/Prompt_Pipeline.md, Plans/Contracts_V0.md, Plans/Models_System.md, Plans/Multi-Account.md]
```


## Ledger Compile Addendum - pldg-20260626-001-feature-name

This addendum compiles accepted source-lineage obligations from bootstrap ledger `pldg-20260626-001-feature-name` into this existing owner/consumer doc. It creates canonical PlanUnits only; it does not create WorkNodes, NodeSeeds, executable queues, final node manifests, implementation files, generated governance artifacts, or production build tasks.

### PP-055 - Vision Bridge Prompt Output Contract

```yaml
plan_unit_id: PP-055
unit_type: requirement
status: accepted
owner_doc: Plans/Prompt_Pipeline.md
canonical_text: The vision bridge uses a structured prompt/output contract. Image source precedence is explicit
  current-turn attachment or selected artifact, then FileSafe-allowed project file, then explicit clipboard image,
  then recent OS screenshot picker. The vision route receives the image plus a bounded task and returns description/answer,
  uncertainty, notable text/OCR when available, limitations, and safety/redaction notes. The non-vision model receives
  the structured derived result and source refs, not raw image bytes. If bridge execution is denied, unavailable,
  inconclusive, or fails validation, PM returns a structured unavailable result; the instruction remains never guess
  image contents.
gui_related: true
gui_classification_reason: The structured image-derived output is user-visible and governs screenshot/image context
  passed into chat.
depends_on:
- CV-296
- F2-192
- PS-121
unblocks:
- RAP-035
- ACD-425
acceptance_criteria:
- Live PlanUnit exists in the adjudicated owner doc with reciprocal ledger source_lineage.
- Exact source tokens, negative constraints, owner hints, and user corrections are preserved in PlanUnit metadata.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, implementation files, or production build tasks
  are created by this compile.
validation_surfaces:
- python3 scripts/pm-bootstrap-ledger-validate.py Plans/ledgers/v2/pldg-20260626-001-feature-name
- python3 scripts/pm-plan-index.py validate
- git diff --check
risk_class: vision_prompt_injection_or_guessing
reasoning_tier: high
context_scope: vision_bridge_prompt_output
implementation_surfaces:
- Plans/Prompt_Pipeline.md
- future bridge prompt/result serializer
node_compile_hint:
  mode: vision_bridge_prompt_output
  create_worknodes: false
  create_nodeseeds: false
source_lineage:
- pldg-20260626-001-feature-name:atom-0071
- pldg-20260626-001-feature-name:atom-0075
- pldg-20260626-001-feature-name:atom-0081
- pldg-20260626-001-feature-name:atom-0082
- pldg-20260626-001-feature-name:atom-0085
- pldg-20260626-001-feature-name:atom-0086
- external:github.com/alfaoz/opencode-see-image@cde1615f6dfc9039c58da6813112ee53391b5b49
- Plans/Runtime_Artifacts_Panel.md
- Plans/Prompt_Pipeline.md
- chat:vision-bridge-defaults-answer
- chat:vision-pressure-test-request
- chat:vision-pressure-test-defaults-answer
- Plans/FinalGUISpec.md
- Plans/FileSafe.md
source_atom_ids:
- atom-0071
- atom-0075
- atom-0081
- atom-0082
- atom-0085
- atom-0086
decision_refs:
- dec-0014
- dec-0015
- dec-0016
- dec-0017
preserved_exact_tokens:
- see_image
- experimental.chat.system.transform
- OpenCode SQLite
- part
- screenshotSearchDirs
- SEE_IMAGE_MODEL
- SEE_IMAGE_PROVIDER
- minimax-m3
- opencode-go
- mimo-v2.5-free
- never guess image contents
- chat attachments
- runtime artifacts
- screenshots
- project files
- clipboard
- recent OS screenshots
- FileSafe
- 3. not deferred
- permission denied
- no eligible vision route
- provider unavailable
- auth expired
- timeout
- unsupported/corrupt/too-large image
- missing file/artifact
- empty clipboard
- ambiguous recent screenshot
- redaction blocked
- 'yes'
- current-turn attachment
- selected artifact
- project file allowed by FileSafe
- clipboard image
- recent OS screenshot picker
- ambiguous
- hidden Desktop/Downloads scraping
- sensitivity/redaction policy
- disclosure destination
- explicit user override
- redaction/omission details
- derived artifact manifest
- secrets
- structured prompt/output contract
- bounded question/task
- uncertainty
- notable text/OCR
- limitations
- safety/redaction notes
- source refs
- not raw image bytes
negative_constraints:
- Do not copy OpenCode's SQLite/session model as PM's source of truth.
- Do not hardcode `opencode-go`, `minimax-m3`, or `mimo-v2.5-free` as PM defaults without an explicit provider-routing
  decision.
- Do not carry over OpenCode-specific prompt injection unchanged.
- Do not defer clipboard or recent OS screenshot support out of MVP.
- Do not scrape arbitrary Desktop/Downloads/recent screenshot locations as a hidden default without PM-owned permission
  and ingestion rules.
- Do not bypass FileSafe or artifact access policy when resolving project images.
- Do not inline raw screenshots into prompts when artifact refs plus bounded summaries are required.
- Do not let the non-vision model infer or guess image contents after bridge failure.
- Do not serialize failed, revoked, blocked, expired, or omitted image artifacts as successful prompt content.
- Do not show a generic failure when PM can provide a concrete reason code and next action.
- Do not scrape arbitrary Desktop/Downloads/recent screenshot locations as a hidden default.
- Do not choose among ambiguous recent screenshots without user-visible selection or clear recency evidence.
- Do not bypass FileSafe or artifact permissions for project-file image sources.
- Do not silently send sensitive screenshots or images to another provider without policy evaluation.
- Do not claim redaction happened without recording redaction/omission metadata.
- Do not expose secret material in manifests, receipts, GUI previews, or exports.
- Do not pass raw image bytes into non-vision model context when artifact refs plus bounded derived text are the
  contract.
- Do not omit uncertainty or limitations from bridge output when the image is ambiguous or low-confidence.
- Do not let image text/OCR become hidden, unsourced prompt material.
owner_hints:
- Plans/Tools.md
- Plans/Prompt_Pipeline.md
- Plans/Models_System.md
- Plans/Provider_OpenCode.md
- Plans/Runtime_Artifacts_Panel.md
- Plans/Project_Output_Artifacts.md
- Plans/FileSafe.md
- Plans/assistant-chat-design.md
- Plans/FinalGUISpec.md
- Plans/UI_Command_Catalog.md
- Plans/Permissions_System.md
- Plans/Contracts_V0.md
```

### PP-056 - Teacher PM Knowledge Source Resolution

```yaml
plan_unit_id: PP-056
unit_type: requirement
status: accepted
owner_doc: Plans/Prompt_Pipeline.md
canonical_text: 'Teacher answers draw from a live PM knowledge substrate in this order: current surface context,
  canonical Plans, command catalog, GUI surface registry, model/capability/provider state, permission/policy state,
  runtime artifacts/history, Help/Glossary entries, taught memory, then safe fallback or handoff. Teacher must cite
  source groups or show missing coverage, expose source confidence/currentness states, avoid guessing about PM capabilities,
  and choose handoff when the user asks beyond teaching/help scope, external research beyond sources, build work,
  audit/repair, direct execution, or specialty tooling.'
gui_related: false
gui_classification_reason: Source ordering, confidence, and no-guessing are prompt/source behavior rather than visual
  presentation; GUI disclosure is owned elsewhere.
depends_on:
- P-055
unblocks:
- ACD-426
- ATS-014
acceptance_criteria:
- Live PlanUnit exists in the adjudicated owner doc with reciprocal ledger source_lineage.
- Exact source tokens, negative constraints, owner hints, and user corrections are preserved in PlanUnit metadata.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, implementation files, or production build tasks
  are created by this compile.
validation_surfaces:
- python3 scripts/pm-bootstrap-ledger-validate.py Plans/ledgers/v2/pldg-20260626-001-feature-name
- python3 scripts/pm-plan-index.py validate
- git diff --check
risk_class: teacher_pm_knowledge_guessing
reasoning_tier: high
context_scope: teacher_pm_knowledge_pipeline
implementation_surfaces:
- Plans/Prompt_Pipeline.md
- future Teacher source resolver
node_compile_hint:
  mode: teacher_pm_knowledge_pipeline
  create_worknodes: false
  create_nodeseeds: false
source_lineage:
- pldg-20260626-001-feature-name:atom-0095
- pldg-20260626-001-feature-name:atom-0105
- pldg-20260626-001-feature-name:atom-0109
- pldg-20260626-001-feature-name:atom-0115
- pldg-20260626-001-feature-name:atom-0124
- pldg-20260626-001-feature-name:atom-0128
- pldg-20260626-001-feature-name:atom-0137
- pldg-20260626-001-feature-name:atom-0138
- pldg-20260626-001-feature-name:atom-0149
- chat:teacher-feature-initial-framing
- Plans/Personas.md#P-040---Teacher-Core-Persona
- Plans/Media_Generation_and_Capabilities.md
- Plans/UI_Command_Catalog.md
- chat:teach-visual-specificity-challenge
- Plans/assistant-chat-design.md#6-Teach
- chat:teach-help-glossary-rest-request
- Plans/Glossary.md
- Plans/assistant-chat-design.md
- chat:teach-gap-fill-correction
- q-0028
- chat:teach-bundle-accepted-pmconcept-reference
- chat:work-through-teach-gaps
- Plans/Personas.md#11.8-teacher
- Plans/assistant-chat-design.md#6-teach
- Plans/Runtime_Artifacts_Panel.md#runtime-artifact-identity-index-and-preview-rules
- Plans/Personas.md#P-040-teacher-core-persona
source_atom_ids:
- atom-0095
- atom-0105
- atom-0109
- atom-0115
- atom-0124
- atom-0128
- atom-0137
- atom-0138
- atom-0149
decision_refs:
- dec-0018
- dec-0019
- dec-0020
- dec-0021
- dec-0022
- dec-0023
- dec-0024
correction_refs:
- corr-0002
- corr-0003
preserved_exact_tokens:
- know everything in PM
- how it works
- all the capabilities of PM
- how the user interacts with it
- PM documentation coverage
- capabilities.get
- command catalog
- Where it will get all its info from
- Sources used
- PM context
- capability snapshots
- settings registry
- missing coverage
- current surface/selection context
- settings
- command/route registries
- capability resolver
- Plans/PlanUnits
- taught memories
- current surface/control route
- Teach-specific help entry
- Glossary canonical definition
- owner Plans/PlanUnits
- command/settings/capability records
- scoped taught memory
- missing-help coverage callout
- current surface/control
- current thread/project
- help/glossary entry
- provider/model/account state
- runtime artifact
- stale
- missing
- disabled
- permission-required
- Teacher handoff
- missing PM coverage
- non-teaching assistance
- implementation work
- high-capability reasoning
- external search
- another persona/tool path
- required help entry
- owner source
- capability record
- route/control record
- permission
- current surface/control context
- Glossary/help entries
- UI command/route catalog
- capability/provider/account snapshots
- available
- capability-unavailable
- conflict-detected
- could not verify
- PM knowledge pressure test
- PM concepts
- workflows
- models
- capabilities
- permissions
- history
- artifacts
- Personas
- skills/plugins
- Orchestrator behavior
- Teach memory
- avoid guessing
- handoff
negative_constraints:
- Do not hardcode a stale PM encyclopedia inside the Teacher prompt.
- Do not let Teacher invent unsupported capabilities or GUI steps when the capability resolver, command catalog,
  or Plans do not support them.
- Do not search other projects or external sources unless the user explicitly requests external navigation/import.
- Do not let Teacher present PM facts as unsourced hidden prompt lore.
- Do not hide stale, missing, disabled, or capability-unavailable source states.
- Do not cite unavailable PlanUnits before a future compile creates them.
- Do not let Teacher invent PM behavior when live PM sources are missing.
- Do not search external sources or other projects by default.
- Do not use taught memory outside its approved scope.
- Do not let Teacher silently skip missing help entries.
- Do not search/read external or cross-project sources unless the user explicitly approves that route.
- Do not use taught memory outside its scope.
- Do not collapse stale, missing, disabled, and permission-required states into generic uncertainty.
- Do not let Teacher guess through missing PM coverage.
- Do not silently change persona/model/tool path without disclosure.
- Do not treat handoff as failure when it is the correct safer route.
- Do not let Teacher invent PM behavior when owner sources are missing.
- Do not collapse stale, missing, disabled, permission-required, and capability-unavailable into one vague warning.
- Do not present unverified PM behavior as fact.
- Do not cite unavailable future PlanUnits before compile creates them.
- Do not certify Teacher on a small happy-path chat only.
- Do not let Teacher answer capability or settings questions without live/source-backed state.
- Do not treat missing coverage as a passing answer unless it is visibly disclosed and routed.
owner_hints:
- Plans/Prompt_Pipeline.md
- Plans/assistant-chat-design.md
- Plans/Tools.md
- Plans/Media_Generation_and_Capabilities.md
- Plans/UI_Command_Catalog.md
- Plans/FinalGUISpec.md
- Plans/Glossary.md
- Plans/Personas.md
- Plans/storage-plan.md
- Plans/Models_System.md
- Plans/Runtime_Artifacts_Panel.md
- Plans/Permissions_System.md
- Plans/Automated_Testing_System.md
```

## Ledger Compile Addendum - pldg-20260627-001-feature-intake

This addendum compiles source-lineage obligations from bootstrap ledger `pldg-20260627-001-feature-intake` into Prompt Pipeline owner canon. It does not create WorkNodes, NodeSeeds, executable queues, GoalRuns, implementation files, generated governance artifacts, or production build tasks.

### PP-057 - Shared DRY Instruction Bundle Conformance

```yaml
plan_unit_id: PP-057
unit_type: requirement
status: accepted
owner_doc: Plans/Prompt_Pipeline.md
canonical_text: >-
  Assistant, Interview, Orchestrator, delegated child-run, document-builder, and code-generation prompt routes consume
  one shared Instruction Bundle route for the DRY Method. Prompt builders must not carry prompt-builder-local DRY prose,
  shadow instruction sources, or route-specific DRY behavior. The Instruction Bundle records
  `instruction_bundle_ref`, `rules_application_sha256`, `rules_project_sha256`, `dry_method_effective_state`, and
  `dry_method_reason` as run-start minimum fields when the DRY Method applies, degrades, is disabled, blocks, or
  caveats a route.
gui_related: false
gui_classification_reason: Defines prompt assembly and shared route conformance rather than visual presentation.
depends_on: [ARC-036, CV-299]
unblocks: [OSI-430, ISI-019, ATS-018]
acceptance_criteria:
  - Every listed prompt route consumes the same DRY Method Instruction Bundle path.
  - Local prompt templates do not duplicate or fork DRY Method prose.
  - Run-start minimum fields are present when DRY has a material route effect.
validation_surfaces:
  - python3 scripts/pm-plan-index.py validate
  - DRY Method prompt route conformance fixtures
risk_class: dry_method_prompt_route_drift
reasoning_tier: high
context_scope: dry_method_prompt_pipeline
implementation_surfaces:
  - Plans/Prompt_Pipeline.md
  - future prompt assembly
node_compile_hint:
  mode: dry_method_shared_instruction_bundle
  create_worknodes: false
  create_nodeseeds: false
source_lineage:
  - Plans/ledgers/v2/pldg-20260627-001-feature-intake/state/dry_method_compile_readiness_matrix.json:dry-prompt-route-static-conformance
  - Plans/ledgers/v2/pldg-20260627-001-feature-intake/state/dry_method_defaults_matrix.json:dry-val-003
  - Plans/ledgers/v2/pldg-20260627-001-feature-intake/state/dry_method_defaults_matrix.json:dry-val-004
  - Plans/ledgers/v2/pldg-20260627-001-feature-intake/records/design_atoms.jsonl:atom-0076
  - Plans/ledgers/v2/pldg-20260627-001-feature-intake/records/design_atoms.jsonl:atom-0083
source_atom_ids: [atom-0076, atom-0083]
preserved_exact_tokens:
  - "Assistant"
  - "Interview"
  - "Orchestrator"
  - "delegated child-run"
  - "document-builder"
  - "code-generation"
  - "Instruction Bundle"
  - "instruction_bundle_ref"
  - "rules_application_sha256"
  - "rules_project_sha256"
negative_constraints:
  - Do not create shadow instruction sources.
  - Do not duplicate DRY prose into prompt builders.
  - Do not let route-local prompt templates override the shared DRY owner.
owner_hints:
  - Plans/Prompt_Pipeline.md
  - Plans/agent-rules-context.md
  - Plans/orchestrator-subagent-integration.md
  - Plans/interview-subagent-integration.md
```

## Ledger Compile Addendum - pldg-20260629-001-feature-name

This addendum compiles the Free Models prompt-route consumer contract. It does not create WorkNodes, NodeSeeds, executable queues, generated governance artifacts, or implementation files.

### PP-058 - Free Models Requested Effective Route Snapshot Handoff

```yaml
plan_unit_id: PP-058
unit_type: requirement
status: accepted
owner_doc: Plans/Prompt_Pipeline.md
canonical_text: >-
  Prompt Pipeline consumes a requested/effective route snapshot for Free Models that includes the user-facing wrapper, underlying provider/model/account/source identity, section policy source, fallback reason, cost/usage refs, capability/support state, and source snapshot refs before provider handoff. Prompt assembly must not infer route identity from friendly model names alone and must preserve section/surface/role override provenance.
gui_related: false
gui_classification_reason: Defines prompt assembly and provider handoff metadata, not GUI presentation.
depends_on: []
unblocks: []
acceptance_criteria:
  - Prompt handoff snapshots include requested and effective provider/model/account/source identity.
  - Section/surface/role override source is carried through prompt assembly.
  - Friendly names do not replace canonical provider/model/account/source ids.
  - Fallback reason and cost/usage refs are available for Usage and Runtime Artifacts projection.
validation_surfaces:
  - python3 scripts/pm-plan-index.py validate
  - Free Models requested/effective route snapshot fixtures
  - Prompt handoff provenance fixtures
risk_class: prompt_route_identity_drift
reasoning_tier: high
context_scope: free_models_prompt_pipeline_handoff
implementation_surfaces:
  - Plans/Prompt_Pipeline.md
  - Plans/Models_System.md
  - Plans/usage-feature.md
  - Plans/Executor_Protocol.md
  - Plans/Runtime_Artifacts_Panel.md
node_compile_hint:
  mode: free_models_prompt_route_snapshot_planunit
  create_worknodes: false
  create_nodeseeds: false
source_lineage:
  - Plans/ledgers/v2/pldg-20260629-001-feature-name/records/design_atoms.jsonl
source_atom_ids: [atom-0012, atom-0026, atom-0113, atom-0117, atom-0118, atom-0122, atom-0126, atom-0234, atom-0238, atom-0242, atom-0246, atom-0276, atom-0281, atom-0282, atom-0297, atom-0298]
preserved_exact_tokens:
  - "requested/effective"
  - "section/surface/role"
  - "fallback reason"
  - "provider/model/account/source"
  - "source snapshot"
  - "Provider_OpenCode adjacent/reference-only"
negative_constraints:
  - Do not infer provider/model/account/source identity from model display names alone.
  - Do not hide requested/effective model differences when section settings override the global top-10.
  - Do not compile Free Models ownership into Provider_OpenCode by default.
owner_hints:
  - Plans/Prompt_Pipeline.md
  - Plans/Models_System.md
  - Plans/usage-feature.md
  - Plans/Executor_Protocol.md
```

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
- Plans/ledgers/v2/pldg-20260703-001-feature-intake/source_shards/external_repo_import_20260703/02_LEDGER_READY_ATOMS.jsonl:extrepo-20260703-0022/P0-HISTORY-ADMISSION-SANITIZATION@line=2
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
- Plans/ledgers/v2/pldg-20260703-001-feature-intake/source_shards/external_repo_import_20260703/02_LEDGER_READY_ATOMS.jsonl:extrepo-20260703-0037/P0-CONTEXT-EPOCH-BASELINE@line=1
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
- Plans/ledgers/v2/pldg-20260703-001-feature-intake/source_shards/external_repo_import_20260703/02_LEDGER_READY_ATOMS.jsonl:extrepo-20260703-0038/P0-PROMPT-CACHE-POLICY@line=2
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
- Plans/ledgers/v2/pldg-20260703-001-feature-intake/source_shards/external_repo_import_20260703/02_LEDGER_READY_ATOMS.jsonl:extrepo-20260703-0040/P0-VOLATILE-CONTEXT-QUARANTINE@line=4
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
- Plans/ledgers/v2/pldg-20260703-001-feature-intake/source_shards/external_repo_import_20260703/02_LEDGER_READY_ATOMS.jsonl:extrepo-20260703-0045/P1-COMPACTION-CACHE-EFFECT@line=9
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
- Plans/ledgers/v2/pldg-20260703-001-feature-intake/source_shards/external_repo_import_20260703/02_LEDGER_READY_ATOMS.jsonl:extrepo-20260703-0046/P1-PROVIDER-CAPABILITY-EPOCH-CACHE@line=10
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
- Plans/ledgers/v2/pldg-20260703-001-feature-intake/source_shards/external_repo_import_20260703/02_LEDGER_READY_ATOMS.jsonl:extrepo-20260703-0047/P1-MODEL-SWITCH-REPLAY-SANITIZER@line=11
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
- Plans/ledgers/v2/pldg-20260703-001-feature-intake/source_shards/external_repo_import_20260703/02_LEDGER_READY_ATOMS.jsonl:extrepo-20260703-0048/P1-LOCAL-LLM-CONTEXT-CAPS@line=12
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
- Plans/ledgers/v2/pldg-20260703-001-feature-intake/source_shards/external_repo_import_20260703/02_LEDGER_READY_ATOMS.jsonl:extrepo-20260703-0067/P1-PROMPT-CACHE-STABILITY-LINTER@line=13
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
- Plans/ledgers/v2/pldg-20260703-001-feature-intake/source_shards/external_repo_import_20260703/02_LEDGER_READY_ATOMS.jsonl:extrepo-20260703-0080/P1-INSTRUCTION-SOURCE-INTEGRITY-EPOCH@line=7
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
- Context_Management.md
- Skill_System.md
- Goal_Runtime_System.md
- Models_System.md
- Contracts_V0.md
owner_hints:
- Context_Management.md
- Skill_System.md
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
- Plans/ledgers/v2/pldg-20260703-001-feature-intake/source_shards/external_repo_import_20260703/02_LEDGER_READY_ATOMS.jsonl:extrepo-20260703-0093/P0-CONTEXT-OBJECT-BUDGET@line=6
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
- Plans/ledgers/v2/pldg-20260703-001-feature-intake/source_shards/external_repo_import_20260703/02_LEDGER_READY_ATOMS.jsonl:extrepo-20260703-0095/P1-INSTRUCTION-IMPORT-GRAPH@line=8
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
- Plans/ledgers/v2/pldg-20260703-001-feature-intake/source_shards/external_repo_import_20260703/02_LEDGER_READY_ATOMS.jsonl:extrepo-20260703-0100/context_epoch@line=2
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
