# Final — ER11 B-05 control reviser, case I05 (planning deliverable)

Stage: reviser. Method M14 v1 control. Case I05: regional interpreting
cooperative (26 interpreters, 4 coordinators, 3 counties, $4,200 first
release, browser-based, phone day-updates, six-week board review).

This is ONE coherent self-contained final covering the full brief scope
(O1–O6) and every exact P clause (P1–P6). It adjudicates each criticism
explicitly (accept / amend / reject / retain uncertainty) on evidence,
preserves supported discovery, useful mechanisms and alternatives,
conditions, user decisions, disagreements, and uncertainty in full prose —
predecessor IDs never substitute for material text.

Inputs inspected in full: brief (`cases/I05/brief.md`, 2310 bytes, sha256
`a2357f…abbe` verified against freeze); research `draft.md`, `discovery.md`,
`source-map.json`, `revealed-plan.md` (plan sha256 `aa7657a3…d57`);
critic `source-map.json` and `critique.md`; all research evidence S01–S12
and critic evidence C01–C12 (bounded copies in `sources/` + `index.md`).
Revealed 2026-10-09T20:26:16Z. No nested agents, no repo/canon edits, no
campaign/history/evaluator/counterpart read. No runtime witnesses exist or
are claimed (no qualified sandbox); §13 separates executed checks from
proposed work honestly.

Provenance note (honest gap): the saved `critique.md` (165 lines, sha256
`0e9f8051…4269` per freeze) ends mid-M5 with a literal truncation marker.
M1–M4 and the verdict summary are complete; M5 items 2+, and M6/M7 detail,
are repaired here from the summary's item lists (§3). Any finer critic
demands past the truncation point are retained as uncertainty, not assumed.

## 1. What the first release is

A browser-based cooperative scheduling ledger for 26 interpreters and 4
coordinators across 3 counties, buildable and operable inside $4,200, with
coordinators updating the day's schedule from a phone. It tracks request →
offer → acceptance → travel estimate → completion → invoice readiness,
marks requests honestly UNFILLED when no qualified interpreter exists,
makes double-offer impossible at commit time, shows each role only what it
needs (client names, meeting topics, AND interpreter availability are all
sensitive), records communication mode and access arrangements as
matchable requirements, and exports a six-week board review. It is not
payroll, not native apps, and carries no unlimited production guarantee.

R1 architecture (single store, §7): one PocketBase service owns every
collection including offers; all offer commits go through one serialized
idempotent transactional endpoint proven by a race test before acceptance.
Manual coordinator pick over an eligible-only list plus the commit guard is
the R1 assignment path; the Timefold advisory solver and self-hosted OSRM
routing are specified R2 candidates, not R1 scope. Travel estimates in R1
are declared values (duration + method + timestamp, honestly labeled),
not engine output.

## 2. Original constraints, disagreements, uncertainties (preserved)

- $4,200 first release; browser-based; coordinators update the day's
  schedule from a phone (mobile web, poor signal, small screen,
  interruptions).
- Sensitive: client names, meeting topics, interpreter availability.
  Interpreters receive only the details needed for an assignment.
- Current failure: two coordinators occasionally offer the same person to
  different clients (calls + shared calendar). A race, not a training
  issue; the fix is transactional/server-enforced, not a UI hint.
- Access: some interpreters use assistive technology; several clients
  require a specific communication mode or access arrangement. Pickers and
  matching must both be accessible; mode/arrangement is a matching
  constraint, not a note.
- Track: request, offer, acceptance, travel estimate, completion, invoice
  readiness — without becoming full payroll.
- Honest scarcity: a clear UNFILLED state that never implies a qualified
  interpreter is available. No silent queue, no "pending" read as
  "confirmed".
- Disagreement A: whether clients receive automated confirmations.
  Disagreement B: whether coordinators may reassign accepted work without
  asking the interpreter. Neither is resolved here; both ship as explicit
  toggles with safe defaults (§10).
- Board reviews the first six weeks before approving further spending →
  audit trail + reviewable metrics from day one.

## 3. Criticism adjudication log (every finding dispositioned)

Verdict key: ACCEPT (repair applied as asked), AMEND (repair applied with
stated change), REJECT (declined with evidence), UNCERTAIN (kept open with
what would resolve it). No criticism was obeyed automatically; each was
checked against the brief text and the inspected evidence.

### M1 — P6 travel "correction" overbuilds → ACCEPT with amendment

Critic: the brief requires *tracking* a travel-estimate value, not
operating a routing engine; value-in/rules-out is the consistent reading
of P6; a labeled coordinator-declared estimate ("45 min by car, declared
2026-10-09, unverified") is honest without any engine; mandating self-host
OSRM inside $4,200/six-weeks with no cost/ops evidence is overbuild.
Evidence for the challenge is the brief verb "track" among workflow items,
not computed outputs. AGREED — the draft never considered the
declared-estimate path, which is fatal to its "estimates are dishonest
without minimal rules" claim.

Repair applied: P6 keeps its SPLIT verdict but rescoped — CORRECTION = R1
tracks estimate value + method + timestamp (P6 cannot exclude the value);
OSRM self-host becomes an OPTIONAL enhancement alongside
Valhalla/GraphHopper/manual; R1 default is the declared estimate with
honesty labeling. V4 tests the manual path first; engine-backed V4 is the
enhancement gate. OSM coverage/buffer uncertainty moves to the
enhancement, unblocking R1.

AMENDMENT to the critic: the travel-honesty rules (label method +
timestamp, explicit null when unknown, never a disguised zero or crow-flies
masquerading as road time) are retained as part of the correction and
apply to the manual path too — they are not OSRM-specific. A declared
estimate with no method label or timestamp WOULD be dishonest under the
brief.

What would change this: brief text showing estimates must be
system-computed. It does not exist.

### M2a — Availability omission is a correction, not an enhancement → ACCEPT

Critic: the brief names THREE sensitive classes (client names, meeting
topics, interpreter availability) while P3 names two; the omission matches
the draft's own CORRECTION pattern (P1 travel omission, P2 detect-only)
and "enhancement" breaks category discipline. The C06 status-code mechanism
is confirmed correct; only the category is wrong. AGREED — same shape of
gap, same verdict. Repair applied: availability non-enumerability (no
enumerable availability, counts, or calendars visible to clients or other
interpreters; availability visible only to coordinators and the owning
interpreter) is promoted to CORRECTION on P3 (§4.3).

### M2b — State-varying redaction tier invented as required → ACCEPT

Critic: "exact address/access contact only after acceptance" appears
nowhere in the brief ("only the details needed for an assignment"); an
interpreter deciding whether to accept plausibly needs location to judge
travel, so the draft's tier could harm acceptance quality. AGREED — the
tier boundary is design invention presented as brief fidelity. Repair
applied: the need-to-know principle stays already-covered; the specific
tier rule is demoted to USER DECISION / UNCERTAIN with two explicit
options (full-address-at-offer vs approximate-at-offer/exact-at-accept),
coop-chosen at onboarding. V5 tests whichever tier the coop picks.

### M2/C07 — Realtime mirroring is builder work, not platform guarantee → ACCEPT

Critic (C07): PocketBase custom topics authorize by subscription
membership plus manual auth lookup; the docs do NOT state automatic
collection-rule inheritance for custom payloads. AGREED — confirmed from
the inspected C07 excerpts. Repair applied: "realtime topics mirror read
rules" stays scoped as builder obligation, and V5 now explicitly tests
custom-topic leakage (subscribe as interpreter, assert no
other-interpreter/client fields arrive) instead of assuming inheritance.

### M3 — Dual-store architecture unresolved → ACCEPT (one owner chosen)

Critic: draft requires Postgres exclusion for the ledger while proposing
PocketBase (embedded SQLite) as the backend, with no answer on store
ownership, cross-store commits, unified rules/auth, or dual ops cost; the
SQLite-queue alternative is named but empty. AGREED — "both, TBD" is not
an architecture. Repair applied in §7: R1 has ONE ledger owner —
PocketBase owns everything including offers; every offer commit passes
through one serialized idempotent transactional endpoint (overlap check +
insert atomic, idempotency key deduped), proven by the V1 race test before
acceptance. There is therefore no cross-store seam, no split auth, and no
dual backup/migration bill in R1 — the critic's open questions are
resolved by construction, and §7 records the explicit choice with reasons
plus the specified Postgres hardening path (predicate form per C03) if V1
ever fails or the builder already operates Postgres.

### M4 — Solver disproportionate; secondary claims unevidenced → ACCEPT with amendment

Critic: a JVM solver service (domain modeling, constraint authoring,
time-box tuning, pilot calibration) alongside OSRM self-host and dual
stores does not fit 26 interpreters / $4,200 / six weeks with no
staffing/cost/schedule evidence; manual pick over an eligible-only list +
commit guard fully satisfies the brief handshake and race fix. AGREED.
Repair applied: Timefold advisory ranking is demoted to R2 candidate /
R1-spike-optional; "manual pick + guard, no solver in R1" is promoted to
the R1 primary; fairness becomes a displayed least-recent/least-count
discipline (per the confirmed C11 pair) rather than an optimizer.

AMENDMENT to the critic: the hard-constraint *principle* is retained in
R1 as filter logic, not deferred with the optimizer — the eligible-only
list excludes unqualified/unavailable/overlapping/travel-infeasible
interpreters BEFORE any fairness ordering, as a testable invariant (V7).
What is deferred is the optimization engine, not feasibility gating.

Evidence gaps: (a) "Python solver significantly slower" — unevidenced at
both stages → DROPPED, no R1 position needed. (b) Shift-as-entity /
Employee-as-variable modeling — critic did not re-fetch → SOFTENED to
"typical rostering shape, verify at R2 design". (c) feasibility-before-
fairness ordering → ACCEPTED as explicit testable invariant in V7.

### M5 — Missing R1 mechanisms → ACCEPT (repaired; truncation uncertainty retained)

Critic: at least eight/nine brief-driven R1 mechanisms undesigned
(availability input [fully visible]; intake, notification channel,
auth/roles, idempotency mechanism, phone/offline resilience,
invoice-export schema, cost breakdown, deployment [from summary — detail
past the truncation point unrecoverable]). The visible item-1 charge is
just: neither draft nor discovery says how interpreters declare
availability. AGREED. Repair applied: §6 specifies a minimal R1 answer
for each of the nine, each shippable without new infrastructure.
UNCERTAINTY RETAINED: finer critic demands past the truncation marker
cannot be recovered; if the full M5 text resurfaces, each item must be
re-checked rather than assumed satisfied.

### M6 — Source-method gaps → ACCEPT

Critic (from summary + inspected C-files): snippet-only S10 now
C10-verified; `/current/` mutability; `/latest/` mismatch; truncation.
AGREED on all four, each verified in the inspected evidence: (1) C10 is a
full primary fetch of the history page — adopted as the lineage authority,
superseding S10 snippets; its TWO qualifications are honored (exact fork
date 2023-04-20 is NOT on the page → final says "2023" and flags the date
as README-pin-needed; "100+ fixes" is the project's own attributed claim,
not an audit). (2) C01–C04 pin `/18/` — preferred over S02–S04 `/current/`.
(3) C09's URL uses `/latest/` though its header pins 2.7.1 — versioned URL
must be pinned before build; same for C08 master (pin a v5.x tag).
(4) C12/S12 APG excerpts truncate before full keyboard/forms detail, S01
is a truncated 73297-byte fetch — re-read untruncated before build. All
recorded as build conditions (§8) and in `sources/index.md`.

### M7 — Three validations need rescoping → ACCEPT (all three)

- V3 (history-vs-active): C03 proves `EXCLUDE … WHERE (predicate)` is
  supported syntax → the draft's "predicate uncertainty" is reduced to a
  build-time proof test, with the split-table shape kept as fallback.
  ACCEPTED; V3 rewritten accordingly (and now gates the Postgres
  hardening path rather than R1).
- V5 (least-privilege matrix): custom-topic rule inheritance is NOT a
  platform guarantee per C07 → V5 must explicitly test custom-topic
  leakage. ACCEPTED; V5 rewritten.
- V10/V11 (mechanisms undefined): idempotency mechanism and export schema
  were unspecified → now specified in §6, and V10/V11 test those
  mechanisms. ACCEPTED; both rewritten.

No criticism was rejected outright: every finding either identified a real
scope/proportion defect (M1–M5, M7), a real evidence-hygiene gap (M6), or
confirmed draft content worth preserving (P2 correction, P5 toggles,
UNFILLED honesty, access pattern, comparator, O3 chains — all retained).

## 4. Exact per-P disposition (post-adjudication)

Categories: already-covered, correction, optional enhancement, user
decision, rejected, uncertain. P1–P6 quoted verbatim from
`revealed-plan.md`.

### P1: "Track an assignment from request through offer, acceptance, completion, and invoice readiness."

Verdict: already-covered in structure, CORRECTION on omission.

- Already-covered: the five-state spine matches the brief and is
  retained: REQUESTED → OFFERED → ACCEPTED → COMPLETED → INVOICE_READY,
  plus history states DECLINED/EXPIRED/CANCELLED and terminal-honest
  UNFILLED with reason + next-review time.
- Correction: P1 omits travel estimate, but the brief explicitly requires
  tracking "request, offer, acceptance, travel estimate, completion, and
  invoice readiness". The estimate is a first-class tracked attachment
  (duration + method + timestamp, per M1 repair declared in R1), never
  out-of-scope. State model attaches the estimate as an annotation on
  ACCEPTED (or on OFFERED when pre-estimated and labeled preliminary),
  never as a holder change.
- Optional enhancement (R2): solver-advisory ranking of eligible
  interpreters with reason codes; coordinator still commits. Advisory-only
  and deferred per M4 — NOT R1.
- Rejected: auto-assignment without coordinator review; payroll fields in
  the ledger.
- Uncertain: whether travel preview attaches pre-acceptance (to inform
  offer choice) or post-acceptance only; both supported, pre-acceptance
  labeled preliminary.

### P2: "Detect overlapping offers and accepted assignments across coordinators."

Verdict: CORRECTION (detect → prevent), with detection retained as UX.
(Critic confirms the correction is valid; M3 repair changes only the
enforcement substrate.)

- Correction: detection alone does not fix a commit race; two
  coordinators can both pass detection then both commit. The invariant is
  enforced at commit time: one holder per interpreter over any overlapping
  active period. R1 mechanism: every offer commit passes through ONE
  serialized idempotent transactional endpoint in the single store — the
  overlap check and the insert are atomic, and a client-supplied
  idempotency key makes retried submits safe. Concurrent double-offer
  yields exactly one commit; the loser gets an "already offered" error
  naming the conflict, never a silent overwrite. Proven by V1 before
  acceptance; if V1 fails, the Postgres hardening path (§7) is taken.
- Already-covered: cross-coordinator overlap visibility (day board,
  interpreter timeline, conflict warning before submit) is retained as the
  detection/UX layer above the commit guard.
- Conditions: periods include setup/teardown/access buffers; travel gaps
  are part of feasibility (P6 interaction); back-to-back bookings must not
  collide (half-open `[)` semantics — adjacency proven by V2).
- Uncertain (reduced by C03): the Postgres partial-exclusion predicate
  form `EXCLUDE … WHERE (status IN ('offered','accepted'))` is confirmed
  supported syntax; it is a build-time proof test (V3) on the hardening
  path, not a design blocker.

### P3: "Limit client and meeting details to the coordinator and assigned interpreter roles that need them."

Verdict: already-covered in intent; CORRECTION on availability (M2a);
optional enhancements on completeness; USER DECISION on disclosure tiers
(M2b).

- Already-covered: coordinators see full request/offer detail; assigned
  interpreters see only the minimal assignment detail; locked-by-default
  server rules opened narrowly per role; the need-to-know principle.
- Correction: interpreter *availability* is sensitive too — the brief
  names it alongside client names and meeting topics, and P3's silence is
  a gap of the same kind as the P1 travel omission. No enumerable
  availability, counts, or calendars visible to clients or other
  interpreters; availability is visible only to coordinators and the
  owning interpreter.
- Enhancements (required for brief fidelity): (a) list endpoints return
  empty (not existence-leaking errors) when rules are unsatisfied, matching
  the confirmed rule semantics (list→200-empty, view/update/delete→404,
  locked→403, create→400); (b) realtime topics mirror read rules as an
  explicit builder obligation with per-topic tests — NOT assumed from the
  platform (M2/C07); (c) errors, URLs, exports, and logs carry the same
  redaction.
- User decision: the disclosure tier boundary — full-address-at-offer vs
  approximate-at-offer/exact-at-accept — is coop-chosen at onboarding
  (M2b); so is whether clients get any portal/status view at all (if yes,
  own request status only, including honest UNFILLED, never interpreter
  identity/availability).
- Rejected: client-side-only filtering; per-role UI hiding without server
  enforcement.

### P4: "Record communication mode and access arrangements as structured assignment requirements."

Verdict: already-covered, with matching + accessibility enhancements.
(No critic challenge; retained with M4 feasibility invariant made
explicit.)

- Already-covered: mode and arrangements are structured fields
  (controlled vocabulary + free-text detail), not notes. Exact tokens from
  the request are preserved verbatim into offer and assignment — no
  paraphrase that loses an access need.
- Enhancements: (a) mode/arrangement/skill/language/availability/
  overlap/travel-feasibility are HARD match constraints — unqualified
  interpreters are ineligible and excluded BEFORE any fairness ordering
  (explicit testable invariant, V7); UI shows eligible-only pickers with
  reason codes for the rest; (b) pickers follow the W3C
  combobox→listbox→option pattern with keyboard (open/move/select/close),
  `expanded/controls/activedescendant` states, visible focus, label
  association, and text errors, so assistive-tech interpreters operate the
  same tool; no custom div dropdowns without this contract.
- Uncertain: the exact controlled vocabulary for modes/arrangements must
  come from the cooperative + clients (no invented clinical terms); R1
  ships a coop-editable list plus the verbatim detail field.

### P5: "Automated client confirmations and reassignment authority are cooperative policy decisions."

Verdict: already-covered + USER DECISIONS with safe defaults (no
unilateral resolution). (Critic confirms valid; retained unchanged.)

- Already-covered: both items are explicit coop choices, not technical
  defaults. R1 ships both as per-coop (and per-client for confirmations)
  toggles with audit.
- Safe defaults (reversible, logged): confirmations default OFF — no
  automated client message until the coop opts a client in, then exactly
  one templated message per transition; reassignment defaults to
  ASK-FIRST — accepted work is reassigned only with interpreter
  acceptance, unless the coop explicitly enables coordinator-override with
  mandatory reason + interpreter notice + log entry.
- Retained disagreement: members disagree on both; this final preserves
  the disagreement and the toggle, and the six-week export reports
  confirmation mode per client and override counts so the board decides
  with data.
- Rejected: silent auto-confirm; silent reassignment; override without
  notice/log.

### P6: "Travel estimation rules and any payroll connection are outside the defined first release."

Verdict: SPLIT — payroll part already-covered; travel part CORRECTION on
the value + OPTIONAL enhancement on engines (M1 repair).

- Already-covered (payroll): no payroll computation, no payroll
  connection, no pay export. INVOICE_READY is a flag + case export
  (assignment, completion proof, agreed rate reference — schema in §6)
  that a separate payroll process consumes. Correct and retained.
- Correction (travel value): the brief requires tracking a travel
  estimate, so "travel estimation rules … outside" cannot exclude the
  estimate *value*. R1 tracks per accepted (optionally per offered,
  labeled preliminary) assignment: duration + distance-optional + method +
  timestamp, declared by the coordinator (or computed later) and honestly
  labeled — method + timestamp mandatory, unknown rendered as explicit
  null + human review, never zero or disguised crow-flies.
- Optional enhancement (R2): engine-backed estimates — self-hosted OSRM
  Table/Route over a 3-county extract (car profile unless coop says
  otherwise), fastest-route semantics disclosed, unroutable → explicit
  null + human review, labeled crow-flies fallback only with speed +
  coordinate choice, per-day matrix cached, estimate never silently
  changes holder or state. Valhalla/GraphHopper remain alternatives.
- User decisions: routing profile (if engine adopted), buffer minutes
  (parking/check-in/access), fallback policy, who may override an
  estimate, and whether pre-offer travel preview is wanted.
- Uncertain: OSM coverage/quality for the three counties and true
  access-time buffers — moved to the enhancement gate (measured in pilot,
  V4-engine), no longer blocking R1.

## 5. Retained findings (O1 discovery + O2 source behavior, rescoped R1/R2)

Six materially different mechanisms were discovered beyond a thin CRUD
calendar (O1). Each is retained below with its consequential
primary-source behavior, defaults, units/types, limits, and applicability
(O2) — but rescoped by the M1/M3/M4 repairs into R1 scope vs specified R2
candidates. Demotion is not deletion: the R2 seeds stay specified.

D1. Eligibility filtering now, constraint-solver optimization later
(Timefold lineage). R1 keeps the hard-vs-soft *framing* as list logic:
hard feasibility filters (qualified skill/mode/access, availability,
no overlap, travel-feasible gaps) gate the eligible-only list, and a
displayed fairness discipline (least-recent vs least-count toggle, per
the confirmed availability-vs-fairness pair) orders it — feasibility
always before fairness (V7 invariant). The Timefold advisory optimizer
itself is an R2 candidate: constraint streams as incremental score
calculation, hard penalties for infeasible matches, soft scores for
travel/fairness, score explanation with justifications, fairness/
load-balancing guidance available, embeddable as a library
(Quarkus/Spring) or run as a REST service, time-boxed to seconds for
interactive use, incremental re-solve for short-notice changes. New
solver work targets Timefold 2.x, never OptaPlanner 8 (Red Hat
end-of-support → 2023 Apache-2.0 fork → monthly 2.x releases; the exact
fork date needs a README pin and is not stated here). Dropped: any
Python-vs-Java speed claim (unevidenced); softened: entity/variable
modeling guidance to "typical rostering shape, verify at R2 design".

D2. Declared travel values now, self-hosted routing matrix later (OSRM).
R1 tracks coordinator-declared estimates with mandatory method +
timestamp labeling (§4 P6). The engine path is specified for R2:
request `/{service}/v1/{profile}/{lon},{lat};…`, profile fixed at
extract time (car|bike|foot), lon-lat order (NOT lat-lon),
fastest-route durations/distances (NOT shortest-distance), durations in
seconds and distances in meters, row-major `durations[i][j]` /
`distances[i][j]`, `null` when unroutable, `annotations` default
`duration` (request `duration,distance` for both), explicit
`fallback_speed` + `fallback_coordinate` + `scale_factor` family for
synthesized crow-flies (never silent), HTTP keep-alive ≤512 requests
per connection with ≤5s between requests, demo server
prototype-only — production means self-hosted Docker plus a local OSM
extract for the 3 counties plus a per-day matrix cache. Travel gap =
duration + buffer (parking/check-in, access arrangement); unroutable →
human review, never zero.

D3. Commit-guard invariant, R1 substrate serialized endpoint (Postgres
exclusion specified as hardening). The invariant — one holder per
interpreter over any overlapping active period, enforced at commit
time, loser gets a naming conflict error — is unchanged. R1 enforces it
through the single store's serialized idempotent transactional endpoint
(§7). The Postgres form is fully retained as the specified hardening
path: `tstzrange` periods with half-open `[)` (constructor default;
adjacent `[)` ranges do NOT overlap while `[]` collides at shared
endpoints), `EXCLUDE USING GIST (interpreter_id WITH =, period WITH
&&)` (error `exclusion_violation`, SQLSTATE 23P01), `btree_gist`
required for scalar `=` on uuid/text/int inside GiST (trusted
extension, installable by non-superuser with CREATE on the database),
scoped to committable states via `WHERE (status IN
('offered','accepted'))` — confirmed supported CREATE TABLE syntax —
so history never blocks future booking, with travel/setup/teardown/
access buffers inside the range. Split-table (active holds vs history)
kept as fallback shape.

D4. Single-binary backend with locked-by-default API rules + realtime
(PocketBase) — R1 PRIMARY. One `./pocketbase serve` provides embedded
SQLite + REST-ish API + realtime + auth + admin (`/_/`); observed
v0.40.5 (~11–12MB zips); pre-1.0 means no full backward compatibility
is promised and production use requires reading the changelog and
applying manual migration steps — version pinned, every upgrade
re-tests auth, rules, realtime, and the race suite. Rules: 5 per
collection (`listRule/viewRule/createRule/updateRule/deleteRule`) plus
`manageRule` on auth collections; defaults locked (null) = superuser
only; empty = anyone; non-empty = filter expression, and rules ARE
filters. Confirmed status mapping: list-unsatisfied → 200 empty;
create → 400; view/update/delete → 404; locked + non-superuser → 403;
superuser bypasses all. Realtime: default events only for record
create/update/delete (+OAuth2 redirect); custom messages via the
subscriptions broker with per-topic subscription checks; auth record
looked up per client; one user routinely has multiple clients
(tabs/devices) so UI must be idempotent; custom topics do NOT inherit
collection rules automatically — mirroring is builder work with
per-topic tests (V5). I05 mapping: coordinators full on
requests/offers; interpreters only own offers plus minimal assignment
fields via view rule + field projection, no client-topic bulk list, no
availability enumeration; clients (if any portal) only own request
status, never interpreter identity/availability.

D5. Team scheduling as buy-vs-build comparator (Cal.com
round-robin/collective) — retained. Round-robin assigns among available
members by least-recently-booked (availability) or
least-bookings-for-event-type (fairness); fixed hosts blend collective
+ round-robin. It informs the R1 fairness toggle but cannot replace the
ledger: no skill/mode/access matching, no travel feasibility, no
offer→accept handshake, no need-to-know redaction, no UNFILLED honesty,
no invoice readiness. If adopted later for a public intake surface, it
sits IN FRONT OF the ledger, never instead of it.

D6. Accessible picker pattern (W3C APG combobox→listbox→option) — R1
REQUIRED. All staff pickers (interpreter/client/language/mode/site)
follow the canonical pattern: `combobox` input controls a `listbox`
popup of `option`s; `aria-expanded/controls/activedescendant/
autocomplete` states; focus in the input; keyboard contract (Down
opens, Escape closes, Enter selects, arrows move); select-only vs
editable-with-filtering chosen per picker; collapsed by default;
visible focus, label association, and text errors (never color-only).
No custom div dropdowns without this contract. (Full keyboard/forms
detail must be re-read untruncated before build — excerpts truncated.)

Rejected-as-primary alternatives (retained): full payroll; native apps;
commercial distance API as default (billing risk); haversine-only
travel (misstates road/time); Yjs/CRDT collaboration (wrong fix for a
commit race); OPA sidecar (overkill for 4 coordinators — collection
rules or Postgres RLS suffice).

## 6. R1 mechanisms specified (M5 repair — minimal shippable answers)

Each brief-driven mechanism the draft left undesigned gets one minimal
R1 answer. Each ships without new infrastructure; each names its test.

1. Availability input. Interpreters declare availability as recurring
   weekly hours plus exception/blackout dates on a simple grid;
   interpreters edit their own, coordinators may edit any interpreter's
   (logged with reason). Availability is visible only to coordinators
   and the owning interpreter (M2a correction) and feeds the
   eligible-only filter. Tested by V5 (non-enumerability) + V7
   (availability as hard filter).
2. Intake. R1 intake is coordinator-entered: calls are transcribed into
   the request form (client, language, mode/arrangements with verbatim
   tokens, time window, site, request type, review SLA). No public
   intake surface in R1; a Cal.com-style front end is an R2 option.
   Tested by V11 (request-to-export traceability).
3. Notification channel. Minimal default: in-app notification plus email
   to the interpreter on offer / acceptance-confirm / reassign / cancel;
   coordinator chooses the channel set at onboarding; SMS only if the
   coop opts in and funds it. Every automated message is logged with
   template + recipient + trigger; client confirmations additionally
   gated by the P5 per-client toggle (default OFF). Tested by V9.
4. Auth and roles. Three roles plus admin: coordinator (full on
   requests/offers/availability), interpreter (own offers + minimal
   assignment fields + own availability), client-viewer (optional; own
   request status only), superuser/admin (coop admin via `/_/`, bypasses
   rules, used for onboarding/toggles only). Phone-friendly sessions;
   locked-by-default rules opened narrowly per role with a per-role test
   row. Tested by V5.
5. Idempotency mechanism. Every offer-commit request carries a
   client-generated UUID idempotency key; the server keeps a key→result
   record and returns the stored result for replays instead of
   re-executing. Retried submits (phone timeouts, double taps) never
   duplicate holds. Tested by V10.
6. Phone and degraded-network behavior. Responsive mobile web for the
   coordinator day board (re-time, re-offer, mark unfilled, complete);
   optimistic UI with explicit pending/failed states, retry reusing the
   same idempotency key, live updates to other coordinators on
   reconnect. Full offline queueing is explicitly R2; R1 promises no
   lost writes and no silent state on throttled networks, not offline
   operation. Tested by V10.
7. Invoice-export schema. INVOICE_READY remains a flag + case export,
   never computed pay. CSV columns: `assignment_id, request_id,
   interpreter_ref, client_ref, language, mode, site,
   start_at, end_at, travel_estimate_method, travel_estimate_duration_s,
   completed_at, completed_by, agreed_rate_ref, invoice_ready_at,
   invoice_ready_by`. No pay fields; the separate payroll process
   consumes this file. Tested by V11.
8. Cost envelope ($4,200, planning estimates — coop validates). Build
   labor is the bulk (fixed-scope R1 per this plan); recurring costs are
   small by design: single small VPS (~tens of dollars/month), domain +
   TLS (~$0–15/year with automated certificates), email delivery
   (provider free tier or tens of dollars), SMS only if opted in
   (usage-billed, capped), plus a contingency reserve for one
   PocketBase-version upgrade cycle inside the six weeks. No per-seat
   SaaS, no routing-API billing, no solver hosting in R1 — the M1/M3/M4
   demotions are what keep the envelope credible. Single-binary
   deployment with one-file backup is the coop-supportability story.
9. Deployment. One VPS running the pinned PocketBase binary behind a
   reverse proxy with automated TLS; nightly backup of the data file +
   config to coop-controlled storage; health check on the API;
   version-pinned upgrades with changelog read and staged re-test of
   auth/rules/realtime/race suite; admin UI for onboarding, toggles, and
   the six-week export. No second datastore, no container fleet, no
   solver or router service in R1.

## 7. Architecture decision (M3 repair — one owner, seam specified)

R1 ledger owner: PocketBase (single store). Every collection —
requests, offers/holds, interpreters, availability, estimates, audit
events, idempotency keys — lives in the one embedded store behind the
one rule matrix and the one realtime broker. Every offer commit passes
through ONE serialized idempotent transactional endpoint: the overlap
check and the insert are atomic, the idempotency key is deduped, and
the endpoint is the only writer of holds. V1 (double-offer race) must
pass before acceptance; adjacency (V2) and history-vs-active scoping
(V3-shape adapted: history rows never block) prove the bound and
predicate choices.

Why this owner (explicit choice with reasons): (a) $4,200 and
coop-supportable favor one binary, one backup file, one admin UI over
two datastores with two backup/migration/version-pin bills; (b) four
coordinators produce tiny contention, so a serialized endpoint closes
the observed race deterministically at this scale; (c) auth, rules,
admin, and realtime stay unified — no cross-store seam to design,
secure, or operate; (d) the six-week window favors the path with the
fewest moving parts. There is therefore no cross-store consistency,
split-auth, or dual-ops question open in R1 — by construction.

Promoted candidate not chosen (with reasons): Postgres + row-level
security + custom API as the single store. Stronger ledger primitives
(exclusion constraint as DDL rather than endpoint discipline) and no
pre-1.0 dependency — but it rebuilds auth/admin/realtime the team gets
for free, needs Postgres hosting/operation the coop must support, and
costs more of the six weeks. It is the specified hardening path, not
the R1 primary: if V1 fails on the endpoint, or the builder already
operates Postgres, offers/holds move to Postgres with the C03 predicate
form, PocketBase (if kept) owns non-ledger collections only, and the
seam is drawn once, in one direction — ledger writes commit in
Postgres first, PocketBase mirrors read state via hook, and a failed
mirror never un-commits the hold (reconciliation job replays it).
That seam is specified but NOT built in R1.

What would change the R1 choice: V1 failing after good-faith endpoint
hardening; coop staff already fluent in Postgres operations; or board
approval post-six-weeks funding the stronger ledger.

## 8. Conditions

- One store owns holds in R1; the serialized idempotent commit endpoint
  is the only writer; V1 must pass before acceptance.
- Solver advisory-only framing retained as list logic; the optimizer is
  deferred until the board approves post-six-week spend.
- PocketBase version pinned (observed v0.40.5); every upgrade re-tests
  auth, rules, realtime, and the race suite (pre-1.0 breaking pattern).
- OSRM/engine adoption needs a pinned release (pin a v5.x tag, not
  master), a chosen profile + county extract + cache; demo server never
  in the production path. Timefold adoption pins a versioned docs/code
  URL (not `/latest/`).
- Confirmation/reassignment toggles set explicitly at onboarding;
  defaults (off / ask-first) apply until the coop records otherwise.
- Source hygiene before build: prefer pinned `/18/` Postgres URLs;
  re-read the APG combobox pattern untruncated; fork date "2023" unless
  the README pin is checked; "100+ fixes" stays attributed, not audited.
- Estimates always carry method + timestamp; unknown renders as explicit
  null + human review.

## 9. Alternatives retained

- Postgres RLS + custom API as the single store (promoted candidate /
  specified hardening path, §7).
- Valhalla/GraphHopper instead of OSRM for engine-backed estimates
  (richer costing/profiles, heavier operations).
- Timefold advisory ranking in R2 with the hard-vs-soft framing kept
  warm in R1 list logic (fairness toggle least-recent vs least-count vs
  least-hours, coop-chosen).
- Cal.com (or equivalent) as a public intake surface in front of the
  ledger, never as the ledger.
- Manual declared estimates retained permanently as fallback even after
  engine adoption (override path with re-labeling).
- Full offline queue and SMS-by-default notifications as funded R2
  options, not R1 promises.

## 10. Optional capabilities and user decisions

- Capabilities: pre-offer travel preview (labeled preliminary);
  fairness toggle (least-recent vs least-count vs least-hours); client
  status portal (own-status-only, UNFILLED shown honestly); six-week
  board CSV (fill rate, time-to-offer/accept, estimate-method mix,
  override counts, no PII); R2 engine estimates; R2 solver ranking.
- Decisions for the cooperative (blocking R1 config, not build):
  confirmation policy per client; reassignment override enablement;
  fairness definition; disclosure tier boundary
  (full-address-at-offer vs approximate-at-offer/exact-at-accept);
  estimate buffers + fallback + who may override; mode/arrangement
  vocabulary; UNFILLED review SLA per request type; notification
  channel set; client portal yes/no.

## 11. Uncertainty

- Disclosure-tier choice (M2b) and whether pre-acceptance travel preview
  is wanted — coop decisions, tested after choice (V5/V4).
- Exact partial-exclusion behavior on the hardening path — reduced by
  C03 to a build-time proof test (V3), split-table fallback kept.
- PocketBase concurrency under simultaneous offers — closed by V1
  pass/fail, not by assumption.
- OSM coverage + buffer truth — moved to the engine enhancement gate
  (V4-engine), measured in pilot.
- Mode/arrangement vocabulary correctness — coop + clients supply it.
- Pilot volumes for any future solver time-boxing — R2 measurement.
- Finer M5 critic detail past the truncation marker — unrecoverable;
  re-check against the full text if it resurfaces.
- None of the above blocks R1; each blocks a silent assumption.

## 12. O3 — Issue/fix/regression/release chains (observed)

C1. Timefold fork lineage (primary: C10 page fetch, superseding S10
snippets). OptaPlanner created 2006 (Apache-2.0) → Red Hat full-time
sponsorship from 2013 → IBM acquisition 2019, OptaPlanner support
dropped 2022 → active development halted by 2023 → Red Hat EOL
announced 2024 (KIE 10.x toolchain-only, no fixes/features) → De Smet
co-founded Timefold, forked OptaPlanner as Timefold Solver in 2023
(Apache-2.0), core engineers followed → monthly Timefold 2.x releases
with 100+ bug/security fixes claimed (project's own claim, attributed,
not audited). Consequence: any future solver work targets Timefold
2.x, never OptaPlanner 8; budget migration-guide review at R2 design.
Absence note: no specific solver regression reproduced here (no
runtime); this chain is release lineage, not a single bug.

C2. PocketBase pre-1.0 breaking pattern (observed, S05+S08, C05).
Docs warn manual migrations are expected before 1.0. Observed
changelog callouts: console error/exit-code propagation
(chained-command breaking risk), JSVM migration hardening,
migration-deadlock fix (#7836), hooks withheld to avoid breaking.
Consequence: pin v0.40.5, stage upgrades, re-test
auth/rules/realtime/race per bump. Absence note: the v0.23 admin-auth
change cited in secondary summaries was NOT in the fetched changelog
window at either stage; not claimed as primary.

C3. Absent/inapplicable (honest): no Postgres exclusion regression
relevant to I05 found in scope; no OSRM routing regression
reproduced; Cal.com/W3C chains not pursued as issue chains (stable
docs, no bug needed for their narrow roles). No evidence invented.

## 13. Validations — executed vs proposed (O6, discriminating, no pretense)

Executed (read-only; NO runtime witnesses — no qualified sandbox exists
or is claimed):

- E1. Read brief + input-map + freeze; verified byte/hash consistency of
  all seven frozen inputs against freeze.json (all match, §1
  provenance).
- E2. (Predecessor, inspected.) Located and fetched primaries S01–S12
  then C01–C12; recorded URL/version/locator/timestamp/operations;
  saved bounded excerpts + indexes. Reviser retained verbatim copies in
  `sources/` and verified the C03 predicate form, C07 topic-gap, and
  C10 lineage qualifications by reading the excerpts.
- E3. Static cross-checks (predecessor + critic, reviser-verified):
  OSRM units/defaults vs travel need; `[)` vs `[]` adjacency;
  locked-default vs least-privilege; hard-vs-soft vs brief constraints;
  Cal.com availability-vs-fairness definitions; APG roles/keyboard;
  status-code mapping; fork lineage against the primary page.
- E4. Post-reveal: quoted P1–P6 exactly; dispositioned each (§4)
  without rewriting discovery; adjudicated every criticism (§3).

Proposed (each fails a real defect; scope is this small product, not
unlimited guarantees):

- V1 double-offer race: concurrent overlapping offers for one
  interpreter → exactly one commits, other sees a naming conflict; no
  partial holds, no duplicates on retry (idempotency key). Gates R1
  acceptance; failure routes to the Postgres hardening path.
- V2 adjacency: 10:00–12:00 + 12:00–14:00 both commit (half-open
  bounds); proves the bound choice.
- V3 history-vs-active (rescoped per C03/M7): declined/expired/cancelled
  overlaps do not block; offered/accepted do. Predicate form confirmed
  supported — this is now a build-time proof test (split-table kept as
  fallback), gating the hardening path.
- V4 travel honesty (rescoped per M1/M7): manual path first —
  declared → labeled with method + timestamp; override → re-labeled;
  unknown → explicit null + human review; zero/crow-flies disguise
  impossible. Engine gate (enhancement only): routable → seconds/meters
  + labeled method; unroutable → null + review; profile change moves
  durations materially.
- V5 least-privilege matrix (rescoped per M2/M7): interpreter sees own
  minimal offers only, per the coop-chosen disclosure tier; no
  enumeration of clients/topics/availability via list/counts/realtime/
  errors/URLs; custom-topic subscription as interpreter yields no
  cross-fields (explicit leakage test, no inheritance assumed);
  coordinator full; client own-status-only; status-code mapping
  verified (200-empty/400/404/403).
- V6 assistive-tech walkthrough: keyboard-only picker operation
  (open/move/select/close), screen-reader announcements
  (expanded/selected/error), visible focus, text errors. Fails custom
  divs.
- V7 mode fidelity + feasibility ordering: exact request tokens verbatim
  in offer/assignment; unqualified match impossible (hard fail with
  reason); ineligible interpreters excluded BEFORE fairness ordering
  under every fairness toggle setting.
- V8 UNFILLED honesty: unfilled renders as unfilled + reason + review
  time; zero misread as available/confirmed in user test; no auto-flip.
- V9 disagreement toggles: confirmations off → zero client messages; on
  → exactly one template per transition, logged; reassignment ask-first
  vs logged override with reason + notice.
- V10 phone day-update (mechanism now specified): coordinator
  re-times/re-offers from mobile viewport on throttled network; live
  update reaches others on reconnect; retried submit reuses the
  idempotency key and never duplicates; explicit pending/failed states,
  no silent loss.
- V11 six-week export (schema now specified): board CSV with the §6
  columns reproduces fill rate, time-to-offer/accept, estimate-method
  mix, and override counts from the event log, with no PII.

## 14. Close

This final keeps what the evidence supports (commit-guard invariant,
need-to-know redaction with availability corrected in, verbatim access
tokens, canonical access pattern, honest UNFILLED, policy toggles with
safe defaults, confirmed source facts, honest O3 chains), demotes what
the envelope cannot carry (routing engine and optimizer become specified
R2 candidates with their R1 seeds kept warm), resolves the architecture
to one store with one proven commit path, specifies the nine missing R1
mechanisms minimally, and tests everything discriminatingly — with
executed checks and proposed work never confused. Discovery was frozen
before reveal and is preserved through its carried findings; the draft's
sound core survives; every criticism is answered on the record in §3.
