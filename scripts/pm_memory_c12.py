#!/usr/bin/env python3
"""DMEM C12 evidence over the existing owner checkers; native execution stays NOT_RUN.

This is the DMEM whole-definition Method B adapter, not a replacement schema
validator. It uses the unchanged complete validators, records their original
schema keywords, and tests the original refusing table row. A mutation earns
credit only for that row AND its exact code. The row cut and restoration are
separate observations. Invalid proposals are exported and never count as kills.
"""
from collections import Counter
from copy import deepcopy
from dataclasses import asdict, replace as dataclass_replace
import argparse
import ast
import hashlib
import importlib.util
import json
from pathlib import Path
import sys
from urllib.parse import urldefrag, unquote, urljoin

ROOT = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(ROOT / 'scripts'))
import pm_memory_guard_suites as suites

PAYLOAD = 'Plans/memory_maintenance_event_payloads.schema.json'
OPERATION = 'Plans/memory_maintenance_operation.schema.json'
TARGET = 'Plans/memory_maintenance_rebuild_target.schema.json'
ENVELOPE = 'Plans/memory_maintenance_event_record.schema.json'
CHECKPOINT = 'Plans/event_record_index_checkpoint.schema.json'
FIXTURES = (
    'Plans/memory_maintenance_event_fixtures.json',
    'Plans/memory_archive_event_fixtures.json',
    'Plans/memory_canonical_history_fixtures.json',
    'Plans/memory_write_recipe_fixtures.json',
    'Plans/memory_card6_policy_fixtures.json',
    'Plans/event_record_index_checkpoint_contract_fixtures.json',
)
ASSERTIONS = {'type', 'const', 'enum', 'required', 'additionalProperties',
              'minLength', 'maxLength', 'pattern', 'format', 'minimum',
              'maximum', 'minItems', 'maxItems', 'uniqueItems', 'contains',
              'minContains', 'maxContains', 'minProperties', 'maxProperties'}
MAPS = {'properties', 'patternProperties', '$defs', 'dependentSchemas'}
ARRAYS = {'allOf', 'anyOf', 'oneOf', 'prefixItems'}
SINGLE = {'items', 'contains', 'if', 'then', 'else', 'not', 'additionalProperties'}


def encoded(value):
    return json.dumps(value, sort_keys=True, ensure_ascii=False, separators=(',', ':'), default=str).encode()


def sha(value):
    return hashlib.sha256(encoded(value)).hexdigest()


def pin(path):
    return hashlib.sha256((ROOT / path).read_bytes()).hexdigest()


def write(path, value):
    path.write_text(json.dumps(value, indent=1, sort_keys=True, default=str) + '\n')


def objects(value, where=()):
    if isinstance(value, dict):
        yield where, value
        for key, item in value.items():
            yield from objects(item, where + (key,))
    elif isinstance(value, list):
        for key, item in enumerate(value):
            yield from objects(item, where + (key,))


def pointer(parts):
    return '/' + '/'.join(str(x).replace('~', '~0').replace('/', '~1') for x in parts) if parts else ''


def at(value, parts):
    for part in parts:
        value = value[part]
    return value


def replace(value, parts, new):
    if not parts:
        return deepcopy(new)
    value = deepcopy(value)
    parent = at(value, parts[:-1])
    parent[parts[-1]] = deepcopy(new)
    return value


def schema_nodes(schema, parts=()):
    if not isinstance(schema, dict):
        return
    yield parts, schema
    for key, value in schema.items():
        # A $defs container is not evaluated by its parent. schema_closure
        # enters an exact definition only when an actual $ref selects it.
        # The original checker's eager reference gate separately walks dormant refs.
        if key in MAPS and key != '$defs' and isinstance(value, dict):
            for name, item in value.items():
                yield from schema_nodes(item, parts + (key, name))
        elif key in ARRAYS and isinstance(value, list):
            for i, item in enumerate(value):
                yield from schema_nodes(item, parts + (key, i))
        elif key in SINGLE and isinstance(value, dict):
            yield from schema_nodes(value, parts + (key,))


def schema_closure(m, path, definition):
    """All source clauses and reference branches of this exact definition, eagerly.

    References preserve their source document/pointer, including the shared
    checkpoint and both EventRecord editions. Repeated clauses are not erased.
    """
    documents = m.checked_documents()
    by_uri = {m.document_uri(p, doc): p for p, doc in documents.items()}
    visited = set()
    def visit(source, parts):
        key = (source, parts)
        if key in visited:
            return
        visited.add(key)
        node = at(documents[source], parts)
        for local, schema in schema_nodes(node):
            location = parts + local
            yield source, location, schema
            if '$ref' in schema:
                uri, fragment = urldefrag(urljoin(m.document_uri(source, documents[source]), schema['$ref']))
                target = by_uri[uri]
                components = tuple(unquote(x).replace('~1', '/').replace('~0', '~') for x in fragment.split('/')[1:])
                yield from visit(target, components)
    return list(visit(path, ('$defs', definition)))


def branch_signature(value):
    if isinstance(value, dict):
        return tuple((k, branch_signature(v) if isinstance(v, (dict, list)) else
                      (type(v).__name__, v if k in {'phase', 'status', 'state', 'origin', 'role',
                       'schema_version', 'scope_kind', 'empty_retained_source'} else v is None))
                     for k, v in sorted(value.items()))
    if isinstance(value, list):
        return tuple(sorted({repr(branch_signature(v)) for v in value}))
    return type(value).__name__


def pool():
    """Authored controls only, with exact fixture coordinates; no schema-default synthesis."""
    result = {}
    for path in FIXTURES:
        doc = json.loads((ROOT / path).read_text())
        for parts, value in objects(doc):
            result.setdefault(sha(value), (value, path + '#' + pointer(parts)))
    return list(result.values())


def roots(m, event):
    archive = event in suites.ARCHIVE
    job = m.operation_name(event)
    simple = lambda phase, field: (phase, field, {})
    yield PAYLOAD, event.replace('.', '_'), simple('bd_schema', 'payload_valid')
    yield OPERATION, job, simple('aop_schema' if archive else 'op_schema', 'schema_valid')
    yield OPERATION, 'historical_' + job, simple('op_schema', 'schema_valid')
    yield ENVELOPE, 'current', simple('aa_envelope' if archive else 'ap_envelope', 'envelope_valid')
    for definition in ('historical_current', 'compatibility'):
        yield ENVELOPE, definition, ('hm_body', 'envelope_valid', {
            'durability': 'full_flush', 'full_value_sha256': 'same', 'expected_full_value_sha256': 'same'})
    yield CHECKPOINT, 'checkpoint', ('ck_envelope', 'checkpoint_valid', {'envelope_valid': True})
    if '.index.' in event:
        kind = 'lexical' if '.lexical.' in event else 'semantic'
        yield TARGET, kind + '_target', simple('tg_schema', 'schema_valid')
        yield TARGET, 'historical_' + kind + '_target', simple('tg_schema', 'schema_valid')
        yield TARGET, kind + '_selector', simple('sel_schema', 'schema_valid')


def candidate_controls(m, path, definition, candidates, event):
    schema = m.load(path)['$defs'][definition]
    required = set(schema.get('required', ()))
    schema_id = schema.get('properties', {}).get('schema_id', {}).get('const')
    # Full offline validator, including every oneOf/allOf/ref and the owner's format profile.
    validator = m.envelope_edition_validator(definition) if path == ENVELOPE else m.validator(path, definition)
    selected = []
    signatures = set()
    for value, ref in candidates:
        if required and not required <= set(value):
            continue
        if schema_id and value.get('schema_id') != schema_id:
            continue
        if path == PAYLOAD and value.get('event_type') != event:
            continue
        if path == ENVELOPE and value.get('event_type') != event:
            continue
        if path == TARGET and value.get('index_kind', value.get('target', {}).get('index_kind')) != definition.split('_')[-2]:
            continue
        if not validator.is_valid(value):
            continue
        # Preserve every authored branch, field shape, nullable arm, artifact role and envelope edition.
        signature = branch_signature(value)
        if signature in signatures:
            continue
        signatures.add(signature)
        selected.append((value, ref))
    return validator, selected


def proposals(value):
    """Finite DMEM field probes. All mutations remain data; none changes a schema or a helper."""
    yield 'null', None
    yield 'boolean', True
    yield 'integer', -1
    yield 'fraction', 0.5
    yield 'empty-string', ''
    yield 'punctuation', '!'
    yield 'empty-array', []
    yield 'empty-object', {}
    if isinstance(value, str):
        yield 'trailing-lf', value + '\n'
        yield 'nonmatching-ascii', '!' * max(1, len(value))
        yield 'long-string', 'x' * 257
        if 'T' in value or 't' in value:
            yield 'invalid-hour', '2026-08-07T24:00:00Z'
            yield 'long-valid-fraction', '2026-08-07T00:00:00.' + '0' * 70 + 'Z'
            yield 'offset', '2026-08-07T00:00:00+00:00'
    if type(value) is int:
        yield 'above-u64', 18446744073709551616
        yield 'above-safe', 9007199254740992
    if isinstance(value, dict):
        for key in value:
            changed = deepcopy(value); del changed[key]
            yield 'missing/' + key, changed
        yield 'extra-property', {**deepcopy(value), '__c12_unknown__': True}
        yield 'above-three-properties', {**deepcopy(value), **{'__c12_extra_' + str(i): True for i in range(4)}}
    if isinstance(value, list) and value:
        yield 'duplicate-item', value + [deepcopy(value[0])]
        yield 'above-32-items', [deepcopy(value[0]) for _ in range(33)]


def locations(value, parts=()):
    yield parts, value
    if isinstance(value, dict):
        for key, item in value.items():
            yield from locations(item, parts + (key,))
    elif isinstance(value, list):
        # Every role in the semantic artifact manifest is a distinct witness.
        for key, item in enumerate(value):
            yield from locations(item, parts + (key,))


def errors(validator, value):
    def flatten(error):
        yield {'keyword': str(error.validator), 'schema_path': list(error.absolute_schema_path),
               'instance_path': list(error.absolute_path)}
        for child in error.context:
            yield from flatten(child)
    return [item for error in validator.iter_errors(value) for item in flatten(error)]


def row_outcome(m, phase, field, peers, validator, value):
    try:
        m.require(phase, **{**peers, field: validator.is_valid(value)})
    except m.TableRefusal as error:
        return [error.phase, error.row, error.code]
    except Exception as error:
        return ['ERROR', type(error).__name__, str(error)]
    return ['accepted']


def schema_audit(m, event, candidates, out, shared):
    inventory, ledger, invalid, controls, reused = [], [], [], [], []
    for path, definition, (phase, field, peers) in roots(m, event):
        cache_key = (path, definition, phase, field, sha(peers), pin(path),
                     pin('scripts/pm_memory_maintenance_events.py'), pin('scripts/pm_guard_isolation.py'))
        if path != PAYLOAD and path != ENVELOPE and cache_key in shared:
            site = deepcopy(shared[cache_key])
            site['reuse'] = {'family': site['family'], 'coverage_file': site['family'] + '.coverage.json',
                            'schema_sha256': site['schema_sha256'], 'case_sha256': site['case_sha256'],
                            'table_source_sha256': site['table_source_sha256']}
            site['family'] = event
            inventory.append(site)
            reused.append(site['reuse'])
            continue
        print('  ' + path + '#/$defs/' + definition, file=sys.stderr, flush=True)
        validator, specimens = candidate_controls(m, path, definition, candidates, event)
        if not specimens:
            raise AssertionError(('no authored control', event, path, definition))
        row = next((name, predicate, context) for name, predicate, context in m.table_rows(phase)
                   if predicate({**peers, field: False}, context) is not None)
        name, predicate, context = row
        expected = [phase, name, predicate({**peers, field: False}, context)]
        doc = m.load(path); schema = doc['$defs'][definition]
        assertions = [{'source': source, 'schema_pointer': pointer(parts) + '/' + keyword,
                       'keyword': keyword, 'value': node[keyword]}
                      for source, parts, node in schema_closure(m, path, definition)
                      for keyword in sorted(set(node) & ASSERTIONS)]
        # The entire original definition is enforced. No keyword is stripped to obtain a witness.
        site = {'family': event, 'schema': path, 'definition': definition, 'schema_sha256': pin(path),
                'phase': phase, 'row': name, 'expected_code': expected[2], 'assertions': assertions,
                'route': 'whole-definition Method B; schema keyword independence is not claimed',
                'applicators_and_refs': [{'source': source, 'schema_pointer': pointer(parts),
                       'keywords': sorted(set(node) & (MAPS | ARRAYS | SINGLE | {'$ref'}))}
                      for source, parts, node in schema_closure(m, path, definition)
                      if set(node) & (MAPS | ARRAYS | SINGLE | {'$ref'})],
                'controls': [], 'mutations': [], 'keyword_observations': Counter()}
        seen = set()
        for control, source_ref in specimens:
            cid = sha([path, definition, control])
            assert row_outcome(m, phase, field, peers, validator, control) == ['accepted']
            controls.append({'id': cid, 'schema': path, 'definition': definition, 'source_ref': source_ref,
                             'value': control})
            site['controls'].append(cid)
            for parts, original in locations(control):
                for label, proposal in proposals(original):
                    changed = replace(control, parts, proposal)
                    key = sha(changed)
                    if key in seen:
                        continue
                    seen.add(key)
                    defects = errors(validator, changed)
                    item = {'id': sha([event, path, definition, cid, parts, label]), 'family': event,
                            'schema': path, 'definition': definition, 'control': cid,
                            'instance_path': list(parts), 'proposal': label,
                            'mutation_sha256': key, 'expected': expected, 'defects': defects}
                    if not defects:
                        # Inapplicable probes include allowed nulls and changes to unowned payload data.
                        item['classification'] = 'INVALID_NO_SCHEMA_DEFECT'
                        invalid.append(item)
                        continue
                    baseline = row_outcome(m, phase, field, peers, validator, changed)
                    saved = m.CUT_ROWS
                    try:
                        m.CUT_ROWS = saved | {(phase, name)}
                        cut = row_outcome(m, phase, field, peers, validator, changed)
                    finally:
                        m.CUT_ROWS = saved
                    restored = row_outcome(m, phase, field, peers, validator, changed)
                    item.update(baseline=baseline, cut=cut, restored=restored,
                                killed=baseline == expected and cut == ['accepted'] and restored == expected,
                                classification='WHOLE_DEFINITION_ROW')
                    assert item['killed'], item
                    ledger.append(item)
                    site['mutations'].append(item['id'])
                    site['keyword_observations'].update({x['keyword'] for x in defects})
        assert site['mutations'], ('no negative', event, path, definition)
        site['keyword_observations'] = dict(site['keyword_observations'])
        site['case_sha256'] = sha({'controls': site['controls'], 'mutations': site['mutations']})
        site['table_source_sha256'] = pin('scripts/pm_memory_table_' + phase + '.py')
        inventory.append(site)
        shared[cache_key] = site
    write(out / (event + '.coverage.json'), inventory)
    write(out / (event + '.mutations.json'), {'credited': ledger, 'invalid': invalid, 'reused': reused})
    write(out / (event + '.controls.json'), controls)
    return {'family': event, 'schema_sites': len(inventory), 'schema_assertion_occurrences': sum(len(x['assertions']) for x in inventory),
            'controls': len(controls), 'exact_kills': len(ledger), 'invalid_proposals': len(invalid),
            'shared_sites_reused': len(reused),
            'whole_definition_rows': True, 'keyword_independence_claimed': False}


def store_snapshot(m):
    """Actual synthetic custody store, including every binding, recipe and original commitment."""
    return deepcopy(m.ORIGINAL_CUSTODY)


def retained_audit(m, event):
    history = m.load('Plans/memory_canonical_history_fixtures.json')['canonical_history_families']
    family = next(f for f in history if f['event_type'] == event)
    m.install_original_custody(history_families=[family])
    results = []
    for mode, control in family['states'].items():
        for defect in ('accepted', 'missing-receipt', 'ambiguous-receipt', 'other-original', 'unknown-recipe', 'withdrawn', 'revoked'):
            state = deepcopy(control)
            record = state['originals'][event]; value = record['full_value']
            commitment = m.source_commitment(value, record['full_value_sha256'])
            binding = m.original_binding(state['written_operation'], event, commitment)
            ref = 'seglog:' + binding.event_id
            with m.custody_scope():
                if defect == 'missing-receipt':
                    m.ORIGINAL_CUSTODY.pop(ref, None)
                elif defect == 'ambiguous-receipt':
                    entry = m.ORIGINAL_CUSTODY[ref][commitment][0]
                    m.ORIGINAL_CUSTODY[ref][commitment].append(entry)
                elif defect == 'other-original':
                    entries = m.ORIGINAL_CUSTODY[ref][commitment]
                    other = m.numbers.OriginalBinding(**{**binding.__dict__, 'event_id': 'evt_mem_' + 'f' * 64})
                    entries[0] = (other, entries[0][1])
                elif defect == 'unknown-recipe':
                    entries = m.ORIGINAL_CUSTODY[ref][commitment]
                    entries[0] = (entries[0][0], dataclass_replace(entries[0][1], producer_recipe='c12-uninstalled-writer'))
                elif defect == 'withdrawn':
                    state['withdrawn'] = True
                elif defect == 'revoked':
                    state['permission'] = False
                before = store_snapshot(m); caller = deepcopy(state)
                try:
                    actual = m.read_canonical_history(state, event)
                except m.TableRefusal as error:
                    outcome = [error.phase, error.row, error.code]
                else:
                    assert defect == 'accepted' and m.retained_binding(actual, value), (event, mode, defect)
                    outcome = ['accepted']
                after = store_snapshot(m)
                assert before == after and state == caller, (event, mode, defect, 'read changed custody/caller')
                expected_code = ('permission_or_withdrawal' if defect in ('withdrawn', 'revoked') else
                                 'start_receipt_missing' if event.endswith('.started') else 'original_missing')
                if defect != 'accepted':
                    assert outcome[-1] == expected_code, (event, mode, defect, outcome)
                    if defect in ('withdrawn', 'revoked'):
                        exact = ['rh_access', 'RH02_withdrawn' if defect == 'withdrawn' else 'RH01_permission', expected_code]
                    else:
                        prefix = 'sgh' if event.endswith('.started') else 'hm'
                        suffix = {'missing-receipt': 'R1_sealed', 'ambiguous-receipt': 'R2_unambiguous',
                                  'other-original': 'R3_binding', 'unknown-recipe': 'R4_recipe'}[defect]
                        exact = [prefix + '_custody', prefix.upper() + suffix, expected_code]
                    assert outcome == exact, (event, mode, defect, outcome, exact)
                snapshot = {ref: {commitment: [{'binding': asdict(binding), 'recipe': asdict(recipe)}
                              for binding, recipe in entries] for commitment, entries in commits.items()}
                            for ref, commits in before.items()}
                results.append({'family': event, 'edition': mode, 'case': defect, 'outcome': outcome,
                                'store_before_sha256': sha(snapshot), 'store_after_sha256': sha(snapshot),
                                'store_snapshot': snapshot,
                                'store_unchanged': True, 'caller_unchanged': True,
                                'receipt_ref': ref, 'commitment': commitment})
    return results


def source_inventory(m):
    result = []
    for path in ('scripts/pm_memory_maintenance_events.py', 'scripts/pm_memory_archive_events.py', 'scripts/pm_memory_policy.py'):
        tree = ast.parse((ROOT / path).read_text())
        for node in ast.walk(tree):
            if isinstance(node, ast.Call) and isinstance(node.func, (ast.Name, ast.Attribute)):
                name = node.func.id if isinstance(node.func, ast.Name) else node.func.attr
                if name in ('require', 'validator', 'envelope_edition_validator', 'checkpoint_validator', 'operation_check',
                            'target_check', 'resolve_retained', 'date_time', 'shared_date_time'):
                    result.append({'path': path, 'line': node.lineno, 'call': ast.unparse(node), 'sha256': pin(path)})
    return result


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--family', choices=suites.FAMILIES)
    parser.add_argument('--out', required=True, type=Path)
    args = parser.parse_args(); args.out.mkdir(parents=True, exist_ok=True)
    archive = suites.load(ROOT / 'scripts/pm_memory_archive_events.py', '_dmem_c12_archive')
    m = archive.core
    candidates = pool()
    write(args.out / 'source-sites.json', source_inventory(m))
    summaries = []; retained = []; shared = {}
    for event in ([args.family] if args.family else suites.FAMILIES):
        print('schema audit ' + event, file=sys.stderr, flush=True)
        summaries.append(schema_audit(m, event, candidates, args.out, shared))
        with m.custody_scope():
            m.ORIGINAL_CUSTODY.clear()
            retained.extend(retained_audit(m, event))
    write(args.out / 'retained-store.json', retained)
    write(args.out / 'summary.json', {'status': 'pass', 'families': summaries,
          'source_pins': {p: pin(p) for p in (*FIXTURES, *m.SCHEMA_DOCUMENTS,
                         'scripts/pm_memory_maintenance_events.py', 'scripts/pm_memory_archive_events.py',
                         'scripts/pm_memory_policy.py', 'scripts/pm_guard_isolation.py', 'scripts/pm_memory_c12.py')},
          'native': 'NOT_RUN', 'admission': 'ABSENT'})


if __name__ == '__main__':
    main()
