"""Enrollment, Touch Closure and owner-citation metadata checks.

These checks read the pinned owner documents and the enrolled gate files. They
prove static bookkeeping and joins only: no native handler, dispatcher, FileSafe
decision, decoder, writer, receipt, storage or GUI behavior is asserted, and no
Touch row, handler status or wiring status is promoted.
"""
import copy
import json
import subprocess
from pathlib import Path
import sys
import unittest

ROOT = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(ROOT / "scripts"))

import pm_sound_upload_import_contracts as GATE  # noqa: E402
import pm_sound_upload_import_response as ADAPTER  # noqa: E402

ACTION_FIXTURES = json.loads(
    (ROOT / "Plans/sound_upload_import_action_fixtures.json").read_text())
DISPATCH_FIXTURES = json.loads(
    (ROOT / "Plans/sir_sound_upload_import_dispatch_fixtures.json").read_text())
TOUCH = json.loads((ROOT / "Plans/touch_closure.json").read_text())
WIRING = json.loads((ROOT / "Plans/Wiring_Matrix.production.json").read_text())["entries"]
PROFILE = {profile["profile_id"]: profile for profile in TOUCH["profiles"]}["TCP-NOTIFY-SOUND"]
ROWS = {row[3]: row for row in TOUCH["rows"]}
ROUTES = {"cmd.sound.upload", "cmd.sound.pack.import"}
OTHER_BOUND = {"cmd.sound.asset.delete", "cmd.sound.asset.export"}
ACCEPTED_SCHEMA = "Plans/notifications_sound_action_contracts.schema.json"
VERIFY = ROOT / "scripts/pm-plans-verify.py"
VERIFY_MARKERS = (
    '"validate_sound_upload_import_contracts": "validate-sound-upload-import-contracts",',
    '"sound_upload_import_contracts": "validate-sound-upload-import-contracts",',
    '"validate_sound_upload_import_contracts",\n    "sound_upload_import_contracts",',
    "def cmd_validate_sound_upload_import_contracts(args: argparse.Namespace) -> dict[str, Any]:",
    '("validate_sound_upload_import_contracts", cmd_validate_sound_upload_import_contracts,',
    '("sound_upload_import_contracts", cmd_validate_sound_upload_import_contracts,',
    'sound_upload_import_contracts=compact_gate_report(check_map["sound_upload_import_contracts"]),',
    '"validate-sound-upload-import-contracts": cmd_validate_sound_upload_import_contracts,',
    '        "validate-notification-sound-contracts",\n        "validate-sound-upload-import-contracts",',
)
OWNER_LIMIT_TOKENS = ("5MiB", "10s", "warn >3s")


class SoundUploadImportMetadataTests(unittest.TestCase):
    def test_touch_profile_binds_all_four_sound_routes_to_their_companions(self):
        for field in GATE.ACTION_REF_DEFINITION["cmd.sound.upload"]:
            with self.subTest(field=field):
                clauses = GATE.profile_clauses(field, PROFILE)
                for action, definitions in GATE.ACTION_REF_DEFINITION.items():
                    binding = f"{ADAPTER.ACTION_SCHEMA}#/$defs/{definitions[field]}"
                    self.assertIn(f"{action} -> {binding}", PROFILE[field])
                    self.assertEqual(clauses[action], binding)
                for other in OTHER_BOUND:
                    expected = (f"{GATE.B_COMPANION_SCHEMA[other]}#/$defs/"
                                f"{GATE.B_COMPANION_BINDING[other][field]}")
                    self.assertEqual(clauses[other], expected)
                for accepted, definition in (
                        ("cmd.notifications.destination.test", GATE.ACCEPTED_COMPANION_BINDING[
                            "cmd.notifications.destination.test"][field]),
                        ("cmd.sound.preview", GATE.ACCEPTED_COMPANION_BINDING[
                            "cmd.sound.preview"][field])):
                    self.assertEqual(clauses[accepted], f"{ACCEPTED_SCHEMA}#/$defs/{definition}")

    def test_touch_rows_stay_partial_with_the_shared_profile(self):
        for action in ROUTES:
            with self.subTest(action=action):
                row = ROWS[action]
                self.assertEqual(row[1], "TCP-NOTIFY-SOUND")
                self.assertEqual(row[4], "partial")
                self.assertIn("remain implementation and verification work", row[5])
                self.assertNotIn("remain specification work", row[5])
                self.assertIn("native", row[5].lower())
                self.assertNotIn("implemented", row[5].lower())
                self.assertNotIn("verified native", row[5].lower())
        self.assertEqual(PROFILE["handler_status"], "specified")
        self.assertEqual(PROFILE["wiring_status"], "specified")
        for action in OTHER_BOUND:
            self.assertEqual(ROWS[action][4], "partial")
            self.assertIn("remain implementation and verification work", ROWS[action][5])
            self.assertNotIn("remain specification work", ROWS[action][5])

    def test_touch_accounting_and_retired_spelling_are_unchanged(self):
        self.assertEqual(
            {
                "profile_count": len(TOUCH["profiles"]),
                "row_count": len(TOUCH["rows"]),
                "excluded_token_count": len(TOUCH["excluded_tokens"]),
                "alias_binding_count": len(TOUCH["alias_bindings"]),
            },
            GATE.SEALED_ACCOUNTING,
        )
        self.assertNotIn("cmd.settings.open_notifications", ROWS)
        self.assertNotIn("cmd.settings.open_notifications", TOUCH["alias_bindings"])
        self.assertEqual(
            {token["token"]: token["classification"] for token in TOUCH["excluded_tokens"]}
            ["cmd.settings.open_notifications"], "forbidden")

    def test_touch_validation_path_resolves_the_companion_artifacts(self):
        for ref in (GATE.ACTION_FIXTURES, GATE.DISPATCH_FIXTURES,
                    "scripts/pm_sound_upload_import_contracts.py",
                    "Plans/notifications_sound_action_fixtures.json",
                    "scripts/pm_notification_sound_contracts.py"):
            with self.subTest(ref=ref):
                self.assertIn(ref, PROFILE["test_refs"])

    def test_production_rows_join_the_companion_handler_effect_and_selectors(self):
        for action, row_id in GATE.WIRING_ROW.items():
            with self.subTest(action=action):
                row = WIRING[row_id]
                expected = ADAPTER.EFFECT_VALUES[action]
                self.assertEqual(row["ui_command_id"], action)
                self.assertEqual(row["handler_location"], expected["handler_id"])
                self.assertEqual(row["effect_contract"]["effect_kind"], "receipt")
                self.assertEqual(row["effect_contract"]["receipt_or_event_refs"],
                                 expected["receipt_or_event_refs"])
                self.assertEqual(row["expected_event_types"], [])
                self.assertEqual(row["state_selector"], ADAPTER.AVAILABILITY_SELECTOR[action])
                self.assertEqual(row["disabled_reason_projection"],
                                 ADAPTER.DISABLED_REASON_SELECTOR[action])

    def test_standard_run_gates_enrollment_is_complete(self):
        text = VERIFY.read_text()
        for marker in VERIFY_MARKERS:
            with self.subTest(marker=marker[:60]):
                self.assertIn(marker, text)

    def test_enrolled_cli_reports_the_same_green_static_report(self):
        proc = subprocess.run([sys.executable, str(VERIFY), "validate-sound-upload-import-contracts"],
                              cwd=ROOT, capture_output=True, text=True, timeout=600)
        report = json.loads(proc.stdout)
        self.assertEqual(report["status"], "pass")
        self.assertEqual(report["failures"], [])
        self.assertEqual(report["check"], "validate-sound-upload-import-contracts")
        self.assertEqual(proc.returncode, 0)

    def test_owner_citations_resolve(self):
        for path, units in GATE.OWNER_UNITS.items():
            document = (ROOT / path).read_text(encoding="utf-8")
            for unit in units:
                with self.subTest(path=path, unit=unit):
                    self.assertIn(unit, document)
        storage = (ROOT / "Plans/storage-plan.md").read_text(encoding="utf-8")
        sp222 = storage[storage.index("### SP-222"):]
        sp222 = sp222[:sp222.index("\n### ", 1)]
        flattened = " ".join(sp222.split())
        for token in OWNER_LIMIT_TOKENS:
            with self.subTest(token=token):
                self.assertIn(token, flattened)
        for token in ("MIME/header/decode/path", "cap at 5 MiB and 10 seconds decoded, warn above 3 seconds",
                      "unknown manifest versions require manual review", "unsafe paths are rejected",
                      "silently becoming hide or disable",
                      "Content-hash duplicates link existing managed audio content",
                      "filenames, labels and category collisions never authorize silent asset or mapping replacement",
                      "Per-member validation does not imply an all-or-nothing import transaction"):
            with self.subTest(token=token):
                self.assertIn(" ".join(token.split()), flattened)
        catalog = (ROOT / "Plans/UI_Command_Catalog.md").read_text(encoding="utf-8")
        ucc103 = catalog[catalog.index("### UCC-103"):]
        ucc103 = ucc103[:ucc103.index("\n### ", 1)]
        catalog_text = " ".join(ucc103.split())
        for token in ("cmd.sound.upload", "cmd.sound.pack.import",
                      "Pack import consumes SP-222's exact category, per-member rejection and duplicate-content rules",
                      "built-in asset delete is unavailable and direct invocation refuses without mutation",
                      "Sound preview is local only and must not send external notifications"):
            with self.subTest(token=token):
                self.assertIn(" ".join(token.split()), catalog_text)
        rap = " ".join((ROOT / "Plans/Runtime_Artifacts_Panel.md").read_text(encoding="utf-8").split())
        self.assertIn("RAP-039 applies to destination-test and asset-export evidence only",
                      PROFILE["production_or_simulation"])
        self.assertIn("RAP-039", rap)
        self.assertIn("notification/sound test-send/export evidence", rap)

    def test_vocabulary_stays_closed(self):
        schema = json.loads((ROOT / ADAPTER.ACTION_SCHEMA).read_text())
        dispatch_schema = json.loads((ROOT / ADAPTER.DISPATCH_SCHEMA).read_text())
        self.assertEqual(set(schema["$defs"]["action_id"]["enum"]), ROUTES)
        self.assertEqual(set(dispatch_schema["$defs"]["action_id"]["enum"]), ROUTES)
        accepted = json.loads((ROOT / ACCEPTED_SCHEMA).read_text())
        self.assertEqual(set(accepted["$defs"]["action_id"]["enum"]),
                         {"cmd.notifications.destination.test", "cmd.sound.preview"})
        self.assertNotEqual(accepted["$id"], schema["$id"])
        for document in (schema, dispatch_schema, ACTION_FIXTURES, DISPATCH_FIXTURES):
            text = json.dumps(document)
            for key in ADAPTER.FORBIDDEN_COMPANION_KEYS:
                with self.subTest(key=key):
                    if document in (ACTION_FIXTURES, DISPATCH_FIXTURES):
                        continue  # negative fixtures may declare a refused key
                    self.assertNotIn(f'"{key}"', text)
        numeric = sorted({
            node["const"] for node in GATE._walk(schema)  # noqa: SLF001
            if isinstance(node, dict) and isinstance(node.get("const"), int)
            and not isinstance(node.get("const"), bool)
        })
        self.assertEqual(sorted(set(numeric) - {0}), sorted(GATE.OWNER_LIMITS.values()))

    def test_fixture_rows_declare_a_known_route_and_definition(self):
        definitions = set(json.loads((ROOT / ADAPTER.ACTION_SCHEMA).read_text())["$defs"]) | {
            "request_case", "result_case", "response_case", "availability_case", "error_case",
            "dispatch_case", "dispatcher_case", "effect_binding", "request", "result", "error",
            "availability", "dispatch_binding", "dispatcher_binding", "#",
        }
        routes = set()
        total = 0
        for document in (ACTION_FIXTURES, DISPATCH_FIXTURES):
            for row in document["valid"] + document["invalid"]:
                total += 1
                with self.subTest(row=row["name"]):
                    self.assertIn(row["route"], ROUTES)
                    self.assertIn(row["definition"], definitions)
                    self.assertTrue(row["name"])
                routes.add(row["route"])
        self.assertEqual(routes, ROUTES)
        self.assertEqual(total, 151)

    def test_accepted_companion_gate_still_passes_after_the_shared_hunks(self):
        sys.path.insert(0, str(ROOT / "scripts"))
        import pm_notification_sound_contracts as accepted  # noqa: PLC0415

        report = accepted.validate()
        self.assertEqual(report["status"], "pass")
        self.assertEqual(report["failures"], [])
        self.assertFalse(report["stats"]["native_proof"])
        self.assertEqual(accepted.UNBOUND_SOUND_ACTIONS, set())
        self.assertEqual(set(accepted.COMPANION_BOUND_SOUND_ACTIONS), ROUTES | OTHER_BOUND)

    def test_gate_reports_static_only_and_stays_green(self):
        report = GATE.validate()
        self.assertEqual(report["status"], "pass")
        self.assertEqual(report["failures"], [])
        self.assertFalse(report["stats"]["native_proof"])
        self.assertEqual(report["stats"]["structure"]["action_records"], len(
            [row for row in ACTION_FIXTURES["valid"] if not row["definition"].endswith("_case")]))
        self.assertEqual(report["stats"]["owner_limits"]["limits"], GATE.OWNER_LIMITS)
        self.assertEqual(report["stats"]["redaction"]["checked_records"],
                         len(ACTION_FIXTURES["valid"]) + len(DISPATCH_FIXTURES["valid"]))


if __name__ == "__main__":
    unittest.main()
