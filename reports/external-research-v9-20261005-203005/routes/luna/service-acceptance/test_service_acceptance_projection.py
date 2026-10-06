"""Synthetic zero-inference acceptance tests; no native or live data mutation."""
import copy
import hashlib
import json
from pathlib import Path
import tempfile
import unittest
from service_acceptance_projection import extract,PROJECTOR_SHA,TAIL_PROJECTOR_SHA

THREAD='11111111-1111-1111-1111-111111111111'
PRIVATE='DO_NOT_EXPORT_PRIVATE_PROMPT_PROVIDER_SECRET_OR_CANDIDATE_BODY'


def fixture(root):
    result={'schema':'er9.luna.client-dynamic-stage.v1.3','thread_id':THREAD,
        'original_birth_monotonic_ns':100,'native_stop_monotonic_ns':1000,
        'requested_model':'gpt-6-luna','requested_effort':'max','model_fallback_allowed':False,
        'identity':{'fresh_empty_history':True,'instruction_sources_empty':True,'model':'gpt-6-luna','effort':'max'},
        'runtime_source_sha256':{'dynamic_projector.py':PROJECTOR_SHA},
        'prospective_completion_source_sha256':{'projection.py':TAIL_PROJECTOR_SHA},
        'allowed_client_tools':{'pm_boundary':['read_file','mechanical','write_file','public_https_get']},
        'metrics':{'fresh_session':True,'goal_target_id':THREAD,'requested_model':'gpt-6-luna','requested_effort':'max',
            'goal_started_turn':True,'goal_status_final':'active','candidate_goals_set_by_host':1,
            'host_initial_turns_started':1,'host_followup_turns_started':0,'goal_replacements_observed':0,
            'activation':{'native_activation_observed':True,'receipt_id':THREAD,'observed_activation_monotonic_ns':110},
            'usage_notification_count':2,'usage_totals':{'inputTokens':100,'cachedInputTokens':80,'outputTokens':5,
                'reasoningOutputTokens':3,'totalTokens':105},'tool_completed_counts':{'pm_boundary.read_file':1}},
        'private_prompt':PRIVATE,'native_goal_set_receipt':{'goal':{'objective':PRIVATE}}}
    sessions=root/'host-private/codex-home/sessions';sessions.mkdir(parents=True)
    journal=sessions/'synthetic.jsonl'
    journal.write_text(json.dumps({'type':'session_meta','payload':{'id':THREAD,'private':PRIVATE}})+'\n'+
        json.dumps({'type':'response_item','payload':{'type':'message','content':PRIVATE}})+'\n')
    (root/'result.json').write_text(json.dumps(result))
    return result,journal


class AcceptanceTests(unittest.TestCase):
    def setUp(self):
        self.temp=tempfile.TemporaryDirectory(prefix='er9-acceptance-')
        self.root=Path(self.temp.name);self.result,self.journal=fixture(self.root)
    def tearDown(self):self.temp.cleanup()
    def save(self):(self.root/'result.json').write_text(json.dumps(self.result))
    def observe(self,birth=100,thread=THREAD,now=200):return extract(self.root,birth,thread,now)
    def test_actual_traffic_without_completion_and_no_private_export(self):
        receipt=self.observe()
        self.assertTrue(receipt['active_attempt_acceptance_observed'])
        self.assertEqual(receipt['successful_registered_confined_tool_count'],1)
        self.assertEqual(receipt['known_usage_totals']['outputTokens'],5)
        self.assertEqual(receipt['usage_notification_count'],2)
        self.assertEqual(receipt['native_parent_response_count'].split(';')[0],'UNKNOWN')
        self.assertNotIn(PRIVATE,json.dumps(receipt))
    def test_positive_usage_without_generated_output_does_not_accept(self):
        self.result['metrics']['usage_totals']['outputTokens']=0;self.save()
        self.assertFalse(self.observe()['active_attempt_acceptance_observed'])
    def test_attempt_or_failed_tool_does_not_count_as_success(self):
        self.result['metrics']['tool_completed_counts']={}
        self.result['metrics']['tool_attempt_counts']={'pm_boundary.read_file':99}
        self.result['metrics']['tool_failed_counts']={'pm_boundary.read_file':99};self.save()
        self.assertFalse(self.observe()['active_attempt_acceptance_observed'])
    def test_wrong_birth_thread_history_model_and_projection_rejected(self):
        for patch in ('birth','thread','history','model','projection','activation'):
            old=copy.deepcopy(self.result)
            if patch=='birth':self.result['original_birth_monotonic_ns']=99
            elif patch=='thread':self.result['metrics']['goal_target_id']='22222222-2222-2222-2222-222222222222'
            elif patch=='history':self.result['identity']['fresh_empty_history']=False
            elif patch=='model':self.result['requested_model']='gpt-6-sol'
            elif patch=='projection':self.result['runtime_source_sha256']['dynamic_projector.py']='0'*64
            else:self.result['metrics']['activation']['observed_activation_monotonic_ns']=99
            self.save()
            with self.assertRaises(ValueError):self.observe()
            self.result=old
    def test_unregistered_completed_tool_rejected(self):
        self.result['metrics']['tool_completed_counts']={'pm_boundary.shell':1};self.save()
        with self.assertRaises(ValueError):self.observe()
    def test_new_capacity_error_prevents_reopening_and_unknown_text_stays_hidden(self):
        for code in ('server_overloaded','unknown_private_tag'):
            with self.journal.open('a') as file:file.write(json.dumps({'type':'event_msg','timestamp':'2026-10-06T00:00:00Z',
                'payload':{'type':'task_complete','error':{'codex_error_info':code,'message':PRIVATE}}})+'\n')
        receipt=self.observe()
        self.assertFalse(receipt['active_attempt_acceptance_observed'])
        self.assertTrue(receipt['adverse_receipt_observed'])
        self.assertEqual(receipt['terminal_error_classes'],['UNKNOWN','service_capacity'])
        self.assertNotIn(PRIVATE,json.dumps(receipt))
        self.assertNotIn('unknown_private_tag',json.dumps(receipt))
    def test_expired_or_nonactive_attempt_is_not_active_acceptance(self):
        self.assertFalse(self.observe(now=1000)['active_attempt_acceptance_observed'])
        self.result['metrics']['goal_status_final']='complete';self.save()
        receipt=self.observe()
        self.assertFalse(receipt['active_attempt_acceptance_observed'])
        self.assertTrue(receipt['positive_fresh_traffic_observed'])
    def test_ambiguous_missing_session_or_new_outcome_hold_prevents_acceptance(self):
        self.result['outcome']='HOLD';self.save()
        self.assertFalse(self.observe()['active_attempt_acceptance_observed'])
        self.journal.write_text('{}\n')
        with self.assertRaises(ValueError):self.observe()


if __name__=='__main__':
    result=unittest.TextTestRunner(verbosity=2).run(unittest.defaultTestLoader.loadTestsFromTestCase(AcceptanceTests))
    receipt={'schema':'er9.luna.service-acceptance-zero-inference-regression.v1','tests_run':result.testsRun,
        'passed':result.wasSuccessful(),'native_goal_starts':0,'live_files_mutated':False,
        'test_sha256':hashlib.sha256(Path(__file__).read_bytes()).hexdigest(),
        'reader_sha256':hashlib.sha256(Path(__file__).with_name('service_acceptance_projection.py').read_bytes()).hexdigest(),
        'scope':'synthetic structural fixtures only; no native requests, candidate/evaluator content, account access or dispatch changes'}
    Path(__file__).with_name('SERVICE_ACCEPTANCE_REGRESSION.json').write_text(json.dumps(receipt,indent=2)+'\n')
    raise SystemExit(0 if result.wasSuccessful() else 1)
