# S07 — PrusaSlicer issue #15545: 3MF non-millimetre transform translations

- **Exact URL:** https://github.com/prusa3d/PrusaSlicer/issues/15545
- **Released version/commit:** Issue opened 2026-07-28; reproducer identifies PrusaSlicer 2.9.6 Windows x64 portable, SHA-256 7fd50b52d1cc3da87dbcb71e45e764412dd45688bea028f351333e86d9769704. Closed after inactivity on 2026-09-29; no fix/PR linked.
- **Locator:** Minimal reproduction, expected/actual bounds and tested build (lines 158-223); close activity (lines 243-267).
- **Access UTC:** 2026-10-10T04:39:48Z
- **Observed operation:** Read-only open of the official GitHub issue; did not download the reproducer or run the app.
- **Governing condition/default/exception:** Reporter describes mesh vertices converted to mm while build-item/component translation terms from an inch model are not; translated geometry can be off-plate. The issue closes after an inactivity warning, not a documented repair.
- **Applicability:** Specific reported 2.9.6 behavior, not independent verification or a claim about later builds; useful unit/transform sentinel.
