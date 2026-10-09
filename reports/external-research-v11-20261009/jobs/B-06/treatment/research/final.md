# I06 Final — Community radio planning & handoff aid (post-critic, self-contained)

Case: I06 | Block B-06 / treatment / research | Method M14 (Muse retained investigator, one
native Goal from discovery through this final)
Brief: `cases/I06/brief.md`. Revealed plan: `revealed-plan.md` (P1–P6).
Predecessors: `discovery.md` (frozen pre-reveal, SHA-256
`7ef31fd1149bffa534d35c46fb6d2f3baa1ae6bac1336107fb4fdc0b20761cbd`, unchanged since
`plan-reveal.json`), `draft.md` (SHA-256 `d71f44e6af1862098e507c47a0c138c833532079ce6c007bbdf7f4db8f9c9d9f`,
identical to the copy the critic reviewed), `source-map.json` (investigator IDs S01–S19,
SHA-256 `4347b11799926c1bf0cde13f4aa79071d43f862e17ba1e6718978c003ea2962e`).
Critic: `../critic/READY.json` (frozen 2026-10-09T20:48:08Z, mechanical-only) verified by hash
— `critique.md` `754a1ce1…b875`, critic `source-map.json` `68c32f3b…d613`, both matched before
reading. Only the two READY-named files were read from the critic stage.
This final dispositions every critic demand with evidence (§9), corrects the defects the critic
proved (notably the Owner-export flaw and the discovery citation-alias errors, §10), and carries
the full scope — findings, conditions, alternatives, optionals, user decisions, uncertainty, and
validations — in complete prose. Nothing here replaces text with IDs.

## 0. Reading guide and integrity notes

- §1 gives the corrected exact per-P disposition (every P1–P6 with a verbatim verdict).
- §2–§8 are the durable planning substance. §9 dispositions the critique demand-by-demand.
  §10 is the source-ID alias correction table (frozen `discovery.md` is not rewritten, so the
  correction lives here). §11 checks obligations O1–O6. §12 states boundaries.
- Citation practice in this final (per the sustained traceability finding): every factual claim
  cites a stable URL/locator directly alongside its source ID, so no claim depends on an ID
  label alone. Investigator IDs S01–S19 resolve in the frozen `source-map.json`; critic IDs
  (`CR-*`, `SP-SCHEDULE`, `GS-OFFLINE`, `GS-HISTORY`, `LT-*`, `BR-*`) resolve in the frozen
  critic `source-map.json` and are attributed as critic-observed, not independently verified by
  the investigator (only the two READY-named critic files were read).
- Integrity (kept with dates, per sustained minor finding): no legal research was done (D2 must
  not be invented); usage/billing behaviour was unobserved everywhere (all
  `usage_billing_observed` null; prices below are timestamped list observations, not quotes or
  billing tests); no code was executed, no containers/accounts/installers used. All product/user
  validations V1–V9 remain PROPOSED.
- Terminology: "Owner / Editor / Viewer" are Grist document roles; "Editors/Builders/Admins" and
  "read-only roles" are Baserow Cloud Advanced billing classes; "global vs station permissions"
  are AzuraCast's. None transfers automatically to another tool.

## 1. Exact per-P disposition (corrected)

Disposition vocabulary: ALREADY-COVERED (discovery coverage only — no deployment is claimed);
CORRECTION (P text as stated is wrong/unsafe in some respect); OPTIONAL ENHANCEMENT
(recommended extension, adoption conditional); USER DECISION (station must decide; research gives
options + rules, not answers); REJECTED (considered and not recommended, with reasons);
UNCERTAIN (evidence absent/inapplicable/weak, with resolver).

### P1: "Provide a shared show schedule and operator handoff view for both transmitters and the web stream."

Verdict: ALREADY-COVERED (as discovery coverage only) + CORRECTION (privacy; staleness) +
OPTIONAL ENHANCEMENTS (conditional) + USER DECISION (via P6) + REJECTED (broadcast-stack build).

- ALREADY-COVERED (qualified): discovery establishes the object model — one program/segment
  record feeding a live schedule view plus a per-shift handoff view for studio and web-stream
  operators. The calendar/history shape is corroborated by LibreTime's user-manual model
  (S05, https://libretime.org/docs/user-manual/ — show calendar, playlists and smart blocks,
  scheduling, history) and the multi-output permission shape by AzuraCast's global-vs-station
  permissions (S09, azuracast.com roles-and-permissions doc, dated 2021-02-09). "Covered" means
  the concept is evidenced and specified — no tool has been deployed or passed a station test.
- CORRECTION / privacy: P1 as stated omits the brief's dedication-privacy constraint. A single
  naive "shared view" (one printout, one login, one unfiltered table) violates the brief. The
  handoff view MUST be a redacted projection: dedications isolated (deny-all-non-owner table
  with condition `user.Access != OWNER`, R/U/C/D denied, per S11,
  https://support.getgrist.com/access-rules/) or redacted columns; host Editors WITHOUT the
  document-wide structure permission S (S11 warns S permits formula creation that can expose
  otherwise restricted data); verified per receiving role (revised V1/V2).
- CORRECTION / redaction mechanism (defect admitted and fixed): the draft's "Owner-context job
  enforces the same deny rules" is WITHDRAWN. A Grist Owner can read the protected table, so a
  non-owner denial cannot redact an Owner's print/export — the proposal was internally
  inconsistent (critic sustained; S11 enabled-rules semantics confirm Owners retain full read).
  Replacement, in preference order: (a) a verified NATIVE redacted print/export path exercised
  as the receiving role and checked across rendered print, downloads, HTML, API-visible output,
  formulas/widgets, and copies; or (b) a CUSTOM job with an explicit field allow-list/redacted
  projection plus a restricted receiving-role export, treated as a separately budgeted feature
  with a named implementation owner, credentials, support, and failure modes; or (c) a dedicated
  private store with no handoff joins, if the platform cannot establish a simple redaction
  boundary. No export path is recommended until it passes V1.
- CORRECTION / staleness: P1 must also fix the brief's observed failure (post-print updates
  missed by the web-stream operator). The live view is the authoritative record; every
  paper/export copy shows its last-change time/revision; one feasible signal/acknowledgement path
  covers both transmitters and the web-stream operator (revised V4 with real operators,
  change-to-visible and acknowledgement times recorded; the brief sets no numeric target).
- OPTIONAL (conditional): AzuraCast playlist-priority ordering (S10,
  https://www.azuracast.com/docs/user-guide/playlists/ — post-2024-09-01 numeric priorities,
  default 7..0 table) is an AUTOMATIC-selection semantic; its use as an operator-facing
  insert rule is unproven. Kept as a design analogy/question: ask the station how a late insert
  supersedes a track/segment, then show the chosen rule and reason. LibreTime-style "what aired"
  history (S05) is likewise optional — it creates a distinct record with its own retention need
  and is not folded into the aid by default.
- USER DECISION: P1's "for both transmitters and the web stream" is qualified by P6/D3 for the
  transmitter pair; web-stream freshness stays a P1 matter (see P6 for the separation).
- REJECTED for P1's implementation: building on a broadcast playout stack (LibreTime playout,
  AzuraCast AutoDJ, Rivendell automation). Reasons: the brief's explicit non-goal, the Linux ops
  cliff with no in-house developer (S04 LibreTime install minimums — 1 GHz, 1 GB req/2 GB rec,
  static IP, ports 80/8000/8001/8002; S08 AzuraCast requirements — min 2 GB/20 GB Docker host,
  rec 4 cores/4 GB/40 GB), and budget risk. Planning/permission semantics are adopted; stacks
  are not. Rivendell v4.5.0 (S17, https://www.rivendellaudio.org/ — dedicated Ubuntu 22.04
  appliance, pro audio adapters) is the hardest rejection.

### P2: "Track clearance status and restrictions at the track or clip level used in a show."

Verdict: ALREADY-COVERED + OPTIONAL ENHANCEMENTS + UNCERTAIN (attachments). The draft's
"CORRECTION" label for the approval workflow is RECLASSIFIED (sustained — P2 is not wrong for
omitting an approver role the brief reserves to P5).

- ALREADY-COVERED: per-segment clearance state with a restriction-note field at track/clip
  granularity. Durable modeling proposal (design inference, not a proved Grist feature):
  distinguish reusable clip/track facts (a clip's general restriction) from airing-specific use
  (a dated use adding context). Never compute a "cleared" default: states are unknown, pending
  review, restricted, or cleared, with station-agreed meanings — silence or missing approval must
  never render as CLEARED, especially while D1 is undecided.
- OPTIONAL (approval scaffold, tied to P5/D1): an approval state machine on usage notes
  (PROPOSED → APPROVED with author + time, where the tool provides them) is recommended but
  remains conditional on the station's D1 decision. Any pilot-time hold (e.g. temporary
  Owner-only review) must be explicit, named, management-approved, and marked temporary — it has
  no brief-based authority and may bottleneck nine staff plus volunteers. Verify in the pilot who
  can actually alter a usage note.
- OPTIONAL (legal-reminder copy): a brief neutral line — "station record, not a license grant" —
  may accompany the status field. The AzuraCast licensing disclaimer (S08 requirements page)
  is not a legal opinion about this station and the status field must never imply software
  verifies a license or grants rights.
- UNCERTAIN (attachments): whether restrictions need file attachments or plain text suffices.
  Resolver: collect five real restriction examples at pilot setup; design attachment storage only
  if examples demand it (storage caps interact: S12 Grist tiers, S16 Baserow tiers).
- Duration arithmetic: the O3.1 regression shape (S02/S03) applies ONLY if the aid computes
  remaining time or auto-fills durations (conditional V3 with the feature's real units, rounding,
  local-break edits, boundaries). A manual rundown with display-only durations marks V3
  inapplicable; LibreTime smart-block semantics must not become a requirement for it.

### P3: "Preserve a printable daily log and a manual fallback for transmission interruptions."

Verdict: ALREADY-COVERED + CORRECTION (verified redaction path; reconciliation; scope) +
OPTIONAL (dual format).

- ALREADY-COVERED: a redacted, timestamped daily log plus a manual fallback (local single-file
  rundown + USB + paper from one snapshot; TiddlyWiki v5.4.1 single-file model, S19,
  https://tiddlywiki.com/, is one carrier, static export the general one).
- CORRECTION / redaction path: the scheduled Owner-export is replaced per P1 — prefer the
  simplest proven NATIVE print/export path that yields a redacted, version-stamped rundown; if
  none exists, the custom job needs an implementation owner and funded operating cost BEFORE it
  becomes a recommendation. Paper/USB/local copies carry their own access, disposal, and
  freshness risks: deleting a live row does not delete printed/cached copies.
- CORRECTION / reconciliation: the fallback needs a run-and-reconcile procedure — operate from
  the stamped copy during the outage, record changed inserts separately, reconcile into live on
  recovery keyed by the version stamp (revised V7 tabletop).
- CORRECTION / scope ("which interruption?"): "transmission interruption" is ambiguous. This aid
  addresses TOOL/NETWORK unavailability (operator can read a current local rundown without
  app/network, then reconcile). An actual TRANSMITTER/STREAM-path failure is station engineering:
  V7 cannot pass by asserting "show continues" unless station personnel separately exercise
  existing transmission equipment and procedure. Any engineering runbook stays outside the
  product promise; the boundary is stated plainly in the pilot plan.
- CORRECTION / retention surfaces: provider history, backups, exports, and paper are retention
  surfaces to investigate, not automatic conformers to a retention-days setting. Current vendor
  summaries (Grist Pro three-year snapshots per S12/CR-GRIST-PRICE; Baserow Advanced 180-day
  row-change history per S16/CR-BASEROW-PRICE) do not prove whether or how deleted request
  contents remain recoverable — check backup/revision behaviour for deleted values before
  collecting requests, and resolve D2 with management first.
- OPTIONAL: dual-format fallback (paginated print CSS + single-file HTML) from one snapshot.

### P4: "Use text labels with status cues so operators do not rely on color alone."

Verdict: ALREADY-COVERED, normative MUST for labels; second cue optional redundancy
(corrected from the draft's "label plus cue mandatory" — sustained).

- The brief's label requirement is itself clear and complete. W3C Understanding SC 1.4.1
  (S18, https://www.w3.org/WAI/WCAG21/Understanding/use-of-color.html, Level A) requires that
  color not be the only visual means: ONE additional visible indicator suffices, and the
  brief's text label satisfies it. For hue-critical meanings (green-valid/red-invalid — exactly
  this clearance display), the additional indicator is required regardless of contrast; the
  separate 3:1 lightness note does not remove the label requirement (confirmed by
  CR-WCAG-COLOR). Icons/shape/position are recommended redundancy, not a second mandate.
  Labels appear in live, print, and local-export views; print stylesheets must preserve them.
- Acceptance (revised V6): text-only/monochrome inspection of every view PLUS an actual task
  performed by the staff member who raised the need, with status meanings reviewed with them.
  Deuteranopia/protanopia simulation and grayscale review are supporting evidence, not
  acceptance by themselves. Screen-reader semantics may be proposed separately; they are not
  implied by the stated color-perception need and no unscoped conformance claim is made.

### P5: "Approval authority for usage-note changes and retention of listener requests are station decisions."

Verdict: USER DECISION (both halves). Scaffolding below is ILLUSTRATIVE design proposal, not
findings; nothing here ships as station policy.

- D1 — approver role (illustrative options): (i) single station manager; (ii) any of two
  designated senior staff; (iii) program producer for own show plus manager override. Safe
  interim hold (replaces the draft's silent Owner-only default): usage-note review state stays
  visibly UNRESOLVED and unresolved clips never display CLEARED; whether airing is allowed while
  unresolved is itself a D1 sub-decision for management. Any temporary pilot gate must be named,
  management-approved, and marked temporary.
- D2 — retention (illustrative options only; no durations recommended, no law invented):
  session-only, fixed window, or consent-based — each with the caveat that listener requests,
  dedications, and usage notes may carry DIFFERENT retention rules and must not collapse into
  one configurable field. Tool requirement regardless: per-class retention parameters with
  scheduled purge and a purge log that records minimal deletion metadata WITHOUT retaining the
  sensitive content it removed; affected copies and histories named; provider backup/revision
  behaviour checked (P3 surfaces). Purge automation is conditional-layer (needs a funded owner).
- Cost scaffolding (corrected illustrations, list prices observed 2026-10-09, not quotes):
  the $6,000 annual allowance does not exclude paid hosting/setup/operations — the draft's
  "rules out anything needing paid ops" is WITHDRAWN; paid help is allowed inside $6,000, and
  the no-developer constraint means ops help must be budgeted, not assumed free. Grist Pro
  lists $8/user/mo annual / $10 monthly (nine seats ≈ $864/$1,080/yr); critic-observed
  additions pending confirmation: 50% nonprofit Pro discount subject to vendor eligibility, two
  document guests free (CR-GRIST-PRICE). Baserow Advanced lists $18 annual / $22 monthly with
  RBAC + 250,000 rows/workspace (nine editor-like ≈ $1,944/yr annual before volunteers);
  critic-observed: Cloud Advanced bills Editors/Builders/Admins, read-only roles free
  (CR-BASEROW-BILLING/CR-BASEROW-PRICE). Seat math must use a per-person role/seat model —
  shared logins are forbidden as a cost lever — plus setup, hosting, backups, support, and
  local taxes before any product choice (revised V8). Investigator-verified record/row units:
  Grist caps are per DOCUMENT (Free ≤5,000, Pro ≤100,000, Business ≤150,000 records/doc — S12,
  https://www.getgrist.com/pricing/); Baserow caps are per WORKSPACE (Free 3,000, Premium
  50,000, Advanced 250,000, Enterprise 1M rows — S16, https://baserow.io/pricing).

### P6: "Whether differing local breaks need separate schedules is not settled."

Verdict: USER DECISION. Shapes below are discussion examples; the web stream is separated from
the transmitter question (sustained).

- The station's explicit decision concerns TRANSMITTER breaks. The web stream's need is a
  freshness/handoff requirement under P1, not a third P6 log — the draft's three-log framing is
  corrected to avoid expanding P6's wording.
- Shape A (unified + visible overrides): one common rundown; transmitter-local breaks as clearly
  visible override rows. Shape B (per-output logs with inheritance): shared program record with
  dated transmitter-specific break/run records (precedent: AzuraCast station-scoped permissions,
  S09; Rivendell multi-log operation, S17). "Shape A is cheapest" is a HYPOTHESIS, not a finding.
  The tool carries an output-scope field on every schedule row from day one so the trial needs
  no rebuild.
- Decision rule (revised V9): the pilot unit is divergent-break OPPORTUNITIES, not elapsed weeks.
  Predefine with management the minimum number of differing breaks, override-reading time,
  operator corrections, near-misses, errors, and operator confidence. A short trial with zero
  mistakes across few divergent events cannot pass. The choice stays a user decision after the
  evidence.

## 2. Retained findings (full prose)

R1. Pilot shortlist (comparison kept visible; familiarity is not a decision): Grist leads ONLY
as a conditional pilot candidate — Community self-host ($0 license + donated/contracted ops) or
SaaS Pro (≈ $864–$1,080/yr list for nine seats, less any confirmed nonprofit discount) —
subject to V1/V2/V4/V6/V7/V8 gates. Baserow Advanced (≈ $1,944/yr list for nine editor-like
seats) stays live where its views/API or billing fit better; Premium is disqualified on privacy
(RBAC sits in Advanced). A shared spreadsheet with version history plus a visible generated-time
and agreed call-out is a live low-cost pilot alternative (critic-sourced lead; offline edits
stay browser-local until sync per GS-OFFLINE, so offline editing cannot deliver late changes to
another operator — same V-gates apply). Spinitron's show/occurrence model (shows with owners
and schedules, dated playlists as occurrences, public vs logged-in views per SP-SCHEDULE) is a
critic-sourced SCREENING lead only — insufficient evidence on clearance fields, break behaviour,
privacy, offline operation, price, or suitability; screen, don't recommend. All critic-sourced
leads are attributed and investigator-unverified.
R2. Design donors, stacks rejected: LibreTime calendar + smartblock-remaining + history concepts
(S02 CHANGELOG through 4.5.0 dated 2025-07-16; S04 install; S05 user manual) and AzuraCast
station-scoped permissions + playlist priorities + scheduled blocks (S09; S10) inform
requirements; both broadcast stacks plus Rivendell v4.5.0 (S17) are rejected as builds under the
brief's non-goal, ops, and budget constraints.
R3. Redaction architecture: isolate dedications (deny-all-non-owner table/columns), withhold S
from host Editors, verify per receiving role across live/print/download/HTML/API/formula/widget/
copy channels with a synthetic canary (revised V1/V2). Owner-generated exports prove nothing by
themselves; the redaction boundary must be an explicit allow-list/projection or a native path
tested as the receiver — or a private store with no handoff joins.
R4. Currentness architecture: live view authoritative; last-change/revision on operator view and
every copy; one agreed signal/acknowledgement path across transmitters + web operator; print is
a timestamped snapshot, never the record (V4).
R5. Fallback: one redacted snapshot → paginated print + single-file local HTML (TiddlyWiki
v5.4.1 single-file model, S19, or static export), on studio machines + USB + paper, with a
run-and-reconcile procedure; tool/network outages are the aid's scope, transmitter/stream-path
failures are station engineering (V7 + separate exercise).
R6. Accessibility: labels mandatory in every view incl. print (S18/CR-WCAG-COLOR); icons
optional; staff-member task acceptance (V6).
R7. Scheduling-accuracy precedent: LibreTime PR #3026 → 4.2.0 → 4.3.0 subset-sum chain
(S02/S03/CR-LT-3026) governs ONLY remaining-fill/duration arithmetic — a conditional V3 — and
is not the brief's printed-log staleness mechanism (analogous family, different failure).
The critic-noted #3160 playout-metadata chain (LT-PR/LT-REL) is inapplicable absent
audio/playout integration. No Grist/AzuraCast regression chain is claimed (absences declared).
R8. Original constraints preserved in force: $6,000/yr allowance (paid help permitted inside
it); no in-house developer (custom work needs a funded owner); nine staff + rotating volunteer
hosts; days-ahead assembly + minutes-before news inserts; per-segment clearance + restriction
notes; dedication privacy incl. paper; labels-not-color; manual fallback; no automated
broadcast; D1/D2/transmitter-shape reserved to the station.

## 3. Conditions

Pilot BASELINE (no-code, day one, no funded engineering): native tables/views; account-level
roles with rules-first onboarding (deny rules exist before the first volunteer is added);
Owners ≤ two trusted staff and no host holds S; simple native print; manual revision
acknowledgement; labels in every view; unresolved-safe states (never CLEARED while undecided);
scope field on every schedule row; per-person seats (no shared logins).
CONDITIONAL layer (each item needs a named funded implementation owner, operating cost, and
proof before it becomes a recommendation): custom redacted export/purge automation + purge log
(content-free); multi-output schema beyond the scope field; automated version signalling;
duration arithmetic (only with V3 passing, else display-only); rich attachments (only if real
examples demand); "what aired" history (only with its own retention decision).
UNIVERSAL: annualised cost within $6,000 on MEASURED seats/rows/storage/support (V8; headroom
percentage is a proposed criterion for management, not a brief requirement); retention
parameterised per record class with named copies/histories (pending D2); provider
history/backup behaviour checked for deleted values.

## 4. Alternatives (kept live)

- Substrate: Grist ↔ Baserow Advanced ↔ shared spreadsheet (each re-runs V1/V2/V4/V6/V7/V8;
  privacy bar unchanged). Spinitron: screen against the same criteria before any pilot.
- Hosting: Grist SaaS ↔ Community self-host as ops capacity clarifies; "data model transfers
  seamlessly" is a HYPOTHESIS — test migration, identity, and ops costs.
- Schedule shape: P6 Shape A ↔ Shape B per revised V9.
- Fallback carrier: static export ↔ TiddlyWiki-style single file ↔ paper-led; invariant is
  redaction + timestamp + reconciliation, not format.
- Approval/retention postures: per D1/D2 options in §6; interim hold always unresolved-safe.

## 5. Optional capabilities (recommended conditionally, each labeled observed-vs-designed)

- Insert-priority display semantics (DESIGNED analogy from S10 observed AutoDJ behaviour).
- Read-only "what aired" history (DESIGNED; needs its own retention decision).
- Rights-reminder copy (DESIGNED neutral line; S08 disclaimer is not legal advice).
- Approval state machine with placeholder role (DESIGNED scaffold for D1; pilot-conditional).
- Dual-format fallback from one snapshot (DESIGNED rendering choice).
- Graphic second cue beside labels (DESIGNED redundancy; optional).
- Rich restriction attachments (CONDITIONAL on real examples; storage-priced).

## 6. User decisions (reserved; scaffolding illustrative, not policy)

- D1 approver role: three illustrative options (§1/P5) + coverage rule (smallest approver set
  covering every air week incl. holidays) + identity/timestamp recording; interim hold
  unresolved-safe; airing-while-unresolved is a D1 sub-decision.
- D2 retention: per-class illustrative options (§1/P5); no durations recommended; legal advice
  flagged; tool ships parameterised with content-free purge log; provider surfaces investigated.
- D3/P6 transmitter shape: Shape A vs B + revised V9 trial (§1/P6); web-stream freshness
  handled under P1 regardless.

## 7. Uncertainty (declared, each with resolver)

U1 volunteer seats/identities/turnover → V8 measurement with per-person model. U2 restriction
attachments → five real examples at setup. U3 retention law/policy → station advice; tool
parameterised meanwhile. U4 ops capacity (Linux/VPS volunteer/contractor) → direct ask + V8
support log; decides SaaS vs self-host. U5 print/signal workflow (who prints, hail channel) →
V4 design session with actual operators. U6 record-growth rate (the "≈50/day" figure was an
ILLUSTRATIVE sensitivity case, not station data) → define row unit (catalog item vs airing vs
insert vs handoff vs request) + V8 measurement; Free-tier fit undecided until measured. U7
Grist/AzuraCast regression surface → targeted issue search as conditional V5. U8 LibreTime
#747/#741/#802 pointers unretained → no action needed (O3 carried by #3026). U9 critic-sourced
facts (nonprofit discount eligibility, Baserow billing classes, Spinitron/sheets behaviours) →
confirm against current vendor pages + pilot gates; investigator-unverified at this writing. U10
migration/transfer costs (hosting swaps, data-model moves) → treat as hypotheses until tested.

## 8. Validations: executed vs proposed

### Executed (static evidence work; no runtime; no deployment)

E1. Investigator evidence: nineteen retained files + SHA-256 + UTC access stamps (sources/,
FETCH_TIMES.txt) with per-source operations (source-map.json S01–S19). QUALIFICATION (sustained):
in-text ID labels in frozen discovery §3 headers/single-cites are misaligned (alias table §10);
the evidence FILES, source-map.json, and index.md are correct, and this final cites URLs/locators
directly. E2. Negative locators: LibreTime guessed `/schedule/` 404 shell retained (S06);
AzuraCast guessed users URL 0 bytes discarded and disclosed. E3. Cost arithmetic from retained
pricing bytes as timestamped illustrations (S12/S16); no trial; all usage/billing null. E4. No
code executed, no containers/accounts/installers. E5. Critic verification: READY.json hash match
on both named files before reading; frozen discovery/draft hashes confirmed unchanged.

### Proposed (discriminating; each states its gate — pilot durations/headroom are PROPOSED
criteria for management, not brief requirements)

V1 redaction proof (only if Grist — or any allow-list substrate — remains a candidate): synthetic
dedication canary; every actual account role; direct table/open/API access; search and
formula-derived output; Owner-authored formula/widget output; native print/export/HTML as the
receiving role; old revision/backup path. PASS = intended operator receives allowed fields and
no canary value in ANY channel. The withdrawn "Owner-context enforces non-owner rules" assertion
is removed. V2 structure-trap test: test Editor WITH S exfiltrates canary via formula, WITHOUT S
cannot — justifies withholding S. V3 duration regression (ONLY if remaining-fill/duration
arithmetic survives scope review; else INAPPLICABLE): #3026 shape in the feature's real units
with rounding/boundaries/local-break edits. V4 currentness drill: real transmitter + stream
operator roles; versioned print/export, then an insert; capture per-receiver change-to-visible
and acknowledgement times; stale-copy handling; pass target + channel agreed BEFOREHAND. V5
regression search (conditional): grist-core/adjacent issue search for access-rule regressions;
pin above fixes. V6 accessibility: text-only/monochrome inspection of live/paper/HTML + affected
staff member's task completion; simulators supplemental. V7 fallback tabletop: app/network
unavailable; last stamped rundown; inserts recorded separately; reconcile on recovery; PLUS a
separate station-engineering exercise for transmitter/stream failure (never conflated). V8
cost/operations pilot (proposed duration, e.g. 30 days, for management to accept): actual
paid/editor seats incl. churn, rows under a specified data model, support/admin time,
setup/hosting/backup costs, confirmed nonprofit terms; per-person seats only. V9 shape trial:
management-predefined divergent-break count + reading-time/corrections/near-miss/confidence
measures; short zero-error runs over few events cannot pass.

## 9. Critique disposition (each demand, independently verified)

Method: I re-checked each challenged claim against my retained evidence and the frozen critic
files (READY-named only), then accepted, partially accepted, or rejected with reasons. All
fifteen Firmed below; no demand was dismissed without evidence.

C1 Owner-export inconsistency (P1/P3) — ACCEPT. Verified against S11
(https://support.getgrist.com/access-rules/): enabled rules give Owners full read and restrict
copy/download TO Owners; nothing in the retained docs makes an Owner's export inherit a
non-owner denial. The draft mechanism is withdrawn and replaced (§1/P1, §1/P3, R3, V1).
C2 P2 approval "CORRECTION" overstatement — ACCEPT. P2's text is consistent with the brief
reserving the approver to P5; reclassified as OPTIONAL scaffold (§1/P2). The silent-rewrite
risk stands as the enhancement's rationale, with unresolved-safe interim (§1/P5).
C3 P3 native-path-or-budget + interruption scope — ACCEPT. Custom export/purge need a funded
owner (§3 conditional layer); tool/network vs transmitter-path failures separated with a
separate engineering exercise (§1/P3, V7).
C4 P4 icon mandate overstatement — ACCEPT. S18 requires one additional visible indicator; the
brief's label satisfies it; icons are optional redundancy (§1/P4, V6 rebalanced).
C5 P5 scaffolding + interim default — ACCEPT. Role/retention examples labeled illustrative;
silent Owner-only default replaced by visible UNRESOLVED + never-CLEARED hold; retention split
per record class; purge log content-free (§1/P5, §6).
C6 Cost/C4 overstatement + critic pricing observations — ACCEPT. "Rules out paid ops"
withdrawn; paid help allowed inside $6,000 with budgeted ops (§1/P5, R8). CR-GRIST-PRICE
(nonprofit discount, free guests) and CR-BASEROW-BILLING (billable vs free roles) incorporated
as critic-observed pending confirmation (U9, V8); per-person seats, no shared logins.
C7 "≈50 rows/day" illustration — ACCEPT. It was my sensitivity case, not station data;
Free-tier fit undecided until the row unit is defined and measured (U6, V8). The conditional
arithmetic (IF 50 doc-rows/day THEN ≈18k/yr vs 5k/doc Free cap) stands only as illustration.
C8 P6 web-stream expansion + weak trial — ACCEPT. Web-stream freshness returned to P1; P6 kept
to transmitter breaks; V9 rebuilt around predefined divergent opportunities and confusion
measures (§1/P6).
C9 No-code vs custom-work inconsistency — ACCEPT. Split into pilot baseline vs conditional
layer with funded-owner gates (§3); native print + manual acknowledgement is the day-one path.
C10 Source-ID traceability errors — ACCEPT. Errors confirmed against source-map.json (details
§10); frozen files untouched; alias table + direct-URL citation + E1 qualification applied.
C11 Omitted alternatives (spreadsheet, Spinitron) — ACCEPT as critic-sourced screening leads.
Added with GS-OFFLINE's offline-sync limit and SP-SCHEDULE's evidence gaps, gated by the same
V-set, attributed and investigator-unverified (R1, §4, U9).
C12 V1–V9 revisions — ACCEPT. All nine rewritten as proposed above (§8); withdrawn assertions
removed; conditionality explicit (V1/V2 Grist-conditional, V3 arithmetic-conditional, V5
conditional).
C13 Minor findings 1–5 — ACCEPT. Integrity statements kept with dates; simulation
supplemental; optionals labeled observed-vs-designed; cost/transfer claims demoted to
hypotheses; pilot durations/headroom labeled proposed-for-management (§5, §7, §8).
C14 O3 scoping (#3026 smart-fill only; #3160 inapplicable) — ACCEPT. The draft's "EXACTLY the
station's failure class" overstated the match: #3026 (S03,
https://api.github.com/repos/libretime/libretime/pulls/3026 — retrieveMediaFiles showLimit
double-count, 30-min/5+5/remaining shape, merged 2024-06-05, shipped 4.2.0 per S02 with 4.3.0
subset-sum follow-on #3019) is the same FAMILY (schedule accuracy) but a different MECHANISM
from printed-log staleness (distribution/sync). V3 is conditional (R7). #3160 accepted as
inapplicable without audio/playout.
C15 State modeling (reusable facts vs airing-specific use; unresolved states) — ACCEPT as a
design proposal; incorporated into P2/P5 with tool-provided authorship checks (verify, don't
assume).

No finding in this final claims a deployment, an end-to-end station test, or a runtime result.
Points of preserved disagreement: substrate choice (Grist vs Baserow vs spreadsheet, Spinitron
to screen — criteria visible, §4/R1); P6 shape (trial-decided); D1/D2 substance (station-owned).

## 10. Source-ID alias correction table (frozen-discovery citation defects)

The frozen `discovery.md` §3 prose labels below misidentify the correct frozen IDs. The frozen
`source-map.json`, `sources/index.md`, and evidence FILES were and are correct — only these
prose labels are wrong. Frozen files are not rewritten or renumbered; this table is the
correction record, and this final cites URLs/locators directly throughout.

| Frozen discovery prose label (WRONG) | Correct frozen ID | Correct stable URL / locator |
|---|---|---|
| §3/O2.1 header "S10 access-rules docs" | S11 | https://support.getgrist.com/access-rules/ (Intro to access rules) |
| §3/O2.1 header "S14 grist-core README" | S15 | https://raw.githubusercontent.com/gristlabs/grist-core/main/README.md |
| §3/O2.1 header "S11 pricing" | S12 | https://www.getgrist.com/pricing/ |
| §3/O2.1 header "S12 limits" | S13 | https://support.getgrist.com/limits/ |
| §3/O2.1 header "S13 self-managed" | S14 | https://support.getgrist.com/self-managed/ |
| §3/O2.3 header "S06 README" | S07 | https://raw.githubusercontent.com/AzuraCast/AzuraCast/main/README.md |
| §3/O2.3 header "S07 requirements" | S08 | https://www.azuracast.com/docs/getting-started/requirements/ |
| §3/O2.3 header "S08 roles-and-permissions" | S09 | azuracast.com administration/roles-and-permissions.md (doc date 2021-02-09) |
| §3/O2.3 header "S09 playlists" | S10 | https://www.azuracast.com/docs/user-guide/playlists/ |
| §3/O2.4 "S15 pricing page" (Baserow) | S16 | https://baserow.io/pricing |
| §3/O2.5 "S16 home" (Rivendell) | S17 | https://www.rivendellaudio.org/ (production v4.5.0 observed) |
| §3/O2.6 "S17" (WCAG) | S18 | https://www.w3.org/WAI/WCAG21/Understanding/use-of-color.html (WCAG 2.1 SC 1.4.1) |
| Draft §1/P2 "S15 for reference columns / conditional formatting / card views" | UNSUPPORTED by S15 (grist-core README) | Downgraded: those UI behaviours appear only as help-center NAV LISTINGS inside S11's retained page, not as established behaviours — treated as vendor claims until pilot-tested; no retained page proves their semantics |

Confirmed CORRECT as written (spot-verified for this final): discovery §3/O2.2 header
(S01/S04/S05/S02); discovery §3/O2.1 BODY facts (drawn from the correct
grist-access-rules.html bytes — only the header labels were wrong); discovery §4/O3.1
(S02/S03); discovery §5/§6 citations (S11, S12/S16, S02/S03, S18-implied); draft §1 P1/P3/P4
and §2 R1–R6 citations except the single P2/S15 row above. Draft E1's "all claims resolve"
stands CORRECTED by this table: all claims resolve to retained evidence files, but the §3
prose ID labels listed here did not.

## 11. Obligation check (O1–O6)

O1 (unfamiliar tools beyond the thin plan): Grist, Baserow, LibreTime, AzuraCast, Rivendell,
TiddlyWiki-fallback, WCAG-as-design-input (investigator, pre-reveal) PLUS spreadsheet-pilot and
Spinitron-screening (critic-sourced, attributed) — each with distinct fit limits, none
collapsed into a premature product decision (R1/R2, §4). O2 (primary-source behaviour,
defaults, limits, applicability): Grist enabled/disabled defaults + S-bypass + Owner-export
asymmetry (S11/CR-GRIST-RULES), seat/row units per-document vs per-workspace with timestamped
list prices (S12/S16/CR-GRIST-PRICE/CR-BASEROW-PRICE/CR-BASEROW-BILLING), install envelopes
(S04/S08), permission/priority semantics (S09/S10), rejection envelopes (S17), normative color
rule (S18/CR-WCAG-COLOR) — vendor docs treated as claims until tested. O3 (issue/fix/release):
#3026→4.2.0→4.3.0 retained as smart-fill-only evidence (S02/S03/CR-LT-3026) with absences
declared; #3160 agreed inapplicable. O4 (per-P comparison): §1 verdicts for every P1–P6 with
the reclassifications above. O5 (alternatives, conditions, constraints, disagreement,
uncertainty in coherent prose): §2–§7 + §9 tail, no ID-substitution. O6 (discriminating
validations, executed vs proposed): §8, no runtime pretended, pilot criteria labeled
proposed-for-management.

## 12. What this final does NOT do (boundary honesty)

- Does not rewrite frozen discovery or rebind frozen IDs (correction by alias table, §10).
- Does not pre-empt D1/D2/P6 (scaffolded illustratively, reserved explicitly).
- Does not recommend a broadcast-stack build (rejected with evidence; semantics adopted only).
- Does not claim any runtime verification, deployment, billing test, legal conclusion, or
  critic-fact independent verification (attribution + confirmation gates instead).
- Does not invent volunteer counts, ops capacity, growth rates, retention law, or cost ranks.
- After this save, only mechanical delivery remains; native Goal completion follows verification.

---
*Final complete post-critic in the original investigator context. Artifacts in this directory:
`discovery.md` (frozen), `source-map.json` (frozen S01–S19), `sources/` + `sources/index.md`,
`revealed-plan.md`, `draft.md`, `final.md` (this file).*
