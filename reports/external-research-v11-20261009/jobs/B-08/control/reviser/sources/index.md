# Sources index — ER11 B-08 control / reviser (I08, M15 v1)

Immutable reviser IDs R01–R06 (see `../source-map.json`). Bounded fair-use
excerpts in `evidence.md`. No silent rebind: URLs, versions, access
timestamps fixed in source-map.json. Predecessor research IDs S01–S12 and
critic IDs C01–C06 live in `../../research/source-map.json` and
`../../critic/source-map.json` and are cited, never redefined, here.

- R01 PocketBase API-rules-and-filters docs v0.40.5 (mutable, version-pinned observed) — 5 rules, locked default, 200/400/404/403 oracle, superuser bypass
- R02 PocketBase authentication docs v0.40.5 (mutable, version-pinned observed) — stateless tokens, no logout endpoint, superuser bypass, named OAuth2 providers with Client Id/Secret and redirect URL
- R03 PocketBase collections docs v0.40.5 (mutable, version-pinned observed) — Base/View/Auth, view read-only SELECT, no realtime on views
- R04 WCAG 2.2 Recommendation 2024-12-12 (stable normative) — SC 1.4.4 Resize Text and SC 1.4.10 Reflow with Notes 1-2
- R05 InvenTree stable stock status docs (stable versioned, footer 2026-08-22) — Available flag table incl. Quarantined (unavailable), default OK
- R06 InvenTree stable custom states docs (stable versioned, footer 2026-08-22) — display-only, logical key governs availability/filtering, OK/Awaiting-Inspection example

Usage/billing: unobserved (null) for all reviser sources. No application
runtime, no sandbox witness, no code executed in this reviser stage;
checks are independent doc-fetch only.
