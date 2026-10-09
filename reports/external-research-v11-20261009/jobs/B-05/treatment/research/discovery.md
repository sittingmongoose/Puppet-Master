# Discovery — I05 regional interpreting cooperative (B-05/treatment/research)

Method M14 v1, retained investigator. Brief-only discovery: the case plan was NOT read before this file (reveal gate still unfired at time of writing). Sources: own `input-map.json`, exact brief `cases/I05/brief.md`, and independently chosen public primary sources S01–S12 (S13 secondary, marked). No predecessor, no source roots, no campaign/history/evaluator/counterpart read, no nested agents.

Access window: 2026-10-09T20:21–20:26Z. Source IDs immutable; detail in `source-map.json`, excerpts in `sources/`, index in `sources/index.md`.

## 0. Brief constraints (extracted, preserved verbatim in meaning)

- Scale: 26 interpreters, 4 coordinators, 3 counties; short-notice changes; long travel gaps.
- Budget/ops: $4,200 first release; browser-based tool supportable by the co-op; coordinators may update the day's schedule from a phone.
- Sensitivity: client names, meeting topics, interpreter availability are sensitive; interpreters receive only details needed for an assignment (least-privilege disclosure).
- Current failure: calls + shared calendar; two coordinators occasionally offer the same person to different clients (concurrent double-offer / double-book race).
- Access: some interpreters use assistive technology; several clients require a specific communication mode or access arrangement (matching constraint, not free text).
- Lifecycle to track: request → offer → acceptance → travel estimate → completion → invoice readiness; explicitly NOT a full payroll system.
- Honesty requirement: a clear way to mark a request UNFILLED rather than imply a qualified interpreter is available (no phantom availability).
- Live disagreements (must be retained, not decided unilaterally): (D1) whether clients receive automated confirmations; (D2) whether coordinators can reassign accepted work without asking the interpreter.
- Governance: board reviews first six weeks before approving further spend (instrument the pilot; keep scope shippable in one release).

## 1. O1 — Useful unfamiliar tools, products, materially different approaches

All candidates below were chosen independently of the (still-sealed) thin plan. "Unfamiliar" means outside the obvious calls/shared-calendar/Google-Calendar reading of the brief.

### A. Constraint-guaranteed no-double-book: Postgres range + exclusion constraint (mechanism, not product)
- What: model each assignment window as `tstzrange` and enforce `EXCLUDE USING gist (interpreter_id WITH =, period WITH &&)` with `btree_gist` (S01/S02). DB-atomic; application pre-checks alone race.
- Why unfamiliar/useful: most small-team plans check overlap in app code or rely on calendar UI; the exclusion constraint makes the observed failure (two coordinators offering the same person) structurally impossible at commit time, including travel-buffer windows if modeled as extended ranges.
- Material difference: correctness at the storage layer vs diligence at the UI layer.

### B. BaaS with opposite security/ops tradeoffs: Supabase (Postgres RLS) vs PocketBase (SQLite + API rules)
- Supabase: Postgres Row Level Security — grants + policies, policy-as-WHERE-clause, `service_role` bypasses RLS (S03). Defense in depth through third-party tooling; fits least-privilege interpreter views.
- PocketBase v0.40.5: single-binary embedded SQLite + realtime + auth + dashboard + REST-ish API (S04); per-collection 5 API rules (`list/view/create/update/delete`), default `locked` (superuser-only), rules double as record filters, distinctive failure codes (S05).
- Why unfamiliar/useful: both collapse backend build cost toward the $4.2k envelope, but with opposite failure modes (S03 danger: exposed table without RLS is open; S04 warning: pre-1.0, no full backward compat; S13e secondary: ~13 containers/4GB vs single binary — NEEDS-PRIMARY).
- Material difference: DB-layer authorization (Supabase) vs API-layer authorization (PocketBase); managed Postgres ops vs single-binary ops.

### C. Open-source constraint solver for assignment: Timefold Solver (successor of OptaPlanner)
- What: Apache-2.0 embeddable constraint-satisfaction engine; docs split Solver (open source) / managed Models (incl. Employee Shift Scheduling) / Platform REST API (S11). Forked 2023-04-20 from OptaPlanner; blog 2023-05-02 "OptaPlanner continues as Timefold" (S09).
- Why unfamiliar/useful: turns travel gaps + qualifications + availability + fairness into hard/soft constraints instead of first-fit manual picking. Secondary Baeldung shape (NEEDS-PRIMARY): hard = availability/qualification/no-double-book, soft = pairing/fairness.
- Material difference: optimize-then-review vs pick-then-defend; but JVM + modeling cost likely exceeds first-release budget — retained as Phase-2 candidate with a manual-first + guardrails Phase-1 (see §6).
- Companion warning: do not start new work on OptaPlanner (toolchain-only 10.x, no bug/security fixes per S09/S13c).

### D. Self-hosted routing for travel estimates: OSRM (primary) vs OpenRouteService/Valhalla (secondary)
- OSRM v5.24.0 HTTP API: services route/nearest/table/match/trip/tile; `table` gives all-pairs fastest-route durations in **seconds** and distances in **meters** (fastest, not shortest); `trip` is TSP approximation (brute force <10 waypoints, greedy farthest-insertion ≥10, not guaranteed fastest, all inputs must be connected, `roundtrip` default true); built-in server is HTTP/1.0 keep-alive, 512 req/conn, ≤5s between requests; coordinates `{lon},{lat}` or polyline (S06).
- Why unfamiliar/useful: replaces hand-waved "travel estimate" with a cached, self-hostable matrix (`table`) for back-to-back feasibility checks across 3 counties, without per-request commercial billing inside the $4.2k envelope.
- ORS free-tier "2000/day, 40/min" and Valhalla roles are S13a secondary (NEEDS-PRIMARY); demo servers carry no SLA (secondary) — plan self-host or controlled quota, not unlimited public endpoints.

### E. Explicit assignment lifecycle as a state machine: XState v5
- XState v5: event-driven statecharts + actor model; `createMachine` + `createActor(machine).start()` + `send`/`subscribe` (S07); v4→v5 is breaking (`Machine`→`createMachine`, `interpret`→`createActor`, `withConfig`→`provide`, TS ≥5.0, strictNullChecks — S08).
- Why unfamiliar/useful: the six-stage lifecycle + UNFILLED honesty requirement is a state machine, not a status string. Actor-per-request with illegal-transition rejection gives the "unfilled rather than imply available" guarantee a reviewable, testable home. Visual Stately tooling aids the 6-week board review.
- Material difference: transition-guarded lifecycle vs free-form status edits; pairs with DB exclusion (XState guards the workflow, Postgres guards the invariant).

### F. Scheduling substrate instead of custom calendar: Cal.com (open-source scheduling infrastructure)
- API v2: OAuth preferred over API keys; keys prefixed `cal_`/`cal_live_`, never in client-side code; HTTPS mandatory; API-key rate 120 req/min (raisable ~200, ~800 with charges via support); Platform plan frozen for new signups as of 2025-12-15 (S10). Secondary (NEEDS-PRIMARY): self-hostable AGPL, routing forms, round-robin, collective events (S13d).
- Why unfamiliar/useful: routing forms (intake→route by specialty/availability) and round-robin map onto interpreter request triage; availability primitives replace shared-calendar folk logic. AGPL copyleft consequence unverified — integrate-via-API vs embed decision must wait for license verification.
- Material difference: adopt scheduling infrastructure vs build a bespoke calendar + availability model.

### G. Preference-aware notifications for the disputed confirmation question: Novu (open source)
- Novu: open-source notification infrastructure; Notify = workflows across Inbox/email/SMS/push/chat with trigger/personalize/channel routing; Inbox = realtime feed with read/archive/snooze/configure; self-host or cloud (S12).
- Why unfamiliar/useful: D1 (automated client confirmations) should be a per-client/per-coordinator **preference + workflow**, not a global on/off. Novu-shaped workflow layer (or a minimal built-in preference table if Novu ops cost is too high) preserves the disagreement as configuration. Secondary Knock/Courier comparisons not verified — Novu retained on its own docs only.
- Pricing/self-host ops cost NOT observed — explicit uncertainty (§5).

### H. Rejected-at-discovery (retained for O5, not recommended)
- Full payroll/HRIS: brief explicitly excludes; invoice-*readiness* only.
- Commercial maps/routing with per-request billing as the only travel source: incompatible with fixed $4.2k unless cached and capped; OSRM self-host retained instead.
- Native mobile apps: brief says browser-based + phone-capable coordinator edits → responsive PWA-shape, not app-store builds (PWA/Workbox specifics NOT verified — proposal only, §5).
- Blockchain/"AI matching" black boxes: no primary investigated; excluded as unverifiable within budget.

## 2. O2 — Primary-source behavior: defaults, units/types, limits, applicability

### O2-1. Postgres exclusion + ranges (S01/S02) — APPLIES, load-bearing
- Semantics: for any two rows, at least one operator comparison must be false/null, else violation (S01). Auto-creates the declared index type (S01).
- Types: use `tstzrange` (timestamptz range), not `tsrange`, for multi-county DST-correct scheduling (S02 built-ins).
- Composition: scalar equality + range overlap needs `btree_gist` (`interpreter_id WITH =, period WITH &&`) — canonical room_reservation pattern in S02.
- Operators/index: GiST/SP-GiST on ranges accelerate `&&` etc. (S02); `UNIQUE` is "usually unsuitable for range types" — exclusion is the documented idiom (S02).
- I05 mapping: `assignments(interpreter_id, period tstzrange, status)` with `EXCLUDE ... WHERE (status IN ('offered','accepted'))`-style predicate (predicate form is standard Postgres but the exact partial-exclusion syntax was NOT re-verified in-window — confirm against `CREATE TABLE ... EXCLUDE` reference before build). Include travel buffers by widening `period` or a second `blocked_period` range.
- Limits: exclusion does not pick the *best* interpreter, only rejects conflicts; needs a companion availability/qualification query + UX surfacing the 409-style conflict. GiST write overhead at 26 interpreters is negligible (engineering judgment, not a measured claim).

### O2-2. Supabase RLS grants+policies (S03) — APPLIES for least-privilege views
- Two gates: grants (can the role run the op at all) AND policies (which rows); both must be set (S03). New `public` tables may start fully granted to anon/authenticated/service_role — adding policies does not revoke grants (S03).
- Policy = implicit WHERE on every access, incl. third-party tooling (defense in depth) (S03). Missing grant → `42501` before any policy runs (diagnostic!) (S03).
- Roles: `anon` vs `authenticated`; `service_role` bypasses RLS, server-side only (S03).
- I05 mapping: interpreters get a view/policy exposing only their own assignments' need-to-know columns (time, site, access arrangement, contact channel) while client names/topics stay coordinator-scoped; coordinators get 3-county scope. Every table in the exposed schema needs RLS (S03 danger callout).
- Limits: RLS is row-level; column minimization needs views/secure functions + grants (standard Postgres, not re-verified in-window — proposal). Misconfiguration class is systemic (S13b secondary) — requires a per-table secure-table checklist + Security Advisor-style audit as a proposed validation (§5).

### O2-3. PocketBase API rules (S04/S05) — APPLIES as budget alternative, different trust root
- Defaults: all 5 rules default `locked` (null) = superuser-only (S05). Non-empty string = filter expression; empty string = anyone (S05). Auth collections add `options.manageRule` (S05).
- Rules-as-filters: `listRule` filters listings; failures: list→200-empty, create→400, view/update/delete→404, locked-non-superuser→403 (S05). Superuser bypasses all rules (S05).
- Platform: SQLite embedded, realtime subscriptions, builtin auth, dashboard, REST-ish; `./pocketbase serve` (S04). Pre-1.0: "NOT recommended for production critical applications yet" without changelog-driven migrations (S04).
- I05 mapping: fastest path to a 30-user pilot (single binary, trivial backup = SQLite file); locked-by-default + per-view rules can approximate least-privilege. But: API-layer enforcement (bypass = app bug, not DB guarantee), SQLite single-writer, no Postgres exclusion constraint — the double-book invariant would live in app/hook code, weaker than O2-1.
- Applicability verdict: viable Phase-1 IF the co-op accepts hook-enforced overlap checks + pre-1.0 migration duty; otherwise Postgres-backed (Supabase or plain Postgres) for the exclusion guarantee.

### O2-4. OSRM travel matrix (S06) — APPLIES for feasibility + estimates, with caching
- Units: durations **seconds**, distances **meters**; table distances are fastest-route distances, not shortest-path (S06). Radiuses meters; bearings degrees true-north clockwise (S06).
- Services: `table` = all-pairs matrix (nullable cells when unroutable) with sources/destinations waypoints; `trip` = TSP approximation with stated algorithm split and no-optimality guarantee (S06). `format` default json; profiles (`car`/`bike`/`foot`) are build-time Lua (S06).
- Server limits: HTTP/1.0, 512 req/connection, ≤5s gap (S06) — run behind a proper reverse proxy; do not expose the demo profile to production.
- I05 mapping: precompute/cache a site×site (and interpreter-home×site where consented) duration matrix; use it for (a) back-to-back feasibility warnings, (b) displayed travel estimates, (c) optional Timefold distance input later. Cache aggressively: 3 counties = small, slowly changing graph; store `duration_s`, `distance_m`, `computed_at`, `profile`, `osrm_version`.
- Limits: posted-speed, no live traffic (secondary folk claim, NEEDS-PRIMARY — treat OSRM output as planning estimate, show "typical, not live" label); unroutable cells must surface as "unknown travel", never zero; demo server has no SLA (secondary) — self-host or quota-controlled ORS for production.

### O2-5. XState v5 lifecycle (S07/S08) — APPLIES as workflow guard
- Model: states = request/offered/accepted/in-progress/completed/invoice-ready/unfilled(+cancelled); events = offer/accept/decline/reassign/complete/mark-unfilled; illegal transitions rejected + logged (pattern from docs spirit; exact `setup()`/`fromPromise` actor-invocation shapes partially observed in secondary only — re-verify against v5 API reference before build).
- Version floor: TS ≥5.0, strictNullChecks recommended (S08); v4 snippets (`Machine`, `interpret`, `withConfig`) are deprecated renames (S08) — lint against them.
- I05 mapping: UNFILLED is a terminal, first-class state with reason + timestamp (honesty requirement); reassignment-after-accept is a guarded event whose guard encodes the D2 decision (require-interpreter-consent vs coordinator-override-with-audit) once the members decide — the machine makes the policy visible instead of burying it in button permissions.
- Limits: XState guards workflow, not storage races — still needs O2-1 at the DB; actor-per-request is fine at this scale; persistence (event log / snapshot) must be designed, not assumed.

### O2-6. Cal.com API posture (S10) — CONDITIONAL
- Observed: OAuth-over-API-key, key hygiene, HTTPS, 120/min API-key cap, Platform freeze (S10).
- Applicability: Conditional on (a) verifying AGPL/self-host terms (S13d), (b) confirming routing-forms/round-robin behavior from primary docs (not fetched), (c) 120/min sufficing for 30 users (it does by inspection: human-driven scheduling ≪ 2 req/s sustained — judgment, propose a load check in §5).
- If adopted: Cal.com owns availability capture + booking primitives; the co-op app owns qualification matching, travel feasibility, UNFILLED honesty, and invoice-readiness (Cal.com is not an interpreting domain model).

### O2-7. Timefold adoption shapes (S09/S11) — DEFERRED to Phase 2
- Observed: open solver vs managed shift-scheduling model vs platform API (S11); maintained fork, Apache-2.0 (S09).
- Applicability: Phase-1 manual-first + guardrails (exclusion + qualification filter + travel warnings) fits $4.2k; Timefold enters when 6-week data shows coordinator toil worth optimizing. JVM hosting + model-building cost NOT observed — uncertainty.

### O2-8. Novu workflow layer (S12) — CONDITIONAL / minimal-built-in fallback
- Observed: workflow-per-notification, multi-channel, subscriber prefs, Inbox component, self-host-or-cloud (S12).
- Applicability: adopt Novu only if its self-host ops fit co-op capacity; otherwise build the *minimal equivalent*: `notification_preferences(client_id, channel, event, enabled)` + coordinator-visible preview/audit + per-event kill switch. Either way D1 stays configuration, not code.

## 3. O3 — Issue/fix/regression/release and evolution chains

### O3-1. OptaPlanner → Timefold fork (evolution chain, PRIMARY-backed) — APPLIES
- Chain: OptaPlanner (Geoffrey De Smet, mid-2000s, Red Hat-maintained) → Red Hat ends support late 2022 → Timefold BV founded early 2023 → fork 2023-04-20 (Apache-2.0 preserved) → announcement "OptaPlanner continues as Timefold" 2023-05-02 → core engineers join Timefold → OptaPlanner 10.x toolchain-only, Timefold monthly releases with 100+ bug/security fixes (S09 + S13c corroboration).
- I05 consequence: any constraint-solver spike starts at Timefold, never OptaPlanner. Absence note: no specific Timefold scheduling regression was investigated (out of Phase-1 scope); the chain's value is lineage + maintenance verdict, not a bug postmortem.

### O3-2. XState v4→v5 breaking migration (release chain, PRIMARY-backed) — APPLIES
- Chain: v4 API (`Machine`, `interpret`, `withConfig`) → v5 launch (blog 2023-12-01 per S08) → renames (`createMachine`, `createActor`, `provide`) + TS 5.0 floor + strictNullChecks/skipLibCheck guidance, each marked "Breaking change" (S08).
- I05 consequence: pin v5; add a lint/test that fails on v4 imports; budget a half-day for Stately tooling gaps (VS Code extension "does not fully support XState v5 yet" per S07 page observation).

### O3-3. Supabase/PocketBase authorization failure class (issue class, SECONDARY — needs primary before final citation)
- Observed only as search snippets (S13b): systemic missing-RLS exposure (UpGuard 16k), generator-scaffolded permissive policies (CVE-2025-48757), Realtime presence.read bypass ≤2.111.1 (CVE-2026-62247), workflow-bypassing RLS inserts (CVE-2026-100623), service_role-key traversal (CVE-2026-103255), owner-bypass without FORCE RLS, SECURITY-DEFINER views.
- Status: evidence is ABSENT at primary level in-window; retained as a failure-mode checklist + proposed validation (per-table RLS audit, no service_role in client, security_invoker views, FORCE RLS where apt), not as cited fact. PocketBase analogue (rule-empty-string = anyone, superuser bypass — S05 primary) gets the same checklist shape at the API layer.

## 4. Retained disagreements, constraints, uncertainty (O5 inputs)

- D1 client auto-confirmations: retained as per-client preference + per-event coordinator preview; Novu-shaped or minimal-built-in; default OFF until the members decide (no unilateral automation of client comms).
- D2 reassignment-without-asking: retained as a guarded XState event with two admissible guards (consent-required vs override-with-audit-notify); ship consent-required default, make the guard a one-line product decision.
- UNFILLED honesty: terminal state with reason codes (no-qualified-interpreter, all-conflicted, client-window-closed, access-requirement-unmet); list views must render it distinctly from "pending"; never auto-upgrade to offered.
- Least-privilege: interpreters see assignment-need-to-know only; availability data is coordinator-queried, never broadcast; travel matrix stores site pairs, interpreter home locations only with consent + minimization note.
- Assistive tech: PWA-shape responsive UI + keyboard/ARIA discipline; axe-core/WCAG-2.2-AA automation proposed (S13f secondary — tool choice unverified); manual AT testing with the affected interpreters is the real gate.
- Communication-mode/access-arrangement matching: structured fields (mode, arrangement, verified flag), not free text; mismatch blocks offer or forces coordinator override-with-reason.
- $4.2k + 6-week board review: Phase-1 = manual-first + guardrails + instrumented pilot (offer-accept latency, double-offer attempts blocked, unfilled rate/reasons, travel-warning hit rate, confirmation pref distribution); solver/automation is Phase-2 on data.
- Phone-capable coordinators: day-schedule edit path must work on mobile browsers (touch targets, offline-tolerant reads proposed; offline writes NOT promised).
- No-payroll boundary: invoice-readiness = completed + verified fields + exportable summary; no rates/tax/withholding.

## 5. O6 — Executed checks vs proposed discriminating validations

Executed (this discovery; no runtime, no witness sandbox claimed):
- E1. Fetched + excerpted 12 primaries (S01–S12) with locators/access times; recorded observed operations in source-map.json. (Proves docs claims, not runtime behavior.)
- E2. Grep-verified within saved copies: exclusion semantics + auto-index (S01), tstzrange built-in + btree_gist room pattern + GiST operators (S02), OSRM s/m units + fastest-not-shortest + trip algorithm split + server limits (S06). (Proves excerpt fidelity.)
- E3. Corroborated fork lineage across blog + repo notice + history page snippets (S09/S13c). (Proves lineage direction; counts/versions still secondary.)
- E4. Negative results honestly recorded: Timefold quickstart deep URLs 404'd (docs root used instead); ORS dev docs JS-app unfetchable (933 bytes); Novu pricing/ops, Cal.com license/self-host, axe-core rules, PWA/Workbox specifics NOT observed.

Proposed (discriminating, Phase-1-gated; none executed — no runtime available, no pretense):
- P-V1. Double-offer race test: two coordinators offer the same interpreter overlapping windows concurrently; expect exactly one commit, other gets exclusion-violation → 409-style UX. Discriminates DB-guarantee (O2-1) from app-check designs.
- P-V2. RLS/rules matrix test: per role × table × op, assert grants+policies (Supabase) or 5-rule codes (PocketBase: 200-empty/400/404/403 shapes per S05); assert service_role/superuser never in client bundle; assert sensitive columns absent from interpreter payloads.
- P-V3. Travel-matrix sanity: known site pairs return durations in seconds/distances in meters, fastest-route semantics; unroutable pair returns null → "unknown travel" UI, never zero; cache-hit rate + staleness labels verified.
- P-V4. Lifecycle conformance: drive the XState machine through every legal/illegal transition incl. UNFILLED terminality and D2-guard variants; assert illegal transitions rejected + logged, UNFILLED never auto-exits.
- P-V5. Notification-preference matrix: D1 on/off per client × event; assert default-OFF, coordinator preview, audit trail; assert no client message without a preference row + event enable.
- P-V6. Accessibility gate: axe-core WCAG-2.2-AA run (tool unverified — confirm runner first) + keyboard-only day-edit pass + AT walkthrough with affected interpreters; zero critical violations to ship.
- P-V7. Budget/ops fit: 6-week costed pilot (hosting + routing + notifications + on-call) reconciled to $4.2k; PocketBase-vs-Postgres ops diary; Cal.com 120/min headroom log if adopted.
- P-V8. Board-review instrumentation: unfilled rate/reasons, offer→accept latency, travel-warning precision/recall, reassignment counts by guard path, confirmation opt-in rate — dashboarded before week 6.

## 6. Candidate architectures (three materially different, all Phase-1 shippable)

- Arch-1 "Guardrailed monolith" (recommended Phase-1): Postgres (exclusion + RLS) + XState lifecycle service + OSRM table cache + minimal preference/notification core + responsive web UI. Strongest correctness story; moderate build.
- Arch-2 "BaaS sprint": PocketBase (single binary, locked-default rules, hook-enforced overlap checks) + XState-lite lifecycle + cached OSRM + minimal notifications. Fastest/cheapest; weaker double-book guarantee + pre-1.0 migration duty; good if Postgres ops is the binding constraint.
- Arch-3 "Substrate assemble": Cal.com (availability/routing primitives, terms-verified) + Postgres guard layer + XState lifecycle + Novu notifications. Least custom calendar code; most integration/license surface; best if intake routing dominates toil.
- Phase-2 optimizer (all arches): add Timefold on 6-week data for suggestion-ranked offers; keep human accept + DB exclusion as the commit path.

## 7. Open questions for plan comparison (to be dispositioned after reveal)
- Q1. Does the thin plan rely on app-layer overlap checks? If so → correction (O2-1).
- Q2. Does it name a backend/auth model? If absent → enhancement with Arch-1/2/3 options, not a single mandate.
- Q3. Does it specify travel estimation? If hand-waved → enhancement (O2-4) with cache + units.
- Q4. Does it model UNFILLED as terminal? If missing/implicit → correction (honesty requirement).
- Q5. Does it pre-decide D1/D2? If so → user-decision pushback (retain disagreement).
- Q6. Does it address AT/access-arrangement matching, phone day-edits, invoice-readiness boundary, 6-week instrumentation? Each gap → enhancement or user decision, never silent.

---
*Discovery frozen by reveal gate next. This file must not be rewritten after reveal; corrections belong in draft.md/final.md.*
