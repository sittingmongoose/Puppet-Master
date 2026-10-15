# Phase 12 pre-registration (written before any candidate work, 2026-10-13)

Purpose: test the replacement claim under the corrections from Phases 10–11:
held-out brief, no gold anywhere upstream of grading, gold-free compiled
skeleton, flash-only repair loop with fixed budget, premium as comparison
arm + post-freeze gold author, cross-family blind grading, everything
archived. Cost metric per Jared: same-model wall time and output volume.

## Frozen inputs

- `p12/caseA/brief.md` + `plan.md` (8 clauses), hashes recorded in
  `p12/FREEZE.txt` at launch. Sandbox-authored topic (crash-safe local
  storage/audit history), never used in Phases 0–11. No Plans edits.

## Arms

**Flash arm** (composite, model routing fixed here): discovery = Luna
names-only + Luna library-angle + DeepSeek donor-angle + DeepSeek dry
round 2 (seen = union); host dedup; shortlist rule (below); host
fetch/pin; mechanical slice matrix from source headings; chunk-based
slices (quote-by-construction), ≤12 slices + 2 overlap cells + 1 residue
slice; comparison slice vs plan clauses; conditions checklist generated
host-side from slice CONDITIONS lines; skeleton compiled by Luna from
brief+plan+records only, then one DeepSeek adversary pass on the
skeleton's seed list; integration by Luna; critic panel = GLM
acceptance-path hunter (single file), DeepSeek entailment audit, GLM
dual-direction adversary on gates; host adjudication; **≤3 bounded
repair rounds**, host diff audit each; freeze by hash.

**Premium arm (the bar):** Sol 6.1 Max (codex_gmail). Discovery scored
separately (one generic two-axis Goal, same prompt shape as Phase 9A).
For the proposal itself Sol receives the SAME host-pinned source bundle
as the flash arm and works in 2 contexts (extraction records, then
final), no skeleton/critics — the "old premium process" shape. Freeze
by hash before gold exists.

**Shortlist rule (host, mechanical):** from the union of flash discovery
lists + dependency-graph candidates for the top embedded engine: pick
6 sources — the 4 most-nominated across lists (ties → DeepSeek dossier
order) + the 2 most-nominated feature donors. Pin latest release via
the Phase 9B cache machinery (reuse cache hits; count them).

## Gold and grading (only after both finals are frozen)

- Gold authored by Sol 6.1 Max from brief+plan+pinned bundle ONLY
  (candidates not shown), same rubric shape as case2 GOLD (propositions,
  material-error list, /40 diagnostic, 8-condition spot audit, bundle
  gaps).
- Grading: Opus 5.5 xhigh (claude_me, different family from gold author
  and from both candidate pipelines' integrators), two independent blind
  grades per final (anonymized, key sealed host-side). Split = FAIL.
- Discovery scored separately against an adjudicated union of all
  nomination lists (flash lists + Sol list + depgraph candidates),
  not against any single premium list.

## Success criteria (fixed in advance)

- Primary: flash final has **zero confirmed material errors** under
  double grade (host-adjudicated) AND diagnostic ≥ (Sol arm diagnostic
  − 5). Secondary: discovery union recall vs adjudicated universe;
  contexts and wall time per arm; cache/source reuse count.
- Any deviation from this document will be logged in the Phase 12
  report as a deviation, not silently absorbed.
