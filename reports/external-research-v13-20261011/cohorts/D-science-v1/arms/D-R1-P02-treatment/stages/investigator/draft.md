# D-P02 — Investigator draft for independent review

## Recommendation

Revise the provisional order and replace the preset-only cache identity and identifying-tag denylist. Keep the parts that publish each completed derivative independently and remove incomplete temporary outputs on cancellation. Add explicit versioned color, orientation, alpha, metadata, memory, failure and batch-manifest rules.

The component should decode locally from read-only originals, create fresh derivative files, and record a reproducible recipe plus dependency versions. Define the accepted formats and privacy coverage before claiming support. This is a component design proposal; no image service was deployed and no image fixture was executed.

## Exact per-clause disposition

### Plan paragraph 1: inspect, normalize, resize, orient, export, alpha

**P1.a — “reads orientation and embedded profiles during inspection, decodes to one internal pixel format, resizes, applies orientation, and exports a review copy in a standard display color space.”**

**Disposition: correct the order; retain the intent with a more complete representation contract.** Reading metadata before decode is useful, but the loader may itself apply EXIF or container orientation. Record whether it has done so and make exactly one stage own normalization. Apply the orientation transform to pixels before calculating final dimensions, crop coordinates or target fit; resizing first can select the wrong geometry for orientations that swap width and height. Clear/reset the active orientation instruction after baking it into pixels. This includes container transforms such as AVIF rotation/mirror properties as well as EXIF; applying both would rotate or mirror twice. Pillow’s documented EXIF helper applies and removes the EXIF orientation, while the Rust metadata API warns that retaining an applied orientation causes a later second transform. Historical Pillow TIFF/CR2 and libvips API-combination reports reinforce the need to test loader-specific behavior. [PILLOW-IMAGEOPS-123](https://pillow.readthedocs.io/en/stable/reference/ImageOps.html), [RUST-IMAGE-ORIENTATION-02510](https://docs.rs/image/0.25.10/image/metadata/enum.Orientation.html), [PILLOW-ORIENTATION-HISTORY](https://github.com/python-pillow/Pillow/issues/8554), [LIBVIPS-ISSUE-1523](https://github.com/libvips/libvips/issues/1523)

“One internal pixel format” is underspecified: fix sample type/precision, channel ordering, color space and alpha association. For the reference-quality path, use a defined linear-light working space with an explicit source-profile transform; orient pixels; premultiply color by alpha; resize color and alpha; unpremultiply with a deterministic zero-alpha rule; transform/gamut-map to the selected output profile; then quantize and encode. Geometric orientation commutes with color transform in principle, but resize, crop, gamma and alpha do not. A high-throughput decoder may shrink during load before the full pipeline runs; compare its results against the reference path and record which path produced each derivative. libvips exposes a linear option and its thumbnail operation premultiplies, but the optimized path and current API/version must be tested. [LIBVIPS-THUMBNAIL-817](https://www.libvips.org/API/8.17/ctor.Image.thumbnail.html), [LIBVIPS-CHECKLIST](https://www.libvips.org/API/current/developer-checklist.html)

A “standard display color space” needs a named profile and an owner decision. sRGB is a useful compatibility baseline, but wide-gamut reviewers may require a second review profile or a managed viewer. Read and validate the source profile before conversion, select the CMM, output profile and rendering intent explicitly, and embed a known output profile or equivalent signaling. Do not silently treat an invalid/unsupported embedded profile as sRGB. Untagged input policy is format-specific: PNG without understood signaling is device-dependent, while WebP says sRGB should be assumed when ICCP is absent. For PNG, supported color-signal precedence is cICP, iCCP, sRGB, then cHRM/gAMA. [STD-PNG3](https://www.w3.org/TR/png-3/), [FORMAT-WEBP-RIFF](https://developers.google.com/speed/webp/docs/riff_container), [STD-ICC-2022](https://www.color.org/icc-1_specification/), [PILLOW-IMAGECMS-123](https://pillow.readthedocs.io/en/stable/reference/ImageCms.html)

**P1.b — “preserve alpha where the target format supports it and flatten against a configurable background otherwise.”**

**Disposition: keep, with a precise color/alpha rule.** Alpha represents coverage, not an RGB color channel; do not apply an RGB transfer curve or ICC transform to alpha. Filter premultiplied linear color and alpha together to avoid colored fringes from transparent pixels. For an alpha-capable output, retain alpha if the chosen target and reviewer workflow support it. For a format without alpha, composite against a named background in the target color space before encoding. The background is a versioned preset parameter, not an unrecorded runtime default. [STD-PNG3](https://www.w3.org/TR/png-3/), [LIBVIPS-CHECKLIST](https://www.libvips.org/API/current/developer-checklist.html)

**P1.c — “Research whether that operation order and representation preserve the visual behavior the brief needs, particularly with profile conversion and partially transparent edges.”**

**Disposition: answer is no for the proposed resize-then-orient sequence and incomplete for an unspecified working format.** Use one orientation pass before size/crop decisions; explicit source and target color spaces; a declared alpha model and resampling space. Whether the fast shrink-on-load path satisfies the same visual contract is uncertain until measured. Keep geometry equality separate from color/detail fidelity; assess paired images with perceptual review as well as image-space metrics.

### Plan paragraph 2: derivative identity and regeneration

**P2.a — “Derivative identity would include the original digest and a preset name.”**

**Disposition: extend the identity.** Source digest plus a mutable preset label cannot identify all pixel-affecting settings. Store a canonical recipe version/hash covering dimensions, fit/crop/upscale rules, orientation behavior, filter, alpha/background rule, source-profile fallback, target profile hash, rendering intent, CMM and encoder settings. Store decoder, format plug-in/transitive codec and CMM versions/build identifiers too. Keep a separate output digest for integrity.

**P2.b — “Updating a preset would invalidate old thumbnails.”**

**Disposition: retain with immutable preset revisions.** A cache key can include source digest plus canonical recipe hash and relevant decoder/CMM/encoder build identity. An edited preset receives a new identity, making old results visibly stale without modifying the source or silently reusing old pixels.

**P2.c — “The draft assumes decoder upgrades do not require additional provenance because the original is unchanged.”**

**Disposition: reject.** Unchanged source bytes do not imply unchanged decoded pixels: orientation, color conversion, codec behavior, error handling, scaling shortcuts and encoder output can change by version. The libvips orientation and truncated-buffer reports and Pillow’s TIFF orientation fix are concrete examples of version/path-sensitive behavior. [LIBVIPS-ISSUE-1523](https://github.com/libvips/libvips/issues/1523), [LIBVIPS-ISSUE-5195](https://github.com/libvips/libvips/issues/5195), [PILLOW-ORIENTATION-HISTORY](https://github.com/python-pillow/Pillow/issues/8554)

**P2.d — “Examine reproducibility, parameter capture, and version-sensitive behavior before accepting that simplification.”**

**Disposition: satisfy with two explicit promises.** Promise that the recorded recipe and pinned environment are sufficient to attempt regeneration; do not promise byte-identical output across changed decoder, CMM or encoder builds unless that property is separately demonstrated. Record source hash, original format, dimensions, orientation value and whether/how it was applied, input profile identity/hash or untagged/invalid status, all transform/filter/crop/output settings, dependency versions, target profile hash, output hash, timestamps and any failure/retry status. Keep this manifest local/private and outside public derivatives. If exact replay is required, retain the approved toolchain/container or an immutable build identifier as an owner decision.

### Plan paragraph 3: privacy and metadata

**P3.a — “Export would remove a list of identifying metadata tags and retain dimensions and a color profile.”**

**Disposition: replace the denylist with output construction from an allowlist.** Tag deletion is fragile when tags are duplicated across namespaces, nested, unknown to the tool, or carried in an auxiliary image/container. Dimensions are normally encoded by the derivative itself; do not copy source dimensions or stale geometry as metadata. Preserve only the target profile required to interpret output pixels, preferably a known standard profile, not arbitrary source ICC bytes. The original profile is used for conversion and its hash can live in private provenance. ICC profiles can themselves carry identifying information, while deleting color-space information can change appearance. [PILLOW-SECURITY-123](https://pillow.readthedocs.io/en/stable/handbook/security.html), [EXIFTOOL-FAQ](https://exiftool.org/faq.html)

**P3.b — “Internal review would use a more permissive policy.”**

**Disposition: accept separate policies, but make each an explicit allowlist.** “More permissive” must not mean pass through all source metadata. Define each retained technical field and its purpose; prefer the private sidecar manifest for decoder/profile/orientation facts instead of embedding them into the image. Treat date, camera model, serial, lens, GPS, MakerNotes, copyright, AI/provenance assertions and embedded thumbnails as separate owner-reviewed data classes. The current Exif standard is CIPA DC-008-Translation-2026, Exif 3.1; pin the downloaded standard used by implementation. [STD-CIPA-EXIF31](https://www.cipa.jp/e/std/std-sec.html)

**P3.c — “Compare explicit allowlists, re-encoding, and other metadata-handling approaches using actual format mechanisms, including less obvious containers or auxiliary payloads.”**

**Disposition: use a format-aware writer that starts from normalized pixels and constructs a fresh output container; compare it with in-place tag deletion and generic re-encoding.** In-place deletion may preserve the compressed image but depends on parser/writer coverage and can delete a needed profile. Re-encoding may change pixels/quality and does not by itself prove metadata removal if the writer copies metadata. Fresh output construction is the recommended public-export path: include only image data, required alpha, output color signaling, and explicitly allowed metadata; audit the exact bytes/chunks/items emitted.

- **PNG:** color signaling includes cICP/iCCP/sRGB/cHRM/gAMA; ancillary text, time and Exif chunks can carry unwanted information. Write one consistent target color signal, required alpha, and no source text/Exif/unknown chunks unless allowed. [STD-PNG3](https://www.w3.org/TR/png-3/)
- **WebP:** extended RIFF can contain ICCP, EXIF, XMP, alpha, animation frames and unknown chunks; extra EXIF/XMP instances may be ignored by readers and trailing data may be ignored. Rebuild RIFF and verify all chunks, frame policy and file termination. [FORMAT-WEBP-RIFF](https://developers.google.com/speed/webp/docs/riff_container)
- **AVIF:** the ISO-BMFF item graph can link metadata to image items and can carry auxiliary alpha/depth, hidden gain-map/tone-map images, crop, rotation/mirror and color properties. If AVIF is supported, normalize the primary image and deliberately retain or drop each linked item/reference; do not just delete a flat tag list. [FORMAT-AVIF-1_2_0](https://aomediacodec.github.io/av1-avif/v1.2.0.html)
- **JPEG/Exif and MPF:** Exif can contain nested camera-specific records and an embedded thumbnail; EXIF, ICC, XMP and other blocks may coexist, and GPS may appear outside EXIF. Multi-Picture Format can represent more than one image. The current CIPA MPF listing has a 2026 header but a detailed 2025 date/history; pin the actual current standard copy before accepting MPO/MPF inputs. [STD-CIPA-EXIF31](https://www.cipa.jp/e/std/std-sec.html), [STD-CIPA-MPF](https://www.cipa.jp/e/std/std-sec.html), [EXIFTOOL-FAQ](https://exiftool.org/faq.html)

**P3.d — “No claim of privacy completeness should rest on one successful sample.”**

**Disposition: accept and define bounded claims.** State which formats, parser/builds, metadata namespaces, auxiliary items, trailing data and independent audit tools were checked. Report “no disallowed fields found in this tested format/build matrix,” not “all identifying information removed.” Filenames, directory names, filesystem timestamps and information visible in the pixels are outside embedded metadata and need separate handling.

### Plan paragraph 4: limits, atomic outputs and cancellation

**P4.a — “Workers would reject inputs beyond a pixel-count limit, write outputs to temporary paths, and publish each successful image independently.”**

**Disposition: keep independent publication; strengthen the limit model.** Pixel count alone misses channel count, bit depth, decoder scratch memory, multiple intermediate rasters, profile transforms, frame/page counts, metadata parsing and progressive formats. Check compressed bytes and headers before full decode; use checked arithmetic for width × height × channels × bytes/sample and a conservative peak-memory estimate; cap dimensions and frames/pages; enforce process memory, CPU/time, disk and concurrency limits. A progressive JPEG can defeat streaming and require much more memory. ImageMagick memory/area limits can spill pixel data to disk, so disk and dimensions also need caps. Rust image’s max width/height are strict, but max_alloc is non-strict and decoder-dependent. [PILLOW-SECURITY-123](https://pillow.readthedocs.io/en/stable/handbook/security.html), [LIBVIPS-CHECKLIST](https://www.libvips.org/API/current/developer-checklist.html), [IMAGEMAGICK-OPTIONS](https://imagemagick.org/command-line-options/), [RUST-IMAGE-02510](https://docs.rs/image/latest/image/struct.Limits.html)

Keep original inputs read-only. Write to a unique temporary file on the destination filesystem, finish encoding, verify the output can be reopened and matches policy, then atomically publish it. Any decode/profile/limit/encode error must fail the item and remove its incomplete temporary output. libvips issue #5195 is a particularly direct warning: file thumbnail refused a truncated JPEG with fail_on=error, but buffer/source paths accepted it on the reported versions. Test the exact API path or reject it; never accept the operation’s declared setting as proof. [LIBVIPS-ISSUE-5195](https://github.com/libvips/libvips/issues/5195)

**P4.b — “Cancellation would retain completed derivatives and delete incomplete ones.”**

**Disposition: keep.** Define the publication point as the atomic rename after successful output verification. Cancellation before that point deletes the temporary output; cancellation after it retains the completed derivative. Stop scheduling pending items, signal or terminate in-flight jobs within a bound, and record which item completed, failed or was cancelled. This avoids an ambiguous half-written file.

**P4.c — “Recommend dispositions for these rules, including memory accounting, failure reporting, and whether users need batch-level completeness information.”**

**Disposition: require a batch manifest and user-visible summary.** Each item should finish as success, unsupported, corrupt/truncated, invalid/unsupported profile, resource-limited, encode/write failure, cancelled-before-start or cancelled-in-flight. Show filename and concise reason, with retry/remediation where useful. The batch manifest should include item counts and statuses, completed output paths/hashes, policy version and a batch-complete flag. Keep already-published successful outputs when cancellation occurs; state whether a batch with failures is partial. This is an owner-visible policy, not a silent default.

**P4.d — “Propose checks for orientation variants, profile/alpha interactions, corrupt metadata, huge dimensions, export-policy differences, and cancellation.”**

**Disposition: expand the proposed matrix below.** Preserve the distinction between proposed checks and observations actually made.

## Candidate approach comparison; no winner selected

| Approach | Useful evidence | Material limits for this component |
|---|---|---|
| libvips | Demand-driven pipelines; file thumbnail can use loader shrink-on-load, block shrink and Lanczos3; profile, linear, crop and orientation controls. Current release observed at v8.18.7. | Public API docs inspected are 8.17; progressive JPEG may require full memory; file/buffer/source error semantics differ in an open report. Verify current exact version, frame handling and CMM path. [LIBVIPS-THUMBNAIL-817](https://www.libvips.org/API/8.17/ctor.Image.thumbnail.html), [LIBVIPS-RELEASE-8187](https://github.com/libvips/libvips/releases/tag/v8.18.7) |
| Pillow | Clear Python API for EXIF transpose, fit/contain/crop and ICC transform; security guidance is unusually explicit. | Pixel-bomb thresholds are configurable and build-dependent; treat warnings as errors and sandbox. ImageCms defaults to perceptual intent, so specify intent/modes and pin LittleCMS. [PILLOW-IMAGEOPS-123](https://pillow.readthedocs.io/en/stable/reference/ImageOps.html), [PILLOW-SECURITY-123](https://pillow.readthedocs.io/en/stable/handbook/security.html) |
| ImageMagick | Broad operator and format support; coder/path policy and memory/map/disk/area/time controls. | Memory/area caps may spill to disk rather than fail; configure disk, dimensions, formats and timeout. Profile operator ordering and resize filter affect output. [IMAGEMAGICK-OPTIONS](https://imagemagick.org/command-line-options/), [IMAGEMAGICK-SECURITY](https://imagemagick.org/security-policy/) |
| Rust image crate | Native Rust decoders, orientation/metadata access, strict width/height limit surface. | Allocation cap is best-effort for some decoders; the base crate does not define a full ICC workflow. Verify codec-specific limits and add a CMM. [RUST-IMAGE-02510](https://docs.rs/image/latest/image/struct.Limits.html) |

These are maintained implementation options and different architectural tradeoffs, not a library recommendation. A later selection should compare the exact formats required, versioned output quality, CMM behavior, memory/error semantics, license/deployment and integration costs.

## Recommended pipeline and user behavior

1. Keep the source read-only and local. Hash it before work; identify the format from the bytes, not the extension. Apply allowlisted formats and compressed-size/header/parser limits before decode. For unsupported or ambiguous structure, fail visibly rather than guessing.
2. Read orientation and color signaling, while recording whether the decoder auto-applies either transform. Reject invalid profiles/orientation or apply an explicit owner-approved fallback; never silently substitute an sRGB interpretation for an invalid embedded profile. For untagged formats, use only the format-specific documented rule.
3. Decode to a declared internal representation. Normalize orientation exactly once before computing output geometry. Keep the EXIF orientation and AVIF rotation/mirror properties from being re-applied after pixels are normalized.
4. Convert source color to the selected linear working space with a named CMM, explicit intent and profile compatibility checks. Keep alpha as coverage. Premultiply before filtering; resize with fixed filter/rounding/crop rules; unpremultiply; gamut-map/convert to the named output profile; composite against the named target-space background only when alpha is unsupported.
5. Encode a fresh file with only required output color/alpha signals and allowed metadata. Reopen/verify it, then atomically publish. Never pass through the source container wholesale.
6. Persist a private versioned provenance manifest. Report unsupported inputs, invalid profiles, corrupt/truncated data, resource caps and cancellation in plain terms. A sample message: “No review copy was created: this file is incomplete. The original was left unchanged.” For batch output show successes and failures and whether the batch is partial.

## Corrections, optional improvements and owner decisions

**Required corrections:** apply orientation once before resize/crop geometry; specify color space and alpha representation; replace mutable preset-only identity with canonical recipe/dependency identity; replace metadata denylist with allowlisted fresh output; replace pixel-count-only admission with memory/time/disk/frame accounting; test truncation behavior on the exact decoder API path.

**Optional improvements:** keep a private provenance sidecar; verify each output by reopening; use deterministic output filenames based on source and recipe hashes; offer separate fast thumbnail and reference-quality review presets; retain multiple output profiles only if reviewers need them; expose batch retry without redoing successful items.

**Owner decisions still open:** accepted formats and whether RAW, TIFF, WebP, AVIF, MPO/MPF, animation and multipage inputs are supported; per-format untagged/invalid-profile policy; working and output profile(s), intent and whether to offer wide-gamut review; exact thumbnail/review dimensions, crop/upscale and quality defaults; alpha and background policy; public/internal metadata allowlists; maximum compressed bytes/dimensions/pixels/memory/CPU/time/disk/concurrency; batch rollback versus keep-success semantics; recipe replay versus bitwise reproducibility promise.

## Validation matrix

All entries below are **proposals, not executed checks**.

| Area | Proposed fixture/check | What it should establish |
|---|---|---|
| Orientation | Generated color-corner fixture for all eight EXIF orientations; no tag; invalid tag; JPEG/TIFF variants; AVIF irot/imir properties | Correct displayed corners and dimensions, one transform only, inactive/removed output transform metadata |
| Color | sRGB, Display P3 or other wide gamut, CMYK/LAB where supported, untagged RGB, absent/duplicate/invalid/mode-incompatible profiles; PNG conflicting cICP/iCCP/sRGB/gAMA | Correct format precedence, explicit error/fallback, target profile signaling, no unsupported intent silently accepted |
| Alpha/resizing | Transparent saturated edge, half-alpha gradients, hidden RGB under alpha zero, repeated reduction and JPEG flatten over named background | No colored fringe/black halo; alpha unchanged as coverage; background and color-space order match policy |
| Error behavior | Truncated/corrupt JPEG via file, buffer and source APIs; corrupt metadata; partial container, unknown chunks, trailing data | Each broken input is rejected; no plausible partial derivative or published temp file |
| Resource bounds | Huge declared dimensions, multiplication overflow, high-bit-depth/multichannel, progressive JPEG, many frames/pages, large metadata blocks, decompression bomb | Rejection before unsafe allocation or bounded sandbox failure; peak memory/time/disk and concurrency remain inside policy |
| Privacy/format | Fresh-output audit for PNG chunks, WebP RIFF including unknown/duplicate chunks, JPEG Exif/XMP/ICC/MPF and embedded thumbnail, AVIF metadata links/auxiliaries | No disallowed metadata or auxiliary payload remains in tested version; target color/alpha data remains; describe only tested coverage |
| Cancellation/batches | Cancel before start, during decode, during encode, just before and after atomic publish; mixed supported/unsupported batch | Completed derivatives remain, incomplete outputs disappear, final manifest matches actual files and states partial completion |
| Visual review | Paired review on calibrated/known-profile displays against originals and declared reference outputs; objective color/edge metrics | Reviewer-visible color/detail changes are understood; equal dimensions alone is not accepted as fidelity evidence |

**Checks actually executed:** web research and artifact-structure checks only. No image fixture, decoder, converter, malicious-input test, perceptual review or production integration test was run. A metadata scanner such as ExifTool with duplicate/group reporting can aid a proposed audit, but a clean scan from one tool is not a privacy-completeness proof. Production sandbox, cleanup/restart and batch integration remain separate proposed work.
