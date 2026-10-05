/* Apply the skin to the three panels. Every pass is idempotent (a second pass changes nothing), so a MutationObserver
   can re-run it whenever the shell redraws part of a panel, and only a real change (a status word the shell rewrote)
   produces a mutation, which is also when the status animates. */

const STATUS_SEL = '.pm-chip, .sh-pill, .pm7-post-state';
const DOT_SEL = '.sh-dot, .dot';
const LABEL_SEL = '.sh-hlabel, .sh-title, .pm-sumcard-h';
const ROW_SEL = '.sh-chg-h, .sh-ctr-h, .sh-wt-h, .sh-commit-h, .sh-stage-h, .fm-changerow, .fm-openrow, .sh-shelf > .sh-head[data-collapse]';

function applyLabels(root) {
  /* a head's summary phrase starts with a capital ("Healthy · 0 in / 2 out · 12s") */
  root.querySelectorAll('.sh-hcount').forEach(el => {
    const host = el.querySelector(':scope > .hc-full') || el;
    const t = ownText(host);
    if (t && /^[a-z]/.test(t) && stateOfWord(t)) setOwnText(host, capFirst(t));
  });
  root.querySelectorAll('.sh-wt-h > .sh-branch').forEach(el => { const t = ownText(el); if (t && !/[a-z]/.test(t)) setOwnText(el, sentence(t)); });
  root.querySelectorAll(LABEL_SEL).forEach(el => {
    const t = ownText(el);
    if (!t) return;
    const s = WORDS[t] || sentence(t);
    if (s !== t) setOwnText(el, s);
  });
}

/* whole-text replacements anywhere in a panel (abbreviations, ASCII arrows, "+ " button prefixes) */
function applyWords(root) {
  const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT);
  const hits = [];
  for (let n = walker.nextNode(); n; n = walker.nextNode()) {
    const t = n.nodeValue.trim();
    if (t && WORDS[t] && n.parentElement && !n.parentElement.closest('.pm6-tb-menu')) hits.push(n);
  }
  const walker2 = document.createTreeWalker(root, NodeFilter.SHOW_TEXT);
  for (let n = walker2.nextNode(); n; n = walker2.nextNode()) {
    for (const [rx, rep] of PHRASES) {
      if (rx.test(n.nodeValue)) { const orig = n.nodeValue; n.nodeValue = orig.replace(rx, rep); remember(() => { n.nodeValue = orig; }); }
    }
  }
  hits.forEach(n => {
    const el = n.parentElement, t = n.nodeValue.trim(), lead = (n.nodeValue.match(/^\s*/) || [''])[0];
    const orig = n.nodeValue;
    n.nodeValue = lead + WORDS[t];
    remember(() => { if (n.isConnected || n.parentNode) n.nodeValue = orig; });
    if (/^\+ /.test(t) && el.matches('button, .pm-btn') && !el.querySelector(':scope > .d-plus')) {
      inject(el, PMR.icon('plus', 'd-plus'), el.firstChild);
    }
  });
}

function chipWord(el) {
  const full = el.querySelector(':scope > .chip-full');
  return { host: full || el, word: full ? full.textContent.trim() : ownText(el) };
}
function applyChips(root, animate) {
  root.querySelectorAll(STATUS_SEL).forEach(el => {
    if (el.closest('.sh-cmpid')) { setAttr(el, 'data-d-st', 'token'); return; }   // compose identity: words, not states
    const { host, word } = chipWord(el);
    if (!word) return;
    if (el._dSeen === word) return;                                                // nothing changed since the last pass
    const changed = el._dSeen != null;
    const st = stateOfChip(el, word);
    const shown = capFirst(word);
    if (shown !== word) setOwnText(host, shown);
    el._dSeen = shown;
    if (el.getAttribute('data-d-st') !== st) setAttr(el, 'data-d-st', st);
    const isCount = st === 'info' && /^\d/.test(word);
    let gl = el.querySelector(':scope > .d-gl');
    if (isCount) { if (gl) gl.remove(); return; }
    if (!gl) gl = inject(el, glyph(st), el.firstChild);
    else if (gl.getAttribute('data-gl') !== st) { gl.setAttribute('data-gl', st); gl.innerHTML = svgFor(st); }
    if (st === 'run') gl.setAttribute('data-pulse', ''); else gl.removeAttribute('data-pulse');
    if (changed && animate) statusPop(el, gl);
  });
}

function applyDots(root) {
  root.querySelectorAll(DOT_SEL).forEach(el => {
    if (el.closest('.sh-graph, .sh-gn') || el.classList.contains('fm-dirty')) return;
    let st = stateOfDot(el);
    if (el.closest('[data-pane="branches"]')) st = st === 'live' ? 'current' : st === 'warn' ? 'stash' : st;
    const foot = el.closest('.fm-footstat, .fm-indexchip');
    if (foot) st = foot.classList.contains('warn') ? 'warn' : 'live';
    const pulse = st === 'run' || !!el.closest('.fm-footstat');
    if (el.getAttribute('data-gl') === st && el.classList.contains('d-dot')) return;
    if (!el.classList.contains('d-dot')) {
      const html = el.innerHTML;
      addClass(el, 'd-dot'); addClass(el, 'd-gl');
      remember(() => { el.innerHTML = html; });
    }
    setAttr(el, 'data-d-st', st);
    setAttr(el, 'data-gl', st);
    if (pulse) setAttr(el, 'data-pulse', '');
    el.innerHTML = svgFor(st);
  });
}

function applyBadges(root) {
  root.querySelectorAll('.fm-gitbadge').forEach(el => { if (!/^[MADCQ?]$/.test(el.textContent.trim())) addClass(el, 'd-word'); });
}

/* the banner's status line: one full phrase, no capsule */
function applyBanner(panel) {
  const st = panel.querySelector('.sh-banner > .sh-bstatus');
  if (!st) return;
  const full = st.querySelector('.sh-bfull'), short = st.querySelector('.sh-bshort');
  const pick = panel.id === 'panel-source' ? (short || full) : (full || short);
  if (pick) addClass(pick, 'd-show');
}

/* the Docker context field: name on the first line, the endpoint under it */
function applyContext(panel) {
  panel.querySelectorAll('.sh-ctx .pm6-tb-menu-label').forEach(lab => {
    if (lab.querySelector('.d-ctxname')) return;
    const text = lab.textContent.trim();
    const m = /^(.*?)\s+[—–-]\s+(.*)$/.exec(text);
    if (!m) return;
    const orig = Array.from(lab.childNodes);
    const name = PMR.h('span.d-ctxname', { text: m[1] }), path = PMR.h('span.d-ctxpath', { text: m[2] });
    lab.textContent = '';
    lab.append(name, path);
    remember(() => { if (lab.contains(name)) { lab.textContent = ''; orig.forEach(n => lab.appendChild(n)); } });
  });
}

/* worktree owner filter: the chip row becomes one chat-style dropdown; picking clicks the shell's own chip */
function applyWorktreeFilter(panel) {
  const chips = panel.querySelector('.sh-wtchips');
  if (!chips || chips._dFilter) return;
  const btns = Array.from(chips.querySelectorAll('.pm-chipbtn'));
  if (!btns.length) return;
  const labelOf = b => { const f = b.querySelector('.wt-full'); const t = (f ? f.textContent : b.textContent).trim(); return OWNER[t] || t; };
  const value = PMR.h('span.d-select-v');
  const trig = PMR.h('button', { type: 'button', class: 'd-select', 'aria-haspopup': 'menu', 'aria-expanded': 'false' },
    PMR.icon('filter', 'd-select-ico'), PMR.h('span.d-select-k', { text: 'Owner' }), value, PMR.icon('chevD'));
  PMR.hover(trig, 'Filter worktrees by owner', 'Threads, the orchestrator, agents or manual worktrees');
  const sync = () => { const a = btns.find(b => b.classList.contains('active')) || btns[0]; value.textContent = labelOf(a); };
  sync();
  trig.addEventListener('click', ev => {
    ev.preventDefault(); ev.stopPropagation();
    const items = btns.map((b, i) => ({ label: labelOf(b), value: String(i), selected: b.classList.contains('active'), _src: b }));
    PMR.menu.toggle({ id: 'd-wt-owner', label: 'Owner', groups: [{ items }] }, trig, { width: Math.max(220, Math.round(trig.getBoundingClientRect().width)), onPick: it => { it._src.click(); requestAnimationFrame(sync); } });
  });
  const row = PMR.h('div.d-wtfilter', trig);
  inject(chips.parentNode, row, chips);
  addClass(chips, 'd-hidden');
  chips._dFilter = true;
  remember(() => { delete chips._dFilter; });
}

/* NieR's cursor (ink bar + square cursor) follows the rail's hook class on rows */
function applyRows(root) { root.querySelectorAll(ROW_SEL).forEach(el => addClass(el, 'pmr-cur')); }

/* the shell's sprout dropdowns in these panels open as the chat-style PMR.menu; a pick clicks the shell's own item, so
   its handlers (selection, label, PM_DEMO action) run exactly as before */
function shellMenuDef(menu) {
  const items = Array.from(menu.querySelectorAll('.pm6-tb-menu-item')).map((it, i) => {
    const meta = it.querySelector('.pm6-tb-menu-meta');
    const label = Array.from(it.childNodes).filter(n => n.nodeType === 3).map(n => n.nodeValue).join('').trim() || (it.getAttribute('data-label') || '').trim();
    const def = { label: label || it.textContent.trim(), value: String(i), selected: it.classList.contains('is-selected'), meta: meta ? metaWords(meta.textContent.trim()) : '' };
    if (it.getAttribute('aria-disabled') === 'true') {
      def.disabled = it.getAttribute('data-demo-arg') || 'Not available';
      def.cmd = it.getAttribute('data-demo-action'); def.arg = it.getAttribute('data-demo-arg');
    } else def._src = it;
    if (it.classList.contains('pm6-tb-menu-diag')) { def.meta = ''; def.icon = 'alert'; }
    return def;
  });
  const sel = items.find(x => x.selected);
  return { id: 'd-' + (menu.id || 'menu'), label: menu.getAttribute('aria-label') || 'Choose', value: sel ? sel.value : undefined, search: items.length > 8, groups: [{ items }] };
}
function openShellMenu(trig, keyboard) {
  const wrap = trig.closest('.pm6-tb-menu-wrap');
  const menu = wrap && wrap.querySelector('.pm6-tb-menu');
  if (!menu) return false;
  const w = Math.max(240, Math.min(320, Math.round(trig.getBoundingClientRect().width)));
  PMR.menu.toggle(shellMenuDef(menu), trig, { width: w, keyboard, onPick: it => { if (it._src) it._src.click(); } });
  return true;
}
function onMenuClick(ev) {
  if (!D.on) return;
  const trig = ev.target && ev.target.closest && ev.target.closest('.pm6-tb-menu-trigger');
  if (!trig || !inPanels(trig)) return;
  if (openShellMenu(trig, false)) { ev.preventDefault(); ev.stopPropagation(); ev.stopImmediatePropagation(); }
}
function onMenuKey(ev) {
  if (!D.on || !['Enter', ' ', 'ArrowDown'].includes(ev.key)) return;
  const trig = ev.target && ev.target.closest && ev.target.closest('.pm6-tb-menu-trigger');
  if (!trig || !inPanels(trig)) return;
  if (openShellMenu(trig, true)) { ev.preventDefault(); ev.stopPropagation(); ev.stopImmediatePropagation(); }
}

/* chrome hairline once content has scrolled under the header */
function applyScrollEdge(panel) {
  const sc = panel.querySelector(':scope > .sh-scroll');
  if (!sc || sc._dScroll) return;
  const on = () => panel.classList.toggle('d-scrolled', sc.scrollTop > 2);
  sc.addEventListener('scroll', on, { passive: true });
  sc._dScroll = on;
  remember(() => { sc.removeEventListener('scroll', on); delete sc._dScroll; panel.classList.remove('d-scrolled'); });
  on();
}

/* Source change rows: the file name is the row's name, its folder leads the meta line ("web/src/lib · new file") */
function applyPaths(panel) {
  panel.querySelectorAll('[data-pane="changes"] .sh-chg-h .sh-nm-txt').forEach(el => {
    if (el._dPath || el.children.length) return;
    const orig = el.textContent, full = orig.trim(), i = full.lastIndexOf('/');
    if (i <= 0) return;
    const meta = el.closest('.sh-main') && el.closest('.sh-main').querySelector(':scope > .sh-meta');
    el._dPath = full;
    el.textContent = full.slice(i + 1);
    const dir = meta ? PMR.h('span.d-dir', { text: full.slice(0, i) }) : null;
    if (dir) meta.insertBefore(dir, meta.firstChild);
    remember(() => { el.textContent = orig; delete el._dPath; if (dir) dir.remove(); });
  });
}
/* the repository location breaks between its parts, never inside one */
function applyDetail(panel) {
  panel.querySelectorAll('.pm7-context-detail, .sh-imgsum-t').forEach(el => {
    const t = ownText(el);
    if (!t || t.indexOf(' · ') < 0 || t.indexOf('\u00A0') >= 0) return;
    setOwnText(el, t.split(' · ').map(s => s.replace(/ /g, '\u00A0')).join(' · '));
  });
}

function applyToggles(panel) {
  panel.querySelectorAll('.pm-chipbtn').forEach(el => { const t = ownText(el); if (t && /^[a-z]/.test(t)) setOwnText(el, capFirst(t)); });
}

function applyPanel(panel, animate) {
  applyToggles(panel);
  applyPaths(panel);
  applyDetail(panel);
  applyLabels(panel);
  applyWords(panel);
  applyChips(panel, animate);
  applyDots(panel);
  applyBadges(panel);
  applyBanner(panel);
  applyContext(panel);
  applyWorktreeFilter(panel);
  applyRows(panel);
  applyScrollEdge(panel);
}

/* re-run on redraws, coalesced into one pass per frame pair */
let pending = 0;
function schedule(panel) {
  if (pending) return;
  pending = requestAnimationFrame(() => requestAnimationFrame(() => {
    pending = 0;
    if (!D.on) return;
    panelEls().forEach(p => applyPanel(p, true));
    fitAll();
  }));
}
function observePanels() {
  panelEls().forEach(p => {
    const mo = new MutationObserver(muts => {
      if (!D.on) return;
      muts = muts.filter(m => !(m.target && (m.target._dFull != null || (m.target.parentNode && m.target.parentNode._dFull != null))));
      if (muts.some(m => m.type === 'characterData' || (m.type === 'childList' && Array.from(m.addedNodes).some(n => !(n.nodeType === 1 && n.classList && (n.classList.contains('d-gl') || n.classList.contains('d-plus') || n.classList.contains('d-thumb'))))))) schedule(p);
    });
    mo.observe(p, { subtree: true, childList: true, characterData: true });
    D.observers.push(mo);
  });
}
