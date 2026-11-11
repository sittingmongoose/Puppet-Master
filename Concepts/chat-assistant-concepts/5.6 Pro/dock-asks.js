/* dock-asks.js -- FO-128 (Jared, 2026-11-09, item 9): "it asks to approve a process above the composer. It should have
   the approval buttons right there in the bar to choose from. Rather than making them click it, look in the other
   screen, then approve. The other screens more details can be there, but it should have buttons to approve. Like yes,
   once. Always for this session, always. Etc. Whatever it might be." His pick, 2026-11-10: "A and short words. Yes but
   in the more compact format." (option A, answers in the line; canon's short words; the helper cards and the Studio's
   Ask permission take the same compact ladder and answer in the bar too).

   The composer dock's lines that ask you something carry their answers (module-shell.js pmxDockLine's o.ask). This file
   is the one owner of a tool's permission ask (Plans/Permissions_System.md 2.2 and 6.1, FinalGUISpec 15.7), wherever it
   is drawn:
   - The ladder is Deny, Once, For session, Always, in that order: Deny refuses this call; Once allows it this one time;
     For session allows the suggested pattern until the chat session ends; Always is a rule the person makes. Its
     suggested pattern (3.4: a command's first word plus " *", a path's folder plus "/**", a page's origin plus "/*") is
     editable, and the place (This project, This computer, Everywhere) is chosen, never preselected; a path never offers
     Everywhere and a chat with no project hides This project. Details shows the request's facts and Open permissions
     (6.1's open_permissions). Each answer writes one receipt in the thread (6.1: concise in-thread transparency) unless
     the ask's owner writes its own.
   - An ask is either drawn here, as its own line in the dock (the Studio's Ask permission, an agent's tool call), or by
     its owner (external: a Crew helper that waits for your OK: collaboration.js draws the line and the card from
     parts()). Either way an answer comes back here first and goes to the owner's onAnswer.
   It also keeps the keyboard in the dock: an answer removes the line that held it, so focus goes to the next asking line's
   first answer, or to the composer, never to the page; Escape leaves the Always chooser.
   A process's own prompt is not a permission ask: activity-panel.js answers it through PM_WORK (DL-252 / D13: No, Yes,
   then Answer in Terminal) in the same kind of line. */
(function () {
  'use strict';
  var EXT = window.PM56_EXT;
  if (!EXT || typeof EXT.slot !== 'function') return;
  var SH = function () { return window.PM56_SHELL; };
  function esc(s) { return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]; }); }

  var asks = [], grants = [], seq = 0;
  var PLACES = [['project', 'This project'], ['computer', 'This computer'], ['everywhere', 'Everywhere']];
  var TOOL = {
    bash: { verb: 'run a command', noun: 'command', word: 'Bash' },
    edit: { verb: 'edit a file', noun: 'edit', word: 'Edit' },
    read: { verb: 'read a file', noun: 'read', word: 'Read' },
    webfetch: { verb: 'open a web page', noun: 'page', word: 'Web fetch' },
    websearch: { verb: 'search the web', noun: 'search', word: 'Web search' },
    host: { verb: 'reconnect an execution host', noun: 'reconnect', word: 'Execution host' }
  };
  var PATH_TOOLS = { edit: 1, read: 1, glob: 1, grep: 1 };
  function tool(a) { var t = TOOL[a.tool] || { verb: 'use ' + a.tool, noun: 'call', word: a.tool }; return a.verb ? { verb: a.verb, noun: t.noun, word: t.word } : t; }

  /* Permissions_System 3.4: the pattern an "always" answer starts from, from the call itself. Canon names bash, the path
     tools and the web tools; any other tool starts from what its owner suggests, else its exact target. */
  function suggest(name, target) {
    target = String(target || '').trim();
    if (name === 'bash') { var w = target.split(/\s+/)[0] || ''; return w ? w + ' *' : '*'; }
    if (PATH_TOOLS[name]) { var d = target.replace(/\/[^/]*$/, ''); return (d && d !== target ? d : '.') + '/**'; }
    if (name === 'websearch' || name === 'webresearch') return '*';
    if (/^web(fetch|extract|crawl|map)$/.test(name)) { try { return new URL(target).origin + '/*'; } catch (e) { return '*'; } }
    return target || '*';
  }
  function placesFor(a) {
    return PLACES.filter(function (p) { return !(p[0] === 'everywhere' && PATH_TOOLS[a.tool]) && !(p[0] === 'project' && a.project === false); });
  }

  /* spec: { id, thread, tool, target, who, whoKind, verb, cwd, why, rule, project, pattern, facts: [[label, html]], at,
     external, onAnswer(ctx, how, { pattern, place }) -> true when the owner writes its own receipt } */
  function make(o) {
    var c = EXT.ctx && EXT.ctx();
    var a = { id: o.id || 'perm-' + (++seq), ui: { always: false, place: null, pattern: null, details: false } };
    apply(a, o, c);
    return a;
  }
  function apply(a, o, c) {
    a.thread = o.thread || a.thread || (c && c.state && c.state.selectedThread);
    a.tool = o.tool || a.tool || 'bash'; a.target = o.target != null ? o.target : (a.target || '');
    a.who = o.who || a.who || 'The agent'; a.whoKind = o.whoKind != null ? o.whoKind : (a.whoKind || '');
    a.verb = o.verb || a.verb || ''; a.cwd = o.cwd != null ? o.cwd : (a.cwd || ''); a.why = o.why != null ? o.why : (a.why || '');
    a.rule = o.rule != null ? o.rule : (a.rule || ''); a.project = o.project != null ? o.project !== false : a.project !== false;
    a.facts = o.facts || a.facts || null; a.external = !!(o.external != null ? o.external : a.external);
    a.onAnswer = o.onAnswer || a.onAnswer || null; a.at = o.at || a.at || Date.now();
    a.suggested = o.pattern || suggest(a.tool, a.target);
  }
  function ask(o, quiet) {
    var a = make(o || {});
    asks.push(a);
    var c = EXT.ctx && EXT.ctx();
    if (!quiet && c && c.renderApp) c.renderApp();
    return a.id;
  }
  /* an owner keeps its ask current while it waits (called from its render, so never renders) */
  function ensure(o) {
    var a = find(o.id);
    if (a) { apply(a, o, EXT.ctx && EXT.ctx()); return a; }
    a = make(o); asks.push(a); return a;
  }
  function drop(id) { var a = find(id), i = asks.indexOf(a); if (i >= 0) asks.splice(i, 1); }
  function find(id) { for (var i = 0; i < asks.length; i++) if (asks[i].id === id) return asks[i]; return null; }
  function patternOf(a) { var p = a.ui.pattern != null ? a.ui.pattern : a.suggested; return String(p).trim() || a.suggested; }

  /* ------------------------------------------------------------------ the parts every surface draws */
  function code(s) { return '<code>' + esc(s) + '</code>'; }
  function glyph(name, size) { var s = SH(); return s && s.pmxGlyph ? s.pmxGlyph(name, size) : ''; }
  function placeWord(p) { for (var i = 0; i < PLACES.length; i++) if (PLACES[i][0] === p) return PLACES[i][1].replace(/^This /, 'this '); return p; }
  /* canon's short words (6.1: Deny, Once, For session, Always), the three allowing ones one segmented control after
     "Allow"; their accessible names say the whole answer */
  function answersFor(a) {
    var id = 'data-id="' + esc(a.id) + '"', t = tool(a), p = patternOf(a);
    var b = function (value, label, aria, hint, group) {
      return { action: 'perm-answer', attrs: id + ' data-value="' + value + '"', label: label, aria: aria, hint: hint, group: group || null, tone: 'soft' };
    };
    return [
      b('deny', 'Deny', 'Deny', 'Don’t ' + (a.tool === 'bash' ? 'run it' : 'allow it') + '. ' + a.who + ' is told.'),
      b('once', 'Once', 'Allow once', 'Only this ' + t.noun + ', this one time.', 'Allow'),
      b('session', 'For session', 'Allow for this session', 'Allows ' + p + ' until this chat session ends.', 'Allow'),
      b('always', 'Always…', 'Always allow…', 'Makes a rule for ' + p + '. You choose where.', 'Allow')
    ];
  }
  function chooser(a) {
    var id = esc(a.id), p = patternOf(a), chosen = a.ui.place;
    return '<div class="pmx-ask-always" data-k="perm-always" role="group" aria-label="Always allow: the pattern and where the rule applies">' +
      '<label class="pmx-ask-pat"><span>Always allow</span><input type="text" data-k="perm-pattern" data-perm-pattern="' + id + '" value="' + esc(p) + '" spellcheck="false" autocomplete="off" aria-label="Pattern to always allow"></label>' +
      '<div class="pmx-ask-where" role="group" aria-label="Where the rule applies"><span class="pmx-ask-where-l" aria-hidden="true">Where</span>' +
        placesFor(a).map(function (pl) {
          var on = chosen === pl[0];
          return '<button type="button" class="soft-button" data-k="place:' + pl[0] + '" data-action="perm-place" data-id="' + id + '" data-value="' + pl[0] + '" aria-pressed="' + on + '">' + (on ? glyph('check', 12) : '') + esc(pl[1]) + '</button>';
        }).join('') + '</div>' +
      '<p class="pmx-ask-always-note">' + (chosen ? 'The rule is saved for ' + esc(placeWord(chosen)) + ' and can be changed in Settings › Permissions.' : 'Nothing is chosen for you: pick where the rule applies.') + '</p>' +
      '<div class="pmx-ask-always-acts"><button type="button" class="text-button" data-k="perm-back" data-action="perm-back" data-id="' + id + '">Back</button>' +
        '<button type="button" class="primary-button" data-k="perm-save" data-action="perm-save" data-id="' + id + '"' + (chosen ? '' : ' aria-disabled="true" title="Choose where the rule applies first"') + '>Save rule</button></div></div>';
  }
  function facts(a) {
    var t = tool(a), rows = a.facts ? a.facts.slice() : [['Tool', esc(t.word) + ' · ' + esc(t.verb)]];
    if (!a.facts) {
      if (a.cwd) rows.push(['Folder', code(a.cwd)]);
      rows.push(['Asked by', esc(a.who) + (a.whoKind ? ' · ' + esc(a.whoKind) : '')]);
      if (a.why) rows.push(['Why', esc(a.why)]);
    }
    rows.push(['Rule', esc(a.rule || (t.word + ' asks first')) + ' · <button type="button" class="text-button" data-k="perm-open" data-action="perm-open-permissions">Open permissions</button>']);
    return '<dl class="pmx-ask-facts" data-k="perm-facts">' + rows.map(function (r) { return '<dt>' + r[0] + '</dt><dd>' + r[1] + '</dd>'; }).join('') + '</dl>';
  }
  /* what any surface needs to draw an ask: pmxDockLine's o.ask, or a decision row's actions and extra */
  function parts(id) {
    var a = typeof id === 'string' ? find(id) : id;
    if (!a) return null;
    var t = tool(a);
    return { id: a.id, question: a.target ? code(a.target) : '', answers: answersFor(a), extra: a.ui.always ? chooser(a) : '', more: a.ui.details ? facts(a) : '',
      sentence: esc(a.who) + ' wants to ' + esc(t.verb), label: 'Answer: ' + a.who + ' wants to ' + t.verb, details: !!a.ui.details };
  }
  function line(ctx, a) {
    var p = parts(a);
    return SH().pmxDockLine({ key: 'pmx-dock:' + a.id, tone: 'needs', cls: 'pmx-perm-dock', markHtml: ctx.icon('shield', 16), kindWord: 'Permission', sentence: p.sentence,
      action: { action: 'perm-details', attrs: 'data-id="' + esc(a.id) + '"', label: 'Details', expanded: p.details },
      ask: { question: p.question, answers: p.answers, extra: p.extra, more: p.more, label: p.label } });
  }

  /* ------------------------------------------------------------------ the Studio's Ask permission, in the bar */
  /* The Studio's Ask permission (and a permission card's Review, and the tool-failure Recover) open the chat's
     'permission' decision. Since FO-128 it is asked in the bar: app.js leaves the decision host empty for it while this
     file is loaded, and this ask carries the request (the Ask Card's prompt, scope and hosts as its details). Deny and
     the allowing answers go through the app's own deny-permission and approve-permission. */
  var STUDIO = 'perm-studio-host';
  function studioAsk(ctx) {
    var d = ctx.state.decision, open = !!(d && d.type === 'permission');
    if (!open) { drop(STUDIO); return; }
    if (find(STUDIO)) return;
    var hosts = ((ctx.D && ctx.D.operational && ctx.D.operational.hosts) || []).filter(function (h) { return h.role === 'execution'; });
    ensure({ id: STUDIO, thread: ctx.state.selectedThread, tool: 'host', target: 'Reconnect to Windows execution host and resume browser control', pattern: 'Windows execution host',
      who: 'The agent', verb: 'reconnect the Windows execution host', rule: 'Execution hosts ask first in this project',
      facts: [['Why', 'The prior host connection dropped during step 7. The checkpoint is intact; no command will be replayed twice.'],
        ['Scope', 'Reconnect host · restore browser session · continue from checkpoint · no schema mutation'],
        ['Hosts', hosts.map(function (h) { return esc(h.label) + ' (' + esc(h.state) + ')'; }).join(' · ') || 'Windows native']],
      onAnswer: function (c, how) {
        var A = window.PM56_APP;
        if (A && A.act) A.act(how === 'deny' ? 'deny-permission' : 'approve-permission');
        return how === 'deny';
      } });
  }

  function provide() {
    var P = window.PM56_PMX;
    if (!P || !P.dock) return false;
    P.dock.provide(function (ctx) {
      if (!ctx || !ctx.state || !SH() || !SH().pmxDockLine) return [];
      studioAsk(ctx);
      var tid = ctx.state.selectedThread;
      return asks.filter(function (a) { return !a.external && a.thread === tid; }).map(function (a) { return { key: 'perm:' + a.id, tone: 'needs', at: a.at, html: line(ctx, a) }; });
    });
    return true;
  }
  if (!provide()) document.addEventListener('DOMContentLoaded', provide, { once: true });

  /* ------------------------------------------------------------------ answers */
  var RECEIPT = {
    deny: function (a) { return ['Denied: ' + tool(a).verb, (a.target ? a.target + ' · ' : '') + a.who + ' was told. Nothing ran.']; },
    once: function (a) { return ['Allowed once: ' + tool(a).verb, (a.target ? a.target + ' · ' : '') + 'asked by ' + a.who + '.']; },
    session: function (a) { return ['Allowed for this session: ' + patternOf(a), tool(a).word + ' calls that match run without asking until this chat session ends.']; },
    always: function (a) { return ['Always allowed: ' + patternOf(a), 'A rule for ' + placeWord(a.ui.place) + '. Change it in Settings › Permissions.']; }
  };
  function resolve(ctx, a, how) {
    var i = asks.indexOf(a);
    if (i < 0) return;
    asks.splice(i, 1);
    var rule = { pattern: patternOf(a), place: a.ui.place };
    if (how === 'session') grants.push({ tool: a.tool, pattern: rule.pattern, thread: a.thread });
    var own = false;
    try { own = a.onAnswer ? a.onAnswer(ctx, how, rule) === true : false; } catch (e) { console.error('dock-asks: onAnswer threw', e); }
    var r = RECEIPT[how](a);
    if (!own && ctx.addReceipt) ctx.addReceipt('permission-answer', r[0], r[1]);
    announce(r[0]);
    ctx.renderApp();
  }
  EXT.action('perm-answer', function (ctx, btn) {
    var a = find(btn && btn.dataset.id), v = btn && btn.dataset.value;
    if (!a) return true;
    if (v === 'always') { a.ui.always = true; wantFocus = '[data-perm-pattern="' + a.id + '"]'; ctx.renderApp(); return true; }
    if (RECEIPT[v]) resolve(ctx, a, v);
    return true;
  });
  EXT.action('perm-place', function (ctx, btn) {
    var a = find(btn && btn.dataset.id); if (!a) return true;
    a.ui.place = btn.dataset.value; wantFocus = '[data-action="perm-place"][data-id="' + a.id + '"][data-value="' + a.ui.place + '"]';
    ctx.renderApp(); return true;
  });
  EXT.action('perm-back', function (ctx, btn) {
    var a = find(btn && btn.dataset.id); if (!a) return true;
    a.ui.always = false; wantFocus = '[data-action="perm-answer"][data-id="' + a.id + '"][data-value="always"]';
    ctx.renderApp(); return true;
  });
  EXT.action('perm-save', function (ctx, btn) {
    var a = find(btn && btn.dataset.id); if (!a) return true;
    if (!a.ui.place) { announce('Choose where the rule applies first.'); return true; }
    resolve(ctx, a, 'always'); return true;
  });
  EXT.action('perm-details', function (ctx, btn) {
    var a = find(btn && btn.dataset.id); if (!a) return true;
    a.ui.details = !a.ui.details; ctx.renderApp(); return true;
  });
  EXT.action('perm-open-permissions', function () {
    try {
      if (window.PM_PAGES && typeof window.PM_PAGES.go === 'function') {
        window.PM_PAGES.go('settings');
        setTimeout(function () { try { if (window.PM51 && typeof window.PM51.revealSetting === 'function') window.PM51.revealSetting('safety.rules.per-tool-permissions'); } catch (e) { /* Settings not ready */ } }, 60);
        return true;
      }
    } catch (e) { /* no page router: the standalone chat */ }
    announce('Permissions are in Settings › Safety & Permissions.');
    return true;
  });
  /* the pattern field is the person's to edit (3.4); kept here so a re-render keeps what they typed */
  document.addEventListener('input', function (e) {
    var el = e.target, id = el && el.getAttribute && el.getAttribute('data-perm-pattern');
    if (!id) return;
    var a = find(id); if (a) a.ui.pattern = el.value;
  }, true);

  /* ------------------------------------------------------------------ focus and keys */
  var live = null;
  function announce(text) {
    if (!live) {
      live = document.createElement('div');
      live.setAttribute('aria-live', 'polite'); live.setAttribute('role', 'status'); live.setAttribute('data-pm56-dock-live', '');
      live.style.cssText = 'position:fixed;width:1px;height:1px;margin:-1px;padding:0;overflow:hidden;clip:rect(0 0 0 0);clip-path:inset(50%);white-space:nowrap;border:0;';
      document.body.appendChild(live);
    }
    live.textContent = '';
    setTimeout(function () { live.textContent = text; }, 30);
  }
  /* An answer removes the line (or the card's decision) that held it. Where the keyboard was there, it goes to the next
     asking line's first answer, else the composer, after the render that removed it (and once more a little later: a
     process's answer re-renders through PM_WORK's own notice). */
  var wantFocus = null, fromAsk = 0;
  var ASKING = '.pmx-dock-line[data-ask], .pmx-decision';
  function nextTarget() {
    return document.querySelector('.composer > .pmx-dock .pmx-dock-line[data-ask] .pmx-dock-ans') || document.querySelector('.composer .composer-input');
  }
  function settleFocus() {
    if (wantFocus) {
      var w = document.querySelector(wantFocus);
      if (w) { wantFocus = null; try { w.focus({ preventScroll: true }); if (w.select && w.type === 'text') w.select(); } catch (e) { /* gone */ } return; }
    }
    if (!fromAsk || performance.now() - fromAsk > 3000) return;
    var act = document.activeElement;
    if (act && act !== document.body && act.isConnected) return;
    fromAsk = 0;
    var t = nextTarget();
    if (t) try { t.focus({ preventScroll: true }); } catch (e) { /* gone */ }
  }
  document.addEventListener('click', function (e) {
    var b = e.target && e.target.closest && e.target.closest('button');
    if (!b || !b.closest(ASKING)) return;
    fromAsk = performance.now();
    requestAnimationFrame(function () { requestAnimationFrame(settleFocus); });
    setTimeout(settleFocus, 120);
    setTimeout(settleFocus, 400);
  }, true);
  EXT.slot('afterRender', function () { if (wantFocus || fromAsk) requestAnimationFrame(settleFocus); return ''; });
  document.addEventListener('keydown', function (e) {
    if (e.key !== 'Escape' || e.altKey || e.ctrlKey || e.metaKey) return;
    var box = e.target && e.target.closest && e.target.closest('.pmx-ask-always');
    var back = box && box.querySelector('[data-action="perm-back"]');
    if (back) { e.preventDefault(); e.stopPropagation(); back.click(); }
  }, true);

  window.PM56_ASKS = { ask: ask, ensure: ensure, drop: drop, parts: parts, list: function () { return asks.slice(); }, grants: function () { return grants.slice(); }, suggest: suggest };
})();
