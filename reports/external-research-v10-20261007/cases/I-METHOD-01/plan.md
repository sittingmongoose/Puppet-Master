# Frozen sandbox plan — Rain and stream station reconciliation workbench

This is a fresh product-planning input, not researched conclusions. All choices below are initial proposals for comparison.

## P1 — Inputs and identity

A desktop workbench imports timestamp/value CSV files from ten stations for one season. Users assign station identity, sensor type, timestamp convention and units in an import preview; originals remain immutable and each batch has a visible provenance record.

## P2 — Data model

A local store holds raw samples, import decisions and separate analyst annotations. A station catalog records location, sensor replacement dates and user-entered metadata; overlapping imports are shown for review rather than silently replacing old batches.

## P3 — Review

Users align rainfall and stream-level plots over a storm window, inspect missing intervals and annotate suspect segments. The initial plan proposes configurable threshold rules plus manual review, but no autonomous correction or conversion from level to flow.

## P4 — Comparisons

The MVP compares nearby stations and a user-selected reference series, while showing the raw source and the selected time/unit interpretations. Derived summaries link back to selected sample ranges.

## P5 — Components and operation

A single-user local app uses an embedded store, a scientific time-series reader and a plotting component, all undecided. It should handle about two million seasonal records on a normal laptop, allow intermittent offline use and avoid requiring a cloud account.

## P6 — Output and acceptance

Export a review package containing the selected window, provenance, annotations and a plain-language uncertainty note. Proposed acceptance includes repeated imports, discontinuous records, changed station metadata and round-trip exports; no tests have run.
