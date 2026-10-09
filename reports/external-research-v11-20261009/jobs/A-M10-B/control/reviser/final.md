# S04 maker-inventory — final (reviser, M10, control arm)

Block A-M10-B, arm control, stage reviser. Case S04 maker-inventory.
Method M10 v1 question-relevance-reformulation.

This is the ONE coherent complete final for this scope. It covers the full
brief, obligations O1–O6, and every exact P clause, adjudicating each
criticism explicitly. Predecessor IDs (S01–S18, C01–C05, R01–R07) are lineage
only: all material claims are spelled out here in full text (O5: no
ID-substitution).

Inputs read in full (own arm only, per input-map.json): `cases/S04/brief.md`,
research `draft.md`, `discovery.md`, `revealed-plan.md`, `source-map.json`
(S01–S18) plus research `sources/index.md`, critic `critique.md` and
`source-map.json` (C01–C05) plus critic `sources/index.md`. No
campaign/history/evaluator/counterpart material was read. Independent
reviser verification: R01–R07 (see source-map.json + sources/index.md).

Original constraints (preserved): community makerspace; two sites;
unreliable Wi-Fi; members reserve tools; staff track consumables, repair
status and checkout; avoid complex hosting; CSV import from inconsistent
old spreadsheets. Required investigations: competing products,
double-booking safeguards, offline behavior, audit history, extension
options.

## 1. Recommended plan

### 1.1 Adopt-or-build decision (condition)

No single surveyed product covers reservations + consumables + repair +
offline + two-site + simple hosting alone. Three viable routes, in order:

**Route A — configure two focused tools (default).** LibreBooking (or
Fab-manager where training/membership depth matters) for exclusive-use
reservations + InvenTree (or Grocy where single-container simplicity wins)
for consumables/stock. Custody variant: Snipe-IT joins or replaces the
stock side where checkout-timeline/audit/barcode depth matters more than
parts/BOM depth — Snipe-IT is custody-native (check-in/out timeline, audit
log, barcode/QR, broad REST API) while InvenTree is stock-native
(parts/locations/BOM/purchase); they overlap on quantity pools, not on
custody. Best when staff accept two UIs and ops accept two small
containers. Lowest custom code, but purchasable only after the two
integration proofs below (M2 close-out).

Route A integration proofs (required before adoption):

1. Identity. LDAP is the candidate common denominator:
LibreBooking evidences AD/LDAP, InvenTree evidences LDAP (docker) plus
SSO backends via django-allauth, Grocy evidences LDAP auth middleware
plus reverse-proxy header auth; Fab-manager evidences SSO of
unspecified protocol. The adopter must cite-or-test the intersection
for the chosen pair (e.g. LibreBooking + InvenTree over one LDAP/AD).
Fallback if no intersection is proven: separate logins reconciled by
the catalog sync, with the audit cost stated (actor attribution spans
two identity namespaces and must be joined on the reconciled member
key; see §1.5).
2. Catalog/status sync ownership and drift bound. The asset/stock side
owns repair/condition truth; the booking side owns reservation truth
and enforces a cached copy of tool status. Status sync interval is a
safety parameter, default: repair/status sync ≤ 15 minutes
(event-driven webhook where the tools support it, else short-poll),
full catalog nightly. Inside the lag window the booking tool shows
"status as of HH:MM" and requires staff confirm for any tool whose
cached status is not `available`. A tool flagged `down` on the asset
side blocks new reservations no later than the status-sync bound.

Route A offline caveat (accepted): the surveyed booking/stock web UIs
generally do not queue writes offline. Route A's offline story for
checkout/consumables therefore rests on an adopter-built PWA outbox
(§1.4) or on native clients that cover only part of the domain (e.g.
Grocy mobile apps cover the consumables half). Price that PWA before
claiming Route A is offline-capable.

**Route B — focused custom build (one DB, three journals).** One Postgres,
one PWA: reservations journal (exclusive tools/rooms), custody journal
(lendable copies: checkout/checkin/holds/transfers), stock journal
(consumable movements). Shared members/tools/sites catalog, one audit
trail, one CSV pipeline, one offline outbox. Best when a single UI and
true two-site offline checkout matter more than build cost. This final
specifies Route B's data rules so Route A adopters can still apply them
as configuration acceptance (e.g. V1 becomes "the booking tool's native
conflict guarantee demonstrated under race").

**Route C — SaaS where budget allows.** Fabman for access-controlled
equipment + billing, MyTurn for lending, possibly both. Best when hardware
access control and payments outweigh data-ownership/frugality. Offline and
CSV depth must be validated against the vendor, not assumed.

WordPress + CommonsBooking is a valid Route A variant only if the
makerspace already runs WordPress and lending volume is low; it does not
supply consumables depth or robust offline.

### 1.2 Data model (three journals + catalog)

Catalog: members (one account spans both sites by default; training and
standing attestations transfer; holds are site-scoped), tools (kind:
exclusive-slot | lendable-copy | consumable-pool; site binding: exclusive
tools site-bound unless flagged portable, lendable copies transferable
with staff authorization), copies (for lendable), sites, quantity units,
suppliers. Journals (append-only, never overwrite):

1. **Reservations** (exclusive-slot tools, rooms): one row per
(reservation, resource) with `tstzrange(starts_at, ends_at)` half-open
`[)`, UTC, `status` lifecycle
`tentative → confirmed → completed | cancelled | no_show`, actor,
reason/notes, idempotency key, capture vs accept timestamps, series_id
for expanded series. Series expand at create: one row per instance
sharing a series_id. Blackouts are blocked ranges per resource.
Buffer/cleanup is stored as booking-range + buffer (buffer_minutes or
an explicitly linked blocked range), displayed as the unpadded booking
with the buffer distinguished; conflict checks cover booking + buffer.
Quotas (per-member booking caps) are deferred post-acceptance (user
decision).
2. **Custody** (lendable copies): checkout/checkin/renew/hold/transfer
events with copy id, borrower, staff, site, due date, condition notes,
idempotency key. Defaults: due 7 days, grace 3 days, hold expiry 7
days, renewals 2 unless held; staff override. Holds form a queue
(position, expiry, promotion on checkin). Copy site-transfer moves a
copy with reason + actor; its hold queue and due state travel with it;
one audit entry records the move. One-borrower-per-copy is enforced by
the partial-unique backstop in §1.3, not by application checks alone.
3. **Stock** (consumables): purchase/consume/adjust/spoil/transfer
movements with part, site, signed decimal quantity, explicit unit,
order link, reason, actor, idempotency key. Current quantity is
derived (sum), never a bare overwritten cell. Per-site balances;
transfers move quantity with reason. Concurrency control (M1
close-out): under block-by-default, every consume/transfer-out runs
inside a transaction that locks a per-(part, site) stock-control row
`SELECT ... FOR UPDATE`, re-reads the derived balance, and only then
appends the movement; concurrent consumers serialize on the control
row so exactly one outcome commits. Under the allow-negative
user-decision policy no lock is taken and reason + actor are mandatory.
4. **Repair status** as a state machine per tool/copy:
`available | degraded | down | in_repair | retired`, each transition
with actor, timestamp, reason, notes (free text lives here as notes,
not as status), optional photos. Blocking rules: `down`, `in_repair`
and `retired` block new reservations and checkouts and flag existing
ones for staff action; `degraded` warns and requires staff override
for exclusive tools, blocks nothing for lendables by default.
5. **Import runs**: original file hash + mapping + per-row disposition
(imported/quarantined + reason) + actor + timestamp. Quarantine
retention 90 days; re-running the same file hash is a no-op pointer
to the first run (idempotent); mapping templates are reusable per
supplier/sheet.

### 1.3 Double-booking and double-lend safeguards

Postgres is the overlap truth for exclusive resources (current docs plus
back-compat: exclusion constraints are stable since long before v18;
the `/docs/current/` URL is the right pin):

```sql
CREATE EXTENSION IF NOT EXISTS btree_gist;
ALTER TABLE reservations ADD CONSTRAINT reservations_no_overlap
EXCLUDE USING gist (
  resource_id WITH =,
  tstzrange(starts_at, ends_at) WITH &&
) WHERE (status IN ('tentative','confirmed','completed'));
```

`completed` participates because completed rows are historical truth
retained for audit; past ranges cannot overlap future ones so inclusion
is harmless and also blocks backdated overlaps, while cancelled/no-show
rows never occupied the resource and are excluded from the predicate.
Server-side `tentative` rows participate; client-offline tentatives
live in the outbox and are promoted on sync (§1.4), so they cannot
collide silently. Violation `23P01 exclusion_violation` maps to
"already booked for that time". Back-to-back bookings use half-open
bounds and never conflict. Multi-resource bookings write one row per
resource. Frozen-discovery vocabulary note: discovery's predicate
(`pending_payment/confirmed/completed`) is the pre-plan wording of the
same active-ish set as this final's
(`tentative/confirmed/completed`); `pending_payment` ≈ pre-confirmation
hold, renamed `tentative` after reveal.

Custody backstop (M5 close-out): application checks alone re-create the
double-lend under concurrent checkout, including the offline-promotion
race. Enforce one open checkout per copy at the DB level:

```sql
CREATE UNIQUE INDEX custody_one_open_checkout
ON custody_events (copy_id)
WHERE (event_type = 'checkout' AND returned_at IS NULL);
```

Idempotency keys are unique per journal on the server
(`UNIQUE (journal, idempotency_key)` or per-table equivalents on
reservations/custody/stock writes); retried offline syncs dedupe on
the key instead of double-applying.

Consumables use the §1.2 control-row lock with non-negative policy
(block-by-default; allow-negative only with reason + actor per maker
policy). Server re-validates every create/update; calendar UI
(FullCalendar-style) is presentation only and never conflict truth —
the LibreBooking tall-view miss (issue #920 → commit 7e80933, fetched:
`isEndApproximate` flag restoring hidden-blocked-period height and
`res.StartDate/res.EndDate` replacing `data-min` in
`Web/scripts/schedule.js`) is the cautionary case. The reservation API
must match GUI semantics including series conflict-skip behavior, or
document the gap: LibreBooking issue #1220 (fetched: API fails a whole
series on one blackout/conflict day while the GUI offers "Skip
conflicting bookings") is the parity requirement; PR #1235 referencing
#1220 (observed 2026-03-26) may close the gap upstream, so recheck at
build time rather than assuming it persists.

### 1.4 Offline behavior (two sites, unreliable Wi-Fi)

Split by write kind. Catalog/tool-status/member reads: cached with short
TTL + explicit refresh + stale banner. Checkout/checkin + stock
movements: offline-writable **intent outbox** with local sequence, UUID
idempotency key, actor, device clock, payload; synced per-device FIFO
on reconnect (two sites' FIFOs interleave arbitrarily at the server;
server accept-time is the global sequence); server stamps accept time
separately and never overwrites capture time. Exclusive reservations
created offline stay `tentative` (outbox) and are confirmed server-side
against the exclusion constraint; collisions become explicit conflict
tasks showing both claimants, never silent overwrite or
last-write-wins. UI shows "Offline — N queued" with per-action state
and a staff-visible sync log. Sync transport: server-mediated only
(both sites sync through the server; no peer-to-peer). Technology:
start with app-owned outbox + Postgres; add a sync engine
(CouchDB/PouchDB or PowerSync Service + client SQLite SDKs) only if
conflict volume justifies running it. Supabase-alone or any
server-query-only BaaS does not supply offline: every query goes to the
server and fails offline, so it needs the same local store + queue +
merge layer (local SQLite authoritative while offline, outbox push
before pull, scoped pulls, explicit merge/conflict tasks, initial
online login for auth). Service Worker caches shell/assets only. The
Supabase-plus-local-outbox composition is this final's own proposal,
not surveyed prior art.

Conflict policy (M4 close-out):

1. Tie-break: promotion runs in server accept-time order —
first-to-sync wins. The conflict task shows capture-time, actor and
device for both claimants; staff may override and reassign the slot.
Accept-time is the only server-ordered clock; capture-time rewards
device clocks this final elsewhere distrusts (P3). Fairness caveat:
first-to-sync rewards connectivity; the staff-override path is the
fairness valve, and conflict-UX wording/SLA stays a staff decision.
2. Tentative TTL and notification: tentatives expire after 24 hours by
default (configurable 4–72 h), with a re-confirmation prompt before
expiry and member notification on promotion and on conflict-death
(channel per §1.7 user decision; default email + in-app). TTL and
notification existence are architectural; wording is deferred to staff.
3. Custody conflicts: the same lendable copy checked out at both sites
while offline merges as first-sync checkout wins; the second becomes
hold-queue position 1 plus a staff conflict task. Never two open
checkouts (M5 backstop enforces it), never silent loss.

Extended-outage playbook (M3 close-out): queue caps bound accepted
loss — default 500 intents per device or 7 days offline, whichever
comes first (configurable); past the cap the device refuses new
offline writes with an explicit message. Device outboxes are
intentionally unbacked-up; the server backup (nightly dump + file
store, restore-tested) covers accepted data only. During a host outage
members see tentative-state messaging ("your booking is tentative
until the server confirms"); on recovery, per-device FIFOs replay in
accept-time order and conflict tasks surface before normal booking
resumes.

### 1.5 Audit history

Every journal write records actor, capture time, accept time,
reason/order link, before/after for state transitions. History APIs and
widgets are paginated from day one (InvenTree #4541/#4631 lesson:
causal links at write time, backfills expensive, unpaginated logs
collapse). ORM-level history (django-simple-history-style full
snapshots, or auditlog-style diffs) is acceptable only if bulk/raw
paths are forbidden by role or also logged; otherwise use DB triggers
(pghistory/temporal style). CSV imports, repair transitions,
reservation lifecycle, custody, and stock movements all appear in one
staff-queryable trail with site scoping. Under Route A's
separate-logins fallback, actor attribution joins on the reconciled
member key across the two identity namespaces. Retention defaults
(user decision): member data while member + 1 year; audit trail 3
years; repair photos 1 year or with the tool record; staff-configurable.

### 1.6 CSV import pipeline (never overwrite on names)

`upload → detect encoding/delimiter → normalize headers → column-map preview
→ validate → import valid + quarantine invalid → staff fixes quarantine
in-app → re-run`. Detects UTF-8/Windows-1252, per-file comma/semicolon/tab
(delimiter variance is across files; quoted embedded delimiters within a
file are handled by the parser), uneven rows, missing fields, date
handling per the reconciled policy below, leading-zero codes (treat codes
as text, never numeric coerce), formula markers, whitespace/case variance.
Date policy: staff declares the file's locale once per import; the parser
applies it deterministically; only truly unparseable dates quarantine.
Per-row ambiguity rejection applies only when no locale was declared or a
date is invalid under the declared locale — rejecting every day≤12 date
would quarantine most legacy rows. Name matches are suggestions only
(fuzzy accent/case-insensitive hints permitted as an optional
user-decision enhancement, never auto-merge without staff confirm); staff
confirm identity, system mints stable IDs thereafter. Original file
(hash), mapping, row counts, and per-row reasons are retained in the
import run. Nothing is silently dropped or coerced.

### 1.7 Extensions and notifications

Versioned REST API for bookings/custody/stock/repair/imports: URL
versioning (`/api/v1`), token auth (session + API tokens; LDAP/OIDC
where Route A proves it), machine-readable errors with correct status
codes (Grocy 4.7.x lesson: never HTML-200 on errors; never rename/remove
fields without deprecation). Webhooks for booking/low-stock/repair
events: at-least-once delivery, signed payloads, retry with backoff,
dead-letter queue staff can inspect. Barcode/QR scan + label print for
copies and consumable bins. iCal export for member bookings. SSO/LDAP
for shared identity where proven (§1.1). Plugin/hook points for reports.
Hardware access control (Fabman Bridge/RFID) and Home Assistant state
are explicit optional extensions with their own budgets, not core
acceptance. Notifications user decision: default email + in-app for
booking confirmations, conflict tasks, low-stock and repair flags;
Slack/SMS optional.

### 1.8 Hosting (simple first, placed explicitly)

Default: one rented VPS/cloud host holding Postgres + app container +
static PWA (Route B), or two small containers (Route A). Dependency:
both sites need working internet; a venue-wide outage degrades both
sites to queued/tentative simultaneously (playbook in §1.4).
Alternative: on-site at site A — makes the other site's WAN path a hard
dependency the brief never required; choose only with an explicit
reason. Either way the single host is a single point of failure: RPO
≤ 24 h (nightly Postgres dump + file store), RTO hours (restore-tested);
device outboxes are unbacked-up by construction within the §1.4 caps.
No separate sync service, search cluster, or multi-region setup at this
scale. If SaaS (Route C), hosting is vendor-owned but export (API +
CSV) is contractual.

### 1.9 Evolution chains (O3, in this final's own words)

Three independent chains carry the design lessons; each was re-checked
by the critic and, for Chain 1, upgraded to fetched evidence by this
reviser.

**Chain 1 — LibreBooking conflict-detection miss, issue #920 → commit
7e80933.** ScheduleTall view rendered a reservation ending in a hidden
blocked period using the approximate cell's `data-min` value instead of
the reservation's actual timestamps, and drew the div too short; the
wrong attributes could make conflict detection miss overlapping
reservations. The fix introduced an `isEndApproximate` flag restoring
the missing slot height and wrote `res.StartDate`/`res.EndDate`
directly into the data attributes (`Web/scripts/schedule.js`, closes
#920). Companion gap: the reservation API has no parameter matching the
GUI's "Skip conflicting bookings", so a series touching one
blackout/conflict day fails wholesale via API while the GUI skips that
instance (issue #1220, opened 2026-03-24; PR #1235 of 2026-03-26 may be
closing it — recheck at build time). Lesson: rendered slots are never
conflict truth; the server re-validates every create/update against
stored ranges; the DB exclusion constraint backstops it; API/GUI parity
is acceptance, not polish.

**Chain 2 — Grocy 4.7.0 breaking change → 4.7.1 + downstream fixes.**
Release 4.7.0 reorganized auth middleware (`AUTH_CLASS` → the
`DefaultAuthMiddleware` namespace), invalidated all web sessions, and
stopped exposing the username/user-id fields from the system-config
endpoint. Downstream clients broke: validation errors against 4.7.x,
non-array body crashes, and Grocy answering every request with an HTML
error page under HTTP 200 when the config still named the old class.
Release 4.7.1 (2026-09-04) fixed the iCal shared-link 401, product-copy
field loss, accent-insensitive table filters, and non-latin password
login. Lesson: extension/API contracts need versioning, deprecation
windows, machine-readable errors with correct status codes, and
integration tests pinning documented response shapes (§1.7, V5).

**Chain 3 — InvenTree stock history gaps → PR #4541 (+ #4488, #4631) +
app PR #320.** Shipping against a sales order omitted the sales-order
link from stock history; PR #4488 fixed new writes, PR #4541 backfilled
old tracking entries via data migration; later work paginated the
stock-history API (#4631) and refactored the app history widget as
paginated (#320). Lesson: write the causal link (order/event/reason)
into the audit entry at write time; backfills are expensive; paginate
history APIs and widgets from day one (§1.5, V4).

No makerspace-specific double-booking regression with public postmortem
depth beyond Chain 1 was found; that absence is stated explicitly (O3
permits absent/inapplicable with an explicit note).

## 2. Exact per-P disposition (O4)

Disposition vocabulary: correction (P's intent kept, mechanism replaced),
optional enhancement, user decision, already-covered, rejected, uncertain.
Each P is quoted exactly from revealed-plan.md.

**P1: "Use a shared calendar for reservations." — CORRECTION.**
Keep the calendar as the member-facing view; reject it as the booking
truth. A shared calendar alone provides no resource-scoped overlap
guarantee, no status lifecycle, no tentative-vs-confirmed offline
semantics, no series/blackout/buffer/quota rules, and no audit. Replace
with §1.2/§1.3: reservations journal + Postgres exclusion constraint +
server re-validation + API/GUI parity (rechecked against #1235 at build
time). Already-covered calendar-UI patterns: Fab-manager FullCalendar,
LibreBooking schedule views. Uncertain (user decision): whether
rooms/desks join the same engine or stay a plain calendar — decide by
contention; if rooms rarely contend, plain calendar + light conflict
warning is acceptable.

**P2: "Keep stock quantities in a database row updated by each client." —
CORRECTION (the stated mechanism is REJECTED).**
Direct row overwrite loses concurrent decrements (two sites consume → one
write clobbers), has no audit, no per-site balances, no units, no
idempotency for retried offline syncs. Replace with §1.2/§1.4 stock
journal + derived balances + explicit units + idempotency keys +
per-site thresholds + the §1.2 control-row lock under block-by-default
(the enforcement that makes the rejection stick under concurrency).
Already-covered quantity-pool semantics: Grocy stock log, InvenTree
tracking entries, Snipe-IT consumables. No part of "each client updates
the same row" is retained.

**P3: "Permit offline checkout and reconcile by timestamp." — CORRECTION.**
Timestamp-only reconcile is last-write-wins with device-clock skew: it
silently drops a checkout, a consume, or a repair flag, and cannot express
double-lend/double-book conflicts. Replace with §1.4 outbox (local seq +
UUID + actor + device clock, per-device FIFO sync, server accept time)
and explicit conflict tasks with the §1.4 tie-break (accept-time order,
capture shown, staff override) and TTL; reservations stay tentative until
server-confirmed. Already-covered transport patterns: PouchDB/CouchDB
live-retry sync, PowerSync local-SQLite queue. (Supabase-plus-local-outbox
is this final's proposed composition, §1.4, not prior art.) Uncertain
(user decision): conflict UX wording and SLA (auto re-offer next slot vs
staff mediation) — decide with staff, not in code.

**P4: "CSV import overwrites matching names." — REJECTED.**
Name matching is ambiguous (case/whitespace/diacritics/duplicates across
two sites) and overwrite destroys curated data with no undo, no
validation, no quarantine, no audit. Nothing of this mechanism is
retained. Replace with §1.6 pipeline: explicit mapping preview,
locale-declared date parsing, validation, quarantine with row reasons,
staff-confirmed identity, stable IDs, retained import runs. Optional
enhancement (user decision): fuzzy-match suggestions (accent/
case-insensitive) as hints only, never auto-merge without staff confirm.

**P5: "Tool maintenance is a free-text note." — CORRECTION.**
Free text as the whole story loses the safety-critical state (is this tool
bookable right now?), accountability (who flagged/cleared, when, why), and
booking guards. Replace with §1.2 repair state machine + transition log +
§1.2 blocking rules; keep free text as the notes field inside each
transition, plus optional photos. Already-covered adjacent patterns:
Snipe-IT custody/audit entries, InvenTree stock history entries.
Optional enhancement (user decision): lightweight work orders
(assigned-to, due, parts) if repair volume justifies it; otherwise status
+ notes suffices.

**P6: "Test normal reservation and check-in flows." — CORRECTION
(insufficient; retained as smoke only).**
Happy-path tests cannot discriminate the failure modes this brief exists
for: races, offline conflicts, hostile CSV, audit gaps, contract breakage,
two-site splits. Keep normal flows as smoke; acceptance is §4 V1–V6 plus
V2b, each with explicit pass/fail signals. Already-covered: none of
V1–V6/V2b is covered by P6. No part of P6 is rejected — it is demoted to
pre-acceptance smoke.

## 3. Criticism adjudication (explicit per finding)

Verdicts: ACCEPT (critic right, fix applied), AMEND (critic partly right;
fix differs as stated), REJECT (critic wrong, with evidence), UNCERTAIN
(retained as an open question with a default that ships safely).
No criticism was obeyed automatically; each was checked against the
draft, the evidence, or new reviser verification (R01–R07).

### 3.1 Material findings M1–M6

**M1 stock journal without concurrency control — ACCEPT.**
The critic is right: journal + derived sum fixes reads but not fenced
writes; two concurrent consumes both read positive and both append.
Fix applied: §1.2 per-(part, site) control-row `FOR UPDATE` lock under
block-by-default (§1.3 policy unchanged), §4 V6 extended with a
concurrent-consume case. Allow-negative-with-reason stays the
documented downgrade where the race is benign. P2 disposition stands;
its replacement is now complete.

**M2 Route A integration assumed; Snipe-IT dropped silently — ACCEPT with
AMEND on the SSO half.**
Identity: the critic was right that the draft assumed the intersection,
but reviser verification narrows the gap rather than leaving it open:
InvenTree evidences LDAP plus SSO backends (R04), Grocy evidences LDAP
middleware plus reverse-proxy header auth (R05), LibreBooking evidences
AD/LDAP — so LDAP is a concrete candidate common denominator for the
LibreBooking + InvenTree and Grocy-involving pairs, while Fab-manager's
SSO protocol remains unspecified. Fix applied: §1.1 names LDAP as the
candidate, still requires cite-or-test per pairing before purchase, and
states the separate-logins fallback with its audit cost. Catalog drift:
ACCEPTED outright — §1.1 now names the status owner (asset side),
bookability owner (booking side), the ≤15-minute status bound with
nightly full sync, and in-window guard behavior. Snipe-IT: ACCEPTED —
§1.1 restores it as the Route A custody variant with the redundancy
rationale stated (custody-native vs stock-native). Route A is now
purchasable subject to its two proofs.

**M3 host placement and extended outage unspecified — ACCEPT.**
Fix applied: §1.8 defaults to a rented VPS/cloud host with the stated
both-sites-need-internet dependency, prices the on-site alternative's
WAN dependency, states RPO/RTO and the SPOF, and §1.4 adds the
extended-outage playbook (queue caps, TTL interaction, member
messaging, catch-up ordering, unbacked-up-outbox bound).

**M4 offline conflict policy gaps — ACCEPT (all three + FIFO scope).**
Fix applied in §1.4: accept-time-order promotion with capture-time
shown and staff override (the critic's recommendation, adopted with
the fairness caveat stated); 24 h tentative TTL with re-confirmation
and notification; V2b double-lend case with the first-sync-checkout +
hold-plus-task merge rule; FIFO scoped per-device with accept-time as
the global sequence. V1/V2 are now discriminating.

**M5 one-borrower-per-copy without DB enforcement — ACCEPT.**
Fix applied: §1.3 partial-unique index on open checkouts, server-side
idempotency-key uniqueness per journal, and the §1.2 holds sketch
(queue/expiry/promotion). V2b is now writable, and the draft's own
"server re-validates every create/update" bar is met for custody.

**M6 source IDs and Chain 1 weight — ACCEPT on IDs; AMEND on Chain 1
with new evidence.**
Missing IDs: accepted — §6/R06 mints the Supabase-outbox source from
independent observations, and the sourceless Open Fab Control mention
is dropped (m9). Chain 1: the critic's caution was valid at critic
time (S15/S16 were snippet-only), but reviser fetches close it: R01
confirms every file-level detail of commit 7e80933
(`Web/scripts/schedule.js`, `isEndApproximate`, `res.StartDate`/
`res.EndDate`, `data-min`, Closes #920) and R02 confirms issue #1220's
exact gap text plus its evolution (PR #1235, 2026-03-26, may fix it).
S15/S16 were accurate as recorded; their weight is upgraded from
snippet to fetched, and the parity requirement stands with a
build-time recheck. Not automatic obedience: the critic's
evidence-weight finding was right, its provisional-treatment
recommendation is now discharged by the diff.

### 3.2 Minor findings m1–m15

- **m1 `completed` in the predicate — ACCEPT.** Rationale added in §1.3
(historical truth, harmless inclusion, blocks backdated overlaps;
cancelled/no-show never occupied the resource) plus the
pending_payment≈tentative vocabulary mapping. Predicate kept.
- **m2 P3 already-covered miscategorization — ACCEPT.** Supabase-plus-
outbox moved to the §1.4 replacement description; P3 already-covered
now lists only surveyed prior art.
- **m3 InvenTree condition coverage unverified — ACCEPT.** Narrowed: P5
already-covered now claims Snipe-IT custody/audit entries plus
InvenTree stock history entries only; no InvenTree condition
vocabulary is asserted.
- **m4 V3 mixed delimiters — ACCEPT.** V3 scoped to per-file detection
with a quoted-embedded-delimiter row (see §1.6/§4).
- **m5 V4 oracle — ACCEPT.** Oracle named in §4: scripted action log
independent of the trail vs trail query.
- **m6 V5 circularity — ACCEPT.** V5 restructured in §4 as
old-client-vs-new-server plus static contract tests.
- **m7 ambiguous-date quarantine — ACCEPT.** Reconciled in §1.6: declare
locale once per import, deterministic parse, quarantine only the truly
unparseable (or locale-undeclared) rows.
- **m8 S03 Wikipedia binding — ACCEPT, closed.** R03 fetches myturn.com
directly (lending platform, inventory/availability online,
memberships, multi-location confirmed); lineage upgraded, deployment
details no longer snippet-grade.
- **m9 Open Fab Control sourceless — ACCEPT.** Mention dropped; no
approach signal without a source.
- **m10 repair blocking rules — ACCEPT.** Decided in §1.2: down/
in_repair/retired block; degraded warns + staff override for
exclusive tools, blocks nothing for lendables by default.
- **m11 copy site-transfer — ACCEPT.** Specified in §1.2 (transfer with
reason + actor; hold queue and due state travel; audit entry).
- **m12 extension mechanics — ACCEPT.** Scheme named in §1.7 (URL
versioning, token auth, signed at-least-once webhooks with
retry/dead-letter) so V5 is testable; still plan-appropriate depth.
- **m13 Postgres 18 pin — ACCEPT.** Pattern cited as current-docs-plus-
backcompat in §1.3; no version anxiety.
- **m14 S11 subordinate — ACCEPT, no action.** Secondary pattern color
under S10/R-governance; semantics never outrank the docs.
- **m15 buffer storage — ACCEPT.** §1.2 stores booking-range + buffer
separately and displays them distinguished; conflicts cover both.

### 3.3 Omission register (1–7) — all ACCEPTED into plan or register

1. Member cross-site identity → decided with default in §1.2 (one
account, attestations transfer, site-scoped holds); residual policy
detail joins the §5 register.
2. Tool/copy site binding → decided with default in §1.2
(site-bound exclusive unless portable; transferable copies with staff
authorization); pairs with m11.
3. Series/blackout/buffer/quotas → series + blackouts + buffers
specified in §1.2/§1.3; V1 covers the series-skip-parity case;
quotas deferred as an explicit user decision.
4. Notification surface → user decision with default in §1.7.
5. Privacy/retention → defaults in §1.5; residual policy joins §5.
6. Checkout duration/hold expiry/renewal caps → defaults in §1.2.
7. Import-run lifecycle → decided in §1.2/§1.6 (90-day quarantine,
hash-idempotent re-runs, reusable mapping templates).

### 3.4 Validation applicability and per-P audit — AGREE

The critic's per-validation applicability stands and each condition is
discharged in §4: V1 names the tie-break; V2 gains V2b; V3 is scoped
(m4/m7); V4 names its oracle (m5); V5 is de-circularized (m6); V6 gains
the M1 enforcement plus a concurrent-consume case. The Route A offline
caveat is accepted and priced in §1.1. Scope discipline ("this small
product brief") is preserved. All six P dispositions stand with no
false correction or false rejection; the m2 sub-label fix does not
touch any disposition.

## 4. Validations: proposed vs executed (O6)

**Executed:** no runtime checks. This reviser stage performed public web
reads only (fetch of the LibreBooking commit/issue pages and myturn.com;
searches for InvenTree/Grocy auth, Supabase outbox patterns, and
supporting records), treated as data. No qualified sandbox was available
to run witnesses; no installs, no downloaded executables, no hosted trial
mutations. PouchDB's root fetch returned an empty 72-byte response, so
S12 stays snippet-grade (direction undisputed, weight unchanged). The
LibreBooking commit/issue fetches (R01/R02) and the myturn.com fetch
(R03) are the only weight upgrades claimed. Everything below is a
proposed discriminating validation for build acceptance, not a run result.

- **V1 double-booking race.** Fire two concurrent overlapping bookings
for one exclusive tool → exactly one confirms; the other surfaces
"already booked" (exclusion 23P01 mapped). Offline variant: same tool
tentatively reserved at both sites offline → sync promotes in
accept-time order (first-to-sync wins); exactly one confirms and one
conflict task names both claimants with capture-times. Series variant:
series touching a blackout day via API → per-instance skip parity
with the GUI (or the documented gap if #1235 is unmerged). Fail: two
confirmed overlaps, silent overwrite, arbitrary winner, or generic 500.
- **V2 offline checkout.** Airplane-mode checkout + consumable consume →
queued with local seq/actor/device-clock → reconnect → server reflects
both; audit shows capture vs accept times distinctly; retried sync
dedupes on idempotency keys. Fail: lost write, duplicated write on
retry, or merged timestamps.
- **V2b double-lend (new).** Same lendable copy checked out at both
sites while offline → reconnect yields exactly one open checkout
(first-to-sync) + hold-queue position 1 for the loser + a staff
conflict task; partial-unique backstop holds under the race. Fail: two
open checkouts, silent loss of either claim, or hold without task.
- **V3 hostile CSV.** Import hostile files with per-file delimiter
variance (one file carrying a quoted embedded delimiter),
locale-declared DD-MM vs MM-DD dates plus one unparseable date,
leading-zero codes, uneven rows, a formula cell, Windows-1252 bytes →
column-map preview, declared-locale deterministic parse, codes kept as
text, invalid rows quarantined with row-level reasons + counts, valid
rows imported, original hash + mapping retained. Fail: silent coerce,
dropped rows without reasons, or name-overwrite.
- **V4 audit completeness.** Run checkout → flag degraded/down → checkin
→ consume → adjust → transfer across two sites; the scripted action
log (kept independently of the trail under test) vs the trail query
shows every step with actor/capture/accept/reason/order-link and no
gaps; bulk/raw paths either log or are role-forbidden; history
endpoints paginated. Fail: missing link, unpaginated collapse, or
bypass without trace.
- **V5 extension contract.** Pin a third-party client to the old API
version against the upgraded server → versioned machine-readable
error with correct status; deprecation honored; static contract tests
pin documented request/response shapes. Fail: HTML-200 error, silent
field drop, or unversioned break (Grocy 4.7.x pattern).
- **V6 two-site stock split.** Same consumable stocked at both sites;
consume below threshold at site A → low-stock fires for A only;
transfer A→B moves quantity with reason + actor and both balances
update. Concurrent variant: two sites concurrently consume the last
units under block-by-default → exactly one outcome commits (control-
row serialization); the loser gets an explicit out-of-stock signal,
never a silent negative. Fail: global threshold misfire, untraced
transfer, or double-commit into negative.

Smoke (from P6, retained): normal reservation create/cancel + normal
checkout/checkin pass before V1–V6/V2b run.

## 5. Uncertainty register (carried, not guessed)

Real offline conflict rate between sites; legacy sheet chaos depth
(units, dup names, date locales); staff appetite for barcode/label
discipline; repair volume (flag vs work orders); whether WordPress
exists (CommonsBooking viability); SaaS/hardware budget; room/desk
contention; member cross-site policy detail; notification channel
choice; retention windows beyond the §1.5 defaults; quota semantics
if quotas are later adopted. Each maps to a §1/§3 user decision with a
default that ships safely.

## 6. Source lineage (summary, not substitution)

All technical claims above are spelled out in this final's own words
(O5: no ID-substitution). Lineage for audit: Fab-manager
(open-source makerspace booking/membership/training), Fabman (SaaS +
bridge access/billing), MyTurn (lending platform; primary myturn.com
fetch R03 upgrades the Wikipedia-bound S03), CommonsBooking (WP
plugin), LibreBooking (PHP reservation fork; #920 → 7e80933 fetched
R01 with file/flag/attribute details confirmed; #1220 fetched R02
with PR #1235 evolution noted), InvenTree (Django/Postgres stock +
PR #4541 history lesson; LDAP/SSO R04), Snipe-IT
(checkout/audit/API; restored to Route A), Grocy 4.7.1 (consumables +
4.7.x contract lesson; LDAP/reverse-proxy R05), PowerSync (SQLite
sync engine), Postgres current-docs exclusion constraints +
btree_gist booking pattern (backcompat-noted), PouchDB/CouchDB
replication (snippet-grade, fetch attempted), Supabase-outbox
composition (R06 pattern observations), django-simple-history matrix,
Frictionless validation pipeline. Exact URLs/versions/commits/access
times: research S01–S18 (referenced, never rebound), critic C01–C05
(referenced, never rebound; C05's negative observation is closed by
R02), reviser R01–R07 in this stage's source-map.json; bounded
excerpts + index in this stage's sources/. Usage/billing figures:
unobserved (null).
