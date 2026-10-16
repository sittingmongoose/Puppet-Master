/* A stage's CSS entrance can spend several frames pending at opacity 0 while Chrome prepares its layers. Keep the
   outgoing stage underneath it until that entrance finishes. The existing entrance still owns its duration,
   easing and movement (including Reduced Motion); its actual ready/start time also drives the outgoing fade. */
/* The page's own exit (.pm8-page-out) paints the page that was on screen while the next page enters over it. A stage
   switch made then (Orchestrator's first entry backfills the demo story, and the Wizard resyncs into its workspace)
   must not paint during that exit: the stage that was on screen stays drawn (.wo-stage-hold) and the stage switched
   to stays undisplayed (.wo-stage-defer) until the exit has finished. The page exit then fades only what was on
   screen before the click, and its centre never goes empty under the arriving page. */
(function () {
  'use strict';
  function boot() {
    const root = document.getElementById('panel-wizard');
    if (!root) return;
    const stages = [...root.querySelectorAll('.pm6-wiz-stage')];
    let current = stages.find(s => s.classList.contains('active'));
    let pageShown = root.classList.contains('active');
    let serial = 0;
    let watching = null;
    const leaving = new Map();
    const scrollOrigins = new Map();
    const held = new Set(), deferred = new Set();
    const exiting = () => root.classList.contains('pm8-page-out');
    function releaseExit() {
      for (const stage of held) { stage.classList.remove('wo-stage-hold'); stage.inert = !!stage._woWasInert; delete stage._woWasInert; }
      for (const stage of deferred) stage.classList.remove('wo-stage-defer');
      held.clear(); deferred.clear();
    }
    function holdThroughExit(outgoing, incoming) {
      if (held.has(incoming)) {
        // Switched back to the stage still on screen: it is simply the stage again.
        releaseExit();
        return;
      }
      /* the held stage is drawn for the exit only: inert while held, as a stage leaving inside the page is (SH-4) */
      if (!held.size && !deferred.has(outgoing)) { outgoing.classList.add('wo-stage-hold'); outgoing._woWasInert = outgoing.inert; outgoing.inert = true; held.add(outgoing); }
      for (const stage of deferred) if (stage !== incoming) stage.classList.remove('wo-stage-defer');
      deferred.clear();
      incoming.classList.add('wo-stage-defer'); deferred.add(incoming);
    }

    function release(stage) {
      const exit = leaving.get(stage);
      leaving.delete(stage);
      scrollOrigins.delete(stage);
      stage.style.removeProperty('--wo-stage-scroll-offset');
      stage.style.removeProperty('--wo-stage-scroll-top');
      if (exit) exit.cancel();
      if (stage.classList.contains('wo-stage-out')) stage.classList.remove('wo-stage-out');
      if (stage.inert) stage.inert = false;
    }
    function finish(token, incoming) {
      if (token !== serial) return;
      for (const stage of leaving.keys()) release(stage);
      if (incoming && incoming.classList.contains('wo-stage-in')) incoming.classList.remove('wo-stage-in');
      watching = null;
    }
    function watch(entrance, token, incoming) {
      if (watching === entrance) return;
      watching = entrance;
      entrance.ready.then(() => {
        if (token !== serial || current !== incoming || watching !== entrance) return;
        // CSS puts animation-timing-function on each keyframe, not on the effect timing.
        const frames = entrance.effect.getKeyframes().map(f => ({
          opacity: 1 - Number(f.opacity), offset: f.computedOffset, easing: f.easing
        }));
        for (const [stage, previous] of leaving) {
          if (previous) previous.cancel();
          const timing = entrance.effect.getTiming();
          const exit = stage.animate(frames, { ...timing, duration: timing.duration / 2 });
          exit.startTime = entrance.startTime;
          leaving.set(stage, exit);
        }
      }).catch(() => {});
      entrance.finished.then(() => {
        if (watching === entrance) finish(token, incoming);
      }, () => {
        // A motion-mode change replaces the entrance. Keep the old stage until the replacement is ready too.
        requestAnimationFrame(() => {
          if (token !== serial || current !== incoming || watching !== entrance) return;
          if (!incoming.getAnimations().some(a => a instanceof CSSAnimation && a.playState !== 'idle')) {
            finish(token, incoming);
          }
        });
      });
    }
    // Read animation timing only after the browser prepares it, not during the synchronous stage render.
    root.addEventListener('animationstart', event => {
      const incoming = event.target;
      if (incoming !== current || !incoming.classList.contains('wo-stage-in')) return;
      const entrance = incoming.getAnimations().find(a => a.animationName === event.animationName);
      if (entrance) watch(entrance, serial, incoming);
      else finish(serial, incoming);
    });

    // Called BEFORE either stage writer removes .active. Renderers can synchronously measure during that write;
    // an observer would run too late to preserve the outgoing layout and its already-finished CSS entrances.
    function prepare(name) {
      const incoming = stages.find(s => s.dataset.wizStage === name);
      if (!incoming || incoming === current) return;
      const outgoing = current;
      /* Read only while the page is shown. A switch made as the page leaves (Orchestrator's first entry resyncs the
         Wizard) runs after the page write took .active off and before its exit class is on: the page is undisplayed
         for that moment, and a layout read then computed it so, which cancelled every finished entrance in it
         (.pm-enter-up). When the exit showed the page again they all ran again from opacity 0, so the Wizard went
         empty for three frames in the middle of its exit and its cards came back one by one (A3, P1000 films;
         Nas1 invalidation trace: "Removed from layout" from this read). */
      const shown = !!outgoing && pageShown && root.classList.contains('active');
      const scrollTop = shown ? root.scrollTop : 0;
      const reversing = leaving.has(incoming);
      current = incoming;
      const token = ++serial;
      watching = null;
      release(incoming);
      if (!outgoing || !pageShown || !root.classList.contains('active')) {
        // pageShown still reads true when the page was hidden earlier in this task: its exit class is added after the
        // page write that runs this switch (the observer then keeps or drops the hold).
        if (outgoing && (exiting() || pageShown)) holdThroughExit(outgoing, incoming);
        finish(token, incoming);
        return;
      }
      if (outgoing.classList.contains('wo-stage-in')) outgoing.classList.remove('wo-stage-in');
      outgoing.classList.add('wo-stage-out');
      outgoing.inert = true;
      leaving.set(outgoing, null);
      scrollOrigins.set(outgoing, scrollTop);
      incoming.classList.add('wo-stage-in');
      // Clipping the retained stage lets the page clamp to the incoming stage's scroll range. After both
      // writers finish, pin the old contents at their pre-switch position before the browser paints.
      if (scrollTop || scrollOrigins.size > 1) {
        // A previous retained box must not keep a rapid replacement's scroll range alive either.
        for (const stage of scrollOrigins.keys()) stage.style.removeProperty('--wo-stage-scroll-top');
        queueMicrotask(() => {
          if (token !== serial) return;
          const clamped = root.scrollTop;
          for (const [stage, origin] of scrollOrigins) {
            stage.style.setProperty('--wo-stage-scroll-top', clamped + 'px');
            stage.style.setProperty('--wo-stage-scroll-offset', -origin + 'px');
          }
        });
      }
      // Returning to a stage that is still underneath the current one can reuse a completed entrance. That has
      // no new animationstart event, so finish or watch the reused animation on this uncommon reversal path.
      if (reversing) requestAnimationFrame(() => {
        if (token !== serial || current !== incoming) return;
        const entrance = incoming.getAnimations().find(a => a instanceof CSSAnimation);
        if (!entrance || entrance.playState === 'finished') finish(token, incoming);
        else watch(entrance, token, incoming);
      });
    }
    window.PM_WIZARD_STAGES = { prepare };
    const observer = new MutationObserver(() => {
      pageShown = root.classList.contains('active');
      // While the page exit still paints, a stage switch in progress keeps its outgoing stage too.
      if (exiting()) return;
      if (held.size || deferred.size) releaseExit();
      if (!pageShown) finish(serial, current);
    });
    observer.observe(root, { attributes: true, attributeFilter: ['class'] });
  }
  // The authored scripts follow the page markup. Install before the legacy DOMContentLoaded stage writer runs.
  if (!document.getElementById('panel-wizard')) document.addEventListener('DOMContentLoaded', boot);
  else boot();
})();
