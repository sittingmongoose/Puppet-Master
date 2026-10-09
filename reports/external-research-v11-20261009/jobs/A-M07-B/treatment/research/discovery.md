# Discovery — S01 field-inspections (A-M07-B treatment/research, M07 v1 evidence-on-demand)

Scope: offline field-inspection app for a small housing nonprofit. Twelve inspectors capture
forms, photos and location on Android, often with no service for a day; an office coordinator
reviews corrections. Deployments must stay simple; export/migration without vendor lock-in.
Investigate: practical sync and conflict handling, accessible form design, photo storage,
selective sharing, and a future small self-hosted deployment.

Method note: this discovery was written from the brief alone, before plan reveal. All source
IDs (S01–S15) are immutable captures pinned by exact bytes and SHA-256 in `source-map.json`
and `sources/`. Reviewers retrieve governing context on demand from the captures; excerpts
below are pointers, not substitutes.

## O1 — Unfamiliar tools, products and materially different approaches

### Sync engines (beyond "upload when online")

1. **PowerSync — Postgres-backed partial-sync engine with per-client buckets (S02).**
   Sync Rules define bucket definitions: a name, optional parameter queries (auth/client/table
   values, e.g. `request.user_id()`), and data queries filtering rows per bucket (e.g.
   `WHERE owner_id = bucket.user_id`). Only relevant buckets sync to each client. Materially
   different from "sync whole tables": sync scope is a server-side query, so selective sharing
   falls out of the same mechanism. Caveat with teeth: Sync Rules are now **legacy/deprecated**
   in favour of Sync Streams (same capture); any adoption must target Sync Streams, not the
   YAML documented here (see O3).
2. **Electric — Postgres sync over HTTP with Shapes (S15).** Syncs data out of Postgres into
   local clients over HTTP using "Shapes" (filtered subsets). Different philosophy from
   PowerSync buckets: shape-based subscriptions rather than bucket definitions. Relevant as a
   second Postgres-centred option; needs deeper evaluation of its offline-write story before it
   could carry the day-long-offline requirement.
3. **Automerge — CRDT sync engine for offline-first multiplayer apps (S14).** Network-agnostic,
   merge-based: concurrent edits converge without a central arbiter. Materially different from
   last-writer-wins or manual conflict queues: conflicts are structurally prevented for many
   edit patterns rather than detected and repaired. Best fit would be small structured records
   (checklist state, annotations); a poor fit for large photo blobs, which should stay
   content-addressed objects outside the CRDT document (blobs-by-reference pattern).
4. **RxDB with CouchDB replication plugin (S07).** Offline-first reactive client store with a
   sync engine and ready-made replications (CouchDB, GraphQL, HTTP, WebSocket, WebRTC, NATS,
   Firestore, Supabase). The CouchDB plugin deliberately does **not** speak the official
   CouchDB replication protocol (too chatty for clients, forces full revision trees on-device);
   it uses RxDB's checkpoint-based sync against a CouchDB endpoint instead. Consequence: faster
   initial replication and only newest revisions stored locally, at the cost of protocol
   incompatibility (see O2 limits).
5. **CouchDB/PouchDB-style MVCC replication (S01).** The classical approach: multi-version
   documents, push/pull over HTTP, both conflicting revisions preserved on all replicas, one
   deterministically-chosen winner presented. Still the clearest mental model for "a day
   offline, then merge", and the conflict-visibility semantics (`_conflicts`, winner-only views)
   directly inform the coordinator's correction-review UX.

### Backends and self-hosting

6. **PocketBase — single-binary backend: embedded SQLite + auth + files + admin UI + REST
   (S04).** ~12 MB zips per platform (v0.40.5 captured), started with `./pocketbase serve`.
   Access control is five per-collection API rules that double as record filters (S03). For a
   nonprofit that needs "simple deployments", one binary plus one data directory (`pb_data/`)
   is the simplest credible server shape found. Pre-v1 caveat is explicit upstream: backward
   compatibility not guaranteed before v1.0.0; production use requires reading the changelog
   and applying manual migrations (S04).
7. **Garage — self-hosted S3 object store built to run outside datacenters (S11).**
   S3-compatible storage for photos that the nonprofit can run on modest hardware. Pairs with
   any backend via the S3 API, which is itself the anti-lock-in mechanism: anything speaking S3
   can migrate between Garage, MinIO, or a cloud provider. (MinIO was also surveyed via
   secondary reports only: single Go binary, S3-compatible, AGPL-licensed core with commercial
   licensing for embedded/ISV use. **Not verified against a primary capture in this pass;**
   treat as a lead requiring confirmation before any recommendation.)
8. **ODK Central + ODK Collect — the domain-standard offline data-collection stack
   (S05, S06, S08, S13).** Not unfamiliar to the sector, but included because it is the
   materially different *product* approach: adopt a mature humanitarian data-collection system
   instead of building an app. Central distinguishes **Web Users** (global management accounts)
   from **App Users** (per-project device credentials); per-form access is granted per App User
   at project level (S05, S06). Collect is Android-native, offline-first, downloads blank forms,
   captures location/photos offline, and renders offline map layers from **MBTiles** files
   side-loaded onto the device (S08, S13). Self-hosted via Docker Compose; managed ODK Cloud
   exists as an alternative.

### Forms and accessibility

9. **W3C WAI form patterns as the accessibility contract (S09, S12).** Label every control
   (`<label for>`, including visually-hidden labels where the visual design hides them),
   group related controls, put instructions where they are programmatically associated, validate
   with identified errors and user notifications, and design multi-page (wizard) flows
   deliberately. Applies to any custom web review UI for the coordinator and to any Enketo/Web
   Forms-based browser filling; ODK Collect's native widgets are outside this contract but the
   coordinator console is not.

## O2 — Consequential code/default/limit/applicability behaviour

### C1. CouchDB conflict model (S01): winner is deterministic; loser is hidden, not lost

- Replication is unidirectional push/pull over HTTP; full sync = push then pull (or reverse).
- After conflicting edits replicate, **both revisions exist on both sides**; no record of which
  peer a revision came from.
- Reads and map functions see only the deterministically-chosen winner; the loser sits in
  `_conflicts` until merged by application logic. Views never see conflicting revisions.
- Applicability: the coordinator review queue **is** a conflict-surface UI. Any design that
  shows "the record" without a conflicts indicator will silently present winners and strand
  losers. Validation V3 (below) drills exactly this.

### C2. PocketBase API rules (S03): default locked; rules are filters; status codes leak intent

- Five rules per collection: `listRule`, `viewRule`, `createRule`, `updateRule`, `deleteRule`
  (auth collections add `options.manageRule`). Default is **locked** (`null` = superuser only);
  empty string = public; non-empty string = filter expression (e.g. `status = "active"`).
- Unsatisfied rules return **200 with empty list** (list), **400** (create), **404** (view/
  update/delete), and **403** only when locked and the caller is not a superuser. Superusers
  bypass all rules.
- Applicability: selective sharing ("inspector sees own assignments; coordinator sees all") is
  expressible as rules, but the 404-vs-403 split and filter semantics must be tested per role
  (V4). The "rules are filters" behaviour also means a miswritten listRule silently narrows
  results instead of erroring — a data-loss-shaped bug.

### C3. PocketBase deployment facts and pre-v1 risk (S04, S10)

- v0.40.5 captured; ~11–12 MB per platform; `serve` after unzip; SQLite embedded; realtime
  subscriptions, auth, file storage, admin UI included.
- Upstream states plainly: **not recommended for production-critical apps** before v1.0.0
  without changelog-driven manual migrations.
- Applicability: acceptable for the nonprofit's scale **only** with a rehearsed backup/restore
  and an export path that does not depend on PocketBase internals (SQLite file + S3 photos are
  themselves the export format — a genuine lock-in advantage).

### C4. RxDB CouchDB replication limits (S07)

- Uses `replicateCouchDB({ replicationIdentifier, collection, url, … })`; live or one-shot.
- Hard limits captured: **no attachment replication** through this plugin, and at most
  **6 collections in parallel** (documented workaround exists on the same page).
- Does not store full revision trees on the client (newest versions only) — good for
  day-long-offline storage budgets, but means on-device conflict archaeology is unavailable;
  conflicts are handled during replication instead.
- Applicability: photos must travel out-of-band (S3 upload with retry queue), never as CouchDB
  attachments under this plugin. The 6-collection ceiling shapes schema design (fewer, wider
  collections or staged replication).

### C5. PowerSync bucket model (S02)

- Bucket = name + parameter queries + data queries. Parameters come from JWT auth, client
  parameters, or table values. Clients sync only buckets matching their parameters.
- Applicability: per-inspector assignment scoping and per-property sharing are native concepts.
  But Sync Rules are deprecated: any prototype must be built on **Sync Streams** (JOINs, CTEs,
  subqueries, on-demand sync), and the migration path (`migrate to Sync Streams`, no sync-scope
  change) must be verified, not assumed.

### C6. ODK users and form access (S05, S06)

- Two account types: Web Users (global across all projects on the server) and App Users
  (per-project device credentials).
- Selective sharing primitive: the project's **Form Access** tab lists every form with a
  per-App-User dropdown. Sharing is per-form-per-device-credential, not per-record.
- Applicability: ODK's sharing granularity is coarser than PocketBase row rules or PowerSync
  buckets. If the nonprofit needs per-property visibility (inspector A sees only their
  addresses), ODK needs one project per visibility group or an Entities-based design — a real
  structural cost to verify (V5).

### C7. ODK offline maps (S08): MBTiles side-loaded, Android Collect only in this evidence

- Collect renders any map layer saved as a tile set in **MBTiles** format, selected from the
  device as the offline layer; files reach devices by sharing service, direct send, or
  device-to-device means — there is no captured in-band tile distribution.
- Applicability: location capture works offline (GPS needs no network), but offline *map
  display* needs an MBTiles pipeline (build tiles, distribute ~100s MB, version them). That
  pipeline is part of the deliverable, not an afterthought.

### C8. WAI labelling and validation (S09, S12)

- Every input needs an associated label; hidden-but-present labels (`visuallyhidden`) keep
  screen-reader access when visuals omit them; grouping, instructions, error identification
  and notifications are separate checklist items, as are multi-page forms and custom controls.
- Applicability: the coordinator's correction-review console and any browser form path must
  pass this checklist control-by-control; native Collect widgets inherit platform behaviour
  instead and need a separate (cheaper) pass.

### C9. Photo storage via S3 API (S11 + S04 file handling)

- Garage presents itself as an S3 object store reliable enough to run outside datacenters;
  PocketBase has built-in file handling with S3 bindings in newer releases (secondary report
  of `$filesystem.s3(...)` in JSVM — unverified here, confirm before relying).
- Applicability: store photos as objects keyed by content hash, metadata (owner, inspection,
  consent flags) in the database; never in the database as blobs. Preserve capture-time GPS
  for the inspection record while stripping location from any shared/exported derivative —
  a privacy rule the export drill (V6) must demonstrate, not just assert.

## O3 — Issue/fix/regression/release chains (evidence present)

**E1. PowerSync: Sync Rules → Sync Streams migration (S02, primary, current).**
The captured page is itself the evolution record: Sync Rules labelled "(Legacy)", a deprecation
notice naming Sync Streams as the successor (adds on-demand sync, JOINs, CTEs, subqueries),
continued support for existing instances, new features landing only in Sync Streams, and two
migration routes (dashboard button, `powersync migrate sync-rules` CLI) with the invariant
"migrating does not change what your app syncs". Planning consequence: cost the migration and
verify the invariant; do not greenfield on a deprecated surface.

**E2. PocketBase v0.40.0–v0.40.5 release chain (S10, primary).**
Six releases captured on master, including: Go floor raised to 1.27 with migration to
`encoding/json/v2` plus an explicit backward-compat warning ("do not push blindly to
production; test locally first"); SQLite `modernc.org/sqlite` bumps with `_defensive=1` DSN
default; backup generation changed to stop transaction-locking the database during backup
(referencing discussion #7799). Planning consequence: the pre-v1 warning is live, not boiler-
plate — upgrades are test-first events, and the backup-lock fix is exactly the class of
operational bug a nonprofit deployment would have felt.

**E3. RxDB's deliberate protocol break from CouchDB (S07, primary).**
The plugin page documents *why* it rejects the official CouchDB replication protocol
(client-hostile chattiness: ≥1 HTTP request per document; full revision trees on-device) and
what it trades away (attachments, >6 parallel collections) for faster initial replication and
during-replication conflict handling. Planning consequence: "CouchDB-compatible" is not one
thing — verify wire behaviour per plugin rather than assuming the CouchDB manual applies.

No absent-evidence case needed: three independent chains are captured above. MinIO licensing
remains the one secondary-only claim in this discovery and is flagged as unverified (O1 §7).

## Candidate architectures (carried forward, not decided)

- **A. ODK-native (Collect + Central, self-hosted).** Least custom code; proven offline
  Android capture; MBTiles offline maps; coarse (per-form) sharing; coordinator review in
  Central; export via Central API/Briefcase. Risk: per-property sharing granularity (C6) and
  Central's Docker/Postgres operational weight vs "simple deployments".
- **B. Custom Android (Room/WorkManager-style offline queue) + PocketBase + S3 photos.**
  Finest control and simplest server (one binary + Garage/MinIO); row-level sharing via API
  rules; full ownership of the offline queue, retry, and conflict UX. Risk: custom sync is the
  highest-risk code in the project; pre-v1 backend (C3).
- **C. Custom client on a sync engine (PowerSync/Electric/RxDB) + Postgres + S3.**
  Professional sync semantics without hand-rolled replication; selective sharing native (C5).
  Risk: engine churn (E1), heaviest self-host footprint, most new concepts for a tiny team.

All three keep the same portability spine: open form schema + SQLite/Postgres data + S3-API
photos + documented export. The brief's anti-lock-in clause is satisfied by that spine, not by
any single vendor promise.

## O6 — Validations: executed vs proposed (discriminating)

Executed in this stage (cold captures, exact bytes pinned in `source-map.json`):
- X1. Fetched and pinned 15 primary-source captures (docs pages, changelog, homepages) with
  HTTP 200, byte counts and SHA-256; key claims above cite capture locators. No witness ran;
  no sandbox runtime was available or used; no behavioural probe was executed.

Proposed (each discriminates between candidates or verifies a load-bearing claim):
- V1. **Day-offline field drill.** 12 scripted devices (or 3 real + 9 emulated), airplane mode
  8h, 40 inspections with photos+GPS each; restore connectivity; measure: zero data loss,
  median/p95 sync completion, battery drain, storage headroom. Discriminates A vs B vs C on
  the brief's hardest requirement. Pass bar: 100% records + photos reconciled within 30 min
  of connectivity on office Wi-Fi.
- V2. **Photo pipeline audit.** Capture → hash-keyed S3 object → metadata link → export.
  Verify: bytes identical (SHA-256), EXIF/GPS retained in the record, stripped in shared
  derivatives, and a full export re-imports elsewhere. Falsifies "S3 = portable" if metadata
  links are backend-internal IDs.
- V3. **Conflict drill (C1/E3).** Same inspection edited on two offline devices (coordinator
  correction vs inspector amendment); sync both; require: both revisions preserved, winner
  flagged, loser visible in review UI, merge produces a superseding revision. Fails any design
  showing only "the record".
- V4. **Sharing-matrix probe (C2/C5/C6).** For each role (inspector-own, inspector-other,
  coordinator, ex-inspector): attempt list/view/create/update/delete across collections/forms;
  assert expected allow/deny *and* expected status/body shape (PocketBase 200-empty vs 404 vs
  403). Fails coarse-granularity designs that cannot express per-property visibility.
- V5. **ODK granularity spike (C6).** If candidate A survives: prototype per-property
  visibility with projects-per-group vs Entities; measure admin steps per new property and
  App-User credential rotations. Time-boxed; failure retires A unless the nonprofit accepts
  coarser sharing.
- V6. **Accessibility pass (C8).** Coordinator console: control-by-control WAI checklist
  (labels, grouping, instructions, error identification, notifications, multi-page flow) with a
  screen reader + keyboard-only run. Native Collect path: platform checklist only.
- V7. **Deployment + restore rehearsal.** From bare VM to working system (target: one sitting,
  documented steps); then destroy and restore from backup+export only; then migrate photos to
  a *different* S3 implementation. Fails "simple" claims that need the original author present.
- V8. **Upgrade-rehearsal (E2).** Apply the next PocketBase/engine release to a staging copy
  first; run V1–V4 smoke subset; only then production. Institutionalises the pre-v1 warning.

## Conditions, alternatives and uncertainty retained

- The 12-inspector, day-offline, Android-only shape is load-bearing: iOS support, real-time
  collaboration, or sub-minute sync are out of scope unless the plan says otherwise.
- Photo volume is the capacity unknown: per-photo size policy (cap resolution at capture?
  keep originals?) drives storage sizing and sync-time budgets more than any other variable.
- Location accuracy needs are unstated: GPS-fix quality gates (accuracy threshold, manual
  fallback) differ between "prove I was there" and "map the defect".
- MinIO licensing/embedding terms unverified (O1 §7) — confirm from primary sources before
  choosing between Garage and MinIO.
- Electric's offline-write story and Automerge's operational story (sync server, auth, photo
  handling) were surveyed, not verified — both stay alternatives, not recommendations.
- No runtime, account, or device testing was performed in this stage; every behavioural claim
  about unobserved systems is a proposal above, not a result.

## Source index pointer

`source-map.json` (this directory) pins all 15 captures with URL, bytes, SHA-256, access time
and observed operations; `sources/index.md` is the navigable exact-byte index with per-source
locators for the claims above. Usage/billing telemetry: unobserved (null) for all sources.
