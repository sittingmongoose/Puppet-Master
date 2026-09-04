# Shard 016: PMConcept7 transactional interaction and shared-seat wiring addendum - 2026-08-27

Source: `Plans/UI_Wiring_Rules.md`

Source lines: L734-L842

Source SHA256: `20320fc014b687080978e068cac4323fdc4f4aeba87f27f83bfff46e050ff0c0`

---

## PMConcept7 transactional interaction and shared-seat wiring addendum - 2026-08-27

The recovered PMConcept7 direct-manipulation controls use one transactional UI sequence:

1. Snapshot the owner projection and acquire pointer capture or the equivalent keyboard transaction.
2. Render fixed/portal preview geometry, ghost, placeholder, target, and motion state locally; Usage pointer resize advances its real target footprint and repacks only obstructed peers, Usage reorder displaces affected peers, and Dashboard resize keeps peers frozen.
3. Resolve the final pointer/keyboard coordinate and committed semantic target on release.
4. Dispatch exactly one existing command only when the semantic result changed.
5. Reconcile owner result/event/receipt, persist settled state once, then release capture and clear every preview class, portal, placeholder, ghost, pending animation frame, and transient listener.
6. On Escape, `pointercancel`, invalid target, stale revision, or no-change result, restore the snapshot and clean up without a command, receipt, persisted event, or storage write.

Home preset buttons are not a reason to add `cmd.workspace_layout.size_surface`: the UI resolves the
semantic `preset_id` to committed dimensions and dispatches `cmd.workspace_layout.resize_surface`.
Usage room/scope/range/disclosure/filter and popup state remain local projection; explicit refresh,
object-backed Usage/Ledger drill-through, widget commit, Context `Compact Now`, and Context `More Details`
actions use the existing catalog rows. Event-primary callers normalize to usage_event/usage_event_ref; a
PMConcept7 Ledger attempt row normalizes to usage_attempt/attempt_id without `OpenSubject` and retains
usage_event_ref plus provider/account/runtime refs as correlation.
Current PMConcept7 aggregate provider/account/panel cards open local inspectors with no command, receipt, event, or
invented route kind.

The shared Assistant has one DOM/native component identity and one thread/context store. Shell wiring may
re-seat that same node between its saved Home host and the right-side global host for other primary pages.
`cmd.panel.switch` controls visibility; re-parenting is local shell projection and must preserve node
identity, active thread, draft, transcript, attachments, context state, Context Detail Pane state, and
focus-return target. A second `chatPanel`, `chatResizer`, Assistant controller, transcript store, or context
store is a wiring failure.

ContractRef: ContractName:Plans/Commands_System.md, ContractName:Plans/UI_Command_Catalog.md, ContractName:Plans/Wiring_Matrix.md, ContractName:Plans/DRY_Rules.md, ContractName:Plans/assistant-chat-design.md

### UIW-012 - Transactional Preview Commit Cancel Cleanup And Shared Assistant Re-Seating

```yaml
plan_unit_id: UIW-012
unit_type: requirement
status: accepted
owner_doc: Plans/UI_Wiring_Rules.md
canonical_text: >-
  PMConcept7 pointer and keyboard interactions snapshot owner state, project preview
  locally, resolve the final semantic target, dispatch exactly one existing command only
  for a changed commit, reconcile the owner result, persist once, and clear all capture,
  ghost, placeholder, portal, animation-frame, and listener state. Escape, pointercancel,
  invalid, stale, and no-change paths roll back and dispatch nothing. Usage view choices,
  popup state, and current PMConcept7 aggregate provider/account/panel inspectors remain local; event-primary
  callers use usage_event/usage_event_ref, while a PMConcept7 Ledger attempt row dispatches
  cmd.nav.open_usage_subject as a usage_attempt/attempt_id object route without OpenSubject and retains the
  event ref as correlation. Home preset sizing normalizes to resize_surface, and shell
  wiring re-seats one shared Assistant node/store between Home and global hosts without
  cloning or losing thread/context continuity. Usage card body magnetism remains active, but
  move/resize acquisition uses the controls' measured base-coordinate zones, continuous
  translation attenuation, and at most one pointer-id/time/bounds-scoped document-capture
  handoff to the existing controller. Direct and rescued activation clear that lease before
  pointer capture. Rescue additionally requires the current top hit to remain inside the
  remembered card, so an intervening overlay owns its pointerdown and clears the stale lease.
  Concurrent resize/reorder entry is rejected before mutation; unrelated interactives, expired
  or foreign-pointer leases, cancellation, no-op, and settlement cannot leave a latent activation path.
  Usage pointer-resize preview uses the shared target-first slot projection to advance the real placeholder
  footprint and visibly repack only occupied neighbors while retaining peer node identity, paint, DOM order,
  and effect-spy silence. An accepted release retains the exact last-painted topology once; rollback restores
  the snapshot. Dashboard resize retains frozen peers.
gui_related: true
gui_classification_reason: The unit governs direct manipulation, cleanup, cross-page Assistant seating, and visible state continuity.
split_recommended: false
depends_on: [UIW-010, UIW-011, CS-068, UCC-147, WM-045]
unblocks: [DR-039, ACD-448]
acceptance_criteria:
  - Pointer and keyboard preview state remains local; Usage pointer resize advances the target footprint and visibly repacks only obstructed peers, Usage reorder displaces affected peers, and Dashboard resize peers remain frozen. Every preview preserves mounted peer identity, paint, DOM order, and effect-spy silence; Usage move/resize acquisition preserves body magnetism, neutralizes translation continuously only around measured control zones, uses no synthetic pointerdown or second controller, requires rescued pointerdown top-hit ownership by the remembered card, lets an intervening overlay receive the event while clearing that stale lease, excludes unrelated interactive targets, rejects every concurrent operation before mutation, and clears the short pointer-specific acquisition lease on every direct/rescued activation and terminal path.
  - A changed pointer release dispatches exactly one canonical command after final-coordinate resolution, a changed keyboard reorder drop dispatches one move command for its selected insertion intent, and each supported keyboard-resize activation settles atomically through one resize command; no-change and cancel paths dispatch nothing. Event-primary Usage callers use usage_event/usage_event_ref, while a PMConcept7 Ledger attempt row uses cmd.nav.open_usage_subject with usage_attempt/attempt_id, retains usage_event_ref plus provider/account/runtime refs as correlation, and carries no OpenSubject. Current aggregate cards remain local with no command, receipt, event, or route identity.
  - Commit and cancel both release capture and remove ghost, placeholder, portal, preview, animation-frame, and transient-listener state.
  - Home preset sizing uses cmd.workspace_layout.resize_surface after preset resolution and does not register cmd.workspace_layout.size_surface.
  - Re-seating preserves one Assistant node/store, active thread, draft, transcript, attachment, context, detail-pane, and focus identity across primary pages and back to the saved Home dock.
  - No WorkNodes, NodeSeeds, executable queues, implementation files, final node manifests, or production build tasks are created.
validation_surfaces:
  - python3 scripts/pm-plans-verify.py validate-wiring-matrix
  - python3 scripts/pm-plan-index.py validate
risk_class: pm7_preview_cleanup_or_shared_assistant_identity_drift
reasoning_tier: high
context_scope: pm7_commands_wiring_dry_assistant
implementation_surfaces:
  - Plans/UI_Wiring_Rules.md
  - Plans/Wiring_Matrix.production.json
  - Plans/assistant-chat-design.md
node_compile_hint:
  mode: pm7_transactional_wiring_and_shared_seat
  create_worknodes: false
  create_nodeseeds: false
source_lineage:
  - Concepts/pm7-tools/base/PM7-base.html (current pinned PM7 input; source-lineage-only)
  - Concepts/pm7-tools/build_pm7.py#T33-T43 (source-owned transforms)
  - Concepts/pm7-tools/widget_live_resize_preview_source.py (authored T43 Usage-only live resize-preview transform)
  - Concepts/PMConcept7.html (generated artifact; terminal bytes and hash are audit-owned)
  - Plans/.audits/audit-20260829-001-pmconcept7-widget-followup/audit_report.json (current repo-local successor audit status; verdict remains report-owned)
preserved_exact_tokens:
  - pointercancel
  - cmd.workspace_layout.resize_surface
  - cmd.panel.switch
  - chatPanel
  - chatResizer
negative_constraints:
  - Do not dispatch or persist pointer-preview frames.
  - Do not leave pointer capture, pending animation frames, portals, ghosts, placeholders, or transient listeners after commit or cancel.
  - Do not let magnet translation move a Usage handle away during acquisition or let an occluded, stale, expired, foreign-pointer, or other-interactive lease start a widget transaction; do not allow two widget-operation controllers to coexist.
  - Do not clone the Assistant node, controller, transcript store, or context store.
  - Do not route aggregate Usage cards, attach OpenSubject to either cmd.nav.open_usage_subject selector branch, or use usage_event_ref as the PMConcept7 Ledger attempt object_id.
owner_hints:
  - Plans/UI_Wiring_Rules.md
  - Plans/Wiring_Matrix.md
  - Plans/assistant-chat-design.md
```
