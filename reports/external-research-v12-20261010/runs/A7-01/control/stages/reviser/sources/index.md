# Sources index — A7-01-control reviser

This is a bounded navigation index. Stable IDs S01–S19 retain their investigator identities and full exact records in [source-map.json](../source-map.json). The critic’s separate identity/review records and this reviser’s direct checks are kept distinct. Public retrieval was read-only. No source file, CAD/slicer application, project package, or printer was downloaded or operated.

## Reviser direct checks

- **RV01 / S01 — 3MF Core Specification 1.4.0** — [tagged specification](https://github.com/3MFConsortium/spec_core/blob/1.4.0/3MF%20Core%20Specification.md). Reopened §3.4 Model attribute table for the unit default and valid values, and §2.2.3 for absolute part names beginning `/`. Observed 2026-10-10T04:44:52Z–04:44:59Z.
- **RV02 / S02 — Materials and Properties Extension 1.2.1** — [version-pinned specification](https://github.com/3MFConsortium/spec_materials/blob/1.2.1/3MF%20Materials%20Extension.md) (opened through [the raw tagged text](https://raw.githubusercontent.com/3MFConsortium/spec_materials/1.2.1/3MF%20Materials%20Extension.md)). Reopened its status, preface, and surrounding extension overview; it says it is an addendum and “MUST be used only with Core specification 1.2.” Observed 2026-10-10T04:44:52Z–04:44:59Z.
- **RV03 / S15 — 3MF Conformance Test Suites 2.4.1** — [repository README](https://github.com/3MFConsortium/test_suites). Reopened suite coverage and global version list; Core 1.4.0 and Materials 1.2.1 are listed, and suites 2 and 6 cover both Core and Materials. The README does not reconcile the S02 restriction. Observed 2026-10-10T04:44:52Z–04:44:59Z.
- **RV04 / S11 — PrusaSlicer issue 8401** — [issue history](https://github.com/prusa3d/PrusaSlicer/issues/8401). Reopened the full issue report and June 14 discussion: the reporter identifies the FreeCAD correction as a leading backslash; the maintainer’s “slash” wording alone is ambiguous. The attachment was not downloaded. Observed 2026-10-10T04:44:52Z–04:44:59Z.

These are source observations, not product validation. Review outcomes C1–C4 are documented in `../final.md` and structured in the source map.

## Stable carried source identities

### S01

**3MF Core Specification**

- **Source:** [3MF Consortium](https://github.com/3MFConsortium/spec_core/blob/1.4.0/3MF%20Core%20Specification.md)
- **Version/commit:** Published version 1.4.0; release tag 1.4.0, commit 997b385 (2025-02-06).
- **Locator:** Sections 2.1.3–2.1.4; 2.2.1; 3.4.1; 4.2; 5.1; tables 2-1 and 3-1.
- **Carried access:** 2026-10-10T04:17:08Z (web-open request initiated in this clock second; response returned by the 04:17:08Z sample).
- **Applicability:** Primary governing source for 3MF geometry, unit, assembly/component, material-intent, metadata, thumbnail, printer-settings, extension, and naming claims in this pilot proposal.

### S02

**3MF Materials and Properties Extension**

- **Source:** [3MF Consortium](https://github.com/3MFConsortium/spec_materials/blob/1.2.1/3MF%20Materials%20Extension.md)
- **Version/commit:** Published version 1.2.1; released 2025-02-27 according to the official specification index. Release commit not recorded in the accessed page.
- **Locator:** Preface and sections 1–7, especially Color Groups, Texture 2D Groups, Composite Materials, Multiproperties, and Display Properties.
- **Carried access:** 2026-10-10T04:21:51Z (version-tagged spec page opened in this clock second; response returned by the 04:21:52Z sample).
- **Applicability:** Optional for the decorative pilot; use only for properties shown to work in the pilot's chosen receiving-tool matrix.

### S03

**3MF Compatibility Matrix**

- **Source:** [3MF Consortium](https://3mf.io/compatibility-matrix/)
- **Version/commit:** Live matrix; no product build/version timestamp supplied on the page.
- **Locator:** Reading-the-matrix note and product rows for Bambu Studio, Cura, FreeCAD, Fusion 360, OrcaSlicer, and PrusaSlicer.
- **Carried access:** 2026-10-10T04:16:53Z (web-open request initiated in this clock second; response returned by the 04:16:54Z sample).
- **Applicability:** Discovery shortlist and initial matrix candidates only. Pilot lead must select exact tested versions and builds.

### S04

**Autodesk Fusion Mesh Export**

- **Source:** [Autodesk](https://help.autodesk.com/cloudhelp/ENU/Fusion-Mesh/files/MESH-EXPORT-TOOLS.htm)
- **Version/commit:** Current online product documentation; article does not pin a Fusion build.
- **Locator:** Save As Mesh and 3D Print sections.
- **Carried access:** 2026-10-10T04:16:53Z (web-open request initiated in this clock second; response returned by the 04:16:54Z sample).
- **Applicability:** A concrete CAD-to-slicer 3MF route when Fusion is the author's tool; not a claim that all Fusion export settings or extensions survive.

### S05

**Autodesk Fusion Export Designs**

- **Source:** [Autodesk](https://help.autodesk.com/view/fusion360/ENU/?contextId=ASM-EXPORT-DESIGN)
- **Version/commit:** Current online product documentation; no fixed Fusion release identified.
- **Locator:** Export format list and Tips.
- **Carried access:** 2026-10-10T04:16:53Z (web-open request initiated in this clock second; response returned by the 04:16:54Z sample).
- **Applicability:** Supports the distinction between mesh-to-slicer and neutral CAD-exchange routes; original CAD history/associativity remains in its native file.

### S06

**STL/OBJ files exported from Fusion are scaled incorrectly**

- **Source:** [Autodesk](https://help.autodesk.com/view/fusion360/ENU/?caas=caas/sfdcarticles/sfdcarticles/STL-files-exported-from-Fusion-360-are-scaled-down-in-3d-printing-software.html)
- **Version/commit:** Support article dated 2026-04-29.
- **Locator:** Issue, causes, and unit-selection solution.
- **Carried access:** 2026-10-10T04:17:08Z (web-open request initiated in this clock second; response returned by the 04:17:08Z sample).
- **Applicability:** Concrete basis for warning that STL is a geometry-only fallback requiring an explicit unit statement and size check.

### S07

**Supported file formats (PrusaSlicer 2.9 documentation)**

- **Source:** [Prusa Research](https://help.prusa3d.com/article/supported-file-formats_1772?product=cw1)
- **Version/commit:** Knowledge-base topic is PrusaSlicer 2.9 (legacy); exact point build is not specified on the page.
- **Locator:** 3MF, STL, STEP, and AMF sections.
- **Carried access:** 2026-10-10T04:17:08Z (web-open request initiated in this clock second; response returned by the 04:17:08Z sample).
- **Applicability:** Concrete receiving-slicer comparison at the 2.9 documentation baseline; version-specific behavior must still be checked for the selected build.

### S08

**Saving projects as 3MF**

- **Source:** [Prusa Research](https://help.prusa3d.com/article/saving-projects-as-3mf_1773?product=sl1)
- **Version/commit:** Live Knowledge Base page, product-family examples; no exact application version pinned.
- **Locator:** Save Project and 3MF file format sections.
- **Carried access:** 2026-10-10T04:16:53Z (web-open request initiated in this clock second; response returned by the 04:16:54Z sample).
- **Applicability:** Shows the distinction between a design-model handoff and a slicer-owned project snapshot.

### S09

**First print with PrusaSlicer 2.9**

- **Source:** [Prusa Research](https://help.prusa3d.com/article/first-print-with-prusaslicer-2-9_1753)
- **Version/commit:** PrusaSlicer 2.9 workflow documentation; exact point build not specified.
- **Locator:** Model import, selecting printer, selecting material, and previewing G-code.
- **Carried access:** 2026-10-10T04:17:08Z (web-open request initiated in this clock second; response returned by the 04:17:08Z sample).
- **Applicability:** Supports a separation between CAD's intended material and the technician's receiving-machine material/process selection, plus a non-operating visual check.

### S10

**PrusaSlicer 3.0 Preview compatibility notes**

- **Source:** [Prusa Research](https://blog.prusa3d.com/prusaslicer-3-0-preview-built-for-the-future-of-3d-printing_137672/)
- **Version/commit:** 3.0.0 public preview announced 2026-09-01; explicitly an unfinished alpha, not a production build.
- **Locator:** Compatibility and What’s not ready yet sections.
- **Carried access:** 2026-10-10T04:16:53Z (web-open request initiated in this clock second; response returned by the 04:16:54Z sample).
- **Applicability:** Concrete, versioned evidence that geometry and slicer settings have distinct compatibility boundaries.

### S11

**3MF import from FreeCAD fails, issue 8401**

- **Source:** [PrusaSlicer GitHub issue tracker](https://github.com/prusa3d/PrusaSlicer/issues/8401)
- **Version/commit:** Issue opened 2022-06-13; reporter used FreeCAD 0.20 export and PrusaSlicer 2.4.2+arm64 on macOS 12.4. Reporter later said FreeCAD fixed the exporter. No first fixed stable FreeCAD/Prusa point release is stated.
- **Locator:** Issue description and 2022-06-14 activity; attached test-file descriptions.
- **Carried access:** 2026-10-10T04:16:53Z (web-open request initiated in this clock second; response returned by the 04:16:54Z sample).
- **Applicability:** Bounded historical exporter/importer compatibility example for a CAD-to-slicer pilot; motivates testing actual exporter builds and checking that failed imports are explicit.

### S12

**PrusaSlicer commit 040a846: show error for invalid 3MF**

- **Source:** [PrusaSlicer source repository](https://github.com/prusa3d/PrusaSlicer/commit/040a846)
- **Version/commit:** Commit 040a846, 2022-06-14, linked by issue 8401.
- **Locator:** Change to src/libslic3r/Format/3mf.cpp around load_3mf return condition.
- **Carried access:** 2026-10-10T04:16:53Z (web-open request initiated in this clock second; response returned by the 04:16:54Z sample).
- **Applicability:** Corroborates the receiving-importer fix path; the pilot should check both the geometry result and user-visible error handling.

### S13

**ISO/ASTM 52915-20 AMF 1.2**

- **Source:** [ASTM International](https://store.astm.org/f2915-20.html)
- **Version/commit:** Active ISO/ASTM 52915-20, AMF version 1.2; ASTM last updated 2020-08-14.
- **Locator:** Standard abstract, scope, and version history.
- **Carried access:** 2026-10-10T04:16:53Z (web-open request initiated in this clock second; response returned by the 04:16:54Z sample).
- **Applicability:** An analogous formal AMF interchange alternative for this pilot, with weaker observed slicer support than the 3MF core route.

### S14

**PrusaSlicer 2.0 release notes**

- **Source:** [Prusa Research](https://blog.prusa3d.com/prusaslicer-2-release_30008/)
- **Version/commit:** PrusaSlicer 2.0 release announcement (2019).
- **Locator:** Project file section.
- **Carried access:** 2026-10-10T04:17:08Z (web-open request initiated in this clock second; response returned by the 04:17:08Z sample).
- **Applicability:** Historical explanation for preferring 3MF to AMF and a reason to treat AMF as a tested alternative, not the pilot default.

### S15

**3MF Conformance Test Suites**

- **Source:** [3MF Consortium](https://github.com/3MFConsortium/test_suites)
- **Version/commit:** Published suite version 2.4.1; cases target Core 1.4.0, Materials 1.2.1, Production 1.2.0, Slice 1.0.2 and listed extension versions.
- **Locator:** README version table and suite coverage table.
- **Carried access:** 2026-10-10T04:16:53Z (web-open request initiated in this clock second; response returned by the 04:16:54Z sample).
- **Applicability:** Useful proposed format-level conformance check for producer/receiver candidates; must be paired with real files and application-version tests.

### S16

**3MF specification index**

- **Source:** [3MF Consortium](https://3mf.io/spec/)
- **Version/commit:** Live index; Materials and Properties 1.2.1 published 2025-02-27; Core release 1.4.0 separately pinned at S01.
- **Locator:** Specification suite version and update table.
- **Carried access:** 2026-10-10T04:17:24Z (web-open request initiated in this clock second; response returned by the 04:17:25Z sample).
- **Applicability:** Version provenance for optional materials/metadata-related extension choices.

### S17

**3MF Consortium FAQ**

- **Source:** [3MF Consortium](https://3mf.io/resources/faq/)
- **Version/commit:** Live FAQ; publication version/date not stated.
- **Locator:** FAQ sections comparing 3MF with STL, rendering formats, and CAD/STEP.
- **Carried access:** 2026-10-10T04:17:51Z (web-open request initiated in this clock second; response returned by the 04:17:52Z sample).
- **Applicability:** Useful context for the mesh-versus-CAD boundary, interpreted alongside the formal core specification and Autodesk/Prusa implementation docs.

### S18

**PrusaSlicer 2.9.6 stable release**

- **Source:** [PrusaSlicer source repository](https://github.com/prusa3d/PrusaSlicer/releases/tag/version_2.9.6)
- **Version/commit:** PrusaSlicer 2.9.6 final release, tag version_2.9.6, commit b028299.
- **Locator:** Release title and summary; 2.9.6 is contrasted with the public 3.0 preview in S10.
- **Carried access:** 2026-10-10T04:17:51Z (web-open request initiated in this clock second; response returned by the 04:17:52Z sample).
- **Applicability:** Candidate stable baseline for selecting exact Prusa receiving builds during the pilot.

### S19

**Fusion component and assembly organization**

- **Source:** [Autodesk](https://help.autodesk.com/cloudhelp/ENU/Fusion-Assemble/files/ASM-COMPONENTS.htm)
- **Version/commit:** Current online Fusion documentation; no fixed product build stated.
- **Locator:** Component definition, internal/external components, and hierarchy recommendations.
- **Carried access:** 2026-10-10T04:21:51Z (web-open request initiated in this clock second; response returned by the 04:21:52Z sample).
- **Applicability:** Context for preserving part names and nested assembly intent; do not require reviewer access to linked Fusion designs.
