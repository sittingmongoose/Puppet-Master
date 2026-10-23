/* thought-demo.js -- Thought Stream recorded examples (DL-234), 2026-10-23. Demo Studio, Chat, Guided examples:
 * "While it thinks" (Auto) and "Always open" (Expanded), side by side in the gallery so the two can be compared.
 * Each opens an example chat of its own that shows its one mode (thread.thoughtDemo, read by thought-stream.js): the
 * Thought Stream setting is never written, and every other chat keeps following it. The recording asks one question on
 * the product's own composer; the model's reasoning streams in under its name; the answer starts and the block folds to
 * its line (While it thinks) or stays open above the answer (Always open). While it thinks ends by opening the folded
 * line again, as a reader would. The guide narrates what is happening and what comes next; its only buttons are Replay
 * and Close. Every action here is demo (8.15 rule 2): none of them is a command, and nothing calls a model.
 */
(function () {
  'use strict';
  var E = window.PM56_EXT, R = window.PM56_RECPLAY;
  if (!E || !E.slot || !R) return;
  var flows = {
    auto: { mode: 'Auto', title: 'While it thinks', name: 'Thinking · While it thinks',
      detail: 'The reasoning streams in while the model thinks, then folds to one line when the answer starts. Open the line to read it again.' },
    expanded: { mode: 'Expanded', title: 'Always open', name: 'Thinking · Always open',
      detail: 'The same question, with the reasoning kept open above the answer.' }
  };
  var Q = 'Should the index lead with tenant_id or created_at?';
  var SEND = '.composer [data-action="send"]';
  var PACE = { type: 1500, send: 650, reopen: 3200 };
  var active = null, seq = 0, player = null;
  function S() { return window.PM56_SHELL; }
  function C() { return E.ctx(); }
  function thread() { var c = C(); return active ? (c.state.threads || []).filter(function (t) { return t.id === active.thread; })[0] || null : null; }
  function turn() {
    var t = thread(); if (!t) return {};
    var at = -1;
    t.messages.forEach(function (m, i) { if (m.role === 'user' && m.body === Q) at = i; });
    if (at < 0) return {};
    var rest = t.messages.slice(at + 1);
    return { asked: true, T: rest.filter(function (m) { return m.type === 'thought'; })[0] || null, reply: rest.filter(function (m) { return m.role === 'assistant' && m.type === 'text'; })[0] || null };
  }
  function phase() {
    var x = turn();
    if (!x.asked) return 'ask';
    if (!x.T || x.T.thought.state === 'thinking') return 'thinking';
    if (!x.reply || x.reply.streaming) return 'answering';
    return 'answered';
  }
  function head(T) { return '.transcript-inner > .message-thought[data-message-id="' + CSS.escape(T.id) + '"] .tt-head'; }
  /* the recording: next() names the next beat from the example's own state (PM56_RECPLAY) */
  function next() {
    var a = active; if (!a) return null;
    var c = C(); if (c.state.selectedThread !== a.thread) return null;
    var p = phase();
    if (p === 'ask') {
      var f = R.find(R.COMPOSER);
      if (f && f.value === Q) return { id: 'send', wait: PACE.send, run: function () { return R.press(SEND); } };
      return { id: 'type', wait: PACE.type, run: function () { return R.type(Q); } };
    }
    if (p === 'answered' && a.kind === 'auto' && !a.reopened) {
      var T = turn().T, open = window.PM56_THOUGHT && T ? window.PM56_THOUGHT.isOpen(T.id) : true;
      if (open) { a.reopened = true; return null; }
      return { id: 'reopen', wait: PACE.reopen, run: function () { return R.press(head(T)).then(function (ok) { if (ok) a.reopened = true; return ok; }); } };
    }
    return null;
  }
  function playback() {
    if (player) player.stop();
    var s = active;
    player = R.play({ key: 'thought-demo', live: function () { return active === s; }, threads: function () { return [s.thread]; }, next: next,
      render: function () { C().renderApp(); }, superseded: function () { if (active === s) active = null; } });
  }
  function stop() { if (player) { player.stop(); player = null; } }
  /* one plain sentence per state: what is happening, and what comes next */
  function step() {
    var a = active, f = flows[a.kind], name = '<b>' + f.title + '</b> · ', p = phase();
    if (player && player.errors.length) return { text: name + 'This step couldn’t run, so the recording stopped here. Replay starts it again.', done: true };
    if (p === 'ask') return { text: name + (a.kind === 'auto'
      ? 'This chat shows the reasoning while the model thinks, then folds it away. Next: you ask a question that needs some thought.'
      : 'This chat keeps the reasoning open. Next: you ask a question that needs some thought.') };
    if (p === 'thinking') return { text: name + (a.kind === 'auto'
      ? 'The model is thinking. Its reasoning streams in under its name, the newest lines in view. Next: the answer starts and the reasoning folds to one line.'
      : 'The model is thinking. Its reasoning streams in under its name. Next: the answer starts below it.') };
    if (p === 'answering') return { text: name + (a.kind === 'auto'
      ? 'The answer is being written. The reasoning folded to one line that says how long it thought. Next: you open that line again.'
      : 'The answer is being written, and the reasoning stays open above it.') };
    if (a.kind === 'auto' && !a.reopened) return { text: name + 'The answer is written. Next: you open the folded line to read the reasoning again.' };
    return { text: 'Done · ' + (a.kind === 'auto'
      ? 'The reasoning folded when the answer started, and its line opens it again.'
      : 'The reasoning stayed open beside the answer.') + ' Your Thought Stream setting decides this for every chat; this example didn’t change it.', done: true };
  }
  function guide(c) {
    if (!active || c.thread.id !== active.thread || c.state.dialog) return '';
    var s = step(), text = R.steady(active, s.text, !!s.done, function () { C().renderApp(); });
    return S().pmxGuide({ key: 'thought-demo-guide', cls: 'thought-demo-guide', placement: 'dock', step: text,
      actions: s.done && text === s.text ? [{ action: 'thought-demo-replay', label: 'Replay' }] : [], next: player && player.progress(),
      close: { action: 'thought-demo-close', label: 'Close the example' } });
  }
  function start(kind) {
    var f = flows[kind]; if (!f) return;
    var c = C(), n = ++seq, id = 'thought-demo-' + n + '-' + kind, iso = new Date().toISOString();
    var t = { id: id, title: f.name, status: 'idle', pinned: false, archived: false, updated: 'now', unread: 0, demo: true, thoughtDemo: f.mode,
      model: (c.model && c.model.name) || 'Claude Sonnet 4.6', worktree: 'feature/query-index', summary: f.detail, messages: [
        { id: id + '-u0', role: 'user', type: 'text', body: 'We are adding a composite index for the analytics reads. One question before the migration.', time: iso },
        { id: id + '-a0', role: 'assistant', type: 'text', rich: true, time: iso,
          body: 'Recorded example: ask something that needs a little thought, and the reasoning the model shares arrives before its answer.' }] };
    c.state.threads.unshift(t);
    if (window.PM56_CTX && window.PM56_CTX.seedThread) window.PM56_CTX.seedThread(id);
    active = { kind: kind, thread: id, reopened: false };
    Object.assign(c.state, { mode: 'Agent', menu: null, dialog: null, hover: null, composer: '' });
    c.switchThread(id);
    playback();
  }
  E.slot('composerBelow', guide);
  E.action('thought-demo-start', function (c, b) { start(b.dataset.flow); return true; });
  E.action('thought-demo-replay', function () { if (active) start(active.kind); return true; });
  E.action('thought-demo-close', function (c) { stop(); active = null; c.renderApp(); return true; });
  E.chainAction('reset-all', function () { stop(); active = null; return false; });
  var G = window.PM56_REPAIR_DEMOS;
  if (G && G.gallery) {
    var old = G.gallery;
    G.gallery = function (c) {
      return '<section class="demo-section"><h3>Guided Thought Stream examples</h3><div class="demo-section-body">' +
        Object.keys(flows).map(function (k) { var f = flows[k]; return '<button class="demo-trigger" data-action="thought-demo-start" data-flow="' + k + '"><strong>' + c.esc(f.title) + '</strong><small>' + c.esc(f.detail) + '</small></button>'; }).join('') +
        '</div></section>' + old(c);
    };
  }
  window.PM56_THOUGHT_DEMOS = { start: start, phase: function () { return active ? phase() : null; }, snapshot: function () { return active ? { kind: active.kind, thread: active.thread, reopened: active.reopened, phase: phase() } : null; }, question: Q };
})();
