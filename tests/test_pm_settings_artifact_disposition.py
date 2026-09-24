"""Settings disposition wording and real Touch projection; no runtime proof."""

from collections import Counter
import importlib.util
import json
from pathlib import Path
import unittest

ROOT = Path(__file__).resolve().parents[1]
SPEC = importlib.util.spec_from_file_location(
    "artifact_disposition_touch_gate", ROOT / "scripts/pm-touch-closure-verify.py"
)
GATE = importlib.util.module_from_spec(SPEC)
SPEC.loader.exec_module(GATE)


class SettingsArtifactDispositionTests(unittest.TestCase):
    def test_owner_preserves_catalog_blocked_exception(self):
        owner = (ROOT / "Plans/Settings_System.md").read_text()
        unit = owner.split("### SSYS-023 -", 1)[1].split("### SSYS-024 -", 1)[0]
        self.assertNotIn("Every reused target names an already admitted", unit)
        self.assertIn("explicitly blocked under UCC-120", unit)
        self.assertIn("cmd.artifacts.open_panel remains command_not_registered", unit)
        self.assertIn("does not itself admit a command, alias, handler, route arguments", unit)
        catalog = (ROOT / "Plans/UI_Command_Catalog.md").read_text()
        unit = catalog.split("### UCC-120 -", 1)[1].split("### UCC-121 -", 1)[0]
        self.assertIn("cmd.artifacts.open_panel` remains command_not_registered", unit)

    def test_disposition_does_not_reject_or_admit_the_pending_feature(self):
        fixtures = json.loads((ROOT / "Plans/settings_system_contract_fixtures.json").read_text())
        dispositions = fixtures["packet_command_dispositions"]
        self.assertEqual(len(dispositions), 80)
        self.assertEqual(Counter(row["disposition"] for row in dispositions.values()), {
            "reuse_canonical_command": 41,
            "superseded_by_typed_local_ui_action": 7,
            "retired_bakeoff_only": 1,
            "rejected_with_reason": 31,
        })
        artifact = dispositions["cmd.artifact.manager.open"]
        self.assertEqual(artifact["disposition"], "reuse_canonical_command")
        self.assertEqual(artifact["replacement_command_ids"], ["cmd.artifacts.open_panel"])
        self.assertIs(artifact["native_handler_claim"], False)
        self.assertIsNone(artifact["typed_local_ui_action_id"])
        self.assertIsNone(artifact["typed_local_payload_schema_ref"])

    def test_fixture_reason_does_not_claim_the_blocked_target_is_admitted(self):
        fixtures = json.loads((ROOT / "Plans/settings_system_contract_fixtures.json").read_text())
        reason = fixtures["packet_command_dispositions"]["cmd.artifact.manager.open"]["reason"]
        self.assertIn("explicitly blocked", reason)
        self.assertIn("not an admitted command or handler", reason)
        self.assertIn("requires exact Runtime Artifacts and Commands route adjudication", reason)
        self.assertIn("authorizes no dispatch", reason)

    def test_real_touch_projection_keeps_target_blocked_and_source_nonactionable(self):
        registry = json.loads((ROOT / "Plans/touch_closure.json").read_text())
        descriptor = next(row for row in registry["external_disposition_registries"]
                          if row["registry_id"] == "TCR-SETTINGS-PACKET-COMMANDS")
        projected, nonactionable, failures, stats = GATE.external_disposition_inventory(descriptor)
        self.assertEqual(projected["cmd.artifacts.open_panel"], ("command", "blocked"))
        self.assertIn("cmd.artifact.manager.open", nonactionable)
        self.assertNotIn("cmd.artifact.manager.open", projected)
        self.assertEqual(stats["token_count"], 80)
        # Binding staleness is reported, never refreshed or treated as admission.
        unexpected = [row for row in failures if not row.startswith(
            "TCR-SETTINGS-PACKET-COMMANDS: disposition registry hash drift:")]
        self.assertEqual(unexpected, [])


if __name__ == "__main__":
    unittest.main()
