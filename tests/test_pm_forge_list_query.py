"""Installed-only finite list contracts; fixture adapters are synthetic, not native proof."""
from copy import deepcopy
import importlib.util,json,os,sys,unittest
from pathlib import Path
from referencing import Resource
ROOT=Path(__file__).resolve().parents[1];CANON=Path(os.environ.get('PM_CANON_ROOT',ROOT));sys.path.insert(0,str(ROOT/'scripts'))
import pm_forge_list_query as m
import pm_ui_command_response as ui
class T(unittest.TestCase):
 @classmethod
 def setUpClass(cls):
  cls.fixtures=json.loads((ROOT/'Plans/forge_list_query_contract_fixtures.json').read_text());cls.schema=json.loads((ROOT/m.SCHEMA).read_text());spec=importlib.util.spec_from_file_location('query_gate',CANON/'scripts/pm-new-contracts-verify.py');cls.central=importlib.util.module_from_spec(spec);spec.loader.exec_module(cls.central);cls.registry=cls.central.offline_schema_registry().with_resource(cls.schema['$id'],Resource.from_contents(cls.schema))
 def value(self,name='repository_current_list'):return deepcopy(next(c['value'] for c in self.fixtures['valid'] if c['name']==name))
 def bundle(self,v):
  rec=v['records'];o=rec[v['original_binding_ref']];out=rec[v['outcome_ref']]
  return dict(response=rec[v['response_ref']],response_ref=v['response_ref'],owner_request=v['request'],owner_result=v['result'],original_binding_ref=v['original_binding_ref'],delivery_return_context=v['delivery_return_context'],resolved_outcome_ref=v['outcome_ref'],outcome=out,resolved_owner_result_ref=out['owner_result_ref'],original_response=rec.get(rec[v['response_ref']]['original_dispatch_id']) if rec[v['response_ref']]['replayed'] else None,normalized_request=dict(request_ref=o['request_ref'],command_id=v['request']['authority']['command_id'],command_instance_id=o['identity']['command_instance_id'],operation_id=o['identity']['operation_id'],owner_identity=o['identity'],**{k:o[k] for k in ('payload_sha256','idempotency_key','target_generation','dispatch_frame_id')}))
 def check(self,v,**overrides):
  deps=m.fixture_dependencies(v);deps.update(overrides);return ui.response_bundle_failures(self.bundle(v),forge_list_query_dependencies=deps)
 def pin(self,v):
  rec=v['records'];q=v['request'];r=v['result'];o=rec[v['original_binding_ref']];o.update(arguments=deepcopy(q),payload_sha256=ui.owner_result_digest(q));rec[r['original_request_ref']]=deepcopy(q);out=rec[v['outcome_ref']];out.update(payload_sha256=o['payload_sha256'],owner_result_sha256=ui.owner_result_digest(r));rec[out['owner_result_ref']]=deepcopy(r)
 def query_pin(self,v):
  q=v['request']['selection'];d=v['records']['descriptor:list'];q['descriptor_sha256']=ui.owner_result_digest(d);qd=ui.owner_result_digest({k:q[k] for k in ('descriptor_ref','descriptor_sha256','fields')});v['records']['window:list'].update(descriptor_sha256=q['descriptor_sha256'],query_sha256=qd);v['records']['read-receipt:list']['query_sha256']=qd;self.pin(v)
 def test_actual_gate_metadata(self):
  for group in ('valid','invalid'):
   for c in self.fixtures[group]:
    d,s=self.central.select_definition(self.schema,c,c['value'],require_valid=group=='valid');self.assertEqual([],list(self.central.validator_for(self.schema,s,self.registry).iter_errors(c['value'])))
    errors=ui.contracts().contract_semantic_failures(m.SCHEMA,d,c['value'])
    if group=='valid':self.assertEqual([],errors,c['name'])
    else:self.assertIn(c['semantic_rule'],errors)
 def test_all_actual_central_positives(self):
  for c in self.fixtures['valid']:self.assertEqual([],self.check(deepcopy(c['value'])),c['name'])
 def test_native_dependencies_not_boolean(self):
  for k in ('verify_original_admission','verify_query_authority','verify_read_sources','check_current_disclosure'):
   self.assertTrue(any('invalid_proof' in e for e in self.check(self.value(),**{k:lambda *a:True})))
 def test_native_missing_not_granted(self):self.assertTrue(ui.response_bundle_failures(self.bundle(self.value())))
 def test_precommit_actual_client_and_null_project(self):
  v=self.value('precommit_current_list');self.assertIsNone(v['request']['authority']['repo_id']);self.assertIsNone(v['records'][v['original_binding_ref']]['identity']['project_id']);self.assertEqual([],self.check(v));v['records'][v['original_binding_ref']]['initiating_client_id']='client:foreign';self.assertIn('precommit_client',self.check(v))
 def test_wrong_endpoint_and_catalog(self):
  for k,val,rule in [('api_version','foreign','descriptor_endpoint'),('catalog_generation',999,'descriptor_catalog_generation')]:
   v=self.value();v['records']['descriptor:list'][k]=val;self.query_pin(v);self.assertIn(rule,self.check(v))
 def test_unknown_operator_and_kind(self):
  v=self.value();v['request']['selection']['fields'][0]['operator_id']='unknown';self.query_pin(v);self.assertIn('unknown_query_operator',self.check(v))
  v=self.value();v['request']['selection']['fields'][0]['operand']={'kind':'integer','value':3};self.query_pin(v);self.assertIn('query_operand_kind',self.check(v))
 def test_explicit_null_not_omission(self):
  v=self.value();v['request']['selection']['fields'][0]['operand']={'kind':'null','value':None};self.query_pin(v);self.assertEqual([],self.check(v));v['records']['descriptor:list']['fields'][0]['operators'][0]['nullable']=False;self.query_pin(v);self.assertIn('query_null_disallowed',self.check(v))
 def test_required_absent_field(self):
  v=self.value();v['records']['descriptor:list']['fields'][0]['absence_allowed']=False;v['request']['selection']['fields']=[];self.query_pin(v);self.assertIn('required_query_field',self.check(v))
 def test_integer_not_boolean(self):
  v=self.value();v['request']['selection']['fields'][0]['operand']={'kind':'integer','value':True};self.assertTrue(m.shape('request',v['request']))
 def test_original_query_not_current_panel(self):
  v=self.value();v['request']['selection']['fields'][0]['operand']['value']='latest';self.assertIn('original_request',self.check(v))
 def test_actual_partial_stale_read_not_complete_data(self):
  v=self.value('partial_stale_read');self.assertEqual('succeeded',v['records'][v['response_ref']]['result_status']);self.assertEqual([],self.check(v));v['result']['owner_result']['outcome']='succeeded';v['records']['receipt:logs']['outcome']='succeeded';self.pin(v);self.assertIn('success_freshness',self.check(v))
 def test_missing_window_not_success(self):
  v=self.value();v['result']['observation_ref']=None;self.pin(v);self.assertIn('terminal_read_evidence',self.check(v))
 def test_false_complete_continuation(self):
  v=self.value();v['records']['window:list']['continuation_ref']='cursor:missing';self.assertIn('complete_continuation',self.check(v))
 def test_independent_automation_generation(self):
  v=self.value('pipeline_current_list');self.assertEqual((7,4),(v['request']['authority']['expected_binding_generation'],v['request']['authority']['expected_automation_binding_generation']));self.assertEqual([],self.check(v));v['records']['item:list']['automation_binding_generation']=7;self.assertIn('pipeline_item_scope',self.check(v))
 def test_returned_unbound_repository_is_not_pm_binding(self):
  v=self.value('precommit_current_list');item=v['records']['item:list'];self.assertNotIn('repo_id',item);self.assertNotIn('binding_id',item);item['scope_ref']='container:foreign';self.assertIn('repository_item_scope',self.check(v))
 def test_read_receipt_exact_original(self):
  v=self.value();v['records']['read-receipt:list']['query_sha256']='f'*64;self.assertIn('read_receipt_query_sha256',self.check(v))
 def test_no_write_probe(self):
  v=self.value();v['request']['authority']['permission']['scope']='remote_side_effect';self.pin(v);self.assertIn('list_read_only',self.check(v))
 def test_callback_and_late_resolver_mutation(self):
  def mutate(original,*a):original['actor_ref']='foreign';return []
  self.assertIn('proof_input_mutated',self.check(self.value(),verify_original_admission=mutate))
  v=self.value()
  def late(*a):v['records']['descriptor:list']['account_id']='foreign';return []
  self.assertIn('original_mutated',self.check(v,check_current_disclosure=late))
 def test_historical_common_ui_unchanged(self):
  for c in json.loads((CANON/'Plans/ui_command_response_fixtures.json').read_text())['valid']:self.assertEqual([],ui.response_bundle_failures(c))
 def test_genuine_accepted_work_has_no_terminal_receipt(self):
  v=self.value('accepted_actual_work');self.assertEqual([],self.check(v));self.assertIsNone(v['result']['read_receipt_ref']);v['records']['work:list'].update(work_state='completed',result_receipt_ref='receipt:foreign',cancel_available=False,background_available=False);self.assertIn('accepted_work_terminal',self.check(v))
 def test_accepted_cannot_borrow_terminal_window(self):
  v=self.value('accepted_actual_work');v['result']['observation_ref']='window:list';self.pin(v);self.assertTrue(self.check(v))
 def test_failed_cancelled_rows_not_erased(self):
  for name in ('failed_retains_window','cancelled_retains_window'):
   v=self.value(name);self.assertEqual(['item:list'],v['records']['window:list']['items']);self.assertEqual([],self.check(v))
  v=self.value('cancelled_retains_window');self.assertIsNone(v['records'][v['response_ref']]['error']);self.assertIsNotNone(v['result']['owner_result']['error'])
 def test_foreign_error_ref_and_ui_projection(self):
  v=self.value('failed_retains_window');v['records'][v['response_ref']]['error']['reason']='foreign';self.assertIn('error_projection_value',self.check(v))
  v=self.value('failed_retains_window');v['records'][v['outcome_ref']]['error_ref']='error:foreign';self.assertTrue(self.check(v))
 def test_unknown_owner_error_not_mapped_failed(self):
  v=self.value('failed_retains_window');v['result']['owner_result']['error']['effect_state']='unknown';v['records']['error:list']['error']['effect_state']='unknown';v['result']['owner_result']['error']['retry_disposition']='after_reconciliation';v['records']['error:list']['error']['retry_disposition']='after_reconciliation';self.pin(v);self.assertIn('terminal_outcome',self.check(v));v['records'][v['outcome_ref']]['outcome']='terminal_unknown';v['records'][v['response_ref']]['result_status']='recovery_required';self.assertEqual([],self.check(v))
 def test_caller_null_substitution_rejected(self):
  v=self.value();v['delivery_return_context']=None;self.assertIn('original_return',self.check(v))
 def test_precommit_focus_bound_to_actual_caller(self):
  v=self.value('precommit_current_list');v['request']['authority']['repository_list_scope']['return_focus_id']='focus:foreign';self.pin(v);self.assertIn('precommit_return_focus',self.check(v))
 def test_cursor_binds_query_and_preceding_window(self):
  for field,val,rule in [('query_sha256','f'*64,'continuation_query_sha256'),('scope_ref','scope:foreign','continuation_scope_ref'),('previous_window_ref','window:missing','owner_resolution:KeyError')]:
   v=self.value('second_page_same_original_query');v['records']['continuation:page2'][field]=val;self.assertIn(rule,self.check(v))
 def test_continuation_not_free_current_filter(self):
  v=self.value('second_page_same_original_query');v['records']['query:original']['selection']['fields'][0]['operand']['value']='other';self.assertIn('continuation_original_query',self.check(v))
 def test_no_implicit_continuation_support(self):
  v=self.value('second_page_same_original_query');v['records']['descriptor:list']['continuation_supported']=False;self.assertIn('continuation_unsupported',self.check(v))
 def test_prior_window_requires_resolved_original(self):
  v=self.value('second_page_same_original_query');v['records']['window:previous']['original_request_ref']='query:foreign';self.assertIn('owner_resolution:KeyError',self.check(v))
  v=self.value('second_page_same_original_query');v['records']['query:foreign']=deepcopy(v['records']['query:original']);v['records']['window:previous']['original_request_ref']='query:foreign';self.assertIn('continuation_prior_origin',self.check(v))
 def third_page(self):
  v=self.value('second_page_same_original_query');rec=v['records'];rec['query:page2']=deepcopy(v['request']);rec['window:page2']=deepcopy(rec['window:list']);rec['window:page2'].update(window_ref='window:page2',original_request_ref='query:page2',completeness='partial',continuation_ref='continuation:page3',reason_ref='reason:page-boundary');rec['continuation:page3']=deepcopy(rec['continuation:page2']);rec['continuation:page3'].update(continuation_ref='continuation:page3',previous_window_ref='window:page2');v['request']['selection']['continuation_ref']='continuation:page3';self.pin(v);return v
 def test_third_page_authentic_original_chain(self):
  v=self.third_page();self.assertEqual([],m.shape('fixture_case',v));self.assertEqual([],self.check(v));v['records']['query:page2']['authority']['account_id']='foreign';self.assertIn('continuation_prior_scope',self.check(v))
 def test_continuation_cycle_not_authority(self):
  v=self.third_page();v['records']['query:page2']['selection']['continuation_ref']='continuation:page3';self.assertIn('continuation_cycle',self.check(v))
 def test_prior_page_resolver_late_mutation(self):
  v=self.third_page()
  def late(*a):v['records']['query:page2']['selection']['fields']=[];return []
  self.assertIn('original_mutated',self.check(v,check_current_disclosure=late))
 def test_empty_read_still_needs_actual_source_evidence(self):
  v=self.value();v['records']['window:list'].update(items=[],source_evidence_refs=[]);self.assertIn('read_without_source',self.check(v))
 def test_native_read_denial_not_fixture_boolean(self):self.assertIn('read:read_permission_revoked',self.check(self.value(),verify_read_sources=lambda *a:['read_permission_revoked']))
 def test_descriptor_has_no_invented_numeric_defaults(self):
  v=self.value();op=v['records']['descriptor:list']['fields'][0]['operators'][0];self.assertTrue(all(op[k] is None for k in ('minimum_integer','maximum_integer','minimum_length','maximum_length','minimum_items','maximum_items')));self.assertEqual([],self.check(v));op.update(minimum_integer=3);self.query_pin(v);self.assertIn('descriptor_inapplicable_bounds',self.check(v))
 def test_actual_enum_and_bounds(self):
  v=self.value();op=v['records']['descriptor:list']['fields'][0]['operators'][0];op.update(value_kind='enum',enum_values=['native:one','native:two']);v['request']['selection']['fields'][0]['operand']={'kind':'enum','value':'native:one'};self.query_pin(v);self.assertEqual([],self.check(v));v['request']['selection']['fields'][0]['operand']['value']='native:unknown';self.query_pin(v);self.assertIn('query_enum_value',self.check(v))
 def test_resource_operand_authentic_scope(self):
  v=self.value();d=v['records']['descriptor:list'];op=d['fields'][0]['operators'][0];op.update(value_kind='resource',resource_kind='native:owner');v['request']['selection']['fields'][0]['operand']={'kind':'resource','value':'resource:owner'};a=v['request']['authority'];v['records']['resource:owner']={'schema_id':'pm.forge.list_query.resource_operand.v1','schema_version':'1.0.0','resource_ref':'resource:owner',**{k:a[k] for k in ('provider','provider_variant','normalized_host','account_id')},'resource_kind':'native:owner','provider_resource_id':'native:17','scope_ref':a['repository_binding_ref'],'currentness_ref':'currentness:resource'};self.query_pin(v);self.assertEqual([],self.check(v));v['records']['resource:owner']['scope_ref']='scope:foreign';self.assertIn('query_resource_scope',self.check(v))
 def test_cross_field_exclusion_is_actual_descriptor_fact(self):
  v=self.value();d=v['records']['descriptor:list'];other=deepcopy(d['fields'][0]);other['field_id']='fixture:other';d['fields'].append(other);d['constraints']=[{'kind':'excludes','when_field_id':'fixture:search','when_operand':None,'other_field_id':'fixture:other'}];self.query_pin(v);self.assertEqual([],self.check(v));v['request']['selection']['fields'].append({'field_id':'fixture:other','operator_id':'native:equals','operand':{'kind':'text','value':'other'}});self.query_pin(v);self.assertIn('query_cross_field',self.check(v))
 def test_duplicate_descriptor_or_selected_field(self):
  v=self.value();v['records']['descriptor:list']['fields'].append(deepcopy(v['records']['descriptor:list']['fields'][0]));self.assertTrue(m.shape('descriptor',v['records']['descriptor:list']))
  v=self.value();other=deepcopy(v['request']['selection']['fields'][0]);other['operand']['value']='other';v['request']['selection']['fields'].append(other);self.query_pin(v);self.assertIn('duplicate_query_field',self.check(v))
 def test_no_false_fresh_complete_promotion(self):
  v=self.value('partial_stale_read');v['records']['window:list'].update(freshness='current',completeness='complete');self.assertIn('false_degraded',self.check(v))
 def test_future_provider_probe_not_original(self):
  v=self.value();v['records'][v['request']['authority']['api_compatibility_ref']]['probed_at_utc']='2030-01-01T00:00:00Z';self.assertIn('api_future',self.check(v))
 def test_replay_retains_original_query(self):
  v=self.value();r=v['records'][v['response_ref']];original_id=r['dispatch_id'];v['records'][original_id]=deepcopy(r);r.update(dispatch_id='dispatch:retry',replayed=True,original_dispatch_id=original_id);self.assertEqual([],self.check(v))
 def test_automation_provider_independent_of_repository_host(self):
  v=self.value('pipeline_current_list');a=v['request']['authority'];v['records'][a['repository_binding_ref']].update(provider='forgejo',provider_variant='forgejo',normalized_host='forge.example.invalid',account_id='account:forgejo');v['records'][a['automation_binding_ref']]['repository_relationship']='different_service';self.assertEqual([],self.check(v))
if __name__=='__main__':unittest.main()
