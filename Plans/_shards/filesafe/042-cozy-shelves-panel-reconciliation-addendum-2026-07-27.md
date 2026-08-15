# Shard 042: Cozy Shelves Panel Reconciliation Addendum - 2026-07-27

Source: `Plans/FileSafe.md`

Source lines: L14493-L14656

Source SHA256: `6f8c0184cdefccfaa9c955baf7cb1f1bf7b433ccf7cfdcb7f1608d506597d94a`

---

## Cozy Shelves Panel Reconciliation Addendum - 2026-07-27

This addendum closes FileSafe-owned gaps exposed by the Cozy Shelves left-rail concept review: it records one proposed delete-behavior decision awaiting user ratification, binds the File Manager rail panel as a blocked-episode display consumer, and dispositions two stale env-var override bullets against the P0 fail-closed security resolution. `Concepts/rail-concepts/QwenRailConcepts/c2-cozy-shelves.html` and `Concepts/rail-concepts/QwenRailConcepts/c2-cozy-shelves-files.html` remain illustrative source-lineage only: no HTML, CSS, color values, demo data, or class names from those files may enter spec or implementation. No existing PlanUnit, preserved_exact_tokens list, canonical_text, or retired bridge is edited; supersession is expressed only through the new units below. This addendum creates no WorkNodes, NodeSeeds, executable queues, implementation files, runtime artifacts, generated wiring rows, production build tasks, final manifests, or PNC-019 receipts.

### F2-205 - Trash-First File Manager Delete Decision

```yaml
plan_unit_id: F2-205
unit_type: decision
status: accepted
ratification_note: "Ratified by Jared 2026-07-27 (dec-2026-07-27-cozy-shelves-decision-ratifications). Trash-first delete is canon; command/wiring registration for trash restore/empty follows in a later catalog wave."
owner_doc: Plans/FileSafe.md
canonical_text: >-
  Ratified decision (2026-07-27): File Manager Delete defaults to an
  OS-trash-backed soft delete with an undo toast; Shift+Delete performs permanent deletion and
  stays behind the existing fail-closed destructive confirm; when trash placement is impossible
  (cross-filesystem move, remote/SSH root, unsupported volume) the UI says so explicitly and
  offers permanent deletion only, never a silent fallback to permanent deletion under the
  soft-delete label. This decision layers presentation policy over, and must satisfy, the
  journaled-tombstone restore contract: deletion inside a FileSafe transaction continues to use
  the transaction-owned same-directory tombstone/rollback path of sections 11.1.2a and 11.1.2b
  rather than an unjournaled unlink, and any reversibility claim (undo toast, restore affordance)
  is valid only where the restore path satisfies that contract. OS-trash custody and FileSafe
  tombstone custody are distinct: the undo toast must not present OS-trash recovery as
  FileSafe-journaled restore. Override authority is unchanged by this decision; the P0
  fail-closed security resolution (2026-07-07) remains binding.
gui_related: true
gui_classification_reason: Delete defaults, undo toast, and trash-impossible disclosure are user-visible File Manager behavior.
depends_on: [F2-188]
unblocks: []
acceptance_criteria:
  - Default Delete moves targets to OS trash and shows an undo toast; Shift+Delete is permanent behind the fail-closed confirm.
  - When trash is impossible the UI discloses why and offers permanent deletion only; no silent permanent fallback.
  - Journaled FileSafe deletions keep the same-directory tombstone/rollback path; no unjournaled unlink.
  - Reversibility claims are made only where the restore path satisfies the 11.1.2a/11.1.2b contract; OS-trash recovery is never presented as journaled restore.
  - No enforcement, allowlist, or override authority is weakened by this decision.
  - No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created by this PlanUnit.
validation_surfaces:
  - python3 scripts/pm-plan-index.py validate
  - RSP-ATOMIC-001
  - Future trash-first delete, undo-toast, and trash-impossible disclosure tests.
risk_class: filesafe_delete_reversibility_overclaim
reasoning_tier: high
context_scope: filesafe_trash_first_delete_decision
implementation_surfaces: [Plans/FileSafe.md, Plans/FileManager.md, future File Manager panel]
node_compile_hint: {mode: filesafe_trash_first_delete, create_worknodes: false, create_nodeseeds: false}
source_lineage:
  - Cozy Shelves panel review 2026-07-27 (decision proposed, not yet user-ratified)
  - Concepts/rail-concepts/QwenRailConcepts/c2-cozy-shelves-files.html (source-lineage-only)
  - Plans/FileSafe.md:1524
preserved_exact_tokens:
  - "tombstone"
  - "concurrent_edit_conflict"
negative_constraints:
  - Do not treat this unit as accepted canon before explicit user ratification.
  - Do not claim reversibility that the journaled-tombstone restore contract cannot honor.
  - Do not let trash-first defaults weaken the fail-closed destructive confirm or override authority.
compatibility_only_notes:
  - "Slint compatibility: undo toast and disclosure copy render as opaque precomputed surfaces; no arbitrary-content backdrop blur, no SVG filters, precomputed color math; any glass treatment uses a single blur over a known wallpaper as a pre-blurred asset."
owner_boundary_notes:
  - "Plans/FileManager.md owns the Delete affordance surface; this unit owns the safety, custody, and reversibility-claim semantics."
owner_hints: [Plans/FileSafe.md, Plans/FileManager.md]
```

### F2-206 - File Manager Rail Blocked-Episode Consumption

```yaml
plan_unit_id: F2-206
unit_type: requirement
status: accepted
owner_doc: Plans/FileSafe.md
canonical_text: >-
  The File Manager rail panel MAY render filesafe.blocked and filesafe.path_denied episodes that
  affect its visible scope as blocked-with-reason rows carrying blocked_reason_code plus ordered
  allowed_action_ids[] exactly as issued by canonical FileSafe recovery payloads. This extends
  the blocked-state attention-routing surface list (Dashboard, Orchestrator, chat-thread) with
  the File Manager panel as a display and consumption surface only: the Settings > Advanced
  FileSafe card remains the sole control surface per F2-121 and F2-132; the panel derives
  episodes from the canonical seglog stream or derived projections per F2-055 and F2-140, never
  a filesafe-only mirror; the panel must not invent, reorder, or filter allowed actions, must
  not offer enforcement-reducing controls, and must not leak blocked names or counts beyond what
  the episode payload discloses.
gui_related: true
gui_classification_reason: Blocked-with-reason rows in the File Manager panel are user-visible behavior.
depends_on: [F2-055, F2-121]
unblocks: []
acceptance_criteria:
  - filesafe.blocked and filesafe.path_denied episodes render with blocked_reason_code and the payload's ordered allowed_action_ids[].
  - The panel is display-only; enforcement-state controls remain in the Settings FileSafe card.
  - Episode data comes from the canonical stream or derived projections, never a filesafe-only mirror.
  - The panel discloses nothing beyond the episode payload; no leaked blocked names or counts.
  - No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created by this PlanUnit.
validation_surfaces:
  - python3 scripts/pm-plan-index.py validate
  - Future File Manager blocked-episode rendering and no-leak tests.
risk_class: filesafe_blocked_surface_drift
reasoning_tier: standard
context_scope: filesafe_rail_blocked_episode_consumption
implementation_surfaces: [Plans/FileSafe.md, Plans/FileManager.md, Plans/FinalGUISpec.md]
node_compile_hint: {mode: filesafe_rail_blocked_consumption, create_worknodes: false, create_nodeseeds: false}
source_lineage:
  - user decision 2026-07-27 (Cozy Shelves panel review; implementation base = c2 concept files patched in place)
  - Concepts/rail-concepts/QwenRailConcepts/c2-cozy-shelves-files.html (source-lineage-only)
preserved_exact_tokens:
  - "filesafe.blocked"
  - "filesafe.path_denied"
  - "blocked_reason_code"
  - "allowed_action_ids[]"
negative_constraints:
  - Do not make the rail panel an enforcement or configuration surface for FileSafe.
  - Do not invent, reorder, or filter allowed actions outside the canonical payload ordering.
compatibility_only_notes:
  - "Slint compatibility: blocked rows render as opaque precomputed surfaces; no arbitrary-content backdrop blur, no SVG filters, precomputed color math; any glass treatment uses a single blur over a known wallpaper as a pre-blurred asset."
owner_boundary_notes:
  - "Plans/FinalGUISpec.md owns rail placement and the shared expander/blocked presentation chrome; this unit owns which FileSafe episodes the panel may consume and under what fidelity constraints."
owner_hints: [Plans/FileSafe.md, Plans/FileManager.md, Plans/FinalGUISpec.md]
```

### F2-207 - Env-Var Override Mitigation Bullets Stale Disposition

```yaml
plan_unit_id: F2-207
unit_type: compatibility_disposition
status: accepted
owner_doc: Plans/FileSafe.md
canonical_text: >-
  The mitigation bullets reading "Allow override via environment variable" in section 12.2 False
  Positives (Plans/FileSafe.md:1995) and section 15.10 Potential Issues, Issue 1
  (Plans/FileSafe.md:2610) are stale source-lineage superseded by the P0 fail-closed security
  resolution (2026-07-07): PUPPET_MASTER_ALLOW_DESTRUCTIVE=1 is a request signal only and is
  never sufficient authority by itself; a destructive override requires an authenticated operator
  grant with auth realm, operator identity, reason, scope, duration/expiry, project/run/worktree
  binding, and an emitted security event and receipt. Per the P0 section's fencing requirement,
  those two bullets must be read as retired/noncanonical and are not implementation guidance.
  This successor unit records the disposition without editing preserved prose.
gui_related: false
gui_classification_reason: This unit dispositions stale mitigation prose; it defines no visible behavior.
depends_on: []
unblocks: []
acceptance_criteria:
  - The two env-var override bullets are read as retired/noncanonical lineage; the P0 fail-closed resolution remains the live canon.
  - No implementation treats an environment variable as sufficient override authority.
  - No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created by this PlanUnit.
validation_surfaces:
  - python3 scripts/pm-plan-index.py validate
  - python3 scripts/pm-plans-verify.py validate-filesafe-security-policy
risk_class: filesafe_fail_open_regression
reasoning_tier: standard
context_scope: filesafe_stale_override_disposition
implementation_surfaces: [Plans/FileSafe.md]
node_compile_hint: {mode: filesafe_stale_override_disposition, create_worknodes: false, create_nodeseeds: false}
source_lineage:
  - Plans/FileSafe.md:1995
  - Plans/FileSafe.md:2610
  - Plans/FileSafe.md P0 fail-closed security resolution (2026-07-07), lines 102-116
preserved_exact_tokens:
  - "PUPPET_MASTER_ALLOW_DESTRUCTIVE"
negative_constraints:
  - Do not edit the preserved section 12.2 or 15.10 prose; supersession lives in this unit.
  - Do not cite the retired bullets as behavior authority in new spec or implementation text.
compatibility_only_notes: []
owner_boundary_notes: []
owner_hints: [Plans/FileSafe.md]
```
