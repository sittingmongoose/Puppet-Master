# Puppet Master Rewrite Tie-In Contract (Active)


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
- Orchestrator is tab-first with `Progress`, `Plan Compile`, `Seams`, `Node Graph`, `Evidence`, `History`, and `Ledger`
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
- Stale-canon correction: Gemini is not one **DirectApi** `mixed-account` provider. Gemini Direct (`gemini`) and Gemini CLI (`gemini_cli`) are separate provider entries; the older one-provider mixed OAuth/API-key account-pool wording is retired.
- Subscription-first remains the default posture, and the Gemini API key remains the explicit `key-exception` to the broader avoid-API-keys guidance where the selected provider entry supports that path.
- Gemini Direct is key-only/API-key-backed. Gemini CLI is mode-dependent and may resolve OAuth, API-key, or Google/Vertex credential account rows under its own capability and setup policy.
- OAuth, API key, and Google/Vertex credentials are distinct Gemini auth surfaces / quota planes and MUST NOT be presented as the same plan or bucket.
- Requested vs effective auth/account identity MUST be visible across prompt assembly, storage, setup/health, usage, media capabilities, and runtime reporting.
- The rewrite-level `three-bucket` register is `MUST CHANGE`, `MUST RECONCILE`, and `MUST VERIFY`; the Gemini `MUST CHANGE` set includes `Plans/Contracts_V0.md`, `Plans/Multi-Account.md`, `Plans/storage-plan.md`, `Plans/usage-feature.md`, `Plans/FinalGUISpec.md`, `Plans/Media_Generation_and_Capabilities.md`, and this memo because requested/effective `/auth-mode`, account-state `/record` shape, mode-aware usage, and anti-`key-centric` copy must align across them.
- Three-bucket packetization meaning is fixed: `MUST CHANGE` docs either define the primary canon directly or own core state/GUI/runtime semantics that would remain misleading if only lightly edited; `MUST RECONCILE` docs are not the primary feature specs, but they contain adjacent semantics, platform assumptions, or command/runtime integration that would drift if left untouched; `MUST VERIFY` docs currently look directionally aligned, but they overlap enough with MCP/skill/tool canon that they must be checked before packet emission.
- Stale-canon retirement is explicit for this rewrite packet: do not preserve the old one-provider Gemini mixed OAuth/API model, CLI-first Codex/Copilot runtime language, `server` / `cli_launcher` OpenCode framing where `Managed Server` / `Attach to Existing Server` owns the meaning, `--user-data-dir` as the canonical Cursor CLI account boundary, `.cursorrules` as the primary Cursor-managed rules artifact, provider-native skill loading as the canonical runtime path, or old bottom-terminal/editor slot concepts that conflict with workgroups/subtabs/split-tree/editor-stack canon.
- Packet candidates must include all `MUST CHANGE` docs, must include `MUST RECONCILE` docs or explicitly justify why a stronger overlapping owner doc eliminates drift risk, and should list `MUST VERIFY` docs as pre-emit checks rather than derived-only outputs. If a packet candidate omits `storage-plan`, `Prompt_Pipeline`, `Contracts_V0`, `FinalGUISpec`, or `Multi-Account`, treat that omission as a likely packet defect because requested/effective vocabulary or GUI/runtime canon will drift; terminal/editor concept deltas from `Concepts/PMConcept.html` must travel with `FinalGUISpec` and terminal command/wiring docs rather than being left as concept-only knowledge.
- Final reconciliation coverage register is locked for packetization at 21 docs across five drift clusters: provider/runtime canon (`Contracts_V0`, `Prompt_Pipeline`, `Multi-Account`, `CLI_Bridged_Providers`, `Provider_OpenCode`, `Models_System`, `Media_Generation_and_Capabilities`), GUI / terminal / editor canon (`FinalGUISpec`, `assistant-chat-design`, `UI_Command_Catalog`, `Wiring_Matrix`), storage and lifecycle canon (`storage-plan`), tool/skill/MCP and mirror docs (`MiscPlan`, `OpenCode_Deep_Extraction`, `newtools`, `Skills_System`, `Tools`), and orchestrator/interview consumers (`orchestrator-subagent-integration`, `interview-subagent-integration`, `rewrite-tie-in-memo`). The highest drift risk clusters are provider identity and requested/effective runtime vocabulary, multi-account plus billing/entity semantics, OpenCode server-profile ontology, MCP/skill ownership vs provider-native projection, `/skill/MCP` ownership, and terminal/editor integration canon after the PMConcept terminal redesign.
- Gemini Direct remaining follow-up is narrowed to quota-fidelity/source-confidence wording and reconciliation of the now-pinned media/capability contract; Media_Generation_and_Capabilities, usage-feature, and Multi-Account own the live quota, usage-source, capability-picker, and requested/effective media/account surfaces.
- `Plans/Contracts_V0.md` and `Plans/Prompt_Pipeline.md` carry the requested/effective auth/account identity needed to make Gemini implementation-ready across storage, usage, and UI consumers.
- Rewrite summaries must not encode stale Gemini canon as an API-key default UI, OAuth-as-optional-fallback, or subscription exception without auth-surface and `/account-policy` nuance.
- Media follows the same requested/effective Gemini provider-entry, auth-surface/account, and quota/usage rules as regular Gemini usage; do not `hard-split` media into `key-only` behavior unless future evidence requires it.

ContractRef: ContractName:Plans/Multi-Account.md, ContractName:Plans/Prompt_Pipeline.md#EFFECTIVE-RESOLUTION-RECORD, ContractName:Plans/storage-plan.md
### Future mobile/web clients (impacts architecture now)


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
- Document annotation work reuses the existing bundle `/note` persistence and event model in **Plans/storage-plan.md** (`/storage-plan.md`); do not invent a second annotation storage path for the rewrite.

### Plans likely needing the most rewrite-aware edits


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


- `Plans/FileSafe.md`
  - Safety/policy intent remains valid; implementation should target patch/apply/verify/rollback and centralized tool governance rather than UI-level/file-manager specifics
- `Plans/WorktreeGitImprovement.md`, `Plans/MiscPlan.md`
  - Worktree/cleanup correctness stays valid; hook/crew sections should point to a single shared lifecycle framework in the new agent-loop core

---

## Suggested "single source of truth" rule for the rewrite

- Provider contracts, unified event model, tool registry, and patch pipeline should be specified in one canonical plan (or one canonical spec section), and other plans should reference it instead of re-describing it
- Grep/Search acceleration does not mint rewrite-local analytics events: the grep `tool.invoked` seglog event may include optional `index_used: boolean` for analytics, with no other event-shape change; detailed tool-event ownership remains in `Plans/Tools.md`, storage rollups in `Plans/storage-plan.md`, and Usage interpretation in `Plans/usage-feature.md`.
- Web-tool rewrite notes keep `websearch` discovery distinct from `webfetch` / `Reading Site` read-and-parse behavior. The memo may cite OpenCode and Exa implementation research, but source-file paths, upstream API URLs, helper names, and adapter internals remain reference provenance in transfer metadata rather than PM product vocabulary.
- The product-facing web split preserves `http://` / `https://` URL validation, permission prompting, bounded response behavior, and format-aware output where read/fetch results are rendered; provider free-plan and rate-limit behavior remains owned by `Plans/Tools.md`.
- Chat surfaces distinguish chat-native tool result cards from shell-owned terminal/output surfaces and from true interactive terminal sessions. Chat may summarize or link to execution, but terminal/output ownership stays with the canonical shell/runtime surfaces.
- The chat-widgets cluster includes code-block and `/diff` cards that can open in-app editor views with range-aware positioning, question chips/freeform paths, and Mermaid / `.mmd` native diagram rendering; owner details remain in `Plans/assistant-chat-design.md` and `Plans/FinalGUISpec.md`.
- Thread context/detail surfaces do not use `chat-shell` popouts or `/side-panel` detail panels as their canonical target; rewrite navigation opens or focuses the thread-scoped Context Detail Pane as an `editor-tab` surface, with product behavior owned by `Plans/assistant-chat-design.md` and `Plans/usage-feature.md`.
- Runtime identity carry-through treats legacy account-doc shorthand as retired: `Multi-Account.md` and the shared runtime contracts own `execution_role`, operational identity, handoff, and UI disclosure fields before feature-specific docs depend on them.

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
- The rewrite-level file-type matrix is source-canonical by default: `/Mermaid/HTML` documents keep editable text as the durable artifact, Markdown and Mermaid support split preview plus `/preview/detached`, HTML uses a browser-rendered preview/split/detached browser route, SVG uses native image `/vector` viewing with source as alternate, and non-`UTF` or large-file cases open read-only with visible reason, bounded `/save` behavior, and explicit `/export` routes where supported.

### Preview session contract


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
- `assistant-chat-design.md`, `assistant-chat-design`, and `FinalGUISpec.md` consume `open_source` as a real action, but the owner contract is this route/OpenSubject/FileManager split rather than a chat-local or GUI-local action definition.

#### Save/link rules
- `Save As` or `Insert into file` creates the first stable workspace path for an artifact-backed source.
- After first persist, runtime state records the linkage from `artifact_id` to `document_id`, but the original `artifact_id` remains valid for audit/history.

#### Identity-native open and route lift

The rewrite-level route contract is identity-native before it is path-open. `OpenSubject` targets `doc:<document_id>` or `artifact:<artifact_id>` first, then resolves through resolver-supporting storage metadata such as `backing_document_id`, `source_kind`, and `last_saved_path`; those fields remain resolver data and are not part of the external open command. The required artifact restore order is `subject_id -> backing document or transient generated buffer -> routed surface`, so GUI surfaces must preserve subject identity before selecting a workspace path, generated://<artifact_id> buffer, or /runtime/preview-backed representation.

`OpenFile` remains the workspace-path and code-navigation command for real files when a canonical path is already known. It must not be stretched into a universal path-open contract for generated/runtime/preview-backed subjects, non-file artifacts, or artifact/report opens. The stale `OpenFile { path... }` single-contract shape is a migration alias only; the cross-cutting contract is identity-native routing plus /file-backed or /buffer realization after resolution.

`Plans/FileManager.md` / `FileManager` consumes `subject-open` resolution for assistant-chat artifact-backed generated buffers without becoming the subject owner: path-based `OpenFile` remains legitimate for real workspace documents, while artifact-backed opens preserve `artifact_id` and realize as `generated://<artifact_id>` buffers when no workspace path exists.

`generated://<artifact_id>` is a transient `/source` or `/resulting` editor/source realization for artifact subjects, not the durable identity. Durable joins stay on `artifact:<artifact_id>`, `doc:<document_id>`, `artifact_id`, and `document_id`.

`resume_url` is a serialized deep-link transport, not the hidden canonical route model. The app owns one internal route payload and treats `resume_url` as a /serialization and /restore form of that payload. Transient generated content, non-persisted Deep Plan sources, document-backed previews, artifact-backed previews, parent-summary inspection artifacts, workspace-backed documents, logical_artifact_id, linked_artifact_id, /generated route aliases, and generated://<artifact_id> report buffers all join through artifact_id, artifact_kind, document_id, and preview_subject_id rather than through file paths alone.

The `pre-packetize` rewrite discussion starts from the `node-graph-based` execution model: the node graph is what Orchestrator consumes, and any packet planning for this seam must preserve that owner assumption before emitting downstream doc changes.

Reviewer coverage notes from `GPT-5.2` are treated as `owner-level` deltas when they identify mechanical doc failures rather than mere restatement; the memo records those deltas as routing obligations until the owning docs absorb them.

Provider recovery controls stay automation-first. Browser auto-relogin may exist as an optional provider-specific recovery helper, but it is not a cross-provider assumption; log parsing is supplemental /evidence rather than quota truth; manual `set active` remains a settings /debug/operator control rather than the main execution model. Storage split-brain and projection-health issues stay in Plans/storage-plan.md, while minority_advisory, runtime-artifact schema registration, and source-open resolver rules must be raised to owner docs instead of remaining memo-only observations.

Orchestrator GUI tabs are native-purpose except where a doc explicitly says otherwise: Plan Compile, Seams, Node Graph, Evidence, History, and Ledger are native-purpose surfaces, while Progress remains the widget-composed tab. Plan Compile is the design-only plans-to-code projection tab and does not become Executor execution authority. This preserves /UI behavior without letting universal rendering or file-opening language overtake the route/open subject contract.

#### PreviewSession lifecycle and identity contract

`PreviewSession` is a durable runtime contract for rendered subject identity, but ordinary browser-capable surfaces layer a distinct browser-session identity on top of preview identity so browser tabs, detached windows, and automation sessions do not collapse into one broad preview-instance model. Protected `AuthBrowserSession` is not a PreviewSession overlay and exposes no durable rendered-subject content/state outside its foreground human-only lifecycle.

Owner split is explicit: `Plans/Section15_MVP_Promoted_Features_Spec.md` owns the promoted Browser Program and protected AuthBrowserSession model; `Plans/FileManager.md` owns editor preview behavior; `Plans/storage-plan.md` owns ordinary restore identity and deliberately stores no protected AuthBrowserSession family; `Plans/UI_Command_Catalog.md` owns stable ordinary browser command families; and `Plans/FinalGUISpec.md` owns GUI placement. Legacy `auth_session` overlay text is retired.

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
- browser-backed preview/debug entries cover active workspace preview, URL target, and browser-backed app reproduction surfaces; active automation uses a visible `automation_session` while preserving `browser_session_id` plus `session_class` as canonical correlation keys
- default browser adapter evidence includes structured snapshot, screenshot, console and /network summaries, and browser recordings/traces/videos where enabled; takeover and /promote flows retain the same browser-session identity rather than creating a detached preview shell
- route, `/focus/open/reopen`, and recovery commands target the canonical `browser_session_id` / `preview_subject_id` pair rather than a generic preview tab or stale bottom-panel browser placeholder
- detaching normal browsing is an attachment change, not a new preview subject, unless the user explicitly creates separate detached state
- `bottom_panel_browser` is not a canonical attachment target
- Stale `workspace_browser`, `bottom_panel_browser`, `detached-only` guarantees, and WebView2/WebKitGTK runtime matrices are retired rewrite-baseline inputs; they do not override the PM-managed browser-session model, the editor-tab plus first-class detached-window contract, or the CEF `/pinned-runtime` baseline.

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
- `permission_summary`
- `permission_profile`
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
- Generated visual modules have an MVP library policy: allowed libraries must be BUNDLED in the source fragment, with no CDN fetches at runtime and no unvetted network requests from within the visual module. The MVP allowlist is empty unless a library is bundled in source, versioned, reviewed, and explicitly approved for that generated visual module; otherwise the agent must inline all code. Post-MVP, a curated allowlist of bundled libraries may include examples such as D3, Chart.js, and Three.js.
- Full HTML/browser mode is a **separate trust tier** and must not inherit source-mutation privileges by default.

### Platform contract

#### Platform runtime matrix and degraded-mode UX

The rendering system must define one browser product model across supported desktop platforms: a PM-managed pinned bundled CEF-class Chromium runtime with editor-tab primary hosting and first-class detached windows.
- Research/design-decision lineage is closed for this topic: PM treats the CEF-class, watchable agent browsing/testing, and `mostly-full` runtime direction as locked unless new evidence makes CEF-class integration clearly impractical.
- Installer reconciliation uses the current full/offline baseline: PM should ship or preflight a complete versioned browser runtime bundle, surface degraded state before advertising browser capability, and avoid aggressively stripped Chromium profiles that sacrifice required browser features.

**Browser runtime selection constraints**
- A CEF wrapper such as `wef` is an implementation candidate, not a product name, session class, or implicit default.
- The preferred CEF integration starting point is lower-level bindings plus a PM-owned shim/bridge; `wef` must not become the architectural linchpin, and direct full custom CEF integration starts only if the lower-level binding path proves non-viable.
- Browser-runtime comparison inputs are retained as non-product lineage: `Saik0s/mcp-browser-use` may inform browser-use, `/browser-agent`, `/mcp-browser-use`, and `task/observability/dashboard` ideas, but its separate LLM/browser-agent loop is a poor PM core architecture because PM's own agent must own reasoning/control directly; `chromiumoxide` is a Rust-native Chrome/Chromium CDP automation/backend candidate for launch-or-attach control, screenshots, and deeper browser control in Rust; the Rust browser ecosystem remains fragmented, so these inputs do not replace the CEF-class in-app Chromium direction, `/screenshot`/DevTools requirements, or PM-owned runtime packaging.
- Selecting `wef` requires PM to own the CEF binary lifecycle: pin the version, define cache location, verify integrity, support rollback, and specify offline install behavior as part of the packaging/update/install strategy.
- The `wef`/`cargo-wef` path cannot rely on an unqualified auto-downloaded CEF binary distribution at first launch; Doctor/setup must know the expected binary before PM advertises browser capability.
- The CEF app-size impact is material: release packaging and storage planning must budget roughly ~1 GB when this path is selected.
- The selected CEF `/binding` strategy for Rust + Slint must document how PM manages CEF's `multi-process` model, crash/restart behavior, sandboxing, codecs and `/PDF/runtime` dependencies, and DevTools availability across Linux/macOS/Windows without relying on a system-wide Chromium install.
- Browser installer/update policy must define a versioned `runtime-bundle` layout and replacement rules, require signature/hash verification for shipped CEF artifacts, and use atomic update steps so every CEF-matched file moves together or the previous bundle remains active.
- Distribution and update policy is locked as one pinned stable runtime stream: the browser runtime is a PM-managed bundled runtime, never a `first-use` download or dependency on a `system-installed` browser; `/installers` and `/update` replace it atomically as a matched set and surface `runtime_unavailable` on mismatch or damage.
- Browser visibility is watchable by default: normal user-visible browser `/window` sessions let the user `/take` over; attachable background sessions must expose "open live browser session" / "watch run"; hidden utility backends are limited to auth or `/testing/evidence`, not normal user-visible browsing.
- Browser runtime-layout is platform-explicit: Windows carries DLLs, `/resources/helper` EXEs, macOS carries the framework `/bundle` structure, and Linux carries shared objects, resources/helper processes, and the distro dependency story.
- Any upstream experimental warning is treated as implementation risk requiring version lock, fallback/remediation, and runtime health checks; it must not reintroduce GUI experimental-feature toggles.

| Platform | Embedded browser status | Guaranteed path | Runtime dependency | Required degraded UX |
|---|---|---|---|---|
| Windows | supported through the PM-managed bundled Chromium runtime | editor-tab browser plus detached window on the same PM browser model | PM-managed bundled Chromium runtime | show `runtime_unavailable` remediation and keep source/native surfaces usable |
| macOS | supported through the PM-managed bundled Chromium runtime | editor-tab browser plus detached window on the same PM browser model | PM-managed bundled Chromium runtime | show `runtime_unavailable` remediation and keep source/native surfaces usable |
| Linux X11 | supported through the PM-managed bundled Chromium runtime | editor-tab browser plus detached window on the same PM browser model | PM-managed bundled Chromium runtime plus platform prerequisites required by the chosen embedding path | show `runtime_unavailable` remediation and keep source/native surfaces usable |
| Linux Wayland | supported through the same PM browser abstraction with platform-specific embedding details hidden behind the PM bridge | editor-tab browser plus detached window on the same PM browser model | PM-managed bundled Chromium runtime plus platform prerequisites required by the chosen embedding path | show `runtime_unavailable` remediation and keep source/native surfaces usable |

ContractRef: ContractName:Plans/Section15_MVP_Promoted_Features_Spec.md, ContractName:Plans/FinalGUISpec.md, ContractName:Plans/Permissions_System.md

- FinalGUI cross-check: `Plans/FinalGUISpec.md` / `/FinalGUISpec.md` keeps the `editor-tab` browser as the primary normal browsing and preview host; the bottom panel may show browser-adjacent activity only and must not reintroduce a competing primary Browser tab.

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
- The viewer-vs-editor-vs-preview fallback hierarchy is deterministic: if a rendered preview cannot safely load, the product preserves the source editor/viewer route, keeps scroll/selection state when possible, reports the trust or runtime reason, and never treats a static screenshot as equivalent to a live `/browser` preview.

ContractRef: ContractName:Plans/Section15_MVP_Promoted_Features_Spec.md, ContractName:Plans/Permissions_System.md, ContractName:Plans/storage-plan.md

### Source/preview mapping and edit contract

Preview mutation and document annotation are related but distinct contracts. Direct preview mutation remains a validated shared-buffer patch path; annotation and chat handoff remain review-layer operations until an explicit direct-edit bridge is invoked.

#### Preview action protocol v1

All successful preview mutations resolve to canonical text patches against the same shared buffer model used by File Editor.
Diff and review flows stay shared-buffer-based: editor review may present side-by-side or `/unified` views; Source Control `/Changes` owns staged, `/unstaged/conflicted`, and conflict states; `/review/rich` preview actions mutate only bounded source spans; annotations remain source-anchored with DOM nodes treated as render projections; and apply-suggestion or one-click edits route through the FileSafe patch `/apply/verify/rollback` path rather than bypassing `/source`, dirty state, or `/redo` history.

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

## Owner / Consumer Map

This source-preserving standardization keeps the owner and consumer boundaries stated in the original document body. During this batch, `Plans/rewrite-tie-in-memo.md` remains the owner doc for the behavior described by its preserved sections, while cross-doc ownership follows the ContractRefs and boundary notes already present in the original text.

ContractRef: ContractName:Plans/Plan_Document_System.md, ContractName:Plans/Bootstrap_Planning_Migration.md

## PlanUnits

### RTIM-002 - Rewrite Provider Spine Baseline

```yaml
{plan_unit_id: "RTIM-002", unit_type: "requirement", status: "accepted", owner_doc: "Plans/rewrite-tie-in-memo.md", canonical_text: "Puppet Master uses one deterministic agent loop with every backend as a Provider behind a unified session/event store, tool registry, and patch/edit pipeline, adapting OpenCode architecture without CLI-bridged special-case chaos.", gui_related: false, gui_classification_reason: "This unit preserves backend, storage, provider, policy, or ownership requirements rather than visual presentation.", split_recommended: false, depends_on: ["PDS-003","PDS-004","PDS-005","PNC-001","CV-002","CBP-003","T-001","SP-001"], unblocks: [], acceptance_criteria: ["RTIM-002 remains addressable as a fine-grained Rewrite Tie-In PlanUnit with source-span coverage.","ContractRefs, anchors or aliases, exact tokens, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage from the source spans remain preserved.","No WorkNodes, NodeSeeds, executable queues, final node manifests, production build tasks, implementation files, or source code are created by this PlanUnit."], validation_surfaces: ["python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits","python3 scripts/pm-plan-index.py validate"], risk_class: "rewrite_tie_in_drift", reasoning_tier: "standard", context_scope: "rewrite_tie_in", implementation_surfaces: ["Plans/rewrite-tie-in-memo.md"], node_compile_hint: {"mode": "canonical_requirement","create_worknodes": false}, source_lineage: ["Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:rewrite-tie-in-memo-S0002","Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:rewrite-tie-in-memo-S0003"], preserved_exact_tokens: ["single, deterministic \"agent loop\"","Provider","unified session/event store","tool registry","patch/edit pipeline","OpenCode"], negative_constraints: [], preserved_contractrefs: [], owner_hints: ["Plans/rewrite-tie-in-memo.md","Plans/Contracts_V0.md","Plans/CLI_Bridged_Providers.md","Plans/Tools.md","Plans/storage-plan.md"]}
```

### RTIM-003 - Orchestrator Graph Canonicalization Lock

```yaml
{plan_unit_id: "RTIM-003", unit_type: "decision", status: "accepted", owner_doc: "Plans/rewrite-tie-in-memo.md", canonical_text: "The node graph is the canonical execution model; Feature Seam, Work Package, Node, promotion states, governance overseers, graph generation lineage, route_target, and OpenSubject stay locked as rewrite-era orchestration canon.", gui_related: false, gui_classification_reason: "This unit preserves backend, storage, provider, policy, or ownership requirements rather than visual presentation.", split_recommended: true, depends_on: ["PDS-003","PDS-004","PDS-005","PNC-001","OP-007","RGV-001","RGV-004","C-007","C-008","CV-163","CV-175"], unblocks: [], acceptance_criteria: ["RTIM-003 remains addressable as a fine-grained Rewrite Tie-In PlanUnit with source-span coverage.","ContractRefs, anchors or aliases, exact tokens, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage from the source spans remain preserved.","No WorkNodes, NodeSeeds, executable queues, final node manifests, production build tasks, implementation files, or source code are created by this PlanUnit."], validation_surfaces: ["python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits","python3 scripts/pm-plan-index.py validate"], risk_class: "rewrite_tie_in_drift", reasoning_tier: "standard", context_scope: "rewrite_tie_in", implementation_surfaces: ["Plans/rewrite-tie-in-memo.md"], node_compile_hint: {"mode": "runtime_graph_contract","create_worknodes": false}, source_lineage: ["Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:rewrite-tie-in-memo-S0004"], preserved_exact_tokens: ["node graph","Feature Seam","Work Package","Node","Package Overseer","Seam Overseer","Locally Complete","Available to Seam","Seam Complete","route_target","OpenSubject"], negative_constraints: [], preserved_contractrefs: ["ContractRef: ContractName:Plans/Orchestrator_Page.md, ContractName:Plans/Run_Graph_View.md, ContractName:Plans/Crosswalk.md"], owner_hints: ["Plans/rewrite-tie-in-memo.md","Plans/Orchestrator_Page.md","Plans/Run_Graph_View.md","Plans/Crosswalk.md"]}
```

### RTIM-004 - Orchestrator Tab And Progress Boundary

```yaml
{plan_unit_id: "RTIM-004", unit_type: "requirement", status: "accepted", owner_doc: "Plans/rewrite-tie-in-memo.md", canonical_text: "Orchestrator remains tab-first with Progress, Plan Compile, Seams, Node Graph, Evidence, History, and Ledger; Progress is the only widget-composed tab, while Plan Compile and the other non-Progress Orchestrator tabs are native-purpose surfaces.", gui_related: true, gui_classification_reason: "This unit preserves user-visible GUI, UI, route, surface, or visual rendering requirements.", split_recommended: true, depends_on: ["PDS-003","PDS-004","PDS-005","PNC-001","OP-011","C-026","F3-009"], unblocks: [], acceptance_criteria: ["RTIM-004 remains addressable as a fine-grained Rewrite Tie-In PlanUnit with source-span coverage.","ContractRefs, anchors or aliases, exact tokens, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage from the source spans remain preserved.","No WorkNodes, NodeSeeds, executable queues, final node manifests, production build tasks, implementation files, or source code are created by this PlanUnit."], validation_surfaces: ["python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits","python3 scripts/pm-plan-index.py validate"], risk_class: "rewrite_tie_in_drift", reasoning_tier: "standard", context_scope: "rewrite_tie_in", implementation_surfaces: ["Plans/rewrite-tie-in-memo.md"], node_compile_hint: {"mode": "gui_surface_contract","create_worknodes": false}, source_lineage: ["Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:rewrite-tie-in-memo-S0004","Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:rewrite-tie-in-memo-S0026"], preserved_exact_tokens: ["Orchestrator is tab-first","Progress","Plan Compile","Seams","Node Graph","Evidence","History","Ledger","Progress is the only widget-composed Orchestrator tab","native-purpose"], negative_constraints: [], preserved_contractrefs: [], owner_hints: ["Plans/rewrite-tie-in-memo.md","Plans/Orchestrator_Page.md","Plans/FinalGUISpec.md","Plans/Crosswalk.md"]}
```

### RTIM-005 - Slint Renderer And Theme Baseline

```yaml
{plan_unit_id: "RTIM-005", unit_type: "decision", status: "accepted", owner_doc: "Plans/rewrite-tie-in-memo.md", canonical_text: "Desktop UI uses Rust plus Slint with winit plus Skia by default, FemtoVG-wgpu fallback, emergency software fallback, restart-acceptable theme switching, and no stale Iced path.", gui_related: true, gui_classification_reason: "This unit preserves user-visible GUI, UI, route, surface, or visual rendering requirements.", split_recommended: false, depends_on: ["PDS-003","PDS-004","PDS-005","PNC-001","F3-026","F3-027","F3-029","F3-033","CV-188"], unblocks: [], acceptance_criteria: ["RTIM-005 remains addressable as a fine-grained Rewrite Tie-In PlanUnit with source-span coverage.","ContractRefs, anchors or aliases, exact tokens, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage from the source spans remain preserved.","No WorkNodes, NodeSeeds, executable queues, final node manifests, production build tasks, implementation files, or source code are created by this PlanUnit."], validation_surfaces: ["python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits","python3 scripts/pm-plan-index.py validate"], risk_class: "rewrite_tie_in_drift", reasoning_tier: "standard", context_scope: "rewrite_tie_in", implementation_surfaces: ["Plans/rewrite-tie-in-memo.md"], node_compile_hint: {"mode": "gui_runtime_baseline","create_worknodes": false}, source_lineage: ["Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:rewrite-tie-in-memo-S0004"], preserved_exact_tokens: ["Rust + Slint","winit backend","winit + Skia","winit + FemtoVG-wgpu","emergency software fallback","restart","Basic theme"], negative_constraints: [], preserved_contractrefs: [], owner_hints: ["Plans/rewrite-tie-in-memo.md","Plans/FinalGUISpec.md","Plans/Contracts_V0.md"]}
```

### RTIM-006 - Storage Search Replay Baseline

```yaml
{plan_unit_id: "RTIM-006", unit_type: "requirement", status: "accepted", owner_doc: "Plans/rewrite-tie-in-memo.md", canonical_text: "Persistence is seglog as the canonical append-only event ledger, redb for durable KV projections/settings, and Tantivy search; replay, checkpoint, rebuild, analytics, runs, sessions, artifacts, annotations, and dashboards route through storage-plan ownership.", gui_related: false, gui_classification_reason: "This unit preserves backend, storage, provider, policy, or ownership requirements rather than visual presentation.", split_recommended: true, depends_on: ["PDS-003","PDS-004","PDS-005","PNC-001","SP-001","CV-010","CV-235"], unblocks: [], acceptance_criteria: ["RTIM-006 remains addressable as a fine-grained Rewrite Tie-In PlanUnit with source-span coverage.","ContractRefs, anchors or aliases, exact tokens, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage from the source spans remain preserved.","No WorkNodes, NodeSeeds, executable queues, final node manifests, production build tasks, implementation files, or source code are created by this PlanUnit."], validation_surfaces: ["python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits","python3 scripts/pm-plan-index.py validate"], risk_class: "rewrite_tie_in_drift", reasoning_tier: "standard", context_scope: "rewrite_tie_in", implementation_surfaces: ["Plans/rewrite-tie-in-memo.md"], node_compile_hint: {"mode": "storage_projection_contract","create_worknodes": false}, source_lineage: ["Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:rewrite-tie-in-memo-S0004","Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:rewrite-tie-in-memo-S0005","Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:rewrite-tie-in-memo-S0012"], preserved_exact_tokens: ["seglog","redb","Tantivy","canonical append-only event ledger","replayable","checkpointing","Storage consistency","Plans/storage-plan.md"], negative_constraints: [], preserved_contractrefs: [], owner_hints: ["Plans/rewrite-tie-in-memo.md","Plans/storage-plan.md"]}
```

### RTIM-007 - Tool Governance Patch Verify Rollback Spine

```yaml
{plan_unit_id: "RTIM-007", unit_type: "requirement", status: "accepted", owner_doc: "Plans/rewrite-tie-in-memo.md", canonical_text: "Tools flow through central policy and normalized result governance, while edits use explicit patch, apply, verify, and rollback paths aligned with worktree/branch/sandbox safety and FileSafe intent.", gui_related: false, gui_classification_reason: "This unit preserves backend, storage, provider, policy, or ownership requirements rather than visual presentation.", split_recommended: false, depends_on: ["PDS-003","PDS-004","PDS-005","PNC-001","T-001","F2-086","F2-089","SP-001"], unblocks: [], acceptance_criteria: ["RTIM-007 remains addressable as a fine-grained Rewrite Tie-In PlanUnit with source-span coverage.","ContractRefs, anchors or aliases, exact tokens, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage from the source spans remain preserved.","No WorkNodes, NodeSeeds, executable queues, final node manifests, production build tasks, implementation files, or source code are created by this PlanUnit."], validation_surfaces: ["python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits","python3 scripts/pm-plan-index.py validate"], risk_class: "rewrite_tie_in_drift", reasoning_tier: "standard", context_scope: "rewrite_tie_in", implementation_surfaces: ["Plans/rewrite-tie-in-memo.md"], node_compile_hint: {"mode": "tool_policy_contract","create_worknodes": false}, source_lineage: ["Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:rewrite-tie-in-memo-S0005","Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:rewrite-tie-in-memo-S0014"], preserved_exact_tokens: ["central policy engine","normalized tool results","patch/apply/verify/rollback","worktrees/branches/sandboxes","FileSafe"], negative_constraints: [], preserved_contractrefs: [], owner_hints: ["Plans/rewrite-tie-in-memo.md","Plans/Tools.md","Plans/FileSafe.md","Plans/storage-plan.md"]}
```

### RTIM-008 - CLI Provider Streaming And ACP Boundary

```yaml
{plan_unit_id: "RTIM-008", unit_type: "requirement", status: "accepted", owner_doc: "Plans/rewrite-tie-in-memo.md", canonical_text: "Claude Code CLI and Cursor Agent CLI are bridged Providers using machine-readable streams; Cursor CLI is not ACP-native, so ACP needs a PM-side adapter instead of assuming native Cursor ACP support.", gui_related: false, gui_classification_reason: "This unit preserves backend, storage, provider, policy, or ownership requirements rather than visual presentation.", split_recommended: false, depends_on: ["PDS-003","PDS-004","PDS-005","PNC-001","CBP-007","CBP-009","CBP-018","CV-147"], unblocks: [], acceptance_criteria: ["RTIM-008 remains addressable as a fine-grained Rewrite Tie-In PlanUnit with source-span coverage.","ContractRefs, anchors or aliases, exact tokens, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage from the source spans remain preserved.","No WorkNodes, NodeSeeds, executable queues, final node manifests, production build tasks, implementation files, or source code are created by this PlanUnit."], validation_surfaces: ["python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits","python3 scripts/pm-plan-index.py validate"], risk_class: "rewrite_tie_in_drift", reasoning_tier: "standard", context_scope: "rewrite_tie_in", implementation_surfaces: ["Plans/rewrite-tie-in-memo.md"], node_compile_hint: {"mode": "provider_bridge_contract","create_worknodes": false}, source_lineage: ["Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:rewrite-tie-in-memo-S0006"], preserved_exact_tokens: ["Claude Code CLI","--output-format stream-json","--include-partial-messages","Cursor Agent CLI","--print --output-format stream-json","ACP","not ACP-native","adapter layer"], negative_constraints: [], preserved_contractrefs: [], owner_hints: ["Plans/rewrite-tie-in-memo.md","Plans/CLI_Bridged_Providers.md"]}
```

### RTIM-009 - Gemini Provider Auth Runtime Contract

```yaml
{plan_unit_id: "RTIM-009", unit_type: "requirement", status: "accepted", owner_doc: "Plans/rewrite-tie-in-memo.md", canonical_text: "Gemini Direct gemini and Gemini CLI gemini_cli are separate provider entries; OAuth, API key, and Google/Vertex credentials are distinct auth surfaces and quota planes, and stale mixed-provider Gemini canon is retired.", gui_related: false, gui_classification_reason: "This unit preserves backend, storage, provider, policy, or ownership requirements rather than visual presentation.", split_recommended: true, depends_on: ["PDS-003","PDS-004","PDS-005","PNC-001","MA-003","MA-009","MA-014","MA-026","MA-029","CBP-017","CV-133","CV-202","PP-034"], unblocks: [], acceptance_criteria: ["RTIM-009 remains addressable as a fine-grained Rewrite Tie-In PlanUnit with source-span coverage.","ContractRefs, anchors or aliases, exact tokens, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage from the source spans remain preserved.","No WorkNodes, NodeSeeds, executable queues, final node manifests, production build tasks, implementation files, or source code are created by this PlanUnit."], validation_surfaces: ["python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits","python3 scripts/pm-plan-index.py validate"], risk_class: "rewrite_tie_in_drift", reasoning_tier: "standard", context_scope: "rewrite_tie_in", implementation_surfaces: ["Plans/rewrite-tie-in-memo.md"], node_compile_hint: {"mode": "auth_runtime_contract","create_worknodes": false}, source_lineage: ["Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:rewrite-tie-in-memo-S0007"], preserved_exact_tokens: ["Gemini Direct","gemini","Gemini CLI","gemini_cli","OAuth","API key","Google/Vertex","quota planes","MUST CHANGE","MUST RECONCILE","MUST VERIFY"], negative_constraints: ["OAuth, API key, and Google/Vertex credentials MUST NOT be presented as the same plan or bucket.","Rewrite summaries must not encode stale Gemini canon as an API-key default UI, OAuth fallback, or subscription exception without auth-surface and account-policy nuance."], preserved_contractrefs: ["ContractRef: ContractName:Plans/Multi-Account.md, ContractName:Plans/Prompt_Pipeline.md#EFFECTIVE-RESOLUTION-RECORD, ContractName:Plans/storage-plan.md"], owner_hints: ["Plans/rewrite-tie-in-memo.md","Plans/Multi-Account.md","Plans/Prompt_Pipeline.md","Plans/storage-plan.md","Plans/Contracts_V0.md"]}
```

### RTIM-010 - Gemini GUI Usage Capability Guard

```yaml
{plan_unit_id: "RTIM-010", unit_type: "requirement", status: "accepted", owner_doc: "Plans/rewrite-tie-in-memo.md", canonical_text: "Requested and effective Gemini auth/account identity must be visible across prompt assembly, storage, setup/health, usage, media capabilities, runtime reporting, and anti-key-centric GUI copy.", gui_related: true, gui_classification_reason: "This unit preserves user-visible GUI, UI, route, surface, or visual rendering requirements.", split_recommended: true, depends_on: ["PDS-003","PDS-004","PDS-005","PNC-001","MA-037","MA-049","MA-051","F3-022","F3-023","CV-214","MGAC-020","MGAC-021"], unblocks: [], acceptance_criteria: ["RTIM-010 remains addressable as a fine-grained Rewrite Tie-In PlanUnit with source-span coverage.","ContractRefs, anchors or aliases, exact tokens, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage from the source spans remain preserved.","No WorkNodes, NodeSeeds, executable queues, final node manifests, production build tasks, implementation files, or source code are created by this PlanUnit."], validation_surfaces: ["python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits","python3 scripts/pm-plan-index.py validate"], risk_class: "rewrite_tie_in_drift", reasoning_tier: "standard", context_scope: "rewrite_tie_in", implementation_surfaces: ["Plans/rewrite-tie-in-memo.md"], node_compile_hint: {"mode": "gui_account_capability_contract","create_worknodes": false}, source_lineage: ["Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:rewrite-tie-in-memo-S0007"], preserved_exact_tokens: ["requested/effective","setup/health","usage","media capabilities","runtime reporting","anti-`key-centric` copy","capability-picker"], negative_constraints: [], preserved_contractrefs: [], owner_hints: ["Plans/rewrite-tie-in-memo.md","Plans/FinalGUISpec.md","Plans/usage-feature.md","Plans/Media_Generation_and_Capabilities.md","Plans/Multi-Account.md"]}
```

### RTIM-011 - Thin Client Command Boundary

```yaml
{plan_unit_id: "RTIM-011", unit_type: "constraint", status: "accepted", owner_doc: "Plans/rewrite-tie-in-memo.md", canonical_text: "Mobile and web clients are thin clients that consume streamed events/artifacts and send commands to the desktop-owned core; they must not call providers, tool executors, or local patch pipelines directly.", gui_related: false, gui_classification_reason: "This unit preserves backend, storage, provider, policy, or ownership requirements rather than visual presentation.", split_recommended: false, depends_on: ["PDS-003","PDS-004","PDS-005","PNC-001","CV-002","CV-006","UCC-001","SP-001"], unblocks: [], acceptance_criteria: ["RTIM-011 remains addressable as a fine-grained Rewrite Tie-In PlanUnit with source-span coverage.","ContractRefs, anchors or aliases, exact tokens, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage from the source spans remain preserved.","No WorkNodes, NodeSeeds, executable queues, final node manifests, production build tasks, implementation files, or source code are created by this PlanUnit."], validation_surfaces: ["python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits","python3 scripts/pm-plan-index.py validate"], risk_class: "rewrite_tie_in_drift", reasoning_tier: "standard", context_scope: "rewrite_tie_in", implementation_surfaces: ["Plans/rewrite-tie-in-memo.md"], node_compile_hint: {"mode": "api_boundary_contract","create_worknodes": false}, source_lineage: ["Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:rewrite-tie-in-memo-S0008"], preserved_exact_tokens: ["thin","unified event model + streaming API","command API","desktop-owned core"], negative_constraints: ["Thin clients MUST NOT call providers, tool executors, or local patch pipelines directly."], preserved_contractrefs: [], owner_hints: ["Plans/rewrite-tie-in-memo.md","Plans/Contracts_V0.md","Plans/storage-plan.md","Plans/UI_Command_Catalog.md"]}
```

### RTIM-012 - Implementation Interface Directives

```yaml
{plan_unit_id: "RTIM-012", unit_type: "requirement", status: "accepted", owner_doc: "Plans/rewrite-tie-in-memo.md", canonical_text: "Implementation targets Provider terminology, unified event model, Provider trait, tool registry, and event-sourced seglog to redb/Tantivy session storage, without SQLite alternatives or platform-runner vocabulary forks.", gui_related: false, gui_classification_reason: "This unit preserves backend, storage, provider, policy, or ownership requirements rather than visual presentation.", split_recommended: true, depends_on: ["PDS-003","PDS-004","PDS-005","PNC-001","CBP-003","SP-001","T-001","CV-002"], unblocks: [], acceptance_criteria: ["RTIM-012 remains addressable as a fine-grained Rewrite Tie-In PlanUnit with source-span coverage.","ContractRefs, anchors or aliases, exact tokens, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage from the source spans remain preserved.","No WorkNodes, NodeSeeds, executable queues, final node manifests, production build tasks, implementation files, or source code are created by this PlanUnit."], validation_surfaces: ["python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits","python3 scripts/pm-plan-index.py validate"], risk_class: "rewrite_tie_in_drift", reasoning_tier: "standard", context_scope: "rewrite_tie_in", implementation_surfaces: ["Plans/rewrite-tie-in-memo.md"], node_compile_hint: {"mode": "implementation_constraint","create_worknodes": false}, source_lineage: ["Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:rewrite-tie-in-memo-S0009"], preserved_exact_tokens: ["unified event model","Provider trait","tool registry","event-sourced session store","seglog -> projections","Provider terminology","do not introduce new platform-runner phrasing","do not add SQLite-based alternatives"], negative_constraints: [], preserved_contractrefs: [], owner_hints: ["Plans/rewrite-tie-in-memo.md","Plans/Contracts_V0.md","Plans/CLI_Bridged_Providers.md","Plans/Tools.md","Plans/storage-plan.md"]}
```

### RTIM-013 - Slint Event Loop And Experimental Toggle Prohibition

```yaml
{plan_unit_id: "RTIM-013", unit_type: "constraint", status: "accepted", owner_doc: "Plans/rewrite-tie-in-memo.md", canonical_text: "UI updates must cross the Slint event-loop boundary, and Settings/config/provider invocation must not expose per-platform experimental settings, experimentalEnabled keys, or provider-side experimental toggles for runtime behavior.", gui_related: true, gui_classification_reason: "This unit preserves user-visible GUI, UI, route, surface, or visual rendering requirements.", split_recommended: true, depends_on: ["PDS-003","PDS-004","PDS-005","PNC-001","F3-026","F3-031","F3-033","CBP-012"], unblocks: [], acceptance_criteria: ["RTIM-013 remains addressable as a fine-grained Rewrite Tie-In PlanUnit with source-span coverage.","ContractRefs, anchors or aliases, exact tokens, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage from the source spans remain preserved.","No WorkNodes, NodeSeeds, executable queues, final node manifests, production build tasks, implementation files, or source code are created by this PlanUnit."], validation_surfaces: ["python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits","python3 scripts/pm-plan-index.py validate"], risk_class: "rewrite_tie_in_drift", reasoning_tier: "standard", context_scope: "rewrite_tie_in", implementation_surfaces: ["Plans/rewrite-tie-in-memo.md"], node_compile_hint: {"mode": "gui_runtime_constraint","create_worknodes": false}, source_lineage: ["Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:rewrite-tie-in-memo-S0009"], preserved_exact_tokens: ["Slint event loop boundary","Settings > Advanced","Experimental features","Enable Codex/Gemini/Copilot Experimental","experimentalEnabled","Copilot `--experimental`"], negative_constraints: ["UI updates must not rely on delayed or ad-hoc polling paths.","Settings and config schemas MUST NOT include per-platform experimental toggles or experimentalEnabled-equivalent keys."], preserved_contractrefs: ["ContractRef: ContractName:Plans/CLI_Bridged_Providers.md, ContractName:Plans/FinalGUISpec.md"], owner_hints: ["Plans/rewrite-tie-in-memo.md","Plans/FinalGUISpec.md","Plans/CLI_Bridged_Providers.md"]}
```

### RTIM-014 - Assistant Memory Ownership Boundary

```yaml
{plan_unit_id: "RTIM-014", unit_type: "constraint", status: "accepted", owner_doc: "Plans/rewrite-tie-in-memo.md", canonical_text: "Assistant memory is Assistant-only continuity; Gist generation is artifact-driven and must not alter Provider spine contracts, unified event model ownership, or shared rules pipeline semantics.", gui_related: false, gui_classification_reason: "This unit preserves backend, storage, provider, policy, or ownership requirements rather than visual presentation.", split_recommended: false, depends_on: ["PDS-003","PDS-004","PDS-005","PNC-001","AMS-003","AMS-005","AMS-015","AMS-016","SP-001"], unblocks: [], acceptance_criteria: ["RTIM-014 remains addressable as a fine-grained Rewrite Tie-In PlanUnit with source-span coverage.","ContractRefs, anchors or aliases, exact tokens, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage from the source spans remain preserved.","No WorkNodes, NodeSeeds, executable queues, final node manifests, production build tasks, implementation files, or source code are created by this PlanUnit."], validation_surfaces: ["python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits","python3 scripts/pm-plan-index.py validate"], risk_class: "rewrite_tie_in_drift", reasoning_tier: "standard", context_scope: "rewrite_tie_in", implementation_surfaces: ["Plans/rewrite-tie-in-memo.md"], node_compile_hint: {"mode": "owner_boundary_constraint","create_worknodes": false}, source_lineage: ["Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:rewrite-tie-in-memo-S0009"], preserved_exact_tokens: ["Assistant-only continuity","MUST NOT alter Provider spine contracts","unified event model ownership","shared rules pipeline","Gist generation","AutoRunBoundary/AutoMilestone"], negative_constraints: ["Assistant memory MUST NOT alter Provider spine contracts, unified event model ownership, or shared rules pipeline semantics."], preserved_contractrefs: ["ContractRef: ContractName:Plans/assistant-memory-subsystem.md#1-capability-boundary, ContractName:Plans/assistant-memory-subsystem.md#2-physical-storage-layout, ContractName:Plans/assistant-memory-subsystem.md#5-verification-and-triggers, ContractName:Plans/agent-rules-context.md, ContractName:Plans/storage-plan.md"], owner_hints: ["Plans/rewrite-tie-in-memo.md","Plans/assistant-memory-subsystem.md","Plans/agent-rules-context.md","Plans/storage-plan.md"]}
```

### RTIM-015 - Cross-Doc Stale Canon Retirement Register

```yaml
{plan_unit_id: "RTIM-015", unit_type: "compatibility_note", status: "accepted", owner_doc: "Plans/rewrite-tie-in-memo.md", canonical_text: "Rewrite reconciliation must retire stale Gemini mixed-provider wording, Codex/Copilot CLI-provider language, OpenCode server/cli_launcher framing, provider-native skill/MCP ownership, and Cursor --user-data-dir canon.", gui_related: false, gui_classification_reason: "This unit preserves backend, storage, provider, policy, or ownership requirements rather than visual presentation.", split_recommended: true, depends_on: ["PDS-003","PDS-004","PDS-005","PNC-001","CV-133","CV-147","CBP-017","CBP-018","MA-027","PO-001"], unblocks: [], acceptance_criteria: ["RTIM-015 remains addressable as a fine-grained Rewrite Tie-In PlanUnit with source-span coverage.","ContractRefs, anchors or aliases, exact tokens, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage from the source spans remain preserved.","No WorkNodes, NodeSeeds, executable queues, final node manifests, production build tasks, implementation files, or source code are created by this PlanUnit."], validation_surfaces: ["python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits","python3 scripts/pm-plan-index.py validate"], risk_class: "rewrite_tie_in_drift", reasoning_tier: "standard", context_scope: "rewrite_tie_in", implementation_surfaces: ["Plans/rewrite-tie-in-memo.md"], node_compile_hint: {"mode": "compatibility_retirement","create_worknodes": false}, source_lineage: ["Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:rewrite-tie-in-memo-S0010","Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:rewrite-tie-in-memo-S0011"], preserved_exact_tokens: ["The following contradictions must be retired","Provider split","Direct-provider canon","OpenCode ontology","Runtime vocabulary","Skill and MCP ownership","Cursor runtime boundary"], negative_constraints: [], preserved_contractrefs: [], owner_hints: ["Plans/rewrite-tie-in-memo.md","Plans/Contracts_V0.md","Plans/Multi-Account.md","Plans/FinalGUISpec.md","Plans/CLI_Bridged_Providers.md","Plans/Provider_OpenCode.md","Plans/assistant-chat-design.md"]}
```

### RTIM-016 - Terminal Editor GUI Canon Retirement

```yaml
{plan_unit_id: "RTIM-016", unit_type: "compatibility_note", status: "accepted", owner_doc: "Plans/rewrite-tie-in-memo.md", canonical_text: "Older flat bottom-terminal strip, single editor dock slot, and separate command-log strip assumptions are retired in favor of workgroups, subtabs, split-pane trees, multi-panel editor terminal stack, and explicit DnD semantics.", gui_related: true, gui_classification_reason: "This unit preserves user-visible GUI, UI, route, surface, or visual rendering requirements.", split_recommended: true, depends_on: ["PDS-003","PDS-004","PDS-005","PNC-001","F3-034","F3-035","F3-060","F3-061","F-017","F-023","F-040","UCC-001"], unblocks: [], acceptance_criteria: ["RTIM-016 remains addressable as a fine-grained Rewrite Tie-In PlanUnit with source-span coverage.","ContractRefs, anchors or aliases, exact tokens, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage from the source spans remain preserved.","No WorkNodes, NodeSeeds, executable queues, final node manifests, production build tasks, implementation files, or source code are created by this PlanUnit."], validation_surfaces: ["python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits","python3 scripts/pm-plan-index.py validate"], risk_class: "rewrite_tie_in_drift", reasoning_tier: "standard", context_scope: "rewrite_tie_in", implementation_surfaces: ["Plans/rewrite-tie-in-memo.md"], node_compile_hint: {"mode": "gui_compatibility_retirement","create_worknodes": false}, source_lineage: ["Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:rewrite-tie-in-memo-S0011"], preserved_exact_tokens: ["Terminal/editor GUI canon","flat bottom-terminal strip","single editor dock slot","separate command-log strip","workgroups","subtabs","split-pane trees","multi-panel editor terminal stack","DnD semantics"], negative_constraints: [], preserved_contractrefs: [], owner_hints: ["Plans/rewrite-tie-in-memo.md","Plans/FinalGUISpec.md","Plans/FileManager.md","Plans/UI_Command_Catalog.md"]}
```

### RTIM-017 - Rewrite-Aware Reconciliation Register

```yaml
{plan_unit_id: "RTIM-017", unit_type: "validation", status: "accepted", owner_doc: "Plans/rewrite-tie-in-memo.md", canonical_text: "Rewrite-aware edits must land in the owning docs for browser, debug, runtime, prompt, tool, storage, and GUI deltas before mirrors; newfeatures.md remains historical origin material only.", gui_related: true, gui_classification_reason: "This unit preserves user-visible GUI, UI, route, surface, or visual rendering requirements.", split_recommended: false, depends_on: ["PDS-003","PDS-004","PDS-005","PNC-001","ACD-003","ACD-006","RM-001","SMPFS-001","F3-044","RAP-001","T-001"], unblocks: [], acceptance_criteria: ["RTIM-017 remains addressable as a fine-grained Rewrite Tie-In PlanUnit with source-span coverage.","ContractRefs, anchors or aliases, exact tokens, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage from the source spans remain preserved.","No WorkNodes, NodeSeeds, executable queues, final node manifests, production build tasks, implementation files, or source code are created by this PlanUnit."], validation_surfaces: ["python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits","python3 scripts/pm-plan-index.py validate"], risk_class: "rewrite_tie_in_drift", reasoning_tier: "standard", context_scope: "rewrite_tie_in", implementation_surfaces: ["Plans/rewrite-tie-in-memo.md"], node_compile_hint: {"mode": "owner_reconciliation_register","create_worknodes": false}, source_lineage: ["Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:rewrite-tie-in-memo-S0013"], preserved_exact_tokens: ["Plans likely needing the most rewrite-aware edits","newfeatures.md","historical/origin material","Debug stays an overlay","visible browser-evidence contract"], negative_constraints: [], preserved_contractrefs: ["ContractRef: ContractName:Plans/assistant-chat-design.md, ContractName:Plans/Run_Modes.md, ContractName:Plans/Section15_MVP_Promoted_Features_Spec.md"], owner_hints: ["Plans/rewrite-tie-in-memo.md","Plans/newfeatures.md","Plans/assistant-chat-design.md","Plans/Run_Modes.md","Plans/Permissions_System.md","Plans/storage-plan.md","Plans/Prompt_Pipeline.md","Plans/Contracts_V0.md","Plans/Section15_MVP_Promoted_Features_Spec.md","Plans/FinalGUISpec.md","Plans/UI_Command_Catalog.md","Plans/Runtime_Artifacts_Panel.md","Plans/Tools.md","Plans/newtools.md","Plans/GitHub_Integration.md"]}
```

### RTIM-018 - Rewrite SSOT And Chat Surface Boundaries

```yaml
{plan_unit_id: "RTIM-018", unit_type: "requirement", status: "accepted", owner_doc: "Plans/rewrite-tie-in-memo.md", canonical_text: "Provider contracts, unified event model, tool registry, and patch pipeline stay owner-first; chat tool cards, /diff, Mermaid, and thread Context Detail Pane behavior route through owning chat, GUI, and usage contracts.", gui_related: true, gui_classification_reason: "This unit preserves user-visible GUI, UI, route, surface, or visual rendering requirements.", split_recommended: true, depends_on: ["PDS-003","PDS-004","PDS-005","PNC-001","ACD-041","ACD-051","F3-019","CV-190","CV-192","UF-001"], unblocks: [], acceptance_criteria: ["RTIM-018 remains addressable as a fine-grained Rewrite Tie-In PlanUnit with source-span coverage.","ContractRefs, anchors or aliases, exact tokens, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage from the source spans remain preserved.","No WorkNodes, NodeSeeds, executable queues, final node manifests, production build tasks, implementation files, or source code are created by this PlanUnit."], validation_surfaces: ["python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits","python3 scripts/pm-plan-index.py validate"], risk_class: "rewrite_tie_in_drift", reasoning_tier: "standard", context_scope: "rewrite_tie_in", implementation_surfaces: ["Plans/rewrite-tie-in-memo.md"], node_compile_hint: {"mode": "owner_route_metadata","create_worknodes": false}, source_lineage: ["Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:rewrite-tie-in-memo-S0015"], preserved_exact_tokens: ["single source of truth","Provider contracts","unified event model","tool registry","patch pipeline","chat-native tool result cards","/diff","Mermaid","Context Detail Pane","editor-tab"], negative_constraints: [], preserved_contractrefs: [], owner_hints: ["Plans/rewrite-tie-in-memo.md","Plans/assistant-chat-design.md","Plans/FinalGUISpec.md","Plans/usage-feature.md"]}
```

### RTIM-019 - Unified Rendering Source-Canonical Architecture

```yaml
{plan_unit_id: "RTIM-019", unit_type: "requirement", status: "accepted", owner_doc: "Plans/rewrite-tie-in-memo.md", canonical_text: "Rendering uses one Slint shell, native Rust document core, and isolated preview/browser runtime across chat, editor, embedded panes, detached previews, and browser surfaces, while source text or file bytes remain canonical.", gui_related: true, gui_classification_reason: "This unit preserves user-visible GUI, UI, route, surface, or visual rendering requirements.", split_recommended: false, depends_on: ["PDS-003","PDS-004","PDS-005","PNC-001","F-024","F-027","F-043","F3-027","SMPFS-001"], unblocks: [], acceptance_criteria: ["RTIM-019 remains addressable as a fine-grained Rewrite Tie-In PlanUnit with source-span coverage.","ContractRefs, anchors or aliases, exact tokens, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage from the source spans remain preserved.","No WorkNodes, NodeSeeds, executable queues, final node manifests, production build tasks, implementation files, or source code are created by this PlanUnit."], validation_surfaces: ["python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits","python3 scripts/pm-plan-index.py validate"], risk_class: "rewrite_tie_in_drift", reasoning_tier: "standard", context_scope: "rewrite_tie_in", implementation_surfaces: ["Plans/rewrite-tie-in-memo.md"], node_compile_hint: {"mode": "rendering_architecture_contract","create_worknodes": false}, source_lineage: ["Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:rewrite-tie-in-memo-S0016","Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:rewrite-tie-in-memo-S0017"], preserved_exact_tokens: ["Unified Document/Media Rendering Contract","Slint shell","native Rust document core","isolated preview/browser runtime","source text or file bytes","Rendered DOM/SVG/preview state is a projection"], negative_constraints: ["Do not create separate ad-hoc rendering stacks for Markdown preview, Mermaid preview, and HTML preview."], preserved_contractrefs: [], owner_hints: ["Plans/rewrite-tie-in-memo.md","Plans/FileManager.md","Plans/FinalGUISpec.md","Plans/Section15_MVP_Promoted_Features_Spec.md"]}
```

### RTIM-020 - Preview Subject Artifact Identity

```yaml
{plan_unit_id: "RTIM-020", unit_type: "requirement", status: "accepted", owner_doc: "Plans/rewrite-tie-in-memo.md", canonical_text: "Preview subjects are doc:<document_id> or artifact:<artifact_id>; required artifact metadata and preview_subject_id provide stable restore, UI-state, and audit joins for document-backed and artifact-backed previews.", gui_related: false, gui_classification_reason: "This unit preserves backend, storage, provider, policy, or ownership requirements rather than visual presentation.", split_recommended: false, depends_on: ["PDS-003","PDS-004","PDS-005","PNC-001","SP-001","RAP-001","CV-175","CV-176"], unblocks: [], acceptance_criteria: ["RTIM-020 remains addressable as a fine-grained Rewrite Tie-In PlanUnit with source-span coverage.","ContractRefs, anchors or aliases, exact tokens, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage from the source spans remain preserved.","No WorkNodes, NodeSeeds, executable queues, final node manifests, production build tasks, implementation files, or source code are created by this PlanUnit."], validation_surfaces: ["python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits","python3 scripts/pm-plan-index.py validate"], risk_class: "rewrite_tie_in_drift", reasoning_tier: "standard", context_scope: "rewrite_tie_in", implementation_surfaces: ["Plans/rewrite-tie-in-memo.md"], node_compile_hint: {"mode": "artifact_identity_contract","create_worknodes": false}, source_lineage: ["Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:rewrite-tie-in-memo-S0019","Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:rewrite-tie-in-memo-S0020","Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:rewrite-tie-in-memo-S0021","Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:rewrite-tie-in-memo-S0022","Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:rewrite-tie-in-memo-S0023"], preserved_exact_tokens: ["doc:<document_id>","artifact:<artifact_id>","artifact_id","artifact_kind","source_kind","origin_surface","source_revision","preview_subject_id"], negative_constraints: [], preserved_contractrefs: [], owner_hints: ["Plans/rewrite-tie-in-memo.md","Plans/storage-plan.md","Plans/Runtime_Artifacts_Panel.md","Plans/Contracts_V0.md"]}
```

### RTIM-021 - Artifact Open Source Save Link Rules

```yaml
{plan_unit_id: "RTIM-021", unit_type: "requirement", status: "accepted", owner_doc: "Plans/rewrite-tie-in-memo.md", canonical_text: "open_source opens real doc buffers for doc:* and transient generated://<artifact_id> source buffers for artifact:* until Save As or Insert into file creates the first stable workspace path.", gui_related: true, gui_classification_reason: "This unit preserves user-visible GUI, UI, route, surface, or visual rendering requirements.", split_recommended: false, depends_on: ["PDS-003","PDS-004","PDS-005","PNC-001","F-034","F-035","F-036","ACD-041","C-008","CV-175","CV-176"], unblocks: [], acceptance_criteria: ["RTIM-021 remains addressable as a fine-grained Rewrite Tie-In PlanUnit with source-span coverage.","ContractRefs, anchors or aliases, exact tokens, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage from the source spans remain preserved.","No WorkNodes, NodeSeeds, executable queues, final node manifests, production build tasks, implementation files, or source code are created by this PlanUnit."], validation_surfaces: ["python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits","python3 scripts/pm-plan-index.py validate"], risk_class: "rewrite_tie_in_drift", reasoning_tier: "standard", context_scope: "rewrite_tie_in", implementation_surfaces: ["Plans/rewrite-tie-in-memo.md"], node_compile_hint: {"mode": "route_open_contract","create_worknodes": false}, source_lineage: ["Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:rewrite-tie-in-memo-S0024","Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:rewrite-tie-in-memo-S0025"], preserved_exact_tokens: ["open_source","doc:*","artifact:*","generated://<artifact_id>","Save As","Insert into file","last_saved_path"], negative_constraints: ["open_source for message-backed Mermaid/Markdown MUST NOT silently invent a workspace file on disk."], preserved_contractrefs: [], owner_hints: ["Plans/rewrite-tie-in-memo.md","Plans/FileManager.md","Plans/assistant-chat-design.md","Plans/FinalGUISpec.md","Plans/Crosswalk.md"]}
```

### RTIM-022 - Identity-Native Route Lift

```yaml
{plan_unit_id: "RTIM-022", unit_type: "requirement", status: "accepted", owner_doc: "Plans/rewrite-tie-in-memo.md", canonical_text: "OpenSubject resolves doc/artifact identity before path realization; OpenFile path form is only for already-known real files, and resume_url is serialization/restore rather than hidden route canon.", gui_related: true, gui_classification_reason: "This unit preserves user-visible GUI, UI, route, surface, or visual rendering requirements.", split_recommended: true, depends_on: ["PDS-003","PDS-004","PDS-005","PNC-001","C-007","C-008","C-024","F-034","F-036","CV-168","CV-175","CV-176"], unblocks: [], acceptance_criteria: ["RTIM-022 remains addressable as a fine-grained Rewrite Tie-In PlanUnit with source-span coverage.","ContractRefs, anchors or aliases, exact tokens, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage from the source spans remain preserved.","No WorkNodes, NodeSeeds, executable queues, final node manifests, production build tasks, implementation files, or source code are created by this PlanUnit."], validation_surfaces: ["python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits","python3 scripts/pm-plan-index.py validate"], risk_class: "rewrite_tie_in_drift", reasoning_tier: "standard", context_scope: "rewrite_tie_in", implementation_surfaces: ["Plans/rewrite-tie-in-memo.md"], node_compile_hint: {"mode": "identity_native_routing","create_worknodes": false}, source_lineage: ["Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:rewrite-tie-in-memo-S0026"], preserved_exact_tokens: ["OpenSubject","subject_id -> backing document or transient generated buffer -> routed surface","OpenFile { path... }","migration alias only","resume_url","serialization","restore"], negative_constraints: ["OpenFile must not be stretched into a universal path-open contract for generated/runtime/preview-backed subjects, non-file artifacts, or artifact/report opens."], preserved_contractrefs: [], owner_hints: ["Plans/rewrite-tie-in-memo.md","Plans/Crosswalk.md","Plans/FileManager.md","Plans/Contracts_V0.md"]}
```

### RTIM-023 - Owner Delta And Provider Recovery Routing

```yaml
{plan_unit_id: "RTIM-023", unit_type: "validation", status: "accepted", owner_doc: "Plans/rewrite-tie-in-memo.md", canonical_text: "Reviewer deltas, projection health, minority_advisory, runtime-artifact schema registration, source-open resolver rules, and provider recovery controls must move to owner docs rather than remain memo-only observations.", gui_related: false, gui_classification_reason: "This unit preserves backend, storage, provider, policy, or ownership requirements rather than visual presentation.", split_recommended: true, depends_on: ["PDS-003","PDS-004","PDS-005","PNC-001","SP-001","RAP-001","MA-052","CV-183","CV-184"], unblocks: [], acceptance_criteria: ["RTIM-023 remains addressable as a fine-grained Rewrite Tie-In PlanUnit with source-span coverage.","ContractRefs, anchors or aliases, exact tokens, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage from the source spans remain preserved.","No WorkNodes, NodeSeeds, executable queues, final node manifests, production build tasks, implementation files, or source code are created by this PlanUnit."], validation_surfaces: ["python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits","python3 scripts/pm-plan-index.py validate"], risk_class: "rewrite_tie_in_drift", reasoning_tier: "standard", context_scope: "rewrite_tie_in", implementation_surfaces: ["Plans/rewrite-tie-in-memo.md"], node_compile_hint: {"mode": "owner_gap_register","create_worknodes": false}, source_lineage: ["Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:rewrite-tie-in-memo-S0026"], preserved_exact_tokens: ["owner-level deltas","minority_advisory","runtime-artifact schema registration","source-open resolver rules","Provider recovery controls","manual `set active`"], negative_constraints: [], preserved_contractrefs: [], owner_hints: ["Plans/rewrite-tie-in-memo.md","Plans/storage-plan.md","Plans/Runtime_Artifacts_Panel.md","Plans/Multi-Account.md","Plans/Contracts_V0.md"]}
```

### RTIM-024 - PreviewSession Identity Lifecycle Contract

```yaml
{plan_unit_id: "RTIM-024", unit_type: "requirement", status: "accepted", owner_doc: "Plans/rewrite-tie-in-memo.md", canonical_text: "PreviewSession tracks rendered subject identity and lifecycle states while browser-capable surfaces layer browser_session_id, session_class, automation, auth, evidence, route, focus, and recovery identity without collapsing them into generic preview instances.", gui_related: false, gui_classification_reason: "This unit preserves backend, storage, provider, policy, or ownership requirements rather than visual presentation.", split_recommended: true, depends_on: ["PDS-003","PDS-004","PDS-005","PNC-001","SP-001","SMPFS-001","F-040","CV-147"], unblocks: [], acceptance_criteria: ["RTIM-024 remains addressable as a fine-grained Rewrite Tie-In PlanUnit with source-span coverage.","ContractRefs, anchors or aliases, exact tokens, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage from the source spans remain preserved.","No WorkNodes, NodeSeeds, executable queues, final node manifests, production build tasks, implementation files, or source code are created by this PlanUnit."], validation_surfaces: ["python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits","python3 scripts/pm-plan-index.py validate"], risk_class: "rewrite_tie_in_drift", reasoning_tier: "standard", context_scope: "rewrite_tie_in", implementation_surfaces: ["Plans/rewrite-tie-in-memo.md"], node_compile_hint: {"mode": "preview_session_identity","create_worknodes": false}, source_lineage: ["Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:rewrite-tie-in-memo-S0027"], preserved_exact_tokens: ["PreviewSession","browser_session_id","session_class","created","loading","ready","stale","degraded","error","closed","takeover","promote"], negative_constraints: [], preserved_contractrefs: ["ContractRef: ContractName:Plans/storage-plan.md, ContractName:Plans/Section15_MVP_Promoted_Features_Spec.md, ContractName:Plans/FileManager.md","ContractRef: ContractName:Plans/FinalGUISpec.md, ContractName:Plans/storage-plan.md, ContractName:Plans/Permissions_System.md"], owner_hints: ["Plans/rewrite-tie-in-memo.md","Plans/storage-plan.md","Plans/Section15_MVP_Promoted_Features_Spec.md","Plans/FileManager.md","Plans/FinalGUISpec.md","Plans/Permissions_System.md"]}
```

### RTIM-025 - Preview Attachment And Command Routing

```yaml
{plan_unit_id: "RTIM-025", unit_type: "requirement", status: "accepted", owner_doc: "Plans/rewrite-tie-in-memo.md", canonical_text: "Preview attachment targets are chat_card, editor_preview, embedded_doc_pane, editor_browser_tab, and detached_window; bottom_panel_browser is noncanonical and only one attachment holds mutation-capable focus at a time.", gui_related: true, gui_classification_reason: "This unit preserves user-visible GUI, UI, route, surface, or visual rendering requirements.", split_recommended: true, depends_on: ["PDS-003","PDS-004","PDS-005","PNC-001","F-024","F-040","F3-019","F3-060","UCC-001"], unblocks: [], acceptance_criteria: ["RTIM-025 remains addressable as a fine-grained Rewrite Tie-In PlanUnit with source-span coverage.","ContractRefs, anchors or aliases, exact tokens, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage from the source spans remain preserved.","No WorkNodes, NodeSeeds, executable queues, final node manifests, production build tasks, implementation files, or source code are created by this PlanUnit."], validation_surfaces: ["python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits","python3 scripts/pm-plan-index.py validate"], risk_class: "rewrite_tie_in_drift", reasoning_tier: "standard", context_scope: "rewrite_tie_in", implementation_surfaces: ["Plans/rewrite-tie-in-memo.md"], node_compile_hint: {"mode": "gui_attachment_contract","create_worknodes": false}, source_lineage: ["Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:rewrite-tie-in-memo-S0027"], preserved_exact_tokens: ["chat_card","editor_preview","embedded_doc_pane","editor_browser_tab","detached_window","bottom_panel_browser","mutation-capable focus"], negative_constraints: [], preserved_contractrefs: [], owner_hints: ["Plans/rewrite-tie-in-memo.md","Plans/FileManager.md","Plans/FinalGUISpec.md","Plans/UI_Command_Catalog.md"]}
```

### RTIM-026 - Preview Persistence Restore And Audit State

```yaml
{plan_unit_id: "RTIM-026", unit_type: "requirement", status: "accepted", owner_doc: "Plans/rewrite-tie-in-memo.md", canonical_text: "The app persists preview intent, attachment target, visible errors, lifecycle changes, and overlay state sufficient for restore/audit, but it does not persist live DOM state or browser storage as PreviewSession state.", gui_related: false, gui_classification_reason: "This unit preserves backend, storage, provider, policy, or ownership requirements rather than visual presentation.", split_recommended: true, depends_on: ["PDS-003","PDS-004","PDS-005","PNC-001","SP-001","RAP-001","PS-001","CV-010","CV-235"], unblocks: [], acceptance_criteria: ["RTIM-026 remains addressable as a fine-grained Rewrite Tie-In PlanUnit with source-span coverage.","ContractRefs, anchors or aliases, exact tokens, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage from the source spans remain preserved.","No WorkNodes, NodeSeeds, executable queues, final node manifests, production build tasks, implementation files, or source code are created by this PlanUnit."], validation_surfaces: ["python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits","python3 scripts/pm-plan-index.py validate"], risk_class: "rewrite_tie_in_drift", reasoning_tier: "standard", context_scope: "rewrite_tie_in", implementation_surfaces: ["Plans/rewrite-tie-in-memo.md"], node_compile_hint: {"mode": "preview_restore_contract","create_worknodes": false}, source_lineage: ["Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:rewrite-tie-in-memo-S0027"], preserved_exact_tokens: ["Persistence and audit expectations","Minimum restore rule","preview_session_id","preview_subject_id","preview_surface_kind","transport_mode","browser-session overlay state"], negative_constraints: ["The app MUST NOT persist live DOM state or browser storage as part of PreviewSession state.","Live automation/auth sessions do not silently resume active work after restart."], preserved_contractrefs: ["ContractRef: ContractName:Plans/storage-plan.md, ContractName:Plans/UI_Command_Catalog.md, ContractName:Plans/Runtime_Artifacts_Panel.md","ContractRef: ContractName:Plans/storage-plan.md, ContractName:Plans/Section15_MVP_Promoted_Features_Spec.md, ContractName:Plans/Contracts_V0.md"], owner_hints: ["Plans/rewrite-tie-in-memo.md","Plans/storage-plan.md","Plans/Runtime_Artifacts_Panel.md","Plans/Permissions_System.md"]}
```

### RTIM-027 - Generated Preview Runtime Security

```yaml
{plan_unit_id: "RTIM-027", unit_type: "constraint", status: "accepted", owner_doc: "Plans/rewrite-tie-in-memo.md", canonical_text: "Generated previews use pm-preview://session/<preview_session_id>/ with app-controlled assets, restrictive CSP, sanitized Markdown-derived HTML, required source-mapping metadata attributes, and no arbitrary remote script/cookie reuse.", gui_related: false, gui_classification_reason: "This unit preserves backend, storage, provider, policy, or ownership requirements rather than visual presentation.", split_recommended: true, depends_on: ["PDS-003","PDS-004","PDS-005","PNC-001","PS-001","T-001","SP-001"], unblocks: [], acceptance_criteria: ["RTIM-027 remains addressable as a fine-grained Rewrite Tie-In PlanUnit with source-span coverage.","ContractRefs, anchors or aliases, exact tokens, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage from the source spans remain preserved.","No WorkNodes, NodeSeeds, executable queues, final node manifests, production build tasks, implementation files, or source code are created by this PlanUnit."], validation_surfaces: ["python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits","python3 scripts/pm-plan-index.py validate"], risk_class: "rewrite_tie_in_drift", reasoning_tier: "standard", context_scope: "rewrite_tie_in", implementation_surfaces: ["Plans/rewrite-tie-in-memo.md"], node_compile_hint: {"mode": "preview_security_boundary","create_worknodes": false}, source_lineage: ["Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:rewrite-tie-in-memo-S0029"], preserved_exact_tokens: ["pm-preview://session/<preview_session_id>/","restrictive CSP","data-pm-node-id","data-pm-source-start","data-pm-source-end","data-pm-parse-revision","data-pm-capabilities"], negative_constraints: ["Generated preview pages MUST NOT enable arbitrary remote script execution.","Generated preview pages MUST NOT reuse workspace-browser cookies/storage by default."], preserved_contractrefs: [], owner_hints: ["Plans/rewrite-tie-in-memo.md","Plans/Permissions_System.md","Plans/Tools.md","Plans/storage-plan.md"]}
```

### RTIM-028 - Preview Bridge Allowlist

```yaml
{plan_unit_id: "RTIM-028", unit_type: "constraint", status: "accepted", owner_doc: "Plans/rewrite-tie-in-memo.md", canonical_text: "Generated-preview bridge v1 exposes only open_source, open_detached, request_edit, export_svg, export_png, copy_svg, and copy_image; no other host command family is implicitly available.", gui_related: true, gui_classification_reason: "This unit preserves user-visible GUI, UI, route, surface, or visual rendering requirements.", split_recommended: false, depends_on: ["PDS-003","PDS-004","PDS-005","PNC-001","UCC-001","F-036","F-047","PS-001"], unblocks: [], acceptance_criteria: ["RTIM-028 remains addressable as a fine-grained Rewrite Tie-In PlanUnit with source-span coverage.","ContractRefs, anchors or aliases, exact tokens, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage from the source spans remain preserved.","No WorkNodes, NodeSeeds, executable queues, final node manifests, production build tasks, implementation files, or source code are created by this PlanUnit."], validation_surfaces: ["python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits","python3 scripts/pm-plan-index.py validate"], risk_class: "rewrite_tie_in_drift", reasoning_tier: "standard", context_scope: "rewrite_tie_in", implementation_surfaces: ["Plans/rewrite-tie-in-memo.md"], node_compile_hint: {"mode": "preview_bridge_allowlist","create_worknodes": false}, source_lineage: ["Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:rewrite-tie-in-memo-S0029"], preserved_exact_tokens: ["open_source","open_detached","request_edit","export_svg","export_png","copy_svg","copy_image","No other host command family"], negative_constraints: [], preserved_contractrefs: [], owner_hints: ["Plans/rewrite-tie-in-memo.md","Plans/UI_Command_Catalog.md","Plans/FileManager.md","Plans/Permissions_System.md"]}
```

### RTIM-029 - Canonical Rendering Stack And Trust Tiers

```yaml
{plan_unit_id: "RTIM-029", unit_type: "decision", status: "accepted", owner_doc: "Plans/rewrite-tie-in-memo.md", canonical_text: "The canonical rendering stack uses pulldown-cmark, syntect, ammonia, Mermaid validation, and resvg/usvg/tiny-skia; generated previews, visual modules, and full HTML/browser mode remain separate trust tiers.", gui_related: true, gui_classification_reason: "This unit preserves user-visible GUI, UI, route, surface, or visual rendering requirements.", split_recommended: false, depends_on: ["PDS-003","PDS-004","PDS-005","PNC-001","F-043","F3-027","PS-001"], unblocks: [], acceptance_criteria: ["RTIM-029 remains addressable as a fine-grained Rewrite Tie-In PlanUnit with source-span coverage.","ContractRefs, anchors or aliases, exact tokens, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage from the source spans remain preserved.","No WorkNodes, NodeSeeds, executable queues, final node manifests, production build tasks, implementation files, or source code are created by this PlanUnit."], validation_surfaces: ["python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits","python3 scripts/pm-plan-index.py validate"], risk_class: "rewrite_tie_in_drift", reasoning_tier: "standard", context_scope: "rewrite_tie_in", implementation_surfaces: ["Plans/rewrite-tie-in-memo.md"], node_compile_hint: {"mode": "render_stack_decision","create_worknodes": false}, source_lineage: ["Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:rewrite-tie-in-memo-S0030"], preserved_exact_tokens: ["pulldown-cmark","syntect","ammonia","Mermaid validation","resvg","usvg","tiny-skia","D3","Chart.js","Three.js"], negative_constraints: ["Full HTML/browser mode must not inherit source-mutation privileges by default.","The visual-module library allowlist defaults to empty unless a bundled library is versioned, reviewed, and explicitly approved."], preserved_contractrefs: [], owner_hints: ["Plans/rewrite-tie-in-memo.md","Plans/FileManager.md","Plans/FinalGUISpec.md","Plans/Permissions_System.md"]}
```

### RTIM-030 - Browser Runtime Packaging And CEF Strategy

```yaml
{plan_unit_id: "RTIM-030", unit_type: "decision", status: "accepted", owner_doc: "Plans/rewrite-tie-in-memo.md", canonical_text: "Puppet Master owns a PM-managed pinned bundled CEF-class Chromium runtime, including version/cache/integrity/rollback/offline install policy, multi-process, sandbox, codec, PDF, DevTools, platform layout, and atomic update behavior.", gui_related: false, gui_classification_reason: "This unit preserves backend, storage, provider, policy, or ownership requirements rather than visual presentation.", split_recommended: true, depends_on: ["PDS-003","PDS-004","PDS-005","PNC-001","SMPFS-001","SP-001","N2-001"], unblocks: [], acceptance_criteria: ["RTIM-030 remains addressable as a fine-grained Rewrite Tie-In PlanUnit with source-span coverage.","ContractRefs, anchors or aliases, exact tokens, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage from the source spans remain preserved.","No WorkNodes, NodeSeeds, executable queues, final node manifests, production build tasks, implementation files, or source code are created by this PlanUnit."], validation_surfaces: ["python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits","python3 scripts/pm-plan-index.py validate"], risk_class: "rewrite_tie_in_drift", reasoning_tier: "standard", context_scope: "rewrite_tie_in", implementation_surfaces: ["Plans/rewrite-tie-in-memo.md"], node_compile_hint: {"mode": "browser_runtime_packaging","create_worknodes": false}, source_lineage: ["Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:rewrite-tie-in-memo-S0032"], preserved_exact_tokens: ["CEF-class Chromium runtime","wef","implementation candidate","pin the version","verify integrity","offline install","~1 GB","runtime-bundle","first-use download","system-installed browser"], negative_constraints: ["wef must not become the architectural linchpin.","The browser runtime is never a first-use download or dependency on a system-installed browser."], preserved_contractrefs: ["ContractRef: ContractName:Plans/Section15_MVP_Promoted_Features_Spec.md, ContractName:Plans/FinalGUISpec.md, ContractName:Plans/Permissions_System.md"], owner_hints: ["Plans/rewrite-tie-in-memo.md","Plans/Section15_MVP_Promoted_Features_Spec.md","Plans/storage-plan.md","Plans/newtools.md"]}
```

### RTIM-031 - Browser Platform UX And Degraded Behavior

```yaml
{plan_unit_id: "RTIM-031", unit_type: "requirement", status: "accepted", owner_doc: "Plans/rewrite-tie-in-memo.md", canonical_text: "Browser surfaces use editor-tab primary hosting plus first-class detached windows on one PM browser model; degraded UX must disclose runtime_unavailable, preserve source/native surfaces, and reject blank panes or screenshot-only substitution as steady state.", gui_related: true, gui_classification_reason: "This unit preserves user-visible GUI, UI, route, surface, or visual rendering requirements.", split_recommended: true, depends_on: ["PDS-003","PDS-004","PDS-005","PNC-001","SMPFS-001","F3-027","F3-060","PS-001"], unblocks: [], acceptance_criteria: ["RTIM-031 remains addressable as a fine-grained Rewrite Tie-In PlanUnit with source-span coverage.","ContractRefs, anchors or aliases, exact tokens, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage from the source spans remain preserved.","No WorkNodes, NodeSeeds, executable queues, final node manifests, production build tasks, implementation files, or source code are created by this PlanUnit."], validation_surfaces: ["python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits","python3 scripts/pm-plan-index.py validate"], risk_class: "rewrite_tie_in_drift", reasoning_tier: "standard", context_scope: "rewrite_tie_in", implementation_surfaces: ["Plans/rewrite-tie-in-memo.md"], node_compile_hint: {"mode": "browser_degraded_gui_contract","create_worknodes": false}, source_lineage: ["Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:rewrite-tie-in-memo-S0032"], preserved_exact_tokens: ["editor-tab browser","detached window","runtime_unavailable","open live browser session","watch run","blank panes","screenshot-only substitution","requested/effective runtime disclosure"], negative_constraints: ["Browser runtime failure MUST NOT silently swap to an unrelated legacy webview/browser model.","Blank panes and screenshot-only substitution are not acceptable steady-state fallback behavior for browser-class surfaces."], preserved_contractrefs: ["ContractRef: ContractName:Plans/Section15_MVP_Promoted_Features_Spec.md, ContractName:Plans/Permissions_System.md, ContractName:Plans/storage-plan.md"], owner_hints: ["Plans/rewrite-tie-in-memo.md","Plans/FinalGUISpec.md","Plans/Section15_MVP_Promoted_Features_Spec.md","Plans/Permissions_System.md"]}
```

### RTIM-032 - Browser Doctor Preflight Checks

```yaml
{plan_unit_id: "RTIM-032", unit_type: "validation", status: "accepted", owner_doc: "Plans/rewrite-tie-in-memo.md", canonical_text: "Doctor/setup validates bundled browser runtime presence, expected version, startup health, editor-tab host, and detached host before browser capability is advertised.", gui_related: false, gui_classification_reason: "This unit preserves backend, storage, provider, policy, or ownership requirements rather than visual presentation.", split_recommended: false, depends_on: ["PDS-003","PDS-004","PDS-005","PNC-001","N2-001","SP-001","PS-001"], unblocks: [], acceptance_criteria: ["RTIM-032 remains addressable as a fine-grained Rewrite Tie-In PlanUnit with source-span coverage.","ContractRefs, anchors or aliases, exact tokens, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage from the source spans remain preserved.","No WorkNodes, NodeSeeds, executable queues, final node manifests, production build tasks, implementation files, or source code are created by this PlanUnit."], validation_surfaces: ["python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits","python3 scripts/pm-plan-index.py validate"], risk_class: "rewrite_tie_in_drift", reasoning_tier: "standard", context_scope: "rewrite_tie_in", implementation_surfaces: ["Plans/rewrite-tie-in-memo.md"], node_compile_hint: {"mode": "doctor_preflight_validation","create_worknodes": false}, source_lineage: ["Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:rewrite-tie-in-memo-S0032"], preserved_exact_tokens: ["Required doctor/preflight checks","bundled browser runtime is present and healthy","expected runtime set","editor-tab browser host","detached browser host"], negative_constraints: [], preserved_contractrefs: ["ContractRef: ContractName:Plans/newtools.md, ContractName:Plans/Permissions_System.md, ContractName:Plans/storage-plan.md"], owner_hints: ["Plans/rewrite-tie-in-memo.md","Plans/newtools.md","Plans/storage-plan.md","Plans/Permissions_System.md"]}
```

### RTIM-033 - Preview Mutation Payload And Patch Validation

```yaml
{plan_unit_id: "RTIM-033", unit_type: "requirement", status: "accepted", owner_doc: "Plans/rewrite-tie-in-memo.md", canonical_text: "Preview mutations resolve to canonical text patches, validate node_id, parse_revision and source_revision, stay inside mapped source spans, and fail with deterministic result codes for stale revisions, unsupported regions, or ambiguous mappings.", gui_related: false, gui_classification_reason: "This unit preserves backend, storage, provider, policy, or ownership requirements rather than visual presentation.", split_recommended: true, depends_on: ["PDS-003","PDS-004","PDS-005","PNC-001","F-008","F-047","F2-086","PS-001"], unblocks: [], acceptance_criteria: ["RTIM-033 remains addressable as a fine-grained Rewrite Tie-In PlanUnit with source-span coverage.","ContractRefs, anchors or aliases, exact tokens, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage from the source spans remain preserved.","No WorkNodes, NodeSeeds, executable queues, final node manifests, production build tasks, implementation files, or source code are created by this PlanUnit."], validation_surfaces: ["python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits","python3 scripts/pm-plan-index.py validate"], risk_class: "rewrite_tie_in_drift", reasoning_tier: "standard", context_scope: "rewrite_tie_in", implementation_surfaces: ["Plans/rewrite-tie-in-memo.md"], node_compile_hint: {"mode": "preview_patch_contract","create_worknodes": false}, source_lineage: ["Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:rewrite-tie-in-memo-S0034"], preserved_exact_tokens: ["Preview action protocol v1","toggle_checkbox","edit_heading_text","replace_mermaid_block","parse_revision","source_revision","ambiguous_mapping","unsupported_region"], negative_constraints: ["Preview actions MUST NOT write directly to disk and MUST NOT bypass the normal save path."], preserved_contractrefs: ["ContractRef: ContractName:Plans/FileManager.md, ContractName:Plans/FinalGUISpec.md","ContractRef: ContractName:Plans/FileManager.md, ContractName:Plans/Permissions_System.md"], owner_hints: ["Plans/rewrite-tie-in-memo.md","Plans/FileManager.md","Plans/FileSafe.md","Plans/Permissions_System.md"]}
```

### RTIM-034 - Preview Edit UI Outcomes And Buffer Integration

```yaml
{plan_unit_id: "RTIM-034", unit_type: "requirement", status: "accepted", owner_doc: "Plans/rewrite-tie-in-memo.md", canonical_text: "Successful preview edits update the shared buffer, dirty state, undo/redo history, and preview revision; failures focus source where possible and show deterministic user-facing reasons.", gui_related: true, gui_classification_reason: "This unit preserves user-visible GUI, UI, route, surface, or visual rendering requirements.", split_recommended: true, depends_on: ["PDS-003","PDS-004","PDS-005","PNC-001","F-008","F-018","F3-019","C-034"], unblocks: [], acceptance_criteria: ["RTIM-034 remains addressable as a fine-grained Rewrite Tie-In PlanUnit with source-span coverage.","ContractRefs, anchors or aliases, exact tokens, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage from the source spans remain preserved.","No WorkNodes, NodeSeeds, executable queues, final node manifests, production build tasks, implementation files, or source code are created by this PlanUnit."], validation_surfaces: ["python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits","python3 scripts/pm-plan-index.py validate"], risk_class: "rewrite_tie_in_drift", reasoning_tier: "standard", context_scope: "rewrite_tie_in", implementation_surfaces: ["Plans/rewrite-tie-in-memo.md"], node_compile_hint: {"mode": "preview_edit_gui_contract","create_worknodes": false}, source_lineage: ["Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:rewrite-tie-in-memo-S0034"], preserved_exact_tokens: ["Shared-buffer integration","dirty state","undo/redo history","UI outcomes and result codes","applied_patch","rejected_stale_revision","permission_denied","fallback_focus_source","render_error"], negative_constraints: [], preserved_contractrefs: ["ContractRef: ContractName:Plans/FileManager.md, ContractName:Plans/storage-plan.md","ContractRef: ContractName:Plans/FinalGUISpec.md, ContractName:Plans/Crosswalk.md"], owner_hints: ["Plans/rewrite-tie-in-memo.md","Plans/FileManager.md","Plans/FinalGUISpec.md","Plans/Crosswalk.md"]}
```

### RTIM-035 - Selection Annotation Chat Handoff Boundary

```yaml
{plan_unit_id: "RTIM-035", unit_type: "requirement", status: "accepted", owner_doc: "Plans/rewrite-tie-in-memo.md", canonical_text: "Selection actions such as comment, replace, insert_after, remove, and send_selection_to_chat create annotations or document_selection_context attachments and are not direct preview mutations unless wired to the validated patch path.", gui_related: true, gui_classification_reason: "This unit preserves user-visible GUI, UI, route, surface, or visual rendering requirements.", split_recommended: false, depends_on: ["PDS-003","PDS-004","PDS-005","PNC-001","ACD-048","ACD-051","F-025","SP-001","F2-089"], unblocks: [], acceptance_criteria: ["RTIM-035 remains addressable as a fine-grained Rewrite Tie-In PlanUnit with source-span coverage.","ContractRefs, anchors or aliases, exact tokens, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage from the source spans remain preserved.","No WorkNodes, NodeSeeds, executable queues, final node manifests, production build tasks, implementation files, or source code are created by this PlanUnit."], validation_surfaces: ["python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits","python3 scripts/pm-plan-index.py validate"], risk_class: "rewrite_tie_in_drift", reasoning_tier: "standard", context_scope: "rewrite_tie_in", implementation_surfaces: ["Plans/rewrite-tie-in-memo.md"], node_compile_hint: {"mode": "selection_handoff_contract","create_worknodes": false}, source_lineage: ["Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:rewrite-tie-in-memo-S0035"], preserved_exact_tokens: ["comment","replace","insert_after","remove","send_selection_to_chat","document_selection_context","created_annotation","selection_sent_to_chat","selection_forward_blocked"], negative_constraints: [], preserved_contractrefs: ["ContractRef: ContractName:Plans/assistant-chat-design.md, ContractName:Plans/storage-plan.md, ContractName:Plans/FileSafe.md"], owner_hints: ["Plans/rewrite-tie-in-memo.md","Plans/assistant-chat-design.md","Plans/storage-plan.md","Plans/FileSafe.md","Plans/FileManager.md"]}
```

### RTIM-036 - Markdown Mermaid Source Artifact Contract

```yaml
{plan_unit_id: "RTIM-036", unit_type: "requirement", status: "accepted", owner_doc: "Plans/rewrite-tie-in-memo.md", canonical_text: "Markdown uses Rust parser/mapping and sanitized HTML, while Mermaid remains text-canonical from fenced mermaid blocks or .mmd files, is validated before render, exports SVG as canonical render artifact, and derives PNG from SVG rasterization.", gui_related: true, gui_classification_reason: "This unit preserves user-visible GUI, UI, route, surface, or visual rendering requirements.", split_recommended: false, depends_on: ["PDS-003","PDS-004","PDS-005","PNC-001","F-043","F3-019","RAP-001"], unblocks: [], acceptance_criteria: ["RTIM-036 remains addressable as a fine-grained Rewrite Tie-In PlanUnit with source-span coverage.","ContractRefs, anchors or aliases, exact tokens, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage from the source spans remain preserved.","No WorkNodes, NodeSeeds, executable queues, final node manifests, production build tasks, implementation files, or source code are created by this PlanUnit."], validation_surfaces: ["python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits","python3 scripts/pm-plan-index.py validate"], risk_class: "rewrite_tie_in_drift", reasoning_tier: "standard", context_scope: "rewrite_tie_in", implementation_surfaces: ["Plans/rewrite-tie-in-memo.md"], node_compile_hint: {"mode": "markdown_mermaid_contract","create_worknodes": false}, source_lineage: ["Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:rewrite-tie-in-memo-S0036"], preserved_exact_tokens: ["Rust Markdown parser/mapping pipeline","Generated Markdown preview HTML is sanitized","fenced `mermaid` blocks",".mmd","hidden second diagram object model","SVG","PNG"], negative_constraints: ["Do not introduce a hidden second diagram object model."], preserved_contractrefs: [], owner_hints: ["Plans/rewrite-tie-in-memo.md","Plans/FileManager.md","Plans/FinalGUISpec.md","Plans/Runtime_Artifacts_Panel.md"]}
```

### RTIM-037 - Rendering Non Goals And Host Bridge Prohibitions

```yaml
{plan_unit_id: "RTIM-037", unit_type: "constraint", status: "accepted", owner_doc: "Plans/rewrite-tie-in-memo.md", canonical_text: "The rendering contract has no requirement for identical embedded browser panes on every platform, arbitrary WYSIWYG DOM editing, hidden diagram state, or a full-privilege host bridge shared between generated preview content and arbitrary workspace HTML.", gui_related: true, gui_classification_reason: "This unit preserves user-visible GUI, UI, route, surface, or visual rendering requirements.", split_recommended: false, depends_on: ["PDS-003","PDS-004","PDS-005","PNC-001","PS-001","F-043","SMPFS-001"], unblocks: [], acceptance_criteria: ["RTIM-037 remains addressable as a fine-grained Rewrite Tie-In PlanUnit with source-span coverage.","ContractRefs, anchors or aliases, exact tokens, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage from the source spans remain preserved.","No WorkNodes, NodeSeeds, executable queues, final node manifests, production build tasks, implementation files, or source code are created by this PlanUnit."], validation_surfaces: ["python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits","python3 scripts/pm-plan-index.py validate"], risk_class: "rewrite_tie_in_drift", reasoning_tier: "standard", context_scope: "rewrite_tie_in", implementation_surfaces: ["Plans/rewrite-tie-in-memo.md"], node_compile_hint: {"mode": "non_goal_constraint","create_worknodes": false}, source_lineage: ["Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:rewrite-tie-in-memo-S0037"], preserved_exact_tokens: ["Non-goals and prohibitions","No requirement that embedded browser panes work identically","arbitrary WYSIWYG DOM editing","No hidden diagram state","No full-privilege host bridge"], negative_constraints: ["No hidden diagram state may drift from .md or .mmd source.","No full-privilege host bridge may be shared between generated preview content and arbitrary workspace HTML."], preserved_contractrefs: [], owner_hints: ["Plans/rewrite-tie-in-memo.md","Plans/Permissions_System.md","Plans/FileManager.md","Plans/Section15_MVP_Promoted_Features_Spec.md"]}
```

### RTIM-038 - Scheduler Projection Tie-In

```yaml
{plan_unit_id: "RTIM-038", unit_type: "requirement", status: "accepted", owner_doc: "Plans/rewrite-tie-in-memo.md", canonical_text: "Runtime scheduler updates are event-driven; queue analysis, remediation lineage, safe points, and projector state derive from canonical event/projection state, with safe points distinct from user-facing restore/rollback history.", gui_related: false, gui_classification_reason: "This unit preserves backend, storage, provider, policy, or ownership requirements rather than visual presentation.", split_recommended: true, depends_on: ["PDS-003","PDS-004","PDS-005","PNC-001","CV-215","CV-216","CV-217","CV-235","SP-001"], unblocks: [], acceptance_criteria: ["RTIM-038 remains addressable as a fine-grained Rewrite Tie-In PlanUnit with source-span coverage.","ContractRefs, anchors or aliases, exact tokens, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage from the source spans remain preserved.","No WorkNodes, NodeSeeds, executable queues, final node manifests, production build tasks, implementation files, or source code are created by this PlanUnit."], validation_surfaces: ["python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits","python3 scripts/pm-plan-index.py validate"], risk_class: "rewrite_tie_in_drift", reasoning_tier: "standard", context_scope: "rewrite_tie_in", implementation_surfaces: ["Plans/rewrite-tie-in-memo.md"], node_compile_hint: {"mode": "runtime_scheduler_tie_in","create_worknodes": false}, source_lineage: ["Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:rewrite-tie-in-memo-S0038"], preserved_exact_tokens: ["Runtime Scheduler Packet Tie-In Note","event-driven scheduler updates","no-polling GUI rule","queue analysis","remediation lineage","runtime safe points","canonical event/projection state"], negative_constraints: [], preserved_contractrefs: [], owner_hints: ["Plans/rewrite-tie-in-memo.md","Plans/Contracts_V0.md","Plans/storage-plan.md"]}
```

### RTIM-039 - Blocked Outcome UI Storage Preservation

```yaml
{plan_unit_id: "RTIM-039", unit_type: "requirement", status: "accepted", owner_doc: "Plans/rewrite-tie-in-memo.md", canonical_text: "Blocked outcomes remain first-class in rewrite-era UI and storage and must not be flattened into generic failures.", gui_related: true, gui_classification_reason: "This unit preserves user-visible GUI, UI, route, surface, or visual rendering requirements.", split_recommended: true, depends_on: ["PDS-003","PDS-004","PDS-005","PNC-001","CV-218","CV-219","CV-241","UCC-001","OP-008","RGV-008"], unblocks: [], acceptance_criteria: ["RTIM-039 remains addressable as a fine-grained Rewrite Tie-In PlanUnit with source-span coverage.","ContractRefs, anchors or aliases, exact tokens, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage from the source spans remain preserved.","No WorkNodes, NodeSeeds, executable queues, final node manifests, production build tasks, implementation files, or source code are created by this PlanUnit."], validation_surfaces: ["python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits","python3 scripts/pm-plan-index.py validate"], risk_class: "rewrite_tie_in_drift", reasoning_tier: "standard", context_scope: "rewrite_tie_in", implementation_surfaces: ["Plans/rewrite-tie-in-memo.md"], node_compile_hint: {"mode": "blocked_state_gui_contract","create_worknodes": false}, source_lineage: ["Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:rewrite-tie-in-memo-S0038"], preserved_exact_tokens: ["blocked-state surfaces","blocked outcomes remain first-class","generic failures","rewrite-era UI or storage"], negative_constraints: ["Blocked outcomes must not be flattened into generic failures in rewrite-era UI or storage."], preserved_contractrefs: [], owner_hints: ["Plans/rewrite-tie-in-memo.md","Plans/Contracts_V0.md","Plans/UI_Command_Catalog.md","Plans/Orchestrator_Page.md","Plans/Run_Graph_View.md"]}
```

### RTIM-001 - Puppet Master Rewrite Tie-In Contract Retired Source-Preserving Bridge

```yaml
plan_unit_id: RTIM-001
unit_type: compatibility_disposition
status: retired
owner_doc: Plans/rewrite-tie-in-memo.md
canonical_text: >-
  RTIM-001 is retired to migration-lineage-only compatibility disposition after Phase 2B batch 162.
  rewrite-tie-in-memo-S0001 through rewrite-tie-in-memo-S0038 are covered by RTIM-002 through RTIM-039
  or explicit structural dispositions, and rewrite-tie-in-memo-S0039 through rewrite-tie-in-memo-S0042 are
  generated structural/audit dispositions. RTIM-001 must not re-own or override implementation-facing
  PlanUnits and must not use source_preserving_planunit compile mode.
gui_related: false
gui_classification_reason: "The live retired bridge is migration/audit metadata only; historical GUI-related bridge tokens remain preserved by span_map and coverage_map."
split_recommended: false
depends_on:
  - "RTIM-002"
  - "RTIM-003"
  - "RTIM-004"
  - "RTIM-005"
  - "RTIM-006"
  - "RTIM-007"
  - "RTIM-008"
  - "RTIM-009"
  - "RTIM-010"
  - "RTIM-011"
  - "RTIM-012"
  - "RTIM-013"
  - "RTIM-014"
  - "RTIM-015"
  - "RTIM-016"
  - "RTIM-017"
  - "RTIM-018"
  - "RTIM-019"
  - "RTIM-020"
  - "RTIM-021"
  - "RTIM-022"
  - "RTIM-023"
  - "RTIM-024"
  - "RTIM-025"
  - "RTIM-026"
  - "RTIM-027"
  - "RTIM-028"
  - "RTIM-029"
  - "RTIM-030"
  - "RTIM-031"
  - "RTIM-032"
  - "RTIM-033"
  - "RTIM-034"
  - "RTIM-035"
  - "RTIM-036"
  - "RTIM-037"
  - "RTIM-038"
  - "RTIM-039"
unblocks: []
acceptance_criteria:
  - "Generated-tail structural and audit spans remain available for exact-text audit."
  - "rewrite-tie-in-memo-S0001 through rewrite-tie-in-memo-S0038 remain mapped to RTIM-002 through RTIM-039 or explicit structural dispositions rather than RTIM-001."
  - "rewrite-tie-in-memo-S0039, S0040, and S0042 are structurally dispositioned as generated metadata."
  - "rewrite-tie-in-memo-S0041 is explicitly dispositioned as retired generated bridge lineage."
  - "RTIM-001 no longer uses node_compile_hint.mode=source_preserving_planunit."
  - "No WorkNodes, NodeSeeds, executable queues, final node manifests, production build tasks, implementation files, or source code are created by this PlanUnit."
validation_surfaces:
  - "python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits"
  - "python3 scripts/pm-plan-index.py validate"
risk_class: residual_bridge_overreach
reasoning_tier: standard
context_scope: rewrite_tie_in_retired_bridge
implementation_surfaces:
  - "Plans/rewrite-tie-in-memo.md"
node_compile_hint:
  mode: retired_source_preserving_bridge
  create_worknodes: false
source_lineage:
  - "Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:rewrite-tie-in-memo-S0039"
  - "Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:rewrite-tie-in-memo-S0040"
  - "Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:rewrite-tie-in-memo-S0041"
  - "Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:rewrite-tie-in-memo-S0042"
preserved_exact_tokens:
  - "source_preserving_planunit"
  - "retired_source_preserving_bridge"
  - "Owner / Consumer Map"
  - "PlanUnits"
  - "RTIM-001 - Puppet Master Rewrite Tie-In Contract (Active) Source-Preserving PlanUnit"
  - "Puppet Master Rewrite Tie-In Contract Residual Generated-Tail Bridge"
  - "Puppet Master Rewrite Tie-In Contract Retired Source-Preserving Bridge"
  - "Migration Coverage"
  - "rewrite-tie-in-memo-S0039"
  - "rewrite-tie-in-memo-S0042"
negative_constraints:
  - "RTIM-001 must not provide product implementation coverage for rewrite-tie-in-memo-S0001 through rewrite-tie-in-memo-S0038."
  - "RTIM-001 must not override RTIM-002 through RTIM-039 or structural dispositions."
  - "RTIM-001 must not use source_preserving_planunit compile mode after Phase 2B batch 162."
preserved_contractrefs:
  - "ContractRef: ContractName:Plans/Plan_Document_System.md, ContractName:Plans/Bootstrap_Planning_Migration.md"
compatibility_only_notes:
  - "The retired bridge remains only as migration-lineage compatibility metadata; historical ContractRefs, negative constraints, compatibility notes, and stale/retired evidence remain preserved in span_map and coverage_map."
stale_retired_dispositions:
  - "source_preserving_bridge_retired"
owner_hints:
  - "Plans/rewrite-tie-in-memo.md"
```

## Migration Coverage

Original hash: `8086676ed9f42bcf0af1756544bcf56a0444046613af1bf0b372647f30ef45a0`.

Run-scoped proof artifacts:
- `Plans/.plan_migration/pds-20260611-002-atomize-planunits/original_hashes.json`
- `Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl`
- `Plans/.plan_migration/pds-20260611-002-atomize-planunits/coverage_map.jsonl`
- `Plans/.plan_migration/pds-20260611-002-atomize-planunits/anchor_aliases.json`

Phase 2B batch 161 atomized `rewrite-tie-in-memo-S0001` through `rewrite-tie-in-memo-S0038` into fine-grained PlanUnits `RTIM-002` through `RTIM-039` or explicit structural dispositions. Phase 2B batch 162 structurally dispositioned generated tail spans `rewrite-tie-in-memo-S0039`, `rewrite-tie-in-memo-S0040`, and `rewrite-tie-in-memo-S0042`, and retired `rewrite-tie-in-memo-S0041` as the `RTIM-001` bridge lineage. `RTIM-001` is migration-lineage compatibility only and no longer uses `source_preserving_planunit` compile mode. These batches did not update Spec Lock, generated shards, evidence bundles, auto_decisions, or plan_graph, and they did not create WorkNodes, NodeSeeds, executable queues, final node manifests, production build tasks, implementation files, or source code.

## FABLE Deferred Action Concrete Repair Addendum - 2026-07-08

This addendum repairs non-runtime rewrite memo rows without creating WorkNodes, implementation files, runtime artifacts, or PNC-019 evidence.

- Repairs `sfk-fa77b0b241094242f6dcfb70`: this file is an active routing and migration-lineage memo, not fresh standalone product specification. "No open questions" applies only to the memo's routing role; owner docs remain authoritative for unresolved product details.
