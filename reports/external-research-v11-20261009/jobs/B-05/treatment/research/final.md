# Final — I05 regional interpreting cooperative (B-05/treatment/research)

M14 retained investigator, same native Goal/context from discovery through this final. This file is the complete, self-contained planning deliverable for this scope; later stages may correct it. It retains the full material scope of discovery and draft as corrected by independent critique disposition below. Source IDs (S01–S13 mine, CR01–CR15 critic's) are references only; every material claim is stated in prose.

Lifecycle: brief-only `discovery.md` (frozen by `plan-reveal.json`) → `revealed-plan.md` (6 clauses P1–P6) → complete `draft.md` → frozen independent critique (`../critic/READY.json`, SHA-verified 2026-10-09T20:45Z: critique `5b29919e…`, critic source-map `072c45e9…`, both hashes matched) → this final. I read the frozen `critique.md` and critic `source-map.json` named by READY.json; I did not read the critic's `sources/` evidence files, so critic-sourced facts are attributed as critic-observed and marked accordingly rather than claimed as my own verified primaries. No new primary research was conducted after the wait began; all dispositions below rest on discovery evidence (S01–S13), draft reasoning, and the frozen critique.

## 0. Critique disposition (every demand, with evidence)

The critic raised 7 material findings (M1–M7) and 5 minor findings. I accept all 12 in substance; details and the resulting changes follow. Nothing the critic demanded was rejected; where I qualify a demand, the qualification and its evidence are stated.

### M1 (O1 omits interpreter-specific buy/configure products) — ACCEPTED, added as candidate I
- Demand: add a domain-product alternative (Interpreter Intelligence scheduler/offer-pool/eligibility/mobile accept-availability/job-close/mileage, critic-observed CR01–CR03; Interpreter.io booking page as a weak bot-checked lead, CR10); treat as due diligence, not recommendation; trial exact conflict/mobile/visibility/workflow cases; no price/security/a11y finding established.
- Disposition: accepted. New §2 candidate I records the domain buy/configure option with the critic's product-specific cautions (availability-unset means "available at any time"; offer-pool configuration changes the double-booking warning at acceptance; global/negative buffers can weaken travel checks — all critic-observed, CR02–CR03). Added to the architecture comparison as Arch-0 (configure) and to the costed comparison gate (M7). No recommendation is made; the trial checklist in §7 P-V0 is now a release-selection gate.

### M2 (P2 needs explicit offer-reservation semantics) — ACCEPTED, draft corrected
- Demands: (a) keep atomic prevention at the final reservation/accept transition; (b) keep Postgres exclusion as a strong conditional implementation, not the only mechanism; (c) define offer-hold/expiry/release/multi-offer semantics; commit reservation before notification; idempotent retries; "409-style" is app UX mapping, not Postgres-native; (d) Cal.com pending-confirmation race (CR09) as concrete failure mode; (e) partial-exclusion syntax uncertainty closed by CR12.
- Disposition: accepted in full. The draft wrongly assumed every `offered` row reserves the interpreter's whole window — that is a product rule, not SQL, and parallel/stale offers under it could block usable work. §3/P2 now defines two admissible offer models (reserving hold with TTL vs non-reserving offer with accept-time atomic check), required lifecycle semantics (expiry, release on decline/cancel/reassign, multi-candidate policy, reservation-before-notification, idempotency keys), and an expanded race test (two concurrent offers AND two concurrent accepts incl. release/retry). The Postgres exclusion constraint (S01/S02) is retained as a strong conditional implementation for Postgres-backed architectures; the requirement is mechanism-neutral atomicity. CR09 (Cal.com: two concurrent confirmations both observing PENDING and becoming ACCEPTED; proposed transaction/lock, recheck, compare-and-swap, rollback; related pending-availability/idempotency reports — critic-observed, open reports, no merged fix verified) is adopted as the canonical race illustration. CR12 (Postgres 18 documents `EXCLUDE … WHERE (predicate)` over a row subset — critic-verified) closes my syntax uncertainty; the exact active-status predicate and runtime behavior remain proposed validations.

### M3 (P3 needs stage-aware disclosure, narrower coordinator scope) — ACCEPTED, enhancement refined
- Demands: replace coarse "coordinator-full / assigned interpreter" with a stage-by-stage access matrix; offer recipients need decision-sufficient but minimal data (no automatic client name/topic); keep sensitive details out of email/SMS/lock-screen payloads with authenticated retrieval; verify whether all 4 coordinators need all-county access; test records, fields, exports, notification payloads, and reassignment — not just role names.
- Disposition: accepted. §3/P3 now carries the access matrix (need-to-know coordinators → minimal offer → accepted-minimum → optional client-facing), the out-of-band payload rule, and coordinator-scope verification as user decision UD-6. P-V2 is extended to fields/exports/payloads/reassignment paths.

### M4 (P5 interim fail-safe must not read as adopted policy) — ACCEPTED, relabeled + gated
- Demands: "default OFF / consent-required / ship default" risk deciding for the cooperative; label fail-closed interim behavior as temporary/provisional with ratification; make both policies explicit release gates or settings with recorded decision + effective date; define reassignment steps (current-interpreter consent, replacement acceptance, client notification, audit); test each approved branch.
- Disposition: accepted. UD-1/UD-2 defaults are relabeled PROVISIONAL FAIL-SAFE (pending member vote), never approved policy. §6 requires a decision record (choice, deciders, effective date) and the reassignment step definition; P-V5 tests each approved branch. No unilateral product decision remains.

### M5 (P6/Arch inconsistency; travel underspecified) — ACCEPTED, architecture and travel record fixed
- Demands: (a) "Phase 1 MUST" overstates the plan — label manual capture as the narrow reading, confirm with board; (b) Arch-1 "Postgres + XState + OSRM cache" contradicts OSRM-optional/§7-step-8 — remove OSRM from Phase-1 Arch-1 or move the arch; (c) "three counties = small graph" unsupported — count sites first; (d) define a typed nullable travel record (unit, provenance, recorded-at, unknown reason; duration vs distance; site-pair vs assignment attribute), not value+bool.
- Disposition: accepted. The inconsistency was real and is fixed: Arch-1 Phase-1 is now Postgres + XState + manual travel record + minimal notifications + responsive web; OSRM cache is an explicit optional slice (Arch-1+, §4). Manual travel capture is the recommended narrow reading of "track a travel estimate," pending board confirmation (UD-5). The travel record type is defined in §3/P6. The small-graph claim is withdrawn; site counting is a proposed validation (P-V3a).

### M6 (accessibility gate overstates automation) — ACCEPTED, validation rewritten
- Demands: W3C (CR13) — tools cannot check all aspects or determine accessibility alone; human judgment required; WCAG 2.2 criteria incl. keyboard, drag-alternative, labels/instructions, error identification, programmatic state, status messages (CR08); state the adopted target; automation as partial signal; manual keyboard/touch/AT task tests with affected interpreters + phone-coordinator test; drag alternative, text-identifiable errors, announced state/conflict changes, non-color cues; report scope/unresolved; no conformance-from-runner claims.
- Disposition: accepted. P-V6 is rewritten on these terms (critic-observed CR08/CR13). "Runner-verified conformance" language is removed everywhere. The adopted WCAG target itself is a cooperative decision (UD-7), defaulting to WCAG 2.2 AA as the proposal.

### M7 ("Phase-1 shippable" unsupported by cost evidence) — ACCEPTED, downgraded + comparison required
- Demand: no source-backed quote shows any architecture fits $4,200 (hosting, build, notifications, migration/backup, a11y review, 6-week support uncosted); downgrade "all Phase-1 shippable" to "candidate shapes"; add costed comparison (one-time build vs hosting/ops vs review support); 6-week review is a scope boundary, not proof of fit; keep all alternatives until compared.
- Disposition: accepted. All architectures are candidate shapes (Arch-0–Arch-3). §7 P-V0 requires the costed build/configure comparison before architecture selection; the build order in §8 is gated on it. The $4,200 cap and 6-week review are preserved as constraints, never as fit evidence.

### Minor 1 (partial-exclusion syntax) — ACCEPTED
CR12 closes the syntax question (`WHERE (predicate)` documented); condition (a) is removed as a syntax uncertainty and replaced by validation of the exact predicate + lifecycle + concurrency (P-V1).

### Minor 2 (UNFILLED reopen path) — ACCEPTED
"Never auto-exits" stands, plus an explicit audited reopen/new-request path (actor, time, reason, new offer cycle); auto-promotion from unfilled to available/offered is forbidden. Added to §3/P1.

### Minor 3 (P-V8 precision/recall) — ACCEPTED
No truth labels exist; P-V8 now records estimate vs voluntarily/operationally captured actual, override reason, and warning usefulness, reporting descriptive differences until labels/denominators are defined.

### Minor 4 (Timefold source hygiene) — ACCEPTED
OptaPlanner EOL narrative labeled maintainer-side project history (CR14), not the Red Hat announcement; Timefold repo facts (fork, Community Apache-2.0 vs commercial Enterprise, build baseline) per CR15; build floor corrected to critic-observed JDK 21+ (my discovery's secondary "Java 17+" is withdrawn). The primary XState v4→v5 chain (S08) already satisfies the evolution-chain obligation; Timefold stays a Phase-2 alternative with pinned-version discipline.

### Minor 5 (PocketBase "weaker by construction") — ACCEPTED, softened
Downgraded to an unverified risk: documented facts retained (collection-level API rules, superuser bypass — S05; no Postgres-style exclusion), but no universal verdict on hook/transaction designs. Two truly concurrent offer/accept writes through the selected PocketBase path are a required witness (P-V1b) before calling it safe.

## 1. Brief constraints (preserved)

26 interpreters, 4 coordinators, 3 counties; short-notice changes; long travel gaps. $4,200 first release; browser-based, supportable by the co-op; coordinators may update the day's schedule from a phone. Sensitive: client names, meeting topics, interpreter availability; interpreters get only need-to-know details. Current failure: calls + shared calendar with cross-coordinator double-offers. Some interpreters use assistive technology; several clients require specific communication modes/access arrangements. Track request, offer, acceptance, travel estimate, completion, invoice readiness — not a payroll system. Mark requests UNFILLED honestly; never imply phantom availability. Open member disagreements: (D1) automated client confirmations, (D2) reassignment without asking. Board reviews the first six weeks before further spend.

## 2. O1 — Candidate tools, products, approaches (with M1 addition)

- A. Postgres range + exclusion constraint (S01/S02): `tstzrange` windows with `EXCLUDE USING gist (interpreter_id WITH =, period WITH &&)` via `btree_gist`; DB-atomic overlap prevention; auto-created GiST index. Correctness at storage, not UI diligence.
- B. Supabase (Postgres RLS, S03) vs PocketBase v0.40.5 (SQLite single binary + API rules, S04/S05): DB-layer authorization (grants AND policies; `service_role` bypasses; `42501` = grant bug) vs API-layer authorization (5 locked-default rules doubling as filters; 200-empty/400/404/403 failure shapes; superuser bypass; pre-1.0 migration duty).
- C. Timefold Solver (S09/S11; hygiene per Minor 4): Apache-2.0 Community constraint solver, forked 2023-04-20, announced 2023-05-02; Solver/Models/Platform split; employee-scheduling model exists; Phase-2 only, version pinned, JDK 21+ baseline per critic-observed repo; OptaPlanner EOL narrative is maintainer-side history.
- D. OSRM v5.24.0 self-hosted routing (S06): `table` all-pairs fastest-route matrix, durations seconds, distances meters (fastest, not shortest); `trip` TSP approximation (brute force <10, greedy farthest-insertion ≥10, no optimality, inputs must connect); HTTP/1.0 keep-alive limits (512 req/conn, ≤5s gap); profiles are build-time Lua. Optional slice only (M5); ORS quotas/Valhalla/traffic remain secondary (S13a).
- E. XState v5 lifecycle (S07/S08): event-driven statecharts + actor model; `createMachine`/`createActor`; v4→v5 breaking renames; TS ≥5.0. Workflow guard incl. UNFILLED terminal + D2 guards; persistence/event-log shape verified at build.
- F. Cal.com scheduling substrate (S10; license/behavior secondary S13d): OAuth-first API, key hygiene, 120/min API-key cap, 2025-12-15 Platform freeze for new signups; routing/round-robin adoption conditional on primary verification. CR09 race family adopted as the canonical concurrency failure illustration (critic-observed).
- G. Novu notification workflows (S12): multi-channel workflows, subscriber prefs, Inbox component, self-host-or-cloud; costs unobserved → minimal-built-in preference table is the admissible fallback. Either way D1 stays configuration.
- H. Rejected: full payroll/HRIS, native app-store builds, black-box matching, commercial-routing-only travel. (Unchanged.)
- I. (M1, critic-sourced) Interpreter-operations buy/configure option: Interpreter Intelligence scheduler/offer-pool/eligibility-filters/mobile accept-decline/availability/job-close/mileage (critic-observed CR01–CR03) as due-diligence alternative; Interpreter.io booking page is an unverified bot-checked lead (CR10). Cautions: unset availability reportedly means "available at any time"; pool configuration changes acceptance-time double-booking warnings; global/negative buffers can weaken travel checks. No price, security, privacy, or accessibility finding established — trial + current vendor evidence required (P-V0). No recommendation; included so build-vs-configure is actually compared.

## 3. Exact per-P dispositions (final, post-critique)

### P1: "Track an assignment from request through offer, acceptance, completion, and invoice readiness." — already-covered + correction
XState v5 lifecycle (S07/S08) covers the named chain. Corrections: (1) add terminal UNFILLED with reason codes (no-qualified-interpreter, all-conflicted, client-window-closed, access-requirement-unmet), timestamp, actor; never auto-exits; list views render it distinctly; explicit audited reopen/new-request path with new offer cycle (Minor 2); auto-promotion forbidden. (2) Add offer expiry/decline/cancel transitions (critic P-table). (3) Carry the typed travel record (M5/P6) on the assignment so the brief's "travel estimate" element survives P6's rules exclusion. Transition log (event, actor, guard path, timestamp) feeds the 6-week review.

### P2: "Detect overlapping offers and accepted assignments across coordinators." — already-covered + correction (M2)
Warn-only detection races (CR09 illustration); the requirement is atomic conflict prevention at the final reservation/accept transition. Mechanism-neutral requirement; Postgres exclusion (S01/S02, partial predicate per CR12) is a strong conditional implementation for Postgres-backed architectures. Required offer semantics (new, M2): choose per deployment — Model R (reserving hold: offer commits a short-lived reservation with TTL before notification; expiry/decline/cancel/reassign release it; multi-candidate offers allowed only as non-overlapping holds or explicit over-offer policy with accept-time arbitration) or Model N (non-reserving offer: no hold until accept; accept path runs the atomic conflict check; losers get conflict UX with alternatives). Either model: reservation-before-notification, idempotent retries (idempotency keys), "409-style" conflict response defined as application UX mapping. Validation P-V1 covers two concurrent offers + two concurrent accepts + release/retry; P-V1b is the PocketBase concurrent-write witness (Minor 5).

### P3: "Limit client and meeting details to the coordinator and assigned interpreter roles that need them." — already-covered + enhancement (M3)
Principle retained; enhancement refined into a stage-aware access matrix: (1) coordinators with operational need (scope verified per UD-6, not assumed all-county); (2) offer recipient: decision-sufficient minimum, no automatic client name/topic; (3) accepted/assigned interpreter: minimum required to perform; (4) client-facing role only if later chosen. Sensitive details stay out of email/SMS/lock-screen payloads; authenticated in-app retrieval only. Mechanism per backend (S03/S05) + S13b-derived checklist (re-verified to primary before citation). P-V2 covers records, fields, exports, notification payloads, coordinator scope, and reassignment paths.

### P4: "Record communication mode and access arrangements as structured assignment requirements." — already-covered + enhancement; small user decision
Structured fields (mode, arrangement, verified flag) + matching gate (mismatch blocks or coordinator override-with-reason, audited); unmet access need is an UNFILLED reason. UD-4: unverified self-attestation is never treated as a confirmed match; default coordinator-verified.

### P5: "Automated client confirmations and reassignment authority are cooperative policy decisions." — already-covered + user decision (M4)
Both disputes preserved; neither decided by this plan. UD-1 (confirmations) and UD-2 (reassignment) are explicit release gates/settings with a recorded decision (choice, deciders, effective date). Provisional fail-safe while the vote is pending — confirmations disabled, consent required before reassignment — is labeled TEMPORARY and requires ratification; "ship default" language is withdrawn. Reassignment, when approved, executes defined steps: current-interpreter consent handling, replacement acceptance, client notification per UD-1, audit record. P-V5 tests each approved branch.

### P6: "Travel estimation rules and any payroll connection are outside the defined first release." — split: payroll already-covered; travel conditional with likely correction (M5)
Payroll exclusion stands (invoice-readiness = completed + verified fields + exportable summary; no rates/tax/withholding). Travel: P6 excludes estimation *rules*/automation, not necessarily manual capture. Recommended narrow reading (pending UD-5 board confirmation): Phase 1 carries a typed nullable travel record — `travel_estimate { duration_s: int|null, distance_m: int|null, legs: site-pair refs, provenance: {source, profile|method, recorded_at}, unknown_reason: enum|null }`, units seconds/meters following S06; unroutable/unknown renders "unknown travel," never zero; planning-estimate label. Automatic routing, feasibility rules, and OSRM stay out of Phase 1 unless costed and approved (Arch-1+ slice). Site count/change rate measured in P-V3a; no small-graph claims.

## 4. Candidate architectures (all downgraded to shapes per M7; selection gated on P-V0)

- Arch-0 (configure, M1): interpreter-operations product (e.g. critic-sourced Interpreter Intelligence-class) configured to the brief; custom code only for gaps. Viable only if trial + pricing/security/a11y evidence clears P-V0.
- Arch-1 (guardrailed build): Postgres (exclusion + RLS) + XState lifecycle + manual travel record + minimal preference/notification core + responsive web UI. Phase-1 scope; no OSRM inside (M5 fix).
- Arch-1+ (optional slice): Arch-1 + cached OSRM `table` matrix (stored duration_s/distance_m/profile/version/computed_at) + feasibility warnings. Budget-gated (UD-5).
- Arch-2 (BaaS sprint): PocketBase single binary + XState-lite + manual travel + minimal notifications. Fastest/cheapest to stand up; overlap guarantee is hook-enforced (unverified risk per Minor 5; P-V1b witness required) + pre-1.0 migration duty (S04).
- Arch-3 (substrate assemble): Cal.com primitives (terms-verified) + Postgres guard layer + XState + Novu-or-minimal notifications. Least custom calendar; most integration/license surface.
- Phase-2 optimizer (all build arches): Timefold suggestion ranking on 6-week data; human accept + atomic commit path unchanged.

## 5. User decisions (complete, owners named)

- UD-1: client auto-confirmations policy + channel prefs. Provisional fail-safe: DISABLED. Owner: cooperative members. Gate: decision record + effective date before any automated client message.
- UD-2: reassignment authority guard. Provisional fail-safe: CONSENT-REQUIRED. Owner: cooperative members. Gate: decision record + defined reassignment steps before override behavior exists.
- UD-3: architecture selection (Arch-0–Arch-3). Owner: cooperative + builder jointly on P-V0 evidence. No default.
- UD-4: capability-flag verification. Default: coordinator-verified; self-attestation flagged. Owner: coordinators.
- UD-5: travel-capture confirmation + enhancement gate (narrow-reading field; Arch-1+ funding). Owner: board (6-week review at latest).
- UD-6 (M3): coordinator data scope (all-county vs scoped). Default: scoped until need shown. Owner: cooperative.
- UD-7 (M6): adopted accessibility target. Proposal: WCAG 2.2 AA. Owner: cooperative.

## 6. Conditions, retained constraints, uncertainty

- Conditions: exact exclusion predicate + offer-model choice verified (P-V1); column-minimization shape verified (P-V2); XState persistence verified (P-V4); any S13/critic-attributed claim re-verified to a primary I open myself before being built upon; decision records for UD-1/UD-2/UD-5 before the corresponding behavior ships.
- Constraints preserved: $4,200 cap; 26/4/3-county scale; browser-based + phone-capable day edits with non-drag alternative; AT support; structured access matching; least-privilege incl. out-of-band payloads; UNFILLED honesty + audited reopen; no-payroll boundary; 6-week instrumented review.
- Uncertainty (final): U1 Novu costs/ops; U2 Cal.com license/behavior; U3 Timefold hosting/model cost; U4 ORS/Valhalla/traffic/SLA; U5 RLS CVE specifics; U6 axe-runner specifics (target now UD-7); U7-build shapes (predicate/persistence/minimization — validation-gated, syntax resolved); U8 rate sufficiency (judgment + log check); U9 (new) domain-product price/security/a11y/fit (P-V0); U10 (new) site count/change rate (P-V3a). Critic-attributed facts (CR01–CR10, CR12–CR15) are honestly second-hand in this context and require first-hand verification before build reliance beyond the dispositions above.

## 7. Validations — executed vs proposed (O6, final)

Executed (no runtime; no witness sandbox; nothing pretended): E1 12-primary fetch+excerpt (S01–S12) with locators; E2 grep-verified exclusion/range/OSRM facts; E3 fork-lineage corroboration; E4 negative results (Timefold deep-URL 404s, ORS JS-app unfetchable, pricing/license/a11y/PWA unobserved); E5 SHA-verified frozen critique intake (READY.json hashes matched). These prove documentation/excerpt/intake fidelity — not runtime, price, security, privacy, or conformance behavior.
Proposed (discriminating; each fails a distinct wrong design):
- P-V0 (M1/M7 gate): costed build/configure comparison (one-time build, hosting/ops, notification delivery, migration/backup, a11y review, 6-week support) + domain-product trial (offer-conflict, mobile coordinator, role visibility, workflow cases). Selects UD-3; blocks build order until done.
- P-V1 (M2): two concurrent offers + two concurrent accepts incl. expiry/release/retry/idempotency; exactly-once reservation semantics; conflict UX mapping. Kills detection-only and hold-ambiguous designs. P-V1b: same through the PocketBase path before calling it safe (Minor 5).
- P-V2 (M3): stage-aware matrix incl. coordinator scope, offer-vs-assigned fields, exports, notification/payload contents, reassignment paths; privileged keys absent from client. Kills open-schema and coarse-role designs.
- P-V3: travel-record typing/units/provenance/unknown-reason; unroutable→"unknown," never zero; cache/staleness labels (Arch-1+). P-V3a: site count/change-rate measurement. Kill zero-default, unitless, and small-graph-assuming designs.
- P-V4: lifecycle conformance incl. UNFILLED terminality + audited reopen, expiry/decline/cancel, D2-guard variants; illegal rejected+logged. Kills status-string designs.
- P-V5 (M4): per approved branch — preference/enable gating, coordinator preview, audit; no message without preference+enable+recorded policy. Kills hard-coded-blast and unapproved-default designs.
- P-V6 (M6): adopted target (UD-7, proposed WCAG 2.2 AA) tested by automation-as-partial-signal + manual keyboard/touch/AT task tests with affected interpreters + phone-coordinator day-edit test; drag alternative, text errors, announced state/conflict changes, non-color cues; scope + unresolved findings reported. No conformance-from-runner claims. Kills mouse-only designs.
- P-V7: 6-week costed pilot reconciled to the $4,200 trajectory + ops diary + rate headroom logs. Kills unbounded-scope designs.
- P-V8 (Minor 3): unfilled rate/reasons, offer→accept latency, estimate-vs-actual descriptives + override reasons + warning usefulness, reassignment guard-path counts, confirmation opt-in — dashboarded before week 6. Kills uninstrumented pilots.

## 8. Build order (gated; Phase-1 slice)

0. P-V0 comparison + trials → UD-3 selection; UD-1/UD-2/UD-5/UD-6/UD-7 decision records (provisional fail-safes where votes pend).
1. Schema + atomic reservation path + stage-aware access + seed roles (P2/P3) → P-V1/P-V2.
2. Lifecycle machine + UNFILLED + reopen + transition log (P1) → P-V4.
3. Structured access requirements + matching gate (P4) → P-V4 extension.
4. Typed travel record + unknown state + manual buffers (P6 narrow reading) → P-V3-manual + P-V3a.
5. Preferences + guarded reassignment + audit (P5) → P-V5.
6. Phone-capable day-edit UI + drag alternative + AT pass → P-V6.
7. Instrumentation + board packet (P-V8) + budget reconciliation (P-V7).
8. Optional, separately approved: Arch-1+ OSRM slice (P-V3-full); Novu/Cal.com/Timefold spikes only on evidence.

## 9. Obligation audit (O1–O6)

- O1 (unfamiliar tools/approaches): 9 candidates A–I incl. domain buy/configure (M1), each with applicability verdict; 4 rejected with reasons. Met.
- O2 (primary-source behavior/defaults/limits): 8 deep dives with units, types, defaults, limits, applicability (S01–S12); unverified shapes explicitly gated, never asserted. Met.
- O3 (issue/fix/evolution chain): XState v4→v5 breaking chain (primary S08) + Timefold fork lineage (primary blog/repo S09/S11, hygiene-fixed per Minor 4) + CR09 race family (critic-observed illustration) + honestly-absent primaries (S13b CVE specifics) declared absent, not cited. Met.
- O4 (per-P comparison): every exact P clause dispositioned with correction/enhancement/decision/covered/rejected/uncertain labels in draft and refined here. Met.
- O5 (retained alternatives/conditions/constraints/disagreement/uncertainty, self-contained prose): §§1–6, 8–9; no ID-only text; disagreements D1/D2 preserved as member-owned gates. Met.
- O6 (discriminating validations, executed vs proposed): E1–E5 vs P-V0–P-V8; no runtime pretense; scope kept to this small product brief. Met.

---
*Final saved before native Goal completion. Discovery and draft stand unchanged; this file carries all critique-driven corrections.*
