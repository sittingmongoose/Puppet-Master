"""Actual confined tool/guardian resource integration; no Codex or model calls."""
import importlib.util
import json
import os
from pathlib import Path
import subprocess
import sys
import tempfile
import time
import uuid
import hashlib

HERE=Path(__file__).resolve().parent
ROOT=HERE.parents[1]
sys.path.insert(0,str(ROOT));sys.path.insert(0,str(HERE))
import resource_slice as resource
from resource_tool_release import load_tools,TOOLS
from resource_client_relay import ClientToolRelay
from resource_owned_scope_proof import prove


def helper(profile_path,workspace,out):
    profile=resource.load(profile_path);workspace=Path(workspace);out=Path(out)
    outer=resource.own_placement(profile)
    stop=profile['original_total_stop_monotonic_ns']
    config=load_tools().mcp_configs(workspace,execution_enabled=True,public_get=True,
                                    deadline_monotonic_ns=stop,resource_profile_path=Path(profile_path))
    private=out/'relay-private';relay=None;native=None;r,w=os.pipe()
    env={**os.environ,'PM_BOUND_DEADLINE_NS':str(stop)}
    try:
        relay=ClientToolRelay(config,workspace,private,out,stop,Path(profile_path))
        native=subprocess.Popen(['/usr/bin/python3','-I','-B',str(HERE/'resource_host_guard.py'),
            profile_path,'native',str(r),str(stop),str(out/'host-process.json'),'--',
            '/usr/bin/python3','-I','-B','-c','import time;time.sleep(30)'],
            env=env,pass_fds=(r,),stdout=subprocess.DEVNULL,stderr=subprocess.DEVNULL)
        os.close(r)
        assert len(config['tool_allowlist'])==5
        record_path=out/'host-process.json'
        until=time.monotonic()+2
        while time.monotonic()<until:
            if record_path.exists() and json.loads(record_path.read_text()).get('resource_bound_verification'):break
            time.sleep(.02)
        placements=[outer];helpers=[]
        for name,component in [('host-process','native'),('pm_boundary-host-process','pm_boundary'),('pm_execution-host-process','pm_execution')]:
            record=json.loads((out/(name+'.json')).read_text())
            placements.append(resource.verify(profile,record['unit'],component))
            helpers.extend(resource.verify_pid_placement(record[k],outer['unit_observation']['ControlGroup']) for k in ('guard_pid','service_runner_pid'))
        thread='synthetic-no-native-thread'
        read=relay.dispatch({'threadId':thread,'turnId':'synthetic','callId':'1','namespace':'pm_boundary',
            'tool':'read_file','arguments':{'path':'TASK.md'}},thread)
        assert read['success']
        execution=relay.dispatch({'threadId':thread,'turnId':'synthetic','callId':'2','namespace':'pm_execution',
            'tool':'python_execute','arguments':{'code':'print(6 * 7)'}},thread)
        assert execution['success']
        execution_receipts=list((workspace/'operation_receipts/executions').glob('*/result.json'))
        actual=json.loads(execution_receipts[0].read_text())
        assert actual['bootstrap_started'] and actual['exit_code']==0 and actual['stdout'].strip()=='42'
        assert actual['resource_placement']['verified_before_candidate_bootstrap']
        assert actual['cleanup_confirmed']
        config4=load_tools().mcp_configs(workspace,execution_enabled=False,public_get=True,
            deadline_monotonic_ns=stop,resource_profile_path=Path(profile_path))
        assert len(config4['tool_allowlist'])==4 and {r['name'] for r in config4['mcp_servers']}=={'pm_boundary'}
        result={'schema':'er9.luna.resource-relay-integration.v1','native_goal_starts':0,
            'native_codex_process_started':False,'allowed_client_tools':{k:sorted(v) for k,v in relay.allowed.items()},
            'exact_five_tool_catalog':len(config['tool_allowlist'])==5,'control_exact_four_without_execution_adapter':True,
            'outer_and_service_placements':placements,'retained_helper_placements':helpers,
            'successful_read':read['success'],'successful_python_stdout42':True,
            'sandbox_placement':actual['resource_placement'],'sandbox_cleanup_confirmed':actual['cleanup_confirmed'],
            'tools_source_pins_sha256':hashlib.sha256((TOOLS/'SOURCE_PINS.json').read_bytes()).hexdigest()}
        (out/'result.json').write_text(json.dumps(result,indent=2)+'\n')
    finally:
        if native:
            os.close(w);native.wait(timeout=5)
        else:os.close(r);os.close(w)
        if relay:relay.close()
    result['owned_scope_proof']=prove(out,workspace,stop,profile_path)
    assert result['owned_scope_proof']['all_owned_scopes_quiet']
    result['status']='PASS'
    (out/'result.json').write_text(json.dumps(result,indent=2)+'\n')
    return 0


def main():
    if len(sys.argv)>1 and sys.argv[1]=='--helper':return helper(*sys.argv[2:])
    with tempfile.TemporaryDirectory(prefix='er9-resource-relay-') as temp:
        folder=Path(temp);workspace=folder/'workspace';workspace.mkdir()
        for name in ('inputs','out'): (workspace/name).mkdir()
        (workspace/'TASK.md').write_text('Synthetic local resource integration. No research or model.\n')
        out=folder/'receipts';out.mkdir()
        profile_path=folder/'profile.json'
        profile=resource.allocate('synthetic-tool-resource-test',time.monotonic_ns(),30,profile_path)
        unit='er9-luna-'+uuid.uuid4().hex+'.service'
        result=None
        try:
            p=resource.invoke(['/usr/bin/systemd-run','--user','--quiet','--wait','--unit='+unit,
                '--slice='+profile['slice_unit'],'--property=MemoryMax='+str(resource.CAPS['outer_worker']),
                '--property=MemorySwapMax=0','--property=RuntimeMaxSec=25s','--property=KillMode=control-group',
                '/usr/bin/python3','-I','-B',str(Path(__file__).resolve()),'--helper',str(profile_path),str(workspace),str(out)],timeout=28)
            if p.returncode:raise RuntimeError('synthetic relay test failed: '+p.stderr)
            result=json.loads((out/'result.json').read_text())
        finally:
            release=resource.release(profile)
            assert release['all_private_slice_descendants_quiet']
        result['aggregate_release']=release
        result['test_sha256']=hashlib.sha256(Path(__file__).read_bytes()).hexdigest()
        result['research_fit']='UNKNOWN'
        (HERE/'RESOURCE_RELAY_REGRESSION.json').write_text(json.dumps(result,indent=2)+'\n')
        print(json.dumps({'status':result['status'],'native_goal_starts':0,'actual_all_components_quiet':True}))
        return 0


if __name__=='__main__':raise SystemExit(main())
