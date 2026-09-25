/* O55.tour.chat — the Teacher fixture inside the real Assistant Chat. A "Guided example" thread is created through the
   chat facade; sends in that thread (and only that thread) are answered locally through the real stream path, so the
   finished Chat UI shows the answer with no provider call, no usage and no context growth. Guided messages are labelled
   honestly ("Guided example · Teacher") instead of the chat's model/token/cost line. ELI5 rewrites the same bubble:
   kept words stay, removed words fold away, new words type in. */
(function () {
  'use strict';
  const O55 = window.O55, U = O55.util, T = (k, v) => O55.t(k, v), M = O55.motion, TR = O55.tour;
  const C = TR.chat = { threadId: null, answers: {}, sent: [], lastMid: null };
  let origSend = null, obs = null, seq = 0;
  const d = () => window.PM_DEMO;
  const eli5On = () => !!TR.q('span.chat-toggle-btn.toggle-eli5.active');
  const guided = (id) => { const th = d() && d().state.chat.threads[id]; return !!(th && th.guided_example); };

  /* ---------------------------------------------------------------- answers (local, grouped Teacher topics) */
  function answerFor(text) {
    const q = String(text || '').trim().toLowerCase();
    const tx = (k) => T('tour.teacher.' + k);
    if (q.includes('before puppet master changes') || q.includes('changes my files')) return { key: 'a1', html: `<p>${U.esc(eli5On() ? tx('a1eli5') : tx('a1'))}</p>` };
    if (q.includes('what is a project')) return { key: 'a2', html: `<p>${U.esc(eli5On() ? tx('a2eli5') : tx('a2'))}</p>` };
    const topics = O55.tx('tour.teacher.answers');
    const hit = [['chat', /chat|ask|teacher/], ['plan', /plan|wizard|build/], ['safe', /undo|history|back|safe|mistake/]].find(([, re]) => re.test(q));
    if (hit) return { key: hit[0], html: `<p>${U.esc(topics[hit[0]])}</p>` };
    const sugg = Object.values(O55.tx('tour.teacher.topics'));
    return { key: 'suggest', html: `<p>${U.esc(tx('own'))}</p><ul>${sugg.map((s) => `<li>${U.esc(s)}</li>`).join('')}</ul>` };
  }

  /* ---------------------------------------------------------------- install / uninstall */
  C.install = function install() {
    const dm = d(); if (!dm || !dm.chat || origSend) return;
    origSend = dm.chat.send;
    dm.chat.send = function (threadId, text) {
      if (!guided(threadId)) return origSend.apply(dm.chat, arguments);
      return localSend(threadId, text);
    };
    obs = new MutationObserver((muts) => { for (const m of muts) for (const n of m.addedNodes) if (n.nodeType === 1) relabelWithin(n); });
    const panel = document.getElementById('chatPanel'); if (panel) obs.observe(panel, { childList: true, subtree: true });
  };
  C.uninstall = function uninstall() { const dm = d(); if (dm && origSend) dm.chat.send = origSend; origSend = null; if (obs) obs.disconnect(); obs = null; };

  function localSend(threadId, text) {
    const dm = d(), th = dm.state.chat.threads[threadId];
    const a = answerFor(text), msgId = 'o55-teacher-' + Date.now().toString(36) + '-' + (++seq);
    C.sent.push(String(text || ''));
    /* both halves of an exchange carry its id, so Back in the tour can take the exchange back out */
    th.messages.push({ role: 'user', text, guided_example: true, mid: msgId });
    dm.emit('chat.stream', { threadId, type: 'user', text });
    C.lastMid = msgId; C.answers[msgId] = { key: a.key, question: text };
    /* a short, honest pause before the guided answer streams through the real renderer (an exchange taken back by
       Back before its answer arrives never answers) */
    M.after(450, () => {
      if (!C.answers[msgId]) return;
      dm.emit('chat.stream', { threadId, msgId, type: 'start', intent: 'guided_teacher' });
      dm.stream.start((chunk) => dm.emit('chat.stream', { threadId, msgId, type: 'chunk', html: chunk }), a.html, {
        onDone: () => { if (!C.answers[msgId]) return; th.messages.push({ role: 'assistant', html: a.html, guided_example: true, mid: msgId }); dm.emit('chat.stream', { threadId, msgId, type: 'done' }); C.answers[msgId].done = true; relabelWithin(document.getElementById('chatPanel')); }
      });
    });
    return { ok: true, local_deterministic: true };
  }

  /* ---------------------------------------------------------------- honest labels on guided messages */
  function relabelWithin(root) {
    if (!root || !C.threadId || d().state.chat.activeThread !== C.threadId) return;
    const msgs = root.matches && root.matches('.pm6-chat-msg') ? [root] : [...root.querySelectorAll('.pm6-chat-msg')];
    msgs.forEach((m) => {
      if (m.getAttribute('data-o55-guided') === '1') return;
      if (!m.closest('#chatPanel')) return;
      m.setAttribute('data-o55-guided', '1');
      const assistant = m.classList.contains('assistant');
      const snap = m.querySelector('.runtime-snapshot'); if (snap) snap.textContent = assistant ? T('tour.teacher.label') : T('tour.teacher.labelUser');
      const pop = m.querySelector('.msg-runtime-popover'); if (pop) pop.innerHTML = `<div class="popover-row"><span class="popover-value">${U.esc(T('tour.teacher.popover'))}</span></div>`;
      m.querySelectorAll('.msg-hover-row .msg-meta, .msg-meta-model').forEach((n) => { n.textContent = T('tour.teacher.label'); });
    });
  }
  C.relabel = () => relabelWithin(document.getElementById('chatPanel'));

  /* ---------------------------------------------------------------- the guided thread */
  C.ensureThread = async function ensureThread() {
    const dm = d(); if (!dm) return null;
    if (C.threadId && dm.state.chat.threads[C.threadId]) return C.threadId;
    const made = dm.chat.newThread('teacher'), id = made && made.threadId; if (!id) return null;
    const th = dm.state.chat.threads[id]; th.title = T('tour.teacher.thread'); th.guided_example = true;
    if (window.PM6_CHAT_THREADS && window.PM6_CHAT_THREADS[id]) window.PM6_CHAT_THREADS[id].title = T('tour.teacher.thread');
    C.threadId = id;
    await M.delay(160);
    const row = document.querySelector(`.chat-thread-item[data-thread="${id}"]`);
    if (row) { const t = row.querySelector('.thread-title'); if (t) t.textContent = T('tour.teacher.thread'); row.classList.add('o55-guided-thread'); row.click(); }
    return id;
  };
  C.selectThread = (id) => { const row = document.querySelector(`.chat-thread-item[data-thread="${id}"]`); if (row) row.click(); };

  /* ---------------------------------------------------------------- controls (real) */
  C.personaBtn = () => TR.q('.pm6-chat-personabtn');
  C.personaItem = (name) => TR.q(`.pm6-chat-personaitem[data-persona="${name}"]`);
  C.persona = () => ((TR.q('#chatPanel .persona-label') || {}).textContent || '').trim();
  C.eli5Btn = () => TR.q('span.chat-toggle-btn.toggle-eli5');
  C.composer = () => TR.q('#chatPanel textarea.pm6-chat-input') || TR.q('textarea.pm6-chat-input');
  C.sendBtn = () => TR.q('#chatPanel .pm6-chat-send') || TR.q('.pm6-chat-send');
  C.chatVisible = () => { const api = window.PM_HOME_WORKSPACE, s = api && api.layout.surfaces.find((x) => x.surface_kind === 'chat'); const p = document.getElementById('chatPanel'); return !!(s && s.visible && p && !p.classList.contains('hidden') && p.getBoundingClientRect().width > 40); };
  C.lastAnswerEl = () => { const mid = C.lastMid; return mid ? document.querySelector(`#chatPanel [data-pm6-mid="${mid}"]`) : null; };
  C.answered = (key) => Object.values(C.answers).some((a) => a.key === key && a.done);

  /* ---------------------------------------------------------------- ELI5: rewrite the same bubble */
  function words(s) { return String(s).split(/\s+/).filter(Boolean); }
  function diff(a, b) {
    const n = a.length, m = b.length, L = Array.from({ length: n + 1 }, () => new Int16Array(m + 1));
    const norm = (w) => w.toLowerCase().replace(/[^a-z0-9’']/g, '');
    for (let i = n - 1; i >= 0; i--) for (let j = m - 1; j >= 0; j--) L[i][j] = norm(a[i]) === norm(b[j]) ? L[i + 1][j + 1] + 1 : Math.max(L[i + 1][j], L[i][j + 1]);
    const ops = []; let i = 0, j = 0;
    while (i < n && j < m) { if (norm(a[i]) === norm(b[j])) { ops.push(['keep', b[j]]); i++; j++; } else if (L[i + 1][j] >= L[i][j + 1]) ops.push(['del', a[i++]]); else ops.push(['ins', b[j++]]); }
    while (i < n) ops.push(['del', a[i++]]); while (j < m) ops.push(['ins', b[j++]]);
    return ops;
  }
  C.rewrite = function rewrite(toEli5) {
    const el = C.lastAnswerEl(); if (!el) return false;
    const info = C.answers[C.lastMid]; if (!info || !/^a[12]$/.test(info.key)) return false;
    const from = T('tour.teacher.' + info.key + (toEli5 ? '' : 'eli5')), to = T('tour.teacher.' + info.key + (toEli5 ? 'eli5' : ''));
    const sink = el.querySelector('.pm6-chat-sink') || el.querySelector('.msg-body'); if (!sink) return false;
    if (M.reduced()) { sink.innerHTML = `<p>${U.esc(to)}</p>`; return true; }
    let k = 0;
    sink.innerHTML = '<p class="o55e">' + diff(words(from), words(to)).map(([op, w]) => {
      if (op === 'keep') return `<span class="o55e-w">${U.esc(w)} </span>`;
      if (op === 'del') return `<span class="o55e-w o55e-del">${U.esc(w)} </span>`;
      return `<span class="o55e-w o55e-ins" style="--k:${k++}">${U.esc(w)} </span>`;
    }).join('') + '</p>';
    O55.sound.play('select');
    M.after(700 + k * 45 + 400, () => { if (sink.isConnected) sink.innerHTML = `<p>${U.esc(to)}</p>`; });
    return true;
  };
  C.eli5Shown = () => { const el = C.lastAnswerEl(); if (!el) return false; const info = C.answers[C.lastMid]; return !!(info && el.textContent.includes(T('tour.teacher.' + info.key + 'eli5').slice(0, 24))); };

  /* ---------------------------------------------------------------- persona, the guided thread's removal */
  const personaNow = () => ((document.querySelector('#chatPanel .persona-label') || {}).textContent || '').trim();
  async function setPersona(name) {
    if (!name || personaNow() === name || !C.personaBtn()) return false;
    C.personaBtn().click(); await M.delay(260);
    const it = [...document.querySelectorAll('.pm6-chat-personaitem')].find((b) => TR.vis(b) && (b.getAttribute('data-persona') === name || b.textContent.trim() === name));
    if (it) { it.click(); return true; }
    document.body.click(); return false;
  }
  function dropGuided(selectId) {
    const dm = d(); if (!dm || !C.threadId) return;
    if (selectId && dm.state.chat.threads[selectId]) C.selectThread(selectId);
    delete dm.state.chat.threads[C.threadId];
    dm.state.chat.order = (dm.state.chat.order || []).filter((x) => x !== C.threadId);
    const row = document.querySelector(`.chat-thread-item[data-thread="${C.threadId}"]`); if (row) row.remove();
    C.threadId = null;
  }

  /* ---------------------------------------------------------------- Back in the tour */
  /* mark(): the conversation as a step begins. rewind(mark): exchanges made since leave the thread (its record and
     every stream showing it), and persona, ELI5 and the composer go back, so the step can be done again. */
  C.mark = () => {
    const dm = d(), th = C.threadId && dm && dm.state.chat.threads[C.threadId];
    return { thread: dm && dm.state.chat ? dm.state.chat.activeThread : null, guided: !!th, answers: Object.keys(C.answers), sent: C.sent.length, lastMid: C.lastMid,
      persona: personaNow(), eli5: eli5On(), draft: ((C.composer() || {}).value) || '' };
  };
  C.rewind = async function rewind(m) {
    if (!m) return;
    const dm = d(); if (!dm) return;
    const keep = new Set(m.answers), th = C.threadId && dm.state.chat.threads[C.threadId];
    Object.keys(C.answers).filter((k) => !keep.has(k)).forEach((k) => { delete C.answers[k]; });
    C.sent.length = Math.min(C.sent.length, m.sent); C.lastMid = m.lastMid;
    if (th && !m.guided) dropGuided(m.thread); /* before the guided example existed: the learner's own thread again */
    else if (th) {
      const before = th.messages.length;
      for (let i = th.messages.length - 1; i >= 0; i--) if (th.messages[i].mid && !keep.has(th.messages[i].mid)) th.messages.splice(i, 1);
      if (th.messages.length !== before) {
        if (!m.lastMid) { dropGuided(null); await C.ensureThread(); } /* nothing kept: a fresh Guided example thread */
        else document.querySelectorAll(`[data-pm6-mid="${m.lastMid}"]`).forEach((node) => { let n = node.nextElementSibling; while (n) { const nx = n.nextElementSibling; if (n.classList.contains('pm6-chat-msg')) n.remove(); n = nx; } });
      }
    }
    if (m.eli5 !== eli5On() && C.eli5Btn()) { const showing = !m.eli5 && C.eli5Shown(); C.eli5Btn().click(); if (showing) C.rewrite(false); }
    if (m.persona && personaNow() !== m.persona) {
      const api = window.PM_HOME_WORKSPACE;
      if (!C.chatVisible() && api) { api.setSurfaceVisible('chat', true, 'cmd.panel.switch'); await M.delay(220); }
      await setPersona(m.persona);
    }
    const ta = C.composer(); if (ta && ta.value !== m.draft) { ta.value = m.draft; ta.dispatchEvent(new Event('input', { bubbles: true })); }
  };
  /* a new run of the tour remembers nothing of the last one */
  C.reset = () => { C.sent = []; C.answers = {}; C.lastMid = null; };

  /* ---------------------------------------------------------------- restore */
  C.restore = async function restore(snap, keep) {
    const dm = d(); const out = {};
    if (!dm || !snap) return out;
    if (!keep) {
      if (snap.eli5 !== eli5On() && C.eli5Btn()) { C.eli5Btn().click(); out.eli5 = 'restored'; }
      if (snap.persona && C.persona() !== snap.persona && C.personaBtn() && await setPersona(snap.persona)) out.persona = 'restored';
      if (snap.thread && dm.state.chat.threads[snap.thread]) { C.selectThread(snap.thread); out.thread = 'restored'; }
      if (C.threadId && dm.state.chat.threads[C.threadId]) {
        /* the Guided example thread leaves with the tour */
        delete dm.state.chat.threads[C.threadId];
        dm.state.chat.order = (dm.state.chat.order || []).filter((x) => x !== C.threadId);
        const row = document.querySelector(`.chat-thread-item[data-thread="${C.threadId}"]`); if (row) row.remove();
        out.guided = 'removed';
      }
      const ta = C.composer(); if (ta && ta.value !== snap.draft) { ta.value = snap.draft || ''; ta.dispatchEvent(new Event('input', { bubbles: true })); }
    }
    C.threadId = null; C.reset();
    return out;
  };
})();
