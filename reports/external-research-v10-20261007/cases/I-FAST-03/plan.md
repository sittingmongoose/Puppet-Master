# Frozen sandbox plan — Community building energy interval dashboard

This is a fresh product-planning input, not researched conclusions. All choices below are initial proposals for comparison.

## P1 — Ingestion

Import CSV interval exports from three building meters for one year. An import preview records meter identity, interval labeling, timestamp convention, units and whether values are interval readings or cumulative readings; originals remain immutable.

## P2 — Storage

A local store holds original records, interpretation choices and review flags. Repeated or overlapping exports are compared in a review view, with provenance preserved rather than automatic overwriting.

## P3 — Dashboard

Show daily and monthly totals, time-of-day profiles and comparisons between user-selected periods. Missing intervals and excluded suspect readings remain visible; no estimated value silently becomes a measured value.

## P4 — Decisions and alternatives

Users can retain competing interpretations of an unfamiliar export and label operator events such as building closures. The MVP reports descriptive comparisons rather than causal savings or tariff/billing conclusions.

## P5 — Components and privacy

Delimited-file ingestion, interval aggregation and chart components are undecided. Work is local on a normal laptop and exports omit account identifiers unless explicitly included in a review package.

## P6 — Output and checks

Export a period comparison with input identities, coverage, interpretations and uncertainty. Propose checks for counter resets, overlapping intervals, clock transitions, unit handling and aggregation reproducibility; no result or expected formula is supplied.
