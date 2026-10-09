# Draft — S01 field-inspections planning deliverable (A-M07-B treatment/research)

Self-contained final for this scope. Compares every exact P clause of the revealed thin plan
against pre-reveal discovery (frozen `discovery.md`, 15 pinned captures S01–S15 in
`source-map.json` + `sources/`). Later stages may correct this draft. Disposition vocabulary:
already-covered / correction / optional enhancement / user decision / rejected / uncertain.

## Per-P disposition

### P1: "Use a PWA and browser local storage for all offline records." — CORRECTION

The PWA shell is viable on Android, but "browser local storage for all offline records" is the
wrong storage layer for the brief: a day offline with photos and GPS exceeds what synchronous,
small-quota, eviction-prone browser local storage handles, and it offers no query, sync, or
conflict story. Corrected direction, in preference order:

1. **Domain-native (candidate A): ODK Collect on Android + self-hosted ODK Central.**
   Collect downloads blank forms, captures location/photos fully offline, and renders offline
   map layers from MBTiles files side-loaded onto the device; Central separates global Web
   Users from per-project App Users with per-form Form Access control. Least custom code; the
   sharing granularity is per-form-per-device-credential, not per-record.
2. **Custom client on a real offline store + sync engine (candidate C):** RxDB (SQLite-backed,
   checkpoint sync; note its CouchDB plugin skips the official protocol, excludes attachments,
   and caps parallel collections at 6), PowerSync (Postgres buckets per client; build on Sync
   Streams, not legacy Sync Rules), or Electric (Postgres Shapes over HTTP; offline-write story
   still to verify).
3. **Custom client + single-binary backend (candidate B):** PocketBase (`./pocketbase serve`,
   ~12 MB, embedded SQLite, v0.40.5 captured, explicitly pre-v1) with a hand-built offline
   queue — simplest server, highest-risk sync code.

Retained from P1: installability and offline-first intent. Corrected: the storage mechanism.
Uncertain: whether the nonprofit prefers zero-custom-code (A) over control (B/C) — a user
decision (D1 below).

### P2: "Upload complete inspection JSON on reconnect with last-write-wins." — CORRECTION

Last-write-wins silently discards exactly the edits the brief cares about: a coordinator
correction and an inspector amendment to the same inspection made while both were offline.
Whole-JSON upload also wastes constrained bandwidth and cannot resume. The governing models
found in discovery all preserve conflicting revisions instead of discarding them: CouchDB keeps
both revisions on all replicas and presents a deterministic winner while the loser waits in
`_conflicts` (views see winners only); RxDB handles conflicts during replication; CRDT engines
(Automerge) merge structurally. Corrected requirement: **conflict-preserving sync with a
coordinator merge queue** — both revisions preserved, winner flagged, loser visible, merge
produces a superseding revision (validation V3 drills this). LWW survives only for narrowly
commutative fields (e.g. monotonic status progressions), never as the global policy.

### P3: "Store photo URLs in each form." — CORRECTION (intent retained, mechanism hardened)

Reference-by-URL is the right shape, but bare URLs are dangling references while offline and
say nothing about durability, identity, or privacy. Corrected photo pipeline: capture →
content-hash-keyed object in S3-API storage (self-hosted Garage, built to run outside
datacenters; MinIO as an unverified alternative pending license confirmation) → metadata link
in the record → background upload queue with retry → offline placeholder rendering. Photos ride
out-of-band from record sync (RxDB's CouchDB plugin does not replicate attachments at all).
Privacy rule: capture-time GPS stays in the inspection record; shared/exported derivatives
strip location. Validation V2 proves byte-identical round-trip plus re-import elsewhere.

### P4: "Add coordinator review and CSV export." — ALREADY-COVERED intent + OPTIONAL ENHANCEMENT

Coordinator review is load-bearing and retained — under P2's correction it doubles as the
conflict-merge surface, and any browser review console must pass the W3C WAI control-by-control
checklist (labels incl. visually-hidden patterns, grouping, instructions, error identification,
notifications, multi-page flow). CSV export is necessary but insufficient as the portability
story: CSV carries no photo bytes and weak metadata linkage. Enhancement: a **full-fidelity
export bundle** (records + S3 objects + linkage manifest) that re-imports into a different
backend, plus the CSV for spreadsheets. The anti-lock-in spine stays: open schema, portable
database file, S3-API photos, documented export. Review-queue accessibility is validated by V6;
export fidelity by V2/V7.

### P5: "Defer access control beyond individual sign-in until rollout." — REJECTED as stated → USER DECISION

Deferring the sharing model until rollout bakes in a retrofit, because granularity is
structural, not additive: ODK shares per-form-per-App-User (coarse), PocketBase shares per-row
via five filter-rules per collection defaulting to locked with distinct 200-empty/400/404/403
shapes (fine, but miswritten filters silently narrow results), and PowerSync shares per-bucket
from server-side queries (native to sync). The choice must be made now, with the nonprofit,
as decision D2: per-property visibility (inspector sees only assigned addresses) vs
per-form/per-project visibility, staff turnover handling (credential rotation, ex-inspector
revocation), and coordinator override scope. Validation V4 probes the full role matrix; V5
time-boxes the ODK granularity spike if candidate A survives. Individual sign-in remains the
floor, never the ceiling.

### P6: "Test by toggling network off and on." — CORRECTION (kept as smoke, replaced as strategy)

The toggle test stays as a developer smoke check and becomes validation V0. The discriminating
battery is V1–V8: a day-offline field drill with 100%-reconciliation pass bars (V1), photo
pipeline audit (V2), conflict drill (V3), sharing-matrix probe (V4), ODK granularity spike
(V5), accessibility pass (V6), deployment-plus-restore-plus-migrate rehearsal (V7), and
upgrade rehearsal for the pre-v1 backend (V8). No runtime, device, or account testing was
available in this stage — every behavioural claim about unobserved systems is a proposal, and
X1 (cold exact-byte captures) is the only executed check.

## Retained findings (conditions, alternatives, disagreement, uncertainty)

- **Three candidates stand:** A (ODK-native, least code, coarsest sharing, Docker/Postgres
  operations), B (custom client + PocketBase + S3, simplest server, riskiest sync, pre-v1
  backend with explicit test-first upgrades per the v0.40.0–v0.40.5 chain incl. the Go 1.27
  JSON-v2 compat warning and the #7799 backup-lock fix), C (sync engine + Postgres + S3,
  professional sync semantics, heaviest footprint, engine churn exemplified by the Sync
  Rules → Sync Streams deprecation with its migrate command and no-scope-change invariant).
- **Load-bearing constraints:** 12 inspectors, Android-only, day-long offline, simple
  deployments, export without lock-in. Out of scope unless decided otherwise: iOS, realtime
  collaboration, sub-minute sync.
- **Capacity unknowns:** per-photo size policy (cap at capture vs keep originals) dominates
  storage and sync-time budgets; location accuracy gates (fix-quality thresholds, manual
  fallback) depend on unstated "prove presence" vs "map the defect" needs.
- **Explicitly unverified leads:** MinIO licensing/embedding terms (secondary reports only);
  Electric's offline-write story; Automerge's operational story (sync server, auth, photo
  handling); PocketBase JSVM `$filesystem.s3` bindings (secondary report). Each is an
  alternative with a named verification step, not a recommendation.
- **Disagreement preserved:** PWA-vs-native and build-vs-adopt (ODK) split the evidence; the
  draft does not force the choice — D1 carries it to the nonprofit with costs attached.

## User decisions and optional capabilities

- **D1 (required): adopt ODK vs build custom.** ODK = fastest to field, coarsest sharing,
  heaviest ops weight relative to "simple". Custom = full control, full sync risk.
- **D2 (required): sharing granularity.** Per-property vs per-form/per-project; turnover and
  revocation flows; coordinator override scope. Blocks schema and engine choice.
- **D3 (required): photo policy.** Resolution caps, original retention, storage budget, GPS
  handling in shares/exports.
- **D4 (optional capabilities, deferred without prejudice):** coordinator web-fill path,
  public read-only sharing links, analytics/reporting beyond CSV, multi-day offline, iOS.
  Each is an additive phase with its own validation, not a silent scope expansion.

## Validations: executed vs proposed

- **Executed — X1:** 15 primary-source captures pinned by exact bytes + SHA-256 (see
  `source-map.json`, `sources/index.md`). No witness ran; no sandbox runtime existed; no
  behavioural probe executed. Usage/billing telemetry unobserved (null).
- **Proposed — V0:** network toggle smoke (from P6). **V1** day-offline drill (100%
  reconciliation ≤30 min on office Wi-Fi). **V2** photo pipeline audit (SHA-256 identical,
  GPS retained/stripped correctly, re-import). **V3** conflict drill (both revisions
  preserved, merge supersedes). **V4** sharing-matrix probe per role incl. status-shape
  assertions. **V5** ODK granularity spike, time-boxed. **V6** WAI accessibility pass
  (screen reader + keyboard-only). **V7** bare-VM deploy, destroy-restore from backup only,
  migrate photos to a different S3 implementation. **V8** staging-first upgrade rehearsal.

## Evidence pointer

Discovery (`discovery.md`, frozen before reveal; plan-reveal receipt in `plan-reveal.json`)
holds the full O1–O6 investigation with claim-level detail C1–C9 and evolution chains E1–E3.
This draft restates every load-bearing conclusion in its own prose; source IDs above are
locators into the pinned captures, never substitutes for the text.
