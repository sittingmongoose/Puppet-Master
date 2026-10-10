# Intermittent vibration warnings on a maintenance cart

**Case:** ER12-D-R1-02-FRESH  
**Run / stage:** D-R1-02-control / reviser  
**Disposition:** Evidence-gathering proposal; no physical diagnosis, product, or field threshold.

## Proposal

Treat the warning as an observation produced by an unknown logger rule, not as evidence of a defect. First recover the logger, sensor, mounting, warning, and operating records. Then decide with the pilot owner whether the useful endpoint is repeatability, location accuracy, or diagnostic utility. The comparison should begin with stable acquisition and a repeatable baseline, separate measurement-chain checks from operating-condition changes, and use a synchronized independent local reference where feasible.

A repeated warning at a mapped location can justify asking qualified engineering staff to inspect. It does not identify a wheel, cart, bracket, or track defect. A reference response at the same place strengthens evidence of a local response; a null from one fixed reference does not rule out a persistent cart event or clear the route. Any future study remains subject to site approval and qualified operation. It must not become a safety clearance, field warning limit, or monitoring product.

## Original brief preserved

> # Intermittent vibration warnings on a maintenance cart
>
> Case ID: ER12-D-R1-02-FRESH
> Slot ID: D-R1-02
> Domain: transport instrumentation
>
> ## Project situation
>
> A maintenance team is trialing a battery vibration logger on a cart used along a disused test track. Several warnings cluster near one bend, but the same cart also carries different tool loads on different days. The logger was moved to a new bracket shortly before the warnings increased. The team wants to know whether a research pilot could make the observations interpretable. No raw recordings, sensor specification, track survey, or fault diagnosis are available. This is a synthetic test-track scenario.
>
> ## Request
>
> Spend the 60-minute research window producing a proposal to investigate the reliability and meaning of these vibration observations. Explain the sensing and mechanical mechanisms, compare useful instrumentation and observation alternatives, and examine implementation history that could matter. Propose a controlled later study that can inform whether further engineering inspection is warranted; do not create a monitoring product.
>
> ## Requirements to preserve
>
> - Distinguish detecting an unusual signal, locating a repeatable event, and diagnosing a physical defect.
> - Compare changes in sensor mounting or acquisition with a repeatable-pass protocol and a useful independent observation or reference-instrument alternative.
> - Address speed, load, mounting, sample timing, and background machine behavior as possible interacting explanations.
> - Investigate the bracket change and the operating history of comparable implementations, including what evidence supports transfer to this cart.
> - Propose synchronized comparisons, controls, and a meaningful escalation decision; report future validation separately from any desk simulation or data check actually executed.
>
> ## Boundaries
>
> - Do not diagnose track or wheel safety, authorize vehicle use, or substitute the proposal for a qualified inspection.
> - Do not run the cart, access a live railway, install sensors, or tune a field warning threshold in this assignment.
> - Do not assume warnings are true defects or fabricate sensor readings, frequencies, or sampling capability.
>
> ## Still unresolved
>
> The logger range, sampling and timestamp behavior, mounting rigidity, wheel condition, path repeatability, speeds, loads, and warning logic are unspecified. We have not decided whether the relevant future outcome is repeatability, location accuracy, or diagnostic utility. Identify these dependencies.
## Released-plan clauses preserved

The following clause text is copied from the exact revealed plan. The proposal below responds to each clause while keeping the plan’s open decisions and release boundaries intact.

> ## Research question and incompleteness
>
> What research and later comparison design would establish the evidential meaning of an intermittent vibration warning before any physical-fault claim is made?
>
> The future test authorization, acquisition access, physical inspection reference, and primary endpoint remain open. The proposal should choose an evidence-gathering sequence that has value even if the logger cannot support the originally imagined diagnosis.
>
> ## Meaningful useful alternatives
>
> Consider improving mounting characterization, acquisition or time synchronization, repeatable passes with documented load and speed, position-reference observations, and independent inspection or a reference sensor. Recording operating context without changing the logger is a useful first step when attribution is weak. A simpler manual event map may be preferable to additional automated processing for some decisions. No sensor or analysis method is predetermined.
>
> ## Mechanism opportunity
>
> Investigate how excitation, mounting transfer, cart dynamics, sample timing, and location estimates contribute to a measured event. Aliasing, clipping, bracket resonance, and varying exposure are hypotheses to evaluate against actual specifications, not claimed causes. Explain which kinds of evidence support event detection versus location or diagnosis, and which comparisons could reveal a sensing artifact.
>
> ## Implementation and history opportunity
>
> Seek implementation histories with sensor placement, acquisition settings, vehicle conditions, reference observations, and failure or drift reports. Results from a different vehicle or infrastructure context may not transfer. The bracket relocation motivates recovery of installation dates and practices, but no before-and-after evidence is already supplied. Historical algorithm performance without the sensing chain and operating context is insufficient to justify a field claim.
>
> ## Proposed versus executed validation
>
> A later authorized test-track pilot could coordinate repeat passes, documented speed and load, timestamp or position references, and reversible mounting comparisons. It should explain independent observation, repeated events, false warnings, and inspection escalation without presuming ground-truth faults. Simulated signals or a sampling illustration performed during the hour count only as desk checks under explicit assumptions; no field detection accuracy, safety, or defect diagnosis has been validated.
>
> Authoring status: only synthetic input files have been prepared. No scientific search, pilot, experiment, data collection, implementation, or performance validation has been performed for this case. Future researchers must state the actual extent of any work they execute.
>
> ## Scope and release boundary
>
> The topic is sized for a full 60-minute research-and-proposal session: substantive evidence discovery, causal reasoning, comparison of useful alternatives, implementation/history investigation, and a coherent later validation design. The proposal may contain reasoned provisional choices, but the case provides no predetermined winner. It requests no product build. Preserve brief.md and plan.md exactly for later paired freezes. D inputs remain sealed until the exact recipe and budget lock; provide no designer feedback before the candidate set finishes. Input readiness does not assert that those release conditions have been satisfied.

**Response:** The remaining sections answer the research question, compare the named alternatives, state conditional mechanisms and transfer limits, propose the authorized-later study, separate results from proposals, and preserve the endpoint, access, and release decisions as open. The plan’s authoring-status paragraph describes the state when the case was authored; the reviser’s subsequently executed documentary work is reported separately below.
## What the warning can establish

1. **Detection:** the logger or configured rule marked a signal unusual. Without its rule, range, sample clock, filters, firmware, thresholds, and raw data, a warning cannot be compared reliably across days.
2. **Location:** a signal can be tied to a route point only when repeated passes align to a surveyed marker or position reference with direction, speed, and timing checked. A peak at a time is not itself a track coordinate.
3. **Diagnosis:** attributing a physical defect requires independent physical evidence and qualified inspection. A reference channel may corroborate a co-located response, but does not by itself diagnose a defect or make a safety judgment.

The bracket move precedes the increase in warnings, so changed coupling, orientation, fastening, or bracket flex is a plausible measurement-chain explanation, not a causal finding. Vehicle and track excitation also pass through the wheel or caster, cart frame or suspension, sensor mount, sensor orientation, logger acquisition, and warning logic. Speed can alter response and time-to-distance mapping. Load amount and placement can alter loading and dynamics. Motor, drive, braking, wheel condition, route, and direction may also change the signal.

Acquisition can affect the apparent event: range limits may clip peaks; inadequate sample timing or filtering may alias, smooth, delay, or omit content; gaps or timestamp behavior may misplace a time peak. These are audit questions, not known cart properties. No sensor frequency, sample rate, defect, or fault probability is inferred.

## Documentary evidence and transfer limits

The source index and full records are in [sources/index.md](sources/index.md) and [source-map.json](source-map.json). Source IDs S01–S13 are retained as assigned in the investigator map.

- **Mounting:** ISO 5348:2021 describes how contacting sensor mounts can affect frequency response and measurement fidelity (S01). TE and Endevco materials describe coupling stiffness and adhesive practices for particular mounting methods and sensor conditions (S02–S03). They support checking mount type, orientation, fastening, and stiffness. Their specific adhesive, temperature, or frequency guidance is not a prescription for unknown cart hardware.
- **Repeated rail measurements:** the Irish in-service study reports 60 train passes over two months, speed-related selection/correction, and comparison with a Track Recording Vehicle (S04). It supports recording speed and using repeated passes and a reference, not transferring a threshold or response.
- **S05 primary-source recheck:** the Taylor & Francis paper describes an in-cab demonstrator synchronized with Network Rail measurement-train data using time/GNSS and speed comparisons. It explicitly reports that the subsequent Run 36 captured the same known fault as Run 25; the paper also notes a longitudinal offset due to differing GNSS antenna positions. Its repeated-fault result is therefore supported, contrary to critique C1’s claim that only section-level statistics were established. The paper’s route, train, known fault, sensor placement, and processing do not establish cart performance. Its vertical comparison was stronger than its lateral comparison, and the authors identify speed effects and missing speed compensation as limits (S05).
- **Operational history:** a regional rail deployment reports use from October 2020 to August 2022, a data gap around inspection/software updates, same-train analysis because vehicle changes affect readings, and position/speed limitations. Its two sections give inconsistent starts for the data gap; retain that source caveat. It is history for audit planning, not a cart method or threshold (S06).
- **Load and acquisition example:** a tank-wagon paper compares empty and loaded runs at different speeds, so load is confounded with speed. It reports 19.2 kS/s hardware, 0.02-second export intervals, and later 50-ms/20-Hz text without reconciling the cadence. This supports inspecting actual files and separating factors; neither rate transfers to the cart (S07).
- **S08 primary-source recheck:** a 1:10 rail rig measured optical speed, MEMS acceleration, and fixed track strain channels synchronized by a rail-gap trigger. The paper says a fixed strain gauge responds when the vehicle passes its location and cannot register a remote defect’s local response. This supports both a synchronized reference design and critique C2: a null at one reference cannot rule out a repeatable event elsewhere, a cart-side source, or a coverage/acquisition problem. The scale, track, and setup do not transfer to the cart (S08).
- **Configuration examples:** the LSM6DSM datasheet and application note show that timestamp storage, filtering, anti-aliasing, and bandwidth can depend on exact device configuration. A support answer discusses one configuration-specific timestamp report. The cart’s sensor is unspecified, so none of these identifies a cart issue, fix, or default (S09–S11).
- **Bracket and service history:** a metro study reports a mode near 61 Hz for its particular bolted C-shaped bogie bracket, sensor, and rail environment; it supports bracket dynamics as a mechanism to check, not a cart frequency or failure finding (S12). A Siemens release reports an early point in a six-month trial on 80 South Western Railway trains using a GSM-R platform. It is vendor-reported and supplies no independent performance metrics on that page; it is context only (S13).

The primary-source checks in this reviser stage focused on S05 and S08, the disputed claims. Other documentary descriptions are carried with the exact conditions, access limitations, and applicability recorded in the source map; this stage does not claim to have re-opened every cited source.

## Alternatives and what each can answer

| Approach | Useful question | Limitation |
|---|---|---|
| Recover logger settings, warning logs, raw files, and configuration history | Did settings, timebase, range, filtering, or firmware change with the warning count? | Cannot identify a physical cause from warning metadata alone. |
| Written run sheet and manual event map using surveyed markers | Do reports recur at the same route segment and operating context if logger timing or location is unreliable? | Less precise than a validated synchronized system; still does not diagnose a defect. |
| Fixed-configuration repeat passes | Does a signal recur under matched route, direction, speed, load configuration, and machine state? | Repeatability does not establish physical cause. |
| Old/new mount comparison on a qualified fixture | Does changing only the bracket or mount alter the response under matched excitation? | Requires safe, characterized fixture and mount records; a mount effect does not rule in or out a track or cart issue. |
| Calibrated reference accelerometer or geophone near the bend | Is there a local response at the reference point at the same time and mapped position as the cart event? | Local coverage only; amplitudes from different mounting paths are not directly interchangeable. |
| Track strain/displacement or qualified inspection | Is there independent local structural response or physical evidence? | Requires qualified staff and authorization; a local measurement is not a route-wide survey. |
| Calibrated simultaneous multichannel DAQ | Is the current logger limited by raw-data access, range, timing, or filtering? | Choose its range and sample rate only after identifying the needed band and conditions; do not copy example rates from another system. |

## Proposed later study

All physical work below is proposed only. It is not authorization to run the cart or install equipment.

### 1. Decide the endpoint and recover records

The pilot owner should select whether the primary endpoint is (a) repeat detection under matched conditions, (b) location error relative to surveyed markers, or (c) diagnostic utility judged against qualified inspection. Recover logger and sensor identity, serial/model, firmware, range/full scale, calibration, axis and orientation, sample rate/timebase, filters, raw channels, warning rule/version, export path, and all setting changes. Recover old/new bracket drawings, material, fastening/torque, installation dates, mount point, and any repair history.

For each pass, record direction, surveyed route and bend markers, speed profile, secured load mass and position, wheel/caster condition, battery state, and motor/drive/brake state. If time or location cannot be trusted, start with a manual event map or bench characterization; do not claim precise localization.

### 2. Characterize the mount and acquisition separately

If old and new brackets exist and qualified staff approve, compare them on a safe fixture using the same sensor/logger, axis, and matched excitation. Record a characterized reference accelerometer at the bracket base. Check fastening, mount stiffness, resonance, orientation, cable movement, clipping, filtering, sample gaps, and clock drift. A change confined to the cart sensor channel points toward a measurement-chain difference; it does not prove that the cart or track is physically sound or defective.

If logger specifications or raw access prove inadequate, compare against a calibrated simultaneous DAQ with documented configuration, common trigger, actual sample intervals, and unfiltered trace. Select bandwidth and sampling only after the target frequency range is known.

### 3. Run controlled, synchronized passes only after authorization

Hold the cart, logger configuration, direction, route, and mount fixed for baseline repeats. Mark start, finish, and bend position on a survey or equivalent route reference. Record speed continuously or at surveyed gates. First measure within-condition variation. Then, if the endpoint and site controls justify it, compare two site-approved speeds and two representative measured, secured load configurations in an interleaved, repeated 2×2 screen. Keep motor/drive/brake state documented and collect only approved stationary motor-off, powered-idle, and operating controls.

Treat each load configuration as a combined mass-and-placement condition. This screen does not isolate mass from placement; if that distinction matters, add separately varied factors in a predeclared follow-on design. Do not change speed, load, and bracket together. If a mount A/B is safe, keep it in a separate block at matched speed and load.

At the bend, a calibrated fixed accelerometer/geophone can test for a local response. A qualified engineer may add strain or displacement if authorized. Align channels with a shared trigger or synchronized clocks checked against surveyed marker crossings before and after runs. A video or manual event log can back up route position. GNSS alone should not be treated as exact; rail studies report position correction and alignment limitations.

### 4. Predeclare replication, analysis, and escalation

The current brief supplies no event rate, baseline variability, or chosen endpoint, so a defensible numeric replicate count cannot be set here. Before data collection, the owner and analyst should define the endpoint-specific precision target, minimum and maximum passes, and stopping rule using initial baseline variation. For repeatability, specify how warning occurrence is estimated and its uncertainty. For location accuracy, specify the allowable position-error uncertainty. For diagnostic utility, specify the independent evidence and qualified inspection decision process. Add runs only at predeclared interim points. If the precision target is not met by the cap, report an exploratory or inconclusive result; do not interpret a small number of no-warning passes as a safety clearance.

Report event frequency by condition, within-condition repeatability, mapped position and timing uncertainty, relation to speed/load/machine state, agreement with the independent channel, and missing or saturated data. Keep the raw-data quality failures visible. Do not tune a field warning threshold.

- If an event repeats at the same surveyed point under controlled conditions and an independent local reference also records a co-located response, request qualified engineering/track inspection.
- If a repeatable mapped cart event has no co-located reference response, do not treat that null as disproof or clearance. Check reference coverage, location, sensitivity, mounting, trigger, clock, and acquisition; consider cart-side sources and repeat the comparison if warranted. Qualified engineering staff should decide whether the persistent event itself warrants inspection.
- If only the cart’s channel changes with bracket/logger configuration while the independent reference does not, investigate the measurement chain first.
- If response changes with speed, load, direction, or machine state, separate those factors in a follow-on design. Such association is not a defect diagnosis.
- If events do not repeat or time/location quality is inadequate, report inconclusive evidence. Absence of a repeated warning does not establish safety.

## Critique disposition

| Criticism | Disposition | Revision |
|---|---|---|
| C1: S05 does not establish repeated detection of the same discrete fault/location. | **Reject the unsupported-finding conclusion; amend for precision.** | The Taylor & Francis full-text result reports that Run 36 captured the same known fault as Run 25, with NMT/time/GNSS and speed alignment; it also notes a GNSS antenna-position offset. State the paper’s bounded rail result and transfer limits. |
| C2: no branch for a repeatable mapped cart event with a null local reference. | **Accept and amend.** | Add reference coverage and quality checks; a null at one fixed point cannot rule out a remote event, cart-side source, or measurement issue. Let qualified engineering decide whether a persistent mapped event still warrants inspection. |
| C3: “diagnosis” could imply that a reference response attributes a defect. | **Accept and amend.** | A reference can corroborate a local response. Defect attribution and safety judgment remain with qualified inspection. |
| C4: “enough” passes and “stable comparison” lack a replication or stopping rule. | **Accept and amend.** | Keep the sample count conditional on the owner-selected endpoint and baseline variation; define a precision target, minimum/maximum passes, and predeclared stopping rule. If unmet by the cap, report exploratory or inconclusive. |
| Load amount and placement are combined in the proposed two-level load screen. | **Accept as a limitation; make explicit.** | Treat each as a combined load configuration. Do not attribute an effect to mass or placement separately unless a follow-on design varies them independently. |

The primary source map supports rejecting C1’s claim that the article only reports section-level statistics: it also explicitly describes the same known fault captured on the repeated run. The critique correctly identifies the null-reference branch, the need to clarify the diagnosis wording, and the need for a replication/stopping rule.

## Covered, rejected, uncertain, and owner decisions

**Covered:** detection versus location versus diagnosis; logger and mount audit; speed, load, timing, mounting and machine-state controls; repeated passes; independent local reference; synchronized position; comparable implementation history; and qualified escalation.

**Rejected as unsupported:** that the new bracket caused the increase; that the bend is defective; that a warning is a true defect; that no repeated warning clears the cart or track; that railway thresholds, frequencies, transfer functions, or sample rates apply to the cart; or that an automated product is needed.

**Still uncertain:** logger/sensor/firmware/settings and raw samples; usable range/band and timestamp quality; bracket geometry, stiffness, axis and fastening; wheel/caster condition; route and direction repeatability; speed and load distributions; warning logic; endpoint; access and reference feasibility; and the qualified test authorization.

**Owner decisions:** choose the endpoint; authorize any future test-track operation and qualified oversight; identify available records and safe representative loads/speeds; decide whether bench-only evidence is enough; and select a local reference instrument or inspection path. No threshold, safety disposition, or preferred product is predetermined.

## Proposed versus executed work

**Executed in this reviser stage:** read the assigned brief, frozen investigator discovery/draft/source map, exact revealed plan and plan-reveal record, independent critique and critic source map; reviewed the source indexes; and rechecked primary publisher text for S05 and S08. The S05 publisher text directly supports repeat capture of the same known fault in its specific Network Rail demonstrator; the S08 paper confirms the local coverage limit of a fixed strain reference.

**Not executed:** no raw cart or track data analysis, simulation, numerical check, bench test, physical run, installation, field validation, safety assessment, or product build. The logger’s performance, location accuracy, and diagnostic value remain unvalidated.

**Proposed only:** records audit, mount/acquisition comparison, controlled repeat passes, synchronized reference measurements, endpoint-specific analysis, and qualified escalation as described above.
