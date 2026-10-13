/* O55 · switch motion (no pills, NP-SWITCH). Clicking a switch makes Settings draw its row again, so the switch that shows
   the new state is a new element and its transition never runs: the old capsule snapped too. This bridge records the
   clicked switch (what it is, where it was and the state it left) and, when its redrawn copy appears, holds that copy for
   one frame in the state it came from (class pm-switch-from, styles.d/92-switch-motion.css). Then the key slides and the
   colour wipes as drawn, and Reduced Motion's fade runs too. A switch updated in place runs its own transition and is
   left alone; nothing is watched once the redrawn switch is found or 800 ms have passed. The clicked switch is recorded
   on the way down (capture) and its copy is looked for on the way back up and on every change after it. */
(function o55SwitchMotion() {
  const SEL = '#panel-settings .toggle[role="switch"]';
  const SKIP = /^data-(pm-hover|pm51-disabled|disabled-reason)/;
  const key = (el) => {
    const parts = [el.getAttribute('data-action') || '', el.getAttribute('aria-label') || ''];
    for (const at of el.attributes) if (at.name.startsWith('data-') && at.name !== 'data-action' && !SKIP.test(at.name)) parts.push(at.name + '=' + at.value);
    return parts.join('|');
  };
  let pending = null, watcher = null, timer = 0;
  const stop = () => { if (watcher) watcher.disconnect(); watcher = null; pending = null; clearTimeout(timer); };
  const settle = () => {
    if (!pending || pending.node.isConnected) return;
    const { k, was, x, y } = pending;
    let best = null, dist = Infinity;
    for (const t of document.querySelectorAll(SEL)) {
      if (key(t) !== k) continue;
      const r = t.getBoundingClientRect(), d = Math.hypot(r.x - x, r.y - y);
      if (d < dist) { dist = d; best = t; }
    }
    if (!best) return;
    stop();
    if ((best.getAttribute('aria-checked') === 'true') === was) return;
    best.classList.add('pm-switch-from');
    requestAnimationFrame(() => requestAnimationFrame(() => best.classList.remove('pm-switch-from')));
  };
  document.addEventListener('click', (e) => {
    const t = e.target && e.target.closest ? e.target.closest(SEL) : null;
    if (!t || t.getAttribute('aria-disabled') === 'true') return;
    stop();
    const r = t.getBoundingClientRect();
    pending = { node: t, k: key(t), was: t.getAttribute('aria-checked') === 'true', x: r.x, y: r.y };
    watcher = new MutationObserver(settle);
    watcher.observe(document.getElementById('panel-settings') || document.body, { childList: true, subtree: true });
    timer = setTimeout(stop, 800);
  }, true);
  /* Most rows are drawn again inside the click itself: settle as the click leaves, before anything is painted. The
     watcher above catches a row that is drawn later. */
  document.addEventListener('click', settle);
})();
