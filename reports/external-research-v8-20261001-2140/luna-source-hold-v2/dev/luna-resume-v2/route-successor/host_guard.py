"""Accepted watchdog pattern, Codex argv adaptation; absolute original stop."""
import json
import os
from pathlib import Path
import select
import signal
import subprocess
import sys
import time


def main():
    watch, stop_ns, record, marker, *argv=sys.argv[1:]
    watch,stop_ns=int(watch),int(stop_ns)
    if marker!='--' or time.monotonic_ns()>=stop_ns:return 124
    if os.environ.get('PM_BOUND_DEADLINE_NS')!=str(stop_ns):return 126
    host=None
    def stop(*_):raise SystemExit(1)
    signal.signal(signal.SIGTERM,stop);signal.signal(signal.SIGINT,stop)
    try:
        host=subprocess.Popen(argv,start_new_session=True)
        Path(record).write_text(json.dumps({'native_host_pid':host.pid,'native_host_pgid':host.pid})+'\n')
        while host.poll() is None and time.monotonic_ns()<stop_ns:
            if select.select([watch],[],[],min(.1,max(0,(stop_ns-time.monotonic_ns())/10**9)))[0]:
                if not os.read(watch,1):break
        return host.poll() or 0
    finally:
        if host is not None:
            for sig in (signal.SIGTERM,signal.SIGKILL):
                try:os.killpg(host.pid,sig)
                except ProcessLookupError:pass
                if sig==signal.SIGTERM:time.sleep(.1)
            try:host.wait(timeout=1)
            except subprocess.TimeoutExpired:pass
        os.close(watch)

if __name__=='__main__':sys.exit(main())
