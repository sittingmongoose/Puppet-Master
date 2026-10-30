/* Persistence: the layout is saved per project in pm.home.panels:v1:<project> (the concept's stand-in for canon's
   home_workspace_layout.v2 record). Each mounted tab's serialize() is folded in at save time. Narrow states, overlays,
   peeks, drags and the live-only tab marks are never written. A record that fails validation is quarantined, never
   silently dropped.

   The key is bound to the project the layout was loaded for (persist.boundId), not read from the title bar on every
   save: the project menu changes its label without a reload, and a live key would write one project's tabs over the
   other's saved layout. A project switch saves to the old key, then loads the new project's layout (watchProject). */

var LAYOUT_KEY_PREFIX = 'pm.home.panels:v1:';
var QUARANTINE_PREFIX = 'pm.home.panels:quarantine:v1:';
var QUARANTINE_KEEP = 2;   // earlier quarantined records kept inside the one key (NUMBERS.md names a single key)
var saveTimer = 0;
var pendingQuarantine = null;   // a record that could not be set aside: the saved layout is left alone until it is

var persist = PMW.persist = {
  boundId: null,
  bind: function () { persist.boundId = projectId(); return persist.boundId; },
  key: function () { return LAYOUT_KEY_PREFIX + (persist.boundId || projectId()); },
  quarantineKey: function () { return QUARANTINE_PREFIX + (persist.boundId || projectId()); },
  snapshot: function () {
    var l = model.clone(PMW.state.layout);
    // fold in live tab state
    for (var id in l.tabs) {
      model.stripLive(l.tabs[id]);
      var inst = PMW.instances && PMW.instances[id];
      if (inst && inst.instance && typeof inst.instance.serialize === 'function') {
        try {
          var s = inst.instance.serialize();
          if (s !== undefined) {
            var raw = JSON.stringify(s);
            if (raw.length <= 16384) l.tabs[id].state = JSON.parse(raw);
            else try { console.warn('[pm-home] ' + l.tabs[id].kind + ' state over 16 KB was not saved'); } catch (_) {}
          }
        } catch (err) { try { console.error('[pm-home] serialize failed for a ' + l.tabs[id].kind + ' tab', err); } catch (_) {} }
      }
    }
    (l.closed || []).forEach(function (c) { model.stripLive(c && c.tab); });
    persist.capSaved(l);
    return { schema: model.SCHEMA, savedAt: Date.now(), layout: l };
  },
  /* Tabs Remembered Between Sessions (general.startup.max-persisted-tabs, SSYS-050; 04-settings.js reads the Settings
     row): the saved layout keeps at most this many tabs of every kind, the least recently used dropping first. Each
     panel's shown tab and every pinned tab stay; the open layout is not touched, only what is written */
  capSaved: function (l) {
    return persist.trim(l, +PMW.settings.get('panels.tabs.maxPersisted') || 50, function () { return true; });
  },
  /* the same caps on a layout read back, so a limit set since it was written holds from the first frame: Tabs
     Remembered Between Sessions, then Max Open Editor Tabs over its editor tabs (40-open.js holds it as tabs open) */
  capLoaded: function (l) {
    var n = persist.capSaved(l);
    return n + persist.trim(l, +PMW.settings.get('panels.tabs.maxEditors') || 25, function (t) { return l.tabs[t].kind === 'editor'; });
  },
  /* drop the least recently used of the tabs that count until at most max are left; a panel's shown tab and a pinned
     tab never go, so no panel is left empty */
  trim: function (l, max, counts) {
    var ids = Object.keys(l.tabs).filter(counts), over = ids.length - max;
    if (over <= 0) return 0;
    var keep = {};
    model.panels(l).forEach(function (p) { if (p.active) keep[p.active] = true; });
    var mru = (l.view && l.view.mru) || [];
    var rank = function (t) { var i = mru.indexOf(t); return i < 0 ? mru.length + ids.indexOf(t) : i; };
    var drop = ids.filter(function (t) { return !keep[t] && !l.tabs[t].pinned; }).sort(function (a, b) { return rank(b) - rank(a); }).slice(0, over);
    drop.forEach(function (t) {
      model.panels(l).forEach(function (p) { var i = p.tabs.indexOf(t); if (i >= 0) p.tabs.splice(i, 1); });
      delete l.tabs[t];
    });
    if (l.view && l.view.mru) l.view.mru = l.view.mru.filter(function (t) { return !!l.tabs[t]; });
    return drop.length;
  },
  save: function () {
    clearTimeout(saveTimer);
    if (PMW.state.ephemeral) return true;          // tour snapshots and tests can run without writing
    if (persist.boundId && projectId() !== persist.boundId) setTimeout(persist.checkProject, 0);   // a missed label change
    if (pendingQuarantine) {
      // the old record is still the only copy: retry setting it aside, and until that works this session is not
      // written (reporting success, so commits are not rolled back one by one)
      if (!persist.setAside(pendingQuarantine)) return true;
      pendingQuarantine = null;
    }
    return store.set(persist.key(), persist.snapshot());
  },
  saveSoon: function () {
    clearTimeout(saveTimer);
    saveTimer = setTimeout(function () { persist.save(); }, 250);
  },
  load: function () {
    // read the raw text: a record that is not valid JSON is quarantined too, not mistaken for "nothing saved"
    var raw = store.raw(persist.key());
    if (raw == null) return null;
    var rec;
    try { rec = JSON.parse(raw); } catch (_) { persist.quarantine(raw, 'unreadable'); return null; }
    var l = rec && rec.layout;
    if (!l || l.schema !== model.SCHEMA) { persist.quarantine(rec, 'schema'); return null; }
    try { model.normalize(l); } catch (_) { persist.quarantine(rec, 'normalize'); return null; }
    var problems = model.validate(l);
    if (problems.length) { persist.quarantine(rec, problems.join('; ')); return null; }
    // records written before the marks were stripped
    for (var id in l.tabs) model.stripLive(l.tabs[id]);
    l.closed.forEach(function (c) { model.stripLive(c && c.tab); });
    l.view.maximized = l.view.maximized || null;
    persist.capLoaded(l);
    return l;
  },
  /* Copy a record to the quarantine key (keeping the earlier ones), then remove the original. Returns false, and
     removes nothing, when the copy could not be written. */
  setAside: function (entry) {
    var prior = store.get(persist.quarantineKey());
    if (prior && prior.record !== undefined) {
      var earlier = [{ at: prior.at, reason: prior.reason, record: prior.record }].concat(prior.earlier || []);
      entry = Object.assign({}, entry, { earlier: earlier.slice(0, QUARANTINE_KEEP) });
    }
    if (!store.set(persist.quarantineKey(), entry)) return false;
    store.remove(persist.key());
    return true;
  },
  quarantine: function (rec, reason) {
    var entry = { at: Date.now(), reason: reason, record: rec };
    if (persist.setAside(entry)) {
      pendingQuarantine = null;
      PMW.toast && PMW.toast('Your saved layout could not be read, so Home opened with the default layout. The old one is kept.');
      return true;
    }
    pendingQuarantine = entry;
    PMW.toast && PMW.toast('Your saved layout could not be read, and there was no room to set it aside. It is still stored, so changes to the layout are not saved until there is room.');
    return false;
  },
  clear: function () { store.remove(persist.key()); },

  /* 'chat.width', 'chat.history' and 'chat.pinOpen' were panels settings until 2026-10-11 and 2026-10-10; they are now
     the layout record's chat column (canon's v2 chat_column, SSYS-050: none is a Settings value): width_px (committed
     by resize_surface { surface: 'chat', width }), history_pinned (ui.chat_column.pin_history) and keep_open
     (ui.chat_column.keep_open), 46-chat.js. Once, at boot: a stored width (a finite number, rounded into 400-760),
     'pinned' and true are carried into this project's layout and into every other project's saved layout (the settings
     were one for all projects), each only where that record still holds the field's default, so a value written since
     is never overwritten; only when this project's layout is written are the keys dropped from pm.home.settings:v1, so
     nothing is carried twice or lost to a failed write. While this project's unreadable record waits to be set aside
     nothing is carried or dropped (next time). A stored default (null, 'flyout', false) or a value of the wrong kind is
     just dropped. Returns the fields carried ({} when none). */
  migrateChatColumn: function () {
    var OLD = [
      ['chat.width', 'width_px', function (v) { return model.chatWidth(v); }],
      ['chat.history', 'history_pinned', function (v) { return v === 'pinned' ? true : null; }],
      ['chat.pinOpen', 'keep_open', function (v) { return v === true ? true : null; }]
    ];
    var present = OLD.filter(function (o) { return Object.prototype.hasOwnProperty.call(settingsValues, o[0]); });
    if (!present.length) return {};
    var carry = {};
    present.forEach(function (o) { var v = o[2](settingsValues[o[0]]); if (v != null) carry[o[1]] = v; });
    var fields = Object.keys(carry);
    function fill(l) {
      var cc = model.chatColumn(l.chat_column), changed = false;
      fields.forEach(function (f) { if (cc[f] === model.chatColumn(null)[f]) { cc[f] = carry[f]; changed = true; } });
      l.chat_column = cc;
      return changed;
    }
    if (fields.length) {
      if (!state.layout) return {};
      // this project's unreadable record could not be set aside yet, so it is not written now: carry them next time
      if (pendingQuarantine) return {};
      fill(state.layout);
      try {
        var keys = [];
        for (var i = 0; i < localStorage.length; i++) keys.push(localStorage.key(i));
        keys.forEach(function (k) {
          if (!k || k.indexOf(LAYOUT_KEY_PREFIX) !== 0 || k === persist.key()) return;
          var rec = store.get(k);
          if (!rec || !rec.layout || rec.layout.schema !== model.SCHEMA) return;
          if (fill(rec.layout)) store.set(k, rec);
        });
      } catch (_) {}
      if (!persist.save()) return {};
    }
    present.forEach(function (o) { settings.set(o[0], null); });
    return carry;
  },

  /* Saved named layouts name their tabs by id (14-layouts.js, SAVED_KEY): an id a kind folds now
     (debug-console:<session>, D33) is rewritten, once at boot, to the one tab it names, so that tab still goes back to
     its own panel and stays the panel's active tab when the layout is applied. Returns whether anything was rewritten. */
  foldSaved: function () {
    var all = store.get(SAVED_KEY);
    if (!all || typeof all !== 'object') return false;
    var changed = false;
    function folded(id) { var f = PMW.foldId(id); if (f) changed = true; return f ? f.id : id; }
    function fix(n) {
      if (!n || typeof n !== 'object') return;
      if (n.slot) {
        if (Array.isArray(n.tabs)) {
          var seen = {};
          n.tabs = n.tabs.map(folded).filter(function (id) { if (seen[id]) return false; seen[id] = 1; return true; });
        }
        if (typeof n.active === 'string') n.active = folded(n.active);
        return;
      }
      (n.kids || []).forEach(fix);
    }
    Object.keys(all).forEach(function (name) { if (all[name] && all[name].tree) fix(all[name].tree); });
    return changed ? store.set(SAVED_KEY, all) : false;
  },

  /* A project switch: flush the layout to the project it belongs to, then show the new project's own layout (or the
     default). The swap is one restore command that is not written again (the new layout came from its own key). */
  /* A layout for a project that has none saved: the named layout Settings picks, with the chat column's History pin
     seeded from Settings' History list default (general.interaction.chat-history-list, Pinned or Flyout, through the
     5.6 Pro chat port's PM_CHAT_SETTINGS when the page has it). Only here: a saved layout, an explicit false included,
     is never reseeded, and the model's own default (false) stays the record's default. */
  fresh: function () {
    var name = PMW.settings.get('panels.layout.named') || 'home';
    var l = PMW.buildNamed(PMW.NAMED[name] ? name : 'home', null);
    try {
      var CS = window.PM_CHAT_SETTINGS, v = CS && typeof CS.values === 'function' ? CS.values() : null;
      var hist = v ? v['general.interaction.chat-history-list'] : null;
      if (l && typeof hist === 'string' && /^pinned$/i.test(hist)) {
        l.chat_column = Object.assign(model.chatColumn(l.chat_column), { history_pinned: true });
      }
    } catch (err) { try { console.error('[pm-home] the History default could not be read', err); } catch (_) {} }
    return l;
  },
  checkProject: function () {
    var now = projectId(), was = persist.boundId;
    if (!was || now === was || !PMW.state.layout) return false;
    persist.save();
    pendingQuarantine = null;              // a pending set-aside belongs to the old project's key
    persist.boundId = now;
    var next = persist.load();
    if (!next) next = persist.fresh();
    var res = next ? commit(CMD.restore, { source: 'project_switch' }, function (d) {
      for (var k in d) delete d[k];
      Object.assign(d, model.clone(next));
      return {};
    }, { persist: false, animate: false }) : { ok: false };
    if (!res.ok) { persist.boundId = was; return false; }   // keep writing to the project this layout belongs to
    return true;
  },
  watchProject: function () {
    var label = qs('#projectMenuLabel');
    if (!label || typeof MutationObserver !== 'function') return;
    new MutationObserver(function () { persist.checkProject(); })
      .observe(label, { characterData: true, childList: true, subtree: true });
  }
};
window.addEventListener('pagehide', function () { try { if (PMW.state && PMW.state.layout) persist.save(); } catch (_) {} });
