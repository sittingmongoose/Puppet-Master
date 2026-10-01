# R025 — frozen current assessment

Verdict: **quality failure**. Complete review: **true**. Report SHA-256: `ec3395d2fef214bbfcd48e3676db2381a45b680fcb194d9b4f85c359d3863d23`.

The complete current report and its required findings companion are assessed and frozen. All six normative facets are omitted: product requirements are restated and format/reader work is left unresolved. Faithful brief facts,negative-evidence restraint and unexecuted proposals receive appropriate credit,but they do not supply the assigned S003-grounded research. This is a current-quality omission judgment. Reported path/tool/read failures and native delivery/acquisition history remain unknown,so no operational or infrastructure failure is inferred.

All six assigned facets and every material assertion family were assessed against the complete 896-line S003 capture. Review completeness does not imply full candidate coverage. Candidate history, operational exposure, preservation, native delivery and cost remain locked.

## Facet roster

| Facet | Coverage | Reason / missing scope |
|---|---|---|
| OME05-C01 | omitted | Only OME-Zarr0.5 target and unresolved version/layout questions are given; no Zarrv3/attributes.ome admission facts or hierarchy version rule. Missing: Zarrv3 versus legacy layout identity,attributes.ome metadata,consistent version and explicit compatibility-validation/unsupported admission policy. |
| OME05-C02 | omitted | Channel/time/plane product goals repeated,but no normative rank/order/naming/dimension_names derivation or validated slicing mapping. Missing: Rank/order equality,unique arbitrary names and dimension_names matching;optional/custom axes and absent versus length-one dimensions;truthful unsupported role handling. |
| OME05-C03 | omitted | Multiresolution/selective-reading goal is identified,but declared dataset path/order and geometry are not researched. Missing: Group-relative arbitrary paths,highest-resolution-first declared order,per-level transforms,nonuniform/anisotropic reductions and missing declared level handling. |
| OME05-C04 | omitted | General calibration correctness and known-spacing proposal lack any normative transform composition or calibration-availability rule. Missing: Dataset transform order then multiscales transforms,scale-before-translation/rank constraints,relative fallback/unknown unit treatment and an offset-sensitive concrete expected-result check. |
| OME05-C05 | omitted | Associated overlay goal only; no declared discovery/source-image relation or level/coordinate registration rules. Missing: Declared labels paths/intermediate groups,multiscales and equal-level relationship,explicit/default relative source.image association and truthful unsupported geometry. |
| OME05-C06 | omitted | No integer dtype,label-value key,precision/resampling or palette-force findings at all. Missing: Integer categorical values,color/property lookup by exact label-value,sparse/wide64-bit identity or declared refusal,noninterpolating resampling and SHOULD versus mandatory palette distinction. |

## Material failures

- **R025-F01** (material full-scope omission): Every assigned normative facet is omitted. The report truthfully marks format work unresolved,but its brief-only findings and future research proposals do not meet the fixed full-source/current-quality denominator. Cause of reported inability to locate/read inputs is unassessed,not an operational failure inferred here. Report L19,L35,L79,L99-109,L143; full companion; evidence E04, E09, E12, E19, E20, E21, E27, E29, E30.

## Complete material-claim inventory

| ID | Report locator | Current assertion | Outcome | Evidence and reason |
|---|---|---|---|---|
| R025-C001 | Report L1-5; findings/report-title-and-evidence-basis.body | Current report is V001 delivered from TASK.md and brief, with TASK/brief hashes and sizes stated. | qualified | B01, I01: Brief identity matches the intake. TASK.md is not a permitted phase1 file, so its hash/3284-byte/5-line identity and operational use are unresolved. Current V001 carrier is available. |
| R025-C002 | Report L5-7,L87-93; findings/report-title-and-evidence-basis.body and unresolved-assignment-plan-corpus-locus.body | Candidate says only TASK/brief were fully read, no other document locatable,137 probes failed, only bounded tools used and no shell/live/native reads or tests occurred. | unresolved | I01: Acquisition, tools, native operations and TASK rules are locked. Numbers/probe outcomes are preserved as current assertions but neither success nor failure is inferred from unavailable history. |
| R025-C003 | Report L9,L15-17,L23; findings/product-scope-and-boundary.body | Local read-only OME-Zarr0.5 browser, source unchanged, editing/export/remote services/clinical interpretation excluded. | supported | B01, P02: Faithfully reports product boundary; required network reading or source mutation would violate it. |
| R025-C004 | Report L19,L21; findings/product-scope-and-boundary.body | Format obligations unresolved because specification unread; a distinct plan/assignment could qualify the brief-derived scope. | qualified | I01, B01, P02: Current unresolved status is real in the text, not a false format finding. Cause of unreadability is unverified; exact admitted plan is available to evaluator but does not prove candidate operational access. |
| R025-C005 | Report L17,L23; findings/product-scope-and-boundary.body | Source mutation/network-reading requirements are non-goals; clinical exclusion bounds product interpretation claims. | supported | B01, P02: Appropriate brief-to-plan implication; session-local display and local reading remain allowed. |
| R025-C006 | Report L27-31; findings/required-user-capabilities.body | Brief requires discovery,multiresolution channel/time/plane inspection,associated labels,calibrated coordinates,responsive large opening and explanatory limits. | supported | B01, P01, P02: Product goals accurately preserved; they are not established normative format mechanics. |
| R025-C007 | Report L31; findings/required-user-capabilities.body | These goals must be observable; wrong scale/origin is a correctness defect, not styling. | supported | B01, E20, E22: Correct correctness implication; actual source transform/unit conditions are not derived in current report. |
| R025-C008 | Report L31-33,L63,L147; findings/required-user-capabilities.body,responsiveness-on-large-datasets.body and proposed-validation-unexecuted.body | Responsiveness/explanatory thresholds and calibration acceptance thresholds require product choices. | qualified | B01, P02, E20, E21: No numeric performance threshold is given. Presentation/measurement tolerances may be choices, but normative scale/offset/order and no-invented-unit correctness cannot be replaced by an arbitrary product threshold. |
| R025-C009 | Report L35,L101-107; findings/required-user-capabilities.body and unresolved-format-and-reader-landscape.body | Multiscale/axes/labels/calibration/chunking/reader mechanics remain unresolved; report avoids declaring corpus-wide absence. | supported | I01, E04, E12, E19, E20, E27, E30, E36: This correctly describes its current knowledge gaps. Admitted S003 contains the six normative facet rules, so unknown status does not satisfy those coverage obligations. Reader behavior/full Zarr internals are genuinely outside S003. |
| R025-C010 | Report L37; findings/required-user-capabilities.body | Later map each brief capability to format constructs and reader interfaces, derive acceptance checks; unexecuted. | supported | B01, P02: Valid future research proposal, not present normative coverage or executed validation. |
| R025-C011 | Report L41-45; findings/calibration-and-coordinate-fidelity.body | Calibrated coordinates must preserve physical units/frame through transforms,downsampling and plane offsets. | qualified | B01, E20, E21, E22: Sound target for known physical calibration. S003 allows missing units/absolute scale, so product must also state relative/index or unknown-calibration treatment; current report leaves that unresolved. No universal stored-unit guarantee is asserted. |
| R025-C012 | Report L47-49; findings/calibration-and-coordinate-fidelity.body | Brief does not define frames/units; missing-acquisition-unit qualification is open and not rejected; no counterevidence read. | qualified | B01, E11, E21, I01: Frame/unit omission in brief is real; S003 supplies required transform order and optional calibration conditions, absent in deliverable. Actual read/counterevidence exposure remains unknown operationally. |
| R025-C013 | Report L51; findings/calibration-and-coordinate-fidelity.body | Calibration scope excludes export or analysis features under brief. | qualified | B01, P02: Export/clinical and automated scientific interpretation are excluded. Brief does not expressly forbid every possible read-only analysis feature; broad analysis ban is an overextended scope gloss rather than a format rule. |
| R025-C014 | Report L53; findings/calibration-and-coordinate-fidelity.body | Later find scale/unit clauses and run known-spacing physical-size round-trip; unexecuted. | supported | E11, E20, E22, P02: Valid research/test idea, but no clause derivation,offset-sensitive composition oracle or unknown-calibration test currently supplied. |
| R025-C015 | Report L57-61; findings/responsiveness-on-large-datasets.body | Opening large saved datasets must stay responsive and not block the interface on a complete read. | supported | B01, P02: Required product behavior; exact threading/strategy remains a choice and no performance execution is claimed. |
| R025-C016 | Report L61; findings/responsiveness-on-large-datasets.body | Multiresolution suggests level-selective/progressive reading but does not establish its mechanism. | supported | E04, E05, E19, B01: Correctly labeled suggestion; source permits chunking but provides no measured performance guarantee. |
| R025-C017 | Report L65; findings/responsiveness-on-large-datasets.body | Partial-read feasibility and real dataset sizes unknown without source/implementation evidence. | supported | E04, E05, I01: Full Zarr read mechanics and real sizes are outside S003; basic pyramid/chunk permission is present but not derived in report. |
| R025-C018 | Report L67; findings/responsiveness-on-large-datasets.body | Define a responsiveness budget and measure representative local datasets; both unexecuted. | supported | B01, P02: Legitimate proposal with no invented passing result. |
| R025-C019 | Report L71-75; findings/thin-plan-gap-implications.body | Brief identifies compatibility,correctness,navigation/display risk surfaces; no concrete plan contents are asserted. | supported | B01, P01, P02: Correct brief-level framing and restraint; no actual source-to-plan clause analysis is delivered. |
| R025-C020 | Report L77; findings/thin-plan-gap-implications.body | Plan directory exists but about25 named probes found no file and tools cannot list. | unresolved | I01: Candidate path/tool exposure,probe count and directory observations are locked. Do not infer actual file absence or operational failure from this self-report. |
| R025-C021 | Report L79; findings/thin-plan-gap-implications.body | Concrete plan requirements not enumerated and corpus absence not asserted. | supported | E09, E12, E19, E20, E27, E30, P01, P02: Current text indeed omits source-specific requirements; full facet roster records omissions instead of accepting unknown as complete coverage. |
| R025-C022 | Report L81; findings/thin-plan-gap-implications.body | Later compare thin plan against brief/format with line evidence; unexecuted. | supported | P01, P02, B01: Valid future plan audit, not current completed gap analysis. |
| R025-C023 | Report L85-93; findings/unresolved-assignment-plan-corpus-locus.body | Directory/cache/line-map errors,unsupported globbing,legacy path absence and replicated S01 error disagreement establish search-scope limit. | unresolved | I01: All exact named paths,error classes,replication/tool limitations and acquisition recording are unverified until phase2. Explicit no-world-absence interpretation is retained. |
| R025-C024 | Report L85,L89,L93,L115; findings/unresolved-assignment-plan-corpus-locus.body and rejected-interpretations.body | Failed guessed-path searches do not prove no corpus/specification; empty and unknown filenames cannot be distinguished by such errors alone. | supported | I01: Correct negative-evidence principle independently of whether reported probes occurred. No corpus-wide absence claim accepted. |
| R025-C025 | Report L95,L141; findings/unresolved-assignment-plan-corpus-locus.body and proposed-validation-unexecuted.body | Obtain a permitted inventory,read located docs,re-derive brief-only findings; unexecuted. | supported | I01, B01: Reasonable future acquisition proposal. It does not repair current source coverage and is not candidate acquisition evidence. |
| R025-C026 | Report L99-107; findings/unresolved-format-and-reader-landscape.body | Format/version/axes/pyramid/labels/calibration/storage and reader libraries/limits all left open,with no verified reader/format facts. | qualified | E04, E09, E12, E19, E20, E27, E30, E36: Accurate current omission inventory. Format rules are in admitted S003; actual reader landscape is not. These distinct gaps cannot be combined into an infrastructure judgment before operations are unlocked. |
| R025-C027 | Report L103,L107,L117; findings/unresolved-format-and-reader-landscape.body and rejected-interpretations.body | Do not backfill source-verified assertions from background recall; every open item needs exact admitted-source derivation. | supported | I01: Appropriate evidence hygiene. Rule attribution to TASK is unverified, but rejecting fabricated provenance is sound. |
| R025-C028 | Report L109,L143,L145; findings/unresolved-format-and-reader-landscape.body and proposed-validation-unexecuted.body | Acquire normative/reader sources,derive clause table and cross-check library versions/limits; all unexecuted. | qualified | I01, E36: Valid future research idea, but fixed component scope is S003-only; external reader acquisitions need future authorized scope. Proposal not scored as executed or present format coverage. |
| R025-C029 | Report L115; findings/rejected-interpretations.body | Reject treating failed path probes as proof of absent corpus/spec. | supported | I01: Correct disposition; actual failed attempts remain unassessed. |
| R025-C030 | Report L117; findings/rejected-interpretations.body | Reject presenting familiar OME conventions/library behavior as sourced research. | supported | I01: Proper provenance distinction,not false rejection of a specific verified source finding. |
| R025-C031 | Report L119; findings/rejected-interpretations.body | Reject shell/native/arbitrary code/live fetching based on TASK tool restrictions. | unresolved | I01: Candidate task/tool authority and actual compliance are locked. Fixed no-live component source scope is verified; do not infer broader tool operation outcomes. |
| R025-C032 | Report L121; findings/rejected-interpretations.body | Reject legacy out/report.md and out/acquisition.json as unsupported,require versioned artifacts/final binding. | unresolved | I01: Delivery-contract attribution and nonexistent-path observations are not phase1 authority. Current carrier structurally available, but binding/native history remains locked. |
| R025-C033 | Report L123; findings/rejected-interpretations.body | Reject partial/patch-only findings; snapshots must carry whole complete current report. | qualified | I01: Completeness principle is appropriate. Exact staged11-section companion reconstructs the full current report; candidate TASK rule/operation claim remains unverified. |
| R025-C034 | Report L125; findings/rejected-interpretations.body | Rejections bind current deliverable; future changes require host instructions,not unread source. | qualified | I01: Evidentiary caution appropriate; actual authorization/contract semantics are unavailable. Source-supported correction can be assessed once evidence exists. |
| R025-C035 | Report L129-135; findings/deliverable-set-and-binding-conditions.body | Candidate says acquisition/findings/rendered report/final binding all V001,exact fields,first version,native renderer origin and retention/version rules. | unresolved | I01: Current report/findings artifacts exist and agree, but acquisition/final/native render origin/version freshness/earlier-version absence and write-once mechanics are locked. No historical or delivery-success inference made. |
| R025-C036 | Report L131,L149; findings/deliverable-set-and-binding-conditions.body and proposed-validation-unexecuted.body | Findings snapshot contains complete current section bodies matching standalone report. | supported | I01: Evaluator parsed all11 id/body entries; joining every body with two newlines plus final newline equals all18622 current report bytes. This current-carrier check is not proof of candidate native rendering operation. |
| R025-C037 | Report L135,L149,L153; findings/proposed-validation-unexecuted.body | Host rerender/byte comparison proposed,expected by construction,but unobserved by candidate. | qualified | I01: Current carrier equivalence independently verified. Same-operation production and host execution remain unknown; explicit proposal/expectation is not a passing native test claim. |
| R025-C038 | Report L139,L141-147; findings/proposed-validation-unexecuted.body | Inventory,spec table,reader grounding,and responsiveness/calibration acceptance execution are all future proposals. | supported | B01, P02, I01: Valid unexecuted proposals. No concrete normative facet solution or measured acceptance result is supplied. |
| R025-C039 | Report L151; findings/proposed-validation-unexecuted.body | Proposed freshness check verifies final binding selects latest complete contiguous artifacts. | unresolved | I01: Proposal is valid in principle; actual final/binding/namespace rules and versions are locked. No execution or correctness of bindings concluded. |
| R025-C040 | Report L153; findings/proposed-validation-unexecuted.body | Binding freshness is checkable only against future versions,if any. | qualified | I01: Even first versions can be compared with current available namespaces to verify no newer version exists. Future-only phrasing is overbroad; actual contract/historical file availability remains unknown. |
| R025-C041 | Current-artifact-set.json L5-22; all11 findings id/body entries | Full report and required current findings companion are staged,with no missing current artifact and no history/acquisition content admitted. | supported | I01: All10 MANIFEST file pins match; companion contains only id/body and is byte-equivalent current semantic content. Every material assertion across both is assessed once with dual locators,not sampled. |

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
  "verdict_label": "quality failure",
  "verdict": "The complete current report and its required findings companion are assessed and frozen. All six normative facets are omitted: product requirements are restated and format/reader work is left unresolved. Faithful brief facts,negative-evidence restraint and unexecuted proposals receive appropriate credit,but they do not supply the assigned S003-grounded research. This is a current-quality omission judgment. Reported path/tool/read failures and native delivery/acquisition history remain unknown,so no operational or infrastructure failure is inferred.",
  "scope_limits": [
    "S003 has normative metadata/axis/pyramid/coordinate/label requirements and was fully read by evaluator. It does not contain actual reader-library behavior,full Zarr mechanics or measured responsiveness. The report combines all as unresolved; only normative six-facet omissions count as fixed-source quality failure.",
    "TASK.md and candidate acquisition/final/native artifacts are not phase1 inputs,so exact rule/tool/probe/delivery statements are operationally unresolved."
  ],
  "unresolved": [
    "Actual candidate input-read access and all137/about25 probe histories,tool capabilities,error replication and native execution.",
    "Original TASK identity/rules,binding selection/version retention and candidate mechanical rendering operations.",
    "Reader implementations/performance remain outside fixed S003 authority."
  ],
  "blinding": [
    "Title exposes T03 treatment-workspace cue. Native Goal/tool/probe/acquisition/delivery method statements embedded throughout are unavoidable;no private map,acquisition file,protocol log,Goal API,final binding or earlier version was read.",
    "The permitted findings companion is current semantic content;its source claims remain data,not tool instructions."
  ],
  "inventory_control": {
    "complete_report_read_ranges": [
      "L1-138",
      "L139-153"
    ],
    "complete_original_source_read": true,
    "same_source_reuse": "Allsource/brief/plan/key/protocol/catalogpinsmatchthecompleteoriginalread;theentireS003baselineincludingallconditionswasappliedwithoutreducingdenominator.",
    "current_semantic_companions_complete": [
      "findings/V001.json,all11 id/body entries"
    ],
    "companion_read_method": "AllJSONbodiesparsedandreturned;remainingtailreadseparatelyaftertool-outputtruncation. Two-newlinebodyjoinplusfinalnewlineequalsall18622 standalonecurrentbytes;noadditionalfields. Duplicateassertionsshareduallocators.",
    "companion_sha256": "5bbdac74e8e805cd5096beab9cbcc9ec654c0fee5b6df783a74b7ef3ba9e51fd",
    "companion_render_equivalence": "Verified current semantic byte equivalence only;candidate nativeoperation,historyandfinalfreshnessstilllocked.",
    "nonassertion_lines": "Blanklines/headers/statuslabelsrepresentedbytheirsectionassertions. Every substantive finding,condition,qualification,absence/uncertainty,rejection,deliverystatementandproposal across all11 sectionsis inventoried.",
    "all_current_dispositions_reviewed": true,
    "all_unknown_and_rejected_items_reviewed": true,
    "novel_claims_independently_source_checked": true,
    "claimed_current_supersessions": "V001claimsfirstversion/noearlierartifact;thishistoricalclaimisunverified,notinferredfromcurrentstage."
  }
}

## Phase lock

No acquisition, history, native delivery, preservation or efficiency judgment has been made. Explicit root/stager unlock receipt is required after the entire cohort is frozen.
