/* Tab strips: one ink per strip and one move per tab change, per family. Generic over the shell's .pm-segtab, so every
   strip of the nine panels moves the same way (Files, Search, Source Control, Actions & pipelines, Docker, Runtime
   artifacts). 22-tabs.src.css has the looks.
   The ink (span.pm-segtab-ink.d-ink) is the skin's own and always sits exactly on the chosen tab's box; the shell's
   spring ink is hidden under the skin. A change works like this: a capture listener reads the strip as it looks before
   the shell switches the tab (the ink's box, every icon and label); the shell switches; the strip is refitted at once
   (fitTabs: the chosen tab shows its label in one step); the next frame reads the new boxes and plays the move from the
   old picture to the new one. Every animation of one change is made in that one frame callback and started together
   on the frame after (startTogether, 30-motion.js), so nothing drifts; all of them are Web Animations (Animation speed
   scales them, nothing runs under reduced motion):
     Basic    the ink glides; the icons slide from where they were on the same curve; the new label fades in behind
              the ink, inside its own tab
     Friendly the same on a spring (one overshoot, held inside the strip; ink and icons share the curve)
     Glass    a long glide, the ink stretching along its path and settling: the liquid ink
     Retro    on the step clock (TICK, 30-motion.js): the ink hops tab by tab, one tab per tick, never between tabs;
              when it lands the chosen tab shows in inverse video for one tick; the new view prints line by line
     NieR     the ink cuts to the chosen tab (under the pointer it already was the ink bar) and the target brackets lock
              onto exactly that box: items carry .pmr-lock, which makes the brackets part place itself after the click
              has landed (the opus-5.5 kit's retChoose, kit.d/19-nier-parts.js, since 2026-10-09) */

const TAB_GLIDE = {
  basic:    { dur: 220, ease: 'cubic-bezier(.2, .8, .2, 1)' },
  friendly: { dur: 420, ease: 'linear', spring: true },
  glass:    { dur: 460, ease: 'cubic-bezier(.16, 1, .3, 1)', liquid: true },
};
/* Friendly's spring as keyframes of progress p (0 = the old place, 1 = the new): past the target once, back a little,
   home. The overshoot is explicit so it can be held inside the strip: the ink never crosses the strip's frame, even on
   its way into the end tab, where an overshooting curve carried it, and that tab's label, past the edge. */
const SPRING = [[0, 0, 'cubic-bezier(.3, .7, .4, 1)'], [.55, 1, 'ease-in-out', 1], [.8, 1, 'ease-in-out', -.3], [1, 1]];
let tabsWired = false;

const tabItems = st => Array.from(st.querySelectorAll(':scope > .pm-segtab-item'));
const tabActive = st => st.querySelector(':scope > .pm-segtab-item.active');
/* el's box in the strip's own coordinates (the ink's containing block), undoing any transform on the way (a panel
   entrance may be scaling the strip) */
function stripBox(st, el) {
  const s = st.getBoundingClientRect(), r = el.getBoundingClientRect();
  const k = st.offsetWidth ? s.width / st.offsetWidth : 1;
  return { x: (r.left - s.left) / k - st.clientLeft, y: (r.top - s.top) / k - st.clientTop, w: r.width / k, h: r.height / k };
}
const inkMove = b => 'translate(' + b.x.toFixed(2) + 'px, ' + b.y.toFixed(2) + 'px)';
const inkFrame = b => ({ transform: inkMove(b), width: b.w.toFixed(2) + 'px', height: b.h.toFixed(2) + 'px' });
const sameBox = (a, b) => !!(a && b) && Math.abs(a.x - b.x) < .25 && Math.abs(a.y - b.y) < .25 && Math.abs(a.w - b.w) < .25 && Math.abs(a.h - b.h) < .25;

function inkOf(st) {
  let ink = st.querySelector(':scope > .d-ink');
  if (!ink) ink = inject(st, PMR.h('span.pm-segtab-ink.d-ink', { 'aria-hidden': 'true' }), st.querySelector(':scope > .pm-segtab-item'));
  return ink;
}
/* every tab animation of a strip: the ink, the icons and labels, the inverse-video tick, Retro's held colours */
function stopTabs(st) {
  const els = [st, st.querySelector(':scope > .d-ink')].concat(tabItems(st).flatMap(it => [it].concat(Array.from(it.children))));
  els.forEach(el => { if (el && el.getAnimations) el.getAnimations().forEach(a => { if (a.id === 'd-tab') a.cancel(); }); });
}
/* the ink at rest on the chosen tab; a no-op while nothing moved, so a refit never cuts a move short */
function placeInk(st, force) {
  if (!D.on || !st.offsetWidth) return;
  const ink = inkOf(st), act = tabActive(st);
  if (!act) { ink.style.width = '0px'; ink._dBox = null; return; }
  const b = stripBox(st, act);
  if (!force && sameBox(ink._dBox, b)) return;
  if (ink._dBox) stopTabs(st);
  ink.style.width = b.w.toFixed(2) + 'px'; ink.style.height = b.h.toFixed(2) + 'px'; ink.style.transform = inkMove(b);
  ink._dBox = b;
}

/* The shell's fit pass after a tab click (PMPillFit, scheduled by its own document click listener for any
   '.pm-segtab-item, [data-tab]' in the slot) is scoped to the clicked panel, yet its measure class (.pill-fit-measure)
   lays out all nine panels and every hidden pane while it runs: on the VM 0.4 s to 1.4 s before the click's first
   frame. For the frame of a tab click the slot carries data-d-fitview, and 22-tabs keeps the inactive panels and the
   hidden panes out of that measure: the pane the click shows is fitted exactly as before, a hidden pane when a click
   shows it, in a fraction of the time. Every other pass (a resize, a panel's first show) is untouched. The flag is
   cleared two frames later, after the pass ran. */
let fitViewSeq = 0;
function fitViewOnly(ev) {
  const slot = document.getElementById('sidePanelSlot');
  const c = ev.target && ev.target.closest && ev.target.closest('.pm-segtab-item, [data-tab]');
  if (!slot || !c || !slot.contains(c)) return;
  if (!slot.hasAttribute('data-d-fitview')) slot.setAttribute('data-d-fitview', '');
  const id = ++fitViewSeq;
  requestAnimationFrame(() => requestAnimationFrame(() => { if (id === fitViewSeq) slot.removeAttribute('data-d-fitview'); }));
}

/* capture phase: the strip as it looks now, before the shell switches the tab (mid-move too: rects include the running
   animations, so a second click starts from exactly what is on screen) */
function onTabCapture(ev) {
  if (!D.on) return;
  fitViewOnly(ev);
  const tab = ev.target && ev.target.closest && ev.target.closest('.pm-segtab-item[data-tab]');
  if (!tab || !inPanels(tab) || tab.classList.contains('active')) return;
  const st = tab.parentElement;
  if (!st || !st.classList.contains('pm-segtab') || !st.offsetWidth) return;
  const ink = st.querySelector(':scope > .d-ink');
  const kids = new Map();
  tabItems(st).forEach(it => Array.from(it.children).forEach(k => { if (k.getClientRects().length) kids.set(k, stripBox(st, k).x); }));
  const moving = !!ink && ink.getAnimations().some(a => a.id === 'd-tab' && a.playState === 'running');
  /* fg: the chosen tab's colour as it was (hovered or not), which Retro holds until the ink lands on it */
  st._dFrom = { ink: ink && ink._dBox ? stripBox(st, ink) : null, at: tabItems(st).findIndex(it => it.classList.contains('active')), moving, kids,
    fg: getComputedStyle(tab).color };
}

/* bubble phase (onClickMotion, after the shell switched): refit now, move on the next frame */
function tabChanged(tab) {
  const panel = tab.closest('.side-panel-view');
  if (!panel) return;
  const tabs = Array.from(panel.querySelectorAll('[data-tab]'));
  const now = tabs.indexOf(tab), was = panel._dTab != null ? panel._dTab : now;
  panel._dTab = now;
  const st = tab.parentElement && tab.parentElement.classList.contains('pm-segtab') ? tab.parentElement : null;
  const from = st && st._dFrom;
  if (st) delete st._dFrom;
  if (now === was) return;
  const dir = now > was ? 1 : -1;
  /* the label shows in this same task, so the target brackets (placed on the next frame) measure the final box */
  if (st) fitTabs(st);
  /* one frame callback makes every animation of the change, and startTogether starts them all on the next frame: the
     ink, the icons, the inverse tick and the rows share one clock, whatever the shell's fit pass costs this frame */
  requestAnimationFrame(() => {
    if (!D.on) return;
    const anims = [];
    if (st) moveTabs(st, from, dir, anims);
    const pane = activePane(panel);
    if (pane) { stackHeads(pane); stackRows(pane); midFitAll(pane); enterPane(pane, dir, anims); }
    /* NieR: the target brackets made their lock-on in this same frame (their frame callback runs first); it starts
       with the rest of the change, or the shell's fit pass would eat it and the brackets would just appear */
    const ret = document.getElementById('o55np-reticle');
    if (ret && fam() === 'nier' && !reduced()) ret.querySelectorAll(':scope > i').forEach(i => i.getAnimations().forEach(a => anims.push(a)));
    startTogether(anims);
  });
}

function moveTabs(st, from, dir, anims) {
  placeInk(st, true);
  const ink = st.querySelector(':scope > .d-ink'), to = ink && ink._dBox;
  if (!from || !from.ink || !to || reduced()) return;
  const f = fam();
  if (f === 'nier') return;                                       // a cut: the brackets lock onto this box
  const add = a => { a.id = 'd-tab'; anims.push(a); return a; };
  const items = tabItems(st), at = items.indexOf(tabActive(st));
  if (f === 'retro') {
    /* hop tab by tab through the new layout, one tab per tick: every frame the ink is exactly one tab's box. The hops
       start at the tab that was chosen, or, when a click comes mid-hop, at the tab the ink is on right now */
    let a0 = from.at >= 0 && from.at < items.length ? from.at : at;
    if (from.moving) {
      const c = from.ink.x + from.ink.w / 2;
      let best = Infinity;
      items.forEach((it, i) => { const b = stripBox(st, it), dd = Math.abs(b.x + b.w / 2 - c); if (dd < best) { best = dd; a0 = i; } });
    }
    const step = at >= a0 ? 1 : -1;
    const path = [];
    for (let i = a0; ; i += step) { path.push(stripBox(st, items[i])); if (i === at) break; }
    const n = path.length - 1;
    if (n > 0) {
      add(ink.animate(path.map((b, k) => Object.assign({ offset: k / n, easing: 'steps(1, end)' }, inkFrame(b))), { duration: n * TICK, fill: 'backwards' }));
      /* the chosen tab keeps the colour it had (its icon and its new label) until the ink lands on it, so only one tab
         ever looks chosen: the one under the ink. --d-tab-fg is what the active colours read (22-tabs) */
      if (from.fg) add(items[at].animate([{ '--d-tab-fg': from.fg }, { '--d-tab-fg': from.fg }], { duration: n * TICK }));
    }
    /* landed: the chosen tab in inverse video for one tick */
    add(st.animate([{ '--d-tab-inv': '1', '--d-tab-fg': 'var(--d-on-accent)' }, { '--d-tab-inv': '1', '--d-tab-fg': 'var(--d-on-accent)' }], { duration: TICK, delay: n * TICK }));
    return;
  }
  const g = TAB_GLIDE[f] || TAB_GLIDE.basic;
  const timing = { duration: g.dur, easing: g.ease, fill: 'backwards' };
  /* the spring's overshoot as a share of the trip: 8 %, at most the room left beyond the target inside the strip */
  let over = 0;
  if (g.spring) {
    const d = to.x - from.ink.x, cs = getComputedStyle(st);
    const room = d >= 0 ? st.clientWidth - parseFloat(cs.paddingRight) - (to.x + to.w) : to.x - parseFloat(cs.paddingLeft);
    over = Math.abs(d) > .5 ? Math.max(0, Math.min(Math.abs(d) * .08, room)) / Math.abs(d) : 0;
  }
  /* keyframes of one value along the curve: lerp(p) for p at each point of the curve */
  const curve = lerp => g.spring
    ? SPRING.map(([offset, p, easing, k]) => Object.assign({ offset }, lerp(p + (k || 0) * over), easing ? { easing } : {}))
    : [lerp(0), lerp(1)];
  const box = p => ({ x: from.ink.x + (to.x - from.ink.x) * p, y: from.ink.y + (to.y - from.ink.y) * p,
    w: from.ink.w + (to.w - from.ink.w) * Math.min(p, 1), h: from.ink.h + (to.h - from.ink.h) * Math.min(p, 1) });
  add(ink.animate(g.liquid ? liquidFrames(from.ink, to) : curve(p => inkFrame(box(p))), timing));
  /* icons slide from where they were, on the ink's curve (translate: the icons' transform is pinned); the chosen tab's
     label had no place before, so it stays inside its own tab and inside the arriving ink: it comes 6 px from the side
     the ink comes from (inside the tab's padding) and fades in once the ink is nearly there. A label sliding from its
     icon's old place ran out of its tab, past the strip's edge for a tab on the right. */
  const lab = labelOf(items[at]);
  items.forEach(it => Array.from(it.children).forEach(k => {
    const x0 = from.kids.get(k);
    if (x0 == null || !k.getClientRects().length) return;
    const b = stripBox(st, k);
    if (!b.w) return;
    let dx = x0 - b.x;
    if (k === lab) dx = to.x >= from.ink.x ? -6 : 6;
    if (Math.abs(dx) >= .5) add(k.animate(curve(p => ({ translate: (dx * (1 - p)).toFixed(2) + 'px 0' })), timing));
  }));
  if (lab && lab.getBoundingClientRect().width) add(lab.animate([{ opacity: 0 }, { opacity: 0, offset: .4 }, { opacity: 1 }], { duration: g.dur, easing: 'linear', fill: 'backwards' }));
}
/* Glass: the ink stretches along its path (the leading edge runs ahead, the box thins a little), then settles with
   one soft give on landing */
function liquidFrames(a, b) {
  const d = b.x - a.x, s = Math.min(Math.abs(d) * .3, Math.max(a.w, b.w) * .4);
  const mx = a.x + d * .5, mw = (a.w + b.w) / 2 + s;
  const mid = { x: mx - (d >= 0 ? s * .35 : s * .65), y: (a.y + b.y) / 2, w: mw, h: (a.h + b.h) / 2 };
  const land = { x: b.x - 1, y: b.y, w: b.w + 2, h: b.h };
  return [
    Object.assign({ offset: 0 }, inkFrame(a)),
    Object.assign({ offset: .4 }, inkFrame(mid), { transform: inkMove(mid) + ' scale(1, .9)' }),
    Object.assign({ offset: .8 }, inkFrame(land), { transform: inkMove(land) + ' scale(1, 1.03)' }),
    Object.assign({ offset: 1 }, inkFrame(b), { transform: inkMove(b) + ' scale(1, 1)' }),
  ];
}

/* the strips of a panel: their ink, a resize watch, the brackets hook; the capture listener once for all panels */
function wireTabs(panel) {
  panel.querySelectorAll(':scope > .pm-segtab').forEach(st => {
    inkOf(st);
    tabItems(st).forEach(it => addClass(it, 'pmr-lock'));
    if (!st._dTabsRO && window.ResizeObserver) {
      const ro = new ResizeObserver(() => { if (D.on) placeInk(st); });
      ro.observe(st);
      D.observers.push(ro);
      st._dTabsRO = ro;
      remember(() => { delete st._dTabsRO; delete st._dFrom; });
    }
    placeInk(st);
  });
  if (!tabsWired) { tabsWired = true; listen(document, 'click', onTabCapture, true); }
}
PANEL_IDS.forEach(id => panelHook(id, {
  apply(panel) { wireTabs(panel); },
  unmount(panel) {
    tabsWired = false; fitViewSeq++;
    panel.querySelectorAll(':scope > .pm-segtab').forEach(stopTabs);
    const slot = document.getElementById('sidePanelSlot');
    if (slot) slot.removeAttribute('data-d-fitview');
  },
}));
