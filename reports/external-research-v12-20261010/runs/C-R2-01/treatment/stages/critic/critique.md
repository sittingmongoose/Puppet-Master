# Independent critic — C-R2-01-treatment

Case: ER12-C-R2-01-FRESH / slot C-R2-01  
Stage: critic  
Review target: the complete investigator package against the original brief and the exact revealed plan.

## Native Goal and gate

One native Goal was activated before any case input was read. Its exact complete response is preserved in native-goal-activation.json. The exact-binding guard returned `{"ok": true, "provenance_independently_proved": false}` with exit code 0. This confirms the checker accepted the supplied active Goal object; the checker explicitly does not independently prove response provenance. No second Goal was created.

## Inputs and method

I read the full original brief, discovery.md, draft.md, source-map.json, revealed-plan.md, plan-reveal.json, and the carried sources/index.md plus S01–S09 notes. I independently reopened the cited official/primary pages and PDFs and checked the headings, scope conditions, relevant test procedures, model limits, and abstracts in surrounding context. Source identities remain bound to their original IDs and URLs in source-map.json and the critic's sources/ index. No collection data, actual stock, sleeve resin, printer, supplier record, or case specimen exists in the supplied case packet.

The critique distinguishes claims supported by sources from hypotheses, inferences, proposed validation, and facts not supplied by the case. It does not author or repair a final proposal.

## Scope-selection protocol note

The A8 instruction required the ordered SCW claim list to be recorded in critique.md after ordinary packet reading but before new source fetching. Source fetching began before this list was materialized in the artifact. I therefore cannot certify this as a source-blind preregistration. The six claims below are now fixed for this review; I did not replace them after comparing the evidence. Treat the SCW component as procedurally limited, while the full ordinary critique remains in force. This sequencing limitation is preserved rather than hidden.

## SCW selection: ordered claims

Priority follows the potential effect of a scope mistake on an alternative, an owner decision, or a consequential applicability limit; ties follow draft order. These are exact draft sentences and the context needed to interpret them.

### SCW-01 — NARA applicability to the non-adhesive alternative

- Draft locator/context: “Useful alternatives and tradeoffs,” row “No pressure-sensitive adhesive on the sleeve.”
- Exact sentence: “NARA's guidance is contextual only; it warns about static/transfer and limits inserts to certain records [S07].”
- Intended reading C: NARA guidance is an analogy with bounded eligibility and handling conditions; it does not establish fit or safety for the case's unidentified sleeves.
- Diagnostic reading C*: “NARA's guidance applies directly to all paper collection sleeves.” Selector delta: applicability condition, “certain damaged/small paper records in polyester L-sleeves” → “all paper collection sleeves”; other source and topic components stay fixed.
- Evidence/applicability: S07, “Using Polyester L-Sleeves,” lines 121–151: the page limits use to damaged records needing support or small records at risk of loss; it warns about static and media offset and gives the one-sided bond-paper instruction within the L-sleeve context. The page concerns paper records, not the invented collection's unidentified label sleeves.
- Relations on the same evidence E: C = ENTAILS; its limits and cautions are explicit. C* = UNDETERMINED; the guidance does not establish applicability to every collection sleeve, but its narrower scope is not proof that every other sleeve is unsuitable.
- Proposed disposition: retain the contextual caveat.
- Supported replacement: none needed; keep any insert/holder comparison on empty mock sleeves with owner/conservator review.
- Affected brief/plan item: compare a useful attachment alternative without asserting conservation suitability.

### SCW-02 — accelerated exposure versus storage life

- Draft locator/context: “Boundaries,” B3 disposition.
- Exact sentence: “A 28-day 80°C/50% RH test in a procurement spec is an accelerated protocol, not a number of storage years [S02].”
- Intended reading C: S02 labels the 80°C/50% RH/28-day exposure accelerated; the specification does not translate that exposure into a number of ordinary-storage years.
- Diagnostic reading C*: “The same 28-day protocol is a validated equivalent to two years of ordinary storage.” Selector delta: applicability/interpretation, “accelerated test condition” → “validated ordinary-storage equivalence”; all temperatures, duration, and source stay fixed.
- Evidence/applicability: S02, §§2.5–2.6, PDF pp. 2–3. It explicitly labels the exposure accelerated and applies it to selected test panels. The surrounding specification does state a desired normal-use performance requirement, but supplies no conversion equation or validated year mapping.
- Relations on the same evidence E: C = ENTAILS for the accelerated condition and its lack of a stated year conversion in this specification. C* = UNDETERMINED; the source does not establish a two-year equivalence, and omission alone does not disprove a conversion developed elsewhere.
- Proposed disposition: retain the separation and avoid lifetime claims.
- Supported replacement: none; no equivalent-year claim is supported by S02 alone.
- Affected brief/plan item: distinguish accelerated testing from ordinary storage and do not promise lifetime durability.

### SCW-03 — permanence tradeoff and excluded application classes

- Draft locator/context: “Mechanisms and evidence,” “Bond and sleeve.”
- Exact sentence: “The laser specification selects a high-permanence acrylic adhesive that is intended to be difficult to remove [S03]; this is a tradeoff to compare against replaceability requirements, not a universal best choice.”
- Intended reading C: the statement describes the adhesive required by the LOC's laser/plastic-metal storage-container procurement spec, not a recommendation for this case.
- Diagnostic reading C*: “The same specification recommends that high-permanence adhesive for rare/high-value or photographic collection materials.” Selector delta: applicability class, “ordinary in-scope storage-container materials” → “rare/high-value or photographic materials”; all other elements stay fixed.
- Evidence/applicability: S03, Scope and §1.2, PDF p. 1. It describes LOC purchasing for plastic/metal storage containers and explicitly excludes rare/high-value and photographic uses; §1.2 specifies acrylic high-permanence PSA removable only with difficulty.
- Relations on the same evidence E: C = ENTAILS. C* = CONTRADICTS, because the specification says those application classes are not intended uses.
- Proposed disposition: retain the scoped comparison and owner replaceability gate.
- Supported replacement: none needed.
- Affected brief/plan item: do not name an adhesive as safe or select a material before replaceability and owner requirements are known.

### SCW-04 — transferring printer-setting evidence to an unidentified printer

- Draft locator/context: “Printing and implementation.”
- Exact sentence: “A Canon model manual, offered only as a model-specific example, ties curl troubleshooting to damp/unsupported paper, paper type and environment, and notes print-quality/speed tradeoffs for settings changes [S08].”
- Intended reading C: these are troubleshooting statements for the Canon LBP5280 manual only and a lead for retrieving the actual printer's instructions.
- Diagnostic reading C*: “These same setting changes apply to the store's unidentified printer.” Selector delta: product/model applicability, “Canon LBP5280” → “the case's unidentified printer”; all other factors remain fixed.
- Evidence/applicability: S08, “Paper Curls,” causes 1–4. The model page lists paper/environment causes and warns about toner fixation, faint output, or speed effects. The case does not identify its printer.
- Relations on the same evidence E: C = ENTAILS. C* = UNDETERMINED; the manual gives no evidence about the unidentified model, and the case's model is an unresolved input.
- Proposed disposition: retain the model-specific qualifier.
- Supported replacement: none; consult the actual printer and driver documentation after identification.
- Affected brief/plan item: consider printing interactions and implementation history without inferring a setting fix.

### SCW-05 — general paper direction versus the unknown label stock

- Draft locator/context: “Paper movement and curl.”
- Exact sentence: “The review reports greater hygroexpansion across the machine direction than along it and identifies fiber orientation, sheet structure and process history as influential [S04].”
- Intended reading C: the review synthesizes results across paper grades/processes; it supports measuring known directions but does not state the case stock's magnitude.
- Diagnostic reading C*: “The unidentified case label stock has greater cross-direction than machine-direction hygroexpansion.” Selector delta: subject/material, “paper grades covered by the review” → “this unidentified label stock”; other components stay fixed.
- Evidence/applicability: S04, “Fiber orientation”; S05, humidity/anisotropy, PDF pp. 794–797. S04 reports a broad cross-direction tendency with variation by orientation and processing; S05 tests particular fiber/sheet specimens, not the case stock.
- Relations on the same evidence E: C = ENTAILS as a review-level relationship; C* = UNDETERMINED because no stock identity, orientation, or measurements were supplied.
- Proposed disposition: retain the directional measurement plan, qualify actual-stock behavior as unresolved.
- Supported replacement: none; record grain/direction only when identified.
- Affected brief/plan item: paper dimensional stability and interactions with humidity/manufacturing history.

### SCW-06 — inkjet mechanism versus the case's unidentified print system

- Draft locator/context: “Paper movement and curl.”
- Exact sentence: “Maass and Hirn report an inkjet/model-ink experiment and propose delayed co-solvent migration as one mechanism [S06].”
- Intended reading C: the cited study proposes this mechanism for the studied water/glycerol model-inkjet sheets; the draft uses it as a conditional hypothesis only.
- Diagnostic reading C*: “The same mechanism explains curling in the case's actual label-printing system.” Selector delta: applicability condition, “studied model inkjet sheets” → “the case's unidentified label-printing system”; all source and mechanism terms remain fixed.
- Evidence/applicability: S06 publisher abstract describes A4 paper sprayed with water/glycerol model ink, curl measurements, and glycerol migration analysis; it frames the inference around inkjet-printed sheets. Full text was not inspected.
- Relations on the same evidence E: C = ENTAILS as a report of the study and its proposed mechanism. C* = UNDETERMINED; the case's printer and ink are unknown and the evidence does not test adhesive labels.
- Proposed disposition: retain only as a conditional mechanism, not a case diagnosis.
- Supported replacement: none.
- Affected brief/plan item: consider printing as an interacting factor without assigning cause to it.

## Ordinary critique against the original brief

| Obligation | Assessment | Evidence and remaining limit |
|---|---|---|
| Treat the anecdote as unverified and do not invent specimen or monitoring data (C0, C3) | Satisfied | The draft states identities, denominator, exposure, and timing are unknown; it reports no case measurements or intervention. |
| Keep dimensional stability, attachment, and readability distinct (R1) | Satisfied | Three separate endpoints and failure records are specified; the study does not use a single composite pass score. |
| Compare paper/adhesive change with attachment or environmental alternatives, including current materials plus monitoring (R2) | Satisfied | It compares current materials with monitoring, a changed complete label system, non-adhesive card/holder, and process standardization. No product or unapproved collection intervention is selected. |
| Consider humidity, printing, application, sleeve, and simultaneous stock/printer changes (R3, C5) | Satisfied with explicit confounding gates | The draft treats each as a hypothesis, recovers history, and blocks attribution where old combinations cannot be reproduced or compatibility is unknown. |
| Use implementation and specification history while separating accelerated and ordinary exposure (R4, B3) | Satisfied with an evidence-depth gap | SKU/construction/lot/revision, printer/settings, application, sleeve, and environmental histories are listed. LOC specs are scoped procurement precedents, not case product proof. No case-specific implementation report is available in the packet. |
| Controls, duration, failure recording, annotation protection, and proposed-versus-executed separation (R5) | Satisfied as a proposal | Mock-sleeve controls, three distinct outcomes, per-unit logs, six-month observation, and conditional annotation capture are described. No performance validation is claimed. |
| Full 60-minute research window (brief Request; plan says full 60-minute session) | MATERIAL INCOMPLETE | Draft C4 itself reports an investigator-stage deadline 29 minutes 45 seconds after its recorded start and expressly says the full hour was not completed. This is candid rather than a false completion claim, but the original time-scope clause remains unmet as written. I did not inspect an unlisted investigator assignment or extend/restart a deadline, so the reported scheduling constraint is not independently adjudicated here. |
| Do not recommend solvent, heat, destructive sampling, or removal (B1) | Satisfied | Existing labels and collection items remain in place; observations and proposed experiments are on new mock materials. Peel/pull and hot-aging tests are not proposed for collection objects. |
| Do not infer conservation safety from “archival” marketing (B2) | Satisfied | No named stock, brand, or adhesive is endorsed; product identity and owner thresholds remain gates. |
| Do not promise lifetime or convert accelerated test to storage years (B3) | Satisfied | The six-month study is expressly bounded and not a lifetime promise; accelerated exposure is distinguished from ordinary storage. |
| Show unknown stock, adhesive, printer, sleeve, humidity history, denominator, failure threshold, replaceability, and copy permission (U1–U2) | Satisfied | These are enumerated as unresolved inputs and owner/conservator decisions; the draft does not fill them with guesses. |

## Exact revealed-plan coverage

| Plan addition | Assessment |
|---|---|
| Minimum evidence to distinguish material incompatibility, application variation, and environment | Addressed provisionally: matched history and mock-up contrasts are identified; present case evidence cannot discriminate. |
| No predetermined product or study winner; unresolved permissions and reversibility | Preserved. The owner/conservator gates prevent treating the proposal as authorization. |
| Compare stable paper, adhesive/system, printer/application, non-adhesive retention, and environmental monitoring | Addressed without a brand choice. The no-adhesive option remains a mock-up alternative and is not treated as directly validated by NARA guidance. |
| Mechanisms and simultaneous supply-change confounding | Addressed, with paper, printing, interface, sleeve, environment, and application separated as hypotheses. |
| Technical descriptions, conservation/implementation evidence with identity and conditions | Partly addressed. LOC specifications, a printer manual, paper studies, and archival handling guidance provide useful scoped evidence. The packet does not contain a conservation or implementation case report matching the unknown label/sleeve system, and the draft does not document an exhaustive search for one. Record that as an evidence gap, not proof that such a report does not exist. |
| Later coupon study, endpoints, repetition, conditioning, handling, and duration | Addressed as proposed future work. The chosen six months is a reasonable bounded response to the “after months” anecdote but is not a source-derived lifetime or acceptance period. The 12-per-valid-cell design is explicitly a feasibility screen, not a low-failure-rate demonstration. |
| Keep proposed validation distinct from executed work | Satisfied. The draft accurately lists desk research as executed and collection inspection, sensor deployment, transcription, tests, and performance validation as not executed. |

## Findings by required issue class

| Class | Finding |
|---|---|
| Material wrong | None identified in the claims checked against the carried primary/official evidence. No causal diagnosis or product recommendation is asserted. |
| Material incomplete | Full-hour scope is not met as reported by the draft. The review of sources and proposal otherwise address the substantive requirements, but cannot be treated as a completed 60-minute research session. |
| Material incomplete / evidence gap | The revealed plan calls for looking for conservation or implementation reports with material identity and conditions. The cited packet has useful generic precedents but no matching label-system case report; the draft should preserve this as an open research lead. |
| Honestly unresolved external input | Stock/adhesive construction, printer/ink, sleeve resin/finish, application process, environment, failure denominator, accepted rate, replaceability, and copy permission. These block case-specific product choice and causal attribution. |
| Minor locator/wording | Keep the NARA citation explicitly attached to the polyester L-sleeve conditions for fragile/damaged paper, and keep the Canon page tied to LBP5280. The draft already contains these limitations; avoid letting either read as direct case evidence. |

## Study-design limitations worth carrying forward

The proposed six-month ordinary-storage interval is bounded and plausibly motivated by the reported “after months” timing, but cannot represent a seasonal cycle unless the interval captures one. The two-week pre-study baseline may be too short to characterize seasonal or rare excursions. The draft does include a guard—if the measured range is not meaningful, humidity remains untested—so the right status is a limitation on the proposed comparison, not a basis for claiming an environmental effect.

The 12 specimens per valid factorial cell are expressly a feasibility screen. If every old/new stock-system × printer × application combination is compatible and both stable/variable exposure profiles are used, the full design can expand substantially. The draft appropriately conditions cells on compatibility and leaves missing contrasts unresolved; it should not be described as a powered acceptance study. Owner-defined failure-rate and confidence requirements remain necessary before acceptance.

## Proposed versus executed validation

Executed: desk research of the supplied synthetic brief and independent review of the carried official/primary sources listed in source-map.json.  
Not executed: case inspection, supplier contact, printer operation, RH/T monitoring, annotation imaging or transcription, specimen manufacture, mock-up study, adhesion/durability testing, or performance validation.

All study measurements and controls in the investigator draft remain proposals. No final or repaired proposal is supplied by this critique.
