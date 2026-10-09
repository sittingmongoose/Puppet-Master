# Draft — ER11 B-05 control research, case I05 (post-reveal planning deliverable)

Stage: research. Method M14 v1 control investigator. This draft is a complete planning deliverable for this scope; later critic/reviser stages may correct it.
Discovery (`discovery.md`, sha256 0b8726c1…baa per `plan-reveal.json`) was frozen BEFORE reveal and is NOT rewritten here.
Revealed: 2026-10-09T20:26:16Z. Exact plan clauses P1–P6 quoted verbatim below from `revealed-plan.md` (plan sha256 aa7657a3…d57).
Sources S01–S12 per `source-map.json` + `sources/index.md`. No nested agents, no repo/canon edits, no runtime witnesses (no qualified sandbox).

Original brief constraints retained (§2). Every P clause dispositioned (§3) with categories: already-covered, correction, optional enhancement, user decision, rejected, uncertain. Retained findings, conditions, alternatives, capabilities/decisions, uncertainty, and validations (§§4–9) are self-contained prose, not ID pointers.

## 1. What the first release is

A browser-based cooperative scheduling ledger for 26 interpreters and 4 coordinators across 3 counties, supportable for $4,200, updatable by coordinators from a phone. It tracks request → offer → acceptance → travel estimate → completion → invoice readiness, marks requests honestly UNFILLED when no qualified interpreter exists, prevents the same interpreter being offered twice, shows each role only what it needs, records communication mode and access arrangements as matchable requirements, and exports a six-week board review. It is not payroll, not native apps, and makes no unlimited production guarantee.

## 2. Original constraints, disagreements, uncertainties (preserved verbatim in meaning)

- $4,200 first release; browser-based; phone day-updates by coordinators.
- Sensitive: client names, meeting topics, interpreter availability. Interpreters receive only details needed for an assignment.
- Current failure: two coordinators occasionally offer the same person to different clients (calls + shared calendar).
- Access: some interpreters use assistive technology; several clients require specific communication mode or access arrangement.
- Track: request, offer, acceptance, travel estimate, completion, invoice readiness — without becoming full payroll.
- Honest scarcity: clear UNFILLED, never implying availability.
- Disagreement A: whether clients receive automated confirmations. Disagreement B: whether coordinators may reassign accepted work without asking the interpreter. Neither is resolved here; both become explicit toggles with safe defaults (§7).
- Board reviews first six weeks before further spending → audit + metrics from day one.

## 3. Exact per-P disposition

### P1: "Track an assignment from request through offer, acceptance, completion, and invoice readiness."

Verdict: already-covered in structure, CORRECTION on omission.

- Already-covered: the five-state spine matches the brief and is retained: REQUESTED → OFFERED → ACCEPTED → COMPLETED → INVOICE_READY, plus history states DECLINED/EXPIRED/CANCELLED and terminal-honest UNFILLED with reason + next-review time.
- Correction: P1 omits travel estimate, but the brief explicitly requires tracking "request, offer, acceptance, travel estimate, completion, and invoice readiness". The estimate is therefore a first-class tracked attachment (value + method + timestamp), not out-of-scope. State model inserts TRAVEL_ESTIMATED as an annotation on ACCEPTED (or on OFFERED when pre-estimated), never as a holder change. P6's exclusion is corrected the same way (§3.6): routing *rules* need minimal R1 definition, and the estimate *value* is tracked.
- Optional enhancement: solver-advisory ranking of eligible interpreters (qualified + available + travel-feasible + fair) with reason codes; coordinator still commits. Advisory-only in R1.
- Rejected: auto-assignment without coordinator review; payroll fields in the ledger.
- Uncertain: whether travel estimate attaches pre-acceptance (to inform offer choice) or post-acceptance only; propose both supported, pre-acceptance labeled preliminary.

### P2: "Detect overlapping offers and accepted assignments across coordinators."

Verdict: CORRECTION (detect → prevent), with detection retained as UX.

- Correction: detection alone does not fix a commit race; two coordinators can both pass detection then both commit. The invariant must be enforced at commit time: one holder per interpreter over any overlapping active period. Primary mechanism: Postgres `tstzrange` period with `EXCLUDE USING GIST (interpreter_id WITH =, period WITH &&)`, half-open `[)` so back-to-back bookings do not collide, `btree_gist` installed for scalar `=` in GiST, scoped to active states (offered/accepted) so history never blocks future booking. Concurrent double-offer yields exactly one commit; the loser gets an "already offered" error naming the conflict, never a silent overwrite.
- Already-covered: cross-coordinator overlap visibility (day board, interpreter timeline, conflict warning before submit) is retained as the detection/UX layer above the commit guard.
- Conditions: periods include setup/teardown/access buffers; travel gaps are part of feasibility (P6 interaction). SQLite (PocketBase embedded) cannot enforce this GiST exclusion; if PocketBase is the app backend, the offer ledger needs Postgres (or an explicit single-writer queue design accepted as weaker with proof via race test).
- Uncertain: exact partial-exclusion predicate syntax must be verified against the primary CREATE TABLE reference before build (validation V3).

### P3: "Limit client and meeting details to the coordinator and assigned interpreter roles that need them."

Verdict: already-covered in intent, optional enhancements on completeness.

- Already-covered: coordinators see full request/offer detail; assigned interpreters see only the minimal assignment detail; locked-by-default server rules opened narrowly per role.
- Enhancements (required for brief fidelity): (a) interpreter *availability* is sensitive too, not just client/meeting detail — no enumerable availability, counts, or calendars visible to clients or other interpreters; (b) redaction varies by state — offered sees less than accepted (e.g. exact address/access contact only after acceptance); (c) list endpoints return empty (not errors that leak existence) when rules unsatisfied, matching observed rule semantics (list→200-empty, view/update/delete→404, locked→403, create→400); (d) realtime topics mirror read rules — no full-record broadcast with sensitive fields; (e) errors, URLs, exports, and logs carry the same redaction.
- User decision: whether clients get any portal/status view at all; if yes, they see only their own request status (including honest UNFILLED), never interpreter identity/availability.
- Rejected: client-side-only filtering; per-role UI hiding without server enforcement.

### P4: "Record communication mode and access arrangements as structured assignment requirements."

Verdict: already-covered, with matching + accessibility enhancements.

- Already-covered: mode and arrangements are structured fields (controlled vocabulary + free-text detail), not notes. Exact tokens from the request are preserved verbatim into offer and assignment (no paraphrase that loses an access need).
- Enhancements: (a) mode/arrangement/skill/language are HARD match constraints — unqualified interpreters are ineligible, never ranked lower; UI shows eligible-only pickers with reason codes for the rest; (b) pickers follow the W3C combobox→listbox→option pattern with keyboard (open/move/select/close), `expanded/controls/activedescendant` states, visible focus, label association, and text errors, so assistive-tech interpreters operate the same tool; no custom div dropdowns without this contract.
- Uncertain: the exact controlled vocabulary for modes/arrangements must come from the cooperative + clients (do not invent clinical terms); R1 ships with a coop-editable list plus verbatim detail field.

### P5: "Automated client confirmations and reassignment authority are cooperative policy decisions."

Verdict: already-covered + USER DECISIONS with safe defaults (no unilateral resolution).

- Already-covered: both items are explicit coop choices, not technical defaults. R1 ships both as per-coop (and per-client for confirmations) toggles with audit.
- Safe defaults (reversible, logged): confirmations default OFF — no automated client message until the coop opts a client in, then exactly one templated message per transition; reassignment defaults to ASK-FIRST — accepted work is reassigned only with interpreter acceptance, unless the coop explicitly enables coordinator-override with mandatory reason + interpreter notice + log entry.
- Retained disagreement: members disagree on both; the draft preserves the disagreement and the toggle, and the six-week export reports confirmation mode per client and override counts so the board decides with data.
- Rejected: silent auto-confirm; silent reassignment; override without notice/log.

### P6: "Travel estimation rules and any payroll connection are outside the defined first release."

Verdict: SPLIT — payroll part already-covered; travel part CORRECTION + user decision.

- Already-covered (payroll): no payroll computation, no payroll connection, no pay export. INVOICE_READY is a flag + case export (assignment, completion proof, agreed rate reference) that a separate payroll process consumes. Correct and retained.
- Correction (travel): the brief requires tracking a travel estimate, so "travel estimation rules ... outside" cannot mean "no estimates in R1". R1 tracks an estimate per accepted (optionally per offered) assignment: duration seconds + distance meters + method + profile + timestamp. Minimal rules ARE in R1 or estimates are dishonest: road routing (self-hosted OSRM Table/Route over a 3-county extract, car profile unless coop says otherwise), fastest-route semantics disclosed, unroutable → explicit null + human review (never zero or disguised crow-flies), fallback crow-flies only when labeled with speed + coordinate choice, per-day matrix cached, estimate never silently changes holder or state.
- User decisions: routing profile (car/foot/transit), buffer minutes (parking/check-in/access), fallback policy, and who may override an estimate. Solver travel-feasibility uses the same durations + buffers as hard constraints.
- Optional enhancement: pre-offer travel preview to rank nearby eligible interpreters; labeled preliminary until acceptance.
- Uncertain: OSM coverage/quality for the three counties and true access-time buffers — must be measured in pilot (validation V4/V11), not assumed.

## 4. Retained findings (discovery carried forward, in full)

- Solver-advisory assignment: model shifts with interpreter as the planning variable; hard constraints (qualified skill/mode/access, availability/day-off, no overlap, travel-feasible gaps) gate eligibility; soft scores optimize travel and fairness; incremental re-solve for short-notice changes; time-boxed seconds; coordinator commits through the guarded ledger. New solver work targets Timefold 2.x, not OptaPlanner 8 (Red Hat EOL → 2023-04-20 Apache-2.0 fork → monthly 2.x with 100+ fixes claimed).
- Self-hosted travel: OSRM request `/{service}/v1/{profile}/{lon},{lat};...`, profile fixed at extract, lon-lat order, `annotations=duration,distance`, seconds/meters row-major, null when unroutable, keep-alive ≤512/5s, demo server prototype-only. Production: self-host Docker + county extract + cache; label every estimate.
- Commit guard: `tstzrange(start,end,'[)')`, exclusion on `(interpreter, period)`, `btree_gist` for scalar equality, 23P01 on conflict, active-states-only scoping, buffers inside the range.
- Small-team backend: single-binary PocketBase (`./pocketbase serve`, SQLite+auth+SSE+admin), version pinned (observed v0.40.5) with changelog-read upgrades (pre-1.0 breaking pattern observed: exit-code propagation, migration hardening/deadlock fix), five locked-by-default rules per collection with documented status mapping, realtime create/update/delete + brokered custom topics with per-topic subscription and multi-client-per-user normal.
- Buy-vs-build: Cal.com round-robin (least-recently-booked availability vs least-bookings fairness, fixed-host blending) informs the fairness toggle but cannot replace the ledger (no skill/travel/handshake/redaction/UNFILLED).
- Access: canonical combobox pattern for all pickers; eligible-only options with reasons; verbatim access tokens end-to-end.

## 5. Conditions

- Solver advisory-only until board trust; database, not solver, decides commits.
- Postgres (or equivalent exclusion-enforcing store) required for the offer ledger unless an explicit weaker SQLite-queue design is accepted with a passing race test.
- PocketBase version pinned; every upgrade re-tests auth, rules, realtime, and the race suite.
- OSRM self-host with chosen profile + county extract + cache; demo server never in production path.
- Confirmation/reassignment toggles set explicitly at onboarding; defaults (off / ask-first) apply until the coop records otherwise.

## 6. Alternatives retained

- Postgres row-level-security + custom API instead of PocketBase (stronger ledger, more build, same rule matrix).
- Valhalla/GraphHopper instead of OSRM (richer costing/profiles, heavier operations).
- Manual coordinator pick + commit guard with no solver in R1 (solver deferred to R2; fairness then least-recent manual discipline).
- Cal.com (or equivalent) as a public intake/booking surface in front of the ledger, never as the ledger.
- SQLite serializable queue for offers if Postgres is refused — weaker proof, must pass the same race suite or be rejected.

## 7. Optional capabilities and user decisions

- Capability: pre-offer travel preview; fairness toggle (least-recent vs least-count vs least-hours); client status portal (own-status-only); six-week board CSV (fill rate, time-to-offer/accept, estimate-method mix, override counts, no PII).
- Decisions for the cooperative (blocking R1 config, not build): confirmation policy per client; reassignment override enablement; fairness definition; routing profile + buffers + fallback; mode/arrangement vocabulary; UNFILLED review SLA per request type.

## 8. Uncertainty

- Partial-exclusion predicate exactness; PocketBase concurrency under simultaneous offers; OSM coverage + buffer truth; vocabulary correctness; whether travel preview pre-acceptance is wanted; pilot volumes for solver time-boxing. Each maps to a validation below; none blocks the plan, all block silent assumptions.

## 9. Validations — executed vs proposed (discriminating, no pretense)

Executed (read-only; NO runtime witnesses — no qualified sandbox exists or is claimed):

- E1. Read brief + input-map + freeze; checked brief size/hash against freeze record.
- E2. Located and fetched primaries S01–S12; recorded URL/version/locator/timestamp/operations in source-map.json; saved bounded excerpts + index in sources/.
- E3. Static cross-checks: OSRM units/defaults vs travel need; `[)` vs `[]` adjacency; locked-default vs least-privilege; hard-vs-soft vs brief constraints; Cal.com availability-vs-fairness definitions; APG roles/keyboard.
- E4. Post-reveal: quoted P1–P6 exactly; dispositioned each above without rewriting discovery.

Proposed (each fails a real defect; scope is this small product, not unlimited guarantees):

- V1 double-offer race: concurrent overlapping offers for one interpreter → exactly one commits, other sees conflict; no partial holds. Fails app-check-only designs.
- V2 adjacency: 10:00–12:00 + 12:00–14:00 both commit under `[)`; proves bound choice.
- V3 history-vs-active: declined/expired/cancelled overlaps do not block; offered/accepted do. Proves predicate scoping.
- V4 travel honesty: routable → seconds/meters + labeled method; unroutable → explicit null + human review; profile change moves durations materially; no zero/crow-flies disguise.
- V5 least-privilege matrix: interpreter sees own minimal offers only; no enumeration of clients/topics/availability via list/counts/realtime/errors/URLs; coordinator full; client own-status-only; status-code mapping verified.
- V6 assistive-tech walkthrough: keyboard-only picker operation, screen-reader announcements, visible focus, text errors. Fails custom divs.
- V7 mode fidelity: exact request tokens verbatim in offer/assignment; unqualified match impossible (hard fail with reason).
- V8 UNFILLED honesty: unfilled renders as unfilled + reason + review time; zero misread as available/confirmed in user test; no auto-flip.
- V9 disagreement toggles: confirmations off → zero client messages; on → exactly one template; reassignment ask-first vs logged override with notice.
- V10 phone day-update: coordinator re-times/re-offers from mobile viewport on throttled network; live update reaches others; retried submit does not duplicate (idempotency).
- V11 six-week export: board CSV reproducible from event log with fill rate, timings, method mix, overrides, no PII.

## 10. Close

This draft completes control research: discovery-led, source-backed, plan-dispositioned, disagreement-preserving, and validation-honest. Critic and reviser stages own further correction; this file stands as the investigator's complete deliverable.
