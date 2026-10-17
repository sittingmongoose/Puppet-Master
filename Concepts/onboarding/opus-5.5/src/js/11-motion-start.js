/* Moves begun in a long frame play on the frames that are shown (final motion QA, 2026-10-16). A click's first frame
   can take a third of a second or more (the arriving page or panel is styled and laid out, a first visit builds its
   content), and so can the frame after it (its first paint, Glass's first blur). A move started in such a frame was
   over, or most of the way through, by the time it was first drawn: the timeline that frame runs on is from before its
   work, and a move run by the compositor takes its start from that time too. The page exit vanished in one frame, the
   onboarding window's exit was lost (and came back for one frame when restarted later), the rail's held panel went
   before the new one dealt in.
   PM_START_ON_SHOWN(anims) holds the moves at their start, paused, from the next frame on, for as long as the frame
   before was a long one (more than 40 ms after the one before it), then plays them from their start: they begin once
   frames come on time (two in a row after a long one), at most `frames` (6) frames later (a page that never draws
   on time, such as software rendering, still moves after that). `anims` is an array of Animations or a function
   returning one (read again each frame). `o.release`, if given, runs once in the frame the moves start, just before they play:
   a page change hands the click's fade over to its exit there (tools/shell_motion.py, ANSWER_FIRST). `o.start: 'commit'`
   is for entrances that start from nothing: they go on the first frame on time after a long one, so what they bring is
   not held invisible through the GPU's first draw; other moves still wait for the second. */
(function () {
  'use strict';
  /* PM_AFTER_LAYOUT(fn): fn runs in the coming frame after its style and layout, before its paint (a ResizeObserver
     delivery), so what it reads is already computed. One observer, made as this script loads, serves every caller:
     ResizeObservers are told in the order they were made, and one made at the moment it was needed was told after the
     page's older observers, some of which write in that same delivery (the Liquid Glass root observer), so the read
     paid a whole-page restyle anyway (Home's notice placement 215 ms, the theme's resize kick 389 ms on the P1000,
     Settings lane trace). Callers queued meanwhile run once, in the order they asked.
     Never ask from inside another ResizeObserver's callback: that code already runs after layout, so do the work there.
     The root observed from inside a delivery cannot be delivered in that frame; the browser reports it as a
     'ResizeObserver loop' error and fn runs a frame late (the panels' bodyObserver asking for its resize flush, F4
     settle bisect). Asked from inside this helper's own delivery, fn is moved to the next frame on purpose. */
  const afterQ = [];
  let afterRo = null, observing = false, flushing = false, flushedAt = null;
  const watch = () => { if (!observing && afterQ.length) { observing = true; afterRo.observe(document.documentElement); } };
  const flushAfter = () => {
    if (afterRo && observing) { afterRo.unobserve(document.documentElement); observing = false; }
    const q = afterQ.splice(0);
    flushing = true;
    flushedAt = document.timeline.currentTime;
    for (const fn of q) { try { fn(); } catch (e) { try { console.error('[PM_AFTER_LAYOUT]', e); } catch (_) { /* none */ } } }
    flushing = false;
    /* asked again from inside this delivery: the next frame's (observing again here would be a loop the browser
       reports as undelivered notifications) */
    if (afterQ.length && afterRo) requestAnimationFrame(watch);
  };
  try { afterRo = typeof ResizeObserver === 'function' ? new ResizeObserver(flushAfter) : null; } catch (_) { afterRo = null; }
  window.PM_AFTER_LAYOUT = function afterLayout(fn) {
    if (afterQ.indexOf(fn) < 0) afterQ.push(fn);
    if (!afterRo) { requestAnimationFrame(() => setTimeout(flushAfter, 0)); return; }
    if (flushing) return;
    /* asked after this frame's delivery already ran (another observer's delivery, later in the same frame): observing
       the root now would be one the browser cannot deliver this frame and reports as a loop. The next frame's
       animation frame callbacks observe it instead; a task between frames lands in that same next frame anyway. */
    if (flushedAt != null && flushedAt === document.timeline.currentTime) { requestAnimationFrame(watch); return; }
    watch();
  };
  window.PM_START_ON_SHOWN = function startOnShown(anims, o) {
    const max = (o && o.frames) || 6, held = new Set(), before = o && typeof o.release === 'function' ? o.release : null;
    /* o.start === 'commit': the caller's moves are entrances that start from nothing (opacity 0, or clipped to a line),
       so they go on the first frame on time after a long one rather than waiting for the second. Held at their start
       until then, they kept what they bring invisible through the GPU's first draw of it (the editor's customizer sheet:
       commit +213 ms, title +456 ms on the P1000, F5 editor lane). Without it (an exit, a page's crossfade, a slide that
       starts visible) the moves still wait for the second, so the raster after a long frame does not eat their start. */
    const atCommit = !!(o && o.start === 'commit');
    const list = () => { try { return (typeof anims === 'function' ? anims() : anims) || []; } catch (_) { return []; } };
    const hold = () => list().forEach((a) => {
      try { if (a && a.playState !== 'idle' && !held.has(a)) { a.pause(); a.currentTime = 0; held.add(a); } } catch (_) { /* gone */ }
    });
    const release = () => {
      if (before) { try { before(); } catch (_) { /* decoration only */ } }
      held.forEach((a) => { try { if (a.playState === 'paused') a.play(); } catch (_) { /* gone */ } });
    };
    /* the frame the moves were begun after: a first frame on time (the task that began them was short) leaves them as
       they are, with no pause and restart, so a fast computer sees nothing of this */
    /* After a long frame the moves wait for two frames on time in a row: the long frame's new content is rastered by
       the GPU after it, and while it rasters (a whole new page: 150-400 ms on the P1000) the compositor draws
       nothing, so a move begun on the first frame back was still shown in two or three steps (the onboarding window's
       exit at Enter, round 3). The frames themselves stop while that raster runs, so the second on-time frame comes
       after it. */
    let last = document.timeline.currentTime, n = 0, onTime = 0, long = false;
    const tick = () => {
      const now = document.timeline.currentTime;
      if (now == null) { release(); return; }
      /* a frame is long when it began late, or when its own style and layout have already run long (this check runs
         after them): the Wizard built under the onboarding window is styled inside the frame that begins right after
         Enter, so the frames began on time while that one ran 300 ms, and the window's exit, started from that
         frame's time, was over by its first draw */
      const gap = last == null ? Infinity : now - last, late = performance.now() - now;
      last = now;
      if (gap <= 40 && late <= 40) { onTime++; if (!long || onTime >= 2 || atCommit) { release(); return; } }
      else { long = true; onTime = 0; }
      if (++n >= max) { release(); return; }
      hold();
      next();
    };
    /* Each check runs in its frame after layout (PM_AFTER_LAYOUT, before paint), so reading
       the moves (getAnimations for CSS animations) finds style already computed: from an animation frame callback it
       forced that frame's style early (49.7 ms on the P1000 for the customizer's six panels, editor lane). What the
       check changes is drawn in the same frame. */
    const next = () => requestAnimationFrame(() => window.PM_AFTER_LAYOUT(tick));
    next();
  };

  /* PM_BUSY(): one answer for work parked until the app is still (the editor's and terminal's background refreshes,
     their measurement and token reads), so every caller waits for the same things. It returns what is up, as a short
     name (truthy), or '' (falsy) when nothing is:
       'page'        a page change (html[data-pm-page-transition])
       'usage'       a Usage moment (html[data-pmu-moment])
       'onboarding'  the onboarding window (html[data-o55-open])
       'boot'        the boot covers: html[data-o55-boot-wait], NieR's boot log (#o55nw-boot), the tour's (.o55t-bootcover)
       'reboot'      the NieR reboot plate (#o55np-reboot), until it is removed
       'calm'        the Reduce Animations NieR cover (#o55np-calm), through its fade
       'theme'       the look cover (js/12-theme-transition.js), until its lift has ended
       'nier'        a NieR switch asked and not yet painted (PM_NIER.wanted() differs from on())
     A hidden tab is not busy by itself (callers keep their own document.hidden check). It reads attributes and ids only,
     never style or layout, so it costs nothing in any frame. 'pm-idle' is sent on window in the first frame after a
     busy spell ends: every spell this script sees begin (one of those markers appearing) or that a call finds. */
  const busyRoot = document.documentElement;
  const BUSY_ATTRS = [['data-pm-page-transition', 'page'], ['data-pmu-moment', 'usage'], ['data-o55-open', 'onboarding'], ['data-o55-boot-wait', 'boot']];
  const BUSY_IDS = [['o55np-reboot', 'reboot'], ['o55np-calm', 'calm'], ['o55nw-boot', 'boot']];
  /* the tour's boot cover is always a child of the body (85-tour-nier.js coverBoot): its ~30 children are looked at,
     never a live collection, whose length walks the whole document again after any DOM change (4.3 ms a call on
     Nas1 during an editor open, Glass lane) */
  const tourCovered = () => { for (let c = document.body && document.body.lastElementChild; c; c = c.previousElementSibling) if (c.classList.contains('o55t-bootcover')) return true; return false; };
  let busyFrame = 0, busyTimer = 0;
  const busyNow = () => {
    for (const [a, why] of BUSY_ATTRS) if (busyRoot.hasAttribute(a)) return why;
    for (const [id, why] of BUSY_IDS) if (document.getElementById(id)) return why;
    if (tourCovered()) return 'boot';
    try { const t = window.PM_THEME_TRANSITION; if (t && typeof t.busy === 'function' && t.busy()) return 'theme'; } catch (_) { /* none */ }
    try { const n = window.PM_NIER; if (n && typeof n.wanted === 'function' && typeof n.on === 'function' && !!n.wanted() !== !!n.on()) return 'nier'; } catch (_) { /* none */ }
    return '';
  };
  /* A spell's end is seen where it happens (an attribute or a cover going, the theme cover's lift ending, a NieR switch
     painting: busyEnded, from the observer below and from 12-theme-transition.js), and checked in that frame; a slow
     check (250 ms) catches anything else. A spell can last the whole onboarding session, and a frame callback for
     each of its frames kept a main frame per vsync for nothing (landing review SH-8). */
  let busySpell = false;
  const busyCheck = () => {
    busyFrame = 0;
    if (!busySpell) return;
    if (busyNow()) { clearTimeout(busyTimer); busyTimer = setTimeout(() => { busyTimer = 0; if (!busyFrame) busyFrame = requestAnimationFrame(busyCheck); }, 250); return; }
    busySpell = false; clearTimeout(busyTimer); busyTimer = 0;
    try { window.dispatchEvent(new Event('pm-idle')); } catch (_) { /* none */ }
  };
  const busyArm = () => { if (!busySpell) { busySpell = true; if (!busyFrame) busyFrame = requestAnimationFrame(busyCheck); } };
  const busyEnded = () => { if (busySpell && !busyFrame) busyFrame = requestAnimationFrame(busyCheck); };
  window.PM_BUSY = function busy() { const why = busyNow(); if (why) busyArm(); return why; };
  window.PM_BUSY.ended = busyEnded;
  /* a spell begins or ends: an attribute on html (NieR's own for a switch that paints), a cover added to or taken
     from the body */
  try {
    const seen = new MutationObserver(() => { if (busySpell) busyEnded(); else if (busyNow()) busyArm(); });
    seen.observe(busyRoot, { attributes: true, attributeFilter: BUSY_ATTRS.map((a) => a[0]).concat(['data-o55-nier']) });
    const watchBody = () => { if (document.body) seen.observe(document.body, { childList: true }); };
    if (document.body) watchBody(); else document.addEventListener('DOMContentLoaded', watchBody, { once: true });
  } catch (_) { /* calls still arm it */ }

  /* PM_WARM: the one page-wide queue for idle warm drawing (the lead's IDLE-WARM-RULE.md v3.5, 2026-10-17). A lane hands
     it small steps that draw something unseen, so the GPU compiles its programs or rasters a surface before first use.
     On a cold P1000 a step that was short on the main thread still held the compositor 100-1,000 ms when it made the
     GPU compile several programs (part2's F5b idle trace), so a step goes only when the page is still, and is judged by
     the frames presented after it.
       when: an idle callback (no timeout) with 45 ms or more left, so nothing is drawing frames; or, once every other
         gate has held for 1 s (the quiet clock: from the batch queued, the last gate that failed, and the last input +
         600 ms, whichever is latest), any idle callback, since the page is drawing frames only for an ambient loop
         (Home's: on the 3090 the flat 10 s backstop of v3.3 put the first step at +15 s). The gates are looked at before
         the slot, so a gate that fails starts the clock again, and so do 'pm-idle' and the page becoming visible. While
         a gate that holds a state fails (busy, input, animation, hidden) the wait grows from 400 ms to 2 s (back to 400
         once a step goes); a frame off time retries after 250 ms; 'pm-idle' tries again at once.
       gates: the page visible, PM_BUSY() empty, no pointer, key, wheel or touch input for 600 ms, none pending, any
         back-off run out, no finite CSS animation or transition running, and the two frames before the step on time
         (1.5x the median refresh). Animations and transitions are counted from their events, so no style is read in a
         timer or a frame; what is counted is looked up in PM_AFTER_LAYOUT, where style is already computed, when it is
         new and once a second after: one that ended without an event reaching window, an infinite one (an ambient
         loop) or one whose active duration is over 1.5 s (a creep as slow as the chat's progress bar is ambient too) is
         let go, and so is an element no longer connected and anything counted for 30 s.
       where: a GPU step at the start of a frame (rAF), the third of three watched; a cpu step (no GPU work: canvas
         draws, blurs, encodes on the CPU) inside an idle callback after those frames, given its deadline. In the rAF
         only the frames, hidden, PM_BUSY, input and the count are looked at, never style.
       judged: late when either of the two rAF intervals after the step's frame is over max(40 ms, 3x the median
         refresh): the first is where a GPU compile holds the next frame. A GPU step is then watched until 300 ms after its
         frame, and any later interval over 100 ms is its late too, since on the P1000 its programs link 100-350 ms after
         its frame, when the tiles raster (frameMs [d1, d2, worst later]); the next admission waits for the watch, so links
         never stack across steps. A cpu step (it makes no GPU work) keeps two intervals: in a long slot the two
         after the frame that follows it; in a short one (the quiet clock) it runs in the idle time of the third watched
         frame and is judged from that frame, so its overrun of the ambient loop's next frame counts, and an idle callback
         that comes only after a later frame puts it back at the head of the line. A cleanup run() returns runs in the
         first frame after the step.
       light (one kind, <= 2 ms of JS): judged by the one interval after it; the next step, if light, may go in that
         same frame (one per frame) while every gate holds and no frame was late in the last 2 s; the chain's last step
         gets the 300 ms watch.
       late: onLate({ name, late, dropped: false }); true means the owner handled it (split it, moved it), otherwise it
         goes to the end of its owner's line once, and late twice it is dropped (onLate with dropped: true). The wait
         after a late step is 1 s, doubling to 8 s; 3 clean steps reset it. 3 late in a row stop the queue until
         'pm-idle' or 30 s; the second stop is for the session: the rest is dropped, its owners told, 'pm-warm-done' sent.
       order: near steps first, then round-robin across owners, FIFO within an owner; until() false skips a step.
       off: ?pm-warm=0, and the no-GPU profile once O55.motion knows it (?pm-warm=force runs it there, for checks); an
         add is then logged 'skipped' (state().off says so before adding), and steps queued before it was known are let
         go with onLate({ dropped: true }), as at the session stop.
     add({ owner, name, run, near, light, cpu, until, onLate }) -> id; cancel(id), cancelOwner(owner), state(owner?)
     { queued, dropped, backoffMs, lateRun, stopped, session, off, running, lateCount, waiting: the gate that held the
     last try ('idle', 'frames', 'input', 'animation', ...) }; window.__pmWarmLog (also PM_WARM.log): the last 200
     { owner, name, t, at (the step's frame), cpuMs, frameMs, late, outcome }. 'pm-warm-done' on window when the queue
     empties, at the session stop, and after an add skipped with nothing queued (warming off), so an owner that waits
     for it never waits on a software-rendered computer */
  const warmFlag = (v) => { try { return new RegExp('(?:^|[?&])pm-warm=' + v + '(?:&|$)').test(location.search); } catch (_) { return false; } };
  const warmOff = warmFlag('0'), warmForce = warmFlag('force');
  /* softwareRendered() says false until its worker has answered, so only a known answer is kept (landing review IW-1) */
  let warmSoft = warmForce ? false : null;
  const softKnown = () => {
    if (warmSoft !== null) return true;
    try {
      const M = window.O55 && window.O55.motion;
      if (!M || typeof M.softwareRendered !== 'function') { warmSoft = false; return true; }
      if (typeof M.softwareKnown === 'function' && !M.softwareKnown()) return false;
      warmSoft = !!M.softwareRendered();
    } catch (_) { warmSoft = false; }
    return true;
  };
  const warmQ = [], warmLog = window.__pmWarmLog = [], warmDropped = [], warmDeltas = [];
  let warmSeq = 0, warmLastOwner = '', warmTimer = 0, warmIdle = 0, warmBusy = false, warmRunning = null,
    warmBackoff = 0, warmUntil = 0, warmClean = 0, warmLateRun = 0, warmLateCount = 0, warmLateAt = -1e9,
    warmStops = 0, warmStopped = false, warmSession = false, warmStopTimer = 0, warmDoneTimer = 0,
    warmInput = -1e9, warmWaitMs = 0, warmQuietSince = 0, warmVis = 0, warmD1 = 0, warmD2 = 0, warmClassing = false, warmWhy = '';
  const listen = (t, fn) => window.addEventListener(t, fn, { capture: true, passive: true });
  ['pointermove', 'pointerdown', 'keydown', 'wheel', 'touchstart'].forEach((t) => listen(t, () => { warmInput = performance.now(); }));
  /* shown again: the quiet clock starts again (review WQ5-3) */
  document.addEventListener('visibilitychange', () => { warmVis++; if (!document.hidden) warmQuietSince = performance.now(); });
  /* finite animations and transitions running: Element -> Map('a'|'t' + pseudo + '|' + name -> { at, seen, fin }).
     An event says when one starts and ends, not always: one that the page stops by hiding its element (the chat bar's
     buttons, at load on Nas1) sent no cancel that reached window and held the queue 30 s. So what is counted is looked
     up in PM_AFTER_LAYOUT (classify), when it is new (an animation's iteration count is not in its event) and again once
     it has been counted a second: one no longer there, or an infinite one (an ambient loop), is let go */
  const warmAnims = new Map();
  const animKey = (k, e) => k + (e.pseudoElement || '') + '|' + (k === 'a' ? e.animationName : e.propertyName);
  const animOn = (k) => (e) => {
    const el = e.target;
    if (!el || el.nodeType !== 1) return;
    let m = warmAnims.get(el);
    if (!m) warmAnims.set(el, (m = new Map()));
    const now = performance.now();
    m.set(animKey(k, e), { at: now, seen: now, fin: k === 't' ? true : undefined });
    /* elements taken out of the page while nothing is queued are let go here */
    if (warmAnims.size > 50) animState();
  };
  const animOff = (k) => (e) => {
    const m = warmAnims.get(e.target);
    if (!m) return;
    m.delete(animKey(k, e));
    if (!m.size) warmAnims.delete(e.target);
  };
  listen('animationstart', animOn('a')); listen('animationend', animOff('a')); listen('animationcancel', animOff('a'));
  listen('transitionrun', animOn('t')); listen('transitionend', animOff('t')); listen('transitioncancel', animOff('t'));
  /* '' none finite running, 'run' one is (looked up within the last second), 'ask' only ones to look up */
  const animState = () => {
    const now = performance.now();
    let st = '';
    warmAnims.forEach((m, el) => {
      if (!el.isConnected) { warmAnims.delete(el); return; }
      m.forEach((a, k) => {
        if (now - a.at > 30000) m.delete(k);
        else if (a.fin && now - a.seen <= 1000) st = 'run';
        else if (!st) st = 'ask';
      });
      if (!m.size) warmAnims.delete(el);
    });
    return st;
  };
  /* in PM_AFTER_LAYOUT: style is computed, so reading an element's animations forces nothing. Only an element counted for
     a pseudo-element's animation is asked for its subtree, which walks every element under it (shell's review) */
  const classify = () => {
    warmClassing = false;
    const now = performance.now();
    warmAnims.forEach((m, el) => {
      let list = null;
      m.forEach((a, k) => {
        if (a.fin && now - a.seen <= 1000) return;
        if (!list) {
          let sub = false;
          m.forEach((_, key) => { if (key.charAt(1) === ':') sub = true; });
          try { list = sub ? el.getAnimations({ subtree: true }) : el.getAnimations(); } catch (_) { list = []; }
        }
        const anim = list.find((x) => x.effect && x.effect.target === el && (k[0] === 'a' ? x.animationName != null && 'a' + (x.effect.pseudoElement || '') + '|' + x.animationName === k
          : x.transitionProperty != null && 't' + (x.effect.pseudoElement || '') + '|' + x.transitionProperty === k));
        let gone = true;
        /* v3.4 item 7: an active duration over 1.5 s is ambient (Infinity for a loop) */
        try { gone = !anim || anim.playState === 'finished' || anim.playState === 'idle' || anim.effect.getComputedTiming().activeDuration > 1500; } catch (_) { /* gone */ }
        if (gone) m.delete(k); else { a.fin = true; a.seen = now; }
      });
      if (!m.size) warmAnims.delete(el);
    });
    warmWake(0, true);
  };
  const median = () => {
    if (warmDeltas.length < 5) return 1000 / 60;
    const s = warmDeltas.slice().sort((a, b) => a - b);
    return s[Math.floor(s.length / 2)];
  };
  const lateMs = () => Math.max(40, 3 * median());
  const onTime = (d) => d <= 1.5 * median();
  const note = (d) => {
    if (d > lateMs()) warmLateAt = performance.now();
    warmD1 = warmD2; warmD2 = d;
    warmDeltas.push(d); if (warmDeltas.length > 30) warmDeltas.shift();
  };
  const pending = () => { try { const s = navigator.scheduling; return !!(s && s.isInputPending && s.isInputPending()); } catch (_) { return false; } };
  /* the gates that read nothing of style or layout, so they may be looked at inside a frame: '' when all hold, else
     the first that does not (state().waiting) */
  const blocked = () => {
    const now = performance.now();
    if (document.hidden) return 'hidden';
    if (window.PM_BUSY()) return 'busy';
    if (now - warmInput < 600) return 'input';
    if (pending()) return 'pending';
    if (now < warmUntil) return 'backoff';
    const a = animState();
    return a === 'run' ? 'animation' : a === 'ask' ? 'animation?' : '';
  };
  /* a gate that fails starts the quiet clock again */
  const quiet = () => { warmWhy = blocked(); if (warmWhy) warmQuietSince = performance.now(); return !warmWhy; };
  const logStep = (st, cpuMs, frameMs, late, outcome) => {
    warmLog.push({ owner: st.owner, name: st.name, t: Math.round(performance.now()), at: st.at ? Math.round(st.at) : null, cpuMs: Math.round(cpuMs * 10) / 10, frameMs: frameMs, late: late, outcome: outcome });
    if (warmLog.length > 200) warmLog.shift();
  };
  const tell = (st, late, dropped) => {
    if (typeof st.onLate !== 'function') return false;
    try { return st.onLate({ name: st.name, late: late, dropped: dropped }) === true; } catch (_) { return false; }
  };
  const done = () => {
    if (warmDoneTimer) return;
    warmDoneTimer = setTimeout(() => {
      warmDoneTimer = 0;
      if ((warmQ.length || warmBusy) && !warmSession) return;
      try { window.dispatchEvent(new Event('pm-warm-done')); } catch (_) { /* none */ }
    }, 0);
  };
  /* the steps still queued are let go (the session stop: 'dropped'; the no-GPU profile known only after they were
     queued: 'skipped'), and each owner is told, so work it needs anyway (a screen built ahead) goes its own way */
  /* what was dropped, for state(): the last 200, as the log keeps (shell's review) */
  const dropped = (st) => { warmDropped.push(st.owner + ':' + st.name); if (warmDropped.length > 200) warmDropped.shift(); };
  const dropAll = (outcome) => {
    warmQ.splice(0).forEach((st) => { logStep(st, 0, null, false, outcome); if (outcome === 'dropped') dropped(st); tell(st, 0, true); });
    done();
  };
  /* the next step: near first, then the owner after the last one's, FIFO within an owner; a step whose until() says
     it is no longer wanted is skipped. take: false only looks */
  const pick = (take) => {
    for (;;) {
      let i = warmQ.findIndex((st) => st.near);
      if (i < 0) {
        const owners = [];
        warmQ.forEach((st) => { if (owners.indexOf(st.owner) < 0) owners.push(st.owner); });
        if (!owners.length) return null;
        const next = owners[(owners.indexOf(warmLastOwner) + 1) % owners.length];
        i = warmQ.findIndex((st) => st.owner === next);
      }
      const st = warmQ[i];
      let want = true;
      if (typeof st.until === 'function') { try { want = st.until() !== false; } catch (_) { want = false; } }
      if (want) { if (take) warmQ.splice(i, 1); return st; }
      warmQ.splice(i, 1); logStep(st, 0, null, false, 'skipped');
    }
  };
  /* wait ms, then for an idle callback. force: replace a wait already set (pm-idle, a classification) */
  const warmWake = (ms, force) => {
    if (warmBusy || warmStopped || !warmQ.length) return;
    if (warmTimer || warmIdle) { if (!force) return; clearTimeout(warmTimer); if (warmIdle && window.cancelIdleCallback) cancelIdleCallback(warmIdle); warmTimer = warmIdle = 0; }
    warmTimer = setTimeout(() => {
      warmTimer = 0;
      if (window.requestIdleCallback) warmIdle = requestIdleCallback(idle);
      else idle({ timeRemaining: () => 50 });
    }, Math.max(0, ms || 0));
  };
  /* soonest: when only the quiet clock is short, the wait ends when it is due rather than past it */
  const retry = (soonest) => { warmWaitMs = warmWaitMs ? Math.min(2000, warmWaitMs * 2) : 400; warmWake(soonest >= 0 ? Math.min(warmWaitMs, soonest) : warmWaitMs); };
  /* the slot an idle callback gives: 'long' (45 ms or more left: nothing is drawing frames), 'short' (less, once the
     quiet clock has run 1 s: the page's own motion never rests, so the next steps take short slots too while the gates
     hold), or '' */
  const slot = (d) => {
    if ((d && typeof d.timeRemaining === 'function' ? d.timeRemaining() : 50) >= 45) return 'long';
    return performance.now() - Math.max(warmQuietSince, warmInput + 600) >= 1000 ? 'short' : '';
  };
  const idle = (d) => {
    warmIdle = 0;
    if (warmBusy || warmStopped || !warmQ.length) return;
    if (!softKnown()) { warmWhy = 'profile'; retry(); return; }
    if (warmSoft) { dropAll('skipped'); return; }
    const a = animState();
    if (a === 'ask' && !document.hidden) { warmWhy = 'animation?'; if (!warmClassing) { warmClassing = true; window.PM_AFTER_LAYOUT(classify); } return; }
    if (!quiet()) { retry(); return; }
    if (!slot(d)) { warmWhy = 'idle'; retry(Math.max(16, 1000 - (performance.now() - Math.max(warmQuietSince, warmInput + 600)))); return; }
    /* admitted: two frames on time, then the step in the third */
    warmBusy = true;
    const vis = warmVis;
    requestAnimationFrame((tA) => requestAnimationFrame((tB) => requestAnimationFrame((tC) => {
      if (vis !== warmVis) { warmBusy = false; retry(); return; }
      note(tB - tA); note(tC - tB);
      /* a frame off time is momentary: tried again in 250 ms, the wait not grown (v3.5 item 3) */
      if (!onTime(tB - tA) || !onTime(tC - tB)) { warmWhy = 'frames'; warmQuietSince = performance.now(); warmBusy = false; warmWake(250); return; }
      if (!quiet()) { warmBusy = false; retry(); return; }
      const st = pick(true);
      if (!st) { warmBusy = false; done(); return; }
      warmWaitMs = 0; warmWhy = '';
      if (st.cpu) cpuStep(st, tC); else runStep(st, tC);
    })));
  };
  const run = (st, arg) => {
    warmRunning = st; warmLastOwner = st.owner;
    const c0 = performance.now();
    let cleanup = null;
    try { cleanup = st.run(arg); } catch (e) { try { console.error('[PM_WARM] ' + st.owner + ':' + st.name, e); } catch (_) { /* none */ } }
    return { cpu: performance.now() - c0, cleanup: typeof cleanup === 'function' ? cleanup : null };
  };
  const clean = (r) => { if (r.cleanup) { try { r.cleanup(); } catch (_) { /* none */ } } };
  /* the watch after a GPU step (v3.5 item 1): the frames from the one at 'from' until 300 ms after the step's frame t;
     done(the worst of those intervals), or done(-1) when the page was hidden meanwhile */
  const WATCH_MS = 300, WATCH_LATE = 100;
  const warmWatch = (t, from, vis, done) => {
    let prev = from, worst = 0;
    const tick = (x) => {
      if (vis !== warmVis) { done(-1); return; }
      const d = x - prev;
      prev = x; note(d); worst = Math.max(worst, d);
      if (x - t >= WATCH_MS) done(worst); else requestAnimationFrame(tick);
    };
    if (from - t >= WATCH_MS) done(0); else requestAnimationFrame(tick);
  };
  /* a GPU step, in the frame at t */
  const runStep = (st, t) => {
    const vis = warmVis, limit = lateMs(), r = run(st);
    st.at = t;
    requestAnimationFrame((a) => {
      clean(r);
      const d1 = a - t;
      if (vis !== warmVis) { judge(st, r.cpu, null, false, limit); after(); return; }
      note(d1);
      if (st.light) {
        /* the next light step in this same frame, while everything holds */
        const nx = d1 <= limit && !warmStopped && performance.now() - warmLateAt > 2000 && onTime(warmD1) && onTime(d1) && quiet() ? pick(false) : null;
        if (nx && nx.light && !nx.cpu) {
          if (judge(st, r.cpu, [Math.round(d1)], false, limit)) return;
          pick(true); runStep(nx, a); return;
        }
        if (d1 > limit) { if (!judge(st, r.cpu, [Math.round(d1)], true, limit)) after(); return; }
        /* the chain's last step: the watch */
        warmWatch(t, a, vis, (w) => {
          if (w < 0) { judge(st, r.cpu, null, false, limit); after(); return; }
          if (!judge(st, r.cpu, [Math.round(d1), Math.round(w)], w > WATCH_LATE, limit)) after();
        });
        return;
      }
      requestAnimationFrame((b) => {
        const d2 = b - a;
        if (vis !== warmVis) { judge(st, r.cpu, null, false, limit); after(); return; }
        note(d2);
        warmWatch(t, b, vis, (w) => {
          if (w < 0) { judge(st, r.cpu, null, false, limit); after(); return; }
          if (!judge(st, r.cpu, [Math.round(d1), Math.round(d2), Math.round(w)], Math.max(d1, d2) > limit || w > WATCH_LATE, limit)) after();
        });
      });
    });
  };
  /* a cpu step, inside an idle callback, given its deadline. In a long slot it is judged by the two intervals after the
     next frame; in a short one it must come in the idle time of tC, the admission frame, and is judged by tC -> a and
     a -> b, so an overrun of the ambient loop's frame counts (v3.4); one that comes after a later frame goes back to the
     head of the line */
  const cpuStep = (st, tC) => {
    warmRunning = st; st.at = tC;
    const vis = warmVis, limit = lateMs();
    let next = 0, r = null, kind = '';
    requestAnimationFrame((a) => {
      next = a;
      if (!r || kind !== 'short') return;
      clean(r);
      if (vis !== warmVis) { judge(st, r.cpu, null, false, limit); after(); return; }
      const d1 = a - tC;
      note(d1);
      requestAnimationFrame((b) => {
        const d2 = b - a;
        if (vis !== warmVis) { judge(st, r.cpu, null, false, limit); after(); return; }
        note(d2);
        if (!judge(st, r.cpu, [Math.round(d1), Math.round(d2)], Math.max(d1, d2) > limit, limit)) after();
      });
    });
    const back = () => { warmRunning = null; warmQ.unshift(st); warmBusy = false; retry(); };
    const go = (d) => {
      warmIdle = 0;
      if (st.cancelled) { warmRunning = null; warmBusy = false; warmWake(0); return; }
      if (!quiet()) { back(); return; }
      kind = slot(d);
      if (!kind || (kind === 'short' && next)) { warmWhy = 'idle'; back(); return; }
      r = run(st, d);
      if (kind === 'short') return;
      requestAnimationFrame((a) => {
        clean(r);
        requestAnimationFrame((b) => requestAnimationFrame((c) => {
          const d1 = b - a, d2 = c - b;
          if (vis !== warmVis) { judge(st, r.cpu, null, false, limit); after(); return; }
          note(d1); note(d2);
          if (!judge(st, r.cpu, [Math.round(d1), Math.round(d2)], Math.max(d1, d2) > limit, limit)) after();
        }));
      });
    };
    if (window.requestIdleCallback) warmIdle = requestIdleCallback(go); else go({ timeRemaining: () => 50 });
  };
  /* -> true when the queue stopped */
  const judge = (st, cpuMs, frameMs, late, limit) => {
    warmRunning = null;
    if (!late) {
      logStep(st, cpuMs, frameMs, false, frameMs ? 'ran' : 'unjudged');
      if (!frameMs) return false;
      warmLateRun = 0;
      if (++warmClean >= 3) { warmBackoff = 0; warmClean = 0; }
      return false;
    }
    warmLateCount++; warmLateRun++; warmClean = 0;
    warmBackoff = warmBackoff ? Math.min(8000, warmBackoff * 2) : 1000;
    warmUntil = performance.now() + warmBackoff;
    const worst = Math.max.apply(null, frameMs);
    st.lates = (st.lates || 0) + 1;
    if (st.lates >= 2) { logStep(st, cpuMs, frameMs, true, 'dropped'); dropped(st); tell(st, worst, true); }
    else if (st.cancelled || tell(st, worst, false)) logStep(st, cpuMs, frameMs, true, 'late-handled');
    else { warmQ.push(st); logStep(st, cpuMs, frameMs, true, 'late'); }
    if (warmLateRun < 3) return false;
    /* 3 late in a row: stopped until 'pm-idle' or 30 s; the second time for the session */
    warmBusy = false; warmStopped = true;
    if (++warmStops >= 2) { warmSession = true; dropAll('dropped'); return true; }
    warmStopTimer = setTimeout(resume, 30000);
    return true;
  };
  const after = () => {
    warmBusy = false;
    if (!warmQ.length) { done(); return; }
    warmWake(warmBackoff ? Math.max(0, warmUntil - performance.now()) : 0);
  };
  const resume = () => {
    if (!warmStopped || warmSession) return;
    warmStopped = false; warmLateRun = 0; clearTimeout(warmStopTimer); warmStopTimer = 0;
    warmWake(0, true);
  };
  /* the page settled: the quiet clock starts again (review WQ5-3: a busy spell between two tries left it run out) */
  window.addEventListener('pm-idle', () => { warmQuietSince = performance.now(); if (warmStopped) resume(); else { warmWaitMs = 0; warmWake(0, true); } });
  window.PM_WARM = {
    add(o) {
      if (!o || typeof o.run !== 'function') return 0;
      const st = { id: ++warmSeq, owner: String(o.owner || 'page'), name: String(o.name || 'step'), run: o.run, near: !!o.near,
        light: !!o.light, cpu: !!o.cpu, until: o.until, onLate: o.onLate };
      if (warmSession) {
        logStep(st, 0, null, false, 'dropped'); dropped(st);
        Promise.resolve().then(() => tell(st, 0, true)); done();
        return st.id;
      }
      if (warmOff || warmSoft === true) { logStep(st, 0, null, false, 'skipped'); if (!warmQ.length) done(); return st.id; }
      /* a new batch: the waits and the quiet clock start again */
      if (!warmQ.length && !warmBusy) { warmWaitMs = 0; warmQuietSince = performance.now(); }
      warmQ.push(st); warmWake(0);
      return st.id;
    },
    /* a cancel that empties the queue sends 'pm-warm-done' too; one that took nothing out sends nothing */
    cancel(id) {
      const n = warmQ.length;
      for (let i = warmQ.length - 1; i >= 0; i--) if (warmQ[i].id === id) warmQ.splice(i, 1);
      if (warmRunning && warmRunning.id === id) warmRunning.cancelled = true;
      if (n && !warmQ.length && !warmBusy) done();
    },
    cancelOwner(owner) {
      const n = warmQ.length;
      for (let i = warmQ.length - 1; i >= 0; i--) if (warmQ[i].owner === owner) warmQ.splice(i, 1);
      if (warmRunning && warmRunning.owner === owner) warmRunning.cancelled = true;
      if (n && !warmQ.length && !warmBusy) done();
    },
    state(owner) {
      const mine = (st) => !owner || st.owner === owner;
      return { queued: warmQ.filter(mine).length, dropped: warmDropped.filter((d) => !owner || d.indexOf(owner + ':') === 0),
        backoffMs: warmBackoff, lateRun: warmLateRun, stopped: warmStopped, session: warmSession, off: warmOff || warmSoft === true,
        running: warmRunning && mine(warmRunning) ? warmRunning.owner + ':' + warmRunning.name : null, lateCount: warmLateCount,
        waiting: warmQ.length && !warmBusy ? warmWhy : '' };
    },
    log: warmLog
  };
})();
