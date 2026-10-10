from pathlib import Path
import json, hashlib, shutil
from datetime import datetime, timezone

ROOT = Path('ER12_RUNTIME')
OUT = ROOT / 'mechanics/terminal-evidence-pass2'
SLOTS = ['B-APPL-M-01', 'B-FINAL-G-01', 'B-APPL-G-01']
def now(): return datetime.now(timezone.utc).isoformat()
def sha(b): return hashlib.sha256(b).hexdigest()
def write(p, x, exclusive=False):
    with p.open('x' if exclusive else 'w') as f: json.dump(x, f, indent=2, ensure_ascii=False); f.write('\n')
def native(p):
    r=json.loads(p.read_text())
    return r.get('structuredContent') or json.loads(r['content'][0]['text'])
def info(p, rel):
    b=p.read_bytes(); st=p.stat()
    return {'path':str(p), 'relative_path':str(rel), 'bytes':len(b), 'sha256':sha(b), 'mtime_ns':st.st_mtime_ns}
def tree_digest(rows):
    # Stable path/length/hash digest; excludes timestamps and absolute paths.
    b=json.dumps([{'path':r['relative_path'],'bytes':r['bytes'],'sha256':r['sha256']} for r in rows],sort_keys=True,separators=(',',':')).encode()
    return {'sha256':sha(b),'algorithm':'SHA-256 of UTF-8 compact sorted-key JSON list of sorted relative path, bytes, SHA-256 records','files':len(rows),'bytes':sum(r['bytes'] for r in rows)}

observations={'schema':'er12-terminal-evidence-pass2-v1','captured_at_utc':now(),'scope':SLOTS,'arms':['treatment'],'science_grade':'NOT_ASSESSED','roles':[], 'limitations':[
    'Only the three named role roots and exact input-map targets were read. No other arm/case files were opened.',
    'Native thread activity is a durable provider projection; receipt evidence is retained verbatim and separate from host filesystem freeze.',
    'Checkpoint items incidentally listed shared-worktree paths outside scope. These were not followed, paginated, or treated as authorship evidence.',
    'No full-tree polling, account projection retry, delegation, dispatch, candidate feedback, Git mutation, account/server change or settling was performed.',
    'task_status is parent-owned and rejected this evidence child for all three tasks. Direct t3_thread_read succeeded; parent completed/no-pending delivery is user-supplied context, not a fabricated task_status receipt.',
    'No billing data or cumulative token-meter definition was exposed. Rounded cache-read summaries are preserved as raw text, not exact billable totals.',
    'Effective reasoning/options are UNKNOWN; dispatch options are requested settings only. Runtime mode and model fields are exposed thread/run metadata.',
    'No descendant inventory is exposed by these thread reads. Absence of delegation in visible activity is not proof of zero descendants.',
    'Initial oversized evidence-save commands for two activity responses failed locally; chunked save then had Python syntax errors. Corrected chunked saves succeeded and JSON validation verifies complete persisted responses. Original science was untouched.'
]}
originals=[]
for slot in SLOTS:
    p=ROOT/'runs'/slot/'treatment/stages/role'
    assert not (p/'terminal-science-freeze.json').exists() and not (p/'task-status.json').exists()
    im=json.loads((p/'input-map.json').read_text())
    # Read all original role bytes and the exact mapped input package, never siblings.
    files=sorted(x for x in p.rglob('*') if x.is_file())
    rows=[info(x,x.relative_to(p)) for x in files]
    dest=OUT/'originals'/slot
    for x,r in zip(files,rows):
        target=dest/x.relative_to(p);target.parent.mkdir(parents=True,exist_ok=True)
        shutil.copy2(x,target)
        assert sha(target.read_bytes())==r['sha256']
        r['preserved_copy']=str(target)
    originals.extend(rows)
    inp=[Path(im['common_assignment']),Path(im['fixture'])]+sorted(x for x in Path(im['corpus']).rglob('*') if x.is_file())
    input_rows=[info(x,x.relative_to(Path(im['common_assignment']).parent)) for x in inp]
    for x in inp: x.read_bytes().decode('utf-8')
    primary='final-section.md' if slot=='B-FINAL-G-01' else 'verification.md'
    (p/primary).read_text(); json.loads((p/'source-map.json').read_text())
    for x in files:
        if x.parent==p/'sources': x.read_bytes().decode('utf-8')
    science=[r for r in rows if r['relative_path'] in [primary,'source-map.json'] or r['relative_path'].startswith('sources/')]
    sources=[r for r in rows if r['relative_path'].startswith('sources/')]
    d1=native(OUT/(slot+'-activity-01.json')); d2=native(OUT/(slot+'-activity-02.json'))
    ds=[d1,d2]
    if slot=='B-APPL-G-01': ds.append(native(OUT/(slot+'-activity-03.json')))
    items=[i for d in ds for i in d['items']]
    thread=d1['thread'];runs=d1['recentRuns']
    requested=json.loads((p/'request.json').read_text())['args']['target']
    accounting={'billing':'UNKNOWN','cumulative_meter_semantics':'UNKNOWN','exact_billable_tokens':'UNKNOWN','effective_options':'UNKNOWN','requested_target':requested,'exposed_thread_model':thread['model'],'runtimeMode':thread['runtimeMode'],'interactionMode':thread['interactionMode'],'raw_usage_summaries':[{'itemId':i['itemId'],'text':i['text']} for i in items if 'cache-read tokens' in (i['text'] or '')]}
    if slot=='B-APPL-M-01':
        receipts={}
        for label,pos in [('activation',32),('terminal',46)]:
            dd=native(OUT/(slot+f'-item-{pos}.json')); item=dd['items'][0]
            assert not item['textTruncated']
            tool=json.loads(item['text']); receipts[label]={'itemId':item['itemId'],'position':pos,'updatedAt':item['updatedAt'],'toolName':tool['toolName'],'input':tool['input'],'actual_output':json.loads(tool['output'])}
        assert receipts['activation']['actual_output']['goal']['goal_id']==receipts['terminal']['actual_output']['goal']['goal_id']
        goal={'evidence_status':'ACTUAL_NATIVE_ACTIVATION_AND_TERMINAL_RECOVERED','receipts':receipts,'science_save_order':'Visible file_change items 33-44 precede native update_goal item 46; host freeze occurs later and is a separate observation.'}
        accounting['native_goal_tokens_used_activation']=0
        accounting['native_goal_tokens_used_terminal']=receipts['terminal']['actual_output']['goal']['tokens_used']
    elif slot=='B-FINAL-G-01':
        goal={'evidence_status':'UNSUPPORTED_CAPABILITY_REPORTED_NO_ACTUAL_GOAL_RECEIPT','activation':'UNKNOWN','terminal':'UNKNOWN','original_authored_limitation':str(p/'goal-record.md'),'diagnostic_native_item':str(OUT/(slot+'-item-27.json')),'native_tool_receipts_found':False,'summary_is_goal_proof':False}
    else:
        goal={'evidence_status':'FAILED_ACTIVATION_ATTEMPTS_NO_ACTUAL_GOAL_RECEIPT','activation':'UNKNOWN','terminal':'UNKNOWN','original_authored_limitation':str(p/'goal_receipt.json'),'original_stderr':str(p/'goal_activation.err'),'original_stdout_bytes':(p/'goal_activation.json').stat().st_size,'actual_diagnostic_items':[str(OUT/(slot+'-item-56.json')),str(OUT/(slot+'-item-59.json'))],'native_tool_receipts_found':False,'summary_is_goal_proof':False,'attempted_cli_descendant':{'status':'argument validation rejection then model creation failure','session_id':'UNKNOWN','goal_id':'UNKNOWN','model_creation_traceId':'456d6e87-fce5-417a-a939-ac93b943e043','actual_descendant_ids_exposed':[]}}
    write(OUT/(slot+'-provider-native-evidence.json'),{'native_goal':goal,'accounting':accounting,'recentRuns':runs})
    frozen=now()
    freeze={'schema':'er12-host-terminal-science-freeze-v1','slot':slot,'arm':'treatment','frozen_at_utc':frozen,'host_observer':'codex-er12-evidence2','original_science_altered':False,'primary_science':primary,'science_files':science,'authored_output_and_source_tree':tree_digest(science),'source_tree':tree_digest(sources),'all_original_role_files':rows,'original_role_tree':tree_digest(rows),'exact_input_map_targets_read_and_hashed':input_rows,'provider_receipt_file':str(OUT/(slot+'-provider-native-evidence.json')),'timestamp_semantics':'Host post-terminal byte observation; not native activation, terminal time, provider receipt, or original author save timestamp.'}
    write(p/'terminal-science-freeze.json',freeze,True)
    taskid='node:delegated-task:command%3Amcp%3A39c31430-71a8-4158-b353-1fe1bb3dad4d%3Adelegate-task%3Aer12-'+slot+'-treatment-role-v1'
    status={'schema':'er12-host-terminal-task-status-v1','observed_at_utc':now(),'taskId':taskid,'childThreadId':thread['threadId'],'task_status_native_call':'OWNERSHIP_ERROR','original_error_file':str(OUT/(slot+'-task-status-native.json')),'thread_status_direct_native':thread['status'],'activeRunId':thread['activeRunId'],'pendingRequestCount':thread['pendingRequestCount'],'recentRuns':runs,'parent_delivery_context':{'source':'user assignment','status':'completed','hasPendingChildRuns':False},'descendants':'UNKNOWN: no descendant list exposed in these reads','native_goal_evidence_status':goal['evidence_status'],'delivered_source_output':'PRESENT_AND_HOST_FROZEN','science_grade':'NOT_ASSESSED'}
    write(p/'task-status.json',status,True)
    observations['roles'].append({'slot':slot,'role_root':str(p),'input_map':im,'primary_science_read_completely':primary,'science_artifacts_present':True,'originals_hashes':rows,'input_hashes':input_rows,'source_tree':tree_digest(sources),'science_tree':tree_digest(science),'host_freeze_file':str(p/'terminal-science-freeze.json'),'host_status_file':str(p/'task-status.json'),'native_goal':goal,'accounting':accounting,'thread_metadata':thread,'recentRuns':runs,'actual_descendants_exposed':'UNKNOWN','activity_terminal_slice_reached':not ds[-1]['hasMore']})
    for r in rows: assert sha(Path(r['path']).read_bytes())==r['sha256'],r['path']
write(OUT/'ORIGINALS-HASHES.json',{'captured_at_utc':now(),'algorithm':'SHA-256 of original file bytes','files':originals})
write(OUT/'ACCOUNTING-LIMITATIONS.json',{'captured_at_utc':now(),'roles':[{'slot':r['slot'],'accounting':r['accounting']} for r in observations['roles']],'limitations':observations['limitations']})
write(OUT/'OBSERVATIONS.json',observations)
for x in OUT.glob('*.json'): json.loads(x.read_text())
write(OUT/'SAVE-VERIFICATION.json',{'verified_at_utc':now(),'all_original_bytes_unchanged':True,'preserved_original_copies_verified':True,'saved_json_parses':True,'three_exclusive_freezes_and_status_files_created':True,'no_science_grade_assigned':True})
print(json.dumps({'saved':str(OUT/'OBSERVATIONS.json'),'roles':len(observations['roles']),'original_files':len(originals),'original_bytes_unchanged':True}))
