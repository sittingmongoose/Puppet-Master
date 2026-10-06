# Ledgerline: offline review and edit exchange for an oral-history team (final proposal)

Stage: critic_final (V08 fresh critic plus complete final delivery). This file is the complete standalone proposal. It integrates an independent critique of the frozen research-stage draft (corrections C1-C5 below) and fresh capture and receipt evidence recorded in the sources.json and witnesses.json delivered alongside it. The optional critique record is out/critique/review.md.

Label legend used throughout:

- FACT: traceable to a pinned public source [Sxx] in sources.json.
- INFER: engineering inference from pinned facts; conditions stated.
- CHOICE: a product decision of this proposal; a bounded alternative is named where consequential.
- EXECUTED (FWx): candidate-authored check run in the admitted isolated sandbox during this stage; receipts in witnesses.json; isolated component checks only, never proof of whole-application behavior.
- ADOPTED (RWx): research-stage receipts adopted into the witness catalog with attribution; independently corroborated by FW1-FW3.
- PROPOSED/UNEXECUTED: planned validation; no receipt exists.

Corrections integrated from this stage's critique:

- C1 (numeric error fixed): the research draft under-sized the per-source waveform cache by a factor of about 52, using 6.7 M frames for 2 h at 48 kHz; the true count is 345,600,000. Corrected in 7.1; the design conclusion (the cache is trivially small) survives. Verified by FW3.
- C2 (behavior made explicit): display timecodes are nearest-millisecond values, so a position one frame before two hours displays as 02:00:00.000. Timecodes can therefore never be anchors. Now explicit in 5.3. Verified by FW2.
- C3 (validation sharpened): cache and manifest validators must be stricter than the audiowaveform precedent; upstream tolerates a declared-size mismatch (load returns true with a warning [S07]); Ledgerline treats every header, count, or size violation as fatal and rebuilds.
- C4 (new pins): libsndfile SFC_GET_BROADCAST_INFO and SFC_SET_BROADCAST_INFO are documented at docs version 1.2.2 (bext at command level), and SFC_RF64_AUTO_DOWNGRADE exists, so oversized exports must explicitly defeat silent downgrade to WAV [S19]; libsamplerate SRC_SINC_MEDIUM_QUALITY = 1 is documented at 97 dB SNR and 90 percent bandwidth [S20].
- C5 (design-relevant DSP fact): equal-power crossfades peak at 1.414 for in-phase full-scale inputs [FW4], making the export clipping census mandatory rather than cosmetic.

No research-stage finding was retracted.

## 1. Decision summary

Build Ledgerline as a single-user desktop workspace (four editors, one open project each, exchange by folder or portable bundle) around three contracts:

1. Media contract: sources are immutable, identified by SHA-256, opened read-only; raw foreign metadata is captured verbatim and ambiguity is flagged, never fixed silently (4.1).
2. Timeline contract: regions and transcript cues anchor in source sample positions; project positions and timecodes are derived, recomputed, and never the sole stored truth (5.2-5.3).
3. State-class contract: nondestructive edits, display-only view state, and rendered-audio export recipes are separate schemas; no render code path reads view state (2, 11.10).

The coherent component choice (bounded alternatives in 10.2): a pinned C audio core, libsndfile 1.2.2 for I/O and metadata and libsamplerate 0.2.2 for conversion, under a thin edit layer with a Qt (PySide6/Python 3.12) UI shell; per-source derived waveform caches; journal-then-rename manifest saves; tmp-then-rename exports in which a cancelled job can never be labeled complete.

## 2. Scope and minimum workflow

This is an editorial/research tool for offline recorded interviews: no streaming, broadcast, cloud, or simultaneous-editing obligation (those are opportunities, 10.1). Minimum workflow v1 must support end to end:

| Step | Required behavior |
|---|---|
| Import several long recordings | Read metadata, hash bytes, register source identity; mixed rates, channel counts, sample representations; typical project: one voice recording, one backup, environmental noise |
| Inspect metadata | Provenance inspector: header snapshot, captured foreign chunks, ambiguity flags (4.1) |
| Listen and scrub | Bounded windowed reads; sample-anchored seeking (7.4) |
| Add named regions and transcript cues | Region: named source-anchored span; cue: text anchored to a source sample (5) |
| Trim a passage | Nondestructive: clip boundaries move; source bytes untouched |
| Join selected clips with optional short transition | Butt join or 0-100 ms crossfade; parameters live in the edit command and export recipe (5.4) |
| Set preview gain | Monitor-only; never enters an export recipe or the render path (asserted by test 11.10) |
| Save, close, reopen | Atomic manifest saves; recovery of interrupted operations (8) |
| Export review mix plus cue table | Cancel leaves no complete export (7.3); cue table carries full source identity (5.5) |
| Originals unchanged | Sources opened read-only; only exports and bundle copies are written (4.1) |

Three state classes are kept permanently distinct (brief requirement):

1. Nondestructive edits: sources, clips (source range to project placement), regions, cues, channel plan; all positions are integers in their native domain.
2. Display-only settings: zoom, scroll, preview gain, solo/mute, colors, transcript font; separate file viewstate.json with its own schema version; the render path has no code that reads view state (asserted, 11.10).
3. Rendered audio operations: export recipes (format, rate, channels, export gain, crossfade parameters, clipping policy). Preview gain is excluded by construction; export gain defaults to 0 dB and is shown on the export dialog.

## 3. Support boundary (honest inputs and outputs)

Basis: libsndfile 1.2.2 format matrix and release [S11, S13], API semantics [S12, S19]; audiowaveform's own Opus and MP3 prerequisites corroborate the library's format reach [S03, S02].

Inputs v1 (opened read-only): WAV, AIFF, FLAC, Ogg/Vorbis, Ogg/Opus, MP3. libsndfile has read and written FLAC and Ogg/Vorbis since 1.0.18, Ogg/Opus since 1.0.29, and MP3 since 1.1.0 [S11], so the pinned 1.2.2 satisfies all. Sample representations: signed PCM 16/24/32 and 32-bit float; u-law and a-law accepted with a disclosure banner. Rates 8 kHz to 192 kHz; 1 to 8 channels with an explicit per-clip channel map (5.6); the library rejects channels above 1024 [S12], far beyond our boundary. Anything else (ADPCM variants, GSM, exotic headers) refuses at import with the library error text and offers an explicit transcode-copy into the bundle; never a silent guess; the original file is never modified.

Outputs v1: review mix as WAV 24-bit (primary), WAV 16-bit, or FLAC 24-bit, at a per-project rate (default 48 kHz, CHOICE). If the computed data-chunk size would exceed the 32-bit RIFF field (4,294,967,295 bytes), WAV export refuses and offers RF64. The 2 h, 48 kHz, 24-bit census: stereo 2,073,600,000 bytes (fits), 4-channel 4,147,200,000 (fits), 8-channel 8,294,400,000 (refused) [W3/RW3, FW3]. Because libsndfile documents SFC_RF64_AUTO_DOWNGRADE (auto downgrade from RF64 to WAV) [S19], the RF64 path must explicitly disable silent downgrade: oversize is a loud refusal or an explicit RF64 write, never an unannounced format change. Cue table: JSON (native, full fidelity) and TSV (human review); WebVTT export is an optional opportunity pending syntax pinning (10.1, L02).

Non-promises (brief: practical boundary, not every codec): no AAC/ALAC or Windows-media containers, no more than 8 channels, no 64-bit float output, no write-back into lossy sources, no recording devices in v1.

Sample-representation honesty: libsndfile normalizes integer PCM by the container MSB rule and reads floats normalized to [-1.0, 1.0]; reading float files through integer reads can silently return zeros unless SFC_SET_SCALE_FLOAT_INT_READ is set [S12 Notes 1-2]. The design fixes one internal domain (float32) and pins the read path in code review and tests so the trap cannot occur silently.

## 4. Data contract

### 4.1 Media registry (source identity)

Each imported recording gets a registry entry: source_id; original path (last seen); file size; SHA-256 of the file bytes, computed once at import in the same pass that builds the first waveform cache (progress and cancel shown); a format snapshot from the header (frames, rate, channels, format/subtype) [S12 SF_INFO]; raw bytes of every foreign chunk the library exposes, each with its own SHA-256 (the chunk API is documented as fail-safe retrieval of any and all chunks [S12]); parsed strings via sf_get_string with the utf-8 caveat for WAV and AIFF [S12]; and bext (Broadcast Wave) metadata at command level via SFC_GET_BROADCAST_INFO / SFC_SET_BROADCAST_INFO [S19].

Ambiguity flags (conflicting dates across chunk types, unsupported-but-captured chunks, u-law/a-law decode, lossy-input seek caveat) are display objects; original metadata bytes are retained verbatim; nothing is rewritten. Missing, contradictory, or unsupported metadata is retained and exposed; import never invents values. CHOICE: no write-back to sources ever; corrections re-link a new source revision (new hash, new registry entry; the old entry is retained).

### 4.2 Project container

CHOICE: folder bundle, project.ledger/: manifest.json (versioned project document; atomic save, 8), manifest.bak (two generations), viewstate.json (display-only), media/ (optional content-addressed copies), caches/ (per-source waveform files), exports/ (finished exports plus export records; temp files end .tmp), recovery/ (journals).

Named alternative kept available (10.2): a single-file SQLite container in the Audacity AU3 style. Audacity's own documentation shows the tradeoffs: one file openable only by the vendor application, undo history not saved with the project, WAL and SHM sidecars that must not be moved while open, and FAT/FAT32 destinations blocked because a single file easily exceeds 4 GB [S16]. For a four-editor exchange workflow the folder bundle keeps reviewable, diffable text at the center; SQLite's journal-then-commit discipline is still reused for save and recovery design [S17].

### 4.3 Exchange, relocation, missing media

The manifest references sources by sha256, last-seen path, and format snapshot. On open, sources resolve by path first; a path hit with a different hash is reported as changed media and is not auto-accepted (the registry keeps the old entry; the operator chooses re-link or keep-a-copy); otherwise the app scans declared search roots for a byte-identical file (hash match). Bundle modes: linked (paths only) or portable (media/ copies included); linked-to-portable conversion copies bytes into the bundle only. Missing media: the project opens in a degraded read-only review state listing affected timeline objects with last known provenance; no silent substitution. No code path ever writes outside the bundle or modifies an original.

## 5. Timeline contract: positions, cues, rounding, boundaries

### 5.1 Domains

- Source sample position s: integer, native to one source file at its own rate.
- Clip-local position: integer offset from the clip head within the selected source range.
- Project position p: integer frames at the project rate (default 48 kHz, CHOICE).
- Displayed timecode: derived, never stored as truth (5.3).
- Exported cue position: derived in the export domain by the same rule, always accompanied by source identity (5.5).

### 5.2 Mapping (all-integer, floor)

For a clip with source range [t, t+len) placed at project position q, with source rate Rsrc and project rate Rproj:

- p(s) = q + floor((s - t) * Rproj / Rsrc), for s in [t, t+len); otherwise the anchor is orphan.
- s(p) = t + floor((p - q) * Rsrc / Rproj), for p in [q, q+Lproj).
- Lproj = len * Rproj // Rsrc.

EXECUTED: at 1:1 rates this is exactly involutive and boundary-exact (trim start maps to the clip head, the final sample to the last project frame, one-past-end to the first orphan position) [FW1, RW1]. At 44.1 kHz to 48 kHz the two floor maps are not inverses: 4,516 of 4,547 probed samples fail exact roundtrip, and FW1 adds the exact structure: roundtrip succeeds if and only if the source offset is divisible by 147, which is 44100 divided by gcd(44100, 48000). Therefore cues and regions anchor in source samples (authoritative); project positions are derived and recomputed after every edit; a rate conversion, trim, inserted gap, or transition can move derived positions, never identity.

### 5.3 Rounding and boundary rules

- All edits (trims, splits, selection edges) snap to source samples at command creation; the UI may draw milliseconds, the stored command is integral; one rounding per command, at creation.
- Clip domains are half-open [start, end). A cue anchored at t maps to the clip head. A cue anchored at t+len (the exclusive end) is a boundary cue: it maps to the clip tail position, is flagged boundary, and at a butt join belongs to the earlier clip. It never silently slides onto different content.
- Trimmed-away anchors become visibly orphaned: the cue keeps its original source anchor, last valid mapping, clip id, and the revision of the edit that orphaned it; the transcript pane and cue table show an explicit orphaned state with a jump-to-nearest-surviving-content affordance. No automatic re-anchoring to different content, ever.
- Inserted gaps are project-domain objects (start and length at project rate) containing no source; cues cannot anchor inside a gap; attempts snap to the nearest clip edge with a recorded warning.
- A derived position inside a crossfade exports flagged in_transition with an accuracy note of plus or minus the crossfade length; source anchors remain exact.
- Display rule: ms = (p*1000 + rate//2) // rate (nearest millisecond, half up; negatives clamp to zero), formatted HH:MM:SS.mmm, integer math only; float seconds misformat (2.675 prints as 2.67) [FW2, RW2]. EXECUTED display property that matters editorially: a position one frame before two hours displays as 02:00:00.000 under nearest-ms rounding [FW2]; timecodes are claims about display, never anchors; sample positions resolve disputes.
- A computed duration is a claim about numbers, not about assembled content; render verification (11.2-11.3) is the evidence that content was assembled correctly.

### 5.4 Joins and transitions

A join is either butt (clip A's last frame followed by clip B's first) or a crossfade of D project frames (default 5 ms = 240 frames at 48 kHz; range 0-100 ms; equal-power cos/sin ramps; CHOICE). EXECUTED: equal-power ramp squares sum to 1 across the fade, and two in-phase full-scale inputs peak at 1.414 in the overlap [FW4], so the export clipping census is mandatory (7.2). Join lengths: butt = lenA + lenB; crossfade = lenA + lenB - D [FW4]. Crossfade parameters live in the edit command and export recipe (rendered operations); preview computes the same curves, so what is audited is what exports. Channel handling during joins follows 5.6.

### 5.5 Exported cue table (per cue)

cue_id; label; project timecode; project sample; export-domain position; source_id; source filename; source sha256; source rate; source sample anchor; clip_id; state (anchored, boundary, orphaned, or in_transition); provenance (editor, timestamp, originating edit revision). JSON and TSV export these fields verbatim. The next editor can always answer which audio a cue points at without trusting timecode arithmetic.

### 5.6 Channel mapping

Each clip carries an explicit table: source channel index to project bus (left, right, mono-center, or custom-named), or unassigned. Unassigning a channel is an explicit command in the undo history; nothing is dropped by default. Mono voice typically maps to both buses; a stereo backup maps left and right; the noise bed follows its track plan. If an export recipe requests fewer channels than the plan needs, export fails loudly: no silent downmix.

## 6. Architecture, precedents, and the investigated failure

### 6.1 Components

- EditModel: pure data plus inverse-command undo/redo (bounded depth 200, CHOICE); no audio code, no Qt types; fully unit-testable.
- MediaAccess: per-source libsndfile readers; windowed sf_seek plus sf_readf_float.
- WaveformCache: per-source derived pyramids (7.1).
- RenderService: cancellable chunked jobs (overview build, export mix).
- ProjectStore: manifest load/validate/save, bundle and recovery management.
- JobManager: worker threads with cooperative cancel flags and progress objects; heavy jobs never run on the UI thread.
- UI shell: Qt widgets (timeline, transcript pane, provenance inspector, keyboard map, 9).

CHOICE with bounded alternatives: the audio core is exactly the two pinned C libraries; language and UI are separable. Alternative A: a C++/Qt shell over the same pinned libraries if Python misses scrub targets on the reference laptop; every data contract unchanged. Alternative B: a GStreamer I/O layer if the format boundary must grow (L07); not selected because seek determinism and metadata capture are easier to audit against libsndfile's documented semantics [S12].

### 6.2 Implementation precedents (two independent codebases, concrete lessons)

Audacity (whole-product precedent) [S16]: single .aup3 file that only Audacity can open; undo history is not saved with the project; automatic crash recovery on relaunch; compaction of temporary space on close; audio is referenced from the original until an edit is applied, after which old and new audio are retained (edited regions roughly double in disk use); nondestructive trim hides audio and can cause project bloat, with no permanent-delete command; WAL and SHM sidecars that must not be moved while open; FAT/FAT32 destinations blocked for the 4 GB reason. Lessons taken: keep exchange artifacts reviewable and mergeable (hence the folder bundle); recovery must be automatic and explicit (hence the recovery journal); nondestructive editing must not silently accumulate hidden bulk (hence per-source caches rather than per-edit audio blocks, plus a bundle size report); communicate what is and is not saved (undo depth shown).

BBC audiowaveform (component precedent) [S01-S03, S07, S08]: waveform data is min/max over groups of N input samples (zoom, default 256); channels combine to mono unless split; binary and JSON outputs; a zoom below the generation level is impossible; Google Test suite; GPL-3.0; ongoing development moved to Codeberg (adoption caveat, L05). Lessons taken: the overview is a pure derived artifact (content-hash cache keys); generate at the finest needed level and aggregate coarser views in memory, because zooming below the generation level is impossible [S03]; a cache file is untrusted input (6.4), and validator strictness must exceed upstream's (C3: upstream tolerates size mismatch with a warning; Ledgerline rebuilds).

### 6.3 Component precedents

- libsamplerate streaming contract [S14, S20]: src_process may consume fewer frames than given (input_frames_used) and produce fewer than requested (output_frames_gen); data_in and data_out may not overlap; end_of_input is set only on the final buffer; src_reset is required between unrelated pieces; ratio changes are smoothed unless src_set_ratio forces a step; src_ratio is output rate over input rate; SRC_SINC_MEDIUM_QUALITY = 1 is documented at 97 dB SNR and 90 percent bandwidth [S20] (pinned CHOICE for export quality).
- libsndfile I/O semantics [S12]: seeks are in multichannel frames and return -1 out of range; reads past EOF return short or zero without error; the chunk API retrieves arbitrary metadata fail-safely; float/int scaling has documented traps (Notes 1-2).
- SQLite atomic commit [S17]: the rollback journal holds original pages; two fsync phases; commit happens at journal deletion; journal existence decides commit versus rollback. Adopted as the save/recovery pattern regardless of storage engine.

### 6.4 Investigated public failure: issue, fix, regression test, causal limits

Issue bbc/audiowaveform #159, Crash when parsing malformed DAT and FLAC files (opened 2022-01-16, id 1105084830; closed 2022-02-18, state_reason completed) [S04]. A 22-byte crafted .dat declared 4,177,459,455 points with samples-per-pixel 0; the rescaler divided by that zero, giving SIGFPE in WaveformRescaler::rescale (reporter's gdb session; classified PROBABLY_NOT_EXPLOITABLE). A second repro (malformed FLAC) crashed inside libFLAC/libsndfile under electric fence, not in audiowaveform's own code.

Fix: commit 63c8bd4baadc19e6e19c60dd3e0894f8e551215e, Improved .dat file validation / See #159, 2022-01-16, GPG-verified, single file src/WaveformBuffer.cpp, +24/-21 [S05]. The sample_rate at least 1 and samples_per_pixel at least 2 checks were moved into header parsing and made fatal (reportReadError then return false), replacing post-read checks that only set success = false and continued. That is the entire causal mechanism: validation existed but did not stop execution.

Release: v1.6.0, release commit 49e36682f1bcebaa23717db3f0b6074ee15810f6, 2022-02-18, whose own ChangeLog patch adds Fixed crash when reading malformed .dat files [S06, S02]. Applicability: v1.6.0 (2022-02-18) and later; earlier releases crash on such input.

Regression coverage: test/WaveformBufferTest.cpp at master asserts load() returns false with exact error strings for the fixtures sample_rate_too_low.dat and samples_per_pixel_too_low.dat [S07, S08]. Causal limits, preserved honestly: the fixtures date from the 2013 initial import commit f69dfc0 [S09]; the commit search for 159 finds only the fix commit [S10], so no new test was added with the fix; the pre-existing tests cover the fatal path, and no pinned test reproduces the rescaler SIGFPE specifically; the malformed-FLAC half was not addressed by this commit (its stack lies in libFLAC/libsndfile per the reporter), yet the issue closed completed; recorded, not resolved.

Lessons applied: derived files (caches, manifests, exports) are validated field-by-field with fatal failure and rebuild (7.1); checks existing is not checks stopping execution, so tests must assert the fatal path; fix provenance is claimed only from release, changelog, and issue closure together, never from a patch link alone.

## 7. Resources: caches, rendering, export lifecycle, budget

### 7.1 Waveform cache identity and invalidation (corrected numbers)

Cache key: wfp1 | sha256(source bytes) | channel_view | samples_per_pixel | generator_version. One pyramid per source per channel view, generated at the finest overview level: 2 h at 48 kHz is 345,600,000 frames [FW3]; at the default 256 samples per point that is 1,350,000 min/max points, about 5.4 MB (5.15 MiB) as int16 pairs; coarser views are aggregated in memory for drawing. This follows audiowaveform's generation-level rule [S03] and corrects the research draft, which used 6.7 M frames (about 52 times low) and estimated 26.4k points (C1, FW3). Invalidation is identity-based: a changed source hash invalidates every cache for that source; edits never invalidate caches because caches are per-source, not per-timeline; orphaned caches are garbage-collected by manifest audit; the bundle carries a size report (Audacity lesson).

A cache file is untrusted input. On load, every header field is validated: magic and version, samples_per_pixel at least 1, declared point count at most ceil(frames / spp) + 1, and file length matching the declared count. Any violation, including a declared-size mismatch, is a fatal cache miss with rebuild (C3; deliberately stricter than upstream, whose size-mismatch test tolerates a short read with a warning [S07]).

### 7.2 Rendering and resampling (bounded, cancellable)

Export iterates the timeline in about 4 s windows: compute each clip's overlapping source range in integers; sf_seek and read a float window; feed libsamplerate per the streaming contract: loop src_process until input_frames_used consumes the window; set end_of_input only on the final window; src_reset at every clip start (never across unrelated material); step the ratio via src_set_ratio so no smoothing crosses a clip boundary [S14, S20]. Interactive access uses 1-2 s windows (750 KiB stereo float at 48 kHz [W3/RW3]); export windows are the larger class. Crossfades are applied in float32 before quantization. Export gain applies in the recipe; preview gain never enters this path. Clipping: samples at the float plus or minus 1.0 boundary are counted during render; final 24-bit quantization applies the clipping policy and the export record reports peak and clipped-sample count. Equal-power crossfades can legitimately peak at 1.414 for in-phase content [FW4], so this census is mandatory; no automatic limiting in v1 (CHOICE).

### 7.3 Export lifecycle and the cancelled-render rule

Output is written to exports/name.tmp. Only after full write, fsync, and SHA-256 does the finalizer rename it to the final name and write the export record (status=complete, checksum, parameters, generator version); the cue table file is written after audio finalization. Cancel at any point deletes (or renames to .cancelled) the tmp file, writes an export record with status=cancelled, and no complete-export label or manifest entry ever appears (brief requirement). Reopen scans exports/ for .tmp, .cancelled, and dangling records and shows a recovery list; a record whose checksum fails verification displays as failed verification, never as complete.

### 7.4 8 GB laptop budget, seeking, progress and cancel

Whole-file float access of a 2 h stereo program is 2,764,800,000 bytes (2.57 GiB) [W3/RW3, FW3] and is forbidden by design; all access is windowed. Working-set target: at most 600 MB RSS with transcript and two zoom levels resident (CHOICE: a target to investigate, not a measured claim; test 11.4 is what would establish it). Seeking: sample-exact via sf_seek to the source anchor [S12]. For lossy sources (MP3, Opus, Vorbis), codec delay and padding at seek boundaries are not verified at the pinned version (L11); audiowaveform's own history shows the defect class is real (MP3 info-frame offset correction in v1.1.0 and an MP3 decoder buffer-overflow fix in v1.5.1 [S02]). Until the L11 roundtrip test passes, lossy sources carry a provenance flag and the scrub cursor reports decoded positions. Progress and cancel with phase labels (hashing, indexing, writing) exist for overview build and export; a cancelled job's artifacts never masquerade as complete.

## 8. Recovery, interruption, and saves

Save protocol: journal-then-rename modeled on SQLite's documented atomic commit [S17]: write manifest.json.new; fsync the file; fsync the directory; atomically replace; rotate the previous manifest to manifest.bak (two generations). A crash mid-save leaves manifest.json untouched, and manifest.json.new is discarded at next open. UNEXECUTED as code in this stage; the kill-during-save test (11.3) is the evidence that would establish it.

Interrupted operations: import (hashing plus indexing write one sidecar; an interrupted import leaves the source unregistered and the sidecar marked incomplete; retry is idempotent, hash-keyed); overview build (tmp-then-rename; interrupted or invalid caches are cache misses); save and close (protocol above; reopen also reports leftover .new and tmp files); crash recovery (recovery/ journals of unapplied command batches are listed at open and offered individually, replay or discard, mirroring Audacity's automatic-and-explicit recovery lesson [S16]); changed or missing media per 4.3. No code path ever writes an original file.

## 9. Editor-facing requirements (v1 acceptance features)

Keyboard-first transport and navigation (play/pause, scrub, next and previous cue or region, zoom, split at cursor, join, undo and redo); every command reachable without the mouse; a transcript pane with adjustable type size, high-contrast theme, and per-cue state coloring (anchored, orphaned, boundary, in_transition); solo/mute and channel choice per track; a persistent current-edit indicator (last command plus affected clip, with a jump into the undo history); a provenance inspector per cue, region, and source (hash, rates, captured chunks, ambiguity flags, edit chain); errors surfaced inline and in a copyable log; undo/redo with visible depth. These are emphases under the brief's obligations; automatic transcription, noise reduction, simultaneous shared editing, and cloud accounts are optional opportunities (10.1), not requirements.

## 10. Opportunities and alternatives

### 10.1 Opportunities (useful, optional)

1. Reviewed-region tracking (headline): regions already carry named spans and provenance; adding review state (who heard it, when, verdict) delivers the brief's next-editor-understands-what-was-heard property as editorial bookkeeping, not DSP.
2. WebVTT cue export [S18]: standardized time-aligned text interchange for committees and web players; identity fields ride along as comments. Deep syntax sections are unpinned (L02); implement only after pinning.
3. Local draft transcription (L08): offline ASR producing draft cues bound to the same source-anchor contract, clearly labeled draft versus human-confirmed.

### 10.2 Alternatives (plausible, bounded)

1. Single-file SQLite project container (AU3-style, L09): atomic transactions and one-file exchange, at the cost of opacity, undo-history loss on save, and 4 GB-class exchange friction [S16]. Chosen against for v1; fallback if JSON manifests prove unwieldy.
2. C++/Qt shell over the same pinned audio core if Python misses performance targets (6.1); contracts unchanged.
3. GStreamer I/O layer if the format boundary must grow (L07); costs seek and metadata auditability; not selected.
4. No-resample policy (project rate fixed to a single source rate) as the zero-risk fallback for single-rate projects, at the cost of mixed-rate projects becoming impossible.

## 11. Validation plan

EXECUTED during this stage by the candidate (isolated component checks; receipts, code and output hashes, and limits in witnesses.json):

- FW1 mapping arithmetic: 1:1 involutivity and boundary exactness; 44.1k to 48k non-involutivity with 4,516 of 4,547 probes failing roundtrip and the divisible-by-147 structure; Lproj of 10 s equals 480,000. Independently reproduces research-stage RW1.
- FW2 timecode rule, rev 2: nearest-ms half-up, negative clamp, exact half-millisecond round-up at 24 frames and 48 kHz, the one-frame-before-two-hours display property, and the float pitfall (2.675 formats as 2.67). Rev 1 failed because of my own wrong expected constants and is disclosed in the catalog.
- FW3 sizes: RIFF data-chunk census for 2 h, 48 kHz, 24-bit at 1/2/4/8 channels against 4,294,967,295 (only 8 channels exceeds); whole-file float footprint 2.57 GiB; 2 s window 750 KiB; corrected cache figures (345,600,000 frames; 1,350,000 points; about 5.15 MiB).
- FW4 join and crossfade arithmetic: butt equals lenA plus lenB; crossfade subtracts D; equal-power power-sum equals 1; in-phase full-scale fade peak 1.414.

ADOPTED from the research stage with attribution, not re-run here, corroborated by FW1-FW3: RW1 mapping checks including its honest rev-1 failure receipt; RW2 timecode checks; RW3 RIFF, memory, and window arithmetic.

PROPOSED/UNEXECUTED (implementation-stage acceptance gates):

1. Cue-contract property tests: randomized edit sequences (trims, splits, moves, rate changes, gap inserts) preserve every cue's source anchor; orphan and boundary states exactly per 5.3; the inverse-map asymmetry never changes identity.
2. Golden-file render tests: fixed small projects produce byte-identical WAV outputs across runs; identical exports at 1 s, 2 s, and 4 s window sizes exercise the streaming resampler contract [S14].
3. Interrupt and cancel simulations: SIGKILL during save (manifest intact, journal recovery), during export (.tmp or .cancelled present, no complete record), during overview build (cache miss, rebuild).
4. Memory soak: 2 h, 10-source project with scripted scrub and edit sessions; RSS ceiling and no unbounded growth over 1,000 undo steps; this is the test that establishes the 7.4 target.
5. Cancel-semantics UI test: a cancelled export never displays as complete (7.3).
6. Format matrix tests: a generated corpus across the 3 input set; refusal and transcode paths for the non-promises; u-law and a-law disclosure banners.
7. Lossy-seek verification (L11): seek-to-frame versus sequential-decode roundtrip per lossy format at the pinned libsndfile, documented before sample-exact scrub claims reach users.
8. Accessibility audit: keyboard-only completion of the full section 2 workflow; screen-reader pass over timeline, transcript, and dialogs; contrast check on cue-state colors; error-text legibility review.
9. Metadata-retention test: a WAV corpus with bext and ID3 chunks; chunk bytes roundtrip via the chunk API [S12]; bext via SFC_GET_BROADCAST_INFO [S19]; contradictory-date fixtures surface flags, never silent fixes.
10. Render-path separation test: static and runtime assertions that no render or export code path reads viewstate.json and that preview gain is absent from every export recipe.

## 12. Critical dependencies and unresolved limits

Pinned: libsndfile 1.2.2 [S11-S13, S19], libsamplerate 0.2.2 [S14, S15, S20]. Unpinned CHOICE: PySide6 on Python 3.12; bind the version at implementation start; the UI layer is separable from the pinned audio core. No load-bearing claim rests on an unverified component. Explicitly quarantined items: OHMS precedent (L01; unreachable, two capture failures recorded); WebVTT deep syntax (L02); EBU Tech 3306 RF64 primary spec and libsndfile's RF64 write-path behavior (L04; SFC_RF64_AUTO_DOWNGRADE [S19] must be explicitly defeated in the export path); audiowaveform's Codeberg continuation pins (L05); lossy seek alignment (L11); all performance and memory targets (7.4, 11.4).

Honest limits of the evidence: every executed check is arithmetic or formula-level in isolation and proves only itself; the architecture, data contract, and recovery designs are engineering inference and product choices supported, not proven, by the cited precedents; correct durations (FW1-FW4) are not evidence that rendered audio content is correct, which is what gates 11.2 and 11.3 exist to establish.

## 13. Evidence index

Sources S01-S20 (sources.json): audiowaveform repo, changelog, readme [S01-S03]; issue #159, fix commit, release commit, tests, fixtures, commit search [S04-S10]; libsndfile formats, API, release, command pages [S11-S13, S19]; libsamplerate full API, release, misc pages [S14, S15, S20]; Audacity project manual [S16]; SQLite atomic commit [S17]; WebVTT CRD [S18]. Witnesses: FW1-FW4 executed this stage; RW1-RW3 adopted with attribution (witnesses.json). Leads L01-L11 (leads.json). Critique record: out/critique/review.md.