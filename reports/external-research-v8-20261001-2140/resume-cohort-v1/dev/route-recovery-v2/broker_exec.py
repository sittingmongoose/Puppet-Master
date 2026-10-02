"""Prestart private MCP sibling, then unchanged PID1 native namespace.

Must be below the original service deadline gate and inside its owned cgroup.
The only endpoint forwards MCP bytes to the original private tool sandbox.
"""
import hashlib
import json
import os
from pathlib import Path
import socket
import struct
import stat
import subprocess
import sys
import threading
import time
import importlib.util

HERE=Path(__file__).resolve().parent
spec=importlib.util.spec_from_file_location('frozen_capture_boundary',HERE/'source-capture-v1/boundary.py')
boundary=importlib.util.module_from_spec(spec);spec.loader.exec_module(boundary)

def cgroup(pid='self'):
    value=Path('/proc/'+str(pid)+'/cgroup').read_text().strip()
    if not value.startswith('0::/'): raise ValueError('owned unified cgroup required')
    return value[3:]

def execute(plan,command):
    stop=plan['native_stop_monotonic_ns']
    if os.environ.get('PM_BOUND_DEADLINE_NS')!=str(stop) or time.monotonic_ns()>=stop: return 126
    cg=cgroup()
    if Path(cg).name!=plan['owned_unit']: return 126
    enrollment=Path(plan['enrollment_path'])
    if any(q.is_symlink() for q in (enrollment,*enrollment.parents)): return 126
    with enrollment.open('x') as handle:
        json.dump({'schema':'er8.execution.enrollment.v1','owned_unit':plan['owned_unit'],'cgroup':cg,
                   'enrolled_monotonic_ns':time.monotonic_ns(),'original_deadline_monotonic_ns':plan['deadline_monotonic_ns']},handle)
    argv=plan['runtime_argv']; workspace=Path(argv[argv.index('--workspace')+1])
    if not workspace.is_absolute() or any(q.is_symlink() for q in (workspace,*workspace.parents)): return 126
    store=Path('/run/user')/str(os.getuid())/'er8'
    store.mkdir(mode=0o700,exist_ok=True)
    meta=store.lstat()
    if store.is_symlink() or not stat.S_ISDIR(meta.st_mode) or meta.st_uid!=os.getuid() or stat.S_IMODE(meta.st_mode)!=0o700: return 126
    path=store/(hashlib.sha256(str(workspace).encode()).hexdigest()+'.sock')
    listener=socket.socket(socket.AF_UNIX)
    listener.bind(str(path));os.chmod(path,0o600);listener.listen(1)
    listener.settimeout(max(.001,(stop-time.monotonic_ns())/10**9))
    # Spawn from the original unconfined service, before outer bwrap stacks the
    # capability-denying AppArmor child profile. No policy or namespace bypass.
    tool=subprocess.Popen(boundary.command(workspace,'--public-get' in argv),stdin=subprocess.PIPE,stdout=subprocess.PIPE,stderr=subprocess.DEVNULL)
    connection=[]; errors=[]
    def bridge():
        try:
            conn,_=listener.accept();connection.append(conn);listener.close()
            pid,uid,gid=struct.unpack('3i',conn.getsockopt(socket.SOL_SOCKET,socket.SO_PEERCRED,12))
            if uid!=os.getuid() or cgroup(pid)!=cg: raise ValueError('foreign peer denied')
            conn.settimeout(max(.001,(stop-time.monotonic_ns())/10**9))
            def upload():
                try:
                    while data:=conn.recv(65536):
                        tool.stdin.write(data);tool.stdin.flush()
                except OSError: pass
                finally: tool.stdin.close()
            threading.Thread(target=upload,daemon=True).start()
            while data:=os.read(tool.stdout.fileno(),65536): conn.sendall(data)
            conn.shutdown(socket.SHUT_WR)
        except Exception: errors.append(True)
        finally:
            if connection: connection[0].close()
    thread=threading.Thread(target=bridge,daemon=True);thread.start()
    native=None
    try:
        if tool.poll() is not None: return 126
        native=subprocess.Popen(command)
        rc=native.wait()
        return rc if not errors else 126
    finally:
        listener.close()
        if connection:
            try: connection[0].shutdown(socket.SHUT_RDWR)
            except OSError: pass
            connection[0].close()
        if tool.poll() is None: tool.kill()
        tool.wait(timeout=2)
        path.unlink(missing_ok=True)

def validate_pins(plan):
    def sha(path): return hashlib.sha256(Path(path).read_bytes()).hexdigest()
    for snapshot_path, acceptance in ((HERE/'execution-path-v1/SNAPSHOT.json',plan['boundary_acceptance']),
                                      (Path(plan['route_snapshot']['path']),plan['route_acceptance'])):
        if sha(acceptance['path'])!=acceptance['sha256']: raise ValueError('acceptance drift')
        accepted=json.loads(Path(acceptance['path']).read_text())
        if accepted.get('verdict')!='accepted' or accepted.get('snapshot_sha256')!=sha(snapshot_path): raise ValueError('independent acceptance absent')
        snapshot=json.loads(snapshot_path.read_text())
        for path,pin in snapshot['closure_sha256'].items():
            if sha(path)!=pin: raise ValueError('closure drift')
    if sha(plan['route_snapshot']['path'])!=plan['route_snapshot']['sha256']: raise ValueError('selected route drift')

def main():
    plan=json.loads(Path(sys.argv[1]).read_text())
    command=sys.argv[3:]
    if sys.argv[2]!='--' or command!=plan['recovery_namespace_command']: return 126
    validate_pins(plan)
    spec=importlib.util.spec_from_file_location('host_preflight',HERE/'host_preflight.py')
    preflight=importlib.util.module_from_spec(spec);spec.loader.exec_module(preflight)
    preflight.validate(plan)
    return execute(plan,command)

if __name__=='__main__':
    try: raise SystemExit(main())
    except Exception: raise SystemExit(126)
