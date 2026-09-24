"""Static owner/consumer obligations; not delivery, audio or route execution proof."""
import json
from pathlib import Path
import unittest


ROOT = Path(__file__).resolve().parents[1]
COMMANDS = {
    "catalog.notifications_destination_test": (
        "cmd.notifications.destination.test", "enabled destination authority",
        "rate-limit", "redacted receipt", "mock versus live", "no PM alert-state mutation",
    ),
    "catalog.sound_upload": (
        "cmd.sound.upload", "MIME/header/decode/path", "5 MiB", "10-second",
        "above 3 seconds", "silence trimming", "duplicate content hash", "PM-managed",
    ),
    "catalog.sound_pack_import": (
        "cmd.sound.pack.import", "compatibility", "licensing", "safe paths",
        "Unknown manifest versions require review", "rejected members",
    ),
    "catalog.sound_asset_delete": (
        "cmd.sound.asset.delete", "soft-delete", "restoration", "reference safety",
        "Built-ins cannot be hard-deleted", "hide/disable behavior remains distinct",
    ),
    "catalog.sound_asset_export": (
        "cmd.sound.asset.export", "export output", "redacted export evidence",
        "source/license/version/hash", "without secrets", "does not gain export or storage authority",
    ),
}


class NotificationSoundMetadataTests(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        cls.wiring = json.loads((ROOT / "Plans/Wiring_Matrix.production.json").read_text())["entries"]
        cls.touch = json.loads((ROOT / "Plans/touch_closure.json").read_text())
        cls.profiles = {p["profile_id"]: p for p in cls.touch["profiles"]}

    def test_five_domain_actions_require_their_owner_effect(self):
        for row_id, (command, *tokens) in COMMANDS.items():
            with self.subTest(command=command):
                row = self.wiring[row_id]
                self.assertEqual(command, row["ui_command_id"])
                description = row["effect_contract"]["description"]
                for token in tokens:
                    self.assertIn(token, description)
                self.assertIn("alone never proves", description)
                self.assertIn("cannot substitute for the domain outcome", row["acceptance_checks"][3])
                self.assertEqual(description, row["test_evidence"][2]["requirement"])
                self.assertIn("reject navigation-only or acknowledgement-only completion", row["event_test_requirements"][0])
                self.assertIn("no unadmitted persisted domain event", row["event_test_requirements"][0])

    def test_no_event_or_receipt_identity_admission(self):
        for row_id, (command, *_) in COMMANDS.items():
            with self.subTest(command=command):
                row = self.wiring[row_id]
                self.assertEqual([], row["expected_event_types"])
                self.assertEqual("receipt", row["effect_contract"]["effect_kind"])
                self.assertEqual([command + ".dispatch_receipt"], row["effect_contract"]["receipt_or_event_refs"])

    def test_receipt_consumer_is_action_qualified_and_preview_stays_local(self):
        profile = self.profiles["TCP-NOTIFY-SOUND"]
        self.assertIn("Plans/Runtime_Artifacts_Panel.md#RAP-039", profile["reverse_consumers"])
        self.assertIn("RAP-039 applies to destination-test and asset-export evidence only; not local playback", profile["production_or_simulation"])
        self.assertIn("local preview never sends externally", profile["disabled_reason_rule"])
        self.assertEqual([], self.wiring["catalog.sound_preview"]["expected_event_types"])
        self.assertEqual("specified", profile["handler_status"])

    def test_teacher_reference_resolves_to_existing_thread_owner(self):
        profile = self.profiles["TCP-TEACHER-HELP"]
        self.assertEqual("Plans/UI_Command_Catalog.md#UCC-135", profile["dry_contract_ref"])
        self.assertIn("Plans/assistant-chat-design.md#ACD-426", profile["requirement_refs"])
        self.assertIn("Plans/Contracts_V0.md", profile["requirement_refs"])
        catalog = (ROOT / "Plans/UI_Command_Catalog.md").read_text()
        owner = (ROOT / "Plans/assistant-chat-design.md").read_text()
        self.assertIn("plan_unit_id: UCC-135", catalog)
        self.assertIn("plan_unit_id: ACD-426", owner)
        self.assertIn("| `cmd.chat.open_thread` | Open Chat Thread | `navigation_wrapper` | selection (`thread_exists`) | none | `stale_projection` | chat |", catalog)

    def test_all_seven_rows_retain_partial_and_explicit_specification_work(self):
        commands = {values[0] for values in COMMANDS.values()} | {"cmd.sound.preview", "cmd.chat.open_thread"}
        rows = [r for r in self.touch["rows"] if r[1] in {"TCP-NOTIFY-SOUND", "TCP-TEACHER-HELP"}]
        self.assertEqual(commands, {r[3] for r in rows})
        self.assertEqual(7, len(rows))
        for row in rows:
            with self.subTest(command=row[3]):
                self.assertEqual("partial", row[4])
                self.assertIn("remain specification work", row[5])
        teacher = next(r for r in rows if r[3] == "cmd.chat.open_thread")
        self.assertIn("does not implement a new Teacher launch", teacher[5])


if __name__ == "__main__":
    unittest.main()
