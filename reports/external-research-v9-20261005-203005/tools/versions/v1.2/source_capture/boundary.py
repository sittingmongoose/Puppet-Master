"""Explicit v8 public-capture overlay; unchanged enumerated tool names.

Select this module prospectively before executing the original native_runner.
This is a changed boundary and requires its own acceptance/pins.
"""
from pathlib import Path
import stat

HERE = Path(__file__).resolve().parent
NAMES = ['mcp__pm_boundary__read_file', 'mcp__pm_boundary__write_file', 'mcp__pm_boundary__mechanical']


def command(workspace, public_get=False):
    # Do not resolve a symlink supplied as the case workspace.
    original = Path(workspace).absolute()
    if original.is_symlink(): raise ValueError('workspace symlink denied')
    ws = original.resolve(strict=True)
    for rel in ('inputs', 'out', 'TASK.md'):
        if (ws / rel).is_symlink(): raise ValueError('workspace admission symlink denied')
    for rel in ('public_captures', 'operation_receipts'):
        path = ws / rel
        try: path.mkdir(mode=0o700)
        except FileExistsError: pass
        meta = path.lstat()
        if not stat.S_ISDIR(meta.st_mode) or path.is_symlink():
            raise ValueError('case evidence store must be a real directory')
    cmd = ['/usr/bin/bwrap', '--die-with-parent', '--new-session', '--unshare-pid', '--clearenv',
           '--tmpfs', '/', '--proc', '/proc', '--dev', '/dev', '--tmpfs', '/tmp',
           '--dir', '/work', '--dir', '/runtime', '--dir', '/etc']
    for path in ('/usr', '/lib', '/lib64'):
        if Path(path).exists(): cmd += ['--ro-bind', path, path]
    for path in ('/etc/ssl/certs', '/etc/resolv.conf'):
        if Path(path).exists(): cmd += ['--ro-bind', path, path]
    cmd += ['--ro-bind', str(ws / 'inputs'), '/work/inputs',
            '--ro-bind', str(ws / 'TASK.md'), '/work/TASK.md',
            '--bind', str(ws / 'out'), '/work/out',
            '--bind', str(ws / 'public_captures'), '/work/public_captures',
            '--bind', str(ws / 'operation_receipts'), '/work/operation_receipts',
            '--ro-bind', str(HERE / 'tool_server.py'), '/runtime/tool_server.py',
            '--setenv', 'PATH', '/usr/bin:/bin', '--setenv', 'LANG', 'C.UTF-8',
            '--setenv', 'PM_PUBLIC_GET', '1' if public_get else '0',
            '--chdir', '/work', '--', '/usr/bin/python3', '-I', '-B', '/runtime/tool_server.py']
    return cmd


def mcp_config(workspace, public_get=False):
    cmd = command(workspace, public_get)
    return {'name': 'pm_boundary', 'command': cmd[0], 'args': cmd[1:], 'env': [],
            'isolation': 'session', 'protocolVersion': 'auto', 'timeoutMs': 20000}


def allowlist(public_get=False):
    return NAMES + (['mcp__pm_boundary__public_https_get'] if public_get else [])
