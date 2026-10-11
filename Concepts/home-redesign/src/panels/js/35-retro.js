/* Retro's tab effects (RETROMOTION, ported from PMConcept7 78025-78154 and re-authored for D23's reverse video).
   A selection rotates through three effects from a shuffle bag (no effect twice in a row): phosphor (a 240 ms dither
   that settles into the solid block, with a 650 ms afterglow on the tab it left), CRT (a scanline wipe in 6 steps over
   300 ms that resolves into the block) and DOS (a double inversion blink over 600 ms that ends inverted). Every effect
   ends on the steady state: a phosphor-filled block with dark text. A drag is always the DOS dashed cut-out with 8 px
   cells and one inversion blink on drop (Jared, T33, 2026-09-02). Retro only; never under Reduced Motion. The plate
   hides while an effect draws, so the effect is the tab, then the block returns. */

var retro = PMW.retro = {};
var RFX_MODES = ['phos', 'crt', 'dos'];
var RFX_MS = { phos: 260, phosGlow: 720, crt: 340, dos: 620, drop: 320 };
var rfxBag = [], rfxLast = null;

function rfxOn() { var lk = look(); return lk.family === 'retro' && !lk.nier && !reducedMotion(); }
function rfxRoll() {
  if (!rfxBag.length) {
    rfxBag = RFX_MODES.slice();
    for (var i = rfxBag.length - 1; i > 0; i--) { var j = Math.floor(Math.random() * (i + 1)); var t = rfxBag[i]; rfxBag[i] = rfxBag[j]; rfxBag[j] = t; }
    if (rfxBag[0] === rfxLast && rfxBag.length > 1) rfxBag.push(rfxBag.shift());
  }
  rfxLast = rfxBag.shift();
  return rfxLast;
}
function rfxPulse(el, cls, ms) {
  el.classList.remove(cls);
  void el.offsetWidth;
  el.classList.add(cls);
  setTimeout(function () { el.classList.remove(cls); }, ms);
}
retro.roll = rfxRoll;

var lastActiveByPanel = {};
bus.on('activate', function (e) {
  var prev = lastActiveByPanel[e.panelId];
  lastActiveByPanel[e.panelId] = e.tabId;
  if (!rfxOn() || !prev || prev === e.tabId) return;
  nextFrame(function () {
    var tab = strip.tabEl(e.tabId);
    if (!tab || tab.hidden) return;
    var host = tab.closest('.pmw-strip');
    if (!host || host.classList.contains('is-dragging')) return;
    var old = strip.tabEl(prev);
    var mode = rfxRoll();
    var ms = RFX_MS[mode];
    rfxPulse(host, 'pmw-rfx-live', ms);
    rfxPulse(tab, 'pmw-rfx-' + mode, ms);
    if (mode === 'phos' && old && old !== tab) rfxPulse(old, 'pmw-rfx-glow', RFX_MS.phosGlow);
  });
});
bus.on('paint', function () {
  // remember the active tab of every panel, so the first activation after a layout change has an outgoing tab
  var l = state.layout;
  if (!l) return;
  model.panels(l).forEach(function (p) { if (!lastActiveByPanel[p.id]) lastActiveByPanel[p.id] = p.active; });
});
retro.dragOn = function () { return rfxOn(); };
