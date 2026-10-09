async function harvest(onlyTaskIds=null){
const rt=load("runtime");
const z=await tools.exec_command({cmd:"python3 - <<'PY'\nimport pathlib,json\nr=pathlib.Path('"+rt+"')\nprint(json.dumps([{'path':str(p.parent),'taskId':json.loads(p.read_text())['taskId']} for p in (r/'jobs').glob('*/*/*/dispatch.json') if not (p.parent/'task-result.json').exists()]))\nPY",max_output_tokens:8000});
const res=await Promise.allSettled(JSON.parse(z.output).filter(x=>onlyTaskIds===null||onlyTaskIds.includes(x.taskId)).map(async x=>{const raw=await tools.mcp__t3_code__task_status({taskId:x.taskId});try{return {path:x.path,result:raw.structuredContent??JSON.parse(raw.content[0].text)}}catch{return {path:x.path,error:true}}}));
const done=[];
for(const t of res){
 if(t.status!=="fulfilled"||!["completed","interrupted","failed","cancelled","error"].includes(t.value.result?.status))continue;
 const {path,result}=t.value;
 await tools.apply_patch("*** Begin Patch\n*** Add File: "+path+"/task-result.json\n+"+JSON.stringify({observedAt:new Date().toISOString(),...result})+"\n*** End Patch");
 let raw=await tools.mcp__t3_code__t3_thread_read({threadId:result.childThreadId,view:"activity",limit:1,maxCharsPerItem:200,runLimit:10});
 let v;try{v=raw.structuredContent??JSON.parse(raw.content[0].text)}catch{v=null;}
 if(v){
 await tools.apply_patch("*** Begin Patch\n*** Add File: "+path+"/host-runs.json\n+"+JSON.stringify({observedAt:new Date().toISOString(),threadId:result.childThreadId,threadStatus:v.thread?.status,recentRuns:v.recentRuns})+"\n*** End Patch");

 // Lifecycle is captured by the existing exact-owned host observer below. No full timeline traversal.

 }
 await tools.mcp__t3_code__t3_thread_organize({threadId:result.childThreadId,action:"settle"});
 done.push({path:path.split("/jobs/")[1],status:result.status});
}
text({completedNow:done,stillPending:res.length-done.length});
await tools.exec_command({cmd:"python3 "+rt+"/control/observe.py",max_output_tokens:250});
return done;
}
