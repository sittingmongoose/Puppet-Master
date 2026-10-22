/* pm7-port/js/61-surfaces-runs.js: close and activate events back to the chat (Home CONTRACT 6.1; Chat updates.md
   "one control set", 7.12). While a run's view is the active tab of any Home panel, its card in the chat says
   "Deciding in the panel beside the chat" (Review: "Choosing in the report beside the chat") instead of its controls;
   they come back when the view stops being active (another tab chosen, the tab closed, its panel collapsed).
   Every run owner asks window.PM56_PMX.viewOpen(runId) (collaboration, review, room, brainstorm protocols). In hosted
   mode it answers from PM_HOME.tabs(): any panel's active tab, not only the focused panel's, as the stand-in did. The
   chat repaints once per frame when the set of active run views changes, so the cards follow without a reload. */
(function () {
  'use strict';
  var W = window;
  var RUN_PREFIXES = ['collab-run:', 'crew-work:', 'review:', 'room:', 'brainstorm:'];

  function home() { return W.PM_HOME && typeof W.PM_HOME.tabs === 'function' ? W.PM_HOME : null; }
  function runOf(tabId) {
    tabId = String(tabId || '');
    for (var i = 0; i < RUN_PREFIXES.length; i++) if (tabId.indexOf(RUN_PREFIXES[i]) === 0) return tabId.slice(RUN_PREFIXES[i].length);
    return null;
  }
  /* the runs whose view is the active tab of a panel now */
  function activeRuns() {
    var H = home(), out = {};
    if (!H) return out;
    var tabs = [];
    try { tabs = H.tabs() || []; } catch (_) { tabs = []; }
    tabs.forEach(function (t) { if (t.active) { var r = runOf(t.tabId); if (r) out[r] = true; } });
    return out;
  }
  function signature(map) { return Object.keys(map).sort().join('\u0001'); }

  var wrapped = false;
  function wrapViewOpen() {
    var X = W.PM56_PMX;
    if (wrapped || !X || typeof X.viewOpen !== 'function') return !!wrapped;
    var inner = X.viewOpen;
    X.viewOpen = function (runId) {
      if (runId == null) return false;
      if (home()) return !!activeRuns()[String(runId)];
      return inner.apply(this, arguments);
    };
    X.viewOpen._pm56Hosted = true;
    wrapped = true;
    return true;
  }

  var last = '', queued = false;
  function repaintSoon() {
    if (queued) return;
    queued = true;
    (W.requestAnimationFrame || setTimeout)(function () {
      queued = false;
      var sig = signature(activeRuns());
      if (sig === last) return;
      last = sig;
      var A = W.PM56_APP;
      if (A && typeof A.render === 'function') { try { A.render(); } catch (err) { try { console.error('[pm56-surfaces] repaint failed', err); } catch (_) {} } }
    });
  }

  var bound = false;
  function bind() {
    var H = home();
    if (bound || !H || typeof H.on !== 'function') return false;
    bound = true;
    ['activate', 'close', 'open', 'layout', 'narrow'].forEach(function (ev) { try { H.on(ev, repaintSoon); } catch (_) {} });
    last = signature(activeRuns());
    return true;
  }

  /* PM_HOME and PM56_PMX may arrive after this file (the Home layer boots, the chat boots): try now, then a few times */
  var tries = 0;
  (function attempt() {
    var ok1 = wrapViewOpen(), ok2 = bind();
    if ((ok1 && ok2) || ++tries > 200) return;
    setTimeout(attempt, 50);
  })();

  var SF = W.PM56_SURFACES = W.PM56_SURFACES || {};
  SF.activeRuns = function () { return Object.keys(activeRuns()); };
})();
