"""Actual private-guard/source relay clock tests. Synthetic only, zero native."""
import hashlib
import importlib.util
import json
import os
from pathlib import Path
import subprocess
import sys
import tempfile
import time
import uuid

HERE=Path(__file__).resolve().parent;ROOT=HERE.parents[1]
sys.path.insert(0,str(ROOT));sys.path.insert(0,str(HERE))
import resource_slice as resource
from clock_prepare import prepare_stage
from clock_declaration import declaration
from resource_tool_release import load_tools,TOOLS
from resource_client_relay import ClientToolRelay
from resource_owned_scope_proof import observe_unit,pid_fact,cgroup_fact,unit_quiet


def load(name,path):
    spec=importlib.util.spec_from_file_location(name,path);m=importlib.util.module_from_spec(spec);spec.loader.exec_module(m);return m


def helper(resource_path,workspace,private,decl,out,label,bundle_path,execution):
    profile=resource.load(resource_path);workspace=Path(workspace);private=Path(private);out=Path(out)
    outer=resource.own_placement(profile);birth=profile['original_birth_monotonic_ns'];total=profile['original_total_stop_monotonic_ns']
    action=total-15_000_000_000;seconds=(total-birth)//1_000_000_000
    scientific='SYNTHETIC firsttext α\r\n\t '
    task_before=(workspace/'TASK.md').read_bytes()
    prepared=prepare_stage(workspace=workspace,private=private,label=label,original_birth_monotonic_ns=birth,
        max_seconds=seconds,native_stop_monotonic_ns=action,total_stop_monotonic_ns=total,resource_profile=Path(resource_path),
        clock_declaration=Path(decl),clock_declaration_sha256=hashlib.sha256(Path(decl).read_bytes()).hexdigest(),
        execution_enabled=execution=='true',public_get=True,bundle_profile=Path(bundle_path) if bundle_path!='none' else None,
        scientific_body=scientific,goal_objective=scientific,source_prompt_sha256=hashlib.sha256(scientific.encode()).hexdigest(),
        source_TASK_sha256=hashlib.sha256(task_before).hexdigest())
    config=prepared['config'];relay=ClientToolRelay(config,workspace,out/'relay-private',out,total,Path(resource_path))
    count=5 if execution=='true' else 4
    assert len([t for ns in relay.specs for t in ns['tools']])==count
    assert prepared['native_input'][0]['text']==scientific
    assert prepared['native_input'][1]['text']==(workspace/'inputs/STAGE_CLOCK.json').read_text()
    captures={};placements=[outer];helpers=[];records=[];responses=[]
    for namespace,client in relay.clients.items():
        original_call=client.call
        def capture(method,params,original=original_call,name=namespace):
            value=original(method,params);captures[name]=value;return value
        client.call=capture
        record_path=out/(namespace+'-host-process.json');record=json.loads(record_path.read_text());records.append((namespace,record_path))
        placements.append(resource.verify(profile,record['unit'],namespace))
        helpers.extend(resource.verify_pid_placement(record[k],outer['unit_observation']['ControlGroup']) for k in ('guard_pid','service_runner_pid'))
    thread='SYNTHETIC_NO_NATIVE_THREAD'
    def call(namespace,tool,args,success):
        reply=relay.dispatch({'threadId':thread,'turnId':'synthetic','callId':'synthetic-'+str(len(responses)),
            'namespace':namespace,'tool':tool,'arguments':args},thread)
        wire=captures[namespace]
        assert len(wire['content'])==2 and len(reply['contentItems'])==2
        assert [item['text'] for item in reply['contentItems']]==[item['text'] for item in wire['content']]
        assert reply['success'] is success and wire['isError'] is (not success)
        clock=json.loads(reply['contentItems'][1]['text'])['stage_clock']
        assert clock['stage_id']==label and clock['action_deadline_status']=='KNOWN'
        assert clock['original_birth_monotonic_ns']==birth and clock['original_candidate_action_deadline_monotonic_ns']==action
        assert clock['original_total_cleanup_stop_monotonic_ns']==total and clock['remaining_candidate_action_ms']<=(seconds-15)*1000
        assert clock['remaining_candidate_action_ms']!=(total-clock['observation_monotonic_ns'])//1_000_000
        responses.append({'namespace':namespace,'tool':tool,'success':success,
            'original_business_text_sha256':hashlib.sha256(wire['content'][0]['text'].encode()).hexdigest(),
            'forwarded_business_text_sha256':hashlib.sha256(reply['contentItems'][0]['text'].encode()).hexdigest(),
            'clock_second_text_sha256':hashlib.sha256(reply['contentItems'][1]['text'].encode()).hexdigest(),
            'remaining_action_ms':clock['remaining_candidate_action_ms']})
        return json.loads(reply['contentItems'][0]['text']) if success else None
    try:
        read=call('pm_boundary','read_file',{'path':'TASK.md'},True)
        clockfile=call('pm_boundary','read_file',{'path':'inputs/STAGE_CLOCK.json'},True)
        call('pm_boundary','write_file',{'path':'out/ordinary.txt','text':'synthetic exact\r\nα\t '},True)
        assert (workspace/'out/ordinary.txt').read_bytes()=='synthetic exact\r\nα\t '.encode()
        call('pm_boundary','mechanical',{'operation':'line_map','source':'TASK.md','output':'out/map.txt'},True)
        call('pm_boundary','public_https_get',{'url':'http://invalid.example/NO_NETWORK'},False)
        call('pm_boundary','read_file',{'path':'/runtime/clock_profile.json'},False)
        if execution=='true':
            business=call('pm_execution','python_execute',{'code':'print(sum(data))','data':[20,22]},True)
            assert business['stdout']=='42\n' and business['exit_code']==0 and business['bootstrap_started'] and business['cleanup_confirmed']
            saved=json.loads((workspace/'operation_receipts/executions'/business['execution_id']/'result.json').read_bytes())
            assert saved==business and 'stage_clock' not in business
            call('pm_execution','python_execute',{'path':'DENIED'},False)
        if bundle_path!='none':
            payloads={'proposal.md':'Exact synthetic proposal\r\nα\t  \n','sources.json':'{ "synthetic": true }\n','witnesses.json':'[ ]\n','leads.json':'{\n "synthetic": []\n}\n'}
            bundle={'schema':'er9.native_endorsed_delivery.v1','stage_id':label,'adopt_current':True,
                'artifacts':{name:{'text_utf8':text} for name,text in payloads.items()}}
            raw=json.dumps(bundle,ensure_ascii=False,separators=(',',':')).encode()
            business=call('pm_boundary','write_file',{'path':'out/final_bundle.json','text':raw.decode()},True)
            assert (workspace/'out/final_bundle.json').read_bytes()==raw
            for name,text in payloads.items():assert (workspace/'out/final'/name).read_bytes()==text.encode()
            manifest=json.loads((workspace/'out/final/DELIVERY_MANIFEST.json').read_text())
            assert manifest['native_explicit_adoption'] and manifest['goal_result']=='INDEPENDENT_NOT_UPDATED'
            assert manifest['source_grade']=='INDEPENDENT_NOT_ASSESSED' and len(manifest['artifacts'])==4
        else:assert not (workspace/'out/final').exists()
    finally:relay.close()
    quiet=[]
    for name,path in records:
        record=json.loads(path.read_text());unit=record['unit'];facts=observe_unit(unit,2)
        original=cgroup_fact(record.get('control_group'),unit,profile)
        pids=[pid_fact(record.get(k)) for k in ('guard_pid','native_host_pid','service_runner_pid')]
        absent=unit_quiet(facts,original,pids) and cgroup_fact(facts.get('control_group'),unit,profile)['absent_or_empty']
        assert absent;quiet.append({'namespace':name,'unit':unit,'quiet':True})
    assert (workspace/'TASK.md').read_bytes()==task_before
    receipt={'schema':'er9.luna.actual-clock-relay-binding-regression.v1','status':'PASS','stage_id':label,
        'bundle_enabled':bundle_path!='none','actual_inventory_count':count,'actual_tools_release':'v1.5-clock-telemetry',
        'original_clock':prepared['original_clock'],'input_binding':prepared['input_binding'],
        'actual_initial_input_fixture_two_texts':True,'scientific_prefix_unchanged':True,
        'responses':responses,'private_guard_placements':placements,'retained_helper_placements':helpers,'owned_quiet':quiet,
        'native_codex_started':False,'native_thread_created':False,'native_goal_starts':0,
        'native_shaped_calls_are_synthetic':True,'source_business_payload_no_clock_merge':True}
    (out/'REGRESSION.json').write_text(json.dumps(receipt,indent=2)+'\n')
    return 0


def main():
    if len(sys.argv)>1 and sys.argv[1]=='--helper':return helper(*sys.argv[2:])
    load_tools();operator=load('_er9_v15_operator_fixture',TOOLS/'operator_binding.py');results=[]
    with tempfile.TemporaryDirectory(prefix='er9-l15-relay-') as temp:
        folder=Path(temp)
        for bundle,execution in [(False,False),(False,True),(True,False),(True,True)]:
            mode=('B' if bundle else 'CORE')+('-T' if execution else '-C');base=folder/mode;base.mkdir()
            workspace=base/'workspace';workspace.mkdir()
            for name in ('inputs','out'):(workspace/name).mkdir()
            (workspace/'TASK.md').write_bytes(b'SYNTHETIC local clock source fixture\r\n')
            private=base/'private';private.mkdir();out=base/'receipts';out.mkdir();label='SYNTHETIC-L15-'+mode
            resource_path=base/'resource.json';profile=resource.allocate(label,time.monotonic_ns(),600,resource_path)
            decl=base/'declaration.json';decl.write_text(json.dumps(declaration(label)))
            bundle_path='none'
            if bundle:
                built=operator.binding(stage_id=label,stage_role='final',case_id='SYNTHETIC',arm_id='treatment' if execution else 'control',method_factors=['V01'],
                    actor_binding={'stage_id':label,'family':'Luna','model':'gpt-6-luna','effort':'max','native_goal_id':None},entries=[],complete_final_role=True)
                (workspace/'inputs/delivery_role_manifest.json').write_bytes(built['manifest_bytes'])
                bundle_path=base/'bundle.json';bundle_path.write_bytes(built['profile_bytes']);bundle_path.chmod(0o600)
            try:
                unit='er9-luna-'+uuid.uuid4().hex+'.service'
                proc=resource.invoke(['/usr/bin/systemd-run','--user','--quiet','--wait','--unit='+unit,
                    '--slice='+profile['slice_unit'],'--property=MemoryMax='+str(resource.CAPS['outer_worker']),
                    '--property=MemorySwapMax=0','--property=RuntimeMaxSec=25s','--property=KillMode=control-group',
                    '/usr/bin/python3','-I','-B',str(Path(__file__).resolve()),'--helper',str(resource_path),str(workspace),str(private),str(decl),str(out),label,str(bundle_path),'true' if execution else 'false'],timeout=28)
                if proc.returncode:raise RuntimeError('synthetic clock relay failed: '+proc.stderr)
                receipt=json.loads((out/'REGRESSION.json').read_text())
            finally:
                released=resource.release(profile);assert released['all_private_slice_descendants_quiet']
            receipt['aggregate_release']=released;results.append(receipt)
    receipt={'schema':'er9.luna.actual-v15-core-B-clock-binding-acceptance.v1','status':'PASS',
        'test_sha256':hashlib.sha256(Path(__file__).read_bytes()).hexdigest(),'modes':results,
        'tools_source_pins_sha256':hashlib.sha256((TOOLS/'SOURCE_PINS.json').read_bytes()).hexdigest(),
        'native_goal_starts':0,'native_codex_processes':0,'business_payload_and_initial_text_byte_proof':True}
    (HERE/'CLOCK_RELAY_REGRESSION.json').write_text(json.dumps(receipt,indent=2)+'\n')
    print(json.dumps({'status':'PASS','modes':4,'control_tools':4,'treatment_tools':5,'native_goal_starts':0}))
    return 0


if __name__=='__main__':raise SystemExit(main())
