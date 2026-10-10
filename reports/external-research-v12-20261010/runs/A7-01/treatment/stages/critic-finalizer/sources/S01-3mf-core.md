# S01 — 3MF Core Specification & Reference Guide

- **Exact URL:** https://github.com/3MFConsortium/spec_core/blob/master/3MF%20Core%20Specification.md
- **Released version/commit:** Published Core Specification v1.4.0 (change history dated 2025-02-06); live master page did not surface a commit hash.
- **Locator:** Sections 1.1-2.1 (OPC/ZIP, parts, thumbnails, PrintTicket); 2.2.1-2.2.2 (recommended/reserved double extensions); 3.1-3.4 (unit, transforms, metadata); 4.2 (components); 5.1 (base materials); 6.1-6.2 (thumbnail/core properties); 2.3.2-2.3.3 (extension behavior).
- **Access UTC:** 2026-10-10T04:39:48Z
- **Observed operation:** Read-only browser open/find of the official 3MF Consortium specification; inspected the relevant sections. No implementation or package was run.
- **Governing condition/default/exception:** 3MF is an OPC ZIP package. Model unit defaults to millimeter; declared alternatives are micron, centimeter, inch, foot and meter. Components reference objects and transforms; manufacturing devices must preserve their relative position. Base-material names convey portable design intent; PrintTicket maps to a consumer environment. Package thumbnail and Description metadata are optional. Core v1.4.0 recommends purpose-signalling suffixes such as .model.3mf and .project.3mf. Unsupported extension data may be ignored; producers should avoid requiring extensions unless key meaning depends on them.
- **Applicability:** Format-level normative/recommended behavior only; does not guarantee a specific exporter or receiver writes, displays or preserves optional fields, extensions, names or project settings.
