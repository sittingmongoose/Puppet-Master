# Phase 1 freeze — case A5-02 (2026-10-12)

Case: ER12 A5-02 "Returnable crate receiving labels"
(brief SHA-256 a6520dff…, plan SHA-256 b4cf16e0…; byte-identical copies in the
sandbox `case/`). Prior ER12 Luna treatment FAILed on trap F1 (Snipe-IT default QR
destination treated as the complete built-in capability).

## Scope decision (declared before any arm runs)

Discovery is held constant. Both shapes receive the SAME host-fetched primary-source
bundle (`case/sources/` S1–S13, 165,545 bytes: Snipe-IT v8.8.0 released label code,
UI and language help; Snipe-IT docs; Odoo 18.0 barcode docs ×3; GS1 Digital Link
guides ×2; Snipe-IT issue #19515 + PR #19633 via GitHub API). Workers may not browse.
This phase therefore tests extraction, condition retention, comparison, and
integration granularity — not source discovery. A discovery phase is out of scope
unless this phase shows a readable signal.

## Common output obligation (both shapes, all models)

One `final.md`: a complete proposal covering brief obligations 1–8, with an explicit
disposition of every plan clause 1–8, evidence cited by bundle source ID with quotes,
owner decisions and negative constraints preserved, the optional public crate-care QR
retained or evidence-excluded, and a validation table separating executed checks
(document/code reading only) from proposed/NOT_RUN checks.

## Shape M — monolith control (1 Goal per model)

One delegated task: brief + plan + all 13 sources → `final.md`. Target ≤40 minutes.

## Shape P — bounded packets (5 Goals per model, fresh context each)

1. E1 Snipe extraction (S1–S5) → `records-snipe.md` (CLAIM/QUOTE/CONDITION/LINE blocks).
2. E2 Odoo+GS1 extraction (S6–S10) → `records-odoo-gs1.md`.
3. E3 History extraction (S11–S13, S4) → `records-history.md` (what changed, which
   output it affected, version bounds).
4. C1 Comparison (brief + plan + E1–E3; may re-check sources) → `comparisons.md`
   (per-clause disposition 1–8 with evidence).
5. I1 Integration (brief + plan + E1–E3 + C1) → `final.md`, using only claims
   carried in the records/comparisons.

E1–E3 may run in parallel (within per-model concurrency caps: GLM 2, DeepSeek 2);
C1 after E1–E3; I1 after C1. Every packet prompt is one small self-contained Goal.

## Grading

Blind Sol Max graders (labels hidden in file copies), brief + plan + bundle + GOLD.md.
Per arm: material errors (F1-pattern and GOLD list), unsupported consequential
claims, gold-proposition coverage, clause-disposition correctness, validation
honesty, delivery, wall time, contexts. Grade: PASS_WITH_LIMITATIONS or FAIL.
Grader work is experiment overhead, reported separately from candidate work.
