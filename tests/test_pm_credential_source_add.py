"""Installed contract regression; synthetic doubles establish no native proof."""
from copy import deepcopy
import importlib.util
import json
import os
from pathlib import Path
import sys
import unittest

ROOT=Path(os.environ.get('PM_CANON_ROOT',Path(__file__).resolve().parents[1]))
CANON_ROOT=ROOT
sys.path.insert(0,str(ROOT/'scripts'))
import pm_ui_command_response as ui
from pm_credential_source_add import SCHEMA,structural_failures,credential_source_semantic_failures,fixture_dependencies


class CredentialSource(unittest.TestCase):
    def setUp(self):
        self.pack=json.loads((ROOT/'Plans/credential_source_add_fixtures.json').read_text())
        self.case=deepcopy(self.pack['valid'][0]['value'])

    def check(self,**overrides):
        args=fixture_dependencies(self.case,ui);args.update(overrides)
        return ui.response_bundle_failures(self.case['bundle'],**args)

    def sync(self):
        b=self.case['bundle'];original=self.case['records'][b['original_binding_ref']]
        original['arguments']=deepcopy(b['owner_request']);self.case['records'][original['request_ref']]=deepcopy(b['owner_request'])
        digest=ui.owner_result_digest(b['owner_request'])
        for target in (original,b['normalized_request'],b['outcome']):target['payload_sha256']=digest
        b['outcome']['owner_result_sha256']=ui.owner_result_digest(b['owner_result'])

    def test_pair(self):
        for entry in self.pack['valid']+self.pack['invalid']:
            with self.subTest(name=entry['name']):
                self.assertEqual(structural_failures(entry['definition'],entry['value'],canon_root=CANON_ROOT),[])
                errors=credential_source_semantic_failures(entry['definition'],entry['value'],canon_root=CANON_ROOT)
                if 'semantic_rule' in entry:self.assertIn(entry['semantic_rule'],errors)
                else:self.assertEqual(errors,[])

    def test_actual_gate_protocol_and_metadata(self):
        gate=ui.contracts();schema=json.loads((ROOT/SCHEMA).read_text())
        self.assertEqual(self.pack['contract_schema_id'],schema['x-schema-id'])
        from referencing import Resource
        registry=gate.offline_schema_registry().with_resource(schema['$id'],Resource.from_contents(schema))
        for entry in self.pack['valid']+self.pack['invalid']:
            definition,selected=gate.select_definition(schema,entry,entry['value'],require_valid='semantic_rule' not in entry)
            self.assertEqual(list(gate.validator_for(schema,selected,registry).iter_errors(entry['value'])),[])
            self.assertEqual(entry['value']['schema_version'],'1.0.0')
        self.assertEqual(gate.contract_semantic_failures(SCHEMA,'result',self.case['bundle']['owner_result']),[])

    def test_current_dependencies_required(self):
        for name in ('verify_original_admission','verify_secure_interaction','verify_scope_authority','check_current_disclosure'):
            args=fixture_dependencies(self.case,ui);args['credential_source_dependencies'][name]=None
            self.assertIn('credential_dependencies_missing',ui.response_bundle_failures(self.case['bundle'],**args))

    def test_native_refusal_and_boolean_not_authority(self):
        for name in ('verify_original_admission','verify_secure_interaction','verify_scope_authority','check_current_disclosure'):
            for response in (True,['authentic_owner_refusal']):
                args=fixture_dependencies(self.case,ui);args['credential_source_dependencies'][name]=lambda *_,v=response:v
                self.assertTrue(ui.response_bundle_failures(self.case['bundle'],**args))

    def test_original_mutation_rejected(self):
        records=self.case['records'];args=fixture_dependencies(self.case,ui);args['resolve_owner_record']=lambda ref:records[ref]
        def mutate(*_):records['original:credential']['actor_ref']='actor:other';return []
        args['credential_source_dependencies']['verify_secure_interaction']=mutate
        self.assertIn('credential_inputs_mutated',ui.response_bundle_failures(self.case['bundle'],**args))

    def test_callback_copy_mutation(self):
        args=fixture_dependencies(self.case,ui)
        def mutate(request,*_):request['authority']['actor_ref']='actor:other';return []
        args['credential_source_dependencies']['verify_original_admission']=mutate
        self.assertIn('credential_admission_inputs_mutated',ui.response_bundle_failures(self.case['bundle'],**args))

    def test_final_disclosure_mutation(self):
        args=fixture_dependencies(self.case,ui)
        def mutate(*_):self.case['bundle']['owner_result']['receipt_ref']='receipt:foreign';return []
        args['credential_source_dependencies']['check_current_disclosure']=mutate
        self.assertIn('credential_bundle_mutated_during_resolution',ui.response_bundle_failures(self.case['bundle'],**args))

    def test_nonsecret_closed_shapes(self):
        request=self.case['bundle']['owner_request'];request['selection']['secret_bytes']='not-a-real-secret'
        self.assertTrue(structural_failures('request',request,canon_root=CANON_ROOT))
        self.assertTrue(self.check())

    def test_missing_and_foreign_receipt(self):
        del self.case['records']['receipt:secure-one'];self.assertTrue(self.check())

    def test_ids_have_distinct_actual_owners(self):
        a=self.case['bundle']['owner_request']['authority'];i=self.case['bundle']['response']['owner_identity']
        self.assertEqual(len({a['request_id'],a['invocation_id'],i['command_instance_id']}),3)
        self.assertEqual(self.check(),[])

    def test_digest_mandatory_native_contract(self):
        self.assertIn('credential_dependencies_missing',self.check(canonical_request_digest=None))
        self.assertIn('credential_digest_contract',self.check(canonical_request_digest=lambda _:True))

    def test_no_effect_replay_or_local_disguise(self):
        self.case['bundle']['response']['result_status']='no_op';self.assertIn('credential_response_outcome',self.check())

    def test_original_caller_not_delivery_substitution(self):
        self.case['bundle']['delivery_return_context']=None
        self.assertIn('credential_delivery_original',self.check())

    def test_exact_other_commands_unchanged(self):
        source=json.loads((CANON_ROOT/'Plans/shared_integration_runtime_expansion_fixtures.json').read_text())
        gate=ui.contracts();schema=json.loads((CANON_ROOT/'Plans/shared_integration_runtime_expansion_contracts.schema.json').read_text())
        for entry in source['command_cases']:
            if entry['schema_family']=='integration_credential':
                for kind in ('request','result','permission'):
                    selected={'$ref':'#/$defs/'+entry[kind+'_schema_def']}
                    self.assertEqual(list(gate.validator_for(schema,selected,gate.offline_schema_registry()).iter_errors(entry[kind])),[])

    def test_caller_loss_does_not_repeat_effect(self):
        r=self.case['bundle']['owner_result']['owner_result']
        r['return_settlement'].update(settlement='caller_unavailable',initiating_surface_restored=False)
        self.sync();self.assertEqual(self.check(),[])

    def test_replay_retains_original_effect(self):
        b=self.case['bundle'];b['original_response']=deepcopy(b['response'])
        b['response'].update(replayed=True,original_dispatch_id=b['response']['dispatch_id'],dispatch_id='dispatch:replay')
        self.assertEqual(self.check(),[])
        b['response']['receipt_ref']='receipt:other';self.assertTrue(self.check())

    def test_missing_requested_field_rejects_without_crash(self):
        del self.case['records']['request:credential-original']['selection']['connection_id']
        self.assertTrue(self.check())

    def test_owner_error_unknown_overrides_failed_label(self):
        self.case=deepcopy(self.pack['valid'][1]['value']);q=self.case['records']['receipt:secure-one']
        q['owner_error']['effect_state']='unknown'
        self.assertIn('credential_response_outcome',self.check())
        self.case['bundle']['outcome']['outcome']='terminal_unknown'
        self.case['bundle']['response']['result_status']='recovery_required'
        self.assertEqual(self.check(),[])

    def test_none_cannot_hide_registered_source(self):
        self.case['records']['receipt:secure-one']['effect_state']='none'
        self.assertIn('credential_none_has_source',self.check())

    def test_no_automatic_attachment_or_activation_fields(self):
        for key in ('credential_attachment','lease_ref','activate','authenticate'):
            x=deepcopy(self.case['bundle']['owner_request']);x['selection'][key]=True
            self.assertTrue(structural_failures('request',x,canon_root=CANON_ROOT))

    def test_current_disclosure_even_on_owner_failure(self):
        self.case=deepcopy(self.pack['valid'][1]['value']);args=fixture_dependencies(self.case,ui);calls=[]
        def deny(*values):calls.append(values);return ['revoked_current_read']
        args['credential_source_dependencies']['check_current_disclosure']=deny
        self.assertIn('credential_final_disclosure:revoked_current_read',ui.response_bundle_failures(self.case['bundle'],**args));self.assertTrue(calls)

    def test_receipt_is_not_generic_expansion_result(self):
        self.case['records']['receipt:secure-one']=deepcopy(self.case['bundle']['owner_result']['owner_result'])
        self.assertIn('credential_unavailable:receipt_schema',self.check())

    def test_expiry_refusal_requires_actual_check_after_expiry(self):
        self.case=deepcopy(next(e['value'] for e in self.pack['valid'] if e['name']=='expired_refusal'))
        self.case['records']['submission:one']['lifecycle']['expires_at_utc']='2026-09-25T08:05:00Z'
        self.assertIn('credential_false_expiry',self.check())

    def test_actual_connection_draft_projection_reuse(self):
        p=json.loads((CANON_ROOT/'Plans/shared_integration_runtime_fixtures.json').read_text())
        # This test uses an actual historical owner value, not invented draft fields.
        candidates=[]
        def walk(v):
            if isinstance(v,dict):
                if v.get('record_kind')=='connection_draft_record':candidates.append(v)
                for item in v.values():walk(item)
            elif isinstance(v,list):
                for item in v:walk(item)
        walk(p)
        self.assertTrue(candidates)
        c=self.case['records']['connection-projection:alpha'];draft=deepcopy(candidates[0])
        for ck,dk in (('connection_id','connection_id'),('connection_generation','connection_generation'),('provider_id','provider_id'),('profile_ref','profile_ref'),('server_id','home_server_id'),('project_id','project_id'),('execution_host_id','execution_host_id'),('execution_environment_id','execution_environment_id')):draft[dk]=c[ck]
        c['draft_record']=draft
        self.assertEqual(self.check(),[])
        draft['connection_generation']+=1
        self.assertIn('credential_draft_connection_generation',self.check())


if __name__=='__main__':unittest.main()
