"""Installed-only central composition; copied records and digest are static doubles."""
from copy import deepcopy as cp
import json,os,sys,unittest
from pathlib import Path
ROOT=Path(os.environ.get('PM_CANON_ROOT',Path(__file__).resolve().parents[1]))
sys.path.insert(0,str(ROOT/'scripts'))
import pm_ui_command_response as UI
import pm_jj_publication_response as m
STAGE=Path(m.__file__).resolve().parents[1]
FIXTURES=json.loads((STAGE/'Plans/sir_jj_publication_dispatch_fixtures.json').read_text())
def check(x,**kwargs):
    deps=m.fixture_dependencies(x,ui_module=UI);deps.update(kwargs)
    return UI.response_bundle_failures(x['bundle'],**deps)
class Response(unittest.TestCase):
    def setUp(self):self.x=cp(FIXTURES['valid'][0]['value'])
    def test_central_metadata_and_full_composition(self):
        s=json.loads((STAGE/m.SCHEMA).read_text());gate=UI.contracts();registry=UI.registry().with_resource(s['$id'],m.Resource.from_contents(s))
        self.assertEqual(FIXTURES['schema_version'],'1.0.0')
        for positive,cases in ((True,FIXTURES['valid']),(False,FIXTURES['invalid'])):
            for c in cases:
                d,selected=gate.select_definition(s,c,c['value'],require_valid=positive)
                self.assertEqual(list(gate.validator_for(s,selected,registry).iter_errors(c['value'])),[],c['name'])
                failures=m.jj_publication_dispatch_semantic_failures(d,c['value'],ui_module=UI)
                if positive:self.assertEqual(failures,[],c['name'])
                else:self.assertIn(c['semantic_rule'],failures)
    def test_foreign_delivery(self):
        self.x['bundle']['delivery_return_context']['caller_context_ref']='foreign'
        self.assertIn('jj_publication_delivery_original_return_mismatch',check(self.x))
    def test_absent_delivery_not_null(self):
        del self.x['bundle']['delivery_return_context'];self.assertIn('jj_publication_delivery_owner_value_missing',check(self.x))
    def test_scope_not_fabricated_from_current_selection(self):
        b=self.x['bundle'];self.x['records'][b['original_binding_ref']]['identity']['project_id']='foreign'
        self.assertIn('jj_publication_response_original_identity',check(self.x))
    def test_independent_generations(self):
        b=self.x['bundle'];o=self.x['records'][b['original_binding_ref']]
        self.assertNotEqual(o['target_generation'],o['arguments']['target_selection_generation']);self.assertEqual(check(self.x),[])
    def test_payload_digest_is_arguments(self):
        b=self.x['bundle'];o=self.x['records'][b['original_binding_ref']];o['payload_sha256']=UI.owner_result_digest(o)
        self.assertIn('jj_publication_response_original_payload',check(self.x))
    def test_wrong_result_binding(self):
        b=self.x['bundle'];b['response']['owner_result_schema_ref']['schema_id']='pm.jujutsu.command_result.v1'
        self.assertIn('jj_publication_owner_result_binding',check(self.x))
    def test_domain_receipt_not_bypassed(self):
        self.x['records']['receipt:jj:result:1']['event_refs']=['foreign:event'];self.assertIn('publication_receipt_event_refs',check(self.x))
    def test_real_accepted_work(self):
        self.x=cp(FIXTURES['valid'][3]['value']);b=self.x['bundle'];ref=b['owner_result']['owner_result']['observable_work_id'];del self.x['records'][ref];self.assertTrue(check(self.x))
    def test_accepted_not_terminal(self):
        self.x=cp(FIXTURES['valid'][3]['value']);self.x['bundle']['outcome']['result_receipt_ref']='foreign:receipt';self.assertTrue(check(self.x))
    def test_no_no_op(self):
        self.x['bundle']['response']['result_status']='no_op';self.assertIn('jj_publication_response_outcome',check(self.x))
    def test_unknown_cannot_be_projected_failed(self):
        self.x=cp(FIXTURES['valid'][2]['value']);b=self.x['bundle'];b['outcome']['outcome']='failed';b['response']['result_status']='failed'
        self.assertIn('jj_publication_response_outcome',check(self.x))
    def test_replay_preserves_original_result(self):
        b=self.x['bundle'];b['original_response']=cp(b['response']);b['response'].update(replayed=True,original_dispatch_id=b['original_response']['dispatch_id'],dispatch_id='dispatch:retry')
        self.assertEqual(check(self.x),[])
        b['response']['receipt_ref']='rewritten:receipt';self.assertIn('replay_changed_original_result_identity',check(self.x))
    def test_digest_mutation(self):
        def digest(x):x['bookmarks']=[];return 'a'*64
        self.assertIn('jj_publication_response_digest_input_mutated',check(self.x,canonical_request_digest=digest))
    def test_late_resolved_binding_mutation(self):
        records=cp(self.x['records']);ref=self.x['bundle']['original_binding_ref']
        def read(key):
            if key.startswith('receipt:'):records[ref]['target_generation']=99
            return records[key]
        self.assertIn('jj_publication_response_owner_record_mutated',check(self.x,resolve_owner_record=read))
if __name__=='__main__':unittest.main()
