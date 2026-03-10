#!/usr/bin/env python3
"""Build research_packet.json for GUI/Artifacts/Usage/Panels. No references to reconciliation doc."""
from datetime import datetime, timezone
import json
import os

now = datetime.now(timezone.utc)
ts = now.strftime('%Y%m%d-%H%M%S')
new_run_id = 'rewrite-' + ts + '-gui-artifacts-usage-panels'
created_at_utc = now.strftime('%Y-%m-%dT%H:%M:%SZ')

decisions = [
    {"id": "runtime-artifact-mechanism-option-2", "decision": "One seglog event type per artifact type only. Event types: runtime_artifact.code_diff, runtime_artifact.implementation_plan, runtime_artifact.reasoning_summary, runtime_artifact.validation_test, runtime_artifact.screenshot, runtime_artifact.evidence, runtime_artifact.document, runtime_artifact.restore_point, runtime_artifact.browser_recording, runtime_artifact.tool_llm_trace, runtime_artifact.context_snapshot, runtime_artifact.cost_usage, runtime_artifact.hitl_approval, runtime_artifact.failed_attempts, runtime_artifact.subagent_lineage, runtime_artifact.before_after_snapshot, runtime_artifact.suggested_next_steps, runtime_artifact.api_web_call, runtime_artifact.artifact_version. No single generic runtime_artifact event with subtype field.", "rationale": "Storage and projectors need stable event type names; single type with discriminator causes drift."},
    {"id": "artifacts-index-redb-key", "decision": "redb key for Artifacts index is per-project only: artifacts_index:v1:{project_id}. Not global; not per-run.", "rationale": "Artifacts are project-scoped; index must match."},
    {"id": "task-id-deterministic", "decision": "task_id is present in runtime artifact payload when the run has task/subtask granularity; otherwise omit from payload. No optional wording; rule is deterministic.", "rationale": "Avoids ambiguous optional semantics."},
    {"id": "reasoning-tokens-required-ui-conditional", "decision": "reasoning_tokens is required in the usage/cost_usage schema. In the UI, display the field only when value > 0; do not show when zero.", "rationale": "Schema completeness; UI avoids clutter when not applicable."},
    {"id": "cost-usage-attribution-only", "decision": "cost_usage runtime artifact is an attribution record only. Same canonical usage pipeline and schema as usage.event (tokens_in, tokens_out, reasoning_tokens, cost, platform/provider, model). Ledger and Usage page consume the same data; no second store.", "rationale": "Single source of truth for usage; cost_usage links to it."},
    {"id": "show-in-ledger-usage-required", "decision": "Show in Ledger and Show in Usage are required actions for the cost_usage artifact in the Artifacts panel; link to Ledger and Usage page using same canonical usage data (e.g. filter by run_id/thread_id or usage_event_id).", "rationale": "User can navigate from artifact to full usage context."},
    {"id": "gap3-single-schema", "decision": "cost_usage and usage.event use a single coherent schema. Ledger, 5h/7d, and Usage page all consume one format; document or update the single write path and UsageRecord alignment to resolve Gap 3 (Ledger vs usage_tracker split).", "rationale": "Eliminates dual write paths and field-name drift."},
    {"id": "side-panel-single-slot-last-click-wins", "decision": "Single side-panel slot: clicking an activity bar icon replaces the current panel content (last-click wins). The most recently clicked icon's panel is shown. No Home button on the activity bar; main app navigation (Dashboard, Projects, etc.) stays in title bar / primary content.", "rationale": "Explicit UX so GUI implementation is unambiguous."},
    {"id": "layout-persistence-per-project", "decision": "Layout (panel positions, dock sides, activity bar order) is saved per project (e.g. redb keys per project_id). Persist automatically; no separate save layout action required.", "rationale": "User expects layout to follow project."},
    {"id": "activity-bar-panels-list", "decision": "Panels that can occupy the side panel and are exposed via activity bar: Git (GitHub), Docker, Source Control, Unraid, Artifacts, Chat, File Manager. Activity bar is extensible (extensions/plugins add icons); drag-to-reorder applies to built-in and extension icons; optional user-defined separators.", "rationale": "Full inventory and extensibility."},
    {"id": "browser-recordings-required", "decision": "Browser recordings are a required artifact type in the Artifacts panel (not optional). Type: runtime_artifact.browser_recording; behavior and schema must be specified.", "rationale": "MVP requirement from research."},
    {"id": "all-differentiators-mvp", "decision": "All artifact differentiators identified in the research are MVP and required; no optional differentiators.", "rationale": "Consistent scope."},
    {"id": "opencode-product-vs-provider", "decision": "OpenCode the product (repo) is the reference for usage collection (message-level usage, getUsage-style normalization, processor finish-step, message + step-finish). OpenCode the provider (Provider_OpenCode.md) is one transport. All providers normalize to the same usage.event / message usage shape; collection mechanism differs per provider.", "rationale": "Prevents terminology drift."},
    {"id": "run-debug-spec-detail", "decision": "Run & Debug (DAP) spec must include: config in .puppet-master/launch.json (VS Code-compatible; launch vs attach); toolbar Start/Continue (F5), Pause, Step Over (F10), Step Into (F11), Step Out (Shift+F11), Restart, Stop (Shift+F5); panes Call stack, Variables, Breakpoints, Debug console; line/conditional/hit-count/exception breakpoints; run to cursor; evaluate expression, Watches; logpoints, inline values, CodeLens, test-debug, AI actions, Debug MCP, orchestrator-debug where in scope.", "rationale": "Implementation-ready parity and differentiators."},
    {"id": "ai-in-git-multi-repo-scope", "decision": "AI in Git (e.g. AI-assisted commit messages, suggestions) and multi-repo source control are in scope for feature-list and GitHub_Integration; either add to scope in those docs or explicitly defer with a pointer.", "rationale": "Research requested both; reconcile so not dropped."},
]

# Content for FinalGUISpec §4.1 Activity Bar (replace_section body only - no heading)
activity_bar_body = """Left edge, 48px wide. A vertical strip of icons, each representing a panel or group. **There is no Home icon on the activity bar;** main app navigation (Dashboard, Projects, etc.) stays in the title bar / primary content.

| Icon | Panel / group | Behavior |
|------|----------------|----------|
| Play | Run & Debug | Toggles Run & Debug panel in side panel (DAP-based debugging; see §7.20) |
| Git / branch | Git (GitHub) | Toggles Git panel in side panel (repo/branch/diff/operations; see Plans/GitHub_Integration.md §A) |
| Docker | Docker | Toggles Docker Manage panel in side panel when project is Docker-related (see Plans/Containers_Registry_and_Unraid.md) |
| Source control | Source Control | Toggles Source Control panel in side panel (multi-repo; Git-focused) |
| Unraid | Unraid | Toggles Unraid template panel in side panel when project has Unraid template workflow |
| Box/archive | Artifacts | Toggles Artifacts panel in side panel (runtime artifacts; see Plans/Runtime_Artifacts_Panel.md) |
| Chat | Chat | Toggles Chat tab in side panel |
| Folder | Files | Toggles File Manager panel in side panel |
| Sliders | Settings | Settings (unified) in primary content |
| Chart | Data | Usage, Metrics, Evidence, etc. in primary content; default **Usage** |

**Single side-panel slot, last-click wins:** Only one side panel is visible at a time. Clicking an activity bar icon **replaces** the current panel content with that icon's panel. The most recently clicked icon's panel is shown.

**Behavior:**
- **Single click** on an activity bar icon shows that panel in the side panel slot (replacing whatever was there).
- **Long press or right-click** on a group icon (e.g. Data) opens a popover sub-menu listing pages in that group; Run & Debug / Git / Docker / Source Control / Unraid / Artifacts / Chat / Files each occupy the side panel when clicked.
- **Active indicator:** 3px vertical accent stripe on the left edge of the active icon.
- Icons are 24x24px, outlined, using `Theme.text-primary` with the active icon using `Theme.accent-blue`.

**Activity bar reordering:** Icons can be dragged up/down to reorder. A separator line can be placed between primary and secondary groups. Order is persisted in redb **per project** (see §5.7).

**Activity bar extensibility:** Extensions/plugins may add activity bar items. Drag-to-reorder applies to built-in and extension icons.

ContractRef: ContractName:Plans/GitHub_Integration.md, ContractName:Plans/Containers_Registry_and_Unraid.md, ContractName:Plans/Runtime_Artifacts_Panel.md, PolicyRule:Decision_Policy.md§2"""

# Content for §5.1 insert_after - list of panels that can occupy side panel
panel_list_add = """
**Panels that can occupy the side panel (one at a time; last-click wins):** Chat, File Manager, Git (GitHub), Docker Manage, Source Control, Unraid, Artifacts. See §4.1 Activity Bar for which activity bar icon shows which panel. Each of these panels supports detach/re-dock as below.
"""

# Content for §5.7 Panel Persistence - add per-project
layout_persistence_add = """
**Layout persistence per project:** Panel dock state (docked side and width, or floating position/size), **activity bar icon order**, and **which panel was last visible** are persisted **per project** in redb (e.g. under keys scoped by `project_id`). Restored on startup and when switching projects. If a floating window was on a monitor no longer connected, fall back to docked state.
"""

# View inventory addendum - add Artifacts row
view_inventory_artifacts = """
| 21 | Artifacts | -- | Side panel | **NEW** (runtime artifacts: diffs, plans, evidence, browser recordings, cost_usage, etc.; see Plans/Runtime_Artifacts_Panel.md) |
"""

# Storage-plan: Runtime artifacts event types and redb key (additive section)
storage_runtime_artifacts = """
#### Additions: Runtime Artifacts (GUI panel) event types and index

**Scope:** Agent-run outputs displayed in the Artifacts panel (see Plans/Runtime_Artifacts_Panel.md). Distinct from Project Plan Package artifacts (Plans/Project_Output_Artifacts.md).

**Seglog event types (one per artifact type):** Each event uses the standard EventRecord envelope (schema, ts, seq, type, run_id, thread_id, payload). The `type` value is one of:
- `runtime_artifact.code_diff`
- `runtime_artifact.implementation_plan`
- `runtime_artifact.reasoning_summary`
- `runtime_artifact.validation_test`
- `runtime_artifact.screenshot`
- `runtime_artifact.evidence`
- `runtime_artifact.document`
- `runtime_artifact.restore_point`
- `runtime_artifact.browser_recording`
- `runtime_artifact.tool_llm_trace`
- `runtime_artifact.context_snapshot`
- `runtime_artifact.cost_usage`
- `runtime_artifact.hitl_approval`
- `runtime_artifact.failed_attempts`
- `runtime_artifact.subagent_lineage`
- `runtime_artifact.before_after_snapshot`
- `runtime_artifact.suggested_next_steps`
- `runtime_artifact.api_web_call`
- `runtime_artifact.artifact_version`

**redb key:** `artifacts_index:v1:{project_id}` (per-project only). Value: index structure for the project's runtime artifacts (e.g. list or map of artifact_id to metadata for UI listing/filtering).

**Projector:** A projector (or equivalent) reads seglog events whose `type` starts with `runtime_artifact.` and writes/updates the per-project `artifacts_index:v1:{project_id}`. No `payload.artifact_type` discriminator; type is given by event `type`.

**cost_usage alignment:** The payload of `runtime_artifact.cost_usage` events MUST align with the canonical `usage.event` schema (tokens_in, tokens_out, reasoning_tokens, cost, platform/provider, model, etc.). Canonical usage remains `usage.event`; cost_usage is an attribution record that references the same pipeline. Ledger and Usage page consume the same data.

ContractRef: ContractName:Plans/Runtime_Artifacts_Panel.md, ContractName:Plans/Contracts_V0.md#EventRecord, ContractName:Plans/usage-feature.md, PolicyRule:Decision_Policy.md§2
"""

# Usage-feature: cost_usage artifact and Show in Ledger/Usage + OpenCode ref + Gap 3
usage_cost_usage_section = """
### Cost_usage runtime artifact and Show in Ledger / Show in Usage

The **cost_usage** runtime artifact (see Plans/Runtime_Artifacts_Panel.md and Plans/storage-plan.md) is an **attribution record** only. It uses the **same canonical usage pipeline and schema** as `usage.event` (tokens_in, tokens_out, reasoning_tokens, cost, platform/provider, model). There is no second store; the Ledger and Usage page consume the same data.

**Artifacts panel actions for cost_usage items:** For each cost_usage artifact, the Artifacts panel MUST offer:
- **Show in Ledger** — Navigate to the Usage area (Ledger tab or Ledger view) with filters set so the canonical usage.event for this cost is visible (e.g. by usage_event_seq or usage_event_ref, or by run_id/thread_id/timestamp).
- **Show in Usage** — Navigate to the Usage page (or thread Usage tab when the cost is for that thread) with the same event in scope (e.g. selected or scrolled into view).

Implementation note: If the cost_usage payload includes `usage_event_seq` or `usage_event_ref`, the GUI can pass it to the Usage/Ledger view to scroll to or highlight that row. Otherwise open Usage/Ledger filtered by run_id/thread_id/ts.

### OpenCode (product) usage pipeline reference

For implementers: the flow by which usage is collected and stored can be referenced from the OpenCode product (anomalyco/opencode repo). Conceptual flow: **provider response** → adapter → **LanguageModelV2Usage** (or equivalent) → **getUsage-style normalization** (e.g. Session.getUsage) → **processor** applies on finish-step to assistant message + step-finish part; **UI reads from messages** and/or usage.event. Key paths in that repo: session-context-metrics (UI metrics from messages), processor finish-step (where token/cost is applied to message), Session.getUsage (normalization). Puppet Master does not replicate this exactly; all providers (CLI-bridged, OpenCode provider, Codex, Gemini, Copilot) normalize to the same usage.event / message usage shape; collection mechanism differs per provider. OpenCode the **provider** (Plans/Provider_OpenCode.md) is one transport; OpenCode the **product** is the reference for "how message-level usage becomes stored usage."

### Gap 3 resolution: single coherent schema

**Gap 3 (Ledger vs. usage_tracker split)** is resolved by ensuring that **cost_usage** and **usage.event** use a **single coherent schema**. The Ledger, 5h/7d aggregation, and Usage page all consume one format. The write path (UsageRecord, usage.jsonl, or seglog usage.event) MUST be documented so that field names (e.g. operation/action, tokens_in/tokens_out, cost) are consistent. No ad-hoc remapping between Ledger display and stored events.

ContractRef: ContractName:Plans/storage-plan.md, ContractName:Plans/Runtime_Artifacts_Panel.md, PolicyRule:Decision_Policy.md§2
"""

# Project_Output_Artifacts: Runtime Artifacts pointer (insert after §0 or new subsection)
project_output_runtime_pointer = """
## Runtime Artifacts (GUI panel) — distinct from this document

This document is the SSOT for **Project Plan Package** artifacts (user-project outputs under `.puppet-master/project/**`). A separate concept is **Runtime Artifacts**: agent-run outputs (diffs, plans, evidence, browser recordings, cost_usage, etc.) displayed in the **Artifacts panel** of the GUI. Those are persisted via seglog `runtime_artifact.*` event types and redb `artifacts_index:v1:{project_id}`. The full spec (19 types, JSON schemas, task_id rule, reasoning_tokens, cost_usage, Show in Ledger/Usage, browser recordings) is in **Plans/Runtime_Artifacts_Panel.md**. Do not conflate the two: Project Plan Package = user-project deliverables; Runtime Artifacts = agent-run outputs in the Artifacts panel.

ContractRef: ContractName:Plans/Runtime_Artifacts_Panel.md, ContractName:Plans/storage-plan.md
"""

# Full Runtime_Artifacts_Panel.md content (new file)
runtime_artifacts_panel_full = """# Runtime Artifacts Panel — SSOT

> **Compliance:** This document follows Plans/DRY_Rules.md. Naming: "Puppet Master" only. No open questions; deterministic defaults per Plans/Decision_Policy.md.

ContractRef: ContractName:Plans/Contracts_V0.md, ContractName:Plans/storage-plan.md, ContractName:Plans/usage-feature.md, ContractName:Plans/Project_Output_Artifacts.md

## 1. Purpose and scope

The **Artifacts panel** is the single place to see everything agents produced during a run or thread: file changes (diffs), plans, verification evidence, screenshots, reasoning summaries, browser recordings, tool/LLM traces, cost_usage attribution, and other types below. It does not run agents; it lists, previews, and links. All artifact types listed are **required** for MVP; there are no optional types.

## 2. Two artifact families (no conflation)

| Family | Scope | SSOT | Persistence |
|--------|--------|------|-------------|
| **Project Plan Package** | User-project outputs | Plans/Project_Output_Artifacts.md | .puppet-master/project/** |
| **Runtime Artifacts** | Agent-run outputs in Artifacts panel | This document | seglog runtime_artifact.*, redb artifacts_index:v1:{project_id} |

## 3. Mechanism: one event type per artifact type

**Option 2 only:** One seglog event type per artifact type. No single generic `runtime_artifact` event with a subtype field. Each event uses the standard EventRecord envelope (schema, ts, seq, type, run_id, thread_id, payload). The `type` value is exactly one of the 19 event type names below.

**Canonical 19 artifact types and event type names:**
- code_diff → `runtime_artifact.code_diff`
- implementation_plan → `runtime_artifact.implementation_plan`
- reasoning_summary → `runtime_artifact.reasoning_summary`
- validation_test → `runtime_artifact.validation_test`
- screenshot → `runtime_artifact.screenshot`
- evidence → `runtime_artifact.evidence`
- document → `runtime_artifact.document`
- restore_point → `runtime_artifact.restore_point`
- browser_recording → `runtime_artifact.browser_recording` (required; not optional)
- tool_llm_trace → `runtime_artifact.tool_llm_trace`
- context_snapshot → `runtime_artifact.context_snapshot`
- cost_usage → `runtime_artifact.cost_usage`
- hitl_approval → `runtime_artifact.hitl_approval`
- failed_attempts → `runtime_artifact.failed_attempts`
- subagent_lineage → `runtime_artifact.subagent_lineage`
- before_after_snapshot → `runtime_artifact.before_after_snapshot`
- suggested_next_steps → `runtime_artifact.suggested_next_steps`
- api_web_call → `runtime_artifact.api_web_call`
- artifact_version → `runtime_artifact.artifact_version`

## 4. redb key and projector

**redb key:** `artifacts_index:v1:{project_id}`. Per-project only; not global; not per-run.

**Projector:** A projector (or equivalent) reads seglog events whose `type` starts with `runtime_artifact.` (or lists the 19 types explicitly) and writes/updates the per-project artifacts index. No payload.artifact_type discriminator; type is given by event `type`.

## 5. Canonical IDs and task_id rule

**Canonical ID set:** artifact_id, run_id, thread_id, task_id (per rule below), linked_artifact_id, logical_artifact_id. Format (e.g. UUID, prefixed) must be specified in implementation; see Plans/Contracts_V0.md for run_id/thread_id.

**task_id rule (deterministic):** Present in payload **when the run has task/subtask granularity**; **otherwise omit from payload.** No "optional" wording; not conditional on "if available."

## 6. reasoning_tokens and cost_usage

**reasoning_tokens:** Required in the usage/cost_usage schema (integer, minimum 0). In the UI, display the field **only when value > 0**; do not show when zero.

**cost_usage artifact:** Attribution record only. Same canonical usage pipeline and schema as usage.event (tokens_in, tokens_out, reasoning_tokens, cost, platform/provider, model). Ledger and Usage page consume the same data. Required actions in Artifacts panel for cost_usage items: **Show in Ledger**, **Show in Usage** (navigate to Ledger/Usage with filters so the canonical usage event is visible).

ContractRef: ContractName:Plans/usage-feature.md, ContractName:Plans/storage-plan.md

## 7. JSON schemas (all required)

**Envelope:** Plans/runtime_artifact_envelope.schema.json (`$id`: pm.runtime_artifact.envelope.v1). Common payload fields for all runtime artifact events.

**Per-type:** One file per artifact type, e.g. Plans/runtime_artifact_code_diff.schema.json through Plans/runtime_artifact_artifact_version.schema.json, with `$id`: pm.runtime_artifact.<type>.v1. Each payload is validated against the envelope plus the corresponding type schema. The cost_usage schema MUST include required reasoning_tokens (integer, minimum 0). All 19 type schemas are required; no optional schema files.

Implementation MUST validate every runtime_artifact.* event payload against the envelope and the matching type schema before appending to seglog and before writing to the artifacts index.

## 8. Browser recordings

Browser recordings are a **required** artifact type (runtime_artifact.browser_recording). Source: GUI automation runs (e.g. Playwright) from Orchestrator or Chat. Stored under canonical evidence path; list shows thumbnail, duration, run/session id, timestamp. Detail: in-panel video player or "Open in default app"; optional timeline with key events. Actions: Copy path, Export, Send to Chat as needed.

## 9. All differentiators MVP

All artifact differentiators identified in the research are MVP and required; no optional differentiators. Triggers, cardinality, error handling, sanitization, and UI edge cases must be specified per type as needed for implementation.

## 10. References

- Plans/Contracts_V0.md (EventRecord envelope)
- Plans/storage-plan.md (event types, redb key, projector, cost_usage alignment)
- Plans/usage-feature.md (usage pipeline, Show in Ledger/Usage, Gap 3)
- Plans/Project_Output_Artifacts.md (distinction from Project Plan Package)
- Plans/FileManager.md (open by artifact identity)
"""

def build_doc_intents():
    return [
        # FinalGUISpec: replace §4.1 Activity Bar
        {
            "path": "Plans/FinalGUISpec.md",
            "intent": "update",
            "anchors": [
                {"anchor_type": "heading", "operation": "replace_section", "anchor": "### 4.1 Activity Bar", "content_markdown": activity_bar_body}
            ]
        },
        # FinalGUISpec: insert_after §5.1 Detachable Panels - add panel list
        {
            "path": "Plans/FinalGUISpec.md",
            "intent": "update",
            "anchors": [
                {"anchor_type": "heading", "operation": "insert_after", "anchor": "### 5.1 Detachable Panels", "content_markdown": panel_list_add}
            ]
        },
        # FinalGUISpec: §5.7 Panel Persistence - add per-project sentence
        {
            "path": "Plans/FinalGUISpec.md",
            "intent": "update",
            "anchors": [
                {"anchor_type": "heading", "operation": "insert_after", "anchor": "### 5.7 Panel Persistence", "content_markdown": layout_persistence_add}
            ]
        },
        # FinalGUISpec: §7.1 View Inventory - add Artifacts row (insert_after the table)
        {
            "path": "Plans/FinalGUISpec.md",
            "intent": "update",
            "anchors": [
                {"anchor_type": "heading", "operation": "insert_after", "anchor": "### 7.1 View Inventory (21 views/panels + 6 bottom panel tabs)", "content_markdown": view_inventory_artifacts}
            ]
        },
        # storage-plan: add Runtime Artifacts subsection (insert_after a suitable heading - e.g. after Container publish section or before 2.4)
        {
            "path": "Plans/storage-plan.md",
            "intent": "update",
            "anchors": [
                {"anchor_type": "heading", "operation": "insert_after", "anchor": "##### Canonical enum binding", "content_markdown": storage_runtime_artifacts}
            ]
        },
        # usage-feature: add cost_usage + OpenCode + Gap 3 (insert_after Data and Backend or at file_end)
        {
            "path": "Plans/usage-feature.md",
            "intent": "update",
            "anchors": [
                {"anchor_type": "heading", "operation": "insert_after", "anchor": "## Data and Backend (conceptual)", "content_markdown": usage_cost_usage_section}
            ]
        },
        # Project_Output_Artifacts: add Runtime Artifacts pointer (insert_after ## 0. Scope)
        {
            "path": "Plans/Project_Output_Artifacts.md",
            "intent": "update",
            "anchors": [
                {"anchor_type": "heading", "operation": "insert_after", "anchor": "## 0. Scope (normative)", "content_markdown": project_output_runtime_pointer}
            ]
        },
        # New file: Runtime_Artifacts_Panel.md
        {
            "path": "Plans/Runtime_Artifacts_Panel.md",
            "intent": "update",
            "anchors": [
                {"anchor_type": "file_end", "operation": "append", "anchor": "", "content_markdown": runtime_artifacts_panel_full}
            ]
        },
        # Provider_OpenCode: add paragraph on message metadata → usage.event
        {
            "path": "Plans/Provider_OpenCode.md",
            "intent": "update",
            "anchors": [
                {"anchor_type": "file_end", "operation": "append", "anchor": "", "content_markdown": "\n\n**Usage and Ledger alignment:** OpenCode server returns message-level usage; the adapter maps it to normalized usage (same shape as usage.event). Persistence and Ledger/Usage consumption follow Plans/storage-plan.md and Plans/usage-feature.md. For implementers, the OpenCode product pipeline (Session.getUsage, processor finish-step) is the reference for how message metadata becomes stored usage; terminology should not drift.\n"}
            ]
        },
        # CLI_Bridged_Providers: ensure usage on message/turn and cost_usage same schema
        {
            "path": "Plans/CLI_Bridged_Providers.md",
            "intent": "update",
            "anchors": [
                {"anchor_type": "file_end", "operation": "append", "anchor": "", "content_markdown": "\n\n**Usage on message/turn and cost_usage:** Usage may be stored on message/turn for per-thread display. The cost_usage runtime artifact (Plans/Runtime_Artifacts_Panel.md) reuses the same canonical schema as usage.event; there is no second canonical store.\n"}
            ]
        },
        # assistant-chat-design: cross-ref cost_usage and Show in Ledger/Usage
        {
            "path": "Plans/assistant-chat-design.md",
            "intent": "update",
            "anchors": [
                {"anchor_type": "file_end", "operation": "append", "anchor": "", "content_markdown": "\n\n**Artifacts panel and cost_usage:** Per-thread usage (context circle, thread Usage tab) aligns with the cost_usage runtime artifact. The Artifacts panel offers \"Show in Ledger\" and \"Show in Usage\" for cost_usage items; see Plans/usage-feature.md and Plans/Runtime_Artifacts_Panel.md.\n"}
            ]
        },
        # GitHub_Integration: ContractRef placement + AI in Git / multi-repo
        {
            "path": "Plans/GitHub_Integration.md",
            "intent": "update",
            "anchors": [
                {"anchor_type": "heading", "operation": "insert_after", "anchor": "## A. Git Panel (IDE Surface)", "content_markdown": "\n\nThe Git panel is exposed via the **side panel** (or primary content) per Plans/FinalGUISpec.md §4 / §5 / §7. Placement and toggling are deterministic from the activity bar (single slot, last-click wins).\n\n**Scope (AI in Git / multi-repo):** AI in Git (e.g. AI-assisted commit messages, suggestions) and multi-repo source control are in scope; see Plans/feature-list.md. Either add to this doc in a later pass or explicitly defer with a pointer.\n\nContractRef: ContractName:Plans/FinalGUISpec.md\n"}
            ]
        },
        # Containers_Registry_and_Unraid: ContractRef placement
        {
            "path": "Plans/Containers_Registry_and_Unraid.md",
            "intent": "update",
            "anchors": [
                {"anchor_type": "heading", "operation": "insert_after", "anchor": "### 2. Contextual Docker Manage surface", "content_markdown": "\n\nDocker Manage (and Unraid) are exposed via the **side panel** (or primary content) per Plans/FinalGUISpec.md §4 / §5 / §7. Placement and \"Hide when not used in Project\" align with the shell. When the project is Docker-related, the Docker icon in the activity bar shows this panel in the single side-panel slot (last-click wins).\n\nContractRef: ContractName:Plans/FinalGUISpec.md\n"}
            ]
        },
        # FileManager: align open-by-identity with Runtime Artifacts spec
        {
            "path": "Plans/FileManager.md",
            "intent": "update",
            "anchors": [
                {"anchor_type": "file_end", "operation": "append", "anchor": "", "content_markdown": "\n\n**Runtime Artifacts alignment:** Open by artifact identity and the Artifacts panel MUST align with Plans/Runtime_Artifacts_Panel.md (artifacts_index:v1:{project_id}, 19 artifact types, navigation).\n"}
            ]
        },
        # Contracts_V0: runtime_artifact.* payload schemas elsewhere; task_id rule
        {
            "path": "Plans/Contracts_V0.md",
            "intent": "update",
            "anchors": [
                {"anchor_type": "file_end", "operation": "append", "anchor": "", "content_markdown": "\n\n**runtime_artifact.* events:** Payload schemas for runtime_artifact.* events are defined in Plans/storage-plan.md and Plans/Runtime_Artifacts_Panel.md; this document does not define the 19 payloads. For task_id: present in payload when the run has task/subtask granularity; otherwise omit (deterministic rule).\n"}
            ]
        },
        # GUI_Rebuild_Requirements_Checklist: add items
        {
            "path": "Plans/GUI_Rebuild_Requirements_Checklist.md",
            "intent": "update",
            "anchors": [
                {"anchor_type": "file_end", "operation": "append", "anchor": "", "content_markdown": "\n\n- [ ] Artifacts panel in view inventory and panel system (FinalGUISpec §7.1, §4.1, §5).\n- [ ] Panel toggling: Git, Docker, Source Control, Unraid, Artifacts, Chat, Files (single side-panel slot, last-click wins).\n- [ ] Usage/Ledger linkage from cost_usage artifact (Show in Ledger / Show in Usage actions).\n"}
            ]
        },
        # OpenCode_Deep_Extraction: usage pipeline in extraction
        {
            "path": "Plans/OpenCode_Deep_Extraction.md",
            "intent": "update",
            "anchors": [
                {"anchor_type": "file_end", "operation": "append", "anchor": "", "content_markdown": "\n\n**Usage pipeline:** Usage collection and storage (message-level usage, getUsage-style normalization, processor finish-step) are covered by Plans/usage-feature.md as SSOT. Future extraction should reference that plan so usage pipeline terminology does not duplicate or contradict.\n"}
            ]
        },
        # 00-plans-index: register Runtime_Artifacts_Panel.md (add row to plan map table)
        {
            "path": "Plans/00-plans-index.md",
            "intent": "update",
            "anchors": [
                {"anchor_type": "file_end", "operation": "append", "anchor": "", "content_markdown": "\n\n**Plan map registration:** Add the following row to the Plan map table (## Plan map):\n| `Runtime_Artifacts_Panel.md` | Artifacts panel (runtime artifacts) | Canonical for 19 artifact types, seglog runtime_artifact.*, redb artifacts_index:v1:{project_id}, cost_usage, Show in Ledger/Usage, browser recordings, JSON schemas. Distinct from Project Plan Package (Project_Output_Artifacts.md). |\n"}
            ]
        },
        # feature-list: Artifacts panel, panel toggling, layout per project, AI in Git, multi-repo
        {
            "path": "Plans/feature-list.md",
            "intent": "update",
            "anchors": [
                {"anchor_type": "file_end", "operation": "append", "anchor": "", "content_markdown": "\n\n**Artifacts panel and panels (from GUI/Artifacts/Usage scope):** Artifacts panel (runtime artifacts, 19 types, cost_usage, Show in Ledger/Usage); side-panel toggling for Git, Docker, Unraid, Artifacts, Chat, Files (single slot, last-click wins); layout save per project; OpenCode-style usage-on-message reference; AI in Git; multi-repo source control (or explicit deferral).\n"}
            ]
        },
    ]

def main():
    packet = {
        "schema_id": "puppet-master-research-packet-v1",
        "run_id": new_run_id,
        "created_at_utc": created_at_utc,
        "topic": "gui-artifacts-usage-panels",
        "objective": "Emit a packetization-ready packet for the GUI, Artifacts panel, Usage alignment, and Activity bar/side panels feature set. The packet must close the full MUST CHANGE and MUST RECONCILE doc set: FinalGUISpec (activity bar single slot last-click wins, no Home, panel list, layout per project, Artifacts view); storage-plan (runtime_artifact.* event types, artifacts_index:v1:{project_id}, projector, cost_usage alignment); usage-feature (cost_usage artifact, Show in Ledger/Usage, OpenCode pipeline reference, Gap 3 single schema); Project_Output_Artifacts (pointer to Runtime Artifacts); new Runtime_Artifacts_Panel.md (19 types, schemas, task_id rule, reasoning_tokens, browser recordings, all differentiators MVP); and all MUST RECONCILE docs (Provider_OpenCode, CLI_Bridged_Providers, assistant-chat-design, GitHub_Integration, Containers_Registry_and_Unraid, FileManager, Contracts_V0, GUI_Rebuild_Requirements_Checklist, OpenCode_Deep_Extraction, 00-plans-index, feature-list). No details dropped; implementation-ready.",
        "decisions": decisions,
        "doc_intents": build_doc_intents(),
    }
    out_main = "Plans/.pipeline/research_packet.json"
    run_dir = "Plans/.pipeline/runs/" + new_run_id
    os.makedirs(run_dir, exist_ok=True)
    out_run = run_dir + "/research_packet.json"
    for path in [out_main, out_run]:
        with open(path, "w", encoding="utf-8") as f:
            json.dump(packet, f, indent=2, ensure_ascii=False)
    print("new_run_id:", new_run_id)
    print("created_at_utc:", created_at_utc)
    print("Wrote:", out_main)
    print("Wrote:", out_run)

if __name__ == "__main__":
    main()
