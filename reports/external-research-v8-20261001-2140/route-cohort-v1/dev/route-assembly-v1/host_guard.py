"""Fixed native-host lifecycle owner; EOF/deadline kills its dedicated host group."""
import json
import os
from pathlib import Path
import select
import signal
import subprocess
import sys
import time

def main():
    watch, seconds, record, cli, workspace = sys.argv[1:]
    watch, seconds = int(watch), float(seconds)
    host = None
    def stop(*_): raise SystemExit(1)
    signal.signal(signal.SIGTERM, stop)
    signal.signal(signal.SIGINT, stop)
    try:
        host = subprocess.Popen(['node', cli, 'app-server', '--no-color', '--cwd', workspace],
                                cwd=workspace, start_new_session=True)
        Path(record).write_text(json.dumps({'native_host_pid':host.pid,'native_host_pgid':host.pid})+'\n')
        end = time.monotonic()+seconds
        while host.poll() is None and time.monotonic()<end:
            if select.select([watch], [], [], min(.2,max(0,end-time.monotonic())))[0]:
                if not os.read(watch,1): break
        return host.poll() or 0
    finally:
        if host is not None:
            for sig in (signal.SIGTERM, signal.SIGKILL):
                try: os.killpg(host.pid,sig)
                except ProcessLookupError: pass
                if sig == signal.SIGTERM: time.sleep(.2)
            try: host.wait(timeout=2)
            except subprocess.TimeoutExpired: pass
        os.close(watch)

if __name__=='__main__':sys.exit(main())
