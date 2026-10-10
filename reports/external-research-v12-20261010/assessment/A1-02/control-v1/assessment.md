# Independent ER12 full-pipeline assessment — A1-02 control v1

**Source judgment: FAIL.** One remaining material root finding (F01) affects the final DST rule, an accepted criticism of rrule2, and the generated-gap validation oracle. The substantial supported parts of the proposal and honest unexecuted status do not remove that issue. This is a source/planning assessment, not an assertion of deployed data loss.

The complete declared single-arm scope was assessed before the 45-minute cap. All six axes, C1–C6, six negative constraints, 21 exact substantive plan clauses, the complete three-stage artifacts/maps/assignments/freezes, all authored source indexes, embedded criticism dispositions, and every original proposed validation case were read. No other arms/results/history or ER11 were read. No nested agents, candidate assistance/repair, account changes, Git or publication occurred.

Navigation: [structured assessment](assessment.json), [independent source map](source-map.json), [primary evidence index](evidence/index.md), [original inspected hashes](inspected-originals.json), [actual reviewer native observations](reviewer-native-observation.json).

Original science: [discovery.md](ER12_RUNTIME/runs/A1-02/control/stages/investigator/discovery.md), [draft.md](ER12_RUNTIME/runs/A1-02/control/stages/investigator/draft.md), [critique.md](ER12_RUNTIME/runs/A1-02/control/stages/critic/critique.md), [final.md](ER12_RUNTIME/runs/A1-02/control/stages/reviser/final.md), [frozen brief](ER12_RUNTIME/frozen-inputs/A1-02/brief.md), [frozen plan](ER12_RUNTIME/frozen-inputs/A1-02/plan.md).

## Decisive material finding F01

The final states that a rule-generated nonexistent local time must be skipped/not counted as RFC policy ([final 49](ER12_RUNTIME/runs/A1-02/control/stages/reviser/final.md:49)), calls rrule2’s documented generated pre-gap-offset behavior a standards divergence ([final 76](ER12_RUNTIME/runs/A1-02/control/stages/reviser/final.md:76)), accepts that criticism ([final 111](ER12_RUNTIME/runs/A1-02/control/stages/reviser/final.md:111)), and uses skipping as the proposed oracle ([final 97](ER12_RUNTIME/runs/A1-02/control/stages/reviser/final.md:97)). The original RFC’s early §3.3.10 paragraph contains that skip wording, but its later paragraph on page 44 directs computed nonexistent/fold local starts to explicit DATE-TIME interpretation. Verified technical erratum 4271, verified 2015-02-17, resolves the contradiction: invalid dates remain ignored; generated nonexistent local times use §3.3.5. The rrule2 0.15.0 README’s documented gap treatment agrees with that corrected condition.

Primary proof: [actual Verified erratum 4271](https://www.rfc-editor.org/errata/eid4271), [captured record E18](evidence/E18-lines.txt) lines 8–41; [original RFC E01](evidence/E01-lines.txt) lines 2424–2428 **and**2536–2540; [versioned rrule2 README E13](evidence/E13-lines.txt) lines 187–200. The [inline rendering E15](evidence/E15-lines.txt) is an informative check only; the actual erratum and original conflicting text are the evidence.

This is consequential even though a typical 18:30 rehearsal may never hit a gap. The accepted weekly local-time profile has no gap-time exclusion, C3 requires a nonexistent-time policy, the dependency qualification rationale is wrong, and the future test could reject an erratum-aligned engine while accepting one that omits the occurrence. Skipping could be an explicit product choice, but the frozen final presents it as a settled RFC requirement. No product fixture, parser, engine, database or provider was actually run. These are three consequences of one root issue, not three independent findings.

## Six-axis assessment

### Axis 1 — Original obligations and negative constraints

Coverage: **fully assessed**. Outcome: `COVERED_WITH_MATERIAL_ERROR`.

C1–C6 are all addressed, and each negative constraint is maintained as a proposed boundary. C1 identity, C2 ordinary cancel/move and existing-override handling, C4 provider comparison, C5 loss-aware/idempotent import, and C6 honest validation/unsupported status are substantive. C3’s asserted generated-gap policy is materially wrong; structural clause coverage does not qualify its source meaning.

Evidence claims: SC01, SC02, SC04, SC05, SC07, SC13, SC14 in [source-map.json](source-map.json).

### Axis 2 — Consequential claims, exact subject/operation/version/default/unit/type/domain/exceptions

Coverage: **fully assessed**. Outcome: `MATERIAL_ERROR`.

The 19-claim independent map distinguishes RFC file semantics, provider operation contracts, public package documentation, and unexecuted design choices. Most subject/type/default/condition claims are supported. F01 survives in the final: original RFC §3.3.10 is internally contradictory and verified erratum 4271 resolves the generated-time condition. Minor carried aimcal release metadata and Graph retrieval locators are separately bounded.

Evidence claims: SC01, SC02, SC03, SC05, SC06, SC07, SC08, SC09, SC10, SC11, SC12, SC15, SC16, SC17 in [source-map.json](source-map.json).

### Axis 3 — Useful unfamiliar discovery, alternatives, implementation/history and opportunity breadth

Coverage: **fully assessed**. Outcome: `USEFUL_BREADTH_WITH_MATERIAL_HISTORY_MISS`.

Discovery is substantive, not vacuous caution: detached-original-slot editing, EXDATE precedence/DTSTART retention, Google immutable originalStartTime, Graph UTC originalStart and adjacent-day limits, parser-versus-validator distinction, retained-property model, recurrence candidate limits, and source-scoped upsert are useful. It compares Google and Graph operations, component/raw-property retention approaches, ical-rs versus aimcal-ical, and rrule2 rather than installing a library without qualification. Archive history is relevant. The consequential standards-history investigation missed verified erratum 4271, already available since 2015, which undermines the DST/dependency judgment. No unrelated provider/service breadth is demanded.

Evidence claims: SC04, SC08, SC10, SC11, SC12, SC15, SC16, SC17, SC07 in [source-map.json](source-map.json).

### Axis 4 — Wrong criticism, corrections, rejections and every exact plan disposition

Coverage: **fully assessed**. Outcome: `MATERIAL_FALSE_CORRECTION`.

Critic 1’s request for a deterministic weekly subset is useful without making optional RFC parts mandatory; final explicitly chooses a narrower valid subset. Critic 2’s explicit type/local-form validation is supported; matching TZID is a product profile restriction. Critic 3 is materially wrong in current governing context and final accepts it. The original user’s new-UID/current-start/authoritative-UTC-row hypotheses are correctly rejected or amended. The additional VALUE/property explanation is correct, with limited retrospective defect attribution.

Evidence claims: SC01, SC03, SC07, SC13, SC17 in [source-map.json](source-map.json).

### Axis 5 — Supported discovery/draft/critique/final meaning preserved

Coverage: **fully assessed**. Outcome: `MOST_SCOPE_PRESERVED_BUT_SUPPORTED_SOURCE_MEANING_MISADJUDICATED`.

Master/original-slot identity, local zone data, ordinary cancellation, exception movement, narrow scope, loss-aware retention, source-scoped upsert, provider boundaries, alternatives, and honest validation status survive all stages. The final adds an explicit profile and type checks instead of replacing substance with predecessor IDs. The investigator’s general rrule2 gap-documentation characterization was not disproved by the corrected standard; the critic falsely recasts it as a divergence and the final repeats that rejection. The investigator’s own separate skip-policy text was already wrong and remains. These are traced separately, without pretending the final repaired them.

Evidence claims: SC01, SC04, SC05, SC07, SC13, SC14, SC15, SC16, SC17 in [source-map.json](source-map.json).

### Axis 6 — Meaningful proposed versus executed validation and oracle applicability

Coverage: **fully assessed**. Outcome: `HONEST_STATUS_BUT_MATERIAL_ORACLE_ERROR`.

The matrix gives observable identity, offset, component/payload, cardinality and no-mutation invariants. All seven original proposed cases remain; actual execution is consistently none. Local round-trip is correctly separated from provider interoperability. However the additional generated-gap row uses the erroneous skip/noncount oracle and can approve the wrong policy or reject a documented erratum-aligned engine. An ordinary 18:30 clock-change fixture is not a gap-policy discriminator. Hash checks and documentation reads are not product validation.

Evidence claims: SC06, SC07, SC13, SC14, SC18, SC19 in [source-map.json](source-map.json).

## Every original final obligation

| Clause | Exact frozen obligation | Independent assessment | Final locator |
|---|---|---|---|
| C1 | Define series and occurrence identity, including how a moved occurrence refers to its original position. | **SUPPORTED** — Stable source-slot+UID and typed original RID; move changes actual start, not original identity. | [final 23–29](ER12_RUNTIME/runs/A1-02/control/stages/reviser/final.md:23) |
| C2 | Explain cancellation versus moving an instance, and the relevant interactions between recurrence rules, exclusions, and overrides within the supported subset. | **SUPPORTED_WITH_EXPLICIT_BOUNDARY** — Recurrence inclusion/exclusion precedence, same-UID move and ordinary cancellation are described; existing override movement is in place; unresolved override+EXDATE cancellation is refused; no future-range edit. | [final 31–39](ER12_RUNTIME/runs/A1-02/control/stages/reviser/final.md:31) |
| C3 | Specify local time/time-zone handling across a daylight-saving boundary and disclose ambiguous/nonexistent-time policy rather than assuming a fixed UTC offset. | **MATERIAL_ERROR_F01** — Zoned wall-time preservation and explicit fold/gap policy are supported; generated-gap omission asserted as RFC law misses verified erratum 4271 and later original context. | [final 41–51](ER12_RUNTIME/runs/A1-02/control/stages/reviser/final.md:41) |
| C4 | Compare at least two provider/analogous mechanisms at the operation level and explain which concepts transfer to file interchange and which do not. | **SUPPORTED** — Google v3 retrieve/PUT/status and Graph v1.0 list/PATCH/Cancel/Delete are compared at operation level; identities, UTC/default/header and provider boundaries are not copied as file guarantees. | [final 53–62](ER12_RUNTIME/runs/A1-02/control/stages/reviser/final.md:53) |
| C5 | Describe preservation of unknown properties, idempotent repeat import, and round-trip risks; connect a relevant implementation or history detail to the compatibility decision. | **SUPPORTED_CORE_WITH_F01_DEPENDENCY_ERROR** — Component-owned opaque fields, raw bytes where feasible, normalization limits and idempotent transaction keys are described; archived parser warning supports compatibility caution. rrule2 rejection rationale is false; carried candidate date is a minor error. | [final 64–78](ER12_RUNTIME/runs/A1-02/control/stages/reviser/final.md:64) |
| C6 | Separate supported behavior, unverified assumptions, and proposed-versus-executed validation; state what unsupported inputs do. | **SUPPORTED_STATUS_WITH_F01_ORACLE_ERROR** — Supported/assumed/unsupported/proposed/executed are separated. No executed validation is claimed. Specific diagnostic/no-mutation policy is useful; generated-gap future oracle is materially wrong. | [final 80–114](ER12_RUNTIME/runs/A1-02/control/stages/reviser/final.md:80) |

## Negative constraints

| ID | Exact negative constraint | Judgment | Basis |
|---|---|---|---|
| N1 | no full calendar application | HONORED | Local adapter and existing UI; no whole calendar redesign. |
| N2 | no account/API access | HONORED_IN_SCIENCE_AND_REPORTED_WORK | Documentation comparisons only; no provider calls. Full runtime transcript is not available to independently prove all candidate operations. |
| N3 | no mass editing of all future instances | HONORED | THISANDFUTURE and master-rule changes are refused. |
| N4 | no silent drop of unknown properties | HONORED_AS_PROPOSAL | Retain component payload/parameters/raw bytes where feasible or block export; no serializer fidelity claim. |
| N5 | no conversion of recurring local wall time into a permanent fixed UTC schedule | HONORED | Master/rule/TZID remain canonical; preview is bounded, not persistent UTC schedule. |
| N6 | no claim of interoperability without testing | HONORED | No provider interoperability assertion; optional comparison remains unrun. |

## Every exact substantive plan clause and disposition

The original plan is a set of hypotheses, not a standard interpretation. These 21 clauses exhaust the substantive text at frozen plan lines 6,8,10,12,14. The original reveal/title/fixture/FINALIZED context was read and is recorded separately, without turning it into a product obligation.

| ID | Exact original clause | Disposition and reason | Final locator |
|---|---|---|---|
| P01 | My first idea stores the series UID and occurrence start timestamp as a composite key. | **AMEND** — Retain UID but replace current-start timestamp with typed original-slot identity. | [final 23–29](ER12_RUNTIME/runs/A1-02/control/stages/reviser/final.md:23) |
| P02 | For a weekly 18:30 rehearsal, expand eight weeks in advance, convert starts to UTC, and keep those rows as the schedule. | **REJECT_AUTHORITATIVE_STORAGE_RETAIN_UI_PREVIEW** — Eight-week window remains display convenience; local recurrence is canonical, no invented end. | [final 7–9](ER12_RUNTIME/runs/A1-02/control/stages/reviser/final.md:7) |
| P03 | When staff cancel a row, remove it and add its start time to an exclusion list. | **AMEND** — Do not delete authoritative generated row; add original slot EXDATE for ordinary cancel and retain master. | [final 31–39](ER12_RUNTIME/runs/A1-02/control/stages/reviser/final.md:31) |
| P04 | When they move a row, add a standalone event with a new UID and the replacement start. | **REJECT** — New UID/standalone move severs relation; use same-UID detached original RID. | [final 23–35](ER12_RUNTIME/runs/A1-02/control/stages/reviser/final.md:23) |
| P05 | I have not checked whether this preserves the relationship to the original instance or what re-import does. | **RESOLVE_PROPOSAL_NOT_EXECUTION** — Original-slot relationship and same-source reimport invariants are explicit, still untested. | [final 25–29](ER12_RUNTIME/runs/A1-02/control/stages/reviser/final.md:25) |
| P06 | I would like the first release to retain local 18:30 across clock changes. | **RETAIN_WITH_F01_EDGE_ERROR** — Recurring18:30 stays local over normal clock changes; the broader generated-gap policy is wrong. | [final 41–51](ER12_RUNTIME/runs/A1-02/control/stages/reviser/final.md:41) |
| P07 | The expansion window is a UI convenience, not an assertion that the series ends there. | **RETAIN** — Window is a UI convenience; no eight-week series end. | [final 7–21](ER12_RUNTIME/runs/A1-02/control/stages/reviser/final.md:7) |
| P08 | The draft does not specify whether an occurrence key uses the originally scheduled start or the current moved start, and it does not explain how an already imported exception is merged. | **RESOLVE** — Use original nominal start and update imported override in place for move; cancellation collision is explicitly refused. | [final 23–39](ER12_RUNTIME/runs/A1-02/control/stages/reviser/final.md:23) |
| P09 | Please resolve those choices rather than implementing the sketch literally. | **RESOLVE** — Sketch is not implemented literally; important identity/UTC/new-UID choices are adjudicated. | [final 7–39](ER12_RUNTIME/runs/A1-02/control/stages/reviser/final.md:7) |
| P10 | I remember provider APIs offering instance-edit operations, but do not know whether their event IDs or cancellation semantics can be carried unchanged into .ics files. | **INVESTIGATE_AND_BOUND** — Two first-party provider operation families reviewed; API IDs/tombstones/message semantics are not interchange guarantees. | [final 53–62](ER12_RUNTIME/runs/A1-02/control/stages/reviser/final.md:53) |
| P11 | Research the mechanism and conditions before treating an API operation as an interchange guarantee. | **RETAIN** — Operations/conditions are compared and no interoperability claimed. | [final 53–62](ER12_RUNTIME/runs/A1-02/control/stages/reviser/final.md:53) |
| P12 | An existing Rust calendar library would be welcome if its actual support is adequate; I have not selected or installed one. | **RETAIN_PROVISIONAL_WITH_F01_FALSE_REJECTION** — Several actual Rust candidate contracts examined; none selected/installed/tested. Gap-based rejection of rrule2 is unsupported. | [final 72–78](ER12_RUNTIME/runs/A1-02/control/stages/reviser/final.md:72) |
| P13 | Preserve C1–C6 and all negative constraints. | **STRUCTURALLY_RETAIN_WITH_C3_ERROR** — All C1–C6 and negatives appear; F01 defeats complete source qualification. | [final 23–118](ER12_RUNTIME/runs/A1-02/control/stages/reviser/final.md:23) |
| P14 | Keep the feature to one supported weekly-series subset and a single-instance operation. | **RETAIN** — Exact narrow weekly grammar and one-slot operation, including strict refusals of broader recurrence parts. | [final 11–21](ER12_RUNTIME/runs/A1-02/control/stages/reviser/final.md:11) |
| P15 | Preserve opaque properties verbatim where feasible; disclose any transformation that cannot safely round-trip. | **RETAIN_WITH_IMPLEMENTATION_LIMIT** — Preserve owned unknown data/raw content where feasible; disclose normalization and block unsafe export. | [final 64–70](ER12_RUNTIME/runs/A1-02/control/stages/reviser/final.md:64) |
| P16 | Unsupported recurrence forms should be surfaced explicitly without rewriting the original file. | **RETAIN** — Unsupported rule/type/zone/duplicate/conflict input returns specific refusal before mutation/export. | [final 86–86](ER12_RUNTIME/runs/A1-02/control/stages/reviser/final.md:86) |
| P17 | No server synchronization or conflict resolution service is required. | **RETAIN** — No provider sync/conflict service required or proposed. | [final 7–7](ER12_RUNTIME/runs/A1-02/control/stages/reviser/final.md:7) |
| P18 | Proposed validation only: synthetic weekly rehearsals around a clock change; one cancelled occurrence; one moved across a date boundary; an existing override; importing the same export twice; an unknown property; an unsupported recurrence form. | **RETAIN_ALL_SEVEN_PROPOSED_CASES** — Each original case survives; cross-date move is explicit in preserved choices and covered by original-RID invariant. Added generated-gap row has F01. | [final 90–118](ER12_RUNTIME/runs/A1-02/control/stages/reviser/final.md:90) |
| P19 | Define an observable identity/time/preservation invariant for each. | **MEANINGFUL_WITH_F01_ORACLE_ERROR** — Identity/time/preservation/no-mutation invariants exist; extra generated-gap expected result is wrong. | [final 94–105](ER12_RUNTIME/runs/A1-02/control/stages/reviser/final.md:94) |
| P20 | A local parser round-trip would not prove compatibility with a live provider. | **RETAIN** — Local parser round-trip is expressly not live-provider compatibility proof. | [final 78–78](ER12_RUNTIME/runs/A1-02/control/stages/reviser/final.md:78) |
| P21 | No files have been imported, exported, or tested yet. | **RETAIN_CONTEXT_NO_EXECUTION** — Neither original stage science nor final claims actual import/export/product testing. | [final 88–105](ER12_RUNTIME/runs/A1-02/control/stages/reviser/final.md:88) |

## Criticism dispositions and lineage

- **CR1** — Material incomplete: weekly RRULE profile is not an exact allow-list. Final: `accept`. Independent: **SUPPORTED_CLARIFICATION**. Useful deterministic subset clarification. No new duty to support COUNT/UNTIL/WKST is imposed; the final expressly refuses them as product policy, while RFC permits relevant forms.
- **CR2** — Material incomplete: RECURRENCE-ID type compatibility not explicit. Final: `accept`. Independent: **SUPPORTED_CLARIFICATION**. RFC type/local-form rule is real. Discovery already had typed keys, valid same-type dates, and malformed-value refusals; explicit checks make the design deterministic. Same TZID is a declared narrower product rule, not universal RFC text.
- **CR3** — Material wrong: rrule2 generated gap treatment is not RFC-style. Final: `accept`. Independent: **MATERIAL_WRONG_CRITICISM_ACCEPTED**. Critic omits RFC later paragraph and verified erratum 4271. Documented generated pre-gap-offset treatment is consistent with corrected guidance; lack of execution may keep the whole crate unqualified, but does not support this nonconformance allegation.
- **CR4-additional** — Final adds unknown-property versus unknown-VALUE imprecision amendment. Final: `amend`. Independent: **CORRECT_CLARIFICATION_WITH_RETROSPECTIVE_WORDING_LIMIT**. The standard/user-requirement distinction is correct. Original prose explicitly said VALUE/value-type, so the record does not elevate it to a proven material original defect.
- **CR5-uncertainty** — EXDATE+override external composition; intended VTIMEZONE; actual library/writer behavior unresolved. Final: `retain uncertainty`. Independent: **HONEST_BOUNDED_UNCERTAINTY**. These are external compatibility/owner choices and future qualification tests. No nonexistent deployment or provider access is required. Fail-closed local boundary is explicit.

The investigator’s own generated-gap skip rule is a lineage defect, preserved through draft/critique/final. Its description of the crate’s documented gap treatment as RFC-style is not disproved by the corrected standard; the critic creates a false correction and the final expands it into a dependency rejection. The exact input-profile and temporal-type concerns are legitimately clarified in the final. The unknown-VALUE/property amendment explains a valid distinction, but literal predecessor prose already used VALUE/value-type, so no additional material predecessor defect is invented.

## Useful discoveries, alternatives and history

- **D1** Original-slot identity survives a move across date; a new UID or current-start key loses the recurrence relation. Evidence: SC01, SC08, SC10.
- **D2** EXDATE precedence and retention of an excluded DTSTART distinguish a durable file edit from deleting a preview row. Evidence: SC02, SC04.
- **D3** Provider operations transfer identity concepts, but API IDs, authorization, tombstones, notifications and Graph boundary limits are not file rules. Evidence: SC08, SC09, SC10, SC11, SC12.
- **D4** Loss-aware component/property retention versus typed calendar-root model; archived ical-rs parse acceptance is not validity or round-trip proof. Evidence: SC13, SC15, SC16.
- **D5** Provisional recurrence engine has Chrono-Tz/date/iteration limits and vendor-described mismatched-DTSTART divergence; selection must not imply arbitrary VTIMEZONE or executed conformity. Evidence: SC17.
- **D6** Stable local source slot, original RID and transactional upsert separate idempotent import from server sync or permanent expanded rows. Evidence: SC14.
- **D7** Reviewer-only discovery: Independent governing-history discovery: verified erratum 4271 resolves the original RFC generated-gap contradiction; candidate pipeline missed it. Evidence: SC07, SC17, SC18.

Google and Graph are distinct operation-level analogues, not proposed integrations. Property-tree/raw-line retention and typed retained-property modeling are meaningful alternative implementation approaches; rrule2 remains a recurrence candidate rather than a selected dependency. The archived parser validity warning is a relevant history lead. The standards erratum is the consequential history omission. No obligation to build a calendar server, survey every provider, install a library or run nonexistent deployments is added.

## Proposed/executed validation and oracle applicability

**Executed product validation: none.** Hash verification and independent documentation retrieval are reviewer evidence operations, not import/export/DST/SQLite/provider validation. Every matrix entry remains prospective.

| ID | Original or additional case | Observable invariant / applicability | Execution |
|---|---|---|---|
| V1 | synthetic weekly rehearsals around a clock change | Same local weekday/time and different expected zone offsets; source master remains local. **APPLICABLE_FOR_OFFSET_CHANGES_NOT_GAP_POLICY** | Not executed |
| V2 | one cancelled occurrence | Original slot alone is excluded by EXDATE; UID/DTSTART/master and other slots survive. **APPLICABLE_WITH_DECLARED_OVERRIDE_BOUNDARY** | Not executed |
| V3 | one moved across a date boundary | Same UID and original RID; actual date/start/end change; other slots/master unchanged. Cross-date variant is retained in [final 118](ER12_RUNTIME/runs/A1-02/control/stages/reviser/final.md:118) and original draft 65. **APPLICABLE_WITH_MINOR_MATRIX_LOCATOR_LIMIT** | Not executed |
| V4 | an existing override | Update that component in place with original slot stable; unrelated fields survive. Override+EXDATE collision refuses without mutation. **APPLICABLE_FOR_SUPPORTED_MOVE** | Not executed |
| V5 | importing the same export twice | Same source slot, stable series/exception keys/counts, no new UID/duplicate override; compare semantic model, byte identity separately. **APPLICABLE_FOR_LOCAL_IDEMPOTENCE_NOT_CROSS_FILE_SYNC** | Not executed |
| V6 | an unknown property | Payload/parameters/multiplicity/owner preserved on no-op and move; raw data required where opaque semantics cannot be interpreted; normalization disclosed, unsafe export blocked. **APPLICABLE_PRESERVATION_CHECK** | Not executed |
| V7 | an unsupported recurrence form | Specific refusal and unchanged database/original bytes/no partial export; matrix 103 extends temporal/type/range/zone boundaries. **APPLICABLE_NO_MUTATION_CHECK** | Not executed |
| V8-added | explicit fold and spring-gap DATE-TIME | First fold occurrence; pre-gap offset for explicit gap with retained local value. **SUPPORTED_PRIMARY_ORACLE** | Not executed |
| V9-added | generated gap and fold dates | Final expects generated gap skip/noncount and earlier fold. Earlier fold is supported; gap expectation contradicts verified erratum 4271. **MATERIAL_WRONG_ORACLE_F01** | Not executed |
| V10-added | version-pinned parser/writer/engine and optional providers | Future component/recurrence/limits tests; optional actual named provider comparison remains separately authorized and unrun. **PROPOSED_ONLY_NOT_INTEROPERABILITY_PROOF** | Not executed |

The original seven-case matrix is meaningfully preserved. The final’s cross-date move is clear in its preserved-plan statement and same-original-RID invariant, though the revised row 98 could label that variant more explicitly. Self-consistent local round-trip is not an independent correctness oracle: compare identity to the original slot, zone instants to governing rules, opaque data to original retained bytes/parameters, and unsupported cases to unchanged state. No test result is inferred. The added generated-gap oracle is the material failure, not the absence of running a proposed-only test.

## Limitations and honest unresolved choices

- **L01 (minor metadata/lineage error, nonmaterial)** — aimcal-ical 0.12.1 release 2026-07-10 in predecessor maps is not corroborated. The versioned crate list and public registry show 2026-04-25; Rustdoc’s header gives a different build/display date. Final carries the predecessor claim as such; no library adequacy decision depends on the date.
- **L02 (bounded compatibility/implementation uncertainty, nonmaterial)** — No chosen parser/writer/recurrence engine has been executed. Calendar-root retained fields do not establish VEVENT mutation fidelity, arbitrary VTIMEZONE handling, byte identity, or cross-client interchange. The final is explicit about those limits; they are not failures for this proposed-only task.
- **L03 (overstated retrospective clarification, nonmaterial)** — The final’s additional unknown-property/unknown-VALUE amendment is substantively correct, but the original discovery and draft already explicitly said VALUE/value-type. Their broad property-preservation proposal was required by the brief. Treat the amendment as attribution clarification, not evidence of a newly demonstrated material predecessor defect.
- **L04 (bounded operation coverage, nonmaterial)** — Cancellation of an already overridden target remains explicitly fail-closed pending a tested representation; moving such a target is described. This does not falsely claim complete external compatibility. The brief permits a supported subset and explicit unsupported cases, so this declared boundary is not scored as a new material omission.
- **L05 (oracle precision and sketch detail, nonmaterial)** — The final mentions cross-date moves in prose/covered-plan statements and has identity/time invariants, but row 98 does not name the date-boundary variant. Duration exact-versus-nominal distinctions and complete new VEVENT fields remain implementation details to validate. No invalid emitted file or unexecuted deployment is invented.
- **L06 (source-condition locator omission, nonmaterial)** — Graph canceled/exception metadata retrieval requires master GET plus $select/$expand conditions. The stage maps do not fully spell them out. Reviewer records them independently; final’s conceptual comparison does not propose a query that violates them.

The documented strict subset and fail-closed override cancellation are visible boundaries. They are not an undocumented deletion policy or a proven interoperability guarantee. Neither an IANA-looking identifier nor a calendar-root property field proves the external choices; the final correctly leaves actual clients/zone equivalence/mutation behavior unresolved. That honest uncertainty does not excuse F01’s settled but incorrect standard/qualification assertion.

## Delivery, source, coverage, native, protocol, time, effective and billing

| Dimension | Evidence-backed status |
|---|---|
| delivery | status: DELIVERED_COMPLETE_SCIENCE_ARTIFACTS; final_path: ER12_RUNTIME/runs/A1-02/control/stages/reviser/final.md; terminal_freeze_observed_utc: 2026-10-10T04:30:51.416127+00:00; t3_final_status: completed; t3_has_pending_child_runs: False |
| source | judgment: FAIL; basis: F01; six axes and 21 exact substantive plan clauses assessed; no semantic proof inferred from hashes or reviewer/candidate agreement |
| coverage | axes_assessed: [1, 2, 3, 4, 5, 6]; unassessed_axes: []; original_required_clauses: 6; substantive_exact_plan_clauses: 21; negative_constraints: 6; original_proposed_validation_cases: 7 |
| native | candidate_activation: UNKNOWN; candidate_terminal: UNKNOWN; reviewer_activation: ACTUAL_TOOL_OBSERVED; reviewer_goal_thread_id: 01a12413-fd59-70f1-a698-452000818fb9; reviewer_completion: TO_BE_CALLED_ONLY_AFTER_ALL_JUDGMENT_FILES_SAVED; reviewer_observation_path: reviewer-native-observation.json |
| protocol | reviewer: Within bounded single-arm assignment: no delegation/candidate feedback/repair/Git/publication/account changes/other arms/history/ER11.; candidate: Frozen maps/reveal consistent with intended protocol; full runtime verification UNKNOWN.; discovery_reveal: Recorded single-use reveal at 2026-10-10T04:08:36.222Z binds unchanged substantive discovery hash. This corroborates saved-before-reveal ordering, not proof of all unseen operations. |
| time | review_started_utc: 2026-10-10T04:31:02Z; review_deadline_utc: 2026-10-10T05:16:02Z; finite_cap_minutes: 45; capped: False; candidate: Stage and whole deadlines are preserved in inspected freezes. Artifact mtimes/root terminal observation precede corresponding declared caps. This is delivery-time evidence, not actual compute/queue separation.; comparison: NOT_ASSESSED_NO_OTHER_ARM_ACCESSED |
| effective | UNKNOWN_BEYOND_REQUESTED_AND_T3_REPORTED_METADATA |
| billing | UNKNOWN_NO_COST_OR_SAVINGS_INFERENCE |

Candidate native Goal activation/completion is **UNKNOWN to this independent review**. Each stage authors activation fields and terminal T3 summaries claim completion/usage, but actual candidate native response envelopes are absent from the bounded package. The root terminal freeze records final T3 completion and no pending child runs; it expressly says this is separate from native proof. Requested/T3-reported route metadata is not proof of effective upstream model/options or billing. No inference-token, billing-saving or paired-speed claim is made.

The reviewer created one actual native Goal before substantive review. Its direct create/get observations are saved; completion will be invoked only after this full judgment and evidence are saved. Its raw usage fields are not converted to billable inference counts. Review start 04:31:02 UTC; cap 05:16:02 UTC; finished scope early, with no unassessed axes.

## Missing/incomplete evidence and original freeze integrity

All ordinary control required authored files exist and were fully read. The investigator/reviser source roots contain only their authored bounded indexes; the critic source root is empty. There are no separate critique-check or disposition files; all embedded findings/dispositions and all three source maps were reviewed. No raw candidate primary captures or actual candidate native receipts are supplied. The reviser has no standalone status.json in this package; the supplied terminal-science-freeze-root.json supplies its terminal T3 observation. E19’s attempted versioned changelog request returned only a source directory listing and is not used as substantive evidence.

The [original inventory](inspected-originals.json) records 35 fully inspected files, original byte lengths, SHA-256 and mtimes, including the frozen rubric/brief/plan and root review request. All 31 recorded terminal/stage freeze hash entries matched. The copied brief matches the frozen original and the revealed plan matches the frozen plan; saved discovery matches its single-use reveal hash. This verifies inspected lineage bytes, not semantics. Final original SHA-256: `24932690420c985ee24bfd669222a5f91bc35f4b5ebb274bc43c6689e475f369`. Original freeze SHA-256 and every other inspected hash are in the inventory. Original source files were not edited.

## Final judgment

**FAIL — F01 remains in the final.** All declared axes are assessed. The useful discovery, supported identity/operation/preservation design, resolved type/subset clauses and candid validation status remain credited. The incorrect accepted criticism and generated-gap source/oracle decision prevent source qualification; a limitations-only grade would conceal a material remaining issue.

