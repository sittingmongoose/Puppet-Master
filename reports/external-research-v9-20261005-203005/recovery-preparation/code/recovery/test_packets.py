"""Frozen policy, source custody, role, budget and isolation checks; no semantic grading."""
import datetime
import json
from pathlib import Path
import unittest

import prepare_integrated_v2 as m


class Packets(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        cls.recovery=[]
        for box in sorted(m.ROOT.glob('prepared-batch*/OUTBOX.json')):
            cls.recovery.extend(m.pins.checked_json(x) for x in json.loads(box.read_text())['requests'])
        cls.confirm_root=m.ROOT.parent/'confirmation-preparation'
        cls.confirm=[m.pins.checked_json(x) for x in json.loads((cls.confirm_root/'OUTBOX.json').read_text())['requests']]

    def test_all_72_stage_packets_have_exact_prompt_input_and_card_pins(self):
        count=0
        for request in self.recovery+self.confirm:
            card=m.pins.checked_json({'path':request['card_path'],'sha256':request['card_sha256']})
            for row in request['stage_jobs']:
                spec=m.pins.checked_json({'path':row['stage_json'],'sha256':row['stage_sha256']})
                self.assertEqual(m.p.sha(spec['prompt_file']),spec['prompt_sha256'])
                for path,sha in spec['input_pins'].items():self.assertEqual(m.p.sha(path),sha)
                stage=next(x for x in card[row['arm']+'_stages'] if x['stage']==row['stage'])
                self.assertEqual(spec['max_seconds'],stage['max_native_seconds'])
                self.assertEqual(spec['required_artifacts'],m.required(card,row['arm'],stage))
                self.assertEqual(row['max_responses'],None if request['family']=='L' else stage['max_parent_responses'])
                self.assertTrue(row['public_get']);count+=1
        self.assertEqual(count,72)

    def test_confirmation_lock_precedes_exact_unchanged_holdout_release(self):
        lock=m.pins.checked_json({'path':str(m.LAB/'supervision/DECISIONS-007-RECIPE-LOCK.json'),
                                 'sha256':'2e6a79f793474aa238c5d8e896fbb08e19f4e31a6277aa81095a5338671957db'})
        release=json.loads((m.ROOT/'CONFIRMATION_RELEASE_RECEIPT.json').read_text())
        locked=datetime.datetime.strptime(lock['locked_utc'],'%Y-%m-%d %H:%M:%S UTC').replace(tzinfo=datetime.timezone.utc)
        self.assertGreaterEqual(datetime.datetime.fromisoformat(release['release_utc']),locked)
        self.assertFalse(release['semantic_brief_read_before_this_receipt'])
        for code in ('H1','H2'):
            for suffix in ('.md','-coverage.json'):
                self.assertEqual(m.p.sha(self.confirm_root/'released'/(code+suffix)),m.p.sha(m.CASES/'confirmation/sealed'/(code+suffix)))

    def test_confirmation_exact_locked_topologies_and_full_allocations(self):
        self.assertEqual(len(self.confirm),4)
        for request in self.confirm:
            card=json.loads(Path(request['card_path']).read_text())
            self.assertEqual(card['candidate_family'],'GLM');self.assertEqual(card['requested_model'],'GLM 5.3 Flash')
            self.assertEqual([x['max_native_seconds'] for x in card['control_stages']],[1200,900,600])
            self.assertEqual([x['max_native_seconds'] for x in card['treatment_stages']],[1200,900,600] if card['recipe']=='A' else [1200,1500])
            self.assertEqual(card['allocation']['critical_path_candidate_seconds_per_arm'],2700)
            self.assertEqual(card['allocation']['occupied_candidate_seconds_per_arm'],5400)
            self.assertIn('terminal',request['execution_gate'])
            for row in request['stage_jobs']:self.assertTrue(row['execution_enabled'])

    def test_confirmation_research_is_brief_only_without_source_or_peer_fixture(self):
        for request in self.confirm:
            for row in request['stage_jobs']:
                if row['stage']!='research':continue
                spec=json.loads(Path(row['stage_json']).read_text())
                self.assertEqual({Path(x).name for x in spec['input_pins']},{'brief.md','output_contract.md','delivery_objective.md'})
                self.assertEqual(row['prerequisite_job_ids'],[])

    def test_v01_critic_execution_factor_and_no_redundant_original_critic(self):
        i01=next(x for x in self.recovery if x['source_slot']=='I-01')
        self.assertEqual([(x['arm'],x['stage']) for x in i01['stage_jobs']], [('control','revision'),('treatment','critique'),('treatment','revision')])
        i02=next(x for x in self.recovery if x['source_slot']=='I-02')
        for row in i02['stage_jobs']:
            if row['stage']=='critique':self.assertEqual(row['execution_enabled'],row['arm']=='treatment')

    def test_v05_original_role_budgets_and_revision_namespace(self):
        for slot in ('I-03','I-04'):
            request=next(x for x in self.recovery if x['source_slot']==slot)
            treatment=[x for x in request['stage_jobs'] if x['arm']=='treatment']
            self.assertEqual([x['max_seconds'] for x in treatment],[1050,750,450,300,150])
            revision=next(x for x in treatment if x['stage']=='revision')
            spec=json.loads(Path(revision['stage_json']).read_text())
            self.assertEqual(spec['required_artifacts'],['out/revision/'+x for x in ('proposal.md','sources.json','witnesses.json','leads.json')])

    def test_i05_real_critics_reused_without_false_goal_or_quiescence_relabel(self):
        request=next(x for x in self.recovery if x['source_slot']=='I-05')
        self.assertEqual([(x['arm'],x['stage'],x['max_seconds']) for x in request['stage_jobs']],[('control','revision',600),('treatment','revision',600)])
        f=m.pins.checked_json(request['immutable_pair_input_freeze'])
        proof=f['research_origins']['treatment']['existing_roles'][0]
        self.assertFalse(proof['original_quiescence_flag_preserved'])
        quiet=m.pins.checked_json(proof['owned_scope_supplement']);self.assertTrue(quiet['all_owned_scopes_quiet'])

    def test_fresh_pairs_have_no_old_candidate_inputs_and_only_new_i07_requests_v13(self):
        for slot in ('I-07','I-09'):
            request=next(x for x in self.recovery if x['source_slot']==slot)
            freeze=m.pins.checked_json(request['immutable_pair_input_freeze'])
            self.assertTrue(freeze['fresh_matched_credit'])
            if slot=='I-07':self.assertEqual(freeze['resource_contract']['sha256'],'903f792c57c654d37dd4d0e290bf3c005dd7a3fc7f8442e05fac12c2cdcb8d3f')
            for row in request['stage_jobs']:
                spec=json.loads(Path(row['stage_json']).read_text())
                self.assertFalse(any('/inputs/prior/' in x or '/inputs/source_context/' in x for x in spec['input_pins']))
        for request in self.recovery:
            if request['source_slot']!='I-07':self.assertIsNone(m.pins.checked_json(request['immutable_pair_input_freeze'])['resource_contract'])

    def test_live_originals_not_duplicated_and_all_cost_origins_preserved(self):
        for slot in ('I-10','I-11'):
            request=next(x for x in self.recovery if x['source_slot']==slot)
            self.assertTrue(all(x['arm']=='treatment' for x in request['stage_jobs']))
        self.assertFalse(any(x['source_slot']=='I-12' for x in self.recovery))
        for request in self.recovery:
            self.assertTrue(request['original_attempts_and_costs_preserved'])


if __name__=='__main__':unittest.main()
