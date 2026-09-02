# Shard 063: PMConcept7 shared Assistant seating and context surfaces addendum - 2026-08-27

Source: `Plans/assistant-chat-design.md`

Source lines: L24523-L24613

Source SHA256: `4f05884b775e23367a0d722ec0cc8a1392dd703302a694415ff22fd1f92c2b41`

---

## PMConcept7 shared Assistant seating and context surfaces addendum - 2026-08-27

Assistant Chat owns one shared Assistant component and one thread/context state authority. The shell may
re-seat that same component between the saved Home dock and the right-side global host on all
other primary pages. Page changes do not construct a second Assistant, do not copy the transcript into a
page-local store, and do not reset the active thread, draft, attachments, activity projection, context
state, Context Detail Pane, or focus-return target. Returning Home restores the same component to the saved
Home dock; boot never restores a floating Home placement.

The context ring is the compact projection of the active thread's actual context state. Its compact surface
shows current-window usage/percentage, effective window and tokens loaded, cache hit, and source
composition. Clicking opens a compact menu with `Compact Now` and `More Details`; menu disclosure itself is
local and dispatches nothing. `Compact Now` explicitly dispatches `cmd.chat.compact_context` and updates the
ring and drawer coherently from the owner result/projection. `More Details` dispatches
`cmd.chat.open_thread_context_details` and reuses the existing thread Context Detail Pane, whose Curated and
Raw views include routing, fallback, cache, model/limit, compaction state, and compaction history. Focus and
close reuse the existing focus/close commands. No app-wide Usage route, second context drawer, or second
context store is created.

ContractRef: ContractName:Plans/Commands_System.md, ContractName:Plans/UI_Command_Catalog.md, ContractName:Plans/Wiring_Matrix.md, ContractName:Plans/UI_Wiring_Rules.md, ContractName:Plans/DRY_Rules.md, ContractName:Plans/FinalGUISpec.md

### ACD-448 - One Shared Assistant Seat And Coherent Context Ring Detail Contract

```yaml
plan_unit_id: ACD-448
unit_type: requirement
status: accepted
owner_doc: Plans/assistant-chat-design.md
canonical_text: >-
  One shared Assistant node/controller/transcript/context store is re-seated between the
  saved Home dock and the right-side global host on every primary page, preserving thread,
  draft, attachment, activity, Context Detail Pane, and focus continuity and returning to
  the saved Home dock. The active-thread context ring exposes current-window use,
  effective window/tokens, cache hit, and source composition; its click menu is local and
  offers Compact Now plus More Details. Compact Now alone dispatches
  cmd.chat.compact_context and updates ring/detail projections coherently, while More
  Details reuses the existing open/focus/close thread Context Detail Pane commands and
  Curated/Raw routing, fallback, cache, limits, compaction-state, and history views. No
  Assistant clone, app-wide Usage substitute, second detail drawer, or second context
  store is permitted.
gui_related: true
gui_classification_reason: The unit defines cross-page Assistant visibility, identity continuity, context-ring fields, menu actions, and detail views.
split_recommended: false
depends_on: [ACD-441, ACD-445, ACD-447, CS-068, UCC-147, WM-045, UIW-012, DR-039]
unblocks: []
acceptance_criteria:
  - Home, Projects, Planning Wizard, Orchestrator, Usage, Settings, and every other primary page show/hide or re-seat the same Assistant node/store rather than cloning it.
  - Returning Home restores that same node to the saved Home dock with active thread, draft, attachments, transcript, context, details, and focus continuity intact; boot never restores floating placement.
  - The context ring/menu exposes current-window use, effective window/tokens loaded, cache hit, and source composition.
  - The click menu contains Compact Now and More Details; opening or hovering the menu dispatches nothing.
  - Compact Now dispatches cmd.chat.compact_context only after explicit selection and updates the ring plus detail state coherently for started, already_running, cancelled, no_op, degraded, unavailable, retry_scheduled, completed, and failed results.
  - More Details reuses the existing thread Context Detail Pane with Curated and Raw views covering routing, fallback, cache, limits, compaction state, and history.
  - No second Assistant component, controller, transcript store, context store, or page-local detail drawer is created.
  - No WorkNodes, NodeSeeds, executable queues, implementation files, final node manifests, or production build tasks are created.
validation_surfaces:
  - python3 scripts/pm-plans-verify.py validate-wiring-matrix
  - python3 scripts/pm-plan-index.py validate
risk_class: shared_assistant_identity_or_context_projection_drift
reasoning_tier: high
context_scope: pm7_commands_wiring_dry_assistant
implementation_surfaces:
  - Plans/assistant-chat-design.md
  - Plans/UI_Command_Catalog.md
  - Plans/Wiring_Matrix.production.json
node_compile_hint:
  mode: shared_assistant_seat_and_context_surfaces
  create_worknodes: false
  create_nodeseeds: false
source_lineage:
  - Concepts/pm7-tools/base/PM7-base.html (current pinned PM7 input; source-lineage-only)
  - Concepts/pm7-tools/build_pm7.py#T33-T41 (source-owned transforms)
  - Concepts/PMConcept7.html (generated artifact; terminal bytes and hash are audit-owned)
  - Plans/.audits/audit-20260829-001-pmconcept7-widget-followup/audit_report.json (current repo-local successor audit status; verdict remains report-owned)
preserved_exact_tokens:
  - Compact Now
  - More Details
  - Curated
  - Raw
  - cmd.chat.compact_context
  - cmd.chat.open_thread_context_details
  - chatPanel
  - chatResizer
negative_constraints:
  - Do not clone or fork Assistant state when changing pages or hosts.
  - Do not dispatch compaction from hover or menu disclosure.
  - Do not route thread context details through app-wide Usage or create a second detail store.
  - Do not treat concept-local storage as canonical Assistant state.
owner_hints:
  - Plans/assistant-chat-design.md
  - Plans/FinalGUISpec.md
```
