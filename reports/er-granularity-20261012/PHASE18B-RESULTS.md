# Phase 18B one-variable tests — Results (2026-10-16)

Frozen Case E materials only. No finals changed; Phase 18 grades stand
regardless (flash FAIL 28/27, 2 confirmed material errors; prereg criterion
not met). Preregistration: `p18b/PREREG.md` in the experiment root.

## Test A — guarantee-audit critic: PASS (union), asymmetric replication

Two independent maximum-effort critics hunted only unqualified mechanism
guarantees in the frozen flash report plus its cited-chunk appendix. Pass
required at least one auditor to flag both graded material-error sentences,
host-scored by anchor-string presence.

| Auditor | M03: "Electron publication fails without an Ed25519 signing key" | M20: "differential path falls back when old and new block-map versions differ" | Findings |
| --- | --- | --- | --- |
| DeepSeek V4.1 Flash (thinking=max) | Caught (dropped v27 scope) | Caught (fallback not stated in cites) | 6 of 118 candidates |
| GLM 5.3 Flash (thought=max) | Missed (classified OK) | Caught | 4 of ~150 sentences |

| Measure | Result |
| --- | --- |
| Union catch | 2/2 graded errors |
| Intersection | 1/2 (M20 only) |
| Extra findings | DS 4 further, GLM 3 further; one shared non-graded catch (`makecache --timer` scope drop) |

Interpretation: a dedicated guarantee-shaped hunt does find the exact class
of defect that survived Phase 18's general critics, but a single auditor is
not reliable for it — the gate needs the union of at least two independent
audits, or equivalent replication, before it can be trusted to clear a report.

## Test B — gated design synthesis: PASS

A Luna maximum-effort addendum proposed rules for nine brief-required design
gaps, fenced as proposals with recorded bases and explicit blind spots. One
blind Astra maximum-effort rescore graded only those nine propositions on
report-plus-addendum against the Sol gold checklist. Pass required a gain of
at least +4 over the frozen flash scores (9/18 under both original graders)
and zero new material errors.

| Proposition | P02 | P06 | P07 | P08 | P12 | P13 | P15 | P18 | P20 | Total |
| --- | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: |
| Frozen flash (both graders) | 1 | 1 | 1 | 1 | 1 | 1 | 1 | 1 | 1 | 9/18 |
| With addendum (rescore) | 2 | 1 | 1 | 1 | 1 | 1 | 2 | 2 | 2 | 14/18 |

| Measure | Result |
| --- | --- |
| Gain | +5 (required ≥ +4) |
| New material errors | 0 |
| Propositions lifted 1 → 2 | P02 P07 P15 P18 P20 |
| Held at 1 | P06 P08 P12 P13 |

Interpretation: separately gated, explicitly labeled design synthesis closes
about half the measured diagnostic gap attributable to these propositions
without introducing material errors. The four that held failed on genuinely
unresolved policy content — post-halt recovery for already-installed clients,
long-session in-app check scheduling, and recovery reconciliation with
security floors and data/schema compatibility — not on evidence errors. The
rescore is a single grader on nine propositions, so +5 is a directional
measurement, not a full re-grade.

## What this does and does not establish

Both targeted mechanisms work on the case that produced the failures, which
is the weakest form of confirmation: the guarantee audit was aimed at known
sentences (though the auditors were not told which), and the design test
reused the same gold checklist. Neither test says the combined process would
pass the Phase 18 criterion — zero material errors and within five
diagnostic points of Sol — on a fresh case, and neither addresses Phase 18's
cost problem (~90 contexts, ~5.5 hours active orchestration versus a
60–75 minute target).

## Recommendation

One confirmation phase on one fresh held-out case, preregistered, testing the
combined recipe: extraction-first inventory, per-candidate forced expansion,
a two-auditor guarantee gate whose findings must clear before freezing, and
the fenced design addendum as part of the submission. Success criterion
unchanged from Phase 18. If it fails on material errors again, the fallback
conclusion stands: keep flash models for extraction and auditing volume, and
put a frontier model at integration.
