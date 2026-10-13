/* The grab light on every resizer (Jared, 2026-10-13: "The glowing resize line is missing from most places ... That
   effect should also be polished more"). One light for the dividers between panels, the chat column's edge
   (#chatResizer), the rail's edge (#leftPanelResizer) and the browser's DevTools split: it blooms where the pointer
   is along the bar, brightens and runs the bar's length while the bar is dragged, and on release sends a ripple
   outward from the grab point as it settles back. The look is drawn per look in css/56-light.css.
   This module only feeds the CSS: --pm-glow-off (the pointer's offset along the bar from its middle, the same
   property the page's own resize controller writes for the shell's resizers), a ripple element, and the pmw-settle
   class for 620 ms after a drag or a keyboard step. A bar's axis is its aria-orientation (vertical unless it says
   horizontal). */

var light = PMW.light = {};
var SETTLE_LIGHT_MS = 620;

function lightAxisV(el) { return el.getAttribute('aria-orientation') !== 'horizontal'; }
function lightTrack(el, e) {
  var r = el._pmwLightRect || el.getBoundingClientRect();
  var v = lightAxisV(el);
  var len = (v ? r.height : r.width) || 1;
  var raw = v ? (e.clientY - r.top) / len : (e.clientX - r.left) / len;
  el.style.setProperty('--pm-glow-off', ((clamp(raw, 0, 1) - 0.5) * len).toFixed(1) + 'px');
}
/* bind(el): once per bar; idempotent */
light.bind = function (el) {
  if (!el || el._pmwLight) return;
  el._pmwLight = true;
  el.classList.add('pmw-gl');
  if (!el.querySelector(':scope > .pmw-gl-ripple')) el.appendChild(h('i', { class: 'pmw-gl-ripple', 'aria-hidden': 'true' }));
  if (!el.querySelector(':scope > .pmw-gl-line, :scope > .pmw-divider-line')) el.appendChild(h('i', { class: 'pmw-gl-line', 'aria-hidden': 'true' }));
  var pressed = false, moved = false, sx = 0, sy = 0;
  el.addEventListener('pointerenter', function (e) { lightTrack(el, e); });
  el.addEventListener('pointermove', function (e) {
    lightTrack(el, e);
    if (pressed && !moved && Math.abs(e.clientX - sx) + Math.abs(e.clientY - sy) > 2) moved = true;
  });
  el.addEventListener('pointerdown', function (e) {
    if (e.button !== 0) return;
    lightTrack(el, e);
    // the rect is held for the drag: a bar only moves across its own axis, so the offset along it stays true
    el._pmwLightRect = el.getBoundingClientRect();
    pressed = true; moved = false; sx = e.clientX; sy = e.clientY;
    el.classList.remove('pmw-settle');
  });
  function release() {
    if (!pressed) return;
    pressed = false;
    el._pmwLightRect = null;
    if (moved) light.settle(el);
  }
  el.addEventListener('pointerup', release);
  el.addEventListener('pointercancel', release);
  el.addEventListener('lostpointercapture', release);
  el.addEventListener('focus', function () { if (!pressed) el.style.setProperty('--pm-glow-off', '0px'); });
};
/* settle(el): the ripple and the light easing back (restarts if it is still running) */
light.settle = function (el) {
  if (!el) return;
  clearTimeout(el._pmwSettleT);
  el.classList.remove('pmw-settle');
  void el.offsetWidth;
  el.classList.add('pmw-settle');
  el._pmwSettleT = setTimeout(function () { el.classList.remove('pmw-settle'); }, SETTLE_LIGHT_MS);
};
/* the shell's two resizers, once the page is there */
light.bindShell = function () {
  ['chatResizer', 'leftPanelResizer'].forEach(function (id) { light.bind(doc.getElementById(id)); });
};
