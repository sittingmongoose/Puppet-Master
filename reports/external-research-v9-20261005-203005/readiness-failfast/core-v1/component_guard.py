"""Original-deadline/owner-death watchdog for one precisely owned sibling unit."""
import argparse,ctypes,json,os,select,signal,subprocess,time,uuid
from pathlib import Path
import sys
sys.path.insert(0,str(Path(__file__).resolve().parent))
import profile
import readiness

def main():
    p=argparse.ArgumentParser();p.add_argument('--resource-profile',required=True);p.add_argument('--component',required=True)
    p.add_argument('--stop-ns',type=int,required=True);p.add_argument('--record',required=True);p.add_argument('--cwd',required=True)
    p.add_argument('--watch-fd',type=int);p.add_argument('command',nargs=argparse.REMAINDER);a=p.parse_args()
    resource=profile.load(a.resource_profile);outer=profile.reader.own_placement(resource)
    if a.component not in ('native','pm_boundary','pm_execution') or a.stop_ns>resource['original_total_stop_monotonic_ns']:raise ValueError('Unregistered component or extended clock')
    if time.monotonic_ns()>=a.stop_ns:raise TimeoutError('Original component stop already passed')
    parent=os.getppid()
    if ctypes.CDLL(None,use_errno=True).prctl(1,signal.SIGTERM)!=0:raise OSError('Parent-death signal setup failed')
    if os.getppid()!=parent:raise RuntimeError('Owner exited before guard armed')
    command=a.command[1:] if a.command[:1]==['--'] else a.command
    unit='er9-glm-'+uuid.uuid4().hex+'.service';record=Path(a.record);gate=record.with_suffix('.gate.json')
    cap=resource['component_memory_max_bytes'][a.component]
    info={'unit':unit,'component':a.component,'guard_pid':os.getpid(),'helper_cgroup':outer['unit_observation']['ControlGroup'],
          'immutable_stop_monotonic_ns':a.stop_ns,'verified_before_command_exec':False}
    readiness.write_owner_intent(resource,a.resource_profile,record,unit,a.component,os.getpid(),outer['unit_observation']['ControlGroup'],a.stop_ns)
    def save():tmp=record.with_suffix('.tmp');tmp.write_text(json.dumps(info)+'\n');os.replace(tmp,record)
    def stop(*_):raise SystemExit(1)
    signal.signal(signal.SIGTERM,stop);signal.signal(signal.SIGINT,stop)
    host=None
    try:
        remaining=(a.stop_ns-time.monotonic_ns())/1e9
        argv=['/usr/bin/systemd-run','--user','--quiet','--wait','--pipe','--unit='+unit,
            '--slice='+resource['slice_unit'],'--property=Type=exec','--property=KillMode=control-group',
            '--property=Restart=no','--property=RuntimeMaxSec='+str(remaining),
            '--property=TimeoutStopSec=1s','--property=KillSignal=SIGKILL',
            '--property=MemoryMax='+str(cap),'--property=MemorySwapMax=0','--property=TasksMax=128',
            '--property=WorkingDirectory='+a.cwd]
        for key,value in os.environ.items():
            if key in {'PATH','LANG','HOME','USERPROFILE','XDG_CONFIG_HOME','XDG_CACHE_HOME','XDG_DATA_HOME','XDG_STATE_HOME',
                'ZCODE_BUILTIN_PROVIDER_CONFIG_FILE','ZCODE_PERSONAL_PROVIDER_CONFIG_FILE','ZCODE_STORAGE_DIR','ZCODE_LOG_DIR','ZCODE_SESSION_DB_PATH','ZCODE_LOG_CONSOLE'}:
                argv.append('--setenv='+key+'='+value)
        argv+=['--','/usr/bin/python3','-I','-B',str(Path(__file__).with_name('component_gate.py')),
               '--resource-profile',a.resource_profile,'--component',a.component,'--unit',unit,
               '--record',str(gate),'--stop-ns',str(a.stop_ns),'--',*command]
        host=subprocess.Popen(argv,env=profile.reader.manager_env(),start_new_session=True)
        info['service_runner_pid']=host.pid;save()
        while host.poll() is None and time.monotonic_ns()<a.stop_ns:
            if gate.exists() and not info['verified_before_command_exec']:
                info.update(json.loads(gate.read_text()));facts=profile.reader.show(unit)
                actual_pid=int(facts['MainPID']);actual_pgid=os.getpgid(actual_pid)
                info.update(native_host_pid=actual_pid,native_host_pgid=actual_pgid,
                            native_identity={'pid':actual_pid,'pgid':actual_pgid},
                            control_group=facts['ControlGroup'])
                save()
            if a.watch_fd is not None:
                if select.select([a.watch_fd],[],[],.05)[0] and not os.read(a.watch_fd,1):break
            else:time.sleep(.05)
        info['stop_reason']='original_deadline' if time.monotonic_ns()>=a.stop_ns else 'owner_eof_or_component_exit'
        return host.poll() or 0
    finally:
        if host:
            try:info['terminal_kernel_memory']=profile.reader.kernel(resource['slice_cgroup']+'/'+unit)
            except OSError:info['terminal_kernel_memory']='UNAVAILABLE'
            for cmd in [('kill','--signal=SIGKILL','--kill-whom=all'),('stop',)]:
                try:profile.reader.invoke(['/usr/bin/systemctl','--user',*cmd,unit],timeout=2)
                except subprocess.TimeoutExpired:info['cleanup_query_timeout']=True
            try:host.wait(timeout=2)
            except subprocess.TimeoutExpired:host.kill();host.wait(timeout=2)
            facts=profile.reader.show(unit);cg=Path('/sys/fs/cgroup')/(resource['slice_cgroup']+'/'+unit).lstrip('/')
            info.update(service_runner_exit_code=host.returncode,terminal_unit_observation=facts,
                        cgroup_absent_or_empty=not cg.exists() or profile.reader.kernel(resource['slice_cgroup']+'/'+unit)['cgroup.events'].get('populated')=='0',
                        closed_monotonic_ns=time.monotonic_ns())
            save()
        if a.watch_fd is not None:os.close(a.watch_fd)
if __name__=='__main__':raise SystemExit(main())
