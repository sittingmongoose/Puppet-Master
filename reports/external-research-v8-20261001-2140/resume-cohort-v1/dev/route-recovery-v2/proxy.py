"""Fixed MCP byte proxy. No tools, provider access, or native records."""
import argparse
import os
from pathlib import Path
import socket
import stat
import sys
import threading
import time

def cgroup():
    value=Path('/proc/self/cgroup').read_text().strip()
    if not value.startswith('0::/'): raise ValueError('unified owned cgroup required')
    return value[3:]

def main():
    p=argparse.ArgumentParser()
    p.add_argument('--socket',type=Path,required=True)
    p.add_argument('--deadline-ns',type=int,required=True)
    p.add_argument('--cgroup',required=True)
    a=p.parse_args()
    if cgroup()!=a.cgroup or time.monotonic_ns()>=a.deadline_ns: return 126
    if not a.socket.is_absolute() or any(q.is_symlink() for q in (a.socket,*a.socket.parents)): return 126
    m=a.socket.lstat()
    if not stat.S_ISSOCK(m.st_mode) or m.st_uid!=os.getuid() or stat.S_IMODE(m.st_mode)!=0o600: return 126
    s=socket.socket(socket.AF_UNIX)
    s.settimeout(max(.001,(a.deadline_ns-time.monotonic_ns())/10**9))
    s.connect(str(a.socket))
    # EOF to server occurs only after native closes its input.
    def upload():
        try:
            while data:=os.read(0,65536): s.sendall(data)
            s.shutdown(socket.SHUT_WR)
        except OSError: pass
    thread=threading.Thread(target=upload,daemon=True);thread.start()
    try:
        while data:=s.recv(65536):
            view=memoryview(data)
            while view: view=view[os.write(1,view):]
    finally: s.close()
    return 0

if __name__=='__main__':
    try: raise SystemExit(main())
    except Exception: raise SystemExit(126)
