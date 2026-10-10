# Sources index — A7-01-control investigator

This is a bounded navigation index, not a dump of entire web pages. Source identifiers are stable and map one-to-one to entries in [source-map.json](../source-map.json). Public sources were queried/opened read-only. No file was downloaded, no account was used, and no CAD/slicer product check was run. The UTC value below is the local clock second immediately before opening each page; response-completion seconds and timestamp limits are recorded in the JSON map.

## 3MF format and optional package content

- **S01 — 3MF Core 1.4.0, tag 1.4.0 / commit 997b385** — [specification](https://github.com/3MFConsortium/spec_core/blob/1.4.0/3MF%20Core%20Specification.md). Relevant: model units/default, mesh and component resources, base-material naming, optional thumbnails and metadata, PrintTicket behavior, 1.4.0 double-extension file-role recommendations. Accessed at 2026-10-10T04:17:08Z; locators in map.
- **S02 — 3MF Materials and Properties 1.2.1** — [version-pinned extension specification](https://github.com/3MFConsortium/spec_materials/blob/1.2.1/3MF%20Materials%20Extension.md), [release page](https://github.com/3MFConsortium/spec_materials/releases/tag/1.2.1). Adds color groups, textures, composite materials, multi-properties, and display properties; it is an optional extension, not implied by Core support. Accessed at 2026-10-10T04:21:51Z.
- **S03 — compatibility matrix** — [3MF Consortium matrix](https://3mf.io/compatibility-matrix/). Candidate applications are listed for core import/export and extension support; entries are explicitly self-reported and not independently verified. Accessed at 2026-10-10T04:16:53Z.
- **S15 — conformance test suites 2.4.1** — [3MF Consortium test suite repository](https://github.com/3MFConsortium/test_suites). Core and extension cases are split into suites; the test set references Core 1.4.0 and Materials 1.2.1. Candidate for a proposed format-level test, not run here. Accessed at 2026-10-10T04:16:53Z.
- **S16 — version index** — [3MF specification suite](https://3mf.io/spec/). Confirms published extension versions separately from Core. Accessed at 2026-10-10T04:17:24Z.
- **S17 — format boundary FAQ** — [3MF Consortium FAQ](https://3mf.io/resources/faq/). Consortium position: 3MF is a manufacturing exchange format, not a replacement for higher-order CAD geometry. Accessed at 2026-10-10T04:17:51Z.

## CAD and slicer handoffs

- **S04 — Fusion mesh export** — [Autodesk help](https://help.autodesk.com/cloudhelp/ENU/Fusion-Mesh/files/MESH-EXPORT-TOOLS.htm). Fusion exports solid/surface/mesh to 3MF, STL, or OBJ; selecting a component exports its bodies. Accessed at 2026-10-10T04:16:53Z.
- **S05 — Fusion export formats** — [Autodesk help](https://help.autodesk.com/view/fusion360/ENU/?contextId=ASM-EXPORT-DESIGN). Describes 3MF mesh contents, STEP as a 3D exchange format, STL facets, and loss of source associativity after export. Accessed at 2026-10-10T04:16:53Z.
- **S19 — Fusion components and assembly hierarchy** — [Autodesk help](https://help.autodesk.com/cloudhelp/ENU/Fusion-Assemble/files/ASM-COMPONENTS.htm). Components can nest bodies and other components and can reference external designs that may be unresolved for reviewers. Accessed at 2026-10-10T04:21:51Z.
- **S06 — STL scale and units** — [Autodesk support](https://help.autodesk.com/view/fusion360/ENU/?caas=caas/sfdcarticles/sfdcarticles/STL-files-exported-from-Fusion-360-are-scaled-down-in-3d-printing-software.html), dated 2026-04-29. Notes STL is unitless; export/import defaults can cause scale errors; explicitly set units. Accessed at 2026-10-10T04:17:08Z.
- **S07 — PrusaSlicer 2.9 supported formats** — [Prusa Knowledge Base](https://help.prusa3d.com/article/supported-file-formats_1772?product=cw1). 3MF is preferred; STEP is triangulated on import; AMF is supported but Prusa suggests 3MF. Accessed at 2026-10-10T04:17:08Z.
- **S08 — PrusaSlicer project save** — [Prusa Knowledge Base](https://help.prusa3d.com/article/saving-projects-as-3mf_1773?product=sl1). A Prusa project 3MF can save geometry plus slicer settings/modifiers; claims are scoped to matching Prusa use. Accessed at 2026-10-10T04:16:53Z.
- **S09 — PrusaSlicer 2.9 first-print workflow** — [Prusa Knowledge Base](https://help.prusa3d.com/article/first-print-with-prusaslicer-2-9_1753). Receiver selects printer/material and should inspect G-code preview. Accessed at 2026-10-10T04:17:08Z.
- **S10 — PrusaSlicer 3.0 public preview compatibility** — [Prusa announcement](https://blog.prusa3d.com/prusaslicer-3-0-preview-built-for-the-future-of-3d-printing_137672/), dated 2026-09-01, explicitly alpha/unfinished. Third-party 3MF is imported as geometry only in the preview; project-setting behavior differs by version. Accessed at 2026-10-10T04:16:53Z.
- **S18 — PrusaSlicer 2.9.6 stable release** — [tagged release](https://github.com/prusa3d/PrusaSlicer/releases/tag/version_2.9.6), commit b028299. Accessed at 2026-10-10T04:17:51Z.

## Bounded issue/fix and alternative format history

- **S11 — FreeCAD/PrusaSlicer importer issue 8401** — [issue](https://github.com/prusa3d/PrusaSlicer/issues/8401), opened 2022-06-13. FreeCAD 0.20 3MF export silently failed in PrusaSlicer 2.4.2 in the reporter's case; maintainer identified malformed package path data. The author reported the FreeCAD exporter fix. The same report says its AMF loaded but had an origin/placement difference; this is a user report, not a test run here. Accessed at 2026-10-10T04:16:53Z.
- **S12 — error-handling change 040a846** — [PrusaSlicer commit](https://github.com/prusa3d/PrusaSlicer/commit/040a846), linked to issue 8401 on 2022-06-14. A failed model/config load now does not count as success; exact first stable release containing the commit was not identified. Accessed at 2026-10-10T04:16:53Z.
- **S13 — AMF standard** — [ASTM ISO/ASTM 52915-20](https://store.astm.org/f2915-20.html), AMF 1.2, active, last updated 2020-08-14. Public abstract says XML/XSD conformity is needed for standards-compliant interoperability; full standard was not purchased or inspected. Accessed at 2026-10-10T04:16:53Z.
- **S14 — historical AMF/3MF choice** — [PrusaSlicer 2.0 release note](https://blog.prusa3d.com/prusaslicer-2-release_30008/), 2019. Prusa then preferred 3MF for project saving and still imported AMF; use as dated vendor rationale only. Accessed at 2026-10-10T04:17:08Z.

## Evidence boundaries

Product/version statements above are source observations. Recommendations in [discovery.md](../discovery.md) are labeled inference or local choice. Source retrieval did not validate any pilot file, metadata-preservation path, slicer setting, or machine.

