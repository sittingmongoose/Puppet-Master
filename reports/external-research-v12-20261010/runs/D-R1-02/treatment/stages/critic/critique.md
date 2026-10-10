# Independent critic review — D-R1-02-treatment

## Scope and package identity

Reviewed the original brief, complete investigator discovery and draft, investigator source map and source index, the revealed plan, and its reveal record. The SHA-256 of the revealed plan is `e36e6b3f57dc6773ea3d65d44d3a91777614aefa2c548635892441bd7de1eafc`, matching the `plan_sha256` in `plan-reveal.json`. The reviewed package hashes are recorded below.

I independently checked the consequential source claims against manufacturer, vendor, journal, and arXiv primary material. My source access batch began at 2026-10-10T06:41:47Z; exact identities, versions, access time, locators, conditions, and transfer limits are in this stage's `source-map.json` and navigable [source index](sources/index.md).

No cart data, measurement, simulation, bench test, or field work was performed in this critic stage. I did not write or repair a final proposal.

## Overall assessment

The investigator package preserves the original brief and revealed plan's substantive scope. It separates warning emission, repeatable location, and diagnosis; treats speed, load, mounting, timing, and background behavior as hypotheses; compares acquisition and mount checks with repeated passes and independent references; and gives a bounded inspection referral without a safety conclusion or monitoring product. The implementation examples are distinguished from evidence about this cart, and proposed work is separated from work actually performed.

I found no material wrong, material incomplete, or scientifically unsupported claim in the proposal. The findings below concern one incorrect metadata note, one unverified stage-timing assertion, and inputs that remain unavailable by design.

## Findings

### C1 — Minor locator/wording: asserted case-ID discrepancy is absent

**Draft locator:** `draft.md`, opening case note (line 3).  
**Evidence:** The original brief at `brief.md` line 3 and the released plan at `revealed-plan.md` lines 3 and 19 both identify the case as `ER12-D-R1-02-FRESH`. The draft says the plan instead uses `D-R1-02-FRESH`; that comparison is not present in the released plan. This is a small metadata note and does not alter the proposal's scope or clause dispositions.

### C2 — Unsupported: investigator-deadline compliance statement

**Draft locator:** `draft.md`, “Per-clause disposition,” request row.  
**Claim under review:** The proposal was delivered within the investigator stage's assigned deadline.  
**Evidence available:** The critic input map gives this critic stage's deadline, and `plan-reveal.json` records when the plan was revealed. The listed investigator package contains no investigator-stage deadline or native completion receipt. I therefore cannot verify the timing claim. This is not evidence that the claim is false.

### C3 — Honestly unresolved external input: cart-specific implementation and operating history

**Draft locators:** “Prerequisites,” “Mount/acquisition isolation,” and “Still unresolved”; discovery “Scope and evidence boundary.”  
**Evidence:** The original brief supplies no logger identity/configuration, bracket drawings or installation history, cart inspection, raw recordings, or controlled operating records. S03 is a version-specific Linux/ADXL355 implementation incident; S04–S06 concern rail vehicles and track systems. The draft correctly limits transfer to method-level lessons and proposes recovery of the cart's records and a reversible comparison if old hardware exists. No source can establish this cart's logger behavior, bracket effect, wheel state, or safety from the available inputs.

## Brief and released-plan coverage

| Obligation | Critic assessment |
|---|---|
| Investigate reliability and meaning through a proposal, not a product | Covered. The sequence starts with evidence recovery, then isolates acquisition/mount questions, and proposes a later controlled study. |
| Explain sensing and mechanical mechanisms | Covered as interacting hypotheses, with no cause asserted as observed. |
| Compare mounting/acquisition changes, repeatable passes, and independent evidence | Covered through a conditional old/new bracket bench comparison, acquisition audit, controlled repeat passes, calibrated cart references, track-side sensing, and independent position references. |
| Separate unusual-signal detection, repeatable location, and physical diagnosis | Clearly separated; a warning or location alone is not treated as a diagnosis. |
| Address speed, load, mount, timing, and background behavior | Covered in the mechanisms, evidence-recovery list, test blocks, and controls. |
| Investigate bracket change and comparable implementation history, with transfer limits | Covered through proposed recovery/bench comparison and bounded ADXL355 and rail precedents. The cart-specific history remains an external input (C3). |
| Synchronized comparisons, controls, escalation, and proposed-versus-executed validation | Covered. Clock offset/drift and filter delay, control segment/state, repeated observations, references, and qualified inspection referral are specified. The draft reports no data check, simulation, bench or field validation as executed. |
| Safety and operational boundaries; no fabricated readings or threshold | Honored. No cart/track activity, diagnosis, vehicle authorization, or threshold tuning is claimed. |
| Preserve unresolved specifications and endpoint | Explicitly listed; the proposal withholds a numeric threshold and leaves the primary endpoint open. |

The revealed plan also asks for useful alternatives such as context-only event mapping, position references, and independent inspection. Those alternatives appear in the draft. The study's exact sample count and acceptance values are left to be set after the endpoint, safe envelope, and within-condition variation are known; the draft does require metrics and tolerances to be predefined. Given the plan's explicit open endpoint and lack of logger or operating data, I do not classify that conditional detail as a material omission.

## Evidence review

- **S01, ADXL355 datasheet:** Rev D supports the quoted ranges, power-up filter/ODR defaults, 0.63 ms group delay at 4 kHz, and the 400 kHz I2C 800 Hz recommended maximum with possible missed samples/noise above it. Synchronization modes have distinct delays/sample semantics. These are correctly labeled as an example rather than cart specifications.
- **S02, NI guide:** supports the mounting-compliance, added-mass, triaxial, and IEPE/conditioning discussion. The draft limits numeric mount-frequency examples to a typical 100 mV/g sensor.
- **S03, ADI support thread:** supports the reported 4 kHz configured versus about 2 kHz effective behavior in a specific Linux/IIO setup, the vendor's Raspberry Pi interrupt observation, and the FIFO-full proposal. It does not show that the proposal shipped; the draft states this limitation.
- **S04–S06, rail field studies:** the cited papers support multi-location references, speed/load/mount comparisons, and sensor-validity considerations in their own systems. S04's 2 kHz/72-channel figure applies to the surface-line section; S05 is a railway track-bed displacement study; S06's 20 Hz logging is for a wagon comfort study. The draft does not transfer their numeric results or thresholds to the cart.
- **S07–S08, methods:** the Dewesoft statement is explicitly vendor-module guidance rather than a universal sampling rule. arXiv v1 supports the camera/IMU/position-reference precedent under rigid installation, visible rail-head, and calibration conditions. The v1 content supports the draft; the unversioned URL in the investigator source map is the minor reproducibility issue recorded in the S08 source-map entry.

No reviewed source supports a defect or safety claim about this cart. No such claim appears in the draft.

## Package identity hashes

- Brief: `8134d8057d18234430a73538714e7e497ecd4c2a397f177d2bf8e94863a54149`
- Discovery: `06b7459f26729b550c5e0a22d95609a1df1af57794fc4be778e260bfb3977b9b`
- Draft: `24b3862dd27031e88f08a7ee93eb28df3cc0d92cdd7842626f6ba642c7faf1f6`
- Investigator source map: `d9ee0389957fd229897bdd9d46fcf56fcc0cd96fe67a71be447e4202494313f6`
- Revealed plan: `e36e6b3f57dc6773ea3d65d44d3a91777614aefa2c548635892441bd7de1eafc`
- Plan reveal record: `489e1165a0a84a3ce7b9686c2e3884fc5158b40a49a2ce8fcb38bf04e0910ab5`
