# P21 — PrusaSlicer released STEP import source

[Governing primary source](https://github.com/prusa3d/PrusaSlicer/blob/version_2.9.6/src/libslic3r/Format/STEP.cpp)

**Version:** Source at released version_2.9.6 tag

**Locator:** get_load_step_fn and load_step, lines 36–123

**Independent assessment:** Confirms the OCCT-wrapper path and creation of TriangleMesh facets. The candidate’s STEP triangulation/kernel boundary is supported; source reading does not independently reproduce either issue example.

**Evidence captures:**

- [P21-prusa-step-code.txt](P21-prusa-step-code.txt) — SHA-256 `e812a6e62fdb9a62c2570852eff99a3ad8b205a20476bc4f7d9401ed337705f9`

**Independently resolved release commit:** `b028299c770b8380ee81c921a2867d522f288123` from [version_2.9.6](https://api.github.com/repos/prusa3d/PrusaSlicer/commits/version_2.9.6). [Saved metadata](version-prusa296.json), SHA-256 `31fee29cfdbe040d19701ae5fe32c42d3a0d57b523acdcb876f2118d6d85e110`. This identifies source version, not product fidelity.
