#!/usr/bin/env python3
"""build_test.py -- rebuild TestPMChat5.6Pro.html from this checkout + neon/neon.diff.

Test-copy tooling for the 5.6 Pro concept; NOT product code.  Meant to live at
Concepts/chat-assistant-concepts/5.6 Pro/neon/build_test.py on main.  It
locates itself via __file__, so the cwd does not matter.

What it does:
  1. copies the concept folder's tracked files (`git ls-files` for that
     folder; a plain file walk when the tree is not a git checkout, e.g. a
     git-archive export used for simulation) into a fresh scratch directory
     under ~/pm-scratch/neon-build/ (VM local disk; never /tmp, never the NFS
     mount), preserving bytes and line endings;
  2. applies neon/neon.diff there with plain `git apply` -- --unidiff-zero
     OFF, zero fuzz, strict context (git apply works outside a repository).
     On failure it prints the failing file and hunk and exits 2;
  3. runs that tree's `python3 build.py`;
  4. compares the resulting index.html bytes with the TestPMChat5.6Pro.html
     next to the concept folder: with --check, exits 0 if identical and 1 if
     not; without --check, overwrites TestPMChat5.6Pro.html.

The scratch directory is deleted at the end (kept with --keep).

Exit codes: 0 = identical / overwritten, 1 = --check found different bytes,
2 = copy/apply/build failure.  Standard library only.  Nothing inside the
concept folder is written except TestPMChat5.6Pro.html, and only without
--check.
"""

import argparse
import hashlib
import os
import re
import shutil
import subprocess
import sys
import tempfile
from pathlib import Path

HERE = Path(__file__).resolve().parent      # <concept>/neon
CONCEPT = HERE.parent                       # <concept>
DIFF = HERE / 'neon.diff'
TARGET = CONCEPT / 'TestPMChat5.6Pro.html'
SCRATCH_ROOT = Path.home() / 'pm-scratch' / 'neon-build'


def die(msg, code=2):
    print(f'build_test: {msg}', file=sys.stderr)
    raise SystemExit(code)


def list_files():
    """Concept files to stage, as relative Paths.

    In a git checkout this is exactly `git ls-files` for the concept folder
    (tracked files only).  When the tree is not a checkout -- a git-archive
    export used to simulate main -- every file on disk is the checkout for
    our purposes, so the folder is walked instead.  Directory symlinks (e.g.
    a borrowed node_modules) are never followed or copied; a tracked symlink
    (handoff/node_modules) is recreated as a link by copy_tree.
    """
    p = subprocess.run(['git', 'ls-files', '-z', '.'], cwd=CONCEPT,
                       capture_output=True)
    if p.returncode == 0 and p.stdout.strip():
        return [Path(x.decode('utf-8')) for x in p.stdout.split(b'\0') if x]
    files = []
    for root, dirs, names in os.walk(CONCEPT):
        dirs[:] = [d for d in dirs if d != '.git']
        for n in names:
            files.append(Path(root, n).relative_to(CONCEPT))
    if not files:
        die(f'no files found under {CONCEPT}')
    return sorted(files)


def copy_tree(files, scratch):
    for rel in files:
        src, dst = CONCEPT / rel, scratch / rel
        dst.parent.mkdir(parents=True, exist_ok=True)
        if src.is_symlink():                  # a tracked link (handoff/node_modules): stays a link, never followed
            os.symlink(os.readlink(src), dst)
        else:
            shutil.copyfile(src, dst)         # binary copy: bytes preserved


def diff_hunks(diff_text):
    """Map (file, old_start_line) -> hunk text lines, for error reporting."""
    hunks, cur_file, cur_key, cur = {}, None, None, []
    for line in diff_text.splitlines():
        if line.startswith('diff --git '):
            if cur_key:
                hunks[cur_key] = cur
            cur_file = line.split(' b/')[-1]
            cur_key, cur = None, []
        elif line.startswith('@@'):
            if cur_key:
                hunks[cur_key] = cur
            m = re.match(r'@@ -(\d+)', line)
            cur_key = (cur_file, int(m.group(1))) if m else None
            cur = [line]
        elif cur_key:
            cur.append(line)
    if cur_key:
        hunks[cur_key] = cur
    return hunks


def apply_diff(scratch):
    if not DIFF.is_file():
        die(f'{DIFF} not found')
    p = subprocess.run(['git', 'apply', str(DIFF)], cwd=scratch,
                       capture_output=True)
    if p.returncode == 0:
        return
    err = p.stderr.decode('utf-8', 'replace')
    print('build_test: git apply failed:', file=sys.stderr)
    sys.stderr.write(err)
    hunks = diff_hunks(DIFF.read_text(encoding='utf-8', errors='replace'))
    shown = False
    for f, line in re.findall(r'patch failed: (.+?):(\d+)', err):
        hunk = hunks.get((f, int(line)))
        print(f'build_test: failing file {f} hunk at old line {line}:',
              file=sys.stderr)
        if hunk:
            print('\n'.join(hunk), file=sys.stderr)
            shown = True
        else:
            print('  (binary patch or hunk not located in neon.diff)',
                  file=sys.stderr)
    if not shown and not re.search(r'patch failed', err):
        print('build_test: git apply reported no hunk detail; see the git '
              'errors above', file=sys.stderr)
    raise SystemExit(2)


def build(scratch):
    p = subprocess.run([sys.executable, 'build.py'], cwd=scratch,
                       capture_output=True, text=True)
    sys.stdout.write(p.stdout)
    sys.stderr.write(p.stderr)
    if p.returncode != 0:
        die(f'build.py failed in {scratch} (exit {p.returncode})')


def compare(check, scratch):
    built_path = scratch / 'index.html'
    if not built_path.is_file():
        die('build.py did not produce index.html in the scratch tree')
    built = built_path.read_bytes()
    built_sha = hashlib.sha256(built).hexdigest()
    if not check:
        TARGET.write_bytes(built)
        print(f'build_test: wrote {TARGET} '
              f'({len(built)} bytes, sha256 {built_sha})')
        return 0
    if not TARGET.is_file():
        print(f'build_test: MISMATCH -- {TARGET} is missing; '
              f'rebuilt sha256 {built_sha}')
        return 1
    current = TARGET.read_bytes()
    if current == built:
        print(f'build_test: OK -- rebuilt index.html is byte-identical to '
              f'{TARGET.name} ({len(built)} bytes, sha256 {built_sha})')
        return 0
    off = next((i for i, (a, b) in enumerate(zip(built, current)) if a != b),
               min(len(built), len(current)))
    print(f'build_test: MISMATCH -- rebuilt {len(built)} bytes '
          f'sha256 {built_sha}; {TARGET.name} {len(current)} bytes '
          f'sha256 {hashlib.sha256(current).hexdigest()}; '
          f'first difference at offset {off}')
    return 1


def main(argv=None):
    ap = argparse.ArgumentParser(
        description='Rebuild TestPMChat5.6Pro.html in a scratch copy of this '
                    'concept folder (main sources + neon/neon.diff) and '
                    'compare or overwrite it.')
    ap.add_argument('--check', action='store_true',
                    help='exit 0 if the rebuilt index.html is byte-identical '
                         'to TestPMChat5.6Pro.html, 1 if not; never write')
    ap.add_argument('--keep', action='store_true',
                    help='keep the scratch directory instead of deleting it')
    args = ap.parse_args(argv)

    SCRATCH_ROOT.mkdir(parents=True, exist_ok=True)
    scratch = Path(tempfile.mkdtemp(prefix='build-test-', dir=SCRATCH_ROOT))
    print(f'build_test: scratch {scratch}')
    try:
        files = list_files()
        print(f'build_test: staged {len(files)} files')
        copy_tree(files, scratch)
        apply_diff(scratch)
        build(scratch)
        return compare(args.check, scratch)
    finally:
        if args.keep:
            print(f'build_test: kept scratch {scratch}')
        else:
            shutil.rmtree(scratch, ignore_errors=True)


if __name__ == '__main__':
    sys.exit(main())
