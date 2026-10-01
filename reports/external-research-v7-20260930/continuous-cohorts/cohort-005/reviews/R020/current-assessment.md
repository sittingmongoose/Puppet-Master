# R020 current assessment

Frozen: 2026-10-01T21:02:57.711124+00:00

Verdict: **quality failure**. Assessment coverage is complete: every supplied material assertion and all six facets were reviewed. Candidate coverage is one full facet and five partial facets.

Report SHA-256: `9d43cf6076ddc2aec0b9fb489a7cdb60620c8cccc3885f4d725ce437fcb7575d`
Source: `5d8b240877ed2cf9596566187bcb3779ea011d5319807134c65e2e7dc2ae82de`; 36,980 bytes, 896 lines.

## Material failures

- R020-F01: A label dimension recommendation is promoted to MUST.
- R020-F02: The anisotropic plane/stack condition on zyx ordering is omitted.
- R020-F03: Count/dimension parity is overclaimed as overlay registration.
- R020-F04: A broad implementation-information absence misses tool/layout and method/version counterevidence.
- R020-F05: Silence on rendering is broader than the source permits.
- R020-F06: The universal condition-preservation attestation needs qualification.
- R020-O01: Array identity, custom names and metadata-driven controls are covered; absent dimensions versus length-one axes and unsupported-role handling are not explicit.
- R020-O02: Declared paths/order and per-level geometry are covered. Missing declared-array handling and nonuniform/anisotropic selection policies are not complete.
- R020-O03: Composition order, offsets and honest unknown units are correct, but no concrete numeric translated point check exposes reversed composition or missing offsets.
- R020-O04: Path/default metadata and equal count are present. Actual relative source identity, coordinate registration and explicit refusal of unsupported geometry are not resolved; count/dimensions are incorrectly treated as sufficient.
- R020-O05: Integer types, keyed metadata and recommended palette use are covered. Exact 64-bit decoding/lookup, supported range refusal, sparse entry ordering and categorical resampling are not addressed.

## Full claim inventory

### A01 — unresolved

Single native Goal, task mandate, stable report stream, Q1/Q2 assignment and completion.

Current: current-report.md:3-10.
Evidence: Not admitted / process evidence withheld.
The current questions are visible. Original TASK and native Goal operations are not admitted; compliance and process cannot be verified in phase 1.

### A02 — supported

One fixed S003 capture, title/date/version/history, hash, byte and line counts, alias; local read-only brief and excluded capabilities.

Current: current-report.md:12.
Evidence: S003:1-10; S003:25-27; S003:821-833; catalog.json:4-20; brief.md:3-5.
Exact admitted bytes and catalog match. The source is a frozen capture, not a live-page verification.

### A03 — unresolved

Two full six-range acquisition phases, twelve identical receipts, initial input reads, no cached substitutes, logs and no executed tests.

Current: current-report.md:14-19.
Evidence: Not admitted / process evidence withheld.
The twelve claimed operations and withheld acquisition/protocol logs are outside phase-1 access. No execution success is credited.

### A04 — supported

Evidence/inference/uncertainty labels; RFC keywords may be lowercase; examples and notes are exceptions to general normative text.

Current: current-report.md:21.
Evidence: S003:57-59; S003:869-888.
The stated interpretation framework agrees with the source. Its application to individual findings is assessed separately.

### F001a — supported

RFC 2119, lowercase usage, exceptions for examples/notes, and prohibition of comments in real JSON.

Current: current-report.md:29.
Evidence: S003:57-66; S003:869-888.
These constraints are explicit; commented multiscales examples cannot be copied verbatim as valid JSON.

### F001b — qualified

Any metadata copied verbatim from the specification examples is malformed.

Current: current-report.md:29.
Evidence: S003:65-66; S003:320-387; S003:443-453.
This follows for the commented example identified here, not every example: the labels JSON example has no comments. The report should retain that scope.

### F002a — supported

Released 0.5, promised migrations, and editor-draft support uncertainty.

Current: current-report.md:30.
Evidence: S003:25-27.
These are statements of document status, not a guarantee of any native implementation.

### F002b — supported

History dates and adoption of v3, restored omero description, dimension_names MUST, and dated report header.

Current: current-report.md:30.
Evidence: S003:1-10; S003:825-833.
The stated dates and historical changes are present. Operative array placement is established separately at line 174.

### F003 — supported

Zarr v3; features may be used unless explicitly disallowed; local/HTTP/object-store representations.

Current: current-report.md:31.
Evidence: S003:68-77.
The crucial exception to general feature permission is preserved; remote availability is separated from product scope.

### F004a — supported

Image groups, zarr.json metadata, arbitrary axes and level names, declared ordering, 2–5 dimensions and time/channel/space order.

Current: current-report.md:35.
Evidence: S003:79-100; S003:295-307.
These layout and ordering claims are supported. The later F015 correctly qualifies omero as optional.

### F004b — supported

Chunks follow each array Zarr specification.

Current: current-report.md:35.
Evidence: S003:99-100.
Source support is a reference to Zarr mechanics, not a verified native codec or addressing implementation.

### F005a — supported

Nested labels container, integer arrays, permitted intermediate folders without additional metadata.

Current: current-report.md:36.
Evidence: S003:102-117; S003:432-440.
Container identity, nesting and integer restriction are supported.

### F005b — contradicted

Each label dimension must equal the image dimension or be 1 if irrelevant.

Current: current-report.md:36.
Evidence: S003:106-108; S003:877-883.
The cited statement says should, and occurs in the layout example. Promoting it to a mandatory dimension constraint is unsupported. The later normative rule requires equal level count, not universally identical grids.

### F006 — supported

Required plate/row/well hierarchy and well/plate specifications; empty rows and wells SHOULD NOT occur.

Current: current-report.md:37.
Evidence: S003:118-129.
Modal strength and the empty-group condition are preserved.

### F007 — supported

attributes.ome namespace, string version, hierarchy-consistent version; mixed values are nonconforming.

Current: current-report.md:41.
Evidence: S003:149-165.
An explicit mandatory consistency rule provides a valid admission check.

### F008 — supported

Unique required axis names; recommended type/units with custom types; axes rank and per-level dimension_names presence/match.

Current: current-report.md:45.
Evidence: S003:166-174; S003:825-827.
Names, rank and array identity are grounded correctly. Recommended units do not authorize invented calibration.

### F009 — supported

General transformations require a type, allow identity/scale/translation, inline or binary vectors, and list-order application.

Current: current-report.md:46.
Evidence: S003:277-293.
General transform types and storage alternatives are distinct from narrower multiscales rules.

### F010a — supported

Each multiscales dictionary has axes of rank 2–5, two or three spaces and optional time/channel/custom; order matches arrays.

Current: current-report.md:47.
Evidence: S003:295-302.
The requirements apply within each multiscales dictionary; no cross-entry universal rank constraint is asserted.

### F010b — qualified

For 3D stacks, spatial order SHOULD be zyx.

Current: current-report.md:47.
Evidence: S003:303.
The source adds the condition that yx is the image plane and z the other anisotropic stack axis. The broader wording loses that condition.

### F010c — supported

datasets and group-relative paths are required, highest resolution first; level rank/order matches axes.

Current: current-report.md:47.
Evidence: S003:304-307.
Names do not supply ordering and each dictionary has its own axes contract.

### F010d — supported

Exactly one scale, conditional relative-factor fallback, optional translation after scale, matching vector lengths.

Current: current-report.md:47.
Evidence: S003:308-313.
The physical-size rule and absence/inapplicability fallback are preserved; the transform rules exclude identity here.

### F010e — supported

Optional group transforms use the same rules after dataset transforms; example shared time factor is 0.1 ms.

Current: current-report.md:47.
Evidence: S003:314-316; S003:330-374.
The order and the worked example shared time factor are accurate.

### F010f — supported

name, downscaling type and method metadata SHOULD be present.

Current: current-report.md:47.
Evidence: S003:317-319.
These keys are recommendations rather than admission MUSTs.

### F011 — supported

Physical per-level sizes are normally absolute; relative factors are conditional fallback, with regime ambiguity left open.

Current: current-report.md:48.
Evidence: S003:310; S003:330-374.
The example gives 0.5, 1.0 and 2.0 micrometer level sizes. The report avoids multiplying by the first level size and honestly scopes regime identification uncertainty.

### F012 — supported

Named multiscale choice with first fallback comes from informative pseudocode.

Current: current-report.md:49.
Evidence: S003:388-397; S003:877-883.
The report expressly marks the example as informative; it does not turn its chunk-size comment into pyramid-level guidance.

### F013a — supported

Transitional collection status, conforming layout value 3, plate precedence and collection/plate exclusivity.

Current: current-report.md:53.
Evidence: S003:60-64; S003:175-181; S003:204-206; S003:255-256.
The quoted value follows source wording; numbered examples represent numeric 3. Transitional reader strength must be determined per key.

### F013b — supported

OME XML is recommended; if supplied it follows OME-XML and MetadataOnly, with minimum specification permitted.

Current: current-report.md:53.
Evidence: S003:257-260.
Presence is SHOULD and content constraints are conditional on supplied XML, as this sentence indicates.

### F013c — supported

Plate locations, optional series string list, XML order if provided, numeric fallback only without series and plate; one image per multiscales group.

Current: current-report.md:53.
Evidence: S003:261-270.
Both critical discovery conditions are explicitly retained.

### F014 — supported

Readers SHOULD disclose multiple images and SHOULD NOT silently open first; MAY choose series, all/choice display or ignore unrelated roots.

Current: current-report.md:54.
Evidence: S003:271-275.
The report explicitly distinguishes SHOULD/MAY from MUST.

### F015a — qualified

omero optional; conditional channels, color and window fields, with channel-count matching.

Current: current-report.md:58.
Evidence: S003:401-403; S003:426-430.
Required fields and RGB syntax are normative. Array-size matching is shown in the informative example rather than explicitly repeated as a MUST at lines 426–430.

### F015b — supported

rdefs and other example fields are informative, with fuller semantics in an unadmitted external reference.

Current: current-report.md:58.
Evidence: S003:401-425; S003:877-883.
The report preserves the limit and does not impose a universal initialization algorithm.

### F016 — supported

Integer label types including signed/unsigned 64-bit; metadata-free intermediate groups; required path list, completeness SHOULD; label multiscales and equal level count.

Current: current-report.md:62.
Evidence: S003:438-455.
Modal strength and arbitrary hierarchy paths are retained. Equal counts do not prove registration.

### F017a — supported

image-label and colors/version key presence SHOULD; provided values have mandatory types and keyed IDs, optional RGBA with 0–255 components and alpha.

Current: current-report.md:63.
Evidence: S003:456-466.
The nested presence/type distinction is correctly stated; reader palette behavior remains SHOULD.

### F017b — supported

Optional properties/source, label-value keys, arbitrary nonuniform properties, relative source path and ../../ default.

Current: current-report.md:63.
Evidence: S003:467-474.
These are supported metadata facts. A rendering association algorithm is still absent.

### F018a — supported

Optional acquisitions with unique nonnegative IDs, recommended name/maximumfieldcount and conditional type constraints/timestamps.

Current: current-report.md:67.
Evidence: S003:518-529.
Acquisition conditions and types match the source.

### F018b — supported

Required physical rows/columns including empty ones, exact alphanumeric case-sensitive unique names and recommended filesystem collision avoidance.

Current: current-report.md:67.
Evidence: S003:530-549.
The report separates physical plate grid from populated well groups.

### F018c — supported

Recommended field_count/name; mandatory plate version/wells, row/column path and zero-based index consistency; sparse plate example.

Current: current-report.md:67.
Evidence: S003:538-560; S003:561-739.
Mandatory path/index rules and sparse example are accurately described; examples illustrate rather than create obligations.

### F019 — supported

Required well images with unique alphanumeric paths, acquisition only when multiple plate acquisitions, version recommended with conditional string type.

Current: current-report.md:68.
Evidence: S003:740-808.
The plate/well version asymmetry and acquisition condition are preserved.

### F020 — supported

CamelCase convention with exact legacy key exceptions; readers should not normalize key spellings.

Current: current-report.md:72.
Evidence: S003:459-470; S003:524-560; S003:809-812.
Exact spellings are source facts; preserving them in parsing is a reasonable engineering inference.

### F021 — qualified

Index oddities and stray punctuation are minor capture artifacts, with no change to requirements.

Current: current-report.md:73.
Evidence: S003:130; S003:889-892.
The oddities exist. Their origin as conversion artifacts is a plausible inference, not source-proved provenance; treating cross-references cautiously is reasonable.

### F022a — qualified

The capture alone cannot establish which tools exist or implementation behavior.

Current: current-report.md:74.
Evidence: S003:175-183; S003:375-382; S003:424-425; S003:813-814.
Real reader tolerance and interop behavior are unverified, but the document does identify bioformats2raw and skimage, including a method/version payload. A blanket implementation-information absence is too broad.

### F022b — supported

Detailed Zarr/OME-XML/OMERO/UDUNITS mechanics, a conformance suite and future collection replacement remain outside this capture.

Current: current-report.md:74.
Evidence: S003:68-72; S003:99-100; S003:170-181; S003:257-260; S003:424-425; S003:813-896.
A full-source review supports these qualified limits. They are not ecosystem-wide absence claims.

### F023a — supported

Counterevidence rejects comments, name-based level order, fixed axis names, dense-only plates, required omero, float labels and mandatory well version.

Current: current-report.md:75.
Evidence: S003:65-66; S003:81; S003:93-94; S003:128-129; S003:305-306; S003:426; S003:438-439; S003:550-551; S003:641-739; S003:751-752.
Every listed rejection has the stated source basis.

### F023b — supported

Scale values are not universally absolute; fallback regime is conditional.

Current: current-report.md:75.
Evidence: S003:310.
The fallback condition is explicit and not a free choice to reinterpret normal calibrated scale values.

### F101a — qualified

A complete promised image listing should handle plain images, HCS and transitional collections, rather than silently opening the first.

Current: current-report.md:83.
Evidence: Viewer.md:5; S003:79-129; S003:175-275; S003:515-808.
The coverage follows the broad product promise. The source has conditional collection obligations and reader recommendations; it does not mandate every UI layout or prominently surfaced list for every conforming reader.

### F101b — supported

Unrelated root groups may be ignored and label metadata supplies label discovery.

Current: current-report.md:83.
Evidence: S003:275; S003:441-442.
These permissions/paths are supported; discovery breadth still requires an explicit product policy.

### F102 — supported

Drive controls by axes/dimension_names rather than fixed names; report array-identity mismatch.

Current: current-report.md:84.
Evidence: Viewer.md:5-11; S003:81; S003:166-174; S003:299-302.
This is a sound source-to-plan implication. It does not fully address absent versus singleton dimensions.

### F103 — qualified

Use declared high-to-low levels and per-level geometry, not folder names; multiple named entries use informative choice/fallback.

Current: current-report.md:85.
Evidence: Viewer.md:5; S003:93-94; S003:304-319; S003:388-397.
Declared ordering and geometry are correct. Ranking by derived physical size is a proposed policy needing anisotropic/nonuniform handling, and the choice example is informative, as the report acknowledges.

### F104 — supported

Compose dataset scale/translation then group transforms; unit SHOULD means honest uncalibrated display and no invented units.

Current: current-report.md:86.
Evidence: Viewer.md:5; S003:169-172; S003:293; S003:308-316.
The reasoning is correct, including optional units and custom types. No concrete numerical offset check is supplied.

### F105a — contradicted

Level-count parity and equal-or-singleton dimensions guarantee that level-aligned overlay rendering is sound.

Current: current-report.md:87.
Evidence: S003:106-108; S003:432-433; S003:454-455; S003:472-474.
Equal counts or dimensions do not establish equal grids, origins or transforms. The source says same dimensions/transforms are usual. Resolve actual association and coordinates before overlaying.

### F105b — supported

Palette use SHOULD, missing image-label permits fallback; source path default and arbitrary keyed properties.

Current: current-report.md:87.
Evidence: S003:456-474.
These are correctly qualified format facts and a sensible explicitly proposed rendering fallback.

### F105c — supported

Unlisted labels violate a completeness SHOULD; tree scanning is a discovery extension.

Current: current-report.md:87.
Evidence: S003:441-442.
This is a recommendation gap, not mandatory format failure or a source ban on scanning.

### F106 — supported

omero can seed display; absent metadata needs product defaults, example time/plane hints can be clamped.

Current: current-report.md:88.
Evidence: Viewer.md:5; S003:401-430.
The report treats initial display and clamping as inferences, with external semantics unresolved.

### F107 — supported

Specific mandatory metadata checks can support plan failure feedback; crashes violate the plan rather than a defined source runtime protocol.

Current: current-report.md:89.
Evidence: Viewer.md:7-11; S003:65-66; S003:156; S003:173-174; S003:204-206; S003:256-270; S003:300-312; S003:438-455; S003:530-560; S003:744-750.
The enumerated mandatory checks are valid. Explanatory messages are product acceptance behavior, not source-defined crash semantics.

### F108a — supported

Background IO, caching and cancellation are not source obligations; chunked storage supports a partial-read engineering approach.

Current: current-report.md:93.
Evidence: Viewer.md:7; S003:70-72; S003:91-100; S003:1-896.
No source rule specifies threading, cancellation, latency or cache policy; feasibility does not prove performance.

### F108b — qualified

The specification is silent on rendering.

Current: current-report.md:93.
Evidence: S003:401-430; S003:461-466.
It gives rendering metadata and recommended palette behavior. Silence is defensible only for concrete concurrency/cache/rendering algorithms, not rendering as a whole.

### F108c — supported

Exact chunk addressing is unverified here; local scope fits the format, remote support would be a product choice.

Current: current-report.md:93.
Evidence: brief.md:5; S003:68-77; S003:99-100.
The admitted text refers external Zarr mechanics and supports local representation without extending the brief.

### F109 — supported

Version consistency and draft warnings justify explicit admission; older/v2 compatibility is an unresolved product decision.

Current: current-report.md:94.
Evidence: S003:25-27; S003:60-69; S003:156; S003:180-181; S003:831-833.
The report does not claim the source establishes an earlier Zarr-v2 version history; broader compatibility is left unproved.

### F110a — supported

Optional sparse HCS/acquisition UI, exact legacy keys, collision warnings, mixed-version detection and collection-size presentation.

Current: current-report.md:95.
Evidence: S003:156; S003:272; S003:530-560; S003:641-750; S003:809-812.
These are useful proposed product improvements with cited constraints; no HCS-specific UI is mandated by the source.

### F110b — supported

Custom/unlisted unit display and best-effort unlisted label discovery can be explicit product choices.

Current: current-report.md:95.
Evidence: S003:169-172; S003:441-442.
Recommended units and completeness do not require silently inventing units or rejecting all such inputs.

### F111-status — supported

All validation is proposed and UNEXECUTED, including desk review.

Current: current-report.md:97-99; current-report.md:102; current-report.md:115.
Evidence: current-report.md:97-103.
The current status is unambiguous. Actual native test operations remain unverified; no passing product test is credited.

### T-P01 — supported

Proposed positive fixture: 5D with shared time transform.

Current: current-report.md:100.
Evidence: S003:320-387; Viewer.md:11.
A useful, source-compatible UNEXECUTED proposal. No generated fixture, measurement or passing result is asserted.

### T-P02 — supported

Proposed positive fixture: 2D/4D variants.

Current: current-report.md:100.
Evidence: S003:295-302; Viewer.md:11.
A useful, source-compatible UNEXECUTED proposal. No generated fixture, measurement or passing result is asserted.

### T-P03 — supported

Proposed positive fixture: full plate.

Current: current-report.md:100.
Evidence: S003:561-640; Viewer.md:11.
A useful, source-compatible UNEXECUTED proposal. No generated fixture, measurement or passing result is asserted.

### T-P04 — supported

Proposed positive fixture: sparse plate.

Current: current-report.md:100.
Evidence: S003:641-739; Viewer.md:11.
A useful, source-compatible UNEXECUTED proposal. No generated fixture, measurement or passing result is asserted.

### T-P05 — supported

Proposed positive fixture: multi-acquisition wells.

Current: current-report.md:100.
Evidence: S003:753-808; Viewer.md:11.
A useful, source-compatible UNEXECUTED proposal. No generated fixture, measurement or passing result is asserted.

### T-P06 — supported

Proposed positive fixture: label colors/properties/source.

Current: current-report.md:100.
Evidence: S003:443-514; Viewer.md:11.
A useful, source-compatible UNEXECUTED proposal. No generated fixture, measurement or passing result is asserted.

### T-P07 — supported

Proposed positive fixture: bioformats2raw series/XML collection.

Current: current-report.md:100.
Evidence: S003:183-270; Viewer.md:11.
A useful, source-compatible UNEXECUTED proposal. No generated fixture, measurement or passing result is asserted.

### T-N01 — supported

Proposed negative fixture: JSON comments.

Current: current-report.md:101.
Evidence: S003:65-66; Viewer.md:7-11.
The cited condition is a genuine mandatory constraint. Explanatory feedback is a product test requirement. The test remains UNEXECUTED.

### T-N02 — supported

Proposed negative fixture: mixed versions.

Current: current-report.md:101.
Evidence: S003:156; Viewer.md:7-11.
The cited condition is a genuine mandatory constraint. Explanatory feedback is a product test requirement. The test remains UNEXECUTED.

### T-N03 — supported

Proposed negative fixture: missing/mismatched dimension_names.

Current: current-report.md:101.
Evidence: S003:174; Viewer.md:7-11.
The cited condition is a genuine mandatory constraint. Explanatory feedback is a product test requirement. The test remains UNEXECUTED.

### T-N04 — supported

Proposed negative fixture: reversed dataset order.

Current: current-report.md:101.
Evidence: S003:305-306; Viewer.md:7-11.
The cited condition is a genuine mandatory constraint. Explanatory feedback is a product test requirement. The test remains UNEXECUTED.

### T-N05 — supported

Proposed negative fixture: missing/duplicate scale.

Current: current-report.md:101.
Evidence: S003:310; Viewer.md:7-11.
The cited condition is a genuine mandatory constraint. Explanatory feedback is a product test requirement. The test remains UNEXECUTED.

### T-N06 — supported

Proposed negative fixture: translation before scale.

Current: current-report.md:101.
Evidence: S003:311; Viewer.md:7-11.
The cited condition is a genuine mandatory constraint. Explanatory feedback is a product test requirement. The test remains UNEXECUTED.

### T-N07 — supported

Proposed negative fixture: wrong vector length.

Current: current-report.md:101.
Evidence: S003:312; Viewer.md:7-11.
The cited condition is a genuine mandatory constraint. Explanatory feedback is a product test requirement. The test remains UNEXECUTED.

### T-N08 — supported

Proposed negative fixture: invalid collection layout value.

Current: current-report.md:101.
Evidence: S003:256; Viewer.md:7-11.
The cited condition is a genuine mandatory constraint. Explanatory feedback is a product test requirement. The test remains UNEXECUTED.

### T-N09 — supported

Proposed negative fixture: plate/collection mixing.

Current: current-report.md:101.
Evidence: S003:204-206; Viewer.md:7-11.
The cited condition is a genuine mandatory constraint. Explanatory feedback is a product test requirement. The test remains UNEXECUTED.

### T-N10 — supported

Proposed negative fixture: noninteger label pixels.

Current: current-report.md:101.
Evidence: S003:438-439; Viewer.md:7-11.
The cited condition is a genuine mandatory constraint. Explanatory feedback is a product test requirement. The test remains UNEXECUTED.

### T-N11 — supported

Proposed negative fixture: label level-count mismatch.

Current: current-report.md:101.
Evidence: S003:454-455; Viewer.md:7-11.
The cited condition is a genuine mandatory constraint. Explanatory feedback is a product test requirement. The test remains UNEXECUTED.

### T-N12 — supported

Proposed negative fixture: invalid/duplicate names.

Current: current-report.md:101.
Evidence: S003:530-549; Viewer.md:7-11.
The cited condition is a genuine mandatory constraint. Explanatory feedback is a product test requirement. The test remains UNEXECUTED.

### T-N13 — supported

Proposed negative fixture: path/index disagreement.

Current: current-report.md:101.
Evidence: S003:552-560; Viewer.md:7-11.
The cited condition is a genuine mandatory constraint. Explanatory feedback is a product test requirement. The test remains UNEXECUTED.

### T-N14 — supported

Proposed negative fixture: unknown acquisition reference.

Current: current-report.md:101.
Evidence: S003:748-750; Viewer.md:7-11.
The cited condition is a genuine mandatory constraint. Explanatory feedback is a product test requirement. The test remains UNEXECUTED.

### T-review — supported

Proposed source-to-claim conditional-strength desk review.

Current: current-report.md:102.
Evidence: S003:57-59; S003:869-888.
Useful UNEXECUTED review; it cannot certify conditions already lost in the report.

### T-interop — qualified

Real-tool interop is proposed but not tested; no implementation is described in the source.

Current: current-report.md:103.
Evidence: S003:175-183; S003:375-382; S003:813-814.
No native interop behavior is established. The source nevertheless contains named tool/layout and method/version information; the complete description denial needs qualification. ome-zarr-py is an unverified prospective lead.

### F112 — supported

Reader behavior, detailed external mechanics, future metadata and conformance suite remain explicitly open within this capture.

Current: current-report.md:107.
Evidence: S003:68-72; S003:170-181; S003:257-260; S003:424-425; S003:813-896.
The unresolved list is valid when scoped to detailed behavior rather than denying all tool information.

### A05 — unresolved

Stable finding index in external logs, repeated reads, TASK retry, permitted-tool compliance, no native/shell/fetch or extra stage.

Current: current-report.md:113-115.
Evidence: Not admitted / process evidence withheld.
Actual operations and inaccessible logs are not established by current-file self-report. Current IDs are visible and unique.

### A06 — qualified

Conditional language is preserved throughout; all negative assertions and epistemic labels are correct.

Current: current-report.md:116.
Evidence: S003:106-108; S003:303; S003:432-433; S003:175-183; S003:375-382.
Most labels and scoped negatives are careful, but dimension strength, conditional spatial order, overlay guarantee and implementation absence prevent an unqualified attestation.

## Facets

- OME05-C01 — full: Version/namespace, hierarchy consistency, strict version checking and invalid-input feedback support explicit admission. Older compatibility is an explicit unresolved choice. Current: current-report.md:31; current-report.md:41; current-report.md:89; current-report.md:94; current-report.md:101. Source: S003:68-69; S003:149-156.
- OME05-C02 — partial: Array identity, custom names and metadata-driven controls are covered; absent dimensions versus length-one axes and unsupported-role handling are not explicit. Current: current-report.md:35; current-report.md:45; current-report.md:47; current-report.md:84; current-report.md:101. Source: S003:81; S003:166-174; S003:299-303.
- OME05-C03 — partial: Declared paths/order and per-level geometry are covered. Missing declared-array handling and nonuniform/anisotropic selection policies are not complete. Current: current-report.md:35; current-report.md:47-49; current-report.md:85; current-report.md:101. Source: S003:93-94; S003:304-319.
- OME05-C04 — partial: Composition order, offsets and honest unknown units are correct, but no concrete numeric translated point check exposes reversed composition or missing offsets. Current: current-report.md:46-48; current-report.md:86; current-report.md:100-101. Source: S003:169-172; S003:293; S003:308-316.
- OME05-C05 — partial: Path/default metadata and equal count are present. Actual relative source identity, coordinate registration and explicit refusal of unsupported geometry are not resolved; count/dimensions are incorrectly treated as sufficient. Current: current-report.md:36; current-report.md:62-63; current-report.md:87; current-report.md:100-101. Source: S003:432-474.
- OME05-C06 — partial: Integer types, keyed metadata and recommended palette use are covered. Exact 64-bit decoding/lookup, supported range refusal, sparse entry ordering and categorical resampling are not addressed. Current: current-report.md:62-63; current-report.md:87; current-report.md:100-101. Source: S003:438-439; S003:461-471.

## Unresolved matters

- Native Goal, tool reads, read receipts, process independence and execution self-report cannot be verified before a separate explicit phase-2 unlock.
- Actual reader/writer tolerance and interop remain unproved in the fixed corpus.
- Current prose supplies no fixture execution or performance measurement.

## Useful novelty

- Accurate conditional relative-scale fallback distinguished from normal absolute physical sizes.
- Mandatory JSON-comment rejection, precise collection discovery conditions and reader SHOULD/MAY distinction.
- Useful sparse HCS, acquisition, exact metadata-key, filesystem collision and plate/well-version observations.
- Careful classification of informative omero defaults and nested image-label key-presence versus type constraints.

## Blinding limits

- The report embeds native Goal, repeated-source treatment, Q1/Q2 stage, SELF_REPORT, tool and path cues. These are unavoidable visible data; no mapped history/method/economics files were accessed.
- Parent operational updates exposed some workflow labels/runtime caps for ongoing production; no such labels were used as evidence of semantic quality.
- Earlier current reports in the same coherent case were independently graded in this task; source knowledge is reused only after exact hash agreement.

## Structural limits

- Original TASK and external acquisition/protocol logs are not supplied; current claims about them remain unresolved. No required current companion profile was admitted for this report.

All proposed validation remains **UNEXECUTED**. No history, acquisition or mapped economics was accessed. Unreviewed supplied scope: none. Input pins are recorded in the JSON.
