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


if __name__ == '__main__':
    unittest.main()
