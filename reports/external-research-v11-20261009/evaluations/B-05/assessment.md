# B-05 — fresh independent assessment

N1 (treatment): **FAIL**. N2 (control): **FAIL**. Both authored finals are available under the exact input map. These grades rest on distinct source-grounded material defects; they do not imply equal quality. Neither is eligible for a full-quality comparative win, and no faster-FAIL or billing winner is assigned.

All six axes, all original O1–O6 obligations, the explicit brief constraints, every exact P1–P6 clause, and the available draft/critique/final prose were reviewed. No candidate was repaired. This is an assessment of a small product planning brief, with no demand for unlimited production guarantees.

## Inputs, independence and evidence

Authority is the original [I05 brief](/home/sittingmongoose/PM-Experiments/er11-20261009-116bb1e4/cases/I05/brief.md), exact [frozen plan](/home/sittingmongoose/PM-Experiments/er11-20261009-116bb1e4/cases/I05/plan-root-only.md), [input map](/home/sittingmongoose/PM-Experiments/er11-20261009-116bb1e4/evaluations/B-05/input-map.json) and [rubric](/home/sittingmongoose/PM-Experiments/er11-20261009-116bb1e4/evaluations/RUBRIC.md). Full machine-readable assessment is in [assessment.json](assessment.json); the [source map](source-map.json) includes exact paths/SHA-256, source versions/sections and failed or recovered retrievals. All 28 listed artifact hashes and byte lengths matched. That integrity check is provenance, not a product-quality test.

Only the supplied B-05 stages/source roots and relevant public primary sources were used. All supplied unique source text was read; 26 byte-identical copies in the authorized roots were additionally compared rather than counted as independent evidence. No other evaluation, campaign, private-provider history, runtime, nested worker, account/config/service, Git or canonical-project change was used. Source text was treated as untrusted.

Partial blinding only: paths and assignments expose control research→critic→fresh reviser and treatment research-author continuity with a critic. Method clues are disclosed, not scored. The N2 critique itself literally ends at line 166 with `...[truncated 7519 chars]`; visible detailed M1–M4/M5 availability text and the M1–M7 summary were assessed. No absent finer criticism was invented. N2 discloses this limitation in its final.

Independent checks use primary database and vendor documentation, release-specific pages/changelogs, official project repositories, W3C material and public issue reports. Reports of defects are not treated as reproduced behavior or merged release fixes. The old Cal.com GitBook page was unavailable to the evaluator; frozen primary S11/C11 excerpts establish only its historical fairness description. Current official features/releases test the broader applicability inference. An initially failed Timefold announcement URL was recovered through the official repository link. Novu capability checks were recovered through its repository and self-hosted release announcement.

## N1 — treatment — FAIL

Authored final: [research/final.md](/home/sittingmongoose/PM-Experiments/er11-20261009-116bb1e4/jobs/B-05/treatment/research/final.md). The exact map reports `final_delivery=true` and `scientific_artifact_available=true`. Candidate native completion, elapsed time, tokens and billing were not independently available and remain null.

### Material findings

**N1-F1 — MATERIALLY_WRONG — medium severity.**

Candidate: [research/final.md:61–61](/home/sittingmongoose/PM-Experiments/er11-20261009-116bb1e4/jobs/B-05/treatment/research/final.md:61).

> `42501` = grant bug

Original obligation: O2; O5 accurate retained source behavior; sensitive client/availability authorization.

The conclusion turns one possible cause into a diagnostic identity. The same official guide explicitly lists an RLS WITH CHECK violation under 42501. This is a consequential error in the offered Postgres/Supabase authorization option: a legitimate policy denial can be misdiagnosed as a grant defect. The comparison of grants and policies is otherwise useful. No actual leakage, policy weakening, or runtime repair is alleged. Discovery records a valid one-way missing-grant example. Draft line 36 turns that into “grant bug not policy bug”; the final retains the wrong diagnostic identity.

Primary evidence: [E05](https://supabase.com/docs/guides/database/postgres/row-level-security) (Live official guide, accessed 2026-10-09; grants versus RLS; policy tests denial table, lines 1314–1320; service keys; views).

The inherited error also appears in these frozen passages:

- [draft.md:36](/home/sittingmongoose/PM-Experiments/er11-20261009-116bb1e4/jobs/B-05/treatment/research/draft.md:36): - Enhancement (recommended): Supabase/Postgres path — per-table RLS (grants AND policies, S03), interpreter payloads stripped to need-to-know columns via views/secure functions, `service_role` server-side only, `42501` = grant bug not policy bug (S03). PocketBase path — locked-default 5-rule model with rules-as-filters and documented failure codes (S05). Either path: availability data is coordinator-queried, never broadcast; interpreter home locations only with consent.

### Six axes

**1. Original obligations and explicit constraints — COVERED_WITH_O2_DEFECT.** All O1–O6 and explicit constraints were examined. The final is coherent planning rather than a delivered application; N1-F1 defeats accurate source behavior, while costs, votes and runtime remain explicit gates.

**2. Primary behavior, defaults, exceptions, units/types and applicability — MATERIAL_DEFECT.** Independent primary checks cover every consequential final mechanism, not only the critic findings. N1-F1 is wrong; major database/routing/API/actor/evolution facts are otherwise grounded or clearly conditional. Minor estimates and future rounding are separated.

**3. Useful unfamiliar discovery and viable alternatives — SUBSTANTIVE_DISCOVERY.** The alternatives change architecture, matching, workflow or delivery choices; they do more than rename plan items. The interpreter-specific configure path adds value without claiming vendor fitness. Optional routing/optimizer/notification/calendar leads survive.

**4. Every exact plan clause and disposition — ALL_SIX_ASSESSED.** Exact clause text and per-clause independent dispositions are recorded. Atomic prevention and travel annotation are justified brief-fidelity corrections; payroll remains excluded and policy choices remain cooperative.

**5. Draft–critique–final preservation and fallible criticism — PRESERVED_WITH_INHERITED_FACT_ERROR.** Full final prose preserves material discoveries, alternatives, constraints and uncertainty and applies qualified critic suggestions. The author’s claim of not re-fetching critic sources is retained as provenance; the evaluator checked them independently. Source error N1-F1 survives untouched.

**6. Meaningful validation, proposed versus executed — MEANINGFUL_PROPOSALS_ONLY.** Proposals have competing wrong-design oracles, including actual concurrent offer/accept transactions and stage payloads. Executed hashes/fetches do not test the product. No deployed correctness or formal accessibility conformance is credited.

Coverage is complete for the available frozen scope. The following ledgers make that statement reviewable; neither a filled form nor the number of sources determined the grade.

### Original obligations

| Obligation | Judgment | Candidate locator and independent assessment |
| --- | --- | --- |
| O1 | FULFILLED_WITH_LIMITATIONS | final 58–68, 90–97. Useful unfamiliar options include exclusion constraints, DB/API authorization, XState lifecycle, routing, optimizer, notification substrate and a conditional interpreter-operations configuration path. No citation-count criterion is used. |
| O2 | MATERIAL_DEFECT | final 60–66, 109–113. Governing mechanisms/defaults/units are substantially investigated, but retained Supabase error diagnosis is wrong (N1-F1). Conditional vendors and exact application shapes remain honestly unproved. |
| O3 | FULFILLED | discovery evolution chains; final 62, 64–65, 111, 117. XState v4→v5 breaking renames and TS requirement are relevant; Timefold fork/evolution is corroborated and maintainer history attributed. Open Cal.com reports illustrate concurrency; no fixed-release claim is established. |
| O4 | FULFILLED | final 70–88. Every exact clause is quoted and independently assessed below; no supported payroll exclusion is overwritten and travel value versus rules is distinguished. |
| O5 | SUBSTANTIALLY_FULFILLED_WITH_DEFECT | final 54–56, 58–113, 129–148. One self-contained final retains alternatives, policy disagreement and uncertainty, rather than relying on IDs. N1-F1 persists through draft-to-final; minor compressed technical details are recorded separately. |
| O6 | FULFILLED_AS_PROPOSALS | final 115–127. Executed evidence is documentation/intake checking only. Concurrency, stage privacy, lifecycle, AT/phone, cost and six-week pilot proposals distinguish plausible wrong designs. No runtime guarantee is credited. |

### Explicit brief constraints

| Constraint | Judgment | Candidate locator and independent assessment |
| --- | --- | --- |
| scale/location/short notice | RETAINED | final 54–56, 68, 88. 26/4/3 scale is preserved; no small-site graph is assumed and offer lifecycle covers short-notice changes. |
| $4,200 and cooperative support | RETAINED_AS_GATE | final 90–107, 119, 126. Architecture selection awaits a costed comparison including build, operating/support and six-week work; no actual fit proof. |
| browser/phone/assistive technology | RETAINED_AS_VALIDATION | final 119, 125, 129–139. Responsive browser/day-edit and affected-interpreter AT work are proposed; no live UI or conformance result. |
| names/topics/availability sensitive | RETAINED | final 54–56, 78–79, 121. Stage fields, coordinator need, authenticated retrieval and minimal out-of-app notifications preserve intent; RLS diagnosis has N1-F1. |
| mode/access arrangements | RETAINED | final 81–82, 104. Structured verified matching, unfilled unmet requirements and override audit are explicit. |
| request/offer/accept/travel/complete/invoice | RETAINED | final 72–88. Typed manual travel with uncertainty, lifecycle exception/reopen and invoice-readiness are retained; no full payroll. |
| honest unfilled | RETAINED | final 73, 123, 127. Reason/actor/time and explicit human new cycle avoid implying a qualified interpreter exists. |
| confirmations and reassignment disputes | RETAINED_AS_USER_DECISIONS | final 84–85, 101–102, 124. Policies/effective date must be approved; provisional off/consent defaults are identified. |
| six weeks before more spend | RETAINED | final 97, 105, 126–127. Pilot metrics and spending/optimizer gate retain board authority. |

### Every exact frozen P clause

**P1: “Track an assignment from request through offer, acceptance, completion, and invoice readiness.”**

Authored dispositions: ALREADY_COVERED, CORRECTION. Candidate: [research/final.md:72–73](/home/sittingmongoose/PM-Experiments/er11-20261009-116bb1e4/jobs/B-05/treatment/research/final.md:72).

Lifecycle is retained. UNFILLED with reason/audit and explicit reopen/new cycle addresses the original brief. Minimal travel capture is a reasonable correction of the thin plan, with automation deferred. Expiry/decline/cancel details improve lifecycle completeness.

**P2: “Detect overlapping offers and accepted assignments across coordinators.”**

Authored dispositions: ALREADY_COVERED, CORRECTION, USER_DECISION. Candidate: [research/final.md:75–76](/home/sittingmongoose/PM-Experiments/er11-20261009-116bb1e4/jobs/B-05/treatment/research/final.md:75).

Atomic conflict prevention is a justified response to cross-coordinator double offers; no single backend is mandated. Hold/TTL and non-reserving models are stated as alternatives, with accepts arbitrated atomically and retries/releases tested. Model N permits parallel provisional offers, so the cooperative must choose semantics; it is not evidence that all offers are automatically reserved.

**P3: “Limit client and meeting details to the coordinator and assigned interpreter roles that need them.”**

Authored dispositions: ALREADY_COVERED, OPTIONAL_ENHANCEMENT, USER_DECISION. Candidate: [research/final.md:78–79](/home/sittingmongoose/PM-Experiments/er11-20261009-116bb1e4/jobs/B-05/treatment/research/final.md:78).

The need-to-know principle is preserved and applied to offers, assigned work, coordinator scope, exports and notification payloads. Availability sensitivity remains explicit in the brief-fidelity paragraph. Row rules are not treated as sufficient field redaction. Specific coordinator scope is a decision, not a discovered universal legal restriction.

**P4: “Record communication mode and access arrangements as structured assignment requirements.”**

Authored dispositions: ALREADY_COVERED, OPTIONAL_ENHANCEMENT, USER_DECISION. Candidate: [research/final.md:81–82](/home/sittingmongoose/PM-Experiments/er11-20261009-116bb1e4/jobs/B-05/treatment/research/final.md:81).

Structured mode/access requirements become matchable checks with verified capability flags, mismatch refusal or an explicitly audited exception. Verification ownership is named. The plan does not by itself mandate a solver; the final does not force one.

**P5: “Automated client confirmations and reassignment authority are cooperative policy decisions.”**

Authored dispositions: ALREADY_COVERED, USER_DECISION. Candidate: [research/final.md:84–85](/home/sittingmongoose/PM-Experiments/er11-20261009-116bb1e4/jobs/B-05/treatment/research/final.md:84).

Both member disputes remain release decisions with decision records/effective dates. OFF and consent-required are provisional fail-safes requiring ratification, not claimed cooperative votes. Reassignment includes old consent, replacement acceptance, notification and audit.

**P6: “Travel estimation rules and any payroll connection are outside the defined first release.”**

Authored dispositions: ALREADY_COVERED, UNCERTAIN, CORRECTION, USER_DECISION. Candidate: [research/final.md:87–88](/home/sittingmongoose/PM-Experiments/er11-20261009-116bb1e4/jobs/B-05/treatment/research/final.md:87).

Payroll exclusion remains. The brief separately requires tracking a travel estimate, so excluding automated rules does not justify deleting the estimate value. Typed nullable manual capture with provenance is a defensible narrow reading. OSRM/automatic feasibility are optional and cost-gated; board confirmation is honest scope adjudication. Integer storage is a minor integration issue if fractional engine results are later used.

### Primary behavior and applicability ledger

These are factual/applicability checks, not counts of citations or vendor endorsements. A conditional unselected lead may remain uncertain without becoming a required deployed guarantee. Every consequential final claim group below was assessed; no mandatory reviewer claim group remains deferred. Public release/version and exact sections are in the linked source map.

| Claim group | Judgment | Candidate / evidence / assessment |
| --- | --- | --- |
| PostgreSQL | SUPPORTED_WITH_APPLICATION_GATE | final 60,75–76,109. Exclusion, ranges and partial syntax are documented; interpreter/status/hold model and concurrent behavior remain implementation tests. Sources: [E01](https://www.postgresql.org/docs/18/rangetypes.html), [E02](https://www.postgresql.org/docs/18/sql-createtable.html), [E03](https://www.postgresql.org/docs/18/btree-gist.html), [E04](https://www.postgresql.org/docs/18/errcodes-appendix.html) |
| Supabase | MATERIALLY_WRONG_DIAGNOSTIC | final 61,78–79,109. Grants/policy separation and privileged-key concerns are useful; 42501 diagnostic identity fails. Field redaction/views are conditional, not automatically credited. Sources: [E05](https://supabase.com/docs/guides/database/postgres/row-level-security) |
| PocketBase | SUPPORTED_CAPABILITIES_AND_UNPROVED_APP | final 61,95,120. Default rules/codes/superuser bypass and pre-1.0 risk are real; correctness of chosen hooks/transaction design is not demonstrated. Sources: [E06](https://pocketbase.io/docs/), [E07](https://pocketbase.io/docs/api-rules-and-filters/), [E09](https://pocketbase.io/docs/go-database/), [E10](https://pocketbase.io/docs/js-records/) |
| OSRM | SUPPORTED_OPTIONAL_SLICE | final 63,88,94,122. Core units/defaults/route-vs-trip algorithms and profile applicability agree with v5.24.0. Manual integer record has a minor optional-ingestion precision gap. Sources: [E13](https://project-osrm.org/docs/v5.24.0/api/) |
| XState | SUPPORTED_EVOLUTION_UNPROVED_PERSISTENCE | final 64,73,109,123. v5 actor APIs and TS migration are documented; lifecycle guards and database atomicity remain distinct and persistence remains conditional. Sources: [E14](https://stately.ai/docs/xstate), [E15](https://stately.ai/docs/migration) |
| Timefold | SUPPORTED_WITH_MAINTAINER_ATTRIBUTION | final 62,97,111. Library/model/platform, Community/Enterprise and fork dates are grounded. Current JDK baseline is not a pin for every historic release; solver is optional Phase 2. Sources: [E16](https://docs.timefold.ai/), [E17](https://docs.timefold.ai/timefold-solver/latest/constraints-and-score/score-calculation), [E18](https://github.com/TimefoldAI/timefold-solver), [E19](https://optaplanner.io/the-history-of-optaplanner), [E20](https://timefold.ai/blog/optaplanner-fork) |
| Cal.com | SUPPORTED_NARROW_API_AND_REPORTED_ISSUES | final 65,96,111. API cap/keys/Platform freeze are scoped; routing, terms and round-robin adoption remain conditions. Reported race family does not establish every deployed release vulnerable or a merged fix. Sources: [E21](https://cal.com/docs/api-reference/v2/introduction), [E22](https://github.com/calcom/cal.diy/issues/29958), [E23](https://github.com/calcom/cal.diy/issues/29967), [E24](https://github.com/calcom/cal.diy/issues/29968) |
| Novu | SUPPORTED_CAPABILITIES_COST_UNKNOWN | final 66,96,113. Workflow, Inbox/preferences and a self-hosted edition exist; minimal built-in alternative is retained, no cost or edition-parity guarantee. Sources: [E31](https://docs.novu.co/), [E32](https://github.com/novuhq/novu), [E33](https://www.novu.co/changelog/novu-community-edition-v220-self-hosting/) |
| Interpreter-operations options | USEFUL_CONDITIONAL_COMPARATOR | final 68,92,119. Default availability and offer-pool/buffer warnings are grounded. Interpreter mobile is not coordinator-mobile proof; current pricing/security/accessibility remain due-diligence gates. Sources: [E34](https://interpreterintelligence.zendesk.com/hc/en-us/articles/12922072819483-Scheduler), [E35](https://interpreterintelligence.zendesk.com/hc/en-us/articles/15410092403483-Availability-and-Double-Booking-Buffers), [E36](https://interpreterintelligence.zendesk.com/hc/en-us/articles/12922582860955-Interpreter-Portal-Desktop-Site-Mobile-App), [E37](https://interpreter.io/) |
| Accessibility | MEANINGFUL_PROPOSAL_NO_CONFORMANCE | final 107,125. WCAG 2.2 AA is a proposed cooperative target and automation only a partial signal; task evidence is not executed. Sources: [E29](https://www.w3.org/WAI/test-evaluate/tools/selecting/), [E30](https://www.w3.org/TR/2024/REC-WCAG22-20241212/) |
| Costs/licenses/secondary leads | HONESTLY_UNRESOLVED | final 63,65–68,90–113. ORS, Valhalla/traffic, Cal.com license, notification spend and vendor trial outcomes remain conditional. No unsupported secondary claim is silently promoted into a required shipped guarantee. Sources: original brief / stated uncertainty / engineering judgment |

### Preservation and criticism adjudication

The final contains full material prose and explicitly addresses all seven major and five minor criticisms. It retains the original unfamiliar mechanisms, secondary alternatives and unresolved inputs; adds the interpreter-operations lead; separates base/optional architectures; expands hold, stage privacy, policy, manual-travel and UNFILLED semantics. Supabase misdiagnosis is inherited, not introduced by criticism. No material supported option is erased merely because a critic disliked it. Detailed OSRM request knobs and some XState aliases are compressed, with release-specific sources still referenced and implementation verification conditional.

**M1 — PARTIALLY_ACCEPT.** Interpreter Intelligence is a materially different and useful due-diligence option; vendor guides substantiate relevance and configuration cautions. The critic overstates its absence as a necessary O1 failure: O1 does not require a named vertical product when several useful unfamiliar mechanisms were independently found. Final addition retains price/privacy/accessibility and coordinator-mobile uncertainty. (final lines 9–11, 68, 92, 119). Evidence: [E34](https://interpreterintelligence.zendesk.com/hc/en-us/articles/12922072819483-Scheduler), [E35](https://interpreterintelligence.zendesk.com/hc/en-us/articles/15410092403483-Availability-and-Double-Booking-Buffers), [E36](https://interpreterintelligence.zendesk.com/hc/en-us/articles/12922582860955-Interpreter-Portal-Desktop-Site-Mobile-App).

**M2 — ACCEPT.** Offer reservation/TTL, release/retry and notification ordering are valid missing semantics. The final adds both hold and non-reserving models, conditions the PostgreSQL implementation on architecture choice, and distinguishes app conflict UX from native database errors. The reported Cal.com race is a hypothesis, not an independent release proof. (final lines 12–16, 75–76, 120). Evidence: [E01](https://www.postgresql.org/docs/18/rangetypes.html), [E02](https://www.postgresql.org/docs/18/sql-createtable.html), [E22](https://github.com/calcom/cal.diy/issues/29958).

**M3 — ACCEPT_AS_REFINEMENT.** Stage-aware disclosure and notification minimization are well justified by the original sensitive-data constraint. The precise coordinator scope is not established by four coordinators/three counties, and the final appropriately treats it as a decision. (final lines 18–21, 78–79, 121). Evidence: [E05](https://supabase.com/docs/guides/database/postgres/row-level-security), [E07](https://pocketbase.io/docs/api-rules-and-filters/), [E08](https://pocketbase.io/docs/go-realtime/), [E10](https://pocketbase.io/docs/js-records/).

**M4 — PARTIALLY_ACCEPT.** Temporary defaults and reassignment steps benefit from explicit ratification. A proposed fail-safe is not automatically an unauthorized settled policy. Final release gates resolve the ambiguity and preserve the cooperative disagreement. (final lines 22–26, 84–85, 101–102, 124).

**M5 — PARTIALLY_ACCEPT.** Removing OSRM from the base architecture and withdrawing the small-graph assumption are justified. Types/provenance are useful. A critic objection to requiring manual travel capture solely because P6 omits it is too strong: the original brief explicitly requires tracking a travel estimate. Final narrow-reading qualification is acceptable. (final lines 28–34, 87–97, 122). Evidence: [E13](https://project-osrm.org/docs/v5.24.0/api/).

**M6 — ACCEPT_WITH_CONTEXT.** Automation alone cannot establish accessibility. The draft also proposed manual AT work and did not claim execution, so the critic does not establish that an actual conformance result was fabricated. Final clearly adopts automation only as a partial signal. (final lines 35–40, 107, 125). Evidence: [E29](https://www.w3.org/WAI/test-evaluate/tools/selecting/), [E30](https://www.w3.org/TR/2024/REC-WCAG22-20241212/).

**M7 — ACCEPT.** No effort/cost evidence made every bundle shippable inside the cap. Candidate shapes, an explicit costed build/configure comparison and six-week support accounting are proportionate planning responses. This is not a demand for unlimited operational guarantees. (final lines 42–44, 90–97, 119, 126).

**minor 1 — ACCEPT.** PostgreSQL explicitly permits WHERE (predicate); exact runtime predicate still needs testing. (final lines 45–46, 75–76, 109). Evidence: [E02](https://www.postgresql.org/docs/18/sql-createtable.html).

**minor 2 — ACCEPT.** Audited human reopen/new-cycle behavior preserves UNFILLED honesty without trapping corrected requests. (final lines 47, 73, 123).

**minor 3 — ACCEPT.** Unlabeled precision/recall would have no meaningful truth oracle. Descriptive pilot measurements with reasons are retained instead. (final lines 48, 127).

**minor 4 — ACCEPT.** Maintainer history is attributed and the current JDK 21 baseline is qualified; the XState migration already supplies an evolution chain. (final lines 49, 62, 111). Evidence: [E15](https://stately.ai/docs/migration), [E18](https://github.com/TimefoldAI/timefold-solver), [E19](https://optaplanner.io/the-history-of-optaplanner), [E20](https://timefold.ai/blog/optaplanner-fork).

**minor 5 — ACCEPT.** No universal weaker-by-construction claim follows from collection rules. PocketBase can support a transaction design; its chosen path still needs a concurrent witness. (final lines 50, 95, 120). Evidence: [E09](https://pocketbase.io/docs/go-database/).

Critic assertions rejected or qualified independently:

- A vertical-product omission is not automatically an O1 failure.
- The original brief supports requiring a minimal travel value despite P6 excluding rules.
- An unexecuted automation proposal plus manual AT work is not proof of an actually fabricated conformance result.
- Safe proposed defaults are not automatically settled cooperative decisions.
- PocketBase is not universally unsafe or weaker solely because its default authorization is at API level.

### Proposed versus executed validation

Neither author supplies an executed application witness. Documentation fetches, source excerpts, static comparisons and hashes can establish what was read or preserved; they cannot establish double-offer safety, privacy, price, uptime or accessibility. No zero exit status was accepted as a scientific product oracle.

| Validation | Status | Independent assessment |
| --- | --- | --- |
| executed E1–E5 | DOCUMENTATION_ONLY | Documentation/source-intake observations only; no runtime credit. Frozen files support what the author reported, but evaluator did not observe those historical executions directly. Fetches/excerpt checks do not discriminate competing deployed designs. |
| P-V0/P-V7 | PROPOSED | Costed build/configure comparison and support diary are relevant under the cap. Neither has run; exact provider/labor costs remain user/builder inputs. |
| P-V1/P-V1b | PROPOSED | Concurrent offer AND accept paths, expiry/release/retry and idempotency are meaningful; winner/conflict and exactly-once state provide an oracle. Must run the selected path, not a sequential pre-check or an unrelated database demo. |
| P-V2 | PROPOSED | Role-by-stage record/field, export, payload and reassignment checks discriminate collection-only or broad-role security; privileged client credentials are explicitly prohibited. |
| P-V3/P-V3a | PROPOSED | Units, null/unknown/provenance and site measurement address wrong zeros and unsupported county-size inference; cache/profile checks apply only to the approved route slice. |
| P-V4/P-V5 | PROPOSED | Legal/illegal transition outcomes and approved-policy branch effects discriminate status strings and silent policy assumptions; reopen and notification enable/preference are explicit. |
| P-V6 | PROPOSED | Automation is partial. Human keyboard/touch/AT and phone tasks are relevant; no formal WCAG conformance is established. |
| P-V8 | PROPOSED | Descriptive six-week measures replace unsupported precision/recall. These are board decision evidence, not correctness or route-accuracy proof. |

### Minor findings and unresolved inputs

- **N1-m1** ([research/final.md:95–95](/home/sittingmongoose/PM-Experiments/er11-20261009-116bb1e4/jobs/B-05/treatment/research/final.md:95)): Fastest/cheapest to stand up is an unmeasured relative claim. Whole-project costs are explicitly unobserved and every architecture is a gated candidate, so this is not treated as proof of $4,200 fit or a separate material budget failure.
- **N1-m2** ([research/final.md:88–94](/home/sittingmongoose/PM-Experiments/er11-20261009-116bb1e4/jobs/B-05/treatment/research/final.md:88)): Canonical manual travel uses integer seconds/meters, while OSRM example outputs contain fractions. Optional engine ingestion needs a precision/rounding contract. Manual-only R1 and an unselected route slice make this a minor integration limit, not a wrong unit.
- **N1-m3** ([research/final.md:88–88](/home/sittingmongoose/PM-Experiments/er11-20261009-116bb1e4/jobs/B-05/treatment/research/final.md:88)): Automatic feasibility rules are excluded from the base release but the build order mentions manual buffers. Manual annotation/human judgment can reconcile this; the prose should be read as conditional, not proof of an approved automated rules subsystem. Also [research/final.md:135–135](/home/sittingmongoose/PM-Experiments/er11-20261009-116bb1e4/jobs/B-05/treatment/research/final.md:135).

Unresolved externally, rather than silently established:

- No runtime, application sandbox, concurrency witness, accessibility task execution or actual deployment exists in the supplied scientific artifacts.
- Cooperative policy votes, precise client disclosure tiers, vocabulary/capability verification and real support capacity remain external decisions.
- Actual build/operating costs, site count, route coverage/traffic accuracy and six-week pilot measurements are not established.
- Public product guides establish capabilities/configuration warnings, not price, privacy configuration, legal sufficiency, coordinator-mobile success or full accessibility.
- Architecture selection and manual travel confirmation are explicit gates; no option is an approved shipped system.

The FAIL grade is based on the material findings above. Honest pending user decisions and unavailable runtime are not independently scored as failures. No privacy breach, executed unsafe backup or fabricated full conformance test is alleged.

## N2 — control — FAIL

Authored final: [reviser/final.md](/home/sittingmongoose/PM-Experiments/er11-20261009-116bb1e4/jobs/B-05/control/reviser/final.md). The exact map reports `final_delivery=true` and `scientific_artifact_available=true`. Candidate native completion, elapsed time, tokens and billing were not independently available and remain null.

### Material findings

**N2-F1 — UNSUPPORTED_CONSEQUENTIAL — medium severity.**

Candidate: [reviser/final.md:484–492](/home/sittingmongoose/PM-Experiments/er11-20261009-116bb1e4/jobs/B-05/control/reviser/final.md:484).

> no skill/mode/access matching, no travel feasibility, no
> offer→accept handshake

Original obligation: O1/O2 useful alternatives and source-grounded product applicability; O5 preserve evidential qualification.

The final gives categorical missing-feature reasons for restricting Cal.com to intake. Its only cited legacy round-robin source demonstrates a narrow fairness mechanism, not whole-product absences. Official v5.0 material documents attribute-based member routing, and the confirmation feature documents host approval before a booking is added. These mechanisms do not establish validated interpreter credentials, a complete cooperative offer lifecycle, privacy, UNFILLED handling or invoice readiness; rejecting Cal.com as a complete drop-in ledger can remain defensible. The material defect is the unsupported categorical rationale and mandatory intake-only boundary, not failure to recommend Cal.com. Critic source C11 says the capabilities are not evidenced on that page; that qualification does not survive in the final.

Primary evidence: [E25](https://cal.com/blog/why-cal-com-s-routing-forms-are-a-game-changer-for-scheduling) (Vendor product article March 3, 2025, v5.0; Attributes and dynamic routing; explicit fallback, lines 115–128); [E26](https://cal.com/features/requires-confirmation) (Live official feature page; Opt-in bookings, lines 91–119); [E27](https://next.cal.com/blog/cal-com-v5-1) (Cal.com v5.1 release post March 14, 2025; Weighted attribute routing and fairness reset interval).

**N2-F2 — MATERIALLY_INCOMPLETE — medium severity.**

Candidate: [reviser/final.md:568–576](/home/sittingmongoose/PM-Experiments/er11-20261009-116bb1e4/jobs/B-05/control/reviser/final.md:568).

> nightly backup of the data file +

Original obligation: O2 governing operational behavior/applicability of chosen mechanism; O5 cooperative supportability and coherent first-release design.

The selected deployment is justified repeatedly by a one-file backup story and prescribes a nightly data-file-plus-config backup. PocketBase documents a full pb_data backup with a stopped application for manual copying, or a builtin snapshot archive. The candidate does not identify either method or the transactional-safety prerequisite and reduces the documented backup scope to a data file. A ZIP can indeed be one archive, so one-file wording alone would not establish a defect; the concrete data-file recipe makes the omission consequential to the chosen supportability story. No live unsafe backup, mandatory attachment feature, catastrophic loss, high-availability requirement, or restore result is alleged.

Primary evidence: [E11](https://pocketbase.io/docs/going-to-production/) (Official docs displaying v0.40.5; builtin backup v0.16+; Backup and Restore, lines 67–77).

Frozen source qualification: [C11-calcom-roundrobin.md:15](/home/sittingmongoose/PM-Experiments/er11-20261009-116bb1e4/jobs/B-05/control/reviser/sources/C11-calcom-roundrobin.md:15) explicitly limits the absent-capability statement to what is evidenced on that page. It is not a whole-product absence proof. SHA-256: `20e272f46bbad49a026862a535cf9c13b62c581212a5bad00e577e03f9185a6f`.

### Six axes

**1. Original obligations and explicit constraints — COVERED_WITH_O2/O5_DEFECTS.** All original obligations/constraints were examined. Concrete single-store, availability, mobile and export design help. Source-grounded N2-F1/F2 prevent full-quality pass; the budget remains an unproved estimate.

**2. Primary behavior, defaults, exceptions, units/types and applicability — MATERIAL_DEFECTS.** Most PG/PB/OSRM/Timefold/APG facts are supported at their documented scope. Categorical Cal.com negatives and the chosen backup recipe exceed their evidence. Mutable docs are qualified; no runtime capability is assumed.

**3. Useful unfamiliar discovery and viable alternatives — USEFUL_DISCOVERY_WITH_BAD_REJECTION.** Useful backend/routing/score/picker mechanisms and manual-versus-optimizer, single-store-versus-hardening paths are retained. N2-F1 gives an unsupported exclusion rationale for one actual comparator. Missing a vertical vendor alone is not a failure.

**4. Every exact plan clause and disposition — ALL_SIX_ASSESSED.** Exact P1–P6 are dispositioned, with required OSRM overreach corrected and manual estimate value preserved. Availability and policy authority remain. No automatic payroll calculation is introduced.

**5. Draft–critique–final preservation and fallible criticism — SUBSTANTIAL_PRESERVATION_WITH_LOST_QUALIFIER.** The final retains material source content and user disagreement, rather than IDs alone. It does not invent missing detailed critique. It loses the narrow Cal.com evidential limitation and adds an unsupported operational simplification. Both are assessed independently of critic agreement.

**6. Meaningful validation, proposed versus executed — MEANINGFUL_PROPOSALS_WITH_MINOR_MAPPING_GAP.** V1–V11 are clearly proposed; actual persistent-state, unauthorized-disclosure, task and metrics oracles are present. Invoice-export mapping and proven wording are minor contextual limits. No evidence of executed concurrency/AT/backup/price success exists.

Coverage is complete for the available frozen scope. The following ledgers make that statement reviewable; neither a filled form nor the number of sources determined the grade.

### Original obligations

| Obligation | Judgment | Candidate locator and independent assessment |
| --- | --- | --- |
| O1 | FULFILLED_WITH_MATERIAL_APPLICABILITY_DEFECT | final 398–509, 639–669. Unfamiliar backend, atomic-conflict, route, optimizer and APG mechanisms are useful; manual selection versus solver and single-store versus Postgres are real alternatives. Cal.com categorical exclusion is not sourced (N2-F1); lack of a vertical-product name alone does not violate O1. |
| O2 | MATERIAL_DEFECTS | final 406–509, 560–617. Most units/defaults and rule exceptions are sound. Whole-product negative assertions exceed the narrow source; chosen backup recipe omits documented scope/safety (N2-F1/F2). Backend cost fit is a planning assertion with no numerical build envelope. |
| O3 | FULFILLED_WITH_ATTRIBUTION | final 686–714. Timefold continuation and version-specific PocketBase release behavior are relevant chains. Project history/fix totals are attributed; no reproduced regression or inspected merged fix is claimed. |
| O4 | FULFILLED_AFTER_VALID_RESCOPE | final 238–396. All six exact clauses receive full dispositions. OSRM-as-required and solver-as-R1 claims are withdrawn, while travel value, sensitive availability and cooperative policy authority remain. |
| O5 | SUBSTANTIALLY_FULFILLED_WITH_DEFECT | final 52–76, 78–236, 398–714. The full final preserves constraints, hard eligibility, sources/limits, optional engines and cooperative decisions. Critique truncation is disclosed. Narrow Cal.com evidence becomes a categorical conclusion; the added backup story lacks source qualification. |
| O6 | FULFILLED_AS_PROPOSALS_WITH_MINOR_GAPS | final 716–783. No runtime is claimed in the executed section. V1–V11 contain meaningful concurrent, privacy, AT, policy, mobile and export checks; a few proposal labels say proven loosely and the invoice/board export mapping is incomplete. |

### Explicit brief constraints

| Constraint | Judgment | Candidate locator and independent assessment |
| --- | --- | --- |
| scale/location/short notice | RETAINED | final 32–50, 52–76, 594. Small cooperative scope and short-notice phone edits are preserved. Four users does not prove tiny contention, but serialization is intended to control it and requires a witness. |
| $4,200 and cooperative support | RETAINED_BUT_UNPROVED | final 33, 560–576, 591–595. Components are reduced and costs called estimates; no labor allocation/total demonstrates fit. N2-F2 weakens the asserted backup support story. |
| browser/phone/assistive technology | RETAINED_AS_VALIDATION | final 494–503, 546–551, 763–766, 776–780. Phone retry/reconnect and picker/AT tasks are specified; full offline operation is deferred. No executed usability/conformance evidence. |
| names/topics/availability sensitive | RETAINED | final 295–324, 528–539, 756–762. Availability is private, fields/custom topics require authorization and clients see own status. Notification payload detail could be clearer; no actual leakage is proved. |
| mode/access arrangements | RETAINED | final 325–346, 767–770. Exact tokens/free text and hard eligibility before fairness are explicit. |
| request/offer/accept/travel/complete/invoice | RETAINED | final 244–266, 369–396, 553–559. Declared estimate, completion and invoice flag/export are kept without computed pay; payroll-consuming CSV wording remains loose. |
| honest unfilled | RETAINED | final 244–266, 771–772. UNFILLED reason/review cannot silently turn into a match; future user test has an independent misreading oracle. |
| confirmations and reassignment disputes | RETAINED_AS_USER_DECISIONS | final 348–367, 773–775. Member choices and configuration are retained; off/ask-first are initial fail-safe behavior, not observed approval. |
| six weeks before more spend | RETAINED | final 639–669, 781–783. Board metrics/export and later engine spending decisions retain the review boundary. |

### Every exact frozen P clause

**P1: “Track an assignment from request through offer, acceptance, completion, and invoice readiness.”**

Authored dispositions: ALREADY_COVERED, CORRECTION. Candidate: [reviser/final.md:244–266](/home/sittingmongoose/PM-Experiments/er11-20261009-116bb1e4/jobs/B-05/control/reviser/final.md:244).

Request-to-invoice workflow is retained with travel annotation and a reasoned UNFILLED state. Explicit expiry/decline/cancel handling and human review do not imply availability. Routing and solver services are no longer required R1 mechanisms.

**P2: “Detect overlapping offers and accepted assignments across coordinators.”**

Authored dispositions: ALREADY_COVERED, CORRECTION. Candidate: [reviser/final.md:268–293](/home/sittingmongoose/PM-Experiments/er11-20261009-116bb1e4/jobs/B-05/control/reviser/final.md:268).

Detection is retained for UX, while the offer commit must prevent conflicting active holds. PocketBase is the selected single transactional writer; idempotency and history handling are specified. PostgreSQL exclusion is a conditional fallback. This is a plausible design under documented transaction behavior, not an executed guarantee.

**P3: “Limit client and meeting details to the coordinator and assigned interpreter roles that need them.”**

Authored dispositions: ALREADY_COVERED, CORRECTION, USER_DECISION. Candidate: [reviser/final.md:295–324](/home/sittingmongoose/PM-Experiments/er11-20261009-116bb1e4/jobs/B-05/control/reviser/final.md:295).

Availability non-enumerability is correctly included alongside names/topics. Collection rules, field projection and custom-topic authorization are separated. Exact-address-at-offer versus after-acceptance is appropriately a cooperative disclosure decision: travel assessment can need location before acceptance. Coordinator-full remains a design assumption that needs actual operational scope, not proof that everyone needs all data.

**P4: “Record communication mode and access arrangements as structured assignment requirements.”**

Authored dispositions: ALREADY_COVERED, OPTIONAL_ENHANCEMENT, USER_DECISION. Candidate: [reviser/final.md:325–346](/home/sittingmongoose/PM-Experiments/er11-20261009-116bb1e4/jobs/B-05/control/reviser/final.md:325).

Controlled vocabulary plus exact free-text arrangements preserve client requirements. Hard eligibility precedes fairness under every toggle. Capability and vocabulary governance remain user decisions, with no invented clinical credential guarantee. APG checks are task proposals, not conformance certification.

**P5: “Automated client confirmations and reassignment authority are cooperative policy decisions.”**

Authored dispositions: ALREADY_COVERED, USER_DECISION. Candidate: [reviser/final.md:348–367](/home/sittingmongoose/PM-Experiments/er11-20261009-116bb1e4/jobs/B-05/control/reviser/final.md:348).

The cooperative chooses confirmation and reassignment policy; OFF/ASK-first are safe initial configurable choices pending its decision. Approved branches require preferences, reason/notice and audit. The final does not present an actual member vote.

**P6: “Travel estimation rules and any payroll connection are outside the defined first release.”**

Authored dispositions: ALREADY_COVERED, CORRECTION, OPTIONAL_ENHANCEMENT, USER_DECISION. Candidate: [reviser/final.md:369–396](/home/sittingmongoose/PM-Experiments/er11-20261009-116bb1e4/jobs/B-05/control/reviser/final.md:369).

Manual declared duration/method/timestamp reconciles tracking an estimate with excluding estimation rules. Automated routing is R2. Payroll calculation is excluded; invoice export is retained. Describing a separate payroll process consuming a CSV is a loose boundary description, not an implemented payroll connection or calculation.

### Primary behavior and applicability ledger

These are factual/applicability checks, not counts of citations or vendor endorsements. A conditional unselected lead may remain uncertain without becoming a required deployed guarantee. Every consequential final claim group below was assessed; no mandatory reviewer claim group remains deferred. Public release/version and exact sections are in the linked source map.

| Claim group | Judgment | Candidate / evidence / assessment |
| --- | --- | --- |
| PostgreSQL hardening | SUPPORTED_CONDITIONAL_FALLBACK | final 268–293,442–458,746–749. Bounds, overlap, opclasses, partial predicate and SQLSTATE align with PG18; runtime active-row policy is not executed and main release remains PocketBase. Sources: [E01](https://www.postgresql.org/docs/18/rangetypes.html), [E02](https://www.postgresql.org/docs/18/sql-createtable.html), [E03](https://www.postgresql.org/docs/18/btree-gist.html), [E04](https://www.postgresql.org/docs/18/errcodes-appendix.html) |
| PocketBase authorization/realtime | SUPPORTED_UNPROVED_CONFIG | final 295–324,460–482,756–762. Codes/locked defaults/superuser exceptions are grounded. Collection-rule and field/custom-topic duties are distinguished; no actual least-privilege proof. Sources: [E06](https://pocketbase.io/docs/), [E07](https://pocketbase.io/docs/api-rules-and-filters/), [E08](https://pocketbase.io/docs/go-realtime/), [E10](https://pocketbase.io/docs/js-records/) |
| PocketBase atomic owner | PLAUSIBLE_UNPROVEN | final 150–163,578–617,740–743. Official transaction/single-writer behavior supports a sole hold writer, provided callback/entry paths are correct. Four users is not proof of races absent; V1 still required. Sources: [E09](https://pocketbase.io/docs/go-database/) |
| PocketBase deployment/backup | MATERIALLY_INCOMPLETE | final 560–576,591–595. Single binary does not establish the stated data-file backup recipe sufficient or safe; N2-F2. Sources: [E11](https://pocketbase.io/docs/going-to-production/) |
| PocketBase evolution | SUPPORTED_RELEASE_CHAIN | final 701–709. v0.40.0 command error behavior and later migration fixes support pin/stage/retest; missing old auth change is expressly not claimed observed. Sources: [E06](https://pocketbase.io/docs/), [E12](https://raw.githubusercontent.com/pocketbase/pocketbase/v0.40.5/CHANGELOG.md) |
| OSRM optional route | SUPPORTED_GATED_RELEASE | final 425–440,369–396,750–755. Units, coordinate order, nulls, annotation defaults and fallback labeling agree with release docs. Candidate used mutable master; chosen R2 implementation must pin it before applicability can be established. Sources: [E13](https://project-osrm.org/docs/v5.24.0/api/) |
| Timefold option/evolution | SUPPORTED_QUALIFIED_OPTION | final 406–423,686–699. Hard/soft feasibility and incremental/explained score are credible mechanisms. Latest 2.7.1 facts are conditional; history/fix totals are maintainer claims, domain-model and performance are not independently measured. Sources: [E16](https://docs.timefold.ai/), [E17](https://docs.timefold.ai/timefold-solver/latest/constraints-and-score/score-calculation), [E18](https://github.com/TimefoldAI/timefold-solver), [E19](https://optaplanner.io/the-history-of-optaplanner), [E20](https://timefold.ai/blog/optaplanner-fork) |
| Cal.com comparator | UNSUPPORTED_CATEGORICAL_REJECTION | final 484–492. Historical fairness pair has frozen-primary support, but current absence claims and intake-only rationale do not. Product/edition/release applicability must bound the comparison. Sources: [E25](https://cal.com/blog/why-cal-com-s-routing-forms-are-a-game-changer-for-scheduling), [E26](https://cal.com/features/requires-confirmation), [E27](https://next.cal.com/blog/cal-com-v5-1) |
| APG/assistive technology | SUPPORTED_PATTERN_BOUNDED_PROPOSAL | final 494–503,763–766. Listbox-combobox keyboard/focus contract is relevant; variants/native options and whole-task AT success are not guaranteed by a short pattern list. Sources: [E28](https://www.w3.org/WAI/ARIA/apg/patterns/combobox/) |
| First-release budget | UNESTABLISHED_ESTIMATE | final 33,560–569. Backend availability and a smaller topology do not prove labor/support total under $4,200. Planning qualification retained; fit not credited. Sources: [E06](https://pocketbase.io/docs/) |
| Other rejected/deferred approaches | SCOPED_ENGINEERING_JUDGMENT | final 505–509,639–684. Full payroll/native apps are explicitly out. Optional Valhalla/GraphHopper, manual pick, later solver and Postgres remain leads; black-box or commercial-default preferences are not counted as independently proved universal product defects. Sources: original brief / stated uncertainty / engineering judgment |

### Preservation and criticism adjudication

The final retains meaningful source facts and substantive options while correcting required routing, premature solver use and unresolved dual-store ownership. Exact requirement tokens, availability sensitivity, manual travel, policy disputes and budget/six-week limits survive in full prose. Predecessor Python speed and overly definite domain-model assertions are appropriately withdrawn/softened. The literal truncated critique is disclosed and only available detailed text/summary adjudicated. A narrow Cal.com source qualification is lost, leaving an unsound whole-product rejection; the newly added supportability recipe creates a separate material gap.

**M1 — ACCEPT.** Original manual estimate tracking does not require a routing service. Draft minimal-rules/OSRM-as-required correction was overreach. Final demotes the engine and defines honest manual annotations, retaining optional routing and its unknowns. (final lines 85–113, 369–396, 425–440). Evidence: [E13](https://project-osrm.org/docs/v5.24.0/api/).

**M2a — ACCEPT_WITH_CATEGORY_QUALIFICATION.** Availability sensitivity is an original requirement and is retained. Promoting its label from enhancement to correction makes the disposition clearer, but the label alone would not prove an operational omission when draft privacy prose already included it. (final lines 115–125, 295–324). Evidence: [E07](https://pocketbase.io/docs/api-rules-and-filters/).

**M2b — ACCEPT.** Exact-address-after-acceptance was an invented mandatory tier. The final keeps need-to-know while leaving precise disclosure timing to the cooperative. Custom topics receive explicit authorization/minimization responsibility rather than assumed rule inheritance. (final lines 127–147, 295–324). Evidence: [E08](https://pocketbase.io/docs/go-realtime/), [E10](https://pocketbase.io/docs/js-records/).

**M3 — ACCEPT.** The two-store seam lacked ownership/consistency/cost specifics. A single PocketBase store and sole atomic hold writer resolve the ambiguity in design. Official transaction semantics support plausibility; the real race test still gates acceptance. (final lines 150–163, 578–617). Evidence: [E09](https://pocketbase.io/docs/go-database/).

**M4 — ACCEPT_WITH_SCOPE_QUALIFICATION.** Solver deferral is sensible under this budget and review boundary, but no measurement proves a solver could never fit. The useful hard-before-soft invariant survives in manual R1 selection; unsupported Python performance is dropped and domain-model guidance is softened for R2. (final lines 165–187, 406–423). Evidence: [E16](https://docs.timefold.ai/), [E17](https://docs.timefold.ai/timefold-solver/latest/constraints-and-score/score-calculation), [E18](https://github.com/TimefoldAI/timefold-solver).

**M5 — ACCEPT_VISIBLE_SUMMARY_ONLY.** The nine mechanisms named in the visible summary are given full prose: availability entry, intake, notifications, roles, idempotency, phone recovery, export, costs and deployment. Cost fit is still unsubstantiated and deployment backup introduces N2-F2. The frozen critique literally stops after availability item 1 with a truncation marker; missing detailed subclaims cannot be adjudicated or invented. (final lines 189–201, 511–576). Evidence: [E06](https://pocketbase.io/docs/), [E11](https://pocketbase.io/docs/going-to-production/).

**M6 — MOSTLY_ACCEPT.** Primary project history supersedes predecessor snippets; moving docs are explicitly pinned or deferred. Maintainer bug totals remain attributed, not audited. Missing exact Red Hat announcement review is not misrepresented as independent verification. The frozen Cal.com narrow-page qualifier is nevertheless lost (N2-F1). (final lines 203–217, 686–714). Evidence: [E18](https://github.com/TimefoldAI/timefold-solver), [E19](https://optaplanner.io/the-history-of-optaplanner), [E20](https://timefold.ai/blog/optaplanner-fork), [E27](https://next.cal.com/blog/cal-com-v5-1).

**M7 — ACCEPT_WITH_MINOR_GAP.** Partial predicate support is closed; application predicate behavior is still proposed. Custom-topic tests address leakage rather than assumed inheritance; phone/idempotency mechanisms are concrete. V11 is the board-export oracle and does not actually validate the separate invoice CSV that also points to it. (final lines 219–231, 740–783). Evidence: [E02](https://www.postgresql.org/docs/18/sql-createtable.html), [E08](https://pocketbase.io/docs/go-realtime/), [E09](https://pocketbase.io/docs/go-database/).

Critic assertions rejected or qualified independently:

- Disposition label changes alone are not evidence of missing privacy behavior.
- Solver deferral is a prudent scope judgment, not a measured impossibility for every solver option.
- The narrow legacy round-robin page cannot establish all Cal.com feature absences.

### Proposed versus executed validation

Neither author supplies an executed application witness. Documentation fetches, source excerpts, static comparisons and hashes can establish what was read or preserved; they cannot establish double-offer safety, privacy, price, uptime or accessibility. No zero exit status was accepted as a scientific product oracle.

| Validation | Status | Independent assessment |
| --- | --- | --- |
| executed E1–E4 | DOCUMENTATION_ONLY | Reads, hashes, inherited primary excerpts and static reasoning only; no runtime witnesses. The evaluator independently checks major source claims and does not accept author exit-status or hash consistency as product quality. |
| V1 | PROPOSED | Real concurrent offers, sole writer, exactly one hold and duplicate-free retry distinguish check-then-write races. A persistent-state and losing-user result oracle is proposed; V1 must use the actual implementation and pinned release. |
| V2/V3 | PROPOSED | Half-open adjacency and inactive history versus active offers discriminate wrong bounds and predicates. PostgreSQL syntax is already documented; runtime exclusion and adapted PocketBase state behavior remain proposals. |
| V4 | PROPOSED | Manual label/method/timestamp and unknown handling apply to R1; engine units/profile sensitivity are separate optional gates, preserving release applicability. |
| V5 | PROPOSED | List/count/field/realtime/custom topic/error/URL privacy checks discriminate several leak paths and correct status-code exceptions; no actual redaction guarantee follows from their proposal. |
| V6/V7 | PROPOSED | Keyboard/SR interaction and exact client requirement tokens plus ineligible-before-fairness checks have meaningful task/eligibility oracles. A custom div is not intrinsically inaccessible; success depends on behavior. |
| V8/V9 | PROPOSED | Observed user misreading of UNFILLED and per-policy message/override counts are stronger oracles than merely checking status strings or test process success. |
| V10 | PROPOSED | Phone throttling/reconnect, visible pending/failure and reused idempotency keys test the stated R1 recovery mechanism; full offline queueing is not promised. |
| V11 | PROPOSED | Reproduction of board metrics from event logs with no PII is a meaningful independent export oracle. It does not exercise invoice CSV completeness/rate-reference mapping despite the invoice section pointing to it. |

### Minor findings and unresolved inputs

- **N2-m1** ([reviser/final.md:32–34](/home/sittingmongoose/PM-Experiments/er11-20261009-116bb1e4/jobs/B-05/control/reviser/final.md:32)): The introduction says buildable/operable inside $4,200, but the cost section has qualitative categories and recurring estimates, no build-hours/rate/contingency total. Its planning-estimates/coop-validates qualification prevents treating this as a measured price claim; budget feasibility remains unestablished and is not credited. Also [reviser/final.md:560–569](/home/sittingmongoose/PM-Experiments/er11-20261009-116bb1e4/jobs/B-05/control/reviser/final.md:560).
- **N2-m2** ([reviser/final.md:553–559](/home/sittingmongoose/PM-Experiments/er11-20261009-116bb1e4/jobs/B-05/control/reviser/final.md:553)): Invoice CSV is mapped to V11, whose stated oracle concerns aggregate board metrics rather than invoice columns/completion/rate-reference integrity. Meaningful export testing exists, but this mapping leaves an invoice-specific validation gap. Also [reviser/final.md:781–783](/home/sittingmongoose/PM-Experiments/er11-20261009-116bb1e4/jobs/B-05/control/reviser/final.md:781).
- **N2-m3** ([reviser/final.md:793–793](/home/sittingmongoose/PM-Experiments/er11-20261009-116bb1e4/jobs/B-05/control/reviser/final.md:793)): Closing one proven commit path is loose language. Repeated NO-runtime disclosures and a future V1 acceptance gate make this a proposed-to-be-proven path in context; no fabricated runtime witness is charged.
- **N2-m4** ([reviser/final.md:553–559](/home/sittingmongoose/PM-Experiments/er11-20261009-116bb1e4/jobs/B-05/control/reviser/final.md:553)): The separate payroll process consumes invoice CSV despite a no-payroll-connection clause. A manually exported invoice-ready file is compatible with the original invoice boundary; no pay computation or automatic payroll integration is specified.
- **N2-m5** ([reviser/final.md:594–595](/home/sittingmongoose/PM-Experiments/er11-20261009-116bb1e4/jobs/B-05/control/reviser/final.md:594)): Four coordinators imply few people, not proven tiny contention or a measured latency bound. A sole transactional writer is plausible, but needs its stated concurrent witness and application-path restrictions.

Unresolved externally, rather than silently established:

- No runtime, application sandbox, concurrency witness, accessibility task execution or actual deployment exists in the supplied scientific artifacts.
- Cooperative policy votes, precise client disclosure tiers, vocabulary/capability verification and real support capacity remain external decisions.
- Actual build/operating costs, site count, route coverage/traffic accuracy and six-week pilot measurements are not established.
- Public product guides establish capabilities/configuration warnings, not price, privacy configuration, legal sufficiency, coordinator-mobile success or full accessibility.
- The finer M5–M7 criticism prose is absent from the frozen truncated critique; visible summary/detail was assessed, no unseen criticism is inferred.

The FAIL grade is based on the material findings above. Honest pending user decisions and unavailable runtime are not independently scored as failures. No privacy breach, executed unsafe backup or fabricated full conformance test is alleged.

## Comparison, limits and native/cost separation

Neither arm is a full-quality pass. Two FAIL labels do not imply equal quality. N1 has a more cautious architecture/vendor selection gate and explicit stage/payload privacy; N2 has a more concrete single-store, availability-entry and phone/idempotency design, but unsound comparator reasoning and backup supportability. These are distinct supported observations, not an overall speed/quality victory.

Quality comparison eligibility is **false**. Scientific grades do not establish timing, token cost, native completion or T3 delivery beyond the exact input map. All unavailable candidate timing/token/billing/native values are null, never zero. The evaluator observed its own native Goal active; this complete assessment is saved and checked before requesting native completion. Supported lifecycle receipts are left to the native tool/conversation, not a handwritten Goal record.

Precise limits:

- Only exact B-05 inputs, original I05 brief/plan and relevant public primary evidence were used. No candidate repair or science feedback was sent.
- All available final/stage/source-index text was reviewed; byte-identical source copies were compared. The frozen N2 critique contains a literal truncation marker, not a reviewer-imposed output cap.
- Old Cal.com GitBook could not be independently retrieved; its bounded frozen primary excerpts support the historical fairness pair only. Current vendor releases/features directly test whole-product conclusions.
- No application/runtime sandbox exists; no experimental behavior, merged fix, actual support cost, qualified accessibility result or legal assessment was manufactured.
- Public moving documentation is identified by observed version/edition/access date and stable release sources where available. Exact release implementation still requires the candidate’s proposed gate.
- No R9/ledger protocol, nested worker, account/config/service/Git/canon edit or executable download was used.

## Source registry

Full version/section notes and frozen-input hashes are in [source-map.json](source-map.json). The links below identify the primary evidence used; they are not a popularity or citation score.

| ID | Primary source | Release/edition and locator |
| --- | --- | --- |
| E01 | [https://www.postgresql.org/docs/18/rangetypes.html](https://www.postgresql.org/docs/18/rangetypes.html) | PostgreSQL 18; 8.17.1, 8.17.3, 8.17.6, 8.17.10 |
| E02 | [https://www.postgresql.org/docs/18/sql-createtable.html](https://www.postgresql.org/docs/18/sql-createtable.html) | PostgreSQL 18; EXCLUDE clause; WHERE (predicate), lines 321–326 |
| E03 | [https://www.postgresql.org/docs/18/btree-gist.html](https://www.postgresql.org/docs/18/btree-gist.html) | PostgreSQL 18; F.8 introduction; supported scalar types and trusted extension |
| E04 | [https://www.postgresql.org/docs/18/errcodes-appendix.html](https://www.postgresql.org/docs/18/errcodes-appendix.html) | 18 documentation; page identifies 18.6; Table A.1, 23P01 and 42501 |
| E05 | [https://supabase.com/docs/guides/database/postgres/row-level-security](https://supabase.com/docs/guides/database/postgres/row-level-security) | Live official guide, accessed 2026-10-09; grants versus RLS; policy tests denial table, lines 1314–1320; service keys; views |
| E06 | [https://pocketbase.io/docs/](https://pocketbase.io/docs/) | Official docs displaying v0.40.5; Introduction; pre-1.0 compatibility warning |
| E07 | [https://pocketbase.io/docs/api-rules-and-filters/](https://pocketbase.io/docs/api-rules-and-filters/) | Official docs displaying v0.40.5; five rules, default null, filter behavior and status exceptions |
| E08 | [https://pocketbase.io/docs/go-realtime/](https://pocketbase.io/docs/go-realtime/) | Official docs displaying v0.40.5; custom-topic example, HasSubscription, clients.Send and auth key |
| E09 | [https://pocketbase.io/docs/go-database/](https://pocketbase.io/docs/go-database/) | Official docs displaying v0.40.5; Transaction; app.RunInTransaction, callback txApp, lines 170–180 |
| E10 | [https://pocketbase.io/docs/js-records/](https://pocketbase.io/docs/js-records/) | Official docs displaying v0.40.5; Hide/Unhide fields; onRecordEnrich, lines 29–36 |
| E11 | [https://pocketbase.io/docs/going-to-production/](https://pocketbase.io/docs/going-to-production/) | Official docs displaying v0.40.5; builtin backup v0.16+; Backup and Restore, lines 67–77 |
| E12 | [https://raw.githubusercontent.com/pocketbase/pocketbase/v0.40.5/CHANGELOG.md](https://raw.githubusercontent.com/pocketbase/pocketbase/v0.40.5/CHANGELOG.md) | Tag v0.40.5; v0.40.0 exit-code change; v0.40.4 migration deadlock #7836; v0.40.5 JSVM hardening |
| E13 | [https://project-osrm.org/docs/v5.24.0/api/](https://project-osrm.org/docs/v5.24.0/api/) | OSRM v5.24.0; General options; HTTP server; Table; Trip; example numeric matrices |
| E14 | [https://stately.ai/docs/xstate](https://stately.ai/docs/xstate) | XState v5 docs; createMachine/createActor examples; actor model |
| E15 | [https://stately.ai/docs/migration](https://stately.ai/docs/migration) | XState v4 to v5; TypeScript 5 requirement; Machine/interpret/withConfig renames |
| E16 | [https://docs.timefold.ai/](https://docs.timefold.ai/) | Live product documentation index; Models, Solver and Platform |
| E17 | [https://docs.timefold.ai/timefold-solver/latest/constraints-and-score/score-calculation](https://docs.timefold.ai/timefold-solver/latest/constraints-and-score/score-calculation) | Latest page displayed 2.7.1; Hard/soft levels; incremental constraint streams; score explanations |
| E18 | [https://github.com/TimefoldAI/timefold-solver](https://github.com/TimefoldAI/timefold-solver) | Current main README, not a pinned commit; Build from source; Editions; Legal notice, lines 237–270 |
| E19 | [https://optaplanner.io/the-history-of-optaplanner](https://optaplanner.io/the-history-of-optaplanner) | Maintainer-side history; End of life and Continuation, lines 25–40 |
| E20 | [https://timefold.ai/blog/optaplanner-fork](https://timefold.ai/blog/optaplanner-fork) | May 2, 2023 announcement; Date and opening article, lines 110–138 |
| E21 | [https://cal.com/docs/api-reference/v2/introduction](https://cal.com/docs/api-reference/v2/introduction) | Cal.com API v2 live guide; OAuth/API key authentication; rate limits; Platform migration notice |
| E22 | [https://github.com/calcom/cal.diy/issues/29958](https://github.com/calcom/cal.diy/issues/29958) | Open report; environment main 2026-08-13; confirm.handler.ts; proposed lock/transaction/CAS; suggested concurrent test |
| E23 | [https://github.com/calcom/cal.diy/issues/29967](https://github.com/calcom/cal.diy/issues/29967) | Open report; environment main 2026-08-13; getBusyTimes.ts; PENDING filter; linked commit 10ad77e |
| E24 | [https://github.com/calcom/cal.diy/issues/29968](https://github.com/calcom/cal.diy/issues/29968) | Issue report, not release proof; Issue title and linked family |
| E25 | [https://cal.com/blog/why-cal-com-s-routing-forms-are-a-game-changer-for-scheduling](https://cal.com/blog/why-cal-com-s-routing-forms-are-a-game-changer-for-scheduling) | Vendor product article March 3, 2025, v5.0; Attributes and dynamic routing; explicit fallback, lines 115–128 |
| E26 | [https://cal.com/features/requires-confirmation](https://cal.com/features/requires-confirmation) | Live official feature page; Opt-in bookings, lines 91–119 |
| E27 | [https://next.cal.com/blog/cal-com-v5-1](https://next.cal.com/blog/cal-com-v5-1) | Cal.com v5.1 release post March 14, 2025; Weighted attribute routing and fairness reset interval |
| E28 | [https://www.w3.org/WAI/ARIA/apg/patterns/combobox/](https://www.w3.org/WAI/ARIA/apg/patterns/combobox/) | Live APG, normative claims bounded to pattern; Keyboard interaction and Roles/States/Properties; variants |
| E29 | [https://www.w3.org/WAI/test-evaluate/tools/selecting/](https://www.w3.org/WAI/test-evaluate/tools/selecting/) | W3C WAI official guidance; What evaluation tools can and cannot do |
| E30 | [https://www.w3.org/TR/2024/REC-WCAG22-20241212/](https://www.w3.org/TR/2024/REC-WCAG22-20241212/) | WCAG 2.2 Recommendation December 12, 2024; 2.1.1, 2.5.7, 2.5.8, 3.3.1–2, 4.1.2–3 |
| E31 | [https://docs.novu.co/](https://docs.novu.co/) | Live Novu documentation; Notify channels, Inbox and workflows |
| E32 | [https://github.com/novuhq/novu](https://github.com/novuhq/novu) | Current main README, not a pinned commit; Communication infrastructure; embeddable preferences |
| E33 | [https://www.novu.co/changelog/novu-community-edition-v220-self-hosting/](https://www.novu.co/changelog/novu-community-edition-v220-self-hosting/) | Community Edition v2.2.0, May 18, 2025; Self-hosted release and dashboard workflow/preferences |
| E34 | [https://interpreterintelligence.zendesk.com/hc/en-us/articles/12922072819483-Scheduler](https://interpreterintelligence.zendesk.com/hc/en-us/articles/12922072819483-Scheduler) | Vendor guide updated December 6, 2023; eligibility filtering, scheduler timezone and offer actions |
| E35 | [https://interpreterintelligence.zendesk.com/hc/en-us/articles/15410092403483-Availability-and-Double-Booking-Buffers](https://interpreterintelligence.zendesk.com/hc/en-us/articles/15410092403483-Availability-and-Double-Booking-Buffers) | Vendor guide updated September 29, 2023; offer pool, acceptance warning, negative/global buffers |
| E36 | [https://interpreterintelligence.zendesk.com/hc/en-us/articles/12922582860955-Interpreter-Portal-Desktop-Site-Mobile-App](https://interpreterintelligence.zendesk.com/hc/en-us/articles/12922582860955-Interpreter-Portal-Desktop-Site-Mobile-App) | Vendor guide updated June 24, 2026; Availability; accept/decline; mobile job closing |
| E37 | [https://interpreter.io/](https://interpreter.io/) | Live vendor public page; Homepage retrieval |

Evaluation started: 2026-10-09T20:49:36Z (observed activation basis). Assessment serialization: 2026-10-09T21:05:47.371435+00:00. Deadline: 2026-10-09T21:14:21.114298+00:00. Scientific work concludes before native terminal action.
