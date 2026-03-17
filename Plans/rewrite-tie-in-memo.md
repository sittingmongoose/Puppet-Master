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
- **UI tech:** any plan text that assumes **Iced** UI implementation should be treated as *UX requirements only*, not a widget/library implementation commitment.
- **UI scaling migration:** Iced custom scaling mechanics (for example token-by-token multiplication layers) MUST be treated as legacy implementation references; Slint-target sections MUST describe native Slint scaling paths.

ContractRef: ContractName:Plans/Contracts_V0.md#8

- **Storage:** any plan that proposes **SQLite** for run/session/history storage needs to be reframed as **event-sourced** storage with seglog/redb/Tantivy projections.
- **Provider abstraction:** platform-specific execution terminology in touched sections must use **Provider** + unified event model, especially for streaming output and tool gating.
- **Gemini auth/account:** stale canon that says Gemini UI defaults to API key, or that OAuth is merely an optional fallback to the same bucket, MUST be retired. The canonical model is one provider with mixed OAuth/API-key account pools, OAuth-first default preference under `auto`, no silent cross-surface fallback for explicit auth requests, and requested/effective auth/account identity visible across surfaces.

ContractRef: ContractName:Plans/storage-plan.md, ContractName:Plans/Multi-Account.md, ContractName:Plans/Prompt_Pipeline.md#EFFECTIVE-RESOLUTION-RECORD

- **Gemini media:** any plan text that implies non-Cursor Gemini media is API-key-only MUST be retired; media follows the same Gemini auth/account model as standard provider usage.
- **Automation references:** any mention of Iced-era automation must be treated as a **migration reference pattern only**; rewrite deliverables target Slint runtime contracts and shared evidence schema.

ContractRef: ContractName:Plans/Media_Generation_and_Capabilities.md, ContractName:Plans/FinalGUISpec.md, ContractName:Plans/rewrite-tie-in-memo.md
### Storage consistency
- All run/session/artifact/checkpoint persistence and event emission must align with **Plans/storage-plan.md** (seglog writer, redb schema, projector pipeline, analytics scan).
- When adding or editing plans that touch runs, sessions, settings, or artifacts, add a cross-reference to storage-plan.md and specify whether the plan assumes seglog events, redb tables, or both.
- **Plans/storage-plan.md** -- Canonical storage checklist (seglog, redb schema, projectors, analytics); other plans that persist state or emit events should reference it and call out seglog vs redb.

### Plans likely needing the most rewrite-aware edits
- `Plans/newfeatures.md`
  - Already calls out "single Rust/Iced process" and rejects a three-process architecture; should be updated to "single core agent loop + Slint UI" and ensure streaming parsing is in-provider and normalized into the unified event model
- `Plans/assistant-chat-design.md`
  - Keep UX modes/permissions, but re-anchor persistence/search assumptions to seglog/redb/Tantivy and to the unified event stream
- `Plans/orchestrator-subagent-integration.md`
  - Treat tier/subagent strategy as "orchestrator policy" sitting above Providers; streaming output parsing and tool gating should be defined once at provider/tool-registry level, not per-platform
- `Plans/usage-feature.md`
  - Recast "usage ledger" as projections/rollups over the seglog stream, with indexes in Tantivy (search) and aggregates in redb
- `Plans/newtools.md`
  - Align MCP/tool discovery and Doctor checks with the central tool registry/policy engine (no per-provider special casing)
  - Carry Preview/Build/Docker/GitHub Actions contracts as Slint-target requirements and keep legacy Iced automation references migration-only

### Plans that are still conceptually valid (but should be reworded)
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

`PreviewSession` is a durable runtime contract, not just a bag of fields.

**Lifecycle states**
- `created`
- `loading`
- `ready`
- `stale`
- `degraded`
- `error`
- `closed`

**Identity rules**
- Moving the same document between inline preview, split preview, browser tab, and detached window keeps the same `preview_session_id` when all of the following remain unchanged:
  - `document_id` or `artifact_id`
  - `source_revision`
  - `trust_tier`
  - `transport_mode`
- A new `preview_session_id` MUST be created when any of those change.
- Detaching is an attachment change, not a new session, unless the platform fallback requires a transport restart.

**Attachment rules**
- A single `PreviewSession` MAY be visible in multiple read-only surfaces at the same time.
- Only one attachment may hold mutation-capable focus at a time.
- `attached_surface` is the currently focused attachment; additional viewers are tracked as secondary attachments in runtime state.

**Required transitions**
- `created -> loading -> ready`
- `ready -> stale` when source revision changes
- `stale -> loading -> ready` on successful reload
- `ready -> degraded` when the preferred embedded path fails but detached/native fallback still works
- `loading|ready|stale -> error` when preview generation or runtime startup fails without a usable fallback
- any non-closed state -> `closed` on explicit close or document disposal

**Persistence and audit expectations**
- The app MUST persist enough state to restore the user's last preview mode, last successful attachment target, and last visible preview error per document.
- The app MUST NOT persist live DOM state or browser storage as part of `PreviewSession` state.
- Preview lifecycle changes MUST emit canonical events in storage-plan.md and be invocable through canonical UI commands in UI_Command_Catalog.md.

**Minimum restore rule**
- On restart, the product restores preview intent (`none`, `inline`, `split`, `browser_tab`, `detached`) and reconstructs a new live runtime session as needed; it does not attempt to deserialize an old live webview.

All rendered surfaces use a shared **PreviewSession** model. Minimum state:

- `preview_session_id`
- `document_id` or `artifact_id`
- `source_kind` (`markdown`, `mermaid`, `html`, `svg`, `image`, `generated_doc`, `browser_page`)
- `trust_tier` (`generated_restricted`, `workspace_browser`)
- `transport_mode` (`internal_preview_origin`, `localhost_browser_preview`, `native_image_surface`)
- `source_revision`
- `preview_revision`
- `attached_surface` (`chat_card`, `editor_preview`, `embedded_doc_pane`, `bottom_panel_browser`, `detached_window`)
- `capabilities` (for example: `can_export_svg`, `can_export_png`, `can_reload`, `can_open_source`, `can_request_structured_edit`, `can_click_to_context`)

This state model is shared so that reload, export, click-to-context, detached-open, and source navigation do not diverge by surface.

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

The rendering system must define runtime expectations per platform.

| Platform | Embedded browser status | Guaranteed path | Runtime dependency | Required degraded UX |
|---|---|---|---|---|
| Windows | Supported when WebView2 is available | Detached browser/preview window | WebView2 runtime | Show explicit missing-WebView2 state with remediation; offer detached retry if embedded attach fails |
| macOS | Supported through native webview stack | Detached browser/preview window | System webview runtime | Show explicit startup error and keep source/native surfaces usable |
| Linux X11 | Embedded path may be supported | Detached browser/preview window | GTK/WebKitGTK runtime | Show missing-runtime remediation; do not leave a blank embedded pane |
| Linux Wayland | Detached-first; embedding is optional/adapter-specific | Detached browser/preview window | GTK/WebKitGTK runtime plus any adapter bridge requirements | Prefer detached immediately; do not assume hidden/precreated embedded panes |

**Required doctor/preflight checks**
- browser runtime available
- preview server startable
- Linux GTK/WebKit prerequisites present where applicable
- detached-window fallback path healthy

**Required degraded behavior**
- Generated Markdown/Mermaid preview failure must keep source usable.
- HTML/browser embedding failure must attempt detached fallback before declaring the feature unavailable.
- Missing runtime states must use explicit user-facing copy and remediation guidance.
- Blank panes and screenshot-only substitution are not acceptable steady-state fallback behavior for browser-class surfaces.

- **Detached preview/browser windows are first-class and are the only cross-platform guaranteed path.**
- Embedded webviews are an optimization only and may be enabled where the platform adapter proves robust.
- Linux Wayland must not be blocked on raw child-webview embedding. Detached-first or GTK-bridged behavior is acceptable behind the same abstraction.
- Linux support must explicitly own:
  - GTK initialization
  - GTK/WebKit event-loop advancement rules
  - runtime dependency/install contract
  - failure and degraded-mode UX when preview runtime requirements are unavailable
- Do not assume hidden pre-created preview panes are available on Wayland.

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
