# S06 — PrusaSlicer issue #8998: STEP import excludes big chunk of part

- **Exact URL:** https://github.com/prusa3d/PrusaSlicer/issues/8998
- **Released version/commit:** Opened 2022-10-03 against PrusaSlicer 2.5.0. Sep 18 2026 follow-up says it reproduced on whatever Flathub beta version was installed that day; exact build is not named.
- **Locator:** Description/repro and 2.5.0 version (lines 151-188); maintainer comments (lines 253-322); Dec 2022 follow-up (367-375); Sep 2026 beta report and issue relationships (395-447).
- **Access UTC:** 2026-10-10T04:39:48Z
- **Observed operation:** Read-only open of public GitHub issue and comments. No issue attachment, binary or generator was downloaded/run.
- **Governing condition/default/exception:** Original report says STEP imported into 2.5.0 had 127 open edges and missing hinge/conical features while a comparison STL worked. A maintainer attributed importer quality to OpenCASCADE. A later Sep 2026 report says the same Owl STEP case reproduced using the then-current Flathub beta, fresh MK3S profile and default STEP settings, but gives no exact build. The issue has no linked branch/PR in the current record.
- **Applicability:** Reported behavior, not an independently reproduced product test. The latest report raises a current-beta signal with an unknown build; it does not establish behavior in stable 2.9.6 or every STEP file.
