# Sources index — ER11 B-05 control critic (I05, M14)

Critic independent primary fetches. IDs C01–C12 immutable in this stage; no silent rebind.
Access window: 2026-10-09T20:33:00Z–20:35:10Z. Method: web_fetch to read, grep to locate exact passages.
No code executed; sources treated as data. Usage/billing unobserved → null in source-map.json.
Predecessor sources S01–S12 (research stage) were inspected in full but are NOT re-cited as critic evidence; every critic claim below rests on C01–C12 or on the inspected predecessor text itself.

| ID | Primary source | Evidence file |
|----|----------------|---------------|
| C01 | PostgreSQL 18 rangetypes §8.17 (pinned /18/) — tstzrange, [) default, exclusion examples | [C01-pg18-rangetypes.md](C01-pg18-rangetypes.md) |
| C02 | PostgreSQL 18 ddl-constraints §5.5.6 (pinned /18/) — exclusion definition | [C02-pg18-exclusion.md](C02-pg18-exclusion.md) |
| C03 | PostgreSQL 18 CREATE TABLE (pinned /18/) — EXCLUDE … WHERE (predicate) — NEW, predecessor did not fetch | [C03-pg18-createtable-predicate.md](C03-pg18-createtable-predicate.md) |
| C04 | PostgreSQL 18 btree_gist F.8 (pinned /18/) — scalar GiST classes, trusted | [C04-pg18-btree-gist.md](C04-pg18-btree-gist.md) |
| C05 | PocketBase docs intro (v0.40.5 observed) — single binary, SQLite, pre-1.0 | [C05-pocketbase-intro.md](C05-pocketbase-intro.md) |
| C06 | PocketBase api-rules-and-filters — 5 rules, defaults, status-code mapping | [C06-pocketbase-rules.md](C06-pocketbase-rules.md) |
| C07 | PocketBase go-realtime — broker, topics, auth key, multi-client (custom-topic rule gap noted) | [C07-pocketbase-realtime.md](C07-pocketbase-realtime.md) |
| C08 | OSRM HTTP API docs/http.md master — route/table, units, fallback, keep-alive (mutable; pin release) | [C08-osrm-http.md](C08-osrm-http.md) |
| C09 | Timefold Solver docs 2.7.1 score-calculation — constraint streams, HardSoftScore, incremental | [C09-timefold-score.md](C09-timefold-score.md) |
| C10 | optaplanner.io history — EOL/fork/100+ fixes (primary fetch; predecessor used snippets) | [C10-optaplanner-history.md](C10-optaplanner-history.md) |
| C11 | Cal.com round-robin scheduling — availability vs fairness, fixed hosts | [C11-calcom-roundrobin.md](C11-calcom-roundrobin.md) |
| C12 | W3C APG combobox pattern — roles, select-only/editable, expansion (truncated; re-read at build) | [C12-w3c-apg-combobox.md](C12-w3c-apg-combobox.md) |

Mutability: C08-master mutable (drift explicit; pin a v5.x tag before build). C09 URL uses /latest/ though header pins 2.7.1 (pin versioned URL before build). C10–C12 pages mutable-by-host (pinned by URL+locator+timestamp here). C01–C04 pinned to /18/ (preferred over predecessor's /current/).
