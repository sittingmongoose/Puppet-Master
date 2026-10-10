# S07 — PrusaSlicer 3MF unit issue #15545

- **Source:** [3MF import: unit attribute is applied to mesh vertices but not to transform translations](https://github.com/prusa3d/PrusaSlicer/issues/15545)
- **Version:** Reported on PrusaSlicer 2.9.6 Windows x64 portable; issue opened 2026-07-28.
- **Access:** 2026-10-10T04:14:03Z, read-only issue/reproducer review.
- **Locator:** Description, expected/actual bounds, control matrix, tested build/hash, activity through 2026-09-29.
- **Observed operation:** Report and embedded source/repro steps read. No fixture, binary, or script run.
- **Reported condition:** With a Core 3MF in inches, vertices convert to mm but translation terms for a build item/component do not; an object may be displaced/off-plate. The issue closed after inactivity and has no linked repair in the record.
- **Applicability:** A specific 2.9.6 importer report, not independent verification and not a claim about a later fixed release. Directly motivates explicit mm output and transform-placement checks.
