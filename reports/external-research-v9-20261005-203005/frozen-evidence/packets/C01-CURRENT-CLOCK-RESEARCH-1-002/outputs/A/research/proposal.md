# Interview Desk — offline oral-history audio review & edit exchange
**Stage:** research (confirmation brief H1). Date: 2026-10-06.
**Status labels used:** [F] = external source fact (cited, see sources.json), [I] = engineering inference from facts, [P] = product choice, **EXECUTED** = run by candidate in admitted bounded isolation, **PROPOSED/UNEXECUTED** = planned validation only.

---

## 0. Executive summary

A single-user desktop application ("Interview Desk") per editor, built on a **non-destructive project model**: original recordings are immutable inputs addressed by content hash; the project is plain JSON describing clips (source sample ranges), cues (source-anchored), display-only settings, and render manifests. Editors exchange either whole folders or portable bundles; the next editor sees which audio was heard, which edits exist, and which transcript cues refer to what, because every position is derived by one documented integer algebra from source-anchored identities — never accumulated float seconds.

Two independently useful implementation precedents anchor the design: **BBC peaks.js / waveform-data.js** (precomputed waveform cache with explicit identity/invalidation semantics, and a fully documented defect chain: issue #450 → fix commit `cad28179` → release v2.0.0 → regression tests, with recurrence in open issue #574 showing the fix's causal limits) and **OpenTimelineIO v0.18.1** (edit-decision-list interchange that references media but is explicitly not a media container — the correct shape for our export/interchange layer, not our core model). **Audacity** is studied as the whole-product cautionary precedent (opaque single-file project, interchange dead-end, hidden trim data), **libsndfile 1.2.2** defines the honest I/O boundary, and **aeneas 1.7.3** is the protected-breadth opportunity (forced alignment for draft transcript cues, with an explicit RAM-vs-duration bound).

Executed candidate checks this stage: a bounded timing-algebra/transition-gain property check (exec-293woo_i, exec-66t9pgwy — receipts with failures preserved and explained) and a capture-hash recomputation that **mismatched** due to candidate transcription loss (exec-2lvjq6af). All application-level validation below is PROPOSED/UNEXECUTED.

---

## 1. Minimum supported workflow (v1 scope)

1. **Import** several long recordings with differing sample rates, channel counts and sample representations; indexing runs with progress and cancel.
2. **Inspect** per-source metadata (rate, channels, sample format, header facts, ambiguity flags) in a source inspector.
3. **Listen and scrub** with bounded seeking; solo/mute per track; channel choice (left/right/both).
4. **Add named regions and transcript cues**; cues are source-anchored (see §3).
5. **Trim** a passage (non-destructive; hidden material stays in the source).
6. **Join** selected clips with an optional short transition (50 ms default equal-power crossfade, [P]).
7. **Set preview gain** — display/playback-only, never exported (§3.5).
8. **Save / close / reopen**; project round-trips exactly, including cue times.
9. **Export** a review mix (fixed-gain bounce) plus a cue table (CSV/JSON). Cancel during render yields **no** export.
10. Originals unchanged on disk at every step.

Explicit non-goals for v1 [P]: multitrack mixing with automation, effects, live broadcast features, simultaneous shared editing, cloud accounts, automatic transcription and noise reduction (§9 opportunities only).

## 2. Supported input/output boundary (honest, not "every codec")

[F] libsndfile 1.2.2 reads/writes WAV, AIFF, AU, FLAC, Ogg/Vorbis and more through one interface, performs on-the-fly conversion (endianness, type, bit-width scaling), lets applications query supported formats, and added MP3 read support in 1.1.0; release notes state each release is test-suite covered and that "when new bugs are found, new tests are added to the test suite" (libsndfile home page, capture edb94f16…).

**Inputs v1 [P]:** WAV/BWF (PCM 8/16/24/32-bit int, 32/64-bit float), AIFF, FLAC, and MP3/OGG/M4A **only via decode-on-import**: ffprobe metadata + FFmpeg CLI decode into a managed PCM WAV under the project cache, because decoding compressed input once at import makes later seek/timeline behavior deterministic and inspectable. [I] Decode determinism across FFmpeg versions is not guaranteed; the cached decode result, not the source, becomes the project's audio authority for such files, and the cache entry records decoder identity and source hash.

**Explicitly not promised:** every channel layout (v1: mono/stereo; >2-channel sources are refused with a named error, not silently downmixed [P]); every codec/containers with DRM or exotic chunks; writing MP3/OGG.

**Outputs v1 [P]:** review mix WAV (24-bit PCM, project rate), per-track WAV on request, cue table CSV + JSON, OTIO JSON adapter for interchange (§6). Every export writes a manifest (§5.3).

## 3. Project / timeline / media data contract

### 3.1 Media registry (immutable sources)
For each source file: `media_id` (UUID), `original_filename`, `sha256` (whole file), `size_bytes`, parsed facts {`rate`, `channels`, `sample_format`, `frame_count`}, **raw header metadata as captured** (any chunks ffprobe/libsndfile report verbatim), and `ambiguity` flags, e.g. `header_data_size_mismatch`, `declared_rate_vs_decoded_mismatch`, `unsupported_layout_refused`. [F→I] Audacity's manual documents the failure mode of trusting external files silently (projects depend on external audio and a "Check dependencies" flow exists) — we keep sources hash-identified from the start. If metadata is absent, contradictory or unsupported: **retain the original captured metadata verbatim in the project, compute timing from the actual decoded frame count, and expose the conflict in the inspector and in exports** — never silently "fix" it [P, required by brief].

### 3.2 Project document
`project.json` (plain JSON, schema_version; human-readable diffable text [P], contrast [F] Audacity AUP3 single-file SQLite project "not readable or playable by any other application" — manual capture ba792f6a…):
- `project_rate` (Hz, integer; fixed at project creation; default = first imported source's rate [P]).
- `tracks[]`, `clips[]`: `{clip_id, track_id, media_id, source_in, source_out, timeline_start}` where `source_in/out` are **integer frame indices in the source's own rate** (`source_out` exclusive), `timeline_start` is an **integer frame at project rate**.
- `cues[]`: `{cue_id, label, media_id, source_sample, note, created_utc, author}` — the **identity** of a cue is (media_id, source_sample). Project time is always **derived**, never stored as authority.
- `display_settings{}` — preview gain, zoom, solo/mute, channel choice, transcript pane state. Serialized separately and marked `"affects_export": false`.
- `render_manifests[]` (§5.3), `event_journal[]` (undo/redo log, §7).

### 3.3 Position algebra (the core contract)
All timeline arithmetic is **integer**; no float seconds enter storage or comparisons [I, from peaks.js lesson: one float NaN at init silently blanked a view — §8.1].

- `clip_len_pf = (source_out − source_in) × project_rate // source_rate` (floor of the exact rational; valid because offsets are counted from the clip start).
- `cue_project_time = timeline_start + (source_sample − source_in) × project_rate // source_rate` (floor).
- Derived, not stored: any consumer recomputes from (media_id, source_sample, current clip layout). Consequence [I, **EXECUTED** W1b]: inserting a gap, trimming a join, or adding a crossfade shifts exactly the downstream cues by exactly the inserted/removed amount — nothing drifts with edit history (P1, P7 PASS).
- **Rounding:** floor everywhere, documented as "frame floor from clip origin". No chained fractional conversion exists, so no accumulation error is possible [I].
- **Boundaries:** `source_out` is exclusive; the frame at `source_out` belongs to no frame of this clip. Butting clips: clip N's exclusive end equals clip N+1's `timeline_start`; a cue there reads as the next clip's frame 0 (P3 PASS). A cue exactly at a removed boundary is flagged `at_removed_boundary` and surfaced for review, never silently dropped [P].
- **Transitions:** v1 = equal-power crossfade of D project frames **overlapping existing time** (clip B's `timeline_start` moves earlier by D; total duration shortens by D). Gain law cos/sin, sum-of-squares ≈ 1 (P5 PASS, maxerr 2.2e-16). Cues inside a crossfade keep source-anchored identity and are flagged `in_transition`; export can include them with a warning column. Inserted gaps are explicit `gap` items at project rate; they shift downstream `timeline_start`s — cues re-derive, nothing else changes.
- **Channel mapping:** v1 sources mono or stereo [P]. Mono→stereo duplicates L=R; stereo→mono uses (L+R)/2 with headroom check and a recorded warning if clipping is induced; mismatched layouts at a join refuse with a named error. Sample representations convert once at import (int→float internally, dither only at final 24-bit render, recorded in the manifest) [P].
- **What a cue means at an edit boundary:** the cue names a source sample; if that sample is currently hidden by a trim, the cue renders grayed with its original identity and derived position of the nearest visible frame, plus `hidden: true` — reviewers can still tell what the previous editor heard [P].

### 3.4 Cache identity and invalidation
Waveform overview/detail caches are keyed by `(media_sha256, channels_used, ppm_bucket, bit_depth_of_minmax)` — the same identity fields waveform-data/peaks expose in their data format (JSON v2 fields `channels`, `sample_rate`, `samples_per_pixel`, `bits`, `length` [F, observed in peaks.js #574 reproduction data]) — and are **content-addressed by source hash**, so any source change produces a new key automatically. [F] The necessity of this rule is documented in peaks.js itself: v2.0.0 changelog — "The waveform cache is now cleared on calling `setSource()`. This would cause the waveform to not be updated when it should" (changelog capture 44673a30…; fix commit `39a29933` "Clear waveform cache on setSource()", 2022-04-18), responding to user report #452 ("zoomview not update setsource").

### 3.5 Distinct tiers (brief requirement)
1. **Non-destructive edits**: clips/trims/joins/cue — in `project.json`, affect exports.
2. **Display-only settings**: preview gain, zoom, solo/mute, colors — `display_settings`, never touch audio or exports; the review mix exports at gain 1.0 with its own recorded, explicit render gain if the user sets one **at export time** [P].
3. **Rendered audio operations**: only inside a `render_manifest` with parameters and status; the project never contains rendered audio except via a manifest that owns it.

## 4. Architecture choice and bounded alternatives

**Chosen [P]:** Python 3.11 + PySide6 (Qt6) desktop app; audio file I/O via libsndfile (Python `soundfile`) for PCM/WAV/FLAC/AIFF; FFmpeg subprocess for compressed-input decode at import; **pull-based streaming audio engine** (disk → bounded ring buffer → device, no whole-file decode); waveform overview computed streaming once per source (2 h @ 1 ppm ≈ 7,200 min/max points per channel ≈ 57 KB [I]); zoomed detail computed on demand from bounded windows; Qt command-pattern undo stack mirrored into the project journal.
Rationale: team of four, offline, editorial (not broadcast) latency targets; JSON project keeps exchange diffable; libsndfile gives the tested I/O core; FFmpeg confines codec risk to a batch import step.

**Bounded alternative A [P]:** C++/Qt + PortAudio/RtAudio whole-native app — lower latency and single-binary deployment, materially higher build/maintenance cost; same data contract would apply. Choose only if scrub latency on 8 GB laptops proves inadequate (measure first; §8 validation).

**Bounded alternative B [P]:** adopt OpenTimelineIO as the **core** timeline model. Rejected for core use: [F] OTIO "contains information about the order and length of cuts and references to external media. It is not however, a container format for media" (README@v0.18.1, capture b53290e2…), and post-0.16 adapters were split into a separate PyPI package — depending on it as the spine would couple our project format to a film/TV interchange's release cadence. **Adopted as export adapter instead**: an `otio` export maps our clips to OTIO clips with rational-time rates, giving free interop with EDL/AAF consumers [P].

## 5. Resource plan, recovery, exchange

### 5.1 Two hours on 8 GB RAM
[I, arithmetic] 2 h stereo 48 kHz 24-bit ≈ 2.07 GB — never held in RAM. Streaming playback uses ~64 MB ring buffers per active track; detail-waveform windows bounded (~4 MB); overview caches ≈ tens of KB per source. Budget: < 300 MB steady-state [I]. Import indexing and rendering run on worker threads with **progress + cooperative cancel**; cancel deletes `.part` artifacts and writes nothing to project state.

### 5.2 Interrupted operations
- **Import:** staged `.part` + manifest row only after full hash; crash leaves orphan `.part` cleaned on next start.
- **Save:** write `project.json.tmp` → fsync → atomic rename; `.autosave` snapshot every 2 min [P]; on reopen, offer autosave recovery (project file remains authoritative; no silent overwrite — dialog lists both).
- **Render:** output to `.part`, then hash, fsync, rename, and only then commit the manifest row with `status: complete, output_sha256`. **A cancelled render writes `status: cancelled` or nothing at all — it is never labeled a complete export** [P, brief requirement]. [I] Audacity's manual documents why exit-time integrity matters ("Ensure the project is fully saved before exiting… If there is a progress dialog for saving… wait for it to complete") and its crash-recovery note ("you may lose the very last thing you were doing") — our manifest discipline aims to make that loss explicit instead of silent.

### 5.3 Export manifest
`{render_id, project_revision, params{rate, format, gain, dither}, input_media_hashes, output_path, output_sha256, status, started/finished_utc}`. The cue table export carries: cue_id, label, media_id, source_sample, source timecode, project time, export time, flags (`in_transition`, `hidden`, `at_removed_boundary`). Displayed timecodes = project frames / project_rate rendered as HH:MM:SS.mmm with the rounding rule printed on the panel [P].

### 5.4 Project exchange, relocation, missing media
- **Bundle:** a folder (zip-able): `project.json`, `media/` (copies of sources, default ON [P] — disk cost accepted for 4-editor correctness; import dialog offers reference-in-place with a warning, learning from [F] Audacity's dependency model), `cache/` excluded from bundles.
- **Open:** verify each `media/` file sha256 against the registry. **Missing → "locate" dialog; changed hash → "content differs from project" warning with both hashes shown; originals on disk are never overwritten** by any app action [P].
- **Recovery without overwriting:** every save targets the opened project file only after explicit user action; autosave never writes over `project.json`; bundles are versioned by `project_revision` monotonic counter.

## 6. Accessibility and editor experience (v1 requirements)
[P, brief-mandated] Full keyboard navigation (transport, playhead by frame/second/region, cue list navigation, tab-order everywhere); legible transcript pane synced to playhead with adjustable font size and high-contrast theme; screen-reader labels on all controls; errors as text+status, never color-only; undo/redo with a visible history list; solo/mute and channel choice per track; a **current-edit indicator** (which clip/cue/region has focus, shown textually); a **provenance inspector** showing for any playhead position: media path+hash, header metadata + ambiguity flags, and the exact integer mapping (source sample ↔ project frame ↔ timecode) that produced it — the "inspect timing/provenance" obligation made concrete.

## 7. Undo/redo
Command-pattern; each edit is a journal entry (inverse-applicable), so undo/redo survives save/close/reopen of the *project* (journal persists in `project.json`) [P]. [F] Contrast: Audacity does not persist undo history with the project ("the Undo history is not saved with the project… history starts afresh", manual capture) — a deliberate divergence for an editorial team that needs to see what the previous editor did.

## 8. Evidence: precedents, issue chain, limits

### 8.1 Precedent 1 — BBC peaks.js (waveform/cue component): cache identity, single-capture duration, fix→regression recurrence
- [F] Latest GitHub release v3.4.2 (2024-08-15, capture d36f237e…); the project also ships 4.x on npm (issue #574 tested against 4.0.0) — **version-binding note:** GitHub "latest release" and npm dist differ; lessons below are version-independent at the mechanism level and cited at exact commits.
- **Issue chain (followed end-to-end):**
  - **#450** (2022-04-12, closed 2022-04-27): "[BUG] Played/Unplayed waveform color bug if getDuration() returning NaN"; reporter locates `src/waveform-overview.js#L407` at commit `6bfafd5f`; init before `<audio>` metadata → duration NaN → waveform blank (capture 185a5ef4…).
  - **Fix commit** `cad281799a01668c81177a22b39b4ffa7eb5d228` (2022-04-16/27, Chris Needham): "Changed player initialisation to be async… wait for a loadedmetadata metadata event before initialising the waveform views, otherwise the media duration will be NaN. See #450" — 10 files, +289/−148, **including regression tests**: `test/unit/api-player-spec.js` gains a "custom player that fails to initialize" context (rejected `init()` Promise must surface as a `Peaks.init()` error), `test/unit/api-spec.js` covers `setSource()` MediaError propagation and listener preservation (patch capture d2a88d44…).
  - **Companion cache fix** `39a29933d50bea658943c721a7c86d46d05b635a` (2022-04-18): "Clear waveform cache on setSource()".
  - **Release applicability:** both shipped in **v2.0.0 (2022/04/27)** (release commit `8071694ae933c51fed2f83b4c6ec14b768b787b7`; changelog capture 44673a30…). The #450 fix was **breaking API** (custom player `init()` must return a Promise; migration-guide@v2.0.0, capture afbb4142…).
  - **Causal limits [F]:** open issue **#574** (2026-08-10, against 4.0.0) reproduces the *same* NaN-duration blank when media is attached **after** init (MSE/`setSource` pattern), with root-cause locators `src/waveform-view.js#L229` (duration captured once into `_unplayedSegment.endTime`), `#L423`, and `src/waveform-shape.js#L143-149` (NaN defeats all clamps since every comparison with NaN is false). I.e., the v2.0.0 fix covered src-at-init only; the family recurs on the attach-later path. This is the concrete proof that "an issue title, patch link or successful single example does not establish complete behavior" — our design must re-derive durations from immutable parsed facts rather than capture-once.
- **Lessons adopted:** content-hash cache identity (§3.4); no captured-once durations anywhere; NaN/absent metadata must raise or flag, never silently propagate (W1 P6); cue events exist as a component pattern (peaks.js `emitCueEvents`, changelog 0.11.0/#268).

### 8.2 Precedent 2 — OpenTimelineIO v0.18.1 (interchange model): reference-vs-container separation
[F] Pin: tag v0.18.1, commit `44236713c1db295a6ffc66189ae98dbdfd0cb9c4` (tags capture fe4ee24b…). README@v0.18.1 (capture b53290e2…): OTIO is an "interchange format and API for editorial cut information… not a container format for media"; core C++ + `opentime` dependency-free time library; Python bindings; API "considered stable" but "still undergoing active development"; post-v0.16 PyPI split of core vs plugins. **Lessons adopted:** keep our own minimal project schema (we are the container) and expose OTIO only as an adapter; represent every time as rational {value, rate} — our integer frame algebra is the same discipline; media references are relocatable pointers requiring a link/verify step (our sha256 relocate flow, §5.4).

### 8.3 Cautionary whole-product precedent — Audacity
[F] Manual (capture ba792f6a…, partial): non-destructive project; AUP3 readable "only by Audacity"; undo history not persisted; trimmed audio retained hidden ("project bloat" acknowledged, no per-item purge command); external-USB/network save discouraged; FAT32 4 GB single-file limit; WAL/SHM sidecars must not be moved; crash recovery "normally robust… may lose the very last thing". **Lessons:** plain-JSON diffable project; visible trim policy; persist the journal; explicit dependency handling at save; never leave implicit sidecar state editors can break by moving files.

### 8.4 I/O boundary precedent — libsndfile 1.2.2
[F] See §2. Adopted pin: libsndfile ≥ 1.2.2 (latest per homepage footer; release history in capture). [I] MP3 read exists since 1.1.0 but we still route compressed input through FFmpeg decode-on-import for cache/manifest determinism (§2).

### 8.5 Protected-breadth precedent — aeneas 1.7.3 (forced alignment; opportunity lane)
[F] README (capture 6263a1ca…): forced-alignment library producing synchronization maps (JSON/CSV/ELAN EAF/Audacity labels…); AGPL v3; version 1.7.3 (2017-03-15, effectively frozen); requirements include eSpeak and FFmpeg; explicit limitation: "No protection against memory swapping… 4 GB RAM ⇒ max 2h audio"; audio "assumed to be spoken". **Lesson:** alignment output is exactly a draft cue list, but the RAM bound and AGPL license make it an **optional, out-of-process, opt-in** pipeline writing draft cues the editor confirms — never a silent dependency (§9).

### 8.6 Breadth notes (V14)
Protected discovery outside whole-product competitors this stage: peaks.js (waveform component), waveform-data.js (cache format; the `doc/` spec paths 404'd on `main` and `master` — limitation recorded in leads.json), OpenTimelineIO (interchange), libsndfile (I/O), aeneas (alignment), OHMS attempt (failed: ohms.org now serves an unrelated charity site — capture 87c29e02…, excluded; lead preserved). Defect-hunting lane: the peaks.js #450/#452/#574 chain above. Opportunity lane: aeneas.

## 9. Opportunities and alternatives (explicit, not obligations)
- **Opportunity (recommended, optional):** draft transcript cues via forced alignment (aeneas now; ASR later) importing as *unconfirmed* cues with per-cue confirmation state; AGPL isolation as an external process; aligns with the oral-history transcript-cue workflow and EAF export compatibility.
- **Alternative (recommended to keep open):** OTIO export adapter for interchange with archival/EDL tooling (§4B).
- **Deferred [P]:** automatic transcription (model size/offline constraints on 8 GB laptops unverified — UNEXECUTED), noise reduction, shared simultaneous editing, cloud accounts.

## 10. Critical dependencies and unresolved risks
1. **FFmpeg decode determinism** for compressed sources [I]: mitigated by decode-on-import + decoder identity in manifest; risk: cache rebuild changes bits → mitigate by pinning FFmpeg build per release (PROPOSED/UNEXECUTED verification).
2. **libsndfile format coverage assumptions** beyond the homepage list (e.g., BWF chunk edge cases): homepage fact is general [F]; per-format behavior UNEXECUTED — bounded alternative: restrict v1 inputs to WAV/FLAC/AIFF only.
3. **PySide6/Qt audio path latency** on 8 GB laptops: UNEXECUTED; fallback Alternative A (§4).
4. **peaks.js-style recurrence risk in our own code:** any "compute once at init" pattern; mitigated by W1-style property tests in CI (proposed).
5. **2 h import/render wall-clock targets** (index < 5 min laptop-class, seek < 150 ms, overview < 60 s): PROPOSED/UNEXECUTED targets, to be measured on the reference laptop before v1 claim.

## 11. Validation plan
**EXECUTED by candidate (bounded isolation; component-arithmetic only — does not prove the whole editor):**
- **W1** (exec-293woo_i): first algebra/crossfade check run; **P1/P3/P4 FAIL — candidate check-authoring bugs** (sign error in expected shift; boundary test placed across an inserted gap; 400-loop total compared to a one-pass expectation). Receipts preserved.
- **W1b** (exec-66t9pgwy): corrected run — P1 cue-history-independence, P2 monotone floor mapping, P3 exclusive-out boundary, P5 crossfade sum-of-squares (2.2e-16), P6 missing-source guard, P7 layout-total consistency **PASS**; **P4 remains FAIL** due to a residual off-by-one in the *expected* value (399 vs 400 clips; difference exactly one 480,000-frame clip). The accumulation itself is by-construction the sum of per-clip terms. Limitation preserved, not silently "fixed".
- **W2** (exec-2lvjq6af): independent recomputation of one captured artifact's sha256 — **MISMATCH**: hand-transcribed body was 1762 vs 1768 bytes (6-byte transcription loss by the candidate). Capture identity therefore rests on the capture tool's reported sha256 values recorded in sources.json; no independent byte-level fidelity claim is made.

**PROPOSED/UNEXECUTED:** golden-mix fixture (3 sources: 48k/24 stereo voice, 44.1k/16 mono backup, 48k mono noise; construct expected sample arrays for seams and assert equality); cue round-trip save/close/relocate/reopen identity; cache-invalidation test (mutate a source byte → new hash → regenerated overview); cancel-during-render → no manifest/no output file; kill-during-save → autosave recovery dialog; >2-channel refusal; ambiguity-flag surfacing test; keyboard-only task walkthrough with screen reader; 2 h import/seek/render performance on 8 GB laptop; OTIO adapter round-trip.

## 12. Summary of commitments
The v1 workflow, data contract, position algebra, cache identity, recovery semantics, exchange flow, accessibility floor, and support boundary above are implementable as specified without promising every codec or channel layout; every obligation in the brief maps to a section here, with executed checks limited to bounded arithmetic (§11) and all product-level validation explicitly PROPOSED/UNEXECUTED.
