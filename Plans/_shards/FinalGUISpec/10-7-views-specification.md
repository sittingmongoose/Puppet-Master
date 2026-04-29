## 7. Views Specification

### Reconciliation addendum

This addendum applies row-level transfer coverage requirements for the mapped owner anchor. Source IDs and exact source tokens are preserved in packet metadata; prose below uses canonical wording for retired legacy terms.

- Required structural headings for this packet target:
  - ### Reconciliation addendum

#### Source target target-0256
- Reconciliation action: insert_after
- Replace scope: insert_only
- Required structural headings represented:
  - ### Reconciliation addendum
- Exact required items represented:
  - lineage views must preserve:
  - when necessary, fall back to canonical record-backed views:
  - when the UI should fall back to record-backed views
  - Keep Source Control worktree-first and compact, with historical/retained material behind filters or lineage views.
  - tier-shaped records should be overlays or derived views
  - relevant evidence / trace views
  - Keep `cost_usage` and receipt views strictly canonical:
  - cost_usage
- Exact acceptance checks represented:
  - All coverage_row_ids listed on this target are represented without broad summary substitution.
  - All source_obligation_ids, source_seed_ids, and source_shard_ids are preserved in packet metadata.
  - Rows marked missing or partial receive concrete prose or structural additions under the mapped live anchor.
- Source lineage is preserved in packet metadata for coverage rows, source obligations, source seeds, source shards, gaps, fidelity refs, span group, and writer role.

The GUI surface is responsible for displaying concerns, progress, artifacts, and help through carefully scoped views. Canonical concern definitions, approval scope semantics, and route/open ownership are defined in Plans/Contracts_V0.md; this section owns the visible widget and interaction layer.

### 7.1 Orchestrator

The Orchestrator renders five composite projection states: `current`, `refreshing`, `stale`, `degraded`, and `unavailable`. `projection_freshness` owns `current` / `refreshing` / `stale`, `projection_health` owns `degraded` / `unavailable`, and `trust_tier` is reserved for preview/browser semantics only rather than acting as the general projection-state bucket. Sensitive actions require `current` data or direct canonical revalidation; when a surface is `degraded`, the UI falls back to record-backed views and suppresses live mutation affordances.

Only `Progress` is widget-composed inside Orchestrator. The `orchestrator:progress` layout persists independently from Dashboard and Usage layout keys. Slice-based loading, virtualization, lazy expansion, and demand-loaded inspectors are mandatory across every dense tab, and scale is treated as a cross-tab contract rather than a graph-tab-only concern.

Action surfaces classify every affordance by navigation vs mutation, palette visibility, shortcut eligibility, multi-target safety, and confirmation/reversibility. Bulk affordances default to navigation and triage rather than live execution mutation.

#### Progress catalog source and default drills

### Reconciliation addendum

This addendum applies row-level transfer coverage requirements for the mapped owner anchor. Source IDs and exact source tokens are preserved in packet metadata; prose below uses canonical wording for retired legacy terms.

- Required structural headings for this packet target:
  - ### Reconciliation addendum

#### Source target target-0320
- Reconciliation action: insert_after
- Replace scope: insert_only
- Required structural headings represented:
  - ### Reconciliation addendum
- Exact required items represented:
  - many `Progress` widgets may also be hostable on `Dashboard`
  - Progress
  - Dashboard
  - The UI should not expose a noisy “scored all candidates” explanation by default.
  - Research Progress - 2026-03-16 - Sonnet broader second-sweep delta cluster (requested-account asymmetry and event-schema precision)
  - Research Progress - 2026-03-16 - GPT-5.4 Identity / Actor Envelope Deepening
  - Research Progress - 2026-03-16 - GPT-5.2 Identity Semantics / Role-Routing Clarifications
  - Research Progress - 2026-03-16 - projection-freshness vocabulary and owner cluster
  - Research Progress - 2026-03-16 - remaining-owner-doc convergence cluster
  - Research Progress - 2026-03-16 - Validation-pass report identity and lineage
  - Research Progress - 2026-03-16 - Opus owner-doc tranche synthesis
  - Research Progress - 2026-03-16 - `tier_runtime_record` as derived overlay and downstream surface drift
  - tier_runtime_record
  - Research Progress - 2026-03-16 - Sonnet owner-doc tranche synthesis
  - Research Progress - 2026-03-16 - Routing/deep-link normalization with `OpenSubject`
  - OpenSubject
  - Research Progress - 2026-03-16 - Command-catalog implications of route/subject normalization
  - Research Progress - 2026-03-16 - GPT-5.4 owner-doc tranche synthesis
  - Research Progress - 2026-03-16 - GPT-5.2 owner-doc tranche synthesis
  - Research Progress - 2026-03-16 - Storage/routing handshake for subject-open and preview identity
  - Research Progress - 2026-03-16 - GPT-5.3-Codex owner-doc tranche synthesis
  - Research Progress - 2026-03-16 - Exports still need identity-preserving manifest discipline
  - Research Progress - 2026-03-16 - Sub-selection and `inspector_target` should stay secondary
  - inspector_target
  - Research Progress - 2026-03-16 - Destination-surface vocabulary should stay controlled and coarse
  - Research Progress - 2026-03-16 - Subviews and panel-local selectors belong to view state, not target identity
  - Research Progress - 2026-03-16 - Override rule: route-target should override only what is necessary
  - Research Progress - 2026-03-17 - `route_target` owner placement
  - route_target
  - Research Progress - 2026-03-17 - `route_target` vs `OpenSubject`
  - Research Progress - 2026-03-17 - Exact `target_kind` vocabulary
  - target_kind
  - Research Progress - 2026-03-17 - Selector precedence inside `route_target`
  - Research Progress - 2026-03-17 - Exact `inspector_target` vocabulary
  - `tab_id = progress` or `tab_id = seams`
  - tab_id = progress
  - tab_id = seams
  - Research Progress - 2026-03-17 - Current cleanup posture after extended owner-pass
- Exact acceptance checks represented:
  - All coverage_row_ids listed on this target are represented without broad summary substitution.
  - All source_obligation_ids, source_seed_ids, and source_shard_ids are preserved in packet metadata.
  - Rows marked missing or partial receive concrete prose or structural additions under the mapped live anchor.
- Source lineage is preserved in packet metadata for coverage rows, source obligations, source seeds, source shards, gaps, fidelity refs, span group, and writer role.
Orchestrator consumes the named Progress catalog from FinalGUISpec Appendix C. The promoted 13-widget Progress catalog and default drill targets are:
1. `progress.run-overview` → Execution unit tree scoped to `focused_run_id`
2. `progress.current-task` → Node inspector for the active execution unit
3. `progress.lane-health` → Lane row filtered to the selected lane/worktree
4. `progress.node-throughput` → Dense node list filtered to slow or blocked nodes
5. `progress.blocked-concerns` → Concern lane filtered to `blocked` or `attention_required`
6. `progress.approval-queue` → Concern inspector showing pending approvals
7. `progress.recovery-status` → Recovery timeline for the selected concern or blocked episode
8. `progress.artifact-receipts` → Artifact browser filtered to receipt-linked runtime artifacts
9. `progress.worktree-state` → Source Control worktree row with lane/package/run refs
10. `progress.account-pressure` → Historical `account_pressure_episode` list
11. `progress.account-switches` → Historical `account_switch_event` list
12. `progress.escalation-stack` → Project attention view focused on the shared escalation ladder
13. `progress.attention-summary` → `project_attention_item.primary_route_payload` list

#### Progress labels and taxonomy

### Reconciliation addendum

This addendum applies row-level transfer coverage requirements for the mapped owner anchor. Source IDs and exact source tokens are preserved in packet metadata; prose below uses canonical wording for retired legacy terms.

- Required structural headings for this packet target:
  - ### Reconciliation addendum

#### Source target target-0321
- Reconciliation action: insert_after
- Replace scope: insert_only
- Required structural headings represented:
  - ### Reconciliation addendum
- Exact required items represented:
  - decomposition/view identity (`tier_type`, `tier_id`, titles, focus labels)
  - tier_type
  - tier_id
  - `gap-008` now points at the real storage/usage/interview sections that currently carry the partial account-history and requested/effective identity transfer, rather than pseudo owner-section labels that do not yet exist verbatim.
  - gap-008
- Exact acceptance checks represented:
  - All coverage_row_ids listed on this target are represented without broad summary substitution.
  - All source_obligation_ids, source_seed_ids, and source_shard_ids are preserved in packet metadata.
  - Rows marked missing or partial receive concrete prose or structural additions under the mapped live anchor.
- Source lineage is preserved in packet metadata for coverage rows, source obligations, source seeds, source shards, gaps, fidelity refs, span group, and writer role.
- State labels: `queued`, `running`, `attention_required`, `blocked`, `recovering`, `degraded`, `complete`
- Action labels: `Inspect`, `Focus run`, `Open evidence`, `Request approval`, `Acknowledge`, `Dismiss`, `Resolve`, `Retry recovery`
- Alert taxonomy: `advisory`, `attention_required`, `blocked`, `escalated`, `degraded_projection`
- Event taxonomy: `run_started`, `node_started`, `node_completed`, `concern_opened`, `approval_requested`, `approval_decided`, `recovery_started`, `recovery_completed`, `artifact_published`, `account_switched`
- Condition-aging policy: advisory warnings may quiet after one stable refresh window; `attention_required` resurfaces on meaningful change or persistence; `blocked` and `escalated` never auto-quiet

### 7.3 Shared route and open behavior

### Reconciliation addendum

This addendum applies row-level transfer coverage requirements for the mapped owner anchor. Source IDs and exact source tokens are preserved in packet metadata; prose below uses canonical wording for retired legacy terms.

- Required structural headings for this packet target:
  - ### Reconciliation addendum

#### Source target target-0285
- Reconciliation action: insert_after
- Replace scope: insert_only
- Required structural headings represented:
  - ### Reconciliation addendum
- Exact required items represented:
  - open transient `generated://...` or specialized viewer
  - generated://...
  - resolution may end in a workspace path open, a transient `generated://` buffer, or a routed non-editor surface
  - generated://
  - `assistant-chat-design.md` already relies on stable identity for message/search/jump behavior but still lacks the shared named primitive that should connect those behaviors to the route/object model.
  - assistant-chat-design.md
  - blocker inventory remains materially open
- Exact acceptance checks represented:
  - All coverage_row_ids listed on this target are represented without broad summary substitution.
  - All source_obligation_ids, source_seed_ids, and source_shard_ids are preserved in packet metadata.
  - Rows marked missing or partial receive concrete prose or structural additions under the mapped live anchor.
- Source lineage is preserved in packet metadata for coverage rows, source obligations, source seeds, source shards, gaps, fidelity refs, span group, and writer role.

All search results, palette actions, widgets, recovery links, and cross-surface pivots emit one shared route/deep-link payload. `resume_url` is the serialized transport form of that payload, not a second routing model.

- Concern search results route as object-first results with focused-run and target-tab context by using `object_kind: concern`, `object_id: concern_id`, `focused_run_id`, and `target_tab`.
- Concern drill-down preserves the selected `concern_id` plus related object context when pivoting into inspectors, recovery links, or historical views.
- `route_target` stays small: it is either `subject_id`-based identity or `object_kind` / `object_id` identity.
- `subject_id` families are limited to `doc:` and `artifact:`.
- `inspector_target` is secondary metadata, not primary identity.
- Destination/context overrides are allowed only when needed to restore the target surface.

### 7.4 Settings and inspectors

### Reconciliation addendum

This addendum applies row-level transfer coverage requirements for the mapped owner anchor. Source IDs and exact source tokens are preserved in packet metadata; prose below uses canonical wording for retired legacy terms.

- Required structural headings for this packet target:
  - ### Reconciliation addendum

#### Source target target-0286
- Reconciliation action: insert_after
- Replace scope: insert_only
- Required structural headings represented:
  - ### Reconciliation addendum
- Exact required items represented:
  - direct evidence/record inspectors
  - consumer docs for graph/detail/history/ledger/runtime inspectors
  - dashboard and settings language brought in line with the graph/seam/package model
- Exact acceptance checks represented:
  - All coverage_row_ids listed on this target are represented without broad summary substitution.
  - All source_obligation_ids, source_seed_ids, and source_shard_ids are preserved in packet metadata.
  - Rows marked missing or partial receive concrete prose or structural additions under the mapped live anchor.
- Source lineage is preserved in packet metadata for coverage rows, source obligations, source seeds, source shards, gaps, fidelity refs, span group, and writer role.

The settings model separates `requested_account_id` from `requested_account_policy`. It adds `requested_account_binding` with `none`, `preferred`, and `required` semantics, and every inspector renders the same identity grammar: Requested account / Requested binding / Effective account / Switch reason.

Shared runtime identity carries `execution_role` together with requested and effective operational identity. That packet propagates into effective-resolution records, attempt records, usage surfaces, and inspector payloads so the operator can compare requested vs effective runtime identity without reconstructing it from logs.

The settings resolver uses three axes:
- `source`: app defaults, project policy, worker policy, and recovery-policy inputs
- `request`: requested account, requested binding, requested account policy, requested execution role, and requested operational identity
- `execution`: effective account, effective binding outcome, effective operational identity, `execution_role`, and `switch_reason`

Resolver display grammar is deterministic: show worker-policy display first, then source snapshot, then request snapshot, then execution outcome. Resolver inputs are the three axes above plus current projection trust. The deterministic resolver matrix is: `required` must bind or block; `preferred` binds when available and otherwise falls back with an explicit `switch_reason`; `none` keeps the request visible but lets policy choose execution. The emit shape is `settings_resolution { source_snapshot, request_snapshot, execution_snapshot, switch_reason, resolution_status }`.

### 7.5 Project and attention surfaces

`project_summary` is the reusable summary object for Orchestrator-facing project surfaces. It contains `activity_state`, `attention_state`, `health_state`, `owner`, and projection-trust disclosure so the operator can see whether a summary is record-backed, current, or degraded. Canonical blocked episodes take precedence over weaker derived warnings when summary rollups disagree.

`project_attention_item` is the reusable attention-row object. Each row carries a primary route payload, projection-trust disclosure, blocked-owner kind, escalation level, and summary text. The same row contract is consumable in Orchestrator, Dashboard, and notification surfaces without re-minting attention identities.

### Concern, escalation, notification, and help surfaces

### Reconciliation addendum

This addendum applies row-level transfer coverage requirements for the mapped owner anchor. Source IDs and exact source tokens are preserved in packet metadata; prose below uses canonical wording for retired legacy terms.

- Required structural headings for this packet target:
  - ### Reconciliation addendum

#### Source target target-0292
- Reconciliation action: insert_after
- Replace scope: insert_only
- Required structural headings represented:
  - ### Reconciliation addendum
- Exact required items represented:
  - seam-blocking weak integration concern with no progress for hours -> blocked surfaces + possible system notification
  - small surfaces need compact labels plus deeper linked/contextual help, not renamed local jargon
  - Degraded-trust and concern escalation remain under-owned across provider/runtime/UI boundaries:
- Exact acceptance checks represented:
  - All coverage_row_ids listed on this target are represented without broad summary substitution.
  - All source_obligation_ids, source_seed_ids, and source_shard_ids are preserved in packet metadata.
  - Rows marked missing or partial receive concrete prose or structural additions under the mapped live anchor.
- Source lineage is preserved in packet metadata for coverage rows, source obligations, source seeds, source shards, gaps, fidelity refs, span group, and writer role.

Concern is a first-class durable record distinct from review finding, annotation, blocked episode, and graph patch request. The visible concern contract carries `concern_id`, `project_id`, run refs, scope refs, evidence refs, source refs, lineage refs, severity, category, status, and governance metadata.

Concern actions carry actor authority, confirmation requirements, rationale requirements, reversibility, and audit fields. `acknowledged`, `dismissed`, `resolved`, and structural lineage edits remain distinct actions rather than aliases of a single close operation.

These surfaces share one escalation ladder across Orchestrator, Dashboard, thread badges, and notifications. `attention_required` remains distinct from `blocked`, and persistent blockers resurface on meaningful change or persistence even when advisory warnings are quieted.

This section consumes Glossary coverage for rewrite-critical objects, states, and trust terms, including Concern, blocked episode, focused run, projection trust, escalation ladder, blocked owner, and `resolution_kind`. Help is layered as inline help, context help, and canonical help-entry pages while keeping canonical term names stable.

Notifications route by severity, execution impact, blocked owner, persistence, and projection trust. Quiet windows are allowed for advisory warnings only; canonical blocked episodes are never suppressed by quiet windows.

Dedicated help entries use a stable template: canonical term, trigger conditions, operator meaning, related concepts, primary routes, and recovery guidance. Related-concept links always point to canonical term names rather than local aliases.

Project-facing help and notifications use project `activity_state`, project `attention_state`, the blocked-owner taxonomy, the shared escalation ladder, and resurfacing/aging rules. Dismissal requires dismissal rationale, resolution requires resolution rationale, and `accepted_risk` is treated as a resolution path rather than a dismissal.

The blocked-owner taxonomy is explicitly eight kinds: `Runtime`, `Package Overseer`, `Seam Overseer`, `Corroboration`, `Graph Patch`, `Recovery`, `User`, and `External Resource`. The five-level escalation ladder is `info`, `watch`, `attention_required`, `blocked`, and `escalated`, with mapping across Orchestrator banners, Dashboard summaries, thread badges, and notifications.

### Recommended minimum concern record shape

- `concern_id`, `project_id`, `run_ref`, `scope_ref`, `source_event_ref`
- `evidence_refs[]`, `artifact_refs[]`, `lineage_refs[]`
- `severity`, `category`, `status`, `visibility_level`, `attention_level`, `chatworthy`, `blocking_effect?`
- `owner_kind`, `owner_ref`, `created_by_kind`, `created_by_ref`, `resolver_ref?`
- `governance`: authority policy, confirmation policy, rationale policy, audit refs

`blocking_effect` stays explicitly separate from `severity`; it explains operational stop/go impact rather than concern seriousness.

### 7.16 Chat Panel

The Chat Panel is the canonical threaded assistant workspace for Ask, Agent, Debug, Plan, and Deep Plan modes.

Layout:
- vertical split with **message stream** in the top 70% and **composer** in the bottom 30%
- optional collapsible **Plan panel** appears as a side panel within the chat surface when the thread is in Plan or Deep Plan mode
- header remains sticky while the message stream scrolls independently

#### 7.16.1 Thread header and message stream

### Reconciliation addendum

This addendum applies row-level transfer coverage requirements for the mapped owner anchor. Source IDs and exact source tokens are preserved in packet metadata; prose below uses canonical wording for retired legacy terms.

- Required structural headings for this packet target:
  - ### Reconciliation addendum

#### Source target target-0315
- Reconciliation action: insert_after
- Replace scope: insert_only
- Required structural headings represented:
  - ### Reconciliation addendum
- Exact required items represented:
  - `message_id` when the real target is the message itself
  - message_id
  - `object_kind = message`
  - object_kind = message
- Exact acceptance checks represented:
  - All coverage_row_ids listed on this target are represented without broad summary substitution.
  - All source_obligation_ids, source_seed_ids, and source_shard_ids are preserved in packet metadata.
  - Rows marked missing or partial receive concrete prose or structural additions under the mapped live anchor.
- Source lineage is preserved in packet metadata for coverage rows, source obligations, source seeds, source shards, gaps, fidelity refs, span group, and writer role.

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

### Reconciliation addendum

This addendum applies row-level transfer coverage requirements for the mapped owner anchor. Source IDs and exact source tokens are preserved in packet metadata; prose below uses canonical wording for retired legacy terms.

- Required structural headings for this packet target:
  - ### Reconciliation addendum

#### Source target target-0284
- Reconciliation action: insert_after
- Replace scope: insert_only
- Required structural headings represented:
  - ### Reconciliation addendum
- Exact required items represented:
  - rather than a dedicated top-level `usage_event_ref`
  - usage_event_ref
- Exact acceptance checks represented:
  - All coverage_row_ids listed on this target are represented without broad summary substitution.
  - All source_obligation_ids, source_seed_ids, and source_shard_ids are preserved in packet metadata.
  - Rows marked missing or partial receive concrete prose or structural additions under the mapped live anchor.
- Source lineage is preserved in packet metadata for coverage rows, source obligations, source seeds, source shards, gaps, fidelity refs, span group, and writer role.

PM ships two complementary audit surfaces: lightweight in-thread transparency and a dedicated searchable log/audit inspector.

ContractRef: ContractName:Plans/assistant-chat-design.md, ContractName:Plans/storage-plan.md

Inspector requirements:
- summary rows use a 5-item compact format: operation label, short query/url/task preview, success/failure status, fallback note when present, and source/page counts when present
- full payload dereference is on-demand only; the inspector does not eagerly expand large refs or blobs
- supported interactions include filter by event family, search by tool or operation, time-range queries, drill-down, and export
- `logsearch` and `logread` have explicit GUI surfacing rather than remaining CLI-only affordances

ContractRef: ContractName:Plans/Contracts_V0.md, ContractName:Plans/Tools.md

#### 7.19.1 Embedded document pane

### Reconciliation addendum

This addendum applies row-level transfer coverage requirements for the mapped owner anchor. Source IDs and exact source tokens are preserved in packet metadata; prose below uses canonical wording for retired legacy terms.

- Required structural headings for this packet target:
  - ### Reconciliation addendum

#### Source target target-0316
- Reconciliation action: insert_after
- Replace scope: insert_only
- Required structural headings represented:
  - ### Reconciliation addendum
- Exact required items represented:
  - `requested_persona_id` / `effective_persona_id` remain embedded in consumer docs despite canonical prohibition.
  - requested_persona_id
  - effective_persona_id
  - `FinalGUISpec.md` aligns with that newer model in the embedded document pane:
  - FinalGUISpec.md
  - the embedded document pane already shares canonical document identity and backend restore pipelines rather than pure path opens
- Exact acceptance checks represented:
  - All coverage_row_ids listed on this target are represented without broad summary substitution.
  - All source_obligation_ids, source_seed_ids, and source_shard_ids are preserved in packet metadata.
  - Rows marked missing or partial receive concrete prose or structural additions under the mapped live anchor.
- Source lineage is preserved in packet metadata for coverage rows, source obligations, source seeds, source shards, gaps, fidelity refs, span group, and writer role.

The embedded document pane is a shared-buffer review/document surface used by Interview, Builder, and bundle-review workflows.

Rules:
- document selection, scroll position, active review stage, and approval state persist through `document_pane_state:v1:{project_id}:{page_context}`
- the pane shares source-of-truth buffers with File Editor rather than maintaining divergent document copies
- findings summaries and approval gates render adjacent to the document, not inside unrelated chat-local controls

#### 7.19.2 Bundle controls and review gate

### Reconciliation addendum

This addendum applies row-level transfer coverage requirements for the mapped owner anchor. Source IDs and exact source tokens are preserved in packet metadata; prose below uses canonical wording for retired legacy terms.

- Required structural headings for this packet target:
  - ### Reconciliation addendum

#### Source target target-0317
- Reconciliation action: insert_after
- Replace scope: insert_only
- Required structural headings represented:
  - ### Reconciliation addendum
- Exact required items represented:
  - what the provider/runtime actually used and whether controls were honored/skipped/clamped
  - provider-specific caveats shown near the relevant controls
  - command/wiring/template drift is now concrete enough to break gate logic and stable action IDs.
  - `staged_bundle_ref?` or equivalent pre/post-unification bundle refs
  - staged_bundle_ref?
  - The next best stage is condensation so the compact blocker bundle matches the sharper live-doc evidence.
- Exact acceptance checks represented:
  - All coverage_row_ids listed on this target are represented without broad summary substitution.
  - All source_obligation_ids, source_seed_ids, and source_shard_ids are preserved in packet metadata.
  - Rows marked missing or partial receive concrete prose or structural additions under the mapped live anchor.
- Source lineage is preserved in packet metadata for coverage rows, source obligations, source seeds, source shards, gaps, fidelity refs, span group, and writer role.

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

