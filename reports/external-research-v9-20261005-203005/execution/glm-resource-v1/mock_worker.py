"""Synthetic resource-only services; never imports or starts native GLM."""
import argparse,importlib.util,json,os,subprocess,sys,time
from pathlib import Path
from concurrent.futures import ThreadPoolExecutor
import profile,external_release
from pipe_bridge import Bridge

def wait_verified(path):
    until=time.monotonic()+5
    while time.monotonic()<until:
        if path.exists() and json.loads(path.read_text()).get('verified_before_command_exec'):return json.loads(path.read_text())
        time.sleep(.02)
    raise RuntimeError('Synthetic component did not pass live gate')

def main():
    p=argparse.ArgumentParser();p.add_argument('--profile',required=True);p.add_argument('--out',required=True);a=p.parse_args()
    root=Path(a.out);root.mkdir();resource=profile.load(a.profile);outer=profile.reader.own_placement(resource)
    result={'model_calls':0,'native_goal_starts':0,'outer':outer}
    binding=root/'RESOURCE_BINDING.json'
    binding.write_text(json.dumps({'resource_profile':{'path':a.profile,'sha256':profile.sha(a.profile)},
        'outer_unit':outer['unit'],'outer_placement':outer})+'\n')
    try:external_release.release(a.profile,binding,profile.sha(binding))
    except ValueError:result['active_outer_release_rejected']=True
    else:raise RuntimeError('Active outer was released')
    stop=resource['original_total_stop_monotonic_ns']-5_000_000_000
    bridges=[];servers=[];proxies=[]
    try:
        for component in ('native','pm_boundary','pm_execution'):
            record=root/('native-host.json' if component=='native' else component+'-resource.json')
            child='import sys; [print(line.rstrip(),flush=True) for line in sys.stdin]'
            server={'name':component,'command':'/usr/bin/python3','args':['-I','-B',str(Path(__file__).with_name('component_guard.py')),
                '--resource-profile',a.profile,'--component',component,'--stop-ns',str(stop),'--record',str(record),
                '--cwd',str(root),'--','/usr/bin/python3','-u','-c',child]}
            bridge=Bridge(server,root,root/'bridges',os.environ.copy());bridges.append(bridge)
            wait_verified(record)
            # Proxy process is itself a retained helper in the outer unit here;
            # in genuine GLM it inherits the separately capped native unit.
            proxy=subprocess.Popen(['/usr/bin/python3','-I','-B',str(Path(__file__).with_name('pipe_proxy.py')),
                '--socket',str(bridge.socket_path),'--resource-profile',a.profile],stdin=subprocess.PIPE,stdout=subprocess.PIPE,text=True)
            value='{"synthetic":"'+component+'"}';proxy.stdin.write(value+'\n');proxy.stdin.flush()
            if proxy.stdout.readline().strip()!=value:raise RuntimeError('Byte relay changed stream')
            proxies.append(proxy);servers.append(server)
        result['live_preinference_equivalent_proof']=profile.preactivation_proof(a.profile,root,[{'name':'pm_boundary'},{'name':'pm_execution'}])
        for proxy in proxies:proxy.stdin.close();proxy.wait(timeout=3)
        # Synthetic components tested only; no native app or provider is started.
        # closing proxy caused backend EOF; their positive exact gate records
        # already establish command exec placement and byte transparency.
        watch_results=[]
        for mode in ['eof','deadline']:
            read,write=os.pipe();record=root/(mode+'-watch.json')
            local_stop=stop if mode=='eof' else time.monotonic_ns()+1_500_000_000
            guard=subprocess.Popen(['/usr/bin/python3','-I','-B',str(Path(__file__).with_name('component_guard.py')),
                '--resource-profile',a.profile,'--component','native','--stop-ns',str(local_stop),
                '--watch-fd',str(read),'--record',str(record),'--cwd',str(root),'--','/usr/bin/python3','-c',
                'import subprocess,time;subprocess.Popen(["/bin/sleep","60"]);time.sleep(60)'],pass_fds=(read,))
            os.close(read);wait_verified(record)
            if mode=='eof':os.close(write);write=None
            guard.wait(timeout=5)
            if write is not None:os.close(write)
            fact=json.loads(record.read_text())
            if not fact['cgroup_absent_or_empty']:raise RuntimeError('Owned descendant not quiet on '+mode)
            if mode=='deadline' and fact['immutable_stop_monotonic_ns']!=local_stop:raise RuntimeError('Deadline reset')
            watch_results.append({'mode':mode,'record':fact})
        result['owner_eof_and_absolute_deadline']=watch_results
        result['component_gates']=[json.loads((root/('native-host.json' if s['name']=='native' else s['name']+'-resource.json')).read_text()) for s in servers]
        result['gate_caps']={r['component']:r['kernel_proof']['component_kernel_limits']['memory.max'] for r in result['component_gates']}
        tool=profile.module('synthetic_exec_server',profile.TOOLS/'execution_server.py')
        def execute(index,code):
            return tool.execute({'code':code,'data':[2,3]},root/('execution-'+str(index)),actor='evaluator',resource_profile_path=a.profile)
        with ThreadPoolExecutor(max_workers=2) as pool:
            futures=[pool.submit(execute,n,'import time;time.sleep(1);print(sum(data))') for n in (0,1)]
            overlap=[];until=time.monotonic()+4
            while time.monotonic()<until and not all(f.done() for f in futures):
                live=[]
                for group in Path('/sys/fs/cgroup',resource['slice_cgroup'].lstrip('/')).glob('er9-exec-*.service'):
                    try:
                        if (group/'cgroup.procs').read_text().strip():live.append(profile.reader.verify(resource,group.name,'sandbox'))
                    except (OSError,RuntimeError):pass
                if len(live)>=2:overlap=live;break
                time.sleep(.02)
            values=[f.result() for f in futures]
            if len(overlap)<2:raise RuntimeError('No simultaneous actual sandbox placement witnessed')
            result['simultaneous_sandbox_kernel_observations']=overlap
        result['sandbox_overlap']=values
        if not all(v['cleanup_confirmed'] and v['resource_placement']['verified_before_candidate_bootstrap'] for v in values):raise RuntimeError('Sandbox live placement/quiet failed')
        oom_record=root/'adapter-oom-resource.json'
        oom_cmd=['/usr/bin/python3','-I','-B',str(Path(__file__).with_name('component_guard.py')),
            '--resource-profile',a.profile,'--component','pm_execution','--stop-ns',str(stop),
            '--record',str(oom_record),'--cwd',str(root),'--','/usr/bin/python3','-c','a=bytearray(400*1024*1024);print(len(a))']
        oom=subprocess.run(oom_cmd,capture_output=True,text=True,timeout=8)
        result['synthetic_oom']={'exit_code':oom.returncode,'record':json.loads(oom_record.read_text()),'scope':'Kernel OOM of trusted synthetic adapter process, not candidate code. Standard sandbox RLIMIT_AS remains unchanged.'}
        events=profile.reader.kernel(resource['slice_cgroup'])['memory.events']
        result['aggregate_events_after_oom']=events
        if not any(int(events.get(k,0))>0 for k in ['oom','oom_kill']):raise RuntimeError('Synthetic OOM not observed')
    finally:
        for proxy in proxies:
            if proxy.poll() is None:proxy.terminate();proxy.wait(timeout=1)
        for bridge in bridges:bridge.close()
        result['component_settlement']=profile.close_components(a.profile,root,[{'name':'pm_boundary'},{'name':'pm_execution'}])
        result['aggregate_before_outer_exit']=profile.reader.kernel(resource['slice_cgroup'])
        (root/'RESULT.json').write_text(json.dumps(result,indent=2)+'\n')
    return 0
if __name__=='__main__':raise SystemExit(main())
