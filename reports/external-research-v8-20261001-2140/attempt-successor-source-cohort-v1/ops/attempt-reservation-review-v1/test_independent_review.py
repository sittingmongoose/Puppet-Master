"""Independent adversarial tests over owned full-source/mock-ledger fixture only."""
import copy,json,unittest
from pathlib import Path
from unittest.mock import patch
import test_attempt_reservations_v1 as a
m=a.m;NOW=a.NOW
class IndependentTests(a.AttemptTests):
 # Suppress inherited author cases: these are reported separately.
 pass
for n in list(vars(a.AttemptTests)):
 if n.startswith('test_'):setattr(IndependentTests,n,None)
def rejected(self,request=None,now=NOW):
 before=copy.deepcopy(self.state)
 with self.assertRaises((RuntimeError,ValueError,KeyError,OSError,TypeError,AttributeError)):self.call(request,now)
 self.assertEqual(self.state,before)
IndependentTests.rejected=rejected

def test_real_exact_both_envelopes_then_one_start_over(self):
 before=m.accounting(self.state,NOW)
 starts=before['native_goal_starts']+before['reserved_or_committed_native_starts']
 occupied=before['occupied_slot_seconds']+before['reserved_or_committed_slot_seconds']
 self.state['reservation_by_case']['old-boundary']={'native_starts':144-starts-6,'occupied_seconds':172800-occupied-10800,'completed':False,'final_job':'old-boundary-final'}
 baseline=copy.deepcopy(self.state);r=self.call()
 self.assertEqual(r['native_starts_with_commitments'],144);self.assertEqual(r['occupied_seconds_with_commitments'],172800)
 self.state=baseline;self.state['reservation_by_case']['old-boundary']['native_starts']+=1;self.rejected()
IndependentTests.test_real_exact_both_envelopes_then_one_start_over=test_real_exact_both_envelopes_then_one_start_over

def test_real_one_occupied_second_over(self):
 before=m.accounting(self.state,NOW);occupied=before['occupied_slot_seconds']+before['reserved_or_committed_slot_seconds']
 self.state['reservation_by_case']['old-occupied-boundary']={'native_starts':1,'occupied_seconds':172800-occupied-10800+1,'completed':False,'final_job':'old-occupied-final'};self.rejected()
IndependentTests.test_real_one_occupied_second_over=test_real_one_occupied_second_over

def test_bool_root_clocks_acceptance_and_quiet_rejected(self):
 self.rejected({**self.request,'root_authority':True+0});self.rejected(now=True)
 good=copy.deepcopy(self.acceptance)
 for bad in [True,float('nan'),float('inf'),NOW+1]:
  self.acceptance={**good,'accepted_epoch':bad};self.request['source_acceptance']=a.write(m.ACCEPTANCE,self.acceptance);self.rejected()
 self.acceptance=good;self.request['source_acceptance']=a.write(m.ACCEPTANCE,good)
 old=self.request['pairs'][0]['arms'][0]['predecessor_attempt_case_id'];path=Path(self.request['predecessor_quiet_records'][old]['path']);good=json.loads(path.read_text())
 for key,value in [('root_authority',1),('native_quiescent',1),('permits_settled',1),('observed_epoch',True),('observed_epoch',float('inf'))]:
  self.request['predecessor_quiet_records'][old]=a.write(path,{**good,key:value});self.rejected()
IndependentTests.test_bool_root_clocks_acceptance_and_quiet_rejected=test_bool_root_clocks_acceptance_and_quiet_rejected

def test_related_attempt_pending_blocks_old_logical_case(self):
 arm=self.request['pairs'][0]['arms'][0];old=arm['logical_case_id'];related=old+'-OLDER'
 row=copy.deepcopy(next(iter(self.state['jobs'].values())));row.update(case=related,released_epoch=None,launch_pending={'permit_id':'pending'})
 self.state['jobs']['related-attempt-job']=row;self.state['cases'][related]={'logical_case_id':old}
 refs=self.request['predecessor_quiet_records'];path=Path(refs[old]['path']);record=json.loads(path.read_text());jobs={k:v for k,v in self.state['jobs'].items() if v['case'] in {old,related}};record['ledger_jobs_sha256']=m.canonical_sha(jobs);refs[old]=a.write(path,record);self.rejected()
IndependentTests.test_related_attempt_pending_blocks_old_logical_case=test_related_attempt_pending_blocks_old_logical_case

def test_related_completed_attempt_blocks_repeat(self):
 arm=self.request['pairs'][0]['arms'][0];old=arm['logical_case_id'];related=old+'-OLDER'
 self.state['cases'][related]={'logical_case_id':old,'completed':True};self.rejected()
IndependentTests.test_related_completed_attempt_blocks_repeat=test_related_completed_attempt_blocks_repeat

def test_finished_nan_rollback_and_deadline_all_atomic(self):
 for end in [float('nan'),float('inf'),True,NOW-1,m.DEADLINE]:
  before=copy.deepcopy(self.state)
  with patch.object(m.legacy.time,'time',side_effect=[NOW,end]):
   with self.assertRaises(RuntimeError):m.apply(self.state,'reserve-attempt-successors',self.request)
  self.assertEqual(self.state,before)
IndependentTests.test_finished_nan_rollback_and_deadline_all_atomic=test_finished_nan_rollback_and_deadline_all_atomic

def test_duplicate_nonfinite_and_nonobject_json(self):
 for raw in [b'{"x":1,"x":2}',b'{"x":NaN}',b'{"x":Infinity}',b'[]',b'null']:
  with self.assertRaises((RuntimeError,ValueError)):m.object_bytes(raw)
IndependentTests.test_duplicate_nonfinite_and_nonobject_json=test_duplicate_nonfinite_and_nonobject_json

def test_missing_source_acceptance_and_bad_reference_atomic(self):
 for key in ['source_acceptance','development_authority','declaration_closure']:
  for value in [None,True,{'path':str(m.ACCEPTANCE),'sha256':True},{'path':str(m.ACCEPTANCE),'sha256':'0'*64,'extra':True}]:self.rejected({**self.request,key:value})
IndependentTests.test_missing_source_acceptance_and_bad_reference_atomic=test_missing_source_acceptance_and_bad_reference_atomic

def test_actual_warning_accepts_and_stop_blocks_preserving_unknown(self):
 unknown=next(k for k,v in self.state['jobs'].items() if v['generated_output_tokens'] is None)
 known='offline-known-output'
 self.state['jobs'][known]=copy.deepcopy(self.state['jobs'][unknown]);self.state['jobs'][known].update(case='offline-known-output',goal_starts=[],released_epoch=self.state['jobs'][unknown]['birth_epoch'],launch_pending=None)
 for row in self.state['jobs'].values():row['generated_output_tokens']=None
 self.state['jobs'][known]['generated_output_tokens']=1200000
 before=copy.deepcopy(self.state);receipt=self.call();self.assertTrue(receipt['preflight_accounting']['candidate_output_warning']);self.assertEqual(receipt['preflight_accounting']['generated_usage'],'unknown');self.assertEqual(before['jobs'],self.state['jobs'])
 self.state=before;self.state['jobs'][known]['generated_output_tokens']=1500000;self.rejected()
IndependentTests.test_actual_warning_accepts_and_stop_blocks_preserving_unknown=test_actual_warning_accepts_and_stop_blocks_preserving_unknown

def test_selected_pair_quiet_extra_or_missing_rejects(self):
 refs=copy.deepcopy(self.request['predecessor_quiet_records']);refs['foreign']=next(iter(refs.values()));self.rejected({**self.request,'predecessor_quiet_records':refs})
 refs=copy.deepcopy(self.request['predecessor_quiet_records']);refs.pop(next(iter(refs)));self.rejected({**self.request,'predecessor_quiet_records':refs})
IndependentTests.test_selected_pair_quiet_extra_or_missing_rejects=test_selected_pair_quiet_extra_or_missing_rejects

def test_receipt_lineage_and_reservation_map_wrongtype_reject(self):
 for key in [m.RECEIPTS,m.LINEAGE]:
  self.state[key]=[];self.rejected();del self.state[key]
IndependentTests.test_receipt_lineage_and_reservation_map_wrongtype_reject=test_receipt_lineage_and_reservation_map_wrongtype_reject

def test_old_action_calls_delegate_and_no_caller_mutation(self):
 original=copy.deepcopy(self.request)
 for action in ['event','helper-start','helper-end','case-complete','release','admit','status','unknown']:
  with patch.object(m.base,'apply',return_value='delegated') as delegated:
   self.assertEqual(m.apply(self.state,action,{}),'delegated');delegated.assert_called_once_with(self.state,action,{})
 self.call();self.assertEqual(self.request,original)
IndependentTests.test_old_action_calls_delegate_and_no_caller_mutation=test_old_action_calls_delegate_and_no_caller_mutation
if __name__=='__main__':unittest.main(verbosity=2)
