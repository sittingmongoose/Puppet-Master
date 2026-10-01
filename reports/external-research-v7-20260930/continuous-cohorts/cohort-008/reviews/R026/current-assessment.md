# R026 — frozen current assessment

Verdict: **quality failure**. Complete review: **true**. Report SHA-256: `96089edfc376c7df8883d8242b0471ac2c3ade6128d74d6d08547058e1d713d2`.

Every current claim and all six facets are assessed. The report provides substantial normative breadth,full version admission and declared-pyramid coverage,but several material current source-force/association/calibration errors remain. Informative guidance becomes mandatory;label listing and schema presence are overclaimed;coordinate equation disagrees with required order;source-image identity is demoted;calibration/window restrictions are invented. Four facets remain partial. Current quality therefore fails full-scope assessment. No seed,verification,acquisition,native or efficiency conclusion is inferred from embedded method claims.

All six assigned facets and every material assertion family were assessed against the complete 896-line S003 capture. Review completeness does not imply full candidate coverage. Candidate history, operational exposure, preservation, native delivery and cost remain locked.

## Facet roster

| Facet | Coverage | Reason / missing scope |
|---|---|---|
| OME05-C01 | full | Version/layout explicitly gate admission:v3,attributes.ome,consistent0.5,other versions out-of-contract or visible best-effort/refusal. No implicit legacy reinterpretation. Missing:  |
| OME05-C02 | partial | Rank/order/unique arbitrary names and dimension_names validated;absent axes handled. Untyped positional role inference only labeled best-effort,but singleton distinction missing. Missing: Explicit absent versus present length-one image-axis controls/slicing behavior.; Do not promote positional role inference or innermost-plane preference into validated semantic identity. |
| OME05-C03 | full | Arbitrary group-relative declared paths/order,each level own geometry,no numeric-name rule,and item-scoped missing/unavailable/malformed level handling provided. Total-voxel-count sanity check is only an unsupported scalar heuristic,not authority or reorder policy. Missing:  |
| OME05-C04 | partial | Prose correctly states level then group and scale then translation,but displayed equation reverses each inner scale/translation chain. Missing unit wrongly proves relative scale;channel physical calibration categorically excluded. Missing: An unambiguous correct composition formula and numeric offset-bearing oracle.; Distinguish unknown unit/scale semantics from automatic relative-factor classification;no invented channel-scale restriction. |
| OME05-C05 | partial | Declared paths,intermediate groups,count/dtype,own geometry and singleton handling covered. Explicit policy uses source.image only as provenance instead of resolving original-image association before overlay. Missing: Resolve/validate explicit or default relative source.image from label-image location and refuse/redirect unsupported association.; Geometry warnings must not falsely imply intended source identity or alignment. |
| OME05-C06 | partial | Integer dtype and label-value keyed colors/properties,categorical nearest-neighbor and paletteSHOULD preserved. No exact64-bit decode/range guarantee or refusal. Missing: Exact sparse/wide integer identity through decode and lookup,including values beyond binary64 range,or explicit supported range/refusal.; Order-independent sparse-key and wide-ID fixture checks. |

## Material failures

- **R026-F01** (informative guidance promoted): First-named-multiscale fallback is repeatedly treated as normative because of lowercase imperative style,contrary to example exception. Report L13,L73,L83,L104,L223; evidence E23, E38.

- **R026-F02** (unsupported display prohibition): Label images MUST NOT be primary-list items is not in source. Source expressly says the labels group contains images;overlay-only UI is product policy. Report L76,L191; evidence E27, E28.

- **R026-F03** (contradicted coordinate equation): scale∘translate applies translation before scale under standard notation,opposite of mandated order,although surrounding prose is correct. Report L140; evidence E17, E20, E22.

- **R026-F04** (association demoted): Use source.image only to annotate provenance fails original-image identity validation before associated overlay. Matching geometry alone cannot repair it. Report L154; evidence E30.

- **R026-F05** (optional key force upgraded): image-label.version key inclusion is SHOULD;only value type is MUST if supplied. Report makes presence mandatory. Report L154; evidence E28.

- **R026-F06** (calibration semantics invented): Missing unit does not prove relative scale and source does not categorically forbid physical channel calibration. Report L144; evidence E11, E21.

- **R026-F07** (unproved malformed classification): Numerical windows outside dtype range or with reversed start/end have no stated invalidity rule in S003;reader inability is a capability/policy outcome. Report L130; evidence E25.

- **R026-F08** (material coverage omission): Four facets remain partial:singleton/unknown axes,correct coordinate math/uncertainty,source association and exact categorical64-bit identity. Report Facet roster; evidence E12, E20, E21, E27, E29, E30.

## Complete material-claim inventory

| ID | Report locator | Current assertion | Outcome | Evidence and reason |
|---|---|---|---|---|
| R026-C001 | L3-8,L34-40 | Case,date,source URI/hash/896 lines,brief/plan bytes and source scope are stated. | supported | E01, I01, B01, P01: Admitted identity values match; TASK and seed pins are not phase1 authority. |
| R026-C002 | L5-6,L9,L32-42,L243,L245,L251,L263,L281 | Complete fresh reads,seed verification,probe errors,all citations checked,no native/shell/code/GET/tests and immutable verification/acquisition records claimed. | unresolved | I01: All seed/history/verification/native/tool/acquisition artifacts remain locked; exact read/probe/check operations unknown. No negative operational inference. Current conclusions themselves are assessed below. |
| R026-C003 | L10-14 | Whole brief in two groups,status vocabulary and exact source/brief/plan locators. | qualified | B01, P01, P02, E38: All topical sections exist. Lowercase RFC keywords retain force only in normative text; examples do not become binding from imperative style. |
| R026-C004 | L20,L26,L231,L237 | S003 fully determines on-disk contract,while reader implementations/Zarr internals/real compatibility remain unknown. | qualified | E04, E05, E17, E36: OME metadata rules are detailed,but referenced Zarrv3 mechanics and binary path encoding are not fully captured. Fully determines is too broad; admitted-source limits are correctly visible elsewhere. |
| R026-C005 | L22,L103,L191-202,L257 | Thin plan core compatible; metadata discovery,axes,transforms,labels/defaults add required details; real-tool and performance evidence unresolved. | qualified | P01, P02, B01, E09, E12, E19, E20, E27: Compatible plan intent and omissions supported. Every proposed extension is not automatically a normative mandate; disputed extensions below are separated. |
| R026-C006 | L24,L48 | Zarrv3 permits codecs/grids/keys/dtypes/transformers unless disallowed; backend limits get graceful refusal; no disallowance anywhere. | qualified | E04, E05, E18, E27: Permission and explicit limits sound. No particular codec restriction exists,but blanket no-disallowance overlooks image rank/order and label integer constraints. |
| R026-C007 | L49,L201 | Storage location agnostic; local-only,read-only/session settings and explicit non-goals narrow product scope. | supported | E06, B01, P02: Correct format-versus-product boundary; no remote capability mandated. |
| R026-C008 | L50,L52,L82,L165,L210 | Metadata attributes.ome,version string hierarchy-consistent; only0.5 in contract,other versions best-effort or rejected with caveat. | supported | E09, E01, B01, P02: Explicit version/layout admission and truthful unsupported policy; malformed and unsupported distinctions retained. Best-effort must not claim conformance. |
| R026-C009 | L13,L51,L230 | Lowercase RFC2119 terms carry force; explicit non-normative/examples/notes excepted; transitional reading may required/recommended and writing usually optional. | supported | E02, E38: Correct general convention; lowercase exception does not override example status or turn arbitrary imperative into MUST. |
| R026-C010 | L51,L165 | JSON comments forbidden. | supported | E03: Direct format rule,not an executed parser check. |
| R026-C011 | L53,L249 | Exact camelCase exceptions required on read; private viewer-store camelCase is product convention,not source recommendation. | supported | E39, E32, E33, E29: Correct literal-key lookup and current C3 correction. |
| R026-C012 | L61,L164 | Images are groups,levels arrays with their own zarr.json; Zarrv3 parsing is a dependency. | supported | E04, E07, E19: Correct representation and decoding relationship; backend breadth may be bounded truthfully. |
| R026-C013 | L62-66,L169,L191 | Distinguish plain,HCS,b2raw; plate first then collection then multiscales and report ambiguity. | supported | E07, E08, E13, E14, E15, P01: Source-defined families and precedence justify refinement; shape sniffing algorithm is product design,not sole universal source algorithm. |
| R026-C014 | L67,L173,L200 | Keep source bytes unchanged and session-local settings; no obligatory writeback in S003. | supported | B01, P02, E02: Correct already-covered disposition. |
| R026-C015 | L73,L83,L104,L223,L230 | Named-multiscale choose-by-name/first fallback imperative is binding or uniquely required despite example placement. | unsupported | E23, E38: It is informative pseudocode/example guidance. Lowercase keyword caveat cannot create obligation from use it or override explicit example exception. Adoption is a permissible product choice. |
| R026-C016 | L74,L87,L92,L169 | HCS enumeration uses plate wells/consistent0-based paths and well fields/acquisition IDs; all physical rows/columns listed,empty groups discouraged. | supported | E08, E32, E33, E34, E35: Detailed hierarchy/discovery rules correct and useful; flat UI with qualified identities remains valid product choice. |
| R026-C017 | L74,L191 | Plan flat list cannot express plate/well/acquisition identity. | qualified | P01, P02, E33, E35: Detailed identity unspecified,not proven shallow/flat discovery. A flat list with metadata qualifiers can be sufficient,as report acknowledges choice. |
| R026-C018 | L75,L170,L267 | b2raw value3,optional series XML-order paths,numbered fallback only absent series/plate,MetadataOnly XML SHOULD,plate precedence. | qualified | E14, E15, E16: Correct conditions mostly preserved; quotation3 does not prove string-only type. XML/series conditionality must remain attached. |
| R026-C019 | L75,L80,L177,L267 | Multi-image awareness SHOULD adopted as required for plan acceptance; reader must never silently open only image0. | qualified | E16, P02: Source SHOULD and MAY show-all/choice accurately quoted. Product may adopt stronger acceptance; it must remain a declared product bar rather than unconditional format minimum. L80 labels the promotion,which receives policy credit. |
| R026-C020 | L76,L191 | Label contents MUST NOT be listed as primary images and must only be overlays. | unsupported | E27, E28, P01: Source says labels group contains images and label images implement multiscales. It does not prohibit standalone/primary listing. Separate overlay presentation is a product policy,not a format MUST. |
| R026-C021 | L81 | Row/column/field identifiers unique,alphanumeric,case-sensitive; preserve exact case and avoid filesystem collision. | supported | E33, E35: Correct identifiers and meaningful local-reader implications. |
| R026-C022 | L83 | Row has no metadata section,so directory scanning alone is always non-conforming discovery. | qualified | E08, E33: Plate/well declared paths are authoritative and row has no dedicated OME schema. No source prohibits directory enumeration for candidate discovery followed by metadata validation; internal algorithm mandate is overstated. |
| R026-C023 | L87 | Fields carry acquisition when multiple performed; IDs nonnegative unique and match plate; names/maxfieldcount recommended,timestamps optional. | supported | E32, E35: Accurate structural conditions; identity keyed by well/acquisition/path is sound proposal. |
| R026-C024 | L88,L177 | field_count/name/maxfieldcount and acquisition names SHOULD be shown as display hints. | qualified | E32, E33, E35: Source recommends field presence/types,not mandatory reader display. Displaying supplied hints is useful product choice; counts are maxima rather than image enumeration keys. |
| R026-C025 | L89,L227 | Require acquisition only if plate.acquisitions length>1,honor IDs otherwise and flag dangling references. | qualified | E32, E35: Dangling checks valid; source trigger is multiple acquisitions performed,not explicitly array length. The chosen heuristic is stated but cannot redefine normative validity for incomplete/ambiguous metadata. |
| R026-C026 | L95-98,L166-168 | Required multiscales axes/datasets/group-relative paths/ordered levels,rank/order/name equality and dimension_names; mismatch refusal/skip-with-message. | supported | E12, E18, E19, E20: Full declared-level identity; no silent remapping and unavailable level/backend feedback are explicit. |
| R026-C027 | L99,L177 | Names/type/downscaling metadata SHOULD be surfaced in level selection. | qualified | E22: Source SHOULD is metadata inclusion in file. UI exposure is a useful inferred policy,not source-required reader presentation. |
| R026-C028 | L96,L105,L220,L247 | Highest-resolution gloss is defined but its scalar metric not; total voxel count sanity-check without reordering. | qualified | E19, E20: Correct metadata authority and current C1 gloss correction. Total voxel count is not a source-defined resolution metric and may misflag anisotropic/nonuniform extents; preserve order and label heuristic rather than normative violation. |
| R026-C029 | L103-104,L192,L196 | Keep pan/zoom,level-per-view and background/cancellation; add metadata traversal,validation,transforms,multiscale policy and per-level unsupported feedback. | qualified | P01, P02, E19, E20, E23: Core and most extensions sound; first-fallback requirement remains informative/policy. Level-specific geometry and missing/unavailable decoding handled explicitly. |
| R026-C030 | L109,L197 | Chunked multi-GB-capable data indirectly creates performance obligation; no source threading model,product responsiveness/cancel outcome required. | qualified | E04, E05, E07, B01, P02: Product outcome is required by brief/plan. Capture does not state multi-GB sizes or prove architecture necessity; data-scale reasoning is an engineering inference,not measured implementation evidence. |
| R026-C031 | L110,L198,L209,L212 | Adopt item-scoped malformed/unsupported taxonomy and alternative selection,no crashes/silent skips. | qualified | E09, E12, E14, E18, E20, E27, E28, E33, E35, P02: Named source violations and backend limitations mostly correctly distinct. Window out-of-range/reversed limits elsewhere are not established source violations; metadata/palette mandates must keep true force. |
| R026-C032 | L118-120,L166 | Axes2-5,2-3space,optional time/channel-or-null/custom,type-order,array-order,unique names; zyx recommendation. | supported | E10, E12, E18: Complete rank/order composition and arbitrary naming properly stated. |
| R026-C033 | L119,L132,L193,L268 | Controls follow axes; absent time/channel hides controls;2space has no z-slider; plane always two innermost spatial axes. | qualified | E10, E18, P01: Presence policy valid. Source only recommends zyx in stated anisotropic case; fixed innermost-plane interpretation is a product orientation choice,not universal spatial identity. Absent versus present singleton control behavior unspecified. |
| R026-C034 | L121-122,L208,L219 | Missing/null/custom type/unit tolerated,unknown units caveated,positional inference only labeled best-effort; custom types outside capability can be unsupported. | qualified | E10, E11, E18, P02: Valid feature need not be rendered universally. R8 truthfully allows limits. Positional role guessing cannot support a claim of validated calibrated semantics; label uncertainty instead of inventing known t/c/z identity. |
| R026-C035 | L122,L218 | Array-zarr.json dimension_names normative rule beats history phrase in axes; follow array location. | supported | E12, E37: Correct exact normative placement. Whether external validators enforce both remains unknown. |
| R026-C036 | L126-127,L171 | Omero optional; supplied channels color/window mandatory file contents; no universal reader window/color rendering MUST. | supported | E24, E25, E02: Correct current C2 distinction; transitional read policy motivates product defaults without mandatory every-field renderer. |
| R026-C037 | L127-131,L224,L248 | Best-effort active/label/rdefs/window/color initialization; absence fallback,overlap-degrade list-size mismatch. | supported | E24, E25, P01: Example-only defaults and source-limited size expectation correctly retained; precise contrast interpretation is explicitly product policy. |
| R026-C038 | L130,L209 | Out-of-dtype window values or start>end are malformed-input violations,though source lacks out-of-range rules. | unsupported | E25: Six-hex color/required fields are structural obligations. S003 does not prohibit those numerical windows or define their rendering; inability to use them is a product capability/validation policy,not established format invalidity. |
| R026-C039 | L138-139,L168 | General sequential identity/translation/scale with path variant; image chain only scale/translation,exactly one scale,conditional physical/relative values,after-scale translation,matching vector lengths. | supported | E17, E20, E21: Correct source rules and explicit availability/applicability conditions. |
| R026-C040 | L140,L222 | Multiscales transforms follow dataset transforms and both must be composed for calibrated viewing. | supported | E22: Correct prose order. Identity/nonidentity scope applies; source does not require optional global list exist. |
| R026-C041 | L140 | Coordinate=global(scale∘translate)∘perLevel(scale∘translate). | contradicted | E17, E20, E22: Under standard composition notation each scale∘translate applies translation before scale. Correct chain within each list is translation∘scale. Outer group-after-dataset is right; current prose and equation conflict materially. |
| R026-C042 | L141,L265 | Source example voxel/time values0.5/1/2µm and0.1ms,channel×1; current-level hover transform and details suggested. | qualified | E20, E22, P01: Values match informative example. Channel×1 there does not prove all channel axes dimensionless. Detailed panel fields are reasonable product implications,not all format mandates. |
| R026-C043 | L142,L195 | Details should include per-axis extent/name/type/unit/scale/group/composed coordinates,level path and pyramid info. | supported | E10, E11, E19, E20, E22, P01: Useful source-to-plan extension with honest none/unknown units; precise panel layout remains product choice. |
| R026-C044 | L144,L221 | Missing unit forces scale to relative factor; channel axes never have meaningful physical scale and only index displayed. | unsupported | E11, E21: Unit is recommended and scale physical availability is a separate condition. Missing unit does not prove relative-factor basis; source supplies no universal ban on physical/custom channel calibration. Report uncertainty should not be replaced by invented semantic classification. |
| R026-C045 | L145,L221 | Translation origin undefined,assume image-group frame and disclose. | qualified | E20, E22: Offset/source coordinate-space relation given; no absolute external origin fully specified. Stated frame assumption is acceptable product limitation if association remains validated. |
| R026-C046 | L146,L208,L228 | Binary-path vectors underdefined,unsupported unless backend resolves with transform/level message. | supported | E17, P02: Valid format versus reader capability distinction,not malformed merely for using path. |
| R026-C047 | L147,L209,L271 | Missing scale/wrong vectors/other types/translation-before-scale malformed,image-level explanatory refusal. | supported | E20, P02: Accurate source violations; no test execution claimed. |
| R026-C048 | L151,L172 | Labels discovered from declared paths,arbitrary names,metadata-free intermediate groups; full listing SHOULD,scan unlisted policy. | supported | E27, E28: Correct hierarchy and scope; reader may choose explicit scan/ignore policy without confusing labels group with image. |
| R026-C049 | L152,L172 | Label multiscales and integer8/16/32/64 dtypes required,equal level count; violations per-overlay errors. | supported | E27, E28, P02: Correct format constraints. Exact wide-integer decoding still unaddressed. |
| R026-C050 | L153,L155,L156,L194,L225 | Same-index label level,broadcast singleton dimensions,compare composed geometry,warn divergence; own transforms used. | qualified | E07, E26, E28, P02: Appropriate registration proposal but equal count alone does not supply source association. Warning alone must not imply unsupported geometry is aligned; source.image identity needs validation before overlay. |
| R026-C051 | L153 | Labels must not interpolate as continuous intensities; nearest-neighbor policy follows integer categorical semantics. | supported | E27, E29: Sound inference/product resampling choice preserving categorical IDs. Does not yet address wide-int precision/range or sparse-key lookup tests. |
| R026-C052 | L154 | image-label SHOULD,colors/version inside it: colors entries integer keys,optional rgba4uint8,properties/source optional;version string MUST be present. | qualified | E28, E29, E30: Types and optional metadata correct. Source SHOULD contain both colors and version; MUST refers to their value types if present,not unconditional version-key presence. |
| R026-C053 | L154,L177 | Given image-label,version key mandatory. | unsupported | E28: Converts SHOULD key inclusion into MUST existence; valid omission should not automatically be malformed. |
| R026-C054 | L154,L177 | Readers SHOULD honor specified colors/alpha;extra keys and per-value properties allowed;fallback palette and legend choice. | supported | E29, E30, E31: Appropriate recommendation and explicit product fallback; property lookup must preserve exact label-value identity. |
| R026-C055 | L154 | source.image is followed only to annotate provenance,never to relocate overlay. | unsupported | E30, E26, B01: The reference identifies original image; ignoring its association can attach labels to wrong image even with matching extents. Declared identity must be resolved/validated or explicitly unsupported before overlay. Provenance-only treatment fails associated-overlay scope. |
| R026-C056 | L156,L226 | Accept any string schema versions,show them,never gate;label own transforms verified,parent precedence uncertain. | qualified | E28, E30, E33, E35: Source value vocabulary unspecified; accepting known field structure is policy,not universal reader capability guarantee. Label own geometry rule remains required; original source association cannot be demoted. |
| R026-C057 | L162-173 | MUST inventory restates container,namespace,axes,levels,transforms,HCS/collection,conditional omero,labels and read-only boundary with explicit refusal option. | qualified | E04, E09, E12, E18, E19, E20, E22, E25, E27, E28, E33, E35, B01: Core source facts largely correct; HCS/b2raw/label optional presence/conditional scope retained. Distorted selection,label-listing/version/source rules elsewhere prevent blanket all-supported conclusion. |
| R026-C058 | L175-181 | SHOULD reasoned exceptions and MAY metadata/capabilities enumerated; private-store naming identified as policy. | qualified | E11, E15, E16, E18, E22, E25, E28, E29, E30, E32, E33, E35, E39: Correct most source force; file-key SHOULD fields do not impose reader UI display of each field. Extra colors keys are allowed rather than mandatory. |
| R026-C059 | L183-185 | Listing UI,selection/cache/defaults/palette/scanning/version/path/uncalibrated/errors/performance budgets require review. | supported | P02, E10, E11, E23, E25, E29: Honest product-choice inventory. Must keep valid unsupported input distinct from format errors. |
| R026-C060 | L191-202 | Every plan sentence gets keep/extend/constrain/flag disposition; tool interoperability unevidenced,acceptance bar extended. | qualified | P01, P02, B01: All plan sentences accounted for. Keep decisions generally sound; required label exclusion/first-fallback and source-provenance-only policy are unsupported. Raising acceptance is a product proposal,not preexisting source threshold. |
| R026-C061 | L208-212 | Backend/path/custom limits are valid-undisplayable; source violations malformed;nonlocal/edit/export/other versions outside product;message+continue. | qualified | E04, E05, E17, E09, E18, E20, E27, P02, B01: Proper core categories. All OME-XML beyond MetadataOnly is not explicitly banned by brief; xml conformance dependency remains source-required if supplied. Numerical window and optional label-version claims must not create false invalidity. |
| R026-C062 | L218-231 | Fourteen source tensions retained:dimension_names/null,level metric,scale/origin/composition,named selection,omero/labelgeometry/schema/layout/acquisition/binary counts/keywordforce and implementations. | qualified | E12, E18, E19, E20, E21, E22, E23, E24, E26, E28, E32, E33, E35, E37, E38: Current uncertainty list complete and mostly useful. Some chosen resolutions exceed source force or invent semantics; separately assessed rows preserve each material decision. Typographic duplication is immaterial. |
| R026-C063 | L237,L199,L257 | No actual reader performance/cache/tolerance/interoperability evidence in capture; need future authorized real-tool validation. | supported | E36, E13, E04, E05, P02: Correct source-limited gap,not proof of incompatibility or empty world. Writer b2raw reference is not reader behavior. |
| R026-C064 | L247 | C1 corrects no metric to highest-resolution gloss plus residual undefined scalar meaning. | supported | E19: Current replacement is source-grounded; prior seed assertion/status not accessed. |
| R026-C065 | L248 | C2 reclassifies omero rendering use from reader-MUST to motivated product read policy. | supported | E25, E02: Correct current force replacement; exact old-seed history remains unknown. |
| R026-C066 | L249 | C3 private-session camelCase reclassified from source recommendation to inspired product convention. | supported | E39: Correct current ownership/source distinction. |
| R026-C067 | L250 | C4 grouping is report organization,not independently located assignment; no separate assignment found. | qualified | B01, I01: Organization may cover full brief; actual assignment/probe existence and prior seed framing are unverified operation claims. |
| R026-C068 | L245,L251,L281 | All listed seed sections supported/preserved,every locator spot-checked,none failed verification and all current findings source-supported. | qualified | I01, E23, E28, E30, E38: Actual seed/check history locked; blanket current supported claim is contradicted by present overclaims/equation. No prior-seed factual judgment made. Listed current conclusions assessed individually. |
| R026-C069 | L261-265 | All validation unexecuted;V1 tests source-version/axis/level/composed worked scales. | supported | E09, E12, E19, E20, E22, P02: Valid unexecuted proposal; source example alone uses commuting scales. |
| R026-C070 | L266 | V2 sparse/dense HCS references/acquisition selection. | supported | E33, E34, E35, P02: Good unexecuted discovery/reference test. |
| R026-C071 | L267 | V3 b2raw branches/plate priority/XML correspondence/multiplicity behavior. | supported | E14, E15, E16: Appropriate unexecuted conditional discovery proposal. |
| R026-C072 | L268 | V4 variable ranks/untyped axes/control presence and omero mismatch degradation. | qualified | E10, E18, E24, E25, P01: Useful proposal; best-effort positional classification must stay unverified,not calibrated identity. No singleton-versus-absent image-axis case supplied. |
| R026-C073 | L269 | V5 level/group coordinates,unknown calibration and translation handling. | qualified | E20, E21, E22: Useful unexecuted idea but no numeric offset-bearing oracle; equation is inconsistent,so expectation needs independently correct order. |
| R026-C074 | L270 | V6 intermediates/singleton labels/alpha/fallback/properties/mismatch,dtype/count gating. | qualified | E27, E28, E29, E30: Useful unexecuted overlay checks;fails to validate explicit source association and exact wide-ID range. |
| R026-C075 | L271 | V7 each malformed case explanatory noncrash fallback. | qualified | P02, E20, E25, E28: Valid goal;must not encode unproved window or optional-key policies as format-invalid fixtures. |
| R026-C076 | L272 | V8 large dataset response/cancel/session setting/source-byte preservation. | supported | B01, P02: Unexecuted product checks,no measured performance or preservation operation proof. |
| R026-C077 | L273 | V9 authorized future real outputs/readers to close source gap. | supported | E36, P02, I01: Correctly out-of-scope unless separately authorized;not current research execution. |
| R026-C078 | L277-281 | Full source-line index and all-findings-supported assertion. | qualified | E01, E38, I01: Locators generally identify pertinent source sections; index does not certify disputed force/association/math claims or actual seed verification. |

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

- **E39**, S003 L809-812: “Multi-word keys in this specification should use the camelCase style.” Existing exceptions are acknowledged; no rule about viewer private session-store keys.

## Scope and uncertainty

{
  "verdict_label": "quality failure",
  "verdict": "Every current claim and all six facets are assessed. The report provides substantial normative breadth,full version admission and declared-pyramid coverage,but several material current source-force/association/calibration errors remain. Informative guidance becomes mandatory;label listing and schema presence are overclaimed;coordinate equation disagrees with required order;source-image identity is demoted;calibration/window restrictions are invented. Four facets remain partial. Current quality therefore fails full-scope assessment. No seed,verification,acquisition,native or efficiency conclusion is inferred from embedded method claims.",
  "scope_limits": [
    "Only current report is positively required forR026;no verification/seed companion is admitted. Source-derived current dispositions inR11are graded,but prior seed bodies and actual check operations remain locked.",
    "S003 lacks real-reader behavior,fullZarr mechanics,binary vector representation and performance measurements;those honest limits do not reduce normative facet denominator."
  ],
  "unresolved": [
    "Actual source/seed/task reads,probes,verification coverage,render/native operations and history.",
    "Quoted layout value3 remains not treated as definite string-only JSONtyping;source examples are numeric.",
    "External origin/validator behaviors and actual library capabilities remain unknown."
  ],
  "blinding": [
    "Seed-reuse identity/section labels,method/read/probe/native restrictions and verification file names are unavoidably embedded in current report. No seed,prior report,verification/acquisition/final/native artifact was accessed.",
    "Generic prebound catalog metadata is source identity only,not operation proof."
  ],
  "inventory_control": {
    "complete_report_read_ranges": [
      "L1-95",
      "L96-188",
      "L189-281",
      "L206-265 reread after display truncation",
      "L265-274 tail confirmation"
    ],
    "complete_original_source_read": true,
    "same_source_reuse": "Exact source/brief/plan/key/protocol/catalog hashes match complete original read;novelcurrent claims checked independently against sourceconditions.",
    "all_current_dispositions_reviewed": true,
    "all_unknown_and_rejected_items_reviewed": true,
    "novel_claims_independently_source_checked": true,
    "claimed_current_supersessions": "R11qualifications are current replacements and independently source-assessed;prior seed/history not read. No explicit correction silently treated as operational proof.",
    "nonassertion_lines": "Headings,separators,blanklinesstructural. Every substantive storage/discovery/axis/default/transform/label/triage/disposition/limit/uncertainty/verification/proposal/index family represented,with repeated assertions linked to all material locators."
  }
}

## Phase lock

No acquisition, history, native delivery, preservation or efficiency judgment has been made. Explicit root/stager unlock receipt is required after the entire cohort is frozen.
