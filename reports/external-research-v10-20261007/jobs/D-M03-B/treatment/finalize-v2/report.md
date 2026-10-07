# D-M03-B finalize-v2 — stage report (treatment)

Stage: D-M03-B / treatment / finalize-v2. Role: finalize.
Procedure: deliver the same complete scope with unresolved conditions explicit.
Dispatch preparation: 2026-10-07T19:52:41.587388+00:00; stage allowance 3 min;
hard stage deadline 2026-10-07T19:55:41.587388+00:00. See timings.json for actuals.

## Inputs read directly

- brief.md (6 obligations; frozen-corpus mode; no execution).
- sources.json (manifest; 2 frozen sources).
- projdoc.rst: pyproj 3.6.1, 2026-10-07, sha256
  `261a0a3602984e91ed13179990c535bf19a4e841302554ee4fad25b77e4ade51` — full
  47 lines; axis-order warning L14-20 verified.
- projcode.py: pyproj 3.6.1 (PROJ 9.3.0 assumed, not executed), 2026-10-07,
  sha256 `f5f8a43cb7030e5d0462121a54414be74504586dbb1d32d4c37857f1de9dabda` —
  focused sections verified: from_crs L553-637, transform L716-860,
  TransformerGroup ordering L140-209, itransform L862-899 switch/radians/errcheck.
- Predecessors (locators only, citations re-verified): navigate-v2, focused_read-v2,
  expand-v2 reports (sha d7d434be…, 5493bc03…, 154d2c41…).

No additional sources acquired. No case cards, READY, supervisor state, sibling
answers, other cases, reviews, or evaluator keys consulted. No code executed,
nothing installed.

## Outputs

- final.md (this directory): complete bounded recommendation, 8 material
  findings, dispositions, proposed checks, uncertainty. Soft ceiling respected
  (~950 words, 8 findings); no governing condition omitted.
- Final exported byte-identical to arm path
  `cases/D-M03-B/outputs/treatment/final.md` (verified by sha256 after copy).
- report.md (this file): stage report. timings.json: actual timestamps/operations.

## Executed vs proposed

Executed checks: NONE (empty set; no execution permitted at this stage).
All six checks in final.md §"Discriminating proposed checks" are PROPOSALS with
predictions, distinct from executed witnesses.

## Dispositions (mirror of final)

- Accepted: from_crs("EPSG:4326","EPSG:3857",always_xy=True) +
  transform(lon,lat,radians=False,FORWARD); errcheck per policy.
- Amended: none. Rejected: from_proj/module path; radians=True for degrees;
  switch-as-always_xy. Unresolved: native 4326 axis order; 3857 output units;
  operation choice/accuracy — carried as explicit conditions.

## Obligation coverage

1. from_crs→creation→transform trace: finding 1. 2. Input order vs native
metadata: finding 2. 3. always_xy meaning/limits: finding 3. 4. Radians/output
units: findings 4-5. 5. Area/error limits: finding 6. 6. Boundary checks +
uncertainty: findings 7-8 + checks + uncertainty statement. Single-example
limits: finding 7.

## Handoff

Complete scope delivered; unresolved conditions explicit in final.md. No partials.
Goal terminal requires this output complete; completion recorded via native Goal
update after save, with terminal state read back.
