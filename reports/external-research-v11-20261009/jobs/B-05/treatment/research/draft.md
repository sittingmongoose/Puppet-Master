# Draft — I05 interpreting cooperative, plan comparison + planning deliverable (B-05/treatment/research)

Retained investigator, same native Goal/context as discovery. Discovery (`discovery.md`, SHA frozen by `plan-reveal.json`) was written brief-only and is NOT rewritten here; corrections live in this draft. Plan source: `revealed-plan.md` (revealed after freeze; 6 clauses P1–P6 quoted exactly below). Sources S01–S13 unchanged from discovery; no new sources introduced at draft stage.

## 0. Verdict summary

- The 6-clause plan is directionally sound but thin: it names the lifecycle, overlap, least-privilege, structured access requirements, policy-deferral, and scope boundary without mechanisms, defaults, or honesty/validation behavior.
- Required corrections (3): add UNFILLED terminal state (P1); upgrade overlap "detect" to DB-atomic prevent+detect (P2); keep a nullable travel-estimate/unknown-travel field in Phase 1 even though travel *rules* are out (P6-travel).
- Already-covered directions (3): least-privilege roles (P3), structured access requirements (P4), policy-deferral D1/D2 (P5) — each retained with a concrete mechanism enhancement.
- Rejected: nothing in the plan is rejected outright; H-list items from discovery (full payroll, native apps, black-box matching, commercial-routing-only) stay rejected.
- Uncertain (carried, not hidden): Novu/Cal.com/Timefold ops costs, ORS quotas, AGPL terms, PWA/axe specifics, partial-exclusion predicate syntax, column-minimization implementation shape — all marked below and in §5.

## 1. Exact per-P disposition

Disposition vocabulary (per assignment): correction | optional enhancement | user decision | already-covered | rejected | uncertain.

### P1: "Track an assignment from request through offer, acceptance, completion, and invoice readiness."
- Disposition: **already-covered + correction**.
- Already-covered: discovery §O2-5 models exactly this lifecycle as an XState v5 state machine (states/events/guards, actor-per-request; S07/S08).
- Correction (required): P1 omits the brief's honesty requirement — "a clear way to mark a request as unfilled rather than imply that a qualified interpreter is available." Add terminal state **UNFILLED** (reason codes: no-qualified-interpreter, all-conflicted, client-window-closed, access-requirement-unmet; timestamp + actor). UNFILLED never auto-exits; list views render it distinctly from pending/offered.
- Correction (required, minor): P1 also drops the brief's "travel estimate" lifecycle element. Per P6 ruling below, keep a nullable `travel_estimate` (value + unknown flag + source label) on the assignment even though estimation *rules* are Phase-2. Rationale: the board reviews travel pain in 6 weeks; "no field" means "no data."
- Enhancement (optional): persist transition log (event, actor, guard path, timestamp) for the 6-week review; Stately visualization for the board packet.
- Uncertainty: exact XState `setup()`/persistence shapes were not fully verified in-window — re-verify against the v5 API reference at build (S07/S08 give the actor/rename facts, not the full persistence recipe).

### P2: "Detect overlapping offers and accepted assignments across coordinators."
- Disposition: **already-covered + correction**.
- Already-covered: discovery agrees overlap across coordinators is the load-bearing invariant (the observed shared-calendar failure).
- Correction (required): "detect" understates the fix. App-layer detection races (two coordinators both pass the check, both commit). Enforce **prevention at the database** with `EXCLUDE USING gist (interpreter_id WITH =, period WITH &&)` on `tstzrange` + `btree_gist` (S01/S02), and surface violations as 409-style UX ("just taken — here are qualified alternatives"). Detection (availability warnings, back-to-back travel flags) stays as UX *above* the guarantee, not instead of it.
- Conditions: exclusion covers offered+accepted rows (cancelled/declined/expired excluded via predicate — predicate syntax NOT re-verified in-window, confirm against `CREATE TABLE ... EXCLUDE` reference); travel buffers widen the guarded range when present, manual buffer entry allowed while travel rules are out (P6).
- PocketBase-variant condition: if Arch-2 is chosen, the invariant drops to hook-enforced checks (no exclusion in SQLite) — weaker by construction; the draft recommends Arch-1 where the guarantee matters (see §3).
- Validation: P-V1 race test (§6) discriminates prevention designs from detection-only designs.

### P3: "Limit client and meeting details to the coordinator and assigned interpreter roles that need them."
- Disposition: **already-covered + optional enhancement**.
- Already-covered: discovery §O2-2/O2-3 implements exactly this least-privilege shape (coordinator-full vs interpreter-need-to-know).
- Enhancement (recommended): Supabase/Postgres path — per-table RLS (grants AND policies, S03), interpreter payloads stripped to need-to-know columns via views/secure functions, `service_role` server-side only, `42501` = grant bug not policy bug (S03). PocketBase path — locked-default 5-rule model with rules-as-filters and documented failure codes (S05). Either path: availability data is coordinator-queried, never broadcast; interpreter home locations only with consent.
- Enhancement (recommended): add the S13b-derived checklist as build gates (per-table audit, no client-bundled privileged keys, security_invoker views, FORCE RLS where apt) — but S13b is secondary (NEEDS-PRIMARY), so each item must be verified against vendor/NVD primaries before being cited as fact.
- Not a correction: P3's role split matches the brief; no role-model change proposed.

### P4: "Record communication mode and access arrangements as structured assignment requirements."
- Disposition: **already-covered + optional enhancement**.
- Already-covered: discovery requires structured fields (mode, arrangement, verified flag), not free text.
- Enhancement (recommended): matching gate — offer creation checks interpreter capabilities vs required mode/arrangement; mismatch blocks, or allows coordinator override-with-reason (audited). Unmet access requirement is one of the UNFILLED reason codes (ties P4 to the P1 correction).
- User decision (small): who verifies capability flags (self-attested vs coordinator-verified)? Default: coordinator-verified, self-attestation flagged until confirmed. Low stakes; decide at build.

### P5: "Automated client confirmations and reassignment authority are cooperative policy decisions."
- Disposition: **already-covered + user decision** (no correction; plan correctly defers).
- Already-covered: discovery retains D1/D2 as open disagreements with configuration-shaped homes (preference table / Novu-shaped workflow for D1; guarded reassignment event for D2 — S12/O2-8).
- User decisions (required before build, owned by the cooperative, not the builder):
  - UD-1 (D1): default OFF for automated client confirmations; per-client opt-in + per-event coordinator preview + audit trail. Novu adoption vs minimal-built-in preference table is an ops-cost decision (Novu pricing/ops NOT observed — uncertain).
  - UD-2 (D2): default consent-required for reassigning accepted work; alternative guard coordinator-override-with-audit-notify available as a one-line product decision. Ship UD-2 default; log every guard path for the 6-week review.
- The draft takes no unilateral position beyond safe defaults; either member vote is implementable without rework.

### P6: "Travel estimation rules and any payroll connection are outside the defined first release."
- Disposition: **split — already-covered (payroll) + conditional/uncertain with correction (travel)**.
- Payroll half — already-covered: brief excludes full payroll; invoice-*readiness* (completed + verified fields + exportable summary; no rates/tax/withholding) is the boundary. No change.
- Travel half — conditional acceptance + correction: scoping estimation *rules* (routing engine, auto-computation) out of Phase 1 is admissible and budget-coherent. But the brief lists "travel estimate" in the tracked lifecycle and names long travel gaps as core pain. Correction: Phase 1 MUST still carry a nullable `travel_estimate` field (manual entry + `unknown` state + source label, e.g. "coordinator estimate" vs "OSRM cached" later) and SHOULD warn on back-to-back feasibility from manual buffers. "Rules out" must not become "no data."
- Optional enhancement (recommended, budget-gated): cached OSRM `table` matrix (durations seconds, distances meters, fastest-not-shortest — S06) for site×site pairs, stored with profile/version/computed_at; unroutable → "unknown travel," never zero; planning-estimate label (no live traffic — folk claim, NEEDS-PRIMARY). Self-host or quota-controlled; never unlimited public demo endpoints (secondary SLA warning, S13a).
- Uncertainty: ORS free-tier quotas, Valhalla role, live-traffic behavior — all secondary (S13a). OSRM v5.24.0 units/semantics/limits are primary (S06).

## 2. Retained findings (from discovery, still standing after comparison)

- F1. Postgres exclusion + `tstzrange` + `btree_gist` is the double-book answer (S01/S02). Load-bearing; no plan clause contradicts it.
- F2. Grants AND policies (Supabase) / locked-default 5 rules (PocketBase) govern least-privilege; failure codes differ by layer (S03/S05).
- F3. OSRM units/semantics: seconds/meters, fastest-not-shortest, TSP approximation limits, HTTP/1.0 server limits (S06). Enhancement-gated, not Phase-1-required.
- F4. XState v5 actor model + breaking v4→v5 renames + TS 5.0 floor (S07/S08). Lifecycle home incl. UNFILLED + D2 guards.
- F5. Timefold is the maintained solver lineage (fork 2023-04-20, Apache-2.0, S09/S11); OptaPlanner is EOL for new work; solver is Phase-2 on 6-week data.
- F6. Cal.com API posture (OAuth-first, key hygiene, 120/min, Platform freeze — S10); substrate adoption conditional on license/self-host verification (S13d).
- F7. Novu workflow shape (multi-channel, prefs, Inbox, self-host-or-cloud — S12); minimal-built-in fallback admissible; costs unverified.
- F8. Rejected-at-discovery stays rejected: full payroll, native apps, black-box matching, commercial-routing-only.

## 3. Conditions, alternatives, optional capabilities

- Conditions: (a) partial-exclusion predicate syntax verified before build; (b) column-minimization shape (views/secure functions) verified before build; (c) XState persistence/Event-log shape verified; (d) any S13-derived claim re-verified to primary before being built upon or cited as fact.
- Alternatives retained (all Phase-1 shippable): Arch-1 guardrailed monolith (recommended: Postgres + XState + OSRM-cache + minimal notifications + responsive web); Arch-2 BaaS sprint (PocketBase single-binary, weaker guarantee, pre-1.0 duty — S04); Arch-3 substrate assemble (Cal.com primitives IF terms verify + guard layer + lifecycle + notifications). Phase-2 optimizer (Timefold suggestions, human accept, DB exclusion commit) fits all three.
- Optional capabilities (explicitly optional, not Phase-1 promises): Novu full workflow layer; Cal.com routing/round-robin; Timefold ranked offers; PWA offline writes; live-traffic travel.
- Constraints preserved: $4.2k envelope; 26/4/3-county scale; browser-based + phone-capable day edits; AT support + structured access matching; sensitivity minimization; UNFILLED honesty; 6-week board instrumentation; no-payroll boundary.

## 4. User decisions (complete list)

- UD-1: client auto-confirmations policy + channel prefs (default OFF; per-client opt-in). Owner: cooperative members.
- UD-2: reassignment authority guard (default consent-required; override-with-audit alternative). Owner: cooperative members.
- UD-3: backend path if ops capacity binds (Arch-1 vs Arch-2 vs Arch-3). Owner: cooperative + builder jointly (cost/ops evidence in §6 P-V7).
- UD-4: capability-flag verification (coordinator-verified vs self-attested). Default proposed; owner: coordinators.
- UD-5: travel-enhancement budget gate (ship manual-estimate Phase-1 vs fund OSRM-cache enhancement). Owner: board at/after 6-week review.

## 5. Uncertainty (complete list — nothing hidden)

- U1. Novu self-host ops + pricing (S12 silent) → UD-1/UD-3 fallback exists.
- U2. Cal.com license (AGPL copyleft scope) + self-host + routing/round-robin behavior (S13d secondary) → Arch-3 gated.
- U3. Timefold JVM hosting + model-build cost (unobserved) → Phase-2 gated on 6-week toil data.
- U4. ORS quotas/traffic behavior, Valhalla role, demo SLAs (S13a secondary) → OSRM-cache enhancement uses primary S06 only + self-host default.
- U5. Supabase failure-mode CVE specifics (S13b secondary) → checklist shape retained, facts unverified.
- U6. axe-core/WCAG runner + PWA/Workbox specifics (S13f secondary/unobserved) → P-V6 proposes verification-first.
- U7. Partial-exclusion predicate + column-minimization + XState persistence exact shapes (standard but unverified in-window) → build-time verification gates (§3a–c).
- U8. 120/min sufficiency is judgment (human-driven ≪ 2 req/s) → P-V7 log check.

## 6. Validations — executed vs proposed (O6)

Executed (discovery; no runtime; no witness sandbox claimed): E1 12-primary fetch+excerpt with locators; E2 grep-verified exclusion/range/OSRM facts; E3 fork-lineage corroboration; E4 negative results (Timefold deep-URL 404s, ORS JS-app unfetchable, pricing/license/a11y/PWA unobserved). These prove documentation claims and excerpt fidelity — not runtime behavior. No runtime was available; nothing below is pretended to have run.

Proposed (discriminating; each fails a distinct wrong design):
- P-V1. Overlap race: concurrent overlapping offers → exactly one commits, other gets 409-style UX. Kills detection-only designs.
- P-V2. Least-privilege matrix: role × table × op grants/policies or 5-rule codes; privileged keys absent from client; interpreter payloads minimal. Kills open-schema designs.
- P-V3. Travel sanity: known pairs s/m + fastest semantics; unroutable → "unknown," never zero; cache/staleness labels. Kills zero-default and no-cache designs.
- P-V4. Lifecycle conformance: all legal/illegal transitions incl. UNFILLED terminality + D2-guard variants; illegal rejected+logged. Kills status-string designs.
- P-V5. Notification matrix: default-OFF, per-client opt-in, coordinator preview, audit; no message without preference+enable. Kills hard-coded-blast designs.
- P-V6. Accessibility gate: runner-verified WCAG-2.2-AA automation + keyboard-only day-edit + AT walkthrough with affected interpreters; zero critical to ship. Kills mouse-only designs.
- P-V7. Budget/ops fit: 6-week costed pilot ≤ $4.2k trajectory; ops diary (Postgres vs single-binary vs substrate); Cal.com headroom log if adopted. Kills unbounded-scope designs.
- P-V8. Board instrumentation: unfilled rate/reasons, offer→accept latency, travel-warning precision/recall, reassignment guard-path counts, confirmation opt-in — dashboarded before week 6. Kills uninstrumented pilots.

## 7. Build order (Phase-1 slice)

1. Schema + exclusion + RLS/rules + seed roles (P2/P3) → P-V1/P-V2.
2. Lifecycle machine + UNFILLED + transition log (P1 + correction) → P-V4.
3. Structured access requirements + matching gate (P4) → P-V4 extension.
4. Manual travel-estimate field + unknown state + back-to-back buffer warnings (P6-travel correction) → P-V3-manual.
5. Preferences + guarded reassignment + audit (P5/UD-1/UD-2) → P-V5.
6. Phone-capable day-edit UI + AT pass (constraints) → P-V6.
7. Instrumentation + board packet (P-V8) + budget reconciliation (P-V7).
8. Optional, budget-gated: OSRM cache (P-V3-full); Novu/Cal.com spikes only on evidence.

---
*Draft is a complete planning deliverable for this scope; later stages may correct it. Next: await ../critic/READY.json, then disposition and final.md in this same context.*
