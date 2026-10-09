async function dispatchEvaluation(block){
const rt=load("runtime");const mem=await tools.exec_command({cmd:"free -g",max_output_tokens:150});if(Number(mem.output.split("\n").find(x=>x.startsWith("Mem:"))?.split(" ").filter(Boolean).at(-1))<6)return null;
const p=await tools.exec_command({cmd:"python3 "+rt+"/control/evaluate.py "+block,max_output_tokens:900});if(p.exit_code!==0){text({evaluationNotReady:block,detail:p.output.slice(-250)});return null;}
const spec=JSON.parse(p.output),target={providerInstanceId:"codex_gmail",model:"gpt-6.1-sol",options:{reasoningEffort:"xhigh",serviceTier:"priority"}};
const args={clientRequestId:"er11-116bb1e4-"+block+"-assessment-v1",mode:"async",role:"general",title:"ER11 independent "+block,target,task:spec.prompt};
const requestedAt=new Date().toISOString();await tools.apply_patch("*** Begin Patch\n*** Add File: "+spec.path+"/dispatch-request.json\n+"+JSON.stringify({requestedAt,args})+"\n*** End Patch");
let v;for(let i=0;i<2;i++){const z=await tools.mcp__t3_code__delegate_task(args);try{v=z.structuredContent??JSON.parse(z.content[0].text)}catch{v=null}if(v?.taskId)break;}
if(!v?.taskId){text({pendingEvaluationDispatch:block});return null;}
await tools.apply_patch("*** Begin Patch\n*** Add File: "+spec.path+"/dispatch.json\n+"+JSON.stringify({requestedAt,acceptedAt:new Date().toISOString(),block,deadline:spec.deadline,target,prompt:spec.prompt,...v})+"\n*** End Patch");
await tools.exec_command({cmd:"python3 "+rt+"/control/sync.py",max_output_tokens:200});text({evaluation:block,status:v.status,taskId:v.taskId});return v;
}
