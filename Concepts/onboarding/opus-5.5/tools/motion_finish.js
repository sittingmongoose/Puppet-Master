/* Completion for finite CSS motion. End events retain their original timing;
   disabled motion completes next frame, cancellation immediately, and a lost
   event has a computed-duration deadline. A new wait retires the previous wait. */
(function () {
  var waits = new WeakMap();
  window.PM7_MOTION_FINISH = function (el, kind, name, done, endHold) {
    var key = kind + ':' + name, active = waits.get(el);
    if (!active) { active = new Map(); waits.set(el, active); }
    if (active.has(key)) active.get(key)();
    var ended = false, eventEnded = false, frame = 0, deadlineFrame = 0, timer = 0, hold = 0, budget = 0;
    var end = kind + 'end', cancel = kind + 'cancel', start = kind + 'start';
    function stop() {
      if (ended) return;
      ended = true;
      cancelAnimationFrame(frame); cancelAnimationFrame(deadlineFrame); clearTimeout(timer); clearTimeout(hold);
      el.removeEventListener(end, onEnd); el.removeEventListener(cancel, onCancel); el.removeEventListener(start, onStart);
      if (active.get(key) === stop) active.delete(key);
    }
    function finish() { if (ended) return; stop(); done(el); }
    function matches(ev) {
      return ev.target === el && !ev.pseudoElement &&
        (kind === 'animation' ? ev.animationName === name : ev.propertyName === name);
    }
    function onEnd(ev) {
      if (!matches(ev)) return;
      clearTimeout(timer); eventEnded = true;
      el.removeEventListener(end, onEnd); el.removeEventListener(cancel, onCancel); el.removeEventListener(start, onStart);
      if (endHold) hold = setTimeout(finish, endHold); else finish();
    }
    function onCancel(ev) { if (matches(ev)) finish(); }
    function motionState() {
      var state = { remaining: 0, pending: false, motions: [] };
      if (!el.getAnimations) return state;
      el.getAnimations().forEach(function (motion) {
        if (!motion.effect || motion.effect.target !== el ||
            (kind === 'animation' ? motion.animationName !== name : motion.transitionProperty !== name)) return;
        var timing = motion.effect.getComputedTiming();
        if (!Number.isFinite(timing.endTime)) return;
        state.motions.push(motion);
        if (motion.pending) state.pending = true;
        // A play still pending runs from where it stands too: a move PM_START_ON_SHOWN released waits a frame or two
        // for its start, and counted as none then, a deadline landing there finished the page-in as it began (the
        // P1000's Usage entry, F6: the page shown at once, no fade).
        if (motion.playState === 'running' && motion.playbackRate > 0 && motion.currentTime !== null) {
          state.remaining = Math.max(state.remaining, (timing.endTime - motion.currentTime) / motion.playbackRate);
        } else if (motion.__pmHeld && motion.playState === 'paused') {
          // Held at its start until frames come on time (PM_START_ON_SHOWN, at most 6 frames): still to run, so
          // the deadline waits for it rather than ending the motion it would then cancel.
          state.remaining = Math.max(state.remaining, timing.endTime - (motion.currentTime || 0));
        }
      });
      return state;
    }
    function armDeadline(remaining, margin) {
      if (ended || eventEnded) return;
      clearTimeout(timer); cancelAnimationFrame(deadlineFrame);
      timer = setTimeout(function () {
        if (document.hidden) { finish(); return; }
        // Native events precede rAF. A pending CSS play can start well after
        // the first style read, so its own finite timeline also gets priority.
        deadlineFrame = requestAnimationFrame(function () {
          deadlineFrame = 0;
          if (ended || eventEnded) return;
          var state = motionState();
          if (state.remaining > 0) { armDeadline(state.remaining); return; }
          finish();
        });
      }, Math.max(0, remaining) + (endHold || 0) + (margin || 100));
    }
    function onStart(ev) {
      if (!matches(ev) || !budget) return;
      var state = motionState();
      armDeadline(state.motions.length ? state.remaining : budget);
    }
    function ms(value) {
      return (parseFloat(value) || 0) * (value.trim().endsWith('ms') ? 1 : 1000);
    }
    active.set(key, stop);
    el.addEventListener(end, onEnd); el.addEventListener(cancel, onCancel); el.addEventListener(start, onStart);
    frame = requestAnimationFrame(function () {
      if (ended) return;
      var css = getComputedStyle(el), animation = kind === 'animation';
      var names = (animation ? css.animationName : css.transitionProperty).split(',').map(function (s) { return s.trim(); });
      var durations = (animation ? css.animationDuration : css.transitionDuration).split(',');
      var delays = (animation ? css.animationDelay : css.transitionDelay).split(',');
      var iterations = animation ? css.animationIterationCount.split(',') : ['1'];
      var duration = 0;
      names.forEach(function (n, i) {
        if (n === 'none' || (n !== name && (animation || n !== 'all'))) return;
        var d = ms(durations[i % durations.length]);
        var count = parseFloat(iterations[i % iterations.length]);
        // Infinite loops are decoration, not finite entrance work. A finite
        // zero-duration entry can still be pending through a positive delay.
        if (!Number.isFinite(count)) return;
        duration = Math.max(duration, d * count + ms(delays[i % delays.length]));
      });
      if (duration <= 0) { finish(); return; }
      // A zero-duration animation may dispatch its end before this frame.
      // Keep this check alive through an end hold; running motion keeps the
      // original end-event deadline, without starting another safety timer.
      if (eventEnded) return;
      budget = duration;
      var state = motionState();
      // Bound a genuinely missing start too, while allowing a slow first
      // layout to commit the CSS animation's pending play. Once it starts,
      // use its remaining native time rather than the registration clock.
      armDeadline(state.remaining || budget, state.pending ? 1000 : 100);
      state.motions.forEach(function (motion) {
        motion.ready.then(function () {
          var live = motionState();
          armDeadline(live.remaining);
        }, function () {});
      });
    });
    return stop;
  };
  // Retire a previous FLIP wait before its replacement changes styles. Its
  // cancellation event must not clean the replacement's initial geometry.
  window.PM7_MOTION_FINISH.cancel = function (el, kind, name) {
    var active = waits.get(el), stop = active && active.get(kind + ':' + name);
    if (stop) stop();
  };
})();
