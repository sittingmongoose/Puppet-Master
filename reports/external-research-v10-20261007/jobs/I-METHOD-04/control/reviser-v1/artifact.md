# I-METHOD-04 — Community oral-history ingest desk
## Complete revised proposed change

**Stage:** control/reviser-v1. This is a complete sandbox proposal, not an implementation, validation result, legal opinion, or quality claim. It covers the inherited O1–O6 research obligations and complete P1–P6 plan. Product scope remains one archivist, no more than 100 files per batch, and no transcription or public publishing. Rights decisions remain with the archivist.

**Research record:** first useful finding saved at 2026-10-07T20:11:44Z; complete revised artifact saved at the time recorded in source-map.json. Evidence and predecessor identities, host-computed hashes, source operations, and native Goal observations are recorded in source-map.json.

## Proposed change

### P1 — Batch capture and preservation copy

The archivist selects WAV/BWF, FLAC, and MP3 files from a removable drive and chooses a destination for one accession batch. Before copying, inspect destination availability and free space, source readability, duplicate names and normalized-path collisions, unsupported names, and whether each source is still available. The existing limit remains 100 files per batch. Because file count does not bound storage or runtime, measure the selected byte total and available destination space and fail early with an actionable message if the batch cannot fit. A numeric byte ceiling remains a product decision; do not invent one.

Record each source’s relative path and original filename. If the destination cannot represent a name exactly, stop for an explicit resolution or use a collision-safe stored name with a reversible mapping. Never silently discard, merge, or replace a name. Check case-only and Unicode-normalization collisions before promotion.

For each item, capture available file identity, size, and modification metadata before copying. Stream source bytes into a temporary per-file staging path while computing SHA-256 and byte count. Recheck source identity/size/metadata after the read; treat disappearance, read error, or a changed source as failure. Independently reopen and hash the staged destination, then compare its byte count and digest with the bytes read from the source. Promote only a complete, matching item. A failed or interrupted item remains visibly incomplete and is never represented as a finished package original. The removable-drive source is never edited, moved, or deleted.

Persist per-item and batch state so restart after a process or power interruption can distinguish verified content from a stale status record. On restart, revalidate any item whose durable state does not prove that the promoted bytes and recorded verification refer to the same staged object. Keep queued, copying, verified, failed, and cancelled states with a batch summary. This proposal does not claim that metadata checks detect every possible in-place source mutation; the acceptance plan includes source-change and ejection cases.

The frozen P1 already covers copying rather than moving originals, fixity, filenames, and relative folders, according to the supplied critic. Retain those requirements. Add explicit source-versus-copy byte/hash comparison, staged promotion, collision handling, failure visibility, and durable recovery.

### P2 — Inspection and notes

Show a batch table with original path, file size, format and codec, duration, sample rate, sample representation where available, channel count/layout, technical metadata, BWF fields where present, copy/hash state, and validation warnings. Use a candidate read-only FFprobe JSON probe for technical characterization. A field omitted or invalid in the probe is unknown or a warning, not zero or valid by default; a probe result is not a guarantee that every field is present or semantically reliable.

Keep parsed observations read-only. Store accession notes and archivist corrections in sidecar metadata, separate from the source media and its embedded fields. A waveform or listen view supports spot inspection; it does not imply a full listening review or speech transcription.

Offer optional BWF-specific field/rule review only for WAV/BWF. FADGI’s cited guidance concerns embedded Broadcast WAVE fields and organization/item identifiers; it does not define universal rules for FLAC, MP3, or full accession notes. BWF MetaEdit is a narrow candidate, not the cross-format inspector or ingest engine. Its documented embedded MD5 applies to the WAVE data chunk/audio bitstream, not whole-file RIFF fixity, so keep package-level full-file hashes independently.

No embedded edit may overwrite the byte-identical ingest original. Default corrections are sidecar-only. If product owners choose an embedded correction, write a separately identified metadata-enriched rendition derived from the immutable ingest original. Record source and output IDs, before/after full-file hashes, settings, time, and outcome; never replace the original. Create final manifests only after the rendition set is fixed. Whether this optional rendition workflow is needed remains a product decision.

### P3 — Listening derivatives

Keep explicit per-batch or per-file opt-in and a transformation preview. Before processing, show the chosen input stream, target codec, bitrate or quality setting, sample-rate/channel policy, metadata policy, output location, and estimated size. Permit a short synthetic or user-selected preview. Do not infer the stream automatically.

Use explicit stream mapping and explicit metadata mapping. The inspected FFmpeg documentation says automatic selection may choose the audio stream with the most channels and that global metadata is copied by default; manual mapping avoids silently inheriting those choices. Warn when an MP3 source is re-encoded. Record exact tool version/build, normalized parameters, input/output IDs and hashes, start/end times, and per-item outcome.

MP3, FLAC, and PCM WAV remain offered alternatives, not a universal default. The pinned FFmpeg n7.1.1 libmp3lame wrapper advertises only mono and stereo layouts and nine supported sample rates: 8,000, 11,025, 12,000, 16,000, 22,050, 24,000, 32,000, 44,100, and 48,000 Hz. Therefore the researcher’s “preserve channels and sample rate by default” statement cannot apply to every accepted source when MP3 is selected. Before conversion of an incompatible layout or rate, require a deliberate choice: refuse with an actionable explanation, select an alternate format, or explicitly confirm downmixing/resampling and its parameters. Do not allow a preview or FFmpeg negotiation to make that choice silently. “MP3 broadly listenable” remains an unvalidated product hypothesis, not a compatibility finding.

The default codec, bitrate/quality, downmix rules, resampling rules, and curated derivative tags remain archivist/product decisions. Resolve them with synthetic conversion and listening checks before selecting a shipping preset. Write each derivative to a temporary path, then probe/decode and hash it before promotion. A failed, cancelled, or truncated conversion remains visibly failed and cannot be mistaken for a valid derivative. Never overwrite the source or an existing derivative.

### P4 — Package and provenance

Use a BagIt-compatible accession directory as a conditional initial serialization proposal, subject to the Windows/Linux conformance and error-path checks in P6. Keep ordinary files and directories so the archivist can copy the package offline. Include verified originals and requested renditions under the payload, plus tag files for batch identity, original-path mapping, per-file observations, derivative settings/references, and the operation journal. BagIt supplies payload/tag manifests and byte/path validation; it does not define oral-history event semantics.

Use SHA-512 as the proposed default for BagIt payload and tag manifests, following RFC 8493’s recommendation for new bags. Keep the P1 SHA-256 source-versus-staging comparison as a separate copy verification unless implementation owners choose one documented hash policy for both jobs. Every payload file must be listed in each BagIt payload manifest; every tag file must be covered by the tag manifest. Treat BagIt checksums as corruption detection, not active-attack protection.

Record each operation as a small JSON event with an identifier, event type, UTC time, input/output file identifiers, relevant hashes, tool/version/settings, and outcome/error. This is PREMIS-inspired, not a claim of PREMIS conformance. PREMIS’s event entity supplies useful identity/type/time, outcome, agent, and object-link concepts; formal PREMIS serialization is not selected.

Use one manifest lifecycle: mutable staging; optional renditions and sidecars complete; payload/tag manifests generated; package validated; then package sealed/read-only. A post-seal change must be reported and handled through an explicit new-version/reseal action. Never silently repair or regenerate a mismatching manifest. Reopening a package must report missing, changed, extra, or unreadable files and reject unsafe paths that escape the package boundary. BagIt itself requires path safety checks and calls out traversal, drive-letter namespaces, case collisions, and Unicode-normalization differences; the implementation should preserve source-name identity through reversible mappings.

The frozen P4 already requires originals, derivative references, provenance, fixity, settings, and visible change/missing-content checks according to the supplied critic. Retain those product requirements. BagIt is a proposed interoperable serialization mechanism, not a newly discovered package requirement.

### P5 — Components and environment

Keep ingest, inspection, packaging, and conversion local and usable offline on Windows and Linux. No runtime download, upload, transcription service, public publishing, or automated rights decision. Pin and display each parser, encoder, and package-tool version in an implemented build, but treat all inspected versions here as research snapshots rather than selected shipping versions. Choose bundled offline binaries or an archivist-configured executable path only after platform, licensing, packaging, and codec/build validation; the current evidence does not settle that choice.

FFprobe/FFmpeg remain candidates for cross-format probing and opt-in derivatives. BWF MetaEdit remains a narrow optional WAV/BWF review or separate-rendition editor, never a display-only editor of the immutable ingest original. Archivematica supplies useful transfer patterns but its broader preservation system is outside the intended single-archivist offline desk.

Offline operation limits network exposure, but does not answer where sensitive interviews are stored, which local permissions apply, how temporary files are cleaned up, or how loss of a local drive is handled. Decide whether these are product requirements or later product choices. Do not imply a legal or security assessment.

### P6 — Acceptance proposals

The checks below are proposals only. None was executed on an application in this research stage.

1. **Copy, mutation, and recovery:** use synthetic nested WAV/BWF, FLAC, and MP3 files. Compare streamed source and copied byte counts/SHA-256; confirm relative paths and exact filename mappings; eject or change a source during copy; interrupt at several durable transitions; restart after process/power interruption; verify changed, missing, incomplete, or stale-state items cannot finalize.
2. **Source protection and metadata:** make test sources read-only where supported; compare their hashes before and after ingest and derivative creation. Confirm parsed inspection and notes do not alter embedded source fields. If embedded corrections are supported, verify they create a separately identified rendition with source/output IDs, hashes, event record, and correct manifest sequencing while the ingest original remains unchanged.
3. **Names, paths, and capacity:** test repeated basenames in different folders, case-only collisions, NFC/NFD Unicode-equivalent names, reserved characters, long paths, symlinks, unreadable files, disconnected drives, and full destinations on Windows and Linux. Require explicit disposition for ambiguous names and verify reversible source-path mapping. Exercise BagIt traversal, absolute-path, drive-letter, and namespace rejection. Measure selected byte totals and available storage; fail early when the batch cannot fit. Do not assert a numeric capacity until product owners set one.
4. **Inspection:** use synthetic valid and malformed RIFF/BWF chunks, FLAC, MP3, multiple audio streams, and unusual channel layouts. Confirm absent/invalid metadata is unknown or a warning, not silently normalized. Confirm user notes never appear as embedded source edits.
5. **Derivative behavior:** test mono, stereo, multichannel, supported and unsupported rates, and a lossy MP3 source. Assert explicit stream choice, channel/rate behavior, metadata policy, output decodability, duration tolerance, source preservation, recorded tool/settings/hash, and visible failure/cancellation on interruption. For MP3-ineligible inputs require the selected explicit outcome: refusal, alternate format, or confirmed downmix/resampling. Include an archivist listening comparison for each offered preset. Add a concurrency regression/stress case for the cited BWF MetaEdit save path only if that candidate is used.
6. **Package fixity and lifecycle:** validate a completed BagIt package, then independently alter, delete, rename, and add payload and tag files. Confirm reopen detects each mismatch and never silently rewrites a manifest. Verify SHA-512 manifests, safe paths, complete payload listings, post-seal change reporting, and explicit new-version/reseal behavior on both operating systems.
7. **Batch and offline:** process the supported maximum of 100 synthetic files with mixed sizes; measure elapsed time and memory as product results, not assumed capacities. Include a batch that exceeds available space and confirm fail-fast behavior. Block network access and confirm the workflow completes without network calls. Run the same fixtures and checks on supported Windows/Linux builds.

## O1–O6 research obligations and dispositions

### O1 — Discovery from the brief

The captured sources support a set of useful patterns rather than one complete product. Archivematica documents transfer checksum verification, item identifiers, preserved order, and transfer-structure reporting; reuse those patterns without importing its whole preservation workflow. BagIt provides a direct filesystem payload and checksum-manifest model. PREMIS supplies a richer event vocabulary without requiring this desk to claim repository conformance. BWF MetaEdit and FADGI address a narrower WAV/BWF metadata workflow. The Library of Congress BWF description gives unit-specific archival-master examples, not a universal conversion rule for this desk. No single cited component supplies the complete offline ingest desk.

The BWF MetaEdit MD5 is for the WAVE data chunk/audio bitstream, not full-file RIFF fixity. The FADGI v3 guidance applies to embedded Broadcast WAVE fields, not every FLAC/MP3 item or the archivist’s complete accession notes. Keep package-level SHA fixity independent. [Archivematica transfer](sources/archivematica-1.17-transfer.html), [BagIt RFC 8493](sources/bagit-rfc8493.html), [PREMIS 3.0](sources/premis-v3.0.pdf), [BWF MetaEdit overview](sources/loc-bwf-metaedit-overview.html), [FADGI v3](sources/bwf-fadgi-guideline-v3.pdf), [Library of Congress BWF description](sources/loc-bwf-fdd000356.html).

### O2 — Pinned code and governing context

The researcher inspected BWF MetaEdit v20.05 at commit 43e603dc93108f7075ad91fa83c5802f18ef2ae2. The captured Riff_Handler source stores the opened path and saves/reopens that same named file; public open/save/get/set paths use the handler CriticalSection, whose locker enters on construction and leaves on destruction. Captured GUI/Core callers show Save All using a threaded worker and per-file handler saves. This supports the narrow conclusion that the repair serializes access to per-handler state on those paths. It does not make BWF MetaEdit an ingest engine, full-file SHA mechanism, cross-format inspector, safe editor for the immutable original, or evidence of 100-file performance.

The critic added and the reviser checked the pinned FFmpeg n7.1.1 libmp3lame implementation at commit db69d06eeeab4f46da15030a80d539efb4503ca8. Its rate and layout declarations are the source-backed reason MP3 cannot preserve every accepted source layout/rate. FFmpeg CLI documentation supports manual stream mapping and explicit metadata mapping; FFprobe JSON is a candidate observation format, not proof every field exists or is semantically reliable. [BWF Riff_Handler](sources/bwf-release-riff-handler.cpp), [CriticalSection definition](sources/bwf-release-critical-section.h), [Core caller](sources/bwf-release-Source-Common-Core-cpp), [GUI Save All caller](sources/bwf-release-Source-GUI-Qt-GUI_Main_Menu-cpp), [per-file save caller](sources/bwf-release-gui-main-perfile.cpp), [FFmpeg libmp3lame implementation](sources/ffmpeg-7.1.1-libmp3lame.c), [FFmpeg CLI documentation](sources/ffmpeg-7.1.1-commit-cli-doc.texi), [FFprobe documentation](sources/ffmpeg-7.1.1-commit-ffprobe-doc.texi).

### O3 — Real issue, fix, regression evidence, and release

BWF MetaEdit issue #71 reports intermittent crashes while applying CSV metadata changes across 10,020 WAV files; the reporter said the trigger was uncertain. PR #112 links the fix to the issue and adds per-handler locking in Riff_Handler.cpp/.h. The reporter later said a supplied snapshot appeared to fix the error, but that rerun changed more than one variable. The patch did not add an automated test. Release v20.05 lists the large-save crash fix, and the inspected release commit contains the repair. Treat this as manual regression evidence plus release applicability, not a controlled reproduction, automated regression, throughput result, or reliability proof. The reported 10,020-file metadata edit differs materially from this desk’s maximum 100-file ingest/copy/derivative batch. If BWF MetaEdit remains a candidate, add the conditional concurrency regression in P6. [Issue #71](sources/bwf-issue-71.html), [PR #112](sources/bwf-pr-112.html), [repair patch](sources/bwf-fix-112.patch), [v20.05 release](sources/bwf-release-20.05.html), [release history](sources/bwf-release-history-gui.txt).

### O4 — Full supplied-plan comparison

| Frozen decision | Status already covered in the supplied review | Final disposition |
|---|---|---|
| P1 — Batch capture | Copying originals, fixity, filenames, and relative folders are already baseline requirements, according to the critic. | Retain and strengthen with streamed source hash/count, destination reread, changed-source failure, durable recovery state, and explicit path collisions. |
| P2 — Inspection | Read-only parsed observations, separated sidecar notes/corrections, and cautious handling of absent/invalid fields are already covered. | Retain. Reject edits to the immutable ingest original. Default to sidecars; allow a separately identified metadata rendition only as an unresolved product choice with hashes/events and later manifest generation. |
| P3 — Derivatives | Opt-in and preview are already covered. | Retain. Reject universal MP3/channel/rate-preservation default. Require explicit stream and metadata policy and a visible choice for unsupported MP3 layouts/rates. Codec, rate, bitrate, downmix, resample, and tags remain open. |
| P4 — Packaging | Originals, derivative references, provenance, fixity, settings, and visible change/missing-content checks are already required. | Retain. Adopt BagIt conditionally as serialization, not as a new package requirement. Use SHA-512 as the proposed BagIt default, and stage, manifest, validate, then seal. |
| P5 — Components/environment | Offline Windows/Linux, no upload, and no metadata edit merely for display are already covered. | Retain. FFmpeg/FFprobe and BWF MetaEdit remain candidates, not selected shipping builds. Storage/privacy, permissions, temp-file handling, and lost-media protection need product disposition. |
| P6 — Acceptance | Synthetic interruption, malformed metadata, unusual layouts, conversion, and package fixity themes are already present. | Retain all seven researcher test groups and add the exact mutation/restart, MP3 eligibility, rendition/manifest, NFC/NFD, BagIt path/lifecycle, capacity, cross-platform, and conditional concurrency witnesses above. All remain proposed. |

This comparison is limited to the supplied P1–P6 slice. It does not infer whole-project coverage or missing cross-references.

### O5 — Criticism register

| Criticism | Disposition in this complete revision |
|---|---|
| A source could disappear or change during copy; item state must survive restart. | Accepted in P1 and P6: capture available identity/size/metadata before and after, hash bytes while streaming, independently hash the destination, fail closed on changed/incomplete input, persist durable state, and revalidate uncertain items after restart. No claim is made that metadata checks detect every possible mutation. |
| Editing the only copied package item breaks the claim that it is the byte-identical ingest original. | Accepted. P2 preserves an immutable ingest original and uses sidecar corrections by default. Any embedded correction must become a separate identified rendition with source/output hashes and an event. P4 manifests follow the final rendition set. |
| MP3 cannot preserve every channel layout and rate under the inspected libmp3lame build. | Accepted and checked against the captured implementation. P3 removes the universal default and requires refusal, alternate format, or confirmed downmix/resampling before conversion. |
| “MP3 broadly listenable” was not established by docs. | Accepted as unresolved hypothesis. P3 requires synthetic conversion and archivist listening comparisons before any preset is selected. |
| BagIt SHA-512 default, manifest completeness, safe paths, and case/Unicode collisions were omitted. | Accepted. P4 proposes SHA-512 for BagIt manifests, complete payload/tag manifest lifecycle, and safe path handling. P6 adds BagIt conformance, traversal/drive-letter, case-only, and NFC/NFD tests. SHA-256 remains the separate P1 source/copy verification proposal. |
| The original plan already contains significant P1/P2/P4/P6 behavior; do not present it all as newly discovered. | Accepted in each P comparison row. The artifact distinguishes existing requirements from strengthening and serialization choices and makes no claim beyond the bounded plan. |
| BWF MetaEdit source/issue evidence is narrower than an ingest, fixity, safety, or performance claim. | Accepted in O2/O3 and P2/P5. The source supports locked per-handler state on inspected paths; issue #71 is manual/confounded regression evidence, not a test or throughput result. A product regression is conditional on selecting that tool. |
| Local/offline limits network exposure but not local storage, permissions, temp cleanup, or media-loss concerns. | Accepted as unresolved product requirements or choices in P5; no legal or security conclusion is inferred. |
| “100 files” does not bound storage or runtime. | Accepted. Measure selected bytes and free space and fail early if the batch cannot fit; do not invent a numeric byte cap. Measure elapsed time/memory in P6 as product results. |
| The researcher’s PREMIS, FADGI, LoC, and embedded MD5 scope must remain narrow. | Accepted in O1/P2/P4. PREMIS is inspiration, FADGI is BWF-specific, LoC examples are unit-specific, and embedded MD5 is not whole-file fixity. |
| None of the proposed checks or product behavior was executed. | Accepted. Every P6 item is labeled a proposal. This stage ran no application tests, build, conversion, package validation, or cross-platform check. |

### O6 — Complete proposal and validation status

P1–P6 above are the complete proposed change, with rationale, alternatives, plan comparison, critic dispositions, open choices, and acceptance proposals. It is not an amendment list or implementation patch. The plan retains the useful byte-oriented ingest, per-item state, sidecar notes, explicit derivative preview, offline constraints, candidate separation, BagIt/PREMIS distinction, and proposed-versus-executed validation labels. It adds the specific preservation and interoperability conditions the critic identified.

## Alternatives, rejected leads, and unresolved choices

- Reuse Archivematica’s checksum, identifier, ordering, and transfer-report patterns; do not import its whole preservation system into this small offline desk.
- Do not use BWF MetaEdit as the sole inspector or ingest engine. Its coverage is WAV/BWF-specific; its embedded MD5 concerns the audio data chunk; its save path targets the opened filename. Keep the ingest original immutable.
- Do not rely on FFmpeg automatic stream selection or default metadata copying. Use explicit mapping.
- Do not choose a universal MP3 default or silently downmix/resample. Preserve MP3, FLAC, and PCM WAV as options pending product choice and synthetic listening checks.
- Do not treat SHA-256 copy verification and BagIt’s recommended SHA-512 manifest default as conflicting claims: they serve separate proposed checks. Product owners may choose one documented implementation policy.
- Do not claim PREMIS conformance from a small JSON journal. Formal serialization remains unselected.
- Still unresolved: default derivative format and preset; eligible MP3 source layouts/rates; whether downmix/resampling is offered and with which parameters; whether embedded corrections need a separate rendition; exact offline tool builds and supported-platform matrix; bundled versus configured binaries; whether local storage, permissions, temporary-file cleanup, and lost-media protection are product requirements; whether a numeric batch byte cap is needed; and whether event JSON is sufficient or formal PREMIS is required.
- No criticism is rejected on factual grounds in this revision. Where product policy is undecided, the objection remains explicitly unresolved rather than being converted into an assumed choice.
- No evaluator key, score, SourcePASS, implementation outcome, or performance claim is inferred.
