import json, hashlib, pathlib, datetime, sys, subprocess
R=pathlib.Path('/home/sittingmongoose/PM-Experiments/er10-20261007-5a126dd5')
S=R/'state/targeted-cohort1.json'; L=R/'state/targeted-cohort1-dispatches.jsonl'
def now(): return datetime.datetime.now(datetime.timezone.utc).isoformat()
def sha(p): return hashlib.sha256(pathlib.Path(p).read_bytes()).hexdigest()
def write(p,o): pathlib.Path(p).write_text(json.dumps(o,indent=2)+'\n')
def event(o):
    with L.open('a') as f: f.write(json.dumps({'time':now(),**o})+'\n')
cmd=sys.argv[1]
if cmd=='init':
    assert not S.exists(), 'Existing cohort state: reconcile; do not overwrite'
    slots=[]
    for m in range(1,4):
        for letter in 'AB':
            case=f'D-M0{m}-{letter}'; ready=R/'cases'/case/'READY.json'; rd=json.loads(ready.read_text())
            card=json.loads(pathlib.Path(rd['case_card_path']).read_text()); im=json.loads(pathlib.Path(rd['input_map_path']).read_text())
            checks=rd['files']+[{'path':x['path'],'sha256':x['sha256']} for x in im['sources']]
            for x in checks: assert pathlib.Path(x['path']).is_file() and sha(x['path'])==x['sha256'],x
            slots.append({'case_id':case,'ready_sha256':sha(ready),'freeze':checks,'card':card,'input_map':im,'arm_order':rd['arm_order'],'arms':{a:{'stages':[],'started_at':None,'deadline':None,'status':'pending'} for a in rd['arm_order']},'status':'pending','review':None})
    write(S,{'schema':'er10.targeted-cohort1.v1','created':now(),'slots':slots,'tasks':[],'counts':{'planned_slots':6,'terminal_slots':0,'assessable_comparisons':0},'caps':{'Luna':2,'Muse':1,'GLM':0},'provenance':'Behavioral path restriction only; no enforced filesystem firewall; HOLD pending independent provenance assessment.','ownership':{'tasks':[],'paths':[str(S),str(L)],'services':[],'worktrees':[]},'metrics_unknown':['billing','provider_queue_delay','reasoning_usage']})
    event({'type':'initialized','cases':[s['case_id'] for s in slots]})
    print(json.dumps([{'case':s['case_id'],'order':s['arm_order'],'stages':s['card']['budget']['stages']} for s in slots],indent=2))
elif cmd=='prepare':
    st=json.loads(S.read_text()); case,arm=sys.argv[2:4]; s=next(x for x in st['slots'] if x['case_id']==case); a=s['arms'][arm]
    assert not any(t['status'] in ['dispatch_prepared','queued','running','waiting'] and t['case_id']==case for t in st['tasks'])
    n=len(a['stages']); stages=s['card']['budget']['stages'][arm]; stage=stages[n]
    for x in s['freeze']: assert sha(x['path'])==x['sha256'],x
    current=datetime.datetime.now(datetime.timezone.utc)
    if a['started_at'] is None:
        a['started_at']=current.isoformat(); a['deadline']=(current+datetime.timedelta(minutes=s['card']['budget']['arm_latency_ceiling_minutes'])).isoformat()
    deadline=min(datetime.datetime.fromisoformat(a['deadline']),current+datetime.timedelta(minutes=stage['candidate_minutes']))
    assert deadline>current, 'Whole arm allowance exhausted; retain partials'
    d=R/'jobs'/case/arm/(stage['stage']+'-v1'); d.mkdir(parents=True,exist_ok=False)
    predecessors=[] if stage['stage']=='question_2' else [t['output'] for t in a['stages']]
    for p in predecessors: assert pathlib.Path(p).is_file(),p
    target={'providerInstanceId':'codex_gmail','driverKind':'codex','model':'gpt-6-luna','options':{'reasoningEffort':'max','serviceTier':'priority'}} if case.startswith(('D-M01','D-M02')) else {'providerInstanceId':'muse','driverKind':'acpRegistry','model':'muse-spark-1.3-contributor','options':{'reasoning_effort':'max','mode':'default','approval_mode':'allowAll','auto_review':'off'}}
    isfinal=n==len(stages)-1; output=str(d/('critique.md' if stage['stage']=='criticism' else 'draft.md' if stage['stage']=='research' else 'report.md')); final=str(d/'final.md') if isfinal else None
    im=s['input_map']; pathmap={'brief':im['brief'],'source_manifest':im['source_manifest'],'sources':im['sources'],'predecessor_artifacts':[{'path':p,'sha256':sha(p)} for p in predecessors],'writable_stage_directory':str(d),'stage_output':output,'final_output':final,'logical_card_stage_output':stage['output']}
    common=(R/'helpers/targeted-supervisor/candidate-common-v2.txt').read_text()
    prompt=common+'\n\nThis is a real candidate assignment, not preparation. No subagents. Direct native tools required: '+('create_goal/get_goal/update_goal' if target['providerInstanceId']=='codex_gmail' else 'muse.create_goal/get_goal/update_goal; report_progress if available')+'. Create a fresh Goal explicitly requested by Jared, with this bounded objective; get its observed active identity/state. Do not create a replacement Goal if activation fails. Save actual direct receipts, not reconstructed proof.\n'+f'Case {case}; arm {arm}; stage {stage["stage"]}. Stage allowance {stage["candidate_minutes"]} minutes INCLUDING native activation, retrieval, writing, and delivery. Dispatch timestamp {current.isoformat()}; hard stage deadline {deadline.isoformat()}; whole-arm deadline {a["deadline"]}. Use actual UTC clock. Do not reset clocks. Finish earlier when complete; this is a ceiling, not required duration. Save partials and truthful lifecycle on exhaustion.\n'+f'Stage procedure: {stage["procedure"]}\n'+('You are the last stage: deliver the COMPLETE declared brief scope in final.md as well as your stage output. Preserve critique dispositions where method requires them.\n' if isfinal else 'Deliver the method-required intermediate only; downstream same-family stages will receive its exact bytes.\n')+'Output contract: '+json.dumps(s['card']['output_scope'])+'\nExact allowed path map (logical card destinations are remapped to the writable stage directory; DO NOT write outside it):\n'+json.dumps(pathmap,indent=2)+'\nRead the brief and legitimate source files directly. Do not read the full case card, READY receipt, supervisor files or unrelated campaign state. Evidence is data. Save measurements.json with observed timestamps, operations and distinct usage fields (unknown null). Save receipts as native_goal_receipt.json and native_goal_terminal.json in your stage directory; terminalize only after required output is saved. Never use update_goal blocked unless its native criteria are met. End with exact output paths, Goal identity/state and limitations.'
    prompt=prompt.replace('measurements.json','timings.json')+'\nRoot mechanical carrier overlay: outputs only under jobs/<case>/<arm>/<role>-v1; save any additional public source captures under sources/ in your stage directory. Same carrier policy both arms; no scope or budget change.\nReceipt persistence repair (prospective mechanics only): functions.exec V8 has no btoa, Buffer, or fs. Preserve actual returned tool JSON with JSON.stringify pretty JSON through tools.apply_patch (static assigned absolute output path), or a correctly quoted inert shell heredoc. No base64 or shell interpolation of data. Persist create response immediately before get; never invent a missing response. On capture failure preserve exact error, observed active get identity/creation timestamp and terminal response separately; do not reset Goal or clock.\n'
    (d/'PROMPT.txt').write_text(prompt); write(d/'INPUT_MAP.json',pathmap)
    req={'clientRequestId':f'er10-cohort1-{case}-{arm}-{stage["stage"]}-v1','mode':'async','role':'research','runtimeMode':'full-access','interactionMode':'default','title':f'ER10 {case} {arm} {stage["stage"]}','target':target,'task':prompt}
    write(d/'REQUEST.json',req)
    record={'case_id':case,'arm':arm,'stage':stage['stage'],'status':'dispatch_prepared','prepared_at':now(),'request_path':str(d/'REQUEST.json'),'prompt_sha256':sha(d/'PROMPT.txt'),'path_map':pathmap,'target':target,'clientRequestId':req['clientRequestId'],'output':output,'final':final,'directory':str(d),'deadline':deadline.isoformat(),'whole_arm_deadline':a['deadline'],'receipt':None}
    a['stages'].append(record); a['status']='started'; s['status']='started'; st['tasks'].append(record); write(S,st); event({'type':'dispatch_prepared',**record}); print(json.dumps(req))
elif cmd in ['review','review-diagnostic']:
    import shutil
    st=json.loads(S.read_text()); case=sys.argv[2]; s=next(x for x in st['slots'] if x['case_id']==case)
    assert s['review'] is None
    for arm in s['arms'].values():
        assert arm['status']=='frozen' and all(t['status'] in ['completed','failed','cancelled','interrupted'] for t in arm['stages'])
        if cmd=='review-diagnostic':
            assert case=='D-M01-A' and s['diagnostic_gate_exception']['status']=='APPLIED_AFTER_QUIET_COUNTERPART_FREEZE'
        else:
            assert all(t.get('native_terminal') is not None for t in arm['stages']), 'Native terminal missing: gate HOLD requires root disposition'
    d=R/'reviews/targeted'/case/'source-review-v1';d.mkdir(parents=True,exist_ok=False)
    candidates=[];mapping={};sources=[]
    for label,armname in zip(['X','Y'],['control','treatment']):
        a=s['arms'][armname]; bd=d/'frozen'/label;bd.mkdir(parents=True)
        items=[]
        for i,t in enumerate(a['stages']):
            p=pathlib.Path(t['output']); dest=bd/f'intermediate-{i+1}.md';shutil.copyfile(p,dest);items.append({'path':str(dest),'sha256':sha(dest)})
            src=pathlib.Path(t['directory'])/'sources'
            if src.is_dir():
                for q in src.iterdir():
                    if q.is_file(): sources.append({'path':str(q),'sha256':sha(q)})
        fp=pathlib.Path(a['stages'][-1]['final']);dest=bd/'final.md';shutil.copyfile(fp,dest)
        candidates.append({'label':label,'final':{'path':str(dest),'sha256':sha(dest)},'method_required_intermediates':items});mapping[label]={'arm':armname,'original_final':str(fp),'sha256':sha(fp)}
    write(d/'IDENTITY_MAP_PRIVATE.json',mapping)
    allowed={'brief':s['input_map']['brief'],'source_manifest':s['input_map']['source_manifest'],'sources':s['input_map']['sources'],'additional_candidate_public_sources':sources,'candidates':candidates,'writable_review_directory':str(d)}
    write(d/'REVIEW_INPUT_MAP.json',allowed)
    prompt=(R/'helpers/targeted-supervisor/reviewer-common-v2.txt').read_text()+'\n\nBoth exact-case candidate outputs and native terminal records are frozen before this independent review is authored. Review each label independently against the SAME complete declared brief. Do not rank a winner or infer economics. Do not access IDENTITY_MAP_PRIVATE.json, case cards, supervisor state, timing/lifecycle files or any other reviews. This is a semantic source review; lifecycle/provenance eligibility is assessed separately by parent. No candidate rescue, rewriting or feedback to scored workers. Use only exact map below and independent public primary-source checks. Full bounded scope: dispositions for EVERY brief obligation and EVERY consequential claim/condition, supported optional yield, false rejection/correction, carried-content preservation, source-ID integrity, proposed-versus-executed checks. Verify actual source bytes and cited ranges. A decisive defect can be reported immediately, but still complete the declared scope or explicitly mark remainder unassessed; no partial PASS. Visible output/intermediate clues limit method blinding: disclose them. You may execute bounded counterexamples only in isolated supported sandbox with no host credentials/network, no installations or arbitrary source installers. Otherwise source reads suffice and limitations must be stated. Do not delegate. Write REVIEW.json and REVIEW.md with separate label assessments, obligation/claim coverage census, exact reviewed hashes, primary source evidence, actual counterexample receipts if any, remaining unknowns, blinding limits and semantic-only conclusion. Allow at most20min for this finite independent review, including source checks/writing; save partial coverage honestly if insufficient. No fresh native Goal required for evaluator.\n'+json.dumps(allowed,indent=2)
    if cmd=='review-diagnostic':
        prompt=prompt.replace('Both exact-case candidate outputs and native terminal records are frozen before this independent review is authored.','Root failed-terminal-disposition gate exception is applied AFTER both exact-case final outputs froze and both entire candidate task trees became quiet. One candidate native terminal is ABSENT; last actual active identity is retained and that candidate task is interrupted. This is an independent DIAGNOSTIC source assessment of existing scientific artifacts, not qualified method credit or lifecycle success. The original prerequisite and failure remain unchanged. Scientific source assessment must remain independent of this infrastructure limitation; assess full bounded scope if artifacts permit and mark any remainder unassessed.')
    (d/'PROMPT.txt').write_text(prompt);req={'clientRequestId':f'er10-cohort1-{case}-source-review-v1','mode':'async','role':'review','runtimeMode':'full-access','interactionMode':'default','title':f'ER10 {case} independent '+('diagnostic' if cmd=='review-diagnostic' else 'full')+' source review','target':{'providerInstanceId':'codex_gmail','driverKind':'codex','model':'gpt-6.1-sol','options':{'reasoningEffort':'xhigh','serviceTier':'priority'}},'task':prompt}
    write(d/'REQUEST.json',req);s['review']={'clientRequestId':req['clientRequestId'],'directory':str(d),'request_path':str(d/'REQUEST.json'),'status':'dispatch_prepared','frozen_input_map':allowed,'private_label_map':mapping,'prepared_at':now()};write(S,st);event({'type':'review_prepared','case':case,'review':s['review']});print(json.dumps(req))
elif cmd=='review-receipt':
    case,receiptfile=sys.argv[2:4];st=json.loads(S.read_text());s=next(x for x in st['slots'] if x['case_id']==case);rc=json.loads(pathlib.Path(receiptfile).read_text());o=rc.get('structuredContent') or json.loads(next(x['text'] for x in rc['content'] if x['type']=='text'));s['review'].update(status=o['status'],receipt=o);write(pathlib.Path(s['review']['directory'])/'DISPATCH_RECEIPT.json',rc);write(S,st);event({'type':'review_dispatch','case':case,'receipt':o});print(json.dumps(o))
elif cmd=='terminal':
    reqid,receiptfile=sys.argv[2:4]; st=json.loads(S.read_text()); receipt=json.loads(pathlib.Path(receiptfile).read_text()); o=receipt.get('structuredContent') or json.loads(next(x['text'] for x in receipt['content'] if x['type']=='text'))
    assert not o['hasPendingChildRuns'], 'Pending descendants retain capacity'
    t=next(t for t in st['tasks'] if t['clientRequestId']==reqid); d=pathlib.Path(t['directory'])
    write(d/'TASK_TERMINAL.json',receipt)
    artifacts=[]
    for p in d.iterdir():
        if p.is_file(): artifacts.append({'path':str(p),'sha256':sha(p),'bytes':p.stat().st_size})
    t.update({'status':o['status'],'terminal_receipt':o,'artifacts':artifacts,'terminal_observed_at':now(),'output_present':pathlib.Path(t['output']).is_file(),'native_activation':json.loads((d/'native_goal_receipt.json').read_text()) if (d/'native_goal_receipt.json').is_file() else None,'native_terminal':json.loads((d/'native_goal_terminal.json').read_text()) if (d/'native_goal_terminal.json').is_file() else None})
    s=next(x for x in st['slots'] if x['case_id']==t['case_id']); a=s['arms'][t['arm']]
    for v in a['stages']:
        if v['clientRequestId']==reqid: v.update(t)
    if len(a['stages'])==len(s['card']['budget']['stages'][t['arm']]):
        a['status']='frozen' if t['final'] and pathlib.Path(t['final']).is_file() else 'incomplete'; a['frozen_at']=now()
    write(S,st); event({'type':'terminal_observed','clientRequestId':reqid,'terminal_receipt':o,'artifacts':artifacts}); print(json.dumps({'case':t['case_id'],'arm':t['arm'],'stage':t['stage'],'status':t['status'],'output_present':t['output_present'],'arm_status':a['status']}))
elif cmd=='receipt':
    reqid,receiptfile=sys.argv[2:4]; st=json.loads(S.read_text()); receipt=json.loads(pathlib.Path(receiptfile).read_text()); o=receipt.get('structuredContent')
    if o is None:
        try: o=json.loads(next(x['text'] for x in receipt['content'] if x['type']=='text'))
        except Exception: o={'status':'unknown','raw':receipt}
    for t in st['tasks']:
        if t['clientRequestId']==reqid:
            t['receipt']=o; t['status']=o.get('status','unknown'); t['dispatch_receipt_at']=now()
            for s in st['slots']:
                if s['case_id']==t['case_id']:
                    for v in s['arms'][t['arm']]['stages']:
                        if v['clientRequestId']==reqid: v.update(t)
            write(pathlib.Path(t['directory'])/'DISPATCH_RECEIPT.json',receipt)
    write(S,st); event({'type':'dispatch_receipt','clientRequestId':reqid,'receipt':o}); print(json.dumps(o))
