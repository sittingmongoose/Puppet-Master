// SW-46 setup stress only; full clearance lives in pod-clearance.
import pod from './pod-clearance.check.mjs';
export default async function(t) {
  const saved={...t.args};
  try {
    Object.assign(t.args,{width:1512,setupOnly:1});
    for(let i=0;i<Number(t.args.repeats||12);i++) await t.step('1512 setup repeat '+(i+1),()=>pod(t));
  } finally { t.args=saved; }
}
