# Independent critique — D-R2-03-treatment

## Scope and timing

This is an independent review of the full investigator packet against the original brief and the released plan. The case is synthetic; no case archive, image, calibration, catalog object, or time series was available. Source scope discrimination was selected after reading the full ordinary packet and before new source fetching or verdicts. The fixed selection below will be preserved through the review.

## SCW selection register (fixed before new source checks)

Priority follows expected effect on an alternative, consequential condition, or transferability; ties follow draft order.

1. **SCW-01 — Independent-data lineage** (draft, “Decision summary”): “Use existing independent observations only if the field, epoch, cadence, bandpass, angular resolution, and data lineage make them useful.” Intended C: “independent observations” are separately acquired measurements from another data source. C*: change only the data-lineage selector: the observations have independent processing but reuse the same teaching-archive exposures. Delta: acquisition-independent → processing-independent. This distinction could change whether an external series is treated as confirmation.
2. **SCW-02 — Cloud cancellation** (draft, “Competing explanations and discriminating predictions,” Background row): “A uniform cloud may partly cancel in differential photometry only if stars share sufficiently similar conditions; that assumption is often imperfect.” Intended C: cancellation is conditional on target and comparisons experiencing sufficiently similar conditions. C*: change only the applicability-condition selector to “if the cloud is spatially uniform across the field,” regardless of whether target and comparison measurements otherwise share the same conditions. Delta: shared observing conditions → cloud spatial uniformity. This could change whether shared trends are discounted.
3. **SCW-03 — IRAF default transfer** (draft, “Calibration acquisition or recipe change”): “IRAF's documented ccdproc defaults enable fixpix, overscan, trim, zero, dark, and flat, but not illumination, fringe, readout, or scan correction; options require suitable inputs, flat selection follows subsets, and output naming can replace inputs.” Intended C: these are the cited IRAF 2.18 ccdproc defaults and behavior. C*: change only the subject/subsystem selector from IRAF 2.18 ccdproc to the unknown observatory reduction used during the term. Delta: named IRAF task → case reducer. This could change reconstruction or transfer claims.
4. **SCW-04 — AstroImageJ overwrite scope** (draft, “Reduction software, hidden defaults, or changed implementation”): “AstroImageJ documentation describes calibrated series feeding Multi-Aperture measurements and a separate Data Processor that can calibrate bias/dark/flat/linearity, update FITS headers, and invoke photometry; it warns that re-saving raw science can overwrite FITS inputs.” Intended C: the warning applies to the documented AstroImageJ operation/workflow. C*: change only the subject/subsystem selector to any AstroImageJ workflow, independent of the operation. Delta: documented Data Processor / raw-image re-save → all AstroImageJ workflows. This could affect preservation instructions.
5. **SCW-05 — Barycentric-input scope** (draft, “Exposure, saturation, nonlinearity, or timing”): “A barycentric correction requires source position and observer location.” Intended C: the barycentric light-travel-time correction discussed by the cited implementation needs the source and observer coordinates. C*: change only the operation selector to assigning any time value labelled BJD_TDB. Delta: barycentric light-time correction → any BJD_TDB labelling. This could change timing-audit requirements.

No source conclusions have been entered yet. For each item I will test the intended C and the one-selector diagnostic C* against the same applicable primary evidence; C* is not a proposed replacement.

## Review findings

### Fixed SCW records

Each record stays within the preselected scope. “Undetermined” is used where the same evidence does not establish or refute a diagnostic reading; absence from documentation is not treated as proof.

#### SCW-01 — independent-data lineage

- **Draft locator:** “Decision summary.”
- **Exact claim:** “Use existing independent observations only if the field, epoch, cadence, bandpass, angular resolution, and data lineage make them useful.”
- **C:** “Independent observations” means separately acquired measurements from another source/instrument. **C*:** independently processed measurements reusing the teaching-archive exposures. **Single selector changed:** data lineage, separate acquisition → separate processing of the same exposures.
- **Evidence E:** CR05 describes ZTF’s public survey; “Half of the ZTF camera time and half of the SEDM time are dedicated to a 2-night cadence public survey.” CR06 describes TESS spacecraft images; “The four cameras of TESS take consecutive images of a particular region of the sky every 2 seconds.” Join with the brief, which identifies the teaching archive as nightly telescope images and says no images/data were supplied. See [CR05](sources/CR05.md), [CR06](sources/CR06.md). These sources do not establish this field’s availability or product lineage.
- **C relation — ENTAILS:** separate ZTF/TESS survey products fit the intended separately acquired meaning; the draft remains conditional on usefulness.
- **C* relation — UNDETERMINED:** neither source says whether a future product reuses teaching exposures. Coordinates, dates, coverage, and lineage are missing.
- **Disposition:** qualify unresolved; retain the route and require acquisition/product provenance before calling evidence independent. **Supported replacement:** none before those facts are known. **Affected obligation:** compare independent-data and no-new-observation alternatives.

#### SCW-02 — cloud cancellation condition

- **Draft locator:** “Competing explanations and discriminating predictions,” background row.
- **Exact claim:** “A uniform cloud may partly cancel in differential photometry only if stars share sufficiently similar conditions; that assumption is often imperfect.”
- **C:** cancellation requires the target and comparisons to experience sufficiently similar effects. **C*:** spatial uniformity of the cloud alone suffices, regardless of whether the stars share the same measured effect. **Single selector changed:** applicability condition, same effect on stars → cloud spatial uniformity alone.
- **Evidence E:** CR01, AAVSO guide, p. 69 (lines 2049–2054): “In rare cases, a thin, uniform cloud may affect your target star and the comparison stars you are using to the same degree.” The neighboring text says cancellation follows from equal effect and warns about questionable-weather data. See [CR01](sources/CR01.md).
- **C relation — ENTAILS:** the draft’s “sufficiently similar conditions” captures the governing same-effect condition in substance, though “same degree” is more exact.
- **C* relation — UNDETERMINED:** the passage does not equate spatial uniformity alone with equal attenuation at each star; it also does not rule out all such cases.
- **Disposition:** scoped correction to “only if it affects the target and comparison stars to the same degree”; that wording is supported by E. **Affected obligation:** atmosphere/background and comparison-star behavior without selecting a cause (brief and plan mechanism opportunity).

#### SCW-03 — IRAF defaults and case transfer

- **Draft locator:** “Competing explanations and discriminating predictions,” calibration/reduction row.
- **Exact claim:** “IRAF's documented ccdproc defaults enable fixpix, overscan, trim, zero, dark, and flat, but not illumination, fringe, readout, or scan correction; options require suitable inputs, flat selection follows subsets, and output naming can replace inputs.”
- **C:** these defaults and behaviors belong to IRAF 2.18 ccdproc. **C*:** the same settings/behavior describe the unknown observatory reducer. **Single selector changed:** subject/subsystem, named IRAF 2.18 task → case reducer.
- **Evidence E:** CR02 task parameter table lines 29–55 gives the default switches; output parameter lines 18–19 states “If no list is given then the processing will replace the input images with the processed images.” The table also makes required masks, sections, and calibration images conditional on enabled operations. See [CR02](sources/CR02.md).
- **C relation — ENTAILS:** the task documentation supports the scoped implementation example, including blank-output replacement and prerequisite inputs.
- **C* relation — UNDETERMINED:** neither the draft nor this evidence identifies the archive reducer. Similar behavior in another package cannot be inferred from IRAF defaults.
- **Disposition:** qualify unresolved; retain only as a named example and recover the actual package/version/settings before transfer. **Supported replacement:** none for the unknown case. **Affected obligation:** implementation/history and calibration-transferability (brief and plan).

#### SCW-04 — AstroImageJ overwrite warning

- **Draft locator:** “Competing explanations and discriminating predictions,” reduction-software row.
- **Exact claim:** “AstroImageJ documentation describes calibrated series feeding Multi-Aperture measurements and a separate Data Processor that can calibrate bias/dark/flat/linearity, update FITS headers, and invoke photometry; it warns that re-saving raw science can overwrite FITS inputs.”
- **C:** the warning applies to AstroImageJ’s documented raw re-save operation when enabled. **C*:** it applies to every AstroImageJ workflow, regardless of operation. **Single selector changed:** subsystem, named raw re-save option → all AstroImageJ workflows.
- **Evidence E:** CR03 separates the Data Processor section (lines 408–427) from Astrometry Settings’ Re-save Raw Science option (lines 582–587); the warning at lines 613–615 reads “Enabling Re-save Raw Science will overwrite your original FITS files.” See [CR03](sources/CR03.md).
- **C relation — ENTAILS:** E supports overwrite risk for that named option when enabled.
- **C* relation — UNDETERMINED:** E scopes the warning to one option; silence about every other workflow does not establish that all saves overwrite or that they are all safe.
- **Disposition:** scoped correction; name the option and its enabled condition, and do not attach the warning specifically to Data Processor. **Supported replacement:** “In AIJ Astrometry Settings, enabling Re-save Raw Science overwrites the original science FITS files with WCS-added data.” **Affected obligation:** preservation and exact implementation behavior (brief and plan).

#### SCW-05 — barycentric calculation versus time label

- **Draft locator:** “Competing explanations and discriminating predictions,” exposure/timing row.
- **Exact claim:** “A barycentric correction requires source position and observer location.”
- **C:** computing the barycentric light-travel-time correction requires a source coordinate and observer location. **C*:** assigning or reading any value labelled BJD_TDB requires those inputs at that labeling step. **Single selector changed:** operation, calculating correction → applying a time label.
- **Evidence E:** CR04’s Astropy example creates a source SkyCoord, a Time with location=greenwich, then calls times.light_travel_time(ip_peg) and adds it to times.tdb (lines 2282–2305). See [CR04](sources/CR04.md).
- **C relation — ENTAILS:** that calculation uses both the source and observer inputs.
- **C* relation — UNDETERMINED:** the docs do not say that an already supplied BJD_TDB value needs those inputs merely to be read or labelled; conversion provenance is a separate question.
- **Disposition:** retain with operation scoped to computing the correction. **Supported replacement:** “Computing a barycentric light-travel-time correction from observatory timestamps uses the source coordinate and observer location.” **Affected obligation:** preserve time provenance and only convert after coordinates/site are verified (brief and plan).

### Ordinary brief and exact-plan review

The proposal is broad and mostly faithful to the full brief and released plan. It keeps measured repeatability, calibrated performance, and source variability as separate evidence levels; presents instrument, environmental, processing, and astronomical mechanisms without choosing a cause; addresses rotation/detector position, exposure/timing, background/field lights, atmosphere, and comparison-star behavior; and compares archive-first reduction, comparison/background choices, conditional acquisition, and independent existing data. It gives detailed controls, input/output provenance, chronology, held-out comparisons, timing/search dependence, and an escalation decision. It does not claim a real target, period, accuracy, significance, or discovery; it does not describe operating the telescope, altering the archive, installing software, or scheduling observations.

The clause-by-clause disposition table covers all original brief clauses and explicitly records unresolved field, filter, camera, timing, exposure, calibration, reducer, comparison, weather, and owner-endpoint questions. The released-plan additions are also substantially addressed: mechanisms follow the measurement chain across the table; the conditional sports-field lead remains unconfirmed; calibration and implementation examples carry version/default/precondition limits; candidate selection, aliases, correlated errors, and search multiplicity are reserved for a future analysis; and proposed validations are separated from executed research. The light-to-measurement chain is present in separate rows rather than as one explicit sequence; this is a minor presentation gap, not a missing mechanism branch.

### Classified findings

1. **Material incomplete — full-window requirement.** The original brief and plan explicitly request using the full 60-minute research window. In “Exact clause-by-clause disposition” and “Work actually performed,” the draft states that the full hour was not consumed and reports only the bounded source-access window (2026-10-10 06:57:50–07:10:40 UTC). The proposal’s content is substantial, but the time-use requirement is not met in the draft’s own account. The investigator-stage start and deadline are not in the allowed predecessor packet, so the reason for this shortfall cannot be adjudicated; the draft’s 07:27:18.124 UTC deadline is therefore **honestly unresolved external input**, not a confirmed error. Do not treat the critic’s own 07:39:18.124 UTC deadline as the investigator’s deadline.
2. **Unsupported — precise ZTF cutoff.** In “Independent existing data,” the draft says the public page described DR24 observations through 2025-10-22. The checked official release page [CR05](sources/CR05.md), lines 73–102, confirms release dates and the ZTF-3 image/light-curve release cadence, but does not state that exact DR24 observation cutoff in the inspected text. This does not change the conditional ZTF option, since no case coordinates/epoch were queried. Omit the precise cutoff or add a source that directly states it.
3. **Minor locator/wording — cloud condition.** The draft’s “sufficiently similar conditions” is looser than AAVSO’s same-degree condition at [CR01](sources/CR01.md), p. 69. SCW-02 gives a supported tighter wording.
4. **Minor locator/wording — AstroImageJ warning.** The preservation caution is valid but should identify the enabled Re-save Raw Science option in Astrometry Settings; see [CR03](sources/CR03.md) and SCW-04. The case’s software and settings remain unknown.

No other material wrong or unsupported scientific assertion was established in this review. The AAVSO, IRAF, AstroImageJ, Astropy, TESS, Lomb–Scargle, and Photutils statements checked in the packet are appropriately limited to their documented editions, operations, conditions, or future-use role. The draft’s ZTF/TESS availability caveats and its refusal to infer case applicability are sound. The primary scintillation paper supports separating intensity scintillation from image-blurring seeing and cautions against a precise site estimate without applicable conditions ([CR13](sources/CR13.md)).

### Native Goal activation capture

The exact native create response is preserved in [native-goal-create.json](native-goal-create.json), and the exact-objective binding guard passed before any mapped case/source input was opened. Directly exposed fields: goal.threadId=01a124a6-e71a-7a42-91b9-ca661d79074d; the objective equals the frozen string; status=active at creation; tokensUsed=0; timeUsedSeconds=0; createdAt=1791616293; updatedAt=1791616293; remainingTokens=null; completionBudgetReport=null. These timestamp values are preserved exactly as returned; no separate UTC timestamp or provenance/freshness proof is exposed. Provenance/freshness beyond the checker is UNKNOWN.

### Integrity and validation status

- Read the full original brief, discovery, draft, carried source map/index, revealed plan, and plan-reveal record from the mapped paths.
- Read-only SHA-256/byte-count comparison of the mapped discovery and revealed plan against plan-reveal.json matched both recorded hashes and byte counts exactly: discovery 15,678 bytes, eb09fcf6…97e49f; plan 7,042 bytes, 936dac13…9d6c2.
- Independently opened the listed public primary documentation and paper records; the routes, editions, locators, access note, conditions, and applicability are indexed in [sources/index.md](sources/index.md) and [source-map.json](source-map.json).
- These checks validate packet identity and generic source statements only. No archive, images, calibrations, software, target catalog, ZTF/TESS query, photometry, periodogram, time conversion, significance calculation, or observation was performed by this critic. All case-specific validation in the draft remains proposed.

