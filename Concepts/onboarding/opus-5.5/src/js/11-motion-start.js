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
   a page change hands the click's fade over to its exit there (tools/shell_motion.py, ANSWER_FIRST). */
(function () {
  'use strict';
  /* PM_AFTER_LAYOUT(fn): fn runs in the coming frame after its style and layout, before its paint (a ResizeObserver
     delivery), so what it reads is already computed. One observer, made as this script loads, serves every caller:
     ResizeObservers are told in the order they were made, and one made at the moment it was needed was told after the
     page's older observers, some of which write in that same delivery (the Liquid Glass root observer), so the read
     paid a whole-page restyle anyway (Home's notice placement 215 ms, the theme's resize kick 389 ms on the P1000,
     Settings lane trace). Callers queued meanwhile run once, in the order they asked. */
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
      if (gap <= 40 && late <= 40) { onTime++; if (!long || onTime >= 2) { release(); return; } }
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

  /* PM_WARM: the one page-wide queue for idle warm drawing (the lead's IDLE-WARM-RULE.md, 2026-10-17). A lane hands it
     small steps that draw something unseen so the GPU compiles its programs, or rasters a surface, before first use;
     the queue runs one step per idle period across all lanes. On a cold P1000 a step that is small on the main thread
     still blocked the compositor for 100-1,000 ms when it made the GPU compile several programs (part2's F5b idle
     trace), so each step is admitted only when the page is still and is judged by the frames presented after it:
       admission: PM_BUSY() empty, no input for 600 ms, the page visible, no finite animation or transition running
         (ambient infinite loops excepted), no input pending, and any back-off run out;
       after a step: the next two rAF intervals; late is over max(40 ms, 3x the median refresh). A late step is told to
         its owner (onLate); unless the owner handles it (onLate returns true) it goes to the end of its owner's line
         once, and a step late twice is dropped. Back-off starts at 1 s and doubles to 8 s; 3 clean steps reset it.
         3 late steps in a row stop the queue until the next 'pm-idle' or 30 s.
       fairness: near steps first, then round-robin across owners, FIFO within an owner.
       off: ?pm-warm=0, and the no-GPU profile (O55.motion.softwareRendered()).
     add({ owner, name, run, near, onLate }) -> id. run() draws one kind, synchronously; it may return a function that
     the queue calls in the first frame after the step's frame (to hide what it showed). cancel(id), cancelOwner(owner),
     state(owner?), window.__pmWarmLog (the last 200 steps), and 'pm-warm-done' on window when the queue empties */
  const warmOff = (() => { try { return /(?:^|[?&])pm-warm=0(?:&|$)/.test(location.search); } catch (_) { return false; } })();
  /* ?pm-warm=force runs it on the no-GPU profile too, for checks on a software-rendered machine */
  const warmForce = (() => { try { return /(?:^|[?&])pm-warm=force(?:&|$)/.test(location.search); } catch (_) { return false; } })();
  let warmSoft = warmForce ? false : null;
  const isSoft = () => {
    if (warmSoft === null) { try { const M = window.O55 && window.O55.motion; warmSoft = !!(M && typeof M.softwareRendered === 'function' && M.softwareRendered()); } catch (_) { warmSoft = false; } }
    return warmSoft;
  };
  const warmQ = [], warmLog = window.__pmWarmLog = [], warmDropped = [];
  let warmSeq = 0, warmLastOwner = '', warmTimer = 0, warmRunning = null, warmBackoff = 0, warmUntil = 0, warmClean = 0, warmLateRun = 0,
    warmStopped = false, warmStopTimer = 0, warmLateCount = 0, warmInput = 0;
  const intervals = [];
  ['pointermove', 'pointerdown', 'keydown', 'wheel', 'touchstart'].forEach((t) => window.addEventListener(t, () => { warmInput = performance.now(); }, { capture: true, passive: true }));
  const refresh = () => {
    if (intervals.length < 5) return 16.7;
    const s = intervals.slice().sort((a, b) => a - b);
    return s[Math.floor(s.length / 2)];
  };
  const animating = () => {
    try {
      const all = document.getAnimations ? document.getAnimations() : [];
      for (let i = 0; i < all.length; i++) {
        const a = all[i];
        if (a.playState !== 'running') continue;
        const t = a.effect && a.effect.getTiming ? a.effect.getTiming() : null;
        if (t && t.iterations !== Infinity) return true;
      }
    } catch (_) { /* none */ }
    return false;
  };
  const admit = () => {
    if (document.hidden || window.PM_BUSY()) return false;
    if (performance.now() - warmInput < 600 || performance.now() < warmUntil) return false;
    try { if (navigator.scheduling && navigator.scheduling.isInputPending && navigator.scheduling.isInputPending()) return false; } catch (_) { /* none */ }
    return !animating();
  };
  const pick = () => {
    for (let i = 0; i < warmQ.length; i++) if (warmQ[i].near) return i;
    const owners = [];
    warmQ.forEach((st) => { if (owners.indexOf(st.owner) < 0) owners.push(st.owner); });
    if (!owners.length) return -1;
    const next = owners[(owners.indexOf(warmLastOwner) + 1) % owners.length] || owners[0];
    for (let i = 0; i < warmQ.length; i++) if (warmQ[i].owner === next) return i;
    return 0;
  };
  const logStep = (st, cpuMs, frameMs, late, outcome) => {
    warmLog.push({ owner: st.owner, name: st.name, t: Math.round(performance.now()), cpuMs: Math.round(cpuMs * 10) / 10, frameMs: frameMs, late: late, outcome: outcome });
    if (warmLog.length > 200) warmLog.shift();
  };
  const schedule = (ms) => {
    if (warmTimer || warmRunning || warmStopped || warmOff || !warmQ.length) return;
    warmTimer = setTimeout(() => {
      warmTimer = 0;
      const go = () => { if (!warmRunning) step(); };
      if (window.requestIdleCallback) requestIdleCallback((d) => { if (d && !d.didTimeout && d.timeRemaining() < 8) { schedule(100); return; } go(); }, { timeout: 2000 });
      else go();
    }, Math.max(0, ms || 0));
  };
  const step = () => {
    if (warmStopped || !warmQ.length) return;
    if (!admit()) { schedule(400); return; }
    /* the last frames before it on time too: one interval measured right before the step */
    requestAnimationFrame((t0) => requestAnimationFrame((t1) => {
      intervals.push(t1 - t0); if (intervals.length > 30) intervals.shift();
      const limit = Math.max(40, 3 * refresh());
      if (t1 - t0 > limit || !admit()) { schedule(400); return; }
      const i = pick(); if (i < 0) return;
      const st = warmQ.splice(i, 1)[0];
      warmRunning = st; warmLastOwner = st.owner;
      let cleanup = null, c0 = performance.now();
      try { cleanup = st.run(); } catch (e) { try { console.error('[PM_WARM] ' + st.owner + ':' + st.name, e); } catch (_) { /* none */ } }
      const cpu = performance.now() - c0;
      requestAnimationFrame((a) => {
        if (typeof cleanup === 'function') { try { cleanup(); } catch (_) { /* none */ } }
        requestAnimationFrame((b) => requestAnimationFrame((c) => {
          const d1 = Math.round(b - a), d2 = Math.round(c - b), late = Math.max(d1, d2) > limit;
          warmRunning = null;
          if (late) {
            warmLateCount++; warmLateRun++; warmClean = 0;
            warmBackoff = warmBackoff ? Math.min(8000, warmBackoff * 2) : 1000;
            warmUntil = performance.now() + warmBackoff;
            let handled = false;
            if (typeof st.onLate === 'function') { try { handled = st.onLate(st) === true; } catch (_) { /* none */ } }
            if (!handled) {
              st.lates = (st.lates || 0) + 1;
              if (st.lates >= 2) { warmDropped.push(st.owner + ':' + st.name); logStep(st, cpu, [d1, d2], true, 'dropped'); }
              else { warmQ.push(st); logStep(st, cpu, [d1, d2], true, 'late'); }
            } else logStep(st, cpu, [d1, d2], true, 'late-handled');
            if (warmLateRun >= 3) {
              warmStopped = true;
              const resume = () => { if (!warmStopped) return; warmStopped = false; warmLateRun = 0; clearTimeout(warmStopTimer); window.removeEventListener('pm-idle', resume); schedule(0); };
              window.addEventListener('pm-idle', resume);
              warmStopTimer = setTimeout(resume, 30000);
              return;
            }
          } else {
            logStep(st, cpu, [d1, d2], false, 'ran');
            warmLateRun = 0;
            if (++warmClean >= 3) { warmBackoff = 0; warmClean = 0; }
          }
          if (!warmQ.length) { try { window.dispatchEvent(new Event('pm-warm-done')); } catch (_) { /* none */ } return; }
          schedule(warmBackoff ? Math.max(0, warmUntil - performance.now()) : 0);
        }));
      });
    }));
  };
  window.PM_WARM = {
    add(o) {
      if (!o || typeof o.run !== 'function') return 0;
      const st = { id: ++warmSeq, owner: String(o.owner || 'page'), name: String(o.name || 'step'), run: o.run, near: !!o.near, onLate: o.onLate };
      if (warmOff || isSoft()) { logStep(st, 0, [0, 0], false, 'skipped'); return st.id; }
      warmQ.push(st); schedule(0);
      return st.id;
    },
    cancel(id) { for (let i = warmQ.length - 1; i >= 0; i--) if (warmQ[i].id === id) warmQ.splice(i, 1); },
    cancelOwner(owner) { for (let i = warmQ.length - 1; i >= 0; i--) if (warmQ[i].owner === owner) warmQ.splice(i, 1); },
    state(owner) {
      const mine = (st) => !owner || st.owner === owner;
      return { queued: warmQ.filter(mine).length, running: warmRunning && mine(warmRunning) ? warmRunning.owner + ':' + warmRunning.name : null, backoffMs: warmBackoff,
        stopped: warmStopped, off: warmOff || !!warmSoft, dropped: warmDropped.filter((d) => !owner || d.indexOf(owner + ':') === 0), lateCount: warmLateCount };
    }
  };
})();
