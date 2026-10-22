/* pm7-port/js/60-surfaces.js: the surfaces lane's core (port CONTRACT "Lanes", surfaces). Every panel the 5.6 Pro chat
   opens with openEditor(id) opens in PMConcept7's Home panel system as the right tab kind, under the open rules
   (Concepts/home-redesign/CONTRACT.md section 6 rules 1-5; DECISIONS.md D7, D8, D9, D27).

   The foundation's hosted openEditor / closeEditor call PM56_SURFACES.open(id, { label, render, by, background, event })
   and PM56_SURFACES.close(id) first; a non-null return means handled. Here:
   - route(id): the id -> Home kind table (TABLE below, also PM56_SURFACES.table for tests and the report). Plan aliases
     resolve to their one plan:<id> tab (rule 1). Ids whose Home kind is the canonical surface open that kind's own
     drawing and get no chat renderer: file: is the Home code editor in diff view at the change's line (audit section 3
     row 4), link: is a Home Browser tab (row 9). Every other id keeps the chat's own drawing (render) inside its kind.
     goal-artifact opens no tab (DL-147: Goal lives in Activity Detail); the lab-only workspaces open as documents so a
     guided example that still names one never dead-ends.
   - who opened it (D8): a click, a double click or Enter/Space on a chat control (scripted guide presses included) is
     the person: the tab opens and takes focus, Alt+click opens a new panel, Ctrl/Cmd+click opens it in the background.
     An open with no such gesture (a timer, a reply, a demo step, the send path) is the assistant's: a background tab
     with the hollow square, never focus.
   - files (D7): single click previews, double click (or Enter) keeps, Alt+click a new panel, Ctrl/Cmd+click behind; an
     agent's file open is kept, in the background.
   - narrow (rule 5): Home turns a new panel into the next panel of the switcher; a person's open from a chat opened
     over the centre (its folded strip) puts the chat back to its strip so the tab is in view.
   Nothing here edits the chat's modules; it reads window.PM56_APP, PM56_DATA, PM56_PLANS and PM56_ARTIFACTS. */
(function () {
  'use strict';
  var W = window;
  var SF = W.PM56_SURFACES = W.PM56_SURFACES || {};
  var ASSISTANT = 'Assistant';
  var GESTURE_MS = 450;   // an open the chat deferred a frame or two after the click that asked for it is that click's
  var LOG_MAX = 80;

  function home() { return W.PM_HOME && typeof W.PM_HOME.open === 'function' ? W.PM_HOME : null; }
  function pmw() { return W.PMW || null; }
  function app() { return W.PM56_APP || null; }
  function data() { return W.PM56_DATA || {}; }
  function chatState() { var a = app(); return a && a.state ? a.state : null; }
  function str(v) { return v == null ? '' : String(v); }
  function dec(s) { try { return decodeURIComponent(s); } catch (_) { return s; } }
  function starts(id, pre) { return str(id).indexOf(pre) === 0; }
  function now() { return W.performance && performance.now ? performance.now() : Date.now(); }

  /* ---- the id -> kind table ----
     { match, exact, kind, icon, label, body, note }; body: 'chat' = the chat's own drawing in the kind's frame,
     'home' = the Home kind's own drawing, 'none' = no tab. The first row that matches wins. */
  var TABLE = [
    { match: 'goal-artifact', exact: true, kind: null, body: 'none', note: 'DL-147: Goal lives in Activity Detail, no tab' },
    { match: 'file:', kind: 'editor', icon: 'file', body: 'home', note: 'D7; the Home code editor, diff view at the change line' },
    { match: 'link:', kind: 'browser', icon: 'browser', body: 'home', note: 'a Home Browser tab on the fetched page’s fixture' },
    { match: 'plan-query', exact: true, kind: 'plan', icon: 'plan', body: 'chat', note: 'alias: one plan:<id> tab' },
    { match: 'plan:', kind: 'plan', icon: 'plan', body: 'chat', note: 'Plan viewer with its sticky Build / Revise / More footer' },
    { match: 'deep-discovery:', kind: 'plan', icon: 'plan', body: 'chat', label: 'Deep Plan · discovery', note: 'Plan viewer, discovery' },
    { match: 'artifact-revision:', kind: 'artifact', icon: 'artifact', body: 'chat', note: 'the exact artifact version' },
    { match: 'artifact:', kind: 'artifact', icon: 'artifact', body: 'chat', note: 'Home artifact ids' },
    { match: 'attachment:', kind: 'artifact', icon: 'artifact', body: 'chat', note: 'an attachment’s Open; was a modal dialog' },
    { match: 'thread-', kind: 'transcript', icon: 'transcript', body: 'chat', note: 'a child agent’s read-only live feed' },
    { match: 'collab-run:', kind: 'run', icon: 'run', body: 'chat', note: 'Run view; Home folds it into the run’s own id' },
    { match: 'crew-work:', kind: 'run', icon: 'crew', body: 'chat' },
    { match: 'review-evidence:', kind: 'run', icon: 'review', body: 'chat', label: 'Review evidence' },
    { match: 'review:', kind: 'run', icon: 'review', body: 'chat' },
    { match: 'room:', kind: 'run', icon: 'room', body: 'chat' },
    { match: 'brainstorm-evidence:', kind: 'run', icon: 'brainstorm', body: 'chat', label: 'BrainStorm evidence' },
    { match: 'brainstorm:', kind: 'run', icon: 'brainstorm', body: 'chat', label: 'BrainStorm' },
    { match: 'teach:', kind: 'document', icon: 'document', body: 'chat', label: 'Your rules' },
    { match: 'memory:', kind: 'document', icon: 'document', body: 'chat', label: 'Gist Review' },
    { match: 'revert:', kind: 'document', icon: 'document', body: 'chat', label: 'Revert · files' },
    { match: 'debug:', kind: 'document', icon: 'document', body: 'chat' },
    { match: 'lens-source:', kind: 'document', icon: 'document', body: 'chat', label: 'Lens source' },
    { match: 'lens-effective:', kind: 'document', icon: 'document', body: 'chat', label: 'What it would read' },
    { match: 'wonderer:', kind: 'document', icon: 'document', body: 'chat', label: 'Wonderer’s leads' },
    { match: 'wonder-source:', kind: 'document', icon: 'document', body: 'chat', label: 'Wonderer · source' },
    { match: 'doc:', kind: 'document', icon: 'document', body: 'chat' },
    { match: 'search:', kind: 'record', icon: 'record', body: 'chat' },
    { match: 'mcp:', kind: 'record', icon: 'record', body: 'chat' },
    { match: 'app:', kind: 'record', icon: 'record', body: 'chat', label: 'Database inspector' },
    { match: 'work-record:', kind: 'record', icon: 'record', body: 'chat' },
    { match: 'context:', kind: 'context', icon: 'context', body: 'chat', note: 'thread-scoped context detail (Curated / Raw); was the window-right drawer' },
    /* lab-only workspaces (Home CONTRACT section 2 retires them as kinds): a guided example that still opens one gets
       a document tab with the chat's drawing rather than nothing */
    { match: 'order-export:', kind: 'document', icon: 'document', body: 'chat', lab: true, label: 'Order export' },
    { match: 'b16-work:', kind: 'document', icon: 'document', body: 'chat', lab: true, label: 'Customer deliverables' },
    { match: 'b17-work:', kind: 'document', icon: 'document', body: 'chat', lab: true, label: 'Recovery workspace' },
    { match: 'bsd12-work:', kind: 'document', icon: 'document', body: 'chat', lab: true, label: 'Example unavailable' },
    { match: 'bsd12:', kind: 'document', icon: 'document', body: 'chat', lab: true },
    { match: 'eli5-evidence:', kind: 'document', icon: 'document', body: 'chat', lab: true }
  ];
  var ARTIFACT_ROW = { match: '(a chat artifact id)', kind: 'artifact', icon: 'artifact', body: 'chat', note: 'PM56_DATA.artifacts, passed with kind artifact' };
  var UNKNOWN_ROW = { match: '(any other id)', kind: 'document', icon: 'document', body: 'chat', note: 'a document with the chat’s drawing' };
  SF.table = TABLE.concat([ARTIFACT_ROW, UNKNOWN_ROW]);

  function tableRow(id) {
    for (var i = 0; i < TABLE.length; i++) {
      var r = TABLE[i];
      if (r.exact ? id === r.match : starts(id, r.match)) return r;
    }
    return null;
  }
  function chatArtifact(id) {
    var list = data().artifacts || [];
    for (var i = 0; i < list.length; i++) if (list[i] && list[i].id === id) return list[i];
    return null;
  }
  /* plan aliases: plan-query (and any artifact id plans.js maps) names one plan:<id> tab */
  function planIdOf(id) {
    var P = W.PM56_PLANS;
    if (P && typeof P.editorPlanId === 'function') { try { return P.editorPlanId(id) || null; } catch (_) { return null; } }
    return starts(id, 'plan:') ? id.slice(5) : null;
  }

  /* route(id) -> { input, id, kind, icon, body, label, row, special } */
  function route(id) {
    id = str(id);
    var out = { input: id, id: id, kind: null, icon: null, body: 'chat', label: null, row: null, special: null };
    if (!id) { out.body = 'none'; return out; }
    var pid = planIdOf(id);
    if (pid) {
      out.id = 'plan:' + pid;
      out.row = tableRow('plan:');
      out.kind = 'plan'; out.icon = 'plan';
      return out;
    }
    var row = tableRow(id) || (chatArtifact(id) ? ARTIFACT_ROW : UNKNOWN_ROW);
    out.row = row;
    out.kind = row.kind;
    out.icon = row.icon || null;
    out.body = row.body;
    out.label = row.label || null;
    if (id === 'goal-artifact') out.special = 'goal';
    else if (row.match === 'file:') out.special = 'file';
    else if (row.match === 'link:') out.special = 'link';
    return out;
  }
  SF.route = route;

  /* slot labels can come back HTML-escaped (artifact-revisions.js escapes its label) */
  function decodeEntities(s) {
    if (s.indexOf('&') < 0) return s;
    var t = document.createElement('textarea');
    t.innerHTML = s;
    return t.value;
  }
  /* the chat's own label for an id (editorTabLabel and the module slots), else null */
  function chatLabel(id, given) {
    if (typeof given === 'function') { try { given = given(id); } catch (_) { given = null; } }
    if (given && given !== 'Untitled') return decodeEntities(str(given));
    var a = app();
    if (a && typeof a.editorTabLabel === 'function') {
      try { var l = a.editorTabLabel(id); if (l && l !== 'Untitled') return decodeEntities(str(l)); } catch (_) {}
    }
    return null;
  }
  /* the label a tab should carry (the foundation's tab body asks this before it pushes one): the chat's own label,
     else the table's word for the id's kind of document; null when neither knows it (the push is skipped) */
  SF.labelFor = function (id) {
    var r = route(id);
    if (r.special === 'link') { var lp = linkParts(r.id); return lp.title || lp.host || null; }
    if (r.special === 'file') return r.id.slice(5).split('/').pop() || null;
    return chatLabel(r.input) || (r.id !== r.input ? chatLabel(r.id) : null) || r.label || null;
  };
  function linkParts(id) {
    var rest = str(id).slice(5), pipe = rest.indexOf('|');
    return { host: dec(pipe < 0 ? rest : rest.slice(0, pipe)), title: pipe < 0 ? '' : dec(rest.slice(pipe + 1)) };
  }

  /* ---- who opened it (D8) and how (D7) ---- */
  var lastGesture = null, forced = null;
  var CLICKISH = { click: 1, dblclick: 1, auxclick: 1, pointerup: 1, mouseup: 1 };
  function isKeyOpen(e) { return !!e && e.type === 'keydown' && (e.key === 'Enter' || e.key === ' '); }
  /* the send path is the assistant answering the person, not the person opening something (D8) */
  function isSendPath(target) {
    if (!target || !target.closest) return false;
    if (target.closest('[data-action="send"], [data-action="send-now"], [data-action="queue-send"]')) return true;
    var ta = target.closest('textarea, [contenteditable="true"]');
    return !!(ta && ta.closest('.pm56-host'));
  }
  function fromEvent(e) {
    var g = { type: e.type, t: now(), target: e.target || null, alt: !!e.altKey, ctrl: !!e.ctrlKey, meta: !!e.metaKey,
      detail: e.detail || 0, key: e.key || null, trusted: !!e.isTrusted };
    // a button's click that a keyboard Enter made (detail 0, right after the keydown on the same control) is that Enter
    if (e.type === 'click' && !g.detail && lastEnter && now() - lastEnter.t < 120 && (lastEnter.target === e.target ||
        (lastEnter.target && lastEnter.target.contains && lastEnter.target.contains(e.target)))) g.enter = true;
    return g;
  }
  var lastEnter = null;   // a keyboard Enter, whose click (detail 0) follows it: D7 opens a file kept on Enter
  function remember(e) {
    if (e.type === 'keydown' && e.key === 'Enter') lastEnter = { t: now(), target: e.target };
    if (CLICKISH[e.type] || isKeyOpen(e)) lastGesture = fromEvent(e);
  }
  ['click', 'dblclick', 'auxclick', 'keydown'].forEach(function (t) { document.addEventListener(t, remember, true); });

  /* A recorded example (PM56_RECPLAY) plays the person's part: what one of its beats opens is the person's open, shown
     and in front, as every open is in the standalone the examples were recorded on (a start beat runs its action with
     an undispatched Event, which leaves no gesture: the Debug examples' document opened behind, and their next press
     found nothing). An open that names an agent stays the agent's. */
  var beats = 0;
  function wrapRecorded() {
    var R = W.PM56_RECPLAY;
    if (!R || typeof R.play !== 'function') return false;
    if (R.play._pm56) return true;
    var play = R.play;
    R.play = function (o) {
      if (o && typeof o.next === 'function') {
        var next = o.next;
        o = Object.assign({}, o, { next: function () {
          var b = next.apply(this, arguments);
          if (!b || typeof b.run !== 'function' || b._pm56Beat) return b;
          var run = b.run;
          return Object.assign({}, b, { _pm56Beat: true, run: function () { beats += 1; try { return run.apply(this, arguments); } finally { beats -= 1; } } });
        } });
      }
      return play.call(this, o);
    };
    R.play._pm56 = true;
    return true;
  }
  wrapRecorded();

  /* the gesture behind an open now: the event being dispatched, else one from just before (an open the chat deferred
     a frame), else a recorded example's beat; null when nothing a person did asked for it */
  function gesture(o) {
    if (forced) return forced.agent ? null : forced.g;
    var e = (o && o.event) || W.event;
    var g = null;
    if (e && (CLICKISH[e.type] || isKeyOpen(e))) g = fromEvent(e);
    else if (!e && lastGesture && now() - lastGesture.t < GESTURE_MS) g = lastGesture;
    if (!g && beats > 0) g = { type: 'click', t: now(), target: null, alt: false, ctrl: false, meta: false, detail: 1, key: null, trusted: false, recorded: true };
    if (!g || isSendPath(g.target)) return null;
    return g;
  }
  SF.gesture = gesture;

  /* { user, by, background, where, mode } for an open of route r */
  function how(r, o, g) {
    o = o || {};
    var given = str(o.by);
    var agent = /^agent:/.test(given) ? given.slice(6) : null;
    var res = { user: true, by: 'user', background: false, where: undefined, mode: undefined };
    if (agent || !g) {
      res.user = false;
      res.by = 'agent:' + (agent || ASSISTANT);
      res.background = true;
      if (r.special === 'file') res.mode = 'keep';
      return res;
    }
    if (g.alt) res.where = 'panel';
    if (g.ctrl || g.meta || o.background === true) res.background = true;
    var keep = g.detail >= 2 || g.type === 'dblclick' || g.enter || (g.type === 'keydown' && g.key === 'Enter');
    if (r.special === 'file') res.mode = keep ? 'keep' : 'preview';
    else if (keep) res.mode = 'keep';
    return res;
  }

  /* ---- the Home spec for an id ---- */
  function changeOf(path) {
    var list = data().changes || [];
    for (var i = 0; i < list.length; i++) if (list[i] && list[i].path === path) return list[i];
    return null;
  }
  function fileLine(path) {
    var st = chatState();
    var f = st && st.fileFocus && st.fileFocus[path];
    if (f != null && isFinite(+f) && +f > 0) return Math.floor(+f);
    var ch = changeOf(path);
    return ch && ch.line ? ch.line : undefined;
  }
  /* the chat's own body for an id, painted by the chat into the host-owned tab body (PM56_HOST.mountChatBody) */
  function chatRender(chatId) {
    return function (body) {
      var A = W.PM56_HOST && typeof PM56_HOST.app === 'function' ? PM56_HOST.app() : null;
      if (A && typeof A.paintBody === 'function') A.paintBody(body, chatId);
    };
  }
  function specFor(id, o, g) {
    o = o || {};
    var r = route(id);
    if (r.body === 'none') return { route: r, spec: null, how: null };
    var hw = how(r, o, g);
    var spec;
    if (r.special === 'file') {
      var path = r.id.slice(5);
      spec = { kind: 'editor', path: path, by: hw.by, mode: hw.mode || 'preview' };
      var line = fileLine(path);
      if (line) spec.line = line;
      // a changed file opens in the editor's diff view, as the chat's own file tab did; it stays a preview (D7)
      if (changeOf(path)) spec.view = 'diff';
    } else {
      spec = { id: r.id, kind: r.kind, by: hw.by };
      if (r.special === 'link') {
        var lp = linkParts(r.id);
        spec.label = lp.title || lp.host || 'Fetched page';
      } else {
        spec.label = chatLabel(r.input, o.label) || (r.id !== r.input ? chatLabel(r.id) : null) || r.label || null;
        if (r.body === 'chat') spec.render = typeof o.render === 'function' ? o.render : chatRender(r.input);
      }
      if (r.icon) spec.icon = r.icon;
      if (hw.mode === 'keep') spec.mode = 'keep';
    }
    if (hw.background) spec.background = true;
    if (hw.where) spec.where = hw.where;
    return { route: r, spec: spec, how: hw };
  }
  SF.specFor = function (id, o) { return specFor(id, o || {}, gesture(o)); };

  /* ---- the log the checks and the report read ---- */
  var LOG = SF.log = [];
  function log(rec) { LOG.push(rec); if (LOG.length > LOG_MAX) LOG.shift(); }

  /* ---- Goal (DL-147): Activity Detail's Goal domain, as the chat's /goal reveals it ---- */
  function revealGoal() {
    var a = app(), st = chatState();
    if (!st || !st.activity) return false;
    if (!Array.isArray(st.activity.expanded)) st.activity.expanded = [];
    if (st.activity.expanded.indexOf('goal') < 0) st.activity.expanded.push('goal');
    st.activity.open = true;
    st.activity.domain = 'goal';
    st.activity.scope = 'focus';
    if (a && typeof a.render === 'function') { try { a.render(); } catch (_) {} }
    return true;
  }

  /* ---- PMConcept7's pages and the narrow chat ---- */
  function goHome() {
    try { if (W.PM_PAGES && PM_PAGES.current && PM_PAGES.current !== 'dashboard') PM_PAGES.go('dashboard'); } catch (_) {}
  }
  function clearPeek() {
    var P = pmw();
    try { if (P && P.chatCol && P.chatCol.isPeeking && P.chatCol.isPeeking()) { P.chatCol.peek(false); return true; } } catch (_) {}
    return false;
  }
  function announce(text) { var P = pmw(); try { if (P && P.announce) P.announce(text); } catch (_) {} }
  function isOpenTab(id) {
    var H = home();
    try { return !!H && (H.tabs() || []).some(function (t) { return t.tabId === id; }); } catch (_) { return false; }
  }

  /* Home folds some ids into one tab (its run kind: collab-run:X is room:X, crew-work:X, ...): the chat's list of open
     tabs takes the id Home gave, so the panels' close and activate events find it (hosted openEditor added the
     chat's id just before this call; its next sync adopts the swap) */
  function renameInChat(from, to) {
    var st = chatState();
    if (!st || !Array.isArray(st.editorTabs)) return;
    var seen = {};
    st.editorTabs = st.editorTabs.map(function (x) { return x === from ? to : x; }).filter(function (x) { if (seen[x]) return false; seen[x] = 1; return true; });
    if (st.activeEditor === from) st.activeEditor = to;
  }

  /* a tab that was open before the chat claimed it (the Home layout's own plan:ap-index, a tab restored from another
     session) is drawn by its Home kind; once the chat hands it a body it remounts to draw the chat's */
  function ensureChatBody(tabId) {
    var P = pmw();
    var e = P && P.instances && P.instances[tabId];
    if (!e || !e.host || e.host.querySelector('.pm56-tab')) return;
    try { P.render.unmountTab(tabId); P.render.schedule({ animate: false }); } catch (_) {}
  }

  /* ---- open / close (the foundation's hosted openEditor and closeEditor call these first) ---- */
  SF.open = function (id, o) {
    o = Object.assign({}, o || {});
    if (forced && forced.agent) o.by = 'agent:' + forced.agent;
    var g = gesture(o);
    var plan = specFor(id, o, g);
    var r = plan.route;
    if (r.special === 'goal') {
      var shown = revealGoal();
      log({ id: str(id), tabId: null, kind: null, handled: 'goal', by: g ? 'user' : 'agent', at: Date.now() });
      return shown ? true : null;
    }
    var H = home();
    if (!H || !plan.spec) return null;
    var hw = plan.how;
    var focus = hw.user && !hw.background;
    if (focus) goHome();
    try { if (W.PM56_HOST && PM56_HOST.wrapKinds) PM56_HOST.wrapKinds(); } catch (_) {}
    var res = null;
    try { res = H.open(plan.spec); } catch (err) { try { console.error('[pm56-surfaces] open failed for ' + id, err); } catch (_) {} }
    var tabId = res && res.ok ? res.tabId : null;
    if (tabId && tabId !== str(id)) {
      renameInChat(str(id), tabId);
      // a folded run takes its own kind's mark (collab-run:X opened as review:X shows the review mark)
      var folded = route(tabId);
      if (folded.icon && folded.icon !== plan.spec.icon) { try { H.update(tabId, { icon: folded.icon }); } catch (_) {} }
    }
    if (tabId && res && !res.created && plan.spec.render) ensureChatBody(tabId);
    if (tabId && focus && clearPeek()) announce((plan.spec.label || 'The tab') + ' is open. The chat waits at the edge.');
    log({ id: str(id), tabId: tabId, kind: plan.spec.kind, by: plan.spec.by, background: !!plan.spec.background,
      where: plan.spec.where || 'auto', mode: plan.spec.mode || null, view: plan.spec.view || null, line: plan.spec.line || null,
      render: !!plan.spec.render, created: !!(res && res.created), panelId: (res && res.panelId) || null,
      reason: res && !res.ok ? res.reason : null, at: Date.now() });
    return tabId;
  };
  SF.close = function (id) {
    var r = route(id);
    if (r.special === 'goal') return true;
    var H = home();
    if (!H) return null;
    var tabId = isOpenTab(r.id) ? r.id : isOpenTab(r.input) ? r.input : null;
    if (tabId) { try { H.close(tabId); } catch (_) {} }
    return true;
  };

  /* A Home open a chat control asks for directly (the command card's buttons, the browser, an attachment's file): the
     person's modifiers apply (Alt: a new panel; Ctrl/Cmd: behind), a focused open shows Home and clears the peek. */
  SF.openHome = function (spec, e) {
    var H = home();
    if (!H || !spec) return null;
    spec = Object.assign({ by: 'user' }, spec);
    var agent = /^agent:/.test(str(spec.by));
    var g = e && (CLICKISH[e.type] || isKeyOpen(e)) ? fromEvent(e) : gesture();
    if (!agent && g) {
      if (g.alt && spec.where == null) spec.where = 'panel';
      if (g.ctrl || g.meta) spec.background = true;
    }
    if (agent) spec.background = true;
    var focus = !agent && !spec.background;
    if (focus) goHome();
    var res = null;
    try { res = H.open(spec); } catch (err) { try { console.error('[pm56-surfaces] open failed', err); } catch (_) {} }
    var tabId = res && res.ok ? res.tabId : null;
    if (tabId && focus && clearPeek()) announce((spec.label || 'The tab') + ' is open. The chat waits at the edge.');
    log({ id: spec.id || (spec.path ? 'file:' + spec.path : null), tabId: tabId, kind: spec.kind, by: spec.by, background: !!spec.background,
      where: spec.where || 'auto', mode: spec.mode || null, view: spec.view || null, line: spec.line || null, render: false,
      created: !!(res && res.created), panelId: (res && res.panelId) || null, reason: res && !res.ok ? res.reason : null, direct: true, at: Date.now() });
    return tabId;
  };

  /* For the Demo Studio and the checks: open an id as the person ({ alt, ctrl, keep }) or as an agent
     ({ by: 'agent:<name>' }) through the chat's own openEditor, so the chat's bookkeeping and renderer apply. */
  SF.openAs = function (id, o) {
    o = o || {};
    var agent = /^agent:/.test(str(o.by)) ? str(o.by).slice(6) || ASSISTANT : null;
    var g = agent ? null : { type: o.keep ? 'dblclick' : 'click', t: now(), target: null, alt: !!o.alt, ctrl: !!o.ctrl, meta: !!o.meta,
      detail: o.keep ? 2 : 1, key: null, trusted: false };
    var a = app();
    forced = { g: g, agent: agent };
    try {
      if (a && typeof a.openEditor === 'function') return a.openEditor(id);
      return SF.open(id, { by: o.by });
    } finally { forced = null; }
  };
})();
