import copy
import json
import subprocess
import sys
import unittest
from collections import Counter
from pathlib import Path

from jsonschema import Draft202012Validator


ROOT = Path(__file__).resolve().parents[1]
PLANS = ROOT / "Plans"
MATERIALIZED_FAMILY_IDS = (
    "runtime_topology_projection",
    "installation_lifecycle_record",
    "environment_connection_state",
    "environment_domain_sync_state",
    "runtime_resource_admission",
    "observable_work_projection",
    "operational_awareness_projection",
    "prompt_runtime_projection",
    "permission_snapshot_record",
    "provider_dispatch_admission_receipt",
    "installation_inventory_record",
    "capability_provisioning_operation",
    "conditional_rule_record",
    "conditional_rule_intervention_receipt",
    "runtime_resource_lease",
    "bsd_runtime_record",
    "dev_session_record",
    "eval_session_record",
    "thread_command_outbox_record",
    "replay_snapshot_checkpoint",
    "stream_coalescing_record",
    "thread_shell_projection",
    "pinned_summary_projection",
    "thread_detail_projection",
    "mcp_server_lifecycle_record",
    "operational_attribution_record",
    "goal_runtime_lineage_record",
)
RUNTIME_DISPOSITION_COUNTS = Counter(
    {
        "return_named_owner": 84,
        "adapt_existing_owner": 52,
        "adopt_here": 21,
        "already_covered_with_evidence": 6,
    }
)
RECLASSIFIED_ALREADY_COVERED_IDS = {
    "CTX-001",
    "PRM-001",
    "PRM-002",
    "PRM-004",
    "PRM-006",
    "ONB-001",
    "PROC-001",
    "PROC-002",
    "PROC-009",
    "PROC-010",
}


def load_json(path: Path) -> dict:
    return json.loads(path.read_text(encoding="utf-8"))


class SharedRuntimeStorageContractsTest(unittest.TestCase):
    @classmethod
    def setUpClass(cls) -> None:
        cls.shared = load_json(PLANS / "shared_runtime_contracts.schema.json")
        cls.goal_lineage = load_json(PLANS / "goal_runtime_lineage.schema.json")
        cls.registry = load_json(PLANS / "storage_value_registry.json")
        cls.registry_schema = load_json(PLANS / "storage_value_registry.schema.json")
        cls.disposition = load_json(PLANS / "runtime_integration_disposition.json")
        cls.rows_by_id = {
            row["family_id"]: row for row in cls.registry["families"]
        }
        cls.inline_schemas = {
            family_id: cls.rows_by_id[family_id]["value_schema"]
            for family_id in MATERIALIZED_FAMILY_IDS
        }

    @staticmethod
    def permission_snapshot() -> dict:
        return {
            "schema_id": "pm.storage_value.permission_snapshot_record.v1",
            "schema_version": "1.0.0",
            "project_id": "project-1",
            "snapshot_id": "snapshot-1",
            "attempt_id": "attempt-1",
            "node_id": "node-1",
            "run_id": None,
            "blocked_sequence": None,
            "captured_at_utc": "2026-08-13T00:00:00Z",
            "approval_scope_key": None,
            "approval_target_ref": None,
            "requested_account_binding": None,
            "effective_account_binding": None,
            "account_switch_event_ref": None,
            "permission_decision_context": {
                "decision_context_ref": None,
                "mode_override": None,
                "preflight_snapshot_ref": None,
                "policy_source_ref": None,
            },
            "actor_surface_context": {
                "actor_kind": "system",
                "execution_role": None,
                "surface_id": None,
                "surface_route": None,
                "project_id": None,
                "thread_id": None,
                "run_id": None,
            },
            "runtime_identity_context": {
                "requested_platform": "local",
                "effective_platform": "local",
                "provider_family_id": None,
                "requested_runtime_identity": None,
                "effective_runtime_identity": None,
                "host_ref": None,
                "transport_host_ref": None,
                "upstream_provider_ref": None,
                "repo_id": None,
                "worktree_id": None,
            },
            "resolved_permissions": {
                "filesystem.read": {
                    "requested_permission_state": "allow",
                    "effective_permission_state": "allow",
                    "downgrade_reason": None,
                    "resolution": "allow",
                    "source": "preset",
                    "effective_value": True,
                }
            },
            "source_event_ref": "event:permission-snapshot-1",
            "redaction_profile": "default",
            "integrity_sha256": "a" * 64,
            "integrity_ref": "integrity:permission-snapshot-1",
        }

    @staticmethod
    def dispatch_receipt() -> dict:
        return {
            "schema_id": "pm.shared_runtime.provider_dispatch_admission_receipt.v1",
            "schema_version": "1.0.0",
            "receipt_id": "receipt-1",
            "operation_id": "operation-1",
            "attempt_id": "attempt-1",
            "provider_request_attempt_id": "provider-attempt-1",
            "final_request_sha256": "b" * 64,
            "prompt_capsule_ref": "prompt-capsule:1",
            "structured_attachment_manifest_sha256": "c" * 64,
            "structured_attachment_manifest_ref": "attachment-manifest:1",
            "packet_admission_decision_ref": "packet-admission:1",
            "runtime_resource_admission_ref": "resource-admission:1",
            "context_epoch": 0,
            "route_ref": "route:1",
            "model_ref": "model:1",
            "requested_account_ref": None,
            "effective_account_ref": None,
            "project_id": "project-1",
            "thread_id": None,
            "goal_id": None,
            "run_id": None,
            "node_id": None,
            "agent_id": None,
            "execution_host_id": None,
            "execution_environment_id": None,
            "permission_snapshot_id": "snapshot-1",
            "filesafe_receipt_refs": [],
            "mutation_capable": False,
            "policy_generation_refs": [],
            "topology_generation": 0,
            "issued_at_utc": "2026-08-13T00:00:00Z",
            "expires_at_utc": "2026-08-13T00:05:00Z",
            "single_use": True,
            "consumed_at_utc": None,
            "consumption_evidence_ref": None,
            "issuer_service": "ProviderDispatchAdmissionService",
            "network_transmission_allowed": True,
        }

    def assert_rejected(self, family_id: str, instance: dict) -> None:
        errors = list(
            Draft202012Validator(self.inline_schemas[family_id]).iter_errors(instance)
        )
        self.assertTrue(errors, f"{family_id} unexpectedly accepted {instance!r}")

    def test_shared_schema_and_storage_registry_are_draft_2020_12_valid(self) -> None:
        draft_uri = "https://json-schema.org/draft/2020-12/schema"
        self.assertEqual(self.shared["$schema"], draft_uri)
        self.assertEqual(self.registry_schema["$schema"], draft_uri)
        Draft202012Validator.check_schema(self.shared)
        Draft202012Validator.check_schema(self.registry_schema)
        Draft202012Validator(self.registry_schema).validate(self.registry)
        for schema in self.inline_schemas.values():
            self.assertEqual(schema["$schema"], draft_uri)
            Draft202012Validator.check_schema(schema)

    def test_registry_has_exact_family_and_status_counts(self) -> None:
        self.assertEqual(len(self.registry["families"]), 84)
        self.assertEqual(
            Counter(row["status"] for row in self.registry["families"]),
            Counter(
                {
                    "materialized": 66,
                    "deferred_not_build_blocking": 17,
                    "compatibility_alias": 1,
                }
            ),
        )

    def test_closed_shared_runtime_families_are_materialized_exactly_once(self) -> None:
        for family_id in MATERIALIZED_FAMILY_IDS:
            with self.subTest(family_id=family_id):
                matches = [
                    row
                    for row in self.registry["families"]
                    if row["family_id"] == family_id
                    and row["status"] == "materialized"
                ]
                self.assertEqual(len(matches), 1)

    def test_inline_schemas_equal_owner_definitions_and_primitive_dependencies(self) -> None:
        for family_id in MATERIALIZED_FAMILY_IDS:
            with self.subTest(family_id=family_id):
                row = self.rows_by_id[family_id]
                schema_path, fragment = row["value_schema_ref"].split("#/$defs/", 1)
                owner_schema = load_json(ROOT / schema_path)
                inline = copy.deepcopy(self.inline_schemas[family_id])
                inline_defs = inline.pop("$defs")
                inline.pop("$schema")
                inline.pop("$id")
                self.assertEqual(inline, owner_schema["$defs"][fragment])
                self.assertTrue(inline_defs)
                for name, definition in inline_defs.items():
                    self.assertEqual(definition, owner_schema["$defs"][name])

    def test_minimal_permission_snapshot_and_dispatch_receipt_are_valid(self) -> None:
        Draft202012Validator(
            self.inline_schemas["permission_snapshot_record"]
        ).validate(self.permission_snapshot())
        Draft202012Validator(
            self.inline_schemas["provider_dispatch_admission_receipt"]
        ).validate(self.dispatch_receipt())

    def test_missing_required_and_extra_keys_are_rejected(self) -> None:
        cases = (
            ("permission_snapshot_record", self.permission_snapshot(), "snapshot_id"),
            (
                "provider_dispatch_admission_receipt",
                self.dispatch_receipt(),
                "receipt_id",
            ),
        )
        for family_id, valid, required_key in cases:
            with self.subTest(family_id=family_id, mutation="missing_required"):
                missing = copy.deepcopy(valid)
                missing.pop(required_key)
                self.assert_rejected(family_id, missing)
            with self.subTest(family_id=family_id, mutation="extra_key"):
                extra = copy.deepcopy(valid)
                extra["unexpected"] = True
                self.assert_rejected(family_id, extra)

    def test_dispatch_rejects_mutation_without_filesafe_receipts(self) -> None:
        invalid = self.dispatch_receipt()
        invalid["mutation_capable"] = True
        invalid["filesafe_receipt_refs"] = []
        self.assert_rejected("provider_dispatch_admission_receipt", invalid)

    def test_dispatch_rejects_consumption_without_evidence(self) -> None:
        invalid = self.dispatch_receipt()
        invalid["consumed_at_utc"] = "2026-08-13T00:01:00Z"
        invalid["consumption_evidence_ref"] = None
        self.assert_rejected("provider_dispatch_admission_receipt", invalid)

    def test_raw_secret_and_request_bytes_fields_are_rejected(self) -> None:
        cases = (
            ("permission_snapshot_record", self.permission_snapshot(), "raw_secret"),
            (
                "provider_dispatch_admission_receipt",
                self.dispatch_receipt(),
                "raw_request_bytes",
            ),
        )
        for family_id, valid, forbidden_key in cases:
            with self.subTest(family_id=family_id, forbidden_key=forbidden_key):
                invalid = copy.deepcopy(valid)
                invalid[forbidden_key] = "forbidden-raw-value"
                self.assert_rejected(family_id, invalid)

    def test_provider_request_permit_is_not_a_storage_family(self) -> None:
        normalized_ids = {
            "".join(character for character in row["family_id"].casefold() if character.isalnum())
            for row in self.registry["families"]
        }
        self.assertNotIn("providerrequestpermit", normalized_ids)

    def test_dev_session_key_is_split_from_deferred_tooling_group(self) -> None:
        grouped = self.rows_by_id["tooling_skill_debug_families"]["key_shape"]
        self.assertNotIn("dev_session_record.v1", grouped)
        self.assertEqual(
            self.rows_by_id["dev_session_record"]["key_shape"],
            "dev_session_record.v1:{project_id}:{dev_session_id}",
        )

    def test_materializer_check_is_current(self) -> None:
        proc = subprocess.run(
            [
                sys.executable,
                "scripts/pm-shared-runtime-storage-materialize.py",
                "check",
            ],
            cwd=ROOT,
            text=True,
            stdout=subprocess.PIPE,
            stderr=subprocess.PIPE,
            check=False,
        )
        self.assertEqual(proc.returncode, 0, proc.stdout + proc.stderr)
        self.assertIn("shared_runtime_storage_materialization_current", proc.stdout)

    def test_shared_runtime_semantic_validator_self_test_passes(self) -> None:
        proc = subprocess.run(
            [
                sys.executable,
                "scripts/pm-shared-runtime-contracts.py",
                "--self-test",
            ],
            cwd=ROOT,
            text=True,
            stdout=subprocess.PIPE,
            stderr=subprocess.PIPE,
            check=False,
        )
        self.assertEqual(proc.returncode, 0, proc.stdout + proc.stderr)
        report = json.loads(proc.stdout)
        self.assertEqual(report["status"], "pass")
        self.assertEqual(report["failures"], [])

    def test_runtime_disposition_register_is_exact_and_fail_closed(self) -> None:
        items = self.disposition["items"]
        self.assertEqual(len(items), 163)
        self.assertEqual(len({row["item_id"] for row in items}), 163)
        self.assertEqual(Counter(row["disposition"] for row in items), RUNTIME_DISPOSITION_COUNTS)
        self.assertEqual(
            Counter(row["implementation_status"] for row in items),
            Counter({"not_started": 163}),
        )
        self.assertEqual(
            self.disposition["validation_summary"]["native_runtime_proof_rows"],
            0,
        )
        self.assertEqual(self.disposition["closure_audit"]["unresolved_non_pnc_canon_defects"], 0)
        self.assertEqual(self.disposition["closure_audit"]["product_decisions_required"], 0)

    def test_runtime_disposition_owner_and_evidence_closure(self) -> None:
        items = self.disposition["items"]
        adopted = [row for row in items if row["disposition"] == "adopt_here"]
        self.assertEqual(len(adopted), 21)
        self.assertTrue(
            all(
                row["canonical_owner"]["primary"] == "Plans/Shared_Integration_Runtime.md"
                and row["evidence"].get("exact_live_plan_anchors")
                for row in adopted
            )
        )
        for row in items:
            with self.subTest(item_id=row["item_id"]):
                primary = row["canonical_owner"]["primary"].split("#", 1)[0]
                self.assertTrue((ROOT / primary).is_file(), primary)
        self.assertEqual(
            sum(bool(row["evidence"].get("exact_live_plan_anchors")) for row in items),
            163,
        )
        self.assertTrue(all(not row["unresolved_conflicts"] for row in items))
        self.assertTrue(all(not row["evidence"]["implementation_evidence"] for row in items))
        self.assertEqual(
            next(row for row in items if row["item_id"] == "AGT-012")["disposition"],
            "adapt_existing_owner",
        )


if __name__ == "__main__":
    unittest.main()
