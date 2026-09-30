#!/usr/bin/env python3
"""Candidate runnable deterministic map of pinned raw repository files."""
import argparse
import hashlib
import json
from pathlib import Path
import re
import time


def build(tree, pin_path, output):
    tree = Path(tree)
    pin = json.loads(Path(pin_path).read_text())
    if not re.fullmatch(r'[a-f0-9]{40,64}', pin['commit']) or not pin['repository_url'].startswith('https://'):
        raise ValueError('pinned public repository identity required')
    manifest = pin['files']
    if not isinstance(manifest, dict) or not manifest:
        raise ValueError('explicit pinned tree hash manifest required')
    start, files = time.monotonic(), []
    patterns = [r'^\s*(?:pub(?:\([^)]*\))?\s+)?(?:async\s+)?(?:fn|struct|enum|trait|mod)\s+(\w+)',
                r'^\s*(?:async\s+)?(?:def|class)\s+(\w+)',
                r'^\s*(?:export\s+)?(?:async\s+)?(?:function|class|interface)\s+(\w+)']
    for name, expected in sorted(manifest.items()):
        relative = Path(name)
        if relative.is_absolute() or '..' in relative.parts:
            raise ValueError('unsafe pinned tree path')
        path = tree / relative
        if path.is_symlink() or not path.is_file():
            raise ValueError('not a regular pinned file')
        raw = path.read_bytes()
        if hashlib.sha256(raw).hexdigest() != expected:
            raise ValueError('repository file changed: ' + name)
        if b'\0' in raw:
            continue
        lines = raw.decode('utf-8', errors='replace').splitlines()
        symbols = []
        for n, line in enumerate(lines, 1):
            for pattern in patterns:
                m = re.match(pattern, line)
                if m:
                    symbols.append({'name': m.group(1), 'line': n})
                    break
        files.append({'path': name, 'sha256': expected, 'bytes': len(raw), 'lines': len(lines),
                      'module': str(relative.parent), 'symbols': symbols,
                      'test_path': bool(re.search(r'(^|/)(tests?|specs?)(/|\.)|test_|_test\.', name))})
    result = {'schema': 'er7.repo_map.v1', 'repository_url': pin['repository_url'], 'commit': pin['commit'],
              'pin_sha256': hashlib.sha256(Path(pin_path).read_bytes()).hexdigest(), 'files': files,
              'index_seconds': time.monotonic() - start,
              'limitations': 'Lexical path/module/symbol/test map only; not a call graph or semantic evidence.'}
    Path(output).write_text(json.dumps(result, indent=2) + '\n')
    return {'files': len(files), 'index_seconds': result['index_seconds'], 'output': str(output)}


if __name__ == '__main__':
    p = argparse.ArgumentParser()
    for name in ('tree', 'pin', 'output'):
        p.add_argument('--' + name, type=Path, required=True)
    a = p.parse_args()
    print(json.dumps(build(a.tree, a.pin, a.output), indent=2))
