# PuppetMaster browser-check kit

Checks for the published page `Concepts/PMConcept7.html` (or a private build), run with browser-check (`browser-check guide`, or `Agent-Guides/browser-check.md` on the Cursor share). Follows the PM7 plan's browser rules:
- loads the page as `file://` with a cache-buster on every load, and `?o55=off` unless asked;
- re-applies and confirms Reduced Motion after each navigation;
- uses one GPU browser per run. A lane gets at most 2 browsers and 1 recording unless the lead gives it more, and `browser-check slots` shows what the machines have free.

The default page is the committed one, which moves only at milestones. To test your change, build it (`python3 Concepts/onboarding/opus-5.5/tools/build.py --out <scratch>.html`) and pass `--set page=`.

```sh
K=Concepts/pm7-tools/browser-check
OUT=$(mktemp -d)                                               # private to this run: /tmp is shared with other lanes
browser-check run $K/checks                                    # boot, looks, widths, reduced motion, sandbox and the lane checks
browser-check run $K/checks/looks.check.mjs --set lookShots=1  # list every look for viewing
browser-check run $K/checks --set page=$OUT/build.html         # a private build
browser-check run $K/providers --set page=$OUT/build.html      # provider logins, separately
```

Parallel runs are safe: each gets its own browser and run folder. Give each its own copy of the build (a rebuild during a run mixes builds) and its own `--out`. The page loads as `file://`, so `--host` can't open it: to use another machine, ssh there with a checkout of the branch (`~/.local/bin/browser-check`). Motion claims need the VM, Windows or Nas1, because the Mac records about 36 fps and refuses pixel checks while recording.

| Check file | What it asserts |
|---|---|
| `boot` | Ready (`data-pmr-ready`, `PM_THEME`), default Basic Dark, main content on top, shell painted, no overflow, no console errors. Lists one full frame. |
| `looks` | All ten looks (Basic, Friendly, Retro, Glass and NieR, light and dark). Each applies (`data-theme`, `PM_NIER.on()`), paints, has its main content on top and has no overflow. Frames are saved for `diff`. |
| `widths` | 860, 1024, 1280, 1390 and 1920 wide, plus narrow 740 and short 1280x500. Main content is visible with no overflow. Frames are saved for `diff`. |
| `reduced-motion` | `prefers-reduced-motion: reduce` holds after a load and after a reload. |
| `sandbox` | The page boots and paints in a sandboxed iframe (opaque origin, no storage) with no console errors. |
| `qa2-chatpip`, `pip-voice-room` | Lane checks for chat Pip and the voice room. |
| `nier-help-on-chosen` | Every onboarding screen in NieR Light and Dark: each option with a ? is clicked in turn, and every ? on the screen stays on top (clickable) and is not ink on ink, with the pointer on the option and away (FO-5). `--set sandbox=1` runs it in a sandboxed iframe. About 7 minutes. |

"No overflow" means: no sideways page scroll, no element painted past the right edge outside a scroller or clipper, and no text clipped without an ellipsis. Screen-reader-only labels and layers that aren't on top are ignored.

## Helpers for lane checks

```js
const LOADER = '<your surface selector>';    // the element your lane owns
export default async function (t) {
	await t.app.open();                      // fresh load: cache-buster, o55=off, waits for ready
	await t.app.look('nier-dark');           // one of the ten looks, not persisted; waits out NieR's switch-on
	await t.app.resetLayout();               // block Home's localStorage writes and clear them
	await t.visible(LOADER, 'loader on top');
	await t.still(LOADER, 'NieR loader still');                         // compositor frames, not a rAF probe
	await t.app.look('friendly-dark');
	await t.moving(LOADER, 'loader breathes', { ms: 2400 });
	await t.crop('loader', LOADER, 'loader at 16 px: eyes read through the band');
}
```

## Motion

`t.moving` and `t.still` compare real compositor frames. They are a quick gate, not the verification standard. The plan requires 60 fps recordings watched frame by frame, so for a motion claim:

```sh
browser-check run $K/checks/my-motion.check.mjs --record ~/pm-scratch/<lane>/loader.mp4
```

Record one check file, not the folder: `widths` changes the viewport, which a recording refuses, and so does opening a new window. Call `t.mark('drag start')` in the check. The summary prints the seconds of each mark into the recording, and `browser-check frames loader.mp4 --run <run folder>` writes native frames at the marks. Every-frame review is in `Agent-Guides/gpu-recording.md`. Keep working recordings on local disk, not the share, and copy to `PuppetMaster-Evidence/` only what the lane must keep.

## Comparing builds

```sh
# copy your base build to $OUT/base.html first
browser-check run $K/checks --set page=$OUT/base.html --out $OUT/base
browser-check run $K/checks --set page=$OUT/build.html --out $OUT/tip
browser-check diff $OUT/base $OUT/tip            # opens nothing; lists CHANGED frames with a diff image each
```

The concept demo is live: clocks, usage numbers and toasts move between runs. A changed frame whose box sits only on a live widget is expected. Look at the diff image before reporting it.
