# Investigator draft — ER12-D-R1-02-FRESH

**Run / stage:** D-R1-02-control / investigator  
**Case:** intermittent vibration warnings on a maintenance cart; synthetic test-track scenario  
**Plan release:** 2026-10-10T06:29:20.975Z; plan SHA-256 `e36e6b3f57dc6773ea3d65d44d3a91777614aefa2c548635892441bd7de1eafc`. Discovery was frozen at SHA-256 `d90437743f7e0de7b1573ff8e0bef49393a9dd9b028c04b7718b5afac1ef0003`.  
Source IDs and bounded locators: [sources/index.md](sources/index.md) and [source-map.json](source-map.json).

## Proposed answer

The warnings justify an evidence-gathering pilot, not a diagnosis. Start by recovering the logger, mount, and operating records; use raw traces and controlled comparisons to determine whether the alert is repeatable and where it occurs. Then compare the cart channel with a synchronized, independent local reference. Escalate a persistent, co-located response to qualified mechanical/track inspection. No result from this pilot would certify safety, authorize cart use, set a warning threshold, or replace an inspection.

A simple manual event map with surveyed markers and a written run log is a valid first option if logger timing or position cannot be trusted. A more elaborate sensor network or monitoring product is not required by the question.

## Clause-by-clause disposition

| Brief clause (verbatim) | Disposition | Evidence or action |
|---|---|---|
| “A maintenance team is trialing a battery vibration logger on a cart used along a disused test track.” | Preserve as given. | No logger model, installation record, route survey, or cart dynamics are supplied. The disused-track setting does not establish current track condition. |
| “Several warnings cluster near one bend, but the same cart also carries different tool loads on different days.” | Treat as observations with confounding. | “Near the bend” is not yet a repeatably measured coordinate. Speed, load amount and placement, direction, and route can vary together. |
| “The logger was moved to a new bracket shortly before the warnings increased.” | Preserve chronology; reject causal attribution from timing alone. | Mount coupling and bracket response can change measured frequency content [S01–S03, S12]. No old/new bracket dimensions, fastening, or paired data are available. |
| “No raw recordings, sensor specification, track survey, or fault diagnosis are available. This is a synthetic test-track scenario.” | Hard evidence boundary. | No values, frequency, sampling capacity, defect, fault probability, or safety state is inferred or fabricated. |
| “Spend the 60-minute research window producing a proposal to investigate the reliability and meaning of these vibration observations.” | Accept. | This is an evidence plan; it is not a product specification or a claim that a field study occurred. |
| “Explain the sensing and mechanical mechanisms, compare useful instrumentation and observation alternatives, and examine implementation history that could matter.” | Accept with bounded transfer. | The mechanism, alternatives, and implementation history are discussed below. Procedures transfer more readily than train thresholds or response values. |
| “Propose a controlled later study that can inform whether further engineering inspection is warranted; do not create a monitoring product.” | Accept. | A staged, authorized pilot and decision rule follow. It creates no service, product, or field threshold. |
| “Distinguish detecting an unusual signal, locating a repeatable event, and diagnosing a physical defect.” | Hard distinction. | Detection = logger rule says a signal is unusual. Location = event recurs at a mapped point after time/distance alignment. Diagnosis = qualified inspection or independent physical evidence attributes a defect. Each requires more evidence than the previous step. |
| “Compare changes in sensor mounting or acquisition with a repeatable-pass protocol and a useful independent observation or reference-instrument alternative.” | Accept all as separate comparisons. | A/B mount or logger work tests the measurement chain; fixed-condition repeated passes test repeatability; a separately mounted trackside channel or inspection tests spatial coincidence / physical condition. They answer different questions. |
| “Address speed, load, mounting, sample timing, and background machine behavior as possible interacting explanations.” | Accept; record and vary deliberately. | Speed changes response and time-to-distance mapping; load amount/distribution changes system response; mounting changes coupling; sample rate/anti-alias settings can alias; range can clip; filters can delay; data paths can drop samples; timestamps can mislocate events; motor/drive/brake/wheel behavior may add vibration. Rail evidence shows speed and vehicle matter [S04–S07]; cart-specific effects remain unknown. |
| “Investigate the bracket change and the operating history of comparable implementations, including what evidence supports transfer to this cart.” | Recover cart change history; qualify external analogies. | No before/after data are supplied. A metro bracket field study found a specific bracket mode near 61 Hz implicated in fatigue, but its C-shaped bolted bogie bracket is unlike an unspecified cart bracket [S12]. Transfer is only that bracket dynamics merit checking, not the frequency or failure mechanism. |
| “Propose synchronized comparisons, controls, and a meaningful escalation decision; report future validation separately from any desk simulation or data check actually executed.” | Accept; see protocol and status sections. | A surveyed route mark/common trigger and speed record align channels; hold cart, mount, direction, and machine state fixed; change one factor at a time; escalate only on repeatable, co-located evidence. No validation was executed here. |
| “Do not diagnose track or wheel safety, authorize vehicle use, or substitute the proposal for a qualified inspection.” | Hard stop. | Nothing in this proposal is a clearance or safety determination. |
| “Do not run the cart, access a live railway, install sensors, or tune a field warning threshold in this assignment.” | Hard stop for this assignment. | No physical activity or field installation was performed. A future study is conditional on site approval and qualified oversight. No numerical warning limit is proposed. |
| “Do not assume warnings are true defects or fabricate sensor readings, frequencies, or sampling capability.” | Hard stop. | All numeric examples belong to cited research hardware and are explicitly not cart specifications. |
| “The logger range, sampling and timestamp behavior, mounting rigidity, wheel condition, path repeatability, speeds, loads, and warning logic are unspecified. We have not decided whether the relevant future outcome is repeatability, location accuracy, or diagnostic utility. Identify these dependencies.” | Owner decisions / required records. | Recover or measure each before selecting an instrument or interpreting an alert. The owner must choose whether the pilot tests repeatability, location accuracy, or diagnostic utility. |

## Released-plan coverage

| Plan section / clause | Disposition |
|---|---|
| Research question and incompleteness | Answered with a staged proposal that remains useful if the logger cannot support diagnosis; test authorization, access to raw acquisition, independent inspection reference, and endpoint remain open. |
| Meaningful useful alternatives | Compared mount/acquisition, repeat passes, position reference, independent sensor/inspection, and logging context without changing the logger. A manual event map is the low-complexity option when time/location data are unreliable. |
| Mechanism opportunity | Treat excitation, mount transfer, cart dynamics, sample timing, and position as hypotheses; aliasing, clipping, bracket resonance, and exposure changes require actual specification/data before any causal claim. |
| Implementation and history opportunity | Sources report sensor placement, acquisition, speed/load/vehicle context, references, operational gaps, and a configuration-specific timestamp issue. Cross-vehicle findings have limited transfer; algorithm performance alone is insufficient. |
| Proposed versus executed validation and scope | Only documentary research and the source map were executed. All bench, field, sync, comparison, and inspection steps are proposed; no empirical validation or product build is claimed. |

## Evidence and implementation history

**Mount and bracket.** ISO 5348 describes how accelerometer mounting can alter frequency response and measurement fidelity, while listing alignment, base bending, cable motion and torque as other relevant influences [S01]. TE and Endevco mounting guidance also tie coupling stiffness, adhesive thickness and mounting type to response, but their recommendations and values are model/material/temperature dependent [S02–S03]. A metro bogie study reports a ~61-Hz mode in its own bolted sensor bracket under rail-corrugation excitation [S12]. Together these support treating the changed bracket as a testable measurement-chain factor; none supplies cart-specific evidence.

**Comparable field systems.** A 2019 Irish in-service train study used accelerometer/GPS data from 60 passes over two months and compared with a Track Recording Vehicle; signal energy varied with speed, so the researchers selected and corrected passes using speed [S04]. A Network Rail demonstrator aligned in-cab acceleration with New Measurement Train geometry using time/GNSS and speed checks; a repeated run detected the same reported location. The authors also report weaker lateral correspondence and reduced correlation at low/changing speed [S05]. These are useful protocol precedents, not proof that a cart logger has equivalent bandwidth, vehicle response, route position, or fault performance.

A 2022 Siemens Mobility release described TBCM in a six-month Network Rail trial on 80 South Western Railway trains, one month into operation, using the existing GSM-R cab-radio platform. It says the development had used simulated vehicle/track interaction and historical raw track data; its early success statement is vendor-reported and has no independent performance metrics on that page [S13]. A 2023 regional-rail study reports measurements from Oct 2020–Aug 2022. Its Section 2.3 attributes little data in Jan–Jun 2022 to inspection/software updates, while Section 3.3 gives a different gap start (Jan 2021–Jun 2022), an internal date discrepancy. It kept the same train because changing train changes readings, and notes uncorrected speed effects and location uncertainty [S06]. This history supports preserving configuration, maintenance, software, speed, and run records. It does not support transferring train thresholds or an automated monitoring design to the cart.

A tank-wagon experiment used six accelerometers at axle/body positions and compared loaded with empty operation. Its reported speeds differed (125 vs 110 km/h), so the comparison does not isolate load. It also reports a 19.2 kS/s amplifier but presents 0.02 s row steps while later describing 50 ms / 20 Hz; the effective saved cadence is unreconciled [S07]. Do not copy its rates: inspect actual cart files, ODR, filters, timebase, gaps, and configuration. In a separate 1:10 rail rig, investigators used optical speed, track strain, acceleration, and a rail-gap trigger to synchronize measurements [S08]. This is a useful design pattern, not a transferable transfer function.

A version-specific example reinforces the configuration audit: ST's LSM6DSM datasheet says FIFO timestamp/step data are disabled by default; AN4987 Rev 5 documents configuration-dependent filters and bandwidth. An ST technical moderator's 2026 answer to one reported jumping-timestamp case points to a disabled FIFO dataset / parser configuration and suggests checks; it is not a confirmed silicon defect or erratum [S09–S11]. Since the cart model and firmware are unknown, no issue, fix, regression, default, or release history can be assigned to its logger.

## Alternatives

| Approach | What it can answer | Cost / limitation |
|---|---|---|
| Recover current logger configuration and raw traces | Whether warning counts/events align with settings, clipping, gaps, timestamp behavior or firmware changes. | Cheapest first step; cannot establish physical source if no raw data or configuration survives. |
| Same sensor/logger, controlled old/new bracket comparison | Whether the bracket/mount transfer changes the response under matched excitation and axis. | Requires bracket records and a safe characterized fixture; changing only the mount may still not identify a track/cart cause. |
| Fixed-configuration repeat-pass protocol | Whether a signal and its mapped location repeat under matched route, speed, load and machine state. | Needs repeatable route and logged operating conditions; repeatability alone is not diagnosis. |
| Calibrated reference accelerometer / geophone fixed near the bend | Whether a local track response coincides with cart events. | Local measurement only; different mounting point and structural path mean amplitudes are not directly interchangeable. |
| Track strain/displacement channel or qualified condition inspection | Independent evidence about local structural response/physical condition. | Requires specialist/site authorization; a reference channel is not a whole-track survey. |
| Manual event map with surveyed markers and operator notes | Whether reports repeatedly correspond to the same route segment and operating context. | Less precise than synchronized instrumentation, but preferable to automation if the logger's time/location is unreliable. |

A calibrated, synchronous multichannel DAQ can be compared with the battery logger if logger range, anti-aliasing, clock, or raw-data access proves inadequate. The DAQ should retain full configuration and raw channels; its sampling rate must be selected only after the target frequency band is known. No current source establishes which class is necessary for this cart.

## Proposed later study

**1. Records before testing.** Retrieve original raw files and warning logs, logger/sensor make, model, serial and firmware, full-scale/range, calibration history, axis/orientation, sample ODR and timestamps, anti-alias/digital filters, data export path, alert logic/version, and any setting changes. Retrieve old/new bracket drawings/material, mounting point, fasteners/torque, installation dates, and any physical modification or repair. For each pass, record direction, route, speed profile, secured load mass and position, wheel/caster condition, battery state, and motor/drive/brake state. Obtain a route sketch or survey and identify the bend and repeatable marker points. If the logger cannot supply a credible timebase or usable raw signal, begin with a manual event map or bench characterization rather than claiming location.

**2. Bench measurement-chain comparison.** If old and new brackets are available and qualified staff approve, excite a fixture with the same axis and known input; record the logger sensor and a characterized reference at the bracket base simultaneously. Compare mounting stiffness/fastening, resonance, direction, cable movement, clipping, filtering, and sample intervals. This is a proposed test, not run. A mount-dependent change points to measurement transfer; it does not rule in or rule out a cart or track condition.

**3. Controlled passes, only after authorization.** On the disused track and under qualified operation, keep cart, sensor/logger configuration, direction, route, battery/motor state and mounting fixed. Mark the same start/finish and bend position. First repeat a single documented baseline speed/load condition enough to estimate within-condition variation. Then use a small 2×2 comparison of two site-approved speeds and two representative, measured/secured load distributions; interleave condition order and repeat each cell. The initial count is a screening design; extend it if within-cell variation prevents a stable comparison. Do not change speed, load and mount together. If a bracket A/B is later safe, run it as its own block at matched speed/load rather than mixing it into the first comparison.

Log a speed channel (e.g. wheel encoder or optical gate) and surveyed distance. Place an independently calibrated trackside accelerometer/geophone at the bend; if a qualified engineer can do it, add local strain or displacement. Align channels by a shared trigger or synchronized clocks checked at surveyed marker crossings before and after runs. A video/manual event log can back up position. GNSS alone should not be treated as exact: rail studies report position correction needs and map-matching errors [S05–S06]. Capture stationary motor-off, powered-idle, and normal drive/brake states only as approved controls; do not attribute any resulting signature to a defect by itself.

**4. Predeclared analysis and escalation.** Before collecting data, define the endpoint: (a) repeated detection, (b) location error at surveyed markers, or (c) diagnostic utility requiring qualified inspection. Report warning/event frequency by condition, within-condition repeatability, mapped position and timing uncertainty, association with speed/load/machine state, and agreement with the independent channel. Keep raw-data quality failures and missing/saturated samples visible. Do not tune a warning threshold in this pilot.

- If the signal repeats at the same surveyed point under controlled conditions and an independent local reference also records a co-located response, request qualified engineering/track inspection.
- If the result changes with bracket/logger configuration but not the independent reference, investigate the measurement chain first.
- If it changes with speed, load, direction, or machine state, separate those factors in a follow-on design; that pattern is not a defect diagnosis.
- If signals do not repeat or time/location quality is inadequate, report inconclusive evidence. Absence of a repeat warning is not a safety clearance.

## Already-covered, rejected, and uncertain points

- **Already covered by the evidence plan:** detection versus location versus diagnosis; bracket and logger configuration; speed/load/mount/sample timing/machine-state controls; repeated passes; independent local reference; synchronized position; operations and software-history review; inspection escalation.
- **Rejected as unsupported:** that the new bracket caused the warnings; that the bend is physically defective; that a warning is a true defect; that a non-repeat warning clears the cart/track; that a railway speed/threshold/frequency transfers to this cart; that an automated monitoring product is needed.
- **Still uncertain:** exact logger/sensor/firmware/settings and raw samples; usable band/range and timestamp quality; bracket geometry, mount stiffness, axis and fastening; wheel/caster condition and motor behavior; route/direction repeatability; speed and load distributions; warning rule; desired pilot endpoint; access and independent-reference feasibility.

## Corrections, options, and owner decisions

**Corrections to interpretation:** the chronology does not prove the new bracket caused the warnings; a warning is an algorithm/device output; a recurring time peak does not yet locate a track point; and a repeatable event still does not diagnose a physical fault. Published rail thresholds, transfer functions, or sensor capabilities do not apply to this cart without matching evidence.

**Optional improvements:** use a written run sheet and manual event map; preserve raw files and configuration snapshots; add a common trigger and surveyed markers; make mount comparisons reversible and separate from speed/load tests; choose a reference channel only after defining the endpoint.

**Owner decisions:** set the pilot endpoint; authorize any future test-track operation and qualified oversight; identify available historical bracket/logger records and safe representative loads/speeds; decide whether bench-only evidence is sufficient; and choose a suitable local reference instrument or inspection. No threshold, safety disposition, or preferred product is predetermined.

## Proposed versus executed checks

**Executed in this stage:** read the assigned case brief and released plan; searched and reviewed the listed documentary sources; froze discovery with SHA-256 above; prepared the source map. No raw cart or track data existed in the supplied brief. No simulation, numerical data check, physical test, installation, or field validation was executed.

**Proposed only:** records audit, bench mount comparison, controlled repeat passes, synchronized reference measurements, analysis, and qualified escalation described above. No empirical detection accuracy, location accuracy, safety, or diagnostic performance has been validated.
