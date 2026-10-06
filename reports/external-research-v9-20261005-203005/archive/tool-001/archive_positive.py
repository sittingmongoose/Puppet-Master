#!/usr/bin/env python3
"""Stdlib-only, exact positive file archival. This tool grants no selection authority."""
import argparse
import hashlib
import json
import stat
from pathlib import Path

MAX_FILES = 5000
MAX_BYTES = 256 * 1024 * 1024
MAX_FILE_BYTES = 16 * 1024 * 1024
EXCLUDED = {'private', 'privatehome', 'auth', 'vendor', '.git', 'node_modules', 'native'}

def sha(data):
    return hashlib.sha256(data).hexdigest()

def encode(value):
    return (json.dumps(value, indent=2, sort_keys=True) + '\n').encode()

def no_symlinks(path):
    for p in (path, *path.parents):
        if p.is_symlink():
            raise ValueError('symlink forbidden: ' + str(p))

def bounded_read(path):
    no_symlinks(path)
    before = path.stat()
    if not stat.S_ISREG(before.st_mode) or before.st_size > MAX_FILE_BYTES:
        raise ValueError('not bounded regular file: ' + str(path))
    with path.open('rb') as stream:
        data = stream.read(MAX_FILE_BYTES + 1)
    after = path.stat()
    if len(data) > MAX_FILE_BYTES or (before.st_ino, before.st_size, before.st_mtime_ns) != (after.st_ino, after.st_size, after.st_mtime_ns):
        raise ValueError('file changed or exceeded bound: ' + str(path))
    return data

def additive_write(path, data):
    no_symlinks(path)
    path.parent.mkdir(parents=True, exist_ok=True)
    if path.exists():
        if bounded_read(path) != data:
            raise ValueError('immutable archive conflict: ' + str(path))
        return
    with path.open('xb') as stream:
        stream.write(data)
    path.chmod(0o444)

def materialize(selection, selection_sha256, source_root, archive_root, check=False):
    selection = Path(selection).absolute()
    source_root = Path(source_root).absolute()
    archive_root = Path(archive_root).absolute()
    no_symlinks(source_root)
    no_symlinks(archive_root)
    selection_bytes = bounded_read(selection)
    if sha(selection_bytes) != selection_sha256:
        raise ValueError('selection SHA mismatch')
    spec = json.loads(selection_bytes)
    if spec.get('schema') != 'er9.exact-positive-archive-selection.v1':
        raise ValueError('unsupported selection schema')
    files = spec['files']
    if len(files) > MAX_FILES:
        raise ValueError('file count bound')
    if archive_root == source_root or archive_root.is_relative_to(source_root):
        raise ValueError('archive must be outside source root')
    validated, total, seen = [], 0, set()
    for row in sorted(files, key=lambda item: item['path']):
        path = Path(row['path'])
        if not path.is_absolute() or '..' in path.parts or not path.is_relative_to(source_root):
            raise ValueError('source outside explicit root')
        relative = path.relative_to(source_root)
        if any(part.lower() in EXCLUDED for part in relative.parts):
            raise ValueError('excluded source path')
        if str(relative) in seen:
            raise ValueError('duplicate selected path')
        seen.add(str(relative))
        data = bounded_read(path)
        if sha(data) != row['sha256'] or len(data) != row['bytes']:
            raise ValueError('selected SHA/length mismatch: ' + str(path))
        total += len(data)
        if total > MAX_BYTES:
            raise ValueError('total byte bound')
        validated.append((row, relative, data))
    output = archive_root / selection_sha256
    manifest_files = []
    # All selected source bytes are validated before any evidence is written.
    for row, relative, data in validated:
        destination = output / 'files' / relative
        if not check:
            additive_write(destination, data)
            if sha(bounded_read(destination)) != row['sha256']:
                raise ValueError('archive verification failure')
        manifest_files.append(dict(row, archive_path=str(destination)))
    manifest = {'schema': 'er9.exact-positive-archive-manifest.v1',
                'selection_sha256': selection_sha256, 'coverage': spec['coverage'],
                'files_count': len(files), 'selected_bytes': total,
                'files': manifest_files, 'semantic_assessment': 'NONE'}
    manifest_bytes = encode(manifest)
    if not check:
        additive_write(output / 'SELECTION.json', selection_bytes)
        additive_write(output / 'MANIFEST.json', manifest_bytes)
    return {'manifest_path': str(output / 'MANIFEST.json'), 'manifest_sha256': sha(manifest_bytes),
            'selection_sha256': selection_sha256, 'files_count': len(files), 'selected_bytes': total,
            'coverage': spec['coverage'], 'action': 'check' if check else 'materialize'}

def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--selection', required=True)
    parser.add_argument('--selection-sha256', required=True)
    parser.add_argument('--source-root', required=True)
    parser.add_argument('--archive-root', required=True)
    parser.add_argument('--check', action='store_true')
    args = parser.parse_args()
    print(json.dumps(materialize(args.selection, args.selection_sha256, args.source_root, args.archive_root, args.check), indent=2))

if __name__ == '__main__':
    main()
