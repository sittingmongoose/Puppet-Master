# R035 frozen CURRENT assessment

Verdict: **quality failure**. Complete coverage: every material current claim and all six assigned facets/34 atomic conditions assessed. All original fixed S003 bytes/lines retained; no expanded-source or native qualification inferred.

The source-backed namespace/HCS/plate-example work is useful. The report incorrectly turns the conditional relative-scale fallback into a universal per-level rule and incorrectly treats equal label-level counts as guaranteed registration. Five required facets remain partial.

## Facets

| Facet | Coverage | Required condition | Condition coverage | Reason |
|---|---|---|---|---|
| OME05-C01 | full | 0.5 uses Zarr v3 | full | The corresponding current format condition/proposal is present. |
| OME05-C01 | full | Metadata belongs under attributes.ome with version | full | The corresponding current format condition/proposal is present. |
| OME05-C01 | full | Hierarchy versions are consistent | full | The corresponding current format condition/proposal is present. |
| OME05-C01 | full | Legacy/version distinction is tied to admission or truthful unsupported status | full | The corresponding current format condition/proposal is present. |
| OME05-C02 | partial | Axis rank/order matches arrays | full | The corresponding current format condition/proposal is present. |
| OME05-C02 | partial | Unique axes and dimension_names matching | full | The corresponding current format condition/proposal is present. |
| OME05-C02 | partial | Arbitrary names cannot dictate conventional positions | full | The corresponding current format condition/proposal is present. |
| OME05-C02 | partial | Optional/absent dimensions remain distinct from length-one dimensions | omitted | A 2D file can lack t/c/third-space is explicit, but absence versus length-one identity is still omitted. |
| OME05-C02 | partial | Do not invent sliders/coordinates for absent or unclassified dimensions | partial | Custom/null policy is required, but absent type and singleton dimensions are not settled. |
| OME05-C02 | partial | Mismatches produce truthful refusal/feedback | full | The corresponding current format condition/proposal is present. |
| OME05-C03 | partial | Dataset paths are group-relative | full | The corresponding current format condition/proposal is present. |
| OME05-C03 | partial | Highest-to-lowest declared order controls selection | full | The corresponding current format condition/proposal is present. |
| OME05-C03 | partial | Array names are arbitrary rather than numeric/lexicographic authority | full | The corresponding current format condition/proposal is present. |
| OME05-C03 | partial | Geometry uses the selected level transformations | partial | Per-level transforms are named, but the universal relative-ratio interpretation corrupts calibrated level geometry. |
| OME05-C03 | partial | Nonuniform/non-power-of-two reductions do not use a fixed formula | full | The corresponding current format condition/proposal is present. |
| OME05-C03 | partial | Missing declared level receives explicit handling | partial | Generic unavailable input handling lacks a declared-but-missing dataset-path rule/test. |
| OME05-C04 | partial | Transformations apply in listed order | full | The corresponding current format condition/proposal is present. |
| OME05-C04 | partial | Scale precedes optional translation | full | The corresponding current format condition/proposal is present. |
| OME05-C04 | partial | Dataset transformations precede multiscales transformations | full | The corresponding current format condition/proposal is present. |
| OME05-C04 | partial | Missing recommended units/unknown calibration do not authorize invented physical coordinates | partial | Unitless fallback exists, but physical scale versus conditional relative scale is misinterpreted. |
| OME05-C04 | partial | Concrete coordinate check exposes reversed composition or omitted offsets | omitted | Neither a two-stage offset composition nor numerical coordinate oracle is proposed. |
| OME05-C04 | partial | Transform vector dimension validation is retained | full | The corresponding current format condition/proposal is present. |
| OME05-C05 | partial | Discover declared labels paths, including permitted intermediate hierarchy | full | The corresponding current format condition/proposal is present. |
| OME05-C05 | partial | Label images implement multiscales and match source level count | full | The corresponding current format condition/proposal is present. |
| OME05-C05 | partial | Relative source references and conventional default are recognized | full | The corresponding current format condition/proposal is present. |
| OME05-C05 | partial | Resolve actual source-image association before overlay rather than plausible sibling/basename/shape | partial | Relative source/default is quoted, but actual association resolution before overlay is absent. |
| OME05-C05 | partial | Level and coordinate relationship is checked, with unsupported geometry explicit | partial | Overlay alignment is asserted guaranteed by count; transforms/source-origin verification is missing. |
| OME05-C05 | partial | Different source origins or intermediate hierarchy cannot silently change association | omitted | No explicit current mechanism or test covers this required condition. |
| OME05-C06 | partial | Label pixels have integer categorical identity | full | The corresponding current format condition/proposal is present. |
| OME05-C06 | partial | Metadata keys use label-value rather than entry position | partial | label-value fields are described without an order-invariant lookup rule/test. |
| OME05-C06 | partial | Sparse IDs remain exact through decoding/lookup | omitted | No explicit current mechanism or test covers this required condition. |
| OME05-C06 | partial | uint64 values above binary64 exact range are preserved or explicitly unsupported | omitted | No explicit current mechanism or test covers this required condition. |
| OME05-C06 | partial | Resampling/interpolation cannot invent new label identities | omitted | No explicit current mechanism or test covers this required condition. |
| OME05-C06 | partial | Specified colors remain a reader SHOULD/recommendation rather than a universal styling mandate | full | The corresponding current format condition/proposal is present. |

## Complete current-claim inventory

| Claim | Location | Assertion | Outcome | Evidence | Reason |
|---|---|---|---|---|---|
| R035-C0001 META | current-report.md:3 | The current report declares V001 | supported | current-report.md:3 | Current declared version, not proof of its version history. |
| R035-C0002 META | current-report.md:4 | The fixed case is ome-normative-dev-v1 | supported | catalog.json:2-4 | Verified against the complete admitted source/product text at these locators. |
| R035-C0003 META | current-report.md:7 | Only S003 is admitted | supported | S003:1-10; catalog.json:4-20; intake-inventory.json | Verified against the complete admitted source/product text at these locators. |
| R035-C0004 META | current-report.md:7 | Header date is 8 September 2026 | supported | S003:1-10; catalog.json:4-20; intake-inventory.json | Verified against the complete admitted source/product text at these locators. |
| R035-C0005 META | current-report.md:7 | Edition URL matches the first-party alias | supported | S003:1-10; catalog.json:4-20; intake-inventory.json | Verified against the complete admitted source/product text at these locators. |
| R035-C0006 META | current-report.md:7 | Source has 36980 bytes and 896 lines | supported | S003:1-10; catalog.json:4-20; intake-inventory.json | Verified against the complete admitted source/product text at these locators. |
| R035-C0007 META | current-report.md:7 | Source SHA matches the sealed catalog | supported | S003:1-10; catalog.json:4-20; intake-inventory.json | Verified against the complete admitted source/product text at these locators. |
| R035-C0008 META | current-report.md:6 | Both questions occurred in one native Goal | unresolved | current-report.md:6 | Native Goal/execution evidence remains inaccessible. |
| R035-C0009 META | current-report.md:7 | The author cache is byte-identical to the admitted source | unresolved | current-report.md:7,14 | Author cache/acquisition carrier is outside the current allowlist; report strings are not execution qualification. |
| R035-C0010 META | current-report.md:8 | Every proposed validation is UNEXECUTED | supported | current-report.md:8,163-177 | Current report status is verified; no execution credit given. |
| R035-C0011 META | current-report.md:8 | The current report presents no empirical validation result | supported | current-report.md:8,163-177 | Current report status is verified; no execution credit given. |
| R035-C0012 META | current-report.md:8 | No test, fileset opening or library exercise occurred | unresolved | current-report.md:8 | Actual native operations are phase-two evidence. |
| R035-C0013 METHOD | current-report.md:14 | cache_source copied S003 and emitted the stated hash/byte count | unresolved | current-report.md:14 | Acquisition self-report, no receipt inspected. |
| R035-C0014 METHOD | current-report.md:15 | Three reads covered lines 1-896 once with matching hashes | unresolved | current-report.md:15-16,184 | Read counts/history are not independently established in the current phase. |
| R035-C0015 METHOD | current-report.md:15 | Q2 reused the context without full expansion or targeted reread | unresolved | current-report.md:15-16,184 | Read counts/history are not independently established in the current phase. |
| R035-C0016 METHOD | current-report.md:17 | RFC2119 rules apply despite lowercase terms | supported | S003:24-27,56-66,867-888 | Verified against the complete admitted source/product text at these locators. |
| R035-C0017 METHOD | current-report.md:17 | Prose is normative except marked non-normative sections/examples/notes | supported | S003:24-27,56-66,867-888 | Verified against the complete admitted source/product text at these locators. |
| R035-C0018 METHOD | current-report.md:17 | The capture says released version 0.5 | supported | S003:24-27,56-66,867-888 | Verified against the complete admitted source/product text at these locators. |
| R035-C0019 METHOD | current-report.md:17 | Later draft changes may be unsupported | supported | S003:24-27,56-66,867-888 | Verified against the complete admitted source/product text at these locators. |
| R035-C0020 METHOD | current-report.md:18 | Fixed scope contains one source/version/capture | supported | catalog.json:4-20; S003:1-10 | Correct evidence boundary, distinct from whether the author actually inspected it. |
| R035-C0021 METHOD | current-report.md:18 | Scoped absence cannot establish ecosystem-wide absence | supported | catalog.json:4-20; S003:1-10 | Correct evidence boundary, distinct from whether the author actually inspected it. |
| R035-C0022 METHOD | current-report.md:18 | No additional page, implementation or real fileset was examined | unresolved | current-report.md:18 | Acquisition history is closed. |
| R035-C0023 METHOD | current-report.md:20 | Finding IDs are shared identically with acquisition JSON | unresolved | current-report.md:20 | Acquisition JSON not admitted for current meaning; no identity inferred from this statement. |
| R035-C0024 F01 | current-report.md:29 | 0.5 storage uses Zarr v3 | supported | S003:67-72,87-100 | Verified against the complete admitted source/product text at these locators. |
| R035-C0025 F01 | current-report.md:29 | The listed Zarr features may be used unless explicitly disallowed | supported | S003:67-72,87-100 | Verified against the complete admitted source/product text at these locators. |
| R035-C0026 F01 | current-report.md:29 | Group attributes reside in zarr.json | supported | S003:67-72,87-100 | Verified against the complete admitted source/product text at these locators. |
| R035-C0027 F01 | current-report.md:29 | Chunks follow array metadata | supported | S003:67-72,87-100 | Verified against the complete admitted source/product text at these locators. |
| R035-C0028 F01 | current-report.md:29 | No separate disallow-list appears, so the whole feature surface is in scope | qualified | S003:67-72,438-439 | There is no standalone disallow-list, but the label integer-only rule is an explicit feature restriction. The conforming-writer/unsupported-reader qualifier prevents treating arbitrary float labels as valid. |
| R035-C0029 F01 | current-report.md:29 | A reader should support chosen conforming features or clearly explain refusal | supported | S003:67-72; Viewer.md:7,11 | App capability/failure policy, not a format-defined error behavior. |
| R035-C0030 F02 | current-report.md:32 | Metadata is under attributes.ome | supported | S003:87-89,149-165,320-326,476-482,563-569 | Verified against the complete admitted source/product text at these locators. |
| R035-C0031 F02 | current-report.md:32 | Metadata version is a string | supported | S003:87-89,149-165,320-326,476-482,563-569 | Verified against the complete admitted source/product text at these locators. |
| R035-C0032 F02 | current-report.md:32 | Versions agree within a hierarchy | supported | S003:87-89,149-165,320-326,476-482,563-569 | Verified against the complete admitted source/product text at these locators. |
| R035-C0033 F02 | current-report.md:32 | Different filesets can declare different versions | supported | S003:87-89,149-165,320-326,476-482,563-569 | Verified against the complete admitted source/product text at these locators. |
| R035-C0034 F02 | current-report.md:32 | multiscales/omero are namespaced, despite the overview shorthand | supported | S003:87-89,149-165,320-326,476-482,563-569 | Verified against the complete admitted source/product text at these locators. |
| R035-C0035 F02 | current-report.md:32 | A reader using only top-level multiscales can miss 0.5 metadata | supported | S003:87-89,149-165,320-326,476-482,563-569 | Verified against the complete admitted source/product text at these locators. |
| R035-C0036 F03 | current-report.md:35 | RFC2119 terms retain force when lowercased | supported | S003:56-66,341,351,370,867-888 | Verified against the complete admitted source/product text at these locators. |
| R035-C0037 F03 | current-report.md:35 | Examples and notes are not normative | supported | S003:56-66,341,351,370,867-888 | Verified against the complete admitted source/product text at these locators. |
| R035-C0038 F03 | current-report.md:35 | JSON comments are disallowed | supported | S003:56-66,341,351,370,867-888 | Verified against the complete admitted source/product text at these locators. |
| R035-C0039 F03 | current-report.md:35 | Commented examples are explanatory | supported | S003:56-66,341,351,370,867-888 | Verified against the complete admitted source/product text at these locators. |
| R035-C0040 F03 | current-report.md:35 | Tree/code blocks are illustrative unless surrounding normative prose governs them | qualified | S003:388-397,877-888 | A labeled interpretive inference; flat capture loses example/note class markers, and descriptive normative assertions need not contain a keyword. |
| R035-C0041 F03 | current-report.md:35 | Selection prose is governing while pseudocode/comment is illustrative | qualified | S003:388-397,877-888 | A labeled interpretive inference; flat capture loses example/note class markers, and descriptive normative assertions need not contain a keyword. |
| R035-C0042 F04 | current-report.md:40 | Images are groups of groups/arrays | supported | S003:78-100,299-303 | Verified against the complete admitted source/product text at these locators. |
| R035-C0043 F04 | current-report.md:40 | Each resolution level is a separate array | supported | S003:78-100,299-303 | Verified against the complete admitted source/product text at these locators. |
| R035-C0044 F04 | current-report.md:40 | Rank is two to five | supported | S003:78-100,299-303 | Verified against the complete admitted source/product text at these locators. |
| R035-C0045 F04 | current-report.md:40 | Axis names are arbitrary | supported | S003:78-100,299-303 | Verified against the complete admitted source/product text at these locators. |
| R035-C0046 F04 | current-report.md:40 | Time precedes channel/custom then space | supported | S003:78-100,299-303 | Verified against the complete admitted source/product text at these locators. |
| R035-C0047 F04 | current-report.md:40 | Array names are arbitrary and metadata defines order | supported | S003:78-100,299-303 | Verified against the complete admitted source/product text at these locators. |
| R035-C0048 F04 | current-report.md:40 | zyx is a spatial SHOULD for the stated anisotropic case | supported | S003:78-100,299-303 | Verified against the complete admitted source/product text at these locators. |
| R035-C0049 F05 | current-report.md:43 | Axis names are required and unique | supported | S003:166-174,825-827 | Verified against the complete admitted source/product text at these locators. |
| R035-C0050 F05 | current-report.md:43 | Axis type is SHOULD-level | supported | S003:166-174,825-827 | Verified against the complete admitted source/product text at these locators. |
| R035-C0051 F05 | current-report.md:43 | Custom type strings are legal | supported | S003:166-174,825-827 | Verified against the complete admitted source/product text at these locators. |
| R035-C0052 F05 | current-report.md:43 | Unit is SHOULD-level | supported | S003:166-174,825-827 | Verified against the complete admitted source/product text at these locators. |
| R035-C0053 F05 | current-report.md:43 | Recommended units are listed space/time strings | supported | S003:166-174,825-827 | Verified against the complete admitted source/product text at these locators. |
| R035-C0054 F05 | current-report.md:43 | Axis count matches array rank | supported | S003:166-174,825-827 | Verified against the complete admitted source/product text at these locators. |
| R035-C0055 F05 | current-report.md:43 | dimension_names is required and matches names | supported | S003:166-174,825-827 | Verified against the complete admitted source/product text at these locators. |
| R035-C0056 F05 | current-report.md:43 | 0.5.2 history clarifies this requirement | supported | S003:166-174,825-827 | Verified against the complete admitted source/product text at these locators. |
| R035-C0057 F05 | current-report.md:43 | The clarification proves the requirement does not apply to earlier versions | qualified | S003:825-827 | A clarification in the 0.5 history does not alone establish the contents of unadmitted prior versions. The 0.5 requirement itself is supported. |
| R035-C0058 F06 | current-report.md:46 | multiscales requires axes | supported | S003:294-309 | Verified against the complete admitted source/product text at these locators. |
| R035-C0059 F06 | current-report.md:46 | Axis count is two through five | supported | S003:294-309 | Verified against the complete admitted source/product text at these locators. |
| R035-C0060 F06 | current-report.md:46 | Two or three spatial axes are required | supported | S003:294-309 | Verified against the complete admitted source/product text at these locators. |
| R035-C0061 F06 | current-report.md:46 | At most one time and one channel/null/custom axis are permitted | supported | S003:294-309 | Verified against the complete admitted source/product text at these locators. |
| R035-C0062 F06 | current-report.md:46 | datasets is required | supported | S003:294-309 | Verified against the complete admitted source/product text at these locators. |
| R035-C0063 F06 | current-report.md:46 | Each dataset has a group-relative path | supported | S003:294-309 | Verified against the complete admitted source/product text at these locators. |
| R035-C0064 F06 | current-report.md:46 | Dataset order is highest-to-lowest | supported | S003:294-309 | Verified against the complete admitted source/product text at these locators. |
| R035-C0065 F06 | current-report.md:46 | Arrays match axes rank/order and are at most five-dimensional | supported | S003:294-309 | Verified against the complete admitted source/product text at these locators. |
| R035-C0066 F06 | current-report.md:46 | Dataset transformations are required and allow only scale/translation | supported | S003:294-309 | Verified against the complete admitted source/product text at these locators. |
| R035-C0067 F06 | current-report.md:47 | Exactly one scale is required | supported | S003:310 | Verified against the complete admitted source/product text at these locators. |
| R035-C0068 F06 | current-report.md:47 | When physical/time scaling is unavailable the scale is a relative-to-first-level ratio | supported | S003:310 | Verified against the complete admitted source/product text at these locators. |
| R035-C0069 F06 | current-report.md:47 | No-downsampling fallback is 1.0 | supported | S003:310 | Verified against the complete admitted source/product text at these locators. |
| R035-C0070 F06 | current-report.md:47 | Scale also encodes time duration | supported | S003:310 | Verified against the complete admitted source/product text at these locators. |
| R035-C0071 F06 | current-report.md:47 | Scale is absolute at level zero and relative ratios at every later level | contradicted | S003:310,339-363 | The ratio rule is conditional on unavailable/inapplicable calibration. Calibrated levels independently supply physical voxel size; the example gives 0.5,1.0,2.0 micrometer scales, not a universal level-zero-plus-ratio interpretation. |
| R035-C0072 F06 | current-report.md:48 | Translation is optional, at most one and follows scale | supported | S003:311 | Verified against the complete admitted source/product text at these locators. |
| R035-C0073 F06 | current-report.md:49 | Scale and translation lengths equal axes count | supported | S003:312 | Verified against the complete admitted source/product text at these locators. |
| R035-C0074 F06 | current-report.md:50 | Optional multiscales transforms follow dataset transforms and share rules | supported | S003:314-316,368-374 | Verified against the complete admitted source/product text at these locators. |
| R035-C0075 F06 | current-report.md:50 | The example has a shared time-unit scale | supported | S003:314-316,368-374 | Verified against the complete admitted source/product text at these locators. |
| R035-C0076 F06 | current-report.md:51 | name, downscaling type and metadata are SHOULD-level | supported | S003:317-319 | Verified against the complete admitted source/product text at these locators. |
| R035-C0077 F06 | current-report.md:52 | The text describes sole-entry use, name choice and first-entry fallback | supported | S003:388-389 | Verified against the complete admitted source/product text at these locators. |
| R035-C0078 F06 | current-report.md:53 | Sibling independent image groups are shown | supported | S003:82-85 | Verified against the complete admitted source/product text at these locators. |
| R035-C0079 F07 | current-report.md:56 | Transformation entries require type | supported | S003:276-293 | Representation support limits are explicit; no binary encoding is invented. |
| R035-C0080 F07 | current-report.md:56 | General types are identity, translation and scale | supported | S003:276-293 | Representation support limits are explicit; no binary encoding is invented. |
| R035-C0081 F07 | current-report.md:56 | Identity is default/typically implicit | supported | S003:276-293 | Representation support limits are explicit; no binary encoding is invented. |
| R035-C0082 F07 | current-report.md:56 | Vectors can be inline floats or binary data at a container path | supported | S003:276-293 | Representation support limits are explicit; no binary encoding is invented. |
| R035-C0083 F07 | current-report.md:56 | Transformations apply sequentially | supported | S003:276-293 | Representation support limits are explicit; no binary encoding is invented. |
| R035-C0084 F07 | current-report.md:56 | Inline-only vector support declines a permitted representation | supported | S003:276-293 | Representation support limits are explicit; no binary encoding is invented. |
| R035-C0085 F08 | current-report.md:61 | omero is optional and transitional | supported | S003:60-64,398-430,828-830 | Verified against the complete admitted source/product text at these locators. |
| R035-C0086 F08 | current-report.md:61 | Transitional reading may be MUST/SHOULD and writing usually MAY | supported | S003:60-64,398-430,828-830 | Verified against the complete admitted source/product text at these locators. |
| R035-C0087 F08 | current-report.md:61 | If omero is present channels is required | supported | S003:60-64,398-430,828-830 | Verified against the complete admitted source/product text at these locators. |
| R035-C0088 F08 | current-report.md:61 | Channel color is six-digit RGB | supported | S003:60-64,398-430,828-830 | Verified against the complete admitted source/product text at these locators. |
| R035-C0089 F08 | current-report.md:61 | Window requires min/max/start/end | supported | S003:60-64,398-430,828-830 | Verified against the complete admitted source/product text at these locators. |
| R035-C0090 F08 | current-report.md:61 | id/name/active/coefficient/family/inverted/label/rdefs occur in the example | supported | S003:60-64,398-430,828-830 | Verified against the complete admitted source/product text at these locators. |
| R035-C0091 F08 | current-report.md:61 | rdefs defaultT/defaultZ/model is not a required field | supported | S003:60-64,398-430,828-830 | Verified against the complete admitted source/product text at these locators. |
| R035-C0092 F08 | current-report.md:61 | The improved description returned in 0.5.1 | supported | S003:60-64,398-430,828-830 | Verified against the complete admitted source/product text at these locators. |
| R035-C0093 F08 | current-report.md:61 | Channels array must match c dimension size | qualified | S003:403,877-888 | The factual correspondence is shown in an example comment, not an independently established unconditional MUST. The report cites the comment without preserving that qualifier. |
| R035-C0094 F09 | current-report.md:66 | labels is nested under the image group | supported | S003:431-514 | Verified against the complete admitted source/product text at these locators. |
| R035-C0095 F09 | current-report.md:66 | Pixels have eight signed/unsigned integer dtypes | supported | S003:431-514 | Verified against the complete admitted source/product text at these locators. |
| R035-C0096 F09 | current-report.md:66 | Intermediate groups are allowed without metadata | supported | S003:431-514 | Verified against the complete admitted source/product text at these locators. |
| R035-C0097 F09 | current-report.md:66 | labels requires a paths array | supported | S003:431-514 | Verified against the complete admitted source/product text at these locators. |
| R035-C0098 F09 | current-report.md:66 | All label images SHOULD be listed | supported | S003:431-514 | Verified against the complete admitted source/product text at these locators. |
| R035-C0099 F09 | current-report.md:66 | Label images implement multiscales | supported | S003:431-514 | Verified against the complete admitted source/product text at these locators. |
| R035-C0100 F09 | current-report.md:66 | Label level count matches original image | supported | S003:431-514 | Verified against the complete admitted source/product text at these locators. |
| R035-C0101 F09 | current-report.md:66 | image-label is SHOULD-level | supported | S003:431-514 | Verified against the complete admitted source/product text at these locators. |
| R035-C0102 F09 | current-report.md:66 | colors/version are SHOULD-level with required types when present | supported | S003:431-514 | Verified against the complete admitted source/product text at these locators. |
| R035-C0103 F09 | current-report.md:66 | Readers SHOULD honor specified label colors | supported | S003:431-514 | Verified against the complete admitted source/product text at these locators. |
| R035-C0104 F09 | current-report.md:66 | Color entries require integer label-value | supported | S003:431-514 | Verified against the complete admitted source/product text at these locators. |
| R035-C0105 F09 | current-report.md:66 | rgba is optional, four 0..255 integers with alpha fourth | supported | S003:431-514 | Verified against the complete admitted source/product text at these locators. |
| R035-C0106 F09 | current-report.md:66 | Property entries require label-value and may carry different arbitrary keys | supported | S003:431-514 | Verified against the complete admitted source/product text at these locators. |
| R035-C0107 F09 | current-report.md:66 | Source is optional and an object | supported | S003:431-514 | Verified against the complete admitted source/product text at these locators. |
| R035-C0108 F09 | current-report.md:66 | Source.image is an optional relative path with ../../ default | supported | S003:431-514 | Verified against the complete admitted source/product text at these locators. |
| R035-C0109 F09 | current-report.md:66 | The example shows half-blue/half-opacity | supported | S003:431-514 | Verified against the complete admitted source/product text at these locators. |
| R035-C0110 F09 | current-report.md:66 | Every label dimension MUST equal image dimension or one | contradicted | S003:104-108,877-888 | This is a should statement in a layout example/comment, not the asserted hard requirement. The report elsewhere classifies diagrams as illustrative. |
| R035-C0111 F09 | current-report.md:66 | Absent image-label/colors has no source-specified palette and fallback is a product choice | supported | S003:456-474; S003:1-896 | Reader SHOULD guidance is conditional on supplied colors. |
| R035-C0112 F10 | current-report.md:71 | HCS has well, row and plate groups above images | supported | S003:118-148,641-739 | Verified against the complete admitted source/product text at these locators. |
| R035-C0113 F10 | current-report.md:71 | Well and plate implement their metadata | supported | S003:118-148,641-739 | Verified against the complete admitted source/product text at these locators. |
| R035-C0114 F10 | current-report.md:71 | Empty well/row groups SHOULD NOT exist | supported | S003:118-148,641-739 | Verified against the complete admitted source/product text at these locators. |
| R035-C0115 F10 | current-report.md:71 | Sparse plates are exemplified by two wells of 96 | supported | S003:118-148,641-739 | Verified against the complete admitted source/product text at these locators. |
| R035-C0116 F10 | current-report.md:72 | Plate columns/rows are required | supported | S003:515-560 | Verified against the complete admitted source/product text at these locators. |
| R035-C0117 F10 | current-report.md:72 | Physical row/column names are listed even when empty | supported | S003:515-560 | Verified against the complete admitted source/product text at these locators. |
| R035-C0118 F10 | current-report.md:72 | Names are alphanumeric, case-sensitive and unique | supported | S003:515-560 | Verified against the complete admitted source/product text at these locators. |
| R035-C0119 F10 | current-report.md:72 | Case-insensitive collision avoidance is SHOULD | supported | S003:515-560 | Verified against the complete admitted source/product text at these locators. |
| R035-C0120 F10 | current-report.md:72 | Plate version is a required string | supported | S003:515-560 | Verified against the complete admitted source/product text at these locators. |
| R035-C0121 F10 | current-report.md:72 | Wells paths are row/column with no extra directories | supported | S003:515-560 | Verified against the complete admitted source/product text at these locators. |
| R035-C0122 F10 | current-report.md:72 | Indices are zero-based and agree with path | supported | S003:515-560 | Verified against the complete admitted source/product text at these locators. |
| R035-C0123 F10 | current-report.md:72 | field_count is SHOULD with positive integer type | supported | S003:515-560 | Verified against the complete admitted source/product text at these locators. |
| R035-C0124 F10 | current-report.md:72 | Plate name is SHOULD | supported | S003:515-560 | Verified against the complete admitted source/product text at these locators. |
| R035-C0125 F10 | current-report.md:72 | acquisitions is optional | supported | S003:515-560 | Verified against the complete admitted source/product text at these locators. |
| R035-C0126 F10 | current-report.md:72 | Acquisition ids are unique nonnegative integers | supported | S003:515-560 | Verified against the complete admitted source/product text at these locators. |
| R035-C0127 F10 | current-report.md:72 | Acquisition name/maxfieldcount is SHOULD | supported | S003:515-560 | Verified against the complete admitted source/product text at these locators. |
| R035-C0128 F10 | current-report.md:72 | Description/start/end is optional with integer timestamps | supported | S003:515-560 | Verified against the complete admitted source/product text at these locators. |
| R035-C0129 F10 | current-report.md:73 | Well images is required and lists FOVs | supported | S003:740-752 | Verified against the complete admitted source/product text at these locators. |
| R035-C0130 F10 | current-report.md:73 | FOV paths are required, alphanumeric, case-sensitive and unique | supported | S003:740-752 | Verified against the complete admitted source/product text at these locators. |
| R035-C0131 F10 | current-report.md:73 | Multiple acquisitions require matching acquisition identifiers | supported | S003:740-752 | Verified against the complete admitted source/product text at these locators. |
| R035-C0132 F10 | current-report.md:73 | Well version is SHOULD with string value | supported | S003:740-752 | Verified against the complete admitted source/product text at these locators. |
| R035-C0133 F11 | current-report.md:78 | bioformats2raw.layout is transitional | supported | S003:175-275 | Collection fallback remains within the described bioformats2raw context. |
| R035-C0134 F11 | current-report.md:78 | It was introduced in 0.4 | supported | S003:175-275 | Collection fallback remains within the described bioformats2raw context. |
| R035-C0135 F11 | current-report.md:78 | Its future replacement is planned | supported | S003:175-275 | Collection fallback remains within the described bioformats2raw context. |
| R035-C0136 F11 | current-report.md:78 | Top-level value three is required | supported | S003:175-275 | Collection fallback remains within the described bioformats2raw context. |
| R035-C0137 F11 | current-report.md:78 | OME-XML file is SHOULD | supported | S003:175-275 | Collection fallback remains within the described bioformats2raw context. |
| R035-C0138 F11 | current-report.md:78 | If present OME-XML uses MetadataOnly not binary/TiffData | supported | S003:175-275 | Collection fallback remains within the described bioformats2raw context. |
| R035-C0139 F11 | current-report.md:78 | Plate takes precedence and supplies locations | supported | S003:175-275 | Collection fallback remains within the described bioformats2raw context. |
| R035-C0140 F11 | current-report.md:78 | Collections and plates cannot mix in this layout | supported | S003:175-275 | Collection fallback remains within the described bioformats2raw context. |
| R035-C0141 F11 | current-report.md:78 | OME.series is optional and a string path list | supported | S003:175-275 | Collection fallback remains within the described bioformats2raw context. |
| R035-C0142 F11 | current-report.md:78 | Series order matches supplied OME-XML | supported | S003:175-275 | Collection fallback remains within the described bioformats2raw context. |
| R035-C0143 F11 | current-report.md:78 | The collection fallback is consecutive zero-based groups | supported | S003:175-275 | Collection fallback remains within the described bioformats2raw context. |
| R035-C0144 F11 | current-report.md:78 | Readers SHOULD surface multiple images | supported | S003:175-275 | Collection fallback remains within the described bioformats2raw context. |
| R035-C0145 F11 | current-report.md:78 | Readers MAY use series, show all/offer choice, and ignore other root nodes | supported | S003:175-275 | Collection fallback remains within the described bioformats2raw context. |
| R035-C0146 F12 | current-report.md:83 | Format hierarchy can be local, HTTP or object storage | supported | S003:73-77; brief.md:5; Viewer.md:9 | brief.md:4 is blank; the actual boundary is at line five. |
| R035-C0147 F12 | current-report.md:83 | Local-only scope is a product boundary | supported | S003:73-77; brief.md:5; Viewer.md:9 | brief.md:4 is blank; the actual boundary is at line five. |
| R035-C0148 F13 | current-report.md:86 | camelCase is naming-style guidance | supported | S003:524,538,557-559,456,809-812 | Exact-key lookup is a sound implication. |
| R035-C0149 F13 | current-report.md:86 | Existing inconsistent spellings are acknowledged | supported | S003:524,538,557-559,456,809-812 | Exact-key lookup is a sound implication. |
| R035-C0150 F13 | current-report.md:86 | rowIndex/columnIndex, field_count, maximumfieldcount and image-label illustrate the mix | supported | S003:524,538,557-559,456,809-812 | Exact-key lookup is a sound implication. |
| R035-C0151 F13 | current-report.md:86 | Parsers need the specified literal keys | supported | S003:524,538,557-559,456,809-812 | Exact-key lookup is a sound implication. |
| R035-C0152 F14 | current-report.md:89 | Plate version is a MUST | supported | S003:550-551,563-640,643-739,877-888 | Useful source-supported counterevidence and a labeled possibility; no actual writer behavior or tolerance result is credited. |
| R035-C0153 F14 | current-report.md:89 | Both plate metadata examples omit version | supported | S003:550-551,563-640,643-739,877-888 | Useful source-supported counterevidence and a labeled possibility; no actual writer behavior or tolerance result is credited. |
| R035-C0154 F14 | current-report.md:89 | Examples do not override normative requirements | supported | S003:550-551,563-640,643-739,877-888 | Useful source-supported counterevidence and a labeled possibility; no actual writer behavior or tolerance result is credited. |
| R035-C0155 F14 | current-report.md:89 | A writer might copy the incomplete example | supported | S003:550-551,563-640,643-739,877-888 | Useful source-supported counterevidence and a labeled possibility; no actual writer behavior or tolerance result is credited. |
| R035-C0156 F14 | current-report.md:89 | Missing-version tolerance needs an explicit product decision | supported | S003:550-551,563-640,643-739,877-888 | Useful source-supported counterevidence and a labeled possibility; no actual writer behavior or tolerance result is credited. |
| R035-C0157 F15 | current-report.md:92 | The capture says release 0.5 | supported | S003:24-27,180-181,825-842 | Verified against the complete admitted source/product text at these locators. |
| R035-C0158 F15 | current-report.md:92 | Migration scripts are promised | supported | S003:24-27,180-181,825-842 | Verified against the complete admitted source/product text at these locators. |
| R035-C0159 F15 | current-report.md:92 | Draft changes may be unsupported | supported | S003:24-27,180-181,825-842 | Verified against the complete admitted source/product text at these locators. |
| R035-C0160 F15 | current-report.md:92 | 0.5.0 records v3 | supported | S003:24-27,180-181,825-842 | Verified against the complete admitted source/product text at these locators. |
| R035-C0161 F15 | current-report.md:92 | 0.5.1 records omero | supported | S003:24-27,180-181,825-842 | Verified against the complete admitted source/product text at these locators. |
| R035-C0162 F15 | current-report.md:92 | 0.5.2 records dimension_names | supported | S003:24-27,180-181,825-842 | Verified against the complete admitted source/product text at these locators. |
| R035-C0163 F15 | current-report.md:92 | Earlier history records bioformats2raw and axes units/transforms | supported | S003:24-27,180-181,825-842 | Verified against the complete admitted source/product text at these locators. |
| R035-C0164 U01 | current-report.md:97 | Implementation section only says See Tools | supported | S003:813-814; catalog.json:4; brief.md:5 | Research requirement is at brief line five rather than the cited line four. |
| R035-C0165 U01 | current-report.md:97 | No actual implementation behavior is evidenced here | supported | S003:813-814; catalog.json:4; brief.md:5 | Research requirement is at brief line five rather than the cited line four. |
| R035-C0166 U01 | current-report.md:97 | Real interop remains unresolved | supported | S003:813-814; catalog.json:4; brief.md:5 | Research requirement is at brief line five rather than the cited line four. |
| R035-C0167 U01 | current-report.md:97 | Tools is an undeveloped external lead | supported | S003:813-814; catalog.json:4; brief.md:5 | Research requirement is at brief line five rather than the cited line four. |
| R035-C0168 U01 | current-report.md:97 | The brief requested actual-reader research | supported | S003:813-814; catalog.json:4; brief.md:5 | Research requirement is at brief line five rather than the cited line four. |
| R035-C0169 U02 | current-report.md:100 | No view-fitting pyramid selection rule was found | supported | S003:306,388-397; S003:1-896 | Complete-source scoped absence; does not establish absence in external ecosystem documents. |
| R035-C0170 U02 | current-report.md:100 | The chunk-size hint is an illustrative comment | supported | S003:306,388-397; S003:1-896 | Complete-source scoped absence; does not establish absence in external ecosystem documents. |
| R035-C0171 U02 | current-report.md:100 | No reader error-handling semantics were found | supported | S003:306,388-397; S003:1-896 | Complete-source scoped absence; does not establish absence in external ecosystem documents. |
| R035-C0172 U02 | current-report.md:100 | No performance/responsiveness requirements were found | supported | S003:306,388-397; S003:1-896 | Complete-source scoped absence; does not establish absence in external ecosystem documents. |
| R035-C0173 U02 | current-report.md:100 | These decisions remain product-owned | supported | S003:306,388-397; S003:1-896 | Complete-source scoped absence; does not establish absence in external ecosystem documents. |
| R035-C0174 U03 | current-report.md:103 | Required plate-version and conditionally required image-label version values are strings | supported | S003:459-460,550-551; S003:1-896 | image-label version presence remains SHOULD; its supplied value must be a string. |
| R035-C0175 U03 | current-report.md:103 | The capture does not enumerate accepted version values | supported | S003:459-460,550-551; S003:1-896 | image-label version presence remains SHOULD; its supplied value must be a string. |
| R035-C0176 U04 | current-report.md:106 | OME-XML, WebGateway, RFC2119, UDUNITS-2 and Tools are external leads beyond fixed S003 | supported | S003:170,257-259,424-425,813-814,896; catalog.json:4 | Source-authority scope is retained. |
| R035-C0177 U04 | current-report.md:106 | No external-document factual content is supplied | supported | S003:170,257-259,424-425,813-814,896; catalog.json:4 | Source-authority scope is retained. |
| R035-C0178 U04 | current-report.md:106 | Those external authorities were not inspected | unresolved | current-report.md:106 | Acquisition history remains locked. |
| R035-C0179 SCOPE | current-report.md:108 | Editing/export/remote services/clinical interpretation are product exclusions | supported | brief.md:5; Viewer.md:9; S003:73-77 | brief.md:4 is a wrong locator. No omitted assigned normative facet is reclassified inapplicable. |
| R035-C0180 SCOPE | current-report.md:108 | Format can still support remote media | supported | brief.md:5; Viewer.md:9; S003:73-77 | brief.md:4 is a wrong locator. No omitted assigned normative facet is reclassified inapplicable. |
| R035-C0181 TRANSITIONAL | current-report.md:110 | omero and bioformats2raw are transitional | qualified | S003:60-64,175-181,398-400 | Removal/change is intended or possible; not proof of a particular future release outcome. |
| R035-C0182 TRANSITIONAL | current-report.md:110 | Hard-wired capability carries future version risk | qualified | S003:60-64,175-181,398-400 | Removal/change is intended or possible; not proof of a particular future release outcome. |
| R035-C0183 P01 | current-report.md:117 | Thin plan needs plain/collection/HCS discovery dispositions | supported | S003:82-85,118-148,204-206,243-275,552-560,641-750; Viewer.md:5 | Product capability breadth can be explicitly limited; the proposed extension does not supply real-tool evidence. |
| R035-C0184 P01 | current-report.md:117 | Collection series/OME-XML ordering matters | supported | S003:82-85,118-148,204-206,243-275,552-560,641-750; Viewer.md:5 | Product capability breadth can be explicitly limited; the proposed extension does not supply real-tool evidence. |
| R035-C0185 P01 | current-report.md:117 | Plate precedence and no-mixing remain | supported | S003:82-85,118-148,204-206,243-275,552-560,641-750; Viewer.md:5 | Product capability breadth can be explicitly limited; the proposed extension does not supply real-tool evidence. |
| R035-C0186 P01 | current-report.md:117 | Multiple images SHOULD be surfaced | supported | S003:82-85,118-148,204-206,243-275,552-560,641-750; Viewer.md:5 | Product capability breadth can be explicitly limited; the proposed extension does not supply real-tool evidence. |
| R035-C0187 P01 | current-report.md:117 | Absent empty rows/wells and sparse plates must be handled | supported | S003:82-85,118-148,204-206,243-275,552-560,641-750; Viewer.md:5 | Product capability breadth can be explicitly limited; the proposed extension does not supply real-tool evidence. |
| R035-C0188 P02 | current-report.md:120 | Navigation controls use metadata rather than fixed positions | supported | S003:168-174,299-303; Viewer.md:5 | Absent dimensions are recognized, but absent-versus-length-one identity is not made explicit. |
| R035-C0189 P02 | current-report.md:120 | Unique names and recommended/custom types matter | supported | S003:168-174,299-303; Viewer.md:5 | Absent dimensions are recognized, but absent-versus-length-one identity is not made explicit. |
| R035-C0190 P02 | current-report.md:120 | Null/custom axes need a policy | supported | S003:168-174,299-303; Viewer.md:5 | Absent dimensions are recognized, but absent-versus-length-one identity is not made explicit. |
| R035-C0191 P02 | current-report.md:120 | Runtime axis order/rank governs controls | supported | S003:168-174,299-303; Viewer.md:5 | Absent dimensions are recognized, but absent-versus-length-one identity is not made explicit. |
| R035-C0192 P02 | current-report.md:120 | A 2D file can lack time/channel/third-space controls | supported | S003:168-174,299-303; Viewer.md:5 | Absent dimensions are recognized, but absent-versus-length-one identity is not made explicit. |
| R035-C0193 P03 | current-report.md:123 | Dataset transforms precede multiscales transforms | supported | S003:170-174,285-289,308-316,368-374 | Correct conditions except the independently graded scale interpretation. |
| R035-C0194 P03 | current-report.md:123 | Dataset has exactly one scale and optional following translation | supported | S003:170-174,285-289,308-316,368-374 | Correct conditions except the independently graded scale interpretation. |
| R035-C0195 P03 | current-report.md:123 | Vector lengths match axes | supported | S003:170-174,285-289,308-316,368-374 | Correct conditions except the independently graded scale interpretation. |
| R035-C0196 P03 | current-report.md:123 | Units are recommended | supported | S003:170-174,285-289,308-316,368-374 | Correct conditions except the independently graded scale interpretation. |
| R035-C0197 P03 | current-report.md:123 | Scales include time duration | supported | S003:170-174,285-289,308-316,368-374 | Correct conditions except the independently graded scale interpretation. |
| R035-C0198 P03 | current-report.md:123 | Binary path representation requires support or explicit refusal | supported | S003:170-174,285-289,308-316,368-374 | Correct conditions except the independently graded scale interpretation. |
| R035-C0199 P03 | current-report.md:123 | Per-level scales are ratios to level zero, defaulting to one on nondownsampled axes | contradicted | S003:310,339-363 | The quoted ratio/default rule applies only when physical/time calibration is unavailable or inapplicable; applying it universally changes calibrated geometry. |
| R035-C0200 P04 | current-report.md:126 | datasets order controls levels | supported | S003:93-94,306,388-397; Viewer.md:5 | Correctly separates multiscales-entry choice from pyramid-level heuristic. |
| R035-C0201 P04 | current-report.md:126 | Array names are arbitrary | supported | S003:93-94,306,388-397; Viewer.md:5 | Correctly separates multiscales-entry choice from pyramid-level heuristic. |
| R035-C0202 P04 | current-report.md:126 | Multiple multiscales need a chosen entry/fallback policy | supported | S003:93-94,306,388-397; Viewer.md:5 | Correctly separates multiscales-entry choice from pyramid-level heuristic. |
| R035-C0203 P04 | current-report.md:126 | View-fitting is product-owned | supported | S003:93-94,306,388-397; Viewer.md:5 | Correctly separates multiscales-entry choice from pyramid-level heuristic. |
| R035-C0204 P05 | current-report.md:128 | Equal scale-level counts guarantee structural overlay alignment | contradicted | S003:433,454-455,472-474 | Count equality does not guarantee common sampling transforms or actual relative source-image association. The source only says dimensions/transforms are usually the same. |
| R035-C0205 P05 | current-report.md:129 | Label levels match the original source count | supported | S003:431-474 | Necessary format facts, but no relative source-resolution mechanism or exact categorical pipeline is proposed. |
| R035-C0206 P05 | current-report.md:129 | Label pixels are integers | supported | S003:431-474 | Necessary format facts, but no relative source-resolution mechanism or exact categorical pipeline is proposed. |
| R035-C0207 P05 | current-report.md:129 | Declared labels list is required but SHOULD-complete | supported | S003:431-474 | Necessary format facts, but no relative source-resolution mechanism or exact categorical pipeline is proposed. |
| R035-C0208 P05 | current-report.md:129 | Readers SHOULD use supplied rgba/alpha | supported | S003:431-474 | Necessary format facts, but no relative source-resolution mechanism or exact categorical pipeline is proposed. |
| R035-C0209 P05 | current-report.md:129 | Source.image has ../../ default | supported | S003:431-474 | Necessary format facts, but no relative source-resolution mechanism or exact categorical pipeline is proposed. |
| R035-C0210 P05 | current-report.md:129 | Missing colors need a product fallback | supported | S003:431-474 | Necessary format facts, but no relative source-resolution mechanism or exact categorical pipeline is proposed. |
| R035-C0211 P05 | current-report.md:129 | Level registration is possible by construction solely from equal counts | contradicted | S003:104-108,433,454-455 | Neither a level-count equality nor the illustrative should comment establishes the asserted geometry/mandatory broadcasting. |
| R035-C0212 P05 | current-report.md:129 | Broadcasting is required from the dimension-or-one overview comment | contradicted | S003:104-108,433,454-455 | Neither a level-count equality nor the illustrative should comment establishes the asserted geometry/mandatory broadcasting. |
| R035-C0213 P06 | current-report.md:132 | omero rendering metadata is optional/transitional | supported | S003:60-64,398-430; Viewer.md:5 | No empirical rendering or format-mandated fallback is asserted. |
| R035-C0214 P06 | current-report.md:132 | Required channel color/window fields are conditional | supported | S003:60-64,398-430; Viewer.md:5 | No empirical rendering or format-mandated fallback is asserted. |
| R035-C0215 P06 | current-report.md:132 | rdefs are example fields | supported | S003:60-64,398-430; Viewer.md:5 | No empirical rendering or format-mandated fallback is asserted. |
| R035-C0216 P06 | current-report.md:132 | Absent omero needs a chosen fallback | supported | S003:60-64,398-430; Viewer.md:5 | No empirical rendering or format-mandated fallback is asserted. |
| R035-C0217 P06 | current-report.md:132 | Grayscale/data-driven window is a product option | supported | S003:60-64,398-430; Viewer.md:5 | No empirical rendering or format-mandated fallback is asserted. |
| R035-C0218 P06 | current-report.md:132 | The only render metadata in the format is omero | qualified | S003:456-466 | This is true only if read as channel-specific context; literal whole-format wording overlooks image-label colors/rgba. |
| R035-C0219 P07 | current-report.md:135 | Local-only support is a product limit | supported | S003:73-77; Viewer.md:9 | Correct transfer boundary. |
| R035-C0220 P07 | current-report.md:135 | HTTP/S3/GCS storage is permitted by the format | supported | S003:73-77; Viewer.md:9 | Correct transfer boundary. |
| R035-C0221 P08 | current-report.md:138 | Using an existing v3 library is an engineering option | supported | S003:67-72,813-814; current-report.md:137-138 | Good retained implementation uncertainty; no outside library fact credited. |
| R035-C0222 P08 | current-report.md:138 | This corpus proves no available/mature library or 0.5 coverage | supported | S003:67-72,813-814; current-report.md:137-138 | Good retained implementation uncertainty; no outside library fact credited. |
| R035-C0223 P08 | current-report.md:138 | Library availability is an explicit assumption needing validation | supported | S003:67-72,813-814; current-report.md:137-138 | Good retained implementation uncertainty; no outside library fact credited. |
| R035-C0224 P09 | current-report.md:141 | The plan targets released 0.5 | supported | S003:24-27,149-174,825-842; Viewer.md:9,11 | Foreseeable compatibility risk, not an observed reader failure. |
| R035-C0225 P09 | current-report.md:141 | 0.5 v3/namespace/dimension_names need version discipline | supported | S003:24-27,149-174,825-842; Viewer.md:9,11 | Foreseeable compatibility risk, not an observed reader failure. |
| R035-C0226 P09 | current-report.md:141 | Older filesets need explicit support/refusal policy | supported | S003:24-27,149-174,825-842; Viewer.md:9,11 | Foreseeable compatibility risk, not an observed reader failure. |
| R035-C0227 P09 | current-report.md:141 | Migration scripts are noted but not admitted | supported | S003:24-27,149-174,825-842; Viewer.md:9,11 | Foreseeable compatibility risk, not an observed reader failure. |
| R035-C0228 P09 | current-report.md:141 | Unsupported-version feedback fits the product failure requirement | supported | S003:24-27,149-174,825-842; Viewer.md:9,11 | Foreseeable compatibility risk, not an observed reader failure. |
| R035-C0229 P10 | current-report.md:144 | Format has no reader failure semantics | supported | S003:128-129,206,272,426,467; S003:1-896; Viewer.md:7,11 | Correct distinction; this does not repair the label alignment or scale interpretation. |
| R035-C0230 P10 | current-report.md:144 | Optional metadata absence is not automatically malformed | supported | S003:128-129,206,272,426,467; S003:1-896; Viewer.md:7,11 | Correct distinction; this does not repair the label alignment or scale interpretation. |
| R035-C0231 P10 | current-report.md:144 | Empty rows/wells can be absent | supported | S003:128-129,206,272,426,467; S003:1-896; Viewer.md:7,11 | Correct distinction; this does not repair the label alignment or scale interpretation. |
| R035-C0232 P10 | current-report.md:144 | Layout mixing violates the collection rule | supported | S003:128-129,206,272,426,467; S003:1-896; Viewer.md:7,11 | Correct distinction; this does not repair the label alignment or scale interpretation. |
| R035-C0233 P10 | current-report.md:144 | Multiple-image reduction should not silently hide images | supported | S003:128-129,206,272,426,467; S003:1-896; Viewer.md:7,11 | Correct distinction; this does not repair the label alignment or scale interpretation. |
| R035-C0234 P10 | current-report.md:144 | Reader capability refusal differs from malformed input | supported | S003:128-129,206,272,426,467; S003:1-896; Viewer.md:7,11 | Correct distinction; this does not repair the label alignment or scale interpretation. |
| R035-C0235 P11 | current-report.md:147 | Acceptance should cover series choice | supported | S003:169,272,285-289,301,388-389,426,550-551,641-739; Viewer.md:11 | Reasonable unexecuted additions, with missing original facet-specific oracles recorded separately. |
| R035-C0236 P11 | current-report.md:147 | Sparse HCS browsing | supported | S003:169,272,285-289,301,388-389,426,550-551,641-739; Viewer.md:11 | Reasonable unexecuted additions, with missing original facet-specific oracles recorded separately. |
| R035-C0237 P11 | current-report.md:147 | Custom/null axes | supported | S003:169,272,285-289,301,388-389,426,550-551,641-739; Viewer.md:11 | Reasonable unexecuted additions, with missing original facet-specific oracles recorded separately. |
| R035-C0238 P11 | current-report.md:147 | Missing-omero fallback | supported | S003:169,272,285-289,301,388-389,426,550-551,641-739; Viewer.md:11 | Reasonable unexecuted additions, with missing original facet-specific oracles recorded separately. |
| R035-C0239 P11 | current-report.md:147 | Earlier-version behavior | supported | S003:169,272,285-289,301,388-389,426,550-551,641-739; Viewer.md:11 | Reasonable unexecuted additions, with missing original facet-specific oracles recorded separately. |
| R035-C0240 P11 | current-report.md:147 | Path-vector behavior | supported | S003:169,272,285-289,301,388-389,426,550-551,641-739; Viewer.md:11 | Reasonable unexecuted additions, with missing original facet-specific oracles recorded separately. |
| R035-C0241 P11 | current-report.md:147 | Missing-plate-version tolerance | supported | S003:169,272,285-289,301,388-389,426,550-551,641-739; Viewer.md:11 | Reasonable unexecuted additions, with missing original facet-specific oracles recorded separately. |
| R035-C0242 P12 | current-report.md:150 | Chunk semantics can enable partial/deferred loading | qualified | S003:70-72,91-100; S003:1-896; Viewer.md:7 | Feasibility depends on chosen codec/grid/storage behavior; no performance guarantee or implementation proof. |
| R035-C0243 P12 | current-report.md:150 | Async/cancellation is a product commitment rather than format duty | qualified | S003:70-72,91-100; S003:1-896; Viewer.md:7 | Feasibility depends on chosen codec/grid/storage behavior; no performance guarantee or implementation proof. |
| R035-C0244 OPTION | current-report.md:154 | Existing v3 I/O library behind a reversible interface | supported | S003:67-72,813-814 | Library existence/completeness is explicitly unverified. |
| R035-C0245 OPTION | current-report.md:155 | UDUNITS-style conversion with graceful missing/unknown-unit display | supported | S003:170-172 | Conversion dependency/semantics are external; strings are recommendations. |
| R035-C0246 OPTION | current-report.md:156 | View-fitting scale heuristic | supported | S003:306,388-397 | A product option, not a normative selection rule. |
| R035-C0247 OPTION | current-report.md:157 | Chunk-aligned viewport pipeline and cancellation | supported | S003:91-100; Viewer.md:7 | An unexecuted engineering option, not promised performance. |
| R035-C0248 OPTION | current-report.md:158 | Metadata validation for names, rank, vector lengths, dimension_names, version, order and label dtype | supported | S003:156,168,173-174,306,312,438 | Cheap metadata policy; tolerance is explicit, not changed source validity. |
| R035-C0249 OPTION | current-report.md:159 | Sparse HCS plate map/acquisition bookkeeping | supported | S003:515-808; Viewer.md:5 | Useful product option. |
| R035-C0250 OPTION | current-report.md:160 | Grayscale/window and neutral label-color fallbacks | supported | S003:398-474 | Product-owned optional metadata fallbacks. |
| R035-C0251 OPTION | current-report.md:161 | Named unsupported limits for path vectors, older versions and missing codecs | supported | S003:67-72,285-289; Viewer.md:7 | Explicit refusal limits; no unknown source fact invented. |
| R035-C0252 VALIDATION | current-report.md:167 | Minimal 2D fixture with coordinates index times scale | qualified | S003:299-312 | Valid only for zero-translation/no extra group transform fixture; it does not test composition offsets. |
| R035-C0253 VALIDATION | current-report.md:168 | 5D fixture with group time scaling and chosen default behavior | qualified | S003:320-387 | No numerical composition/offset oracle is provided. |
| R035-C0254 VALIDATION | current-report.md:169 | Bioformats collection with series/OME-XML and multiple-image choice | supported | S003:182-275 | Valid proposal; external OME-XML schema details are not established here. |
| R035-C0255 VALIDATION | current-report.md:170 | Sparse multi-acquisition HCS browsing | supported | S003:641-785 | Valid proposed metadata/UX check. |
| R035-C0256 VALIDATION | current-report.md:171 | Integer labels, equal levels, dimension-one sample, rgba colors and missing-image-label fallback | qualified | S003:104-108,433-514 | Valid proposed fixture, but level equality alone cannot establish registration and exact IDs/resampling are untested. |
| R035-C0257 VALIDATION | current-report.md:172 | Missing-omero fallback | supported | S003:426; Viewer.md:5 | Valid proposal. |
| R035-C0258 VALIDATION | current-report.md:173 | Missing zarr.json/version/vector-size/float-label/order/duplicate-name negative fixtures | supported | S003:87-100,156,168,306,312,438; Viewer.md:11 | Valid proposed invalid inputs; no executed result. |
| R035-C0259 VALIDATION | current-report.md:174 | Large-load navigation/cancellation soak | supported | Viewer.md:7,11 | No measured latency/result or threshold. |
| R035-C0260 VALIDATION | current-report.md:175 | 0.4 fixture with declared unsupported response | supported | Viewer.md:9,11; S003:825-842 | Tests chosen support boundary; older source content not admitted. |
| R035-C0261 VALIDATION | current-report.md:176 | Binary path vector support/refusal | supported | S003:285-289 | Encoding remains unknown; proposed future fixture needs its own valid bytes. |
| R035-C0262 VALIDATION | current-report.md:177 | Chosen-language v3 library probe | supported | S003:813-814; current-report.md:138 | A future empirical check, not evidence of a library today. |
| R035-C0263 VALIDATION | current-report.md:165 | Every listed test remains a proposal rather than an executed result | supported | current-report.md:163-177 | No empirical validation credit. |
| R035-C0264 COVERAGE | current-report.md:181 | Fixed source identity/date/count is retained | supported | catalog.json:4-20; S003:1-10 | Original fixed six-facet source remains complete and distinct from expanded OME. |
| R035-C0265 COVERAGE | current-report.md:181 | External referenced documents stay outside the case | supported | catalog.json:4-20; S003:1-10 | Original fixed six-facet source remains complete and distinct from expanded OME. |
| R035-C0266 COVERAGE | current-report.md:182 | Real-reader claims are not empirical implementation evidence | supported | S003:175-275,813-814 | The limitation is retained. |
| R035-C0267 COVERAGE | current-report.md:183 | Negative statements are scoped to this captured edition | supported | current-report.md:18,99-108,183 | Scope qualifier is present; it does not make an incorrect inference supported. |
| R035-C0268 COVERAGE | current-report.md:184 | Read-once reuse, zero rereads and accounting are actual | unresolved | current-report.md:184 | No acquisition/protocol log opened. |
| R035-C0269 BINDING | current-report.md:188 | Final/acquisition/protocol artifacts are selected and immutable as described | unresolved | current-report.md:188 | Only this exact delivered report is admitted as current; other author artifacts are not opened or promoted. |

## Counterevidence, citations and qualification

- S003:310,339-363: Physical scales apply at each calibrated level; relative ratios are a conditional fallback, not a universal post-level-zero encoding.
- S003:433,454-455,472-474: Equal level count does not guarantee registration or actual source-image association.
- S003:104-108,877-888: Dimension-or-one should in a layout example is not an unconditional MUST/broadcasting mandate.
- S003:438-439: All-features wording needs the integer-label restriction.
- S003:456-466: A literal only-render-metadata-is-omero assertion overlooks image-label rendering.
- Report [83, 97, 108]: brief.md:4 is blank; local/excluded scope and actual-reader research are at brief.md:5.
- Report [47, 123]: S003:310 is accurately quoted but its conditional fallback is interpreted universally.
- Report [66, 129]: S003:106-108 is an illustrative should comment, not the asserted MUST.

All explicit source citations are individually recorded in JSON. Supported novelty and every omission are retained there. All tests remain UNEXECUTED proposals, and actual cache/read/Goal identity remains UNKNOWN. History, acquisition, costs and native raw receipts remain locked. No comparative/preservation/recipe judgment is made.
