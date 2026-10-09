async function dispatchStage(block,arm,stage){
const rt=load("runtime"),q=load("queue").find(x=>x.block_id===block);
const unpack=x=>{if(x.structuredContent)return x.structuredContent;try{return JSON.parse(x.content?.find(v=>v.type==="text")?.text??x)}catch{return null;}};
const constrainedRoute=["muse","glm"].includes(q.route);let g=constrainedRoute?null:{ok:true,data:{threads:[]},page:{}};for(let i=0;constrainedRoute&&i<2&&!g?.ok;i++){g=unpack(await tools.mcp__codex_apps__t3_ubuntu_t3_threads_list({includeSubagents:true,limit:200,statuses:["running","starting","queued","waiting","preparing"]}));}
if(!g?.ok||g.page?.nextCursor||g.page?.truncated){text({blocked:"incomplete capacity visibility",block,arm,stage});return null;}
const pool=q.route==="muse"?"muse":q.route==="glm"?"zcode":null;
const count=pool?g.data.threads.filter(t=>t.provider?.instanceId===pool).length:0;
if(pool&&count>=(pool==="muse"?5:3)){text({blocked:"provider full",block,arm,stage,route:q.route,count});return null;}
const mem=await tools.exec_command({cmd:"free -g",max_output_tokens:150});const avail=Number(mem.output.split("\n").find(x=>x.startsWith("Mem:"))?.split(" ").filter(Boolean).at(-1));
if(!(avail>=6)){text({blocked:"memory",avail});return null;}
const prep=await tools.exec_command({cmd:"python3 "+rt+"/control/stage.py "+block+" "+arm+" "+stage,max_output_tokens:1100});
if(prep.exit_code!==0){text(prep);return null;}
const spec=JSON.parse(prep.output);if(spec.route!==q.route)throw new Error("route mismatch");
const args={clientRequestId:"er11-116bb1e4-"+block+"-"+arm+"-"+stage+"-v1",mode:"async",role:"general",title:"ER11 "+block+" "+arm+" "+stage,target:load("routes")[q.route],task:spec.prompt};
const requestedAt=new Date().toISOString();
await tools.apply_patch("*** Begin Patch\n*** Add File: "+spec.path+"/dispatch-request.json\n+"+JSON.stringify({requestedAt,args})+"\n*** End Patch");
let v=null;for(let i=0;i<2&&!v?.taskId;i++){v=unpack(await tools.mcp__t3_code__delegate_task(args));}
if(!v?.taskId){text({pending:"dispatch response unavailable, exact retry only",block,arm,stage});return null;}
const d={requestedAt,acceptedAt:new Date().toISOString(),block,arm,stage,target:args.target,prompt:args.task,...v};
await tools.apply_patch("*** Begin Patch\n*** Add File: "+spec.path+"/dispatch.json\n+"+JSON.stringify(d)+"\n*** End Patch");
text({block,arm,stage,route:q.route,status:v.status,taskId:v.taskId});
await tools.exec_command({cmd:"python3 "+rt+"/control/sync.py",max_output_tokens:300});
return d;
}
