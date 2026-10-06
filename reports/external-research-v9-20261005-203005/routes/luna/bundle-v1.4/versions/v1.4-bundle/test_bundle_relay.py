"""Actual DEC010 configured relay tests, synthetic bytes only; no Codex/Goal."""
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
from resource_tool_release import load_tools,TOOLS
from bundle_config import build_bundle_config
from resource_client_relay import ClientToolRelay
from resource_owned_scope_proof import observe_unit,pid_fact,cgroup_fact,unit_quiet


def imported(name,path):
    spec=importlib.util.spec_from_file_location(name,path)
    module=importlib.util.module_from_spec(spec);spec.loader.exec_module(module);return module


def helper(profile_path,workspace,bundle_profile,out,arm):
    profile=resource.load(profile_path);workspace=Path(workspace);out=Path(out)
    outer=resource.own_placement(profile);stop=profile['original_total_stop_monotonic_ns']
    label='SYNTHETIC-LUNA-FINAL-'+arm
    config,binding=build_bundle_config(workspace,Path(profile_path),Path(bundle_profile),label,stop,arm=='treatment',True)
    assert TOOLS.name=='v1.4-bundle' and config['native_bundle_enabled']
    count=5 if arm=='treatment' else 4
    assert len(config['tool_allowlist'])==count
    relay=ClientToolRelay(config,workspace,out/'private',out,stop,Path(profile_path))
    records=[];placements=[outer];helpers=[]
    try:
        assert len([t for namespace in relay.specs for t in namespace['tools']])==count
        assert set(relay.clients)==({'pm_boundary','pm_execution'} if arm=='treatment' else {'pm_boundary'})
        for name in relay.clients:
            record_path=out/(name+'-host-process.json');record=json.loads(record_path.read_text());records.append((name,record_path))
            placements.append(resource.verify(profile,record['unit'],name))
            helpers.extend(resource.verify_pid_placement(record[k],outer['unit_observation']['ControlGroup']) for k in ('guard_pid','service_runner_pid'))
        thread='synthetic-no-native-thread'
        payloads={'proposal.md':'Exact synthetic proposal\r\nα\t  \n','sources.json':'{ "synthetic": true }\n','witnesses.json':'[ ]\n','leads.json':'{\n "synthetic": []\n}\n'}
        bundle={'schema':'er9.native_endorsed_delivery.v1','stage_id':label,'adopt_current':True,
            'artifacts':{name:{'text_utf8':text} for name,text in payloads.items()}}
        raw=json.dumps(bundle,ensure_ascii=False,separators=(',',':')).encode()
        reply=relay.dispatch({'threadId':thread,'turnId':'synthetic','callId':'bundle-native-shaped-call',
            'namespace':'pm_boundary','tool':'write_file','arguments':{'path':'out/final_bundle.json','text':raw.decode()}},thread)
        assert reply['success']
        for name,text in payloads.items():assert (workspace/'out/final'/name).read_bytes()==text.encode()
        assert (workspace/'out/final_bundle.json').read_bytes()==raw
        manifest=json.loads((workspace/'out/final/DELIVERY_MANIFEST.json').read_text())
        assert manifest['native_explicit_adoption'] is True
        assert manifest['stage_id']==label and manifest['bundle_sha256']==hashlib.sha256(raw).hexdigest()
        assert manifest['goal_result']=='INDEPENDENT_NOT_UPDATED' and manifest['source_grade']=='INDEPENDENT_NOT_ASSESSED'
        assert len(manifest['artifacts'])==4
        if arm=='treatment':
            result=relay.dispatch({'threadId':thread,'turnId':'synthetic','callId':'exec',
                'namespace':'pm_execution','tool':'python_execute','arguments':{'code':'print(6 * 7)'}},thread)
            assert result['success']
            execution=json.loads(next((workspace/'operation_receipts/executions').glob('*/result.json')).read_text())
            assert execution['bootstrap_started'] and execution['stdout'].strip()=='42' and execution['exit_code']==0
            assert execution['resource_placement']['verified_before_candidate_bootstrap'] and execution['cleanup_confirmed']
    finally:relay.close()
    quiet=[]
    for name,record_path in records:
        record=json.loads(record_path.read_text());unit=record['unit'];observed=observe_unit(unit,2)
        original=cgroup_fact(record.get('control_group'),unit,profile)
        pids=[pid_fact(record.get(k)) for k in ('guard_pid','native_host_pid','service_runner_pid')]
        absent=unit_quiet(observed,original,pids) and cgroup_fact(observed.get('control_group'),unit,profile)['absent_or_empty']
        assert absent
        quiet.append({'namespace':name,'unit':unit,'quiet':absent})
    receipt={'schema':'er9.luna.bundle-binding-relay-regression.v1','status':'PASS','arm':arm,
        'exact_inventory_count':count,'actual_selected_tools_release':str(TOOLS.name),
        'builder_binding':binding,'native_codex_started':False,'native_thread_created':False,'native_goal_starts':0,
        'native_shaped_call_is_synthetic':True,'atomic_exact_four_payloads_and_manifest':True,
        'independent_goal_source_grade_preserved':True,'resource_placements':placements,
        'retained_helper_placements':helpers,'tool_owned_quiet':quiet,
        'actual_tool_calls':[{'namespace':r['namespace'],'tool':r['tool'],'success':r['success']} for r in relay.calls]}
    (out/'REGRESSION.json').write_text(json.dumps(receipt,indent=2)+'\n')
    return 0


def main():
    if len(sys.argv)>1 and sys.argv[1]=='--helper':return helper(*sys.argv[2:])
    load_tools()
    operator=imported('_er9_operator_synthetic',TOOLS/'operator_binding.py')
    records=[]
    with tempfile.TemporaryDirectory(prefix='er9-bundle-relay-') as temp:
        folder=Path(temp)
        for arm in ('control','treatment'):
            base=folder/arm;base.mkdir();workspace=base/'workspace';workspace.mkdir()
            for name in ('inputs','out'):(workspace/name).mkdir()
            (workspace/'TASK.md').write_text('Synthetic bundle/tool binding only; no native model.\n')
            out=base/'receipts';out.mkdir()
            profile_path=base/'resource.json';profile=resource.allocate('synthetic-bundle-'+arm,time.monotonic_ns(),30,profile_path)
            label='SYNTHETIC-LUNA-FINAL-'+arm
            built=operator.binding(stage_id=label,stage_role='final',case_id='SYNTHETIC-CASE',arm_id=arm,
                method_factors=['V01'],actor_binding={'stage_id':label,'family':'Luna','model':'gpt-6-luna','effort':'max','native_goal_id':None},
                entries=[],complete_final_role=True)
            (workspace/'inputs/delivery_role_manifest.json').write_bytes(built['manifest_bytes'])
            bundle_profile=base/'bundle-profile.json';bundle_profile.write_bytes(built['profile_bytes']);bundle_profile.chmod(0o600)
            try:
                config,_=build_bundle_config(workspace,profile_path,bundle_profile,label,profile['original_total_stop_monotonic_ns'],arm=='treatment',True)
                assert config['native_bundle_enabled']
                try:build_bundle_config(workspace,profile_path,bundle_profile,'WRONG-STAGE',profile['original_total_stop_monotonic_ns'],arm=='treatment',True)
                except ValueError:pass
                else:raise AssertionError('wrong current-stage binding admitted')
                unit='er9-luna-'+uuid.uuid4().hex+'.service'
                p=resource.invoke(['/usr/bin/systemd-run','--user','--quiet','--wait','--unit='+unit,
                    '--slice='+profile['slice_unit'],'--property=MemoryMax='+str(resource.CAPS['outer_worker']),
                    '--property=MemorySwapMax=0','--property=RuntimeMaxSec=25s','--property=KillMode=control-group',
                    '/usr/bin/python3','-I','-B',str(Path(__file__).resolve()),'--helper',str(profile_path),str(workspace),str(bundle_profile),str(out),arm],timeout=28)
                if p.returncode:raise RuntimeError('synthetic bundle relay failed: '+p.stderr)
                receipt=json.loads((out/'REGRESSION.json').read_text())
            finally:
                release=resource.release(profile);assert release['all_private_slice_descendants_quiet']
            receipt['aggregate_release']=release;records.append(receipt)
    p=subprocess.run(['/usr/bin/python3','-B',str(HERE/'dynamic_stage_runner.py')],capture_output=True,text=True)
    assert p.returncode==2 and '--bundle-profile' in p.stderr
    receipt={'schema':'er9.luna.actual-bundle-builder-acceptance.v1','status':'PASS','native_goal_starts':0,
        'test_sha256':hashlib.sha256(Path(__file__).read_bytes()).hexdigest(),
        'actual_tools_source_pins_sha256':hashlib.sha256((TOOLS/'SOURCE_PINS.json').read_bytes()).hexdigest(),
        'mandatory_bundle_cli_arg':True,'wrong_stage_denied_before_tool_launch':True,'arms':records}
    (HERE/'BUNDLE_RELAY_REGRESSION.json').write_text(json.dumps(receipt,indent=2)+'\n')
    print(json.dumps({'status':'PASS','actual_control_tools':4,'actual_treatment_tools':5,'native_goal_starts':0}))
    return 0


if __name__=='__main__':raise SystemExit(main())
