#!/usr/bin/env python3
"""W3D chunked guard run (lead directive 2026-11-14).

One collect() pass over the complete checker; reuse an already-PASSed phase report only
where the table module is byte-identical to the generator render (SHA-256 unchanged) AND
the rebuilt suite's control/negative digests match the report (suite inputs unchanged);
run every remaining (chunk) table with bounded concurrency, each run under its own
`systemd-run --user --scope -p MemoryMax=2G -p MemorySwapMax=0`. Designed to be started as
one long-job and waited on in the foreground.

Usage:
  python3 scripts/pm_w3d_bsd_guard_chunked.py --out-dir DIR --reuse-dir DIR \
      --cache FILE [--concurrency 4] [--summary FILE]
"""
import argparse
import importlib.util
import json
import subprocess
import sys
import time
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(ROOT / 'scripts'))
import pm_guard_isolation as g  # noqa: E402
import pm_w3d_bsd_guard_suites as gs  # noqa: E402
import pm_w3d_bsd_rows as rows_spec  # noqa: E402

SCOPE = ['systemd-run', '--user', '--scope', '-p', 'MemoryMax=2G', '-p', 'MemorySwapMax=0', '--quiet', '--']


def load_gen():
    spec = importlib.util.spec_from_file_location('pm_w3d_table_generate', ROOT / 'scripts' / 'pm-w3d-table-generate.py')
    mod = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(mod)
    return mod


def table_unchanged(phase, gen):
    title, rows = rows_spec.all_phases()[phase]
    path = ROOT / 'scripts' / f'pm_w3d_bsd_table_{phase}.py'
    return path.exists() and path.read_text() == gen.render(phase, title, rows)


def suite_inputs_match(phase, slot, report):
    suite = gs.suite_for(phase, slot)
    if suite is None:
        return False
    rc = {c['id']: c['sha256'] for c in report.get('controls', [])}
    sc = {c.id: g.digest(c.value) for c in suite.controls}
    if rc != sc:
        return False
    rn = {n['id']: (n['target'], n['code'], n['sha256']) for n in report.get('negatives', [])}
    sn = {n.id: (n.target, n.code, g.digest(n.value)) for n in suite.negatives}
    return rn == sn


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument('--out-dir', required=True)
    ap.add_argument('--reuse-dir', required=True)
    ap.add_argument('--cache', required=True)
    ap.add_argument('--concurrency', type=int, default=4)
    ap.add_argument('--summary')
    args = ap.parse_args()
    out = Path(args.out_dir)
    out.mkdir(parents=True, exist_ok=True)
    reuse = Path(args.reuse_dir)
    logs = out / 'chunk-logs'
    logs.mkdir(exist_ok=True)

    if Path(args.cache).exists():
        blob = json.loads(Path(args.cache).read_text())
        collected, counts = blob['collected'], blob['counts']
    else:
        collected, counts = gs.collect()
        Path(args.cache).write_text(json.dumps(dict(collected=collected, counts=counts), sort_keys=True))
    print(f'collected: {counts}', flush=True)

    gen = load_gen()
    reuse_phases, run_phases, rejected = [], [], []
    for phase in sorted(collected):
        rp = reuse / f'{phase}.json'
        if not rows_spec.is_chunk(phase) and rp.exists():
            report = json.loads(rp.read_text())
            if report.get('status') == 'PASS' and table_unchanged(phase, gen) \
                    and suite_inputs_match(phase, collected[phase], report):
                reuse_phases.append(phase)
                continue
            rejected.append(phase)
        run_phases.append(phase)
    print(f'reuse {len(reuse_phases)} unchanged PASSed: {reuse_phases}', flush=True)
    if rejected:
        print(f'reuse rejected (changed inputs): {rejected}', flush=True)
    print(f'run {len(run_phases)} tables at concurrency {args.concurrency}', flush=True)

    for phase in reuse_phases:
        (out / f'{phase}.json').write_text((reuse / f'{phase}.json').read_text())
        md = reuse / f'{phase}.md'
        if md.exists():
            (out / f'{phase}.md').write_text(md.read_text())

    procs = {}
    queue = list(run_phases)
    done = 0

    def spawn(phase):
        # Every child is a heavy command; enforce the lane's admission floor per launch.
        while int(subprocess.check_output(['free', '-g'], text=True).splitlines()[1].split()[-1]) < 12:
            time.sleep(10)
        log = open(logs / f'{phase}.log', 'w')
        cmd = SCOPE + [sys.executable, '-B', str(ROOT / 'scripts' / 'pm_w3d_bsd_guard_suites.py'),
                       '--phase', phase, '--out-dir', str(out), '--collect-cache', args.cache]
        procs[phase] = (subprocess.Popen(cmd, stdout=log, stderr=subprocess.STDOUT, cwd=str(ROOT)), log)

    while queue or procs:
        while queue and len(procs) < args.concurrency:
            spawn(queue.pop(0))
        time.sleep(2)
        for phase in list(procs):
            proc, log = procs[phase]
            if proc.poll() is not None:
                log.close()
                del procs[phase]
                done += 1
                rp = out / f'{phase}.json'
                status = json.loads(rp.read_text()).get('status') if rp.exists() else 'NO_REPORT'
                print(f'CHUNK {phase} rc={proc.returncode} status={status} ({done}/{len(run_phases)})', flush=True)

    statuses = {}
    for f in sorted(out.glob('*.json')):
        statuses[f.stem] = json.loads(f.read_text()).get('status')
    summary = dict(counts=counts, reused=reuse_phases, ran=run_phases,
                   phases=statuses,
                   status_counts={s: list(statuses.values()).count(s) for s in sorted(set(statuses.values()))})
    text = json.dumps(summary, indent=1, sort_keys=True)
    if args.summary:
        Path(args.summary).write_text(text + '\n')
    print(text, flush=True)
    return 0 if all(s == 'PASS' for s in statuses.values()) else 1


if __name__ == '__main__':
    sys.exit(main())
