/* nier-world.js — NieR Mode's World parts for the 5.6 Pro concept, the script half (13 of the 29). OWNER: NieR Mode,
 * step N-B (2026-10-02). The styles are nier-world.css; the Look, Motion and Sound & voice parts are nier-parts.js; the
 * contract and window.PM_NIER are nier.js. Ported from PMConcept7's kit.d/20-nier-world.js and src/js/84-pod042-chat.js
 * (the same layer ids, copy and timings), with the concept's own surfaces.
 * A part is live while PM_NIER.has(key); each part installs when its key arrives and removes all it added when it goes,
 * so every part is silent while NieR Mode is off.
 *   boot       once, when the concept opens in a NieR theme: #o55nw-boot, a one-second mono log over the boot paint
 *   readouts   the status bar's AI / NET / SYS labels (CSS) and the context left as a twelve-cell HP bar: this writes
 *              html[data-o55nw-hp="0..12"] (and data-o55nw-low) from the context meter's own number (PM56_CTX.ringPct)
 *   quests     #o55nw-quest, a wide ink band on three real events: a plan approved (the plan turns to building), the
 *              build it started finishing, and a goal completing (PM56_GOAL)
 *   save       #o55nw-save: every saved preference (app.js savePrefs calls window.PM56_NIER_SAVED) and every change in
 *              the parts manager shows "Saving…" beside a turning diamond, then "Data saved"
 *   pod042     Pod 042 joins the composer's persona list (app.js asks window.PM56_NIER_PERSONAS); while it is the persona
 *              a send is answered here in Pod's voice, locally, through the chat's own stream (PM56_STREAM.begin), with no
 *              provider call, labelled honestly in the turn's meta. When NieR Mode or the part goes while Pod 042 is
 *              chosen, the persona chosen before it comes back.
 *   blocks, charts, ticks, glyphs, intel, empty   CSS only (the parts attribute); glyphs and empty read the line art
 *              nier_palette_56.py writes into nier.css's generated block (--o55nw-art-*)
 * Events are read from the concept's afterRender observer slot (what it just drew), so no observer watches the page.
 * Performance (PMConcept7's rules): no requestAnimationFrame loop and no MutationObserver; motion is CSS or one-shot Web
 * Animations of transform and opacity; sounds are the parts' synth (PM_NIER_PARTS.play), so they follow Menu sounds and
 * the concept's sound switch.
 */
(function () {
  'use strict';
  var html = document.documentElement;
  var N = function () { return window.PM_NIER || null; };
  var has = function (key) { var n = N(); try { return !!(n && n.has(key)); } catch (e) { return false; } };
  var still = function () {
    return html.getAttribute('data-motion') === 'reduced' || (document.body && document.body.classList.contains('pm56-reduced')) ||
      !!(window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches);
  };
  var esc = function (v) { return String(v == null ? '' : v).replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; }); };
  var play = function (name) { try { var P = window.PM_NIER_PARTS; return !!(P && typeof P.play === 'function' && P.play(name)); } catch (e) { return false; } };
  function layer() { var e = document.createElement('div'); e.setAttribute('aria-hidden', 'true'); document.body.appendChild(e); return e; }
  var ctx = function () { try { return window.PM56_EXT && window.PM56_EXT.ctx ? window.PM56_EXT.ctx() : null; } catch (e) { return null; } };

  /* ---------- the part registry ------------------------------------------------------------------------------------ */
  var PARTS = {};
  var live = {};
  function sync() {
    if (!document.body) return;
    Object.keys(PARTS).forEach(function (key) {
      var want = has(key);
      if (want === !!live[key]) return;
      live[key] = want;
      try { PARTS[key][want ? 'on' : 'off'](); } catch (e) { /* a part never breaks the app */ }
    });
  }

  /* ---------- boot sequence ------------------------------------------------------------------------------------------ */
  var BOOT_LINES = [['System check', 'OK'], ['Loading personal data', 'OK'], ['Connecting to Bunker', 'OK'], ['Mounting the assistant', 'OK'], ['Interface', 'NieR Mode']];
  var bootEl = null;
  function bootEnd() {
    var el = bootEl; bootEl = null; if (!el) return;
    document.removeEventListener('keydown', bootEnd, true); document.removeEventListener('pointerdown', bootEnd, true);
    el.remove();
  }
  function boot() {
    if (!has('boot') || still() || document.hidden || !document.body) return false;
    var el = bootEl = layer(); el.id = 'o55nw-boot';
    el.innerHTML = '<div class="o55nw-boot-log"><div class="o55nw-boot-head"><small>YoRHa unit · Puppet Master</small>Boot sequence</div>'
      + BOOT_LINES.map(function (l, i) { return '<div class="o55nw-boot-line" style="--i:' + i + '"><span>' + esc(l[0]) + '</span><i></i><b>' + esc(l[1]) + '</b></div>'; }).join('')
      + '<div class="o55nw-boot-meter"><i></i></div></div>';
    el.addEventListener('animationend', function (e) { if (e.target === el) bootEnd(); });
    document.addEventListener('keydown', bootEnd, true); document.addEventListener('pointerdown', bootEnd, true);
    window.setTimeout(bootEnd, 1600); /* in case the page never paints the animation (a hidden tab) */
    return true;
  }
  PARTS.boot = { on: function () {}, off: function () { bootEnd(); } };

  /* ---------- unit readouts: the context left as twelve cells --------------------------------------------------------- */
  function hpUpdate() {
    var pct = null;
    try { pct = window.PM56_CTX && typeof window.PM56_CTX.ringPct === 'function' ? Number(window.PM56_CTX.ringPct()) : null; } catch (e) { pct = null; }
    if (!(pct >= 0)) pct = 64;
    var free = Math.max(0, Math.min(100, 100 - pct)), hp = String(Math.round(12 * free / 100));
    if (html.getAttribute('data-o55nw-hp') !== hp) html.setAttribute('data-o55nw-hp', hp);
    var low = free < 20;
    if (html.hasAttribute('data-o55nw-low') !== low) html.toggleAttribute('data-o55nw-low', low);
  }
  PARTS.readouts = {
    on: function () { hpUpdate(); },
    off: function () { html.removeAttribute('data-o55nw-hp'); html.removeAttribute('data-o55nw-low'); }
  };

  /* ---------- quest banners ------------------------------------------------------------------------------------------ */
  var quest = null;
  function questEnd(el) { if (el && el.isConnected) el.remove(); if (quest === el) quest = null; }
  function banner(kicker, title, line) {
    if (!live.quests || !document.body || document.hidden) return false;
    if (quest) questEnd(quest);
    var el = quest = document.createElement('div');
    el.id = 'o55nw-quest'; el.setAttribute('role', 'status');
    el.innerHTML = '<div class="o55nw-q-band"></div><div class="o55nw-q-copy"><span class="o55nw-q-mark" aria-hidden="true"></span><span class="o55nw-q-kicker">' + esc(kicker) + '</span>'
      + '<span class="o55nw-q-title">' + esc(title) + '</span><span class="o55nw-q-line">' + esc(line) + '</span></div>';
    document.body.appendChild(el);
    play('confirm');
    if (still() || typeof el.animate !== 'function') { window.setTimeout(function () { questEnd(el); }, 2800); return true; }
    var band = el.firstElementChild, copy = el.lastElementChild;
    band.animate([{ transform: 'scaleY(.012)', opacity: 1 }, { transform: 'scaleY(1)', opacity: 1 }], { duration: 220, easing: 'cubic-bezier(.2, .85, .25, 1)', fill: 'backwards' });
    copy.animate([{ opacity: 0, easing: 'step-end' }, { opacity: 1, offset: 0.3, easing: 'step-end' }, { opacity: 0.25, offset: 0.5, easing: 'step-end' }, { opacity: 1, offset: 0.7 }, { opacity: 1 }],
      { duration: 320, delay: 160, fill: 'backwards' });
    window.setTimeout(function () {
      if (!el.isConnected) return;
      copy.animate([{ opacity: 1 }, { opacity: 0 }], { duration: 120, easing: 'steps(3, end)', fill: 'forwards' });
      var a = band.animate([{ transform: 'scaleY(1)', opacity: 1 }, { transform: 'scaleY(.012)', opacity: 1, offset: 0.8 }, { transform: 'scaleY(.012)', opacity: 0 }],
        { duration: 300, delay: 90, easing: 'cubic-bezier(.6, 0, .8, .3)', fill: 'forwards' });
      a.onfinish = function () { questEnd(el); }; a.oncancel = function () { questEnd(el); };
    }, 2600);
    return true;
  }
  PARTS.quests = { on: function () {}, off: function () { if (quest) questEnd(quest); } };
  /* the three events, read from what the concept just drew: the plan turning to building (approve-plan), the run it
     started completing while the plan builds, and the current thread's goal turning to completed */
  var planWas, workWas, goalWas = {};
  function quests(c) {
    var st = c.state || {}, ps = st.planStatus, wc = !!(st.work && st.work.completed), tid = st.selectedThread;
    if (planWas !== undefined && ps === 'building' && planWas !== 'building') banner('Plan', 'Plan approved', 'Building it now. The Orbit shows each step as it runs.');
    if (workWas === false && wc && ps === 'building') banner('Build', 'Build complete', 'Every step finished. Activity holds the changes for review.');
    planWas = ps; workWas = wc;
    var G = window.PM56_GOAL;
    if (G && typeof G.summary === 'function' && tid) {
      var gs = null; try { gs = G.summary(tid).status; } catch (e) { gs = null; }
      if (goalWas[tid] && goalWas[tid] !== 'completed' && gs === 'completed') banner('Goal Mode', 'Goal complete', 'Its outcomes were checked against current evidence.');
      goalWas[tid] = gs;
    }
  }

  /* ---------- save signal --------------------------------------------------------------------------------------------- */
  var save = null, saveTimers = [];
  function saveClear() { saveTimers.forEach(function (t) { window.clearTimeout(t); }); saveTimers = []; }
  function saveSignal() {
    if (!live.save || !document.body) return;
    if (!save) { save = layer(); save.id = 'o55nw-save'; save.setAttribute('aria-hidden', 'false'); save.setAttribute('role', 'status'); save.innerHTML = '<i aria-hidden="true"></i><span></span>'; }
    saveClear();
    var text = save.lastElementChild, set = function (s, words) { save.dataset.state = s; if (words != null && text.textContent !== words) text.textContent = words; };
    set('saving', 'Saving…');
    saveTimers.push(window.setTimeout(function () {
      set('done', 'Data saved');
      saveTimers.push(window.setTimeout(function () { set('gone'); saveTimers.push(window.setTimeout(function () { if (save) delete save.dataset.state; }, 220)); }, 1500));
    }, 520));
  }
  PARTS.save = { on: function () {}, off: function () { saveClear(); if (save) save.remove(); save = null; } };
  window.PM56_NIER_SAVED = function () { try { saveSignal(); } catch (e) { /* decoration only */ } };

  /* ---------- Pod 042 in the chat --------------------------------------------------------------------------------------- */
  var POD = 'Pod 042';
  window.PM56_NIER_PERSONAS = function () { return has('pod042') ? [[POD, 'NieR Mode companion · answers on this computer']] : []; };
  /* PMConcept7's copy (src/copy.json pod042), its proposals pointed at the chat's own controls */
  var LINES = {
    greet: ['Report: Pod 042 is online and assigned to this thread.', 'Query: What should this unit look into? Plans, work, context, history and NieR Mode are within range.'],
    thanks: ['Report: Acknowledged. Pod 042 remains on standby.'],
    plan: ['Analysis: A plan turns a rough goal into outcomes and a few real decisions before any work starts.', 'Proposal: Send /plan with the goal, then read the plan part by part before Build.'],
    runNone: ['Report: No work is running in this thread.', 'Proposal: Approve a plan, or ask for work, to start a run.'],
    runDone: ['Report: The last run in this thread is complete.', 'Proposal: Activity holds the changes it made, ready for review.'],
    runLive: ['Analysis: The run is {stage}. {done} of {total} steps are finished.', 'Proposal: The Orbit shows each step, and anything waiting on you.'],
    usage: ['Analysis: This thread holds {pct} percent of its context window.', 'Report: Capacity is sufficient.'],
    usageHigh: ['Analysis: This thread holds {pct} percent of its context window.', 'Alert: Capacity is running low.', 'Proposal: Open the context meter and compact the thread.'],
    safe: ['Analysis: Every turn in this thread keeps a restore point.', 'Proposal: Open a message’s More menu to restore from that point.'],
    nier: ['Report: NieR Mode is on with {n} of {all} parts installed.', 'Proposal: Demo Studio, NieR Mode · Plug-in Chips installs or removes parts.'],
    unknown: ['Query: This unit could not match “{q}” to a known task.', 'Proposal: Ask about plans, work, context, history or NieR Mode.']
  };
  function answerFor(c, text) {
    var q = String(text || '').trim(), low = q.toLowerCase(), key = 'unknown', v = { q: q.length > 48 ? q.slice(0, 47) + '…' : q };
    var st = c.state || {};
    if (/\b(thanks|thank you|thx)\b/.test(low)) key = 'thanks';
    else if (/\b(build|run|runs|running|work|working|orbit|progress)\b/.test(low)) {
      var w = st.work || {}, steps = (c.D && c.D.workSteps) || [];
      if (!w.started) key = 'runNone';
      else if (w.completed) key = 'runDone';
      else {
        var i = Math.max(0, Math.min(steps.length - 1, Math.floor(w.step || 0))), s = steps[i] || {};
        key = 'runLive'; v = { stage: String(s.label || 'working').toLowerCase(), done: i, total: steps.length || 1 };
      }
    } else if (/\b(plan|plans|planning|approve)\b/.test(low)) key = 'plan';
    else if (/\b(usage|token|tokens|context|cost|costs|limit|budget|window)\b/.test(low)) {
      var pct = 64; try { pct = Number(window.PM56_CTX.ringPct()); } catch (e) { pct = 64; }
      key = pct >= 75 ? 'usageHigh' : 'usage'; v = { pct: Math.round(pct) };
    } else if (/\b(undo|history|back|safe|mistake|restore|revert|version)\b/.test(low)) key = 'safe';
    else if (/\b(nier|theme|look|parts?|chips?)\b/.test(low)) { var n = N(); key = 'nier'; v = { n: n ? n.parts().length : 0, all: n ? n.PARTS.length : 29 }; }
    else if (/^(hi|hello|hey|yo)\b|\bpod\b|status|report/.test(low)) key = 'greet';
    var lines = LINES[key].map(function (l) { return l.replace(/\{(\w+)\}/g, function (m, k) { return v[k] == null ? m : String(v[k]); }); });
    /* each line its own paragraph, the lead word in bold (the stream's rich text) */
    return { key: key, chunks: lines.map(function (l, i) { var m = /^(\w+):\s*(.*)$/.exec(l); return (i ? '\n\n' : '') + (m ? '**' + m[1] + ':** ' + m[2] : l); }) };
  }
  var podAnswered = [];
  function podSend(c, t, raw) {
    if (!has('pod042') || !c || !c.state || c.state.persona !== POD || !t) return false;
    var text = String(raw == null ? '' : raw).trim();
    if (!text || text.charAt(0) === '/') return false;                 /* commands keep their own owners */
    var RT = window.PM56_RUNTIME && window.PM56_RUNTIME.composer, dest = RT && RT.destination;
    if (dest && dest.kind && dest.kind !== 'assistant') return false;   /* a targeted send (plan revision ...) is not Pod's */
    var S = window.PM56_STREAM; if (!S || typeof S.begin !== 'function') return false;
    var now = new Date().toISOString();
    var user = { id: c.uid('user'), role: 'user', type: 'text', body: text, time: now };
    t.messages.push(user);
    if (typeof S.sent === 'function') S.sent(user, t);
    var a = answerFor(c, text);
    var m = { id: c.uid('assistant'), role: 'assistant', type: 'text', body: '', rich: true, streaming: true, streamPhase: 'pending', time: now, sourceMessageId: user.id, pod042: true,
      runtime: { provider: POD, account: 'answered on this computer, not your AI plan', model: POD, modelId: 'pod042', persona: POD, mode: String(c.state.mode || 'agent').toLowerCase(),
        effort: null, startedAt: now, completedAt: null, tokens: {}, context: {}, cost: {} } };
    t.messages.push(m);
    S.begin(m, t.id, { id: 'pod042-' + a.key, chunks: a.chunks, delayMs: 380, chunkMs: 240, terminal: 'complete' }, { rich: true, quiet: true });
    podAnswered.push({ key: a.key, id: m.id }); if (podAnswered.length > 20) podAnswered.shift();
    return { claimed: true };
  }
  var podHooked = false, personaBefore = 'Product Manager';
  function podHook() {
    if (podHooked) return;
    var RT = window.PM56_RUNTIME && window.PM56_RUNTIME.composer;
    if (!RT || !Array.isArray(RT.preSendHooks)) return;
    RT.preSendHooks.unshift(podSend);   /* first: while Pod 042 is the persona it answers before any module claims */
    podHooked = true;
  }
  /* the part (or NieR Mode) went while Pod 042 is the persona: the persona chosen before it comes back */
  function podFallBack() {
    if (has('pod042')) return;
    var c = ctx(); if (!c || !c.state || c.state.persona !== POD) return;
    c.state.persona = personaBefore && personaBefore !== POD ? personaBefore : 'Product Manager';
    if (typeof c.renderApp === 'function') c.renderApp();
  }
  PARTS.pod042 = { on: function () {}, off: function () { window.setTimeout(podFallBack, 0); } };

  /* CSS-only parts, listed so the registry reports them */
  ['blocks', 'charts', 'ticks', 'glyphs', 'intel', 'empty'].forEach(function (key) { PARTS[key] = { on: function () {}, off: function () {} }; });

  /* ---------- what the concept just drew ---------------------------------------------------------------------------- */
  var EXT = window.PM56_EXT;
  if (EXT && typeof EXT.slot === 'function') {
    EXT.slot('afterRender', function (c, info) {
      if (html.getAttribute('data-o55-nier') !== 'on') { planWas = undefined; workWas = undefined; goalWas = {}; return; }
      try {
        var phase = info && info.phase;
        if (phase !== 'app' && phase !== 'scope') return;
        if (phase === 'app') {
          podHook();
          if (c.state && c.state.persona && c.state.persona !== POD) personaBefore = c.state.persona;
          if (live.readouts) hpUpdate();
        }
        if (live.quests) quests(c);
      } catch (e) { /* decoration only */ }
    });
  }

  /* ---------- wiring ------------------------------------------------------------------------------------------------ */
  function start() {
    var n = N(); if (!n || typeof n.onChange !== 'function') return false;
    n.onChange(function (info) {
      sync();
      if (info && info.reason === 'init' && info.on) boot();
      if (info && info.on && (info.reason === 'parts' || info.reason === 'background')) saveSignal();
      if (info && (info.reason === 'off' || info.reason === 'parts')) window.setTimeout(podFallBack, 0);
    });
    return true;
  }
  if (!start()) window.setTimeout(start, 0);
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', sync); else window.setTimeout(sync, 0);

  /* test hooks */
  window.PM_NIER_WORLD = Object.freeze({
    live: function () { return Object.keys(live).filter(function (k) { return live[k]; }); },
    sync: sync,
    banner: function (k, t, l) { return banner(k, t, l); },
    boot: function () { return boot(); },
    save: function () { saveSignal(); },
    answer: function (text) { var c = ctx(); return c ? answerFor(c, text) : null; },
    podAnswered: function () { return podAnswered.slice(); }
  });
})();
