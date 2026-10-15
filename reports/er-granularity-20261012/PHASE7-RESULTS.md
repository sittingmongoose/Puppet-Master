# Phase 7 — pipeline v2 assembled; first fresh-case pass (2026-10-13)

Pipeline v2 = Phase 4 winning shape plus the three Phase 6 components:
(1) a host-written mandatory skeleton (gate table with an oracle column and
a blind-spot/screen column, a mutation table seeded from Phase 6 adversary
output, evidence-mode wording rules, structured owner/inventory sections),
(2) the host lint suite, (3) cross-family single-pattern flash critics plus
an adversary against the new gates, host adjudication, and bounded repairs
with a host diff audit. Run first on one arm (Luna records from Phase 4,
reused frozen) for a tight loop. Runtime:
`~/PM-Experiments/er-granularity-20261012/{arms2/luna-W2,critics,lint,grades}`.

## Result

**Blind grade F4 (Sol Max, same GOLD2 rubric): PASS_WITH_LIMITATIONS —
diagnostic 35/40 (15 met / 5 partial / 0 missing), conditions 8/8 retained,
zero material errors.** Phase 4's same-records Luna final scored FAIL 25/40
with 4/8 conditions. A second independent blind grade of the identical file
is running as a grader-variance check (G-F4b).

## Loop log (contexts beyond the reused Phase 4 records)

| Step | Contexts | Outcome |
|---|---|---|
| Skeleton integration draft (Luna) | 1 | 2,829 prose words; all 37 KEY conditions with appendix parity; independent registrar-register oracle designed in |
| Host lint | 0 (code) | clean except 2 GATEVER noise flags, waived |
| Critics: A + C (GLM), B (DeepSeek), adversary (DeepSeek) | 4 | A: 0 instances, gate-by-gate certification. C: 0 instances. B: exactly 1 uncarried limitation — builder emits BagIt 0.97 while gates mandated a 1.0 declaration, leaving no acceptance path. Adversary: 9 attacks (cross-deposit collision scope, retention asserted register-to-register without re-reading bytes, cherry-picked restore sample, correction-graph cycles, single-actor register, undefined "offsite", spreadsheet-hostile CSV, originals moved, fabricated status in a tag file) |
| Host adjudication | 0 | 10 bounded repairs compiled; adversary items mostly accepted as hardening, two narrowed to brief premises |
| Repair (Luna, listed patches only) | 1 | 37 lines changed across 11 hunks, all inside repair scope (host diff audit); re-lint clean apart from two own-term quotations, waived |
| Blind grade | 1 Sol (experiment overhead) | PASS_WITH_LIMITATIONS as above |

Total candidate contexts for the v2 loop on this arm: 6 (1 integration +
4 critics/adversary + 1 repair), on top of the 5-context Phase 4 record
chain it reused.

## What each new component contributed

- **Skeleton** did the heavy lifting: the oracle column forced the
  independent registrar register at draft time (Pattern-A critic then found
  nothing), and the mutation table forced per-mutation gate reasoning
  instead of a generic "validate the copy" paragraph.
- **Pattern-B critic** caught the one internal contradiction the skeleton
  created (mandated declaration the only named builder cannot emit) — a
  defect class no earlier phase's machinery targeted.
- **Adversary** kept finding real holes in the *improved* gates
  (cross-deposit scope, register-to-register retention), which became cheap
  one-sentence repairs. Adversarial generation appears strictly stronger
  than review-style criticism for acceptance design.
- **Lint** cost nothing and stayed silent on a clean draft, after proving
  recall on Phase 1–4 defects in Phase 6.

## Residuals in the passing final (grader-noted, non-material)

Duplicated-byte/storage and package-depth tradeoffs thin; OCFL continuous
numbering/padding not explicit; receipt approver-identity field unspecified;
R-number citations have no in-document source key. The proposed local
checker remains unbuilt and unqualified (its qualification gate G0 is itself
PROPOSED/NOT_RUN) — accepted by the grader as an explicitly proposed local
choice under GOLD bundle gaps, but a production run must actually build and
qualify it or substitute existing tools.

## Next

Replication of the identical pipeline on the GLM and DeepSeek Phase 4
record sets (running), to separate "the process works" from "Luna works";
then a fresh-case end-to-end run including discovery and host pinning.
