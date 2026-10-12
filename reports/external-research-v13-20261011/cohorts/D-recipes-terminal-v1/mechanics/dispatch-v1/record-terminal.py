"""Record terminal custody pointers; native operations stay in functions.exec."""
import pathlib,json,sys,datetime,hashlib
from terminal_capture_gate import check_direct_terminal
b=pathlib.Path('ER13_RUNTIME')
arm,stage,settle_path=sys.argv[1:4];state=b/'state/dispatcher-v1/arms'/arm
raw_path=state/(stage+'-terminal-task.raw.json');raw=json.loads(raw_path.read_text())
status=raw.get('structuredContent') or json.loads(next(x['text'] for x in raw['content'] if x['type']=='text'))
assert status['status'] in ['completed','failed','cancelled','interrupted'] and status['hasPendingChildRuns'] is False
assert pathlib.Path(settle_path).is_file()
p=b/'state/dispatcher-v1/restart.json';r=json.loads(p.read_text())
assert not any(t['taskId']==status['taskId'] for t in r.get('terminal_owned_tasks',[]))
t=next(t for t in r['active_owned_tasks'] if t['taskId']==status['taskId'])
r['active_owned_tasks']=[x for x in r['active_owned_tasks'] if x['taskId']!=t['taskId']]
terminal={'arm_id':arm,'stage':stage,'taskId':t['taskId'],'childThreadId':t['childThreadId'],'terminal_receipt_path':str(raw_path),'settle_receipt':settle_path,'hasPendingChildRuns_observed':False}
if stage=='component':
    f=json.loads((state/'frozen-selection.json').read_text());terminal['frozen_selection']=str(state/'frozen-selection.json')
    frozen={'arm_id':arm,'stage':stage,'manifest':f['manifest'],'sha256':f['manifest_sha256'],'scope':'FINAL_COMPONENT','missing_required_outputs':f['missing_required_outputs']}
else:
    m=b/'mechanics/dispatch-v1/admitted'/arm/'run'/arm/'control/terminal-handoffs'/stage/'manifest.json'
    terminal['handoff_manifest']=str(m)
    c=json.loads((b/'mechanics/dispatch-v1/admitted'/arm/'configs'/(arm+'.json')).read_text())
    is_final=stage==c['final_stage'];root=m.parent/'files'
    required=c['output_selection'][stage]+['native-goal-create.json','native-goal-active.json','native-goal-terminal.json']
    missing=[n for n in required if not(root/n).is_file()]
    aux_missing=[]
    if arm.startswith(('C-','D-')):
        aux=json.loads((state/(stage+'-capture-aux-freeze.json')).read_text());aux_missing=aux['missing_auxiliary_files'];terminal['capture_auxiliary_freeze']=str(state/(stage+'-capture-aux-freeze.json'))
    frozen={'arm_id':arm,'stage':stage,'manifest':str(m),'sha256':hashlib.sha256(m.read_bytes()).hexdigest(),'scope':'FINAL_FULL' if is_final else 'STAGE_NOT_FINAL','missing_required_outputs':missing}
    if arm.startswith(('C-','D-')):frozen['capture_auxiliary_freeze']=str(state/(stage+'-capture-aux-freeze.json'));frozen['missing_capture_auxiliary_files']=aux_missing
    native_binding=False;native_error=None
    if not missing:
        try:
            birth=json.loads((root/'native-goal-create.json').read_text())['goal'];end_goal=json.loads((root/'native-goal-terminal.json').read_text())['goal'];binding=json.loads((root/'freeze.json').read_text())
            native_binding=all(birth[k]==end_goal[k] for k in ['threadId','createdAt','objective']) and birth['objective']==binding['native_goal_objective'] and end_goal['status']=='complete'
        except (KeyError,ValueError,TypeError) as exc:native_error=str(exc)
    frozen['native_same_birth_exact_objective_complete']=native_binding
    direct_capture=True
    if arm.startswith('D-'):
        original_stage=b/'mechanics/dispatch-v1/admitted'/arm/'run'/arm/'stages'/stage
        direct=check_direct_terminal(pathlib.Path(aux['manifest']).parent,root/'native-goal-terminal.json',(original_stage/'native-terminal-capture-failed.json').exists())
        direct_capture=direct['qualified'];frozen['native_direct_completion_capture_qualified']=direct_capture;frozen['direct_completion_capture_check']=direct
    if status['status']!='completed' or missing or aux_missing or not native_binding or not direct_capture:
        failure=state/(stage+'-terminal-mechanics-failure.json')
        failure.open('x').write(json.dumps({'arm_id':arm,'stage':stage,'actual_task_status':status['status'],'hasPendingChildRuns':False,'missing_required_outputs':missing,'missing_capture_auxiliary_files':aux_missing,'native_same_birth_exact_objective_complete':native_binding,'native_direct_completion_capture_qualified':direct_capture if arm.startswith('D-') else 'NOT_APPLICABLE_HISTORICAL','native_parse_error':native_error,'next_stage_eligible':False,'science_grade':'UNASSESSED','original_failure_preserved':True},indent=2)+'\n')
        if not any(x['arm_id']==arm for x in r.get('original_failed_arms',[])):
            r.setdefault('original_failed_arms',[]).append({'arm_id':arm,'failure_record':str(failure),'next_stage_held':True,'root_coordination_notified':False})
    original=b/'mechanics/dispatch-v1/admitted'/arm/'run'/arm/'stages'/stage
    fr=json.loads((original/'freeze.json').read_text());dl=datetime.datetime.fromisoformat(fr['stage_deadline_utc'].replace('Z','+00:00'))
    if (original/'native-goal-terminal.json').exists():
        try:
            ng=json.loads((original/'native-goal-terminal.json').read_text())['goal'];end=ng.get('updatedAt')
        except (KeyError,ValueError,TypeError,AttributeError) as exc:
            frozen['native_terminal_parse_error']=str(exc);end=None
        late=isinstance(end,(int,float)) and datetime.datetime.fromtimestamp(end,datetime.timezone.utc)>dl
        frozen['native_terminal_after_original_deadline']=late
        if late:
            failure=state/(stage+'-deadline-failure-observation.json')
            failure.open('x').write(json.dumps({'arm_id':arm,'stage':stage,'declared_deadline':fr['stage_deadline_utc'],'actual_native_updatedAt':end,'next_stage_time_eligible':False,'source_grade':'UNASSESSED','original_failure_preserved':True},indent=2)+'\n')
            if not any(x['arm_id']==arm for x in r.get('original_failed_arms',[])):
                r.setdefault('original_failed_arms',[]).append({'arm_id':arm,'failure_record':str(failure),'next_stage_held':True,'root_coordination_notified':False})
r.setdefault('terminal_owned_tasks',[]).append(terminal);r['freezes'].append(frozen)
r['updated_at']=datetime.datetime.now(datetime.timezone.utc).isoformat();r['last_turn_classification']='progress:terminal native/task custody frozen and child settled'
p.write_text(json.dumps(r,indent=2)+'\n')
print(json.dumps({'active_count':len(r['active_owned_tasks']),'native_starts':r['candidate_native_starts']}))
