# Puppet Master Rewrite Tie-In Contract (Active)

> **Compliance:** This document follows `Plans/DRY_Rules.md` and references SSOT contracts in `Plans/Contracts_V0.md`. Naming: “Puppet Master” only. No open questions; deterministic defaults per `Plans/Decision_Policy.md`.


> This document exists to keep the rest of `Plans/` consistent as the rewrite is implemented.
> It records locked architectural decisions and the required implementation contracts for existing plans.
> For navigation across all plan docs, see `Plans/00-plans-index.md`.

---

## Provided memo (verbatim)

This project is moving to a single, deterministic "agent loop" architecture where every backend is just a **Provider** behind one unified session/event store, tool registry, and patch/edit pipeline (so CLI-bridged providers don't become special-case chaos). This is intentionally adapting much of **OpenCode's architecture** (provider abstraction, centralized config, session orchestration, tool registry) to address current pain points and make the main engine deterministic and reliable. [web:7][web:11][web:69][web:71]

### What's changing (high level)
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
- Gemini provider defaults to **API key** auth in the UI. This is an explicit allowed exception to the broader "subscription auth only / avoid API keys" guidance because Gemini's API key path can be used to access the user's Gemini subscription. OAuth remains optional as a stricter-access fallback. [page:4]

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
- **UI tech:** any plan text that assumes **Iced** UI implementation should be treated as *UX requirements only*, not a widget/library implementation commitment
<a id="ui-scaling-migration"></a>
- **UI scaling migration:** Iced custom scaling mechanics (for example token-by-token multiplication layers) MUST be treated as legacy implementation references; Slint-target sections MUST describe native Slint scaling paths.
  ContractRef: ContractName:Plans/Contracts_V0.md#8
- **Storage:** any plan that proposes **SQLite** for run/session/history storage needs to be reframed as **event-sourced** storage with seglog/redb/Tantivy projections
- **Provider abstraction:** platform-specific execution terminology in touched sections must use **Provider** + unified event model, especially for streaming output and tool gating
- **Gemini auth:** existing "subscription-only / no API keys" guidance must explicitly allow a Gemini exception: "no API keys **except Gemini** (Gemini API key can represent subscription access)"
- **Automation references:** any mention of Iced-era automation must be treated as a **migration reference pattern only**; rewrite deliverables target Slint runtime contracts and shared evidence schema


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

#### Preview action protocol v1

The source/preview edit contract requires one shared action protocol across chat, editor preview, and embedded document panes.

**Allowed `operation` values in v1**
- `toggle_checkbox`
- `edit_heading_text`
- `edit_list_item_text`
- `set_link_target`
- `set_inline_format`
- `replace_mermaid_block`
- `open_source`
- `open_detached`

Operations outside this whitelist MUST return a non-mutating result and focus/open source when appropriate.

**Request rules**
- `PreviewActionRequest` MUST include `preview_session_id`, `node_id`, `parse_revision`, `operation`, and `payload`.
- Mutating requests MUST also validate the current `source_revision` before applying a patch.
- Requests from stale preview state MUST NOT be auto-rebased silently.

**Result codes**
- `applied_patch`
- `rejected_stale_revision`
- `unsupported_region`
- `ambiguous_mapping`
- `permission_denied`
- `fallback_focus_source`
- `render_error`

**Deterministic fallback**
- `ambiguous_mapping`, `unsupported_region`, and `rejected_stale_revision` MUST never mutate rendered DOM state.
- Those outcomes MUST move focus to source at the mapped region when possible.

**Audit**
- Every request emits `preview.action.requested`.
- Every terminal outcome emits `preview.action.completed` with `result_code`.
- Patch summaries should be recorded in bounded form for audit/history, not as unbounded raw document bodies.

**Surface scope**
- File Editor preview and Embedded Document Pane may issue v1 preview actions.
- Chat and planning surfaces may issue only non-destructive actions until their attachment/edit flow is explicitly wired to the same validation path.

Preview interactions must route through a validated mapping contract instead of directly mutating the rendered DOM.

Minimum mapping entities:

- **RenderedBlockRef**
  - `node_id`
  - `block_kind`
  - `source_start`
  - `source_end`
  - `parse_revision`
  - `capabilities`
- **PreviewActionRequest**
  - `preview_session_id`
  - `node_id`
  - `parse_revision`
  - `operation`
  - `payload`
- **PreviewActionResult**
  - `applied_patch`
  - `rejected_stale_revision`
  - `fallback_focus_source`
  - `error`

Rules:

- Source text remains canonical.
- Preview edits are allowed only through **whitelisted structured commands** that map to known source spans or fenced diagram blocks.
- If an action cannot be reversed into a confident source patch, the system must focus/open source editing at the exact mapped block instead of mutating preview state.
- Raw HTML regions, malformed/unknown syntax, and opaque fenced content remain source-centric.

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
