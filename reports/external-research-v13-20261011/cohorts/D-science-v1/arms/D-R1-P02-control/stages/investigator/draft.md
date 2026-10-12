# Investigator draft — D-R1-P02-control

**Status:** complete investigator draft against the exact released plan.  
**Plan release:** revealed-plan.md, released 2026-10-12T04:23:43.267Z; discovery SHA-256 was frozen before release. Discovery was not edited afterward.  
**Scope:** component plan for deterministic image derivatives. This is not deployment, a production service design, or a library selection.  
**Checks actually run:** no product/image checks. All test items below are proposals.

## Recommendation in brief

Keep the plan's separate original, per-image staged output, alpha-aware output intent, independent successful derivatives, cancellation cleanup, and proposed fixture themes. Correct the order/policy description and add explicit color, metadata, provenance, resource, state, and batch-completeness requirements.

Do not decide a winning implementation from this desk research. Sharp/libvips, Pillow, and ImageMagick are viable candidates with materially different API, default, resource, and codec behavior. Select only after pinning a release/build matrix and running the proposed representative fixtures. A format may decode differently across library version, codec, TIFF compression, profile, and orientation source.

## Exact plan clause dispositions

### C1 — Operation order, representation, color, alpha

> The draft reads orientation and embedded profiles during inspection, decodes to one internal pixel format, resizes, applies orientation, and exports a review copy in a standard display color space. It would preserve alpha where the target format supports it and flatten against a configurable background otherwise. Research whether that operation order and representation preserve the visual behavior the brief needs, particularly with profile conversion and partially transparent edges.

**Disposition: revise the general order; retain the intent with explicit policy.**

- **Correction — orientation and geometry:** Do not prescribe resize-then-orient as the general pipeline. Resolve/apply orientation exactly once before crop/fit and target-dimension decisions, then emit physically oriented pixels and clear/reset the orientation signal. A library may fold orientation into a thumbnail/decode path, but that counts as the one orientation operation and must be confirmed for the pinned decoder. Sharp reports that EXIF orientation is removed by autoOrient and XMP orientation is not handled there; libvips and Pillow histories show TIFF/load paths can already consume orientation. Thus “apply orientation after resize” is not a reliable cross-format rule. A simple right-angle transform and an uncropped isotropic resize can sometimes commute mathematically if dimensions are swapped consistently; thumbnail fit/crop behavior, nonsquare bounds, decode-time scaling, or a decoder that already rotated pixels make the general result differ. See [SRC-SHARP-07](../sources/index.md), [SRC-PILLOW-13](../sources/index.md), [SRC-LIBVIPS-14](../sources/index.md), [SRC-IM-18](../sources/index.md).
- **Correction — one internal pixel format:** A single internal representation is not enough as a contract. Name channel layout, precision/bit depth, alpha association, working color space, and how the source profile is attached to pixel values. An early conversion to 8-bit sRGB can discard wide-gamut, high-bit-depth, or CMYK information before the chosen output transform; preserve adequate precision until the output transform/encode.
- **Correction — color policy:** “A standard display color space” is underspecified. Choose an output profile per derivative role (sRGB is a candidate for a general review thumbnail, not an approved decision), rendering intent, and behavior for missing, malformed, unsupported, or conflicting profiles. Keep the ICC profile that describes current pixels until transform is complete; stripping then attaching a target profile without conversion relabels values and can change appearance. After transform, attach the intended output profile even if unrelated identifying metadata is stripped. The ICC specification provides profile interchange structure, while APIs have consequential defaults: Pillow profileToProfile intent defaults to perceptual; Sharp converts to sRGB and removes ICC/other metadata by default, while separate helpers preserve or attach profiles; ImageMagick profile operations are ordered transforms and repeated conversions can yield different results. See [SRC-ICC-03](../sources/index.md), [SRC-PILLOW-10](../sources/index.md), [SRC-SHARP-08](../sources/index.md), [SRC-IM-16](../sources/index.md).
- **Correction — alpha and resampling:** Keep the plan’s alpha support and configurable flattening, but declare which outputs preserve alpha and which flatten, plus the chosen background for each flattened role. PNG stores unassociated (non-premultiplied) alpha; transparent pixels may contain arbitrary color values. This format fact motivates explicit alpha-aware resampling and transparent-edge tests, but does not prescribe a library’s resampling algorithm. Do not treat successful output dimensions as proof of visual preservation. See [SRC-PNG-02](../sources/index.md).
- **Condition:** Make scale order and algorithm explicit: output size, contain/cover/crop, focal point if applicable, upscaling rule, filter, bit depth, output format and encoder settings. Decode-time downsampling can reduce large-image work when supported; full decode followed by resize is a simpler alternative but can cost more memory. Compare a normal profile-aware path with any proposed linear-light path. libvips #4343 is a conditional report for one non-public Apple profile input on 8.16.0, not evidence that linear scaling is generally wrong or fixed. See [SRC-LIBVIPS-15](../sources/index.md).
- **Owner decisions:** Review-thumbnail and review-copy formats/sizes; crop and upscale behavior; target profile and rendering intent; alpha/flatten rules and backgrounds; missing/bad-profile fallback; XMP/EXIF conflict handling; accepted input bit depths and color spaces.

### C2 — Derivative identity, preset and reproducibility

> Derivative identity would include the original digest and a preset name. Updating a preset would invalidate old thumbnails. The draft assumes decoder upgrades do not require additional provenance because the original is unchanged. Examine reproducibility, parameter capture, and version-sensitive behavior before accepting that simplification.

**Disposition: correct the identity/provenance model; retain the original digest and preset as useful fields.**

- **Correction:** Input digest plus human-readable preset name is insufficient to regenerate a particular derivative. The same named preset can be edited, and decoder, codec, color-management engine, encoder defaults, or operation ordering can change output with the same source bytes. Record a versioned/canonical settings snapshot or policy hash and the resolved values, not only the preset name.
- **Required provenance proposal:** source SHA-256; source format/decoded facts; derivative role; canonical preset/settings version; decode library and exact version; linked native decoder/codec versions and build features; orientation source and decision; source and target ICC profile identity/hash; transform engine and rendering intent; size/fit/crop/filter/alpha/flatten settings; output format and encoder/version/options; output dimensions; output SHA-256; terminal item state and failure code if any. Keep contributor identifiers out of this record unless separately approved.
- **Correction:** Decoder upgrades do require new provenance because unchanged source can produce different decoded pixels or output. Keep prior derivative records/settings if historical regeneration matters; version changes should create a new derivative identity and must not silently replace another role’s output.
- **Condition:** Provenance supports a reproducible attempt and explains differences; it does not promise bit-identical bytes across builds, architectures, or nondeterministic codec behavior. If byte-level determinism is required, make it a separate requirement and test it.
- **Already covered:** Original digest, preset reference, and invalidating derivatives when a preset changes are good starting points. Preserve them as human-facing shortcut/lookup fields alongside canonical settings and software provenance.
- **Owner decisions:** Provenance schema/canonical serialization, retention period, whether old outputs are retained or regenerated on demand, and whether “reproduce” means perceptual equivalence or byte identity.

Evidence: Sharp’s release notes and the Pillow/libvips/ImageMagick orientation histories show behavior is release-sensitive, not fixed by unchanged input bytes ([SRC-SHARP-04](../sources/index.md), [SRC-PILLOW-12](../sources/index.md), [SRC-PILLOW-13](../sources/index.md), [SRC-LIBVIPS-14](../sources/index.md), [SRC-IM-18](../sources/index.md)).

### C3 — Metadata removal and role-specific privacy

> Export would remove a list of identifying metadata tags and retain dimensions and a color profile. Internal review would use a more permissive policy. Compare explicit allowlists, re-encoding, and other metadata-handling approaches using actual format mechanisms, including less obvious containers or auxiliary payloads. No claim of privacy completeness should rest on one successful sample.

**Disposition: replace the tag denylist with role-specific allowlists across supported formats; keep the distinction between export and internal review.**

- **Correction:** A list of known identifying tags cannot guarantee removal of identifiers from every format/container. Define what may remain for each role. External exports should start from a minimal allowlist and enumerate supported metadata/container families: EXIF and maker notes, GPS, XMP, IPTC, comments, JPEG application segments, PNG text and ancillary chunks, embedded previews/thumbnails, format-specific auxiliary records, and sidecars if handled. Unknown/unparsed metadata should follow an explicit fail/strip/review policy.
- **Correction:** “Retain a color profile” must mean retain the profile that matches encoded pixel values, normally by transforming then attaching an approved target ICC profile. It must not mean carrying through the source ICC when values were converted, or keeping a source ICC in a privacy-cleared copy without an owner-approved reason. ImageMagick strip removes profile/comment data and PNG color chunks; Sharp’s no-keepMetadata default converts to sRGB and strips all metadata, while keepMetadata preserves EXIF, ICC, XMP and IPTC together. These behaviors show why profile retention and identity-metadata retention need separate policy controls. See [SRC-IM-16](../sources/index.md), [SRC-SHARP-08](../sources/index.md), [SRC-PNG-02](../sources/index.md).
- **Condition:** Re-encode from decoded pixels to a new derivative, then inspect the encoded file against the role allowlist. Re-encoding can drop unsupported metadata, but must not be treated as complete sanitization by itself; writers can retain/copy fields and formats can carry non-obvious chunks or payloads. Never overwrite or mutate the submitted original.
- **Already covered:** Separate export and internal-review policies, removing metadata while retaining dimensions/profile as a stated goal, checking more than a single sample, and avoiding a completeness claim are sound. Retain them with the conditions above.
- **Rejected simplification:** “Delete the identifying tags” as the primary policy. It misses fields that were not enumerated and makes allow-by-default behavior likely.
- **Owner decisions:** Exact fields allowed for internal copies, whether dimensions themselves are retained, privacy classification of technical metadata, unknown-container behavior, and whether the product can claim a particular sanitization level. Any claim must be bounded to formats and structures actually enumerated and checked.

### C4 — Worker limits, output publication, cancellation and reporting

> Workers would reject inputs beyond a pixel-count limit, write outputs to temporary paths, and publish each successful image independently. Cancellation would retain completed derivatives and delete incomplete ones. Recommend dispositions for these rules, including memory accounting, failure reporting, and whether users need batch-level completeness information.

**Disposition: retain per-item publication and cleanup; strengthen resource controls and make partial-batch state visible.**

- **Correction:** A pixel-count threshold alone is not a predictable memory bound. Check width/height/page arithmetic before decode, but also set explicit memory, time/CPU, disk/temp-space, concurrency, file/frame, and output-size limits around decoder/encoder work. Use candidate-configured guards plus an isolated worker/process boundary if available. Sharp’s limitInputPixels defaults to 268,402,689 pixels and explicitly trusts metadata dimensions; Pillow’s configurable MAX_IMAGE_PIXELS warns at its threshold and errors above twice it unless warnings are promoted; ImageMagick has memory/map/disk/area/time limits, with host-adjusted defaults and disk spill behavior. Do not carry any library default forward as the product limit. See [SRC-SHARP-06](../sources/index.md), [SRC-PILLOW-11](../sources/index.md), [SRC-IM-16](../sources/index.md).
- **Correction:** Write each output to a unique staging path and publish atomically only after successful completion and metadata checks. A rejected/failed/canceled item has no final derivative and never displays a plausible placeholder. Preserve all previously completed derivatives; do not delete successes just because the batch is canceled. Clean incomplete staging output and record a terminal reason.
- **Correction:** Report per-item terminal states and a batch summary. A batch with some success and some unsupported/failure/canceled items is partial, not an unqualified “complete” success. Show total counts and identify each non-success with an actionable reason/retry guidance. Keep per-image independence from the plan.
- **Condition:** Define the cancellation boundary: stop starting queued items immediately; decide whether in-flight work finishes or is interrupted. If interrupted, remove its staging file and mark it canceled. A completed item that was atomically published stays succeeded. A batch manifest must reflect these states.
- **Already covered:** Pixel check, temporary paths, publishing successful images independently, preserving completed results on cancel, and deleting incomplete outputs are appropriate foundations.
- **Owner decisions:** Concrete ceilings based on expected desktop/server resources; whether cancellation waits for current item or interrupts it; exact user wording; retry/overwrite policy and retention of partial outputs.

### C5 — Validation scope

> Propose checks for orientation variants, profile/alpha interactions, corrupt metadata, huge dimensions, export-policy differences, and cancellation. Report any executed fixture checks without implying production visual validation.

**Disposition: retain and expand the proposal; report zero executed product checks.**

The proposed matrix is below and in [discovery.md](discovery.md). Add all eight orientation values including mirrors; JPEG- and LZW-compressed TIFF paths; no orientation and conflicting EXIF/XMP; unchanged original bytes; missing, malformed and unsupported ICC; wide-gamut and CMYK; partially transparent edges with nonzero hidden RGB; limit exhaustion; output metadata inspection by format/role; batch mixtures; cancellation before and during processing; and provenance/rebuild comparison.

**Already covered:** the plan names key domains and requires honest reporting of fixture execution versus production visual validation. Keep that distinction.

## Supported findings and alternatives

| Candidate | Evidence-supported behavior relevant to this plan | Conditionality/selection consequence |
|---|---|---|
| **Sharp/libvips** | Header metadata inspection does not decode compressed pixels and width/height ignore EXIF orientation. Input limit defaults to 268,402,689 pixels and trusts header dimensions. autoOrient uses EXIF, removes the tag, and does not handle XMP orientation. Default output converts to sRGB and strips metadata/ICC; opt-ins can preserve ICC or all metadata. | Default may fit an export role but changes wide-gamut output policy and removes ICC. Pin Sharp/libvips/codecs; explicit pixel limits and XMP/TIFF behavior need tests. |
| **Pillow** | exif_transpose applies EXIF orientation and removes orientation data. ImageCms profileToProfile transforms between profiles, defaults to perceptual intent, and raises on invalid profiles/modes. MAX_IMAGE_PIXELS is a configurable decompression-bomb guard. | Promote warning to error and configure the threshold. Pin Pillow plus system codecs. Historical #5580 and #8556 require immutability and decoder-applied-orientation tests. |
| **ImageMagick** | auto-orient reads/resets EXIF Orientation and does nothing if EXIF was stripped first. profile performs ordered color conversion dependent on present profiles. strip removes profiles/comments and color chunks. Resource limits cover memory/map/disk/area/time and other resources; defaults can vary by host. | Strong knobs, but order, limits, delegate policy and release-specific decoder behavior must be part of the component contract. History #7147 is a reason to test both TIFF compression paths. |

No candidate is selected. Selection criteria should include integration boundary/language, required formats/codecs across supported builds, correct orientation behavior, color/alpha controls, output metadata allowlisting, resource behavior, maintainability, licensing/packaging, performance under policy limits, and ability to reproduce/regression-test the chosen pipeline.

## Original brief coverage

| Original obligation | Draft disposition |
|---|---|
| Inspect input; predictable thumbnails/review copies; export selected images without changing originals | C1/C4; immutable source, explicit role settings, staged no-overwrite output. |
| Orientation, wide-gamut profiles, transparency, huge dimensions, broken metadata | C1/C4/C5; orientation/profile/alpha policies, malformed-input state, hard ceilings. |
| Side-by-side comparison; explain output policy; provenance for regeneration after settings/decoder changes | C1/C2; versioned settings/software/profile/encoder records, explicit limits of reproducibility. |
| Some exports omit identifying metadata while preserving appearance; internal copies retain selected technical metadata | C3; separate role allowlists, transform before attaching output ICC, encoded-file checks. |
| Maintained implementations, format/color docs, issue/fix/regression/release evidence; no winner chosen | Alternatives/evidence above; pin versions and keep unresolved history conditional. |
| Compare decoding/color transformations and scaling/orientation/alpha/output-profile interactions | C1/C5; exact stage contract and tests. |
| Predictable excessive-memory failure | C4/C5; multiple explicit resource budgets, not pixels alone. |
| Mixed supported/unsupported batches and understandable cancellation state | C4; per-item states, batch summary, transactional outputs. |
| No overwrite, upload, one-tag privacy claim, dimension-only fidelity, or silent plausible substitute | Explicitly rejected in C1/C3/C4. No uploads or service changes occurred. |
| User learns unsupported inputs and exceptions | C4/C5; actionable per-item outcomes and retry reason. |
| Generated/public fixtures may be used; distinguish actual from proposed checks | No fixture checks executed; proposals are labeled and no production visual claim is made. |

## Already covered, rejected, uncertain, optional

**Already covered and retained:** input digest; preset association and preset-change invalidation; alpha when supported and configurable flattening otherwise; independent publication of completed images; temp paths and cancellation cleanup; key fixture categories; distinct reporting of executed and proposed checks.

**Rejected as too weak or inaccurate:** resize-then-orient as an unconditional order; one unspecified internal pixel format; “standard display color space” without target profile/intent and absent/bad-profile policy; preset name as the sole settings record; no decoder-version provenance; pixel count as the sole resource boundary; deleting a list of tags as a complete privacy control; declaring partial batch success simply “complete”; using dimensions or encode success as visual-fidelity evidence; any silent fallback image.

**Uncertain and therefore an owner/test item:** whether linear-light scaling is preferred for this review workflow; the scope/resolution of libvips #4343, whose image was not public; current exact TIFF orientation behavior across builds/codecs; any malformed-profile fallback; complete metadata sanitization over every selected output format; byte-identical regeneration across versions/platforms. None is settled by desk research.

**Optional improvements beyond the released plan:** record output SHA-256 and profile hashes; generate a policy fingerprint from canonical settings; expose per-item counts/reasons in batch UI; add seeded metadata canaries; include unsupported codec-build detection. These strengthen stated requirements but do not choose a product behavior without owners.

## Validation proposals versus executed checks

**Proposed, not run:** generated/public fixtures covering (1) all eight EXIF orientations and mirrors, missing/invalid/conflicting EXIF/XMP, TIFF decoder orientation with JPEG/LZW compression and original immutability; (2) tagged sRGB, wide-gamut, CMYK, gray, missing/malformed ICC and intent/profile failure; (3) transparent edges, hidden RGB, semitransparency, resize/filter/crop and explicit JPEG flatten background; (4) corrupt/truncated inputs, dimensions near/above limits, large decode ratios, many pages/frames and resource exhaustion; (5) EXIF/GPS, XMP, IPTC, comments, PNG text/profile chunks and auxiliary payloads against each role allowlist; (6) mixed batches, cancel before/in-flight, encode failure, atomic publication, partial status and retry idempotency; and (7) regeneration under pinned versions, with output hash and perceptual comparison recorded.

**Executed:** no product checks, fixture generation, code, build, malicious-input test, perceptual review, benchmark, or integration. I read official documentation/standards and upstream issue/release histories, wrote discovery/source map, released and read the exact plan copy, and prepared this draft. Workflow helper output and native Goal lifecycle are not product-test evidence.

## Source map

Full source identities, release versions/commits, locators, UTC access window, observed operation, conditions, and applicability are recorded in [source-map.json](source-map.json). Browse the [sources index](sources/index.md); source IDs are preserved without rebinding.
