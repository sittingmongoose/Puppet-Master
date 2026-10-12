// SOLE DISPATCHER ONLY. No implementation worker executes this file.
const R='ER13_RUNTIME';
const ARM=R+'/mechanics/dispatch-v1/admitted/D-R2-P02-control';
const H=R+'/helpers/unstarted-stage-route-fork-v1';
const OLD=ARM+'/configs/D-R2-P02-control.json';
const FORK=R+'/state/route-fork-v1/D-R2-P02-control-reviser-config.json';
const STAGE=ARM+'/run/D-R2-P02-control/stages/reviser';
const q=s=>"'"+String(s).replaceAll("'","'\\''")+"'";
const unpack=r=>r.structuredContent ?? JSON.parse(r.content.find(x=>x.type==='text').text);
const cap=unpack(await tools.mcp__t3_code__orchestrator_capabilities({}));
const provider=cap.providers.find(x=>x.providerInstanceId==='codex_private_epoch_2');
const model=provider?.models.find(x=>x.id==='gpt-6-luna');
for(const [key,value] of [['reasoningEffort','max'],['serviceTier','default']]) {
  if(!provider?.canRunChildTask || !model?.options?.some(x=>x.id===key && x.options?.some(y=>y.id===value))) throw Error('STOP: exact prospective private route unavailable');
}
const mem=await tools.exec_command({cmd:'free -g',max_output_tokens:300});
const available=Number(mem.output.split('\n').find(x=>/^Mem:/.test(x))?.trim().split(/\s+/).at(-1));
if(mem.exit_code!==0 || !Number.isFinite(available) || available<6) throw Error('STOP: original bootstrap memory gate');
const integrity=await tools.exec_command({cmd:'python3 -B '+q(ARM+'/helpers/er12-screen-v1/materialize.py')+' --verify '+q(ARM),max_output_tokens:500});
if(integrity.exit_code!==0 || integrity.session_id) throw Error('STOP: original materialization integrity '+integrity.output);
// Keep a prospective capability observation separate from used common capabilities.json.
const prep=await tools.exec_command({cmd:'python3 -B '+q(H+'/route_fork.py')+
  ' --old-config '+q(OLD)+' --old-config-sha 20ef6adf158178e437121bba65822c46c3242e927a4f607c70e3d3ff824b417e'+
  ' --amendment '+q(R+'/state/account-routing-amendment-v1.json')+' --amendment-sha b31b2548266d41afca38e4199c9c79a79bcab3227048454d087c891c34fd792d'+
  ' --fork-config '+q(FORK)+' --stage-dir '+q(STAGE)+
  ' --original-run-init-sha 40f526f258bb9998db2e2b6fe44e8ece93e660d6016718d4b1ecb393032f844f',max_output_tokens:24000});
if(prep.exit_code!==0 || prep.session_id) throw Error('STOP: prospective route fork '+prep.output);
const spec=JSON.parse(prep.output);
if(spec.args.target.providerInstanceId!=='codex_private_epoch_2' || spec.args.target.model!=='gpt-6-luna' || spec.args.target.options.reasoningEffort!=='max' || spec.args.target.options.serviceTier!=='default') throw Error('STOP: fork target mismatch');
// Dispatcher retains exact returned taskId and candidate original native Goal/birth/clock contract.
const response=await tools.mcp__t3_code__delegate_task(spec.args);
const saved=await tools.exec_command({cmd:'python3 -B '+q(ARM+'/helpers/er12-screen-v1/prepare.py')+' record --config '+q(OLD)+' --stage reviser --json '+q(JSON.stringify(response)),max_output_tokens:24000});
if(saved.exit_code!==0 || saved.session_id) throw Error('STOP: preserve actual dispatch response; do not launch again '+saved.output);
text({stage:'reviser',route_epoch:spec.route_epoch,returned:unpack(response),actual_native_provenance:'UNKNOWN beyond original checks'});
