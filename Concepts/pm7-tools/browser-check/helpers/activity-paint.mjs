// Runs inside the app's own frame. Element Timing records paint time on the
// performance clock; observer delivery time is diagnostic and never the deadline.
export function installActivityPaintProbe() {
 window.__activityPaintResult = null;
 window.__activityPaintInput = null;
 window.__activityPaintObserver?.disconnect();
 if (!PerformanceObserver.supportedEntryTypes.includes('element')) {
  window.__activityPaintResult = {error:'Element Timing is unavailable'};
  return;
 }
 const entries = [];
 const resolve = () => {
  const input = window.__activityPaintInput;
  if (!input || window.__activityPaintResult) return;
  const first = entries.filter(e => e.renderTime >= input.timeStamp).sort((a,b) => a.renderTime-b.renderTime)[0];
  if (!first) return;
  window.__activityPaintResult = {
   input, ...first,
   elapsed: first.renderTime-input.timeStamp,
   deliveredAt: performance.now()
  };
 };
 const observer = new PerformanceObserver(list => {
  for (const entry of list.getEntries()) {
   if (entry.identifier !== 'pm-activity-cover-title' || entry.renderTime <= 0 ||
       entry.intersectionRect.width <= 0 || entry.intersectionRect.height <= 0) continue;
   entries.push({renderTime:entry.renderTime, identifier:entry.identifier,
    name:entry.name, rect:entry.intersectionRect.toJSON()});
  }
  resolve();
 });
 observer.observe({type:'element',buffered:true});
 window.__activityPaintObserver = observer;
 const onClick = event => {
  const button = event.target.closest?.('[data-action="open-activity"]');
  if (!event.isTrusted || !button) return;
  window.__activityPaintInput = {timeStamp:event.timeStamp,
   wall:performance.timeOrigin+event.timeStamp, receivedAt:performance.now(),
   domain:button.dataset.domain, trusted:event.isTrusted};
  window.removeEventListener('click',onClick,true);
  resolve();
 };
 window.addEventListener('click',onClick,true);
}
