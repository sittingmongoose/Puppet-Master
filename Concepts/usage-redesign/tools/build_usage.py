#!/usr/bin/env python3
"""Build the Usage page by delegating to opus-5.5 build.py.

The review copy Concepts/UsageTestPMConcept7.html is gone (Jared, 2026-10-09). This wrapper never writes it.

Usage:
  python3 Concepts/usage-redesign/tools/build_usage.py              # build.py --out <tmp>/usage-pm7/PMConcept7.html
  python3 Concepts/usage-redesign/tools/build_usage.py --out PATH   # build.py --out PATH
  python3 Concepts/usage-redesign/tools/build_usage.py --check      # build.py --check
"""
from __future__ import annotations

import subprocess
import sys
import tempfile
from pathlib import Path

TOOLS = Path(__file__).resolve().parent
PKG = TOOLS.parent
CONCEPTS = PKG.parent
OPUS_TOOLS = CONCEPTS / 'onboarding' / 'opus-5.5' / 'tools'
TARGET = CONCEPTS / 'UsageTestPMConcept7.html'


def published_mode() -> int:
    """Delegate to opus-5.5 build.py (--check, or a private --out build). Never write a published page from here."""
    build_py = OPUS_TOOLS / 'build.py'
    if '--check' in sys.argv:
        args = ['--check']
    else:
        out = Path(tempfile.gettempdir()) / 'usage-pm7' / 'PMConcept7.html'
        if '--out' in sys.argv:
            i = sys.argv.index('--out')
            if i + 1 >= len(sys.argv):
                print('--out needs a path', file=sys.stderr)
                return 2
            out = Path(sys.argv[i + 1]).expanduser()
        out.resolve().parent.mkdir(parents=True, exist_ok=True)
        args = ['--out', str(out)]
    print(f'build_usage: {TARGET.name} is retired (published mode); running opus-5.5 build.py {" ".join(args)}',
          file=sys.stderr)
    return subprocess.run([sys.executable, str(build_py), *args]).returncode


def main() -> int:
    return published_mode()


if __name__ == '__main__':
    sys.exit(main())
