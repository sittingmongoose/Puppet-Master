# Critique — ER11 B-05 control critic, case I05 (M14 v1)

Stage: critic. Method M14 v1 (retained-investigator draft, evidence-first critic, fresh reviser next).
Inspected in full: original brief (`cases/I05/brief.md`, 2310 bytes, sha256 prefix a2357f24 verified by critic),
research `draft.md`, research `discovery.md`, research `source-map.json`, `revealed-plan.md` (P1–P6),
and all research evidence `sources/S01–S12 + index.md`.
Independently fetched: critic primaries C01–C12 (`sources/C01–C12 + index.md`, `source-map.json`).
Access window 2026-10-09T20:33:00Z–20:35:10Z. No runtime witnesses (no qualified sandbox claimed or used).
No campaign/history/evaluator/counterpart read. No candidate repair beyond this critique (reviser owns repair).

## Verdict summary

The draft is broadly sound and unusually honest (executed-vs-proposed separated, disagreements preserved,
absence notes kept). Critic independently confirms nearly every consequential primary-source fact:
Postgres `[)`/exclusion/btree_gist (C01/C02/C04), PocketBase v0.40.5/rules/status-codes/realtime (C05/C06/C07),
OSRM units/semantics/fallback (C08), Timefold 2.7.1/constraint-streams (C09), fork lineage (C10, upgraded to
primary fetch), Cal.com fairness pair (C11), APG combobox head (C12). Brief byte/hash consistency (E1) verified.
P2 detect→prevent is a valid correction. P5 policy-toggle handling is valid. No finding fully falsifies the draft.

Seven material findings nevertheless require reviser action. The largest: (M1) the P6 travel "correction"
overbuilds — the brief requires tracking an estimate *value*, not operating a self-hosted routing engine; OSRM
must be demoted to optional enhancement with manual/declared estimate as the R1 path. (M2) P3 understates the
availability omission (brief-sensitive, P3-silent) as "enhancement" when it is a correction, and invents
state-varying redaction as required rather than user-decision. (M3) The Postgres-ledger + PocketBase-backend
split is architecturally unresolved (two stores, no consistency/auth/cost story). (M4) Timefold advisory solver
is disproportionate for 26 interpreters / $4,200 / six weeks and should be deferred. (M5) Several brief-driven
R1 mechanisms are missing entirely (availability input, intake, notification channel, auth/roles, idempotency
mechanism, phone/offline resilience, invoice-export schema, cost breakdown, deployment). (M6) Predecessor source
method has gaps the critic closes or flags (snippet-only S10 now C10-verified; /current/ mutability; /latest/
mismatch; truncation). (M7) Three validations need rescoping (V3 uncertainty now reducible via C03; V5
custom-topic rule inheritance is NOT a platform guarantee per C07; V10/V11 mechanisms undefined).

Critic demands can be invalid; each finding below states its evidence, its uncertainty, and what would change it.

## Material findings

### M1 — P6 travel scope: valid split, invalid required-OSRM (partially false correction)

Draft §3.6/P6: payroll part already-covered (correct); travel part CORRECTION requiring minimal routing rules in
R1 ("Minimal rules ARE in R1 or estimates are dishonest"), concretely self-hosted OSRM Table/Route over a
3-county extract with car profile, fastest-route disclosure, null-when-unroutable, labeled crow-flies fallback,
per-day matrix cache.

What critic confirms (C08): every OSRM fact is accurate — `/{service}/v1/{profile}/{lon},{lat}`,
static-extract profile, lon-lat order, fastest-not-shortest, seconds/meters row-major, null when unroutable,
`annotations` default `duration`, `fallback_speed`/`fallback_coordinate`/`scale_factor` family with
`fallback_speed_cells`, keep-alive ≤512/5s. The travel-honesty rules (label method+timestamp, explicit null,
never disguised crow-flies) are well-grounded *if* a routing engine is used.

What critic challenges: the brief requires *tracking* "travel estimate" alongside request/offer/acceptance/
completion/invoice-readiness. A tracked value (duration + method + timestamp, manually declared by the
coordinator or computed) satisfies the verb "track". P6 says "Travel estimation rules ... are outside the
defined first release" — the consistent reading is value-in/Rules-out: R1 stores and displays an estimate with
method label, while routing *rules/engines* wait. Draft's "estimates are dishonest without minimal rules" does
not follow: a coordinator-entered "45 min by car, declared 2026-10-09, unverified" estimate is honest (labeled,
timestamped, overridable) without any engine. Draft never considers manual/declared estimate as the R1 path and
mandates the heaviest alternative (self-host Docker + OSM extract + profile choice + cache + ops) inside a
$4,200, six-week, coop-supportable envelope with no cost/ops evidence. That is overbuild, not correction.

Disposition repair: keep the SPLIT verdict but rescope — CORRECTION = R1 tracks estimate value + method +
timestamp (P6 cannot exclude the *value*); OSRM self-host = OPTIONAL ENHANCEMENT (one of Valhalla/GraphHopper/
OSRM/manual), default R1 = manual/declared estimate with honesty labeling; routing-profile/buffer/fallback
decisions stay user decisions. V4 must then test the manual path first (declared → labeled; override →
re-labeled) with engine-backed V4 as the enhancement gate. OSM coverage/buffer uncertainty (draft §8) remains
but moves to the enhancement, unblocking R1.

What would change this: brief text showing estimates must be system-computed (it does not — "travel estimate"
is listed among tracked workflow items, not among computed outputs).

### M2 — P3: availability omission understated; state-varying redaction invented

Draft §3/P3: already-covered in intent + "enhancements (required for brief fidelity)", where (a) availability
sensitivity is listed as an enhancement and (b) offered-sees-less-than-accepted (exact address/access contact
only after acceptance) is stated as required.

Evidence: brief names THREE sensitive classes — "Client names, meeting topics, and interpreter availability are
sensitive" — while P3 names only two ("client and meeting details"). The omission of availability from P3 is a
gap against the brief of exactly the kind draft elsewhere calls CORRECTION (cf. P1 travel omission, P2
detect-only). Labeling it "enhancement" understates severity and breaks the draft's own category discipline.
Critic confirms the C06 status-code mapping the enhancement depends on (list→200-empty, create→400,
view/update/delete→404, locked→403, superuser bypass) — the mechanism is right; the category is wrong.
Repair: promote availability non-enumerability to CORRECTION on P3.

Separately, state-varying redaction (offered vs accepted detail tiers, with the exact rule "exact
address/access contact only after acceptance") appears nowhere in the brief, which says only "interpreters
should receive only the details needed for an assignment". Tiered-by-state disclosure is a reasonable design,
but the tier boundary the draft picks (address-after-acceptance) is invention presented as brief fidelity. An
interpreter deciding whether to *accept* an offer plausibly needs location to judge travel — withholding exact
address until after acceptance could harm acceptance quality. Repair: demote the specific tier rule to USER
DECISION / UNCERTAIN (options: full-address-at-offer vs approximate-at-offer/exact-at-accept), keep the
need-to-know principle as already-covered. V5 must test whichever tier the coop picks, not the draft's tier.

C07 qualification (feeds M7): "realtime topics mirror read rules" is a builder obligation, not a PocketBase
guarantee — custom topics authorize by subscription membership + manual auth lookup, with no stated automatic
rule inheritance. The P3 enhancement (d) is therefore correctly scoped as work, but V5 as written assumes the
mirror; see M7.

### M3 — Dual-store architecture unresolved (Postgres ledger + PocketBase backend)

Draft requires Postgres exclusion for the offer ledger (P2) while proposing PocketBase (embedded SQLite, C05)
as the small-team backend (§4, §5), noting "the offer ledger needs Postgres (or an explicit single-writer queue
design accepted as weaker)". The SQLite-queue is listed as alternative #5 with "must pass the same race suite
or be rejected".

Critic confirms both horns: exclusion semantics verified (C01/C02/C04, plus C03 predicate form); PocketBase
SQLite embedding + pre-1.0 warning verified (C05). The problem is the middle: the draft ships no coherent R1
architecture. Open questions with no answer in draft or discovery: which store owns offers (Postgres table with
PocketBase proxying? PocketBase collections with a Postgres sidecar for holds?); how a commit spans both
(PocketBase hook → Postgres insert → rule-visible record? what happens when the second write fails?); where API
rules (C06) enforce when the ledger lives outside PocketBase; how auth/roles unify across two systems; what the
dual ops burden (backups, migrations, version pins for *two* datastores) costs inside $4,200; whether the
"single-binary" PocketBase advantage survives adding Postgres at all. The weaker-queue alternative is
correctly gated ("must pass race suite") but entirely unproven — no design, no serialization point, no failure
analysis — so R1 has one specified-but-unintegrated path and one named-but-empty path.

Repair: reviser must pick ONE R1 ledger owner and specify the seam. Minimal coherent options: (i) Postgres owns
offers/holds exclusively with RLS + thin API, PocketBase (if kept) owns non-ledger collections only, with the
seam and auth bridge specified; or (ii) PocketBase owns everything with a serialized offer-commit endpoint
(single-writer, idempotent) whose race behavior V1 proves before acceptance. Either is acceptable; "both, TBD"
is not. The §6 alternative "Postgres RLS + custom API instead of PocketBase" should be promoted from retained
alternative to candidate primary, with an explicit choice and reasons. Cost/ops for the chosen shape belongs in
§5 conditions.

### M4 — Solver scope disproportionate to scale/budget/timeline; secondary claims unevidenced

Draft retains Timefold advisory ranking as an R1 "optional enhancement" (P1) and carried-forward finding (§4):
model shifts with interpreter as planning variable, hard/soft split, incremental re-solve, time-boxed seconds,
targeting Timefold 2.x.

Critic confirms the verified core (C09): constraint streams as incremental score calculation,
HardSoftScore penalties, explanation/justifications, fairness/load-balancing guide existence, service-vs-library
(Quarkus/Spring/REST) integration, version 2.7.1 real. C10 confirms the lineage (new work on Timefold, not
OptaPlanner 8). The mechanism description is accurate as far as it goes.

Proportionality challenge: 26 interpreters, 4 coordinators, first release $4,200, board review at six weeks.
Draft proposes embedding or operating a JVM solver service (Quarkus/Spring or REST) with domain modeling,
constraint authoring, time-box tuning, and pilot-volume calibration — alongside self-hosted OSRM (M1) and a
dual-store backend (M3). No staffing, hosting-cost, or schedule evidence shows this fits. For this scale,
manual coordinator pick over an eligible-only list + commit guard (draft's own §6 alternative #3) fully
satisfies the brief's handshake (offer→accept) and the race fix (P2); fairness then reduces to a displayed
least-recent/least-count discipline (C11) rather than an optimizer. The solver's marginal R1 value (ranking
suggestions) does not justify its R1 cost/risk. Repair: demote solver to R2 candidate / R1-spike-optional;
promote "manual pick + guard, no solver in R1" to the R1 primary; keep hard-vs-soft framing as the R2 design
seed. §5 condition "solver advisory-only until board trust" should become "solver deferred until board approves
post-six-week spend".

Evidence gaps (minor but real): (a) "Python solver significantly slower" is predecessor-labeled secondary with
no primary at either stage — drop it or cite the README directly; R1 needs no Python-vs-Java position once the
solver is deferred. (b) Shift-as-entity/Employee-as-variable modeling guidance was cited by predecessor from
the domain-modeling page, which critic did not re-fetch — treat as predecessor-evidenced only; reviser should
either re-verify or soften to "typical rostering shape, verify at R2 design". (c) Fairness-function choice
(least-hours/least-recent/least-count) is correctly left to the coop, but draft never states the feasibility
ordering guarantee the brief needs (ineligible interpreters excluded *before* fairness ranking) as a testable
invariant — V7 partially covers it; make it explicit.

### M5 — Missing R1 mechanisms: brief constraints with no design

The draft is complete on states/guards/redaction/policy-toggles but leaves at least eight brief-driven R1
mechanisms undesigned. Each is material because the brief names the need and R1 cannot ship without *some*
answer (even a minimal one):

1. Availability input: brief makes availability sensitive and matching availability-dependent, but neither
   draft nor discovery says how interpreters declare availability (calendar grid? recurring hours? blackout
   dates? who edits?).

...[truncated 7519 chars]