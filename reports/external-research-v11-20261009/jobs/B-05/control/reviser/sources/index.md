# Sources index — ER11 B-05 control reviser (I05, M14)

Reviser stage. No new primary fetches: the critic independently confirmed
nearly every consequential predecessor fact (C01–C12), and every criticism
adjudicated in `final.md` turns on scope/proportionality reasoning against
the brief text, not on disputed primary facts. No extra broad discovery was
necessary within original scope/time.

Evidence below is retained bounded permitted copies of predecessor evidence
(stages research + critic, the declared `source_roots` in `input-map.json`),
copied verbatim 2026-10-09T20:55Z. IDs immutable (S01–S12 research,
C01–C12 critic); no silent rebind. Originals remain at:

- `/home/sittingmongoose/PM-Experiments/er11-20261009-116bb1e4/jobs/B-05/control/research/sources/`
- `/home/sittingmongoose/PM-Experiments/er11-20261009-116bb1e4/jobs/B-05/control/critic/sources/`

Predecessor indexes: [index-research.md](index-research.md),
[index-critic.md](index-critic.md). Full URL/version/locator/timestamp/
operations records: research `source-map.json`, critic `source-map.json`
(predecessor paths), and this stage's `source-map.json`.

## Research evidence (S01–S12)

| ID | Primary source | Copy |
|----|----------------|------|
| S01 | OSRM HTTP API docs/http.md master — route/table, units, fallback | [S01-osrm-http.md](S01-osrm-http.md) |
| S02 | PostgreSQL docs/current rangetypes §8.17 — tstzrange, `[)` default, exclusion | [S02-pg-rangetypes.md](S02-pg-rangetypes.md) |
| S03 | PostgreSQL docs/current ddl-constraints §5.5.6 — exclusion definition | [S03-pg-exclusion.md](S03-pg-exclusion.md) |
| S04 | PostgreSQL docs/current btree_gist F.8 — scalar GiST classes, trusted | [S04-pg-btree-gist.md](S04-pg-btree-gist.md) |
| S05 | PocketBase docs intro (v0.40.5) — single binary, SQLite, pre-1.0 | [S05-pocketbase-intro.md](S05-pocketbase-intro.md) |
| S06 | PocketBase api-rules-and-filters — 5 rules, defaults, status codes | [S06-pocketbase-rules.md](S06-pocketbase-rules.md) |
| S07 | PocketBase go-realtime — broker, topics, auth key, multi-client | [S07-pocketbase-realtime.md](S07-pocketbase-realtime.md) |
| S08 | PocketBase CHANGELOG master — breaking pattern, #7836 deadlock fix | [S08-pocketbase-changelog.md](S08-pocketbase-changelog.md) |
| S09 | Timefold Solver docs 2.7.1 — constraint streams, domain modeling | [S09-timefold-docs.md](S09-timefold-docs.md) |
| S10 | Fork lineage via search snippets (superseded by C10 primary fetch) | [S10-timefold-fork.md](S10-timefold-fork.md) |
| S11 | Cal.com round-robin scheduling — availability vs fairness, fixed hosts | [S11-calcom-roundrobin.md](S11-calcom-roundrobin.md) |
| S12 | W3C APG combobox pattern — roles, keyboard, states | [S12-w3c-apg-combobox.md](S12-w3c-apg-combobox.md) |

## Critic evidence (C01–C12)

| ID | Primary source | Copy |
|----|----------------|------|
| C01 | PostgreSQL 18 rangetypes §8.17 (pinned /18/) | [C01-pg18-rangetypes.md](C01-pg18-rangetypes.md) |
| C02 | PostgreSQL 18 ddl-constraints §5.5.6 (pinned /18/) | [C02-pg18-exclusion.md](C02-pg18-exclusion.md) |
| C03 | PostgreSQL 18 CREATE TABLE — EXCLUDE … WHERE (predicate) — NEW | [C03-pg18-createtable-predicate.md](C03-pg18-createtable-predicate.md) |
| C04 | PostgreSQL 18 btree_gist F.8 (pinned /18/) | [C04-pg18-btree-gist.md](C04-pg18-btree-gist.md) |
| C05 | PocketBase docs intro (v0.40.5 observed) | [C05-pocketbase-intro.md](C05-pocketbase-intro.md) |
| C06 | PocketBase api-rules-and-filters — status-code mapping confirmed | [C06-pocketbase-rules.md](C06-pocketbase-rules.md) |
| C07 | PocketBase go-realtime — custom-topic rule gap (MATERIAL QUALIFICATION) | [C07-pocketbase-realtime.md](C07-pocketbase-realtime.md) |
| C08 | OSRM HTTP API docs/http.md master (mutable; pin release) | [C08-osrm-http.md](C08-osrm-http.md) |
| C09 | Timefold Solver docs 2.7.1 score-calculation (/latest/ URL; pin) | [C09-timefold-score.md](C09-timefold-score.md) |
| C10 | optaplanner.io history — primary fetch (upgrades S10) | [C10-optaplanner-history.md](C10-optaplanner-history.md) |
| C11 | Cal.com round-robin scheduling (2227 bytes, untruncated) | [C11-calcom-roundrobin.md](C11-calcom-roundrobin.md) |
| C12 | W3C APG combobox pattern (truncated; re-read at build) | [C12-w3c-apg-combobox.md](C12-w3c-apg-combobox.md) |

## Reviser source hygiene (from M6, applied in final.md)

- Prefer C01–C04 pinned `/18/` URLs over S02–S04 `/current/` (mutable).
- C03 is the authority for the partial-exclusion predicate form.
- C10 supersedes S10 for the fork lineage; the exact fork date 2023-04-20
  is NOT on the C10 page (page says "In 2023") — final says 2023, date
  needs a README pin.
- C09 header pins 2.7.1 but the URL uses `/latest/` — pin a versioned URL
  before build. Same for C08 master (pin a v5.x tag).
- C12/S12 APG excerpts truncated before full keyboard/forms detail —
  re-read untruncated before build. "100+ fixes" is the project's own
  claim, attributed, not independently audited.
