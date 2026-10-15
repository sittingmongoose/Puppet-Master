# Phase 14 — scale arithmetic and the order-of-magnitude optimizations (2026-10-14)

## The corpus (measured in this worktree)

- 96 top-level owner docs in `Plans/*.md`, 31.7 MB, ~3.4M words
  (≈4.5M tokens of plan prose alone); `Plans/` total 1.7 GB with
  ledgers/shards/evidence.
- **7,095 PlanUnits** (3,533 GUI-related) across the 96 docs;
  **28,335 acceptance units** (`Plans/.plan_index/`).
- Work-node generation (not yet tackled) starts from those 7,095 units.

## What one topic costs today (Phase 13 flash arm, measured)

23 flash contexts (4 discovery, 11 slices, comparisons, skeleton,
skeleton-adversary, integration, 3 critics, 1 repair); ≈2.5 MB of model
input (≈650k tokens — dominated by slices re-reading whole sources:
the 164 KB FTS5 doc was read by ~9 slice contexts); ≈4–5 h critical
path at the concurrency caps used. Premium gold/grades are experiment
overhead and excluded.

Naive extrapolation to 96 topics: ≈2,200 flash contexts, ≈60M+ input
tokens, **roughly two to three weeks of continuous running for external
research alone** — before the rest of the planning wizard and before
thousands of work nodes. Jared's framing is correct: this needs
order-of-magnitude cuts, not tuning.

## The optimizations that actually move the exponent (ranked)

1. **Research products once, not per topic (dossier library).** Topics
   ≠ products: 96 docs draw on a recurring cast (SQLite, Slint, git,
   terminal stacks, Rust crates…). Extract each product's dossier once
   into the chunk/record cache; a topic then runs only clause×dossier
   comparisons + gap slices for questions no dossier answers. This is
   the single biggest lever: extraction cost is paid ~once per product
   version, amortized over every topic and every future project.
   Estimated ÷3–5 on extraction tokens across a full corpus run.
2. **Host-side chunk preselection (tested today).** A cheap picker pass
   (chunk index = 18 KB for a 164 KB doc) selected 42/289 chunks
   (14% of bytes); the slice on that subset produced *more* claims
   (37 vs 22), covered every topic key, cited nothing outside the
   subset, and honestly flagged its one uncovered fact instead of
   inventing it. Naive keyword ranking alone reached only 32% chunk
   recall; model-picked section ranges reached the same claim coverage
   at 14% bytes. Estimated ÷5–7 on slice input tokens, with the
   residue sweep as the completeness backstop.
3. **Tiered depth by external surface.** Most plan units make no
   external claim. Host triage (product/tech mentions, dependency
   graph) sorts topics into: dossier-lookup only (~free), gap-slices
   only, full pipeline. If ~30% of topics need the full treatment,
   another ÷2–3.
4. **Delta research.** Plans evolve by amendment; re-run only changed
   clauses and records invalidated by version bumps. Steady-state cost
   per amendment → a few slices, not a topic.
5. **Invert the slice loop: by source, not by topic.** One context
   reads a source once and answers every queued question about it
   (across clauses and topics), instead of N contexts re-reading it.
   Pairs naturally with (1) and with shared-prefix caching. ÷1.5–2.
6. **Escalation ladder.** Cheapest adequate setting first (DeepSeek
   high), escalate only entailed-flagged cells to max/stronger. Phase
   data: most cells pass cheap; max earns its cost mainly in discovery.
7. **Production grading ≠ experiment grading.** Double premium grades
   were the slowest single element (15–30 min each) and exist to
   *measure* the process. In production: flash critic panel per topic +
   premium audit on a sample (e.g. 1 in 10 topics, rotating) keeps the
   quality signal at ~10% of the grading cost.
8. **Work-node generation rides the same record DB.** Nodes generated
   from PlanUnits + records with deterministic templates per unit type;
   models touch only ambiguous units. Generating thousands of nodes
   must be mostly code, or it alone will exceed the ER budget.

Combined, (1)+(2)+(3) plausibly take a 96-topic ER pass from ~60M
input tokens / weeks of wall time to roughly **5–10M tokens and a few
days** at the same concurrency — estimates with stated assumptions, to
be replaced by measurements from the Phase 15 harness (same-model
wall-time + bytes recorded per stage, per Jared's cost framing).

## Recommended Phase 15 (in order)

1. Build the dossier/record cache keyed (product, version, question)
   and backfill it from the Phase 12/13 bundles (already-paid research).
2. Clause-driven slices with picker preselection as default; residue
   sweep mandatory; slice-level entailment *before* integration.
3. Host-rendered quotes everywhere; integrator never types quote text.
4. One held-out rerun (caseC) under the Phase 13 protocol measuring
   tokens/time per stage against the Phase 13 baseline — the first
   honest speed number for the optimized stack.
