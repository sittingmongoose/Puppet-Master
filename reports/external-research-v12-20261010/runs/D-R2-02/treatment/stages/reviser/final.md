# Final revised research proposal — temperature excursions during a cooperative produce route

**Run/stage:** D-R2-02-treatment / reviser  
**Case:** ER12-D-R2-02-FRESH (synthetic)  
**Evidence boundary:** no raw logger traces, route records, product-temperature readings, shipment identifiers, or verified quality outcomes were supplied or reviewed. No case-specific cause, risk, limit, or intervention effect can be inferred.

## Recommendation

Treat the reported short air-temperature spikes as an unresolved measurement and process signal. They do not establish that the produce warmed, lost quality, became unsafe, or needs powered cooling. First create a traceable observational baseline that keeps vehicle/cargo air, crate-interior air, actual product-proximate temperature, delivered quality, and any food-safety assessment distinct. Align each observation to loading, stops, doors and crate openings, route order, batch/load size, starting conditions, weather, shade, and logger placement.

After the baseline and owner decisions, compare feasible preconditioning or passive packaging changes with handling changes as separate, costed future pilot arms. Consider powered cooling only if crop-specific product/quality evidence shows a remaining agreed problem after feasible lower-cost options and a costed comparison supports it. If powered cooling is unjustified, retain an evidence-based no-purchase path of better measurement, shade or staging improvements where feasible, appropriate initial-condition control, airflow/load correction, and selected handling changes.

No operation, route, shipment, customer, purchase, or live trial is changed by this proposal.

## What can be inferred now

### Four observations answer four different questions

1. **Logger air reading:** A sensor reports temperature at its own location. A loose logger on top may capture a local cargo-air environment. Direct airflow, solar exposure, openings, position, attachment, sensor response, and sampling interval can affect the trace. The exact mounting and device properties are not supplied.
2. **Product temperature:** Product surface or core temperature can respond differently and more slowly than nearby air because produce has thermal mass. A sensor's own response time and logging interval can attenuate, miss, or smooth short events. The brief spikes therefore cannot be converted to product temperature. A measured air excursion may be real without establishing the magnitude, duration, or consequence of product heating.
3. **Delivered quality:** Quality is a separate outcome. It needs pre-agreed, crop-specific measures and scoring times, such as accepted saleable fraction, visible defects, firmness/texture, color, or weight loss. A temperature trace is not a quality score.
4. **Food safety:** Safety is a separate assessment requiring appropriate crop/product-specific evidence and a qualified decision owner. This proposal sets no safety limit and makes no safety, compliance, shelf-life, or product-suitability determination.

The postharvest sources distinguish commodity from air measurements and describe package airflow, heat-transfer, shade, and vent trade-offs [S2](sources/index.md#s2--fao-postharvest-management) [S3](sources/index.md#s3--fao-temperature-and-relative-humidity-control). Codex's air-recorder placement guidance is addressed precisely under SCW-1 below [S1](sources/index.md#s1--codex-transport-and-logger-placement).

### Thermal and operational mechanisms

A conceptual lumped heat balance is:

`m c_p (dT_{product}/dt) ≈ hA(T_{air}-T_{product}) + Q_{resp}`

with additional radiation, moisture transfer, packaging, and changing airflow effects. This is only a qualitative mechanism aid. Product mass and heat capacity, area, effective heat-transfer coefficient, respiration, product type, starting temperature, crate geometry, exposure, and route are unknown. A single lumped temperature would also omit within-product and crate-to-crate gradients. No numerical thermal model or toy trace was fitted or run, and this expression does not estimate case temperatures.

Several concurrent route and packaging factors could change the air trace or product exposure:

- A vehicle door opening exchanges cargo air with outside air; opening a crate can expose its interior more directly.
- Staging in direct sun can add radiative and convective heat. Shade may help where feasible [S3](sources/index.md#s3--fao-temperature-and-relative-humidity-control).
- Load mass, fill, stack, crate position, vents, and product arrangement affect thermal inertia and airflow. Insulation can slow heat gain during a warm event but can also slow removal of initial field heat; blocked or misaligned vents can impair cooling [S2](sources/index.md#s2--fao-postharvest-management) [S3](sources/index.md#s3--fao-temperature-and-relative-humidity-control).
- Preconditioning and initial product/crate temperatures may matter as much as in-route exposure. Any cooling or preconditioning choice must fit the identified produce and be measured.
- The reported route-order change and smaller batches occurred together. Route timing changes which load remains aboard and when a stop coincides with outside conditions; smaller batches change load size, thermal mass, fill, and possibly access frequency. These are confounded leads, not established causes.
- Sensor location, response, accuracy, calibration, sampling interval, mounting, and retrieval chain determine what a short spike can reveal. A standardized, secured warm-zone air channel should be retained for comparison with the historic channel, not treated as a product reading.

## Relevant implementation history and transfer conditions

- **S1 — Codex transport code.** The official text recommends an available small air recorder between packages in the warmest area. A separate recorder-company example gives top/side-wall/rear coordinates away from direct refrigerated-air discharge. The code discusses load airflow, placement documentation, and calibration/certification instructions [S1](sources/index.md#s1--codex-transport-and-logger-placement). This is conditional transport guidance, not a local practice, product measurement, or safe limit.
- **S2–S3 — FAO postharvest material.** These sources support measuring commodity temperature as distinct from air, preserving circulation, and checking how packaging, liners, shade, and vents affect cooling [S2](sources/index.md#s2--fao-postharvest-management) [S3](sources/index.md#s3--fao-temperature-and-relative-humidity-control). The advice is general and crop-dependent; it does not establish which conditions suit the unknown load.
- **S4 — 2022 short-route Portugal study.** Eighteen wireless T/RH modules were mapped to crate positions during a refrigerated-van route with five stops over about 4.5 hours. The SHT30 modules measured air close to produce; the paper describes fluctuations associated with stop/opening, operation, and refrigeration context. This is a field implementation for distributed crate and route observability, not a matched test of this cooperative's crate/route or a product-core/quality study [S4](sources/index.md#s4--2022-short-route-field-study).
- **S5 — 2023 PCM Portugal study.** A single winter delivery route compared orange crates with RT5HC PCM alveoli against empty-alveoli controls. The van refrigeration was off, the route included six unloading stops, and reported ambient conditions ranged from 1 °C to 10 °C. Ventilated SHT30 boxes measured air among the oranges. The authors report lower variation in PCM-crate sensor readings and note that the PCM phase change was unfinished at journey end. These readings do not measure orange-core temperature or delivered quality and do not show a transferable benefit for this case [S5](sources/index.md#s5--2023-pcm-packaging-field-study).
- **S6 — 2017 artificial-fruit study.** A biomimetic fruit-of-interest design was evaluated as an artificial apple during cooling against ten real apples; the publisher abstract reports cooling time within 5% for that test and differences up to 16% for water-filled simulators. This supports evaluating a crop-matched surrogate after separate validation, not using a generic simulator or transferring the apple result to unknown produce. The full article was not accessed in this review [S6](sources/index.md#s6--artificial-fruit-prototype).
- **S7 — 2024 Australian logger-adoption study.** An exploratory qualitative study covered three selected vegetable chains in Southeast Queensland in 2021/22. Interview findings discuss logger cost/uncertain returns, retrieval and analysis labor, mixed-product compatibility, data sharing, coordination, and accountability. These are useful questions for local planning, not facts about the synthetic cooperative [S7](sources/index.md#s7--logger-adoption-qualitative-study).

For this cooperative, route and packaging history remains unverified. A future records review should request dated route manifests and order versions; arrival/departure, stop, door, crate-access and staging logs; crate specifications and revisions (material, insulation, vents, lids/liners, fill, stack and load maps); batch-size/load records; product and crate starting temperatures and pre-cooling/packing practice; logger make/model, configuration, calibration, response, sample interval, mounting and prior trace files; available weather/shade; and prior quality/claim records. Recollection of a change is a lead for a timeline, not a causal comparison.

## Paths to compare

| Path | Mechanism and role | Costs, risks, and transfer limits | When a future test is justified |
|---|---|---|---|
| Measurement placement | First retain a standardized, secured air logger at a documented likely warm location. Pair it with an in-crate air sensor and, once crop is known, a calibrated probe in a designated sacrificial representative unit or a validated crop-matched surrogate. Map positions across plausible warm/cold zones and synchronize readings to events. | Device purchase/rental, calibration/reference checks, response qualification, sampling interval, placement and retrieval labor, data handling, probe damage, and surrogate validation. An air channel remains air, wherever placed. | First, because current placement, attachment, response and interval are unresolved and every treatment decision depends on what was measured. |
| Preconditioning / initial conditions | Measure product and crate temperatures at loading. Consider crop-appropriate preconditioning or existing pre-cooling only after product, process and owner are identified. | Labor, energy, staging, throughput and possible crop-specific chilling or handling effects; no starting condition or crop is known. | If baseline shows a repeatable starting-heat burden that the identified process can address. |
| Passive packaging / PCM | Compare current practice with a vent-preserving insulating/reflective cover or compatible passive buffer. Insulation slows exchange in both directions. PCM provides finite buffering only after compatible conditioning and depends on phase temperature, amount, placement, exposure, reconditioning and reuse. | Material and crate cost, mass/space, airflow or initial-cooling penalty, PCM phase match/capacity, reconditioning/return/replacement, handling labor, and possible product/packaging damage. No published percentage or effect is transferred to this case. | If baseline identifies a repeatable product-proximate exposure and crate/initial-condition mechanisms plausibly address it without blocking required airflow. |
| Handling / route | First log actual load positions, stop/dwell times, vehicle and crate openings, staging shade, route version/order, batch size, and outside conditions. A later authorized comparison may change one handling factor at a time. A door strip/curtain is an optional literature-informed concept only if vehicle fit, ventilation, fire/egress, and workflow are separately checked. | Staff time, customer windows, driver/vehicle constraints, extra handling, route feasibility, data costs, permission and opportunity cost. Route changes require cooperative/receiver approval; no route software or present-day operating instruction is proposed. | If event-linked baseline evidence shows a controllable factor and owner/workflow constraints permit comparison. |
| Powered cooling | Active cooling removes heat, unlike a finite passive buffer. | Capital, energy/fuel, maintenance, reliability, vehicle payload/space, installation, operating labor and lifecycle costs. No local capacity or quote exists. | Only after product-proximate or quality evidence shows a remaining gap after feasible lower-cost options and a costed comparison supports a separate feasibility proposal. |

A practical no-purchase alternative is documented logger placement plus traceable event records, periodic sensor checks, shade/protection during staging where feasible, product-appropriate initial-condition control, correct vents/loading/airflow, and handling changes selected from baseline evidence. This remains a future proposal, not an instruction for today's deliveries.

## Questions and decisions required before a fair comparison

1. Which species, cultivar, maturity classes and batches travel together? Are loads mixed, and which commodity-specific handling/temperature conditions apply?
2. What quality outcome matters to the cooperative and receivers: accepted saleable fraction, defects, firmness/texture, color, mass loss, or a defined combination? Who scores it, at what time, and is a later holding-period score acceptable?
3. What loss or improvement is practically meaningful, who approves it, and what is the cost ceiling and accounting period?
4. What are crate material, dimensions, insulation, vent geometry, lids/liners, fill, stack, closure and normal vehicle position?
5. What are actual starting product/crate temperatures and preconditioning/packing practices? Which changes are crop-compatible and operationally feasible?
6. What logger/probe models, firmware/configuration, calibration history, accuracy, response time, logging interval, mounting and attachment are involved? Can historic placement be reconstructed?
7. Are dated route/order manifests, timestamps, stop/dwell and door/crate-opening logs, weather/shade records, load size and batch records available?
8. May route order or departure timing change in an approved later pilot? What receiver windows, labor, driver, vehicle or agreements constrain it?
9. Can shipments be traceably blocked/matched by crop, starting condition, load size, weather and route? Who owns identifiers, sensor recovery, temperature data and quality scoring?
10. Who is responsible for any separate food-safety assessment? This proposal cannot establish safety limits or suitability.

These are preconditions for selecting a treatment, endpoint, threshold or sample size; the brief provides no cost ceiling or route-change agreement.

## Later pilot proposal — not executed

### Stage A: baseline and measurement qualification

Collect ordinary, traceable, comparable shipment blocks without changing delivery operations. For each shipment, record lot/batch and crop; crate/configuration and load-position IDs; fill/load mass where available; product and crate starting measurements; load and receipt times; route version/order; stop arrivals/departures; vehicle/crate opening events; shade/staging; external conditions; and sensor placement and retrieval chain.

Use channels with distinct purposes: (1) vehicle/ambient air, (2) fixed suspected warm-zone cargo air, (3) air inside a representative closed crate near product, and (4) a calibrated probe in a designated sacrificial produce unit or a crop-matched surrogate validated for the chosen product/use. Include positions that sample plausible vehicle/crate heterogeneity without assuming equivalence. Record device identity, accuracy specification, calibration/reference check, response-time evidence, sample interval, location, mounting, synchronization, and retrieval chain. If response is unknown, qualify it against an appropriate reference before interpreting brief spikes.

At loading and receipt, measure actual product temperature on a predeclared representative sample using a suitable calibrated method. Keep air, surface, core/surrogate and quality observations separate. Independently score delivery quality with partner-approved crop-specific criteria; use consistent scoring and consider blinded scoring if feasible. A post-delivery holding assessment is optional only if agreed and feasible. No safety endpoint is proposed.

### Stage B: pre-registered comparison

After baseline variability and practical costs are known, pre-register matched or randomized blocks that change one factor at a time where operations allow: current practice; one justified lower-cost handling or preconditioning candidate; then a vent-compatible passive package/PCM candidate if its mechanism fits. Route order/timing is a separate arm and requires owner/receiver permission and schedule review. Match or block by crop, initial temperature, batch/load size, weather, route version and start time where possible. Repeat across enough comparable shipments to estimate uncertainty; multiple sensors on one route are not independent shipment replications. Set replication only after endpoints, baseline variability and desired precision are agreed.

### Costs and decision criterion

For each candidate, calculate incremental cost per traceable shipment from actual quotes and records: annualized equipment/package cost, consumables, PCM/package reconditioning and returns, energy, maintenance, added labor, logger retrieval and analysis, route/time impacts, sensor loss/damage, and any documented change in rejects or quality loss. Do not assume prices or savings.

Before any treatment, the cooperative and relevant receiver define: (a) crop-specific product/quality targets and a practically meaningful improvement; (b) sensor data-quality and shipment-inclusion rules; (c) acceptable precision/uncertainty; (d) a practical cost ceiling; and (e) who adjudicates outcomes. Advance a candidate only if repeated, traceable comparisons meet the predeclared product-proximate and/or quality criterion with acceptable uncertainty and fit the agreed cost ceiling. An air-only excursion without a corresponding product/quality issue does not justify powered cooling. If a verified gap persists after feasible lower-cost paths, prepare a separate powered-cooling feasibility and cost proposal; that is not purchase authorization.

## Disposition of every selected criticism (SCW-1–SCW-5)

The critic's labels and selector-delta interpretations were treated as hypotheses and checked against the identified primary sources. None of the SCW records establishes a cooperative-specific fact.

### SCW-1 — Codex logger location

**Selected draft claim:** the Codex example places a small air recorder in a likely warm zone near the top, side wall and rear door, away from discharge air.  
**Criticism:** the shorthand omitted the one-third-in coordinate and did not clearly separate the Code's between-package placement criterion from the recorder-company example.  
**Independent evidence:** Codex §2.19 says the Code criterion is between packages where the warmest temperatures occur; it then attributes the top/side-wall/one-third-in-from-rear example to recorder companies. It does not specify that a recorder should be loose or unsecured [S1](sources/index.md#s1--codex-transport-and-logger-placement).  
**Disposition: ACCEPT with wording amendment.** The final text separates these two instructions and calls for recording actual mounting/attachment. The evidence does not establish that the synthetic brief's loose logger is equivalent to either configuration, nor that the logger should be mounted in a particular way for this unknown vehicle.

### SCW-2 — 2022 route-study sensor subsystem

**Selected draft claim:** the Portugal study contextualized readings by crate and route but was not a matched test of this cooperative's packaging/route; near-crate air was not product-core or delivered-quality evidence.  
**Criticism:** the critic tested whether the source measured product core instead of crate-near air.  
**Independent evidence:** the publisher-indexed article describes 18 wireless T/RH devices mapped to crate positions during a five-stop, approximately 4 h 30 m route. Its methods identify SHT30 modules measuring the air surrounding the product, with route/stop and refrigeration context [S4](sources/index.md#s4--2022-short-route-field-study). The source describes a different Portuguese field deployment; the conclusion that it is not a matched study of this case follows from its stated design and setting.  
**Disposition: ACCEPT.** The original air/core/quality boundary is correct and retained. The study supports a measurement implementation comparison, not a transferable treatment effect or a local case finding.

### SCW-3 — 2023 PCM result endpoint

**Selected draft claim:** the Portugal PCM study showed reduced fluctuation in orange crates on one winter route with refrigeration off; small air sensors did not establish core-temperature or quality benefit here.  
**Criticism:** the critic tested whether the measurements were crate air or orange core.  
**Independent evidence:** the publisher PDF identifies the SHT30 as an air-temperature sensor in a perforated housing that directly interacts with ambient air. Sensors were placed among orange crates; the control used empty alveoli. The one-route setup included six unloading stops, refrigeration off, sunny winter conditions and 1–10 °C reported ambient temperatures. The article reports less variation for PCM-crate sensor readings and says the phase change was unfinished at journey end [S5](sources/index.md#s5--2023-pcm-packaging-field-study). It has no orange-core or delivered-quality measurement.  
**Disposition: ACCEPT, with endpoint wording sharpened.** State that the reported lower variation is in crate-air sensor readings. Keep the published route conditions; do not infer a local, core-temperature or quality benefit.

### SCW-4 — artificial-fruit performance scope

**Selected draft claim:** the artificial-fruit prototype's cooling time was within 5% of ten apples in that test, while water-filled simulators differed by up to 16%; the draft proposed only a crop-matched surrogate.  
**Criticism:** the critic tested whether the result generalized from apple to all produce.  
**Independent evidence:** the ScienceDirect abstract describes a fruit-of-interest-specific design and reports a cooling test of an artificial apple against ten real apples, with cooling time within 5%. It also reports differences up to 16% for water-filled simulators. The abstract does not establish the same figures across crops; the full article was not accessed in this review [S6](sources/index.md#s6--artificial-fruit-prototype).  
**Disposition: ACCEPT the scope finding; AMEND the summary.** Keep the apple-specific test and use only as a reason to consider a separately validated crop-matched surrogate. Since the full article was unavailable, the detailed denominator/comparison basis of the 16% figure remains uncertain. Missing cross-species evidence is not proof that a generic simulator fails.

### SCW-5 — logger-adoption case population

**Selected draft claim:** three selected vegetable-chain cases reported logger cost, retrieval labor, mixed-product compatibility, and weak sharing/accountability as adoption concerns, to use as pilot questions rather than facts here.  
**Criticism:** the critic tested whether those concerns could be reassigned to the synthetic cooperative.  
**Independent evidence:** the publisher's full article describes an exploratory qualitative study conducted in 2021/22 across three separate vegetable supply chains in Lockyer Valley/Southeast Queensland, using 25 interviews and documentary evidence. Findings discuss logger cost/uncertain return, labor to retrieve and analyze data, mixed produce, information sharing/coordination, and accountability [S7](sources/index.md#s7--logger-adoption-qualitative-study).  
**Disposition: ACCEPT.** The study supports those bounded themes in its selected cases. It does not establish whether any of them apply to this synthetic cooperative, so the draft's use as questions rather than local facts is retained.

## Complete brief-scope coverage

“Covered” means addressed in this proposal; it does not mean locally verified. “Open” marks an owner or evidence dependency.

| Exact brief clause | Disposition |
|---|---|
| “A produce cooperative uses insulated crates on a morning delivery route.” | Accepted only as synthetic setup; no crate, route, or product properties are inferred. |
| “A few logger traces reportedly show brief warm excursions near the middle of the route, but the logger sometimes travels loose on top of the load.” | Covered as an unverified local-air trace. Placement, attachment, response and interval are unresolved; it is not treated as a product excursion. |
| “Delivery order changed recently, and customers also began receiving smaller batches.” | Covered as two concurrent potential confounders affecting timing, load mass, positions and handling; no causal attribution is made. |
| “The cooperative wants a research proposal before purchasing powered cooling.” | Covered by measurement-first baseline, separate costed comparisons, and a later feasibility gate before any separate purchase decision. No purchase is recommended from present evidence. |
| “There are no raw traces, product-temperature readings, route records, or verified quality outcomes.” | Preserved. No case analysis or result is claimed; the pilot specifies future evidence collection. |
| “The project setting is synthetic.” | Preserved. No contact, operational change, customer access, live trial, or claim about a real cooperative. |
| “Spend the 60-minute research window developing a proposal to investigate the excursions and compare feasible ways to improve route conditions.” | Covered by the complete mechanism, implementation-history, alternative-comparison, and pilot proposal; no routing system is built. |
| “Explain the transport and measurement mechanisms, research relevant implementation history, and propose a later pilot with defensible endpoints.” | Covered by heat/airflow/measurement distinctions, bounded source review, traceable baseline, product and quality endpoints, and a pre-registered comparison. |
| “Provide a useful alternative if powered cooling is unjustified.” | Covered by the no-purchase package of documented sensing, event records, shade, appropriate starting-condition control, airflow/load correction and evidence-selected handling. |
| “Do not build a routing system or issue operating instructions for today's shipments.” | Preserved. Route is only a permission-gated future comparison; nothing instructs today's deliveries. |
| “Distinguish logger air readings, actual product temperature, delivered quality, and food safety.” | Covered as four separate evidence classes. No air-to-product, quality, or safety inference is made. |
| “Compare passive packaging or preconditioning changes with route or handling changes and a useful measurement-placement alternative.” | Covered in separate paths with mechanisms, costs, conditions and a measure-first comparison. |
| “Consider door or crate opening, load size, initial conditions, route timing, and sensor response rather than treating every short spike as a product excursion.” | Covered as baseline events/confounders and sensor limitations; no short spike is assigned a product effect. |
| “Investigate the route and packaging history and the conditions reported by comparable implementations before transferring their claimed benefits.” | Published examples are bounded by product, route, sensor, weather and method; the co-op history is explicitly unverified and records to request are listed. No analogue effect is transferred. |
| “Propose a pilot with a baseline, traceable shipments, relevant measurements, practical costs, and a decision criterion; label future validation separately from analysis actually executed.” | Covered in Stage A/B, shipment traceability, channel roles, cost accounting, decision rule, and validation-status section below. |
| “Do not declare safe storage limits, shelf life, compliance, or product suitability from unverified air-temperature traces.” | Preserved; no such limit or finding appears. |
| “Do not alter deliveries, enter customer systems, contact customers, purchase cooling equipment, or run a live trial.” | Preserved. None was performed or authorized by this stage; any operational pilot requires later approval. |
| “Do not invent route timings, thermal properties, produce types, logger response, or quality results.” | Preserved. Case values remain unknown; all cited numbers are explicitly tied to published analogues. |
| “Product types, initial temperatures, crate construction, logger specifications, packing practice, stop durations, outdoor conditions, and acceptable quality loss are unknown.” | Preserved and expanded into the prerequisite questions and baseline records. |
| “There is no supplied cost ceiling or agreement that route order may change.” | Preserved as explicit owner decisions. No price, target, or route change is assumed. |
| “Identify which questions must be resolved before alternatives can be fairly compared.” | Covered by the ten-item owner/partner decision list. |

## Exact revealed-plan clause disposition

The revealed plan remains a separate concealed design record, not a candidate-facing source list, research result, or answer key. This final is an internal reviser-stage artifact, and the plan is not reproduced wholesale here.

| Revealed-plan clause/section | Disposition |
|---|---|
| Preserve the authored request and open design opportunities; the plan is not a completed proposal, source list, result, or evaluation key; it selects no method or winner. | Preserved. This report supplies a proposal, not a result/key. No intervention or method is declared the winner; the selected pilot sequence is provisional and conditioned on baseline evidence and owner decisions. |
| Keep the plan outside candidate-facing material and preserve the original brief clauses. | Preserved. The plan remains separate. Every original brief clause is mapped above; this report does not silently narrow those obligations. |
| Research question and incompleteness: decide whether excursions represent an actionable product problem; product-specific endpoints, access, operational variation, and costs remain open. | Covered by the measurement-first design and prerequisite list; the answer remains unknown until product, route, quality and cost evidence exists. |
| Meaningful alternatives: placement/interpretation, packing/insulation, preconditioning, openings, timing, delivery order/load size, powered-cooling costs, and better measurement with unchanged operations. | All are retained as candidates or measurements. None is presumed effective; route and shipment changes require later permission. |
| Mechanism opportunity: heat transfer, initial thermal state, mass, openings, sensor response/placement, air/product relation, and limits of simplified models. | Covered in the mechanism section and conceptual heat-balance scope; no numeric model or product temperature estimate is claimed. |
| Implementation/history opportunity: use implementations with actual products, packing, weather, dwell, placement, route and quality context; investigate past manifests/packing records; consider maintenance and failures. | S1-S7 are described with source-specific conditions and limits. Case-history records are requested. Recollections are not treated as causal comparison. Maintenance, charging/retrieval, replacement, reconditioning, and accountability costs are included for later costing. |
| Proposed versus executed validation: authorized later pilot, traceable shipments, initial conditions, air/product measurements, openings/stops, quality observations, repeated routes/weather, sensor checks, and costs. | Covered in Stage A/B and the cost/decision sections. Repetition, blocking, endpoint choices, and thresholds remain future decisions. No live validation is claimed. |
| An assumed heat-balance illustration or toy trace cannot establish real product temperature, safety, or quality improvement. | Preserved. The equation is conceptual only. No toy trace or thermal model was run, and no safety/quality inference is made. |
| Authoring status: only synthetic input files were prepared; no scientific search or validation had been performed for the case at authoring. | Kept as an authoring-time status, not confused with later stages. The investigator draft records its later literature review; the critic records a separate review; this reviser independently rechecked the specified sources. No experiment or case-data analysis occurred. |
| Preserve the full research scope, no predetermined winner, and no product build; D inputs stay sealed until the exact recipe/budget lock and no designer feedback is given before the candidate set finishes. Input readiness does not prove those release conditions. | Preserved. The report compares options without selecting a winner or building a product/routing system. No additional candidate, campaign or history files were read; no designer feedback or release-state claim is made. |

## Work performed and validation status

**Performed by this reviser:** read the assigned assignment and input map after the native-goal binding gate passed; read the complete listed brief, investigator discovery/draft/source map/revealed plan/plan-reveal record and critic critique/source map, including both source indexes; independently rechecked SCW-1–SCW-5 against their identified primary sources and checked the inherited FAO mechanism sources; wrote this self-contained proposal, scope dispositions, and source map.

**Reported upstream work:** the investigator records a literature/source review and proposal drafting. The critic records a full brief/plan/package review with independent source checks. Their retrieval limits are preserved in [source-map.json](source-map.json).

**Not executed by this reviser or upstream as reported:** no logger-trace analysis, route audit, field inspection, calibration, product-temperature measurement, quality scoring, numerical heat-balance modeling, toy-trace analysis, live pilot, purchase, customer contact, delivery change, powered-cooling feasibility assessment, or external validation. S4 direct publisher retrieval returned HTTP 429 in this reviser review; S6 was limited to the publisher abstract/record and the full article was not accessed.

**Proposed later validation only:** the baseline, response/calibration qualification, traceable repeated comparisons, crop-specific quality scoring, and cost/decision analysis described above. These require the missing facts, owner decisions, and separate future authorization. No validation is presented as already run.

## Native Goal record

One native Goal was activated with the immutable frozen objective before any case/source input; the complete create response is saved in `native-goal-create.json`, and the exact-goal binding guard passed. Goal response provenance/freshness and timestamps are UNKNOWN beyond the checker's validation. This report and source map were saved before completing that same Goal.

