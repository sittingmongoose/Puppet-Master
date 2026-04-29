# Puppet Master Rewrite Tie-In Contract (Active)

### Reconciliation addendum

This addendum applies row-level transfer coverage requirements for the mapped owner anchor. Source IDs and exact source tokens are preserved in packet metadata; prose below uses canonical wording for retired legacy terms.

- Required structural headings for this packet target:
  - ### Reconciliation addendum

#### Source target target-0639
- Reconciliation action: insert_after
- Replace scope: insert_only
- Required structural headings represented:
  - ### Reconciliation addendum
- Exact required items represented:
  - `archived` means lane/worktree metadata and lineage stay visible, but the live execution surface is no longer active
  - archived
  - lifecycle already includes `active`, `acknowledged`, `resolved`, `dismissed`
  - active
  - acknowledged
  - resolved
  - dismissed
  - lifecycle includes `active`, `acknowledged`, `resolved`, `dismissed`
  - Without a help-entry contract, complex rewrite terms may end up redefined inconsistently across surfaces.
  - active blockers must not be dismissible into fake health
  - `active -> acknowledged -> resolved -> dismissed`
  - active -> acknowledged -> resolved -> dismissed
  - `activity_state` (`idle | active | background_active | historical_only`)
  - activity_state
  - idle | active | background_active | historical_only
  - optional `project_attention_index.v1:{project_id}` if needed for efficient active ordering/counts
  - project_attention_index.v1:{project_id}
  - `status` (`active | cooled_down | resolved | invalidated`)
  - status
  - active | cooled_down | resolved | invalidated
  - lifecycle state (`active | suspect | restoring | retained | cleanup_eligible | archived | removed`)
  - active | suspect | restoring | retained | cleanup_eligible | archived | removed
  - currently active blocked/recovery/runtime gating anchors when applicable
  - The only stronger navigation-like primitive visible at the contract layer today is `resume_url`, primarily in wizard-blocked / clarification flows. That makes `resume_url` more semantically powerful than the general UI command contract, which is the wrong layering for the rewrite.
  - resume_url
  - The key remaining question is breadth: how many authored `Plans/*.md` docs are still only Gemini or otherwise below full requested model coverage.
  - Plans/*.md
  - `Plans/rewrite-tie-in-memo.md`
  - Plans/rewrite-tie-in-memo.md
  - `Orchestrator_Page.md` mixes newer blocked/remediation lineage work with older `TierChanged` / `active tier` assumptions.
  - Orchestrator_Page.md
  - TierChanged
  - active tier
  - worker output filtered by active `tier_id`
  - tier_id
  - Shell / promoted-feature / UI owner drift remains active:
  - Provider/runtime identity findings are still active:
  - Coverage has been re-audited after the merge: `39` top-level `Plans/*.md` docs are full six-pass complete and the remaining `22` docs are now uniformly at five passes.
  - 39
  - 22
  - After this merge, the authored top-level `Plans/*.md` surface is fully covered: all `61` docs now have all six requested model passes.
  - 61
  - `Plans/rewrite-tie-in-memo.md` is comparatively ahead on provider/runtime identity:
  - `gap-001` is no longer best described as `missing_data_shape`; the owner docs already carry `requested_account_binding`, `requested_account_policy`, and `tool_use_id`, so the live blocker is split owner anchors plus active `TierContext` / `tier_id` survivor residue.
  - gap-001
  - missing_data_shape
  - requested_account_binding
  - requested_account_policy
  - tool_use_id
  - TierContext
- Exact acceptance checks represented:
  - All coverage_row_ids listed on this target are represented without broad summary substitution.
  - All source_obligation_ids, source_seed_ids, and source_shard_ids are preserved in packet metadata.
  - Rows marked missing or partial receive concrete prose or structural additions under the mapped live anchor.
- Source lineage is preserved in packet metadata for coverage rows, source obligations, source seeds, source shards, gaps, fidelity refs, span group, and writer role.

> **Compliance:** This document follows `Plans/DRY_Rules.md` and references SSOT contracts in `Plans/Contracts_V0.md`. Naming: “Puppet Master” only. No open questions; deterministic defaults per `Plans/Decision_Policy.md`.


> This document exists to keep the rest of `Plans/` consistent as the rewrite is implemented.
> It records locked architectural decisions and the required implementation contracts for existing plans.
> For navigation across all plan docs, see `Plans/00-plans-index.md`.

---

## Provided memo (verbatim)

This project is moving to a single, deterministic "agent loop" architecture where every backend is just a **Provider** behind one unified session/event store, tool registry, and patch/edit pipeline (so CLI-bridged providers don't become special-case chaos). This is intentionally adapting much of **OpenCode's architecture** (provider abstraction, centralized config, session orchestration, tool registry) to address current pain points and make the main engine deterministic and reliable. [web:7][web:11][web:69][web:71]

### What's changing (high level)

### Orchestrator rewrite canonicalization lock (2026-03-17)
The orchestrator rewrite is now locked to these cross-doc decisions:
- node graph is the canonical execution model
- `Feature Seam` and `Work Package` are first-class graph-owned objects
- `Node` remains the smallest executable unit
- `Package Overseer` and `Seam Overseer` are governance roles, not hidden schedulers
- `Locally Complete`, `Available to Seam`, and `Seam Complete` remain distinct promotion states
- weak integration remains first-class and blocks seam completion when integration quality is insufficient
- graph patching creates a new graph generation while preserving historical superseded paths as visible lineage
- Orchestrator is tab-first with `Progress`, `Seams`, `Node Graph`, `Evidence`, `History`, and `Ledger`
- `Progress` is the only widget-composed Orchestrator tab
- Source Control remains compact and worktree-first while Orchestrator carries lane/package/seam operational context
- shared requested/effective runtime identity spans conversational actors and orchestration actors without collapsing them into one ontology
- `route_target` and `OpenSubject` are canonical navigation/source-open primitives

ContractRef: ContractName:Plans/Orchestrator_Page.md, ContractName:Plans/Run_Graph_View.md, ContractName:Plans/Crosswalk.md
- **GUI rewrite:** Desktop UI is switching to Rust + Slint, with Slint's cross-platform **winit backend** for Windows/macOS/Linux. [web:149]
- **Renderer decision (locked):** default is **winit + Skia**, fallback GPU is **winit + FemtoVG-wgpu**, and we keep an emergency software fallback for compatibility; selection can be controlled via Slint's backend selection mechanisms (e.g., `BackendSelector` and/or `SLINT_BACKEND`). [web:48][web:149]
- **Theme behavior (locked):** theme switching will be supported, but it's acceptable to require an app **restart**; we will offer both a "Puppet Master default" look and a "Basic theme."
- **Storage rewrite (no SQLite):** storage becomes a multi-store design: `seglog` as the canonical append-only event ledger, `redb` for durable KV state/projections/settings, and Tantivy for full-text search over chats/docs/log summaries. [web:88][web:90][web:82]
- **Search & dashboards:** "fast search for humans + AI" is implemented via Tantivy indexes built from projected events/messages, while heavy analytics scans run off the append-only seglog stream and store rollups into redb. [web:82][web:88][web:90]

### The core reliability plan (what other features must align with)
- The system must be reproducible: sessions/runs are replayable from a canonical event stream (seglog), with deterministic projections into redb/Tantivy and checkpointing for resumability after crashes. [web:88][web:90][web:82]
- Tools are governed by a central policy engine (permissions + validation + normalized tool results), and edits go through an explicit patch/apply/verify/rollback pipeline (often using worktrees/branches/sandboxes) to prevent "silent corruption." (This mirrors the discipline implied by OpenCode-style tool/session separation.) [web:71][web:69]
- The "Plans/" documentation set is intended to be treated as the authoritative requirements source for orchestration states, safe-edit rules, subagents, worktree/git edge cases, and tooling behavior (so implementation doesn't drift via ad-hoc UI wiring). (This is a project governance rule, not a library detail.)
- **Resume semantics (rewrite-level):** resumability means Puppet Master restarts from the last durable safe boundary recorded in canonical storage/projector state. It does not imply provider-process or transport-session reattachment.
- **SSOT routing:** replay/checkpoint/rebuild semantics are owned by `Plans/storage-plan.md`; normalized provider-stream behavior is owned by `Plans/CLI_Bridged_Providers.md`; centralized tool-policy/result normalization is owned by `Plans/Tools.md`.

### Provider + CLI integrations (what's being hardened)
- **Claude Code CLI** is integrated as a Provider using the official CLI's machine-readable streaming mode (`--output-format stream-json`, print mode `-p`, optional partials via `--include-partial-messages`) and uses **Claude Code Hooks** (e.g., `PreToolUse`, `PostToolUse`) to gate tools and enrich telemetry. [page:3]
- **Cursor Agent CLI** is integrated as a Provider using `--print --output-format stream-json` (NDJSON stream) and internal parsing into the unified event model. [web:157]
- **ACP note (important):** Cursor CLI is not ACP-native as of a Cursor staff reply (2026-01-04); Cursor CLI supports MCPs and may add ACP later, so if ACP is needed it's via an adapter layer on our side (not because Cursor suddenly "speaks ACP"). [web:167]

### Gemini auth decision (locked)
- Gemini is one **DirectApi** provider with mixed OAuth and API-key account pools under the shared provider runtime.
- The default Gemini `requested_auth_mode` is `auto`, and the provider-default auth-surface preference is OAuth first, then API key, unless project/run policy overrides it.
- OAuth and API key are distinct Gemini auth surfaces / quota planes and MUST NOT be presented as the same plan or bucket.
- Gemini API key remains the explicit allowed exception to the broader subscription-first / avoid-API-keys guidance.
- Requested vs effective auth/account identity MUST be visible across prompt assembly, storage, setup/health, usage, and runtime reporting.
- Media follows the same requested/effective Gemini auth/account rules as regular Gemini usage.

ContractRef: ContractName:Plans/Multi-Account.md, ContractName:Plans/Prompt_Pipeline.md#EFFECTIVE-RESOLUTION-RECORD, ContractName:Plans/storage-plan.md
### Future mobile/web clients (impacts architecture now)

### Reconciliation addendum

This addendum applies row-level transfer coverage requirements for the mapped owner anchor. Source IDs and exact source tokens are preserved in packet metadata; prose below uses canonical wording for retired legacy terms.

- Required structural headings for this packet target:
  - ### Reconciliation addendum

#### Source target target-0641
- Reconciliation action: insert_after
- Replace scope: insert_only
- Required structural headings represented:
  - ### Reconciliation addendum
- Exact required items represented:
  - `[retired-token-2]` now shows an explicit same-file contradiction: `[retired-token-1]` declares fields that its own constructor does not populate, while file-based coordination is simultaneously described as canonical and as a derived/debug mirror.
  - [retired-token-2]
  - [retired-token-1]
- Legacy token retirement handling:
  - Retired token #1 is preserved exactly in packet metadata and must be omitted, replaced by canonical wording, or documented only as an explicitly deprecated legacy alias in live prose.
  - Retired token #2 is preserved exactly in packet metadata and must be omitted, replaced by canonical wording, or documented only as an explicitly deprecated legacy alias in live prose.
- Exact acceptance checks represented:
  - All coverage_row_ids listed on this target are represented without broad summary substitution.
  - All source_obligation_ids, source_seed_ids, and source_shard_ids are preserved in packet metadata.
  - Rows marked missing or partial receive concrete prose or structural additions under the mapped live anchor.
  - All exact_stale_tokens_to_retire are removed, reframed as explicitly deprecated, or preserved only as documented legacy aliases.
- Source lineage is preserved in packet metadata for coverage rows, source obligations, source seeds, source shards, gaps, fidelity refs, span group, and writer role.
- Mobile/web clients will be "thin" and connect back to the desktop app (desktop acts like a local server), so the stable boundary is the unified event model + streaming API (runs/events/artifacts) and command API (start run, approve tool, cancel run), rather than direct access to providers/tools on mobile/web.
- Thin clients MUST NOT call providers, tool executors, or local patch pipelines directly. They consume streamed events/artifacts and send command requests to the desktop-owned core only.

### Implementation directives (required now)
- Implement features against the locked interfaces: **unified event model**, **Provider trait**, **tool registry**, and **event-sourced session store** (seglog -> projections). [web:69][web:88][web:90]
- UI updates must flow through the Slint event loop boundary and must not rely on delayed or ad-hoc polling paths.
- New plan text and implementation notes must use **Provider** terminology for execution integration; do not introduce new platform-runner phrasing in updated sections.
- Persistence and search paths must use seglog/redb/Tantivy contracts directly; do not add SQLite-based alternatives in edited sections.
- The Slint rewrite MUST remove all per-platform experimental settings: Settings > Advanced MUST NOT include an "Experimental features" section or per-platform "Enable Codex/Gemini/Copilot Experimental" toggles, config schemas MUST NOT include per-platform `experimentalEnabled` (or equivalent) keys, and provider invocations MUST NOT rely on provider-side experimental toggles (e.g., Copilot `--experimental` CLI flag, or legacy Gemini experimental settings) for runtime behavior. DirectApi providers (Codex, Copilot, Gemini) MUST expose only stable capabilities through their APIs, and CliBridge providers (Cursor, Claude Code) MUST NOT grow experimental toggles in the GUI or config.
  ContractRef: ContractName:Plans/CLI_Bridged_Providers.md, ContractName:Plans/FinalGUISpec.md
- Assistant memory is an Assistant-only continuity capability and MUST NOT alter Provider spine contracts, unified event model ownership, or shared rules pipeline semantics; implementation is specified in `Plans/assistant-memory-subsystem.md`.
  Note: Gist generation is artifact-driven (AutoRunBoundary/AutoMilestone) and remains Assistant-only; it does not change system SSOT ownership.
  ContractRef: ContractName:Plans/assistant-memory-subsystem.md#1-capability-boundary, ContractName:Plans/assistant-memory-subsystem.md#2-physical-storage-layout, ContractName:Plans/assistant-memory-subsystem.md#5-verification-and-triggers, ContractName:Plans/agent-rules-context.md, ContractName:Plans/storage-plan.md

---

## Impacts on existing Plans (deltas to keep consistency)

### Immediate contradictions to resolve in Plans (so requirements do not fight each other)

### Reconciliation addendum

This addendum applies row-level transfer coverage requirements for the mapped owner anchor. Source IDs and exact source tokens are preserved in packet metadata; prose below uses canonical wording for retired legacy terms.

- Required structural headings for this packet target:
  - ### Reconciliation addendum

#### Source target target-0642
- Reconciliation action: insert_after
- Replace scope: insert_only
- Required structural headings represented:
  - ### Reconciliation addendum
- Exact required items represented:
  - This tranche mostly inherits contradictions from stronger owner docs instead of inventing new ones.
- Exact acceptance checks represented:
  - All coverage_row_ids listed on this target are represented without broad summary substitution.
  - All source_obligation_ids, source_seed_ids, and source_shard_ids are preserved in packet metadata.
  - Rows marked missing or partial receive concrete prose or structural additions under the mapped live anchor.
- Source lineage is preserved in packet metadata for coverage rows, source obligations, source seeds, source shards, gaps, fidelity refs, span group, and writer role.
The following contradictions must be retired during reconciliation so the rewrite does not preserve parallel canon.

ContractRef: ContractName:Plans/Contracts_V0.md, ContractName:Plans/Multi-Account.md, ContractName:Plans/FinalGUISpec.md

- **Provider split:** retire any wording that treats Gemini direct and Gemini CLI as one mixed provider surface.
- **Direct-provider canon:** retire any wording that describes Codex or GitHub Copilot as CLI-driven runtime providers in PM.
- **OpenCode ontology:** retire `server` / `cli_launcher` language that obscures the canonical `Managed Server` / `Attach to Existing Server` server-profile model.
- **Runtime vocabulary:** keep `requested_platform` / `effective_platform` canonical and add family/runtime-platform/billing fields additively rather than minting a parallel primary vocabulary.
- **Skill and MCP ownership:** retire any wording that makes provider-native skill or MCP configuration the primary runtime path; PM-native skills and PM-native MCP remain canonical.
- **Cursor runtime boundary:** retire `--user-data-dir` as the CLI multi-account isolation contract; PM-managed `HOME` / `XDG_*` roots for `cursor-agent` are the canonical CLI boundary.
- **Terminal/editor GUI canon:** retire the older flat bottom-terminal strip, single editor dock slot, and separate command-log strip assumptions in favor of workgroups, subtabs, split-pane trees, multi-panel editor terminal stack, and explicit DnD semantics.

ContractRef: ContractName:Plans/CLI_Bridged_Providers.md, ContractName:Plans/Provider_OpenCode.md, ContractName:Plans/assistant-chat-design.md
### Storage consistency
- All run/session/artifact/checkpoint persistence and event emission must align with **Plans/storage-plan.md** (seglog writer, redb schema, projector pipeline, analytics scan).
- When adding or editing plans that touch runs, sessions, settings, or artifacts, add a cross-reference to storage-plan.md and specify whether the plan assumes seglog events, redb tables, or both.
- **Plans/storage-plan.md** -- Canonical storage checklist (seglog, redb schema, projectors, analytics); other plans that persist state or emit events should reference it and call out seglog vs redb.

### Plans likely needing the most rewrite-aware edits

### Reconciliation addendum

This addendum applies row-level transfer coverage requirements for the mapped owner anchor. Source IDs and exact source tokens are preserved in packet metadata; prose below uses canonical wording for retired legacy terms.

- Required structural headings for this packet target:
  - ### Reconciliation addendum

#### Source target target-0643
- Reconciliation action: insert_after
- Replace scope: insert_only
- Required structural headings represented:
  - ### Reconciliation addendum
- Exact required items represented:
  - revoke should likely be `strong`
  - strong
  - Likely required fields:
  - likely `wizard_id -> run_id`
  - wizard_id -> run_id
  - likely owner docs:
  - likely fields:
- Exact acceptance checks represented:
  - All coverage_row_ids listed on this target are represented without broad summary substitution.
  - All source_obligation_ids, source_seed_ids, and source_shard_ids are preserved in packet metadata.
  - Rows marked missing or partial receive concrete prose or structural additions under the mapped live anchor.
- Source lineage is preserved in packet metadata for coverage rows, source obligations, source seeds, source shards, gaps, fidelity refs, span group, and writer role.

- `Plans/newfeatures.md`
  - keep treating it as historical/origin material only; promoted browser/debug/runtime behavior now lives in the reconciled owner docs
- `Plans/assistant-chat-design.md`
  - keep chat-mode UX and slash-command behavior, but reconcile the mode strip, Investigation Context, and visible-vs-hidden evidence ingress with the rewrite storage/prompt model
- `Plans/Run_Modes.md`, `Plans/Permissions_System.md`, and `Plans/storage-plan.md`
  - keep the rewrite runtime/persistence model authoritative and ensure Debug stays an overlay, not a fifth runtime enum or a hidden global permission profile
- `Plans/Prompt_Pipeline.md` and `Plans/Contracts_V0.md`
  - carry Investigation Context, event types, and bounded attachment semantics through the canonical prompt/event contracts rather than leaving them as UI-only ideas
- `Plans/Section15_MVP_Promoted_Features_Spec.md`, `Plans/FinalGUISpec.md`, `Plans/UI_Command_Catalog.md`, and `Plans/Runtime_Artifacts_Panel.md`
  - retire stale browser / bottom-panel / `Debug` wording, keep Debug Mode distinct from the classical debugger surface, and preserve the visible browser-evidence contract
- `Plans/Tools.md`, `Plans/newtools.md`, and `Plans/GitHub_Integration.md`
  - keep debug-capable tooling cross-surface, registry-driven, remote-authority-safe, and compatible with the shared artifact/doctor pipeline

ContractRef: ContractName:Plans/assistant-chat-design.md, ContractName:Plans/Run_Modes.md, ContractName:Plans/Section15_MVP_Promoted_Features_Spec.md

### Plans that are still conceptually valid (but should be reworded)

### Reconciliation addendum

This addendum applies row-level transfer coverage requirements for the mapped owner anchor. Source IDs and exact source tokens are preserved in packet metadata; prose below uses canonical wording for retired legacy terms.

- Required structural headings for this packet target:
  - ### Reconciliation addendum

#### Source target target-0644
- Reconciliation action: insert_after
- Replace scope: insert_only
- Required structural headings represented:
  - ### Reconciliation addendum
- Exact required items represented:
  - `usage-feature.md` still aggregates around `tier_id`
  - usage-feature.md
  - tier_id
  - Proposed fields conceptually:
  - `view export` is still useful, but should be clearly labeled as a convenience format.
  - view export
  - but downstream docs still do not consistently model `requested identity` alongside verified/effective identity
  - requested identity
  - but downstream docs still use those names normatively or mix them with canonical names
  - some docs still normalize around `requested_persona_id` / `effective_persona_id`
  - requested_persona_id
  - effective_persona_id
  - `provider_account_id` remains risky because Sonnet reinforces that it still conflicts conceptually with `effective_provider_identity`
  - provider_account_id
  - effective_provider_identity
  - `persona_override_owner_id` still allows `tier_id`
  - persona_override_owner_id
  - `Prompt_Pipeline.md` still lacks `actor_kind` / `execution_role`
  - Prompt_Pipeline.md
  - actor_kind
  - execution_role
  - `requested_account_policy` still remains necessary.
  - requested_account_policy
  - but prompt/runtime/storage schemas still have no parallel operational-identity block
  - useful for UI/ledger/history/debuggability, but not required to make dispatch valid:
  - GPT-5.2 still surfaced real owner-level deltas rather than mere restatement, especially where docs are failing mechanically rather than conceptually.
  - `generated://<artifact_id>` is discussed as a transport/resulting buffer, but the docs still need to guard against treating it like the durable identity.
  - generated://<artifact_id>
  - Remaining Gemini-only docs are not low-value leftovers; many still hide active owner gaps in indices/checklists/policies and subsystem plans.
  - `OpenFile` remains narrower still:
  - OpenFile
  - `thread_blocked_notice` and `wizard_runtime_state` are also still mixed:
  - thread_blocked_notice
  - wizard_runtime_state
  - `tier_runtime_record` is still named as canonical
  - tier_runtime_record
  - `Run_Graph_View.md` still exposes `hitl_request_id`
  - Run_Graph_View.md
  - hitl_request_id
  - Still login-keyed rather than stably account-keyed.
  - GATE-010 text improved, but the supporting evidence schema/matrix model still lags
- Exact acceptance checks represented:
  - All coverage_row_ids listed on this target are represented without broad summary substitution.
  - All source_obligation_ids, source_seed_ids, and source_shard_ids are preserved in packet metadata.
  - Rows marked missing or partial receive concrete prose or structural additions under the mapped live anchor.
- Source lineage is preserved in packet metadata for coverage rows, source obligations, source seeds, source shards, gaps, fidelity refs, span group, and writer role.
- `Plans/FileSafe.md`
  - Safety/policy intent remains valid; implementation should target patch/apply/verify/rollback and centralized tool governance rather than UI-level/file-manager specifics
- `Plans/WorktreeGitImprovement.md`, `Plans/MiscPlan.md`
  - Worktree/cleanup correctness stays valid; hook/crew sections should point to a single shared lifecycle framework in the new agent-loop core

---

## Suggested "single source of truth" rule for the rewrite

- Provider contracts, unified event model, tool registry, and patch pipeline should be specified in one canonical plan (or one canonical spec section), and other plans should reference it instead of re-describing it

## Unified Document/Media Rendering Contract (2026-03-07)

This addendum locks the rewrite-level rendering contract for Markdown, Mermaid, HTML, SVG, and image viewing.

### Locked architecture

- The rewrite uses a **Slint shell + native Rust document core + isolated preview/browser runtime** split.
- The architecture is **unified across chat, file editor, embedded document panes, detached preview windows, and browser surfaces**. Do not create separate ad-hoc rendering stacks for Markdown preview, Mermaid preview, and HTML preview.
- The canonical saved artifact remains source text or file bytes:
  - Markdown is canonical as Markdown text.
  - Mermaid is canonical as fenced `mermaid` Markdown blocks or `.mmd` text.
  - HTML remains canonical as HTML source files.
  - Images remain canonical as image files.
- Rendered DOM/SVG/preview state is a projection and must never become the hidden source of truth.

### Preview session contract

### Reconciliation addendum

This addendum applies row-level transfer coverage requirements for the mapped owner anchor. Source IDs and exact source tokens are preserved in packet metadata; prose below uses canonical wording for retired legacy terms.

- Required structural headings for this packet target:
  - ### Reconciliation addendum

#### Source target target-0645
- Reconciliation action: insert_after
- Replace scope: insert_only
- Required structural headings represented:
  - ### Reconciliation addendum
- Exact required items represented:
  - no named `route_target` / `OpenSubject` contract tie even though subject-first preview identity already exists
  - route_target
  - OpenSubject
- Exact acceptance checks represented:
  - All coverage_row_ids listed on this target are represented without broad summary substitution.
  - All source_obligation_ids, source_seed_ids, and source_shard_ids are preserved in packet metadata.
  - Rows marked missing or partial receive concrete prose or structural additions under the mapped live anchor.
- Source lineage is preserved in packet metadata for coverage rows, source obligations, source seeds, source shards, gaps, fidelity refs, span group, and writer role.

### Generated artifact identity and open-source contract

Not every previewable source has a stable workspace path. The rendering system therefore distinguishes preview subjects as either document-backed or artifact-backed.

#### Preview subject classes
- `doc:<document_id>` — workspace file or other persistent project document
- `artifact:<artifact_id>` — previewable content without a stable workspace path at creation time

#### Required artifact-backed cases
`artifact_id` is REQUIRED for:
- chat message Markdown/Mermaid blocks
- assistant-created unsaved documents
- planning-document drafts that exist before file persist
- generated review/inspection documents opened from chat or document panes

#### Minimum artifact metadata
- `artifact_id`
- `artifact_kind` (`chat_message_block`, `assistant_draft_document`, `planning_draft`, `generated_doc`)
- `source_kind`
- `origin_surface`
- `thread_id` when chat-backed
- `message_id` when message-backed
- `source_revision`
- optional `backing_document_id`
- optional `last_saved_path`

#### Canonical join key
Storage and runtime projectors may derive `preview_subject_id = doc:<document_id>` or `artifact:<artifact_id>` as the stable join key for restore, UI state, and audit summaries.

#### `open_source` rules
- `doc:*` opens the real workspace buffer/file.
- `artifact:*` opens a transient source buffer with URI `generated://<artifact_id>`.
- A transient `generated://` buffer is authoritative for user inspection/editing until the user explicitly saves or inserts it into a workspace file.
- `open_source` for message-backed Mermaid/Markdown MUST NOT silently invent a workspace file on disk.

#### Save/link rules
- `Save As` or `Insert into file` creates the first stable workspace path for an artifact-backed source.
- After first persist, runtime state records the linkage from `artifact_id` to `document_id`, but the original `artifact_id` remains valid for audit/history.

#### PreviewSession lifecycle and identity contract

`PreviewSession` is a durable runtime contract for rendered subject identity, but browser-capable surfaces layer a distinct browser-session identity on top of preview identity so that browser tabs, detached windows, automation sessions, and auth sessions do not collapse into one broad preview-instance model.

**Lifecycle states**
- `created`
- `loading`
- `ready`
- `stale`
- `degraded`
- `error`
- `closed`

ContractRef: ContractName:Plans/storage-plan.md, ContractName:Plans/Section15_MVP_Promoted_Features_Spec.md, ContractName:Plans/FileManager.md

**Identity rules**
- moving the same preview subject between source-linked preview surfaces keeps the same `preview_session_id` when `preview_subject_id`, `source_revision`, `preview_surface_kind`, and `transport_mode` remain unchanged
- browser-capable surfaces additionally carry a distinct `browser_session_id` and `session_class`
- detaching normal browsing is an attachment change, not a new preview subject, unless the user explicitly creates separate detached state
- `bottom_panel_browser` is not a canonical attachment target

ContractRef: ContractName:Plans/FinalGUISpec.md, ContractName:Plans/storage-plan.md, ContractName:Plans/Permissions_System.md

**Attachment rules**
- a single `PreviewSession` MAY be visible in multiple read-only surfaces at the same time
- only one attachment may hold mutation-capable focus at a time
- `attached_surface` is the currently focused attachment; additional viewers are tracked as secondary attachments in runtime state
- canonical attachment targets are `chat_card`, `editor_preview`, `embedded_doc_pane`, `editor_browser_tab`, and `detached_window`

ContractRef: ContractName:Plans/FileManager.md, ContractName:Plans/FinalGUISpec.md, ContractName:Plans/storage-plan.md

**Persistence and audit expectations**
- the app MUST persist enough state to restore the user's last preview mode, last successful attachment target, and last visible preview error per subject
- the app MUST NOT persist live DOM state or browser storage as part of `PreviewSession` state
- preview lifecycle changes MUST emit canonical events in `storage-plan.md` and be invocable through canonical UI commands in `UI_Command_Catalog.md`
- browser-linked runtime artifacts retain explicit `browser_session_id` and `session_class` linkage rather than inventing a separate browser-recording shell

ContractRef: ContractName:Plans/storage-plan.md, ContractName:Plans/UI_Command_Catalog.md, ContractName:Plans/Runtime_Artifacts_Panel.md

**Minimum restore rule**
- on restart, the product restores preview intent (`none`, `inline`, `split`, `browser_tab`, `detached`) and reconstructs a new live runtime session as needed; it does not attempt to deserialize an old live browser instance
- normal browser sessions restore according to profile scope and session class
- live automation/auth sessions do not silently resume active work after restart

ContractRef: ContractName:Plans/storage-plan.md, ContractName:Plans/Section15_MVP_Promoted_Features_Spec.md, ContractName:Plans/Permissions_System.md

Minimum preview-layer state:
- `preview_session_id`
- `preview_subject_id`
- `source_kind` (`markdown`, `mermaid`, `html`, `svg`, `image`, `generated_doc`, `browser_page`)
- `preview_surface_kind` (`generated_restricted`, `browser_capable`, `native_image_surface`)
- `transport_mode` (`internal_preview_origin`, `browser_runtime`, `native_image_surface`)
- `source_revision`
- `preview_revision`
- `attached_surface`
- `capabilities`

Browser-session overlay state:
- `browser_session_id`
- `session_class`
- `requested_browser_runtime`
- `effective_browser_runtime`
- `requested_capabilities`
- `effective_capabilities`
- `capability_degradations`
- `blocked_actions`
- `permission_tier`
- `profile_scope`
- `restore_policy`
- `takeover_state`

ContractRef: ContractName:Plans/storage-plan.md, ContractName:Plans/Section15_MVP_Promoted_Features_Spec.md, ContractName:Plans/Contracts_V0.md

### Transport and trust split

#### Generated preview runtime contract

Generated Markdown/Mermaid/read-only previews share one internal runtime contract.

**Internal origin**
- Canonical generated-preview origin: `pm-preview://session/<preview_session_id>/`
- Generated preview assets are app-bundled or app-served only; they are not loaded from arbitrary remote origins.

**Bootstrap and CSP**
- Generated preview pages MUST ship with a restrictive CSP that allows only the app-controlled preview assets required for rendering.
- Generated preview pages MUST NOT enable arbitrary remote script execution.
- Generated preview pages MUST NOT reuse workspace-browser cookies/storage by default.

**Sanitization**
- Markdown-derived HTML MUST be sanitized before it reaches the preview runtime.
- Sanitization MUST preserve only the metadata attributes required for source mapping and preview actions:
  - `data-pm-node-id`
  - `data-pm-block-kind`
  - `data-pm-source-start`
  - `data-pm-source-end`
  - `data-pm-parse-revision`
  - `data-pm-capabilities`

**Preview bridge allowlist**
The generated-preview bridge is narrow by design. Allowed bridge actions in v1:
- `open_source`
- `open_detached`
- `request_edit`
- `export_svg`
- `export_png`
- `copy_svg`
- `copy_image`

No other host command family is implicitly available to generated previews.

#### Canonical rendering stack
To keep implementations aligned, the rewrite uses these canonical libraries unless a later lock section supersedes them:
- Markdown parse/mapping: `pulldown-cmark`
- Rendered code highlighting: `syntect`
- Generated HTML sanitization: `ammonia`
- Mermaid validation: Mermaid parse/detect-type validation before render
- SVG/PNG export pipeline: `resvg` + `usvg` + `tiny-skia`

- **Full HTML/browser mode** uses a loopback localhost preview server rooted to the workspace/project context.
- **Generated Markdown/Mermaid/read-only previews** use an internal preview origin/route controlled by the app.
- `WebViewBuilder::with_html` is not the primary preview transport.
- Generated previews are in a **restricted trust tier**:
  - sanitize generated HTML before it reaches the preview runtime
  - keep JavaScript minimal and preview-runtime-specific
  - do not allow arbitrary file access or arbitrary network behavior as part of the preview contract
- Full HTML/browser mode is a **separate trust tier** and must not inherit source-mutation privileges by default.

### Platform contract

#### Platform runtime matrix and degraded-mode UX

The rendering system must define one browser product model across supported desktop platforms: a PM-managed pinned bundled CEF-class Chromium runtime with editor-tab primary hosting and first-class detached windows.

| Platform | Embedded browser status | Guaranteed path | Runtime dependency | Required degraded UX |
|---|---|---|---|---|
| Windows | supported through the PM-managed bundled Chromium runtime | editor-tab browser plus detached window on the same PM browser model | PM-managed bundled Chromium runtime | show `runtime_unavailable` remediation and keep source/native surfaces usable |
| macOS | supported through the PM-managed bundled Chromium runtime | editor-tab browser plus detached window on the same PM browser model | PM-managed bundled Chromium runtime | show `runtime_unavailable` remediation and keep source/native surfaces usable |
| Linux X11 | supported through the PM-managed bundled Chromium runtime | editor-tab browser plus detached window on the same PM browser model | PM-managed bundled Chromium runtime plus platform prerequisites required by the chosen embedding path | show `runtime_unavailable` remediation and keep source/native surfaces usable |
| Linux Wayland | supported through the same PM browser abstraction with platform-specific embedding details hidden behind the PM bridge | editor-tab browser plus detached window on the same PM browser model | PM-managed bundled Chromium runtime plus platform prerequisites required by the chosen embedding path | show `runtime_unavailable` remediation and keep source/native surfaces usable |

ContractRef: ContractName:Plans/Section15_MVP_Promoted_Features_Spec.md, ContractName:Plans/FinalGUISpec.md, ContractName:Plans/Permissions_System.md

**Required doctor/preflight checks**
- bundled browser runtime is present and healthy
- browser runtime version matches the app-managed expected runtime set
- browser startup path is healthy for the current platform session
- editor-tab browser host and detached browser host can both be validated under the same PM browser abstraction

ContractRef: ContractName:Plans/newtools.md, ContractName:Plans/Permissions_System.md, ContractName:Plans/storage-plan.md

**Required degraded behavior**
- generated Markdown/Mermaid preview failure must keep source usable
- browser runtime failure must use explicit user-facing remediation and MUST NOT silently swap to an unrelated legacy webview/browser model
- blank panes and screenshot-only substitution are not acceptable steady-state fallback behavior for browser-class surfaces
- browser capability degradations must remain visible through requested/effective runtime disclosure rather than being hidden behind platform heuristics

ContractRef: ContractName:Plans/Section15_MVP_Promoted_Features_Spec.md, ContractName:Plans/Permissions_System.md, ContractName:Plans/storage-plan.md

### Source/preview mapping and edit contract

Preview mutation and document annotation are related but distinct contracts. Direct preview mutation remains a validated shared-buffer patch path; annotation and chat handoff remain review-layer operations until an explicit direct-edit bridge is invoked.

#### Preview action protocol v1

All successful preview mutations resolve to canonical text patches against the same shared buffer model used by File Editor.

**Operation payloads**
- `toggle_checkbox` -> `{ target_state?: boolean }`
- `edit_heading_text` -> `{ replacement_text }`
- `edit_list_item_text` -> `{ replacement_text }`
- `set_link_target` -> `{ href, title? }`
- `set_inline_format` -> `{ format: "bold" | "italic" | "code", enable }`
- `replace_mermaid_block` -> `{ replacement_source }`

ContractRef: ContractName:Plans/FileManager.md, ContractName:Plans/FinalGUISpec.md

**Patch rules**
- The runtime MUST resolve `node_id` against the current parse tree for the provided `parse_revision`.
- The runtime MUST validate `source_revision` before patch application.
- The resulting patch MUST stay constrained to the mapped source span for that node or block.
- Requests MUST fail with `ambiguous_mapping` when the requested operation would require modifying text outside the mapped node span.
- Requests MUST fail with `unsupported_region` for raw HTML regions, malformed Markdown regions, unknown extensions, and opaque fenced content.

ContractRef: ContractName:Plans/FileManager.md, ContractName:Plans/Permissions_System.md

**Shared-buffer integration**
- Successful preview edits apply through the same in-memory buffer/update path as File Editor.
- Successful preview edits MUST update dirty state, undo/redo history, and downstream preview re-render using the existing editor/document pipeline.
- Preview actions MUST NOT write directly to disk and MUST NOT bypass the normal save path.
- Each successful preview action creates one undo step unless the host editor later adds explicit coalescing rules.

ContractRef: ContractName:Plans/FileManager.md, ContractName:Plans/storage-plan.md

**UI outcomes and result codes**
- On `applied_patch`, the source buffer and rendered preview update to the new `source_revision`.
- On `rejected_stale_revision`, `ambiguous_mapping`, or `unsupported_region`, the UI focuses source at the mapped region when possible and shows a deterministic user-facing reason.
- Direct preview mutation result codes remain: `applied_patch`, `rejected_stale_revision`, `unsupported_region`, `ambiguous_mapping`, `permission_denied`, `fallback_focus_source`, and `render_error`.

ContractRef: ContractName:Plans/FinalGUISpec.md, ContractName:Plans/Crosswalk.md

#### Selection annotations and chat handoff boundary

Selection actions such as `comment`, `replace`, `insert_after`, `remove`, and `send_selection_to_chat` are not direct preview-mutation operations.

- On source-backed or deterministically mapped preview surfaces, selection actions may create durable annotations or `document_selection_context` attachments.
- On no-source-map or unsupported regions, mutating annotation actions MUST fail as non-destructive outcomes while `send_selection_to_chat`, `open_source`, and `open_detached` may still succeed.
- Chat and planning surfaces may issue non-destructive selection handoff only until they are explicitly wired to the validated mutation path.
- Audit must distinguish `created_annotation`, `selection_sent_to_chat`, and `selection_forward_blocked` from direct patch outcomes.

ContractRef: ContractName:Plans/assistant-chat-design.md, ContractName:Plans/storage-plan.md, ContractName:Plans/FileSafe.md

### Markdown/Mermaid contract

- Use a Rust Markdown parser/mapping pipeline as the canonical Markdown source analysis layer.
- Generated Markdown preview HTML is sanitized before display.
- Mermaid is detected from fenced `mermaid` blocks and `.mmd` files, validated before render, and rendered natively in preview surfaces.
- Mermaid uses text as the canonical artifact; do not introduce a hidden second diagram object model.
- SVG is the canonical Mermaid render/export artifact; PNG is derived from SVG rasterization.

### Non-goals and prohibitions

- No requirement that embedded browser panes work identically on every platform.
- No requirement that preview-mode editing becomes arbitrary WYSIWYG DOM editing.
- No hidden diagram state that can drift from `.md` or `.mmd` source.
- No full-privilege host bridge shared between generated preview content and arbitrary workspace HTML.

## Runtime Scheduler Packet Tie-In Note (2026-03-08)

The runtime scheduler/retry/safe-point packet aligns with the rewrite architecture as follows:
- event-driven scheduler updates match the rewrite-wide no-polling GUI rule
- queue analysis, remediation lineage, and blocked-state surfaces must derive from canonical event/projection state
- runtime safe points are distinct from user-facing restore/rollback history
- blocked outcomes remain first-class and must not be flattened into generic failures in rewrite-era UI or storage

This memo should cross-reference the packet-applied SSOT docs after they are updated so the rewrite narrative does not lag behind the canonical contracts.
