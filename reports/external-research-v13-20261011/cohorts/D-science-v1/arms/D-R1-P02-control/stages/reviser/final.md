# Image derivative component plan — D-P02

**Stage:** reviser, run D-R1-P02-control  
**Status:** research-backed component plan; no implementation or library selection.  
**Basis:** complete released brief, all five exact clauses of the released provisional plan, investigator research, and independent critique.  
**Executed product checks:** none. Fixture, perceptual, security, filesystem and integration work below is proposed.

## Recommendation

Build the component around an explicit, versioned per-output-role policy. Keep submitted source bytes immutable and local. Inspect conservatively, decode under multiple resource ceilings, resolve orientation once, color-manage into a declared working/output space, resize with a documented alpha policy, apply a role-specific metadata allowlist, validate the encoded result, and publish only a complete derivative. Every item receives an auditable terminal state and provenance sufficient to explain or attempt regeneration after policy, decoder, codec, transform or encoder changes.

This plan does not choose Sharp/libvips, Pillow or ImageMagick. Defaults and decoder paths differ, and history shows behavior can depend on format, compression, release and operation order. Select only after owners set the supported format/build matrix and proposed representative tests pass on pinned versions.

## Proposed component contract

### Intake, inspection and immutable originals

- Keep contributor bytes local; do not upload. Hash the source and never write a derivative to a path that aliases or mutates it.
- Inspect headers before full pixel decoding where supported. Record format, decoder/build capability, raw dimensions, orientation signals and their locations, page/frame count, alpha/transparency, bit depth, color model, ICC presence/identity and parse warnings.
- Treat header values as untrusted hints. Use overflow-safe dimension/frame arithmetic and reject before allocation where possible. Header inspection does not prove safe decode or orientation-normalized visible dimensions.
- Mark unsupported codecs, malformed metadata, conflicting orientation/profile signals and policy rejections as explicit item outcomes. Never return a plausible-looking fallback.

### Geometry, orientation, color and alpha

- Resolve orientation exactly once before crop/fit and target-dimension decisions. Emit physically oriented pixels and clear/reset the corresponding orientation signal. A decoder or thumbnail helper may already apply orientation; count it as the one operation only after verifying the pinned path. Test all eight EXIF/TIFF values including mirrors, XMP conflicts, and decoder-applied TIFF orientation. A right-angle transform and an uncropped isotropic resize can sometimes commute if dimensions are consistently swapped; crop/fit, nonsquare bounds, decode-time scaling or already-oriented pixels make that unsafe as a general rule.
- Name the working channel layout, precision, bit depth, alpha association and color space. Avoid early 8-bit sRGB reduction when source may be wide-gamut, high-bit-depth or CMYK. Keep adequate precision and gamut through the output transform.
- Preserve the profile that describes current pixel values until its transform is complete. Choose a target profile and rendering intent per derivative role; define behavior for absent, malformed, unsupported or conflicting profiles. An untagged-RGB assumption such as sRGB is an owner decision, not an inference. Transform before attaching a target profile; stripping unrelated metadata and attaching a profile without transforming pixels would relabel values. Keep the encoded output profile matching transformed pixels, subject to role policy.
- Preserve alpha for roles/formats that support it. For spatial filtering, specify a premultiplied-alpha contract: convert color into the declared working space, premultiply by alpha, filter premultiplied color and alpha with the selected kernel, then unpremultiply where alpha is nonzero. Define a canonical color for fully transparent output pixels. Verify candidate library equivalence: PNG does not prescribe a resize filter, and the reviewed CSS Color document is a Working Draft about color interpolation, not image-resize conformance [REV-W3C-PNG-01](sources/index.md#rev-w3c-png-01), [REV-W3C-CSS-COLOR-5-01](sources/index.md#rev-w3c-css-color-5-01).
- Make dimensions, contain/cover/crop, focal point if needed, upscale policy, filter, output precision/format, encoder quality and JPEG chroma explicit by role. Compare profile-aware versus linear-light scaling where review fidelity warrants it. Decode-time downsampling may reduce work when supported; full decode then resize is simpler but can cost more memory.
- Flatten only roles requiring an opaque format, against a declared background in the appropriate output space. Do not infer fidelity from equal dimensions or successful encoding. Display calibration prevents a promise of identical appearance on every screen.

### Metadata, privacy and encoded output

- Replace export tag denylist with separate external-export and internal-review allowlists. Define supported formats first; for each format inventory metadata/container structures, unknown-data behavior and output verifier. Do not claim complete sanitization for unselected or unparsed formats.
- For JPEG, inspect APPn segments and comments by identifier rather than using a generic metadata switch. ITU-T T.86 V2 lists EXIF, XMP, ICC_PROFILE, thumbnails/previews, MPF, Photoshop IRB/IPTC, comments and application-specific records. It says T.81 recommends but does not require removal across application domains, discourages removal within its domain, and says unknown markers should be skipped/preserved when updating. Classify fields individually: remove identifying content, retain approved target ICC matching transformed pixels, and decide explicitly on previews, auxiliary records and unknown segments. Do not blindly remove every APPn marker [REV-ITU-T86-01](sources/index.md#rev-itu-t86-01).
- For PNG, inspect eXIf, text, color-space and other ancillary chunks. The Third Edition notes eXIf can describe historical source data and conflict with other PNG chunks; it also calls out recoverable data under alpha masks or altered dimensions. Preserve only owner-approved color signaling and technical fields. Do not assume a visual crop, transparent fill or one successful sample erased hidden data [REV-W3C-PNG-01](sources/index.md#rev-w3c-png-01).
- For both roles inventory EXIF including maker notes/GPS/personal fields, XMP, IPTC, comments, embedded previews/thumbnails, format-specific auxiliary records, profile chunks, text and sidecars if handled. Unknown or unparsed content must follow an explicit fail, strip or review path.
- Re-encode decoded pixels into a new derivative, then inspect encoded bytes against the role allowlist. Re-encoding can discard metadata but is not proof of sanitization by itself; writers can preserve/add fields and formats differ. Never overwrite originals or claim deleting one field removes all identifying information.

### Resource, publication, batch and cancellation behavior

- Set product ceilings for pixels, dimensions, pages/frames, memory, CPU/time, temporary/final disk, output bytes and concurrency. Isolate worker processing where available; budget exhaustion gives a predictable failure state. Check pinned builds instead of adopting library defaults: Sharp's pixel guard trusts header dimensions; Pillow's bomb threshold is configurable and can warn before error; ImageMagick has host-adjusted limits and may spill memory/map work to disk.
- Write each item to a unique staging path. Publish only after decode, transform, encode, reopen/structural checks and role-specific metadata checks succeed. Atomic rename depends on actual destination and staging filesystem. Use verified same-filesystem rename semantics, otherwise a commit-marker/state protocol so partial copy is never reported complete. POSIX.1-2024 specifies atomic rename for conforming implementations, but this component's filesystem behavior is untested [REV-POSIX-RENAME-01](sources/index.md#rev-posix-rename-01).
- Retain completed derivatives on cancellation; remove incomplete staging. Stop queued work. Owner chooses whether in-flight work finishes or is interrupted; if interrupted, record cancellation and ensure no incomplete final output exists.
- Give each item a stable ID and states such as queued, inspecting, processing, succeeded, unsupported, failed, canceled-before-start and canceled-in-flight. Each terminal state has a readable reason, next step/retry guidance where useful, and whether output was published.
- Report success and non-success counts and identify each unsupported, failed or canceled item. Partial success is not unqualified completion. Define retry idempotency, replacement behavior and partial-output retention.

### Provenance and regeneration

Store source SHA-256; observed source format/dimensions/frame facts; derivative role; canonical settings snapshot or policy hash/version; resolved size/fit/crop/filter/upscale/alpha/flatten values; orientation source/decision; source/target profile identity or hash and transform intent; decoder, native codec, color engine and encoder versions/build features; output format/options/dimensions/SHA-256; and terminal status/failure code. Do not copy contributor identity into provenance without separate approval.

Keep input digest and human-readable preset as useful lookup fields, but neither alone identifies output. A changed preset, decoder, codec, color engine, encoder, build feature or operation ordering can change output with unchanged source bytes. A version change creates a new derivative identity; retain prior records/settings if historical regeneration is required and never silently replace another role's result. Provenance supports an explainable attempt, not a byte-identity promise across versions, architectures or nondeterministic codecs. Owner decides whether “reproduce” means perceptual similarity or byte equality.

## Candidate approaches — no winner selected

| Candidate | Evidence-supported fit | Conditions and risks |
|---|---|---|
| **Sharp through libvips, or direct libvips binding** | Sharp exposes header inspection, orientation operations, resize, ICC output and pixel limit; direct libvips need not make Node a product requirement. | Header dimensions are raw and ignore EXIF orientation; default pixel guard trusts them. Default output converts to sRGB and strips metadata/ICC; keeping all metadata can retain identifiers. Codec support depends on build. Pin Sharp/libvips/codecs; test operation order, TIFF and XMP behavior. |
| **Pillow** | Python APIs expose EXIF transpose, ImageCms profile transforms, resize primitives and a decompression-bomb warning/error path. | Promote warning to a product failure threshold. Profile/mode support, alpha behavior, output metadata and native codecs require policy/build testing. History includes EXIF representation and TIFF YCbCr orientation changes. |
| **ImageMagick** | CLI/library offers auto-orient, ICC operations, metadata stripping and memory/map/disk/area/time/thread/file controls. | Defaults are host-adjusted, order matters, and strip removes profiles/color signaling as well as descriptive metadata. TIFF/JPEG issue #7147 is conditional history only; test current pinned builds with both compression paths. |

Predecessor research observed Sharp v0.35.5 and linked sharp-libvips, Pillow 12.3.0, and ImageMagick 7.1.2-33. These are comparison anchors, not deployment recommendations or proof of installed builds. Choose using host/language fit, required format/build matrix, orientation/color/alpha/metadata controls, resource behavior, maintainability, licensing/packaging, performance under ceilings and regression-testability. CIPA lists Exif 3.1 as current, but the full text was not downloaded; tag-level behavior needs the complete standard [SRC-EXIF-01](sources/index.md#src-exif-01).

## Exact released plan clauses and dispositions

### C1 — Operation order, representation, color, alpha

> The draft reads orientation and embedded profiles during inspection, decodes to one internal pixel format, resizes, applies orientation, and exports a review copy in a standard display color space. It would preserve alpha where the target format supports it and flatten against a configurable background otherwise. Research whether that operation order and representation preserve the visual behavior the brief needs, particularly with profile conversion and partially transparent edges.

**Disposition: revise general order; retain the goals with explicit policy.** Apply orientation once before crop/fit and target sizing, while allowing a verified decoder path to fold it into decode. Define working layout, precision, alpha association and color space instead of promising an unspecified single format. Preserve sufficient precision/gamut through transform. Choose role-specific target profile/intent and explicit absent/bad/conflicting profile behavior. Specify alpha-aware filtering, output alpha/flatten roles and backgrounds. Name dimensions, fit/crop, upscale, filter, bit depth, format and encoder settings. Compare profile-aware and linear-light scaling when justified; libvips #4343 is one non-public Apple profile input on 8.16.0 with unknown generality/resolution, not a universal defect or fix. Owners choose role formats/sizes, crop/upscale/filter, profile/intent, alpha/background, profile fallback and EXIF/XMP conflict policy.

A simple uncropped isotropic resize may commute with a right-angle orientation if dimensions are swapped consistently. This does not validate resize-then-orient for crop/fit, nonsquare bounds, decode-time scaling or decoders that already applied orientation. PNG confirms unassociated alpha but not a resize algorithm. Premultiplication is a component recommendation to prevent hidden color from transparent samples influencing filtered edges; confirm library equivalence in tests.

### C2 — Derivative identity, preset and reproducibility

> Derivative identity would include the original digest and a preset name. Updating a preset would invalidate old thumbnails. The draft assumes decoder upgrades do not require additional provenance because the original is unchanged. Examine reproducibility, parameter capture, and version-sensitive behavior before accepting that simplification.

**Disposition: correct identity model; retain digest, preset and invalidation as useful fields.** A digest plus mutable preset name cannot identify resolved output. Store canonical settings and resolved parameters, decoder/native codec/color engine/encoder/build versions, orientation decision, profile identities, intent, output dimensions/hash and status. Changed presets/software create a new derivative identity. Preserve old records/settings if historical regeneration matters. This supports explanation and repeat attempts, not byte identity. Owners decide retention and whether reproducibility means perceptual similarity or byte equality.

### C3 — Metadata removal and role-specific privacy

> Export would remove a list of identifying metadata tags and retain dimensions and a color profile. Internal review would use a more permissive policy. Compare explicit allowlists, re-encoding, and other metadata-handling approaches using actual format mechanisms, including less obvious containers or auxiliary payloads. No claim of privacy completeness should rest on one successful sample.

**Disposition: replace denylist with role-specific allowlists and selected-format inventory; retain external/internal roles and the completeness warning.** Inventory EXIF/maker notes/GPS, XMP, IPTC, comments, JPEG APPn, PNG eXIf/text/color chunks, previews/thumbnails, auxiliary records and sidecars where supported. JPEG APPn includes both identifying payloads and ICC/profile/preview functions; retain/remove by identifier and policy, not blanket marker deletion. Transform pixels before attaching matching output profile. Re-encode and inspect encoded output, while treating re-encoding as insufficient proof. Unknown data needs fail/strip/review policy. Owners choose formats, internal technical fields, whether dimensions remain, unknown-container behavior and bounded privacy claim. No universal sanitation claim is supported.

### C4 — Worker limits, output publication, cancellation and reporting

> Workers would reject inputs beyond a pixel-count limit, write outputs to temporary paths, and publish each successful image independently. Cancellation would retain completed derivatives and delete incomplete ones. Recommend dispositions for these rules, including memory accounting, failure reporting, and whether users need batch-level completeness information.

**Disposition: retain per-item publication and cleanup; strengthen resources and expose partial-batch state.** Pixel count is not a memory bound: check overflow-safe dimensions/pages and enforce memory, CPU/time, disk, output bytes and concurrency. Configure the pinned build; do not carry a library default forward as the product limit. Stage each result uniquely, validate, then publish. Atomicity depends on actual filesystem/staging location; use confirmed same-filesystem rename or a commit-marker protocol. Preserve successes on cancellation, clean incomplete staging, stop queued work and define finish-versus-interrupt behavior. Record terminal reasons and show partial status with actionable guidance. Owners set limits, cancellation boundary, retry/overwrite and retention. No filesystem behavior was tested.

### C5 — Validation scope

> Propose checks for orientation variants, profile/alpha interactions, corrupt metadata, huge dimensions, export-policy differences, and cancellation. Report any executed fixture checks without implying production visual validation.

**Disposition: retain and expand proposal; report zero executed product checks.** The matrix below covers named themes plus format/build, provenance and publication. Equal dimensions, encoder success or metadata removal on one sample is not fidelity or privacy evidence.

## Critic findings and explicit dispositions

| Critic finding | Disposition and resolution |
|---|---|
| **F-01, alpha/resampling underspecified** | **Accept with amendment.** Specify premultiply color by alpha before spatial filtering, filter premultiplied color and alpha, then unpremultiply for nonzero alpha and define zero-alpha color. Candidate behavior remains unverified. CSS Color Level 5 gives this arithmetic for color mixing but is a 2026 Working Draft and not a resize conformance rule. |
| **F-02, superseded PNG edition** | **Accept.** Keep SRC-PNG-02 bound to the 2003 Second Edition. Preserve CRITIC-PNG-01 and add separate REV-W3C-PNG-01 for the 2025 Third Edition. The new edition confirms unassociated alpha and adds current eXIf/text/color/privacy context; it does not prove library behavior. |
| **F-03, missing JPEG/container primary evidence** | **Accept with scope condition.** Add ITU-T T.86 V2 APPn inventory and examples. Owners select formats; each gets its own inventory and encoded-output checks. The registry is not exhaustive and blanket APPn deletion can discard ICC/color data. |
| **F-04, atomic publication wording** | **Accept.** Qualify atomic rename on the actual destination/staging filesystem. POSIX.1-2024 specifies atomic rename for conforming implementations, but cross-filesystem/non-POSIX behavior and durability are not established here. Proposed fallback is a commit marker/state protocol. Nothing was tested. |
| **F-05, ImageMagick patch/revert history** | **Accept with amendment.** Issue and linked commit corroborate the proposed patch chronology; the author reports it broke LZW cases and still mishandled JPEG cases, and a maintainer says it was reverted as incorrect. This is issue history, not independent reproduction or established root cause. Current release behavior remains a test item. |

The critic’s broader source audit found no other material wrong correction. Agreement is not treated as authority; source conditions and limitations govern the wording.

## Original brief coverage

| Brief obligation | Coverage |
|---|---|
| Inspect input; predictable thumbnails/review copies | Bounded inspection, explicit role geometry/color/encoder policy, versioned settings and item state. |
| Export without changing originals | Immutable input, source digest, unique staged output, no in-place or aliased destination. |
| Orientation, wide gamut, transparency, huge dimensions, broken metadata | Single orientation resolution; profile/fallback policy; alpha-aware filter; explicit malformed/conflict states; hard ceilings and fixtures. |
| Side-by-side comparison, explain policy, regenerate after changes | Role profile/intent/geometry/flatten/encoder settings and versioned provenance; display-calibration limitation stated. |
| Remove identifying data externally, retain selected technical fields internally | Separate allowlists, format inventory, encoded-output inspection and matching output ICC. |
| Maintained implementations, format/color docs, issue history, no winner | Three alternatives and conditional defaults/regressions; no selection. |
| Predictable excessive-memory failure | Multiple explicit budgets rather than pixels alone. |
| Mixed supported/unsupported batch and understandable cancellation | Per-item states, batch summary, cleanup and success retention. |
| No overwrite/upload, one-tag privacy claim, dimension-only fidelity or plausible substitute | Explicitly prohibited in this plan; no upload or service change occurred. |
| Explain unsupported/exceptions | Readable per-item reason and next step/retry guidance. |
| Distinguish actual checks from proposals | No fixture/product checks executed; all below are proposals. |

## Validation plan — proposed, not run

1. **Orientation/decoder:** generated asymmetric markers for all eight EXIF values including mirrors; absent, invalid, conflicting EXIF/XMP; TIFF JPEG- and LZW-compressed pages; format/build matrix; compare decoder-applied vs application-applied orientation; verify output signaling and unchanged source bytes.
2. **Profiles/color:** tagged sRGB, wide-gamut RGB such as Display P3/Adobe RGB, CMYK, gray, missing/malformed/unsupported ICC and intent/profile errors. Verify output values/profile identity. Compare profile-aware and linear-light scaling; arrange perceptual review on calibrated displays. Do not claim screen-independent equivalence.
3. **Alpha/resizing:** opaque controls, semi-transparent gradients, transparent edges with nonzero hidden RGB, premultiplied filtering or verified library equivalent, contain/cover/crop, up/downscale and JPEG flatten backgrounds. Check halos; compare source-space and linear-light choices where applicable.
4. **Resource/decode failures:** near/over each ceiling, huge declarations, truncated/corrupt files, extreme decoded-pixel ratios, many pages/frames, malformed profiles, unsupported builds and injected memory/time/disk/output exhaustion. Confirm deterministic status, bounded worker and no published file.
5. **Metadata/privacy:** seed identifiers in EXIF/GPS/maker notes, XMP, IPTC, comments, JPEG APPn including ICC/preview payloads, PNG eXIf/text/color chunks and other selected-format structures. Inspect each role’s encoded output; verify intended ICC and absence of disallowed fields. Unknown data follows chosen fail/strip/review policy. Bound claims to enumerated/tested structures.
6. **Batch/cancel/publish/provenance:** mix success/unsupported/failure; cancel before/in-flight; inject encode/validation failures. Verify completed output retention, staging cleanup, no premature complete state, explained partial summary, retry behavior and new provenance identity after policy/decoder changes.
7. **Regeneration/fidelity:** rerun pinned stack and selected version upgrades; record output hashes and perceptual differences. Treat byte identity separately. Human-review side-by-side samples; dimensions and successful encoding are insufficient.

## Owner decisions still open

Supported input/output formats and platform/codec builds; thumbnail/review dimensions and roles; contain/cover/crop/focal point/upscale/filter; output formats, precision and encoder settings; target profiles/intents; missing/bad/unsupported profile behavior; EXIF/XMP/TIFF orientation conflicts; alpha preservation and flatten backgrounds; role allowlists/privacy scope; unknown-container behavior; pixel/frame/memory/CPU/time/disk/output/concurrency ceilings; user-facing error wording; in-flight cancellation; retry, replacement and partial retention; provenance schema/canonicalization/retention; and whether regeneration means perceptual similarity or byte identity.

## Checks actually executed

Desk research/source reading only: the package listed in input-map.json, official standards/documentation, and upstream issue/commit history. No fixture generation, image code, executable, build, malicious-input test, benchmark, perceptual review, filesystem publication test or production integration ran. Workflow capture/Goal mechanics are not product validation.

## Source navigation

Complete source identity, URL, version/commit, locator, access UTC, operation, governing condition and applicability are in [source-map.json](source-map.json). Browse [sources/index.md](sources/index.md). Investigator/critic IDs remain stable. SRC-PNG-02 is still the PNG Second Edition; it is not rebound.
