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
    return { schema: model.SCHEMA, savedAt: Date.now(), layout: l };
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
    var raw = null;
    try { raw = localStorage.getItem(persist.key()); } catch (_) { raw = null; }
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

  /* A project switch: flush the layout to the project it belongs to, then show the new project's own layout (or the
     default). The swap is one restore command that is not written again (the new layout came from its own key). */
  checkProject: function () {
    var now = projectId(), was = persist.boundId;
    if (!was || now === was || !PMW.state.layout) return false;
    persist.save();
    pendingQuarantine = null;              // a pending set-aside belongs to the old project's key
    persist.boundId = now;
    var next = persist.load();
    if (!next) {
      var name = PMW.settings.get('panels.layout.named') || 'home';
      next = PMW.buildNamed(PMW.NAMED[name] ? name : 'home', null);
    }
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
