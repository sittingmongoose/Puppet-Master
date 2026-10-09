/* Text fitting by layout, never by shortening words.
   - Tab strips: every label when they all fit; else the active tab keeps its label and the others show their icon;
     else icons only (each tab has its hover tag). Measured, re-measured on resize, theme and tab change.
   - Shelf heads: a summary that does not fit beside the label moves under it (data-d-stack) instead of being cut.
   - The Git / Jujutsu switch: a thumb that sits exactly on the pressed button. */

function labelOf(item) { return item.querySelector(':scope > .eq-full') || item.querySelector(':scope > span:not(.eq-abbr)'); }
function fitTabs(st) {
  if (!st.offsetWidth) return;
  const items = Array.from(st.querySelectorAll(':scope > .pm-segtab-item'));
  if (!items.length) return;
  const cs = getComputedStyle(st);
  const avail = st.clientWidth - parseFloat(cs.paddingLeft) - parseFloat(cs.paddingRight);
  const ICON = 15, GAP = 6, PAD = 16, PAD_ACTIVE = 24, MIN_ICON = 30;
  const w = items.map(it => { const l = labelOf(it); return l ? Math.ceil(l.scrollWidth) : 0; });
  const each = avail / items.length;
  const act = Math.max(0, items.findIndex(it => it.classList.contains('active')));
  let mode = 'icons';
  if (Math.max(...w) + ICON + GAP + PAD <= each) mode = 'full';
  else if (items.length > 1 && w[act] + ICON + GAP + PAD_ACTIVE + (items.length - 1) * MIN_ICON <= avail) mode = 'active';
  if (st.getAttribute('data-d-tabs') !== mode) st.setAttribute('data-d-tabs', mode);
  items.forEach(it => {
    const l = labelOf(it);
    if (l && !it.hasAttribute('data-pm-hover-label')) { PMR.hover(it, l.textContent.trim()); it.setAttribute('data-d-hov', ''); }
  });
}

function stackHeads(root, force) {
  const heads = Array.from(root.querySelectorAll('.sh-shelf > .sh-head'));
  const widths = heads.map(h => h.offsetWidth);
  heads.forEach((h, i) => {
    const c = h.querySelector(':scope > .sh-hcount, :scope > .sh-htrail > .sh-hcount'), l = h.querySelector(':scope > .sh-hlabel');
    if (!c || !l || !widths[i]) return;
    const key = widths[i] + '|' + c.textContent;
    if (!force && h._dStackKey === key) return;
    h._dStackKey = key;
    h.removeAttribute('data-d-stack');
    const over = l.scrollWidth > l.clientWidth + 1 || h.scrollWidth > h.clientWidth + 1;
    if (over) {
      h.setAttribute('data-d-stack', '');
      const pad = parseFloat(getComputedStyle(h).paddingLeft) || 0;
      h.style.setProperty('--d-stack-x', Math.max(0, l.offsetLeft - pad) + 'px');
    }
  });
}

function placeThumb(sw, animate) {
  let th = sw.querySelector(':scope > .d-thumb');
  if (!th) { th = inject(sw, PMR.h('span.d-thumb', { 'aria-hidden': 'true' }), sw.firstChild); animate = false; }
  const on = sw.querySelector('[aria-pressed="true"]') || sw.querySelector('button');
  if (!on || !sw.offsetWidth) return;
  if (!animate) th.style.transition = 'none';
  th.style.width = on.offsetWidth + 'px';
  th.style.transform = 'translateX(' + on.offsetLeft + 'px)';
  if (!animate) { void th.offsetWidth; th.style.transition = ''; }
}
function wireThumb(panel) {
  const sw = panel.querySelector('.pm7-scm-engine-switch');
  if (!sw || sw._dThumb) return;
  sw._dThumb = true;
  placeThumb(sw, false);
  const mo = new MutationObserver(() => placeThumb(sw, true));
  sw.querySelectorAll('button').forEach(b => mo.observe(b, { attributes: true, attributeFilter: ['aria-pressed'] }));
  D.observers.push(mo);
  remember(() => { delete sw._dThumb; });
}

function clearFitCache() {
  panelEls().forEach(p => p.querySelectorAll('*').forEach(el => { delete el._dFitKey; delete el._dStackKey; delete el._dStackW; }));
}
/* the fitting state is recomputed, not remembered: clearing it is the undo */
function clearFit() {
  clearFitCache();
  document.querySelectorAll('[data-d-tabs]').forEach(el => el.removeAttribute('data-d-tabs'));
  document.querySelectorAll('[data-d-stack]').forEach(el => el.removeAttribute('data-d-stack'));
  document.querySelectorAll('.sh-head[style*="--d-stack-x"]').forEach(el => el.style.removeProperty('--d-stack-x'));
  document.querySelectorAll('[data-d-hov]').forEach(el => { el.removeAttribute('data-d-hov'); el.removeAttribute('data-pm-hover-label'); el.removeAttribute('data-pm-hover-detail'); });
}
/* a registry row whose state and account do not fit on one line puts the account on a third line */
function stackRows(root) {
  /* worktrees: the diff sits beside the branch when the whole branch name fits there, else under it */
  root.querySelectorAll('.sh-wt-h').forEach(h => {
    const b = h.querySelector(':scope > .sh-branch');
    const w = h.offsetWidth;
    if (!b || !w || h._dStackW === w) return;
    h._dStackW = w;
    if (b._dFull != null && b.textContent !== b._dFull) b.textContent = b._dFull;
    h.removeAttribute('data-d-stack');
    if (b.scrollWidth > b.clientWidth) h.setAttribute('data-d-stack', '');
  });
  root.querySelectorAll('[data-pane="registries"] .sh-ctr-h').forEach(h => {
    const m = h.querySelector('.sh-meta');
    const w = h.offsetWidth;
    if (!m || !w || h._dStackW === w) return;
    h._dStackW = w;
    h.removeAttribute('data-d-stack');
    if (m.scrollWidth > m.clientWidth) h.setAttribute('data-d-stack', '');
  });
}
function fitAll(only) {
  panelEls().forEach(p => {
    if (only && p !== only) return;
    if (!p.offsetWidth) return;
    p.querySelectorAll(':scope > .pm-segtab').forEach(fitTabs);
    stackHeads(p);
    stackRows(p);
    midFitAll(p);
    const sw = p.querySelector('.pm7-scm-engine-switch');
    if (sw && sw._dThumb) placeThumb(sw, false);
  });
  recheckSoon();
}
/* a cut name is checked once more after things settle (a face that finished loading, an entrance that ended between
   the measurement and the paint): any middle-truncated name that still overflows its box is fitted again */
let recheckTimer = 0;
function recheckSoon() {
  if (recheckTimer) return;
  recheckTimer = setTimeout(() => {
    recheckTimer = 0;
    if (!D.on) return;
    panelEls().forEach(p => {
      if (!p.offsetWidth) return;
      const over = Array.from(p.querySelectorAll(MID_SEL)).filter(el => el._dFull != null && el.offsetParent && el.scrollWidth > el.clientWidth + 0.5);
      if (!over.length) return;
      over.forEach(el => { delete el._dFitKey; });
      midFitAll(p);
    });
  }, 450);
}
let fitTimer = 0;
function fitSoon() { clearTimeout(fitTimer); fitTimer = setTimeout(() => { if (D.on) fitAll(); }, 60); }
function watchFit() {
  const slot = document.getElementById('sidePanelSlot');
  if (window.ResizeObserver && slot) {
    const ro = new ResizeObserver(fitSoon);
    ro.observe(slot);
    /* a panel's scroller loses its scrollbar's width when opening a row makes it overflow (the content box shrinks,
       the slot does not): names measured on the wider box would be cut by the narrower one */
    panelEls().forEach(p => { const sc = p.querySelector(':scope > .sh-scroll'); if (sc) ro.observe(sc); });
    D.observers.push(ro);
  }
  /* theme, NieR and text size change fonts and widths */
  const mo = new MutationObserver(() => { clearFitCache(); fitSoon(); });
  mo.observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme', 'data-o55-nier', 'data-o55-nier-parts', 'style'] });
  D.observers.push(mo);
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(() => { if (D.on) fitAll(); });
  /* the themes' fonts are embedded and load on first use (a theme switch, NieR Mode): every measurement taken with the
     fallback face is wrong once the real one arrives, so a finished font load refits everything */
  if (document.fonts && document.fonts.addEventListener) listen(document.fonts, 'loadingdone', () => { if (D.on) { clearFitCache(); fitSoon(); } });
}

/* Middle truncation for names that are paths or long ids: keep the head and the tail (the file name, the last part of
   a branch or container name) instead of cutting the end off. Measured with the element's own font on a canvas, the
   text is written once; the full name stays in the row's hover tag. */
const MID_SEL = '.sh-chg-h .sh-nm-txt, .sh-ctr-h .sh-nm-txt, .sh-wt-h > .sh-branch, .sh-cfl > .f, .fm-cfile, .fm-openrow > .fm-path, .fm-cdir, .sh-ctx .d-ctxpath';
let measureCtx = null;
function textWidth(el, text) {
  if (!measureCtx) measureCtx = document.createElement('canvas').getContext('2d');
  const cs = getComputedStyle(el);
  measureCtx.font = cs.fontStyle + ' ' + cs.fontWeight + ' ' + cs.fontSize + ' ' + cs.fontFamily;
  return measureCtx.measureText(text).width;
}
function midText(full, n) {
  const slash = Math.max(full.lastIndexOf('/'), -1);
  const name = slash >= 0 ? full.length - slash : 0;                       // "/QuantityStepper.svelte"
  let tail = Math.ceil(n * .58);
  if (name && name <= n - 3) tail = Math.max(tail, name);
  tail = Math.min(tail, n - 2);
  let head = Math.max(2, n - tail), start = full.length - tail;
  /* snap both cuts to the nearest separator so the parts read as whole words: "tastebook-…-worker-batch" */
  const sep = /[/\-_.]/;
  for (let k = 0; k < 4 && head - k > 2; k++) if (sep.test(full[head - k - 1])) { head = head - k; break; }
  for (let k = 0; k < 4 && start + k < full.length - 2; k++) if (sep.test(full[start + k])) { start = start + k; break; }
  return full.slice(0, head) + '…' + full.slice(start);
}
function midFit(el) {
  if (el.children.length) return;
  /* a name that is a phrase ("multi-arch publish dry-run …") wraps onto a second line instead */
  if (/\s/.test((el._dFull != null ? el._dFull : el.textContent).trim())) { addClass(el, 'd-wrap'); return; }
  if (el._dFull == null) {
    el._dFull = el.textContent;
    const full = el._dFull;
    remember(() => { el.textContent = full; delete el._dFull; });
  }
  const full = el._dFull;
  if (el.textContent !== full) el.textContent = full;
  const ecs = getComputedStyle(el);
  const pad = (parseFloat(ecs.paddingLeft) || 0) + (parseFloat(ecs.paddingRight) || 0);
  const room = el.clientWidth - pad;
  if (room <= 0 || el.scrollWidth <= el.clientWidth) return;
  const fits = t => textWidth(el, t) <= room - 1;
  /* the plain best cut */
  let lo = 4, hi = full.length - 1, best = null, bestN = 0;
  while (lo <= hi) {
    const mid = (lo + hi) >> 1, t = midText(full, mid);
    if (fits(t)) { best = t; bestN = mid; lo = mid + 1; } else hi = mid - 1;
  }
  /* cuts on whole parts ("tastebook-…-worker-batch", "web/…/QuantityStepper.svelte") win when they keep nearly as much */
  const seps = [];
  for (let i = 1; i < full.length - 1; i++) if ('/-_.'.indexOf(full[i]) >= 0) seps.push(i);
  const slash = full.lastIndexOf('/');
  let score = bestN;
  seps.forEach(h => seps.forEach(t => {
    if (t <= h) return;
    const cand = full.slice(0, h + 1) + '…' + full.slice(t);
    const kept = h + 1 + full.length - t;
    const s = kept + 6 + (slash > 0 && t === slash ? 4 : 0);
    if (s > score && fits(cand)) { best = cand; score = s; }
  }));
  if (best && best !== el.textContent) el.textContent = best;
  /* the canvas can differ from layout by a pixel or two: confirm in the DOM and step down if the browser disagrees */
  let n = Math.max(4, bestN);
  while (el.scrollWidth > el.clientWidth && n > 4) { n -= 1; el.textContent = midText(full, n); }
}
/* read every width first (one layout), then fit only the names whose room changed since their last fit */
function midFitAll(root) {
  const els = Array.from(root.querySelectorAll(MID_SEL));
  const rooms = els.map(el => (el.offsetParent ? el.clientWidth : 0));
  els.forEach((el, i) => {
    if (!rooms[i]) return;
    const key = rooms[i] + '|' + (el._dFull != null ? el._dFull : el.textContent);
    if (el._dFitKey === key) return;
    midFit(el);
    el._dFitKey = el.clientWidth + '|' + (el._dFull != null ? el._dFull : el.textContent);
  });
}

/* Publish and review: always there, its facts fold away on request (remembered per viewer) */
function wirePublish(panel) {
  const card = panel.querySelector('.pm7-scm-git-footer .pm7-post-card');
  if (!card || card._dPub) return;
  const head = card.querySelector('.pm7-post-card-head');
  if (!head) return;
  card._dPub = true;
  const btn = PMR.h('button', { type: 'button', class: 'd-fold', 'aria-expanded': 'true' }, PMR.icon('chevD'));
  PMR.hover(btn, 'Show or hide the destinations', 'Where this publishes, the expected head and the review state');
  inject(head, btn);
  const set = (folded, animate) => {
    const h0 = card.offsetHeight;
    card.classList.toggle('d-folded', folded);
    btn.setAttribute('aria-expanded', String(!folded));
    if (!animate || PMR.motion.reduced()) return;
    const h1 = card.offsetHeight;
    const f = spec();
    card.animate([{ height: h0 + 'px', overflow: 'hidden' }, { height: h1 + 'px', overflow: 'hidden' }], { duration: f.dur, easing: f.ease });
    const kv = card.querySelector('.pm7-post-kv');
    if (kv && !folded) kv.animate([{ opacity: 0, transform: 'translateY(-4px)' }, { opacity: 1, transform: 'none' }], { duration: f.dur, easing: f.ease, delay: 60, fill: 'backwards' });
  };
  set(!!PMR.state.get('d.publish.folded', false), false);
  const toggle = ev => {
    if (ev.target.closest('.pm-btn')) return;
    ev.preventDefault();
    const folded = !card.classList.contains('d-folded');
    PMR.state.set('d.publish.folded', folded);
    set(folded, true);
  };
  btn.addEventListener('click', toggle);
  head.addEventListener('click', toggle);
  remember(() => { head.removeEventListener('click', toggle); card.classList.remove('d-folded'); delete card._dPub; });
}
