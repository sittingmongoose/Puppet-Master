# Sources index — A7-01-control critic

This bounded index preserves the investigator's stable source IDs and points to the full identity, version, locator, access, condition, and applicability records in [this stage's source-map.json](../source-map.json). The original source records are carried forward unchanged from the frozen [investigator source map](../../investigator/source-map.json). Independent primary-source checks and their own UTC access records are separated in the critic map; no product test or source download was performed.

## Independent primary-source checks

- **S01 — 3MF Core 1.4.0, tag 1.4.0 / commit 997b385** — [version-pinned specification](https://github.com/3MFConsortium/spec_core/blob/1.4.0/3MF%20Core%20Specification.md). Checked the model-unit default, metadata, component positions, base materials, thumbnails, PrintTicket, extensions, and file-role naming clauses.
- **S02 — 3MF Materials and Properties 1.2.1** — [version-pinned extension text](https://raw.githubusercontent.com/3MFConsortium/spec_materials/1.2.1/3MF%20Materials%20Extension.md). Checked the published version, extension/addendum status, and its stated Core-version target; this raises the unresolved pairing recorded as C1.
- **S03 — 3MF compatibility matrix** — [live matrix](https://3mf.io/compatibility-matrix/). Confirmed the page says implementation claims are vendor-reported and not independently verified.
- **S06 — Autodesk Fusion STL scale guidance** — [support article](https://help.autodesk.com/view/fusion360/ENU/?caas=caas/sfdcarticles/sfdcarticles/STL-files-exported-from-Fusion-360-are-scaled-down-in-3d-printing-software.html). Confirmed STL unit/default caveats.
- **S07 — PrusaSlicer 2.9 supported formats** — [vendor documentation](https://help.prusa3d.com/article/supported-file-formats_1772?product=cw1). Confirmed STEP triangulation and the bounded AMF/3MF recommendation.
- **S09 — PrusaSlicer 2.9 first-print workflow** — [vendor documentation](https://help.prusa3d.com/article/first-print-with-prusaslicer-2-9_1753). Confirmed the receiver selects printer/material and previews G-code; this is workflow guidance, not certification.
- **S10 — PrusaSlicer 3.0 preview compatibility** — [vendor announcement](https://blog.prusa3d.com/prusaslicer-3-0-preview-built-for-the-future-of-3d-printing_137672/). Confirmed geometry/settings asymmetry and the explicit unfinished-alpha condition.
- **S11 — PrusaSlicer issue 8401** — [issue history](https://github.com/prusa3d/PrusaSlicer/issues/8401). Confirmed the reported FreeCAD 0.20 / PrusaSlicer 2.4.2 case, reported AMF placement at 0,0, maintainer diagnosis, and reporter's backslash description of the FreeCAD correction.
- **S12 — PrusaSlicer commit 040a846** — [source diff](https://github.com/prusa3d/PrusaSlicer/commit/040a846). Confirmed the import result now depends on model objects or configuration having loaded.
- **S15 — 3MF conformance suites 2.4.1** — [suite repository](https://github.com/3MFConsortium/test_suites). Confirmed the README lists Core 1.4.0 and Materials 1.2.1 together; this is the other side of C1, not proof of application interoperability.

The primary-source read/find operations for these checks are logged in `source-map.json` with their local UTC access second, exact URL, release/version, locator, observed operation, governing condition, and applicability. S13's ASTM page returned an internal retrieval error in this critic pass; its paywalled/full-text limitation remains as described in the carried source record.

## Carried source identities

The remaining source IDs are preserved exactly from the investigator's source map so earlier evidence is not silently rebound. Their exact URLs and applicability notes remain available in the critic map:

- **S04** Autodesk Fusion mesh export.
- **S05** Autodesk Fusion export formats.
- **S08** PrusaSlicer project 3MF save.
- **S13** ISO/ASTM 52915-20 AMF 1.2 public abstract.
- **S14** PrusaSlicer 2.0 historical release rationale.
- **S16** 3MF specification version index.
- **S17** 3MF Consortium format-boundary FAQ.
- **S18** PrusaSlicer 2.9.6 stable release.
- **S19** Autodesk Fusion component and assembly organization.
