# Sources index — B-05/treatment/research (case I05)

All sources were read as data. IDs are immutable; no silent rebind.
Access window: 2026-10-09T20:21–20:26Z. Full locator/observed-operation detail in `../source-map.json`.

| ID | Short name | Type | Evidence file |
|----|-----------|------|---------------|
| S01 | PostgreSQL 18 — 5.5 Constraints (5.5.6 Exclusion) | primary docs (versioned current→18) | sources/S01-pg-ddl-constraints-excerpt.md |
| S02 | PostgreSQL 18 — 8.17 Range Types (incl. btree_gist exclusion example) | primary docs (versioned current→18) | sources/S02-pg-rangetypes-excerpt.md |
| S03 | Supabase — Row Level Security guide | primary vendor docs (mutable) | sources/S03-supabase-rls-excerpt.md |
| S04 | PocketBase v0.40.5 — Introduction (SQLite, single binary, pre-1.0 warning) | primary vendor docs (versioned v0.40.5) | sources/S04-pocketbase-intro-excerpt.md |
| S05 | PocketBase v0.40.5 — API rules and filters (5 rules, locked default) | primary vendor docs (versioned v0.40.5) | sources/S05-pocketbase-rules-excerpt.md |
| S06 | OSRM API v5.24.0 — HTTP API (route/table/trip/match, units) | primary docs (versioned v5.24.0) | sources/S06-osrm-api-excerpt.md |
| S07 | XState — v5 docs root (actor model, createActor) | primary docs (mutable, v5) | sources/S07-xstate-root-excerpt.md |
| S08 | XState — v4→v5 migration guide (breaking changes) | primary docs (mutable, v5) | sources/S08-xstate-migration-excerpt.md |
| S09 | Timefold — OptaPlanner fork announcement 2023-05-02 (+ GitHub fork notice 2023-04-20, Apache-2.0) | primary vendor blog + repo notice | sources/S09-timefold-fork-excerpt.md |
| S10 | Cal.com — API v2 introduction (auth, 120 req/min) | primary vendor docs (mutable) | sources/S10-calcom-api-excerpt.md |
| S11 | Timefold docs root — Solver + managed Models + Platform split | primary docs (mutable, latest) | sources/S11-timefold-docs-excerpt.md |
| S12 | Novu docs root — Notify/Connect, workflows, self-host | primary docs (mutable) | sources/S12-novu-docs-excerpt.md |
| S13 | Secondary search observations — ORS quotas, RLS exposure chains, Timefold history corroboration | secondary (search snippets, unverified) | sources/S13-secondary-search-notes.md |

Stability notes:
- S01/S02/S06 are pinned to explicit doc versions (PG 18 / OSRM v5.24.0); re-verify if `current` rolls.
- S04/S05 pinned to v0.40.5; PocketBase pre-1.0 warns no full backward compat.
- S03/S07/S08/S10/S11/S12 are mutable vendor docs; locators + access timestamps recorded; drift must be re-checked.
- S09 fork date (2023-04-20) and blog date (2023-05-02) are fixed historical facts; corroborated by OptaPlanner history page and GitHub fork notices observed in search.
- S13 is explicitly secondary; every claim from it is marked NEEDS-PRIMARY in discovery.md.
