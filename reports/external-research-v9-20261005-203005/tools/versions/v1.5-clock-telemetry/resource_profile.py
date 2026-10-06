"""Trusted private complete-job resource allocation, verification and cleanup."""
import argparse
import hashlib
import json
import math
import os
from pathlib import Path
import re
import subprocess
import time
import uuid

MIB=1048576
CAPS={'outer_worker':768*MIB,'native':768*MIB,'pm_boundary':256*MIB,
      'pm_execution':256*MIB,'sandbox':256*MIB}
TOTAL=2304*MIB
SLICE=re.compile(r'er9mem[0-9a-f]{32}\.slice')


def manager_env():
    return {'PATH':'/usr/bin:/bin','HOME':str(Path.home()),
        'XDG_RUNTIME_DIR':'/run/user/'+str(os.getuid()),
        'DBUS_SESSION_BUS_ADDRESS':'unix:path=/run/user/'+str(os.getuid())+'/bus'}


def invoke(argv,timeout=3):
    return subprocess.run(argv,env=manager_env(),capture_output=True,text=True,timeout=timeout)


def show(unit):
    p=invoke(['/usr/bin/systemctl','--user','show',unit,
        '--property=LoadState,ActiveState,SubState,ControlGroup,MainPID,MemoryMax,MemorySwapMax,MemoryPeak,Result'])
    if p.returncode:raise RuntimeError('owned resource unit query unavailable')
    return dict(v.split('=',1) for v in p.stdout.splitlines() if '=' in v)


def kernel(cgroup):
    path=Path('/sys/fs/cgroup')/cgroup.lstrip('/')
    values={name:(path/name).read_text().strip() for name in ('memory.max','memory.swap.max','memory.current','memory.peak','memory.events','cgroup.events')}
    for name in ('memory.events','cgroup.events'):
        values[name]=dict(v.split() for v in values[name].splitlines())
    return values


def allocate(label,birth_ns,max_seconds,out):
    now=time.monotonic_ns()
    if type(birth_ns) is not int or birth_ns<=0 or birth_ns>now or not math.isfinite(max_seconds) or max_seconds<=0:raise ValueError('finite original resource clock required')
    if now>=birth_ns+int(max_seconds*1e9):raise TimeoutError('original resource deadline')
    out=Path(out).absolute()
    if out.exists() or any(p.is_symlink() for p in (out,*out.parents)):raise ValueError('fresh trusted profile destination required')
    name='er9mem'+uuid.uuid4().hex+'.slice'
    p=invoke(['/usr/bin/busctl','--user','call','org.freedesktop.systemd1',
        '/org/freedesktop/systemd1','org.freedesktop.systemd1.Manager','StartTransientUnit',
        'ssa(sv)a(sa(sv))',name,'fail','5','Description','s','ER9 private bounded candidate job',
        'MemoryAccounting','b','true','MemoryMax','t',str(TOTAL),'MemorySwapMax','t','0',
        'CollectMode','s','inactive-or-failed','0'])
    if p.returncode:raise RuntimeError('private resource slice allocation failed')
    facts=show(name);cg=facts.get('ControlGroup');k=kernel(cg)
    if facts.get('ActiveState')!='active' or int(k['memory.max'])!=TOTAL or k['memory.swap.max']!='0':
        invoke(['/usr/bin/systemctl','--user','stop',name]);raise RuntimeError('private aggregate cap acknowledgement missing')
    profile={'schema':'er9.luna.private-memory-profile.v1','label':label,'slice_unit':name,
        'slice_cgroup':cg,'aggregate_memory_max_bytes':TOTAL,'memory_swap_max_bytes':0,
        'component_memory_max_bytes':CAPS,'original_birth_monotonic_ns':birth_ns,
        'original_total_stop_monotonic_ns':birth_ns+int(max_seconds*1e9),
        'allocation_monotonic_ns':time.monotonic_ns(),'slice_unit_observation':facts,
        'aggregate_kernel_limits':k,'fit':'UNKNOWN','scope':'complete owned job including controller/guards, sibling services and all execution overlap',
        'host_reserve_bytes':3*1024*MIB,'reader_sha256':hashlib.sha256(Path(__file__).read_bytes()).hexdigest()}
    try:
        fd=os.open(out,os.O_WRONLY|os.O_CREAT|os.O_EXCL,0o600)
        with os.fdopen(fd,'w') as file:file.write(json.dumps(profile,indent=2)+'\n')
    except Exception:
        invoke(['/usr/bin/systemctl','--user','stop',name]);raise
    return profile


def load(path):
    path=Path(path).absolute()
    if any(p.is_symlink() for p in (path,*path.parents)) or not path.is_file() or path.stat().st_uid!=os.getuid() or path.stat().st_mode&0o077:raise ValueError('trusted resource profile required')
    p=json.loads(path.read_text())
    if p.get('schema')!='er9.luna.private-memory-profile.v1' or not SLICE.fullmatch(p.get('slice_unit','')) or p.get('aggregate_memory_max_bytes')!=TOTAL or p.get('component_memory_max_bytes')!=CAPS or p.get('memory_swap_max_bytes')!=0:
        raise ValueError('exact approved resource profile required')
    expected='/user.slice/user-'+str(os.getuid())+'.slice/user@'+str(os.getuid())+'.service/'+p['slice_unit']
    if p.get('slice_cgroup')!=expected:raise ValueError('private slice cgroup drift')
    if p.get('reader_sha256')!=hashlib.sha256(Path(__file__).read_bytes()).hexdigest():raise ValueError('resource reader pin drift')
    birth=p.get('original_birth_monotonic_ns');stop=p.get('original_total_stop_monotonic_ns')
    if type(birth) is not int or type(stop) is not int or not 0<birth<stop:raise ValueError('resource profile clock drift')
    return p


def verify(profile,unit,component):
    if component not in CAPS or not re.fullmatch(r'[A-Za-z0-9_.@-]+\.service',unit):raise ValueError('unregistered resource component/unit')
    aggregate=show(profile['slice_unit']);ak=kernel(profile['slice_cgroup'])
    facts=show(unit);cg=facts.get('ControlGroup')
    if cg!=profile['slice_cgroup']+'/'+unit:raise ValueError('owned component outside private aggregate')
    k=kernel(cg)
    if aggregate.get('ActiveState')!='active' or int(aggregate.get('MemoryMax','0'))!=TOTAL or aggregate.get('MemorySwapMax')!='0' or int(facts.get('MemoryMax','0'))!=CAPS[component] or facts.get('MemorySwapMax')!='0' or int(ak['memory.max'])!=TOTAL or ak['memory.swap.max']!='0' or int(k['memory.max'])!=CAPS[component] or k['memory.swap.max']!='0':raise ValueError('actual resource cap drift')
    return {'component':component,'unit':unit,'unit_observation':facts,'component_kernel_limits':k,
        'aggregate_kernel_limits':ak,'verified_monotonic_ns':time.monotonic_ns(),
        'actual_component_under_private_aggregate':True,'actual_limits_match':True}


def own_placement(profile):
    cg=Path('/proc/self/cgroup').read_text().strip().split('::',1)[-1]
    prefix=profile['slice_cgroup']+'/'
    if not cg.startswith(prefix):raise ValueError('outer controller outside private job slice')
    unit=cg[len(prefix):].split('/')[0]
    return verify(profile,unit,'outer_worker')


def verify_pid_placement(pid,expected_cgroup):
    if type(pid) is not int or pid<=1:raise ValueError('exact retained helper PID required')
    actual=Path('/proc',str(pid),'cgroup').read_text().strip().split('::',1)[-1]
    if actual!=expected_cgroup and not actual.startswith(expected_cgroup+'/'):
        raise ValueError('retained helper outside registered owned unit')
    return {'pid':pid,'actual_cgroup':actual,'expected_owned_cgroup':expected_cgroup,
            'actual_owned_placement':True,'verified_monotonic_ns':time.monotonic_ns()}


def release(profile):
    # Slice is unique, locally allocated and validated. Never stop other slices.
    name=profile['slice_unit']
    if not SLICE.fullmatch(name):raise ValueError('private slice identity required')
    before=show(name);before_kernel=kernel(profile['slice_cgroup']) if Path('/sys/fs/cgroup',profile['slice_cgroup'].lstrip('/')).exists() else None
    stopped=invoke(['/usr/bin/systemctl','--user','stop',name]);after=show(name)
    path=Path('/sys/fs/cgroup')/profile['slice_cgroup'].lstrip('/')
    quiet=not path.exists() or kernel(profile['slice_cgroup'])['cgroup.events'].get('populated')=='0'
    return {'slice_unit':name,'before':before,'before_kernel':before_kernel,'stop_returncode':stopped.returncode,
        'after':after,'all_private_slice_descendants_quiet':quiet and after.get('ActiveState') in ('inactive','failed'),
        'release_monotonic_ns':time.monotonic_ns(),'scope':'private owned slice only; no sibling/global mutation'}


def main():
    p=argparse.ArgumentParser();sub=p.add_subparsers(dest='command',required=True)
    a=sub.add_parser('allocate');a.add_argument('--label',required=True);a.add_argument('--birth-monotonic-ns',type=int,required=True);a.add_argument('--max-seconds',type=float,required=True);a.add_argument('--out',type=Path,required=True)
    a=sub.add_parser('release');a.add_argument('--profile',type=Path,required=True);a.add_argument('--out',type=Path,required=True)
    args=p.parse_args()
    value=allocate(args.label,args.birth_monotonic_ns,args.max_seconds,args.out) if args.command=='allocate' else release(load(args.profile))
    if args.command=='release':
        with args.out.open('x') as file:file.write(json.dumps(value,indent=2)+'\n')
    print(json.dumps({k:value.get(k) for k in ('slice_unit','slice_cgroup','aggregate_memory_max_bytes','all_private_slice_descendants_quiet')}))


if __name__=='__main__':main()
