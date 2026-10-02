/* Concept A — Ledger ("read it in place"). Shared helpers for the three panels and the bar.
   Every file in this folder is concatenated in name order into ONE wrapper, so these names are visible to 10-files.js,
   20-source.js, 30-docker.js, 40-bar.js and 90-register.js. Classes are prefixed pmr-a-; CSS lives in a*.css under
   html[data-rail-concept="a"].

   Reach model: every view's pane is rendered eagerly (inactive panes hidden) and every row's detail is rendered
   eagerly (collapsed bodies hidden), so every action is in the document and reachable by a tab and a disclosure.
   data-pmr-nav sits only on controls that reveal content (closed disclosures, inactive tabs, menu triggers, row
   selection); a control that collapses something never carries it. */

const h = PMR.h;
const ico = PMR.icon;
const M = PMR.motion;
const A = { keep: {}, tabMemo: {} };

const cx = (...a) => a.filter(Boolean).join(' ');
const reduced = () => M.reduced();
const fam = () => (M.nier() ? 'nier' : M.family());
const stepped = () => { const f = fam(); return f === 'retro' || f === 'nier'; };

/* ---------- small DOM helpers ------------------------------------------------------------------------------------ */
function setNav(el, kind, id, on) {
  if (!el) return;
  if (id) el.setAttribute('data-pmr-nav-id', id);
  if (on) el.setAttribute('data-pmr-nav', kind); else el.removeAttribute('data-pmr-nav');
}
function navIdOf(...parts) { return parts.filter(p => p != null && p !== '').join(':').replace(/\s+/g, '_').slice(0, 140); }
/* the "more" mark: three dots drawn in CSS (PM_ICONS has no ellipsis icon, and glyph characters are not icons) */
function dots() { return h('span.pmr-a-dots', { 'aria-hidden': 'true' }); }
/* attention: a small dot in the state's colour (a glyph read like a close mark on a tab) */
function attnDot(state) { return h('span', { class: 'pmr-a-attn', 'data-state': state || 'warn', 'aria-hidden': 'true' }); }
function sep() { return h('span.pmr-a-dot', { 'aria-hidden': 'true', text: '·' }); }
function joinFacts(parts) {
  const out = [];
  parts.filter(p => p != null && p !== '' && p !== false).forEach((p, i) => {
    if (i) out.push(sep());
    if (p instanceof Node) { if (p.classList) p.classList.add('pmr-a-f'); out.push(p); } else out.push(h('span.pmr-a-f', { text: String(p) }));
  });
  return out;
}
function stateWord(status, cls) {
  if (!status || !status.word) return null;
  return h('span', { class: cx('pmr-a-word', cls), 'data-state': status.state || 'info', text: status.word });
}
function diffEl(diff) {
  if (!diff) return null;
  return h('span.pmr-diff.pmr-a-diff', { 'aria-label': diff.add + ' added, ' + diff.del + ' removed' },
    h('span.add', { text: '+' + diff.add }), h('span.del', { text: '−' + diff.del }));
}
function shortImage(ref) { if (!ref) return ''; const i = ref.lastIndexOf('/'); return i >= 0 ? ref.slice(i + 1) : ref; }
function factValue(facts, label) { const f = (facts || []).find(x => x[0] === label); return f ? f[1] : null; }

/* ---------- name fitting: middle truncation that keeps the extension; the full name lives in the hover tag ------- */
const FIT = { canvas: null, fonts: new Map() };
function measureText(text, font) {
  if (!FIT.canvas) FIT.canvas = document.createElement('canvas').getContext('2d');
  FIT.canvas.font = font;
  return FIT.canvas.measureText(text).width;
}
function nameEl(full, o) {
  o = o || {};
  const el = h('span', { class: cx('pmr-a-name', o.mono && 'is-mono', o.cls), text: full, 'data-full': full });
  if (o.hover !== false) PMR.hover(el, o.hoverLabel || full, o.hoverDetail || null);
  return el;
}
/* fit every .pmr-a-name[data-full] inside root to its box (one layout read for all, canvas measurement per name) */
function fitNames(root) {
  if (!root) return;
  const els = Array.from(root.querySelectorAll('.pmr-a-name[data-full]'));
  const boxes = els.map(el => (el.offsetParent ? el.clientWidth : 0));
  els.forEach((el, i) => {
    const w = boxes[i];
    if (!w) return;
    const full = el.getAttribute('data-full');
    let font = FIT.fonts.get(el.className);
    if (!font) { const cs = getComputedStyle(el); font = cs.fontStyle + ' ' + cs.fontWeight + ' ' + cs.fontSize + ' ' + cs.fontFamily; FIT.fonts.set(el.className, font); }
    const fw = measureText(full, font);
    if (fw <= w + 0.5) { if (el.textContent !== full) el.textContent = full; return; }
    let n = Math.max(6, Math.floor(full.length * w / fw));
    let t = PMR.util.midName(full, n);
    while (n > 6 && measureText(t, font) > w + 0.5) { n -= 1; t = PMR.util.midName(full, n); }
    if (el.textContent !== t) el.textContent = t;
  });
  fitFacts(root);
}
function resetFontCache() { FIT.fonts.clear(); }
/* line 2 keeps its most meaningful facts: when the line is too narrow, whole facts drop off the end (the first fact may
   still end with an ellipsis), never a cut in the middle of a word further along */
function fitFacts(root) {
  const lines = Array.from(root.querySelectorAll('.pmr-a-l2t')).filter(l => l.offsetParent !== null);
  lines.forEach(l => { for (const k of l.children) k.classList.remove('is-drop'); });
  const data = lines.map(l => ({ l, w: l.clientWidth, kids: Array.from(l.children).map(k => ({ k, w: k.getBoundingClientRect().width + (k.classList.contains('pmr-a-dot') ? 10 : 0) })) }));
  data.forEach(({ w, kids }) => {
    let used = 0, dropping = false;
    kids.forEach((x, i) => {
      if (dropping) { x.k.classList.add('is-drop'); return; }
      const isDot = x.k.classList.contains('pmr-a-dot');
      const next = isDot && kids[i + 1] ? kids[i + 1].w : 0;
      if (i > 0 && (isDot ? used + x.w + next : used + x.w) > w - 2) { dropping = true; x.k.classList.add('is-drop'); return; }
      used += x.w;
    });
  });
}

/* ---------- buttons ---------------------------------------------------------------------------------------------- */
/* act(action, { variant, menus, cls, keepPrimary, onLocal }) -> button. A row's primary action reads as the first,
   stronger button; the accent fill is kept for the single primary action of a section (keepPrimary). */
function act(a, o) {
  o = o || {};
  const copy = Object.assign({}, a);
  if (!o.keepPrimary) copy.primary = false;
  const b = PMR.button(copy, { variant: o.variant || 'text', menus: o.menus, cls: cx('pmr-a-act', a.primary && !o.keepPrimary && 'pmr-a-first', o.cls) });
  if (a.local) {
    b.setAttribute('data-local', a.local);
    if (o.onLocal) b.addEventListener('click', ev => { if (b.getAttribute('aria-disabled') === 'true') return; o.onLocal(a.local, b, ev); });
  }
  if (a.menu && o.menus && o.menus[a.menu]) setNav(b, 'menu', navIdOf('menu', a.menu, a.label), true);
  return b;
}
function iconAct(a, o) { return act(a, Object.assign({ variant: 'icon', cls: 'pmr-a-iact' }, o)); }
/* actions in their reading order: primary first, danger last */
function ordered(actions) {
  const list = (actions || []).slice();
  return list.filter(a => a.primary).concat(list.filter(a => !a.primary && !a.danger), list.filter(a => !a.primary && a.danger));
}
function actionRow(actions, o) {
  o = o || {};
  const list = ordered(actions);
  if (!list.length) return null;
  const row = h('div', { class: cx('pmr-a-acts', o.cls) }, list.map(a => act(a, o)));
  const why = list.filter(a => a.disabled);
  if (!why.length || o.reasons === false) return row;
  return h('div', { class: cx('pmr-a-actblock', o.blockCls) }, row,
    why.map(a => h('p.pmr-a-why', PMR.glyph('blocked'), h('span', h('b', { text: a.label + ': ' }), a.disabled))));
}
function menuItemsOf(actions) {
  return ordered(actions).map(a => ({ label: a.label, icon: a.icon, cmd: a.cmd, arg: a.arg, commandId: a.commandId, uiActionId: a.uiActionId,
    availability: a.availability, disabledReason: a.disabledReason, disabled: a.disabled, danger: a.danger, key: a.key, attrs: a.attrs, canon: a.canon, local: a.local, meta: a.meta }));
}

/* ---------- motion ----------------------------------------------------------------------------------------------- */
const INK_SPEC = {
  basic: { dur: 240, a: 'cubic-bezier(.3,0,.2,1)', b: 'cubic-bezier(.22,1,.36,1)', stretch: .38 },
  friendly: { dur: 380, a: 'cubic-bezier(.4,0,.2,1)', b: 'cubic-bezier(.34,1.56,.64,1)', stretch: .4 },
  glass: { dur: 460, a: 'cubic-bezier(.4,0,.2,1)', b: 'cubic-bezier(.16,1,.3,1)', stretch: .45 },
  retro: { dur: 150, steps: 'steps(3, end)' },
  nier: { dur: 200, steps: 'steps(4, end)' },
};
function animateEl(el, frames, opts) {
  if (!el || !el.animate || reduced()) return null;
  try { return el.animate(frames, opts); } catch (e) { return null; }
}
/* the entrance cascade: once per show / tab visit, never on scroll */
function cascade(nodes, o) {
  o = o || {};
  if (reduced()) return;
  const list = Array.from(nodes || []).filter(n => n && n.offsetParent !== null).slice(0, o.max || 14);
  if (stepped()) {
    list.forEach((n, i) => animateEl(n, [{ opacity: 0 }, { opacity: 1 }], { duration: 50, delay: Math.min(i, 8) * 17, easing: 'steps(1, end)', fill: 'backwards' }));
    return;
  }
  const f = fam(), s = M.spec();
  const dy = o.dy != null ? o.dy : 6;
  const from = f === 'glass' ? `translateY(${dy}px) scale(.985)` : `translateY(${dy}px)`;
  list.forEach((n, i) => animateEl(n, [{ opacity: 0, transform: from }, { opacity: 1, transform: 'none' }],
    { duration: o.dur || s.med, delay: (o.delay || 0) + i * (o.step || 18), easing: f === 'friendly' ? s.spring : s.ease, fill: 'backwards' }));
}
/* counts that change tick over: the old number slides up and out, the new one slides in */
function tick(el, text) {
  if (!el) return;
  text = String(text);
  if (el.textContent === text) return;
  if (reduced() || !el.isConnected) { el.textContent = text; return; }
  const s = M.spec();
  const old = h('span.pmr-a-tick-old', { text: el.textContent });
  const cur = h('span.pmr-a-tick-new', { text });
  el.textContent = '';
  el.append(old, cur);
  const ease = stepped() ? 'steps(2, end)' : s.ease;
  animateEl(old, [{ transform: 'translateY(0)', opacity: 1 }, { transform: 'translateY(-100%)', opacity: 0 }], { duration: s.fast, easing: ease, fill: 'forwards' });
  const an = animateEl(cur, [{ transform: 'translateY(100%)', opacity: 0 }, { transform: 'translateY(0)', opacity: 1 }], { duration: s.fast, easing: ease, fill: 'backwards' });
  const done = () => { if (el.contains(cur)) el.textContent = text; };
  if (an) an.onfinish = done; else done();
}

/* ---------- disclosure ------------------------------------------------------------------------------------------- */
/* measured height spring, the chevron turns (CSS), the detail lines fade in with a small stagger */
function toggleBody(inst, key, body, header, open, o) {
  o = o || {};
  inst.open.set(key, open);
  header.setAttribute('aria-expanded', String(open));
  (o.host || header).classList.toggle('is-open', open);
  if (o.nav) setNav(o.nav.el, o.nav.kind || 'expand', o.nav.id, !open);
  if (o.instant || reduced()) { body.hidden = !open; body.style.height = ''; body.style.overflow = ''; if (open) fitNames(body); return null; }
  const anim = M.height(body, open, { dur: open ? 'med' : 'fast' });
  if (open) {
    fitNames(body);
    cascade(body.querySelectorAll(':scope > .pmr-a-dline, :scope > * > .pmr-a-dline'), { dy: 4, step: 14, max: 8, dur: M.spec().fast });
  }
  return anim;
}

/* ---------- facts: stacked label-over-value lines; raw IDs under a nested "Technical details" disclosure --------- */
function factLine(f) {
  const [label, value, opt] = f;
  const o = opt || {};
  const v = h('span', { class: cx('pmr-a-fv', o.mono && 'is-mono'), 'data-state': o.state || null },
    o.state ? PMR.glyph(o.state) : null, h('span', { text: String(value) }));
  return h('div', { class: 'pmr-a-fact pmr-a-dline', 'data-canon': o.canon || null }, h('span.pmr-a-fk', { text: label }), v);
}
function factsBlock(inst, facts, keyBase) {
  const plain = (facts || []).filter(f => !(f[2] && f[2].group));
  const groups = {};
  (facts || []).forEach(f => { if (f[2] && f[2].group) (groups[f[2].group] = groups[f[2].group] || []).push(f); });
  const out = [];
  if (plain.length) out.push(h('div.pmr-a-facts.pmr-a-dline', plain.map(factLine)));
  Object.keys(groups).forEach(g => out.push(miniDisclosure(inst, navIdOf(keyBase, g), g, () => h('div.pmr-a-facts', groups[g].map(factLine)))));
  return out;
}
/* a small nested disclosure (Technical details, Where this runs) */
function miniDisclosure(inst, key, label, build, o) {
  o = o || {};
  const isOpen = () => (inst.open.has(key) ? inst.open.get(key) : !!o.open);
  const open = isOpen();
  const btn = h('button', { type: 'button', class: cx('pmr-a-mini', o.cls), 'aria-expanded': String(open) },
    ico('chevR', 'pmr-a-chev'), h('span.pmr-a-mini-label', { text: label }), o.right || null);
  const body = h('div', { class: cx('pmr-a-minibody', o.bodyCls), hidden: !open }, build());
  const wrap = h('div', { class: cx('pmr-a-minidisc pmr-a-dline', open && 'is-open', o.wrapCls) }, btn, body);
  const navId = navIdOf('x', inst.pid, key);
  setNav(btn, 'expand', navId, !open);
  btn.addEventListener('click', ev => { ev.preventDefault(); toggleBody(inst, key, body, btn, !isOpen(), { host: wrap, nav: { el: btn, id: navId } }); });
  return wrap;
}

/* ---------- ledger row ------------------------------------------------------------------------------------------- */
/* row(inst, item, o): two lines (name / one muted fact line), a fixed right column, a hover "more" button that never
   pushes text, an inline detail under the row.
   o: { wordAt: 'l1'|'l2', l2(item) -> parts, right(item) -> nodes, primary: action|null, menus, onLocal(local, el, ev, item),
        extra(item) -> nodes, detailActions(item), menuDef(item), context(ev, item, el), navScope, cls } */
function primaryOf(item) {
  const list = item.actions || [];
  return list.find(a => a.primary && !a.disabled && (a.cmd || a.commandId || a.uiActionId)) || list.find(a => /^Open( diff)?$/.test(a.label) && !a.disabled && a.cmd) || null;
}
function hasDetail(item, o) {
  return !!((item.facts && item.facts.length) || (item.actions && item.actions.length) || item.note || (item.children && item.children.length)
    || (item.hunks && item.hunks.length) || item.preview || (item.ports && item.ports.length) || (item.metrics && item.metrics.length) || (o && o.extra));
}
function row(inst, item, o) {
  o = o || {};
  const key = 'row:' + item.id;
  const detailable = hasDetail(item, o) && o.flat !== true;
  if (o.defaultOpen && item.open && !inst.open.has(key)) inst.open.set(key, true);
  const open = detailable && inst.open.get(key) === true;
  const primary = o.primary !== undefined ? o.primary : primaryOf(item);
  const withIcon = !!(item.icon && o.icons !== false);
  const el = h('div', { class: cx('pmr-a-row pmr-cur', o.cls, withIcon && 'has-ico', open && 'is-open', !detailable && 'is-flat', item.active && 'is-current'),
    role: 'listitem', 'data-item': item.id, 'data-canon': item.canon || null });
  if (item.attrs) Object.keys(item.attrs).forEach(k => { if (!/^data-pm-hover/.test(k)) el.setAttribute(k, item.attrs[k]); });
  if (item.active) el.setAttribute('aria-current', 'true');

  /* line 1 */
  const chev = detailable
    ? h('button', { type: 'button', class: 'pmr-a-disc', 'aria-expanded': String(open), 'aria-label': (open ? 'Hide' : 'Show') + ' details for ' + item.name }, ico('chevR', 'pmr-a-chev'))
    : h('span.pmr-a-disc.is-empty', { 'aria-hidden': 'true' });
  const mainKids = [o.lead ? o.lead(item) : null, withIcon ? ico(item.icon, 'pmr-a-ricon') : null,
    o.wrap ? h('span.pmr-a-name.is-wrap', { text: item.name, 'data-pm-hover-label': item.name }) : nameEl(item.name, { mono: item.mono, hoverDetail: item.path || (o.hoverDetail ? o.hoverDetail(item) : null) })];
  const main = primary
    ? h('button', Object.assign({ type: 'button', class: 'pmr-a-main' }, PMR.actionAttrs(Object.assign({}, primary, { primary: false })), { 'aria-label': primary.label + ': ' + item.name }), mainKids)
    : h('button', { type: 'button', class: cx('pmr-a-main', detailable && 'is-toggle', !detailable && 'is-inert'), 'aria-label': item.name, tabindex: detailable ? null : '-1' }, mainKids);
  const right = h('span.pmr-a-r1');
  if (o.right) PMR.append(right, [o.right(item)]);
  else {
    const d = item.time ? diffEl(item.diff) : null; if (d) right.appendChild(d);
    if (item.letter) right.appendChild(PMR.letterEl(item.letter, item.status && item.status.state));
    else if (item.status) right.appendChild(PMR.glyph(item.status.state));
  }
  let more = null;
  const menuActs = (o.menuActions ? o.menuActions(item) : item.actions) || [];
  if (menuActs.length || o.menuDef) {
    more = h('button', { type: 'button', class: 'pmr-a-more', tabindex: '-1', 'aria-haspopup': 'menu' }, dots());
    PMR.hover(more, 'More actions', item.name);
    more.addEventListener('click', ev => {
      ev.preventDefault(); ev.stopPropagation();
      const menu = o.menuDef ? o.menuDef(item) : { id: 'row-' + item.id, label: item.name, groups: [{ items: menuItemsOf(menuActs) }] };
      PMR.menu.toggle(menu, more, { menus: o.menus, align: 'end', onPick: it => { if (it.local && o.onLocal) o.onLocal(it.local, more, null, item); } });
    });
  }
  el.appendChild(h('div.pmr-a-l1', chev, main, h('span', { class: cx('pmr-a-rcol', more && 'has-more') }, right, more)));

  /* line 2 */
  const parts = o.l2 ? o.l2(item) : defaultL2(item, o);
  const time = o.time === false ? null : item.time;
  const l2diff = !item.time && !o.right ? diffEl(item.diff) : null;
  /* the name owns line 1 (only the glyph or letter at its right); the status word reads in line 2's right column */
  const word = o.l2right || o.word === false || item.letter || !item.status || !item.status.word ? null : stateWord(item.status, 'pmr-a-rword');
  const time2 = o.timeOn3 ? null : time;
  let l2 = null;
  if ((parts && parts.length) || time2 || l2diff || word || o.l2right) {
    l2 = h('div.pmr-a-l2', h('span.pmr-a-l2t', joinFacts(parts || [])), l2diff ? h('span.pmr-a-l2r', l2diff) : null,
      o.l2right ? h('span.pmr-a-l2r', o.l2right(item)) : null, word ? h('span.pmr-a-l2r', word) : null, time2 ? h('span.pmr-a-time', { text: time2 }) : null);
    el.appendChild(l2);
  }
  if (o.l3) {
    const p3 = o.l3(item) || [];
    if (p3.length || (o.timeOn3 && time)) el.appendChild(h('div.pmr-a-l2.pmr-a-l3', h('span.pmr-a-l2t', joinFacts(p3)), o.timeOn3 && time ? h('span.pmr-a-time', { text: time }) : null));
  }

  /* blocked: stays visible while collapsed */
  if (item.blocked) {
    el.appendChild(h('div.pmr-a-blocked', { 'data-code': item.blocked.code, 'data-canon': item.blocked.canon || null },
      PMR.glyph(item.status && /warn|stale/.test(item.status.state) ? 'warn' : 'blocked'),
      h('span.pmr-a-blocked-t', { text: item.blocked.reason }),
      (item.blocked.allowed || []).length ? h('span.pmr-a-blocked-acts', item.blocked.allowed.map(a => act(a, { variant: 'quiet', cls: 'pmr-a-sm' }))) : null));
  }

  if (detailable) {
    const body = h('div.pmr-a-detail', { hidden: !open }, detailOf(inst, item, o));
    el.appendChild(body);
    const navId = navIdOf('x', inst.pid, o.navScope, item.id);
    setNav(chev, 'expand', navId, !open);
    const toggle = () => {
      const now = inst.open.get(key) !== true;
      chev.setAttribute('aria-label', (now ? 'Hide' : 'Show') + ' details for ' + item.name);
      toggleBody(inst, key, body, chev, now, { host: el, nav: { el: chev, id: navId } });
    };
    chev.addEventListener('click', ev => { ev.preventDefault(); toggle(); });
    if (!primary) main.addEventListener('click', ev => { ev.preventDefault(); toggle(); });
    if (l2) { l2.classList.add('is-toggle'); l2.addEventListener('click', ev => { if (ev.target.closest('button')) return; toggle(); }); }
    el._toggle = toggle;
  }
  if (o.context) el.addEventListener('contextmenu', ev => o.context(ev, item, el));
  el.addEventListener('keydown', ev => {
    const onMain = ev.target === main;
    if (ev.key === 'ArrowRight' && onMain && el._toggle && inst.open.get(key) !== true) { ev.preventDefault(); el._toggle(); }
    else if (ev.key === 'ArrowLeft' && onMain && el._toggle && inst.open.get(key) === true) { ev.preventDefault(); el._toggle(); }
    else if (ev.key === 'F10' && ev.shiftKey && o.context) { ev.preventDefault(); const r = el.getBoundingClientRect(); o.context({ preventDefault() {}, clientX: r.left + 40, clientY: r.top + 20 }, item, el); }
    else if ((ev.key === 'ArrowDown' || ev.key === 'ArrowUp') && onMain) {
      ev.preventDefault();
      const scope = el.closest('.pmr-a-pane') || el.parentNode;
      const all = Array.from(scope.querySelectorAll('.pmr-a-main')).filter(b => b.offsetParent !== null);
      const nx = all[all.indexOf(main) + (ev.key === 'ArrowDown' ? 1 : -1)]; if (nx) nx.focus();
    }
  });
  return el;
}
function defaultL2(item) {
  const meta = (item.meta || []).filter(m => !(item.status && m === item.status.word));
  return (item.owner ? [item.owner] : []).concat(meta);
}
/* the inline detail, in the expander slot order: facts / status / blocked reason / actions / overflow */
function detailOf(inst, item, o) {
  const out = [];
  if (item.note) out.push(h('p', { class: cx('pmr-a-note pmr-a-dline', item.status && /failed|blocked/.test(item.status.state) && 'is-alert'), text: item.note }));
  if (item.preview) out.push(h('p.pmr-a-preview.pmr-a-dline', { text: item.preview }));
  if (item.metrics && item.metrics.length) out.push(h('div.pmr-a-metrics.pmr-a-dline', item.metrics.map(meter)));
  if (item.hunks && item.hunks.length) {
    out.push(h('div.pmr-a-hunks.pmr-a-dline', item.hunks.map(hk => h('div.pmr-a-hunk',
      h('code.pmr-a-hunkh', { text: hk.header, 'data-pm-hover-label': 'Hunk', 'data-pm-hover-detail': hk.header }),
      h('span.pmr-a-hunkacts', (hk.actions || []).map(a => act(a, { variant: 'quiet', cls: 'pmr-a-sm' })))))));
  }
  if (item.children && item.children.length) out.push(h('div.pmr-a-kids.pmr-a-dline', item.children.map(c => childLine(c))));
  if (item.ports && item.ports.length) {
    out.push(h('div.pmr-a-ports.pmr-a-dline', h('span.pmr-a-fk', { text: item.ports.length === 1 ? 'Port' : 'Ports' }),
      h('span.pmr-a-portlist', item.ports.map(p => act({ label: p.label, icon: 'external', cmd: p.cmd, arg: p.arg }, { variant: 'quiet', cls: 'pmr-a-sm pmr-a-port' })))));
  }
  if (item.facts && item.facts.length) out.push(...factsBlock(inst, item.facts, 'tech:' + item.id));
  if (o.extra) out.push(...[].concat(o.extra(item) || []));
  const acts = o.detailActions ? o.detailActions(item) : item.actions;
  const ar = actionRow(acts, { variant: 'quiet', cls: 'pmr-a-dacts', menus: o.menus, onLocal: o.onLocal ? (l, b, ev) => o.onLocal(l, b, ev, item) : null });
  if (ar) { ar.classList.add('pmr-a-dline'); out.push(ar); }
  return out;
}
function childLine(c) {
  const sub = (c.meta || []).length || c.status;
  return h('div', { class: cx('pmr-a-kid', sub && 'is-two'), 'data-canon': c.canon || null },
    h('div.pmr-a-kid1', nameEl(c.name, { mono: c.mono }), c.diff ? h('span.pmr-a-kidr', diffEl(c.diff)) : null),
    sub ? h('div.pmr-a-kid2', joinFacts([c.status ? PMR.statusEl(c.status) : null].concat(c.meta || []))) : null);
}
function meter(m) {
  const v = PMR.util.clamp(+m.value || 0, 0, 100);
  return h('div', { class: 'pmr-a-meter', 'data-state': m.state || null },
    h('span.pmr-a-meter-k', { text: m.label }), h('span.pmr-a-meter-v.pmr-num', { text: m.text || (v + '%') }),
    h('span.pmr-a-meter-track', { 'aria-hidden': 'true' }, h('span.pmr-a-meter-fill', { style: { transform: `scaleX(${v / 100})` } })));
}
/* a fact item (kind 'fact' / 'summary'): label over value, with its status word */
function factItem(inst, item, o) {
  o = o || {};
  const val = (item.meta || []).join(' · ');
  const showWord = item.status && item.status.word && item.status.word !== val;
  const el = h('div', { class: 'pmr-a-fitem', 'data-item': item.id, 'data-canon': item.canon || null },
    h('div.pmr-a-fhead', h('span.pmr-a-fk', { text: item.name }), showWord && val ? PMR.statusEl(item.status) : null),
    h('span', { class: cx('pmr-a-fv', item.mono && 'is-mono') },
      showWord && !val ? PMR.statusEl(item.status) : (item.status && !showWord ? PMR.glyph(item.status.state) : null),
      val ? h('span', { text: val }) : null));
  if (item.metrics && item.metrics.length) el.append(h('div.pmr-a-metrics', item.metrics.map(meter)));
  if (item.note) el.append(h('p.pmr-a-note', { text: item.note }));
  if (item.children && item.children.length) el.append(h('div.pmr-a-kids', item.children.map(c => childLine(c))));
  if (item.actions && item.actions.length) el.append(actionRow(item.actions, { menus: o.menus, variant: 'quiet', cls: 'pmr-a-factacts' }));
  if (item.facts && item.facts.length) el.append(...factsBlock(inst, item.facts, 'tech:' + item.id));
  return el;
}

/* ---------- sections --------------------------------------------------------------------------------------------- */
/* section(inst, sec, o): heading (label + plain count + quiet actions); collapsible when the fixture gives `open`;
   body built eagerly. o: { build(sec) -> nodes, menus, onLocal, viewId } */
function section(inst, sec, o) {
  o = o || {};
  const key = 'sec:' + (o.viewId || '') + ':' + sec.id;
  const collapsible = sec.open === false || (sec.open === true && o.collapsible !== false);
  const isOpen = () => (inst.open.has(key) ? inst.open.get(key) : sec.open !== false);
  const open = isOpen();
  const numeric = typeof sec.count === 'number';
  const label = h('h3', { class: 'pmr-a-seclabel pmr-head', text: sec.label });
  const count = numeric ? h('span.pmr-a-count.pmr-num', { text: String(sec.count) }) : null;
  const head = collapsible
    ? h('button', { type: 'button', class: 'pmr-a-sectoggle', 'aria-expanded': String(open) }, ico('chevR', 'pmr-a-chev'), label, count)
    : h('div.pmr-a-sectitle', label, count);
  const acts = sec.actions || [];
  const inlineAct = acts.length === 1 && !acts[0].primary && sec.kind !== 'form' && sec.kind !== 'chain' ? act(acts[0], { variant: 'quiet', cls: 'pmr-a-secact', menus: o.menus, onLocal: o.onLocal }) : null;
  const sub = [];
  if (sec.status) sub.push(PMR.statusEl(sec.status));
  if (!numeric && sec.count != null && sec.count !== '' && !(sec.status && sec.status.word === sec.count)) sub.push(h('span', { text: String(sec.count) }));
  const headRow = h('div.pmr-a-sechead', head, inlineAct);
  const subEl = sub.length ? h('div.pmr-a-secsub', joinFacts(sub)) : null;
  const body = h('div.pmr-a-secbody', { hidden: !open });
  if (acts.length && !inlineAct && sec.kind !== 'form' && !o.actsAfter) body.append(actionRow(acts, { cls: 'pmr-a-secacts', blockCls: 'pmr-a-secblock', variant: 'quiet', keepPrimary: true, menus: o.menus, onLocal: o.onLocal }));
  PMR.append(body, [o.build ? o.build(sec) : null]);
  if (acts.length && !inlineAct && o.actsAfter) body.append(actionRow(acts, { cls: 'pmr-a-secacts is-after', blockCls: 'pmr-a-secblock', variant: 'quiet', keepPrimary: true, menus: o.menus, onLocal: o.onLocal }));
  if (sec.note) body.append(h('p.pmr-a-secnote', { text: sec.note }));
  const el = h('section', { class: cx('pmr-a-sec', open && 'is-open', collapsible && 'is-collapsible', 'pmr-a-kind-' + (sec.kind || 'list')), 'data-sec': sec.id, 'data-canon': sec.canon || null }, headRow, subEl, body);
  if (sec.attrs) Object.keys(sec.attrs).forEach(k => el.setAttribute(k, sec.attrs[k]));
  if (collapsible) {
    const navId = navIdOf('sec', inst.pid, o.viewId, sec.id);
    setNav(head, 'expand', navId, !open);
    head.addEventListener('click', ev => {
      ev.preventDefault();
      const now = !isOpen();
      toggleBody(inst, key, body, head, now, { host: el, nav: { el: head, id: navId } });
      if (now) cascade(body.querySelectorAll(':scope > * > .pmr-a-row, :scope > * > .pmr-a-fitem, :scope > * > .pmr-a-step'), { max: 10, step: 14 });
    });
  }
  return el;
}
function listOf(inst, sec, o) {
  return h('div.pmr-a-list', { role: 'list', 'aria-label': sec.label },
    (sec.items || []).map(it => ((it.kind === 'fact' || it.kind === 'summary') ? factItem(inst, it, o) : row(inst, it, o))));
}

/* ---------- tabs: one row of full-word tabs, a gliding ink, measured fit with a More menu ---------------------- */
function tabStrip(inst, views, onSelect) {
  const strip = h('div.pmr-a-tabs', { role: 'tablist', 'aria-label': inst.panel.title + ' views' });
  const ink = h('span.pmr-a-ink', { 'aria-hidden': 'true' });
  const tabs = new Map();
  const isCond = v => v.conditional && v.conditional.shown === false;
  views.forEach(v => {
    const b = h('button', { type: 'button', class: cx('pmr-a-tab pmr-strip pmr-chosen', isCond(v) && 'is-conditional'), role: 'tab', 'aria-selected': 'false', 'data-view': v.id },
      h('span.pmr-a-tablabel', { text: v.label }), v.attention ? attnDot(v.attention.state) : null);
    if (v.attention) PMR.hover(b, v.label, v.attention.text);
    else if (isCond(v)) PMR.hover(b, v.label, v.conditional.why);
    else if (v.summary) PMR.hover(b, v.label, v.summary);
    b.addEventListener('click', ev => { ev.preventDefault(); onSelect(v.id); });
    b.addEventListener('keydown', ev => {
      if (ev.key !== 'ArrowRight' && ev.key !== 'ArrowLeft') return;
      ev.preventDefault();
      const vis = Array.from(strip.querySelectorAll('.pmr-a-tab:not([hidden])')).sort((x, y) => (+x.style.order || 0) - (+y.style.order || 0));
      const nx = vis[vis.indexOf(b) + (ev.key === 'ArrowRight' ? 1 : -1)];
      if (nx) { nx.focus(); if (!nx.classList.contains('pmr-a-moretab')) nx.click(); }
    });
    tabs.set(v.id, b);
    strip.appendChild(b);
  });
  const more = h('button', { type: 'button', class: 'pmr-a-tab pmr-a-moretab pmr-strip', 'aria-haspopup': 'menu', hidden: true },
    h('span.pmr-a-tablabel', { text: 'More' }), h('span.pmr-a-moreattn'), ico('chevD', 'pmr-a-tabchev'));
  setNav(more, 'menu', navIdOf('tabmore', inst.pid), true);
  more.addEventListener('click', ev => {
    ev.preventDefault();
    const rest = views.filter(v => tabs.get(v.id).hidden);
    const menu = {
      id: 'a-more-' + inst.pid, label: 'More views',
      groups: [{ items: rest.map(v => ({ label: v.label, icon: v.icon, meta: isCond(v) ? 'hidden' : (v.attention ? v.attention.text : (v.count != null ? String(v.count) : '')),
        attrs: { 'data-pmr-nav': 'tab', 'data-pmr-nav-id': navIdOf('tabm', inst.pid, v.id), 'data-view': v.id } })) }],
    };
    PMR.menu.toggle(menu, more, { align: 'end', width: 252, onPick: it => onSelect(it.attrs['data-view']) });
  });
  strip.append(more, ink);

  const st = { active: null, x: 0, w: 0, anim: null };
  function fit() {
    const cs = getComputedStyle(strip);
    const avail = strip.clientWidth - (parseFloat(cs.paddingLeft) || 0) - (parseFloat(cs.paddingRight) || 0);
    if (avail <= 0) return;
    const gap = parseFloat(cs.columnGap) || 0;
    tabs.forEach(b => { b.hidden = false; b.style.order = ''; });
    more.hidden = false;
    const ids = views.map(v => v.id);
    const wd = new Map(ids.map(id => [id, tabs.get(id).getBoundingClientRect().width]));
    const moreW = more.getBoundingClientRect().width;
    const sum = list => list.reduce((s, id) => s + wd.get(id), 0) + gap * Math.max(0, list.length - 1);
    let shown = ids.slice();
    let natural = true;
    if (sum(ids) > avail + 0.5) {
      const budget = avail - moreW - gap;
      shown = [];
      for (const id of ids) { if (sum(shown.concat([id])) <= budget + 0.5) shown.push(id); else break; }
      if (!shown.includes(st.active) && st.active) {
        natural = false;
        if (shown.length) shown[shown.length - 1] = st.active; else shown = [st.active];
        while (shown.length > 1 && sum(shown) > budget + 0.5) shown.splice(shown.length - 2, 1);
      }
      if (!shown.length) shown = [st.active || ids[0]];
    }
    const seq = natural ? ids.filter(id => shown.includes(id)) : ids.filter(id => shown.includes(id) && id !== st.active).concat([st.active]);
    tabs.forEach((b, id) => { b.hidden = !shown.includes(id); b.style.order = String(Math.max(0, seq.indexOf(id))); });
    more.hidden = shown.length === ids.length;
    more.style.order = '99';
    const restAttn = views.filter(v => !shown.includes(v.id) && v.attention);
    const slot = more.querySelector('.pmr-a-moreattn');
    slot.textContent = '';
    if (restAttn.length) { slot.appendChild(attnDot(restAttn[0].attention.state)); PMR.hover(more, 'More views', restAttn.map(v => v.label + ': ' + v.attention.text).join(' · ')); }
    else { more.removeAttribute('data-pm-hover-detail'); PMR.hover(more, 'More views', views.filter(v => !shown.includes(v.id)).map(v => v.label).join(', ')); }
    placeInk(false);
  }
  function rect(id) {
    const b = tabs.get(id);
    if (!b || b.hidden) return null;
    const sr = strip.getBoundingClientRect(), br = b.getBoundingClientRect();
    if (!br.width) return null;
    const pad = parseFloat(getComputedStyle(b).paddingLeft) || 0;
    const lab = b.querySelector('.pmr-a-tablabel').getBoundingClientRect();
    return { x: br.left - sr.left + pad, w: lab.width };
  }
  const tf = (x, w) => `translateX(${x.toFixed(2)}px) scaleX(${Math.max(0.01, w / 100).toFixed(4)})`;
  function placeInk(animate) {
    const r = rect(st.active);
    if (!r) { ink.style.opacity = '0'; return; }
    ink.style.opacity = '';
    const from = { x: st.x, w: st.w || r.w };
    st.x = r.x; st.w = r.w;
    if (st.anim) { try { st.anim.cancel(); } catch (e) { /* ignore */ } st.anim = null; }
    ink.style.transform = tf(r.x, r.w);
    if (!animate || reduced() || Math.abs(from.x - r.x) < 1) return;
    const s = INK_SPEC[fam()] || INK_SPEC.basic;
    if (s.steps) { st.anim = animateEl(ink, [{ transform: tf(from.x, from.w) }, { transform: tf(r.x, r.w) }], { duration: s.dur, easing: s.steps }); return; }
    const lo = Math.min(from.x, r.x), hi = Math.max(from.x + from.w, r.x + r.w);
    const span = hi - lo;
    const mid = r.x > from.x ? tf(lo + span * 0.18, span * 0.82) : tf(lo, span * 0.82);
    st.anim = animateEl(ink, [{ transform: tf(from.x, from.w), easing: s.a }, { transform: mid, offset: s.stretch, easing: s.b }, { transform: tf(r.x, r.w) }], { duration: s.dur });
  }
  function setActive(id, animate) {
    st.active = id;
    tabs.forEach((b, vid) => {
      const on = vid === id;
      b.setAttribute('aria-selected', String(on));
      b.classList.toggle('is-active', on);
      b.tabIndex = on ? 0 : -1;
      setNav(b, 'tab', navIdOf('tab', inst.pid, vid), !on);
    });
    if (tabs.get(id) && tabs.get(id).hidden) fit(); else placeInk(animate);
    if (animate && fam() === 'retro' && !reduced()) { strip.classList.add('is-flash'); requestAnimationFrame(() => requestAnimationFrame(() => strip.classList.remove('is-flash'))); }
  }
  return { el: strip, fit, setActive, placeInk, tabs, more };
}

/* ---------- the panel scaffold: head, identity, tabs, per-view toolbar, eager panes, footer ---------------------- */
/* makePanel(panel, view, ctx, cfg) -> inst { show, destroy, select }
   cfg: { identity(inst) -> nodes, headMenuExtra(inst) -> items, pane(inst, v) -> nodes, toolbar(inst, v) -> node|null,
          footer(inst) -> node|null, onShowPane(inst, v) } */
function memoKey(pid) { return pid === 'source' ? 'source:' + PMR.state.get('source.engine', 'git') : pid; }
function makePanel(panel, view, ctx, cfg) {
  const views = PMR.viewsOf(panel);
  const keep = A.keep[panel.id] || {};
  delete A.keep[panel.id];
  const inst = { panel, view, ctx, pid: panel.id, views, open: new Map(keep.open || []), panes: new Map(), tools: new Map(), cleanups: [], menus: panel.menus || {}, scrollMemo: new Map() };
  const memo = A.tabMemo[memoKey(panel.id)];
  inst.active = views.some(v => v.id === keep.tab) ? keep.tab : (views.some(v => v.id === memo) ? memo : views[0].id);
  view.classList.add('pmr-a');
  view.setAttribute('data-pmr-a-panel', panel.id);

  /* head: title, at most two quiet icon buttons, one "more" menu with the rest */
  const titleEl = h('h2.pmr-a-title.pmr-title', { text: panel.title });
  if (panel.hover) PMR.hover(titleEl, panel.hover.label, panel.hover.detail);
  const hacts = h('div.pmr-a-hacts');
  const pa = panel.actions || [];
  pa.slice(0, 2).forEach(a => hacts.appendChild(iconAct(a)));
  const extra = (cfg.headMenuExtra ? cfg.headMenuExtra(inst) : []) || [];
  if (pa.length > 2 || extra.length) {
    const rest = menuItemsOf(pa.slice(2)).concat(extra);
    const mb = h('button', { type: 'button', class: 'pmr-btn pmr-btn-icon pmr-a-iact', 'aria-haspopup': 'menu' }, dots());
    PMR.hover(mb, 'More actions', rest.map(r => r.label).join(', '));
    setNav(mb, 'menu', navIdOf('headmore', panel.id), true);
    mb.addEventListener('click', ev => { ev.preventDefault(); PMR.menu.toggle({ id: 'a-head-' + panel.id, label: panel.title, groups: [{ items: rest }] }, mb, { align: 'end', menus: inst.menus, onPick: it => { if (typeof it.onPick === 'function') it.onPick(it); } }); });
    hacts.appendChild(mb);
  }
  const head = h('header.pmr-a-head', h('div.pmr-a-titlerow', titleEl, hacts), h('div.pmr-a-ident', cfg.identity ? cfg.identity(inst) : null));
  inst.head = head;

  const strip = tabStrip(inst, views, id => select(id));
  inst.strip = strip;
  const tools = h('div.pmr-a-tools');
  const scroll = h('div.pmr-a-scroll');
  const foot = h('div.pmr-a-foot');
  inst.scroll = scroll; inst.foot = foot; inst.toolsEl = tools;
  views.forEach(v => {
    const pane = h('div', { class: 'pmr-a-pane', role: 'tabpanel', 'data-view': v.id, 'aria-label': v.label, hidden: v.id !== inst.active, 'data-canon': v.canon || null });
    PMR.append(pane, [cfg.pane ? cfg.pane(inst, v) : defaultPane(inst, v)]);
    inst.panes.set(v.id, pane);
    scroll.appendChild(pane);
    const tb = cfg.toolbar ? cfg.toolbar(inst, v) : defaultToolbar(inst, v);
    if (tb) { tb.hidden = v.id !== inst.active; inst.tools.set(v.id, tb); tools.appendChild(tb); }
  });
  tools.hidden = !inst.tools.has(inst.active);
  const footNode = cfg.footer ? cfg.footer(inst) : null;
  if (footNode) foot.appendChild(footNode);
  view.append(head, strip.el, tools, scroll, foot);

  function select(id) {
    if (!inst.panes.has(id)) return;
    PMR.menu.closeAll();
    const prev = inst.active;
    if (id === prev) { strip.setActive(id, false); return; }
    const oldTop = scroll.scrollTop;
    inst.scrollMemo.set(prev, oldTop);
    const out = inst.panes.get(prev), inn = inst.panes.get(id);
    inst.active = id;
    A.tabMemo[memoKey(panel.id)] = id;
    const outY = out.offsetTop - oldTop;
    inn.hidden = false;
    inst.tools.forEach((t, vid) => { t.hidden = vid !== id; });
    tools.hidden = !inst.tools.has(id);
    scroll.scrollTop = inst.scrollMemo.get(id) || 0;
    /* the outgoing pane fades where it stood while the incoming rows rise (Retro and NieR cut instead) */
    if (inst.fading) { try { inst.fading.anim.cancel(); } catch (e) { /* ignore */ } inst.fading.done(); }
    const fadeOut = !reduced() && !stepped() ? animateEl(out, [{ opacity: 1 }, { opacity: 0 }], { duration: Math.round(M.spec().fast * 0.7), easing: 'linear', fill: 'forwards' }) : null;
    if (fadeOut) {
      out.classList.add('is-leaving');
      out.style.top = (outY + scroll.scrollTop) + 'px';
      const done = () => { out.classList.remove('is-leaving'); out.style.top = ''; if (inst.active !== out.getAttribute('data-view')) out.hidden = true; try { fadeOut.cancel(); } catch (e) { /* ignore */ } inst.fading = null; };
      inst.fading = { anim: fadeOut, done };
      fadeOut.onfinish = done;
    } else out.hidden = true;
    strip.setActive(id, true);
    fitNames(inn); fitNames(tools);
    if (cfg.onShowPane) cfg.onShowPane(inst, inst.views.find(v => v.id === id));
    cascade((tools.hidden ? [] : [inst.tools.get(id)]).concat(paneRows(inn)), { dy: 6, step: 18, max: 14, delay: stepped() ? 0 : 40 });
  }
  inst.select = select;

  /* refit on width change (resizer, theme fonts), never on scroll */
  let lastW = 0, raf = 0;
  const refit = force => {
    cancelAnimationFrame(raf);
    raf = requestAnimationFrame(() => {
      const w = view.clientWidth;
      if (!w || (!force && Math.abs(w - lastW) < 1)) return;
      lastW = w; resetFontCache(); strip.fit(); fitNames(view);
    });
  };
  const ro = new ResizeObserver(() => refit(false));
  ro.observe(view);
  /* a theme change swaps fonts: refit now, and again once the family's web fonts have loaded */
  let late = 0;
  const mo = new MutationObserver(() => { refit(true); clearTimeout(late); late = setTimeout(() => refit(true), 450); });
  mo.observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme', 'data-o55-nier'] });
  const onFonts = () => refit(true);
  if (document.fonts && document.fonts.addEventListener) document.fonts.addEventListener('loadingdone', onFonts);
  inst.cleanups.push(() => { ro.disconnect(); mo.disconnect(); cancelAnimationFrame(raf); clearTimeout(late); if (document.fonts && document.fonts.removeEventListener) document.fonts.removeEventListener('loadingdone', onFonts); });

  strip.setActive(inst.active, false);
  inst.show = function show() {
    requestAnimationFrame(() => {
      strip.fit(); fitNames(view);
      if (reduced()) return;
      const s = M.spec();
      if (stepped()) animateEl(head, [{ opacity: 0 }, { opacity: 1 }], { duration: 70, easing: 'steps(2, end)', fill: 'backwards' });
      else animateEl(head, [{ opacity: 0, transform: 'translateY(-4px)' }, { opacity: 1, transform: 'none' }], { duration: s.fast, easing: s.ease, fill: 'backwards' });
      cascade([strip.el].concat(tools.hidden ? [] : [inst.tools.get(inst.active)], paneRows(inst.panes.get(inst.active))), { dy: 6, step: 18, max: 14, delay: stepped() ? 0 : 70 });
    });
  };
  inst.destroy = function destroy() { inst.cleanups.forEach(fn => { try { fn(); } catch (e) { /* ignore */ } }); inst.cleanups = []; };
  inst.keepForRerender = function () { A.keep[panel.id] = { tab: inst.active, open: Array.from(inst.open.entries()) }; };
  return inst;
}
function paneRows(pane) {
  if (!pane) return [];
  return Array.from(pane.querySelectorAll('.pmr-a-sechead, .pmr-a-row, .pmr-a-trow, .pmr-a-fitem, .pmr-a-step, .pmr-a-empty, .pmr-a-form'))
    .filter(n => n.offsetParent !== null);
}
function defaultToolbar(inst, v) {
  const list = (v.toolbar || []).filter(a => !a.menu);
  const filt = v.filters ? PMR.menu.trigger(v.filters, { icon: 'filter', cls: 'pmr-a-filter', onPick: it => { if (inst.onFilter) inst.onFilter(v, it); } }) : null;
  if (filt) setNav(filt, 'menu', navIdOf('filter', inst.pid, v.id), true);
  if (!list.length && !filt) return null;
  return h('div.pmr-a-toolbar', list.map(a => act(a, { variant: 'quiet', cls: 'pmr-a-tool', menus: inst.menus })), filt ? h('span.pmr-a-toolsp') : null, filt);
}
function defaultPane(inst, v, o) {
  o = o || {};
  const out = [];
  if (v.conditional && v.conditional.shown === false) {
    const acts = [v.conditional.action].concat(v.empty && v.empty.action && (!v.conditional.action || v.empty.action.arg !== v.conditional.action.arg) ? [v.empty.action] : []).filter(Boolean);
    out.push(h('div.pmr-a-empty', { 'data-kind': (v.empty && v.empty.kind) || 'not_relevant' },
      h('p.pmr-a-empty-t', PMR.glyph('info'), h('span', { text: (v.empty && v.empty.text) || v.summary })),
      h('p.pmr-a-empty-why', { text: v.conditional.why }),
      acts.length ? h('div.pmr-a-acts', acts.map(a => act(a))) : null));
  }
  (v.sections || []).forEach(sec => out.push(section(inst, sec, Object.assign({ viewId: v.id, menus: inst.menus,
    build: s => (o.build && o.build(s, v)) || listOf(inst, s, Object.assign({ menus: inst.menus, navScope: v.id }, o.rowOpts ? o.rowOpts(s, v) : {})) }, o.secOpts ? o.secOpts(sec, v) : {}))));
  if (!out.length && v.empty) out.push(h('div.pmr-a-empty', h('p.pmr-a-empty-t', { text: v.empty.text }), v.empty.action ? act(v.empty.action) : null));
  const notes = (v.notes || []).concat(v.canonNote ? [v.canonNote] : []);
  if (notes.length) out.push(h('div.pmr-a-notes', notes.map(n => h('p', { text: n }))));
  return out;
}
