# pm7-tools -- PMConcept7 refactor pipeline

Toolchain that derives `Concepts/PMConcept7.html` from a pinned base by
scripted, assertion-guarded transforms. PMConcept7 is ALWAYS a build
artifact: it is never hand-edited, and neither is any intermediate output.
If something is wrong in the output, fix the transform (or the frozen inputs)
and rebuild.

As of the 2026-08-27 re-baseline the pinned base is PMConcept7 itself and the
transform list is empty, so a build reproduces the base verbatim and gates it.
Read the next section before changing anything here.

## Re-baseline — 2026-08-27 (current)

The base is `base/PM7-base.html`, now **byte-identical to
`Concepts/PMConcept7.html`** (not to PMConcept6). Both hash to
`9dcde2a8862de0cdd28a0d540cb4976396ea0556e6ff15a5c9c8fc14bd121090`
(4,101,102 bytes), which is the `BASE_SHA` pin in `build_pm7.py`. The file is
LF-only, so the raw and universal-newline-normalized shas coincide. The block
census on this base is 43 = 22 style + 21 script.

`TRANSFORMS` is **empty**. A build therefore loads the base, asserts the pin
and the census, writes the document unchanged, and runs the four static gates.
Verified: the build output is byte-identical to `Concepts/PMConcept7.html`
and all four gates pass.

### Why

Two distinct bodies of work are now baked into the base.

1. **T01-T20 — retired-into-base.** These were genuine pipeline transforms
   that produced the previous artifact (sha `213a3ee9…`, 3,619,880 bytes) from
   the Jul 15 PMConcept6 assembly (sha `3d82a850…`). Their output is already
   present in the base, so re-running them would abort on their own
   pre-assertions — the anchors they search for no longer exist. The
   `t01_*..t20_*` functions, `dead_selectors.py` and `home_workspace_source.py`
   are kept as the historical record of how the base was derived; they are no
   longer executed.

2. **T21-T24 and T29-T32.2 — hand-authored, no generator.** On 2026-08-20 a
   large body of work (the Prism Usage workspace replacing the old usage grid,
   the retro-dark palette retune, the IBM Plex Mono + Poppins font additions)
   was edited **directly into the HTML**, in violation of the never-hand-edit
   rule below. The wave labels appear in the document's CSS comments and style
   block ids, but no transform source for them has ever existed — it is not in
   this repo, in any worktree, or anywhere on disk. That work cannot be
   re-derived.

Because (2) cannot be regenerated, the only honest options were to freeze it
into the base or to lose it. It was frozen. The alternative — leaving
`BASE_SHA` pinned to PMConcept6 with `TRANSFORMS` ending at T20 — was a live
hazard: the next build would have silently regenerated the old artifact and
destroyed every hand-authored wave.

### What this means going forward

New PM7 work belongs in this pipeline as **T33+**, restoring a real derivation
chain from this base forward. The pipeline's present value is the four static
gates plus the pin/census assertions, which still catch a corrupted or
substituted base.

Note that the `var(--x)-used-implies-defined` gate is baseline-relative
(output vs base), so while `TRANSFORMS` is empty it is structurally a no-op.
It regains its meaning as soon as a real transform is added.

If a future change needs the PM6 lineage, the previous pin was
`3d82a850dad0e412e3abafe1b3f0717e34071425152efd93d3c49fa6e85408c3` and the
recipe it used is preserved in the re-derivation section below.

## Files

- `base/PM7-base.html` -- the pinned base. Since the 2026-08-27 re-baseline
  it is byte-identical to `Concepts/PMConcept7.html` (it was previously the
  shipped Jul 15 `Concepts/PMConcept6.html`)
  (sha256 tracks BASE_SHA in build_pm7.py; re-derive with sha256sum after any repin).
  Never edit it. `build_pm7.py` refuses to run against a base whose sha does
  not match the pin unless `--allow-new-base` is passed intentionally.
- `build_pm7.py` -- the pipeline. Segments the document into style/script
  blocks (census asserted: 43 blocks = 22 style + 21 script on the pinned
  base), runs ordered content-anchored transforms (currently none) with mandatory pre/post
  assertions (any failure aborts), writes the output plus a JSON build
  report, then runs the static gates: per-style-block brace balance,
  var(--x)-used-implies-defined (baseline-relative to the base),
  per-script-block extraction + `node --check`, and the pm6-build emoji
  checker (invoked read-only). Flags: `--until N`, `--skip NAME`,
  `--report`, `--out FILE`, `--outdir DIR`, `--allow-new-base`, `--base FILE`.
- `css_audit.py` -- unused-CSS-selector detector. Brace-balanced rule
  scanner (recurses @media/@supports/@container, treats @keyframes and
  @font-face atomically), per-selector class/id token extraction (tokens
  inside `:not()/:is()/:where()/:has()` and `[...]` are ignored because they
  cannot prove a selector dead), non-CSS corpus = whole document minus style
  contents, dynamic-prefix harvesting from JS string concatenation
  (`'foo-' + expr`) and template literals (`foo-${expr}`), always-keep for
  attribute/pseudo/element-only selectors, and keyframes reference counting.
  Outputs a CSV (`selector, family, bytes, verdict, evidence`) and, with
  `--freeze`, a generated dead-selectors module.
- `dead_selectors.py` -- the FROZEN human-reviewed dead-selector list that
  transform T01 consumes. Generated by `css_audit.py --freeze`, then
  reviewed (approved families only; dynamic-prefix and doubt exclusions are
  listed in the file header with reasons). Do not hand-tune entries; if the
  base changes, re-derive (recipe below).

## Never hand-edit rule

The PM7 output, the build report, and `dead_selectors.py` are derived
artifacts. Regenerate them; do not patch them. Hand-authored pipeline files
include `build_pm7.py`, `home_workspace_source.py`, `css_audit.py`, the
verification runners under `verify/`, and this README.

This rule was broken once, on 2026-08-20, when the Prism Usage work was edited
straight into `Concepts/PMConcept7.html`. The result was unreproducible: the
delivered artifact could not be regenerated from any input in the repo, and
recovering the pipeline meant freezing that work into the base and giving up
its derivation history. That is the whole cost of a hand-edit here — it is not
recoverable after the fact. Add a transform instead.

## Re-derivation recipe (when a new base is adopted)

1. Place the new base at `base/PM7-base.html` (or point `--base` at it).
2. `python3 css_audit.py --input base/PM7-base.html --csv <scratch>/audit.csv
   --freeze <scratch>/dead_selectors.generated.py`
3. Review the generated module: check the harvested-prefix list for new
   dynamic families, check the EXCLUDED notes, spot-grep any token you are
   not sure about (`grep -c '<token>' base/PM7-base.html` must equal its
   CSS-only occurrence count for a true dead token). When in doubt, exclude.
4. Copy the reviewed module over `dead_selectors.py`, update `BASE_SHA` in
   `build_pm7.py`, and update the block-census constants if the scan reports
   a different segmentation.
5. Rebuild with `--report` and diff the report against the previous run.
   Pre-assertion failures pinpoint exactly which upstream edits moved an
   anchor.

## Build

    python3 build_pm7.py --outdir <session-scratchpad>/pm7 \
        --out <session-scratchpad>/pm7/PM7-rebaseline.html

Outputs the HTML plus `<outdir>/build_report.json`. With `TRANSFORMS` empty
the output must be byte-identical to `Concepts/PMConcept7.html`; verify with
`cmp`, and treat any difference as a corrupted base or artifact. Intermediates
belong in the session scratchpad, never in the repo.

Do NOT run the PM6-vs-PM7 pixel-parity matrix (`verify/capture_matrix.mjs` +
`verify/compare_shots.mjs`) against the current artifact. It exists to prove
"visually identical to PMConcept6", a contract the Prism Usage work
deliberately abandoned; it would report meaningless failures. `verify/smoke.mjs`
hardcodes an http server, which does not work in the sandbox — headless
Chromium hangs on http there. Drive verification over `file://` instead;
`verify/home_workspace_matrix.mjs` accepts a `file://` base via `--server`.

## Hard rules

- `Concepts/pm6-build/` is READ-ONLY for this pipeline. It is another
  agent's active workspace. The only interaction allowed is invoking
  `Concepts/pm6-build/checks/check_no_emoji.py <output>` as a read-only
  gate.
- The untracked `Concepts/pm6-build/parts/29x-pm6-js-demo-engine.part.html`
  is a STALE ABANDONED artifact (pre-addendum recombine; not in the active
  manifest; missing the web-operations and requirements-readiness
  subsystems). It must never be used as an input by this or any pipeline.
- No emojis anywhere in authored or generated content (inline SVG only).
  The no-emoji gate enforces this on every build.

## Recorded adaptations vs the design memo (measured on the pinned base)

- Block census is 31 (13 style + 18 script) on the current base; the memo said 28.
- T01 band: memo expected 40-60KB. Measured removal is ~37.8KB because the
  harvester proved `wt-` is a real dynamic prefix
  (`btn.className = 'wt-bind-btn wt-' + data.state;`), protecting all wt-*
  selectors, and review excluded every dead candidate outside the confirmed
  families (chat-/wizard-/files-/pm-/psm-/... stay in place, listed in
  `dead_selectors.py`). Hard band in code is 30-65KB; the report records
  the measured value against the memo band.
- T02: memo pre-asserted 2 occurrences of the shimmer token; the pinned base
  has exactly 1 (`.gl-shimmer-overlay` guard rule) plus a prose comment that
  does not contain the literal token. The transform asserts 1 and removes
  comment + rule.
- T06: memo pre-asserted 2 `clockTick` occurrences; the pinned base has 4.
  The extra 2 are `function clockTick()` / `setInterval(safe(clockTick, ...)`
  in pm6-js-demo-engine -- the LIVE master demo clock, same symbol name,
  different subsystem. The transform removes only the terminal-demo pair
  (`clockTick: 0,` field + 1s increment interval; the counter is never read)
  and asserts the master clock survives untouched.
- T07: the design post-condition "exactly one document-level pointermove
  registration" is asserted statically as one UNCONDITIONAL registration
  (the PM7_PMOVE dispatcher in pm6-js-globals) plus one guarded fallback
  occurrence inside wireParallax (dead code whenever the dispatcher exists,
  i.e. always -- globals is assembled before panels); the runtime Playwright
  probe confirms the actual registration count is 1 (base: 2). The parallax
  glass guard is PER-EVENT, not boot-time, so a live theme switch to
  glass-depth still gets parallax exactly like PM6.
- T08: on the usage page the local 1s ticker stands down ~2s after boot when
  the demo engine takes cooldown ownership (`cooldown.external`); the
  recurring hidden-DOM writer is `PM6_USAGE.setCooldown` (usage.tick, ~2s
  cadence), so its write is gated through the same helper + dirty flag as
  the ticker. Dashboard + usage flush on `page.changed` (the real bus event;
  PM_PAGES.go toggles `.active` before emitting, so flushes see an active
  page). Reveal-value equality verified: identical cooldown strings on both
  files under an identical scripted timeline.
- T09: buffer model VERIFIED on the base (`p.lines` state append capped at
  400 + `renderTranscript(body, p.lines)` rebuild), encoded as
  pre-assertions. Reveal paths that rebuild: revealSession/focusSession
  (already call renderAll), bottom-tab switch back to terminal
  (syncTerminalTabBar flush), and the #collapseBottom expand click
  (PM_TERMINAL_DEMO.pm7FlushIfDirty). A rebuild leaves scroll at the top,
  matching PM6's own renderAll paths (only live appends pin to bottom).
- T10 (measure-gated): 30s idle census parked on Settings measured
  usage.tick 16, demo.log 12, web.op 8, chat.card 7, term.feed 2,
  run.state 0. Only the dashboard `usage.tick` subscriber is wrapped in
  pm7PageGate (hot + snapshot-idempotent). The design's dashboard
  `run.state` candidate and panels `renderAgents` were SKIPPED as "not hot"
  (0 emissions/30s idle); event-semantic handlers (run.gate CTAs,
  usage.alert toasts, bottom term.feed/web.op appends) are excluded;
  the orchestrator was already page-gated upstream.
- T11: the JSON re-emit cannot sit at the literal's exact old position
  (inside the settings-js script block -- script tags do not nest); it is
  emitted as an application/json sibling immediately BEFORE the settings-js
  block, preserving document order (data precedes its single consumer,
  pm6SettingsBoot at DOMContentLoaded). Python-side deep-equal + 12
  categories/817 settings + script-data-safety asserted during the build.
- T12/T13/T14: SKIPPED with evidence recorded in the build report.
  T12: first PM6_CHAT_THREADS read is coincident with first paint
  (-1..+4ms over 6 probe runs, before paint in 2 of 6) -- post-first-paint
  access not proven. T13: timing alone passes (+89..+93ms) but the block is
  executable code mutating engine-shared PM_DEMO_TEXT.files with multiple
  independent read paths -- no safe chokepoint; default-skip stands.
  T14: all three candidate pages fail the eligibility audit (projects: boot
  does not re-render from snapshots -- onRunState(null) is a no-op; wizard:
  boot subscription fires a global toast on topic unlock, a cross-page side
  effect; usage: usage.tick handler does stateful ledger accumulation --
  deferred init would permanently drop rows). PM7_LAZY was NOT installed
  (zero registered pages would make it dead code).

## Status

RE-BASELINED 2026-08-27: `Concepts/PMConcept7.html` (sha256
`9dcde2a8862de0cdd28a0d540cb4976396ea0556e6ff15a5c9c8fc14bd121090`,
4,101,102 bytes) is now also the pinned base, with an empty transform list.
Verified: identity build reproduces the artifact byte-for-byte (`cmp` clean),
all four static gates PASS, block census 43/22/21, `base_pin_ok: true`.
Browser verification over `file://` (Chromium via playwright-core): zero
console and page errors on boot, on the Usage and Home pages, and across all
eight themes; the Prism Usage workspace renders 12 populated cards; the T20
Home Workspace is intact.

Previously SHIPPED 2026-07-16 (sha256 ababace9ea68b9ae28276849fdf07a939211061395852e54ac11c08cbaad67be, 2,544,604 bytes) after full verification: 35-shot deterministic pixel matrix (29/29 strict zero-diff, 6/6 glass loose pass, zero control flake), functional + glass smoke clean, static gates green, interval census 6 to 5. See Concepts/PMConcept7-NOTES.md for the transform ledger and re-derivation recipe.
