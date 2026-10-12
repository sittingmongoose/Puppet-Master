# Independent discovery — investigator stage

## Scope and evidence boundary

This is the pre-plan discovery for the user's brief, “Multilingual media-package import and export.” I read that exact brief first and did not seek, infer, or read the tentative exact plan. The source records below are pinned where possible and distinguish specifications from live implementation documentation, version-specific code, release history, and one non-normative issue report. Source IDs are stable and are not silently reused. The full index is in sources/README.md; machine-readable conditions and provenance are in source-map.json.

The discovery is a proposal for later clause-by-clause adjudication after the assigned one-shot plan reveal. It does not claim that every format or authoring tool is supported. No application code was built, no package was imported or exported, no downloaded code was executed, and no product compatibility test was run.

## Requirement-to-design findings

### 1. Internal representation and round-trip policy

Use a versioned, product-neutral package model with explicit importer/exporter adapters. Keep the original package and every original resource immutable and addressable by a content hash. A normalized view supports editing and preview; it must never replace the source bytes. If a format feature cannot be represented or emitted, preserve its originating file/resource and original format metadata, show the loss before export, and require a deliberate decision before creating a derivative.

Recommended entities:

- Package: stable package ID, schema version, human metadata, source application/version/profile, original package hash, entry inventory, and diagnostic state.
- Resource: stable internal ID independent of filename, original logical path/name bytes, detected media type plus reported extension, byte length, content hash, and immutable bytes. A resource may be missing or unresolved; it must not disappear from the package graph.
- Clip: stable ID, resource reference, clip-in/out or whole-resource range, measured/declared duration, and preserved source timing metadata.
- Track: stable ID, semantic kind (subtitles, captions/SDH, transcript, description, chapters, or other explicitly supported type), exact source language token plus parsed BCP 47 value when valid, source label, associated clip/resource, source order, source format/profile/version, and default/forced/accessibility hints kept separately.
- Cue: stable ID, source order, exact start/end in a declared clock using rational/integer time rather than early float rounding, clip-relative origin, text tree, region/placement, source formatting/style references, and the original raw cue fragment when the adapter can preserve it. Keep equal-start ordering and overlapping intervals; do not flatten tracks or normalize them into non-overlapping rows.
- Text runs: safe structured text, explicit line breaks, supported emphasis, voice/speaker, language spans, ruby, and timing; unknown constructs are represented as opaque source data with a warning. Never render source HTML/script as executable markup.

A track's language, kind, and user-facing label are independent. HTML's track example explicitly separates srclang from label language; the standard also limits the default flag for subtitles/captions to one per media element [S02]. Store multiple source default/forced/accessibility flags as separate hints; exporter mappings must show any many-to-one conversion.

For supported round trips, test semantic equality at the source format's declared precision: resource identity, clip association, track order/kind/language, cue start/end, overlap, text-run tree, regions/styles, and selection hints. Preserve source order for equal or invalidly ordered cues. Do not promise byte-identical serialization after normalization. Unmodified original passthrough can be byte-identical; conversions are new files and leave originals untouched.

### 2. Timing, track, and formatting alternatives

| Format or mechanism | What it provides | Conditions and fit |
| --- | --- | --- |
| WebVTT sidecars | Web-linked timed text; language/kind metadata lives beside the media in the HTML track binding. The current W3C text permits ordered start times, distinct overlapping cues, regions, cue placement, and a limited inline set including emphasis, ruby, voice, and language spans [S01, S02]. | Useful practical web distribution profile. The 2026 WebVTT page is a Candidate Recommendation Draft, not a final Recommendation. Its in-file formatting/settings are a subset; don't promise arbitrary style/layout preservation. |
| TTML2 | XML-based timed text intended for authoring-system interchange; profiles, parallel/sequential local timing, language inheritance, regions and a much richer styling vocabulary [S03]. | Strong richer interchange alternative, but exact supported profile and processor behavior matter. Define accepted profiles, timeBase/frame-rate cases, namespaces, and unsupported feature handling. It is not a reason to claim universal TTML2 support. |
| SSA/ASS | Established authoring-oriented option with style records, PlayRes coordinate context, positioned lines and inline override-tag examples in Aegisub's release-pinned test material [S20]. | Useful adapter where teacher tools use it and formatting matters; rendering can depend on script resolution, fonts and renderer. Test dialects and bundled-font handling. |
| SubRip/SRT | Widely encountered plain timed-text input/output; FFmpeg lists its parser/writer support, but the version-pinned SRT writer uses millisecond timebase, skips packets with missing PTS or negative duration, and still lists encoding/newline/BOM controls as TODOs [S06, S07]. | Keep as a compatibility path with named parser/export profile and a fidelity report. Aegisub's real exporter rejects non-default style, attachments, and unsupported tags rather than assuming those will fit SRT [S08]. |
| Matroska | Single audiovisual container with multiple typed tracks, timestamp scale, language/name/selection flags and attachments; font attachments can affect subtitle rendering [S04, S05]. | Good final-playback/container alternative for one clip, including attached subtitle fonts. Player selection flags are hints and can be overridden; it does not define the teacher package's entire resource graph. |
| OpenTimelineIO (OTIO) | Release v0.18.1 exposes a timeline interchange model for clips, timing, tracks, transitions, markers and metadata, with media referenced externally; clips may overlap via transitions [S13, S14]. | Useful timeline concept/optional editing-tool adapter. It does not embed media and does not itself define language-track or caption style semantics. |
| H5P .h5p | ZIP-based authoring package with package metadata, optional content, and content-type libraries whose semantics define content. Current H5P.com help documents VTT tracks for directly uploaded videos, with a caveat for external video platforms [S11, S12]. | Practical adapter for known H5P content types. Bind to each library/version and distinguish direct video from external platform cases. Don't treat its library-specific content.json as a universal model. |
| 1EdTech Common Cartridge | v1.3 learning-platform package profile for course structure, resource organization and metadata [S15]. | Consider only when a school/LMS exchange requirement calls for it; it brings course semantics rather than a media-package solution. |
| BagIt | Directory/payload packaging and cryptographic manifests for completeness/integrity [S16]. | Possible outer integrity layer; it carries no clip, track, cue, or styling model. Do not fetch fetch.txt URLs, because the brief excludes automatic network fetch. |
| Media files plus a package manifest | A compact app-owned envelope can link each clip, track and resource by stable IDs and carry WebVTT/TTML/SRT/ASS as declared resources. | A practical neutral-package candidate. Version the manifest, include checksums, keep resources local, and don't let container filenames become identities. |

The adapter matrix should be explicit by format version/profile, direction, supported feature, transformed feature, preserved-only feature, and rejected feature. FFmpeg's table distinguishes demux, mux, encode and decode, and marks some support as an external library; its feature matrix cannot certify an arbitrary installed build [S06]. Feature detection and versioned golden fixtures remain future work.

### 3. Import inventory, safe paths, and partial work

Treat every package and subtitle as untrusted data. First list every archive entry without extracting it. Keep both the raw archive name and a normalized display name. Detect duplicate raw names and collisions after path, case, and Unicode normalization. Identify selection by entry identity (for example, central-directory index plus package hash), never by filename alone. Python's documented ZIP API accepts a ZipInfo object for duplicate names; its Path abstraction does not sanitize archive paths, and the docs warn about resource exhaustion and overwrite-on-repeat behavior [S17].

Before opening entry payloads, enforce configurable maximum entry count, nesting depth, compressed/uncompressed sizes, total expansion, compression ratio, parse time, memory, and preview limits. Reject or quarantine absolute paths, parent traversal, drive/UNC paths, NUL/control names, symlink entries, unsupported encryption/compression, and normalized-name collisions. Do not directly extract untrusted entries into the library. Stream selected bytes into an application-owned fresh staging area using an API that prevents following links; verify hashes, byte counts, and CRC while reading. A ZIP library's “enclosed name”/sanitized-name helper alone is not a security boundary: zip-rs had a real symlink-redirect traversal vulnerability in extraction, with versions <2.3.0 affected and 2.3.0 identified as patched [S18, S19].

Inventory missing references without substituting by basename. Preserve duplicate entries as separately selectable candidates and never overwrite one with another. Retain raw bytes for malformed text and identify invalid encoding, control characters, parser warnings, and source location. The Aegisub issue report about invisible leading Unicode is one non-normative parser failure, not a universal guarantee, but it makes a useful adversarial fixture [S10].

Use a recoverable import session:
1. Inventory package, report safety and integrity findings, and resolve package-level profile/version.
2. Parse metadata and lightweight track manifests under bounded resource limits; show selectable clip/track/resource rows before full import.
3. Copy/parse selected items into per-session staging. Track item state as ready, warning, blocked, skipped, or incomplete.
4. On cancel, stop work promptly and retain a small recovery journal plus already completed staged items. A resume/retry is idempotent. Do not publish half-parsed objects as committed package content.
5. Commit chosen valid items atomically at item or package boundary, keeping unresolved references and original source objects visible. Never silently convert a missing file into an empty resource.

Do not execute scripts or automation contained in packages/subtitles; a crafted subtitle could trigger Automation code in a real authoring application before its 3.5.0 security fix [S09]. Do not resolve external URLs, remote media, or XML/resource references over the network. Any preview uses the already-supported playback layer; this component must not rewrite that engine.

### 4. Export preview and diagnostics

Before writing, build a dry-run export plan with:
- destination format/profile/version and package manifest version;
- selected clips/tracks/resources and item counts/byte totals;
- per-track target language/kind/label and target association;
- per-cue precision conversion, ordering, overlap, and layout/style mapping;
- included, copied-original, converted, preserved-only, omitted-with-consent, blocked, and unresolved items;
- each unsupported feature and its affected item/locator, with a concrete choice: export unchanged source alongside derivative, choose a richer target, omit only after explicit confirmation, or cancel.

Export into a new destination. Never overwrite an original source. Provide original file retention or a bundled originals folder when conversion is lossy. The export receipt should include output hashes, mapping profile/version, and an item-by-item warning summary. A second stage review can decide whether source originals must always be embedded or may be retained by reference; until that policy is chosen, package export should include the original bytes.

The preview should show a clip player using the existing media backend, subtitle/transcript tracks and language picker, visible overlap on a timeline, cue text with structured formatting, clip/track/resource association, and source-vs-export rendering. Diagnostics should link a finding to package item, archive path, parser location/time range, consequence, and safe next action. Avoid a single “import failed” toast for all cases.

### 5. Future validation proposals and current execution record

Proposed future checks, separate from research observations:
- Golden import/export fixtures from the actual teacher tool/version roster, with exact source files, checksums, expected package graphs, and semantic round-trip comparisons at each format's precision.
- Per-format fixtures for overlapping cues, equal starts, out-of-order inputs, zero/negative/long durations, frame-rate/timeBase variations, cue language/kind, ruby/voice/spans, TTML profiles/style inheritance, ASS font/resolution/position/override tags, WebVTT regions, malformed encodings/BOM/invisible controls, duplicate names, missing files, Unicode normalization, and same-basename attachments.
- Adversarial archive tests for traversal, absolute/drive paths, symlink chains, duplicate central-directory names, malformed central/local headers, CRC errors, oversized expansion/ratios, huge entry counts, unsupported codecs/encryption, and no network or script execution. Assert every accepted write stays within a fresh stage and every rejection leaves the library unchanged.
- Cancellation/crash injection during inventory, staging, parsing, preview, and commit; verify idempotent recovery, no partial published object, and preservation of completed staged work.
- Export dry-run acceptance tests: unsupported-field matrix must be complete; a lossy export cannot proceed without a visible, acknowledged choice; original hashes remain unchanged.
- UI accessibility/usability review for selecting tracks, understanding language/kind/default differences, finding overlap/missing-resource diagnostics, cancelling, and resuming.

Executed in this stage: actual native Goal activation and the exact-goal binding guard passed; primary sources above were browsed. No code, downloaded source, sample package, format conversion, app build, or product validation test was executed. The assigned plan-release helper and plan-specific adjudication are separate next steps.

## Open product facts

The brief does not provide the exact authoring-tool roster and versions, representative files, target export formats, required TTML/ASS feature subsets, playback library, schema ownership/versioning policy, maximum package size/count, recovery retention period, or whether originals must be embedded in every export. The plan review must retain these as explicit unknowns or owner decisions; adapters and limits should not be frozen until actual examples and targets are known.