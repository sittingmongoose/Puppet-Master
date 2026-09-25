"""Installed-only static complete recovery values; no native authority claim."""
from copy import deepcopy as cp
import importlib.util,json,os,sys,unittest
from pathlib import Path
ROOT=Path(os.environ.get('PM_CANON_ROOT',Path(__file__).resolve().parents[1]));sys.path.insert(0,str(ROOT/'scripts'))
import pm_jj_operation_recovery as m
from referencing import Resource
class Recovery(unittest.TestCase):
    def setUp(self):
        self.f=json.loads((m.ROOT/'Plans/jj_operation_recovery_fixtures.json').read_text());self.v=cp(self.f['valid'][0]['value'])
    def check(self):return m.recovery_failures(self.v['request'],self.v['result'],**m.fixture_dependencies(self.v))
    def p(self):return self.v['records']['preview:recovery']
    def test_actual_central_metadata_pipeline(self):
        spec=importlib.util.spec_from_file_location('recovery_gate',ROOT/'scripts/pm-new-contracts-verify.py');g=importlib.util.module_from_spec(spec);sys.modules[spec.name]=g;spec.loader.exec_module(g)
        s=json.loads((m.ROOT/m.SELF).read_text());reg=g.offline_schema_registry().with_resource(s['$id'],Resource.from_contents(s));self.assertEqual(self.f['schema_version'],'1.0.0')
        for positive,cases in ((True,self.f['valid']),(False,self.f['invalid'])):
            for c in cases:
                d,selected=g.select_definition(s,c,c['value'],require_valid=positive);self.assertFalse(list(g.validator_for(s,selected,reg).iter_errors(c['value'])))
                e=m.recovery_semantic_failures(d,c['value'])
                if positive:self.assertEqual(e,[],c['name'])
                else:self.assertIn(c['semantic_rule'],e)
    def test_exact_resolved_ids(self):
        for ref,field,rule in [('receipt:jj:result:1','receipt_id','recovery_receipt_identity'),('lease:jj:25','lease_id','recovery_lease_identity'),('source:selected','source_id','recovery_source_identity'),('preview:recovery','preview_id','recovery_preview_identity'),('native-qualified-semantics:undo','qualification_id','recovery_qualification_identity')]:
            with self.subTest(field=field):
                self.setUp();self.v['records'][ref][field]='foreign';self.assertIn(rule,self.check())
    def test_undo_restore_not_interchangeable(self):
        self.p()['command_id']='cmd.jujutsu.operation.restore';self.assertIn('recovery_preview_command_id',self.check())
    def test_parent_is_actual_not_position(self):
        self.p()['selected_parent_operation_id']='foreign';self.assertIn('recovery_parent_not_actual',self.check())
    def test_unknown_parent_not_qualified(self):
        self.p()['selected_parent_operation_id']=None;self.assertIn('recovery_undo_parent_unqualified',self.check())
    def test_missing_native_qualification(self):
        del self.v['records']['native-qualified-semantics:undo'];self.assertTrue(self.check())
    def test_exact_complete_effects(self):
        self.p()['effects'].pop();self.assertIn('recovery_complete_effect_set',self.check())
    def test_preview_not_actual_receipt(self):
        self.v['records']['source:after']['view']['files'][0]['content']['object_id']='other';self.assertIn('recovery_actual_proposal',self.check())
    def test_dirty_snapshot_drift(self):
        self.v['records']['source:current']['view']['workspaces'][0]['snapshot_id']='dirty';self.assertIn('recovery_current_workspace_snapshot',self.check())
    def test_no_newest_operation_substitution(self):
        self.v['records']['source:selected']['operation_id']='latest';self.assertIn('recovery_selected_operation',self.check())
    def test_foreign_source_location(self):
        self.v['records']['source:after']['view']['files'][0]['source_location_id']='foreign';self.assertIn('recovery_file_source_location',self.check())
    def test_no_post_snapshot_no_success(self):
        self.v['records']['observation:recovery']['after_source_ref']=None;self.assertIn('recovery_post_state_missing',self.check())
    def test_unknown_cannot_be_failed_known(self):
        self.v=cp(self.f['valid'][2]['value']);r=self.v['result']['owner_result'];r['outcome']='failed';self.v['records'][r['receipt_ref']]['outcome']='failed';self.assertIn('recovery_unknown_overall',self.check())
    def test_unqualified_cannot_apply(self):
        self.p()['qualification']='unknown';self.assertIn('recovery_effect_not_qualified',self.check())
    def test_original_receipt_event_join(self):
        self.v['records']['receipt:jj:result:1']['event_refs']=['other'];self.assertIn('recovery_receipt_event_refs',self.check())
    def test_foreign_affected_identity_is_not_native_proof(self):
        o=self.v['records']['observation:recovery'];o['affected_identities']['change_ids']=['foreign'];self.v['result']['owner_result']['affected_identities']=cp(o['affected_identities'])
        self.assertIn('recovery_actual_affected_identities',self.check())
    def test_clean_materialized_file_preserves_native_conflict(self):
        self.v=cp(self.f['valid'][4]['value']);self.assertEqual(self.check(),[])
        self.v['records']['source:after']['view']['conflicts']=[]
        self.assertIn('recovery_source_conflicts',self.check())
    def test_partial_effects_not_relabelled_completed(self):
        self.v=cp(self.f['valid'][6]['value']);self.assertEqual(self.check(),[])
        self.v['records']['observation:recovery']['completion']='completed';self.assertIn('recovery_completion_truth',self.check())
    def test_unqualified_root_no_parent_choice(self):
        self.v=cp(self.f['valid'][5]['value']);self.assertEqual(self.check(),[])
        self.v['records']['observation:recovery']['effect_state']='known_applied';self.assertIn('recovery_effect_not_qualified',self.check())
    def test_unknown_input_content_cannot_apply(self):
        self.v['records']['source:selected']['view']['files'][0]['content']=dict(state='unknown',object_id=None)
        self.assertIn('recovery_unknown_native_preview',self.check())
    def test_unknown_native_conflict_side_cannot_apply(self):
        self.v=cp(self.f['valid'][4]['value']);side=cp(self.v['records']['source:after']['view']['conflicts']);side[0]['sides'][0]['content']=dict(state='unknown',object_id=None);self.v['records']['source:selected']['view']['conflicts']=side
        self.assertIn('recovery_unknown_native_preview',self.check())
    def test_native_future_qualification_is_not_original(self):
        self.v['records']['native-qualified-semantics:undo']['issued_at_utc']='2099-01-01T00:00:00Z';self.assertIn('recovery_qualification_time',self.check())
    def test_late_actual_source_mutation(self):
        records=cp(self.v['records'])
        def read(ref):
            if ref.startswith('receipt:'):records['source:selected']['operation_id']='late'
            return records[ref]
        self.assertIn('recovery_owner_record_mutated',m.recovery_failures(self.v['request'],self.v['result'],resolve_record=read))
if __name__=='__main__':unittest.main()
