# Frozen sandbox plan — Historic aerial image comparison workspace

This is a fresh product-planning input, not researched conclusions. All choices below are initial proposals for comparison.

## P1 — Sources

A desktop workspace imports up to twenty scanned TIFF/JPEG images and one public reference raster or map service selected by the user. Source provenance, image dimensions and stated coordinate reference information remain visible.

## P2 — Alignment

Volunteers select control points, choose a transformation from a small explained set and inspect residuals and the aligned overlay. The initial plan allows storing multiple candidate alignments rather than replacing the original scan.

## P3 — Review

A reviewer can inspect point placement, include/exclude a point and compare candidate alignments. Visible uncertainty describes the alignment evidence; the tool makes no boundary ownership or engineering accuracy determination.

## P4 — Working data

Original scans remain immutable. A project stores control points, coordinate assumptions, transformation settings, selected alignment and provenance; reopen should recreate the chosen review state without downloading private data.

## P5 — Components

Raster reading, reprojection/transformation and tiled image viewing components are undecided. Processing should be bounded on a laptop, explain unavailable projection information and preserve user choices without silently inferring them.

## P6 — Output and checks

Export an alignment package and an optional derived raster with provenance and uncertainty. Propose checks for coordinate interpretation, reopen, numerical reproducibility, image orientation and large scans; no alignment has been calculated or validated.
