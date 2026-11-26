"""Deadline and resource evidence for the DG5 judge's forked replays."""
from contextvars import ContextVar
import math
import os
from pathlib import Path
import select
import signal
import time

WALL_SECONDS = 60
JUDGING = ContextVar('dg5_judging', default=False)
OUTCOME = 'JUDGE_BOUND'


class ReplayBound(BaseException):
    """Stop judging this record. The shared judge handles Exception as a checker failure."""

    def __init__(self, evidence):
        super().__init__(OUTCOME)
        self.evidence = evidence


def _rss_kib(pid):
    try:
        for line in Path(f'/proc/{pid}/status').read_text().splitlines():
            if line.startswith('VmRSS:'):
                return int(line.split()[1])
    except OSError:
        pass
    return None


def _kill_and_reap(pid):
    # The child still belongs to this caller, which has not reaped it yet.
    try:
        os.kill(pid, signal.SIGKILL)
    except ProcessLookupError:
        pass
    os.waitpid(pid, 0)


def wait(pid, cut, started):
    """Return the child's wait status, or reap it at the deadline and raise ReplayBound."""
    deadline = started + WALL_SECONDS
    pidfd = None
    try:
        initial_rss = _rss_kib(pid)
        sampled = time.monotonic()
        try:
            pidfd = os.pidfd_open(pid)
        except (AttributeError, OSError):
            # Other Unix systems and older Linux kernels can use waitpid polling.
            pass
        poller = None
        if pidfd is not None:
            poller = select.poll()
            poller.register(pidfd, select.POLLIN)
        pause = 0.001
        while True:
            exited, status = os.waitpid(pid, os.WNOHANG)
            if exited:
                return status
            remaining = deadline - time.monotonic()
            if remaining <= 0:
                final_rss = _rss_kib(pid)
                finished = time.monotonic()
                break
            if poller is not None:
                poller.poll(math.ceil(remaining * 1000))
            else:
                time.sleep(min(pause, remaining))
                pause = min(pause * 2, 0.05)
    except BaseException:
        _kill_and_reap(pid)
        raise
    finally:
        if pidfd is not None:
            os.close(pidfd)
    _kill_and_reap(pid)
    growth = None
    if initial_rss is not None and final_rss is not None and finished > sampled:
        growth = round((final_rss - initial_rss) / (finished - sampled), 3)
    raise ReplayBound(dict(cut=sorted(cut), wall_limit_seconds=WALL_SECONDS,
                           elapsed_seconds=round(finished - started, 3),
                           rss_start_kib=initial_rss, rss_at_bound_kib=final_rss,
                           rss_growth_kib_per_second=growth))
