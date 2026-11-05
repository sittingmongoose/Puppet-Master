// Used by the compositor-frame clock; no renderer callback measures paint.
export function installActivityInputProbe(){
 window.__activityPaintInput=null;
 const capture=event=>{
  const button=event.target.closest?.('[data-action="open-activity"]');
  if(!event.isTrusted||!button)return;
  window.__activityPaintInput={timeStamp:event.timeStamp,wall:performance.timeOrigin+event.timeStamp,
   receivedAt:performance.now(),domain:button.dataset.domain,trusted:event.isTrusted};
  window.removeEventListener('click',capture,true);
 };
 window.addEventListener('click',capture,true);
}
