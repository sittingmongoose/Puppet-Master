import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
const source=readFileSync(new URL('../checks/perf-hover-restyle.check.mjs',import.meta.url),'utf8');
const a=source.indexOf('export async function trace('),b=source.indexOf('// Diagnostic flags',a);
const trace=new Function('CATS',source.slice(a,b).replace('export async function','async function')+'\nreturn trace;')('devtools.timeline');
async function run(fail) {
 const calls=[];let complete;
 const cdp={once:(name,fn)=>{complete=fn;},send:async(name)=>{
  calls.push(name);
  if(name==='Tracing.end')complete({stream:'s'});
  if(name==='IO.read')return{data:'{"traceEvents":[]}',eof:true};
  return{};
 }};
 const frame={evaluate:async()=>{calls.push('renderer-ack');if(fail==='renderer')throw new Error('renderer failure');}};
 let error;try{await trace(cdp,async()=>{calls.push('input');if(fail==='input')throw new Error('input failure');},{frame});}catch(e){error=e;}
 return{calls,error};
}
let x=await run();assert.equal(x.error,undefined);assert.ok(x.calls.includes('renderer-ack'),'the renderer must acknowledge completion after the last input');
assert.ok(x.calls.indexOf('input')<x.calls.indexOf('renderer-ack'));assert.ok(x.calls.indexOf('renderer-ack')<x.calls.indexOf('Tracing.end'));
for(const fail of ['input','renderer']){x=await run(fail);assert.match(x.error.message,new RegExp(fail+' failure'));assert.ok(x.calls.includes('Tracing.end'));assert.ok(x.calls.includes('IO.close'),'drain and close even after failure');}
console.log('PASS renderer acknowledges the last input before trace end; input/ack errors still stop and drain tracing');
