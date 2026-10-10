# Investigation proposal — temperature excursions during a cooperative produce route

**Run/stage:** D-R2-02-treatment / investigator  
**Case:** ER12-D-R2-02-FRESH (synthetic)  
**Release record:** revealed_at_utc=2026-10-10T06:59:35.052Z; discovery SHA-256 273be0bb27ab5800390bc2dc2747487959deb91c97653e4785cd6d2346b11af9; plan SHA-256 5989b2caa419ae56554908cc9a8d5b2e2259b36a77b74b3b65477bec4074b271. Discovery is unchanged after release. This draft is internal to the investigator stage; the released plan says to keep it outside any candidate-facing packet.

## Recommendation

Treat the reported short spikes as an **unresolved measurement and process signal**, not as evidence that the produce warmed, lost quality, became unsafe, or needs powered cooling. Start with a traceable observational baseline that pairs a documented vehicle-air logger with measurements inside representative crates and a crop-appropriate product-proximate measurement. Relate each channel to loading, stops, vehicle/crate openings, route order, load size, initial conditions, weather, and independently scored delivered quality.

After the baseline and product/owner decisions below, compare low-complexity preconditioning/packaging changes and handling changes as separate, costed pilot arms. Consider powered cooling only if product-proximate conditions or the agreed quality endpoint still miss a crop-specific target after feasible lower-cost options, and a cost comparison supports the purchase. A useful no-purchase path is better measurement plus shade, initial-condition control, airflow/load correction and handling improvements where the baseline supports them.

## What the transport and measurement evidence supports

### Different channels answer different questions

- A logger measures temperature at its sensor, not automatically the load or produce. A logger loose atop the load may characterize exposed cargo-space air, with fast responses to airflow, sunlight and door events. If its exact mounting/location is unknown, interpretation is weaker still.
- Product tissue has thermal mass. Surface/core temperature may lag or smooth a short air change; sensor response time and logging interval can also attenuate or miss short events. A real air excursion therefore can coexist with little measurable product change, while long or repeated exposure can still matter. Neither relationship can be quantified here.
- Delivered quality is a separate observation. Agree in advance on crop-specific acceptance/defect measures and when to score them; temperature is not itself a quality score. Food-safety assessment is distinct and requires qualified, product-specific criteria and evidence. This proposal makes no safety or compliance finding.
- A conceptual heat balance is m·cp·dTproduct/dt ≈ h·A·(Tair − Tproduct) + Qresp, with additional radiative and moisture-transfer effects. It explains why mass, surface area, airflow/contact coefficient, respiration, packaging, initial temperature and exposure history matter. A lumped, uniform-temperature model would ignore crate-to-crate and within-product gradients, changing airflow and event-driven openings. Here m, cp, h, A, respiration, product type, initial temperature and route are unknown; no numerical model or toy trace can estimate product temperature.

### Packaging, preconditioning and handling mechanisms

Packaging can alter both heat transfer and air movement. Insulation can slow heat gain during a warm event, but also slow removal of initial field heat; blocked or misaligned vents can impair cooling and heat/respiration removal. Preconditioning the product and, where appropriate, the crate before loading may reduce the initial thermal burden. It must be crop-compatible and measured rather than assumed. These are interacting factors, so test one material/process change at a time and preserve required ventilation.

A phase-change material (PCM) can buffer a temperature range while it changes phase, but has finite capacity and depends on compatible phase temperature, quantity, placement, preconditioning/recharging, route exposure and reuse. It adds mass, handling, return/reconditioning and replacement costs. In the 2023 Portugal field analogue, PCM inserts reduced fluctuation in orange crates on a single winter route with refrigeration off; its conditions and small air sensors do not demonstrate product-core or quality benefit for this case. The authors also identify autonomy/quantity under specific conditions as an open question (S5).

Handling/route factors can change the air trace and product exposure: vehicle door-open events exchange cargo air with ambient air; opening a crate exposes its interior more directly; staging in sun changes radiative/convective load; load mass, fill, stack, position and vents alter thermal inertia and airflow. Different route order shifts timing against ambient conditions and changes which load remains aboard at each stop. Smaller batches change load size, thermal mass, vehicle fill and possibly handling frequency. The reported route-order and batch-size changes occurred together, so neither is a causal explanation by itself. Log events before proposing any route change.

### Comparable implementation history and transfer limits

- **S1, Codex CAC/RCP 44-1995 amended 2004:** §§2.13–2.19 recommend pre-cooling when needed, checking equipment/air circulation, and recording logger placement. Its illustrative small air-recorder location is in a likely warm zone near the top, side wall and rear door, away from discharge air. That can be useful for environmental monitoring; it does not make the reading product temperature. The code also emphasizes air paths under, around and through the load and compatibility for mixed produce. It is a mechanism/checklist source, not evidence of this cooperative's compliance or an applicable temperature limit.
- **S4, 2022 Portugal short-route study:** researchers placed 18 temperature/humidity sensors near diverse crate contents in a refrigerated van route with five stops and about 4.5 hours of distribution. This shows a field implementation that contextualizes readings by crate and route; it was not a matched trial of this cooperative's packaging/route, and near-crate air is not a product-core or delivered-quality endpoint.
- **S5, 2023 Portugal PCM route study:** oranges in crates with PCM alveoli were compared with empty-alveoli controls on one winter route, six stops, with refrigeration switched off and ambient conditions reported around 1–10°C. Sensors sampled near produce. It is a useful packaging comparator with explicit route conditions and finite PCM reserve, not a transferable performance estimate for unknown produce, insulated crates, powered/unpowered conditions or route.
- **S6, 2017 artificial-apple study:** a prototype intended to mimic fruit thermal response had cooling time within 5% of ten apples in that test, while water-filled simulators differed by up to 16%. It supports investigating a repeatable, crop-matched surrogate; it does not validate a generic sensor/proxy or route response here.
- **S7, 2024 Australian qualitative study:** three selected vegetable-chain cases report cost, data retrieval labor, mixed-product compatibility and weak sharing/accountability as adoption concerns. Include these as pilot cost/governance questions, not claims about this cooperative.
- FAO postharvest sources S2–S3 further support measuring commodity temperature, recognizing packaging airflow effects, and checking whether liners/insulation obstruct cooling. These are conditional postharvest mechanisms, not case observations.

The case-specific route and packaging history is **not established**. Before choosing an intervention, request available historical route manifests/order versions, arrival/departure and stop records, crate/load maps, packing/vent and batch-size records, pre-cooling/initial-condition records, logger setup/calibration files, and prior quality/claims records. Recollection of a changed route is a lead for a timeline, not a validated before/after comparison.

## Comparison of feasible paths

| Path | Mechanism and useful evidence | Main limits/costs to record | When it is worth testing |
|---|---|---|---|
| Measurement placement | Keep a secured, documented air logger in a preselected likely warm location; add an in-crate air channel and a calibrated, crop-matched probe/simulator in representative units. Map position and link all channels to events. S1 supports warm-zone air placement; S6 supports a crop-specific simulator concept. | Logger purchase/rental, calibration, placement/retrieval labor, data handling, lost/damaged probes, sensor response and sampling interval. A surrogate needs product-specific validation; direct probes may damage saleable product. | First, because the current logger location and sensor response are unresolved and all treatment decisions depend on what it measured. |
| Passive packaging / preconditioning | Measure starting product/crate temperature; compare current packaging with a vent-preserving insulation/reflective option or a correctly preconditioned PCM buffer. Consider pre-cooling only for an identified crop and compatible existing process. | Material and crate cost, mass/space, airflow/cooling penalty, re-use/return/reconditioning, PCM phase-temperature match, labor and any product/packaging damage. | If baseline indicates a repeatable product-proximate exposure and crate/initial-condition mechanisms can plausibly address it. |
| Handling / route | First characterize loading, shade, door/crate openings, stop durations, batch size, load position and outside conditions. A later authorized comparison could test a handling change or route-order change separately. | Staff time, customer timing, route feasibility, extra handling, crate access, opportunity cost and permission. Any curtain/door modification needs vehicle/workflow fit review. | If timestamps associate the exposure with controllable events and owner/customer constraints allow a fair comparison. |
| Powered cooling | A powered system actively removes heat, unlike finite passive buffering. | Capital, energy/fuel, maintenance, reliability, vehicle payload/space, installation and operating labor. No local cost or capacity data exists. | Only after product-proximate and quality evidence plus costed comparison shows lower-cost changes are insufficient. |

For each option calculate incremental cost per traceable shipment from actual quotes/records: annualized equipment or package cost, consumables, reconditioning/returns, energy, maintenance, added labor, data retrieval and analysis, route/time changes, and any documented reduction in reject/quality loss. Do not insert assumed prices or savings.

## Questions requiring owner or partner decisions

Resolve these before a fair comparison or threshold is set:

1. Which produce species/cultivar and maturity classes are shipped together? Are loads mixed, and what crop-specific postharvest ranges/conditions apply?
2. What quality outcome matters to the cooperative and receivers: accepted saleable fraction, defects, firmness/texture, color, mass loss, or a defined combination? Who can score it consistently, at what point, and is a post-delivery holding/quality assessment acceptable?
3. What loss or improvement is practically meaningful, and who approves that criterion? What is the cost ceiling and accounting period?
4. What are the crate material, dimensions, vent geometry, lids/liners, insulation, fill mass/stack, packing and closure practice, and normal vehicle positions?
5. What are actual initial product/crate temperatures and preconditioning/packing practices? Which changes are feasible without impairing crop quality or workflow?
6. What logger/probe models, firmware/configuration, calibration history, accuracy, response time, logging interval and attachment/mounting are involved? Can the current placement be reconstructed?
7. Are route manifests, timestamps, stop/dwell and door/crate-opening logs, weather/shade, load size and delivery batch records available, including dated route-order changes?
8. May route order or departure timing change for an approved pilot? What customer windows, labor, driver, vehicle and customer agreements constrain it? No customer contact or delivery change is authorized in this stage.
9. Can shipments be traceably blocked/matched by crop, starting condition, load size, weather and route? Who owns the data, shipment identifiers, quality scoring and sensor recovery?
10. Who is responsible for a separate food-safety assessment if one is needed? This quality/thermal proposal cannot set safety limits or conclude suitability.

## Proposed later pilot and decision rule

### Stage A — baseline and measurement qualification

Use multiple ordinary, traceable shipment blocks without changing today's operations. Determine the number of shipments after an initial variance/cost review; do not choose a sample size before agreeing on the desired precision and available repetitions. For each shipment record crop/lot/batch, crate ID/configuration, load mass/fill, loading and delivery UTC times, initial product/crate measurements, route version/order, load position, stop arrivals/departures, door and crate openings, staging/shade, and available external conditions.

Use channels with distinct roles: (1) secured vehicle/ambient air; (2) fixed suspected warm-zone cargo air; (3) air within a representative closed crate near product; and (4) a suitable calibrated probe in a designated sacrificial produce unit or crop-matched surrogate. Select positions to cover plausible vehicle/crate heterogeneity (including an upper/rear location and a protected internal location) without assuming they are equivalent. Record device identity, accuracy specification, response-time evidence, sample interval, calibration/reference check, mounting and retrieval chain. If response time is unknown, qualify it against a reference under an appropriate controlled step before interpreting brief spikes.

At loading and receipt, take actual product-temperature measurements on a predefined representative sample using a suitable calibrated method, keeping air, surface, core/surrogate and quality variables separate. Score delivery quality using partner-approved crop-specific criteria, preferably with consistent/blinded scoring; consider a later agreed holding-period assessment only if feasible. Keep traceable links between temperature channels and quality observations. Do not make any safety inference.

### Stage B — treatment comparison

After Stage A, preregister matched or randomized blocks that change one factor at a time, where operations permit: baseline/current practice; then one lower-cost preconditioning or handling candidate; then a packaging/passive-buffer candidate if its mechanism fits the evidence. Route order/timing is its own arm, only with cooperative/receiver permission and a schedule-feasibility review. Match or block on crop, initial temperature, batch/load size, weather, route version and starting time where possible. Repeat across enough comparable routes to estimate uncertainty; do not treat repeated sensors on one route as independent shipment replications.

### Decision criterion

Before any treatment, the cooperative and relevant receiver define (a) a crop-specific product/quality target and meaningful improvement, (b) data-quality rules for sensors and shipment inclusion, (c) a practical cost ceiling, and (d) who adjudicates outcomes. Advance a candidate only if repeated, traceable comparisons show a practically meaningful improvement on the agreed product-proximate and/or quality endpoint, the uncertainty is acceptable under a predeclared analysis, and its total incremental cost fits the agreed ceiling. An air-only excursion without a corresponding product/quality issue does not justify powered cooling. If a verified product/quality gap persists and lower-cost tested paths do not meet the agreed criterion, commission a separate powered-cooling feasibility/cost proposal; that is not a purchase authorization.

### Practical non-powered alternative

If powered cooling is unjustified or evidence remains inconclusive, continue with a measured improvement package: fixed and documented logger placement; periodic sensor checks; traceable shipment and event records; shade/protection from direct heat during staging where feasible; product-appropriate starting-temperature/pre-cooling control; correct crate vents, loading and airflow; and handling changes selected only after event data and workflow review. This remains a proposal for later authorization, not today's operating instruction.

## Exact clause disposition

“Covered” means substantively addressed in this proposal; it does not mean a case fact was verified. “Owner decision” marks a dependency that the brief leaves open.

| Exact brief clause | Disposition |
|---|---|
| “A produce cooperative uses insulated crates on a morning delivery route.” | Accepted as synthetic setup only; no crate or route properties inferred. |
| “A few logger traces reportedly show brief warm excursions near the middle of the route, but the logger sometimes travels loose on top of the load.” | Covered: possible local-air signal distinguished from product; exact location, attachment, logger response and interval called for. Not classified as a product excursion. |
| “Delivery order changed recently, and customers also began receiving smaller batches.” | Covered: both are contemporaneous confounders affecting timing, load thermal mass and exposure; obtain dated route/batch records, do not assign causality. |
| “The cooperative wants a research proposal before purchasing powered cooling.” | Covered: staged evidence/cost decision gate precedes a separate feasibility proposal; no purchase recommendation from present evidence. |
| “There are no raw traces, product-temperature readings, route records, or verified quality outcomes.” | Accepted. No case analysis or outcome claim is made; baseline collects these measurements. |
| “The project setting is synthetic.” | Preserved; no contact, trial, operational change, or claim about a real cooperative. |
| “Spend the 60-minute research window developing a proposal to investigate the excursions and compare feasible ways to improve route conditions.” | Covered by mechanism analysis, baseline and treatment comparison. No route-system build. |
| “Explain the transport and measurement mechanisms, research relevant implementation history, and propose a later pilot with defensible endpoints.” | Covered in mechanisms, history and pilot sections; product types and quality criteria remain owner decisions. |
| “Provide a useful alternative if powered cooling is unjustified.” | Covered in the recommendation and non-powered alternative section. |
| “Do not build a routing system or issue operating instructions for today's shipments.” | Preserved; no product or live instruction; proposed future route arm is permission-gated. |
| “Distinguish logger air readings, actual product temperature, delivered quality, and food safety.” | Covered as four separate evidence classes. No food-safety or quality result is inferred from air. |
| “Compare passive packaging or preconditioning changes with route or handling changes and a useful measurement-placement alternative.” | Covered in comparison table; measure-first path, passive/initial-condition path, and operational path have distinct mechanisms and costs. |
| “Consider door or crate opening, load size, initial conditions, route timing, and sensor response rather than treating every short spike as a product excursion.” | Covered; all are baseline variables, confounders or measurement limits. |
| “Investigate the route and packaging history and the conditions reported by comparable implementations before transferring their claimed benefits.” | Comparable published implementations and their exact conditions/limits reviewed (S1, S4–S7). Cooperative-specific history is absent; records to request are enumerated. No external product claim transferred as a local effect. |
| “Propose a pilot with a baseline, traceable shipments, relevant measurements, practical costs, and a decision criterion; label future validation separately from analysis actually executed.” | Covered in Stage A/B, cost accounting, and explicit execution status. Future validation remains unperformed. |
| “Do not declare safe storage limits, shelf life, compliance, or product suitability from unverified air-temperature traces.” | Preserved; none is declared or numerically set. |
| “Do not alter deliveries, enter customer systems, contact customers, purchase cooling equipment, or run a live trial.” | Preserved; no such action taken or proposed for this stage. Future operational arms require approval. |
| “Do not invent route timings, thermal properties, produce types, logger response, or quality results.” | Preserved; only route-study values are identified as published analogue conditions. Case values remain unknown. |
| “Product types, initial temperatures, crate construction, logger specifications, packing practice, stop durations, outdoor conditions, and acceptable quality loss are unknown.” | Preserved, and each is listed as an unresolved input for baseline/design. |
| “There is no supplied cost ceiling or agreement that route order may change.” | Preserved as owner decisions; no price, route change, or target is assumed. |
| “Identify which questions must be resolved before alternatives can be fairly compared.” | Covered in the ten-item owner/partner decision list. |

## Corrections, optional improvements, rejected conclusions, and uncertainties

**Correction/clarification to avoid a misleading reading:** “logger on top” does not make the reading inherently useless. A documented warm-zone air reading can diagnose cargo-space exposure (S1); it cannot be relabeled as produce temperature or quality. A location described only as “loose on top” is insufficiently reproducible.

**Optional improvement to the brief's investigation method:** Preserve a standardized warm-zone air channel while adding crate-interior and crop-proximate channels. This allows comparison rather than discarding the historic channel. Collect synchronized stop/opening events so a short spike can be linked to an operational event without assuming causation.

**Owner decisions:** Crop-specific products/targets; accepted quality-loss definition; cost ceiling; sensor access and measurement protocol; shipment traceability/data ownership; route-order/departure permission; customer/time-window constraints; feasible packaging/pre-cooling options; and who handles any separate safety analysis.

**Rejected or unsupported at this stage:** Buying or sizing powered cooling; deciding that a short air spike heated product; asserting that recent route order or batch changes caused spikes; carrying over PCM or insulation percentage benefits from a different crop/route; declaring shelf life, safety, compliance or product suitability; using a one-route demonstration as efficacy evidence; and solving by a routing software system.

**Still uncertain:** Every case-specific value and cause, including product, crate, load, initial temperature, logger response, stop and opening duration, route/weather, quality outcomes, acceptance threshold, labor capacity, costs, and route-change permission. The available history concerns published analogues; no cooperative manifest, crate revision history or shipment outcomes were supplied.

## Work actually executed versus proposed

**Executed:** Read the supplied synthetic brief and assignment; performed an independent literature search; opened FAO source texts and the publisher page for S7; retrieved publisher-indexed bibliographic/method/result snippets and version notes for S4–S6. Full MDPI article fetches returned HTTP 429; the Elsevier S6 article fetch returned HTTP 403, so those statements are limited to returned indexed material. Saved the discovery and structured source map, then ran the single-use reveal helper once. It reported the discovery SHA-256 above and wrote this stage's revealed-plan.md; only that released copy was read.

**Not executed:** No logger trace or route record was available or analyzed; no product measurement, calibration, field audit, thermal model calculation, quality scoring, pilot, powered-cooling assessment, trial, customer contact, operational change, or independent validation was run.

**Proposed future validation:** baseline shipment logging, response/calibration checks, matched/blocked treatment comparisons, crop-specific quality scoring, and cost/decision analysis described above. These are proposals only and require owner/partner decisions and later authorization.
