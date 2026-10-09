# Final — S01 field-inspections planning deliverable (A-M07-B treatment/reviser)

Self-contained final for this scope: offline field-inspection app for a small housing
nonprofit. Twelve inspectors capture forms, photos and location on Android devices,
often with no service for a day; an office coordinator reviews corrections. Keep
deployments simple; permit export/migration without vendor lock-in.

This final covers the full brief obligations O1–O6 and every exact P clause of the
revealed thin plan. It starts from the research draft and discovery (frozen
`discovery.md`, 15 pinned captures S01–S15) and adjudicates the complete critique
(M1–M8, m1–m8) claim by claim against the capture bytes, re-verified byte-identical
in this stage (see `source-map.json`, `sources/index.md`). Disposition vocabulary:
already-covered / correction / optional enhancement / user decision / rejected /
uncertain. Critique adjudication vocabulary: accept / amend / reject / retain
uncertainty. Source IDs below are locators into the pinned captures, never
substitutes for the prose.

No new cold captures were taken in this stage: all 15 captures re-verified
byte-identical (SHA-256 match, no drift), and each criticism calling for new
evidence offers an explicit downgrade-or-schedule repair path, which this final
takes within the stage time-box. Every unverified item below carries a named
verification probe (V9–V12) instead of a silent gap.

## 0. Critique adjudication (every finding)

### Material findings

- **M1 (P2 overgeneralization) — ACCEPT.** The draft's "all governing models
  preserve conflicting revisions" is unsupported. On-demand check: the PowerSync
  capture contains zero occurrences of "conflict"; the Electric intro contains
  zero occurrences of "conflict" and zero of "offline"; the Automerge capture is
  homepage positioning ("prevents conflicts", "conflict free") with no merge,
  sync-server, auth, or photo semantics. Only the CouchDB capture (both revisions
  survive on all replicas, deterministic winner fed to reads/views, loser held in
  `_conflicts`) and the RxDB capture (conflicts handled during replication,
  newest-version-only client storage) evidence preservation. Repaired below:
  the preservation claim is scoped to CouchDB-MVCC and RxDB-checkpoint paths,
  and candidate B's conflict layer is stated plainly as unbuilt — B must invent
  MVCC-or-equivalent to meet the corrected P2 requirement.
- **M2 (Sync Streams mandate without Streams evidence) — ACCEPT, mandate
  downgraded.** The PowerSync capture verifies the Legacy label, the Sync
  Streams successor, both migration routes, and the no-scope-change invariant —
  but contains no Streams semantics (parameters, data model, offline writes,
  conflict behaviour, self-host config). The draft's "build on Sync Streams" is
  therefore downgraded from settled mandate to conditional: a PowerSync-based
  candidate C arm may proceed only after a Streams capture plus an offline-write
  capture (probe V11). The no-scope-change invariant is kept as a vendor claim
  to verify, not an assumed property (see also m5).
- **M3 (ODK ops weight without install evidence) — ACCEPT, downgraded.**
  None of the ODK captures documents Central installation, Compose files,
  Postgres operations, resource floors, or backup (zero "docker" mentions in
  the Users/Projects captures). The "heaviest ops weight relative to simple"
  leg of D1 is therefore explicitly unverified. Repaired by probe V12 (capture
  Central self-host docs incl. resource/backup) and by presenting D1 without
  the ops comparison until V12 runs.
- **M4 (V1 30-minute bar ungrounded) — ACCEPT.** "100% reconciled within 30 min
  on office Wi-Fi" is a placeholder, not a derived budget: photo size policy
  (D3) fixes the numerator and office throughput the denominator, and neither
  is grounded. V1 keeps its drill shape; the bar is restated as an explicit
  placeholder with a derivation rule (see V1).
- **M5 (V3 applicability) — ACCEPT.** V3 as written cannot pass on candidate B
  as specified, and the draft never pre-declared expected per-candidate
  results. Repaired with an expected-results matrix (see §7): B is expected to
  fail V3 until its conflict layer is built; A and C arms have stated
  expectations per validation.
- **M6 (photo pipeline designed, not evidenced) — ACCEPT.** The Garage capture
  verifies only positioning (S3 object store runnable outside datacenters) plus
  quick-start; it contains zero hash/EXIF semantics, and no capture evidences
  any candidate's upload queue, retry, placeholder rendering, or GPS-strip
  tooling. The content-hash → S3 → metadata-link → background-queue →
  placeholder pipeline is therefore marked proposed-unverified throughout, and
  V2 stays a proposal, not near-term assurance. Strip + queue mechanics get
  probe V10.
- **M7 (candidate-C offline writes unevidenced) — ACCEPT.** PowerSync and
  Electric offline writes appear nowhere in the captured scope; Automerge
  offline queuing is homepage prose without operational semantics; the RxDB
  path has the only captured substance (offline-first client store,
  during-replication conflict handling) but no explicit offline-write excerpt.
  C is therefore presented conditionally per engine (§5), and no engine carries
  the day-offline requirement until probe V11 captures its offline-write +
  photo-out-of-band path.
- **M8 (wrong validation pointer) — ACCEPT, fixed here.** Discovery C9 cites
  V6 (accessibility pass) for the export/strip drill; the correct pointer is
  V2 (photo pipeline audit). The draft already cites V2/V7 consistently, so
  this final records the corrected pointer (V2) and notes the discovery slip
  without editing the frozen predecessor.

### Minor findings

- **m1 (P1 ambiguity; no PWA-store capture) — ACCEPT.** "Browser local storage"
  is ambiguous between the `localStorage` API and browser storage generally.
  The correction stands for the API reading; the retained "PWA shell is viable"
  line is marked asserted-not-evidenced pending probe V9 (IndexedDB / OPFS /
  SQLite-WASM day-offline fitness). The draft's unexplained A > C > B ordering
  is dropped: candidates are presented unordered with selection criteria
  deferred to decision D1.
- **m2 (uncaptured names) — ACCEPT.** Room/WorkManager (candidate B queue),
  Enketo/Web Forms (browser-fill path), and ODK Entities (V5 second spike arm)
  are currently names, not evidenced designs. Enketo/Web Forms is dropped to
  "browser-fill path TBD"; Room/WorkManager is folded into B's design probe;
  Entities stays inside time-boxed V5 as a named-not-evidenced option.
- **m3 (uncited background) — ACCEPT.** "GPS needs no network" and "~100s MB"
  tiles are labelled background estimates, and tile-size measurement is added
  to the V1/V5 probes.
- **m4 (unverified leads lack scheduled checks) — ACCEPT.** MinIO
  licensing/embedding, Electric offline writes, Automerge operational story,
  and PocketBase JSVM `$filesystem.s3` each get a scheduled probe in V9–V12;
  none remains a live alternative without a verification step.
- **m5 (Streams invariant is vendor-claimed) — ACCEPT.** The no-scope-change
  invariant keeps discovery's verify-not-assume framing everywhere it appears.
- **m6 (P5/D2 ends blocked-on-user) — ACCEPT, presented honestly.** Selective
  sharing ends as correctly-reframed-but-blocked-on-D2, not resolved (§1 P5).
- **m7 (V7 cross-S3 leg assumes uncaptured mechanics) — ACCEPT.** V7 legs 2–3
  (destroy-restore, cross-S3 migrate) are conditional on the S3 portability
  capture in probe V10; V7 leg 1 (bare-VM deploy) stands alone.
- **m8 (S15 body is HTML) — ACKNOWLEDGED.** Parsed as HTML throughout; the
  source map records the suffix/body mismatch.

No false corrections or false rejections were found, and this reviser concurs:
all six P dispositions stand in direction; the repairs above narrow overclaims,
downgrade mandates to conditionals, and schedule the missing evidence.

## 1. Per-P disposition (exact clauses)

Thin plan P1–P6, each with disposition and repaired text.

### P1: "Use a PWA and browser local storage for all offline records." — CORRECTION (ambiguity noted, m1)

Under the `localStorage`-API reading, the correction stands: a synchronous,
small-quota, eviction-prone key-value API cannot carry a day of offline forms,
photos and GPS with query, sync, and conflict needs. Under the broader
"browser storage generally" reading, the question is open: no capture
investigates IndexedDB, OPFS, or SQLite-WASM, so whether a corrected PWA
(a sync-engine client in a browser shell) meets the day-offline bar is
undecided pending probe V9. The PWA shell's viability is therefore
asserted-not-evidenced, not retained as fact.

Corrected direction (unordered; selection is decision D1, §6):

1. **Domain-native (candidate A): ODK Collect on Android + self-hosted ODK
   Central.** Collect downloads blank forms, captures location/photos fully
   offline, and renders offline map layers from MBTiles files side-loaded onto
   the device; Central separates global Web Users from per-project App Users
   with per-form Form Access control. Least custom code; sharing granularity
   is per-form-per-device-credential, not per-record. Operations weight is
   explicitly unverified (M3/V12).
2. **Custom client on a real offline store + sync engine (candidate C,
   conditional per M7):** RxDB (SQLite-backed, checkpoint sync; its CouchDB
   plugin skips the official protocol, excludes attachments, caps parallel
   collections at 6), PowerSync (conditional on Streams + offline-write
   capture, V11; build target must not be legacy Sync Rules), or Electric
   (Postgres Shapes over HTTP; offline-write and conflict stories uncaptured).
3. **Custom client + single-binary backend (candidate B):** PocketBase
   (`./pocketbase serve`, ~12 MB, embedded SQLite, v0.40.5 captured,
   explicitly pre-v1) with a hand-built offline queue — simplest server, and
   its sync/conflict/photo-queue layer is currently undesigned (M1/M5): B
   fails the corrected P2 requirement as specified and must invent
   MVCC-or-equivalent plus a photo queue.

Retained from P1: installability and offline-first intent. Corrected: the
storage mechanism. Uncertain: adopt-vs-build (D1) and the PWA-shell question (V9).

### P2: "Upload complete inspection JSON on reconnect with last-write-wins." — CORRECTION (scoped per M1)

Last-write-wins as the global policy must go: it silently discards exactly the
edits the brief cares about — a coordinator correction and an inspector
amendment to the same inspection made while both were offline. Whole-JSON
upload also wastes constrained bandwidth and cannot resume.

The preservation claim is scoped to the evidence: CouchDB-style MVCC keeps
both revisions on all replicas and presents a deterministic winner while the
loser waits in `_conflicts` (views see winners only); RxDB handles conflicts
during replication with newest-only client storage. No evidenced claim is made
about PowerSync, Electric, or Automerge conflict behaviour. Corrected
requirement: **conflict-preserving sync with a coordinator merge queue** — both
revisions preserved, winner flagged, loser visible, merge produces a
superseding revision (validation V3 drills this; expected-results matrix in
§7 states B fails V3 until its layer is built). LWW survives only for narrowly
commutative fields (e.g. monotonic status progressions), never as global policy.

### P3: "Store photo URLs in each form." — CORRECTION, intent retained; pipeline proposed-unverified (M6)

Reference-by-link is the right shape, but bare URLs dangle offline and
under-specify identity, durability, and privacy. The corrected pipeline —
capture → content-hash-keyed object in S3-API storage (self-hosted Garage,
positioned to run outside datacenters; MinIO an unverified alternative pending
license confirmation, probe V10) → metadata link in the record → background
upload queue with retry → offline placeholder rendering — is a coherent
**proposed-unverified** design: hashing, queue/retry, placeholder rendering,
and GPS-strip tooling have no captured implementation in any candidate. Genuine
support exists only for the out-of-band shape under the RxDB path (its CouchDB
plugin verifiably excludes attachment replication). Privacy rule (proposed):
capture-time GPS stays in the inspection record; shared/exported derivatives
strip location. Validation V2 (byte-identical round-trip, GPS retained/stripped
correctly, re-import elsewhere) is the check that would promote this pipeline
from proposed to verified.

### P4: "Add coordinator review and CSV export." — ALREADY-COVERED intent + OPTIONAL ENHANCEMENT

Coordinator review is load-bearing and retained — under corrected P2 it doubles
as the conflict-merge surface, and any browser review console must pass the W3C
WAI control-by-control checklist (labels incl. visually-hidden patterns,
grouping, instructions, error identification, notifications, multi-page flow).
CSV export is necessary but insufficient as the portability story: CSV carries
no photo bytes and weak metadata linkage. Enhancement: a **full-fidelity export
bundle** (records + S3 objects + linkage manifest) that re-imports into a
different backend, plus the CSV for spreadsheets. The anti-lock-in spine stays:
open schema, portable database file, S3-API photos, documented export.
Review-queue accessibility is validated by V6; export fidelity by V2/V7 (M8
corrected pointer). Native Collect widgets inherit platform behaviour and need
only the cheaper platform pass (checklist TBD, see V6).

### P5: "Defer access control beyond individual sign-in until rollout." — REJECTED as stated → USER DECISION, blocked-on-D2 (m6)

Deferral is rejected because granularity is structural, not additive — all
three premises verify: ODK shares per-form-per-App-User (coarse); PocketBase
shares per-row via five filter-rules per collection defaulting to locked with
distinct 200-empty/400/404/403 shapes (fine, but miswritten filters silently
narrow results instead of erroring); PowerSync shares per-bucket from
server-side queries (native to sync). But the replacement, decision D2, also
defers the choice — honestly, as a user decision that blocks schema and engine
choice, not as silent rollout deferral. The brief's selective-sharing
investigation therefore ends with options plus a decision procedure, not a
recommendation: per-property visibility vs per-form/per-project visibility,
staff turnover handling (credential rotation, ex-inspector revocation), and
coordinator override scope. D2 needs a per-candidate mechanism mapping (ODK
credential rotation vs PocketBase rule change vs bucket re-query) before it is
decidable — scheduled as part of V4/V5. Validation V4 probes the full role
matrix with status-shape assertions; V5 time-boxes the ODK granularity spike
if candidate A survives. Individual sign-in remains the floor, never the ceiling.

### P6: "Test by toggling network off and on." — CORRECTION (kept as smoke, replaced as strategy)

The toggle test stays as a developer smoke check (V0). The discriminating
battery is V1–V8 (§7) plus scheduled evidence probes V9–V12, with an
expected-results matrix per candidate (M5) and V1's pass bar restated as an
explicit placeholder with a derivation rule (M4). No runtime, device, or
account testing was available in any stage — every behavioural claim about
unobserved systems is a proposal, and X1 (cold exact-byte captures) is the
only executed check.

## 2. O1 — Tools, products, materially different approaches

Sync engines: (1) PowerSync — Postgres-backed partial sync with per-client
buckets defined by server-side queries (parameters from JWT/client/table
values; clients sync only matching buckets), so selective sharing falls out
of the sync mechanism itself; Sync Rules are legacy/deprecated in favour of
Sync Streams, and any adoption is conditional on a Streams capture (M2/V11).
(2) Electric — Postgres sync over HTTP with Shapes (filtered subsets);
offline-write and conflict stories uncaptured (M7/V11). (3) Automerge — CRDT
sync engine, merge-based convergence without a central arbiter; captured only
as homepage positioning, with sync-server, auth, photo, and ops stories all
uncaptured (M1/M7/V11); blobs-by-reference (photos outside the CRDT document)
is the only supportable pattern. (4) RxDB with CouchDB replication plugin —
offline-first reactive client store using checkpoint-based sync against a
CouchDB endpoint rather than the official protocol (faster initial
replication, newest revisions only on-device) at the cost of protocol
incompatibility, no attachment replication, and a 6-parallel-collection
ceiling; the only candidate-C path with captured substance. (5)
CouchDB/PouchDB-style MVCC replication — multi-version documents, push/pull
over HTTP, both conflicting revisions preserved, deterministic winner
presented; the clearest mental model for day-offline-then-merge, informing
the coordinator merge-queue UX.

Backends and self-hosting: (6) PocketBase — single-binary backend (embedded
SQLite, auth, files, admin UI, REST), ~12 MB per platform at v0.40.5, started
with `./pocketbase serve`; five per-collection API rules doubling as record
filters; explicitly pre-v1 (backward compatibility not guaranteed; production
use requires changelog-driven manual migrations). (7) Garage — self-hosted
S3-compatible object store positioned to run outside datacenters; pairs with
any backend via the S3 API, which is itself the anti-lock-in mechanism.
MinIO (single Go binary, S3-compatible, AGPL core with commercial
embedding/ISV licensing per secondary reports) stays an unverified lead
pending probe V10. (8) ODK Central + ODK Collect — the domain-standard
adopt-instead-of-build stack: Central with Web Users vs per-project App Users
and per-form Form Access; Collect Android-native and offline-first with
MBTiles offline map layers side-loaded out-of-band; self-host cost uncaptured
(M3/V12).

Forms and accessibility: (9) W3C WAI form patterns as the accessibility
contract for any browser review/fill path: label every control (including
visually-hidden labels), group related controls, associate instructions,
validate with identified errors and notifications, design multi-page flows
deliberately. (Browser-fill product name TBD; Enketo/Web Forms dropped as an
uncaptured name per m2.)

## 3. O2 — Consequential behaviour, defaults, limits

- **C1 CouchDB conflict model: winner deterministic; loser hidden, not lost.**
  Push/pull over HTTP; after conflicting edits replicate, both revisions exist
  on both sides; reads and map functions see only the deterministic winner;
  the loser sits in `_conflicts` until merged. Applicability: the coordinator
  review queue is a conflict-surface UI — any record view without a conflicts
  indicator silently presents winners and strands losers (V3 drills this).
- **C2 PocketBase API rules: default locked; rules are filters; status codes
  carry meaning.** Five rules per collection plus `manageRule` on auth
  collections; default locked (`null` = superuser only), empty = public,
  non-empty = filter expression. Unsatisfied rules return 200 with empty list
  (list), 400 (create), 404 (view/update/delete); 403 only when locked and the
  caller is not a superuser; superusers bypass all rules. A miswritten
  listRule silently narrows results — a data-loss-shaped bug (V4 asserts
  per-role status/body shapes).
- **C3 PocketBase deployment facts and pre-v1 risk.** v0.40.5, ~11–12 MB zips,
  `serve` after unzip, SQLite embedded. Upstream: not recommended for
  production-critical apps before v1.0.0 without changelog-driven manual
  migrations. Acceptable at this scale only with rehearsed backup/restore and
  a PocketBase-independent export (SQLite file + S3 photos are themselves the
  export format).
- **C4 RxDB CouchDB replication limits.** `replicateCouchDB()` with live or
  one-shot modes; no attachment replication; at most 6 collections in parallel
  (documented workaround on the same page); newest versions only on-device, so
  on-device conflict archaeology is unavailable and conflicts are handled
  during replication. Consequences: photos out-of-band with a retry queue;
  schema shaped toward fewer, wider collections or staged replication.
- **C5 PowerSync bucket model (partly verified; Streams conditional).** Bucket
  = name + parameter queries + data queries; per-client scoping verified, as
  are both migration routes and the vendor-claimed no-scope-change invariant
  (verify, don't assume). No Streams semantics captured: the Streams build
  target is conditional on probe V11.
- **C6 ODK users and form access.** Web Users global across projects; App Users
  per-project device credentials; sharing primitive is the per-project Form
  Access tab (per-form per-App-User dropdown) — coarser than row rules or
  buckets. Per-property visibility needs one project per visibility group or
  an Entities-based design; Entities is a name, not an evidenced design (V5
  spikes both arms, time-boxed).
- **C7 ODK offline maps.** Collect renders any MBTiles tile set selected from
  the device as the offline layer; files arrive out-of-band (sharing service,
  direct send, device-to-device); blank-form download plus offline capture
  verified. The MBTiles build/distribute/version pipeline is part of the
  deliverable. Tile-size figures (~100s MB) and GPS-without-network are
  background estimates (m3), to be measured in V1/V5.
- **C8 WAI labelling and validation.** Label association incl. visually-hidden
  pattern; grouping, instructions, error identification, notifications, and
  multi-page flows as separate checklist items. Coordinator console and any
  browser form path must pass control-by-control (V6); native Collect path
  takes the platform checklist (TBD).
- **C9 Photo storage via S3 API (positioning verified; mechanics proposed).**
  Garage's S3-compat/outside-datacenters positioning verifies; hash-keyed
  objects, metadata split, GPS retain/strip, queue mechanics, and JSVM
  `$filesystem.s3` bindings are designed or explicitly-unverified secondary
  reports (M6/V10).

## 4. O3 — Issue/fix/regression/release chains (evidence present)

- **E1 PowerSync: Sync Rules → Sync Streams migration (current, primary).**
  The captured page is itself the evolution record: Legacy label, successor
  with capability deltas (on-demand sync, JOINs, CTEs, subqueries), continued
  support, Streams-only new features, two migration routes, no-scope-change
  invariant. Consequence: cost the migration, verify the invariant, no
  greenfield on the deprecated surface — and, per M2, no greenfield on
  Streams either until it is captured. No absent-evidence case needed.
- **E2 PocketBase v0.40.0–v0.40.5 chain (primary).** Six releases: Go floor
  raised to 1.27 with migration to `encoding/json/v2` plus explicit
  backward-compat warning (test locally first, do not push blindly);
  `modernc.org/sqlite` bumps with `_defensive=1` DSN default; backup
  generation changed to stop transaction-locking during backup (discussion
  #7799). The pre-v1 warning is live, not boilerplate: upgrades are
  test-first events (V8), and the backup-lock fix is exactly the operational
  bug class this deployment would have felt.
- **E3 RxDB's deliberate protocol break from CouchDB (primary).** Documented
  rationale (official protocol too chatty for clients: ≥1 request per
  document; full revision trees on-device) and stated tradeoffs (attachments,
  >6 parallel collections) for faster initial replication and
  during-replication conflict handling. Lesson, applied throughout:
  "CouchDB-compatible" is not one thing — verify wire behaviour per plugin.

## 5. Candidates (conditional presentation, unordered)

- **A. ODK-native (Collect + Central, self-hosted).** Least custom code; proven
  offline Android capture; MBTiles offline maps; coarse (per-form) sharing;
  coordinator review in Central; export via Central API/Briefcase. Risks:
  per-property sharing granularity (C6/V5) and Central operational weight,
  explicitly unverified (M3/V12).
- **B. Custom Android + PocketBase + S3 photos.** Finest control, simplest
  server (one binary + S3 store), row-level sharing via API rules. Risks:
  the entire offline queue, retry, conflict, and photo-queue layer is
  currently undesigned custom code (M1/M5 — expected to fail V3 until built);
  pre-v1 backend with test-first upgrades (C3/E2/V8).
- **C. Custom client on a sync engine + Postgres + S3 (conditional per
  engine).** RxDB arm: strongest captured footing, needs explicit
  offline-write capture. PowerSync arm: blocked on Streams + offline-write
  capture (M2/V11). Electric arm: blocked on offline-write + conflict capture
  (M7/V11). Automerge arm: blocked on full operational capture (V11); photos
  must stay blobs-by-reference regardless. Risks: engine churn (E1), heaviest
  self-host footprint, most new concepts for a tiny team.

All three keep the same portability spine: open form schema + SQLite/Postgres
data + S3-API photos + documented export. The anti-lock-in clause is satisfied
by that spine, not by any single vendor promise. The PWA-vs-native and
adopt-vs-build splits are preserved as disagreement carried to D1 with costs
attached, not forced here.

## 6. O5 — Decisions, conditions, alternatives, uncertainty retained

Load-bearing constraints: 12 inspectors, Android-only, day-long offline,
simple deployments, export without lock-in. Out of scope unless decided
otherwise: iOS, realtime collaboration, sub-minute sync.

Required decisions:

- **D1 adopt ODK vs build custom** (ops leg unverified pending V12). ODK =
  fastest to field, coarsest sharing, unknown ops weight. Custom = full
  control, full sync risk (B undesigned; C conditional per engine).
- **D2 sharing granularity** (blocks schema and engine choice; ends P5 as
  blocked-on-user). Per-property vs per-form/per-project; turnover and
  revocation flows; coordinator override scope; needs per-candidate mechanism
  mapping (V4/V5) before it is decidable.
- **D3 photo policy** (dominates storage/sync budgets; derives V1's bar).
  Resolution caps, original retention, storage budget, GPS handling in
  shares/exports.
- **D4 optional capabilities, deferred without prejudice:** coordinator
  web-fill path (product TBD), public read-only sharing links,
  analytics/reporting beyond CSV, multi-day offline, iOS. Each an additive
  phase with its own validation, not silent scope expansion.

Capacity unknowns: per-photo size policy (cap at capture vs keep originals);
location accuracy gates (fix-quality thresholds, manual fallback) depend on
unstated "prove presence" vs "map the defect" needs.

Explicitly unverified leads, each with a scheduled probe (m4): MinIO
licensing/embedding (V10); Electric offline-write/conflict story (V11);
Automerge operational story — sync server, auth, photo handling (V11);
PocketBase JSVM `$filesystem.s3` bindings (V10); ODK Central self-host ops
(V12); ODK Entities design (V5); PWA-store fitness — IndexedDB/OPFS/SQLite-WASM
(V9); cross-S3 portability mechanics (V10); native-accessibility checklist (V6);
tile-build/version tooling and tile-size measurement (V1/V5).

## 7. O6 — Validations: executed vs proposed, with expected results

Executed:

- **X1.** 15 primary-source captures pinned by exact bytes + SHA-256, carried
  through research → critic → reviser with zero drift (all hashes re-verified
  identical in this stage). No witness ran; no sandbox runtime existed; no
  behavioural probe executed. Usage/billing telemetry unobserved (null).

Proposed battery (each discriminates between candidates or verifies a
load-bearing claim):

- **V0** network-toggle smoke (from P6). **V1** day-offline field drill:
  12 scripted devices (or 3 real + 9 emulated), airplane mode 8h, 40
  inspections with photos+GPS each; restore connectivity; measure zero data
  loss, median/p95 sync completion, battery drain, storage headroom.
  Pass bar: PLACEHOLDER "100% records + photos reconciled within 30 min on
  office Wi-Fi", to be replaced by a derived budget once D3 is decided —
  derivation rule: bar = (D3 bytes-per-inspection × 40 × 12 ÷ measured office
  throughput) × 2 headroom, recomputed after the first measured run; tile-size
  measurement included (m3). **V2** photo pipeline audit: bytes identical
  (SHA-256), EXIF/GPS retained in record and stripped in shared derivatives,
  full export re-imports elsewhere; falsifier: backend-internal metadata IDs
  break portability. **V3** conflict drill: same inspection edited on two
  offline devices (coordinator correction vs inspector amendment); sync both;
  require both revisions preserved, winner flagged, loser visible in review
  UI, merge producing a superseding revision. **V4** sharing-matrix probe:
  per role (inspector-own, inspector-other, coordinator, ex-inspector)
  list/view/create/update/delete with expected allow/deny AND expected
  status/body shape (PocketBase 200-empty vs 404 vs 403); fails
  coarse-granularity designs that cannot express per-property visibility.
  **V5** ODK granularity spike, time-boxed: projects-per-group vs
  Entities-based per-property visibility; admin steps per new property and
  credential rotations measured; failure retires A unless coarser sharing is
  accepted. **V6** accessibility pass: coordinator console control-by-control
  WAI checklist with screen reader + keyboard-only run; native Collect path
  takes a named platform checklist (TBD — must be named before V6 runs).
  **V7** deployment + restore rehearsal: leg 1 bare-VM deploy (target: one
  sitting, documented steps); legs 2–3 (destroy-restore from backup+export
  only; migrate photos to a different S3 implementation) conditional on the
  V10 S3 portability capture. **V8** staging-first upgrade rehearsal for the
  pre-v1 backend (E2 institutionalised).

Scheduled evidence probes (all proposals; each closes a named gap):

- **V9** PWA-store fitness: capture IndexedDB/OPFS/SQLite-WASM day-offline
  fitness (quota, eviction, query, crash safety) to settle the m1 PWA-shell
  question. **V10** photo/S3 tier: capture MinIO license/embedding terms,
  Garage↔MinIO migration/versioning/backup mechanics, EXIF/GPS strip tooling,
  and one candidate's upload-queue implementation; verify or drop
  `$filesystem.s3`. **V11** sync-engine depth: capture Sync Streams semantics
  + PowerSync offline writes + conflict behaviour + self-host config; Electric
  offline writes + conflicts; Automerge sync-server/auth/ops; explicit RxDB
  offline-write excerpt. **V12** ODK ops: capture Central self-host
  install/Compose/Postgres resource floors and backup/restore to ground D1's
  ops leg.

Expected per-candidate results (pre-declared, M5):

| Check | A (ODK) | B (custom+PB) | C-RxDB | C-PowerSync | C-Electric/Automerge |
|---|---|---|---|---|---|
| V1 day-offline | pass expected | unknown until queue built | pass expected after V11 | unknown until V11 | unknown until V11 |
| V2 photo audit | pass iff Central export preserves linkage (verify) | fail until queue built | pass expected | unknown until V11 | unknown until V11 |
| V3 conflict drill | depends on Central review-queue reality (verify) | FAIL expected until MVCC-or-equiv built | pass expected | unknown until V11 | unknown until V11 |
| V4 sharing matrix | fail iff per-property required | pass expected (row rules) | pass expected (buckets/stores) | pass expected after V11 | unknown until V11 |
| V5 granularity spike | decisive for A | n/a | n/a | n/a | n/a |
| V6 accessibility | platform arm TBD | full WAI arm | full WAI arm | full WAI arm | full WAI arm |
| V7 deploy/restore | leg 1 after V12; legs 2–3 after V10 | leg 1 expected; legs 2–3 after V10 | same as B | same as B | same as B |
| V8 upgrade rehearsal | Central track TBD | PocketBase track (E2) | engine track TBD | engine track TBD | engine track TBD |

## 8. Evidence pointer and honesty boundaries

Discovery (frozen before reveal) holds the full pre-reveal O1–O6
investigation; the draft restates conclusions per P clause; the critique
adjudicates every claim against capture bytes; this final supersedes the draft
with the §0 repairs. Claim → source map: P1 → S04, S07, S13 (+V9 gap);
P2 → S01, S07 (not S02/S14/S15); P3 → S07, S11 (+V10 gaps); P4 → S09, S12,
S01; P5 → S02, S03, S05, S06; P6 → S10, S02, S07; C1 → S01; C2, C3 → S03,
S04; C4 → S07; C5 → S02 (+V11 gap); C6 → S05, S06; C7 → S08, S13; C8 → S09,
S12; C9 → S11 (+V10 gaps); E1 → S02; E2 → S10; E3 → S07. Source IDs are
locators; every load-bearing conclusion above is stated in its own prose.

No runtime, device, account, or witness execution was available or used in any
stage. Behavioural claims about unobserved systems are proposals (§7), not
results. New-capture decision: none taken in this stage; all gaps carry
scheduled probes V9–V12. Usage/billing telemetry: unobserved (null) for all
sources.
