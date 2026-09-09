# Proposed decisions for the synthetic viewer

60 separate review questions, consolidated across the completed comparisons. Every answer is blank. These are synthetic experiment drafts, not approved requirements or questions reopening Puppet Master decisions. Recommendations are evaluator judgments.

All options remain local and read-only, with no source editing, image/data export, remote storage/services or clinical interpretation. A conditional question applies only if its prerequisite capability is chosen. Choosing a support boundary never permits silently misreading an admitted input.

## Read transitional multi-image filesets

Should the viewer admit local bioformats2raw multi-image containers and their declared series?[^d1]

**Why:** A supported image group can sit beneath a container rather than at the selected root.

**What you get:** List the images from declared series or the specifically defined numbered fallback, with stable paths and incomplete-discovery feedback.

**What it costs:** More hierarchy validation, missing-reference cases and version-specific acceptance beyond direct image opening.

**Needs:** Metadata node identity; Bounded cancellable traversal; Version-pinned container fixtures.

**Options:**

1. Keep a direct-image support boundary with an explanation for unsupported containers.
2. Admit the specified transitional container organizations after their navigation fixtures pass.

**Evaluator recommendation:** Review this container capability separately and apply declared routing rules within whichever scope is admitted.

**Your answer:**

**Boundary:** Scope normalization of a native proposed repair; no unconditional support follows from format semantics. No new collection dashboard.

## Read plate, well and field containers

Should the viewer admit local plate/well containers and expose their declared images and acquisitions?[^d2]

**Why:** Plate structure identifies fields that a flat image-root reader can miss.

**What you get:** A complete, truthful list of supported well/field/acquisition identities, retaining usable images when another item fails.

**What it costs:** Acquisition and sparse-field cases, missing metadata, cancellation and larger inventories.

**Needs:** Plate/well reference validation; Stable image identity; Bounded traversal.

**Options:**

1. Keep plates outside the admitted container profile with an explanation.
2. Admit plate/well/field navigation through a list after representative checks.

**Evaluator recommendation:** Decide plate admission independently of grid or mosaic UI; require truthful completeness within the chosen profile.

**Your answer:**

**Boundary:** A list is sufficient for this choice. Plate grid, acquisition-filter UI and physical stitching are separate.

## Find images inside an unrecognized group

Should opening a chosen local group inspect bounded child metadata for supported images even when the parent lacks a recognized container marker?[^d3]

**Why:** A generic parent can contain valid images without itself being an image.

**What you get:** Discover nested supported images and distinguish an incomplete scan from an empty result.

**What it costs:** Traversal limits, ambiguous boundaries, unreadable subgroups and additional metadata I/O.

**Needs:** Explicit selected local boundary; Cancellable metadata traversal; Partial-error reporting.

**Options:**

1. Require a recognized image or admitted container entry point.
2. Allow a bounded child-metadata search within the chosen boundary.

**Evaluator recommendation:** Consider the bounded search if real nesting warrants it; never imply arbitrary recursive support or a complete scan after cancellation.

**Your answer:**

**Boundary:** This is within one chosen boundary, distinct from browsing multiple filesets in a parent folder; no external references or automatic upward escape.

## Browse filesets in a selected parent folder

Should users initiate bounded parent-folder discovery with cheap thumbnails and access to each full image list?[^d4]

**Why:** Opening one known fileset is insufficient for browsing a large collection.

**What you get:** Find filesets behind wrappers and inspect their metadata-derived image lists.

**What it costs:** Traversal and thumbnail limits, cancellation, partial errors, stable identity and a cache outside source data.

**Needs:** Traversal/thumbnail limits; Cancellation; Stable fileset identity; Cache outside source data.

**Options:**

1. Keep opening a chosen fileset
2. Add user-initiated bounded folder browsing

**Evaluator recommendation:** Evaluate bounded folder browsing if collection discovery is needed; show incomplete scans.

**Your answer:**

**Boundary:** No persistent CSV/catalog mandate, local HTTP service or source mutation; a thumbnail cannot stand for a complete image list.

## Keep a collection catalog between sessions

Should the optional collection browser retain its inventory between sessions?[^d5]

**Why:** Remembering a scan could speed repeat browsing, but saved records can become stale when datasets move or change.

**What you get:** Quicker return to previously scanned folders with a refreshable inventory rather than a new full scan every time.

**What it costs:** Application-owned storage, dataset identity and invalidation, deletion and refresh rules, and clear handling of stale or missing paths. Persistence adds maintenance beyond a temporary scan.

**Needs:** Optional collection browser; Identity/invalidation; Application-owned storage.

**Applies if:** Relevant if collection browsing is added through folder discovery or a local manifest; either can populate the catalog.

**Options:**

1. Discard the catalog when the session ends.
2. Persist it outside source filesets with explicit refresh, invalidation and deletion behavior.

**Evaluator recommendation:** Keep the first catalog temporary unless repeat-scan measurements justify persistence.

**Your answer:**

**Boundary:** This stores collection inventory, not timepoint pixels; it is distinct from the separate per-image metadata-cache proposal.

## Use a manifest instead of scanning a folder

Should the optional collection browser accept a manifest listing local filesets as an alternative to recursive scanning?[^d6]

**Why:** A supplied list could avoid expensive traversal and make a chosen collection reproducible.

**What you get:** A defined set of local datasets to browse without relying entirely on folder discovery.

**What it costs:** A manifest format, path and metadata-type validation, stale/moved-path handling and another import workflow. A manifest can omit datasets or disagree with current storage.

**Needs:** Defined local manifest; Path/type validation; Stale-path handling.

**Options:**

1. Use direct selection or scanning only.
2. Accept a validated manifest as another way to populate the collection browser.

**Evaluator recommendation:** Defer manifest import until a concrete collection workflow needs a supplied list and its format can be defined.

**Your answer:**

**Boundary:** A manifest does not certify dataset validity or add remote access, automatic conversion or export.

## Open a selected array by resolving its owner

Should the viewer let users start at a local subarray and resolve the image context that gives it meaning?[^d7]

**Why:** Users may arrive at a level array rather than its image group, but the immediate parent is not always the metadata owner.

**What you get:** A convenience entry path that can locate a valid owning context and ask for selection when more than one exists.

**What it costs:** Bounded upward/reference discovery, extra navigation and handling of zero or multiple owners. Guessing an owner can give the right pixels the wrong coordinates.

**Needs:** Bounded owner-context discovery; Ambiguity handling.

**Options:**

1. Require selection of a supported image/fileset entry point.
2. Allow direct-array entry after its owner and coordinate context are resolved.

**Evaluator recommendation:** Defer this convenience until owner resolution and ambiguous-entry handling are defined; never infer an owner solely from the nearest folder.

**Your answer:**

**Boundary:** No implicit remote reference traversal, new admitted container breadth or calibration guess is authorized.

## Choose an image representation explicitly

Should users have a named chooser for multiple multiscales entries?[^d8]

**Why:** A fallback entry can hide alternative representations.

**What you get:** Access to alternative coordinate contexts within the group.

**What it costs:** Separate entry/level identities, per-image state resets and potentially incompatible geometry.

**Needs:** Entry/level identity; State reset; Coordinate-context validation.

**Options:**

1. Keep a documented fallback entry
2. Add a named entry chooser

**Evaluator recommendation:** Add a chooser only if access to alternatives is needed and state identity is sound.

**Your answer:**

**Boundary:** Identity correctness does not itself approve a new chooser UI.

## Link a separate local label fileset to an image

Should users be able to associate an existing separate local label fileset with an image after verifying their coordinate relationship?[^d9]

**Why:** Derived labels can live separately from a read-only source, outside the ordinary registered-label hierarchy.

**What you get:** Inspection of compatible external labels without copying or editing the source image.

**What it costs:** Explicit source selection, reference and transform validation, ambiguity handling and extra linking UI. Matching dimensions alone cannot establish alignment.

**Needs:** Explicit user selection of both local inputs; Verified source/coordinate relationship.

**Options:**

1. Use only supported labels discovered through the fileset’s declared context.
2. Allow an explicit local link after source identity and coordinate mapping are verified.

**Evaluator recommendation:** Consider this only for a concrete separate-label workflow, with an explicit unresolved state when alignment cannot be established.

**Your answer:**

**Boundary:** This does not create labels, rewrite either fileset, relax stored-format rules, or invent source defaults for absent metadata objects.

## Add bounded OME-Zarr 0.4 reading

Should the viewer read specifically tested 0.4 files as well as final 0.5?[^d10]

**Why:** Older local collections may be useful, but have different storage and metadata.

**What you get:** Broader catalog access.

**What it costs:** Version-specific adapters, v2 codecs, namespace tests, packaging and maintenance.

**Needs:** Version-specific v2 adapters; Codec/namespace fixtures; Packaging.

**Options:**

1. Keep the 0.5 limit with explanations
2. Add explicitly pinned 0.4 support

**Evaluator recommendation:** Add only if target files justify the extra compatibility surface.

**Your answer:**

**Boundary:** No automatic tolerance of 0.1–0.5, migration or guessing 0.5 from structure.

## Open local archived filesets

Should the viewer open local .ozx archives directly?[^d11]

**Why:** An archive can simplify moving a fileset.

**What you get:** Read-only access without requiring a directory-form input.

**What it costs:** Archive-aware random access, inner paths, directory overhead, compression and seek/memory tests.

**Needs:** Read-only random-access archive backend; Inner-path resolution; Seek/memory/corruption tests.

**Options:**

1. Require directory-form filesets
2. Evaluate selective local archive reading

**Evaluator recommendation:** Evaluate only after a bounded read-only random-access design is available.

**Your answer:**

**Boundary:** No automatic extraction, image export or general archive-format support.

## Consider pinned preview graph support

Should specific preview scene and coordinate-graph revisions be evaluated beyond final 0.5?[^d12]

**Why:** Newer producer data may require different syntax and transform graphs.

**What you get:** Possible access to explicitly supported newer specimens.

**What it costs:** Exact schema pins, graph validation, real specimens and moving syntax.

**Needs:** Exact preview/schema pins; Graph/reference validation; Real specimens.

**Options:**

1. Keep unsupported-version explanations
2. Evaluate narrowly pinned preview support

**Evaluator recommendation:** Defer display commitment until exact revisions and graph operations are verified.

**Your answer:**

**Boundary:** No general 0.6 promise, automatic migration or inferred calibrated display.

## Consider collection and derived-image references

Should future RFC-8 collection/reference navigation receive a separate capability evaluation?[^d13]

**Why:** Relationships could make derived images easier to find.

**What you get:** Navigation through explicitly modeled relationships.

**What it costs:** A stable relationship model, cycle/broken-link diagnostics and broader discovery UI.

**Needs:** Stable relationship model; Local containment; Cycle/broken-link diagnostics.

**Options:**

1. Keep current local discovery
2. Evaluate bounded relationship navigation when the model is stable

**Evaluator recommendation:** Defer implementation until a stable model and local specimens define the scope.

**Your answer:**

**Boundary:** No remote retrieval/service, unrestricted references or new provenance format is approved.

## Choose the initial numeric image types

Should the initial compatibility profile include uint8, uint16, int8, int16, uint32, int32, float32 and float64 images?[^d14]

**Why:** A narrow inherited reader whitelist could exclude useful valid files or corrupt numeric interpretation.

**What you get:** An explicit promise for the chosen types with independent sample-value and display-conversion checks.

**What it costs:** More decoder/renderer paths, finite and nonfinite cases, memory use and packaging tests.

**Needs:** Typed decoding; Display mapping separate from original values; Independent numeric fixtures.

**Options:**

1. Evaluate the eight proposed image types before committing to them.
2. Define and review a smaller initial profile from target files, with explicit unsupported outcomes.

**Evaluator recommendation:** Evaluate the proposed profile, then return with a verified release boundary; do not adopt it merely because metadata permits it.

**Your answer:**

**Boundary:** This selects breadth. Every admitted type must preserve meaning; backend adoption and integer label breadth are separate.

## Choose the initial integer label types

Should label support include all eight signed and unsigned 8-, 16-, 32- and 64-bit integer types?[^d15]

**Why:** Labels can use signed or very large IDs that exceed display-number precision.

**What you get:** An explicit supported range with exact decoding, metadata lookup and categorical sampling.

**What it costs:** Large-ID handling, sparse maps, renderer conversion limits and more fixtures.

**Needs:** Exact integer identity; Sparse lookup; Precision and sampling checks.

**Options:**

1. Evaluate all eight integer label types.
2. Review a narrower exact supported range and refuse other representations clearly.

**Evaluator recommendation:** Prefer an explicit tested range over silently narrowing values; wider type support requires its own evidence.

**Your answer:**

**Boundary:** A palette choice cannot relax identity correctness. This does not select image intensity types or a property table.

## Choose the initial encoding profile

Should the reader evaluate the proposed bytes, Blosc lz4/zstd, gzip, standalone zstd and sharding/checksum combinations as its initial interoperability profile?[^d16]

**Why:** Codec names alone do not establish that a complete array encoding can be read correctly.

**What you get:** A bounded, versioned list of positive and unsupported combinations with known-value checks.

**What it costs:** Codec linkage, shuffle/bitshuffle distinctions, index placement, corruption tests and packaging maintenance.

**Needs:** Actual complete-chain metadata; Pinned readers; Independent values and layout fixtures.

**Options:**

1. Evaluate the proposed bounded real-producer profile.
2. Review a smaller supported profile from target files before adding dependencies.

**Evaluator recommendation:** Verify whole chains, including applicable transpose/layout checks, and review the profile before dependency commitment.

**Your answer:**

**Boundary:** No all-codec/all-extension promise. Blosc internal compressors and filters are not interchangeable with standalone codec chains.

## Compare readers before selecting the backend

Should a pinned corrected TensorStore adapter be compared with pinned zarr-python or another verified v3 reader?[^d17]

**Why:** Tool catalogs and matching codec names do not establish application correctness or responsiveness.

**What you get:** A comparison of pinned TensorStore, zarr-python or another verified reader with a separate metadata/validation model and demand-driven 2D renderer, using the same selected pixels, coordinates, labels, errors and resource/build checks.

**What it costs:** Prototype adapters; C++ build/codec linkage versus Python runtime packaging; renderer/GPU portability and license checks; dependency maintenance and precise buffer ownership. Source/API support is not a runtime pass.

**Needs:** Target platforms; Pinned candidates; Typed-pixel/coordinate/label fixtures; Memory/cancellation/build measurements.

**Options:**

1. Run a staged reader comparison on target platforms
2. Reduce the candidate set after packaging constraints are known
3. Defer backend selection

**Evaluator recommendation:** Use a staged comparison and return with evidence before adopting dependencies.

**Your answer:**

**Boundary:** Evaluate before selecting production architecture. No production language, UI toolkit, renderer, AGAVE fork, 3D mode, dependency pin, platform or all-codec promise is approved.

## Use supplied channel appearance when opening

Should valid supplied channel names, colors, brightness windows and display model initialize a session?[^d18]

**Why:** The supplied display window may be much narrower than the numeric type range.

**What you get:** A recognizable opening display without a full-resolution extrema scan.

**What it costs:** Channel/field validation, transfer functions and a separately reviewed fallback for unavailable settings; stale producer appearance may still be unhelpful.

**Needs:** Per-field metadata validation; Channel identity; Display transfer functions.

**Options:**

1. Use validated supplied appearance
2. Use viewer defaults with supplied settings available on request

**Evaluator recommendation:** Prefer validated supplied appearance; decide active flags, starting plane and fallback separately.

**Your answer:**

**Boundary:** Initial appearance only. Active flags, initial T/Z, later session stability, missing-window fallback and malformed-present metadata tolerance remain separate questions.

## Use saved channel visibility

Should valid saved active flags determine which channels are initially visible?[^d19]

**Why:** Producer flags may encode a useful composition or conceal channels a user expects.

**What you get:** Reproduce the saved composition at opening.

**What it costs:** Clear channel visibility controls and a way to reveal initially hidden channels.

**Needs:** Channel visibility controls; Validated saved flags.

**Options:**

1. Honor valid active flags
2. Start all supported channels visible

**Evaluator recommendation:** Prefer supplied flags with obvious visibility controls, subject to review.

**Your answer:**

**Boundary:** Local read-only viewing only; no source edits or image export.

## Choose the starting time and plane

Should valid saved defaultT and defaultZ choose the initial selection?[^d20]

**Why:** The native specimen has a meaningful saved plane instead of plane zero.

**What you get:** Open at a producer-selected view with bounds validation.

**What it costs:** Fallback for missing or invalid indices and respect for axes actually present.

**Needs:** Validated axes and index bounds.

**Options:**

1. Use valid saved indices, otherwise deterministic defaults
2. Always use viewer default indices

**Evaluator recommendation:** Prefer valid saved indices; do not manufacture absent controls.

**Your answer:**

**Boundary:** Local read-only viewing only; no source edits or image export.

## Choose brightness without a usable saved window

Should opening use a deterministic numeric-range fallback or bounded sampled statistics when the saved window is unavailable?[^d21]

**Why:** Numeric-range display can have low contrast, while sampling adds reads.

**What you get:** A defined and explained first display without blocking on a global scan.

**What it costs:** Contrast versus I/O, sample budgeting and truthful sampled-statistics labels.

**Needs:** Bounded statistics or numeric-range policy; Explained fallback state.

**Options:**

1. Use deterministic range defaults
2. Use bounded sampled statistics
3. Choose after comparison on representative images

**Evaluator recommendation:** Compare the two on representative local files before fixing the fallback.

**Your answer:**

**Boundary:** Chooses the display fallback, not permission to ignore malformed-present metadata. No blocking full-resolution extrema scan or source changes.

## Handle malformed optional channel-display metadata

Should a valid image with malformed optional channel-display metadata open using an explicitly chosen fallback display?[^d22]

**Why:** An optional display block can be wrong even when the underlying intensity image is readable.

**What you get:** Continued image navigation with the original display metadata preserved and a clear explanation of which fallback was used.

**What it costs:** Class-specific validation, visible diagnostics, retained originals and a separately chosen fallback policy. Tolerance increases support complexity and can make the initial appearance differ from producer intent.

**Needs:** Class-specific diagnostics; Separately reviewed fallback policy.

**Options:**

1. Open with a specific warning and a reviewed session display fallback.
2. Refuse that display interpretation with an explicit reason rather than silently repairing it.
3. Defer tolerant handling until the fallback policy is defined.

**Evaluator recommendation:** Prefer a named, limited fallback for this nongeometric class once its display behavior is separately chosen; do not hide the malformed block.

**Your answer:**

**Boundary:** This decides malformed-present metadata, not merely absent optional settings. It does not select fallback colors/windows, reset behavior or any source write.

## Keep display changes during the session

Should user display changes stay stable as the user browses levels and selections in that session?[^d23]

**Why:** Repeated initialization could replace a user-adjusted view.

**What you get:** Predictable brightness, color and visibility while exploring.

**What it costs:** Session state keyed to the correct image and entry, plus reset behavior.

**Needs:** View/entry identity; Session state and reset behavior.

**Options:**

1. Retain session overrides until explicit reset or session end
2. Define a narrower retention rule before adoption

**Evaluator recommendation:** Prefer stable session overrides and an explicit reset; define their identity boundary.

**Your answer:**

**Boundary:** No cross-session persistence or source rewrite. Native repair wording about stability is not approval of a particular policy.

## Choose fixed versus recalculated brightness across time

Should a user be able to choose an explicit percentile-recalculation mode in addition to stable absolute brightness windows?[^d24]

**Why:** Automatic recalculation can reveal contrast but make equal intensities look different between frames.

**What you get:** A deliberate choice between stable time comparisons and adaptive contrast.

**What it costs:** Statistics I/O, histogram/state precedence and clear disclosure of the selected mode.

**Needs:** Native values separate from display mapping; Bounded statistics; Session state and precedence.

**Options:**

1. Use stable user-selected absolute windows.
2. Add an explicitly chosen percentile-recalculation mode as well.

**Evaluator recommendation:** Prefer stable absolute windows by default and require an explicit mode change for recalculation.

**Your answer:**

**Boundary:** This is later navigation behavior, distinct from producer initialization and missing-window fallback; it does not add a histogram or LUT editor.

## Choose initial label visibility

Should associated labels be available but initially hidden?[^d25]

**Why:** An overlay may obscure the intensity image or be overlooked if hidden.

**What you get:** A clear initial image with discoverable overlay controls.

**What it costs:** Visibility UI and session state; hidden defaults reduce immediate discoverability.

**Needs:** Categorical overlay renderer; Visibility state.

**Options:**

1. Initially hidden with a clear control
2. Initially visible with a clear control

**Evaluator recommendation:** Prefer initially hidden with an obvious label control.

**Your answer:**

**Boundary:** Local read-only viewing only; no source edits or image export.

## Apply supplied label colors

Should explicit metadata colors be used when valid?[^d26]

**Why:** Producer colors may carry meaning but their use is a viewer presentation choice.

**What you get:** Consistent appearance with supplied label metadata.

**What it costs:** Exact ID-to-record joins and handling of absent or malformed colors.

**Needs:** Exact ID-to-record lookup; RGBA validation.

**Options:**

1. Use valid supplied colors
2. Use a viewer palette while exposing supplied colors

**Evaluator recommendation:** Prefer valid supplied colors, including an explicitly colored label zero.

**Your answer:**

**Boundary:** Exact categorical identity and metadata association are correctness requirements independent of the chosen palette. No universal transparent-zero rule.

## Choose colors for labels without supplied colors

Should missing label colors use a deterministic fallback palette?[^d27]

**Why:** Labels need a usable display even when color records are absent.

**What you get:** Stable colors between views in the session.

**What it costs:** Palette collisions, accessibility concerns and colors with no scientific meaning.

**Needs:** Exact label IDs; Deterministic palette.

**Options:**

1. Use deterministic fallback colors
2. Require a user palette choice before showing uncolored labels

**Evaluator recommendation:** Prefer a documented deterministic fallback and expose that it is a fallback.

**Your answer:**

**Boundary:** Local read-only viewing only; no source edits or image export.

## Choose visibility of zero without an explicit color

Should label zero default to transparent when no explicit color governs it?[^d28]

**Why:** Zero is often background, but a supplied nontransparent zero is valid.

**What you get:** A predictable fallback background convention.

**What it costs:** Potentially hiding a meaningful zero region; requires an override and clear handling of explicit metadata.

**Needs:** Explicit versus fallback color distinction; User visibility override.

**Options:**

1. Transparent zero only when no explicit color is supplied
2. Visible fallback zero
3. Ask on first display

**Evaluator recommendation:** Prefer transparent fallback zero with an override, while retaining explicit supplied color.

**Your answer:**

**Boundary:** Never call always-transparent zero a format requirement.

## Inspect label properties in a table

Should users have a virtualized table of supplied label properties?[^d29]

**Why:** Supplied heterogeneous properties are otherwise difficult to inspect.

**What you get:** Context linked to the exact selected label ID.

**What it costs:** Bounded loading, sparse huge-ID joins, heterogeneous keys and UI clutter.

**Needs:** Exact sparse ID joins; Bounded virtualized rows; Heterogeneous property handling.

**Options:**

1. Keep properties out of a new table
2. Add a bounded virtualized read-only table

**Evaluator recommendation:** Offer a bounded table if property inspection is needed; test missing and heterogeneous records.

**Your answer:**

**Boundary:** No inferred biological or clinical meaning, editing, export or property normalization.

## Inspect an original sample value

Should users be able to inspect an exact original value for a selected supported image sample?[^d30]

**Why:** Display mapping alone cannot reveal the underlying scientific value.

**What you get:** A read-only value with its selected image/coordinate context and declared dtype.

**What it costs:** Precision formatting, selected-sample reads and an interface that distinguishes original values from display intensities.

**Needs:** Typed sample preservation; Selected-view identity; Exact value formatting.

**Options:**

1. Keep the current dimensions/coordinate details only.
2. Add a bounded read-only original-value inspector.

**Evaluator recommendation:** Add only if manual value inspection is needed, with independent exact-value checks.

**Your answer:**

**Boundary:** No editing, export or inferred scientific/clinical interpretation; unsupported precision must be explained.

## Compare separate intensity images on one canvas

Should users be able to overlay explicitly selected intensity-image groups?[^d31]

**Why:** Associated segmentation labels do not provide image-to-image comparison.

**What you get:** Compare registered crops or acquisitions with separate visibility and channel settings.

**What it costs:** Multiple-read scheduling, verified transforms and units, more memory, opacity ambiguity and more controls.

**Needs:** Verified transforms/units; Independent image state; Multiple-read scheduling.

**Options:**

1. Keep separate image viewing
2. Add overlays after identity and coordinate checks

**Evaluator recommendation:** Evaluate a bounded overlay workflow if comparison is needed; require verified coordinates.

**Your answer:**

**Boundary:** Local read-only viewing only; no source edits or image export.

## Show a calibrated scale on the image

Should the canvas show a scalebar when calibration is valid?[^d32]

**Why:** A details panel gives numbers but no immediate visual size reference.

**What you get:** A size reference that follows zoom and unit changes.

**What it costs:** Canvas space and readability rules plus world-to-screen validation.

**Needs:** Validated calibration; World-to-screen mapping.

**Options:**

1. Keep calibration in details only
2. Add a scalebar when calibration is verified

**Evaluator recommendation:** Add only for validated calibration, with zoom and unit-change checks.

**Your answer:**

**Boundary:** Local read-only viewing only; no source edits or image export.

## Show stored anatomical direction

Should image details or an optional widget show anatomical direction together with the coordinate system it describes?[^d33]

**Why:** Stored tissue and subject directions can help interpretation, but they do not necessarily match screen axes and may be absent.

**What you get:** An explanation of recorded anatomical directions and their provenance without guessing from screen layout or axis names.

**What it costs:** Version-specific orientation semantics, handling nonaligned coordinate systems, extra UI and tests for direction through zoom and plane changes. Losing provenance could make a helpful label misleading.

**Needs:** Version-specific orientation semantics; Coordinate provenance.

**Options:**

1. Keep anatomical display outside the initial viewer.
2. Show explicit orientation in image details.
3. Add an optional orientation widget after its transform behavior is verified.

**Evaluator recommendation:** Prefer explicit details over a widget initially, and leave missing or unverified orientation unspecified.

**Your answer:**

**Boundary:** No automatic flipping, pixel reordering or user reorientation feature is included.

## Show local descriptive dataset details

Should optional local RO-Crate fields appear in dataset details?[^d34]

**Why:** Directory names omit useful specimen, provenance and licensing context.

**What you get:** Readable supplied descriptions with their field provenance.

**What it costs:** Bounded JSON-LD parsing, inconsistent vocabularies and UI noise.

**Needs:** Bounded local JSON-LD parsing; Field provenance.

**Options:**

1. Keep NGFF details only
2. Show selected local descriptive fields

**Evaluator recommendation:** Start with a small read-only details view if descriptive context is useful.

**Your answer:**

**Boundary:** RO-Crate is optional, does not replace NGFF discovery and must not require external ontology resolution at open.

## Select values along a named custom axis

Should a named custom-axis control expose selections that ordinary time and channel controls cannot represent?[^d35]

**Why:** Valid custom axes need not mean channel or time.

**What you get:** Access to otherwise inaccessible selections while preserving supplied identity.

**What it costs:** Rank-aware slicing and more controls.

**Needs:** Preserved axis identity; Rank-aware slicing.

**Options:**

1. Explain unsupported custom-axis selection
2. Add a named selector for supported custom axes

**Evaluator recommendation:** Prefer a named selector only after identity and slicing checks.

**Your answer:**

**Boundary:** Selection does not reinterpret a custom axis as channel or time; ambiguous mapping is separate.

## Let users map ambiguous axes for one session

Should a user be able to supply an explicitly labeled session mapping when axis metadata is ambiguous?[^d36]

**Why:** Some files cannot be viewed meaningfully without resolving ambiguity.

**What you get:** A reversible way to inspect them without rewriting the source.

**What it costs:** Mapping errors, disclosure in coordinate context and prevention of accidental inferred semantics.

**Needs:** Explicit supplied/user semantics; Session-only mapping.

**Options:**

1. Keep ambiguity unsupported
2. Allow explicit session-only mapping

**Evaluator recommendation:** Consider session mapping only with clear supplied-versus-user semantics and reset behavior.

**Your answer:**

**Boundary:** No silent inference, source rewrite or persistent corrected metadata.

## Inspect usable pixels when geometry is uncertain

Should a usable image open with diagnostics while unjustified geometry features stay unavailable?[^d37]

**Why:** Ambiguous geometry can make calibrated features misleading even when pixels can be inspected.

**What you get:** Inspect real files without representing uncertain coordinates as valid.

**What it costs:** Per-item diagnostics, explicit feature availability and a clear distinction from conformance.

**Needs:** Structured per-item diagnostics; Explicit feature availability.

**Options:**

1. Allow usable pixel inspection with affected features withheld
2. Reject images with ambiguous whole-image metadata

**Evaluator recommendation:** Prefer bounded inspection with conspicuous limitations if useful pixels can be identified safely.

**Your answer:**

**Boundary:** No inferred alignment, coordinate repair or full-conformance claim. Plate omission exception is separate.

## Allow explicitly reported coordinate normalization

Should a documented normalization of malformed coordinate transforms ever enable calibrated display and overlays?[^d38]

**Why:** Some metadata models warn and normalize reversed transforms in memory, so invoking a validator does not necessarily mean strict rejection or an unchanged interpretation.

**What you get:** Potential access to a precisely understood malformed case while showing both the original metadata and the interpretation used.

**What it costs:** A narrowly defined transform-repair rule, verification that the intended mapping is preserved, visible warnings and original/normalized metadata retention. A wrong repair can create deceptively precise coordinates or misaligned labels.

**Needs:** Named normalization class; Independent coordinate verification; Original/normalized provenance.

**Options:**

1. Withhold calibrated display and overlays for malformed transforms, with a clear explanation.
2. Allow only separately approved, documented normalization classes after their coordinate behavior is verified.

**Evaluator recommendation:** Withhold calibrated display for malformed transforms by default; review any proposed normalization class individually before relying on its coordinates.

**Your answer:**

**Boundary:** No global leniency switch, silent normalization, source rewrite or inferred user approval is created.

## Handle the known missing plate version

Should an otherwise well-defined plate missing nested plate.version remain navigable with a compatibility warning?[^d39]

**Why:** Normative prose and the observed schema/examples disagree about this omission.

**What you get:** Access to real files while disclosing the specific conformance issue.

**What it costs:** A bounded exception and warnings that cannot disappear into a success state.

**Needs:** Admitted plate profile; Specific semantic diagnostic.

**Applies if:** Read plate, well and field containers is chosen.

**Options:**

1. Allow navigation with an explicit warning for this omission
2. Reject the plate strictly

**Evaluator recommendation:** Prefer a narrowly documented warning exception if plate navigation is admitted.

**Your answer:**

**Boundary:** Conditional on supported plate containers; no broad malformed-plate tolerance or full-conformance claim.

## Consider a named historical label compatibility rule

Should an explicitly documented exception ever display a historical label pyramid that violates current metadata requirements?[^d40]

**Why:** Real older converter outputs include mismatched image/label level counts and other conformance caveats.

**What you get:** Possible access to a particular known input while retaining originals and making deviations explicit.

**What it costs:** A narrow rule, deterministic association, independent physical-alignment checks and ongoing negative/derived fixture coverage.

**Needs:** Preserved original metadata; Verified source identity and physical mapping; Explicit diagnostic policy.

**Options:**

1. Keep the invalid overlay unavailable and the usable source image open.
2. Evaluate only a specifically named exception whose alignment can be independently demonstrated.

**Evaluator recommendation:** Use diagnostic-only behavior unless a narrowly defined exception proves safe; never treat the historical sample as conformant.

**Your answer:**

**Boundary:** No silent level matching, inferred source defaults, global version guessing, resampling new label IDs or source rewrite.

## Browse a plate in a display grid

Should admitted plate data have a thumbnail grid in addition to list navigation?[^d41]

**Why:** A plate overview may speed HCS browsing.

**What you get:** Visual navigation by plate structure.

**What it costs:** Independent thumbnail scheduling, acquisition choices, memory and navigation controls.

**Needs:** Admitted plate profile; Bounded thumbnail scheduling; Acquisition choices.

**Applies if:** Read plate, well and field containers is chosen.

**Options:**

1. Keep list navigation
2. Add a bounded plate display grid

**Evaluator recommendation:** Evaluate a display grid for admitted plate data; label it as an overview.

**Your answer:**

**Boundary:** Conditional on supported plate breadth. Grid layout does not assert measured physical position or registration.

## Browse fields within a well visually

Should an admitted well have a bounded visual field overview?[^d42]

**Why:** Lists can make many fields slow to compare.

**What you get:** Quick selection among fields and acquisitions.

**What it costs:** Thumbnail scheduling, acquisition selection and careful distinction between arrangement and physical coordinates.

**Needs:** Admitted plate/well profile; Field identity; Bounded thumbnails.

**Applies if:** Read plate, well and field containers is chosen.

**Options:**

1. Keep field lists
2. Add a bounded display arrangement of fields

**Evaluator recommendation:** Evaluate an explicitly nonphysical overview first if well-field browsing is needed.

**Your answer:**

**Boundary:** Does not authorize physical stitching, registration, guessed placement or calibrated mosaics; those remain undeveloped.

## Choose a fixed resolution manually

Should users have an optional resolution override alongside automatic level selection?[^d43]

**Why:** A fixed level can help deliberate inspection and resource control.

**What you get:** A clear manual level choice and a return to automatic selection while coordinates remain consistent.

**What it costs:** More override state, possible confusion during zoom and extra memory at high resolution.

**Needs:** Declared levels and transforms; Bounded reader; Explicit reset behavior.

**Options:**

1. Keep automatic selection only initially.
2. Add an optional fixed-level override after a demonstrated need.

**Evaluator recommendation:** Measure automatic behavior first; add the override only if it closes a useful gap.

**Your answer:**

**Boundary:** No default full-resolution load, mandatory dialog or new pyramid generation.

## Restrict the loaded spatial region

Should users be able to choose a spatial region that limits loading beyond the current viewport?[^d44]

**Why:** Expert inspection may need a deliberate bounded crop of a large image.

**What you get:** An explicit region restriction with correct source coordinates and visible excluded extent.

**What it costs:** Region-entry UI, coordinate/label mapping, reset rules and potentially confusing restricted navigation.

**Needs:** Original-array coordinate mapping; Rank-aware region selection; Bounded reads.

**Options:**

1. Use automatic viewport-limited loading only.
2. Add an optional spatial load-region control.

**Evaluator recommendation:** Defer until automatic loading measurements show a need; verify crop coordinates and reset behavior.

**Your answer:**

**Boundary:** The region limits reads; it does not crop, rewrite or export the dataset.

## Show a memory estimate before an advanced load

Should an optional load view show estimated decoded, process and graphics memory?[^d45]

**Why:** A decoded volume or region can cost substantially more memory than its stored bytes.

**What you get:** A clearer estimate of the resources associated with chosen load settings.

**What it costs:** Estimate maintenance across native, staging and graphics copies; estimates can differ from actual peaks.

**Needs:** Checked shape/byte arithmetic; Reader/render allocation model; Measured estimate accuracy.

**Applies if:** Relevant if either advanced resolution or region controls is adopted; neither is approved here.

**Options:**

1. Keep memory accounting internal to responsiveness checks.
2. Show a clearly labeled estimate with optional advanced load settings.

**Evaluator recommendation:** Expose estimates only after comparing them with observed usage; keep them distinct from guaranteed limits.

**Your answer:**

**Boundary:** No numeric budget or supported-hardware promise is selected.

## Measure before fixing responsiveness budgets

Should target hardware and latency, memory, cache and prefetch budgets be set from shared local workloads?[^d46]

**Why:** No measured optimum or numeric responsiveness target exists in J10.

**What you get:** A reproducible basis for resource limits and backend comparison.

**What it costs:** Fixture preparation, target machines and cold/warm measurements; throughput competes with memory and cancellation.

**Needs:** Shared fixture manifest; Target hardware; CPU/GPU/I/O metrics.

**Options:**

1. Measure small, medium and very large local fixtures before setting budgets
2. Defer budget selection until target hardware is agreed

**Evaluator recommendation:** Measure first and return with numeric choices; no SLA or prefetch depth is supplied here.

**Your answer:**

**Boundary:** Local read-only viewing only; no source edits or image export.

## Use consolidated metadata when it can speed opening

Should the viewer use an available consolidated metadata index as an optional shortcut during discovery?[^d47]

**Why:** An index can reduce metadata requests, but it can be missing, stale or inconsistent with ordinary per-node metadata.

**What you get:** Potentially faster cold traversal with a bypass or fallback to ordinary metadata.

**What it costs:** Index compatibility, consistency and freshness checks, diagnostic handling and cold/warm measurements. Trusting a stale index could hide or misidentify images.

**Needs:** Index consistency/freshness checks; Ordinary-metadata fallback; Cold/warm measurements.

**Options:**

1. Use ordinary per-node metadata only.
2. Use supported consolidated metadata opportunistically, with explicit consistency checks and fallback.

**Evaluator recommendation:** Measure the benefit and retain an ordinary-metadata fallback before adopting this optimization.

**Your answer:**

**Boundary:** Consolidation is not a validity requirement and does not authorize source writes, persistent cache storage or time-series preloading.

## Keep a reusable metadata cache outside the dataset

Should an optional metadata cache be retained outside the source fileset for reuse beyond the current opening or session?[^d48]

**Why:** Reusing parsed metadata could reduce repeated traversal, but cache lifetime and persistence are extra policy beyond keeping current work bounded.

**What you get:** Potentially faster reopening, with a way to bypass or discard stale cached interpretations.

**What it costs:** Storage and resource policy, identity/version checks, invalidation, deletion and diagnostics for inconsistent cache entries. Longer retention increases stale-data and maintenance risk.

**Needs:** Metadata identity/versioning; Invalidation/deletion; Measured benefit.

**Options:**

1. Use only bounded temporary caching needed for current responsiveness.
2. Evaluate reusable session caching and discard it at session end.
3. Consider persistent application-owned metadata caching after repeated-open measurements justify it.

**Evaluator recommendation:** Start with bounded temporary/session caching; require measurements and an explicit lifetime decision before persistence.

**Your answer:**

**Boundary:** Internal bounded caches remain implementation details where needed for responsiveness. This is distinct from a multi-fileset catalog and from cached timepoint pixels; no numerical quota is set.

## Play a time series

Should the viewer offer playback in addition to manual timepoint selection?[^d49]

**Why:** Repeated time browsing may be easier when frames advance automatically.

**What you get:** A playback workflow that maintains truthful displayed-time state and remains cancellable.

**What it costs:** Playback controls, scheduling and missing/late-frame behavior; throughput can vary with local storage.

**Needs:** Coherent requested/displayed state; Bounded asynchronous reads; Measured time-navigation workload.

**Options:**

1. Keep manual timepoint navigation.
2. Evaluate optional playback on admitted time-series data.

**Evaluator recommendation:** Evaluate playback separately after manual navigation and failure-state checks are reliable.

**Your answer:**

**Boundary:** Playback does not approve prefetch, full preload, disk persistence, export or a frame-rate guarantee.

## Read nearby timepoints ahead

Should measured time navigation use bounded adjacent-time prefetch?[^d50]

**Why:** A small amount of work ahead may reduce repeat-navigation delay.

**What you get:** Potentially quicker nearby time changes without requiring a whole series in memory.

**What it costs:** Extra reads compete with the current view and consume buffers/cache; benefit depends on locality.

**Needs:** Current-view priority; Cancellation and complete request keys; Measured resource bounds.

**Options:**

1. Use demand reads only.
2. Evaluate bounded neighboring-time prefetch against the demand baseline.

**Evaluator recommendation:** Compare both on the same workloads and choose limits from measurements.

**Your answer:**

**Boundary:** No public preload controls, persistent disk cache or unbounded time-series loading.

## Preload chosen timepoints

Should users be able to request cancellable preloading of a chosen set of timepoints?[^d51]

**Why:** Repeated visits to selected frames can remain slow even with nearby prefetch.

**What you get:** Potentially faster revisits with explicit selection, resource limits and eviction behavior.

**What it costs:** Startup reads, duplicated memory, source-identity checks and competition with current navigation.

**Needs:** Measured benefit; Bounded storage and eviction; Cancellation and source-generation policy.

**Options:**

1. Keep demand reads or bounded neighbor prefetch.
2. Offer opt-in selected-timepoint preload after measurements justify it.

**Evaluator recommendation:** Defer the user-facing preload until the cheaper baselines are measured and benefits exceed costs.

**Your answer:**

**Boundary:** Whole-series permission and persistent disk storage are separate decisions; source files remain untouched.

## Allow whole-series preloading for small inputs

Should an opt-in preload be allowed to include every timepoint when the complete series fits reviewed resource limits?[^d52]

**Why:** Some demonstrably small series may benefit from repeated instant access.

**What you get:** An all-timepoint preload option with a checked admission size and cancellation.

**What it costs:** Potentially large startup and memory amplification; mistaken size assumptions can defeat large-data responsiveness.

**Needs:** Accurate size accounting; Measured preload behavior; Explicit memory/queue limits.

**Options:**

1. Do not offer whole-series preload.
2. Allow it only for inputs shown to fit the reviewed limits.

**Evaluator recommendation:** Consider only after demand, neighbor-prefetch and selected-timepoint baselines; never make it the ordinary opening policy.

**Your answer:**

**Boundary:** No unbounded cache, default whole-series allocation or disk-persistence approval.

## Keep cached pixels on disk between sessions

Should an optional pixel cache persist in application-owned storage outside source filesets?[^d53]

**Why:** Repeat viewing may benefit from reuse beyond the current session.

**What you get:** Potentially faster reopening or revisiting already read regions.

**What it costs:** Disk quotas, stale-source detection, invalidation, deletion/eviction controls and duplicate data.

**Needs:** Measured benefit; Stable source/selection identity; Application-owned storage policy.

**Options:**

1. Use temporary bounded caches only.
2. Evaluate persistent pixel caching with explicit limits and deletion behavior.

**Evaluator recommendation:** Defer until repeated-use measurements justify persistence and its lifecycle is reviewable.

**Your answer:**

**Boundary:** Distinct from a catalog and a metadata cache; no source-side Zarr writes, source modification or export workflow.

## Offer a separate whole-fileset audit

Should there be a standalone validation UI or command in addition to quick viewing checks?[^d54]

**Why:** Opening selected data cannot establish that an entire fileset was checked.

**What you get:** Repeatable semantic and link/array auditing with a completeness report.

**What it costs:** Pinned schemas, potentially large scans and a second workflow.

**Needs:** Pinned schemas; Full link/array checks; Completeness reporting.

**Options:**

1. Keep validation within viewing
2. Add an explicit whole-fileset audit

**Evaluator recommendation:** Scope a separate metadata audit only if whole-fileset assurance is needed; report checked and unchecked portions.

**Your answer:**

**Boundary:** Local read-only viewing only; no source edits or image export.

## Set how much the whole-fileset audit reads

If a standalone audit is added, should it inspect metadata only or also selected or all pixel payloads and checksums?[^d55]

**Why:** Metadata checks do not establish payload integrity.

**What you get:** A truthful level of integrity evidence for the chosen audit.

**What it costs:** Potentially extensive I/O, cancellation and completeness accounting.

**Needs:** Standalone audit design; Bounded/cancellable I/O.

**Applies if:** Offer a separate whole-fileset audit is chosen.

**Options:**

1. Metadata and links only
2. Metadata plus explicitly selected payload/checksum checks
3. Comprehensive payload checks with measured cost

**Evaluator recommendation:** Start with an explicitly labeled metadata scope; evaluate payload coverage separately.

**Your answer:**

**Boundary:** Conditional on standalone audit approval. No claim that an unexecuted validator covers all semantics or all pixels.

## Choose a small offline regression corpus

Should acceptance use a small versioned local set of reviewed converter outputs plus controlled synthetic cases?[^d56]

**Why:** A live catalog does not supply stable bytes, known values or complete edge-case coverage.

**What you get:** Repeatable offline checks with provenance, expected outcomes and both positive and negative specimens.

**What it costs:** Acquisition/storage budget, dataset terms/attribution, independent values, CI size and maintenance of historical caveats.

**Needs:** Explicit sample selection; Metadata/chunk hashes; Independent expected values; Per-dataset terms.

**Options:**

1. Adopt a small reviewed local corpus plus controlled cases.
2. Begin with metadata-only fixtures while clearly deferring pixel-decoder acceptance.
3. Defer corpus adoption until selected bytes and terms are ready.

**Evaluator recommendation:** Prefer a small validated offline corpus and fill controlled gaps; do not mirror the entire catalog or treat invalid originals as passing fixtures.

**Your answer:**

**Boundary:** This authorizes no acquisition in the current task, no source editing or export feature, and no claim that available catalog rows were decoded.

## Expose application state to internal tests

Should tests use an internal in-process adapter or opt-in process IPC on the actual application path?[^d57]

**Why:** Repeatable load/state/error checks need access to application lifecycle behavior.

**What you get:** Stronger assertions and UI smoke-test integration.

**What it costs:** Shared requests and lifecycle hooks; process and rendering failures still need integration tests.

**Needs:** Shared requests and lifecycle hooks; Actual application path.

**Options:**

1. Use an internal in-process adapter first
2. Use opt-in process IPC where process tests require it
3. Defer the adapter

**Evaluator recommendation:** Prefer the internal adapter first, adding process IPC only for demonstrated test needs.

**Your answer:**

**Boundary:** Implementation proposal only; no scientist-facing scripting workflow or default listener.

## Let local scripts control the installed viewer

Should the installed application ship a local scripting interface?[^d58]

**Why:** Scientists may want reproducible viewing sessions and external application control.

**What you get:** Programmatic local load and viewing-state operations.

**What it costs:** Versioned protocol and clients, endpoint/session access policy, correlation, bounded waits and process cleanup.

**Needs:** Versioned local protocol; Request correlation and bounded outcomes; Access/session lifecycle.

**Options:**

1. Keep control internal to tests
2. Design a separately versioned local scripting capability

**Evaluator recommendation:** Defer shipment until concrete local workflows justify the support surface.

**Your answer:**

**Boundary:** No remote service deployment or image export; WebSocket is an optional mechanism, not a selected requirement.

## Open a selected image from a local command

Should the installed viewer accept a documented local command specifying a container and selected image path?[^d59]

**Why:** Local tools need a stable way to open the intended nested image rather than merely its root.

**What you get:** A minimal launch interface with reproducible selected-node diagnostics.

**What it costs:** Quoting/encoding behavior, argument validation and platform integration tests.

**Needs:** Stable local locator model; Selected-node identity; Bounded failure reporting.

**Options:**

1. Use the file picker and internal selections only.
2. Add a minimal documented local command entry point.

**Evaluator recommendation:** Start with a minimal command only when a concrete launcher workflow requires it.

**Your answer:**

**Boundary:** No remote URLs, cloud credentials, public scripting protocol or OS registration is included.

## Register a local open-with action

Should the viewer integrate with operating-system open-with or a local launch protocol?[^d60]

**Why:** A desktop launcher may need to open the same intended image without a terminal command.

**What you get:** Convenient local handoff that preserves container and selected-image identity.

**What it costs:** Installation/registration behavior, platform variation and quoting/encoding tests.

**Needs:** Reviewed local locator contract; Platform registration/cleanup; Selected-node error handling.

**Options:**

1. Keep explicit file-picker or command entry only.
2. Add separately tested local open-with integration.

**Evaluator recommendation:** Defer registration until the local locator behavior and target platforms are fixed.

**Your answer:**

**Boundary:** No remote service or automatic URL-root rewriting; protocol details require the local-only contract.

## Deferred directions

These mentions need a more concrete workflow, support contract or measured evidence before becoming another review question.

- **Physical field stitching or registered mosaics:** Display grids/field overviews are developed; a physical placement/registration/stitching contract is not. Do not infer it from thumbnails.
- **Acquisition-filter dashboard controls:** Acquisition identity is retained within admitted plates, but a separate filter/dashboard workflow is only sketched. Plate admission and display grids are fully formed questions.
- **RO-Crate collection search:** Native J10 says later explicit search, without a developed query/index contract. Local descriptive details remain a separate ready question.
- **Histogram editor, LUT editor and on-canvas time overlay:** J11 names these possible controls but develops fixed/percentile window behavior more concretely. Preserve the mentions without inventing editor operations or overlay policy.
- **General manual anatomical reorientation:** Stored orientation display and custom-axis/session mapping have developed questions; general pixel reorientation is not developed or approved.
- **Rectilinear grids and other named extensions:** J11 explicitly defers this until a real local user fileset and stable semantics establish value. Unsupported feedback remains baseline correctness.
- **Historical missing-version propagation or generic metadata aliases:** No blanket inference/default rule is developed. Keep the known plate omission and potential named label exception separate; do not infer missing source objects or alias units to unit.
- **Extra advanced-load initial-time/channel-exclusion workflow:** Ordinary time/channel selection already exists. J11 names an advanced initial subset but does not independently justify a reload-requiring visibility workflow. Resolution, spatial region and memory estimates have separate questions.
- **Exact numeric quotas, latency targets and selected production pins:** Measurements and reviewed target machines are absent; evaluate the policy/process first, then return with concrete values. No values are invented.
- **Live-data watching and refresh:** J11 retains snapshot/reopen semantics as future work. Correct current request identity does not authorize a live-data workflow.
- **AGAVE Python-client adoption or general 3D viewer fork:** The native reports do not establish a reviewed implementation need or compatibility proof. Local control and backend evaluation are distinct developed choices.

## Source notes

The companion decision-provenance.json contains exact native line/file hashes, every merge/split route, conditional links and excluded out-of-scope concepts. Each footnote below names the contributing draft cards and native report lines; it does not imply approval.

[^d1]: D4-DEC01. Earlier cards: New developed native proposal or explicit scope-normalization question. [J0008-compare notes.md](evidence/comparisons/J0008-compare/notes.md), lines 34, 36, 41; [J0010-compare notes.md](evidence/comparisons/J0010-compare/notes.md), lines 44; [J0011-compare notes.md](evidence/comparisons/J0011-compare/notes.md), lines 18, 20.

[^d2]: D4-DEC02. Earlier cards: New developed native proposal or explicit scope-normalization question. [J0009-compare notes.md](evidence/comparisons/J0009-compare/notes.md), lines 67, 69; [J0010-compare notes.md](evidence/comparisons/J0010-compare/notes.md), lines 205, 206; [J0011-compare notes.md](evidence/comparisons/J0011-compare/notes.md), lines 18, 20.

[^d3]: D4-DEC03. Earlier cards: New developed native proposal or explicit scope-normalization question. [J0008-compare notes.md](evidence/comparisons/J0008-compare/notes.md), lines 36, 41.

[^d4]: D4-DEC04. Earlier cards: D4-J10-D21-DRAFT, D4-J9-D05-DRAFT. [J0010-compare notes.md](evidence/comparisons/J0010-compare/notes.md), lines 144; [J0009-compare notes.md](evidence/comparisons/J0009-compare/notes.md), lines 71.

[^d5]: D4-DEC05. Earlier cards: D4-J9-D06-DRAFT. [J0009-compare notes.md](evidence/comparisons/J0009-compare/notes.md), lines 71.

[^d6]: D4-DEC06. Earlier cards: D4-J9-D07-DRAFT. [J0009-compare notes.md](evidence/comparisons/J0009-compare/notes.md), lines 71.

[^d7]: D4-DEC07. Earlier cards: D4-J9-D18-DRAFT. [J0009-compare notes.md](evidence/comparisons/J0009-compare/notes.md), lines 247.

[^d8]: D4-DEC08. Earlier cards: D4-J10-D29-DRAFT, D4-J9-D16-DRAFT. [J0010-compare notes.md](evidence/comparisons/J0010-compare/notes.md), lines 217; [J0009-compare notes.md](evidence/comparisons/J0009-compare/notes.md), lines 237, 245.

[^d9]: D4-DEC09. Earlier cards: D4-J9-D19-DRAFT. [J0009-compare notes.md](evidence/comparisons/J0009-compare/notes.md), lines 247.

[^d10]: D4-DEC10. Earlier cards: D4-J10-D19-DRAFT, D4-J9-D17-DRAFT. [J0010-compare notes.md](evidence/comparisons/J0010-compare/notes.md), lines 136; [J0009-compare notes.md](evidence/comparisons/J0009-compare/notes.md), lines 246; [J0011-compare leads/decision-register.md](evidence/comparisons/J0011-compare/leads/decision-register.md), lines 17.

[^d11]: D4-DEC11. Earlier cards: D4-J10-D25-DRAFT, D4-J9-D03-DRAFT. [J0010-compare notes.md](evidence/comparisons/J0010-compare/notes.md), lines 164; [J0009-compare notes.md](evidence/comparisons/J0009-compare/notes.md), lines 44, 53.

[^d12]: D4-DEC12. Earlier cards: D4-J10-D23-DRAFT, D4-J9-D02-DRAFT. [J0010-compare notes.md](evidence/comparisons/J0010-compare/notes.md), lines 164; [J0009-compare notes.md](evidence/comparisons/J0009-compare/notes.md), lines 52, 56.

[^d13]: D4-DEC13. Earlier cards: D4-J10-D24-DRAFT. [J0010-compare notes.md](evidence/comparisons/J0010-compare/notes.md), lines 164.

[^d14]: D4-DEC14. Earlier cards: New developed native proposal or explicit scope-normalization question. [J0011-compare notes.md](evidence/comparisons/J0011-compare/notes.md), lines 42, 44, 78; [J0011-compare leads/decision-register.md](evidence/comparisons/J0011-compare/leads/decision-register.md), lines 8.

[^d15]: D4-DEC15. Earlier cards: New developed native proposal or explicit scope-normalization question. [J0011-compare notes.md](evidence/comparisons/J0011-compare/notes.md), lines 38, 40, 42, 44; [J0010-compare notes.md](evidence/comparisons/J0010-compare/notes.md), lines 106; [J0011-compare leads/decision-register.md](evidence/comparisons/J0011-compare/leads/decision-register.md), lines 8.

[^d16]: D4-DEC16. Earlier cards: New developed native proposal or explicit scope-normalization question. [J0010-compare notes.md](evidence/comparisons/J0010-compare/notes.md), lines 44, 46, 48, 242; [J0011-compare notes.md](evidence/comparisons/J0011-compare/notes.md), lines 72, 78; [J0011-compare leads/decision-register.md](evidence/comparisons/J0011-compare/leads/decision-register.md), lines 8.

[^d17]: D4-DEC17. Earlier cards: D4-J10-D22-DRAFT, D4-J9-D01-DRAFT, D4-J8-P1-DRAFT. [J0010-compare notes.md](evidence/comparisons/J0010-compare/notes.md), lines 156, 238, 240, 242; [J0009-compare notes.md](evidence/comparisons/J0009-compare/notes.md), lines 35, 89, 175; [J0008-compare notes.md](evidence/comparisons/J0008-compare/notes.md), lines 128, 130, 132, 134, 136, 138, 140; [J0011-compare leads/decision-register.md](evidence/comparisons/J0011-compare/leads/decision-register.md), lines 7.

[^d18]: D4-DEC18. Earlier cards: D4-J10-D03-DRAFT, D4-J9-D09-DRAFT, D4-J8-P2-DRAFT. [J0010-compare notes.md](evidence/comparisons/J0010-compare/notes.md), lines 50; [J0009-compare notes.md](evidence/comparisons/J0009-compare/notes.md), lines 140, 209; [J0008-compare notes.md](evidence/comparisons/J0008-compare/notes.md), lines 142, 144, 146, 148, 150, 152, 154; [J0011-compare leads/decision-register.md](evidence/comparisons/J0011-compare/leads/decision-register.md), lines 9.

[^d19]: D4-DEC19. Earlier cards: D4-J10-D04-DRAFT, D4-J9-D09-DRAFT, D4-J8-P2-DRAFT. [J0010-compare notes.md](evidence/comparisons/J0010-compare/notes.md), lines 50; [J0009-compare notes.md](evidence/comparisons/J0009-compare/notes.md), lines 140, 209; [J0008-compare notes.md](evidence/comparisons/J0008-compare/notes.md), lines 142, 144, 146, 148, 150, 152, 154; [J0011-compare leads/decision-register.md](evidence/comparisons/J0011-compare/leads/decision-register.md), lines 9.

[^d20]: D4-DEC20. Earlier cards: D4-J10-D05-DRAFT, D4-J9-D13-DRAFT, D4-J8-P2-DRAFT. [J0010-compare notes.md](evidence/comparisons/J0010-compare/notes.md), lines 50; [J0009-compare notes.md](evidence/comparisons/J0009-compare/notes.md), lines 140, 209; [J0008-compare notes.md](evidence/comparisons/J0008-compare/notes.md), lines 142, 144, 146, 148, 150, 152, 154; [J0011-compare leads/decision-register.md](evidence/comparisons/J0011-compare/leads/decision-register.md), lines 9.

[^d21]: D4-DEC21. Earlier cards: D4-J10-D07-DRAFT, D4-J9-D10-DRAFT, D4-J8-P2-DRAFT. [J0010-compare notes.md](evidence/comparisons/J0010-compare/notes.md), lines 50; [J0009-compare notes.md](evidence/comparisons/J0009-compare/notes.md), lines 140; [J0008-compare notes.md](evidence/comparisons/J0008-compare/notes.md), lines 142, 144, 146, 148, 150, 152, 154; [J0011-compare leads/decision-register.md](evidence/comparisons/J0011-compare/leads/decision-register.md), lines 9.

[^d22]: D4-DEC22. Earlier cards: D4-J9-D21-DRAFT. [J0009-compare notes.md](evidence/comparisons/J0009-compare/notes.md), lines 140, 285.

[^d23]: D4-DEC23. Earlier cards: D4-J10-D06-DRAFT, D4-J8-P2-DRAFT. [J0010-compare notes.md](evidence/comparisons/J0010-compare/notes.md), lines 50; [J0008-compare notes.md](evidence/comparisons/J0008-compare/notes.md), lines 142, 144, 146, 148, 150, 152, 154; [J0011-compare leads/decision-register.md](evidence/comparisons/J0011-compare/leads/decision-register.md), lines 9.

[^d24]: D4-DEC24. Earlier cards: D4-J8-P2-DRAFT. [J0011-compare notes.md](evidence/comparisons/J0011-compare/notes.md), lines 46, 207; [J0008-compare notes.md](evidence/comparisons/J0008-compare/notes.md), lines 142, 144, 146, 148, 150, 152, 154; [J0011-compare leads/decision-register.md](evidence/comparisons/J0011-compare/leads/decision-register.md), lines 9.

[^d25]: D4-DEC25. Earlier cards: D4-J10-D12-DRAFT. [J0010-compare notes.md](evidence/comparisons/J0010-compare/notes.md), lines 108.

[^d26]: D4-DEC26. Earlier cards: D4-J10-D13-DRAFT. [J0010-compare notes.md](evidence/comparisons/J0010-compare/notes.md), lines 108.

[^d27]: D4-DEC27. Earlier cards: D4-J10-D14-DRAFT, D4-J9-D11-DRAFT. [J0010-compare notes.md](evidence/comparisons/J0010-compare/notes.md), lines 108; [J0009-compare notes.md](evidence/comparisons/J0009-compare/notes.md), lines 136, 140.

[^d28]: D4-DEC28. Earlier cards: D4-J10-D15-DRAFT, D4-J9-D12-DRAFT. [J0010-compare notes.md](evidence/comparisons/J0010-compare/notes.md), lines 108; [J0009-compare notes.md](evidence/comparisons/J0009-compare/notes.md), lines 140, 190.

[^d29]: D4-DEC29. Earlier cards: D4-J10-D16-DRAFT. [J0010-compare notes.md](evidence/comparisons/J0010-compare/notes.md), lines 108; [J0011-compare leads/decision-register.md](evidence/comparisons/J0011-compare/leads/decision-register.md), lines 15.

[^d30]: D4-DEC30. Earlier cards: New developed native proposal or explicit scope-normalization question. [J0011-compare notes.md](evidence/comparisons/J0011-compare/notes.md), lines 40, 42, 207; [J0011-compare leads/decision-register.md](evidence/comparisons/J0011-compare/leads/decision-register.md), lines 15.

[^d31]: D4-DEC31. Earlier cards: D4-J10-D01-DRAFT. [J0010-compare notes.md](evidence/comparisons/J0010-compare/notes.md), lines 31.

[^d32]: D4-DEC32. Earlier cards: D4-J10-D02-DRAFT. [J0010-compare notes.md](evidence/comparisons/J0010-compare/notes.md), lines 31.

[^d33]: D4-DEC33. Earlier cards: D4-J9-D04-DRAFT. [J0009-compare notes.md](evidence/comparisons/J0009-compare/notes.md), lines 54.

[^d34]: D4-DEC34. Earlier cards: D4-J10-D20-DRAFT, D4-J9-D08-DRAFT. [J0010-compare notes.md](evidence/comparisons/J0010-compare/notes.md), lines 138; [J0009-compare notes.md](evidence/comparisons/J0009-compare/notes.md), lines 118.

[^d35]: D4-DEC35. Earlier cards: D4-J10-D17-DRAFT. [J0010-compare notes.md](evidence/comparisons/J0010-compare/notes.md), lines 114; [J0011-compare leads/decision-register.md](evidence/comparisons/J0011-compare/leads/decision-register.md), lines 16.

[^d36]: D4-DEC36. Earlier cards: D4-J10-D18-DRAFT. [J0010-compare notes.md](evidence/comparisons/J0010-compare/notes.md), lines 114; [J0011-compare leads/decision-register.md](evidence/comparisons/J0011-compare/leads/decision-register.md), lines 16.

[^d37]: D4-DEC37. Earlier cards: D4-J10-D09-DRAFT. [J0010-compare notes.md](evidence/comparisons/J0010-compare/notes.md), lines 94.

[^d38]: D4-DEC38. Earlier cards: D4-J9-D22-DRAFT. [J0009-compare notes.md](evidence/comparisons/J0009-compare/notes.md), lines 271, 285.

[^d39]: D4-DEC39. Earlier cards: D4-J10-D28-DRAFT, D4-J9-D20-DRAFT. [J0010-compare notes.md](evidence/comparisons/J0010-compare/notes.md), lines 215; [J0009-compare notes.md](evidence/comparisons/J0009-compare/notes.md), lines 264, 285.

[^d40]: D4-DEC40. Earlier cards: New developed native proposal or explicit scope-normalization question. [J0011-compare notes.md](evidence/comparisons/J0011-compare/notes.md), lines 117, 127, 129; [J0011-compare leads/decision-register.md](evidence/comparisons/J0011-compare/leads/decision-register.md), lines 19.

[^d41]: D4-DEC41. Earlier cards: D4-J10-D30-DRAFT. [J0010-compare notes.md](evidence/comparisons/J0010-compare/notes.md), lines 217; [J0011-compare leads/decision-register.md](evidence/comparisons/J0011-compare/leads/decision-register.md), lines 14.

[^d42]: D4-DEC42. Earlier cards: D4-J10-D31-DRAFT. [J0010-compare notes.md](evidence/comparisons/J0010-compare/notes.md), lines 217; [J0011-compare leads/decision-register.md](evidence/comparisons/J0011-compare/leads/decision-register.md), lines 14.

[^d43]: D4-DEC43. Earlier cards: D4-J8-P4A-DRAFT. [J0008-compare notes.md](evidence/comparisons/J0008-compare/notes.md), lines 170, 172, 174, 176; [J0011-compare notes.md](evidence/comparisons/J0011-compare/notes.md), lines 205; [J0011-compare leads/decision-register.md](evidence/comparisons/J0011-compare/leads/decision-register.md), lines 12.

[^d44]: D4-DEC44. Earlier cards: D4-J8-P4A-DRAFT. [J0008-compare notes.md](evidence/comparisons/J0008-compare/notes.md), lines 170, 172, 174, 176; [J0011-compare notes.md](evidence/comparisons/J0011-compare/notes.md), lines 205; [J0011-compare leads/decision-register.md](evidence/comparisons/J0011-compare/leads/decision-register.md), lines 12.

[^d45]: D4-DEC45. Earlier cards: D4-J8-P4A-DRAFT. [J0008-compare notes.md](evidence/comparisons/J0008-compare/notes.md), lines 170, 172, 174, 176; [J0011-compare notes.md](evidence/comparisons/J0011-compare/notes.md), lines 195, 205; [J0011-compare leads/decision-register.md](evidence/comparisons/J0011-compare/leads/decision-register.md), lines 12.

[^d46]: D4-DEC46. Earlier cards: D4-J10-D08-DRAFT. [J0010-compare notes.md](evidence/comparisons/J0010-compare/notes.md), lines 77; [J0011-compare leads/decision-register.md](evidence/comparisons/J0011-compare/leads/decision-register.md), lines 20.

[^d47]: D4-DEC47. Earlier cards: D4-J9-D14-DRAFT. [J0009-compare notes.md](evidence/comparisons/J0009-compare/notes.md), lines 167, 175.

[^d48]: D4-DEC48. Earlier cards: D4-J9-D15-DRAFT. [J0009-compare notes.md](evidence/comparisons/J0009-compare/notes.md), lines 175.

[^d49]: D4-DEC49. Earlier cards: New developed native proposal or explicit scope-normalization question. [J0011-compare notes.md](evidence/comparisons/J0011-compare/notes.md), lines 203, 206; [J0011-compare leads/decision-register.md](evidence/comparisons/J0011-compare/leads/decision-register.md), lines 13.

[^d50]: D4-DEC50. Earlier cards: D4-J8-P4B-DRAFT. [J0011-compare notes.md](evidence/comparisons/J0011-compare/notes.md), lines 86, 206; [J0008-compare notes.md](evidence/comparisons/J0008-compare/notes.md), lines 170, 172, 178, 180; [J0011-compare leads/decision-register.md](evidence/comparisons/J0011-compare/leads/decision-register.md), lines 13.

[^d51]: D4-DEC51. Earlier cards: D4-J8-P4B-DRAFT. [J0011-compare notes.md](evidence/comparisons/J0011-compare/notes.md), lines 206; [J0008-compare notes.md](evidence/comparisons/J0008-compare/notes.md), lines 170, 172, 178, 180; [J0011-compare leads/decision-register.md](evidence/comparisons/J0011-compare/leads/decision-register.md), lines 13.

[^d52]: D4-DEC52. Earlier cards: D4-J8-P4B-DRAFT. [J0008-compare notes.md](evidence/comparisons/J0008-compare/notes.md), lines 170, 172, 178, 180; [J0011-compare notes.md](evidence/comparisons/J0011-compare/notes.md), lines 206; [J0011-compare leads/decision-register.md](evidence/comparisons/J0011-compare/leads/decision-register.md), lines 13.

[^d53]: D4-DEC53. Earlier cards: New developed native proposal or explicit scope-normalization question. [J0011-compare notes.md](evidence/comparisons/J0011-compare/notes.md), lines 86, 206; [J0011-compare leads/decision-register.md](evidence/comparisons/J0011-compare/leads/decision-register.md), lines 13.

[^d54]: D4-DEC54. Earlier cards: D4-J10-D10-DRAFT. [J0010-compare notes.md](evidence/comparisons/J0010-compare/notes.md), lines 96.

[^d55]: D4-DEC55. Earlier cards: D4-J10-D11-DRAFT. [J0010-compare notes.md](evidence/comparisons/J0010-compare/notes.md), lines 96.

[^d56]: D4-DEC56. Earlier cards: New developed native proposal or explicit scope-normalization question. [J0011-compare notes.md](evidence/comparisons/J0011-compare/notes.md), lines 127, 129, 131, 133, 135; [J0011-compare leads/decision-register.md](evidence/comparisons/J0011-compare/leads/decision-register.md), lines 10.

[^d57]: D4-DEC57. Earlier cards: D4-J10-D26-DRAFT, D4-J8-P3-DRAFT. [J0010-compare notes.md](evidence/comparisons/J0010-compare/notes.md), lines 185; [J0008-compare notes.md](evidence/comparisons/J0008-compare/notes.md), lines 156, 158, 160, 162, 164, 166, 168.

[^d58]: D4-DEC58. Earlier cards: D4-J10-D27-DRAFT, D4-J8-P3-DRAFT. [J0010-compare notes.md](evidence/comparisons/J0010-compare/notes.md), lines 186; [J0008-compare notes.md](evidence/comparisons/J0008-compare/notes.md), lines 156, 158, 160, 162, 164, 166, 168.

[^d59]: D4-DEC59. Earlier cards: New developed native proposal or explicit scope-normalization question. [J0011-compare notes.md](evidence/comparisons/J0011-compare/notes.md), lines 97, 99, 101; [J0011-compare leads/decision-register.md](evidence/comparisons/J0011-compare/leads/decision-register.md), lines 11.

[^d60]: D4-DEC60. Earlier cards: New developed native proposal or explicit scope-normalization question. [J0011-compare notes.md](evidence/comparisons/J0011-compare/notes.md), lines 101; [J0011-compare leads/decision-register.md](evidence/comparisons/J0011-compare/leads/decision-register.md), lines 11.
