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
    /* o.wait: () => bool. While it says true the moves stay held, even when the frames are on time, for at most o.waitCap
       ms (1.5 s) from the first check: an arriving page that draws its content in slices first says so (a page change
       holds while its page carries data-pm-entrance-wait: Usage's board, rastered a card a frame so the compositor never
       waits on the whole board, F6 entry freeze) */
    const waitFor = o && typeof o.wait === 'function' ? o.wait : null, waitCap = (o && o.waitCap) || 1500;
    let firstCheck = null;
    const waiting = () => {
      if (!waitFor) return false;
      const t = performance.now();
      if (firstCheck === null) firstCheck = t;
      if (t - firstCheck >= waitCap) return false;
      try { return !!waitFor(); } catch (_) { return false; }
    };
    /* o.start === 'commit': the caller's moves are entrances that start from nothing (opacity 0, or clipped to a line),
       so they go on the first frame on time after a long one rather than waiting for the second. Held at their start
       until then, they kept what they bring invisible through the GPU's first draw of it (the editor's customizer sheet:
       commit +213 ms, title +456 ms on the P1000, F5 editor lane). Without it (an exit, a page's crossfade, a slide that
       starts visible) the moves still wait for the second, so the raster after a long frame does not eat their start. */
    const atCommit = !!(o && o.start === 'commit');
    const list = () => { try { return (typeof anims === 'function' ? anims() : anims) || []; } catch (_) { return []; } };
    /* a held move is marked (__pmHeld) while it is held, so PM7_MOTION_FINISH (tools/motion_finish.js) waits for it as
       a move still to come: counted only when running, a hold longer than its deadline (about the move's length plus
       100 ms; 340-425 ms holds are common on the P1000) let the page-in's cleanup take pm8-page-in off while it was held,
       and the page came in at once with no fade (Usage lane, P2-03) */
    const hold = () => list().forEach((a) => {
      try { if (a && a.playState !== 'idle' && !held.has(a)) { a.pause(); a.currentTime = 0; a.__pmHeld = true; held.add(a); } } catch (_) { /* gone */ }
    });
    const release = () => {
      if (before) { try { before(); } catch (_) { /* decoration only */ } }
      held.forEach((a) => { try { a.__pmHeld = false; if (a.playState === 'paused') a.play(); } catch (_) { /* gone */ } });
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
      const keep = waiting();
      /* a frame is long when it began late, or when its own style and layout have already run long (this check runs
         after them): the Wizard built under the onboarding window is styled inside the frame that begins right after
         Enter, so the frames began on time while that one ran 300 ms, and the window's exit, started from that
         frame's time, was over by its first draw */
      const gap = last == null ? Infinity : now - last, late = performance.now() - now;
      last = now;
      if (gap <= 40 && late <= 40) { onTime++; if (!keep && (!long || onTime >= 2 || atCommit)) { release(); return; } }
      else { long = true; onTime = 0; }
      if (++n >= max && !keep) { release(); return; }
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

  /* the arriving page may say it is still drawing (o.wait above): a page that sees this flag can slice its first draw */
  window.PM_START_ON_SHOWN.entranceWait = true;

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

  /* PM_WARM: the one page-wide queue for idle warm drawing (the lead's IDLE-WARM-RULE.md v3.9, 2026-10-17). A lane hands
     it small steps that draw something unseen, so the GPU compiles its programs or rasters a surface before first use.
     On a cold P1000 a step that was short on the main thread still held the compositor 100-1,000 ms when it made the
     GPU compile several programs (part2's F5b idle trace), so a step goes only when the page is still, and is judged by
     the frames presented after it.
       when: an idle callback (no timeout) with 45 ms or more left, so nothing is drawing frames; or, once every other
         gate has held for 1 s (the quiet clock: from the batch queued, the last lasting state, and the last input +
         600 ms, whichever is latest), any idle callback, since the page is drawing frames only for an ambient loop
         (Home's: on the 3090 the flat 10 s backstop of v3.3 put the first step at +15 s). The gates are looked at before
         the slot. A lasting state starts the clock again (hidden, busy, input, pending, 'pm-idle', the page shown);
         frames, animation and the back-off hold admission only while they fail (v3.6: on the P1000, restarting the
         clock on each momentary one starved the queue). While
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
       judged: by the two rAF intervals after the step's frame (the first is where a GPU compile holds the next frame)
         and, for a GPU step, every interval of its watch, until 300 ms after its frame, since on the P1000 its programs
         link 100-350 ms after its frame, when the tiles raster (frameMs [d1, d2, worst later]); the next admission waits
         for the watch, so links never stack across steps. Late (v3.9) is any of them over 100 ms, the acceptance bar;
         slow is one over max(40 ms, 3x the median refresh) but not over 100 ms, logged 'slow': one program linked (45-84
         ms on the P1000) is warm then, so a slow step takes the clean path, and only ends a light chain and holds light
         steps to one a frame pair for 2 s. A cpu step (it makes no GPU work) keeps two intervals: in a long slot the two
         after the frame that follows it; in a short one (the quiet clock) it is judged from the last frame before it ran
         (v3.6), so its overrun of the ambient loop's next frame counts, and only when no idle callback comes within 1 s
         does it go back to the head of the line. A cleanup run() returns runs in the first frame after the step.
       light (one kind, <= 2 ms of JS): judged by the one interval after it; the owner's next step, if light, may go in
         the next frame (one per frame) while that interval is under the slow bar, every gate holds, no frame was slow or
         late in the last 2 s and the chain is under
         100 ms (its owner's turn, v3.6 item 3); the chain's last step gets the 300 ms watch.
       late: onLate({ name, late, dropped: false }); true means the owner handled it (split it, moved it), otherwise it
         goes to the end of its owner's line once, and late twice it is dropped (onLate with dropped: true). The wait
         after a late step is 1 s, doubling to 8 s; 3 clean steps reset it. 3 late in a row stop the queue until
         'pm-idle' or 30 s; the second stop is for the session: the rest is dropped, its owners told, 'pm-warm-done' sent.
       order: near steps first, then round-robin across owners, FIFO within an owner, among the steps of the lowest later
         level queued: a step without later is level 0, later: true is 1, later: n is n, and a later step is never near
         (v3.7, v3.8); until() false skips a step.
       off: ?pm-warm=0, and the no-GPU profile once O55.motion knows it (?pm-warm=force runs it there, for checks); an
         add is then logged 'skipped' (state().off says so before adding), and steps queued before it was known are let
         go with onLate({ dropped: true }), as at the session stop.
     add({ owner, name, run, near, later, light, cpu, until, onLate }) -> id; cancel(id), cancelOwner(owner), state(owner?)
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
    /* looked up on the next PM_AFTER_LAYOUT (classify), a transition as an animation: one over 1.5 s is ambient (review
       WQ6-4: counted running from its event, a long creep held the gate a second each time it restarted) */
    m.set(animKey(k, e), { at: now, seen: now, fin: undefined });
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
  /* a lasting state starts the quiet clock again (v3.6 item 1): hidden, busy, input, pending; frames, animation and the
     back-off only hold admission while they fail */
  const LASTING = { hidden: 1, busy: 1, input: 1, pending: 1 };
  const quiet = () => { warmWhy = blocked(); if (LASTING[warmWhy]) warmQuietSince = performance.now(); return !warmWhy; };
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
        /* the lowest later level queued goes first; steps without later are level 0 (v3.8: Glass's warm 1, Usage's 2) */
        const lv = Math.min.apply(null, warmQ.map((st) => st.later)), pool = (st) => st.later === lv;
        const owners = [];
        warmQ.forEach((st) => { if (pool(st) && owners.indexOf(st.owner) < 0) owners.push(st.owner); });
        if (!owners.length) return null;
        const next = owners[(owners.indexOf(warmLastOwner) + 1) % owners.length];
        i = warmQ.findIndex((st) => st.owner === next && pool(st));
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
  /* a lookup pending ('animation?') is no reason to wait longer: classify runs at the next PM_AFTER_LAYOUT and wakes the
     queue on its result, as idle() asks it to (the lead's nit on 7da0909059: the growing retry cost up to 2 s) */
  const lookUp = () => {
    if (warmWhy !== 'animation?' || document.hidden) return false;
    if (!warmClassing) { warmClassing = true; window.PM_AFTER_LAYOUT(classify); }
    return true;
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
      if (!onTime(tB - tA) || !onTime(tC - tB)) { warmWhy = 'frames'; warmBusy = false; warmWake(250); return; }
      if (!quiet()) { warmBusy = false; if (!lookUp()) retry(); return; }
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
  const WATCH_MS = 300, LATE_MS = 100;
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
  /* the owner's next step if it is light (FIFO within the owner; one whose until() says no is skipped), taken off */
  const LIGHT_TURN_MS = 100;
  const nextLight = (owner) => {
    /* a near step waiting anywhere ends the chain, since near goes first (the lead's nit on 7da0909059) */
    if (warmQ.some((x) => x.near)) return null;
    for (;;) {
      const i = warmQ.findIndex((x) => x.owner === owner);
      if (i < 0 || !warmQ[i].light || warmQ[i].cpu || warmQ.some((x) => x.later < warmQ[i].later)) return null;
      const x = warmQ[i];
      let want = true;
      if (typeof x.until === 'function') { try { want = x.until() !== false; } catch (_) { want = false; } }
      warmQ.splice(i, 1);
      if (want) return x;
      logStep(x, 0, null, false, 'skipped');
    }
  };
  /* a GPU step, in the frame at t */
  const runStep = (st, t) => {
    const vis = warmVis, limit = lateMs(), r = run(st);
    st.at = t;
    requestAnimationFrame((a) => {
      clean(r);
      const d1 = a - t;
      if (vis !== warmVis) { judge(st, r.cpu, null, limit); after(); return; }
      note(d1);
      if (st.light) {
        /* the owner's next light step (FIFO) in this frame, while everything holds and the chain is under its 100 ms
           turn (v3.6 item 3); then the turn passes on */
        const c0 = st.chain0 || t;
        const nx = d1 <= limit && a - c0 < LIGHT_TURN_MS && !warmStopped && performance.now() - warmLateAt > 2000 && onTime(warmD1) && onTime(d1) && quiet() ? nextLight(st.owner) : null;
        if (nx) {
          if (judge(st, r.cpu, [Math.round(d1)], limit)) return;
          nx.chain0 = c0; runStep(nx, a); return;
        }
        /* the chain's last step: the watch */
        warmWatch(t, a, vis, (w) => {
          if (w < 0) { judge(st, r.cpu, null, limit); after(); return; }
          if (!judge(st, r.cpu, [Math.round(d1), Math.round(w)], limit)) after();
        });
        return;
      }
      requestAnimationFrame((b) => {
        const d2 = b - a;
        if (vis !== warmVis) { judge(st, r.cpu, null, limit); after(); return; }
        note(d2);
        warmWatch(t, b, vis, (w) => {
          if (w < 0) { judge(st, r.cpu, null, limit); after(); return; }
          if (!judge(st, r.cpu, [Math.round(d1), Math.round(d2), Math.round(w)], limit)) after();
        });
      });
    });
  };
  /* a cpu step, inside an idle callback, given its deadline. In a long slot it is judged by the two intervals after the
     next frame. In a short one it is judged from the last frame before it ran (v3.6 item 2): while its idle callback is
     pending a frame loop (1 s at most) keeps tLast, and it is judged by tLast -> a and a -> b, so its overrun of the
     ambient loop's frame counts; it goes back to the head of the line only when no idle callback comes within 1 s */
  const cpuStep = (st, tC) => {
    warmRunning = st; st.at = tC;
    const vis = warmVis, limit = lateMs();
    let tLast = tC, waiting = true;
    const loop = (t) => { if (!waiting) return; tLast = t; if (t - tC < 1000) requestAnimationFrame(loop); };
    requestAnimationFrame(loop);
    const back = (gate) => { waiting = false; clearTimeout(giveUp); warmRunning = null; warmQ.unshift(st); warmBusy = false; if (!(gate && lookUp())) retry(); };
    const giveUp = setTimeout(() => {
      if (!waiting) return;
      if (warmIdle && window.cancelIdleCallback) cancelIdleCallback(warmIdle);
      warmIdle = 0; warmWhy = 'idle'; back();
    }, 1000);
    const judged = (r, from, a) => {
      clean(r);
      if (vis !== warmVis) { judge(st, r.cpu, null, limit); after(); return; }
      const d1 = a - from;
      note(d1);
      requestAnimationFrame((b) => {
        const d2 = b - a;
        if (vis !== warmVis) { judge(st, r.cpu, null, limit); after(); return; }
        note(d2);
        if (!judge(st, r.cpu, [Math.round(d1), Math.round(d2)], limit)) after();
      });
    };
    const go = (d) => {
      warmIdle = 0;
      if (!waiting) return;
      if (st.cancelled) { waiting = false; clearTimeout(giveUp); warmRunning = null; warmBusy = false; warmWake(0); return; }
      if (!quiet()) { back(true); return; }
      const kind = slot(d);
      if (!kind) { warmWhy = 'idle'; back(); return; }
      waiting = false; clearTimeout(giveUp);
      const from = tLast, r = run(st, d);
      if (kind === 'short') { st.at = from; requestAnimationFrame((a) => judged(r, from, a)); return; }
      requestAnimationFrame((a) => { clean(r); requestAnimationFrame((b) => judged({ cpu: r.cpu, cleanup: null }, a, b)); });
    };
    if (window.requestIdleCallback) warmIdle = requestIdleCallback(go); else go({ timeRemaining: () => 50 });
  };
  /* -> true when the queue stopped */
  /* v3.9: late is any judged interval over 100 ms, the acceptance bar: only that is re-queued or dropped, backs off and
     counts toward the stops. Slow is one over max(40 ms, 3x refresh) but not over 100: its program is linked, so it
     takes the clean path, logged 'slow'; it ends a light chain and holds light steps to one a frame pair for 2 s */
  const judge = (st, cpuMs, frameMs, limit) => {
    warmRunning = null;
    const worst = frameMs ? Math.max.apply(null, frameMs) : 0, late = worst > LATE_MS;
    if (!late) {
      const slow = worst > limit;
      logStep(st, cpuMs, frameMs, false, !frameMs ? 'unjudged' : slow ? 'slow' : 'ran');
      if (!frameMs) return false;
      if (slow) warmLateAt = performance.now();
      warmLateRun = 0;
      if (++warmClean >= 3) { warmBackoff = 0; warmClean = 0; }
      return false;
    }
    warmLateCount++; warmLateRun++; warmClean = 0;
    warmBackoff = warmBackoff ? Math.min(8000, warmBackoff * 2) : 1000;
    warmUntil = performance.now() + warmBackoff;
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
      /* later: a level, true counting as 1; a later step is never near (v3.7, v3.8) */
      const later = o.later === true ? 1 : Math.max(0, Math.floor(+o.later || 0));
      const st = { id: ++warmSeq, owner: String(o.owner || 'page'), name: String(o.name || 'step'), run: o.run, near: !!o.near && !later,
        later: later, light: !!o.light, cpu: !!o.cpu, until: o.until, onLate: o.onLate };
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
        waiting: warmQ.length && !warmBusy ? warmWhy : '', later: warmQ.filter((st) => st.later && mine(st)).length };
    },
    log: warmLog
  };
})();
