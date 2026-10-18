"""Assemble the live PM7 shell sources, preserving every byte and the manifest order."""
from __future__ import annotations

import json
from pathlib import Path

BASE = Path(__file__).resolve().parent.parent / 'base'


def assemble(folder: Path = BASE) -> bytes:
    manifest = json.loads((folder / 'manifest.json').read_bytes())
    if manifest['version'] != 1:
        raise ValueError('unsupported PM7 base manifest version')
    text = (folder / manifest['skeleton']).read_bytes()
    slots = set()
    for block in manifest['blocks']:
        slot = block['slot'].encode('ascii')
        if slot in slots or text.count(slot) != 1:
            raise ValueError(f'PM7 base slot must occur exactly once: {slot!r}')
        slots.add(slot)
        path = (folder / block['file']).resolve()
        if not path.is_relative_to(folder.parent.resolve()):
            raise ValueError(f'PM7 base source outside package: {path}')
        body = path.read_bytes()
        if b'@@PM7_BASE_' in body:
            raise ValueError(f'PM7 base slot token inside source: {path}')
        text = text.replace(slot, body, 1)
    if b'@@PM7_BASE_' in text:
        raise ValueError('unresolved PM7 base slot')
    return text


if __name__ == '__main__':
    import argparse
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--out', type=Path, required=True)
    args = parser.parse_args()
    args.out.write_bytes(assemble())
