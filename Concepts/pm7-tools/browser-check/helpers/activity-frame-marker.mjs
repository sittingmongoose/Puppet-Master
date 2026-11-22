/* PM7PERF-SHIFTTAB-PREKEY-SCREENCAST (TB9 round 2): the app-paint clock for a key-driven ring handover, from F's
 * witness (PuppetMaster-Evidence/tests/pm7-fo-20261104/ds-fo-actbar-shifttab/scripts/marker-frame.check.mjs) and
 * round 1 (R127 Finding 1: a latched 1-bit marker cannot tell the key's own frame from a later captured frame when the
 * screencast drops frames, so a real 1-2 frame late handover passed inside the dropped gap).
 *
 * The marker counts painted frames. A requestAnimationFrame loop paints the next value of an 8-bit counter into a fixed
 * strip above the page, one bit per band (white 1, black 0); a ninth band is the key band.
 *
 * How the counter maps to compositor frames. Before the screencast starts, the strip is cleared to counter 0 and the
 * loop is stopped: a real painted frame, and the last one before the key while the page stays static. The trusted
 * Shift+Tab keydown paints the key band white, records S.painted (0), and starts the loop - writes only: no DOM read,
 * no forced layout, no focus change. Chrome dispatches keyboard input before the frame's rAF callback, so that frame's
 * callback paints 1, and that frame's paint carries the key band, counter 1 and the focus change: counter K=0 is the
 * pre-key frame, K+1=1 is the frame the key arrived in and the first that can show the key's effect. Later frames paint
 * 2, 3, ... so a dropped key frame leaves only larger counters and the press is could-not-judge, never a pass. If the
 * key is dispatched after that frame's rAF callback (the paint carries counter 0 with the band and 1 lands in the next
 * frame), the pair is not K/K+1 and the press is unjudged.
 *
 * A capture is judged only when it holds the first frame carrying the key band (counter C) and the frame captured
 * immediately before it (counter C-1). The cleared frame is C-1; if it was not captured, or any frame between it and
 * the key frame was dropped, the counters are not adjacent and the press is unjudged. An unreadable band is unknown,
 * never a guessed bit.
 *
 * The loop runs from the key through the capture: a continuously animating marker keeps the screencast's encoder busy
 * and, at 1920x1080 on the Mac over --host, drops most frames (with a marker painting every frame, K+1 was captured in
 * 1 of 8 presses), while a static page up to the key leaves the encoder idle for the two frames that matter. The element
 * and its listener stay installed for the route and are removed after it.
 */

export const MARKER_ID = 'pm-abkey-marker';
// Page CSS px in the app frame: over the header, clear of the Activity bar's tiles (x 13..45, y 113..189 at 1920).
// 8 counter bands of 12 px plus the 12 px key band. The counter wraps at 256 painted frames: about 72 frames in a
// press's 1.2 s capture at 60 Hz, and a wrap inside one capture only above 256 / 1.2 ≈ 213 Hz. keyFrames reads the
// wrap as the adjacency it is (255 -> 0), but above that ceiling a dropped frame could alias to the same counter a
// wrap later; no display the kit runs on is near it (PM7PERF-SHIFTTAB-MARKER-R2-NOTES 2).
export const MARKER_BOX = { x: 250, y: 6, width: 108, height: 14 };
export const COUNTER_BITS = 8;

// Page function, serialised by Playwright into the app frame (any module constant must be inlined here). Write only,
// except the read of the loop's own counter in the keydown listener: no DOM read, no layout, no focus change.
export function installKeyMarker() {
  const old = window.__pmAbKeyMarker;
  if (old && old.el && old.el.isConnected) return;
  const el = document.createElement('i');
  el.id = 'pm-abkey-marker';
  el.setAttribute('aria-hidden', 'true');
  el.style.cssText = 'position:fixed;left:250px;top:6px;width:108px;height:14px;margin:0;padding:0;border:0;display:block;z-index:2147483647;pointer-events:none;transition:none !important;animation:none !important;background:#000 !important';
  const bands = [];
  for (let i = 0; i < 8; i++) {
    const b = document.createElement('i');
    b.setAttribute('aria-hidden', 'true');
    b.style.cssText = 'position:absolute;top:0;width:12px;height:14px;margin:0;padding:0;border:0;display:block;left:' + i * 12 + 'px;background:#000;transition:none !important;animation:none !important';
    el.appendChild(b);
    bands.push(b);
  }
  const key = document.createElement('i');
  key.setAttribute('aria-hidden', 'true');
  key.style.cssText = 'position:absolute;top:0;left:96px;width:12px;height:14px;margin:0;padding:0;border:0;display:block;background:#000;transition:none !important;animation:none !important';
  el.appendChild(key);
  document.body.appendChild(el);
  const S = window.__pmAbKeyMarker = { count: 0, key: null, painted: 0, el, bands, keyBand: key, running: false };
  const ink = (n, on) => n.style.setProperty('background', on ? '#ffffff' : '#000000', 'important');
  const paint = n => { S.painted = n; for (let i = 0; i < bands.length; i++) ink(bands[i], (n >> i) & 1); };
  S.clear = () => { paint(0); ink(key, false); S.key = null; };
  S.loop = () => { S.count = (S.count + 1) & 255; paint(S.count); S.raf = requestAnimationFrame(S.loop); };
  S.clear();
  S.onKey = e => {
    if (!e.isTrusted || e.key !== 'Tab' || !e.shiftKey) return;
    S.key = S.painted;   /* the counter of the last frame painted before the key: K */
    ink(key, true);
    if (!S.running) { S.running = true; S.raf = requestAnimationFrame(S.loop); }
  };
  addEventListener('keydown', S.onKey, true);
}

// Readies the strip for one press: it is blanked to counter 0 (a real painted frame) and the loop stays stopped until
// the key, so the page is static and the screencast's encoder idle when the key's two frames are produced.
export function armKeyMarker() {
  const S = window.__pmAbKeyMarker;
  if (!S || S.running) return;
  S.clear();
  S.count = 0;
}

// Stops the loop and blanks the marker, so a capture taken between presses cannot see the last press's key band.
export function disarmKeyMarker() {
  const S = window.__pmAbKeyMarker;
  if (!S) return;
  cancelAnimationFrame(S.raf);
  S.running = false;
  S.clear();
}

// Stops the loop, drops the listener and the element. The check calls this after the Shift+Tab route (R127: the marker
// used to stay painted over the page for every later route).
export function removeKeyMarker() {
  const S = window.__pmAbKeyMarker;
  if (!S) return;
  cancelAnimationFrame(S.raf);
  removeEventListener('keydown', S.onKey, true);
  S.el.remove();
  delete window.__pmAbKeyMarker;
}

// What a decoded frame paints: the counter (band 0, leftmost, the low bit; white 1, black 0) and the key band, from
// the mean luminance of each band's middle 5x5 pixels. Null when any band is neither ink (a covered, smeared or
// not-that marker frame): an unreadable frame is unknown, never a guess.
export function markerReading(im, box = MARKER_BOX) {
  const band = box.width / 9, cy = Math.round(box.y + box.height / 2);   /* 8 counter bands + the key band, equal width */
  const read = cx => {
    let sum = 0, k = 0;
    for (let y = cy - 2; y <= cy + 2; y++) for (let x = cx - 2; x <= cx + 2; x++) {
      if (x < 0 || y < 0 || x >= im.width || y >= im.height) continue;
      const i = 4 * (y * im.width + x);
      sum += 0.2126 * im.data[i] + 0.7152 * im.data[i + 1] + 0.0722 * im.data[i + 2];
      k++;
    }
    if (!k) return null;
    const lum = sum / k;
    return lum >= 160 ? 1 : lum > 96 ? null : 0;
  };
  let n = 0;
  for (let b = 0; b < COUNTER_BITS; b++) {
    const bit = read(Math.round(box.x + band * (b + 0.5)));
    if (bit === null) return null;
    if (bit) n |= 1 << b;
  }
  const key = read(Math.round(box.x + band * 8.5));
  return key === null ? null : { count: n, key };
}

// The key frame (the first captured frame carrying the key band, the frame the key arrived in) and the frame the
// check must judge before it (counter C-1). Because the counter advances by one per painted frame, the captured frame
// immediately before the key frame must carry C-1; a dropped key frame or a dropped pre-key frame leaves a gap and the
// press is unjudged, with the reason the row logs. The recorded S.painted must be C or C-1 (the key can land on either
// side of the frame's rAF callback); anything else means the film is not this key's.
export function keyFrames(readings, recorded) {
  const at = readings.findIndex(r => r && r.key === 1);
  if (at < 0) return { at: -1, pre: -1, why: `no frame of ${readings.length} carries the key band: the frame the key arrived in was dropped` };
  const count = readings[at].count, want = (count - 1) & 255;
  if (at === 0) return { at, pre: -1, why: `the capture starts at the key frame (counter ${count}), with no frame of counter ${want} before it` };
  if (!readings[at - 1]) return { at, pre: -1, why: `the frame before the key frame (counter ${count}) is unreadable, so counter ${want} cannot be checked` };
  if (readings[at - 1].count !== want) return { at, pre: -1, why: `the frame before the key frame (counter ${count}) carries counter ${readings[at - 1].count}, not ${want}: the pre-key frame was dropped` };
  if (!Number.isInteger(recorded)) return { at, pre: -1, why: `the trusted keydown recorded no painted counter (${JSON.stringify(recorded)})` };
  if (recorded !== count && recorded !== want) return { at, pre: -1, why: `the keydown recorded counter ${recorded}, but the key frame carries ${count}: the film is not this key's` };
  return { at, pre: at - 1, count, preCount: want };
}

// The check's ring-side rule: a side holds when 90% of its scanlines hold the mark's ink at 3:1 (see ringSides).
export const whole = sides => Object.values(sides).every(v => v.share >= 0.9);

// The ring judge's scanline span (the check's ringSides): 6 CSS px either side of the edge, in the capture's own image
// pixels. The marker route captures at 960x540, half of 1920x1080: an unscaled ±6 image-px span there reads ±12 CSS px
// and credits a ring 6-7 CSS px off the tile's edge as on it (PM7PERF-SHIFTTAB-MARKER-R2-NOTES 4). Scaled with the
// capture, and never under 1 image px each side, so a small capture still reads one pixel either side of the edge.
export function ringSpan(e, scale = 1) {
  const r = Math.max(1, Math.round(6 * scale));
  const o = []; for (let v = e - r; v < e + r; v++) o.push(v); return o;
}

// The handover on the two judged frames. Null when the key's paint is in one frame; otherwise which frame broke it and
// why, so the failing row names the frame it judged.
export function handoverFault({ preFiles, preSearch, atFiles, atSearch }) {
  if (!whole(preSearch)) return { which: 'before', why: 'the frame with counter K does not show the old control\'s ring whole' };
  if (whole(preFiles)) return { which: 'before', why: 'the frame with counter K already shows the new control\'s ring' };
  if (!whole(atFiles)) return { which: 'at', why: 'the frame with counter K+1 does not show the new control\'s ring whole' };
  if (whole(atSearch)) return { which: 'at', why: 'the frame with counter K+1 still shows the old control\'s ring' };
  return null;
}
