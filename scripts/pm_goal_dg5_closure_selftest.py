#!/usr/bin/env python3
"""Exact dump/rebuild and reference verification regressions for DG5 tooling."""
import hashlib
import pickle
import unittest

import jsonschema
from referencing import Registry

import pm_goal_dg5_closure as c
import pm_goal_own_c_roots as original
from pm_goal_own_c3_w34_oracles import DiagnosticBank
from pm_goal_own_c3_w12_bank import ScopedBankV2, ScopedResolverV2
from pm_goal_own_c_oracles import Validator, FORMAT


def record(v, value):
    raw = pickle.dumps(value, protocol=5)
    return (hashlib.sha256(raw).hexdigest(), raw, c._signature(v.iter_errors(value)))


def slot(bank, v, values):
    return dict(validator=v, bank_object=bank, bank=type(bank).__module__ + '.' + type(bank).__qualname__,
                families={'selftest'}, calls=len(values), refused=0, seeds={}, records=[record(v, x) for x in values])


def bank(kind, docs, origins=None):
    b = kind.__new__(kind)
    b.registry, b.documents, b.resource_origins, b.node_origins = Registry(), {}, {}, {}
    for uri, doc in docs.items():
        b._register(uri, doc, (origins or {}).get(uri, ('test-sha', '')))
    b.registry = b.registry.crawl()
    return b


class Recipes(unittest.TestCase):
    def test_factory_class_and_formats(self):
        uri = 'https://example.test/owner'
        doc = {'$id': uri, '$schema': 'https://json-schema.org/draft/2020-12/schema',
               'type': 'object', 'properties': {'n': {'type': 'integer'},
               'at': {'type': 'string', 'format': 'date-time'}}}
        for kind in (original.OriginalBank, DiagnosticBank):
            b = bank(kind, {uri: doc})
            v = b.validator(uri)
            values = [{'n': 2, 'at': '2026-11-18T00:00:00Z'}, {'n': True}, {'at': 'bad'}]
            entry = c._dump_entry(slot(b, v, values), 'selftest-factory')
            self.assertEqual(entry['rebuild'], 'recipe', entry)
            rebuilt = c._rebuild_plain(pickle.loads(pickle.dumps(entry)))
            self.assertIs(type(rebuilt), type(v))
            self.assertEqual(c.agree(v, rebuilt, [record(v, x) for x in values]), [])
            self.assertIs(type(rebuilt.evolve(schema={'$schema': 'http://json-schema.org/draft-07/schema#'})),
                          original._original_validator(jsonschema.Draft7Validator))

    def test_scoped_resolver_preserves_location_route(self):
        uri, target = 'https://example.test/scoped', 'https://example.test/retained'
        doc = {'$id': uri, 'type': 'object', 'properties': {
            'r': {'$ref': target}, 'plain': {'$ref': target}}}
        b = bank(ScopedBankV2, {uri: doc, target: {'$id': target, 'type': 'string'}})
        b.retained = bank(original.OriginalBank, {target: {'$id': target, 'type': 'integer'}})
        origin = b.node_origins[id(doc['properties']['r'])]
        b.imports = {(*origin, target): {'literal_ref': target, 'target_ref': target}}
        v = Validator({'$ref': uri}, registry=b.registry, format_checker=FORMAT,
                      _resolver=ScopedResolverV2(b.registry.resolver(), b))
        values = [{'r': 7, 'plain': 'x'}, {'r': 'x', 'plain': 7}, {'r': 7, 'plain': 7}]
        self.assertFalse(list(v.iter_errors(values[0])))
        entry = c._dump_entry(slot(b, v, values), 'selftest-scoped')
        self.assertEqual(entry['rebuild'], 'recipe', entry)
        rebuilt = c._rebuild_plain(pickle.loads(pickle.dumps(entry)))
        self.assertEqual(c.agree(v, rebuilt, [record(v, x) for x in values]), [])
        self.assertEqual(c.agree(v, c.closure_validator(rebuilt, 'selftest-scoped2'),
                                 [record(v, x) for x in values]), [])

    def test_dump_checks_original_recorded_result(self):
        v = jsonschema.Draft202012Validator({'type': 'integer'})
        s = slot(object(), v, [7])
        # A rebuild that disagrees with the captured owner result must be refused.
        s['records'][0] = (*s['records'][0][:2], [('wrong', 'type', 'wrong')])
        entry = c._dump_entry(s, 'selftest-bad-record')
        self.assertEqual(entry['rebuild'], 'recollect')


    def test_capture_factory_root_ids_equal_inventory(self):
        import json
        import pm_goal_dg5_boundaries as bridge
        class CallTimeBank(original.OriginalBank):
            pass
        uri = 'https://example.test/captured'
        b = bank(CallTimeBank, {uri: {'$id': uri, 'type': 'integer'}})
        expected_v = b.validator(uri)
        key = (type(expected_v).__module__ + '.' + type(expected_v).__qualname__,
               json.dumps(expected_v.schema, sort_keys=True), c._registry_digest(expected_v),
               type(b).__qualname__)
        expected_id = c.root_id(key)
        saved_slots, saved_parent, saved_active = dict(c.SLOTS), bridge.PARENT_CALL[0], bridge.ACTIVE[0]
        c.SLOTS.clear()
        bridge.PARENT_CALL[0], bridge.ACTIVE[0] = True, False
        try:
            c.hook_bank(CallTimeBank, family='selftest')
            self.assertEqual(b.errors(uri, 7), [])
            self.assertTrue(b.errors(uri, True))
            self.assertEqual({c.root_id(k) for k in c.SLOTS}, {expected_id})
            captured = next(iter(c.SLOTS.values()))
            self.assertEqual(captured['calls'], 2)
            self.assertEqual(c._dump_entry(captured, expected_id)['rebuild'], 'recipe')
        finally:
            c.SLOTS.clear()
            c.SLOTS.update(saved_slots)
            bridge.PARENT_CALL[0], bridge.ACTIVE[0] = saved_parent, saved_active


class Witnesses(unittest.TestCase):
    def test_nested_witness_and_missing_evidence_are_checked(self):
        schema = {'type': 'object', 'properties': {'n': {'anyOf': [{'type': 'integer'}, {'type': 'string'}]}}}
        v = c.closure_validator(jsonschema.Draft202012Validator(schema), 'selftest-nested')
        value = {'n': None}
        clause = next(x for x in c.go.locations(c.go.errors_of(v, value)) if x.endswith('/anyOf/0/type'))
        entry = dict(cls='KILLED', input_sha256=hashlib.sha256(pickle.dumps(value, protocol=5)).hexdigest())
        self.assertIn(clause, c.go.locations(c.go.errors_of(v, value)))
        result = c.verify_witnesses(v, {clause: entry}, {clause: pickle.dumps(value, protocol=5)})
        self.assertEqual((result['passed'], result['failed'], result['unverifiable']), (1, 0, 0))
        missing = c.verify_witnesses(v, {clause: entry}, {})
        self.assertEqual((missing['passed'], missing['failed'], missing['unverifiable']), (0, 1, 0))

    def test_selected_pair_not_first_confirmed_pair(self):
        from unittest.mock import patch
        target = 'dg5-root:pair/type'
        ident = c.common.guard_for_location(target)
        class Err:
            oracle_guard, context = ident, ()
        chosen = {'x': 3}
        raw = pickle.dumps(chosen, protocol=5)
        def errors(v, value, cut=frozenset()):
            return [] if cut else [Err()]
        def search(*args, **kwargs):
            for value, cut in (({'x': 1}, frozenset()), ({'x': 1}, frozenset({ident})),
                               (chosen, frozenset()), (chosen, frozenset({'another-cut'})),
                               (chosen, frozenset({ident}))):
                c.go.errors_of(None, value, cut)
            return dict(cls='KILLED', input_sha256=hashlib.sha256(raw).hexdigest())
        with patch.object(c.go, 'search_clause', search), patch.object(c.go, 'errors_of', errors):
            saved = c._install_search_wrappers(None, None, 0)
            try:
                c.go.search_clause(target, 'type', 'dg5-root:pair', {}, {}, ident)
            finally:
                c._restore_search_wrappers(saved)
        self.assertEqual(c._WIT['store'][target], raw)

    def test_carry_loads_and_rechecks_raw_store(self):
        import gzip
        import json
        import tempfile
        from pathlib import Path
        with tempfile.TemporaryDirectory() as temp:
            path = Path(temp) / 'prior.json'
            raw = pickle.dumps({'n': None}, protocol=5)
            blob = gzip.compress(pickle.dumps({'clause': raw}, protocol=5))
            (Path(temp) / 'witness.gz').write_bytes(blob)
            path.write_text(json.dumps({'roots': {'root': {'clauses': {'clause': {'cls': 'KILLED'}},
                'witness_store': {'path': 'witness.gz', 'sha256': hashlib.sha256(blob).hexdigest()}}}}))
            self.assertEqual(c._carried_from([path])['root']['clause']['cls'], 'KILLED')
            self.assertEqual(c._CARRIED_EVIDENCE['root']['raw']['clause'], raw)
            # Integrity errors cannot silently remove carry evidence.
            (Path(temp) / 'witness.gz').write_bytes(blob + b'bad')
            with self.assertRaisesRegex(ValueError, 'hash mismatch'):
                c._carried_from([path])
        c._CARRIED_EVIDENCE.clear()

    def test_distinct_member_closure_keywords_and_cuts(self):
        schema = {'properties': {'n': {}}, 'additionalProperties': False, 'unevaluatedProperties': False}
        bad = {'extra': 1}
        for kind in (jsonschema.Draft202012Validator, c.common.StrictValidator):
            v = c.closure_validator(kind(schema), 'two-keywords')
            _, ids = c._clause_inventory(v)
            by_name = {clause.rsplit('/', 1)[1]: clause for clause in ids}
            self.assertEqual(set(by_name), {'additionalProperties', 'unevaluatedProperties'})
            self.assertEqual(c.go.locations(c.go.errors_of(v, bad)), set(ids))
            for cause, other in (('additionalProperties', 'unevaluatedProperties'),
                                 ('unevaluatedProperties', 'additionalProperties')):
                cut = {c._guard_for_location(by_name[cause])}
                self.assertEqual(c.go.locations(c.go.errors_of(v, bad, cut)), {by_name[other]})
            self.assertEqual(c.go.locations(c.go.errors_of(v, bad)), set(ids))
        singleton = c.closure_validator(jsonschema.Draft202012Validator({'additionalProperties': False}),
                                        'one-keyword')
        _, ids = c._clause_inventory(singleton)
        self.assertEqual([clause.rsplit('/', 1)[1] for clause in ids], ['closed_members'])

    def test_legacy_reconstruction_keeps_verdict_and_records_provenance(self):
        import pm_goal_dg5_reverify as replay
        v = c.closure_validator(jsonschema.Draft202012Validator({'type': 'object',
                               'properties': {'n': {'type': 'integer'}}}), 'selftest-legacy')
        c.go.CURRENT[0] = v
        nodes = c.go.walk(v)
        clause = next(x for x in c.go.locations(c.go.errors_of(v, {'n': True})) if x.endswith('/n/type'))
        entry = dict(cls='KILLED', path=['n'], edit='True', input_sha256='old-missing-witness')
        control = {'n': 7}
        rebuilt, problem = replay.reconstruct(v, nodes, clause, entry,
                                               {replay.digest(control): control}, {})
        self.assertIsNone(problem)
        self.assertEqual(rebuilt['cls'], entry['cls'])
        self.assertEqual(rebuilt['reference_reconstruction']['original_input_sha256'], entry['input_sha256'])
        checked = c.verify_witnesses(v, {clause: rebuilt}, {}, {replay.digest(control): control})
        self.assertEqual((checked['passed'], checked['failed']), (1, 0))
        refused, problem = replay.reconstruct(v, nodes, clause, entry, {}, {})
        self.assertIsNone(refused)
        self.assertIsNotNone(problem)

    def test_truncated_edit_reconstructed_without_eval(self):
        import pm_goal_dg5_reverify as replay
        edit = {'long': 'x' * 200}
        entry = {'edit': repr(edit)[:80]}
        self.assertEqual(replay.edits_for(entry, 'type', {'type': 'string'}, 'x', [edit]), [edit])
        self.assertEqual(replay.typed_path({'x': [7]}, ['x', '0']), ('x', 0))

    def test_reverify_output_keeps_matrix_bindings(self):
        import json
        import tempfile
        from pathlib import Path
        import pm_goal_dg5_reverify as replay
        plain = jsonschema.Draft202012Validator({'type': 'object', 'properties': {'n': {'type': 'integer'}}})
        control = {'n': 7}
        item = slot(object(), plain, [control])
        item.update(rows={'schema-row'}, families={'goal.updated'}, seeds={replay.digest(control): control})
        dumped = c._dump_entry(item, 'selftest-output')
        v = c.closure_validator(plain, 'selftest-output')
        clause = next(x for x in c.go.locations(c.go.errors_of(v, {'n': True})) if x.endswith('/n/type'))
        with tempfile.TemporaryDirectory() as temp:
            dump, prior, out = [Path(temp) / x for x in ('dump.pkl', 'prior.json', 'out.json')]
            dump.write_bytes(pickle.dumps({'meta': {}, 'roots': {'selftest-output': dumped}}))
            _, ids = c._clause_inventory(v)
            clauses = {key: {'cls': 'UNCOVERED'} for key in ids}
            clauses[clause] = {'cls': 'KILLED', 'path': ['n'], 'edit': 'True', 'input_sha256': 'missing'}
            prior.write_text(json.dumps({'roots': {'selftest-output': {'clauses': clauses}}}))
            self.assertEqual(replay.reverify(dump, [prior], out), 0)
            result = json.loads(out.read_text())
            root = result['roots']['selftest-output']
            self.assertEqual(root['rows'], ['schema-row'])
            self.assertEqual(root['families'], ['goal.updated'])
            self.assertEqual(root['verify']['passed'], 1)
            self.assertEqual(result['from_dump_sha256'], hashlib.sha256(dump.read_bytes()).hexdigest())
            # Changing the value hash must fail even if another value has the same verdict.
            evidence = replay.load_store(out, root['control_store'])
            root['clauses'][clause]['input_value_sha256'] = 'wrong'
            self.assertEqual(c.verify_witnesses(v, root['clauses'], {}, evidence)['failed'], 1)

    def test_annotation_memo_retains_source_identity(self):
        memo = c.AnnotationMemo()
        node = {'type': 'integer'}
        c.annotate(node, 'selftest-retained', memo)
        self.assertIs(memo.sources[id(node)], node)


if __name__ == '__main__':
    unittest.main()
