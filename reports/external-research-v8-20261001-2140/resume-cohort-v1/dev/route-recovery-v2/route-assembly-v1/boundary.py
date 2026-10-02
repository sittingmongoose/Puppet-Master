"""Same tool allowlist; owned prestarted private sandbox accessed by byte proxy."""
import hashlib
import os
from pathlib import Path

HERE=Path(__file__).resolve().parent
NAMES=['mcp__pm_boundary__read_file','mcp__pm_boundary__write_file','mcp__pm_boundary__mechanical']

def allowlist(public_get=False):
    return NAMES+(['mcp__pm_boundary__public_https_get'] if public_get else [])

def command(workspace,public_get=False):
    ws=Path(workspace).absolute()
    if any(p.is_symlink() for p in (ws,*ws.parents)): raise ValueError('workspace alias')
    deadline=int(os.environ['PM_BOUND_DEADLINE_NS'])
    cg=Path('/proc/self/cgroup').read_text().strip()
    if not cg.startswith('0::/'): raise ValueError('owned cgroup absent')
    return ['/usr/bin/python3','-I','-B',str(HERE.parent/'proxy.py'),
            '--socket',str(Path('/run/user')/str(os.getuid())/'er8'/(hashlib.sha256(str(ws).encode()).hexdigest()+'.sock')),'--deadline-ns',str(deadline),'--cgroup',cg[3:]]

def mcp_config(workspace,public_get=False):
    cmd=command(workspace,public_get)
    return {'name':'pm_boundary','command':cmd[0],'args':cmd[1:],'env':[],
            'isolation':'session','protocolVersion':'legacy','timeoutMs':20000}
