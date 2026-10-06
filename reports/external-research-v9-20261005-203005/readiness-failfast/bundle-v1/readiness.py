"""Pre-Goal fail-closed observation of exact owned terminal-and-quiet components."""
from __future__ import annotations
import hashlib,json,os,re,stat,time
from pathlib import Path

MAX_RECORD_BYTES=16384
UNIT=re.compile(r'er9-glm-[0-9a-f]{32}\.service')
COMPONENTS={'native','pm_boundary','pm_execution'}

class OwnedComponentReadinessTerminated(RuntimeError):
    def __init__(self,evidence):
        super().__init__('Expected owned component terminated and quiet before resource readiness')
        self.evidence=evidence

def sha(path):return hashlib.sha256(Path(path).read_bytes()).hexdigest()
def record_name(component):
    if component not in COMPONENTS:raise ValueError('Expected registered owned component required')
    return 'native-host.json' if component=='native' else component+'-resource.json'

def write_owner_intent(resource,profile_path,record,unit,component,guard_pid,helper_cgroup,stop_ns):
    """One immutable administrative intent, written by the guard before unit launch."""
    record=Path(record)
    if record.name!=record_name(component) or not UNIT.fullmatch(unit):raise ValueError('Exact owned component record required')
    if type(guard_pid) is not int or guard_pid<=0 or stop_ns!=resource['original_total_stop_monotonic_ns']-5_000_000_000:raise ValueError('Original owned component identity/stop required')
    intent={'schema':'er9.glm.component-owner-intent.v1','unit':unit,'component':component,'guard_pid':guard_pid,
        'helper_cgroup':helper_cgroup,'record_basename':record.name,'resource_profile_sha256':sha(profile_path),
        'original_birth_monotonic_ns':resource['original_birth_monotonic_ns'],
        'original_total_stop_monotonic_ns':resource['original_total_stop_monotonic_ns'],
        'immutable_stop_monotonic_ns':stop_ns,'expected_component_cgroup':resource['slice_cgroup']+'/'+unit}
    path=record.with_suffix('.ownership.json')
    fd=os.open(path,os.O_WRONLY|os.O_CREAT|os.O_EXCL|os.O_NOFOLLOW,0o400)
    try:
        raw=(json.dumps(intent,sort_keys=True)+'\n').encode();view=memoryview(raw)
        while view:
            count=os.write(fd,view)
            if count<=0:raise OSError('Incomplete owned intent write')
            view=view[count:]
        os.fsync(fd)
    finally:os.close(fd)
    return path

def bounded_record(path):
    """Only trusted private regular records; malformed/absent facts are UNKNOWN."""
    p=Path(path)
    try:
        if any(x.is_symlink() for x in (p,*p.parents)):return None
        fd=os.open(p,os.O_RDONLY|os.O_NOFOLLOW)
        try:
            st=os.fstat(fd)
            if not stat.S_ISREG(st.st_mode) or st.st_nlink!=1 or st.st_size>MAX_RECORD_BYTES:return None
            raw=os.read(fd,MAX_RECORD_BYTES+1)
        finally:os.close(fd)
        if len(raw)>MAX_RECORD_BYTES:return None
        value=json.loads(raw)
        return value if isinstance(value,dict) else None
    except (OSError,ValueError,UnicodeError):return None

def terminal_failure(owner,resource,profile_sha,now_ns):
    """Return evidence only for a fully joined positive closure; never infer zero starts."""
    component=owner['component'];record=Path(owner['record_path']);guard_pid=owner['guard_pid']
    if record.name!=record_name(component) or type(guard_pid) is not int or guard_pid<=0:return None
    intent_path=record.with_suffix('.ownership.json');intent=bounded_record(intent_path);value=bounded_record(record)
    if intent is None or value is None or intent.get('schema')!='er9.glm.component-owner-intent.v1':return None
    unit=intent.get('unit');birth=resource['original_birth_monotonic_ns'];total=resource['original_total_stop_monotonic_ns'];stop=total-5_000_000_000
    if not isinstance(unit,str) or not UNIT.fullmatch(unit):return None
    expected_cgroup=resource['slice_cgroup']+'/'+unit
    joins={'component':component,'guard_pid':guard_pid,'immutable_stop_monotonic_ns':stop}
    if any(intent.get(k)!=v or value.get(k)!=v for k,v in joins.items()):return None
    if any(type(x.get(k)) is not int for x in (intent,value) for k in ('guard_pid','immutable_stop_monotonic_ns')):return None
    if value.get('unit')!=unit or intent.get('resource_profile_sha256')!=profile_sha or intent.get('record_basename')!=record.name:return None
    if intent.get('original_birth_monotonic_ns')!=birth or intent.get('original_total_stop_monotonic_ns')!=total or intent.get('expected_component_cgroup')!=expected_cgroup:return None
    helper=intent.get('helper_cgroup')
    if not isinstance(helper,str) or not helper.startswith(resource['slice_cgroup']+'/') or value.get('helper_cgroup')!=helper:return None
    closed=value.get('closed_monotonic_ns');exit_code=value.get('service_runner_exit_code');terminal=value.get('terminal_unit_observation')
    if type(closed) is not int or not birth<=closed<=min(now_ns,total) or type(exit_code) is not int:return None
    if value.get('verified_before_command_exec') is not False or value.get('cgroup_absent_or_empty') is not True or not isinstance(terminal,dict):return None
    if terminal.get('ActiveState') not in ('inactive','failed') or terminal.get('MainPID') not in ('0',0) or terminal.get('MainPID') is False or terminal.get('ControlGroup')!='':return None
    if terminal.get('LoadState') not in ('loaded','not-found'):return None
    return {'schema':'er9.glm.pregoal-owned-readiness-failure.v1','unit':unit,'component':component,
        'guard_pid':guard_pid,'immutable_stop_monotonic_ns':stop,'closed_monotonic_ns':closed,
        'service_runner_exit_code':exit_code,'terminal_active_state':terminal['ActiveState'],
        'terminal_MainPID':0,'terminal_ControlGroup':'','owned_cgroup_absent_or_empty':True,
        'resource_profile_sha256':profile_sha,'owner_intent':{'path':str(intent_path),'sha256':sha(intent_path)},
        'terminal_record':{'path':str(record),'sha256':sha(record)},
        'backend_immediate_termination_cause':'UNKNOWN','billing':'UNKNOWN','actual_native_Goal_status':'UNEXPOSED',
        'scope':'positive owned readiness closure only; no actual Goal-start or zero-cost inference'}

def wait_for_resource_gates(owners,resource,profile_sha,action_stop_monotonic,poll,now=time.monotonic,now_ns=time.monotonic_ns):
    """Same readiness and original stop; add prompt failure on proved owned closure."""
    if not owners or any(set(o)!={'component','guard_pid','record_path'} for o in owners):raise ValueError('Exact owned readiness mapping required')
    components=[o['component'] for o in owners]
    if 'native' not in components or len(set(components))!=len(components) or any(c not in COMPONENTS for c in components):raise ValueError('Unique registered owned readiness components required')
    if len({str(o['record_path']) for o in owners})!=len(owners):raise ValueError('Distinct owned readiness records required')
    while True:
        # The actual preactivation kernel/placement proof remains the caller's next step.
        if all(Path(o['record_path']).exists() and json.loads(Path(o['record_path']).read_text()).get('verified_before_command_exec') is True for o in owners):return
        if now()>=action_stop_monotonic:raise TimeoutError('Original native stop before resource gates')
        for owner in owners:
            evidence=terminal_failure(owner,resource,profile_sha,now_ns())
            if evidence is not None:raise OwnedComponentReadinessTerminated(evidence)
        poll(.1)
