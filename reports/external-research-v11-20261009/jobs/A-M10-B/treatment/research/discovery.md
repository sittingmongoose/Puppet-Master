# ER11 discovery — A-M10-B / treatment / research / S04 maker-inventory (M10 v1)

- Block/arm/stage: A-M10-B / treatment / research. Case: S04. Method: M10 v1 question-relevance-reformulation.
- Brief: `/home/sittingmongoose/PM-Experiments/er11-20261009-116bb1e4/cases/S04/brief.md` (maker-inventory: members reserve tools; staff track consumables, repair status, checkout; two sites; unreliable Wi-Fi; avoid complex hosting; CSV import from inconsistent spreadsheets; investigate competing products, double-booking safeguards, offline behavior, audit history, extension options).
- Obligations: O1 unfamiliar tools/products/approaches; O2 primary source/code behavior + governing defaults/limits/applicability; O3 issue/fix/regression/release chain; O4 per-P comparison after reveal (not in this file); O5 retained alternatives/conditions/uncertainty in self-contained prose; O6 discriminating validations, executed vs proposed.
- Native route: muse. One fresh native Goal created/active before science (goal-01a121ec-a19e-7e31-b574-70914e521da3); science saved before terminal completion. No handwritten receipt.
- Access window: 2026-10-09T18:28–18:35Z. Usage/billing: unobserved (null). No runtime/sandbox witnesses executed; all checks below are read-only web observations unless marked proposed.
- Pre-reveal declaration: case `plan-root-only.md` NOT read. This file + `source-map.json` + `sources/` are the pre-reveal frozen discovery. No post-reveal rewrite.

## M10 execution (question-relevance-reformulation)

Maintained one retrieval queue per original question AND per emergent alternative lead. Each candidate passage scored for (a) question relevance (does it answer the governing condition?), (b) applicability (does it transfer to two-site makerspace, low-ops, offline-tolerant inventory/reservations?). Kept exact full evidence outside contextual cards in `sources/` excerpts + `source-map.json` locators. Three working cards per question used ONLY as context prioritization; investigation, evidence, and preserved output were never capped at three. Expanded to surrounding definitions/exceptions wherever cards were insufficient (exclusion ranges, conflict types, CSV error taxonomy). Reformulated ONLY unanswered questions from their missing governing condition (see R1–R3). Same native context/time/finalizer throughout.

## Question index

- Q1 (O1 + brief): What unfamiliar inventory/reservation products usefully cover tool lending, consumables, repair, checkout? (original)
- Q2 (O2 + brief): What are the governing double-booking safeguards, with exact defaults/exceptions? (original)
- Q3 (O2 + brief): What offline behavior works for two sites + unreliable Wi-Fi with low ops? (original)
- Q4 (O2 + brief): What audit-history mechanisms fit checkout/repair/consumable edits? (original)
- Q5 (O2 + brief): What extension options (API/webhooks/plugins/CSV) are consequential? (original)
- Q6 (O2 + brief): What breaks CSV import from inconsistent spreadsheets, and what governs a robust importer? (original)
- Q7 (O1 emergent): What materially different hosting/sync architectures avoid complex hosting yet cover two sites? (emergent alternative lead)
- Q8 (O1 emergent): What materially different domain models (asset-vs-part-vs-grocery) change the design? (emergent alternative lead)

Unanswered after first pass: parts of Q4 (no dedicated makerspace audit-log primary found; reformulated as R1), parts of Q7 multi-writer conflict policy (reformulated as R2), Q6 Excel-encoding edge scope (reformulated as R3). All other questions answered to discovery depth; residual uncertainty retained below.

## Q1 — competing/unfamiliar products (O1)

Retrieval queue (scored, high first):
1. Circulate / Chicago Tool Library (open source, lending-specific) — relevance high, applicability high.
2. YaleSTC Reservations (open source equipment lending, availability engine) — relevance high, applicability high.
3. Snipe-IT (mature asset checkout/audit/labels/API/CSV import) — relevance high, applicability medium-high (IT-asset model differs; checkout/audit patterns transfer).
4. InvenTree (parts/stock/locations/serialization/BOM/API) — relevance medium-high, applicability medium-high (parts model transfers to consumables; lending weak).
5. MyTurn + Lend Engine (dominant lending SaaS; locker/PIN, reservations) — relevance high, applicability medium (commercial; sets baseline expectations).
6. Grocy (self-hosted stock/consumables, barcode/batch/expiry) — relevance medium, applicability medium (consumables/expiry model; no lending).
7. Shelf (open-source asset management, mentioned in comparisons) — relevance medium, applicability unknown (not independently opened; retained as lead, not finding).
8. Koha/OpenRoom (ILS/room-booking; older references) — relevance low-medium, applicability low (domain mismatch; retained only as rejected alternative).

Working cards (prioritization only): Circulate; YaleSTC Reservations; Snipe-IT. Expanded beyond cards to InvenTree, MyTurn/Lend Engine, Grocy, PocketBase/PowerSync (see Q7), PapaParse/csvkit (see Q6).

Findings (retained prose, not ID-only):
- Circulate is the closest unfamiliar lending-specific foundation: community reports describe it as Rails + PostgreSQL, lending-specific, multi-tenancy-ready, on the order of ~26k lines of code, homegrown for the Chicago Tool Library. Its existence matters because it proves a small-team open-source lending system (members, holds/reservations, checkouts, returns, maintenance states) is buildable without SaaS. Limits: Rails/Postgres hosting is heavier than this brief wants; offline behavior unknown from observed evidence; two-site behavior unknown. Applicability: borrow domain language (holds vs loans vs renewals vs overdue), do not assume its availability math is race-safe without reading its constraints.
- YaleSTC Reservations is the most instructive unfamiliar availability engine: open-source equipment lending with explicit availability validations, requests vs reservations distinction, overdue handling, renewal logic, and catalog/calendar availability floors. Its issue history (see O3) shows availability math is where lending systems regress. Applicability: adopt its question list (do requests block availability? do overdue items block tomorrow? do checked-out items still factor into availability? is availability floored at zero in UI vs math?).
- Snipe-IT is the mature checkout/audit reference: checkin/checkout with history per asset, status ladder including deployable/pending/archived, consumables/accessories/components as first-class distinct from assets, audit/maintenance records, labels, granular permissions, REST API, CSV import, multi-company-ish tenancy, notifications. Applicability: borrow the asset-vs-consumable-vs-accessory split and per-asset complete history; its IT-asset assumptions (licenses, MDM) do not transfer.
- InvenTree is the parts/stock reference: parts in categories, cascading stock locations/sub-locations, serialized stock items with test results, suppliers/manufacturers, BOM/builds, stock-tracking history, Python/Django + relational DB + browser + optional API. Applicability: borrow cascading locations for two sites (site → room → shelf/bin) and serialized-item test/commissioning records for repair status; its manufacturing depth (BOM/builds) is out of scope and should not be copied.
- MyTurn and Lend Engine set commercial expectations: online browse/reserve/review/report-issues, memberships, self-serve locker + PIN generation (Lend Engine), integrations. Members will compare any custom build to this baseline. They are also the “buy, don’t build” alternative the final must retain.
- Grocy contributes the consumable/expiry/batch mental model (barcode, batch tracking, expiry) useful for consumables (filament, blades, batteries) even though it has no lending.

## Q2 — double-booking safeguards (O2)

Retrieval queue:
1. PostgreSQL exclusion constraints + range types (primary) — relevance high, applicability high if Postgres chosen.
2. Application-level availability checks (YaleSTC validations) — relevance high, applicability high regardless of DB.
3. Transaction/concurrency patterns (check-then-insert race) — relevance high, applicability high.
4. SQLite/single-writer limits (alternative-architecture constraint) — relevance medium-high, applicability high if simple hosting chosen (see Q7).

Working cards: Postgres EXCLUDE USING gist; YaleSTC availability validations; check-then-insert race. Expanded to range-bound semantics and partial predicates.

Findings:
- The governing safeguard when Postgres is available is a database exclusion constraint, not application checks. Canonical shape observed across independent sources: `CREATE EXTENSION IF NOT EXISTS btree_gist;` then `ALTER TABLE booking ADD CONSTRAINT no_overlap EXCLUDE USING gist (room_id WITH =, tstzrange(starts_at, ends_at) WITH &&);` Variants use a stored generated `period tstzrange GENERATED ALWAYS AS (tstzrange(start_at, end_at, '[)')) STORED` and partial predicates such as `WHERE (status IN (...active...))` so cancelled/denied rows do not block. GiST enforces it atomically; two concurrent transactions that both pass an application `existsOverlap` check cannot both commit. This directly answers the race: application `existsOverlap`-then-insert looks correct and double-books under concurrency.
- Governing defaults/exceptions that matter: range bound convention `'[)'` (inclusive start, exclusive end) so back-to-back bookings do not overlap; `&&` is the overlap operator; `=` on the resource key partitions by tool/item (optionally plus site); partial `WHERE` on active statuses is what keeps history rows from permanently blocking; `btree_gist` is required to mix `=` with GiST. Without the partial predicate, cancelled history blocks future bookings; without `'[)'`, adjacent bookings falsely conflict.
- When Postgres is NOT available (SQLite/PocketBase single-file brief direction), exclusion constraints do not exist. Then the safeguard must be a different mechanism: single-writer serialized transactions + application availability function + unique partial index where expressible, with explicit residual race documented; or a reservation-ledger design (append request rows, confirm one winner per slot under a serializable transaction). The choice of hosting (Q7) therefore governs the double-booking mechanism; they cannot be decided independently.
- YaleSTC evidence shows the application layer still needs precise availability semantics even with a DB constraint: requests vs approved reservations, overdue items, renewals, checked-out items, date-vs-datetime boundaries, and UI flooring at zero. A DB constraint prevents overlap rows; it does not define who sees what as available.

## Q3 — offline behavior for two sites + unreliable Wi-Fi (O2)

Retrieval queue:
1. PouchDB/CouchDB replication + conflicts (proven offline-first, multi-master) — relevance high, applicability medium-high (document model; departures from relational schema).
2. PowerSync (local SQLite + Postgres backend, sync rules, real-time) — relevance high, applicability medium-high (keeps SQL; adds service).
3. Local-first PWA (service worker + IndexedDB/OPFS SQLite, background sync) — relevance high, applicability high (works with any backend; governs UX, not truth).
4. Single-node SQLite + Litestream (backup/replication to S3, not multi-writer) — relevance medium-high, applicability medium (simple hosting; does NOT solve two-site writes).
5. CRDTs (Automerge/Yjs/cr-sqlite/RxDB) — relevance medium, applicability low-medium for reservations (auto-merge is wrong for scarce tools; useful for notes/descriptions).

Working cards: PouchDB/CouchDB sync; PowerSync SQLite sync; PWA offline-first. Expanded to conflict taxonomy and CAP consequences.

Findings:
- PouchDB/CouchDB is the proven offline-first pair: PouchDB in the browser (IndexedDB) syncs bidirectionally with CouchDB; CouchDB is multi-master/AP (available + partition-tolerant, eventually consistent); every node is writable; conflicts are first-class and expected, not errors. On conflict every node deterministically picks the same winner with no coordination, but ALL conflicting revisions remain in the revision tree for the app to surface or ignore. Compaction drops bodies but keeps lineage (bounded by `_revs_limit`). Consequence for makerspaces: checkout/return can proceed offline at either site and sync later, but two members reserving the same scarce tool offline WILL conflict and the database will NOT auto-decide fairly — the app must surface and resolve (human review, first-confirmed-wins, staff override). Treating the deterministic winner as “correct” is a design error; it is only a database choice.
- Conflict taxonomy governs implementation: immediate conflicts (409 on `put/post/remove/bulkDocs/putAttachment` with stale `_rev`, including live-replication races while a user edits) vs eventual conflicts (two replicas edited the same doc offline; both branches stored; winner chosen deterministically). Practical mitigations observed: always handle 409; express user intent as deltas with upsert-retry (`pouchdb-upsert`: `upsert(docId, deltaFn)`, `putIfNotExists`); for reservations, do NOT upsert-merge two claims — escalate to a resolution queue.
- PowerSync keeps the relational/SQL path: local SQLite on the client (standard SQL queries), background bidirectional sync to server Postgres (also Mongo/MySQL-beta/SQL Server-beta per docs), server-side YAML sync rules controlling per-user visibility, real-time updates, client SDKs (JS web, RN/Expo, Flutter, Kotlin, Swift, .NET/Rust beta, etc.). Consequence: less model departure than CouchDB, but adds a sync service to operate (tension with “avoid complex hosting”) and still needs a reservation-conflict policy — sync is transport, not arbitration.
- PWA shell (service worker as scriptable proxy + cached assets + local DB + background sync) is orthogonal and required in all architectures for unreliable Wi-Fi: it governs “the page works with no network,” not “two sites agree.” Every architecture in this brief needs it for checkout/return continuity.
- Litestream (small Go sidecar watching SQLite WAL, streaming to S3/B2/GCS/SFTP; `litestream.yml` replica config; snapshot/sync intervals) is durability/backup for single-node SQLite, NOT two-site multi-writer sync. It makes simple hosting safer; it does not let two sites write concurrently.
- CRDT auto-merge (including cr-sqlite, noted as unmaintained since late 2024 with no RN/Android and silent auto-merge that cannot satisfy detect-and-alert) is rejected for reservation truth: silently merging two claims to one tool is the failure mode. CRDTs remain plausible only for non-scarce fields (notes, descriptions).

## Q4 — audit history (O2; partially unanswered → R1)

Retrieval queue:
1. Snipe-IT per-asset complete history + recent-activity snapshot — relevance high, applicability high.
2. InvenTree stock-tracking history + serialized test records — relevance medium-high, applicability high.
3. Temporal tables / trigger-based history tables (SQL Server `SYSTEM_VERSIONING`, Postgres trigger + `*_history` with `valid_from/valid_to`, UTC period columns) — relevance medium-high, applicability medium (mechanism, not UX).
4. Event/ledger append-only log (per-change ledger: old/new value, user, timestamp) — relevance medium-high, applicability high.

Working cards: Snipe-IT history; InvenTree stock history; trigger/temporal pattern. Expanded to ledger-vs-snapshot distinction.

Findings:
- The transferable pattern is per-item complete history + global recent activity: every checkin/checkout/update/delete appears in a recent-activity feed; each asset/item page shows its own full ledger (who, what, old→new, when). Snipe-IT demonstrates this directly; InvenTree demonstrates stock-level history with cascading locations. For repair status, the same ledger must record state transitions (ready → flagged → in-repair → ready/archived) with actor + note + timestamp, not just the current flag.
- Mechanism options with governing notes: (a) application-written audit rows in the same transaction as the mutation (simplest, portable, but every write path must remember); (b) DB triggers to `*_history` tables duplicating the base row + actor/time (cannot be forgotten per-path, but actor identity must be threaded, e.g., session setting); (c) system-versioned temporal tables where the platform supports them (query “as of” time; UTC period storage with local-time display via `AT TIME ZONE`-style conversion). No evidence found for a makerspace-specific audit primary; mechanism choice is therefore driven by hosting (Q7), not domain.
- R1 reformulation (missing governing condition): no observed primary says what makerspace staff must be able to answer from history (e.g., “who had the angle grinder when the guard broke?” vs “prove no staff edited hours”). Reformulated Q4R: “What minimum audit questions must staff answer, and which mechanism answers them with least ops?” Discovery answer: keep both granular ledger (old/new/actor/time/note) and per-item timeline; defer immutability/compliance claims (no evidence of regulatory need).

## Q5 — extension options (O2)

Retrieval queue:
1. REST APIs (Snipe-IT JSON REST, InvenTree API, PocketBase REST) — relevance high, applicability high.
2. Webhooks/notifications (Slack/Teams on checkin/checkout) — relevance medium-high, applicability high.
3. Plugin systems (InvenTree plugins, reserved-locker APIs) — relevance medium, applicability medium.
4. Import/export (CSV import, BOM formats, label printing) — relevance high, applicability high (see Q6).

Working cards: REST API; CSV import/export; notifications. Expanded to locker/PIN and SSO/LDAP as explicitly out-of-scope-but-retained.

Findings:
- REST API first: Snipe-IT’s robust JSON REST API, InvenTree’s API for custom apps, and PocketBase’s REST + realtime subscriptions all show the same priority — every checkout/checkin/reserve/repair action must be API-reachable so kiosks, label printers, and site-specific scripts can integrate without DB access. This is the extension option to design first.
- Notifications as extension: checkin/checkout-triggered Slack/Teams messages are the cheapest “integration” with real staff value (overdue/consumable-low/repair-flagged alerts). Design as outbound webhook events even if only one chat target ships initially.
- Retained but out of initial scope: SSO/SAML/LDAP/SCIM, JAMF/MDM adapters, multi-company tenancy, locker hardware APIs (Seam/TTLock/Lend Engine PIN). These appear in adjacent products and should be named as future seams (stable event names, external member IDs), not built.
- CSV is both onboarding and extension: Snipe-IT-style CSV import for bootstrapping plus export for reports. Q6 governs its robustness.

## Q6 — CSV import from inconsistent spreadsheets (O2)

Retrieval queue:
1. PapaParse docs + FAQ + FieldMismatch behavior (primary) — relevance high, applicability high.
2. Python csv/pandas messiness (delimiters, encodings, dtypes, dates) — relevance high, applicability high.
3. Production-breakage reports (ragged rows, duplicate headers, BOM, line breaks) — relevance high, applicability high.
4. mcp-data-platform CSV repair fix (viewer parsed `header:true` + `parsed.data` only, ignoring `parsed.errors`) — relevance medium-high, applicability high as negative example.

Working cards: PapaParse header/errors/meta; encoding/BOM handling; ragged/duplicate-header handling. Expanded to full error taxonomy and repair UX.

Findings:
- PapaParse governing behavior: `Papa.parse(input, config)` with `header:true` maps rows onto header keys; a record lacking the header’s fields is reported as `FieldMismatch` in `parsed.errors` while `parsed.data` still contains the mapped row with missing keys unset. A viewer that reads `parsed.data` alone draws missing cells as empty and HIDES the mismatch — the exact bug class fixed in the observed mcp-data-platform commit (“read parsed.data alone … leaving the missing ones unset, which the table drew as empty cells”). Robust importers must read `parsed.errors` + `parsed.meta` (delimiter, linebreak, truncated, cursor) and surface per-row issues, not silently coerce.
- Config surface that governs real files: `encoding` (FileReader encoding; Excel-generated files and non-UTF8 sources need explicit handling), `delimiter`/`newline` detection, `skipEmptyLines` (`false` vs `'greedy'`), `download:true` for remote files, `before/error/complete` per-file flow control in batch imports, `unparse` defaults (`quotes`, `quoteChar`, `escapeChar`, `delimiter`, `header`, `newline: "\r\n"`, `skipEmptyLines`, `columns`). Defaults do NOT cover inconsistent spreadsheets; the importer must expose delimiter/encoding/header-row overrides with preview.
- Recurring breakage to design for: non-UTF8/Excel encodings and BOM (`utf-8-sig` vs `utf-8`); semicolon-delimited exports; ragged rows (short/long vs header); duplicate headers (two `email` columns — dict-based parsing silently keeps one); embedded line breaks/quotes; header synonyms (“Tool”, “tool name”, “Item”); date/quantity/currency formats; leading/trailing whitespace; empty vs `N/A`/`NULL` missing markers; type coercion (`customer_id`/asset-tag must stay string). Python-side equivalents: `pd.read_csv(..., sep, encoding, na_values, parse_dates, dtype)` parameters exist precisely because no single default survives real sheets.
- R3 reformulation (missing governing condition): no observed primary enumerates THIS makerspace’s actual spreadsheet dialects. Reformulated Q6R: “What preview/repair loop lets staff import unknown dialects without developer help?” Discovery answer: staged import (upload → detect + preview first N rows with issues highlighted → column mapping with remembered synonyms → dry-run validation with per-row errors → commit with report + undo window), never direct-to-production import.

## Q7 — simple-hosting yet two-site architectures (O1 emergent; partially unanswered → R2)

Retrieval queue:
1. PocketBase (single Go binary, embedded SQLite, auth/realtime/storage/admin/REST, ~15–20MB, <30MB RAM, no Docker) — relevance high, applicability high for single-site simplicity.
2. Single-binary + SQLite + Litestream (Go/Rails patterns; WAL → S3; point-in-time restore) — relevance high, applicability high for durability.
3. PowerSync + Postgres (managed sync complexity for true multi-writer) — relevance high, applicability medium (ops cost).
4. CouchDB + PouchDB (multi-master, no single server truth) — relevance high, applicability medium (model departure).

Working cards: PocketBase single-binary; Litestream durability; PowerSync-or-CouchDB for two-site writes. Expanded to single-writer vs multi-master decision.

Findings:
- The brief contains a genuine architectural tension: “avoid complex hosting” points to single-binary + SQLite (PocketBase: download, `./pocketbase serve`, complete backend with auth/realtime/storage/admin; or any Go/Rails single-binary + SQLite + Litestream to S3/R2 for backup/PITR), but “two sites + unreliable Wi-Fi” with concurrent writes points away from single-node SQLite (single-writer model; Litestream is backup, not multi-writer; PocketBase is single-node). Both directions are useful; neither satisfies the whole brief alone.
- Three coherent alternatives retained: (A) Single-node simple core + offline-tolerant clients: one PocketBase/SQLite host (either site or tiny VPS), PWA with local queue (checkout/return/reserve intents stored locally, retried with idempotency keys, staff-visible outbox), Litestream to S3 for durability. Offline reads + queued writes; conflicts resolved at apply time with staff-visible rules. Least ops. (B) Multi-master documents (CouchDB + PouchDB): both sites fully writable offline with revision-tree conflicts surfaced to staff. Most offline-capable; departs from relational modeling and needs a reservation-arbitration layer. (C) Synced relational (PowerSync + Postgres): local SQLite UX with server Postgres truth and sync rules. Keeps SQL; adds the most operational surface. A fourth (single Postgres with exclusion constraints + PWA queue) is variant A with stronger double-booking guarantees at higher hosting cost.
- R2 reformulation (missing governing condition): no primary states which site, if any, can host the single node, nor whether brief outages may block reservations. Reformulated Q7R: “What may break, and where, during a partition — and who arbitrates scarce-tool conflicts?” Discovery answer: the decision is a user/staff call (see draft), but the system must make the partition behavior explicit (queue-and-confirm vs refuse-offline-reserve) rather than emergent.

## Q8 — domain-model alternatives (O1 emergent)

Retrieval queue:
1. Asset model (Snipe-IT: assets vs accessories vs consumables vs components; statuses; kits) — relevance high.
2. Part/stock model (InvenTree: parts, categories, cascading locations, serialized items, suppliers) — relevance high.
3. Grocery/consumable model (Grocy: barcode/batch/expiry/price history) — relevance medium.
4. Lending model (Circulate/Yale: members, holds/requests, loans, renewals, overdue, fines/fees) — relevance high.

Findings:
- No single observed model covers tools + consumables + repair + reservations. The useful synthesis is: lendable assets (unique tools, reservable, repairable, with per-asset history) + consumable stock (quantities by location, reorder points, batch/expiry where relevant) + repair cases (state machine + notes + parts used) + reservation intents (request → confirm → checkout → return/overdue). Snipe-IT’s asset/accessory/consumable/component + status-ladder split and InvenTree’s cascading locations + serialization are the two most transferable fragments; Grocy’s batch/expiry covers the consumable tail; Circulate/Yale cover the lending lifecycle.
- Conditions: keep asset tags string-typed (never numeric-coerce); locations cascade site → room → container; repair is a case with history, not a boolean; consumable checkout decrements with floor-at-zero math and low-stock events.

## O3 — issue / fix / regression / release chains (at least one; three retained)

### Chain 1 (primary): YaleSTC Reservations availability math — the lending regression surface
- Evidence (search-observed GitHub issues/PRs): PR #934 “[v3.4] #932 equipment availability issues” (fixed catalog availability/validation + subsequently discovered renewal issue; changed `reserved_in_date_range` to include start/end of range; converted reservation dates to Date for proper comparisons; updated specs); PR #985 “[v3.4] #982 availability floor” (catalog/calendar showed negative availability when equipment deactivated; fix floored display at zero); issue #1449 “Availability validation not working? [v5.5]” (after PR #1220, `reserved_in_date_range` returned only `reserved`, no longer `checked out`, so checked-out items stopped factoring into availability — a fix-induced regression with a reviewer noting the breakage at the time); issue #1131 “Availability validations cannot be overridden” (hard validations block even admin approval of requests via `#save`, raising the override-policy question); PR #625 (overdue items: unavailable during reservation + current day, available tomorrow — a policy encoded as availability math); PR #1580 ([1521] global option for requests to block availability).
- Evolution reading: availability is not one check but a family (catalog vs calendar vs validation; requests vs reservations vs checked-out vs overdue vs renewal; date-vs-datetime boundaries; display floor vs math floor). Fixes repeatedly regress adjacent members. The missing governing condition in each report is the same: no stated availability equation. Lesson for this brief: specify the equation first (which states count, over which interval, with which inclusivity, and whether requests block), then constrain + validate + display from that single definition. Without it, every “small fix” moves the bug.
- Applicability: directly transferable. Any makerspace reservation build will hit #932/#982/#1449-shaped bugs unless the equation + exclusion constraint + validation + display are designed together.

### Chain 2 (supporting): PapaParse Excel/encoding + FieldMismatch — the CSV silent-data-loss surface
- Evidence: PapaParse FAQ “Why do non-ASCII characters look weird?” (FileReader `encoding` config; issues #64 and #169 for Excel-generated files); PapaParse docs (`header:true` + `parsed.errors[]` + `parsed.meta`); observed mcp-data-platform fix `36f7dc5` (“fix(csv): read the file a spreadsheet wrote”): viewer used `Papa.parse header:true` and read `parsed.data` alone; short rows surfaced as `FieldMismatch` in `parsed.errors` but were drawn as empty cells — silent loss; fix met “the repair offer its line breaks earn.”
- Evolution reading: CSV failure modes recur across products (encoding → delimiter → ragged → duplicate headers → line breaks → synonyms). Each generation of importer fixes one layer and rediscovers the next. Lesson: treat `parsed.errors` as first-class input, stage imports with preview/repair, and remember mappings per source sheet.
- Applicability: directly transferable to “inconsistent old spreadsheets.” Absence claim: no makerspace-specific CSV dialect corpus observed (see R3).

### Chain 3 (supporting): PouchDB/CouchDB conflict model + Delta Sync — the offline-sync stability surface
- Evidence: PouchDB replication guide (multi-master, AP, deterministic winner, revision tree); conflicts guide (immediate 409 vs eventual conflicts; upsert delta pattern); secondaries noting PouchDB 9.0.0 Delta Sync (only syncing changes, up to ~50% bandwidth reduction in field apps) and the RxDB critique (resolving requires fetching all conflicting revisions, comparing, picking a winner, posting back — explicit, verbose, easy to get wrong); livesync-commonlib note (winner is a database choice, not evidence of newer/safer).
- Evolution reading: sync transport keeps improving (delta sync, bandwidth), but reservation arbitration does NOT come with it — every generation must still build explicit resolution. Lesson: adopt sync for transport, design arbitration separately, never present the deterministic winner as the fair outcome.
- Applicability: transferable to two-site checkout/reserve. Absence claim: no observed release in which CouchDB/PouchDB auto-arbitrates scarce-resource claims (by design it never will).

No evidence absent overall: O3 satisfied with one primary + two supporting chains. Where evidence was snippet-only (YaleSTC bodies not fully fetched), that limit is stated in `source-map.json` observed operations.

## O6 — validations: executed vs proposed (discriminating)

Executed (read-only; no runtime, no sandbox witnesses, no writes outside this research root):
- E1: Fetched primary docs for Postgres constraints, PouchDB replication/conflicts, PapaParse docs, Snipe-IT features, PowerSync overview, InvenTree index, Circulate repo (truncated saves noted in source map). Compared exclusion-constraint syntax across 5+ independent snippets for convergence.
- E2: Search-observed YaleSTC availability issues/PRs (6 records) and PapaParse encoding issues (FAQ + #64/#169 refs) to establish regression families.
- E3: Cross-checked single-binary claims (PocketBase size/RAM/serve command) and Litestream WAL→S3 role across 3+ independent snippets; confirmed Litestream is backup, not multi-writer.
- E4: Verified no plan read before freeze (this file written before invoking reveal script; `revealed-plan.md` absent at write time).

Proposed (discriminating; each would change the plan if it failed):
- P-V1 (double-booking): concurrency test — N parallel overlapping reservation attempts against candidate backend; pass = exactly one confirms without application pre-check (exclusion/serializable), or documented race window with staff-visible arbitration. Discriminates Postgres-exclusion vs app-only vs queue-and-confirm.
- P-V2 (offline): partition test — site B offline, checkout + reserve on both sites, reconnect; pass = no silent loss, every conflict surfaces with both versions + timestamps + actors, staff can pick a winner. Discriminates sync-transport-only vs arbitration-complete.
- P-V3 (CSV): hostile-corpus import — BOM + semicolons + ragged rows + duplicate headers + Excel encoding + embedded newlines; pass = per-row errors shown, nothing silently coerced, mapping remembered, dry-run before commit. Discriminates PapaParse-complete (`errors`+`meta` honored) vs `data`-only viewers.
- P-V4 (audit): repair-story query — “who had tool X when flag Y was raised, and what changed since?”; pass = answerable from per-item timeline + recent activity without DB diving. Discriminates ledger-complete vs current-state-only.
- P-V5 (hosting/ops): cold-start + backup/restore drill on candidate stack (single binary + Litestream to S3); pass = fresh operator restores to a known point within documented steps/time. Discriminates “simple” claimed vs simple demonstrated.
- P-V6 (availability equation): YaleSTC-derived matrix — requests block? overdue blocks tomorrow? checked-out counts? renewal inclusivity? cancelled/denied excluded?; pass = one equation implemented identically in constraint + validation + display, with tests per cell. Discriminates specified vs emergent availability.

## Uncertainty, disagreement, and conditions retained

- U1: No observed primary gives THIS makerspace’s spreadsheet dialects, site hosting constraints, or member scale — CSV and hosting depth stay conditional (R2/R3).
- U2: Circulate/Yale internals (exact constraints, offline behavior) not fully read; findings rest on repo descriptions + issue records, stated as such.
- U3: PowerSync/PocketBase version numbers drift fast; source map pins access time and treats versions as mutable with explicit drift.
- U4: Audit immutability/compliance needs unknown; no compliance claims made (R1).
- Disagreement preserved: single-node simplicity vs true two-site writability is a real trade-off with no evidence-backed winner; draft must present alternatives + a user decision, not a forced consensus.
- Conditions: `'[)'` range bounds + partial active-status predicate if Postgres; string-typed asset tags; cascading locations; repair-as-case; consumable floor-at-zero + low-stock events; staged CSV import with dry-run; offline intents with idempotency keys + visible outbox; deterministic sync winners never presented as fair outcomes.

## Source IDs used (immutable; details in source-map.json)

S01 Circulate repo; S02 Postgres ddl-constraints; S03 PouchDB replication; S04 PouchDB conflicts; S05 PapaParse docs; S06 Snipe-IT features; S07 PowerSync docs; S08 InvenTree docs; S09 YaleSTC availability issues/PRs; S10 PapaParse FAQ/encoding + mcp-data-platform CSV fix; S11 Postgres exclusion secondaries + check-then-insert race; S12 PocketBase single-binary; S13 Litestream; S14 lending landscape (MyTurn/Lend Engine/Shareable/tool-library FAQ); S15 CSV breakage reports; S16 conflict-model secondaries (revision-tree/delta-sync critiques); S17 inventory comparisons (Snipe-IT/InvenTree/Grocy/Shelf/PartKeepr); S18 offline-stack notes (PWA/service-worker, cr-sqlite rejection). No silent rebind; mutable pages marked with drift note + access timestamp.

## Freeze statement

Discovery complete to brief depth before plan comparison. Next: invoke `python3 /home/sittingmongoose/PM-Experiments/er11-20261009-116bb1e4/control/reveal-plan.py /home/sittingmongoose/PM-Experiments/er11-20261009-116bb1e4/jobs/A-M10-B/treatment/research`, then read `revealed-plan.md`, then write `draft.md` without rewriting this file.
