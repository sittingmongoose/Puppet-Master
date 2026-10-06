"""Read-only exact owned PID/cgroup proof. Never inspect or signal a PGID.

Only trusted host process records and execution unit identifiers are read.
Candidate code/data, credentials, session bodies and tool contents are excluded.
"""
import argparse
import hashlib
import json
import os
from pathlib import Path
import re
import subprocess
import time

NATIVE_UNIT=re.compile(r'er9-luna-[0-9a-f]{32}\.service')
EXEC_UNIT=re.compile(r'er9-exec-[0-9a-f]{32}\.service')


def regular(path):
    path=Path(path).absolute()
    if any(p.is_symlink() for p in (path,*path.parents)) or not path.is_file() or path.stat().st_uid!=os.getuid():
        raise ValueError('trusted owned regular metadata file required')
    return path


def encoded(value):return json.dumps(value,sort_keys=True,separators=(',',':')).encode()


def observe_unit(unit,timeout):
    env={'PATH':'/usr/bin:/bin','HOME':str(Path.home()),
         'XDG_RUNTIME_DIR':'/run/user/'+str(os.getuid()),
         'DBUS_SESSION_BUS_ADDRESS':'unix:path=/run/user/'+str(os.getuid())+'/bus'}
    p=subprocess.run(['/usr/bin/systemctl','--user','show',unit,
        '--property=LoadState,ActiveState,SubState,MainPID,ControlGroup'],env=env,
        capture_output=True,text=True,timeout=timeout)
    fields=dict(v.split('=',1) for v in p.stdout.splitlines() if '=' in v)
    return {'query_returncode':p.returncode,'load_state':fields.get('LoadState'),
            'active_state':fields.get('ActiveState'),'sub_state':fields.get('SubState'),
            'main_pid':int(fields.get('MainPID') or 0),'control_group':fields.get('ControlGroup')}


def pid_fact(pid):
    if type(pid) is not int or pid<=1:return {'pid':pid,'state':'UNESTABLISHED','terminated':False}
    try:
        text=Path('/proc',str(pid),'stat').read_text();state=text[text.rfind(')')+2:].split()[0]
        return {'pid':pid,'state':state,'terminated':state=='Z'}
    except FileNotFoundError:return {'pid':pid,'state':'absent','terminated':True}
    except (OSError,IndexError):return {'pid':pid,'state':'QUERY_UNAVAILABLE','terminated':False}


def cgroup_fact(cg,unit):
    if cg in ('',None):return {'control_group':cg,'absent_or_empty':True}
    expected='/user.slice/user-'+str(os.getuid())+'.slice/user@'+str(os.getuid())+'.service/app.slice/'+unit
    if cg!=expected:raise ValueError('exact owned service cgroup required')
    path=Path('/sys/fs/cgroup')/cg.lstrip('/')
    if not path.exists():return {'control_group':cg,'absent_or_empty':True,'state':'absent'}
    try:empty=not (path/'cgroup.procs').read_text().strip()
    except OSError:return {'control_group':cg,'absent_or_empty':False,'state':'QUERY_UNAVAILABLE'}
    return {'control_group':cg,'absent_or_empty':empty,'state':'empty' if empty else 'populated'}


def unit_quiet(observation,original_cgroup,pids):
    return (observation['query_returncode']==0 and observation['active_state'] in ('inactive','failed')
        and observation['main_pid']==0 and original_cgroup['absent_or_empty']
        and all(p['terminated'] for p in pids))


def prove(native_out,workspace=None,deadline_ns=None,unit_observer=observe_unit,
          pid_observer=pid_fact,cgroup_observer=cgroup_fact):
    native_out=Path(native_out).absolute()
    result=json.loads(regular(native_out/'result.json').read_text())
    namespaces=result.get('allowed_client_tools',{})
    if not set(namespaces)<= {'pm_boundary','pm_execution'}:raise ValueError('unadmitted namespace record')
    if 'pm_execution' in namespaces and workspace is None:
        raise ValueError('execution-enabled proof requires exact trusted workspace')
    if workspace is not None:
        workspace=Path(workspace).absolute()
        if any(p.is_symlink() for p in (workspace,*workspace.parents)) or not workspace.is_dir() or workspace.stat().st_uid!=os.getuid():
            raise ValueError('trusted owned workspace directory required')
    names=['host-process',*(name+'-host-process' for name in sorted(namespaces))]
    rows=[]
    def timeout():
        seconds=2 if deadline_ns is None else min(2,(deadline_ns-time.monotonic_ns())/1e9)
        if seconds<=0:raise TimeoutError('original owned-proof deadline')
        return seconds
    for name in names:
        path=regular(native_out/(name+'.json'));record=json.loads(path.read_text());unit=record.get('unit')
        if not isinstance(unit,str) or not NATIVE_UNIT.fullmatch(unit):raise ValueError('owned native unit name required')
        observation=unit_observer(unit,timeout())
        original=cgroup_observer(record.get('control_group'),unit)
        current=cgroup_observer(observation.get('control_group'),unit)
        pids=[pid_observer(record.get(k)) for k in ('guard_pid','native_host_pid','service_runner_pid')]
        quiet=unit_quiet(observation,original,pids) and current['absent_or_empty']
        rows.append({'component':name,'unit':unit,'record_sha256':hashlib.sha256(path.read_bytes()).hexdigest(),
            'original_recorded_pgid':record.get('native_host_pgid'),
            'pgid_not_used_for_ownership_or_cleanup':True,'unit_observation':observation,
            'original_cgroup_observation':original,'current_cgroup_observation':current,
            'exact_pid_observations':pids,'quiet':quiet})
    executions=[]
    if workspace is not None:
        for path in sorted((Path(workspace)/'operation_receipts/executions').glob('*/request.json')):
            path=regular(path);unit=json.loads(path.read_text()).get('unit')
            if not isinstance(unit,str) or not EXEC_UNIT.fullmatch(unit):raise ValueError('owned execution unit name required')
            observation=unit_observer(unit,timeout());cg=cgroup_observer(observation.get('control_group'),unit)
            quiet=unit_quiet(observation,cg,[]) and cg['absent_or_empty']
            executions.append({'unit':unit,'request_metadata_sha256':hashlib.sha256(path.read_bytes()).hexdigest(),
                'unit_observation':observation,'cgroup_observation':cg,'quiet':quiet})
    receipt={'schema':'er9.luna.owned-scope-proof.v1','observation_monotonic_ns':time.monotonic_ns(),
        'observation_epoch':time.time(),'thread_id':result.get('thread_id'),
        'reader_sha256':hashlib.sha256(Path(__file__).read_bytes()).hexdigest(),
        'native_receipt_sha256':hashlib.sha256((native_out/'result.json').read_bytes()).hexdigest(),
        'services':rows,'execution_units':executions,
        'native_owned_processes_quiet':rows[0]['quiet'],
        'client_tool_owned_processes_quiet':all(r['quiet'] for r in rows[1:]),
        'execution_units_quiet':all(r['quiet'] for r in executions),
        'all_owned_scopes_quiet':all(r['quiet'] for r in rows) and all(r['quiet'] for r in executions),
        'mutations_performed':False,'scope':'exact trusted named units, original cgroups and exact PIDs only; no PGID release or source grade'}
    receipt['receipt_sha256']=hashlib.sha256(encoded(receipt)).hexdigest()
    return receipt


def main():
    p=argparse.ArgumentParser();p.add_argument('--native-out',type=Path,required=True)
    p.add_argument('--workspace',type=Path);p.add_argument('--out',type=Path,required=True)
    p.add_argument('--deadline-monotonic-ns',type=int);args=p.parse_args()
    receipt=prove(args.native_out,args.workspace,args.deadline_monotonic_ns)
    with args.out.open('x') as file:file.write(json.dumps(receipt,indent=2)+'\n')
    print(json.dumps({'all_owned_scopes_quiet':receipt['all_owned_scopes_quiet'],
                      'receipt_sha256':receipt['receipt_sha256'],'out':str(args.out)}))
    return 0 if receipt['all_owned_scopes_quiet'] else 1


if __name__=='__main__':raise SystemExit(main())
