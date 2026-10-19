"""Assemble the live PM7 shell sources, preserving every byte and the manifest order."""
from __future__ import annotations

import json
import re
from pathlib import Path

BASE = Path(__file__).resolve().parent.parent / 'base'
LG_SLOTS = BASE.parents[2] / 'liquid-glass' / 'opus-5.5' / 'src' / 'slots'
CSS_SLOT = re.compile(r'/\* @pm7-lg-slot ([^\r\n*]+\.css) \*/')


def read_source(path: Path) -> bytes:
    """Refuse checkout/editor corruption; never normalize bytes or EOF whitespace."""
    data = path.read_bytes()
    if b'\r' in data:
        raise ValueError(f'{path}: literal CR; restore LF (core.autocrlf=input or false, then LF rematerialization)')
    if data.startswith(b'\xef\xbb\xbf'):
        raise ValueError(f'{path}: UTF-8 BOM; save as UTF-8 without a BOM and preserve LF/EOF whitespace')
    try:
        data.decode('utf-8')
    except UnicodeDecodeError as exc:
        raise ValueError(f'{path}: invalid UTF-8; restore UTF-8 without a BOM and preserve LF/EOF whitespace') from exc
    return data


def read_text_source(path: Path) -> str:
    """Read authored text, restoring LG-owned CSS at its original source slot."""
    text = read_source(path).decode('utf-8')
    if path.suffix != '.css':
        return text
    seen = set()

    def fragment(match: re.Match) -> str:
        name = match.group(1)
        target = (LG_SLOTS / name).resolve()
        if not target.is_relative_to(LG_SLOTS.resolve()):
            raise ValueError(f'{path}: Liquid Glass slot outside package: {name}')
        if name in seen:
            raise ValueError(f'{path}: duplicate Liquid Glass slot: {name}')
        seen.add(name)
        body = read_source(target).decode('utf-8')
        if '@pm7-lg-slot' in body:
            raise ValueError(f'{target}: nested Liquid Glass slot')
        return body

    text = CSS_SLOT.sub(fragment, text)
    if '@pm7-lg-slot' in text:
        raise ValueError(f'{path}: malformed or unresolved Liquid Glass slot')
    return text


def assemble(folder: Path = BASE) -> bytes:
    manifest = json.loads(read_source(folder / 'manifest.json'))
    if manifest['version'] != 1:
        raise ValueError('unsupported PM7 base manifest version')
    text = read_source(folder / manifest['skeleton'])
    slots = set()
    for block in manifest['blocks']:
        slot = block['slot'].encode('ascii')
        if slot in slots or text.count(slot) != 1:
            raise ValueError(f'PM7 base slot must occur exactly once: {slot!r}')
        slots.add(slot)
        path = (folder / block['file']).resolve()
        if not path.is_relative_to(folder.parent.resolve()):
            raise ValueError(f'PM7 base source outside package: {path}')
        body = read_text_source(path).encode('utf-8')
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
