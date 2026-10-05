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
    watch,stop_ns,record,marker,*argv=sys.argv[1:]
    watch,stop_ns=int(watch),int(stop_ns)
    if marker!='--' or time.monotonic_ns()>=stop_ns:return 124
    if os.environ.get('PM_BOUND_DEADLINE_NS')!=str(stop_ns):return 126
    unit='er9-luna-'+uuid.uuid4().hex+'.service'
    info={'unit':unit,'immutable_stop_monotonic_ns':stop_ns,'native_host_pid':0,
          'native_host_pgid':0,'guard_pid':os.getpid(),'bounded_descendants':'native unit cgroup'}
    path=Path(record)
    def write():
        tmp=path.with_suffix('.tmp');tmp.write_text(json.dumps(info)+'\n');os.replace(tmp,path)
    def stop(*_):raise SystemExit(1)
    signal.signal(signal.SIGTERM,stop);signal.signal(signal.SIGINT,stop)
    host=None
    try:
        remaining=(stop_ns-time.monotonic_ns())/1e9
        cmd=['/usr/bin/systemd-run','--user','--quiet','--wait','--pipe','--collect',
             '--unit='+unit,'--property=Type=exec','--property=KillMode=control-group',
             '--property=RuntimeMaxSec='+str(remaining)+'s','--property=Restart=no',
             '--property=SendSIGKILL=yes','--property=TimeoutStopSec=1s',
             '--property=KillSignal=SIGKILL','--property=MemoryMax=768M',
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
                if observed['native_host_pid']:
                    info.update(observed)
                    try:info['native_host_pgid']=os.getpgid(info['native_host_pid'])
                    except ProcessLookupError:pass
                    write()
            if select.select([watch],[],[],min(.1,max(0,(stop_ns-time.monotonic_ns())/1e9)))[0]:
                if not os.read(watch,1):break
        info['stop_reason']='deadline' if time.monotonic_ns()>=stop_ns else 'controller_eof_or_native_exit'
        return host.poll() or 0
    finally:
        if host is not None:
            for command in [('kill','--signal=SIGKILL','--kill-whom=all'),('stop',)]:
                try:control(unit,*command)
                except subprocess.TimeoutExpired:info['cleanup_command_timeout']=True
            try:host.wait(timeout=2)
            except subprocess.TimeoutExpired:
                try:os.killpg(host.pid,signal.SIGKILL)
                except ProcessLookupError:pass
                host.wait(timeout=2)
            info['service_runner_exit_code']=host.returncode
            try:info['terminal_unit_observation']=unit_observation(unit)
            except subprocess.TimeoutExpired:info['terminal_unit_observation']='UNKNOWN'
            cg=info.get('control_group')
            cpath=Path('/sys/fs/cgroup')/cg.lstrip('/') if cg else None
            info['cgroup_absent_or_empty']=bool(cpath) and (not cpath.exists() or
                not (cpath/'cgroup.procs').read_text().strip())
            info['closed_monotonic_ns']=time.monotonic_ns();write()
        os.close(watch)


if __name__=='__main__':sys.exit(main())
