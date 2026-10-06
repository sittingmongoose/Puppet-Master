"""Exact existing private-slice APIs; GLM original clocks and tool-reader bridge."""
import hashlib,importlib.util,json,math,os
from pathlib import Path
import time

HERE=Path(__file__).resolve().parent
LAB=HERE.parents[4]
API=LAB/'dev/luna-route/resource_slice.py'
API_SHA='22d1cac0d12720de9d14ecef1f35e849b80c6f81a523296b023b298abaeee790'
TOOLS=LAB/'dev/tools/versions/v1.4-bundle'

def sha(path):return hashlib.sha256(Path(path).read_bytes()).hexdigest()
def module(name,path):
    spec=importlib.util.spec_from_file_location(name,path);m=importlib.util.module_from_spec(spec);spec.loader.exec_module(m);return m
if sha(API)!=API_SHA:raise ValueError('Existing complete-job resource API drift')
reader=module('glm_private_resource_api',API)

def load(path):return reader.load(path)

def original_clock(profile,birth_ns,max_seconds):
    if type(birth_ns) is not int or birth_ns<=0 or birth_ns>time.monotonic_ns() or not math.isfinite(max_seconds) or max_seconds<=35:
        raise ValueError('Finite original GLM allocation including unchanged cleanup reserve required')
    stop=birth_ns+int(max_seconds*1e9)
    if profile['original_birth_monotonic_ns']!=birth_ns or profile['original_total_stop_monotonic_ns']!=stop:
        raise ValueError('Original resource/stage clock mismatch')
    return stop,stop-30_000_000_000,stop-5_000_000_000

def tool_profile(root_path,out):
    root=load(root_path)
    if sha(TOOLS/'resource_profile.py')!=root['reader_sha256'] or root['reader_sha256']!=API_SHA:
        raise ValueError('Exact byte-identical approved resource reader required; no derived profile stamp')
    return Path(root_path).absolute()

def tool_module():
    pins=json.loads((TOOLS/'SOURCE_PINS.json').read_text())
    for relative,digest in pins['files'].items():
        if sha(TOOLS/relative)!=digest:raise ValueError('Pinned resource-aware tool code drift')
    for path,digest in pins['runtime_binaries'].items():
        if sha(path)!=digest:raise ValueError('Pinned tool runtime executable drift')
    return module('glm_resource_tools_config',TOOLS/'config.py')

def required_source_paths():
    return {*[str(HERE/name) for name in ('stage_worker.py','glm_stage.py','native_support.py','profile.py',
        'component_guard.py','component_gate.py','native_guard.py','pipe_bridge.py','pipe_proxy.py','external_release.py')],
        str(API),str(TOOLS/'SOURCE_PINS.json'),'/usr/bin/python3','/usr/bin/systemd-run','/usr/bin/systemctl',
        '/home/sittingmongoose/.zcode/server/node',
        '/home/sittingmongoose/.local/opt/zcode/app.backup-3.11.2.6792/resources/glm/zcode.cjs'}

def wrapped_tools(spec,root_path,tool_path,out):
    selected=spec['glm_resource']
    if selected.get('version')!='glm_complete2304_bundle_v1':raise ValueError('Explicit prospective GLM complete-resource version required')
    if selected.get('model')!='builtin:zai-coding-plan/GLM-5.3-Flash' or selected.get('effort')!='max':
        raise ValueError('Exact GLM Flash/max binding required')
    chosen=selected.get('tools_config_builder')
    if not isinstance(chosen,dict) or chosen.get('path')!=str(TOOLS/'config.py') or chosen.get('sha256')!=sha(TOOLS/'config.py'):
        raise ValueError('Explicit selected resource-aware tool builder differs from frozen v1.4-bundle')
    pins=selected['source_pins']
    if not isinstance(pins,dict) or not required_source_paths().issubset(pins):
        raise ValueError('Complete selected GLM source/runtime pin closure required before inference')
    for path,digest in pins.items():
        if sha(path)!=digest:raise ValueError('Prospective GLM runtime pin drift')
    builder=tool_module()
    bundle=selected.get('bundle_profile')
    if not isinstance(bundle,dict) or set(bundle)!= {'path','sha256'}:
        raise ValueError('Explicit prospective native bundle profile path and pin required')
    bundle_path=Path(bundle['path']).absolute()
    if any(p.is_symlink() for p in (bundle_path,*bundle_path.parents)) or not bundle_path.is_file() or sha(bundle_path)!=bundle['sha256']:
        raise ValueError('Pinned native bundle profile drift or alias')
    carrier=module('glm_selected_bundle_carrier',TOOLS/'bundle_carrier.py')
    bundle_value=carrier.load_profile(bundle_path)
    if bundle_value['stage_id']!=spec['job_id'] or bundle_value['arm_id']!=spec['arm']:
        raise ValueError('Native bundle profile must bind this exact registered stage and arm')
    profile=load(root_path);stop=profile['original_total_stop_monotonic_ns']
    config=builder.mcp_configs(Path(spec['workspace']),capture_dir=selected['capture_dir'],
        evidence_dir=selected['evidence_dir'],deadline_monotonic_ns=stop,
        execution_enabled=selected['execution_enabled'],public_get=selected['public_get'],
        resource_profile_path=tool_path,bundle_profile_path=bundle_path)
    if config.get('native_bundle_enabled') is not True or config.get('bundle_profile_sha256')!=bundle['sha256']:
        raise ValueError('Exact selected native bundle profile was not applied by actual builder')
    original_config=json.loads(Path(spec['tools_config']).read_text())
    if set(original_config.get('tool_allowlist',[]))!=set(config['tool_allowlist']):
        raise ValueError('Prospective resource wrapper must preserve exact admitted tool permissions/factor')
    for server in config['mcp_servers']:
        name=server['name']
        if name not in ('pm_boundary','pm_execution'):raise ValueError('Unregistered GLM resource component')
        command=[server['command'],*server['args']]
        server.update(command='/usr/bin/python3',args=['-I','-B',str(HERE/'component_guard.py'),
            '--resource-profile',str(root_path),'--component',name,'--stop-ns',str(stop-5_000_000_000),
            '--record',str(Path(out)/(name+'-resource.json')),'--cwd',spec['workspace'],'--',*command])
    config['_glm_root_resource_profile']=str(root_path)
    return config

def preactivation_proof(path,native_out,servers):
    profile=load(path);native_record=json.loads((Path(native_out)/'native-host.json').read_text())
    records=[('native',native_record)]
    for server in servers:
        records.append((server['name'],json.loads((Path(native_out)/(server['name']+'-resource.json')).read_text())))
    facts=[];helpers=[]
    for component,record in records:
        if record.get('verified_before_command_exec') is not True:raise ValueError('Resource gate did not execute before component start')
        facts.append(reader.verify(profile,record['unit'],component))
        for key in ('guard_pid','service_runner_pid'):
            helpers.append(reader.verify_pid_placement(record[key],record['helper_cgroup']))
        helpers.append(reader.verify_pid_placement(int(facts[-1]['unit_observation']['MainPID']),profile['slice_cgroup']+'/'+record['unit']))
    all_existing_pids=[]
    for group in Path('/sys/fs/cgroup',profile['slice_cgroup'].lstrip('/')).rglob('cgroup.procs'):
        cgroup='/'+str(group.parent.relative_to('/sys/fs/cgroup'))
        for pid in group.read_text().split():
            all_existing_pids.append(reader.verify_pid_placement(int(pid),cgroup))
    return {'component_placements':facts,'retained_helper_placements':helpers,'all_existing_private_job_pids':all_existing_pids,
            'aggregate_memory_max_bytes':profile['aggregate_memory_max_bytes'],'swap_max_bytes':0,
            'verified_before_native_goal':True,'fit':'UNKNOWN'}

def component_records_quiet(out,servers):
    records=[Path(out)/'native-host.json',*[Path(out)/(s['name']+'-resource.json') for s in servers]]
    values=[json.loads(p.read_text()) for p in records if p.exists()]
    return len(values)==len(records) and all(r.get('cgroup_absent_or_empty') is True for r in values)

def close_components(root_path,out,servers):
    resource=load(root_path);proofs=[]
    files=[Path(out)/'native-host.json',*[Path(out)/(s['name']+'-resource.json') for s in servers]]
    for path in files:
        if not path.exists():raise ValueError('Owned component lifecycle record absent')
        record=json.loads(path.read_text());unit=record['unit']
        if not __import__('re').fullmatch(r'er9-glm-[0-9a-f]{32}\.service',unit):raise ValueError('Exact owned component unit required')
        expected=resource['slice_cgroup']+'/'+unit
        if record.get('control_group') not in (None,expected) or record.get('actual_cgroup') not in (None,expected):
            raise ValueError('Component cgroup identity differs from private job')
        before=reader.show(unit)
        if before.get('ControlGroup') not in ('',expected,None):raise ValueError('Live component outside owned slice')
        for command in [('kill','--signal=SIGKILL','--kill-whom=all'),('stop',)]:
            reader.invoke(['/usr/bin/systemctl','--user',*command,unit],timeout=2)
        after=reader.show(unit);cg=Path('/sys/fs/cgroup')/expected.lstrip('/')
        quiet=after.get('ActiveState') in ('inactive','failed') and (not cg.exists() or reader.kernel(expected)['cgroup.events'].get('populated')=='0')
        proofs.append({'unit':unit,'component':record['component'],'before':before,'after':after,'private_cgroup_quiet':quiet})
    return {'all_components_quiet':len(proofs)==len(files) and all(p['private_cgroup_quiet'] for p in proofs),'components':proofs}
