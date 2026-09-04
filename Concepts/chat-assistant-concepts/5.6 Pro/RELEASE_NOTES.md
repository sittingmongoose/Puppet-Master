# 5.6 Pro Final Release Notes

This release supersedes every earlier 5.6 Pro HTML and package from this conversation.

## Principal final-pass repairs

- Rebuilt menu and sidecar ownership around a fixed portal so parent overflow cannot clip them.
- Added viewport-aware flip, clamp, anchor, and post-animation stabilization.
- Added PMConcept7-style spring motion with a Web Animations fallback.
- Ensured main menus remain mounted while effort, thoroughness, and wand sidecars are open.
- Removed hover as a precondition for thread-history or row-copy visibility.
- Stabilized status-to-More row motion.
- Added constrained-height internal menu scrolling and text-fit protection.
- Protected questionnaire, decision, Context Details, and Activity Detail surfaces at narrow heights.
- Preserved full-width assistant prose and long-message expansion/collapse.
- Completed Worktree, full Goal lifecycle, staged Subcompact, and Thought Stream controls.
- Completed archived-thread search/restore and deterministic demo triggers.
- Completed Mermaid, interactive visualizer, generated-image, Plan/Deep Plan, child-agent, change, and artifact editor flows.
- Added a comprehensive packet/Plans disposition ledger and production gap register.
- Added frame-by-frame source and implementation motion evidence.
- Added standalone direct-file and archive-integrity validation.

## Additive Correction v4 — 2026-09-03

Applied `PM_Assistant_v2_Additive_Correction_v4` to the implemented v2 branch.
Additive only; non-conflicting v2 work, the 5.6 Pro defaults and `Chat updates.md`
were preserved, and obsolete clauses were replaced in place rather than annotated.

- Question ceilings 3/6/8 and 10/15/20 with Grill Me +25 (totals 28/31/33/35/40/45).
  The BrainStorm base of 15 and the +10 extension are retired everywhere,
  including in the tests and the concept's Settings-sourced defaults.
- `PlanProgressProjection` derived from the To-Do owner, with nested, concurrent,
  out-of-order, blocked, skipped, mixed, stale and restart-rebuilt states.
- Plan failure and recovery as secondary truth under an unchanged four-label
  Build control.
- Regular vs Deep Plan Details, versioned Plan embeds with PDF fallbacks and four
  unavailable reasons, and a separate execution-report export.
- Build as Goal: one Goal, one PlanRun, one binding, atomic and idempotent.
- Scheduled build topology, and scheduled-message cards across all six states with
  exact attachment snapshots.
- Transactional workflow modals with an instrumented zero-effect ledger.
- Participant dispositions, waivers, retries, partial/single-pass Review truth and
  Wonderer abstention outside the quorum denominator.
- Browser component revalidation with typed `stale_capture`.
- Folder attachments through the shared command; the file reference is now an alias.
- To-Do graph validation and atomic list replacement.
- `tests/todo-verify.mjs` renamed to `tests/todo-runtime-verify.mjs`.
- New suite `tests/correction-v4-verify.mjs` (112 assertions).
- Both HTML outputs regenerated from `build.py` twice and byte-checked.

## Independent replacement audit — 2026-09-04

The correction above was audited independently rather than accepted. A new
harness, `tests/independent-audit-v5.mjs`, decides one verdict for each of the
481 requirements — 236 from the implemented v2 packet and 245 from the
correction — by driving the built page in a real browser and reading state or
rendered DOM. It reads no prior report, manifest, screenshot or fixture toast.

Result: 481 requirements decided. 444 pass, 2 superseded by the correction with
the replacement value proven, 35 blocked on native infrastructure with the exact
blocker named, and **0 failed or not implemented**. 494 probes, 0 console errors.

The audit found and repaired 32 defects the applying wave had not, including a
public `questionBudget()` that resolved `Deep · Thorough` to base 6 instead of
10, a Build control that could never be disabled by a build blocker while the
card's own copy said it could, a Plan that completed without completing its
bound Goal, a To-Do controller that accepted the retired `verifying` status
through whole-list replacement, and a screenshot that silently discarded a
pending attachment. `REPAIR_STATUS.md` lists all thirty-two with their symptoms.

All 541 assertions in the eleven pre-existing suites still pass.

This is not a certification. `reports/AUDIT_MATRIX.md` keeps canonical, concept
and native readiness in three separate columns, and the native column is closed
for nothing.
