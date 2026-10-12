#!/usr/bin/env python3
"""Freeze explicit authored files before evaluation; no transcript or tree discovery."""
import argparse
from datetime import datetime, timezone
import hashlib
import json
from pathlib import Path
from public_files import relative, denied

def main():
    p = argparse.ArgumentParser(description=__doc__)
    p.add_argument('--root', required=True, type=Path)
    p.add_argument('--list', required=True, type=Path, help='JSON list of authored relative paths')
    p.add_argument('--destination', required=True, type=Path)
    p.add_argument('--verify', action='store_true')
    args = p.parse_args()
    if args.verify:
        manifest = json.loads((args.destination/'authored-manifest.json').read_text())
        for row in manifest['files']:
            data = relative(args.destination, row['path']).read_bytes()
            if hashlib.sha256(data).hexdigest() != row['sha256'] or len(data) != row['bytes']:
                raise ValueError('frozen hash mismatch')
        print(json.dumps({'verified': len(manifest['files'])}))
        return
    names = json.loads(args.list.read_text())
    if not names or len(set(names)) != len(names):
        raise ValueError('nonempty unique authored paths required')
    prepared = []
    for name in names:
        if name == 'authored-manifest.json' or denied(name):
            raise ValueError('not an authored output')
        data = relative(args.root.resolve(), name).read_bytes()
        prepared.append((name, data))
    args.destination.mkdir(parents=True, exist_ok=False)
    rows = []
    for name, data in prepared:
        dest = relative(args.destination, name)
        dest.parent.mkdir(parents=True, exist_ok=True)
        with dest.open('xb') as f:
            f.write(data)
        dest.chmod(0o444)
        rows.append({'path': name, 'bytes': len(data), 'sha256': hashlib.sha256(data).hexdigest()})
    manifest = {'schema': 'er13.authored_freeze.v1', 'frozen_at_utc': datetime.now(timezone.utc).isoformat(), 'evaluation_started': False, 'files': rows}
    dest = args.destination/'authored-manifest.json'
    with dest.open('x') as f:
        json.dump(manifest, f, indent=2)
        f.write('\n')
    dest.chmod(0o444)
    # Integrity is verified with hashes, not a claim of tamper-proof filesystem custody.
    print(json.dumps({'frozen': len(rows), 'manifest_sha256': hashlib.sha256(dest.read_bytes()).hexdigest()}))

if __name__ == '__main__':
    main()
