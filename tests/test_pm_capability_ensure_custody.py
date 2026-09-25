"""Explicit synthetic owner adapters; no installation, permission or storage proof."""
from copy import deepcopy
import json
import os
from pathlib import Path
import sys
import subprocess
import unittest
from jsonschema import Draft202012Validator

STAGE = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(STAGE / "scripts"))
import pm_capability_ensure_custody as m
from pm_capability_custody_storage import registry_candidate, storage_bundle
import pm_capability_continuation_semantics as cp


def dependencies(v):
    return m.fixture_dependencies(v)

class CapabilityEnsureCustody(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        cls.pack = json.loads((STAGE / "Plans/capability_ensure_custody_contract_fixtures.json").read_text())
    def fixture(self, index=0):
        return deepcopy(self.pack["valid"][index]["value"])
    def check(self, value, **overrides):
        deps = dependencies(value); deps.update(overrides)
        return m.validate_ensure_result("result:ensure", **deps)
    def repin(self, v):
        v["result"]["operation_record"] = m.binding(m.OwnerValue("operation:1",1,v["operation"]))
        v["outcome"]["owner_result_sha256"] = m.digest(v["result"])
    def test_schema_and_actual_cp004_composition_positives(self):
        Draft202012Validator.check_schema(m.schemas()[0][m.SCHEMA_FILE])
        for row in self.pack["valid"]:
            with self.subTest(row=row["name"]):
                self.assertEqual([], m.shape("capability_ensure_fixture", row["value"]))
                self.assertEqual([], m.capability_ensure_semantic_failures("capability_ensure_fixture", deepcopy(row["value"])))
                self.assertEqual([], self.check(deepcopy(row["value"])))
        for row in self.pack["invalid"]:
            self.assertTrue(m.shape(row["definition"], row["value"]), row["name"])
    def test_application_null_project_and_actual_server(self):
        self.assertEqual([], self.check(self.fixture()))
    def test_shared_work_scope_is_original_not_waiter_scope(self):
        for field in ("project_id", "project_home_server_id", "named_plan_id"):
            v=self.fixture(2);v["work"]["identity"][field]="other:scope"
            v["result"]["work_record"]=m.binding(m.OwnerValue("work:1",1,v["work"]))
            self.repin(v)
            self.assertEqual([],m.shape("capability_ensure_fixture",v))
            self.assertIn("shared_work_identity",self.check(v))
        v=self.fixture(3)
        v["work"]["identity"]["project_id"]="project:shared-origin"
        v["operation"]["work_identity"]=deepcopy(v["work"]["identity"])
        v["result"]["work_record"]=m.binding(m.OwnerValue("work:1",1,v["work"]))
        self.repin(v)
        seen=[]
        def original_shared(ar,work):
            seen.append((ar.value["work_identity"],work.value["identity"]))
            return []
        self.assertEqual([],self.check(v,verify_coalescing=original_shared))
        self.assertEqual(1,len(seen))
    def test_request_exact_original_lineage(self):
        for field in ("plan_id","run_id","agent_id","crew_id","goal_id","thread_id","source_location_id"):
            v=self.fixture(3);v["request"][field]="other:lineage"
            bound=m.binding(m.OwnerValue("request:ensure",1,v["request"]))
            v["result"]["request"]=bound
            entry=v["operation"]["origins"][0]
            entry["request"]=bound;entry["permission"]["request"]=bound
            v["outcome"]["payload_sha256"]=m.digest(v["request"])
            self.repin(v)
            self.assertEqual([],m.shape("capability_ensure_fixture",v))
            self.assertIn("request_lineage_"+field,self.check(v))
            self.assertIn("request_lineage_"+field,m.capability_ensure_semantic_failures("capability_ensure_fixture",v))
    def test_application_null_project_and_actual_server_shape(self):
        v = self.fixture()
        self.assertIsNone(v["request"]["project_id"])
        self.assertIsNone(v["request"]["permission_snapshot_ref"])
        for field, value in (("project_id", "fake:project"), ("server_id", None)):
            bad = deepcopy(v); bad["request"][field] = value
            self.assertTrue(m.shape("capability_ensure_request_v2", bad["request"]))
        old = deepcopy(v["request"]); old["schema_id"]="pm.shared_runtime.command_request.v1";old["schema_version"]="1.0.0"
        self.assertTrue(m.shape("capability_ensure_request",old,"shared_runtime_command_contracts.schema.json"))
    def test_off_ready_connection_has_no_installation_effect(self):
        v = self.fixture()
        self.assertEqual([], self.check(v))
        self.assertEqual("Connection", v["operation"]["origins"][0]["readiness"]["subject"]["kind"])
        self.assertIsNone(v["effect"])
        bad = self.fixture(1)
        bad["operation"]["origins"][0]["waiter"]["effective_mode"]="Off"
        self.repin(bad)
        self.assertIn("off_new_provisioning",self.check(bad))
    def test_no_boolean_or_missing_owner_proofs(self):
        v=self.fixture()
        for name in ("verify_original_admission","verify_permission_issuer","verify_coalescing",
                     "validate_continuation","verify_effect_owner","check_current_disclosure"):
            self.assertTrue(self.check(v, **{name:lambda *a:True}))
            self.assertTrue(self.check(v, **{name:lambda *a:["owner_refused"]}))
            deps=dependencies(v);deps.pop(name)
            with self.assertRaises(TypeError):m.validate_ensure_result("result:ensure",**deps)
    def test_public_actual_request_outcome_and_work_joins(self):
        for target, field, value, error in (
            ("result","command_instance_id","other:command","result_command_instance"),
            ("result","outcome","succeeded","success_vs_already_ready"),
            ("outcome","idempotency_key","other:idem","outcome_idempotency"),
            ("outcome","payload_sha256","0"*64,"outcome_request_digest"),
            ("outcome","outcome","failed","command_outcome_status"),
            ("work","work_state","failed","work_not_completed")):
            v=self.fixture();v[target][field]=value
            if target=="work":v["work"]["error_ref"]="error:fixture"
            if target=="outcome" and field=="outcome":v["outcome"]["error_ref"]="error:fixture"
            if target=="result":self.repin(v)
            with self.subTest(field=field):self.assertIn(error,self.check(v))
    def test_permissions_exact_actor_scope_request_and_audit(self):
        for field,value,error in (("actor_ref","actor:other","permission_actor"),
                                  ("decision","deny","permission_not_allowed"),
                                  ("audit",None,"permission_audit_missing")):
            v=self.fixture();v["operation"]["origins"][0]["permission"][field]=value;self.repin(v)
            self.assertIn(error,self.check(v))
        v=self.fixture();v["operation"]["origins"][0]["permission"]["expires_at_utc"]="2026-09-25T11:00:00Z";self.repin(v)
        self.assertIn("permission_validity_interval",self.check(v))
        self.assertIn("permission_issuer:expired_at_original_effect",self.check(self.fixture(),
            verify_permission_issuer=lambda *a:["expired_at_original_effect"]))
    def test_application_installation_uses_genuine_lifecycle_successor(self):
        v=self.fixture(1)
        self.assertEqual([],self.check(v))
        self.assertIsNone(v["effect"]["permission_snapshot_id"])
        self.assertEqual("capability_operation_decision",v["effect"]["permission_authority_kind"])
        for field,value,error in (("phase","failed","lifecycle_not_ready"),
                                  ("permission_snapshot_id","snapshot:fake","lifecycle_fake_application_snapshot"),
                                  ("to_installation_ref","installation:other","lifecycle_verified_subject")):
            bad=deepcopy(v);bad["effect"][field]=value
            ready=bad["operation"]["origins"][0]["readiness"]
            ready["effect_result"]=m.binding(m.OwnerValue("effect:fixture",1,bad["effect"]))
            self.repin(bad)
            self.assertIn(error,self.check(bad))
    def test_originals_cannot_be_rewritten_by_late_resolver(self):
        v=self.fixture();deps=dependencies(v);original=deps["resolve_record"]
        def mutate(kind,ref):
            result=original(kind,ref)
            if kind=="work":v["result"]["receipt_refs"].append("receipt:injected")
            return result
        self.assertIn("original_changed_by_helper",self.check(v,resolve_record=mutate))
    def test_stale_continuation_is_not_success(self):
        v=self.fixture()
        e=v["operation"]["origins"][0]
        e["settlement"].update(outcome="resumed",reason=None,continuation_result_ref="continuation-result:1")
        self.repin(v)
        self.assertIn("continuation:capability_stale_continuation",self.check(v))
    def test_same_family_row_local_writer_preserves_all_unrelated_rows(self):
        old=json.loads(subprocess.check_output(["git", "-C", str(m.CANON), "show",
            "35c47d751ac87c7467818864ea270785fb537d32:Plans/storage_value_registry.json"], text=True))
        new=registry_candidate(old)
        current=json.loads((m.CANON/"Plans/storage_value_registry.json").read_text())
        self.assertEqual(new["families"], current["families"])
        self.assertEqual(new["retention_policies"], current["retention_policies"])
        self.assertEqual(next(r for r in new["contract_family_dispositions"] if r["disposition_id"] == "scd.capability.continuation_custody.v1"),
                         next(r for r in current["contract_family_dispositions"] if r["disposition_id"] == "scd.capability.continuation_custody.v1"))
        families={"capability_provisioning_operation","installation_lifecycle_record"}
        self.assertEqual(len(old["families"]),len(new["families"]))
        self.assertEqual(old["retention_policies"],new["retention_policies"])
        for before,after in zip(old["families"],new["families"]):
            if before["family_id"] not in families:self.assertEqual(before,after)
            else:
                for field in ("producer","consumers","retention_policy_ref","retention_compaction",
                              "recovery_disposition","restore_disposition","redaction_no_secret_rule"):
                    self.assertEqual(before[field],after[field])
                Draft202012Validator.check_schema(after["value_schema"])
        for before,after in zip(old["contract_family_dispositions"],new["contract_family_dispositions"]):
            if before["disposition_id"]!="scd.capability.continuation_custody.v1":self.assertEqual(before,after)
        with self.assertRaises(ValueError):registry_candidate(new)
    def test_strict_writer_does_not_fabricate_historical_values(self):
        v=self.fixture()
        self.assertTrue(m.shape("capability_provisioning_operation_current_write",v["operation"]["operation"]))
        self.assertEqual([],m.shape("capability_provisioning_operation_historical_reader",v["operation"]["operation"]))
        self.assertFalse(list(Draft202012Validator(storage_bundle("capability_provisioning_operation_v2")).iter_errors(v["operation"])))
        self.assertFalse(list(Draft202012Validator(storage_bundle("installation_lifecycle_record_v2")).iter_errors(self.fixture(1)["effect"])))
        legacy=deepcopy(self.fixture(1)["effect"])
        for field in ("permission_authority_kind","capability_admission","capability_permission_decision","capability_admission_value"):legacy.pop(field)
        legacy.update(schema_id="pm.shared_runtime.installation_lifecycle_record.v1",schema_version="1.0.0",permission_snapshot_id="actual:attempt")
        self.assertEqual([],m.shape("installation_lifecycle_record_historical_reader",legacy))
        self.assertTrue(m.shape("installation_lifecycle_record_current_write",legacy))
    def test_six_runtime_kinds_have_exact_storage_dispositions(self):
        registry=json.loads((m.CANON/"Plans/storage_value_registry.json").read_text())
        schema=json.loads((m.CANON/"Plans/storage_value_registry.schema.json").read_text())
        self.assertEqual([],list(Draft202012Validator(schema).iter_errors(registry)))
        expected={
            "ensure_transport": ({"pm.shared_runtime.capability_ensure_request.v2", "pm.shared_runtime.capability_ensure_result.v2"}, None),
            "operation_custody": ({"pm.shared_runtime.capability_provisioning_operation.v2", "pm.permissions.capability_operation_decision.v1"}, "capability_provisioning_operation"),
            "lifecycle_custody": ({"pm.shared_runtime.installation_lifecycle_record.v2", "pm.shared_runtime.capability_lifecycle_admission.v1"}, "installation_lifecycle_record"),
        }
        for suffix,(kinds,family) in expected.items():
            rows=[r for r in registry["contract_family_dispositions"] if r["disposition_id"]=="scd.capability."+suffix+".v1"]
            self.assertEqual(1,len(rows))
            row=rows[0]
            self.assertEqual(kinds,set(row["record_kinds"]))
            self.assertFalse(row["runtime_evidence"])
            self.assertEqual("materialized_existing_family" if family else "not_applicable_nonpersisted",row["physical_family_status"])
            self.assertEqual(["Plans/storage_value_registry.json#/families/"+family] if family else [],row["existing_family_refs"])
            self.assertEqual(["RP-RUNTIME-365D"] if family else [],row["retention_disposition"]["refs"])
    def test_current_writer_requires_actual_owner_admission(self):
        v=self.fixture();deps=dependencies(v)
        self.assertEqual([],m.validate_current_write("operation:1",resolve_record=deps["resolve_record"],verify_writer_admission=lambda *a:[]))
        self.assertTrue(m.validate_current_write("operation:1",resolve_record=deps["resolve_record"],verify_writer_admission=lambda *a:["store_read_only"]))
        v["operation"]["origins"].append(deepcopy(v["operation"]["origins"][0]))
        self.assertIn("duplicate_origin",m.operation_relationships(v["operation"]))

    def test_original_accepted_is_pending_not_ready(self):
        v=self.fixture();e=v["operation"]["origins"][0]
        e.update(permission=None,readiness=None,currentness=None,settlement=None)
        v["operation"]["operation"].update(phase="requested",terminal_at_utc=None)
        v["work"].update(work_state="accepted",result_receipt_ref=None)
        v["result"].update(outcome="accepted",readiness_ref=None,settlement_ref=None,
                           terminal_owner_result_ref=None,receipt_refs=[])
        v["result"]["work_record"]=m.binding(m.OwnerValue("work:1",1,v["work"]))
        v["outcome"].update(outcome="accepted",result_receipt_ref=None)
        self.repin(v)
        self.assertEqual([],self.check(v))
        v["result"]["terminal_owner_result_ref"]="ready:forged";self.repin(v)
        self.assertIn("accepted_claims_terminal",self.check(v))

    def test_failure_cancel_recovery_and_successful_rollback_keep_terminal_truth(self):
        for status, phase, outcome, work in (("blocked","blocked","rejected","failed"),
                ("failed","failed","failed","failed"),("failed","rolled_back","failed","failed"),
                ("cancelled","cancelled","cancelled","cancelled"),
                ("recovery_required","recovery_required","terminal_unknown","recovery-required")):
            v=self.fixture();e=v["operation"]["origins"][0];e["readiness"]=None
            e["settlement"].update(readiness_result_ref=None,outcome=status,reason="operation_not_ready")
            v["operation"]["operation"].update(phase=phase,reason_code="fixture_failure")
            if status=="blocked":e["permission"]["decision"]="deny"
            v["work"].update(work_state=work,error_ref="error:fixture",result_receipt_ref="settlement:1")
            v["result"].update(outcome=status,readiness_ref=None,terminal_owner_result_ref="settlement:1",
                               receipt_refs=["settlement:1"],disabled_reason="policy_denied")
            v["result"]["work_record"]=m.binding(m.OwnerValue("work:1",1,v["work"]))
            v["outcome"].update(outcome=outcome,error_ref="error:fixture",result_receipt_ref="settlement:1")
            self.repin(v)
            with self.subTest(status=status,phase=phase):self.assertEqual([],self.check(v))

    def test_replay_retains_original_operation_and_current_disclosure(self):
        v=self.fixture();original=deepcopy(v)
        response=deepcopy(v["result"]);response.update(replayed=True,original_operation_id="provision:1")
        self.assertEqual([],m.validate_ensure_response(response,"result:ensure",**dependencies(v)))
        self.assertEqual(original,v)  # actual outcome/hash remains untouched
        deps=dependencies(v);deps["check_current_disclosure"]=lambda *a:["revoked_read"]
        self.assertTrue(m.validate_ensure_response(response,"result:ensure",**deps))
        response["original_operation_id"]="provision:other"
        self.assertIn("response_rewrites_original",m.validate_ensure_response(response,"result:ensure",**dependencies(v)))

    def test_existing_lifecycle_callers_keep_actual_snapshot_branch(self):
        current=deepcopy(self.fixture(1)["effect"])
        current.update(permission_authority_kind="attempt_snapshot",permission_snapshot_id="actual:attempt",
            capability_admission=None,capability_admission_value=None,capability_permission_decision=None,
            provider_cli=True,acquisition_basis="explicit_user_acquisition")
        self.assertEqual([],m.shape("installation_lifecycle_record_current_write",current))
        current["permission_snapshot_id"]=None
        self.assertTrue(m.shape("installation_lifecycle_record_current_write",current))


if __name__=="__main__":unittest.main()
