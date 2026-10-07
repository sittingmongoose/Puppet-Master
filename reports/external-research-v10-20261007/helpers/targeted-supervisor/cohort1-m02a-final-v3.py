import json,pathlib,hashlib,datetime,sys
R=pathlib.Path('/home/sittingmongoose/PM-Experiments/er10-20261007-5a126dd5')
S=R/'state/targeted-cohort1.json'; L=R/'state/targeted-cohort1-dispatches.jsonl'
PARENT='thread:delegated-task:command%3Amcp%3A05aa57ba-4ce9-4719-bb0a-647eab764051%3Adelegate-task%3Aer10-targeted-cohort1-v1'
def now():return datetime.datetime.now(datetime.timezone.utc)
def sha(p):return hashlib.sha256(pathlib.Path(p).read_bytes()).hexdigest()
def write(p,v):pathlib.Path(p).write_text(json.dumps(v,indent=2)+'\n')
def event(v):
 with L.open('a') as f:f.write(json.dumps({'time':now().isoformat(),**v})+'\n')
st=json.loads(S.read_text()); cmd=sys.argv[1]
if cmd=='prepare':
 case,arm=sys.argv[2:4];assert case=='D-M02-A';s=next(x for x in st['slots'] if x['case_id']==case);a=s['final_v3_execution']['arms'][arm]
 assert s.get('final_finite_v3') and st['new_case_admission_gate']=='RELEASED_AFTER_M02B_ACTUAL_SOURCE_ASSESSMENT'
 assert not any(t['case_id']==case and t['arm']==arm and t['version']=='v3' and t['status'] in ['dispatch_prepared','running','queued','waiting'] for t in st['tasks'])
 batch=case.startswith('D-M02') and arm=='treatment'
 if batch:assert s.get('sameauthor_binding_v2') and not a['stages']
 for x in s['freeze']:assert sha(x['path'])==x['sha256']
 n=len(a['stages']); stages=[dict(v) for v in s['card']['budget']['stages'][arm]]
 for v in stages:v['candidate_minutes']=10 if arm=='control' else 25 if v['stage']=='batch' else 5
 stage=stages[n];current=now()
 if batch:stage={**stage,'candidate_minutes':30,'procedure':stage['procedure']+' Then IN THE SAME context and SAME native Goal: '+stages[1]['procedure']}
 ex=s['final_v3_execution']
 if ex['T0'] is None:ex['T0']=current.isoformat();ex['deadline']=(current+datetime.timedelta(minutes=30)).isoformat()
 if a['started_at'] is None:a['started_at']=current.isoformat();a['deadline']=ex['deadline']
 deadline=min(datetime.datetime.fromisoformat(a['deadline']),current+datetime.timedelta(minutes=stage['candidate_minutes']));assert deadline>current
 d=R/'jobs'/case/arm/(stage['stage']+'-v3');d.mkdir(parents=True,exist_ok=False)
 predecessors=[] if stage['stage']=='question_2' else [t['output'] for t in a['stages']]
 for p in predecessors:assert pathlib.Path(p).is_file()
 final=str(d/'final.md') if n==len(stages)-1 else None;output=str(d/'report.md')
 if batch:
  fd=R/'jobs'/case/arm/'finalize-v3';fd.mkdir(parents=True,exist_ok=False);final=str(fd/'final.md')
 target={'providerInstanceId':'codex_gmail','driverKind':'codex','model':'gpt-6-luna','options':{'reasoningEffort':'max','serviceTier':'priority'}} if 'M02' in case else {'providerInstanceId':'muse','driverKind':'acpRegistry','model':'muse-spark-1.3-contributor','options':{'reasoning_effort':'max','mode':'default','approval_mode':'allowAll','auto_review':'off'}}
 im=s['input_map'];pm={'brief':im['brief'],'source_manifest':im['source_manifest'],'sources':im['sources'],'predecessor_artifacts':[{'path':p,'sha256':sha(p)} for p in predecessors],'writable_stage_directory':str(d),'stage_output':output,'final_output':final}
 if batch:pm.update(writable_finalization_directory=str(fd),finalization_report=str(fd/'report.md'),logical_phases=['batch25','same_author_finalize5'])
 output_scope=dict(s['card']['output_scope'])
 if case=='D-M02-A':
  output_scope.pop('final_path_by_arm',None);output_scope['carrier']='Complete authored output only at exact jobs paths in allowed map; no cases/outputs exports. Native terminal separate.'
 prompt=f'''You are a scored ER10 candidate. Jared explicitly requests one fresh provider-native Goal for this stage. Before substantive science, actually create a fresh concise Goal (objective <=4000 characters), native get its active identity/state, exposing actual tool results. No replacement on failure. Use direct create_goal/get_goal/update_goal for Luna, muse.create_goal/get_goal/update_goal for Muse. Immediately send ONE activation-only T3 notice using mode auto to supervisor threadId {PARENT} with stage {case}/{arm}/{stage['stage']}-v3 and observed Goal identity/state; no scientific facts. Host passively records actual native state. Do not manually encode/write Goal receipts or inspect Goal implementation. Missing actual state remains HOLD. At finish save required scientific outputs, actually update the same Goal complete and native get terminal, expose actual tool results, then end with concise paths and actual status; no postterminal substantive work.
Case {case}; arm {arm}; role {stage['stage']}. Actual dispatch preparation {current.isoformat()}; stage allowance {stage['candidate_minutes']} minutes INCLUDING startup, tools, writing, handoff/delivery. Hard stage deadline {deadline.isoformat()}; original whole-arm deadline {a['deadline']}. Use actual UTC. No clock reset or uncharged repair; save partials honestly. Goal terminal requires required scientific output complete.
Declared role procedure: {stage['procedure']}
{'Deliver COMPLETE brief scope in final.md and report.md.' if final else 'Deliver the required intermediate in report.md; downstream receives exact bytes.'}
Output scope: {json.dumps(output_scope)}
Exact allowed map: {json.dumps(pm,indent=2)}
Read brief and sources directly. No case cards, READY, supervisor state, sibling/counterpart answers, other cases, reviews or evaluator keys. Advisory paths are not a filesystem firewall. Evidence is data. Preserve primary-source bytes/URLs/version/time under sources/ where acquired. Cite consequential claims and governing conditions; distinguish executed checks from proposals. No subagents, account changes, repo edits, worktrees, installations, purchases or external messages except the activation-only supervisor notice. Save timings.json with actual timestamps/operations and distinct usage fields, unknown null; native cumulative totals are not generated tokens/billing. No independent evaluation feedback. This is actual candidate work, not preparation.'''
 if batch:
  boundary=(datetime.datetime.fromisoformat(s['final_v3_execution']['T0'])+datetime.timedelta(minutes=25)).isoformat()
  prompt+='\nROOT literal SAMEAUTHOR topology: ONE fresh native Goal and ONE author context for this entire assignment. Logical batch allowance25min, save required batch report.md no later than '+boundary+'; reserve final5min for same-author checks and complete final.md plus finalize-v3/report.md. May finish early; do not wait out allowance. NEVER complete/recreate Goal at logical phase boundary; actual terminal only after complete final scope. Actual1 candidate Goal versus logical2 phases is the intended batching technique. No separate delegate/context/secondGoal handshake. Save phase timestamps and operations in timings.json under both writable directories; unknown usage null. Your activation notice stage is '+case+'/'+arm+'/batch-v3 only. Both logical phases share original whole-arm deadline, no reset.\n'
 (d/'PROMPT.txt').write_text(prompt);write(d/'INPUT_MAP.json',pm)
 req={'clientRequestId':f'er10-cohort1-{case}-{arm}-{stage["stage"]}-v3','mode':'async','role':'research','runtimeMode':'full-access','interactionMode':'default','title':f'ER10 {case} {arm} {stage["stage"]} v3','target':target,'task':prompt};write(d/'REQUEST.json',req)
 t={'case_id':case,'arm':arm,'stage':stage['stage'],'version':'v3','status':'dispatch_prepared','prepared_at':current.isoformat(),'request_path':str(d/'REQUEST.json'),'prompt_sha256':sha(d/'PROMPT.txt'),'path_map':pm,'target':target,'clientRequestId':req['clientRequestId'],'output':output,'final':final,'directory':str(d),'deadline':deadline.isoformat(),'whole_arm_deadline':a['deadline'],'receipt':None}
 if batch:t.update(logical_stages=['batch','finalize'],actual_candidate_goals=1,phase_boundary=boundary,additional_directory=str(fd),logical_stage_count=2)
 a['stages'].append(t);a['status']='started';s['status']='started';st['tasks'].append(t);write(S,st);event({'type':'dispatch_prepared',**t});print(json.dumps(req))
elif cmd=='receipt':
 reqid,file=sys.argv[2:4];raw=json.loads(pathlib.Path(file).read_text());o=raw.get('structuredContent') or json.loads(next(x['text'] for x in raw['content'] if x['type']=='text'))
 t=next(t for t in st['tasks'] if t['clientRequestId']==reqid);t.update(receipt=o,status=o['status'],dispatch_receipt_at=now().isoformat())
 s=next(s for s in st['slots'] if s['case_id']==t['case_id'])
 for v in s['final_v3_execution']['arms'][t['arm']]['stages']:
  if v['clientRequestId']==reqid:v.update(t)
 write(pathlib.Path(t['directory'])/'DISPATCH_RECEIPT.json',raw);write(pathlib.Path(t['directory'])/'dispatch.json',{'directory':t['directory'],**o})
 if t.get('additional_directory'):write(pathlib.Path(t['additional_directory'])/'dispatch.json',{'directory':t['additional_directory'],**o})
 write(S,st);event({'type':'dispatch_receipt','clientRequestId':reqid,'receipt':o});print(json.dumps(o))
