"""Original-deadline guardian; native and MCP children in one unique user unit."""
import json
import os
from pathlib import Path
import select
import signal
import subprocess
import sys
import time
import uuid
sys.path.insert(0,str(Path(__file__).resolve().parents[2]))
from resource_slice import load,verify,kernel,own_placement


def manager_env():
    return {'PATH':'/usr/bin:/bin','HOME':os.environ['HOME'],
            'XDG_RUNTIME_DIR':'/run/user/'+str(os.getuid()),
            'DBUS_SESSION_BUS_ADDRESS':'unix:path=/run/user/'+str(os.getuid())+'/bus'}


def control(unit, *args):
    return subprocess.run(['/usr/bin/systemctl','--user',*args,unit],
              env=manager_env(),capture_output=True,text=True,timeout=2)


def unit_observation(unit):
    row=control(unit,'show','--property=MainPID,ControlGroup,ActiveState,SubState')
    fields=dict(line.split('=',1) for line in row.stdout.splitlines() if '=' in line)
    return {'native_host_pid':int(fields.get('MainPID') or 0),
            'control_group':fields.get('ControlGroup'),
            'active_state':fields.get('ActiveState'),'sub_state':fields.get('SubState')}


def main():
    profile_path,component,watch,stop_ns,record,marker,*argv=sys.argv[1:]
    profile=load(profile_path)
    outer=own_placement(profile)
    cap=profile['component_memory_max_bytes'][component]
    watch,stop_ns=int(watch),int(stop_ns)
    if component not in {'native','pm_boundary','pm_execution'}:return 126
    if stop_ns>profile['original_total_stop_monotonic_ns']:return 126
    if marker!='--' or time.monotonic_ns()>=stop_ns:return 124
    if os.environ.get('PM_BOUND_DEADLINE_NS')!=str(stop_ns):return 126
    unit='er9-luna-'+uuid.uuid4().hex+'.service'
    info={'unit':unit,'immutable_stop_monotonic_ns':stop_ns,'native_host_pid':0,
          'native_host_pgid':0,'guard_pid':os.getpid(),'bounded_descendants':'private aggregate resource slice +unit cgroup',
          'resource_slice_unit':profile['slice_unit'],'resource_slice_cgroup':profile['slice_cgroup'],
          'memory_max_bytes':cap,'guard_outer_resource_placement':outer}
    path=Path(record)
    def write():
        tmp=path.with_suffix('.tmp');tmp.write_text(json.dumps(info)+'\n');os.replace(tmp,path)
    def stop(*_):raise SystemExit(1)
    signal.signal(signal.SIGTERM,stop);signal.signal(signal.SIGINT,stop)
    host=None
    try:
        remaining=(stop_ns-time.monotonic_ns())/1e9
        cmd=['/usr/bin/systemd-run','--user','--quiet','--wait','--pipe',
             '--unit='+unit,'--slice='+profile['slice_unit'],'--property=Type=exec','--property=KillMode=control-group',
             '--property=RuntimeMaxSec='+str(remaining)+'s','--property=Restart=no',
             '--property=SendSIGKILL=yes','--property=TimeoutStopSec=1s',
             '--property=KillSignal=SIGKILL','--property=MemoryMax='+str(cap),
             '--property=MemorySwapMax=0','--property=TasksMax=128',
             '--property=WorkingDirectory='+os.getcwd()]
        for key,value in os.environ.items():
            if key in {'HOME','CODEX_HOME','PATH','LANG','XDG_CONFIG_HOME','XDG_CACHE_HOME',
                       'XDG_DATA_HOME','XDG_STATE_HOME','PM_BOUND_DEADLINE_NS'}:
                cmd.append('--setenv='+key+'='+value)
        host=subprocess.Popen([*cmd,'--',*argv],env=manager_env(),start_new_session=True)
        info['service_runner_pid']=host.pid;write()
        while host.poll() is None and time.monotonic_ns()<stop_ns:
            if not info['native_host_pid']:
                observed=unit_observation(unit)
                if observed['native_host_pid'] and observed['active_state']=='active':
                    info.update(observed)
                    info['resource_bound_verification']=verify(profile,unit,component)
                    try:info['native_host_pgid']=os.getpgid(info['native_host_pid'])
                    except ProcessLookupError:pass
                    write()
            if select.select([watch],[],[],min(.1,max(0,(stop_ns-time.monotonic_ns())/1e9)))[0]:
                if not os.read(watch,1):break
        info['stop_reason']='deadline' if time.monotonic_ns()>=stop_ns else 'controller_eof_or_native_exit'
        return host.poll() or 0
    finally:
        if host is not None:
            try:
                cg=info.get('control_group')
                if cg and Path('/sys/fs/cgroup',cg.lstrip('/')).exists():info['terminal_kernel_memory']=kernel(cg)
            except (OSError,ValueError):info['terminal_kernel_memory']='UNAVAILABLE'
            for command in [('kill','--signal=SIGKILL','--kill-whom=all'),('stop',)]:
                try:control(unit,*command)
                except subprocess.TimeoutExpired:info['cleanup_command_timeout']=True
            try:host.wait(timeout=2)
            except subprocess.TimeoutExpired:
                try:os.killpg(host.pid,signal.SIGKILL)
                except ProcessLookupError:pass
                host.wait(timeout=2)
            info['service_runner_exit_code']=host.returncode
            try:
                info['terminal_unit_observation']=unit_observation(unit)
                facts=control(unit,'show','--property=MemoryPeak,Result,ExecMainStatus')
                info['resource_terminal_status']=dict(v.split('=',1) for v in facts.stdout.splitlines() if '=' in v)
            except subprocess.TimeoutExpired:info['terminal_unit_observation']='UNKNOWN'
            cg=info.get('control_group')
            cpath=Path('/sys/fs/cgroup')/cg.lstrip('/') if cg else None
            info['cgroup_absent_or_empty']=bool(cpath) and (not cpath.exists() or
                dict(v.split() for v in (cpath/'cgroup.events').read_text().splitlines()).get('populated')=='0')
            info['closed_monotonic_ns']=time.monotonic_ns();write()
        os.close(watch)


if __name__=='__main__':sys.exit(main())
