# Discovery — S01 field-inspections (A-M07-B control/research, pre-reveal)

Scope: brief `cases/S01/brief.md` alone. Twelve Android inspectors, day-long offline,
forms + photos + location; office coordinator reviews corrections; simple deployments;
export/migration without vendor lock-in. Investigate sync/conflict handling, accessible
form design, photo storage, selective sharing, future small self-hosted deployment.
Plan not yet revealed; no plan clause is assumed or quoted below.

## 1. Unfamiliar-but-useful products and materially different approaches (O1)

### 1.1 ODK Collect + ODK Central + XLSForm + Entities (purpose-built field stack)
ODK is the closest purpose-built match: an Android app (ODK Collect) plus a
self-hosted server (ODK Central) plus a spreadsheet form language (XLSForm) plus a
longitudinal-record layer (Entities). The project homepage states the core loop in
one line: build forms with photos, GPS, skip logic, calculations, external datasets
and multiple languages; the mobile or web app works online and offline and "data is
automatically synced when an Internet connection is found"; data can be downloaded
or connected to Excel/Power BI/Python/R (S01). Central ships as a docker-compose
stack (backend, frontend/nginx, PostgreSQL, Enketo for web forms, pyxform-http),
licensed Apache 2.0 (S02-context via ecosystem; install guide is a
DigitalOcean/compose flow, S02). Entities extend one-off submissions into
updatable records (cases/properties/households), which is exactly the
inspect-revisit-correct loop this brief needs (S03). Collect supports offline maps
and location capture tuning (S04). Material difference vs a hand-built app: forms,
offline queue, photo/location widgets, review states and export come as a tested
whole instead of five separate subsystems to build.

### 1.2 PowerSync: server-authoritative sync over client SQLite + upload queue
PowerSync keeps an in-app SQLite database synced with a backend database so apps
"update across users and devices in real time, respond instantly, and continue
working offline" (S05). Architecture: PowerSync Service replicates from the source
DB (Postgres, MongoDB, MySQL-beta, SQL Server-beta, others), partitions rows per
user via sync rules/streams, and streams to client SDKs (JS, React Native/Expo,
Flutter, Kotlin, Swift, .NET-beta, Rust-beta, others) (S05). The client writes to
local SQLite instantly, queues mutations in an ordered upload queue, and drains it
through a developer-defined `uploadData`/connector endpoint; the backend applies
them to the source DB and PowerSync replicates them back (server-authoritative
reconciliation) (S06, S07). Material difference vs ODK: full custom-app freedom
(any schema/UI) with a bought sync engine, at the cost of owning backend,
conflict policy, file storage and form UI.

### 1.3 PocketBase: single-binary self-hosted backend (SQLite + auth + files + realtime)
PocketBase is an open-source backend as one executable: embedded SQLite, realtime
subscriptions, built-in auth, dashboard UI and REST-ish API; usable standalone or
as a Go framework (S09, observed v0.40.5). Files: add a `file` field, upload via
multipart/form-data record create/update; stored under sanitized original name +
~10-char random suffix (e.g. `test_52iwbgds7l.png`); default max ~5 MB per file
field, adjustable with a performance warning; S3-compatible offload is a settings
option (S10). Production: copy one binary (+ migrations/hooks) to a server and run
`./pocketbase serve yourdomain.com` for auto Let's Encrypt TLS; systemd unit
pattern documented; non-root binding to 80/443 needs setcap/authbind/iptables
(S11). Pre-1.0: "full backward compatibility is not guaranteed", read the changelog
and expect manual migration steps (S09, S15). Material difference: the smallest
possible self-hosted backend footprint for the "future small deployment" clause.

### 1.4 CouchDB/PouchDB replication: conflict-front-and-center sync
PouchDB "exactly implements CouchDB's replication algorithm" and makes conflict
resolution the application's job, not a hidden error (S12). Two conflict places:
immediate (a `put/post/remove/bulkDocs/putAttachment` against a stale `_rev`
returns 409 `conflict`) and eventual (two peers commit offline, both revisions
survive replication and one deterministic winner is picked on every node with no
coordination) (S12, S13). Replication is incremental, unidirectional (push then
pull for full sync), over HTTP, and copies only the last revision of each document
plus tombstones for deletions (S13-index). Map/reduce views see only the winner
(S13). The recommended offline pattern is delta-shaped writes retried to success
(`upsert(docId, deltaFn)`, `putIfNotExists`) rather than read-modify-write on
living documents (S12). Material difference: a mature, explicit conflict model
with multi-master replication and filtered/selector replication for
per-inspector/per-case sharing — but the app must design doc boundaries and a
merge/review UX.

### 1.5 Metadata + storage-provider pattern for photos (not blobs in the DB)
PowerSync's attachments guidance is explicit: do not store images/video/PDF as
blobs or base64 in synced rows; sync small metadata records through the sync
engine and keep bytes in purpose-built storage (S3, Supabase Storage, R2, any
S3-compatible) with a local queue doing background upload/download, retry, offline
availability and cache cleanup (S08). PocketBase mirrors the small-team version:
local filesystem now, S3-compatible later, same record API (S10). ODK's version is
built in: photo widgets ride the submission queue and land on Central's storage
with export (S01). Material difference vs naive "photo column": bounded DB size,
resumable uploads, independent retention/migration of bytes.

### 1.6 W3C accessible-form baseline (applies to any custom form UI)
If the team builds any custom form (coordinator review UI at minimum), the W3C
forms tutorial fixes the checklist: label every control, group related controls,
write instructions, validate input accessibly, notify the user, split long forms
into pages, and only then build custom controls (S14). ODK Collect/XLSForm already
embodies much of this on-device; the custom surface that most needs it is the
office review/correction screen.

### 1.7 Approaches deliberately noted but not primary-sourced here
KoboToolbox (ODK-compatible SaaS/self-host option), QField/Mapeo (map-first field
alternatives), Electric/SQLite-sync variants, and single-node k3s/Coolify-style
Paas targets were considered as further alternatives but were NOT fetched as
primary sources in this window; they are recorded as uncertain/unobserved, not as
findings.

## 2. Consequential behavior, defaults, types, limits, applicability (O2)

### 2.1 PowerSync write path and conflict semantics (S06, S07)
- Ops in the upload queue: PUT (create/replace; all non-null columns), PATCH
  (ID + changed columns only), DELETE (ID only). Backend must be idempotent: the
  same op may arrive more than once; dedupe via per-client incrementing op id or
  idempotent application (ignore DELETE of missing row).
- Default system behavior with a naive backend: per-field last-write-wins; deletes
  always win (later updates to a deleted row are ignored; the id may be recreated).
- `CrudEntry` shape received by the backend (when unmutated): clientId (number,
  auto-increment), id (string row id), op (PUT|PATCH|DELETE), table (string),
  opData (changed columns), transactionId (grouping), optional metadata
  (trackMetadata) and trackPrevious (previous values). Units: integers/strings as
  JSON; SQLite type affinity on the client.
- Custom policies live in the backend: sequence/version columns, field-LWW,
  business-rule validation (e.g. shipped orders lock; inspection states advance
  monotonically), or dead-letter/human-review queues. For this brief the natural
  mapping is: inspector PATCHes flow; coordinator review is a privileged
  transition; conflicting corrections land in a review queue rather than
  auto-merging.
- Attachments are a separate local queue with states such as QUEUED_UPLOAD;
  helpers are now built into each SDK (alpha) with per-platform minimum versions
  (e.g. Web 1.33.0 / RN 1.30.0 / Node 0.17.0 / Flutter 1.16.0 / Swift,Kotlin 1.0.0 /
  .NET 0.1.2); demos use Supabase Storage but any provider fits (S08).
- Applicability: best when a custom Android app (Kotlin SDK exists) + a real
  backend DB is acceptable; overkill if ODK's forms suffice. Requires owning sync
  rules/streams, connector, storage provider and conflict UX.

### 2.2 PocketBase behavior, defaults, limits (S09, S10, S11)
- Data/auth/files/realtime in one Go binary + SQLite; REST-ish API; dashboard UI.
- File fields: default max ~5 MB; multipart/form-data; sanitized name + random
  suffix; thumbs/preview handling per docs; S3 offload setting for growth.
  Consequence for photos: raise the limit deliberately, downscale client-side, and
  plan the local→S3 cutover before the disk fills.
- API rules/filters per collection govern selective sharing (auth-based row
  visibility); realtime subscriptions keep the coordinator view fresh when online.
- Deploy: single binary, no external dependency; `serve <domain>` provisions TLS;
  systemd restart policy; 4096 NOFILE example; reverse-proxy or direct-443
  options. Fits a $5–20 VPS or the nonprofit's closet server.
- Limits: pre-1.0 migration churn; SQLite write-concurrency ceiling (fine for 12
  inspectors + 1 coordinator); no built-in offline sync — the Android client must
  queue (WorkManager/room) or pair with PowerSync/CouchDB-style sync.
- Applicability: ideal "future small self-hosted deployment" and export story
  (SQLite file + filestore copy = migration); not an offline-sync solution by itself.

### 2.3 CouchDB/PouchDB replication and conflict model (S12, S13)
- Replication: incremental one-way over HTTP; push+pull for full sync; only the
  winning/last revision copies; deletions replicate as tombstones; no peer
  tracking after the fact; transient or persistent (replicator DB) replications;
  selector/filtered replication controls which docs flow where.
- Conflicts: immediate 409 on stale `_rev` writes (always handle); eventual
  conflicts keep both leaf revisions everywhere and every node picks the same
  deterministic winner; reads/views show the winner; losers hide in `_conflicts`
  until merged into a new winning revision. Data is never silently lost, but it is
  silently hidden until merged — the review UI must surface `_conflicts`.
- Recommended app shape: document-per-entity (inspection, photo-metadata, comment)
  to minimize same-doc contention; immutable event docs (correction requests,
  status changes) over edits to living docs; `upsert` deltas for counters/flags.
- Attachments: CouchDB/PouchDB attachments ride replication (S12 guide family);
  for day-long offline photo bursts, still prefer the metadata+object-store
  pattern or capped attachment sizes with background compaction.
- Applicability: strongest when multi-master/offline-first with explicit review is
  the core requirement and the team accepts doc modeling + a merge UI. Heavier
  self-hosting than PocketBase (CouchDB cluster or single node + TLS + backup).

### 2.4 ODK behavior relevant to the brief (S01–S04)
- Collect is offline-first: download blank forms once, fill with photos/GPS/skips/
  calculations/multiple languages, queue completed forms, auto-send on
  connectivity; offline maps supported; adb/QR flows provision devices without
  accounts per device.
- Central: compose stack with Postgres; user/project/form/submission/entity
  management; review states; encrypted forms; audit logs; backup/upgrade/CLI
  tooling; Enketo web forms for the coordinator; API + OData/exports for
  migration (no lock-in: Postgres + files + standard exports).
- Entities: turn repeat visits into updatable entity records (property → visits),
  which models "re-inspect and correct" without forking submissions.
- Limits: form-expressiveness ceiling (XLSForm, not arbitrary UI); photo pipeline
  is submission-scoped (fine here); self-hosting is multi-container (heavier than
  PocketBase, lighter than a custom platform); needs a small VPS + backups + TLS.
- Applicability: the default recommendation for this exact brief unless a custom
  app is a hard requirement.

### 2.5 Accessible-form obligations for custom UI (S14)
Label, group, instruct, validate, notify, paginate, and avoid bespoke controls.
Consequence: the coordinator correction UI and any custom Android screens need
visible labels (not placeholder-only), grouped radios/checkboxes with legends,
inline + summary validation, polite/assertive live-region notifications, and
multi-page progress for long inspections. Native Android equivalents
(contentDescription, focus order, touch-target size) apply on-device; the W3C
tutorial governs the web review surface directly.

## 3. Issue / fix / regression / release evidence (O3)

- E1 — PowerSync attachments: deprecated standalone packages
  (`@powersync/attachments`, `powersync_attachments_helper`) replaced by built-in
  SDK attachment helpers (alpha) with per-SDK minimum versions and migration
  notes (S08). Consequence: any tutorial using the old packages is stale; pin to
  the built-in-helper minima and test the QUEUED_UPLOAD→uploaded→downloaded
  lifecycle. Type: evolution/migration chain, directly observed.
- E2 — PocketBase pre-1.0 compatibility: docs warn full backward compatibility is
  not guaranteed before v1.0.0; operators must read the changelog and apply manual
  migration steps (S09); CHANGELOG on master is the governing record (S15,
  fetched 200, content truncated in capture — exact rows not quoted). Observed
  release marker: v0.40.5 download matrix (linux/win/mac × x64/ARM64, ~11–12 MB
  zips) (S09). Type: release-process evidence; no specific regression claimed.
- E3 — PouchDB v9.0.0 download marker observed in guide chrome (S12); CouchDB
  "stable" replication/conflict docs govern semantics (S13). No specific
  issue/fix quoted; conflict-model stability is the finding (deterministic winner,
  both revisions retained).
- Absent/inapplicable (honest): no CVE, crash regression, or version-pinned bug
  with fix commit is claimed for any of the above; MinIO/Garage server-side
  photo-store behavior was not primary-sourced (redirect chain unusable in
  window) and is recorded as unobserved rather than invented.

## 4. Conditions, alternatives, disagreement, uncertainty (O5 groundwork)

- Conditional recommendation: ODK-first for speed and fit; PowerSync+custom app
  only if bespoke UX/offline logic exceeds XLSForm; PocketBase as the small
  self-hosted backend under either custom path (or standalone for a web review
  companion); CouchDB/PouchDB when explicit multi-master merge with coordinator
  adjudication is the product's heart.
- Retained alternatives: (a) ODK all-in; (b) custom Kotlin + PowerSync + Postgres
  + S3-compatible photos; (c) custom app + CouchDB/PouchDB filtered replication +
  review queue; (d) PocketBase + hand-rolled Android outbox (cheapest, weakest
  sync). Photo bytes always leave the synced DB.
- Disagreement with naive defaults: per-field LWW must NOT govern inspection
  corrections (a late accidental edit must not silently beat a coordinator
  approval); deletes-win must NOT let a device wipe an approved record — review
  states need monotonic transitions and a dead-letter queue.
- Uncertainty: exact Central resource sizing and upgrade cadence; PowerSync
  self-host vs Cloud cost/ops for a nonprofit; PocketBase SQLite ceiling under
  photo-metadata load (likely fine, unmeasured); Android background-upload
  reliability (WorkManager/doze) unmeasured here; Kobo/QField/Mapbox-offline and
  MinIO/Garage specifics unobserved.

## 5. Validation proposals vs executed checks (O6 groundwork)

Executed in this window (no runtime, no sandbox writes outside this stage):
- Fetched and compared official docs for ODK, PowerSync, PocketBase, PouchDB,
  CouchDB and W3C (see source-map.json for URLs, versions, timestamps); captured
  bounded excerpts in sources/ with an index. No code executed, no containers
  started, no accounts changed.
Proposed discriminating validations (not run; need a sandbox/device):
- V1 Sync-soak: 2 Android devices offline 24 h, 50 mixed PATCH/PUT/DELETE ops
  each with photo metadata, then reconnect; assert no silent loss, conflicts
  surface in review queue, deletes-win only where intended.
- V2 Conflict-matrix: same-field PATCH/PATCH, PATCH/DELETE, approve/edit race;
  assert coordinator decision is final and auditable.
- V3 Photo pipeline: 200 photos × 3–8 MB through outbox→upload→metadata-sync→
  download; assert bounded DB size, resumable retry, EXIF/GPS preserved or
  provably stripped by policy.
- V4 Accessibility pass: coordinator review flow against W3C checklist + Android
  TalkBack/focus-order pass on custom screens.
- V5 Export/migration fire-drill: Postgres/SQLite dump + filestore copy → restore
  on a fresh host; assert byte-identical exports and working review history.
- V6 Small-host survival: single VPS, TLS, backup/restore, upgrade one minor;
  assert documented runbook steps and rollback.

Native/lifecycle note: created one fresh native Goal for this assignment and
verified active status before writing; science is saved before any terminal
completion. Usage/billing: unobserved (null). No nested agents, no repo edits,
no executable downloads, no counterpart reads.
