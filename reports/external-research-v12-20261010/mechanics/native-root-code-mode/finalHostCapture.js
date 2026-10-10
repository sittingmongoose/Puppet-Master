async function finalHostCapture(){
 const R="ER12_RUNTIME",un=eval("("+load("unpackSource")+")"),q=s=>"'"+s.replaceAll("'","'\\''")+"'";
 const cp={candidateTasks:load("candidateTasks"),evaluationTasks:load("evaluationTasks"),setupTasks:load("setupTasks")};
 for(const kind of Object.keys(cp)) if(cp[kind].some(t=>!["completed","failed","cancelled","interrupted"].includes(t.status)||t.hasPendingChildRuns))throw Error("not quiet "+kind);
 const all=Object.entries(cp).flatMap(([kind,a])=>a.map(t=>({kind,declaration:t})));
 if(new Set(all.map(x=>x.declaration.taskId)).size!==all.length)throw Error("duplicate tasks");
 const write=async(path,v)=>{const s=JSON.stringify(v,null,2)+"\n";for(let off=0;off<s.length;off+=24000){const chunk=s.slice(off,off+24000);const o=await tools.exec_command({cmd:"python3 - "+q(path)+" "+q(chunk)+" "+(off===0?"write":"append")+" <<'PY'\nfrom pathlib import Path\nimport sys\np=Path(sys.argv[1]);p.parent.mkdir(parents=True,exist_ok=True)\nwith p.open('w' if sys.argv[3]=='write' else 'a') as f:f.write(sys.argv[2])\nPY",max_output_tokens:30});if(o.exit_code!==0)throw Error(o.output);}};
 const records=[],errors=[],files=[];
 for(let i=0;i<all.length;i+=8){
  const batch=all.slice(i,i+8);const out=await Promise.allSettled(batch.map(async x=>{
    const status=await tools.mcp__t3_code__task_status({taskId:x.declaration.taskId});const z=un(status);
    if(!["completed","failed","cancelled","interrupted"].includes(z.status)||z.hasPendingChildRuns)throw Error("new pending work "+x.declaration.taskId);
    if(z.latestTerminalRunId!==x.declaration.latestTerminalRunId)throw Error("changed terminal run "+x.declaration.taskId);
    const host=await tools.mcp__t3_code__t3_thread_read({threadId:x.declaration.childThreadId,view:"activity",limit:1,maxCharsPerItem:200,runLimit:50});const h=un(host);
    if(h.thread?.activeRunId||h.thread?.pendingRequestCount||h.recentRuns?.some(r=>["preparing","queued","starting","running","waiting"].includes(r.status)))throw Error("host active "+x.declaration.taskId);
    return {kind:x.kind,declaration:x.declaration,actual_response:host,terminal_task_status:status,captured_at:new Date().toISOString()};
  }));
  for(let j=0;j<out.length;j++){
   const o=out[j],x=batch[j],key=x.declaration.key||x.declaration.taskId.split("%3A").at(-1);
   if(o.status==="rejected"){errors.push({key,error:String(o.reason)});continue}
   const row=o.value;records.push(row);
   const hp=R+"/mechanics/final-native-host-capture-v1/host/"+key+".json";await write(hp,row);files.push(hp);
   await write(R+"/mechanics/final-native-host-capture-v1/task-status/"+key+".json",{observed_at_utc:row.captured_at,actual_response:row.terminal_task_status});
  }
  if(i%32===0)notify({final_finite_capture_done:Math.min(i+8,all.length),total:all.length,errors:errors.length});
 }
 const result={scope:"One finite final originally owned task reconciliation. All assigned candidate/evaluation/preparation failures included; no scientific reread/regrade. Host/native authentication and billing UNKNOWN.",at:new Date().toISOString(),records,errors};
 await write(R+"/mechanics/final-native-host-capture-v1/HOST_CAPTURE.json",result);
 await write(R+"/mechanics/final-native-host-capture-v1/HOST_MANIFEST.json",{files});
 store("finalHostCapture",result);text({captured:records.length,total:all.length,errors});
 if(errors.length)throw Error("final capture has unresolved errors");
}
