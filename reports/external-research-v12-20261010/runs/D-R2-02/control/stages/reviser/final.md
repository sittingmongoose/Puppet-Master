# Final research proposal — Temperature excursions during a cooperative produce route

Case: ER12-D-R2-02-FRESH · Run: D-R2-02-control · Stage: reviser
Prepared: 2026-10-10 UTC

## Executive recommendation

Do not authorize a powered-cooling purchase based only on the reported top-of-load logger spikes. First establish whether the spikes are local air readings, whether the produce’s temperature changes, and whether a product-specific quality outcome changes. A short air spike is real at the sensor but does not establish the temperature history of the produce or a food-safety outcome.

Start with an observational baseline that records logger position, an in-crate air position, a produce-core or crop-matched artificial-fruit position, initial product conditions, load/crate arrangement, route stops and door openings, and destination quality. In the same baseline, reconstruct the route and package changes. Then compare one passive packaging or preconditioning option with current practice, followed separately by one approved route/handling option. Keep measurement improvements as a useful outcome if no product problem is established. None of these options is selected as the winner before cooperative data exist.

## What the brief supports

The setting is synthetic. No trace, product temperature, route manifest, product identity, crate specification, sensor model, quality outcome, stop duration, outdoor condition, or budget is supplied. The only operational reports are short warm readings around the route midpoint, a logger sometimes loose on top of the load, a recent route-order change, and smaller customer batches.

Air, product temperature, quality, and food safety are different evidence layers. A loose top logger measures its own local environment. Air responds faster to openings and airflow than produce pulp; actual product response depends on starting temperature, size, thermal properties, exposure duration, crate/package and airflow. Sensor response and sample interval can also hide or reshape short events. Quality depends on crop, variety, harvest maturity, damage and postharvest history as well as the product’s time-temperature history. Food safety is a separate question requiring an appropriate process-specific assessment. There is no basis here for safety limits, shelf-life claims, compliance, suitability, or a quality conclusion.

A smaller batch and a route-order change can alter multiple conditions at once: total thermal mass, how full each crate is, open space and airflow, stop timing, number and duration of openings, loading/unloading order and time to delivery. The direction and size of any effect are unknown. Do not attribute the excursions or quality changes to either one without traceable records and comparable observations. A simplified heat-balance model or toy trace is not decision-ready without measured product identity and starting state, crate/load geometry, thermal properties, exposure history, and logger response. None was run. If useful after baseline collection, a later model could be a bounded sensitivity illustration using measured inputs, explicit assumptions and uncertainty, and checks against product-like measurements. It could help explore mechanisms; it could not reconstruct this route or establish actual product temperature, quality, or safety.

## Mechanisms and evidence from comparable implementations

| Mechanism | Evidence relevant to this case | Transfer limit |
|---|---|---|
| Starting thermal state and preconditioning | USDA’s 2016 Agriculture Handbook 66 describes initial cooling as a separate operation for removing field heat. It says highway trailers should not be relied on for initial cooling; forced-air cooling is broadly adaptable but cooling depends on airflow, produce size, package vents and internal packaging [S01]. | The commodity and package determine the method. Handbook examples and storage tables are not a setpoint for unknown produce. |
| Airflow, crate and load pattern | A full-scale commercial citrus study used 108 sensors in one Greece–Switzerland shipment and measurements in 30 additional shipments. The authors observed incomplete room precooling and some fruit reheating in the trailer middle with insufficient pallet ventilation [S03]. A separate full-scale commercial forced-air precooling study of Navel oranges, Nova mandarins and Eureka lemons in a 40-pallet facility found heterogeneity mainly along airflow and slower, less uniform cooling with fruit wrapping. Its abstract reports Nova mandarins in Opentop cartons cooling 42% faster at the pallet outflow side than similarly sized Eureka lemons in Supervent cartons; because both fruit and carton differ, this cross-comparison does not isolate a package-only effect [S10]. | Citrus export precooling is not this short route; no numerical cooling effect transfers, and the 42% cross-fruit/carton comparison is not a package-only estimate. |
| Passive PCM buffer | A 2021 road–rail container study used PCM cold-storage plates charged by a separate facility and reported up to 94.6 hours of discharge in its vehicle-scale setup; the full abstract does not specify the four crop types or all route conditions [S11]. A 2023 short-range Portugal route compared orange crates with PCM alveoli against empty alveoli. The insulated van’s reefer was off during a winter run; crates had been held around 5 °C overnight and were placed near the rear door/right wall. In-crate sensors registered unloading spikes; the authors reported lower temperature variation with PCM [S04]. | Its sensors measured air around produce, not pulp; it was a narrow route/crate/product/weather context with no measured delivered-quality endpoint. The abstract says 8 h while the methods list 08:00–14:05. PCM amount, preconditioning, autonomy, reuse and local economics remain open; the road–rail runtime is not transferable [S11]. |
| Product-like measurement | An artificial-apple prototype was tested against ten real apples; cooling time was within 5%, while water-filled simulators differed by up to 16% [S05]. UF/IFAS guidance also distinguishes cargo air from product readings and calls for exact logger position/time records and multiple mapped positions [S02]. | Validate the simulator for the selected produce and route. An apple model or a three-position trailer layout is not universal. |
| Door and handling events | A multi-drop herb-truck study measured air and humidity changes around door openings for dill and parsley [S06]. The PCM route study also observed temperature spikes during unloading [S04]. | Event timing is a useful covariate; these studies do not predict this produce’s core response, delivered quality or safety. |
| Reusable packaging and evaporative options | FAO’s reusable plastic-crate guide describes crate management, cleaning/sanitization, pooling and reuse [S07]. A 2024 wet-fabric study tested simulated transport under fixed Thai tropical conditions [S09]; a 2018 single-crate evaporative study is available only as an abstract [S08]. | FAO is not a thermal test. S09 used hollow plastic balls as its main thermal load with a separate lettuce mass-loss comparison; neither evaporative study predicts this route without local climate/crop match. |

These comparisons support measuring initial condition and airflow, marking measurement position, recording stop/door events, and assessing a passive buffer as a pilot candidate. They do not establish the cooperative’s route/package history or a benefit magnitude.

## History to reconstruct before comparing interventions

Create a dated timeline from cooperative-held records and, where needed, a short structured interview. Do not contact customers or enter customer systems. Preserve uncertainty when records are missing. For any implementation or procurement report, record the actual produce, packing, weather, dwell, measurement placement, route practice and quality endpoints. Also seek operating failures, downtime, repair/service history, recurring maintenance, spares, conditioning needs and operating costs; an initial performance claim without this context is not a transfer basis.

- **Route:** date and reason for the order change; route versions; planned and actual stop times; departure/arrival; loading and unloading order; time and duration of each crate/vehicle opening; breaks, detours and waiting; vehicle, insulation and refrigeration status, setpoint/controller records if present, pre-trip or maintenance changes; weather and sun exposure.
- **Load and batch:** crop/variety and lot; source/harvest/maturity timing; number and mass per customer order; crate count, fill ratio, position, stacking and total load; whether smaller batches changed pack or handling practice.
- **Packaging:** old/new crate IDs and dates; material, dimensions, insulation, lids, vent area and alignment, liners, dividers, closure and gaps; crate repairs/replacements; pooling/ownership, cleaning and reuse practices; any thermal insert or preconditioning changes.
- **Initial condition:** product temperature at packout and loading, elapsed time since harvest/previous cooling, shade/staging, existing cooling equipment/process, and any difference in practice by produce.
- **Logger:** make/model/serial, channel and sensor type, attachment and exact position, whether inside crate or exposed, accuracy/resolution, response-time specification, sample interval, firmware/configuration if available, calibration/check history, clock/time zone, activation, battery/data gaps and retrieval. Do not infer specifications from a trace.
- **Quality observations:** shipment/lot ID, receiver’s existing grade/defect measures, weight/count, damage, firmness or texture where appropriate, and timing of inspection. Agree an authorized observation point; no current customer data are supplied.

The route-order and batch changes should be treated as separate candidate causes and time-stamped. The same-day before/after comparison is not causal unless crop, initial condition, load arrangement, weather, vehicle and measurement practice are made comparable or recorded for analysis.

## Options for a later comparison

### Passive package or preconditioning

First determine whether the current insulated crate is intact and consistently used. Test whether its lid/closure, liner, fill and arrangement explain air circulation or trap heat. Do not assume that “more insulation” is always helpful: insulation can slow heat entering and heat leaving. If initial produce temperatures are high or variable, evaluate crop-compatible staging/preconditioning with existing capacity before considering equipment purchase. USDA guidance distinguishes preconditioning from transport and lists crop-dependent methods [S01].

A reusable PCM insert is a plausible test if its phase-change temperature matches the selected crop’s owner-approved product conditions and it can be conditioned, handled and returned consistently. The road–rail implementation shows a PCM system can require a separate charging facility; count conditioning energy, labor and storage capacity rather than treating it as free cooling [S11]. Compare matched crates with and without the insert; use the same produce/lot, starting condition, crate fill and route position, then swap positions across repeated runs. Measure both in-crate air and a validated product-like response. Record insert mass/volume, conditioning energy and labor, fit, airflow, moisture/condensation, damage, reuse losses and cleaning requirements. The 2023 orange study supplies a short-route example, not a result forecast [S04].

A shaded, existing cool staging or a crop-compatible existing precooling step may be the lower-cost alternative if the baseline shows warm starting produce. Avoid assuming that transport refrigeration removes field heat [S01]. A wet-fabric evaporative treatment can be screened as another non-powered candidate where local climate, airflow, water management and produce permit; the Thai chamber study is a bounded comparator, not a prediction for this route [S09]. Any ventilation or crate modification should be evaluated for airflow, mechanical protection, water loss and fit; obtain crate-owner approval before structural changes. Full-scale forced-air results for citrus show that carton design and wrapping can materially change cooling in a specific precooler, so the cooperative’s vent, wrap and stack history should be recorded rather than relying on generic crate claims [S10].

### Route or handling

Keep the route unchanged during baseline measurement. If the cooperative permits a later test, change only one operational factor at a time, such as loading/staging, departure timing, or a documented door-open handling process. A route-order or load-size change requires the route owner’s approval; compare matched routes and record actual stop/open durations, outside conditions, load, product, and door-side versus protected positions. Keep timing, route order and handling factors separate where feasible. A different order may change door exposure and time in transit simultaneously, so record both and do not promise a benefit. No routing system is requested or proposed.

### Measurement placement

Use synchronized channels with distinct purposes:

1. Retain an exposed logger at the reported top position as a diagnostic air channel during baseline; mark its exact place and avoid treating it as a product measurement.
2. Put a second logger inside a clearly identified crate at a selected representative or suspected warm location, not directly touching a coolant or a wall.
3. Add a crop-matched artificial-fruit logger or a research-only product-core probe at one or more mapped positions. If a simulator is used, validate its response against the selected produce and the likely heating/cooling transition; the apple validation in [S05] does not transfer automatically.
4. Record logger type, calibration/check, response specification, interval, clock, activation, position, shipment/lot ID and retrieval. Record door-open/stops and load events on the same time base.

For a single small route, positions should be selected from a simple load map and baseline observations; do not blindly copy a trailer layout. The measurement objective is to compare local air, crate environment and product-like response, not to add many untraceable sensors.

## Proposed pilot

**Gate 0 — define the decision.** Before collecting future data, the cooperative and an appropriate produce-quality partner must identify the crop/variety and lots, acceptable quality specification, an operationally meaningful difference, quality inspection timing, feasible data access, route-change permission, sensor/placement plan, available staging, and spending ceiling. Decide whether actual product probes are permitted or a matched simulator is needed. Food-safety assessment, if required, is assigned separately to a qualified process owner; logger air readings will not answer it.

**Baseline phase.** Observe repeated ordinary routes without changing delivery behavior. Choose the number of runs after initial variance is known, including representative differences in product/lot, batch/load size, route/stop pattern and outdoor conditions. Assign a unique shipment/lot identifier and trace it through loading, route and receipt. For each run record:
- product/variety/source/lot, pack/harvest and initial-condition data;
- crate type, condition, fill, position, load map and stack/vent/liner state;
- logger device/configuration/check, interval, clock and exact placement;
- synchronized logger air, in-crate air and selected product-core or validated simulator traces;
- route version, stop/open/loading/unloading times, vehicle/reefer status and outside/sun conditions;
- at receipt, agreed quality observations and direct product-temperature checks, separated by lot and crate position.

Retain the currently used top logger as one channel if access allows; it can help establish what the reported spike represents. A missing trace, unknown logger placement or untraceable shipment remains missing evidence, not an assumed temperature.

**Comparison phase.** Select the best-supported package/preconditioning candidate from baseline and compare it to current practice in matched crates, randomized or position-swapped across multiple runs. Do not change package and route at once. If a route/handling candidate remains plausible and is approved, test it in a separate matched/crossover block. Account for run-to-run weather, batch, starting product temperature and stop duration. Sample count should be estimated from observed variability and the pre-agreed worthwhile effect, not invented from this brief.

**Endpoints and practical cost.** Primary thermal endpoints should remain temperature metrics: initial and arrival actual product-core or validated-simulator temperatures, their mapped variation, and—only if the produce owner establishes a crop-specific thermal criterion before the pilot—the duration and magnitude outside that thermal criterion. Define quality outcomes separately for the chosen crop, such as a repeatable blinded grade/defect scale, firmness or texture where appropriate, mass loss and saleable fraction at delivery plus a fixed follow-up point. Keep all endpoints about quality distinct from food safety. Track cost per route and per saleable crate: sensor purchase/loan, calibration and labor, staging/preconditioning time and energy, PCM/crate cost and recovery/reuse, driver/loading time, added travel/vehicle energy, product sampling/waste, maintenance and any powered unit capital/fuel/energy/maintenance. The cooperative’s ceiling and price/waste values are unknown, so do not quote them.

**Decision rule.** Set the quality target, minimum worthwhile reduction, uncertainty standard and cost ceiling with owners before looking at pilot outcomes. If the baseline shows no repeatable product-response/quality problem, retain existing cooling and adopt only worthwhile measurement or handling improvements. If it shows a repeatable problem, advance the least-cost feasible passive/preconditioning and route/handling comparisons. Consider powered cooling only if it outperforms the best feasible non-powered/handling alternative on the pre-set product-quality endpoint by a worthwhile amount and its total cost per saleable crate is acceptable. A change in logger air alone is not a purchase trigger.

## Exact clause dispositions

“Disposition type” uses **Correction** for limiting an unsupported interpretation; **Optional improvement** for a research method or intervention that can be tested; **Owner decision** for a fact, threshold, authority or permission not supplied. “Preserved” means the synthetic brief’s statement is retained as the scope, not treated as independently verified.

### Project situation

| Exact clause | Disposition | Evidence / next step |
|---|---|---|
| “A produce cooperative uses insulated crates on a morning delivery route.” | Preserved; Owner decision | Treat only as synthetic context. Confirm crate design, vehicle and route before transfer. |
| “A few logger traces reportedly show brief warm excursions near the middle of the route, but the logger sometimes travels loose on top of the load.” | Preserved; Correction | Do not relabel local air as produce temperature. Obtain raw trace, logger model/response/interval, position, calibration and event times; use paired crate/product-like measurements. |
| “Delivery order changed recently, and customers also began receiving smaller batches.” | Preserved; Correction; Optional improvement | They co-occur and can affect timing, openings, load/airflow and thermal mass; reconstruct independent dates and test separately. No causal attribution yet. |
| “The cooperative wants a research proposal before purchasing powered cooling.” | Preserved; Owner decision | This proposal supplies staged measurement and a pre-set investment gate; cooperative sets cost ceiling and quality target. |
| “There are no raw traces, product-temperature readings, route records, or verified quality outcomes.” | Preserved | No case-specific thermal/quality conclusion can be made; baseline and traceability are proposed. |
| “The project setting is synthetic.” | Preserved | No actual cooperative, customer or shipment was contacted or modified. |

### Original request clauses

| Exact clause | Disposition | Evidence / next step |
|---|---|---|
| “Spend the 60-minute research window developing a proposal to investigate the excursions and compare feasible ways to improve route conditions.” | Proposal scope addressed; timing compliance UNKNOWN | A complete conditional desk-research proposal is provided; no live data or pilot was available. No independent elapsed-time record establishes whether the 60-minute window was met. Candidate options are compared below. |
| “Explain the transport and measurement mechanisms, research relevant implementation history, and propose a later pilot with defensible endpoints.” | Addressed | Mechanisms, comparators, history requirements, baseline, endpoints, traceability and costs are included. Pilot is future work. |
| “Provide a useful alternative if powered cooling is unjustified.” | Addressed; Optional improvement | Use correct monitoring plus evidence-based crate/preconditioning and handling improvements; consider PCM only after matched evidence. Evaporative crate or wet-fabric options are screening only until crop and local climate/handling fit are established [S08, S09]. |
| “Do not build a routing system or issue operating instructions for today's shipments.” | Preserved | No system is built; route actions are future, authorized pilot options only. |

### Requirements to preserve

| Exact clause | Disposition | Evidence / next step |
|---|---|---|
| “Distinguish logger air readings, actual product temperature, delivered quality, and food safety.” | Correction | Four separate evidence layers are stated; no safety or quality claim follows from the top logger. |
| “Compare passive packaging or preconditioning changes with route or handling changes and a useful measurement-placement alternative.” | Optional improvement | PCM/current crate or existing preconditioning; a separate route/handling comparison; paired air/in-crate/product-like sensors are proposed. |
| “Consider door or crate opening, load size, initial conditions, route timing, and sensor response rather than treating every short spike as a product excursion.” | Correction; Optional improvement | All are baseline variables; spike interpretation is explicitly unresolved until channels and events align. |
| “Investigate the route and packaging history and the conditions reported by comparable implementations before transferring their claimed benefits.” | Owner decision; Optional improvement | Cooperative history is absent; a dated reconstruction is proposed. The sources report specific product, route, crate, weather, position and precooling contexts with transfer limits [S01–S11]. |
| “Propose a pilot with a baseline, traceable shipments, relevant measurements, practical costs, and a decision criterion; label future validation separately from analysis actually executed.” | Addressed; Owner decision | Baseline, unique IDs, measures, cost categories and decision rule are specified; the required targets/cost ceiling must be set by owners before the future pilot. “Executed” work is listed separately below. |

### Boundaries

| Exact clause | Disposition | Evidence / next step |
|---|---|---|
| “Do not declare safe storage limits, shelf life, compliance, or product suitability from unverified air-temperature traces.” | Preserved; Correction | No such conclusion or numeric limit is supplied. Quality targets must be selected for the chosen produce and food safety assessed separately if needed. |
| “Do not alter deliveries, enter customer systems, contact customers, purchase cooling equipment, or run a live trial.” | Preserved | None of these actions occurred; any future pilot requires cooperative authorization and appropriate permissions. |
| “Do not invent route timings, thermal properties, produce types, logger response, or quality results.” | Preserved | Unknowns remain named; literature conditions are attributed only to their own studies. |

### Still unresolved clauses

| Exact unknown | Type | What must be decided or measured before alternatives can be compared |
|---|---|---|
| “Product types” | Owner decision / measurement | Identify species, variety/cultivar, lot and maturity; choose applicable quality assessment. |
| “Initial temperatures” | Measurement | Measure and record by lot/crate at loading, plus harvest-to-load and preconditioning history. |
| “Crate construction” | Measurement / owner | Document material, dimensions, insulation, closure, vents, liner, condition and vehicle airflow path. |
| “Logger specifications” | Measurement | Identify model/channel, response, accuracy, interval, clock, firmware/configuration and calibration/check history. |
| “Packing practice” | Measurement / owner | Record fill mass/count, crate position, stacking, liners, shade, staging and loading sequence. |
| “Stop durations” | Measurement | Record actual stop, door-open and unloading duration on the logger time base. |
| “Outdoor conditions” | Measurement | Record weather/ambient and sun exposure; no values assumed. |
| “Acceptable quality loss” | Owner decision | Select a crop-specific endpoint and meaningful difference before pilot outcomes. |
| “There is no supplied cost ceiling” | Owner decision | Provide cap, product value/waste value and costs of existing staging, monitoring and candidate equipment. |
| “There is no ... agreement that route order may change.” | Owner decision | Obtain route-owner agreement before any future route/sequence intervention. |

## Corrections, optional improvements, and owner decisions

- **Corrections to interpretation:** a top logger cannot establish product-core temperature; an air exposure cannot establish quality or safety; a single spike does not prove a product excursion; co-occurring route and batch changes do not establish causation.
- **Optional improvements to test:** spatially traceable sensing; use existing suitable shade/staging; correct demonstrated package/load airflow issues; evaluate matched PCM inserts or other passive buffers; improve recorded loading/opening practice; test one route/handling change after baseline.
- **Owner decisions required:** product and crop-specific quality target; acceptable loss and quality inspection; cost ceiling; existing preconditioning access; crate modification approval; permission to alter route/handling in a later pilot; whether direct probes are acceptable; who owns food-safety review.

## Already covered, rejected, and uncertain

**Covered by existing brief/context:** the route/order and batch changes are noted; the top-of-load logger is explicitly retained as a separate measurement; no raw trace, product reading, route log or verified outcome exists; powered cooling is an open investment decision.

**Rejected as unsupported:** diagnosing the midpoint spike as product warming; assigning a universal safe or quality temperature; assuming refrigeration hardware is the cause; assuming smaller loads warm faster or cooler; transferring the orange PCM result or citrus trailer target; claiming a shelf-life, food-safety, compliance or economic outcome; presuming a route-order change is allowed.

**Still uncertain:** all crop, initial-state, crate, sensor, packing, stop, environment, cost and route-permission variables listed above; whether any event is repeatable in the produce; whether a passive or route alternative materially affects agreed quality; whether powered cooling is justified.

## Proposed validation versus executed work

**Predecessor-reported work:** the investigator discovery and draft report desk research against the sources indexed in the investigator source ledger; the critic reports an independent check of S01–S11. Those activities are attributed to their saved artifacts, not re-claimed as newly executed here. **Executed in this reviser stage:** read the assigned synthetic brief and every listed investigator and critic artifact, including both complete source maps and the revealed plan; independently queried the primary S10 publisher record and checked its abstract-level cross-fruit/carton comparison. Direct page opening returned 403, so no full-text recheck was possible. No route trace was analyzed because none was supplied. No thermal model, toy trace, cooling calculation, sensor test, product-quality assessment, safety assessment, pilot, or live trial was run. No powered cooling or delivery change occurred.

**Proposed only:** history reconstruction; baseline routes; sensor calibration/position checks; product-core or validated artificial-fruit logging; quality endpoint measurement; matched passive-package/preconditioning comparison; later approved route/handling comparison; cost and decision review.

The report does not provide operating instructions for current shipments. Source identities and conditions are preserved in [source-map.json](source-map.json); links and navigable locators are in [sources/index.md](sources/index.md).

## Revealed-plan dispositions

| Exact plan opportunity or clause | Disposition in this proposal |
|---|---|
| “Can a bounded thermal and operational study determine whether the reported excursions represent an actionable product problem and which low-complexity intervention is worth testing?” | Addressed as a staged investigation question. The answer remains unknown until traceable product-like and quality observations exist; the proposal does not select a winner. |
| “The product-specific endpoint, access to measurements, acceptable operational variation, and cost comparison remain open.” | Preserved as owner decisions and preparation gates. Product, access, criteria, practical spend and operating permissions are not supplied and are not invented. |
| “Consider improving logger placement and interpretation, crate packing or insulation, preconditioning, managing openings, departure timing, and delivery-order or load-size changes.” | Preserved as conditional candidates. The proposal includes mapped measurement channels, crate/load inspection, existing crop-compatible preconditioning, door/opening practices, departure timing, and separately tested approved route/load changes. Insulation is not presumed to help in every direction. |
| “Powered cooling is one option to investigate against energy, capital, handling, and maintenance costs.” | Preserved as a conditional last-stage comparison using total cost per saleable crate and owner-set criteria, after feasible passive and handling options. |
| “Better measurement with unchanged operations is a useful alternative if the apparent signal is not yet tied to product conditions. No cooling or routing strategy is the expected outcome.” | Preserved. Baseline measurement and unchanged current operation are a useful outcome; no intervention is predetermined. |
| “Investigate heat transfer, initial thermal state, thermal mass, opening exposure, sensor response and placement, and the relationship between air and product observations.” | Addressed through the mechanism discussion and baseline channels/records. Local magnitudes remain unknown. |
| “Explain discriminating evidence and limits of any simplified thermal model.” | Addressed explicitly: no quantitative model is warranted or run from absent inputs. A later measured-input sensitivity illustration is optional, bounded and checked against product-like measurements; it cannot prove actual temperature, quality or safety. |
| “Seek implementation reports with actual products, packing, weather, dwell times, measurement placement, route practices, and quality endpoints. Procurement claims about insulation or cooling require operating context.” | Addressed through the source-specific conditions/limits in the source index and the history-reconstruction requirements. The cooperative’s own history remains unavailable. |
| “Consider operational failures and ongoing maintenance, not only initial equipment performance.” | Added to the evidence request: seek downtime, failures, repair/service, maintenance/spares, conditioning and operating cost history. No such local records were supplied. |
| “A later authorized pilot could document shipments, initial conditions, selected air and product measurements where feasible, openings and stops, and quality observations defined by an appropriate partner.” | Addressed in the proposed baseline and quality-owner gate. No such pilot has been run or authorized by this proposal. |
| “Explain repeated routes, comparable loads and weather, sensor checks, and how costs enter the decision.” | Addressed through repeated representative routes, matched/position-swapped crates, route/weather/load covariates, sensor metadata/checks, practical cost categories and a pre-set decision rule. Sample count waits for baseline variance. |
| “An assumed heat-balance illustration or toy trace analysis actually executed in the research hour cannot establish real product temperatures, food safety, or delivered-quality improvement.” | Preserved and strengthened: no model or toy trace was run; even a later sensitivity illustration cannot establish case outcomes or safety. |
| “The topic is sized for a full 60-minute research-and-proposal session: substantive evidence discovery, causal reasoning, comparison of useful alternatives, implementation/history investigation, and a coherent later validation design.” | Scope preserved. No independent elapsed-time record proves or disproves that the original 60-minute window was met; timing compliance is UNKNOWN. |
| “The proposal may contain reasoned provisional choices, but the case provides no predetermined winner. It requests no product build.” | Preserved; candidates are conditional, and no routing system, product, shipment operation or cooling equipment was built or changed. |
| “Preserve brief.md and plan.md exactly for later paired freezes. D inputs remain sealed until the exact recipe and budget lock; provide no designer feedback before the candidate set finishes. Input readiness does not assert that those release conditions have been satisfied.” | Preserved as release boundary: this work changes only reviser-stage outputs; it does not edit frozen inputs, assert campaign readiness, or contact another stage/designer. |

## Independent critique dispositions

| Critique | Disposition | Final treatment |
|---|---|---|
| C01 — explicitly dispose of the simplified-model opportunity | **Accept.** | The missing crop, initial state, geometry, properties, exposure and sensor response prevent a decision-grade quantitative estimate. No model, heat balance or toy trace was run. A measured-input sensitivity illustration is optional future work, with explicit limits and product-like checks. |
| C02 — distinguish thermal criterion from quality target | **Accept.** | The pilot now defines temperature endpoints separately from crop-specific quality outcomes. A thermal criterion, if useful, must be owner-approved before the pilot; neither comes from loose logger air. |
| C03 — qualify the citrus 42% comparison | **Accept.** | Independent recheck of the primary publisher abstract confirms that the 42% figure compares Nova mandarins in Opentop cartons with similarly sized Eureka lemons in Supervent cartons. Since both fruit and carton differ, it is not an isolated package effect. Airflow heterogeneity and wrapping observations remain relevant only to their full-scale citrus precooling context. |
| C04 — missing case inputs and elapsed-window evidence | **Retain uncertainty.** | Product/route/package/sensor/quality/cost facts and permission remain unavailable. No independent elapsed-time record establishes whether the original 60-minute window was met. This is UNKNOWN, not a finding that it was missed. |

The independent critique otherwise found the candidate broadly faithful and its source claims supported within their stated contexts. Its agreement is not treated as authority; the S10 disposition above rests on the primary publisher abstract check, while all other transferred evidence remains bounded by the cited source conditions.

## Reviser verification status

The actual case remains synthetic. This proposal does not establish any excursion in produce, quality loss, food-safety condition, compliance status, shelf life, or economic benefit. The source claims describe the named publications only. Proposed validation remains future work. The current and prior stage artifacts do not provide raw traces, product data, route logs, a verified quality outcome, or an independently verifiable elapsed-time record for the 60-minute window.

