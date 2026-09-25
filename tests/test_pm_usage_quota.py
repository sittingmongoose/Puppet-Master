"""Static quota successor composition; all owner/proof readers are fixture doubles."""
from copy import deepcopy
import importlib.util
import json
import os
from pathlib import Path
import sys
import unittest

STAGE=Path(__file__).resolve().parents[1]
CANON=Path(os.environ.get('PM_CANON_ROOT',STAGE))
os.environ['PM_CANON_ROOT']=str(CANON)
sys.path[:0]=[str(STAGE),str(STAGE/'scripts'),str(CANON/'scripts')]
import pm_usage_quota_semantics as m
FIXTURES=json.loads((STAGE/'Plans/usage_quota_command_fixtures.json').read_text())

def check(v):return m.usage_quota_semantic_failures('usage_command_fixture',v)
def synchronize(v):
    # Update all declared readback copies for intrinsic semantic negatives.
    row=v['before']['rows'][0]
    if v['result']['projection'] is not None:v['result']['projection']['rows']=[deepcopy(row)]
    v['source_records']={row[k]['source_ref']:deepcopy(row[k]) for k in ('route_source','account_source','window_source')}
    output=v['result']['output']
    if output:
        import hashlib
        output['view']['rows']=deepcopy(v['before']['rows'])
        v['output_json']=json.dumps(output['view'],sort_keys=True,separators=(',',':'),ensure_ascii=False)
        raw=v['output_json'].encode();output['content_sha256']=hashlib.sha256(raw).hexdigest();output['byte_length']=len(raw)
    v['outcome']['payload_sha256']=m.core.owner_result_digest(v['request'])
    v['outcome']['owner_result_sha256']=m.core.owner_result_digest(v['result'])
    return v

class QuotaTests(unittest.TestCase):
 def fresh(self):return deepcopy(FIXTURES['valid'][0]['value'])
 def test_actual_pair_and_exact_negatives(self):
  for f in FIXTURES['valid']+FIXTURES['invalid']:
   self.assertEqual(m.shape('usage_command_fixture',f['value']),[],f['name'])
   errors=check(f['value'])
   if 'semantic_rule' in f:self.assertIn(f['semantic_rule'],errors,f['name'])
   else:self.assertEqual(errors,[],f['name'])
 def test_real_central_metadata_pipeline(self):
  spec=importlib.util.spec_from_file_location('quota_gate',CANON/'scripts/pm-new-contracts-verify.py')
  gate=importlib.util.module_from_spec(spec);sys.modules[spec.name]=gate;spec.loader.exec_module(gate)
  schema=m.schemas()[0][m.SCHEMA]
  registry=gate.offline_schema_registry().with_resource(schema['$id'],m.Resource.from_contents(schema))
  for f in FIXTURES['valid']+FIXTURES['invalid']:
   definition,selected=gate.select_definition(schema,f,f['value'],require_valid='semantic_rule' not in f)
   self.assertTrue(gate.validator_for(schema,selected,registry).is_valid(f['value']))
   errors=m.usage_quota_semantic_failures(definition,f['value'])
   if 'semantic_rule' in f:self.assertIn(f['semantic_rule'],errors)
   else:self.assertEqual(errors,[])
 def test_application_quota_has_no_execution_or_project(self):
  v=deepcopy(FIXTURES['valid'][1]['value']);self.assertEqual(check(v),[])
  row=v['before']['rows'][0];self.assertIsNone(row['project_id'])
  for forbidden in ('attempt_id','run_id','usage_record_id','usage_event_refs','settlement_status','token_buckets','cost'):
   bad=deepcopy(row);bad[forbidden]='invented';self.assertTrue(m.shape('quota_row',bad))
 def test_unknown_not_zero_and_native_units(self):
  v=self.fresh();w=v['before']['rows'][0]['window_source']
  self.assertEqual(w['remaining']['value'],0);self.assertEqual(check(v),[])
  w['remaining']={'state':'unknown','value':None,'unit':None};synchronize(v);self.assertEqual(check(v),[])
  w['remaining']['value']=0;self.assertTrue(m.shape('window_source',w))
 def test_nonfinite_quantities_and_countdown_rejected(self):
  for field in ('remaining','used','limit'):
   for bad in (float('inf'),float('nan')):
    v=self.fresh();row=v['before']['rows'][0];row['window_source'][field]['value']=bad
    self.assertIn('quota_nonfinite_quantity',m.quota_failures(row,v['before']['query']))
  v=self.fresh();row=v['before']['rows'][0]
  row['window_source']['reset_countdown']={'remaining_seconds':float('nan'),'observed_at_utc':'2026-09-25T10:00:00Z'}
  self.assertIn('quota_nonfinite_quantity',m.quota_failures(row,v['before']['query']))
 def test_window_and_source_enums(self):
  v=self.fresh();w=v['before']['rows'][0]['window_source']
  for bad in ('fixed','billing','session'):
   x=deepcopy(w);x['window_kind']=bad;self.assertTrue(m.shape('window_source',x))
  for field,bad in (('source_class','pattern_only_or_inferred'),('source_confidence','authoritative'),('signal_kind','login_status')):
   x=deepcopy(w);x[field]=bad;self.assertTrue(m.shape('window_source',x))
 def test_session_not_remaining_provider_quota(self):
  v=self.fresh();w=v['before']['rows'][0]['window_source']
  w.update(window_kind='session_only',source_class='cli_reported',source_authority='authoritative_local_session_stats',signal_kind='structured_runtime')
  synchronize(v);self.assertIn('quota_session_is_not_provider_remaining',check(v))
  for key in ('remaining','limit'):w[key]={'state':'not_exposed','value':None,'unit':None}
  synchronize(v);self.assertEqual(check(v),[])
 def test_reset_requires_exact_evidence(self):
  v=self.fresh();w=v['before']['rows'][0]['window_source'];w['window_kind']='fixed_reset'
  synchronize(v);self.assertIn('quota_fixed_reset_missing',check(v))
  w['reset_at']='2026-09-26T00:00:00Z';synchronize(v);self.assertIn('quota_reset_at_evidence',check(v))
  w['reset_evidence_refs']=['provider:reset:1'];synchronize(v);self.assertEqual(check(v),[])
  w['reset_at']=None;w['reset_countdown']={'remaining_seconds':300,'observed_at_utc':'2026-09-25T10:00:00Z'}
  synchronize(v);self.assertEqual(check(v),[])
 def test_mixed_snapshot_preserves_actual_attempt_rows(self):
  v=self.fresh();old=json.loads((CANON/'Plans/usage_command_contract_fixtures.json').read_text())
  attempt=deepcopy(old['valid'][0]['value']['before']['rows'][0])
  v['before']['rows'].append({'row_kind':'attempt_usage','usage':attempt})
  v['result']['projection']['rows']=deepcopy(v['before']['rows'])
  output=v['result']['output'];output['view']['rows']=deepcopy(v['before']['rows'])
  import hashlib
  v['output_json']=json.dumps(output['view'],sort_keys=True,separators=(',',':'),ensure_ascii=False)
  raw=v['output_json'].encode();output['content_sha256']=hashlib.sha256(raw).hexdigest();output['byte_length']=len(raw)
  v['outcome']['owner_result_sha256']=m.core.owner_result_digest(v['result'])
  self.assertEqual(check(v),[])
 def test_inferred_cannot_report_exact(self):
  v=self.fresh();w=v['before']['rows'][0]['window_source'];w.update(source_authority='inferred_estimated',source_class='local_estimated')
  synchronize(v);self.assertIn('quota_inferred_reported',check(v))
 def test_authority_is_not_transport_class(self):
  v=self.fresh();w=v['before']['rows'][0]['window_source']
  w.update(source_class='cli_reported',signal_kind='structured_runtime')
  synchronize(v);self.assertEqual(check(v),[])
  w.update(window_kind='session_only',source_class='provider_reported',source_authority='authoritative_local_session_stats')
  for key in ('remaining','limit'):w[key]={'state':'not_exposed','value':None,'unit':None}
  synchronize(v);self.assertEqual(check(v),[])
  for inferred in ('local_estimated','pricing_estimated'):
   w['source_class']=inferred;synchronize(v)
   self.assertIn('quota_inferred_class_claims_authority',check(v))
 def test_scope_and_context_sources_not_optional_bags(self):
  for field,rule in (('auth_resolution_ref','quota_auth_source_missing'),('billing_resolution_ref','quota_billing_source_missing'),('project_context_resolution_ref','quota_project_context_source_missing')):
   v=self.fresh();v['before']['rows'][0]['account_source'][field]=None;synchronize(v);self.assertIn(rule,check(v))
  v=self.fresh();w=v['before']['rows'][0]['window_source'];w['window_scope']='account+model';synchronize(v)
  self.assertIn('quota_model_subject',check(v))
 def test_source_mutation_and_proof_contract(self):
  v=self.fresh();deps=m.fixture_dependencies(v)
  def sources(*args):v['source_records']['quota:account']['effective_account_id']='changed';return []
  deps['verify_sources']=sources
  self.assertIn('quota_source_changed_during_resolution',m.validate_usage_result(v['request']['request_ref'],'fixture:result','fixture:response',**deps))
  v=self.fresh();deps=m.fixture_dependencies(v);deps['verify_sources']=lambda *args:True
  self.assertIn('sources_invalid_proof',m.validate_usage_result(v['request']['request_ref'],'fixture:result','fixture:response',**deps))
 def test_v1_pair_unchanged_through_reused_core(self):
  old=json.loads((CANON/'Plans/usage_command_contract_fixtures.json').read_text())
  for f in old['valid']:
   self.assertEqual(m.core.usage_command_semantic_failures(f['definition'],f['value']),[])

if __name__=='__main__':unittest.main()
