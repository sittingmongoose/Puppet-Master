# R027 — frozen current assessment

Verdict: **quality failure**. Complete review: **true**. Report SHA-256: `0b3bae06289381e6766f64826b8b05f6fd7d89f46d6fb1b9fe2482fe73025bde`.

The entire 596-line current report and required 15,133-byte decisions companion are assessed, including all twelve decisions, complete reasons and A001. Version admission and declared pyramid scope are covered fully, and many metadata findings are sound. Material current errors remain in reader force, label presentation/version, coordinate equation, unknown calibration, numeric-window invalidity and original-image label association. Four facets remain partial. The companion provides no replacements and confirms these current errors rather than repairing them. Current quality therefore fails full-scope assessment; no candidate acquisition, preservation, native or efficiency failure is inferred.

All six assigned facets and every material assertion family were assessed against the complete 896-line S003 capture. Review completeness does not imply full candidate coverage. Candidate history, operational exposure, preservation, native delivery and cost remain locked.

## Facet roster

| Facet | Coverage | Reason / missing scope |
|---|---|---|
| OME05-C01 | full | Explicit v3, attributes.ome and hierarchy-consistent string 0.5 admission, with caveated best-effort/refusal for other versions. Missing:  |
| OME05-C02 | partial | Rank, order, unique arbitrary names and dimension_names are validated; absent axes hide controls and unknown roles are labeled. Present singleton versus absent image-axis behavior is missing. Missing: Explicit singleton-versus-absent image-axis slicing and control behavior.; Unknown/custom positional role inference must remain caveated rather than treated as validated semantic identity. |
| OME05-C03 | full | Arbitrary declared group-relative paths, metadata order, per-level geometry and missing/unavailable/malformed level feedback are supplied. No fixed numeric-name or uniform downsampling rule is imposed. Voxel-count sanity check is a heuristic, not source authority. Missing:  |
| OME05-C04 | partial | Ordered level-then-group and scale-then-translation prose is correct, but the displayed equation reverses each inner chain. Unit absence falsely proves relative scaling. Missing: A correct unambiguous ordered computation and numeric offset-bearing expected result that detects reversal.; Preserve unknown scale/unit semantics without automatic relative-factor classification or invented channel-calibration prohibition. |
| OME05-C05 | partial | Declared paths, intermediates, dtype/count, own geometry and broadcast checks are covered. The report explicitly demotes source.image to provenance instead of original-image association before overlay. Missing: Resolve explicit/default relative source.image from the label image group and validate intended original identity before overlay, or visibly refuse the association.; Geometry warnings alone must not imply alignment or correct source attachment. |
| OME05-C06 | partial | Integer dtype, keyed colors/properties, categorical nearest-neighbor and color SHOULD are correctly retained. Exact wide-integer decode and lookup policy is absent. Missing: Exact sparse/wide integer decode, preservation and lookup, or explicit supported range/refusal including values above binary64 exact-integer range.; Order-independent sparse-ID and wide-ID expected checks. |

## Material failures

- **R027-F01** (reader force invented): Required omero file fields are promoted into universal mandatory initial rendering; writer metadata SHOULDs are repeatedly promoted to reader display mandates. Report L174-178,L254-260,L389,L398-403; companion U005-U007; evidence E02, E22, E25, E32, E33, E35.

- **R027-F02** (unsupported label presentation prohibition): Labels-group-not-an-image is extended into MUST NOT list contained label images as primary images. Source does not prohibit such presentation. Report L120,L429-431; companion U004,U007; evidence E27, E28.

- **R027-F03** (contradicted coordinate equation): Written scale∘translate reverses scale-then-translation inside both chains under standard notation, despite correct surrounding prose. Scale-only example cannot detect the error. Report L294,L297-299,L544-545; companion U005,U011; evidence E17, E20, E22.

- **R027-F04** (association demoted): Treating source.image only as provenance omits intended original-image validation before an associated overlay. Matching geometry is insufficient. Report L350,L355,L546-548; companion U005,U007,U011; evidence E26, E30.

- **R027-F05** (optional key force upgraded): Image-label version-key presence is SHOULD; report makes it MUST. MUST governs string type when supplied. Report L348-349; companion U005,U006; evidence E28.

- **R027-F06** (calibration semantics invented): No unit does not prove relative scale, and source does not forbid every meaningful physical channel scale. Report L308-312; companion U005,U009; evidence E11, E20, E21.

- **R027-F07** (unproved malformed classification): Numeric windows outside dtype range or with start greater than end are called malformed despite acknowledged absence of such a normative rule. Report L266-268,L493-494; companion U005,U008; evidence E25.

- **R027-F08** (unsupported private-store rule): Specification-key camelCase recommendation is extended to viewer-private session-store keys. Report L402-403; companion U006; evidence E39.

- **R027-F09** (unsupported blanket confirmation): Companion marks every U section supported, gives no replacements, and A001 claims none needs amendment despite present source-force, math and association errors. Actual verification operations remain unknown. Report L584-588; decisions/V001.json all twelve decisions and A001; evidence I01, E25, E28, E30, E39.

- **R027-F10** (material coverage gaps): Four facets remain partial: singleton axes, unambiguous offset-sensitive calibration, original-image label association and exact wide categorical identity. Report Facet roster; L542-548; evidence E12, E20, E21, E27, E29, E30.

## Complete material-claim inventory

| ID | Report locator | Current assertion | Outcome | Evidence and reason |
|---|---|---|---|---|
| R027-C001 | L7-17 | Fixed case, 896-line S003 /0.5/ capture, full brief and thin plan are identified; two groups organize the whole requested scope. | qualified | E01, I01, B01, P01: Admitted source and scope identities match. Task-card and seed metadata are unavoidable current cues, not independent phase-1 authority. Two-group organization is valid but does not establish assignment history. |
| R027-C002 | L18-21 | Every MUST/SHOULD/MAY in the report is the source’s own; obligation, recommendation, option and product decision are distinguished. | contradicted | E02, E23, E25, E28, E30, E38: The vocabulary is useful, but label-listing, image-label version presence, reader rendering and private-store naming below exceed source force. The blanket source-own claim is false for current substantive assertions. |
| R027-C003 | L10-11, L532-534, L584-592 | No fetch/code/test/input writes; full fresh source/brief/plan/seed/TASK reads, probe failures, seed verification and acquisition records are claimed. | unresolved | I01: Acquisition, seed, TASK, tools and history remain locked. Current hashes do not establish candidate operations. These statements are not negative operational findings. |
| R027-C004 | L31-35,L43-49 | S003 fully determines the on-disk contract; referenced Zarr features and actual reader behavior remain unbounded or unevidenced. | qualified | E04, E05, E17, E36: Detailed OME metadata rules are captured, but complete Zarr-v3 mechanics and binary transform encoding are referenced rather than fully specified. The later source-gap caveats receive credit. |
| R027-C005 | L35-42 | The plan’s core is compatible, but detailed discovery, axes, transforms, defaults, labels and metadata validation need refinement. | qualified | B01, P01, P02, E09, E12, E19, E20, E27: Core fit and many refinements are supported. Optional metadata and recommendations do not automatically impose every proposed display obligation; disputed refinements are assessed separately. |
| R027-C006 | L43-45,L59-62 | Zarr-v3 features are allowed unless disallowed; no disallowance anywhere, so backend unsupported inputs need graceful feedback. | qualified | E04, E05, E18, E27, P02: No particular codec/grid profile is imposed. Blanket absence of restrictions must preserve image-rank/order and integer-label constraints. Feature permission is not universal reader support. |
| R027-C007 | L63-65,L109-111,L392-393,L447-450 | Local reading, unchanged files, session-local settings and explicit non-goals are compatible product boundaries. | supported | E06, E02, B01, P02: Storage location is general, but this brief narrows capability. No obligatory writeback follows from the format; read-only remains an explicit product requirement. |
| R027-C008 | L66-69,L76-78,L132-135,L467-474 | Read zarr.json attributes.ome and string version; consistency gates the hierarchy; only 0.5 is in contract, others visibly best-effort or rejected. | supported | E01, E09, B01, P02: Explicit layout/version admission and truthful unsupported or malformed feedback are provided. A best-effort open must retain its caveat rather than claim verified conformance. |
| R027-C009 | L70-75 | Transitional readers MUST/SHOULD read data, writers usually MAY; examples and notes excepted, JSON comments forbidden. | qualified | E02, E03, E38: JSON/comment and example exceptions are accurate. Source says implementations may be expected or encouraged to support reading, not a blanket mandate to implement every transitional feature. |
| R027-C010 | L79-83 | Read exact legacy exception spellings rather than normalize them to camelCase. | supported | E39, E29, E32, E33: Specification naming recommendation does not alter literal field_count, label-value, maximumfieldcount, timestamps or namespaced layout keys. |
| R027-C011 | L95-99 | Images are groups and pyramid levels are independently described Zarr arrays; Zarr-v3 decoding is a feature dependency. | supported | E04, E07, E19: Correct node/metadata/chunk relationship. Reader capability may be bounded with an explicit explanation. |
| R027-C012 | L100-108 | Distinguish plain image, HCS and bioformats2raw structures; plate takes precedence, then collection/image recognition, with ambiguity feedback. | supported | E07, E08, E13, E14, E15, P01: The structures and plate precedence are source-backed; the sniffing algorithm is a sound product proposal rather than the only universally mandated algorithm. |
| R027-C013 | L117,L136-139,L186,L415,L492 | Name/first fallback is the only stated deterministic rule and a required addition, though its force is uncertain and adopted as an assumption. | qualified | E23, E38: Adoption as an explicit product policy is valid. The source also suggests choosing by chunk size; illustrative selection advice does not establish an exclusive mandatory fallback or universal picker design. |
| R027-C014 | L118,L145-150 | Enumerate plate wells and their consistent row/column indices, well fields and acquisition identities; list every physical row/column even in sparse plates. | supported | E08, E32, E33, E34, E35: Correct paths, hierarchy and conditional acquisition rules. A tree or qualified flat list can preserve identity. |
| R027-C015 | L118 | The plan’s flat listing cannot express plate/well/acquisition identity. | qualified | P01, P02, E33, E35: The plan leaves identity details unspecified; it does not prove a flat implementation incapable of qualified identities. The report appropriately leaves UI chrome as a product decision. |
| R027-C016 | L119,L387-388,L540-541 | bioformats2raw value 3, optional series string paths/XML order, numbered fallback only without series/plate, optional recommended XML with MetadataOnly, and plate precedence. | qualified | E14, E15, E16: Conditions are mostly accurate and useful. The quoted value does not prove string-only JSON typing. XML is recommended, with OME-XML/MetadataOnly constraints when supplied. |
| R027-C017 | L119,L124-127,L397 | Awareness of multiple images is SHOULD; showing all/choice/series use are MAY; plan acceptance treats awareness as required. | qualified | E16, P02: Source force is quoted correctly in the recommendation paragraph, and stronger declared product acceptance is allowed. Minimum conforming behavior must not be restated as an unconditional MUST from a SHOULD. |
| R027-C018 | L120,L429-431 | Label contents MUST NOT appear as primary images; exclude label subtrees and expose them only as overlays. | unsupported | E27, E28, P01: The labels group is not an image, but it explicitly contains label images implementing multiscales. The source does not prohibit standalone or primary-list presentation. Overlay-only listing is a product policy. |
| R027-C019 | L128-131 | Alphanumeric unique case-sensitive row/column/field names must be resolved without case folding. | supported | E33, E35: Correct source identity constraints and sound path-resolution implication; avoiding case-insensitive collisions is a recommendation rather than a new case-folding rule. |
| R027-C020 | L139-141 | Rows have no metadata section, so scanning directories alone is always non-conforming discovery. | qualified | E08, E33: Plate/well declarations determine valid relationships. The source does not prohibit directory scanning to discover candidates followed by validation; it constrains the resulting metadata, not every internal algorithm. |
| R027-C021 | L145-153 | IDs unique nonnegative integers; acquisition name/maxfieldcount and plate hints recommended; optional description/timestamps typed; identify fields by well/acquisition/path. | supported | E32, E33, E35: Correct presence and type conditions. Tuple identity is useful engineering design; count hints do not replace actual field enumeration. |
| R027-C022 | L151-153,L174-178,L398-403 | Source SHOULD fields imply that pyramid/plate/acquisition/well metadata should be surfaced in the viewer. | qualified | E22, E32, E33, E35: Source SHOULD mainly recommends file-field presence and types, rather than universal reader UI display. Surfacing available hints is a valid product recommendation if identified as such. |
| R027-C023 | L154-157,L499-500 | Require field acquisition only when plate.acquisitions has more than one entry; honor supplied IDs and reject dangling references. | qualified | E32, E35: Dangling-reference validation is source-backed. The actual trigger is multiple acquisitions performed; list length is a disclosed heuristic and cannot redefine normative validity in ambiguous or incomplete metadata. |
| R027-C024 | L163-173,L381,L439-440 | Resolve arbitrary group-relative datasets paths in declared highest-resolution-to-smallest order, with rank/order/axes and dimension_names checks. | supported | E07, E12, E18, E19, E20: Metadata, not numeric folder names or lexicographic order, controls level identity. Per-level mismatches receive explicit skip/refusal feedback rather than silent remapping. |
| R027-C025 | L180-187 | Keep view-level selection and pan/zoom; add declared traversal, calibration, multiple-pyramid policy and per-level undecodable feedback. | qualified | P01, P02, E19, E20, E22, E23: Most refinements follow correctness and responsiveness. A specific first-fallback picker remains policy. Missing/undecodable levels are explicitly item-scoped; no whole-image crash is assumed. |
| R027-C026 | L188-190,L487 | Largest-to-smallest has no metric; use total voxel count as a sanity check without reordering. | qualified | E19, E20: Source gives highest-resolution as the meaning of largest, although no scalar metric is fixed. Total voxel count can misclassify anisotropic/nonuniform data; it is a disclosed heuristic, not a conformance oracle. |
| R027-C027 | L194-199,L441-442 | Chunked multi-GB-capable arrays indirectly require background/cancellation architecture and responsive navigation. | qualified | E04, E05, E07, B01, P02: Responsiveness and cancellation are product requirements. Multi-GB size and architecture necessity are engineering inferences, not measured source or reader-implementation facts; mechanism remains a product decision. |
| R027-C028 | L200-208,L443-444,L467-474 | Malformed metadata, missing declared paths, transforms, HCS references and label violations are separated from undecodable backend features, with item feedback and alternatives. | qualified | E09, E12, E14, E18, E19, E20, E27, E28, E33, E35, P02: This is substantial correct refinement. Numeric window restrictions and optional label-version existence elsewhere are not proven malformed-input rules. A capability limit must keep its own classification. |
| R027-C029 | L220-245,L378-380 | Rank 2–5, two/three space axes, optional time and channel/null/custom, ordering, unique arbitrary names and array dimension_names determine identity. | supported | E10, E12, E18, E37: Correct mandatory identity conditions and array-level dimension_names placement; history wording does not justify a second compulsory axes field. |
| R027-C030 | L226-230,L272-274 | Controls follow declared axes; absent time/channel and two-space images hide irrelevant controls; plane uses two innermost spatial axes. | qualified | E10, E18, P01: Axis-driven controls are sound. The source only recommends a stated anisotropic zyx case, so fixed innermost-plane orientation is product policy. Present singleton versus absent image-axis slicing remains unspecified. |
| R027-C031 | L233-243,L465-466 | Missing/null/custom types and unknown units must be tolerated, with literal unknown-unit caveat and labeled positional inference. | qualified | E10, E11, E18, P02: Optional metadata and custom types do not universally mandate that every reader render them; explicit capability refusal is permitted and appears later. Positional inference cannot establish validated semantic roles or physical calibration. |
| R027-C032 | L249-253 | Omero is optional; if supplied channels, six-hex color and min/max/start/end windows are required; active/coefficient/rdefs etc appear in an example. | supported | E24, E25: Correct conditional field contract. Example-only fields are not guaranteed requirements. |
| R027-C033 | L254-260,L389 | Required file color/window fields impose mandatory initial color/contrast rendering; example defaults used best-effort. | unsupported | E02, E24, E25: Required metadata fields constrain the file. They do not alone impose this precise universal reader initialization or contrast formula. Declared product defaults are legitimate, but the MUST rendering attribution is unsupported. |
| R027-C034 | L262-265,L269-271,L493-494 | Channel-list size equality is comment-only; explicit overlap/default degradation, absent-omero fallback and best-effort rdefs are product choices. | supported | E24, E25, P01: Correct separation of example comments from normative size rules; disclosed fallback avoids invented guaranteed defaults. |
| R027-C035 | L266-268 | No out-of-range/window semantics are specified, but out-of-dtype values and start greater than end are malformed input. | unsupported | E25: The report acknowledges the absent rule then invents one. Malformed six-digit color or missing required fields is distinct from an unsupported numeric display policy. |
| R027-C036 | L281-283 | Ordered transforms applied sequentially; identity default, scale/translation with inline vectors or binary path. | supported | E17: Correct general vocabulary and order. Image-specific lists have stricter scale/translation conditions. |
| R027-C037 | L284-290,L317-319,L382-383 | Exactly one scale, optional one following translation, axis-length vectors, physical scaling or relative fallback when unavailable/inapplicable. | supported | E20, E21: Correct conditional scale semantics and malformed transform constraints. The optional group chain follows these same restrictions. |
| R027-C038 | L291-296,L490 | Group transforms are applied after dataset transforms; applying dataset alone omits shared calibration. | supported | E17, E20, E22: Correct outer-after-inner prose. A global identity or untouched axis need not change its coordinates; the worked time scale shows the practical dependency. |
| R027-C039 | L294 | Physical coordinate is global(scale∘translate) ∘ perLevel(scale∘translate), applied in listed order. | contradicted | E17, E20, E22: Standard function composition applies translate before scale in each written chain, opposite to the mandated scale-then-translation list. Correct prose does not remove the material equation conflict; an explicit numeric ordered algorithm is needed. |
| R027-C040 | L297-299 | The worked calibration example is normative; level spatial scales 0.5/1/2 and shared 0.1 time scale give the shown voxel sizes. | qualified | E20, E22, E38: Numerical values and scale-only composition are correct, but examples are explicitly non-normative. Commuting scale-only values cannot expose reversed scale/translation order. |
| R027-C041 | L300-306,L437-438 | Display per-axis names/extents/units and the currently displayed level’s composed coordinates, calibration, path and pyramid identity. | supported | E10, E11, E19, E20, E22, P01: Useful source-grounded derived display policy consistent with the brief; private panel layout is not itself a normative format requirement. |
| R027-C042 | L308-312,L488-489 | Without unit, a scale necessarily is relative; channel axes never have meaningful physical scale. | unsupported | E11, E20, E21: Unit absence does not prove relative versus unknown physical scale, and no categorical channel-calibration prohibition is stated. Retain unknown semantics without inventing a unit or a definitive relative interpretation. |
| R027-C043 | L313-314 | Treat an undefined origin as the image-group frame and disclose that assumption. | qualified | E20, E22: A disclosed local-frame policy is acceptable; it does not add an unstated absolute world origin or settle every association/calibration ambiguity. |
| R027-C044 | L315-316,L465,L501 | Binary vector path encoding lacks full representation details; it is supported only if backend resolves it, otherwise named unsupported input. | supported | E17, E05, P02: Valid path-form transforms are not format-invalid. This is an honest capability boundary rather than a fabricated source acquisition failure. |
| R027-C045 | L323-330 | Resolve declared arbitrary label paths through metadata-free intermediate groups; complete listing SHOULD, optional scanning policy disclosed. | supported | E27: Correct discovery and intermediate-group rules. A justified ignore/scan policy for SHOULD-unlisted labels does not imply all listed labels may be silently skipped. |
| R027-C046 | L331-335,L390-391 | Label images require multiscales, same level count as original, and specified signed/unsigned integer dtypes through 64 bits. | supported | E27, E28: Correct conditional label contract and per-overlay failure context. Dtype admission alone does not prove exact decode/lookup of all 64-bit values. |
| R027-C047 | L336-342,L495-496 | Use corresponding levels, singleton-axis broadcast and own transforms checked against parent; warn on mismatches rather than stretch. | qualified | E07, E26, E28, E30: Geometry checks are useful. Usually qualifies dimensions/transforms, not an automatic exemption from same coordinate-system association. Equal level count and warnings do not validate the intended original-image reference. |
| R027-C048 | L342-345 | Preserve categorical integer labels with nearest-neighbor rather than intensity interpolation. | supported | E27, E29: Sound explicit engineering inference from categorical identities. Sparse/wide ID lookup and supported numeric range remain unaddressed. |
| R027-C049 | L346-350 | Image-label object recommended; colors and version with typed keys; version string MUST be present. | qualified | E28, E29, E30: Object and colors/version inclusion are SHOULD. The MUSTs govern colors-array and version-string types if present. Mandatory version-key existence is a force upgrade. |
| R027-C050 | L347,L349,L351-355 | Color entries and properties keyed by integer label-value; optional rgba alpha, arbitrary extra keys, recommended color use, fallback palette/legend policy. | supported | E29, E30, E31: Correct keyed metadata and source color recommendation. No array-position palette or mandatory fallback is inferred; exact wide-integer preservation still needs a range/decode policy. |
| R027-C051 | L350,L355 | Source.image relative reference defaults ../../ but is followed only for provenance, never to relocate an overlay. | unsupported | E26, E30, B01: The reference identifies the original image. Resolve and validate it from the label-image location before associating an overlay, or visibly decline the unsupported association. Same geometry cannot prove intended image identity. |
| R027-C052 | L356-363,L435-436 | Extend label discovery/validation/alignment/rendering/messages; accept any string label version and use own geometry with parent comparison. | qualified | E27, E28, E30, P01, P02: The refinements are useful. A string-type vocabulary gap does not guarantee all future semantic versions readable. Required association is still omitted, and palette/legend display remains a product choice. |
| R027-C053 | L375-393 | MUST inventory restates container, namespace, axes, levels, composition, HCS/collection, omero, labels and unchanged files. | qualified | E04, E09, E12, E18, E19, E20, E22, E25, E27, E28, E33, E35, B01: Most source conditions are correct, but item 8 makes reader rendering obligatory from conditional metadata fields. Product read-only scope is correctly attributed to brief/plan. |
| R027-C054 | L395-403 | SHOULD inventory includes multiplicity, zyx, units, displayed metadata, XML, label colors, empty groups and private session-store camelCase. | qualified | E11, E15, E16, E18, E22, E29, E32, E33, E35, E39: Several source SHOULDs concern writer field presence rather than reader display. The private-store naming rule is not in S003. Recommended colors and multiplicity force are correctly retained. |
| R027-C055 | L402-403 | New viewer-private session keys SHOULD use camelCase under S003 naming conventions. | unsupported | E39: The source limits this recommendation to keys in the specification. A private product naming convention may be inspired by it but is not a source obligation. |
| R027-C056 | L405-411 | Optional omero, collection choices, global transforms, label metadata, acquisitions, custom types and backend features are product-controlled. | supported | E04, E10, E15, E16, E22, E25, E30, E32: Accurate conditional/optional inventory; once optional fields are supplied their specified types and relationships still apply. |
| R027-C057 | L413-419 | UI chrome, level heuristic, caching/cancellation, absent defaults, fallback palette, scan policy, capability/refusal and performance budgets need explicit product review. | supported | B01, P01, P02, E05, E23, E25, E30: These choices are substantially unstated by format and fit the plan’s explicit capability-review boundary. They must preserve truthful calibration and association. |
| R027-C058 | L429-432 | Extend opening/discovery and keep pan/zoom conditioned on calibrated levels. | qualified | P01, E07, E08, E14, E19, E20, E27: Hierarchy/version/discovery/calibration refinement is supported. Mandatory label-subtree exclusion is an unsupported source-attributed policy. |
| R027-C059 | L433-438 | Extend axis controls, omero-aware initialization, label support and composed details. | qualified | P01, E10, E20, E22, E24, E25, E27, E30: Useful changes are justified as product/correctness refinements. Universal omero initialization, optional metadata display and provenance-only label association cannot be validated by this blanket disposition. |
| R027-C060 | L439-444 | Keep/constrain level choice to metadata authority and explicit heuristic; keep responsive cancellation and extend named failures. | qualified | P01, P02, E19, E20: Metadata authority and product responsiveness are sound. Source data scale does not mandate one architecture, and the malformed catalog must exclude invented numeric-window/optional-key rules. |
| R027-C061 | L447-453 | Keep non-goals/read-only and raise acceptance to the extended behaviors, all source-derived. | qualified | B01, P02, E25, E28, E30: Keep dispositions are correct. The raised product bar may be valid, but not every extended behavior is a source obligation and association/categorical/calibration gaps remain. |
| R027-C062 | L461-474 | Valid but undisplayable backend/path/custom metadata, malformed source structures and product-out-of-scope inputs receive item-scoped explanations. | qualified | E01, E05, E06, E09, E17, E18, E19, E20, E25, E27, E28, E33, E35, B01, P02: The three-way distinction is strong. OME-XML beyond MetadataOnly correspondence is an extra product choice, not an explicit brief non-goal. An image-label version omission and unproved numeric windows cannot become format violations. |
| R027-C063 | L484-485 | Normative array dimension_names wording conflicts with history; follow array placement; validator behavior unresolved. | supported | E12, E37: Correct source adjudication and honest external validator uncertainty. |
| R027-C064 | L486 | Null/custom allowance versus type-string recommendation motivates lenient reading. | qualified | E10, E18: Textual tension is visible, but a SHOULD string is not a MUST-string contradiction. Lenient typed-axis policy is valid if uncertain roles stay labeled. |
| R027-C065 | L487 | No ordering metric is stated and voxel-count check is adopted without reordering. | qualified | E19: Highest-resolution gloss is present; no scalar metric is fixed. A disclosed check may not certify source violations. |
| R027-C066 | L488-489 | Scale 1 is ambiguous without physical context; pair units and assume disclosed image-group origin. | qualified | E11, E20, E21: The ambiguity and origin limits are real. Unit absence cannot settle relative versus unknown physical scaling; definitive classification elsewhere is unsupported. |
| R027-C067 | L490-491 | Global is outer after per-level; source’s worked shared calibration is scale-only/time. | supported | E20, E22: Correct limitation and prose. No translation-bearing expected output is supplied to resolve the conflicting equation. |
| R027-C068 | L492 | Keyword-free multiscale fallback is implemented as the only stated rule. | qualified | E23, E38: Declared policy is permitted; absence of RFC keywords alone does not make all prose informative. Pseudocode’s alternative chunk-size choice defeats exclusivity. |
| R027-C069 | L493-494 | List length is comment-only; rdefs example-only; window semantics/out-of-range rule absent. | supported | E24, E25: Correct source uncertainty, which directly conflicts with the earlier automatic malformed numeric-window classification. |
| R027-C070 | L495-496 | Usually/alignment and overview broadcasting leave parent/label transform precedence unresolved. | qualified | E07, E26, E28, E30: Qualifiers and illustration are acknowledged. Label own multiscales geometry and source identity still require validation; usually does not erase same-coordinate-system meaning. |
| R027-C071 | L497-498 | Label/plate/well version vocabularies unspecified; accept and display strings. | qualified | E28, E33, E35: Vocabulary gap is real. Acceptance is a capability policy; field-presence force differs: plate required, well/image-label recommended. |
| R027-C072 | L499-500 | Layout value meaning unexplained; value 3 accepted; multiple-acquisition trigger implemented as greater-than-one entry. | qualified | E14, E32, E35: Literal value condition is clear despite missing historical rationale. Performed-acquisition trigger remains distinct from a metadata list-length heuristic. |
| R027-C073 | L501 | Binary path lacks representation rules and is declined as unsupported. | supported | E17, E05: Honest valid-format capability limit, not a source violation. |
| R027-C074 | L502-503 | Field-count versus maximumfieldcount semantics overlap; display hints only; duplicated by-the wording immaterial. | qualified | E32, E33: Correctly avoids enumeration by maxima. Plate-wide versus per-acquisition hints are not proven interchangeable; typo has no material force. |
| R027-C075 | L504-506 | Zarr profile unrestricted by reference; no actual reader tolerance, distribution or performance evidence; Tools pointer supplies no implementation requirements. | supported | E04, E05, E36: Correct source-limited evidence gap. Format does contain reader recommendations, but no empirical implementation catalog or execution behavior. |
| R027-C076 | L514-524 | Actual reader-interoperability goal cannot be met from S003 alone; future real filesets/code needed, without inventing implementation requirements or incompatibility. | supported | B01, P02, E36: Correct scope limitation. Actual no-fetch authorization and probeable corpus operations remain unknown; known evaluator source gap is not candidate operational failure. |
| R027-C077 | L532-537 | Unexecuted single-image version/axes/dimension_names/order and composed example voxel checks. | qualified | E09, E12, E19, E20, E22: Valid proposal; the scale-only worked example cannot detect order reversal or missing offsets. Unexecuted status is not a false test-result claim. |
| R027-C078 | L538-539 | Unexecuted sparse/dense HCS paths, indices, fields and acquisition-qualified selection. | supported | E33, E34, E35: Useful proposed reference/discovery validation; no actual pass claimed. |
| R027-C079 | L540-541 | Unexecuted collection branches, plate precedence, XML order and multiplicity. | supported | E14, E15, E16: Source conditions align; the product may adopt awareness as stronger acceptance while preserving SHOULD provenance. |
| R027-C080 | L542-543 | Unexecuted ranks/untyped axes/control presence and omero mismatch degradation. | qualified | E10, E18, E24, E25: Useful proposal, but singleton versus absent image axes is missing and guessed roles are not proven calibrated semantics. |
| R027-C081 | L544-545 | Unexecuted coordinate checks at every level including unknown calibration and translation. | qualified | E20, E21, E22: The proposal is relevant but lacks a numeric offset-bearing expected oracle that would resolve the equation’s reversed inner chain. |
| R027-C082 | L546-548 | Unexecuted intermediate labels, singleton broadcasting, alpha, palette, properties, mismatch and dtype/count gating. | qualified | E27, E28, E29, E30: Useful geometry/display checks; no explicit/default source-reference association test or exact sparse/wide-ID range check is given. |
| R027-C083 | L549 | Unexecuted all malformed cases with feedback, no crash and alternate selection. | qualified | P02, E25, E28: Valid product test goal; invented numeric window or optional version-key invalidity must not be encoded as source-conformance expectations. |
| R027-C084 | L550-551 | Unexecuted responsiveness, cancellation, session settings and byte-identical source checks. | supported | B01, P02: Appropriate product validation proposal; no actual preservation/performance result inferred. |
| R027-C085 | L552-553 | Future separately authorized real-tool output/reader cross-check closes implementation gap. | supported | E36, P02: Correctly scoped proposal rather than current research evidence. |
| R027-C086 | L561-579 | Source index identifies all main contract chapters, history and conditions; unsettled matters and proposed validations remain explicitly recorded. | qualified | E01, E04, E09, E12, E17, E18, E25, E27, E32, E33, E35, E36, E37, E38: Locators identify relevant sections. An index does not validate overstated source force, reversed math, missing association or actual verification operations. |
| R027-C087 | L584-586, decisions/V001.json#/additions/0/body | Every U001–U012 seed section is reverified, confirmed and needs no amendment. | qualified | I01, E02, E25, E28, E30, E39: Actual independent read/seed/check operations remain unknown. The current blanket semantic confirmation is contradicted by material errors in the same current report and does not repair them. |
| R027-C088 | L588, decisions/V001.json#/additions/0/body | Every source citation resolves to its claimed content, including history/null/color/alignment tensions. | qualified | E12, E18, E24, E26, E37, E38: Many section references are appropriate, and listed textual features exist. Existence of a nearby source line does not establish the report’s claimed reader force or association/calibration policy. Actual check history remains locked. |
| R027-C089 | L589, decisions/V001.json#/additions/0/body | Named failed probes and unavailable directory enumeration cannot establish no other sources exist. | qualified | I01, E36: The epistemic principle is sound and a useful caveat. Actual failures, reader/tool bounds and corpus operations cannot be confirmed in phase 1. |
| R027-C090 | L591-596, decisions/V001.json#/additions/0/body | Unresolved areas remain U008–U010; no unresolved findings are recorded. | qualified | E36, E20, E30, I01: None recorded is a structural status of the current decision artifact, not proof every material assertion supported. Explicit source/implementation uncertainties remain, and all twelve supported statuses retain disputed current assertions. |
| R027-C091 | decisions/V001.json#/decisions/0/decision, decisions/V001.json#/decisions/0/reason | U001 is marked supported; every claim and cited reason in its full current block is confirmed, with no replacement. | qualified | E01, E02, E38, B01, P01, I01: Source title/version, 896 lines, brief/plan and conventions are independently supported. Seed task-card fields, no-other-source/probe conclusions and actual fresh-read verification are not phase-1 facts. A001 narrows the blanket corpus claim. |
| R027-C092 | decisions/V001.json#/decisions/1/decision, decisions/V001.json#/decisions/1/reason | U002 is marked supported; every claim and cited reason in its full current block is confirmed, with no replacement. | qualified | E04, E05, E09, E12, E17, E18, E19, E25, E27, E32, E33, E35, E36: All named metadata families and plan outline occur at the cited sections. The reason’s blanket no-disallowance/all-supported conclusion must retain OME image/label constraints and the report’s exaggerated fully-determines and rendering force. |
| R027-C093 | decisions/V001.json#/decisions/2/decision, decisions/V001.json#/decisions/2/reason | U003 is marked supported; every claim and cited reason in its full current block is confirmed, with no replacement. | qualified | E01, E02, E03, E06, E09, E32, E33, E38, E39: Namespace/version, release, comment/naming and exception facts match. Transitional text is may be expected/encouraged rather than every reader MUST/SHOULD implement each feature. Exact read/check operations remain unverified. |
| R027-C094 | decisions/V001.json#/decisions/3/decision, decisions/V001.json#/decisions/3/reason | U004 is marked supported; every claim and cited reason in its full current block is confirmed, with no replacement. | qualified | E07, E08, E12, E14, E15, E16, E19, E20, E22, E23, E27, E32, E33, E34, E35: Most structural citations are correct. The reason confirms an entire block that invents label-listing prohibition, sole first-fallback obligation and universal directory algorithm. Highest-resolution gloss exists; policy heuristics are not conformance definitions. |
| R027-C095 | decisions/V001.json#/decisions/4/decision, decisions/V001.json#/decisions/4/reason | U005 is marked supported; every claim and cited reason in its full current block is confirmed, with no replacement. | qualified | E10, E11, E12, E17, E18, E20, E21, E22, E24, E25, E26, E27, E28, E29, E30, E37: Axes, conditional file metadata, ordered transform rules, example numbers and label sections are source-backed. The blanket confirmation does not repair reader-MUST rendering, numeric-window invalidity, reversed equation, missing-unit inference, mandatory version presence or provenance-only association. |
| R027-C096 | decisions/V001.json#/decisions/5/decision, decisions/V001.json#/decisions/5/reason | U006 is marked supported; every claim and cited reason in its full current block is confirmed, with no replacement. | qualified | E02, E04, E09, E12, E18, E19, E20, E22, E25, E27, E28, E32, E33, E35, E39, B01: Most schema and product-boundary facts are correct. File presence MUSTs do not prove mandatory initial rendering, writer SHOULD fields do not universally require reader display, and private session-store naming is outside specification-key scope. |
| R027-C097 | decisions/V001.json#/decisions/6/decision, decisions/V001.json#/decisions/6/reason | U007 is marked supported; every claim and cited reason in its full current block is confirmed, with no replacement. | qualified | P01, P02, E08, E14, E19, E20, E24, E25, E27, E30: Plan phrases and many KEEP/refinement dispositions are supported. Every disposition is not thereby source-obligatory: label-only-overlay policy, initialization and invented calibration/association choices remain disputed. |
| R027-C098 | decisions/V001.json#/decisions/7/decision, decisions/V001.json#/decisions/7/reason | U008 is marked supported; every claim and cited reason in its full current block is confirmed, with no replacement. | qualified | E01, E05, E06, E09, E12, E14, E17, E18, E19, E20, E25, E27, E28, E33, E35, B01, P02: Referenced valid limitations and real schema violations are supported. Taxonomy cannot include unproved numeric-window or optional label-version existence violations; extra XML scope narrowing must be labeled product choice. |
| R027-C099 | decisions/V001.json#/decisions/8/decision, decisions/V001.json#/decisions/8/reason | U009 is marked supported; every claim and cited reason in its full current block is confirmed, with no replacement. | qualified | E10, E11, E12, E18, E19, E20, E21, E22, E23, E24, E25, E26, E28, E32, E33, E35, E36, E37: All thirteen textual features/tensions are reviewed individually above. They are not all true contradictions: SHOULD-string versus null allowance can coexist; highest-resolution gloss exists; usually qualifies geometry, not original-source identity. Proposed resolutions remain policies. |
| R027-C100 | decisions/V001.json#/decisions/9/decision, decisions/V001.json#/decisions/9/reason | U010 is marked supported; every claim and cited reason in its full current block is confirmed, with no replacement. | qualified | E36, B01, P02, I01: The fixed source lacks empirical reader compatibility/performance evidence and provides a Tools pointer. No-fetch condition, corpus completeness and actual implementation-research operations are locked. The gap correctly does not prove incompatibility. |
| R027-C101 | decisions/V001.json#/decisions/10/decision, decisions/V001.json#/decisions/10/reason | U011 is marked supported; every claim and cited reason in its full current block is confirmed, with no replacement. | qualified | E09, E12, E14, E15, E16, E18, E19, E20, E22, E25, E27, E28, E29, E30, E33, E34, E35, E36, B01, P02, I01: All nine proposed tests are source/product-relevant and labeled unexecuted. They do not supply missing singleton, noncommutative numeric calibration, source association or exact wide-ID checks. Actual no-execution/toolset claims are unknown. |
| R027-C102 | decisions/V001.json#/decisions/11/decision, decisions/V001.json#/decisions/11/reason | U012 is marked supported; every claim and cited reason in its full current block is confirmed, with no replacement. | qualified | E01, E02, E03, E04, E07, E09, E12, E17, E18, E23, E25, E27, E32, E33, E35, E36, E37, E38, I01: All index locations point to relevant topics, not proof all interpretations or reader mandates supported. Claimed rechecks are unverified operations; explicit uncertainty and unexecuted proposals are current text facts. |
| R027-C103 | decisions/V001.json#/additions/0/decision, decisions/V001.json#/additions/0/body, L584-592 | A001 marked supported: complete independent seed/source reads, every citation correct, bounded-probe limitation, no execution/input writes, and all prior unresolved areas unchanged. | qualified | I01, E12, E18, E20, E24, E26, E28, E30, E36, E37: The entire body is current report text and is separately decomposed above. Source pins and useful uncertainty principle are supported; operational history is unknown and blanket semantic confirmation fails to correct present material errors. |

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

- **E23**, S003 L388-397: “Or perhaps choose based on chunk size.” Name matching and first fallback are selection guidance with pseudocode and an explicit alternative; adopting a first-fallback policy is permitted, but exclusive mandatory reader behavior is not established.

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

- **I01**, stage.json, MANIFEST.json, eligibility.json, catalog.json: “Fixed admitted source S003 only; no live fetching for this component case.” The base stage and all manifest pins match. Explicit current addendum positively requires decisions/V001.json despite an empty base-stage companion list. Catalog/config hashes are metadata, not operation proof.

- **E39**, S003 L809-812: “Multi-word keys in this specification should use the camelCase style.” The recommendation concerns specification keys, with existing exceptions; no requirement for viewer-private session-store keys.

## Scope and uncertainty

{
  "verdict_label": "quality failure",
  "verdict": "The entire 596-line current report and required 15,133-byte decisions companion are assessed, including all twelve decisions, complete reasons and A001. Version admission and declared pyramid scope are covered fully, and many metadata findings are sound. Material current errors remain in reader force, label presentation/version, coordinate equation, unknown calibration, numeric-window invalidity and original-image label association. Four facets remain partial. The companion provides no replacements and confirms these current errors rather than repairing them. Current quality therefore fails full-scope assessment; no candidate acquisition, preservation, native or efficiency failure is inferred.",
  "current_semantic_companions": [
    "/home/sittingmongoose/PM-Experiments/external-research-v7-20260930/evaluation/continuous-ome-current-v1/current-addenda/R027-semantic-companion-v1/decisions/V001.json"
  ],
  "semantic_addenda_pins": [
    {
      "path": "/home/sittingmongoose/PM-Experiments/external-research-v7-20260930/evaluation/continuous-ome-current-v1/current-addenda/R027-semantic-companion-v1/ADDENDUM.json",
      "bytes": 1459,
      "sha256": "c6848c773868a7a1ef302809a2422c0263a203b4c6c68837abe249392047b874"
    },
    {
      "path": "/home/sittingmongoose/PM-Experiments/external-research-v7-20260930/evaluation/continuous-ome-current-v1/current-addenda/R027-semantic-companion-v1/MANIFEST.json",
      "bytes": 183,
      "sha256": "b69c0d27e2ccef4bf38499968e0548954f8448add76d88b235795f86004e345a"
    },
    {
      "path": "/home/sittingmongoose/PM-Experiments/external-research-v7-20260930/evaluation/continuous-ome-current-v1/current-addenda/R027-semantic-companion-v1/decisions/V001.json",
      "bytes": 15133,
      "sha256": "4f3d65dccad93c5f210e824e06440735b7ac11925c48f9f4962bfbdab351e628"
    }
  ],
  "scope_limits": [
    "Base-stage empty companion list is augmented by an explicit root/stager positive admission and its sealed ADDENDUM/MANIFEST; only those three supplemental files were read. No config, output_integrity, receipt, seed, acquisition or history file was opened.",
    "S003 does not supply empirical reader behavior, full referenced Zarr internals or binary vector representation. These honest scope limits do not reduce the six-facet denominator."
  ],
  "unresolved": [
    "Actual candidate full reads, seed/input hashes, probe failures, assignment, code/fetch/write restrictions and independently performed verification.",
    "Implementation codec support, external validator behavior and empirical performance.",
    "A definitive JSON string-only typing for quoted layout value 3 is not asserted; source examples use numeric 3."
  ],
  "blinding": [
    "Current report and companion unavoidably expose task-card, seed/treatment, date, acquisition filenames and operation cues. They were read as current claims only; no mapping, treatment inference, older report, private labels or history was consulted.",
    "Configuration/native-receipt hashes inside ADDENDUM are admission metadata only, not operational source evidence."
  ],
  "inventory_control": {
    "complete_report_read_ranges": [
      "L1-200",
      "L201-400",
      "L401-596 initial display",
      "L447-564 reread after display truncation",
      "L1-210 and L220-363,L375-444 independent claim-locator checks"
    ],
    "complete_original_source_read": true,
    "same_source_reuse": "Whole S003 was read at the first cohort intake; exact source/brief/plan/key/protocol hashes remain unchanged. New current claims and each companion reason were independently compared with source conditions.",
    "all_current_dispositions_reviewed": true,
    "all_unknown_and_rejected_items_reviewed": true,
    "novel_claims_independently_source_checked": true,
    "companion_full_json_read": true,
    "companion_shape": {
      "top_level_keys": [
        "decisions",
        "additions"
      ],
      "decisions": 12,
      "additions": 1,
      "replacements": 0,
      "unresolved_status_entries": 0
    },
    "companion_reason_inventory": [
      {
        "id": "U001",
        "pointer": "#/decisions/0",
        "status": "supported",
        "input_sha256_metadata": "0c7000ef5f7e6e3831b38623ec6e4eed81df431a077e3f3c29aed73c3aa7eb36",
        "original_reason": "Header claims independently re-verified: inputs/sources/S003.txt is an 896-line normative OME-Zarr 0.5 capture (sha256 5d8b240877ed2cf9596566187bcb3779ea011d5319807134c65e2e7dc2ae82de) with the 0.5 URL at S003 L5-L10 and RFC 2119 conventions at L57-L59 plus conformance rules at L868-L888; inputs/brief.md (5 lines) and inputs/plan/Viewer.md (11 lines) match the described brief and plan roles; case id ome-normative-dev-v1 and task card t02-m-ome-dev1-control-r1 match the seed metadata fields; the two-group coverage framing matches the brief's requirement list at brief L3; and the S003-only source scope is consistent with this workspace's probeable corpus (S003 present; probes of S000, S001, S002 and S004 each returned file-not-found, so no other source was available to read).",
        "assessment_claim_id": "R027-C091",
        "source_outcome": "qualified",
        "input_hash_history_not_inferred": true
      },
      {
        "id": "U002",
        "pointer": "#/decisions/1",
        "status": "supported",
        "input_sha256_metadata": "0827993f8df2026556c69ba76e1e81d96ed3563c751e4251b1ec19a61b3fb864",
        "original_reason": "Every load-bearing citation re-checked against the capture: Zarr v3 basis at S003 L68-L69; all Zarr features admissible unless explicitly disallowed at L70-L72 with no disallowance stated anywhere in L1-L896; zarr.json-described groups and arrays at L87-L100; ome-namespaced metadata with hierarchy-consistent string version at L150-L165; the typed metadata keys all exist at their cited sections (multiscales L295-L319, axes L167-L174, coordinateTransformations L277-L293, omero L399-L430, labels/image-label L432-L514, plate L516-L739, well L741-L808, bioformats2raw.layout plus series L175-L275); the plan core shape matches Viewer.md L5-L11; the largest unsupported-input surface is correctly tied to L70-L72; and L813-L814 is confirmed as a pointer-only implementations section, so the executive summary's scope caveat is accurate.",
        "assessment_claim_id": "R027-C092",
        "source_outcome": "qualified",
        "input_hash_history_not_inferred": true
      },
      {
        "id": "U003",
        "pointer": "#/decisions/2",
        "status": "supported",
        "input_sha256_metadata": "15765656cd856e9e60ce7c5f0dc7d948b77a92f452ae52b8c7cd52ff88a04d9d",
        "original_reason": "All six governing conditions re-checked, with quoted phrases matching the capture: L68-L72 (Zarr v3 foundation and unbounded features), L73-L77 (location-agnostic hierarchy narrowed by the local boundary at Viewer.md L9 and brief L5), L152-L165 (ome namespace, version string, MUST-consistency at L156, 0.5 example at L157-L165), L57-L59 and L872-L876 (RFC 2119), L60-L64 (transitional metadata: read MUST/SHOULD, write usually MAY, directly covering bioformats2raw.layout and omero which are both titled transitional), L877-L888 (all text normative except marked non-normative sections, examples and notes; example/note fencing conventions), L25-L27 (0.5 released; editor's drafts not necessarily supported), and L810-L812 (camelCase style with grandfathered exceptions) together with the literal key spellings confirmed at L538 and L595 (field_count), L557-L560 (rowIndex/columnIndex), L462 (label-value), L526-L529 (starttime/endtime), L524-L525 (maximumfieldcount) and L200 (bioformats2raw.layout).",
        "assessment_claim_id": "R027-C093",
        "source_outcome": "qualified",
        "input_hash_history_not_inferred": true
      },
      {
        "id": "U004",
        "pointer": "#/decisions/3",
        "status": "supported",
        "input_sha256_metadata": "c8cd59282cc9c7e83853335606f6e0275c845415ce2fd8fb60c5194262e5c209",
        "original_reason": "Re-verified all structural claims: group/array layout with per-level zarr.json at L87-L100 and chunk conformance at L99-L100; the three fileset shapes (plain images L82-L100, HCS plate hierarchy L118-L148, bioformats2raw collection L175-L275); plate precedence over bioformats2raw.layout at L204-L206 and L262-L263; the multiscale choice rule and name-then-first pseudocode at L388-L397; plate wells, rows, columns and acquisitions rules at L518-L560 and L744-L752 with the sparse-plate example at L641-L739; collection discovery rules at L256-L275 including the SHOULD NOT default to the first image at L272; the labels-group-is-not-an-image rule at L437-L438; dataset path ordering largest-to-smallest at L305-L306 with arbitrary array names at L93-L94; dimensionality and dimension_names gates at L173-L174 and L307; per-level exactly-one-scale and optional translation-after-scale composed with global transforms at L308-L316; and the worked example values at L320-L387. The observed ambiguities are genuine: no ordering metric is stated at L306, the multi-acquisition trigger at L748-L749 is ambiguous, the multi-multiscales rule at L388-L397 carries no RFC keyword, and rows are metadata-addressable only through plate.rows and plate.wells paths at L542-L560. Every entry in the failure-taxonomy list resolves to the cited line.",
        "assessment_claim_id": "R027-C094",
        "source_outcome": "qualified",
        "input_hash_history_not_inferred": true
      },
      {
        "id": "U005",
        "pointer": "#/decisions/4",
        "status": "supported",
        "input_sha256_metadata": "850520183174cb7e455983355a6a7f03ad0eaf374d4c9b0e770685208a65bcbd",
        "original_reason": "Re-verified: axes rules at L167-L174 and L296-L303 with arbitrary axis names at L81 and the L96-L97 dimension-order statement; omero MUST fields (channels at L426, color at L427, window min/max/start/end at L428-L430) versus example-only fields (L401-L423, non-normative per L877-L883) with the channels-length correspondence appearing only as the comment at L403; the transform vocabulary and sequential application at L277-L293, per-level exactly-one-scale with relative-fallback language at L310, translation-after-scale at L311, vector-length rule at L312, and global transforms applied after at L314-L316, with the worked calibration values (level scales 0.5/1.0/2.0 micrometer and global 0.1 millisecond time scale) confirmed at L330-L334, L343, L353, L363 and L368-L374; labels discovery and contract at L102-L117 and L437-L455, the alignment 'usually' hedge at L432-L433 with the overview-only broadcast rule at L106-L108; and image-label colors, version, properties and source at L456-L474 with the worked color example at L476-L514. The two reported textual tensions are real: dimension_names wording at L174 versus the history one-liner at L827, and the null/custom axis type at L301 versus string types at L169.",
        "assessment_claim_id": "R027-C095",
        "source_outcome": "qualified",
        "input_hash_history_not_inferred": true
      },
      {
        "id": "U006",
        "pointer": "#/decisions/5",
        "status": "supported",
        "input_sha256_metadata": "81cbf2b16bffecc997e38ccbf64a6f39a005c2b51db15075c990fd822bd8424c",
        "original_reason": "Each MUST item re-checked at its cited lines: Zarr v3 parsing (L68-L72, L87-L100), hierarchy-consistent version (L156) and the JSON-comment prohibition (L65-L66); axes rank, ordering, uniqueness and dimension_names (L96-L97, L168, L173-L174, L299-L302); dataset traversal by metadata order (L93-L94, L305-L306); per-level and global transform composition (L308-L316); the HCS discovery chain with full row/column enumeration and acquisition matching (L552-L560, L744-L750) under plate precedence (L204-L206); collection rules (L256-L270); omero required fields (L426-L430); and the labels contract (L438-L455). The SHOULD list (L272, L128-L129, L170-L172, L303, L317-L319, L257-L260, L461, L523-L525, L538-L541, L751-L752, L810-L812) and MAY list (L426, L273-L275, L314-L316, L466-L474, L518-L529, L169-L170, L70-L72) were each confirmed, and the product-decision inventory in 5.4 is consistent with everything the source leaves unstated. The read-only session-local obligation matches brief L5 and Viewer.md L9 with no S003 write requirement found in L1-L896.",
        "assessment_claim_id": "R027-C096",
        "source_outcome": "qualified",
        "input_hash_history_not_inferred": true
      },
      {
        "id": "U007",
        "pointer": "#/decisions/6",
        "status": "supported",
        "input_sha256_metadata": "1c70b645905672033cda34d859c9a4e2aa10eadaeacfd6f0be2d6e531890066f",
        "original_reason": "Every Viewer.md proposition quoted in the block matches the plan text verbatim at L5, L7, L9 and L11; each KEEP, EXTEND, CONSTRAIN or FLAG disposition is consistent with the corresponding S003 obligations re-verified this session (shape sniffing basis L82-L148 and L175-L275; plate precedence L204-L206 and L262-L263; axis-driven control presence L167-L174 and L296-L303; omero-aware initialization L399-L430; the label contract L432-L514; transform composition L277-L316; the item-scoped failure taxonomy at its cited sites); the FLAG on real-tool interoperability is correct because L813-L814 supplies no implementation requirements; and the KEEP on read-only session-local behavior matches brief L5 and Viewer.md L9.",
        "assessment_claim_id": "R027-C097",
        "source_outcome": "qualified",
        "input_hash_history_not_inferred": true
      },
      {
        "id": "U008",
        "pointer": "#/decisions/7",
        "status": "supported",
        "input_sha256_metadata": "8186fd9d9c9e2e7eb94d13bed624b63ba823d652f9ffe99b27f7982b19337086",
        "original_reason": "All cited violation and limitation sites re-confirmed in the capture: the unbounded Zarr feature admission at L70-L72; the underspecified binary path transform form at L285-L289; version inconsistency at L156; rank, axis, order and dimension_names violations at L173-L174 and L299-L307; path-order violations at L306; transform violations at L309-L312; bad well paths or indices and dangling acquisitions at L553-L560 and L748-L750; the non-3 layout value at L256; non-integer or level-mismatched labels at L438-L455; malformed omero color/window at L426-L430; the remote-store narrowing of the location-agnostic format at L73-L77; the version gate at L25-L27; and the OME-XML MetadataOnly restriction at L257-L260. The three-way taxonomy (viewer limitation, malformed input, product boundary) is consistent with brief L5 and Viewer.md L7, L9 and L11.",
        "assessment_claim_id": "R027-C098",
        "source_outcome": "qualified",
        "input_hash_history_not_inferred": true
      },
      {
        "id": "U009",
        "pointer": "#/decisions/8",
        "status": "supported",
        "input_sha256_metadata": "1b63d7faf56148bff48b2f75f638b667fe5b62e40e554df591791b2de8b1861a",
        "original_reason": "All thirteen items reproduce genuine textual facts verified line-by-line: the dimension_names wording conflict between normative L174 and history L827; the null/custom axis type at L301 versus string types at L169; the absent ordering metric at L306; the scale fallback language creating the 1.0 ambiguity at L310 and the undefined translation origin at L311; the global-after rule at L315 with only a time-axis worked example at L368-L374; the RFC-keyword-free multiscale choice rule at L388-L397; the comment-only channels-length note at L403 with rdefs example-only at L419-L423; the 'usually' alignment hedge at L433 plus the overview-only broadcast rule at L106-L108; unspecified version vocabularies at L459-L460, L550-L551 and L751-L752; the unexplained layout value at L200 and L256 with the ambiguous acquisition trigger at L748-L749; the binary-path gap at L285-L289; the field_count versus maximumfieldcount overlap at L538-L539 and L524-L525 with the duplicated 'by the' genuinely present across L93-L94; and the whole-format risk at L70-L72 with no implementation content at L813-L814.",
        "assessment_claim_id": "R027-C099",
        "source_outcome": "qualified",
        "input_hash_history_not_inferred": true
      },
      {
        "id": "U010",
        "pointer": "#/decisions/9",
        "status": "supported",
        "input_sha256_metadata": "7319b336d7c56b35151f0c04b5687a40ff994b79f0c4a43df4bccec7d75785a0",
        "original_reason": "Re-verified: S003 L813-L814 is the corpus's only implementation content and reads '4. Implementations / See Tools.', an unresolvable pointer under the no-fetch condition; no reader-tolerance, performance, caching or error-handling requirements appear anywhere in S003 L1-L896; the brief L5 sentence about researching the format and actual reader implementations and the Viewer.md L9 interoperability sentence are quoted verbatim; and the scope-limitation rather than incompatibility framing requires no correction.",
        "assessment_claim_id": "R027-C100",
        "source_outcome": "qualified",
        "input_hash_history_not_inferred": true
      },
      {
        "id": "U011",
        "pointer": "#/decisions/10",
        "status": "supported",
        "input_sha256_metadata": "105199e453768c844208fc142e6cccecc1efef20c85030e330f1b77bd3059aa9",
        "original_reason": "All nine proposals map onto obligation sets verified this session: V1 to the single-image gates at L150-L174 and the worked values at L320-L387; V2 to the HCS metadata at L516-L739 and L741-L808; V3 to the collection rules at L175-L275 including plate precedence; V4 to axis-driven controls at L167-L174 and L296-L303 with omero initialization at L399-L430; V5 to composed transforms at L277-L316; V6 to the label contract at L432-L514; V7 to the malformed-input sites cited in the unsupported-input section; V8 to the responsiveness requirements at brief L3 and Viewer.md L7 and L11; V9 to the out-of-scope real-tool cross-check per L813-L814. All are correctly labeled UNEXECUTED, and no execution occurred in this session either: the toolset was bounded read/write only, with no live fetch.",
        "assessment_claim_id": "R027-C101",
        "source_outcome": "qualified",
        "input_hash_history_not_inferred": true
      },
      {
        "id": "U012",
        "pointer": "#/decisions/11",
        "status": "supported",
        "input_sha256_metadata": "35315c303684066ff0d36e1cda5fdbabe48afa87763ff1c3ce56b34eeaf606f7",
        "original_reason": "Every locator in the source-line index was re-checked against the 896-line capture and resolves to the described content, including release status L25-L27, transitional rules and comment prohibition L60-L66, storage and layouts L68-L148, ome namespace and axes L150-L174, the bioformats2raw transitional section L175-L275, transforms L277-L293, multiscales with example and choice rule L295-L397, omero L399-L430, labels and image-label L432-L514, plate L516-L739, well L741-L808, naming and implementations L810-L814, version history L822-L866, and conformance L868-L888; the closing scoping sentence accurately describes where the report records unsettled areas and UNEXECUTED validation.",
        "assessment_claim_id": "R027-C102",
        "source_outcome": "qualified",
        "input_hash_history_not_inferred": true
      }
    ],
    "companion_addition_inventory": [
      {
        "id": "A001",
        "pointer": "#/additions/0",
        "status": "supported",
        "full_body": "## 12. Independent verification record and corpus scope (treatment session 2026-10-01)\n\nEvery seed section U001-U012 was independently re-verified against the full source corpus in this session before confirmation; all twelve are confirmed and none required amendment.\n\n- Full reads (bounded tools only): `inputs/sources/S003.txt` (all 896 lines, sha256 `5d8b240877ed2cf9596566187bcb3779ea011d5319807134c65e2e7dc2ae82de`), `inputs/brief.md` (5 lines), `inputs/plan/Viewer.md` (11 lines), `inputs/candidate_seed.json` (all 58 lines, read as two calls whose union covers the file), `inputs/seed_block_hashes.json` (14 lines), `TASK.md` (7 lines). Complete hashes are recorded in `out/acquisition/V001.json`.\n- Every S003 line locator cited by the seed was re-checked against the capture and resolves to the claimed content, including the textual tensions the seed itself reports: normative `dimension_names` wording at L174 versus the history one-liner at L827; `null / custom` axis type at L301 versus string-only types at L169; the comment-only channel-length note at L403; the alignment 'usually' hedge at L433; and the duplicated 'by the' at L93-L94.\n- Corpus scope: `S003.txt` is the only source file in evidence. Probes of `inputs/sources/S000.txt`, `S001.txt`, `S002.txt` and `S004.txt`, and of candidate assignment/task/case paths under `inputs/`, each returned file-not-found from the bounded reader; directory enumeration was unavailable (mechanical line-map failed at the tool boundary on `.` and `inputs`), so corpus completeness beyond these named probes cannot be asserted - this is a tool-boundary limit, not a positive claim that no other sources exist.\n- No live fetch, no code execution, and no writes inside `inputs/` occurred; all proposed validation in section 10 remains UNEXECUTED.\n- Consequence: the unresolved areas remain exactly those recorded in sections 7-9 (U008-U010); the brief's real-reader-implementation research goal stays unresolvable inside this corpus (S003 L813-L814 pointer only).",
        "source_outcome": "qualified",
        "assessment_claim_id": "R027-C103"
      }
    ],
    "current_carrier_relationship": "All U decisions say supported and have no replacement bodies. A001 repeats the report’s verification addition. Companion therefore confirms current report assertions; it is not a silent amendment.",
    "nonassertion_lines": "Headings, separators and blank lines are structural. Every substantive storage, hierarchy, axis, display, transform, label, triage, plan disposition, unsupported, uncertainty, validation, index and confirmation family has a claim row. All thirteen U009 uncertainties and all nine V proposals are separately assessed; every companion reason retained in full with an assessment row."
  }
}

## Phase lock

No acquisition, history, native delivery, preservation or efficiency judgment has been made. Explicit root/stager unlock receipt is required after the entire cohort is frozen.
