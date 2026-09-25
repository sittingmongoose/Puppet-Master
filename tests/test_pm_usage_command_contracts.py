"""Static original-owner joins only; fixture adapters are synthetic."""
from copy import deepcopy
import hashlib
import json
from pathlib import Path
import sys
import unittest
from jsonschema import Draft202012Validator

ROOT = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(ROOT / "scripts"))
import pm_usage_command_semantics as m


class UsageCoreCommands(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        cls.pack = json.loads((ROOT / "Plans/usage_command_contract_fixtures.json").read_text())
    def value(self, refresh=False):
        return deepcopy(self.pack["valid"][int(refresh)]["value"])
    def check(self, v, **overrides):
        deps=m.fixture_dependencies(v);deps.update(overrides)
        return m.validate_usage_result("fixture:request", "fixture:result", "fixture:response", **deps)
    def repin(self, v, output=False):
        if output and v["result"]["output"] is not None:
            v["output_json"]=json.dumps(v["result"]["output"]["view"],separators=(",",":"))
            b=v["output_json"].encode()
            v["result"]["output"]["content_sha256"]=hashlib.sha256(b).hexdigest()
            v["result"]["output"]["byte_length"]=len(b)
        v["outcome"]["payload_sha256"]=m.owner_result_digest(v["request"])
        v["outcome"]["owner_result_sha256"]=m.owner_result_digest(v["result"])
    def test_schema_and_composed_positive_and_negative_fixtures(self):
        Draft202012Validator.check_schema(m.schemas()[0][m.SCHEMA])
        for row in self.pack["valid"]:
            self.assertEqual([],m.shape(row["definition"],row["value"]))
            self.assertEqual([],m.usage_command_semantic_failures(row["definition"],deepcopy(row["value"])))
        for row in self.pack["invalid"]:
            self.assertTrue(m.shape(row["definition"],row["value"]) or m.usage_command_semantic_failures(row["definition"],row["value"]),row["name"])
    def test_snapshot_scope_explicit_json_only(self):
        for row in self.pack["invalid"]:
            if not m.shape(row["definition"], row["value"]):
                self.assertIn("semantic_rule", row)
                self.assertIn(row["semantic_rule"], m.usage_command_semantic_failures(row["definition"], row["value"]))
        v=self.value();v["request"]["export_scope"]="snapshot"
        v["result"]["request"]=deepcopy(v["request"])
        v["result"]["output"]["view"]["export_scope"]="snapshot";self.repin(v,True)
        self.assertEqual([],self.check(v))
        for scope in (None,"record","bundle"):
            bad=deepcopy(v);bad["request"]["export_scope"]=scope
            self.assertTrue(m.shape("request",bad["request"]))
    def test_all_does_not_admit_foreign_project_rows(self):
        v=self.value();v["before"]["rows"][0]["project_id"]="project:foreign"
        self.assertIn("row_scope",self.check(v))
    def test_application_never_fabricates_project(self):
        v=self.value(True)
        for identity in (v["request"]["identity"],v["result"]["identity"],v["result"]["request"]["identity"],v["outcome"]["identity"],v["response"]["owner_identity"]):
            identity.update(scope_kind="application",project_id=None,project_home_server_id=None,named_plan_id=None)
        for query in (v["request"]["query"],v["result"]["request"]["query"],v["before"]["query"],v["result"]["projection"]["query"]):
            query.update(scope_kind="application",project_id=None)
        for projection in (v["before"],v["result"]["projection"]):projection["rows"]=[]
        self.repin(v);self.assertEqual([],self.check(v))
    def test_extra_filters_refuse_not_drop(self):
        v=self.value();v["request"]["query"]["additional_ledger_filters"]=[{"run_id":"run:other"}]
        self.assertTrue(self.check(v))
    def test_provider_handle_is_optional_without_fabrication(self):
        v=self.value(True)
        for projection in (v["before"],v["result"]["projection"]):
            projection["rows"][0]["provider_attempt_ref"]=None
        self.repin(v);self.assertEqual([],self.check(v))
    def test_quota_only_rows_outside_attempt_profile_are_refused(self):
        v=self.value(True)
        row=v["before"]["rows"][0]
        for field in ("attempt_id","run_id","model_id"):row[field]=None
        row["usage_event_refs"]=[]
        self.assertTrue(m.shape("projection",v["before"]))
        self.assertTrue(self.check(v))
    def test_cost_exact_integer_units_and_currency(self):
        for field,unit in (("cost_microdollars","microdollars"),("cost_minor_units","minor_units")):
            v=self.value(True);row=v["before"]["rows"][0];row["cost"]["cost_status"]="provider_reported"
            row["cost"][field].update(state="reported",value=7,unit=unit);row["cost"]["currency"]="USD"
            self.assertEqual([],m.projection_failures(v["before"]))
            row["cost"][field]["value"]=0.5
            self.assertIn("cost_unit_or_count",m.projection_failures(v["before"]))
            row["cost"][field].update(value=7,unit="tokens")
            self.assertIn("cost_unit_or_count",m.projection_failures(v["before"]))
        row["cost"][field].update(value=7,unit=unit);row["cost"]["currency"]=None
        self.assertIn("minor_units_currency_missing",m.projection_failures(v["before"]))
    def test_original_query_cannot_be_recomputed(self):
        v=self.value();v["request"]["query"]["owner_revision"]="later";v["result"]["request"]=deepcopy(v["request"]);self.repin(v)
        self.assertIn("original_projection_query",self.check(v))
    def test_bucket_cost_preserves_units_currency_and_suppression(self):
        v=self.value(True);cost=v["before"]["rows"][0]["cost"]
        amount={"state":"reported","value":13,"unit":"microdollars"}
        cost.update(cost_status="provider_reported",per_bucket_costs=[{"bucket":"input_total","amount":amount}])
        self.assertEqual([],m.projection_failures(v["before"]))
        for status in ("hidden_byok","hidden_subscription","unknown"):
            cost["cost_status"]=status
            self.assertIn("hidden_or_unknown_bucket_cost",m.projection_failures(v["before"]))
        cost["cost_status"]="provider_reported";amount["unit"]="tokens"
        self.assertIn("bucket_cost_unit_or_count",m.projection_failures(v["before"]))
        amount.update(unit="microdollars",value=0.5)
        self.assertIn("bucket_cost_unit_or_count",m.projection_failures(v["before"]))
        amount.update(unit="minor_units",value=13);cost["currency"]=None
        self.assertIn("minor_units_currency_missing",m.projection_failures(v["before"]))
        cost["currency"]="USD";self.assertEqual([],m.projection_failures(v["before"]))
    def test_query_scope_and_window_are_exact(self):
        for field,val in (("server_id","foreign"),("project_id","foreign"),("interval_end","2026-09-25T06:00:00Z")):
            v=self.value();v["request"]["query"][field]=val
            self.assertTrue(self.check(v))
        v=self.value();v["before"]["rows"][0]["observed_at_utc"]="2026-09-25T06:00:00Z"
        self.assertIn("row_interval",self.check(v))
    def test_provider_and_account_filter(self):
        for kind in ("provider","personal"):
            v=self.value();q=v["before"]["query"];q["filter_kind"]=kind
            q["provider_id"]="provider:other" if kind=="provider" else None
            self.assertIn("row_provider" if kind=="provider" else "row_account_scope",self.check(v))
    def test_every_original_caller_field_bound(self):
        for field in self.value()["request"]["caller"]:
            v=self.value();v["result"]["caller"][field]=2 if field=="continuation_generation" else "different:caller"
            self.repin(v);self.assertIn("result_original_caller",self.check(v))
    def test_ledger_refs_and_unknown_zero_preserved_in_actual_bytes(self):
        for mutate in (lambda r:r.update(usage_event_refs=["foreign:event"]),
                       lambda r:r["token_buckets"]["input_total"].update(state="reported",value=0,unit="tokens")):
            v=self.value();mutate(v["result"]["output"]["view"]["rows"][0]);self.repin(v,True)
            self.assertEqual([],m.shape("usage_command_fixture",v))
            self.assertIn("export_selection_or_rows",self.check(v))
    def test_output_bytes_must_match_actual_artifact(self):
        v=self.value();v["output_json"]="{}";self.assertIn("output_bytes_binding",self.check(v))
        v=self.value();v["output_json"]='{"x":1,"x":2}'
        self.assertTrue(self.check(v))
    def test_no_route_only_success(self):
        v=self.value();v["result"]["output"]=None;self.repin(v)
        self.assertIn("export_no_output",self.check(v))
        v=self.value(True);v["result"]["route_outcomes"]=[];self.repin(v)
        self.assertIn("refresh_route_selection",self.check(v))
    def test_missing_route_outcome_and_false_freshness(self):
        v=self.value(True);v["result"]["route_outcomes"][0]["status"]="failed"
        v["result"]["projection"].update(freshness="current",health="healthy");self.repin(v)
        self.assertIn("refresh_not_completed",self.check(v))
        self.assertIn("failed_refresh_claims_fresh_health",self.check(v))
    def test_no_event_or_cross_command_result(self):
        v=self.value();v["response"]["event_refs"]=["event:invented"]
        self.assertIn("response_event_refs",self.check(v))
        v=self.value();v["result"]["command_id"]="cmd.usage.refresh";self.repin(v)
        self.assertIn("result_original_command_id",self.check(v))
    def test_native_proofs_mandatory_nonboolean_and_fail_closed(self):
        for name in ("verify_original_admission","verify_permission","verify_sources","verify_delivery","check_current_disclosure"):
            v=self.value();self.assertTrue(self.check(v,**{name:lambda *a:True}))
            self.assertTrue(self.check(v,**{name:lambda *a:["refused"]}))
            deps=m.fixture_dependencies(v);deps.pop(name)
            with self.assertRaises(TypeError):m.validate_usage_result("fixture:request","fixture:result","fixture:response",**deps)
    def test_mutating_resolver_and_late_proof_refuse(self):
        v=self.value();base=m.fixture_dependencies(v)["resolve_record"]
        def resolver(kind,ref):
            if kind=="result":v["request"]["caller"]["caller_revision"]="mutated"
            return base(kind,ref)
        self.assertIn("helper_changed_original",self.check(v,resolve_record=resolver))
        v=self.value()
        def late(*args):v["before"]["rows"][0]["source_confidence"]="mutated";return []
        self.assertIn("helper_changed_original",self.check(v,check_current_disclosure=late))
    def test_replay_requires_actual_original_response(self):
        v=self.value();v["response"].update(replayed=True,original_dispatch_id="dispatch:original")
        self.assertTrue(self.check(v))
        original=deepcopy(v["response"]);original.update(replayed=False,original_dispatch_id=None,dispatch_id="dispatch:original")
        base=m.fixture_dependencies(v)["resolve_record"]
        def resolver(kind,ref):return original if kind=="response" and ref=="dispatch:original" else base(kind,ref)
        self.assertEqual([],self.check(v,resolve_record=resolver))
        original["owner_result_ref"]="different:result"
        self.assertIn("replay_changed_original_result_identity",self.check(v,resolve_record=resolver))
    def test_outcome_and_response_cannot_substitute_original_scope(self):
        v=self.value();v["outcome"]["identity"]["project_id"]="foreign"
        self.assertIn("outcome_request",self.check(v))
        v=self.value();v["response"]["owner_result_schema_ref"]["json_pointer"]="#/$defs/usage_refresh_result"
        self.assertIn("response_owner_result_schema_ref",self.check(v))
    def test_actual_cancelled_and_failed_refresh_not_success(self):
        for status in ("cancelled","failed"):
            v=self.value(True);v["result"]["status"]=status
            v["result"]["projection"]=deepcopy(v["before"])
            v["result"]["route_outcomes"][0]["status"]=status
            v["outcome"]["outcome"]=status;v["response"]["result_status"]=status
            if status=="failed":
                v["result"]["error_ref"]="error:refresh";v["outcome"]["error_ref"]="error:refresh"
                v["outcome"]["result_receipt_ref"]=None;v["response"]["receipt_ref"]=None
                v["response"]["error"]={"code":"internal_error","reason":"Owner read failed","offending_field":None}
            self.repin(v);self.assertEqual([],self.check(v))
    def test_canonical_digest_adapter_cannot_be_boolean(self):
        v=self.value();self.assertTrue(self.check(v,canonical_owner_digest=lambda value:True))


if __name__=="__main__":unittest.main()
