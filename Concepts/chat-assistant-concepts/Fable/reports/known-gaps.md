# Fable — Known Gaps and Limitations

Honest record of what this concept system does not cover, plus items recorded
for later adjudication. Nothing here is silently missing from the demo — absence
from the demo is not proof of deferral (PROC-009); these are the deferrals.

## Template and register notes
- **Impact register template**: v2 (`pm.chat.5_6_sol.impact_register.v1`) was used.
  v1→v2 rename map for auditors: `concept_id`+`model` → `concept_or_shared_id` (+ new
  `requirement_ids`); `command_id_impacts` → `command_impacts`; `dry_component_impacts`
  → `dry_impacts`; `unresolved_questions` → `provisional_assumptions` + `true_open_decisions`.
- **Stale candidate register**: `machine/candidate_command_id_register.json` (Aug 9)
  is missing six ids present in 08 (Aug 11): `cmd.chat.artifact.switch`,
  `cmd.chat.question.navigate`, `cmd.chat.goal.clear`, `cmd.chat.draft.history.open/.restore/.clear`.
  08 was treated as current.
- **Alias collisions for adjudication**: `cmd.chat.restore_point.create` vs canonical
  `cmd.chat.create_restore_point`; `cmd.chat.context.compact_now` vs canonical
  `cmd.chat.compact_context`; ACD-410's `cmd.chat.focus_thread_usage` vs ACD-434's retirement.

## Behavioral simplifications (prototype-scoped)
- **Fake send** is scripted per the packet contract: it echoes text verbatim and plays
  prewritten sequences; it never interprets content. Steering rewrites the working
  summary but does not branch scripted outcomes.
- **Sibling re-answer** of an earlier questionnaire is implemented as branch-from-the-
  questionnaire-message (the canonical mechanism); a dedicated "re-answer" affordance
  with a prefilled sibling questionnaire is not built.
- **Add passage to context** from cross-thread results is receipt-level; it does not
  yet mark a retrieved-excerpt row inside the Lens panel.
- **Spellcheck** covers a seven-word local dictionary, underline rendering in sent
  prose, and the context-menu actions on selected composer text; OS-source switching
  is copy in the menu, not a functional toggle.
- **Provider setup deep-links** post receipts with preserved-context language; there is
  no Settings surface to land in (Settings is out of scope for this bakeoff).
- **LSP write transactions, DAP stepping, and persistent eval sessions** appear only as
  one-line operational summaries; their typed recovery classes (PRM-008) are named in
  strings but not exercised by a dedicated surface.
- **Assistant memory tiers** (Gists, half-life, ~350-token Working Set) are respected as
  boundaries (nothing claims hidden memory) but have no dedicated visualization.
- **Time-Traveling rule receipts** (CTX-020) are not demonstrated; no rule dump exists
  either.
- **Branch-with-Persona** shares the branch-with-model path; persona choice on branch
  is not a separate picker.

## Visual/test coverage gaps
- Theme × pairing coverage is sampled (all themes on one pairing, all pairings on one
  theme, alternating themes on the window sweep), not exhaustive 2048-cell coverage.
- Reduced-motion verified by the global gate + per-motion static twins + one capture;
  not captured per interaction per concept.
- Very-long-thread (thread-09) tested in Bindery/Courier; not captured in all 64.
- RTL, zoom, and non-1440 desktop viewports untested.

## Environment notes
- The Hub server instance on port 4177 was already healthy and was reused per its own
  protocol; no process was started that needed killing, and none was killed.
- Browser drivers and their outputs live in the session scratchpad, outside this folder,
  so validate.py's temp-artifact sweep stays clean by construction.
