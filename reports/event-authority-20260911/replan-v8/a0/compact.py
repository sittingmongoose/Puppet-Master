#!/usr/bin/env python3
"""Compact the A0 census outputs: keep every non-exact row in full and hash the complete outputs.

Usage: compact.py OUT_DIR BUNDLE_DIR
"""
import hashlib
import json
import pathlib
import sys

OUT = pathlib.Path(sys.argv[1])
BUNDLE = pathlib.Path(sys.argv[2])
BUNDLE.mkdir(parents=True, exist_ok=True)


def load(n):
    return json.loads((OUT / n).read_text())


nonexact = {
    'direct_pins_not_exact_at_target': [r for r in load('direct-pins.json') if r['status_at_target'] != 'EXACT'],
    'inherited_replan_pins_not_exact_at_target': [r for r in load('inherited-replan-pins.json') if r['status_at_target'] != 'EXACT'],
    'passages_missing_at_target': [r for r in load('passages.json') if r['occurrences_at_target'] == 0],
    'passages_found_more_than_once_at_target': [
        {k: r[k] for k in ('set', 'id', 'git_path', 'source_lines', 'occurrences_at_target', 'target_start_lines')}
        for r in load('passages.json') if r['occurrences_at_target'] > 1],
    'whole_definitions_not_exact_at_target': [r for r in load('whole-definitions.json') if r['definition_status'] != 'EXACT'],
    'original_coordinates_not_exact_at_target': [r for r in load('original-coordinates.json') if r['status_at_target'] != 'EXACT'],
    'parent_authentication': load('parent-authentication.json'),
    'registry_deltas': load('registry-deltas.json'),
    'proposed_physical_families': load('proposed-physical-families.json'),
    'owner_additions': load('owner-additions.json'),
}
(BUNDLE / 'census-nonexact.json').write_text(json.dumps(nonexact, indent=1, ensure_ascii=False) + '\n')
(BUNDLE / 'census-summary.json').write_bytes((OUT / 'summary.json').read_bytes())
lines = []
for p in sorted(OUT.glob('*.json')):
    lines.append(f'{hashlib.sha256(p.read_bytes()).hexdigest()}  {p.name}')
(BUNDLE / 'census-full-outputs.SHA256SUMS').write_text('\n'.join(lines) + '\n')
print('\n'.join(lines))
