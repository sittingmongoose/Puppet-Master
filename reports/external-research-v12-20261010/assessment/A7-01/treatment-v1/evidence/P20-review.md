# P20 — PrusaSlicer released 3MF importer source

[Governing primary source](https://github.com/prusa3d/PrusaSlicer/blob/version_2.9.6/src/libslic3r/Format/3mf.cpp)

**Version:** Source at released version_2.9.6 tag

**Locator:** get_unit_factor lines 301–317; model handler 1959–1962; vertex handler 2103–2111; component handler 2183–2201; item handler 2224–2239

**Independent assessment:** Static source inspection corroborates the reported asymmetry: vertex factors are applied, while the inspected component/item handlers pass parsed transforms through. This is implementation evidence, not a locally executed witness or a guarantee about all binaries/platforms.

**Evidence captures:**

- [P20-prusa3mf-code.txt](P20-prusa3mf-code.txt) — SHA-256 `119ab91923efb393cd7c9ef8c7d242da097cfc6dd812442ba7ac42bd25fab3b8`

**Independently resolved release commit:** `b028299c770b8380ee81c921a2867d522f288123` from [version_2.9.6](https://api.github.com/repos/prusa3d/PrusaSlicer/commits/version_2.9.6). [Saved metadata](version-prusa296.json), SHA-256 `31fee29cfdbe040d19701ae5fe32c42d3a0d57b523acdcb876f2118d6d85e110`. This identifies source version, not product fidelity.
