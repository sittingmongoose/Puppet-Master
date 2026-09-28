/* turn-stream.js -- Chat WOW (2026-09-26). OWNER of live assistant turns.
 *
 *   1. PM56_RICH   one op list, two renderers: the streaming writer and the final
 *                  template produce the same layout, so hand-back never reflows.
 *   2. Streams     a reply is a keyed placeholder whose body is a JS-owned island
 *                  (data-pm-keep). A rAF loop releases words from chunked arrival
 *                  through a rate smoother; the island's height follows its text
 *                  through a critically damped spring so new lines open, never jump.
 *   3. Flights     the text you send leaves the composer and becomes the bubble.
 *   4. Reveals     messages gated on a work run (revealAfter) stream in when the
 *                  run completes, and hold the chain's next run until they finish.
 *   5. Owner       registers as a turn owner: sends queue and Stop shows while a
 *                  reply is being written; Stop keeps the partial text.
 *
 * Voices: the transcript carries data-voice (basic | friendly | glass | retro).
 * Timing and order are identical across voices; only path, easing and texture
 * differ (turn-stream.css). Reduced motion lands every end state at once.
 */
(function () {
  'use strict';
  var EXT = window.PM56_EXT;
  if (!EXT || !EXT.slot) return;
  var D = window.PM56_DATA || {};

  function C() { return EXT.ctx(); }
  function reduced() { var M = window.PM56_MOTION; return !!(M && M.reduced && M.reduced()); }
  function now() { return window.PM56_CLOCK ? window.PM56_CLOCK.now() : performance.now(); }
  function esc(s) { return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]; }); }
  function sound(ev) { try { if (window.PM56_SOUND) window.PM56_SOUND.play(ev); } catch (e) { } }
  function voice() { var tr = document.querySelector('.transcript'); return (tr && tr.getAttribute('data-voice')) || 'basic'; }

  /* ================================================================ 1 rich text
     ops: {t:'block',tag,list} {t:'w',text,mark} {t:'s'} {t:'br'} {t:'line',text}
     Every op carries `end`, its offset in the source, so arrival can gate it. */
  function inline(text, base, ops) {
    var re = /(\*\*[^*]+\*\*|`[^`]+`)/g, last = 0, m;
    function plain(str, off) {
      var parts = str.split(/(\s+)/);
      var o = off;
      for (var i = 0; i < parts.length; i++) {
        var p = parts[i]; if (!p) continue;
        o += p.length;
        if (/^\s+$/.test(p)) ops.push({ t: 's', end: o });
        else ops.push({ t: 'w', text: p, mark: null, end: o });
      }
    }
    while ((m = re.exec(text))) {
      if (m.index > last) plain(text.slice(last, m.index), base + last);
      var tok = m[0];
      if (tok[0] === '`') ops.push({ t: 'w', text: tok.slice(1, -1), mark: 'code', end: base + m.index + tok.length });
      else {
        var inner = tok.slice(2, -2), words = inner.split(/(\s+)/), o = base + m.index + 2;
        for (var j = 0; j < words.length; j++) {
          var w = words[j]; if (!w) continue; o += w.length;
          if (/^\s+$/.test(w)) ops.push({ t: 's', end: o }); else ops.push({ t: 'w', text: w, mark: 'b', end: o });
        }
        ops[ops.length - 1].end = base + m.index + tok.length;
      }
      last = m.index + tok.length;
    }
    if (last < text.length) plain(text.slice(last), base + last);
  }
  function tokenize(src, opts) {
    var plainOnly = !!(opts && opts.plain);
    var text = String(src || '').replace(/\r\n/g, '\n');
    var ops = [], lines = text.split('\n'), off = 0, cur = null, blank = true, inCode = false;
    for (var i = 0; i < lines.length; i++) {
      var line = lines[i], start = off; off += line.length + 1;
      if (!plainOnly && /^```/.test(line)) {
        if (!inCode) { ops.push({ t: 'block', tag: 'pre', end: start }); cur = 'pre'; inCode = true; }
        else { inCode = false; cur = null; blank = true; }
        continue;
      }
      if (inCode) { ops.push({ t: 'line', text: line, end: start + line.length }); continue; }
      if (!line.trim()) { blank = true; continue; }
      var mm;
      if (!plainOnly && (mm = /^(#{2,3})\s+(.*)$/.exec(line))) {
        ops.push({ t: 'block', tag: mm[1].length === 2 ? 'h4' : 'h5', end: start }); inline(mm[2], start + mm[1].length + 1, ops); cur = 'h'; blank = true; continue;
      }
      if (!plainOnly && (mm = /^(\s*)([-*]|\d+\.)\s+(.*)$/.exec(line))) {
        var list = /\d/.test(mm[2]) ? 'ol' : 'ul';
        ops.push({ t: 'block', tag: 'li', list: list, end: start }); inline(mm[3], start + mm[1].length + mm[2].length + 1, ops); cur = 'li:' + list; blank = false; continue;
      }
      if (blank || cur !== 'p') { ops.push({ t: 'block', tag: 'p', end: start }); cur = 'p'; }
      else ops.push({ t: 'br', end: start });
      inline(line, start, ops); blank = false;
    }
    return ops;
  }
  function wordHtml(op) {
    var t = esc(op.text);
    return op.mark === 'b' ? '<strong>' + t + '</strong>' : op.mark === 'code' ? '<code>' + t + '</code>' : t;
  }
  function opsToHtml(ops) {
    var out = '', block = null, list = null;
    function closeBlock() { if (block) { out += block === 'pre' ? '</code></pre>' : '</' + block + '>'; block = null; } }
    function closeList() { if (list) { out += '</' + list + '>'; list = null; } }
    for (var i = 0; i < ops.length; i++) {
      var op = ops[i];
      if (op.t === 'block') {
        closeBlock();
        if (op.tag === 'li') { if (list !== op.list) { closeList(); out += '<' + op.list + '>'; list = op.list; } }
        else closeList();
        out += op.tag === 'pre' ? '<pre><code>' : '<' + op.tag + '>'; block = op.tag;
      } else if (op.t === 'w') out += wordHtml(op);
      else if (op.t === 's') out += ' ';
      else if (op.t === 'br') out += '<br>';
      else if (op.t === 'line') out += esc(op.text) + '\n';
    }
    closeBlock(); closeList();
    return out;
  }
  window.PM56_RICH = { tokenize: tokenize, html: function (text) { return opsToHtml(tokenize(text)); }, plainHtml: function (text) { return opsToHtml(tokenize(text, { plain: true })); } };

  /* ================================================================ 2 streams */
  var streams = new Map();       // message id -> stream
  var loop = 0;
  var revealedRecs = typeof WeakSet !== 'undefined' ? new WeakSet() : new Set();

  function pickReply(raw, pref) {
    var list = D.scriptedReplies || [], low = String(raw || '').toLowerCase();
    if (pref && pref.effective) return { id: 'sr-simple', chunks: ['This example adds a reply to the conversation.', ' You can try the message buttons and panels without changing your files.'], delayMs: 520, chunkMs: 260, terminal: 'complete' };
    for (var i = 0; i < list.length; i++) {
      var r = list[i];
      if (r.match && r.match.some(function (k) { return low.indexOf(k) >= 0; })) return r;
    }
    return list.filter(function (r) { return r.id === 'sr-default'; })[0] || { chunks: ['Understood.'], delayMs: 500, chunkMs: 260, terminal: 'complete' };
  }

  function runtimeFor(c, m) {
    var mdl = c.selectedModel ? c.selectedModel() : null;
    return {
      provider: (mdl && mdl.provider) || 'Anthropic', account: 'Work', model: (mdl && mdl.name) || 'Claude Sonnet 4.6', modelId: mdl && mdl.id,
      mode: String(c.state.mode || 'agent').toLowerCase().replace(/\s+/g, '_'), persona: c.state.persona, effort: 'high',
      startedAt: new Date().toISOString(), completedAt: null, tokens: {}, context: {}, cost: {}
    };
  }

  /* reply(): called by deliverSend's generic branch. Pushes the placeholder and
     starts it; returns true so the fixed reply is skipped. */
  function liveTurnFor(c, raw) {
    var list = D.liveTurns || [], low = String(raw || '').toLowerCase();
    if (String(c.state.mode || '').toLowerCase() !== 'agent') return null;
    for (var i = 0; i < list.length; i++) if (list[i].match.some(function (k) { return low.indexOf(k) >= 0; })) return list[i];
    return null;
  }
  function reply(c, t, raw, opts) {
    var lt = liveTurnFor(c, raw);
    if (lt) return agentTurn(c, t, lt);
    var spec = pickReply(raw, opts && opts.explanationPreference);
    var m = {
      id: c.uid('assistant'), role: 'assistant', type: 'text', body: '', rich: true,
      streaming: true, streamPhase: 'pending', time: new Date().toISOString(), sourceMessageId: opts && opts.sourceId,
      explanationPreference: opts && opts.explanationPreference ? JSON.parse(JSON.stringify(opts.explanationPreference)) : null
    };
    m.runtime = runtimeFor(c, m);
    t.messages.push(m);
    begin(m, t.id, spec, { rich: true });
    return true;
  }

  function begin(m, tid, spec, opts) {
    var full = (spec.chunks || []).join('');
    var ops = tokenize(full, { plain: !(opts && opts.rich) });
    var chunkAt = [], acc = 0, arrive = [];
    (spec.chunks || []).forEach(function (ch, i) { acc += ch.length; chunkAt.push((spec.delayMs || 500) + i * (spec.chunkMs || 260)); arrive.push(acc); });
    var st = {
      id: m.id, tid: tid, m: m, spec: spec, full: full, ops: ops, cursor: 0, t0: now(),
      chunkAt: chunkAt, arrive: arrive, nextAt: 0, phase: 'pending', words: 0,
      island: null, clip: null, flow: null, caret: null, h: 0, hv: 0, lastFrame: 0,
      block: null, list: null, rich: !!(opts && opts.rich), revealRec: (opts && opts.revealRec) || null,
      minPending: opts && opts.minPending != null ? opts.minPending : 420, settleAt: 0
    };
    if (opts && opts.instantArrival) { st.chunkAt = st.chunkAt.map(function () { return 0; }); }
    if (opts && opts.hold) st.hold = true;                 /* a thinking placeholder a director replaces */
    if (opts && opts.quiet) st.quiet = true;               /* an answer after visible work: no "is thinking" */
    streams.set(m.id, st);
    m.streaming = true; m.streamPhase = 'pending';
    kick();
    return st;
  }

  function kick() { if (!loop) loop = requestAnimationFrame(frame); }

  function arrivedChars(st, t) {
    var n = 0;
    for (var i = 0; i < st.chunkAt.length; i++) if (t - st.t0 >= st.chunkAt[i]) n = st.arrive[i];
    return n;
  }
  function allArrived(st, t) { return !st.chunkAt.length || t - st.t0 >= st.chunkAt[st.chunkAt.length - 1]; }

  /* The island: .message-body[data-pm-keep] > .tx-clip (height spring) > .tx-flow.
     If the article was remounted (thread churn), rebuild what was released so far
     without animation. */
  function ensureIsland(st) {
    var host = document.querySelector('[data-k="tx-island:' + CSS.escape(st.id) + '"]');
    if (!host) return null;
    if (st.island === host && st.flow && st.flow.isConnected) return host;
    st.island = host;
    host.textContent = '';
    st.clip = document.createElement('div'); st.clip.className = 'tx-clip';
    st.flow = document.createElement('div'); st.flow.className = 'tx-flow';
    st.caret = document.createElement('i'); st.caret.className = 'tx-caret'; st.caret.setAttribute('aria-hidden', 'true');
    st.clip.appendChild(st.flow); st.clip.appendChild(st.caret); host.appendChild(st.clip);
    st.block = null; st.list = null;
    var upto = st.cursor; st.cursor = 0;
    for (var i = 0; i < upto; i++) exec(st, st.ops[i], true);
    st.cursor = upto;
    if (st.phase === 'pending' && !st.quiet) pendingLabel(st, true);
    st.h = st.flow.offsetHeight; st.clip.style.height = st.h + 'px';
    return host;
  }

  function pendingLabel(st, on) {
    var el = st.flow && st.flow.querySelector('.tx-pending');
    if (on && !el && st.flow) {
      var c = C(), mdl = c.selectedModel ? c.selectedModel() : null;
      el = document.createElement('span'); el.className = 'tx-pending';
      el.innerHTML = '<b>' + esc((mdl && mdl.name) || 'Assistant') + '</b><span class="tx-pending-verb">is thinking</span><em class="tx-pending-t"></em>';
      st.flow.appendChild(el);
    } else if (!on && el) {
      /* the label condenses toward the mark while the first word emerges
         (voice keyframes in turn-stream.css); it leaves the flow the moment
         the first word lands, so the word never starts a line below it */
      if (reduced()) el.remove();
      else {
        /* it leaves from the clip layer, not the flow: a first child that is
           still in the flow keeps the first real block from being :first-child,
           and that block's top margin pushed the whole reply down until the
           label was gone (measured: 14px under a heading) */
        var lt = el.offsetTop + st.flow.offsetTop, ll = el.offsetLeft + st.flow.offsetLeft;
        st.flow.style.minHeight = st.flow.offsetHeight + 'px';
        Object.assign(el.style, { position: 'absolute', left: ll + 'px', top: lt + 'px' });
        st.clip.insertBefore(el, st.caret);
        el.classList.add('tx-pending-out'); st.leaving = true;
        var gone = function () { if (el.isConnected) el.remove(); };
        el.addEventListener('animationend', function (e) { if (e.target === el) gone(); });
        setTimeout(gone, K() ? K().ms(400) : 400);
      }
    }
    return el;
  }
  function K() { return window.PM56_CLOCK || null; }

  function currentBlock(st) {
    if (!st.block) { var p = document.createElement('p'); st.flow.appendChild(p); st.block = p; }
    return st.block;
  }
  function exec(st, op, quiet) {
    var v = voice();
    if (st.leaving) { st.flow.style.minHeight = ''; st.leaving = false; }
    if (op.t === 'block') {
      var el;
      if (op.tag === 'li') {
        if (!st.list || st.list.tagName.toLowerCase() !== op.list) { st.list = document.createElement(op.list); st.flow.appendChild(st.list); if (!quiet) st.list.classList.add('tx-born'); }
        el = document.createElement('li'); st.list.appendChild(el);
      } else if (op.tag === 'pre') {
        st.list = null;
        var pre = document.createElement('pre'); el = document.createElement('code'); pre.appendChild(el); st.flow.appendChild(pre);
        if (!quiet) pre.classList.add('tx-born');
      } else {
        st.list = null; el = document.createElement(op.tag); st.flow.appendChild(el);
      }
      if (!quiet) el.classList.add('tx-born');
      st.block = el;
      return;
    }
    var blk = currentBlock(st);
    if (op.t === 's') { blk.appendChild(document.createTextNode(' ')); return; }
    if (op.t === 'br') { blk.appendChild(document.createElement('br')); return; }
    if (op.t === 'line') { blk.appendChild(document.createTextNode(op.text + '\n')); if (!quiet) flashLine(blk); return; }
    if (op.t === 'w') {
      var span = document.createElement('span');
      span.className = quiet ? 'tx-w tx-still' : 'tx-w';
      var target = span;
      if (op.mark === 'b') { var b = document.createElement('strong'); span.appendChild(b); target = b; }
      else if (op.mark === 'code') { var cd = document.createElement('code'); span.appendChild(cd); target = cd; }
      if (!quiet && v === 'retro') {
        /* Retro types each character in, stepped, inside the same word slot. */
        for (var i = 0; i < op.text.length; i++) { var ch = document.createElement('span'); ch.className = 'tx-c'; ch.style.setProperty('--i', i); ch.textContent = op.text[i]; target.appendChild(ch); }
      } else target.textContent = op.text;
      blk.appendChild(span);
      st.words++;
    }
  }
  function flashLine(code) { code.classList.remove('tx-line'); void code.offsetWidth; code.classList.add('tx-line'); }

  /* Word pacing: a steady natural rate that speeds up when text is waiting and
     breathes at sentence ends. Bursts never dump. */
  var BASE_MS = 1000 / 30;
  function interval(st, op, backlog) {
    var iv = BASE_MS / (1 + backlog / 16);
    if (op.t === 'w' && /[.!?:]$/.test(op.text)) iv += Math.max(30, 150 - backlog * 6);
    else if (op.t === 'w' && /[,;]$/.test(op.text)) iv += Math.max(10, 50 - backlog * 3);
    return Math.max(9, iv);
  }
  function backlogOf(st, arrived) { var n = 0; for (var i = st.cursor; i < st.ops.length && st.ops[i].end <= arrived; i++) if (st.ops[i].t === 'w' || st.ops[i].t === 'line') n++; return n; }

  function setPhase(st, ph) {
    st.phase = ph; st.m.streamPhase = ph;
    var art = document.querySelector('.transcript-inner > [data-k="msg:' + CSS.escape(st.id) + '"]');
    if (art) art.setAttribute('data-streaming', ph);
  }

  function frame(ts) {
    loop = 0;
    watchRoom();
    var t = now(), any = false;
    if (directors.size) { stepDirectors(t); any = true; }
    streams.forEach(function (st) {
      any = true;
      if (!ensureIsland(st)) return;            // not on screen (another thread); keeps its clock
      var arrived = arrivedChars(st, t);
      if (st.phase === 'pending') {
        var pe = st.flow.querySelector('.tx-pending-t');
        var waited = (t - st.t0) / 1000;
        if (pe) pe.textContent = waited >= 4 ? ' · ' + Math.floor(waited) + 's' : '';
        if (!st.hold && arrived > 0 && t - st.t0 >= st.minPending) {
          pendingLabel(st, false);
          setPhase(st, 'live');
          sound('first');
          st.nextAt = t + (reduced() ? 0 : 90);
        }
      }
      if (st.phase === 'live') {
        var released = 0, cap = reduced() ? 1e9 : 4;
        while (st.cursor < st.ops.length && st.ops[st.cursor].end <= arrived && t >= st.nextAt && released < cap) {
          var op = st.ops[st.cursor];
          var backlog = backlogOf(st, arrived);
          exec(st, op, reduced());
          st.cursor++;
          if (op.t === 'w' || op.t === 'line') { released++; st.nextAt = t + (reduced() ? 0 : interval(st, op, backlog)); }
          else if (op.t === 'block' && st.cursor > 1) st.nextAt = t + (reduced() ? 0 : 90);
        }
        placeCaret(st);
        if (st.cursor >= st.ops.length && allArrived(st, t)) { setPhase(st, 'settling'); st.settleAt = t; }
      }
      springHeight(st, ts);
      if (st.phase === 'settling') {
        var still = Math.abs(st.flow.offsetHeight - st.h) < 0.5;
        if ((still && t - st.settleAt > 170) || reduced() || t - st.settleAt > 900) finalize(st, st.spec.terminal || 'complete');
      }
    });
    if (any && (streams.size || directors.size)) loop = requestAnimationFrame(frame);
  }

  /* Height follows the flow through a critically damped spring (omega ~ 26/s),
     so a new line opens over ~200ms instead of stepping by a line height. */
  function springHeight(st, ts) {
    if (!st.clip || !st.flow) return;
    var target = st.flow.offsetHeight;
    if (reduced()) { st.h = target; st.hv = 0; st.clip.style.height = target + 'px'; return; }
    var tnow = now();
    var dt = st.lastFrame ? Math.min(0.05, Math.max(0.0005, (tnow - st.lastFrame) / 1000)) : 1 / 60;
    st.lastFrame = tnow;
    var w = 26, x = st.h - target;
    var a = -2 * w * st.hv - w * w * x;
    st.hv += a * dt; st.h += st.hv * dt;
    if (Math.abs(st.h - target) < 0.4 && Math.abs(st.hv) < 4) { st.h = target; st.hv = 0; }
    if (st.h < target - 40) st.h = target - 40;            // never lag more than ~2 lines
    st.clip.style.height = Math.max(0, st.h) + 'px';
  }

  function placeCaret(st) {
    if (!st.caret || !st.flow) return;
    var words = st.flow.querySelectorAll('.tx-w');
    var last = words[words.length - 1];
    var cr = st.clip.getBoundingClientRect();
    if (!last) { st.caret.style.transform = 'translate(0px, 3px)'; return; }
    var rects = last.getClientRects(), r = rects[rects.length - 1] || last.getBoundingClientRect();
    st.caret.style.transform = 'translate(' + (r.right - cr.left + 2).toFixed(1) + 'px,' + (r.top - cr.top + 2).toFixed(1) + 'px)';
    st.caret.style.height = Math.max(12, r.height - 4).toFixed(1) + 'px';
  }

  function releasedText(st) {
    var i = st.cursor - 1; while (i >= 0 && st.ops[i].t !== 'w' && st.ops[i].t !== 'line') i--;
    return i < 0 ? '' : st.full.slice(0, st.ops[i].end).replace(/\s+$/, '');
  }

  function finalize(st, terminal) {
    if (!streams.has(st.id)) return;
    streams.delete(st.id);
    var c = C(), m = st.m;
    var body = terminal === 'complete' ? st.full : releasedText(st);
    m.body = body; m.streaming = false; delete m.streamPhase;
    if (body.length > 460) m.streamedLong = true;
    if (terminal !== 'complete') { m.terminal = terminal; if (terminal === 'error' && st.spec.error) m.terminalNote = st.spec.error; }
    if (m.runtime) {
      var secs = Math.max(1, Math.round((now() - st.t0) / 1000));
      m.runtime.completedAt = new Date().toISOString(); m.runtime.workedSeconds = secs; m.runtime.durationMs = Math.round(now() - st.t0);
      m.runtime.terminal = terminal === 'complete' ? 'complete' : terminal;
      m.runtime.tokens = { input: 1800 + body.length, output: Math.round(body.split(/\s+/).length * 1.35) };
    }
    c.renderApp();
    var art = document.querySelector('.transcript-inner > [data-k="msg:' + CSS.escape(st.id) + '"]');
    if (art && !reduced()) { art.classList.add('tx-peek'); setTimeout(function () { art.classList.remove('tx-peek'); }, window.PM56_CLOCK ? window.PM56_CLOCK.ms(1500) : 1500); }
    var t = (c.state.threads || []).filter(function (x) { return x.id === st.tid; })[0];
    if (t && terminal === 'complete' && window.PM56_AUTO_MEMORY) window.PM56_AUTO_MEMORY.boundary(t, m);
    if (terminal === 'complete' && st.spec.followUp && t) followUp(c, t, st.spec.followUp);
    if (terminal === 'error' && st.spec.followUp && t) followUp(c, t, st.spec.followUp);
    if (terminal === 'complete') sound('complete'); else if (terminal !== 'steered') sound('stop');
    if (st.revealRec) {
      var others = false; streams.forEach(function (o) { if (o.revealRec === st.revealRec) others = true; });
      if (!others) { c.releaseNextRun(st.revealRec); setTimeout(releaseRoom, K() ? K().ms(260) : 260); }
    }
    c.followIfSticky();
    /* the queue advances on its own only when a turn completes; after a Stop
       or an error it waits for the user (Send, Send now, Edit or Remove) */
    if (st.tid === c.state.selectedThread && terminal === 'complete') c.maybeFlushQueue();
  }

  function followUp(c, t, f) {
    var id = c.uid(f.type || 'follow');
    if (f.type === 'plan-card') t.messages.push({ id: id, role: 'system', type: 'plan-card', artifactId: f.artifactId || 'plan-query', deep: !!f.deep });
    else if (f.type === 'live-agents') t.messages.push({ id: id, role: 'system', type: 'live-agents', title: f.title });
    else if (f.type === 'working') {
      var wid = c.uid('run');
      t.messages.push({ id: id, role: 'system', type: 'working', title: f.title || 'Working', workId: wid });
      c.state.works[wid] = { step: 0, running: true, expanded: false, started: true, completed: false, elapsed: 0, openPhase: null, clock: 0 };
      c.armWorkTimer();
    } else t.messages.push({ id: id, role: 'system', type: f.type, title: f.title, detail: f.detail || '', time: new Date().toISOString() });
    c.renderApp(); c.followIfSticky();
  }

  /* Owner: busy while any stream of that thread runs. Stop keeps what was
     written; leaving the thread lets the reply finish in the background (it
     lands complete); a global reset forgets every stream. */
  var owner = {
    busy: function (tid) { var b = false; streams.forEach(function (st) { if (st.tid === tid) b = true; }); directors.forEach(function (d) { if (d.tid === tid) b = true; }); return b; },
    stop: function (tid) { directors.forEach(function (d, k) { if (d.tid === tid) directors.delete(k); }); streams.forEach(function (st) { if (st.tid === tid) finalize(st, 'stopped'); }); },
    /* Send now steers (DL-108): the reply written so far stays, unmarked, and
       the steered message takes the turn from here; a live agent turn's work
       keeps running. Not a Stop: no marker, no stop cue, no queue advance. */
    steer: function (tid) { streams.forEach(function (st) { if (st.tid === tid && !st.hold) finalize(st, 'steered'); }); },
    cancel: function (tid) {
      /* leaving the thread: the turn finishes in the background -- it is
         complete, answer and all, when the reader comes back */
      directors.forEach(function (d) { if (d.tid === tid) finishDirector(d); });
      streams.forEach(function (st) { if (st.tid === tid) { st.cursor = st.ops.length; finalize(st, st.spec.terminal || 'complete'); } });
    },
    reset: function () { streams.clear(); flights.clear(); directors.clear(); dropRoom(); }
  };

  /* ================================================================ room hold
     When a turn's card folds as its answer starts, the thread loses most of the
     card's height at once: a reader at the bottom saw everything above slide
     half a screen down, then climb back up as the answer streamed. The room the
     card gives up is held instead: a min-height floor on the list at its
     pre-fold height (a root variable, which the patcher never touches). A floor
     holds inside layout itself, so no clamp can slip in between the fold's own
     DOM steps and a frame callback. The answer grows into the room; whatever it
     does not use is let go once it has settled, the floor easing down to the
     content like a drawer closing. */
  var room = { h0: 0, inner: null, on: false, rel: false, x: null, v: 0, raf: 0, last: 0, lastH: 0, quietUntil: 0, transient: false, relAt: 0 };
  /* While the card folds, the follow waits: the fold frees far more room than
     the answer's first line takes, so the reader's view stays put and the
     answer rises into it. (Chasing the answer's placeholder first scrolled the
     thread down 33px, which the fold's clamp then snapped back in one frame.) */
  var FOLD_QUIET = 700;
  function roomQuiet() { return room.on && !room.rel && now() < room.quietUntil; }
  function roomInner() { var tr = document.querySelector('.chat-stage .transcript'); return tr && tr.querySelector('.transcript-inner'); }
  function roomFloor(px) {
    if (px == null) document.documentElement.style.removeProperty('--tx-hold-min');
    else document.documentElement.style.setProperty('--tx-hold-min', px.toFixed(1) + 'px');
  }
  function naturalH(inner) { var l = inner.lastElementChild; return l ? l.getBoundingClientRect().bottom - inner.getBoundingClientRect().top : 0; }
  function dropRoom() { room.on = false; room.rel = false; room.x = null; room.quietUntil = 0; room.transient = false; roomFloor(null); }
  /* the list's height as last laid out: the completion render (which drops
     the card's narration line and mounts the answer's placeholder) runs before
     the hold starts, so the hold takes the height from before that render */
  var roomRO = null, roomSeen = null;
  function watchRoom() {
    var inner = roomInner(); if (!inner || inner === roomSeen || !window.ResizeObserver) return;
    if (roomRO) roomRO.disconnect();
    roomSeen = inner; room.lastH = inner.offsetHeight;
    /* while held this is the floored height, which is what the reader sees */
    roomRO = new ResizeObserver(function () { if (roomSeen && roomSeen.isConnected) room.lastH = roomSeen.offsetHeight; });
    roomRO.observe(inner);
  }
  function holdRoom() {
    if (reduced()) return;
    var inner = roomInner(); if (!inner) return;
    var before = inner === roomSeen && room.lastH ? room.lastH : 0;
    room.inner = inner; room.h0 = before || inner.offsetHeight;
    room.on = true; room.rel = false; room.transient = false; room.x = null; room.v = 0; room.last = now();
    roomFloor(room.h0);
    if (!room.raf) room.raf = requestAnimationFrame(roomFrame);
  }
  function releaseRoom() { if (room.on && !room.rel) { room.rel = true; room.x = null; room.v = 0; room.last = now(); } }
  /* A working card shrinking under a reader at the bottom (the narration line
     tucking into the caption, a subject's rows folding) would pull the whole
     thread down with its height FLIP: 36px in four frames, measured. The same
     floor holds the room instead; the next subject's rows usually fill it, and
     what is left eases away more gently than the fold's room. */
  var SHRINK_HOLD = 700;
  function holdShrink() {
    if (reduced()) return;
    if (room.on) { if (room.transient && !room.rel) room.relAt = now() + SHRINK_HOLD; return; }
    var c = C(); if (!c || (c.isSticky && !c.isSticky())) return;
    var inner = roomInner(); if (!inner) return;
    var before = inner === roomSeen && room.lastH ? room.lastH : 0;
    room.inner = inner; room.h0 = Math.max(before, inner.offsetHeight);
    room.on = true; room.rel = false; room.transient = true; room.relAt = now() + SHRINK_HOLD;
    room.x = null; room.v = 0; room.last = now();
    roomFloor(room.h0);
    if (!room.raf) room.raf = requestAnimationFrame(roomFrame);
  }
  function roomFrame() {
    room.raf = 0;
    var inner = roomInner();
    if (!room.on || !inner || inner !== room.inner) { dropRoom(); return; }
    if (room.transient && !room.rel && now() >= room.relAt) releaseRoom();
    if (!room.rel && !roomQuiet()) {
      /* after the fold the floor only ratchets up: a follow into content past
         it can then never be clamped back when something above shrinks */
      var grown = naturalH(inner);
      if (grown > room.h0 + 0.5) { room.h0 = grown; roomFloor(room.h0); }
    }
    if (room.rel) {
      var nat = naturalH(inner), t = now(), dt = Math.min(0.05, Math.max(0, (t - room.last) / 1000)); room.last = t;
      if (room.x == null) room.x = Math.max(0, room.h0 - nat);
      /* critically damped to zero (omega 11/s: ~450ms; a shrink's leftover 8/s) */
      var w = room.transient ? 8 : 11; room.v += (-2 * w * room.v - w * w * room.x) * dt; room.x += room.v * dt;
      if (room.x < 0.5 || nat >= room.h0) { dropRoom(); try { C().followIfSticky(); } catch (e) { } return; }
      roomFloor(nat + room.x);
    }
    try { C().followIfSticky(); } catch (e) { }
    room.raf = requestAnimationFrame(roomFrame);
  }

  /* ================================================================ 6 directors
     A live agent turn: the reply's thinking placeholder, then (once the first
     tool call "arrives") the placeholder gives way to the working card at the
     same place under the same turn mark, then the answer streams in as the
     card folds. A subject with waitFor:'permission' pauses the run and asks
     the reader in the transcript; approving resumes it. */
  var directors = new Map();                 // record id -> director
  function agentTurn(c, t, lt) {
    var recId = c.uid('turn');
    var ph = {
      id: c.uid('assistant'), role: 'assistant', type: 'text', body: '', rich: true,
      streaming: true, streamPhase: 'pending', time: new Date().toISOString(), liveTurnOf: recId
    };
    ph.runtime = runtimeFor(c, ph);
    t.messages.push(ph);
    begin(ph, t.id, { chunks: [], terminal: 'complete' }, { rich: true, hold: true });
    directors.set(recId, { recId: recId, tid: t.id, lt: lt, phId: ph.id, workAt: now() + 1100, phase: 'thinking', waited: {} });
    kick();
    return true;
  }
  function stepDirectors(t) {
    directors.forEach(function (d) {
      var c = C();
      var th = (c.state.threads || []).filter(function (x) { return x.id === d.tid; })[0];
      if (!th) { directors.delete(d.recId); return; }
      if (d.phase === 'thinking' && t >= d.workAt) {
        var i = th.messages.findIndex(function (m) { return m.id === d.phId; });
        var st = streams.get(d.phId);
        if (st) streams.delete(d.phId);
        var work = { id: c.uid('work'), role: 'system', type: 'working', title: d.lt.title, workId: d.recId, liveTurn: true };
        var answer = {
          id: d.phId, role: 'assistant', type: 'text', body: d.lt.answer.join(''), rich: true, revealAfter: d.recId,
          streamChunks: d.lt.answer.slice(), time: new Date().toISOString(), liveTurnOf: d.recId
        };
        answer.runtime = runtimeFor(c, answer);
        /* the placeholder's id carries on as the answer, so its identity and its
           place in the turn survive; the card enters where it stood */
        if (i >= 0) th.messages.splice(i, 1, work, answer); else th.messages.push(work, answer);
        d.phase = 'working'; d.workId = work.id;
        c.startWorkingRec(d.lt.run, null, { recId: d.recId });
        return;
      }
      if (d.phase === 'working') {
        var rec = c.state.works[d.recId];
        if (!rec) { directors.delete(d.recId); return; }
        if (rec.completed) { directors.delete(d.recId); return; }
        var list = c.workInstancesFor(rec), clock = rec.clock || 0;
        list.forEach(function (inst) {
          if (inst.waitFor !== 'permission' || d.waited[inst.uid]) return;
          if (clock < inst.startAt + (inst.statusAt || 0) - 1e-6) return;
          d.waited[inst.uid] = true;
          rec.running = false;
          var ask = { id: c.uid('approve'), role: 'system', type: 'waiting', title: 'Approval needed: ' + (inst.verb || 'continue'),
            detail: (inst.detail || '') + ' The run is paused on this step.', liveApprove: d.recId, liveApproveUid: inst.uid, time: new Date().toISOString() };
          /* the ask belongs to the work: it sits right under the working card,
             before the (still hidden) answer */
          var wi = th.messages.findIndex(function (m) { return m.id === d.workId; });
          if (wi >= 0) th.messages.splice(wi + 1, 0, ask); else th.messages.push(ask);
          c.renderApp(); c.followIfSticky();
          sound('needs');
        });
      }
    });
  }
  function finishDirector(d) {
    var c = C();
    var th = (c.state.threads || []).filter(function (x) { return x.id === d.tid; })[0];
    directors.delete(d.recId);
    if (!th) return;
    if (d.phase === 'thinking') {
      var i = th.messages.findIndex(function (m) { return m.id === d.phId; });
      streams.delete(d.phId);
      var work = { id: c.uid('work'), role: 'system', type: 'working', title: d.lt.title, workId: d.recId, liveTurn: true };
      var answer = { id: d.phId, role: 'assistant', type: 'text', body: d.lt.answer.join(''), rich: true, revealAfter: d.recId, time: new Date().toISOString(), liveTurnOf: d.recId };
      answer.runtime = runtimeFor(c, answer); answer.runtime.completedAt = new Date().toISOString(); answer.runtime.terminal = 'complete';
      if (i >= 0) th.messages.splice(i, 1, work, answer); else th.messages.push(work, answer);
    }
    var list = D.workRuns[d.lt.run] ? c.workInstancesFor({ runId: d.lt.run }) : [];
    var end = 0; list.forEach(function (s) { end = Math.max(end, s.startAt + (s.dur != null ? s.dur : 2)); });
    var rec = c.state.works[d.recId] || (c.state.works[d.recId] = { step: 0, expanded: false, openPhase: null, runId: d.lt.run, id: d.recId });
    rec.clock = end; rec.elapsed = Math.floor(end); rec.step = Math.max(0, list.length - 1);
    rec.completed = true; rec.running = false; rec.started = true; rec.cleared = rec.cleared || {};
    list.forEach(function (s) { if (s.waitFor) rec.cleared[s.uid] = true; });
    revealedRecs.add(rec);
  }
  EXT.slot('systemCardActions', function (ctx) {
    var m = ctx.message;
    if (!m || !m.liveApprove) return '';
    if (m.approved) return '';
    return '<button class="soft-button" data-action="live-approve" data-id="' + esc(m.id) + '">' + ctx.icon('check', 12) + ' Approve once</button>'
      + '<button class="text-button" data-action="live-deny" data-id="' + esc(m.id) + '">Deny</button>';
  });
  function findMsg(c, id) {
    var out = null;
    (c.state.threads || []).forEach(function (t) { t.messages.forEach(function (m) { if (m.id === id) out = { t: t, m: m }; }); });
    return out;
  }
  EXT.action('live-approve', function (c, btn) {
    var f = findMsg(c, btn.dataset.id); if (!f) return true;
    var m = f.m, rec = c.state.works[m.liveApprove];
    m.approved = true; m.type = 'live-approved'; m.title = 'Approved once: ' + m.title.replace(/^Approval needed: /, ''); m.detail = 'The run resumed on your approval.';
    if (rec) { rec.cleared = rec.cleared || {}; rec.cleared[m.liveApproveUid] = true; rec.running = true; rec.started = true; c.armWorkTimer(); }
    c.renderApp();
    return true;
  });
  EXT.action('live-deny', function (c, btn) {
    var f = findMsg(c, btn.dataset.id); if (!f) return true;
    var m = f.m, rec = c.state.works[m.liveApprove];
    m.approved = true; m.type = 'live-denied'; m.title = 'Denied: ' + m.title.replace(/^Approval needed: /, ''); m.detail = 'The run stopped before this step. Nothing was applied.';
    if (rec) rec.running = false;
    directors.delete(m.liveApprove);
    c.renderApp();
    return true;
  });

  /* ================================================================ 4 reveals */
  function onComplete(rec) {
    var c = C(), t = c.activeThread && c.activeThread();
    if (!t || !rec) return false;
    if (revealedRecs.has(rec)) return false;
    var id = rec.id || rec.runId, held = false;
    if (!id) return false;
    t.messages.forEach(function (m) {
      if (m.revealAfter !== id || m.role !== 'assistant' || m.type !== 'text' || m.streaming) return;
      if (c.state.replyMode === 'instant' || reduced()) return;
      var chunks = m.streamChunks;
      if (!chunks) {
        /* A revealed fixture message streams from its own text in three chunks. */
        var words = String(m.body || '').split(/(\s+)/), per = Math.ceil(words.length / 3);
        chunks = [];
        for (var i = 0; i < words.length; i += per) chunks.push(words.slice(i, i + per).join(''));
      }
      /* the answer's first line starts inside the fold, as the dial lifts */
      begin(m, t.id, { chunks: chunks, delayMs: 420, chunkMs: 300, terminal: 'complete' }, { rich: !!m.rich, revealRec: id, minPending: 300, quiet: true });
      held = true;
    });
    if (held) {
      revealedRecs.add(rec);
      /* the turn's answer is starting: if this was the turn's last burst, its
         card folds into its strip and the answer rises into the room */
      var def = rec.runId && D.workRuns && D.workRuns[rec.runId];
      if (!(def && def.next)) {
        holdRoom();
        var folding = false;
        t.messages.forEach(function (w) {
          if (w.type === 'working' && w.workId === id) {
            if (window.PM56_ORBIT && window.PM56_ORBIT.compact(w.id)) folding = true;
            if (window.PM56_RAIL8 && window.PM56_RAIL8.compact && window.PM56_RAIL8.compact(w.id)) folding = true;
          }
        });
        if (folding && room.on) { room.quietUntil = now() + FOLD_QUIET; try { C().holdFollow(roomQuiet); } catch (e) { } }
        sound('answer');
      }
    }
    return held;
  }

  /* ================================================================ 3 flights */
  var flights = new Map();   // message id -> snapshot
  var snap = null;
  function snapshotComposer() {
    var ta = document.querySelector('textarea[data-input="composer"]');
    if (!ta || !ta.value.trim()) { snap = null; return; }
    var cs = getComputedStyle(ta), r = ta.getBoundingClientRect();
    snap = {
      text: ta.value, at: now(),
      rect: { left: r.left, top: r.top, width: r.width, height: r.height },
      pad: { l: parseFloat(cs.paddingLeft), t: parseFloat(cs.paddingTop), r: parseFloat(cs.paddingRight) },
      font: cs.font, fontSize: cs.fontSize, lh: cs.lineHeight, color: cs.color, scroll: ta.scrollTop,
      send: (function () { var b = document.querySelector('[data-k="send-btn"]'); if (!b) return null; var q = b.getBoundingClientRect(); return { left: q.left, top: q.top, width: q.width, height: q.height }; })()
    };
  }
  document.addEventListener('click', function (e) { if (e.target && e.target.closest && e.target.closest('[data-action="send"]')) snapshotComposer(); }, true);
  document.addEventListener('keydown', function (e) {
    if (e.key === 'Enter' && (e.ctrlKey || e.metaKey) && e.target && e.target.matches && e.target.matches('textarea[data-input="composer"]')) snapshotComposer();
  }, true);

  function sent(m, t) {
    if (!snap || now() - snap.at > 1200 || reduced()) { snap = null; return; }
    if (String(m.body || '').trim() !== snap.text.trim()) { snap = null; return; }
    /* The text layer is created NOW, in the same task that clears the field, so
       the typed text never vanishes for a frame before it starts to move. */
    snap.A = textLayer(snap.text, snap.font, snap.lh, snap.color, snap.rect.width - snap.pad.l - snap.pad.r);
    snap.A.style.left = (snap.rect.left + snap.pad.l) + 'px'; snap.A.style.top = (snap.rect.top + snap.pad.t - snap.scroll) + 'px';
    document.body.classList.add('tx-flying');
    flights.set(m.id, snap); snap = null;
    sound('send');
    requestAnimationFrame(function () { fly(m.id); });
  }
  function flightPending(id) { return flights.has(id); }

  /* Flight timing is shared by every voice (the house rule: voices differ in
     path, easing and texture, never in timing). */
  var FLY_MS = 440;
  function bez(p, x1, y1, x2, y2) {
    /* cubic-bezier(x1,y1,x2,y2) at progress p, solved for x by Newton steps */
    var t = p;
    for (var i = 0; i < 8; i++) {
      var x = 3 * (1 - t) * (1 - t) * t * x1 + 3 * (1 - t) * t * t * x2 + t * t * t - p;
      var dx = 3 * (1 - t) * (1 - t) * x1 + 6 * (1 - t) * t * (x2 - x1) + 3 * t * t * (1 - x2);
      if (Math.abs(dx) < 1e-6) break; t -= x / dx; t = Math.min(1, Math.max(0, t));
    }
    return 3 * (1 - t) * (1 - t) * t * y1 + 3 * (1 - t) * t * t * y2 + t * t * t;
  }
  function clamp01(v) { return v < 0 ? 0 : v > 1 ? 1 : v; }
  function seg(t, a, b) { return clamp01((t - a) / (b - a)); }
  function isOpaque(c) {
    if (!c) return false;
    var a = /^color\(/.test(c) ? (c.match(/\/\s*([\d.]+)/) || [0, '1'])[1] : (c.match(/[\d.]+/g) || [])[3];
    return a == null || +a >= 0.99;
  }
  function groundOf(el) {
    for (var e = el; e && e.nodeType === 1; e = e.parentElement) { var c = getComputedStyle(e).backgroundColor; if (isOpaque(c)) return c; }
    return getComputedStyle(document.body).backgroundColor || '#000';
  }
  function textLayer(text, font, lh, color, width) {
    var d = document.createElement('div'); d.className = 'tx-fly tx-fly-text'; d.textContent = text;
    Object.assign(d.style, { font: font, lineHeight: lh, color: color, width: width + 'px', transformOrigin: '0 0' });
    document.body.appendChild(d); return d;
  }

  /* The text you typed leaves the composer and becomes the bubble.
     TEXT: one layer that keeps the typed glyphs and scales from the composer's
     size to the bubble's -- no doubled text. Only when the line breaks differ
     between the two widths do two layers cross-fade (the middle 30%).
     SHAPE: the bubble itself, a separate layer that forms per voice --
       basic   grows out of the text's own bounds (clip-path), zero overshoot
       friendly pops out of the Send button and swings up to meet the text
       glass   condenses out of depth (blur and scale settle)
       retro   the text blinks out and the bubble prints in, in steps
     The landing slot is re-read every frame: the transcript is still gliding. */
  function fly(id) {
    var s = flights.get(id);
    var art = document.querySelector('.transcript-inner > [data-k="msg:' + CSS.escape(id) + '"]');
    var surf = art && art.querySelector('.message-surface');
    var body = surf && surf.querySelector('.message-body');
    if (!s || !surf || !body) { if (s && s.A) s.A.remove(); document.body.classList.remove('tx-flying'); land(id); return; }
    art.getAnimations().forEach(function (a) { try { if (a.effect.getTiming().iterations !== Infinity) a.finish(); } catch (e) { } });
    var v = voice();
    var scs = getComputedStyle(surf), bcs = getComputedStyle(body);
    var r0 = surf.getBoundingClientRect(), br0 = body.getBoundingClientRect();
    var fA = parseFloat(s.fontSize) || 13, fB = parseFloat(bcs.fontSize) || 13.5;
    var wA = s.rect.width - s.pad.l - s.pad.r, wB = br0.width;
    /* TEXT */
    var A = s.A || textLayer(s.text, s.font, s.lh, s.color, wA);
    var B2 = textLayer(s.text, bcs.font, bcs.lineHeight, bcs.color, wB);
    var single = A.offsetHeight <= (parseFloat(s.lh) || fA * 1.5) * 1.6 && B2.offsetHeight <= (parseFloat(bcs.lineHeight) || fB * 1.6) * 1.6;
    if (single && v !== 'retro') { B2.remove(); B2 = null; }
    else B2.style.opacity = '0';
    /* SHAPE */
    var S = document.createElement('div'); S.className = 'tx-fly tx-fly-shape';
    /* the bubble's fill is a translucent tint of the canvas; in flight it
       crosses other things (the activity chips), so it is painted over the
       opaque ground it will land on -- the same pixels, but solid */
    var ground = groundOf(surf.parentElement), fill = scs.backgroundColor;
    Object.assign(S.style, { width: r0.width + 'px', height: r0.height + 'px', background: 'linear-gradient(' + fill + ',' + fill + '),' + ground, border: scs.border, borderRadius: scs.borderRadius, boxSizing: 'border-box' });
    document.body.insertBefore(S, A);
    var radius = parseFloat(scs.borderTopLeftRadius) || 16;
    var sx = s.rect.left + s.pad.l, sy = s.rect.top + s.pad.t - s.scroll;
    var sendR = s.send;
    document.body.classList.add('tx-flying');
    var start = now();
    function frame() {
      var t = Math.min(1, (now() - start) / FLY_MS);
      var r = surf.isConnected ? surf.getBoundingClientRect() : r0;
      var brr = body.isConnected ? body.getBoundingClientRect() : br0;
      var tx = brr.left, ty = brr.top;                                  // where the text lands
      var padL = brr.left - r.left, padT = brr.top - r.top, padR = r.right - brr.right, padB = r.bottom - brr.bottom;
      if (t > 0.55) document.body.classList.remove('tx-flying');
      if (v === 'retro') {
        /* print whole lines: the wipe steps one line of the bubble at a time */
        var lineH = parseFloat(bcs.lineHeight) || 21, lines = Math.max(1, Math.round((brr.height || lineH) / lineH));
        var steps = lines + 1, st = Math.min(1, Math.ceil(seg(t, 0.34, 1) * steps) / steps);
        A.style.transform = 'none'; A.style.left = sx + 'px'; A.style.top = sy + 'px';
        A.style.opacity = t < 0.34 ? (Math.floor(t * 12) % 2 ? '0' : '1') : '0';
        var T = B2 || A.cloneNode(true);
        if (!B2) { B2 = T; B2.style.width = wB + 'px'; B2.style.font = bcs.font; B2.style.lineHeight = bcs.lineHeight; B2.style.color = bcs.color; document.body.appendChild(B2); }
        B2.style.left = tx + 'px'; B2.style.top = ty + 'px'; B2.style.transform = 'none';
        var wipe = t < 0.34 ? 0 : (st >= 1 ? 1 : (padT + st * lines * lineH) / Math.max(1, r.height));
        B2.style.opacity = wipe > 0 ? '1' : '0';
        B2.style.clipPath = 'inset(0 0 ' + ((1 - wipe) * 100).toFixed(1) + '% 0)';
        S.style.left = r.left + 'px'; S.style.top = r.top + 'px'; S.style.transform = 'none';
        S.style.opacity = wipe > 0 ? '1' : '0';
        S.style.clipPath = 'inset(0 0 ' + ((1 - wipe) * 100).toFixed(1) + '% 0)';
      } else {
        var ease = v === 'friendly' ? [0.34, 1.32, 0.64, 1] : v === 'glass' ? [0.05, 0.7, 0.1, 1] : [0.2, 0.8, 0.2, 1];
        var p = bez(t, ease[0], ease[1], ease[2], ease[3]);
        var arc = (v === 'friendly' ? -42 : v === 'glass' ? -8 : -14) * Math.sin(Math.PI * Math.min(1, t));
        var dx = (tx - sx) * p, dy = (ty - sy) * p + arc;
        var sc = (fA / fB) + (1 - fA / fB) * p;                        // composer size -> bubble size
        A.style.left = sx + 'px'; A.style.top = sy + 'px';
        A.style.transform = 'translate(' + dx.toFixed(2) + 'px,' + dy.toFixed(2) + 'px) scale(' + (single ? (sc * fB / fA) : 1).toFixed(4) + ')';
        if (!single) {
          var x = seg(t, 0.35, 0.65);
          A.style.opacity = String(1 - x);
          B2.style.left = sx + 'px'; B2.style.top = sy + 'px';
          B2.style.transform = 'translate(' + dx.toFixed(2) + 'px,' + dy.toFixed(2) + 'px) scale(' + sc.toFixed(4) + ')';
          B2.style.opacity = String(x);
        }
        /* the shape */
        var bx, by, ss = 1, op = 1, blur = 0, clip = 'none';
        if (v === 'friendly' && sendR) {
          /* the pill pops out of Send, catches the text by mid-flight, and
             carries it the rest of the way (so the two never drift apart) */
          /* position catches the text with no overshoot (so the text never
             rides the pill's edge); the pop lives in the pill's scale */
          var q = bez(seg(t, 0, 0.36), 0.12, 0.9, 0.2, 1);
          var ox = sendR.left + sendR.width / 2 - (r.left + r.width / 2), oy = sendR.top + sendR.height / 2 - (r.top + r.height / 2);
          var rideX = (sx - tx) * (1 - p), rideY = (sy - ty) * (1 - p) + arc;
          bx = ox + (rideX - ox) * q; by = oy + (rideY - oy) * q;
          ss = 0.18 + 0.82 * bez(seg(t, 0, 0.62), 0.34, 1.56, 0.64, 1); op = seg(t, 0, 0.1);
        } else {
          bx = (sx - tx) * (1 - p); by = (sy - ty) * (1 - p) + arc;
          if (v === 'glass') { ss = 1.05 - 0.05 * p; op = seg(t, 0.05, 0.6); blur = 9 * (1 - seg(t, 0.1, 0.85)); }
          else {
            /* opaque almost at once, but only as big as the text: the lifted
               line gets its own ground before it crosses anything */
            var f = bez(seg(t, 0.1, 1), 0.2, 0.8, 0.2, 1);
            op = seg(t, 0, 0.12);
            clip = 'inset(' + (padT * (1 - f)).toFixed(1) + 'px ' + (padR * (1 - f)).toFixed(1) + 'px ' + (padB * (1 - f)).toFixed(1) + 'px ' + (padL * (1 - f)).toFixed(1) + 'px round ' + radius + 'px)';
          }
        }
        S.style.left = r.left + 'px'; S.style.top = r.top + 'px';
        S.style.transform = 'translate(' + bx.toFixed(2) + 'px,' + by.toFixed(2) + 'px) scale(' + ss.toFixed(4) + ')';
        S.style.opacity = String(op); S.style.filter = blur ? 'blur(' + blur.toFixed(2) + 'px)' : 'none'; S.style.clipPath = clip;
      }
      if (t < 1) requestAnimationFrame(frame);
      else {
        document.body.classList.remove('tx-flying');
        land(id);
        requestAnimationFrame(function () { A.remove(); if (B2) B2.remove(); S.remove(); });
      }
    }
    requestAnimationFrame(frame);
  }
  function land(id) {
    flights.delete(id);
    var art = document.querySelector('.transcript-inner > [data-k="msg:' + CSS.escape(id) + '"]');
    if (!art) return;
    art.removeAttribute('data-flight');
    var surf = art.querySelector('.message-surface');
    if (surf && surf.animate && !reduced()) {
      var v = voice();
      var kf = v === 'friendly' ? [{ transform: 'scale(.97)' }, { transform: 'scale(1.015)', offset: .6 }, { transform: 'none' }]
        /* retro settles like a phosphor: a brief flare, stepped down, never a
           dip (an opacity dip read as the bubble fading out after it printed) */
        : v === 'retro' ? [{ filter: 'brightness(1.45)' }, { filter: 'brightness(1)' }]
          : [{ transform: 'scale(.99)' }, { transform: 'none' }];
      surf.animate(kf, { duration: v === 'friendly' ? 240 : 150, easing: v === 'retro' ? 'steps(2,end)' : 'cubic-bezier(.17,.84,.29,.99)' });
    }
  }

  /* ================================================================ wiring */
  var wired = false;
  function wire() {
    if (wired) return;
    var c; try { c = C(); } catch (e) { return; }
    if (!c || !c.registerTurnOwner) return;
    wired = true;
    setInterval(watchRoom, 700);
    c.registerTurnOwner(owner);
    c.onWorkComplete(onComplete);
    if (c.onWorkShrink) c.onWorkShrink(holdShrink);
  }
  setTimeout(wire, 0);
  document.addEventListener('DOMContentLoaded', wire);

  window.PM56_STREAM = {
    reply: function (c, t, raw, opts) { wire(); return reply(c, t, raw, opts); },
    sent: function (m, t) { wire(); sent(m, t); },
    flightPending: flightPending,
    active: function () { var out = []; streams.forEach(function (st) { out.push({ id: st.id, tid: st.tid, phase: st.phase, cursor: st.cursor, ops: st.ops.length, words: st.words }); }); return out; },
    begin: function (m, tid, spec, opts) { wire(); return begin(m, tid, spec, opts); },
    owner: owner
  };
})();
