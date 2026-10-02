/* The Lens: one transient sheet beside the rail, in PMR.host.overlay(), never pushing layout.
   Placement: 324 px wide, its left edge 10 px right of the slot, vertically aligned to the selected row and clamped to
   the window; a beak (a rotated square) points at the row. Opening grows it out of the row (per family), following
   glides it to the next row while the content cross-fades and the height springs, closing folds it back.
   Dismissal: Escape, the close button, a pointer down outside the rail + Lens + menus, window blur, a panel switch.
   Pin keeps it through outside clicks and blur (it still follows the selection). */

const C_LENS_W = 324;
const LENS = {
  wrap: null, plate: null, beak: null, scroll: null, content: null, kicker: null, pinBtn: null,
  owner: null, key: null, rowEl: null, open: false, pinned: false, y: 0, x: 0, beakY: 24,
  fading: null, pending: null, anims: [], off: [], raf: 0,
};

function cLensBuild() {
  if (LENS.wrap && LENS.wrap.isConnected) return;
  const ov = PMR.host.overlay();
  LENS.kicker = h('span.pmr-c-lens-kicker');
  LENS.pinBtn = h('button', { type: 'button', class: 'pmr-btn pmr-btn-icon pmr-btn-quiet pmr-c-lens-pin', 'aria-pressed': 'false' }, PMR.icon('pin'));
  PMR.hover(LENS.pinBtn, 'Pin the Lens', 'Keeps it open while you work elsewhere. It still follows the selected row.');
  const close = h('button', { type: 'button', class: 'pmr-btn pmr-btn-icon pmr-btn-quiet pmr-c-lens-close' }, PMR.icon('x'));
  PMR.hover(close, 'Close the Lens', 'Escape also closes it');
  LENS.content = h('div.pmr-c-lens-content');
  LENS.scroll = h('div.pmr-c-lens-scroll', LENS.content);
  LENS.plate = h('div.pmr-c-lens-plate', h('div.pmr-c-lens-bar', LENS.kicker, h('span.pmr-c-lens-bar-acts', LENS.pinBtn, close)), LENS.scroll);
  LENS.beak = h('div.pmr-c-lens-beak', { 'aria-hidden': 'true' });
  LENS.wrap = h('div.pmr-c-lens', { role: 'dialog', 'aria-label': 'Lens', 'data-concept': 'c' }, LENS.beak, LENS.plate);
  ov.appendChild(LENS.wrap);
  LENS.pinBtn.addEventListener('click', () => cLensPin(!LENS.pinned));
  close.addEventListener('click', () => cLensHide('close', { focusRow: true }));
  LENS.wrap.addEventListener('keydown', ev => {
    if (ev.key === 'Escape' && !ev.defaultPrevented && !PMR.menu.isOpen()) { ev.preventDefault(); ev.stopPropagation(); cLensHide('escape', { focusRow: true }); }
  });
  LENS.scroll.addEventListener('scroll', () => PMR.menu.closeAll(), { passive: true });
}

function cLensPin(on) {
  LENS.pinned = !!on;
  if (LENS.pinBtn) LENS.pinBtn.setAttribute('aria-pressed', String(LENS.pinned));
  if (LENS.wrap) LENS.wrap.classList.toggle('is-pinned', LENS.pinned);
  if (LENS.pinned && LENS.pinBtn) {
    MO.animate(LENS.pinBtn.querySelector('.pmr-ico'), [{ transform: 'rotate(0deg) scale(1)' }, { transform: 'rotate(-28deg) scale(1.15)' }, { transform: 'rotate(0deg) scale(1)' }], { dur: 'med', ease: 'spring', fill: 'none' });
  }
}

function cLensListen() {
  cLensUnlisten();
  const onDown = ev => {
    if (!LENS.open || LENS.pinned) return;
    const t = ev.target;
    if (!t || !t.closest) return;
    if (LENS.wrap.contains(t)) return;
    if (LENS.owner && LENS.owner.view.contains(t)) return;
    if (t.closest('.pmr-menu, #pmr-menu-pin, [class*="hover-tag"], .pm-hovertag, .pmr-switch')) return;
    cLensHide('outside');
  };
  const onKey = ev => {
    if (!LENS.open || ev.key !== 'Escape' || ev.defaultPrevented || PMR.menu.isOpen()) return;
    const inRail = LENS.owner && LENS.owner.view.contains(document.activeElement);
    const inLens = LENS.wrap.contains(document.activeElement);
    if (inRail || inLens || document.activeElement === document.body) { ev.preventDefault(); cLensHide('escape', { focusRow: inRail || inLens }); }
  };
  const onBlur = () => { if (LENS.open && !LENS.pinned) cLensHide('blur'); };
  const onResize = () => cLensPlaceSoon();
  document.addEventListener('pointerdown', onDown, true);
  document.addEventListener('keydown', onKey);
  window.addEventListener('blur', onBlur);
  window.addEventListener('resize', onResize);
  let ro = null;
  const slot = PMR.host.slot();
  if (slot && window.ResizeObserver) { ro = new ResizeObserver(onResize); ro.observe(slot); const ab = document.getElementById('activityBar'); if (ab) ro.observe(ab); }
  LENS.off = [
    () => document.removeEventListener('pointerdown', onDown, true),
    () => document.removeEventListener('keydown', onKey),
    () => window.removeEventListener('blur', onBlur),
    () => window.removeEventListener('resize', onResize),
    () => ro && ro.disconnect(),
  ];
}
function cLensUnlisten() { LENS.off.forEach(f => { try { f(); } catch (e) { /* ignore */ } }); LENS.off = []; }

function cLensCancelAnims() { LENS.anims.forEach(a => { try { a && a.cancel(); } catch (e) { /* ignore */ } }); LENS.anims = []; }

/* measure where the Lens belongs for the current row; returns { x, y, h, beakY, beakShown } */
function cLensGeometry() {
  const sr = PMR.host.slotRect() || { right: 300, top: 40, bottom: innerHeight };
  const vw = window.innerWidth, vh = window.innerHeight;
  let x = Math.round(sr.right + 10);
  if (x + C_LENS_W > vw - 8) x = Math.max(8, vw - C_LENS_W - 8);
  const hgt = Math.min(LENS.plate.scrollHeight || 200, vh - 16);
  const row = LENS.rowEl && LENS.rowEl.isConnected ? LENS.rowEl.getBoundingClientRect() : null;
  let anchor = row ? row.top + row.height / 2 : sr.top + 80;
  let beakShown = !!row && row.height > 0;
  if (row && LENS.owner) {
    const body = LENS.owner.scrollEl || LENS.owner.view;
    const br = body.getBoundingClientRect();
    if (anchor < br.top + 4 || anchor > br.bottom - 4) beakShown = false;
    anchor = cClamp(anchor, br.top + 8, br.bottom - 8);
  }
  const y = Math.round(cClamp(anchor - 24, 8, Math.max(8, vh - hgt - 8)));
  const beakY = Math.round(cClamp(anchor - y, 16, hgt - 16));
  return { x, y, h: hgt, beakY, beakShown };
}
function cLensApply(g) {
  LENS.x = g.x; LENS.y = g.y; LENS.beakY = g.beakY;
  LENS.wrap.style.transform = `translate3d(${g.x}px, ${g.y}px, 0)`;
  LENS.beak.style.transform = `translate3d(0, ${g.beakY - 7}px, 0) rotate(45deg)`;
  LENS.beak.classList.toggle('is-hidden', !g.beakShown);
}
function cLensPlace() { if (LENS.open && LENS.wrap) cLensApply(cLensGeometry()); }
function cLensPlaceSoon() { if (LENS.raf) return; LENS.raf = requestAnimationFrame(() => { LENS.raf = 0; cLensPlace(); }); }

/* content entrance: title, facts, actions arrive in a short stagger (once per show) */
function cLensStagger(root, base) {
  if (MO.reduced()) return;
  const fam = MO.family();
  const nodes = Array.from(root.children).slice(0, 9);
  const step = fam === 'retro' ? 0 : (fam === 'glass' ? 30 : 24);
  nodes.forEach((n, i) => LENS.anims.push(MO.animate(n, [{ opacity: 0, transform: 'translateY(6px)' }, { opacity: 1, transform: 'none' }],
    { dur: 'med', ease: 'ease', delay: (base || 0) + i * step, fill: 'backwards' })));
}

function cLensOpenMotion(g) {
  if (MO.reduced()) return;
  const fam = MO.family(), nier = MO.nier(), s = MO.spec();
  LENS.plate.style.transformOrigin = `0px ${g.beakY}px`;
  const hy = Math.max(0.004, 1 / Math.max(40, g.h));
  let frames, opts;
  if (nier) {
    frames = [
      { transform: `scale(0.02, ${hy})`, opacity: 1, easing: 'linear' },
      { transform: `scale(1, ${hy})`, opacity: 1, offset: 0.4, easing: 'steps(4, end)' },
      { transform: 'none', opacity: 1 },
    ];
    opts = { dur: 300, ease: 'linear' };
  } else if (fam === 'retro') {
    frames = [
      { transform: 'scale(0.34, 0.06)', easing: 'steps(1, end)' },
      { transform: 'scale(1, 0.06)', offset: 0.34, easing: 'steps(1, end)' },
      { transform: 'scale(1, 0.5)', offset: 0.67, easing: 'steps(1, end)' },
      { transform: 'none' },
    ];
    opts = { dur: 220, ease: 'linear' };
  } else if (fam === 'glass') {
    LENS.plate.style.transformOrigin = `0px ${g.beakY}px`;
    frames = [{ transform: 'translateX(-6px) scale(0.96)', opacity: 0 }, { transform: 'none', opacity: 1 }];
    opts = { dur: 'slow', ease: 'ease' };
  } else if (fam === 'friendly') {
    frames = [{ transform: 'scale(0.6, 0.08)', opacity: 0.4 }, { transform: 'none', opacity: 1 }];
    opts = { dur: 'slow', ease: 'spring' };
  } else {
    frames = [{ transform: 'scale(0.6, 0.08)', opacity: 0.5 }, { transform: 'none', opacity: 1 }];
    opts = { dur: 'med', ease: 'ease' };
  }
  const total = typeof opts.dur === 'number' ? opts.dur : s[opts.dur];
  LENS.anims.push(MO.animate(LENS.plate, frames, Object.assign({ fill: 'none' }, opts)));
  /* the beak appears last; Retro's blinks once */
  const beakRot = `translate3d(0, ${g.beakY - 7}px, 0) rotate(45deg)`;
  if (fam === 'retro' && !nier) {
    LENS.anims.push(MO.animate(LENS.beak, [
      { opacity: 0, easing: 'steps(1, end)' }, { opacity: 1, offset: 0.4, easing: 'steps(1, end)' }, { opacity: 0, offset: 0.7, easing: 'steps(1, end)' }, { opacity: 1 },
    ], { dur: 260, delay: total, ease: 'linear', fill: 'backwards' }));
  } else {
    LENS.anims.push(MO.animate(LENS.beak, [{ opacity: 0, transform: beakRot.replace('translate3d(0,', 'translate3d(6px,') }, { opacity: 1, transform: beakRot }],
      { dur: 'fast', delay: Math.round(total * 0.65), ease: 'ease', fill: 'backwards' }));
  }
  cLensStagger(LENS.content, Math.round(total * 0.35));
}

/* show the Lens for a row. entry = { key, el, build(), label, kind, icon } */
function cLensShow(P, entry, opts) {
  opts = opts || {};
  cLensBuild();
  const node = entry.build();
  if (!node) return;
  const sameOwner = LENS.open && LENS.owner === P;
  if (LENS.open && LENS.key === entry.key && sameOwner && !opts.refresh) { LENS.rowEl = entry.el; cLensPlace(); return; }
  const kicker = h('span.pmr-c-lens-kick', PMR.icon(entry.icon || 'info', 'pmr-c-lens-kick-ico'), h('span', { text: entry.kind || 'Detail' }));
  if (LENS.rowEl && LENS.rowEl !== entry.el) LENS.rowEl.removeAttribute('aria-expanded');
  LENS.rowEl = entry.el;
  if (entry.el) entry.el.setAttribute('aria-expanded', 'true');
  LENS.wrap.setAttribute('aria-label', (entry.kind ? entry.kind + ': ' : '') + (entry.label || ''));
  if (!LENS.open || !sameOwner) {
    cLensCancelAnims();
    LENS.owner = P; LENS.key = entry.key; LENS.open = true;
    LENS.kicker.replaceChildren(kicker);
    LENS.content.replaceChildren(node);
    LENS.wrap.classList.add('is-open');
    LENS.wrap.style.opacity = '';
    LENS.scroll.scrollTop = 0;
    const g = cLensGeometry();
    cLensApply(g);
    cLensListen();
    cLensOpenMotion(g);
    document.dispatchEvent(new CustomEvent('pmr:c-lens', { detail: { open: true, panel: P.panel.id, key: entry.key } }));
    return;
  }
  /* follow: glide to the new row, cross-fade the content, spring the height */
  LENS.key = entry.key;
  const fromY = LENS.y, fromH = LENS.plate.getBoundingClientRect().height;
  const swap = () => {
    LENS.fading = null;
    const next = LENS.pending; LENS.pending = null;
    if (!next || !LENS.open) return;
    cLensCancelAnims();
    LENS.kicker.replaceChildren(next.kicker);
    LENS.content.replaceChildren(next.node);
    LENS.scroll.scrollTop = 0;
    const g = cLensGeometry();
    cLensApply(g);
    if (MO.reduced()) return;
    const retro = MO.family() === 'retro' && !MO.nier();
    LENS.anims.push(MO.animate(LENS.wrap, [{ transform: `translate3d(${g.x}px, ${fromY}px, 0)` }, { transform: `translate3d(${g.x}px, ${g.y}px, 0)` }], { dur: 'med', ease: retro ? 'ease' : 'spring', fill: 'none' }));
    if (Math.abs(fromH - g.h) > 2) LENS.anims.push(MO.animate(LENS.plate, [{ height: fromH + 'px' }, { height: g.h + 'px' }], { dur: 'med', ease: retro ? 'ease' : 'spring', fill: 'none' }));
    LENS.anims.push(MO.animate(LENS.content, [{ opacity: 0, transform: 'translateY(4px)' }, { opacity: 1, transform: 'none' }], { dur: 'fast', ease: 'ease', fill: 'none' }));
  };
  LENS.pending = { node, kicker };
  if (LENS.fading) return;
  if (MO.reduced()) { swap(); return; }
  const out = MO.animate(LENS.content, [{ opacity: 1 }, { opacity: 0 }], { dur: 80, ease: 'linear', fill: 'forwards' });
  LENS.fading = out;
  if (out) out.onfinish = () => { try { out.cancel(); } catch (e) { /* ignore */ } swap(); };
  else swap();
}

function cLensHide(reason, opts) {
  opts = opts || {};
  if (!LENS.open) return;
  const P = LENS.owner, row = LENS.rowEl;
  LENS.open = false;
  LENS.pending = null; LENS.fading = null;
  cLensUnlisten();
  cLensCancelAnims();
  if (row) row.removeAttribute('aria-expanded');
  const wrap = LENS.wrap;
  const done = () => { if (!LENS.open && wrap) { wrap.classList.remove('is-open'); LENS.content.replaceChildren(); wrap.style.opacity = ''; } };
  if (!MO.reduced() && wrap) {
    const fam = MO.family();
    LENS.plate.style.transformOrigin = `0px ${LENS.beakY}px`;
    const frames = MO.nier() ? [{ transform: 'none', opacity: 1 }, { transform: `scale(1, ${1 / Math.max(40, LENS.plate.offsetHeight)})`, opacity: 1, offset: 0.6 }, { transform: 'scale(0, 0.004)', opacity: 0 }]
      : fam === 'retro' ? [{ transform: 'none', easing: 'steps(1, end)' }, { transform: 'scale(1, 0.4)', offset: 0.5, easing: 'steps(1, end)' }, { transform: 'scale(1, 0.06)', opacity: 1 }]
        : fam === 'glass' ? [{ transform: 'none', opacity: 1 }, { transform: 'translateX(-6px) scale(0.96)', opacity: 0 }]
          : [{ transform: 'none', opacity: 1 }, { transform: 'scale(0.6, 0.08)', opacity: 0 }];
    const a = MO.animate(LENS.plate, frames, { dur: 'fast', ease: fam === 'retro' ? 'linear' : 'ease', fill: 'forwards' });
    const b = MO.animate(LENS.beak, [{ opacity: 1 }, { opacity: 0 }], { dur: 80, fill: 'forwards' });
    if (a) a.onfinish = () => { done(); a.cancel(); if (b) b.cancel(); }; else done();
  } else done();
  if (P && P.onLensClosed) P.onLensClosed(reason);
  if (opts.focusRow && row && row.isConnected) row.focus({ preventScroll: true });
  LENS.owner = null; LENS.key = null; LENS.rowEl = null;
  if (LENS.pinned) cLensPin(false);
  document.dispatchEvent(new CustomEvent('pmr:c-lens', { detail: { open: false, reason } }));
}
function cLensDestroy() {
  cLensHide('destroy');
  cLensUnlisten();
  if (LENS.wrap && LENS.wrap.parentNode) LENS.wrap.parentNode.removeChild(LENS.wrap);
  LENS.wrap = null;
}

/* ---------- Lens documents --------------------------------------------------------------------------------------
   parts: { title, mono, sub, status, letter, line (array of short facts), blocked, note, noteMono, facts, related,
            actions, extra (nodes after the actions), tech, notes, navKey, P, primaryEnter } */
function cFactRow(f, wide) {
  const [label, value, o] = f;
  const opt = o || {};
  const long = wide || String(value).length > 26 || opt.mono && String(value).length > 18;
  const val = h('span', { class: ['pmr-c-fact-v', opt.mono && 'is-mono'], text: value });
  return h('div', { class: ['pmr-c-fact', long && 'is-wide'], 'data-state': opt.state || null },
    h('span.pmr-c-fact-k', { text: label }),
    opt.state ? h('span.pmr-c-fact-vs', cGlyph({ state: opt.state }, { loud: true }), val) : val);
}
function cFactsGrid(facts) {
  const list = (facts || []).filter(Boolean);
  if (!list.length) return null;
  return h('div.pmr-c-facts', list.map(f => cFactRow(f)));
}
function cTech(facts, navKey) {
  const list = (facts || []).filter(Boolean);
  if (!list.length) return null;
  const body = h('div.pmr-c-tech-body', { hidden: true }, list.map(f => cFactRow(f, true)));
  const btn = h('button', { type: 'button', class: 'pmr-c-tech-btn pmr-cur', 'aria-expanded': 'false', 'data-pmr-nav': 'expand', 'data-pmr-nav-id': 'lenstech:' + (navKey || '') },
    PMR.icon('chevR', 'pmr-c-chev'), h('span', { text: 'Technical details' }), h('span.pmr-c-tech-n', { text: String(list.length) }));
  btn.addEventListener('click', () => {
    const open = btn.getAttribute('aria-expanded') !== 'true';
    btn.setAttribute('aria-expanded', String(open));
    if (open) btn.removeAttribute('data-pmr-nav'); else btn.setAttribute('data-pmr-nav', 'expand');
    MO.height(body, open, { dur: 'fast' });
    if (open) setTimeout(cLensPlaceSoon, 0);
  });
  return h('div.pmr-c-tech', btn, body);
}
function cLensHeading(text, extra) { return h('div.pmr-c-lens-h', h('span', { text }), extra || null); }

function cLensDoc(parts) {
  const P = parts.P;
  const facts = [], tech = [];
  (parts.facts || []).forEach(f => { if (!f) return; ((f[2] && f[2].group === 'Technical details') ? tech : facts).push(f); });
  (parts.tech || []).forEach(f => tech.push(f));
  const titleEl = h('h3', { class: ['pmr-c-lens-name', parts.mono && 'is-mono'], text: parts.title });
  const statusBits = [];
  if (parts.letter) statusBits.push(PMR.letterEl(parts.letter));
  const FILE_STATES = { modified: 1, added: 1, deleted: 1, untracked: 1, conflict: 1, ignored: 1 };
  if (parts.status && parts.letter && FILE_STATES[parts.status.state]) statusBits.push(h('span.pmr-status.pmr-c-status', { 'data-state': parts.status.state }, h('span.pmr-status-word', { text: parts.status.word })));
  else if (parts.status) statusBits.push(cStatusWordEl(parts.status));
  if (parts.diff) statusBits.push(cDiff(parts.diff));
  (parts.line || []).filter(Boolean).forEach(t => statusBits.push(h('span.pmr-c-lens-bit', { text: t })));
  const acts = cSortActions(parts.actions);
  const actEls = acts.map(a => cActRow(a, { P, navKey: parts.navKey, enter: parts.primaryEnter !== false }));
  const dangerAt = acts.findIndex(a => a.danger);
  if (dangerAt > 0) actEls.splice(dangerAt, 0, h('div.pmr-c-act-sep', { role: 'separator' }));
  const blocked = parts.blocked ? h('div.pmr-c-lens-blocked', { 'data-state': parts.blocked.state || 'blocked' },
    h('div.pmr-c-lens-blocked-h', cGlyph({ state: parts.blocked.state || 'blocked' }, { loud: true }), h('span', { text: parts.blocked.title || 'Blocked' })),
    h('p', { text: parts.blocked.reason }),
    (parts.blocked.allowed || []).length ? h('div.pmr-c-acts.is-inline', parts.blocked.allowed.map(a => cActRow(a, { P, navKey: parts.navKey + ':blocked' }))) : null) : null;
  return h('div.pmr-c-lens-doc',
    h('div.pmr-c-lens-head', titleEl, parts.sub ? h('div', { class: ['pmr-c-lens-sub', parts.subMono !== false && 'is-mono'], text: parts.sub }) : null,
      statusBits.length ? h('div.pmr-c-lens-status', statusBits) : null,
      parts.meta ? h('p.pmr-c-lens-meta.pmr-c-lens-metaline', { text: parts.meta }) : null),
    blocked,
    (parts.lead || []).filter(Boolean),
    parts.note ? h('p', { class: ['pmr-c-lens-note', parts.noteMono && 'is-mono'], 'data-state': parts.noteState || null, text: parts.note }) : null,
    facts.length ? cFactsGrid(facts) : null,
    (parts.related || []).filter(Boolean),
    actEls.length ? h('div.pmr-c-acts', { role: 'group', 'aria-label': 'Actions' }, actEls) : null,
    (parts.extra || []).filter(Boolean),
    cTech(tech, parts.navKey),
    (parts.notes || []).filter(Boolean).length ? h('div.pmr-c-lens-notes', parts.notes.filter(Boolean).map(n => h('p', { text: n }))) : null);
}
