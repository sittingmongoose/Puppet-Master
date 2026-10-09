# Final planning deliverable — S01 field-inspections (A-M07-B control/reviser)

Scope: offline field-inspection app for a small housing nonprofit. Twelve
inspectors capture forms, photos and location on Android devices, often with no
service for a full day; an office coordinator reviews corrections. Deployments
must stay simple; export and migration must avoid vendor lock-in. This final
covers synchronization and conflict handling, accessible form design, photo
storage, selective sharing, and a future small self-hosted deployment. It is
self-contained: every retained finding is stated in full prose, with source
citations supporting — never replacing — the text. Labels used throughout:
(observed) = captured from a fetched primary source; (proposed) = author
policy/design to build; (judgment) = sound-but-unsourced engineering judgment;
(unverified) = vendor-claimed or secondhand, not primary-evidenced;
(uncertain) = open, with decision criteria where the choice is load-bearing.

Recommended direction: ODK Collect + ODK Central + XLSForm + Entities first,
because it is the only option that delivers offline forms, photo/GPS widgets,
review states, user/project roles and standard exports as one tested,
self-hostable whole (observed: ODK homepage loop, Central install/manage nav,
Entities layer, offline-maps/QR/adb provisioning). Build a custom app only if a
concrete trigger is met (non-form capture flow XLSForm cannot express; custom
conflict UI beyond a review queue; app-store distribution need); then pair a
Kotlin client (SQLite outbox) with PowerSync or CouchDB/PouchDB sync, photo
bytes in purpose-built storage, and PocketBase (or equivalent) as the small
self-hosted backend. A managed start (ODK Cloud / PowerSync Cloud) with a
later self-host migration is a legitimate simplicity-first alternative, carried
as an open decision with lock-in criteria because managed export/migration
parity is unobserved. Never ship PWA+localStorage as the inspector
offline-record store, whole-document last-write-wins, URL-only photos, deferred
access control as a silent default, or toggle-only testing as specified in the
thin plan. The PWA rejection is scoped to the inspector offline-record store;
a PWA remains acceptable as the coordinator's online review companion.

## 1. Per-P disposition (exact thin-plan clauses; O4)

Thin plan (revealed after discovery freeze, quoted exactly):
"P1: Use a PWA and browser local storage for all offline records. P2: Upload
complete inspection JSON on reconnect with last-write-wins. P3: Store photo
URLs in each form. P4: Add coordinator review and CSV export. P5: Defer access
control beyond individual sign-in until rollout. P6: Test by toggling network
off and on."

### P1 — "Use a PWA and browser local storage for all offline records." → CORRECTION

Reject PWA + browser local storage as the offline records store (judgment, with
one sourced leg and one unsourced leg — see below). Browser localStorage
(~5 MB, synchronous, evictable, no indexing, no background sync) cannot hold a
day of inspections with photos on 12 devices (judgment: standard browser
knowledge, no platform source fetched in any stage). The comparative claim that
even an IndexedDB-backed PWA with service workers is weaker than native for
camera/GPS capture, large outboxes, background upload under Android battery
optimization, and managed deployment is plausible engineering judgment, NOT a
sourced finding: zero fetched sources in any stage cover Android, PWA,
IndexedDB, service-worker, Room, or WorkManager behavior. The correction
therefore stands on one sourced leg (server/sync docs show what the native
paths provide) and one explicitly unsourced leg (client-platform comparison),
and a first future fetch should be one Android offline-persistence /
background-work source to close it.

Correction: capture on native Android — ODK Collect (preferred; observed
offline-first queue with auto-send on connectivity, photo/GPS/skip-logic
forms, offline maps, QR/adb provisioning) or a custom Kotlin app writing
instantly to on-device SQLite with an ordered, durable outbox (PowerSync
upload queue — observed; or PouchDB/CouchDB replication — observed; or a Room
outbox drained by WorkManager — proposed, unsourced mechanism). Background
upload reliability under Android doze/vendor battery policies is THE
load-bearing risk of the custom path and is unmeasured (uncertain). Retain the
PWA only as the coordinator's online review companion, where the W3C
accessible-forms checklist governs it (observed: tutorial scope). The
offline-record intent is thus already-covered in intent but the primary label
is CORRECTION (mechanism corrected).

### P2 — "Upload complete inspection JSON on reconnect with last-write-wins." → CORRECTION

Retain "queue offline, upload on reconnect". Reject whole-document
last-write-wins: a late pocket-edit or a second device's stale copy would
silently overwrite a coordinator approval or a colleague's corrections, and a
delete-then-edit race has no safe whole-doc answer. The corrected design is
engine-scoped below — the predecessor's single five-rule list wrongly blended
two engines' semantics, so each rule now names its engine.

PowerSync branch (custom app + PowerSync; observed client op model,
proposed policy for the rest). The client writes to local SQLite instantly and
queues ordered operations: PUT carries every non-null column for create or
replace, PATCH carries the row id plus changed columns only, DELETE carries
the id only (observed). The backend must apply operations idempotently because
the same operation may arrive twice, deduplicating by per-client incrementing
operation id or by idempotent application (observed). The naive-backend
defaults — per-field last-write-wins and deletes-always-win with later updates
to a deleted row ignored — are the documented *simplest-backend* behavior plus
a typical-implementation recommendation (observed), with custom resolution as
the documented escape hatch (observed). These defaults are the HAZARD, not the
design: a team shipping the naive backend gets silent delete-wins-everywhere,
the exact failure warned about. The design is therefore a custom connector
policy to BUILD (proposed): scoped deletes-win only where the product intends
deletion to be final; review states advancing monotonically (submitted →
in-review → approved/changes-requested; an approved record rejects further
inspector edits except as new correction events); genuine conflicts
(same-field races, approve/edit races, delete/edit races) routed to a
human-review dead-letter queue the coordinator adjudicates, with an audit
trail. The dead-letter pattern and monotonic-transition examples (e.g. an order
that locks once completed) are PowerSync-docs-grounded (observed, with the
caveat that the custom-resolution capture was truncated, so secondary field
optionality is less certain); the inspection state machine itself is pure
proposed app policy, not platform behavior.

CouchDB/PouchDB branch (custom app + CouchDB sync; observed conflict model,
proposed review UX). Writes against a stale revision fail immediately with 409
conflict on every revision-taking API, so the app must always handle 409s
(observed). Offline peers that commit concurrently keep BOTH leaf revisions on
every node after replication, and every node picks the same winner through an
arbitrary-but-deterministic algorithm with no coordination (observed). The
winner is NOT last-write-wins — it is arbitrary-but-deterministic — and reads
and views see only the winner while losers hide (not lost) until merged into a
new winning revision (observed). Replication is incremental and one-way over
HTTP (push then pull for full sync), copying only the last revision plus
deletion tombstones, keeping no record of which peer a revision came from
(observed). The app shape follows (proposed on observed primitives):
document-per-entity (inspection, photo-metadata, comment) to minimize
contention; immutable event documents for corrections and status changes over
edits to living documents; delta-shaped retried writes (upsert deltas,
put-if-not-exists) for flags and counters; and a coordinator merge/review UI
that surfaces hidden losing revisions as first-class work, never as logs.

ODK branch. ODK's submission queue with automatic send on connectivity plus
Entities for updatable longitudinal records (property → visits → corrections)
carries the sync design (observed at page/nav level). No ODK review-state
machine, permission matrix, entity concurrent-edit semantics, or conflict
behavior was captured in any stage (uncertain): any ODK-branch review workflow
is proposed policy on an observed platform skeleton.

Under all branches, coordinator decisions are final and auditable; no silent
auto-merge governs approvals (proposed, load-bearing).

### P3 — "Store photo URLs in each form." → CORRECTION (half already-covered in content)

Retain the URL-in-the-record half: every photo needs a metadata row synced
with the form. An illustrative row shape is inspection id, capture time, GPS,
content hash, uploader, and review state (proposed illustration, not a
platform requirement: no source governs the hash or review-state fields; the
hash exists so exports and downloads can be verified by content rather than by
filename). Add the missing bytes half the clause omits, scoped per engine. On
the PowerSync path, never inline full-resolution photo bytes as blobs or
base64 in synced SQLite rows: sync small metadata records through the engine
and keep bytes in purpose-built storage (S3, Supabase Storage, Cloudflare R2
or any S3-compatible provider) with a local queue doing background
upload/download, retry, offline availability and cache cleanup (observed
pattern; the deprecation of the standalone attachment packages in favor of
built-in SDK helpers is the governing evolution chain — see section 3). On the
PocketBase path, the same separation holds: bytes ride file fields served from
local disk now, record JSON stays small (observed defaults below). On the
CouchDB path, attachments are a SUPPORTED mechanism designed to ride
replication — the honest rule there is not "never" but "bound them": cap sizes,
plan compaction, and prefer the metadata + object-store pattern for day-long
photo bursts (observed mechanism, proposed bound).

PocketBase file defaults (observed): add a file field, upload via
multipart/form-data record create/update; files store under a sanitized
original name plus a random suffix of usually 10 characters; every file field
defaults to about 5 MB maximum, adjustable with an explicit performance
warning. Consequence: downscale client-side, set the cap deliberately in each
validation setup, fix the EXIF/GPS preserve-or-strip policy in writing before
pilot data accumulates, and set retention. The local-disk → S3-compatible
offload growth path is vendor-claimed but UNVERIFIED (secondhand
corroboration only, not re-verified on the fetched page): carry it as
"vendor-claimed, unverified" until the settings page is fetched firsthand.

### P4 — "Add coordinator review and CSV export." → ALREADY-COVERED + OPTIONAL ENHANCEMENT

The intent is correct and retained: a coordinator review step and CSV export
are required (already-covered). Enhance to a real review/export subsystem, with
each item labeled observed-capability vs build-work. Observed capabilities:
ODK Central install/manage navigation names users, projects, forms,
submissions, entities, customization, encryption, audit logs, backup, upgrade,
CLI and troubleshooting (observed: nav labels only — no state machine,
permission matrix, key-management, retention, backup procedure, or sizing
behavior captured); the ODK homepage states data can be downloaded or connected
to Excel/Power BI/Python/R (observed: homepage one-liner); the W3C forms
tutorial spans labeling, grouping, instructions, validating, notifications,
multi-page forms and custom controls (observed: index scope only — subpage rule
content never fetched, so polite/assertive live-region requirements are
nav-derived). Build-work (proposed): review states with monotonic transitions
and role separation (inspectors submit and correct; coordinator
approves/requests-changes); encrypted-forms and server audit-log options where
the platform offers them, with key/retention specifics resolved at build time;
a web review UI built to the accessible checklist (visible labels, grouped
controls, instructions, inline + summary validation, live-region
notifications, multi-page progress, custom controls only as a last resort);
conflict surfacing (hidden-revision or dead-letter queues as first-class UI,
not logs). Export/migration without lock-in means CSV plus the full-fidelity
path (proposed runbook on observed primitives): database dump (PostgreSQL for
ODK/PowerSync backends, SQLite file for PocketBase — with a backup-during-write
caveat to resolve for live file copies) + filestore/object-store copy + record
API/OData access, with a documented restore-on-fresh-host runbook and a
fire-drill validation (see V5). A nonprofit reader must not conclude ODK ships
this full subsystem out of the box: the platform provides the skeleton,
observed at nav level; the workflow is build-work.

### P5 — "Defer access control beyond individual sign-in until rollout." → USER DECISION (recommendation: do not defer)

The naive reading — defer scoping silently until rollout — is rejected as the
default; deferral is valid only as an explicit, dated, risk-accepted user
decision. Primary label USER DECISION (relabeled from the predecessor's
internally inconsistent "rejected (user decision only...)": under the brief's
O4 taxonomy the six dispositions are distinct, and a clause that becomes valid
under stated conditions is a user decision with a recommended default, not a
rejection). Substance, retained: selective sharing is a brief requirement, and
per-user visibility is load-bearing in every sync design — PowerSync sync
rules/streams partition rows per user (observed: overview one-liner; no rule
syntax captured), CouchDB uses filtered/selector replication (observed:
replicator selector mention; no selector semantics captured), ODK Central
scopes by users/projects/forms (observed: nav labels; no permission matrix
captured), PocketBase enforces per-collection API rules (judgment: asserted in
discovery, not shown in the captured file-docs excerpt). The retrofit cost
(re-syncing every device, re-cutting every rule, risking a leak window) is
sound-but-unsourced engineering judgment: keep the recommendation, do not
present the four mechanisms as equivalently understood. Minimum viable access
control from day one (proposed): individual sign-in, inspector-vs-coordinator
roles, project/case scoping (an inspector's device carries only assigned
cases; the coordinator sees the full queue), and review-state-gated
transitions; sharing a case with a landlord, contractor or auditor is an
explicit grant, not a forwarded export. Deferral conditions, retained
(author's conditions, not brief derivations — the brief never mentions
tenant-data sensitivity): single project, mutually trusted staff, no sensitive
tenant data in scope, and a dated retrofit milestone before any external
sharing. Silence is not consent to defer: the burden is on an explicit
recorded decision.

### P6 — "Test by toggling network off and on." → CORRECTION (retain as smoke only)

Retain the toggle as a smoke pre-check and reject it as the test plan
("toggle-only" is a fair paraphrase of the clause, not a strawman): it cannot
discriminate 24-hour outboxes, same-field races, delete/edit races, photo
backlogs, accessibility, export fidelity, or host survival. Replace with the
validation matrix V1–V6 in section 8: sync soak, conflict matrix, photo
pipeline, accessibility pass, export/migration fire-drill, and small-host
survival. Each names its setup, load, and pass criteria; none has been
executed (no runtime in this stage), and all are proposed, not claimed. The
toggle itself was not executed here either — no runtime was claimed anywhere.

O4 taxonomy accounting. Primary labels: P1 correction, P2 correction, P3
correction, P4 already-covered + optional enhancement, P5 user decision (do
not defer), P6 correction (retain as smoke). No clause is purely rejected:
the rejected elements are the naive mechanisms inside corrections and the
silent-default reading of P5 (localStorage store, whole-doc LWW, URL-only
bytes, toggle-only plan, silent deferral). Uncertain items (managed terms,
photo-store selection, sizing, background-upload reliability) are carried in
section 7 with criteria, never dissolved into findings.

## 2. Retained findings: discoveries and behavior (O1, O2)

Sync and conflict handling. Three viable sync cores, engine-scoped. (a) ODK's
submission queue with automatic send on connectivity plus Entities for
updatable longitudinal records (property → visits → corrections), with review
states and project/user scoping at nav level (observed skeleton; workflow
proposed). (b) PowerSync's client-SQLite + ordered upload queue + developer
connector + source database, with the op model and idempotency contract
observed, the simplest-backend per-field LWW and deletes-always-win observed
as defaults-to-override, and custom policies (sequence/version columns,
business-rule validation, dead-letter human review) as the documented escape
hatch carrying the proposed design (observed primitives; CrudEntry field
optionality less certain — truncated capture — though the escape hatch's
existence is independently confirmed). Source databases span Postgres,
MongoDB, MySQL/SQL-Server in beta and others; client SDKs span JS, React
Native/Expo, Flutter, Kotlin, Swift and others including beta channels
(observed matrix). (c) CouchDB/PouchDB multi-master replication — incremental,
one-way push-then-pull over HTTP copying the last revision plus deletion
tombstones, immediate 409 on stale-revision writes that the app must always
handle, eventual conflicts retaining both leaf revisions with an
arbitrary-but-deterministic same-everywhere winner, reads and views showing
only the winner until merged (all observed). Doc-model guidance under (c),
proposed on observed primitives: document-per-entity, immutable event docs
for corrections/status changes, delta-shaped retried writes for flags and
counters. Under all options, coordinator decisions are final and auditable;
no silent auto-merge governs approvals (proposed).

Accessible form design. On-device, prefer the platform's tested widgets (ODK
Collect/XLSForm question types, skip logic, calculations, translations —
observed feature list); for any custom surface — coordinator review UI at
minimum, custom Android screens if built — apply the checklist the tutorial's
scope defines: label every control (never placeholder-only), group related
controls with legends, write instructions, validate with inline and summary
messages, notify via live regions, split long inspections into pages with
progress, and build custom controls only when native ones cannot serve
(observed: index scope; subpage rule content unfetched — flag before building
pass/fail criteria). Native Android equivalents (content descriptions, focus
order, minimum touch targets, TalkBack pass) apply on-device (judgment:
no Android source fetched).

Photo storage. Metadata rows sync; bytes live in a file/object store on the
PowerSync and PocketBase paths; a local queue bridges offline gaps with
background upload, retry, offline availability and cache cleanup (observed
pattern). ODK bakes photo carriage into submissions (observed feature);
PocketBase gives the small team local-filesystem-now with a vendor-claimed
(unverified) S3-later behind one record API (observed: ~5 MB default,
sanitized name + random suffix, multipart upload); PowerSync-style
attachments generalize the pattern to any S3-compatible provider with explicit
queue states (queued/uploaded/downloaded) and per-SDK minimum versions, on
built-in helpers in alpha (observed list + alpha status — the pipeline's
newest, least-stable dependency and therefore its likeliest regression
surface). On the CouchDB path, attachments riding replication are supported
with size/compaction bounds (observed mechanism, proposed bound). Bound the
synced database, downscale client-side, set retention, and fix the EXIF/GPS
policy in writing (proposed).

Selective sharing. Scope is part of sync design, not a later filter:
per-user sync partitions, filtered replication selectors, project/user roles,
or collection API rules (observed one-liners/nav, unevenly understood — see
P5), plus role-gated review transitions (proposed). An inspector's device
carries only assigned cases; the coordinator sees the full queue; external
sharing is an explicit grant, not a forwarded export (proposed).

Small self-hosted deployment. Two honest footprints. ODK Central as a
multi-container compose stack (app, web, PostgreSQL, web-forms renderer, form
toolchain — install shape observed) on a small VPS with TLS, backups, and
upgrade discipline (proposed operations; sizing and cadence unobserved). Or
PocketBase as a single portable executable (embedded SQLite + auth + files +
realtime + dashboard; downloads around 11–12 MB per platform/architecture at
observed v0.40.5 page chrome) deployed by copying the executable plus
migrations and running one serve command with automatic TLS, optionally under
systemd with a restart policy (observed runbook: rsync flow, serve-with-domain
TLS, setcap for non-root low-port binding, systemd unit with restart-always).
A custom PowerSync backend sits above either data tier and adds its service
plus source database (observed architecture). All three export without
lock-in: database dump + filestore copy + open API (proposed runbook on
observed primitives). PocketBase's governing caveat is pre-1.0 status: full
backward compatibility is not guaranteed before v1.0.0 and the project states
it is NOT recommended for production-critical applications unless the operator
reads the changelog and applies manual migration steps (observed verbatim).
Pinning a version delays migration churn but accumulates unpatched-bug
exposure — state the trade-off plainly (judgment on observed warning):
pre-1.0 is acceptable only with a pinned version, a tested upgrade runbook,
backups proven by restore drill, and eyes open about the pin-vs-patch tension.
(No license claim is made for any component: none was sourced from a license
file. No VPS price is quoted: pricing is unsourced and stale-prone.)

Managed-start alternative (open decision, terms uncertain). The brief asks for
simplicity now and self-hosting later, so managed-now/migrate-later may
dominate self-host-day-one on simplicity. ODK Cloud (official managed hosting
from ODK's creators — observed banner on ODK docs) and PowerSync Cloud (named
in the decision list; terms unobserved) are the brief-direct candidates.
Comparison must run on simplicity + export/migration parity + lock-in: does
managed ODK Cloud export as cleanly as self-hosted Central (database + files
+ API)? What is the managed → self-hosted migration procedure, and is it
drilled before data accumulates? Cost and terms are unobserved — carry as
explicit uncertainty with these criteria, never as a finding. Largest prior
discovery omission, now promoted from gap to decision.

## 3. Release and evolution evidence (O3)

E1 — PowerSync attachments deprecation → built-in helpers (observed evolution
chain, satisfies O3 alone). The standalone packages for JS and Flutter are
deprecated; attachment functionality is now built into the SDKs with migration
notes, alpha status, and per-SDK minimum versions (observed verbatim +
version list). Consequence: any tutorial using the old packages is stale; pin
to the built-in-helper minima and test the queued → uploaded → downloaded
lifecycle under V3 load, treating the alpha helpers as the likeliest
regression surface (proposed framing of observed status).

E2 — PocketBase pre-1.0 compatibility process (observed release-process
evidence). Docs warn full backward compatibility is not guaranteed before
v1.0.0 with manual migration steps governed by the changelog (observed
verbatim); the changelog file's existence on the master branch is confirmed
but its rows were not quotable from a chrome-dominated capture and no commit
was pinned (observed process, unquoted content, drift explicit). Observed
release marker: v0.40.5 download matrix (observed page chrome). Type:
release-process evidence; no specific regression claimed.

E3 — PouchDB/CouchDB conflict-model stability (observed markers, honestly
thin). A v9.0.0 download marker appears in the PouchDB guide's site chrome
(observed chrome, correctly flagged as chrome — not a version stamp on the
guide text); CouchDB stable-channel docs govern the replication/conflict
semantics (observed). No specific issue/fix quoted; the finding is the
model's stability (deterministic winner, both revisions retained).

Absent/inapplicable (honest): no CVE, crash regression, or version-pinned bug
with fix commit is claimed for any of the above; MinIO/Garage server-side
photo-store behavior was not primary-sourced (redirect chain unusable) and is
recorded as unobserved rather than invented. A demand for a second
commit-pinned chain would be invalid: the window is finite, E1 satisfies the
"at least one chain" bar, and absence is honestly declared.

## 4. Conditions

- ODK-first holds while XLSForm expresses the inspections; a concrete trigger
  flips the choice to custom Kotlin + PowerSync or CouchDB sync: a non-form
  capture flow, a custom conflict UI beyond a review queue, or an app-store
  distribution need (proposed triggers, replacing the vague "hard custom-UX
  requirement").
- The PowerSync naive defaults (per-field LWW, deletes-always-win) hold only
  until the custom connector policy replaces them; approvals and deletion of
  approved records always require coordinator authority and an audit entry
  (proposed; resolves the defaults-vs-design tension in favor of
  defaults = hazard, custom policy = design).
- On the CouchDB path, the deterministic winner governs reads until the
  coordinator merge UI adjudicates hidden revisions (observed mechanism,
  proposed workflow).
- Photo pipeline choices (local vs object store, size caps, retention,
  EXIF/GPS handling) are fixed before pilot data accumulates, not after
  (proposed).
- Access-control deferral is permitted only as an explicit, dated,
  risk-accepted user decision (see P5); otherwise scoping ships with the
  pilot (proposed).
- Pre-1.0 components (PocketBase) are acceptable only with a pinned version,
  a tested upgrade runbook, backups proven by restore drill, and an explicit
  pin-vs-patch trade-off note (proposed on observed warning).
- Attachment-helper alpha status (PowerSync path) is acceptable only with
  pinned SDK minima and V3 load coverage (proposed on observed status).

## 5. Alternatives retained

(a) ODK all-in: fastest fit, least code, compose-scale hosting, standard
exports (observed skeleton). (b) Custom Kotlin + PowerSync + Postgres +
S3-compatible photos: maximum app freedom, real sync engine; owns backend,
conflict policy, storage provider, form UI, and the alpha-helper risk
(observed engine, proposed policy). (c) Custom app + CouchDB/PouchDB filtered
replication + review queue: explicit multi-master merge with coordinator
adjudication; heavier modeling (doc boundaries, merge UX) and hosting than
PocketBase, scoped here to the single-node shape the brief needs
(observed model, proposed UX). (d) PocketBase + hand-rolled Android outbox:
cheapest backend, weakest sync (custom queue, custom conflicts) — costed
honestly as a client sync-layer REWRITE to reach (a), (b) or (c) (new op
model, new conflict UX, data migration), not an upgrade; acceptable only as a
prototype with unmigrated data discarded, or with a dated, costed rewrite
milestone (proposed costing). (e) Managed start (ODK Cloud / PowerSync
Cloud) with a later self-host migration: potentially simplest now; carried
as an open decision with export-parity and lock-in criteria because managed
terms are unobserved (uncertain). Photo bytes always leave the synced rows
on paths (a), (b), (d), (e-ODK/PowerSync); on path (c) attachments are
supported within stated bounds. Correctly deprioritized and NOT carried:
QField/Mapeo (map-first, poor fit for form-first), Electric variants
(covered conceptually by the PowerSync/CouchDB analysis),
single-node k3s/Coolify-style targets (operational overkill for 12+1 users).

## 6. Optional capabilities and user decisions

Optional: offline map tiles for navigation without service (observed ODK
support); encrypted forms at rest/in review (observed: nav-level option —
key/retention specifics unresolved); push or digest notifications for
correction requests; bulk import of property rosters via Entities/datasets
(observed: Entities layer); multi-language forms (observed: ODK feature);
auditor read-only seats (proposed role). Decisions the nonprofit must make:
ODK vs custom app (decide by the section-4 triggers); managed hosting vs
self-hosted VPS vs on-premise closet server (decide by simplicity +
export-parity + lock-in criteria — managed terms uncertain); S3-compatible
photo-store selection for any self-hosted path — single-binary MinIO/Garage
on the same VPS vs hosted R2/Supabase (open decision with criteria:
single-binary operation, same-VPS sizing, backup story, cost — all
unobserved, never "any" as a finding); photo retention period and
tenant-privacy/EXIF policy (correctly unresolved — needs a policy owner, not
a platform doc); device ownership and provisioning — QR/adb flows observed at
nav level, adequate pointer at this stage, procedure at build time (observed
pointer); whether access-control deferral risk is accepted (P5 — explicit
record or not at all); pilot property count and success criteria (needs a
workflow interview, including coordinator throughput and correction
taxonomy — uncertain).

## 7. Uncertainty

Unmeasured or unobserved in every stage so far: ODK Central sizing and
upgrade cadence for this load; ODK review-state/permission/backup-procedure
behavior beyond nav labels; PowerSync self-host vs Cloud operations and cost
for a nonprofit; managed-hosting export/migration parity and terms (ODK
Cloud, PowerSync Cloud); PocketBase SQLite ceiling under photo-metadata load
(expected fine for 12+1 users, unmeasured); PocketBase S3-offload setting
(vendor-claimed, unverified); Android background-upload reliability under
doze/vendor battery policies and all client-platform comparisons (symmetric
gap in research, critic, and this revision — no Android source fetched
anywhere); PowerSync custom-resolution secondary field optionality
(truncated capture); W3C subpage rule content (index only); KoboToolbox,
QField/Mapeo, Electric-sync variants, single-node k3s/Coolify-style targets,
and MinIO/Garage server behavior (not primary-sourced — recorded as gaps,
not findings); exact coordinator throughput and correction taxonomy (needs a
workflow interview). The reviser conducted no extra broad discovery: every
consequential criticism below was resolvable within the already-captured
own-arm evidence by scoping, labeling, or parametrize-and-carry, so no new
fetch was necessary in this window; the prioritized fetch list is carried in
section 8 (proposed checks).

## 8. Validations: executed vs proposed (O6)

Executed across research + critic + this revision (no runtime, no sandbox, no
accounts changed): compared official documentation for ODK (home, Central
install, Entities, offline maps), PowerSync (overview, update conflicts,
custom resolution, attachments), PocketBase (intro v0.40.5 page chrome,
files, production, changelog process), PouchDB conflicts (v9.0.0 site
chrome), CouchDB replication/conflict model (stable channel), and the W3C
accessible-forms tutorial index; captured bounded excerpts with per-source
URLs, versions, locators, access timestamps and observed operations, plus
navigable indexes. The critic independently re-fetched 8 governing sources:
5 matched predecessor byte sizes exactly, 1 drifted 12 bytes (mutable docs),
1 differed by transfer encoding only — and every re-fetched verbatim claim
was confirmed accurate. This reviser independently re-read the complete
draft, discovery, both source maps, all 23 captured excerpts, the critique,
the brief and the revealed plan, and verified each criticism's grounding
before adjudicating (section 9). No code ran; no containers started; no
network toggle was performed anywhere — P6's smoke step is not claimed as
executed. No witness was executed at any stage (no qualified sandbox was
available); the checks below are proposed honestly.

Proposed discriminating validations (require a sandbox and devices; not run):

V1 sync soak — 2 devices offline 24 h, 50 mixed create/patch/delete ops each
plus photo metadata, then reconnect; pass = no silent loss, all conflicts in
the review queue, deletes-win only where the custom policy intends (PowerSync
branch) or deterministic-winner + surfaced losers (CouchDB branch).

V2 conflict matrix — same-field patch/patch, patch/delete, delete/delete
(expected: idempotent application absorbs the redundant delete),
approve/edit race, and offline-edit-after-approval (the core threat to
monotonicity); pass = coordinator decision final and auditable in every
cell, with the expected per-cell behavior written before the run.

V3 photo pipeline — 200 photos through outbox → upload → metadata sync →
download, with the load parameterized to the configured cap: either raise
the file-field cap to ≥8 MB in setup and run 3–8 MB, or run 3–5 MB within
the evidenced ~5 MB default plus an explicit over-cap rejection case; pass =
bounded DB size, resumable retry, EXIF/GPS policy provably honored, and the
alpha attachment helpers (PowerSync path) exercised across
queued → uploaded → downloaded.

V4 accessibility — coordinator flow against the W3C checklist (labels,
grouping, instructions, inline + summary validation, notifications,
multi-page progress; subpage rules fetched first so criteria are
rule-evidenced, not nav-derived) plus a named Android pass on custom
screens: content descriptions present, focus order sane, minimum touch
targets met, TalkBack traversal completed with a written script (procedure
to be named against the Android source once fetched — currently judgment).

V5 export/migration fire-drill — dump + filestore copy → restore on a fresh
host; pass = SEMANTIC identity (same records, same photo bytes verifiable by
content hash, working review history, documented runbook), not byte identity:
CSV row ordering, timestamp formatting and random filename suffixes may
legitimately differ across runs. The comparison procedure (record diff,
hash-verified photo bytes, history spot-check) is part of the validation.

V6 small-host survival — run PER FOOTPRINT, not as one blended check: (V6a)
ODK compose stack on a single VPS with TLS, backup/restore, one minor
upgrade; (V6b) PocketBase single binary with TLS, systemd restart policy,
backup/restore, one minor upgrade across the pre-1.0 changelog with manual
steps. Pass per footprint = runbook steps executed, rollback proven,
downtime window stated.

Proposed mechanical checks (carried from the critique, not executed):
byte-compare re-fetch of each source URL against captured sizes to detect
drift before reliance; V3-setup consistency (every photo-size figure must
satisfy ≤ configured cap); disposition-label lint (exactly one primary
label per P clause from the six-way taxonomy); engine-scope lint (every
LWW/deletes-win/deterministic-winner/409 sentence names its engine in the
same paragraph); observed-vs-built lint (every platform-capability sentence
carries its grounding tag). Prioritized future fetches: (1) Android
background-work/offline doc; (2) W3C Validating + Notifications subpages;
(3) ODK review-state/role docs or a verified "not publicly documented" note;
(4) PocketBase S3 settings page; (5) ODK Cloud + PowerSync Cloud
export/lock-in terms.

## 9. Criticism adjudication log

Every material finding (M1–M9), minor finding (m1–m13), and uncertainty /
invalid-demand admission (U1–U4) from the critique is adjudicated below on
the evidence, not by automatic obedience. Verdicts: ACCEPT (critic right,
applied), AMEND (critic right with a correction applied), REJECT (critic
wrong, with evidence reason), UNCERTAIN (carried open with criteria).
No finding alleged fabricated evidence — the critique confirms every
re-fetched verbatim claim accurate — and this reviser concurs: the dispute
is scope, labeling, and defaults-vs-policy throughout.

M1 (P1 mechanism overstated) — ACCEPT. Independently verified: the
predecessor's 15 sources cover ODK, PowerSync, PocketBase, PouchDB, CouchDB
and W3C only — zero client-platform sources — so the IndexedDB/PWA-vs-native
comparison, the Room/WorkManager path, and the battery-optimization hazard
are unsourced. Applied: P1 now marks the client-platform leg explicitly
unsourced judgment, narrows "never ship PWA" to the inspector offline-record
store (the coordinator-PWA concession is retained), and names background
upload as the load-bearing unmeasured risk with an Android fetch first in
the queue. Outcome (native capture) unchanged.

M2 (P2 rules conflate defaults with universal law) — ACCEPT. Independently
verified against the captured excerpts: per-field LWW and deletes-always-win
are documented as simplest-backend behavior plus typical implementation with
custom resolution as the escape hatch, so scoped deletes-win REQUIRES the
custom connector; the CouchDB winner is arbitrary-but-deterministic, not
per-field LWW; CouchDB replicates whole-document last revisions while rule 1
is PowerSync-shaped; the review-state machine and dead-letter routing are
proposed policy (dead-letter grounded on the PowerSync path only, with the
truncation caveat). Applied: P2 and section 2 are split per engine with
observed-vs-proposed labels throughout. Sharpest technical finding, fully
endorsed. Correction stands.

M3 (P3 universal bytes rule contradicted by CouchDB path) — ACCEPT with
AMENDMENT. Verified: the attachments pattern's "not recommended" scope is
PowerSync/SQLite rows, while CouchDB attachments are designed to ride
replication — the universal NEVER was over-broad. Applied: per-engine bytes
rules. Amendment applied to the critic's framing (not its substance): the
metadata-row shape is now explicitly an illustrative proposal with the hash
purpose stated (content verification across exports/downloads), which
answers "elaborate or mark illustrative" by doing both. PocketBase S3
cutover downgraded to vendor-claimed, unverified, as demanded. Correction
stands.

M4 (P4 stacks nav-level evidence into behavior claims) — ACCEPT.
Independently verified: review/permission/encryption/audit/backup claims
rest on Central install-page navigation labels; OData/export rests on a
homepage one-liner; no dump/restore procedure or live-copy caveat was
captured; conflict-surfacing UI is requirement-as-design; accessibility
detail is index-level. Applied: P4 labels every item observed-capability vs
build-work, adds the backup-during-write caveat as an open build-time item,
and warns the nonprofit reader against out-of-the-box assumptions. No new
sources needed — labeling only, as the critic allowed. Disposition stands.

M5 (P5 label contradicts escape hatch; retrofit costs unsourced) — ACCEPT
(both halves). (a) Verified against the brief's O4 taxonomy: six distinct
dispositions, so a clause valid under stated conditions is a USER DECISION
with a recommended default. Applied: P5 relabeled, with the silent-default
reading explicitly rejected inside the user-decision framing. Closest thing
to a false disposition in the draft; labeling error, not direction error —
concur. (b) Verified: scoping mechanics are overview/nav one-liners with no
rule syntax, selector semantics, permission matrix, or migration behavior
captured. Applied: retrofit cost marked sound-but-unsourced judgment;
mechanisms not presented as equivalently understood. Four deferral
conditions and silence-≠-consent retained.

M6 (V-matrix gaps) — ACCEPT (all three). (a) Verified arithmetic: 8 MB
exceeds the evidenced ~5 MB default with no cap change stated — genuine
defect. Applied: V3 parameterized (raise cap in setup OR run within default
plus an over-cap case). (b) Verified: random filename suffixes plus CSV
ordering/timestamp formatting make byte-identity capable of failing a
correct system. Applied: V5 restated as semantic identity with a comparison
procedure. (c) Verified gaps: V2 now covers delete/delete (grounded in the
idempotency contract; the exact ignore-DELETE-of-missing-row line is
discovery-level rather than verbatim in the captured excerpt, so the cell's
expected behavior is written as idempotent absorption), offline-edit-after-
approval, and per-cell expectations; V6 split per footprint (compose vs
binary+systemd); V4 given a named-procedure requirement with the Android
source flagged as the missing input. Correction stands.

M7 (omitted brief-direct alternatives) — ACCEPT (both). (a) Verified: ODK
Cloud banner observed on ODK docs, PowerSync Cloud named but uncompared,
brief's simplicity + anti-lock-in constraints unaddressed for managed paths.
Applied: managed-start alternative (e) added with simplicity + export-parity
+ lock-in criteria; managed terms carried uncertain, specifics not filled.
Largest discovery omission — concur. (b) Verified: "any S3-compatible" is
not a self-host photo decision. Applied: photo-store selection carried as
an open decision with explicit criteria (single-binary operation, same-VPS
sizing, backup story, cost). Defended non-omissions (QField/Mapeo,
Electric, k3s/Coolify) — ACCEPT the defense; retained as recorded gaps.
O1 satisfied before and after; promoted gaps strengthen O5.

M8 (O3 framing gaps, not honesty gaps) — ACCEPT. Verified: E1's
deprecation-plus-migration-notes is a genuine evolution chain satisfying O3
alone; E2/E3 honestly presented as process/marker evidence; the
chrome-dominated changelog correctly refused as a quote source — epistemic
hygiene concurred and upheld. Applied: alpha-helper status framed as the
photo pipeline's likeliest regression surface with V3 coverage; pre-1.0
warning stated at full strength ("NOT recommended for production critical
applications") with the pin-vs-patch trade-off explicit. The rejection of a
"second commit-pinned chain" demand as invalid — ACCEPT (endorsed).

M9 (conditions/alternatives tensions) — ACCEPT (both). (a) Verified against
the simplest-backend framing: naive defaults are the hazard, custom policy
the design. Applied: condition rewritten to say exactly that. (b) Verified
by inspection of what a queue migration entails (new op model, conflict UX,
data migration). Applied: alternative (d) costed as a rewrite or demoted to
prototype-only with data discarded; alternative (e) added per M7a.
Open-decision rollup applied: ODK-vs-custom triggers made concrete (three
named triggers, proposed); retention/EXIF kept correctly unresolved;
QR/adb provisioning kept as an adequate nav-level pointer.

m1 (Apache 2.0 unsourced) — ACCEPT. No license file was fetched; ecosystem
corroboration is not evidence. Applied: no license claim appears anywhere
in this final.
m2 (11–12 MB is zip size) — ACCEPT. Applied: "downloads around 11–12 MB
per platform/architecture" throughout.
m3 ($5–20 VPS unsourced) — ACCEPT. Applied: prices dropped; "small VPS" only.
m4 (v9.0.0 chrome flag) — ACCEPT the praise; flag kept wherever cited.
m5 (CouchDB cluster/single-node unsourced) — ACCEPT. Applied: hosting
scoped to the single-node shape the brief needs; cluster mention dropped.
m6 (polite/assertive nav-derived) — ACCEPT. Applied: subpage content
flagged as unfetched before any pass/fail criteria (P4, V4).
m7 (intent/half-covered blur taxonomy) — ACCEPT. Applied: nuance kept,
one primary label each (P1 correction, P3 correction).
m8 ("toggle-only" fair paraphrase) — ACCEPT the defense; paraphrase kept.
m9 (marketing claims not relied upon) — ACCEPT. Applied: 2M-users/250M-
submissions figures dropped from this final entirely.
m10 (lifecycle note not critic-verifiable) — ACCEPT as stated; this
revision's own lifecycle note (section 11) is likewise stated, not proven.
m11 (timestamps/drift flags honest) — ACCEPT the praise; same discipline
kept in this revision's source map.
m12 (usage/billing null, immutable IDs, no rebind) — ACCEPT the praise;
upheld in this revision (null everywhere, predecessor IDs cited never
remapped).
m13 (PowerSync "reconcilliation" typo) — ACCEPT. The correct spelling
"reconciliation" is used throughout this final.

U1 (no Android source in either stage) — UNCERTAIN, carried symmetrically.
This reviser also fetched no Android source: with ~15 minutes of stage time
and every criticism resolvable by honest labeling within captured evidence,
a fresh fetch was not necessary to resolve any concrete dispute. All
client-platform comparisons remain marked judgment; the Android fetch stays
first in the queue. The critic's demand stands valid and unfilled.
U2 (S07 truncation, CrudEntry optionality) — UNCERTAIN in the flagged
detail, ACCEPTED in substance. Field optionality carried as less certain;
dead-letter grounding inherits the weakness but the escape hatch's existence
is independently confirmed — flagged, not fatal, concur.
U3 (S3 setting, ODK behaviors, sizing, managed terms, MinIO/Garage) —
UNCERTAIN, all carried as label-as-unverified or decide-with-criteria,
never asserted. Concur.
U4 (invalid demands rejected) — ACCEPT all four endorsements: (i) no second
chain needed; (ii) ODK-first stands as best-evidenced (this revision's
managed-start alternative is a decision to compare, not a demotion);
(iii) V1–V6 execution correctly not demanded without a runtime; (iv) critic
repair correctly out of the critic's scope — and this revision IS the
in-scope repair, now delivered.

No criticism was rejected: M1–M9 and m1–m13 were all accepted (M3 with an
applied amendment), and U1–U4 were endorsed with uncertainty carried
forward. The ODK-first recommendation survives scrutiny unchanged in
direction, tightened in evidence discipline.

## 10. Source bibliography (primary; reliance on own-arm captured evidence)

This revision conducted no new fetches: every claim above is grounded in
the complete own-arm captured evidence from the declared source roots,
cited by its own immutable IDs (never remapped, never rebound — S01–S15
under the research source map, C01–C08 under the critic source map).
Exact URLs, versions, locators, access timestamps and observed operations
live in those two maps; this bibliography states the material scope in
prose so the final stands alone.

Research capture (fetched 2026-10-09T19:31–19:34Z, 15 sources): ODK project
homepage (offline field-stack loop, form features, export connections;
mutable web page); ODK Central install guide on a VPS (compose install and
manage surface incl. users/projects/forms/submissions/entities, encryption,
audit logs, backup, upgrade; mutable docs); ODK Entities introduction
(longitudinal updatable records; mutable docs); ODK offline-maps guide
(offline maps, location tuning, QR/adb provisioning; mutable docs);
PowerSync documentation home plus index (service/SDK/database matrix incl.
Kotlin SDK and Postgres-first sources; mutable docs); PowerSync update
conflicts (complete short page: PUT/PATCH/DELETE, idempotency, simplest-
backend per-field LWW, deletes-win, validation example; mutable docs);
PowerSync custom conflict resolution (data flow, CrudEntry shape,
uploadData connector, custom strategies incl. dead-letter human review;
mutable docs, truncated capture); PowerSync attachments (deprecation of
standalone packages, built-in alpha helpers with per-SDK minima,
metadata + storage-provider pattern, queue lifecycle; mutable docs);
PocketBase introduction at v0.40.5 page chrome (single binary + SQLite +
realtime + auth + dashboard + REST-ish API, download matrix around 11–12 MB
per platform/architecture, pre-1.0 no-backward-compat warning; version-
pinned page, mutable docs); PocketBase files handling (~5 MB default cap,
sanitized name + random suffix, multipart upload, SDK samples; S3-offload
setting secondhand only; mutable docs); PocketBase production guide
(portable deploy, serve-with-domain automatic TLS, non-root binding,
systemd unit; mutable docs); PouchDB conflicts guide (CouchDB-identical
replication, immediate 409 contract with always-handle rule, upsert delta
pattern; v9.0.0 site chrome; mutable guide); CouchDB replication index plus
conflict-model page (incremental one-way push/pull over HTTP, last-
revision-plus-tombstones copy, no peer tracking, arbitrary-but-
deterministic winner, winner-only views, hidden losers, selector
replication; stable-channel mutable docs); W3C accessible-forms tutorial
index (seven subpage scope: labeling, grouping, instructions, validating,
notifications, multi-page, custom controls; mutable docs); PocketBase
changelog on the master branch (release-process evidence: file exists,
rows unquoted from chrome-dominated capture, no commit pinned, drift
explicit; mutable branch).

Critic re-verification (re-fetched 2026-10-09T19:41–19:42Z, 8 sources):
PowerSync update conflicts (byte-identical 3286-byte complete re-fetch;
confirms op model, idempotency, simplest-backend LWW, deletes-win, and the
custom-resolution escape hatch); PocketBase files (size-matched re-fetch;
confirms ~5 MB default and ~10-char suffix; S3 setting explicitly not
re-verified); PocketBase intro (size-matched; confirms pre-1.0 warning at
full strength); PouchDB conflicts (size-matched; confirms 409 contract,
upsert pattern, v9.0.0-as-chrome); CouchDB conflict model (confirms
arbitrary-but-deterministic non-LWW winner, hidden losers, no peer
tracking); W3C forms index (size-matched; confirms 7-subpage scope and its
index-only limit); ODK Entities + Central pages (transfer-encoding size
difference only; confirms nav-level platform existence, ODK Cloud managed
banner, and the absence of captured review/permission/backup/sizing
behavior); PowerSync attachments (12-byte drift on mutable docs; confirms
deprecation, SQLite-warning scope, and the metadata + provider pattern with
its PowerSync-only scope). Usage/billing: unobserved (null) on every
source in every stage.

## 11. Lifecycle note

One fresh native Goal was created for this assignment and verified active
before writing (see tool record, not a handwritten receipt); all science
above (this final, source map, evidence index) is saved before any terminal
completion. The complete predecessor draft, discovery, both source maps, all
23 captured excerpts, the critique, the brief and the revealed plan were
read in full; consequential criticisms and affected dependencies were
independently checked against the captured excerpts before adjudication. No
new fetches were necessary to resolve any concrete dispute within this
window. Method: M07 v1 evidence-on-demand, control arm (conventional draft
+ source bibliography + complete own-arm captured evidence, normal
navigation). No nested agents, no repo/canon edits, no executable downloads,
no counterpart/campaign/evaluator/history reads, no account/config changes.
Per-stage deadline 2026-10-09T20:09:11Z; whole-arm deadline
2026-10-09T20:30:16Z.
