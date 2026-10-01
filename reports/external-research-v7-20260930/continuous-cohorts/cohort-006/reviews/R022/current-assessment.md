# R022 current assessment

Frozen: 2026-10-01T21:18:41.849111+00:00

Verdict: **quality failure**. Complete assessment coverage: every supplied material assertion and all six facets. Candidate facet coverage: one full and five partial.

Report SHA-256: `4ae4228ad305422f6cb011f8b64a261be19dfcbf29083f997cc958339a332aa5`
Source SHA-256: `5d8b240877ed2cf9596566187bcb3779ea011d5319807134c65e2e7dc2ae82de`

## Material failures

- R022-F01: Lowercase wording does not turn an illustrative dimension comment into a normative obligation.
- R022-F02: The conditional zyx recommendation and mapping-failure interpretation need qualification.
- R022-F03: The source defines conformance validity even though reader capabilities and recovery policy are product choices.
- R022-F04: Transitional metadata does not establish a Zarr-v2 history or requirement to read older pixel storage.
- R022-F05: A broad zero-tool/library-evidence claim misses named tools and method/version information.
- R022-F06: A multiscales-entry chunk-size comment is misapplied to dataset pyramid-level selection.
- R022-F07: Overlay validation lacks actual source association and complete geometry/refusal policy.
- R022-O01: Identity and optional axes drive controls, and mismatches are negative tests. Absent versus singleton control behavior and complete unsupported-role handling are not specified.
- R022-O02: Declared paths/order and level-specific transforms are present. Missing declared-array policy and nonuniform/anisotropic consequences remain incomplete; chunk hint is misrouted from entry to level choice.
- R022-O03: Correct ordered scale/offset/group composition and unknown units are covered. Hand-composition is proposed without a concrete numeric offset example and expected result.
- R022-O04: The report checks counts/shapes and proposes physical-region validation. It does not resolve the actual relative source image identity before associating the pair, nor state explicit unsupported-geometry refusal.
- R022-O05: Integer whitelist, keyed palette/properties and recommended styling are covered. Exact uint64/int64 decoding/lookup, sparse unordered entry handling, supported-range refusal and categorical resampling are omitted.

## Complete claim inventory

### A01 — supported

Case/date/version/fixed source hash, size, line count, aliases and read-only local synthetic brief/plan scope.

Current: current-report.md:3-6; current-report.md:11-15.
Evidence: S003:1-27; catalog.json:3-39; brief.md:3-5; Viewer.md:3-11.
The input identities are pinned and match; V001 is the visible current label, not proof of no earlier native versions.

### A02 — unresolved

Cache before model exposure, one six-chunk source pass, zero rereads, Q1 before Q2, native Goal and permitted-tool compliance, self-reported logs and no prior versions.

Current: current-report.md:16-20; current-report.md:186-187; current-report.md:199-201; current-report.md:203.
Evidence: Actual native process evidence remains locked.
Native cache/read/Goal/protocol/acquisition operations and earlier-version inventory are not supplied. Current process claims cannot be verified from final text; no receipt or cost inference is credited.

### A03 — supported

RFC keywords, lowercase use, normative-text exceptions, epistemic labels, capture-scoped negatives and UNEXECUTED proposals.

Current: current-report.md:23-25; current-report.md:33.
Evidence: S003:57-59; S003:869-888.
The framework is broadly correct; individual applications and exhaustive negative claims are reviewed separately.

### F02a — supported

Zarr v3, allowed features unless disallowed, adoption date, possible valid codec/transformer data beyond reader support.

Current: current-report.md:35.
Evidence: S003:68-72; S003:831-833.
The explicit exception is retained and no unsupported native codec coverage is claimed. A limited reader needs a disclosed capability boundary.

### F02b — qualified

The source disallows almost nothing and does not enumerate real producer features.

Current: current-report.md:35.
Evidence: S003:70-72; S003:300-312; S003:438-439; S003:375-382.
No explicit codec/transformer ban is identified, but meaningful axis, transform and label-type restrictions do exist. A real feature-emission landscape remains unverified; one downscaling method/version is described.

### F03 — supported

attributes.ome and string hierarchy-consistent version; inconsistent metadata is invalid and can be detected.

Current: current-report.md:37.
Evidence: S003:149-165.
The source defines conformance; validation/feedback implementation remains a product responsibility.

### F04 — supported

Real JSON must omit comments; identified commented examples cannot be copied unchanged.

Current: current-report.md:39.
Evidence: S003:65-66; S003:320-387; S003:401-423.
The explicit commented examples contain a copying trap. This does not make every uncommented example malformed.

### F05 — supported

Local/HTTP/object-store storage neutrality; local-only product is a disclosed subset.

Current: current-report.md:41.
Evidence: S003:73-77; brief.md:5.
The storage scope matches the brief; remote support is not required for this product.

### F06 — supported

Image groups, separate level arrays, arbitrary names, axes/rank/type ordering, chunk specification; numbered collection exception is conditional.

Current: current-report.md:45.
Evidence: S003:79-100; S003:268-270; S003:304-306.
Folder or conventional axis names are not a reliable semantic source. omero optionality is correctly restored in F18.

### F07a — supported

Nested labels and intermediates; mandatory integer whitelist and no metadata in intermediate groups.

Current: current-report.md:47.
Evidence: S003:102-117; S003:432-440.
These normative constraints are correctly identified; floating labels and metadata-bearing intermediates are genuine invalid-input cases.

### F07b — qualified

The illustrative label-dimension should statement is normative solely because lowercase RFC terms retain force.

Current: current-report.md:47; current-report.md:77.
Evidence: S003:106-108; S003:877-883.
Lowercase force does not override the exception for examples/layout commentary. At most this is useful weak correspondence guidance, not a universal mandatory grid relationship.

### F08 — supported

HCS requires well/row/plate hierarchy and corresponding specifications, with empty groups SHOULD NOT, only when the dataset is HCS.

Current: current-report.md:49.
Evidence: S003:118-129.
The scope condition is explicit, avoiding a universal HCS requirement.

### F09a — supported

Axis names required and unique; types/units recommended, custom strings allowed, rank identity mandatory.

Current: current-report.md:53.
Evidence: S003:166-173.
The core name/rank and recommendation distinctions are correct.

### F09b — qualified

Names, types and units are only SHOULD-level except name presence/uniqueness.

Current: current-report.md:53.
Evidence: S003:168-170.
The exception correctly identifies mandatory name presence/uniqueness, but saying names are only SHOULD is confusing and should be limited to type/unit recommendations. No fixed-name mandate is inferred.

### F10 — supported

dimension_names is required on each level array and matches group axes; historical clarification and locus difference.

Current: current-report.md:55.
Evidence: S003:173-174; S003:825-827.
The important array-versus-group locus is accurately explained.

### F11a — supported

Multiscales has rank 2–5, two or three spaces, optional one time and one channel/custom slot, and metadata/array type ordering.

Current: current-report.md:57.
Evidence: S003:295-302.
The rank/order/optional slot interpretation is grounded and scoped within each dictionary.

### F11b — qualified

All three-space stacks SHOULD use zyx; axis-order violations make mapping ill-posed.

Current: current-report.md:57.
Evidence: S003:302-303.
The source specifies yx image-plane and other anisotropic z-axis conditions. Incorrect array/metadata ordering violates conformance, though a known nonstandard order can be mathematically mapped if truthfully declared; invalidity is not universal mathematical impossibility.

### F12 — supported

Required dataset list, group-relative arbitrary paths, declared highest-resolution order, same rank/order matching axes within dictionary.

Current: current-report.md:59.
Evidence: S003:304-307.
This validates metadata authority without imposing fixed ratios or names. It does not eliminate a need to check actual arrays/geometry.

### F13 — supported

One dataset scale with physical size normally, conditional relative-factor/default fallback, optional translation after scale and matching vector lengths.

Current: current-report.md:61.
Evidence: S003:308-313.
The unavailable/inapplicable absolute-scaling condition and no-downsampling fallback are accurately retained.

### F14 — supported

Optional group transforms follow dataset transforms under the same rules; ordered composition and worked time factor.

Current: current-report.md:63.
Evidence: S003:293; S003:314-316; S003:330-374.
The composition order is correct. Identity is a general/no-op default; explicit identity is not an allowed dataset multiscales transform.

### F15 — supported

Inline or container binary path vectors are allowed; inline-only without detection cannot support all such data.

Current: current-report.md:65.
Evidence: S003:284-289; S003:308-313.
A correct capability inference, with unsupported data explicitly disclosed rather than silently miscalibrated.

### F16 — qualified

Multiple entry choice by name/first fallback and chunk-size comment; exact conformance force is unresolved.

Current: current-report.md:67.
Evidence: S003:388-397; S003:877-883.
The passage supplies descriptive entry-selection guidance and code, not a universal required chooser. The chunk-size comment chooses a multiscales entry rather than a dataset pyramid level; later implications must preserve that distinction.

### F17 — supported

name/type/downscaling metadata SHOULD be present and are not mandatory keys.

Current: current-report.md:69.
Evidence: S003:317-319.
Recommended descriptive fields are correctly separated from required geometry.

### F18a — supported

Optional transitional omero with conditional channels/RGB/window fields; example-only rdefs and full external semantics unverified.

Current: current-report.md:71.
Evidence: S003:60-64; S003:398-430.
Conditional key/field obligations are accurate; arbitrary initial rendering behavior is not imposed as a source MUST.

### F18b — qualified

All channel colors/windows/defaults exist only when omero is present.

Current: current-report.md:71.
Evidence: S003:401-430.
As metadata location this is reasonable, but rdefs/defaults are illustrative and not guaranteed by mere omero presence; a viewer can also choose its own absent-metadata display defaults.

### F19 — supported

Required label paths with all-label completeness SHOULD; label multiscales must have source-equal level count, not necessarily identical shapes.

Current: current-report.md:73.
Evidence: S003:441-455.
The count-versus-shape distinction is explicit. It still does not resolve actual source identity or registration.

### F20a — supported

image-label and colors/version presence SHOULD; conditional array/string/ID/RGBA types and reader color preference SHOULD.

Current: current-report.md:75.
Evidence: S003:456-466.
The nested presence/type distinction and palette recommendation are correctly retained.

### F20b — supported

Optional properties/source, keyed IDs, arbitrary nonuniform metadata, relative source reference/default and unenumerated version strings.

Current: current-report.md:75.
Evidence: S003:467-474.
These are correct metadata facts. Describing source as an optional extra does not supply a validated association before rendering.

### F22a — supported

Required complete physical row/column lists, unique case-sensitive names, recommended filesystem caution, plate version and consistent well path/indexes.

Current: current-report.md:79.
Evidence: S003:530-560.
The path/index and empty-grid-versus-populated-well distinctions are accurate.

### F22b — supported

Acquisition optional; IDs unique nonnegative, recommended name/maximumfieldcount and conditional string/integer types; field_count/name recommended.

Current: current-report.md:79.
Evidence: S003:518-541.
The recommendation/presence/types and source field_count phrasing are preserved.

### F22c — supported

Dense two-acquisition plate and sparse 12×8 grid with two wells are source examples.

Current: current-report.md:79.
Evidence: S003:561-739.
Examples establish possible fixtures, not an obligation to present a particular grid UI.

### F23 — supported

Required well fields/path uniqueness; acquisition reference only with multiple plate acquisitions; version SHOULD with conditional string.

Current: current-report.md:81.
Evidence: S003:740-808.
Conditional acquisition and plate/well version strengths are correct.

### F24 — supported

Transitional real-world collection layout 3, optional series string paths with XML-order condition, plate locations and numeric fallback without both series and plate.

Current: current-report.md:83.
Evidence: S003:175-181; S003:255-270.
Both key discovery conditions are retained; no cross-version pixel-storage inference follows from transitional metadata alone.

### F25 — supported

Plate takes precedence and collection/plate mixing is disallowed.

Current: current-report.md:85.
Evidence: S003:204-206.
Top-level conditionality and exclusivity are supported.

### F26 — supported

If XML is provided it must follow OME-XML/MetadataOnly, with minimum spec allowed.

Current: current-report.md:87.
Evidence: S003:257-260.
The content rules are conditional on supplied XML; presence is separately recommended in F24.

### F27 — supported

Reader SHOULD disclose multiple images and not silently first-open; MAY use series, all/choice display or ignore roots.

Current: current-report.md:89.
Evidence: S003:271-275.
The report retains source SHOULD/MAY strength.

### F28 — supported

Exact legacy key spellings and potential future naming updates should be version-pinned.

Current: current-report.md:91.
Evidence: S003:524-525; S003:557-559; S003:809-812.
Exact spellings are current facts; watching future changes is a proposed engineering measure, not proof a particular rename has happened.

### F29 — supported

Released version, migration promise, draft uncertainty, hierarchy and plate/well version differences, v3 and separator history.

Current: current-report.md:93.
Evidence: S003:25-27; S003:156; S003:550-551; S003:751-752; S003:825-851.
The cited historical statements and modal differences are present.

### M01 — supported

Per-level arrays/declared ordering permit multiresolution navigation; level choice is reader policy.

Current: current-report.md:97.
Evidence: S003:91-94; S003:304-319.
A valid mechanism inference without a fixed reduction ratio claim.

### M02 — supported

Sequential scale/translation composition, conditional relative default and optional dataset-then-group mapping.

Current: current-report.md:98.
Evidence: S003:282-293; S003:308-316.
The previously stated relative fallback condition applies; no universal physical-unit guarantee is asserted here.

### M03 — supported

Metadata-driven plate/collection/image/label discovery and arbitrary axis/array names.

Current: current-report.md:99.
Evidence: S003:81; S003:93-94; S003:204-275; S003:441-455.
A useful discovery outline, scoped to the recognized layouts.

### M04 — supported

Chunks enable partial loading, while detailed addressing/codec costs remain external.

Current: current-report.md:100.
Evidence: S003:70-72; S003:91-100.
This is an engineering feasibility argument rather than measured performance.

### F30a — supported

No specified invalid-input runtime error/recovery/warning protocol in the fixed source; defaults/precedence/entry choice are listed.

Current: current-report.md:104.
Evidence: S003:1-896; S003:204-206; S003:282-283; S003:310; S003:388-397.
Full-source review supports this specific absence. Product feedback and native operation are not format guarantees.

### F30b — qualified

There is no format-sanctioned way to distinguish invalid from valid but unsupported; viewer defines the boundary itself.

Current: current-report.md:104.
Evidence: S003:70-72; S003:156; S003:174; S003:308-312; S003:438-439.
The format defines invalidity through mandatory constraints and permits features beyond a reader capability profile. The viewer defines support breadth, not conformance validity itself. Runtime error policy is indeed open.

### Conditions — supported

Transitional/read-write, unit/type/custom, optional translations/groups, conditional acquisition/XML, recommended labels, and empty-grid conditions remain attached.

Current: current-report.md:106.
Evidence: S003:60-64; S003:169-172; S003:267; S003:301; S003:311-316; S003:442; S003:456-474; S003:530-560; S003:748-750.
This useful consolidated condition list is substantially accurate; it does not establish full facet coverage.

### C01 — qualified

Transitional 0.4-era/v2-style data is counterevidence to v3-only viewing and may occur in the wild.

Current: current-report.md:110.
Evidence: S003:60-69; S003:175-181; S003:831-848.
Earlier-layout metadata can be part of current v3/0.5 data. The source does not establish v2 for all 0.4 data or require older pixel-storage support. Older compatibility may be a product choice, but the counterargument overextends metadata continuity.

### C02 — supported

Examples can include prohibited real-data comments, creating fixture-copy pitfalls.

Current: current-report.md:111.
Evidence: S003:65-66; S003:341; S003:351; S003:361; S003:370; S003:401-423.
The specific identified commented examples support the warning.

### F31-U01 — qualified

No reader/library implementation evidence or evidence of which libraries exist is in the corpus.

Current: current-report.md:112; current-report.md:137; current-report.md:141; current-report.md:188; current-report.md:192.
Evidence: S003:175-183; S003:375-382; S003:424-425; S003:813-814.
Actual reader tolerance and complete library support matrices are unverified. The source nonetheless names Bio-Formats/bioformats2raw and skimage with method/version information. A zero-evidence claim about all tools/libraries is too broad.

### F32-U02 — supported

Zarr mechanics and exact read granularity are not captured; formal references list only RFC2119, with a separator-history note.

Current: current-report.md:113; current-report.md:188; current-report.md:194.
Evidence: S003:68-72; S003:99-100; S003:849-851; S003:893-896.
The formal reference list and detailed-mechanics limit are correct; an external reference does not verify all dependency semantics.

### U03 — supported

Full OMERO window/rdefs semantics require unadmitted WebGateway documentation.

Current: current-report.md:114; current-report.md:188; current-report.md:193.
Evidence: S003:424-430.
The source defines RGB and basic window field meanings, but no complete display/initialization algorithm or start/end range relationship.

### U04 — supported

Unit lists and recommended validity do not settle a universal acceptance requirement for every UDUNITS spelling.

Current: current-report.md:115.
Evidence: S003:170-172.
No unit conversion/grammar implementation is admitted; unit handling needs an explicit profile.

### U05 — supported

image-label version strings are not enumerated.

Current: current-report.md:116; current-report.md:196.
Evidence: S003:459-460.
A required type if supplied is not an enumeration of accepted schema values.

### U06 — qualified

Multiple-entry pseudocode conformance force remains open.

Current: current-report.md:117.
Evidence: S003:388-397; S003:877-883.
The descriptive can-choice example is not a MUST chooser. The current cautious uncertainty is acceptable if not turned into required pyramid-level guidance.

### F34-U07 — supported

Channel-count matching appears only in an example comment, not as an explicit MUST.

Current: current-report.md:118.
Evidence: S003:403; S003:426-430.
This accurately avoids turning illustrative cardinality into a mandatory format rule.

### U08 — supported

Live currency/source origin cannot be confirmed beyond catalog alias and capture hash.

Current: current-report.md:119.
Evidence: catalog.json:4-39; S003:1-27.
The report properly avoids live-site or broad provenance claims.

### U09 — supported

Tools page and promised migration scripts are not admitted.

Current: current-report.md:120; current-report.md:196.
Evidence: S003:25-26; S003:813-814; catalog.json:4.
They are leads for a future authorized corpus, not evidence of ecosystem-wide absence.

### P00 — supported

Thin plan scope and current behavior promises are summarized accurately.

Current: current-report.md:126.
Evidence: Viewer.md:3-11; brief.md:3-5.
The scope is a synthetic local read-only viewer with no claimed implementation.

### P01 — supported

Add plain/collection/HCS discovery or explicit unsupported plates, preserve plate precedence and older-scope choice.

Current: current-report.md:130.
Evidence: Viewer.md:5-11; S003:204-275; S003:744-750.
The alternatives respect reader recommendations and the brief failure-explanation boundary; no universal HCS UI is mandated.

### P02 — supported

Tie controls to optional axis presence; optional omero and example defaults need defined fallback.

Current: current-report.md:131.
Evidence: S003:169-174; S003:301-302; S003:401-430.
Absent dimensions are explicitly considered; singleton-axis behavior is not separately specified.

### P03 — supported

Compose dataset then group scale/offsets, disclose unknown units, and implement or detect/refuse binary vectors.

Current: current-report.md:132.
Evidence: S003:170; S003:284-293; S003:308-316.
The implication is sound and avoids silently accepting an unsupported vector form. A concrete numeric offset check remains absent.

### P04a — supported

Declared level order/arbitrary names and selection heuristic are separate from multiple named entry choice.

Current: current-report.md:133.
Evidence: S003:93-94; S003:304-319; S003:388-397.
Level heuristics are product choices; entry names do not replace the dataset list.

### P04b — contradicted

The multiscales chunk-size code comment is a hint for pyramid-level selection.

Current: current-report.md:133; current-report.md:142.
Evidence: S003:388-397.
The code returns a multiscales list entry (for example multiscales[0]), not one of that entry’s datasets. It cannot be cited as a level-selection heuristic.

### P05 — qualified

Validate overlay shape/count rather than assume same shapes; check integer dtype and recommended colors, define fallback.

Current: current-report.md:134.
Evidence: S003:432-474.
Read-time validation and the weaker shape condition are improvements. Actual relative source association and coordinate transforms must also be resolved; properties/source cannot be treated as merely cosmetic extras for associated overlays.

### P06 — supported

Keep background/cancellation as engineering; external chunk/codec details prevent read-cost guarantees; disclose supported features.

Current: current-report.md:135.
Evidence: Viewer.md:7-11; S003:70-72; S003:91-100.
No measured responsiveness or native supported codec set is claimed.

### P07 — supported

Build mandatory-rule-to-message mapping for version, JSON, dimensions/order, transforms, label paths/count, plate/well consistency and exact keys.

Current: current-report.md:136.
Evidence: Viewer.md:7-11; S003:65-66; S003:156; S003:174; S003:300-312; S003:438-455; S003:552-560; S003:748-750.
These mandatory surfaces can support the product feedback promise; no source runtime protocol is invented.

### P08 — qualified

Local read-only scope fits, target version and transitional stance need pinning, real-tool interop remains untested.

Current: current-report.md:137.
Evidence: brief.md:5; S003:60-77; S003:175-181; S003:25-27; S003:813-814.
The product boundary and untested status are sound. Tool-information absence and inferred v2 legacy storage are separately qualified above.

### A1 — supported

Existing library versus minimal custom reader is an option requiring future verified support matrices.

Current: current-report.md:141.
Evidence: S003:68-72; S003:813-814.
No specific library is recommended as proven capable; blanket no-library evidence is separately qualified.

### A2 — qualified

Screen/chunk/full-image level heuristics need tuning and dimensional transfer tests.

Current: current-report.md:142.
Evidence: S003:304-319; S003:388-397.
These are legitimate product alternatives, but the cited chunk-size comment concerns entry selection rather than a pyramid level.

### A3 — supported

Generic path-vector composition versus inline-only with detection/refusal; binary format details need further evidence.

Current: current-report.md:143.
Evidence: S003:284-289; S003:308-316.
An explicit capability limit is preferable to silently miscalibrated output; no native operation is proved.

### A4 — supported

HCS full navigator versus detect-and-explain are product scope alternatives, sparse plates valid.

Current: current-report.md:144.
Evidence: S003:118-129; S003:641-750; brief.md:3-5.
The format constraints do not themselves mandate broad GUI scope.

### A5 — supported

Strict validation versus disclosed best effort is a product choice; source supplies no invalid-input recovery algorithm.

Current: current-report.md:145.
Evidence: S003:156; S003:204-206; S003:310; S003:1-896.
The source validity rules remain authoritative; the accepted capability/recovery policy is product work.

### X01 — supported

Reject hardcoded axis/level names, with numeric collection fallback only in no-series/no-plate branch.

Current: current-report.md:149.
Evidence: S003:81; S003:93-94; S003:268-270.
The rejection and exact exception are supported.

### X02 — supported

Reject guaranteed omero metadata and define absent-metadata behavior.

Current: current-report.md:150.
Evidence: S003:426.
A valid false-assumption rejection; product defaults remain optional implementation policy.

### X03 — supported

Reject silent inline-only parsing of legal binary-vector forms.

Current: current-report.md:151.
Evidence: S003:284-289.
Detect-and-explain is a truthful capability boundary without claiming full conformance support.

### X04 — supported

Reject silently opening only first collection image as contrary to reader SHOULD NOT.

Current: current-report.md:152.
Evidence: S003:272.
The report retains recommendation strength.

### X05-F33 — qualified

Reject copying specification examples verbatim because they embed comments.

Current: current-report.md:153.
Evidence: S003:65-66; S003:320-387; S003:443-453.
The rule applies to identified commented examples, not every example. Stripping explanatory comments before validating JSON is necessary for those examples; uncommented examples are not invalid for that reason.

### I01 — supported

Add metadata discovery state machine.

Current: current-report.md:157.
Evidence: S003:204-275; S003:441-455; S003:744-750.
A useful explicitly proposed source-to-plan improvement, not a measured product result or an added universal GUI mandate.

### I02 — supported

Add transform pipeline and binary-vector capability decision.

Current: current-report.md:158.
Evidence: S003:284-293; S003:308-316.
A useful explicitly proposed source-to-plan improvement, not a measured product result or an added universal GUI mandate.

### I03 — supported

Add absent-omero display defaults and later external semantics.

Current: current-report.md:159.
Evidence: S003:424-430.
A useful explicitly proposed source-to-plan improvement, not a measured product result or an added universal GUI mandate.

### I04 — supported

Add missing/custom unit presentation policy.

Current: current-report.md:160.
Evidence: S003:169-172.
A useful explicitly proposed source-to-plan improvement, not a measured product result or an added universal GUI mandate.

### I05 — supported

Add dimension_names and hierarchy version checks.

Current: current-report.md:161.
Evidence: S003:156; S003:174.
A useful explicitly proposed source-to-plan improvement, not a measured product result or an added universal GUI mandate.

### I06 — supported

Pin exact key spellings and watch future updates.

Current: current-report.md:162.
Evidence: S003:524-525; S003:557-559; S003:809-812.
A useful explicitly proposed source-to-plan improvement, not a measured product result or an added universal GUI mandate.

### I07 — supported

Add label count/dtype/colors/fallback validation.

Current: current-report.md:163.
Evidence: S003:438-474.
A useful explicitly proposed source-to-plan improvement, not a measured product result or an added universal GUI mandate.

### I08 — supported

Add mandatory-rule negative fixtures.

Current: current-report.md:164.
Evidence: S003:65-66; S003:156; S003:302; S003:312; S003:530-560.
A useful explicitly proposed source-to-plan improvement, not a measured product result or an added universal GUI mandate.

### I09 — supported

Declare transitional/older-version support and messaging scope.

Current: current-report.md:165.
Evidence: S003:25-27; S003:60-69; S003:175-181.
A useful explicitly proposed source-to-plan improvement, not a measured product result or an added universal GUI mandate.

### Summary — qualified

The plan omits discovery, transform/path, defaults/units, keys and version/dimension checks; all follow as conditions/obligations.

Current: current-report.md:169.
Evidence: Viewer.md:5-11; S003:60-77; S003:149-174; S003:204-319; S003:426-474.
The identified thin-plan gaps are real. Not every proposed fallback, UI or legacy feature is a format obligation, and this topical summary does not meet all assigned facets.

### T-status — supported

All tests are proposed and UNEXECUTED; no filesets or performance execution evidence is admitted.

Current: current-report.md:25; current-report.md:171-173; current-report.md:202.
Evidence: current-report.md:171-179; catalog.json:4-39.
The report makes no passing test claim. Actual native process operations remain unresolved.

### T-P01 — supported

Proposed valid fixture: 2D/3D/5D multiscales.

Current: current-report.md:175.
Evidence: S003:295-302.
A source-compatible UNEXECUTED proposal; no fixture creation or successful decode is credited.

### T-P02 — supported

Proposed valid fixture: optional omero.

Current: current-report.md:175.
Evidence: S003:426-430.
A source-compatible UNEXECUTED proposal; no fixture creation or successful decode is credited.

### T-P03 — supported

Proposed valid fixture: optional labels.

Current: current-report.md:175.
Evidence: S003:432-455.
A source-compatible UNEXECUTED proposal; no fixture creation or successful decode is credited.

### T-P04 — supported

Proposed valid fixture: time/channel/custom slots.

Current: current-report.md:175.
Evidence: S003:301-302.
A source-compatible UNEXECUTED proposal; no fixture creation or successful decode is credited.

### T-P05 — supported

Proposed valid fixture: dense/sparse plate and wells.

Current: current-report.md:175.
Evidence: S003:561-808.
A source-compatible UNEXECUTED proposal; no fixture creation or successful decode is credited.

### T-P06 — supported

Proposed valid fixture: series/numeric collection branches.

Current: current-report.md:175.
Evidence: S003:265-270.
A source-compatible UNEXECUTED proposal; no fixture creation or successful decode is credited.

### T-P07 — supported

Proposed valid fixture: binary path scale.

Current: current-report.md:175.
Evidence: S003:284-289.
A source-compatible UNEXECUTED proposal; no fixture creation or successful decode is credited.

### T-P08 — supported

Proposed valid fixture: missing units/custom types.

Current: current-report.md:175.
Evidence: S003:169-172.
A source-compatible UNEXECUTED proposal; no fixture creation or successful decode is credited.

### T-N01 — supported

Proposed invalid fixture: mixed versions.

Current: current-report.md:175.
Evidence: S003:156; Viewer.md:11.
The condition is genuinely mandatory; explanatory failure is product acceptance behavior. The test is UNEXECUTED.

### T-N02 — supported

Proposed invalid fixture: JSON comments.

Current: current-report.md:175.
Evidence: S003:65-66; Viewer.md:11.
The condition is genuinely mandatory; explanatory failure is product acceptance behavior. The test is UNEXECUTED.

### T-N03 — supported

Proposed invalid fixture: missing/mismatched dimension_names.

Current: current-report.md:175.
Evidence: S003:174; Viewer.md:11.
The condition is genuinely mandatory; explanatory failure is product acceptance behavior. The test is UNEXECUTED.

### T-N04 — supported

Proposed invalid fixture: axis-order violations.

Current: current-report.md:175.
Evidence: S003:302; Viewer.md:11.
The condition is genuinely mandatory; explanatory failure is product acceptance behavior. The test is UNEXECUTED.

### T-N05 — supported

Proposed invalid fixture: dataset order/rank mismatch.

Current: current-report.md:175.
Evidence: S003:304-307; Viewer.md:11.
The condition is genuinely mandatory; explanatory failure is product acceptance behavior. The test is UNEXECUTED.

### T-N06 — supported

Proposed invalid fixture: scale-vector length mismatch.

Current: current-report.md:175.
Evidence: S003:312; Viewer.md:11.
The condition is genuinely mandatory; explanatory failure is product acceptance behavior. The test is UNEXECUTED.

### T-N07 — supported

Proposed invalid fixture: noninteger labels.

Current: current-report.md:175.
Evidence: S003:438-439; Viewer.md:11.
The condition is genuinely mandatory; explanatory failure is product acceptance behavior. The test is UNEXECUTED.

### T-N08 — supported

Proposed invalid fixture: metadata-bearing label intermediates.

Current: current-report.md:175.
Evidence: S003:440; Viewer.md:11.
The condition is genuinely mandatory; explanatory failure is product acceptance behavior. The test is UNEXECUTED.

### T-N09 — supported

Proposed invalid fixture: duplicate row names.

Current: current-report.md:175.
Evidence: S003:544-547; Viewer.md:11.
The condition is genuinely mandatory; explanatory failure is product acceptance behavior. The test is UNEXECUTED.

### T-N10 — supported

Proposed invalid fixture: well path/index mismatch.

Current: current-report.md:175.
Evidence: S003:552-560; Viewer.md:11.
The condition is genuinely mandatory; explanatory failure is product acceptance behavior. The test is UNEXECUTED.

### T-N11 — supported

Proposed invalid fixture: missing acquisition with multiple acquisitions.

Current: current-report.md:175.
Evidence: S003:748-750; Viewer.md:11.
The condition is genuinely mandatory; explanatory failure is product acceptance behavior. The test is UNEXECUTED.

### T-expected — supported

Expected discovery, hand-computed coordinates, per-level overlays and explanatory failures for the synthetic matrix.

Current: current-report.md:175.
Evidence: Viewer.md:5-11; S003:304-316; S003:432-455.
Reasonable expectations for deliberately aligned fixtures, not a proof every equal-count pair is registered.

### T-calibration — supported

Hand-compose dataset/group fixture and compare displayed coordinates.

Current: current-report.md:176.
Evidence: S003:293; S003:308-316.
A useful UNEXECUTED proposal. It gives no numeric point/scales/offsets or expected result, so the facet’s concrete check remains omitted.

### T-registration — supported

Check each image/label pair maps to the same physical region.

Current: current-report.md:177.
Evidence: S003:432-433; S003:454-455.
This credits coordinate-level validation rather than count alone. It still does not resolve actual source identity before forming the pair.

### T-performance — supported

Latency-budget and stale-work cancellation probe on a large synthetic pyramid.

Current: current-report.md:178.
Evidence: Viewer.md:7-11; S003:91-100.
A meaningful product proposal, without measured latency or a source-defined budget.

### T-interop — supported

Real 0.5 tool-output interop checks are blocked by fixed source scope and no admitted samples.

Current: current-report.md:179.
Evidence: catalog.json:4-39; Viewer.md:9-11.
No current native interop success is asserted; a future explicitly admitted sample corpus is required.

### Limits — qualified

Single-source limits, external dependencies/leads, no execution and capture-scoped negatives.

Current: current-report.md:185-189; current-report.md:191-196.
Evidence: catalog.json:4-39; S003:25-27; S003:68-72; S003:170-181; S003:257-260; S003:424-425; S003:813-896.
Detailed external/runtime limits are appropriate. Broad tool/library evidence absence needs the named-tool counterevidence qualification; actual one-pass reads are unresolved process claims.

## Facets

- OME05-C01 — full: Version/namespace, consistency validation, explicit unsupported support breadth and declared older scope are covered; inferred v2 history is separately unverified. Current: current-report.md:35; current-report.md:37; current-report.md:93; current-report.md:130; current-report.md:136-137; current-report.md:145; current-report.md:161; current-report.md:165; current-report.md:175. Source: S003:68-69; S003:149-156.
- OME05-C02 — partial: Identity and optional axes drive controls, and mismatches are negative tests. Absent versus singleton control behavior and complete unsupported-role handling are not specified. Current: current-report.md:45; current-report.md:53-57; current-report.md:131; current-report.md:175. Source: S003:81; S003:166-174; S003:299-303.
- OME05-C03 — partial: Declared paths/order and level-specific transforms are present. Missing declared-array policy and nonuniform/anisotropic consequences remain incomplete; chunk hint is misrouted from entry to level choice. Current: current-report.md:45; current-report.md:59; current-report.md:97; current-report.md:133; current-report.md:142; current-report.md:175. Source: S003:93-94; S003:304-319.
- OME05-C04 — partial: Correct ordered scale/offset/group composition and unknown units are covered. Hand-composition is proposed without a concrete numeric offset example and expected result. Current: current-report.md:61-65; current-report.md:98; current-report.md:132; current-report.md:158; current-report.md:176. Source: S003:170; S003:293; S003:308-316.
- OME05-C05 — partial: The report checks counts/shapes and proposes physical-region validation. It does not resolve the actual relative source image identity before associating the pair, nor state explicit unsupported-geometry refusal. Current: current-report.md:73-77; current-report.md:134; current-report.md:163; current-report.md:177. Source: S003:432-474.
- OME05-C06 — partial: Integer whitelist, keyed palette/properties and recommended styling are covered. Exact uint64/int64 decoding/lookup, sparse unordered entry handling, supported-range refusal and categorical resampling are omitted. Current: current-report.md:47; current-report.md:75; current-report.md:134; current-report.md:163; current-report.md:175. Source: S003:438-439; S003:461-471.

## Useful novelty

- Precise relative-scale fallback, conditional collection/XML discovery and nested image-label type/presence distinctions.
- Correct identification that channel-count matching is example-only rather than an explicit MUST.
- Explicit HCS detect-and-explain alternative, capability disclosure and unsupported binary-vector feedback.
- Per-level physical-region overlay test, scoped runtime-error absence and meaningful blocked real-tool interop proposals.
- Detailed sparse HCS, acquisition, exact-key and plate/well-version observations.

## Unresolved matters

- Native Goal/cache/read/tool operations, no-prior-version assertions, independence and resource use remain unproved.
- Actual reader tolerance and interop, detailed external specifications and live/post-capture currency remain outside admitted evidence.

## Structural limits

- Original TASK and acquisition/protocol/cache receipts remain unavailable/locked. Process statements are unresolved, not established from metadata.
- F31–F34 are referenced through unresolved/counterevidence passages rather than given separate complete F31–F34 headings; all actual current assertions and decisions were nevertheless assessed.

## Blinding limits

- The exact report exposes read-once/cache, native Goal, tool, V001/SELF_REPORT and path cues. No external histories or receipt bodies were accessed.
- Parent operational updates included some production workflow labels/runtime caps; they were not semantic evidence and no mapped treatment comparison was made.
- Full source knowledge is reused within this coherent cohort only after exact source pin agreement.

All proposed validation remains **UNEXECUTED**. Unreviewed supplied current scope: none. Input pins are recorded in the JSON. Acquisition/history remains locked.
