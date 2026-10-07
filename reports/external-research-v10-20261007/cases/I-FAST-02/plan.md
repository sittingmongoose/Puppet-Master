# Frozen sandbox plan — Harbour water-level comparison notebook

This is a fresh product-planning input, not researched conclusions. All choices below are initial proposals for comparison.

## P1 — Inputs

Import volunteer CSV water-level observations for two locations and an authorized public prediction/observation download for one reference station. Retain source files, retrieval time, station metadata and any stated reference datum.

## P2 — Comparability

Users select the time convention, unit interpretation and any justified reference-level mapping. The interface retains raw and interpreted values separately and allows a comparison to remain unresolved when information is missing.

## P3 — Analysis

Show aligned series over a selected month, marked observation gaps and a residual view for a declared comparison. The initial plan proposes simple summaries and candidate event annotations, with no autonomous recalibration or operational forecast.

## P4 — Provenance and review

A notebook records station changes, interpretation choices, source ranges and reviewer comments. Reviewers can retain two competing interpretations until a decision is made, and exported figures carry the chosen context.

## P5 — Components

Public-data client, time-series alignment and plotting components are undecided. The notebook runs locally after download, exposes input coverage and does not require users to publish volunteer location details.

## P6 — Acceptance

Propose validation for timestamp changes, station metadata changes, absent reference-level information, missing intervals and reproducible exported summaries. No numerical summary or calibration is supplied as a research answer.
