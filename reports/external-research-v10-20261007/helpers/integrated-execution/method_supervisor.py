import json, hashlib, pathlib, datetime, sys
B=pathlib.Path('/home/sittingmongoose/PM-Experiments/er10-20261007-5a126dd5')
def now(): return datetime.datetime.now(datetime.timezone.utc).isoformat()
def save(p,v): p.write_text(json.dumps(v,indent=2)+'\n')
def ident(p):
 b=p.read_bytes(); return {'path':str(p),'sha256':hashlib.sha256(b).hexdigest(),'bytes':len(b)}
def freeze(case):
 sel=json.loads((B/'helpers/integrated-execution/selection-v1.json').read_text())
 rec=next(x for x in sel['recipes'] if x['case_id']==case)
 ready=json.loads((B/'helpers/integrated-case-design/ready-cases.json').read_text())
 row=next(x for x in ready['cases'] if x['case_id']==case)
 C=B/'cases'/case
 inputs={}
 for name,expected in row['input_identities'].items():
  got=ident(C/name); assert got['sha256']==expected['sha256'] and got['bytes']==expected['bytes']; inputs[name]=got
 assert ident(C/'prepared.json')['sha256']==row['prepared_identity']['sha256']
 card={'schema':'er10.integrated.execution.v1','case_id':case,'frozen_at':now(),'recipe':rec,'selection_basis':'unqualified operational diagnostic; no source-quality or speed claim','inputs':inputs,'prepared_identity':ident(C/'prepared.json'),'candidate_binding':sel['candidate_binding'],'review_binding':{'providerInstanceId':'codex_gmail','driverKind':'codex','model':'gpt-6.1-sol','reasoningEffort':'xhigh','serviceTier':'priority'},'same_pair':{'inputs':True,'effort':True,'access':True,'aggregate_occupied_work_ceiling_seconds':2700},'stage_seconds':{'research':1200,'critic':600,'reviser':900},'latency_boundary':'earliest actual T3 requestedAt for first stage through complete native terminal and T3 delivery, maximum 2700s including queue/start/retries/retrieval; stage allocation includes delivery; no clock reset','reserve_policy':'research preserves 600s critic +900s final; critic preserves 900s final; no writing-stage admission after envelope exhaustion','expiry_policy':'one lifecycle-only save/deliver steer at real expiry, at most 60s grace, owned task_cancel if live; no substantive extension','launch_order':['control','treatment'] if int(case[-2:])%2 else ['treatment','control'],'output_scope':'FULL original O1-O6 and all in-scope plan sections; complete proposed-change artifact, options, retained/rejected dispositions, criticism dispositions, uncertainty, validation proposed/executed','quality_axes':['required brief obligations','consequential claims/conditions','bounded useful discovery','incorrect rejections/corrections','preservation','proposed versus executed validation'],'output_contract':'authored artifact.md + source-map.json with immutable captured public bytes and identity metadata; alternatively full native final answer mechanically saved verbatim, never a summary substituted for full output','tool_policy':{'native_public_search_read':True,'writable':'own role directory only','no_nested_delegation':True,'no_repo_or_account_changes':True,'maps_advisory_not_firewall':True,'isolation_limit':'T3 freshness excludes parent history; full-access filesystem not a security firewall; no evaluator exists until both arms quiet; forbidden sibling paths explicitly excluded','execution':'no downloaded source execution/installers on host; bounded qualified sandbox only if separately admitted'}}
 assert not (C/'execution-v1.json').exists()
 save(C/'execution-v1.json',card)
 for arm in card['launch_order']:
  for role in ['research','critic','reviser']:
   J=B/'jobs'/case/arm/(role+'-v1'); J.mkdir(parents=True,exist_ok=True); (J/'sources').mkdir(exist_ok=True)
   m={'brief':str(C/'brief.md'),'plan':str(C/'plan.md'),'input_identities':inputs,'own_output_directory':str(J),'artifact':str(J/'artifact.md'),'source_map':str(J/'source-map.json'),'native_receipts':str(J/'native-receipts.jsonl'),'predecessors':[]}
   if role!='research': m['predecessors']=[str(B/'jobs'/case/arm/'research-v1/artifact.md'),str(B/'jobs'/case/arm/'research-v1/source-map.json')]
   if role=='reviser': m['predecessors'] += [str(B/'jobs'/case/arm/'critic-v1/artifact.md'),str(B/'jobs'/case/arm/'critic-v1/source-map.json')]
   save(J/'input-map.json',m)
 state=B/'state/integrated-methods.json'
 s=json.loads(state.read_text()) if state.exists() else {'schema':'er10.integrated.methods.state.v1','owner_thread':None,'luna_cap':2,'queue':['I-METHOD-%02d'%i for i in range(1,7)],'cases':{},'tasks':{},'counts':{'complete_pairs':0,'assessed_pairs':0,'unassessed_pairs':6},'speed_hold':'WAIT root speed recipe lock; no speed cases opened','owned_paths':[]}
 s['cases'][case]={'card':str(C/'execution-v1.json'),'status':'frozen','arms':{a:{'status':'ready','stages':{}} for a in ['control','treatment']}}
 s['updated_at']=now(); save(state,s)
 print(json.dumps({'case':case,'card':str(C/'execution-v1.json'),'launch_order':card['launch_order'],'identities_verified':len(inputs)}))
if __name__=='__main__': freeze(sys.argv[1])
