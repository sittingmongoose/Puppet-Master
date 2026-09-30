import json
from pathlib import Path
import tempfile
import unittest
import mechanics as m


class Mechanics(unittest.TestCase):
    def test_version_lineage_mutation_and_exact_render(self):
        with tempfile.TemporaryDirectory() as t:
            p = Path(t)
            source, retained = p / 'source', p / 'retained'
            source.mkdir()
            first = {'id': 'F1', 'version': 1, 'state': 'current', 'previous_sha256': None,
                     'body': 'Scoped assertion. UNEXECUTED probe; uncertain if input absent.'}
            m.write(source / 'F1.0001.json', first)
            pin = m.digest((source / 'F1.0001.json').read_bytes())
            second = {**first, 'version': 2, 'previous_sha256': pin, 'body': 'Whole revised body; only version X.'}
            m.write(source / 'F1.0002.json', second)
            self.assertEqual(m.retain_versions(source, retained), 2)
            m.render_versions(retained, p / 'report', p / 'history')
            self.assertIn(second['body'], (p / 'report').read_text())
            self.assertNotIn(first['body'], (p / 'report').read_text())
            self.assertIn(first['body'], (p / 'history').read_text())
            m.write(source / 'F1.0001.json', {**first, 'body': 'mutated'})
            with self.assertRaisesRegex(ValueError, 'mutation'):
                m.retain_versions(source, retained)

    def test_amendment_omission_is_unresolved_and_qualifier_exact(self):
        with tempfile.TemporaryDirectory() as t:
            p = Path(t)
            seed = {'findings': [{'id': 'A', 'body': 'Original condition'}, {'id': 'B', 'body': 'Unreviewed'}]}
            m.write(p / 'seed', seed)
            d = {'decisions': [{'id': 'A', 'input_sha256': m.digest(m.encoded(seed['findings'][0])),
                 'decision': 'qualified', 'reason': 'version limit', 'replacement_body': 'Only version2. UNEXECUTED probe.'}]}
            m.write(p / 'decisions', d)
            result = m.render_amendments(p / 'seed', p / 'decisions', p / 'report', p / 'history')
            self.assertEqual(result['current'], 1)
            self.assertEqual(result['unresolved'], 1)
            self.assertIn('Only version2. UNEXECUTED probe.', (p / 'report').read_text())
            self.assertIn('No verifier decision; unconfirmed.', (p / 'report').read_text())
            d['decisions'][0]['input_sha256'] = 'bad'
            m.write(p / 'decisions', d)
            with self.assertRaises(ValueError):
                m.render_amendments(p / 'seed', p / 'decisions', p / 'report', p / 'history')

    def test_cache_cold_warm_and_negative_membership_invalidation(self):
        with tempfile.TemporaryDirectory() as t:
            p = Path(t)
            raw = b'# Source\nParagraph\n'
            (p / 'source').write_bytes(raw)
            dep = {'source_sha256': m.digest(raw), 'source_version': 'v1', 'permissions': 'public',
                   'parser': 'mechanics.parse_source-v1', 'settings': {'encoding': 'utf-8'},
                   'applicability': 'question family', 'corpus_membership_sha256': 'c1', 'negative_scope_sha256': 'n1'}
            m.write(p / 'dep', dep)
            a = m.acquire_source(p / 'source', p / 'dep', p / 'cache', p / 'count', True)
            b = m.acquire_source(p / 'source', p / 'dep', p / 'cache', p / 'count', True)
            self.assertEqual(a, b)
            c = json.loads((p / 'count').read_text())
            self.assertEqual((c['local_acquisitions'], c['parses'], c['hits'], c['network_fetches']), (1, 1, 1, 0))
            dep['negative_scope_sha256'] = 'n2'
            m.write(p / 'dep', dep)
            m.acquire_source(p / 'source', p / 'dep', p / 'cache', p / 'count', True)
            dep['corpus_membership_sha256'] = 'c2'
            m.write(p / 'dep', dep)
            m.acquire_source(p / 'source', p / 'dep', p / 'cache', p / 'count', True)
            c = json.loads((p / 'count').read_text())
            self.assertEqual((c['local_acquisitions'], c['parses'], c['hits']), (3, 3, 1))

    def test_reuse_rejects_missing_or_changed_neighbor_and_ambiguity(self):
        dep = {k: k for k in ['finding_sha256', 'source_versions', 'permissions', 'plan_owner_hashes',
               'affected_neighbor_hashes', 'corpus_membership_sha256', 'negative_scope_sha256',
               'applicability', 'comparison_policy', 'instance_binding']}
        witness = {'dependencies': dep, 'status': 'verified', 'semantic_ambiguity': False, 'result': 'candidate result'}
        self.assertTrue(m.reusable(witness, dep)['reuse'])
        self.assertFalse(m.reusable(witness, {**dep, 'affected_neighbor_hashes': 'changed'})['reuse'])
        self.assertFalse(m.reusable({**witness, 'semantic_ambiguity': True}, dep)['reuse'])
        with self.assertRaises(ValueError):
            m.reusable(witness, {})


if __name__ == '__main__':
    unittest.main()
