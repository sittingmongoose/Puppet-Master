/* Text fitting by layout, never by shortening words.
   - Tab strips: every label when they all fit; else the active tab keeps its label and the others show their icon;
     else icons only (each tab has its hover tag). Measured, re-measured on resize, theme and tab change.
   - Shelf heads: a summary that does not fit beside the label moves under it (data-d-stack) instead of being cut.
   - The Git / Jujutsu switch: a thumb that sits exactly on the pressed button. */

function labelOf(item) { return item.querySelector(':scope > .eq-full') || item.querySelector(':scope > span:not(.eq-abbr)'); }
/* the strip's mode. Source Control's two strips (Git and Jujutsu, side by side in one panel) decide by their longest
   label with 24 px inactive tabs (DECISION §4.4, 71-source), so their mode never flips on a click; the other strips
   decide by the chosen tab's label. */
function tabMode(st, items) {
  const cs = getComputedStyle(st);
  const avail = st.clientWidth - parseFloat(cs.paddingLeft) - parseFloat(cs.paddingRight);
  const w = items.map(it => { const l = labelOf(it); return l ? Math.ceil(l.scrollWidth) : 0; });
  const n = items.length, each = avail / n;
  if (st.closest('#panel-source')) {
    const longest = Math.max(...w), ICON = 15, GAP = 5, PAD = 12, INACTIVE = 24;
    if (longest + ICON + GAP + PAD <= each) return 'full';
    return n > 1 && longest + ICON + GAP + PAD + (n - 1) * INACTIVE <= avail ? 'active' : 'icons';
  }
  const ICON = 15, GAP = 6, PAD = 16, PAD_ACTIVE = 24, MIN_ICON = 30;
  const act = Math.max(0, items.findIndex(it => it.classList.contains('active')));
  if (Math.max(...w) + ICON + GAP + PAD <= each) return 'full';
  return n > 1 && w[act] + ICON + GAP + PAD_ACTIVE + (n - 1) * MIN_ICON <= avail ? 'active' : 'icons';
}
function fitTabs(st) {
  if (!st.offsetWidth) return;
  const items = Array.from(st.querySelectorAll(':scope > .pm-segtab-item'));
  if (!items.length) return;
  const mode = tabMode(st, items);
  if (st.getAttribute('data-d-tabs') !== mode) st.setAttribute('data-d-tabs', mode);
  items.forEach(it => {
    const l = labelOf(it);
    if (l && !it.hasAttribute('data-pm-hover-label')) { PMR.hover(it, l.textContent.trim()); it.setAttribute('data-d-hov', ''); }
  });
  /* the ink rests on the chosen tab's new box (31-tabs.js; a no-op while the box is unchanged, so a move in flight
     is never cut short by a refit) */
  placeInk(st);
}

/* does anything in a head run past its content box? To the sub-pixel, on each child's margin box (a mini button's
   negative end margin reaches into the padding by design), freed of any entrance scale: scrollWidth is whole pixels,
   and a head 0.4 px too full cut its label with an ellipsis that was never stacked */
function headOver(h) {
  if (h.scrollWidth > h.clientWidth + 1) return true;
  const cs = getComputedStyle(h), box = h.getBoundingClientRect();
  const k = h.offsetWidth ? box.width / h.offsetWidth : 1;
  const end = box.right - ((parseFloat(cs.paddingRight) || 0) + (parseFloat(cs.borderRightWidth) || 0)) * k;
  return Array.from(h.children).some(c => {
    const ccs = getComputedStyle(c);
    if (ccs.position === 'absolute' || ccs.position === 'fixed' || ccs.display === 'none') return false;
    const r = c.getBoundingClientRect();
    return r.width > 0 && r.right + (parseFloat(ccs.marginRight) || 0) * k > end + 0.05 * k;
  });
}
/* the head's style attribute goes back as it was: --d-stack-x is written inline and clearFit removes the property,
   which would leave style="" on a head that had no style attribute (undo runs after clearFit) */
function stackStyle(h) {
  if (h._dStackStyle) return;
  h._dStackStyle = true;
  const had = h.hasAttribute('style');
  remember(() => { delete h._dStackStyle; if (!had && h.getAttribute('style') === '') h.removeAttribute('style'); });
}
/* the key holds what changes the head's line: its width, its words, and whether its shelf is open (some heads show
   their actions only while open) */
function stackHeads(root, force) {
  const heads = Array.from(root.querySelectorAll('.sh-shelf > .sh-head'));
  const widths = heads.map(h => h.offsetWidth);
  heads.forEach((h, i) => {
    const c = h.querySelector(':scope > .sh-hcount, :scope > .sh-htrail > .sh-hcount'), l = h.querySelector(':scope > .sh-hlabel');
    if (!c || !l || !widths[i]) return;
    const key = widths[i] + '|' + l.textContent + '|' + c.textContent + '|' + h.parentElement.classList.contains('open');
    if (!force && h._dStackKey === key) return;
    h._dStackKey = key;
    h.removeAttribute('data-d-stack');
    if (overflows(l) || headOver(h)) {
      h.setAttribute('data-d-stack', '');
      stackStyle(h);
      const pad = parseFloat(getComputedStyle(h).paddingLeft) || 0;
      h.style.setProperty('--d-stack-x', Math.max(0, l.offsetLeft - pad) + 'px');
    }
  });
  /* a summary head ("Fleet summary   9 containers") keeps its label on one line; a count that no longer fits beside it
     (YoRHa capitals, a scrollbar) drops whole under the label */
  const sums = Array.from(root.querySelectorAll('.pm-sumcard-h'));
  const sumW = sums.map(h => h.offsetWidth);
  sums.forEach((h, i) => {
    const c = h.querySelector(':scope > .c');
    if (!c || !sumW[i]) return;
    const key = sumW[i] + '|' + h.textContent;
    if (!force && h._dStackKey === key) return;
    h._dStackKey = key;
    h.removeAttribute('data-d-stack');
    if (headOver(h)) h.setAttribute('data-d-stack', '');
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

/* every fit cache on the panels' elements: the shared keys and any _d…Key a panel's own file keeps */
const FIT_KEY = /^_d\w*Key$/;
function clearFitCache() {
  panelEls().forEach(p => p.querySelectorAll('*').forEach(el => {
    Object.keys(el).forEach(k => { if (FIT_KEY.test(k)) delete el[k]; });
    delete el._dStackW;
  }));
}
/* the fitting state is recomputed, not remembered: clearing it is the undo */
function clearFit() {
  clearFitCache();
  document.querySelectorAll('[data-d-tabs]').forEach(el => el.removeAttribute('data-d-tabs'));
  document.querySelectorAll('[data-d-stack]').forEach(el => el.removeAttribute('data-d-stack'));
  document.querySelectorAll('[data-d-owner]').forEach(el => el.removeAttribute('data-d-owner'));
  document.querySelectorAll('.sh-head[style*="--d-stack-x"]').forEach(el => el.style.removeProperty('--d-stack-x'));
  document.querySelectorAll('[data-d-hov]').forEach(el => { el.removeAttribute('data-d-hov'); el.removeAttribute('data-pm-hover-label'); el.removeAttribute('data-pm-hover-detail'); });
}
/* a registry row whose state and account do not fit on one line puts the account on a third line */
function stackRows(root) {
  /* worktrees: the diff sits beside the branch when the whole branch name fits there, else under it; the owner sits
     beside the state word when it fits there whole, else on a line of its own under it (a column beside the diff
     broke "lane-b worker · run #47" into three lines) */
  root.querySelectorAll('.sh-wt-h').forEach(h => {
    const b = h.querySelector(':scope > .sh-branch'), ow = h.querySelector(':scope > .sh-owner');
    const w = h.offsetWidth;
    if (!b || !w || h._dStackW === w) return;
    h._dStackW = w;
    if (b._dFull != null && b.textContent !== b._dFull) b.textContent = b._dFull;
    h.removeAttribute('data-d-stack');
    h.removeAttribute('data-d-owner');
    if (b.scrollWidth > b.clientWidth) h.setAttribute('data-d-stack', '');
    if (ow && ow.offsetParent && overflows(ow)) h.setAttribute('data-d-owner', '');
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
      const over = Array.from(p.querySelectorAll(MID_SEL)).filter(el => el._dFull != null && el.offsetParent && overflows(el));
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
  /* a tab shows a pane that was hidden (no width) at the last fit, often in another theme's face: fit it once shown */
  listen(document, 'click', e => { if (D.on && e.target && e.target.closest && e.target.closest('[data-tab]') && inPanels(e.target)) fitSoon(); }, true);
  /* the home layer folds the side panel on narrow windows (css/24-fold.src.css); a width change is caught above, this
     covers a fold that keeps the width */
  listen(document, 'pm:rail-fold', () => { if (D.on) { clearFitCache(); fitSoon(); } });
}

/* Middle truncation for names that are paths or long ids: keep the head and the tail (the file name, the last part of
   a branch or container name) instead of cutting the end off. Measured with the element's own font on a canvas, the
   text is written once; the full name stays in the row's hover tag. A folder that leads a meta line (.d-dir, set by
   applyPaths) is cut in its own box, so the change kind after it stays whole. */
const MID_SEL = '.sh-chg-h .sh-nm-txt, .sh-ctr-h .sh-nm-txt, .sh-wt-h > .sh-branch, .sh-cfl > .f, .fm-cfile, .fm-openrow > .fm-path, .fm-cdir, .sh-ctx .d-ctxpath, .sh-meta > .d-dir > .d-dir-t';
let measureCtx = null;
/* the element's own face, size and letter spacing (NieR and Glass space their letters; a canvas left at 0 measures
   every name short by a fraction of a pixel per letter) */
function textWidth(el, text) {
  if (!measureCtx) measureCtx = document.createElement('canvas').getContext('2d');
  const cs = getComputedStyle(el);
  measureCtx.font = cs.fontStyle + ' ' + cs.fontWeight + ' ' + cs.fontSize + ' ' + cs.fontFamily;
  const ls = parseFloat(cs.letterSpacing) || 0;
  if ('letterSpacing' in measureCtx) { measureCtx.letterSpacing = ls + 'px'; return measureCtx.measureText(text).width; }
  return measureCtx.measureText(text).width + ls * Array.from(text).length;
}
/* does an element's text run past its content box? To the sub-pixel: scrollWidth and clientWidth are whole pixels, and
   a name 0.3 px too wide still gets the end ellipsis. The text's box is read through a Range (it reports the whole run,
   ellipsis or not), the content box from the used width, both freed of any entrance scale that is running. */
function overflows(el) {
  if (el.scrollWidth > el.clientWidth) return true;
  const cs = getComputedStyle(el), bw = parseFloat(cs.width);
  const box = el.getBoundingClientRect();
  if (!(bw > 0) || !box.width) return false;
  const pad = (parseFloat(cs.paddingLeft) || 0) + (parseFloat(cs.paddingRight) || 0);
  const bord = (parseFloat(cs.borderLeftWidth) || 0) + (parseFloat(cs.borderRightWidth) || 0);
  const content = cs.boxSizing === 'border-box' ? bw - pad - bord : bw;
  const scale = box.width / (cs.boxSizing === 'border-box' ? bw : bw + pad + bord);
  const rg = document.createRange();
  rg.selectNodeContents(el);
  return rg.getBoundingClientRect().width / (scale || 1) > content + 0.01;
}
function midText(full, n) {
  const slash = Math.max(full.lastIndexOf('/'), -1);
  const name = slash >= 0 ? full.length - slash : 0;                       // "/QuantityStepper.svelte"
  let tail = Math.ceil(n * .58);
  if (name && name <= n - 3) tail = Math.max(tail, name);
  tail = Math.min(tail, n - 2);
  let head = Math.max(2, n - tail), start = full.length - tail;
  /* snap both cuts to the nearest separator so the parts read as whole words: "tastebook-…-worker-batch"; the tail never
     snaps to a dot (a cut that keeps ".rs" and nothing of the name says nothing) */
  const sep = /[/\-_.]/, tsep = /[/\-_]/;
  for (let k = 0; k < 4 && head - k > 2; k++) if (sep.test(full[head - k - 1])) { head = head - k; break; }
  for (let k = 0; k < 4 && start + k < full.length - 2; k++) if (tsep.test(full[start + k])) { start = start + k; break; }
  return full.slice(0, head) + '…' + full.slice(start);
}
function midFit(el, strict) {
  if (el.children.length) return;
  /* a name that is a phrase ("multi-arch publish dry-run …") wraps onto a second line instead (a folder is cut) */
  if (!el.classList.contains('d-dir-t') && /\s/.test((el._dFull != null ? el._dFull : el.textContent).trim())) { addClass(el, 'd-wrap'); return; }
  if (el._dFull == null) {
    el._dFull = el.textContent;
    const full = el._dFull;
    remember(() => { el.textContent = full; delete el._dFull; });
  }
  const full = el._dFull;
  if (el.textContent !== full) el.textContent = full;
  /* a folder's box is measured at the whole folder's width (40-rows), so its room is all the line can give it */
  const isDir = el.classList.contains('d-dir-t');
  if (isDir) el.style.setProperty('--d-full-w', Math.ceil(textWidth(el, full) + 1) + 'px');
  const ecs = getComputedStyle(el);
  const pad = (parseFloat(ecs.paddingLeft) || 0) + (parseFloat(ecs.paddingRight) || 0);
  const room = el.clientWidth - pad;
  if (room <= 0 || !overflows(el)) return;
  const fits = t => textWidth(el, t) <= room - 1;
  /* the plain best cut */
  let lo = 4, hi = full.length - 1, best = null, bestN = 0;
  while (lo <= hi) {
    const mid = (lo + hi) >> 1, t = midText(full, mid);
    if (fits(t)) { best = t; bestN = mid; lo = mid + 1; } else hi = mid - 1;
  }
  /* cuts on whole parts ("tastebook-…-worker-batch", "web/…/QuantityStepper.svelte") win when they keep nearly as much.
     The end is what a middle cut is for, so a whole-part tail starts at a "/", "-" or "_", never at a dot, and while
     the file name fits whole after a short head the tail keeps all of it ("src/…/tantivy_query.rs", never
     "src/services/….rs"); when it does not, the tail still keeps the name's last part ("crate…_freshness.rs", not
     "crates/…reshness.rs"). Each tail takes the longest head that fits, snapped back to a part's end when one is near.
     strict (two names in one list read the same): the plain cut only, which keeps the most of each. */
  if (!strict) {
    const SEP = '/-_.', slash = full.lastIndexOf('/');
    const nameFits = slash > 0 && fits(full.slice(0, 3) + '…' + full.slice(slash));
    let score = bestN;
    for (let t = 1; t < full.length - 1; t++) {
      if ('/-_'.indexOf(full[t]) < 0 || (nameFits && t > slash)) continue;
      const tail = full.slice(t);
      let lo2 = 1, hi2 = t - 1, k = 0;
      while (lo2 <= hi2) { const m = (lo2 + hi2) >> 1; if (fits(full.slice(0, m) + '…' + tail)) { k = m; lo2 = m + 1; } else hi2 = m - 1; }
      if (!k) continue;
      let whole = SEP.indexOf(full[k - 1]) >= 0;
      for (let j = 1; !whole && j < 5 && k - j >= 1; j++) if (SEP.indexOf(full[k - j - 1]) >= 0) { k -= j; whole = true; }
      if (!whole && k < 3) continue;
      const kept = k + full.length - t;
      if (kept >= full.length - 1) continue;
      const s = kept + (whole ? 4 : 1) + (slash > 0 && t === slash ? 4 : 0);
      if (s > score) { best = full.slice(0, k) + '…' + tail; score = s; }
    }
  }
  if (best && best !== el.textContent) el.textContent = best;
  /* the canvas can differ from layout by a pixel or two: confirm in the DOM (to the sub-pixel) and step down if the
     browser disagrees */
  let n = Math.max(4, bestN) + 1;
  while (n > 4 && overflows(el)) { n -= 1; el.textContent = midText(full, n); }
  /* then it closes up on the cut text, so the dot and the change kind follow it with no gap */
  if (isDir && el.textContent !== full) {
    const rg = document.createRange();
    rg.selectNodeContents(el);
    el.style.setProperty('--d-full-w', Math.ceil(rg.getBoundingClientRect().width + 0.5) + 'px');
  }
}
/* read every width first (one layout), then fit only the names whose room changed since their last fit (a folder's
   room is its meta line, since its own box closes up on the cut text) */
const roomOf = el => (el.classList.contains('d-dir-t') && el.closest('.sh-meta') ? el.closest('.sh-meta').clientWidth : el.clientWidth);
function midFitAll(root) {
  const els = Array.from(root.querySelectorAll(MID_SEL));
  const rooms = els.map(el => (el.offsetParent ? roomOf(el) : 0));
  let changed = false;
  els.forEach((el, i) => {
    if (!rooms[i]) return;
    const key = rooms[i] + '|' + (el._dFull != null ? el._dFull : el.textContent);
    if (el._dFitKey === key) return;
    midFit(el);
    el._dFitKey = roomOf(el) + '|' + (el._dFull != null ? el._dFull : el.textContent);
    changed = true;
  });
  if (changed) midDistinct(els);
}
/* two different names in one list never read the same ("crates/puppet-….rs" twice): such a pair takes the plain cut */
function midDistinct(els) {
  const lists = new Map();
  els.forEach(el => {
    if (el._dFull == null || el.textContent === el._dFull || !el.offsetParent) return;
    const list = el.closest('.sh-accb, .sh-shelf, [data-pane]') || el.parentElement;
    let seen = lists.get(list);
    if (!seen) lists.set(list, (seen = new Map()));
    const other = seen.get(el.textContent);
    if (other && other._dFull !== el._dFull) { midFit(other, true); midFit(el, true); }
    else seen.set(el.textContent, el);
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
