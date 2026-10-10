# S11 — UltiMaker Cura 5.7.0 release

- **Exact URL:** https://github.com/Ultimaker/Cura/releases/tag/5.7.0
- **Released version/commit:** Tag 5.7.0, commit 04ddb8e; release page prints 3 April but not the year in the retrieved view.
- **Locator:** UCP feature lines 151-165; 3MF saved-position/import-mode change lines 192-205; UCP reset tip lines 244-247.
- **Access UTC:** 2026-10-10T04:39:48Z
- **Observed operation:** Read-only open of official Cura release notes; no binary or project was run.
- **Governing condition/default/exception:** Release says UCP contains models/settings and can be shared with people with different printers; it allows positional data and selected settings. It restores saved position when a 3MF project loads but Import Models ignores saved positions. The release recommends starting a new project after a UCP to reset its settings.
- **Applicability:** Cura 5.7.0 workflow only; this is not cross-slicer interoperability or approval of loaded machine settings.
