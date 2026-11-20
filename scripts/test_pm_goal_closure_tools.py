import unittest
from pathlib import Path
from runpy import run_path

from referencing import Registry
from referencing.jsonschema import DRAFT202012


gc = run_path(str(Path(__file__).resolve().parents[1] / 'scripts/pm-goal-gc-schema-closure.py'))
common = gc['common']


def validator(second_type):
    def container(uri, value_type):
        return common.runtime_schema({
            '$id': uri,
            '$defs': {'embedded': {
                '$id': 'urn:gc:shared',
                '$defs': {'value': {'type': value_type}},
            }},
        })

    registry = Registry().with_resources(
        (schema['$id'], DRAFT202012.create_resource(schema))
        for schema in (container('urn:gc:a', 'string'), container('urn:gc:z', second_type))
    )
    return common.validator({'$id': 'urn:gc:root', '$ref': 'urn:gc:shared#/$defs/value'}, registry)


class DuplicateResourcesTest(unittest.TestCase):
    def test_conflicting_duplicate_resource_is_rejected(self):
        with self.assertRaisesRegex(ValueError, 'urn:gc:shared'):
            gc['walk'](validator('integer'))

    def test_equal_duplicate_resource_keeps_canonical_witness(self):
        root = validator('string')
        entries, _, _ = gc['close_root']('urn:gc:root', root, ['abc'], 100)
        self.assertEqual(list(entries), ['urn:gc:a/$defs/embedded/$defs/value/type'])
        self.assertEqual(next(iter(entries.values()))['cls'], 'KILLED')


if __name__ == '__main__':
    unittest.main()
