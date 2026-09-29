/* Pure calendar arithmetic consumed by the existing Scheduling owner.
 * No schedule records, timers, dispatch, or status writer live here.
 * Host Intl timezone data is used; this is not a bundled timezone database. */
(function(root){
'use strict';
const minute=60000,day=86400000,formatters=new Map();
function formatter(zone){if(typeof zone!=='string'||!/^[A-Za-z][A-Za-z0-9_+./-]*$/.test(zone))return null;try{if(!formatters.has(zone))formatters.set(zone,new Intl.DateTimeFormat('en-GB',{timeZone:zone,year:'numeric',month:'2-digit',day:'2-digit',hour:'2-digit',minute:'2-digit',second:'2-digit',hourCycle:'h23'}));return formatters.get(zone);}catch(e){return null;}}
function parts(zone,at){const f=formatter(zone);if(!f||!Number.isFinite(at))return null;const p={};for(const x of f.formatToParts(new Date(at)))if(x.type!=='literal')p[x.type]=Number(x.value);return {y:p.year,mo:p.month,d:p.day,h:p.hour===24?0:p.hour,mi:p.minute,s:p.second};}
const wall=p=>Date.UTC(p.y,p.mo-1,p.d,p.h,p.mi,p.s||0);
function valid(p){if(!p||![p.y,p.mo,p.d,p.h,p.mi].every(Number.isSafeInteger)||p.y<1900||p.y>9998||p.h<0||p.h>23||p.mi<0||p.mi>59)return false;const d=new Date(Date.UTC(p.y,p.mo-1,p.d));return d.getUTCFullYear()===p.y&&d.getUTCMonth()+1===p.mo&&d.getUTCDate()===p.d;}
function parse(date,time){const a=/^(\d{4})-(\d{2})-(\d{2})$/.exec(date||''),b=/^(\d{2}):(\d{2})$/.exec(time||'');const p=a&&b?{y:+a[1],mo:+a[2],d:+a[3],h:+b[1],mi:+b[2]}:null;return valid(p)?p:null;}
function resolve(zone,p){
 if(!formatter(zone))return {ok:false,error:'invalid_timezone'};
 if(!valid(p))return {ok:false,error:'invalid_local_time'};
 const target=wall(p),offsets=new Set(),samples=[];
 for(let t=target-3*day;t<=target+3*day;t+=6*3600000){const off=wall(parts(zone,t))-t;offsets.add(off);samples.push([t,off]);}
 const hits=[...offsets].map(o=>target-o).filter(t=>wall(parts(zone,t))===target).sort((a,b)=>a-b);
 if(hits.length)return {ok:true,at:hits[0],kind:hits.length>1?'fold_first':'exact',occurrences:hits.length,requested:p,effective:parts(zone,hits[0])};
 // A gap resolves at the first valid instant AFTER the gap, not requested
 // minute plus a guessed hour. Also handles non-hour jumps and skipped dates.
 for(let i=1;i<samples.length;i++){
  let [hi,after]=samples[i],[lo,before]=samples[i-1];if(after<=before)continue;
  while(hi-lo>minute){const mid=Math.floor((lo+hi)/2/minute)*minute;if(wall(parts(zone,mid))-mid===before)lo=mid;else hi=mid;}
  const edge=Math.ceil(hi/minute)*minute,left=wall(parts(zone,edge-minute))+minute,right=wall(parts(zone,edge));
  if(left<=target&&target<right)return {ok:true,at:edge,kind:'gap_forward',occurrences:0,requested:p,effective:parts(zone,edge)};
 }
 return {ok:false,error:'local_time_unresolvable'};
}
function shift(p,n){const d=new Date(Date.UTC(p.y,p.mo-1,p.d+n,12));return {...p,y:d.getUTCFullYear(),mo:d.getUTCMonth()+1,d:d.getUTCDate()};}
const weekday=p=>new Date(Date.UTC(p.y,p.mo-1,p.d,12)).getUTCDay();
function next(zone,days,hh,mi,after){
 if(!Array.isArray(days)||!days.length||days.some(d=>!Number.isInteger(d)||d<0||d>6))return null;
 const p=parts(zone,after);if(!p)return null;
 for(let n=0;n<=8;n++){const d={...shift(p,n),h:hh,mi,s:0};if(!days.includes(weekday(d)))continue;const r=resolve(zone,d);if(r.ok&&r.at>after)return r.at;}
 return null;
}
function windowAt(rec,at){
 const p=parts(rec.timezone,at),start=parse('2000-01-01',rec.local_start),end=parse('2000-01-01',rec.local_pause);
 if(!p||!start||!end||!Array.isArray(rec.days_of_week))return {ok:false,error:'invalid_window'};
 const wraps=end.h*60+end.mi<=start.h*60+start.mi;
 for(let n=-1;n<=0;n++){
  const d=shift(p,n);if(!rec.days_of_week.includes(weekday(d)))continue;
  const a=resolve(rec.timezone,{...d,h:start.h,mi:start.mi,s:0}),z=resolve(rec.timezone,{...shift(d,wraps?1:0),h:end.h,mi:end.mi,s:0});
  if(!a.ok||!z.ok||z.at<=a.at)continue;
  if(at>=a.at&&at<z.at){const wind=Math.max(a.at,z.at-Math.max(0,Number(rec.wind_down_seconds)||0)*1000);return {ok:true,open:true,phase:at>=wind?'winding_down':'open',start:a.at,end:z.at,wind_down_at:wind,resolution:a.kind,pause_resolution:z.kind};}
 }
 return {ok:true,open:false,phase:'closed',next:next(rec.timezone,rec.days_of_week,start.h,start.mi,at)};
}
/* Clock changes (the describeDst real-checkpoint fix). transitions(zone, from, to) lists every offset change
   between two instants, located to the minute: at = the first instant on the new offset, shift = minutes the wall
   clock moves (+60 forward, -60 back), fromMin / toMin = the wall minute of day it moves from and to, date = the
   local date it happens on. impact(change, slot) says whether a slot meets that change: slot is
   {kind:'recurring', start:'22:00', stop:'02:00', days:[1..5], windDownMinutes} or {kind:'once', date, time};
   it returns null, or {hits:[{name:'start'|'stop'|'wrapup', minute}], spans} where a hit is a checkpoint inside
   the skipped (forward) or repeated (back) wall span and spans means the change happens while the slot runs.
   Pure arithmetic; the sentences are the Scheduling owner's. */
function offsetAt(zone,t){const p=parts(zone,t);return p?Math.round((wall(p)-t)/minute)*minute:null;}
function transitions(zone,from,to){
 if(!formatter(zone)||!Number.isFinite(from)||!Number.isFinite(to)||to<=from)return [];
 const out=[];let prev=offsetAt(zone,from),t=from;
 while(t<to){
  const n=Math.min(t+day,to),off=offsetAt(zone,n);
  if(off!==prev&&off!=null&&prev!=null){
   let lo=Math.floor(t/minute),hi=Math.ceil(n/minute);
   while(hi-lo>1){const mid=Math.floor((lo+hi)/2);if(offsetAt(zone,mid*minute)===prev)lo=mid;else hi=mid;}
   const at=hi*minute,after=parts(zone,at),shiftMin=Math.round((off-prev)/minute),toMin=after.h*60+after.mi;
   out.push({at,kind:shiftMin>0?'spring_forward':'fall_back',shift:shiftMin,toMin,fromMin:toMin-shiftMin,date:{y:after.y,mo:after.mo,d:after.d}});
  }
  prev=off;t=n;
 }
 return out;
}
const minuteOf=s=>{const p=parse('2000-01-01',s);return p?p.h*60+p.mi:null;};
function impact(change,slot){
 if(!change||!slot)return null;
 const D=change.date,wd=weekday(D),prevWd=(wd+6)%7;
 const lo=Math.min(change.fromMin,change.toMin),hi=Math.max(change.fromMin,change.toMin);
 const hits=[],inSpan=m=>m>=lo&&m<hi;
 if(slot.kind==='once'){
  const p=parse(slot.date,slot.time);
  if(!p||p.y!==D.y||p.mo!==D.mo||p.d!==D.d)return null;
  const m=p.h*60+p.mi;if(inSpan(m))hits.push({name:'start',minute:m});
  return hits.length?{hits,spans:false}:null;
 }
 const S=minuteOf(slot.start),E=minuteOf(slot.stop);
 if(S==null||E==null||!Array.isArray(slot.days)||S===E)return null;
 const on=x=>slot.days.includes(x),wrap=E<S,W=E-Math.max(0,Number(slot.windDownMinutes)||0);
 const stopHere=wrap?on(prevWd):on(wd);
 if(on(wd)&&inSpan(S))hits.push({name:'start',minute:S});
 if(stopHere&&inSpan(E))hits.push({name:'stop',minute:E});
 if(stopHere&&W>=0&&W!==E&&inSpan(W))hits.push({name:'wrapup',minute:W});
 const runs=[];if(wrap){if(on(prevWd))runs.push([0,E]);if(on(wd))runs.push([S,1440]);}else if(on(wd))runs.push([S,E]);
 const spans=runs.some(r=>change.fromMin>r[0]&&change.fromMin<r[1]);
 return hits.length||spans?{hits,spans}:null;
}
const api=Object.freeze({parts,parse,resolve,next,windowAt,shift,weekday,transitions,impact});
root.PM56_SCHEDULE_TIME=api;if(typeof module!=='undefined')module.exports=api;
})(typeof window==='undefined'?globalThis:window);
