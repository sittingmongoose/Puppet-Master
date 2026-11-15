#!/usr/bin/env python3
"""s4b-tokfix token-schema mutations: a non-canonical or secret-bearing durable read token is refused at its expected
error, by the shared readiness registry check and by the s4b checker's own guards.

Each mutation edits deep copies only (nothing is written): the same change is made to every one of the 51 s4b
checkpoint rows of Plans/storage_value_registry.json and to Plans/browser_program_event_contracts.schema.json, as a lane
writing a token would make it. Three verdicts are compared with what the mutation states, for every row:
  readiness  scripts/pm-implementation-readiness.py storage_value_registry_data_failures on the mutated registry,
             restricted to that row: the exact set of (error, pointer or field) it reports;
  schema     pm_s4b_browser_events.durable_token_problems on the mutated schema (the checker's load guard);
  row        pm_s4b_browser_events.registry_row_problems on the mutated row against the mutated schema.
A mutation passes only when all three equal their stated expectation on all 51 rows. The unmutated control expects
nothing anywhere.

  python3 scripts/pm-s4b-token-mutations.py [--json OUT]
"""
import argparse
import copy
import importlib.util
import json
import re
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(ROOT / 'scripts'))
import pm_s4b_browser_events as S  # noqa: E402

SECRET_KEY = 'storage_value_secret_material_key'
SECRET_FIELD = 'storage_value_secret_material_field'
LIVE_FENCE = 'storage_value_registry_live_snapshot_fence_persisted'
REF_PREFIX = 'Plans/browser_program_event_contracts.schema.json#/$defs/'


def readiness_module():
    spec = importlib.util.spec_from_file_location('pm_implementation_readiness', ROOT / 'scripts/pm-implementation-readiness.py')
    module = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(module)
    return module


def slug_of(family):
    return S.FAM[family]['slug']


# Each mutation: (id, what it does, edit(defs, top, row, slug), expectations(slug)). `defs` is a $defs map (a row's own
# or the schema file's), `top` the family's checkpoint definition (the row's inline value_schema, or the schema file's
# <slug>_index_checkpoint), `row` the registry row or None. SHARED edits change the one durable token definition.

def _token(defs):
    return defs['durable_read_token']


def m_anchor(defs, top, row, slug):
    _token(defs)['properties']['generation_id']['pattern'] += r'(?![\s\S])'


def m_ref_primitive(defs, top, row, slug):
    _token(defs)['properties']['frontier_sha256'] = {'$ref': '#/$defs/sha256'}


def m_description(defs, top, row, slug):
    _token(defs)['description'] = 'SP-278 nine-field durable read token (DL-076); the live redb snapshot ID is never stored.'


def m_narrowed(defs, top, row, slug):
    _token(defs)['properties']['checkpoint_key']['maxLength'] = 512


def m_live_fence(defs, top, row, slug):
    canonical = S.INDEX_CHECKPOINT_SCHEMA['$defs']['read_token']
    defs['durable_read_token'] = copy.deepcopy(canonical)


def m_secret_member(defs, top, row, slug):
    _token(defs)['properties']['session_token'] = {'type': 'string', 'minLength': 1}


def m_rename(defs, top, row, slug):
    for node in (top, defs[slug + '_retired_generation']):
        node['properties'] = {('index_token' if k == 'index_read_token' else k): v for k, v in node['properties'].items()}
        node['required'] = ['index_token' if k == 'index_read_token' else k for k in node['required']]
    if row is not None:
        row['required_fields'] = ['index_token' if k == 'index_read_token' else k for k in row['required_fields']]


def m_two_hop(defs, top, row, slug):
    defs['read_token_alias'] = {'$ref': '#/$defs/durable_read_token'}
    top['properties']['index_read_token'] = {'$ref': '#/$defs/read_token_alias'}


def m_inline(defs, top, row, slug):
    top['properties']['index_read_token'] = copy.deepcopy(S.DURABLE_READ_TOKEN)


def m_none(defs, top, row, slug):
    return None


def non_canonical(slug):
    """What readiness reports when the row's durable token definition is not SP-278's: every key that names it and the
    field list entry, no exemption."""
    return {(SECRET_KEY, '$.properties.index_read_token'),
            (SECRET_KEY, '$.$defs.' + slug + '_retired_generation.properties.index_read_token'),
            (SECRET_KEY, '$.$defs.durable_read_token'),
            (SECRET_FIELD, 'index_read_token')}


NOT_SP278 = ['durable_read_token_not_sp278']
SHARED = ('TM00', 'TM01', 'TM02', 'TM03', 'TM04', 'TM05', 'TM06')
ROW_TOKEN = ['storage_registry_durable_read_token']

MUTATIONS = [
    ('TM00', 'unmutated control', m_none,
     lambda s: (set(), [], [])),
    ('TM01', "s4b's former lane anchor (?![\\s\\S]) on generation_id", m_anchor,
     lambda s: (non_canonical(s), NOT_SP278, ROW_TOKEN)),
    ('TM02', 'a token member through a lane primitive $ref (#/$defs/sha256)', m_ref_primitive,
     lambda s: (non_canonical(s), NOT_SP278, ROW_TOKEN)),
    ('TM03', 'a description added to the token', m_description,
     lambda s: (non_canonical(s), NOT_SP278, ROW_TOKEN)),
    ('TM04', 'a stricter-but-equivalent narrowing (checkpoint_key maxLength 512)', m_narrowed,
     lambda s: (non_canonical(s), NOT_SP278, ROW_TOKEN)),
    ('TM05', 'the live ten-field token with redb_snapshot_id stored', m_live_fence,
     lambda s: ({(LIVE_FENCE, '$.$defs.durable_read_token.properties.redb_snapshot_id')}, NOT_SP278, ROW_TOKEN)),
    ('TM06', 'a secret-bearing member (session_token) inside the token', m_secret_member,
     lambda s: (non_canonical(s) | {(SECRET_KEY, '$.$defs.durable_read_token.properties.session_token')}, NOT_SP278, ROW_TOKEN)),
    ('TM07', 'the token field renamed index_token (not a read-token name)', m_rename,
     lambda s: ({(SECRET_KEY, '$.properties.index_token'),
                 (SECRET_KEY, '$.$defs.' + s + '_retired_generation.properties.index_token'),
                 (SECRET_FIELD, 'index_token')},
                [(s + '_index_checkpoint', 'index_read_token_not_durable_ref'),
                 (s + '_retired_generation', 'index_read_token_not_durable_ref')], ROW_TOKEN)),
    ('TM08', 'a two-hop alias ($ref to a $ref of the token)', m_two_hop,
     lambda s: ({(SECRET_KEY, '$.properties.index_read_token'), (SECRET_KEY, '$.$defs.read_token_alias'),
                 (SECRET_FIELD, 'index_read_token')},
                [(s + '_index_checkpoint', 'index_read_token_not_durable_ref')], ROW_TOKEN)),
    ('TM09', 'the SP-278 token inline instead of by $ref (readiness exempts it; the lane pins the $ref form)', m_inline,
     lambda s: (set(), [(s + '_index_checkpoint', 'index_read_token_not_durable_ref')], ROW_TOKEN)),
]


def row_failures(failures, index_1_based):
    out = set()
    for f in failures:
        m = re.search(r'families\[(\d+)\]$', str(f.get('path', '')))
        if not m or int(m.group(1)) != index_1_based:
            continue
        error = str(f.get('error', ''))
        if error == SECRET_FIELD:
            out.add((error, f.get('field')))
        else:
            out.add((error, f.get('pointer')))
    return out


def main(argv=None):
    parser = argparse.ArgumentParser(description=__doc__.splitlines()[0])
    parser.add_argument('--json')
    args = parser.parse_args(argv)
    readiness = readiness_module()
    registry = json.loads((ROOT / 'Plans/storage_value_registry.json').read_text())
    schema = json.loads((ROOT / 'Plans/browser_program_event_contracts.schema.json').read_text())
    rows = {i: f for i, f in enumerate(registry['families'])
            if str(f.get('value_schema_ref', '')).startswith(REF_PREFIX)}
    by_family = {}
    for i, f in rows.items():
        family = [e for e in S.FAMILIES if S.FAM[e]['checkpoint_family_id'] == f['family_id']]
        assert len(family) == 1, f['family_id']
        by_family[family[0]] = i
    assert sorted(by_family) == sorted(S.FAMILIES), 'the 51 s4b rows'
    results = []
    for mid, words, edit, expect in MUTATIONS:
        reg = copy.deepcopy(registry)
        sch = copy.deepcopy(schema)
        for family, i in by_family.items():
            slug = slug_of(family)
            row = reg['families'][i]
            edit(row['value_schema']['$defs'], row['value_schema'], row, slug)
        # the schema file holds one shared durable token (edited once) and per-family definitions (edited per family)
        for family in (S.FAMILIES if mid not in SHARED else S.FAMILIES[:1]):
            slug = slug_of(family)
            edit(sch['$defs'], sch['$defs'][slug + '_index_checkpoint'], None, slug)
        failures = readiness.storage_value_registry_data_failures(reg, path_label='Plans/storage_value_registry.json')
        schema_got = S.durable_token_problems(sch)
        bad = []
        for family, i in sorted(by_family.items(), key=lambda kv: kv[1]):
            slug = slug_of(family)
            want_ready, want_schema_family, want_row = expect(slug)
            got_ready = row_failures(failures, i + 1)
            got_row = S.registry_row_problems(family, reg['families'][i], sch)
            want_schema = list(want_schema_family)
            schema_family = [p for p in schema_got if p == 'durable_read_token_not_sp278' or
                             (isinstance(p, tuple) and p[0] in (slug + '_index_checkpoint', slug + '_retired_generation'))]
            if got_ready != want_ready or schema_family != want_schema or got_row != want_row:
                bad.append({'family': family, 'row': i + 1,
                            'readiness': {'want': sorted(want_ready), 'got': sorted(got_ready)},
                            'schema': {'want': want_schema, 'got': schema_family},
                            'row_check': {'want': want_row, 'got': got_row}})
        other_rows = sorted({f.get('path') for f in failures
                             if str(f.get('error', '')).startswith(('storage_value_secret', LIVE_FENCE))
                             and not any(str(f.get('path', '')).endswith('families[%d]' % (i + 1)) for i in rows)})
        sample = sorted(by_family.items(), key=lambda kv: kv[1])[0]
        results.append({'id': mid, 'mutation': words, 'rows': len(by_family), 'passed': not bad and not other_rows,
                        'mismatches': bad[:3], 'mismatch_rows': len(bad), 'secret_failures_on_other_rows': other_rows,
                        'example_row': sample[1] + 1, 'example_readiness': sorted(row_failures(failures, sample[1] + 1)),
                        'example_schema_guard': [p for p in schema_got if p == 'durable_read_token_not_sp278' or
                                                 (isinstance(p, tuple) and p[0] in (slug_of(sample[0]) + '_index_checkpoint',
                                                                                   slug_of(sample[0]) + '_retired_generation'))],
                        'example_row_check': S.registry_row_problems(sample[0], reg['families'][sample[1]], sch)})
        print('%s %-6s %s' % (mid, 'PASS' if results[-1]['passed'] else 'FAIL', words), flush=True)
    summary = {'schema_id': 'pm.event_authority.s4b_token_mutations.v1', 'mutations': len(results),
               'passed': sum(r['passed'] for r in results), 'results': results}
    if args.json:
        Path(args.json).write_text(json.dumps(summary, indent=1, default=str) + '\n')
    print(json.dumps({'mutations': summary['mutations'], 'passed': summary['passed']}))
    return 0 if summary['passed'] == summary['mutations'] else 1


if __name__ == '__main__':
    sys.exit(main())
