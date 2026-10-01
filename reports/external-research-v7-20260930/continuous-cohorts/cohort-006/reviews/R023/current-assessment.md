# R023 — frozen current assessment

Verdict: **quality failure**. Complete review: **true**. Report SHA-256: `101b8f3f879bde95537ac12cf219353a950cad05f45b9ffb95b50ba1a047ab94`.

The carrier is complete and the full review is frozen. The report supplies useful source-grounded breadth beyond the key, but material normative overclaims and unresolved full-facet requirements prevent a full-quality pass. All six assigned facets are assessed as partial; this is not a sampled or incomplete review. Unknown candidate operations, missing external implementation research under fixed S003 scope, and unexecuted proposals are not treated as false execution or operational failure.

All six assigned facets and every material assertion family were assessed against the complete 896-line S003 capture. Review completeness does not imply full candidate coverage. Candidate history, operational exposure, preservation, native delivery and cost remain locked.

## Facet roster

| Facet | Coverage | Reason / missing scope |
|---|---|---|
| OME05-C01 | partial | Zarrv3,attributes.ome and hierarchy consistency are correct. Older-layout compatibility is explicitly unresolved, but admission checks only compare versions within a hierarchy. Missing: An explicit policy validating declared0.5 versus legacy/unsupported layouts, or a truthful unsupported-admission result for legacy data. |
| OME05-C02 | partial | Rank/order/name/dimension_names validation and optional presence are covered; fixed five-axis interpretation is avoided. Mandatory rendering of custom types is overstated. Missing: Explicit navigation/slicing distinction between absent axes and present length-one axes.; Complete mandatory2-or3-spatial-axis/at-most-one-time-and-channel-or-null-custom slot conditions, with supported-capability fallback for unidentifiable roles. |
| OME05-C03 | partial | Arbitrary names,declared resolution order and per-level geometry covered. Generic lexical fixture leaves important path/missing/geometry consequences unspecified. Missing: Resolve datasets paths relative to owning image group.; Handle unavailable declared levels explicitly.; Avoid a fixed reduction assumption by treating anisotropic/non-power-of-two level geometry individually. |
| OME05-C04 | partial | Correct transform order,offset rules,vector rank and unit optionality; a known-fixture composition proposal exists. Missing units/relative fallback are not clearly distinguished from physically dimensionless/calibrated coordinates. Missing: Explicit unknown physical calibration and relative/index-coordinate display when physical scale or units unavailable, rather than an unqualified unitless fallback.; A fully specified expected-result coordinate check that exposes reversed composition and missing offsets; generic known-fixture instruction provides only partial validation detail. |
| OME05-C05 | partial | Declared label paths,intermediate groups,equal scale count,optional source reference and own transforms mentioned. Relative source association is not made an actual overlay admission step. Missing: Resolve explicit/default source.image from label image location and validate intended source identity before overlay, especially intermediate groups or multiple candidate sources.; Declare unsupported registration/geometry explicitly instead of treating generic mismatch as the only outcome. |
| OME05-C06 | partial | Integer dtypes and label-value keyed colors are correct; specified color recommendation remains SHOULD. No exact decode/lookup/resampling design for wide/sparse IDs. Missing: Preserve exact signed/unsigned64-bit label identities,including IDs beyond binary64 exact integer range,or state/refuse unsupported range.; Use integer label-value for property lookup as well as color lookup and avoid metadata-position indexing.; Categorical resampling/selection must not interpolate new IDs; fixture tests are absent. |

## Material failures

- **R023-F01** (unsupported product mandate): Mandatory display/non-rejection of every unfamiliar or custom axis type conflates a valid format feature with reader capability. Truthful unsupported handling is permitted by brief. Report L70,L147; evidence E10, E18, P02.

- **R023-F02** (normative recommendation inflated): Plan disposition changes SHOULD make aware of multiple images into SHOULD surface all images; source only MAY show all or offer choice. Report L145; evidence E16.

- **R023-F03** (contradicted normative status): Usually is incorrectly treated as automatically informative; descriptive source prose remains normative unless explicitly excepted. The qualifier limits equality of dimensions/transforms rather than removing all normative status. Report L99,L105; evidence E26, E38.

- **R023-F04** (material coverage omission): All six facets are only partial: explicit version admission,absent versus singleton axis handling,group-relative/missing levels,unknown physical calibration,source identity registration and exact categorical IDs/resampling remain insufficient. Report Facet roster; L145-178; evidence E09, E12, E19, E21, E27, E29, E30.

## Complete material-claim inventory

| ID | Report locator | Current assertion | Outcome | Evidence and reason |
|---|---|---|---|---|
| R023-C001 | L3-8 | Report states scope S003, version/date/URI and the source pin (896 lines,36980 bytes,5d8b2408…). | supported | E01, I01: The sealed intake independently matches these identity assertions; report date/version identify its own carrier. |
| R023-C002 | L6-8,L27,L31,L167,L171,L203 | Candidate claims whole source read once, no live GET, failed reads saw no bytes, task-card rule compliance, no tests executed and full combined assignment delivered. | unresolved | I01: These are unavoidable operational/self-coverage claims. Whole source is available and proposals explicitly unexecuted, but actual candidate operations/TASK or protocol artifacts are locked. No failure inferred. |
| R023-C003 | L8,L104-105 | RFC2119 and descriptive statements govern; explicit examples/notes/non-normative sections excepted. | supported | E02, E38: Correct source convention; use of lowercase keywords is also allowed. Tree/JSON examples cannot establish new universal requirements. |
| R023-C004 | L12-27 | Coverage map says discovery,axes,navigation,labels,coordinates,error feedback and obligation triage researched; responsiveness partial and implementations visibly unmet. | qualified | B01, P01, P02, E36: Relevant sections exist, but research presence is not full coverage/correctness: all six facets retain gaps below. Implementation/performance limits are truthfully visible. |
| R023-C005 | L35-37,L122 | OME-Zarr0.5 uses Zarrv3 and zarr.json metadata. | supported | E04, E09: Source directly establishes container version and metadata carrier. |
| R023-C006 | L36 | All Zarr features may be used unless specifically disallowed, including codecs/grids/key encodings/data types/storage transformers. | supported | E05: Condition retained verbatim; no narrower fixed feature subset guaranteed. |
| R023-C007 | L38,L146 | A fixed raw-chunk/grid assumption limits compatibility; codec/shard breadth is universally a compatibility requirement. | qualified | E04, E05, P02: Broad feature permission supports warning that limited readers miss valid datasets. It does not require every reader to implement every codec/shard feature; explicit supported limits and truthful refusal are valid choices. §7 defer pending U1 limits the mandate. |
| R023-C008 | L39,L159 | Zarrv3 details and codec/chunk obligations cannot be finalized from this captured chapter. | supported | E04, E05: The complete S003 capture only references Zarrv3 and permits features; no detailed codec/shard/core-field specification is admitted. |
| R023-C009 | L41-42,L122,L145 | Metadata is under attributes.ome in hierarchy zarr.json, version string hierarchy-consistent; discover multiscales there and flag inconsistent versions. | supported | E09, P02: Correct format identity and appropriate malformed-input disposition; does not supply a complete version-specific legacy admission policy. |
| R023-C010 | L44-45,L123 | Image arrays are2-5D; ordered time(if any),channel/custom(if any),space; anisotropic zyx is SHOULD. | supported | E18: Mandatory order/rank and conditional axes preserved. The complete2/3-spatial-axis and null/custom slot limits are not fully stated. |
| R023-C011 | L45,L147 | Axis presence decides whether time/plane selection applies; derive roles from axes.type when provided. | qualified | E10, E18, P01: Sound when type metadata identifies role. type is SHOULD and may be missing/custom, so a supported-capability decision is needed; report later acknowledges conditional types. No fixed shape/name assumption asserted. |
| R023-C012 | L47-48,L125,L150 | Declared datasets order determines pyramid identity; array names arbitrary and highest-resolution first. | supported | E07, E19: No numeric/lexicographic path authority; list position supplies index. Group-relative path handling and missing declared levels are not carried into concrete behavior. |
| R023-C013 | L48,L174 | Lexicographic sorting can place10 before2; failure threshold is at least10 levels, fixture0…10. | qualified | E07, E19: Sorting example valid. 0…10 is11 levels; 10 levels0…9 has no10. This threshold imprecision is minor and does not invalidate declared-list policy. |
| R023-C014 | L48,L136,L139 | Choosing an appropriate level or named multiscale first is product policy; pseudocode first fallback is informative. | supported | E23, P01: Spec gives named-multiscale example, not a mandated viewport selection algorithm. |
| R023-C015 | L50-53,L145 | Three discovery families (plain images,b2raw,HCS) should be addressed under broad fileset discovery. | qualified | E07, E08, E13, B01, P01, P02: These real source layouts matter for plan scope. Plan does not explicitly mandate all possible capabilities; a capability limit requires review and truthful disclosure rather than silently claiming universal breadth. |
| R023-C016 | L53 | Plain illustrated groups contain multiscales arrays and optional omero/labels. | supported | E07, E25: Correct layout example, not an exhaustive directory scan specification. |
| R023-C017 | L55-56,L126 | b2raw.layout required value3 at top OME metadata. | qualified | E14: Matches normative prose, but quotation of3 is ambiguous about JSON type; admitted JSON examples use numeric3. Do not infer a definite string-only requirement from this phrasing. |
| R023-C018 | L57,L126,L152 | For b2raw plate metadata takes precedence, images follow plate locations and cannot mix collection with plate. | supported | E14, E15: Plate plus b2raw metadata is expressly valid. Only violating the precedence/locations or mixing semantic collection forms is invalid; co-presence alone is not an error. |
| R023-C019 | L57,L126 | OME group MAY have series string-path list; order matches XML Image if XML exists. | supported | E15: Conditions preserved in main finding; summary must inherit optional series condition. |
| R023-C020 | L57,L126 | With neither series nor plate, use consecutive image groups starting0; one OME-XMLImage each in order. | supported | E15: Conditional discovery rule accurately stated. |
| R023-C021 | L58,L132,L153 | XML SHOULD exist, obey OME-XML and use MetadataOnly instead of binary/TiffData. | supported | E15: Required contents conditional on supplied XML; no need to demand optional XML file for every plain image. |
| R023-C022 | L59,L132-133 | Readers SHOULD make users aware of multiple images; MAY use series,show all/choice,ignore extraneous groups. | supported | E16: Correct original reader recommendation and MAYs. |
| R023-C023 | L59,L62,L145 | Thin plan omits named multi-series/HCS/layout rules; shallow depth≤1 discovery would miss plate fields. | supported | E08, E13, P01, P02: Text omission is established; hypothetical shallow algorithm is clearly a failure example, not an observed reader bug. |
| R023-C024 | L61,L127 | HCS has well,row,plate ancestors; well/plate specs mandatory and all fields in well share well identity. | supported | E08: Direct hierarchy requirements, conditional on HCS scope. |
| R023-C025 | L61,L127 | Plate columns/rows/version/wells and well images mandatory; paths row/column with consistent0-based indices. | supported | E33, E35: Correct distinction between plate well paths and field paths in context. |
| R023-C026 | L61 | Row/column names are alphanumeric,case-sensitive,unique; physical empty rows/columns declared; empty groups SHOULD NOT exist. | supported | E08, E33: Sparse grid correctly distinguished from populated groups. Case-insensitive collision recommendation is omitted but no contradictory assertion. |
| R023-C027 | L61,L173 | Sparse96-well grid may have just2 wells; fields have unique alphanumeric paths and acquisition references with multiple acquisitions. | supported | E34, E35: Example and conditional field metadata match source; acquisition IDs must also match plate definitions (not fully repeated in report). |
| R023-C028 | L64-65,L124,L152 | Axis rank and dimension_names integrity checked at open; mismatch malformed,0.5.2 clarified mandatory field. | supported | E12, E37, P02: Correct rule; describing cost as cheap is an unmeasured engineering estimate, not executed performance evidence. |
| R023-C029 | L69-70,L123 | Axis names mandatory unique; type recommended conventional or custom string; unit recommended UDUNITS-2. | supported | E10, E11: Source conditions stated accurately; arbitrary names defeat conventional t/c/z naming assumptions. |
| R023-C030 | L70,L147 | Viewer must not reject unfamiliar/custom axis type and must treat unknown types as displayable. | unsupported | E10, E18, P02: Validity of custom types does not guarantee implemented display capability. Brief explicitly permits explanatory inability to display; bounded support/truthful refusal is valid. No mandatory custom-type renderer is established. |
| R023-C031 | L70,L132,L139,L149 | Missing units are allowed; formatting is policy; show raw declared unit or define unitless display. | qualified | E11, E21, P01: Missing unit does not prove dimensionless or physically calibrated coordinates. A fallback must identify unknown physical calibration and relative/index coordinates, not invent unitless physical meaning. |
| R023-C032 | L72-73 | General transforms sequentially ordered; identity default; scale/translation support inline vector or binary path. | supported | E17: Correct general transform description. The multiscales subset restrictions are separately stated, avoiding general identity in dataset chain. |
| R023-C033 | L74,L125 | Each dataset requires transforms containing only scale/translation and exactly one scale. | supported | E20: Correct restricted multiscales requirement. |
| R023-C034 | L74,L163 | Scale is physical pixel size/time duration; if unavailable(not applicable), use relative-to-first-level factor and1 for no downsampling. | qualified | E20, E21: Report preserves unavailable condition but main condition omits not-applicable. Both regimes depend on metadata availability/applicability, not interchangeable physical calibrations. U5 tolerance needs explicit unknown-calibration state. |
| R023-C035 | L75-76,L125 | Optional exactly-one translation follows scale; vector lengths equal axes count. | supported | E20: Scale then offset and rank conditions accurate. |
| R023-C036 | L77-78,L149,L175 | Optional multiscales transform obeys same rules and follows per-level transforms. | supported | E22: Correct composition order including example shared time scale. No executed coordinate result asserted. |
| R023-C037 | L78,L163 | Real-writer absolute/relative scale behavior not observable from capture; propose validation. | supported | E21, I01: True source limit, not false absence or candidate operational failure. Relative factors without external scale do not themselves give calibrated physical coordinates. |
| R023-C038 | L80-81,L128 | omero optional; if supplied requires channel dictionaries,color6RGB hex,window min/max/start/end. | supported | E25: Correct conditional mandatory structure. |
| R023-C039 | L81,L161 | label/active/coefficient/family/inverted and rdefs T/Z/model only illustrated,not guaranteed; external WebGateway docs not captured. | supported | E24, E25: Correct guarantee distinction and source gap. |
| R023-C040 | L82,L137,L147 | Optional populated omero supplies rendering defaults; no-omero/rdefs fallback needed. | qualified | E24, E25, P01: Correct product need. These are supplied source defaults, not the only possible way a product can choose defaults. Report no-metadata fallback acknowledges this. |
| R023-C041 | L83,L162 | No normative MUST channel-list-length=c-size or mismatch behavior in S003; example comment alone says matching. | supported | E24, E25, E38: Full source review confirms the scoped absence; no claim of absence in external sources. |
| R023-C042 | L84,L154 | Session-local display settings and unchanged files consistent; S003 has no obligatory writeback. | supported | E02, B01, P02: Read-only case boundary supports no-change disposition. |
| R023-C043 | L86-88,L128,L148 | Associated label images in nested labels group,declared path list,complete listing SHOULD; metadata-free intermediate groups allowed,names arbitrary. | supported | E27: Discovery rules correct. Need relative source-image resolution before overlay, beyond mere path listing. |
| R023-C044 | L89,L128,L148,L152 | Label pixels integer types including signed/unsigned8/16/32/64; reject noninteger labels. | supported | E27, P02: Format dtype rule and malformed feedback appropriate; integer decoding precision/range not covered. |
| R023-C045 | L90,L128,L148,L152 | Label multiscales required with same level count as source; invalid count reported. | supported | E28: Correct count rule; equal count/shape alone does not establish registration. |
| R023-C046 | L92,L132 | image-label and colors/version SHOULD; if present required array/string types; reader SHOULD use specified colors. | supported | E28, E29: Recommendation is preserved, not a universal styling MUST. |
| R023-C047 | L93,L128,L133 | Color entries integer label-value; rgba MAY,4 integers0..255 incl alpha; extras allowed. | supported | E29: Correct categorical lookup key and conditional rgba typing. |
| R023-C048 | L93,L176 | Example [0,0,128,128] is50% blue/50% opacity. | supported | E31: Matches source's illustrative wording; fractional128/255 approximation not a current execution claim. |
| R023-C049 | L93,L133 | properties/source MAY; source.image relative default../../. | supported | E30: Correct brief mention, but how to resolve explicit association from label image location is not carried into plan/test disposition. |
| R023-C050 | L94,L138,L148,L176 | rgba-less entries valid; fallback color policy needed; blend/opacity policy beyond example is product decision. | supported | E29, E31, P01: No false mandatory palette requirement; fallback remains a proposal. |
| R023-C051 | L98 | Labels may have same per-axis dimensions or1 when irrelevant. | supported | E07: Correct illustrative counterevidence to exact-shape assumption; it is not stated as a separate compulsory shape rule. |
| R023-C052 | L99,L105 | Usually same dimensions/transforms is informative/non-normative because it says usually. | contradicted | E26, E38: Usually qualifies the claim, but source says descriptive text normative unless expressly exempt. L432-433 is not explicitly an informative note/example. Same coordinate-system statement and qualified dimensional equality should stay distinct. |
| R023-C053 | L100,L148 | Resolve label's own multiscales/transforms rather than assuming index-identical geometry; surface mismatch. | supported | E26, E28, P02: Appropriate alignment implication. The report still lacks explicit relative-source identity resolution and supported-geometry boundary. |
| R023-C054 | L107-108,L129,L152 | JSON comments forbidden; explanatory malformed-metadata feedback; other JSON irregularities not inspected. | supported | E03, P02: Source directly forbids comments; no unsupported tolerance claim. |
| R023-C055 | L110-111 | Transitional reading can be required/recommended; b2raw and omero become first-class requirements with no writing obligation. | qualified | E02, E16, E25: General reading warning valid. It does not make every transitional feature mandatory for every reader; b2raw awareness is SHOULD and omero structure conditional. Writing is out of brief rather than a universal absence of writer duties. |
| R023-C056 | L113-114 | Same hierarchy works locally under valid Zarrv3 store assumption; HTTP/object concerns outside boundary. | supported | E06, B01: Mechanism and boundary explicitly conditioned; no transfer of remote performance claims. |
| R023-C057 | L116-117,L164 | Source version history documents v3/axes/type/unit/transform/separator changes; legacy interoperability outside captured0.5 guarantees. | supported | E37, E01: Version-history facts directly matched, not candidate history access. No proven real-tool interoperability asserted. |
| R023-C058 | L121-129 | MUST summary restates container,axis,dimension_names,transform,b2raw,HCS,label/omero,strictJSON obligations. | qualified | E04, E09, E10, E12, E14, E15, E18, E19, E20, E25, E27, E28, E29, E33, E35, E03: Correct underlying findings but conditional b2raw,series,HCS,labels and optional omero must inherit scope; heading does not make them guaranteed present in every conforming fileset. |
| R023-C059 | L131-133 | SHOULD/MAY summary lists optional units,zyx,name/type/metadata,XML,plate/acquisition metadata,label metadata/transforms/omero/source/custom types and reader choices. | supported | E11, E15, E16, E18, E22, E25, E28, E29, E30, E32, E33: Optionality levels accurately sourced, though SHOULD remains a conformance recommendation rather than simply an arbitrary MAY. |
| R023-C060 | L135-139 | View-level policy,rendering fallbacks,custom-axisUI,unit formatting/errorcopy/plateUX are product choices. | supported | E10, E11, E23, E24, E25, E29, B01, P02: Suitable distinction except mandatory display of unknown axis type elsewhere and unknown-vs-unitless calibration issue. |
| R023-C061 | L145 | Extend discovery/version checks; plan lacks explicit families/namespace; reader SHOULD surface all images. | qualified | E09, E16, P01: Suggested discovery extension fits brief, but source SHOULD is awareness of multiple images, not show all. Showing all or choice is MAY; this sentence upgrades recommendation scope. |
| R023-C062 | L146 | Pan/zoom no direct S003 obligation; codec/shard detail unresolved; defer with explicit assumptions. | supported | E04, E05, P01, P02: No performance/implementation test claimed. Any deferred capability must remain truthful in advertised support. |
| R023-C063 | L147 | Define conditional-axis/default fallbacks; display unknown types. | qualified | E10, E18, E24, E25, P01, P02: Fallback policy sound; mandatory displayability of every custom type unsupported (separate failure). |
| R023-C064 | L148 | Add optional-label color fallback,dtype/count validation and mismatch feedback. | qualified | E27, E28, E29, E30, P01, P02: Sound proposals; source-image association,exact IDs and registration cannot be replaced by count/dtype alone. |
| R023-C065 | L149 | Details need axis units and composition; show unitless when unit absent. | qualified | E11, E20, E21, E22, P01: Composition correct; missing-unit fallback must distinguish unknown calibration/relative coordinates from physically dimensionless. |
| R023-C066 | L150 | Pyramid choice follows list position and never lexical sorting. | supported | E19, P01: Sound level-order policy, but no full missing-level/path/anisotropic level handling. |
| R023-C067 | L151 | Keep background/cancellation plan; actual feasibility/performance unresolved until real chunk/shard evidence. | supported | E04, E05, P02: Product acceptance requirement is clear; source gives no measured responsiveness guarantee. |
| R023-C068 | L152 | Error taxonomy includes version/rank/dimension_names/vector/label/count/name/comment/precedence violations with path and alternative choice. | qualified | E03, E09, E10, E12, E14, E18, E20, E27, E28, P02: Appropriate malformed cases. Plate+b2raw coexistence is allowed and only true precedence violations are invalid; unavailable declared levels omitted. No observed behavior claimed. |
| R023-C069 | L153 | Include real b2raw and sparse-plate acceptance fixtures; actual writer variance unverified. | supported | E13, E15, E34, P02: Good unexecuted proposal beyond six-key facets; not proof of real-writer interoperability. |
| R023-C070 | L154 | Source unchanged/session-local settings need no plan change. | supported | B01, P02, E25: Proper already-covered disposition. |
| R023-C071 | L155 | V1-V6 are proposed acceptance checks; thin plan has no concrete fixtures. | qualified | P02: Plan absence supported and proposals unexecuted. They do not fully expose all six facet failures, e.g. precision/registration/path/missing levels. |
| R023-C072 | L159 | No detailed chunk/codec/sharding/core-array-field rules inside S003; details outside fixed input. | qualified | E04, E05: Absence applies to detailed internals, not the general permission/all-features rule; report already quotes that counterevidence. |
| R023-C073 | L160 | Implementations section only See Tools, no reader catalog; actual-reader research unmet in fixed scope. | supported | E36, E13, I01: Correct source-limited gap; writer bioformats2raw is named, but no catalog of reader behavior. Acquisition-ledger pointer unavailable and unused. |
| R023-C074 | L161 | rdefs defaults only example and writer reliability unknown; viewer cannot assume guaranteed presence. | supported | E24, E25: Not a failed factual assertion or candidate operational failure. |
| R023-C075 | L162 | c-axis/omero-list mismatch rule not defined normatively in capture; handling product choice. | supported | E24, E25, E38: Scoped absence independently checked throughout complete source. |
| R023-C076 | L163 | Scale rules conditional; writer conformance unknown; compute per spec and tolerate either regime. | qualified | E20, E21: Valid uncertainty. Relative/physical regime cannot be chosen interchangeably without known calibration/metadata condition; physical scale cannot be invented. |
| R023-C077 | L164 | Legacy0.4 support product/compat question; S003 is0.5 and history shows differences. | supported | E01, E37, B01: Truthful unresearched area; explicit admission/refusal behavior still absent. |
| R023-C078 | L165 | More detailed OMEROwindow interpretation external; only min/max/start/end wording admitted. | supported | E24, E25: Honest source limit; no invented scientific rendering semantics. |
| R023-C079 | L166 | Editing/export/remote/scientificclinical automation rejected per brief/plan. | supported | B01, P02: Correct negative scope, not unsupported worldwide absence. |
| R023-C080 | L167,L171 | Live GET prohibited and unperformed; no validation was executed. | unresolved | I01: Fixed source permission is supported; actual execution remains locked. Proposals plainly unexecuted, no fabrication inferred from unavailability. |
| R023-C081 | L173 | V1 fixtures cover plain/b2raw series/XML variants,sparseHCS,2-5D,custom type/missing unit; exact image count wells×fields. | qualified | E08, E13, E15, E18, E34, E35, P02: Valid unexecuted fixtures. General expected count must enumerate/sum well.images, not assume equal field count or use maxima; custom support may be explicitly limited. No test failure asserted. |
| R023-C082 | L174 | V2≥10 levels named0…10 verifies declared rather than lexical ordering. | qualified | E19: Good test idea;0…10 gives11 levels. Does not cover arbitrary paths,nonuniform factors or absent listed level. |
| R023-C083 | L175 | V3 known voxel sizes,translation and group transform verify dataset-then-group composition under physical/relative regimes. | qualified | E20, E21, E22: Valid unexecuted composition proposal; no numerical oracle and no explicit unknown-calibration/unitless distinction. Relative factors alone cannot yield physical coordinates. |
| R023-C084 | L176 | V4 checks specified colors/alpha,rgba-less fallback and malformed dtype/level counts. | supported | E27, E28, E29, E31, P02: Source-based unexecuted proposal; does not test source reference/intermediate group registration,ID precision,lookup order or interpolation. |
| R023-C085 | L177 | V5 tests explanatory path-specific feedback and alternate selection for taxonomy cases. | qualified | P02, E14: Appropriate unexecuted product acceptance proposal. It must preserve legitimate plate+b2raw co-presence and classify only true precedence violation. |
| R023-C086 | L178 | V6 large chunk/shard dataset response/cancel proposal with explicit unresolved dependencies. | supported | E04, E05, P02: No executed result or numeric performance claim; optional shard support correctly conditioned here. |
| R023-C087 | L180-203 | Index binds findings to the stated S003 regions; standalone all-source/fullscope statement. | qualified | I01, E01, E38: Citation regions generally contain cited substantive rules; every claim above includes unsourced operation/product inference and some misclassified mandates. Index existence/fullread availability does not prove full quality. |

## Source evidence (exact pin above; short quotations)

- **E01**, S003 L1-10, L25-27: “Final Community Group Report, 8 September 2026” This/latest/editor URI is /0.5/; editor-draft data not necessarily supported.

- **E02**, S003 L56-64: “Implementations may be expected (MUST) or encouraged (SHOULD) to support the reading of the data” A general description of possible transitional reading obligations, not a blanket requirement to implement every transitional feature.

- **E03**, S003 L65-66: “comments MUST NOT be included in JSON objects.” 

- **E04**, S003 L68-72: “version 3 of the Zarr specification.” All Zarr features may be used unless expressly disallowed; feature permission is distinct from mandatory support by every reader.

- **E05**, S003 L70-72: “unless explicitly disallowed in this specification.” Permission includes codecs, chunk grids, key encodings, data types, storage transformers. No universal reader-codec support promise is stated.

- **E06**, S003 L73-81: “represented here as it would appear locally but could equally be stored on a web server” Image rank is 2-5; axis names are arbitrary.

- **E07**, S003 L82-117: “The name of the array is arbitrary with the ordering defined by” Illustrated image/labels hierarchy; label dimensions same or 1 appears in diagram comment, not an independent MUST.

- **E08**, S003 L119-129: “Three groups MUST be defined above the images:” Well, row and plate; well/plate implement their specs. Empty row/well groups SHOULD NOT exist.

- **E09**, S003 L149-156: “ome in attributes.” OME metadata in hierarchy zarr.json; version string in ome namespace and consistent within hierarchy.

- **E10**, S003 L166-169: “The values MUST be unique across all "name" fields.” Axis name mandatory; type SHOULD and custom string types MAY. Valid custom types do not guarantee a particular reader can render them.

- **E11**, S003 L170-172: “SHOULD contain the field "unit"” Recommended UDUNITS-2 strings; absent unit does not establish dimensionless physical coordinates.

- **E12**, S003 L173-174: “MUST match the names in the "axes" metadata.” Axis-list length equals image array rank; multiscale-array dimension_names mandatory and matches axes.

- **E13**, S003 L175-191: “bioformats2raw internally introduced a wrapping layer.” Transitional multi-image layout and typical collection hierarchy, not a survey of readers.

- **E14**, S003 L193-206, L256: “MUST have the value "3"” Normative prose quotes the value; JSON examples use numeric 3. Plate metadata takes precedence when top-level represents plate; image collections cannot be mixed with plates.

- **E15**, S003 L257-270: “If the "series" attribute does not exist and no "plate" is present:” Then consecutively numbered groups starting 0; series optional list of string paths ordered as XML Images if XML supplied; XML SHOULD exist and uses MetadataOnly if present.

- **E16**, S003 L271-275: “SHOULD make users aware of the presence of more than one image” MAY show all images or offer choice; MAY use series and ignore extraneous groups. Awareness SHOULD does not require showing all images.

- **E17**, S003 L276-293: “The transformations in the list are applied sequentially and in order.” General transform types include identity default, translation, scale; vectors may be inline or stored via path.

- **E18**, S003 L295-303: “MUST contain 2 or 3 entries of "type:space"” 2-5 dimensional multiscale; optional one time and one channel/null/custom. Axis order corresponds array order and time, channel/custom, space. Anisotropic zyx is SHOULD.

- **E19**, S003 L304-307: “relative to the current zarr group.” datasets required; path required, group-relative, largest/highest-resolution to smallest; dimensionality and order equal axes.

- **E20**, S003 L308-313: “They MUST contain exactly one scale transformation” Only scale and translation; scale physical size/duration or relative factor when physical scale unavailable/applicable. Optional exactly-one translation follows scale; vectors match axes.

- **E21**, S003 L310: “If scaling information is not available or applicable for one of the axes” Relative-to-first-level factor required in this case, 1 when no downsampling. Relative values alone do not prove physical calibration.

- **E22**, S003 L314-319: “are applied after them.” Optional multiscale-level transform follows dataset transforms, subject to same type/order rules; name,type,metadata SHOULD fields.

- **E23**, S003 L388-397: “using the first multiscale as a fallback:” Named-multiscale selection/pseudocode; informative example, not a universal pyramid-level policy.

- **E24**, S003 L398-425: “See the OMERO WebGateway documentation” Example contains channel label/active/coefficient/family/inverted and rdefs defaultT/defaultZ/model; their guaranteed presence not stated by normative requirements.

- **E25**, S003 L426-430: “The "omero" metadata is optional, but if present it MUST contain the field "channels"” Each channel color six RGB hex digits and window min/max/start/end; no normative channel-list size equality sentence in capture.

- **E26**, S003 L432-436: “usually having the same dimensions and coordinate transformations” Descriptive normative prose says corresponding label image same coordinate system in segmentation case; usually qualifies dimensions/transforms. It is not marked non-normative merely because it says usually.

- **E27**, S003 L437-442: “[uint8, int8, uint16, int16, uint32, int32, uint64, int64].” Nested labels group, arbitrary label names, permitted metadata-free intermediate groups, declared labels paths; complete listing SHOULD.

- **E28**, S003 L454-460: “MUST have the same number of entries (scale levels) as the original unlabeled image.” Label multiscales required; image-label object and colors/version SHOULD, required types if present.

- **E29**, S003 L461-466: “MUST be the integer corresponding to a particular label.” colors entries keyed by label-value; rgba MAY, four integer 0-255 values if present; readers SHOULD use specified colors, not mandatory universal palette.

- **E30**, S003 L467-474: “a string specifying the relative path to a Zarr image group.” Optional properties objects keyed by integer label-value; optional source.image relative reference, default ../../ because usual nesting. Correct resolution depends on label-group location.

- **E31**, S003 L475-514: “50% blue and 50% opacity.” Example [0,0,128,128]; not evidence of actual viewer execution.

- **E32**, S003 L518-529: “greater than or equal to 0 within the context of the plate” Optional acquisitions list; unique integer ID required. Acquisition name/maximumfieldcount SHOULD; description/start/end MAY with required types.

- **E33**, S003 L530-560: “rowIndex and columnIndex MUST be 0-based.” All physical rows/columns defined even empty; alphanumeric case-sensitive unique names, avoid case-insensitive collisions SHOULD; required columns/rows/version/wells; row/column paths and indices agree.

- **E34**, S003 L641-739: “2 wells in a 96 well plate” Sparse example one acquisition/one field per well; larger grid does not imply all well subgroups populated.

- **E35**, S003 L741-752: “specifying all fields of views for a given well.” well.images list required; fields use unique alphanumeric case-sensitive paths. Each image acquisition ID required if multiple acquisitions and matches plate definition; well version SHOULD.

- **E36**, S003 L809-820: “4. Implementations See Tools.” No reader implementation catalog in capture; bioformats2raw named elsewhere as writer. This edition /0.5/, latest /latest/ also appears in citing section.

- **E37**, S003 L825-851: “Clarify that the dimension_names field in axes MUST be included.” 0.5.2 clarification,0.5.1 omero,0.5.0 Zarr v3; pre-0.5 axes/types/transforms/separator history.

- **E38**, S003 L867-888: “All of the text of this specification is normative except sections explicitly marked as non-normative, examples, and notes.” Requirements descriptive and RFC2119; lowercase keywords can carry force. Usually is a qualifier, not an automatic informative marker.

- **B01**, inputs/brief.md, entire 2 paragraphs: “local OME-Zarr 0.5 bioimaging filesets.” Read-only local viewer; discovery, multiresolution axes navigation, associated labels, calibrated coordinates, responsiveness and truthful display limits. Research actual readers broadly; distinguish format obligations, optional capabilities and product decisions.

- **P01**, inputs/plan/Viewer.md L5: “time-point and plane selection where relevant” Image listing, pan/zoom, conditional channel/time/plane controls, optional associated overlays, dimensions/units/coordinates, level choice; detailed metadata rules absent.

- **P02**, inputs/plan/Viewer.md L7-11: “Source files remain unchanged; display settings are local to the viewing session.” Background reads/cancellation, understandable failures, real tools interoperability, additional capability choices explicit review, calibration/alignment/responsiveness acceptance. No concrete fixtures.

- **I01**, stage.json, MANIFEST.json, eligibility.json, catalog.json: “Fixed admitted source S003 only; no live fetching for this component case.” Hash/source bytes/line count independently checked. All six facets assigned. Catalog metadata does not establish actual operations; no semantic companion declared.

## Scope and uncertainty

{
  "verdict": "The carrier is complete and the full review is frozen. The report supplies useful source-grounded breadth beyond the key, but material normative overclaims and unresolved full-facet requirements prevent a full-quality pass. All six assigned facets are assessed as partial; this is not a sampled or incomplete review. Unknown candidate operations, missing external implementation research under fixed S003 scope, and unexecuted proposals are not treated as false execution or operational failure.",
  "scope_limits": [
    "S003 does not provide actual reader implementation behavior,full Zarrv3 codec/shard internals or real-data performance; these limits are explicit in report and do not reduce six-facet denominator.",
    "TASK.md and named candidate protocol/acquisition artifacts are not phase1 inputs; actual rule/read/GET/test operations remain unknown."
  ],
  "unresolved": [
    "Actual read/GET/test/native operations pending explicit phase2 unlock.",
    "Whether quotes around b2raw value3 imply string typing: source examples are numeric; no definite string-only requirement inferred.",
    "No measured interoperability,coordinate output or responsiveness result exists in current semantic carrier."
  ],
  "blinding": [
    "Verbatim L3 contains treatment-arm and combined-groups cue; no private treatment map was read or used.",
    "Method/protocol/read-attempt claims embedded at L8,L31 and acquisition-ledger pointerL160 are unavoidable exposure. Referenced artifacts remain unopened.",
    "Prebound catalog/addendum received as permitted metadata; not operational/source authority."
  ],
  "inventory_control": {
    "complete_report_read_ranges": [
      "L1-107",
      "L108-203"
    ],
    "complete_original_source_read": true,
    "nonassertion_lines": "Blank lines,Markdown separators and headings are structural. Each substantive paragraph/list/coverage row/disposition/proposal/citation summary is represented; repeated factual statements share rows with all material locators.",
    "all_current_dispositions_reviewed": true,
    "all_unknown_and_rejected_items_reviewed": true,
    "novel_claims_independently_source_checked": true,
    "claimed_current_supersessions": "No prior revision or explicit supersession is in the current carrier."
  }
}

## Phase lock

No acquisition, history, native delivery, preservation or efficiency judgment has been made. Explicit root/stager unlock receipt is required after the entire cohort is frozen.
