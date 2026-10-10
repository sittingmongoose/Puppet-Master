# S01 — 3MF Core Specification

- **Source:** [3MF Core Specification & Reference Guide](https://github.com/3MFConsortium/spec_core/blob/master/3MF%20Core%20Specification.md)
- **Version:** Published v1.4.0; change history says 2025-02-06. Commit hash not surfaced in retrieved page.
- **Access:** 2026-10-10T04:14:03Z, read-only web open.
- **Locator:** §§1.1, 2.1, 3.1–3.4, 4.2, 5.1, 6.1–6.2.
- **Observed operation:** Read specification prose. No local file or implementation was run.
- **Relevant rules:** 3MF uses OPC ZIP packaging; optional package parts include core properties, PrintTicket, package thumbnail and object thumbnail. Unit default is millimeter; values include micron/mm/cm/in/ft/m. Components reference objects and carry transforms. Base-material names convey design intent for mapping to print materials; display color is for rendering, not a guarantee of printed color. PrintTicket is optional and consumer-environment-specific. Unsupported required extensions block processing; recommended extensions should prompt a warning, and producers should avoid requiring extensions unless key meaning depends on them. Model Description metadata is a defined field. Thumbnail is optional JPEG/PNG.
- **Applicability:** Format-level rules only. A particular CAD/slicer may omit, ignore, hide, or alter optional fields or extensions.
