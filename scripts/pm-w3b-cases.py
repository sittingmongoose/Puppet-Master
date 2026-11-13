#!/usr/bin/env python3
"""Build the W3B phase-2 fixtures: positives, one-defect negatives and Storage's sealed custody stand-in.

Writes ``Plans/w3b_event_fixtures.json`` (each negative stored as its base positive plus the exact changes),
``Plans/w3b_original_custody.json`` (the ``w3b@1`` recipe and one sealed receipt per retained original) and, with
``--coverage``, ``reports/event-authority-20261105/W3B-phase2-plan-coverage.json`` (every phase-1 plan entry with
its witnesses). ``--check`` rebuilds everything in memory and fails when a committed file is stale.

Every negative starts from a named positive and changes exactly one thing: either one knob of the coherent builder
(``pm_w3b_cases_lib.build``: a source value, a request field, an owner-authority value), after which every
dependent copy, key, digest and post-state is recomputed, or one post-build change to a value nothing else is
derived from. Independently captured owner authority is never repaired to make a negative pass elsewhere.
"""
from __future__ import annotations

import argparse
import copy
import hashlib
import json
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent))
import pm_w3b_event_oracles as W  # noqa: E402
import pm_w3b_cases_lib as L  # noqa: E402
import pm_w3b_negatives as NG  # noqa: E402

ROOT = W.ROOT
FIXTURES = ROOT / 'Plans' / W.FIXTURES
CUSTODY = ROOT / 'Plans' / W.CUSTODY_FILE
COVERAGE = ROOT / 'reports' / 'event-authority-20261105' / 'W3B-phase2-plan-coverage.json'
RECIPE_RESOURCES = sorted(['Plans/' + n for n in ('source_control_event_contracts.schema.json', 'source_control_contracts.schema.json',
                                                  'event_record.schema.json', 'event_append_receipt_contracts.schema.json',
                                                  'event_record_index_checkpoint.schema.json', 'shared_integration_runtime.schema.json')])


def recipes():
    base = {'envelope_schema_id': 'pm.event.v0', 'envelope_schema_version': '2.0.0', 'payload_schema_version': '1.0.0',
            'owner_edition': 'w3b-phase2-2026-11-13', 'registry_revision': 'w3b-prepared-1.0.0',
            'identity_recipe': 'scs.event_id.hex_concat.v1+scs.idempotency_key.hex_concat.v1',
            'producer_recipe': 'cv317.producer_semantic.cv1100', 'physical_profile': 'pm.seglog_frame_v2.event_value.canonical_msgpack.v1',
            'full_value_profile': 'cv339.original_event_value_commitment.v1', 'local_source_profile': 'sp1250.source_fact.v1',
            'payload_profile': 'sp337.inline_or_pack', 'resources': RECIPE_RESOURCES, 'timestamp_profiles': dict(W.RECIPE_PROFILES),
            'installed': True}
    legacy = dict(base, owner_edition='w3b-unreleased-draft', installed=False)
    return {'w3b@1': base, 'w3b@0': legacy}


def manifest(recipe):
    return W.resource_manifest({n: hashlib.sha256((ROOT / n).read_bytes()).hexdigest() for n in sorted(recipe['resources'])},
                               recipe['timestamp_profiles'])


def sealed(original, recipe_id='w3b@1', admission_family=None):
    e = original['event']
    r = recipes()[recipe_id]
    return {'storage_instance_id': L.SID, 'event_type': e['event_type'], 'event_id': e['event_id'], 'recipe': recipe_id,
            'resource_manifest_sha256': manifest(recipes()['w3b@1']), 'server_id': L.SERVER,
            'admission': {'family': admission_family or e['event_type'], 'version': '1.0.0', 'registry_revision': r['registry_revision']},
            'source_commitment': hashlib.sha256(L.vbytes(e)).hexdigest()}


def build_all():
    pos, neg, seals = NG.catalog()
    receipts = []
    seen = set()
    for item in seals:
        r = sealed(*item)
        k = json.dumps(r, sort_keys=True)
        if item[0].get('_duplicate'):
            receipts.append(r)
            continue
        if k not in seen:
            seen.add(k)
            receipts.append(r)
    custody = {'schema_id': 'pm.w3b.original_custody.v1',
               'note': ('Static stand-in for Storage\'s sealed write custody (SP-286/SP-1101): the w3b@1 recipe (resource manifest over '
                        'the W3B schema resources and the CV-1101 field profiles) and one sealed receipt per retained original Storage '
                        'wrote. w3b@0 is a recorded but uninstalled edition (unknown editions quarantine). The checker only reads this.'),
               'stores': [L.SID], 'recipes': recipes(), 'sealed_receipts': receipts}
    fixtures = {'schema_id': 'pm.w3b.event_fixtures.v1',
                'note': 'W3B phase-2 oracle fixtures: complete positives and one-defect negatives (base + exact changes). Synthetic; '
                        'membership ABSENT, native execution NOT_RUN.',
                'positives': pos, 'negatives': neg}
    return fixtures, custody


def text(value):
    return json.dumps(value, indent=1, sort_keys=True, ensure_ascii=True) + '\n'


def compact_lines(value):
    """A JSON object whose list members are written one compact case per line (diffable, about half the size)."""
    out = ['{']
    keys = sorted(value)
    for i, key in enumerate(keys):
        v = value[key]
        tail = ',' if i < len(keys) - 1 else ''
        if isinstance(v, list):
            out.append(json.dumps(key) + ': [')
            for j, item in enumerate(v):
                out.append(json.dumps(item, sort_keys=True, ensure_ascii=True, separators=(',', ':')) + (',' if j < len(v) - 1 else ''))
            out.append(']' + tail)
        else:
            out.append(json.dumps(key) + ': ' + json.dumps(v, sort_keys=True, ensure_ascii=True) + tail)
    out.append('}')
    return '\n'.join(out) + '\n'


def main(argv=None):
    parser = argparse.ArgumentParser(description=__doc__.splitlines()[0])
    parser.add_argument('--check', action='store_true')
    parser.add_argument('--coverage', action='store_true')
    args = parser.parse_args(argv)
    fixtures, custody = build_all()
    want = {FIXTURES: compact_lines(fixtures), CUSTODY: text(custody)}
    if args.coverage:
        want[COVERAGE] = text(NG.coverage(fixtures))
    stale = sorted([str(p.relative_to(ROOT)) for p, t in want.items() if not p.exists() or p.read_text() != t])
    summary = {'positives': len(fixtures['positives']), 'negatives': len(fixtures['negatives']),
               'sealed_receipts': len(custody['sealed_receipts'])}
    if args.check:
        print(json.dumps(dict(summary, stale=stale)))
        return 1 if stale else 0
    for p, t in want.items():
        if not p.exists() or p.read_text() != t:
            p.write_text(t)
    print(json.dumps(dict(summary, written=stale)))
    return 0


if __name__ == '__main__':
    sys.exit(main())
