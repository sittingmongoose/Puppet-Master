// Diagnostic only. getAnimations() may resolve pending style, so this census is opt-in and follows the toggle mark.
// No animation is paused, played, cancelled or otherwise changed.
export const installToggleFiniteWatch = () => {
 const desc = (el) => el ? `${el.tagName?.toLowerCase() || '?'}${el.id ? '#'+el.id : ''}.${(el.getAttribute?.('class') || '').trim().split(/\s+/).join('.')}` : null;
 window.__stillFiniteAtMark = () => {
  const out = { finite: [], usageFiniteCount: null, lastLiveBeatMs: null, error: null };
  try {
   const now = performance.now(), beat = performance.getEntriesByName('pmu-live-beat').at(-1);
   out.observedAt = now;
   out.lastLiveBeatMs = beat ? now - beat.startTime : null;
   for (const a of document.getAnimations()) {
    if (a.playState !== 'running') continue;
    const timing = a.effect?.getTiming();
    if (!timing || timing.iterations === Infinity) continue;
    const el = a.effect.target, part = a.effect.pseudoElement ? a.effect.pseudoElement.replace(/^::?/, '') : 'self';
    if ((el?.getAttribute?.('data-pm-held') || '').split(' ').includes(part)) continue;
    const inUsage = !!(el?.closest?.('#pmuBoard') || el?.closest?.('#pmuLiveCtl'));
    const usagePart = inUsage ? el.closest('[data-pmu-chart], [data-shown], .pmu-cardbody, .pmu-card, #pmuLiveCtl') : null;
    out.finite.push({ name: a.animationName || a.transitionProperty || a.constructor?.name || '?', target: desc(el), part,
     inUsage, usagePart: desc(usagePart), prewarm: !!el?.closest?.('[data-pmu-prewarm]'),
     currentTime: a.currentTime, startTime: a.startTime, duration: timing.duration, iterations: timing.iterations, pending: !!a.pending });
   }
   out.usageFiniteCount = out.finite.filter((a) => a.inUsage && a.usagePart).length;
  } catch (e) { out.error = String(e); }
  return out;
 };
};
