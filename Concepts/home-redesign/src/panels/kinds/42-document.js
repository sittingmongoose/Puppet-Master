/* The Document kind (D9: "Document (rules, memory, revert, debug investigation, lens source, wonderer)").
   Ids: teach:<thread>, memory:<thread>, revert:<turn>, debug:<investigation>, lens-source:<thread>:<message>,
   lens-effective:<thread>, wonderer:<run>, wonder-source:<artifact>, doc:<path>. Content is the 5.6 Pro chat's demo
   (teach-protocol.js, memory-protocol.js, revert-protocol.js, debug-protocol.js, lens.js, lens-wonderer-batch13.js;
   digest 05 section 9). Run-style documents use PMW.frames.run (kind mark, title, status, actions, main, aside),
   page-style ones PMW.frames.doc. The header row carries the kind word, one status fact and the tab-level actions;
   the document's own actions stay in the body. Inline confirms stay inline (never a modal). The Debug phase marks are
   SVG, never a character. File references follow D7 (click previews, double click keeps, Alt+click a new panel).
   When the chat port hands a body renderer to PM_HOME.openEditor(id, { render }), that renderer draws the body. */

var D = document;
var DBL_MS = 240;

function h(tag, attrs, kids) {
  var el = D.createElement(tag);
  if (attrs) {
    for (var k in attrs) {
      if (!Object.prototype.hasOwnProperty.call(attrs, k)) continue;
      var v = attrs[k];
      if (v == null || v === false) continue;
      if (k === 'class') el.className = v;
      else if (k === 'text') el.textContent = v;
      else if (k.slice(0, 2) === 'on' && typeof v === 'function') el.addEventListener(k.slice(2), v);
      else el.setAttribute(k, v === true ? '' : String(v));
    }
  }
  add(el, kids);
  return el;
}
function add(el, kids) {
  if (kids == null || kids === false) return el;
  if (Array.isArray(kids)) { for (var i = 0; i < kids.length; i++) add(el, kids[i]); return el; }
  el.appendChild(typeof kids === 'string' || typeof kids === 'number' ? D.createTextNode(String(kids)) : kids);
  return el;
}
var SVGNS = 'http://www.w3.org/2000/svg';
function sv(tag, attrs, kids) {
  var el = D.createElementNS(SVGNS, tag);
  for (var k in (attrs || {})) if (attrs[k] != null) el.setAttribute(k, String(attrs[k]));
  (kids || []).forEach(function (c) { if (c) el.appendChild(c); });
  return el;
}
function glyph(name, size) {
  var s = size || 16, kids;
  if (name === 'check') kids = [sv('path', { d: 'M3.6 8.4l2.9 2.9 5.9-6.6' })];
  else if (name === 'checkCircle') kids = [sv('circle', { cx: 8, cy: 8, r: 6.25 }), sv('path', { d: 'M5.2 8.3l1.9 1.9 3.8-4.2' })];
  else if (name === 'slashCircle') kids = [sv('circle', { cx: 8, cy: 8, r: 6.25 }), sv('path', { d: 'M3.6 12.4l8.8-8.8' })];
  else if (name === 'ring') kids = [sv('circle', { cx: 8, cy: 8, r: 6.25, 'stroke-dasharray': '2.6 2.4' })];
  else if (name === 'cross') kids = [sv('circle', { cx: 8, cy: 8, r: 6.25 }), sv('path', { d: 'M5.8 5.8l4.4 4.4M10.2 5.8l-4.4 4.4' })];
  else if (name === 'fileEdit') kids = [sv('path', { d: 'M4 2h5.5L12.5 5v3.5M9.5 2v3h3M4 2v12h4' }), sv('path', { d: 'M9 14l.4-1.8 3.4-3.4 1.4 1.4-3.4 3.4z' })];
  else if (name === 'filePlus') kids = [sv('path', { d: 'M4 2h5.5L12.5 5v9H4zM9.5 2v3h3M8.2 7.5v4.4M6 9.7h4.4' })];
  else if (name === 'trash') kids = [sv('path', { d: 'M3 4.5h10M6.5 4.5V3h3v1.5M4.5 4.5l.7 9h5.6l.7-9M7 7v4.5M9 7v4.5' })];
  else if (name === 'spark') kids = [sv('path', { d: 'M8 2v3M8 11v3M2 8h3M11 8h3M4 4l2 2M10 10l2 2M12 4l-2 2M6 10l-2 2' })];
  else kids = [sv('circle', { cx: 8, cy: 8, r: 6 })];
  return sv('svg', { viewBox: '0 0 16 16', width: s, height: s, class: 'pmw-docu-glyph', 'aria-hidden': 'true', focusable: 'false' }, kids);
}
function base(path) { return String(path || '').split('/').pop(); }
function reduced() { try { return PMW.reduced(); } catch (_) { return false; } }
function saveSoon() { try { if (PMW.persist && PMW.persist.saveSoon) PMW.persist.saveSoon(); } catch (_) {} }
function plural(n, one, many) { return n + ' ' + (n === 1 ? one : (many || one + 's')); }
function clock() { var d = new Date(), hh = d.getHours(), mm = d.getMinutes(); return (hh % 12 || 12) + ':' + (mm < 10 ? '0' : '') + mm + (hh < 12 ? ' AM' : ' PM'); }
function copyText(text, done) {
  function fallback() {
    var ta = h('textarea', { class: 'pmw-docu-clip', 'aria-hidden': 'true' });
    ta.value = text;
    (PMW.overlay ? PMW.overlay() : D.body).appendChild(ta);
    ta.select();
    try { D.execCommand('copy'); } catch (_) {}
    ta.remove();
    PMW.toast(done);
  }
  try {
    if (navigator.clipboard && navigator.clipboard.writeText) { navigator.clipboard.writeText(text).then(function () { PMW.toast(done); }, fallback); return; }
  } catch (_) {}
  fallback();
}
function download(name, text, type) {
  try {
    var a = D.createElement('a');
    var url = URL.createObjectURL(new Blob([text], { type: type || 'application/json' }));
    a.href = url; a.download = name; a.click();
    setTimeout(function () { URL.revokeObjectURL(url); }, 2000);
  } catch (_) {}
}
/* a 32 px text action for document rows (quieter than PMW.frames.button) */
function tbtn(label, run, o) {
  o = o || {};
  var b = h('button', { type: 'button', class: 'pmw-docu-tbtn' + (o.danger ? ' is-danger' : '') + (o.cls ? ' ' + o.cls : ''), 'data-k': o.key || null,
    'data-pm-hover-label': o.hover || label, 'data-pm-hover-detail': o.detail || null, 'data-pmh': 'icon', 'aria-pressed': o.pressed == null ? null : String(!!o.pressed) }, [label]);
  if (o.disabled) { b.setAttribute('aria-disabled', 'true'); if (o.reason) b.setAttribute('data-disabled-reason', o.reason); }
  b.addEventListener('click', function (e) { if (b.getAttribute('aria-disabled') === 'true') return; run(e, b); });
  return b;
}
function act(spec, key) {
  var b = PMW.frames.button(spec);
  if (key) b.setAttribute('data-k', key);
  if (spec.pressed != null) b.setAttribute('aria-pressed', String(!!spec.pressed));
  return b;
}
/* D7 file references (the same rules as the file tree) */
function fileRef(api, ref, o) {
  o = o || {};
  var text = ref.path + (ref.line ? ':' + ref.line : '');
  var b = h('button', { type: 'button', class: 'pmw-docu-file' + (o.cls ? ' ' + o.cls : ''), 'data-k': 'file:' + text + (o.key || ''),
    'data-pm-hover-label': 'Open ' + base(ref.path), 'data-pm-hover-detail': 'Click to preview, double-click to keep, Alt+click for a new panel', 'data-pmh': 'icon' },
  [o.noIcon ? null : PMW.icon('file', { size: 13 }), h('span', { text: o.label || text })]);
  var timer = 0;
  function go(e, mode) {
    var spec = { kind: 'editor', path: ref.path, mode: mode };
    if (ref.line) spec.line = ref.line;
    if (e.altKey) spec.where = 'panel';
    if (e.ctrlKey || e.metaKey) spec.background = true;
    api.open(spec);
  }
  b.addEventListener('click', function (e) {
    if (e.detail > 1) return;
    if (e.detail === 0) { go(e, 'preview'); return; }
    var snap = { altKey: e.altKey, ctrlKey: e.ctrlKey, metaKey: e.metaKey };
    clearTimeout(timer);
    timer = setTimeout(function () { go(snap, 'preview'); }, DBL_MS);
  });
  b.addEventListener('dblclick', function (e) { clearTimeout(timer); go(e, 'keep'); });
  return b;
}
/* a disclosure whose open state survives a repaint and a reload */
function disclosure(ctx, key, title, body) {
  var open = !!(ctx.view.open && ctx.view.open[key]);
  var d = h('details', { class: 'pmw-docu-disc', open: open || null }, [h('summary', { class: 'pmw-docu-sum', 'data-k': 'disc:' + key }, [h('span', { text: title })])]);
  add(d, h('div', { class: 'pmw-docu-discbody' }, body));
  d.addEventListener('toggle', function () { ctx.view.open = ctx.view.open || {}; ctx.view.open[key] = d.open; });
  return d;
}
function runFrame(ctx, spec) {
  /* the kind word lives in the header row, so the body starts at the title */
  var f = PMW.frames.run({ title: spec.title, status: spec.status, main: spec.main, aside: spec.aside, tabs: spec.tabs, cls: 'pmw-docu-run' + (spec.cls ? ' ' + spec.cls : '') });
  if (spec.actions && spec.actions.length) f._head.appendChild(h('div', { class: 'pmw-run-acts pmw-docu-acts' }, spec.actions));
  return f;
}
function docFrame(spec) {
  return PMW.frames.doc({ title: spec.title, meta: spec.meta, body: spec.body, footer: spec.footer, cls: 'pmw-docu-doc' + (spec.cls ? ' ' + spec.cls : '') });
}
function fine(text) { return h('p', { class: 'pmw-docu-fine', text: text }); }
function confirmRow(text, yes, no) {
  return h('div', { class: 'pmw-docu-confirm', role: 'group', 'aria-label': text }, [h('p', { text: text }), h('div', { class: 'pmw-docu-row' }, [yes, no])]);
}

var THREADS = { query: 'Query performance', plain: 'Plain chat', debug: 'Debug example', 'plan-deep': 'Deep Plan', crew: 'Crew and shared work' };
function threadTitle(id) { return THREADS[id] || 'This thread'; }

/* ================================================================== Teach: Your rules (teach:<thread>) */
var SEED_RULE = 'Always run the query-perf benchmark suite before closing a performance Plan revision, and record the p95 delta in the Plan evidence section.';
var TEACH = {};
function teachFor(tid, saved) {
  if (!TEACH[tid]) {
    TEACH[tid] = saved && saved.rules ? saved : { seq: 1, rules: [{ id: 'r1', scope: 'This project', locked: true, on: true,
      versions: [{ v: 1, text: SEED_RULE, at: 'Aug 24, 9:12' }], from: 'You saved it in the Query performance thread after the benchmark review, Aug 24 at 9:12.' }] };
  }
  return TEACH[tid];
}
function ruleText(r) { return r.versions[r.versions.length - 1].text; }
var SCOPES = ['Every project', 'This project', 'This thread'];
var SUGGESTIONS = ['Always use pnpm, not npm', 'Keep answers under 200 words', 'Write tests before changing a public function'];

var teachDoc = {
  kindWord: 'Teach', icon: 'keep',
  label: function () { return 'Your rules'; },
  title: function (ctx) { return 'Your rules \u00b7 ' + threadTitle(ctx.arg); },
  init: function (ctx, st) { ctx.data = teachFor(ctx.arg, st.data); },
  save: function (ctx) { return ctx.data; },
  status: function (ctx) {
    var on = ctx.data.rules.filter(function (r) { return r.on; }).length, vs = 0;
    ctx.data.rules.forEach(function (r) { vs += r.versions.length; });
    return [on + ' in use', plural(vs, 'version')];
  },
  facts: function (ctx) { return [{ id: 'status', text: teachDoc.status(ctx)[0], dim: true }]; },
  actions: function (ctx) {
    return [{ id: 'notes', label: 'Notes it took', icon: 'history', detail: 'What memory kept from this thread', run: function () { ctx.api.open({ id: 'memory:' + ctx.arg, kind: 'document', label: 'Gist Review' }); } }];
  },
  render: function (ctx) {
    var v = ctx.view, data = ctx.data, api = ctx.api;
    var main = [];
    if (v.preview) {
      var inUse = data.rules.filter(function (r) { return r.on; });
      main.push(h('div', { class: 'pmw-docu-box', role: 'status' }, [
        h('p', { class: 'pmw-docu-boxhead', text: 'Your next message will include ' + plural(inUse.length, 'rule') + ' and no notes.' }),
        inUse.length ? h('ol', { class: 'pmw-docu-plainlist' }, inUse.map(function (r) { return h('li', { text: ruleText(r) }); })) : null
      ]));
    }
    if (v.composing) main.push(composer(ctx));
    data.rules.forEach(function (r) { main.push(ruleRow(ctx, r)); });
    main.push(fine('Teach isn\u2019t the Teacher Persona. Saving a rule asks no AI anything.'));
    return runFrame(ctx, {
      title: 'Your rules', kind: { icon: 'keep', word: 'Teach' }, status: teachDoc.status(ctx),
      actions: [
        act({ label: 'Teach a rule', icon: 'plus', primary: !v.composing, run: function () { v.composing = !v.composing; v.draft = v.draft || ''; ctx.paint(); focusSoon(ctx, 'compose-text'); } }, 'teach'),
        act({ label: 'See what your next message will include', icon: 'eye', pressed: !!v.preview, run: function () { v.preview = !v.preview; ctx.paint(); } }, 'preview'),
        act({ label: 'Export', icon: 'document', run: function () { download('rules.json', JSON.stringify(data.rules.map(function (r) { return { text: ruleText(r), scope: r.scope, locked: r.locked, on: r.on, versions: r.versions }; }), null, 2)); PMW.toast('Saved your rules as a file'); } }, 'export')
      ],
      main: main
    });
  }
};
function focusSoon(ctx, key) { setTimeout(function () { var el = ctx.host.querySelector('[data-k="' + key + '"]'); if (el) try { el.focus(); } catch (_) {} }, 0); }
function composer(ctx) {
  var v = ctx.view, data = ctx.data;
  var ta = h('textarea', { class: 'pmw-docu-input', rows: '3', 'data-k': 'compose-text', 'aria-label': 'The rule', placeholder: 'Say it the way you would tell a colleague.' });
  ta.value = v.draft || '';
  ta.addEventListener('input', function () { v.draft = ta.value; });
  var scope = PMW.frames.seg(SCOPES.map(function (s) { return { value: s, label: s }; }), v.scope || 'This project', function (s) { v.scope = s; }, { label: 'Where it applies', cls: 'pmw-docu-seg' });
  var sugg = h('p', { class: 'pmw-docu-sugg' }, [h('span', { text: 'Ideas: ' })].concat(SUGGESTIONS.map(function (s, i) {
    return tbtn(s, function () { v.draft = s; ta.value = s; ta.focus(); }, { key: 'sugg:' + i, cls: 'is-inline' });
  })));
  var err = v.composeError ? h('p', { class: 'pmw-docu-err', role: 'alert', text: v.composeError }) : null;
  return h('section', { class: 'pmw-docu-compose', 'aria-label': 'Teach a rule' }, [
    h('label', { class: 'pmw-docu-label', text: 'Teach a rule' }), ta, h('p', { class: 'pmw-docu-label', text: 'Where it applies' }), scope, sugg, err,
    h('div', { class: 'pmw-docu-row' }, [
      act({ label: 'Save rule', primary: true, run: function () {
        var text = (v.draft || '').trim();
        if (!text) { v.composeError = 'Write the rule first.'; ctx.paint(); focusSoon(ctx, 'compose-text'); return; }
        data.seq += 1;
        data.rules.unshift({ id: 'r' + data.seq, scope: v.scope || 'This project', locked: false, on: true, versions: [{ v: 1, text: text, at: 'today, ' + clock() }], from: 'You taught it here today at ' + clock() + '.' });
        v.composing = false; v.draft = ''; v.composeError = null;
        ctx.paint(); ctx.api.announce('Rule saved'); saveSoon();
      } }, 'compose-save'),
      act({ label: 'Cancel', run: function () { v.composing = false; v.composeError = null; ctx.paint(); } }, 'compose-cancel')
    ])
  ]);
}
function ruleRow(ctx, r) {
  var v = ctx.view, api = ctx.api;
  var st = v.rule && v.rule[r.id] || {};
  function set(k, val) { v.rule = v.rule || {}; v.rule[r.id] = Object.assign({}, v.rule[r.id] || {}, (function () { var o = {}; o[k] = val; return o; })()); ctx.paint(); }
  var last = r.versions[r.versions.length - 1];
  var sec = h('section', { class: 'pmw-docu-rule' + (r.on ? '' : ' is-off') });
  var mark = r.locked ? PMW.icon('lock', { size: 16 }) : glyph(r.on ? 'checkCircle' : 'slashCircle');
  sec.appendChild(h('span', { class: 'pmw-docu-rule-mark' + (r.on ? '' : ' is-off'), 'aria-hidden': 'true' }, [mark]));
  var body = h('div', { class: 'pmw-docu-rule-body' });
  if (st.editing) {
    var ta = h('textarea', { class: 'pmw-docu-input', rows: '3', 'data-k': 'edit:' + r.id, 'aria-label': 'Change the wording' });
    ta.value = st.draft != null ? st.draft : ruleText(r);
    ta.addEventListener('input', function () { v.rule[r.id].draft = ta.value; });
    body.appendChild(ta);
    body.appendChild(h('div', { class: 'pmw-docu-row' }, [
      act({ label: 'Save as version ' + (r.versions.length + 1), primary: true, run: function () {
        var t = (ta.value || '').trim();
        if (!t || t === ruleText(r)) { set('editing', false); return; }
        r.versions.push({ v: r.versions.length + 1, text: t, at: 'today, ' + clock() });
        v.rule[r.id] = {};
        ctx.paint(); api.announce('Saved version ' + r.versions.length); saveSoon();
      } }, 'edit-save:' + r.id),
      act({ label: 'Cancel', run: function () { v.rule[r.id] = {}; ctx.paint(); } }, 'edit-cancel:' + r.id)
    ]));
  } else {
    body.appendChild(h('p', { class: 'pmw-docu-rule-text', text: ruleText(r) }));
  }
  body.appendChild(PMW.frames.meta(['Rule', r.scope, 'version ' + last.v, 'saved ' + last.at, r.locked ? 'locked' : null, r.on ? null : { text: 'turned off', state: 'warn' }]));
  if (st.confirmOff) {
    body.appendChild(confirmRow('Stop using this rule? It stays in history, and older versions don\u2019t come back.',
      act({ label: 'Turn off', danger: true, run: function () { r.on = false; v.rule[r.id] = {}; ctx.paint(); api.announce('Rule turned off'); saveSoon(); } }, 'off-yes:' + r.id),
      act({ label: 'Keep it', run: function () { set('confirmOff', false); } }, 'off-no:' + r.id)));
  } else if (!st.editing) {
    body.appendChild(h('div', { class: 'pmw-docu-row is-quiet' }, [
      tbtn('Edit', function () { set('editing', true); focusSoon(ctx, 'edit:' + r.id); }, { key: 'edit-btn:' + r.id, detail: 'Change the wording; the old one stays in history' }),
      tbtn(r.locked ? 'Unlock' : 'Lock', function () { r.locked = !r.locked; ctx.paint(); api.announce(r.locked ? 'Rule locked' : 'Rule unlocked'); saveSoon(); }, { key: 'lock:' + r.id, detail: r.locked ? 'Let suggestions change it' : 'Keep suggestions from changing it' }),
      r.on ? tbtn('Turn off', function () { set('confirmOff', true); }, { key: 'off:' + r.id, detail: 'Stop using it' })
        : tbtn('Turn on', function () { r.on = true; ctx.paint(); api.announce('Rule turned on'); saveSoon(); }, { key: 'on:' + r.id }),
      tbtn('Where it came from', function () { set('from', !st.from); }, { key: 'from:' + r.id, pressed: !!st.from })
    ]));
    body.appendChild(fine('Edit: change the wording; the old one stays in history \u00b7 Unlock: let suggestions change it \u00b7 Turn off: stop using it'));
  }
  if (st.from) body.appendChild(h('p', { class: 'pmw-docu-p', text: r.from }));
  var prev = r.versions.length > 1 ? r.versions[r.versions.length - 2] : null;
  body.appendChild(disclosure(ctx, 'ver:' + r.id, 'Version details', [h('dl', { class: 'pmw-docu-dl' }, [
    h('dt', { text: 'Saved' }), h('dd', { text: last.at }),
    h('dt', { text: 'Replaces' }), h('dd', { text: prev ? 'Version ' + prev.v + ': \u201c' + prev.text + '\u201d' : 'Nothing: this is the first version' }),
    h('dt', { text: 'Your next message' }), h('dd', { text: r.on ? 'Includes it' : 'Leaves it out' }),
    h('dt', { text: 'Its check' }), h('dd', { text: 'Saved by you. Nothing changes it unless you do' + (r.locked ? '; suggestions cannot touch it while it is locked.' : '.') })
  ])]));
  sec.appendChild(body);
  return sec;
}

/* ================================================================== Memory: Notes it took (memory:<thread>) */
var MEMORY = {};
function memoryFor(tid, saved) {
  if (!MEMORY[tid]) {
    MEMORY[tid] = saved && saved.notes ? saved : { notes: [{ id: 'n1', title: 'Index rewrite landed, proof pending', state: 'unverified', pinned: false,
      text: 'The query-performance index rewrite landed; the benchmark proof is still pending.', at: '7:44 AM',
      why: 'Nothing proves this yet. It was saved from a reply, not from a passing test.', story: ['Saved after a reply \u00b7 7:44 AM'] }] };
  }
  return MEMORY[tid];
}
var NOTE_WORD = { unverified: 'Unverified', checking: 'Checking', verified: 'Verified' };
var memoryDoc = {
  kindWord: 'Memory', icon: 'history',
  label: function () { return 'Gist Review'; },
  title: function (ctx) { return 'Notes it took \u00b7 ' + threadTitle(ctx.arg); },
  init: function (ctx, st) { ctx.data = memoryFor(ctx.arg, st.data); ctx.teach = teachFor(ctx.arg); },
  save: function (ctx) { return ctx.data; },
  facts: function (ctx) { var n = ctx.data.notes; return [{ id: 'status', text: plural(n.length, 'note') + ' \u00b7 ' + n.filter(function (x) { return x.state === 'verified'; }).length + ' verified', dim: true }]; },
  actions: function (ctx) {
    return [{ id: 'rules', label: 'Your rules', icon: 'keep', detail: 'The rules every message brings', run: function () { ctx.api.open({ id: 'teach:' + ctx.arg, kind: 'document', label: 'Your rules' }); } }];
  },
  render: function (ctx) {
    var v = ctx.view, data = ctx.data, api = ctx.api;
    var notes = data.notes, verified = notes.filter(function (n) { return n.state === 'verified'; });
    var rulesOn = ctx.teach.rules.filter(function (r) { return r.on; });
    var filter = v.filter || 'all';
    var shown = notes.filter(function (n) { return filter === 'all' || (filter === 'verified' ? n.state === 'verified' : n.state !== 'verified'); });
    if (!v.note || !notes.some(function (n) { return n.id === v.note; })) v.note = shown[0] ? shown[0].id : null;
    var main = [];
    if (v.preview) {
      main.push(h('div', { class: 'pmw-docu-box', role: 'status' }, [
        h('p', { class: 'pmw-docu-boxhead' }, ['Your next message will bring ', h('b', { text: verified.length ? plural(verified.length, 'note') : 'no notes' }), ' and ', h('b', { text: plural(rulesOn.length, 'rule') }), '.']),
        rulesOn[0] ? h('p', { class: 'pmw-docu-ruleline' }, [PMW.icon('lock', { size: 13 }), h('span', { text: ruleText(rulesOn[0]).slice(0, 64) + '\u2026' }), h('span', { class: 'pmw-docu-dim', text: 'Rule \u00b7 ' + (rulesOn[0].locked ? 'locked' : 'unlocked') })]) : null,
        fine('Space for notes: ' + (verified.length ? 38 : 0) + ' of 350 tokens')
      ]));
    }
    var bar = h('div', { class: 'pmw-docu-bar' }, [
      PMW.frames.seg([{ value: 'all', label: 'All', count: notes.length }, { value: 'verified', label: 'Verified', count: verified.length }, { value: 'unverified', label: 'Unverified', count: notes.length - verified.length }],
        filter, function (f) { v.filter = f; v.pane = 'list'; ctx.paint(); }, { label: 'Which notes', cls: 'pmw-docu-seg' }),
      fine('Unverified: not proven yet. Kept for you to review; not used.')
    ]);
    main.push(bar);
    var list = h('div', { class: 'pmw-docu-mem-list', role: 'list', 'aria-label': 'Notes' });
    shown.forEach(function (n) {
      var row = h('button', { type: 'button', role: 'listitem', class: 'pmw-docu-note pmw-cur' + (n.id === v.note ? ' pmw-chosen is-chosen' : ''), 'data-k': 'note:' + n.id, 'aria-current': n.id === v.note ? 'true' : null }, [
        h('span', { class: 'pmw-docu-note-mark is-' + n.state, 'aria-hidden': 'true' }, [glyph(n.state === 'verified' ? 'checkCircle' : 'ring')]),
        h('span', { class: 'pmw-docu-note-copy' }, [h('b', { text: n.title }), h('span', { text: NOTE_WORD[n.state] + ' \u00b7 ' + (n.state === 'verified' ? 'Proven by a check' : 'Nothing proves this yet') + (n.pinned ? ' \u00b7 pinned' : '') })]),
        h('span', { class: 'pmw-docu-note-at', text: n.at })
      ]);
      row.addEventListener('click', function () { v.note = n.id; v.pane = 'detail'; ctx.paint(); focusSoon(ctx, 'detail-back'); });
      list.appendChild(row);
    });
    if (!shown.length) list.appendChild(h('p', { class: 'pmw-docu-empty', text: notes.length ? 'No notes match this view.' : 'No notes yet. Notes appear when the assistant saves something it learned.' }));
    var note = notes.filter(function (n) { return n.id === v.note; })[0];
    var detail = h('div', { class: 'pmw-docu-mem-detail' });
    detail.appendChild(tbtn('Back to the notes', function () { v.pane = 'list'; ctx.paint(); focusSoon(ctx, 'note:' + (note && note.id)); }, { key: 'detail-back', cls: 'pmw-docu-back' }));
    if (note) {
      var st = v.noteState || {};
      detail.appendChild(PMW.frames.meta([{ text: NOTE_WORD[note.state], state: note.state === 'verified' ? 'ok' : note.state === 'checking' ? null : 'warn' },
        note.state === 'verified' ? 'Proven. Used in your next message.' : note.state === 'checking' ? 'Re-testing whether it is still true' : 'Not proven yet. Kept for you to review; not used.']));
      detail.appendChild(h('p', { class: 'pmw-docu-note-text', text: note.text }));
      detail.appendChild(disclosure(ctx, 'why:' + note.id, 'Why it believes this', [h('p', { class: 'pmw-docu-p', text: note.why })]));
      detail.appendChild(disclosure(ctx, 'story:' + note.id, 'Its story', [h('ol', { class: 'pmw-docu-plainlist' }, note.story.map(function (s) { return h('li', { text: s }); }))]));
      if (st.confirmDiscard === note.id) {
        detail.appendChild(confirmRow('Forget this note? It leaves memory and does not come back.',
          act({ label: 'Discard', danger: true, run: function () { data.notes = notes.filter(function (x) { return x.id !== note.id; }); v.noteState = {}; v.pane = 'list'; ctx.paint(); api.announce('Note discarded'); saveSoon(); } }, 'discard-yes'),
          act({ label: 'Keep it', run: function () { v.noteState = {}; ctx.paint(); } }, 'discard-no')));
      } else {
        detail.appendChild(h('div', { class: 'pmw-docu-row' }, [
          act({ label: note.state === 'checking' ? 'Checking\u2026' : note.state === 'verified' ? 'Verify again' : 'Verify', primary: note.state === 'unverified', disabled: note.state === 'checking', run: function () { verify(ctx, note); } }, 'verify'),
          act({ label: note.pinned ? 'Unpin' : 'Pin', pressed: !!note.pinned, run: function () { note.pinned = !note.pinned; ctx.paint(); api.announce(note.pinned ? 'Pinned: never cleaned up' : 'Unpinned'); saveSoon(); } }, 'pin'),
          act({ label: 'Discard', run: function () { v.noteState = { confirmDiscard: note.id }; ctx.paint(); focusSoon(ctx, 'discard-no'); } }, 'discard')
        ]));
        detail.appendChild(fine('Verify: re-test whether this is still true \u00b7 Pin: never clean this up \u00b7 Discard: forget it'));
      }
    } else detail.appendChild(h('p', { class: 'pmw-docu-empty', text: 'Pick a note to see why it was kept.' }));
    main.push(h('div', { class: 'pmw-docu-mem', 'data-pane': v.pane === 'detail' && note ? 'detail' : 'list' }, [list, detail]));
    var status = [plural(notes.length, 'note'), verified.length + ' verified', 'your next message brings ' + (verified.length ? plural(verified.length, 'note') : '0 notes') + ' and ' + plural(rulesOn.length, 'rule')];
    return runFrame(ctx, {
      title: 'Notes it took', kind: { icon: 'history', word: 'Memory' }, status: status,
      actions: [
        act({ label: 'See what your next message will include', icon: 'eye', pressed: !!v.preview, run: function () { v.preview = !v.preview; ctx.paint(); } }, 'preview'),
        act({ label: 'Your rules', icon: 'keep', run: function () { api.open({ id: 'teach:' + ctx.arg, kind: 'document', label: 'Your rules' }); } }, 'rules'),
        act({ label: 'Export memory', icon: 'document', run: function () { download('memory.json', JSON.stringify(data.notes, null, 2)); PMW.toast('Saved the notes as a file'); } }, 'export')
      ],
      main: main
    });
  }
};
function verify(ctx, note) {
  note.state = 'checking';
  ctx.paint();
  ctx.api.announce('Checking the note');
  ctx.later(function () {
    note.state = 'verified';
    note.why = 'The Query Benchmark Dashboard, version 6, shows p95 at 71 ms after the index landed, measured over the corrected fixture.';
    note.story = note.story.concat(['Verified against the benchmark \u00b7 ' + clock()]);
    ctx.paint();
    ctx.api.announce('Verified: the benchmark proves it');
    saveSoon();
  }, reduced() ? 300 : 1200);
}

/* ================================================================== Revert: files (revert:<turn>) */
var REVERT_FILES = [
  { path: 'src/checkout.js', kind: 'edited', before: '// Display currency: USD\nexport const buttonLabel = "Pay now";', after: '// Display currency: USD\nimport { buttonLabel } from "./checkout-label.js";\nexport { buttonLabel };' },
  { path: 'src/checkout-label.js', kind: 'made', before: null, after: 'export const buttonLabel = "Continue";' },
  { path: 'src/legacy-label.js', kind: 'deleted', before: 'export const legacyLabel = "Pay now";', after: null }
];
var DID = { edited: 'Edited', made: 'Made', deleted: 'Deleted' };
var DID_GLYPH = { edited: 'fileEdit', made: 'filePlus', deleted: 'trash' };
var REVERT = {};
function revertFor(turn, saved) {
  if (!REVERT[turn]) REVERT[turn] = saved && saved.state ? saved : { state: 'ready', at: null };
  return REVERT[turn];
}
/* a small line diff (longest common subsequence; the files here are a few lines long) */
function lineDiff(a, b) {
  var A = a == null ? [] : a.split('\n'), B = b == null ? [] : b.split('\n');
  var n = A.length, m = B.length, t = [], i, j;
  for (i = 0; i <= n; i++) { t.push([]); for (j = 0; j <= m; j++) t[i].push(0); }
  for (i = n - 1; i >= 0; i--) for (j = m - 1; j >= 0; j--) t[i][j] = A[i] === B[j] ? t[i + 1][j + 1] + 1 : Math.max(t[i + 1][j], t[i][j + 1]);
  var ops = [], o = 1, nn = 1;
  i = 0; j = 0;
  while (i < n || j < m) {
    if (i < n && j < m && A[i] === B[j]) { ops.push({ k: ' ', o: o++, n: nn++, text: A[i] }); i++; j++; }
    else if (j < m && (i >= n || t[i][j + 1] >= t[i + 1][j])) { ops.push({ k: '+', o: null, n: nn++, text: B[j] }); j++; }
    else { ops.push({ k: '-', o: o++, n: null, text: A[i] }); i++; }
  }
  return ops;
}
function counts(ops) { var a = 0, d = 0; ops.forEach(function (x) { if (x.k === '+') a++; else if (x.k === '-') d++; }); return { add: a, del: d }; }
function diffView(ops, label) {
  var rows = ops.map(function (x) {
    return h('div', { class: 'pmw-docu-dr is-' + (x.k === '+' ? 'add' : x.k === '-' ? 'del' : 'ctx') }, [
      h('span', { class: 'pmw-docu-dr-no', text: x.o == null ? '' : String(x.o) }),
      h('span', { class: 'pmw-docu-dr-no', text: x.n == null ? '' : String(x.n) }),
      h('span', { class: 'pmw-docu-dr-sign', 'aria-label': x.k === '+' ? 'added' : x.k === '-' ? 'removed' : null, text: x.k === '+' ? '+' : x.k === '-' ? '\u2212' : '' }),
      h('span', { class: 'pmw-docu-dr-text', text: x.text || ' ' })
    ]);
  });
  return h('div', { class: 'pmw-docu-diff', role: 'region', 'aria-label': label, tabindex: '0', 'data-pmh': 'off' }, rows);
}
function countText(c) {
  return h('span', { class: 'pmw-docu-counts' }, [c.add ? h('span', { class: 'is-add', text: '+' + c.add }) : null, c.del ? h('span', { class: 'is-del', text: '\u2212' + c.del }) : null]);
}
var revertDoc = {
  kindWord: 'Revert', icon: 'reopen',
  label: function () { return 'Revert \u00b7 files'; },
  title: function () { return 'Revert Last Agent Edit: the 3 files the assistant changed'; },
  init: function (ctx, st) { ctx.data = revertFor(ctx.arg, st.data); },
  save: function (ctx) { return ctx.data; },
  totals: function () {
    var a = 0, d = 0;
    REVERT_FILES.forEach(function (f) { var c = counts(lineDiff(f.before, f.after)); a += c.add; d += c.del; });
    return { add: a, del: d };
  },
  facts: function (ctx) { var t = revertDoc.totals(); return [{ id: 'status', text: (ctx.data.state === 'reverted' ? 'Put back' : '3 files') + ' \u00b7 +' + t.add + ' \u2212' + t.del, dim: true }]; },
  actions: function (ctx) { return [{ id: 'record', label: 'Download record', icon: 'document', detail: 'The change and its revert, as a .json file', run: function () { revertDoc.record(ctx); } }]; },
  record: function (ctx) {
    download('revert-record.json', JSON.stringify({ request: 'Extract the checkout button label into a shared file and remove the legacy helper.', state: ctx.data.state,
      files: REVERT_FILES.map(function (f) { return { path: f.path, change: DID[f.kind].toLowerCase(), before: f.before, after: f.after }; }) }, null, 2));
    PMW.toast('Saved the revert record');
  },
  render: function (ctx) {
    var data = ctx.data, v = ctx.view, api = ctx.api, done = data.state === 'reverted';
    var t = revertDoc.totals();
    var timeline = [
      { mark: glyph('fileEdit'), who: 'The assistant', when: '4:12 PM', text: 'It edited 1 file, made 1 and deleted 1.' }
    ];
    if (done) timeline.push({ mark: glyph('checkCircle'), who: 'Revert', when: data.at, text: 'Reverted: 3 files put back, and each one checked.', state: 'ok' });
    var main = [
      h('p', { class: 'pmw-docu-quote' }, [h('span', { class: 'pmw-docu-dim', text: 'You asked: ' }), '\u201cExtract the checkout button label into a shared file and remove the legacy helper.\u201d']),
      PMW.frames.section('What happened', null, h('ol', { class: 'pmw-docu-timeline' }, timeline.map(function (x) {
        return h('li', { class: x.state ? 'is-' + x.state : null }, [h('span', { class: 'pmw-docu-tl-mark', 'aria-hidden': 'true' }, [x.mark]),
          h('div', null, [h('p', { class: 'pmw-docu-tl-head' }, [h('b', { text: x.who }), h('span', { class: 'pmw-docu-dim', text: ' \u00b7 ' + x.when })]), h('p', { class: 'pmw-docu-p', text: x.text })])]);
      })))
    ];
    if (v.confirm && !done) {
      main.push(confirmRow('Put back 3 files? Each one is checked first. If any changed after the assistant\u2019s edit, nothing is touched.',
        act({ label: 'Revert 3 files', danger: true, run: function () { data.state = 'reverted'; data.at = clock(); v.confirm = false; v.modes = {}; ctx.paint(); api.announce('Reverted: 3 files put back'); saveSoon(); } }, 'revert-yes'),
        act({ label: 'Keep them', run: function () { v.confirm = false; ctx.paint(); } }, 'revert-no')));
    }
    var files = REVERT_FILES.map(function (f) {
      var mode = (v.modes && v.modes[f.path]) || (done ? 'revert' : 'agent');
      var ops, cap;
      if (mode === 'agent') { ops = lineDiff(f.before, f.after); cap = f.kind === 'made' ? 'The assistant made this file.' : f.kind === 'deleted' ? 'The assistant deleted this file.' : 'What the assistant changed, line by line.'; }
      else if (mode === 'revert') { ops = lineDiff(f.after, f.before); cap = done ? 'What revert put back.' : 'Revert hasn\u2019t run. This is what it would put back.'; }
      else {
        var now = done ? f.before : f.after;
        ops = lineDiff(f.after, now);
        cap = done ? 'Now it is back to how it was before the assistant\u2019s change.' : now == null ? 'The file isn\u2019t there now.' : 'Unchanged since the assistant\u2019s edit.';
        if (!done) ops = [];
      }
      var c = counts(lineDiff(f.before, f.after));
      var openDiff = h('button', { type: 'button', class: 'pmw-docu-link', 'data-k': 'diff:' + f.path, 'data-pm-hover-label': 'Open the diff', 'data-pm-hover-detail': base(f.path) + ' in the editor, in diff mode' }, ['Open the diff']);
      openDiff.addEventListener('click', function (e) {
        var spec = { kind: 'editor', path: f.path, mode: 'diff', diff: true };
        if (e.altKey) spec.where = 'panel';
        api.open(spec);
      });
      return h('section', { class: 'pmw-docu-file-sec', 'data-state': done ? 'back' : 'as-left' }, [
        h('header', { class: 'pmw-docu-filehead' }, [
          h('span', { class: 'pmw-docu-filemark is-' + f.kind, 'aria-hidden': 'true' }, [glyph(DID_GLYPH[f.kind])]),
          h('div', { class: 'pmw-docu-filecopy' }, [
            h('p', { class: 'pmw-docu-fileline' }, [fileRef(api, { path: f.path }, { noIcon: true, cls: 'is-path' }), countText(c)]),
            h('p', { class: 'pmw-docu-dim', text: DID[f.kind] + ' by the assistant' })
          ]),
          h('span', { class: 'pmw-docu-filestate' + (done ? ' is-ok' : ''), text: done ? 'Put back' : 'As the assistant left it' })
        ]),
        PMW.frames.seg([{ value: 'agent', label: 'What the assistant changed' }, { value: 'revert', label: 'What revert put back' }, { value: 'now', label: 'Now' }], mode,
          function (m) { v.modes = v.modes || {}; v.modes[f.path] = m; ctx.paint(); }, { label: 'Show for ' + base(f.path), cls: 'pmw-docu-seg is-small' }),
        h('p', { class: 'pmw-docu-fine', text: cap }),
        ops.length ? diffView(ops, 'Changes in ' + base(f.path)) : null,
        h('p', { class: 'pmw-docu-linkrow' }, [openDiff])
      ]);
    });
    main.push(PMW.frames.section('Files', plural(3, 'file') + ' \u00b7 +' + t.add + ' \u2212' + t.del, files));
    main.push(fine('Not touched: notes/launch.txt'));
    main.push(fine('Demo: no real files are touched.'));
    var acts = [];
    if (!done) acts.push(act({ label: 'Revert 3 files\u2026', icon: 'reopen', run: function () { v.confirm = true; ctx.paint(); focusSoon(ctx, 'revert-no'); } }, 'revert'));
    acts.push(act({ label: 'Download record (.json)', icon: 'document', run: function () { revertDoc.record(ctx); } }, 'record'));
    return runFrame(ctx, {
      title: done ? 'Reverted: 3 files put back' : '3 files the assistant changed', kind: { icon: 'reopen', word: 'Revert Last Agent Edit' },
      status: ['The assistant edited 1 file, made 1 and deleted 1.' + (done ? ' Revert put all of them back.' : '')], actions: acts, main: main
    });
  }
};

/* ================================================================== Debug investigation (debug:<id>) */
var PHASES = ['Target', 'Baseline', 'Instrumentation', 'Reproduce', 'Analysis', 'Repair', 'Verify', 'Cleanup'];
var BUGGY = 'function lineTotal(price, quantity) {\n  return price * (quantity || 1);\n}';
var FIXED = 'function lineTotal(price, quantity) {\n  return price * (quantity ?? 1);\n}';
function lineTotalBuggy(price, quantity) { return price * (quantity || 1); }
function lineTotalFixed(price, quantity) { return price * (quantity === null || quantity === undefined ? 1 : quantity); }
var CASES = [['Zero quantity', 25, 0, 0], ['Two items', 25, 2, 50], ['Missing quantity', 25, undefined, 25], ['Null quantity', 25, null, 25], ['Fractional quantity', 25, 1.5, 37.5], ['Zero price', 0, 2, 0]];
function evaluate(fn) {
  var out = CASES.map(function (c) { var got = fn(c[1], c[2]); return { name: c[0], price: c[1], quantity: c[2] === undefined ? 'missing' : String(c[2]), expected: c[3], actual: got, pass: Object.is(got, c[3]) }; });
  return { cases: out, passed: out.filter(function (c) { return c.pass; }).length, total: out.length };
}
var NEXT_STEP = { 0: 'Capture baseline', 1: 'Reproduce', 3: 'Inspect diagnosis', 4: 'Apply repair', 5: 'Verify repair', 6: 'Finish cleanup' };
var HISTORY_TEXT = ['Bound examples/line-total.js at revision 1. Local example only.', 'Froze the source and the six-case acceptance contract.',
  'Attached one local trace collector, owned by this investigation.', '5/6 baseline checks passed.', 'Traced zero to the fallback; prepared one expression change.',
  'Changed || to ??; kept the rest of the frozen source.', '6/6 checks passed on the repaired target.', 'Removed the owned trace collector; kept its frozen evidence.'];
var DEBUG = {};
function debugFor(id, saved) {
  if (!DEBUG[id]) DEBUG[id] = saved && saved.phase != null ? saved : { phase: 4, status: 'running' };
  return DEBUG[id];
}
function debugAdvance(ctx) {
  var d = ctx.data;
  if (d.status !== 'running') return;
  var from = d.phase;
  d.phase = from === 1 ? 3 : from + 1;
  if (d.phase >= 7) { d.phase = 7; d.status = 'resolved'; }
  ctx.paint();
  ctx.api.announce(PHASES[d.phase] + ' done' + (d.status === 'resolved' ? '. Repair verified, cleanup complete.' : ''));
  saveSoon();
}
function checksList(ev) {
  return h('ul', { class: 'pmw-docu-checks' }, ev.cases.map(function (c) {
    return h('li', { class: c.pass ? 'is-pass' : 'is-fail' }, [
      h('span', { class: 'pmw-docu-checkmark', 'aria-hidden': 'true' }, [glyph(c.pass ? 'checkCircle' : 'cross', 14)]),
      h('span', { class: 'pmw-docu-checkname', text: c.name }),
      h('span', { class: 'pmw-docu-checkargs', text: 'price ' + c.price + ', quantity ' + c.quantity }),
      h('span', { class: 'pmw-docu-checkres', text: c.pass ? 'Pass' : c.actual + ' \u2192 expected ' + c.expected })
    ]);
  }));
}
var debugDoc = {
  kindWord: 'Debug', icon: 'debug',
  label: function () { return 'Debug \u00b7 r1'; },
  title: function () { return 'Debug \u00b7 Keep zero quantities'; },
  init: function (ctx, st) { ctx.data = debugFor(ctx.arg, st.data); },
  save: function (ctx) { return ctx.data; },
  facts: function (ctx) { return [{ id: 'status', text: { running: 'running', resolved: 'resolved', cancelled: 'cancelled' }[ctx.data.status], dim: true }]; },
  actions: function (ctx) {
    return [
      { id: 'console', label: 'Debug Console', icon: 'console', detail: 'Program output from this session goes there', run: function () { ctx.api.open({ kind: 'debug-console' }); } },
      { id: 'terminal', label: 'Terminal', icon: 'terminal', detail: 'Run the checks yourself', run: function () {
        var t = PM_HOME.tabs().filter(function (x) { return x.kind === 'terminal'; })[0];
        if (t) PM_HOME.reveal(t.tabId); else ctx.api.open({ kind: 'terminal', cwd: '~/tastebook/examples' });
      } }
    ];
  },
  render: function (ctx) {
    var d = ctx.data, api = ctx.api, phase = d.phase, resolved = d.status === 'resolved', cancelled = d.status === 'cancelled';
    var repaired = phase >= 5;
    var phases = h('ol', { class: 'pmw-docu-phases', 'aria-label': 'Investigation phases' }, PHASES.map(function (p, i) {
      var st = i <= phase ? 'done' : i === phase + 1 && d.status === 'running' ? 'now' : 'next';
      return h('li', { class: 'pmw-docu-phase is-' + st, 'aria-current': st === 'now' ? 'step' : null }, [
        h('span', { class: 'pmw-docu-phase-no', 'aria-hidden': 'true' }, st === 'done' ? [glyph('check', 12)] : [String(i + 1)]),
        h('span', { class: 'pmw-docu-phase-label', text: p }),
        h('span', { class: 'pmw-sr', text: st === 'done' ? ', done' : st === 'now' ? ', next' : '' })
      ]);
    }));
    var controls = [];
    if (d.status === 'running' && NEXT_STEP[phase] != null) controls.push(act({ label: NEXT_STEP[phase], primary: true, run: function () { debugAdvance(ctx); } }, 'next'));
    if (d.status === 'running') controls.push(act({ label: 'Cancel', run: function () { d.status = 'cancelled'; ctx.paint(); api.announce('Investigation cancelled. Only its own collector was removed.'); saveSoon(); } }, 'cancel'));
    if (d.status !== 'running') controls.push(act({ label: 'Start over', run: function () { d.phase = 0; d.status = 'running'; ctx.view.open = {}; ctx.paint(); api.announce('New investigation, bound to the same example'); saveSoon(); } }, 'restart'));
    controls.push(act({ label: 'Export bundle', icon: 'document', run: function () {
      download('debug-investigation.json', JSON.stringify({ kind: 'local debug bundle', status: d.status, phase: PHASES[phase], source: repaired ? FIXED : BUGGY,
        verification: phase >= 6 ? evaluate(lineTotalFixed) : null, reproduction: phase >= 3 ? evaluate(lineTotalBuggy) : null }, null, 2));
      PMW.toast('Saved the investigation bundle');
    } }, 'export'));
    var body = [
      h('p', { class: 'pmw-docu-target' }, [fileRef(api, { path: 'examples/line-total.js' }, { cls: 'is-path' }), h('span', { class: 'pmw-docu-dim', text: ' \u00b7 revision ' + (repaired ? 2 : 1) })]),
      phases,
      h('div', { class: 'pmw-docu-row' }, controls)
    ];
    if (cancelled) body.push(PMW.frames.notice('Cancelled. Only the collector this investigation owned was removed; your files were not touched.', { state: 'warn' }));
    if (resolved) body.push(h('section', { class: 'pmw-docu-result', role: 'status' }, [
      h('p', { class: 'pmw-docu-result-head' }, [h('span', { class: 'pmw-docu-ok', 'aria-hidden': 'true' }, [glyph('checkCircle')]), h('b', { text: 'Repair verified \u00b7 cleanup complete' })]),
      h('p', { class: 'pmw-docu-p', text: 'Zero stays zero. The other five cases still pass.' }),
      fine('One expression changed; the temporary collector is removed.')
    ]));
    if (phase >= 6) { var ver = evaluate(lineTotalFixed); body.push(PMW.frames.section('Verification \u00b7 ' + ver.passed + '/' + ver.total, 'on revision 2', checksList(ver))); }
    if (phase >= 4) {
      body.push(PMW.frames.section('Diagnosis', repaired ? 'Applied to revision 2' : 'Proposed \u00b7 not yet applied', [
        h('p', { class: 'pmw-docu-p is-strong', text: 'The || fallback treats an explicit zero as missing.' }),
        diffView([{ k: '-', o: 2, n: null, text: '  return price * (quantity || 1);' }, { k: '+', o: null, n: 2, text: '  return price * (quantity ?? 1);' }], 'The repair')
      ]));
    }
    if (phase >= 3) { var rep = evaluate(lineTotalBuggy); body.push(disclosure(ctx, 'repro', 'Reproduction \u00b7 ' + rep.passed + '/' + rep.total, [checksList(rep)])); }
    var code = function (t) { var c = PMW.frames.code(t); c.setAttribute('data-pmh', 'off'); return c; };
    body.push(disclosure(ctx, 'baseline', 'Frozen baseline', [code(BUGGY)]));
    body.push(disclosure(ctx, 'current', 'Current source', [code(repaired ? FIXED : BUGGY)]));
    if (phase >= 2) {
      var removed = phase >= 7 || cancelled;
      body.push(disclosure(ctx, 'instr', 'Instrumentation and cleanup', [
        h('p', { class: 'pmw-docu-p', text: 'Local trace collector \u00b7 ' + (removed ? 'removed' : 'attached') }),
        h('p', { class: 'pmw-docu-p', text: removed ? 'Owned resource removed. Frozen trace evidence kept.' : 'Owned by this investigation.' }),
        code(JSON.stringify(evaluate(lineTotalBuggy).cases.map(function (c) { return { case: c.name, price: c.price, quantity: c.quantity, actual: c.actual }; }), null, 2))
      ]));
    }
    body.push(disclosure(ctx, 'history', 'Investigation history', [h('ol', { class: 'pmw-docu-plainlist is-numbered' }, HISTORY_TEXT.slice(0, phase + 1).map(function (t, i) {
      return h('li', null, [h('b', { text: PHASES[i] }), ' \u00b7 ' + t]);
    }).concat(cancelled ? [h('li', null, [h('b', { text: 'Cleanup' }), ' \u00b7 Cancelled; removed only the owned collector.'])] : []))]));
    body.push(fine('Local JavaScript checks, not a connected debugger or a write to your files.'));
    return docFrame({ title: 'Keep zero quantities', meta: ['Debug', 'local example', { text: d.status, state: resolved ? 'ok' : cancelled ? 'warn' : null }], body: body, cls: 'pmw-docu-debug' });
  }
};

/* ================================================================== Lens: source and what it would read */
var MESSAGES = {
  'm-3': { who: 'You', at: '11:20', n: 3, text: 'The tenant analytics dashboard times out for our three biggest customers. Can you plan a fix for the read path? Keep the write cost in mind: we got paged last quarter for a write regression.' },
  'm-7': { who: 'Assistant', at: '11:42', n: 7, text: 'The 310 ms p95 in the ticket came from a fixture with 8 tenants and 400 rows each. At production shape (214 tenants, 128,400 rows) it is 482 ms. I rebuilt the fixture first so every later number means something.' },
  'm-10': { who: 'Assistant', at: '12:10', n: 10, text: 'Side note on the dashboard colours: the p95 line and the target line are too close in hue to tell apart at a glance.' },
  'm-12': { who: 'You', at: '12:02', n: 12, text: 'Before you add the index, two things.\n\nFirst, the migration runner wraps every file in a transaction, and CREATE INDEX CONCURRENTLY refuses to run inside one. Put the index in its own migration and mark it no-transaction, or it will fail in staging the way it did in March.\n\nSecond, I want the write cost measured, not estimated. Run 50,000 inserts against the corrected fixture with and without the index and put both numbers next to the read win. If the overhead is over 8% we stop and talk; that number comes from the last incident review, not from a principle.\n\nAlso check whether the query builder still fans out per tenant in the export path. I think two call sites do it, and the index will not help them.' },
  'm-14': { who: 'Assistant', at: '12:31', n: 14, text: 'Revised to V4: the index moves into migration 0043, marked no-transaction. The rollback is rehearsed against a restored snapshot before the forward migration ships.' },
  'm-18': { who: 'You', at: '12:58', n: 18, text: 'Fold the measured numbers into the plan and name what we still have not measured.' }
};
var lensSourceDoc = {
  kindWord: 'Lens', icon: 'eye',
  parse: function (arg) { var i = arg.indexOf(':'); return { thread: i < 0 ? arg : arg.slice(0, i), msg: i < 0 ? '' : arg.slice(i + 1) }; },
  label: function () { return 'Lens source'; },
  title: function (ctx) { return 'Lens source \u00b7 ' + threadTitle(lensSourceDoc.parse(ctx.arg).thread); },
  facts: function () { return [{ id: 'ro', text: 'Read-only', dim: true }]; },
  actions: function (ctx) {
    var p = lensSourceDoc.parse(ctx.arg), m = MESSAGES[p.msg];
    return [
      m ? { id: 'copy', label: 'Copy', icon: 'document', detail: 'The message as plain text', run: function () { copyText(m.text, 'Message copied'); } } : null,
      { id: 'read', label: 'What it would read', icon: 'eye', run: function () { ctx.api.open({ id: 'lens-effective:' + p.thread, kind: 'document', label: 'What it would read' }); } }
    ].filter(Boolean);
  },
  render: function (ctx) {
    var p = lensSourceDoc.parse(ctx.arg), m = MESSAGES[p.msg];
    var body = [m ? h('pre', { class: 'pmw-docu-msg', 'data-pmh': 'off' }, [m.text]) : h('p', { class: 'pmw-docu-p', text: 'Source unavailable or revoked.' }),
      fine('Read-only source view. Opening it does not change what the assistant reads.')];
    return docFrame({ title: 'Full source message', meta: ['Canonical source', threadTitle(p.thread), m ? (m.who + ', ' + m.at) : null, m ? 'message ' + m.n : null], body: body, cls: 'pmw-docu-lens' });
  }
};
var EFFECTIVE = [
  { state: 'Summarized', what: 'Messages 1\u20139 \u00b7 source summary', text: 'The dashboard times out for the largest tenants. The reported 310 ms p95 came from a fixture too small to matter; at production shape it is 482 ms. The fixture was rebuilt first.', src: 'm-3' },
  { state: 'Focused', msg: 'm-12' },
  { state: 'Muted', msg: 'm-10', why: 'Muted: left out of what it reads.' },
  { state: 'Included', msg: 'm-14' },
  { state: 'Focused', msg: 'm-18' }
];
var lensEffectiveDoc = {
  kindWord: 'Lens', icon: 'eye',
  label: function () { return 'What it would read'; },
  title: function (ctx) { return 'What the assistant would read \u00b7 ' + threadTitle(ctx.arg); },
  facts: function () { return [{ id: 'status', text: EFFECTIVE.length + ' items \u00b7 2 focused \u00b7 1 muted', dim: true }]; },
  actions: function (ctx) {
    return [
      { id: 'raw', label: 'Raw', icon: 'code', pressed: !!ctx.view.raw, detail: 'The same list as data', run: function () { ctx.view.raw = !ctx.view.raw; ctx.paint(); } },
      { id: 'copy', label: 'Copy', icon: 'document', run: function () { copyText(JSON.stringify(lensEffectiveDoc.data(ctx), null, 2), 'Copied the list as data'); } }
    ];
  },
  data: function (ctx) {
    return EFFECTIVE.map(function (e, i) {
      var m = e.msg ? MESSAGES[e.msg] : null;
      return { order: i + 1, state: e.state.toLowerCase(), from: m ? m.who.toLowerCase() : 'summary', at: m ? m.at : null, covers: e.what || null, text: m ? m.text : e.text };
    });
  },
  render: function (ctx) {
    var api = ctx.api, main;
    if (ctx.view.raw) {
      var c = PMW.frames.code(JSON.stringify(lensEffectiveDoc.data(ctx), null, 2));
      c.setAttribute('data-pmh', 'off');
      main = [c];
    } else {
      main = [h('ol', { class: 'pmw-docu-eff' }, EFFECTIVE.map(function (e, i) {
        var m = e.msg ? MESSAGES[e.msg] : null;
        var text = m ? m.text : e.text;
        var src = e.msg || e.src;
        var open = h('button', { type: 'button', class: 'pmw-docu-link', 'data-k': 'src:' + i, 'data-pm-hover-label': 'Open the full source message' }, ['Open the source']);
        open.addEventListener('click', function (ev) { var s = { id: 'lens-source:' + ctx.arg + ':' + src, kind: 'document', label: 'Lens source' }; if (ev.altKey) s.where = 'panel'; api.open(s); });
        return h('li', { class: 'pmw-docu-eff-item is-' + e.state.toLowerCase() }, [
          h('p', { class: 'pmw-docu-eff-head' }, [h('span', { class: 'pmw-docu-eff-no', text: String(i + 1) }), h('b', { class: 'pmw-docu-eff-state', text: e.state }),
            h('span', { class: 'pmw-docu-dim', text: m ? m.who + ' \u00b7 ' + m.at : e.what })]),
          h('p', { class: 'pmw-docu-eff-text', text: text.length > 260 ? text.slice(0, 257).replace(/\s+\S*$/, '') + '\u2026' : text }),
          e.why ? fine(e.why) : null,
          h('p', { class: 'pmw-docu-linkrow' }, [open])
        ]);
      }))];
    }
    return runFrame(ctx, { title: 'What the assistant would read', kind: { icon: 'eye', word: 'Lens' },
      status: ['A read-only view of the selected messages and their linked summaries, in order. Focus marks priority; it is not the exact text sent to the model.'], main: main });
  }
};

/* ================================================================== Wonderer (wonderer:<run>) and its sources */
var LEADS = [
  { id: 'fence', claim: 'Treat stale query replies like out-of-order deliveries: admit only the current request.', dimension: 'Distributed systems \u00b7 ordering',
    tether: 'The search UI must not let an old query replace a newer result.', source: 'latest-query-fence',
    evidence: 'Checked against Latest-query fence.json: when the older reply arrives late, the fence keeps the newer result. Version 1.' },
  { id: 'worker', claim: 'A worker may improve responsiveness, but setup and transfer overhead could outweigh its benefit.', dimension: 'Scale boundary \u00b7 measurement',
    tether: 'Filtering the dashboard\u2019s 128,400 rows has to stay inside one frame.', source: 'dashboard-query',
    evidence: 'Checked against the Query Benchmark Dashboard: handing 128,400 rows to a worker costs about 9 ms, more than the 6 ms the filter itself takes. Version 6.' },
  { id: 'fallback', claim: 'Keep an explicit local-filter fallback while the worker path is evaluated.', dimension: 'Human factors \u00b7 reversibility',
    tether: 'People must be able to go back if the new path misbehaves.', source: null }
];
var LEAD_WORD = { hypothesis: 'Hypothesis', checking: 'Checking', checked: 'Checked', decided: 'Your choice', aside: 'Set aside' };
var WONDER = {};
function wonderFor(run, saved) {
  if (!WONDER[run]) {
    WONDER[run] = saved && saved.leads ? saved : { paused: false, core: 'not_started', written: false, showBallot: false,
      leads: LEADS.map(function (l) { return { id: l.id, state: 'hypothesis', decision: null, reason: '' }; }) };
  }
  return WONDER[run];
}
var wondererDoc = {
  kindWord: 'Wonderer \u00b7 BrainStorm', icon: 'run',
  label: function () { return 'Wonderer\u2019s ideas'; },
  title: function () { return 'Wonderer\u2019s ideas \u00b7 BrainStorm'; },
  init: function (ctx, st) { ctx.data = wonderFor(ctx.arg, st.data); },
  save: function (ctx) { return ctx.data; },
  undecided: function (ctx) { return ctx.data.leads.filter(function (l) { return !l.decision; }).length; },
  facts: function (ctx) { var n = wondererDoc.undecided(ctx); return [{ id: 'status', text: ctx.data.paused ? 'Paused' : n ? n + ' to decide' : 'all decided', dim: true }]; },
  actions: function (ctx) {
    var d = ctx.data;
    return [{ id: 'pause', label: d.paused ? 'Resume' : 'Pause', icon: d.paused ? 'play' : 'pause', run: function () { d.paused = !d.paused; ctx.paint(); ctx.api.announce(d.paused ? 'Run paused' : 'Run resumed'); saveSoon(); } }];
  },
  render: function (ctx) {
    var d = ctx.data, api = ctx.api, running = !d.paused;
    var undecided = wondererDoc.undecided(ctx), inPlan = d.leads.filter(function (l) { return l.decision === 'include' || l.decision === 'mine'; }).length;
    var leads = h('div', { class: 'pmw-docu-leads' }, d.leads.map(function (l) {
      var def = LEADS.filter(function (x) { return x.id === l.id; })[0];
      var said = l.state === 'checked' ? def.evidence : l.decision === 'mine' ? 'No check supports it. It is in the plan only as your decision.' : l.state === 'checking' ? 'Checking the source now.' : 'Not checked yet. It is not a fact or a decision.';
      var sec = h('section', { class: 'pmw-docu-lead is-' + l.state });
      sec.appendChild(h('p', { class: 'pmw-docu-lead-claim', text: def.claim }));
      sec.appendChild(h('p', { class: 'pmw-docu-lead-line' }, [h('span', { class: 'pmw-docu-dim', text: 'Relates to: ' }), def.dimension]));
      sec.appendChild(h('p', { class: 'pmw-docu-lead-line' }, [h('span', { class: 'pmw-docu-dim', text: 'Why it matters: ' }), def.tether]));
      sec.appendChild(h('p', { class: 'pmw-docu-lead-state' }, [h('b', { text: LEAD_WORD[l.decision ? (l.decision === 'aside' ? 'aside' : l.decision === 'mine' ? 'decided' : l.state) : l.state] }), ' \u00b7 ' + said]));
      if (l.decision) {
        sec.appendChild(h('p', { class: 'pmw-docu-lead-decided' }, [h('b', { text: l.decision === 'aside' ? 'Set aside' : 'In the plan' }), ' \u00b7 ' + l.reason,
          ' ', tbtn('Change', function () { l.decision = null; ctx.paint(); saveSoon(); }, { key: 'change:' + l.id, cls: 'is-inline', disabled: !running, reason: 'The run is paused' })]));
        return sec;
      }
      var acts = [];
      if (def.source) {
        acts.push(tbtn(l.state === 'checking' ? 'Checking\u2026' : l.state === 'checked' ? 'Check it again' : 'Check it', function () {
          l.state = 'checking'; ctx.paint();
          ctx.later(function () { l.state = 'checked'; ctx.paint(); api.announce('Checked: ' + def.claim.slice(0, 48)); saveSoon(); }, reduced() ? 300 : 1200);
        }, { key: 'check:' + l.id, disabled: !running || l.state === 'checking', reason: running ? 'Checking now' : 'The run is paused' }));
        acts.push(tbtn('Open the source', function (e) {
          var s = { id: 'wonder-source:' + def.source, kind: 'document', label: 'Wonderer \u00b7 source' };
          if (e.altKey) s.where = 'panel';
          api.open(s);
        }, { key: 'src:' + l.id }));
      }
      if (acts.length) sec.appendChild(h('div', { class: 'pmw-docu-row is-quiet' }, acts));
      var ta = h('textarea', { class: 'pmw-docu-input', rows: '2', 'data-k': 'reason:' + l.id, 'aria-label': 'Why? This goes into the plan with your choice.', placeholder: 'Say why you use it or set it aside.' });
      ta.value = l.reason || '';
      ta.addEventListener('input', function () { l.reason = ta.value; });
      sec.appendChild(h('label', { class: 'pmw-docu-label', text: 'Why? This goes into the plan with your choice.' }));
      sec.appendChild(ta);
      if (ctx.view.needReason === l.id) sec.appendChild(h('p', { class: 'pmw-docu-err', role: 'alert', text: 'Say why first. It goes into the plan with your choice.' }));
      function decide(kind) {
        if (!(l.reason || '').trim()) { ctx.view.needReason = l.id; ctx.paint(); focusSoon(ctx, 'reason:' + l.id); return; }
        ctx.view.needReason = null;
        l.decision = kind; l.reason = l.reason.trim();
        ctx.paint();
        api.announce(kind === 'aside' ? 'Set aside' : 'In the plan');
        saveSoon();
      }
      var canUse = l.state === 'checked';
      sec.appendChild(h('div', { class: 'pmw-docu-row' }, [
        act({ label: 'Use in the plan', disabled: !running || !canUse, reason: !running ? 'The run is paused' : 'Check it first, or make it your own decision', detail: canUse ? 'A check supports it' : 'Check it first, or make it your own decision', run: function () { decide('include'); } }, 'use:' + l.id),
        act({ label: 'Set aside', disabled: !running || l.state === 'checking', run: function () { decide('aside'); } }, 'aside:' + l.id),
        act({ label: 'Use as my decision', disabled: !running || l.state === 'checking', run: function () { decide('mine'); } }, 'mine:' + l.id)
      ]));
      if (!canUse && running) sec.appendChild(fine(def.source ? 'Use it in the plan once a check supports it, or make it your own decision.' : 'Nothing can check this one; make it your decision or set it aside.'));
      return sec;
    }));
    var reason = !running ? 'The run isn\u2019t running.' : undecided ? 'Give each idea a decision first.' : d.core !== 'played' ? 'Finish the core round first.' : '';
    var conv = [
      h('p', { class: 'pmw-docu-p' }, [undecided ? 'Decide on ' + plural(undecided, 'idea') + ' first.' : 'Every idea has a decision.', ' The core votes and the disagreement stay as they are.']),
      h('p', { class: 'pmw-docu-p', text: 'Core round: ' + (d.core === 'played' ? 'ready to write the plan' : 'debating') + ' \u00b7 1 disagreement kept.' })
    ];
    if (d.written) conv.push(h('p', { class: 'pmw-docu-p is-strong', role: 'status', text: 'Plan written. It is waiting in the chat for your review.' }));
    else {
      conv.push(h('div', { class: 'pmw-docu-row' }, [act({ label: 'Write the plan', primary: true, disabled: !!reason, reason: reason, detail: reason || 'Bring the core round and your decisions together', run: function () { d.written = true; ctx.paint(); api.announce('Plan written'); saveSoon(); } }, 'write')]));
      if (reason) conv.push(h('p', { class: 'pmw-docu-reason', text: reason }));
    }
    var main = [leads];
    if (d.showBallot) {
      main.push(PMW.frames.section('How they decided', 'core round', h('ul', { class: 'pmw-docu-ballot' }, [
        ['Architect', 'Use a request fence', 'agrees'], ['Researcher', 'Use a request fence', 'agrees'], ['Critic', 'Debounce the input instead', 'disagrees, kept on record']
      ].map(function (b) { return h('li', null, [h('b', { text: b[0] }), h('span', { text: b[1] }), h('span', { class: 'pmw-docu-dim', text: b[2] })]); }))));
    }
    main.push(PMW.frames.section('Bring the work together', null, conv));
    var acts = [];
    if (running && d.core === 'not_started') acts.push(act({ label: 'Play the core round', icon: 'play', run: function () { d.core = 'played'; ctx.paint(); api.announce('Core round played: two agree, one disagreement kept'); saveSoon(); } }, 'core'));
    acts.push(act({ label: 'See how they decided', pressed: !!d.showBallot, run: function () { d.showBallot = !d.showBallot; ctx.paint(); } }, 'ballot'));
    acts.push(act({ label: d.paused ? 'Resume' : 'Pause', icon: d.paused ? 'play' : 'pause', run: function () { d.paused = !d.paused; ctx.paint(); saveSoon(); } }, 'pause'));
    var aside = h('ul', { class: 'pmw-docu-aside' }, [
      h('li', null, [h('b', { text: '3 core helpers' }), ' and one Wonderer']),
      h('li', null, [h('b', { text: String(inPlan) }), ' in the plan \u00b7 ', h('b', { text: String(undecided) }), ' to decide']),
      h('li', { text: 'Wonderer never votes, so the core ballot is unchanged.' })
    ]);
    return runFrame(ctx, {
      title: 'Wonderer\u2019s ideas', kind: { icon: 'run', word: 'Wonderer \u00b7 BrainStorm' },
      status: [(d.paused ? 'Paused' : undecided ? plural(undecided, 'idea') + ' to decide' : 'Every idea has a decision') + '. Ideas from other fields; each stays a hypothesis until it\u2019s checked.'],
      actions: acts, main: main, aside: aside
    });
  }
};
var SOURCES = {
  'latest-query-fence': { name: 'Latest-query fence.json', version: 1, text: JSON.stringify({ kind: 'latest_query_fence', latestRequest: 2,
    arrivals: [{ requestId: 2, value: 'new result' }, { requestId: 1, value: 'old result' }], expected: 'new result' }, null, 2) },
  'dashboard-query': { name: 'Query Benchmark Dashboard.json', version: 6, artifact: 'dashboard-query', label: 'Query Benchmark Dashboard', text: JSON.stringify({
    artifact: 'Query Benchmark Dashboard', version: 6, fixture: { tenants: 214, rows: 128400 },
    read_ms: { p50: { before: 118, after: 24 }, p95: { before: 482, after: 71 } }, throughput_rows_per_s: { before: 1420, after: 3980 },
    write_overhead_pct: 4.8, worker_handoff_ms: 9, filter_ms: 6, unmeasured: ['concurrent write load', 'planner choice after a statistics refresh'] }, null, 2) }
};
var wonderSourceDoc = {
  kindWord: 'Shared file', icon: 'file',
  label: function () { return 'Wonderer \u00b7 source'; },
  title: function (ctx) { var s = SOURCES[ctx.arg]; return 'Wonderer \u00b7 source' + (s ? ': ' + s.name : ''); },
  facts: function (ctx) { var s = SOURCES[ctx.arg]; return s ? [{ id: 'v', text: 'Version ' + s.version, dim: true }] : []; },
  actions: function (ctx) {
    var s = SOURCES[ctx.arg];
    if (!s) return [];
    return [{ id: 'copy', label: 'Copy', icon: 'document', run: function () { copyText(s.text, 'Copied ' + s.name); } }].concat(s.artifact ? [{ id: 'artifact', label: 'Open artifact', icon: 'artifact',
      run: function () { ctx.api.open({ id: s.artifact, kind: 'artifact', label: s.label }); } }] : []);
  },
  render: function (ctx) {
    var s = SOURCES[ctx.arg];
    if (!s) return runFrame(ctx, { title: 'This source is not here', kind: { icon: 'file', word: 'Wonderer \u00b7 source' }, status: ['It may have been removed, or it belongs to another project.'], main: [] });
    var c = PMW.frames.code(s.text);
    c.setAttribute('data-pmh', 'off');
    return runFrame(ctx, { title: s.name, kind: { icon: 'file', word: 'Wonderer \u00b7 source' }, status: ['Shared file', 'version ' + s.version, 'read-only'],
      main: [c, fine('The Wonderer checks its ideas against this exact version. A newer version marks those checks out of date.')] });
  }
};

/* ================================================================== doc:<path> (a plain document) */
var DOC_FILES = {
  'docs/query-performance.md': { title: 'Query performance notes', blocks: [
    ['h', 'What changed'],
    ['p', 'The analytics read path now uses idx_events_tenant_created, a composite index over tenant_id and created_at, created concurrently in its own no-transaction migration.'],
    ['ul', ['p95 read: 482 ms before, 71 ms after', 'p50 read: 118 ms before, 24 ms after', 'Throughput: 1,420 rows/s before, 3,980 rows/s after', 'Write overhead: +4.8%, under the 8% ceiling']],
    ['h', 'Still unmeasured'],
    ['p', 'Behaviour under concurrent write load, and whether the planner still picks the index after a statistics refresh under the current autovacuum settings.'],
    ['h', 'How to measure again'],
    ['p', 'Run the benchmark against the corrected fixture (214 tenants, 128,400 rows) and record the p95 delta in the plan evidence section.']
  ] }
};
var plainDoc = {
  kindWord: 'Document', icon: 'document',
  label: function (ctx) { return base(ctx.arg) || 'Document'; },
  title: function (ctx) { return ctx.arg || 'Document'; },
  facts: function (ctx) { return [{ id: 'path', text: ctx.arg, mono: true }]; },
  actions: function (ctx) {
    return [{ id: 'file', label: 'Open as a file', icon: 'file', detail: 'The source in the editor', run: function (e) { var s = { kind: 'editor', path: ctx.arg, mode: 'keep' }; if (e && e.altKey) s.where = 'panel'; ctx.api.open(s); } }];
  },
  render: function (ctx) {
    var f = DOC_FILES[ctx.arg];
    if (!f) return docFrame({ title: base(ctx.arg) || 'Document', meta: ['Document', ctx.arg], body: [h('p', { class: 'pmw-docu-p', text: 'There is no reading view for this file yet. Open it as a file to see its text.' })] });
    var body = f.blocks.map(function (b) {
      if (b[0] === 'h') return h('h2', { class: 'pmw-docu-h2', text: b[1] });
      if (b[0] === 'ul') return h('ul', { class: 'pmw-docu-ul' }, b[1].map(function (t) { return h('li', { text: t }); }));
      return h('p', { class: 'pmw-docu-p', text: b[1] });
    });
    return docFrame({ title: f.title, meta: ['Document', ctx.arg, 'Markdown'], body: body });
  }
};
var unknownDoc = {
  kindWord: 'Document', icon: 'document',
  label: function () { return 'Document'; },
  title: function () { return 'Document'; },
  render: function () { return docFrame({ title: 'This document is not here', meta: ['Document'], body: [h('p', { class: 'pmw-docu-p', text: 'It may have been closed in the chat or removed. Ask the chat to open it again.' })] }); }
};

var DOCS = { teach: teachDoc, memory: memoryDoc, revert: revertDoc, debug: debugDoc, lensSource: lensSourceDoc, lensEffective: lensEffectiveDoc,
  wonderer: wondererDoc, wonderSource: wonderSourceDoc, doc: plainDoc, unknown: unknownDoc };
var ROUTES = [['teach:', 'teach'], ['memory:', 'memory'], ['revert:', 'revert'], ['debug:', 'debug'], ['lens-source:', 'lensSource'],
  ['lens-effective:', 'lensEffective'], ['wonderer:', 'wonderer'], ['wonder-source:', 'wonderSource'], ['doc:', 'doc']];
function route(id) {
  for (var i = 0; i < ROUTES.length; i++) if (String(id).indexOf(ROUTES[i][0]) === 0) return { type: ROUTES[i][1], arg: String(id).slice(ROUTES[i][0].length) };
  return { type: 'unknown', arg: '' };
}

/* the chat port's own body renderer (CONTRACT 6.1): PM_HOME.openEditor(id, { render }) */
function chatRenderer(id) {
  var r = PMW.renderers && PMW.renderers[id];
  return r && typeof r.render === 'function' ? r : null;
}

function mountDocument(host, state, api) {
  state = state || {};
  var r = route(api.id);
  var mod = DOCS[r.type] || unknownDoc;
  var root = h('div', { class: 'pmw-docu pmw-docu-' + r.type.replace(/[A-Z]/g, function (c) { return '-' + c.toLowerCase(); }) });
  var stage = h('div', { class: 'pmw-docu-stage' });
  var ctx = { api: api, arg: r.arg, host: host, view: Object.assign({}, state.view || {}), timers: [], gone: false };
  ctx.later = function (fn, ms) { var t = setTimeout(function () { if (!ctx.gone) fn(); }, ms); ctx.timers.push(t); return t; };
  var frame = null, restored = false, scrollKeep = state.scrollTop || 0;
  ctx.paint = paint;
  if (mod.init) mod.init(ctx, state);
  var custom = chatRenderer(api.id);
  function labels() {
    var label = custom && custom.label ? custom.label : mod.label(ctx);
    api.update({ label: label, title: mod.title(ctx) });
  }
  labels();
  function left() {
    return [{ id: 'kind', icon: mod.icon, text: mod.kindWord, strong: true }].concat(mod.facts ? mod.facts(ctx) : []);
  }
  function actions() {
    var m = api.isMaximized();
    return (mod.actions && !custom ? mod.actions(ctx) : []).concat([{ id: 'max', label: m ? 'Restore' : 'Maximize', icon: m ? 'restore' : 'maximize', shortcut: 'Shift+Escape', run: function () { api.toggleMaximize(); } }]);
  }
  var row = api.headerRow({ label: mod.kindWord + ' controls', left: left(), actions: actions() });
  root.appendChild(row.el);
  root.appendChild(stage);
  host.appendChild(root);
  api.on('maximize', function () { row.set({ actions: actions() }); });

  function paint() {
    if (ctx.gone) return;
    var active = D.activeElement, key = null;
    if (active && host.contains(active)) key = active.getAttribute('data-k') || (active.closest('.pmw-hrow') && active.getAttribute('data-id') ? 'hrow:' + active.getAttribute('data-id') : null);
    var keep = frame ? frame._scroll.scrollTop : scrollKeep;
    var next;
    if (custom) {
      var body = h('div', { class: 'pmw-docu-chatbody' });
      next = h('div', { class: 'pmw-frame' }, [h('div', { class: 'pmw-frame-scroll' }, [body])]);
      next._scroll = next.firstChild;
      try { custom.render(body, { id: api.id, api: api }); } catch (err) { try { console.error('[pm-home] a chat document renderer failed', err); } catch (_) {} }
    } else next = mod.render(ctx);
    next._scroll.setAttribute('data-pmh', 'off');
    if (frame) frame.replaceWith(next); else stage.appendChild(next);
    frame = next;
    frame._scroll.scrollTop = keep;
    row.set({ left: left(), actions: actions() });
    if (key) {
      var el = key.indexOf('hrow:') === 0 ? row.action(key.slice(5)) : host.querySelector('[data-k="' + key.replace(/["\\]/g, '\\$&') + '"]');
      if (el) { try { el.focus({ preventScroll: true }); } catch (_) {} }
    }
  }
  paint();
  return {
    onResize: function (s) {
      root.classList.toggle('is-narrow', s.w < 420);
      if (!restored && frame) { restored = true; frame._scroll.scrollTop = scrollKeep; }
    },
    rerender: function () { custom = chatRenderer(api.id); labels(); paint(); },
    focus: function () { if (frame) { frame._scroll.setAttribute('tabindex', '-1'); try { frame._scroll.focus({ preventScroll: true }); } catch (_) {} } },
    serialize: function () {
      var out = { scrollTop: frame ? Math.round(frame._scroll.scrollTop) : 0, view: ctx.view };
      if (mod.save) out.data = mod.save(ctx);
      return out;
    },
    unmount: function () { ctx.gone = true; ctx.timers.forEach(clearTimeout); }
  };
}

/* ---- the catalog: every document the demo can open, with the chat's exact tab labels (digest 05 section 1.2) ---- */
PM_HOME.catalog.add('document', [
  { id: 'teach:query', label: 'Your rules', sub: 'Teach \u00b7 Query performance \u00b7 1 in use', keywords: 'teach rules', spec: { id: 'teach:query', kind: 'document', label: 'Your rules' } },
  { id: 'memory:query', label: 'Gist Review', sub: 'Memory \u00b7 Notes it took \u00b7 1 note', keywords: 'memory notes gist', spec: { id: 'memory:query', kind: 'document', label: 'Gist Review' } },
  { id: 'revert:turn-1', label: 'Revert \u00b7 files', sub: '3 files the assistant changed', keywords: 'revert undo files', spec: { id: 'revert:turn-1', kind: 'document', label: 'Revert \u00b7 files' } },
  { id: 'debug:dbg-investigation-1', label: 'Debug \u00b7 r1', sub: 'Keep zero quantities \u00b7 local example', keywords: 'debug investigation', spec: { id: 'debug:dbg-investigation-1', kind: 'document', label: 'Debug \u00b7 r1' } },
  { id: 'lens-source:query:m-12', label: 'Lens source', sub: 'Full source message \u00b7 Query performance', keywords: 'lens source message', spec: { id: 'lens-source:query:m-12', kind: 'document', label: 'Lens source' } },
  { id: 'lens-effective:query', label: 'What it would read', sub: 'Lens \u00b7 Query performance', keywords: 'lens context read', spec: { id: 'lens-effective:query', kind: 'document', label: 'What it would read' } },
  { id: 'wonderer:w-1', label: 'Wonderer\u2019s ideas', sub: 'BrainStorm \u00b7 3 ideas to decide', keywords: 'wonderer brainstorm ideas', spec: { id: 'wonderer:w-1', kind: 'document', label: 'Wonderer\u2019s ideas' } },
  { id: 'wonder-source:dashboard-query', label: 'Wonderer \u00b7 source', sub: 'Query Benchmark Dashboard.json \u00b7 version 6', keywords: 'wonderer source', spec: { id: 'wonder-source:dashboard-query', kind: 'document', label: 'Wonderer \u00b7 source' } },
  { id: 'doc:docs/query-performance.md', label: 'query-performance.md', sub: 'Query performance notes', keywords: 'doc notes markdown', spec: { id: 'doc:docs/query-performance.md', kind: 'document', label: 'query-performance.md' } }
]);

PM_HOME.registerKind('document', {
  label: 'Document',
  group: 'Plans and documents',
  icon: 'document',
  prefixes: ['teach:', 'memory:', 'revert:', 'debug:', 'lens-source:', 'lens-effective:', 'wonderer:', 'wonder-source:', 'doc:'],
  document: true,
  min: { w: 280, h: 160 },
  idFor: function (spec) { return spec.path ? 'doc:' + spec.path : null; },
  mount: mountDocument
});
