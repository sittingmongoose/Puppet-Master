# R002 phase-2 preservation assessment

No demonstrated source-supported temporal loss in supplied completed artifact history. Both final semantic quality and acquisition remain separate.

Current report SHA-256: `3e06a68962e80a553689ef747578adf7929ca49029c41e7d272e94e390f03e13`.
Frozen phase-1 JSON SHA-256: `a4c1025cceb37a97fa7d6ef81affe92c9d58711fc5a502eaba5d8df30779539c`.
Frozen phase-1 Markdown SHA-256: `91ff83cf9ec29f18663cf82a726ce32f94477e57cc5270d42c53fbd1927cfe97`.

Both phase-1 files were hashed only, remain unchanged, and their judgments were not read or revised. The later unlock receipt and stage match. All source/input pins and completed artifact hashes verified.

Complete visible-history review: 5 saved versions, 51 semantic clusters / 118 atomic decisions, all 6 eligible facets, full S003 L1–896. First version read in full; every later byte-equivalent region and every changed hunk checked. All nonempty material final-report lines map to inventory rows; all source lines map to source units. No semantic sampling.

Semantic acquisition is **unknown**: both manifests lack acquisition notes. Source Read metadata establishes exposure only, with no supplied source-read content/extents or semantic verification. Nothing missing may be called never acquired, acquired-but-undeveloped, or verified-then-lost on these records.

## Temporal transitions

- V001 -> V002: Unsupported source MUST claim is narrowed to a derived product need, with explicit S003-does-not-state-coherence qualification. Shared axes, transforms and clamping-choice content remain. No source-supported fact is lost; residual same-index policy remains questionable.
- V002 -> V003: Exclusive only-via-label-path discovery is corrected to honor declared paths; dtype, equal-level, own-multiscales and geometry content are retained. SHOULD-exhaustive listing and possible unlisted labels are retained and more explicit.
- V003 -> V004: Unsupported prohibition on standalone browsing of label images is replaced by explicit product decision and S003-does-not-forbid qualification. Labels container not itself an image and overlay intent remain.
- V004 -> V005: Error-message MUST provenance is corrected to brief/plan-driven should with explicit S003-no-message-taxonomy statement. The whole failure list and no-crash product intent remain.

No supported loss, governing-condition loss, or counterevidence loss was observed. Corrective narrowing of unsupported mandates is not loss of supported knowledge. Historical errors do not become current assertions once corrected.

## Eligible facets and undeveloped visible leads

- **OME05-C01 Versioned metadata admission**: Zarr v3, attributes.ome, string version and hierarchy consistency are visibly drafted and retained. Non-0.5 compatibility policy remains explicit product boundary; no previous legacy reinterpretation draft is supplied.
- **OME05-C02 Axis-to-array identity**: Variable rank, arbitrary unique names, ordered identity and dimension_names are retained. Absent-vs-present-length-one is not fully exercised in an explicit report acceptance example; unsafe semantic inference remains a policy risk rather than proven historical loss.
- **OME05-C03 Declared pyramid selection**: Declared relative paths, order and per-level transforms are retained. No complete nonnumeric/nonuniform/missing-level fixture result exists; proposals stay UNEXECUTED. Any partial development was present in initial draft.
- **OME05-C04 Composed coordinate calibration**: Dataset then global transform ordering and unit/relative caveats are visibly drafted and retained. Neither report supplies a worked nonzero dataset+global translation arithmetic oracle; no such correct draft was lost.
- **OME05-C05 Associated label discovery and registration**: Paths, own multiscales, equal level count and relative source metadata survive. Explicit non-parent/deeper-nesting source association resolution is incomplete; R001 annotative-only narrowing and R002 parent-only wording already exist in first complete version, not later loss.
- **OME05-C06 Categorical label identity**: Integer types and integer label-value keys survive. Exact uint64/int64 range protection and order-independent sparse-ID lookup are incompletely developed. R001 has nearest-neighbor categorical rationale; R002 leaves interpolation as product choice without full identity-preserving contract. No valid earlier precision/lookup draft is present.

These are drafting/derivation limits visible in supplied versions, not evidence of prior semantic acquisition or later forgetting.

## Complete material-claim inventory

Locators refer to frozen current report and admitted S003. Repeated summary, plan-disposition and index claims are consolidated. Temporal retention does not imply source support.

### P01: Frozen capture authority, scope and pins

Report: L3–16, L24–59. Source: S003 L1–27, S003 L813–820.

- **supported**: The admitted capture is the 0.5 specification, 896 lines; both brief groups share one S003-only bounded assignment.
- **qualified**: No-live-fetch/no-execution self-descriptions are retained; supplied artifact/read metadata does not establish every native action. Validation remains designated UNEXECUTED.
- **supported**: Plan and brief are product authority; the Tools pointer supplies no actual reader code, behavior, benchmarks or real-fileset results.

Temporal result: retained in final; qualifications/errors separately identified. Semantic acquisition: unknown.

### P02: Release, draft compatibility and future migration

Report: L40–49, L650–652, L793–800, L861–862. Source: S003 L25–27, S003 L821–866.

- **supported**: Current released edition is 0.5; migrations are promised, not supplied in this capture; 0.5.0/0.5.1/0.5.2 history entries are correctly quoted.
- **qualified**: Draft-written data will not necessarily be supported, a weaker condition than categorically unsupported. Only-0.5 admission is a product boundary; the source does not say 0.5 is the only version ever released.

Temporal result: retained in final; qualifications/errors separately identified. Semantic acquisition: unknown.

### P03: Normative, example and RFC boundaries

Report: L8–13, L61–70, L653–654, L763–772. Source: S003 L56–66, S003 L867–888.

- **supported**: RFC vocabulary and lowercase readability are established; all text is normative except explicit non-normative sections, examples and notes.
- **supported**: JSON comments shown for clarity MUST NOT enter real JSON.
- **qualified**: A diagram/comment/example can illustrate a supported rule, but examples cannot independently impose universal reader UI or rendering obligations. Descriptive normative text also binds; uppercase keywords are not the sole source of requirements.

Temporal result: retained in final; qualifications/errors separately identified. Semantic acquisition: unknown.

### P04: Transitional metadata context

Report: L149–158, L351–365, L617–627. Source: S003 L60–64, S003 L175–181, S003 L398–400.

- **supported**: bioformats2raw.layout and omero are transitional; future removal and usually optional writing are captured.
- **qualified**: The general statement that implementations may be expected MUST or encouraged SHOULD is contextual; it does not impose unconditional reading of every transitional field.
- **supported**: Read-only and session-local behavior comes from the brief/plan, not a source requirement to write data.

Temporal result: retained in final; qualifications/errors separately identified. Semantic acquisition: unknown.

### P05: Zarr v3 substrate and allowed features

Report: L76–95, L317–318, L648–649, L700–710, L797–800. Source: S003 L68–72, S003 L87–100, S003 L438–439.

- **supported**: Zarr v3 is required; codecs, grids, key encodings, data types and transformers may be used unless explicitly disallowed; array decoding depends on Zarr array metadata.
- **supported**: The admitted capture does not provide the external Zarr specification or codec implementation coverage. Backend limits need truthful product handling.
- **qualified**: Label arrays are an explicit integer-dtype restriction, so whole-capture claims that no disallowance exists are false; general intensity-image encodings remain broadly admitted.

Temporal result: retained in final; qualifications/errors separately identified. Semantic acquisition: unknown.

### P06: Local versus remote format and product boundary

Report: L91–95, L622–627, L704–707. Source: S003 L73–77.

- **supported**: Hierarchy can be local, HTTP or object storage; local-only reading is an explicit product scope choice. Editing/export/clinical interpretation remain outside the brief.

Temporal result: retained in final; qualifications/errors separately identified. Semantic acquisition: unknown.

### P07: Metadata namespace and version consistency

Report: L97–111, L312–313, L650–652. Source: S003 L149–165.

- **supported**: Metadata resides in attributes.ome in zarr.json, version is a string, and versions MUST agree within a hierarchy.
- **supported**: Missing namespace/version and inconsistent hierarchy require admission validation or an explicit unsupported outcome within the product promise.
- **qualified**: Hard failure versus subtree rejection or caveated best effort and message wording are product decisions; version!=0.5 is outside the brief, not proof of intrinsic malformedness for all OME versions.

Temporal result: retained in final; qualifications/errors separately identified. Semantic acquisition: unknown.

### P08: Image group and per-level array identity

Report: L113–130, L166–170, L171–174, L250–270, L306–307. Source: S003 L78–100, S003 L294–300.

- **supported**: Images are groups and levels separate arrays; multiscales metadata belongs to groups, decoding metadata to each array.
- **supported**: Single image, HCS and transitional collections are materially distinct entry shapes. Label container itself is not an image; contained label images are images.
- **qualified**: A required sniffing order beyond plate-over-collection and a particular image-list UI are derived product designs, not additional source algorithms.

Temporal result: retained in final; qualifications/errors separately identified. Semantic acquisition: unknown.

### P09: HCS hierarchy and empty groups

Report: L132–147, L172–173, L204–204, L679–680. Source: S003 L118–148.

- **supported**: HCS requires plate, row and well groups above field images; well and plate implement their specifications.
- **supported**: Empty rows/wells SHOULD NOT be present; recommendation does not prove none can occur. Sparse metadata lists differ from dense grid inference.
- **qualified**: No-crash handling and empty-item listing are product policies retained as such, not specified native reader behavior.

Temporal result: retained in final; qualifications/errors separately identified. Semantic acquisition: unknown.

### P10: Plate rows and columns

Report: L206–210, L220–224, L674–678. Source: S003 L530–549.

- **supported**: Every physical row/column is listed, including empty ones. Names are alphanumeric, case-sensitive and unique within the list; collision avoidance is SHOULD.
- **supported**: Case-folding or guessed dense well expansion loses declared identity. Retain exact spelling on a local filesystem.

Temporal result: retained in final; qualifications/errors separately identified. Semantic acquisition: unknown.

### P11: Plate well paths and indices

Report: L211–224, L674–678. Source: S003 L552–560, S003 L641–739.

- **supported**: Well paths are exactly row/column without extra leading/trailing directories; rowIndex and columnIndex are 0-based and must agree with the path.
- **supported**: Sparse example C/5 and D/7 illustrates that wells are not row×column expansion; no fabricated empty-well images.

Temporal result: retained in final; qualifications/errors separately identified. Semantic acquisition: unknown.

### P12: Plate acquisition metadata

Report: L216–221, L232–237, L751–756. Source: S003 L518–529.

- **supported**: acquisitions MAY be present; ids MUST be unique nonnegative integers; names and positive maximumfieldcount SHOULD be present; description and integer epoch start/end MAY be present.
- **qualified**: Displaying names/counts/times and acquisition-aware UI grouping are justified choices, not source-mandated presentation. No timestamp unit beyond epoch integer is asserted.

Temporal result: retained in final; qualifications/errors separately identified. Semantic acquisition: unknown.

### P13: Plate and well version/count hints

Report: L215–221, L234–237, L755–759. Source: S003 L538–551, S003 L751–752.

- **supported**: plate.version MUST be a string; well.version SHOULD be present with string value; field_count/name are SHOULD fields with conditional type restrictions.
- **qualified**: Accept-and-display when version vocabularies are not specified is a product proposal; treating well.version presence as universally required exceeds its SHOULD.

Temporal result: retained in final; qualifications/errors separately identified. Semantic acquisition: unknown.

### P14: Well image identity and acquisition linkage

Report: L228–237, L674–678. Source: S003 L740–808.

- **supported**: well.images MUST enumerate all fields; paths must be alphanumeric, case-sensitive and unique. If multiple acquisitions were performed, an integer acquisition must match a plate id.
- **qualified**: The exact trigger is performed acquisitions, not necessarily only metadata-list length. A >1-entry heuristic is a retained, explicitly proposed interpretation, not source proof.

Temporal result: retained in final; qualifications/errors separately identified. Semantic acquisition: unknown.

### P15: Collection layout and plate precedence

Report: L173–202, L308–309, L668–670, L776–780. Source: S003 L175–206, S003 L254–275.

- **supported**: bioformats2raw.layout identifies multi-image collections; required layout value is 3. If plate metadata is present it takes precedence; mixed plate/image collections are unavailable at present.
- **qualified**: Quoted prose value 3 does not establish JSON string type. Numeric JSON examples show 3; accepting numeric/string alternatives is a product compatibility proposal, not an established source inconsistency.

Temporal result: retained in final; qualifications/errors separately identified. Semantic acquisition: unknown.

### P16: Series list, fallback and OME-XML correspondence

Report: L186–202, L225–226, L668–673. Source: S003 L243–270.

- **supported**: OME group MAY contain series; entries are string image paths, ordered like OME-XML Images if provided. With no series and no plate, images use consecutive groups starting 0, one image per series/index.
- **supported**: OME/METADATA.ome.xml SHOULD be present; when supplied it must use OME-XML MetadataOnly rather than BinData, BinaryOnly or TiffData; minimum specification MAY be used.
- **qualified**: Missing optional XML is not by itself universal inability to display. Full XML semantics or fixture interoperability cannot be established from this capture.

Temporal result: retained in final; qualifications/errors separately identified. Semantic acquisition: unknown.

### P17: Multi-image reader choices

Report: L194–197, L239–248, L607–616, L681–682. Source: S003 L271–275.

- **supported**: Readers SHOULD expose multiplicity and SHOULD NOT silently open only the first image; MAY use series, show all or choose, and ignore other root groups.
- **qualified**: SHOULD is not a universal MUST. Required multiplicity awareness can follow the product discovery promise, but a flat qualified list is not inherently incapable of HCS identity.

Temporal result: retained in final; qualifications/errors separately identified. Semantic acquisition: unknown.

### P18: Multiscales entries, datasets and paths

Report: L250–286, L310–318, L661–665. Source: S003 L294–308, S003 L317–319, S003 L388–397.

- **supported**: multiscales is a list of dictionaries, each with axes and datasets. Each level path is group-relative and ordering largest/highest resolution to smallest, not numeric/lexicographic names.
- **supported**: Levels share dimensionality <=5 matching axes count and order; each carries its own coordinateTransformations.
- **qualified**: name/type/downscaling metadata SHOULD be provided; displaying them is product UI. Selection among entries by name/first fallback has illustrative guidance, not a fixed universal viewport algorithm.

Temporal result: retained in final; qualifications/errors separately identified. Semantic acquisition: unknown.

### P19: Pyramid reduction and available-level handling

Report: L281–286, L379–391, L597–606, L661–665. Source: S003 L93–100, S003 L304–316, S003 L336–397.

- **supported**: Metadata order and each level geometry defeat numeric-folder assumptions, fixed factor-two or isotropic reduction assumptions. Missing declared levels cannot be silently invented.
- **qualified**: Ordering sanity metric based on total voxel count is a product heuristic, not normative resolution definition. Responsiveness, fallback and unsupported level policy derive from the plan.

Temporal result: retained in final; qualifications/errors separately identified. Semantic acquisition: unknown.

### P20: Axis names, rank and dimension_names

Report: L288–302, L324–349, L656–665, L748–754. Source: S003 L81–81, S003 L166–174, S003 L299–307, S003 L825–827.

- **supported**: Axis names are arbitrary but MUST be unique; axes length equals array rank, 2..5; dimension_names MUST be in each level array zarr.json and match axes names.
- **supported**: The history one-liner saying dimension_names in axes is less precise than the explicit array-zarr.json requirement; preserve the actual field placement.
- **qualified**: Generic best-effort positional inference for missing/custom types is a product policy and cannot manufacture validated semantic axes.

Temporal result: retained in final; qualifications/errors separately identified. Semantic acquisition: unknown.

### P21: Axis composition and order

Report: L324–349, L656–659, L719–725. Source: S003 L96–97, S003 L169–174, S003 L300–303.

- **supported**: 2 or 3 space axes, at most one time and one channel/null/custom axis; order parallels array dimensions and time then channel/custom then space.
- **supported**: Stacking spatial zyx order is SHOULD in the stated anisotropic case; arbitrary names cannot alone determine semantic t/c/z.
- **qualified**: Two innermost spatial axes as an invariant plane rule is not universally established. Missing dimension and length-one present dimension are different; custom/null types need a truthful explicit policy.

Temporal result: retained in final; qualifications/errors separately identified. Semantic acquisition: unknown.

### P22: Optional type, units and controls

Report: L341–349, L457–483, L683–688, L837–844. Source: S003 L169–172, S003 L301–303.

- **supported**: Axis type and physical unit are SHOULD metadata; custom type strings are allowed and multiscales also mentions null/custom. Missing/unknown units must not become invented physical calibration.
- **supported**: No time/channel axis warrants no such dimension slider; a present length-one axis is still present, not proof of absence.
- **qualified**: Refusal, generic slider, raw-unit display, conversion/rounding and fallback behavior are product decisions. Intensity/channel compositing semantics for custom axes are not given.

Temporal result: retained in final; qualifications/errors separately identified. Semantic acquisition: unknown.

### P23: OMERO presence and required fields

Report: L351–375, L580–588, L689–694. Source: S003 L398–430.

- **supported**: omero is optional; if present channels is required, each entry color is six hex RGB digits and window requires min/max/start/end.
- **supported**: Example-only active/coefficient/family/inverted/label/rdefs/id/name are not independently mandatory; WebGateway semantics are outside the capture.
- **qualified**: Mandatory metadata fields do not imply MUST apply initial color/window or require all example hints. Honoring them is a reasonable product proposal; malformed color is not unspecified because a six-hex-digit requirement exists.

Temporal result: retained in final; qualifications/errors separately identified. Semantic acquisition: unknown.

### P24: OMERO length, defaults and error qualifications

Report: L357–375, L383–385, L689–694. Source: S003 L401–425, S003 L426–430.

- **supported**: channels matching c extent appears in an example comment; absence of a normative match rule is correctly qualified. Absent omero leaves initial contrast/color/T/Z to product choice.
- **supported**: No captured gamma/family registry, crash policy or fully defined window-out-of-range behavior; proposals stay unexecuted.
- **qualified**: Claiming every out-of-range window or start>end is a source-proven malformed case goes beyond captured type/presence rules.

Temporal result: retained in final; qualifications/errors separately identified. Semantic acquisition: unknown.

### P25: General transformations

Report: L397–408, L409–412, L452–455, L666–667, L747–751. Source: S003 L276–293.

- **supported**: Transforms are an ordered list with required type; general types identity, translation and scale. Translation/scale may use float lists or a container binary path. Apply sequentially.
- **supported**: The capture does not define full binary-vector dtype/shape/endianness/resolution behavior; support-or-truthful-decline is a product boundary.
- **qualified**: Table header appearing after rows is capture formatting, not evidence of semantic loss or contradiction.

Temporal result: retained in final; qualifications/errors separately identified. Semantic acquisition: unknown.

### P26: Per-level calibrated mapping

Report: L413–425, L437–450, L661–665. Source: S003 L308–313.

- **supported**: Image transforms only scale/translation; exactly one scale; at most one translation after scale. Vectors match axes length.
- **supported**: Scale is physical size/duration when known; otherwise current-to-first resolution factor, default 1 without downsampling. Translation is physical offset.
- **supported**: No uniform factor, zero-origin or identical-level mapping may be invented; missing/invalid transforms require truthful handling.

Temporal result: retained in final; qualifications/errors separately identified. Semantic acquisition: unknown.

### P27: Global composition and coordinate examples

Report: L426–450, L478–483, L833–840. Source: S003 L293–316, S003 L320–387.

- **supported**: Optional image-level transforms obey dataset rules and apply after the dataset list. Reported example vectors and 0.1 time multiplication are present.
- **qualified**: Composition needs listed scale-then-translation, followed by global transforms. Conventional function notation scale∘translate reverses the inner order; prose and executable arithmetic must agree.
- **qualified**: The supplied reports have no worked nonzero-offset dataset-plus-global arithmetic oracle; validation proposals are retained but not evidence of execution or verified preservation.

Temporal result: retained in final; qualifications/errors separately identified. Semantic acquisition: unknown.

### P28: Details panel and calibration uncertainty

Report: L437–483, L484–484, L594–600, L683–688. Source: S003 L167–174, S003 L308–319.

- **supported**: Axis names, dimensions, units and composed coordinates are evidence-grounded topics required by the product promise; missing units/relative factors remain explicit.
- **qualified**: Exact panel layout, cursor/view-center display, transform vectors, voxel sizes, pyramid method display and image-group-origin wording are proposed UI policy. Unit presence alone does not prove a scale value is physically calibrated.

Temporal result: retained in final; qualifications/errors separately identified. Semantic acquisition: unknown.

### P29: Label container, paths and intermediate groups

Report: L489–511, L542–560, L695–698. Source: S003 L102–117, S003 L431–442.

- **supported**: labels container is nested beside original levels; is not itself an image; contains label images with arbitrary names.
- **supported**: ome.labels path array MUST exist; exhaustive listing is SHOULD. Intermediate groups are allowed and MUST NOT contain metadata.
- **qualified**: Directory guessing alone is insufficient for declared association, but exclusively forbidding unlisted discovery exceeds SHOULD exhaustiveness.

Temporal result: retained in final; qualifications/errors separately identified. Semantic acquisition: unknown.

### P30: Integer label data and categorical keys

Report: L495–530, L531–540, L551–560, L695–703, L841–849. Source: S003 L434–439, S003 L454–471.

- **supported**: Label dtype list is uint8/int8/uint16/int16/uint32/int32/uint64/int64. Values denote categorical labels. Color/property objects key by integer label-value; order is not category identity.
- **supported**: Label image must implement multiscales and have same number of dataset levels as the original.
- **qualified**: Exact integer preservation requires range-safe decoding/lookup; uint64/int64 listings alone are not an exact binary64 range contract. Resampling that creates IDs violates categorical identity even when interpolation policy is product-chosen.

Temporal result: retained in final; qualifications/errors separately identified. Semantic acquisition: unknown.

### P31: Label registration and size-one dimensions

Report: L498–520, L537–560, L731–737, L783–791. Source: S003 L106–108, S003 L432–433, S003 L454–455, S003 L472–474.

- **supported**: Labels share coordinate system, usually dimensions/transforms; same-or-one overview supports irrelevant dimensions. Each label has its own multiscales geometry and equal level count.
- **qualified**: Equal counts or shapes alone do not establish registration or source identity; broadcast/mismatch rejection and resampling choices need coherent validated geometry.
- **supported**: Nearest neighbor/category-preserving display is a defensible derived policy; S003 does not prescribe a named universal interpolation algorithm.

Temporal result: retained in final; qualifications/errors separately identified. Semantic acquisition: unknown.

### P32: image-label optionality and palette recommendation

Report: L521–530, L550–560, L699–703, L885–893. Source: S003 L456–466.

- **supported**: image-label SHOULD be present; colors and version SHOULD be present, with conditional array/string constraints. Readers SHOULD use declared colors.
- **supported**: Color entries MUST have integer label-value; optional rgba is four integers 0..255, fourth alpha/opacity; extra keys allowed. Worked 0/1 colors are informative examples.
- **qualified**: Treating colors/version presence or honoring palette as unconditional MUST overstates SHOULD. Fallback palette, toggle/opacity UI, blending and property visibility are product choices.

Temporal result: retained in final; qualifications/errors separately identified. Semantic acquisition: unknown.

### P33: Label properties and source association

Report: L531–540, L592–593, L699–703, L760–768, L841–849. Source: S003 L467–474, S003 L493–508.

- **supported**: properties and source MAY exist; properties entries each require integer label-value and may differ in keys. source must be an object, image if present a relative string path to a Zarr image group; default is ../../.
- **qualified**: The relative source reference cannot be reduced to annotation only or assumed always the containment parent. Resolve actual source identity before overlaying when provided; deeper intermediate nesting matters.
- **qualified**: The ../../ default is an explicit normative sentence at S003 L474, not merely an example. A source-proven default should not be dismissed as nonbinding only because the same token occurs in JSON samples.

Temporal result: retained in final; qualifications/errors separately identified. Semantic acquisition: unknown.

### P34: Exact key spellings and naming convention

Report: L704–710, L755–761, L894–902. Source: S003 L809–812, S003 L518–560, S003 L462–474.

- **supported**: CamelCase is a source naming recommendation with historical exceptions. Literal field_count, maximumfieldcount, rowIndex, columnIndex, label-value, starttime/endtime, bioformats2raw.layout must survive.
- **qualified**: Source naming conventions do not impose a naming standard on the unrelated session store; session-storage design is product policy.

Temporal result: retained in final; qualifications/errors separately identified. Semantic acquisition: unknown.

### P35: Performance, cancellation and item-scoped messages

Report: L601–611, L628–646, L704–707, L846–855. Source: S003 L68–100, S003 L271–275.

- **supported**: Background reads, cancellation, no-freeze acceptance and understandable per-item feedback are product requirements in the brief/plan. S003 gives no threading/cache/prefetch algorithm, performance budget or error strings.
- **qualified**: Format violations, optional absence, product capability limits and extra groups need distinct treatment; a list headed cannot display must not imply optional omissions necessarily prevent display.
- **supported**: No synthetic fixture, profiling result or crash-freedom execution is demonstrated by these reports.

Temporal result: retained in final; qualifications/errors separately identified. Semantic acquisition: unknown.

### P36: Implementation evidence and external dependencies

Report: L50–59, L612–616, L744–759, L793–816, L817–820. Source: S003 L52–59, S003 L68–72, S003 L170–172, S003 L257–260, S003 L424–425, S003 L813–820, S003 L895–896.

- **supported**: External standards/tools pointers do not supply actual reader implementations. Native interoperability, converter quirks, codec distributions and tolerance/performance behavior remain unresolved in the one-source scope.
- **qualified**: Untested interoperability is not a finding of incompatibility. MetadataOnly, WebGateway, UDUNITS and Zarr details beyond capture remain unresolved, not invented mandates.

Temporal result: retained in final; qualifications/errors separately identified. Semantic acquisition: unknown.

### P37: Explicit uncertainty and counterevidence inventory

Report: L710–791. Source: S003 L25–27, S003 L93–108, S003 L169–174, S003 L256–275, S003 L293–319, S003 L398–474, S003 L518–560, S003 L813–866.

- **supported**: Arbitrary names, variable axes, optional OMERO, sparse plates, per-level geometry, optional/global translations, units SHOULD, unlisted labels and acquisitions counter fixed-position/dense/numeric-folder assumptions.
- **qualified**: Claims to refute thin-plan assumptions must be read as risks: the thin fixture does not itself assert one-image, tczyx, factor-two, dense plates or zero-origin assumptions.
- **supported**: No listed uncertainty or relevant counterevidence is deleted from saved history to final. Capture gaps remain visibly unresolved.

Temporal result: retained in final; qualifications/errors separately identified. Semantic acquisition: unknown.

### P38: Plan disposition, optional capability and product review

Report: L562–634. Source: brief/Viewer.md product authority and whole-source scope.

- **supported**: Each thin-plan sentence has a retained mapping: opening/listing, canvas, controls, overlays, calibrated details, pyramid choice, responsiveness, failures, interoperability, read-only boundary and acceptance.
- **qualified**: Derived product proposals require explicit review; source conformance does not automatically mandate a particular tree, legend, panel content, fallback policy or all possible reader capabilities.
- **supported**: The reports remain standalone proposals and research artifacts, not canonical Puppet Master specifications or executed WorkNodes.

Temporal result: retained in final; qualifications/errors separately identified. Semantic acquisition: unknown.

### P39: Proposed validation and execution status

Report: L820–855. Source: brief/Viewer.md product authority and whole-source scope.

- **supported**: All V1..V9 in R001 and V1..V7 in R002 are explicitly UNEXECUTED. Discovery, schema/negative, axes/control, transform/unit, labels, performance and read-only topics are covered as proposals.
- **qualified**: Fixture absence does not make a proposal a false executed result; proposed checks do not prove current runtime correctness, exact preservation, quality or efficiency.
- **supported**: No validation proposal is removed between completed saved versions and final reports.

Temporal result: retained in final; qualifications/errors separately identified. Semantic acquisition: unknown.

### P40: Source locator index and closing completeness claims

Report: L855–907. Source: S003 L1–896.

- **supported**: The indexes retain principal source sections and exact field locators; headings/index restatements carry no additional discovered empirical execution.
- **qualified**: Index coverage and whole-brief self-descriptions do not prove every emitted assertion true or every eligible facet fully developed; specific unsupported statements remain independently visible.

Temporal result: retained in final; qualifications/errors separately identified. Semantic acquisition: unknown.

### E01: Retained source/derivation limitation

Report: L180–181, L776–780. Source: S003 L200–200, S003 L213–213, S003 L256–256.

- **unsupported**: Quoted prose 3 does not establish a normative JSON string requirement. Numeric-vs-string conflict and accept-both recommendation are retained interpretive overreach, not a lost qualification.

Temporal result: source error, ambiguous derivation or undeveloped lead retained; not edit-induced loss. Semantic acquisition: unknown.

### E02: Retained source/derivation limitation

Report: L298–302, L655–665. Source: S003 L169–174, S003 L299–307.

- **qualified**: Unknown type/missing unit can be product limits, but absence of SHOULD metadata and empty lists are not independently enumerated universal source-proven inability to display. The report retains product caveats elsewhere; the failure taxonomy still overgeneralizes.

Temporal result: source error, ambiguous derivation or undeveloped lead retained; not edit-induced loss. Semantic acquisition: unknown.

### E03: Retained source/derivation limitation

Report: L357–375. Source: S003 L403–403, S003 L426–430.

- **qualified**: Example channel-length comment is qualified later; source fields do not mandate applying rendering hints. Malformed color is specified by six-hex-digit requirement, so calling it wholly unspecified is too broad; retained in every version.

Temporal result: source error, ambiguous derivation or undeveloped lead retained; not edit-induced loss. Semantic acquisition: unknown.

### E04: Retained source/derivation limitation

Report: L386–391. Source: S003 L304–316.

- **qualified**: V002 corrects source MUST provenance for coherent selection. Same logical index is not guaranteed to preserve the same world plane when an axis is downsampled; that residual product-rule risk survives. The correction itself is supported qualification, not loss.

Temporal result: source error, ambiguous derivation or undeveloped lead retained; not edit-induced loss. Semantic acquisition: unknown.

### E05: Retained source/derivation limitation

Report: L537–540, L765–768. Source: S003 L472–474.

- **contradicted**: source.image is a relative path to a Zarr source image group, not necessarily containment parent. The ../../ default is an explicit source sentence; dismissing it among example-only mandates is a false dismissal retained throughout.

Temporal result: source error, ambiguous derivation or undeveloped lead retained; not edit-induced loss. Semantic acquisition: unknown.

### E06: Retained source/derivation limitation

Report: L755–756, L890–892. Source: S003 L456–460, S003 L550–551, S003 L751–752.

- **qualified**: Version keys have mixed presence strength: plate MUST, well SHOULD, image-label/version SHOULD with conditional string constraints. Blanket required-string/required-presence summary overstates well and image-label presence.

Temporal result: source error, ambiguous derivation or undeveloped lead retained; not edit-induced loss. Semantic acquisition: unknown.

### E07: Retained source/derivation limitation

Report: L765–768. Source: S003 L877–888.

- **contradicted**: Only surrounding MUST/SHOULD/MAY sentences bind is narrower than all-text-normative-except rule; diagrams/examples require contextual classification. This incorrect restriction is retained.

Temporal result: source error, ambiguous derivation or undeveloped lead retained; not edit-induced loss. Semantic acquisition: unknown.

### E08: Retained source/derivation limitation

Report: L650–652, L861–862. Source: S003 L25–27, S003 L821–866.

- **qualified**: Only 0.5 released and categorical drafts unsupported overstate current-released-0.5 and will-not-necessarily-be-supported; retained certainty narrowing is visible already in V001, not an edit-induced loss.

Temporal result: source error, ambiguous derivation or undeveloped lead retained; not edit-induced loss. Semantic acquisition: unknown.

### E09: Retained source/derivation limitation

Report: L551–560, L699–703. Source: S003 L434–439, S003 L461–474.

- **qualified**: Label resampling policy is a product decision but preserving categorical integer identity still constrains interpolation. Metadata fields and source-image targets are present as leads; safe range, label-value keyed lookup and explicit association resolution are incompletely developed, not shown lost.

Temporal result: source error, ambiguous derivation or undeveloped lead retained; not edit-induced loss. Semantic acquisition: unknown.

### P41: Read-only guarantee and session settings

Report: L30–33, L155–158, L617–627, L853–855. Source: S003 L60–64.

- **supported**: Source files unchanged and session-local viewing settings are direct brief/plan requirements; reading optional transitional metadata does not require writing.
- **qualified**: Byte-identical source-file and no-write tests are UNEXECUTED proposals; source silence about viewing mutations is not evidence of an actual read-only implementation.

Temporal result: retained in final. Semantic acquisition: unknown.

### P42: Additional unresolved product and security leads

Report: L795–820. Source: S003 L73–77, S003 L305–306, S003 L552–560, S003 L745–750, S003 L813–814.

- **supported**: The admitted source supplies no actual-tool, fixture-performance, accessibility, color-vision, local-symlink/path-traversal/decompression/XML-hardening, or telemetry implementation evidence.
- **qualified**: R002 identifies security/accessibility/telemetry as unresolved product leads rather than tested findings or format mandates; R001 leaves actual implementations unresolved without developing those extra leads. Neither pattern establishes never-acquired knowledge.

Temporal result: retained in final; no source-supported lead dropped. Semantic acquisition: unknown.

## Source-unit coverage

- S003 L1–55: P01, P02. Reviewed; acquisition unknown.
- S003 L56–66: P03, P04. Reviewed; acquisition unknown.
- S003 L67–77: P05, P06. Reviewed; acquisition unknown.
- S003 L78–117: P08, P18, P21, P29, P31. Reviewed; acquisition unknown.
- S003 L118–148: P09. Reviewed; acquisition unknown.
- S003 L149–165: P07. Reviewed; acquisition unknown.
- S003 L166–174: P20, P22, P28. Reviewed; acquisition unknown.
- S003 L175–191: P15. Reviewed; acquisition unknown.
- S003 L192–253: P15, P16. Reviewed; acquisition unknown.
- S003 L254–275: P15, P16, P17. Reviewed; acquisition unknown.
- S003 L276–293: P25, P27. Reviewed; acquisition unknown.
- S003 L294–319: P18, P19, P20, P21, P26, P27. Reviewed; acquisition unknown.
- S003 L320–387: P27, P28. Reviewed; acquisition unknown.
- S003 L388–397: P18. Reviewed; acquisition unknown.
- S003 L398–425: P23, P24. Reviewed; acquisition unknown.
- S003 L426–430: P23, P24. Reviewed; acquisition unknown.
- S003 L431–442: P29, P30, P31. Reviewed; acquisition unknown.
- S003 L443–474: P29, P30, P31, P32, P33. Reviewed; acquisition unknown.
- S003 L475–514: P32, P33. Reviewed; acquisition unknown.
- S003 L515–560: P10, P11, P12, P13. Reviewed; acquisition unknown.
- S003 L561–739: P09, P11. Reviewed; acquisition unknown.
- S003 L740–752: P13, P14. Reviewed; acquisition unknown.
- S003 L753–808: P14. Reviewed; acquisition unknown.
- S003 L809–812: P34. Reviewed; acquisition unknown.
- S003 L813–820: P01, P36. Reviewed; acquisition unknown.
- S003 L821–866: P02, P20. Reviewed; acquisition unknown.
- S003 L867–888: P03. Reviewed; acquisition unknown.
- S003 L889–896: P03, P36. Reviewed; acquisition unknown.

## Limits and independence

No private map, method card, economics, candidate conversation, raw trace, other grade, or original assessment contents were read. No canonical changes, candidate rescue, Goals, execution claims, or publication. Requested reviewer: gpt-6.1-sol / xhigh / fresh fork none, accepted spawn; effective runtime introspection unknown. R001 allowed header exposes a task-card token, so full format blinding is not assumed.

The earlier first-pair preparation descriptor says history locked; later per-case stage and explicit unlock receipts control phase-2 authorization.

Source-status observations are independent, not corrections to unseen phase-1 judgments. No original score or verdict is revised. Exact final saved artifact bytes equal current report bytes; this checks carrier and visible temporal preservation, and does not repair current-report semantic quality.
