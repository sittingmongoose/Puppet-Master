# R021 current assessment

Frozen: 2026-10-01T21:11:13.781598+00:00

Verdict: **quality failure**. Assessment coverage is complete across the report, all fourteen full finding bodies and six facets. The candidate covers one facet fully and five partially.

Report SHA-256: `3136fd9d07ff7ff6d2edfc71ed0dcc46f90035ea01e4acee62d2476c1103d89f`
Companion SHA-256: `8a76d84b96be74e22350a8bf5ff462cc4c8902632db1a0cd07db6a663ab9a293`
Source SHA-256: `5d8b240877ed2cf9596566187bcb3779ea011d5319807134c65e2e7dc2ae82de`
Sliced-plan SHA-256: `d915f8590cf2c0effff08c02beb14854f48d16b9500cf7c0b222dcc2886df8a0`

## Material failures

- R021-F01: The label dimension example is strengthened to a mandatory requirement.
- R021-F02: Conditional relative scales and unknown units do not guarantee universally known physical calibration.
- R021-F03: The report summary omits collection discovery/XML conditions that the companion restores.
- R021-F04: The conditional anisotropic zyx recommendation is broadened.
- R021-F05: Informative multiscale-choice guidance becomes a universal requirement.
- R021-F06: An informative channel-count comment is promoted into mandatory format validity.
- R021-F07: Alphanumeric path syntax is missed when declaring intermediate field paths unspecified.
- R021-F08: Level-count or dimension parity is overclaimed as registration/pixel alignment.
- R021-F09: Generic transitional metadata and reading-only policy is overstated.
- R021-F10: Zarr v2 for all 0.4 filesets is unverified in this admitted source.
- R021-O01: Names, rank and dimension_names validation are strong. Absent dimensions versus singleton dimensions and exact control behavior under unsupported roles are not explicit.
- R021-O02: Declared paths/order and missing-level feedback are covered. Nonuniform/anisotropic reduction consequences and a valid selection policy are not fully developed.
- R021-O03: Ordered composition and units limits are present, but universal calibration/default-one claims conflict with conditional fallback. No concrete translated numeric point check is supplied.
- R021-O04: Intermediate paths/default and count are described. Actual relative-source association, coordinate relationship and explicit refusal of unsupported geometry are not resolved; count-based alignment is overclaimed.
- R021-O05: Full integer whitelist and keyed colors/properties with SHOULD palette use are present. Exact 64-bit identity, sparse unordered lookup, supported-range refusal and categorical resampling are omitted.

## Complete claim inventory

### A01 — unresolved

Prepared/final status; full input/source reads, TASK lengths, no fetching, finding/acquisition records and operation compliance.

Current: current-report.md:3-5; current-report.md:11-14; current-report.md:120.
Evidence: Actual process evidence is not admitted.
Final files are frozen as supplied. Original TASK, native operations and acquisition records are not admitted; their sizes, reads, independence and provenance cannot be established in phase 1.

### A02 — supported

Fixed source title/date/editor/copyright institution, URL alias, original/view hash, 36,980 bytes, 896 lines and source-section register.

Current: current-report.md:12; current-report.md:20-22; findings.json:/findings/0/body; findings.json:/findings/13/body.
Evidence: S003:1-27; S003:67-896; catalog.json:4-39.
Source and catalog pins match exactly. OME/U. Dundee is the copyright attribution; the editor affiliation is German BioImaging e.V. Header URLs all point to /0.5 in this capture.

### A03 — supported

Five-slice 21-line plan and five-line brief are supplied.

Current: current-report.md:11; current-report.md:54-65.
Evidence: Viewer.md:1-21; brief.md:1-5.
The sliced plan is separately pinned; its substantive content matches the thin read-only local viewer scope.

### A04 — supported

External Zarr/OME-XML/UDUNITS/OMERO documents are references rather than admitted evidence; local-only transfer and live implementation limits.

Current: current-report.md:22; current-report.md:92-97.
Evidence: S003:68-77; S003:170-172; S003:257-260; S003:424-425; brief.md:5.
The report scopes transfer correctly; no external document or native tool behavior is verified here.

### F01a — supported

Zarr v3 and broadly permitted features unless explicitly disallowed; chunk metadata and local/HTTP/object storage.

Current: current-report.md:28; findings.json:/findings/0/body.
Evidence: S003:68-77; S003:99-100.
The crucial exception is retained. All features are not universally unrestricted because labels and image axes have specific constraints.

### F01b — supported

A reader feature subset may fail to decode valid data; reader breadth is a product decision and partial chunk loading an engineering approach.

Current: findings.json:/findings/0/body; current-report.md:52; current-report.md:63.
Evidence: S003:70-72; S003:91-100; Viewer.md:13.
A reasonable capability/engineering inference, not observed performance. Real emitted codecs and addressing details remain unverified.

### F02a — supported

Image groups, optional omero, separate arrays, arbitrary axis/level names, declared ordering and up to five axes with time/channel/space order.

Current: current-report.md:29; findings.json:/findings/1/body.
Evidence: S003:79-100; S003:426.
The full body explicitly preserves omero optionality and validation before relying on axis order.

### F02b — contradicted

Label dimensions must equal image dimensions or be one if irrelevant.

Current: findings.json:/findings/1/body.
Evidence: S003:106-108; S003:877-883.
The cited layout example says should. The full finding promotes it to MUST and cannot establish a universal dimension-admission constraint.

### F02c — supported

Discover levels through declared paths/order; labels container is the route; unrelated-group behavior is defined only for collections.

Current: findings.json:/findings/1/body.
Evidence: S003:93-94; S003:275; S003:304-306; S003:441-442.
Metadata is authoritative; no source ban on all supplemental scanning follows from this choice.

### F03a — supported

HCS plate/row/well hierarchy and mandatory specifications, with empty rows/wells discouraged.

Current: current-report.md:30; findings.json:/findings/2/body.
Evidence: S003:118-148.
Required hierarchy and empty-group conditions are correctly separated.

### F03b — supported

Sparse plates and metadata-driven well/field traversal reuse image pipelines.

Current: findings.json:/findings/2/body.
Evidence: S003:128-129; S003:641-750.
A valid source-to-plan implication. Exclusive refusal of scanning is a proposed discovery policy, not an explicit source prohibition.

### F03c — qualified

Whether well field paths may traverse intermediate groups is unspecified.

Current: findings.json:/findings/2/body; current-report.md:105.
Evidence: S003:744-748.
The literal mandatory alphanumeric-only path rule rules out slash-separated traversal. Behavior for an invalid or missing path remains unspecified, but path syntax is not wholly open.

### F04 — supported

attributes.ome, string hierarchy-consistent version, gate 0.5 behavior and explanatory handling of mixed versions.

Current: current-report.md:31; findings.json:/findings/3/body.
Evidence: S003:149-165; Viewer.md:13-21.
The version/namespace distinction and explicit admission signal are clear. Reject versus disclosed best effort is expressly a product choice.

### F05a — supported

Required unique names, rank and per-level dimension_names; recommended type/unit with custom values.

Current: current-report.md:40; findings.json:/findings/4/body.
Evidence: S003:166-174.
Axis-to-array identity is correctly grounded, without forcing standard names or guaranteed unit presence.

### F05b — qualified

Calibrated coordinates are possible only when units exist; absent units may fall back to raw indices labeled uncalibrated.

Current: findings.json:/findings/4/body; current-report.md:60-61.
Evidence: S003:170; S003:308-310.
Unknown units prevent a named physical-unit claim, but known transforms still define a coordinate mapping and relative factors. A raw-index fallback must not silently discard supplied scale/offset metadata.

### F05c — supported

Custom/missing type handling, formatting and unit conversion are product choices with external grammar unresolved.

Current: findings.json:/findings/4/body; current-report.md:52.
Evidence: S003:169-172; S003:301-302.
A graceful unsupported-role policy is permissible; axes still need to satisfy the multiscales spatial constraints.

### F06a — supported

Transitional collections, layout 3, plate precedence/exclusivity, OME-XML sidecar and MetadataOnly content.

Current: current-report.md:32; findings.json:/findings/5/body.
Evidence: S003:175-181; S003:204-206; S003:255-260.
The full body retains the existence and content distinction, although its governing-summary phrase OME-XML details SHOULD needs care: if XML is supplied, content constraints are MUST.

### F06b — supported

Series is optional, string paths ordered to XML if supplied; numeric groups only without series and plate; reader SHOULD/MAY policies.

Current: findings.json:/findings/5/body.
Evidence: S003:261-275.
The full finding preserves both discovery conditions and does not require a particular collection UI.

### F06c — qualified

Summary series order always matches XML Images and consecutive-numbered fallback is unconditional.

Current: current-report.md:32; current-report.md:50; current-report.md:58.
Evidence: S003:265-270; findings.json:/findings/5/body.
The summary omits if XML is provided and neither series nor plate; the full body restores them. Both remain current, so the summary cannot be treated as a complete unconditional rule.

### F06d — supported

The bioformats2raw layout is real tool output information and source-grounded interop target; later replacement and external XML rules unresolved.

Current: findings.json:/findings/5/body.
Evidence: S003:175-183; S003:257-260.
This credits the source tool/layout information without claiming current implementation tolerance or a tested native interop result.

### F07a — supported

General transform types, identity default, inline/binary vectors and sequential list order.

Current: current-report.md:41; findings.json:/findings/6/body.
Evidence: S003:277-293.
The vocabulary and vector alternatives are explicit.

### F07b — supported

Apply ordered transforms and support path vectors or explicitly refuse them; binary encoding/dtype/byte order is not specified here.

Current: findings.json:/findings/6/body; current-report.md:61; current-report.md:102.
Evidence: S003:284-293; S003:308-316.
A sound correctness/capability proposal. The actual binary read mechanics are an unresolved dependency.

### F08a — supported

Multiscales rank/type/order, group-relative declared levels, dimensional consistency and one required scale.

Current: current-report.md:42; findings.json:/findings/7/body.
Evidence: S003:295-310.
These apply within each multiscales dictionary and do not require fixed folder names or reduction ratios.

### F08b — supported

Physical scale is normal; relative factor is fallback when scaling is unavailable; translation follows scale, matching vectors; group transforms follow dataset transforms.

Current: findings.json:/findings/7/body.
Evidence: S003:308-316.
The full finding preserves the principal fallback condition and transform composition order.

### F08c — contradicted

The required scale defaults to 1.0 and physical calibration is always derivable because scale is mandatory.

Current: current-report.md:42; current-report.md:61; findings.json:/findings/7/body.
Evidence: S003:170; S003:310.
Default 1.0 is conditional on unavailable/inapplicable scaling and no downsampling. Such values do not establish physical calibration. A mandatory vector permits a mapping, not universally known physical units.

### F08d — qualified

zyx is a general spatial-order SHOULD.

Current: current-report.md:42; current-report.md:51; findings.json:/findings/7/body.
Evidence: S003:303.
The source condition includes yx as the image plane and the other anisotropic stack axis z. This is broader than a rule for all three-space axes.

### F08e — qualified

Recommended descriptive keys; multiple named entries require chooser or documented fallback.

Current: current-report.md:42; current-report.md:51; current-report.md:59; findings.json:/findings/7/body.
Evidence: S003:317-319; S003:388-397; S003:877-883.
The keys are SHOULD. Name/first-fallback and chunk-size choice are informative example guidance; they do not impose a universal reader UI requirement.

### F09a — supported

Optional transitional omero, conditional channels/RGB/window fields, example rdefs and external display semantics.

Current: current-report.md:43; findings.json:/findings/8/body.
Evidence: S003:398-430.
The body accurately distinguishes example conventions and normative field rules, and proposes explicit absent-metadata fallbacks.

### F09b — qualified

Channel-count mismatch with the array is a malformed case.

Current: findings.json:/findings/8/body.
Evidence: S003:403; S003:426-430.
Count matching is an informative example comment, not an explicit mandatory cardinality rule in the supplied normative sentences. It can be an unsupported display case or validation warning without inventing a format MUST.

### F10a — supported

Integer label whitelist, arbitrary names and intermediate groups without metadata, required paths with completeness SHOULD.

Current: current-report.md:44; findings.json:/findings/9/body.
Evidence: S003:432-442.
Names and hierarchy rules support discovery, and the report correctly retains the all-labels SHOULD.

### F10b — supported

Label multiscales and mandatory equal level count.

Current: findings.json:/findings/9/body; current-report.md:44; current-report.md:50.
Evidence: S003:454-455.
Count parity is a format rule; it is not registration proof.

### F10c — contradicted

Equal counts guarantee level-for-level alignment and source-equal-or-singleton dimensions are mandatory.

Current: findings.json:/findings/9/body; current-report.md:62.
Evidence: S003:106-108; S003:432-433; S003:454-455.
The source says same dimensions/transforms are usual. Count parity alone gives neither equal grids nor origin alignment; the dimension comment is should-level illustrative text.

### F10d — supported

image-label SHOULD; colors/version have conditional types; keyed integer IDs, optional RGBA/alpha, recommended reader palette use, extra keys.

Current: findings.json:/findings/9/body; current-report.md:44; current-report.md:51.
Evidence: S003:456-466.
Value-type MUSTs are conditional on the recommended keys being supplied. No explicit child-key-presence MUST is credited.

### F10e — supported

Optional properties and source, keyed arbitrary nonuniform metadata, relative image path/default, approximate half-opacity worked example.

Current: findings.json:/findings/9/body.
Evidence: S003:467-514.
The metadata facts and worked example are accurate. Actual relative-source resolution and exact categorical decoding are not specified.

### F10f — supported

Missing colors/rendering blend details and singleton-label display are product decisions; supplemental scanning is allowed choice.

Current: findings.json:/findings/9/body; current-report.md:52.
Evidence: S003:106-108; S003:441-474.
The source does not supply a complete default palette or blending implementation. Scanning is not forbidden.

### F11a — supported

Plate required rows/columns/version/wells, all physical rows/columns, exact names and indexes; acquisition fields and conditional types.

Current: current-report.md:33; findings.json:/findings/10/body.
Evidence: S003:518-560.
Detailed mandatory/recommended/optional field constraints are supplied in the companion body.

### F11b — supported

Dense/sparse examples; grid, field choice and acquisition filtering may follow metadata, with missing-path behavior and field ordering unresolved.

Current: findings.json:/findings/10/body.
Evidence: S003:561-739; S003:744-750.
Useful product alternatives; a particular grid UI is not itself a source requirement.

### F12a — supported

Required fields list, unique alphanumeric case-sensitive paths, conditional acquisition reference, recommended string well version and examples.

Current: current-report.md:34; findings.json:/findings/11/body.
Evidence: S003:740-808.
Acquisition conditionality and well-version strength are accurately preserved.

### F12b — qualified

Never directory-scan fields; acquisition filtering is optional and missing required reference is invalid.

Current: findings.json:/findings/11/body.
Evidence: S003:744-750.
The normative list supplies authoritative identity and mandatory references. Never scanning is a proposed discovery policy rather than a format prohibition; supplemental scans cannot override metadata.

### F12c — qualified

Field paths through intermediate groups are an unresolved format permission.

Current: findings.json:/findings/11/body.
Evidence: S003:744-748.
Alphanumeric-only required path syntax already constrains separators. Missing-path runtime handling remains open, but the stated syntactic uncertainty is too broad.

### F13a — supported

Transitional reader MUST/SHOULD expectations vary by metadata, writing usually MAY; comments forbidden and camelCase has legacy exceptions.

Current: current-report.md:35; findings.json:/findings/12/body.
Evidence: S003:60-66; S003:809-812.
The generic policy is conditional, rather than requiring every transitional feature unconditionally.

### F13b — qualified

All interoperability requires transitional reading; spec imposes reading duties only.

Current: findings.json:/findings/12/body; current-report.md:64.
Evidence: S003:60-64; S003:175-181; S003:398-430.
Declared supported interop profiles may require relevant transitional features. Generic policy also discusses writing, and key-level reader expectations are not universally mandatory. Read-only viewing triggers no write obligation.

### F13c — qualified

Exact key strings should be used, not uniform case conversion; maximumfieldcount is a legacy snake_case example and naming may be a capture artifact.

Current: findings.json:/findings/12/body; current-report.md:89.
Evidence: S003:524-525; S003:538-539; S003:557-559; S003:809-812.
Exact spellings are supported. maximumfieldcount is all lowercase, not snake_case; the source expressly acknowledges legacy naming differences. Their ultimate acquisition provenance remains unknown.

### F14a — supported

Pinned edition/header URLs/status, draft uncertainty, migrations, history dates and implementation pointer.

Current: current-report.md:36; findings.json:/findings/13/body.
Evidence: S003:1-27; S003:813-866.
These are capture statements, not live currency checks or proof of native reader behavior.

### F14b — supported

RFC keyword/lowercase rules and normative-text exceptions distinguish recommendations, options and obligations.

Current: findings.json:/findings/13/body.
Evidence: S003:57-59; S003:869-888.
The full body correctly preserves exceptions for examples, notes and explicit non-normative sections.

### F14c — qualified

All non-example text is normative.

Current: current-report.md:36.
Evidence: S003:877-878; findings.json:/findings/13/body.
Notes and explicitly non-normative sections are additional exceptions; the full body supplies the correct rule, but the summary wording is incomplete.

### F14d — unsupported

0.4-era filesets are v2 and accepting them would require Zarr v2 support.

Current: current-report.md:36; current-report.md:52; current-report.md:64; findings.json:/findings/13/body.
Evidence: S003:831-848.
The history establishes adoption of v3 in 0.5, but does not explicitly establish v2 storage for every 0.4 fileset. This is an unverified compatibility assertion, not admitted source evidence.

### F14e — qualified

Every non-example/notes prose statement carries RFC 2119 force.

Current: findings.json:/findings/13/body.
Evidence: S003:869-878.
Text can be normative as a descriptive conformance assertion without every sentence becoming a MUST. Strength must still follow the actual clause and applicable keyword.

### Table01 — qualified

Obligation, optional capability and product-decision table gives all listed normative field/rank/order/type checks and reader alternatives.

Current: current-report.md:46-52.
Evidence: S003:65-66; S003:149-174; S003:204-275; S003:277-319; S003:426-474; S003:518-560; S003:744-752.
The listed mandatory surfaces are mostly correct. Collection conditions, informative multiple-entry guidance and assumed v2 history require the separate qualifications above; source silent/error policy is product choice.

### P01 — supported

Keep the fixture disclaimer; add metadata-driven plain/collection/HCS image discovery and surface multiple images.

Current: current-report.md:56-58.
Evidence: Viewer.md:5-9; S003:79-129; S003:261-275; S003:744-750.
A sound broad-plan improvement, conditional on declared capabilities and with source reader SHOULD strength.

### P02 — qualified

Use declared level list rather than names and a name/first-fallback entry choice.

Current: current-report.md:59.
Evidence: S003:93-94; S003:304-306; S003:388-397.
Level authority is normative; the multiple-entry UI pattern is informative product guidance.

### P03 — supported

Axes-driven controls with custom types/absent units and optional omero defaults plus fallbacks.

Current: current-report.md:60.
Evidence: S003:169-174; S003:301-302; S003:401-430.
A source-compatible product proposal. Explicit absent-versus-singleton control policy is still missing.

### P04 — qualified

Dataset-then-group composition, inline/path capability and mandatory scale with default 1 permit correct coordinates.

Current: current-report.md:61.
Evidence: S003:293; S003:308-316; findings.json:/findings/7/body.
Order and capability disclosure are correct. Mandatory scale does not guarantee physical calibration, and fallback 1.0 is conditional; a numeric offset check is absent.

### P05 — qualified

Count parity enables aligned overlays with colors/alpha and unlisted-label risk.

Current: current-report.md:62.
Evidence: S003:432-433; S003:454-474.
It enables a candidate correspondence, not verified registration. Actual identity and transforms must be resolved first.

### P06 — supported

Background/cancellation are format-neutral, partial reads are an engineering basis, specific syntax/version/axis/type/path failures can be reported.

Current: current-report.md:63.
Evidence: Viewer.md:13-21; S003:65-66; S003:156; S003:174; S003:312; S003:438-439; S003:553-560; S003:745-750.
Concrete invalid-input facts are supported. Feedback/cancellation/performance remain product behavior, not native guarantees.

### P07 — qualified

Interop and version envelope are open; read-only scope is compatible; acceptance should include proposed fixtures.

Current: current-report.md:64-65.
Evidence: Viewer.md:17-21; S003:60-69; S003:175-181; S003:831-833.
Read-only compatibility and explicit future testing are sound. Relevant transitional support varies by profile; unverified v2 history and universal reading-only claims require qualifications.

### Coverage01 — qualified

Both groups and every brief requirement are mapped; aggregate scope equals the full brief.

Current: current-report.md:67-81.
Evidence: brief.md:3-5; Viewer.md:5-21.
The topical map is visible and both groups are addressed. It is not complete satisfaction of six facets; registration, categorical precision and calibration checks remain missing.

### Check01 — qualified

All source sections/eight keys and every MUST/SHOULD/MAY cluster were mapped and re-scanned.

Current: current-report.md:85-87.
Evidence: S003:149-808; S003:28-49.
All eight keys have current finding bodies; actual re-scan operations are unverified. A topical map does not prove no omitted conditions or every clause received a correct disposition.

### Check02 — supported

Example listing says all labels while normative completeness SHOULD controls.

Current: current-report.md:88.
Evidence: S003:104-105; S003:441-442; S003:877-883.
This accurately rejects strengthening the example listing into a universal MUST.

### Check03 — supported

Example-only rdefs is not a MUST; exact maximumfieldcount spelling retained.

Current: current-report.md:89.
Evidence: S003:419-425; S003:524-525.
These are useful exact-condition checks.

### Check04 — supported

All five plan slices and brief clauses were mapped, none unmapped.

Current: current-report.md:90.
Evidence: Viewer.md:3-21; brief.md:3-5; current-report.md:56-81.
This is true as a visible topical map; it does not assert a tested implementation or complete answer to every eligible facet.

### U01 — supported

Fixed source scope cannot verify live implementation behavior or post-capture changes; Tools/migration references are not supplied.

Current: current-report.md:94-101; findings.json:/findings/13/body.
Evidence: S003:25-27; S003:813-833; catalog.json:4.
The principal runtime interop limitation is honest. Named tool/layout information elsewhere is still credited rather than erased.

### U02 — supported

Detailed binary transforms, units conversion, OME-XML and OMERO semantics need future sources.

Current: current-report.md:102-104; findings.json:/findings/6/body; findings.json:/findings/4/body; findings.json:/findings/8/body.
Evidence: S003:170-172; S003:257-260; S003:284-289; S003:424-425.
These specific external or underspecified implementation dependencies are supported as limits.

### U03 — supported

Missing well.version and display ordering have no prescribed runtime response.

Current: current-report.md:105.
Evidence: S003:744-752.
Missing recommended version is not itself a mandatory type violation; runtime/display policy is not stated.

### U04 — supported

Error behavior for invalid versions/counts/missing paths or duplicate entry names is product work; later errata unvisited.

Current: current-report.md:106-107.
Evidence: S003:156; S003:388-397; S003:454-455; S003:744-752; catalog.json:4.
These specific runtime policies and post-capture limits are not resolved by the supplied source.

### T-status — supported

All proposed validation remains UNEXECUTED.

Current: current-report.md:5; current-report.md:109-111; current-report.md:120.
Evidence: current-report.md:109-116.
No passing test, fixture run or measurement is asserted. Actual native process execution remains unresolved.

### T-P01 — supported

Proposed positive fixture: minimal 2D / 5D arbitrary optional axes.

Current: current-report.md:113.
Evidence: S003:295-302.
A useful source-compatible UNEXECUTED fixture proposal; no creation or execution success is credited.

### T-P02 — supported

Proposed positive fixture: label colors and unlisted member.

Current: current-report.md:113.
Evidence: S003:441-466.
A useful source-compatible UNEXECUTED fixture proposal; no creation or execution success is credited.

### T-P03 — supported

Proposed positive fixture: series collection.

Current: current-report.md:113.
Evidence: S003:265-267.
A useful source-compatible UNEXECUTED fixture proposal; no creation or execution success is credited.

### T-P04 — supported

Proposed positive fixture: numeric collection fallback.

Current: current-report.md:113.
Evidence: S003:268-270.
A useful source-compatible UNEXECUTED fixture proposal; no creation or execution success is credited.

### T-P05 — supported

Proposed positive fixture: plate precedence.

Current: current-report.md:113.
Evidence: S003:204-206.
A useful source-compatible UNEXECUTED fixture proposal; no creation or execution success is credited.

### T-P06 — supported

Proposed positive fixture: dense / sparse plates.

Current: current-report.md:113.
Evidence: S003:561-739.
A useful source-compatible UNEXECUTED fixture proposal; no creation or execution success is credited.

### T-P07 — supported

Proposed positive fixture: multi-acquisition well.

Current: current-report.md:113.
Evidence: S003:748-808.
A useful source-compatible UNEXECUTED fixture proposal; no creation or execution success is credited.

### T-P08 — supported

Proposed positive fixture: missing units / omero.

Current: current-report.md:113.
Evidence: S003:170; S003:426.
A useful source-compatible UNEXECUTED fixture proposal; no creation or execution success is credited.

### T-P09 — supported

Proposed positive fixture: multiple named entries.

Current: current-report.md:113.
Evidence: S003:388-397.
A useful source-compatible UNEXECUTED fixture proposal; no creation or execution success is credited.

### T-P10 — supported

Proposed positive fixture: group transform and ordered translation.

Current: current-report.md:113.
Evidence: S003:311-316.
A useful source-compatible UNEXECUTED fixture proposal; no creation or execution success is credited.

### T-P11 — supported

Proposed positive fixture: binary path transform.

Current: current-report.md:113.
Evidence: S003:284-289.
A useful source-compatible UNEXECUTED fixture proposal; no creation or execution success is credited.

### T-N01 — supported

Proposed invalid-input fixture: dimension_names mismatch.

Current: current-report.md:113.
Evidence: S003:174; Viewer.md:13-21.
A genuine mandatory-rule violation and reasonable product rejection test. It remains UNEXECUTED.

### T-N02 — supported

Proposed invalid-input fixture: float labels.

Current: current-report.md:113.
Evidence: S003:438-439; Viewer.md:13-21.
A genuine mandatory-rule violation and reasonable product rejection test. It remains UNEXECUTED.

### T-N03 — supported

Proposed invalid-input fixture: JSON comments.

Current: current-report.md:113.
Evidence: S003:65-66; Viewer.md:13-21.
A genuine mandatory-rule violation and reasonable product rejection test. It remains UNEXECUTED.

### T-N04 — supported

Proposed invalid-input fixture: mixed version hierarchy.

Current: current-report.md:113.
Evidence: S003:156; Viewer.md:13-21.
A genuine mandatory-rule violation and reasonable product rejection test. It remains UNEXECUTED.

### T-property01 — qualified

All level extents are monotone non-increasing and equal-index overlays have pixel alignment.

Current: current-report.md:114.
Evidence: S003:305-310; S003:432-433; S003:454-455.
Declared resolution order does not mandate every physical or array-axis extent decrease, and count equality does not guarantee pixel-grid registration. Such properties need defined synthetic fixture geometry or explicit product capability constraints.

### T-property02 — supported

Vector lengths/rank, exactly one scale and label count parity property checks.

Current: current-report.md:114.
Evidence: S003:310-312; S003:454-455.
These are valid mandatory-rule checks, still UNEXECUTED.

### T-performance — supported

Large synthetic partial-read interaction probe.

Current: current-report.md:115.
Evidence: Viewer.md:13-21; S003:91-100.
A useful product test with no prescribed source latency or demonstrated performance.

### T-feedback — supported

Corrupt metadata, missing level array and inconsistent-version input should name the item and offer another.

Current: current-report.md:116.
Evidence: Viewer.md:13-21; S003:156; S003:304-306.
This explicitly handles a missing declared array as a product test. No runtime result is asserted.

## Facets

- OME05-C01 — full: The namespace/v3/version distinction, explicit gate and mixed-version feedback are covered. Older compatibility is an explicit decision, although asserted v2 history is unsupported. Current: current-report.md:28-31; current-report.md:50; current-report.md:63-64; findings.json:/findings/3/body; findings.json:/findings/13/body. Source: S003:68-69; S003:149-156.
- OME05-C02 — partial: Names, rank and dimension_names validation are strong. Absent dimensions versus singleton dimensions and exact control behavior under unsupported roles are not explicit. Current: current-report.md:29; current-report.md:40-42; current-report.md:60; findings.json:/findings/1/body; findings.json:/findings/4/body; findings.json:/findings/7/body. Source: S003:81; S003:166-174; S003:299-303.
- OME05-C03 — partial: Declared paths/order and missing-level feedback are covered. Nonuniform/anisotropic reduction consequences and a valid selection policy are not fully developed. Current: current-report.md:59; current-report.md:116; findings.json:/findings/1/body; findings.json:/findings/7/body. Source: S003:93-94; S003:304-319.
- OME05-C04 — partial: Ordered composition and units limits are present, but universal calibration/default-one claims conflict with conditional fallback. No concrete translated numeric point check is supplied. Current: current-report.md:41-42; current-report.md:61; current-report.md:114; findings.json:/findings/4/body; findings.json:/findings/6/body; findings.json:/findings/7/body. Source: S003:170; S003:293; S003:308-316.
- OME05-C05 — partial: Intermediate paths/default and count are described. Actual relative-source association, coordinate relationship and explicit refusal of unsupported geometry are not resolved; count-based alignment is overclaimed. Current: current-report.md:44; current-report.md:62; findings.json:/findings/9/body. Source: S003:432-474.
- OME05-C06 — partial: Full integer whitelist and keyed colors/properties with SHOULD palette use are present. Exact 64-bit identity, sparse unordered lookup, supported-range refusal and categorical resampling are omitted. Current: current-report.md:44; findings.json:/findings/9/body. Source: S003:438-439; S003:461-471.

## Useful novelty

- Detailed HCS plate/well constraints, sparse plate examples and the plate/well version distinction.
- Clear group/array dimension_names locus and path-vector capability disclosure.
- Useful conditional image-label display metadata and unlisted-label false-dismissal discussion.
- Explicit missing declared-array feedback and a readable five-slice plan/brief mapping.

## Unresolved matters

- Actual input reads, native operations, full-process compliance, independence and any runtime costs cannot be verified from final self-report.
- Real-tool behavior, detailed external specifications and post-capture changes remain unproved.

## Structural limits

- findings.json was initially missing, then supplied under an explicit immutable current-only companion addendum; the full body is now reviewed.
- Original TASK and acquisition.json remain unavailable/locked; no current semantic assertions there were assumed.

## Blinding limits

- Visible current files contain task-card/input paths, bounded-tool/process, acquisition/finding companion and final-format cues. No external candidate context/history was accessed.
- Current findings companion selector/configuration/native receipts are scalar metadata only; receipt bodies and actual process remain locked.
- Parent operational updates exposed production labels/runtime caps; they were excluded from semantic evidence and no treatment comparison was performed.
- Same source knowledge is reused from full earlier reading after exact byte-pin agreement.

All tests remain **UNEXECUTED**. Unreviewed supplied scope: none. Acquisition/history remains locked. Complete evidence and companion pins are recorded in the JSON.
