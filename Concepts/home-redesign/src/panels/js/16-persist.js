/* Persistence: the layout is saved per project in pm.home.panels:v1:<project> (the concept's stand-in for canon's
   home_workspace_layout.v2 record). Each mounted tab's serialize() is folded in at save time. Narrow states, overlays,
   peeks and drags are never written. A record that fails validation is quarantined, never silently dropped. */

var LAYOUT_KEY_PREFIX = 'pm.home.panels:v1:';
var QUARANTINE_PREFIX = 'pm.home.panels:quarantine:v1:';
var saveTimer = 0;

var persist = PMW.persist = {
  key: function () { return LAYOUT_KEY_PREFIX + projectId(); },
  snapshot: function () {
    var l = model.clone(PMW.state.layout);
    // fold in live tab state
    for (var id in l.tabs) {
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
    return { schema: model.SCHEMA, savedAt: Date.now(), layout: l };
  },
  save: function () {
    clearTimeout(saveTimer);
    if (PMW.state.ephemeral) return true;          // tour snapshots and tests can run without writing
    return store.set(persist.key(), persist.snapshot());
  },
  saveSoon: function () {
    clearTimeout(saveTimer);
    saveTimer = setTimeout(function () { persist.save(); }, 250);
  },
  load: function () {
    var rec = store.get(persist.key());
    if (!rec) return null;
    var l = rec && rec.layout;
    if (!l || l.schema !== model.SCHEMA) { persist.quarantine(rec, 'schema'); return null; }
    try { model.normalize(l); } catch (_) { persist.quarantine(rec, 'normalize'); return null; }
    var problems = model.validate(l);
    if (problems.length) { persist.quarantine(rec, problems.join('; ')); return null; }
    l.view.maximized = l.view.maximized || null;
    return l;
  },
  quarantine: function (rec, reason) {
    store.set(QUARANTINE_PREFIX + projectId(), { at: Date.now(), reason: reason, record: rec });
    store.remove(persist.key());
    PMW.toast && PMW.toast('Your saved layout could not be read, so Home opened with the default layout. The old one is kept.');
  },
  clear: function () { store.remove(persist.key()); }
};
window.addEventListener('pagehide', function () { try { if (PMW.state && PMW.state.layout) persist.save(); } catch (_) {} });
