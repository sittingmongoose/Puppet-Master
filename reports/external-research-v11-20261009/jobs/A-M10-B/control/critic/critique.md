# S04 maker-inventory — critic (M10, control arm)

Block A-M10-B, arm control, stage critic. Case S04 maker-inventory.
Method M10 v1 (question-relevance-reformulation): this critique independently
inspects the complete own-arm predecessor draft, discovery, revealed thin plan,
and governing primary evidence, then challenges consequential facts, defaults,
conditions, discovery/alternatives, every P disposition, omissions, false
corrections/rejections, and validation applicability.

Inputs inspected in full (own arm only, per input-map.json):
- `cases/S04/brief.md` (maker-inventory brief + O1–O6 obligations)
- `jobs/A-M10-B/control/research/draft.md` (complete post-reveal draft)
- `jobs/A-M10-B/control/research/discovery.md` (frozen pre-plan discovery)
- `jobs/A-M10-B/control/research/revealed-plan.md` (P1–P6 exact clauses)
- `jobs/A-M10-B/control/research/source-map.json` + `sources/index.md` (S01–S18)
No campaign/history/evaluator/counterpart material was read. No repair of the
candidate beyond this critique's recipe was attempted.

Independent verification performed by this critic (public primary sources,
read-only web_search/web_fetch, no downloads, no installs, no runtime):
- C01: PostgreSQL current (18) constraints documentation — fetched.
- C02: LibreBooking releases note confirming commit `7e80933` tall-view fix.
- C03: Grocy 4.7.1 changelog (2026-09-04) — iCal 401, product-copy, login/filter.
- C04: InvenTree PR #4541 stock-history sales-order backfill (+ #4488 context).
- C05: LibreBooking issue #1220 — searched, not independently re-verified
  (recorded honestly as unobserved-by-critic; predecessor's S16 stands
  unconfirmed, not refuted).
Usage/billing figures: unobserved (null). No qualified sandbox was available
to this stage either; no witness runs are claimed.

## Verdict summary

The draft's overall direction survives criticism: three journals over one
table, exclusion-constraint overlap truth over calendar math, outbox-plus-
tentative over timestamp reconcile, pipeline-plus-quarantine over
name-overwrite, repair state machine over free text, and smoke-plus-V1–V6
over happy-path-only testing are all correct calls, and all six P
dispositions stand (no false correction or false rejection found). Chains 2
(Grocy) and 3 (InvenTree) re-verified cleanly; Chain 1's core (LibreBooking
`7e80933` tall-view fix) is confirmed via the release note while its
detail-level claims remain thinner than the draft implies.

The material weaknesses are completeness gaps inside correct corrections,
not wrong directions: the stock journal has no stated concurrency control
so its P2 correction is incomplete (M1); custody's one-borrower rule has no
stated DB enforcement (M5); the offline conflict policy has no tie-break,
TTL, or double-lend validation (M4); Route A's SSO/catalog-sync integration
is assumed without evidence and Snipe-IT is dropped silently (M2); host
placement and extended-outage behavior are unspecified for a two-site design
(M3); and two governing discovery claims lack immutable source IDs while
Chain 1 rests on snippet-only evidence (M6). None of these overturns a P
disposition, but M1+M4+M5 must be closed before V1/V2/V6 can pass as
acceptance, and M2+M3 before Route A or the hosting plan can be adopted.

## Material findings

### M1 — Stock journal without concurrency control does not fix the P2 race (high confidence)

Location: draft §1.2 (stock journal, "derived sum, never overwritten cell"),
§1.3 ("non-negative policy"), P2 disposition; discovery §2.1/§2.4.

The P2 correction correctly rejects client-overwrites-row and replaces it
with an append-only movements journal plus derived balances, explicit units,
idempotency keys, and per-site thresholds. But a journal alone does not
prevent the race P2 exists for: two staff at two sites concurrently consume
the last units of a part. Both transactions read a positive derived balance,
both append a consume movement, both commit — the balance goes negative (or
across a threshold) without either writer seeing the other. The draft never
states the missing control: `SELECT ... FOR UPDATE` on a per-(part, site)
control row, a serializable isolation level with retry, a predicate/trigger
enforcing non-negativity at commit time, or optimistic versioning with a
documented loser path. The "block, or allow-negative only with reason +
actor" policy is a decision rule, not an enforcement mechanism, and under
concurrency the check-then-insert still races.

Evidence and uncertainty: this is standard read-modify-write reasoning
applied to the draft's own stated mechanism; it does not depend on a new
primary source. The draft's reservation path gets this right (DB-level
exclusion as backstop under races) but the stock path does not get an
equivalent backstop. If maker policy chooses allow-negative-with-reason,
the race is benign and M1 downgrades to minor — but block-by-default, the
draft's own default, requires the missing mechanism.

Consequence: V6 (two-site stock split) cannot pass as specified under
concurrent consume; the "derived sum" claim is true for reads but
insufficient for fenced writes. The P2 disposition stands (rejection of
row-overwrite is correct); the replacement is incomplete.

Suggested close-out (for the build, not done here): name one enforcement
per policy — e.g. block-by-default via a per-(part, site) stock-control row
locked `FOR UPDATE` inside the consume transaction, or a deferred
non-negativity constraint; allow-negative via reason+actor with no lock —
and extend V6 with a concurrent-consume case asserting exactly one
outcome under block-by-default.

### M2 — Route A integration assumed, not evidenced; Snipe-IT dropped silently (high confidence)

Location: draft §1.1 Route A (LibreBooking-or-Fab-manager + InvenTree-or-Grocy
via "SSO/LDAP" identity and "nightly CSV/API sync" catalog); discovery §1–§2.6.

Three gaps:

1. SSO/LDAP sharing is evidenced for only half the pair. Discovery evidences
   SSO for Fab-manager (S01) and AD/LDAP for LibreBooking (S05). No source
   shows InvenTree or Grocy joining the same identity provider in the
   proposed pairing, and discovery §2.6 lists auth per product without
   establishing a common-IdP intersection for either Route A combination.
   "Sharing member identity via SSO/LDAP" is therefore an unvalidated
   integration assumption, and identity mismatch across two UIs directly
   undermines the audit-trail and actor-attribution requirements (§1.5).
2. Nightly catalog sync leaves up-to-24-hour drift in exactly the data the
   guards depend on: tool existence, repair/down status, and member
   standing. A tool flagged `down` in the stock/asset tool does not block
   reservations in the booking tool until the next sync. The draft never
   bounds this drift, names which side owns tool-status truth, or prices
   the failure window. At minimum the sync interval is a safety parameter
   with a stated default, not an implementation detail.
3. Snipe-IT — discovery's custody/audit fit (checkout timeline, audit log,
   barcode, REST API; S07) — disappears from Route A without a sentence of
   rationale. Route B then re-specifies a custody journal from scratch. The
   reader cannot tell whether Snipe-IT was judged redundant with InvenTree,
   weaker on a named axis, or simply forgotten. For an O1/O5 deliverable
   that promises retained alternatives with conditions, a surveyed
   custody-native candidate dropped silently is a lineage break.

Consequence: Route A's "lowest custom code" claim depends on integration
work (identity federation proof + catalog-sync ownership and drift bound)
that is currently unpriced, and the adopt-vs-build comparison is missing
one surveyed contender. Route A remains viable but not yet purchasable.

Suggested close-out: cite-or-test the SSO intersection per Route A pairing
(or downgrade to "separate logins, reconciled nightly" with the audit cost
stated); name the tool-status owner and a maximum sync lag with the
reservation-guard behavior inside the lag window; add one paragraph on why
Snipe-IT is in or out of Route A.

### M3 — Host placement and extended-outage behavior unspecified for a two-site design (high confidence)

Location: draft §1.8 (single small host), §1.4 (server-mediated sync).

"Single small host: Postgres + app container + static PWA" never says where
the host lives: on-site at site A, on-site at site B, or on a rented VPS /
cloud host. Each choice moves the failure domain:

- On-site at one site: the other site's WAN path becomes a hard dependency;
  brief's "unreliable Wi-Fi" is LAN-local, but this design adds a WAN
  dependency the brief never required.
- Rented/cloud host: both sites need working internet; a venue-wide outage
  degrades both sites to queued/tentative simultaneously.
- Either way the single host is a single point of failure with no stated
  RPO/RTO, and "nightly Postgres dump + file store, restore-tested" backs
  up the server while saying nothing about device outboxes (queued intents
  not yet synced are unbacked-up by construction).

The offline design (§1.4) covers transient loss well but never addresses
extended outage: how long can a site operate on queue, what caps queue size,
what staff do when the host is down for a day, and what members are told
about tentative reservations during the window. For a two-site brief this
is a load-bearing condition, not polish.

Suggested close-out: state host placement with the dependency it creates;
add an extended-outage playbook (queue caps, tentative TTL interaction
with M4, member messaging, catch-up ordering on recovery); clarify that
device outboxes are intentionally unbacked-up and bound the accepted loss
window.

### M4 — Offline conflict policy: no tie-break, no TTL, no custody-conflict validation (high confidence)

Location: draft §1.3–§1.4, V1 offline variant, V2.

The tentative-offline/confirmed-on-sync design is correct, but three
decisions a build cannot derive are missing:

1. Tie-break rule. "Same tool tentatively reserved at both sites offline →
   sync yields one confirmed + one conflict task naming both claimants"
   never says which claim wins: first-to-sync, earliest capture time,
   staff picks, or member priority. First-to-sync rewards connectivity over
   fairness; capture-time rewards device clocks the draft elsewhere
   distrusts (P3). V1 as written cannot discriminate a correct promotion
   from an arbitrary one — any single-winner outcome passes.
2. Tentative TTL and member expectation. A tentative held offline for hours
   reads as booked to the member who made it. There is no expiry, no
   re-confirmation prompt, and no stated notification when a tentative dies
   as a conflict task. The conflict-task UX is rightly deferred to staff
   (P3 user decision), but the existence of a TTL and a notification are
   architectural, not wording.
3. Custody conflict has no validation at all. V1 covers reservation overlap;
   V2 covers happy-path offline checkout/consume ("server reflects both").
   Neither covers the same lendable copy checked out at both sites while
   offline — the custody analogue of the V1 offline case. The merge rule
   (both holds? first-sync checkout + second becomes hold request? staff
   task?) is unstated and untested, even though double-lend is as
   consequential as double-book for a makerspace.

FIFO scope is a secondary ambiguity: per-device FIFO is implementable, but
two sites' FIFOs interleave arbitrarily at the server, so "synced FIFO"
should be scoped as per-device ordering with server accept-time as the
global sequence.

Suggested close-out: name the promotion rule (recommendation: accept-time
order with capture-time shown, staff override allowed) and a tentative TTL
with member notification; add a V2b double-lend case (same copy, both sites
offline → one checkout + one explicit hold/conflict task, never two
checkouts, never silent loss); scope FIFO as per-device.

### M5 — One-borrower-per-copy stated without DB enforcement (medium-high confidence)

Location: draft §1.3 ("Lendable copies use one-borrower-per-copy + holds,
not ranges").

The reservation path gets a concrete backstop (exclusion constraint, §1.3
SQL). The custody path gets a sentence. Under concurrent checkout of the
same copy — including the M4 offline-promotion race — application checks
alone re-create the double-lend the draft's own P2/P3 reasoning rejects
elsewhere. The standard backstop (partial unique index on copy id over
open checkouts, or an equivalent exclusion) is never named, and the holds
model (queue position, expiry, promotion on checkin) is never sketched.

This is the custody twin of M1 and fails the draft's own "server
re-validates every create/update" bar unless the backstop is named. The
disposition impact is nil (no P clause covers custody enforcement), but V2b
(M4) cannot be written without it.

Suggested close-out: add the partial-unique (or exclusion) statement for
open checkouts plus idempotency-key uniqueness on custody/stock writes
(keys are named in §1.2/§1.4 but their server constraint is never shown).

### M6 — Two governing claims lack source IDs; Chain 1 evidence is thinner than stated (high confidence on IDs, medium on impact)

Location: discovery §1.1 (Open Fab Control), §2.2 (Supabase), O3 Chain 1;
source-map S01–S18.

1. Missing immutable IDs. Discovery asserts "Supabase-alone is NOT offline"
   with "Source: Supabase offline limitation survey" — no S-number, no URL,
   no access timestamp — and mentions Open Fab Control "via Fabman
   ecosystem search" with no ID at all. The source-map's immutability
   contract (S01–S18, "no silent rebind") is thereby incomplete: a
   governing architecture claim (offline split) and a named approach signal
   sit outside the ID system. The Supabase claim's substance is consistent
   with the PowerSync/PouchDB contrast the draft draws and I do not dispute
   its direction, but as lineage it is currently an assertion, not evidence.
2. Chain 1 is snippet-only. S15 (commit `7e80933`) and S16 (issue #1220)
   are both `web_search` with no fetch; the draft's detail-level claims
   (file `Web/scripts/schedule.js`, `isEndApproximate` flag,
   `res.StartDate/res.EndDate` attributes, "Skip conflicting bookings" API
   gap) rest on snippets. This critic independently confirmed the commit's
   existence and subject via the LibreBooking releases note ("Correct tall
   view rendering for reservations with hidden blocked periods
   (`7e80933`)", C02) but did not re-verify the file/flag/attribute details
   or issue #1220's exact gap text in the available window (C05 recorded as
   searched-not-observed). By contrast Chains 2 and 3 re-verified cleanly
   (Grocy 4.7.1 changelog text matches C03 verbatim on all four claimed
   fixes; InvenTree PR #4541 description matches C04 including the #4488
   new-writes/backfill distinction).

Consequence: Chain 1's lesson ("rendered slots must never be conflict
truth; server re-validates; DB backstop") is sound and survives on the
confirmed subject alone, but its file-level details should be treated as
provisional until the diff is read, and the API/GUI parity requirement it
supports (§1.3, "must match ... or document the gap") currently leans on an
unre-verified issue record. Critic demands can be invalid: S15/S16 may be
entirely accurate as recorded — the finding is about evidence weight, not
truth. The cheap close-out is one fetched diff plus one fetched issue page.

## Minor findings

- **m1 — `completed` in the exclusion predicate is unexplained.** Past
  completed ranges cannot overlap future ones, so including `completed` is
  harmless, but the draft never says why completed rows participate while
  cancelled/no-show rows do not. One sentence of rationale (or dropping
  `completed` from the predicate) closes it. Discovery's predicate
  (`pending_payment/confirmed/completed`) differs from the draft's
  (`tentative/confirmed/completed`) without comment — harmless since
  discovery is frozen pre-plan, but a mapping note would help.
- **m2 — P3 "already-covered" miscategorizes the draft's own composite.**
  "Supabase-plus-local-outbox" is the draft's proposed composition, not
  surveyed prior art like PouchDB/CouchDB live-retry or the PowerSync
  queue. Listing it under already-covered inflates coverage; move it to
  the replacement description.
- **m3 — P5's InvenTree "condition/history" coverage is unverified.**
  Snipe-IT custody/audit entries are well-evidenced (S07/C-lineage);
  InvenTree condition vocabulary specifically is not shown in S06's
  observed record. Either cite the InvenTree status/condition source or
  narrow the claim to Snipe-IT patterns plus InvenTree history entries.
- **m4 — V3 "mixed delimiters" needs scope.** A single file with mixed
  delimiters is pathological; the realistic case is delimiter variance
  across files (plus quoted embedded delimiters within a file). Scope V3
  as per-file detection with a quoted-delimiter row inside one file.
- **m5 — V4 "no gaps" needs an enumeration rule.** "Every step shows
  actor/capture/accept/reason/order-link with no gaps" passes only if the
  test enumerates expected events independently of the trail under test
  (e.g. scripted action log vs trail query). Name the oracle.
- **m6 — V5's breakage simulation is circular as written.** "Simulate a
  field rename/auth change" on the server under test builds the breakage
  into the fixture. The realistic test is client-pinned-to-old-version
  against upgraded server (deprecation honored, versioned error, correct
  status), plus static contract tests pinning documented shapes.
- **m7 — "Reject ambiguous dates" may quarantine the legacy corpus.**
  With day≤12 dates throughout old sheets, per-row ambiguity rejection
  could quarantine most rows. The draft's own "force locale-explicit
  parse" points at the better default: staff declares the file's locale
  once per import, the parser applies it deterministically, and only
  truly unparseable dates quarantine. Reconcile the two sentences.
- **m8 — S03 binds MyTurn claims to a Wikipedia URL.** Lending-platform
  specifics (myTurn.com PBC, West Seattle Tool Library founding, named
  deployments) are observed via `web_search` but bound to
  `en.wikipedia.org/wiki/Tool_library`. The breeding ground of the
  lending-vs-reservation distinction deserves one primary myTurn.com
  fetch; until then the deployment details are snippet-grade.
- **m9 — Open Fab Control has no source record at all** (see M6). Either
  add the source or drop the mention; a sourceless approach signal adds
  no weight.
- **m10 — Repair machine blocking rules underspecified.** `down`/
  `in_repair` block new reservations; `degraded` and `retired` behavior is
  inferred but unstated (recommendation: `retired` blocks like `down`;
  `degraded` warns and requires staff override for exclusive tools, blocks
  nothing for lendables by default — but decide explicitly).
- **m11 — Lendable copy site-transfer is missing.** Stock transfer
  (quantity + reason + actor, both balances update) is specified; the
  custody analogue — a copy moving sites, temporarily or permanently, with
  its hold queue and due state — is not. Two sites need it.
- **m12 — Extension contract mechanics unstated.** Versioned REST is
  required but the scheme (URL versioning vs header), auth model, and
  webhook delivery/retry semantics are not. Fine for a plan, but V5 needs
  the scheme to be testable.
- **m13 — Postgres 18 pinning is over-specific but harmless.** Exclusion
  constraints are stable since long before v18 (C01 confirms the current
  docs; the feature is decades old). Pinning the whole pattern to "Postgres
  18" risks needless version anxiety; cite current-docs-plus-backcompat
  instead. The S10 URL (`/docs/current/`) already does the right thing.
- **m14 — S11 is a secondary blog, correctly subordinate.** The dev.to
  exclusion-pattern piece is fine as consensus color given S10 governs as
  primary. No action; note only that pattern-consensus claims should never
  outrank S10/C01 on semantics.
- **m15 — Buffer/cleanup "widen the stored range" hides a query question.**
  Widening works for conflict purposes but member-facing display must show
  the unpadded booking with the buffer distinguished; otherwise buffers
  read as unbookable mystery time. One sentence on storing
  booking-range + buffer separately vs widened-with-metadata.

## Per-P disposition audit (O4)

Each P clause is quoted from `revealed-plan.md`; dispositions are the
draft's. All six stand.

- **P1 "Use a shared calendar for reservations." → CORRECTION. Agree.**
  Keeping the calendar as view while replacing truth with the reservations
  journal + exclusion + server re-validation is the right split, well
  supported by the Fab-manager FullCalendar and LibreBooking schedule-view
  lineage. The rooms/desks contention-gated exception is a legitimate user
  decision; the "light conflict warning" fallback for low-contention rooms
  is acceptable only with the stated condition, which the draft keeps.
  No false correction.
- **P2 "Keep stock quantities in a database row updated by each client." →
  CORRECTION with mechanism REJECTED. Agree on rejection; replacement
  incomplete (M1).** Row-overwrite must go for exactly the stated reasons
  (clobbered decrements, no audit, no per-site balances, no units, no
  idempotency). Nothing of the mechanism is retained, correctly. But the
  journal replacement lacks the concurrency control that makes the rejection
  stick under the brief's own two-site condition. Disposition stands;
  mechanism needs M1's backstop.
- **P3 "Permit offline checkout and reconcile by timestamp." → CORRECTION.
  Agree.** Timestamp-only reconcile is last-write-wins with clock skew, and
  the outbox (local seq + UUID + actor + device clock, FIFO per device,
  server accept time) plus tentative-promotion plus explicit conflict tasks
  is the right replacement. The conflict-UX user decision is correctly
  scoped. Gaps are M4's (tie-break/TTL/custody-conflict), which refine
  rather than refute the correction. The m2 already-covered nit does not
  touch the disposition.
- **P4 "CSV import overwrites matching names." → REJECTED. Agree, fully.**
  Name ambiguity across two sites plus destructive overwrite with no undo,
  validation, quarantine, or audit admits no salvageable subset, and the
  draft retains none — the pipeline replacement (mapping preview,
  validation, quarantine with reasons, staff-confirmed identity, stable
  IDs, retained runs) is the right shape. The fuzzy-hints-only enhancement
  with staff confirm is correctly fenced as optional. No false rejection;
  this is the cleanest disposition of the six.
- **P5 "Tool maintenance is a free-text note." → CORRECTION. Agree.**
  Free text cannot carry bookability state, accountability, or guards; the
  state machine + transition log + guards with notes-as-field (plus photos)
  preserves what free text is good for while adding what safety needs. The
  work-orders-by-volume user decision is correctly fenced. m3/m10 are
  coverage nits, not disposition threats.
- **P6 "Test normal reservation and check-in flows." → CORRECTION
  (demoted to smoke). Agree.** Happy-path-only testing cannot touch races,
  offline conflicts, hostile CSV, audit gaps, contract breakage, or
  two-site splits; retaining P6 as pre-acceptance smoke under V1–V6 is the
  right demotion. The vocabulary use (correction-as-insufficient) is
  coherent: intent kept, mechanism replaced-by-superset.

No P disposition is a false correction or false rejection. The
already-covered / optional-enhancement / user-decision / uncertain
sub-labels are used honestly throughout §2; only m2 misfiles one entry.

## Omission register (beyond M-findings)

1. Member cross-site identity: can members use both sites on one account,
   and do training/standing attestations transfer? Route A identity sync
   and Route B's member catalog both assume an answer.
2. Tool/copy site binding: which tools are site-bound vs transferable, and
   who authorizes a move (pairs with m11).
3. Reservation series/blackout/buffer/quota semantics beyond one mention:
   LibreBooking lineage (S05) shows these exist in the domain; Route B's
   journal names buffer handling but not series expansion, blackouts, or
   quotas. V1 should either cover series or explicitly defer them.
4. Notification surface: booking confirmations, conflict tasks, low-stock,
   repair flags — channel and queue unspecified (partly M4-TTl, partly new).
5. Privacy/retention: member data, audit-trail retention, photo retention
   for repair transitions — unmentioned. Small scope, but audit-everything
   plus photos without retention is a policy gap.
6. Checkout duration/hold expiry/renewal caps: custody needs at least
   default due/grace values with staff override, else holds never clear.
7. Import-run lifecycle: quarantine retention, re-run idempotency (same
   file twice), and mapping reuse across files — the pipeline's happy path
   is specified, its edges are not.

Items 1–3 are the most consequential; 4–7 are appropriately small for plan
stage but should enter the uncertainty register rather than vanish.

## Validation applicability (O6)

Credit first: the executed-vs-proposed split is exemplary. "No runtime
checks... public web reads only... no qualified sandbox... Everything below
is a proposed discriminating validation" is exactly the honesty O6 asks
for, and each V-case names pass/fail signals. The smoke-then-V1–V6 spine is
a genuine acceptance structure, not a testing platitude.

Per-validation applicability:

- **V1 double-booking race: applicable, needs the tie-break (M4).** The
  concurrent-overlap case correctly discriminates DB truth from app-only
  checking, and the 23P01-to-friendly-message mapping is the right oracle.
  The offline variant is the right second case but under-specified as
  discussed. Applicability holds for Route B directly; for Route A it
  applies as configuration acceptance on the booking tool (exclusion
  becomes "tool's native conflict guarantee demonstrated under race") —
  the draft's "apply them as configuration" line anticipates this
  correctly.
- **V2 offline checkout: applicable, missing its conflict twin (M4).**
  Capture-vs-accept distinction and idempotent retry are the right oracles.
  Add V2b double-lend. Also applicable to Route A only if the chosen tools
  actually queue offline — which LibreBooking/Fab-manager/InvenTree/Grocy
  web UIs generally do not, a further Route A offline caveat the draft
  understates: Route A's offline story currently rests on a PWA the
  adopter must still build or on native clients (Grocy's mobile apps) that
  cover only the consumables half.
- **V3 hostile CSV: applicable with scoping (m4/m7).** The hostile fixture
  (delimiters, date ambiguity, leading zeros, uneven rows, formula cell,
  Windows-1252) discriminates pipeline from template correctly, and the
  fail signals (silent coerce, unexplained drops, name-overwrite) are the
  right ones. Reconcile the date policy first or the fixture's expected
  result is indeterminate.
- **V4 audit completeness: applicable with an oracle rule (m5).** The
  cross-journal walk (checkout → repair flag → checkin → consume → adjust →
  transfer) is the right shape, and the bulk/raw
  log-or-forbid clause plus pagination requirement carry the InvenTree
  lesson correctly. Name the independent event enumeration or "no gaps" is
  untestable.
- **V5 extension contract: applicable after de-circularizing (m6).**
  Versioned machine-readable errors with correct statuses and pinned
  shapes are the right oracles carrying the Grocy lesson. Restructure as
  old-client-vs-new-server plus static contract tests.
- **V6 two-site stock split: applicable after M1.** Per-site thresholds and
  traced transfers are the right oracles, but the concurrent-consume case
  must join the fixture or V6 certifies a journal that still races.

Scope discipline is good: "this small product brief, not unlimited
production guarantees" is honored — the Vs stay inside makerspace scale.
No validation is claimed as executed; none was.

## Source and lineage audit

- S01/S02/S04/S05/S06/S07/S08 (product homepages/repos): mutable-HEAD
  web-current citations with access timestamps are the honest choice for
  living product pages; excerpts in `sources/index.md` are bounded and
  identifying. No overclaim detected at the critic's sampling depth.
- S03 (MyTurn via Wikipedia URL): mismatched binding, see m8.
- S09 (PowerSync) / S10 (Postgres) / S13 (django-simple-history) / S14
  (Frictionless): appropriate primaries for the claims they carry. S10
  re-verified by direct fetch (C01): PostgreSQL current is 18, §5.5
  "Constraints" incl. §5.5.6 "Exclusion Constraints" exists as cited.
- S11 (dev.to pattern blog): secondary, correctly subordinate (m14).
- S12 (PouchDB): snippet-only after a 404'd deep fetch, honestly disclosed;
  the offline-conflict claims it carries (multi-revision merge need,
  live/retry) are load-bearing enough to want one successful primary fetch.
  Direction not disputed.
- S15/S16 (LibreBooking commit/issue): snippet-only, see M6. Commit subject
  confirmed (C02); details provisional.
- S17 (Grocy 4.7.1 changelog): re-verified verbatim (C03). All four claimed
  fixes match; the 4.7.0 auth-reorg context is consistent with the
  changelog trail.
- S18 (InvenTree PR #4541): re-verified (C04). Sales-order augmentation +
  #4488-new-writes/backfill-migration distinction match the PR record.
- Missing IDs: Supabase-offline survey and Open Fab Control, see M6/m9.
- Usage/billing null throughout: correct, nothing observed.

## Uncertainty handling

The draft's uncertainty register (§5) plus Section 3 user decisions is
genuinely good practice: conflict rate, sheet chaos, barcode appetite,
repair depth, WordPress existence, SaaS budget, room contention each map to
a default-that-ships-safely. The omissions in this critique's register
(member cross-site identity, tool site-binding, series/blackout/quota
scope, notifications, retention, hold expiry, import-run edges) should join
that register with the same treatment rather than being guessed. Where the
draft defers wording/SLA to staff (P3 conflict UX), that deferral is
correct — but M4's TTL/notification existence and M1/M5's enforcement
choices are architecture and cannot be deferred the same way.

## What holds up (fairness record)

To keep this critique honest about weight: the three-journal data model,
the exclusion-constraint backstop with half-open UTC ranges and 23P01
mapping, the tentative-offline/promote-on-sync split with server-mediated
transport, the journal-over-overwrite and pipeline-over-template and
state-machine-over-freetext replacements, the per-site stock discipline
with explicit units, the paginated-audit-from-day-one rule with
write-time causal links, the versioned-API lesson from Grocy 4.7.x, the
honest O6 executed/proposed split, and all six P dispositions are sound
and survive independent checking. The findings above are gaps inside a
correct structure, sized accordingly: close M1–M6 and the draft becomes
buildable; nothing found requires re-founding it.
