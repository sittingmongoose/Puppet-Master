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

### 1.2A Structured attachment normalization for browser element context

Before final conversation payload emission, the prompt pipeline MUST normalize structured user attachments created by the chat/composer surface.

For `browser_element_context` attachments:
- normalization occurs after context compilation and before final conversation serialization
- the structured attachment is serialized before the user's freeform message text
- bounded fields are serialized first: `tagName`, `id`, `className`, `textContent`, `role`, `rect`, `parentPath`
- optional truncated HTML is included only if still within attachment budget
- attachment metadata MUST record when truncation occurred

This keeps browser-element context deterministic across chat, browser preview, and prompt assembly implementations.

<a id="ASSEMBLY-PIPELINE"></a>

The prompt MUST be assembled in this stage order:

1. **Resolve run config and surface context**: finalize run envelope (tier/mode/platform/model), identify the active surface, and load the permissions snapshot.
2. **Resolve Persona selection inputs**: detect Persona mode (`manual` / `auto` / `hybrid`), inspect natural-language Persona requests, and compute the requested Persona when present.
3. **Resolve effective Persona and runtime state**: resolve Persona files, aliases, requested/effective platform/model/variant/runtime controls, and provider capability filtering.
4. **Resolve skills**: resolve `default_skill_refs` and compute skill bundle inputs.
5. **Compile context**: invoke the context compiler to produce compiled context artifacts (role-specific) and an "Injected Context" breakdown.
6. **Assemble Instruction Bundle**: combine rules + Persona instructions + compiled context references + effective runtime metadata needed for observability.
7. **Apply plugin prompt transforms** (optional): allow plugins to inject context or replace the prompt (per `Plans/Plugins_System.md`).
8. **Attach tool schemas**: include the canonical tool registry definitions and any custom tools.
9. **Finalize**: emit the final prompt payload and effective-resolution metadata to the provider runner and event/history surfaces.

Rule: Stages 1–9 MUST be deterministic given the same inputs and filesystem state.

Additional orchestration rules:
- Mode-specific context overlays are applied during **Stage 5 / Compile context**, before attachments and the Injected Context breakdown are emitted. `ask` and `plan` use the `read_only` overlay; `plan` additionally applies `plan_output_scaffold_v1`; `regular` and `yolo` use `full_execution`. Child/subagent/rotated runs may narrow an inherited overlay, but they MUST NOT widen a read-only overlay into `full_execution`.
- When the active surface is **Orchestrator** or a delegated child/subagent run, the Instruction Bundle MUST carry the canonical orchestration flow contract `assess → understand → decompose → act → verify`. Work that resolves to one or two atomic steps may proceed directly from understanding to action, but work that requires three or more atomic steps MUST emit an explicit plan before action. This prompt-level orchestration flow MUST NOT create new execution tiers beyond Phase / Task / Subtask / Iteration.

ContractRef: ContractName:Plans/Plugins_System.md, PolicyRule:Decision_Policy.md§3

### 1.3 Instruction Bundle structure

<a id="INSTRUCTION-BUNDLE"></a>

The compiled prompt MUST include an Instruction Bundle section that contains (at minimum):
- Active mode and tier
- Active Persona(s) identifiers
- Rules context
- Injected Context breakdown (paths + byte counts; truncation reason)

The canonical event-level contract for instruction bundle assembly is defined in `Plans/Contracts_V0.md`.

ContractRef: ContractName:Plans/Contracts_V0.md#InstructionBundleAssembly, ContractName:Plans/FinalGUISpec.md

---

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

This addendum expands the prompt pipeline to mirror the OpenCode-style role-resolution mechanics while preserving Puppet Master architecture.

### 6.1 Expanded pre-prompt resolution stages

The following stages refine the canonical ordering in §1.2 by expanding stages 1–3 into explicit Persona/runtime resolution steps before final prompt payload emission.

ContractRef: ContractName:Plans/Prompt_Pipeline.md#ASSEMBLY-PIPELINE, ContractName:Plans/Prompt_Pipeline.md#PROVIDER-CAPABILITY-FILTERING

Before final prompt payload emission, the runtime MUST resolve:

1. **Surface context**
   Chat / Interview / Requirements Builder / Orchestrator / Multi-Pass / child subagent.
2. **Task context**
   Examples: discussion, clarification, planning, research, drafting, review, code execution, debugging, production-readiness validation.
3. **Persona selection mode**
   manual / auto / hybrid.
4. **Requested Persona**
   From explicit UI selection, structured config, plan/tier assignment, natural-language invocation, or none.
5. **Effective Persona**
   After resolver, alias normalization, fallback, and provider availability checks.
6. **Requested/effective runtime controls**
   platform/model/variant/temperature/top_p/reasoning_effort/talkativeness.
7. **Provider capability filtering**
   Remove or downgrade unsupported Persona controls; record reasons.
8. **Instruction assembly**
   Combine rules + Persona instructions + compiled context + tool schemas.
9. **Final runtime payload emission**
   To provider runner/CLI/server bridge.

<a id="PERSONA-SELECTION-SOURCE-ENUM"></a>
### 6.2 Selection-source enumeration

`persona_selection_source` MUST be one of:
- `manual_ui`
- `auto_surface_resolver`
- `plan_or_tier_default`
- `config_default`
- `user_natural_language`
- `fallback`

The runtime MUST also store a human-readable `selection_reason`.

### 6.2.1 Canonical requested-Persona precedence

When multiple Persona-selection inputs exist, the runtime MUST compute `requested_persona` using this precedence (highest wins):

1. **Explicit run-envelope/manual surface override**
   A structured run input, manual picker choice, or surface action targeted at the current execution.
2. **Active scoped natural-language override**
   A previously resolved natural-language override whose scope still applies to the current execution. If multiple active scoped overrides apply, the most specific owner wins:
   - `subagent`
   - `task`
   - `run`
   - `turn`
   - `session`
3. **Surface-specific explicit mapping**
   A configured Interview stage override, Builder stage/pass override, Orchestrator tier override, or equivalent mapped Persona source.
4. **Surface auto resolver candidate**
   The Persona proposed by the active surface resolver based on stage/tier/task/repo context.
5. **Config default**
   A project/global default Persona configured for the surface.
6. **Canonical fallback**
   The fallback Persona defined by the active surface contract. If a surface contract does not define one, use `general-purpose`.

`persona_selection_source` MUST reflect the winning source category, not every candidate that was considered.

### 6.2.2 Scoped override lifecycle contract

Natural-language Persona overrides MUST persist enough state to be replayable and auditable.

Required lifecycle rules:
- `turn` scope expires after the next eligible execution on the same thread/surface.
- `session` scope remains active until cleared or replaced within the same thread/session.
- `run` scope applies only to the current run tree.
- `task` scope applies only to the owning task/tier item.
- `subagent` scope applies only to the targeted delegated child run.

If a scoped override no longer has a valid owner object, it MUST be discarded before resolution and recorded as expired rather than silently reused.

### 6.3 Natural-language Persona invocation in prompt assembly
### 6.3.1 Invocation guardrails and ambiguity handling

Natural-language Persona invocation MUST be conservative enough to avoid false positives.

Detection scope:
- Inspect only the latest user-authored freeform message content for the current surface.
- Ignore quoted prior messages, pasted logs, code blocks, tool output, and file excerpts.
- Do not resolve a Persona override from third-person discussion such as "the explorer persona is useful here" unless the utterance also contains an imperative/request pattern.

Required trigger patterns:
- imperative/request forms such as `use`, `switch to`, `be`, `answer as`, `act as`, or `for this use`
- the trigger must appear in the same clause/span as the matched Persona candidate

Match order (highest confidence first):
1. exact canonical Persona ID
2. exact display name
3. exact alias
4. normalized token match (case/punctuation/kebab normalization)
5. fuzzy match only when there is exactly one clear winner after normalization

Ambiguity rules:
- If two or more candidates remain at the same confidence tier, the runtime MUST ask for clarification and MUST NOT apply an override speculatively.
- If no candidate survives the guardrails, continue without override and do not emit `persona_selection_source = user_natural_language`.

Migration/alias rule:
- Legacy input such as `explore` MAY resolve as an alias to `explorer`, but persistence and UI display MUST always normalize to `explorer`.

Before Persona auto resolution completes, the pipeline must inspect the current user instruction/message for natural-language Persona requests.

Examples that SHOULD be recognized:
- `Use Explorer`
- `Switch to Collaborator`
- `Be a Rust engineer`
- `Answer as a technical writer`
- `Use the security auditor for this`

Resolution behavior:
- If a clear Persona match exists, create a `requested_persona` override before auto selection.
- Determine default override scope from phrasing:
  - one-turn phrasing -> turn scope,
  - persistent phrasing -> session scope.
- If no reliable match exists, proceed without override or trigger clarification according to surface policy.

### 6.4 Auto Persona resolution requirements

Auto mode MUST be deterministic and surface-aware.

Examples of required auto behavior:
- Rust repo + code-edit task -> `rust-engineer`
- planning/discussion mode -> `collaborator`
- repo discovery/read-only investigation -> `explorer`
- external-source research/synthesis -> `researcher` or `deep-researcher` depending on depth
- documentation drafting -> `technical-writer`
- security review -> `security-auditor`
- implementation-focused security work -> `security-engineer`
- deployment/IaC implementation -> `devops-engineer`
- production readiness validation -> `sre`

Rule: auto mode MUST always expose the selected effective Persona and reason. It MUST NEVER emit an opaque `Auto` state with no resolved output.

### 6.5 Effective resolution record

<a id="EFFECTIVE-RESOLUTION-RECORD"></a>

Every prompt assembly run MUST produce an effective resolution record containing at least:

- `requested_persona`
- `effective_persona`
- `persona_selection_source`
- `selection_reason`
- `persona_override_scope` (`none | turn | session | run | task | subagent`)
- `persona_override_owner_id` (`thread_id | run_id | tier_id | subagent_run_id | null` depending on scope)
- `requested_platform`
- `effective_platform`
- `requested_model`
- `effective_model`
- `requested_variant`
- `effective_variant`
- `effective_temperature`
- `effective_top_p`
- `effective_reasoning_effort`
- `effective_talkativeness`
- `applied_persona_controls[]`
- `skipped_persona_controls[]`

`applied_persona_controls[]` element schema:
```json
{
  "control": "temperature",
  "requested_value": 0.2,
  "effective_value": 0.2,
  "source": "persona",
  "reason": "supported by selected provider/model"
}
```

`skipped_persona_controls[]` element schema:
```json
{
  "control": "reasoning_effort",
  "requested_value": "high",
  "effective_value": null,
  "provider": "cursor",
  "model": "anthropic/claude-sonnet-4",
  "reason": "selected transport/model does not expose effort control",
  "fallback_behavior": "omit_control"
}
```

Rules:
- `selection_reason` MUST be a one-line human-readable explanation suitable for direct UI display.
- `applied_persona_controls[]` and `skipped_persona_controls[]` MUST be sufficient to power GUI/runtime disclosure without requiring undocumented side fields.
- If a requested control is clamped rather than fully honored, record it in `applied_persona_controls[]` with both requested and effective values.
- If no scoped override is active, `persona_override_scope = none` and `persona_override_owner_id = null`.

This record is the canonical cross-system effective runtime record referenced by `Plans/Personas.md` and `Plans/Models_System.md`. It MUST be available to event/history/UI consumers and to any payload that claims to expose requested/effective Persona/runtime state.

<a id="PROVIDER-CAPABILITY-FILTERING"></a>
### 6.6 Provider capability filtering stage

Persona controls must pass through provider capability filtering before prompt/model execution.

Processing rule:
1. collect requested Persona controls,
2. compare them to the provider capability matrix,
3. apply supported controls,
4. downgrade or skip partially supported/unsupported controls,
5. record every skipped control with a reason,
6. expose the resulting effective state to the UI.

Rule: `talkativeness` is a Persona instruction-layer control, not a provider runtime knob. It does not pass through provider runtime capability filtering; instead, it is applied during Instruction Bundle assembly whenever a Persona is active. `model_default` means no additional verbosity directive is injected.

ContractRef: ContractName:Plans/Models_System.md#PERSONA-CAPABILITY-MATRIX, ContractName:Plans/Prompt_Pipeline.md#EFFECTIVE-RESOLUTION-RECORD

### 6.7 OpenCode baseline mapping

This pipeline deliberately mirrors the mechanics observed in OpenCode:
- select runtime role by name,
- resolve role prompt and model before the model call,
- merge runtime options/variant,
- merge role and session permissions for tool gating.

Puppet Master implements the same effective behavior through Persona resolution rather than OpenCode `agent` terminology.

### 6.8 UI transparency requirement

Prompt assembly must emit enough state for UI surfaces to display:
- effective Persona,
- effective platform/model,
- effective talkativeness when not `model_default`,
- selection reason,
- applied controls,
- skipped controls,
- and current scope of any natural-language Persona override.

### 6.9 Acceptance criteria addendum

- Prompt assembly must include Persona/runtime resolution before final provider invocation.
- Natural-language Persona invocation must be parsed before auto selection finalization.
- Unsupported Persona controls must be skipped explicitly and surfaced.
- Persona `talkativeness` must be applied through instruction assembly even when the provider does not expose sampling controls such as `temperature` or `top_p`.
- Effective resolution record must be available for thread history, activity panes, and run inspection UIs.
