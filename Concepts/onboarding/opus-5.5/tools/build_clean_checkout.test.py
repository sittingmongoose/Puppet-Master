#!/usr/bin/env python3
"""Clean-checkout proof for build.py's Plans/settings_inventory.json guard.

(a) git archive HEAD Concepts -> a Concepts-only checkout: build.py must exit 1 with exactly
    "BUILD FAILED: this build needs Plans/settings_inventory.json (a full repository checkout)" on stderr.
(b) git archive HEAD Concepts Plans/settings_inventory.json -> build.py must exit 0 and its --out page
    must be byte-identical to an independent build from the full checkout of the same HEAD.

Run from anywhere inside the repository (each build takes about a minute):
  python3 -B Concepts/onboarding/opus-5.5/tools/build_clean_checkout.test.py
Prints PASS or FAIL per case and exits non-zero on any failure. Standard library only.
"""
from __future__ import annotations

import hashlib
import io
import shutil
import subprocess
import sys
import tarfile
import tempfile
from pathlib import Path

REPO = Path(__file__).resolve().parents[4]
BUILD_REL = Path('Concepts/onboarding/opus-5.5/tools/build.py')
MISSING_INVENTORY = 'BUILD FAILED: this build needs Plans/settings_inventory.json (a full repository checkout)'


def extract_head(paths: list[str], dest: Path) -> None:
    archive = subprocess.run(['git', 'archive', 'HEAD', *paths], cwd=REPO,
                             capture_output=True, check=True).stdout
    with tarfile.open(fileobj=io.BytesIO(archive), mode='r:') as tf:
        # 'tar', not 'data': Concepts tracks one absolute symlink (5.6 Pro/handoff/node_modules),
        # which the data filter refuses. The archive is this repository's own HEAD, so it is trusted.
        tf.extractall(dest, filter='tar')


def run_build(root: Path, out_name: str) -> subprocess.CompletedProcess:
    return subprocess.run([sys.executable, '-B', str(root / BUILD_REL), '--out', str(root / out_name)],
                          capture_output=True, text=True)


def case_a(root: Path) -> str | None:
    """Concepts only: the guard must refuse the build. None on pass, else the failure reason."""
    extract_head(['Concepts'], root)
    proc = run_build(root, 'a.html')
    if proc.returncode != 1:
        return f'expected exit 1, got {proc.returncode}; stderr: {proc.stderr.strip()!r}'
    if MISSING_INVENTORY not in proc.stderr.splitlines():
        return f'expected the missing-inventory line on stderr, got: {proc.stderr.strip()!r}'
    return None


def case_b(root: Path) -> str | None:
    """Concepts plus inventory must match a full-checkout build. None on pass, else the reason."""
    extract_head(['Concepts', 'Plans/settings_inventory.json'], root)
    proc = run_build(root, 'b.html')
    if proc.returncode != 0:
        return f'expected exit 0, got {proc.returncode}; stderr: {proc.stderr.strip()!r}'
    out = root / 'b.html'
    if not out.is_file():
        return 'build exited 0 but wrote no b.html'
    reference = root / 'full-checkout.html'
    full = run_build(REPO, str(reference))
    if full.returncode != 0 or not reference.is_file():
        return f'full-checkout reference build failed (exit {full.returncode}); stderr: {full.stderr.strip()!r}'
    got = hashlib.sha256(out.read_bytes()).hexdigest()
    want = hashlib.sha256(reference.read_bytes()).hexdigest()
    if got != want:
        return f'b.html sha256 {got} != full-checkout build sha256 {want}'
    return None


def main() -> int:
    tmp_a = Path(tempfile.mkdtemp(prefix='pm7-clean-checkout-a-', dir=REPO.parent))
    tmp_b = Path(tempfile.mkdtemp(prefix='pm7-clean-checkout-b-', dir=REPO.parent))
    failed = False
    try:
        for label, root, case in (('a', tmp_a, case_a), ('b', tmp_b, case_b)):
            print(f'({label}) running...', flush=True)
            try:
                reason = case(root)
            except Exception as exc:
                reason = f'{type(exc).__name__}: {exc}'
            if reason is None:
                print(f'({label}) PASS', flush=True)
            else:
                failed = True
                print(f'({label}) FAIL: {reason}', flush=True)
    finally:
        shutil.rmtree(tmp_a)
        shutil.rmtree(tmp_b)
    return 1 if failed else 0


if __name__ == '__main__':
    sys.exit(main())
