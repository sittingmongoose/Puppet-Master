# Final proposal — multilingual media-package import and export

## Recommendation

Keep a ZIP-based, versioned package as a practical v1 envelope, with an explicit manifest and one declared resource per media asset and text track. Treat the ZIP layout as packaging only: the manifest and adapters define the content model. Use a versioned package graph with stable IDs, immutable original bytes, explicit media/track associations, exact time values, structured text, and scoped descriptive metadata. Add format adapters only for named profiles and versions. Before export, show an itemized fidelity report and preserve the source whenever conversion loses information.

Import should inventory first, let users select items, stream selected data into a fresh application-owned staging area under resource and path limits, and commit only validated selections. Keep an interrupted session resumable until the user resumes or explicitly discards it. The preview should expose track language and kind, clip association, timing and overlap, formatting, unresolved assets, and export loss.

The hard boundaries are: no paid cloud conversion; no automatic fetching or resolution of remote media; no playback-engine rewrite; no claim to support every format; no overwriting originals. These are product requirements, not optional implementation choices. Numerical limits, adapter scope, and exact original-retention behavior remain owner decisions until actual teacher packages and targets are known.

## Representation

Use a versioned graph with stable identifiers for package, clip, resource, track, cue, and text run. Keep an immutable reference to the original package and original resource bytes, with cryptographic hashes. A normalized view supports editing and preview but never replaces the source.

Keep the following concepts separate:

- A resource’s stable identity, raw/original logical name, safe display name, detected media type, extension, byte count, hash, and bytes. Names are not identifiers.
- A clip’s reference to its media resource, in/out range or whole-resource range, duration information, and source timing metadata.
- A track’s semantic kind, exact source language token, parsed language tag only when valid, display label, source order, source format/profile/version, associated clip or resource, and default/forced/accessibility hints as separate values.
- A cue’s exact start and end in a declared clock, source order, clip-relative origin, region/placement, formatting/style references, and raw source fragment when preservation is possible. Use integer ticks or a rational value plus timebase; retain source timestamp lexemes and do not canonicalize through floating-point seconds. Preserve overlapping intervals and equal-start ordering. Keep a separate sorted presentation index where needed.
- A text tree with explicit line breaks, supported emphasis, voice/speaker, language spans, ruby, and supported word/subcue timing. Preserve unrecognized constructs as opaque source data and report their consequences. Never execute or render source HTML, scripts, or active markup.

Add an explicit descriptive-metadata model at package, clip, resource, and track scope. Include a defined set of normalized fields such as title, description, creator/contributor, source application and version, creation date, rights, and keywords, while retaining the original source field name, namespace, value, language, scope, and source locator. Known values may be normalized only while their source value and provenance remain available. Unknown or application-specific values remain opaque, attached to the same entity, and visible in diagnostics. Each adapter declares field mappings as exact, transformed, preserved-only, unsupported, or omitted-with-consent. Include those mappings in export preview and receipts. TTML2 provides an example of metadata on document and content elements, including foreign-namespace metadata, while leaving arbitrary metadata semantics to applications; this supports scoping and preservation, not a claim that every target format will round-trip it [S03].

Treat supported round trips as semantic comparisons at each source format’s declared precision: resource identity, metadata scope and values, clip association, track order/kind/language, cue timing and overlap, text runs, regions/styles, and selection hints. Do not promise byte-identical serialization after normalization. Unmodified original passthrough may be byte-identical; a conversion is a new artifact and leaves its original untouched.

## Interchange and compatibility

Implement independent adapters with a published matrix for direction, exact format/version/profile, supported fields, transformations, preservation-only fields, and rejected fields. Do not freeze an adapter or feature promise without representative packages and target tools.

- **WebVTT** is a useful sidecar option. The W3C snapshot checked here is a 2026-05-20 Candidate Recommendation Draft, not a final Recommendation. Its cues must be listed by nondecreasing start times, end after start, and may overlap; its in-file text and layout vocabulary is bounded [S01]. Keep HTML binding metadata such as kind, srclang, label, and default separate from the WebVTT cue file. The living HTML Standard separates subtitle language from label language and constrains default subtitle/caption tracks [S02].
- **TTML2** is a richer timed-text alternative with profiles, time containers, language, regions, styles, and metadata. Name the exact profiles and supported features because processor behavior depends on the effective profile [S03].
- **SRT/SubRip** is a useful compatibility path, not a fidelity baseline. FFmpeg’s n8.1.1 writer sets a 1/1000 timebase and skips packets with absent PTS or negative duration; its own source lists character encoding, line ending, and BOM options as TODOs [S07]. Aegisub v3.5.0 rejects SRT export when attachments, non-default styles, or unsupported override tags are present and converts only a narrow b/i/s/u set [S08]. Those are concrete implementation examples, not universal SRT rules.
- **ASS/SSA** is worth considering when actual teacher tools require authoring-oriented styling, positioning, layers, or inline overrides. The pinned Aegisub sample demonstrates these features, but it is a project fixture, not a normative format specification; renderer, font, resolution, and dialect compatibility need real target files [S20].
- **Matroska** can package a final audiovisual file with multiple tracks, metadata, and attachments; track flags are hints and selection/rendering remain player-dependent [S04, S05]. It is not the entire teacher-package graph.
- **H5P** is an adapter candidate only if the actual authoring roster uses it. The H5P.com help page describes VTT tracks for directly uploaded video and an exception for external video platforms [S12]. The separate developer specification was not independently accessible in the reviser pass, so its package-structure claims remain carried evidence only [S11].
- **Common Cartridge v1.3** is relevant if institutions require LMS/course exchange [S15]. **BagIt** is an optional outer integrity-packaging candidate, not a timed-text model. Detailed checksum behavior remains only partially checked in the carried review; never fetch remote payloads [S16]. **OpenTimelineIO v0.18.1** offers a timeline model with externally referenced media and transition overlap, not a self-contained media package or subtitle-language/style model [S13, S14].
- **FFmpeg’s live support matrix** is directional and build-dependent. It is only a candidate-tool reference here: its subtitle rows and latest-release status were not independently rechecked in the reviser pass, and it does not establish the features of a packaged binary [S06].

Keep exact language tags and labels separate; do not infer language or clip association from filenames. If an old format lacks explicit association, show possible matches and require confirmation. Preserve track source order and expose any target-required reorder in the export report. Keep default, forced, caption/SDH, description, transcript, and track order distinct; a container default is not a guarantee of what a particular player selects [S02, S05].

## Safe, selective, recoverable import

Treat packages, media metadata, and subtitle text as untrusted data.

1. Inventory every archive entry before reading payloads. Record package hash, central-directory occurrence/index, raw entry name, declared sizes/compression, and duplicate names. Resolve selection by entry identity, never filename alone. Python 3.13 documents using a ZipInfo object to disambiguate duplicate names and warns that zipfile.Path does not sanitize names [S17].
2. Reject or quarantine absolute paths, parent traversal, drive/UNC paths, NUL/control names, symlinks, unsupported encryption/compression, and collisions after path, case, or Unicode normalization. Keep the raw name separately. Do not flatten filenames or extract untrusted entries directly into the library. A zip-rs advisory documents a symlink-mediated extraction escape in affected releases even after path sanitization; use an application-owned fresh stage and APIs that prevent following links [S18, S19].
3. Enforce independent limits for compressed bytes, expanded bytes per entry and in total, expansion ratio, entry count, nesting depth, parsing time, memory, and preview work. Stream selected bytes to fresh staging, checking byte counts, CRC, and hashes. Values remain open until measured against the tool roster, packages, storage, and workstation constraints.
4. Parse supported manifests and text within those bounds. Never execute package scripts, macros, or automation, and never resolve remote references over the network. Aegisub’s v3.5.0 release history documents crafted subtitle Automation execution before its security fix [S09]. The invisible-Unicode SRT report is one issue report, not a universal parser rule; use it as an adversarial fixture, preserve original bytes, and report parser locations [S10].
5. Represent missing references as unresolved; preserve malformed source bytes and diagnostics. Keep duplicate resources independently reviewable. Do not substitute by basename.
6. Show inventory and per-item state before commit. Let users select clips, tracks, and resources; record ready, warning, blocked, skipped, staged, or incomplete status. Stage per session and keep a small recovery journal. Cancellation stops new work but leaves completed staged work resumable until the user resumes or explicitly discards it. Commit only selected, validated data atomically; cancellation must not change existing lessons. Define expiration/cleanup policy with the owner.

## Loss-aware export, preview, and diagnostics

Export to a new destination. Before writing, preview the target format/profile/version and the chosen clips, tracks, metadata, and resources. For each item show whether it will be included, copied as an original, converted, preserved-only, omitted with consent, blocked, or unresolved. Show metadata field mappings, timing quantization, reordering, overlap consequences, formatting/style loss, attachments, and unsupported features with the affected item and a concrete choice: retain the source alongside a derivative, choose a richer target, omit only after explicit confirmation, or cancel.

Keep original bytes available whenever conversion is lossy. Until the owner decides whether a managed source store can replace embedding, include originals in package export when needed to preserve information. Never overwrite an imported source. Record package/profile versions, mappings, decisions, output hashes, and item-level warnings in a receipt.

Preview should use the existing playback backend and include a language/track selector, track kind, clip/resource association, formatted text, timing and overlap on a timeline, and source-versus-derived presentation. Diagnostics should identify the package item, logical path, parser location or time range, consequence, and safe next action. Include missing resources, duplicate names, malformed text, unsupported metadata, unsafe paths, oversized entries, timing problems, and export loss in one reviewable model.

## Exact released-plan clause dispositions

| Released clause | Disposition and reason |
| --- | --- |
| ZIP with one metadata document, media folder, and one text file per subtitle track | **Retain with correction.** Use a versioned manifest, stable IDs, explicit resource/clip/track links, checksums, profile, timebase, and declared text resources. Preserve supported descriptive metadata and unknown extensions at their original scope. ZIP is only the envelope. |
| Extract into a temporary directory | **Correct.** Inventory first; stream selected, validated bytes to a fresh isolated application staging area. Do not extract by trusting member paths. |
| Flatten media filenames | **Reject.** It merges same-basename resources and can break association. Keep names as metadata and use stable IDs and collision-free internal storage. |
| Convert every recognized track to plain text plus floating-point seconds | **Reject.** This loses formatting and avoidable timing precision. Use structured text and exact clocks; retain originals and report adapter loss. |
| Store one start/end pair per cue | **Retain as the outer interval, with extension.** Preserve supported timed spans and source timing, or retain unsupported timing opaquely with a warning. Invalid times remain diagnostic; do not fabricate values. |
| Sort cues by start time | **Correct.** Preserve source order, with a separate presentation order. A target such as WebVTT may require nondecreasing starts; disclose any reorder and keep equal-start order stable [S01]. |
| Treat overlap as a warning rather than refusing the package | **Retain and clarify.** Overlap is valid in formats that allow it. Warn for preview collisions or target limitations, not merely because intervals intersect. |
| Leave unrecognized fields only in imported originals | **Correct.** Preserve originals, but also retain safe opaque metadata/extensions in the graph and expose their presence and export consequences. |
| Choose tracks and media before the final database transaction | **Retain and clarify.** Make inventory and validation reviewable first; stage selected items and commit only validated items atomically. |
| Export the same internal package and optionally a simple subtitle file | **Retain with correction.** Export a versioned package and named adapter profiles. “Simple subtitle” is not a compatibility promise; preview field loss and keep originals where needed. |
| Infer track language from filename suffix | **Reject as authoritative; allow only a confirmed suggestion.** Use explicit track/manifest metadata; preserve raw tags and leave unknown language unknown [S02]. |
| Infer clip association from matching base filenames | **Reject as authoritative; allow only a confirmed suggestion.** Use stable references or explicit user confirmation; preserve unresolved associations. |
| Cancellation deletes the temporary directory while lessons stay untouched | **Split.** Retain the no-mutation rule. Correct deletion to resumable staging and a recovery journal, with explicit discard/expiration policy. |
| Preview text, time ranges, and warnings | **Retain and extend.** Include language/kind, association, overlap, formatting, metadata, included items, and export-loss choices. |
| Set a maximum compressed size and reject absolute paths | **Retain as minimum controls; expand.** Add expanded size, ratio, count, depth, parsing and preview budgets, traversal, drive/UNC, symlink, control-name, and normalized-collision checks. Numeric limits need package and workstation evidence. |
| Examine representation, compatibility, error/cancellation, and round-trip promises | **Retain and scope.** These are core requirements; add package boundaries, metadata preservation, diagnostics, and alternatives without promising universal support. |
| Retain original files when conversion is lossy and never auto-fetch remote media | **Retain as hard requirements.** Keep original bytes accessible, report loss, write a new artifact, and leave remote references unresolved. |
| A parser or resource-limit proposal is not implementation proof | **Retain.** The proposal and future validations below are not implementation or security proof. |

## Critic findings and open decisions

- **C1 — Descriptive metadata omission: accept and amend.** Add metadata scoped to package, clip, resource, and track, with raw/source fields, normalized known values, opaque unknown extensions, and adapter mappings in loss preview. Exact metadata fields remain an owner decision until representative packages are available.
- **C2 — No paid cloud conversion: accept and amend.** State this as a hard boundary beside no network fetch and no playback rewrite. No design here uses a paid remote converter.
- **C3 — Source verification qualification: accept and clarify.** Preserve source IDs and exact identities. S06’s support matrix and S11’s developer specification remain carried or unverified and cannot justify frozen adapter promises. S19’s advisory and release notes corroborate the patched version and path/symlink fix theme, but the exact remediation commit was not inspected. S20 was checked only as a project test fixture, not as a standard. Keep these candidates optional and state source-specific conditions; the separately verified H5P.com VTT guidance concerns directly uploaded video only.
- **C4 — Profiles and operating thresholds: retain as unresolved owner input.** Tool/version roster, representative packages, target export formats, profile/format subsets, playback backend, schema owner, original retention, resource limits, recovery retention, and demand for optional adapters must be decided from actual needs. They are not reasons to narrow the brief.

Already covered in the released plan: ZIP envelope, metadata document, per-track text resources, selection before commit, protection of existing lessons, basic text/time/warning preview, size/path checks, export, originals, and no automatic remote fetch. Correct or reject flattening, float-second normalization, plain-text-only conversion, filename inference, destructive cancellation, invisible loss of unknown fields, and the idea that two archive checks suffice. Optional capabilities are checksum receipts, content-addressed storage, BagIt-style local integrity, OTIO, H5P or Common Cartridge adapters if requested, and per-track loss receipts.

Owner decisions before implementation scope is frozen:

1. Authoring tools/releases, representative packages, and target import/export tools.
2. Track kinds and language sources for v1; default/forced/accessibility behavior; simultaneous track display.
3. Exact WebVTT/TTML2 profiles and ASS/SRT dialects; required formatting fidelity.
4. Whether originals are embedded in every export or stored in a managed source store; retention, quota, and cleanup.
5. Manifest/schema owner, version policy, and compatibility promise.
6. Numeric compressed/expanded bytes, item count, attachment size, depth, parsing duration, and preview limits.
7. Existing playback backend and codec support; no rewrite is in scope.
8. Recovery lifetime and crash, logout, low-disk, and explicit-discard behavior.
9. Actual demand for Matroska, H5P, Common Cartridge, BagIt, or OTIO.
10. Whether malformed-but-retained tracks may be edited or only preserved until repaired.

## Validation status

**Proposed future validation, not run:** teacher-tool golden fixtures with source hashes and expected package graphs; per-profile round trips for overlapping/equal-start/out-of-order cues, precision, language/kind, subcue timing, formatting, regions, TTML timebases, ASS styles/fonts/positions, and attachments; malformed encoding/BOM/control tests; adversarial archive tests for duplicate entries, path escapes, symlinks, corrupt headers/CRC, expansion, entry floods, unsupported compression/encryption, and no network/script execution; cancellation/crash injection with idempotent resume and no partial publish; export preview consent and unchanged-source-hash checks; and accessibility/usability review of selection, track semantics, diagnostics, cancellation, and resume.

**Actually evidenced in this reviser stage:** the native Goal was created with the exact frozen objective; the exact-goal binding guard passed; its response is preserved in native-goal-active.json. The one-shot release record matches plan SHA-256 16b9632d851af40d2759e5c686525183f38a1e24989ffc6597cb35aeabaf7247 (1,722 bytes) and discovery SHA-256 e61d807d2cf719ff0c4481f2a443201f07462c4c9942fd6ecce782dcf3d84bc4 (15,676 bytes). Source verification is attributed in source-map.json: this stage directly rechecked S01–S03, S07–S08, S17–S18; partially rechecked S19–S20; other statuses remain as carried from investigator/critic records, including the S11 access error and S06 carried-only matrix. No application code, archive extraction, sample package, subtitle conversion, app build, deployment, or product validation test was run. Source observations are not tests of the proposed product.

## Sources

Use the fixed IDs and source conditions in [sources/README.md](sources/README.md) and [source-map.json](source-map.json). IDs S01–S20 retain the investigator’s original URLs and meanings; verification and access details are added without rebinding an ID.
