"""Exact installed quota pair/public binding protocol; not native proof."""
import importlib.util
import json
import os
from pathlib import Path
import sys
import unittest
from jsonschema import Draft202012Validator
ROOT=Path(os.environ.get("PM_CANON_ROOT",Path(__file__).resolve().parents[1]))
sys.path.insert(0,str(ROOT/"scripts"))
spec=importlib.util.spec_from_file_location("quota_integrated_gate",ROOT/"scripts/pm-new-contracts-verify.py")
gate=importlib.util.module_from_spec(spec);sys.modules[spec.name]=gate;spec.loader.exec_module(gate)
SCHEMA="Plans/usage_quota_command_contracts.schema.json"
FIXTURE="Plans/usage_quota_command_fixtures.json"
class QuotaIntegration(unittest.TestCase):
 def test_quota_disposition_id_and_runtime_versions_are_independent(self):
  registry=json.loads((ROOT/"Plans/storage_value_registry.json").read_text())
  schema=json.loads((ROOT/"Plans/storage_value_registry.schema.json").read_text())
  Draft202012Validator(schema).validate(registry)
  rows=registry["contract_family_dispositions"]
  self.assertEqual(len({row["disposition_id"] for row in rows}),len(rows))
  usage={row["disposition_id"]:row for row in rows if row["system_id"]=="usage"}
  self.assertEqual(usage["scd.usage.command_transport.v1"]["record_kinds"],
                   ["pm.usage.command_request.v1","pm.usage.command_result.v1"])
  quota=usage["scd.usage.quota_command_transport.v1"]
  self.assertEqual(quota["record_kinds"],
                   ["pm.usage.command_request.v2","pm.usage.command_result.v2"])
  self.assertEqual(quota["schema_ref"],SCHEMA)
  self.assertEqual(quota["persistence_disposition"],"request_or_preview_nonpersisted")
  self.assertEqual(quota["physical_family_status"],"not_applicable_nonpersisted")
  self.assertFalse(quota["runtime_evidence"])
 def test_installed_pair_and_actual_record_dispatch(self):
  self.assertEqual(gate.CONTRACT_PAIRS.count((SCHEMA,FIXTURE)),1)
  fixtures=json.loads((ROOT/FIXTURE).read_text())
  for f in fixtures["valid"]+fixtures["invalid"]:
   failures=gate.contract_semantic_failures(SCHEMA,f["definition"],f["value"])
   if "semantic_rule" in f:self.assertIn(f["semantic_rule"],failures)
   else:self.assertEqual(failures,[])
   self.assertEqual(gate.contract_semantic_failures(SCHEMA,"result",f["value"]["result"]),[])
 def test_exact_two_current_public_refs(self):
  rows=json.loads((ROOT/"Plans/Wiring_Matrix.production.json").read_text())["entries"]
  for action in ("refresh","export"):
   row=rows["catalog.usage_"+action]
   self.assertEqual(row["request_schema_ref"],SCHEMA+"#/$defs/usage_"+action+"_request")
   self.assertEqual(row["result_schema_ref"],SCHEMA+"#/$defs/usage_"+action+"_result")
   self.assertEqual(row["expected_event_types"],[])
if __name__=="__main__":unittest.main()
