// Freeze the document animation clock through DevTools, leaving each animation's CSS/WAAPI play state alone.
// Script pause/play would permanently override CSS animation-play-state on Chrome 157. The input still changes
// selectors and creates transitions at their initial time, so their first style recalc remains in the trace.
export async function withAnimationHold(cdp, frame, during) {
 await cdp.send('Animation.enable');
 try {
  const { playbackRate } = await cdp.send('Animation.getPlaybackRate');
  if (playbackRate !== 1) throw new Error(`expected normal animation clock before hold, got ${playbackRate}`);
  await cdp.send('Animation.setPlaybackRate', { playbackRate: 0 });
  // Flush the clock change before the input trace; this is outside the measured window.
  await frame.waitForTimeout(80);
  return await during();
 } finally {
  try { await cdp.send('Animation.setPlaybackRate', { playbackRate: 1 }); }
  finally { await cdp.send('Animation.disable'); }
 }
}
