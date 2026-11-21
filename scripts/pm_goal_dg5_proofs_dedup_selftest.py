#!/usr/bin/env python3
"""The deduplicated proofs_ca.py changes nothing the loader returns (pm-ea-lead 1121233141-743c (1)).

    python3 -B pm_goal_dg5_proofs_dedup_selftest.py --out RESULT.json [--repo CHECKOUT]

Trials:
  table_byte_equal_base  written_proofs() on this checkout equals, byte for byte (key -> full
                         definition, incl. bound sites), the table reconstructed from the BASE
                         commit's proof sources: `git show BASE:scripts/...` laid into a temp dir of
                         symlinks to this checkout's scripts, run under the BASE loader. The dedup
                         drops only shadowed definitions, so the two tables must be identical.
  sources_no_duplicates  proof_allowlist.check_sources(this checkout) passes — the gate's own
                         duplicate-key check (TOOL-ISSUES T316), imported read-only via
                         DG5_PROOF_GATE_DIR or the lane default. On a checkout that still carries the
                         7 duplicate keys this trial FAILS (exit-3 class); that is the red side.

--repo points the trials at another checkout (default: this one); it must be a git checkout so the
BASE sources can be reconstructed.
"""
import argparse
import json
import os
from pathlib import Path
import subprocess
import sys
import tempfile

HERE = Path(__file__).resolve().parent
BASE = '0dc66db2c94ae159c5d0b62e61c4c00c9e51ee20'   # the stock judge head this branch deduplicates
GATE_DEFAULT = '/home/sittingmongoose/pm-scratch/ea-c12-dg5/admission-gate/gate-e2'
DUMP = ('import json, sys; sys.path.insert(0, %r); import pm_goal_dg5_justified as j; '
        'print(json.dumps(j.written_proofs(), sort_keys=True, default=str))')


def git_show(repo, rel):
    return subprocess.check_output(['git', '-C', str(repo), 'show', f'{BASE}:{rel}'], stderr=subprocess.DEVNULL)


def table_at(scripts_dir, work):
    env = dict(os.environ, PYTHONPYCACHEPREFIX=tempfile.mkdtemp(prefix='pyc.', dir=work))
    done = subprocess.run([sys.executable, '-B', '-c', DUMP % str(scripts_dir)], cwd=scripts_dir,
                          capture_output=True, text=True, env=env)
    if done.returncode != 0:
        raise RuntimeError(f'loader failed in {scripts_dir}: {done.stderr[-1200:]}')
    return done.stdout.encode()


def base_table(repo, work):
    """The BASE commit's proof table: BASE proof sources + BASE loader over this checkout's files."""
    root = Path(tempfile.mkdtemp(prefix='dedup-base-', dir=work))
    scripts = root / 'scripts'
    scripts.mkdir()
    for p in sorted((repo / 'scripts').iterdir()):
        if p.is_file():
            os.symlink(p, scripts / p.name)
    for p in sorted(repo.iterdir()):
        if p.name not in ('scripts', '.git'):
            os.symlink(p, root / p.name)
    import ast
    justified_src = git_show(repo, 'scripts/pm_goal_dg5_justified.py')
    tree = ast.parse(justified_src)
    modules = next(ast.literal_eval(n.value) for n in tree.body if isinstance(n, ast.Assign)
                   and any(getattr(t, 'id', None) == 'PROOF_MODULES' for t in n.targets))
    replaced = ['scripts/pm_goal_dg5_justified.py']
    (scripts / 'pm_goal_dg5_justified.py').unlink()
    (scripts / 'pm_goal_dg5_justified.py').write_bytes(justified_src)
    for name in modules:
        for stem in ('pm_goal_dg5_proofs_', 'pm_goal_dg5_justified_'):
            rel = f'scripts/{stem}{name}.py'
            try:
                raw = git_show(repo, rel)
            except subprocess.CalledProcessError:
                continue
            target = scripts / Path(rel).name
            if target.is_symlink():
                target.unlink()
            target.write_bytes(raw)
            replaced.append(rel)
    return table_at(scripts, work), replaced


def main():
    parser = argparse.ArgumentParser(description=__doc__.split('\n\n')[0])
    parser.add_argument('--out', type=Path, required=True)
    parser.add_argument('--repo', type=Path, default=HERE.parent)
    args = parser.parse_args()
    repo = args.repo.resolve()
    work = Path(tempfile.mkdtemp(prefix='dedup-selftest-'))
    rows = []
    # Trial 1: the loaded table is byte-identical to the BASE commit's.
    try:
        current = table_at(repo / 'scripts', work)
        base, replaced = base_table(repo, work)
        ok = current == base
        result = dict(byte_equal=ok, keys=len(json.loads(current)), base_sources=replaced,
                      sha256_current=__import__('hashlib').sha256(current).hexdigest(),
                      sha256_base=__import__('hashlib').sha256(base).hexdigest())
    except Exception as error:  # noqa: BLE001 - a failed reconstruction is a failed trial
        ok, result = False, dict(error=f'{type(error).__name__}: {error}')
    rows.append(dict(case='table_byte_equal_base', expected='byte-equal to the BASE proof table',
                     result=result, passed=bool(ok)))
    # Trial 2: the gate's duplicate-key check passes on this checkout.
    sys.path.insert(0, os.environ.get('DG5_PROOF_GATE_DIR') or GATE_DEFAULT)
    try:
        import proof_allowlist as gate
        try:
            counts = gate.check_sources(repo, where='dedup selftest')
            ok, result = True, dict(refused=False, counts=counts)
        except gate.AllowlistError as error:
            ok, result = False, dict(refused=True, error=str(error)[:1200])
    except ImportError as error:
        ok, result = False, dict(error=f'gate not importable: {error}')
    rows.append(dict(case='sources_no_duplicates', expected='check_sources passes (no duplicate key)',
                     result=result, passed=bool(ok)))
    report = dict(status='pass' if all(r['passed'] for r in rows) else 'fail',
                  base=BASE, repo=str(repo), cases=rows)
    args.out.write_text(json.dumps(report, indent=1, default=str) + '\n')
    for row in rows:
        print(f"{'PASS' if row['passed'] else 'FAIL'} {row['case']}: expected {row['expected']}")
    print(report['status'])
    return 0 if report['status'] == 'pass' else 1


if __name__ == '__main__':
    sys.exit(main())
