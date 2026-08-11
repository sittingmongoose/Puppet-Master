/* PMX registry — Opus 5
 * Window and thread concepts register here. Nothing else is global.
 * Contract: CONTRACT.md sections 1-4.
 */
(function (global) {
  'use strict';

  var windows = [];
  var threads = [];
  var windowById = {};
  var threadById = {};

  var REQUIRED_REGIONS = ['transcript', 'composerHost', 'headerTools', 'overlayRoot'];
  var OPTIONAL_REGIONS = ['threadHistory', 'workSurfaceHost', 'questionHost', 'artifactHost'];

  function validateDef(kind, id, def) {
    var problems = [];
    if (!id || !/^[wt][1-8]$/.test(id)) problems.push('id must be w1..w8 or t1..t8, got ' + id);
    if (!def || typeof def.mount !== 'function') problems.push('mount() is required');
    if (!def.name || typeof def.name !== 'string') problems.push('name is required');
    if (!def.blurb || typeof def.blurb !== 'string') problems.push('blurb is required');
    /* Contract section 8.1 and 8.3 apply to name/blurb because they are user-facing prose. */
    var prose = (def.name || '') + ' ' + (def.blurb || '');
    if (/[\u{1F000}-\u{1FAFF}\u{2600}-\u{27BF}\u{FE0F}\u{2190}-\u{21FF}\u{2B00}-\u{2BFF}]/u.test(prose)) {
      problems.push('name/blurb contains an emoji or pictograph');
    }
    if (/\b[a-z0-9]+_[a-z0-9]+\b/.test(prose)) {
      problems.push('name/blurb exposes an underscored internal label');
    }
    if (problems.length) {
      throw new Error('[pmx-registry] ' + kind + ' "' + id + '" invalid: ' + problems.join('; '));
    }
  }

  function registerWindow(id, def) {
    validateDef('window', id, def);
    if (windowById[id]) { console.warn('[pmx-registry] duplicate window id ' + id); return; }
    var rec = {
      id: id, kind: 'window',
      name: def.name, blurb: def.blurb,
      provides: def.provides || [],
      mount: def.mount
    };
    windowById[id] = rec;
    windows.push(rec);
    windows.sort(function (a, b) { return a.id.localeCompare(b.id); });
  }

  function registerThread(id, def) {
    validateDef('thread', id, def);
    if (threadById[id]) { console.warn('[pmx-registry] duplicate thread id ' + id); return; }
    var rec = {
      id: id, kind: 'thread',
      name: def.name, blurb: def.blurb,
      wants: def.wants || [],
      mount: def.mount
    };
    threadById[id] = rec;
    threads.push(rec);
    threads.sort(function (a, b) { return a.id.localeCompare(b.id); });
  }

  /* Called by compose.js right after window.mount(). Throws on a contract violation so
   * the 64-pairing mount smoke test catches it as a hard failure, not a visual surprise. */
  function validateWindowInstance(id, inst) {
    if (!inst || typeof inst !== 'object') {
      throw new Error('[pmx-registry] window "' + id + '" mount() returned nothing');
    }
    if (!inst.regions || typeof inst.regions !== 'object') {
      throw new Error('[pmx-registry] window "' + id + '" returned no regions map');
    }
    for (var i = 0; i < REQUIRED_REGIONS.length; i++) {
      var r = REQUIRED_REGIONS[i];
      var el = inst.regions[r];
      if (!el || el.nodeType !== 1) {
        throw new Error('[pmx-registry] window "' + id + '" required region "' + r + '" is missing');
      }
    }
    var fns = ['setWidth', 'setRail', 'setMount', 'update', 'destroy'];
    for (var j = 0; j < fns.length; j++) {
      if (typeof inst[fns[j]] !== 'function') {
        throw new Error('[pmx-registry] window "' + id + '" is missing ' + fns[j] + '()');
      }
    }
    return true;
  }

  function validateThreadInstance(id, inst) {
    if (!inst || typeof inst !== 'object') {
      throw new Error('[pmx-registry] thread "' + id + '" mount() returned nothing');
    }
    var fns = ['update', 'destroy', 'scrollToMessage', 'getAnchor', 'setAnchor', 'setExpanded'];
    for (var i = 0; i < fns.length; i++) {
      if (typeof inst[fns[i]] !== 'function') {
        throw new Error('[pmx-registry] thread "' + id + '" is missing ' + fns[i] + '()');
      }
    }
    return true;
  }

  /* Capabilities the window actually delivered, derived from real regions rather than
   * from the declared `provides` list, so a window cannot over-promise. */
  function capabilitiesOf(inst) {
    var caps = {};
    for (var i = 0; i < OPTIONAL_REGIONS.length; i++) {
      var r = OPTIONAL_REGIONS[i];
      caps[r] = !!(inst.regions[r] && inst.regions[r].nodeType === 1);
    }
    return caps;
  }

  global.PMX = global.PMX || {};
  global.PMX.window = { register: registerWindow, all: function () { return windows.slice(); }, get: function (id) { return windowById[id]; } };
  global.PMX.thread = { register: registerThread, all: function () { return threads.slice(); }, get: function (id) { return threadById[id]; } };
  global.PMX.registry = {
    validateWindowInstance: validateWindowInstance,
    validateThreadInstance: validateThreadInstance,
    capabilitiesOf: capabilitiesOf,
    REQUIRED_REGIONS: REQUIRED_REGIONS,
    OPTIONAL_REGIONS: OPTIONAL_REGIONS,
    pairs: function () {
      var out = [];
      for (var i = 0; i < windows.length; i++)
        for (var j = 0; j < threads.length; j++)
          out.push({ windowId: windows[i].id, threadId: threads[j].id });
      return out;
    }
  };
})(window);
