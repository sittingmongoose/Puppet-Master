# Independent critique — ER12-D-R1-02-FRESH

**Run / stage:** D-R1-02-control / critic  
**Reviewed:** original brief; complete investigator discovery, draft, source map, revealed plan, plan-reveal record, and the carried source index.  
**Released plan:** 2026-10-10T06:29:20.975Z, SHA-256 `e36e6b3f57dc6773ea3d65d44d3a91777614aefa2c548635892441bd7de1eafc` (matches the plan-reveal record).  
**Native Goal:** exact activation response is preserved in [native-goal-activation.json](native-goal-activation.json); Goal ID `01a1248a-15e3-7670-a5b1-a552f813bc3b`.  
**Review window:** primary-source checks were made 2026-10-10T06:40:25Z–06:44:12Z. No case measurements, simulation, physical test, or field validation was performed by this critic.

## Overall assessment

The investigator draft substantially answers the original request and the exact released plan. It distinguishes signal detection, mapped repeatability, and diagnosis; compares mount/acquisition checks, repeat passes, and independent references; discusses speed, load, timing, mounting, machine state, and implementation history; and clearly separates proposed work from executed documentary review. Its scope and safety limits are preserved. No material wrong statement or fabricated cart-specific value was identified.

Two points need attention before the draft is treated as a complete decision proposal: one cited rail-study sentence overstates what the primary material I could inspect establishes, and the escalation rule has no branch for a repeatable mapped cart event when the local reference records no co-located response. The repeat-count criterion also remains exploratory rather than operational.

## Findings

| ID | Classification | Draft locator | Finding and evidence |
|---|---|---|---|
| C1 | Unsupported | `draft.md:49`, “a repeated run detected the same reported location” [S05] | The Taylor & Francis primary result I could inspect compares normalized 1/8-mile vertical-acceleration statistics from Runs 25 and 36 with NMT track-geometry statistics; it reports generally good vertical agreement and weaker lateral agreement. That supports a repeat-run comparison of section-level measures. The inspected evidence does not establish that a repeated run detected the same discrete reported anomaly/location. The source page itself was not fully openable in this session, so keep this judgment bounded: state the measured comparison and its limits, or provide a precise article locator for the stronger claim. |
| C2 | Material incomplete | `draft.md:10, 29, 82–85` | Inspection is requested only when a controlled, repeated event coincides with a local reference response. The draft says the reference is local and cannot cover the whole route (`draft.md:62–65`); the scaled-rail study likewise explains that a fixed strain gauge responds only when the vehicle passes that gauge and cannot observe a remote location [S08]. A null reference therefore cannot rule out a repeated cart event, a cart-side source, or a reference-location/sensitivity problem. Add an explicit unresolved branch: review reference coverage and measurement quality, and let qualified engineering decide whether a persistent mapped event still warrants inspection. Do not treat a null channel as clearance. |
| C3 | Minor locator/wording | `draft.md:25` | “Diagnosis = qualified inspection or independent physical evidence attributes a defect” is broader than the later protocol, which treats a local reference as co-location evidence and requests qualified inspection. Clarify that a reference channel can corroborate a local response, while defect attribution and any safety judgment remain with qualified inspection. The surrounding draft already avoids a diagnosis, so this is an ambiguity rather than a demonstrated unsafe conclusion. |
| C4 | Material incomplete | `draft.md:76` | The protocol says to repeat “enough” baseline passes and extend the 2×2 screening if variation prevents a “stable comparison,” but gives no minimum replicate count or stopping/precision rule. Since the endpoint is deliberately still an owner decision, the count can remain conditional; the proposal should say how it will be chosen from that endpoint and baseline variation, or label the result exploratory and keep escalation decisions provisional. |

### Scope and obligation coverage

| Brief / released-plan obligation | Assessment |
|---|---|
| Investigate reliability and meaning without creating a monitoring product | Met. The proposed work is an evidence-gathering pilot; no product is specified. |
| Explain detection, location, and physical diagnosis separately | Met, with wording clarification C3. |
| Compare mount/acquisition changes, repeat-pass protocol, and independent observation/reference | Met. The draft explains what each comparison can and cannot answer. |
| Address speed, load, mount, sample timing, and background behavior as interacting explanations | Met. It records operating conditions and proposes separating speed and load conditions. The two load levels are combined load configurations; because mass and placement are not varied independently, the resulting comparison must not be reported as isolating mass from placement. |
| Investigate the bracket change and comparable implementation history, including transfer limits | Met. The bracket study and rail deployments are appropriately bounded. C1 concerns a specific Run 36 description, not the overall coverage. The S13 item is correctly identified as an early vendor report rather than independent performance evidence. |
| Propose synchronized comparisons, controls, and a meaningful inspection escalation | Substantially met; C2 leaves an important negative-reference case unresolved. Synchronization via trigger/clock checks, route marks, speed recording, fixed conditions, and separate mount blocks is described. |
| Separate future validation from executed desk work | Met. The draft reports documentary research only and does not claim simulation, data validation, physical testing, installation, or field validation. |
| Preserve boundaries and identify unresolved inputs | Met. It does not diagnose safety, authorize use, access a railway, install equipment, tune a threshold, or fabricate logger capabilities. Logger settings, route, loads, machine state, wheel/caster state, warning logic, endpoint, and authorization remain open. |
| Released-plan research question, alternatives, mechanism, implementation/history, and validation sections | Covered. The source set spans mounting guidance, rail monitoring implementations, acquisition/timestamp configuration, a synchronized reference rig, bracket fatigue, and an early vendor trial; each is assigned a limited role. |

## Primary-source review and confidence

The critic independently checked the primary mounting guidance in S02–S03; S07’s amplifier specification, exported time increments, and differing empty/loaded speeds; S08’s scaled rig, synchronized local strain reference, and locality limits; S09–S11’s device/configuration-specific timestamp and filtering examples; and S13’s vendor-reported trial status. The S12 publisher abstract supports the specific bracket-mode example and its limited transfer. The S04, S05, and S06 publisher pages did not fully open in this session; their official search excerpts were checked and that limitation is recorded per source in [source-map.json](source-map.json). Source IDs and URLs remain those in the investigator package; no source has been silently reassigned.

The draft’s strongest practice is its repeated qualification that external railway findings motivate controls rather than supply cart thresholds, bandwidth, transfer functions, or diagnosis. The unresolved site/logger data and the primary endpoint remain genuine external inputs, not errors to fill with assumptions.

## Disposition

Keep the proposal within the original scope. Resolve C1’s source locator/wording, define the negative-reference decision path in C2, clarify C3, and make the replication rule in C4 conditional on the owner-selected endpoint. Preserve the distinction between what is proposed and what has actually been checked. This critique does not supply or repair a final proposal.
