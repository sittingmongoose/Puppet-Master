# Research proposal: intermittent vibration warnings on a maintenance cart

**Case:** ER12-D-R1-02-FRESH  
**Slot:** D-R1-02 · **Domain:** transport instrumentation  
**Status:** desk research and proposal only. The brief is synthetic; no raw cart recordings, logger specification, track survey, fault diagnosis, or operating records were supplied.

## Recommendation

Begin with a no-change evidence recovery and context map. Preserve each warning with pass time, direction, route marker, independently measured speed if available, tool mass and placement, machine state, bracket identity, logger configuration, battery/environment, and relevant maintenance history. Retrieve raw records, calibration, firmware and alert-rule versions, timestamp behavior, old/new bracket details, and the bracket move date. A manual event map can show what varied around warnings without changing the sensing chain; it cannot establish a vibration anomaly or physical defect.

Then separate acquisition behavior from mount behavior. Audit configured versus effective sampling and timestamp integrity using authentic records. If both brackets exist, compare them on a bench under a known input with the same sensor and a calibrated reference. Only if qualified people later authorize a safe study envelope, make controlled repeated passes with synchronized cart and independent references. Refer repeatable, independently corroborated observations for qualified engineering inspection. This proposal authorizes no vehicle use, inspection conclusion, field threshold, or monitoring product.

## What a warning can establish

1. **Unusual-signal detection:** a warning establishes that the configured rule emitted an event. Whether the event represents a physical signal depends on authentic raw samples, rule/version, sensor range, clipping, sample gaps, filters, timing, and calibration.
2. **Repeatable event and location:** recurrence of a feature at a surveyed distance or marker under comparable conditions can support repeatability and localization. A cluster described only as “near the bend” does not establish a repeatable point.
3. **Physical diagnosis:** attributing a response to a wheel, bearing, track, bracket, drive, or other defect requires validated fault-specific evidence. Independent measurement and qualified inspection are stronger than an alert or repeatable vibration alone. Neither a warning nor this proposal determines safety.

Choose the later study’s primary endpoint before selecting features, instruments, sample rate, or acceptance criteria: unusual-signal detection, repeatable distance localization, or diagnostic utility. If diagnosis cannot be supported by independent evidence, report detection or repeatability and refer unresolved observations for inspection.

## Mechanisms and competing explanations

A moving cart couples track texture, joints, and local geometry into wheel, axle, frame, and bracket motion. Wheel shape/condition, bearing or drive behavior, tool loads and placement, and other machine behavior can contribute. A bend can produce ordinary lateral or cornering response. The logger measures those inputs after mechanical transfer through the cart and bracket and after sensor, filter, and acquisition effects.

A bracket change shortly before increased warnings is a reason to investigate, not evidence that the bracket caused them. Bracket compliance, looseness, geometry, fastening, orientation, or added mass can change coupling or resonance. Speed can shift excitation frequency and response. Tool mass and placement change loading and dynamics. Path variation, sample timing, aliasing, clipping, dropped samples, filter delay, and background machine behavior are possible interacting explanations; none is established as observed in this case.

An acquisition check should recover sensor identity, axes/range/sensitivity, calibration, bandwidth, anti-aliasing and digital filters, configured and effective output rate, timestamp/clock semantics, buffer/drop flags, clipping, and the alert algorithm/version. Configured rate alone is not proof of effective sampling. Align clocks or estimate offset/drift and account for filter delay before comparing event times or locations.

## Useful measurement and observation alternatives

| Alternative | What it can answer | Main condition or limit |
|---|---|---|
| Keep the logger unchanged and map operating context | Whether warnings co-vary with speed, load, bracket, direction, route, or machine state | Useful first step; does not independently validate signal or location |
| Known bench input; same sensor on old/new brackets plus fixed reference | Whether bracket transfer, resonance, or remounting changes response | Requires both assemblies and controlled installation; historical field passes are not an A/B test |
| Calibrated piezoelectric IEPE accelerometer and multichannel DAQ | Independent waveform over a selected amplitude/frequency band | Choose range, mass, conditioning, mounting, filtering, and sample rate after logger and target band are known |
| Triaxial MEMS reference, for example ADXL355 | Compact three-axis comparison if range, bandwidth, and timing fit | Example device only; verify settings, interface limits, delay, and effective rate. It does not specify the cart logger |
| Fixed track-side accelerometer or geophone | Helps separate track/ground response from cart response | Placement and synchronization must match the question; rail precedents do not supply cart thresholds |
| Second calibrated sensor at a rigid cart point | Compares the logger mount with a vehicle reference | Select a mechanically suitable point and control sensor mass and orientation |
| Encoder/odometer or surveyed optical markers/photo-gates; optionally time-aligned video | Independent distance, speed, or marker-passage reference | Wheel rotation is not automatically route position; camera use needs visibility and calibration |
| Manual event map and qualified physical inspection | Adds context or independent physical observation | Notes cannot reconstruct vibration or diagnose from uncalibrated observations |
| Optional wheel-order analysis | Tests whether a future feature is synchronous with wheel rotation | Requires suitable angular/RPM input and a defined order-tracking setup; it does not locate a cart event on the track |

A vendor guide describes how mounting compliance and added base mass affect usable frequency/resonance. Its numerical examples apply to a typical 100 mV/g accelerometer, not every sensor or this cart [S02]. The ADXL355 Rev D datasheet is a concrete MEMS example, not the logger: selectable ±2/±4/±8 g ranges; power-up high-pass off, low-pass 1000 Hz, and ODR 4000 Hz; 0.63 ms digital filter group delay at a programmed 4 kHz ODR; and a recommended maximum 800 Hz ODR over 400 kHz I2C, above which missed samples or added noise may occur. These are configurable/example-device facts, not cart capabilities [S01].

Order tracking is optional only if wheel-rotation-synchronous components become the question. Dewesoft’s manual calls for an accelerometer plus angle/RPM input and says “at least 10 kHz” in many cases. That guidance is for its product/module and is not a universal rate requirement [S07].

## Comparable implementation history and transfer

- **Sensor/acquisition example:** ADXL355 Rev D records a June 2025 change from Rev C to D concerning zero-g-offset-versus-temperature specification; this is a datasheet revision, not a cart performance fix [S01]. A 2023 Analog Devices support thread describes one EVAL-ADXL355Z/Linux/IIO implementation with 4 kHz configured but about 2 kHz effective. Vendor support reproduced missed data-ready interrupts on a Raspberry Pi path and suggested using the hardware FIFO on FIFO-full. The thread does not confirm a shipped fix or establish a general sensor defect [S03].
- **Vehicle/track methods:** Auersch’s 2017 report describes underlying 1994 measurements combining vehicle accelerometers and track/soil geophones across railway structures and varied train speeds. The 72-channel, 2 kHz setup is specified for the surface-line section, not all instruments; reported spectra and response vary by position and speed [S04].
- **Reference and load methods:** A 2017 railway track-bed study compared accelerometer/geophone displacement with a sleeper LVDT and discussed filtering, speed, load, repeatability, and validity. Its track, quantity, sensors, and stated validity conditions are specific to that study [S05]. A 2023 wagon comfort study compared multiple sensor positions and empty/loaded conditions and reports 50 ms (20 Hz) collection intervals. That comfort-oriented rate does not establish high-frequency defect-impact capture [S06].
- **Spatial method:** An arXiv v1 methods paper describes a railway track-geometry system combining cameras, an IMU, and an encoder; it assumes the system can see the rail heads while moving. It is a method precedent, not a demonstrated cart installation or a defect detector [S08].

These examples support method choices—synchronized references, varied operating conditions, independent position, and explicit acquisition checks—not transfer of rail thresholds, amplitudes, diagnostic accuracy, safe speed, frequency band, or fault conclusions to a utility cart. No cart-specific logger, bracket, wheel, track, or operating history is available. The bounded Linux/ADXL355 incident is not a cart regression history.

## Proposed later study — not executed

### 1. Recover prerequisites and choose the endpoint

Obtain logger make/model, firmware/configuration, axes/range/sensitivity, calibration, bandwidth, configured/effective rate, anti-aliasing and digital filters, timestamp/clock behavior, buffer/drop flags, alert algorithm/threshold/software version, and authentic raw events. Recover bracket geometry/material/fastening/orientation, installation dates, whether the former bracket remains, wheel/bearing/drive state, tool masses/positions, machine state, route survey/marker, direction and speed records, and relevant environmental conditions.

A qualified authority—not this proposal—decides whether later access or operation is allowed and sets any safe envelope. Decide whether the primary outcome is detection, repeatable location, or diagnostic utility. The logger, safe authorization, physical inspection reference, and endpoint are unresolved.

### 2. Separate mount transfer from acquisition behavior

If both brackets are available, use the same sensor, orientation, and attachment on each assembly under a known bench input, with a calibrated fixed reference. Compare transfer over a band chosen after specifications are known; repeat installation to estimate remount variation. If the former assembly is unavailable, the bracket effect remains unresolved; historical passes do not create a controlled bracket comparison.

Separately compare configured and effective sample rate, actual sample intervals, gaps/overruns, clipping, calibration, filter settings and delay, timestamps, and alert replay against authentic records. Preserve firmware, configuration, and analysis versions. Do not synthesize readings or tune a field threshold.

### 3. Run controlled passes only after later authorization

If qualified personnel approve a safe study, survey the bend and a straight/control segment. For baseline passes, hold approved speed, direction, and tool mass/position fixed; repeat enough to estimate within-condition variation. Record independent speed, distance, time, load/placement, motor/battery state, environment, bracket identity, and logger settings. Then vary speed and load in separate balanced or crossed blocks within the approved envelope, returning to baseline where feasible. Include safe stationary machine-state controls where relevant. Balance run order to expose drift and keep settings fixed within each comparison.

Synchronously record the logger, a suitable calibrated reference near its mount, and a reference at a rigid cart point. Add fixed track-side sensing if separating track from cart excitation matters. Use a shared trigger/clock or characterize clock offset/drift and filter delay. Locate events using an encoder/odometer or surveyed markers/photo-gates; time-aligned video can independently confirm marker passage if visible and calibrated. Select sensors and rates only after actual range and bandwidth are known.

### 4. Predefine controls, measures, and escalation

Before collecting any future data, define data-quality checks, feature/time windows, frequency bands after actual bandwidth is known, location tolerance, exclusions, repeatability and agreement metrics, and treatment of missing records. Compare alerts with raw waveforms; summarize feature and location variation across repeats; test dependence on speed, load, bracket, location, machine state, and reference. Include the control segment/state and no-event passes, and report calibration uncertainty. Record alerts that do not recur or lack reference corroboration as uncorroborated; without independent ground truth, do not label them false or claim false-alarm rate, accuracy, or fault sensitivity.

A repeatable event at a surveyed location, corroborated by an independent sensor or physical observation under comparable conditions after acquisition artifacts and operating covariates are checked, can justify referral to qualified engineering inspection. An event that follows only one bracket, configuration, speed/load, or machine state indicates measurement or operating dependence; by itself it does not identify a defect. Qualified authority determines stop and safety decisions. No universal numeric trigger or vehicle-use approval is supplied.

## Critique findings and explicit disposition

| Finding | Disposition | Effect on this final |
|---|---|---|
| C1 — The draft asserted that the released plan used a different case ID. The original brief and revealed plan both say ER12-D-R1-02-FRESH. | **Accept and correct.** Re-reading both assigned inputs confirms the same case ID. | Removed the false discrepancy note; this metadata correction does not change research scope. |
| C2 — The draft claimed investigator-stage deadline compliance, but the critic had no investigator deadline or native completion receipt in its listed package. | **Accept and retain uncertainty.** The available reviser input map gives this stage’s deadline, not the investigator’s deadline; the assigned packet supplies no investigator completion receipt. Lack of evidence is not evidence the claim is false. | Removed the timing assertion; no investigator deadline-compliance claim is made. |
| C3 — Cart-specific implementation and operating history are unavailable; source examples are a bounded Linux/ADXL355 incident and railway studies. | **Accept and retain uncertainty.** No cart-specific logger/configuration, bracket records, inspection, raw data, or controlled operating history is supplied. | Preserved this as an external prerequisite and limited transfer to methods. The proposed recovery and conditional bench comparison remain; no cart behavior is inferred. |

The critic found no material wrong, incomplete, or unsupported scientific claim in the proposal. I independently rechecked the consequential sensor, mounting, implementation, rail-method, order-tracking, and version-pinning statements against the listed primary manufacturer/vendor/research sources where the pages were accessible. The official Journal of Zhejiang University Science A landing and full-text endpoints returned an internal error in this reviser access attempt; the S05 summary is therefore retained only as bounded in the supplied source maps and critic’s independent review, without adding a new numerical claim.

## Already covered, optional, rejected, and uncertain points

**Already covered:** the synthetic scenario and evidence boundary; separate detection, localization, and diagnosis; the speed/load/mount/timing/background interactions; synchronized references and controls; bounded implementation history; conditional escalation; the no-product and safety boundaries; and the unresolved endpoint.

**Optional improvements retained:** collect operating context before changing hardware; recover installation records and the former bracket; hold a reference fixed while varying one factor; use surveyed distance rather than the phrase near the bend; retain raw data and configuration; include a control segment and background machine state.

**Rejected as unsupported:** a warning equals a defect; bend proximity identifies damage; bracket timing proves causation; a single pass locates an event; rail thresholds, frequency bands, or amplitudes transfer to the cart; a 20 Hz comfort study validates high-frequency impacts; configured ODR equals effective sampling; encoder/IMU position diagnoses a fault; or desk research authorizes cart use.

**Uncertain:** logger, mount, cart, track, operating, inspection, and endpoint dependencies remain open as listed below. The sources do not turn them into cart measurements.

## Coverage of the original brief and released plan

| Original brief clause or boundary | Where this final covers it |
|---|---|
| Synthetic maintenance cart; warnings near one bend; changing tool loads; recent bracket move; no recordings/specification/survey/diagnosis | Opening status, evidence boundary, mechanism hypotheses, and prerequisite recovery |
| Produce a 60-minute research proposal on reliability and meaning, mechanisms, alternatives, history, and controlled later study; no monitoring product | Recommendation, mechanisms, alternatives, comparable history, proposed study; no product is proposed |
| Distinguish unusual signal, repeatable location, and diagnosis | “What a warning can establish” |
| Compare mounting/acquisition changes with repeated passes and independent observation/reference | Alternatives table; bench comparison; controlled passes and references |
| Address speed, load, mounting, sample timing, and background machine behavior as interacting explanations | Mechanisms; acquisition audit; balanced study blocks and controls |
| Investigate bracket move and comparable implementation history, including transfer evidence | Bracket recovery/bench study; bounded implementation history and transfer limits |
| Synchronized comparisons, controls, escalation; distinguish future validation from executed work | Proposed study phases and “Executed work and validation status” below |
| No wheel/track safety diagnosis, vehicle-use authorization, or substitute for qualified inspection | Evidential levels, qualified-authority boundaries, and escalation rule |
| No cart operation, live railway access, sensor installation, or field threshold tuning in this assignment | Explicit no-operation/no-installation/no-threshold execution record below |
| Do not assume true defects or invent readings, frequencies, or sampling capability | No cart capability assigned; numerical sensor/rate examples are tied to named sources and conditions |
| Keep logger, mounting, wheel, route, speed/load, warning logic, and endpoint dependencies open | Prerequisite recovery and unresolved dependencies below |

| Released-plan design clause | Where this final covers it |
|---|---|
| Research question: establish evidential meaning before any physical-fault claim | “What a warning can establish” and the staged study |
| Test authorization, acquisition access, inspection reference, and endpoint remain open; usefully gather evidence even if logger cannot support diagnosis | Prerequisites; conditional work; detection/repeatability fallback |
| Consider mounting, acquisition/time synchronization, repeats with documented speed/load, position references, independent inspection/reference sensor | Alternatives table and study phases |
| Context-only recording and manual event map may be useful; no method is predetermined | Recommendation and alternatives table |
| Explain excitation, mount transfer, cart dynamics, sample timing, location estimates; treat aliasing/clipping/resonance/exposure as hypotheses | Mechanisms and acquisition audit |
| Evidence must distinguish detection, location, and diagnosis and reveal sensing artifacts | Evidential levels, bench/aquisition comparison, synchronized study |
| Investigate implementation history and transfer limits; recover bracket dates/practices; historical algorithm performance without sensing chain/context is insufficient | Comparable history, C3 disposition, prerequisites |
| Later authorized study coordinates repeat passes, speed/load, time/position references, reversible mounting comparison, false-warning handling, and escalation without presumed ground truth | Proposed later study and escalation decision |
| Any simulated signal or sampling illustration would be a desk check under assumptions; no field accuracy/safety/diagnosis was validated | Execution record; no simulation or numerical sample-rate computation was run |
| Full research discovery, causal reasoning, alternatives, history, coherent validation; no predetermined winner or product | Entire proposal; methods are conditional and endpoint remains open |

## Executed work and validation status

**Executed in this reviser stage:** read the assigned brief, full investigator discovery and draft, source maps/indexes, exact revealed plan and reveal record, and complete independent critique. Verified the revealed-plan SHA-256 as e36e6b3f57dc6773ea3d65d44d3a91777614aefa2c548635892441bd7de1eafc, matching the reveal record. Attempted direct access to the primary sources listed in the reviser source map and reviewed the accessible manufacturer/vendor/research pages; both S05 journal endpoints returned an internal error, so S05 is retained only from the supplied maps and critic review. The native Goal activation response and binding-guard response are recorded in the stage artifacts.

**Not executed:** no case-specific data analysis, raw logger check, simulation, sample-rate computation, bench test, field test, cart movement, track access, sensor installation, physical inspection, diagnosis, accuracy estimate, field threshold adjustment, safety finding, or vehicle-use authorization.

**Proposed only:** evidence recovery, acquisition verification, old/new bracket comparison if available, synchronized references, controlled repeated passes if later authorized safe, controls, analysis, and referral to qualified inspection as described above.

## Decisions and unresolved dependencies

The owner or qualified authority must decide whether any later study may occur and its safe envelope; the primary endpoint; suitable actual sensor/reference and rate; whether the old bracket exists; acceptable location/repeatability criteria; what corroboration warrants inspection; and who makes stop/safety decisions.

Still unresolved: logger identity; range, sensitivity, axes/orientation, bandwidth and effective ODR; timestamps, clock behavior and filter delay; anti-aliasing, buffering/loss, calibration, clipping/noise, alert feature/threshold/version; bracket geometry, rigidity, fastening and move date; wheel/bearing/drive condition; route/marker and path repeatability; direction, speed, tool loads/positions, machine/background state and environment; safe authorization; independent inspection reference; and whether the future outcome is detection, repeatability/location accuracy, or diagnostic utility. Until these are resolved, no numerical threshold, cart-specific capability, diagnosis, or safety conclusion is supportable.

## Source index

The source IDs are stable and their exact URLs, versions, locators, access times, conditions, observations, applicability, and reviser recheck status are in [source-map.json](source-map.json). A short navigable index is available at [sources/index.md](sources/index.md). Native activation evidence is in [native-goal-activation-response.json](native-goal-activation-response.json).
