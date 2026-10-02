/* Concept B — Stack ("drill in"). One thing at a time, at full width: every panel is a stack of pages (a summary page,
   a page per area, a page per item). Depth is told by motion: push / pop with parallax and shared-element titles.
   This file: the page-stack engine and the shared builders every panel uses (rows, sections, facts, actions). */

const h = PMR.h;
const M = PMR.motion;
const U = PMR.util;
const B = { stacks: {}, panels: {}, bar: null };

/* ---------- tiny helpers ------------------------------------------------------------------------------------------ */
const asList = v => (Array.isArray(v) ? v : (v == null || v === '' ? [] : [v]));
const plain = v => (v == null ? '' : String(v));
function fam() { return M.nier() ? 'nier' : M.family(); }
function anim(el, frames, o) { return M.animate(el, frames, o); }
function countText(v) { return v == null || v === '' ? '' : String(v); }
function stepped(f) { return f === 'retro' || f === 'nier'; }

/* ---------- action rows (item pages) and quiet text actions --------------------------------------------------------- */
/* full-width action row: icon + label (+ inline reason when disabled) + key hint; 36px */
function actRow(a, menus, opts) {
  opts = opts || {};
  const el = h('button', Object.assign({ type: 'button', class: ['pmr-b-act', 'pmr-cur', a.primary && 'is-primary', a.danger && 'is-danger'] }, PMR.actionAttrs(a)),
    PMR.icon(a.icon || (a.danger ? 'trash' : 'chevR'), 'pmr-b-act-ico'),
    h('span.pmr-b-act-text', h('span.pmr-b-act-label', { text: a.label }), a.disabled ? h('span.pmr-b-act-why', { text: a.disabled }) : null),
    a.key ? h('kbd.pmr-key', { text: a.key }) : null,
    a.menu || opts.menuChev ? PMR.icon('chevD', 'pmr-b-act-chev') : null);
  if (a.disabled) PMR.hover(el, a.label, a.disabled);
  if (a.menu && menus && menus[a.menu]) {
    el.setAttribute('aria-haspopup', 'menu'); el.setAttribute('data-pmr-nav', 'menu');
    el.addEventListener('click', ev => { ev.preventDefault(); PMR.menu.toggle(menus[a.menu], el, { menus }); });
  }
  if (a.local && opts.onLocal) el.addEventListener('click', ev => { if (a.disabled) return; opts.onLocal(a, el, ev); });
  return el;
}
/* primary first, danger last after a separator; reasons stay visible on disabled rows */
function actionList(list, menus, opts) {
  const acts = asList(list).filter(Boolean);
  if (!acts.length) return null;
  const prim = acts.filter(a => a.primary && !a.danger);
  const rest = acts.filter(a => !a.primary && !a.danger);
  const danger = acts.filter(a => a.danger);
  const box = h('div.pmr-b-acts', { role: 'group', 'aria-label': (opts && opts.label) || 'Actions' });
  prim.concat(rest).forEach(a => box.appendChild(actRow(a, menus, opts)));
  if (danger.length) { if (prim.length + rest.length) box.appendChild(h('div.pmr-b-sep', { role: 'separator' })); danger.forEach(a => box.appendChild(actRow(a, menus, opts))); }
  return box;
}
/* quiet text action (section headers, facts, glance block) */
function textAct(a, menus, opts) {
  opts = opts || {};
  const el = h('button', Object.assign({ type: 'button', class: ['pmr-b-tact', a.danger && 'is-danger', a.primary && 'is-primary'] }, PMR.actionAttrs(a)),
    a.icon && opts.icon ? PMR.icon(a.icon) : null, h('span', { text: a.label }));
  if (a.disabled) PMR.hover(el, a.label, a.disabled);
  if (a.menu && menus && menus[a.menu]) {
    el.setAttribute('aria-haspopup', 'menu'); el.setAttribute('data-pmr-nav', 'menu');
    el.addEventListener('click', ev => { ev.preventDefault(); PMR.menu.toggle(menus[a.menu], el, { menus }); });
  }
  if (a.local && opts.onLocal) el.addEventListener('click', ev => { if (a.disabled) return; opts.onLocal(a, el, ev); });
  return el;
}
/* head icon action (the hover tag carries the name) */
function iconAct(a, menus, opts) {
  const el = PMR.button(a, { variant: 'icon', menus, cls: 'pmr-b-iact' });
  if (a.menu) el.setAttribute('data-pmr-nav', 'menu');
  if (a.local && opts && opts.onLocal) el.addEventListener('click', ev => opts.onLocal(a, el, ev));
  return el;
}

/* ---------- facts --------------------------------------------------------------------------------------------------- */
/* label (12px muted) over value (13px), one per line; raw ids go under a "Technical details" disclosure */
function factEl(f) {
  const label = f[0], value = f[1], opt = f[2] || {};
  const v = h('div', { class: ['pmr-b-fact-v', opt.mono && 'is-mono'] });
  if (opt.state) v.appendChild(PMR.glyph(opt.state));
  v.appendChild(h('span', { text: plain(value) }));
  return h('div.pmr-b-fact', { 'data-canon': opt.canon || null }, h('div.pmr-b-fact-k', { text: label }), v);
}
let discSeq = 0;
function disclosure(label, bodyKids, opts) {
  opts = opts || {};
  const id = 'pmr-b-disc-' + (++discSeq);
  const body = h('div.pmr-b-disc-body', { id, hidden: !opts.open }, bodyKids);
  const btn = h('button', { type: 'button', class: ['pmr-b-disc', 'pmr-cur', opts.cls], 'aria-expanded': String(!!opts.open), 'aria-controls': id, 'data-pmr-nav': 'expand', 'data-pmr-nav-id': opts.navId || null },
    PMR.icon('chevR', 'pmr-b-disc-chev'), h('span.pmr-b-disc-label', { text: label }), opts.meta ? h('span.pmr-b-disc-meta', { text: opts.meta }) : null);
  btn.addEventListener('click', () => {
    const open = btn.getAttribute('aria-expanded') !== 'true';
    btn.setAttribute('aria-expanded', String(open));
    M.height(body, open);
  });
  return h('div', { class: ['pmr-b-discwrap', opts.wrapCls] }, btn, body);
}
function factList(facts, opts) {
  opts = opts || {};
  const list = asList(facts);
  if (!list.length) return [];
  const main = list.filter(f => !(f[2] && f[2].group));
  const tech = list.filter(f => f[2] && f[2].group);
  const out = [];
  if (main.length) out.push(h('div.pmr-b-facts', main.map(factEl)));
  if (tech.length) out.push(disclosure(tech[0][2].group, h('div.pmr-b-facts.is-tech', tech.map(factEl)), { navId: 'tech|' + (opts.key || ''), wrapCls: 'pmr-b-tech' }));
  return out;
}
/* items of kind "fact" (name = label, meta = value), with their own inline actions */
function factItems(items, menus) {
  const box = h('div.pmr-b-facts');
  asList(items).forEach(it => {
    const v = h('div', { class: ['pmr-b-fact-v', it.mono && 'is-mono'] });
    if (it.status) v.appendChild(PMR.glyph(it.status.state));
    v.appendChild(h('span', { text: asList(it.meta).join(' · ') || (it.status && it.status.word) || '' }));
    const r = h('div.pmr-b-fact', { 'data-canon': it.canon || null }, h('div.pmr-b-fact-k', { text: it.name }), v);
    if (it.actions && it.actions.length) r.appendChild(h('div.pmr-b-fact-acts', it.actions.map(a => textAct(a, menus, { icon: true }))));
    box.appendChild(r);
  });
  return box;
}

/* ---------- blocked / notes / meters ---------------------------------------------------------------------------- */
function blockedEl(b, menus) {
  if (!b) return null;
  return h('div.pmr-b-blocked', { 'data-code': b.code || null, 'data-canon': b.canon || null },
    h('div.pmr-b-blocked-line', PMR.glyph('blocked'), h('span', { text: b.reason })),
    b.allowed && b.allowed.length ? h('div.pmr-b-blocked-acts', b.allowed.map(a => textAct(a, menus, { icon: true }))) : null);
}
function noteEl(text, cls) { return text ? h('p', { class: ['pmr-b-note', cls], text }) : null; }
function meterEl(m) {
  const fill = h('span.pmr-b-meter-fill', { style: { transform: `scaleX(${U.clamp((m.value || 0) / 100, 0, 1)})` } });
  return h('div.pmr-b-meter', { 'data-state': m.state || null },
    h('div.pmr-b-meter-top', h('span.pmr-b-meter-k', { text: m.label }), h('span.pmr-b-meter-v.pmr-num', { text: m.text })),
    h('div.pmr-b-meter-track', fill));
}
function diffEl(d) { return d ? h('span.pmr-diff', h('span.add', { text: '+' + d.add }), h('span.del', { text: '-' + d.del })) : null; }
function wordEl(status) { return status ? h('span.pmr-b-endword', { 'data-state': status.state, text: status.word }) : null; }

/* ---------- rows ------------------------------------------------------------------------------------------------------ */
/* row({ key, lead, name, nameText, mono, meta, metaEl, extra, end, primary, drill, cls, hover, attrs, selected, dim })
   primary: an Action run by a click on the row body; drill: () => page desc (a chevron button, or the whole row). */
function row(o) {
  const leadEl = o.lead === false ? null : h('span.pmr-b-lead', o.lead || null);
  const nm = h('span', { class: ['pmr-b-name', o.mono && 'is-mono', o.dim && 'is-dim', o.nameCls], text: o.nameText || plain(o.name) });
  const metaNode = o.metaEl || (asList(o.meta).length ? h('span.pmr-b-meta', { text: asList(o.meta).join(' · ') }) : null);
  const lines = h('span.pmr-b-lines', nm, metaNode, o.extra || null);
  const endKids = asList(o.end).filter(Boolean);
  const endEl = endKids.length ? h('span.pmr-b-end', endKids) : null;
  const chev = () => PMR.icon('chevR', 'pmr-b-chev');
  const wrapAttrs = Object.assign({ class: ['pmr-b-row', 'pmr-cur', o.cls, o.selected && 'is-current', o.metaEl || asList(o.meta).length ? 'is-two' : 'is-one'], 'data-b-row': o.key || null }, o.attrs || {});
  let wrap, main = null;
  const drillTo = ev => { ev.preventDefault(); const st = stackOf(wrap); if (st) st.push(o.drill(), { label: nm, row: wrap, keyboard: st.byKey() }); };
  if (o.primary && o.drill) {
    wrap = h('div', wrapAttrs);
    main = h('button', Object.assign({ type: 'button', class: 'pmr-b-row-main' }, PMR.actionAttrs(o.primary)), leadEl, lines, endEl);
    const go = h('button', { type: 'button', class: ['pmr-b-row-go', o.quietGo && 'is-quiet'], 'data-pmr-nav': 'drill', 'data-pmr-nav-id': o.key ? 'drill|' + o.key : null, 'aria-label': 'Details for ' + plain(o.name) }, chev());
    PMR.hover(go, 'Details', plain(o.name) + ': facts and every action');
    go.addEventListener('click', drillTo);
    wrap.append(main, go);
  } else if (o.drill) {
    wrap = h('button', Object.assign(wrapAttrs, { type: 'button', 'data-pmr-nav': 'drill', 'data-pmr-nav-id': o.key ? 'drill|' + o.key : null }));
    wrap.classList.add('is-drill');
    main = h('span.pmr-b-row-main', leadEl, lines, endEl, h('span.pmr-b-row-go', chev()));
    wrap.appendChild(main);
    wrap.addEventListener('click', drillTo);
  } else if (o.primary) {
    wrap = h('div', wrapAttrs);
    main = h('button', Object.assign({ type: 'button', class: 'pmr-b-row-main' }, PMR.actionAttrs(o.primary)), leadEl, lines, endEl);
    wrap.appendChild(main);
  } else {
    wrap = h('div', wrapAttrs);
    wrap.appendChild(h('span.pmr-b-row-main', leadEl, lines, endEl));
  }
  if (o.hover) PMR.hover(wrap.matches('button') ? wrap : main, o.hover.label, o.hover.detail);
  else if (o.nameText && o.nameText !== plain(o.name)) PMR.hover(wrap.matches('button') ? wrap : main, plain(o.name), o.path || '');
  wrap._b = { nameEl: nm };
  return wrap;
}
function stackOf(el) { const r = el && el.closest && el.closest('.pmr-b'); return r ? r._stack : null; }
/* one fact line: glyph + word, then the facts */
function metaWith(status, meta) {
  const parts = asList(meta).filter(Boolean);
  if (!status) return parts.length ? h('span.pmr-b-meta', { text: parts.join(' · ') }) : null;
  return h('span.pmr-b-meta', PMR.statusEl(status), parts.length ? h('span.pmr-b-meta-rest', { text: parts.join(' · ') }) : null);
}

/* ---------- sections --------------------------------------------------------------------------------------------------- */
/* section({ key, label, count, actions, menus, open, collapsible, body: () => nodes, status, note, canon, attrs }) */
function section(o) {
  const head = h('div.pmr-b-sec-head');
  const titleKids = [h('span.pmr-b-sec-title.pmr-head', { text: o.label }), countText(o.count) ? h('span.pmr-b-sec-count.pmr-num', { text: countText(o.count) }) : null,
    o.status ? PMR.statusEl(o.status, { cls: 'pmr-b-sec-status' }) : null].filter(Boolean);
  const body = h('div.pmr-b-sec-body');
  let built = false;
  const build = () => { if (built) return; built = true; asList(o.body ? o.body() : []).forEach(n => n && body.appendChild(n)); if (o.note) body.appendChild(noteEl(o.note)); };
  const wrap = h('section', Object.assign({ class: ['pmr-b-sec', o.cls], 'data-b-sec': o.key || null, 'data-canon': o.canon || null }, o.attrs || {}));
  if (o.collapsible) {
    const open = !!o.open;
    const btn = h('button', { type: 'button', class: 'pmr-b-sec-toggle pmr-cur', 'aria-expanded': String(open), 'data-pmr-nav': 'expand', 'data-pmr-nav-id': o.key ? 'sec|' + o.key : null },
      PMR.icon('chevR', 'pmr-b-disc-chev'), titleKids);
    head.appendChild(btn);
    body.hidden = !open;
    btn.addEventListener('click', () => {
      const now = btn.getAttribute('aria-expanded') !== 'true';
      btn.setAttribute('aria-expanded', String(now));
      if (now) build();
      M.height(body, now);
    });
  } else {
    head.append(...titleKids);
  }
  const acts = asList(o.actions);
  if (acts.length === 1 && !o.collapsible) head.appendChild(h('span.pmr-b-sec-acts', acts.map(a => textAct(a, o.menus, { onLocal: o.onLocal }))));
  else if (acts.length) body.appendChild(h('div.pmr-b-btnrow.is-top', acts.map(a => textAct(a, o.menus, { onLocal: o.onLocal, icon: true }))));
  if (!o.collapsible || o.open) build();
  wrap.append(head, body);
  return wrap;
}

/* ---------- destination rows (summary pages) ------------------------------------------------------------------------ */
function destRow(o) {
  const att = o.attention;
  const sum = att
    ? h('span.pmr-b-dest-sum.is-att', { 'data-state': att.state }, PMR.glyph(att.state), h('span', { text: att.text }))
    : h('span.pmr-b-dest-sum', { text: o.summary || '' });
  const el = h('button', { type: 'button', class: ['pmr-b-dest', 'pmr-cur', o.compact && 'is-compact', o.quiet && 'is-quiet'], 'data-pmr-nav': 'drill', 'data-pmr-nav-id': 'dest|' + o.key, 'data-b-row': o.key, 'data-canon': o.canon || null },
    h('span.pmr-b-tile', PMR.icon(o.icon || 'layers')),
    h('span.pmr-b-dest-main', h('span.pmr-b-dest-label', { text: o.label }), sum),
    h('span.pmr-b-dest-end', o.count != null && o.count !== '' ? h('span.pmr-b-dest-count.pmr-num', { text: String(o.count) }) : null, PMR.icon('chevR', 'pmr-b-chev')));
  const label = el.querySelector('.pmr-b-dest-label');
  el.addEventListener('click', ev => { ev.preventDefault(); const st = stackOf(el); if (st) st.push(o.drill(), { label, row: el, keyboard: st.byKey() }); });
  el._b = { nameEl: label };
  return el;
}

/* ---------- generic item page ------------------------------------------------------------------------------------------ */
/* everything an item carries, at full width: blocked reason, note, facts, ports, metrics, hunks, children, actions */
function itemBody(it, o) {
  o = o || {};
  const menus = o.menus;
  const out = [];
  if (it.blocked) out.push(blockedEl(it.blocked, menus));
  if (it.note) out.push(h('div.pmr-b-callout', { 'data-state': (it.status && it.status.state) || 'info' }, PMR.glyph((it.status && it.status.state) || 'info'), h('span', { text: it.note })));
  if (it.preview) out.push(h('div.pmr-b-sub', { text: 'Preview' }), h('pre.pmr-b-preview', { text: it.preview }));
  if (it.ports && it.ports.length) {
    out.push(h('div.pmr-b-sub', { text: it.ports.length === 1 ? 'Port' : 'Ports' }));
    it.ports.forEach(p => out.push(h('div.pmr-b-port', PMR.icon('link', 'pmr-b-port-ico'), h('span.pmr-b-port-v.pmr-num', { text: p.label }),
      h('button', Object.assign({ type: 'button', class: 'pmr-b-tact' }, PMR.actionAttrs({ cmd: p.cmd, arg: p.arg })), PMR.icon('external'), h('span', { text: 'Open' })))));
  }
  if (it.metrics && it.metrics.length) out.push(h('div.pmr-b-sub', { text: 'Resources' }), h('div.pmr-b-meters', it.metrics.map(meterEl)));
  const facts = [];
  const given = asList(it.facts);
  if (it.path && o.showPath !== false && !given.some(f => f[1] === it.path)) facts.push(['Path', it.path, { mono: true }]);
  if (it.owner) facts.push(['Owner', it.owner]);
  if (it.time) facts.push(['Last activity', it.time]);
  if (asList(it.meta).length && o.metaFacts !== false) facts.push([o.metaLabel || 'Summary', asList(it.meta).join(' · ')]);
  if (it.diff) facts.push(['Lines', '+' + it.diff.add + ' added, -' + it.diff.del + ' removed']);
  const fl = factList(facts.concat(given), { key: it.id });
  if (fl.length) out.push(h('div.pmr-b-sub', { text: 'Facts' }), ...fl);
  if (it.hunks && it.hunks.length) {
    out.push(h('div.pmr-b-sub', { text: it.hunks.length === 1 ? 'Hunk' : 'Hunks' }));
    it.hunks.forEach(hk => out.push(h('div.pmr-b-hunk', h('code.pmr-b-hunk-h', { text: hk.header }), h('span.pmr-b-hunk-acts', asList(hk.actions).map(a => textAct(a, menus, { icon: true }))))));
  }
  if (it.children && it.children.length && o.children !== false) {
    out.push(h('div.pmr-b-sub', { text: o.childLabel || 'Contents' }));
    it.children.forEach(c => out.push(row({ key: c.id, lead: c.status ? PMR.glyph(c.status.state) : PMR.icon(c.icon || (c.kind === 'remote' ? 'globe' : c.kind === 'branch' ? 'branch' : 'file')), name: c.name, mono: c.mono, meta: c.meta, end: [diffEl(c.diff), wordEl(c.status)], cls: 'is-child' })));
  }
  asList(o.extra).forEach(n => n && out.push(n));
  const acts = actionList(it.actions, menus, { onLocal: o.onLocal });
  if (acts) out.push(h('div.pmr-b-sub', { text: 'Actions' }), acts);
  asList(o.after).forEach(n => n && out.push(n));
  return out;
}
/* the status line under an item's title: letter, glyph + word, diff */
function subLine(it, extra) {
  const kids = [];
  if (it.letter) kids.push(h('span.pmr-b-letterword', PMR.letterEl(it.letter, it.status && it.status.state), it.status ? h('span', { 'data-state': it.status.state, text: it.status.word }) : null));
  else if (it.status) kids.push(PMR.statusEl(it.status));
  if (it.diff) kids.push(diffEl(it.diff));
  asList(extra).forEach(x => x && kids.push(x));
  return kids.length ? h('div.pmr-b-subline', kids) : null;
}

/* ================================================================ the stack =================================== */
class Stack {
  constructor(view, panel, ctx, mod) {
    this.view = view; this.panel = panel; this.ctx = ctx; this.mod = mod;
    this.menus = panel.menus || {};
    this.root = h('div.pmr-b', { 'data-panel': panel.id });
    this.root._stack = this;
    this.head = h('header.pmr-b-head');
    this.stage = h('div.pmr-b-stage');
    this.foot = h('div.pmr-b-foot');
    this.layer = h('div.pmr-b-layer', { 'aria-hidden': 'true' });
    this.root.append(this.head, this.stage, this.foot, this.layer);
    view.appendChild(this.root);
    this.pages = [];
    this.running = null;
    this.offs = [];
    this.onKeyBound = ev => this.onKey(ev);
    this.root.addEventListener('keydown', this.onKeyBound);
    if (mod.init) mod.init(this);
    const first = this.build(mod.root(this));
    this.pages.push(first);
    this.stage.appendChild(first.el);
    this.renderHead();
    if (mod.foot) { const f = mod.foot(this); if (f) this.foot.appendChild(f); }
    this.foot.hidden = !this.foot.childNodes.length;
    B.stacks[panel.id] = this;
  }
  get depth() { return this.pages.length; }
  top() { return this.pages[this.pages.length - 1]; }

  /* ---- pages ---- */
  build(desc) {
    const el = h('div.pmr-b-page', { 'data-b-key': desc.key, 'data-kind': desc.kind || 'area', role: 'region', 'aria-label': desc.title });
    const page = { desc, el, titleEl: null, scroll: 0, origin: null };
    if (desc.kind !== 'root') {
      const sib = desc.siblings ? desc.siblings() : null;
      let t;
      if (sib && sib.length > 1) {
        t = h('button', { type: 'button', class: 'pmr-b-title pmr-cur', 'aria-haspopup': 'menu', 'data-pmr-nav': 'menu', 'data-pmr-nav-id': 'title|' + desc.key },
          h('span', { class: ['pmr-b-title-text', desc.mono && 'is-mono'], text: desc.title }), PMR.icon('chevD', 'pmr-b-title-chev'));
        PMR.hover(t, 'Jump to', 'Every ' + (desc.siblingNoun || 'page') + ' at this level, with its count, without going back');
        t.addEventListener('click', ev => { ev.preventDefault(); this.openSiblings(page, t); });
      } else {
        t = h('h2', { class: 'pmr-b-title is-static' }, h('span', { class: ['pmr-b-title-text', desc.mono && 'is-mono'], text: desc.title }));
      }
      page.titleEl = t.querySelector('.pmr-b-title-text');
      el.appendChild(h('div.pmr-b-titleblock', t, desc.sub ? desc.sub() : null));
    }
    asList(desc.build(page, this)).forEach(n => n && el.appendChild(n));
    el.addEventListener('scroll', () => { if (this.top() === page) this.head.classList.toggle('is-scrolled', el.scrollTop > 2); }, { passive: true });
    return page;
  }
  openSiblings(page, anchor) {
    const sibs = page.desc.siblings() || [];
    const cur = sibs.findIndex(x => x.key === page.desc.key);
    const menu = {
      id: 'b-sib-' + page.desc.key, label: 'Jump to', value: page.desc.key,
      groups: [{ label: page.desc.siblingGroup || null, items: sibs.map(s => ({ value: s.key, label: s.title, meta: s.count != null && s.count !== '' ? String(s.count) : (s.meta || null), icon: s.icon || null, _s: s })) }],
    };
    PMR.menu.toggle(menu, anchor, { width: 272, onPick: it => {
      if (it.value === page.desc.key || !it._s) return;
      const i = sibs.findIndex(x => x.key === it.value);
      setTimeout(() => this.jump(it._s.open(), i > cur ? 1 : -1), 0);
    } });
  }
  /* rebuild the summary page in place (engine switch); keeps the stack at the root */
  refreshRoot() {
    const old = this.pages[0];
    const fresh = this.build(this.mod.root(this));
    old.el.replaceWith(fresh.el);
    fresh.el.hidden = this.depth > 1;
    this.pages[0] = fresh;
    if (this.depth === 1) this.renderHead();
    return fresh;
  }

  /* ---- head ---- */
  renderHead() {
    const d = this.depth, top = this.top(), desc = top.desc;
    this.head.textContent = '';
    this.backLabel = null;
    this.root.setAttribute('data-depth', String(d));
    this.head.classList.toggle('is-scrolled', top.el.scrollTop > 2);
    const nav = h('div.pmr-b-nav');
    if (d === 1) {
      const title = h('h2.pmr-b-ptitle.pmr-title', { text: this.panel.title });
      if (this.panel.hover) PMR.hover(title, this.panel.hover.label, this.panel.hover.detail);
      top.titleEl = title;
      nav.appendChild(h('div.pmr-b-navl', title));
    } else {
      const parent = this.pages[d - 2];
      const back = h('button', { type: 'button', class: 'pmr-b-back pmr-cur', 'data-pmr-nav': 'back', 'data-pmr-nav-id': 'back|' + desc.key, 'aria-label': 'Back to ' + parent.desc.title },
        PMR.icon('chevL', 'pmr-b-back-ico'), h('span', { class: ['pmr-b-back-label', parent.desc.mono && 'is-mono'], text: parent.desc.title }));
      PMR.hover(back, 'Back to ' + parent.desc.title, 'Left arrow, Backspace or Alt+Left');
      back.addEventListener('click', ev => { ev.preventDefault(); this.pop(1); });
      nav.appendChild(h('div.pmr-b-navl', back));
      this.backLabel = back.querySelector('.pmr-b-back-label');
    }
    const acts = asList(desc.actions ? desc.actions(this) : []).filter(Boolean);
    if (acts.length) nav.appendChild(h('div.pmr-b-navr', acts));
    this.head.appendChild(nav);
    /* the thin crumb line, only deeper than two levels: the ancestors above the parent (after the back button in the
       DOM, shown above it) */
    if (d >= 3) {
      const trail = h('div.pmr-b-crumbline');
      this.pages.slice(0, d - 2).forEach((p, i) => {
        if (i) trail.appendChild(PMR.icon('chevR', 'pmr-b-crumbsep'));
        const seg = h('button', { type: 'button', class: ['pmr-b-crumbseg', p.desc.mono && 'is-mono'], 'data-pmr-nav': 'back', 'data-pmr-nav-id': 'crumb|' + desc.key + '|' + i, text: p.desc.title });
        PMR.hover(seg, 'Back to ' + p.desc.title);
        seg.addEventListener('click', ev => { ev.preventDefault(); this.pop(d - 1 - i); });
        trail.appendChild(seg);
      });
      trail.appendChild(PMR.icon('chevR', 'pmr-b-crumbsep'));
      this.head.appendChild(trail);
    }
    if (desc.headExtra) { const x = desc.headExtra(this); if (x) this.head.appendChild(x); }
  }
  snapHead() {
    const r = this.head.getBoundingClientRect(), rr = this.root.getBoundingClientRect();
    const snap = this.head.cloneNode(true);
    snap.classList.add('pmr-b-headsnap');
    snap.querySelectorAll('[id]').forEach(n => n.removeAttribute('id'));
    snap.querySelectorAll('[data-pmr-nav]').forEach(n => n.removeAttribute('data-pmr-nav'));
    snap.querySelectorAll('[data-demo-action]').forEach(n => n.removeAttribute('data-demo-action'));
    snap.setAttribute('aria-hidden', 'true');
    snap.inert = true;
    snap.style.cssText = `position:absolute;left:${r.left - rr.left}px;top:${r.top - rr.top}px;width:${r.width}px;height:${r.height}px;margin:0;pointer-events:none;z-index:3;`;
    return snap;
  }

  /* ---- navigation ---- */
  push(desc, origin) {
    if (!desc) return;
    this.settle();
    const from = this.top();
    from.scroll = from.el.scrollTop;
    const oldTitle = from.titleEl;
    const snap = this.snapHead();
    const page = this.build(desc);
    page.origin = origin || null;
    this.stage.appendChild(page.el);
    this.pages.push(page);
    this.renderHead();
    this.transition('push', from, page, snap, { src: origin && origin.label, dst: page.titleEl, src2: oldTitle, dst2: this.backLabel });
    this.changed();
    this.focusAfter(page, origin);
  }
  pop(n) {
    n = Math.max(1, n || 1);
    if (this.depth <= 1) return false;
    n = Math.min(n, this.depth - 1);
    this.settle();
    const from = this.top();
    const removed = this.pages.splice(this.depth - n, n);
    const to = this.top();
    const origin = removed[0].origin;
    const oldBack = this.backLabel;
    const snap = this.snapHead();
    to.el.hidden = false;
    to.el.scrollTop = to.scroll;
    this.renderHead();
    const rowLabel = origin && origin.row && origin.row.isConnected ? ((origin.row._b && origin.row._b.nameEl) || origin.label) : null;
    this.transition('pop', from, to, snap, { src: from.titleEl, dst: rowLabel, src2: oldBack, dst2: to.titleEl }, () => removed.forEach(p => p.el.remove()));
    if (origin && origin.row && origin.row.isConnected) this.returnTo(origin.row);
    this.changed();
    return true;
  }
  popToRoot() { return this.pop(this.depth - 1); }
  jump(desc, dir) {
    this.settle();
    const from = this.top();
    const snap = this.snapHead();
    const page = this.build(desc);
    page.origin = from.origin;
    this.stage.appendChild(page.el);
    this.pages[this.pages.length - 1] = page;
    this.renderHead();
    this.transition(dir < 0 ? 'left' : 'right', from, page, snap, null, null);
    this.changed();
    this.focusAfter(page, null);
  }
  changed() { if (B.bar && B.bar.update) B.bar.update(this.panel.id); }
  focusAfter(page, origin) {
    if (!(origin && origin.keyboard)) { const ae = document.activeElement; if (ae && this.root.contains(ae) && !ae.isConnected) this.root.focus(); return; }
    const t = page.el.querySelector('.pmr-b-title:not(.is-static)') || page.el.querySelector('button');
    if (t) t.focus({ preventScroll: true });
  }
  returnTo(rowEl) {
    try { rowEl.scrollIntoView({ block: 'nearest' }); } catch (e) { /* ignore */ }
    const f = rowEl.matches('button') ? rowEl : rowEl.querySelector('.pmr-b-row-go, .pmr-b-row-main');
    if (f && this.keyNav) f.focus({ preventScroll: true });
    if (M.reduced()) return;
    rowEl.classList.remove('is-return'); void rowEl.offsetWidth; rowEl.classList.add('is-return');
    clearTimeout(rowEl._bRet);
    rowEl._bRet = setTimeout(() => rowEl.classList.remove('is-return'), 1200);
  }

  /* ---- motion ---- */
  settle() {
    const r = this.running;
    if (!r) return;
    this.running = null;
    r.anims.forEach(a => { try { a.finish(); } catch (e) { /* ignore */ } });
    r.done();
  }
  transition(kind, from, to, snap, fly, after) {
    const fwd = kind === 'push' || kind === 'right';
    let ended = false;
    const end = () => {
      if (ended) return; ended = true;
      if (kind === 'push') { from.el.hidden = true; from.el.getAnimations().forEach(a => a.cancel()); }
      else if (kind !== 'pop') from.el.remove();
      if (snap.parentNode) snap.remove();
      this.layer.textContent = '';
      if (fly) [fly.src, fly.dst, fly.src2, fly.dst2].forEach(e => { if (e) e.style.visibility = ''; });
      if (after) after();
    };
    if (M.reduced()) { end(); return; }
    const f = fam();
    const s = M.spec();
    const anims = [];
    const keep = a => { if (a) anims.push(a); return a; };
    this.root.appendChild(snap);
    /* shared-element titles: the tapped row's label flies into the title; the old title flies into the back label
       (sources the head re-render detached are read from the head snapshot) */
    const resolve = el => (!el ? null : el.isConnected ? el : Array.from(snap.querySelectorAll('.pmr-b-ptitle, .pmr-b-back-label')).find(x => x.textContent === el.textContent) || null);
    const flights = fly && (kind === 'push' || kind === 'pop') ? [this.prepFly(resolve(fly.src), fly.dst, f), this.prepFly(resolve(fly.src2), fly.dst2, f)] : [];
    const dur = f === 'retro' ? 160 : f === 'nier' ? 320 : s.med;
    const D = 28 * (fwd ? 1 : -1);
    /* pages: shared axis; the old page drifts 30% of the distance and fades, the new one slides in */
    if (f === 'nier') {
      keep(anim(from.el, [{ opacity: 1 }, { opacity: 0 }], { dur: 180, ease: 'steps(3, end)', fill: 'forwards' }));
      keep(anim(to.el, [{ opacity: 0, transform: `translateX(${D * 0.4}px)` }, { opacity: 1, transform: 'none' }], { dur: 180, delay: 120, ease: 'steps(3, end)' }));
      this.slices(fwd, anims);
    } else if (f === 'retro') {
      keep(anim(from.el, [{ opacity: 1 }, { opacity: 0 }], { dur: 80, ease: 'steps(1, end)', fill: 'forwards' }));
      keep(anim(to.el, [{ opacity: 0.5, transform: `translateX(${D}px)` }, { opacity: 1, transform: 'none' }], { dur, ease: 'steps(2, start)' }));
    } else {
      const outFrames = f === 'glass'
        ? [{ opacity: 1, transform: 'none' }, { opacity: 0, transform: `translateX(${-D * 0.3}px) scale(.985)` }]
        : [{ opacity: 1, transform: 'none' }, { opacity: 0, transform: `translateX(${-D * 0.3}px)` }];
      keep(anim(from.el, outFrames, { dur: Math.round(dur * 0.62), ease: 'ease', fill: 'forwards' }));
      const spring = f === 'friendly' && fwd;
      keep(anim(to.el, [{ opacity: 0, transform: `translateX(${D}px)` }, { opacity: 1, transform: 'none' }], { dur: spring ? s.slow : dur, ease: spring ? 'spring' : 'ease', delay: Math.round(dur * 0.12) }));
    }
    /* head: the old head fades out, the new one slides in a little */
    keep(anim(snap, [{ opacity: 1, transform: 'none' }, { opacity: 0, transform: `translateX(${-D * 0.25}px)` }], { dur: Math.round(dur * 0.55), ease: stepped(f) ? 'steps(2, end)' : 'ease', fill: 'forwards' }));
    Array.from(this.head.children).forEach(c => keep(anim(c, [{ opacity: 0, transform: `translateX(${D * 0.35}px)` }, { opacity: 1, transform: 'none' }], { dur, ease: stepped(f) ? 'steps(3, end)' : 'ease', delay: Math.round(dur * 0.15) })));
    flights.forEach(go => go && go(dur, anims));
    const longest = Math.max(dur, s.slow) + 120;
    const timer = setTimeout(() => { if (this.running && this.running.timer === timer) { this.running = null; end(); } }, longest);
    this.running = { anims, timer, done: () => { clearTimeout(timer); end(); } };
  }
  /* measure first (before any page or head animation moves things), then fly: a clone of the source text travels to
     the destination's place and size, and hands off to the real element */
  prepFly(src, dst, f) {
    if (!src || !dst || !src.isConnected || !dst.isConnected) return null;
    const rr = this.root.getBoundingClientRect();
    const a = src.getBoundingClientRect(), b = dst.getBoundingClientRect();
    if (!a.width || !b.width || a.bottom < rr.top || a.top > rr.bottom || b.bottom < rr.top || b.top > rr.bottom) return null;
    const cs = getComputedStyle(src), ds = getComputedStyle(dst);
    const k = (parseFloat(ds.fontSize) || 13) / (parseFloat(cs.fontSize) || 13);
    const lineH = parseFloat(ds.lineHeight) || b.height;
    const clone = h('span.pmr-b-flyer', { text: src.textContent });
    const w = Math.min(Math.max(a.width, b.width / k), rr.right - a.left);
    clone.style.cssText = `left:${a.left - rr.left}px;top:${a.top - rr.top}px;width:${w}px;height:${a.height}px;`
      + `font-family:${cs.fontFamily};font-size:${cs.fontSize};font-weight:${cs.fontWeight};line-height:${a.height}px;letter-spacing:${cs.letterSpacing};text-transform:${cs.textTransform};color:${cs.color};`;
    const dx = b.left - a.left;
    const dy = (b.top + Math.min(lineH, b.height) / 2) - (a.top + (a.height * k) / 2);
    this.layer.appendChild(clone);
    dst.style.visibility = 'hidden';
    src.style.visibility = 'hidden';
    const ease = f === 'retro' ? 'steps(3, end)' : f === 'nier' ? 'steps(4, end)' : (f === 'friendly' ? 'spring' : 'ease');
    return (dur, anims) => {
      const a1 = anim(clone, [{ transform: 'translate(0px, 0px) scale(1)' }, { transform: `translate(${dx}px, ${dy}px) scale(${k})` }], { dur, ease, fill: 'forwards' });
      const done = () => { dst.style.visibility = ''; src.style.visibility = ''; clone.remove(); };
      if (a1) { anims.push(a1); a1.onfinish = done; } else done();
    };
  }
  /* NieR: a horizontal slice wipe with the square cursor riding its leading edge */
  slices(fwd, anims) {
    const w = this.stage.getBoundingClientRect().width;
    const top = this.stage.offsetTop;
    const hgt = Math.min(this.stage.clientHeight, 640);
    const n = 6, band = hgt / n;
    for (let i = 0; i < n; i++) {
      const sl = h('span.pmr-b-slice', { style: `top:${Math.round(top + i * band + band * 0.34)}px;height:${Math.max(3, Math.round(band * 0.3))}px;` });
      this.layer.appendChild(sl);
      const a = anim(sl, [{ transform: `translateX(${fwd ? -w : w}px)` }, { transform: `translateX(${fwd ? w : -w}px)` }], { dur: 300, delay: i * 16, ease: 'steps(8, end)', fill: 'both' });
      if (a) anims.push(a);
    }
    const sq = h('span.pmr-b-square', { style: `top:${top + 8}px;` });
    this.layer.appendChild(sq);
    const a = anim(sq, [{ transform: `translateX(${fwd ? -10 : w + 2}px)` }, { transform: `translateX(${fwd ? w + 2 : -10}px)` }], { dur: 300, ease: 'steps(8, end)', fill: 'forwards' });
    if (a) anims.push(a);
  }

  /* ---- show / keyboard / destroy ---- */
  show() {
    const page = this.top();
    const nodes = page.el.querySelectorAll(':scope > .pmr-b-titleblock, :scope > .pmr-b-block, :scope > .pmr-b-dests > *, :scope > .pmr-b-sec, :scope > .pmr-b-tree > *');
    M.stagger(nodes, { max: 14, dy: 6, step: stepped(fam()) ? 0 : 18 });
    /* the "Needs you" group slides open the first time the panel shows its attention */
    if (!this.revealed && this.depth === 1) {
      this.revealed = true;
      const g = page.el.querySelector('.pmr-b-group.is-needs');
      if (g && !M.reduced()) { g.style.height = '0px'; g.style.overflow = 'hidden'; M.height(g, true, { dur: 'slow' }); }
    }
    if (this.mod.onShow) this.mod.onShow(this);
  }
  byKey() { return !!this.keyTs && performance.now() - this.keyTs < 450; }
  onKey(ev) {
    if (ev.key === 'Enter' || ev.key === ' ' || ev.key === 'ArrowRight') this.keyTs = performance.now();
    if (ev.defaultPrevented) return;
    const t = ev.target;
    const typing = t && (t.tagName === 'INPUT' || t.tagName === 'TEXTAREA' || t.isContentEditable);
    const k = ev.key;
    if (typing && k !== 'Escape') return;
    if (typing && k === 'Escape' && t.value) return;
    if (k === 'ArrowLeft' || k === 'Backspace' || k === 'Escape') {
      if (k === 'ArrowLeft' && !ev.altKey && t.closest && t.closest('[aria-expanded="true"].pmr-b-folder')) return;
      if (this.depth > 1) { ev.preventDefault(); ev.stopPropagation(); this.keyNav = true; this.pop(1); this.keyNav = false; return; }
      if (k === 'Escape') { const ae = document.activeElement; if (ae && this.root.contains(ae)) ae.blur(); }
      return;
    }
    if (k === 'ArrowRight' && t.closest) {
      const r = t.closest('.pmr-b-row, .pmr-b-dest');
      const go = r && (r.matches('[data-pmr-nav="drill"]') ? r : r.querySelector('[data-pmr-nav="drill"]'));
      if (go) { ev.preventDefault(); go.click(); }
      return;
    }
    if (k === 'ArrowDown' || k === 'ArrowUp') {
      const sel = '.pmr-b-dest, button.pmr-b-row-main, .pmr-b-row.is-drill, .pmr-b-sec-toggle, .pmr-b-act, button.pmr-b-title, .pmr-b-disc';
      const list = Array.from(this.top().el.querySelectorAll(sel)).filter(e => e.offsetParent !== null);
      if (!list.length) return;
      const cur = t.closest && t.closest(sel);
      const i = list.indexOf(cur);
      ev.preventDefault();
      const n = i < 0 ? list[0] : list[U.clamp(i + (k === 'ArrowDown' ? 1 : -1), 0, list.length - 1)];
      if (n) n.focus();
    }
  }
  focusTop() {
    const t = this.top();
    const ret = t.el.querySelector('.is-return');
    const f = ret ? (ret.matches('button') ? ret : ret.querySelector('button')) : t.el.querySelector('button.pmr-b-title, .pmr-b-dest, button');
    if (f) f.focus({ preventScroll: true });
  }
  destroy() {
    this.settle();
    this.root.removeEventListener('keydown', this.onKeyBound);
    this.offs.forEach(fn => { try { fn(); } catch (e) { /* ignore */ } });
    if (this.mod.destroy) this.mod.destroy(this);
    if (B.stacks[this.panel.id] === this) delete B.stacks[this.panel.id];
    this.root.remove();
    this.changed();
  }
}

/* ---------- siblings for title menus ------------------------------------------------------------------------------- */
function viewSiblings(st, views, makeArea) {
  return () => views.map(v => ({ key: st.panel.id + ':area:' + v.id, title: v.label, count: v.count != null ? v.count : '', icon: v.icon, open: () => makeArea(v) }));
}
function itemSiblings(list, makeItem) {
  return () => list.map(it => ({ key: 'item:' + it.id, title: it.name, meta: it.status ? it.status.word : null, open: () => makeItem(it) }));
}
