/* Deterministic helper tests only; no browser, native audio, or speaker claim. */
import assert from 'node:assert/strict';
import {execFileSync} from 'node:child_process';
import {fileURLToPath} from 'node:url';
const factorySource = execFileSync('python3', [fileURLToPath(new URL('../settings_sound_preview_source.py', import.meta.url))], {encoding:'utf8'});
const createPreview = new Function(`${factorySource}; return createSettingsSoundPreview;`)();
const tone = {id:'attention',name:'Attention chime',source:'Built-in',duration:'0:02.1',volume:75};
function fixture(config={}) {
  const events=[],contexts=[],timers=new Map(),listeners=new Map();let timerId=0;
  const host={addEventListener:(name,fn)=>listeners.set(name,fn),removeEventListener:name=>listeners.delete(name),
    setTimeout:fn=>{timers.set(++timerId,fn);return timerId;},clearTimeout:id=>timers.delete(id)};
  class Context {
    constructor(){if(config.constructError)throw new Error('No device');this.state=config.suspended?'suspended':'running';this.currentTime=0;this.destination={};this.nodes=[];contexts.push(this);}
    async resume(){if(config.resumeError)throw new Error('Blocked');if(config.resume)await config.resume;this.state='running';}
    close(){this.state='closed';return Promise.resolve();}
    node(){const node={connected:false,stopped:false,values:[],connect(){this.connected=true;},disconnect(){this.connected=false;},start(...args){this.started=args;},stop(){this.stopped=true;}};const param={setValueAtTime:v=>node.values.push(v),exponentialRampToValueAtTime(){}};node.gain=param;node.frequency=param;this.nodes.push(node);return node;}
    createGain(){return this.node();}createOscillator(){return this.node();}createBufferSource(){return this.node();}
    async decodeAudioData(){if(config.decodeError)throw new Error('Unsupported audio');return {duration:60};}
  }
  const api=createPreview({window:host,document:host,AudioContextClass:config.noApi?null:Context,onState:e=>events.push(e)});
  return {api,events,contexts,timers,listeners,host};
}
let passed=0;
async function test(label,fn){await fn();passed++;console.log(`PASS ${label}`);}
await test('no audio context before gesture',()=>{const f=fixture();assert.equal(f.contexts.length,0);f.api.dispose();assert.equal(f.listeners.size,0);});
await test('built-in tone produces nodes and natural-end cleanup',async()=>{const f=fixture();assert.equal((await f.api.play(tone)).state,'playing');assert.equal(f.contexts[0].nodes.length,7);[...f.timers.values()][0]();assert.equal(f.api.getState().state,'idle');assert.equal(f.contexts[0].state,'closed');assert.ok(f.contexts[0].nodes.every(n=>!n.connected));f.api.dispose();});
await test('zero volume remains zero',async()=>{const f=fixture();const r=await f.api.play({...tone,volume:0});assert.equal(r.volume,0);assert.equal(f.contexts[0].nodes[0].values[0],0);f.api.dispose();});
await test('same sound toggles off and another replaces it',async()=>{const f=fixture();await f.api.toggle(tone);assert.equal((await f.api.toggle(tone)).state,'stopped');await f.api.play(tone);await f.api.play({...tone,id:'soft-warning'});assert.equal(f.contexts[1].state,'closed');assert.equal(f.api.getState().id,'soft-warning');f.api.dispose();});
await test('missing pack/custom recordings never play substitutes',async()=>{const f=fixture();for(const sound of [{id:'peon-ready',source:'PeonPing pack'},{id:'failure',source:'Custom upload'},{id:'new',source:'Built-in'}]){assert.equal((await f.api.play(sound)).code,'sound_file_unavailable');}assert.equal(f.contexts.length,0);assert.ok(!f.events.some(e=>e.phase==='playing'));f.api.dispose();});
await test('missing API and device failures are honest',async()=>{for(const [config,code] of [[{noApi:true},'audio_api_unavailable'],[{constructError:true},'audio_context_failed'],[{suspended:true,resumeError:true},'audio_resume_failed']]){const f=fixture(config);assert.equal((await f.api.play(tone)).code,code);assert.ok(!f.events.some(e=>e.phase==='playing'));f.api.dispose();}});
await test('suspended context resumes before playing',async()=>{const f=fixture({suspended:true});assert.equal((await f.api.play(tone)).state,'playing');f.api.dispose();});
await test('stop during resume cannot restart playback',async()=>{let release;const f=fixture({suspended:true,resume:new Promise(r=>release=r)});const pending=f.api.play(tone);f.api.stop();release();assert.equal((await pending).state,'stopped');assert.equal(f.contexts[0].nodes.length,0);f.api.dispose();});
await test('chosen recording uses decoded audio and bounded playback',async()=>{const f=fixture(),sound={id:'upload',source:'Custom upload',volume:40};assert.equal(f.api.attachFile('upload',{size:10,arrayBuffer:async()=>new ArrayBuffer(10)}),true);const r=await f.api.play(sound);assert.equal(r.mode,'local_file');assert.equal(f.contexts[0].nodes.length,2);assert.equal(f.contexts[0].nodes[1].started[2],30);f.api.releaseFile('upload');assert.equal(f.api.availability(sound),'file_unavailable');assert.equal(f.api.getState().state,'idle');f.api.dispose();});
await test('oversized and invalid recordings rejected, decode fails visibly',async()=>{const f=fixture({decodeError:true}),sound={id:'upload',source:'Custom upload'};assert.equal(f.api.attachFile('upload',{size:33*1024*1024,arrayBuffer(){}}),false);assert.equal(f.api.attachFile('upload',{}),false);f.api.attachFile('upload',{size:10,arrayBuffer:async()=>new ArrayBuffer(10)});assert.equal((await f.api.play(sound)).code,'audio_start_failed');assert.equal(f.contexts[0].state,'closed');f.api.dispose();});
await test('hidden page, project reset, and dispose release playback',async()=>{const f=fixture();await f.api.play(tone);f.host.hidden=true;f.listeners.get('visibilitychange')();assert.equal(f.api.getState().state,'idle');await f.api.play(tone);f.listeners.get('pagehide')();assert.equal(f.api.getState().state,'idle');f.api.attachFile('upload',{size:10,arrayBuffer(){}});f.api.clearFiles();assert.equal(f.api.availability({id:'upload'}),'file_unavailable');f.api.dispose();assert.equal((await f.api.play(tone)).code,'preview_disposed');assert.equal(f.listeners.size,0);assert.equal(f.timers.size,0);});
console.log(JSON.stringify({scope:'isolated helper behavior, not speaker/native verification',passed}));
