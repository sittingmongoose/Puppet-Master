"""Trusted MCP adapter; arbitrary candidate Python runs ONLY in sibling bwrap.

No shell, path, environment, package installer, or network argument is accepted.
The parent must be started by the trusted host, not inside candidate confinement.
"""
import argparse
import datetime
import hashlib
import importlib.util
import json
import os
from pathlib import Path
import selectors
import subprocess
import sys
import tempfile
import time
import uuid

HERE = Path(__file__).resolve().parent
MAX_CODE = 65536
MAX_DATA = 65536
MAX_STREAM = 32768
WALL_SECONDS = 5
VERSION = 'er9-python-bwrap-v1.3'
BOOTSTRAP_MARKER = b'ER9_TRUSTED_BOOTSTRAP_EXEC_START\n'
TOOL = {'name': 'python_execute', 'description': 'Execute candidate-authored Python with JSON data as variable data. Standard-library arithmetic, arrays, strings, JSON and small functions. Fresh empty filesystem; no network, credentials or case/evaluator files. stdout/stderr are capped; receipts record code/data/exit/limits. This is an isolated component check, not proof of application behavior.',
        'inputSchema': {'type': 'object', 'properties': {'code': {'type': 'string'}, 'data': {}}, 'required': ['code'], 'additionalProperties': False}}
BOOTSTRAP = b'''import json, resource, sys
resource.setrlimit(resource.RLIMIT_CPU, (3, 3))
resource.setrlimit(resource.RLIMIT_AS, (256*1024*1024, 256*1024*1024))
resource.setrlimit(resource.RLIMIT_FSIZE, (1024*1024, 1024*1024))
resource.setrlimit(resource.RLIMIT_NOFILE, (64, 64))
resource.setrlimit(resource.RLIMIT_CORE, (0, 0))
data = json.loads(open('/work/data.json').read())
sys.stderr.write('ER9_TRUSTED_BOOTSTRAP_EXEC_START\\n'); sys.stderr.flush()
exec(compile(open('/work/code.py').read(), '/work/code.py', 'exec'), {'__name__':'__main__', 'data':data})
'''

def encoded(value):
    return json.dumps(value, ensure_ascii=False, allow_nan=False, sort_keys=True, separators=(',', ':')).encode()

def sha(raw):
    return hashlib.sha256(raw).hexdigest()

def directory(path):
    p = Path(path).absolute()
    if any(q.is_symlink() for q in (p, *p.parents)):
        raise ValueError('symlink directory denied')
    p.mkdir(mode=0o700, parents=True, exist_ok=True)
    if not p.is_dir() or p.stat().st_uid != os.getuid():
        raise ValueError('owned directory required')
    return p.resolve()

def exclusive(path, raw):
    with path.open('xb') as f:
        f.write(raw)

def load_resource(path):
    spec=importlib.util.spec_from_file_location('execution_resource_reader',HERE/'resource_profile.py')
    reader=importlib.util.module_from_spec(spec);spec.loader.exec_module(reader)
    return reader,reader.load(path)

def trusted_service_env():
    # Native frontends intentionally sanitize their MCP environment. All user
    # manager calls need the same explicit supported local bus selection.
    return {'PATH':'/usr/bin:/bin', 'HOME':str(Path.home()),
            'XDG_RUNTIME_DIR':'/run/user/'+str(os.getuid()),
            'DBUS_SESSION_BUS_ADDRESS':'unix:path=/run/user/'+str(os.getuid())+'/bus'}

def observe_cleanup(unit):
    env=trusted_service_env()
    stopped=subprocess.run(['/usr/bin/systemctl','--user','stop',unit],env=env,capture_output=True,timeout=2)
    observed=subprocess.run(['/usr/bin/systemctl','--user','show',unit,'--property=LoadState','--property=ActiveState','--property=ControlGroup'],env=env,capture_output=True,timeout=2)
    raw=observed.stdout.decode('utf-8','replace')
    props=dict(line.split('=',1) for line in raw.splitlines() if '=' in line)
    load=props.get('LoadState');state=props.get('ActiveState');cg=props.get('ControlGroup')
    cg_absent=None;cg_populated=None
    if cg and cg.startswith('/') and '..' not in Path(cg).parts:
        path=Path('/sys/fs/cgroup')/cg.lstrip('/')
        cg_absent=not path.exists()
        if not cg_absent:
            try:
                events=dict(line.split() for line in (path/'cgroup.events').read_text().splitlines())
                cg_populated=events.get('populated')
            except OSError: pass
    absent=observed.returncode==0 and load=='not-found' and state=='inactive' and cg==''
    inactive=observed.returncode==0 and load=='loaded' and state in ('inactive','failed') and (cg=='' or cg_absent is True or cg_populated=='0')
    return {'cleanup_confirmed':absent or inactive,
            'cleanup_classification':'collected_unit_absent' if absent else 'inactive_unit' if inactive else 'unconfirmed',
            'unit_active_state_after_stop':state or 'QUERY_UNAVAILABLE',
            'unit_load_state_after_stop':load or 'QUERY_UNAVAILABLE',
            'cleanup_stop_returncode':stopped.returncode, 'cleanup_state_returncode':observed.returncode,
            'cleanup_stop_stdout':stopped.stdout.decode('utf-8','replace'), 'cleanup_stop_stderr':stopped.stderr.decode('utf-8','replace'),
            'cleanup_query_stdout':raw, 'cleanup_query_stderr':observed.stderr.decode('utf-8','replace'),
            'control_group_after_stop':cg, 'control_group_absent_after_stop':cg_absent, 'control_group_populated_after_stop':cg_populated}

def sandbox_command(run):
    cmd = ['/usr/bin/bwrap', '--unshare-all', '--die-with-parent', '--new-session', '--cap-drop', 'ALL', '--clearenv', '--tmpfs', '/', '--proc', '/proc', '--dev', '/dev', '--tmpfs', '/tmp', '--dir', '/work', '--dir', '/runtime']
    # Same read-only runtime mounts as the inherited ER8 trusted mechanical boundary.
    for path in ('/usr', '/lib', '/lib64'):
        if Path(path).exists():
            cmd += ['--ro-bind', path, path]
    for name in ('code.py', 'data.json'):
        cmd += ['--ro-bind', str(run / name), '/work/' + name]
    cmd += ['--ro-bind', str(run / 'bootstrap.py'), '/runtime/bootstrap.py', '--setenv', 'LANG', 'C.UTF-8', '--setenv', 'PYTHONHASHSEED', '0', '--chdir', '/work', '--', '/usr/bin/python3', '-I', '-S', '-B', '/runtime/bootstrap.py']
    return cmd

def execute(args, evidence, actor='candidate', deadline_ns=None, resource_profile_path=None):
    if not isinstance(args, dict) or set(args) - {'code', 'data'} or not isinstance(args.get('code'), str):
        raise ValueError('code string and optional JSON data only')
    code = args['code'].encode()
    data = encoded(args.get('data', None))
    if len(code) > MAX_CODE or len(data) > MAX_DATA:
        raise ValueError('code/data cap exceeded')
    started = time.monotonic()
    reader=None;profile=None;profile_sha=None
    if resource_profile_path is not None:
        reader,profile=load_resource(resource_profile_path)
        profile_sha=sha(Path(resource_profile_path).read_bytes())
        resource_stop=profile['original_total_stop_monotonic_ns']
        deadline_ns=resource_stop if deadline_ns is None else min(deadline_ns,resource_stop)
    remaining = WALL_SECONDS if deadline_ns is None else min(WALL_SECONDS, (deadline_ns-time.monotonic_ns())/1e9)
    if remaining <= 0:
        raise ValueError('stage deadline exhausted')
    evidence = directory(evidence)
    # The trusted host owns these records; sandbox receives only read-only files.
    if len(list(evidence.iterdir())) >= 256:
        raise ValueError('execution evidence count cap')
    run = Path(tempfile.mkdtemp(prefix='exec-', dir=evidence))
    unit = 'er9-exec-' + uuid.uuid4().hex + '.service'
    for name, raw in (('code.py', code), ('data.json', data), ('bootstrap.py', BOOTSTRAP)):
        exclusive(run / name, raw)
    payload=sandbox_command(run)
    if profile is not None:
        payload=['/usr/bin/python3','-I','-B',str(HERE/'resource_gate.py'),'--resource-profile',str(Path(resource_profile_path).absolute()),
                 '--unit',unit,'--receipt',str(run/'resource_placement.json'),'--',*payload]
    cmd = ['/usr/bin/systemd-run', '--user', '--quiet', '--wait', '--pipe', '--collect', '--unit=' + unit,
           '--property=Type=exec', '--property=MemoryMax=256M', '--property=TasksMax=16', '--property=MemorySwapMax=0',
           '--property=RuntimeMaxSec=' + str(remaining) + 's', '--property=KillMode=control-group',
           '--property=KillSignal=SIGKILL', '--property=SendSIGKILL=yes', '--property=TimeoutStopSec=1s', '--property=Restart=no']
    if profile is not None:cmd+=['--slice='+profile['slice_unit']]
    cmd+=['--',*payload]
    request = {'schema': 'er9.execution.request.v1', 'actor': actor, 'requested_execution_label': 'executed by candidate' if actor == 'candidate' else 'executed only by evaluator',
               'started_utc':datetime.datetime.now(datetime.timezone.utc).isoformat(), 'python_version':sys.version,
               'code_sha256': sha(code), 'data_sha256': sha(data), 'bootstrap_sha256': sha(BOOTSTRAP), 'server_sha256': sha(Path(__file__).read_bytes()),
               'python_binary_sha256': sha(Path('/usr/bin/python3').read_bytes()), 'bwrap_binary_sha256': sha(Path('/usr/bin/bwrap').read_bytes()),
               'unit': unit, 'command': cmd, 'deadline_monotonic_ns': deadline_ns,
               'resource_profile_sha256':profile_sha,'private_aggregate_slice_unit':profile['slice_unit'] if profile else None,
               'limits': {'wall_seconds': remaining, 'cpu_seconds': 3, 'memory_bytes': 268435456, 'tasks':16, 'stream_bytes_each':MAX_STREAM, 'network':'new empty namespace'}}
    exclusive(run / 'request.json', encoded(request) + b'\n')
    proc = subprocess.Popen(cmd, stdin=subprocess.DEVNULL, stdout=subprocess.PIPE, stderr=subprocess.PIPE, env=trusted_service_env())
    output = {'stdout':bytearray(), 'stderr':bytearray()}
    sel = selectors.DefaultSelector()
    for name, stream in (('stdout',proc.stdout), ('stderr',proc.stderr)):
        os.set_blocking(stream.fileno(), False)
        sel.register(stream, selectors.EVENT_READ, name)
    stopped = None
    until = started + remaining + 2
    try:
        while sel.get_map():
            if time.monotonic() >= until:
                stopped = stopped or 'wall_or_cleanup_cap'
                break
            for key, _ in sel.select(min(.1, max(0, until-time.monotonic()))):
                raw = os.read(key.fileobj.fileno(), 65536)
                if not raw:
                    sel.unregister(key.fileobj)
                    continue
                name = key.data
                room = MAX_STREAM - len(output[name])
                output[name] += raw[:room]
                if len(raw) > room:
                    stopped = 'output_cap'
                    break
            if stopped:
                break
    finally:
        sel.close()
        if stopped or proc.poll() is None:
            subprocess.run(['/usr/bin/systemctl','--user','kill','--signal=SIGKILL','--kill-whom=all',unit], env=trusted_service_env(), capture_output=True, timeout=2)
        try:
            exit_code = proc.wait(timeout=2)
        except subprocess.TimeoutExpired:
            proc.kill(); exit_code = proc.wait(timeout=2)
        # Always target only this randomly assigned unit; its KillMode kills descendants.
        cleanup = observe_cleanup(unit)
        proc.stdout.close(); proc.stderr.close()
    rawout, observed_err = bytes(output['stdout']), bytes(output['stderr'])
    bootstrap_started = observed_err.startswith(BOOTSTRAP_MARKER)
    rawerr = observed_err[len(BOOTSTRAP_MARKER):] if bootstrap_started else observed_err
    exclusive(run / 'stderr-observed.bin', observed_err)
    exclusive(run / 'stdout.bin', rawout); exclusive(run / 'stderr.bin', rawerr)
    resource_facts=None;resource_after=None;resource_error=None
    if profile is not None:
        placement=run/'resource_placement.json'
        if placement.exists():resource_facts=json.loads(placement.read_text())
        try:resource_after=reader.kernel(profile['slice_cgroup'])
        except Exception as exc:resource_error=type(exc).__name__
    result = {'schema':'er9.execution.result.v1', 'execution_id':run.name,
              'execution_label':request['requested_execution_label'] if bootstrap_started else 'UNEXECUTED: trusted bootstrap did not start candidate code', 'actor':actor,
              'bootstrap_started':bootstrap_started, 'bootstrap_marker_sha256':sha(BOOTSTRAP_MARKER),
              'completed_utc':datetime.datetime.now(datetime.timezone.utc).isoformat(),
              **cleanup,
              'resource_profile_sha256':profile_sha,'resource_placement':resource_facts,
              'resource_aggregate_after_execution':resource_after,'resource_aggregate_observation_error':resource_error,
              'code_sha256':sha(code), 'data_sha256':sha(data), 'stdout':rawout.decode('utf-8','replace'), 'stderr':rawerr.decode('utf-8','replace'),
              'stdout_sha256':sha(rawout), 'stderr_sha256':sha(rawerr), 'stdout_bytes':len(rawout), 'stderr_bytes':len(rawerr),
              'exit_code':exit_code, 'exit_scope':'systemd-run propagated service exit; signal/infrastructure exits remain distinguishable in stderr',
              'elapsed_seconds':time.monotonic()-started, 'stopped_by_adapter':stopped, 'limits':request['limits'],
              'limitations':['isolated component check only','stderr excludes trusted bootstrap prefix; stderr-observed.bin retains wire bytes','arbitrary stdlib code; kernel isolation supplied by Bubblewrap/systemd, not AST filters','clock/randomness remain available; deterministic behavior must be candidate-authored','execution receipts do not prove semantic correctness or candidate consumption']}
    exclusive(run / 'result.json', encoded(result) + b'\n')
    return result

def mcp(evidence, actor, deadline_ns, resource_profile_path=None):
    # Never mix kernel readiness with BufferedReader.readline(): one read-ahead
    # can hold the next complete frame while select sees no more pipe bytes.
    fd=sys.stdin.fileno();os.set_blocking(fd,False)
    sel=selectors.DefaultSelector();sel.register(fd,selectors.EVENT_READ)
    pending=bytearray();eof=False
    try:
        while deadline_ns is None or time.monotonic_ns()<deadline_ns:
            if b'\n' in pending:
                end=pending.index(b'\n')+1
                raw=bytes(pending[:end]);del pending[:end]
                if len(raw)>=200000:return 2
                try: req=json.loads(raw)
                except (ValueError,UnicodeError):return 2
                if not isinstance(req,dict):return 2
                if 'id' not in req:continue
                try:
                    method=req['method']
                    if method=='initialize':result={'protocolVersion':'2024-11-05','capabilities':{'tools':{}},'serverInfo':{'name':'pm_execution','version':VERSION}}
                    elif method=='tools/list':result={'tools':[TOOL]}
                    elif method=='ping':result={}
                    elif method=='tools/call':
                        if req['params']['name']!=TOOL['name']:raise ValueError('unadmitted tool')
                        value=execute(req['params'].get('arguments',{}),evidence,actor,deadline_ns,resource_profile_path)
                        result={'content':[{'type':'text','text':json.dumps(value,ensure_ascii=False)}],'isError':False}
                    else:raise ValueError('unadmitted method')
                except Exception as exc:
                    result={'content':[{'type':'text','text':'execution boundary failure: '+type(exc).__name__}],'isError':True}
                print(json.dumps({'jsonrpc':'2.0','id':req['id'],'result':result},ensure_ascii=False),flush=True)
                continue
            if len(pending)>=200000:return 2
            if eof:return 2 if pending else 0
            remaining=3600 if deadline_ns is None else max(0,(deadline_ns-time.monotonic_ns())/1e9)
            if not sel.select(min(1,remaining)):continue
            try:raw=os.read(fd,65536)
            except BlockingIOError:continue
            if raw:pending.extend(raw)
            else:eof=True
        return 0
    finally:sel.close()

def main():
    p=argparse.ArgumentParser(); p.add_argument('--evidence-dir', required=True); p.add_argument('--actor', choices=['candidate','evaluator'], default='candidate'); p.add_argument('--deadline-monotonic-ns',type=int); p.add_argument('--request-json');p.add_argument('--resource-profile')
    a=p.parse_args()
    evidence=directory(a.evidence_dir)
    if a.resource_profile:
        _,profile=load_resource(a.resource_profile)
        stop=profile['original_total_stop_monotonic_ns']
        a.deadline_monotonic_ns=stop if a.deadline_monotonic_ns is None else min(stop,a.deadline_monotonic_ns)
    if a.request_json:
        print(json.dumps(execute(json.loads(Path(a.request_json).read_text()),evidence,a.actor,a.deadline_monotonic_ns,a.resource_profile),ensure_ascii=False)); return 0
    return mcp(evidence,a.actor,a.deadline_monotonic_ns,a.resource_profile)

if __name__=='__main__': raise SystemExit(main())
