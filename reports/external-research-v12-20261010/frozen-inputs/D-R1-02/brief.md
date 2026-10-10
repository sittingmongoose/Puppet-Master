# Intermittent vibration warnings on a maintenance cart

Case ID: ER12-D-R1-02-FRESH
Slot ID: D-R1-02
Domain: transport instrumentation

## Project situation

A maintenance team is trialing a battery vibration logger on a cart used along a disused test track. Several warnings cluster near one bend, but the same cart also carries different tool loads on different days. The logger was moved to a new bracket shortly before the warnings increased. The team wants to know whether a research pilot could make the observations interpretable. No raw recordings, sensor specification, track survey, or fault diagnosis are available. This is a synthetic test-track scenario.

## Request

Spend the 60-minute research window producing a proposal to investigate the reliability and meaning of these vibration observations. Explain the sensing and mechanical mechanisms, compare useful instrumentation and observation alternatives, and examine implementation history that could matter. Propose a controlled later study that can inform whether further engineering inspection is warranted; do not create a monitoring product.

## Requirements to preserve

- Distinguish detecting an unusual signal, locating a repeatable event, and diagnosing a physical defect.
- Compare changes in sensor mounting or acquisition with a repeatable-pass protocol and a useful independent observation or reference-instrument alternative.
- Address speed, load, mounting, sample timing, and background machine behavior as possible interacting explanations.
- Investigate the bracket change and the operating history of comparable implementations, including what evidence supports transfer to this cart.
- Propose synchronized comparisons, controls, and a meaningful escalation decision; report future validation separately from any desk simulation or data check actually executed.

## Boundaries

- Do not diagnose track or wheel safety, authorize vehicle use, or substitute the proposal for a qualified inspection.
- Do not run the cart, access a live railway, install sensors, or tune a field warning threshold in this assignment.
- Do not assume warnings are true defects or fabricate sensor readings, frequencies, or sampling capability.

## Still unresolved

The logger range, sampling and timestamp behavior, mounting rigidity, wheel condition, path repeatability, speeds, loads, and warning logic are unspecified. We have not decided whether the relevant future outcome is repeatability, location accuracy, or diagnostic utility. Identify these dependencies.
