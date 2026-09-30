import hashlib
import json
from pathlib import Path
import tempfile
import unittest
import cards
import dependency_tool as dt
import repo_map_tool as rm
import seed_report


class Methods(unittest.TestCase):
    def test_repo_map_is_pinned_navigation_not_semantic(self):
        with tempfile.TemporaryDirectory() as t:
            p = Path(t)
            tree = p / 'tree'
            tree.mkdir()
            (tree / 'module.py').write_text('def parse():\n    pass\n')
            cards.write(p / 'pin', {'repository_url': 'https://example.org/repository', 'commit': 'a' * 40,
                                    'files': {'module.py': cards.sha(tree / 'module.py')}})
            rm.build(tree, p / 'pin', p / 'map')
            result = json.loads((p / 'map').read_text())
            self.assertEqual(result['files'][0]['symbols'], [{'name': 'parse', 'line': 1}])
            (tree / 'module.py').write_text('changed')
            with self.assertRaisesRegex(ValueError, 'changed'):
                rm.build(tree, p / 'pin', p / 'map')

    def test_dependency_negative_scope_and_neighbor_invalidate(self):
        with tempfile.TemporaryDirectory() as t:
            p = Path(t)
            (p / 'plan').write_text('# Scope\nA\n## Neighbor\nB\n')
            sections = dt.section_hashes(p / 'plan')
            cards.write(p / 'catalog', {'sources': [{'handle': 'SRC', 'sha256': 'sourcehash'}]})
            seed = {'findings': [{'id': 'A', 'body': 'A candidate whole block'}]}
            cards.write(p / 'seed', seed)
            dep = {'finding_sha256': hashlib.sha256(json.dumps(seed['findings'][0], sort_keys=True, separators=(',', ':')).encode()).hexdigest(),
                   'source_versions': {'SRC': 'sourcehash'}, 'permissions': 'public',
                   'plan_owner_hashes': {next(iter(sections)): next(iter(sections.values()))},
                   'affected_neighbor_hashes': dict(list(sections.items())[1:]),
                   'corpus_membership_sha256': cards.sha(p / 'catalog'),
                   'negative_scope_sha256': cards.sha(p / 'plan'), 'applicability': 'same',
                   'comparison_policy': 'same', 'instance_binding': 'A'}
            cards.write(p / 'witness', {'witnesses': [{'id': 'A', 'status': 'verified', 'semantic_ambiguity': False,
              'result': 'Complete candidate result', 'verification_evidence': 'Source actuallocator',
              'negative_search': True, 'dependencies': dep}]})
            self.assertEqual(dt.select(p / 'witness', p / 'plan', p / 'catalog', p / 'seed', p / 'out')['reused'], 1)
            (p / 'plan').write_text('# Scope\nA\n## Neighbor\nChanged\n')
            self.assertEqual(dt.select(p / 'witness', p / 'plan', p / 'catalog', p / 'seed', p / 'out')['reused'], 0)
            result = json.loads((p / 'out').read_text())['results'][0]
            self.assertIn('affected_neighbor_hashes', result['changed_dependencies'])
            self.assertIn('negative_scope_sha256', result['changed_dependencies'])

    def test_seed_conversion_keeps_every_candidate_byte(self):
        with tempfile.TemporaryDirectory() as t:
            p = Path(t)
            (p / 'frozen-output/out').mkdir(parents=True)
            raw = b'# Current\n\nPreface.\n\n## Authored1\nBody\n\n## Authored2\nEnding\n'
            report = p / 'frozen-output/out/report.md'
            report.write_bytes(raw)
            cards.write(p / 'attempt.json', {'spec': {'job_id': 'fixed-first', 'case_id': 'case'}})
            cards.write(p / 'output-integrity.json', {'structural_complete': True,
                  'files': [{'target': 'out/report.md', 'sha256': cards.sha(report)}]})
            seed_report.convert(p, 'fixed-first', p / 'seed')
            seed = json.loads((p / 'seed').read_text())
            self.assertEqual(''.join(x['body'] for x in seed['findings']).encode(), raw)
            with self.assertRaisesRegex(ValueError, 'identity'):
                seed_report.convert(p, 'different-best', p / 'seed')


if __name__ == '__main__':
    unittest.main()
