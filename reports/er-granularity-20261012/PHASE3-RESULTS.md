# Phase 3 — gate-composition repair + provenance stamps (2026-10-13)

Intervention: one small repair Goal per packet arm on its v2 final — rewrite
acceptance gates to name exact selected values (QR symbology explicitly, plain
crate-tag target, nonempty approved prefix, tag-grammar PROPOSED), demote imported
guidance (303) to recommendation/PROPOSED CHOICE, and bound source-version
sentences using a host provenance file derived from the fetch manifest. Everything
else byte-identical (host diff audit: Luna 2 lines changed, GLM 5, DeepSeek 17 —
the DeepSeek count includes provenance stamps inserted across sections plus its
C1–C8 gate rewrite). Host quote check re-run: no new inventions. Same gold,
rubric, blind Sol Max grading.

## Headline

**First strict passes of the pilot: Luna-P v3 and GLM-P v3 PASS_WITH_LIMITATIONS.**
All three v3 finals retained **8 of 8** spot-audit conditions (v2 packets:
6, 8, 7). DeepSeek-P v3 still fails, but not on its repaired gate: its grader
found three pre-existing v2 errors outside the gate scope (merged PR asserted as
"released", shipment/receipt-event identity conflation, cache-clearing help
turned into guaranteed printed-link invalidation). Its earlier v2 grader had
flagged the gate errors instead — grader attention varies between runs, which
means single-grader verdicts carry real variance, a process finding in itself.

| Arm | Verdict v2 → v3 | Gold met/20 v2 → v3 | Conditions/8 v2 → v3 |
|---|---|---|---|
| Luna packets | FAIL → **PASS_WITH_LIMITATIONS** | 13 → 13 | 8 → 8 |
| GLM packets | FAIL → **PASS_WITH_LIMITATIONS** | 12 → 13 | 7 → 8 |
| DeepSeek packets | FAIL → FAIL | 8 → 9 | 6 → 8 |

## Reading

- The gate-composition check closed the QRCODE-selection failure in all three
  arms: every v3 care gate now names `QRCODE` exactly, the `plain_asset_tag`
  target, a nonempty approved prefix, and tags grammar compatibility as
  PROPOSED where unproven. The 303-scope error also closed (recommendation /
  PROPOSED CHOICE in all three).
- Luna's pass came from a two-line repair (provenance sentence + gate sentence),
  confirming its v2 failure was the input-design artifact diagnosed in Phase 2.
- What remains is not condition loss but *other-claim accuracy* under strict
  grading: release-inclusion overclaims, identity-model completeness, and
  continuity inferences. Those are ordinary research-quality issues, addressable
  by the comparison packet or a claims-audit packet, not by carriage machinery.
- Cost of the repair stage: one extra small context per arm (plus the earlier
  one-sentence quote repair for GLM in Phase 2). Full packet chain to a passing
  final on this case: 3 extractions + 1 comparison + 1 checklist integration +
  1 gate repair = 6 candidate contexts.
- Grader variance warning: the same DeepSeek text (outside repaired lines)
  drew different material findings from different Sol Max graders across phases.
  Production qualification should use either two graders or accept that a single
  strict grader is a noisy pass/fail oracle; condition-retention counts were
  far more stable than verdicts across all phases.

## Status of the shape

On this case, *bounded packets + host provenance stamps + host condition
checklist + verbatim-quote discipline + gate-composition repair* produced
strict passes on two of three flash models (Luna via Codex, GLM-5.3-Flash via
zcode), with DeepSeek V4.1 Flash failing on unrelated claim accuracy. Generalization
to a fresh case and to discovery is tested in Phase 4 (running).
