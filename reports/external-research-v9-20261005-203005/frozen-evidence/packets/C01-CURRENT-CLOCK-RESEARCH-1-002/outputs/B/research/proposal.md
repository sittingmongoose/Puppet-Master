# Oral History Offline Review & Edit Workspace — Research Proposal ("H1, stage: research")

Candidate stage: research (native, fresh). Date of capture: 2026-10-06. Working name **OralDesk** (product choice, renameable).

Evidence-label legend used throughout:
- **[S#]** = pinned public source (see `out/research/sources.json`); **(F)** external fact from that source; **(I)** engineering inference by candidate; **(C)** product choice by candidate.
- **(V-exec)** = check executed by candidate in the admitted bounded isolation (receipt IDs given; component-scope only). **(V-prop)** = proposed validation, **UNEXECUTED**.

---

## 1. Scope, users, non-goals

Four editors on ordinary laptops (8 GB RAM target) work offline on oral-history interviews, exchanging project folders or portable bundles. The tool must let the *next* editor see which audio was heard, which edits were made, and which transcript cues still refer to the same material. This is an editorial/research tool — **not** a live broadcast/recording service, not cloud, not simultaneous multi-user editing. (C; brief.)

Typical project: one voice recording, one backup recording, some environmental noise; long (2 h) files with differing sample rates, channel counts and sample representations.

**Non-goals for v1** (C; brief warns against converting everything found elsewhere into requirements): no live input monitoring/recording, no automatic noise reduction as a bake step (report-only opportunity, §14), no shared simultaneous editing, no cloud accounts, no video, no destructive source modification ever.

## 2. Minimum workflow (v1 must support, end to end)

1. Import several long recordings with differing sample rates/channels/encodings; originals are **never written** (all source handles opened read-only). (C)
2. Inspect file metadata (declared vs measured, §7), listen and scrub with progress/cancel on indexing.
3. Add named regions and transcript cues anchored to source material (§5 identity model).
4. Trim a passage; join selected clips with an optional short transition (§8).
5. Set preview gain (display-only), solo/mute or channel view choice (display-only).
6. Save; close; reopen (recovery-safe, §10).
7. Export a review mix plus a cue table (§8, §12); a cancelled render is ledger-recorded as **cancelled**, never a complete export.
8. Exchange the bundle; the receiver relinks by content identity, sees missing media as degraded state (§10).

## 3. Component/architecture choice and bounded alternatives

**Chosen (C):** Python 3 desktop app; UI in **PySide6/Qt**; a separate pure library "sessioncore":
- **Decode:** python-soundfile (libsndfile). (F) libsndfile 1.2.2 reads/writes WAV/AIFF/AU/FLAC/Ogg-Vorbis/Ogg-Opus (≥1.0.29)/MP3 (≥1.1.0) and more; the published format table is the honest I/O boundary [S9, S8].
- **Bounded streaming decode:** (F) python-soundfile exposes `blocks()` block processing and `SoundFile.seek()/read()` frame-indexed access [S9] — supports bounded-buffer decode, seeking and per-block progress (I; precedent P3).
- **Sample-rate conversion:** one resample per source per render to the project rate, via libsoxr/libsamplerate. (F) Audacity's own build information lists "libsoxr (Sample rate conversion) Enabled" [S1], i.e., a mature editor ships soxr as its SRC engine (I: quality suitability for speech review must still be measured, §17; **not claimed**).
- **Fallback decode** for containers libsndfile cannot open (e.g., M4A/MP4): FFmpeg/libav as an external decode-only subprocess, decoding strictly to project-rate float frames with a recorded provenance entry. If absent at runtime, those types are declared unsupported (§12).
- **Render engine:** single-pass block-streamed mixdown with sample counters, progress and a cancel token (§8).
- **Documents:** human-readable JSON edit documents + journal (§4); waveform cache files (§9).

**Bounded alternatives:** (a) C++/JUCE native — precise audio timing and single-binary distribution, but heavier cross-platform packaging; adopt if V-prop V2 (throughput) fails. (b) Single-file SQLite project — rejected for v1 on evidence below (Audacity corruption history), viable later if journals grow unwieldy. (c) ffmpeg-filtergraph-only renderer — fast but opaque provenance/cue interception; rejected because exported cue positions must be recorded by our own counters (§5).

## 4. Project & media data contract

**Bundle = directory** `project.oral/` (zip-able for exchange; (C)):
```
manifest.json        schema version, project UUID, created/modified, app versions
media/               optional bundled copies (never originals; see §10)
sources.json         source records (identity + declared/measured metadata)
project.json         tracks, clips, cues, regions (the nondestructive edit document)
display.json         display-only state (preview gain, solo/mute, zoom, channel view)
renders.json         rendered-audio ledger (operations + exports + status)
journal/             autosave journal + recovery records (bounded, N=10)
cache/waveforms/     derived, disposable (§9)
transcripts/         cue-linked transcript text, EAF/JSON
```

**Source record:** `{source_id: uuid, path_history[], quick_fingerprint, full_sha256|null, declared: {rate, channels, sample_format, container, raw_header_snippets}, measured: {frames, rate, channels, format}, status: verified|partial|missing, ambiguity_flags[]}`.
Identity = content, not path: quick fingerprint (file size + SHA-256 of first/last 1 MiB) computed at import (fast); full SHA-256 optionally completed during indexing with progress/cancel. (C; ELAN precedent for relative-URL relocation support: (F) EAF `RELATIVE_MEDIA_URL` and `TIME_ORIGIN` exist for exactly this relocation/offset problem [S6].)

**Clip:** `{clip_id, source_id, src_start, src_end (source frames, half-open [start,end)), track_id, proj_start (project frames), channel_map, transition_in/out {type, len_project_frames}}` — nondestructive: trims and gaps are metadata over untouched sources.

**Cue:** `{cue_id (stable uuid), source_id, src_sample (anchor), text, author, created_at, role}` plus **resolution status** computed against the current document: `mapped (project frame) | at_boundary | in_gap | source_missing`. Cues are named transcript time-slots; identity is the id+source anchor, **not** any stored project time (§5; precedent P2).

**Three-way distinction (brief requirement; (C) encoding):** `project.json` (edits) / `display.json` (display-only; never affects rendered bytes; not part of export provenance) / `renders.json` (rendered operations: each entry records inputs by fingerprint, operation + parameters, engine version, output hash, and `status: complete | cancelled | failed | partial`). Display-only values are deliberately outside the render inputs so nobody can mistake a preview gain for a baked one.

## 5. Timeline: positions, rounding, cue semantics (load-bearing)

**(C) Units and the single mapping rule.** All times are integer sample/frame counts. Two unit systems: *source frames* at the source's own rate; *project frames* at one project rate (48 kHz). Conversion uses exact integer rational arithmetic, one canonical direction:
`project_frame = clip.proj_start + floor((src_frame − clip.src_start) × PROJ_RATE / SRC_RATE)` — computed as integer `((src−src0)*P)//S`, never via floats (float `44100↔48000` intermediates can round differently; (I)).
Display timecodes are **formatted from project frames** (e.g., `mm:ss.mmm` by truncation toward zero) and are never parsed back as authoritative; the frame is the truth.

**(C) Boundaries.** Trims are half-open `[src_start, src_end)`: a cue exactly at `src_start` maps to the first retained project frame (`at_boundary`, rendered audible content begins there); a cue at `src_end` maps just past the last retained frame (`at_boundary` = "content ends here"). A cue strictly inside removed material becomes `in_gap`: it is **not** silently moved to a boundary; the cue table marks it unresolved with the two candidate boundaries named. Inserted gaps shift project positions by construction (clips carry proj_start) but cue identity still resolves through the per-clip rule, so a gap edit cannot re-point a cue at different audio.

**(V-exec, W-1, receipt `exec-ycwlk7os`, exit 0)** verified on exact integers: 44.1k→48k of trim [22050,44100) → project [24000,48000); a source cue at 33150 frames maps to project 36081; boundary cue → 24000; in-gap cue → `None` (flagged); crossfade bookkeeping totals 117600 frames for the joined example; inverse hover mapping is asymmetric by −1 sample (documented: forward mapping is authoritative). **Scope limit:** arithmetic/bookkeeping contract only in isolation; no resampler, no GUI, no real editor exercised.

**(C) Exported cue positions.** The cue table's project positions are recorded by the render engine's own running sample counter at the moment each cue's source frame passes through the mix — **not** recomputed from arithmetic after the fact. A source-rate conversion, trim, gap or transition can therefore never silently re-point a cue: identity is `(source_id, src_sample)`; position is derived and *statused*. Cues whose source frames fall inside a crossfade are exported with status `crossfade_overlap` (position exact; content partially faded).

**(I→C) Rounding asymmetry.** floor of the forward map can differ by 1 sample from a global-map alternative; the contract fixes the per-clip formula above as canonical (checked equal in the W-1 example, but the contract holds even where they differ).

## 6. Channel mapping and boundary semantics

Each source's true layout comes from the decoder (measured, §7). Per clip, `channel_map` is an explicit list `source_ch → track_ch` (default: `0→0`, mono→mono; stereo `0→0,1→1`; mono→stereo duplicates with `same_content: true` recorded). (C) v1 mixdown supports up to 2 output channels; sources with >2 channels import and are inspectable/scrubable per channel, but are flagged `mixdown_unsupported_v1` — an honest boundary rather than an untested downmix (C; brief). Cue anchoring is channel-independent (frame-anchored), but the cue table records which channel view was active at creation (display-only annotation).

## 7. Metadata policy (absent / contradictory / unsupported)

Decoder-measured values (`measured`) govern playback; header/declared values are retained verbatim in `declared` plus raw snippets. Contradictions (declared ≠ measured) produce `ambiguity_flags` shown in the UI (badge + provenance inspector), never silently corrected. Absent metadata (e.g., headerless RAW) requires explicit user confirmation and records the assumption as user-attested, not measured. Unsupported encodings are declared as such with the reason; the original file is left untouched and the source record remains. **(V-exec, W-2, receipt `exec-mxmqsf3m`, exit 0)** demonstrated the policy on a crafted WAV whose data chunk declares 1000 bytes but supplies 8: declared retained, measured bytes govern frame count, contradiction flagged. **Scope limit:** this validates the *parser policy* in isolation; it does **not** establish how libsndfile or FFmpeg behave on such files (that is V-prop V7).

## 8. Render/preview engine, clipping, resampling, transitions

**(C) Single-pass render:** for each clip in timeline order, decode source blocks (bounded, e.g., 65536 frames), resample once (cached per `(source fingerprint, project rate, engine version)`), apply channel map, accumulate into float32 accumulators; equal-power crossfade of configured length (default 2400 frames = 50 ms at 48 kHz; documented as a product choice for speech joins; not a quality claim (I)). Progress events per block; **cancel token** checked between blocks.
**Atomic completion:** audio is written to `export.tmp` + sidecar manifest, flushed, hashed, then atomically renamed; only then is the `renders.json` entry set `complete` with the output hash. Any cancel/failure records `cancelled`/`failed`, deletes the temp, and the UI must show no "exported" state. (I) Motivation is directly evidenced: Audacity users report projects *corrupted* by cancelling mid-operation ("Canceling Discarding Changes Corrupts the Project" #9036, P0; "Project corrupted when pressing cancel during compacting project" #10500, open, 3.7.7) [S2, S1] — cancellation paths are a proven corruption surface, so ours must be transactional.
**Clipping & headroom (honest, minimal):** mixdown is float; before integer quantization the engine measures true peak and reports peak dBFS; if |peak| > 1.0 it refuses to mark the export complete without an explicit user headroom decision recorded in provenance. No compressors/limiters in v1 (C).
**Preview** streams the same pipeline into the audio device without writing files; preview gain, solo/mute and channel view are display-only (§4) and never baked.

## 9. Waveform cache, seeking, buffers, memory (8 GB laptop)

- **(C) Cache identity:** each peaks file is keyed by `(source_id, quick_fingerprint, channel_count, peak_rate=100 Hz, cache_format_version)` and validated against the fingerprint on open; mismatch ⇒ rebuild. Peaks are min/max int16 pairs per channel per 10 ms cell; a 2 h stereo pyramid ≈ **5.49 MiB** (V-exec W-1 printout), so full-project overview is trivially memory-safe; detail levels render from bounded decode on demand.
- **(I→C) Memory budget:** never load whole sources. 2 h stereo at 48 kHz float32 = **2.57 GiB** (W-1) — proof that whole-file loading is impossible on 8 GB machines with OS+UI; all access is block-bounded (0.5 MiB render blocks in W-1). Bounded decode precedent: `sf.blocks()` / seek-read API [S9].
- **Seeking:** waveform UI seeks are O(1) in the peaks pyramid; audio seek uses decoder `seek()` to the mapped source frame, then reconciles the frame counter by re-reading a few frames and hashing a fingerprint window (guards against decoder seek drift; V-prop V4).
- **Interrupted import:** a source whose indexing was cancelled/interrupted is recorded `partial` with a resume cursor, never used for rendering until `verified`; partial waveform cache files carry the same status and are rebuilt.
- **(I) Indexing and rendering run on worker threads/processes with progress and cancel**; the UI thread only consumes events.

## 10. Recovery, exchange, missing media

- **Save:** document writes are write-temp → fsync → rename (atomic); the journal keeps the last N doc snapshots with hashes. Crash on reopen offers: continue from journal, or last committed save — the user chooses; nothing auto-overwrites the committed document without consent. *(I; the failure class this avoids is evidenced by Audacity autosave/save corruption reports: "Autosave is corrupting project (waveforms to zero)" #9276 closed 2025-09; "Save Project As corrupts projects" #11244 open, 3.7.8 [S2, S1].)*
- **Fix-chain lesson applied (P1):** Audacity #9608 (P0, AUP3→AUP4 conversion; on reopen "all clips appear shrunk, cannot be zoomed in or played" — data effectively lost) was fixed by commit `754e3f39f6a3f3d066d0854d2d957ef0ab654ac9`, "Do not save invalid clip tempo" [S3, S4]. **Lesson (I→C):** never persist derived metadata (rates, tempos, positions) that failed validation — validate at write time, and record conversions as explicit provenance events. **Causal limits:** the fix mechanism is known from the PR title/body; the commit diff was not read; the first release containing the commit was **not determined** (merge 2025-10-09; observed releases 4.0.0 2026-09-03, 4.0.1 2026-09-30 — release attribution UNVERIFIED, lead L1). One fixed issue does not fix the class: 4.0.1 (2026-09-30) still ships "Fixed project corruption after a failed save (#12296)" and "Fixed clips being messed up when converting .aup3 projects (#12209)" [S5] — recurring defects in exactly this area justify our bundle-plus-journal, never-single-file, validate-before-persist stance.
- **Exchange:** "Export bundle" copies media into `media/` (user opt-in; large-file warning), freezes the documents, writes `manifest.json` with hashes. "Open bundle/external project": sources located by path if fingerprint matches; else searched/asked; matched-by-content relinks update `path_history`. **Missing media ⇒ degraded open:** edits and cues retained, audio locked, missing items listed with fingerprint and last known path; playback/export of missing-referencing tracks is refused (not silently skipped).
- **Originals:** the app never writes to source files; exports and bundles are new artifacts. (C; brief hard requirement.)

## 11. Editors' UX, keyboard and accessibility (minimum obligations)

- Full keyboard map (product choice; documented in-app): transport (space/cursor-frame steps), playhead jumps, region/cue navigation, trim in/out, cue add/edit, undo/redo (Ctrl+Z/Y), solo/mute cycling, channel-view choice, open provenance inspector.
- **Current-edit indication:** a persistent "pending edit" banner naming the last uncommitted edit + dirty state + which document section it touched; provenance inspector shows any cue's full chain `cue_id → clip → source(file, fingerprint, frame range, channel map) → render/export events`.
- Undo/redo: command stack over the edit document (commands are small JSON; audio is never duplicated), depth bounded by memory (e.g., 200 ops).
- Transcript pane: cues listed text-first, synchronized both ways with the playhead via cue identity; legibility: user-scalable font, minimum 12 pt equivalent, high-contrast theme; screen-reader labels on all controls; errors announced with code + next action (e.g., `E-MISSING-SOURCE: interview_backup.wav fingerprint 9f2c… not found — Relink or Open degraded`). Feasibility precedent: (F) Audacity 4.0.1 release notes list timeline/vertical-ruler keyboard navigation (#11367, #11368) and screen-reader-announced toasts (#11645) [S5] — comparable budgets are achievable in Qt (I).
- Error feedback: all failures produce a code, a human sentence, and a recovery action; no silent fallbacks (ties to §7).

## 12. Supported input/output boundary (honest, v1)

**Read (decode):** WAV/AIFF/FLAC/Ogg-Vorbis/Ogg-Opus/MP3 via libsndfile — (F) supported per the libsndfile 1.2.2 format table [S8]; containers beyond that (MP4/M4A/others) via the FFmpeg fallback if present. RAW/headerless only with explicit user-supplied parameters. **Not supported in v1 (declared, not attempted):** >2-channel mixdown (§6), AC-3/E-AC-3, Dolby Atmos layouts, DSD, >384 kHz rates.
**Write:** review mix WAV PCM 16/24-bit at 48 kHz; FLAC 24-bit optional. **(F) libsndfile's table lists W64 (Sound Forge) but no RF64 row [S8]**, so for mixes that would exceed the 4 GiB classic-WAV limit the documented v1 answer is W64 or segmented export with a manifest — a bounded boundary (2 h stereo 24-bit ≈ 2.76 GB fits classic WAV; the boundary exists for edge cases).
**Cue table export:** JSON (canonical) + CSV (spreadsheet) + WebVTT (openable in players). (F) WebVTT is a W3C Candidate Recommendation Draft (2026-05-20, revision `064802512ff9d8cd22dea4aea2cd1508aa2cc679`) defining cues with identifier lines and start/stop timestamps [S7]; our export maps `cue_id`→cue identifier, project-frame-derived timestamps→`hh:mm:ss.mmm`, with `in_gap`/`crossfade_overlap` cues annotated in the payload so no cue silently changes meaning.
**Transcript exchange:** EAF (ELAN) export of cues as alignable annotations (see P2), plus JSON. EAF import in v1 limited to aligned annotations + media descriptors; `TIME_VALUE`-less time slots import as unresolved cues (F: EAF `TIME_VALUE` is optional in the schema [S6]).

## 13. Precedents and findings (≥2 independently useful)

**P1 — Audacity (project integrity & cancel paths).** (F) Sample blocks live in a SQLite database: user-visible error traces reference `SqliteSampleBlock::Load::step`, `sampleblocks` queries and `DBConnection.cpp` [S1]. (F) Cancel/interruption during compaction/save has repeatedly corrupted projects (#9036 P0 closed 2025-08; #10500 open 2026-03 on 3.7.7; #11244 open 2026-06 on 3.7.8) [S2, S1]. **Concrete lessons:** (a) cancellation and partial writes must be transactional (§8, §10); (b) validate-before-persist (§10 fix-chain); (c) a single-file opaque container resists recovery by hand — our editable-JSON + journal design keeps documents inspectable.
**P2 — ELAN EAF 3.0 (cue identity for transcript work).** (F) EAF separates *time-slot identity* (`TIME_SLOT_ID`, stable) from *time values* (`TIME_VALUE` optional, milliseconds) [S6]; annotations reference two time slots; media descriptors carry `RELATIVE_MEDIA_URL` and `TIME_ORIGIN` for relocation and offset mapping. **Concrete lessons adopted:** our cue model (identity ≠ position; unresolved timing is representable; relocation by relative path + content check) is a direct generalization — with the difference that OralDesk anchors cues in source *samples*, not milliseconds, to make edit-boundary semantics exact (C).
**P3 — python-soundfile/libsndfile (bounded access & format truth).** (F) `blocks()` block processing, frame-indexed `seek/read`, and the libsndfile format matrix [S9, S8]. **Lesson:** the supported-format boundary is a *table*, not a promise; our §12 table is generated from the library's capability at runtime.

## 14. Opportunities (optional, not obligations)

- **Local automatic transcription** (e.g., whisper.cpp CPU) producing *draft* cues flagged machine-made with confidence, feeding the review queue (opportunity only; UNEXECUTED feasibility on 8 GB laptops — lead L6).
- Noise-profile report per source (measurement only, no reduction) to help editors choose the voice vs backup recording.
- Second-recording alignment via cross-correlation to propose backup takes as alternates for a region.
- Media-fragment-style stable cue URIs (`source_id;t=srcframe`) in exported tables for citation in archives.

## 15. Alternatives (plausible, bounded)

- **Alternative A (adopted as fallback):** C++/JUCE core with the same document contracts if Python throughput fails V2 — contracts unchanged, cost is packaging.
- **Alternative B:** SQLite-backed project document (instead of JSON+journal) if documents grow large; keeps transactional saves, loses hand-inspectability — acceptable bounded swap (Audacity evidence warns about *opaque single-file* stores, not about SQLite per se; (I), keep as option).

## 16. Critical dependencies & risk register

| Dependency | Role | Status |
|---|---|---|
| libsndfile / python-soundfile | decode/encode boundary | (F) capability table pinned [S8, S9]; wheel bundles its own libsndfile since 0.12 (F, [S9]) |
| soxr/libsamplerate | SRC | presence-in-Audacity evidenced [S1]; **quality adequacy UNVERIFIED** — critical, mitigated by V-prop V3 |
| FFmpeg (optional) | exotic-container decode | optional at runtime; absence degrades §12 honestly (C) |
| PySide6/Qt | UI & accessibility | platform licensing LGPL (I); a11y capability evidenced by Audacity's Qt-based items [S5] |
| whisper.cpp | optional transcription | entirely optional; unsupported dependency for v1 |

**Unsupported critical design dependencies, stated explicitly:** (1) SRC quality for speech review — no executed evidence, bounded alternative: decode-then-hold-at-native-rate with per-source preview rate conversion (quality risk moves to playback only); (2) FFmpeg distribution rights per platform — bounded alternative: ship without FFmpeg, declare unsupported types; (3) exact first-release attribution of fix commit 754e3f3 — treated as UNVERIFIED, no design rests on it (the design rests on the *recurrence* evidence [S5]).

## 17. Validation plan

**Executed by candidate (bounded isolation; component-scope only; receipts in `witnesses.json`):**
- **W-1** (`exec-ycwlk7os`, exit 0): integer-rational mapping, half-open trim boundaries, in-gap flagging, crossfade bookkeeping, inverse-mapping asymmetry, 2 h memory arithmetic. Limits: no resampler/GUI/editor.
- **W-2** (`exec-mxmqsf3m`, exit 0): declared-vs-measured WAV contradiction policy. Limits: our parser only; not libsndfile behavior.

**Proposed / UNEXECUTED (pass criteria stated; all require the real build):**
- **V1** 2 h, 3-source project (44.1k/48k mono+stereo, 16/24-bit) end-to-end workflow on 8 GB RAM laptop: RSS ceiling 1.5 GB, no UI freeze >500 ms; measured via OS monitor.
- **V2** render throughput ≥ 8× realtime single-pass at 48 kHz stereo on reference laptop.
- **V3** SRC audit: rendered cue positions from W-1-style fixtures match a reference resampler's actual output frame counts (cross-check against ffmpeg `aresample` sample counts); any drift ⇒ statuses, never silent.
- **V4** seek reconciliation: 1000 random seeks/crossfade-region reads reconcile frame counters by fingerprint window; zero mismatches.
- **V5** cancel-render ledger: kill mid-render repeatedly ⇒ `renders.json` shows only `cancelled`, temp files gone, no "complete" label (direct counter-evidence target for #9036/#10500-class failures [S2, S1]).
- **V6** interrupted save: `kill -9` during save ⇒ reopen offers journal/committed choice; committed document never auto-mutated.
- **V7** decoder contradiction suite: truncated/contradictory WAV/FLAC headers through the *real* decode path; ambiguity flags appear; frames == measured truth.
- **V8** exchange round-trip: bundle moved between two machines, media renamed ⇒ relink by fingerprint; deleted media ⇒ degraded open with all cues retained.
- **V9** accessibility smoke: screen-reader traversal of transport/cue/provenance flows; all actions reachable by keyboard only.

## 18. Evidence classification & limitations summary

External facts are confined to the pinned sources [S1–S9] with locators; architecture, schemas, policies, defaults (48 kHz project rate, 50 ms equal-power crossfade, 100 Hz peaks, block sizes, journal depth) are **product choices**; feasibility judgments are **engineering inferences** flagged as such; the two executed checks prove only their stated component contracts. No claim is made that Audacity, ELAN, or any library *meets* this brief's target — they are precedents, not endorsements. Preserved-but-deferred ideas live in §14; unresolved leads in `leads.json`.
