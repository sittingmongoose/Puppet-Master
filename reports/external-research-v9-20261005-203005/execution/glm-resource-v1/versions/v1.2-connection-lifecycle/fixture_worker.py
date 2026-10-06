"""Exact production stage worker path with a test-only synthetic g.run substitute.

Never exposed in a production worker argument. Native CLI/model/Goal calls=0.
"""
import argparse,importlib.util,json,os,selectors,subprocess,sys,time
from pathlib import Path

def main():
    p=argparse.ArgumentParser();p.add_argument('--engine',required=True);p.add_argument('--legacy-bridge')
    p.add_argument('--stage-json',required=True);p.add_argument('--stage-sha256',required=True)
    p.add_argument('--birth-monotonic-ns',type=int,required=True);p.add_argument('--resource-profile',required=True);p.add_argument('--resource-profile-sha256',required=True)
    a=p.parse_args();engine=Path(a.engine);sys.path.insert(0,str(engine))
    import profile,stage_worker as worker
    from pipe_bridge import Bridge
    if a.legacy_bridge:
        spec=importlib.util.spec_from_file_location('old_fixture_bridge',a.legacy_bridge);m=importlib.util.module_from_spec(spec);spec.loader.exec_module(m);Bridge=m.Bridge
    def run(args):
        out=Path(args.out);out.mkdir();resource=profile.load(a.resource_profile)
        config=json.loads(Path(args.tools_config).read_text());servers=config['mcp_servers'];bridges=[];native=None;watch_write=None
        result={'schema':'er9.zero-inference-dispatch-worker-fixture.v1','model_calls':0,'goal_activated':False,'native_goal_starts':0,'status':'fixture_unverified'}
        evidence={'synthetic_only':True,'model_calls':0,'native_goal_starts':0,'original_birth_monotonic_ns':a.birth_monotonic_ns,
                  'original_total_stop_monotonic_ns':resource['original_total_stop_monotonic_ns'],'outer_placement':profile.reader.own_placement(resource)}
        def wait_event():
            sel=selectors.DefaultSelector();sel.register(native.stdout,selectors.EVENT_READ)
            try:
                if not sel.select(8):raise TimeoutError('Synthetic native lifecycle event absent')
                line=native.stdout.readline()
                if not line:raise RuntimeError('Synthetic native lifecycle exited')
                return json.loads(line)
            finally:sel.close()
        try:
            bridges=[Bridge(server,Path(args.workspace),out/'bridges',os.environ.copy()) for server in servers]
            native_config=out/'proxy-config.json';native_config.write_text(json.dumps([b.native_config(a.resource_profile) for b in bridges]))
            watch_read,watch_write=os.pipe()
            command=['/usr/bin/python3','-I','-B',str(engine/'native_guard.py'),'--resource-profile',a.resource_profile,'--component','native',
                '--watch-fd',str(watch_read),'--stop-ns',str(resource['original_total_stop_monotonic_ns']-5_000_000_000),'--record',str(out/'native-host.json'),
                '--cwd',args.workspace,'--','/usr/bin/python3','-B',str(Path(__file__).with_name('fixture_native.py')),'--config',str(native_config)]
            native=subprocess.Popen(command,stdin=subprocess.PIPE,stdout=subprocess.PIPE,stderr=subprocess.PIPE,text=True,pass_fds=(watch_read,));os.close(watch_read)
            event=wait_event();evidence['discovery']=event
            if event['event']!='discovery_disconnected':raise RuntimeError('Unexpected synthetic discovery event')
            time.sleep(.3)
            try:evidence['placements_after_discovery_disconnect']=profile.preactivation_proof(a.resource_profile,out,servers)
            except ValueError as exc:
                evidence['preactivation_rejection']=str(exc)
                if not a.legacy_bridge:raise
                result['status']='fixture_expected_old_rejection'
            else:
                if a.legacy_bridge:raise RuntimeError('Old transport failure did not reproduce')
                native.stdin.write('{"action":"reconnect_and_work"}\n');native.stdin.flush()
                event=wait_event()
                if event['event']=='sandbox_request_sent':
                    until=time.monotonic()+4;observations=[]
                    while time.monotonic()<until and not observations:
                        for path in Path('/sys/fs/cgroup',resource['slice_cgroup'].lstrip('/')).glob('er9-exec-*.service'):
                            try:
                                if (path/'cgroup.procs').read_text().strip():observations.append(profile.reader.verify(resource,path.name,'sandbox'))
                            except (OSError,RuntimeError):pass
                        time.sleep(.02)
                    if not observations:raise RuntimeError('Actual fixture sandbox placement absent')
                    evidence['sandbox_kernel_placements']=observations;event=wait_event()
                if event['event']!='reconnect_tools_done':raise RuntimeError('Actual MCP reconnect/tool exchange did not finish')
                evidence['reconnect']=event
                evidence['placements_after_reconnect']=profile.preactivation_proof(a.resource_profile,out,servers)
                evidence['bridge_lifecycles']=[json.loads(b.lifecycle_path.read_text()) for b in bridges]
                result['status']='fixture_verified'
            native.stdin.write('{"action":"finish"}\n');native.stdin.flush();native.wait(timeout=4)
        finally:
            if native and native.poll() is None:native.stdin.close();native.wait(timeout=4)
            if watch_write is not None:os.close(watch_write)
            for bridge in bridges:bridge.close()
            settlement=profile.close_components(a.resource_profile,out,servers)
            result.update(cleanup={'native_quiescent':settlement['all_components_quiet']},resource_components_quiet=settlement['all_components_quiet'],resource_oom_observed=False,native_responses=0)
            evidence['component_settlement']=settlement;evidence['original_clock']=profile.original_clock(resource,a.birth_monotonic_ns,args.max_seconds)
            (out/'FIXTURE_PROOF.json').write_text(json.dumps(evidence,indent=2)+'\n');(out/'receipt.json').write_text(json.dumps(result,indent=2)+'\n')
        return result
    worker.g.run=run
    spec=json.loads(worker.pinned(a.stage_json,a.stage_sha256).read_text())
    result,path=worker.run(spec,a.birth_monotonic_ns,a.resource_profile,a.resource_profile_sha256)
    proof=json.loads((Path(spec['out'])/'FIXTURE_PROOF.json').read_text());proof['actual_stage_freeze_native_goal_starts']=result['native_goal_starts'];proof['actual_stage_freeze_operational_complete']=result['operational_complete']
    (Path(spec['out']).parent/'FINAL_FIXTURE_PROOF.json').write_text(json.dumps(proof,indent=2)+'\n')
    print(json.dumps({'synthetic_only':True,'native_goal_starts':0,'model_calls':0,'worker_fixture_status':result['native_status']}))
    return 0
if __name__=='__main__':raise SystemExit(main())
