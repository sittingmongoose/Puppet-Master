# Research proposal: intermittent vibration warnings on a maintenance cart

**Case:** ER12-D-R1-02-FRESH. The released plan's verbatim copy labels the case D-R1-02-FRESH; this metadata difference is noted without changing either input.  
**Status:** desk research and proposal only. No case recordings or logger specification were available.

## Recommendation

Begin with no-change evidence recovery. Record pass time, direction, route marker, independently measured speed if available, tool load/position, machine state, bracket identity, warning time, battery/environment, and maintenance changes. Retrieve logger configuration, software/alert version, raw records, calibration, timestamp behavior, and old/new bracket details. A manual event map gives context without changing the sensing system; it cannot prove a defect.

Then isolate the questions. Verify the acquisition chain and compare old/new bracket transfer on a bench if both brackets exist. Only if qualified people later approve a safe test envelope, make controlled repeated passes with logger and independent references synchronized. Refer only repeatable, independently corroborated observations for qualified engineering inspection. No threshold, safety conclusion, or cart diagnosis is offered.

## Evidential levels

1. **Signal detection:** an alert means the configured rule emitted an event. Verify raw samples, rule/version, clipping, sample gaps and filters before calling it a physical anomaly.
2. **Repeatability and location:** recurring waveform/features aligned to surveyed distance or a track marker support a repeatable location. An unlocated cluster merely described as near the bend does not.
3. **Diagnosis:** attributing an event to wheel, bearing, track, bracket, drive or another defect needs validated fault-specific evidence, preferably independent measurement plus inspection. A warning or repeatable vibration alone is not a diagnosis and cannot determine safety.

Select the primary endpoint before choosing features, instruments, rates or acceptance criteria: unusual signal, repeatable distance localization, or diagnostic utility.

## Mechanisms and alternatives

Track texture, joints or local geometry excite the wheel, axle and cart. Wheel condition, bearing/drive behavior, tools or other machinery and cornering can also contribute. The sensor sees those inputs through cart/bracket dynamics and its sensing/electronics. Bracket compliance, looseness, geometry, fastening, orientation and added mass can change coupling or resonance. Speed can shift excitation frequency and response; tool mass and position change load and dynamics. The bend may produce ordinary lateral acceleration. Aliasing, clipping, bracket resonance, path variation and background machine behavior are hypotheses only; none was observed.

A vendor guide explains that mounting compliance and added base mass affect usable frequency/resonance. Its numeric examples apply to a typical 100 mV/g accelerometer and are not universal [S02]. The ADXL355 Rev D datasheet is a concrete MEMS example, not the cart logger: power-up high-pass off, low-pass 1000 Hz, ODR 4000 Hz; 0.63 ms digital filter group delay at 4 kHz; recommended maximum ODR 800 Hz over 400 kHz I2C, with missed samples/noise possible above the interface limit. Settings can change, and external synchronization modes have different delays/sample semantics [S01]. Those facts make configuration/timing checks important but establish nothing about this logger.

| Approach | Value | Limit |
|---|---|---|
| Keep logger unchanged; map events and operating context | Tests co-variation with speed, load, bracket or machine state | No independent signal validation or location; useful first step |
| Known bench input; old/new bracket plus fixed reference | Isolates mount transfer/resonance/remount variation | Needs both brackets and controlled installation; old field records are not an A/B test |
| Calibrated IEPE piezoelectric accelerometer and multichannel DAQ | Independent waveform over a chosen amplitude/frequency band | Select range, mass, conditioning, filters, mounting and sample rate from actual requirements [S02, S04] |
| Triaxial MEMS reference such as ADXL355 | Compact 3-axis signal if range/bandwidth/timing fit | Verify settings, interface ceiling, delay and effective rate; may not cover unknown high-frequency impacts [S01] |
| Fixed track-side geophone/accelerometer | Separates track/ground response from cart response | Requires relevant placement/synchronization; rail studies support method, not cart thresholds [S04, S05] |
| Encoder/odometer, surveyed markers/photo-gates; optional timestamped video | Independent distance, speed or marker passage | Wheel angle alone is not track position; camera needs visibility/calibration [S07, S08] |
| Manual event map and qualified inspection | Context and physical observation | Cannot reconstruct vibration or diagnose from uncalibrated notes |

Order tracking is optional if the future question concerns wheel-rotation-synchronous components. Dewesoft's manual requires an accelerometer and angle/RPM input for its analysis; signal-estimated speed lacks zero-angle phase. Its “at least 10 kHz in many cases” guidance is specific to that product/module, not a universal rate requirement [S07].

## Implementation history and transfer

- **ADXL355:** Rev D revision history records Rev C to D in June 2025 and changes to the zero-g-offset-vs-temperature specification; this is a documentation revision, not a cart performance fix [S01]. In a 2023 Analog Devices support case, an EVAL-ADXL355Z/PetaLinux 2022.2/Linux 5.15.36/IIO-over-SPI setup reported 4 kHz configured but about 2 kHz effective. Support reproduced missed data-ready interrupts on a Raspberry Pi non-real-time path and proposed servicing the hardware FIFO on FIFO-full. The thread does not establish that a fix shipped, that the sensor is generally defective, or that other platforms/releases are affected [S03].
- **Vehicle/track:** Auersch's 2017 report presents underlying 1994 measurements: vehicle accelerometers, track/soil geophones, several track constructions, and varied train speeds. Spectra differ by sensor position and shift with speed. The described 2 kHz, 72-channel system is for the surface section, not all instruments [S04].
- **References and loads:** a 2017 track study compares accelerometer/geophone displacement with an LVDT and discusses filtering, repeatability, speed, load and validity [S05]. A 2023 wagon study includes empty/loaded conditions and multiple positions but describes 50 ms (20 Hz) logging for ride comfort; it cannot establish high-frequency defect capture [S06].
- **Spatial method:** a 2020 arXiv v1 track-geometry method combines camera, IMU and encoder/GNSS/odometer position; it requires rigid mounting, visible track and calibration [S08].

These sources support synchronized references and documented context as methods. They concern heavy rail vehicles, specified track, load, mount, rate and endpoint; they cannot supply cart-safe speed, frequency band, threshold, expected amplitude, diagnostic accuracy or safety conclusion. The only implementation issue found is the bounded S03 incident; its fix/release status is unresolved and no cart-specific regression/drift history was available.

## Proposed later study — not executed

**Prerequisites.** Obtain logger model, axes/range/sensitivity, calibration, bandwidth, configured/effective rate, anti-alias/digital filters, timestamp/clock behavior, buffer/drop flags, alert algorithm/threshold/software version and raw events. Recover bracket geometry/material/fastening/orientation, installation dates, wheel/bearing/drive state, tool masses/positions, machine state, route survey/marker, direction and speed. A qualified authority decides whether later access/operation is allowed and defines a safe envelope; this proposal grants none.

Choose one endpoint first: signal detection, repeatable location, or diagnostic utility. If approved independent evidence cannot support diagnosis, report detection/repeatability and refer unresolved observations for inspection.

**Mount/acquisition isolation.** If the old bracket remains, apply a known bench input to old/new assemblies with the same sensor, orientation and attachment plus a calibrated reference. Compare transfer over a band chosen after specs are known; repeat installation to measure remount variation. If old hardware is unavailable, bracket effect remains unresolved. Separately verify configured versus effective rate, sample intervals, gaps/overruns, clipping, calibration, filters and group delay. Preserve firmware/config/analysis versions. Replay alerts only against authentic data. Do not synthesize readings or tune a field threshold.

**Controlled passes, only if later approved safe.** Survey a straight/control segment and the bend. Baseline passes hold approved speed, direction and tool mass/position fixed; repeat enough to estimate within-condition variation. Log independent speed, distance, time, load/placement, motor/battery state, environment, bracket and logger settings. Then vary speed and load in separate balanced/crossed blocks within the approved envelope, returning to baseline where feasible. Include safe stationary machine states. Balance order to expose drift and keep settings fixed within each comparison.

Synchronously record logger and a suitable calibrated reference near its mount and at a rigid cart location. Add fixed track/ground sensing if track-vs-cart excitation matters. Use a common trigger/clock or characterize offset/drift and filter delay. Locate events with encoder/odometer or surveyed markers/photo-gates; video can independently confirm marker passage if visible and aligned. Choose sensors and sample rate only after the actual band/range is known.

**Controls, measures, escalation.** Predefine data-quality checks, features/time windows, frequency bands after actual bandwidth is known, location tolerance, exclusions and repeatability/agreement metrics. Compare alerts with raw waveform; summarize feature/location variation across repeats; test whether differences follow speed, load, mount, location, machine state or reference. Include control segment/state and no-event passes; report calibration uncertainty and missing records. Do not claim accuracy or fault sensitivity without independent ground truth.

Refer an event for qualified engineering inspection when it persists at a repeatable surveyed location under comparable conditions and an independent sensor or physical observation corroborates it, after acquisition artifacts and operating covariates are checked. An event that follows only one bracket, configuration, speed/load or machine state indicates measurement/operating dependence, not by itself a defect. The responsible authority decides safety action; no universal numeric trigger or vehicle-use approval is supplied.

## Per-clause disposition

| Exact original clause | Disposition |
|---|---|
| Project situation: a cart has intermittent warnings near a bend; tools vary by day; the logger was moved to a new bracket shortly before warnings increased; no raw recordings, sensor specification, track survey, or diagnosis; synthetic test-track scenario. | Preserved as the evidence boundary. The bracket timing motivates a hypothesis but does not prove causation. |
| Spend the 60-minute research window producing a proposal to investigate reliability and meaning. Explain sensing/mechanical mechanisms, compare instrumentation/observation alternatives, examine implementation history, and propose a controlled later study informing whether engineering inspection is warranted; do not create a monitoring product. | Proposal delivered within the investigator stage's assigned deadline. Mechanisms, alternatives, implementation evidence and a later study are covered. This is desk research, not empirical validation or a product. |
| Distinguish detecting an unusual signal, locating a repeatable event, and diagnosing a physical defect. | Addressed as three separate evidential levels; a warning alone is not diagnostic. |
| Compare changes in sensor mounting or acquisition with a repeatable-pass protocol and a useful independent observation or reference-instrument alternative. | Bench mount comparison, acquisition audit, calibrated references, independent position markers and controlled repeated passes are proposed. |
| Address speed, load, mounting, sample timing, and background machine behavior as possible interacting explanations. | Addressed as interacting hypotheses and controlled study factors. |
| Investigate the bracket change and operating history of comparable implementations, including evidence supporting transfer to this cart. | Installation records and bench comparison are requested. Railway evidence is bounded by system differences; only method-level transfer is supported provisionally. |
| Propose synchronized comparisons, controls, and a meaningful escalation decision; report future validation separately from any desk simulation or data check actually executed. | Clock offsets/filter delay, references, control segment/background state and inspection referral are specified. No simulation or data check was executed. |
| Do not diagnose track or wheel safety, authorize vehicle use, or substitute the proposal for a qualified inspection. | Honored; qualified authority retains safety decisions. |
| Do not run the cart, access a live railway, install sensors, or tune a field warning threshold in this assignment. | No physical activity or threshold tuning occurred. |
| Do not assume warnings are true defects or fabricate sensor readings, frequencies, or sampling capability. | No defect is assumed and no measurement/capability is attributed to this cart. Numerical examples are tied to named source conditions. |
| Identify dependencies: logger range, sampling/timestamps, mounting rigidity, wheel condition, path repeatability, speeds, loads, warning logic, and unresolved endpoint among repeatability, location accuracy, or diagnostic utility. | All remain explicit dependencies; no quantitative conclusion or design selection is supportable until resolved. |

## Corrections, optional improvements, owner decisions

**Corrections to unsupported claims:** none are needed to supplied scenario facts. Evidence cannot show that the bracket move caused warnings or a component is defective/safe. S03 is platform-specific and its proposed fix is not confirmed. S06's 20 Hz study cannot justify high-frequency impact capture.

**Optional improvements:** record context before changing hardware; recover old bracket and installation records; hold one reference fixed while varying one factor; use surveyed distance rather than “near bend”; retain raw data/configuration; include control segment and background state.

**Owner/qualified-authority decisions:** whether a later study may occur and its safe envelope; primary endpoint; suitable actual sensor/reference; what repeatability/corroboration warrants inspection; and who makes stop/safety decisions.

## Already covered, rejected and uncertain

- **Already covered:** scenario, three evidential levels, speed/load/mount/timing/background interactions, synchronized references, controls, implementation history, escalation, non-product scope, safety boundary and unresolved endpoint.
- **Rejected as unsupported:** warning equals defect; bend proximity identifies damage; bracket timing proves cause; single pass locates event; rail thresholds/frequency/amplitude transfer; 20 Hz validates impacts; configured ODR equals effective sampling; encoder/IMU diagnoses fault; desk research authorizes use.
- **Uncertain:** all logger, cart, track, operation, inspection and endpoint dependencies listed at the end. Sources do not turn them into measurements.

## Proposed versus executed checks

**Executed:** reviewed supplied brief and released plan after the native Goal binding guard; searched/opened manufacturer documentation/support history and field-study/method reports; recorded source identities and conditions. The discovery artifact was frozen by the reveal helper at SHA-256 06b7459f26729b550c5e0a22d95609a1df1af57794fc4be778e260bfb3977b9b.

**Not executed:** no case-data analysis, desk simulation, sample-rate computation, bench/field test, cart movement, track access, sensor installation, diagnosis, accuracy estimate or threshold adjustment. No field validation, safety finding or inspection occurred.

**Proposed only:** bracket/acquisition verification, synchronized references, controlled passes, controls, analysis and inspection referral above.

## Sources

Full identities and conditions are in [source-map.json](source-map.json); see [sources/index.md](sources/index.md).

- [S01 — ADXL354/ADXL355 Rev D datasheet](https://www.analog.com/media/en/technical-documentation/data-sheets/adxl354_adxl355.pdf)
- [S02 — NI accelerometer vibration guide](https://www.ni.com/en/shop/data-acquisition/sensor-fundamentals/measuring-vibration-with-accelerometers.html)
- [S03 — ADI verified sample-rate support thread](https://ez.analog.com/linux-software-drivers/f/q-a/569014/eval-adxl355z-linux-command-line-for-setting-the-sample-frequency/493909)
- [S04 — Auersch, vehicle/track/soil measurements](https://onlinelibrary.wiley.com/doi/10.1155/2017/1959286)
- [S05 — Lamas-Lopez et al., field accelerometer/geophone comparison](https://jzus.zju.edu.cn/article.php?doi=10.1631/jzus.A1600212)
- [S06 — Mihăilescu et al., rail-wagon study](https://pmc.ncbi.nlm.nih.gov/articles/PMC10574946/)
- [S07 — Dewesoft X order-tracking manual](https://manual.dewesoft.com/x/setupmodule/modules/machinery/ordertracking)
- [S08 — Escalona, track geometry with vision/inertial sensors](https://arxiv.org/abs/2008.03763)

## Still unresolved

Logger model/sensor, range/sensitivity/axes/orientation, bandwidth/ODR/timestamps, filters/delay/anti-aliasing, buffering/loss, calibration/clipping/noise, alert feature/threshold/version, bracket geometry/rigidity/fastening/move date, wheel/bearing/drive state, track markers/path, speed/direction, tool loads/positions, background state, environment, safe authorization and primary endpoint. Until resolved, no threshold or diagnosis is supportable.
