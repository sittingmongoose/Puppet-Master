# Discovery — ER11 B-05 control research, case I05 (from brief alone, pre-reveal)

Stage: research. Method M14 v1 control investigator. Brief: `cases/I05/brief.md` (2310 bytes, sha256 a2357f…abbe per freeze.json).
Plan-root NOT read before this file (per assignment). No campaign/history/evaluator/counterpart read. No nested agents.
Sources: own input-map.json + exact brief + independently chosen public primary sources S01–S12 (see `sources/index.md`, `source-map.json`).
Access window 2026-10-09T20:22:00Z–20:23:30Z. No qualified sandbox witnessed; no runtime executed. All validations below separate executed vs proposed honestly.

## 1. Brief restatement (constraints that survive to final)

- Who/scale: 26 paid interpreters, 4 coordinators, 3 counties; short-notice changes; long travel gaps.
- Budget/platform: $4,200 first release; browser-based tool supportable by coop; coordinators may update day's schedule from a phone (mobile web, poor signal, small screen, interruptions).
- Sensitivity / least privilege: client names, meeting topics, interpreter availability are sensitive; interpreters get only details needed for an assignment. Implies per-role redaction, no enumerable availability, no leakage via list/counts, realtime, errors, or URLs.
- Current failure: calls + shared calendar → two coordinators occasionally offer same person to different clients. This is a race, not a training issue; fix must be transactional/server-enforced, not UI hint.
- Access: some interpreters use assistive technology; several clients require specific communication mode or access arrangement. Both staff-facing and assignment-matching must be accessible; mode/arrangement is a matching constraint, not a note.
- Workflow to track (and only this): request → offer → acceptance → travel estimate → completion → invoice readiness. Explicitly NOT full payroll.
- Honest scarcity: clear UNFILLED state that never implies a qualified interpreter is available. No silent queue, no "pending" that clients read as "confirmed".
- Live disagreements (do not resolve unilaterally): (a) automated client confirmations; (b) coordinator reassignment of accepted work without asking interpreter.
- Governance: board reviews first six weeks before further spending → audit trail + reviewable metrics in scope from day one.

Out of scope by brief: payroll, unlimited production guarantees, non-browser native apps.

## 2. O1 — Independently discovered unfamiliar tools/products/approaches

Beyond a thin CRUD calendar, six materially different mechanisms were selected for consequence, not familiarity:

D1. Constraint-solver assignment (Timefold Solver) — treat interpreter assignment as rostering + routing optimization with hard feasibility vs soft preference scores, instead of manual first-available pick. Handles skill/mode, availability, no-overlap, travel-feasible gaps, fairness.
D2. Self-hosted routing matrix (OSRM Table/Route) — travel estimates from own OSRM service (seconds/meters, fastest-route semantics) instead of per-request commercial billing or crow-flies lies. Fits $4,200.
D3. Database exclusion constraint (Postgres tstzrange + btree_gist) — make double-offer impossible at commit time for active offers/acceptances, instead of app check-then-insert. Directly kills the observed two-coordinator race.
D4. Single-binary backend with locked-by-default API rules + SSE realtime (PocketBase) — one `./pocketbase serve` replaces DB+auth+admin+realtime broker for a tiny team, with per-role filters and live phone updates. Alternative to custom backend or Firebase-style BaaS with per-seat billing.
D5. Team scheduling infrastructure as buy-vs-build comparator (Cal.com round-robin/collective) — availability-vs-fairness distribution with fixed hosts; useful to reject honestly: it lacks skill/mode matching, travel feasibility, offer→accept handshake, need-to-know redaction, and UNFILLED semantics.
D6. Accessible picker pattern (W3C APG combobox→listbox→option) — staff pickers (interpreter/client/language/mode/site) built on the canonical assistive-tech pattern with keyboard + ARIA states, instead of custom div dropdowns. Required by "some interpreters use assistive technology".

Rejected as primary (retained as alternatives in §7): full payroll; native apps; Google Distance Matrix as default (billing risk); haversine-only travel (lies about road/time); Yjs/CRDT collaborative editing (wrong fix for a commit race); OPA sidecar (overkill for 4 coordinators; PocketBase rules or Postgres RLS suffice).

## 3. O2 — Consequential primary-source behavior, defaults, units/types, limits

### 3.1 OSRM travel (S01)

- Request shape: `GET /{service}/v1/{profile}/{lon},{lat};...[.{json|flatbuffers}]`. Profile is static from `osrm-extract` Lua (car|bike|foot); coordinates are lon,lat (NOT lat,lon); polyline6 supported.
- Table returns fastest-route durations/distances, NOT shortest-distance: "distances are not the shortest distance ... but rather the distances of the fastest routes."
- Units: durations seconds, distances meters; row-major `durations[i][j]` / `distances[i][j]`; `null` when unroutable. `annotations` default `duration`; request `duration,distance` for both. Sources/destinations index arrays; asymmetric matrices allowed.
- No-route handling: `fallback_speed` (double>0) + `fallback_coordinate` (input default|snapped) synthesizes crow-flies duration; `scale_factor` scales durations. Must be explicit in product: estimates labeled method + timestamp, never silently crow-flies.
- Server limits: HTTP/1.0 keep-alive ≤512 req/conn, ≤5s between requests. Demo `router.project-osrm.org` is prototype/rate-limited; production = self-host `osrm/osrm-backend` Docker + local OSM extract for 3 counties, or managed provider. Cache matrices per day-plan; do not call per keystroke.
- I05 applicability: day-plan matrix per county cluster; travel gap = duration + buffer (parking/check-in, access arrangement); unroutable → human review, not zero.

### 3.2 Postgres anti-double-book (S02/S03/S04)

- Type: `tstzrange` (timestamptz range). Constructor defaults to `[)`; adjacent `[)` ranges do NOT overlap; `[]` collides at shared endpoint. Store periods as `tstzrange(start_at, end_at, '[)')` (generated column or explicit).
- Constraint: `EXCLUDE USING GIST (interpreter_id WITH =, period WITH &&)` rejects overlapping periods only for same interpreter. General rule: for any two rows, at least one operator comparison must be false/null, else error (`exclusion_violation`, SQLSTATE 23P01).
- Requires `btree_gist` for scalar `=` on uuid/text/int in GiST; trusted extension, installable by non-superuser with CREATE on DB. Without it, GiST has no `=` for those types.
- Scope the constraint to committable states only (offered/accepted), not declined/expired/cancelled history: use partial exclusion `... WHERE (status IN ('offered','accepted'))` or separate ledger table for active holds vs history. Otherwise history blocks future booking. Exact predicate syntax must be verified against primary CREATE TABLE reference before build (proposed validation V3).
- Travel buffers belong in the range (period includes setup/teardown/access time), or as separate exclusion on expanded range; do not rely on UI gap display.
- PocketBase note: PocketBase embeds SQLite, NOT Postgres; exclusion constraint implies either Postgres-backed service for holds, or PocketBase + Postgres sidecar for the offer ledger, or porting the invariant to SQLite app logic with serializable queue (weaker). Architecture must choose explicitly; do not claim Postgres semantics on SQLite.

### 3.3 PocketBase backend + rules + realtime (S05/S06/S07)

- Single binary: embedded SQLite + REST-ish API + realtime SSE + auth + admin `/_/`; start `./pocketbase serve`; v0.40.5 zips ~11–12MB. Pre-1.0: "full backward compatibility is not guaranteed ... NOT recommended for production critical applications yet, unless you are fine with reading the changelog and applying manual migration steps." Pin version; read changelog per upgrade (S08).
- Rules: 5 per collection (`listRule/viewRule/createRule/updateRule/deleteRule`) + `manageRule` on auth collections. Defaults locked (null) = superuser only. Empty = anyone. Non-empty = filter expression. Rules ARE filters: `status="active"` limits listing. Status mapping: list-unsatisfied → 200 empty; create → 400; view/update/delete → 404; locked + non-superuser → 403. Superuser bypasses all.
- I05 mapping: coordinators (full on requests/offers), interpreters (only own offers + minimal assignment fields via view rule + field projection; no client-topic bulk list), clients (if any portal: only own request status, never interpreter availability). Locked-by-default start; open narrowly with tests per role.
- Realtime: default events only create/update/delete (+OAuth2 redirect); custom via `SubscriptionsBroker()` with topic check `HasSubscription`; auth via `RealtimeClientAuthKey`; one user routinely has multiple clients (tabs/devices) — design idempotent UI. Scope topics per role; do not broadcast full records with sensitive fields.
- Limits: SQLite single-writer; fine for 4 coordinators + 26 interpreters, but offer-commit race needs single-writer queue or Postgres ledger (see §3.2). File/auth/hook behavior per docs; no claim beyond observed.

### 3.4 Timefold rostering/routing (S09)

- Model: `Shift` entity with planning variable `Employee` (not the reverse), because shifts-per-employee unknown, employees-per-shift known. Problem facts: availability/day-off, skills, sites.
- Score: Constraint Streams (`forEach/filter/join/penalize`), incremental recalculation on single-variable change; hard penalties for infeasible (unqualified, day-off, overlap, travel-infeasible), soft for travel/fairness/preference. `HardSoftScore.ONE_HARD/ONE_SOFT` units; score explanation + justifications available.
- Fairness/load-balancing guide exists; exact fairness function must be chosen (least-hours, least-recent, least-count) and disclosed — matches Cal.com's availability-vs-fairness split (S11) but with feasibility first.
- Java/Kotlin primary; Python port significantly slower (README secondary, consistent with Java-first API). For I05 scale, either embed as library (Quarkus/Spring) or run as service with REST; solver time-boxed (seconds, not minutes) for interactive coordinator use; short-notice changes re-solve incrementally.
- Limit: solver proposes, database disposes — final commit still through exclusion-guarded ledger; never auto-assign without coordinator review in first release (board trust + disagreements).

### 3.5 Cal.com comparator (S11)

- Round-robin assigns among available members by least-recently-booked (availability) or least-bookings-for-event-type (fairness); fixed hosts blend collective + round-robin.
- Gaps for I05: no skill/mode/access matching, no travel feasibility, no offer/accept/reassign-consent handshake, no redaction, no UNFILLED honesty, no invoice-readiness. Verdict: useful inspiration for fairness toggle, not a substitute. If adopted for public booking surface later, it must sit in front of, not instead of, the I05 ledger.

### 3.6 Accessible pickers (S12)

- Pattern: `combobox` input controls `listbox` popup of `option`s; `aria-expanded/controls/activedescendant/autocomplete`; focus in input (ARIA 1.2); keyboard: Down Arrow opens, Escape closes, Enter selects, arrows move active descendant.
- Select-only (restricted set: interpreter, mode, site) vs editable with filtering; collapsed by default; expansion triggers explicit. Do not use custom divs without this contract + visible focus + error text + label association.
- I05: interpreter picker shows only eligible (skill + availability + travel-feasible) with reason codes; client/mode pickers preserve exact access-arrangement tokens from request (no paraphrase).

## 4. O3 — Issue/fix/regression/release chains (observed)

C1. Timefold fork (primary evolution chain, S10). OptaPlanner (De Smet, Red Hat) → Red Hat end-of-support late 2022 → OptaPlanner 8 EOL, no v9, KIE 10.x toolchain-only → Timefold BV founded early 2023 → fork 2023-04-20 Apache-2.0 → monthly Timefold 2.x with 100+ bug/security fixes claimed. Consequence: new I05 solver work targets Timefold 2.x, not OptaPlanner 8; budget migration-guide review (chained→list variable, shadow-variable changes). Absence note: no specific solver regression reproduced here (no runtime); chain is release-lineage, not a single bug.

C2. PocketBase pre-1.0 breaking pattern (observed, S05+S08). Docs warn manual migrations expected. Observed changelog callouts: console error/exit-code propagation (chained-command breaking risk), JSVM migration hardening, migration-deadlock fix (#7836), hooks withheld to avoid breaking. Consequence: pin v0.40.5, stage upgrades, re-test auth/rules/realtime per bump. Absence note: v0.23 admin-auth change cited in secondary summaries was NOT in the fetched changelog window; not claimed as primary.

C3. Absent/inapplicable (honest): no Postgres exclusion regression relevant to I05 found in scope; no OSRM routing regression reproduced; Cal.com/W3C chains not pursued as issue chains (stable docs, no bug needed for their narrow role). No evidence invented.

## 5. Workflow, states, and honest scarcity (brief-derived, source-informed)

- States: REQUESTED → OFFERED → ACCEPTED → TRAVEL_ESTIMATED (estimate attached, method+time labeled) → COMPLETED → INVOICE_READY; plus DECLINED/EXPIRED/CANCELLED (history, not committable) and UNFILLED (terminal-honest: no qualified interpreter available, reason + next review time, never auto-flips to offered).
- Transitions: offer creation commits through exclusion-guarded ledger (one holder per interpreter-period); acceptance by interpreter only; travel estimate attaches without changing holder; completion by coordinator/interpreter confirmation; invoice-ready is a flag + export, not payroll.
- Reassignment (disputed): default3998? No — default is ASK interpreter before reassigning accepted work; coordinator-override only if coop explicitly opts in, logged with reason + notice. Both paths keep audit trail.
- Confirmations (disputed): default is NO automated client confirmation until coop opts in per client; status portal (if any) shows honest states including UNFILLED, never "pending" as implication.
- Board review: every transition logs actor/time/reason; six-week export = counts by state, fill rate, time-to-offer/accept, travel-estimate method mix, reassignment/override counts, confirmation mode per client. No PII in aggregate export.

## 6. O6 — Validations: executed vs proposed (discriminating)

Executed (read-only, no runtime; witnesses NOT run — no qualified sandbox claimed):

- E1. Read brief + input-map + freeze; verified byte/hash consistency against freeze.json (brief 2310 bytes).
- E2. Fetched primaries S01–S12; recorded URL/version/locator/timestamp/observed ops in source-map.json; saved bounded excerpts in sources/ + index.
- E3. Static consistency pass: OSRM units/defaults vs travel-need; Postgres `[)` vs `[]` adjacency; PocketBase locked-default vs least-privilege; Timefold hard-vs-soft vs I05 constraints; Cal.com fairness definitions; APG roles/keyboard.
- No database, solver, routing server, or browser harness executed. Anything below is PROPOSED, not run.

Proposed (each discriminates a real failure; no unlimited guarantees):

- V1. Double-offer race: two coordinators offer same interpreter overlapping ±1min concurrently; expect exactly one commit, other gets exclusion error surfaced as "already offered", no partial holds. Fails if app-check-only.
- V2. Adjacency: 10:00–12:00 + 12:00–14:00 same interpreter both commit under `[)`; under `[]` second must fail — proves bound choice.
- V3. History-vs-active: declined/expired/cancelled overlapping history does NOT block new offer; offered/accepted does. Proves predicate scoping.
- V4. Travel honesty: routable pair returns seconds/meters + method label; unroutable returns explicit null/human-review, never 0 or crow-flies disguised; profile mismatch (foot vs car) changes duration materially.
- V5. Least-privilege matrix: interpreter sees only own offers + minimal fields; cannot list/enumerate client names/topics/availability; coordinator sees full; client (if portal) sees only own status; realtime topics mirror rules; 200-empty vs 403 vs 404 mapping verified per S06.
- V6. Assistive-tech walkthrough: all pickers operable keyboard-only (open/move/select/close), screen reader announces expanded/selected/error, focus visible, errors in text not color-only. Fails custom divs.
- V7. Mode/access fidelity: request's exact communication-mode/access tokens appear verbatim in offer + assignment; solver never matches unqualified interpreter (hard fail).
- V8. UNFILLED honesty: unfilled request displays as unfilled with reason + next review; user test shows zero "available/confirmed" misreads; no auto-flip.
- V9. Disagreement toggles: confirmations off by default → no client email/SMS; on per-client → exactly one templated message; reassignment requires interpreter accept unless explicit override with reason + notice + log.
- V10. Phone day-update: coordinator re-times/re-offers from mobile viewport on throttled network; live SSE update reaches other coordinators; no lost writes on retry (idempotency key).
- V11. Six-week export: board CSV has fill rate, time-to-offer/accept, estimate-method mix, override counts, no PII; reproducible from event log.

## 7. Alternatives, conditions, uncertainties retained

- Alternatives: Postgres RLS + custom API instead of PocketBase (stronger ledger, more build); Valhalla/GraphHopper instead of OSRM (richer costing, heavier ops); manual coordinator pick + exclusion guard instead of solver in R1 (solver advisory-only); Cal.com front-end for public intake only (never as ledger).
- Conditions: solver is advisory until board trusts it; OSRM self-host needs OSM extract + profile choice + cache; PocketBase version pinned; Postgres required for exclusion unless explicit SQLite-queue design accepted with weaker proof.
- Uncertainties: exact partial-exclusion predicate syntax (verify pre-build); PocketBase scale/lock behavior under concurrent offers (test V1); OSM coverage for 3 counties + access-time buffers (measure); fairness definition (coop must choose least-recent vs least-count vs least-hours); confirmation/reassignment policy (coop decision, not technical).
- Disagreements preserved verbatim: automated client confirmations disputed; coordinator reassignment without asking disputed. Final must not silently pick.

## 8. Pre-reveal close

Discovery froze here before any plan read. Next: invoke reveal script, read revealed-plan.md only then, produce draft.md with exact per-P disposition, retained findings, conditions, alternatives, capabilities/user decisions, uncertainty, and validation proposals vs executed. Do not rewrite this file after reveal.
