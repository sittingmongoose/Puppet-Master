"""Pure decision checks; no runtime, Goals, models, DB or network."""
import unittest
from project import zero_start_supported,null_targets

class ProofDecisionTests(unittest.TestCase):
    def positive(self):
        return {k:True for k in ['all_source_pins_match','controlled_send_before_stdin','guard_before_goal_set','fresh_native_session_created_with_null_target','pre_guard_read_explicit_null_target',
                 'final_native_explicit_null_target','positive_native_close','native_registered_model_requests_zero','native_usage_reply_matches_session','native_pause_did_not_start_turn','source_exception_is_preactivation_guard']} | {'goal_set_sent_count':0,'parse_errors':0,'unknown_goal_actions':0}
    def test_flags_empty_export_or_missing_target_do_not_prove_zero(self):
        self.assertFalse(zero_start_supported({'goal_activated':False,'goal_submitted':None,'provider_row_count':0}))
        self.assertFalse(null_targets({'session':{},'projection':{}}));self.assertTrue(null_targets({'session':{'target':None},'projection':{'target':None}}))
    def test_every_positive_requirement_is_necessary(self):
        positive=self.positive();self.assertTrue(zero_start_supported(positive))
        for k in positive:
            changed=dict(positive);changed[k]=False if type(changed[k]) is bool else 1
            self.assertFalse(zero_start_supported(changed),k)
    def test_goal_set_or_unknown_transport_never_becomes_zero(self):
        positive=self.positive();positive['goal_set_sent_count']=1;self.assertFalse(zero_start_supported(positive))
        positive=self.positive();positive['parse_errors']=1;self.assertFalse(zero_start_supported(positive))
        positive=self.positive();positive['unknown_goal_actions']=1;self.assertFalse(zero_start_supported(positive))
if __name__=='__main__':unittest.main(verbosity=2)
