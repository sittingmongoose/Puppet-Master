/* Shared synchronous concept command transaction.
 * Owners remain the sole writers. This journal makes their related writes
 * all-or-none and defers timers/storage/UI effects until admission commits.
 * It is not a native storage transaction or Event Authority implementation.
 */
(function(){
 'use strict';
 let active=null;
 const own=(o,k)=>Object.prototype.hasOwnProperty.call(o,k);
 const fingerprint=x=>x===undefined?'undefined':JSON.stringify(x);
 function set(o,k,value){
  if(active){active.writes.push({o,k,had:own(o,k),before:o[k],after:value,fp:fingerprint(value)});}
  o[k]=value;return value;
 }
 function remove(o,k){
  if(!own(o,k))return;
  if(active)active.writes.push({o,k,had:true,before:o[k],removed:true});
  delete o[k];
 }
 function append(o,k,value){
  if(!Array.isArray(o[k]))throw new Error('transaction_array_required');
  if(active)active.writes.push({o,k,appended:true,value,fp:fingerprint(value)});
  o[k].push(value);return value;
 }
 function defer(fn){if(active)active.effects.push(fn);else fn();}
 function fail(code){const e=new Error(code);e.code=code;throw e;}
 function run(fn){
  if(active)return fn();
  const tx={writes:[],effects:[]};active=tx;let out;
  try{out=fn();if(out?.ok===false)fail(out.error||out.clause||'admission_refused');}
  catch(e){
   const conflicts=[];
   for(const w of tx.writes.slice().reverse()){
    if(w.appended){
      const array=w.o[w.k],i=Array.isArray(array)?array.indexOf(w.value):-1;
      if(i>=0&&fingerprint(w.value)===w.fp)array.splice(i,1);
      else conflicts.push(w.k+':'+(w.value?.id||'appended-record'));
      continue;
    }
    const equal=w.removed?!own(w.o,w.k):own(w.o,w.k)&&w.o[w.k]===w.after&&fingerprint(w.o[w.k])===w.fp;
    if(!equal){conflicts.push(w.k);continue;}
    if(w.had)w.o[w.k]=w.before;else delete w.o[w.k];
   }
   active=null;return {ok:false,error:e.code||e.message||'admission_failed',rollback:{complete:conflicts.length===0,conflicts},effects_started:0};
  }
  active=null;
  const effectErrors=[];
  for(const effect of tx.effects){try{effect();}catch(e){effectErrors.push(String(e.message||e));}}
  return {...out,...(effectErrors.length?{effect_errors:effectErrors}:{}),committed:true};
 }
 window.PM56_TX={set,remove,append,defer,run,fail,isActive:()=>!!active};
})();
