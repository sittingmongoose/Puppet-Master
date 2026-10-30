# PuppetMaster browser-check kit

Checks for the published page `Concepts/PMConcept7.html` (or a private build), run with browser-check (`browser-check guide`, or `/mnt/Cursor/Agent-Guides/browser-check.md`). Follows the PM7 plan's browser rules:
- loads the page as `file://` with a cache-buster on every load, and `?o55=off` unless asked;
- re-applies and confirms Reduced Motion after each navigation;
- uses one GPU browser per run, so it counts once against your lane's 2.

```sh
K=Concepts/pm7-tools/browser-check
browser-check run $K/checks                                    # boot, ten looks, widths, reduced motion, sandbox
browser-check run $K/checks/looks.check.mjs --set lookShots=1  # list every look for viewing
browser-check run $K/checks --set page=/tmp/my-build.html      # a private build
```

If `browser-check` is not on PATH, run `node /mnt/Cursor/Tools/browser-check/bin/browser-check.mjs`. A full run takes about 2.5 minutes on the P1000.

| Check file | What it asserts |
|---|---|
| `boot` | Ready (`data-pmr-ready`, `PM_THEME`), default Basic Dark, main content on top, shell painted, no overflow, no console errors. Lists one full frame. |
| `looks` | All ten looks (Basic, Friendly, Retro, Glass and NieR, light and dark). Each applies (`data-theme`, `PM_NIER.on()`), paints, has its main content on top and has no overflow. Frames are saved for `diff`. |
| `widths` | 860, 1024, 1280, 1390 and 1920 wide, plus narrow 740 and short 1280x500. Main content is visible with no overflow. Frames are saved for `diff`. |
| `reduced-motion` | `prefers-reduced-motion: reduce` holds after a load and after a reload. |
| `sandbox` | The page boots and paints in a sandboxed iframe (opaque origin, no storage) with no console errors. |

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
browser-check run $K/checks/my-motion.check.mjs --record /mnt/Cursor/PuppetMaster-Evidence/tests/<run>/<lane>/loader.mp4
```

Call `t.mark('drag start')` in the check. The summary prints the seconds of each mark into the recording, for `ffmpeg -ss <s> -i loader.mp4 -frames:v 1 f.png` or a frame range. A recorded run refuses viewport changes and new windows.

## Comparing builds

```sh
browser-check run $K/checks --set page=/tmp/base.html --out /tmp/bc-base
browser-check run $K/checks --out /tmp/bc-tip
browser-check diff /tmp/bc-base /tmp/bc-tip      # opens nothing; lists CHANGED frames with a diff image each
```

The concept demo is live: clocks, usage numbers and toasts move between runs. A changed frame whose box sits only on a live widget is expected. Look at the diff image before reporting it.
