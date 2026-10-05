/* Film: open the first visible PMR menu trigger in the active view (chat-style sprout). --param ms=500 */
export default (p) => ({
  ms: Number(p.ms || 500), extra: 120,
  trigger: `(() => { const t = [...document.querySelectorAll('.pmr-view .pmr-trigger')].find(e => e.getBoundingClientRect().height > 2); if (t) t.click(); return !!t; })()`,
});
