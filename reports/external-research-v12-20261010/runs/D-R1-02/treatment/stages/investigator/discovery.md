# Independent discovery — D-R1-02-treatment / investigator

## Scope and evidence boundary

This synthetic maintenance-cart brief supplies no raw recordings, logger identity/specification, calibration, bracket drawing, sampling/timestamp behavior, warning logic, wheel inspection, track survey, speed, path repeatability, or controlled load records. Desk research cannot establish what the logger sensed, why warnings changed, whether the cart or track has a defect, or whether either is safe. No data check, simulation, bench work, cart movement, sensor installation, threshold tuning, or live-track access was performed. This is a research proposal; it authorizes no use and replaces no qualified inspection.

## Three separate claims

An unusual-signal warning is a property of the logger’s feature/threshold and configured acquisition chain. Repeatable localization requires recurrence at the same surveyed distance/marker across controlled passes with aligned records. Diagnosis requires a validated relation between response and fault, preferably independent measurement plus inspection. A warning near a bend establishes none of the latter claims.

## Mechanisms and alternatives

A moving cart excites wheel, axle, frame, bracket, and logger through track texture/joints, wheel shape, bearing/drive behavior, and load-dependent contact or suspension. The measured waveform is the physical excitation filtered by the mechanical transfer paths, sensor, filters, and acquisition. Speed changes excitation frequency/amplitude; load and tool placement change inertia and resonances; a bend can produce ordinary lateral/cornering response. A changed/loose/flexible bracket can alter coupling or create local resonance; sensor/base mass can alter the structure. The bracket timing makes it a hypothesis to test, not proof [S02, S04, S07].

Compare a configurable triaxial MEMS device (e.g., ADXL355) with a calibrated piezoelectric IEPE accelerometer and suitable multichannel DAQ. MEMS can be compact/low power; piezoelectric devices can cover wide frequency and dynamic ranges. Select only after target amplitude/bandwidth are known and the logger is identified. A fixed track-side accelerometer or geophone is useful to separate track from cart response; a second calibrated sensor fixed to a rigid cart point is a vehicle reference. A wheel encoder/odometer or surveyed optical markers/photo-gates provide independent distance/time; wheel rotation tach/encoder supports order analysis when wheel-synchronous components are the question. A camera+IMU+encoder track-geometry system is a precedent but needs a rigid installation, visible track, and calibration, so is not proposed as a cart product [S01, S02, S04, S05, S07, S08].

## Consequential sensor and implementation behavior

The ADXL355 Rev D datasheet is an example, not a claim about this logger: selectable ±2/±4/±8 g; power-up high-pass off, low-pass 1000 Hz, ODR 4000 Hz; digital filter group delay 0.63 ms at 4 kHz; 400 kHz I2C limits recommended ODR to 800 Hz. Over-rate I2C can miss samples/add noise; asynchronous register reads do not guarantee an XYZ set from the same instant. External synchronization exists, but the interpolation-filter mode delays data-ready by a configuration-dependent interval and reports a sample earlier than its arrival [S01]. Thus settings, effective timing, gaps/overruns, clipping, calibration, filters/delay, and software/alert version must be checked before treating events as comparable.

NI’s vendor guide explains that mount compliance and base mass affect resonant/usably measured frequency. Its numeric mounting examples are for a typical 100 mV/g accelerometer; they are not universal limits. Stud attachment gives stronger high-frequency coupling but generally needs permanent attachment [S02]. A bench input/reference comparison of old/new bracket assemblies can isolate bracket transfer better than a changed field warning; if the original bracket is unavailable, the mount effect stays unresolved.

An Analog Devices support thread records a real implementation failure mode: EVAL-ADXL355Z, PetaLinux 2022.2/Linux 5.15.36, IIO over SPI at 6.25 MHz, configured 4 kHz but observed about 2 kHz effective output. Vendor support reproduced missed data-ready interrupts in a Raspberry Pi example and proposed reading hardware FIFO on FIFO-full interrupt. The answer attributes it to that non-real-time system, and does not show a shipped fix or establish a general sensor defect [S03]. This is a version-specific caution; verify the actual logger’s effective rate.

Comparable field history supports methods, not cart thresholds. Auersch (2017 publication; underlying tests 1994) measured a passenger train, track sections, and soil simultaneously with vehicle piezo accelerometers, track/soil geophones, varied speeds, and 2 kHz acquisition; spectra differ by position and speed [S04]. A 2017 field study compares accelerometers/geophones with an LVDT and calls out filtering, speed, load, repeatability, and sensor-validity ranges [S05]. A 2023 rail-wagon study records empty/loaded conditions and multiple mounting locations but describes 50 ms (20 Hz) logging for a comfort-oriented study, which cannot establish high-frequency defect capture [S06]. Rail vehicles/track, loads, speeds, mount points, and objectives differ from a utility cart; transfer only the design lessons.

## Proposed later controlled study (not executed)

First obtain logger make/model, firmware/configuration, warning algorithm/version, calibration/raw logs, bracket geometry/fastening and move date, cart wheel/drive state, tool mass/placement, track survey, route/speed records, and approved operating envelope. Decide whether the endpoint is anomaly detection, repeatable localization, or diagnostic utility. Qualified personnel determine safe access; this proposal does not authorize operation.

On a bench, if both brackets exist, apply a known input and calibrated reference while testing the same sensor/orientation on old and new assemblies; compare amplitude/phase by frequency, resonance, and mounting repeatability. Separately verify logger configuration versus effective ODR, timestamps/gaps, filter delay, clipping and alert replay. If old hardware is unavailable, do not treat historical passes as an A/B bracket experiment.

If later authorized as safe, record repeat passes on the bend and a control segment. Fix direction, tool masses/positions, and one safe speed for baseline; repeat enough to estimate within-condition variation and log independent speed, distance, time, motor/battery state, and conditions. Then vary speed and load in separate balanced/crossed blocks, with safe stationary machine-state controls where relevant. Retain raw data/settings; do not tune warning thresholds.

Synchronously record the logger plus a calibrated suitable-band reference accelerometer near its mount and a rigid cart point. Add fixed track-side reference sensing if track-vs-cart excitation matters. Use a shared trigger/clock or measure clock offset and filter delay. Locate events by encoder/odometer or surveyed optical markers/photo-gates; video can independently confirm marker passage. Predefine metrics for warning-vs-raw signal, repeatability of features and distance, speed/load/mount/background dependence, and agreement with reference within calibration uncertainty. A recurring event corroborated independently can justify referral to qualified engineering inspection; only that authority makes safety decisions. Set stop/escalation rules with them before any study.

## Still unresolved

Logger identity, range/sensitivity/axes/orientation, bandwidth/ODR/timestamp semantics, anti-aliasing and filters/delay, buffer/loss behavior, calibration/clipping/noise, alert feature/threshold/version, bracket geometry/rigidity/fastening and move date, wheel/bearing/drive state, track geometry/marker position, speed/direction, tool loads/positions, machine/background state, environmental conditions, safe authorization, and the primary endpoint. No numerical threshold or diagnosis is supportable until these dependencies are resolved.

## Evidence record

Source IDs S01–S08 are immutable within this stage. Full URL, version/commit, locator, access UTC, operation observed, conditions/defaults/exceptions, and applicability are in `source-map.json`; `sources/index.md` is the navigable index.
