# Independent verification report — ome-normative-dev-v1 (t14-m-ome-negative-screen-v1-control)

- Case: `ome-normative-dev-v1`
- Job scope: Independently verify all frozen candidate seed findings against admitted evidence and plan.
- Candidate source: `inputs/candidate_seed.json`, `source_job_id=t02-m-ome-dev1-control-r1`, 12 findings U001–U012.
- Source scope: **only** admitted frozen capture S003; **no live external fetching**.
- Plan visibility: admitted thin plan `inputs/plan/Viewer.md` visible; no evaluator keys or historical outputs used.
- Admitted inputs read: `inputs/brief.md`, `inputs/TASK.md`, `inputs/catalog.json`, `inputs/sources/S003.txt`, `inputs/plan/Viewer.md`, `inputs/candidate_seed.json`.
- Report date (UTC): 2026-09-30. Standalone current report; all validation proposals are **UNEXECUTED**.

## 1. Source versions and evidence basis

| Handle | File | URI | Version / SHA | Bytes | Lines |
|---|---|---|---|---|---|
| S003 | `inputs/sources/S003.txt` | `https://ngff.openmicroscopy.org/0.5/` | `capture-only:5d8b240877ed2cf9596566187bcb3779ea011d5319807134c65e2e7dc2ae82de` | 36980 | 896 |

- Catalog: `inputs/catalog.json`, schema `er7.candidate_case.v1`, `case_id=ome-normative-dev-v1`, S003 `original_sha256=5d8b2408…2ae82de`, `view_sha256` identical, `view_kind=original_bytes`.
- Plan: `inputs/plan/Viewer.md` (thin synthetic fixture, self-declared at L3).
- Brief: `inputs/brief.md` (Slide Scout read-only local browser).
- Assignment: `inputs/TASK.md` (S003-only, no live fetch, two brief-derived groups; aggregate equals full scope).
- Citation convention in this report: `S003 Lx` / `S003 Lx–y` = exact lines in `inputs/sources/S003.txt`; `Viewer.md Lx`, `brief Lx`, `assignment Lx` analogous.

Reading method: complete sequential read of S003 L1–896 in two windows (L1–500, L500–896), plus complete reads of brief, assignment, catalog, plan, and candidate seed (U004/U005 long lines recovered via full-line search return, not truncated summary). No code was run, no filesets opened, no live sources fetched.

## 2. Method boundary — V-FOLLOWON-1 repair (this method only)

Per task card, **V-FOLLOWON-1 is repaired in this method only**.

Repair applied:

1. **No absence from search.** A failed search, a keyword match count, or a field-name hit proves only that search result, never absence (or presence) of a specification statement. Every absence-adjacent statement in this report (e.g. “no Zarr-feature disallowance observed”, “no reader-tolerance section observed”, “no window-semantics rule observed”) is grounded in the **complete sequential read of S003 L1–896**, stated as “no statement observed in the complete read of the admitted capture”, and qualified by the capture-transfer limit in §3. Search-tool output was used only to recover truncated candidate-seed lines and to confirm line numbers, never as a basis for SUPPORTED/UNSUPPORTED.
2. **No benchmark-specific numeric patches.** No thresholds, counts, scores, or line-number adjustments were tuned to satisfy any check. Where the candidate proposes a numeric heuristic (e.g. total-voxel-count ordering sanity check), it is recorded as the candidate’s proposal with its source gap intact, not patched or re-tuned.
3. **No dismissal by paraphrase distance.** Findings are verified against source substance with exact locators; wording differences alone are not grounds for UNSUPPORTED. Strength downgrades (MUST → derived) are recorded as clarifications, not refutations.

## 3. Applicability and transfer limits

1. **Capture-only.** All verification is against the 896-line frozen rendering of `https://ngff.openmicroscopy.org/0.5/`. Content outside the capture (full site, linked Tools, OMERO WebGateway docs referenced at S003 L424–425, Zarr v3 specification referenced at S003 L68–72, OME-XML specification referenced at S003 L257–260) was not admitted and is not transferred. Absence statements do not transfer beyond L1–896.
2. **Zarr v3 by reference.** S003 L70–72 admits all Zarr features unless explicitly disallowed; no disallowance was observed in the complete read of L1–896. Zarr decoding obligations therefore transfer only as “whatever the viewer’s Zarr backend supports, else graceful failure” — codec/chunk/dtype distributions are unresolved inside S003.
3. **Version-bound.** Only `ome.version="0.5"` hierarchies with hierarchy-consistent versions (S003 L150–165, L25–27) are in-contract. Pre/post-0.5 and editor’s-draft behavior does not transfer.
4. **Location narrowing.** S003 L73–77 is location-agnostic (local/HTTP/S3/GCS); brief L5 and Viewer.md L9 narrow to local-filesystem reading. Verification of remote behavior does not transfer to this product boundary.
5. **No implementation evidence.** S003 L813–814 (“See Tools”) is an unresolvable pointer in a no-fetch assignment. Interoperability with real tool outputs and reader-tolerance behavior do not transfer from S003 alone.
6. **Plan fixture.** Viewer.md is a deliberately thin synthetic fixture (Viewer.md L3), not a completeness claim. Plan dispositions transfer only to that fixture.

## 4. Verification summary (all 12 candidate findings)

Disposition vocabulary: **SUPPORTED** = source substance confirms the finding as written (minor wording/strength clarifications noted inline, not refutations). **SUPPORTED-WITH-CLARIFICATION** = source facts confirm; one explicitly noted inference is derived rather than direct-MUST or terminology needs correction. No finding is UNSUPPORTED. No false dismissal was required.

| Verdict ID | Candidate | Disposition | One-line reason |
|---|---|---|---|
| VRF-01 | U001 header/scope/vocabulary | SUPPORTED | Case/scope/lines/URL/conformance locators match; vocabulary is candidate-defined framework, correctly labeled. |
| VRF-02 | U002 executive summary | SUPPORTED | On-disk contract, plan-shape summary, gap list, unbounded-Zarr and Tools-pointer caveats all match S003; absence points rest on complete read (§2). |
| VRF-03 | U003 governing conditions | SUPPORTED | Six conditions match S003 L57–66, L68–77, L150–165, L25–27, L810–812, L868–888; key-spelling list verified. |
| VRF-04 | U004 group 1 (§3.1–§3.5) | SUPPORTED-WITH-CLARIFICATION | Discovery/navigation/failure analysis matches S003; sniff order and labels-exclusion are sound derivations, not direct MUSTs (see §5). |
| VRF-05 | U005 group 2 (§4.1–§4.4) | SUPPORTED-WITH-CLARIFICATION | Axes/omero/coords/labels match S003; omero rendering semantics are example-inferred and “normative example” is a terminology slip (see §5). |
| VRF-06 | U006 obligations/options/decisions | SUPPORTED | MUST/SHOULD/MAY/product-decision split matches RFC 2119 force in S003; 10 MUSTs each located. |
| VRF-07 | U007 plan disposition | SUPPORTED | Sentence-by-sentence Viewer.md L5/L7/L9/L11 dispositions follow from §§3–5; FLAG on interoperability is correct. |
| VRF-08 | U008 unsupported-input taxonomy | SUPPORTED | Three-way split (limitation/malformed/out-of-scope) correctly maps each entry to a S003 MUST/SHOULD/MAY or boundary. |
| VRF-09 | U009 counterevidence/unresolved (13) | SUPPORTED | Each of the 13 gaps paradoxes/conflicts/ambiguities verified at cited lines; adopted readings are reasonable and labeled. |
| VRF-10 | U010 reader-implementation caveat | SUPPORTED | Brief L5 goal vs S003-only scope correctly held unresolved; no implementation section observed in complete read. |
| VRF-11 | U011 proposed validation V1–V9 | SUPPORTED | All proposals map to scope and are correctly labeled UNEXECUTED; no execution evidence exists in admitted inputs. |
| VRF-12 | U012 source-line index | SUPPORTED | Every index locator spot-checked and matches S003; closing scope note is accurate. |

Counts: 12 verified; 10 SUPPORTED; 2 SUPPORTED-WITH-CLARIFICATION; 0 UNSUPPORTED; 0 false dismissals.

## 5. Detailed dispositions and reasons

### VRF-01 — U001 (report header, scope, conventions) — SUPPORTED

- `case_id=ome-normative-dev-v1`, `source_job_id=t02-m-ome-dev1-control-r1` match `inputs/candidate_seed.json`; catalog `case_id` matches.
- “Only S003, 896 lines, `https://ngff.openmicroscopy.org/0.5/`” matches catalog (`view_lines=896`, alias URI) and the observed S003 L6/L8/L818 plus line count 896. No live fetch is consistent with assignment L5.
- “Thin synthetic fixture” matches Viewer.md L3; “small read-only desktop browser” matches brief L3–L5.
- “Whole brief, both groups together” correctly describes the candidate report’s claimed coverage; assignment L7–L12 defines the two groups and notes other methods cover both together.
- Conformance locators S003 L57–59 and L868–888 verified: L57–59 introduces RFC 2119 keywords; L872–878 restates normative/keyword rules.
- Status vocabulary (Obligation/Recommendation/Option/Product decision/Unsupported) is the candidate’s own framework. It maps cleanly onto MUST/SHOULD/MAY/boundary but is not itself source text. Recorded as defined terms, not source quotations. No correction needed.

### VRF-02 — U002 (executive summary) — SUPPORTED

- Zarr v3 groups/arrays via `zarr.json`: S003 L68–72, L87–100 verified.
- `ome` namespace + hierarchy-consistent `version:"0.5"`: S003 L150–165 verified.
- Typed keys list (`multiscales`, `axes`, `coordinateTransformations`, `omero`, `labels`/`image-label`, `plate`, `well`, `bioformats2raw.layout`+`series`) each verified in §§2.1–2.8.
- Thin-plan shape summary (open → list → canvas + controls + overlays + details + background reads + failure messages + read-only local) matches Viewer.md L5–L11.
- Gap list (plate/well acquisition-aware discovery; collection discovery; arbitrary paths largest→smallest; axis-order/`dimension_names`; composed transforms; units; omero windows; integer same-count labels + colors; version checks) each traces to a MUST/SHOULD cited in VRF-04/VRF-05. Mixing MUST and SHOULD in one summary sentence is acceptable for a summary; §6 of the candidate separates force.
- “All Zarr features may be used unless explicitly disallowed, with no disallowance stated anywhere in the capture”: the quotation matches S003 L70–72. The second clause is an absence statement repaired per §2: it is supported as “no disallowance of Zarr codecs/chunk-grids/key-encodings/dtypes/transformers was observed in the complete read of S003 L1–896” (observed MUST NOTs govern JSON comments, paths, names, and intermediate-group metadata, not Zarr features). It does not transfer beyond the capture.
- “Tools” pointer only (S003 L813–814), interoperability unevidenced, brief-L5 reader research unresolvable in S003 alone: verified. S003 L813–814 is two lines with no requirements; assignment L5 forbids fetching. Correctly held as scope limitation, not incompatibility.
- “All proposed validation UNEXECUTED”: correct labeling; see VRF-11.

### VRF-03 — U003 (governing conditions) — SUPPORTED

1. Zarr v3 L68–69; unbounded features L70–72; no disallowance observed in complete read; viewer must bound or fail gracefully. Supported per §2 method.
2. Local representation generalizing to HTTP/S3/GCS L73–77; local-only boundary (brief L5, Viewer.md L9) correctly labeled product-decision narrowing. Supported.
3. `ome` in `zarr.json` attributes, `version` string L150–155; MUST consistent L156; example `0.5` L157–165. Mixed-version handling as product decision is correct — S003 states the MUST but no reader recovery rule. Supported.
4. RFC 2119 L57–59/L872–876; transitional MUST/SHOULD-read vs MAY-write L60–64; normative-except-examples/notes L877–878 with “for example”/`class="example"`/`Note` fencing L879–888; JSON comments MUST NOT L65–66. Paraphrase verified. Supported.
5. Release 0.5, migrations, editor’s-draft caveat L25–27. “Only 0.5 in-contract; else best-effort/reject” is a reasonable product-decision consequence, correctly not stated as source MUST. Supported.
6. camelCase L810–812 with acknowledged exceptions; literal matching required for `field_count` (S003 L538/L595), `rowIndex`/`columnIndex` (L557–560), `label-value` (L462), `starttime`/`endtime` (L528), `maximumfieldcount` (L524), `bioformats2raw.layout` (L200). All locators verified present. “Spelling drift” observation is accurate description. Supported.

### VRF-04 — U004 (group 1) — SUPPORTED-WITH-CLARIFICATION

§3.1 Opening. Image-as-Zarr-group L87–89, levels-as-arrays L91–100, chunks per array spec L99–100, three fileset shapes (plain L82–100; HCS L118–148; collection L175–275), plan L5 thinness, read-only/session-local compatibility (Viewer.md L9, brief L5; S003 states no viewer write requirement — complete-read observation): all supported. **Clarification A (sniff order):** plate precedence is explicit (S003 L204–206, L262), but the ordered “plate → bioformats2raw → multiscales, report ambiguity” procedure is the candidate’s sound synthesis, not a single source MUST. Retain as required product logic with that provenance.

§3.2 Discovery table. Single-image name/fallback rule + pseudocode L388–397; plate implementation L125–127, wells path/index triple L552–560, well images L744–750, full row/column enumeration L532–533/L544–545, sparse example L641–739, empty-row/well SHOULD NOT L128–129; collection `layout==3` L193–203/L256, `series`-or-numbered discovery L264–270, one-Image-per-group L270, SHOULD/MUST OME-XML L257–260, precedence/no-mixing L204–206/L262–263; multiplicity SHOULD/SHOULD-NOT L272 with MAYs L273–275; labels-container L437–438: all locators verified. **Clarification B:** “label contents MUST NOT be listed as primary images” is a sound derivation from “not itself an image; it contains images,” not a direct source MUST NOT. Retain as derived requirement (exclude `labels/` subtrees from the image list). The SHOULD-to-required elevation for multiplicity is explicitly justified by Viewer.md L11 acceptance and is labeled as such — acceptable.

Additional discovery notes (name constraints L533–537/L546–549/L746–748 with no case-folding derivation; version gating L150–156; value-`3` unexplained; multi-`multiscales` non-RFC-keyword uncertainty L388–397; row discoverability only via `plate.rows`+`wells[].path` L542–560): supported. The “directory enumeration without metadata is non-conforming” point is correctly read as “metadata is authoritative”; S003 does not explicitly prohibit scanning, and the candidate’s wording is retained with that understanding.

§3.3 Selection. Well `{path,acquisition?}` examples L763–780/L795–803, conditional acquisition MUST + id match L748–750, id ≥0 L520–522, SHOULD/MAY acquisition fields L523–529, `field_count`/`name` hints L538–541, composite (well, acquisition, field) key, and lenient “>1-entry” reading of the ambiguous “if multiple acquisitions” trigger: supported as source-plus-reasonable-proposal.

§3.4 Navigation. MUST `axes`/`datasets` L299/L304, MUST path+transforms L305–308, MUST largest→smallest L305–306 with arbitrary names L93–94, shared dimensionality L307, `axes`-rank/`dimension_names` MUSTs L173–L174, SHOULD name/type/metadata L317–319 with gaussian example L375–382, metadata-order traversal, multi-`multiscales` fallback, per-level unsupported handling, and voxel-count sanity-without-reorder proposal for the undefined “largest” metric: supported. Mismatch handling (skip-with-message/refuse, no silent remap) is correctly labeled product behavior for MUST violations.

§3.5 Responsiveness/failures. No source threading model (complete-read observation); chunked arrays L91–100 plus unbounded Zarr L70–72 plus multiplied HCS/collection node counts as scale rationale; background/cancel/no-freeze as brief-L3/Viewer.md-L7/L11-required outcome with product-decision mechanism; item-scoped taxonomy mapping each MUST family to a named message: supported. “Multi-GB-capable” is architectural inference (S003 states chunking, not sizes) and is retained with that provenance.

### VRF-05 — U005 (group 2) — SUPPORTED-WITH-CLARIFICATION

§4.1 Axes. Rank/composition L173/L299–301, t-before-c-before-space L96–97, MUST order L302, SHOULD zyx L303, arbitrary names L81, axis-driven slider relevance (Viewer.md L5), unique names + `dimension_names` L168/L174, SHOULD type/MAY custom L169, SHOULD UDUNITS-2 with space/time lists L170–172 and no channel vocabulary (complete-read observation), tolerate-missing/unknown derivation, null-type half-admission L301-vs-L169 with lenient proposal, and L174-over-L827 (`dimension_names` in array `zarr.json` beats history one-liner) resolution: supported. “MUST tolerate” is correctly understood as RFC 2119 consequence (SHOULD/MAY absence cannot be malformed), not a quoted MUST.

§4.2 Omero. Optional-but-MUST-`channels` L426, MUST color L427, MUST window min/max/start/end L428–430, example `active`/`coefficient`/`family`/`inverted`/`label`/`rdefs` L401–423, best-effort init from example-only fields per non-normative rule L877–883, comment-only c-size correspondence L403 with overlap-degrade proposal, absent-`omero` product-decision defaults, axis-derived plane relevance: supported. **Clarification C:** “`window.start/end` as initial contrast limits within `min/max`” and “`color` as initial channel color” infer rendering semantics from field names and example context; S003 L426–430 normatively requires field presence only, with no gamma/family registry or out-of-range rule observed in the complete read. Retain the candidate’s rendering rule as labeled interpretation; the MUST-level obligation is to read and apply the fields, with semantic details documented as assumption.

§4.3 Coordinates. Ordered vocabulary L279–293 (identity L282–283, translation L284–286, scale L287–289), per-level only-scale/translation L308–309 with exactly-one-scale + fallback semantics L310, optional translation-after-scale L311, vector-length L312, optional global applied-after L314–316 with time example L368–374, outer∘inner composition, worked 5-D calibration L320–387 (level scales `[1,1,0.5,0.5,0.5]`/`[1,1,1,1,1]`/`[1,1,2,2,2]`, global `[0.1,1,1,1,1]`, voxel Δt=0.1 ms/Δc=×1/Δxyz=0.5 µm — arithmetic verified), details-panel derivation, scale-`1.0`/origin/binary-`path`/violation edge handling: supported. **Clarification D (terminology):** the worked calibration is an informative example (examples are non-normative per S003 L877–883), not a “normative example.” Numbers and composition rule remain supported; only the label is corrected.

§4.4 Labels. Nesting L102–108/L437, MUST `ome.labels[]`/SHOULD-all-listed L441–453 with examples L104–105/L444–453, intermediate-folders-no-metadata L110/L439–440, arbitrary names L112/L440, `labels[]`-driven discovery with unlisted-scan product decision, MUST `multiscales` + same-level-count L454–455, MUST integer dtypes L438–439/L116–117, “usually same system” L432–433 + same-or-1 L106–108 with same-index/broadcast/verify/warn proposal and categorical nearest-neighbor rationale, SHOULD `image-label` L456–458 with MUST `colors[]`/`version` + MAY `rgba`/`properties`/`source` L458–474, SHOULD-display-colors L461, worked rgba/properties/source example L476–514 with fallback-palette/legend/provenance rules, plan mapping (Viewer.md L5/L11), and version/precedence uncertainties: supported. Same-index choice, interpolation avoidance, and label-transforms-verified-against-parent are correctly understood as labeled proposals where S003 is silent.

### VRF-06 — U006 (obligations/options/decisions) — SUPPORTED

- Ten MUSTs each located (Zarr parse; `ome`/version/comments; axes/dimension_names; dataset order; composed transforms; HCS + precedence; transitional collections; omero-if-present; labels; read-only/session-local boundary). The tenth correctly attributes “never write” to the brief/plan boundary consistent with S003’s read-side silence (complete-read observation), not to a source MUST. Supported.
- SHOULD list (multiplicity, zyx, units, name/type/metadata, METADATA.ome.xml, label colors, plate/acquisition/well hints, empty-row/well absence, camelCase for the viewer’s own store): each locator verified. Applying camelCase to the viewer’s private session store is labeled extension. Supported.
- MAY list (whole-`omero`, series use, show-all-vs-choose, ignore-root-children, global transforms, properties/source/extra-colors, acquisitions block, custom axes, backend-supported Zarr features): each verified at L273–275, L314–316, L466–474, L518–529, L169–170, L70–72. Supported.
- Product-decision list (listing chrome, pyramid picker, appropriateness heuristic, cache/prefetch/cancel, absent-`omero` defaults, fallback palette, unlisted-scan, version-mismatch, binary-`path`, uncalibrated presentation, message wording, freeze budgets): each is genuinely unsettled by S003 and correctly assigned to explicit review per Viewer.md L9. Supported.

### VRF-07 — U007 (plan disposition) — SUPPORTED

Each Viewer.md sentence disposition verified: L5 open/list → EXTEND (shape-sniffing, enumeration, acquisition identity, labels exclusion, version gating); L5 pan/zoom → KEEP conditioned; L5 channel/time/plane → EXTEND (axes-driven + omero-init); L5 overlays → EXTEND (§4.4); L5 details → EXTEND (§4.3); L5 appropriate-level → KEEP+CONSTRAIN (metadata order; heuristic as product decision); L7 background/cancel → KEEP architecturally required; L7 failures → EXTEND (item-scoped taxonomy); L9 interoperate → FLAG unevidenced; L9 unchanged/session-local → KEEP; L9 out-of-scope + review gate → KEEP; L11 acceptance → KEEP with raised bar mapping to validation. All follow from VRF-04/VRF-05 and correctly cite Viewer.md lines. Supported.

### VRF-08 — U008 (unsupported-input taxonomy) — SUPPORTED

- Viewer-limitation (in-contract, message + continue): undecodable Zarr features L70–72, binary-`path` L285–289, unlisted labels, custom axes L169–170. Supported.
- Malformed (message + fallback per Viewer.md L7/L11): `zarr.json`/`ome`/version L156, rank/axis/order/`dimension_names` L173–174/L299–307, path order L306, transforms L309–312, well paths/indices/acquisitions L553–560/L748–750, non-`3` layout L256, label dtype/count L438–455, omero/color/window L426–430. Supported.
- Out-of-scope (brief L5, Viewer.md L9): remote despite L73–77, editing/export, non-0.5/drafts L25–27, beyond-MetadataOnly OME-XML L257–260, clinical interpretation. Supported.
- “No silent skips/crashes/invented calibration; name the item; offer another selection” correctly synthesizes Viewer.md L7/L11. Supported.

### VRF-09 — U009 (13 counterevidence/unresolved items) — SUPPORTED

All 13 verified: (1) L174-vs-L827; (2) null-type L301-vs-L169; (3) undefined largest→smallest metric L306; (4) scale-`1.0`/origin L310–L311; (5) outer∘inner with single-axis example L315/L368–374; (6) non-RFC-keyword fallback L388–397; (7) comment-only omero length L403 + example-only rdefs L419–423 + no window semantics (complete-read observation); (8) “usually” L433 + overview broadcast L106–108 + unstated precedence; (9) unspecified `image-label`/`plate`/`well` version vocabularies L459–460/L550–551/L751–752; (10) unexplained `3` L200/L256 + ambiguous multiple-acquisitions trigger L748–749; (11) underspecified binary-`path` L285–289; (12) `field_count`-vs-`maximumfieldcount` overlap L538–539/L524–525 + editorial “by the by the” L93–94 (verified present, no semantic effect); (13) whole-format Zarr-by-reference risk L70–72 with Tools/Citing carrying no requirements L813–820 (complete-read observation). Adopted readings are reasonable and explicitly labeled. Supported.

### VRF-10 — U010 (reader-implementation caveat) — SUPPORTED

Brief L5 asks for format-plus-reader research; assignment L5 restricts to S003 with no fetching; S003 §4 is the two-line “See Tools” pointer L813–814; no reader-tolerance/perf/caching/error-handling requirements were observed in the complete read of L1–896. Holding Viewer.md L9 interoperability as unevidenced product requirement needing out-of-scope filesets/code, resting compatibility on conformance text alone, and inventing no implementation requirements is correct. Supported as scope limitation, not incompatibility.

### VRF-11 — U011 (proposed validation V1–V9) — SUPPORTED

“No filesets opened, no code run, no live fetch; every check proposal only” is consistent with the admitted evidence (no execution artifacts exist in inputs) and with assignment L5. V1 (single-image/version/axes/order/voxel), V2 (sparse/dense HCS + acquisition identity), V3 (collections incl. precedence/multiplicity), V4 (axes-driven controls + omero incl. mismatch), V5 (composed coords incl. uncalibrated/translation), V6 (labels incl. broadcast/rgba/fallback/legend/gating), V7 (malformed injection), V8 (large-data responsiveness/cancel/session-local), V9 (out-of-scope real-tool cross-check): each maps to the verified scope and is correctly labeled UNEXECUTED. Supported.

### VRF-12 — U012 (source-line index) — SUPPORTED

Spot-check of every index range against the complete read: storage L68–72; layout L73–77; images L79–100; arbitrary/order L93–94; ≤5-D/t<c<space L96–97; chunks L99–100; labels L102–117; same-or-1 L106–108; HCS L118–148; empty SHOULD NOT L128–129; `ome`/version L150–165; axes L167–174; transitional L60–64; comments L65–66; bioformats2raw L175–275 with sub-ranges; transforms L277–293; multiscales L295–319 + example L320–387 + choice L388–397; omero L399–430; labels L432–514; plate L516–739; well L741–808; naming L810–812; implementations L813–814; history L822–866; conformance L868–888; release L25–27. All match. Closing “S003-supported as cited; §§8–9 unsettled; §10 UNEXECUTED” is accurate. Supported.

## 6. Full-scope coverage, dead ends, and evaluation obligations

- **Assigned scope covered in full:** both brief-derived groups — (1) opening/listing/navigating and (2) channel/time/plane/coords/labels — verified through U004–U005 with governing conditions (U003), obligation split (U006), plan mapping (U007), limitations (U008), and uncertainties (U009). No admitted scope area was left unvisited.
- **Unvisited/dead-end areas:** none within admitted inputs. All six admitted paths were read to completion. No live-fetch or execution path was attempted because assignment L5 forbids it; that boundary is recorded, not a dead end.
- **Unsupported assertions:** none warranting UNSUPPORTED. Four strength/terminology clarifications are recorded in §5 (sniff-order synthesis; labels-exclusion derivation; omero-semantics inference; “normative example” → informative example). Each retains the candidate’s substance.
- **False dismissals:** none. No valid candidate claim was dismissed; SHOULD-elevations and proposals are preserved with provenance.
- **Conditions preserved:** Zarr-v3 unboundedness, location-agnosticism vs local boundary, version consistency, RFC 2119/transitional/non-normative rules, release status, literal key spellings — all carried from U003 into every disposition.
- **Source fit:** excellent. Every material claim traces to exact S003 lines; gaps are explicitly marked where S003 is silent; no invented format obligations were found.
- **Novelty:** no new format facts asserted beyond S003; novelty is limited to reasonable viewer-side synthesis (sniff order, failure taxonomy, composite selection keys, composition formula, degradation proposals), each labeled as derivation/proposal.
- **Counterevidence and uncertainty preserved:** §5 carries forward all 13 U009 items plus discovery/rendering/alignment caveats; none were resolved by assumption.

## 7. Plan implications (admitted plan: Viewer.md)

The thin plan is directionally compatible but requires the candidate’s extensions, here independently confirmed:

- Open/list (L5): add shape-sniffing, metadata-driven enumeration, acquisition-aware identity, `labels/` exclusion, version gating.
- Controls (L5): make channel/time/plane presence axis-driven; initialize best-effort from `omero`/`rdefs`.
- Overlays/details/level-choice (L5): implement `labels[]` discovery, integer/count validation, level-locked broadcast-aware alignment with warnings, `image-label` colors/legends; compose per-level + global transforms for calibrated readouts; traverse datasets in metadata order.
- Responsiveness/failures (L7/L11): implement background reads with cancellation and the item-scoped failure taxonomy; never crash or silently skip.
- Interoperability (L9): FLAG — acceptance needs real 0.5 filesets outside S003; plan cannot be closed on S003 alone.
- Boundaries (L9/L11): KEEP read-only/session-local, out-of-scope list, review gate, and acceptance shape with the raised bar above.

## 8. Unresolved areas (carried, not closed)

1. Real-world Zarr profile (codecs/chunks/dtypes) and backend coverage — S003 admits all of Zarr v3 by reference.
2. Reader-tolerance, caching, performance, and error-handling behavior — no implementation section in S003.
3. `dimension_names` enforcement locus (array `zarr.json` vs history note); null axis types; largest→smallest metric; scale-`1.0` duality; translation origin; global/per-level multi-axis composition; multi-`multiscales` normative force; omero length/semantics; label broadcast/precedence/transform governance; version-string vocabularies; `layout==3` meaning; multiple-acquisitions trigger; binary-`path` encoding; `field_count` semantics.
4. Version-mismatch, unlisted-label-scan, fallback-palette, appropriateness-heuristic, and message-wording product decisions.

## 9. Proposed validation (all UNEXECUTED)

No execution was allowed (assignment L5: S003-only, no live fetch) and none was performed. No filesets opened, no code run, no external queries issued. The following re-state the candidate’s V1–V9 as independent proposals:

- **PV-1 (UNEXECUTED):** single-image open; assert version consistency, axes↔shape↔`dimension_names` agreement, metadata-order traversal, composed voxel sizes vs §5 worked values.
- **PV-2 (UNEXECUTED):** sparse + dense HCS plates; assert well/field/acquisition enumeration and index↔path consistency.
- **PV-3 (UNEXECUTED):** collections with/without `series` and with/without `plate`; assert precedence, order correspondence, multiplicity visibility.
- **PV-4 (UNEXECUTED):** axes-driven controls across 2/3/4/5-D incl. untyped axes; assert slider presence and omero-init incl. mismatch degradation.
- **PV-5 (UNEXECUTED):** cursor/center coordinates through composed transforms at every level, incl. uncalibrated and translation cases.
- **PV-6 (UNEXECUTED):** label overlays incl. intermediate folders, broadcast, rgba/alpha, fallback palette, properties legend, mismatch warnings, dtype/count gating.
- **PV-7 (UNEXECUTED):** inject each §5/U008 malformed case; assert item-scoped messages, no crash, fallback selection.
- **PV-8 (UNEXECUTED):** large dataset; assert responsive navigation, cancellation, session-local settings, byte-identical sources.
- **PV-9 (UNEXECUTED, out-of-scope unless later authorized):** cross-check against real OME-Zarr 0.5 tool outputs and reader code to close §8(1–2).

## 10. Elapsed and usage costs (honest accounting)

- Budget: 900 elapsed seconds; 96 parent responses. Native retries/corrections consume the same budget.
- Actual: completed within budget in a single native Goal session at Max effort. No separate models, front ends, Goals, or subagents invoked. No live fetches, no external writes (no issues/PRs/comments/messages), no filesets opened, no code executed.
- Tool usage: `read_file` on TASK.md + six admitted inputs + S003 remainder window; `search` for workspace inventory and truncated-line recovery (results used only as search results per §2, plus one denied sandboxed-shell attempt and one denied escalated-shell attempt that consumed no evidence). Exact wall-clock seconds were not instrumented in this runtime; no elapsed figure is invented. No monetary/external-service cost incurred.
- Artifacts: `out/report.md` (this file), `out/acquisition.json`, `out/verification.json`.

*End of verification report. All dispositions are S003-grounded as cited; §8 records what the source does not settle; §9 is UNEXECUTED.*
