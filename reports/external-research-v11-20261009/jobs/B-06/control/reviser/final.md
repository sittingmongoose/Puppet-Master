# I06 Final — Planning and handoff aid (reviser, complete deliverable)

Block B-06 / control / case I06 / method M14 / stage reviser.
Brief obligations O1–O6. Plan P1–P6 from `revealed-plan.md` (revealed after
discovery freeze via `reveal-plan.py`, 2026-10-09T20:27Z).

Predecessors read in full: research `draft.md`, `discovery.md`,
`source-map.json` (S01–S11), `revealed-plan.md`, critic `source-map.json`
(C01–C06) and `critique.md`, both source roots (all 17 excerpts), and the
original brief. The reviser independently re-checked every consequential
evidence conflict behind the corrections below (fix version, severity score,
undo fix, evaluation order, structure bypass, copy/download semantics, WCAG
scope, LibreTime install surface) against the carried excerpts; no new web
fetch was made in the reviser window, so narrow confirmations that remain are
recorded as explicit build steps, not as facts. No extra broad discovery was
needed: every criticism was resolvable within the original scope and the
evidence on hand.

Prose below is self-contained; source IDs (Sxx research, Cxx critic) are
citations and never replace material text. Usage/billing unobserved: null. No
runtime witness was executed at any stage; §5 separates executed checks from
proposed work honestly.

Disposition vocabulary (O4): correction | optional enhancement | user decision
| already-covered | rejected | uncertain.
Criticism verdicts (§4): ACCEPT (applied as asked) | AMEND (applied with
changed wording/scope) | REJECT (not applied, with reason) | UNCERTAIN
(retained as uncertainty with the exact confirmation step).

## 0. Product frame (constraints preserved)

Two transmitters plus a web stream; music plus short spoken segments. Nine
staff and rotating volunteer hosts prepare shows in a small studio; some
programs are assembled days ahead while local news inserts may change minutes
before airtime. The station has a $6,000 annual technology allowance and no
in-house developer. Hosts need to see what is cleared for a program, note when
a track or spoken clip has a restriction, and hand a show to the next operator
without exposing private listener dedications. The current on-air log is
printed, and updates made after printing are sometimes missed by the
web-stream operator. A staff member with limited color perception needs the
status display to use labels as well as color. Internet access is usually
stable, but the station wants a manual fallback for transmission
interruptions. The station is not asking for an automated broadcast system; a
reliable planning and handoff aid is enough.

Preserved as station decisions, never filled by the researcher: (a) which role
approves changes to a clip's usage notes, (b) how long listener requests are
retained, (c) whether one schedule covers both transmitters when their local
breaks differ. Three further station facts gate resourcing conditions and must
be asked before build: existing identity provider, hosting arrangement, and
whether any volunteer has Linux skill.

Recommended spine (corrected): a Grist permissioned planner as master —
version at or above 1.7.20, pinned tag or digest, structure permission off for
non-owners, fetch-URL requests disabled or routed through a trusted proxy,
authenticated logins from day one with external single sign-on only if the
station already runs an identity provider — plus a version-stamped derived
print, a drill-decided post-print sync path (push with acknowledgement versus
live-view pull), a role matrix published with the approval decision, and
manual fallback cards. NocoDB/Baserow remain a preliminary fallback whose
row-privacy tier must be vendor-confirmed before any switch. LibreTime and
AzuraCast remain optional growth/stream complements with mechanism provisos.
Rivendell remains an explicit non-goal. The paper-first spine is mandatory
regardless of software.

## 1. Exact per-P disposition (O4)

### P1: "Provide a shared show schedule and operator handoff view for both transmitters and the web stream."
Disposition: already-covered with correction + optional enhancement.
Already-covered: a Grist master document with role-filtered views satisfies
the shared schedule and handoff. Print is a derived snapshot (show ID,
version N, timestamp, from→to operator), never the master.
Correction: the shared view must not be an identical view for all roles.
Volunteers and the stream operator see redacted views (dedications masked to
"private — see planner"); the clearance table shows text status labels. One
identical view would leak dedications and violate brief privacy. The master is
shared; views are filtered by role plus an `is_private` flag.
Correction: post-print sync is required, but the sync discipline is
drill-decided, not researcher-mandated. Either push with acknowledgement (every
post-print change triggers a message or phone call plus a version bump from vN
to vN+1 with stream-operator acknowledgement) or pull (the operator refreshes a
live view on a fixed cadence) may fit a volunteer desk; validation 3 runs both
candidates and the measured miss rate decides. A shared live view alone, with
no proven sync path, reproduces the current miss bug.
Optional enhancement: a read-only AzuraCast now-playing or mount display
checked manually alongside the planner as a stream-side complement — kept only
as a manual dashboard check, because no no-code feed-into-planner mechanism
was evidenced. Rejected as planner core (beta status at fetch time, Docker VPS
operations load, no clearance workflow). Re-verify beta status at build.
Conditions: authenticated logins from day one (external single sign-on only if
the station already runs an identity provider; otherwise Grist built-in team
logins); Grist at or above 1.7.20 with a pinned tag or digest; structure
permission off for non-owners; fetch-URL requests disabled or routed through a
trusted proxy; history purge tied to the retention decision (P5); a published
role matrix stating exactly which station roles hold full versus partial read.
Uncertain: volunteer device and browser mix; live-view refresh latency on
studio hardware — measured by the staleness probe in validation 3 before the
live view may join the safety argument.

### P2: "Track clearance status and restrictions at the track or clip level used in a show."
Disposition: already-covered with correction.
Already-covered: a clearance table at track and clip grain with status plus a
restriction note plus a program link is retained.
Correction: status is a fixed text vocabulary `CLEARED` / `RESTRICTED` /
`PENDING` with a separate boolean `changed_since_print` overlay — never color
alone, never a four-value enum (a row can be pending and changed-since-print
at once). The restriction note is a separate column so it can be redacted
independently. Approval authority stays a variable (`approved_by_role`,
nullable to pending) until P5 is decided, with deny-by-default: edits by
non-approvers remain pending, visible as pending, never silently cleared.
Correction: the approval workflow needs a Grist mechanism, not just a schema.
The final sketches it: "checking new values" conditions on the clearance table
gate status and restriction-note transitions so only the approver role can
move a row out of pending; if cross-role approval cannot be expressed without
owner intervention (unconfirmed until the custom-rules documentation is opened
at build), the fallback is a second change-request table with a lookup that
validation 7 must cover. Airtime liveness is a station decision with a
drill-tested default: if clearance is still pending at airtime, the desk
either fails closed (pull the insert, run dead-air cover) or fails open (air
with an announced restriction). The interim pre-decision triage path is: anyone
may flag an error, one station-named interim contact may emergency-clear with
a log entry recording who, when, and why, and every interim clear is reviewed
at the next staff check — otherwise the desk will route around the planner on
day one.
Rejected: color-only status; a single free-text field mixing clearance with
dedications (prevents redaction); silently defaulting approval to "station
manager" or "any host."
Optional enhancement: LibreTime library and show reuse as a growth path if the
station later wants clock-based scheduling — kept only with the proviso that
planning-only use is untested and needs a trial confirming the calendar works
with playout disabled, plus managed hosting. Rejected for day one (automation
operations exceed a no-developer $6k budget).
Conditions: Grist access rules enforce row and cell visibility; version floor
plus structure-off plus proxy condition, or dedications leak via history,
compare, formulas, or fetch (see §3). The approval-role decision must not
silently grant full read to approvers who do not need dedications.
Uncertain: the music licensing rules behind "cleared" are undefined in the
brief — the planner tracks the station's assertion, not legal truth. Station
policy input required.

### P3: "Preserve a printable daily log and a manual fallback for transmission interruptions."
Disposition: already-covered with correction + optional enhancement.
Already-covered: the version-stamped printed daily log plus the fallback card
are retained as a mandatory spine.
Correction: print is derived, never the master. Each print carries version N,
a timestamp, the program range, the clearance table with text labels, a
redaction marker ("dedications redacted — see planner"), and the rule that
vN+1 supersedes vN. Post-print changes invalidate prior prints under the
drill-decided sync path. Paper alone without versioning and sync reproduces
the current miss bug.
Correction: redaction is enforced by printing only from named redacted views,
with full-view printing disabled by role or by procedure plus audit — not by
an unproven "template level" mechanism and not by operator discipline. An
operator with an unfiltered view open must be unable to print dedications, and
validation 3 includes a negative print test (attempt full-view print as stream
operator; expect denial or redacted output).
Correction: the fallback covers transmission interruption (internet and power)
and planner outage: who switches what, where the spare log lives, how the
stream operator is contacted (phone and message tree with a reachability
pre-check), the 30-minute paper run procedure, and handoff read-back without
speaking private dedications aloud. The planner-outage extension keeps an
offline-clear rule: when the planner is offline, minutes-before-air news
inserts are not auto-cleared; the fallback card names the interim authority
who may clear on the paper log with initials and time, entered into the
planner when it returns, preserving pending-by-default.
Version-stamp procedure (one paragraph, recorded in validation 3): the duty
operator bumps the version through one explicit planner control (button or
manual field, mechanism confirmed at build); each print shows version N, the
station wall-clock timestamp with its time zone (planner stores UTC), and the
program range; the acknowledgement is recorded in the planner handoff log as
operator name plus time plus version acknowledged.
Optional enhancement: pre-printed blank insert slips for minutes-before news
changes (structured fields: time, clip ID, clearance, initials).
Conditions: black-and-white legible; print meets the same label-redundancy
rule as the screen as station policy and is tested the same way (see P4).

### P4: "Use text labels with status cues so operators do not rely on color alone."
Disposition: already-covered with correction (mandatory, not nice-to-have).
Already-covered: the label-plus-color design is retained.
Correction: the screen UI meets Web Content Accessibility Guidelines (WCAG)
2.2 success criterion 1.4.1 Level A: "Color is not used as the only visual
means of conveying information, indicating an action, prompting a response, or
distinguishing a visual element." Light-versus-dark passes only if the
lightness contrast ratio is at least 3:1; knowing green means valid versus red
means invalid requires an extra indicator regardless of contrast. Grist
conditional formatting must set text or icon, not just cell fill. Print meets
the same label-redundancy rule as station policy and is tested the same way —
print legibility is required practice, but calling paper "WCAG conformance" is
a category error the final does not repeat.
Rejected: color-only badges, red/green dots without words, legends that
require color discrimination, hue-only glyph icons (icons must be
black-and-white-distinguishable shapes redundant with the words).
Conditions: the status vocabulary is fixed (`CLEARED` / `RESTRICTED` /
`PENDING` plus the `changed_since_print` overlay); templates are tested with
the limited-color-perception staff member.
Uncertain: none on the requirement (Level A for the screen, mirrored policy
for print — both non-negotiable); only implementation detail (which icon set)
is open. Validation 4 defines the sample (all 9 staff plus at least 2
volunteers), the item set (every status on print and screen), and a realistic
bar (all P4 items correct with one retry after a template fix, or at least
95% first-try with no systematic confusion pair).

### P5: "Approval authority for usage-note changes and retention of listener requests are station decisions."
Disposition: user decision (preserved, must not be filled by the researcher).
Approval role: the station chooses which role approves usage-note changes. The
planner holds the `approved_by_role` variable plus the pending state until
decided. Interim safe posture is deny-by-default (edits by non-approvers stay
pending, visible as pending, not applied as cleared) plus the interim triage
path in P2. Nothing here defaults to "station manager" or "any host."
Retention: the station chooses how long listener requests are retained, with
counsel on any legal or grant floor or ceiling — no legal advice is given.
The interim is not a duration but a posture: quarantine (collect minimally,
restrict dedications to owners, no volunteer-visible history) plus manual
delete on request plus a purge drill run against 30-day and 90-day candidates.
The earlier "shortest tolerable retention" interim default is struck: choosing
the shortest retention is itself a product decision with record-destruction
risk, and the privacy argument for it is one-sided.
Optional enhancement (not a decision): keep the 30/90-day candidates for the
station to test in the retention-purge validation; the station picks one or
names another.
Conditions: the retention decision drives engineering (purge cadence, backup
rotation, export inventory, log redaction); the approval decision drives the
Grist role mapping. Both are recorded with date and decider, and the
role-to-permission matrix (read, update, create, delete, structure, plus
full-read versus partial-read per role) is published with the decision.
Uncertain: whether any law or grant requires a minimum or maximum retention —
station counsel decides.

### P6: "Whether differing local breaks need separate schedules is not settled."
Disposition: user decision + uncertain (preserved).
Not settled: the planner stays mechanism-neutral and supports both outcomes
through filtered views or columns, never a hardcoded single or split: (i) a
single schedule with per-transmitter break columns (`TX1_break`, `TX2_break`,
`shared`), or (ii) two schedules with a shared-program link. The decision
procedure is a tabletop walkthrough (one real past week replayed on paper
under both layouts, scored for break misses plus confusion) followed by a
one-week live pilot of the walkthrough winner — where Grist makes the second
prototype near-free (same tables, two saved views), both views are shown in
one drill session and that near-zero cost is stated. The same-week dual live
run is struck as unbuildable for a no-developer volunteer desk (the same week
cannot air twice; two different weeks are confounded by content and
volunteers). Nothing here forces one schedule to satisfy P1: a shared master
with per-transmitter filtered views satisfies P1 under either P6 outcome.
Rejected: hardcoding a single schedule (risks missed local breaks) or a hard
split (risks divergence) before the station decides.
Optional enhancement (relabeled, pending station confirmation of
stream-versus-transmitter break rules): the stream-operator view shows which
breaks air on the stream versus transmitter-only.
Conditions: whichever outcome is chosen, break rows carry text labels plus an
owner (which transmitter), under the drill-decided sync path.
Uncertain: the operational cost of each layout (miss rate, volunteer
confusion) — the walkthrough plus pilot measures it. The station picks single
versus split after the pilot, or defers with an explicit revisit date.

## 2. Retained findings (O1–O2 summary, self-contained)

- Grist (primary planner): a relational spreadsheet over SQLite with Python
  and Excel-style formulas, layouts, forms, API, and webhooks, self-hostable
  with an Apache-2.0 core at no license cost. Access rules reach table, column,
  row, and cell, keyed on user attributes (including owner-defined roles) and
  cell values. Confirmed semantics: rules are read top to bottom within each
  group in the order column-specific rules, then table-wide rules, then
  default rules, and the first applicable rule allowing or denying a
  permission wins — as soon as there is a definitive allow or deny, further
  rules are not checked. The structure permission is very powerful because
  formula calculations are not limited by access rules: a determined user with
  structure access can use formulas to retrieve any document data, so holding
  structure circumvents the other rules. The structure permission is available
  only in the special structure-edit rule; enabling rules leaves only owners
  able to change document structure and to copy or download the document, and
  special rules also gate viewing the access-control configuration. A row rule
  uses a record variable to go row-specific, and a "checking new values"
  mechanism exists to permit only certain changes. Self-host runs a single
  Docker image on port 8484 with a persisted volume; every runbook mention
  pins an explicit image tag or digest at or above 1.7.20, never an untagged
  floating name. Row-level rules use a record variable plus user attributes; a
  dedications table carries an `is_private` flag with a `can_see_private`
  role, and the clearance table carries the corrected schema from P2.
  Applicability: spreadsheet familiarity for volunteers plus real row privacy
  plus history, fitting a planning aid rather than automation. Needs
  authenticated logins, the version floor, structure-off, the fetch-URL
  proxy-or-disable condition, copy/download locked to owners, and history
  purge tied to retention. (C02 confirms the evaluation order and structure
  bypass that were uncertain at discovery; S02, S03, S09.)
- NocoDB and Baserow (preliminary fallback): volunteer-friendly
  spreadsheet-database frontends. NocoDB offers six view types free (grid,
  kanban, gallery, form, calendar, map) plus comments and bring-your-own
  database (MySQL, Postgres, SQLite) under a Fair-Code community license, with
  deletions permanent (no trash) and a minimum near 1 vCPU and 2 GB. Baserow
  offers an app builder, undo and redo, three-day trash, dozens of templates,
  and GDPR-ready self-host under an MIT open core with some views and
  permissions paywalled, minimum near 2 vCPU and 4 GB. This comparison rests
  on third-party pages, not vendor documentation, and is preliminary: the one
  load-bearing cell — row-level privacy availability and tier for each
  fallback — must be confirmed from vendor pricing documentation before any
  switch, because the privacy comparison is what justifies Grist as primary.
  Retained as fallback if Grist hosting is unavailable. (S08, preliminary.)
- LibreTime Stable 4.x (growth path with proviso): a community fork of the
  stalled AirTime project, AGPLv3 code, show- and calendar-centric scheduling
  able to feed a transmitter or console plus a stream through a web UI.
  Minimums are a 1 GHz processor, 1 GB of memory required (2 GB recommended),
  a static external IP address, and open ports 80 (web), 8000 (Icecast
  streams), 8001 and 8002 (live input), installed via Docker or an installer,
  with a firewall guide. The 4.x line has had breaking upgrade notes, so a
  managed host must own upgrades. Planning-only reuse (calendar, shows, and
  library with playout ignored) is plausible but unproven: the install surface
  still implies stream ports and services, and no supported planning-only mode
  was evidenced. Kept only with the proviso that a trial confirms the
  calendar works with playout disabled, plus managed hosting. (S06, C06.)
- AzuraCast (manual stream complement, demoted): a Docker self-hosted
  multi-station web-radio suite, free with donations, installable on a VPS or
  dedicated server with roles, station management, mount points, relays, SFTP,
  and Liquidsoap customization. The documentation carries a beta warning to
  keep updated and to back media up in a second location; re-verify beta
  status at build because it may have stabilized. Stream- and
  automation-centric, with no clearance, usage-notes, or dedication-privacy
  workflow. No no-code feed-into-planner mechanism was evidenced (polling its
  API from Grist would be developer integration work in disguise), so the
  final keeps only a staff manual check of the AzuraCast dashboard alongside
  the planner, with an optional lead to revisit if a paste-in public
  now-playing widget URL is confirmed. Rejected as planner core. (S07,
  retained-not-verified.)
- Rivendell (explicit non-goal, agreed): GPL-licensed Linux, MySQL, and
  AudioScience-based full automation with acquisition, scheduling, playout,
  voicetracking, logging, three logs per host, and hardware integration, used
  by networks. Requires Linux and audio-plant skill plus hardware and database
  operations — the opposite of a no-developer $6k planner. Kept only to bound
  scope against automation creep. (S10.)
- WCAG 1.4.1 Use of Color (governing accessibility default): Level A — color
  is never the only visual means of conveying information, indicating an
  action, prompting a response, or distinguishing a visual element. People
  with color deficiency or low vision, and monochrome or limited displays,
  must receive the information through a second mechanism such as a text
  label or shape. A lightness difference counts as an additional distinction
  only at a relative-luminance contrast ratio of at least 3:1, and content
  that relies on perceiving a particular color (green outline means valid,
  red means invalid) requires an additional indicator regardless of contrast.
  Governs the screen UI directly; print mirrors the same label-redundancy
  rule as station policy. (S01, C01.)
- Paper spine (mandatory regardless of software): a version-stamped derived
  print plus a handoff checklist plus fallback cards plus insert slips. Zero
  marginal cost, works offline, and directly addresses missed post-print
  updates without automation.

## 3. Issue, fix, and release chain (O3)

The Grist chain below is the required at-least-one chain; the O3 obligation
is satisfied by it. No LibreTime, AzuraCast, or Rivendell chain was traced to
the same depth (time-boxed; the LibreTime 4.3 Docker volume bug is noted but
not traced as a fix chain). No evidence is claimed where nothing was fetched.

- Issue: before the patch, a user with only partial read access to a Grist
  document could list version hashes and receive a full list of changes
  between versions through the `/compare` endpoint, including cells, columns,
  and tables they were not supposed to read. Vendor advisory
  GHSA-3v78-cw58-v685 records affected versions below 1.7.6, patched version
  1.7.6, fixed since 1.7.6 by restricting `/compare` to users with full read
  access, with workarounds of removing sensitive history through the
  `/states/remove` endpoint or blocking `/compare`. Vendor severity is
  Moderate 5.3 (CVSS vector AV:N/AC:H/PR:L/UI:N/S:U/C:H/I:N/A:N). A CVE
  aggregator page for CVE-2025-64753 describes the same leak as fixed in
  1.7.7 with CVSS 6.5 MEDIUM (record modified 2026-06-17); the vendor record
  governs — the 1.7.7 release announces the advisory batch while the patch
  version is 1.7.6 — and the aggregator wording is retained only as a noted
  variant. (C04, C03, S04.)
- Same advisory batch, second vulnerability (omitted by the investigator,
  restored here): through the fetch-URL feature, a user could execute a
  request to an external server with privileged network access; the mitigation
  is to route network requests through a trusted proxy (GHSA-qh95-2qv8-pqx3).
  This drives the proxy-or-disable condition on every Grist deployment
  option. The exact fetch-URL default (owner-only or open) and the proxy
  environment knobs are uncertain until the grist-core documentation is opened
  at build. (C03.)
- Hardening in 1.7.9: enabling access rules through the new intro screen
  creates the recommended initial rules, namely disabling the structure
  permission for non-owners, and restricts who can view the access-control
  configuration. (S03.)
- Later fix in 1.7.20 (confirmed): access-rule checks could miss an action
  that followed an undo in the same request, including the check requiring
  permission to edit structure for changes that can affect formulas (commit
  994ff298). A dedication-privacy design on any earlier floor retains a known
  structure-check bypass, so the floor must be at or above 1.7.20 — or the
  latest stable at build — with a pinned tag or digest. If grist-core
  maintains parallel lines with backports, the floor becomes the earliest
  line containing both the `/compare` restriction and the undo-plus-structure
  fix, verified against the changelog at build (recorded build step; no
  backport check was performed in the reviser window). (C05, formerly S11.)
- Relevance: the station will store private dedications and clearance notes
  in the same document as the volunteer-visible schedule. Without the version
  floor plus structure-off plus the proxy condition plus retention purge,
  volunteers could exfiltrate dedications through history, compare, formulas,
  fetch, or copy and download. This makes the retention decision a privacy
  control, not just storage hygiene.

## 4. Criticism dispositions (every finding, with evidence)

### Material findings M1–M12

- M1 (version floor wrong twice; P1/P2/P5, O2/O3): ACCEPT. The vendor
  advisory states affected below 1.7.6, patched 1.7.6, fixed since 1.7.6, at
  Moderate 5.3, and the 1.7.7 release page concurs that versions prior to
  1.7.6 are known vulnerable — so "fixed in 1.7.7" misstates the patch
  version (the 1.7.7 release announces the advisory batch; the patch is
  1.7.6) and "6.5 MEDIUM" mismatches the vendor's 5.3 (aggregator rescoring
  or a later record revision). The reviser verified both wordings in the
  carried excerpts and applies vendor-governs. The floor move to at or above
  1.7.20 is also accepted: the confirmed undo-plus-structure fix is a
  structure-check bypass directly inside the dedication-privacy design, so any
  earlier floor retains a known hole. Every floor condition, validation
  setup, and chain reference now reads "at or above 1.7.20 (pinned tag or
  digest; the `/compare` patch was 1.7.6)" with the 5.3-governs/6.5-noted
  correction. Preserved critic caveat: if a changelog check at build shows
  backports on a parallel line, the floor becomes the earliest line
  containing both fixes.
- M2 (omitted fetch-URL SSRF; P1/P2, O2/O3): ACCEPT. The 1.7.7 release notes
  list two vulnerabilities, and the fetch-URL privileged-network request with
  its trusted-proxy mitigation is verbatim in the carried excerpt yet absent
  from all investigator prose — a genuine omission with same-host relevance
  for a self-hosted no-developer deployment. The final adds the condition in
  disjunctive form (disable or lock the fetch-URL feature, route requests
  through a trusted proxy, or use managed hosting where the vendor owns
  egress) plus a validation (attempt an external fetch from a formula cell;
  expect denial or proxy routing). AMENDED only in certainty marking: the
  exact default and proxy knobs stay uncertain until the grist-core
  documentation is opened at build, per the critic's own could-be-wrong.
- M3 (copy/download plus full-read holes; P1/P2/P5, O6): ACCEPT. Enabling
  rules leaves only owners able to copy or download — verbatim in the carried
  access-rules excerpt — yet the draft never names copy, download, or export
  as an exfiltration path, so validation 1 could pass while a full-document
  copy leaks everything. Likewise `/compare` is restricted to full-read
  users, so any role granted full read still sees private cells in history
  diffs. The final adds copy/download/API-export to the threat list, extends
  validation 1 with per-role copy/download/export attempts, and requires the
  role-to-permission matrix (read, update, create, delete, structure, plus
  full-read versus partial-read per role) to be published with the P5
  decision, with the approval role never silently granted full read.
  Preserved as uncertainty: whether a partial-read copy already applies row
  redaction in current versions needs one document-level check at build; the
  default posture is owner-only.
- M4 (purge ignores backups/exports/logs; P5/P2, O6): ACCEPT. The documented
  `/states/remove` workaround covers history only, while dedications also
  persist in automatic backups or snapshots, volunteer-made exports, copies
  and prints, and webhook or API delivery logs if the sync path logs
  payloads. Validation 6 is extended with backup-rotation, export-inventory,
  and log-redaction pass criteria; where the chosen deployment does not
  expose backups to the station at all, the finding downgrades to stating
  the backup owner plus retention explicitly, and the purge claim is narrowed
  accordingly ("purge removes live plus history copies; backups age out in N
  days; exports are out of scope and governed by policy") with the station
  recording which claim it accepts.
- M5 (P1 overstates push+ack and SSO; P1, O1/O6): ACCEPT. The brief never
  describes an on-call message discipline, device policy, or stream-desk
  staffing, and discovery honestly held push-versus-pull as disagreement —
  promoting push-with-acknowledgement to required had no new evidence. The
  final downgrades the sync discipline to drill-decided with the miss rate
  deciding. The single-sign-on condition is softened to authenticated logins
  from day one with external sign-on optional (only if the station already
  has an identity provider; otherwise built-in team logins), because the
  free-core sign-on claim is search-sourced and unconfirmed and an identity
  provider has cost and fallback-auth questions for a $6k volunteer
  operation. The live-view staleness uncertainty gains its probe (a
  timestamped canary change measured on studio hardware) or the live view
  leaves the safety argument. Preserved uncertainty: the station may already
  run reusable sign-on — asked, not assumed either way.
- M6 (approval workflow ungrounded; P2/P5, O2/O6): ACCEPT. Deny-by-default
  with a nullable approver field is a sound schema but, as written, a schema
  wish: no rule or formula sketch is cited and no validation exercises the
  approval transition, while the "checking new values" mechanism is evidenced
  only at the section-heading level. The final sketches the mechanism
  (new-values conditions gating status and restriction-note transitions to
  the approver role), adds the airtime liveness rule as a station decision
  with a drill-tested default (fail closed with dead-air cover versus fail
  open with an announced restriction), states the interim triage path (anyone
  flags; one named interim contact emergency-clears with a logged who, when,
  and why; every interim clear is reviewed at the next staff check), and
  extends validation 2 with the approval-transition test. Retained
  uncertainty: if new-values conditions cannot express cross-role approval
  without owner intervention, the design upgrades to a second change-request
  table plus lookup, covered by validation 7.
- M7 (print redaction layer unproven; planner-outage scope; P3, O2): ACCEPT.
  No evidenced Grist print or export template feature enforces row redaction
  independently of the view being printed; if print is browser-print of a
  filtered view, the control is view-level plus who-may-open-which-view. The
  final restates the requirement as print-only-from-named-redacted-views with
  full-view print disabled by role or by procedure plus audit, each print
  carrying version, timestamp, range, vocabulary, and redaction marker, and
  validation 3 gains the negative print test. The planner-outage fallback
  extension is kept as sensible, with the added offline-clear rule and the
  version-stamp procedure paragraph. Preserved uncertainty: server-side
  redacted print layouts may exist in unopened layout documentation — the
  "template level" wording may be reinstated only with an exact template-doc
  citation; view-level wording governs until then.
- M8 (WCAG scope overclaim; brittle 100% bar; P4, O6): ACCEPT. The success
  criterion governs web content and the carried Understanding page confirms
  that scope; calling paper "WCAG conformance" is a category error. The final
  separates the claims (screen meets the criterion; print mirrors the
  label-redundancy rule as station policy, tested the same way) and replaces
  the n=1 "100%" bar with a defined sample (all 9 staff plus at least 2
  volunteers), a full item set (every status on print and screen), a
  realistic bar (all items correct with one retry after a template fix, or at
  least 95% first-try with no systematic confusion pair), and the icon
  constraint (black-and-white-distinguishable shapes redundant with words,
  never hue-only glyphs). The P4 disposition and the verbatim criterion
  quotation are otherwise agreed and preserved.
- M9 (minimal-retention interim default contradicts user-decision; P5, O5):
  ACCEPT. Holding retention as a station decision and then shipping the
  shortest tolerable retention as a default fills the very decision the
  final refuses to judge (legal or grant floors need counsel). The
  one-sided privacy default is struck and replaced with the quarantine
  posture (collect minimally, owners-only, no volunteer-visible history,
  manual delete on request, purge drill on candidates) while the 30/90-day
  candidates stay as test options. The station plus counsel chooses the
  period.
- M10 (dual-prototype same-week drill unbuildable; P6, O6): ACCEPT. A
  no-developer volunteer desk cannot build and run two schedule models for
  the same air week, the same week cannot air twice, and two different weeks
  are confounded. The disposition (user decision plus uncertain,
  mechanism-neutral) is agreed; the procedure is replaced with a tabletop
  replay of one real past week on paper under both layouts, scored for break
  misses plus confusion, followed by a one-week live pilot of the winner,
  with the station picking or deferring with a revisit date. AMENDED with
  the critic's own near-free proviso: where Grist makes the second prototype
  near-free (same tables, two saved views), both views are shown in one
  drill session with that near-zero cost stated. The
  stream-versus-transmitter break mapping is kept and relabeled as an
  enhancement pending station confirmation of the break rules.
- M11 (growth paths lack mechanisms; fallback non-vendor; O1/O2): ACCEPT in
  all four limbs. (a) LibreTime planning-only reuse: the install evidence
  confirms the operations surface but shows no planning-only mode, so the
  growth path carries the untested proviso plus trial and managed-hosting
  requirements. (b) AzuraCast feed: no mechanism was shown and Grist-side
  polling would be disguised developer work, so the enhancement is demoted to
  a manual dashboard check with an optional lead (revisit if a paste-in
  public widget URL is confirmed). (c) NocoDB/Baserow: the comparison is
  third-party and stays preliminary; the row-privacy tier cell becomes a
  vendor-pricing confirmation step before any switch rather than a confirmed
  justification. (d) AzuraCast beta and Grist self-host claims stay
  retained-not-verified with beta re-verification at build. The Rivendell
  non-goal verdict is agreed with no further evidence needed.
- M12 (validations assume developer operations; arbitrary thresholds; O6):
  ACCEPT. Every Grist check as written assumes someone can spin up documents
  and users, drive API consoles, and interpret history diffs; the final
  names an owner for each validation (station staffer with a one-page guide,
  vendor trial support, or a skilled volunteer if the station answers yes)
  and provides no-developer-runnable variants (managed trial instead of
  Docker, checklist drills instead of API probes where possible, legibility
  via black-and-white print plus the station devices' own color-vision
  filters plus the limited-perception staffer as oracle, with tool and
  version recorded at run time). The pre-patch throwaway instance is STRUCK
  as irresponsible — the control is proven on the patched version with
  negative tests while the advisory is cited for pre-patch behavior. All
  pre-set thresholds become measure-first-then-set service levels: each drill
  runs two to three times, the distribution is recorded, and the bar is fixed
  with the station. The small-scope note (small-product checks, not
  production guarantees; no load, high-availability, or full-security audit)
  is preserved.

### Minor findings m1–m8

- m1 (changed-since-print is an overlay, not a fourth status): ACCEPT. The
  schema is `status` in {CLEARED, RESTRICTED, PENDING} plus a boolean
  `changed_since_print`; all P2/P4 prose uses the split form.
- m2 (untagged Docker image drifts): ACCEPT. Every runbook mention pins an
  explicit `grist-core` tag or digest at or above 1.7.20.
- m3 (version-stamp procedure underspecified): ACCEPT. The one-paragraph
  procedure (who bumps, which clock, where the acknowledgement is recorded)
  is in P3 and recorded by validation 3.
- m4 (LibreTime upgrade trivia is noise): ACCEPT. Compressed to one line
  (the 4.x line has had breaking upgrade notes; a managed host must own
  upgrades).
- m5 (P4 duplicates the brittle bar): ACCEPT. Fixed once under M8; P4
  references validation 4 instead of restating a bar.
- m6 (v1.7.20 "unconfirmed" label is stale): ACCEPT. Flipped to confirmed
  with the floor move under M1; the label appears nowhere else.
- m7 (O3 must read as satisfied): ACCEPT. §3 states explicitly that the
  Grist chain satisfies the at-least-one-chain obligation, with absent
  chains honestly noted.
- m8 (drift note must carry into the final): ACCEPT. §8 carries the mutable
  versus immutable source notes from the source map.

No critic disposition required full reversal of a draft correction, and no
rejected item required reinstatement as core. The two closest calls resolve
as: push-with-acknowledgement downgraded to drill-decided rather than struck
(M5), and the LibreTime/AzuraCast growth roles kept with mechanism provisos
rather than promoted or cut (M11). Per-P critic verdicts of
agree-with-correction stand for all six plan clauses.

## 5. Validations: executed versus proposed (O6)

Executed (all stages, no runtime, honest): the brief was read and discovery
frozen before plan reveal; official documentation, release, and advisory pages
were fetched read-only and compared across install requirements, ports,
access-rule semantics, the WCAG criterion text, and the CVE and advisory fix
versions; the critic re-fetched six sources read-only and the reviser
re-read all seventeen excerpts plus both source maps to verify the conflicts
behind §4. No code was executed, no instance launched, no sandbox witness run.
No proposal below is presented as run.

Proposed (must run before build; each maps to plan clauses; pass or fail
discriminates; each names an owner and a no-developer variant; every
threshold is measure-first-then-set — run two to three times, record the
distribution, then fix the bar with the station):

1. Dedication-leak (P1, P2, P5). Setup: Grist at or above 1.7.20 (pinned)
   with a private row and one user per station role. Attempts as each
   non-owner role: history read, `/compare`, copy, download, and API export.
   Expect denial or redaction on every path; fail on any private cell leak.
   Owner: station staffer with a one-page guide on a managed trial, or vendor
   trial support. (Struck: any pre-patch throwaway instance — the control is
   proven on the patched version; the advisory is cited for pre-patch
   behavior.)
2. Structure-bypass plus approval-transition (P1, P2, P5). As a non-owner
   without structure access, attempt a formula referencing a hidden column;
   expect denial or masking. Then the approval transition: a non-approver
   edit to status or restriction note stays pending; an approver edit moves
   it to cleared or restricted; the airtime pending rule is observed in a
   rehearsed handoff. Fail on any bypass or silent clear. Owner: as in 1.
3. Print-versus-live sync (P1, P3). Print vN, change a news insert plus a
   restriction, and run both sync candidates: push with acknowledgement, and
   live-view pull on a fixed cadence. Record miss counts and acknowledgement
   latencies; the measured miss rate decides the discipline, and the
   acknowledgement service level is set from the runs. Include the negative
   print test (full-view print as stream operator; expect denial or redacted
   output), the staleness probe (timestamped canary change measured on studio
   hardware before the live view may join the safety argument), and the
   version-stamp recording (who bumped, which clock, where the acknowledgement
   sits). Fail on any unacknowledged post-print change or any dedication on
   an unauthorized print. Owner: duty operator plus stream operator with a
   checklist; no software beyond the planner and the station's phones.
4. Label-only legibility (P4, P3). Black-and-white print plus the station
   devices' own color-vision filters; the limited-color-perception staffer
   plus the full sample (all 9 staff, at least 2 volunteers) identify every
   status on print and screen without color cues. Bar: all items correct with
   one retry after a template fix, or at least 95% first-try with no
   systematic confusion pair; icons must be black-and-white-distinguishable
   shapes. Record tool and version at run time. Fail on any color-only cue or
   any systematic confusion pair. Owner: station staffer with the template
   packet.
5. Fallback drill (P3, P1). Offline 30-minute paper run plus handoff under
   the fallback card, with the phone and message-tree reachability pre-check
   and the offline-clear rule for news inserts exercised. Verify no
   dedication exposure (spoken or shown) and no break missed. Fail on any
   exposure or miss. Owner: duty operator pair with the card.
6. Retention purge (P5, P2). Apply the 30-day and 90-day candidates in turn:
   delete rows, purge history (`/states/remove` equivalent), rotate backups
   per the rotation criterion, inventory exports, and check webhook and API
   logs for payload redaction. Verify a partial user cannot recover
   dedication text via history, compare, backups, or logs. Fail on any
   tombstone, history, backup, or log leak — or record the narrowed claim
   the station accepts. Owner: staffer or vendor support per deployment.
7. Onboarding (P1, P2, P6). Two rotating hosts with the one-page guide only:
   find a clearance, hand off a show, handle the transmitter-break variant
   under the walkthrough winner (plus the second-table path if the approval
   fallback in P2 is needed). Time-to-correct is measured first and the bar
   set from the runs. Fail if developer help is needed. Owner: observing
   staffer with a stopwatch and checklist.
8. Break-layout walkthrough plus pilot (P6, P1). Tabletop: one real past week
   replayed on paper under both layouts (single with transmitter columns;
   split with shared-program link), scored for missed or wrong local breaks
   plus volunteer confusion reports; where Grist makes the second prototype
   near-free, both saved views are shown in one session. Then a one-week live
   pilot of the walkthrough winner. The station picks single versus split or
   defers with a revisit date. Owner: scheduler plus two volunteers.
9. Fetch-URL egress (P1, P2). From a formula cell, attempt an external fetch;
   expect denial or trusted-proxy routing per the deployed disjunct, and
   confirm the exact default plus proxy knobs from the documentation at run
   time. Fail on any direct privileged-network request. Owner: whoever holds
   the deployment (staffer on a managed trial; vendor support otherwise).

Scope: small-product checks for this brief, not production guarantees; no
load, high-availability, or full-security audit is claimed.

## 6. Alternatives, conditions, disagreement, and uncertainty (O5 retained)

- Alternatives retained: §2 keeps all six — Grist as primary plus the
  paper spine, NocoDB/Baserow as preliminary fallback, LibreTime as a
  proviso-bound growth path, AzuraCast as a demoted manual stream complement,
  Rivendell as an explicit non-goal. No alternative was silently dropped;
  two were demoted or bounded with written provisos (M11).
- Conditions: Grist only with the version floor pinned, structure off for
  non-owners, the proxy-or-disable egress disjunct, authenticated logins,
  copy and download locked to owners, the role matrix published, and purge
  tied to retention; LibreTime or AzuraCast only with managed hosting (or
  proven volunteer Linux skill) plus backups and their provisos met; print
  only if versioned, synced under the drill-decided path, and redacted
  through named views; retention, approval, and schedule scope only per
  station decisions.
- Original constraints preserved: $6k per year, no in-house developer, nine
  staff plus rotating volunteers, days-ahead builds plus minutes-before
  news changes, label-plus-color status, manual fallback, and a planning
  and handoff aid with no automated broadcast.
- Disagreement preserved: push-versus-pull stream sync (drill decides; the
  researcher recommends neither unconditionally); single-versus-split
  schedule (walkthrough plus pilot decides); approval-role value, retention
  period, and airtime liveness default (station decides); the narrowed
  versus extended purge claim (station records which it accepts).
- Uncertainty preserved: grist-core parallel-line or backport status (floor
  wording covers; changelog check at build); fetch-URL defaults and proxy
  knobs (documentation at build plus validation 9); new-values approval
  expressiveness without owner intervention (custom-rules documentation at
  build; second-table fallback ready); server-side redacted print layouts
  (exact template-doc citation or view-level wording governs); fallback
  row-privacy tiers and Fair-Code internal-use reading (vendor pricing
  documentation before any switch); AzuraCast beta status (re-verify at
  build); volunteer devices and live-view latency (staleness probe);
  retention law or grant floors (counsel); music-clearance policy (station).
  Each item is marked where used; none is presented as fact.
- Optional leads kept: AzuraCast public widget URL revisit; LibreTime
  planning-only trial; managed Grist trial as the no-developer validation
  path. Product decisions kept: all P5/P6 items plus liveness, sync
  discipline, purge-claim scope, and icon set.

## 7. Station questions and decision log

Ask before build (answers gate resourcing, not the design): (1) does the
station already run an identity provider the planner can reuse? (2) what is
the hosting arrangement — managed trial, vendor host, or self-hosted box?
(3) does any volunteer have Linux skill for hosting or validation support?
Decide and record with date plus decider: approval role for usage-note
changes; listener-request retention period (with counsel); single versus
split schedule (after the walkthrough plus pilot, or defer with a revisit
date); airtime pending rule (fail closed versus fail open); push-versus-pull
sync discipline (after validation 3); purge-claim scope (extended versus
narrowed); icon set. The role matrix and the acknowledgement service level
are published with these decisions.

## 8. Source notes (drift, governance, lineage)

Source IDs are immutable across the three stages of this arm: S01–S11 from
research, C01–C06 from the critic, no new reviser IDs. Nothing was rebound;
S05 (cited-via-CVE) is superseded for content by the direct C03/C04 fetches
but retained for lineage, S11's unconfirmed label is superseded by C05, and
S04's fix-version and score wording is superseded by vendor C04 while the
aggregator variant is noted. Mutable web sources (W3C Understanding pages,
the Grist help center, forum, press, and comparison pages) may drift
editorially — snapshots are retained in `sources/` with access timestamps —
while release tags, the GHSA advisory, the CVE identifier, and the LibreTime
Stable 4.x branch are stable references. Stable released code was preferred
where relevant (grist-core tags, GHSA, CVE, Stable 4.x). No campaign,
history, evaluator, or counterpart material was read; no nested agents ran;
no repository, account, or configuration changes were made. Only existing
qualified sandbox execution would run witnesses — none ran, and §5 proposes
checks honestly instead.

---
Predeclared fallback: this final.md (+ source-map.json + sources/index) is the
complete reviser deliverable for this scope. Short status cannot replace it.




