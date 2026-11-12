"""Serial DS jobs pause at the task's available-memory floor."""
import time
from pathlib import Path


def available_gib():
    values=dict(line.split(':',1) for line in Path('/proc/meminfo').read_text().splitlines())
    return int(values['MemAvailable'].split()[0])//1024**2


def memory_floor():
    paused=False
    while available_gib()<6:
        if not paused:print('PAUSED: available memory below 6 GB; no next case/removal starts',flush=True)
        paused=True
        time.sleep(5)
    if paused:print('RESUMED: available memory at least 6 GB',flush=True)
