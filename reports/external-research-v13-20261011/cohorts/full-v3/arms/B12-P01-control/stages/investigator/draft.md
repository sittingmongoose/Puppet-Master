# Investigator draft — Multilingual media-package import and export

## Provenance and decision frame

This draft adjudicates only the exact plan copy released into this stage. The one-shot helper ran once at 2026-10-12T01:09:51.083Z and returned plan SHA-256 `16b9632d851af40d2759e5c686525183f38a1e24989ffc6597cb35aeabaf7247`; it recorded the pre-plan discovery SHA-256 `e61d807d2cf719ff0c4481f2a443201f07462c4c9942fd6ecce782dcf3d84bc4` and 15,676 discovery bytes. I read only stages/investigator/revealed-plan.md after release. discovery.md was not edited after the helper recorded its hash.

The source IDs below point to the fixed primary-source index in sources/README.md. Full URLs, access UTC, release/commit identity, locators, observed operations, conditions/defaults/exceptions, and applicability are in source-map.json. Recommendations are proposal evidence, not parser behavior, resource-limit proof, or implementation validation.

## Proposal

### Representation

Adopt a versioned internal package graph with stable IDs for package, clip, resource, track, cue, and text run. The graph separates:

- the media resource bytes and content hash from its name/path;
- a clip association from a track filename or media basename;
- a track's semantic kind, language, display label, and source format/profile;
- cue intervals, source order, clip-relative timing, regions, and formatting;
- normalized supported fields from opaque/unrecognized source content.

Store time in a declared exact clock (integer ticks or rational numerator/denominator plus its timebase); retain original timestamp lexemes and source timing metadata. Do not use binary floating-point seconds as the canonical value. Store one outer cue interval where the source has a cue interval; preserve supported subcue/word timing as timed runs, or retain it as opaque source data and report it if the chosen output cannot represent it. Preserve overlapping cues, equal-start source order, language values, track kind, associations, styling/markup, and attachments as separate fields. Parsing invalid timing is a diagnostic state; do not fabricate a valid time.

A practical v1 profile could define ZIP plus one versioned manifest, a logical media/resource directory, and one declared text resource per track. This is a package structure candidate, not a claim that ZIP alone defines semantics. The manifest names stable IDs, kinds, language, source profile, media/clip association, timestamps/timebase, hashes, and original/derived status. It can reference one track file per track while preserving original source track bytes and any richer structured representation. The accepted manifest schema version and migration policy require an owner.

### Adapters and compatibility

Build independent adapters with a published support matrix for direction, format/version/profile, field preservation, lossy transformation, and unsupported content. WebVTT offers useful sidecar exchange and overlapping cues, but the currently published W3C page is a Candidate Recommendation Draft; its in-file markup and cue settings are bounded [S01]. HTML track kind/srclang/default metadata is a separate binding, and HTML allows no more than one default subtitles/captions track per media element [S02]. TTML2 is a richer interchange option with multiple profiles and timing/style constructs; declare exactly which profile/features are supported [S03]. ASS/SSA can carry authoring-oriented styling and override information, but depends on dialect, resolution and renderer; test actual target files [S20]. Keep SRT as a useful compatibility adapter with explicit mapping rules, not a fidelity baseline. FFmpeg supports several subtitle formats, but its matrix is directional and build-dependent [S06]. Its n8.1.1 SRT muxer uses millisecond timebase and omits packets with missing PTS or negative duration [S07]. Aegisub's v3.5.0 exporter checks attachments, styles and override tags before allowing SRT output [S08].

Other package/timeline alternatives remain possible:
- Matroska is suitable for a single final media file with tracks/metadata and font attachments; track flags are player hints and player selection can override them [S04, S05].
- H5P is a meaningful authoring-tool adapter where used, but its content is defined by library-specific semantics; H5P.com documents VTT track upload for directly uploaded video and a different case for external video platforms [S11, S12].
- Common Cartridge v1.3 is relevant only if teachers need LMS/course exchange [S15].
- BagIt contributes payload hashes and completeness, not subtitle semantics; do not fetch fetch.txt URLs [S16].
- OTIO v0.18.1 contributes an editorial timeline model with external media references and transition overlap, not a self-contained media package or subtitle-language/style model [S13, S14].

Before accepting a track, preserve its exact source language token and parse a language tag only when valid; never guess language solely from the filename. Keep source order plus a separate time-sorted presentation index. WebVTT exports must satisfy its ordered cue start constraint; if that requires changing source order, disclose it and maintain a stable equal-start order [S01]. Overlap is valid content in formats that allow it. Flag potentially colliding display regions as a preview warning, not a package rejection. Treat default, forced, caption/SDH, description, transcript, and track order as distinct metadata; do not map a container's default selection hint to a guaranteed player choice [S02, S05].

### Safe, selective, recoverable import

Use the plan's ZIP envelope only with an application-owned staging pipeline:
1. Inventory entries and package metadata before payload extraction. Preserve raw entry name, occurrence/index, declared size/compression, and package hash. Resolve selection by entry identity, never by name alone.
2. Reject absolute, traversal, drive/UNC, symlink, NUL/control, and ambiguous normalized paths. Do not flatten original names. Use internal IDs/content hashes to avoid filename collisions; keep the original display name and safe logical path in the manifest.
3. Set independent compressed bytes, expanded bytes per entry and total, ratio, entry-count/depth, parse-time and memory limits. Stream to a fresh staging root without following archive symlinks; check byte counts, CRC and hashes. A maximum compressed size and an absolute-path test alone do not cover decompression bombs, duplicates, Unicode/case collisions, or symlink redirection [S17-S19].
4. Parse supported manifest/text formats under strict resource limits and without executing scripts, automation, macros, or active content. Aegisub's release history documents code execution through a crafted subtitle's referenced Automation script before v3.5.0 [S09]. Aegisub issue 614 is a single report of invisible leading Unicode causing an SRT parse error; include such prefixes and BOM behavior in tests without generalizing that report to all parsers [S10].
5. Report missing references as unresolved, preserve malformed bytes and their source location, and keep duplicate/colliding entries independently reviewable. Do not match assets by basename automatically. No network fetch or remote-resource resolution.
6. Offer per-clip/per-track/resource selection before commit. Maintain per-item states (ready, warning, blocked, skipped, staged/incomplete) and a recovery journal. Cancellation stops new work but keeps completed staged work and a resumable session until the user resumes or discards it. Commit selected, validated content atomically; existing lessons remain unchanged unless an explicit replace operation is separately confirmed.

### Loss-aware export and preview

Export is a new artifact. Present an export preview before writing: target format/version/profile; each selected track/media resource and language/kind/clip association; included/copied/converted/preserved-only/omitted/blocked rows; timing precision changes/reordering/overlap consequences; unsupported fields and the user's available choices. Preserve original track/resource bytes whenever conversion would be lossy, include or safely reference the original only under a defined package policy, and never overwrite the imported source. If a chosen target cannot carry a field, retain the original alongside the derivative or require an explicit omit/cancel choice. Record each mapping decision and output hash.

Preview should include the existing player backend (no rewrite), a multi-track/language selector, text and timing, a cue/timeline view showing overlaps, clip association, and the original-versus-derived view. A finding should identify item, logical path, format/parser location, consequence, and a safe next action. Include missing resources, duplicate names, malformed encoding, unsupported fields, unusual timing/overlap, unsafe archive paths, oversized items, and export loss in the same reviewable diagnostic model.

## Exact released-plan clause dispositions

| Plan clause | Disposition | Reason and proposed correction |
| --- | --- | --- |
| “ZIP package containing a single metadata document, a media folder, and one text file for each subtitle track.” | **Retain with correction.** ZIP is a practical envelope; one manifest plus per-track resources is a good initial packaging shape. | Version the manifest and declare schema/version/profile. Use stable resource/track IDs and explicit kinds, languages, hashes, clip links, exact timebase, and formatting support. A folder path is logical metadata, not trusted identity. Include transcript/description tracks where supported. Source formats remain attached for original preservation. ZIP is not itself the interchange semantics. |
| “On import, extract into a temporary directory.” | **Correct.** | Inventory first; stream accepted bytes into a fresh, isolated application-owned staging root; do not extract the entire archive using member paths. Verify hashes/CRC and limits. Python docs warn that path abstractions may not sanitize, and zip-rs history shows symlink-mediated traversal despite prior path checks [S17-S19]. |
| “Flatten media filenames.” | **Reject.** | Flattening merges same-basename resources and loses path identity, possibly disconnecting clip/track association. Use stable IDs/content hashes and collision-free internal storage keys while preserving original names/paths as metadata; surface normalized-name collisions. |
| “Convert every recognized track to plain text plus floating-point seconds.” | **Reject.** | A successful text parse does not make a lossy conversion safe. Plain text drops meaningful formatting, speaker/language spans, regions and other authoring data; float seconds introduce avoidable rounding. Use structured text runs, rational/integer times and exact source lexemes; preserve original bytes. Adapter loss is explicit. TTML profiles/styles, bounded WebVTT markup, and real SRT exporter guards support this distinction [S01, S03, S08]. |
| “Store one start/end pair per cue.” | **Retain only as the outer cue interval, with extension.** | Keep an exact outer interval when the source has one; preserve timed spans/subcue timing as nested runs where supported or as opaque original data with a warning. Record timebase and clip-relative origin. Do not discard cue order, overlap, regions or other timing constructs. |
| “Sort cues by start time.” | **Correct.** | Retain original order as source data and derive a stable playback order for display. Where a target format requires nondecreasing starts (WebVTT), apply that target rule only in the new export and report any reorder; keep deterministic order for equal starts [S01]. |
| “Treat overlap as a warning rather than refusing the package.” | **Retain and clarify.** | Overlap is supported content and should not reject the package. Emit a warning only when display collisions, target constraints, or app preview make it relevant. Preserve all cue intervals and track identity. |
| “Unrecognized fields stay only in the imported originals.” | **Correct.** | Keeping originals is required but insufficient if the app silently hides all unsupported fields. Preserve unknown data as an opaque source extension where safe, expose it in diagnostics and the export loss plan, and retain the original file. Do not interpret or execute unknown content. |
| “The user chooses tracks and media to keep before a final database transaction.” | **Retain and clarify.** | Selection before commit is correct. Make inventory and per-item validation visible before full staging, and commit only selected validated items atomically. The cancellation/recovery journal is separate from database commit. |
| “Export writes the same internal package and can generate a simple subtitle file for other tools.” | **Retain with correction.** | Export the versioned manifest/package and provide named subtitle adapters/profile options. “Simple subtitle” must not imply universal compatibility. Show included/converted/preserved/omitted items, quantization/reordering, and unsupported styles. Preserve original inputs when lossy and write to a new destination. |
| “Track language comes from a filename suffix.” | **Reject as authoritative inference; optional suggestion only.** | Filenames are not dependable language metadata. Parse explicit manifest/container/track metadata first; store the raw tag plus normalized valid language tag, and leave unknown as unknown. A suffix can be shown as an untrusted suggested value for user confirmation. HTML itself distinguishes srclang from display label language [S02]. |
| “Clip association comes from matching base filenames.” | **Reject as authoritative association; optional suggestion only.** | Duplicate names and basename collisions are explicit brief risks. Prefer stable manifest IDs/container references; if an older format lacks them, show candidate matches and require confirmation. Preserve unresolved association rather than silently attach to the wrong clip. |
| “A canceled import deletes the temporary directory, while existing lessons stay untouched.” | **Split disposition.** | **Retain:** do not mutate existing lessons on cancellation. **Correct:** deleting all staging conflicts with recoverable partial work. Keep validated staged items and a small journal for resume or explicit discard; do not publish incomplete package rows. Define expiration/cleanup as an owner policy. |
| “The preview displays text, time ranges and a list of warnings.” | **Retain and extend.** | Include media/clip association, language and track-kind selector, overlap timeline, formatting/regions, resource inventory, what export includes, and per-field loss/safety warnings. Keep existing playback engine. |
| “Set a maximum compressed package size and reject absolute paths.” | **Retain as minimum controls; materially expand.** | A compressed-byte cap and absolute-path rejection are insufficient. Bound expanded bytes per entry and total, ratio, count, nesting, parser time/memory, plus path traversal, drive/UNC, symlink, NUL/control, and normalized collisions. Exact thresholds depend on teacher file sizes, workstation limits and storage budget; record as owner decisions until measured [S17-S19]. |
| “Examine the representation, compatibility, error/cancellation handling and round-trip promises.” | **Retain and scope.** | The draft covers all four and adds package boundaries, preview/diagnostics, and plausible interchange alternatives requested by the brief. Do not claim every format. |
| “Retain original files when transformation is lossy and never fetch remote media automatically.” | **Retain as hard requirements.** | Keep source bytes and hashes; present loss before export and use a new output. Treat remote references as unresolved metadata; no automatic network access. BagIt fetch.txt remains disabled even if BagIt is used for integrity [S16]. |
| “No proposed parser or resource limit is implementation proof.” | **Retain exactly as a validation constraint.** | Limits, profile support and path safety above are future requirements until implemented and verified. This draft did not execute parser code or test an application. |

## Already covered, rejected, optional, and owner decisions

**Already covered in the released plan:** a ZIP envelope, a single manifest/metadata document, media plus per-track text resources, selection before the final transaction, protection of existing lessons, text/time/warning preview, package size/path checks, a new export and the originals/no-network constraint.

**Rejected or corrected:** filename flattening; float-seconds canonical time; plain-text-only normalization; inferred language and clip association as authoritative; sorting that discards source order; deleting recoverable staged work at cancellation; allowing unknown fields to disappear from visible diagnostics; and treating two archive checks as a complete resource boundary.

**Optional improvements for a v1 boundary:** SHA-256 manifest receipts; content-addressed internal storage; BagIt-style integrity vocabulary without remote fetch; limited OTIO timeline adapter; H5P/ICC adapters after confirming teacher use; per-track loss receipts; a compatibility corpus generated from supported authoring releases. These are not prerequisites unless the owner selects them.

**Owner decisions required before implementation scope is frozen:**
1. Exact authoring tools, releases, representative packages and target export tools.
2. Which track kinds and language-tag sources are in v1; default/forced/accessibility semantics and whether multiple overlapping display tracks are shown simultaneously.
3. Exact WebVTT/TTML2 profiles and ASS/SRT dialects supported; which rich formatting features must round-trip.
4. Whether originals must be embedded in each export or may remain in a managed source store, plus retention, storage quota, and user-controlled cleanup policy.
5. Package schema owner/version policy and backward compatibility promise.
6. Maximum compressed and expanded bytes, item count, per-file attachment size, nesting, parsing duration, and preview limits, based on actual school packages and workstation targets.
7. Existing playback/preview backend and supported codecs; no backend rewrite is included.
8. Recovery journal lifetime and behavior after application crash, logout, low disk space, or explicit discard.
9. Whether Matroska, H5P, Common Cartridge, BagIt, or OTIO import/export has a real user requirement.
10. Whether malformed-but-retained tracks may be edited in normalized form or only preserved byte-for-byte until the user repairs them.

## Validation proposals versus checks actually run

The discovery artifact proposes golden round-trip fixtures, malformed Unicode/BOM fixtures, overlapping/equal-start/out-of-order cues, profiles/timebase cases, attachment/path collisions, adversarial ZIP cases, cancellation/crash recovery, no-path-escape/no-network/no-script assertions, loss-preview acceptance, original-hash preservation, and accessible multi-track preview scenarios. These are future validations, not results.

Actual checks in this stage: the exact-goal binding guard accepted the native create response; the assigned one-shot plan-release helper completed and reported the discovery hash above; source-map JSON syntax and required artifact presence/size were checked. No app tests/build, archive extraction, subtitle conversion, downloaded-code execution, or runtime validation was performed. The source observations and issue reports are identified with their conditions in source-map.json and are not represented as tests of this proposed application.