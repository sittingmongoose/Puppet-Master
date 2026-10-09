# B-05 treatment critic — I05

## Scope and method

This is an independent critique of the complete treatment research draft and the exact plan revealed after discovery. I read the brief and independent public primary sources first, saved `evidence-first.md`, then inspected the complete draft, discovery, source map, revealed plan, and all files in the declared research source root. The initial independent sources are CR01–CR11; CR12–CR15 were added after reveal to resolve specific evidence questions. Source versions, locators, access times, and operations are in `source-map.json`; short source notes are in `sources/`.

No predecessor files were edited. No runtime or qualified witness sandbox was provided, so all validations below remain proposals. I did not inspect or use content from any parent, counterpart, evaluator, campaign, or history source.

## Overall assessment

The draft has a strong core: it preserves the six-week/$4,200 constraints, does not collapse the invoice-readiness boundary into payroll, recognizes the need for a first-class unfilled outcome, separates state-machine guards from database conflict guarantees, labels much of the vendor cost/security evidence as uncertain, and proposes useful concurrency, privacy, lifecycle, and assistive-technology checks. The exact P clauses are all addressed.

The main corrections are about putting the guarantee at the actual offer/accept boundary, making information access vary by workflow stage, not turning unresolved cooperative policy into a product decision, and keeping the recommended first release consistent with P6 and the fixed budget. The research also missed a materially different, interpreter-specific buy/configure option. These affect requirements and architecture, so they are material findings rather than wording-only edits.

## Material findings

### M1 — O1 omits interpreter-specific scheduling products from the build-versus-buy comparison

**Draft locations:** Discovery §1 and §6; draft §3 and §7.

The research compares backend, solver, routing, state-machine, calendar, and notification products, but no interpreter-operations product. That leaves the most domain-specific alternative to custom development unexplored against the $4,200 cap. Independent first-party materials found Interpreter Intelligence's scheduler, offer pool, eligibility filters, mobile interpreter accept/decline, availability, job closing, and incidental mileage fields (CR01–CR03); an Interpreter.io booking page is a weaker lead because its direct page returned a bot check (CR10). These features overlap with much of the brief's workflow. The Interpreter Intelligence materials also expose product-specific cautions: availability unset means “available at any time,” job-offer-pool configuration changes the double-booking warning at acceptance, and global/negative buffers can weaken travel checks (CR02–CR03).

**Critic disposition:** Add a domain-product alternative to O1; treat it as due diligence, not a recommendation. Request current pricing/security/accessibility information and trial the exact offer-conflict, mobile coordinator, role visibility, and workflow cases before choosing build versus configure. No price, availability, security posture, or accessibility finding is established by the observed vendor guides.

### M2 — P2 needs explicit offer-reservation semantics, not just an exclusion constraint

**Draft locations:** P2, §2 F1, §3 Arch-1/Arch-2, §6 P-V1, §7 step 1.

Upgrading “detect” to an atomic no-conflict guarantee is justified: a check followed by a write can race. The Cal.com report is a useful concrete failure mode: two concurrent confirmations can both observe PENDING and become ACCEPTED; the issue proposes a transaction/lock, recheck, compare-and-swap, and rollback, while related reports cover pending availability and idempotency (CR09). PostgreSQL supports a partial exclusion constraint with `WHERE (predicate)`, so the draft’s syntax-specific uncertainty can now be closed; the chosen status predicate and runtime behavior still need verification (CR12).

The draft nevertheless assumes that every `offered` row must reserve the interpreter’s whole time window. That is a consequential product rule, not just SQL. If every outbound offer reserves time, parallel offers and stale offers can block otherwise usable work; if an offer does not reserve time, concurrent accepts can still conflict. Define whether an offer is a short-lived reservation, when it expires, how decline/cancel/reassignment releases it, and whether multiple candidates can be offered the same request. Commit the reservation before sending a notification, and make retries idempotent. A “409-style” response is application UX mapping, not a Postgres-native response contract.

**Critic disposition:** Keep the requirement-level correction from warn-only detection to atomic conflict prevention at the final reservation/accept transition. Keep PostgreSQL exclusion as a strong conditional implementation for the PostgreSQL architecture, not as the only possible mechanism before the backend is selected. Make offer-hold behavior and expiry explicit and test two concurrent offers plus two concurrent accepts, including release/retry paths.

### M3 — P3 needs stage-aware disclosure and a narrower coordinator scope

**Draft locations:** Discovery §2-2 and §4; draft P3, §2 F2, §6 P-V2.

The privacy direction is correct, but “coordinator-full” and “assigned interpreter” are too coarse. An interpreter has to receive an offer before becoming the assigned interpreter; that recipient needs enough information to decide and serve, but does not automatically need a client name or meeting topic. Email/SMS offers can expose sensitive details outside the authenticated app. The brief also says four coordinators handle work across three counties, but does not say that every coordinator needs access to every client's information. The draft's row/table role test should cover the coordinator's actual scope and the transition from offer recipient to accepted assignment, not just broad role names.

**Critic disposition:** Retain P3 as already covered at the principle level, then refine its optional enhancement into a stage-by-stage access matrix: coordinator(s) with an operational need; interpreter receiving a minimal offer; accepted/assigned interpreter with the minimum details required to perform; and any client-facing role only if later chosen. Keep names/topics out of lock-screen/email/SMS payloads; require authenticated retrieval. Verify whether all coordinators need all-county access instead of assuming it. Test record and field access, exports, notification payloads, and reassignment as well as normal reads.

### M4 — P5 is at risk of turning a safe interim mode into an unapproved policy

**Draft locations:** P5; draft §4 UD-1/UD-2; §7 step 5.

The draft correctly records both member disagreements, but “default OFF,” “default consent-required,” and especially “Ship UD-2 default” can be read as decisions made for the cooperative. P5 assigns both decisions to the cooperative. A fail-closed mode while the vote is pending is sensible, but it must be labelled as temporary operating behavior, not the adopted policy. Reassignment authorization has operational consequences and should not be reduced to a one-line switch without defining the current interpreter's consent, replacement acceptance, client notification, and audit record.

**Critic disposition:** Keep P5 as already covered plus user decision. Do not mark either default as approved. Make both policy choices explicit release gates or configurable settings, and record the members' decision and effective date. If the app must be built before the vote, disable automated client confirmations and require consent before reassignment only as a clearly temporary fail-safe that the cooperative ratifies; do not silently encode it as settled policy. Test each approved branch.

### M5 — P6 and the recommended architecture/build order conflict; travel data is underspecified

**Draft locations:** P1 travel correction; P6; §2 F3; §3 Arch-1; §4 UD-5; §7 steps 4 and 8.

It is reasonable to distinguish a manually captured travel estimate from travel-estimation rules or a routing engine: the brief asks to track a travel estimate, while P6 excludes estimation rules. The draft's proposed minimal field is therefore a plausible reconciliation, but “Phase 1 MUST” goes beyond the plan's wording. More importantly, Arch-1 is recommended as Postgres + XState + **OSRM cache**, while §3 calls OSRM optional/Phase 2 and §7 puts its cache in step 8. This makes the claimed Phase-1 architecture internally inconsistent. “Three counties = small graph” is also unsupported: the number and change rate of service sites are unknown.

The field `travel_estimate` has no declared type or unit. A generic value plus an `unknown` boolean permits contradictory states and does not say whether it is elapsed time or distance, whether it is between sites or an assignment attribute, or when/how it was estimated. The predecessor's own OSRM source distinguishes duration seconds from distance meters and makes the matrix output fastest-route, not shortest-distance (research S06).

**Critic disposition:** Treat payroll as already covered. Treat manual travel data capture as a likely required minimum because the brief says to track the estimate, but label it as the narrow reading of the brief and ask the cooperative/board to confirm. Define a nullable canonical duration with a unit, provenance/source, recorded-at time, and explicit unknown reason; keep automatic routing, travel-feasibility rules, and OSRM out of the recommended Phase 1 unless costed and approved. Remove OSRM cache from Arch-1's Phase-1 recommendation or move the entire architecture to an optional later slice. Do not claim the location graph is small before counting sites.

### M6 — The accessibility gate overstates what automation can establish

**Draft location:** §6 P-V6; discovery §4/§5.

“Runner-verified WCAG-2.2-AA automation” is not a valid conformance result. W3C says tools cannot automatically check all accessibility aspects and cannot determine accessibility on their own; human judgment is required (CR13). WCAG 2.2 includes keyboard, drag-alternative, label/instruction, error-identification, programmatic state, and status-message criteria relevant to this workflow (CR08). The proposed keyboard/AT walk is valuable, but it needs a clearly bounded test target rather than an automated pass label.

**Critic disposition:** Keep the accessibility validation as proposed work, not executed evidence. State the chosen WCAG target (if the cooperative adopts one); use automated checks as a partial signal, then manual keyboard/touch/assistive-technology task tests with the affected interpreters and a phone-coordinator task test. Include an alternative to drag-only schedule edits, text-identifiable errors, announced state/conflict changes, and non-color status cues. Report scope and unresolved findings; do not claim conformance from a runner score.

### M7 — “Phase-1 shippable” and the recommended bundle are unsupported by cost evidence

**Draft locations:** §3 “all Phase-1 shippable”; §6/§7 build bundle; §4 UD-3/UD-5.

The draft preserves the cap but does not cost Postgres hosting, development, deployment/support, notification delivery, migration/backup work, accessibility review, or six-week pilot support. The recommended architecture contains several components, and no source-backed quote or effort estimate demonstrates it fits $4,200. The draft proposes a costed pilot, but that does not substantiate the current claim that all three architectures are shippable.

**Critic disposition:** Downgrade “all Phase-1 shippable” to “candidate shapes.” Add a small costed comparison and explicitly separate one-time build, hosting/operating costs, and board-review support. The six-week review is a scope boundary and spend decision, not proof the first release fits. Keep all alternatives until price, support capacity, privacy, and conflict handling are compared.

## Minor findings and evidence corrections

1. **Partial exclusion syntax uncertainty is resolved.** Draft P2/§3 condition (a) and U7 say partial-exclusion syntax was not verified. PostgreSQL 18 explicitly documents `EXCLUDE ... WHERE (predicate)` for a subset of rows (CR12). Remove that syntax uncertainty; keep validation of the exact active-status predicate, offer/reservation lifecycle, and concurrent behavior.
2. **UNFILLED terminality needs a deliberate reopen path.** “Never auto-exits” protects honesty, but do not make a stale unfilled request impossible to reopen if new information arrives. Specify explicit reopen/new-request behavior with actor, time, reason, and a new offer cycle; do not auto-promote an unfilled request to available/offered.
3. **P-V8 travel-warning precision/recall lacks a truth-label definition.** No ground truth source is specified. For a small pilot, record the estimate, actual travel duration if voluntarily/operationally captured, override reason, and whether the warning was useful; report descriptive differences rather than precision/recall until labels and denominators are defined.
4. **Timefold lifecycle claims need a tighter source label/version.** The Timefold repo verifies its fork, Community Apache-2.0 license, Enterprise distinction, and current build requirements (CR15). Project history supports the reported OptaPlanner end-of-life story but is a maintainer-side account, not the Red Hat announcement itself (CR14). If keeping this Phase-2 alternative, cite it as project history and pin the version/JDK baseline; current repo instructions say JDK 21+, so do not rely on the discovery's secondary Java 17+ statement. The primary XState v4-to-v5 migration chain already satisfies the assignment's evolution-chain requirement; no need to overstate the Timefold evidence.
5. **PocketBase tradeoff is asserted more strongly than its evidence.** The source supports that its documented API rules are collection-level and superusers bypass them (research S04/S05), and that it lacks PostgreSQL's exact exclusion-constraint mechanism. “Weaker by construction” is not demonstrated for every hook/transaction design. Retain it as an unverified risk and make two truly concurrent offer/accept writes through the selected PocketBase path a required witness before calling it safe.

## Exact P-clause disposition summary

| Exact revealed clause | Critic disposition | Critic reading |
|---|---|---|
| **P1:** “Track an assignment from request through offer, acceptance, completion, and invoice readiness.” | Already-covered + correction | Add an explicit unfilled outcome from the brief and a minimal typed travel-estimate record if confirmed as in-scope. Keep current-cycle terminality honest, with explicit audited reopen/new-cycle behavior. Add offer expiry/decline/cancel transitions. |
| **P2:** “Detect overlapping offers and accepted assignments across coordinators.” | Already-covered + correction | The draft correctly recognizes warn-only checks can race and proposes a strong DB guarantee. Make the required invariant atomic at reservation/accept, but first define whether/how an offer holds a slot and how it expires/releases. A PostgreSQL exclusion constraint is a strong option, not the only acceptable implementation. |
| **P3:** “Limit client and meeting details to the coordinator and assigned interpreter roles that need them.” | Already-covered + optional enhancement | Keep least privilege; refine to need-to-know coordinator scope and stage-aware offer/assigned roles; minimize notification/export payloads. |
| **P4:** “Record communication mode and access arrangements as structured assignment requirements.” | Already-covered + optional enhancement; small user decision | The draft's structured fields/matching gate are coherent. Decide who verifies capability data and what an allowed audited override is; do not treat unverified self-attestation as a confirmed match. |
| **P5:** “Automated client confirmations and reassignment authority are cooperative policy decisions.” | Already-covered + user decision | Correctly preserves both disputes. Interim fail-closed behavior is acceptable only if labelled provisional; members must approve the policy and reassignment steps before those behaviors are represented as settled. |
| **P6:** “Travel estimation rules and any payroll connection are outside the defined first release.” | Split: payroll already-covered; travel scope uncertain with likely correction | No payroll is correct. P6 excludes rules/automation, not necessarily manual capture. Confirm a minimal typed estimate field from the brief; defer routing/automatic feasibility rules unless explicitly approved. Remove the conflict between Arch-1's OSRM cache and §7's later optional placement. |

## Validation status

The validations in the predecessor draft and this critique are proposals. No runtime, production system, application, or qualified scientific witness sandbox was used. No price, uptime, security configuration, privacy behavior, legal applicability, or accessibility conformance was independently established. The strongest proposed discriminators are: simultaneous offer and simultaneous acceptance tests with expiry/retry cases; stage-aware access and notification-payload checks; phone/AT workflow tests; and a costed build/configure comparison before selecting the first-release architecture.
