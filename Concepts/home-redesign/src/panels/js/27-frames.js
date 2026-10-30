/* Shared body frames (DRY): one rendering grammar for every document-like kind (plan, document, artifact, record,
   context, transcript) and every run view, so they read as one system in every look. Replaces the chat's pills with a
   plain meta row, its boxed chips with text, its accent-underlined toggles with text options on a hairline whose chosen
   option is filled on its own box (the chosen fill, 45-frames.css; never an underline).
     PMW.frames.doc({ title, meta: [..] | 'a · b', aside, body: el | [els], actions: [btn specs], footer: el }) -> el
     PMW.frames.run({ title, kind: { icon, word }, status: [..], actions, more, plate, tabs: { items, value, onChange }, main, aside }) -> el
     PMW.frames.meta(items) -> <p>    items: strings, or { text, state: 'ok'|'warn'|'bad', mono }
     PMW.frames.seg(options, value, onChange, { label, cls }) -> el    options: [{ value, label, count }]
     PMW.frames.ink(row) -> { move(from, to), stop() }    the chosen fill's one moving ink for any .pmw-ink-row
     PMW.frames.section(title, meta, body) -> <section>
     PMW.frames.notice(text, { state, icon }) -> <p>
     PMW.frames.tiles([{ label, value, sub, state }]) -> el
     PMW.frames.button({ id, label, icon, primary, danger, pressed, disabled, reason, detail, run, menu }) -> <button>
       (32 px document action; id becomes data-id, pressed becomes aria-pressed)
   An action list (doc and run) takes button specs or ready-made elements; the frame returns the buttons it holds as
   frame.actionEls ({ id: button }, by spec id or an element's data-id) and frame.actionsEl (the row), so a kind can set
   aria-pressed on a toggle without rebuilding the frame.
   Every frame scrolls inside its own .pmw-frame-scroll; sizes key on @container pmw-body. */

var frames = PMW.frames = {};

frames.meta = function (items) {
  var p = h('p', { class: 'pmw-doc-meta' });
  if (typeof items === 'string') items = items.split(' · ');
  (items || []).filter(function (x) { return x != null && x !== ''; }).forEach(function (it, i) {
    if (i) p.appendChild(h('span', { class: 'pmw-doc-sep', 'aria-hidden': 'true', text: '·' }));
    if (typeof it === 'string' || typeof it === 'number') p.appendChild(h('span', { text: String(it) }));
    else p.appendChild(h('span', { class: (it.state ? 'is-' + it.state : '') + (it.mono ? ' is-mono' : ''), text: it.text }));
  });
  return p;
};

/* The chosen fill's one ink (45-frames.css). The chosen option's fill is its own ::after, so at rest it is always
   exactly its box, through a resize, a font load or a look change. A change moves one ink from the box it leaves to the
   box it lands on, in the voice the rail's tab strips use for the same ink (DL-162, F3-621; Concepts/leftrail-redesign
   31-tabs.js): Basic glides, Friendly springs with its one overshoot held inside the row, Glass glides in its own
   longer settle (a plain glide: the neutral frost never stretches; the canon lead's ruling of 2026-10-11); Retro's
   reverse video and NieR's ink cut to the new box, as their panel tabs snap; Reduced Motion changes it at once
   (PMW.motion.animate draws nothing). While the ink travels (data-moving on the row) the boxes' own fills wait,
   so one fill is on screen in every frame; a second change mid-way starts from where the ink is; Animation speed
   scales it. `from` is the option left, or a client rect of it kept across a rebuild; boxes on different lines (a
   wrapped row) or a row out of view change at once. */
var INK_VOICE = { basic: { dur: 220, ease: 'cubic-bezier(.2,.8,.2,1)' }, friendly: { dur: 420, spring: true },
  glass: { dur: 460, ease: 'cubic-bezier(.16,1,.3,1)' } };
/* Friendly's spring as keyframes of progress p (0 the old box, 1 the new): past the target once, back a little, home;
   the overshoot is explicit so it never carries the ink out of the row */
var INK_SPRING = [[0, 0, 'cubic-bezier(.3,.7,.4,1)'], [0.55, 1, 'ease-in-out', 1], [0.8, 1, 'ease-in-out', -0.3], [1, 1]];
frames.ink = function (row) {
  if (row._pmwInk) return row._pmwInk;
  var seq = 0, el = null;
  function inkEl() {
    if (!el) el = h('span', { class: 'pmw-ink', 'aria-hidden': 'true' });
    if (el.parentNode !== row) row.appendChild(el);
    return el;
  }
  function frame(b) { return { transform: 'translateX(' + b.x.toFixed(2) + 'px)', width: b.w.toFixed(2) + 'px' }; }
  /* a box in the ink's own coordinates: the row's padding box, scrolled with the row; y is the box's middle on screen */
  function box(x) {
    var r = x.nodeType === 1 ? x.getBoundingClientRect() : x, l = row.getBoundingClientRect(), k = row.offsetWidth ? l.width / row.offsetWidth : 1;
    return { x: (r.left - l.left) / k - row.clientLeft + row.scrollLeft, w: r.width / k, y: r.top + r.height / 2 };
  }
  function stop() {
    seq += 1;
    if (el) el.getAnimations().forEach(function (a) { a.cancel(); });
    row.removeAttribute('data-moving');
  }
  function move(from, to) {
    var moving = row.hasAttribute('data-moving') && el && el.getAnimations().length > 0;
    var a = moving ? box(el) : from && (from.nodeType !== 1 || from.offsetWidth) ? box(from) : null;
    stop();
    var g = INK_VOICE[PMW.motion.family()];
    if (!a || !g || !to || !to.offsetWidth || !row.isConnected || PMW.motion.reduced()) return;
    var b = box(to), d = b.x - a.x;
    if (Math.abs(b.y - a.y) > 1.5) return;
    if (Math.abs(d) < 0.5 && Math.abs(b.w - a.w) < 0.5) return;
    var kf;
    if (g.spring) {
      // the overshoot: 8 % of the trip, at most the room left beyond the target inside the row
      var room = d >= 0 ? row.scrollWidth - (b.x + b.w) : b.x;
      var over = Math.abs(d) > 0.5 ? Math.max(0, Math.min(Math.abs(d) * 0.08, room)) / Math.abs(d) : 0;
      kf = INK_SPRING.map(function (k) {
        var p = k[1] + (k[3] || 0) * over, f = frame({ x: a.x + d * p, w: a.w + (b.w - a.w) * Math.min(p, 1) });
        f.offset = k[0]; if (k[2]) f.easing = k[2];
        return f;
      });
    } else kf = [frame(a), frame(b)];
    var anim = PMW.motion.animate(inkEl(), kf, { dur: g.dur, easing: g.spring ? 'linear' : g.ease });
    if (!anim) return;
    var mine = seq;
    row.setAttribute('data-moving', '');
    var done = function () { if (mine === seq) row.removeAttribute('data-moving'); };
    anim.finished.then(done, done);
  }
  return (row._pmwInk = { move: move, stop: stop });
};

/* A kind that draws its body again on a change builds a new toggle in the same place: the toggle it replaces hands the
   box it left to the new one (same label and class, built inside the change), so the fill still travels. */
var segHandoff = null;
frames.seg = function (options, value, onChange, o) {
  o = o || {};
  var key = (o.label || 'View') + '|' + (o.cls || '');
  var wrap = h('div', { class: 'pmw-seg pmw-ink-row' + (o.cls ? ' ' + o.cls : ''), role: 'tablist', 'aria-label': o.label || 'View' });
  var ink = frames.ink(wrap);
  function opts() { return Array.prototype.filter.call(wrap.children, function (b) { return b.classList.contains('pmw-seg-opt'); }); }
  function chosen() { return opts().filter(function (b) { return b.getAttribute('aria-selected') === 'true'; })[0] || null; }
  function paint(v) {
    opts().forEach(function (b) {
      var on = b._v === v;
      b.setAttribute('aria-selected', on ? 'true' : 'false');
      b.tabIndex = on ? 0 : -1;
    });
  }
  options.forEach(function (op) {
    var b = h('button', { type: 'button', class: 'pmw-seg-opt pmw-ink-opt', role: 'tab' }, [h('span', { text: op.label })]);
    if (op.count != null) b.appendChild(h('small', { text: String(op.count) }));
    b._v = op.value;
    b.addEventListener('click', function () {
      var prev = chosen();
      paint(op.value);
      var hand = prev && prev !== b && prev.offsetWidth ? { key: key, rect: prev.getBoundingClientRect(), taken: false } : null;
      segHandoff = hand;
      try { if (onChange) onChange(op.value); } finally { segHandoff = null; }
      if (hand && !hand.taken && wrap.isConnected) ink.move(prev, b);
    });
    b.addEventListener('keydown', function (e) {
      var all = opts(), i = all.indexOf(b);
      var go = e.key === 'ArrowRight' ? all[(i + 1) % all.length] : e.key === 'ArrowLeft' ? all[(i - 1 + all.length) % all.length] : null;
      if (go) { e.preventDefault(); go.focus(); go.click(); }
    });
    wrap.appendChild(b);
  });
  paint(value);
  if (segHandoff && segHandoff.key === key && !segHandoff.taken) {
    var hand = segHandoff;
    hand.taken = true;
    requestAnimationFrame(function () { var t = chosen(); if (t && wrap.isConnected) ink.move(hand.rect, t); });
  }
  wrap.setValue = paint;
  return wrap;
};

frames.section = function (title, meta, body) {
  var head = h('header', { class: 'pmw-sec-head' }, [h('h2', { text: title })]);
  if (meta) head.appendChild(typeof meta === 'string' ? h('span', { class: 'pmw-fine', text: meta }) : meta);
  var s = h('section', { class: 'pmw-sec' }, [head]);
  append(s, body);
  return s;
};

frames.notice = function (text, o) {
  o = o || {};
  var p = h('p', { class: 'pmw-notice' + (o.state ? ' is-' + o.state : '') });
  p.appendChild(icon(o.icon || (o.state === 'bad' ? 'problems' : o.state === 'warn' ? 'clock' : 'eye'), { size: 14 }));
  p.appendChild(h('span', { text: text }));
  return p;
};

frames.tiles = function (items) {
  var g = h('div', { class: 'pmw-tiles' });
  (items || []).forEach(function (t) {
    g.appendChild(h('div', { class: 'pmw-tile' + (t.state ? ' is-' + t.state : '') }, [
      h('span', { class: 'pmw-tile-label', text: t.label }),
      h('b', { class: 'pmw-tile-value', text: t.value }),
      t.sub ? h('span', { class: 'pmw-tile-sub', text: t.sub }) : null
    ]));
  });
  return g;
};

/* The system loader (W5, DR-077; window.PM_PIP_LOADER, glyph-system src/logo/pm-loader.js) as one element, drawn by its
   owner, for an indeterminate wait: o = { motion: 'swing' | 'think' | 'hop' (by context, never a setting, L5), px: the
   size the host shows it at }. Null without the owner, so a caller just goes without. The drawing is aria-hidden; the
   host says it waits (aria-busy, or its own words in a role=status). An item's state in a row or a tab stays the
   working status mark (L1). */
PMW.loader = function (o) {
  var LD = window.PM_PIP_LOADER;
  if (!LD) return null;
  var t = doc.createElement('template');
  t.innerHTML = LD.html(o || {});
  return t.content.firstElementChild;
};

/* b.busy (true, or a motion name): the button's own wait, the loader in its icon's place at the gallery's busy-button
   size (16 px) and aria-busy on the button */
frames.button = function (b) {
  var el = h('button', { type: 'button', class: 'pmw-act' + (b.primary ? ' is-primary' : '') + (b.danger ? ' is-danger' : ''), 'data-pmh': 'icon',
    'data-pm-hover-label': b.label, 'data-pm-hover-detail': b.detail || '', 'data-id': b.id != null ? String(b.id) : null });
  if (b.pressed != null) el.setAttribute('aria-pressed', b.pressed ? 'true' : 'false');
  var ld = b.busy ? PMW.loader({ motion: typeof b.busy === 'string' ? b.busy : 'swing', px: 16 }) : null;
  if (ld) { el.setAttribute('aria-busy', 'true'); el.appendChild(ld); }
  else if (b.icon) el.appendChild(icon(b.icon, { size: 14 }));
  el.appendChild(h('span', { text: b.label }));
  if (b.disabled) { el.setAttribute('aria-disabled', 'true'); if (b.reason) el.setAttribute('data-disabled-reason', b.reason); }
  if (b.menu) el.setAttribute('aria-haspopup', 'menu');
  el.addEventListener('click', function (e) {
    if (el.getAttribute('aria-disabled') === 'true') return;
    if (b.menu) { PMW.menu.open(el, menuSpecOf(typeof b.menu === 'function' ? b.menu() : b.menu, null, { id: 'act-menu', width: 260 })); return; }
    if (b.run) b.run(e, el);
  });
  return el;
};

/* a frame's action row from button specs and ready-made elements: { el (null when empty), byId: { id: button } } */
function actionRow(cls, list) {
  var byId = {}, kids = [];
  (list || []).forEach(function (b) {
    if (!b) return;
    var el = b.nodeType === 1 ? b : frames.button(b);
    var id = b.nodeType === 1 ? el.getAttribute('data-id') : (b.id != null ? String(b.id) : null);
    if (id != null && !byId[id]) byId[id] = el;
    kids.push(el);
  });
  return { el: kids.length ? h('div', { class: cls }, kids) : null, byId: byId };
}

frames.doc = function (spec) {
  var scroll = h('div', { class: 'pmw-frame-scroll' });
  var col = h('article', { class: 'pmw-doc' + (spec.cls ? ' ' + spec.cls : '') });
  var head = h('header', { class: 'pmw-doc-head' });
  var titleRow = h('div', { class: 'pmw-doc-titlerow' }, [h('h1', { class: 'pmw-doc-title', text: spec.title || '' })]);
  if (spec.badge) titleRow.appendChild(h('span', { class: 'pmw-doc-badge', text: spec.badge }));
  head.appendChild(titleRow);
  if (spec.meta) head.appendChild(frames.meta(spec.meta));
  var acts = actionRow('pmw-doc-actions', spec.actions);
  if (acts.el) head.appendChild(acts.el);
  col.appendChild(head);
  var body = h('div', { class: 'pmw-doc-body' });
  append(body, spec.body);
  col.appendChild(body);
  scroll.appendChild(col);
  var wrap = h('div', { class: 'pmw-frame' }, [scroll]);
  if (spec.footer) wrap.appendChild(h('footer', { class: 'pmw-doc-footer' }, [spec.footer]));
  wrap._body = body; wrap._head = head; wrap._scroll = scroll;
  wrap.actionEls = acts.byId; wrap.actionsEl = acts.el;
  return wrap;
};

frames.run = function (spec) {
  var scroll = h('div', { class: 'pmw-frame-scroll' });
  var view = h('article', { class: 'pmw-run' + (spec.cls ? ' ' + spec.cls : '') });
  var head = h('header', { class: 'pmw-run-head' });
  var left = h('div', { class: 'pmw-run-headl' }, [h('h1', { class: 'pmw-run-title', text: spec.title || '' })]);
  if (spec.kind) left.appendChild(h('p', { class: 'pmw-run-kind' }, [spec.kind.icon ? kindIcon(spec.kind.icon) : null, h('span', { text: spec.kind.word || '' })]));
  if (spec.status) left.appendChild(frames.meta(spec.status));
  head.appendChild(left);
  var acts = actionRow('pmw-run-acts', spec.actions);
  if (acts.el) head.appendChild(acts.el);
  view.appendChild(head);
  if (spec.plate) view.appendChild(h('figure', { class: 'pmw-run-plate' }, [spec.plate]));
  var main = h('div', { class: 'pmw-run-main' });
  var tabsEl = null;
  if (spec.tabs) {
    tabsEl = frames.seg(spec.tabs.items, spec.tabs.value, function (v) { if (spec.tabs.onChange) spec.tabs.onChange(v, main); }, { cls: 'pmw-run-tabs', label: 'Run sections' });
    view.appendChild(tabsEl);
  }
  append(main, spec.main);
  var grid = h('div', { class: 'pmw-run-grid' }, [main]);
  if (spec.aside) grid.appendChild(h('aside', { class: 'pmw-run-aside' }, Array.isArray(spec.aside) ? spec.aside : [spec.aside]));
  view.appendChild(grid);
  scroll.appendChild(view);
  var wrap = h('div', { class: 'pmw-frame' }, [scroll]);
  wrap._main = main; wrap._tabs = tabsEl; wrap._head = head; wrap._scroll = scroll;
  wrap.actionEls = acts.byId; wrap.actionsEl = acts.el;
  return wrap;
};

/* a code or log block in the code face */
frames.code = function (text, o) {
  o = o || {};
  return h('pre', { class: 'pmw-code' + (o.cls ? ' ' + o.cls : '') }, [h('code', { text: text })]);
};
