/* PM7PERF-SHIFTTAB-PREKEY-SCREENCAST (TB9): the app-paint clock for a key-driven ring handover, from F's witness
 * (PuppetMaster-Evidence/tests/pm7-fo-20261104/ds-fo-actbar-shifttab/scripts/marker-frame.check.mjs).
 *
 * A fixed marker flips its colour in a capture-phase keydown listener on the app frame's window, in the same task the
 * browser's default action moves the key focus: a write only, no read, no forced layout, no focus change, so it cannot
 * speed the ring up. The compositor's own frames (CDP screencast PNG) are read at the marker: the frame before the flip
 * must show the control the key focus left, ring whole; the first frame after it must show the new control's ring whole
 * and the old one's gone. No timestamp is compared, so a pre-key frame captured or delivered after the key cannot be
 * counted as a late handover (a frame counted by its screencast time was the false failure this replaces).
 */

export const MARKER_ID = 'pm-abkey-marker';
// Page CSS px in the app frame: over the header, clear of the Activity bar's tiles (x 13..45, y 113..189 at 1920).
export const MARKER_BOX = { x: 250, y: 6, width: 40, height: 14 };
// Each trusted Shift+Tab flips it; the page's counter says which colour is next.
export const MARKER_COLOURS = ['M', 'G'];
const LETTERS = ['M', 'G'];

// Page function, serialised by Playwright into the app frame (any module constant must be inlined here). Write only.
export function installKeyMarker() {
  const old = window.__pmAbKeyMarker;
  if (old && old.el && old.el.isConnected) return;
  const el = document.createElement('i');
  el.id = 'pm-abkey-marker';
  el.setAttribute('aria-hidden', 'true');
  el.style.cssText = 'position:fixed;left:250px;top:6px;width:40px;height:14px;margin:0;padding:0;border:0;display:block;z-index:2147483647;pointer-events:none;transition:none !important;animation:none !important;background:#ff00ff !important';
  document.body.appendChild(el);
  const S = window.__pmAbKeyMarker = { rep: 0, el, state: () => S.rep & 1 };
  addEventListener('keydown', e => {
    if (!e.isTrusted || e.key !== 'Tab' || !e.shiftKey) return;
    S.rep++;
    el.style.setProperty('background', S.rep & 1 ? '#00ff00' : '#ff00ff', 'important');
  }, true);
}

// What colour the marker paints in a decoded frame ('M' magenta, 'G' green), from the average of its middle 7x7 pixels;
// '?' when neither colour (not painted, covered, or not that marker).
export function markerState(im, box = MARKER_BOX) {
  const cx = Math.round(box.x + box.width / 2), cy = Math.round(box.y + box.height / 2);
  let r = 0, g = 0, b = 0, n = 0;
  for (let y = cy - 3; y <= cy + 3; y++) for (let x = cx - 3; x <= cx + 3; x++) {
    if (x < 0 || y < 0 || x >= im.width || y >= im.height) continue;
    const i = 4 * (y * im.width + x);
    r += im.data[i]; g += im.data[i + 1]; b += im.data[i + 2]; n++;
  }
  if (!n) return '?';
  r /= n; g /= n; b /= n;
  return r > 150 && b > 150 && g < 120 ? 'M' : g > 150 && r < 120 && b < 120 ? 'G' : '?';
}

// The first frame showing the marker's post-key colour, and the frame before it, which must show the pre-key colour.
// `before` is the page's own marker state read just before the press, so the wrong colour cannot be mistaken for the
// flip; a film whose flip frame is missing, or whose first post-key frame has no pre-key frame before it, is unjudged.
export function firstMarkerFrame(states, before) {
  const after = before === 'M' ? 'G' : 'M';
  const at = states.indexOf(after);
  if (at < 0) return { at: -1, pre: -1, why: `no frame of ${states.length} shows the marker's post-key colour (${after === 'G' ? 'green' : 'magenta'})` };
  if (at === 0 || states[at - 1] !== before) return { at, pre: -1, why: `the first frame of the post-key colour is ${at + 1} of ${states.length}, with no pre-key-colour frame before it` };
  return { at, pre: at - 1 };
}

// The check's ring-side rule: a side holds when 90% of its scanlines hold the mark's ink at 3:1 (see ringSides).
export const whole = sides => Object.values(sides).every(v => v.share >= 0.9);

// The handover on the two judged frames. Null when the key's paint is in one frame; otherwise which frame broke it and
// why, so the failing row names the frame it judged.
export function handoverFault({ preFiles, preSearch, atFiles, atSearch }) {
  if (!whole(preSearch)) return { which: 'before', why: 'the frame before the marker changed does not show the old control\'s ring whole' };
  if (whole(preFiles)) return { which: 'before', why: 'the frame before the marker changed already shows the new control\'s ring' };
  if (!whole(atFiles)) return { which: 'at', why: 'the first frame after the marker changed does not show the new control\'s ring whole' };
  if (whole(atSearch)) return { which: 'at', why: 'the first frame after the marker changed still shows the old control\'s ring' };
  return null;
}

export { LETTERS };
