/* PMX editor host — Opus 5
 *
 * Routing only. Artifacts and browser previews open in editor tabs; this module never
 * redesigns the editor, browser, or file explorer internals — that boundary belongs to
 * File Manager, and the chat concept only owns the source interaction and the routing.
 *
 * Opening an artifact does NOT remove it from the thread, does NOT require an active or
 * open visual state on the message, and keeps working when the source message is outside
 * the rendered viewport, because tabs live here rather than on the message.
 */
(function (global) {
  'use strict';

  var tabs = [];
  var activeId = null;
  var subs = [];

  function notify() {
    var list = subs.slice();
    for (var i = 0; i < list.length; i++) { try { list[i](tabs.slice(), activeId); } catch (e) {} }
  }

  function find(id) {
    for (var i = 0; i < tabs.length; i++) if (tabs[i].id === id) return tabs[i];
    return null;
  }

  function open(tab, ctx) {
    var existing = find(tab.id);
    if (existing) {
      activeId = existing.id;
      notify();
      if (ctx && ctx.services.toast) ctx.services.toast.show('Focused ' + existing.title);
      return existing;
    }
    tabs.push(tab);
    activeId = tab.id;
    notify();
    if (ctx && ctx.services.toast) {
      ctx.services.toast.show('Opened ' + tab.title + ' in an editor tab');
    }
    return tab;
  }

  /* Re-pointed at the artifact workspace. Every existing caller — the Context Ring's More
   * details, and the artifact links in t1..t4 — used to reach a registry that only ever fired
   * a toast, so "open artifact" was observably nothing. Opening is identity-native, so a
   * caller may pass either the record or a bare id. */
  function openArtifact(artifact, ctx) {
    var id = artifact && artifact.id ? artifact.id : artifact;
    if (global.PMXArtifacts && id && global.PMXArtifacts.get(id)) {
      global.PMXArtifacts.open(id);
      return { id: id, title: (global.PMXArtifacts.get(id) || {}).title };
    }
    return legacyOpenArtifact(artifact, ctx);
  }

  function legacyOpenArtifact(artifact, ctx) {
    if (!artifact) return null;
    return open({
      id: 'artifact:' + (artifact.id || artifact.projectPath || artifact.title),
      kind: 'artifact',
      title: artifact.title || artifact.projectPath || 'Artifact',
      projectPath: artifact.projectPath || null,
      artifactKind: artifact.kind || null,
      /* The group id lets related artifacts from one response be presented together
       * without inventing a second tab per file. */
      group: artifact.group || null
    }, ctx);
  }

  function openBrowser(session, ctx) {
    if (!session) return null;
    return open({
      id: 'browser:' + (session.id || session.title),
      kind: 'browser',
      title: session.title || 'Browser preview',
      currentPage: session.currentPage || null,
      pagesVisited: session.pagesVisited || 0,
      screenshots: session.screenshots || 0,
      status: session.status || null
    }, ctx);
  }

  function close(id) {
    for (var i = 0; i < tabs.length; i++) {
      if (tabs[i].id === id) {
        tabs.splice(i, 1);
        if (activeId === id) activeId = tabs.length ? tabs[tabs.length - 1].id : null;
        notify();
        return true;
      }
    }
    return false;
  }

  function focus(id) {
    if (!find(id)) return false;
    activeId = id;
    notify();
    return true;
  }

  global.PMXEditorHost = {
    openArtifact: openArtifact,
    openBrowser: openBrowser,
    tabs: function () { return tabs.slice(); },
    active: function () { return activeId; },
    focus: focus,
    close: close,
    subscribe: function (fn) {
      subs.push(fn);
      return function () { var i = subs.indexOf(fn); if (i >= 0) subs.splice(i, 1); };
    },
    reset: function () { tabs = []; activeId = null; notify(); }
  };
})(window);
