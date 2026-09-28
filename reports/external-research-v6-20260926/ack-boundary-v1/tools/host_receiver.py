"""Receiver attachment only; the existing host owns launch and bounded cleanup.

No native/provider calls are made here. The unchanged Muse driver creates its
own output directory and flushes muse-msp.jsonl; this sidecar discovers the
session journal from that response. A tick schedules observation, never proves
completion. Callers must quiesce the writer before freezing evidence.
"""
import time
from pathlib import Path

from completion_store import CompletionStore
from native_completion import MuseCompletionFeed


def create_receiver(workspace, archive, native_dir):
    return CompletionStore(workspace, archive, MuseCompletionFeed(
        Path(native_dir) / 'muse-msp.jsonl', workspace_root=workspace))


def watch_process(process, store, *, deadline_epoch, stop_and_reap,
                  clock=time.time, tick=lambda: time.sleep(0.05)):
    """Attach to an already-launched driver; no launch or retry capability.

    stop_and_reap is the existing host's bounded process-tree cleanup callback.
    It must return with the writer stopped. A cleanup failure is raised and the
    receiver is not falsely frozen while the writer might still be active.
    The host must retain that failure and raw inputs as incomplete evidence.
    """
    reason = 'completed'
    cleanup_attempted = False

    def cleanup():
        nonlocal cleanup_attempted
        cleanup_attempted = True
        try:
            stop_and_reap()
        except BaseException as exc:
            store.state['host_cleanup_error'] = type(exc).__name__
            store._record_error('bounded cleanup raised ' + type(exc).__name__)
            store.publish()
            raise

    try:
        while process.poll() is None:
            store.poll()
            if clock() >= deadline_epoch:
                reason = 'cap'
                cleanup()
                if process.poll() is None:
                    raise RuntimeError('bounded cleanup did not stop native writer')
                break
            tick()
    except BaseException:
        cleanup_error = None
        try:
            if process.poll() is None and not cleanup_attempted:
                cleanup()
        except BaseException as exc:
            cleanup_error = exc
        finally:
            if process.poll() is None:
                store.state['host_cleanup_failed'] = True
                store._record_error('bounded cleanup failed; native writer may remain active; evidence not frozen')
                store.publish()
        if process.poll() is not None:
            store.state['host_exit_code'] = process.poll()
            store.close('cancelled')
        if cleanup_error is not None:
            raise cleanup_error
        raise
    store.state['host_exit_code'] = process.poll()
    if reason == 'completed' and process.poll() != 0:
        reason = 'failed'
    return store.close(reason)
