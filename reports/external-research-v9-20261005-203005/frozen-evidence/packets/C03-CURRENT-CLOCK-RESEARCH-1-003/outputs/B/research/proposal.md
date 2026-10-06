# Verbatim Desk — offline oral-history audio review & edit exchange (research proposal, stage: research)

Stage: research (ER9, role research). Date of record: 2026-10-06. This is a standalone implementable proposal derived from the assigned brief alone; it is not a full application build. Evidence labels used throughout: **[FACT-S]** = source fact from a pinned public capture, **[INFER]** = engineering inference from those facts, **[CHOICE]** = product decision we are free to make, **[EXEC]** = executed by candidate in admitted isolation, **[PROPOSED/UNEXECUTED]** = planned validation not run in this session.

---

## 1. Scope and product shape

Four editors on ordinary 8 GB laptops work offline on oral-history interviews. They exchange project bundles on folders/USB. The tool is an editorial/research workstation, not a live broadcast or server product. Non-goals for v1 (deliberately **not** converted from features seen elsewhere into requirements [CHOICE]): automatic transcription, noise reduction, simultaneous multi-user editing, cloud accounts, video, MIDI, effect plugins, metering beyond clip/light.

Minimum supported workflow (each step maps to a named component in §5): import several long recordings with differing sample rates/channels/sample formats → inspect metadata → listen and scrub → add named regions and transcript cues → trim a passage → join selected clips with optional short transition → set preview gain → save → close → reopen → export a review mix + cue table. Original recordings remain byte-identical (hash-verified).

## 2. Supported input/output boundary (v1) — stated honestly

**[FACT-S]** libsndfile's changelog shows MPEG (MP3) decode/encode arrived in 1.1.0 (2022-03-27) and is split per-layer and *build-dependent*: decode uses libmpg123, encode uses libmp3lame, "Encoding and decoding support is independent of each other" (capture S04, section 1.1.0). Opus support in consumers "requires libsndfile 1.0.29 or later" (capture S01, `--input-filename` note), and 1.2.0 removed libsndfile's artificial 65 535 0 Hz sample-rate cap (capture S04, 1.2.0). MP3 files without Xing/INFO headers only read correctly from 1.2.1 (capture S04).

Boundary we commit to in v1 **[CHOICE, gated on the facts above]**:

- **Read/edit (first-class):** WAV, AIFF, FLAC; PCM 16/24/32-bit int and 32/64-bit float; mono/stereo; 8–192 kHz (also accepts >192 kHz since 1.2.0 lifted the cap, but the UI flags it as unusual).
- **Read/preview-only, with verified PCM proxy:** MP3 (Layer III) and Ogg Vorbis *only if* the linked libsndfile reports MPEG/Vorbis support at runtime (feature-detect at first import, since support is build-dependent, S04). On MP3 import we build a PCM proxy sidecar in the bundle cache (see §7) because seeking correctness in lossy formats is exactly where the #643 bug class lived (§4.1). The proxy is verified by full-decode hash; the original file is never written.
- **Not supported in v1 (explicit error, no silent degradation):** AAC/M4A/AC-3 write; >2-channel editing (channels >2 may be imported read-only for listening + per-channel solo); 8-bit-u-law etc. containers listed by libsndfile but not in our test matrix (import refused with a message naming the format).
- **Write:** review mix as WAV (PCM 24-bit default, 16/32f optional) or FLAC; cue table as CSV + JSON sidecar. No MP3/AAC export.

## 3. Data contract (project / media / timeline)

### 3.1 Bundle layout

```
interview.bundle/
  project.json            # authoritative edit state (versioned schema_version=1)
  project.v1..vN.json     # rolling save history (keep 5)
  project.autosave.json   # 30 s journal of unsaved edits + view state
  sources/                # immutable copies of original recordings at import
  cache/peaks-<hash16>-<tier>.wpk
  exports/                # completed artifacts only (see §8)
  logs/
```

A bundle may also be shipped as a single zip for exchange; opening a zip extracts to a folder first. **[INFER]** Loose files + a small manifest beat a monolithic database for exchange: Audacity's monolithic `.aup3` SQLite file has an open, reproduced corruption report on "Save Project As" with waveform loss (capture S11) and an open proposal to stop *writing autosave into the user's original project file on open* because it mutates files users did not change (capture S10). Our originals are copied into `sources/` and opened read-only; nothing outside the bundle is ever written.

### 3.2 Source media record

`source_id` (UUID), `relpath`, `sha256` (file bytes), `bytes`, `format_observed {container, sample_rate, channels, frames, encoding}`, `metadata_status ∈ {clean, ambiguous, partial}`, `ambiguity_notes[]`, `role` (user label: voice / backup / ambient), `imported_by`, `imported_at`, `original_path_hint`.

**Metadata ambiguity policy.** Values come from one parse (libsndfile `SF_INFO`). Contradictory or absent metadata (e.g., header rate vs. fact-chunk rate, `frames` claim vs. readable frames, unsupported encoding tag) is **never silently normalized**: we retain the first observed value, append details to `ambiguity_notes`, set `metadata_status=ambiguous`, and block sample-exact operations (cue placement at sample resolution, lossless joins) until the user confirms an interpretation — the confirmed interpretation is recorded in the project. The original file is never rewritten. **[FACT-S]** This mirrors the upstream practice we observed in the #643 fix itself: where Vorbis' last-page granule position is ambiguous, libsndfile logs *"Cannot calculate ambiguous last page duration. Sample count may be wrong."* rather than guessing (capture S08, patch text). **[FACT-S]** Sample-count bugs are real and subtle — issue #643 lost 1024 samples on a seek+partial read (capture S05).

### 3.3 Timeline and cue model (the core contract)

Canonical coordinates and the explicit relationship required by the brief:

1. **Source sample position** — int64 index into the source file at its own `sample_rate`. Half-open interval convention everywhere: `[in, out)`.
2. **Clip-local position** — `local = src − clip.source_in`. Pure bookkeeping, no rate change.
3. **Project time** — integer samples at a project rate `P` fixed at project creation (default 48 000). Conversion is **exact rational**, never via float seconds:
   `proj(s, R) = round_half_even( s · P / R )` computed in integer/Fraction arithmetic.
4. **Displayed timecode** — `HH:MM:SS.mmm` derived by *flooring* the project-sample position to display precision. Display-only; never persisted as an anchor; every anchor copy-paste moves the full-precision value.
5. **Exported cue position** — project-sample position recomputed at render time from the same rational mapping under the exported `edits_revision`, plus the source timecode, plus a mapping status.

**Cues anchor to the source, not the timeline.** A cue is `{cue_id, text, author, created_at, anchor: {source_id, src_sample}, derived: {proj_sample, edits_revision}}`. Trims, resampling, inserted gaps, or clip moves change `derived` deterministically (recompute from `anchor`); the meaning — the same audio content — cannot silently change. On project load, `derived.proj_sample` is recomputed and compared; a mismatch means a stale/foreign cache and is repaired with a warning. **[INFER]** This "keep the lossless coordinate authoritative, denormalize for speed, verify on load" pattern is the direct counter-lesson to peaks.js PR #171 (capture S14), where dragging a segment by round-tripping pixel→time→pixel produced a precision/rounding error that "both handles … move uncontrollably"; the fix direction was to treat the ground-truth coordinate (pixel there, source sample here) as authoritative instead of an intermediate derived value. Peaks.js issue #530 (capture S13) shows the same class surfacing as `getCurrentTime()` rounded to 3 decimals disagreeing with the unrounded zoomview display — hence our rule that display values are floors for presentation only.

**Rounding and boundary rules (normative for implementation):**
- All rate conversions round half-to-even on the exact rational; ties are deterministic and tested.
- Interval boundaries are half-open `[in, out)`; a cue at `out` belongs to the *next* media interval, not this clip.
- Trim: a cue whose anchor falls outside the kept range is dropped *with the media*; the UI offers an explicit, recorded action "clamp boundary cues to kept range" (clamped cues get `mapping_status=clipped_to_edge`).
- Gap insert: changes project placement only; cue follows its clip via the source anchor.
- Join with transition of `F` project samples (default 10 ms equal-power crossfade when joining different sources; linear fade for same-source continuity [CHOICE]): a cue whose derived position lies inside a fade region keeps its anchor, gets `mapping_status=in_transition` with the fade span recorded, and exports at the project position of its **first** occurrence; if the same source range appears twice in the mix, each occurrence is listed.
- Channel mapping: no implicit channel conversion anywhere. Explicit render ops only: mono→stereo duplicates the channel; stereo→mono takes the arithmetic mean (documented −3 dB in-phase behavior); >2 ch is not edited in v1. Solo/mute/channel-choice are **display-only** (§3.4).
- Cue table export columns: `cue_id, text, author, source_id, source_timecode, project_timecode, mix_timecode, mapping_status ∈ {exact, clipped_to_edge, in_transition, missing_media}, edits_revision`.

**[EXEC]** The arithmetic core of these rules was checked in admitted isolation (witness W1, exec-vn2bccpa, exit 0): monotonicity of 44 100→48 000 mapping over a 2 h span sampled at a prime step (0 violations), half-open trim boundary (cue at 1 999 999 kept, cue at 2 000 000 dropped), rational composition law at one tested point (direct vs. composed conversion agreed exactly at that point; the test asserts a ≤1-sample tolerance class rather than claiming universal equality), crossfade flagging, min/max waveform bucketing with short-tail bucket, cache-key determinism, and the memory figure in §6 (2 h stereo 48 kHz float32 = 2.57 GiB). **Scope limit:** pure arithmetic in a sandbox; this proves nothing about any audio library, file I/O, or the assembled editor.

### 3.4 Three distinct state stores (brief requirement)

- **Edits (nondestructive):** ordered command list with `edits_revision` (monotonic int). Commands: `import, clip_place, clip_move, trim, join, gap_insert, region_add, cue_add, cue_edit, clip_gain, fade_set`. Undo/redo = inverse commands; the revision bumps on every edit.
- **Display-only (`view_state`):** preview gain, zoom, playhead, solo/mute, channel choice, selection. Persisted in autosave/view state; **never** read by the renderer. "Set preview gain" in the brief maps here; exporting with gain requires an explicit "promote to mix gain" action that creates an edit command.
- **Rendered (jobs):** `render_jobs[] = {job_id, kind: review_mix|cue_table, settings, status: draft→rendering{progress}→complete|cancelled|failed, source_hashes, edits_revision, artifacts[]}`. A cue-table export and a mix export from the same session share a manifest id so reviewers can see they came from the same revision (§8).

## 4. Precedents investigated (two independently useful + components)

### 4.1 Issue → fix → release chain (followed in full): libsndfile Ogg/Vorbis seek sample loss

- **Issue #643** "missing samples when doing a partial read of ogg file from index till the end of file", opened 2020-10-22, closed 2021-02-16, milestone v1.1.0 (capture S05): seeking to 389 999 of 396 519 frames then reading 65 536 returned 5 496 frames instead of 6 520 — exactly 1 024 samples missing; the reporter observed bad start indices ≥ 2·samplerate+1.
- **Bisected by the reporter** (capture S06, comment 2020-10-23): first bad commit `ea87e01ca25b41012db18ef3d1acb8e14f2aba1f` "Vorbis: Use new ogg functions, add bisection seek support" (2019-02-20). So the bug shipped in 1.0.29/1.0.30 and was latent ~18 months.
- **Diagnosis** (capture S06, maintainer comments 2020-11-09/10/30): seeks ≤ 2 s ahead take a read-and-discard path, longer seeks take the bisection path — "I guess this wasn't picked up by the test suite because it must not test seeks of more than 2 seconds"; symptom "acts as if there is an unaccounted for decoder delay … first 20ms or thereabouts … after `vorbis_synthesis_restart()` go missing"; root cause: code did "not take into account the full-lapped nature of vorbis blocks"; page sample offsets must be computed from granule positions per the Vorbis I spec (§1.3.2 window shapes).
- **Fix:** PR #709 "Fix for Issue 643: Vorbis Seek Offset", merged 2021-02-16T05:37:51Z, "Fixes #643" (capture S07); shipped in libsndfile **1.1.0 (2022-03-27)** per the changelog entry "Missing samples when doing a partial read of Ogg file … (issue #643)" (capture S04).
- **Regression-test status (honest limit):** the PR's file list (capture S08) shows **only** `src/ogg_vorbis.c` (+243/−101, merge-head blob `1b6b386a207637bb9da83914c2837006aa6bb967`) — **no test file in the merged PR**. I did not locate a later dedicated >2 s-seek regression test in this session; the limitation is preserved rather than papered over (lead L4).
- **Causal limits:** the repro and fix are Ogg/Vorbis-specific (lapped-block granule accounting). This does **not** establish that FLAC or MP3 seeks in libsndfile are sample-exact, nor that any fixed version covers all seek patterns. An issue title, a patch, or one passing example does not establish complete behavior.
- **Lessons adopted in the design:** (1) never assume decode-and-seek correctness for lossy/lapped codecs — hence MP3/Ogg imports get a verified PCM proxy (§2) and an import-time seek-sanity probe; (2) the test-suite gap (only short seeks tested) is why our own property tests must cover *long-file, far-seek, tail-read* patterns explicitly (§9); (3) expose ambiguity instead of guessing (§3.2).

### 4.2 Precedent A: Audacity (nondestructive EDL + recovery; cautionary monolithic-store lessons)

**[FACT-S]** Audacity's automatic crash recovery rolls back to the latest safe "snapshot"; the recovered project remains in unsaved state; and — explicitly documented — "The project history is not recoverable" and label text being typed at crash time is lost (capture S09). **[FACT-S]** The autosave mechanism writes into the user's `.aup3`/project file on open, mutating files the user did not change (open proposal #8332 documents mtime churn, cloud re-uploads, autosave bloat, and "autosave cannot corrupt user's projects, as I've heard users report") (capture S10); and a reproduced open bug (#11244) reports "Save Project As" corrupting projects with waveform loss at `DBConnection.cpp:473` on Audacity 3.7.8/Windows 11 (capture S11). **[INFER]** Lessons: keep a small text manifest + immutable media files; write autosave **inside our own bundle only**; state clearly in-product that undo history is session-only; make every save atomic (tmp+fsync+rename) with versioned history — because the biggest data-loss class in the most widely used tool in this genre is the project store, not the codec.

### 4.3 Precedent B: BBC audiowaveform + peaks.js (waveform cache format, cue markers, accessibility)

**[FACT-S]** audiowaveform defines a small binary waveform format: header {version, flags(8/16-bit), sample rate, samples-per-pixel, length, channels (v2)} followed by interleaved min/max pairs; v1 collapsed stereo→mono on generation; v2 added per-channel data (capture S02). Its cache files do **not** carry any identity of the source media they were derived from (capture S02). peaks.js consumes these files (`-b 8` recommended because 16-bit waveform files are unsupported there, capture S03), offers point/segment markers, zoom, and "mouse, touch, scroll wheel, and keyboard interaction" (capture S03), and computes waveforms via Web Audio in-browser — which peaks.js's own docs warn "involves downloading the entire audio file … and is CPU intensive" for long files (capture S03). **[INFER]** Lessons adopted: (1) our peak cache embeds `source sha256 + tier + bucket size + source rate/ch/frames` in the header so stale caches are detectable — identity the upstream format lacks; (2) min/max/RMS stored as float32, not 8/16-bit quantized; (3) per-channel peaks, never silent mono collapse; (4) precomputed multi-resolution peaks over decode-on-open (Web Audio style) is the right call for 2-hour files; (5) keyboard interaction and marker editing are table stakes we must match. Both BBC projects note development moved to codeberg.org/chrisn/* (captures S01/S03) — version pinning must note the relocation (lead L1). Neither BBC repo is a runtime dependency of our design; audiowaveform's license is "See COPYING" in the README and was **not verified this session** (lead L2); we reference the *documented format*, we do not reuse its GPL-codebase binaries.

## 5. Architecture (coherent choice + bounded alternatives)

**Chosen [CHOICE]:** modular monolith, **Python 3.11 + PySide6 (Qt6) UI** + engine library with **libsndfile via soundfile** for decode/encode, **NumPy** for block math, optional **libsamplerate** for review-quality resampling. GUI process owns windows; engine is a plain importable module with no Qt types; long operations (peak build, render, hash) run in worker threads/`QThreadPool` with progress + cancel tokens. Rationale: the team is small, the workload is single-user per bundle, offline; Python + NumPy block processing is comfortably inside budget for 2-source 2-hour projects; fastest path to the correctness-critical pieces (the §3.3 contract).

**Alternative A (plausible, documented):** Electron/web front-end on **peaks.js + waveform-data.js** with a small local Python sidecar for file decode and export. Pros: accessible waveform/cue components already exist with keyboard support (S03). Cons: two runtimes to maintain; Web Audio decode of 2-hour files is memory/CPU-hostile by peaks.js's own documentation (S03); sandboxed file access complicates bundle/USB exchange. Kept as a future front-end swap because our engine/UI split (no Qt types in the engine) leaves this open.

**Alternative B (rejected with evidence):** adopt/extend Audacity as the engine. Its strengths (mature nondestructive editing, crash recovery, S09) do not reach our core needs — provenance-bearing cues with source-sample anchors and a manifest-based exchange format — while its project-store class shows open corruption and write-into-original-file issues (S10, S11) and label/cue export has selection-ignoring behavior (S12).

**Alternative C (deferred):** C++/Qt + libsndfile core if Python proves too slow on the render path. The engine's block API is designed to be portable; this is the bounded fallback, not v1.

Renderer: pull-based block scheduler — per-clip readers (libsndfile `sf_seek` + block reads), per-clip resampler objects (tier: `draft`=linear, preview only; `review`=windowed-sinc, export default [CHOICE]), mix buffer 1 s of project-rate float32, 64 MiB ring cap. Clipping honesty: mix chain is float32 with gain applied post-mix; every render pass records peak-per-block and the export report lists any block whose peak exceeds full scale (block ranges, not just a boolean); no soft-clip by default [CHOICE]. **A numerical duration or a clean exit is not treated as evidence the audio is right** — §9's fixture comparison is the check that content was assembled correctly.

## 6. Resource plan (2 h interview, 8 GB laptop)

**[EXEC]** 2 h stereo 48 kHz float32 = 2.57 GiB (float64 = 5.15 GiB) — whole-file decode is excluded by arithmetic alone (W1-C6). Therefore: streaming everywhere; decode block ≤ 4 MiB; render ring ≤ 64 MiB; peak-build pass is single-pass streaming (read file once, emit all tiers); LRU cap of 16 open source files. Peak cache on disk (float32 min/max/RMS at bucket sizes 256/4096/65536 ⇒ ~ (6+2+2 B)·3 tiers ≈ tens of MB per hour per source); assembled-timeline overview cached per `edits_revision`, LRU ≤ 256 MB, invalidated by revision bump only. RSS target < 800 MB with a 2 h project open — **investigation target, not a claim [PROPOSED/UNEXECUTED]**. Progress + cancel on: import hashing, peak build, render. Seek/scrub: peak cache gives O(1) drawing; audio scrubbing uses a 0.5 s prefetch window; scrub latency target < 50 ms — again a target to investigate [PROPOSED/UNEXECUTED].

## 7. Exchange, relocation, missing media, recovery

- **Identity:** `sha256` of file bytes + UUID. Import copies sources into the bundle and hashes them (progress + cancel; cancelled import leaves a `pending` source record that is re-hashed on next open — never half-trusted).
- **Relocation:** the manifest stores `original_path_hint` + filename + hash. On open, missing files are resolved by: exact path → sibling scan → hash scan of user-declared watch folders. A match is accepted **only on hash** (or, for huge files, size+head/tail hash with an explicit user confirmation); a same-name/different-hash file is a hard conflict requiring an explicit decision — no silent substitution.
- **Missing media:** project opens with placeholder clips (silent, outlined, listed in a Media panel); cues over missing media export with `mapping_status=missing_media`; the mix export refuses or renders placeholders only with an explicit per-job setting.
- **Save/close/reopen:** save = serialize `project.json.tmp` → fsync → rename → rotate history `project.vN.json` (keep 5). Crash mid-save cannot corrupt the last good file. Recovery on open: detect `.tmp`/stale autosave/history tail, present one dialog with file sizes/timestamps; restoring never deletes the newer artifact without user action.
- **Cancelled/interrupted renders:** state machine only; a cancelled or crashed render job writes `status=cancelled|failed` into the manifest, moves/deletes the partial file (`.partial`), and the artifact is **never listed or labeled as a complete export**; the exports panel shows complete artifacts with manifest id + edits_revision + source hashes.
- **Originals:** the app's only write outside `cache/`/`exports/` is the initial copy into `sources/`; verification re-hash command available; nothing ever writes into the user's original recording location (direct counter-design to the behavior documented in Audacity #8332, S10).

## 8. Reviewer-facing provenance (what the next editor sees)

- Transport/cue keyboard map (full table shipped in-app): Space play/pause, J/K/L scrub, ←/→ nudge, C cue at playhead, R region from selection, T trim to selection, G insert gap, Ctrl+Z/Shift+Z undo/redo, F6 pane cycle, Tab into transcript. Every command reachable by keyboard; visible focus ring; transcript panel is selectable text at ≥12 pt scalable with high-contrast theme [CHOICE].
- Current-edit indication: breadcrumb of the last command ("trim clip-2 1:23:04.500–1:24:10.200"), dirty-state dot, selection always visually tied to its clip.
- Provenance inspector (per clip/cue): source file name, sha256 short, sample rate/channels/encoding, imported by/at, `metadata_status` + notes, applied edit ids, cue `mapping_status`. The cue table export carries the same fields, so a reviewer holding only the CSV + mix can verify revision identity via the shared manifest id.

## 9. Validation plan

**Executed by candidate (this session):** W1 — bounded arithmetic check of the §3.3 rules and §6 memory figure (exec-vn2bccpa, exit 0; details in witnesses.json). **Scope limits recorded there.**

**Proposed/UNEXECUTED:** (a) unit tests for rounding ties, half-open boundaries, cue clamp/transition flags; (b) property test: for randomized small fixtures, block-rendered output must equal a direct reference assembly sample-for-sample (this is the "content assembled correctly" check the brief demands — durations and exit codes are explicitly not accepted as evidence); (c) far-seek/tail-read suite for every supported codec on long files (the #643 lesson: short seeks were the tested case; ours must test >2 s and end-of-file reads); (d) golden mini-project fixtures (10–30 s generated WAV/FLAC committed to the repo) exercising import→trim→join+fade→cue→export→reopen round-trips with byte-hash comparisons; (e) perf/cancel harness on a 2 h fixture: import/peak/render wall time and RSS against §6 targets, cancel mid-render asserts no `complete` artifact exists; (f) manual accessibility pass: keyboard-only and screen-reader (NVDA/ORCA) walkthroughs; (g) four-editor exchange drill: USB handoff, source relocation, deliberate missing-media and hash-conflict cases.

## 10. Opportunities, alternatives, and unresolved dependencies

**Opportunity (useful, optional):** offline auto-transcription via whisper.cpp to pre-fill *draft* cues flagged `author=machine_draft`, confirmed by an editor into real cues. Kept out of v1 obligations; CPU time for 2 h audio on an 8 GB laptop is unknown to us (lead L6).

**Plausible alternative:** Alternative A (§5) — peaks.js front-end on a local sidecar — is the documented bounded alternative; its trade-offs are recorded, not hidden.

**Unsupported critical dependencies (explicit register):**
1. Sample-exact seek behavior of libsndfile for FLAC/MP3 at scale is **not verified by us**; the #643 chain proves the class is real and that fixes can ship without in-PR regression tests (S08). Bounded fallback: import-time full-decode pass that doubles as hash + peak build + seek sanity probe (cost: one extra pass on import; disk/time noted).
2. MP3 decode availability is build-dependent in libsndfile (S04) — runtime feature-detect + PCM-proxy fallback; if unavailable, MP3 is refused with a clear message.
3. libsamplerate quality/licensing for the `review` resampling tier not benchmarked by us; bounded fallback: `scipy.signal.resample_poly` with declared filter design.
4. PySide6 audio-output latency on Linux not measured; fallback: SDL2/miniaudio output backend behind the same sink interface.
5. Undo-history durability across crashes is **declared out of scope** (session-only), following the Audacity-recovery semantics (S09); editors are told this explicitly in-product.

## 11. Source and label discipline

Every [FACT-S] above is pinned in `sources.json` with URL, capture sha256, capture id, exact locator, and applicability. Claims about future behavior are [PROPOSED/UNEXECUTED]. The single executed check is inventoried in `witnesses.json` with its receipt identifiers. Open questions and leads (codeberg relocations, untraced peaks.js #530 fix commit, audiowaveform COPYING license, later libsndfile seek tests) are in `leads.json`. Per the brief: an issue title, patch link, or one passing example does not establish complete behavior — all four are treated accordingly.
