/* Completion for finite CSS motion. End events retain their original timing;
   disabled motion completes next frame, cancellation immediately, and a lost
   event has a computed-duration deadline. A new wait retires the previous wait. */
(function () {
  var waits = new WeakMap();
  window.PM7_MOTION_FINISH = function (el, kind, name, done, endHold) {
    var key = kind + ':' + name, active = waits.get(el);
    if (!active) { active = new Map(); waits.set(el, active); }
    if (active.has(key)) active.get(key)();
    var ended = false, eventEnded = false, frame = 0, timer = 0, hold = 0;
    var end = kind + 'end', cancel = kind + 'cancel';
    function stop() {
      if (ended) return;
      ended = true;
      cancelAnimationFrame(frame); clearTimeout(timer); clearTimeout(hold);
      el.removeEventListener(end, onEnd); el.removeEventListener(cancel, onCancel);
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
      el.removeEventListener(end, onEnd); el.removeEventListener(cancel, onCancel);
      if (endHold) hold = setTimeout(finish, endHold); else finish();
    }
    function onCancel(ev) { if (matches(ev)) finish(); }
    function ms(value) {
      return (parseFloat(value) || 0) * (value.trim().endsWith('ms') ? 1 : 1000);
    }
    active.set(key, stop);
    el.addEventListener(end, onEnd); el.addEventListener(cancel, onCancel);
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
        if (d <= 0) return;
        var count = parseFloat(iterations[i % iterations.length]);
        if (!Number.isFinite(count)) count = 1;
        duration = Math.max(duration, d * count + ms(delays[i % delays.length]));
      });
      if (duration <= 0) { finish(); return; }
      // A zero-duration animation may dispatch its end before this frame.
      // Keep this check alive through an end hold; running motion keeps the
      // original end-event deadline, without starting another safety timer.
      if (eventEnded) return;
      timer = setTimeout(finish, duration + (endHold || 0) + 100);
    });
    return stop;
  };
})();
