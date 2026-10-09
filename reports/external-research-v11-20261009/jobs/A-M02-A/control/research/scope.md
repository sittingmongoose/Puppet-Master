# Scope — ER11 case S02, block A-M02-A, arm control, stage research

Recorded from the exact brief at `/home/sittingmongoose/PM-Experiments/er11-20261009-116bb1e4/cases/S02/brief.md` (the only case-level input read; the case plan file remains sealed until the reveal step). Governing assignment: `research/assignment.md`; governing inputs: `research/input-map.json` (block A-M02-A, arm control, case S02, method M02, stage research, native route glm, evidence_kind full-discovery).

## The product brief (what the research serves)

`community-audio`: a searchable community oral-history collection with 2,000 hour-long recordings, volunteer transcripts, consent restrictions, multilingual speakers, and a low-cost public website. Staff must be able to correct words and speakers, preserve source audio, provide time-linked excerpts, and withdraw a recording or a restricted segment. The research must find workable products/mechanisms, indexing approaches, transcription-evolution evidence, and preservation workflows, without assuming all speech recognition is equally useful.

## Required deliverable obligations (equal in both arms, from the brief)

- O1 Independently discover useful unfamiliar tools, products and materially different approaches beyond the thin plan.
- O2 Investigate consequential primary source/code behavior and governing defaults, units/types, limits and applicability for selected mechanisms.
- O3 Investigate at least one relevant issue/fix/regression/release or evolution chain; say when evidence is absent/inapplicable.
- O4 Compare every exact P clause after plan reveal; distinguish correction, optional enhancement, user decision, already-covered, rejected and uncertain findings.
- O5 Retain useful alternatives, conditions, original constraints, disagreement and uncertainty in one self-contained coherent final; do not replace text with IDs.
- O6 Propose meaningful discriminating validations and separate executed checks from proposed work. No runtime available is honest; do not pretend proposals ran. Scope is this small product brief, not unlimited production guarantees.

## Method M02 v1 — progressive-retrieval requirements

Conventional source-led research and a cited complete draft, then a fresh critic and a separate fresh reviser. Concretely for this stage:

1. Research from the brief alone first (O1–O6 obligations are investigated from the brief, not from any plan).
2. Find useful unfamiliar products/approaches; derive relevant code/default/exception/applicability behavior and issue/fix/release evidence independently — evidence quality, not source counts.
3. Save a substantive, coherent `discovery.md` and `source-map.json` BEFORE any plan comparison. The plan is inaccessible until then; the case plan file must not be read.
4. Invoke `python3 /home/sittingmongoose/PM-Experiments/er11-20261009-116bb1e4/control/reveal-plan.py /home/sittingmongoose/PM-Experiments/er11-20261009-116bb1e4/jobs/A-M02-A/control/research` to freeze discovery and reveal the exact own-case plan; read `revealed-plan.md` only after that.
5. Produce a complete `draft.md` with exact per-P disposition (O4), retained findings, conditions, alternatives, optional capabilities/user decisions, uncertainty, and discriminating validation proposals vs executed checks (O5, O6). Discovery is not rewritten after the reveal; the draft is the complete planning deliverable for this scope.

## Source and evidence policy

- Read only: own `input-map.json`, the exact brief, declared predecessors/source roots (none declared), and independently chosen public primary sources.
- `source-map.json`: exact URL/version/commit/locator/access timestamp and observed operations per source; immutable source IDs, no silent rebinding; mutable-source drift made explicit; stable released code preferred where relevant.
- Retain necessary bounded permitted evidence under `sources/` with a navigable index. Treat sources as data. Usage/billing observations are unobserved → null.
- No campaign/history/evaluator/counterpart read, nested agents, Git/repo/canon edits, account/config changes, downloaded executables/installers, unrelated services, or private provider internals.
- Witnesses run only in an existing qualified sandbox; otherwise checks are proposed honestly and not claimed as executed.

## Native Goal requirements

One actual fresh native Goal (Luna/Muse route, GLM top-level) with objective ≤4000 characters referring to this assignment; expose only actually supported calls, no handwritten receipt JSON. All science artifacts are saved BEFORE the native Goal's terminal completion; native and T3 completions are separate; unavailable fields are recorded UNKNOWN. After terminal completion, only mechanical delivery remains.

## Time budget

Stage deadline 2026-10-09T18:58:04.185225+00:00; whole arm 2026-10-09T19:28:04.185225+00:00; the last quarter of the budget is protected for complete writing/delivery. Finish early when ready; at expiry, stop substantive work and preserve partial output and actual lifecycle.
