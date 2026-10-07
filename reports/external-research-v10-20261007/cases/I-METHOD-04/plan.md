# Frozen sandbox plan — Community oral-history ingest desk

This is a fresh product-planning input, not researched conclusions. All choices below are initial proposals for comparison.

## P1 — Batch capture

A local desktop app accepts selected WAV/BWF, FLAC and MP3 files from a removable drive. It copies originals to an ingest area, computes fixity information and retains original filenames and relative folder structure without editing source media.

## P2 — Inspection

The app displays duration, channels, encoding, embedded metadata and user-entered accession notes. A waveform/listen view supports spot inspection; metadata observations and archivist corrections are kept separately.

## P3 — Derivatives

Users explicitly request a listening derivative and choose output settings after previewing the intended transformation. Original audio remains the preservation source; failed or interrupted transformations leave a visible disposition.

## P4 — Packaging

An accession package contains originals, derivative references, provenance, fixity records and the transformation settings/tool version. Reopening a package should make changed or missing content visible.

## P5 — Components and environment

Metadata parsing, audio decoding/encoding, package serialization and playback components are undecided. The app works offline on Windows or Linux, does not upload interview audio and avoids changing embedded metadata merely for display.

## P6 — Acceptance

Propose synthetic validation for interrupted copy, malformed metadata, unusual channel layouts, encoding conversion and package fixity checks. No conversion recipe, component version or preservation-quality claim has been validated.
