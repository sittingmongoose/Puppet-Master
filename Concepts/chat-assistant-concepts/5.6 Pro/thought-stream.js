/* thought-stream.js -- Thought Stream (DL-234, ACD-221), 2026-10-23. OWNER of the thinking block.
 *
 * When the model shares its reasoning, the reply gets a thinking block: a transcript item of its own (type 'thought',
 * stable id) just before the reply it belongs to, or before an agent turn's working card. It is never part of the
 * reply's text and never invents reasoning: a turn without supplied reasoning has no block at all.
 *
 *   1. Live     While the model thinks, the block heads the turn. Its line is the thinking placeholder of ACD-470 (the
 *               model's name, a shimmering "is thinking", seconds after 4 s) and the reasoning streams under it in a
 *               quiet block at the reasoning's own pace. The reply waits, hidden, until the reasoning hands over.
 *   2. Fold     Settings' Thought Stream (general.interaction.thought-stream, state.capabilities.thought) decides what
 *               happens when the answer starts (in an agent turn the block folds first and its first tool call's
 *               working card is born CARD_AFTER later, into the room the fold gave back):
 *                 Auto      open while it thinks, then folds to one line: "Thought for Ns", chevron, and a short gist;
 *                 Expanded  stays open beside the answer.
 *               Under Auto the open block shows only its last lines while it thinks, fading at the top, so a long
 *               thought never pushes the conversation; open again, it shows everything. How many is Settings' Lines
 *               shown while thinking (general.interaction.thought-stream-lines, state.capabilities.thoughtLines):
 *               4, 6, 8, 12 or 16, default 8. A fold gives its height back through turn-stream's room hold, so a
 *               reader at the bottom is never pulled down.
 *   3. Toggle   The block's line is a button (aria-expanded): click, Enter or Space opens or folds that one block. A
 *               reader's toggle lasts until the preference changes; then every block follows the new choice.
 *   4. Owner    Registers as a turn owner: Stop ends the thought where it is ("Thinking ended after Ns"), Send now
 *               does the same for a written reply, and leaving the thread lets it finish in the background.
 *   5. Voice    Words arrive in the transcript's voice (data-voice), quieter than the answer's. Screen readers hear one
 *               polite status when thinking starts and one when it ends, never each word. Reduced motion lands every
 *               end state at once.
 *
 * turn-stream.js calls start() from its reply and agent-turn paths (an agent turn's first tool call waits ms +
 * cardAfter) and handover() when the working card enters, a no-op once the reasoning has handed over; everything
 * else is here. Concept data: the reasoning is the recorded turn's own (data.js `thinking`).
 */
(function () {
  'use strict';
  var EXT = window.PM56_EXT;
  if (!EXT || !EXT.slot) return;

  function C() { return EXT.ctx(); }
  function reduced() { var M = window.PM56_MOTION; return !!(M && M.reduced && M.reduced()); }
  function now() { return window.PM56_CLOCK ? window.PM56_CLOCK.now() : performance.now(); }
  function ms(v) { return window.PM56_CLOCK ? window.PM56_CLOCK.ms(v) : v; }
  function esc(s) { return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]; }); }
  function voice() { var tr = document.querySelector('.chat-stage .transcript'); return (tr && tr.getAttribute('data-voice')) || 'basic'; }

  /* Auto, while thinking: the last lines the reader chose (Jared, 2026-10-23: "Default 8, adjustable in settings.").
     Fewer than 4 leaves the top fade over a third of the window; past 16 (320 px) a window is half a column, which is
     Always open's job */
  var LINES = [4, 6, 8, 12, 16], DEFAULT_LINES = 8;
  /* an agent turn's first tool call waits this long after the reasoning hands over: the block folds first, with its
     room held, and the working card is born into that room (the fold token is 320 ms, Retro's 192) */
  var CARD_AFTER = 380;
  /* the director waits only for a closing fold that had not begun a frame before the card was due (FOLD_LATE after its
     scheduled hand-over, timed from when animateTo created it: a fold still pending has no start time yet, and reading
     it as starting at the director's check made an on-time fold late, P2c. On time it is created 80-340 ms after, once
     the hand-over's render is done, the render growing with the thread; a late frame that hands over and reaches the
     director after its render creates it later), decided once per thought, and only while it still shows more than
     FOLD_VISIBLE px. A closing fold still pending holds the card one frame without deciding, so the card is never born
     over a fold that has not begun to paint (P2c). On time the card is born over the fold's last px (13-59 px late in a
     long thread, as before); a reader's re-open never delays it (P2b) */
  var FOLD_LATE = CARD_AFTER - 16, FOLD_VISIBLE = 8;
  var live = new Map();                    /* thought id -> the thought being written */
  var endedAt = Object.create(null);     /* reply id -> {at, id}: when its thought handed over; the director times the card from it */
  var byReply = Object.create(null);       /* reply id -> thought id */
  var view = Object.create(null);          /* thought id -> { open, mode }: a reader's own toggle */
  var loop = 0;

  /* ------------------------------------------------------------------ preference */
  function prefMode(c) { return c && c.state && c.state.capabilities && c.state.capabilities.thought === 'Expanded' ? 'Expanded' : 'Auto'; }
  function capLines(c) { var n = Number(c && c.state && c.state.capabilities && c.state.capabilities.thoughtLines); return LINES.indexOf(n) >= 0 ? n : DEFAULT_LINES; }
  /* a recorded example may show one mode in its own chat (Demo Studio, lab only); it never writes the preference */
  function modeOf(c, T) {
    if (T.thoughtMode === 'Auto' || T.thoughtMode === 'Expanded') return T.thoughtMode;
    return prefMode(c);
  }
  function isOpen(c, T) {
    var mode = modeOf(c, T), v = view[T.id];
    if (v && v.mode === mode) return v.open;
    if (T.thought.state === 'thinking') return true;
    return mode === 'Expanded';
  }
  function capped(c, T) {
    var v = view[T.id];
    return T.thought.state === 'thinking' && modeOf(c, T) === 'Auto' && !(v && v.open && v.mode === modeOf(c, T));
  }

  /* ------------------------------------------------------------------ words */
  /* plain paragraphs: {t:'p'} {t:'w',text} {t:'s'}, each with n, the words that must have arrived to release it */
  function tokenize(text) {
    var ops = [], words = 0;
    String(text || '').replace(/\r\n/g, '\n').split(/\n{2,}/).forEach(function (para) {
      var list = para.replace(/\s+/g, ' ').trim().split(' ').filter(Boolean);
      if (!list.length) return;
      ops.push({ t: 'p', n: words + 1 });
      list.forEach(function (w, i) { if (i) ops.push({ t: 's', n: words + 1 }); words++; ops.push({ t: 'w', text: w, n: words }); });
    });
    return { ops: ops, words: words };
  }
  /* the reasoning arrives in bursts of seven words, evenly from its first token to just before it hands over */
  function schedule(L) {
    var per = 7, bursts = Math.max(1, Math.ceil(L.words / per)), first = L.first, span = Math.max(300, L.ms - first - 520);
    L.arrive = [];
    for (var i = 0; i < bursts; i++) L.arrive.push({ at: first + (bursts === 1 ? 0 : span * i / (bursts - 1)), n: Math.min(L.words, (i + 1) * per) });
  }
  function arrived(L, t) { var n = 0; for (var i = 0; i < L.arrive.length; i++) if (t - L.t0 >= L.arrive[i].at) n = L.arrive[i].n; return n; }
  var BASE_MS = 1000 / 38;
  function interval(op, backlog) {
    var iv = BASE_MS / (1 + backlog / 12);
    if (/[.!?:]$/.test(op.text)) iv += Math.max(20, 110 - backlog * 6);
    else if (/[,;]$/.test(op.text)) iv += Math.max(6, 36 - backlog * 3);
    return Math.max(8, iv);
  }

  /* ------------------------------------------------------------------ the block's island
     .tt-body[data-pm-keep] > .tt-clip (height, JS-owned) > .tt-flow (paragraphs of words). The patcher keeps the
     island's children; its own attributes (aria-hidden while folded) are the render's. A remounted article rebuilds
     what was released so far, without motion. */
  function exec(L, flow, op, quiet) {
    if (op.t === 'p') { L.para = document.createElement('p'); flow.appendChild(L.para); return; }
    if (!L.para) { L.para = document.createElement('p'); flow.appendChild(L.para); }
    if (op.t === 's') { L.para.appendChild(document.createTextNode(' ')); return; }
    var w = document.createElement('span');
    w.className = quiet ? 'tt-w tt-still' : 'tt-w';
    w.textContent = op.text;
    L.para.appendChild(w);
  }
  function fill(flow, text) {
    var tk = tokenize(text), html = '', open = false;
    tk.ops.forEach(function (op) {
      if (op.t === 'p') { html += (open ? '</p>' : '') + '<p>'; open = true; }
      else if (op.t === 's') html += ' ';
      else html += '<span class="tt-w tt-still">' + esc(op.text) + '</span>';
    });
    flow.innerHTML = html + (open ? '</p>' : '');
  }
  function mount(island, T) {
    var clip = island.firstElementChild;
    if (clip && clip.classList.contains('tt-clip') && clip.firstElementChild) return clip;
    island.textContent = '';
    clip = document.createElement('div'); clip.className = 'tt-clip';
    var flow = document.createElement('div'); flow.className = 'tt-flow';
    clip.appendChild(flow); island.appendChild(clip);
    clip.__tt = { open: undefined, h: 0, hv: 0, y: 0, yv: 0, last: 0, anim: null };
    var L = live.get(T.id);
    if (L) {
      L.para = null; L.flow = flow;
      for (var i = 0; i < L.cursor; i++) exec(L, flow, L.ops[i], true);
    } else fill(flow, T.thought.text);
    return clip;
  }
  function lineH(flow) { var p = flow.querySelector('p'); var v = p ? parseFloat(getComputedStyle(p).lineHeight) : NaN; return isFinite(v) ? v : 20; }
  function capOf(flow) { var c; try { c = C(); } catch (e) { c = null; } return Math.round(lineH(flow) * capLines(c)); }

  /* ------------------------------------------------------------------ open, fold, follow */
  function critStep(x, v, w, dt) { var e = Math.exp(-w * dt), k = v + w * x; return [(x + k * dt) * e, (v - w * k * dt) * e]; }
  function natural(clip) { return clip.firstElementChild ? clip.firstElementChild.offsetHeight : 0; }
  /* settle(): the resting state, at once: open and settled is natural height; open and live follows its flow;
     folded is 0 and hidden */
  function settle(clip, open, live_) {
    var st = clip.__tt, flow = clip.firstElementChild;
    st.open = open;
    clip.classList.toggle('tt-folded', !open);
    if (!open) { clip.style.height = '0px'; clip.classList.remove('tt-capped'); flow.style.transform = ''; st.h = 0; st.hv = 0; st.y = 0; st.yv = 0; return; }
    if (live_) { var full = natural(clip), cap = live_.capped ? capOf(flow) : Infinity; st.h = Math.min(full, cap); st.hv = 0; clip.style.height = st.h + 'px'; scrollTo_(clip, live_.capped ? Math.max(0, full - st.h) : 0, true); }
    else { clip.style.height = ''; clip.classList.remove('tt-capped'); flow.style.transform = ''; st.y = 0; st.yv = 0; }
  }
  function scrollTo_(clip, y, instant) {
    var st = clip.__tt, flow = clip.firstElementChild;
    if (instant) { st.y = y; st.yv = 0; }
    flow.style.transform = st.y > 0.5 ? 'translateY(' + (-st.y).toFixed(1) + 'px)' : '';
    clip.classList.toggle('tt-capped', y > 0.5);
  }
  function animateTo(clip, open, L) {
    var st = clip.__tt, P = window.PM56_PMX, flow = clip.firstElementChild;
    if (st.anim) { try { st.anim.cancel(); } catch (e) { } st.anim = null; }
    var from = clip.getBoundingClientRect().height;
    var full = natural(clip), to = open ? (L && L.capped ? Math.min(full, capOf(flow)) : full) : 0;
    st.open = open;
    clip.classList.remove('tt-folded');
    if (open && !(L && L.capped)) { flow.style.transform = ''; clip.classList.remove('tt-capped'); st.y = 0; st.yv = 0; }
    var a = P && P.animate && !reduced() ? P.animate(clip, [{ height: from + 'px', opacity: open ? 0 : 1 }, { height: to + 'px', opacity: open ? 1 : 0 }],
      { duration: (P.t && P.t('fold')) || 320, easing: (P.ease && P.ease('emph')) || 'cubic-bezier(.2,0,0,1)' }) : null;
    if (!a) { settle(clip, open, L); return; }
    st.anim = a; st.animAt = now();
    clip.style.height = to + 'px';
    a.onfinish = function () { if (st.anim !== a) return; st.anim = null; settle(clip, open, live.get(clip.__id) || null); };
  }

  /* the room a fold gives back is held (turn-stream's floor), so a reader at the bottom stays where they are */
  function holdForFold(finite) {
    try { var S = window.PM56_STREAM; if (S && S.holdShrink) S.holdShrink(finite === true); } catch (e) { }
  }

  /* ------------------------------------------------------------------ screen readers: one status, never words */
  var sr = null;
  function announce(text) {
    if (!sr || !sr.isConnected) {
      sr = document.createElement('div');
      sr.id = 'pm56-thought-status'; sr.setAttribute('role', 'status'); sr.setAttribute('aria-live', 'polite');
      Object.assign(sr.style, { position: 'fixed', left: '-1px', top: '-1px', width: '1px', height: '1px', overflow: 'hidden', clipPath: 'inset(50%)', whiteSpace: 'nowrap' });
      document.body.appendChild(sr);
    }
    sr.textContent = '';
    setTimeout(function () { if (sr) sr.textContent = text; }, 60);
  }
  function seconds(n) { return n + (n === 1 ? ' second' : ' seconds'); }

  /* ------------------------------------------------------------------ the live loop */
  function kick() { if (!loop) loop = requestAnimationFrame(frame); }
  /* the placeholder's seconds, after 4 s (ACD-470); rendered with the line too, so a render never blanks them */
  function elapsed(L, t) { var w = ((t == null ? now() : t) - L.t0) / 1000; return w >= 4 ? ' · ' + Math.floor(w) + 's' : ''; }
  function islandOf(id) { return document.querySelector('.transcript-inner [data-k="tt-island:' + CSS.escape(id) + '"]'); }
  function frame(ts) {
    loop = 0;
    var t = now(), due = [];
    live.forEach(function (L) {
      var island = islandOf(L.id);
      var clip = island ? mount(island, L.T) : null;
      if (clip) {
        clip.__id = L.id;
        var flow = clip.firstElementChild, n = arrived(L, t), released = 0, burst = reduced() ? 1e9 : 3;
        L.flow = flow;
        /* mounted outside an app render (a scoped patch): take the article's open state at once */
        if (clip.__tt.open === undefined) { var host = island.closest('.message-thought'); settle(clip, !host || host.getAttribute('data-thought-open') === '1', L); }
        while (L.cursor < L.ops.length && L.ops[L.cursor].n <= n && t >= L.nextAt && released < burst) {
          var op = L.ops[L.cursor];
          exec(L, flow, op, reduced());
          L.cursor++;
          if (op.t === 'w') { released++; var back = 0; for (var i = L.cursor; i < L.ops.length && L.ops[i].n <= n; i++) if (L.ops[i].t === 'w') back++; L.nextAt = t + (reduced() ? 0 : interval(op, back)); }
        }
        if (released && window.PM56_SENDSTOP) window.PM56_SENDSTOP.token(L.tid);
        var el = island.closest('.message-thought'), sec = el && el.querySelector('[data-tt-elapsed]');
        if (sec) { var txt = elapsed(L, t); if (sec.textContent !== txt) sec.textContent = txt; }
        follow(clip, L, ts);
      }
      if (t - L.t0 >= L.ms) due.push(L.id);
    });
    due.forEach(function (id) { handover(id); });
    if (live.size) loop = requestAnimationFrame(frame);
  }
  /* height follows the flow through a critically damped spring (the answer island's omega), capped to the reader's
     lines under Auto; the flow scrolls inside the cap the same way, so a new line slides in instead of stepping. The
     window never trails its words by more than 40 px, except while it eases to a new cap (a change of Lines shown
     while thinking mid-thought): that change glides the whole way instead of stepping */
  function follow(clip, L, ts) {
    var st = clip.__tt;
    if (st.open === undefined || !st.open || st.anim) return;
    var flow = clip.firstElementChild, full = natural(clip), cap = L.capped ? capOf(flow) : Infinity, target = Math.min(full, cap), y = Math.max(0, full - target);
    /* a new cap starts its glide from this frame: the render that brought it may have held the frame up for a while,
       and that wait must not count as glide time (at the 0.1 s clamp the spring covered three quarters of the way in
       the first frame) */
    var recapNow = st.cap !== undefined && cap !== st.cap && st.h > 0;
    if (recapNow) st.recap = true;
    st.cap = cap;
    if (reduced()) { st.h = target; st.recap = false; clip.style.height = target + 'px'; scrollTo_(clip, y, true); return; }
    var t = now(), dt = st.last && !recapNow ? Math.min(0.1, Math.max(0.0005, (t - st.last) / 1000)) : 1 / 60; st.last = t;
    var s = critStep(st.h - target, st.hv, 26, dt); st.h = target + s[0]; st.hv = s[1];
    if (Math.abs(st.h - target) < 0.4 && Math.abs(st.hv) < 4) { st.h = target; st.hv = 0; st.recap = false; }
    if (!st.recap && st.h < target - 40) st.h = target - 40;
    var hv = Math.max(0, st.h).toFixed(1) + 'px';
    if (clip.style.height !== hv) clip.style.height = hv;
    var s2 = critStep(st.y - y, st.yv, 22, dt); st.y = y + s2[0]; st.yv = s2[1];
    if (Math.abs(st.y - y) < 0.4 && Math.abs(st.yv) < 4) { st.y = y; st.yv = 0; }
    scrollTo_(clip, y, false);
  }

  /* ------------------------------------------------------------------ start and hand over */
  function findMsg(c, id) {
    var out = null;
    (c.state.threads || []).some(function (t) { return t.messages.some(function (m) { if (m.id === id) { out = { t: t, m: m }; return true; } return false; }); });
    return out;
  }
  /* start(c, thread, reply, thinking, {agent}) -> {id, ms, cardAfter} or null. Pushes the block now; the caller pushes the reply
     after it. The reply stays hidden (thoughtGate) until the reasoning hands over. */
  function start(c, t, R, thinking, opts) {
    if (!thinking || !thinking.text || !t || !R) return null;
    opts = opts || {};
    var tk = tokenize(thinking.text);
    var dur = thinking.ms || Math.round(1300 + tk.words * 26);
    dur = Math.min(9000, Math.max(1800, dur));
    var T = {
      id: c.uid('thought'), role: 'assistant', type: 'thought', time: new Date().toISOString(), replyId: R.id,
      liveTurnOf: R.liveTurnOf || null, runtime: R.runtime ? { provider: R.runtime.provider, model: R.runtime.model, modelId: R.runtime.modelId } : null,
      thought: { text: String(thinking.text), gist: thinking.gist || '', secs: 0, state: 'thinking' }
    };
    if (t.thoughtDemo === 'Auto' || t.thoughtDemo === 'Expanded') T.thoughtMode = t.thoughtDemo;
    t.messages.push(T);
    R.thoughtGate = true; R.afterThought = true;
    var L = { id: T.id, tid: t.id, T: T, replyId: R.id, t0: now(), ms: dur, first: Math.min(dur - 600, thinking.firstMs || 380), agent: !!opts.agent,
      ops: tk.ops, words: tk.words, cursor: 0, nextAt: 0, para: null, flow: null, capped: true };
    schedule(L);
    L.capped = capped(c, T);
    live.set(T.id, L); byReply[R.id] = T.id;
    announce(((T.runtime && T.runtime.model) || 'The assistant') + ' is thinking.');
    kick();
    return { id: T.id, ms: dur, cardAfter: CARD_AFTER };
  }
  /* end(L, how): 'done' when the answer (or the first tool call) starts; 'ended' when Stop or Send now cut it short;
     complete: true finishes every word first (leaving the thread lets the turn finish in the background) */
  function end(L, how, opts) {
    if (!live.has(L.id)) return false;
    live.delete(L.id);
    var c = C(), T = L.T, island = islandOf(L.id), complete = how === 'done' || (opts && opts.complete);
    if (complete) {
      L.cursor = L.ops.length;
      if (island) { var clip = mount(island, T); fill(clip.firstElementChild, T.thought.text); }
    } else {
      /* the words written so far are what was shown; keep exactly those, paragraph breaks included */
      var parts = [], cur = [];
      for (var j = 0; j < L.cursor; j++) { var op = L.ops[j]; if (op.t === 'p' && cur.length) { parts.push(cur.join(' ')); cur = []; } if (op.t === 'w') cur.push(op.text); }
      if (cur.length) parts.push(cur.join(' '));
      T.thought.text = parts.join('\n\n');
      T.thought.gist = '';
    }
    T.thought.state = complete ? 'done' : 'ended';
    T.thought.secs = Math.max(1, Math.round((complete && opts && opts.complete ? L.ms : now() - L.t0) / 1000));
    /* the reply appears now, except an agent turn's placeholder, which its working card replaces (turn-stream's
       director); it still appears if the turn was stopped while it thought, to carry its Stopped marker */
    var found = findMsg(c, L.replyId);
    if (found && !(L.agent && how === 'done' && !(opts && opts.complete))) delete found.m.thoughtGate;
    delete byReply[L.replyId];
    /* the hand-over as scheduled, not the clock of the frame that ran it: a frame runs its own work first, and a late one
       would push an on-time card past its cardAfter (P2b). Stop and Send now end early, so they keep now() */
    endedAt[L.replyId] = { at: Math.min(now(), L.t0 + L.ms), id: L.id };
    var willFold = !isOpen(c, T);
    var art = island && island.closest('.message-thought');
    /* the fold gives back far more height than what comes next needs at first (a reply's first line, or an agent
       turn's card, born CARD_AFTER later into the held room): hold the room now, before the render */
    if (willFold && art && art.getAttribute('data-thought-open') === '1') holdForFold();
    announce(complete ? 'Thought for ' + seconds(T.thought.secs) + '.' : 'Thinking ended after ' + seconds(T.thought.secs) + '.');
    return true;
  }
  /* handover(id, {render}): the answer or the first tool call is starting. id is the thought's or its reply's. */
  function handover(id, opts) {
    var tid = live.has(id) ? id : byReply[id];
    var L = tid && live.get(tid);
    if (!L) return false;
    end(L, 'done');
    if (!(opts && opts.render === false)) { var c = C(); c.renderApp(); c.followIfSticky(); }
    return true;
  }

  /* ------------------------------------------------------------------ owner */
  var owner = {
    busy: function (tid) { var b = false; live.forEach(function (L) { if (L.tid === tid) b = true; }); return b; },
    stop: function (tid) { var any = false; live.forEach(function (L) { if (L.tid === tid && end(L, 'ended')) any = true; }); if (any) C().renderApp(); },
    /* Send now: a written reply's thought ends with it; an agent turn keeps thinking, as its work keeps running */
    steer: function (tid) { var any = false; live.forEach(function (L) { if (L.tid === tid && !L.agent && end(L, 'ended')) any = true; }); if (any) C().renderApp(); },
    cancel: function (tid) { live.forEach(function (L) { if (L.tid === tid) end(L, 'done', { complete: true }); }); },
    reset: function () { live.clear(); byReply = Object.create(null); view = Object.create(null); endedAt = Object.create(null); }
  };

  /* ------------------------------------------------------------------ render */
  var TIP = {
    show: 'Show thinking. Opens the reasoning the model shared before it answered.',
    hide: 'Hide thinking. Folds the reasoning back to one line.',
    hideLive: 'Hide thinking. Folds the reasoning while the model keeps thinking.'
  };
  function label(c, T, open) {
    var th = T.thought, model = (T.runtime && T.runtime.model) || 'Assistant';
    if (th.state === 'thinking') {
      var L = live.get(T.id);
      /* W4/W5 (PM7 build): the system loader's Think motion leads the label (L5). The label is redrawn every second (its
         elapsed time), so the loader sits in a slot the reconcile leaves to it (data-pm-keep); pip.js fills the slot and
         hands it over to the Orbit's Pip while the reply's work runs (one Pip per reply) */
      var slot = window.PM56_PIP && window.PM56_PIP.thinkingPip ? '<span class="tx-pending-pip tt-pending-pip" data-pm-keep aria-hidden="true"></span>' : '';
      return '<span class="tt-label tt-label-live" data-k="tt-label:live:' + esc(T.id) + '"><span class="tx-pending tt-pending">' + slot + '<b>' + esc(model) + '</b>' +
        '<span class="tx-pending-verb">is thinking</span><em class="tx-pending-t" data-tt-elapsed>' + esc(L ? elapsed(L) : '') + '</em></span></span>';
    }
    var head = th.state === 'ended' ? 'Thinking ended after ' + th.secs + 's' : 'Thought for ' + th.secs + 's';
    /* the spaces between the parts are text (the flex row draws its own gaps), so the line reads whole to assistive
       tech and as text: "Thought for 5s · the gist" */
    var gist = !open && th.gist ? ' <span class="tt-sep" aria-hidden="true">·</span> <span class="tt-gist">' + esc(th.gist) + '</span>' : '';
    return '<span class="tt-label" data-k="tt-label:' + esc(th.state) + ':' + esc(T.id) + '"><b class="tt-done">' + esc(head) + '</b>' + gist + '</span>';
  }
  function render(c, T) {
    var open = isOpen(c, T), th = T.thought, thinking = th.state === 'thinking';
    var tip = open ? (thinking ? TIP.hideLive : TIP.hide) : TIP.show;
    var chev = c.icon(c.hasIcon && c.hasIcon('chevron-right') ? 'chevron-right' : 'chevron', 12);
    return '<article class="message message-assistant message-thought" data-message-id="' + esc(T.id) + '" data-speaker="Assistant"' +
      ' data-thought-state="' + esc(th.state) + '" data-thought-open="' + (open ? 1 : 0) + '" data-thought-mode="' + esc(modeOf(c, T)) + '"' +
      (thinking ? ' data-streaming="pending"' : '') + '>' +
      '<div class="message-surface tt-surface">' +
      '<button type="button" class="tt-head" data-action="thought-toggle" data-id="' + esc(T.id) + '" aria-expanded="' + open + '" aria-controls="tt-body-' + esc(T.id) + '"' +
      ' data-hover-key="thought-' + esc(T.id) + '" data-hover-tip="' + esc(tip) + '">' +
      '<span class="tt-chev" aria-hidden="true">' + chev + '</span>' + label(c, T, open) + '</button>' +
      '<div class="tt-body" id="tt-body-' + esc(T.id) + '" data-pm-keep data-k="tt-island:' + esc(T.id) + '" role="group" aria-label="Thinking"' + (open ? '' : ' aria-hidden="true"') + '></div>' +
      '</div></article>';
  }
  EXT.slot('transcriptMessage', function (ctx) {
    var m = ctx.m;
    if (!m || m.type !== 'thought' || !m.thought) return '';
    return render(ctx, m);
  });
  EXT.slot('transcriptFamily', function (ctx) { return ctx.m && ctx.m.type === 'thought' ? 'prose' : ''; });

  /* after each render: every block on screen gets its island and its open state; a change animates */
  EXT.slot('afterRender', function (c, info) {
    if (!info || info.phase !== 'app') return;
    var arts = document.querySelectorAll('.transcript-inner > .message-thought');
    for (var i = 0; i < arts.length; i++) {
      var art = arts[i], id = art.getAttribute('data-message-id'), island = art.querySelector(':scope > .tt-surface > .tt-body');
      if (!id || !island) continue;
      var f = findMsg(c, id); if (!f) continue;
      var T = f.m, clip = mount(island, T), L = live.get(id) || null, open = art.getAttribute('data-thought-open') === '1';
      clip.__id = id;
      if (L) L.capped = capped(c, T);
      if (clip.__tt.open === undefined) { settle(clip, open, L); continue; }
      if (clip.__tt.open !== open) animateTo(clip, open, L);
      else if (!L && open && !clip.__tt.anim && clip.style.height) settle(clip, true, null);
    }
    if (live.size) kick();
  });

  EXT.action('thought-toggle', function (c, btn) {
    var f = findMsg(c, btn.dataset.id); if (!f || f.m.type !== 'thought') return true;
    var T = f.m, open = !isOpen(c, T);
    view[T.id] = { open: open, mode: modeOf(c, T) };
    var L = live.get(T.id); if (L) L.capped = capped(c, T);
    /* OBJ-1: a reader's close gives its room back after the ordinary hold. */
    if (!open) { var sticky = c.isSticky ? c.isSticky() : true; if (sticky) holdForFold(true); }
    c.renderApp();
    return true;
  });

  /* ------------------------------------------------------------------ wiring */
  var wired = false;
  function wire() {
    if (wired) return;
    var c; try { c = C(); } catch (e) { return; }
    if (!c || !c.registerTurnOwner) return;
    wired = true;
    c.registerTurnOwner(owner);
  }
  setTimeout(wire, 0);
  document.addEventListener('DOMContentLoaded', wire);
  EXT.chainAction('reset-all', function () { owner.reset(); return false; });

  window.PM56_THOUGHT = {
    start: function (c, t, R, thinking, opts) { wire(); return start(c, t, R, thinking, opts); },
    handover: handover,
    /* the agent turn's director: when the reply's thought was due to hand over, and whether a fold that began late still shows */
    handedAt: function (rid) { var e = endedAt[rid]; return e ? e.at : null; },
    folding: function (rid) { var e = endedAt[rid]; if (!e) return false; var isl = islandOf(e.id), clip = isl && isl.firstElementChild, a = clip && clip.__tt && clip.__tt.anim; return !!(a && clip.__tt.open === false && (a.pending || e.late || (e.late = clip.__tt.animAt > e.at + FOLD_LATE)) && clip.getBoundingClientRect().height > FOLD_VISIBLE); },
    /* state for checks and the demo: what each live thought is doing */
    active: function () { var out = []; live.forEach(function (L) { out.push({ id: L.id, tid: L.tid, reply: L.replyId, cursor: L.cursor, ops: L.ops.length, ms: L.ms, agent: L.agent, capped: L.capped }); }); return out; },
    mode: function (T) { return T ? modeOf(C(), T) : prefMode(C()); },
    /* Lines shown while thinking: the choices every surface offers (Settings, New chat defaults, the composer) and the
       one in force */
    lines: { choices: LINES.slice(), fallback: DEFAULT_LINES, current: function () { return capLines(C()); } },
    isOpen: function (id) { var f = findMsg(C(), id); return f && f.m.type === 'thought' ? isOpen(C(), f.m) : null; },
    owner: owner
  };
})();
