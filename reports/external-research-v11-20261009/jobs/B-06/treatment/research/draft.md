# I06 Draft — Planning deliverable with exact per-P disposition (post-reveal)

Case: I06 | Block B-06 / treatment / research | Method M14 (Muse retained investigator)
Brief: `cases/I06/brief.md` (read pre-reveal). Revealed plan: `revealed-plan.md` (read only after
`discovery.md` + `source-map.json` were saved; `discovery.md` was not rewritten after reveal).
Sources: `source-map.json` IDs S01–S19, evidence in `sources/` + `sources/index.md`.
Status: complete planning deliverable for this scope; later stages may correct it.

## 0. Disposition vocabulary (used exactly once per P clause, with sub-findings as needed)

- ALREADY-COVERED: the P clause is satisfied by a discovery finding as stated; no change needed.
- CORRECTION: the P clause as stated is wrong or unsafe in some respect; this draft corrects it
  with evidence.
- OPTIONAL ENHANCEMENT: a discovery finding usefully extends the P clause but is not required to
  satisfy it; adoption is recommended, not mandatory.
- USER DECISION: the P clause (or a sub-point) cannot be settled by research; it needs a named
  station decision with options and a decision rule.
- REJECTED: a considered approach is explicitly not recommended for this scope, with reasons.
- UNCERTAIN: evidence is absent, inapplicable, or too weak to decide; the uncertainty and the
  discriminating check are stated.

## 1. Exact per-P disposition

### P1: "Provide a shared show schedule and operator handoff view for both transmitters and the web stream."

Verdict: ALREADY-COVERED in intent, with CORRECTION + OPTIONAL ENHANCEMENTS + carried USER DECISION.

- ALREADY-COVERED: discovery F1 (Grist substrate) satisfies the shared-schedule + handoff core:
  one Programs/Segments/Handoffs model, role-scoped views (studio vs web-stream operator), live
  view plus timestamped handoff note. F4 (AzuraCast station-scoped permissions) and F3 (LibreTime
  show calendar + history) confirm the domain shape: a calendar of shows feeding a per-shift
  handoff view is the right object model.
- CORRECTION (privacy): P1 as stated omits the brief's C6 constraint — the handoff view must NOT
  expose private listener dedications. A single "shared view" implemented naively (one printout,
  one shared login, one unfiltered table) violates the brief. Correction, evidenced by S11: the
  handoff view MUST be a redacted projection — Dedications isolated in a deny-all-non-owner table
  (condition `user.Access != OWNER`, R/U/C/D denied) or redacted columns, Editors WITHOUT the
  structure permission S (S11 warns S lets formulas circumvent data rules), verified per role via
  "View as" (V1/V2). The shared schedule and the handoff view are therefore TWO views over one
  model, not one screen.
- CORRECTION (staleness): P1 as stated does not fix the brief's observed failure — post-print
  updates missed by the web-stream operator. A shared view that is only consulted at print time
  reproduces the bug. Correction: the live view is authoritative; any print/export carries a
  version stamp ("exported at …, live version may differ; confirm inserts with studio") and a
  defined insert signal (version counter + studio call-out/chat) with an acknowledgement step.
  Validation V4 drills exactly this. The LibreTime O3.1 chain (S02/S03) reinforces that
  schedule-accuracy failures are a live risk class, not a theoretical one.
- OPTIONAL ENHANCEMENT (priority semantics): adopt AzuraCast-style insert priority (S10: scheduled
  inserts outrank general rotation; explicit numeric priorities post-2024-09-01) as a displayed
  rule — "news insert overrides block, reason shown" — so last-minute changes are deterministic
  and auditable rather than tribal knowledge.
- OPTIONAL ENHANCEMENT (history): adopt LibreTime-style playout/schedule history (S05) as a
  read-only "what actually aired" log alongside the plan, aiding the next operator and incident
  review. Not required by P1; recommended.
- USER DECISION carried: P1's "for both transmitters and the web stream" is qualified by P6/D3
  (one vs per-output schedules). This draft carries both shapes (see P6); P1 alone does not settle it.
- REJECTED for P1's implementation: building P1 on a broadcast playout stack (LibreTime playout,
  AzuraCast AutoDJ, Rivendell automation). Reasons: brief C9 non-goal, C2 no-developer ops cliff
  (S04/S08 install/ops burden), C4 budget. Their planning/permission semantics are adopted; their
  stacks are not.

### P2: "Track clearance status and restrictions at the track or clip level used in a show."

Verdict: ALREADY-COVERED in intent, with CORRECTION + OPTIONAL ENHANCEMENTS.

- ALREADY-COVERED: discovery requires per-segment clearance state (CLEARED / RESTRICTED / PENDING
  or equivalent) with a restriction note field at track/clip granularity. Grist reference columns
  + conditional formatting + card views (S11/S15) implement this without code.
- CORRECTION (approval workflow): P2 tracks status but the brief (C5) adds that the ROLE approving
  usage-note changes is undecided (D1/P5). A free-text restriction field with no approval state
  lets any editor rewrite the legal basis of a clearance silently. Correction: usage notes carry
  an approval state machine (e.g. PROPOSED → APPROVED, with approver identity + timestamp), where
  the approver ROLE is a placeholder resolved by station decision D1. Until D1 is decided, default
  to Owner-only approval (least privilege), recorded as a condition, not a seizure of the decision.
- OPTIONAL ENHANCEMENT (remaining-time guard): any duration-aware clearance/scheduling aid MUST
  carry the O3.1 regression shape as a test (V3: 30-min show + 5 + 5 + remaining-fill ⇒ full fill,
  no 3–5 min gap). This is optional only in the sense that a pure checklist with no durations can
  skip it; if durations are computed anywhere, V3 is mandatory.
- OPTIONAL ENHANCEMENT (rights reminder): AzuraCast's explicit disclaimer that it does not ensure
  music licenses/royalties (S08) should be mirrored as UI copy — "clearance here is the station's
  record, not a license grant" — to prevent the tool's presence from implying legal coverage.
- UNCERTAIN: whether restriction notes need rich attachments (PDFs, license letters) or plain text
  suffices. Brief is silent. Carried as uncertainty U2 with a file-column option and a storage
  implication (Grist/Baserow storage caps, S12/S16).

### P3: "Preserve a printable daily log and a manual fallback for transmission interruptions."

Verdict: ALREADY-COVERED in intent, with CORRECTION + OPTIONAL ENHANCEMENT.

- ALREADY-COVERED: discovery F6 + fallback conditions preserve BOTH halves: a printable daily log
  (per-show segments, clearances, handoff notes) AND a manual fallback for transmission
  interruptions (single-file HTML rundown on studio machines + USB + paper). The general pattern
  (Owner-context redacted export, visibly timestamped) satisfies P3 with any substrate; TiddlyWiki
  v5.4.1 (S19) is one concrete carrier, static export the general one.
- CORRECTION (redaction at generation): P3 as stated could be read as "print everything". That
  leaks dedications onto paper/USB. Correction: the print/export pipeline MUST run in an
  Owner-context job that enforces the same deny rules as the live handoff view (S11), and the
  fallback copy MUST be verified dedication-free (V7). Paper is a privacy boundary, not just a
  medium.
- CORRECTION (reconciliation): P3 as stated ends at "fallback exists". The brief's failure mode
  (divergence between printed and live) applies to fallback too. Correction: the fallback carries
  an explicit reconciliation procedure — run-from-paper during outage, then reconcile paper
  annotations back into live on reconnect, with the version stamp as the join key. V7 drills this.
- OPTIONAL ENHANCEMENT (format): generate the fallback as BOTH paginated print CSS and single-file
  HTML from the same redacted snapshot, so the studio can use whichever survives the incident
  (printer vs machine). No extra data model; one snapshot, two renderings.

### P4: "Use text labels with status cues so operators do not rely on color alone."

Verdict: ALREADY-COVERED, strengthened to a normative MUST (no correction to intent; scope widened).

- ALREADY-COVERED: discovery F7 (S18, WCAG 2.1 SC 1.4.1 Level A) already requires exactly this:
  every clearance/status state carries a text token (CLEARED / RESTRICTED / PENDING) plus a
  non-hue cue (icon/shape/position) in ALL views. P4 and F7 agree; P4 is the plan's correct
  restatement of the brief's C7.
- Scope note (not a correction): S18 adds two bindings P4's wording leaves implicit — (a) the
  rule applies to print and exported HTML as well as live screens (print stylesheet must preserve
  labels; no color-only print); (b) lightness-only distinction (≥3:1) does NOT suffice where the
  user must differentiate specific colors (green-valid/red-invalid — exactly this case), so labels
  are mandatory, not a theme option. V6 (grayscale + deuteranopia/protanopia simulation on every
  view) is the acceptance check. Assistive-tech conveyance (1.1.1/1.3.1/4.1.2) is additionally
  required but does not substitute for the visible label.

### P5: "Approval authority for usage-note changes and retention of listener requests are station decisions."

Verdict: USER DECISION (both halves), with decision scaffolding provided (options + defaults + rules).

- D1 — approver role for usage-note changes: genuinely undecided per brief and plan. Options
  carried: (i) single station manager (simplest, bottleneck risk); (ii) any of 2 designated senior
  staff (cover + separation); (iii) program producer for own show + manager override (fastest,
  weakest control). Interim default until decided: Owner-only approval in the tool (least
  privilege), with the role field a placeholder the station renames — the tool must not hard-code
  a job title. Decision rule: pick the smallest approver set that still covers every air week
  including holidays; record approver identity + timestamp on every approval.
- D2 — listener-request retention: genuinely undecided; NO legal research was done and none is
  invented here. Options carried: (i) session-only (delete after show + reconciliation window);
  (ii) fixed window (e.g. 30/90 days, then auto-purge); (iii) indefinite with consent + audit.
  Tool requirement regardless: retention MUST be a configurable policy (retention-days parameter +
  scheduled purge + purge log), never hard-coded, because the decision is pending and may change
  with legal advice. Sizing note: retention choice interacts with record caps (S12/S16) — indefinite
  retention forces the higher tier or an archive document/workspace. Validation V8 measures real
  growth so the tier decision rests on data.
- Neither half is ALREADY-COVERED (nothing to cover — the decision is the deliverable) and neither
  is UNCERTAIN in the evidential sense (the brief explicitly reserves them). They are USER DECISION
  with a MUST-HAVE property: the tool ships with placeholders + safe defaults, not with the
  decisions pre-empted.

### P6: "Whether differing local breaks need separate schedules is not settled."

Verdict: USER DECISION, with both shapes specified and a divergence trial as the decision rule.

- Shape 1 (unified + overrides): one schedule; local-break differences expressed as override rows/
  columns per transmitter. Cheapest to operate; matches P1's "shared view" most literally. Risk:
  override-column misreads under time pressure (the exact failure class the brief reports for the
  printed log). Precedent: none of the broadcast candidates use this as their primary shape.
- Shape 2 (per-output logs with inheritance): each transmitter + web stream gets its own log;
  shared blocks inherited from a master, local breaks native to each log. Precedent: AzuraCast
  station-scoped permissions (S09: global vs per-station) and Rivendell's up-to-3-logs-per-machine
  (S17). Cost: three logs to maintain, but each operator sees exactly their own truth — which is
  what the web-stream operator lacked.
- Decision rule (V9): run Shape 1 for 2 weeks; count on-air mistakes or near-misses attributable
  to the override column. Zero ⇒ stay unified. Any ⇒ split to Shape 2. The tool MUST therefore
  support both shapes (a scope/per-output field on every schedule row from day one), so the trial
  does not require a rebuild. Like P5, this is USER DECISION, not UNCERTAIN — the brief reserves
  it to management, and research provides the trial, not the answer.

## 2. Retained findings (what survives from discovery, in full prose, not IDs)

R1. Recommended substrate: Grist — Community self-host ($0 + donated/contracted ops) if a volunteer
or contractor can carry Linux/VPS ops inside $6k, else SaaS Pro (≈ $864–1,080/yr for 9 staff at
$8–10/user/mo). Conditions: 1–2 trusted Owners ONLY; hosts as Editors WITHOUT structure permission;
Dedications deny-all-non-owner (table or columns); rules saved and "View as"-tested per role;
retention parameterised for D2. Evidence: S11 (rules semantics + S-bypass warning), S12 (pricing +
5k/100k/150k records-per-document + history windows), S14/S15 (self-host path).
R2. Priced alternative substrate: Baserow Advanced (≈ $1,944/yr for 9 at $18/user/mo annual) —
required tier for role-based permissions + audit logs; Premium is disqualified on privacy at any
price. Per-workspace rows (3k/50k/250k/1M) punish single-workspace multi-year logs, so D2 must
resolve before tier commitment. Evidence: S16.
R3. Planning-semantics donors (design adopted, stacks rejected): LibreTime calendar + smartblock-
remaining + history (S02/S04/S05) and AzuraCast station-scoped permissions + playlist priorities +
scheduled blocks (S09/S10). Both broadcast stacks rejected for build under brief C9 (non-goal),
C2 (Linux ops cliff), C4 (budget). Rivendell v4.5.0 (S17) rejected hardest — dedicated
workstation + pro audio + broadcast engineering is the antithesis of this scope; its only
transferable point is per-output logs precedent for P6/Shape 2.
R4. Fallback carrier: Owner-context redacted single-file HTML + paginated print from one snapshot,
timestamped, stored on studio machines + USB + paper, with a run-and-reconcile procedure (P3
corrections). TiddlyWiki v5.4.1 (S19) is one implementation; static export is the general pattern.
R5. Accessibility is normative: WCAG 2.1 SC 1.4.1 Level A (S18) makes labels mandatory in every
view incl. print; V6 is acceptance.
R6. Scheduling-accuracy caution: LibreTime PR #3026 → 4.2.0 → 4.3.0 subset-sum chain (S02/S03) is
the governing precedent for any duration arithmetic: reproduce its test shape (V3) or drop
durations to a display-only field with no fill computation.
R7. Original constraints preserved verbatim in force: $6k/yr all-in (C4); no in-house developer
(C2); 9 staff + rotating volunteers (C2); days-ahead + minutes-before horizons (C3); clearance +
restriction notes (C5); dedication privacy incl. paper (C6); labels-not-color (C7); manual fallback
(C8); no automated broadcast (C9); three open decisions D1/D2/D3 (C10/P5/P6).

## 3. Conditions (must hold for the recommendation to stand)

K1. Owners ≤ 2 trusted staff; no host holds the structure permission S (else redaction is
circumventable per S11). Verified by V1/V2.
K2. Dedications deny rules exist BEFORE any volunteer is onboarded; onboarding order is
rules-first, users-second.
K3. Live view is authoritative; every print/export carries a version stamp + insert-signal
procedure with acknowledgement (V4).
K4. Fallback snapshot is Owner-generated, dedication-free, timestamped, and reconcilable (V7).
K5. Status labels in every view incl. print (V6).
K6. Retention is a parameter + purge + purge log, not a constant (pending D2).
K7. Every schedule row carries an output-scope field from day one (pending D3/P6 trial).
K8. Annualised cost ≤ $6k with 20% headroom on measured (not estimated) seats/rows/storage (V8).
K9. If durations are computed anywhere, V3 passes; else durations are display-only.

## 4. Alternatives (kept live, not collapsed)

- Substrate swap Grist → Baserow Advanced (R2) if the station prefers Baserow's views/API or if
  Grist's rule model proves unteachable to the designated Owners. Cost delta ≈ +$1k/yr; privacy
  bar unchanged (V1/V2 re-run on the new substrate).
- Self-host ↔ SaaS swap within Grist as ops capacity clarifies (volunteer sysadmin appears or
  disappears). Data model and rules transfer; only hosting + seat accounting change.
- P6 Shape 1 ↔ Shape 2 per the V9 trial outcome. No rebuild: the scope field (K7) makes this a
  view change, not a migration.
- Fallback carrier swap TiddlyWiki ↔ static export ↔ paper-only, per studio drill results (V7).
  The invariant is redaction + timestamp + reconciliation, not the file format.

## 5. Optional capabilities (recommended, not required)

- Playlist-priority display semantics (S10) for inserts (P1 enhancement).
- Read-only "what actually aired" history alongside the plan (S05 heritage).
- Rights-reminder UI copy ("station record, not a license grant", S08 heritage).
- Approval state machine on usage notes with placeholder role (P2 correction — optional only in
  that a station could defer it past pilot, at its own risk; recommended from day one).
- Dual-format fallback (print CSS + single HTML) from one snapshot (P3 enhancement).
- Rich attachments on restrictions (pending U2; plain text is the default).

## 6. User decisions (explicitly reserved, with scaffolding)

- D1 approver role (P5): three options + interim Owner-only default + coverage decision rule (§1/P5).
- D2 retention (P5): three options + parameterised tooling + legal-advice flag + sizing interaction
  (§1/P5). No invented law.
- D3/P6 schedule shape (P6): two shapes + V9 divergence trial + day-one scope field (§1/P6).

## 7. Uncertainty (declared, each with its resolver)

U1. Volunteer seat/identity count + turnover. Resolver: V8 pilot measurement. Assumed bounded
(rotating logins or viewer seats); if volunteers need full Editor seats at SaaS prices, cost model
changes and self-host may become mandatory.
U2. Restriction attachments (text vs files). Resolver: ask the station for 5 real restriction
examples during pilot setup; add file columns + storage headroom only if examples demand it.
U3. Retention law/policy (D2). Resolver: station seeks advice; tool ships parameterised meanwhile.
No research claim made.
U4. Ops capacity (any volunteer/contractor for Linux/VPS). Resolver: direct ask + V8 support-load
log. Decides self-host vs SaaS.
U5. Exact print/signal workflow (who prints, when, how web operator is hailed). Resolver: V4 drill
design session with the actual operators; the tool provides version stamps, the station provides
the hail channel (call-out, chat, radio cue).
U6. Record-growth rate (≈ 50 segments/day assumed). Resolver: V8 measurement; Free-tier fit
rejected on arithmetic already (18k rows/yr > 5k/doc), Pro fit confirmed pending measurement.
U7. Grist access-rule regression surface (O3.2 absence). Resolver: V5 targeted issue search; no
claim made until run.
U8. LibreTime #747/#741/#802 related history cited as pointers only (bodies not retained).
Resolver: none needed for this scope — O3.1 chain (S02/S03) already carries the scheduling-accuracy
requirement; the pointers are disclosed as unretained, not as evidence.

## 8. Validations: executed vs proposed (discriminating, no pretending)

### Executed (static evidence work; no runtime)

E1. Seventeen retained evidence files + SHA-256 + access stamps (sources/, FETCH_TIMES.txt) with
per-source observed operations (source-map.json S01–S19). Every O2/O3 factual claim in discovery
and every per-P correction above traces to a retained file + quoted locator.
E2. Negative locators: LibreTime `/schedule/` 404 retained (S06); AzuraCast guessed users URL
0 bytes discarded and disclosed (source-map failed_attempts). No silent rebind.
E3. Cost arithmetic from retained pricing bytes (S12/S16) against the $6k envelope; Free-tier
rejection by arithmetic (U6). No trial started; all usage/billing null.
E4. No code executed, no containers, no accounts, no installers — per assignment constraints.
Everything below is PROPOSED.

### Proposed (each discriminates a live decision; pass/fail stated in discovery §6)

V1 dedication-redaction proof → discriminates configured-vs-theatre (K1/K2). V2 structure-trap
test → justifies withholding S. V3 remaining-time regression (O3.1 shape) → qualifies any duration
arithmetic (K9). V4 insert-latency drill → fixes the web-operator miss (P1 correction). V5 rule-
regression search → completes O3.2 (U7). V6 color-independence → accepts P4 in every view incl.
print. V7 fallback drill → accepts P3 redaction + reconciliation (K4). V8 cost/seat pilot →
accepts substrate + tier inside $6k (K8; resolves U1/U4/U6). V9 divergence trial → settles P6/D3
(Shape 1 vs 2). Full procedures in discovery §6; not repeated here to avoid drift — discovery
remains the procedure source, this draft the decision mapping.

## 9. Obligation check (O1–O6)

O1 (unfamiliar tools beyond thin plan): Grist, Baserow, LibreTime, AzuraCast, Rivendell,
TiddlyWiki, WCAG-1.4.1-as-design-input — all discovered from the brief alone pre-reveal (§1–2,
R1–R5). O2 (primary-source behaviour/defaults/limits/applicability): S11 rule semantics + S-bypass,
S12/S16 record/row units + tiers, S04/S08 install envelopes, S09/S10 permission + priority
semantics, S17 rejection envelope, S18 normative rule — each with governing values quoted (§1–2,
discovery §3). O3 (issue/fix/release chain): O3.1 LibreTime #3026→4.2.0→4.3.0 with absences
declared (R6, U7/U8). O4 (per-P comparison): §1 above, every P1–P6 with exact verdicts. O5
(alternatives/conditions/constraints/disagreement/uncertainty in coherent final prose): §2–7, no
ID-substitution. O6 (discriminating validations, executed vs proposed): §8 + discovery §6, no
runtime pretended.

## 10. What draft does NOT do (boundary honesty)

- Does not rewrite discovery (frozen pre-reveal; procedures live there).
- Does not pre-empt D1/D2/D3 (scaffolded, reserved).
- Does not recommend a broadcast-stack build (rejected with evidence; semantics adopted only).
- Does not claim any runtime verification (E4; V1–V9 proposed with discriminating power stated).
- Does not invent law (D2), volunteer counts (U1), ops capacity (U4), or growth rates (U6).

---
*Draft complete post-reveal, pre-critic. Next: wait for `../critic/READY.json` per polling limits
(15–45s), no new science while waiting; then disposition the frozen critique in this same context
and author `final.md` before native Goal completion.*
