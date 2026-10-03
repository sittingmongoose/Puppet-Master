"""Thin Luna caller for exact frozen sibling MCP/lifetime broker; no new sandbox."""
import importlib.util
import json
from pathlib import Path
import sys
import os
import stat
import hashlib

HERE=Path(__file__).resolve().parent
RECOVERY=Path('LAB_ROOT/dev/route-recovery-v1')


def load(name,path):
    spec=importlib.util.spec_from_file_location(name,path)
    mod=importlib.util.module_from_spec(spec);spec.loader.exec_module(mod);return mod


def main():
    plan=json.loads(Path(sys.argv[1]).read_text())
    command=sys.argv[3:]
    if sys.argv[2]!='--' or command!=plan['recovery_namespace_command']:return 126
    broker=load('same_frozen_mcp_lifetime_broker',RECOVERY/'broker_exec.py')
    snapshot_path=HERE/'SNAPSHOT.json'
    snapshot=json.loads(snapshot_path.read_text())
    digest=hashlib.sha256(snapshot_path.read_bytes()).hexdigest()
    for path,pin in snapshot['closure_sha256'].items():
        file=Path(path)
        if any(q.is_symlink() for q in (file,*file.parents)) or hashlib.sha256(file.read_bytes()).hexdigest()!=pin:raise ValueError('Luna selected primitive/source drift')
    for name in ('boundary_acceptance','route_acceptance'):
        rec=plan[name];file=Path(rec['path'])
        if any(q.is_symlink() for q in (file,*file.parents)) or hashlib.sha256(file.read_bytes()).hexdigest()!=rec['sha256']:raise ValueError('Luna source acceptance drift')
        accepted=json.loads(file.read_text())
        if accepted.get('verdict')!='accepted' or accepted.get('snapshot_sha256')!=digest:raise ValueError('Luna exact source/isolation review required')
    if plan['route_snapshot']!={'path':str(snapshot_path),'sha256':digest}:raise ValueError('Luna exact route snapshot required')
    preflight=load('same_frozen_host_preflight',RECOVERY/'host_preflight.py')
    preflight.validate(plan)
    binding=plan.get('private_auth_binding')
    if not isinstance(binding,dict) or set(binding)!={'source','target'}:raise ValueError('private native auth mount missing')
    config=preflight.record(plan['assembly_binding']['config'])
    home=Path(config['private_codex_home']);source=Path(binding['source']);target=Path(binding['target'])
    if target!=home/'auth.json' or source==target:raise ValueError('one auth-only native projection required')
    for path in (source,target):
        if not path.is_absolute() or any(q.is_symlink() for q in (path,*path.parents)) or not path.is_file() or path.stat().st_uid!=os.getuid() or path.stat().st_nlink!=1 or stat.S_IMODE(path.stat().st_mode)&0o077:raise ValueError('private auth mount metadata mismatch')
    if stat.S_IMODE(home.stat().st_mode)!=0o700 or {p.name for p in home.iterdir()}!={'auth.json'} or target.stat().st_size!=0:raise ValueError('fresh private placeholder required')
    if plan['recovery_namespace_command'].count('--ro-bind')!=1 or ['--ro-bind',str(source),str(target)]!=plan['recovery_namespace_command'][plan['recovery_namespace_command'].index('--ro-bind'):plan['recovery_namespace_command'].index('--ro-bind')+3]:raise ValueError('auth projection not exact readonly mount')
    # No provider starts here. Every native Goal is gated again in PID1 admission.
    return broker.execute(plan,command)

if __name__=='__main__':
    try:raise SystemExit(main())
    except Exception:raise SystemExit(126)
