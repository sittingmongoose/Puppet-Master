# Intermittent vibration warnings on a maintenance cart

Case ID: ER12-D-R1-02-FRESH
Slot ID: D-R1-02
Domain: transport instrumentation

## Concealed prospective design record

Keep this file outside the candidate-facing research packet. It preserves the authored request and open design opportunities. It is not a completed research proposal, a source list, a result, or an evaluation answer key. Nothing here selects an eventual research method. No empirical validation has been executed in authoring this case.

## Exact original request and clauses

The original brief follows verbatim between the delimiters. These bytes define the original obligations; later clarification must not silently replace them.

BEGIN ORIGINAL BRIEF

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

END ORIGINAL BRIEF

## Research question and incompleteness

What research and later comparison design would establish the evidential meaning of an intermittent vibration warning before any physical-fault claim is made?

The future test authorization, acquisition access, physical inspection reference, and primary endpoint remain open. The proposal should choose an evidence-gathering sequence that has value even if the logger cannot support the originally imagined diagnosis.

## Meaningful useful alternatives

Consider improving mounting characterization, acquisition or time synchronization, repeatable passes with documented load and speed, position-reference observations, and independent inspection or a reference sensor. Recording operating context without changing the logger is a useful first step when attribution is weak. A simpler manual event map may be preferable to additional automated processing for some decisions. No sensor or analysis method is predetermined.

## Mechanism opportunity

Investigate how excitation, mounting transfer, cart dynamics, sample timing, and location estimates contribute to a measured event. Aliasing, clipping, bracket resonance, and varying exposure are hypotheses to evaluate against actual specifications, not claimed causes. Explain which kinds of evidence support event detection versus location or diagnosis, and which comparisons could reveal a sensing artifact.

## Implementation and history opportunity

Seek implementation histories with sensor placement, acquisition settings, vehicle conditions, reference observations, and failure or drift reports. Results from a different vehicle or infrastructure context may not transfer. The bracket relocation motivates recovery of installation dates and practices, but no before-and-after evidence is already supplied. Historical algorithm performance without the sensing chain and operating context is insufficient to justify a field claim.

## Proposed versus executed validation

A later authorized test-track pilot could coordinate repeat passes, documented speed and load, timestamp or position references, and reversible mounting comparisons. It should explain independent observation, repeated events, false warnings, and inspection escalation without presuming ground-truth faults. Simulated signals or a sampling illustration performed during the hour count only as desk checks under explicit assumptions; no field detection accuracy, safety, or defect diagnosis has been validated.

Authoring status: only synthetic input files have been prepared. No scientific search, pilot, experiment, data collection, implementation, or performance validation has been performed for this case. Future researchers must state the actual extent of any work they execute.

## Scope and release boundary

The topic is sized for a full 60-minute research-and-proposal session: substantive evidence discovery, causal reasoning, comparison of useful alternatives, implementation/history investigation, and a coherent later validation design. The proposal may contain reasoned provisional choices, but the case provides no predetermined winner. It requests no product build. Preserve brief.md and plan.md exactly for later paired freezes. D inputs remain sealed until the exact recipe and budget lock; provide no designer feedback before the candidate set finishes. Input readiness does not assert that those release conditions have been satisfied.
