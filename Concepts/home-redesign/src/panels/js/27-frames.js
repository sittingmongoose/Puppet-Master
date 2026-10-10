/* Shared body frames (DRY): one rendering grammar for every document-like kind (plan, document, artifact, record,
   context, transcript) and every run view, so they read as one system in every look. Replaces the chat's pills with a
   plain meta row, its boxed chips with text, its accent-underlined toggles with text options on a hairline.
     PMW.frames.doc({ title, meta: [..] | 'a · b', aside, body: el | [els], actions: [btn specs], footer: el }) -> el
     PMW.frames.run({ title, kind: { icon, word }, status: [..], actions, more, plate, tabs: { items, value, onChange }, main, aside }) -> el
     PMW.frames.meta(items) -> <p>    items: strings, or { text, state: 'ok'|'warn'|'bad', mono }
     PMW.frames.seg(options, value, onChange, { label }) -> el    options: [{ value, label, count }]
     PMW.frames.section(title, meta, body) -> <section>
     PMW.frames.notice(text, { state, icon }) -> <p>
     PMW.frames.tiles([{ label, value, sub, state }]) -> el
     PMW.frames.button({ label, icon, primary, run, menu }) -> <button> (32 px document action)
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

frames.seg = function (options, value, onChange, o) {
  o = o || {};
  var wrap = h('div', { class: 'pmw-seg' + (o.cls ? ' ' + o.cls : ''), role: 'tablist', 'aria-label': o.label || 'View' });
  function paint(v) {
    Array.prototype.forEach.call(wrap.children, function (b) {
      var on = b._v === v;
      b.setAttribute('aria-selected', on ? 'true' : 'false');
      b.tabIndex = on ? 0 : -1;
    });
  }
  options.forEach(function (op) {
    var b = h('button', { type: 'button', class: 'pmw-seg-opt', role: 'tab' }, [h('span', { text: op.label })]);
    if (op.count != null) b.appendChild(h('small', { text: String(op.count) }));
    b._v = op.value;
    b.addEventListener('click', function () { paint(op.value); if (onChange) onChange(op.value); });
    b.addEventListener('keydown', function (e) {
      var opts = Array.prototype.slice.call(wrap.children), i = opts.indexOf(b);
      var go = e.key === 'ArrowRight' ? opts[(i + 1) % opts.length] : e.key === 'ArrowLeft' ? opts[(i - 1 + opts.length) % opts.length] : null;
      if (go) { e.preventDefault(); go.focus(); go.click(); }
    });
    wrap.appendChild(b);
  });
  paint(value);
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

frames.button = function (b) {
  var el = h('button', { type: 'button', class: 'pmw-act' + (b.primary ? ' is-primary' : '') + (b.danger ? ' is-danger' : ''), 'data-pmh': 'icon',
    'data-pm-hover-label': b.label, 'data-pm-hover-detail': b.detail || '' });
  if (b.icon) el.appendChild(icon(b.icon, { size: 14 }));
  el.appendChild(h('span', { text: b.label }));
  if (b.disabled) { el.setAttribute('aria-disabled', 'true'); if (b.reason) el.setAttribute('data-disabled-reason', b.reason); }
  if (b.menu) el.setAttribute('aria-haspopup', 'menu');
  el.addEventListener('click', function (e) {
    if (el.getAttribute('aria-disabled') === 'true') return;
    if (b.menu) { PMW.menu.open(el, Array.isArray(b.menu) ? { id: 'act-menu', rows: b.menu, width: 260 } : (typeof b.menu === 'function' ? b.menu() : b.menu)); return; }
    if (b.run) b.run(e, el);
  });
  return el;
};

frames.doc = function (spec) {
  var scroll = h('div', { class: 'pmw-frame-scroll' });
  var col = h('article', { class: 'pmw-doc' + (spec.cls ? ' ' + spec.cls : '') });
  var head = h('header', { class: 'pmw-doc-head' });
  var titleRow = h('div', { class: 'pmw-doc-titlerow' }, [h('h1', { class: 'pmw-doc-title', text: spec.title || '' })]);
  if (spec.badge) titleRow.appendChild(h('span', { class: 'pmw-doc-badge', text: spec.badge }));
  head.appendChild(titleRow);
  if (spec.meta) head.appendChild(frames.meta(spec.meta));
  if (spec.actions && spec.actions.length) head.appendChild(h('div', { class: 'pmw-doc-actions' }, spec.actions.map(frames.button)));
  col.appendChild(head);
  var body = h('div', { class: 'pmw-doc-body' });
  append(body, spec.body);
  col.appendChild(body);
  scroll.appendChild(col);
  var wrap = h('div', { class: 'pmw-frame' }, [scroll]);
  if (spec.footer) wrap.appendChild(h('footer', { class: 'pmw-doc-footer' }, [spec.footer]));
  wrap._body = body; wrap._head = head; wrap._scroll = scroll;
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
  if (spec.actions && spec.actions.length) head.appendChild(h('div', { class: 'pmw-run-acts' }, spec.actions.map(frames.button)));
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
  return wrap;
};

/* a code or log block in the code face */
frames.code = function (text, o) {
  o = o || {};
  return h('pre', { class: 'pmw-code' + (o.cls ? ' ' + o.cls : '') }, [h('code', { text: text })]);
};
