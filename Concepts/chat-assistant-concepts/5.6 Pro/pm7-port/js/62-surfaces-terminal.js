/* pm7-port/js/62-surfaces-terminal.js: the inline "Shell" box becomes the terminal's compact command card (D27;
   chat56-audit section 4; canon Plans/assistant-chat-design.md section 13.3, ACD-102/108/126-131).

   A command row in a working card still toggles one card under it (state.workTerminal, one per working card), but
   what draws there is PMT.card, the terminal's own bounded preview: status in words, who ran it and where, the last
   5 lines (15 expanded), never wrapped. The foundation's hook in renderWorkTerminal (extReplace('workTerminal',
   { cardId, step, row }, builtIn)) gets a keep-island placeholder from here; after each render the card is put in it
   (data-pm-keep, so the chat's patcher never touches the card and its disclosure and scroll survive the work tick).

   Its actions hand off to the Home panels (the terminal owns interactive state; the chat keeps preview and audit):
   - Open in Terminal, while the command's session lives (the working card's run has not finished, or its terminal tab's
     session still runs, even after the command is Done or Failed): opens or reveals that session's terminal tab (rule 1:
     one tab per session; a second click shows the same tab, so it is also Show Terminal).
   - View output, only when no session remains (canon: never fabricate Open in Terminal for a session that is gone): the
     retained output in a kept, read-only editor buffer tab, one per command.
   - Rerun in Terminal: the exact command again, in the agent's terminal when its tab is open and running (a person's
     Rerun while an agent drives is a take-over, DL-181), else in a new terminal tab in the project folder. The
     concept's simulated shell runs cargo and git; a command it lacks (psql's EXPLAIN, the pm CLI) says so, as a
     shell would.
   A person's click takes focus (D8); Alt+click opens a new panel, Ctrl/Cmd+click opens behind (PM56_SURFACES.openHome).
   Without PMT (a build without the terminal) the slot returns nothing and the chat's own box draws. */
(function () {
  'use strict';
  var W = window;
  var CWD = '~/tastebook/api';
  var AGENT = 'Assistant';
  var cards = new Map();   // key -> { el, live }
  var specs = new Map();   // key -> spec data from the slot
  var rerunN = 0;

  function ext() { return W.PM56_EXT || null; }
  function PMT() { return W.PMT && typeof W.PMT.card === 'function' ? W.PMT : null; }
  function SF() { return W.PM56_SURFACES || {}; }
  function esc(s) { return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]; }); }
  function slug(s) { return String(s || '').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '').slice(0, 48) || 'cmd'; }
  function folder(p) { p = String(p || '').replace(/\/+$/, ''); var i = p.lastIndexOf('/'); return i < 0 ? p : p.slice(i + 1); }

  /* the command a row ran (app.js inferShellCmd): row.cmd, a "Ran ..." line, else the step's verb */
  function commandOf(step, row) {
    if (row && row.cmd) return String(row.cmd).trim();
    var t = String((row && row.text) || '');
    if (/^Ran\s+/i.test(t)) return t.replace(/^Ran\s+/i, '').trim();
    return String((step && (step.verb || step.label)) || t || 'command').trim();
  }
  function linesOf(row) {
    var raw = row && row.output != null ? row.output : (row && (row.tag || row.text)) || '';
    var list = Array.isArray(raw) ? raw : String(raw).split('\n');
    return list.map(function (l) { return String(l == null ? '' : l); });
  }
  function statusOf(exit) { return exit === 0 ? 'ok' : exit === 130 ? 'interrupted' : 'failed'; }
  function durationMs(step, row) {
    if (row && row.durationMs != null) return +row.durationMs || 0;
    if (step && step.dur) return step.dur * 1000;
    return 45000;
  }
  function secondsWords(ms) {
    var s = Math.max(1, Math.round((ms || 0) / 1000)), m = Math.floor(s / 60), r = s % 60;
    return m ? m + 'm ' + (r < 10 ? '0' : '') + r + 's' : s + 's';
  }
  function threadId() { var A = W.PM56_APP; return (A && A.state && A.state.selectedThread) || 'chat'; }
  /* the command's session is live while its working card's run has not finished (the agent's session), and after that
     for as long as its terminal tab's session runs (canon: Open in Terminal while the session lives, even once the
     command is Done or Failed; View output only when no session remains) */
  function sessionLive(d) {
    var T = PMT(), s = null;
    try { s = T && T.session ? T.session(sessionOf(d)) : null; } catch (_) { s = null; }
    return !!(s && s.state === 'running');
  }
  function isLive(d) {
    var el = document.querySelector('.working-card[data-card-ui="' + (W.CSS && CSS.escape ? CSS.escape(d.cardId) : d.cardId) + '"]');
    return (!!el && !el.classList.contains('is-done')) || sessionLive(d);
  }

  function outputText(d) {
    var head = '$ ' + d.command;
    var tail = 'Exit code ' + d.exit + ' · ran in ' + secondsWords(d.ms) + ' · ' + CWD;
    return [head].concat(d.lines.filter(function (l, i, a) { return l !== '' || (i > 0 && i < a.length - 1); }), '', tail).join('\n');
  }
  function shortCmd(cmd) { return cmd.length > 34 ? cmd.slice(0, 33) + '…' : cmd; }

  function sessionOf(d) { return 'pm56-' + slug(threadId()) + '-' + slug(d.cardId); }
  function openTerminal(d, e) {
    var sid = sessionOf(d);
    return SF().openHome && SF().openHome({ kind: 'terminal', id: 'terminal:' + sid, session: sid, cwd: CWD,
      label: AGENT + ' · ' + folder(CWD), title: AGENT + '’s terminal in ' + CWD }, e);
  }
  function viewOutput(d, e) {
    return SF().openHome && SF().openHome({ kind: 'editor', id: 'buffer:pm56-out-' + slug(d.key), text: outputText(d), language: 'text',
      mode: 'keep', label: shortCmd(d.command) + ' · output', title: d.command + ' · output (read-only)' }, e);
  }
  function rerun(d, e) {
    /* the agent's session is still open in its tab: the command goes in there (a person's Rerun while an agent drives
       is a take-over, DL-181); otherwise a new terminal in the project folder runs it once */
    var T = PMT(), sid0 = sessionOf(d), s0 = null;
    try { s0 = T && T.session ? T.session(sid0) : null; } catch (_) { s0 = null; }
    if (s0 && s0.state === 'running' && s0.shell && typeof s0.input === 'function') {
      openTerminal(d, e);
      try { s0.input(d.command + '\r', 'user'); } catch (_) {}
      try { if (W.PMW && PMW.announce) PMW.announce('Running ' + d.command + ' again in its terminal'); } catch (_) {}
      return 'terminal:' + sid0;
    }
    rerunN += 1;
    var sid = 'pm56-rerun-' + rerunN;
    var t = SF().openHome && SF().openHome({ kind: 'terminal', id: 'terminal:' + sid, session: sid, cwd: CWD,
      invocation: { command: d.command }, label: shortCmd(d.command), title: 'Rerun of ' + d.command + ' in ' + CWD }, e);
    try { if (W.PMW && PMW.announce) PMW.announce('Running ' + d.command + ' again in a terminal tab'); } catch (_) {}
    return t;
  }

  function buildCard(d, live) {
    var T = PMT();
    if (!T) return null;
    var spec = { command: d.command, cwd: CWD, status: statusOf(d.exit), exitCode: d.exit, elapsedMs: d.ms,
      lines: d.lines, totalLines: d.lines.length, by: 'agent:' + AGENT,
      onRerun: function (sp, el, e) { rerun(d, e); } };
    if (live) spec.onOpen = function (sp, el, e) { openTerminal(d, e); };
    else spec.onViewOutput = function (sp, el, e) { viewOutput(d, e); };
    var el = null;
    try { el = T.card(spec); } catch (err) { try { console.error('[pm56-surfaces] the command card failed', err); } catch (_) {} }
    return el;
  }

  /* the slot: a keep island the card goes into after the render */
  function slot(ctx) {
    if (!PMT()) return '';
    var cardId = ctx.cardId, step = ctx.step, row = ctx.row;
    if (cardId == null || !row) return '';
    var t = ctx.state && ctx.state.workTerminal ? ctx.state.workTerminal[cardId] : null;
    var key = String(cardId) + '|' + (t ? t.stepUid + '|' + t.rowIndex : (step && step.uid) + '|' + commandOf(step, row));
    var exit = row.exitCode != null ? +row.exitCode : 0;
    specs.set(key, { key: key, cardId: String(cardId), command: commandOf(step, row), lines: linesOf(row), exit: exit, ms: durationMs(step, row) });
    return '<div class="work-terminal pm56-cmd" data-k="wterm:' + esc(cardId) + '" data-pm-keep data-pm56-cmd="' + esc(key) + '"></div>';
  }

  function mountAll() {
    var hosts = document.querySelectorAll('.pm56-cmd[data-pm56-cmd]');
    for (var i = 0; i < hosts.length; i++) {
      var host = hosts[i], key = host.getAttribute('data-pm56-cmd'), d = specs.get(key);
      if (!d) continue;
      var live = isLive(d);
      var have = cards.get(key);
      if (!have || have.live !== live) {
        var el = buildCard(d, live);
        if (!el) continue;
        have = { el: el, live: live };
        cards.set(key, have);
      }
      if (host.firstChild !== have.el || host.childNodes.length !== 1) {
        while (host.firstChild) host.removeChild(host.firstChild);
        host.appendChild(have.el);
      }
    }
  }

  var E = ext();
  if (E && typeof E.slot === 'function') {
    E.slot('workTerminal', slot);
    E.slot('afterRender', function () { mountAll(); });
  }
  var SFo = W.PM56_SURFACES = W.PM56_SURFACES || {};
  SFo.commandCards = function () { return Array.from(cards.keys()); };
})();
