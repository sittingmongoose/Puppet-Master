# Phase 6 — component tests on frozen artifacts (2026-10-13)

Three new component classes were tested cheaply against already-graded
finals before assembling pipeline v2. Runtime:
`~/PM-Experiments/er-granularity-20261012/{lint,critics}/`.

## 6A Host lint suite (`/tmp/er_lint.py`, pure host code)

Checks: same-file ordered-window verbatim-quote verification (Q3),
evidence-promotion lexicon (PROMO), absence-overclaim patterns (ABSENCE),
release-overclaim patterns (RELEASE), gate-version presence (GATEVER, weak).

| Final | Known defects (Sol grade) | Lint result |
|---|---|---|
| F1 DeepSeek-W | invented word in quote; "No normalization change is in v1.9.0" | both caught exactly; +1 dropped-word quote, 2 presentation flags |
| F2 Luna-W | "the tagged test path passed" (ME13) | caught exactly; nothing else |
| F3 GLM-W | none in these classes | clean |
| Luna-P v3 (**PASS**) | — | clean |
| GLM-P v3 (**PASS**) | — | clean |
| DeepSeek-P v3 | merged PR called "the released fix/change" | both sentences caught |
| GLM-P / DeepSeek-P v1 | 1 invented quoted phrase each | flagged (among 5 / 2 Q3 flags; rest own-text-in-quotes) |

The same-file segment rule closes the Phase 4 checker hole (a one-word
invention before an ellipsis passes any whole-bundle substring test).
Verdict: **keeper** — high recall on lexical classes, zero false positives
on passing controls; flags still need one-line adjudication.

## 6B Flash single-defect critics (cross-family, no gold access)

| Critic | Target | Result vs Sol grade |
|---|---|---|
| Luna, Pattern A (self-referential oracle) | F3 (GLM) | Found G2/G3/G4 self-referential gates — the grader's ME04 instances; correct non-instances |
| GLM, Pattern A | F2 (Luna) | Found the grader's error-2 exactly, plus the candidate's own regeneration-attack admission and the digest-less expected inventory; correct clean list |
| Luna, Pattern B (stated limitation uncarried) | F3 | 21 limitations inventoried, 9 uncarried incl. tagmanifest-entry blindness, normalization screen, extra-file tolerance (grader families) + minor warning-screen items |
| GLM, Pattern C (evidence promotion) | F2 | Exactly the one ME13 instance; meticulous cleared list, zero false positives |
| Luna, Pattern C | F3 | 3 flags where grader counts 0 (source-reading behavior statements; reporter-as-fact summaries) — over-broad calibration |
| Luna, Pattern D (version/release scope) | F3 | CLEAN — correct; grader also found none |

**Flash models reliably find, in audit mode, the defects they commit in
generation mode — when the Goal is exactly one named pattern.** Calibration
varies by model (GLM precise on C, Luna over-broad), so critic output needs
host adjudication, not blind obedience.

## 6C Adversarial counterexample generation (brief + gates excerpt only)

DeepSeek produced 12 attacks, Luna 7, against F3's G1–G6. The union covers
most of the gold obligation-3 mutation space without seeing gold:
wrong-folder/empty deposit accepted (no expected set), substitute content +
regenerate manifests (the gold's changed-together case, with a concrete
tagmanifest-erasure mechanism), asset outside `data/`, earlier-deposit
deletion and offsite overwrite, wrong-generation restore, unusable restore
(permissions), normalization rename absorbed, unbound receipts. Missed by
both: the explicit two-raw-name collision and interrupted-retrieval
retention. Verdict: **keeper** — the strongest single component for
acceptance design; its output is a ready-made mutation table seed.

## Consequence

Pipeline v2 (Phase 7) assembles: structured integration skeleton with
mandatory oracle and mutation tables (seeded by adversary output, a
legitimate pipeline input) → host lint → cross-family single-pattern
critics + adversary → host adjudication → patch-style repairs with
host-verified diff scope → blind grade. Iterated on one arm first
(Luna records) for a tight learning loop.
