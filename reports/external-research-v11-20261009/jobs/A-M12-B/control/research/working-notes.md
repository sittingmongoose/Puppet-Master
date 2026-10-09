# Working notes — A-M12-B / control / research (case S06, method M12)

Stage state initialized from `input-map.json`:
- stage_path: `/home/sittingmongoose/PM-Experiments/er11-20261009-116bb1e4/jobs/A-M12-B/control/research`
- brief: `/home/sittingmongoose/PM-Experiments/er11-20261009-116bb1e4/cases/S06/brief.md` (read in full; quoted below)
- predecessors: none declared; source_roots: none declared
- allowed_write_root: this research directory only
- deadline (stage): 2026-10-09T18:58:01.622902+00:00; arm deadline: 2026-10-09T19:28:01.622902+00:00
- native_route: glm; evidence_kind: full-discovery
- Method M12 v1 adaptive-evidence-state-branching: queries and leads may be adapted freely; all full obligations still apply.
- Plan comparison is initially inaccessible: `plan-root-only.md` must NOT be read; discovery.md + source-map.json must be saved BEFORE `reveal-plan.py` is invoked; discovery must not be rewritten after reveal.

## Brief (exact, verbatim from cases/S06/brief.md)

# device-alerts

Build a small water-utility sensor alert dashboard for 120 remotely connected gauges. Data arrive late, out of order and sometimes duplicate; operators need understandable alerts and acknowledgement history. This is operational triage, not automated safety control. Investigate products, transport/storage/alert mechanisms, version behavior, outage recovery and future expansion on a modest self-hosted budget.

Required deliverable obligations (equal in both arms):
O1 Independently discover useful unfamiliar tools, products and materially different approaches beyond the thin plan.
O2 Investigate consequential primary source/code behavior and governing defaults, units/types, limits and applicability for selected mechanisms.
O3 Investigate at least one relevant issue/fix/regression/release or evolution chain; say when evidence is absent/inapplicable.
O4 Compare every exact P clause after plan reveal; distinguish correction, optional enhancement, user decision, already-covered, rejected and uncertain findings.
O5 Retain useful alternatives, conditions, original constraints, disagreement and uncertainty in one self-contained coherent final; do not replace text with IDs.
O6 Propose meaningful discriminating validations and separate executed checks from proposed work. No runtime available is honest; do not pretend proposals ran. Scope is this small product brief, not unlimited production guarantees.

## Working interpretation (for discovery stage)

- Domain: water-utility gauge telemetry (120 devices) → alert dashboard with operator acknowledgement history.
- Data properties: late arrival, out-of-order, duplicates. Operational triage only, not safety control.
- Deployment constraint: modest self-hosted budget (self-hosted stack preferred over large managed/cloud offerings).
- Investigation axes from the brief: products; transport/storage/alert mechanisms; version behavior; outage recovery; future expansion.
- O1–O3 drive the discovery phase (now); O4–O6 drive the post-reveal draft phase. O4 requires the revealed plan and must wait for it.

## Session log

- 2026-10-09 ~18:29 UTC: brief read in full; workspace initialized (sources/, index.md, working-notes.md). No campaign/history/evaluator/counterpart content read; dispatch.json and freeze.json present in stage dir but not declared inputs, so not read.
