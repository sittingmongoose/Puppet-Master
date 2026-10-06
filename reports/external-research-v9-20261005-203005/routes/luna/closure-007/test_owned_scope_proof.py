"""Zero-inference exact ownership regression; no process signal or service start."""
import json
import os
from pathlib import Path
import tempfile
from owned_scope_proof import prove,unit_quiet


def main():
    checks={}
    with tempfile.TemporaryDirectory(prefix='er9-owned-proof-') as temp:
        root=Path(temp);unit='er9-luna-'+'1'*32+'.service'
        result={'thread_id':'synthetic','allowed_client_tools':{}}
        (root/'result.json').write_text(json.dumps(result))
        record={'unit':unit,'control_group':'','guard_pid':101,'native_host_pid':102,
                'service_runner_pid':103,'native_host_pgid':2899}
        (root/'host-process.json').write_text(json.dumps(record))
        facts={'query_returncode':0,'active_state':'inactive','load_state':'not-found',
               'sub_state':'dead','main_pid':0,'control_group':''}
        def observer(unit,timeout):return facts.copy()
        def terminated(pid):return {'pid':pid,'state':'absent','terminated':True}
        def cg(value,unit):return {'control_group':value,'absent_or_empty':True}
        receipt=prove(root,unit_observer=observer,pid_observer=terminated,cgroup_observer=cg)
        assert receipt['all_owned_scopes_quiet'] and receipt['services'][0]['original_recorded_pgid']==2899
        checks['shared_manager_pgid_is_never_ownership_requirement']=True
        live=lambda pid:{'pid':pid,'state':'S','terminated':False}
        assert not prove(root,unit_observer=observer,pid_observer=live,cgroup_observer=cg)['all_owned_scopes_quiet']
        checks['live_or_reused_exact_pid_blocks_proof']=True
        facts['main_pid']=102;assert not prove(root,unit_observer=observer,pid_observer=terminated,cgroup_observer=cg)['all_owned_scopes_quiet']
        checks['active_main_pid_blocks_proof']=True;facts['main_pid']=0
        facts['query_returncode']=1;assert not prove(root,unit_observer=observer,pid_observer=terminated,cgroup_observer=cg)['all_owned_scopes_quiet']
        checks['query_failure_is_not_quiet']=True;facts['query_returncode']=0
        populated=lambda value,unit:{'control_group':value,'absent_or_empty':False}
        assert not prove(root,unit_observer=observer,pid_observer=terminated,cgroup_observer=populated)['all_owned_scopes_quiet']
        checks['populated_original_or_current_cgroup_blocks_proof']=True
        try:prove(root,deadline_ns=1,unit_observer=observer,pid_observer=terminated,cgroup_observer=cg)
        except TimeoutError:checks['same_clock_deadline_not_extended']=True
        else:raise AssertionError('expired proof deadline accepted')
        result['allowed_client_tools']={'pm_execution':['python_execute']}
        (root/'result.json').write_text(json.dumps(result))
        try:prove(root,unit_observer=observer,pid_observer=terminated,cgroup_observer=cg)
        except ValueError:checks['execution_enabled_requires_workspace_evidence']=True
        else:raise AssertionError('execution evidence omitted')
        result['allowed_client_tools']={};(root/'result.json').write_text(json.dumps(result))
        record['unit']='user@1000.service';(root/'host-process.json').write_text(json.dumps(record))
        try:prove(root,unit_observer=observer,pid_observer=terminated,cgroup_observer=cg)
        except ValueError:checks['nonowned_manager_unit_rejected']=True
        else:raise AssertionError('manager unit accepted')
    assert all(checks.values())
    result={'schema':'er9.luna.owned-scope-regression.v1','status':'PASS',
            'actual_native_goals':0,'inference_started':False,'signals_or_service_starts':0,'checks':checks}
    Path(__file__).with_name('OWNED_SCOPE_REGRESSION.json').write_text(json.dumps(result,indent=2)+'\n')
    print(json.dumps(result,indent=2))


if __name__=='__main__':main()
