# Final planning deliverable — S01 field-inspections (A-M07-B control/research)

Scope: offline field-inspection app for a small housing nonprofit. Twelve
inspectors capture forms, photos and location on Android devices, often with no
service for a full day; an office coordinator reviews corrections. Deployments
must stay simple; export/migration must avoid vendor lock-in. This draft covers
synchronization and conflict handling, accessible form design, photo storage,
selective sharing, and a future small self-hosted deployment. It is
self-contained: every retained finding is stated in full prose, with source
citations supporting — never replacing — the text.

Recommended direction: ODK Collect + ODK Central + XLSForm + Entities first,
because it is the only option that delivers offline forms, photo/GPS widgets,
review states, user/project roles and standard exports as one tested,
self-hostable whole. Build a custom app only if bespoke UX or offline logic
exceeds XLSForm; then pair a Kotlin client (SQLite outbox) with PowerSync or
CouchDB/PouchDB sync, photo bytes in S3-compatible storage, and PocketBase (or
equivalent) as the small self-hosted backend. Never ship PWA+localStorage
offline, whole-document last-write-wins, URL-only photos, deferred access
control, or toggle-only testing as specified in the thin plan.

## 1. Per-P disposition (exact thin-plan clauses)

Thin plan (revealed after discovery freeze, quoted exactly):
"P1: Use a PWA and browser local storage for all offline records. P2: Upload
complete inspection JSON on reconnect with last-write-wins. P3: Store photo
URLs in each form. P4: Add coordinator review and CSV export. P5: Defer access
control beyond individual sign-in until rollout. P6: Test by toggling network
off and on."

### P1 — "Use a PWA and browser local storage for all offline records." → CORRECTION
Reject PWA + browser local storage as the offline records store. `localStorage`
(~5 MB, synchronous, evictable, no indexing, no background sync) cannot hold a
day of inspections with photos on 12 devices; even an IndexedDB-backed PWA with
service workers remains weaker than native for camera/GPS capture, large
outboxes, background upload under Android battery optimization, and managed
deployment. Correction: capture on native Android — ODK Collect (preferred) or
a custom Kotlin app writing instantly to on-device SQLite with an ordered,
durable outbox (PowerSync upload queue; or PouchDB/CouchDB replication; or a
Room outbox drained by WorkManager). Retain the PWA only as the coordinator's
online review companion, where the W3C accessible-forms checklist governs it.
The offline-record requirement is thus already-covered in intent but corrected
in mechanism.

### P2 — "Upload complete inspection JSON on reconnect with last-write-wins." → CORRECTION
Retain "queue offline, upload on reconnect". Reject whole-document
last-write-wins: a late pocket-edit or a second device's stale copy would
silently overwrite a coordinator approval or a colleague's corrections, and a
delete-then-edit race has no safe whole-doc answer. Correction, stated as
governing rules: (1) sync field-level operations (create/replace, patch of
changed columns with row id, delete by id), never whole blobs; (2) the backend
applies them idempotently (operations may arrive twice; dedupe by per-client
operation id or idempotent application); (3) default to per-field
last-write-wins with deletes-win only where the product intends deletion to be
final; (4) protect review states with monotonic transitions (e.g.
submitted → in-review → approved/changes-requested; an approved record rejects
further inspector edits except as new correction events); (5) route genuine
conflicts (same-field races, approve/edit races, delete/edit races) to a
human-review dead-letter queue the coordinator adjudicates, with an audit trail.
PowerSync implements this as server-authoritative reconciliation through the
developer's `uploadData` connector; CouchDB/PouchDB implements it as both
revisions retained with a deterministic winner plus an explicit merge UI that
must surface hidden losing revisions. Either satisfies the brief; bare LWW does not.

### P3 — "Store photo URLs in each form." → CORRECTION (half already-covered)
Retain the URL-in-the-record half: every photo needs a metadata row (inspection
id, capture time, GPS, hash, uploader, review state) synced with the form. Add
the missing bytes half the clause omits: photo bytes must never live as blobs
or base64 inside synced database rows. Ship the metadata + storage-provider
pattern: bytes go to purpose-built storage (ODK Central submission attachments;
or PocketBase file fields served locally now with S3-compatible offload later;
or any S3/R2/Supabase-style object store behind PowerSync-style attachment
helpers), while small metadata rows flow through sync. A local queue holds
photos offline, uploads in the background with retry, keeps them available
offline, and garbage-collects cache. Size the pipeline deliberately: PocketBase
file fields default to ~5 MB maximum (adjustable with a performance warning)
and store sanitized names with a ~10-character random suffix; downscale
client-side, preserve or provably strip EXIF/GPS by stated policy, and plan the
local-disk → object-store cutover before the disk fills.

### P4 — "Add coordinator review and CSV export." → ALREADY-COVERED + OPTIONAL ENHANCEMENT
The intent is correct and retained: a coordinator review step and CSV export are
required. Enhance to a real review/export subsystem: review states with
monotonic transitions and role separation (inspectors submit and correct;
coordinator approves/requests-changes); encrypted-forms and server audit-log
options where the platform offers them; a web review UI built to the accessible
checklist (visible labels, grouped controls, instructions, inline + summary
validation, live-region notifications, multi-page progress, custom controls
only as a last resort); conflict surfacing (hidden-revision or dead-letter
queues are first-class UI, not logs). Export/migration without lock-in means
CSV plus the full-fidelity path: database dump (PostgreSQL for ODK/PowerSync
backends, SQLite file for PocketBase) + filestore/object-store copy + record
API/OData access, with a documented restore-on-fresh-host runbook and a
fire-drill validation (see V5).

### P5 — "Defer access control beyond individual sign-in until rollout." → REJECTED (user decision only with stated risk)
Reject as planned. Selective sharing is a brief requirement, and per-user
visibility is load-bearing in every sync design: PowerSync sync rules/streams
partition rows per user; CouchDB uses filtered/selector replication;
ODK Central scopes by users/projects/forms; PocketBase enforces per-collection
API rules. Retrofitting scoping after rollout means re-syncing every device,
re-cutting every rule, and risking a leak window. Minimum viable access
control from day one: individual sign-in, inspector-vs-coordinator roles,
project/case scoping (an inspector sees only assigned properties/visits),
and review-state-gated transitions. If the nonprofit explicitly accepts the
risk, deferral becomes a recorded user decision with conditions: single
project, mutually trusted staff, no sensitive tenant data in scope, and a
dated retrofit milestone before any external sharing. Do not treat silence as
consent to defer.

### P6 — "Test by toggling network off and on." → CORRECTION (retain as smoke only)
Retain the toggle as a smoke pre-check and reject it as the test plan: it
cannot discriminate 24-hour outboxes, same-field races, delete/edit races,
photo backlogs, accessibility, export fidelity, or host survival. Replace with
the validation matrix V1–V6 in section 6: sync soak, conflict matrix, photo
pipeline, accessibility pass, export/migration fire-drill, and small-host
survival. Each names its setup, load, and pass criteria; none has been executed
(no runtime in this stage), and all are proposed, not claimed.

## 2. Retained findings (full prose)

Sync and conflict handling. Three viable sync cores: (a) ODK's submission
queue with automatic send on connectivity plus Entities for updatable
longitudinal records (property → visits → corrections); (b) PowerSync's
client-SQLite + ordered upload queue + developer connector + source database,
with per-field LWW default, deletes-win, idempotent application, and custom
policies (version columns, business-rule validation, dead-letter human review);
(c) CouchDB/PouchDB multi-master replication — incremental, one-way
push-then-pull over HTTP copying the last revision plus deletion tombstones,
immediate 409 on stale-`_rev` writes that the app must always handle, eventual
conflicts retaining both leaf revisions with a deterministic same-everywhere
winner, reads and views showing only the winner until merged. Doc-model
guidance under (c): document-per-entity (inspection, photo-metadata, comment),
immutable event docs for corrections/status changes over edits to living docs,
and delta-shaped retried writes (`upsert`/`putIfNotExists`) for flags and
counters. Under all options, coordinator decisions are final and auditable;
no silent auto-merge governs approvals.

Accessible form design. On-device, prefer the platform's tested widgets (ODK
Collect/XLSForm question types, skip logic, calculations, translations);
for any custom surface — coordinator review UI at minimum, custom Android
screens if built — apply the full checklist: label every control (never
placeholder-only), group related controls with legends, write instructions,
validate with inline and summary messages, notify via polite/assertive
live regions as appropriate, split long inspections into pages with progress,
and build custom controls only when native ones cannot serve. Native Android
equivalents (content descriptions, focus order, minimum touch targets,
TalkBack pass) apply on-device.

Photo storage. Metadata rows sync; bytes live in a file/object store; a local
queue bridges offline gaps with background upload, retry, offline availability
and cache cleanup. ODK bakes this into submissions; PocketBase gives the small
team local-filesystem-now/S3-later behind one record API (default ~5 MB per
file field, adjustable; sanitized name + random suffix); PowerSync-style
attachments generalize it to any S3-compatible provider with explicit queue
states (queued/uploaded/downloaded) and per-SDK minimum versions. Bound the
synced database, downscale client-side, set retention, and fix the EXIF/GPS
policy in writing.

Selective sharing. Scope is part of sync design, not a later filter: per-user
sync partitions, filtered replication selectors, project/user roles, or
collection API rules, plus role-gated review transitions. An inspector's
device carries only assigned cases; the coordinator sees the full queue;
sharing a case with a landlord, contractor or auditor is an explicit grant,
not a forwarded export.

Small self-hosted deployment. Two honest footprints: ODK Central as a
multi-container compose stack (app, web, PostgreSQL, web-forms renderer,
form toolchain) on a small VPS with TLS, backups, and upgrade discipline;
or PocketBase as a single ~11–12 MB binary (SQLite + auth + files +
realtime + dashboard) deployed by copying the executable plus migrations and
running one serve command with automatic TLS, optionally under systemd with
restart policy. A custom PowerSync backend sits above either data tier and
adds its service plus source database. All three export without lock-in:
database dump + filestore copy + open API. PocketBase's governing caveat is
pre-1.0 status: no full backward-compatibility promise; every upgrade follows
the changelog with possible manual migration steps.

## 3. Conditions

- ODK-first holds while XLSForm expresses the inspections; a hard custom-UX
  requirement (novel offline logic, bespoke capture flow) flips the choice to
  custom Kotlin + PowerSync or CouchDB sync.
- Per-field LWW and deletes-win hold only inside the stated policy; approval
  and deletion of approved records always require coordinator authority and an
  audit entry.
- Photo pipeline choices (local vs object store, size caps, retention,
  EXIF/GPS handling) are fixed before pilot data accumulates, not after.
- Access-control deferral is permitted only as an explicit, dated, risk-accepted
  user decision (see P5); otherwise scoping ships with the pilot.
- Pre-1.0 components (PocketBase) are acceptable only with a pinned version,
  a tested upgrade runbook, and backups proven by restore drill.

## 4. Alternatives retained

(a) ODK all-in: fastest fit, least code, compose-scale hosting, standard
exports. (b) Custom Kotlin + PowerSync + Postgres + S3-compatible photos:
maximum app freedom, real sync engine, owns backend/conflict/storage/form UI.
(c) Custom app + CouchDB/PouchDB filtered replication + review queue:
explicit multi-master merge with coordinator adjudication, heavier modeling
and hosting. (d) PocketBase + hand-rolled Android outbox: cheapest backend,
weakest sync (custom queue, custom conflicts) — acceptable only as a
stepping stone with a dated migration to (a), (b) or (c).

## 5. Optional capabilities and user decisions

Optional: offline map tiles for navigation without service; encrypted forms at
rest/in review; push or digest notifications for correction requests; bulk
import of property rosters via Entities/datasets; multi-language forms;
auditor read-only seats. Decisions the nonprofit must make: ODK vs custom app;
managed hosting (ODK Cloud / PowerSync Cloud) vs self-hosted VPS vs on-premise
closet server; photo retention period and tenant-privacy/EXIF policy; device
ownership and provisioning (QR/adb, MDM or manual); whether access-control
deferral risk is accepted (P5); pilot property count and success criteria.

## 6. Uncertainty

Unmeasured or unobserved in this window: ODK Central sizing and upgrade
cadence for this load; PowerSync self-host vs Cloud operations and cost for a
nonprofit; PocketBase SQLite ceiling under photo-metadata load (expected fine
for 12+1 users, unmeasured); Android background-upload reliability under
doze/vendor battery policies; KoboToolbox, QField/Mapeo, Electric-sync
variants, single-node k3s/Coolify-style targets, and MinIO/Garage server
behavior (not primary-sourced — recorded as gaps, not findings); exact
coordinator throughput and correction taxonomy (needs a workflow interview).

## 7. Validations: executed vs proposed

Executed in this research stage (no runtime, no sandbox, no accounts changed):
compared official documentation for ODK (home, Central install, Entities,
offline maps), PowerSync (overview, update conflicts, custom resolution,
attachments), PocketBase (intro v0.40.5, files, production, changelog),
PouchDB conflicts (v9.0.0), CouchDB replication/conflict model (stable), and
the W3C accessible-forms tutorial; captured bounded excerpts in `sources/`
with `source-map.json` (URLs, versions, locators, access timestamps,
operations) and `sources/index.md`. No code ran; no containers started; no
network toggle was performed here — P6's smoke step is not claimed as executed.
Proposed discriminating validations (require a sandbox and devices; not run):
V1 sync soak — 2 devices offline 24 h, 50 mixed create/patch/delete ops each
plus photo metadata, then reconnect; pass = no silent loss, all conflicts in
the review queue, deletes-win only where intended. V2 conflict matrix —
same-field patch/patch, patch/delete, approve/edit race; pass = coordinator
decision final and auditable in every cell. V3 photo pipeline — 200 photos ×
3–8 MB through outbox → upload → metadata sync → download; pass = bounded DB
size, resumable retry, EXIF/GPS policy provably honored. V4 accessibility —
coordinator flow against the W3C checklist plus an Android TalkBack/focus-order
pass; pass = no unlabeled control, no placeholder-only label, grouped sets,
announced validation. V5 export/migration fire-drill — dump + filestore copy →
restore on a fresh host; pass = byte-identical exports, working review
history, documented runbook. V6 small-host survival — single VPS with TLS,
backup/restore, one minor upgrade; pass = runbook steps executed, rollback
proven, downtime window stated.

## 8. Source bibliography (primary, fetched 2026-10-09T19:31–19:34Z)

- ODK home (https://getodk.org/) — offline field-stack fit; mutable web page.
- ODK Central on DigitalOcean (https://docs.getodk.org/central-install-digital-ocean/)
  — compose install/manage surface; mutable docs.
- ODK Entities intro (https://docs.getodk.org/entities-intro/) — longitudinal
  records; mutable docs.
- ODK offline maps (https://docs.getodk.org/collect-offline-maps/) — offline
  maps/Collect ops; mutable docs.
- PowerSync docs (https://docs.powersync.com/) + index
  (https://docs.powersync.com/llms.txt) — Service/SDK/DB matrix; mutable docs.
- PowerSync update conflicts
  (https://docs.powersync.com/handling-writes/handling-update-conflicts.md) —
  PUT/PATCH/DELETE, idempotency, per-field LWW, deletes-win; mutable docs.
- PowerSync custom resolution
  (https://docs.powersync.com/handling-writes/custom-conflict-resolution.md) —
  CrudEntry, connector, dead-letter pattern; mutable docs.
- PowerSync attachments
  (https://docs.powersync.com/client-sdks/advanced/attachments.md) —
  deprecation + metadata/provider pattern + minima; mutable docs.
- PocketBase intro (https://pocketbase.io/docs/) — v0.40.5, single binary,
  pre-1.0 warning; version-pinned page, mutable docs.
- PocketBase files (https://pocketbase.io/docs/files-handling/) — ~5 MB
  default, suffix, multipart; mutable docs.
- PocketBase production (https://pocketbase.io/docs/going-to-production/) —
  TLS/systemd runbook; mutable docs.
- PouchDB conflicts (https://pouchdb.com/guides/conflicts.html) — 409/upsert
  contract; v9.0.0 chrome, mutable guide.
- CouchDB replication/conflicts
  (https://docs.couchdb.org/en/stable/replication/conflicts.html + index) —
  push/pull, deterministic winner; stable-channel mutable docs.
- W3C forms tutorial (https://www.w3.org/WAI/tutorials/forms/) — accessible
  checklist; mutable docs.
- PocketBase CHANGELOG on master
  (https://github.com/pocketbase/pocketbase/blob/master/CHANGELOG.md) —
  release-process evidence (rows not quoted, capture truncated); mutable branch.
Full per-source locators, timestamps and observed operations: `source-map.json`;
excerpts: `sources/` + `sources/index.md`. Usage/billing: unobserved (null).

## 9. Lifecycle note

One fresh native Goal was created for this assignment and verified active
before writing; all science above (discovery, source map, evidence, this
draft) is saved before any terminal completion. Discovery was frozen by the
reveal script before the thin plan was read and was not rewritten after.
Method: M07 v1 evidence-on-demand; no nested agents, no repo edits, no
executable downloads, no counterpart/campaign reads.
