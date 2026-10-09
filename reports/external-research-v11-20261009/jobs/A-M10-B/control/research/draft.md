# S04 maker-inventory — complete draft (post-reveal, M10)

Block A-M10-B, arm control, stage research. Case S04 maker-inventory.
This draft is the complete planning deliverable for this scope; later stages
may correct it. Discovery (discovery.md + source-map.json + sources/) was
frozen before plan reveal and was not rewritten after reveal.

Original constraints (preserved): community makerspace, two sites,
unreliable Wi-Fi, members reserve tools, staff track consumables + repair
status + checkout, avoid complex hosting, CSV import from inconsistent old
spreadsheets. Required investigations: competing products, double-booking
safeguards, offline behavior, audit history, extension options.

## 1. Recommended plan

### 1.1 Adopt-or-build decision (condition)

No single surveyed product covers reservations + consumables + repair +
offline + two-site + simple hosting alone. Three viable routes, in order:

**Route A — configure two focused tools (default).** LibreBooking (or
Fab-manager where training/membership depth matters) for exclusive-use
reservations + InvenTree (or Grocy where single-container simplicity wins)
for consumables/stock, sharing member identity via SSO/LDAP and tool catalog
via nightly CSV/API sync. Best when staff accept two UIs and ops accept two
small containers. Lowest custom code.

**Route B — focused custom build (one DB, three journals).** One Postgres,
one PWA: reservations journal (exclusive tools/rooms), custody journal
(lendable copies: checkout/checkin/holds), stock journal (consumable
movements). Shared members/tools/sites catalog, one audit trail, one CSV
pipeline, one offline outbox. Best when a single UI and true two-site offline
checkout matter more than build cost. This draft specifies Route B's data
rules so Route A adopters can still apply them as configuration.

**Route C — SaaS where budget allows.** Fabman for access-controlled
equipment + billing, MyTurn for lending, possibly both. Best when hardware
access control and payments outweigh data-ownership/frugality. Offline and
CSV depth must be validated against the vendor, not assumed.

WordPress + CommonsBooking is a valid Route A variant only if the makerspace
already runs WordPress and lending volume is low; it does not supply
consumables depth or robust offline.

### 1.2 Data model (three journals + catalog)

Catalog: members, tools (with kind: exclusive-slot | lendable-copy |
consumable-pool), copies (for lendable), sites, quantity units, suppliers.
Journals (append-only, never overwrite):

1. **Reservations** (exclusive-slot tools, rooms): one row per
   (reservation, resource) with `tstzrange(starts_at, ends_at)` half-open
   `[)`, UTC, `status` lifecycle
   `tentative → confirmed → completed | cancelled | no_show`, actor,
   reason/notes, idempotency key, capture vs accept timestamps.
2. **Custody** (lendable copies): checkout/checkin/renew/hold events with
   copy id, borrower, staff, site, due date, condition notes, idempotency key.
3. **Stock** (consumables): purchase/consume/adjust/spoil/transfer movements
   with part, site, signed decimal quantity, explicit unit, order link,
   reason, actor. Current quantity is derived (sum), never a bare
   overwritten cell. Per-site balances; transfers move quantity with reason.
4. **Repair status** as a state machine per tool/copy:
   `available | degraded | down | in_repair | retired`, each transition with
   actor, timestamp, reason, notes (free text lives here as notes, not as
   status), optional photos. `down`/`in_repair` block new reservations and
   flag existing ones for staff action.
5. **Import runs**: original file hash + mapping + per-row disposition
   (imported/quarantined + reason) + actor + timestamp.

### 1.3 Double-booking safeguards

Postgres is the overlap truth for exclusive resources:

```sql
CREATE EXTENSION IF NOT EXISTS btree_gist;
ALTER TABLE reservations ADD CONSTRAINT reservations_no_overlap
EXCLUDE USING gist (
  resource_id WITH =,
  tstzrange(starts_at, ends_at) WITH &&
) WHERE (status IN ('tentative','confirmed','completed'));
```

Include `tentative` in the predicate only if tentative rows are server-side;
client-offline tentatives live in the outbox and are promoted on sync (see
1.4), so they cannot collide silently. Violation `23P01 exclusion_violation`
maps to "already booked for that time". Back-to-back bookings use half-open
bounds and never conflict. Buffer/cleanup time widens the stored range
explicitly. Multi-resource bookings write one row per resource. Lendable
copies use one-borrower-per-copy + holds, not ranges; consumables use
non-negative policy (block, or allow-negative only with reason + actor per
maker policy). Server re-validates every create/update; calendar UI
(FullCalendar-style) is presentation only and never conflict truth — the
LibreBooking tall-view miss (issue #920 → commit 7e80933) is the cautionary
case. The reservation API must match GUI semantics including series
conflict-skip behavior, or document the gap (LibreBooking #1220 gap).

### 1.4 Offline behavior (two sites, unreliable Wi-Fi)

Split by write kind. Catalog/tool-status/member reads: cached with short TTL
+ explicit refresh + stale banner. Checkout/checkin + stock movements:
offline-writable **intent outbox** with local sequence, UUID idempotency key,
actor, device clock, payload; synced FIFO on reconnect; server stamps accept
time separately and never overwrites capture time. Exclusive reservations
created offline stay `tentative` (outbox) and are confirmed server-side
against the exclusion constraint; collisions become explicit conflict tasks
showing both claimants, never silent overwrite or last-write-wins. UI shows
"Offline — N queued" with per-action state and a staff-visible sync log.
Sync transport: server-mediated only (both sites sync through the server;
no peer-to-peer). Technology: start with app-owned outbox + Postgres; add a
sync engine (CouchDB/PouchDB or PowerSync Service + client SQLite SDKs) only
if conflict volume justifies running it. Supabase-alone or any
server-query-only BaaS does not supply offline; it needs the same local
store + queue + merge layer. Service Worker caches shell/assets only.

### 1.5 Audit history

Every journal write records actor, capture time, accept time, reason/order
link, before/after for state transitions. History APIs and widgets are
paginated from day one (InvenTree #4541/#4631 lesson: causal links at write
time, backfills expensive, unpaginated logs collapse). ORM-level history
(django-simple-history-style full snapshots, or auditlog-style diffs) is
acceptable only if bulk/raw paths are forbidden by role or also logged;
otherwise use DB triggers (pghistory/temporal style). CSV imports, repair
transitions, reservation lifecycle, custody, and stock movements all appear
in one staff-queryable trail with site scoping.

### 1.6 CSV import pipeline (never overwrite on names)

`upload → detect encoding/delimiter → normalize headers → column-map preview
→ validate → import valid + quarantine invalid → staff fixes quarantine
in-app → re-run`. Detects UTF-8/Windows-1252, comma/semicolon/tab, uneven
rows, missing fields, date ambiguity (force locale-explicit parse, reject
ambiguous), leading-zero codes (treat codes as text, never numeric coerce),
formula markers, whitespace/case variance. Name matches are suggestions only;
staff confirm identity, system mints stable IDs thereafter. Original file
(hash), mapping, row counts, and per-row reasons are retained in the import
run. Nothing is silently dropped or coerced.

### 1.7 Extensions

Versioned REST API for bookings/custody/stock/repair/imports with
machine-readable errors and correct status codes (Grocy 4.7.x lesson: never
HTML-200 on errors; never rename/remove fields without deprecation).
Webhooks for booking/low-stock/repair events. Barcode/QR scan + label print
for copies and consumable bins. iCal export for member bookings. SSO/LDAP for
shared identity. Plugin/hook points for reports. Hardware access control
(Fabman Bridge/RFID) and Home Assistant state are explicit optional
extensions with their own budgets, not core acceptance.

### 1.8 Hosting (simple first)

Single small host: Postgres + app container + static PWA (Route B), or two
small containers (Route A). No separate sync service, search cluster, or
multi-region setup at this scale. Backups: nightly Postgres dump + file
store, restore-tested. If SaaS (Route C), hosting is vendor-owned but export
(API + CSV) is contractual.

## 2. Exact per-P disposition (O4)

Disposition vocabulary: correction (P's intent kept, mechanism replaced),
optional enhancement, user decision, already-covered, rejected, uncertain.
Each P is quoted exactly.

**P1: "Use a shared calendar for reservations." — CORRECTION.**
Keep the calendar as the member-facing view; reject it as the booking truth.
A shared calendar alone provides no resource-scoped overlap guarantee, no
status lifecycle, no tentative-vs-confirmed offline semantics, no series/
blackout/buffer rules, and no audit. Replace with Section 1.3: reservations
journal + Postgres exclusion constraint + server re-validation + API/GUI
parity. Already-covered calendar-UI patterns: Fab-manager FullCalendar,
LibreBooking schedule views. Uncertain (user decision): whether rooms/desks
join the same engine or stay a plain calendar — decide by contention; if
rooms rarely contend, plain calendar + light conflict warning is acceptable.

**P2: "Keep stock quantities in a database row updated by each client." —
CORRECTION (the stated mechanism is REJECTED).**
Direct row overwrite loses concurrent decrements (two sites consume → one
write clobbers), has no audit, no per-site balances, no units, no
idempotency for retried offline syncs. Replace with Section 1.2/1.4 stock
journal + derived balances + explicit units + idempotency keys + per-site
thresholds. Already-covered quantity-pool semantics: Grocy stock log,
InvenTree tracking entries, Snipe-IT consumables. No part of "each client
updates the same row" is retained.

**P3: "Permit offline checkout and reconcile by timestamp." — CORRECTION.**
Timestamp-only reconcile is last-write-wins with device-clock skew: it
silently drops a checkout, a consume, or a repair flag, and cannot express
double-lend/double-book conflicts. Replace with Section 1.4 outbox (local
seq + UUID + actor + device clock, FIFO sync, server accept time) and
explicit conflict tasks; reservations stay tentative until server-confirmed.
Already-covered transport patterns: PouchDB/CouchDB live-retry sync,
PowerSync local-SQLite queue, Supabase-plus-local-outbox. Uncertain (user
decision): conflict UX wording and SLA (auto re-offer next slot vs staff
mediation) — decide with staff, not in code.

**P4: "CSV import overwrites matching names." — REJECTED.**
Name matching is ambiguous (case/whitespace/diacritics/duplicates across two
sites) and overwrite destroys curated data with no undo, no validation, no
quarantine, no audit. Nothing of this mechanism is retained. Replace with
Section 1.6 pipeline: explicit mapping preview, validation, quarantine with
row reasons, staff-confirmed identity, stable IDs, retained import runs.
Optional enhancement (user decision): fuzzy-match suggestions (accent/
case-insensitive) as hints only, never auto-merge without staff confirm.

**P5: "Tool maintenance is a free-text note." — CORRECTION.**
Free text as the whole story loses the safety-critical state (is this tool
bookable right now?), accountability (who flagged/cleared, when, why), and
booking guards. Replace with Section 1.2 repair state machine + transition
log + booking/checkout guards; keep free text as the notes field inside each
transition, plus optional photos. Already-covered adjacent patterns:
Snipe-IT custody/audit entries, InvenTree condition/history. Optional
enhancement (user decision): lightweight work orders (assigned-to, due,
parts) if repair volume justifies it; otherwise status + notes suffices.

**P6: "Test normal reservation and check-in flows." — CORRECTION
(insufficient; retained as smoke only).**
Happy-path tests cannot discriminate the failure modes this brief exists
for: races, offline conflicts, hostile CSV, audit gaps, contract breakage,
two-site splits. Keep normal flows as smoke; acceptance is Section 4 V1–V6,
each with explicit pass/fail signals. Already-covered: none of V1–V6 is
covered by P6. No part of P6 is rejected — it is demoted to pre-acceptance
smoke.

## 3. Retained alternatives, conditions, disagreement (O5)

- **Route A vs B vs C** (Section 1.1) with conditions is the retained
  alternative set; the choice turns on staff UI tolerance, build capacity,
  and SaaS/hardware budget, not on technical superiority alone.
- **Sync depth ladder**: app-owned outbox (default) → CouchDB/PouchDB →
  PowerSync Service. Escalate only on measured conflict pain; each step's
  ops cost is explicit.
- **Stock negativity**: block-by-default; allow-negative-with-reason is a
  documented maker-policy user decision, not a default.
- **Disagreement preserved**: Fabman-style SaaS+hardware is operationally
  simplest for access/billing yet weakest for data-ownership/frugality and
  unproven here for offline depth; local-first sync is strongest offline yet
  heaviest to run. Both stay options with the stated conditions.
- **Repair depth**: status + notes vs work orders (user decision by volume).
- **Rooms/desks**: full reservation engine vs plain calendar (user decision
  by contention).
- **Fuzzy CSV matching**: hints-only vs staff-confirmed auto-merge for
  exact-normalized matches (user decision; default hints-only).

## 4. Validations: proposed vs executed (O6)

**Executed:** no runtime checks. This research stage performed public web
reads only (search + fetch of docs/repos/changelogs, treated as data). No
qualified sandbox was available to run witnesses; no installs, no downloaded
executables, no hosted trial mutations. Everything below is a proposed
discriminating validation for build acceptance, not a run result.

- **V1 double-booking race.** Fire two concurrent overlapping bookings for
  one exclusive tool → exactly one confirms; the other surfaces "already
  booked" (exclusion 23P01 mapped). Offline variant: same tool tentatively
  reserved at both sites offline → sync yields one confirmed + one conflict
  task naming both claimants. Fail: two confirmed overlaps, silent
  overwrite, or generic 500.
- **V2 offline checkout.** Airplane-mode checkout + consumable consume →
  queued with local seq/actor/device-clock → reconnect → server reflects
  both; audit shows capture vs accept times distinctly. Fail: lost write,
  duplicated write on retry (missing idempotency), or merged timestamps.
- **V3 hostile CSV.** Import a CSV with mixed delimiters, DD-MM vs MM-DD
  dates, leading-zero codes, uneven rows, a formula cell, Windows-1252 bytes
  → column-map preview, ambiguous dates rejected (not guessed), codes kept
  as text, invalid rows quarantined with row-level reasons + counts, valid
  rows imported, original hash + mapping retained. Fail: silent coerce,
  dropped rows without reasons, or name-overwrite.
- **V4 audit completeness.** Run checkout → flag degraded/down → checkin →
  consume → adjust → transfer across two sites; every step shows
  actor/capture/accept/reason/order-link with no gaps; bulk/raw paths either
  log or are role-forbidden; history endpoints paginated. Fail: missing
  link, unpaginated collapse, or bypass without trace.
- **V5 extension contract.** Third-party client books + consumes via versioned
  REST; simulate a field rename/auth change → versioned machine-readable
  error with correct status; documented-shape tests pin requests/responses.
  Fail: HTML-200 error, silent field drop, or unversioned break (Grocy 4.7.x
  pattern).
- **V6 two-site stock split.** Same consumable stocked at both sites; consume
  below threshold at site A → low-stock fires for A only; transfer A→B moves
  quantity with reason + actor and both balances update. Fail: global
  threshold misfire or untraced transfer.

Smoke (from P6, retained): normal reservation create/cancel + normal
checkout/checkin pass before V1–V6 run.

## 5. Uncertainty register (carried, not guessed)

Real offline conflict rate between sites; legacy sheet chaos depth (units,
dup names, date locales); staff appetite for barcode/label discipline;
repair volume (flag vs work orders); whether WordPress exists
(CommonsBooking viability); SaaS/hardware budget; room/desk contention.
Each maps to a Section 3 user decision with a default that ships safely.

## 6. Source lineage (summary, not substitution)

All technical claims above are spelled out in this draft's own words (O5:
no ID-substitution). Lineage for audit: Fab-manager (open-source makerspace
booking/membership/training), Fabman (SaaS + bridge access/billing),
MyTurn (lending platform), CommonsBooking (WP plugin), LibreBooking (PHP
reservation fork; #920/#1220 conflict lessons), InvenTree (Django/Postgres
stock + PR #4541 history lesson), Snipe-IT (checkout/audit/API), Grocy 4.7.1
(consumables + 4.7.x contract lesson), PowerSync (SQLite sync engine),
Postgres 18 exclusion constraints + btree_gist booking pattern,
PouchDB/CouchDB replication, django-simple-history matrix, Frictionless
validation pipeline. Exact URLs/versions/commits/access times are in
source-map.json (S01–S18); bounded excerpts + index in sources/.
Usage/billing figures: unobserved (null).
