"""Trusted operator config builder. No candidate-supplied host paths."""
import importlib.util
import hashlib
from pathlib import Path
import time

HERE=Path(__file__).resolve().parent
spec=importlib.util.spec_from_file_location('er9_source_boundary',HERE/'source_capture/boundary.py')
source=importlib.util.module_from_spec(spec);spec.loader.exec_module(source)

def mcp_configs(workspace, capture_dir=None, evidence_dir=None, deadline_monotonic_ns=None, execution_enabled=False, public_get=False, resource_profile_path=None):
    ws=Path(workspace).absolute()
    if any(p.is_symlink() for p in (ws,*ws.parents)): raise ValueError('workspace symlink denied')
    resource_profile=None
    if resource_profile_path is not None:
        profile_path=Path(resource_profile_path).absolute()
        for candidate_path in (ws/'inputs',ws/'out'):
            if profile_path==candidate_path or candidate_path in profile_path.parents:raise ValueError('resource profile must remain outside candidate namespaces')
        if profile_path==ws/'TASK.md':raise ValueError('resource profile must remain private')
        spec=importlib.util.spec_from_file_location('config_resource_reader',HERE/'resource_profile.py')
        reader=importlib.util.module_from_spec(spec);spec.loader.exec_module(reader)
        resource_profile=reader.load(profile_path)
        stop=resource_profile['original_total_stop_monotonic_ns']
        deadline_monotonic_ns=stop if deadline_monotonic_ns is None else min(deadline_monotonic_ns,stop)
        if deadline_monotonic_ns<=time.monotonic_ns():raise ValueError('expired resource profile')
    # Canonical read/write namespaces are inputs, TASK.md and out. Workspace root,
    # .zcode, provider HOME and evaluator paths are never mounted.
    command=source.command(ws,public_get)
    captures=Path(capture_dir).absolute() if capture_dir else ws/'public_captures'
    evidence=Path(evidence_dir).absolute() if evidence_dir else ws/'operation_receipts'
    if resource_profile is not None and (profile_path==captures or captures in profile_path.parents):raise ValueError('resource profile must remain outside public captures')
    for directory in (captures,evidence):
        if any(p.is_symlink() for p in (directory,*directory.parents)): raise ValueError('store symlink denied')
        directory.mkdir(mode=0o700,parents=True,exist_ok=True)
        if not directory.is_dir(): raise ValueError('store directory required')
        for candidate_directory in (ws/'inputs',ws/'out'):
            if directory == candidate_directory or directory in candidate_directory.parents or candidate_directory in directory.parents:
                raise ValueError('trusted stores must be disjoint from candidate inputs/out')
    if captures == evidence or captures in evidence.parents or evidence in captures.parents:
        raise ValueError('capture/evidence stores must be disjoint')
    # Adapt only host mount source paths, preserving model-visible namespaces.
    command[command.index(str(ws/'public_captures'))]=str(captures)
    command[command.index(str(ws/'operation_receipts'))]=str(evidence)
    servers=[{'name':'pm_boundary','command':command[0],'args':command[1:],'env':[], 'isolation':'session','protocolVersion':'auto','timeoutMs':20000}]
    names=source.allowlist(public_get)
    if execution_enabled:
        cmd=['/usr/bin/python3','-I','-B',str(HERE/'execution_server.py'),'--evidence-dir',str(evidence/'executions'),'--actor','candidate']
        if resource_profile is not None:cmd+=['--resource-profile',str(Path(resource_profile_path).absolute())]
        if deadline_monotonic_ns is not None:
            if deadline_monotonic_ns <= time.monotonic_ns(): raise ValueError('expired stage deadline')
            cmd+=['--deadline-monotonic-ns',str(deadline_monotonic_ns)]
        servers.append({'name':'pm_execution','command':cmd[0],'args':cmd[1:],'env':[],'isolation':'session','protocolVersion':'auto','timeoutMs':15000})
        names.append('mcp__pm_execution__python_execute')
    return {'tool_allowlist':names,'mcp_servers':servers,'deadline_monotonic_ns':deadline_monotonic_ns,
            'external_stage_supervisor_required':True,'service_launch':'trusted host siblings; nested bwrap unsupported',
            'source_identity':'ER8 exact copied HTTPS capture; see SOURCE_PINS.json', 'execution_enabled':execution_enabled,
            'resource_profile_path':str(Path(resource_profile_path).absolute()) if resource_profile_path is not None else None,
            'resource_profile_sha256':hashlib.sha256(Path(resource_profile_path).read_bytes()).hexdigest() if resource_profile_path is not None else None,
            'sandbox_private_slice':resource_profile['slice_unit'] if resource_profile is not None else None}
