/* Debug & Run (#panel-run) and the bottom Debug tab (#bottomDebugHost) in the Polish design.
   Canon: FinalGUISpec F3-482 (rail "Debug", panel "Debug & Run"), F3-483 (one session store; every surface derives
   from it), F3-484 (session picker with status per session, one focused session), F3-485 (fixed shelf order: launch
   row, Session, Variables & watch, Call stack, Breakpoints), F3-486..F3-488 (shelf contents), F3-490 (bottom Debug
   tab: empty, attached, terminated with scrollback retained), F3-491 (Reveal Output / Show in Run & Debug).

   What this adds over the shared passes:
   - every session state is a glyph + word read from the shell's session store (PM_RD_DEMO): the header status, each
     session row, the session picker, the bottom tab's session tabs and its state; paused is a solid badge with two
     bars knocked out, running the live dot, terminated the stopped ring;
   - the launch configuration is a full-width field (name on line 1, command on line 2) above a Start Debugging split
     button whose Run Without Debugging half is joined to it;
   - the configuration picker opens as PMR.menu grouped recent first, then the other configurations, then Add
     Configuration… and Edit configurations file; the session picker lists every session with its state;
   - shelf heads keep their whole label and move the summary under it when both do not fit; watch, variable and frame
     rows put the value under the name when both do not fit;
   - the bottom Debug tab gets the rail's type, buttons and status glyphs; its menu opens as PMR.menu; when a session
     has ended its console scrollback stays visible under the ended chrome (F3-490), as the shell's own note says. */

Object.assign(WORDS, { 'DEBUG & RUN': 'Debug & Run', 'Cwd': 'Working directory' });
/* paused: a solid badge with the two bars knocked out (a definite state, like done or failed) */
SOLID.paused = { shape: '<circle cx="8" cy="8" r="6.5"/>', cut: '<path d="M6.3 5.2v5.6M9.7 5.2v5.6" stroke-width="1.8" stroke-linecap="round"/>' };

const RDP_ST = { paused: 'paused', running: 'live', terminated: 'idle', ended: 'idle', initializing: 'pending', starting: 'pending', adapter_crashed: 'fail' };
const rdpState = w => RDP_ST[String(w || '').trim().toLowerCase().split(/\s/)[0]] || stateOfWord(w) || 'info';
/* a session's state from the one session store (F3-483), else from the shell's dot */
function rdpSess(id, dot) {
  const store = window.PM_RD_DEMO;
  try { const s = store && store.sess && store.sess(id); if (s && s.state) return s.state; } catch (e) { /* no store */ }
  const m = dot && /\bis-(\w+)/.exec(dot.className || '');
  return m ? m[1] : 'unknown';
}
const rdpRest = r => r.replace(/\bexit (\d+)\b/, 'exit code $1');
const RDP_ROWS = '.sh-sess, .sh-watch, .sh-var:not([data-acc]), .sh-var-h, .sh-scope-h, .sh-frame, .sh-more, .sh-bp, .sh-bpx';

function rdpApply(panel, animate) {
  /* header: glyph + state word + where */
  const bs = document.getElementById('rdStatus');
  if (bs) {
    const full = bs.querySelector('.sh-bfull');
    const [w, rest] = dsrSplit((full || bs).textContent);
    dsrSetStatus(dsrMirror(bs, null, 'd-rdst'), rdpState(w), capFirst(w), rdpRest(rest), animate);
  }
  /* micro labels inside shelves read as sentence-case group labels */
  panel.querySelectorAll('.sh-glabel').forEach(el => { const t = ownText(el); if (t && !/[a-z]/.test(t)) setOwnText(el, sentence(t)); });
  /* checkbox labels in sentence case ("Uncaught exceptions") */
  panel.querySelectorAll('.sh-bpx').forEach(el => {
    const t = ownText(el);
    if (t && /^[A-Z][a-z]+(\s[A-Z][a-z]+)+$/.test(t)) setOwnText(el, t.charAt(0) + t.slice(1).toLowerCase());
  });
  /* the launch configuration as a field: name, then the command */
  panel.querySelectorAll('.sh-cfgbtn').forEach(rdpCfgField);
  /* sessions: the state glyph leads the row, the state word leads its second line */
  panel.querySelectorAll('.sh-sess').forEach(row => {
    const s = rdpSess(row.getAttribute('data-sess'), row.querySelector('.sh-sdot'));
    const st = RDP_ST[s] || 'unknown';
    dsrGlyph(row, row.firstChild, st, animate);
    const line = row.querySelector('.sh-sessline'), meta = row.querySelector('.sh-sessmeta');
    if (line && meta) {
      const [w, rest] = dsrSplit(line.textContent);
      dsrSetStatus(dsrMirror(meta, null, 'd-sessst', false), st, capFirst(w), rest, false);
    }
  });
  /* the session picker carries the focused session's state */
  const pick = panel.querySelector('.sh-sesspick');
  if (pick) dsrGlyph(pick, pick.querySelector('.pm6-tb-menu-label'), RDP_ST[rdpSess()] || 'unknown', animate);
  /* tags that are states: "Paused on breakpoint", "wrong" */
  panel.querySelectorAll('.sh-thread-h > .sh-chip, .sh-vval > .sh-chip.is-warn').forEach(c => {
    if (c.querySelector(':scope > .d-gl')) return;
    const st = c.classList.contains('is-warn') ? 'warn' : rdpState(ownText(c));
    setAttr(c, 'data-d-st', st);
    inject(c, glyph(st), c.firstChild);
    const t = ownText(c);
    if (t && /^[a-z]/.test(t)) setOwnText(c, capFirst(t));
  });
  panel.querySelectorAll(RDP_ROWS).forEach(el => addClass(el, 'pmr-cur'));
  const host = document.getElementById('bottomDebugHost');
  if (host) { rdhApply(host, animate); rdhWire(host); }
  dsrWire();
  rdpFit(panel);
}

function rdpCfgField(trig) {
  const lab = trig.querySelector('.pm6-tb-menu-label');
  if (!lab) return;
  const full = (lab.querySelector('.eq-full') || lab).textContent.trim();
  const m = /^(.*?)\s+[—–]\s+(.*)$/.exec(full);
  let f = trig.querySelector(':scope > .d-cfg');
  if (!f) { f = PMR.h('span.d-cfg', PMR.h('span.d-cfgname'), PMR.h('span.d-cfgcmd')); inject(trig, f, lab); }
  const n = f.firstChild, c = f.lastChild, nt = m ? m[1] : full, ct = m ? m[2] : '';
  if (n.textContent !== nt) n.textContent = nt;
  if (c.textContent !== ct) c.textContent = ct;
}

/* shelf heads: label, summary and actions on one line when they fit; else the summary moves under the label. The
   actions only show while the shelf is open, so the open state is part of the key (the shared stackHeads keys on width
   and text only and would keep a fit measured while the shelf was closed); the theme is too, since it changes fonts. */
function rdpStackHeads(panel) {
  const heads = Array.from(panel.querySelectorAll('.sh-shelf > .sh-head'));
  const ws = heads.map(h => h.offsetWidth);
  const root = document.documentElement, look = root.getAttribute('data-theme') + (root.getAttribute('data-o55-nier') || '');
  heads.forEach((h, i) => {
    const tr = h.querySelector(':scope > .sh-htrail'), l = h.querySelector(':scope > .sh-hlabel');
    const c = (tr || h).querySelector(':scope > .sh-hcount');
    if (!c || !l || !ws[i]) return;
    const key = ws[i] + '|' + c.textContent + '|' + h.parentNode.classList.contains('open') + '|' + look;
    if (h._dRunStackKey === key) return;
    h._dRunStackKey = key;
    h._dStackKey = ws[i] + '|' + c.textContent;            // the shared stackHeads' key: it leaves this head to us
    h.removeAttribute('data-d-stack');
    if (l.scrollWidth > l.clientWidth + 1 || h.scrollWidth > h.clientWidth + 1) {
      h.setAttribute('data-d-stack', '');
      const pad = parseFloat(getComputedStyle(h).paddingLeft) || 0;
      h.style.setProperty('--d-stack-x', Math.max(0, l.offsetLeft - pad) + 'px');
    }
  });
}
function rdpFit(panel) {
  if (!panel || !panel.offsetWidth) return;
  rdpStackHeads(panel);
  /* a session whose state line and adapter tag do not fit on one line puts the tag on a third line */
  panel.querySelectorAll('.sh-sess').forEach(row => {
    const line = row.querySelector('.d-sessst'), chip = row.querySelector(':scope > .sh-chip');
    if (!line || !chip || !row.offsetWidth) return;
    const key = row.offsetWidth + '|' + line.textContent + '|' + chip.textContent;
    if (row._dStackKey === key) return;
    row._dStackKey = key;
    row.removeAttribute('data-d-stack');
    const r = line.querySelector('.d-str');
    if (line.scrollWidth > line.clientWidth + 1 || (r && r.scrollWidth > r.clientWidth + 1)) row.setAttribute('data-d-stack', '');
  });
  dsrStackPairs(panel, [
    ['.sh-watch', '.sh-wexpr', '.sh-wval'],
    ['.sh-var:not([data-acc])', '.sh-vname', '.sh-vval'],
    ['.sh-var-h', '.sh-vname', '.sh-vval'],
    ['.sh-frame', '.sh-fname', '.sh-floc'],
  ]);
}
function rdpClick(panel, t) {
  if (t.closest('[data-collapse]')) requestAnimationFrame(() => rdpFit(panel));
  if (t.closest('[data-demo-action="cmd.run_debug.config.add"], #rdAddCancel')) {
    requestAnimationFrame(() => {
      const form = document.getElementById('rdAddForm');
      if (form && !form.classList.contains('pm-hidden')) cascade(Array.from(form.children), { max: 6, dy: 4, step: Math.round(spec().step * .7), durK: .9 });
    });
  }
}

/* ---- menus: configurations grouped recent first, sessions with their state ---- */
function rdpOpenConfigs(trig, keyboard) {
  const wrap = trig.closest('.pm6-tb-menu-wrap'), menu = wrap && wrap.querySelector('.pm6-tb-menu');
  if (!menu) return false;
  const recent = [], rest = [], acts = [];
  menu.querySelectorAll('.pm6-tb-menu-item').forEach((it, i) => {
    const lab = (it.querySelector('.pm6-tb-menu-item-label') || it).textContent.trim();
    if (it.getAttribute('data-demo-action') === 'cmd.run_debug.config.select') {
      const def = { label: it.getAttribute('data-label') || lab, value: String(i), selected: it.classList.contains('is-selected'), _src: it };
      (it.querySelector('.pm6-tb-menu-meta') ? recent : rest).push(def);
    } else acts.push({ label: lab, icon: /config\.add$/.test(it.getAttribute('data-demo-action') || '') ? 'plus' : 'edit', _src: it });
  });
  const groups = [];
  if (recent.length) groups.push({ label: 'Recent', items: recent });
  if (rest.length) groups.push({ label: recent.length ? 'Other configurations' : null, items: rest });
  if (acts.length) groups.push({ items: acts });
  const sel = recent.concat(rest).find(x => x.selected);
  const w = Math.max(300, Math.min(360, Math.round(trig.getBoundingClientRect().width)));   // whole names: the menu may reach past the rail
  PMR.menu.toggle({ id: 'd-rd-configs', label: menu.getAttribute('aria-label') || 'Launch configurations', value: sel ? sel.value : undefined, groups },
    trig, { width: w, keyboard, onPick: it => { if (it._src) it._src.click(); } });
  return true;
}
function rdpOpenSessions(trig, keyboard) {
  const menu = document.getElementById('rdSessMenu');
  if (!menu) return false;
  const store = window.PM_RD_DEMO;
  const items = Array.from(menu.querySelectorAll('.pm6-tb-menu-item')).map((it, i) => {
    const id = it.getAttribute('data-value'), s = rdpSess(id, it.querySelector('.sh-sdot'));
    return {
      label: (it.querySelector('.pm6-tb-menu-item-label') || it).textContent.trim(), value: String(i), meta: capFirst(s),
      selected: store ? store.focusedId === id : it.classList.contains('is-selected'), _src: it, _st: RDP_ST[s] || 'unknown',
    };
  });
  const sel = items.find(x => x.selected);
  const w = Math.max(300, Math.min(360, Math.round(trig.getBoundingClientRect().width)));   // whole names: the menu may reach past the rail
  const el = PMR.menu.toggle({ id: 'd-rd-sessions', label: menu.getAttribute('aria-label') || 'Debug sessions', value: sel ? sel.value : undefined, groups: [{ items }] },
    trig, { width: w, keyboard, onPick: it => { if (it._src) it._src.click(); } });
  if (el) el.querySelectorAll('.pmr-mi').forEach(b => {
    const it = b._pmrItem;
    if (!it || !it._st) return;
    const g = glyph(it._st);
    g.setAttribute('data-d-st', it._st);
    b.insertBefore(g, b.firstChild);
  });
  return true;
}
function rdpMenuOpen(ev, keyboard) {
  if (!D.on) return;
  const trig = ev.target && ev.target.closest && ev.target.closest('.pm6-tb-menu-trigger');
  if (!trig) return;
  const inRun = !!trig.closest('#panel-run'), inHost = !!trig.closest('#bottomDebugHost');
  if (!inRun && !inHost) return;
  let done = false;
  if (trig.classList.contains('sh-sesspick')) done = rdpOpenSessions(trig, keyboard);
  else if (trig.classList.contains('sh-cfgbtn') || trig.getAttribute('aria-controls') === 'rdEmptyCfg') done = rdpOpenConfigs(trig, keyboard);
  else if (inHost) done = openShellMenu(trig, keyboard);      // the shared routing covers the rail panels only
  if (done) { ev.preventDefault(); ev.stopPropagation(); ev.stopImmediatePropagation(); }
}
function rdpMenuClick(ev) { rdpMenuOpen(ev, false); }
function rdpMenuKey(ev) { if (['Enter', ' ', 'ArrowDown'].includes(ev.key)) rdpMenuOpen(ev, true); }

/* ---- the bottom Debug tab (F3-490): not one of the nine panels, so it has its own observer ---- */
function rdhApply(host, animate) {
  const cs = document.getElementById('rdChromeState');
  if (cs && cs.parentNode) {
    const w = cs.textContent.trim();
    dsrSetStatus(dsrMirror(cs.parentNode, cs.nextSibling, 'd-rdchst'), rdpState(w), capFirst(w), '', animate);
  }
  host.querySelectorAll('.rd-sestab').forEach(t => {
    const s = rdpSess(t.getAttribute('data-sess'), t.querySelector('.sh-sdot'));
    dsrGlyph(t, t.firstChild, RDP_ST[s] || 'unknown', animate);
  });
  host.querySelectorAll('.rd-term .rd-adapter').forEach(a => {
    const [w, rest] = dsrSplit(a.textContent);
    dsrSetStatus(dsrMirror(a.parentNode, a.nextSibling, 'd-rdend'), 'idle', capFirst(w), rest, false);
  });
  host.querySelectorAll('.pm6-bottom-empty-kicker').forEach(k => {
    if (k.querySelector(':scope > .d-gl')) return;
    const st = stateOfWord(ownText(k)) || 'info';
    setAttr(k, 'data-d-st', st);
    inject(k, glyph(st), k.firstChild);
  });
  host.querySelectorAll('.rd-sestab').forEach(el => addClass(el, 'pmr-cur'));
}
let rdhState = null;
function rdhWire(host) {
  if (host._dRdh) return;
  host._dRdh = true;
  rdhState = host.getAttribute('data-rd-state');
  let raf = 0;
  const mo = new MutationObserver(() => {
    if (!D.on || raf) return;
    raf = requestAnimationFrame(() => {
      raf = 0;
      if (!D.on) return;
      rdhApply(host, true);
      const now = host.getAttribute('data-rd-state');
      if (now !== rdhState) {
        rdhState = now;
        const box = host.querySelector(':scope > [data-rd="' + now + '"]');
        if (box && visible(box)) cascade(Array.from(box.children).filter(visible).concat(now === 'term' ? Array.from(host.querySelectorAll('.rd-console')) : []), { max: 6, dy: 4 });
      }
    });
  });
  mo.observe(host, { subtree: true, childList: true, characterData: true, attributes: true, attributeFilter: ['data-rd-state'] });
  D.observers.push(mo);
  remember(() => { delete host._dRdh; });
}

panelHook('panel-run', {
  apply(panel, animate) { rdpApply(panel, animate); },
  show(panel, info) {
    rdpFit(panel);
    /* the panel has no tabs: its launch row and shelves deal in under the header (enterPanel deals tab panes) */
    if (info && (info.reason === 'switch' || info.reason === 'concept')) {
      const sc = panel.querySelector(':scope > .sh-scroll');
      if (sc) deal(dealList(sc), { delay: Math.round(spec().step * 1.5) });
    }
  },
  unmount() { dsrWired = false; rdhState = null; },
});
