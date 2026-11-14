/* The quiet memory in the hosted chat (FO-167, 2026-11-12: the Memory design Jared approved on 2026-11-11,
   share/puppet-master/2026-11-11-memory-review, mock screens 08, 09 and 10).
   - Memory is one list, Settings > Memory & Automation > Memory. The chat's Memory button (beside the Context Lens in
     the chat header) and the wand's Memory row open that same page as a sheet over the chat (window.PM7_MEMORY from
     the Settings manager, 30-memory.js); the old Memory sheet, its next-message ribbon, its counts, the note detail
     with Verify, Pin and Discard, and the Gist Review document are not reachable here.
   - A reply that saved something ends with one small line, "Saved to memory · View" (mock 08); "Remember that I always
     use pnpm" saves a note and gets one line naming where it applies, "Got it. Saved to memory for every project. View"
     (mock 09). View opens the sheet with that note lit. Nothing else about memory is said in a reply
     (patches_memory.py turns off the reply marks, the rule-change line and the note made after every reply).
   - Demo Studio's Memory examples show those two moments in a "Tests" chat (pm7-memory-demo, flows saved and remember).
   A message that saved a note carries memorySaved: { id, inline } (inline: the View sits at the end of a one-line
   reply). */
var W = window, E = W.PM56_EXT, A = W.PM56_APP;
if (!W.PM56_HOST || !E || !A) return;
var M = function () { return W.PM7_MEMORY || null; };
var esc = function (s) { return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]; }); };
var BRAIN = '<svg class="pm7-mem-glyph" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">'
  + '<path d="M9.5 4.5A3.5 3.5 0 0 0 6 8v1a3.5 3.5 0 0 0 0 7v.5A3.5 3.5 0 0 0 9.5 20"/><path d="M14.5 4.5A3.5 3.5 0 0 1 18 8v1a3.5 3.5 0 0 1 0 7v.5a3.5 3.5 0 0 1-3.5 3.5"/><path d="M12 4v16M8 9h4m4 6h-4"/></svg>';
var CHECK = '<svg class="pm7-mem-check" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="m5 13 4 4L19 7"/></svg>';

function open(flash, from) {
  var mem = M(); if (!mem) return false;
  var c = A.ctx && A.ctx(); if (c) { if (c.state.menu) c.closeMenu(); if (c.state.dialog) c.closeDialog(); }
  return mem.openSheet({ flash: flash || '', from: from || null }).ok;
}

/* the header button, after the Context Lens (mock: lens, Memory, search) */
E.slot('headerLeading', function () {
  return '<button class="icon-button pm7-mem-btn" data-k="pm7-membtn" data-action="pm7-memory-open" aria-label="Memory" data-hover-key="pm7-membtn" data-hover-tip="Memory">' + BRAIN + '</button>';
});
E.action('pm7-memory-open', function (c, b) { open('', b); return true; });
E.action('pm7-memory-view', function (c, b) { open(b && b.dataset && b.dataset.id, b); return true; });
/* the wand's Memory row, and anything that asks for the old sheet or its document, open the one page */
E.chainAction('af-memory-open', function (c, b) { open('', b); return true; });
E.chainAction('memory-open', function (c, b) { open('', b); return true; });

/* the one line a reply may carry */
E.slot('messageBodyEnd', function (c) {
  var m = c.message, s = m && m.memorySaved;
  if (!s || m.role !== 'assistant' || !s.id) return '';
  var view = '<button type="button" class="pm7-mem-view' + (s.inline ? ' is-inline' : '') + '" data-action="pm7-memory-view" data-id="' + esc(s.id) + '">View</button>';
  if (s.inline) return view;
  return '<p class="pm7-mem-saved" data-k="pm7-saved:' + esc(m.id) + '">' + CHECK + '<span>Saved to memory</span> <span class="pm7-mem-sep" aria-hidden="true">·</span> ' + view + '</p>';
});

/* "Remember that …" saves a note; the reply names where it applies (personal words: every project) */
var RX = /^\s*(?:please\s+)?remember\s+(?:that\s+|this\s*[:,-]?\s*)?(.+?)\s*$/i;
function noteFrom(fact) {
  var t = String(fact || '').replace(/[.!\s]+$/, '').trim();
  t = t.replace(/^i\s+(always|never|usually|prefer|like|want|use|need)\b/i, '$1');
  return t ? t.charAt(0).toUpperCase() + t.slice(1) + '.' : '';
}
function personal(fact) { return /\b(i|i'm|i’m|i've|my|me|mine)\b/i.test(fact); }
var seq = 0;
var stamp = function () { return new Date().toISOString(); };
var RT = W.PM56_RUNTIME, composer = RT && RT.composer;
if (composer && Array.isArray(composer.preSendHooks)) {
  composer.preSendHooks.unshift(function (c, t, raw) {
    var dest = (composer.bufferFor && composer.bufferFor(t.id).destination) || composer.destination;
    if (dest && dest.kind !== 'assistant') return false;
    var mem = M(), hit = RX.exec(raw || ''); if (!mem || !hit) return false;
    var text = noteFrom(hit[1]); if (!text) return false;
    var id = 'pm7-mem-' + (++seq) + '-' + Date.now().toString(36);
    c.appendMessage({ id: id + '-user', role: 'user', type: 'text', body: raw, time: stamp() }, t);
    var reply;
    if (!mem.on()) reply = { id: id + '-reply', role: 'assistant', type: 'text', body: 'Memory is off, so nothing was saved.', time: stamp() };
    else {
      var out = mem.save(text, personal(hit[1]) ? 'every' : 'project');
      reply = out.ok ? { id: id + '-reply', role: 'assistant', type: 'text', body: 'Got it. Saved to memory ' + mem.levelPhrase(out.level) + '.', time: stamp(), memorySaved: { id: out.id, inline: true } }
        : { id: id + '-reply', role: 'assistant', type: 'text', body: 'I couldn’t save that.', time: stamp() };
    }
    setTimeout(function () { var cx = A.ctx(), th = cx && cx.state.threads.find(function (x) { return x.id === t.id; }); if (th) cx.appendMessage(reply, th); }, 450);
    return { claimed: true };
  });
}

/* Demo Studio: the two moments of mock 08 and 09 in a "Tests" chat */
var FLOWS = {
  saved: { title: 'A reply that saved something', detail: 'The reply fixes a failing test and ends with one quiet line: Saved to memory · View.' },
  remember: { title: 'Remember that I always use pnpm', detail: 'Ask it to remember something and it says where the note applies, with a View link.' }
};
var dseq = 0;
function demo(kind) {
  var c = A.ctx(), mem = M(); if (!c || !FLOWS[kind]) return false;
  var base = c.state.threads.find(function (x) { return x.id === 'plain'; }) || c.state.threads[0];
  var id = 'pm7-memory-demo-' + kind + '-' + (++dseq);
  var t = JSON.parse(JSON.stringify(base));
  var at = function (min) { return new Date(Date.now() - min * 60000).toISOString(); };
  var saved = mem ? mem.save('API tests need the local Postgres test database on port 5433.', 'project') : { ok: false };
  var msgs = [
    { id: id + '-u1', role: 'user', type: 'text', body: 'The API tests keep failing on my machine. Can you find out why?', time: at(6), sentAt: at(6) },
    { id: id + '-a1', role: 'assistant', type: 'text', rich: true, body: 'They expect the test database on port 5433, and yours runs on the default 5432. I pointed `DATABASE_URL` in `.env.test` at 5433 and started it with `docker compose up -d db-test`.\n\nAll 214 API tests pass now.', time: at(4), sentAt: at(4), memorySaved: saved.ok ? { id: saved.id } : null }
  ];
  if (kind === 'remember') {
    var p = mem ? mem.save('Always use pnpm, not npm or yarn.', 'every') : { ok: false };
    msgs.push({ id: id + '-u2', role: 'user', type: 'text', body: 'Remember that I always use pnpm', time: at(1), sentAt: at(1) });
    msgs.push({ id: id + '-a2', role: 'assistant', type: 'text', body: 'Got it. Saved to memory for every project.', time: at(1), sentAt: at(1), memorySaved: p.ok ? { id: p.id, inline: true } : null });
  }
  Object.assign(t, { id: id, title: 'Tests', pinned: false, archived: false, goalId: null, worktree: null, messages: msgs, messageCount: msgs.length, updatedAt: at(1) });
  c.state.threads.push(t);
  Object.assign(c.state, { menu: null, dialog: null, hover: null, historyMode: 'closed', composer: '' });
  c.switchThread(id);
  c.renderApp();
  return true;
}
E.action('pm7-memory-demo', function (c, b) { demo(b && b.dataset && b.dataset.flow); return true; });
var G = W.PM56_REPAIR_DEMOS;
if (G && typeof G.gallery === 'function') {
  var prev = G.gallery;
  G.gallery = function (c) {
    /* the old recorded examples (a note a test proves, a note that suggests changing a locked rule) show what memory
       no longer does; the quiet page's two moments take their place */
    var rest = String(prev(c)).replace(/<section class="demo-section"><h3>Memory · recorded examples<\/h3>[\s\S]*?<\/section>/, '');
    return '<section class="demo-section"><h3>Memory · recorded examples</h3><div class="demo-section-body">'
      + Object.keys(FLOWS).map(function (k) { return '<button class="demo-trigger" data-action="pm7-memory-demo" data-flow="' + k + '"><strong>' + esc(FLOWS[k].title) + '</strong><small>' + esc(FLOWS[k].detail) + '</small></button>'; }).join('')
      + '</div></section>' + rest;
  };
}
W.PM7_CHAT_MEMORY = { open: open, demo: demo, noteFrom: noteFrom };
