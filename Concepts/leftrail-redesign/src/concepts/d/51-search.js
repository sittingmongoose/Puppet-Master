/* Search (#panel-search) in the Polish design, plus the helpers the Debug & Run file (52-run.js) shares with it.
   Canon: FinalGUISpec F3-045 (one panel, find / replace-in-files, grep-style result rows, OpenFile routing), F3-046
   (index freshness visible: indexed / stale / unindexed / fallback, rebuild, cancellation), F3-048 (cmd.search.*).

   What this adds over the shared passes:
   - the index state in the header and the transient rebuild strip are drawn again as glyph + state word + the rest
     of the line ("Indexed · 1,284 documents", "Building search index — 42% (539 of 1,284 documents)"); the shell's
     own text stays in place, hidden, and keeps being rewritten by the shell, so nothing of it has to be undone;
   - result groups show the file name on line 1 and its folder on line 2, both cut in the middle when they run long
     ("web/src/…/recipe/editor"), never at the end;
   - a hit whose match falls past its two lines starts with "…" just before the match, so the match is always shown;
   - abbreviations written out ("16 in 6 files", "3 of 16", "Previous").
   Every DOM change goes through remember()/inject()/addClass()/setAttr(), so "Current" is byte-identical after. */

/* ---- helpers shared with 52-run.js (prefixed dsr: one wrapper scope for every lane's files) ---- */

/* a status the shell writes as one phrase ("paused · import.rs:58"): the first part is the state word */
function dsrSplit(text) {
  const t = String(text || '').trim();
  const m = /^(.*?)(\s+[·—–]\s+.*)$/.exec(t);
  return m ? [m[1], m[2]] : [t, ''];
}
/* the skin's own copy of a status line: glyph (optional) + coloured state word + the rest in the quiet colour */
function dsrMirror(parent, before, cls, withGlyph) {
  const sel = ':scope > .d-stl' + (cls ? '.' + cls : '');
  let m = parent.querySelector(sel);
  if (!m) {
    m = PMR.h('span', { class: ['d-stl', cls] });
    if (withGlyph !== false) m.appendChild(glyph('unknown'));
    m.append(PMR.h('span.d-stw'), PMR.h('span.d-str'));
    inject(parent, m, before && before.parentNode === parent ? before : null);
  }
  return m;
}
function dsrSetStatus(m, st, word, rest, animate) {
  const gl = m.querySelector(':scope > .d-gl'), w = m.querySelector(':scope > .d-stw'), r = m.querySelector(':scope > .d-str');
  const was = m.getAttribute('data-d-st');
  if (was !== st) {
    m.setAttribute('data-d-st', st);
    if (gl) { gl.setAttribute('data-gl', st); gl.innerHTML = svgFor(st); }
  }
  if (gl) {
    const pulse = st === 'run';
    if (pulse && !gl.hasAttribute('data-pulse')) gl.setAttribute('data-pulse', '');
    if (!pulse && gl.hasAttribute('data-pulse')) gl.removeAttribute('data-pulse');
  }
  if (w.textContent !== word) w.textContent = word;
  if (r.textContent !== rest) r.textContent = rest;
  if (was && was !== st && animate) statusPop(m, gl);
}
/* a glyph the skin owns at the front of an element whose state it knows (a session row, a session tab) */
function dsrGlyph(parent, before, st, animate) {
  let gl = parent.querySelector(':scope > .d-gl.d-own');
  if (!gl) { gl = glyph(st); gl.classList.add('d-own'); gl.setAttribute('data-d-st', st); inject(parent, gl, before && before.parentNode === parent ? before : parent.firstChild); return gl; }
  if (gl.getAttribute('data-gl') !== st) {
    gl.setAttribute('data-gl', st); gl.setAttribute('data-d-st', st); gl.innerHTML = svgFor(st);
    if (animate) statusPop(gl, gl);
  }
  return gl;
}
/* whole-phrase rewrites of static text inside one panel (never other panels): [regex, replacement]; a rewrite must not
   match its own result, so a second pass changes nothing */
function dsrPhrase(root, list) {
  const w = document.createTreeWalker(root, NodeFilter.SHOW_TEXT);
  const hits = [];
  for (let n = w.nextNode(); n; n = w.nextNode()) {
    const p = n.parentElement;
    if (!p || p.closest('.pm6-tb-menu, .d-stl, svg')) continue;
    for (const [rx, rep] of list) if (rx.test(n.nodeValue)) { hits.push([n, rx, rep]); break; }
  }
  hits.forEach(([n, rx, rep]) => {
    const orig = n.nodeValue;
    n.nodeValue = orig.replace(rx, rep);
    remember(() => { n.nodeValue = orig; });
  });
}
/* does an element's text need more room than its box gives it? scrollWidth and clientWidth are whole pixels, so text
   that overflows by a fraction is cut with an ellipsis while the two still read equal: measure the text itself (a
   Range keeps its laid-out width even when the ellipsis hides part of it) against the box's content width */
function dsrOver(el) {
  if (!el || !el.firstChild) return false;
  const box = el.getBoundingClientRect();
  if (!box.width) return false;
  const cs = getComputedStyle(el);
  const room = box.width - (parseFloat(cs.paddingLeft) || 0) - (parseFloat(cs.paddingRight) || 0) - (parseFloat(cs.borderLeftWidth) || 0) - (parseFloat(cs.borderRightWidth) || 0);
  const rg = document.createRange();
  rg.selectNodeContents(el);
  return rg.getBoundingClientRect().width > room + .05;
}
/* two-part rows (expression and value, frame and location): side by side when both fit, else the second part moves
   under the first. Widths are read first (one layout), keyed so a pass with nothing changed does no work. */
function dsrStackPairs(root, specs) {
  const rows = [];
  specs.forEach(([rs, as, bs]) => root.querySelectorAll(rs).forEach(r => {
    const a = r.querySelector(':scope > ' + as), b = r.querySelector(':scope > ' + bs);
    if (a && b) rows.push([r, a, b]);
  }));
  const ws = rows.map(([r]) => r.offsetWidth);
  rows.forEach(([r, a, b], i) => {
    if (!ws[i]) return;
    const key = ws[i] + '|' + a.textContent + '|' + b.textContent;
    if (r._dStackKey === key) return;
    r._dStackKey = key;
    r.removeAttribute('data-d-stack');
    if (dsrOver(a) || dsrOver(b)) r.setAttribute('data-d-stack', '');
  });
}
/* middle-cut names (shared midFit), refit only when the room or the text changed. The room is the box's own width to
   a tenth of a pixel: the shared midFit decides "it fits" on whole pixels (scrollWidth <= clientWidth), so a name
   0.4 px too wide was left whole and its last glyph clipped; such a name is cut one step further here. */
const dsrRoom = el => (el.offsetParent ? Math.round(el.getBoundingClientRect().width * 10) / 10 : 0);
function dsrMidFit(els) {
  const rooms = els.map(dsrRoom);
  els.forEach((el, i) => {
    if (!rooms[i]) return;
    const key = rooms[i] + '|' + (el._dFull != null ? el._dFull : el.textContent);
    if (el._dFitKey === key) return;
    midFit(el);
    if (!el.classList.contains('d-wrap') && el._dFull != null && dsrOver(el)) dsrCutParts(el, el._dFull);
    el._dFitKey = dsrRoom(el) + '|' + (el._dFull != null ? el._dFull : el.textContent);
  });
}
/* the one-step-further cut: whole parts first ("web/…/lib/components/recipe/editor"), the longest the box holds, the
   one that keeps more of the end on a tie; else the plain middle cut, one character at a time */
function dsrCutParts(el, full) {
  const room = el.getBoundingClientRect().width, cur = el.textContent.length, seps = [], cands = [];
  for (let i = 1; i < full.length - 1; i++) if ('/-_.'.indexOf(full[i]) >= 0) seps.push(i);
  seps.forEach(h => seps.forEach(t => {
    if (t <= h) return;
    const c = full.slice(0, h + 1) + '…' + full.slice(t);
    if (c.length < cur && textWidth(el, c) <= room) cands.push([c, full.length - t]);
  }));
  cands.sort((a, b) => b[0].length - a[0].length || b[1] - a[1]);
  for (const [c] of cands.slice(0, 8)) { el.textContent = c; if (!dsrOver(el)) return; }
  let n = Math.min(full.length, cur) - 1;
  while (n > 4) { el.textContent = midText(full, n); if (!dsrOver(el)) return; n -= 1; }
}

/* ---- Search ---- */
const SRCH_ROWS = '.sh-fileh, .sh-hit, .sh-filtoggle, #shIgnoreToggle';
/* the scope names are written in title case ("All Files"); labels are sentence case ("All files", "web/ only") */
const srchScopeWord = s => (/^[A-Z][a-z]+( [A-Z][a-z]+)+$/.test(s) ? s.charAt(0) + s.slice(1).toLowerCase() : s);
const srchState = w =>(/^indexed\b/i.test(w) ? 'ok' : /^(indexing|building)\b/i.test(w) ? 'run' : /^stale\b/i.test(w) ? 'stale' : /^(unindexed|fallback)\b/i.test(w) ? 'warn' : 'unknown');

function srchApply(panel, animate) {
  /* the index state under the title: glyph + word, the count written out */
  const tog = document.getElementById('shIdxToggle'), lab = document.getElementById('shIdxLabel');
  if (tog && lab) {
    const [w, rest] = dsrSplit((lab.querySelector('.sh-idxfull') || lab).textContent);
    const st = srchState(w);
    const out = st === 'ok' && /^\s·\s[\d,]+$/.test(rest) ? rest + ' files' : rest;   // the count is the indexed files
    dsrSetStatus(dsrMirror(tog, tog.querySelector(':scope > .sh-bchev'), 'd-idx'), st, capFirst(w), out, animate);
  }
  /* the rebuild strip: one sentence, wrapped, its button beside it */
  const strip = document.getElementById('shIdxState'), stext = document.getElementById('shIdxStateText');
  if (strip && stext) {
    const t = stext.textContent.trim();
    const m = /^(.*?)\s+—\s+(.*)$/.exec(t);
    const rest = m ? ' — ' + m[2].replace(/\((\d[\d,]*) \/ (\d[\d,]*) docs\)/, '($1 of $2 documents)') : '';
    dsrSetStatus(dsrMirror(strip, document.getElementById('shIdxCancel'), 'd-idxstrip'), srchState(t), capFirst(m ? m[1] : t), rest, animate);
  }
  /* "Filtered" says what the list is, it is not a state: an info badge */
  panel.querySelectorAll('.js-filterchip').forEach(ch => {
    if (ch.getAttribute('data-d-st') === 'info') return;
    setAttr(ch, 'data-d-st', 'info');
    const gl = ch.querySelector(':scope > .d-gl');
    if (gl) { gl.setAttribute('data-gl', 'info'); gl.innerHTML = svgFor('info'); }
  });
  dsrPhrase(panel, [
    [/^(\s*)(\d+) in (\d+)(\s*)$/, '$1$2 in $3 files$4'],         // shelf counts "16 in 6"
    [/^(\s*)\/ (\d+)(\s*)$/, '$1of $2$3'],                         // footer "3 / 16"
    [/^(\s*)Prev(\s*)$/, '$1Previous$2'],
    [/\bPrev \/ Next\b/, 'Previous / Next'],                       // the notes name the footer buttons
  ]);
  /* the footer button's hover tag says what its label says */
  panel.querySelectorAll('.sh-foot [data-demo-action="cmd.search.previous_result"]').forEach(b => {
    ['title', 'aria-label', 'data-pm-hover-label', 'data-pm-hover-native-title'].forEach(a => { if (b.getAttribute(a) === 'Prev') setAttr(b, a, 'Previous'); });
  });
  /* the scope field: the shell's label stays (it relabels it on a pick), hidden; the skin shows it in sentence case */
  panel.querySelectorAll('.sh-scope .pm6-tb-menu-trigger').forEach(trig => {
    const lab = trig.querySelector(':scope > .pm6-tb-menu-label');
    if (!lab) return;
    let m = trig.querySelector(':scope > .d-scopelab');
    if (!m) m = inject(trig, PMR.h('span.d-scopelab'), lab.nextSibling);
    const t = srchScopeWord(lab.textContent.trim());
    if (m.textContent !== t) m.textContent = t;
  });
  /* result groups: file name on line 1, its folder on line 2 */
  panel.querySelectorAll('.sh-fileh > .sh-fp').forEach(fp => {
    if (fp._dPath != null || fp.children.length) return;
    const orig = fp.textContent, full = orig.trim(), i = full.lastIndexOf('/');
    if (i <= 0) return;
    const h = fp.parentNode;
    fp._dPath = full;
    fp.textContent = full.slice(i + 1);
    const dir = PMR.h('span.d-fdir', { text: full.slice(0, i) });
    h.appendChild(dir);
    remember(() => { fp.textContent = orig; delete fp._dPath; dir.remove(); });
  });
  panel.querySelectorAll(SRCH_ROWS).forEach(el => addClass(el, 'pmr-cur'));
  dsrWire();
  srchFit(panel);
}

/* a hit is two lines at most; when its match would fall past them, the line starts with "…" just before the match */
function srchFitHit(code) {
  const em = code.querySelector(':scope > em');
  const w = code.clientWidth;
  if (!em || !w) return;
  const lead = code.firstChild && code.firstChild.nodeType === 3 ? code.firstChild : null;
  const key = w + '|' + (code._dLead != null ? code._dLead : lead ? lead.nodeValue : '');
  if (code._dFitKey === key) return;
  if (lead && code._dLead == null) {
    const orig = lead.nodeValue;
    code._dLead = orig;
    remember(() => { lead.nodeValue = orig; delete code._dLead; });
  }
  if (lead) lead.nodeValue = code._dLead;
  /* the match is shown when its last line box ends inside the two lines and clear of the end-of-line ellipsis */
  const shown = () => {
    const c = code.getBoundingClientRect(), rs = em.getClientRects(), e = rs[rs.length - 1];
    return !!e && e.bottom <= c.bottom + .5 && (e.bottom < c.bottom - 2 || e.right <= c.right - 12);
  };
  if (lead && !shown()) {
    const full = code._dLead;
    let lo = 0, hi = full.length, best = 0;
    while (lo <= hi) {
      const k = (lo + hi) >> 1;
      lead.nodeValue = '…\u2060' + full.slice(full.length - k);                  // a word joiner: no break after the ellipsis
      if (shown()) { best = k; lo = k + 1; } else hi = k - 1;
    }
    /* start on a whole word: back to the start of the word the cut falls in when the match still shows, else on to
       the next word */
    const BRK = /[\s(.,:;=<>\[{"'`]/;
    let s = full.length - best;
    if (s > 0 && !BRK.test(full[s - 1])) {
      let back = s - 1;
      while (back > 0 && !BRK.test(full[back - 1])) back--;
      lead.nodeValue = '…\u2060' + full.slice(back);
      if (back > 0 && s - back <= 24 && shown()) s = back;
      else {
        let fwd = s;
        while (fwd < full.length && !BRK.test(full[fwd - 1])) fwd++;
        if (fwd - s <= 24) s = fwd;
      }
    }
    lead.nodeValue = '…\u2060' + full.slice(s);
  }
  code._dFitKey = w + '|' + code._dLead;
}
function srchFit(panel) {
  if (!panel || !panel.offsetWidth) return;
  dsrMidFit(Array.from(panel.querySelectorAll('.sh-fileh > .sh-fp, .sh-fileh > .d-fdir')));
  /* the facts line: when the query time does not fit after the counts it takes its own line, without a leading dot */
  panel.querySelectorAll('.sh-stats').forEach(st => {
    const t = st.querySelector(':scope > .sh-stat-time'), b = st.querySelector(':scope > b');
    if (!t || !b || !st.offsetParent) return;
    const key = dsrRoom(st) + '|' + st.textContent;
    if (st._dFitKey === key) return;
    st._dFitKey = key;
    st.removeAttribute('data-d-stack');
    if (t.getBoundingClientRect().top > b.getBoundingClientRect().top + 2) st.setAttribute('data-d-stack', '');
  });
  panel.querySelectorAll('.sh-hit > code, .sh-rr > code').forEach(c => { if (c.offsetParent) srchFitHit(c); });
}

/* the index details and the filters open with their rows dealt in */
function srchReveal(panel, tog) {
  const p = document.getElementById(tog.getAttribute('aria-controls'));
  if (!p || !p.classList.contains('open')) return;
  const rows = tog.id === 'shIdxToggle' ? Array.from(p.querySelectorAll('.sh-head, .sh-kv, .pm-btn')) : Array.from(p.children);
  cascade(rows, { max: 8, dy: 4, step: Math.round(spec().step * .7), durK: .9 });
}

/* ---- wiring shared by both files: re-fit on theme / width / font change, menus, clicks ---- */
let dsrWired = false, dsrTimer = 0, dsrLate = 0;
function dsrFitAll() {
  if (!D.on) return;
  srchFit(document.getElementById('panel-search'));
  const run = document.getElementById('panel-run');
  if (run && typeof rdpFit === 'function') rdpFit(run);
}
function dsrFitSoon() { clearTimeout(dsrTimer); dsrTimer = setTimeout(dsrFitAll, 90); }
function dsrClick(ev) {
  if (!D.on) return;
  const t = ev.target;
  if (!t || !t.closest) return;
  const sp = t.closest('#panel-search');
  if (sp) {
    /* a tab, a disclosure, a result group, Expand all / Collapse all: names and hits that just came into view are fitted
       at once, and again once the panel has settled (a scrollbar that came or went changes every row's room) */
    requestAnimationFrame(() => { if (D.on) srchFit(sp); });
    clearTimeout(dsrLate);
    dsrLate = setTimeout(dsrFitAll, Math.round(spec().dur * 1.6) + 120);
    const tog = t.closest('#shIdxToggle, #shFilterToggle');
    if (tog) requestAnimationFrame(() => srchReveal(sp, tog));
    return;
  }
  const rp = t.closest('#panel-run');
  if (rp && typeof rdpClick === 'function') rdpClick(rp, t);
}
/* the scope menu lists the scopes in sentence case, like the field */
function srchOpenScope(trig, keyboard) {
  const wrap = trig.closest('.pm6-tb-menu-wrap'), menu = wrap && wrap.querySelector('.pm6-tb-menu');
  if (!menu) return false;
  const def = shellMenuDef(menu);
  def.groups.forEach(g => g.items.forEach(it => { it.label = srchScopeWord(it.label); }));
  const w = Math.max(240, Math.min(320, Math.round(trig.getBoundingClientRect().width)));
  PMR.menu.toggle(def, trig, { width: w, keyboard, onPick: it => { if (it._src) it._src.click(); } });
  return true;
}
function dsrMenuOpen(ev, keyboard) {
  if (!D.on) return;
  const trig = ev.target && ev.target.closest && ev.target.closest('#panel-search .sh-scope .pm6-tb-menu-trigger');
  if (trig) {
    if (srchOpenScope(trig, keyboard)) { ev.preventDefault(); ev.stopPropagation(); ev.stopImmediatePropagation(); }
    return;
  }
  if (typeof rdpMenuOpen === 'function') rdpMenuOpen(ev, keyboard);
}
function dsrMenuClick(ev) { dsrMenuOpen(ev, false); }
function dsrMenuKey(ev) { if (['Enter', ' ', 'ArrowDown'].includes(ev.key)) dsrMenuOpen(ev, true); }
function dsrWire() {
  if (dsrWired) return;
  dsrWired = true;
  /* the slot's width, and each panel's scroller: its content box narrows when a scrollbar appears */
  if (window.ResizeObserver) {
    const ro = new ResizeObserver(dsrFitSoon);
    const slot = document.getElementById('sidePanelSlot');
    if (slot) ro.observe(slot);
    document.querySelectorAll('#panel-search .sh-scroll, #panel-run .sh-scroll').forEach(sc => ro.observe(sc));
    D.observers.push(ro);
  }
  const mo = new MutationObserver(dsrFitSoon);
  mo.observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme', 'data-o55-nier', 'data-o55-nier-parts', 'style'] });
  D.observers.push(mo);
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(dsrFitSoon);
  listen(document, 'click', dsrClick);
  /* the index details, the filters and the result groups open with a transition: refit when it ends */
  const sp = document.getElementById('panel-search');
  if (sp) listen(sp, 'transitionend', e => { if (e.target.matches && e.target.matches('#shIdxPanel, #shFilterPanel, .sh-accb')) dsrFitSoon(); });
  /* window capture runs before the shared document-capture routing, so the scope menu, the run panel's own menus
     (configurations, sessions) and the bottom Debug tab's open as PMR.menu with their own labels, groups and glyphs */
  listen(window, 'click', dsrMenuClick, true);
  listen(window, 'keydown', dsrMenuKey, true);
}

panelHook('panel-search', {
  apply(panel, animate) { srchApply(panel, animate); },
  show(panel) { srchFit(panel); },
  unmount() { dsrWired = false; clearTimeout(dsrTimer); clearTimeout(dsrLate); },
});
