// Astra minor: exercise the actual default route repeatedly, on either surface.
import perf from './performance-stalls.check.mjs';
export default async function(t){
 const prefix=t.args.tracePrefix;
 for(let i=0;i<Number(t.args.routeRepeats||2);i++){
  delete t.args.only;
  if(prefix){t.args.trace=prefix+'-'+i+'-trace.json';t.args.metrics=prefix+'-'+i+'-metrics.json';}
  await t.mark('default route '+i);
  await perf(t);
 }
}
