import io
import json
import unittest
from contextlib import redirect_stderr, redirect_stdout
from pathlib import Path
from runpy import run_path
from unittest.mock import patch

from referencing import Registry
from referencing.jsonschema import DRAFT202012

import pm_goal_go_schema_closure as go


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


class DuplicateRootMergeTest(unittest.TestCase):
    def merge(self, second_clause='location/type', second_replay='edit-token'):
        def report(clause, replay):
            entry = dict(families=['goal.created'], counts={'KILLED': 1}, seed_sha256=['seed'],
                         clauses={clause: dict(cls='KILLED', control_sha256='control', replay=replay)})
            return json.dumps(dict(roots={'root-a': entry}, all_roots={'root-a': ['goal.created']},
                                   shard='0/1', closure_tool_sha256='tool'))

        inputs = {Path('first.json'): report('location/type', 'edit-token'),
                  Path('second.json'): report(second_clause, second_replay)}
        stderr = io.StringIO()
        with (patch.object(Path, 'read_text', autospec=True, side_effect=inputs.__getitem__),
              patch.object(Path, 'write_text') as save, redirect_stdout(io.StringIO()), redirect_stderr(stderr)):
            code = go.merge(list(inputs), Path('merged.json'))
        return code, save, stderr.getvalue()

    def test_duplicate_root_different_inventory_is_rejected(self):
        code, save, stderr = self.merge(second_clause='other/type')
        self.assertEqual(code, 1)
        self.assertIn('root-a', stderr)
        save.assert_not_called()

    def test_duplicate_root_different_replay_is_rejected(self):
        code, save, stderr = self.merge(second_replay='different-token')
        self.assertEqual(code, 1)
        self.assertIn('root-a', stderr)
        save.assert_not_called()

    def test_identical_duplicate_root_merges(self):
        code, save, _ = self.merge()
        self.assertEqual(code, 0)
        roots = json.loads(save.call_args.args[0])['roots']
        self.assertEqual(list(roots), ['root-a'])
        self.assertEqual(list(roots['root-a']['clauses']), ['location/type'])


if __name__ == '__main__':
    unittest.main()
