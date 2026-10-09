# Critique — S01 field-inspections (A-M07-B treatment/critic, M07 v1 evidence-on-demand)

Scope: brief `cases/S01/brief.md`, predecessor `treatment/research` draft.md +
discovery.md + revealed-plan.md + source-map.json, and all 15 governing captures
S01–S15 re-verified byte-identical (SHA-256 match, see `source-map.json` and
`sources/index.md`). Method: evidence-on-demand — every consequential claim below
was checked against the capture bytes, expanding beyond the author's excerpt to
definitions, exceptions, and callers. No premium evaluator access; no candidate
repair beyond this critique.

## Verdict summary

All six P dispositions are directionally correct; there are no false corrections
or false rejections. The draft's load-bearing corrections (P1 storage layer, P2
LWW rejection, P5 no-deferral) stand. The material weaknesses are overclaims and
unevidenced load-bearing premises inside otherwise correct dispositions:
conflict-preservation generalized beyond its evidence (M1), a build recommendation
on zero-evidence Sync Streams docs (M2), an unevidenced ODK ops-cost claim that
carries D1 (M3), ungrounded capacity/pass-bar numbers (M4), validation
applicability gaps (M5), and a designed-but-unevidenced photo pipeline (M6).
Minor findings are scoping slips, uncited background knowledge, and correctly
flagged but unscheduled verifications. Details below; consolidated lists at M1–M8 / m1–m8.

## Per-P disposition verdicts

### P1 "Use a PWA and browser local storage for all offline records." — CORRECTION: AGREE, with scoping caveat

- Agree that synchronous small-quota `window.localStorage` cannot carry a day of
  offline forms + photos + GPS with query/sync/conflict needs. The correction to
  a real offline store + sync engine (or ODK-native) is sound.
- Caveat (m1): P1's phrase "browser local storage" is ambiguous between the
  `localStorage` API and browser storage generally. The draft reads it as the API
  and retains "the PWA shell is viable" — but no capture investigates the actual
  PWA-store alternatives (IndexedDB, OPFS, SQLite-WASM) that would decide whether
  a corrected PWA (candidate C in a browser shell) meets the day-offline bar.
  The correction stands; the retained PWA viability is asserted, not evidenced.
- Draft preference order A > C > B is presented without the decision rule that
  produces it (least-code first). Since D1 explicitly defers adopt-vs-build to the
  nonprofit, the ordering reads as a recommendation the draft simultaneously
  declines to make. Reviser should either drop the ordering or state its criterion.

### P2 "Upload complete inspection JSON on reconnect with last-write-wins." — CORRECTION: AGREE, but M1 overgeneralizes the governing model

- Agree LWW-as-global-policy must go: S01 verifies both revisions survive on both
  replicas, reads/views see only the deterministically-chosen winner, loser waits
  in `_conflicts` — exactly the silent-discard hazard for coordinator-correction
  vs inspector-amendment collisions. S07 verifies RxDB handles conflicts during
  replication and stores newest-only client-side. V3 drills the right property.
- M1: the draft claims "the governing models found in discovery all preserve
  conflicting revisions instead of discarding them." The captures do not support
  "all": S02 (PowerSync) says nothing about conflict handling; S15 (Electric)
  says nothing about conflicts or offline writes in the captured excerpt scope;
  S14 (Automerge) is homepage positioning ("prevents conflicts") with no merge,
  sync-server, auth, or photo semantics. Only S01/S07 evidence preservation.
  Consequence: candidate B (PocketBase + hand queue) has *no* evidenced
  conflict-preserving mechanism at all — the draft's corrected requirement
  ("conflict-preserving sync with coordinator merge queue") is a build obligation
  for B, not a property B has. The draft notes B's "highest-risk sync code" but
  never states plainly that B fails the corrected P2 requirement as-specified and
  must invent MVCC-or-equivalent. Reviser must scope the preservation claim to
  S01/S07 and mark B's conflict layer as unbuilt/unverified.

### P3 "Store photo URLs in each form." — CORRECTION (intent retained): AGREE, but M6 pipeline is design, not evidence

- Agree bare URLs dangle offline and under-specify identity/durability/privacy;
  reference-by-link plus out-of-band bytes is the right shape. S07's verified
  "no attachment replication" exclusion is genuine support for out-of-band photos
  under the RxDB path.
- M6: content-hash keying, background upload queue with retry, offline placeholder
  rendering, and capture-GPS-retained / derivative-GPS-stripped are *designed*,
  not evidenced. S11 verifies only Garage's positioning ("S3 object store so
  reliable you can run it outside datacenters") plus quick-start; nothing about
  hashing, versioning, EXIF handling, or queues. No capture evidences EXIF/GPS
  strip tooling or any candidate's queue implementation. V2 proposes to verify
  round-trip + strip + re-import, which is the right check — but the draft states
  the pipeline as the corrected requirement while its central privacy property
  (strip) has no evidenced implementation anywhere. Reviser should mark the
  pipeline proposed-unverified, not corrected-settled.
- Credit: MinIO licensing, Electric offline-write, Automerge ops, and JSVM
  `$filesystem.s3` are all correctly flagged unverified. But they remain live
  alternatives without scheduled verification steps (m4) — V-probes exist for ODK
  granularity (V5) but none for MinIO-vs-Garage, Electric writes, or `$filesystem.s3`.

### P4 "Add coordinator review and CSV export." — ALREADY-COVERED + OPTIONAL ENHANCEMENT: AGREE

- Agree: coordinator review is brief-load-bearing (corrections review) and doubles
  as the conflict-merge surface under corrected P2. CSV-necessary-but-insufficient
  (no photo bytes, weak linkage) plus a full-fidelity bundle (records + objects +
  manifest, re-importable elsewhere) is a sound enhancement preserving the
  anti-lock-in spine (open schema, portable DB file, S3-API photos, documented export).
- S09/S12 verify the WAI checklist structure (labels incl. `visuallyhidden`,
  grouping, instructions, validation, notifications, multi-page). The draft's
  scoping ("any browser review console must pass"; native Collect inherits
  platform behaviour) matches discovery C8. No overclaim.
- M8-adjacent: discovery C9 says the export drill "(V6) must demonstrate" GPS
  strip, but V6 is the accessibility pass and V2 is the photo audit. The draft
  correctly cites V2/V7 for export fidelity, so the draft is self-consistent and
  the slip is confined to discovery C9's cross-reference. Reviser should fix the
  discovery pointer, not the draft. Listed as M8 because a wrong validation
  pointer can misdirect the build even though the draft escaped it.

### P5 "Defer access control beyond individual sign-in until rollout." — REJECTED → USER DECISION: AGREE, with m6 honesty note

- Agree deferral must be rejected: granularity is structural. All three premises
  verify: S05/S06 per-form-per-App-User Form Access (coarse); S03 five filter
  rules defaulting locked (`null` = superuser-only), `200 empty items` on
  unsatisfied listRule, `400` create / `404` view-update-delete, `403` only when
  locked-and-not-superuser; S02 per-bucket server-side scoping. The
  "miswritten listRule silently narrows" hazard is genuine per S03's
  rules-are-filters semantics. V4's status-shape assertions are well-grounded.
- m6: the draft rejects P5's deferral but replaces it with D2, which also defers
  the granularity choice to the nonprofit and explicitly "blocks schema and engine
  choice." That is honest (user decision, not silent deferral) and O5-compliant —
  but it means the brief's selective-sharing investigation ends with options, not
  a recommendation. Not a defect, but the reviser should not present P5 as
  resolved; it is correctly reframed as blocked-on-D2.

### P6 "Test by toggling network off and on." — CORRECTION (smoke kept): AGREE, with M4/M5 on the battery

- Agree the toggle stays as V0 smoke and cannot serve as strategy. X1 is honestly
  scoped (15 pinned captures; no witness; no runtime; telemetry null).
- M4/M5 (see Validations): V1's pass bar and V3/V7 per-candidate applicability
  are the weak points, not the P6 disposition itself.

## Consequential facts/defaults/conditions (C1–C9 re-verified)

- C1 (S01) VERIFIED: push/pull, both-revisions-survive, deterministic winner,
  winner-only views, `_conflicts` holding losers. Applicability warning (record
  view without conflict indicator strands losers) is sound.
- C2 (S03) VERIFIED: five rules + `manageRule`; locked default; filter semantics;
  200-empty/400/404/403 split; superuser bypass. The 404-vs-403 test obligation (V4) follows.
- C3 (S04/S10) VERIFIED: v0.40.5, ~11–12 MB zips, `./pocketbase serve`, embedded
  SQLite; pre-v1 warning verbatim ("NOT recommended for production critical
  applications yet" without changelog-driven migrations). Applicability condition
  (rehearsed backup/restore + PocketBase-independent export) is proportionate.
- C4 (S07) VERIFIED: `replicateCouchDB()`, checkpoint-based (not official
  protocol), no attachment replication, 6-parallel-collection ceiling with
  documented workaround, newest-only client storage. Out-of-band-photos and
  wide-collections consequences follow. Note the newest-only tradeoff the draft
  keeps: on-device conflict archaeology is unavailable — consistent with V3's
  server-side merge-queue framing.
- C5 (S02) PARTLY VERIFIED, M2: bucket name + parameter + data queries, per-client
  scoping, and the Legacy/deprecation notice all verify, including both migration
  routes and the "migrating does not change what your app syncs" invariant. But
  no capture documents Sync Streams semantics — the surface the draft mandates
  ("build on Sync Streams, not legacy Sync Rules"). A mandate to build on
  unexamined docs inverts the evidence burden, and the no-scope-change invariant
  is a vendor claim the discovery rightly says to verify (m5), while the draft
  states the Streams target as settled. Reviser needs a Sync Streams capture
  (params, data model, offline writes, conflict behaviour, self-host config)
  before C can carry the day-offline requirement.
- C6 (S05/S06) VERIFIED: Web Users global vs App Users per-project; Form Access
  per-form-per-App-User dropdown. Coarser-than-row-rules consequence follows. The
  "one project per visibility group or Entities-based design" alternative cites no
  Entities capture (m2) — V5 spikes it, which is the right containment, but the
  Entities option is currently a name, not an evidenced design.
- C7 (S08/S13) VERIFIED with m3 note: MBTiles offline layer from a device file,
  distribution out-of-band (import/send per project), S13 blank-form download +
  offline capture + offline-maps link. The "~100s MB" tile-size figure and "GPS
  needs no network" are uncited background estimates — plausible, but should be
  labelled as such or captured; tile-build/version tooling is also unexamined.
- C8 (S09/S12) VERIFIED: label association, `visuallyhidden` pattern, grouping /
  instructions / error identification / notifications / multi-page as separate
  items. Coordinator-console scoping is correct.
- C9 (S11+S04) POSITIONING-ONLY, M6: Garage S3-compat/outside-datacenters verifies;
  everything else in C9 (hash-keyed objects, metadata split, GPS retain/strip,
  S3 bindings) is design or explicitly-unverified secondary report. The privacy
  rule's importance is not in doubt; its implementability in any candidate is.

## Discovery / alternatives challenges (O1, candidates A/B/C)

- M3: candidate A's decisive disadvantage — "Central's Docker/Postgres operational
  weight vs simple deployments" — has no capture. None of S05/S06/S08/S13
  documents Central installation, Compose files, Postgres ops, resource floors, or
  backup. D1 (adopt ODK vs build custom) therefore rests its "heaviest ops weight
  relative to simple" leg on an uncited premise. Either capture Central self-host
  docs or downgrade the ops comparison to explicitly-unverified. This is material
  because D1 is the draft's top decision and ops simplicity is a brief constraint.
- M7: candidate C's day-offline fitness is unevidenced for two of its three
  engines. PowerSync offline writes and Electric offline writes appear nowhere in
  S02/S15's captured scope; Automerge offline queuing is homepage prose (S14)
  without sync-server/auth/photo/ops semantics. RxDB's offline-first client store
  is the only C-engine path with captured substance, and even there the draft
  leans on "reactive client store" plus during-replication conflict handling
  rather than an explicit offline-write capture. C cannot be presented as
  "professional sync semantics without hand-rolled replication" for a day-offline
  photo workload until at least one engine's offline-write + photo-out-of-band
  path is captured.
- Candidate B's "Room/WorkManager-style offline queue" names Android components
  with zero captures (m2). Since B's entire sync/conflict/photo-queue story is
  custom code, the absence of even a framework-level capture leaves B as the
  riskiest option with the thinnest evidence — the draft says "riskiest sync
  code," which understates it: B's sync layer is currently undesigned.
- O1 breadth is otherwise good: buckets vs shapes vs CRDT-vs-MVCC vs checkpoint
  replication are genuinely different approaches, and the adopt-vs-build (ODK)
  framing is the right product-level alternative. The gap is depth on the
  mandated paths (Streams, ODK ops, C offline writes), not breadth of survey.

## Evolution chains (O3: E1–E3)

- E1 (S02) VERIFIED as a deprecation record: Legacy label, successor named with
  capability deltas (on-demand, JOINs, CTEs, subqueries), continued support,
  Streams-only new features, two migration routes, no-scope-change invariant.
  Planning consequence (cost migration, verify invariant, no greenfield on
  deprecated surface) is correct — but it cuts against the draft exactly as much
  as for it (M2/m5): the draft greenfields on Streams with no Streams evidence.
- E2 (S10) VERIFIED: v0.40.0–v0.40.5 chain, Go floor + `encoding/json/v2` with
  explicit "do not push blindly… test locally first," `_defensive=1` default,
  backup transaction-lock removal citing #7799. The "pre-v1 warning is live"
  reading and V8 staging-first consequence are well-grounded. Source hygiene is
  good (mutable `master` ref explicitly capture-pinned).
- E3 (S07) VERIFIED as a deliberate-break record: chattiness rationale (≥1
  request/doc), full-tree cost, and the stated tradeoffs. "Verify wire behaviour
  per plugin" is the right lesson and is correctly applied to attachments.

## Omissions (brief-relevant, evidence-actionable)

1. PWA-store depth (m1): no IndexedDB/OPFS/SQLite-WASM capture behind the retained
   "PWA shell is viable" line.
2. ODK ops + Entities (M3/m2): no Central install/Compose/Postgres capture; no
   Entities capture behind V5's second spike arm.
3. Sync Streams (M2): no docs capture for the mandated surface.
4. Offline writes (M7): no PowerSync/Electric offline-write capture; no explicit
   RxDB offline-write excerpt.
5. Photo pipeline mechanics (M6): no hash-keying, EXIF/GPS tooling, queue, or
   placeholder-rendering capture.
6. Capacity grounding (M4): no per-photo size, storage, bandwidth, or battery
   capture behind V1's numbers.
7. S3 portability mechanics (m7): no capture of Garage↔MinIO migration, versioning,
   or backup/restore for the photo tier.
8. Enketo/Web Forms (m2): named as the browser-fill path under the WAI contract
   but uncaptured — either capture or drop the name.
9. Coordinator override scope and ex-inspector revocation flows are listed under
   D2 but have no per-candidate mechanism mapping (ODK credential rotation vs
   PocketBase rule change vs bucket re-query) — needed before D2 is decidable.

## Validations: executed vs proposed (O6 applicability)

- X1 HONEST: 15 captures pinned by bytes + SHA-256; no witness; no sandbox; no
  behavioural probe; telemetry null. Re-verified identical in this stage. No issue.
- M4: V1's "100% records + photos reconciled within 30 min of connectivity on
  office Wi-Fi" pass bar is arbitrary. The draft itself holds photo size policy
  (cap vs originals) as the dominating unknown and location/accuracy needs as
  unstated — so neither the numerator (bytes) nor the throughput denominator is
  grounded. Keep V1's drill shape; replace the fixed bar with a budget derived
  after D3, or state it as a placeholder target with its derivation rule.
- M5: V3 (both revisions preserved, merge supersedes) cannot pass on candidate B
  as-specified because B has no preservation mechanism. The draft never pre-declares
  expected per-candidate V-results (A: Central marketing vs review-queue reality;
  B: fails until queue built; C: per-engine). A discriminating battery should say
  in advance which candidates it expects to fail which Vs. Reviser should add an
  expected-results matrix, or V3 will read as a post-hoc filter.
- V2 is the right audit (SHA-256 identical, GPS retained/stripped, re-import
  elsewhere) and its falsifier ("backend-internal IDs break portability") is sharp;
  but per M6 it verifies a pipeline no candidate yet evidences — correct as a
  proposal, not as near-term assurance.
- V4 is the best-grounded probe (S03 status shapes give exact assertions).
- V5 is correctly time-boxed with a retirement consequence for A.
- V6 correctly splits browser-console (full WAI) from native Collect (platform
  checklist) — but the native arm has no named checklist capture; either name one
  or mark it TBD.
- V7's three legs (bare-VM deploy, destroy-restore, cross-S3 migrate) match the
  brief's simplicity + anti-lock-in constraints, but legs 2–3 assume photo-tier
  portability mechanics (m7) with no captures. Keep as proposal; do not treat as
  plannable work until the S3 tier is captured.
- V8 correctly institutionalizes E2. No issue.

## False corrections / false rejections check

None found. P1/P2/P3/P6 corrections all move toward the brief and the evidence;
P4's already-covered + enhancement split is accurate; P5's reject-as-stated with
elevation to user decision is the correct handling of a structural choice. The
critic's challenges above narrow overclaims and demand missing evidence; none
reverses a disposition. Critic demands themselves carry uncertainty where noted
(M4's bar could survive as an explicit placeholder; m1's PWA-store question could
resolve against PWAs entirely) — the reviser should treat each M/m as a repair-or-
rebut prompt with the cited capture as arbiter, not as an order.

## Consolidated finding lists

Material (reviser must repair or rebut with captures):
- M1 P2 overgeneralization: scope conflict-preservation to S01/S07; state B's
  preservation layer as unbuilt; capture or drop PowerSync/Electric/Automerge
  conflict claims.
- M2 Sync Streams mandate without Streams evidence: capture Streams docs
  (params, data, offline writes, conflicts, self-host) or downgrade the mandate.
- M3 ODK ops weight without install evidence: capture Central self-host docs or
  downgrade the D1 ops leg to unverified.
- M4 V1 30-min bar ungrounded: derive from D3 budgets or mark placeholder + rule.
- M5 V3 applicability: add expected per-candidate V-results; state B fails until built.
- M6 Photo pipeline designed-not-evidenced: mark hash/queue/strip/placeholder
  proposed-unverified; capture at least the strip + queue mechanics.
- M7 Candidate-C offline writes unevidenced: capture one engine's offline-write +
  photo-out-of-band path before C carries day-offline.
- M8 Discovery C9 cites V6 for the export drill; V6 is accessibility, V2 is the
  photo audit — fix the pointer.

Minor (fix opportunistically, do not block):
- m1 P1 ambiguity (localStorage API vs browser storage); no IndexedDB/OPFS capture.
- m2 Uncaptured names: Room/WorkManager, Enketo/Web Forms, ODK Entities.
- m3 Uncited background: GPS-without-network, ~100s MB tiles.
- m4 Unverified leads lack scheduled checks: MinIO license, Electric writes,
  Automerge ops, `$filesystem.s3`.
- m5 Streams no-scope-change invariant is vendor-claimed; keep discovery's
  verify-not-assume framing in the draft.
- m6 P5/D2 ends selective-sharing as blocked-on-user — honest; do not present as resolved.
- m7 V7 cross-S3 leg assumes uncaptured portability mechanics.
- m8 S15's `.md` suffix holds an HTML body (noted in source-map; parse as HTML).

## Critic limits and uncertainty

- No cold re-fetch was performed: all 15 captures re-verified identical by hash,
  so no drift handling was needed and no new primary sources were introduced.
  Findings calling for new captures (M2/M3/M6/M7) are demands on the reviser, and
  any of them could resolve against the draft's current framing once captured.
- No runtime, device, account, or witness execution was available or used in this
  stage — same honesty boundary as X1. Behavioural claims about unobserved systems
  remain proposals.
- Usage/billing telemetry: unobserved (null) for all sources, carried forward.

## Evidence pointer

`source-map.json` (this directory) re-pins all 15 captures with URL, bytes,
SHA-256, access timestamps, and observed verification operations;
`sources/index.md` is the navigable exact-byte index with per-source locators.
Claim → source map: P1→S04,S07,S13 (+m1 gap); P2→S01,S07 (M1: not S02/S14/S15);
P3→S07,S11 (M6 gaps); P4→S09,S12,S01; P5→S02,S03,S05,S06; P6→S10,S02,S07;
C1→S01; C2,C3→S03,S04; C4→S07; C5→S02 (M2 gap); C6→S05,S06; C7→S08,S13;
C8→S09,S12; C9→S11 (+M6 gaps); E1→S02; E2→S10; E3→S07.
