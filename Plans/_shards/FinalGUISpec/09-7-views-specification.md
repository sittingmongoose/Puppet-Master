## 7. Views Specification

The GUI surface is responsible for displaying concerns, progress, artifacts, and help through carefully scoped views. Canonical concern definitions, approval scope semantics, and route/open ownership are defined in Plans/Contracts_V0.md; this section owns the visible widget and interaction layer.

### 7.1 Orchestrator

The main Orchestrator view displays the active run (or set of runs) with the following sections:

1. **Execution unit tree**: Shows the current execution context hierarchy (run → seam → package → node). Click to drill into any node and see its local concern history, approval state, and restart count.
2. **Concern lane**: A scrollable list of active concerns (open/blocked episodes) with their escalation stack. Each concern shows:
   - `concern_id` and `blocked_episode_id`
   - Concern reason and class
   - Escalation frames: who tried to resolve it, when, and what the outcome was
   - Approval state (auto, require_approval, blocked, etc.)
   - Suggested actions (if available) from the help system
3. **Progress projection**: Shows estimated completion, current node status, and inferred project health (see glossary).
4. **Artifact browser**: Recent logs, diffs, and outputs indexed by (concern_id, artifact_type, timestamp). Clickable to open or download.

### 7.3 Shared route and open behavior

Both the Orchestrator and Project views support unified route/open semantics:

- **Route button** ("Save"): Prompts for route_target (file://, github://, workspace://) and persists the active concern or artifact.
- **Open button** ("Inspect"): Opens the subject using the orchestrator's shared routing logic. A file:// route opens the local editor; a concern:// route shows the episode stack; a help:// route shows guidance.
- **Status light**: Visually indicates whether the route is reachable (green), pending (yellow), or broken (red).

### 7.4 Settings and inspectors

**Settings panel**:
- Persona selection (which sets default_route, model preferences, approval_mode)
- Mutation policy (conservative/standard/aggressive)
- Approval posture (auto/require/suggest)
- Trace level (none/summary/detailed/debug)
- Worktree/lane selection (if applicable)

**Inspectors** (right sidebar):
- **Concern inspector**: Click a concern in the lane to see full escalation stack, artifacts, and action history.
- **Node inspector**: Click a node in the execution tree to see local logs, inputs, outputs, and restart history.
- **Route inspector**: Click a route in the artifact browser to see visibility rules, retry status, and fallback routes.

### 7.5 Project and attention surfaces

**Project summary projection**:
- Overview of all runs/concerns/escalations for the active project.
- Breakdowns by concern_class, concern_reason, and approval_posture.
- Pie chart of dismissed vs resolved vs active concerns.

**Attention surfaces**:
- Notification panel: Shows high-priority concerns and escalations that need attention.
- Help sidebar: Context-aware help based on active concern, execution_unit_type, and concern_reason.
- Dashboard: Customizable widgets showing progress, health, and attention metrics.

### Concern, escalation, notification, and help surfaces

These surfaces are consumers of the canonical concern lifecycle and approval scope semantics defined in Plans/Contracts_V0.md. They interpret and display concerns, approval decisions, and suggested actions without owning the data model.

- **Concern display**: Shows concern_id, blocked_sequence, concern_reason, and escalation_stack. Respects visibility rules (audit mode only for sensitive escalations).
- **Escalation ladder**: Visual breadcrumb showing the chain of escalation frames; each frame shows who tried, what they tried, and the outcome.
- **Notification routing**: Concerns are routed to the active user's notification channel (UI, email, Slack, etc.) based on escalation_owner and visibility rules.
- **Help entry lookup**: Given a concern_reason, look up the canonical help entry to show general guidance; pivot on concern_class for advanced help.

ContractRef: ContractName:Plans/Contracts_V0.md, Primitive:ConcernRecord, Primitive:ApprovalScope, Primitive:RouteTarget
### 7.16 Chat Panel

The Chat Panel is the canonical threaded assistant workspace for Ask, Agent, Debug, Plan, and Deep Plan modes.

Layout:
- vertical split with **message stream** in the top 70% and **composer** in the bottom 30%
- optional collapsible **Plan panel** appears as a side panel within the chat surface when the thread is in Plan or Deep Plan mode
- header remains sticky while the message stream scrolls independently

#### 7.16.1 Thread header and message stream

Thread header content:
- editable thread title
- mode badge
- persona indicator
- model indicator
- token-count summary
- quick actions for thread search, rename, duplicate, archive, and thread settings

Message stream requirements:
- scrollable virtualized list of user, assistant, system, tool, approval, and activity message blocks aligned with the taxonomy in `Plans/assistant-chat-design.md`
- stable message identity so streaming updates mutate existing rows rather than replacing the full list
- inline activity cards for tool calls, file operations, subagent activity, approvals, run-state transitions, and linked artifacts
- sticky unread marker and `New messages below` affordance when the user is scrolled away from the bottom

#### 7.16.2 Composer, commands, and plan mode affordances

Composer requirements:
- multiline text input
- mode selector exposing at minimum `Steer` and `Queue`
- attachment button
- send / stop button
- visible disabled-state explanation when sending is unavailable

Plan-mode affordances:
- collapsible Plan panel showing the current plan, plan steps, status, and linked artifacts
- plan panel supports focusing the active step and jumping to linked documents or evidence
- when not in a planning mode, the plan panel stays hidden rather than showing an empty placeholder

Commands and approvals:
- slash commands, mode switches, and tool approvals remain routed through the canonical chat/runtime command catalog
- tool approval dialogs launched from Chat must preserve thread context and return focus to the composer after completion
- chat-local controls must not duplicate ownership of Problems, Output, Ports, or Debug Console; they link to those shell surfaces instead

### 7.17 File Manager Panel

The File Manager Panel is the persistent project-tree side panel and defers detailed tree, drag-and-drop, and open-file behavior to `Plans/FileManager.md`.

Required behavior summary:
- project tree with local filter, expand/collapse persistence, and current-file reveal
- click-to-open and context-menu actions route through canonical open-file and file-tree action contracts
- external drag-and-drop, ignored-file visibility rules, and detached-panel behavior remain aligned with `Plans/FileManager.md`
- File Manager owns tree navigation and file discovery, but not semantic search, diff-local search, or runtime artifact browsing

### 7.18 File Editor

The File Editor is the canonical in-app code and document editing surface.

Required behavior summary:
- tabbed editor groups with shared buffers, diff view, preview modes, and detach / re-dock support
- LSP-backed diagnostics, hover, completion, signature help, inlay hints, code actions, code lens, semantic highlighting, and go-to-definition
- SSH remote editing, stale-write disclosure, and recoverable unsaved local buffer persistence
- embedded rendering for markdown, mermaid, HTML, SVG, and image documents through the shared preview pipeline

#### 7.18.1 Inline Note Mode

Inline Note Mode enables targeted feedback and annotation inside the editor.

Activation:
- user selects code in the editor
- `Add Note` appears in the context menu for the selection

Note creation:
- captures selection range
- captures note text
- optional category: `bug`, `improvement`, `question`, or `style`

Display and persistence:
- inline annotation markers appear in the editor gutter
- hover reveals note content and status
- notes persist via `note_record.v1:{bundle_id}:{note_id}` and remain linkable from bundle review surfaces

### 7.19 Agent Activity

The Agent Activity surface is the canonical inspection view for delegated work, investigations, bundle review progress, and embedded review documents.

Required behavior summary:
- active and historical child-run / subagent activity list with status, owning thread, target, and outcome
- clear distinction between running, queued, blocked, remediation, and completed activity
- direct links to related chat messages, artifacts, investigation records, and review bundles

### 7.19A Dedicated log and audit inspector

PM ships two complementary audit surfaces: lightweight in-thread transparency and a dedicated searchable log/audit inspector.

ContractRef: ContractName:Plans/assistant-chat-design.md, ContractName:Plans/storage-plan.md

Inspector requirements:
- summary rows use a 5-item compact format: operation label, short query/url/task preview, success/failure status, fallback note when present, and source/page counts when present
- full payload dereference is on-demand only; the inspector does not eagerly expand large refs or blobs
- supported interactions include filter by event family, search by tool or operation, time-range queries, drill-down, and export
- `logsearch` and `logread` have explicit GUI surfacing rather than remaining CLI-only affordances

ContractRef: ContractName:Plans/Contracts_V0.md, ContractName:Plans/Tools.md

#### 7.19.1 Embedded document pane

The embedded document pane is a shared-buffer review/document surface used by Interview, Builder, and bundle-review workflows.

Rules:
- document selection, scroll position, active review stage, and approval state persist through `document_pane_state:v1:{project_id}:{page_context}`
- the pane shares source-of-truth buffers with File Editor rather than maintaining divergent document copies
- findings summaries and approval gates render adjacent to the document, not inside unrelated chat-local controls

#### 7.19.2 Bundle controls and review gate

Bundle Controls govern revision loops and approval readiness for reviewed document/file bundles.

Required behavior:
- `Resubmit` in bundle review sends all unresolved notes as revision context
- final approval is blocked until every note is resolved, responded to, or dismissed
- bundle status progression is `draft -> in_review -> all_notes_resolved -> approved -> merged`
- bundle-level persistence uses `bundle_registry.v1:{project_id}:{bundle_id}` with linked `note_record.v1:*` entries

### 7.20 Bottom runtime zone

The bottom runtime zone is the canonical host for Terminal, Problems, Output, Debug Console, Ports, and linked runtime-adjacent panes.

Required behavior summary:
- tabbed runtime panes with stable identity and restore behavior
- terminal/browser/editor integrations reveal the owning pane rather than minting parallel per-feature consoles
- linked dev-session state, historical/live badges, and recovery outcomes stay visible across pane switches

#### 7.20.1 Terminal and browser tab management

Terminal sections, terminal tabs, browser tabs, and detached previews remain identity-stable across docking, focus changes, and restart recovery.

Rules:
- runtime tabs persist selection, order, labels, and pin state
- browser and preview tabs route through canonical browser-session identities and never silently migrate ownership to chat
- hot reload, output routing, and preview refresh status appear in the owning runtime or preview pane

#### 7.20.2 Debug, Problems, Output, and Ports

The runtime zone must provide:
- **Problems:** aggregated diagnostics, file links, and source ownership disclosure
- **Output:** task/build/dev output streams with source tags and search within stream
- **Debug Console:** adapter and evaluation output for the active debug session
- **Ports:** detected ports, local/remote accessibility, open-in-browser actions, and hot-reload controls

`Run & Debug` side-panel actions reveal and focus these bottom-panel panes rather than creating duplicate runtime records.

