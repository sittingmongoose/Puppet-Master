#!/usr/bin/env python3
"""The deduplicated proofs_ca.py changes nothing the loader returns (pm-ea-lead 1121233141-743c (1)).

    python3 -B pm_goal_dg5_proofs_dedup_selftest.py --out RESULT.json [--repo CHECKOUT]

Trials:
  table_byte_equal_base  written_proofs() on this checkout equals, byte for byte (key -> full
                         definition, incl. bound sites), the table reconstructed from the BASE
                         commit's proof sources: BASE's own `scripts/` tree, materialized with
                         `git archive BASE`, plus every bound path outside it from `git show
                         BASE:<path>`. Nothing in that tree links to or imports this checkout. The
                         dedup drops only shadowed definitions, so the two tables must be identical.
  base_reference_revision_isolated  the BASE reference holds only BASE bytes: no symlink in its tree,
                         and every proof module and bound site the BASE table names equals
                         `git show BASE:<path>` (a key or bound file that exists only after BASE
                         fails this trial, even when the byte-equality trial above is fooled).
  sources_no_duplicates  proof_allowlist.check_sources(this checkout) passes — the gate's own
                         duplicate-key check (TOOL-ISSUES T316), imported read-only via
                         DG5_PROOF_GATE_DIR or the lane default. On a checkout that still carries the
                         7 duplicate keys this trial FAILS (exit-3 class); that is the red side.

--repo points the trials at another checkout (default: this one); it must be a git checkout so the
BASE sources can be reconstructed from its object store (or an alternate).
"""
import argparse
import hashlib
import io
import json
import os
from pathlib import Path
import subprocess
import sys
import tarfile
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


def base_tree(repo, work):
    """The BASE commit's scripts tree, materialized from `git archive`: no path into this checkout."""
    root = Path(tempfile.mkdtemp(prefix='dedup-base-', dir=work))
    done = subprocess.run(['git', '-C', str(repo), 'archive', BASE, 'scripts'], capture_output=True)
    if done.returncode != 0:
        raise RuntimeError(f'git archive {BASE[:10]} scripts failed: '
                           f'{done.stderr[-800:].decode(errors="replace")}')
    with tarfile.open(fileobj=io.BytesIO(done.stdout)) as tar:
        tar.extractall(root, filter='data')
    return root


def base_table(repo, work):
    """The BASE commit's proof table, built from BASE bytes only.

    The loader, every proof module and every bound file come from BASE: `git archive BASE scripts`
    lays down the tree, and each bound path outside it is written from `git show BASE:<path>`. A
    module or bound file added or changed after BASE cannot reach the historical reference.
    """
    root = base_tree(repo, work)
    table = table_at(root / 'scripts', work)
    added = False
    for rel in sorted({s['path'] for p in json.loads(table).values() for s in p.get('bound_sites', [])}):
        if (root / rel).exists():
            continue
        try:
            raw = git_show(repo, rel)
        except subprocess.CalledProcessError:
            continue      # absent at BASE: a None bound hash is the base's own answer
        (root / rel).parent.mkdir(parents=True, exist_ok=True)
        (root / rel).write_bytes(raw)
        added = True
    if added:
        table = table_at(root / 'scripts', work)
    return table, root


def isolation_report(repo, root, table):
    """Every byte the BASE table rests on must come from BASE, not from the checkout under test."""
    failures = []
    links = sorted(str(p.relative_to(root)) for p in root.rglob('*') if p.is_symlink())
    if links:
        failures.append('symlink in the BASE tree: ' + ', '.join(links[:5]))
    modules = sorted({proof['module'] for proof in table.values()})
    for rel in modules:
        try:
            expected = git_show(repo, rel)
        except subprocess.CalledProcessError:
            failures.append(f'{rel}: names the BASE table but does not exist at BASE')
            continue
        try:
            actual = (root / rel).read_bytes()
        except OSError as error:
            failures.append(f'{rel}: unreadable in the BASE tree ({error})')
            continue
        if actual != expected:
            failures.append(f'{rel}: table module is not the BASE bytes')
    sites = {}
    for proof in table.values():
        for site in proof.get('bound_sites', []):
            sites[site['path']] = site.get('file_sha256')
    for rel in sorted(sites):
        try:
            expected = hashlib.sha256(git_show(repo, rel)).hexdigest()
        except subprocess.CalledProcessError:
            expected = None
        if sites[rel] != expected:
            failures.append(f'{rel}: bound {sites[rel] or "nothing"} instead of '
                            f'{expected or "nothing (absent at BASE)"}')
    return dict(failures=failures, modules=modules, keys=len(table), bound_paths=len(sites))


def main():
    parser = argparse.ArgumentParser(description=__doc__.split('\n\n')[0])
    parser.add_argument('--out', type=Path, required=True)
    parser.add_argument('--repo', type=Path, default=HERE.parent)
    args = parser.parse_args()
    repo = args.repo.resolve()
    work = Path(tempfile.mkdtemp(prefix='dedup-selftest-'))
    rows = []
    table = root = None
    # Trial 1: the loaded table is byte-identical to the BASE commit's.
    try:
        current = table_at(repo / 'scripts', work)
        base, root = base_table(repo, work)
        table = json.loads(base)
        ok = current == base
        result = dict(byte_equal=ok, keys=len(json.loads(current)), base_keys=len(table),
                      base_sources=sorted({p['module'] for p in table.values()}),
                      base_bound_paths=len({s['path'] for p in table.values()
                                            for s in p.get('bound_sites', [])}),
                      sha256_current=hashlib.sha256(current).hexdigest(),
                      sha256_base=hashlib.sha256(base).hexdigest())
    except Exception as error:  # noqa: BLE001 - a failed reconstruction is a failed trial
        ok, result = False, dict(error=f'{type(error).__name__}: {error}')
    rows.append(dict(case='table_byte_equal_base', expected='byte-equal to the BASE proof table',
                     result=result, passed=bool(ok)))
    # Trial 2: the BASE reference rests on BASE bytes only (red on the old reader, which laid the
    # BASE proof sources into a temp dir of symlinks to this checkout).
    try:
        if table is None:
            raise RuntimeError('the BASE table did not load')
        result = isolation_report(repo, root, table)
        ok = not result['failures']
    except Exception as error:  # noqa: BLE001 - an unchecked reference is a failed trial
        ok, result = False, dict(error=f'{type(error).__name__}: {error}')
    rows.append(dict(case='base_reference_revision_isolated',
                     expected='the BASE reference holds only BASE bytes',
                     result=result, passed=bool(ok)))
    # Trial 3: the gate's duplicate-key check passes on this checkout.
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
