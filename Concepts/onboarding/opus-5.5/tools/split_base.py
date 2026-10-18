#!/usr/bin/env python3
"""One-time, lossless split of the historical TestPMConcept into editable shell sources.

Run with --out pointing to a NEW folder; never overwrite the live base with history.
HTMLParser treats script/style as raw text: only that block's own end tag closes it.
"""
from __future__ import annotations

import argparse
import hashlib
import json
import re
from html.parser import HTMLParser
from pathlib import Path

PKG = Path(__file__).resolve().parent.parent
HISTORY = PKG.parents[1] / 'Onboarding concepts' / 'TestPMConcept.html'
SPLIT_SHA256 = 'b3888fad4993f484ab4548e9ff212ec0042fa0a912947a7f316514db939326be'


class Blocks(HTMLParser):
    def __init__(self, text: str):
        super().__init__(convert_charrefs=False)
        self.text = text
        self.lines = [0] + [m.end() for m in re.finditer('\n', text)]
        self.blocks = []
        self.open_block = None
        self.feed(text)
        self.close()
        if self.open_block is not None:
            raise ValueError('unclosed script/style in base')

    def char_offset(self):
        line, column = self.getpos()
        return self.lines[line - 1] + column

    def handle_starttag(self, tag, attrs):
        if tag in ('style', 'script'):
            start = self.char_offset() + len(self.get_starttag_text())
            self.open_block = (tag, dict(attrs).get('id'), start)

    def handle_endtag(self, tag):
        if self.open_block is not None and self.open_block[0] == tag:
            self.blocks.append((*self.open_block, self.char_offset()))
            self.open_block = None


def split(text: str):
    """Return a markup skeleton, manifest entries, and raw block bodies, in document order."""
    entries, bodies, skeleton, end = [], {}, [], 0
    for i, (tag, element_id, start, stop) in enumerate(Blocks(text).blocks, 1):
        name = element_id or f'{tag}-{i:03}'
        if not re.fullmatch(r'[\w.-]+', name):
            raise ValueError(f'unsafe block id {name!r}')
        file = f'{tag}/{name}.{"css" if tag == "style" else "js"}'
        if file in bodies:
            raise ValueError(f'duplicate block id {name!r}')
        slot = f'@@PM7_BASE_{i:04}@@'
        if slot in text:
            raise ValueError(f'slot collision {slot}')
        entries.append(dict(tag=tag, id=element_id, file=file, slot=slot))
        bodies[file] = text[start:stop].encode('utf-8')
        skeleton.extend((text[end:start], slot))
        end = stop
    skeleton.append(text[end:])
    return ''.join(skeleton).encode('utf-8'), entries, bodies


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--out', type=Path, required=True)
    args = parser.parse_args()
    original = HISTORY.read_bytes()
    assert hashlib.sha256(original).hexdigest() == SPLIT_SHA256, 'historical split input drift'
    skeleton, entries, bodies = split(original.decode('utf-8'))
    args.out.mkdir(parents=True, exist_ok=False)
    for name, body in bodies.items():
        path = args.out / name
        path.parent.mkdir(exist_ok=True)
        path.write_bytes(body)
    (args.out / 'shell.html').write_bytes(skeleton)
    manifest = dict(version=1, skeleton='shell.html', blocks=entries,
                    split_proof=dict(history='Concepts/Onboarding concepts/TestPMConcept.html',
                                     sha256=SPLIT_SHA256, bytes=len(original)))
    (args.out / 'manifest.json').write_bytes((json.dumps(manifest, indent=2) + '\n').encode())
    from base_source import assemble
    assert assemble(args.out) == original, 'split did not reproduce the original bytes'
    print(f'{len(entries)} blocks; {len(original)} bytes; sha256 {SPLIT_SHA256}; exact split PASS')


if __name__ == '__main__':
    main()
