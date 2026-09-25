"""Real central/gate/static Git-three composition, synthetic retained-value doubles.

No native dispatcher, codec, permission or storage proof is claimed.
"""
from copy import deepcopy
import importlib.util
import json
import os
from pathlib import Path
import sys
import unittest

ROOT = Path(os.environ.get('PM_CANON_ROOT', Path(__file__).resolve().parents[1]))
sys.path.insert(0, str(ROOT / 'scripts'))

def load_ui():
    spec = importlib.util.spec_from_file_location('git3_integrated_response',ROOT/'scripts/pm_ui_command_response.py')
    mod = importlib.util.module_from_spec(spec)
    sys.modules[spec.name] = mod
    spec.loader.exec_module(mod)
    return mod

UI = load_ui()
BASES = {x['name']: x['value'] for x in json.loads((ROOT/'Plans/git_selected_three_fixtures.json').read_text())['valid']}
CENTRAL = json.loads((ROOT/'Plans/ui_command_response_fixtures.json').read_text())
TEMPLATE = next(x for x in CENTRAL['valid'] if x['case_id'] == 'shared_succeeded')

def fixture_digest(request):
    # Existing Case-L fixture oracle only; production callback must implement
    # the actual canonical digest contract, not adopt this as native proof.
    return UI.owner_result_digest(request)

def bundle(kind='commit', state='succeeded'):
    x = deepcopy(BASES[kind])
    a,r,records = x['request'],x['result'],x['records']
    receipt = records[r['operation_receipt_ref']]
    if state != 'succeeded':
        receipt['outcome'] = state
        receipt['after_revision'] = None
        r['native_effect_ref'] = None
    template_state = {'blocked':'rejected','effect_unknown':'terminal_unknown','recovery_required':'terminal_unknown'}.get(state,state)
    b = deepcopy(next(t for t in CENTRAL['valid'] if t['case_id']=='shared_'+template_state))
    identity = b['outcome']['identity']
    lineage = records[a['repository_context_ref']]['lineage']
    for field in ('project_id','project_home_server_id','execution_host_id','execution_environment_id','source_location_id','topology_generation'):
        identity[field] = lineage[field]
    identity.update(operation_id=receipt['operation_id'],command_instance_id=a['command_instance_id'],
                    named_plan_id=lineage.get('plan_id'),goal_id=lineage.get('goal_id'))
    outcome_state = {'succeeded':'succeeded','failed':'failed','blocked':'rejected','cancelled':'cancelled',
                     'effect_unknown':'terminal_unknown','recovery_required':'terminal_unknown'}[state]
    binding = {'path':'Plans/git_selected_three.schema.json','json_pointer':'#/$defs/result','schema_id':r['schema_id']}
    b['outcome'].update(command_id=a['command_id'],idempotency_key=a['idempotency_key'],
        payload_sha256=fixture_digest(a),outcome=outcome_state,result_receipt_ref=r['operation_receipt_ref'],
        owner_result_schema_ref=binding,owner_result_sha256=UI.owner_result_digest(r))
    b['response'].update(command_id=a['command_id'],command_instance_id=a['command_instance_id'],
        request_ref=r['original_request_ref'],owner_identity=deepcopy(identity),operation_id=receipt['operation_id'],
        owner_result_schema_ref=deepcopy(binding),receipt_ref=r['operation_receipt_ref'],
        ack_status='rejected' if state=='blocked' else 'accepted',
        result_status={'succeeded':'succeeded','failed':'failed','cancelled':'cancelled','blocked':None,
                       'effect_unknown':'recovery_required','recovery_required':'recovery_required'}[state])
    # Rejected terminal owner outcomes need the existing response error type.
    if state == 'blocked':
        blocked = next(t for t in CENTRAL['valid'] if t['case_id']=='shared_rejected')
        b['response']['error'] = deepcopy(blocked['response']['error'])
    b['normalized_request'].update(command_id=a['command_id'],command_instance_id=a['command_instance_id'],
        request_ref=r['original_request_ref'],operation_id=receipt['operation_id'],owner_identity=deepcopy(identity),
        payload_sha256=fixture_digest(a),idempotency_key=a['idempotency_key'])
    b['owner_request'],b['owner_result'] = a,r
    b['owner_records'] = records  # fixture-only reader source, no admitted store
    return b

def check(b, *, reader=None, digest=fixture_digest):
    records = deepcopy(b['owner_records'])
    return UI.response_bundle_failures(b,resolve_owner_record=reader or (lambda ref: deepcopy(records[ref])),
                                       canonical_request_digest=digest)

class GitSelectedResponse(unittest.TestCase):
    def test_three_real_owner_positives(self):
        for kind in BASES:
            self.assertEqual(check(bundle(kind)),[])

    def test_every_terminal_receipt_mapping(self):
        for state in ('succeeded','blocked','failed','cancelled','recovery_required','effect_unknown'):
            with self.subTest(state=state): self.assertEqual(check(bundle(state=state)),[])

    def test_real_gate_bare_result_and_domain_compose(self):
        b=bundle()
        self.assertEqual(UI.contracts().contract_semantic_failures('Plans/git_selected_three.schema.json','result',b['owner_result']),[])
        b['owner_records']['effect:commit']['applied_selection']['message']='not original'
        self.assertIn('effect_applied_selection',check(b))

    def test_metadata_negative_census(self):
        # Exact declared metadata failures, not generic nonempty rejection.
        cases=[('idempotency_key','other','git3_response_idempotency'),
               ('payload_sha256','f'*64,'git3_response_original_payload')]
        for field,value,rule in cases:
            b=bundle();b['outcome'][field]=value;b['normalized_request'][field]=value
            self.assertIn(rule,check(b))
        b=bundle();b['response']['request_ref']='foreign';b['normalized_request']['request_ref']='foreign'
        self.assertIn('git3_response_original_ref',check(b))

    def test_foreign_context_preserved_as_actual_owner(self):
        b=bundle();b['owner_records']['context:commit']['lineage']['project_id']='foreign'
        self.assertIn('git3_response_context_identity',check(b))

    def test_operation_and_receipt_bind_actual(self):
        b=bundle();b['owner_records']['receipt:commit']['operation_id']='foreign';b['owner_records']['effect:commit']['operation_id']='foreign'
        self.assertIn('git3_response_operation',check(b))
        b=bundle();b['outcome']['result_receipt_ref']='foreign';b['response']['receipt_ref']='foreign'
        self.assertIn('git3_response_receipt',check(b))

    def test_exact_caller_return_is_in_original_digest(self):
        b=bundle();a=b['owner_request']
        a['return_context']={'surface_id':'source_control','route_ref':'route:scm','focus_id':'focus:commit',
          'invocation_token':'invocation:original','caller_context_ref':'caller:original','expected_caller_revision':2,'continuation_generation':1}
        b['owner_result']['return_context']=deepcopy(a['return_context'])
        b['owner_records'][b['owner_result']['original_request_ref']]=deepcopy(a)
        b['outcome']['owner_result_sha256']=UI.owner_result_digest(b['owner_result'])
        self.assertIn('git3_response_original_payload',check(b))
        for v in (b['outcome'],b['normalized_request']):v['payload_sha256']=fixture_digest(a)
        self.assertEqual(check(b),[])

    def test_no_wrong_family_or_local_projection_escape(self):
        b=bundle();b['response']['owner_result_schema_ref']['json_pointer']='#'
        self.assertIn('git3_owner_result_binding',check(b))
        b=deepcopy(next(t for t in CENTRAL['valid'] if t['case_id']=='local_projection_success'))
        b['response']['command_id']=b['normalized_request']['command_id']='cmd.git.commit'
        self.assertIn('durable_command_disguised_as_local_projection',UI.response_bundle_failures(b))

    def test_missing_dependencies_fail_closed(self):
        b=bundle();self.assertIn('git3_response_owner_dependencies_missing',UI.response_bundle_failures(b))
        self.assertIn('git3_response_digest_contract',check(b,digest=lambda _:True))

    def test_mutating_digest_and_resolver_fail_closed(self):
        b=bundle()
        def digest(value):value['selection']['message']='mutated';return fixture_digest(value)
        self.assertIn('git3_response_digest_input_mutated',check(b,digest=digest))
        b=bundle()
        def reader(ref):
            if ref=='receipt:commit':b['normalized_request']['request_ref']='late'
            return deepcopy(b['owner_records'][ref])
        self.assertIn('git3_bundle_mutated_during_resolution',check(b,reader=reader))

    def test_same_original_replay_no_redispatch(self):
        b=bundle();b['original_response']=deepcopy(b['response'])
        b['response'].update(replayed=True,original_dispatch_id=b['response']['dispatch_id'],dispatch_id='dispatch:replay')
        self.assertEqual(check(b),[])
        b['response']['receipt_ref']='new-receipt'
        self.assertIn('replay_changed_original_result_identity',check(b))

    def test_existing_response_fixtures_unchanged(self):
        for old in CENTRAL['valid']:
            self.assertEqual(UI.response_bundle_failures(deepcopy(old)),[])

if __name__=='__main__':unittest.main()
