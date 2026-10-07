# I-METHOD-04 — Community oral-history ingest desk
## Researcher’s complete proposed change

**Stage:** researcher deliverable. This is a proposed sandbox plan, not an implementation or quality claim. It keeps the brief’s P1–P6 scope: one archivist, no more than 100 files per batch, and no transcription or public publishing. Rights decisions remain with the archivist; this is not legal advice.

**Research record:** first useful finding saved at 2026-10-07T19:41:23Z. Complete draft saved at 2026-10-07T19:56:58Z. Source operation counts and native observations are recorded in [source-map.json](./source-map.json).

## Proposed revised sandbox plan

### P1 — Batch capture

The archivist selects WAV/BWF, FLAC, and MP3 files from a removable drive and chooses a destination for one accession batch. Before copying, the desk checks destination space, readability, duplicate/normalized path collisions, unsupported names, and whether the source is still available. Preserve the source relative-path and filename strings in the package record. If the destination filesystem cannot represent one exactly, stop for an explicit resolution or use a collision-safe stored name with a reversible mapping; never silently discard or replace a name.

Copy each source byte-for-byte into a new accession staging area; never edit, move, or delete the removable-drive source. Compute SHA-256 over the source bytes and independently re-read and hash the copied bytes. Compare hashes and byte counts before marking that item complete. Write to a temporary per-file name and promote it only after verification. A failed or interrupted item stays visibly incomplete; it cannot be represented as a finished package original. Keep per-file states for queued, copying, verified, failed, and cancelled, with a batch summary.

This strengthens P1’s preservation-copy requirement with explicit source/destination fixity and collision handling. BagIt’s payload manifest model is a useful packaging fit for byte-oriented files [S10]; Archivematica provides a broader workflow analogy with supplied-checksum verification, file identifiers, preserved transfer order, and a transfer-structure report [S01].

### P2 — Inspection

Show a batch table with original path, file size, format/codec, duration, sample rate, sample representation where available, channel count/layout, technical metadata, BWF fields where present, copy/hash state, and validation warnings. Show parsed observations as read-only. Keep accession notes and archivist corrections in sidecar metadata, separate from source media and its embedded fields. A waveform/listen view supports spot inspection; it does not imply a full listening review or speech transcription.

Use FFprobe’s machine-readable format and stream outputs as a candidate for technical characterization [S09]. Treat omitted or invalid fields as unknown, not zero or valid. For WAV/BWF, offer an optional specialist validation view based on BWF MetaEdit’s supported field/rule scope and the FADGI embedding guidance [S03, S04]. That optional tool is limited to WAV/BWF and should operate on the copied package item only when the archivist explicitly chooses a metadata edit. Its audio-data MD5 is not whole-file fixity: retain package-level SHA-256 independently [S04, S10].

### P3 — Listening derivatives

Retain the explicit per-batch/per-file opt-in and transformation preview in frozen P3. Before full processing, show the selected input stream, target codec, bitrate or quality setting, sample-rate/channel policy, metadata policy, output location, and estimated size; permit a short synthetic or user-selected preview. Do not infer a stream automatically. FFmpeg documents that automatic selection may choose an audio stream with the most channels, and that global metadata is copied by default; require explicit stream mapping and explicit metadata mapping [S09].

Initial product proposal: MP3 via a pinned FFmpeg build with libmp3lame enabled as the broad-listening candidate, preserving channels and sample rate by default. Offer FLAC and PCM WAV as alternatives where lossless output or receiver needs justify the larger files. Warn when an MP3 source is re-encoded. The default bitrate, channel downmix rules, and curated derivative tags remain archivist/product decisions and must be settled with synthetic listening tests; these are not preservation-quality claims. Record the exact tool version/build, normalized parameters, input/output IDs and hashes, start/end times, and per-item outcome.

Write to a temporary derivative path, then probe/decode the output and hash it before promotion. A failed, cancelled, or truncated conversion remains marked as such and cannot be mistaken for a valid derivative. Never overwrite the source or an existing derivative.

### P4 — Package and provenance

Use a BagIt-compatible accession directory as the initial package proposal: a payload directory for copied originals and requested derivatives; SHA-256 payload manifest(s); and tag files for batch identity, original-path mapping, per-file observations, derivative settings/references, and the operation journal. Seal tag files with a tag manifest. BagIt gives completeness and checksum validation but does not define the meaning of oral-history events [S10].

Record each operation as a small JSON event with an identifier, event type, UTC time, input/output file identifiers, relevant hashes, tool/version/settings, and outcome/error. This is PREMIS-inspired, not a claim of PREMIS conformance; PREMIS 3.0’s event entity supplies the useful identity/type/time, outcome, agent, and object-link concepts [S11]. Reopening a package must verify both manifests and report missing, changed, extra, or unreadable items. Never silently repair or regenerate a mismatching manifest; show the mismatch and preserve evidence.

Finalize a batch only after all selected originals are verified and required metadata/manifests are written. Keep cancelled/failed staging inspectable with its status. Package directories remain ordinary files/directories so an archivist can copy them offline.

### P5 — Components and environment

Keep all ingest, inspection, packaging, and conversion local and usable offline on Windows and Linux. No runtime download, upload, transcription service, public publishing, or automated rights decision. Pin and display every parser/encoder/package-tool version; choose either bundled offline binaries or an archivist-configured executable path before implementation. Do not claim that a version inspected here has been selected for shipping.

FFprobe/FFmpeg is the candidate for cross-format probing and opt-in derivatives, subject to the codec/build and platform validation above [S09]. BWF MetaEdit is a narrow WAV/BWF review/edit alternative, not the whole application: its source shows a file-targeted metadata save path, and its documented checksum covers the audio data chunk rather than the whole RIFF file [S04, S05]. Never call a metadata editor against removable-drive originals. Archivematica’s transfer stages are useful workflow patterns, but the whole preservation system is outside this offline, single-archivist desk’s intended component scope [S01].

### P6 — Acceptance proposals

All checks below are proposals; none was executed on an application in this research stage.

1. **Copy and interruption:** use synthetic nested WAV/BWF, FLAC, and MP3 files. Compare source and copied byte counts and SHA-256; confirm relative paths and exact filename mappings; interrupt at several copy points and verify incomplete items cannot finalize.
2. **Source protection:** make test sources read-only where supported, compare their hashes before/after ingest and derivative creation, and verify all embedded fields remain unchanged unless a separately confirmed edit targets only a package copy.
3. **Names and collisions:** test repeated basenames in different folders, case-only collisions, reserved characters, long paths, Unicode names, symlinks, unreadable files, disconnected drives, and full destinations on Windows and Linux. Require explicit disposition for ambiguous output names.
4. **Inspection:** use synthetic valid and malformed RIFF/BWF chunks, FLAC, MP3, multiple audio streams, and unusual channel layouts. Confirm absent/invalid metadata is presented as unknown or warning, not silently normalized. Confirm user notes never appear as embedded source edits.
5. **Derivative:** test mono, stereo, multichannel, unusual rates, and a lossy MP3 source. Assert explicit stream choice, channel/rate behavior, metadata policy, output decodability, duration tolerance, source preservation, recorded tool/settings/hash, and a visible failed/cancelled status when conversion is interrupted. Include a listening comparison with an archivist for each offered preset.
6. **Package fixity:** validate a completed BagIt package, then independently alter, delete, rename, and add payload and tag files. Confirm reopen detects every case and never silently rewrites a manifest. Test unsafe manifest paths and reject traversal outside the package boundary.
7. **Batch and offline:** process the supported maximum of 100 synthetic files with mixed sizes; record elapsed time and memory as product measurements, not assumed capacities. Block network access and confirm the workflow completes without network calls. Run the same fixtures and checks on supported Windows/Linux builds.

## P1–P6 comparison and disposition

| Frozen decision | Disposition | Proposed change and applicability |
|---|---|---|
| P1 Batch capture | Retain and strengthen | Preserve byte-for-byte originals and relative names; add per-file SHA-256 comparison, staged promotion, path collision handling, and interruption state. Archivematica and BagIt support these workflow/package mechanisms [S01, S10]. |
| P2 Inspection | Retain; choose candidate probe | Keep duration, channels, encoding, embedded metadata, notes, and spot listening. Use a read-only FFprobe JSON probe candidate plus BWF-specific validation only for WAV/BWF. Separate full-file SHA-256 from embedded audio-data MD5 [S02, S04, S09]. |
| P3 Derivatives | Retain; make execution explicit | Keep opt-in and preview. Add explicit stream/metadata policy, temporary outputs, post-conversion probe/decode, full provenance, and per-file failure state. FFmpeg’s documented defaults make explicit mapping necessary [S09]. Default codec/bitrate remains a product decision. |
| P4 Packaging | Adopt BagIt-compatible folder | Keep originals, derivative references, provenance, fixity, and settings. Add SHA-256 payload/tag manifests and a PREMIS-inspired event sidecar; validate on reopen. BagIt validates bytes, not event semantics [S10, S11]. |
| P5 Components/environment | Retain constraints; narrow choices | Offline Windows/Linux, no uploads, and no metadata changes for display remain. FFprobe/FFmpeg and optional BWF MetaEdit are candidates; exact supported release/build and packaging choice await validation [S05, S09]. |
| P6 Acceptance | Retain and expand | Preserve the five original synthetic themes (interrupted copy, malformed metadata, unusual channel layouts, encoding conversion, package fixity); add source immutability, collisions, cancellation, manifest path safety, 100-file batch, and offline checks. All are proposed only. |

The supplied plan has no more detailed P1–P6 cross-reference in this bounded slice. This review does not infer coverage elsewhere.

## Research findings, alternatives, and history

**O1 — Discovery from the brief.** Archivematica’s transfer documentation models checksum verification, item identifiers, original order, and structure reports; its broad preservation workflow is not a fit to import wholesale into this offline desktop scope [S01]. BWF MetaEdit supports WAV/BWF metadata inspection, rule validation, batch export, and audio-data MD5, making it a narrow optional specialist tool rather than a cross-format ingest engine [S03–S05]. FADGI v3 guidance addresses BEXT, INFO, cue, and ADTL metadata and organization/item identifiers, but applies to embedded Broadcast WAVE metadata, not to every FLAC/MP3 item or the archivist’s full accession notes [S03]. The Library of Congress format description reports BWF/LPCM as an archival-master choice in particular units; it does not establish a universal conversion rule for this desk [S02]. BagIt gives a direct filesystem payload and checksum-manifest pattern; PREMIS provides a richer event vocabulary without requiring this small desk to claim repository conformance [S10, S11].

**O2 — Pinned code and governing context.** I inspected BWF MetaEdit v20.05 at full commit 43e603dc93108f7075ad91fa83c5802f18ef2ae2, including its RIFF handler, CriticalSection definition, GUI save caller, and Core worker. Riff_Handler::Save holds its handler CriticalSection, writes through the current file’s RIFF object, then reopens the named result for structural validation; Get and Set are also locked [S05]. ZenLib’s CriticalSectionLocker enters on construction and leaves on destruction. The GUI’s Save All path starts a threaded worker; Core::Entry advances the save loop and Batch_Launch_Write calls the per-file Riff_Handler::Save. This establishes that the fix is relevant to shared per-file state during UI/batch save. It does not establish safe editing of removable originals, whole-file SHA-256, cross-format support, or 100-file performance. The save path targets the opened filename, so this proposal requires copies before any specialist metadata edit [S05].

**O3 — Real issue, fix, regression evidence, release.** BWF MetaEdit issue #71 reports intermittent crashes while saving metadata changes across thousands of WAV files; the report itself says the exact trigger was uncertain [S06]. PR #112 explicitly fixes #71 by adding a per-handler CriticalSection and locked/internal helper pairs in Riff_Handler.cpp/h; the patch touches those two files [S07]. A maintainer asked the reporter to try a 2020-04-24 snapshot; on 2020-04-26 the reporter said the error appeared fixed. That is real manual regression evidence, not an automated regression test. Release v20.05, published 2020-05-28, lists the large-save crash fix for Issue #71; the inspected v20.05 commit contains the repair [S08, S05]. Applicability is limited: the issue’s reported 10,020-file WAV metadata edit differs from this app’s maximum 100-file ingest/copy/convert batch. It supports per-file synchronization and explicit regression coverage, not a claim that the reported product or our proposed workflow meets a throughput target.

**O4 — Full plan comparison.** Every supplied P1–P6 decision is dispositioned in the table above. Retained matters include all three input formats, original preservation, separate observations/notes, opt-in derivative preview, offline Windows/Linux, and synthetic checks. Necessary additions are copy and package fixity, robust path mapping, explicit stream/metadata policy, auditable per-file outcomes, and reopen verification. The source-defined scope limits are called out rather than generalized.

**O5 — Criticism.** Pending the coordinator’s fresh same-family critic. No critic artifact or criticism was supplied to this researcher, so no critique or disposition is invented. The final artifact must preserve every critic objection and its resolution or mark it unresolved.

**O6 — Complete proposal.** The revised P1–P6 sections above form the proposed change artifact, with rationale, source references, alternatives, outstanding choices, and validations.

### Rejected leads and unresolved choices

- Do not adopt all of Archivematica: reuse its transfer/fixity patterns, but its full preservation system is broader than one offline archivist’s batch desk [S01].
- Do not use BWF MetaEdit as the sole inspector or ingest engine: its BWF-specific coverage is narrow, its target-file save path is an explicit-edit mechanism, and audio-data MD5 is not package-file fixity [S04, S05].
- Do not rely on FFmpeg automatic stream selection or metadata defaults; the documented behavior can select a different channel layout or copy input tags [S09].
- Decide whether derivative default is MP3 or FLAC/PCM, target bitrate/quality, downmix policy, curated tags, exact FFmpeg release/build, and bundled versus configured offline tools. The 7.1.1 source inspected here is a pinned research snapshot, not a shipping recommendation.
- Decide how much BWF rule validation the desk owns versus an optional BWF MetaEdit workflow. The FADGI guidelines do not define a universal rule for all input types [S03].
- Validate Windows filename limitations, removable-media interruption behavior, large-file copy costs, and whether a JSON event sidecar is enough or formal PREMIS serialization is required. Current evidence does not settle these.
- No criticism, implementation, build, conversion, BagIt validation, or cross-platform check was executed. The source/version review is documentary and code-reading evidence only.
