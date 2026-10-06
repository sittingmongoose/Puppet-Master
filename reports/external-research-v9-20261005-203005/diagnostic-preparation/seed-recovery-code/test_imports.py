"""Actual-byte provenance and topology regressions; no semantic body reading."""
import copy
import json
import unittest
import bind_imported_v4 as b


class Imports(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        cls.outbox = json.loads((b.ROOT / 'BASE_IMPORT_OUTBOX.json').read_text())
        cls.bases = {d: b.old.checked_json(x) for d, x in cls.outbox['bases'].items()}
        cls.dags = json.loads((b.ROOT / 'CORRECTED_DAG_OUTBOX.json').read_text())
        cls.initial = json.loads((b.ROOT / 'INITIAL_REGISTRATION_OUTBOX.json').read_text())

    def test_actual_four_role_bases_are_losslessly_valid(self):
        for base in self.bases.values():
            b.verify(base)
            self.assertEqual(set(base['candidate_files']), {'proposal', *b.CATALOGS})
            self.assertFalse(base['base_5file_job_success_claimed'])
            self.assertEqual(base['fixture_suitability']['status'], 'UNASSESSED')

    def test_sol_origin_rejected(self):
        base = copy.deepcopy(self.bases['A']); base['origin_freezes'][0]['actual_family'] = 'Sol'
        with self.assertRaisesRegex(ValueError, 'affordable-candidate'): b.verify(base)

    def test_declared_identity_matches_actual_receipt(self):
        base = copy.deepcopy(self.bases['A']); base['origin_freezes'][0]['actual_model'] = 'invented'
        with self.assertRaisesRegex(ValueError, 'observed identity'): b.verify(base)

    def test_proposal_cannot_impersonate_absent_roles(self):
        for role in ('dependencies', 'critique', 'revision', 'enrichment'):
            base = copy.deepcopy(self.bases['A']); base['candidate_files'][role] = copy.deepcopy(base['candidate_files']['proposal'])
            with self.assertRaisesRegex(ValueError, 'cannot be aliased'): b.verify(base)

    def test_unknown_answer_role_rejected(self):
        base = copy.deepcopy(self.bases['A']); base['candidate_files']['evaluator_answer'] = base['candidate_files']['proposal']
        with self.assertRaisesRegex(ValueError, 'answer payload'): b.verify(base)

    def test_wrong_capture_origin_rejected(self):
        base = copy.deepcopy(self.bases['A']); base['public_source_files'][0]['origin_job_id'] = 'another-goal'
        with self.assertRaisesRegex(ValueError, 'actual origin Goal'): b.verify(base)

    def test_capture_sha_and_url_tampering_rejected(self):
        base = copy.deepcopy(self.bases['A']); base['public_source_files'][0]['sha256'] = '0' * 64
        with self.assertRaisesRegex(ValueError, 'bytes changed'): b.verify(base)
        base = copy.deepcopy(self.bases['A']); base['public_source_files'][0]['url'] = 'https://invalid.example/invented'
        with self.assertRaisesRegex(ValueError, 'URL provenance'): b.verify(base)

    def test_exact_role_policy_22_plus_6(self):
        self.assertEqual(len(self.dags['base_only_pairs']), 22)
        self.assertEqual(len(self.dags['genuine_role_dependent_pairs']), 6)
        for pointer in self.dags['base_only_pairs']:
            for step in b.old.checked_json(pointer)['stage_jobs']:
                if step.get('native_goal'):
                    self.assertEqual(step['seed_input_policy']['candidate_roles'], [] if step['stage']=='source_first_record' else ['proposal'])
        for pointer in self.dags['genuine_role_dependent_pairs']:
            expected = {'V05':['critique','revision'], 'V06':['critique'], 'V13':['dependencies']}[pointer['method_id']]
            self.assertEqual(b.old.checked_json(pointer)['genuine_missing_roles'], expected)

    def test_exact_packet_pins_bounds_and_source_first_isolation(self):
        self.assertEqual(self.initial['prepared_native_stage_packets'], 46)
        for pointer in self.initial['requests']:
            request = b.old.checked_json(pointer)
            card = b.old.checked_json({'path':request['card_path'],'sha256':request['card_sha256']})
            for row in request['stage_jobs']:
                spec = b.old.checked_json({'path':row['stage_json'],'sha256':row['stage_sha256']})
                self.assertEqual(b.p.sha(spec['prompt_file']), spec['prompt_sha256'])
                for path, pin in spec['input_pins'].items(): self.assertEqual(b.p.sha(path), pin)
                exact = next(x for x in card['stages'][row['arm']] if x['stage']==row['stage'])
                self.assertEqual(spec['max_seconds'], exact['max_native_seconds'])
                if request['family']=='L': self.assertIsNone(spec['max_responses'])
                if row['stage']=='source_first_record':
                    self.assertFalse(any('/inputs/seed/' in path for path in spec['input_pins']))
                    self.assertEqual(spec['required_artifacts'], ['out/evidence/record.md'])
                elif row['stage'] in ('source_critic','implementation_critic'):
                    self.assertEqual(row['max_seconds'],200); self.assertEqual(row['prerequisite_job_ids'],[])

    def test_same_arm_predecessor_is_required(self):
        plan = b.old.checked_json(next(x for x in self.dags['base_only_pairs'] if x['pair_id']=='D-V04-A'))
        step = next(x for x in plan['stage_jobs'] if x['arm']=='treatment' and x['stage']=='compare_final')
        with self.assertRaisesRegex(ValueError, 'Exact declared same-arm'):
            b.old.predecessor_sources(step, {}, plan['pair_id'], 'treatment')

    def test_finite_role_jobs_preserve_real_dependencies(self):
        jobs = json.loads((b.ROOT / 'FIXED_BASE_CONTINUATIONS.json').read_text())['jobs']
        self.assertEqual(len(jobs),6); self.assertEqual(sum(x['max_seconds'] for x in jobs),3900)
        for job in jobs:
            self.assertIsNone(job['max_parent_responses'])
            self.assertEqual(job['max_seconds'], {'critique':600,'revision':450,'enrichment':900}[job['stage']])
            self.assertEqual(bool(job['prerequisite_job_ids']), job['stage']=='revision')
            if job['stage']=='enrichment': self.assertIn('out/seed/dependencies.json',job['required_artifacts'])


if __name__=='__main__': unittest.main()
