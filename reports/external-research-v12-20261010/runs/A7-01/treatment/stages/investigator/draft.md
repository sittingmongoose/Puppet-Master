# Planning proposal: community workshop printable-project handoff

**Run:** A7-01-treatment / investigator  
**Research date:** 2026-10-10 UTC  
**Scope:** a proposal for a ten-project, noncritical decorative pilot. This is not an implementation or a print instruction. Source IDs link to bounded notes in sources/; source-map.json records exact URLs, versions, locators, access UTC, operations, conditions, and applicability.

## Recommendation

Use an app-neutral 3MF geometry package as the normal handoff, with explicit millimetre units, named objects/components, and portable material-intent labels. Include a package thumbnail and human-readable note as optional, authorized reviewer support. Add a sidecar README when a receiving app does not display the note. Keep slicer settings out of the canonical design-intent record; any slicer project supplied for review must be marked as an application-specific example, not approved printer instructions.

Keep STEP as a second CAD-to-slicer route where the receiving slicer documents direct import and the pilot wants the receiving app to generate the mesh. PrusaSlicer documents STEP import but triangulates it during import. Do not make STL the project record. Cura’s Universal Cura Project is a useful analogous project-package option within a Cura workflow, but the release describes it as containing models and settings; it is not a cross-slicer standard. The pilot lead must select and test exact receiving versions and import modes before calling any route accepted.

No product import, package inspection, geometric comparison, or print was executed for this proposal. The cited release notes, specifications, product help, and issues are external research evidence only.

## 1. Exact per-clause disposition of the released plan draft

| Clause | Released draft treatment | Disposition | Complete proposal treatment |
| --- | --- | --- | --- |
| 1. Two CAD-to-slicer routes and analogous package | “Export STL as the complete project record”; units reconstructed from the filename; material names kept verbal. | **Corrected; STL-as-record rejected.** | Compare CAD→3MF, CAD→STEP→supported slicer importer, and a project-package analogue. Use explicit 3MF units/objects/material intent; keep UCP or a generic bundle conditional on exact receiver and workflow. |
| 2. Units, objects/assemblies, materials, settings | Lists Cura and PrusaSlicer without establishing package boundaries; richer format left unspecified. | **Corrected and expanded.** | Explain 3MF unit, object, component, material-intent and PrintTicket limits; explain STEP triangulation in PrusaSlicer; distinguish design intent from slicer/machine settings. |
| 3. Preview/metadata and extensions | Keeps preview and note, assumes shared package settings are portable to every printer, and proposes no extension-loss behavior. | **Option retained; portability presumption rejected.** | Retain optional preview and note, grounded in 3MF Core thumbnail and Description fields. Check if the chosen app preserves/displays them; make no universal extension or settings claim. |
| 4. Released compatibility history | No source history reviewed; proposes opening a single file in one slicer as the only acceptance check. | **Corrected; proposed check is inadequate.** | Use Cura 5.7.0’s released UCP/3MF position behavior and its Import Models exception, plus Cura issue #19456; use PrusaSlicer 2.5.0 STEP-import history and issue #8998. Use recent unit/name reports as bounded warnings. Build representative tests across the selected matrix. |
| 5. Authorized optional preview/note | Repeats the brief’s full option language, including that it is authorized but not mandatory or technically established. | **Retained as written in scope.** | Retain this option; recommend standardized metadata plus readable sidecar fallback. Do not promote it to mandatory for every package or exclude it without evidence. |
| 6. Decision ownership | Repeats the three owner authorities, then says the draft has not obtained these decisions and assumptions cannot replace them. | **Authority retained; distinction corrected.** | The brief already fixes who owns each decision. Exact per-project values and the lead’s tested matrix remain inputs to obtain; do not reopen the assigned authority split. |
| 7. Negative constraints | Lists the four binding exclusions but says the draft has no complete trace. | **Binding constraints retained and made operational.** | No printer operation, safety-critical design, STL completeness assumption, or universal approval of saved slicer settings. Use review-only files and do not generate/submit print output. |
| 8. Complete evidence-backed proposal and validation table | Admits the draft is incomplete, with product research and product validation marked not run. | **Replaced with this complete proposal.** | Provides a coherent recommendation, alternatives, source/version limits, owner inputs, uncertainty, and a table separating research already performed from product checks only proposed. |

## 2. Handoff routes and analogous package

| Option | What moves between members | Strengths for this pilot | Interoperability limits and conditions |
| --- | --- | --- | --- |
| **A. CAD export → neutral 3MF geometry package → receiving slicer** | Triangle geometry, declared units, objects/components and transforms, possible names, base-material intent, and optional metadata/extensions. | One file can describe multiple related objects with explicit unit and placement information. Fusion’s Save As Mesh exposes 3MF, explicit unit choices, and one-file/all-bodies or one-body-per-file structure. The 3MF Core package is based on OPC/ZIP and defines fields for objects, components, units, materials, thumbnails, and model metadata. | A neutral mesh is not editable CAD history, constraints, or a promise to preserve every project setting. Extension and application metadata support differs. 3MF project files made by slicers can include app-specific settings. Check the exact producer, consumer, version, and open/import mode. |
| **B. CAD export → STEP → slicer with documented STEP importer** | CAD exchange geometry, and potentially producer/protocol-dependent product structure and attributes; the slicer converts imported geometry into triangles. | Useful when the CAD source can provide STEP and the receiving slicer supports it. The recipient controls tessellation rather than inheriting the author’s chosen STL mesh resolution. | STEP protocol/export choices and importer kernels matter. Prusa’s help states STEP is triangulated at import. That import cannot retain parametric features; verify part count, names, holes, bounds, and component placement. The PrusaSlicer 2.5.0 issue history includes a report of open edges and missing hinge geometry. Do not assume STEP is universally better or universally accepted. |
| **C. Cura Universal Cura Project (UCP) or a project ZIP with note/preview** | Cura’s UCP contains models and settings, with selected positional data/settings; a generic ZIP can hold a neutral geometry file, preview, README, and inventory. | UCP is an unfamiliar but practical portable-project mechanism for a receiver who uses Cura. A simple ZIP can give a reviewer readable context even without CAD software. | UCP is a Cura project mechanism, not proof of cross-slicer metadata fidelity. Cura’s 5.7.0 release says its project contains models and settings and can be shared across different printers; loaded settings still do not become technician-approved machine choices. Importing a project and importing its models are distinct operations: Cura’s release notes say Import Models ignores saved positions. A generic ZIP does not become a slicer-readable format by containing files. Avoid duplicate stale geometry copies. |

**Recommendation:** Route A is the pilot’s default design-intent handoff because 3MF Core describes more than triangles and supports the optional preview/note. Route B is an alternate when the lead’s actual receiver supports STEP and the tests establish useful geometry fidelity. Route C is optional for a Cura-specific workflow or reviewer convenience. None is a universal-compatibility claim.

3MF’s package analogy is the Open Packaging Conventions model: a ZIP container with named parts and relationships. The more app-neutral 3MF parts are governed by the Core specification; application projects can add settings and vendor-specific metadata. An outer ZIP plus README/image is a useful human-facing envelope but has no built-in 3D semantics. A .3mf suffix alone does not prove that Cura-, PrusaSlicer-, or Bambu-specific project data are interchangeable. [S01](sources/S01-3mf-core.md), [S02](sources/S02-fusion-mesh.md), [S03](sources/S03-fusion-export.md), [S04](sources/S04-prusa-formats.md), [S11](sources/S11-cura-570-release.md)

## 3. What the handoff should mean

### Units and geometry

3MF Core’s model unit defaults to millimeter when omitted and permits micron, millimeter, centimeter, inch, foot, and meter. For this pilot, the author should set millimeters explicitly and state expected overall bounds in the note. Explicit units reduce ambiguity but do not erase importer defects. A PrusaSlicer 2.9.6 report describes non-millimeter vertices being scaled while build-item/component translations were not; the issue later closed for inactivity without a linked fix. Treat this as a versioned report requiring a targeted test, not proof that every 3MF import is broken. [S01](sources/S01-3mf-core.md), [S07](sources/S07-unit-issue-15545.md)

STEP may preserve geometric information before the slicer tessellates it, but the actual importer controls the resulting mesh. In PrusaSlicer’s documented route, STEP is triangulated during import. A successful file open alone does not establish that small holes, thin features, separate pieces, or intended placement survived. [S04](sources/S04-prusa-formats.md), [S05](sources/S05-prusaslicer-250.md), [S06](sources/S06-step-issue-8998.md)

### Objects, names, and assembly relationships

3MF Core objects may be named, and components can reference object resources with transforms. Component relationships express composition and relative placement; they do not carry CAD mates, editable parametric history, fit tolerances, or an assembly procedure by themselves. The note should name each part and say whether members should review separate parts, a positioned assembly, or parts meant to be assembled after printing.

The receiving application can transform the layout. Cura 5.7.0’s released behavior distinguishes opening a project from Import Models, which ignores saved position. A Cura issue reports multi-object 3MF positions moving after export/re-import and later comments distinguish project opening from model import. A separate Cura issue reports Core object.name not being used on import/export; a Prusa issue reports that Bambu-specific model_settings.config names were not recognized. Therefore names and relationships must be checked in the selected product/version/mode, with the README as a human-readable parts map. [S01](sources/S01-3mf-core.md), [S08](sources/S08-bambu-names-issue.md), [S11](sources/S11-cura-570-release.md), [S12](sources/S12-cura-3mf-position-issue.md), [S13](sources/S13-cura-object-name-issue.md)

### Materials and application-specific settings

3MF Core base-material names are design-intent labels to help users map the design to print materials. Core says base-material names should be portable rather than machine-specific; displaycolor is for rendering and is not a promise of the printed object’s color. The optional PrintTicket can carry user/device configuration, but its format is governed by the specific consumer environment, so it cannot be treated as a universal machine instruction. Core also requires support for required extensions and expects consumers to warn about recommended extensions; producers should avoid requiring an extension unless the document would lose key meaning without it. Full-color and multi-material data are handled by a separately versioned Materials & Properties extension (v1.2.1 at the retrieved specification index). Use those richer features only if the pilot’s exact consumer matrix demonstrates support. [S01](sources/S01-3mf-core.md), [S09](sources/S09-3mf-spec-index.md)

A slicer project is a different artifact from neutral geometry. Prusa documents project 3MF as a snapshot of objects, settings, modifiers, and parameters. Cura’s UCP release notes say it stores models and settings. Such a file can be useful for review in its intended application, but its printer/material/process values are application- and machine-context data. The project author supplies intended units and material intent. The workshop technician chooses the printer, nozzle, bed, material/profile, temperatures, supports, and other machine settings. No saved setting is approved for every workshop machine. [S10](sources/S10-prusa-project-3mf.md), [S11](sources/S11-cura-570-release.md)

## 4. Authorized optional preview and note

Keep the package preview image and human-readable project note as **authorized optional scope**. This is a brief-level authorization, not proof that every application supports or exposes it.

3MF Core permits a package thumbnail in JPEG or PNG and defines model Description metadata. These fields provide a standards-based opportunity: include a clear package thumbnail and a short description when the authoring app writes them and the receiving app preserves them. If the receiver hides the description or drops the thumbnail, retain the option with a sidecar README and image rather than silently removing it. Do not claim UI visibility until the selected version/mode is checked. [S01](sources/S01-3mf-core.md)

The note should include project title/revision; author; explicit unit and expected overall dimensions; part names and relationships; intended material labels; any assembly order/fit note; exporter and version; and a clear line that machine settings belong to the technician. The image is for identification only; it is not dimensional verification or print validation. No evidence-based exclusion is warranted for this small pilot. [S02](sources/S02-fusion-mesh.md), [S11](sources/S11-cura-570-release.md)

## 5. Compatibility history and effect on the pilot

**Cura position/import history.** Cura 5.7.0 (tag 5.7.0, commit 04ddb8e) released Universal Cura Project files, described as containing models and settings and allowing selected positional data/settings to travel across printers. The same release notes say Cura fixed saved-position loading for 3MF and intentionally changed Import Models so stored location is ignored. The release also recommends starting a new project after a UCP to reset its settings. This is a useful released format/workflow change, but it makes the operation part of the compatibility contract. [S11](sources/S11-cura-570-release.md)

Cura issue #19456 reports Cura 5.7.2 moving/rotating split-object 3MF parts after export and re-import. Follow-ups mention the same issue in 5.8 and 5.9 and say opening as a project and importing models behave differently; the issue has duplicate/under-investigation labels and no linked repair in that record. This is not evidence that current stable Cura 5.13 fails, but it is direct evidence that “opened once” is not a sufficient acceptance test. Cura issue #17110 separately reports a Core object.name import/export boundary; the retrieved issue remains marked Under Investigation and gives no exact tested release. [S12](sources/S12-cura-3mf-position-issue.md), [S13](sources/S13-cura-object-name-issue.md)

**PrusaSlicer STEP history.** PrusaSlicer 2.5.0 (tag version_2.5.0, commit ec2f533) introduced STEP import. Issue #8998, against 2.5.0, reports open edges and a missing hinge region in an imported STEP while a comparable STL was usable; the discussion says importer/OpenCASCADE quality affects the conversion. The issue record does not provide a confirmed fix. That bounded early-release example justifies shape sentinels for STEP imports; it does not rule out STEP in later versions. [S05](sources/S05-prusaslicer-250.md), [S06](sources/S06-step-issue-8998.md)

**Current-version applicability snapshot.** At access time, official release lists showed Cura 5.13.0 and PrusaSlicer 2.9.6 as stable entries, with Cura 5.14.0-alpha.0 and PrusaSlicer 3.0.0-alpha12 as prereleases. Use exact stable builds selected by the pilot lead; do not treat alpha findings or the 5.7/2.5 history as proof of current behavior. The cited Prusa issue #15545 is specifically a 2.9.6 report; the Bambu-name report #15662 is specifically on PrusaSlicer 3.0.0-alpha11. [S07](sources/S07-unit-issue-15545.md), [S08](sources/S08-bambu-names-issue.md), [S14](sources/S14-cura-releases.md), [S15](sources/S15-prusaslicer-releases.md)

## 6. Corrections, optional improvements, owner decisions, and open points

### Corrections to the released draft

- Replace the claim that STL is a complete project record. It is a limited geometry route and the brief explicitly prohibits assuming it preserves every project property.
- Replace the filename-unit reconstruction with an explicit unit in the artifact and note, plus expected bounds.
- Do not assume Cura or Prusa project settings are portable or approved for every printer.
- Do not assume 3MF extensions, names, object tree, preview, or note are universally interpreted; record each tested consumer/version/import mode.
- Replace the one-file/one-slicer demo with a matrix of representative files, modes, and geometry/property acceptance checks.
- Treat the Cura release’s “share with different printers” language as product documentation for UCP, not a cross-application guarantee.

### Optional improvements within the brief’s permission

- Retain the optional package thumbnail and human-readable note, using 3MF Core fields when preserved and a sidecar fallback when needed.
- Allow a STEP source alongside the normal 3MF for projects where the pilot matrix demonstrates its value.
- Allow a Cura UCP only for members using a tested Cura workflow, clearly marked as a Cura project with local settings.
- Include the original CAD file only if its author elects to share it, labelled with the authoring tool/version; it may be useful for edits but is not required as the interoperable handoff.

### Owner decisions and unresolved inputs

| Owner | Authority from the brief | Inputs still needed for the ten projects |
| --- | --- | --- |
| Project author | Intended units and materials; design intent and part relationships should be stated by the author. | Exact unit, bounds, material meaning, component/part names, and whether parts are separate/positioned/interlocked or assembled later for each package. |
| Workshop technician | Printer settings. | For any later print, choose printer/profile, nozzle, bed, material substitution, temperature, support, and other machine-specific choices. Those choices are outside this review package and must not be inferred from saved slicer settings. |
| Pilot lead | Selects the tested receiving-tool matrix; does not claim universal compatibility. | Choose exporter/app versions and exact stable receiver versions/modes, approve acceptance thresholds, and decide which alternatives add value in this ten-project pilot. |

The lead may consider current stable candidates shown on the access-date release lists—Cura 5.13.0 and PrusaSlicer 2.9.6—but neither candidate has been locally validated here. [S14](sources/S14-cura-releases.md), [S15](sources/S15-prusaslicer-releases.md)

### Already covered, rejected, and uncertain

- **Already covered in the plan:** ten noncritical decorative items; owner roles; all four negative constraints; the optional reviewer image/note as authorized but not mandatory.
- **Rejected:** STL as the complete project record; universal portability of slicer settings; universal compatibility claims based on a single file or product; treating an optional field as guaranteed visible in every app; removing the authorized option without evidence.
- **Uncertain until owner/app choice:** participants’ actual CAD versions and exporters; exact per-project geometry and material meaning; whether Cura/Prusa versions preserve each optional metadata field and extension; name and assembly-tree behavior; STEP tessellation for the chosen geometries; and which receiving matrix the pilot lead selects.

## 7. Validation plan and execution record

| Check | Status | Method / acceptance condition |
| --- | --- | --- |
| Read the exact brief, assignment, input map, frozen objective, and released plan | **EXECUTED — task inputs only** | Read the assigned files and the single released plan copy. This is not product validation. |
| Public source/version review | **EXECUTED — research only** | Read sources S01–S15. No binaries, source downloads, project files, or issue attachments were executed. This is not product validation. |
| Native Goal creation | **EXECUTED — active directly observed before substantive work** | Actual Goal was created with the frozen objective and returned active. This is not product validation. |
| Stage freeze/confirmation/terminal completion | **PENDING stage finalization** | Required topology calls will be recorded in the handoff artifacts; they are not product validation. |
| Any CAD export, slicer import, archive inspection, geometry/bounds comparison, settings check, or printer operation | **NOT RUN** | No local product behavior is claimed. No printer operation is authorized. |
| Pilot receiving matrix | **PROPOSED** | Lead selects exact stable exporter/receiver versions, and Cura mode (open project vs Import Models). Include at least a CAD→3MF path into each selected receiver and CAD→STEP only where the receiver documents it. Log product version, source/exporter version, mode, and any warnings. |
| Unit and transform sentinel | **PROPOSED** | For each selected route, compare a known millimetre model and a deliberately non-mm/translated case. Record resulting bounds, scale, and plate-relative positions. Pass only when the printed note’s units/bounds match the imported geometry within a lead-approved tolerance; otherwise record the route limitation and use mm/baked placement or a different route. |
| Object/assembly fidelity | **PROPOSED** | Use one single-body item and one multi-part positioned example with names, gaps/overlaps, and an intended assembly note. Compare part count, names, position, rotation, and relationship after the exact operation. Distinguish project opening from geometry-only import. |
| Material and extension handling | **PROPOSED** | Check portable material labels in the receiving UI and inspect whether any optional Materials & Properties data is understood, ignored, or warned about. A missing extension must not be silently represented as preserved. Keep unsupported rich color optional. |
| Preview and reviewer note | **PROPOSED** | Include a JPEG/PNG 3MF package thumbnail and Description where the producer supports them; then check that the exact receiver shows or preserves them. Confirm a reviewer can read the sidecar note without the originating CAD tool. The image is not a pass for geometry. |
| Slicer settings isolation | **PROPOSED** | Open a sample Cura UCP/Prusa project only in the selected app and document what settings load/replace and how a new project resets them. Do not slice, send, or treat the values as approved for a printer. |
| STEP geometry sentinels | **PROPOSED** | Where STEP is a matrix route, use representative small holes/thin features/multipart geometry and compare imported bounds and mesh appearance. A complete file open is insufficient; record missing faces/open edges and reject or constrain that route if intent changes. |

The pilot lead should keep proposed checks separate from executed checks, preserve failures and workarounds as matrix results, and avoid upgrading a passing cell into a claim of compatibility with all CAD tools, slicers, or printers.
