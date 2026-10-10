# Complete draft — community workshop printable-project handoff

**Run/stage:** A7-01-control / investigator  
**Scope:** A ten-project pilot of noncritical decorative 3D-print projects. This is a planning proposal; it is not an implementation, a print recipe, or product validation.  
**Evidence:** [Navigable source index](sources/index.md) and [structured source map](source-map.json). The exact 3MF Core release and other applicable versions/builds are tied to source IDs there.  
**Discovery freeze:** The released plan helper recorded discovery SHA-256 17ff8435c3352da4d6ab501fb6a90272c342a2b04bedf7a04afb4eeaa6b04dfb (14,812 bytes). The discovery file was not edited after that record.

## Recommendation

Make a design-oriented 3MF model export the default CAD-to-slicer geometry handoff where the author's CAD exporter and the pilot lead's selected receiver have been tested together. Bundle it in a simple folder or ZIP with a concise human-readable project note and sidecar preview image. Include a STEP exchange file as an optional CAD-review or direct-import path when the chosen receiver supports it. Allow STL only as a restricted fallback with explicit unit and dimension notes. Keep AMF as a bounded legacy alternative for the matrix, not the default.

Keep author design intent separate from machine/process instructions. The author identifies the intended units, materials, components, names, and assembly/fit relationships. The workshop technician selects printer-specific settings and the actual material preset. The pilot lead publishes compatibility only for the exact receiving tools/builds tested during the pilot.

For an author geometry artifact, prefer the 3MF Core 1.4.0 naming recommendation for a model file (.model.3mf). A receiving slicer project with app-specific settings is a different artifact; use a project/build role only when the receiving technician has created and labeled that machine-specific project. Core 3MF metadata can carry Description and optional package/object thumbnails, but display support is conditional. Keep the readable note and PNG beside the 3MF so a reviewer can use them without the author's CAD tool or a viewer that surfaces embedded metadata.

## Clause-by-clause disposition against the released draft plan

| Clause | Plan's current treatment | Disposition | Complete treatment |
| --- | --- | --- | --- |
| 1 | STL is the complete project record; reconstruct units from filename; say materials verbally. | **Correct.** | STL is a unitless surface mesh, not a full record. A model filename is not a reliable unit contract. Compare CAD-to-3MF and CAD-to-STEP, with an outer note/preview package; keep STL a fallback with declared units and measured dimensions. [S01, S04–S07, S13–S14] |
| 2 | PrusaSlicer/Cura are named, but boundaries are untested; richer package unspecified. | **Correct and constrain.** | Treat PrusaSlicer and Cura as matrix candidates only. 3MF carries units/objects/components and may carry material names and preview; a slicer may import only geometry or may apply its own project settings. STEP remains a CAD exchange route, but PrusaSlicer 2.9 triangulates it on import. The pilot lead—not this proposal—selects exact receiving versions. [S01, S03, S05, S07, S10] |
| 3 | Retain preview/note but assume shared package settings work on every printer and do not report extension loss. | **Retain optional preview/note; correct portability premise.** | Core permits optional JPEG/PNG thumbnails and Description metadata. Keep the user-authorized preview/note as optional scope and preserve them where supported; provide sidecars for fallback. Settings and optional extensions vary by consumer; report unsupported/lost data and never infer universal printer instructions. [S01–S03, S08, S10] |
| 4 | No released importer/exporter history was reviewed; one open-file demo is proposed. | **Correct.** | Record the 2022 FreeCAD 0.20 to PrusaSlicer 2.4.2 invalid-3MF case and linked importer error-handling commit. Its version and defect history make it a test case, not a current-defect claim. A single successful open is insufficient to establish version-matrix compatibility. [S11–S12] |
| 5 | Keep the package preview and note, but scope as optional. | **Confirm.** | The brief authorizes this optional scope; Core 1.4.0 provides optional package/object thumbnails and Description metadata. Retain when supported and use readable sidecars. No evidence-based exclusion is justified; do not silently convert it into a mandatory technical capability. [S01, S03] |
| 6 | Owners are specified in the brief but draft assumptions may stand in for them. | **Confirm authority; leave actual values open.** | Project author owns intended units/materials; workshop technician owns printer settings; pilot lead selects a tested receiving-tool matrix. Record the author-provided values and actual tests as explicit fields; this research cannot choose them. |
| 7 | Negative constraints appear but plan admits incomplete compliance trace. | **Confirm as binding.** | No printer operation; no safety-critical designs; no claim that STL preserves every property; no claim that a saved slicer project/settings file is approved for every machine. The proposal stays at review and pilot-planning level. |
| 8 | Draft admits it is incomplete and calls future work proposed. | **Replace with this complete proposal and status table.** | The sections below cover the routes, alternatives, evidence/version applicability, optional scope, role decisions, unresolved inputs, and validation status. Research and proposed checks are not reported as product validation. |

## Handoff routes and tradeoffs

### A. CAD export to 3MF model, then geometry import to slicer — recommended default

Fusion documents a mesh-export route from a solid/surface/mesh body to 3MF and permits selecting a component to export all its bodies [S04]. Autodesk describes 3MF as a mesh-oriented manufacturing format with vertices, triangular faces, units, colors, and textures [S05]. The 3MF Core 1.4.0 package is ZIP/OPC-based and has explicit model units (millimeter default), object resources, build items, component references/transforms, and optional package metadata and thumbnails [S01]. Core component relationships can encode part placement, subject to conforming producer/consumer behavior. The compatibility matrix lists many core import/export candidates, but entries are vendor self-reports, not independent tests; core support does not imply Materials-extension support [S03].

**Advantages:** one named, portable additive-manufacturing package can carry more review context than STL; unit and object structure are defined; optional preview/Description have standard locations; the format has a published version and conformance suite [S01, S15].

**Limits and condition:** it is a mesh/manufacturing representation, not the author's feature tree or full parametric assembly. The model's base-material name carries design intent; displaycolor is a render cue and does not determine physical print color. PrintTicket settings are consumer-governed, and unsupported/missing tickets can leave the receiver to apply defaults [S01]. Rich color/texture/material properties are in Materials and Properties 1.2.1, an extension that must be present in the selected interoperability matrix [S02–S03].

**Pilot choice:** deliver a .model.3mf plus note/preview. Do not use a Prusa/Cura/Bambu/Orca “project” file created by the author as a universal print instruction. Keep technician-created projects clearly tied to the exact slicer version, printer, nozzle, bed, and material selection.

### B. CAD exchange through STEP, opened in a CAD tool or supported slicer — secondary route

Fusion lists STEP as a 3D exchange format and says that exported designs do not preserve associativity with the original Fusion design [S05]. PrusaSlicer 2.9 lists STEP import but triangulates the file during import [S07]. This is useful where a reviewer needs CAD-oriented solid geometry or an agreed receiving slicer imports STEP directly. It can complement the 3MF mesh preview and provide a second representation for resolving shape/part questions.

**Advantages:** neutral CAD-exchange route with more CAD-oriented geometry than an STL/3MF triangle surface; a CAD receiver can inspect geometry before the slicer converts it.

**Limits and condition:** the exact STEP application protocol/export options and assembly/material retention were not established for every CAD program in this research. Direct slicer import may triangulate and discard higher-level CAD structure. The chosen versions need a test for object count, dimensions, units, placement, and names; do not assume that a STEP file retains the source author's feature history.

**Pilot choice:** offer STEP as a secondary review/import artifact where authors can export it and the pilot lead includes it in the tested matrix. Do not require accounts or links to external CAD projects. If the reviewer needs editable features, ask the author for a suitable native file as a separate, explicitly application-dependent option.

### Alternatives and portable wrapper

- **3MF role naming:** Core 1.4.0 recommends role-distinguishing names such as .model.3mf for design model data, .project.3mf for full projects, and .build.3mf for a build plate prepared for a specific printer [S01]. This is a useful, underused way to flag whether a file is geometry-only or contains project/build instructions.
- **Outer folder/ZIP:** include the model file, a human-readable note, and a preview PNG as ordinary sidecars. The note should identify author/project/revision; exact units and key dimensions; per-part names; intended material per part; assembly/fit relation; source CAD/exporter version; known exceptions; and which receivers have actually been checked. Mark it “design intent; technician sets printer process.” This wrapper is a local format/package choice, not a claim of a new standard.
- **AMF 1.2:** ASTM's active ISO/ASTM 52915-20 is an XML/XSD-based additive-manufacturing interchange format [S13]. PrusaSlicer 2.9 imports AMF but recommends 3MF, and Prusa's 2019 version-2 rationale described a preference for 3MF while retaining AMF import [S07, S14]. An older FreeCAD issue reports AMF loading at an unexpected origin, so compare exact implementation behavior rather than assuming its standard title ensures portability [S11]. The full paid AMF text was not inspected; do not claim detailed clauses from its abstract.
- **STL:** ubiquitous geometry fallback; unitless and material/property-poor. Require the note to state units and overall dimensions and visually check the receiver's imported size. Never describe it as a complete project record [S06–S07, S17].

## Information to preserve and ownership

**The author's note should describe design intent**, not print approval:

1. project/member identifier, revision/date and source CAD/exporter version;
2. explicit unit system plus one or more key overall dimensions to catch scale errors;
3. part/object names and count, with separate, assembled, interlocked, or post-assembly relationships stated per part;
4. intended material/substance and appearance for each part, with any uncertainty clearly labeled;
5. a preview image for reviewers; if embedded 3MF thumbnail/Description is supported by the exact producer, include those too;
6. known omissions (for example, no timeline or no native-CAD reference included) and exact receiving-tool checks, if any.

3MF can state a unit directly and can structurally represent object resources/components [S01]. Fusion's native component tree also holds names, origins, nested parts, and possibly external references; if a referenced project or permission is missing, those links can be unresolved [S19]. Therefore, include portable part names/relations in the handoff instead of relying on a reviewer's access to a cloud-linked design.

**Materials:** the author supplies intended material, not a printer spool/profile. Prefer a portable substance description (for example, “PLA, opaque, intended appearance: cream”) and, when supported, a 3MF base-material name. The core spec explicitly separates design-intent names from printer-specific mapping and says displaycolor is only for rendering [S01]. Use extension color/texture only if every selected receiver's support for Materials and Properties 1.2.1 is tested [S02–S03].

**Machine settings:** the workshop technician chooses printer, nozzle, bed/build volume, actual spool/resin, temperature, support, orientation, and slicer process settings. A consumer may apply defaults if a PrintTicket is missing or unsupported [S01]. A Prusa 3MF project can store settings/modifiers for that Prusa workflow [S08]; Prusa's 3.0 preview says third-party 3MF imports geometry only and shows version-asymmetric settings behavior [S10]. The technician's saved project is not a universal recipe.

## Historical compatibility finding and effect

In issue 8401 (June 2022), a user using FreeCAD 0.20 export and PrusaSlicer 2.4.2+arm64 reported a silent 3MF failure; accompanying AMF and STL files behaved differently. The Prusa maintainer identified invalid path content and closed the issue after adding failure handling; the user then reported the FreeCAD exporter had been corrected [S11]. Commit 040a846 changes Prusa's 3MF importer result condition so no loaded model objects and no configuration is not a successful import [S12]. The record does not establish the first stable FreeCAD or Prusa release containing the corrections, and I did not reproduce the issue or download its attachment.

**Pilot consequence:** test exact exporter/receiver versions; make a failed import visible; check that expected geometry actually appears and measures correctly before slicing. Keep the issue as a versioned regression scenario, not a statement that current FreeCAD/Prusa releases remain broken. It also demonstrates that an alternate file type may load but change placement, so format substitution itself needs a dimension/origin check.

## Owner decisions and open inputs

The brief fixes ownership but the actual project values remain open:

- **Project author:** intended units, key dimensions, materials/appearance, part names, and assembly relationship/fit intent.
- **Workshop technician:** actual receiving printer setup, spool/material preset, and slicer settings; decides whether to create a separate machine-specific project file.
- **Pilot lead:** tested receiver matrix, including CAD exporter version, slicer name/version/build, OS where relevant, file type, optional extension, and the wording justified by actual results.

No winner is preselected. The 3MF matrix is a useful starting index but says entries are self-reported and not independently checked [S03]. For current candidates, it lists Core import/export capability for products including Cura, FreeCAD, Fusion 360, OrcaSlicer, Bambu Studio, and PrusaSlicer; extensions and versions vary, and some cells are marked Custom/partial. Treat that as a shortlist only.

## Rejected assumptions, retained scope, and uncertain points

**Rejected/corrected plan assumptions:** STL is the full project record; units may be reconstructed only from a filename; material names can be understood from verbal context alone; any shared slicer settings apply to all machines; a single successful open establishes compatibility; the live vendor compatibility matrix is independent proof; the 2022 defect remains current.

**Retained authorized option:** preview image and human-readable project note for reviewers without CAD. The format standard permits optional preview and Description metadata [S01]. Keep these where supported and use sidecars as practical fallbacks; there is no evidence-based reason to exclude them. Retention is not a claim that each viewer or slicer will display them.

**Useful discovery:** 3MF Core 1.4.0's double-extension recommendations can separate design model (.model.3mf) from application project (.project.3mf) and printer-prepared build (.build.3mf); 3MF conformance suite 2.4.1 supplies a format-level test candidate [S01, S15]. Neither decides which slicers or features the workshop can rely on.

**Uncertain:** members' actual CAD/export versions; exact STEP protocol and assembly retention across those tools; selected slicer versions and optional-extension handling; how a receiving application shows embedded previews/metadata; whether the author intends to distribute a native CAD source; and accepted tolerances for preserving model dimensions/relations. Resolve via owner answers and the selected pilot matrix, not assumptions.

## Validation table

| Check | Status | Evidence/inputs | Result or next action |
| --- | --- | --- | --- |
| Public documentation, standard-version, compatibility, and issue-history retrieval | **EXECUTED — research only** | Source IDs S01–S19; no product files or app sessions used. | Supports proposal claims and conditions; does not validate any exported model. |
| Exact plan release and read | **EXECUTED** | Single authorized release-helper run; release-receipt.json records the frozen discovery and plan hashes. | Released plan was read from revealed-plan.md only. |
| Ten-project CAD-to-3MF/STEP/STL/AMF test | **NOT_RUN** | No project files were supplied or generated for testing. | Proposed: pilot lead selects tools/builds; run representative files through exact routes and compare size, units, geometry, parts, and placement to author notes. |
| Core / Materials extension import/export and preservation | **NOT_RUN** | 3MF Core 1.4.0, Materials 1.2.1, and compatibility-matrix documentation only. | Proposed: mark extension capability per tool/version, test source-to-receiver round trips, capture warnings/loss, and compare the visible result with the author note. |
| Preview and note visibility without author CAD | **NOT_RUN** | Standard allows optional thumbnails and Description; no app display inspected. | Proposed: open the outer package in the pilot's no-CAD review setup, confirm the PNG/note are readable and match model revision. |
| Import failure/error handling based on issue 8401 | **NOT_RUN** | Public issue/commit history only; attachment not retrieved. | Proposed: use a safely prepared no-geometry or invalid-package fixture with the selected receiver; confirm no empty import is reported as success. |
| 3MF conformance suite | **NOT_RUN** | Public suite repository 2.4.1 inspected but not downloaded or executed. | Proposed: apply only to the selected Core/extension subset; do not treat it as application-project or printer validation. |
| Printer operation or safety validation | **NOT_RUN / OUT OF SCOPE** | Brief prohibits printer operation and safety-critical design. | None proposed for this research stage. No print was sliced, exported, uploaded, or run. |

## Source and scope note

All source IDs, exact URLs, version/commit identifiers, locators, access-UTC records, observed operations, defaults/exceptions, and applicability limits are in [source-map.json](source-map.json). The index is [sources/index.md](sources/index.md). The source review is distinct from each proposed pilot check. No source lookup, format standard, or future test is presented as executed product validation.
