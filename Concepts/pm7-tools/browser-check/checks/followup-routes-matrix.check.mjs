// SW-42: bounded functional route matrix, reusing the original assertions.
import empty from './empty-server.check.mjs';
import cheer from './cheer-endpoint.check.mjs';
import fallback from './browser-fallback.check.mjs';
import shelf from './shelf-route.check.mjs';
import studio from './studio-screens.check.mjs';
const LOOKS = ['basic','friendly','retro','glass','nier'].flatMap(f=>['light','dark'].map(m=>f+'-'+m));
export const tests = {};
for(const look of LOOKS) for(const [width,height] of [[1280,900],[740,900],[1280,500]]) {
 if(width!==1280 || height!==900) { if(!['basic-light','glass-dark'].includes(look)) continue; }
 tests[`${look} ${width}x${height}`] = async t => {
  Object.assign(t.args,{look,width,height,only:'c-pair',codeOnly:1,depth:1});
  await t.viewport(width,height);
  for(const [name,run] of Object.entries({empty,cheer,fallback,shelf,studio})) await t.step(name,async()=>{
   // 'only' is this matrix's c-pair route filter; shelf-route reads its own --set only=<panel ids>, so hide it there
   const kept=t.args.only; if(name==='shelf') delete t.args.only;
   try { await run(t); } finally { if(name==='shelf') t.args.only=kept; }
   const size=await t.page.evaluate(()=>({width:innerWidth,height:innerHeight}));
   await t.check('requested viewport retained',size.width===width&&size.height===height,JSON.stringify(size));
  });
 };
}
