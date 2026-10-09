# ER11 B-08 control / critic — critique (I08, M15 v1)

Case I08 (school-district band instrument lending + repair). Method M15 v1
fresh-factored-verification-with-full-criticism, control arm, critic stage.

Inputs independently inspected in full (per input-map.json): exact brief
(`cases/I08/brief.md`); own-arm predecessor research `draft.md`, `discovery.md`,
`source-map.json` (S01–S12), `revealed-plan.md` (P1–P6); source root
`research/sources/` (`evidence.md`, `index.md`). Plus independently fetched public
primary sources C01–C06 (see `source-map.json`, `sources/evidence.md`,
`sources/index.md`). No campaign/history/evaluator/counterpart read, no nested
agents, no runtime/sandbox witness (none qualified/available), no code executed.
Usage/billing unobserved (null) throughout.

Critic source IDs C01–C06 are this stage's immutable evidence keys; S01–S12 are the
research stage's keys, cited here and never rebound. Every finding below states its
substance in prose; IDs locate evidence, they do not replace text.

## Verdict

The draft is structurally honest and unusually well-scoped: per-P dispositions for all
of P1–P6, alternatives/conditions/uncertainty retained, executed-vs-proposed
validations separated, absent evidence declared rather than invented, and the P5
deferral shape is correct. The Snipe-IT release chain, the PocketBase
stateless-auth/view claims, the PTAC directory-information account, and the WCAG
reflow substance all survive independent re-fetch (see Confirmed).

Against that, the draft contains material overclaims and at least one internal
contradiction that the reviser must fix rather than polish: the InvenTree
availability precedent contradicts the loanable-query claim on the predecessor's own
evidence; the privacy validation oracle (403) is wrong for PocketBase's documented
200/404 behavior; the PocketBase OIDC "unproven" verdict stops one section short of
the OAuth2 mechanism on the same page; retention/secure-deletion, MFA, and role
matrices are asserted without fetched sources; the 60-second/no-training gate is
invented; and summer-recovery, messaging cost, and approval enforcement are
underspecified at exactly the points where the pilot could fail. Disposition labels
need correction: every P is marked "already-covered + correction", which empties
"already-covered" of meaning. Details below; reviser priority order at the end.

Critic demands can be invalid; where this critique's demand depends on evidence the
critic did not fetch, that is stated and the cheaper resolving check is named.

## Confirmed by independent re-fetch (fairness record)

- K1 Snipe-IT v8.8.0 chain (C04): FD-57297 checkout/checkin webhook notification
  payload fix with PR #19655, incomplete-checkout handling, and the PHP 8.2+
  required / 8.4+ recommended floor are all present on the stable tag page. The
  O3 chain reading (checkout/notify is high-churn; upgrades couple to runtime
  upgrades) is a sound inference from confirmed notes. One bound: the fetched
  notes say tests were added for checkout/checkin webhook payloads; they do not
  promise caregiver-message wording contracts (see m9).
- K2 PocketBase stateless auth + superuser bypass (C01): valid Authorization token,
  no server sessions, no logout endpoint (client token discard), superusers ignore
  collection API rules, OAuth2 unsupported for _superusers — all confirmed verbatim.
- K3 PocketBase collections (C02): auto-generated SQLite tables, records as rows,
  Base/View/Auth types, view as read-only SQL SELECT, views get no realtime events
  — all confirmed verbatim.
- K4 PTAC directory information (C05): appropriately-designated directory information
  disclosable without prior consent per 34 CFR 99.31(a)(11)/99.37; 99.3 definition
  (not generally harmful/invasive); public notice of designation + right to restrict
  + opt-out window per 99.37(a); former-student rule 99.37(b) with must-honor timely
  opt-outs — all confirmed. The draft's P2 Correction 2 account is accurate.
- K5 WCAG reflow substance (C06): 320 CSS px width / 256 CSS px height, 320 px =
  1280 px viewport at 400% zoom, exceptions only for 2D-required parts (images,
  video, games, presentations, data tables but not individual cells, must-stay-visible
  toolbars), cells inside a 2D layout must still meet the criterion — all confirmed.
  The draft's P3 Correction 1 substance stands; caveat is sourcing level (see M12).

## Material findings (reviser must resolve)

### M1 — InvenTree availability precedent contradicts the loanable-query claim (P1)

Location: draft P1 Corrections 1–2; discovery 2.2/3.2; research S05 excerpt.
Predecessor's own S05 evidence states the 0.14.5 status table as OK/Attention/Damaged
Available Yes and Destroyed/Lost/Rejected Available No, with custom states keeping a
logical key (e.g. OK) while showing a distinct label (e.g. Awaiting Inspection).
The draft then claims the loanable set is "a query over status, so a repair
transition automatically removes the instrument from availability", and offers
waiting-parts vs ready-pickup as two available-math-correct labels.
Contradiction: on the evidenced table, the natural waiting-parts key (Damaged, "not
functional in its present state") is Available Yes — a waiting-parts instrument would
stay loanable under the proposed query. And both waiting-parts and ready-pickup
should be non-loanable-yet-distinct (one awaits parts, the other is reserved for
pickup), but the evidenced non-available keys (Destroyed/Lost/Rejected) carry wrong
semantics for either. No evidenced logical-key pair yields (distinct labels AND
correct availability for both). The custom-state example actually evidenced
(Awaiting Inspection on logical OK, counted available) proves label-vs-availability
separation in the wrong direction for this use.
Why material: P1 Corrections 1–2 are the binder fix; if the precedent cannot produce
two non-loanable distinct states, the InvenTree path does not satisfy the brief's
core pain as claimed.
Fix: verify against stable released InvenTree docs/code a concrete key pair with
correct availability for both states (or a hold/reservation mechanism outside
Available), or downgrade the InvenTree precedent to uncertain and carry the
explicit-status requirement as platform-agnostic design. Critic-invalid caveat: if
stable docs show a suitable non-available key or a reservation overlay, this finding
softens to a documentation fix.

### M2 — S05 provenance is weak and the "evolution" is mischaracterized (P1, O3)

Location: research source-map S05; discovery 4.3; draft issue-chain paragraph.
S05 is declared "mixed-versioned-plus-master": the 0.14.5 status table reached via
web-search snippet after a direct latest-path 404, plus a master-branch concept doc
for custom states. A search snippet is not a fetch, and master-branch docs describe
unreleased-or-moving behavior. Discovery 4.3 then narrates a "status → custom-states
evolution" ("the project learned...") from two synchronic documents, which is not a
temporal chain: no before/after releases, no changelog, no migration note is shown.
Why material: the binder fix (M1) and one of three O3 chains rest on this source; a
404-fallback plus master doc cannot carry that weight.
Fix: re-verify both the status table and custom states against one stable released
version (docs tag or code tag), or mark the InvenTree chain as unproven and keep only
the fetched test-template/test-result behavior (S03/S04) as the InvenTree contribution.

### M3 — Privacy validation oracle is wrong for PocketBase; rule design unevidenced (P2, O6)

Location: draft P2 Correction 1; validations (1); discovery 2.3/3.3/6.
The draft proposes: teacher attempts direct caregiver-contact read; "pass =
403/absent on page, API, export, and search". PocketBase's documented behavior (C03)
is rule-dependent: unsatisfied listRule returns 200 with empty items, unsatisfied
createRule 400, unsatisfied view/update/delete rules 404 — and 403 only when the rule
is locked (superuser-only) and the requester is not a superuser. A correctly denied
teacher will therefore typically see 200-empty or 404, not 403; a validation that
demands 403 fails a correct implementation (or forces locked-rules where filtered
rules were intended). Further, the research stage never fetched the API-rules page,
so "API rules deny direct reads" names a mechanism whose syntax (list/view/create/
update/delete + manageRule, locked default, filter expressions) was unverified at
write time, and view-collection rule support (does the teacher_schedule view take
list/view rules? views have no create/update/delete) remains unverified even now.
Why material: P2 is student-privacy structural separation; a wrong oracle plus an
unevidenced rule design means the pilot's privacy gate cannot be executed as written.
Fix: rewrite validation (1) per rule type (200-empty on list, 404 on view, 403 only
for locked collections), show the intended rule set per collection (contact locked or
staff-filtered; schedule view rule), and verify view-collection API-rule behavior in
primary docs before claiming "excludes by construction".

### M4 — PocketBase OIDC "unproven" stops one section short (P6)

Location: draft P6 Correction; discovery 2.3/3.3/5.4; draft open question 6.
The draft marks "district SSO via OIDC unproven in the primary docs fetched" and
requires a PocketBase pilot to document "SSO approach to be validated". The fetched
auth page itself (C01, same URL the investigator fetched) contains an "Authenticate
with OAuth2" section naming providers (Google, GitHub, Microsoft, etc.) with provider
app Client Id/Secret and redirect URL. The investigator fetched the page but appears
not to have read past the password section. The accurate state is narrower: an OAuth2
mechanism exists for non-superuser auth collections; what is unverified is
district-IdP compatibility (does the district use Google Workspace or Microsoft
Entra, both named providers?), generic-OIDC vs named-provider coverage, and
claims/group mapping to pilot roles.
Why material: P6 migration planning and the "local auth now" posture depend on how
far the SSO path is; "mechanism exists, mapping unverified" invites a cheap decisive
check, while "unproven" invites deferral. If the district is on Google/Microsoft,
the path may be short.
Fix: fetch the OAuth2/OIDC provider list and options, determine generic-OIDC support,
and restate as mechanism-confirmed/mapping-unverified with the district-IdP question
added to open questions. Critic-invalid caveat: if the provider list is closed and
excludes the district IdP with no generic OIDC, the finding reduces to a wording fix.

### M5 — Retention/secure-deletion asserted without sources; contradicts own standard (P2)

Location: discovery 3.5/5.1 ("PTAC sanitization guidance", 99.31(a)(6)); draft P2
Correction 2 ("retention rule per collection even if enforcement starts manual").
The research source-map contains exactly one privacy source: the directory-information
FAQ (S12). No sanitization/destruction guidance and no 99.31(a)(6) studies text were
fetched, so retention periods, destruction methods, and the contractor-clause analogy
are unevidenced. Separately, the draft's own P2 standard rejects policy ("a policy
that says teachers shouldn't look does not satisfy P2") while accepting manual
retention enforcement ("even if enforcement starts manual") — structural for access,
policy for retention, with no principled distinction.
Why material: retention/destruction of minors' loan and contact records is a
consequential privacy promise; an unevidenced promise with a self-contradicting
standard cannot stand as a correction.
Fix: fetch the actual retention/destruction authority or drop the claim to an open
question ("district retention schedule + destruction method TBD"); reconcile the
manual-enforcement standard explicitly (e.g. manual-with-audit-log as interim, dated).

### M6 — MFA and per-core role matrices unevidenced (P6)

Location: draft P6 ("strong passwords (+ MFA where the platform supports it)",
"least-privilege roles teacher/staff/coordinator/liaison/admin").
No MFA source was fetched for any of the three cores (Snipe-IT product copy S01 and
PocketBase auth S07/C01 do not mention MFA; InvenTree auth was not investigated at
all). "MFA where supported" therefore promises a control whose support is unknown on
every path. Likewise roles: Snipe-IT granularity is marketing copy ("role-based
groups with granular permissions"), PocketBase roles-via-auth-collections are sketched
without the (then-unfetched) rule syntax, and InvenTree's permission model is absent.
Why material: sign-in posture is the P6 deliverable; MFA/roles are its operative
content.
Fix: verify MFA per core or drop to "password policy + lockout per platform docs,
MFA TBD"; show a role×capability matrix per core with the enforcement point named
(Snipe role permission / InvenTree permission / PocketBase collection rule), or mark
the matrix per-core-TBD.

### M7 — 60-second and "without training" thresholds are invented (P1, P4, O6)

Location: draft P1 Correction 4; P4 gate (a); validations (4); discovery 5.2/5.3/6.
"Under ~60 seconds" appears as a correction, a gate, and a validation without any
primary source; "without training" (P4 gate a) is stronger than the brief, which says
teachers record urgent issues during class (compatible with brief training). The
PocketBase citation proves stateless tokens with client-side logout, not draft
preservation across re-login: surviving token expiry with no lost draft is
application behavior (local draft store, post-login resume) that no fetched doc
describes. Classroom-device realities (shared devices, short token lifetimes, HTTPS/
hygiene per discovery 3.3) cut against a strict timed gate.
Why material: an unevidenced threshold that gates pilot expansion can fail a working
pilot or force gaming (rushed reports to beat the clock).
Fix: relabel as a pilot target with method ("median under 60 s over N observed
classroom captures after a 5-minute orientation, draft survives re-login"), or drop
the number and gate on completion-without-data-loss plus staff-observed burden.

### M8 — Summer recovery underspecified where it matters (P6, P4 gate d)

Location: draft P6 summer condition; P4 gate (d); validation (7).
Four gaps: (a) Backup locality: "single host + file/one-click backups" never says
where the backup file lives; a backup on the same host dies with the host, and
off-host access with the help desk closed needs a named custodian and path.
(b) Fresh-host provisioning: gate (d) requires the coordinator alone to restore "to
a fresh host" — who provides and pays for that host in summer, and on what time?
(c) Paper privacy: printed picklists/restore sheets reintroduce binder-era data on
paper with no minimization rule (do picklists carry student/caregiver data? retention
and shredding?). (d) "No auto-updates" is vacuous framing: neither PocketBase (binary
replace) nor Snipe-IT (manual upgrade) auto-updates; the real risk is ill-timed
manual upgrades, which the version-pin + snapshot discipline already addresses.
Why material: summer-without-help-desk is an explicit brief constraint; recovery that
depends on an unnamed host, an on-box backup, or paper with unminimized PII does not
satisfy it.
Fix: name backup location(s) + custodian, fresh-host source, paper data-minimization
and destruction rule; reframe auto-update as a manual-upgrade freeze window.

### M9 — $8k budget ungrounded for the messaging channel; language choice has cost/encoding consequences (P6, P3)

Location: draft P6 $8k condition; P3 Correction 2; open questions.
Caregiver contact channels (SMS/email/paper) are never selected, yet SMS gateways
charge per message and email has deliverability/consent handling; usage/billing is
honestly null everywhere, which means the "$8k fits" claim cannot cover the one
recurring per-contact cost. The second language is deferred as a pure user decision,
but language choice affects SMS segmentation/encoding cost, email rendering, and
possibly layout direction; "which second language" is therefore also a technical
input. Staff time (2 staff + part-time coordinator + liaison template review) is
never placed inside or outside the $8k.
Why material: the pilot can meet every functional gate and still breach budget or
stall on channel selection.
Fix: cost the channel options (or mark channel selection as a costed user decision
with per-option estimates), record language-choice technical consequences, and state
whether $8k includes staff time.

### M10 — Approval enforcement asserted without a per-core mechanism (P5)

Location: draft P5 ("must represent approval as an explicit event... must not
silently let any authenticated user mark replaced/retired").
The requirement is right; the mechanism is missing on all three paths. Snipe-IT
field/transition-level restriction is in the same unverified bucket as the P2
visibility gap the draft itself flags; InvenTree status-change permissions were never
investigated; PocketBase API rules are CRUD-level per collection (C03), so "only the
approver role may set status=retired" needs record-filter rules and likely event-hook
transition guards (Go/JS hooks, unfetched). An "explicit event" in an append-only log
is necessary but not sufficient without a write guard on the transition.
Why material: replacement/retirement is irreversible disposition of district property;
a requirement without an enforcement point is policy, which the draft elsewhere
rejects as insufficient.
Fix: name the enforcement point per core (or mark per-core-TBD as a build
requirement): Snipe role/permission check, InvenTree permission/transition check,
PocketBase rule expression + hook validation, each with a negative test.

### M11 — Disposition labels: "already-covered" does no work (O4, all P)

Location: draft per-P dispositions.
P1, P2, P3, P4, and P6 are each labeled "already-covered" plus one or more
corrections; P5 is user-decision. If a clause needs a substantive correction to
satisfy the brief, its direction is not already covered — at most partially. The
double label lets every P claim agreement while demanding changes. The inconsistency
bites in P2: the Snipe-IT path cannot be "already-covered in direction" while
teacher-cannot-see-contact in Snipe-IT is explicitly unverified — on current evidence
that path fails P2 until the check passes.
Why material: O4 requires distinguishing correction from already-covered; collapsing
them hides how much of the plan actually changes.
Fix: relabel P1/P2/P3/P4/P6 as correction (partial) where corrections are required,
reserving already-covered for clauses needing no change; mark the Snipe-IT P2 path as
uncertain-until-verified rather than covered.

### M12 — Accessibility gate lacks a platform baseline; normative-vs-informative gap (P3, O6)

Location: draft P3; P4 gate (e); validation (5).
Gate (e) demands 200% resize + 320-px reflow/400% zoom on schedule, issue form, and
repair board — but none of the three candidate platforms' UIs (Snipe-IT, InvenTree,
PocketBase dashboard) were checked against those criteria. If the pilot ships a
platform UI that fails reflow, the gate fails for reasons outside the custom build,
discovered late. Large-print needs beyond resize/reflow (contrast, focus visibility,
keyboard operability, print styles for picklists) are unaddressed. Sourcing: the
reflow/resize evidence is W3C Understanding docs, whose own header (C06) states they
are informative explanations not required to meet WCAG; the normative SC text
(WCAG 2.2 §1.4.4/§1.4.10) was not cited.
Why material: P3 is an explicit brief requirement for named users (large-print
teachers); an unbaselined gate risks late failure, and normative citation matters if
the district's requirements reference WCAG conformance.
Fix: baseline each candidate platform UI (or scope gate (e) to custom surfaces and
add a platform-accessibility check as a selection criterion); cite normative SC text
alongside Understanding; add contrast/focus/keyboard/print to validation (5) or scope
explicitly to resize/reflow with rationale.

### M13 — Caregiver-reporting options miss identity/abuse/capacity analysis (P5)

Location: draft P5; discovery 5.5.
Option (b) (unauthenticated structured form) needs enumeration/IDOR, spam/rate-limit,
and queue-separation analysis (un-triaged caregiver requests must not bury teacher
urgent issues). Option (c) (authenticated portal) needs identity proofing for
caregivers without district SSO (unfunded per P6): local caregiver accounts imply a
password-reset burden falling on two staff plus a part-time coordinator — in summer,
with the help desk closed. The acknowledgment SLA is required but never reconciled
with part-time coordinator capacity. Discovery's lean toward (a) (no direct intake,
staff transcribe) is reasonable but sits oddly beside a pure-deferral P5: the draft
both favors and defers.
Why material: the reporting decision determines triage load, abuse surface, and
summer staffing feasibility.
Fix: attach to each option its abuse controls, identity/reset burden, and SLA owner
with part-time capacity noted; either own the (a)-first recommendation with a
revisit trigger or present options neutrally.

### M14 — PocketBase O3 chain rests on an unfetched changelog (O3)

Location: discovery 4.2 ("changelog search context shows v0.23.0... v0.40.0...").
The v0.40.5 no-backward-compat warning is fetched (S06) and sufficient as a
single-point planning input, but the version-to-version evolution (v0.23.0 breaking
warning, v0.40.0 command-chaining break) comes from search context, not a fetched
changelog — the same snippet-instead-of-fetch pattern as M2, and no changelog source
appears in the source-map.
Why material: O3 requires an investigated chain or honest absence; a snippet-sourced
chain is neither.
Fix: fetch the changelog (or the two release notes) and quote, or downgrade 4.2 to
the fetched single-point warning plus honest absence of a multi-release chain.

## Minor findings (fix in passing)

- m1 Test-template burden and semantics (P1): most-recent-wins means a later pass
  hides an earlier fail in status (history retained, headline green) — state whether
  ready-pickup requires an unbroken pass run or latest-pass; variant cascade is
  irrelevant for unique instruments; bench photo/test burden on 2+part-time staff is
  unestimated; template-name freeze needs a named owner.
- m2 Tokenization usability + notes smuggling (P2): opaque student_ref makes every
  teacher delay-chase a staff-mediated lookup — analyze the handoff burden or define
  a teacher-safe identifier; the staff-only join's placement and key management are
  undesigned; free-text repair notes can smuggle grades/disciplinary content into the
  record — add an input guard or handling rule, since "absent columns" does not stop
  prose.
- m3 Table-exception nuance (P3): the "loan table may 2D-scroll as a unit" reading is
  correct; note that filters/actions in a must-stay-visible toolbar may share the
  exception — no change needed beyond the acknowledgment.
- m4 Staff-UI localization is platform-conditional (P3): Snipe-IT's 55+ languages
  help only on the Snipe path and may not include the district's second language;
  label as Snipe-only and verify language coverage when the second language is chosen.
- m5 Gate shape (P4): all-of-(a–f) with no partial-expansion or remediation path is
  rigid (one miss blocks nine schools); school-selection criteria for the 2–3 pilot
  schools are unstated (selection bias); gate (f) "understood" needs a metric and
  owner (liaison-observed comprehension? caregiver acknowledgment?).
- m6 "Every path" scope (P2/O6): page/API/export/search omits backups, logs, browser
  cache, printed picklists, and the admin dashboard; enumerate or explicitly scope
  the privacy validation to named surfaces plus a residual-risk note.
- m7 Types and units (P1/O2): expected_return_date needs date-vs-datetime, timezone
  (overdue means `< today` in which zone?), and null semantics; instrument_id needs
  format/symbology/size (barcode/QR, large-print legibility); file evidence needs a
  count cap alongside the 5 MB size default.
- m8 Domain-mismatch understatement (O1/O4): "all three cores can carry P1 if the
  corrections hold" is unproven — Snipe-IT's asset→user checkout vs the
  student+caregiver+school triad, InvenTree's fungible stock vs per-student loans
  with expected return, and an unnamed ticket layer all need mapping work; the most
  school-native alternative (library circulation) and any concrete ticket product were
  never investigated — record as omitted alternatives, not as rejected ones.
- m9 Notification-contract inference label (O3): Snipe tests cover webhook payload
  shape, not caregiver wording; "treat notification content as a contract with tests"
  is sound advice but an inference, not a chain reading — label it as such.
- m10 Former-student rule unused (P2): 99.37(b) was fetched (S12/C05) but never
  applied; either apply it (alumni/outgoing-student loans) or record as
  retained-but-inapplicable.
- m11 Channel chain honesty (P3/O3): "no translation-vendor/sync chain because none
  selected" is correctly honest; add that selecting SMS/email/paper later obligates a
  chain for the chosen channel.
- m12 Audit sample size (O6): 20 seeded instruments across three states is unjustified
  for nine schools; state the sampling rationale (or gate on live pilot data rather
  than seeded counts).

## Per-P disposition audit

- P1 "Track instrument assignment, reported issue, repair state, expected return, and
  availability for loan." Draft: already-covered + corrections + enhancement +
  uncertain core choice. Critic: correction (partial). Corrections 1–2 (explicit
  countable states; derived availability) are the right requirements but the InvenTree
  precedent is contradicted/weakly sourced (M1, M2) and the Snipe-IT separation
  (pending vs ready-to-deploy + history) is asserted from marketing copy without
  custom-status/field evidence. Correction 3 (indexed date) stands, needs tz/type
  (m7). Correction 4 (60-s capture) needs re-grounding (M7). Test-template
  enhancement stays optional with burden/semantics notes (m1). Core-choice uncertain
  stays, widened with domain mismatch (m8).
- P2 "Limit student and caregiver details to staff who need them." Draft:
  already-covered + structural corrections + user decisions + Snipe uncertain. Critic:
  correction (partial). Structural separation (projection + deny-by-rule,
  contact-not-directory-info per K4) is correct in direction; the oracle must be
  rewritten (M3), retention evidenced or dropped (M5), the Snipe path marked failing
  until verified (M11), and token usability/notes-smuggling addressed (m2).
- P3 "Large-print screens and two-language caregiver messages." Draft:
  already-covered + corrections + staff-localization enhancement + user decisions.
  Critic: correction (partial). Resize/reflow substance confirmed (K5); add platform
  baseline + normative citation + wider large-print scope (M12); template catalog
  needs approval/fallback/inbound design and the channel needs costing with
  language-encoding consequences (M9); staff localization is Snipe-only (m4).
- P4 "Small pilot from one room and selected schools." Draft: already-covered + gated
  expansion. Critic: correction (gating is the correction). Gates (a–f) are the right
  shape; fix 60-s/no-training (M7), backup/host/paper scope of gate (d) (M8), and
  gate rigidity/selection/measurement (m5).
- P5 "Replacement approval and caregiver reporting are district decisions." Draft:
  user decision, correctly deferred. Critic: agree, with build requirements attached:
  per-core approval enforcement (M10) and per-option abuse/identity/SLA analysis
  (M13). Resolve the favor-vs-defer tension on option (a).
- P6 "Sign-in and integration unfunded." Draft: already-covered + local-auth-now
  correction. Critic: correction (partial). Local-auth-now with documented migration
  is right; fix OIDC framing (M4), MFA/roles evidence (M6), summer locality/paper
  (M8), messaging cost (M9), and the auto-update framing.

## Omissions consolidated (beyond per-P notes)

1. District sign-in requirements themselves (password/complexity/MFA/session rules)
   were never requested as a document; P6 migrates toward unknown requirements.
2. Transport/logistics for the one-room-to-nine-schools physical handoff
   (waiting-parts intake, ready-pickup distribution) — the workflow the expansion
   gate is supposed to prove.
3. Part-time capacity model: triage/approval/reset SLA ownership when the
   coordinator is off.
4. Inbound caregiver replies (both languages) and language-preference fallback when
   preference is missing.
5. Ticket-centric alternative investigated by name only; library-circulation
   alternative never named (m8).

## Validation applicability audit (O6)

The executed-vs-proposed separation and the no-runtime honesty are exemplary and must
be kept. Applicability fixes: (1) privacy oracle must become rule-dependent
200-empty/404/403 (M3) with named collections and view-rule verification;
(2) repair-state audit needs sampling rationale (m12) and must run against the
corrected availability mapping (M1); (3) overdue query needs tz/null semantics (m7);
(4) capture timing needs method + orientation allowance (M7); (5) accessibility needs
platform baseline + wider criteria or explicit scoping (M12); (6) bilingual send
needs comprehension metric + preference-fallback case (m5, omission 4);
(7) summer recovery needs named backup/host/paper scope (M8); (8) add missing
coverage: approval negative test (M10), retention/destruction handling (M5),
role-matrix check (M6). No proposed validation may be presented as executed; none
currently is.

## Critic uncertainty and possibly-invalid demands

- If stable InvenTree docs/code show a suitable non-available logical key or a
  hold/reservation overlay for waiting-parts/ready-pickup, M1 reduces to requiring
  that citation, and M2 to re-sourcing S05 at a stable tag.
- If Snipe-IT docs show custom statuses plus field/role-restricted contact
  visibility, the Snipe P1/P2 paths strengthen and M11's Snipe note lifts.
- If the district IdP is Google Workspace or Microsoft Entra, M4 may resolve to a
  short provider-configuration check rather than a research task.
- The 60-second figure (M7) may be defensible as a pilot target if labeled with
  method; the objection is to its presentation as a derived correction.
- WCAG Understanding-vs-normative (M12) is a minor sourcing point given K5 confirms
  substance; it matters only if the district contract cites conformance.
- This critic did not re-fetch Snipe-IT product copy, InvenTree test docs,
  PocketBase files docs, or WCAG 1.4.4 Understanding; those predecessor excerpts are
  facially consistent and are challenged only where they collide with fetched
  evidence (M1–M2) or overreach their source (M6, M10).

## Reviser priority order

1. M3 privacy oracle + rule design; M1/M2 availability mapping + re-sourcing.
2. M11 relabel dispositions; M4 OIDC correction; M10 approval enforcement points.
3. M5 retention evidence/standard; M6 MFA/roles; M8 summer scope; M9 channel cost.
4. M7 thresholds; M12 platform baseline + citation; M13 reporting analysis; M14
   changelog fetch-or-downgrade; minor m1–m12 in passing.

## Method note

Critic-complete under M15 v1 control (fresh full critic; investigator draft and
discovery above; separate fresh full reviser stage follows; no nested agents in this
stage). O1–O6 are addressed as criticism: unfamiliar-tool and alternative gaps (m8,
omission 5), primary-source behavior corrections (M1–M4, M12, K1–K5), chain
challenges (M2, M14, m9, m11), per-P disposition audit (M11 + per-P section),
retained-uncertainty review (M5–M10, M13), and validation applicability (dedicated
section). Required artifacts in this directory: `critique.md` (this file),
`source-map.json` (C01–C06), `sources/evidence.md`, `sources/index.md`.
