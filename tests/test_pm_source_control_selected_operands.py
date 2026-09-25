"""Static companion tests; fixtures are NOT native SCM/authentication proof."""
import copy
import json
from pathlib import Path
import sys
import unittest

ROOT = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(ROOT / "scripts"))
import pm_source_control_selected_operands as m


class SelectedOperands(unittest.TestCase):
    def setUp(self):
        self.cases = {x["name"]: x["value"] for x in json.loads(
            (ROOT / "Plans/source_control_selected_operand_fixtures.json").read_text())["valid"]}

    def check(self, case):
        return m.result_failures(case["request"], case["result"], **m.fixture_dependencies(case))

    def test_six_original_joins(self):
        self.assertEqual(len(self.cases), 6)
        for name, case in self.cases.items():
            with self.subTest(name=name):
                self.assertEqual(self.check(case), [])

    def test_backend_adoption_selection_can_differ_from_original(self):
        x = copy.deepcopy(self.cases["backend_select"])
        x["request"]["selection"]["backend"] = "jujutsu"
        x["result"]["selection"] = copy.deepcopy(x["request"]["selection"])
        x["records"][x["request"]["preview_ref"]]["selection"] = copy.deepcopy(x["request"]["selection"])
        preview=x['records'][x['request']['preview_ref']];d=preview['native_disclosure']
        d['proposed_mapping']['scm_backend']='jujutsu'
        d['native_repairs']=[{'repair_id':'repair:backend','qualified_native_operation_ref':'native:qualified-backend-migration','before_mapping':copy.deepcopy(d['before_mapping']),'after_mapping':copy.deepcopy(d['proposed_mapping']),'file_effects':[],'config_effects':[]}]
        x['records']['native:qualified-backend-migration']={'schema_id':'pm.source_control.selected_operands.native_repair_qualification.v1','schema_version':'1.0.0','qualification_id':'native:qualified-backend-migration','command_instance_id':preview['command_instance_id'],'scope':copy.deepcopy(preview['scope']),'repair':copy.deepcopy(d['native_repairs'][0])}
        source=x['records'][preview['native_disclosure_source_ref']];source['selection']=copy.deepcopy(preview['selection']);source['disclosure']=copy.deepcopy(d)
        x["records"][x["result"]["original_request_ref"]] = copy.deepcopy(x["request"])
        self.assertEqual(x["request"]["authority"]["scope"]["scm_backend"], "git")
        self.assertEqual(self.check(x), [])
        x['records']['native:qualified-backend-migration']['repair']['after_mapping']['backing_store_ref']='foreign:store'
        self.assertIn('adoption_native_qualification',self.check(x))

    def test_target_generation_is_independent_and_exact(self):
        x = copy.deepcopy(self.cases["publish"])
        self.assertNotEqual(x["request"]["selection"]["target_selection_generation"],
                            x["request"]["authority"]["scope"]["currentness_generation"])
        self.assertEqual(self.check(x), [])
        x["records"]["target:publish"]["selection_snapshot_generation"] += 1
        self.assertIn("publish_generation", self.check(x))

    def test_fixture_pair_shapes_and_declared_negative(self):
        fixtures = json.loads((ROOT / "Plans/source_control_selected_operand_fixtures.json").read_text())
        for fixture in fixtures["valid"] + fixtures["invalid"]:
            self.assertEqual(m.shape_failures(fixture["definition"], fixture["value"]), [])
            failures = m.selected_operand_semantic_failures(fixture["definition"], fixture["value"])
            if "expected_error" in fixture:
                self.assertIn(fixture["expected_error"], failures)
            else:
                self.assertEqual(failures, [])

    def test_distinct_per_target_previews_are_allowed(self):
        x = copy.deepcopy(self.cases["publish"])
        old = x["request"]["preview_ref"]
        for index, target in enumerate(x["records"]["target:publish"]["push_targets"]):
            target["preview_ref"] = "preview:per-target:" + str(index)
            x["records"][target["preview_ref"]] = copy.deepcopy(x["records"][old])
        self.assertEqual(self.check(x), [])

    def test_read_only_result_cannot_report_effects(self):
        x = copy.deepcopy(self.cases["history"])
        x["result"]["owner_result"]["effect_state"] = "effects_reconciled"
        self.assertIn("read_only_effect", self.check(x))

    def test_command_and_selection_mismatch(self):
        x = copy.deepcopy(self.cases["fetch"])
        x["request"]["selection"]["kind"] = "history"
        self.assertTrue(self.check(x))

    def test_original_selection_cannot_be_rewritten(self):
        for name, case in self.cases.items():
            x = copy.deepcopy(case)
            x["records"][x["result"]["original_request_ref"]]["authority"]["idempotency_key"] = "foreign"
            with self.subTest(name=name):
                self.assertIn("original_request_mismatch", self.check(x))

    def test_foreign_context(self):
        x = copy.deepcopy(self.cases["diff"])
        x["records"][x["request"]["repository_context_ref"]]["lineage"]["project_id"] = "project:other"
        self.assertIn("context_lineage_project_id", self.check(x))

    def test_stale_preview(self):
        x = copy.deepcopy(self.cases["workspace_remove"])
        x["records"][x["request"]["preview_ref"]]["scope"]["currentness_generation"] += 1
        self.assertIn("preview_scope", self.check(x))

    def test_missing_owner_ref_fails_closed(self):
        x = copy.deepcopy(self.cases["backend_select"])
        del x["records"][x["request"]["preview_ref"]]
        self.assertTrue(any(e.startswith("unresolved:") for e in self.check(x)))

    def test_publication_is_existing_owner_not_parallel_preview(self):
        x = copy.deepcopy(self.cases["publish"])
        x["records"]["target:publish"]["repository_id"] = "repo:other"
        self.assertIn("publish_repository", self.check(x))

    def test_publication_heads_match_target_refspecs(self):
        x = copy.deepcopy(self.cases["publish"])
        x["request"]["selection"]["expected_remote_heads"][0]["ref_name"] = "refs/heads/other"
        self.assertIn("publish_head_ref_set", self.check(x))

    def test_reconciliation_must_bind_actual_target(self):
        x = copy.deepcopy(self.cases["publish"])
        x["records"]["effect:publish"]["intended_target_ref"] = "target:other"
        self.assertIn("publish_effect_target", self.check(x))

    def test_receipt_not_echo_or_other_scope(self):
        x = copy.deepcopy(self.cases["history"])
        x["records"]["receipt:history"]["command_instance_id"] = "other"
        self.assertIn("receipt_command_instance_id", self.check(x))

    def test_terminal_receipt_not_before_request(self):
        x = copy.deepcopy(self.cases["history"])
        x["records"]["receipt:history"]["completed_at_utc"] = "2025-01-01T00:00:00Z"
        self.assertIn("receipt_before_request", self.check(x))

    def test_no_payload_bag_or_extra_command(self):
        x = copy.deepcopy(self.cases["diff"])
        x["request"]["selection"]["extra"] = {}
        self.assertTrue(self.check(x))

    def test_failure_result_keeps_original_selection(self):
        x = copy.deepcopy(self.cases["fetch"])
        x["result"]["owner_result"]["outcome"] = "failed"
        x["result"]["owner_result"]["effect_state"] = "no_effect"
        x["records"]["receipt:fetch"]["outcome"] = "failed"
        self.assertEqual(self.check(x), [])

    def test_history_selected_revision_is_not_current_revision(self):
        x = copy.deepcopy(self.cases["history"])
        selected = copy.deepcopy(x["request"]["authority"]["scope"]["expected_revision"])
        selected["commit_oid"] = "a" * 40
        x["request"]["selection"]["revision"] = selected
        x["result"]["selection"] = copy.deepcopy(x["request"]["selection"])
        x["records"][x["result"]["original_request_ref"]] = copy.deepcopy(x["request"])
        self.assertEqual(self.check(x), [])

    def test_final_review_original_mutation_reproduction(self):
        x=copy.deepcopy(self.cases['history'])
        def read(ref):
            if ref=='receipt:history':
                revision=copy.deepcopy(x['request']['authority']['scope']['expected_revision']);revision['commit_oid']='a'*40;x['request']['selection']['revision']=revision
            return copy.deepcopy(x['records'][ref])
        self.assertIn('selected_input_mutated',m.result_failures(x['request'],x['result'],resolve_record=read))

    def test_late_live_original_and_preview_mutation(self):
        for target in ('original','preview','source'):
            x=copy.deepcopy(self.cases['backend_select']);p=x['request']['preview_ref']
            ref={'original':x['result']['original_request_ref'],'preview':p,'source':x['records'][p]['native_disclosure_source_ref']}[target]
            def read(key):
                if key=='receipt:backend_select':x['records'][ref]['schema_version']='9.0.0'
                return x['records'][key]
            self.assertIn('selected_owner_record_mutated',m.result_failures(x['request'],x['result'],resolve_record=read),target)

    def test_result_mutation_during_resolution(self):
        x=copy.deepcopy(self.cases['history'])
        def read(ref):
            if ref=='receipt:history':x['result']['selection']['revision']=copy.deepcopy(x['request']['authority']['scope']['expected_revision'])
            return x['records'][ref]
        self.assertIn('selected_input_mutated',m.result_failures(x['request'],x['result'],resolve_record=read))

    def test_ref_bag_cannot_replace_typed_disclosure(self):
        for name in ('backend_select','workspace_remove'):
            x=copy.deepcopy(self.cases[name]);p=x['records'][x['request']['preview_ref']];p['native_disclosure']=None;p['native_disclosure_source_ref']=None
            self.assertIn('native_disclosure_required',self.check(x))

    def test_foreign_disclosure_source_identity(self):
        x=copy.deepcopy(self.cases['workspace_remove']);p=x['records'][x['request']['preview_ref']]
        x['records'][p['native_disclosure_source_ref']]['source_id']='foreign'
        self.assertIn('native_disclosure_source_source_id',self.check(x))

    def test_removal_changed_data_disposition_rejected(self):
        x=copy.deepcopy(self.cases['workspace_remove']);p=x['records'][x['request']['preview_ref']]
        p['native_disclosure']['data_effects'][0]['after']={'state':'absent','sha256':None}
        self.assertIn('native_disclosure_source_disclosure',self.check(x))

    def test_removal_disclosed_preserve_and_remove_without_default(self):
        for after in ({'state':'present','sha256':'a'*64},{'state':'absent','sha256':None}):
            x=copy.deepcopy(self.cases['workspace_remove']);p=x['records'][x['request']['preview_ref']]
            p['native_disclosure']['data_effects'][0]['after']=after
            x['records'][p['native_disclosure_source_ref']]['disclosure']=copy.deepcopy(p['native_disclosure'])
            self.assertEqual(self.check(x),[])

    def test_active_or_unresolved_removal_dependency_is_not_authority(self):
        for key,value,error in [('active_work_refs',['work:active'],'removal_active_dependency'),('dependencies',[{'owner_ref':'owner:backup','resource_ref':'resource:held','required_after_removal':True,'disposition_ref':None}],'removal_unresolved_dependency')]:
            x=copy.deepcopy(self.cases['workspace_remove']);p=x['records'][x['request']['preview_ref']];p['native_disclosure'][key]=value
            x['records'][p['native_disclosure_source_ref']]['disclosure']=copy.deepcopy(p['native_disclosure'])
            self.assertIn(error,self.check(x))

    def test_registration_only_adoption_is_separate_from_native_repair(self):
        x=copy.deepcopy(self.cases['backend_select']);p=x['records'][x['request']['preview_ref']];d=p['native_disclosure'];d['before_mapping']['registered']=False;d['registration_before']=False
        x['records'][p['native_disclosure_source_ref']]['disclosure']=copy.deepcopy(d)
        self.assertEqual(self.check(x),[])

    def test_unknown_data_cannot_be_claimed_complete(self):
        x=copy.deepcopy(self.cases['workspace_remove']);p=x['records'][x['request']['preview_ref']];d=p['native_disclosure'];d['data_effects'][0]['before']={'state':'unknown','sha256':None}
        x['records'][p['native_disclosure_source_ref']]['disclosure']=copy.deepcopy(d)
        self.assertIn('native_disclosure_unknown_content',self.check(x))


if __name__ == "__main__":
    unittest.main()
