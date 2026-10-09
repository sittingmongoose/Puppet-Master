# S04 maker-inventory — discovery (pre-plan, M10)

Block A-M10-B, arm control, stage research. Case S04 maker-inventory.
Brief: inventory + reservation software for a community makerspace. Members reserve
tools; staff track consumables, repair status and checkout; two sites; unreliable
Wi-Fi; avoid complex hosting; CSV import from inconsistent old spreadsheets.
Investigate competing products, double-booking safeguards, offline behavior,
audit history, extension options.

Method M10 v1: competent conventional investigator researches brief questions
from the brief alone, follows leads, reads governing evidence, synthesizes a
complete draft. Plan was NOT read before this discovery. This file was frozen
before plan reveal and was not rewritten after reveal.

Obligations O1–O6 are addressed here for discovery (O1, O2, O3, O6-proposals);
per-P disposition (O4) and the self-contained final (O5) are in draft.md.

## 1. Product landscape (O1)

### 1.1 Makerspace-specific managers

**Fab-manager (sleede/fab-manager, open source, Ruby).** Web app for fablabs /
makerspaces: resource booking, machine management, member subscriptions,
training tracking, event organization, invoicing, tool documentation, project
repository federated across installations. Calendar widget uses FullCalendar.
Has plugins, single sign-on, Open API (community scraping notebooks use it).
Self-hosted; realistic for a makerspace with modest ops. Source S01.

**Fabman (SaaS + hardware, fabman.io).** Operating system for makerspaces/fab
labs/university workshops: smart bookings and reservations for machines/rooms/
desks, membership management with packages/plans, training tracking, machine
integration via Fabman Bridge (connects equipment in minutes, incl. RFID/door
controllers), access control paired with membership/training, usage-based
billing by the minute, maintenance. Example: Happylab Vienna runs ~1700 members
with one lab manager. Trade-off: recurring SaaS + hardware cost, vendor
dependence, needs internet for full function; gains: access control and billing
without building them. Source S02.

**MyTurn / Local Tools (myTurn.com PBC, SaaS for lending).** Built by the
founder of the West Seattle Tool Library for tool libraries and sharing
projects. Members browse inventory online, see availability, join/renew
memberships; staff track members, loans, whereabouts. Used by tool libraries
co-located with makerspaces (e.g. Lawrence, Comox Valley SHED, Cornwall with
367+ tools). Lending-centric rather than reservation-centric: checkout/checkin
custody matters more than calendar slots. Source S03.

**CommonsBooking (WordPress plugin, GPLv2, wielebenwir/commonsbooking).**
Management and booking of common goods (cargo bikes, tools) for associations
and community groups. Runs inside an existing WordPress site: items, locations,
timeframes, bookings. Best fit when the makerspace already has WordPress and
wants the lowest hosting step: no new service, WP hooks for extension.
Trade-off: WP data model and scaling limits, less inventory depth. Source S04.

**LibreBooking (fork of Booked Scheduler, PHP, LibreBooking/librebooking).**
Open-source resource scheduling: flexible mobile-friendly reservation UI,
resources/resource groups, blackouts, accessories, quotas, groups, AD/LDAP
integration, reservation API, Docker image. Based on Booked Scheduler's last
open-source release (2020, v2.8.5.1) and diverged since. Self-hostable on
ordinary PHP hosting. Reservation-centric: strong calendar/conflict/series
semantics, weak consumables/repair/audit depth. Conflict handling is
application-level (ReservationConflictIdentifier) plus schedule rendering; API
lacks the GUI's "Skip conflicting bookings" option (issue #1220). Source S05.

**Open Fab Control (early community OSS).** Aims to be an open alternative to
FabMan/ToolSquare for equipment, members, bookings, projects. Noted as an
approach signal (community-owned access control), not mature enough to adopt.
Mentioned via Fabman ecosystem search.

### 1.2 Inventory / asset / consumable systems

**Snipe-IT (open source, self-host or cloud, snipeitapp.com).** Asset management:
asset check-in/check-out with custody timeline (who/what/when/location),
consumables, accessories, licenses, users, audit logs and history, RBAC,
barcode/QR label generation and scanning, REST API (39-tool MCP surface exists
because the API is broad). 13 years, 330+ contributors, frequent releases.
Fits checkout + audit + repair-status tracking; reservations are not its core.
Source S07.

**InvenTree (open source MIT, Python/Django + PostgreSQL, inventree.org).**
Parts management + stock control: parts in structured categories, suppliers and
supplier items, stock locations, instant stock by part/location/build, batch
and serial tracking, BOM management, purchase orders, build orders,
stock-item history tracking with API pagination, barcode/QR, REST API, plugin
system, mobile app. Tech: Django + DRF + PostgreSQL. Fits consumables +
low-level stock truth + extensibility. Source S06.

**Grocy (open source PHP, grocy.info, current 4.7.1 released 2026-09-04).**
"ERP beyond your fridge": groceries/household management that maps directly to
consumables: stock overview, purchase/consume/inventory flows, shopping lists,
quantity units, barcode scanning, stock log with spoiled flag (waste log),
recipes/chores/batteries as adjacent domains, REST API, Home Assistant add-on,
Android (barcode + batch) and iOS clients, desktop build, Docker image.
Single-container hosting. Fits consumables + low-stock/reorder + barcode with
minimal ops. Source S08.

### 1.3 Materially different approaches (beyond "build a booking app")

1. **SaaS + hardware access control (Fabman)** vs **self-hosted monolith
   (Fab-manager / LibreBooking)** vs **WP plugin (CommonsBooking)** vs
   **compose-from-inventory-primitives (InvenTree + Snipe-IT + Grocy patterns)**.
   Choice changes cost, ops, data ownership, and which half (booking vs stock
   vs access) is strong.
2. **Reservation-centric** (calendar slots, conflicts, blackouts, series) vs
   **lending-centric** (checkout/checkin custody timeline, due dates, holds) vs
   **stock-centric** (quantity decrement, consume/purchase, batch/serial, BOM).
   The makerspace needs all three but they are different data models; calendar
   rows, custody events, and stock journals should not be forced into one table.
3. **Offline-first local-first** (PWA + local SQLite/IndexedDB + sync engine)
   vs **online-first with graceful degradation** (cached reads, queued writes,
   explicit offline mode) vs **paper/QR fallback** (printed sheets + offline
   spreadsheet, reconciled later). Two sites + unreliable Wi-Fi rules out
   pure online-first for checkout; but full local-first sync is the most
   complex option. Middle path: checkout/consumables work offline with queued
   intent log; reservations are tentative offline and confirmed on sync.
4. **Simple hosting ladder**: (a) existing WordPress + CommonsBooking;
   (b) single-container app (Grocy/InvenTree/LibreBooking Docker) on one small
   host; (c) BaaS (Supabase/Postgres) + static PWA; (d) full sync service
   (CouchDB or PowerSync Service + client SDKs). Each step adds ops. Avoid (d)
   unless offline conflict load justifies it. Never: bare SQLite file synced
   by file copy across two sites (loses concurrent writes).
5. **CSV import as data pipeline**: preview + column mapping + validation +
   quarantine (Frictionless-style) vs strict template rejection vs manual staff
   cleanup. Inconsistent old spreadsheets require the pipeline, not the
   template.

## 2. Governing behavior, defaults, limits, applicability (O2)

### 2.1 Double-booking safeguards

**PostgreSQL exclusion constraint (primary mechanism).** Docs S10 (PostgreSQL
18, section 5.5.6): an EXCLUDE constraint guarantees that if any two rows are
compared on specified columns/operators, at least one comparison fails. For
bookings:

```sql
CREATE EXTENSION IF NOT EXISTS btree_gist;
ALTER TABLE bookings ADD CONSTRAINT bookings_no_overlap
EXCLUDE USING gist (
  resource_id WITH =,
  tstzrange(starts_at, ends_at) WITH &&
) WHERE (status IN ('pending_payment','confirmed','completed'));
```

Semantics that matter: `&&` is range overlap; GiST index enforces it at the
DB level so even raw SQL or racing app servers cannot persist an overlap;
violation raises SQLSTATE 23P01 `exclusion_violation`, which the app must map
to a friendly "already booked" message. Requires `btree_gist` for `=` on
resource_id inside GiST. Use `tstzrange` (UTC) with half-open `[)` bounds so
back-to-back bookings do not conflict. Partial predicate limits the constraint
to active-ish statuses so cancelled/draft rows never block. Multi-resource
reservations need one row per resource (or a composite key per resource), not
one row with an array. Buffer/cleanup time is modeled by widening the stored
range or by a second constraint, explicitly, not by UI padding. This mechanism
does NOT exist in SQLite/MySQL without equivalents; choosing SQLite as primary
means giving up DB-level overlap truth. Offline-created reservations cannot be
exclusion-checked until they reach the server: they must be stored as
`tentative` and promoted to `confirmed` on sync, with explicit conflict tasks
on collision — never silent last-write-wins. Sources S10, S11.

**Application-level conflict checks (LibreBooking pattern).** Server-side
`ReservationConflictIdentifier` plus per-series expansion, blackouts, buffers,
quotas. The GUI offers "Skip conflicting bookings" for series; the API does
not (issue #1220), so API-built series fail wholesale on one conflict.
Rendering bugs can hide conflicts (see O3: tall-view fix). Rule: UI slot math
is presentation only; the server re-validates every create/update against
stored ranges, and the DB constraint is the backstop. Source S05.

**Lending holds vs calendar slots.** Tool checkout needs holds (due date +
grace + renewal) more than slots; consumables need quantity promises, not
exclusivity. Double-booking in the strict sense applies to exclusive-use tools
(laser cutter, CNC) and rooms; for lendable hand tools the safeguard is
quantity + custody (one borrower per copy), and for consumables it is
non-negative stock with explicit oversell policy (block vs allow-negative with
reason). Do not apply one mechanism to all three.

### 2.2 Offline behavior (two sites, unreliable Wi-Fi)

**PouchDB + CouchDB replication protocol.** PouchDB stores data locally in the
browser (IndexedDB/WebSQL) with the same API online and offline; on reconnect
it syncs with CouchDB-compatible servers (`live: true, retry: true` keeps a
real-time retrying sync). Conflicts surface as multi-revision documents with a
deterministic winner; the app must merge (inventory counts need explicit merge,
not revision-pick). Limits: JavaScript + MapReduce overhead on large datasets;
sync depends on a CouchDB-compatible backend; binary attachments and large
histories need care. Suits catalog/checkout reads and intent logging. Source
S12.

**PowerSync (SQLite sync engine).** Backend Postgres/Mongo/MySQL/SQL Server
replicates through the PowerSync Service, which partitions rows per user/device
(sync rules, e.g. by `site_id`/`outlet_id`) and streams to client-side SQLite
via SDKs (JS/Web, RN/Expo, Node, Flutter, Kotlin, Swift, .NET/Rust beta).
Reads/writes hit local SQLite at 0ms; writes queue locally and flush on
reconnect. Needs the PowerSync Service (managed cloud or self-hosted Docker)
plus per-platform SDK integration. Cannot do peer-to-peer LAN sync between two
offline devices with no path to the service. Suits full offline checkout +
stock decrement with structured sync, at the cost of running the service and
writing sync rules + conflict handlers. Source S09.

**Supabase-alone is NOT offline.** Every query goes to the server and fails
offline; there is no local store. Offline-first on Supabase means adding a
local Drift/SQLite store, UUID keys, soft deletes, an explicit outbox/sync
queue (push local edits before pull), scoped pulls by user/site, and a merge
policy (usually last-write-wins with an escape hatch, or explicit conflict
tasks for reservations). Auth needs an initial online login (JWT). Do not
claim "Supabase gives offline" without this layer. Source: Supabase offline
limitation survey.

**PWA shell.** Service Worker caches app shell/assets for instant load and
offline reads; it does not make writes transactional. Pair with one of the
above + an explicit "Offline — N queued" indicator, per-action queue state,
and a sync log staff can inspect.

**Applicability for this brief.** Recommended split: (a) catalog + tool status
+ member identity: cached reads, short TTL, explicit refresh; (b) checkout/
checkin + consumable consume/purchase: offline-writable intent log with local
sequence + actor + device clock, synced FIFO, idempotency keys; (c) exclusive
reservations: offline-creatable only as `tentative`, confirmed server-side
against the exclusion constraint; conflicts become staff tasks with both
claimants shown. Two sites sync through the server, never peer-to-peer.

### 2.3 Audit history

**Options compared.** `django-simple-history` (S13): stores full model state
on every create/update/delete; history tables auto-derived from models;
supports Django 5.2/6.0/6.1 with Python 3.10–3.14; admin integration;
`as_of`, `most_recent`, revert helpers; cost: full snapshots are heavy; misses
changes that bypass the ORM (raw SQL, bulk paths without signals).
`django-auditlog`: diff-only changed fields, lightweight, no rollback.
`django-pghistory`: PostgreSQL triggers, bulletproof including bulk/raw, more
ops. Raw Postgres trigger/temporal pattern (`valid_from/valid_to` + row audit):
strongest guarantee, hand-built queries. Snipe-IT pattern: custody timeline
(checkout/checkin/audit entries tied to user + location). InvenTree pattern:
stock tracking entries (deltas + user + notes + order links), paginated API
from the start (see O3). Sources S13, S06, S07.

**What the makerspace must log.** Reservation lifecycle (created/confirmed/
cancelled/no-show, actor, timestamps, reason); checkout/checkin (tool copy,
borrower, staff, due, condition notes); repair status transitions
(available/degraded/down/in-repair, who flagged, notes, photos optional);
consumable purchase/consume/adjust/spoil with quantity unit + location + order
link; CSV imports (original file hash, mapping, per-row disposition, actor).
Offline actions log local actor + device clock + local sequence at capture and
server accept time at sync; never overwrite capture time with sync time.

### 2.4 Consumables, units, types, limits (Grocy/InvenTree semantics)

Grocy 4.7.1: stock overview, purchase/consume/inventory pages prefillable per
product, shopping lists with low/out auto-queue, quantity units per product,
barcode lookup, stock log with `spoiled` flag as the waste log, volatile stock
for opened items. InvenTree: parts → stock items → locations; batch/serial;
merge/transfer/split; purchase/supplier and build/BOM flows; stock history
entries. Snipe-IT distinguishes consumables (quantity pools) from accessories
(copies). Rules: every consumable has an explicit unit (each/g/ml/m) and
conversions are explicit rows, never implicit; quantities are decimal with
scale fixed per unit; stock never goes silently negative — either block with a
friendly error or allow-negative only with reason + actor (maker policy
decision); low-stock thresholds per site, not global, because two sites hold
separate shelves. Sources S08, S06, S07.

### 2.5 CSV import from inconsistent spreadsheets

Failure modes observed in the wild: mixed delimiters (comma/semicolon/tab),
encoding (UTF-8 vs Windows-1252), uneven rows, missing fields, date ambiguity
(12-11-2023 = 12 Nov vs 11 Dec depending on locale), leading-zero loss
(001234 → 1234 when Excel coerces), spreadsheet formula markers (`=...`),
whitespace/case variance, merged cells and multi-line headers. Frictionless
Data approach (S14): package data with Table Schema (field names/types/
constraints), validate before import (`upload → preflight → decision →
import-or-review`), quarantine invalid rows with row-level errors, keep the
original file + mapping + report for audit. Workflow for this brief: upload →
detect encoding/delimiter → header normalize → column map preview (tool name,
copy id, site, status, quantity, unit) → validate (types, units, site codes,
status vocabulary) → import valid + quarantine invalid with reasons → staff
fixes quarantine in-app (not by re-uploading blind) → re-run. Never coerce
silently; never drop rows without a counted reason. Source S14.

### 2.6 Extension options

REST APIs: Snipe-IT (broad JSON REST), InvenTree (DRF + OpenAPI + plugins),
Grocy (REST incl. stock/shopping/calendar-ical), Fab-manager (Open API),
LibreBooking (reservation API). Webhooks/outgoing events for booking/
low-stock/repair pings (email/Slack/HA). Plugins/hooks: InvenTree plugins,
CommonsBooking WP hooks, Fab-manager plugins. Auth: Fab-manager SSO,
LibreBooking AD/LDAP, Snipe-IT 2FA/RBAC. Calendar: iCal export (Grocy),
FullCalendar embedding (Fab-manager). Hardware: Fabman Bridge/RFID for access
control; barcode/QR scanning (Grocy/InvenTree/Snipe-IT all support it); label
printing. Home Assistant MQTT/API for open/closed + machine state is a
user-decision extension, not core.

## 3. Issue / fix / regression / release chains (O3)

Three independent chains were investigated; each carries a design lesson.

**Chain 1 — LibreBooking conflict-detection miss, issue #920 → commit
7e80933 (2026-03-19).** Tall-view schedule rendering used a `data-min` value
instead of actual reservation timestamps and dropped slot height for hidden
blocked periods, so conflict detection could miss overlapping reservations.
Fix introduced an `isEndApproximate` flag to restore the missing height and
switched data attributes to `res.StartDate/res.EndDate` directly
(`Web/scripts/schedule.js`, closes #920). Companion gap: API lacks the GUI's
"Skip conflicting bookings" (issue #1220). Lesson: rendered slots must never
be conflict truth; the server re-validates against stored ranges and the DB
exclusion constraint backstops it. Sources: search-observed commit/issue
records S15/S16.

**Chain 2 — Grocy 4.7.0 breaking change → 4.7.1 + downstream fixes.**
4.7.0 reorganized auth middleware (`AUTH_CLASS` →
`Grocy\Middleware\Auth\DefaultAuthMiddleware`), invalidated all web sessions,
and stopped exposing `USER_USERNAME`/`USER_ID` from `GET /system/config`.
Downstream `grocy-py`/Home-Assistant integrations broke: ValidationError
against 4.7.x, `TypeError: u.map is not a function` on non-array bodies, and
Grocy answering every request with an HTML error page under HTTP 200 when
`config.php` still named the old class. 4.7.1 (2026-09-04) fixed the iCal
export 401, product-copy field loss, accent-insensitive filters, and non-latin
password login. Lesson: extension/API contracts need versioning, deprecation
windows, machine-readable errors with correct status codes, and integration
tests asserting documented response shapes. Sources S08, S17.

**Chain 3 — InvenTree stock history gaps → PR #4541 (+ #4488, #4631) + app
PR #320.** Shipping against a sales order omitted the sales-order link from
stock history; PR #4488 fixed new writes, PR #4541 backfilled old tracking
entries via data migration; later work paginated the stock-history API
(#4631) and refactored the app history widget as paginated (#320, app 0.11.4).
Lesson: write the causal link (order/event/reason) into the audit entry at
write time; backfills are expensive; paginate history APIs and widgets from
day one because checkout/consumable logs grow fast. Sources S06, S18.

No evidence was found of a makerspace-specific double-booking regression with
public postmortem depth beyond Chain 1; that absence is stated (O3 allows
absent/inapplicable with explicit note).

## 4. Conditions, alternatives, disagreement, uncertainty (carried to draft)

- Original constraints preserved: two sites, unreliable Wi-Fi, avoid complex
  hosting, CSV import from messy sheets, members reserve / staff track
  consumables + repair + checkout.
- Open alternatives: adopt-and-configure (Fab-manager / LibreBooking +
  InvenTree-or-Grocy sidecar) vs focused custom build (one DB, three journals:
  reservations, custody, stock) vs SaaS (Fabman/MyTurn) where budget allows.
  No single surveyed product covers reservations + consumables + repair +
  offline + 2-site + simple hosting alone.
- Disagreement noted: SaaS+hardware (Fabman) is operationally simplest for
  access/billing but conflicts with "avoid complex hosting" the least while
  conflicting with data-ownership/frugality the most; local-first sync is
  technically strongest for offline but heaviest to run. The draft keeps both
  as explicit options with conditions.
- Uncertainty: real conflict load (how often two sites touch the same tool
  offline), staff barcode/label appetite, repair workflow depth (simple flag
  vs work orders), consumable unit chaos in legacy sheets, whether WordPress
  already exists (CommonsBooking viability), budget for SaaS/hardware. Each
  maps to a user decision in draft.md, not a guess.

## 5. Discriminating validations (O6): proposed vs executed

**Executed in this research stage:** none requiring runtime. Web reads only
(search + fetch of public docs/repos/changelogs). No sandbox witness was run:
no existing qualified sandbox was available to this stage, and sources were
treated as data (no downloaded executables, no installs). Proposed checks
below are honest proposals, not run results.

- **V1 double-booking race (discriminates DB truth vs app-only).** Two
  concurrent overlapping exclusive-tool bookings → exactly one commits; the
  other gets `exclusion_violation` mapped to "already booked". Extend: same
  tool reserved at both sites while offline → sync yields one confirmed + one
  conflict task showing both claimants, never silent overwrite.
- **V2 offline checkout (discriminates queued-intent vs offline-fail).**
  Airplane-mode checkout + filament consume → queued with local seq/actor/
  device-clock → reconnect → server reflects both; audit shows capture vs
  accept times distinctly.
- **V3 CSV quarantine (discriminates pipeline vs template).** Feed a hostile
  CSV: mixed delimiters, DD-MM vs MM-DD dates, leading-zero codes, uneven
  rows, formula cell, Windows-1252 encoding → preview maps columns, invalid
  rows quarantine with row-level reasons and counts, valid rows import,
  original file hash + mapping retained.
- **V4 audit completeness (discriminates ORM-only vs trigger/custody truth).**
  Run checkout → flag repair → checkin → consume → adjust across two sites;
  history shows actor/time/reason/order-link for every step with no gaps;
  bulk/raw paths either log or are forbidden by role.
- **V5 extension contract (discriminates versioned API vs breakage).**
  Third-party client books + consumes via REST; simulate a field rename/
  auth-class move → client receives versioned machine-readable error with
  correct status, never HTML-200; documented shape tests pin the contract.
- **V6 two-site stock split (discriminates per-site vs global).** Same
  consumable held at both sites; consume below threshold at one site fires
  low-stock for that site only; transfer moves quantity with reason + actor.

Each validation names pass/fail signals; draft.md keeps them as the build's
acceptance spine.

## 6. Source notes

Immutable source IDs S01–S18 are defined in source-map.json. Bounded
permitted excerpts are retained in sources/ with a navigable index. Mutable
HEAD pages (GitHub READMEs, docs/latest) are marked mutable with access
timestamps; stable points (Grocy 4.7.1 changelog, Postgres 18 docs, LibreBooking
commit 7e80933, InvenTree PR #4541, django-simple-history Django/Python matrix)
are cited at their versions. Usage/billing figures were not observed; recorded
as null per assignment.
