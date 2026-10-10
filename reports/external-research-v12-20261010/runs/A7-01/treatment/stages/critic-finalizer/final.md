# Research proposal: community workshop printable-project handoff

**Run:** A7-01-treatment / critic-finalizer  
**Research access date:** 2026-10-10 UTC  
**Purpose:** Plan a handoff for ten noncritical decorative projects so a member can review geometry, units, material intent and part relationships before any later slicing. This is a planning proposal, not an implementation or print instruction. It does not select a universal CAD or slicer. No installs, accounts, purchases, production access, printer operation or live writes were used.

## Recommendation

Use an app-neutral 3MF Core model as the normal design-intent handoff, with millimetres declared, a useful part list, expected overall dimensions and relationships recorded, and portable base-material labels where the exporter supports them. Use a purpose-bearing filename such as `widget.model.3mf` if the selected receivers accept it. 3MF Core 1.4.0 recommends `.model.3mf` for design-model data and reserves `.project.3mf` for a complete project with settings and metadata. This distinction can help a receiver tell a neutral model apart from an application project; retain a plain `.3mf` ending if a tested tool requires it. [S01](sources/S01-3mf-core.md)

Keep STEP as a second CAD-to-slicer route when the receiving application documents import and the pilot lead wants it in the tested matrix. Prusa documents that it triangulates STEP on import. A 2022 PrusaSlicer 2.5.0 report describes missing STEP geometry, and a September 2026 comment reports a similar case on an unnamed then-current Flathub beta. The beta build is unknown and neither report was reproduced here, so neither proves what stable 2.9.6 does. Require shape sentinels in the exact selected build before accepting that route. [S04](sources/S04-prusa-formats.md), [S05](sources/S05-prusaslicer-250.md), [S06](sources/S06-step-issue-8998.md)

Use Cura's Universal Cura Project (UCP) as an analogous application-project mechanism when the receiving workflow is Cura-specific. Cura 5.7.0 describes UCP as models plus settings and selected positional data for sharing with different printers. That is a Cura project claim, not a cross-slicer guarantee or approval of loaded printer settings. Keep a plain ZIP with a model, preview and note as a separate optional reviewer envelope; a ZIP wrapper has no 3D semantics of its own. [S11](sources/S11-cura-570-release.md)

Retain the package preview image and human-readable project note as authorized optional scope. Include a package thumbnail and short 3MF Description when the producer supports them; use a sidecar note and image if the chosen receiver does not preserve or display them. The image identifies the intended project; it does not validate dimensions, fit, geometry or printability. Do not make this option mandatory or exclude it without evidence. [S01](sources/S01-3mf-core.md)

Do not use STL as the project record. If a receiving tool needs an STL fallback, send it as limited geometry with units, dimensions, parts and material intent described separately. An STL does not preserve every project property. Keep slicer projects visibly separate from the design-intent handoff, and label them as app-specific examples rather than approved instructions for every workshop machine. [S02](sources/S02-fusion-mesh.md), [S03](sources/S03-fusion-export.md), [S04](sources/S04-prusa-formats.md), [S10](sources/S10-prusa-project-3mf.md)

## Released plan review: exact clause dispositions

| Plan clause | Draft treatment | Final disposition and treatment |
| --- | --- | --- |
| **1. Compare two CAD-to-slicer handoff routes and an analogous portable-package mechanism with clear interoperability tradeoffs.** | Made STL the project record; reconstructed units from filenames. | **Corrected.** Compare CAD→3MF Core and CAD→STEP→a documented slicer importer. Add Cura UCP as the analogous application-project mechanism; keep generic ZIP as a distinct human-facing wrapper. Treat STL as a constrained fallback only. |
| **2. Explain geometry units, object/assembly relationships, materials and application-specific settings; separate design intent from machine instructions.** | Named Cura/Prusa without defining package boundaries. | **Corrected and expanded.** Define units, component transforms, portable material intent, optional PrintTicket/application settings, STEP tessellation and the limit of neutral geometry; separate them from technician-selected printer settings. |
| **3. Identify supported optional preview or metadata capabilities without treating every extension as universally portable.** | Assumed settings portability and had no extension-loss rule. | **Option retained; portability presumption rejected.** Use optional Core thumbnail/Description fields conditionally, with sidecar fallback. Keep extension data optional and test the exact receiver. Do not claim a resolved Core/M&P version pairing. |
| **4. Investigate a relevant released importer/exporter issue or format-compatibility change and its effect on the pilot.** | Read no issue/release history. | **Corrected.** Include STEP history (#8998), unit/transform history (#15545), Cura position history (#19456) and the Cura release changes. Preserve report versions, later reported outcomes and their limits. |
| **5. Preserve and investigate the supported optional package preview image and human-readable project note.** | Repeated the authorization but had no technical evidence. | **Retained as optional and authorized.** Core permits a package thumbnail and model Description, but each exporter/receiver must be checked. A sidecar is a supported fallback; no evidence supports excluding the option. |
| **6. Make owner decisions explicit: author owns intended units/materials; technician owns printer settings; lead selects a tested receiving matrix.** | Repeated the roles but suggested the decisions were not obtained. | **Authority retained; input distinction corrected.** The authority split is already fixed by the brief. Exact per-project values and the pilot's tested app/version/mode matrix are still inputs to collect. |
| **7. Preserve negative constraints.** | Listed the constraints but did not trace assumptions against them. | **Binding constraints retained and applied.** No printer operation; no safety-critical design; no assumption that STL is complete; no saved slicer setting treated as approved for every machine. |
| **8. Deliver a complete evidence-backed proposal with recommendations, applicability, discovery, open inputs and separate validation status.** | Acknowledged the draft was incomplete; proposed only one-file/one-slicer acceptance. | **Completed as a proposal.** This document covers all clauses, alternatives, source/version applicability, retained options, ownership, uncertainty and a validation plan. Read-only research is not product validation; all product checks below remain proposed. |

## Handoff routes and package tradeoffs

| Route/mechanism | What it carries and where it helps | Interoperability limits and pilot conditions |
| --- | --- | --- |
| **A. CAD export → neutral 3MF model → selected receiving slicer** | A single package can carry triangle geometry, explicit units, object/component resources and transforms, base-material names, optional thumbnail and model metadata. Fusion documents export to 3MF with unit selection and one-file/all-bodies or one-body-per-file structure. Core defines an OPC/ZIP package and its 3D payload. | It is not editable CAD history, mates, constraints or an assembly procedure. Optional fields/extensions and app project settings can be lost, hidden or reinterpreted. Pin the exporter, receiver, version and operation; compare geometry, positions, names and reviewer material. [S01](sources/S01-3mf-core.md), [S02](sources/S02-fusion-mesh.md), [S03](sources/S03-fusion-export.md) |
| **B. CAD export → STEP → documented STEP importer** | A CAD exchange route for a receiver that accepts STEP. The receiver controls tessellation at import rather than inheriting an STL mesh chosen by the author. Fusion lists STEP as an export format; Prusa's help documents STEP import. | STEP protocol/export choices and the receiver's kernel/import path govern the result. Prusa documents triangulation at import. Check holes, thin features, body count, names and placement; a successful file-open is not a geometry pass. Issue #8998 includes reports against 2.5.0 and an unpinned 2026 beta. [S03](sources/S03-fusion-export.md), [S04](sources/S04-prusa-formats.md), [S06](sources/S06-step-issue-8998.md) |
| **C. Cura Universal Cura Project (UCP)** | A portable Cura project for a participant using Cura. The 5.7.0 release says it can carry models/settings and selected position data, with a different-printer sharing intent. | This is a Cura workflow, not an app-neutral cross-slicer project. UCP settings remain application/machine-context data and do not replace the technician's choice. Cura 5.7.0 says loading saved positions differs from “Import Models,” which ignores them, and recommends starting a new project after a UCP to reset its settings. Test project-open and model-import separately. [S11](sources/S11-cura-570-release.md) |
| **D. Outer ZIP with model, preview and note** | A simple reviewer envelope can group the neutral model and a readable note/image for someone without the authoring CAD tool. | ZIP alone has no 3D semantics and does not become slicer-importable by containing files. Keep one authoritative model to avoid stale duplicate copies. Open its members with the selected tools. This is packaging convenience, not a competing CAD exchange format. |
| **Limited fallback: STL** | Useful when a receiver only accepts mesh geometry. Fusion exposes explicit export units; Prusa accepts binary and ASCII STL. | STL has no common unit declaration, component hierarchy, project note or slicer-independent material assignment. Supply unit and dimensions separately. Never treat it as the complete project record. [S02](sources/S02-fusion-mesh.md), [S04](sources/S04-prusa-formats.md) |

**Pilot default:** Route A for design intent. Include B only where the lead's receiver matrix shows STEP adds value. Use C for a tested Cura workflow. D can make the handoff readable outside CAD/slicer tools. Do not claim universal compatibility from any passing cell.

## Meaning to carry between applications

### Units and geometry

3MF Core defaults an omitted model unit to millimetres; the spec permits micron, millimetre, centimetre, inch, foot or metre. Set millimetres explicitly for the pilot and repeat the unit plus expected overall bounds in the note. Fusion's mesh-export workflow exposes its own unit choice. [S01](sources/S01-3mf-core.md), [S02](sources/S02-fusion-mesh.md)

A PrusaSlicer 2.9.6 issue report gives a concrete reason to check transforms as well as mesh size: the reporter says inch vertex coordinates were converted but build-item/component translation values were not, placing geometry off-plate. The issue was closed after an inactivity warning and links no repair; this remains a version-specific report, not independent verification or proof about later builds. Exporting in mm and comparing bounds and placement reduces this pilot risk. [S07](sources/S07-unit-issue-15545.md)

### Objects, names and assembly relationships

3MF Core supports named object resources and component references with transforms. A manufacturing device must respect the relative position of component objects. These fields describe composition and placement; they do not supply native CAD constraints, mates, fit tolerances, feature history or an assembly procedure. The note should list each part, expected name, quantity, position/relationship, and whether parts are reviewed as positioned, separate, interlocked or assembled after printing. [S01](sources/S01-3mf-core.md)

Do not assume an application keeps Core names or a vendor's private project labels. Cura issue #17110 is a user report that incoming Core `object.name` values were ignored, with no exact Cura release stated. PrusaSlicer issue #15662 concerns Bambu-specific `model_settings.config` names rather than Core names and identifies 3.0.0-alpha11. In either case use a human-readable part list and test exact producer/receiver/mode. [S08](sources/S08-bambu-names-issue.md), [S13](sources/S13-cura-object-name-issue.md)

Position is operation-specific too. Cura 5.7.0 says its project load uses saved positions while “Import Models” ignores them. Cura issue #19456 began as a 5.7.2 report; later comments mention problems in 5.8.0, 5.8.1 and 5.9 and distinguish Open Project from Import Models. On 2025-03-26 the reporter said the same sample saved and loaded correctly in Cura 5.10.0 and closed the issue completed. The issue page retains duplicate/under-investigation labels in its metadata, but that does not erase its later activity. No branch or PR is linked, so the specific correction mechanism is unknown. Cura 5.14.0-alpha.0 later notes a positioning improvement for multiple models from a non-project 3MF; it is a pre-release and does not claim to fix the exact issue. [S11](sources/S11-cura-570-release.md), [S12](sources/S12-cura-3mf-position-issue.md), [S14](sources/S14-cura-releases.md), [S17](sources/S17-cura-514-alpha.md)

### Material intent, display and extensions

Core base-material names are intended to convey design intent; producers should prefer portable descriptions over machine-specific names. Core explains that material can be set at object/surface level and the print consumer maps it to actual print materials. A display color supports rendering, not a promise about the material/color that will be printed. The project author owns intended units and materials; the workshop technician selects available materials and printer settings for a machine. [S01](sources/S01-3mf-core.md)

Core's optional PrintTicket is governed by the particular consumer environment; if absent or unsupported, the consumer applies its own defaults. Prusa project 3MF may instead snapshot objects, settings, modifiers and parameters, while Cura UCP carries its own project settings. Label any such artifact as app-specific. It is not approved machine instruction for every workshop printer. [S01](sources/S01-3mf-core.md), [S10](sources/S10-prusa-project-3mf.md), [S11](sources/S11-cura-570-release.md)

The 3MF index lists Materials and Properties v1.2.1 as the published full-color/multi-material extension. Its own preface says it must be used only with Core 1.2, while the current index lists Core 1.4.0. This proposal cannot resolve that version-pair question from the index alone. Keep the extension out of the pilot baseline unless current authoritative guidance and the exact receiver matrix resolve it. Core base-material names remain the simple design-intent path. [S09](sources/S09-3mf-spec-index.md), [S16](sources/S16-3mf-materials-extension.md)

### Optional preview and readable project note

The 3MF Core package can contain an optional JPEG/PNG package thumbnail, and model metadata includes a Description field. The spec says thumbnails can be exposed by external agents; it does not require every slicer to show or preserve them. For each project, the author may include a preview that identifies the intended geometry and a concise note with: project/revision and author; explicit unit and expected bounds; names/quantities and relationships; intended materials; fit/assembly notes; source exporter/version; and the statement that machine settings remain the technician's choice. If the app does not surface the metadata or image, retain the authorized option through a sidecar README and image. A preview is not measurement or print validation. [S01](sources/S01-3mf-core.md)

## Compatibility history and version applicability

| Evidence | Observed external record and limit | Effect on pilot |
| --- | --- | --- |
| PrusaSlicer STEP introduction and #8998 | Release 2.5.0 (tag commit `ec2f533`) introduced STEP import. The original issue reports 127 open edges and a missing hinge/conical detail with a 2.5.0 STEP import. A Sep 18 2026 commenter reports the same Owl case on the then-current Flathub beta with default import settings but gives no exact version. No attachment or binary was tested here. [S05](sources/S05-prusaslicer-250.md), [S06](sources/S06-step-issue-8998.md) | Keep STEP conditional; compare bounds, openings, thin features, part count and mesh warnings in the chosen stable receiver. The recent beta comment increases the reason to test but cannot be attributed to stable 2.9.6. |
| PrusaSlicer #15545 unit/transform report | Specific 2.9.6 Windows portable reproducer says non-mm translation terms are not scaled. Closed for inactivity without a linked fix. [S07](sources/S07-unit-issue-15545.md) | Use mm output and compare known bounds and plate-relative position; include a non-mm translated case only as a controlled test. |
| PrusaSlicer #15662 cross-slicer names | PrusaSlicer 3.0.0-alpha11 report says Bambu Studio names were stored in private project metadata and not imported. It is not about Core `object.name`; the issue was converted to a discussion. [S08](sources/S08-bambu-names-issue.md) | Use standard Core names plus note; do not expect private settings/name formats to transfer. Check the exact receiver. |
| Cura 5.7 and #19456 | Release 5.7.0 (tag commit `04ddb8e`) distinguished project-load saved positions from Import Models. Issue #19456 reports a 5.7.2 problem and later version/mode outcomes; the reporter marked the specific sample fixed in Cura 5.10.0. [S11](sources/S11-cura-570-release.md), [S12](sources/S12-cura-3mf-position-issue.md) | Test the exact import operation. Do not describe #19456 as unresolved; also do not generalize the 5.10.0 example to every multi-object package. |
| Current version snapshot | At access, Cura's index showed 5.13.0 stable/latest (commit `1fb8a76`) and 5.14.0-alpha.0 (commit `17e7b05`); the alpha notes a non-project multi-model positioning improvement. PrusaSlicer showed 2.9.6 stable/latest (`b028299`) and 3.0.0-alpha12 (`30ef591`). [S14](sources/S14-cura-releases.md), [S15](sources/S15-prusaslicer-releases.md), [S17](sources/S17-cura-514-alpha.md) | Ask the lead to select exact stable builds and modes. Treat the Cura alpha note as a future test lead, not an acceptance result. Recheck release lists at matrix selection. |

## Owner decisions, covered scope and open inputs

The authority split below comes directly from the brief; the open inputs are project values and matrix selections, not unresolved authority.

| Owner | Fixed authority | Inputs for this pilot |
| --- | --- | --- |
| Project author | Intended units and materials. | Supply each project's unit, expected bounds, intended material meaning, parts/names, relationships, and optional note/preview. |
| Workshop technician | Printer settings. | Any later printer-specific profile/material/nozzle/bed/temperature/support choices. No such settings are approved by this handoff. |
| Pilot lead | Chooses a tested receiving-tool matrix; does not claim universal compatibility. | Pick exporter and exact version, stable receiving apps/versions/import modes, acceptance tolerances and whether STEP or UCP add enough value for ten projects. |

**Already covered by the released plan and retained:** ten noncritical decorative projects; assigned owners; no printer operation; no safety-critical parts; no claim that STL is complete; no universal approval of saved slicer settings; optional preview/note authorized but not mandatory.

**Rejected draft assumptions:** STL as full project record; reconstructing units from a filename alone; treating UCP or slicer settings as universal printer instructions; assuming every receiver preserves names, transforms, thumbnails, notes or extensions; passing one file in one mode as universal compatibility; dropping the authorized preview/note without evidence.

**Unresolved:** exact project geometry/material inputs; selected export and receiving versions/modes; acceptance tolerances; whether each receiver exposes/preserves optional metadata; the exact build in the 2026 STEP beta report; and the Core 1.4.0 / M&P 1.2.1 pairing. These uncertainties do not prevent a conditional planning recommendation. The lead can keep M&P rich material data outside the baseline until the specification pairing is clarified.

## Validation plan and execution record

### Product checks

| Check | Status | Proposed method / acceptance condition |
| --- | --- | --- |
| CAD export, slicer import, archive inspection, geometry/bounds comparison or print | **NOT RUN** | No product app or package was operated. No printer is to be operated in this research/pilot planning stage. |
| Receiving-tool matrix | **PROPOSED** | For each selected cell, log CAD exporter/version, output type, receiver/version and exact mode (for Cura, Open Project vs Import Models). A passing cell only supports that cell. |
| Units and transforms | **PROPOSED** | Compare a known-mm example and a deliberate non-mm/translated sentinel in each selected route. Check bounds and relative/plate position against the note with a lead-approved tolerance. Record warnings; route failure constrains or rejects that cell. |
| Object/assembly behavior | **PROPOSED** | Include one body and one multi-part positioned example. Compare count, names, transforms and stated relationship after import. Make clear whether the operation opens a full project or imports geometry. |
| STEP shape | **PROPOSED** | For any STEP matrix cell, use representative small holes, thin features and multipart geometry; compare bounds and inspect mesh/open-edge warnings. A file opening is not a pass. |
| Names, materials and extensions | **PROPOSED** | Check Core names/base-material labels in the selected app. Record vendor-private metadata separately. Use M&P only after its Core-version condition and receiver support are resolved. Record ignored or warned extension data; do not silently count it as preserved. |
| Preview and note | **PROPOSED** | Include optional JPEG/PNG thumbnail and Description where available. Check the chosen receiver's display/preservation and that a reviewer can read sidecar note/image without CAD. This does not validate geometry. |
| Slicer settings isolation | **PROPOSED** | In a later controlled review, record what a Cura UCP or Prusa project loads/resets in the intended app. Keep settings identified as app-specific. Do not slice, send or treat them as technician-approved. |

### Research and stage-control status (not product validation)

| Operation | Status | Evidence and boundary |
| --- | --- | --- |
| Read frozen brief, exact revealed plan, complete investigator discovery/draft/source map and full carried source index | **EXECUTED** | Read from the immutable handoff copies specified in the input map. Their bytes are not evidence of product truth. |
| Independent primary-source review | **EXECUTED — research only** | Official 3MF, Autodesk, Prusa and Cura specifications/help/release/issue pages S01-S17 were opened read-only. No issue attachment, source archive, application or product package was executed. |
| Frozen handoff byte check | **MANUAL CHECK PASSED: 26/26 paths** | Python standard-library SHA-256 and byte-count comparison against the stage freeze record, restricted to brief/predecessor paths listed by input-map plus this assignment/input-map. Live predecessor files were not read. `input-integrity.json` records each result. This is not the official intake gate. |
| Official `check-input --config ... --stage critic-finalizer` intake gate | **UNAVAILABLE / NOT PASSED** | The exact requested command returned `/bin/bash: check-input: command not found`; do not treat the manual check as a gate receipt. |
| `freeze-review --stage critic-finalizer` | **UNAVAILABLE / NOT PASSED** | Attempted before `final.md` existed; returned `/bin/bash: freeze-review: command not found`. |
| Native Goal activation | **EXECUTED — directly observed active** | One Goal was created with the exact objective in critic-finalizer `freeze.json`; actual native fields are preserved in `goal-activation.json`/the fresh pre-seal observation when saved. This is not product validation. |
| `seal-final --stage critic-finalizer` | **UNAVAILABLE / NOT PASSED** | A fresh active `get_goal` response was saved to `goal-preseal.json` and piped to the command; it returned `seal-final: command not found`. No seal or native Goal completion is claimed. |

This report is a research proposal, not a local product acceptance result. Every product check marked proposed remains **PROPOSED / NOT RUN**.

## Source navigation

Use the local [source index](sources/README.md) to navigate bounded notes S01-S17. [source-map.json](source-map.json) contains exact URLs, version/commit, locators, access UTC, observed operation, conditions and applicability. `checks.json` records only source operations actually run. `critique.md`, `critique-index.json` and `critique-dispositions.json` preserve the independent review and its final disposition.
