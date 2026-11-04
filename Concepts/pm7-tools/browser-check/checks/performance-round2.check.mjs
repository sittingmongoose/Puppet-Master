// One resident GPU browser for trace accounting and final control/fix films.
import perf from './performance-stalls.check.mjs';
import projection from './work-projection.check.mjs';
import sound from './sound-prime.check.mjs';
export default async function(t){
 const saved={...t.args};
 const builds=saved.base&&saved.fixed?[['control',saved.base],['fixed',saved.fixed]]:[['fixed',saved.page]];
 for(const [label,page] of builds){
  for(const only of String(saved.tasks||'crew,studio,look,drag,bell').split(',')){
   Object.assign(t.args,saved,{page,only,reps:Number(saved.reps||3),stripProbe:only==='drag'&&label==='fixed'?1:0,audioProbe:only==='bell'?1:0,
    trace:saved.evidence?`${saved.evidence}/${label}-${only}-trace.json`:undefined,
    metrics:saved.evidence?`${saved.evidence}/${label}-${only}-metrics.json`:undefined,
    profile:saved.profile&&saved.evidence?`${saved.evidence}/${label}-${only}-profile.json`:undefined});
   await t.mark(label+' '+only+' begin');
   await perf(t);
   await t.mark(label+' '+only+' end');
  }
  if(label==='fixed'&&saved.functional){
   await projection.tests['Studio work changes preserve the conversation (SW-10)'](t);
   await sound(t);
  }
 }
 Object.assign(t.args,saved);
}
