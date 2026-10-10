/* The tab-kind registry (CONTRACT sections 2 and 3). A kind registers once; tabs of that kind are mounted lazily by
   the renderer. Tab ids carry their kind in a prefix, so a caller that only has an id still lands in the right kind. */

var KINDS = PMW.kinds = {};
var PREFIXES = [];   // [{ prefix, kind }] longest first
var DOCUMENT_KINDS = { editor: 1, plan: 1, document: 1, artifact: 1, run: 1, transcript: 1, context: 1, record: 1 };
var DEDICATED_DEFAULT = { terminal: 1, browser: 1, dashboard: 1 };
var PANEL_MIN = PMW.PANEL_MIN = { w: 280, h: 120 };

PM_HOME.registerKind = function (id, def) {
  if (!id || !def || typeof def.mount !== 'function') throw new Error('registerKind needs an id and a mount function');
  var k = Object.assign({
    id: id, label: id, group: id, icon: 'file', prefixes: [], min: { w: PANEL_MIN.w, h: PANEL_MIN.h },
    dedicated: !!DEDICATED_DEFAULT[id], document: !!DOCUMENT_KINDS[id], eager: false
  }, def);
  k.id = id;
  k.min = { w: Math.max(PANEL_MIN.w, (def.min && def.min.w) || 0), h: Math.max(PANEL_MIN.h, (def.min && def.min.h) || 0) };
  for (var i = 0; i < k.prefixes.length; i++) {
    var pre = k.prefixes[i];
    for (var j = 0; j < PREFIXES.length; j++) {
      if (PREFIXES[j].prefix === pre && PREFIXES[j].kind !== id) {
        try { console.error('[pm-home] tab prefix ' + pre + ' is claimed by ' + PREFIXES[j].kind + ' and ' + id); } catch (_) {}
      }
    }
    PREFIXES.push({ prefix: pre, kind: id });
  }
  PREFIXES.sort(function (a, b) { return b.prefix.length - a.prefix.length; });
  var replacing = !!KINDS[id];
  KINDS[id] = k;
  if (replacing && PMW.render && PMW.render.remountKind) PMW.render.remountKind(id);
  bus.emit('kinds', { id: id });
  return k;
};
PM_HOME.kindOf = function (tabId) {
  if (!tabId) return null;
  if (PMW.state && PMW.state.layout && PMW.state.layout.tabs[tabId]) return PMW.state.layout.tabs[tabId].kind;
  for (var i = 0; i < PREFIXES.length; i++) if (tabId.indexOf(PREFIXES[i].prefix) === 0) return PREFIXES[i].kind;
  if (tabId === 'problems' || tabId === 'ports') return tabId;
  return null;
};
PM_HOME.kinds = function () { return Object.keys(KINDS); };
function kindDef(id) { return KINDS[id] || null; }
PMW.kindDef = kindDef;
PMW.isDocumentKind = function (id) { var k = KINDS[id]; return k ? !!k.document : !!DOCUMENT_KINDS[id]; };
PMW.isDedicatedKind = function (id) { var k = KINDS[id]; return k ? !!k.dedicated : !!DEDICATED_DEFAULT[id]; };

/* A panel's minimum is the largest minimum among its tabs (so switching tabs never forces a relayout). */
PMW.panelMin = function (layout, panel) {
  var w = PANEL_MIN.w, hh = PANEL_MIN.h;
  for (var i = 0; i < panel.tabs.length; i++) {
    var rec = layout.tabs[panel.tabs[i]];
    var k = rec && KINDS[rec.kind];
    if (k) { if (k.min.w > w) w = k.min.w; if (k.min.h > hh) hh = k.min.h; }
  }
  return { w: w, h: hh };
};

/* What a panel is "for": dedicated kind when every tab is one dedicated kind, else 'documents' (empty = documents). */
PMW.panelRole = function (layout, panel) {
  if (!panel.tabs.length) return 'documents';
  var kinds = {};
  for (var i = 0; i < panel.tabs.length; i++) { var r = layout.tabs[panel.tabs[i]]; if (r) kinds[r.kind] = 1; }
  var list = Object.keys(kinds);
  var dedicated = list.filter(function (k) { return PMW.isDedicatedKind(k) || k === 'output' || k === 'problems' || k === 'ports' || k === 'debug-console'; });
  if (dedicated.length === list.length) return list.length === 1 ? list[0] : 'tools';
  return 'documents';
};
PMW.panelHolds = function (layout, panel, kind) {
  for (var i = 0; i < panel.tabs.length; i++) { var r = layout.tabs[panel.tabs[i]]; if (r && r.kind === kind) return true; }
  return false;
};

/* The demo catalog: each kind lists what it can open (plans, documents, artifacts, runs, records, files, dashboards),
   so the "+" menu's pickers, Ctrl+P, the empty launcher and the stand-in chat all draw from one source (DRY).
   item = { id, label, sub, icon, spec } where spec is a PM_HOME.open spec (defaults to { id }). */
var CATALOG = {};
PM_HOME.catalog = {
  add: function (kind, items) {
    var list = CATALOG[kind] || (CATALOG[kind] = []);
    (items || []).forEach(function (it) {
      if (!it || !it.id) return;
      var at = list.findIndex(function (x) { return x.id === it.id; });
      var rec = Object.assign({ kind: kind }, it);
      if (at >= 0) list[at] = rec; else list.push(rec);
    });
    bus.emit('catalog', { kind: kind });
  },
  list: function (kind) { return (CATALOG[kind] || []).slice(); },
  all: function () { var out = []; Object.keys(CATALOG).forEach(function (k) { out = out.concat(CATALOG[k]); }); return out; },
  find: function (id) { var all = PM_HOME.catalog.all(); for (var i = 0; i < all.length; i++) if (all[i].id === id) return all[i]; return null; },
  open: function (id, extra) {
    var it = PM_HOME.catalog.find(id);
    var spec = Object.assign({}, it && it.spec ? it.spec : { id: id, kind: it ? it.kind : PM_HOME.kindOf(id) }, extra || {});
    if (it && !spec.label && it.label) spec.label = it.label;
    return PM_HOME.open(spec);
  }
};

/* a picker on PMW.menu over catalog items (kinds use it for their "+" rows: Plan or document..., Artifact...) */
PMW.catalogPicker = function (anchor, o) {
  var kinds = o.kinds || [o.kind];
  var sections = kinds.map(function (k) {
    var def = KINDS[k];
    return { label: kinds.length > 1 ? (def ? def.group : k) : null, rows: PM_HOME.catalog.list(k).map(function (it) {
      return { id: it.id, label: it.label, sub: it.sub || '', kind: it.icon || (def && def.icon) || 'file', keywords: it.keywords || '',
        run: function (info) { PM_HOME.catalog.open(it.id, { where: info.alt || o.newPanel ? 'panel' : (o.panelId || 'auto'), source: o.panelId, mode: 'keep' }); },
        alt: { label: 'Open in new panel', run: function () { PM_HOME.catalog.open(it.id, { where: 'panel', source: o.panelId, mode: 'keep' }); } } };
    }) };
  });
  // Never anchor to the centre: a menu ignores clicks inside its anchor, so a centre anchor would stay open over every
  // panel click (and swallow the panel shortcuts). Without an anchor it opens at a point near the centre's top left.
  var cr = PMW.state && PMW.state.centre ? PMW.state.centre.getBoundingClientRect() : { left: 0, top: 0 };
  return PMW.menu.open(anchor || null, { id: 'picker:' + kinds.join(','), title: o.title, search: { placeholder: o.placeholder || 'Find by name' },
    width: 360, sections: sections, empty: 'Nothing to open yet.', at: anchor ? null : { x: cr.left + 40, y: cr.top + 40 } });
};
