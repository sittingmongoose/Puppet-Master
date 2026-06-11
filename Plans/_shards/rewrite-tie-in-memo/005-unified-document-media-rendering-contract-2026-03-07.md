# Shard 005: Unified Document/Media Rendering Contract (2026-03-07)

Source: `Plans/rewrite-tie-in-memo.md`

Source lines: L152-L485

Source SHA256: `86460f8f9a27a13d9b08a00fc8da3d2e1643b9c4de020784eccec267c64d7e99`

---

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

Orchestrator GUI tabs are native-purpose except where a doc explicitly says otherwise: Seams, Node Graph, Evidence, History, and Ledger are native-purpose surfaces, while Progress remains the widget-composed tab. This preserves /UI behavior without letting universal rendering or file-opening language overtake the route/open subject contract.

#### PreviewSession lifecycle and identity contract

`PreviewSession` is a durable runtime contract for rendered subject identity, but browser-capable surfaces layer a distinct browser-session identity on top of preview identity so that browser tabs, detached windows, automation sessions, and auth sessions do not collapse into one broad preview-instance model.

Owner split is explicit: `Plans/Section15_MVP_Promoted_Features_Spec.md` owns the promoted `/browser` and `/runtime` session model; `Plans/FileManager.md` owns editor `/file-surface` preview behavior and routes HTML/browser actions to that canonical model; `Plans/storage-plan.md` owns restore identity; `Plans/UI_Command_Catalog.md` owns stable `/command` families; and `Plans/FinalGUISpec.md` owns GUI placement and rendering-surface presentation for each rendered-subject. The taxonomy separates render-capable `/document` previews from browser-capable sessions, and `auth_session` state stays a browser/session overlay rather than a generic preview fact.

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
- Generated visual modules have an MVP library policy: allowed libraries must be BUNDLED in the source fragment, with no CDN fetches at runtime and no unvetted network requests from within the visual module. Exact allowlist TBD as an open design item; the recommended MVP behavior is no external libraries, so the agent must inline all code. Post-MVP, a curated allowlist of bundled libraries may include examples such as D3, Chart.js, and Three.js.
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

