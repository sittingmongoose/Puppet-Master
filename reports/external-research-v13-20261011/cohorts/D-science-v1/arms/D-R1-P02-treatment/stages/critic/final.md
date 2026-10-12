# D-P02 — Final component plan

## Decision status

This is a research-backed plan for a local image-derivative component. It does not deploy a service, upload contributor files, or select a winning library. The original remains immutable. Accepted formats, precise image policy, resource budgets, internal metadata fields, and the required reproducibility level remain owner decisions.

The plan addresses thumbnails and review copies separately where quality, privacy, or embedded metadata needs differ. A generated derivative is successful only after the decode, declared transforms, encode, policy check, and output verification complete. A partial or plausible-looking decode is a failed item.

## Recommended component contract

### 1. Inspect and admit inputs before full decode

Read files locally and read-only. Identify formats from their content, then use an explicit allowlist and pinned decoder builds. Apply compressed-byte, header, dimension, frame/page, and metadata-size checks with checked arithmetic before allocation. Track input profile/color signals, orientation and container transforms, frame/page structure, bit depth, and alpha capability where the decoder exposes them.

Use per-format behavior. PNG 3 gives precedence to understood color signals in this order: cICP, iCCP, sRGB, then cHRM plus gAMA. It says an untagged RGB PNG is device-dependent; a viewer may choose a likely default, so the component must record an owner-chosen fallback or report the ambiguity. WebP specifies sRGB when ICCP is absent. These are different format rules, not one global fallback. [STD-PNG3](sources/index.md#std-png3), [FORMAT-WEBP-RIFF](sources/index.md#format-webp-riff)

For broken, unsupported, or incompatible profiles, never silently label the samples as sRGB. Choose a visible failure or an explicit owner-approved fallback per format and record it. A valid but unsupported profile, an absent profile, and an invalid profile should be distinct item outcomes.

### 2. Normalize orientation once while preserving backend choices

Record the source orientation and every container transform, plus whether the chosen loader has already applied them. The output pixels must represent the intended upright image exactly once; output metadata must not trigger a second transform.

Plan target bounds and crops against the logically oriented image. A backend can apply orientation before resize, or it can shrink first and orient the smaller thumbnail, if the backend correctly maps dimensions/crops and the selected build passes the full orientation matrix. libvips thumbnail interprets orientation tags and its documented path can rotate the thumbnail after shrinking; forcing a full-resolution rotation first can discard its resize-on-load advantage. Pillow’s EXIF helper and Rust image’s metadata helper instead show APIs that apply the transform and clear the EXIF instruction. Test the API actually chosen, including all eight mirrored/rotated states, auto-orient behavior, orientation reset, and no/invalid orientation. [LIBVIPS-THUMBNAIL-817](sources/index.md#libvips-thumbnail-817), [LIBVIPS-ISSUE-1523](sources/index.md#libvips-issue-1523), [PILLOW-IMAGEOPS-123](sources/index.md#pillow-imageops-123), [RUST-IMAGE-ORIENTATION-02510](sources/index.md#rust-image-orientation-02510)

### 3. Compare two transform paths against the same output contract

| Path | Useful properties | Costs and required evidence |
|---|---|---|
| Optimized thumbnail | Let a tested decoder shrink during load, then apply an explicit resize/crop and orientation policy. Demand-driven thumbnail APIs may lower memory and time substantially. Keep the decoder, frame policy, filter, color conversion, and orientation behavior in the recipe. | Loader shortcuts depend on format/build. libvips documents sRGB shrinking by default, premultiplication, and a linear option that may improve results but prevents JPEG shrink-on-load and can be much slower. Progressive JPEG can require much more memory. Measure geometry, color/detail and alpha edges, plus resource use for every supported format. [LIBVIPS-THUMBNAIL-817](sources/index.md#libvips-thumbnail-817), [LIBVIPS-CHECKLIST](sources/index.md#libvips-checklist) |
| Reference-quality transform | Decode at the selected supported precision; interpret the source profile with a named CMM; compare linear-light filtering of premultiplied color and alpha; convert to the chosen output profile and encode under explicit settings. This is a useful comparison baseline for review-visible changes. | It can use more memory and time and can forgo decoder shrink. Linear-light operation is a quality candidate, not a standard-mandated default for every thumbnail. Compare against the optimized path using paired perceptual review and declared image-space metrics before choosing. |

The brief does not establish which output quality target is required. The owner should decide whether thumbnails use the optimized path, whether review copies require the reference path, and whether the same quality contract applies to both. Do not claim fidelity from output dimensions alone.

### 4. Define output geometry, color, and alpha explicitly

For each versioned preset, define target bounds, fit versus fill/crop, crop coordinate space, upscaling, integer rounding, resampling filter, sample precision, encoder quality, frame/page policy, and output format. A library’s default is not a product policy.

Interpret source samples through a compatible profile/color signal. Pin the CMM, source fallback, target profile, rendering intent, black-point behavior if used, gamut mapping, and conversion precision. Consider sRGB as an interoperability baseline; retain a supported wide-gamut profile or provide a separate managed review copy only if reviewers need it. Embed one consistent target profile/signal where supported. ICC.1:2022 v4.4 includes profile metadata and CICP support; compatibility and transform intent still depend on the actual profile, CMM, modes, and build. [STD-ICC-2022](sources/index.md#std-icc-2022), [PILLOW-IMAGECMS-123](sources/index.md#pillow-imagecms-123)

Treat alpha as opacity/coverage separate from RGB color transforms. Do not apply an RGB transfer curve or ICC transform to alpha. Compare filtering premultiplied color and alpha to avoid transparent-edge fringes; define how zero-alpha pixels are handled. If the output format lacks alpha, composite against a named, versioned background in the selected output color space. Retain alpha only when the chosen format and reviewer workflow support it. [STD-PNG3](sources/index.md#std-png3), [FORMAT-WEBP-RIFF](sources/index.md#format-webp-riff)

### 5. Use separate public-export and internal-review metadata policies

Do not copy arbitrary source metadata. Define separate allowlists for:

- **Public export:** only output fields required to interpret the rendered pixels, such as the target color signal/profile and required alpha. Remove source EXIF, GPS, MakerNotes, XMP/IPTC, comments, embedded source thumbnails, text/time chunks, and other disallowed blocks or auxiliary data to the extent supported by the selected format writer.
- **Internal review:** explicitly name the technical fields reviewers need in the derivative. Candidate fields include normalized dimensions and orientation disposition, and selected capture/device facts only when the owner approves them. Keep decoder/CMM build identity, original profile hash, source digest, and full recipe in a private sidecar unless the owner separately chooses image-embedded fields.

A sidecar does not automatically satisfy a requirement for metadata in an internal review copy. Preserve the target profile needed for the output appearance; do not retain an arbitrary source profile by default. Re-encoding or constructing a fresh output container is not proof of privacy by itself. Audit the exact output bytes and report only tested format/build coverage. ExifTool documents that duplicate tags can be suppressed in ordinary listings, GPS may exist outside the EXIF GPS group, and removing color-space information may change appearance. Filenames, directory paths, filesystem attributes, and identifying content visible in pixels need separate policy. [EXIFTOOL-FAQ](sources/index.md#exiftool-faq), [STD-PNG3](sources/index.md#std-png3)

Format handling must follow the actual container:

- **PNG:** build a consistent color signal and required alpha; omit unapproved eXIf, text, time, and other chunks. Respect the PNG color-signal precedence.
- **WebP:** rebuild/verify RIFF features, ICCP, alpha, frame data, EXIF/XMP, unknown chunks, duplicates, and termination. ICCP should precede image data; if absent, sRGB is the specified assumption.
- **AVIF:** if enabled, parse its image-item relationships and properties, including primary image, alpha/depth auxiliaries, crop/rotation/mirroring, color information, and hidden gain-map/tone-map items. Keep only explicitly required links and signals in the new output.
- **JPEG/Exif and MPF:** account for Exif, ICC, XMP, other application segments, embedded thumbnails, and multi-picture references. The CIPA index lists a 2026 MPF translation but its details retain an older publication/history date; pin and inspect the exact current standard before admitting MPO/MPF.

Until an exact format/version’s decode and export policy is verified, classify it as unsupported. Do not claim that one clean sample or one metadata scanner proves universal sanitization. [STD-PNG3](sources/index.md#std-png3), [FORMAT-WEBP-RIFF](sources/index.md#format-webp-riff), [FORMAT-AVIF-1_2_0](sources/index.md#format-avif-1_2_0), [STD-CIPA-EXIF31](sources/index.md#std-cipa-exif31), [STD-CIPA-MPF](sources/index.md#std-cipa-mpf)

### 6. Make resource failure, publication, and batch state predictable

A pixel-count threshold is insufficient. A conservative peak-memory estimate can guide admission, but it is not a hard limit because codecs may allocate scratch buffers, expand color precision, decode multiple frames, or use implementation-specific memory. Enforce a process/OS memory boundary plus compressed-byte, width/height, pixel, frame/page, metadata, CPU/time, disk, thread/concurrency, and output-size limits. Cap temporary storage as well as memory.

The alternatives have different limit semantics:

- libvips can avoid full-size intermediates for some formats, while its current checklist warns that progressive JPEG may require the full image in memory. Treat that format/path separately. [LIBVIPS-CHECKLIST](sources/index.md#libvips-checklist)
- ImageMagick exposes width, height, area, memory, map, disk, file, thread, and time controls. Memory/map pressure may spill its pixel cache to disk, so memory alone is not a predictable rejection boundary. Security policy is installation-specific. [IMAGEMAGICK-OPTIONS](sources/index.md#imagemagick-options), [IMAGEMAGICK-SECURITY](sources/index.md#imagemagick-security)
- Pillow documents decompression-bomb warning/error thresholds, CPU-heavy legal images, and use of format allowlists, warning-as-error, time limits, and process memory limits. Check installed values and codec builds. [PILLOW-SECURITY-123](sources/index.md#pillow-security-123)
- Rust image 0.25.10 documents strict width/height limits but a non-strict allocation cap that some decoders may ignore. Verify strict-limit support for each concrete decoder and use an external process boundary. [RUST-IMAGE-02510](sources/index.md#rust-image-02510)

Use a read-only source and a unique temporary output on the destination filesystem. Encode, reopen, and verify policy before publication. Publish one successful derivative at a time through a no-clobber atomic operation; never overwrite the original. On any decode, profile, policy, limit, encode, or write failure, delete the partial temporary output and record a per-item reason.

For batches, stop scheduling pending items after cancellation, signal or terminate in-flight work within a bound, remove temporary partial outputs, and keep already-published successes. Write a batch manifest with item status, output path/hash, preset/recipe version, failure or cancellation reason, counts, and a partial/complete flag. The UI should explain unsupported format, corrupt/truncated input, profile/policy exception, resource limit, write error, and cancellation in ordinary terms with a next step when possible. Example: “No review copy was created: this file is incomplete. The original was left unchanged.”

### 7. Keep regeneration provenance private and versioned

Use a canonical recipe hash as part of derivative identity along with the source content hash and relevant decoder/CMM/encoder build identity. Record at least:

- source and derivative hashes; controlled local source identifier and format;
- source dimensions, bit depth, frame/page selection, orientation value and applied/reset disposition;
- source profile/signal identity or absent/invalid status, target profile hash, CMM and rendering intent;
- fit/crop/upscale/rounding/filter settings, working space, alpha/background rule, output format/quality and metadata policy version;
- application/library, format plug-in, transitive codec, CMM, and encoder versions/build identifiers;
- creation time, item/batch status, failure and retry history.

A changed preset receives a new immutable revision and recipe identity. A decoder or CMM upgrade may change pixels even when the source is unchanged. Promise that the recorded recipe and pinned toolchain can attempt regeneration; do not promise byte-for-byte output across toolchain changes unless measured. Keep this provenance outside public exports and do not upload the contributor image. [LIBVIPS-ISSUE-1523](sources/index.md#libvips-issue-1523), [PILLOW-ORIENTATION-HISTORY](sources/index.md#pillow-orientation-history), [STD-ICC-2022](sources/index.md#std-icc-2022)

## Implementation approaches compared; no winner selected

| Candidate | Evidence-backed fit | Conditions and gaps to resolve |
|---|---|---|
| libvips | Demand-driven pipeline and thumbnail operation can use decoder shrink-on-load; has orientation, crop, linear, profile, intent, and failure controls. Latest release independently observed: 8.18.7, commit 24ad4d0. | Public API page reviewed is 8.17. Progressive JPEG can increase memory sharply; default frame is first; path-specific errors and CMM/output must be tested on the selected build. Issue #5195 was fixed in a PR merged to master on Oct 2, after the 8.18.7 release on Sep 26; package inclusion is not established here. Test file/buffer/source calls before relying on fail_on. [LIBVIPS-THUMBNAIL-817](sources/index.md#libvips-thumbnail-817), [LIBVIPS-RELEASE-8187](sources/index.md#libvips-release-8187), [LIBVIPS-ISSUE-5195-RECHECK-20261012](sources/index.md#libvips-issue-5195-recheck-20261012), [LIBVIPS-PR-5235](sources/index.md#libvips-pr-5235) |
| Pillow | Clear EXIF transpose and fit/contain/crop APIs; ImageCms exposes ICC transform and intent controls; security guidance describes decompression-bomb and process-isolation concerns. | Pin Pillow and all compiled codec/CMM libraries, check pixel limits, and define mode/profile fallback. Python-level convenience does not itself provide the process boundary. [PILLOW-IMAGEOPS-123](sources/index.md#pillow-imageops-123), [PILLOW-IMAGECMS-123](sources/index.md#pillow-imagecms-123), [PILLOW-SECURITY-123](sources/index.md#pillow-security-123) |
| ImageMagick | Broad operator and format support; explicit pixel-cache resource and security-policy controls; ICC profile and resize settings. | The profile operation is ordered and filter settings affect resize. Memory/map limits can spill to disk; cap disk and dimensions as well. Configuration policy and delegate builds must be pinned. [IMAGEMAGICK-OPTIONS](sources/index.md#imagemagick-options), [IMAGEMAGICK-SECURITY](sources/index.md#imagemagick-security) |
| Rust image crate | Rust-native decoder and metadata interfaces; orientation operations; strict width/height limit support where a decoder declares it. | The 0.25.10 allocation cap is non-strict for some decoders; trait metadata access is decoder-dependent. A complete CMM/output profile policy and per-format capability evidence are separate requirements. [RUST-IMAGE-02510](sources/index.md#rust-image-02510), [RUST-IMAGE-DECODER-02510](sources/index.md#rust-image-decoder-02510), [RUST-IMAGE-ORIENTATION-02510](sources/index.md#rust-image-orientation-02510) |

Select only after the owner fixes accepted formats, quality targets, privacy policy, deployment constraints, and resource budgets. Compare exact released builds and transitive codec/CMM versions, not library names alone.

## Proposed validation matrix — not run

| Area | Proposed check | Observation required |
|---|---|---|
| Orientation and geometry | Generated corner-labeled fixtures for all eight EXIF orientations, no tag, malformed tag, TIFF/JPEG variants, plus AVIF transforms if supported. Test both explicit orientation-before-resize and backend shrink-then-orient paths. | Correct visible corners, dimensions, crop mapping, no double transform, and no active output orientation instruction. |
| Color signals and profiles | sRGB, Display P3/wide gamut, supported CMYK/LAB, absent/duplicate/malformed/mode-incompatible profiles, PNG conflicts among cICP/iCCP/sRGB/cHRM/gAMA, and WebP without ICCP. | Correct precedence and recorded fallback/failure; target profile/signal and intent match policy; unsupported input is visible. |
| Scaling and alpha | Transparent saturated borders, half-alpha gradients, hidden RGB at alpha zero, several reduction factors, and alpha-to-JPEG against the fixed background. Compare encoded-space optimized and linear-light reference paths. | No unacceptable fringe/halo; alpha remains independent; compare color/detail, not only dimensions; record chosen filter/rounding. |
| Decode errors | Truncated/corrupt JPEG through every selected file/buffer/source API; broken metadata/profile; partial containers, duplicate/unknown chunks, and trailing bytes. | No partial or guessed derivative is published, errors are deterministic, and temporary outputs are removed. |
| Resource bounds | Huge declared dimensions, arithmetic overflow, high bit depth/channel count, large metadata, progressive JPEG, many frames/pages, and decompression-bomb inputs. | Rejection or bounded worker failure before unsafe growth; actual memory, CPU, disk, and concurrency stay inside policy. |
| Privacy and format output | Audit PNG chunks, WebP RIFF chunks/frames, JPEG metadata/application segments and embedded thumbnails, and AVIF item/property/auxiliary relationships using independent parsers. Include internal-review allowlist checks. | Disallowed fields are absent in the tested format/build matrix; required target profile/alpha and owner-approved internal technical fields remain. State limits of the audit. |
| Cancellation and mixed batches | Cancel before scheduling, during decode, during encode, before publication, and just after publication in a batch mixing supported/unsupported inputs. | Completed derivatives remain, partial files disappear, every item status is correct, and manifest/UI report partial completion. |
| Visual review | Paired comparison on known-profile/calibrated displays against originals and a declared reference, plus image-space color/edge metrics. | Reviewer-visible rotation, color, edge, and detail changes meet an owner-defined threshold; equal size is not treated as fidelity proof. |

Separately propose fuzzing and malicious-input tests, process-sandbox checks, crash/restart cleanup, and production integration. They are not represented as executed.

## Owner decisions still required

1. Supported input and output formats, including RAW, TIFF, WebP, AVIF, animation, multipage, and MPO/MPF.
2. Per-format frame/page policy, untagged/invalid/unsupported color-profile behavior, accepted color spaces, working space, output profiles, CMM, intent, black-point and gamut policy.
3. Thumbnail/review sizes, aspect/crop behavior, crop-coordinate convention, upscaling, rounding, filters, precision, encoder settings, and whether a slower reference path is required.
4. Alpha support and the exact background for formats that cannot retain alpha.
5. Public export allowlist; technical fields required inside internal review copies; whether any provenance belongs in image metadata or only in a sidecar.
6. Compressed-size, dimensions, pixels, frames, process memory, CPU/time, disk, thread, concurrency, metadata, and output-size caps.
7. Whether cancellation preserves published per-image successes or rolls back a batch; the proposed default is to keep verified successes and report partial state.
8. The regeneration promise: recipe replay under a pinned toolchain, or demonstrated byte-identical output.

## Validation status

**Executed:** reading the assigned research artifacts and independent review of primary format, color, implementation, release, and issue documentation.

**Proposed, not run:** every fixture, decoder/encoder check, resource test, metadata audit, cancellation test, perceptual review, malicious-input test, and production integration check listed above. No image-processing observation is claimed.
