# Community workshop printable-project handoff

**Stage:** ER12 reviser, run A7-01-control  
**Scope:** planning proposal for a pilot of ten noncritical decorative projects. This is not an implementation, product validation, print recipe, or machine approval.  
**Evidence navigation:** [source index](sources/index.md); [complete source identities, review checks, and dispositions](source-map.json).

## Recommendation

Use a geometry-oriented 3MF model as the pilot's default CAD-to-slicer handoff when the author's exporter and the receiving tool have been tested together. Package it in an ordinary folder or ZIP with an optional human-readable project note and preview PNG. Keep those sidecars available to reviewers without the author's CAD tool, whether or not a receiving app displays embedded metadata. Offer STEP as a secondary CAD-review or direct-import route when the selected receiver supports it; PrusaSlicer 2.9 documentation says it triangulates STEP on import. Permit STL only as a labeled fallback with declared units, key dimensions, and a receiving-size check. Keep AMF as a bounded legacy comparator, not the default.

Use `.model.3mf` for an author-provided design model. A technician-created slicer project or printer-prepared build is a separate, application-specific artifact and should be labeled accordingly (for example, `.project.3mf` or `.build.3mf`). These are recommendations in the 3MF Core 1.4.0 naming section, not a guarantee that every application follows them. Keep the author's design intent separate from machine instructions: the author supplies intended units and materials; the workshop technician owns printer settings; the pilot lead selects the tested receiving-tool matrix and limits compatibility claims to that matrix.

The optional Materials and Properties extension must not be assumed to pair with Core 1.4.0: its published 1.2.1 text says it is used only with Core 1.2, while the 3MF conformance-suite repository lists Core 1.4.0 and Materials 1.2.1 among the versions used by its suites. This remains an unresolved primary-source discrepancy. It does not affect a Core-only 3MF route. Do not rely on that extension/version combination until the Consortium clarifies the target and the chosen producer/receiver pair is tested. [S01](sources/index.md#s01) [S02](sources/index.md#s02) [S15](sources/index.md#s15)

## Brief and released-plan crosswalk

The eight exact obligations below are from the complete brief. The released plan is a fallible draft; its product and compatibility statements were not treated as evidence. The disposition for each obligation applies both to the brief and the matching plan clause.

### 1. “Compare two CAD-to-slicer handoff routes and an analogous portable-package mechanism with clear interoperability tradeoffs.”

**Plan disposition:** Correct the assumption that STL plus a filename is a complete record. Compare the two routes and the container/wrapper tradeoffs in the next section. The plan's tentative PrusaSlicer/Cura leads remain candidates, not selections.

### 2. “Explain geometry units, object/assembly relationships, materials and application-specific settings; separate design intent from machine instructions.”

**Plan disposition:** Constrain its tool list to candidates and distinguish the properties each route can express from what a specific application preserves. The author owns intended units/materials; the technician owns receiving-machine settings. No format or saved slicer project is treated as a universal instruction.

### 3. “Identify supported optional preview or metadata capabilities without treating every extension as universally portable.”

**Plan disposition:** Correct the assumption that settings travel to every printer and that extension loss needs no record. Core 3MF permits optional thumbnails and document Description; extension support, metadata display, and preservation are consumer-dependent. Record observed losses in the pilot matrix.

### 4. “Investigate a relevant released importer/exporter issue or format-compatibility change and its effect on the pilot.”

**Plan disposition:** Replace the unresearched single-open demo with the bounded 2022 FreeCAD/PrusaSlicer issue and linked importer error-handling change. It is a historical regression case, not a current-defect claim. Exact attachment contents and first stable fixed releases remain unverified.

### 5. “Preserve and investigate this supported optional scope: a package preview image and human-readable project note for reviewers without the author’s CAD tool. It is an authorized option, not a mandatory feature or an established technical capability; recommend conditions, retain it when supported, and explain any evidence-based exclusion.”

**Plan disposition:** Retain as optional scope, not a mandatory technical requirement. The Core 1.4.0 specification permits optional JPEG/PNG package or object thumbnails and Description metadata. Provide a sidecar PNG and readable note as the review path; embed those fields only when the exact exporter/receiver supports them. No evidence-based exclusion is supported.

### 6. “Make owner decisions explicit: The project author owns intended units and materials; the workshop technician owns printer settings. The pilot lead selects a tested receiving-tool matrix rather than claiming universal compatibility.”

**Plan disposition:** Preserve these binding roles. The actual units/materials are author inputs, the actual machine setup is the technician's decision, and the pilot lead selects versions/builds and determines which compatibility wording results justify.

### 7. “Preserve negative constraints: Do not operate printers, design safety-critical parts, assume STL preserves every project property, or treat saved slicer settings as approved instructions for every machine.”

**Plan disposition:** Keep all four exclusions binding. Research and proposed pilot checks do not operate a printer; pilot scope remains decorative and noncritical. STL is incomplete, and any saved slicer project remains tied to its chosen tool and machine configuration.

### 8. “Deliver one coherent evidence-backed research proposal covering obligations 1–8, with recommendations, source/version applicability, useful discoveries, unresolved owner inputs, and a validation table separating checks actually executed from checks merely proposed. Do not report research sources or future tests as executed product validation.”

**Plan disposition:** This complete proposal replaces the released plan's incomplete draft treatment. Source observations, local hash verification, direct source rechecks, product checks, and future pilot validations are labeled separately below. No future validation is reported as run.

## Handoff and portable-package comparison

| Route or mechanism | What it carries | Interoperability tradeoff | Pilot use |
| --- | --- | --- | --- |
| **CAD mesh export → 3MF model → slicer geometry import** | 3MF Core defines a unit-qualified model, objects/build items, component references/transforms, optional metadata and thumbnails, and an optional consumer-governed PrintTicket. Fusion documents exporting bodies/components to 3MF. | More explicit structure and review context than STL, but still a manufacturing mesh, not the author's feature history or full CAD assembly semantics. Components/placement depend on receiving implementations. PrintTicket meaning follows the consumer; absent or unsupported settings leave defaults to that consumer. | Default geometry route, conditional on exact exporter/receiver testing. Use a `.model.3mf` label plus note/preview sidecars. Do not include printer settings as universal instructions. [S01](sources/index.md#s01) [S04](sources/index.md#s04) [S05](sources/index.md#s05) |
| **CAD exchange → STEP → receiving CAD or supported slicer** | A neutral CAD exchange representation; a CAD receiver can inspect the exchanged solid geometry. Fusion says export loses associativity to the source design. PrusaSlicer 2.9 docs say STEP is triangulated during direct import. | Better suited than a triangle mesh for CAD-oriented shape review, but exact protocol/export choices and preservation of assembly, material, and authoring details vary and were not established across all tools. A direct slicer import crosses into triangulated geometry. No native feature history is promised. | Secondary review/import route where the pilot's exact receiver supports it. Test dimensions, units, part count, and placement. Ask for a native CAD file separately if editable history is required and sharing it is appropriate. [S05](sources/index.md#s05) [S07](sources/index.md#s07) |
| **Portable package: 3MF ZIP/OPC plus an ordinary folder/ZIP wrapper** | A `.3mf` is itself a ZIP/OPC package with defined internal parts and relationships. An outer folder/ZIP can contain the model, a readable note, and a PNG. | Internal 3MF fields are standardized but optional fields may be ignored or not shown by an application. Sidecars are accessible without CAD, but are not automatically interpreted by a slicer and can become detached from a model revision. Keep identifiers/revision consistent and test the no-CAD review path. The wrapper is a local packaging choice, not a new standard. | Preferred portable reviewer package. Include a project/revision identifier, model filename, declared units/dimensions, and revision on the note and preview. Embed a Core thumbnail/Description only when tested. [S01](sources/index.md#s01) |
| **AMF 1.2 or STL fallback** | AMF is a formal XML/XSD-based additive-manufacturing alternative; PrusaSlicer 2.9 imports AMF but recommends 3MF. STL is a broad surface-mesh fallback. | The public AMF abstract is limited and the full paid standard was not reviewed; one old issue reports an AMF placement difference. STL carries no unit contract and does not preserve every project property. A successful import alone does not establish scale or placement. | Keep AMF for a bounded legacy comparison if members supply it. Allow STL only with declared units/key dimensions and visual size check. Do not call either a full project record. [S06](sources/index.md#s06) [S07](sources/index.md#s07) [S11](sources/index.md#s11) [S13](sources/index.md#s13) [S14](sources/index.md#s14) [S17](sources/index.md#s17) |

**Useful portable-format discovery:** Core 1.4.0 recommends role-specific names: `.model.3mf` for design models, `.project.3mf` for projects, `.build.3mf` for printer-prepared build plates, and other roles for toolpaths/slices. This makes the distinction visible to people and software before opening a file. It is a naming recommendation; the selected tools still need to be checked. [S01](sources/index.md#s01)

## Information, intent, and machine settings

### Units and geometry

3MF Core 1.4.0 §3.4 defines the `unit` model attribute; millimeter is the default and allowed values also include micron, centimeter, inch, foot, and meter. Producers/consumers use that resolution for model coordinates. STL is unitless; receiver defaults are application behavior and can cause scale errors. Require an explicit unit statement and one or more key dimensions in the human-readable note even when the model format encodes units. Check received dimensions against that statement before slicing. [S01](sources/index.md#s01) [S06](sources/index.md#s06)

### Objects, parts, and assembly relationships

3MF can describe object resources, build items, component references, and transforms. The Core requires consumers to respect component relative positions, but a particular export/import pair still needs testing. A mesh exchange should not be described as preserving the entire native parametric tree. Fusion components may nest bodies and subcomponents or refer to external designs that become unresolved if the linked source or permissions are missing. The author's note should list each part/object name and count, whether it is separate, assembled, interlocked, or post-assembled, the intended fit/clearance or joining method, and any known omitted relationships. Ask the author to resolve ambiguous intent. [S01](sources/index.md#s01) [S19](sources/index.md#s19)

### Material intent

The author supplies intended material/substance and appearance for each part; the technician selects the actual printer material or spool/preset. Core base-material names are intended to express design intent, while `displaycolor` is a rendering cue, not a guarantee of printed color. Materials and Properties 1.2.1 offers richer color/texture/composite properties as an extension, but extension-version applicability is unresolved here and application support is not universal. Therefore use the note as the authoritative human-readable intent for this pilot; use extension data only after the official pairing is clarified and the exact pair is tested. Do not imply that a material name means the receiving shop has that material loaded. [S01](sources/index.md#s01) [S02](sources/index.md#s02) [S03](sources/index.md#s03)

### Application-specific settings

A 3MF PrintTicket may carry settings, but its semantics are governed by the consumer environment. If absent or unsupported, the consumer may apply its own defaults. A Prusa project 3MF can store objects, settings, modifiers, and parameters for the corresponding Prusa workflow; Prusa's public 3.0 preview describes asymmetric settings compatibility and geometry-only import of third-party 3MF. That 3.0 source is an unfinished alpha, not a stable pilot baseline. These are reasons to label settings by application/version and to test; they do not show that settings travel across slicers or machines. The technician owns printer, nozzle, bed/build volume, material preset/spool, orientation, supports, temperatures, and process settings for the actual receiving machine. Any technician-created project/build remains machine- and application-specific. [S01](sources/index.md#s01) [S08](sources/index.md#s08) [S09](sources/index.md#s09) [S10](sources/index.md#s10) [S18](sources/index.md#s18)

## Optional preview and reviewer note

Retain the brief-authorized preview-image and human-readable note option. Core 3MF allows optional package/object PNG or JPEG thumbnails and well-known metadata such as Title, Designer, and Description. This establishes a format capability, not that a given file browser or slicer displays it. Put a sidecar PNG and README-style note in the outer folder/ZIP so reviewers without the author's CAD tool can open them. Where the exact exporter/receiver pair supports embedded thumbnail/Description, include those too and record observed display/preservation. Do not promote the option to mandatory functionality or exclude it because one baseline route lacks embedded support. [S01](sources/index.md#s01) [S03](sources/index.md#s03)

The note should identify project/member and revision/date; source CAD/exporter and version; explicit units and key dimensions; object/part names and count; assembly/fit relationships; intended material/appearance by part; known omissions and exceptions; and exact receiving-tool/version checks already completed. Mark it **design and review context — technician sets printer process**, not print approval. Keep the sidecar revision aligned with the model; sidecar usability and cross-reference remain proposed pilot checks.

## Bounded released issue and pilot effect

PrusaSlicer issue 8401 records a June 2022 report using FreeCAD 0.20 export and PrusaSlicer 2.4.2+arm64 on macOS 12.4: the reporter said the 3MF import failed silently, an AMF from the same attachment loaded at (0,0) rather than centered on the bed, and STL loaded as expected. A Prusa maintainer called the 3MF incorrect and said an error message would be added; commit 040a846 is linked in the issue and changes the importer result so neither loaded model objects nor configuration counts as success. The reporter later attributed FreeCAD's exporter correction to a leading backslash (`\`). The maintainer's comment says only “the slash shouldn't be there,” which is ambiguous in isolation: Core 1.4.0 says 3MF part names are absolute paths beginning with `/`, so a normal leading forward slash is not itself invalid. The issue attachment was not retrieved, so its exact bytes and path context were not independently inspected. No first stable FreeCAD or Prusa release containing the correction was established. Treat this as a historical, version-bounded report, not evidence of a current defect. [S01](sources/index.md#s01) [S11](sources/index.md#s11) [S12](sources/index.md#s12)

**Pilot effect (proposal):** test the exact author exporter and receiving build chosen by the pilot lead; confirm visible geometry, expected dimensions/units, object/part count and placement; record warnings and failure behavior. Use a controlled invalid/no-geometry fixture only if the pilot lead chooses to add it. Do not silently substitute AMF/STL after failure; record the change and re-check scale and origin. The issue's reported AMF behavior is a boundary example, not a universal AMF limitation.

## Explicit owner decisions and open inputs

- **Project author:** intended units and materials, key dimensions, appearance, part names, and assembly/fit intent; resolves ambiguous design intent.
- **Workshop technician:** printer-specific setup, actual material preset/spool, and slicer settings for the receiving machine; determines whether to create a distinct slicer project/build artifact.
- **Pilot lead:** receiving-tool matrix, including exact CAD exporters, slicers, versions/builds and relevant OS; determines which compatibility claims actual results justify.

Unresolved inputs are the CAD tools and builds members actually use; the receiving matrix; the ten project files' geometry/assembly/material characteristics; the exact STEP protocol/export options members need; whether authors will share native CAD files; acceptable dimension/placement tolerances; and which selected applications preserve or display optional metadata/previews. These owner inputs remain explicit decisions. They do not defer public research already addressed here.

The 3MF compatibility matrix can seed candidate discovery (including Cura, FreeCAD, Fusion 360, OrcaSlicer, Bambu Studio, and PrusaSlicer), but its entries are vendor-reported and not independently verified; core and extension columns are separate and some entries are partial/custom. It is not the pilot's selected matrix. AMF's full paid text was not inspected. The exact supported extension/Core pairing remains unresolved. [S03](sources/index.md#s03) [S13](sources/index.md#s13)

## Critique dispositions

| Criticism | Disposition | Evidence and effect |
| --- | --- | --- |
| **C1 — Materials extension/Core version pairing is incomplete.** | **Accept; preserve uncertainty.** | Direct review of S02 confirms its published Materials 1.2.1 text says it is used only with Core 1.2. S15's published 2.4.1 README lists Core 1.4.0 and Materials 1.2.1 among suite versions, and marks suites 2 and 6 as covering both Core and Materials. The README does not reconcile that with S02's explicit restriction. The combination is not established as valid; don't rely on Materials 1.2.1 with Core 1.4.0 until the Consortium clarifies. Keep rich material properties optional; the Core-only default and the authorized preview/note option remain. [S02](sources/index.md#s02) [S15](sources/index.md#s15) |
| **C2 — Add the Core unit locator.** | **Accept.** | Direct review confirms S01 §3.4 Model attributes, table, states millimeter as the default and lists all permitted units. The final locator now names §3.4 as well as package/component/property sections. [S01](sources/index.md#s01) |
| **C3 — Clarify “slash/backslash” in the issue summary.** | **Accept; amend the interpretation.** | S11's reporter says the FreeCAD correction addressed a leading `\`; the maintainer's separate “slash” phrase is generic. S01 §2.2.3 requires absolute part names beginning `/`. Since the issue attachment was not retrieved, the actual file bytes remain unknown. The final history does not imply a valid leading `/` is an error. [S01](sources/index.md#s01) [S11](sources/index.md#s11) |
| **C4 — The claimed release-receipt is outside the frozen input map.** | **Accept; remove the unsupported trace claim.** | Do not read or rely on `release-receipt.json`. The supplied `plan-reveal.json` contains the discovery and revealed-plan hashes; a local SHA-256 check of those two listed files matches both recorded values. This is only a process/hash check, not product validation. [plan-reveal.json](../investigator/plan-reveal.json) |

## Validation status and proposed pilot checks

“Executed” below means the action actually occurred in this research stage or is directly recorded by the predecessor source maps. It does not mean a product was validated.

| Check | Status | Evidence or result | Proposed next action |
| --- | --- | --- | --- |
| Public source review | **EXECUTED — research only** | Predecessor source maps record read-only opens/finds. This reviser directly reopened the version-pinned Core, Materials extension, conformance-suite README, and issue 8401. The full paid AMF standard, a CAD/slicer app, a 3MF file, and a printer were not inspected/operated here. | Use exact releases/builds when the pilot lead selects a matrix; public documentation is not product validation. |
| Frozen discovery/plan hash check | **EXECUTED — local process check** | `plan-reveal.json` hashes match the supplied `discovery.md` and `revealed-plan.md`. No release-receipt file was read. | Retain this as process integrity only. |
| Ten-project route comparison (3MF/STEP/STL/AMF) | **NOT_RUN** | No pilot project files or applications were supplied or opened. | Lead selects exact exporter/receiver builds; compare declared and imported dimensions/units, geometry, object/part counts, names, and relative placement across representative samples. |
| Core and Materials extension import/export/preservation | **NOT_RUN** | Read format docs and suite listing only. Materials 1.2.1/Core target discrepancy remains unresolved. | First obtain authoritative version clarification. Then test exact producer/receiver version pairs and record warnings, ignored/lost extension data, and visible output. Do not use the conformance suite to claim application interoperability. |
| Preview/note access without author CAD | **NOT_RUN** | Standard permits optional thumbnail and Description; no display app or pilot package was tested. | Test embedded and sidecar preview/note using the pilot's chosen no-CAD review setup; verify revision/model identity and record what is shown or ignored. |
| Historical invalid-import behavior | **NOT_RUN** | Issue and code history were read; attachment was not retrieved and no fixture was made. | If useful, prepare a controlled no-geometry/invalid-package fixture, test exact receiver error handling, and record recovery; do not infer a current defect from the 2022 report. |
| 3MF conformance suite | **NOT_RUN** | Repository version listing and suite coverage were read; nothing downloaded or run. | Consider a format-level suite only after selecting Core/extension versions and resolving C1; it cannot replace application/project tests. |
| Printer operation or safety-critical validation | **NOT_RUN / OUT OF SCOPE** | No printer use or safety-critical part is authorized by the brief. | None for this stage. If later pilot work includes review in a slicer, keep it at the authorized noncritical scope and do not treat saved settings as universal approval. |

**Priority for the pilot:** (1) lead selects actual receiving tools/builds and authors provide design intent; (2) compare representative 3MF and STEP samples for size, units, objects, placement, and assembly note; (3) assess optional preview/note access and metadata/extension retention, resolving C1 before Materials-extension claims; (4) record import warnings/failure behavior and any controlled regression check; (5) publish compatibility only for versions actually exercised. None of these future checks is represented as complete.

## Evidence and scope limits

The source statements are bounded by each source's exact version, locator, conditions, and limits in [the source index](sources/index.md) and [structured map](source-map.json). Recommendations are inferences and local pilot choices, not external-source facts. Direct reviser checks were selective (S01, S02, S11, S15); other identities and observations are carried forward without rebinding from the investigator map, with critic review records retained separately. No CAD/slicer product, sample package, or printer validation was performed. No source file was downloaded; no application or account was installed, created, or used for this proposal.
