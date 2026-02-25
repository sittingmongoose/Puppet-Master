# OpenCode Deep Extraction (for Puppet Master)

> **Compliance:** This document follows `Plans/DRY_Rules.md` and references SSOT contracts in `Plans/Contracts_V0.md`. Naming: “Puppet Master” only. No open questions; deterministic defaults per `Plans/Decision_Policy.md`.


<!--
Purpose:
- Provide a deterministic, repeatable procedure for extracting **architecture-relevant** patterns from the OpenCode repo to inform Puppet Master plans and implementations.
- This document is not a design fork: Puppet Master remains governed by its own locked decisions; OpenCode is used as a reference implementation.

ABSOLUTE NAMING RULE:
- Platform name is "Puppet Master" only.
- If older naming exists, refer to it only as "legacy naming" (do not quote it).
-->

## 1. Goal
Extract reusable, implementation-grade guidance from OpenCode (tools/permissions, provider streams, UI command patterns, storage/event envelope conventions) and map those findings into Puppet Master's SSOT plans **without** importing drift-prone details.

## 2. Hard constraints
- Puppet Master's locked stack decisions always win over OpenCode's choices.
- Extraction must be autonomous and deterministic (no mid-run human decisions).
- Output must be actionable: findings must map to an existing Puppet Master plan doc section (or be explicitly discarded with a reason).

## 3. Inputs
- OpenCode repository: https://github.com/anomalyco/opencode
- Puppet Master Plans directory (SSOT).

## 4. Deterministic extraction procedure
1) **Clone OpenCode into a temporary workspace** (do not commit it):
   - Path: `./.tmp/opencode` (or another deterministic temp dir).
2) **Inventory OpenCode surfaces** (deterministic list):
   - Tools model + permissions model
   - Provider execution model (streaming events, tool use/result)
   - UI command catalog / command dispatch pattern
   - Storage/persistence model (event log, projections)
3) **Extract canonical artifacts** (ordered):
   - Any markdown docs describing contracts and payload shapes
   - Any schema files (JSON schema, TS types, Rust types)
   - Any code paths implementing the contracts
4) **Normalize into Puppet Master terms**:
   - "Provider", "EventRecord", "UICommand", "tool.invoked/tool.denied" as Puppet Master contract names.
   - When OpenCode uses different naming, record it as an OpenCode-only term and translate.
5) **Map findings into Puppet Master SSOT docs**:
   - For each extracted concept, choose exactly one target plan doc section to update (or mark as discarded).
   - Never duplicate: add a reference to the correct SSOT doc instead of copying long definitions.
6) **Delete the OpenCode clone** (`./.tmp/opencode`) after extraction to avoid accidental commits.

## 5. Output format (for downstream agents)
For each extracted item, emit a record with:
- `source`: file path + snippet
- `category`: tools | permissions | provider_stream | ui_commands | storage
- `puppet_master_target`: `Plans/<doc>.md#<section>`
- `decision`: adopt | adapt | discard
- `rationale`: 1-3 sentences
- `acceptance_impact`: what new acceptance criteria (if any) become testable

## 6. Acceptance criteria
- Extraction can run end-to-end without prompts.
- Every adopted/adapted item is mapped to a single Puppet Master SSOT doc section.
- Temporary OpenCode clone is deleted after completion.
- No Puppet Master locked decisions are overwritten by OpenCode-derived content.

## 7. Contract mapping to Puppet Master SSOT (DRY)
This section is the canonical mapping from OpenCode extraction categories to Puppet Master contract sections. Use these targets instead of duplicating definitions.

| Extracted category | Puppet Master target (SSOT) | Contract section(s) |
|---|---|---|
| `tools` | `Plans/Tools.md` | §3 (built-in tool set), §3.5 (tool I/O semantics), §10 (policy defaults + resolution) |
| `permissions` | `Plans/Tools.md` | §2 (allow/deny/ask), §2.5 (OpenCode permissions alignment), §10.2-§10.4 (defaults/presets/resolution) |
| `provider_stream` | `Plans/Contracts_V0.md`, `Plans/CLI_Bridged_Providers.md`, `Plans/Provider_OpenCode.md` | `Contracts_V0` §2 (normalized provider stream boundary), `CLI_Bridged_Providers` §“Normalized provider stream schema (V0)”, `Provider_OpenCode` §6.3 (OpenCode→normalized mapping) |
| `ui_commands` | `Plans/Contracts_V0.md`, `Plans/UI_Command_Catalog.md` | `Contracts_V0` §7 (`UICommand` envelope/rules), `UI_Command_Catalog` §2 (stable command IDs + expected events) |
| `storage` | `Plans/Contracts_V0.md`, `Plans/storage-plan.md` | `Contracts_V0` §1 (`EventRecord`) and §3 (`tool.invoked`/`tool.denied`), `storage-plan` §2.2 (seglog envelope + event types) |

ContractRef: ContractName:Plans/Contracts_V0.md#EventRecord, ContractName:Plans/Contracts_V0.md#UICommand, ContractName:Plans/CLI_Bridged_Providers.md, ContractName:Plans/Provider_OpenCode.md, ContractName:Plans/Tools.md, ContractName:Plans/UI_Command_Catalog.md, ContractName:Plans/storage-plan.md

## 8. Upstream notes worth capturing (DRY; file pointers + deltas)
> Purpose: prevent downstream agents from “assuming Puppet Master == OpenCode” by recording **where** key upstream models live and the **few deltas** that commonly cause mis-mapping.

### 8.1 Tools + ToolContext (upstream pointers)
- Plugin tool contract (ToolContext + `ask()` shape): `packages/plugin/src/tool.ts`
- Internal tool contract (structured `{title, metadata, output, attachments?}` + truncation wrapper): `packages/opencode/src/tool/tool.ts`
- Tool loading/registry (custom tools from `{tool,tools}/*.{js,ts}` + plugin tools; model-gated tool availability): `packages/opencode/src/tool/registry.ts`
- Tool lifecycle hooks (not Bus events): `Plugin.trigger("tool.execute.before"|"tool.execute.after")` in `packages/opencode/src/session/prompt.ts`

### 8.2 Permissions model (allow/deny/ask, wildcard patterns, replies, errors)
- Current ruleset-based permissions: `packages/opencode/src/permission/next.ts` + API surface `packages/opencode/src/server/routes/permission.ts`
  - Replies are `once | always | reject`; `reject` can optionally carry a user correction message (`CorrectedError` vs `RejectedError`).
  - Wildcard semantics (incl. special-case patterns ending in `" *"`): `packages/opencode/src/util/wildcard.ts`
- Notable delta vs Puppet Master assumptions: OpenCode has *two* permission implementations (`packages/opencode/src/permission/index.ts` and `.../permission/next.ts`). Prefer `next.ts` when extracting current behavior.

### 8.3 Provider abstraction + transform/error layers (providerID/modelID split)
- Provider/model registry and loader logic (explicit `providerID` + `modelID` split): `packages/opencode/src/provider/provider.ts`
- Provider message normalization / capability shims (toolCallId normalization, caching flags, modality filtering): `packages/opencode/src/provider/transform.ts`
- Error parsing and retryability/overflow detection (stream + API-call): `packages/opencode/src/provider/error.ts`
- Notable delta vs Puppet Master assumptions: a significant amount of “provider compatibility” lives in the transform layer (not in the core session stream), so don’t assume upstream tool/message parts map 1:1 to any single provider’s API.

### 8.4 Session/message/part taxonomy (what “a message” means upstream)
- Message schema (legacy/simple): `packages/opencode/src/session/message.ts` (parts: `text`, `reasoning`, `tool-invocation`, `file`, ...)
- Message schema (current/persistent): `packages/opencode/src/session/message-v2.ts` (parts: `text|reasoning|file|tool|step-start|step-finish|snapshot|patch|subtask|retry|compaction|agent`)
  - Tool part state machine: `pending|running|completed|error` (`ToolState*` in the same file).
- Notable delta vs Puppet Master assumptions: upstream sometimes injects synthetic messages/parts to satisfy provider constraints (e.g., ensure every `tool_use` has a corresponding `tool_result`; see `packages/opencode/src/session/message-v2.ts` + `packages/opencode/src/session/prompt.ts`).

### 8.5 Notable process docs (UI blocker/orchestrator pattern)
- Session composer “blocker” orchestrator pattern (question/permission blocks prompt input): `specs/session-composer-refactor-plan.md` and `packages/app/src/pages/session/composer/*`
