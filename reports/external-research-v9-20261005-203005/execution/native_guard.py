#!/usr/bin/env python3
"""Owned native group watchdog; original deadline and parent EOF are terminal."""
import argparse
import json
import os
from pathlib import Path
import select
import signal
import subprocess
import time

def process_identity(pid):
    raw=Path(f'/proc/{pid}/stat').read_text(); f=raw[raw.rfind(')')+2:].split()
    return {'pid':pid,'pgid':int(f[2]),'start_ticks':int(f[19])}

def main():
    p=argparse.ArgumentParser(description=__doc__)
    p.add_argument('--watch-fd',type=int,required=True); p.add_argument('--deadline',type=float,required=True)
    p.add_argument('--record',required=True); p.add_argument('--cwd',required=True)
    p.add_argument('command',nargs=argparse.REMAINDER); a=p.parse_args()
    command=a.command[1:] if a.command[:1]==['--'] else a.command
    if not command: p.error('native command required')
    native=None; reason='native_exit'; result=1
    def stop(*_): raise SystemExit(1)
    signal.signal(signal.SIGTERM,stop); signal.signal(signal.SIGINT,stop)
    try:
        native=subprocess.Popen(command,cwd=a.cwd,start_new_session=True)
        record={'native_identity':process_identity(native.pid),'guard_identity':process_identity(os.getpid()),
                'deadline_monotonic':a.deadline,'argv':command,'watcher':'original deadline plus owner EOF'}
        Path(a.record).write_text(json.dumps(record)+'\n')
        while native.poll() is None:
            remaining=a.deadline-time.monotonic()
            if remaining<=0: reason='original_deadline'; break
            if select.select([a.watch_fd],[],[],min(.1,remaining))[0] and not os.read(a.watch_fd,1):
                reason='owner_eof'; break
        if native.poll() is not None: result=native.returncode
        return result
    finally:
        if native:
            for sig in (signal.SIGTERM,signal.SIGKILL):
                try: os.killpg(native.pid,sig)
                except ProcessLookupError: pass
                if sig==signal.SIGTERM: time.sleep(.1)
            try: native.wait(timeout=2)
            except subprocess.TimeoutExpired: pass
            Path(a.record+'.terminal').write_text(json.dumps({'reason':reason,'native_returncode':native.poll(),
                                                            'ended_monotonic':time.monotonic()})+'\n')
        os.close(a.watch_fd)
if __name__=='__main__': raise SystemExit(main())
