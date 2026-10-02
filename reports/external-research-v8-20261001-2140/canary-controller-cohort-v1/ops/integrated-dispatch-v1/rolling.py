"""Generic two-slot rolling launcher. Root/operator only, never author-run."""
import argparse
import subprocess
import sys
import time
from pathlib import Path
sys.path.insert(0, str(Path(__file__).resolve().parent))
from common import *


def run(root_release, run_root):
    release = read_json(root_release)
    check_release(release)
    run_root = Path(run_root)
    if not run_root.is_absolute() or any(p.is_symlink() for p in (run_root, *run_root.parents)) or run_root.exists():
        raise ValueError('fresh operator-owned runtime root required')
    if run_root.is_relative_to(HERE) or not run_root.is_relative_to(CAMPAIGN/'ops/dispatcher-v1'):
        raise ValueError('actual runtime paths belong only to operator dispatcher')
    pending, active = list(QUEUE), {}
    outcomes = {}
    while pending or active:
        status = ledger('status')
        # Campaign-wide occupied leases, plus our HOSTMANAGEMENT case slots,
        # enforce ours Z2. Never use, stop or borrow sibling slots.
        available = min(2-len(active), 2-status['active_by_family']['Z'])
        if status['overdue_jobs'] or status['candidate_output_stop']:
            available = 0
        while pending and available > 0 and time.time() + 3300 < STOP_EPOCH:
            case = pending.pop(0)
            # Capture before the first blocking case-specific operation; the
            # accepted static gate arms before case Python/import/prep/locking.
            epoch, start = time.time(), time.monotonic_ns()
            campaign_ns = start + int((STOP_EPOCH-epoch)*10**9)
            cutoff = min(start+3600*10**9, campaign_ns)
            argv = ['--root-release', root_release, '--run-root', run_root,
                '--case', case, '--case-epoch', epoch, '--case-ns', start,
                '--case-deadline-ns', cutoff, '--campaign-ns', campaign_ns]
            proc = subprocess.Popen(gate_command(cutoff, 'case_supervisor.py', argv),
                start_new_session=True, stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)
            active[case] = {'proc': proc, 'start': start, 'epoch': epoch, 'deadline': cutoff}
            available -= 1
        finished = []
        for case, item in active.items():
            proc = item['proc']
            if proc.poll() is None:
                continue
            rc = proc.wait()
            exited = time.monotonic_ns()
            result = 126
            if rc == 0 and exited < item['deadline']:
                closer = subprocess.Popen(gate_command(item['deadline'], 'external_case_close.py', [
                    '--run-root', run_root, '--case', case, '--case-ns', item['start'],
                    '--deadline-ns', item['deadline'], '--supervisor-pid', proc.pid,
                    '--supervisor-returncode', rc, '--supervisor-exit-ns', exited]),
                    start_new_session=True, stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)
                close_result = closer.wait()
                actual_end = time.monotonic_ns()
                if close_result == 0 and actual_end < item['deadline']:
                    # The case-specific supervisor and finalizer have ACTUALLY
                    # exited. Record their last tail before reporting/metadata.
                    recorder = subprocess.Popen(gate_command(item['deadline'], 'parent_receipt.py', [
                        '--run-root', run_root, '--case', case, '--case-ns', item['start'],
                        '--deadline-ns', item['deadline'], '--finalizer-pid', closer.pid,
                        '--finalizer-returncode', close_result, '--finalizer-exit-ns', actual_end]),
                        stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)
                    result = recorder.wait()
            outcomes[case] = {'case_supervisor_pid': proc.pid, 'held_Popen_returncode': rc,
                'observed_exit_monotonic_ns': exited, 'original_deadline_monotonic_ns': item['deadline'],
                'external_case_settlement_returncode': result, 'operational_close': result == 0,
                'semantic_quality': 'PENDING_INDEPENDENT_EVALUATION' if result == 0 else 'INCOMPLETE_OR_UNKNOWN'}
            finished.append(case)
        for case in finished:
            del active[case]
        # No wave barrier: one completed case immediately makes its slot ready.
        if not active and pending and (time.time()+3300 >= STOP_EPOCH or available == 0):
            break
        if not finished:
            time.sleep(0.25)
    print(json.dumps({'schema': 'er8.integrated.rolling-close.v1', 'cases': outcomes,
        'unstarted': pending, 'no_retries_or_relabeling': True, 'usage': 'UNKNOWN except ledger lower bounds'}), flush=True)
    return 0 if len(outcomes) == 6 and all(v['operational_close'] for v in outcomes.values()) else 126


def main():
    p = argparse.ArgumentParser()
    p.add_argument('--root-release', required=True)
    p.add_argument('--run-root', required=True)
    a = p.parse_args()
    raise SystemExit(run(a.root_release, a.run_root))

if __name__ == '__main__':
    main()
