/* dock-asks.js -- FO-128 (Jared, 2026-11-09, item 9): "it asks to approve a process above the composer. It should have
   the approval buttons right there in the bar to choose from. Rather than making them click it, look in the other
   screen, then approve. The other screens more details can be there, but it should have buttons to approve. Like yes,
   once. Always for this session, always. Etc. Whatever it might be."

   The composer dock's lines that ask you something carry their answers (module-shell.js pmxDockLine's o.ask). This
   file owns three things for every such line:
   1. A tool's permission ask (Plans/Permissions_System.md 2.2 and 6.1, FinalGUISpec 15.7): the ladder Deny, Once,
      For session, Always, in that order. Once allows this one call; For session allows the suggested pattern until the
      chat session ends; Always is a rule the person makes: the suggested pattern (3.4: a command's first word plus
      " *", a path's folder plus "/**", a page's origin plus "/*") is editable, and the place (This project, This
      computer, Everywhere) is chosen, never preselected; a path never offers Everywhere and a chat with no project
      hides This project. Details shows the request's facts and Open permissions (6.1's open_permissions).
      Each answer writes one receipt in the thread (6.1: concise in-thread transparency).
   2. Focus after an answer: the line that held it goes, so the keyboard moves to the next ask's first answer, or to
      the composer, never to the page.
   3. The 'list' layout's keys: 1-9 pick an answer, the arrows move between them, Escape leaves the Always chooser.
   A process's own prompt is not here: activity-panel.js answers it through PM_WORK (D13: No / Yes, then Answer in
   Terminal), with the same line and the same focus rules. */
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
    websearch: { verb: 'search the web', noun: 'search', word: 'Web search' }
  };
  var PATH_TOOLS = { edit: 1, read: 1, glob: 1, grep: 1 };
  function tool(a) { return TOOL[a.tool] || { verb: 'use ' + a.tool, noun: 'call', word: a.tool }; }

  /* Permissions_System 3.4: the pattern an "always" answer starts from, from the call itself */
  function suggest(name, target) {
    target = String(target || '').trim();
    if (name === 'bash') { var w = target.split(/\s+/)[0] || ''; return w ? w + ' *' : '*'; }
    if (PATH_TOOLS[name]) { var d = target.replace(/\/[^/]*$/, ''); return (d && d !== target ? d : '.') + '/**'; }
    if (name === 'websearch' || name === 'webresearch') return '*';
    if (/^web(fetch|extract|crawl|map)$/.test(name)) { try { return new URL(target).origin + '/*'; } catch (e) { return '*'; } }
    return '*';
  }
  function placesFor(a) {
    return PLACES.filter(function (p) { return !(p[0] === 'everywhere' && PATH_TOOLS[a.tool]) && !(p[0] === 'project' && a.project === false); });
  }

  function ask(o, quiet) {
    o = o || {};
    var c = EXT.ctx && EXT.ctx();
    var a = { id: 'perm-' + (++seq), thread: o.thread || (c && c.state && c.state.selectedThread), tool: o.tool || 'bash', target: o.target || '',
      who: o.who || 'The agent', whoKind: o.whoKind || '', cwd: o.cwd || '', why: o.why || '', rule: o.rule || '', project: o.project !== false,
      at: o.at || Date.now(), ui: { always: false, place: null, pattern: null, details: false } };
    a.suggested = o.pattern || suggest(a.tool, a.target);
    asks.push(a);
    if (!quiet && c && c.renderApp) c.renderApp();
    return a.id;
  }
  function find(id) { for (var i = 0; i < asks.length; i++) if (asks[i].id === id) return asks[i]; return null; }
  function patternOf(a) { var p = a.ui.pattern != null ? a.ui.pattern : a.suggested; return String(p).trim() || a.suggested; }

  /* ------------------------------------------------------------------ the line */
  function code(s) { return '<code>' + esc(s) + '</code>'; }
  function answersFor(a, layout) {
    var id = 'data-id="' + esc(a.id) + '"', t = tool(a), p = patternOf(a), row = layout !== 'list';
    var b = function (value, label, aria, hint, group) {
      return { action: 'perm-answer', attrs: id + ' data-value="' + value + '"' + (aria ? ' aria-label="' + esc(aria) + '"' : ''), label: label, hint: hint, group: group || null };
    };
    var allow = row ? 'Allow' : null;
    return [
      b('deny', 'Deny', '', 'Don’t ' + (a.tool === 'bash' ? 'run it' : 'allow it') + '. The agent is told.'),
      b('once', row ? 'Once' : 'Allow once', row ? 'Allow once' : '', 'Only this ' + t.noun + ', this one time.', allow),
      b('session', row ? 'For session' : 'Allow for this session', row ? 'Allow for this session' : '', 'Allows ' + code(p) + ' until this chat session ends.', allow),
      b('always', row ? 'Always…' : 'Always allow…', row ? 'Always allow…' : '', 'Makes a rule for ' + code(p) + '. You choose where.', allow)
    ];
  }
  function chooser(a) {
    var id = esc(a.id), p = patternOf(a), places = placesFor(a), chosen = a.ui.place;
    return '<div class="pmx-dock-always" data-k="perm-always" role="group" aria-label="Always allow: the pattern and where the rule applies">' +
      '<label class="pmx-dock-pat"><span>Always allow</span><input type="text" data-k="perm-pattern" data-perm-pattern="' + id + '" value="' + esc(p) + '" spellcheck="false" autocomplete="off" aria-label="Pattern to always allow"></label>' +
      '<div class="pmx-dock-where" role="group" aria-label="Where the rule applies"><span class="pmx-dock-where-l" aria-hidden="true">Where</span>' +
        places.map(function (pl) {
          var on = chosen === pl[0];
          return '<button type="button" class="soft-button" data-k="place:' + pl[0] + '" data-action="perm-place" data-id="' + id + '" data-value="' + pl[0] + '" aria-pressed="' + on + '">' + (on ? glyph('check', 12) : '') + esc(pl[1]) + '</button>';
        }).join('') + '</div>' +
      '<p class="pmx-dock-always-note">' + (chosen ? 'The rule is saved for ' + esc(placeWord(chosen)) + ' and can be changed in Settings › Permissions.' : 'Nothing is chosen for you: pick where the rule applies.') + '</p>' +
      '<div class="pmx-dock-always-acts"><button type="button" class="text-button" data-k="perm-back" data-action="perm-back" data-id="' + id + '">Back</button>' +
        '<button type="button" class="primary-button" data-k="perm-save" data-action="perm-save" data-id="' + id + '"' + (chosen ? '' : ' aria-disabled="true" title="Choose where the rule applies first"') + '>Save rule</button></div></div>';
  }
  function facts(a) {
    var t = tool(a), rows = [['Tool', esc(t.word) + ' · ' + esc(t.verb)]];
    if (a.cwd) rows.push(['Folder', code(a.cwd)]);
    rows.push(['Asked by', esc(a.who) + (a.whoKind ? ' · ' + esc(a.whoKind) : '')]);
    if (a.why) rows.push(['Why', esc(a.why)]);
    rows.push(['Rule', esc(a.rule || (t.word + ' asks first')) + ' · <button type="button" class="text-button" data-k="perm-open" data-action="perm-open-permissions">Open permissions</button>']);
    return '<dl class="pmx-dock-facts" data-k="perm-facts">' + rows.map(function (r) { return '<dt>' + r[0] + '</dt><dd>' + r[1] + '</dd>'; }).join('') + '</dl>';
  }
  function glyph(name, size) { var s = SH(); return s && s.pmxGlyph ? s.pmxGlyph(name, size) : ''; }
  function placeWord(p) { for (var i = 0; i < PLACES.length; i++) if (PLACES[i][0] === p) return PLACES[i][1].replace(/^This /, 'this '); return p; }
  function line(ctx, a) {
    var S = SH(), layout = S.pmxAskLayout ? S.pmxAskLayout() : 'row';
    return S.pmxDockLine({ key: 'pmx-dock:' + a.id, tone: 'needs', cls: 'pmx-perm-dock', markHtml: ctx.icon('shield', 16), kindWord: 'Permission',
      sentence: esc(a.who) + ' wants to ' + esc(tool(a).verb),
      action: { action: 'perm-details', attrs: 'data-id="' + esc(a.id) + '"', label: 'Details', expanded: !!a.ui.details },
      ask: { question: code(a.target), answers: answersFor(a, layout), extra: a.ui.always ? chooser(a) : '', more: a.ui.details ? facts(a) : '',
        label: 'Answer: ' + a.who + ' wants to ' + tool(a).verb } });
  }
  function provide() {
    var P = window.PM56_PMX;
    if (!P || !P.dock) return false;
    P.dock.provide(function (ctx) {
      if (!ctx || !ctx.state || !SH() || !SH().pmxDockLine) return [];
      seedOnce(ctx);
      var tid = ctx.state.selectedThread;
      return asks.filter(function (a) { return a.thread === tid; }).map(function (a) { return { key: 'perm:' + a.id, tone: 'needs', at: a.at, html: line(ctx, a) }; });
    });
    return true;
  }
  if (!provide()) document.addEventListener('DOMContentLoaded', provide, { once: true });

  /* ------------------------------------------------------------------ answers */
  var RECEIPT = {
    deny: function (a) { return ['Denied: ' + tool(a).verb, a.target + ' · ' + a.who + ' was told. Nothing ran.']; },
    once: function (a) { return ['Allowed once: ' + tool(a).verb, a.target + ' · asked by ' + a.who + '.']; },
    session: function (a) { return ['Allowed for this session: ' + patternOf(a), tool(a).word + ' calls that match run without asking until this chat session ends.']; },
    always: function (a) { return ['Always allowed: ' + patternOf(a), 'A rule for ' + placeWord(a.ui.place) + '. Change it in Settings › Permissions.']; }
  };
  function resolve(ctx, a, how) {
    var i = asks.indexOf(a);
    if (i < 0) return;
    asks.splice(i, 1);
    if (how === 'session') grants.push({ tool: a.tool, pattern: patternOf(a), thread: a.thread });
    var r = RECEIPT[how](a);
    if (ctx.addReceipt) ctx.addReceipt('permission-answer', r[0], r[1]);
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
  /* An answer removes the line that held it. Where the keyboard was in an asking line, it goes to the next asking
     line's first answer, else the composer, after the render that removed it (and once more on the next frame: a
     process's answer re-renders through PM_WORK's own notice). */
  var wantFocus = null, fromDock = 0;
  function nextTarget() {
    return document.querySelector('.composer > .pmx-dock .pmx-dock-line[data-ask] :is(.pmx-dock-ans, .pmx-dock-choice)') || document.querySelector('.composer .composer-input');
  }
  function settleFocus() {
    if (wantFocus) {
      var w = document.querySelector(wantFocus);
      if (w) { wantFocus = null; try { w.focus({ preventScroll: true }); if (w.select && w.type === 'text') w.select(); } catch (e) { /* gone */ } return; }
    }
    if (!fromDock || performance.now() - fromDock > 3000) return;
    var act = document.activeElement;
    if (act && act !== document.body && act.isConnected) return;
    fromDock = 0;
    var t = nextTarget();
    if (t) try { t.focus({ preventScroll: true }); } catch (e) { /* gone */ }
  }
  document.addEventListener('click', function (e) {
    var b = e.target && e.target.closest && e.target.closest('.pmx-dock-line[data-ask] button');
    if (!b) return;
    fromDock = performance.now();
    requestAnimationFrame(function () { requestAnimationFrame(settleFocus); });
    setTimeout(settleFocus, 120);
    setTimeout(settleFocus, 400);
  }, true);
  EXT.slot('afterRender', function () { if (wantFocus || fromDock) requestAnimationFrame(settleFocus); return ''; });
  document.addEventListener('keydown', function (e) {
    var t = e.target, ln = t && t.closest && t.closest('.pmx-dock-line[data-ask]');
    if (!ln || e.altKey || e.ctrlKey || e.metaKey) return;
    if (e.key === 'Escape') {
      var back = ln.querySelector('[data-action="perm-back"]');
      if (back) { e.preventDefault(); e.stopPropagation(); back.click(); }
      return;
    }
    if (t.tagName === 'INPUT' || ln.getAttribute('data-ask') !== 'list') return;
    var list = Array.prototype.slice.call(ln.querySelectorAll('.pmx-dock-choice'));
    if (!list.length) return;
    if (/^[1-9]$/.test(e.key)) {
      var pick = list[Number(e.key) - 1];
      if (pick) { e.preventDefault(); pick.click(); }
      return;
    }
    if (e.key === 'ArrowDown' || e.key === 'ArrowUp') {
      var i = list.indexOf(t.closest('.pmx-dock-choice'));
      if (i < 0) return;
      e.preventDefault();
      list[(i + (e.key === 'ArrowDown' ? 1 : list.length - 1)) % list.length].focus();
    }
  }, true);

  /* ------------------------------------------------------------------ the demo ask */
  /* The prototype (FO-128 phase 1) puts one ask in the Query performance thread so both kinds of asking line show:
     the subagent that benchmarks the read path wants to run a query on staging. */
  var seeded = false;
  function seedOnce(ctx) {
    if (seeded) return;
    seeded = true;
    var th = (ctx.state.threads || []).filter(function (x) { return x.id === 'query'; })[0];
    ask({ thread: th ? th.id : ctx.state.selectedThread, tool: 'bash', who: 'Query Analyzer', whoKind: 'subagent',
      target: 'psql "$STAGING_DATABASE_URL" -c "EXPLAIN (ANALYZE, BUFFERS) SELECT * FROM recipes WHERE tenant_id = 42 ORDER BY updated_at DESC LIMIT 50"',
      cwd: '~/tastebook/api', why: 'Measures the tenant read path on staging before it proposes the index.', rule: 'Bash asks first in this project',
      at: Date.now() - 20000 }, true);
  }

  window.PM56_ASKS = { ask: ask, list: function () { return asks.slice(); }, grants: function () { return grants.slice(); }, suggest: suggest,
    layout: function (v) { if (v === 'row' || v === 'list') { document.documentElement.setAttribute('data-pmx-ask', v); var c = EXT.ctx && EXT.ctx(); if (c && c.renderApp) c.renderApp(); } return SH() && SH().pmxAskLayout ? SH().pmxAskLayout() : 'row'; } };
})();
