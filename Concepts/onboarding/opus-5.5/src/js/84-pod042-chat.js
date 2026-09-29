/* O55.pod042 — Pod 042 in the real Assistant Chat (NieR Mode's World part "Pod 042 in Chat", key pod042).
   tools/build.py adds 'Pod 042' to the chat's PERSONA_CATALOG after Teacher; styles.d/15-nier-world.css shows it in the
   picker only while NieR Mode and this part are on. While it is the chosen persona (and the part is live), a send in
   any thread except the tour's Guided example is answered here, the Teacher adapter's way (81-tour-chat.js): locally,
   through the chat's own stream path, with no provider call, no usage and no context growth, and labelled honestly
   instead of the model line. It speaks in Pod voice ("Analysis:", "Proposal:", "Query:", "Report:", "Alert:") from
   src/copy.json `pod042`, reading only state the app already has (the run, the Usage context, NieR Mode's parts).
   When NieR Mode or the part goes while Pod 042 is chosen, the chat goes back to the persona chosen before it, through
   the picker's own item. */
(function () {
  'use strict';
  const O55 = window.O55, U = O55.util, T = (k, v) => O55.t(k, v), M = O55.motion;
  const NAME = 'Pod 042';
  const P = O55.pod042 = { prev: null, answered: [], fellBack: 0 };
  const d = () => window.PM_DEMO;
  const live = () => { try { return !!(window.PM_NIER && window.PM_NIER.has('pod042')); } catch (e) { return false; } };
  const personaNow = () => ((document.querySelector('#chatPanel .persona-label') || document.querySelector('.persona-label') || {}).textContent || '').trim();
  P.persona = personaNow;

  /* ---------------------------------------------------------------- answers */
  const lines = (key, vars) => (O55.tx('pod042.' + key) || []).map((l) => (vars ? String(l).replace(/\{(\w+)\}/g, (m, k) => (vars[k] == null ? m : String(vars[k]))) : String(l)));
  const kfmt = (n) => (n >= 1000 ? `${Math.round(n / 100) / 10}k` : String(n));
  function answerFor(text) {
    const q = String(text || '').trim(), low = q.toLowerCase();
    let key = 'unknown', vars = { q: q.length > 48 ? q.slice(0, 47) + '…' : q };
    if (/\b(thanks|thank you|thx)\b/.test(low)) key = 'thanks';
    else if (/\b(build|run|runs|orchestrator|lane|lanes|progress)\b/.test(low)) {
      const run = (d() && d().state && d().state.run) || {};
      if (!run.id || run.stage === 'idle') key = 'runNone';
      else if (run.stage === 'complete') { key = 'runDone'; vars = { run: run.id }; }
      else {
        const lanes = Array.isArray(run.lanes) ? run.lanes : [];
        key = 'runLive'; vars = { run: run.id, stage: String(run.stage || 'running').replace(/-/g, ' '), done: lanes.filter((l) => l && l.state === 'complete').length, total: lanes.length };
      }
    } else if (/\b(plan|plans|planning|wizard|approve)\b/.test(low)) key = 'plan';
    else if (/\b(usage|token|tokens|context|cost|costs|limit|budget)\b/.test(low)) {
      let c = null;
      try { const u = window.PM7_USAGE.data.context; if (u && u.limit) c = { used: u.used, max: u.limit }; } catch (e) { c = null; }
      if (!c) { try { const s = d().state.chat.context; c = { used: s.used, max: s.max }; } catch (e) { c = null; } }
      if (c) { const pct = Math.round(100 * c.used / c.max); key = pct >= 75 ? 'usageHigh' : 'usage'; vars = { used: kfmt(c.used), max: kfmt(c.max), pct }; } else key = 'unknown';
    } else if (/\b(undo|history|back|safe|mistake|restore|version)\b/.test(low)) key = 'safe';
    else if (/\b(nier|theme|look|parts?|chips?|settings?)\b/.test(low)) {
      const N = window.PM_NIER; key = 'nier'; vars = { n: N ? N.parts().length : 0, all: N ? N.PARTS.length : 29 };
    } else if (/^(hi|hello|hey|yo)\b|\bpod\b|status|report/.test(low)) key = 'greet';
    const html = lines(key, vars).map((l) => { const m = /^(\w+):\s*(.*)$/.exec(l); return m ? `<p><strong>${U.esc(m[1])}:</strong> ${U.esc(m[2])}</p>` : `<p>${U.esc(l)}</p>`; }).join('');
    return { key, html };
  }
  P.answerFor = answerFor;

  /* ---------------------------------------------------------------- the send path */
  let origSend = null, seq = 0;
  function localSend(threadId, text) {
    const dm = d(), th = dm.state.chat.threads[threadId];
    const a = answerFor(text), msgId = 'o55-pod042-' + Date.now().toString(36) + '-' + (++seq);
    th.messages.push({ role: 'user', text, pod042: true });
    dm.emit('chat.stream', { threadId, type: 'user', text });
    M.after(380, () => {
      dm.emit('chat.stream', { threadId, msgId, type: 'start', intent: 'pod042' });
      dm.stream.start((chunk) => dm.emit('chat.stream', { threadId, msgId, type: 'chunk', html: chunk }), a.html, {
        onDone: () => {
          th.messages.push({ role: 'assistant', html: a.html, pod042: true, mid: msgId });
          dm.emit('chat.stream', { threadId, msgId, type: 'done' });
          P.answered.push({ key: a.key, mid: msgId });
          M.after(40, () => relabel(msgId));
        }
      });
    });
    return { ok: true, local_deterministic: true };
  }
  function relabel(mid) {
    document.querySelectorAll(`[data-pm6-mid="${mid}"]`).forEach((n) => {
      const m = n.closest('.pm6-chat-msg') || n;
      m.setAttribute('data-o55-pod042', '1');
      const snap = m.querySelector('.runtime-snapshot'); if (snap) snap.textContent = T('pod042.label');
      const pop = m.querySelector('.msg-runtime-popover'); if (pop) pop.innerHTML = `<div class="popover-row"><span class="popover-value">${U.esc(T('pod042.popover'))}</span></div>`;
      m.querySelectorAll('.msg-hover-row .msg-meta, .msg-meta-model').forEach((x) => { x.textContent = T('pod042.label'); });
    });
  }
  P.install = function install() {
    const dm = d(); if (!dm || !dm.chat || origSend) return !!origSend;
    origSend = dm.chat.send;
    dm.chat.send = function (threadId, text) {
      const id = threadId || (dm.state.chat && dm.state.chat.activeThread) || 'th-main';
      const th = dm.state.chat && dm.state.chat.threads[id];
      const mine = live() && personaNow() === NAME && th && !th.guided_example && !dm.state.chat.busy && String(text == null ? '' : text).trim();
      return mine ? localSend(id, String(text).trim()) : origSend.apply(dm.chat, arguments);
    };
    return true;
  };

  /* ---------------------------------------------------------------- fallback: the persona chosen before Pod 042 */
  document.addEventListener('click', (e) => {
    const it = e.target && e.target.closest ? e.target.closest('.pm6-chat-personaitem') : null;
    if (!it || it.getAttribute('data-persona') !== NAME) return;
    const cur = personaNow(); if (cur && cur !== NAME) P.prev = cur;
  }, true);
  function fallBack() {
    if (live() || personaNow() !== NAME) return false;
    const want = P.prev && P.prev !== NAME ? P.prev : 'Product Manager';
    const item = document.querySelector(`.pm6-chat-persona-popout-portal .pm6-chat-personaitem[data-persona="${want}"]`)
      || document.querySelector('.pm6-chat-persona-popout-portal .pm6-chat-personaitem:not([data-persona="Pod 042"])');
    if (!item) return false;
    item.click();
    P.fellBack++;
    return true;
  }
  P.fallBack = fallBack;
  function wire() {
    P.install();
    const N = window.PM_NIER;
    if (N && typeof N.onChange === 'function' && !P.wired) { P.wired = true; N.onChange(() => fallBack()); }
  }
  wire();
  window.addEventListener('load', wire);
})();
