# Critique review — ScopeDesk proposal (Development Brief A)
Reviewer: candidate critique stage · Date: 2026-10-05 · Input: frozen `out/research/*`
Each finding states the correction, its evidence, what remains valid, residual uncertainty, and affected dependencies.

## F1 — Mis-cited evidence tag for "display state is separate from data" (CORRECTED)
- **Where:** research proposal §4.5 ended the sentence with "pattern evidenced by napari layers keeping contrast_limits/gamma as layer state … [F-S13/S14]".
- **Problem:** S13 is tifffile's changelog (wrong source for this claim), and the delivered window of S14 (first 32,768 of 253,595 bytes) does not contain the `contrast_limits` parameter text — only the class signature start and navigation tree were reviewed.
- **Correction (applied in final):** the display-vs-data separation now rests on what was actually captured: NGFF 0.4 §3.5 defines the `omero` channel window as *transitional rendering metadata* (window min/max/start/end + color) stored beside — not inside — sample data [S11], and QuPath 0.5.0 added save/restore of brightness/contrast display settings *in projects* [S09]. The napari-specific contrast_limits wording is dropped rather than asserted.
- **Preserved:** the design rule itself (views never write back to samples) is a product choice and stands.
- **Residual uncertainty:** napari's own docstring semantics for contrast_limits were never captured; if we later cite them, a new capture is required.

## F2 — Chain 2 (QuPath #1252): write-vs-read nuance made explicit (SHARPENED)
- **Where:** §8 chain 2.
- **Evidence recap:** the reporter's expected fix was "write a new temporary file, and then only rename if the writing has succeeded" [S05]; the maintainer's diagnosis was that the restore path expected `IOException` but an NPE could be thrown [S06 comment]; what shipped in PR #1255 is exception-wrapping in `PathIO.java` (re-throw EOFException; wrap others in IOException) [S07]; PR #1300 only added the CHANGELOG line [S08].
- **Correction (applied in final):** state explicitly that the *shipped* fix addresses the load/restore side (make failures arrive as the exception type the recovery code catches), which differs from the reporter's write-side proposal; ScopeDesk deliberately implements **both** halves (temp+rename atomic write [W-3, S15] and restore-or-refuse on open).
- **Preserved:** "no regression test identified" — supported only for the reviewed portion of PR #1255's file list (delivery cap: 32,768 of 42,959 bytes; noted in sources.json S07). This is stated as a limit, not invented away.

## F3 — Corroborating defect #2158 is listed under an *in-progress* release (QUALIFIED)
- **Where:** §8 corroborating defects ("'Add shape features' wrongly gives 'Length µm' in pixels (#2158)").
- **Problem:** that line sits under "Version 0.8.0 (IN PROGRESS!)" in the captured CHANGELOG [S09], i.e. the fix was unreleased at capture time.
- **Correction (applied in final):** label #2158 as recorded in the in-progress section; the *defect* is a public issue, the *fix* is not release-attributed. The same section of the final also keeps #1516 (v0.5.0, released) as the release-backed example of the same failure class.

## F4 — Overreach softened: "exactly the pieces we need" (SOFTENED)
- **Where:** §5.1 component 4.
- **Problem:** "exactly" is not demonstrable from a partially reviewed API page.
- **Correction (applied in final):** "includes the pieces we need (layers, transform utilities, cancellable workers, progress, QtViewer)" — the embedding-surface claim remains supported by S14's navigation tree and S04's architecture description; actual embedding effort remains an inference, explicitly carried into assumption table (§9) and gated by [U-1].

## F5 — W-2 tile assumptions and realistic margins (QUALIFIED)
- **Where:** §5.4 and witnesses W-2.
- **Problem:** the 24 MiB working-set figure assumes 2-D 256×256 uint16 tiles and ignores decode buffers, GPU uploads, and interpreter overhead; real Zarr chunking may be 3-D/5-D (t,c,z,y,x), changing chunk bytes.
- **Correction (applied in final):** figures presented as "tile-granularity lower bound"; added explicit margin factors and kept the envelope as an engineering target gated by UNEXECUTED [U-1]; U-3 extended to record real chunk geometry (not only `dimension_separator`).

## F6 — NGFF chunk-path form not asserted (PRESERVED WITH GUARD)
- **Verification:** research proposal already avoids claiming a default separator; NGFF 0.4 §2.1 illustrates a nested directory layout [S11 window] while the zarr v2 dotted form appears in ecosystem tooling [S13]; W-2 computed both forms.
- **Status:** preserved; adapter must derive the form from `.zarray` at import, verified against real files ([U-3]).

## F7 — Version pins and version-switcher oddity (NOTED)
- **Evidence:** napari 0.6.5 release JSON pin is `published_at 2025-10-02T02:18:34Z` (receipt), while the S14 API page metadata reports `theme_switcher_version_match 0.9.2` (stable docs move; EffVer). tifffile pin candidate: `2026.9.20` (first CHANGES.rst section) [S13]. NGFF spec revision meta `a4c68004…`, updated 2026-10-01 [S11].
- **Status:** no claim changes; final proposal pins the API-surface citation to "stable docs at capture" rather than to a napari release version, and keeps 0.6.5 pinned only for chain-1/release-notes claims.

## F8 — Execution labeling and honest failure history (PRESERVED)
- All executed checks (W-1, W-2, W-3) are candidate-authored and carry tool receipts (execution ids, code/data/stdout sha256, exit codes) copied into witnesses.json. W-1's first run failed (exit 1: harness `data` parameter arrived as a string) and was re-run self-contained; the failure is recorded in W-1's scope_limits rather than hidden. No evaluator-provided executions exist; nothing is labeled "executed only by evaluator".
- UNEXECUTED items (U-1…U-6) remain proposed-only; none is implied to have run.

## Preserved valid claims (no change)
- Chain 1 (napari #7962 → #8098 → parametrized regression test with explicit xfail → v0.6.5 bug-fix list) is complete and verified at each hop via API captures (S01–S03).
- The support boundary, quarantine behavior, identity/relocation design, coordinate contract (float64, axes-with-units, calibration fingerprint), and NFS caveat (rename(2) BUGS [S15]) all stand as written.
- Independence argument for napari vs QuPath (different language/ecosystem, different mechanism: runtime display transforms vs persistence/relocation) stands; NGFF/Zarr and tifffile add orthogonal storage/reader mechanisms.

## Residual uncertainty carried into the final
1. Embedding effort for napari `QtViewer` (inference; gated by U-1).
2. PR #1255 file-list tail (~10 KB) unreviewed — absence of QuPath regression test claimed only for reviewed portion.
3. NGFF capture bytes [131072,163120) not reviewed (implementations/history sections); no claims rest there.
4. QuPath CHANGELOG windows [32768,65536) and [85536,114084) not reviewed; citations avoid those ranges.
5. No WebSearch available in this environment; discovery relied on direct URL/API probing, and several guessed URLs 404'd (recorded as negative results in sources.json).
