# Working Ledger

## Work Item
- `w-20260318-153036`

## Mode
- `research`

## Topic / Scope
- Update rewrite planning docs for the File Manager and Editor.

## Objective
- Preserve execution memory for upcoming research and planning updates related to File Manager and Editor.
- Keep enough durable context that later reconciliation and packetization can proceed without losing scope.

## Constraints / Non-Goals
- Research now includes targeted external competitive/reference analysis plus targeted repo/code inspection.
- This ledger is execution memory only, not canonical source of truth.
- Do not cite, reference, or mention the ledger inside planning docs.
- Do not write planning-doc changes during research mode.
- No broad repo sweep unless later required.

## Key Facts and Findings
- Topic is known: File Manager and Editor planning docs.
- Mode for this work item is research.
- Initial repo reading has begun and is currently constrained to `Plans/**`.
- `Plans/FileManager.md` is the canonical center of gravity for both File Manager and the in-app editor, not just the tree surface.
- `Plans/FileManager.md` defines the main cross-surface contracts:
  - shared project context across File Manager, editor, and chat
  - `OpenFile` as the canonical path-based open contract: `path`, `line?`, `range?`, `target_group?`
  - `OpenSubject` as the identity-native contract for artifact/generated subjects: `subject_id`, `open_intent`
  - one shared buffer per file path across editor groups and Embedded Document Pane
- Click-to-open from chat is explicitly editor-targeted only; chat must not invent a separate file viewer.
- Repeated opens of the same file/path should focus existing editor state rather than creating duplicate buffers/tabs.
- File Manager/editor defaults currently spelled out in `Plans/FileManager.md` include:
  - active editor group receives open actions by default
  - exactly one floating editor window in MVP
  - large file threshold default `10_000` lines with hard cap `5 MB`
  - session-scoped view state keyed by `project_id + session_id`, where session defaults to chat thread id
- `Plans/FileManager.md` also now owns render-capable file behavior:
  - Markdown/Mermaid/HTML/SVG/image open-mode matrix
  - preview modes (`source`, `preview`, `split`, `detached`, `browser_panel`)
  - preview edits must resolve to bounded source patches through the same shared buffer/save pipeline
- `Plans/assistant-chat-design.md` §9 defers the full File Manager/editor spec to `Plans/FileManager.md` and adds only chat-specific requirements.
- `Plans/Section15_MVP_Promoted_Features_Spec.md` reinforces `@` mention identity preservation and the in-app instructions editor constraints.
- `Plans/FinalGUISpec.md` contains shell/panel/window constraints that may need reconciliation with FileManager editor-detach behavior.
- First external reference cluster reviewed in depth shows repeated cross-product architectural patterns:
  - one shared document/buffer core as the source of truth for all editor views
  - split/tab layout modeled as a persistent tree rather than ad hoc pane state
  - file tree/navigator as a projection over stable identities, refreshed by targeted invalidation rather than constant full rebuild
  - diff, debug, and preview as alternate surfaces over the same editor/document engine
  - service or proxy boundary between UI and heavy subsystems such as file IO, search, SCM, LSP, terminal, and remote execution
- Strong implementation pattern from external references:
  - keep backend/editor state plain and UI-agnostic
  - expose narrow observable models to the shell/UI
  - persist workspace layout separately from per-file cursor/scroll/view state
  - load lazily and scope rendering to the viewport
- Strong caution pattern from external references:
  - persistent indexes improve speed but create ongoing correctness/race/debugging cost
  - shelling out for Git/SCM in hot paths is fragile
  - file watchers are not authoritative and must trigger reconciliation/rescan
  - keyboard/layout/IME/platform rendering issues are recurring pain across products
  - terminal polish, DPI/fonts, and multi-window correctness remain disproportionately expensive

## Gaps / Problems Identified
- Likely doc drift: `Plans/FileManager.md` claims deterministic/no-open-questions posture but still contains a large `§12 Gaps / Potential problems / Suggested additions` section.
- Possible scope drift inside `Plans/FileManager.md`:
  - `§6` says all listed features are in scope for desktop MVP
  - `§10.9` says all listed additional editor features are in scope for MVP
  - `§12.5` still labels several of those items as `Optional / later`
- Possible cross-doc mismatch on detach behavior:
  - `Plans/FileManager.md` specifies detachable floating editor behavior
  - `Plans/FinalGUISpec.md` panel-system text explicitly says Chat and File Manager are detachable panels, while editor appears as primary content and is referenced elsewhere as detachable
- Potential MVP boundary ambiguity for remote work:
  - `Plans/FileManager.md` summary includes remote SSH in the surface scope
  - `§12.2.3` narrows remote run/debug to later phase while leaving remote edit as MVP
- Exact planning-doc update list is still not finalized, but the current likely set is no longer unknown.
- External issue patterns consistently cluster around:
  - file tree refresh/reveal/selection coherence
  - keybinding correctness across keyboard layouts and modal layers
  - rendering/font/DPI/platform-specific editor polish
  - terminal integration edge cases
  - memory/performance regressions in large workspaces or empty-idle states
  - index corruption/staleness and race conditions

## Candidate Fixes / Design Directions
- Treat `Plans/FileManager.md` as the primary contract owner unless a stronger SSOT says otherwise, and reduce adjacent docs to consumer summaries where possible.
- Reconcile editor detach/floating semantics explicitly between `Plans/FileManager.md` and `Plans/FinalGUISpec.md`.
- Normalize MVP labeling so features are either `required MVP`, `optional within MVP`, or `post-MVP`, not multiple at once.
- Decide whether File Manager and Editor should continue living in one combined plan or be split into a shell/file-surface contract plus editor-behavior contract.
- Preserve the identity-native `OpenSubject` / path-native `OpenFile` split; avoid regressing to raw-path assumptions for generated/runtime artifacts.
- Introduce or strengthen a first-class degraded-mode contract for indexing/LSP/search/remote readiness instead of silent partial failure.
- Prefer a backend service/proxy model for LSP, terminal, search, SCM, watchers, and SSH instead of pushing those responsibilities into the Slint UI layer.
- Prefer one reusable text/render engine for normal edit, diff, preview-backed source focus, and debugger/annotation overlays.

## Impacted Docs
- `Plans/FileManager.md`
- `Plans/assistant-chat-design.md`
- `Plans/FinalGUISpec.md`
- `Plans/Section15_MVP_Promoted_Features_Spec.md`
- `Plans/LSPSupport.md`
- Additional external reference set in progress:
  - fast Rust-native editor architecture
  - heavyweight JVM-based IDE architecture
  - macOS-native editor architecture
  - remaining desktop/web/editor-control references and AI-IDE competitors still to review

## Decisions Already Resolved
- Work item mode is `research`.
- Work item status should remain `active` during research.
- Work item topic/scope is the File Manager and Editor planning-doc update effort.
- Research is currently authorized for targeted reading in `Plans/**`.
- `Plans/FileManager.md` is the first document to anchor on before widening outward.
- User explicitly wants everything selected to be MVP; "optional/later" framing is likely incompatible with the requested direction unless redefined.

## Open Questions / Uncertainties
- Does the user want File Manager and Editor kept as one combined planning surface, or separated for clarity?
- Should detachable editor behavior be canonical shell behavior in `Plans/FinalGUISpec.md`, or remain locally specified in `Plans/FileManager.md`?
- Which of the `§12` items in `Plans/FileManager.md` are still true gaps versus already-resolved notes that should be folded into normative sections?
- Which pain is driving this update most: contradiction cleanup, scope reduction, feature additions, or implementation ordering?
- How far should the plan go toward a product-family model where language/framework context reshapes the editor shell, indexing, debugging, presets, and tooling automatically?
- What level of collaboration or multi-surface sync is actually desired for MVP versus merely interesting reference behavior?

## Packetization Notes
- No packetization-ready content yet.
- Strong candidate packet themes already emerging:
  - canonical open contracts and identity/path split
  - shared-buffer/editor/document-preview model
  - detach/floating-shell reconciliation
  - MVP scope normalization and stale-gap cleanup
  - backend service/proxy architecture for heavy editor subsystems
  - file-tree invalidation and workspace-scale performance contracts
  - language/framework adaptation model

## Do-Not-Forget Details
- `Plans/FileManager.md` now contains major editor, preview, artifact-open, and runtime-identity behavior, so edits there will ripple widely.
- Chat-specific behavior appears intentionally thin; avoid duplicating File Manager/editor norms back into chat docs unless needed.
- Track File Manager and Editor together unless the user later splits scope.
- Record concrete rules, defaults, contracts, user-visible behavior, fallback behavior, and unresolved questions once research starts.
- External references so far reinforce that the core unit should be `document + view state + service boundaries`, not "tree widget" and "text widget" as isolated features.
