import copy
import json
from pathlib import Path
import tempfile
import unittest
from workspaces import catalog, freeze, prepare, verify, sha
from run_attempt import command
from source_index import build


class Boundaries(unittest.TestCase):
    def setUp(self):
        self.temp = tempfile.TemporaryDirectory()
        self.root = Path(self.temp.name)
        source = self.root / 'public.md'
        source.write_text('# Generic fixture\n\nCondition must remain scoped.\n')
        self.spec = {'job_id': 'fixture', 'method': 'T06', 'arm': 'treatment', 'family': 'Z',
                     'case_id': 'offline-fixture', 'scope': 'Inspect the complete generic fixture.',
                     'inputs': [{'source': str(source), 'target': 'public.md'}],
                     'admitted_inputs': [{'source': str(source), 'sha256': sha(source)}],
                     'caps': {'seconds': 60, 'responses': 8}, 'output_files': ['report.md'],
                     'source_access': 'fixed admitted local corpus only', 'plan_visibility': 'none',
                     'evaluation_obligations': 'Check every emitted assertion; no semantic key supplied.',
                     'zcode_tools': ['Read', 'Write', 'Edit', 'Grep', 'Glob']}

    def tearDown(self):
        # Frozen input directories need permission restoration for ordinary cleanup.
        for p in self.root.rglob('*'):
            if p.is_dir():
                p.chmod(0o700)
        self.temp.cleanup()

    def make(self):
        attempt = self.root / 'attempt'
        prepare(self.spec, attempt)
        (attempt / 'native').mkdir()
        (attempt / 'native/receipt.json').write_text(json.dumps({'native_quiescent': True, 'own_process_group_absent': True}))
        return attempt

    def test_all_methods_and_real_arm_contracts(self):
        methods = catalog()
        self.assertEqual(set(methods), {f'T{i:02d}' for i in range(1, 17)})
        self.assertTrue(all(m['control'] != m['treatment'] for m in methods.values()))

    def test_no_hardlink_and_launch_mutation_detection(self):
        attempt = self.make()
        copied = attempt / 'workspace/inputs/public.md'
        original = Path(self.spec['inputs'][0]['source'])
        self.assertNotEqual(original.stat().st_ino, copied.stat().st_ino)
        verify(attempt)
        copied.chmod(0o600)
        copied.write_text('mutated')
        with self.assertRaisesRegex(ValueError, 'dependency changed'):
            verify(attempt)

    def test_private_tree_and_symlinks_rejected(self):
        private = self.root / 'private'
        (private / '.git').mkdir(parents=True)
        (private / '.git/config').write_text('never admit')
        self.spec['inputs'] = [{'source': str(private), 'target': 'tree'}]
        with self.assertRaisesRegex(ValueError, 'private input'):
            self.make()

    def test_parent_symlink_and_unlisted_source_rejected(self):
        link = self.root / 'link'
        link.symlink_to(self.root, target_is_directory=True)
        self.spec['inputs'][0]['source'] = str(link / 'public.md')
        with self.assertRaisesRegex(ValueError, 'symlink'):
            self.make()
        self.spec['inputs'][0]['source'] = str(self.root / 'public.md')
        self.spec['admitted_inputs'] = []
        with self.assertRaisesRegex(ValueError, 'whitelist'):
            prepare(self.spec, self.root / 'attempt2')

    def test_no_freeze_before_quiescence(self):
        attempt = self.make()
        (attempt / 'native/receipt.json').write_text('{}')
        with self.assertRaisesRegex(ValueError, 'quiescence'):
            freeze(attempt)

    def test_numbered_headings(self):
        (self.root / 'numbered.txt').write_text('2. Scope\n2.1. Conditions\nConditions apply.\n')
        rows = build(self.root)['files']
        row = next(r for r in rows if r['path'] == 'numbered.txt')
        self.assertEqual([x['section'] for x in row['locators']], ['2', '2.1'])

    def test_cap_and_protocol_contracts(self):
        self.spec['caps']['seconds'] = 1801
        with self.assertRaisesRegex(ValueError, 'ceilings'):
            self.make()
        self.spec['caps']['seconds'] = 60
        self.spec['method'] = 'T04'
        with self.assertRaisesRegex(ValueError, 'versioned'):
            self.make()

    def test_outputs_freeze_and_no_semantic_grade(self):
        attempt = self.make()
        (attempt / 'workspace/out/report.md').write_text('generic candidate assertion')
        result = freeze(attempt)
        self.assertTrue(result['structural_complete'])
        self.assertEqual(result['semantic_quality'], 'not evaluated')
        self.assertEqual((attempt / 'frozen-output/out/report.md').read_text(), 'generic candidate assertion')
        with self.assertRaises(FileExistsError):
            freeze(attempt)

    def test_missing_required_artifact_is_failure(self):
        result = freeze(self.make())
        self.assertFalse(result['structural_complete'])
        self.assertEqual(result['missing_required_outputs'], ['report.md'])

    def test_goal_short_and_no_dispatch(self):
        attempt = self.make()
        self.assertLess(len((attempt / 'goal.txt').read_text()), 4000)
        _, cmd = command(attempt)
        self.assertIn('--max-seconds', cmd)
        self.assertFalse((attempt / 'dispatch.json').exists())
        self.assertIn('Read', cmd)

    def test_index_is_locator_only(self):
        index = build(self.root)
        self.assertEqual(index['files'][0]['locators'][0]['label'], 'Generic fixture')
        self.assertNotIn('Condition must remain scoped', json.dumps(index))


if __name__ == '__main__':
    unittest.main()
