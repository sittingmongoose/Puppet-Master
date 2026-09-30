#!/usr/bin/env python3
"""Deterministic heading/path locator index; metadata only, no premium-written answers."""
import argparse
import json
from pathlib import Path
import re
from workspaces import sha, no_symlink_chain


def build(root):
    root = no_symlink_chain(root).resolve(strict=True)
    records = []
    for path in sorted(root.rglob('*')):
        if path.is_symlink():
            raise ValueError('symlink source excluded')
        if not path.is_file() or path.suffix.lower() not in ('.md', '.txt', '.html', '.py', '.rs', '.js', '.ts'):
            continue
        lines = path.read_text(errors='replace').splitlines()
        headings = []
        for n, line in enumerate(lines, 1):
            m = re.match(r'^(#{1,6})\s+(.+)$', line)
            html = re.search(r'<h([1-6])[^>]*>(.*?)</h\1>', line, re.I)
            numbered = re.match(r'^(\d+(?:\.\d+)*\.)\s+([^\n]+)$', line)
            symbol = re.match(r'^\s*(?:pub\s+)?(?:async\s+)?(?:def|fn|class|function)\s+([\w]+)', line)
            if m:
                headings.append({'line': n, 'level': len(m[1]), 'label': m[2]})
            elif html:
                headings.append({'line': n, 'level': int(html[1]), 'label': re.sub('<[^>]+>', '', html[2])})
            elif numbered:
                headings.append({'line': n, 'level': numbered[1].count('.'),
                                 'label': numbered[2], 'section': numbered[1].rstrip('.')})
            elif symbol:
                headings.append({'line': n, 'symbol': symbol[1]})
        records.append({'path': str(path.relative_to(root)), 'sha256': sha(path),
                        'bytes': path.stat().st_size, 'line_count': len(lines), 'locators': headings})
    return {'schema': 'er7.source_locator_index.v1', 'parser': 'heading-numbered-symbol-regex-v2',
            'authority': 'navigation metadata; sources remain authoritative', 'files': records,
            'reading_rule': 'Read governing headings, surrounding conditions and counterevidence in the source; '
                            'the index is not evidence of absence or semantic applicability.'}


if __name__ == '__main__':
    ap = argparse.ArgumentParser()
    ap.add_argument('root', type=Path)
    ap.add_argument('output', type=Path)
    args = ap.parse_args()
    with args.output.open('x') as f:
        json.dump(build(args.root), f, indent=2)
        f.write('\n')
