// Observer-only evidence: no product methods, styles or geometry are changed/read.
export const installUsageLiveWatch = () => {
 if (window.__stillUsageLive) return;
 const state = window.__stillUsageLive = { active: false, records: [], sequence: 0, error: null };
 state.observer = new MutationObserver((records) => {
  if (!state.active) return;
  try {
   const writes = [];
   for (const r of records) {
    const el = r.target.nodeType === 1 ? r.target : r.target.parentElement;
    if (!el?.closest) continue;
    const board = el.closest('#pmuBoard'), control = el.closest('#pmuLiveCtl');
    const part = el.closest('[data-pmu-chart], [data-shown], .pmu-cardbody');
    if (!control && !(board && part)) continue;
    if (r.type === 'attributes' && !['d','points','cx','cy','r','x','y','x1','x2','y1','y2','width','height','transform','style','data-shown'].includes(r.attributeName)) continue;
    // In particular, data-pm-held and hover class changes are never live-write evidence.
    const card = el.closest('.pmu-card');
    writes.push({ type: r.type, attribute: r.attributeName || null, tag: el.tagName,
     id: el.id || '', classes: el.getAttribute('class') || '', widget: card?.getAttribute('data-widget') || '',
     oldValue: r.oldValue?.slice(0,160) || null,
     value: (r.type === 'attributes' ? el.getAttribute(r.attributeName) : el.textContent)?.slice(0,160) || '' });
   }
   if (!writes.length) return;
   const mark = `pm-still:live:${state.sequence++}`;
   performance.mark(mark);
   state.records.push({ mark, writes });
  } catch (e) { state.error = String(e); }
 });
 state.observer.observe(document.documentElement, { subtree: true, attributes: true, attributeOldValue: true, childList: true, characterData: true, characterDataOldValue: true });
};

// Keep exact native trace timestamps: an observer batch after the recalc cannot excuse that recalc.
export function usageWritesBeforeRecalc(markTs, recalcTs, marks, batches) {
 if (!Number.isFinite(markTs) || !Number.isFinite(recalcTs)) return [];
 return batches.flatMap((batch) => {
  const ts = marks[batch.mark];
  return Number.isFinite(ts) && ts >= markTs && ts <= recalcTs && Array.isArray(batch.writes) && batch.writes.length ? [{ ts, mark: batch.mark, writes: batch.writes }] : [];
 });
}
