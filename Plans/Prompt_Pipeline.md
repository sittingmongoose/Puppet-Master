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

1. **Resolve run config**: finalize run envelope (tier/mode/model), load permissions snapshot.
2. **Resolve Personas**: resolve Persona files and compute Persona instruction blocks.
3. **Resolve skills**: resolve `default_skill_refs` and compute skill bundle inputs.
4. **Compile context**: invoke the context compiler to produce compiled context artifacts (role-specific) and an "Injected Context" breakdown.
5. **Assemble Instruction Bundle**: combine rules + Persona instructions + compiled context references.
6. **Apply plugin prompt transforms** (optional): allow plugins to inject context or replace the prompt (per `Plans/Plugins_System.md`).
7. **Attach tool schemas**: include the canonical tool registry definitions and any custom tools.
8. **Finalize**: emit the final prompt payload to the provider runner.

Rule: Stages 1–8 MUST be deterministic given the same inputs and filesystem state.

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
   platform/model/variant/temperature/top_p/reasoning_effort.
7. **Provider capability filtering**
   Remove or downgrade unsupported Persona controls; record reasons.
8. **Instruction assembly**
   Combine rules + Persona instructions + compiled context + tool schemas.
9. **Final runtime payload emission**
   To provider runner/CLI/server bridge.

### 6.2 Selection-source enumeration

`persona_selection_source` MUST be one of:
- `manual_ui`
- `auto_surface_resolver`
- `plan_or_tier_default`
- `config_default`
- `user_natural_language`
- `fallback`

The runtime MUST also store a human-readable `selection_reason`.

### 6.3 Natural-language Persona invocation in prompt assembly

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

Every prompt assembly run MUST produce an effective resolution record containing at least:

- `requested_persona`
- `effective_persona`
- `persona_selection_source`
- `selection_reason`
- `requested_platform`
- `effective_platform`
- `requested_model`
- `effective_model`
- `requested_variant`
- `effective_variant`
- `effective_temperature`
- `effective_top_p`
- `effective_reasoning_effort`
- `applied_persona_controls[]`
- `skipped_persona_controls[]`

This record is part of prompt assembly observability and must be available to event/history/UI consumers.

### 6.6 Provider capability filtering stage

Persona controls must pass through provider capability filtering before prompt/model execution.

Processing rule:
1. collect requested Persona controls,
2. compare them to the provider capability matrix,
3. apply supported controls,
4. downgrade or skip partially supported/unsupported controls,
5. record every skipped control with a reason,
6. expose the resulting effective state to the UI.

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
- selection reason,
- applied controls,
- skipped controls,
- and current scope of any natural-language Persona override.

### 6.9 Acceptance criteria addendum

- Prompt assembly must include Persona/runtime resolution before final provider invocation.
- Natural-language Persona invocation must be parsed before auto selection finalization.
- Unsupported Persona controls must be skipped explicitly and surfaced.
- Effective resolution record must be available for thread history, activity panes, and run inspection UIs.
