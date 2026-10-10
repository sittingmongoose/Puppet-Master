# Independent critic review — ER12-D-R2-02-FRESH

Run: D-R2-02-control · Stage: critic  
Review completed: 2026-10-10T07:16:08Z  
Original brief: `control/inputs/brief.md`  
Revealed plan: `stages/investigator/revealed-plan.md`

## Review boundary and activation

The actual native Goal activation response is preserved verbatim as returned in `native-goal-create.json`. Its observed fields show threadId `01a124a8-7034-7d02-bed2-a33c7202ea9e`, the required immutable objective, status `active`, tokensUsed/timeUsedSeconds `0`, and createdAt/updatedAt `1791616392`. The exact-goal binding guard passed. Provenance and freshness remain UNKNOWN beyond that checker. This critique is saved before completing that same Goal.

I read the full assigned brief, investigator `discovery.md`, `draft.md`, `source-map.json`, the carried `sources/index.md`, and the exact revealed plan and its reveal record. I independently checked the listed primary/government/research sources S01–S11; my source identities, access notes, conditions, and limitations are in `source-map.json` and `sources/index.md`. I did not inspect any case traces because none were supplied, and I did not run a model, sensor test, pilot, or other validation.

## Overall assessment

The investigator package is careful and broadly faithful to the original brief. It keeps logger-air readings, product temperature, delivered quality, and food safety separate; treats the route-order and batch-size changes as confounded; and does not invent a crop, logger behavior, route timing, quality outcome, or purchase threshold. Its measurement alternative, passive/preconditioning candidates, route/handling comparison, history reconstruction, pilot baseline, traceability, cost categories, decision gate, and proposed-versus-executed distinction are all present.

The independent source checks support the key qualitative claims and the stated transfer limits. I found no material wrong or unsupported claim in the reviewed package. The three refinements below improve plan coverage and prevent two phrases from carrying more precision than their evidence supports.

## Findings

### C01 — Material incomplete: explicitly dispose of the simplified-model opportunity

**Locator:** Revealed plan, “Mechanism opportunity”; draft, “What the brief supports” and “Mechanisms and evidence from comparable implementations” (especially the air/product and load-size discussion), and “Proposed validation versus executed work.”

The draft explains relevant heat-transfer and measurement mechanisms, identifies discriminating future measurements, and clearly states that no thermal model or toy trace was run. The revealed plan also asks the researcher to explain the limits of any simplified thermal model. The draft does not explicitly say whether a simplified model is inappropriate for this brief or what its limits would be. With product type, starting state, crate geometry, thermal properties, logger response, and route exposure all absent, declining a quantitative estimate is reasonable; the report should say so directly. If a later model is considered, describe it only as a bounded sensitivity illustration using measured inputs, checked against product-like measurements, and not as evidence of actual product temperature, quality, or safety.

This is a plan-coverage gap, not a reason to invent inputs or reduce the study scope.

### C02 — Minor wording: distinguish a thermal criterion from a quality target

**Locator:** Draft, “Endpoints and practical cost” (the phrase “duration/magnitude of deviation from a product-specific quality target”); see also “Decision rule.”

The brief requires thermal and quality evidence to remain distinct. The surrounding draft does this well, but this phrase can read as if a quality target were itself a product-temperature threshold. Name the thermal endpoint separately (for example, product-like temperature relative to a crop-owner-approved temperature criterion, if one is established) and define quality outcomes separately with the produce owner. Do not derive either criterion from the loose air logger.

### C03 — Minor wording: qualify the 42% citrus comparison

**Locator:** Draft, “Mechanisms and evidence from comparable implementations,” “Airflow, crate and load pattern” row; source S10.

The primary article’s 42% contrast is between Nova mandarins in Opentop cartons and Eureka lemons in Supervent cartons. Because the compared fruit and packages differ together, that number is not an isolated package-only effect. The draft already limits transfer to the particular citrus precooling context and separately reports that wrapping slowed cooling. Tighten “particular package comparisons” to say that the largest reported contrast involved different fruit/package combinations; use it as evidence to inspect packaging and airflow, not as a package-effect estimate for this cooperative.

### C04 — Honestly unresolved external inputs

**Locator:** Brief, “Still unresolved”; draft, “What the brief supports,” “History to reconstruct before comparing interventions,” and “Proposed pilot.”

The actual route/package history, crop and lot, initial temperatures, logger identity and response, crate design, stop/open durations, outdoor conditions, quality-loss criterion, cost ceiling, and route-change permission remain unavailable. The draft correctly marks these as future records or owner decisions and does not infer them. The candidate artifact also provides no independently verifiable elapsed-time record for the requested 60-minute research window; timing compliance therefore remains UNKNOWN, rather than a finding that the window was missed.

## Brief and revealed-plan disposition

| Obligation or plan opportunity | Assessment |
|---|---|
| Explain heat, air/product response, door/opening, thermal mass, load size, initial state, route timing, sensor response, and competing explanations | Covered in draft mechanisms and baseline variables; keep the C01 model disposition explicit. |
| Separate air, product temperature, quality, and food safety; avoid safety/shelf-life/compliance claims | Covered and consistently bounded. |
| Compare passive packaging/preconditioning, route/handling, and measurement placement | Covered with conditional PCM, existing staging/preconditioning, evaporative screening, separate operational comparisons, and mapped air/product-like channels. |
| Research route/package history and implementation conditions before transferring benefits | Covered as a future dated reconstruction plus context-specific published comparators. Actual cooperative history remains unresolved because no records were supplied. |
| Propose traceable baseline, repeated matched comparisons, endpoints, costs, and a decision criterion | Covered. The pilot is future work; quality targets, sample count, uncertainty standard, and costs are appropriately left for baseline/owner agreement. Apply C02 wording refinement. |
| Preserve boundaries and distinguish executed work from proposed validation | Covered: no current shipment changes, purchase, customer contact, live trial, trace analysis, sensor test, or product-quality/safety assessment is claimed. |

The draft does not select an intervention as the winner. The no-purchase path remains useful: establish what the sensor measured, preserve the existing crate/load, and test only changes supported by the baseline. No repair or final rewrite is included in this critique.

## Independent primary-evidence check

| ID | Result |
|---|---|
| S01 | USDA-ARS Handbook 66 (2016), initial-cooling section: supports treating precooling separately and not relying on highway trailers for initial cooling; the cited methods remain crop/package dependent. |
| S02 | UF/IFAS transport publication: supports faster air changes than product changes, recorder location documentation, and mapped positions. Its three-position guidance is for transport equipment, as the draft says. |
| S03 | WUR record and article abstract confirm 108 sensors in one Greece–Switzerland citrus shipment, rear measurements in 30 more shipments, incomplete room precooling after 24 h, and middle-trailer reheating associated with insufficient pallet ventilation. These conditions are not transferable to the cooperative. |
| S04 | Publisher article confirms the orange-crate PCM field comparison, reefer-off winter run, overnight conditioning, unloading-related spikes, and the abstract/method duration discrepancy. The reported sensors represent crate-area air, not product pulp or delivered quality. |
| S05 | Publisher abstract confirms the artificial-apple prototype comparison (within 5% of ten apples; water-filled simulators differed up to 16%). The draft correctly requires crop/route validation. |
| S06 | Publisher abstract and linked article confirm a specific 11 m³ refrigerated body, dill/parsley, and door-duration measurements; the air/empty-body findings are treated only as event-monitoring context. |
| S07 | FAO 2009/08 record and abstract support reusable-crate handling, cleaning/sanitization, and management-system history; it is not thermal-performance evidence. |
| S08 | University repository abstract confirms duck-cloth-wrapped crate trials on named produce; full document is unavailable there. The draft keeps it as a screening lead. |
| S09 | Publisher abstract confirms Thai chamber conditions, airflow range, hollow-ball thermal load, and separate lettuce mass-loss comparison. The draft does not transfer the air result to produce core or this route. |
| S10 | Publisher abstract and accepted-manuscript metadata confirm a 40-pallet commercial citrus forced-air study, airflow-direction heterogeneity, wrapping effects, and the cross fruit/package comparison noted in C03. Full-text access was unavailable through the publisher page during the source-map research; the candidate map records abstract-level limits. |
| S11 | Publisher abstract confirms PCM plates charged at a separate facility, road–rail container scale, four produce types, and the reported up-to-94.6-hour discharge. The draft correctly treats this as conditioning/autonomy context, not a crate-insert prediction. |

See the navigable independent source ledger at `sources/index.md`.