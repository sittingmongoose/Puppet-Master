# Source index

Bounded primary evidence for the investigator discovery. Each ID is stable and points to a record in ../source-map.json; do not rebind an ID. Access batch for these reads: 2026-10-10 04:14:03 UTC. Pages were read through public web retrieval; no binaries, projects, or attached examples were executed.

| ID | Local evidence note | Source / locator | Used for |
| --- | --- | --- | --- |
| [S01](S01-3mf-core.md) | 3MF Core 1.4.0 | [Specification source](https://github.com/3MFConsortium/spec_core/blob/master/3MF%20Core%20Specification.md), §§1.1, 2.1, 3, 4.2, 5.1, 6.1 | OPC package, units, objects/components, materials, metadata, thumbnail, PrintTicket |
| [S02](S02-fusion-mesh.md) | Fusion mesh export | [Autodesk Help](https://help.autodesk.com/view/fusion360/ENU/?contextId=MESH-SAVE-AS-MESH), Save As Mesh steps | 3MF/STL choices, units, body/file structure |
| [S03](S03-fusion-export.md) | Fusion export | [Autodesk Help](https://help.autodesk.com/view/fusion360/ENU/?contextId=ASM-EXPORT-DESIGN), Export designs | 3MF and STEP routes; exported file loses associativity |
| [S04](S04-prusa-formats.md) | Prusa supported formats | [Prusa Help](https://help.prusa3d.com/article/supported-file-formats_1772?product=cw1), 3MF/STL/STEP/OBJ sections | STEP triangulation; OBJ material/texture exception |
| [S05](S05-prusaslicer-250.md) | PrusaSlicer 2.5.0 release | [Release](https://github.com/prusa3d/PrusaSlicer/releases/tag/version_2.5.0), release summary | STEP import introduced in 2.5.0 |
| [S06](S06-step-issue-8998.md) | STEP import issue | [Issue #8998](https://github.com/prusa3d/PrusaSlicer/issues/8998), description and discussion | Missing hinge/open-edge importer example and applicability limits |
| [S07](S07-unit-issue-15545.md) | 3MF units issue | [Issue #15545](https://github.com/prusa3d/PrusaSlicer/issues/15545), report and tested 2.9.6 details | Non-mm transform translation risk; closure was not a fix |
| [S08](S08-bambu-names-issue.md) | Cross-slicer names issue | [Issue #15662](https://github.com/prusa3d/PrusaSlicer/issues/15662), report | Vendor-specific project metadata vs Core object names |
| [S09](S09-3mf-spec-index.md) | Extension version index | [3MF spec index](https://3mf.io/spec/), specification suite table | Published Materials & Properties version |
| [S10](S10-prusa-project-3mf.md) | Prusa project 3MF | [Prusa Help](https://help.prusa3d.com/article/saving-projects-as-3mf_1773?product=sl1), save/project format sections | Project snapshots include settings/modifiers; app-specific behavior |

No local receiving-tool validation was performed.

## Cura route and release evidence

| ID | Local evidence note | Source / locator | Used for |
| --- | --- | --- | --- |
| [S11](S11-cura-570-release.md) | Cura 5.7.0 release | [Release notes](https://github.com/Ultimaker/Cura/releases/tag/5.7.0), UCP and 3MF behavior | Universal Cura Project contents; saved-position behavior and Import Models exception |
| [S12](S12-cura-3mf-position-issue.md) | Cura issue #19456 | [Issue](https://github.com/Ultimaker/Cura/issues/19456), reproduction and follow-up comments | Multiple-object 3MF positions differ by project-vs-model import mode |
| [S13](S13-cura-object-name-issue.md) | Cura issue #17110 | [Issue](https://github.com/Ultimaker/Cura/issues/17110), Core object.name import report | Caution about application-level handling of standardized object names |
| [S14](S14-cura-releases.md) | Cura release index | [Releases](https://github.com/Ultimaker/Cura/releases), release list | Current stable 5.13.0 vs 5.14.0-alpha.0 as of access |
| [S15](S15-prusaslicer-releases.md) | PrusaSlicer release index | [Releases](https://github.com/prusa3d/PrusaSlicer/releases), release list | Current stable 2.9.6 vs 3.0.0-alpha12 as of access |
