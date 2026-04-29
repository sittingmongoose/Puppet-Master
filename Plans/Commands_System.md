# Commands System (Canonical SSOT)

### Reconciliation addendum

This addendum applies row-level transfer coverage requirements for the mapped owner anchor. Source IDs and exact source tokens are preserved in packet metadata; prose below uses canonical wording for retired legacy terms.

- Required structural headings for this packet target:
  - ### Reconciliation addendum

#### Source target target-0071
- Reconciliation action: insert_after
- Replace scope: insert_only
- Required structural headings represented:
  - ### Reconciliation addendum
- Exact required items represented:
  - `UI_Command_Catalog.md` already gives several useful route-like commands:
  - UI_Command_Catalog.md
  - still violates canonical field naming in its own SSOT and still has no structural slot for overseer-class actor types
  - cross-surface pivot commands still need `project_id` or an equally strong derivation rule for multi-project correctness
  - project_id
  - reconciliation-heavy gaps where the direction exists but SSOT ownership/field naming/event families still conflict**
  - `UI_Command_Catalog.md` still lacks a projection-freshness gating rule for mutating/recovery commands
  - graph-local retry/HITL commands still cannot actually be thin aliases to runtime commands because they omit runtime-minimum anchors like `run_id`, `attempt_id`, and `blocked_sequence`.
  - run_id
  - attempt_id
  - blocked_sequence
  - domain-specific “open in X” commands can still exist where they express a meaningful product action, but they should be wrappers over the same route/subject model rather than custom arg families
  - it stops `resume_url` from being more capable than in-app commands
  - resume_url
  - navigation commands should be able to carry:
  - Tighten `UI_Wiring_Rules.md` so reusable navigation commands and subject-open commands are treated as first-class wiring shapes rather than smuggled through generic `args`.
  - UI_Wiring_Rules.md
  - args
  - wrapper commands over a canonical navigation primitive
  - `UI_Command_Catalog.md` already contains several navigation-like or cross-surface commands:
  - Navigation-related commands are described as layout/UI-state only, but the docs still lack a shared rule for when those commands must carry `project_id`, `focused_run_id`, `thread_id`, or other context needed to restore scope correctly.
  - focused_run_id
  - thread_id
  - If the route/subject model stays on track, introduce a small canonical family such as `cmd.nav.*` and let surface-specific commands either wrap it or be declared as typed specializations.
  - cmd.nav.*
  - The key remaining question is breadth: how many authored `Plans/*.md` docs are still only Gemini or otherwise below full requested model coverage.
  - Plans/*.md
  - focus/open wrapper commands in `cmd.nav.*`
  - specialized operation payloads (`OpenFile`, `OpenSubject`, or object-specific commands)
  - OpenFile
  - OpenSubject
  - Wrapper commands are currently real and useful, but the docs still lack a rule for when they are canonical UX affordances versus deprecated raw transport shapes.
  - Let wrapper commands remain if they provide real UX meaning, but make the underlying target model canonical.
  - `cmd.panel.switch` and similar shell commands are useful, but they should not become the de facto universal navigation primitive.
  - cmd.panel.switch
  - Treat commands like `cmd.panel.switch` as shell/view commands that can consume normalized routing context, not replace it.
  - Pure shell/view-state commands should stay local and lightweight. They change what panel/subview/layout is visible, but they do not own canonical target identity.
  - Route-consuming navigation commands are the ones that must reveal a specific object or scope. They should normalize through the emerging `route_target` model even if the user-facing command name stays domain-specific.
  - route_target
  - `UI_Command_Catalog.md` currently mixes shell commands and object-targeting navigation commands in the same "layout/UI state only" bucket, even when payloads already carry object identity.
  - Keep `cmd.panel.switch` and `cmd.source_control.switch_subview` as pure shell/view-state commands with controlled destination vocabularies.
  - cmd.source_control.switch_subview
  - Treat commands like `cmd.source_control.select_worktree` as object-selection/navigation commands that should normalize through canonical target identity if they remain first-class.
  - cmd.source_control.select_worktree
  - Shell commands should not accumulate object identity until they quietly become undocumented route commands.
  - There is still no canonical navigation primitive in the contract layer, so wrapper commands remain forced to carry semantics in prose.
  - The wiring/gate model is command-ID-centric, but it has no first-class notion of wrapper commands normalizing to one shared route primitive.
  - wrapper commands should instead declare something like `normalizes_to` / `canonical_target_contract` / `canonical_route_kind`
  - normalizes_to
  - canonical_target_contract
  - canonical_route_kind
  - For wrapper commands, `normalizes_to_contract` should stay narrow and contract-level, for example:
  - normalizes_to_contract
  - Deprecated alias metadata should remain explicit and separate because it implies lifecycle/removal expectations that wrapper commands do not have.
  - classify commands as `shell_view`, `navigation_wrapper`, or `domain_action`
  - shell_view
  - navigation_wrapper
  - domain_action
  - The routing rewrite requires stable wrapper commands that normalize to shared contracts, but the wiring model still treats every command as either direct or UI-only.
  - Coverage has been re-audited after the merge: `39` top-level `Plans/*.md` docs are full six-pass complete and the remaining `22` docs are now uniformly at five passes.
  - 39
  - 22
  - After this merge, the authored top-level `Plans/*.md` surface is fully covered: all `61` docs now have all six requested model passes.
  - 61
  - many routed cross-surface commands still say `layout/UI state only` even when they clearly target canonical object navigation:
  - layout/UI state only
- Exact acceptance checks represented:
  - All coverage_row_ids listed on this target are represented without broad summary substitution.
  - All source_obligation_ids, source_seed_ids, and source_shard_ids are preserved in packet metadata.
  - Rows marked missing or partial receive concrete prose or structural additions under the mapped live anchor.
- Source lineage is preserved in packet metadata for coverage rows, source obligations, source seeds, source shards, gaps, fidelity refs, span group, and writer role.

> **Compliance:** This document follows `Plans/DRY_Rules.md` and references SSOT contracts in `Plans/Contracts_V0.md`. Naming: "Puppet Master" only. No open questions; deterministic defaults per `Plans/Decision_Policy.md`.

## 0. Scope and SSOT status

### Reconciliation addendum

This addendum applies row-level transfer coverage requirements for the mapped owner anchor. Source IDs and exact source tokens are preserved in packet metadata; prose below uses canonical wording for retired legacy terms.

- Required structural headings for this packet target:
  - ### Reconciliation addendum

#### Source target target-0072
- Reconciliation action: insert_after
- Replace scope: insert_only
- Required structural headings represented:
  - ### Reconciliation addendum
- Exact required items represented:
  - still the highest-leverage SSOT for requested/effective identity, but still carries tier-era persisted values, missing scope fields, and no durable account-switch history model
- Exact acceptance checks represented:
  - All coverage_row_ids listed on this target are represented without broad summary substitution.
  - All source_obligation_ids, source_seed_ids, and source_shard_ids are preserved in packet metadata.
  - Rows marked missing or partial receive concrete prose or structural additions under the mapped live anchor.
- Source lineage is preserved in packet metadata for coverage rows, source obligations, source seeds, source shards, gaps, fidelity refs, span group, and writer role.

This document is the **single canonical source of truth** for the Puppet Master User Commands system — user-authored command presets that inject templated prompts into a run. All other plan documents MUST reference this document by anchor (e.g., `Plans/Commands_System.md#COMMAND-SCHEMA`) rather than restating command definitions, discovery paths, template syntax, or execution semantics.

ContractRef: Primitive:DRYRules, ContractName:Plans/DRY_Rules.md

### SSOT references (DRY)

### Reconciliation addendum

This addendum applies row-level transfer coverage requirements for the mapped owner anchor. Source IDs and exact source tokens are preserved in packet metadata; prose below uses canonical wording for retired legacy terms.

- Required structural headings for this packet target:
  - ### Reconciliation addendum

#### Source target target-0082
- Reconciliation action: insert_after
- Replace scope: insert_only
- Required structural headings represented:
  - ### Reconciliation addendum
- Exact required items represented:
  - The remaining work is now mostly about collapsing overlapping canon and fixing exact broken references, payloads, and command contracts.
- Exact acceptance checks represented:
  - All coverage_row_ids listed on this target are represented without broad summary substitution.
  - All source_obligation_ids, source_seed_ids, and source_shard_ids are preserved in packet metadata.
  - Rows marked missing or partial receive concrete prose or structural additions under the mapped live anchor.
- Source lineage is preserved in packet metadata for coverage rows, source obligations, source seeds, source shards, gaps, fidelity refs, span group, and writer role.
- Locked decisions: `Plans/Spec_Lock.json`
- Canonical contracts (events/tools/auth): `Plans/Contracts_V0.md`
- DRY + ContractRef rule: `Plans/DRY_Rules.md`
- Canonical terms: `Plans/Glossary.md`
- Deterministic ambiguity handling: `Plans/Decision_Policy.md` + `Plans/auto_decisions.jsonl`
- UICommand dispatch IDs: `Plans/UI_Command_Catalog.md`
- Reserved slash commands: `Plans/assistant-chat-design.md` §5
- Run modes: `Plans/Run_Modes.md`
- Persona system: `Plans/Personas.md`
- Permissions system: `Plans/Permissions_System.md`
- Tool permissions + tool events: `Plans/Tools.md`
- OpenCode baseline (commands): `Plans/OpenCode_Deep_Extraction.md` §7D
- GUI specification: `Plans/FinalGUISpec.md`

---

## 1. Definitions

<a id="DEF-USER-COMMAND"></a>
### 1.1 User Command (preset)

### Reconciliation addendum

This addendum applies row-level transfer coverage requirements for the mapped owner anchor. Source IDs and exact source tokens are preserved in packet metadata; prose below uses canonical wording for retired legacy terms.

- Required structural headings for this packet target:
  - ### Reconciliation addendum

#### Source target target-0077
- Reconciliation action: insert_after
- Replace scope: insert_only
- Required structural headings represented:
  - ### Reconciliation addendum
- Exact required items represented:
  - only for things that genuinely need user decision/input
  - surface where the user should go next
  - `approve_continue` is still the most dangerous unmapped UI action in the downstream command layer.
  - approve_continue
  - Reconcile all remaining command/template/example drift so `UI_Command_Catalog.md` is the sole stable action owner and every referenced command actually exists.
  - UI_Command_Catalog.md
  - command execution seam for User Commands,
  - `Commands_System.md` is useful mainly as a boundary reminder: user-authored slash/palette commands are a separate concept. The current gap is inside internal `UICommand` modeling, not user command presets.
  - Commands_System.md
  - UICommand
  - destination surface may indicate the user should land in `source_control`, `github_actions`, `docker_manager`, or `document_pane`
  - source_control
  - github_actions
  - docker_manager
  - document_pane
  - `UI_Command_Catalog.md` still exposes the `request_id` versus `blocked_sequence` split directly in user-facing command rows.
  - request_id
  - blocked_sequence
  - `BinaryLocator_Spec.md`, `Document_Packaging_Policy.md`, and `Containers_Registry_and_Unraid.md` still show split ownership between behavior SSOTs and adjacent command/storage/runtime owners, now with exact command ID, artifact-type, and launcher-ownership mismatches.
  - BinaryLocator_Spec.md
  - Document_Packaging_Policy.md
  - Containers_Registry_and_Unraid.md
- Exact acceptance checks represented:
  - All coverage_row_ids listed on this target are represented without broad summary substitution.
  - All source_obligation_ids, source_seed_ids, and source_shard_ids are preserved in packet metadata.
  - Rows marked missing or partial receive concrete prose or structural additions under the mapped live anchor.
- Source lineage is preserved in packet metadata for coverage rows, source obligations, source seeds, source shards, gaps, fidelity refs, span group, and writer role.

A **User Command** is a user-authored or catalog-installed command preset stored as a Markdown file with YAML frontmatter. When invoked, the template body is resolved (placeholders expanded, file includes loaded, shell output injected) and submitted as a prompt to the active chat thread or run. User Commands are the user-facing automation surface — they let users package repeatable prompt workflows without writing code.

<a id="DEF-UICOMMAND-DISTINCTION"></a>
### 1.2 UICommand (internal dispatch) — distinction

### Reconciliation addendum

This addendum applies row-level transfer coverage requirements for the mapped owner anchor. Source IDs and exact source tokens are preserved in packet metadata; prose below uses canonical wording for retired legacy terms.

- Required structural headings for this packet target:
  - ### Reconciliation addendum

#### Source target target-0078
- Reconciliation action: insert_after
- Replace scope: insert_only
- Required structural headings represented:
  - ### Reconciliation addendum
- Exact required items represented:
  - need explicit distinction between:
  - `[retired-token-1]` now shows a second internal navigation contradiction beyond the already-known Orchestrator-page drift (`[retired-token-4]` vs `[retired-token-5]`), and `[retired-token-2]` itself is structurally incomplete because its TOC advertises a missing `[retired-token-3]` section.
  - [retired-token-1]
  - [retired-token-4]
  - [retired-token-5]
  - [retired-token-2]
  - [retired-token-3]
  - Keep `UICommand` as the dispatch envelope, but give `args` a normalized target model when the command is navigation/open/focus-oriented.
  - UICommand
  - args
  - `Primitive:UICommand`
  - Primitive:UICommand
  - `[retired-token-6]` is one of the strongest internal contradiction sites in the repo because its later addenda already prove the old `[retired-token-7]` model is no longer enough.
  - [retired-token-6]
  - [retired-token-7]
  - section `7. UICommand`
  - 7. UICommand
  - Make the owner-doc distinction explicit:
- Legacy token retirement handling:
  - Retired token #1 is preserved exactly in packet metadata and must be omitted, replaced by canonical wording, or documented only as an explicitly deprecated legacy alias in live prose.
  - Retired token #2 is preserved exactly in packet metadata and must be omitted, replaced by canonical wording, or documented only as an explicitly deprecated legacy alias in live prose.
  - Retired token #3 is preserved exactly in packet metadata and must be omitted, replaced by canonical wording, or documented only as an explicitly deprecated legacy alias in live prose.
  - Retired token #4 is preserved exactly in packet metadata and must be omitted, replaced by canonical wording, or documented only as an explicitly deprecated legacy alias in live prose.
  - Retired token #5 is preserved exactly in packet metadata and must be omitted, replaced by canonical wording, or documented only as an explicitly deprecated legacy alias in live prose.
  - Retired token #6 is preserved exactly in packet metadata and must be omitted, replaced by canonical wording, or documented only as an explicitly deprecated legacy alias in live prose.
  - Retired token #7 is preserved exactly in packet metadata and must be omitted, replaced by canonical wording, or documented only as an explicitly deprecated legacy alias in live prose.
- Exact acceptance checks represented:
  - All coverage_row_ids listed on this target are represented without broad summary substitution.
  - All source_obligation_ids, source_seed_ids, and source_shard_ids are preserved in packet metadata.
  - Rows marked missing or partial receive concrete prose or structural additions under the mapped live anchor.
  - All exact_stale_tokens_to_retire are removed, reframed as explicitly deprecated, or preserved only as documented legacy aliases.
- Source lineage is preserved in packet metadata for coverage rows, source obligations, source seeds, source shards, gaps, fidelity refs, span group, and writer role.

A **UICommand** (`Plans/Contracts_V0.md#UICommand`, `Plans/UI_Command_Catalog.md`) is an internal UI dispatch identifier (e.g., `cmd.chat.model`, `cmd.lsp.goto_definition`). UICommands are stable IDs that bind UI elements to handlers. They are **not** user-authored; they are developer-defined, code-registered, and wiring-matrix-verified.

User Commands and UICommands are orthogonal:
- User Commands are **content presets** (prompt templates).
- UICommands are **internal dispatch actions** (UI handler bindings).

A User Command's invocation through the chat slash-command surface or command palette ultimately dispatches a UICommand (`cmd.chat.run_user_command`) to trigger execution, but the User Command itself is not a UICommand.

ContractRef: ContractName:Plans/Contracts_V0.md#UICommand, ContractName:Plans/UI_Command_Catalog.md

### 1.3 Invocation surfaces

User Commands are invocable from three surfaces:

| Surface | Mechanism | Details |
|---------|-----------|---------|
| **Assistant chat** | Slash-command prefix `/` | User types `/<command-name>` (or `/x-<command-name>` for custom). Autocomplete popup lists available commands alongside reserved slash commands (`Plans/assistant-chat-design.md` §5). |
| **Command palette** | Palette entry | Commands exposed to the palette appear as "Run command: \<name\>". |
| **Orchestrator shortcut trigger** | Optional keybinding | A User Command may be bound to a keyboard shortcut via Settings > Shortcuts. |

ContractRef: ContractName:Plans/assistant-chat-design.md#5, ContractName:Plans/FinalGUISpec.md

---

## 2. Storage and discovery

<a id="STORAGE-LAYOUT"></a>

User Command files are stored in a deterministic two-tier layout. Project-local commands override global commands by name.

ContractRef: PolicyRule:Decision_Policy.md§2

### 2.1 Project-local

```
<project_root>/.puppet-master/commands/<name>.md
```

Scoped to the project workspace root. Available only when that project is active.

### 2.2 Global

```
~/.config/puppet-master/commands/<name>.md
```

Available across all projects. Overridden by a project-local command with the same name.

### 2.3 Resolution order

### Reconciliation addendum

This addendum applies row-level transfer coverage requirements for the mapped owner anchor. Source IDs and exact source tokens are preserved in packet metadata; prose below uses canonical wording for retired legacy terms.

- Required structural headings for this packet target:
  - ### Reconciliation addendum

#### Source target target-0079
- Reconciliation action: insert_after
- Replace scope: insert_only
- Required structural headings represented:
  - ### Reconciliation addendum
- Exact required items represented:
  - Recommended resolution order for identity opens
- Exact acceptance checks represented:
  - All coverage_row_ids listed on this target are represented without broad summary substitution.
  - All source_obligation_ids, source_seed_ids, and source_shard_ids are preserved in packet metadata.
  - Rows marked missing or partial receive concrete prose or structural additions under the mapped live anchor.
- Source lineage is preserved in packet metadata for coverage rows, source obligations, source seeds, source shards, gaps, fidelity refs, span group, and writer role.

When resolving a command by name:
1. Check `.puppet-master/commands/<name>.md` in the active project root.
2. If not found, check `~/.config/puppet-master/commands/<name>.md`.
3. If not found, the command is unresolved. The invocation surface MUST display an error: "Unknown command: \<name\>".

### 2.4 Name collision rules

### Reconciliation addendum

This addendum applies row-level transfer coverage requirements for the mapped owner anchor. Source IDs and exact source tokens are preserved in packet metadata; prose below uses canonical wording for retired legacy terms.

- Required structural headings for this packet target:
  - ### Reconciliation addendum

#### Source target target-0080
- Reconciliation action: insert_after
- Replace scope: insert_only
- Required structural headings represented:
  - ### Reconciliation addendum
- Exact required items represented:
  - `Skills_System.md` still has unresolved bundling-off semantics, compaction behavior for bundled skill text, and HTE/DAE reachability rules.
  - Skills_System.md
- Exact acceptance checks represented:
  - All coverage_row_ids listed on this target are represented without broad summary substitution.
  - All source_obligation_ids, source_seed_ids, and source_shard_ids are preserved in packet metadata.
  - Rows marked missing or partial receive concrete prose or structural additions under the mapped live anchor.
- Source lineage is preserved in packet metadata for coverage rows, source obligations, source seeds, source shards, gaps, fidelity refs, span group, and writer role.

Reserved built-ins and their families cannot be overridden by provider, skill, or extension naming.

ContractRef: ContractName:Plans/UI_Command_Catalog.md, ContractName:Plans/assistant-chat-design.md

Collision rules:
- `/web` reserves the family namespace for `/web search`, `/web fetch`, `/web extract`, `/web research`, `/web crawl`, and `/web map`
- `/worktree` is reserved and cannot be re-bound by a custom command
- `/skill` remains a built-in helper surface even though it is not part of the reserved built-in set owned here
- natural-language and slash dispatch share the same underlying dispatcher, so collision handling is consistent across both entry points

### 2.5 Name validation

**Name regex:** `^[a-z][a-z0-9_-]{0,48}[a-z0-9]$`
- Starts with a lowercase letter.
- Contains only lowercase letters, digits, hyphens, and underscores.
- Ends with a lowercase letter or digit.
- Length: 2–50 characters.

ContractRef: PolicyRule:Decision_Policy.md§2

---

## 3. Command schema

<a id="COMMAND-SCHEMA"></a>

A User Command file (`<name>.md`) consists of YAML frontmatter followed by a Markdown template body.

ContractRef: PolicyRule:Decision_Policy.md§2, ContractName:Plans/DRY_Rules.md

### 3.1 YAML frontmatter

```yaml
---
description: "Run the project's test suite and report results"
persona: "rust-engineer"
mode: "regular"
model: "anthropic/claude-sonnet-4"
subtask: false
permissions_profile_override: null
override_builtin: false
---
```

### 3.2 Field definitions

| Field | Required | Type | Meaning |
|---|---|---|---|
| `name` | Required | `string` | Invocation name. Must pass validation and MUST NOT collide with reserved Assistant Chat built-ins or reserved git/GitHub prefixes. |
| `description` | Required | `string` | Short user-facing description. |
| `arguments` | Optional | `array<object>` | Positional argument schema for validation/help. |
| `persona_override` | Optional | `string` | Requested Persona override for the command execution context. |
| `mode_override` | Optional | `string` | Requested runtime mode override when allowed by the owning surface. |
| `model_override` | Optional | `string` | Requested model override. |
| `permissions_profile_override` | Optional | `string` | Permissions profile override, subject to the central permission system. |
| `override_builtin` | Optional | `boolean` | Reserved for future non-chat extension points. It MUST NOT override canonical Assistant Chat built-ins or reserved git/GitHub prefixes. |

ContractRef: ContractName:Plans/assistant-chat-design.md, ContractName:Plans/Permissions_System.md, ContractName:Plans/Prompt_Pipeline.md

### 3.3 Template body

The Markdown body following the frontmatter is the prompt template. It supports three dynamic features: placeholders, file includes, and shell output injection.

<a id="TEMPLATE-PLACEHOLDERS"></a>
#### 3.3.1 Placeholders

| Placeholder | Meaning |
|-------------|---------|
| `$ARGUMENTS` | All remaining text after the command name. |
| `$1`, `$2`, ... `$N` | Positional arguments, space-separated from the invocation text. |

Placeholder extraction: At load time, the template is scanned for `$ARGUMENTS` and `$N` patterns. The extracted list is stored as `hints` for autocomplete display.

Unresolved placeholders (no value provided) are replaced with empty string.

<a id="TEMPLATE-FILE-INCLUDE"></a>
#### 3.3.2 File includes (`@path`)

The pattern `@path/to/file` in the template body causes the referenced file's contents to be included at that position during template resolution. Directory references (`@path/to/dir`) include a listing of the directory contents.

**Permission guard:** File inclusion is checked against the `read` permission key (`Plans/Permissions_System.md` §5). If the active permission resolves to `deny` for the referenced path, the include is blocked and an error message is substituted. If `ask`, the approval UI is shown.

ContractRef: ContractName:Plans/Permissions_System.md#TOOL-KEYS

<a id="TEMPLATE-SHELL-INJECTION"></a>
#### 3.3.3 Shell output injection (`` !`command` ``)

### Reconciliation addendum

This addendum applies row-level transfer coverage requirements for the mapped owner anchor. Source IDs and exact source tokens are preserved in packet metadata; prose below uses canonical wording for retired legacy terms.

- Required structural headings for this packet target:
  - ### Reconciliation addendum

#### Source target target-0084
- Reconciliation action: insert_after
- Replace scope: insert_only
- Required structural headings represented:
  - ### Reconciliation addendum
- Exact required items represented:
  - The broader rewrite still lacks a strong single source for several cross-cutting concerns: command namespace promotion, capability-state ownership, cleanup/remediation lineage, packaging lineage, container publish authority, and actor-scope/rules injection.
  - `cmd.source_control.select_worktree` is not just a generic shell toggle. It is an object-targeting selection command. If it remains canonical, it should resolve through normalized target identity rather than stay a one-off ad hoc selection primitive.
  - cmd.source_control.select_worktree
  - `FinalGUISpec.md` correctly treats activity-bar navigation as a shell concern, but local docs elsewhere keep slipping object context into the same command family.
  - FinalGUISpec.md
- Exact acceptance checks represented:
  - All coverage_row_ids listed on this target are represented without broad summary substitution.
  - All source_obligation_ids, source_seed_ids, and source_shard_ids are preserved in packet metadata.
  - Rows marked missing or partial receive concrete prose or structural additions under the mapped live anchor.
- Source lineage is preserved in packet metadata for coverage rows, source obligations, source seeds, source shards, gaps, fidelity refs, span group, and writer role.

The pattern `` !`shell-command` `` in the template body executes the shell command and injects its stdout at that position during template resolution.

**Permission guard:** Shell injection is checked against the `bash` permission key (`Plans/Permissions_System.md` §5). If the active permission resolves to `deny`, the injection is blocked and an error message is substituted. If `ask`, the approval UI is shown and the user's response (`deny`/`once`/`for session`/`always`) is respected per `Plans/Permissions_System.md` §6.

ContractRef: ContractName:Plans/Permissions_System.md#TOOL-KEYS, ContractName:Plans/Permissions_System.md#ASK-FLOW

---

## 4. Execution semantics

### Reconciliation addendum

This addendum applies row-level transfer coverage requirements for the mapped owner anchor. Source IDs and exact source tokens are preserved in packet metadata; prose below uses canonical wording for retired legacy terms.

- Required structural headings for this packet target:
  - ### Reconciliation addendum

#### Source target target-0074
- Reconciliation action: insert_after
- Replace scope: insert_only
- Required structural headings represented:
  - ### Reconciliation addendum
- Exact required items represented:
  - the UI should show these semantics explicitly and consistently, not infer them ad hoc by color or disappearance
  - conversational actors and document-production actors share provider/runtime identity semantics, but they are not orchestration execution objects
  - `Runtime_Artifacts_Panel.md` is missing `attempt_id` in its canonical id set and does not yet absorb trust-tier / degraded-artifact semantics cleanly
  - Runtime_Artifacts_Panel.md
  - attempt_id
  - Reserve `trust_tier` for preview/browser semantics only unless those docs are later explicitly renamed too.
  - trust_tier
  - `Formatters_System.md`, `LSPSupport.md`, `Plugins_System.md`, and `Skills_System.md` still lack clean ownership boundaries for mutation-capable semantics, hosted-vs-DAE execution reachability, tool/event identity, and plugin/skill introspection or isolation guarantees.
  - Formatters_System.md
  - LSPSupport.md
  - Plugins_System.md
  - Skills_System.md
- Exact acceptance checks represented:
  - All coverage_row_ids listed on this target are represented without broad summary substitution.
  - All source_obligation_ids, source_seed_ids, and source_shard_ids are preserved in packet metadata.
  - Rows marked missing or partial receive concrete prose or structural additions under the mapped live anchor.
- Source lineage is preserved in packet metadata for coverage rows, source obligations, source seeds, source shards, gaps, fidelity refs, span group, and writer role.

<a id="EXECUTION"></a>

### 4.1 Working directory

The active working directory for command execution resolves as follows:

1. If the active context has a bound worktree (`is_worktree` is true in execution context), use the **worktree root path**
2. Otherwise, use the **active project root**

This applies to all command execution contexts: Assistant Chat (all modes), Orchestrator DAE, terminal sessions, and file operations.

When a thread with a bound worktree is active in Assistant Chat, all `cmd.chat.*` commands execute against the worktree root. When no worktree is bound, they execute against the project root.

ContractRef: ContractName:Plans/Executor_Protocol.md, ContractName:Plans/assistant-chat-design.md, ContractName:Plans/Run_Modes.md

### 4.2 Subtask execution

When `subtask: true` is set, the command launches a canonical child run through the same delegated-run contract used everywhere else.

ContractRef: ContractName:Plans/Tools.md, ContractName:Plans/Prompt_Pipeline.md, ContractName:Plans/storage-plan.md

Required behavior:
- resolve requested and effective Persona/runtime/model/effort state using the same pipeline as any other child run.
- classify the child as `required` or `optional`; `required` is the safer default for command subtasks unless the command explicitly declares advisory behavior.
- inherit and then narrow the parent permission ceiling and compatible capability universe.
- record the parent-child linkage in canonical event and storage records.
- do not silently fallback when the command explicitly requested a runtime surface that is unavailable or incompatible.

ContractRef: ContractName:Plans/Models_System.md, ContractName:Plans/Permissions_System.md, ContractName:Plans/Contracts_V0.md
### 4.3 Persona selection

Command subtasks follow the canonical child Persona resolution order.

ContractRef: ContractName:Plans/Personas.md, ContractName:Plans/Tools.md, ContractName:Plans/Run_Modes.md

Rules:
- explicit command Persona override wins.
- otherwise the command-provided task or child type resolves Persona through the normal child Persona pipeline.
- parent Persona is at most a weak hint.
- child Persona does not silently copy the parent Persona.
### 4.4 Mode and model overrides

### Reconciliation addendum

This addendum applies row-level transfer coverage requirements for the mapped owner anchor. Source IDs and exact source tokens are preserved in packet metadata; prose below uses canonical wording for retired legacy terms.

- Required structural headings for this packet target:
  - ### Reconciliation addendum

#### Source target target-0081
- Reconciliation action: insert_after
- Replace scope: insert_only
- Required structural headings represented:
  - ### Reconciliation addendum
- Exact required items represented:
  - package-level overrides do not leak across unrelated runs
  - `Plugins_System.md` still permits read-only mode bypass via mutating plugin tools and env-var mutation, plus namespace/runtime model splits.
  - Plugins_System.md
- Exact acceptance checks represented:
  - All coverage_row_ids listed on this target are represented without broad summary substitution.
  - All source_obligation_ids, source_seed_ids, and source_shard_ids are preserved in packet metadata.
  - Rows marked missing or partial receive concrete prose or structural additions under the mapped live anchor.
- Source lineage is preserved in packet metadata for coverage rows, source obligations, source seeds, source shards, gaps, fidelity refs, span group, and writer role.

Command overrides are explicit child requests, not bypasses around the runtime model.

ContractRef: ContractName:Plans/Models_System.md, ContractName:Plans/Run_Modes.md, ContractName:Plans/CLI_Bridged_Providers.md

Rules:
- command mode overrides are capped by parent mode authority.
- command model/runtime surface overrides become explicit child requests.
- explicit requests do not silently fallback.
- requested versus effective runtime/model/effort fields remain visible when remaps occur because of compatibility or policy.
### 4.5 Template resolution order

Template resolution proceeds in this order:
1. Parse YAML frontmatter; extract field values.
2. Extract placeholder hints (`$ARGUMENTS`, `$1`, `$2`, ...) from body.
3. Substitute placeholders with invocation arguments.
4. Resolve `@path` file includes (permission-checked).
5. Resolve `` !`command` `` shell injections (permission-checked).
6. The fully resolved body is the prompt submitted to the run.

ContractRef: ContractName:Plans/Commands_System.md#EXECUTION

---

## 5. Permissions integration

<a id="PERMISSIONS"></a>

### 5.1 Shell injection permission check

Shell injection (`` !`command` ``) is evaluated against the `bash` permission key using the resolution algorithm in `Plans/Permissions_System.md` §8. The shell command string is the invocation context for granular pattern matching.

If the resolution yields `ask`, the approval UI is shown with the full shell command displayed. The user's response follows `Plans/Permissions_System.md` §6 semantics:
- `once`: Execute this injection only.
- `for session`: Insert a session-scoped allow rule for the command pattern.
- `always`: Create the durable allow defined by `Plans/Permissions_System.md` §6.
- `deny`: Block this injection for the current blocked episode.

ContractRef: ContractName:Plans/Permissions_System.md#ASK-FLOW, ContractName:Plans/Permissions_System.md#RESOLUTION

### 5.2 File inclusion permission check

File inclusion (`@path`) is evaluated against the `read` permission key. The file path is the invocation context. Same `ask` flow semantics apply.

ContractRef: ContractName:Plans/Permissions_System.md#TOOL-KEYS

### 5.3 `permissions_profile_override`

If a command specifies `permissions_profile_override`, the named profile is loaded from `~/.config/puppet-master/permission-profiles/<profile_id>.toml` and applied as an additional precedence layer between Persona overrides and project-level rules (effectively replacing the Persona's profile for this command's run).

ContractRef: ContractName:Plans/Permissions_System.md#PRECEDENCE-LAYERS

---

## 6. GUI requirements
### 6.6 Catalog-installed command lifecycle

Catalog-installed commands are still canonical User Commands after installation.

Rules:
- installation creates or updates a command in the same canonical command roots described in §2
- updates follow the same validation rules as manual edits
- removal of an installed command is blocked or deferred when the command is actively referenced by an open edit session or another subsystem requires explicit replacement/confirmation
- the GUI must show whether a command is local/manual, catalog-installed, or catalog-installed with local override
- uninstalling a catalog item must not silently delete a user-authored project override that intentionally shadows it

<a id="GUI-COMMANDS"></a>

The Commands settings screen is part of the **Rules & Commands** tab in the unified Settings page (`Plans/FinalGUISpec.md` §7.4). All GUI surfaces described here are normative; `Plans/FinalGUISpec.md` references this section as the SSOT for Commands GUI behavior.

ContractRef: ContractName:Plans/FinalGUISpec.md, ContractName:Plans/DRY_Rules.md

### 6.1 Commands management section

A **Commands** section within Settings > Rules & Commands MUST provide the following.

ContractRef: ContractName:Plans/Commands_System.md#GUI-COMMANDS

#### 6.1.1 Scope selector

### Reconciliation addendum

This addendum applies row-level transfer coverage requirements for the mapped owner anchor. Source IDs and exact source tokens are preserved in packet metadata; prose below uses canonical wording for retired legacy terms.

- Required structural headings for this packet target:
  - ### Reconciliation addendum

#### Source target target-0085
- Reconciliation action: insert_after
- Replace scope: insert_only
- Required structural headings represented:
  - ### Reconciliation addendum
- Exact required items represented:
  - Refactor `orchestrator-subagent-integration.md` so selector and hook APIs consume:
  - orchestrator-subagent-integration.md
  - Canonical target selector:
  - one canonical target selector:
  - `project_id` is required scope, not selector identity.
  - project_id
  - `wizard_step` is not a primary selector
  - wizard_step
  - `usage_event_ref` is not a primary selector field
  - usage_event_ref
  - reject when `inspector_target` is present but no object selector exists
  - inspector_target
- Exact acceptance checks represented:
  - All coverage_row_ids listed on this target are represented without broad summary substitution.
  - All source_obligation_ids, source_seed_ids, and source_shard_ids are preserved in packet metadata.
  - Rows marked missing or partial receive concrete prose or structural additions under the mapped live anchor.
- Source lineage is preserved in packet metadata for coverage rows, source obligations, source seeds, source shards, gaps, fidelity refs, span group, and writer role.

A toggle at the top of the Commands section:
- **Global** — manages commands in `~/.config/puppet-master/commands/`.
- **Project** (visible when a project is active) — manages commands in `<project_root>/.puppet-master/commands/`.

#### 6.1.2 Command list

A table listing all resolved commands (project + global, project-local indicated with badge). Columns:
- **Name** (bold, with `/x-` prefix shown)
- **Scope** badge (project / global)
- **Description** (truncated to 1 line)
- **Persona** (if set; otherwise "—")
- **Mode** (if set; otherwise "inherit")
- **Model** (if set; otherwise "inherit")
- **Subtask** indicator (checkbox icon if `true`)

Sorted alphabetically by name; project-local entries sort before global when names match (indicating override).

#### 6.1.3 Create

"New Command" button opens an editor form with:
- **Name** (text input; validated per §2.5; collision check per §2.4)
- **Description** (text input; required; max 200 chars)
- **Persona** (dropdown populated from Persona registry, or null)
- **Mode** (dropdown: inherit / ask / plan / regular / yolo)
- **Model** (dropdown populated from model discovery, or null/inherit)
- **Subtask** (toggle; default off)
- **Permissions profile override** (dropdown populated from permission profiles, or null)
- **Override built-in** (toggle; default off; visible only in Expert mode; reserved Assistant Chat slash commands fail validation even if this toggle is enabled, because `override_builtin` does not apply to canonical reserved chat commands.)
- **Template body** (Markdown editor with syntax highlighting for `$ARGUMENTS`, `$N`, `@path`, `` !`cmd` `` patterns)

Scope selector: project-local or global.

#### 6.1.4 Edit

Row click or edit button opens the same editor pre-populated. Editing a global command while a project is active offers "Save as project override" (creates project-local copy) or "Save globally."

#### 6.1.5 Delete

Delete button with confirmation modal. Deleting a project-local command that overrides a global one reveals the global version. Deleting a global command with no project override removes it entirely.

#### 6.1.6 Schema validation on save

On every save, validate the command file against the schema (§3). Display inline errors for: reserved name collision, invalid name format, missing description, invalid mode value, and invalid model format. If `override_builtin: true` is set while the command name matches a reserved Assistant Chat slash command, display a validation error explaining that `override_builtin` does not apply to canonical reserved chat commands. Block save until errors are resolved.

### 6.2 Dry-run preview

<a id="DRY-RUN"></a>

A **"Preview"** button in the command editor resolves the template with sample arguments and displays the fully rendered prompt without submitting it. The preview:
- Shows placeholder substitutions highlighted.
- Shows file-include results (or permission-blocked placeholders).
- Shows shell-injection results (or permission-blocked placeholders).
- Uses a read-only rendered Markdown view.

The preview does NOT execute any run. Shell injections in preview mode execute the shell command (subject to `bash` permission) but do not submit the result to any agent.

### 6.3 Shortcut binding

## 7. Reserved built-in slash commands

### Reconciliation addendum

This addendum applies row-level transfer coverage requirements for the mapped owner anchor. Source IDs and exact source tokens are preserved in packet metadata; prose below uses canonical wording for retired legacy terms.

- Required structural headings for this packet target:
  - ### Reconciliation addendum

#### Source target target-0075
- Reconciliation action: insert_after
- Replace scope: insert_only
- Required structural headings represented:
  - ### Reconciliation addendum
- Exact required items represented:
  - `reopened`, `revoked`, and `superseded` should be reserved for true lineage-changing transitions, not generic “old state” labels
  - reopened
  - revoked
  - superseded
- Exact acceptance checks represented:
  - All coverage_row_ids listed on this target are represented without broad summary substitution.
  - All source_obligation_ids, source_seed_ids, and source_shard_ids are preserved in packet metadata.
  - Rows marked missing or partial receive concrete prose or structural additions under the mapped live anchor.
- Source lineage is preserved in packet metadata for coverage rows, source obligations, source seeds, source shards, gaps, fidelity refs, span group, and writer role.

This section defines the canonical contract for this surface.

Core rules:
- The reserved built-in slash-command set is locked and non-overridable; bare /web has no default action, bare /skill is discovery or invocation only, /cancel remains a deprecated alias to /stop, and /clear stays removed.
- The /web family is locked as one slash-command family with stable command IDs, bare /web help behavior, and no flattening into separate top-level families.

Fields:
- slash prototype
- stable command ID
- subcommand-required parsing

Labels and values:
- /new
- /model
- /effort
- /mode
- /export
- /compact
- /stop
- /resume
- /web
- /skill
- /cancel
- reserved built-ins

Rules:
- /web search <query>
- /web extract <url>
- /web research <task>
- /web crawl <url>
- /web map <url>
- cmd.chat.web.search
- cmd.chat.web.extract
- cmd.chat.web.research
- /web fetch <url>
- cmd.chat.web.fetch
- cmd.chat.web.crawl
- cmd.chat.web.map
- bare /web shows help/autocomplete only
- do not flatten /web into separate slash families
- subcommand is required for execution
- URL normalization applies
- parse failure shows usage
- /cancel resolves internally to cmd.chat.stop
- /web remains discoverable in catalog
- deprecated aliases shown distinctly from active commands
- reserved commands shown as non-editable in catalog
## 7. UICommand catalog entry

<a id="UICOMMAND-ENTRY"></a>

The following UICommand ID is registered in `Plans/UI_Command_Catalog.md` for dispatching User Command execution from any invocation surface:

| Command ID | Args schema (keys only) | Expected events | Affected surfaces |
|---|---|---|---|
| `cmd.chat.run_user_command` | `{ command_name, arguments? }` | `tool.invoked` (if subtask) or `chat.message.submitted` | Assistant chat, Command palette |

Reserved slash-command UICommand IDs (`cmd.chat.new`, `cmd.chat.model`, etc.) are defined in `Plans/UI_Command_Catalog.md` §2.7 and are distinct from User Command execution.

ContractRef: ContractName:Plans/UI_Command_Catalog.md, ContractName:Plans/Contracts_V0.md#UICommand

### 7.1 Debug Mode dispatch family

Debug Mode actions use a separate canonical UICommand family, `cmd.debug.*`, for assistant-thread investigation control. These dispatch IDs are internal wiring identifiers, not User Commands, and they let Assistant Chat, the editor, and debug-adjacent surfaces invoke investigation lifecycle actions without overloading the User Command namespace.

| command_id | label | description | precondition |
|---|---|---|---|
| `cmd.debug.start` | Start Investigation | Begins a new debug investigation in current thread | `chat_active && !investigation_active` |
| `cmd.debug.stop` | End Investigation | Concludes the active investigation | `investigation_active` |
| `cmd.debug.pause` | Pause Investigation | Pauses evidence collection | `investigation_active` |
| `cmd.debug.resume` | Resume Investigation | Resumes paused investigation | `investigation_paused` |
| `cmd.debug.add_breakpoint` | Add Breakpoint | Adds a breakpoint at current editor position | `editor_active && investigation_active` |
| `cmd.debug.remove_breakpoint` | Remove Breakpoint | Removes selected breakpoint | `breakpoint_selected` |
| `cmd.debug.clear_breakpoints` | Clear All Breakpoints | Removes all breakpoints | `investigation_active && has_breakpoints` |
| `cmd.debug.view_evidence` | View Evidence | Opens evidence panel for current investigation | `investigation_active` |
| `cmd.debug.step` | Step Through | Advances to next execution point | `investigation_active && at_breakpoint` |
| `cmd.debug.collect_snapshot` | Collect Snapshot | Captures current state as evidence | `investigation_active` |

These Debug Mode dispatch IDs complement, rather than replace, the reserved slash-command surface described in `Plans/assistant-chat-design.md` and the broader UI command catalog in `Plans/UI_Command_Catalog.md`.

ContractRef: ContractName:Plans/assistant-chat-design.md, ContractName:Plans/UI_Command_Catalog.md, ContractName:Plans/Glossary.md

---

## 8. OpenCode baseline and Puppet Master deltas

### Reconciliation addendum

This addendum applies row-level transfer coverage requirements for the mapped owner anchor. Source IDs and exact source tokens are preserved in packet metadata; prose below uses canonical wording for retired legacy terms.

- Required structural headings for this packet target:
  - ### Reconciliation addendum

#### Source target target-0076
- Reconciliation action: insert_after
- Replace scope: insert_only
- Required structural headings represented:
  - ### Reconciliation addendum
- Exact required items represented:
  - The next uncovered owner-doc tranche is producing high-signal deltas, not low-value tail noise.
  - Continue the ordered sequence on this same 22-doc tranche into `GPT-5.4`; Sonnet still produced real new deltas across almost every doc.
  - GPT-5.4
  - The `GPT-5.4` wave still produced substantive owner-level deltas across the entire remaining partial tranche. This is not yet a convergence zone.
- Exact acceptance checks represented:
  - All coverage_row_ids listed on this target are represented without broad summary substitution.
  - All source_obligation_ids, source_seed_ids, and source_shard_ids are preserved in packet metadata.
  - Rows marked missing or partial receive concrete prose or structural additions under the mapped live anchor.
- Source lineage is preserved in packet metadata for coverage rows, source obligations, source seeds, source shards, gaps, fidelity refs, span group, and writer role.

<a id="BASELINE-DELTAS"></a>

Per `Plans/OpenCode_Deep_Extraction.md` §7D and §9D:

### 8.1 Baseline

OpenCode loads commands from four sources: built-in commands (`init`, `review`), config-defined commands, MCP prompts (converted to commands), and skills (registered as commands if no name collision). Discovery paths: `.opencode/commands/<name>.md` (project) and `~/.config/opencode/commands/<name>.md` (global). Template features: `$ARGUMENTS`, `$1`/`$2` positional args, `` !`shell` `` injection, `@file` inclusion. `subtask: true` runs as a subagent task. `model` override uses `provider_id/model_id` format. Custom commands can override built-in commands by name; when a user-defined command has the same name as a built-in command, the user-defined version takes precedence.

### 8.2 Puppet Master deltas

1. **Discovery paths:** Puppet Master uses `.puppet-master/commands/<name>.md` (project) and `~/.config/puppet-master/commands/<name>.md` (global) instead of `.opencode/` paths.
2. **Persona integration:** OpenCode commands specify `agent` (agent name). Puppet Master commands specify `persona` (Persona ID per `Plans/Personas.md`), which is a higher-level role definition decoupled from provider-native agent concepts.
3. **Permissions profile override:** OpenCode commands have no per-command permissions override. Puppet Master adds `permissions_profile_override` for fine-grained control.
4. **No built-in commands:** OpenCode bundles `init` and `review` as built-in commands. Puppet Master does not bundle built-in User Commands; equivalent functionality is provided through reserved slash commands (`Plans/assistant-chat-design.md` §5) and Orchestrator actions.
5. **MCP prompt integration:** OpenCode auto-converts MCP prompts to commands. Puppet Master treats MCP prompts as a separate mechanism; they are not auto-registered as User Commands.
6. **GUI management:** OpenCode has no GUI for command management. Puppet Master provides a full Commands settings screen (§6).
7. **Built-in command override policy:** OpenCode allows custom commands to freely override built-in commands by name. Puppet Master does not allow User Commands to override canonical reserved Assistant Chat slash commands. The `override_builtin` field is reserved for future non-chat extension points and MUST NOT be used to bypass reserved chat-command or reserved git/GitHub prefix rules.

ContractRef: ContractName:Plans/OpenCode_Deep_Extraction.md

---

## 9. Acceptance criteria

<a id="ACCEPTANCE"></a>

These criteria are testable assertions that MUST hold for any conforming implementation.

ContractRef: ContractName:Plans/Commands_System.md, ContractName:Plans/Progression_Gates.md

<a id="AC-CMD01"></a>
**AC-CMD01:** Project-local commands MUST override global commands with the same name. Resolution order (§2.3) MUST be deterministic.

<a id="AC-CMD02"></a>
**AC-CMD02:** User Commands MUST NOT use any reserved slash-command name (§2.4). The runtime MUST reject creation of commands with reserved names.

<a id="AC-CMD03"></a>
**AC-CMD03:** Template resolution (§4.5) MUST follow the defined order: frontmatter parse → placeholder extraction → placeholder substitution → file includes → shell injection.

<a id="AC-CMD04"></a>
**AC-CMD04:** Shell injection (`` !`command` ``) MUST be permission-checked against the `bash` key before execution. If denied, the injection MUST be blocked and an error substituted.

<a id="AC-CMD05"></a>
**AC-CMD05:** File inclusion (`@path`) MUST be permission-checked against the `read` key. If denied, the inclusion MUST be blocked and an error substituted.

<a id="AC-CMD06"></a>
**AC-CMD06:** When `subtask: true`, the command MUST execute as a child run via the `task` tool, and the parent MUST record the linkage in the event ledger.

<a id="AC-CMD07"></a>
**AC-CMD07:** The GUI Commands management section (§6) MUST validate command names on save and block saves with validation errors (reserved names, invalid format, missing description).

<a id="AC-CMD08"></a>
**AC-CMD08:** The dry-run preview (§6.2) MUST render the fully resolved template without submitting it to any agent run.

<a id="AC-CMD09"></a>
**AC-CMD09:** Every User Command MUST appear in the command palette and the chat slash-command autocomplete unless the command is unresolved.

<a id="AC-CMD10"></a>
**AC-CMD10:** User Commands MUST NOT override reserved Assistant Chat slash commands. `override_builtin` MUST NOT enable overriding canonical reserved chat commands or reserved git/GitHub prefixes.

ContractRef: PolicyRule:Decision_Policy.md§2, ContractName:Plans/Commands_System.md#COMMAND-SCHEMA

---

*Document created for planning only; no code changes.*
