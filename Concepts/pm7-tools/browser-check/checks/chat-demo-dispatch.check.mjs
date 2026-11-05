// SW38: launch every Studio moment/example through the chat owner, with no hidden trigger node.
export default async function(t){
 const f=await t.app.open();await f.evaluate(()=>PM56_PORT.demo.showChat());await t.page.waitForTimeout(300);
 const catalog=await f.evaluate(()=>({groups:PM56_PORT.demo.groups(),guided:PM56_PORT.demo.guided(),dispatcher:typeof PM56_APP.demoAction==='function'}));
 t.log('catalog '+JSON.stringify({moments:catalog.groups.reduce((n,g)=>n+g.items.length,0),guided:catalog.guided.reduce((n,g)=>n+g.items.length,0)}));
 await t.check('chat exposes structured demo dispatcher',catalog.dispatcher);
 if(!catalog.dispatcher){await f.evaluate(([g,it])=>PM56_PORT.demo.run(g,it),[catalog.groups[0].id,catalog.groups[0].items[0].id]);await t.check('no hidden demo host',await f.locator('#pm56-demo-host').count()===0);return;}
 await f.evaluate(()=>{window.__demoCalls=[];const a=PM56_APP,run=a.demoAction;a.demoAction=function(action,data){const ok=run(action,data);__demoCalls.push({action,data,ok});return ok;};});
 const rows=[...catalog.groups.flatMap(g=>g.items.map(it=>({group:g.id,it,guided:false}))),...catalog.guided.flatMap(g=>g.items.map(it=>({group:g.id,it,guided:true})))];
 await t.check('nonempty full catalog',rows.length>150);
 for(const row of rows){
  const got=await f.evaluate(r=>{PM56_PORT.demo.reset();__demoCalls.length=0;const result=r.guided?PM56_PORT.demo.runGuided(r.it.id):PM56_PORT.demo.run(r.group,r.it.id);return {result,calls:__demoCalls.slice(),hidden:!!document.querySelector('#pm56-demo-host'),thread:PM56_APP.ctx().state.selectedThread,players:Object.keys(PM56_RECPLAY.players)};},row);
  await t.check((row.guided?'example ':'moment ')+row.group+'/'+row.it.id,got.result.ok&&!got.hidden&&got.calls.some(c=>c.action===row.it.action&&c.ok),JSON.stringify(got));
  if(['b14-start','b15-start'].includes(row.it.action))await t.check(row.it.id+' starts recorded playback',got.players.length>0,JSON.stringify(got));
  await t.page.waitForTimeout(row.it.label.startsWith('Live ')||row.it.label==='Trouble mid-turn'?350:50);
 }
 await f.evaluate(()=>PM56_PORT.demo.reset());
 await t.check('no hidden trigger host remains',await f.locator('#pm56-demo-host').count()===0);
}
