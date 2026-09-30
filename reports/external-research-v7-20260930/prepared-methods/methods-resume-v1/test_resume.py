import hashlib
import json
from pathlib import Path
import tempfile
import unittest

import dependency_selector as ds
import prepare_resume as pr
import budget_guard


class ResumeChecks(unittest.TestCase):
    def test_whole_case_guard_keeps_active_allowance_and_clock(self):
        with tempfile.TemporaryDirectory() as tmp:
            p = Path(tmp)
            pr.write(p / 'contract', {'pair_id': 'test-case', 'family': 'M',
                      'whole_case_caps': {'seconds': 100, 'aggregate_slot_seconds': 100}})
            pr.write(p / 'registry', {'jobs': {'test-case-first': {'admitted_epoch': 1000,
                      'released_epoch': None, 'cap_seconds': 70}}})
            (p / 'next').mkdir()
            pr.write(p / 'next/attempt.json', {'spec': {'job_id': 'test-case-next', 'family': 'M',
                      'caps': {'seconds': 40}}})
            result = budget_guard.check(p / 'contract', p / 'registry', p / 'next', now=1020)
            self.assertEqual(result['occupied_slot_seconds'], 20)
            self.assertEqual(result['active_reserved_seconds'], 50)
            self.assertFalse(result['admit'])
            pr.write(p / 'registry', {'jobs': {'test-case-first': {'admitted_epoch': 1000,
                      'released_epoch': 1010, 'cap_seconds': 70}}})
            self.assertTrue(budget_guard.check(p / 'contract', p / 'registry', p / 'next', now=1020)['admit'])
            self.assertFalse(budget_guard.check(p / 'contract', p / 'registry', p / 'next', now=1070)['admit'])

    def test_initial_bindings_are_exact_and_not_started(self):
        attempts = list((pr.HERE / 'pairs').glob('*/**/attempt.json'))
        self.assertEqual(len(attempts), 9)
        for path in attempts:
            meta = pr.workspaces.verify(path.parent)
            self.assertIn(meta['spec']['family'], ['M', 'Z'])
            self.assertFalse((path.parent / 'dispatch.json').exists())
            if meta['spec']['method'] in ('T08', 'T10'):
                self.assertEqual([x['target'] for x in meta['input_manifest']], ['brief.md'])
                self.assertIn('WebSearch', meta['spec']['zcode_tools'])
                self.assertIn('Plan-blind', meta['spec']['plan_visibility'])

    def test_controlled_plan_has_exact_changed_and_unchanged_slices(self):
        case = pr.HERE / 'bindings/t15-controlled-ome-v1'
        before, after = ds.sections(case / 'plan/Viewer.md'), ds.sections(case / 'after-plan.md')
        self.assertEqual(set(before), set(after))
        self.assertEqual(sum(before[k]['sha256'] != after[k]['sha256'] for k in before), 1)
        self.assertGreater(sum(before[k]['sha256'] == after[k]['sha256'] for k in before), 1)
        for paragraph in (pr.OME / 'plan/Viewer.md').read_text().strip().split('\n\n'):
            self.assertIn(paragraph, (case / 'plan/Viewer.md').read_text())

    def test_topology_equal_aggregate_and_independent_flash(self):
        c = json.loads((pr.HERE / 'pairs/t16-m-azure-topology-resume-v1/topology.json').read_text())
        self.assertEqual(c['whole_case_caps'], {'seconds': 3600, 'aggregate_slot_seconds': 5400})
        for arm in ['control', 'treatment']:
            layout = c['layout'][arm]
            self.assertEqual(sum(x[1] for x in layout), 2700)
            self.assertEqual(sum(x[2] for x in layout), 192)
            self.assertEqual(layout[-1][0], 'review')
            self.assertFalse(layout[0][3])
        self.assertEqual(len(c['layout']['control']), 5)
        self.assertEqual(len(c['layout']['treatment']), 3)

    def test_cache_actual_cold_and_warm_paths(self):
        with tempfile.TemporaryDirectory() as tmp:
            path = Path(tmp)
            import mechanics
            spec = json.loads((pr.HERE / 'pairs/t07-z-ome-cache-resume-v1/treatment.spec.json').read_text())
            source = next(Path(x['source']) for x in spec['inputs'] if x['target'] == 'sources/S003.txt')
            dep = next(Path(x['source']) for x in spec['inputs'] if x['target'] == 'source_dependency.json')
            first = mechanics.acquire_source(source, dep, path / 'cache', path / 'counts', True)
            second = mechanics.acquire_source(source, dep, path / 'cache', path / 'counts', True)
            self.assertEqual(first, second)
            counts = json.loads((path / 'counts').read_text())
            self.assertEqual([counts[k] for k in ('local_acquisitions', 'parses', 'hits', 'network_fetches')], [1, 1, 1, 0])

    def test_selector_invalidates_neighbor_negative_and_context(self):
        with tempfile.TemporaryDirectory() as tmp:
            p = Path(tmp)
            (p / 'plan').write_text('# First\nA\n## Neighbor\nB\n')
            indexed = ds.sections(p / 'plan')
            pr.write(p / 'catalog', {'sources': [{'handle': 'SRC', 'view_sha256': 'a' * 64}]})
            finding = {'id': 'F', 'body': 'Synthetic test only'}
            pr.write(p / 'seed', {'findings': [finding]})
            ctx = {'permissions': 'public', 'applicability': 'scope', 'comparison_policy': 'policy', 'instance_binding_prefix': 'fixture'}
            pr.write(p / 'context', ctx)
            dependency = {'finding_sha256': hashlib.sha256(json.dumps(finding, sort_keys=True, separators=(',', ':')).encode()).hexdigest(),
                'source_versions': {'SRC': 'a' * 64}, 'plan_owner_hashes': {list(indexed)[0]: indexed[list(indexed)[0]]['sha256']},
                'affected_neighbor_hashes': {list(indexed)[1]: indexed[list(indexed)[1]]['sha256']},
                'corpus_membership_sha256': ds.sha(p / 'catalog'), 'negative_scope_sha256': ds.sha(p / 'plan'),
                'instance_binding': 'fixture:F', **{k: ctx[k] for k in ('permissions', 'applicability', 'comparison_policy')}}
            pr.write(p / 'witness', {'witnesses': [{'id': 'F', 'dependencies': dependency, 'result': 'Synthetic whole result',
                'verification_evidence': 'Synthetic fixture locator', 'negative_search': True, 'status': 'verified', 'semantic_ambiguity': False}]})
            def select():
                return ds.select(p / 'witness', p / 'plan', p / 'catalog', p / 'seed', p / 'context', p / 'out')['results'][0]
            self.assertTrue(select()['reuse'])
            (p / 'plan').write_text('# First\nA\n## Neighbor\nChanged\n')
            result = select()
            self.assertFalse(result['reuse'])
            self.assertIn('affected_neighbor_hashes', result['changed_dependencies'])
            self.assertIn('negative_scope_sha256', result['changed_dependencies'])
            ctx['permissions'] = 'changed'
            pr.write(p / 'context', ctx)
            self.assertIn('permissions', select()['changed_dependencies'])


if __name__ == '__main__':
    unittest.main()
