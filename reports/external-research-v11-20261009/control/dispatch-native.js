async function directGlobalView(){
const unpack=x=>{if(x.structuredContent)return x.structuredContent;try{return JSON.parse(x.content?.find(y=>y.type==="text")?.text??x)}catch{return null;}};
let ps=[],cursor=null;for(let i=0;i<10;i++){const p=unpack(await tools.mcp__t3_code__t3_project_list({limit:50,...(cursor==null?{}:{cursor})}));if(!p?.projects)return {ok:false,reason:"project enumeration unavailable"};ps.push(...p.projects.map(x=>x.id));cursor=p.nextCursor;if(cursor==null)break;if(i===9)return {ok:false,reason:"project enumeration bound"};}
const results=await Promise.allSettled(ps.map(async projectId=>{let ts=[],c=null;for(let i=0;i<10;i++){const p=unpack(await tools.mcp__t3_code__t3_thread_list({projectId,includeSubagents:true,limit:50,...(c==null?{}:{cursor:c}),statuses:["running","starting","queued","waiting","preparing"]}));if(!p?.threads)throw new Error("thread enumeration unavailable");ts.push(...p.threads);c=p.nextCursor;if(c==null)return ts;if(i===9)throw new Error("thread enumeration bound");}return ts;}));
if(results.some(x=>x.status!=="fulfilled"))return {ok:false,reason:"one or more project views unavailable"};
let check=[],cc=null;for(let i=0;i<10;i++){const p=unpack(await tools.mcp__t3_code__t3_project_list({limit:50,...(cc==null?{}:{cursor:cc})}));if(!p?.projects)return {ok:false,reason:"project recheck unavailable"};check.push(...p.projects.map(x=>x.id));cc=p.nextCursor;if(cc==null)break;if(i===9)return {ok:false,reason:"project recheck bound"};}
if(JSON.stringify(ps.sort())!==JSON.stringify(check.sort()))return {ok:false,reason:"project snapshot changed"};
const threads=[...new Map(results.flatMap(x=>x.value).map(t=>[t.threadId,{...t,provider:{instanceId:t.providerInstanceId,model:t.model}}])).values()];
return {ok:true,data:{threads},page:{nextCursor:null,truncated:false},observedAt:new Date().toISOString(),source:"Direct supported T3 project enumeration and every project thread view; complete pages and project membership recheck."};
}
async function dispatchStage(block,arm,stage){
const rt=load("runtime"),q=load("queue").find(x=>x.block_id===block);
const unpack=x=>{if(x.structuredContent)return x.structuredContent;try{return JSON.parse(x.content?.find(v=>v.type==="text")?.text??x)}catch{return null;}};
const constrainedRoute=["muse","glm"].includes(q.stage_routes?.[arm]?.[stage]??q.route);let g=constrainedRoute?await directGlobalView():{ok:true,data:{threads:[]},page:{}};
if(!g?.ok||g.page?.nextCursor||g.page?.truncated){text({blocked:"incomplete capacity visibility",block,arm,stage});return null;}
const route=q.stage_routes?.[arm]?.[stage]??q.route;
const pool=route==="muse"?"muse":route==="glm"?"zcode":null;
const count=pool?g.data.threads.filter(t=>t.provider?.instanceId===pool).length:0;
if(pool&&count>=(pool==="muse"?5:3)){text({blocked:"provider full",block,arm,stage,route:q.route,count});return null;}
const mem=await tools.exec_command({cmd:"free -g",max_output_tokens:150});const avail=Number(mem.output.split("\n").find(x=>x.startsWith("Mem:"))?.split(" ").filter(Boolean).at(-1));
if(!(avail>=6)){text({blocked:"memory",avail});return null;}
const prep=await tools.exec_command({cmd:"python3 "+rt+"/control/stage.py "+block+" "+arm+" "+stage,max_output_tokens:1100});
if(prep.exit_code!==0){text(prep);return null;}
const spec=JSON.parse(prep.output);if(spec.route!==(q.stage_routes?.[arm]?.[stage]??q.route))throw new Error("route mismatch");
const args={clientRequestId:"er11-116bb1e4-"+block+"-"+arm+"-"+stage+"-v1",mode:"async",role:"general",title:"ER11 "+block+" "+arm+" "+stage,target:load("routes")[spec.route],task:spec.prompt};
const requestedAt=new Date().toISOString();
await tools.apply_patch("*** Begin Patch\n*** Add File: "+spec.path+"/dispatch-request.json\n+"+JSON.stringify({requestedAt,args})+"\n*** End Patch");
let v=null;for(let i=0;i<2&&!v?.taskId;i++){v=unpack(await tools.mcp__t3_code__delegate_task(args));}
if(!v?.taskId){text({pending:"dispatch response unavailable, exact retry only",block,arm,stage});return null;}
const d={requestedAt,acceptedAt:new Date().toISOString(),block,arm,stage,target:args.target,prompt:args.task,...v};
await tools.apply_patch("*** Begin Patch\n*** Add File: "+spec.path+"/dispatch.json\n+"+JSON.stringify(d)+"\n*** End Patch");
text({block,arm,stage,route:spec.route,status:v.status,taskId:v.taskId});
await tools.exec_command({cmd:"python3 "+rt+"/control/sync.py",max_output_tokens:300});
return d;
}