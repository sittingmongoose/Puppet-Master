"""Own-row registration regressions for the seven retained primary identities."""

from __future__ import annotations

import argparse
import copy
import importlib.util
import json
from pathlib import Path
import sys
import unittest
from unittest import mock


ROOT = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(ROOT / "scripts"))
import pm_primary_command_catalog as guard


class PrimaryCommandCatalogTests(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        cls.documents = {path: (ROOT / path).read_text(encoding="utf-8")
                         for path in guard.DOCUMENT_SECTIONS}
        matrix = json.loads((ROOT / "Plans/Wiring_Matrix.production.json").read_text())
        cls.entries = {key: row for key, row in matrix["entries"].items()
                       if row["ui_command_id"] in guard.COMMAND_OWNERS}

    def errors(self, documents=None, entries=None):
        return guard.validate_primary_command_catalog(
            ROOT, self.entries if entries is None else entries,
            self.documents if documents is None else documents,
        )

    def assert_error(self, suffix, documents=None, entries=None):
        self.assertIn("retained_primary_" + suffix,
                      {error["error"] for error in self.errors(documents, entries)})

    def row(self, path, command):
        return next(line for line in self.documents[path].splitlines()
                    if line.startswith(f"| `{command}` |"))

    def change_cell(self, path, command, index, value):
        documents = dict(self.documents)
        row = self.row(path, command)
        cells = row.split("|")
        cells[index + 1] = f" {value} "
        documents[path] = documents[path].replace(row, "|".join(cells), 1)
        return documents

    def test_current_seven_have_exact_owner_backed_primary_bindings(self):
        self.assertEqual(self.errors(), [])

    def test_alias_target_or_prose_mentions_cannot_replace_own_rows(self):
        for path in self.documents:
            for command in guard.COMMAND_OWNERS:
                with self.subTest(path=path, command=command):
                    documents = dict(self.documents)
                    documents[path] = documents[path].replace(self.row(path, command), "", 1)
                    self.assertIn(f"`{command}`", documents[path])  # Existing aliases still mention it.
                    documents[path] += f"\nProse-only reminder: `{command}`.\n"
                    self.assert_error("row_count", documents)

    def test_duplicate_own_row_is_ambiguous(self):
        for path in self.documents:
            for command in guard.COMMAND_OWNERS:
                with self.subTest(path=path, command=command):
                    documents = dict(self.documents)
                    row = self.row(path, command)
                    documents[path] = documents[path].replace(row, row + "\n" + row, 1)
                    self.assert_error("row_count", documents)

    def test_duplicate_primary_outside_addendum_is_rejected(self):
        for path in self.documents:
            documents = dict(self.documents)
            documents[path] += "\n## Other primary section\n" + self.row(path, "cmd.integration.connection.add") + "\n"
            self.assert_error("row_count", documents)

    def test_block_in_alias_section_does_not_count_as_primary(self):
        for path in self.documents:
            documents = dict(self.documents)
            documents[path] = documents[path].replace(guard.START, "### Alias-only notes\n" + guard.START)
            self.assert_error("metadata_block_missing_or_ambiguous", documents)

    def test_fenced_example_is_not_registration(self):
        documents = {path: text.replace(guard.START, "```markdown\n" + guard.START)
                     .replace(guard.END, guard.END + "\n```")
                     for path, text in self.documents.items()}
        self.assert_error("metadata_block_missing_or_ambiguous", documents)

    def test_commented_row_cannot_satisfy_registration(self):
        for path in self.documents:
            documents = dict(self.documents)
            row = self.row(path, "cmd.integration.connection.add")
            documents[path] = documents[path].replace(row, "<!--\n" + row + "\n-->", 1)
            self.assert_error("row_count", documents)

    def test_commented_duplicate_does_not_create_false_ambiguity(self):
        documents = {path: text + "\n<!--\n" + self.row(path, "cmd.integration.connection.add") + "\n-->\n"
                     for path, text in self.documents.items()}
        self.assertEqual(self.errors(documents), [])

    def test_metadata_declarations_must_be_explicit_and_unambiguous(self):
        for path in self.documents:
            for old, new in (
                ("`command_kind=domain_action`", "`command_kind=navigation_wrapper`"),
                ("`normalization.kind=none`", "`normalization.kind=alias`"),
                ("`alias_of_command_id=null`", "`alias_of_command_id=cmd.other`"),
                ("`command_kind=domain_action`", ""),
                ("`command_kind=domain_action`", "`command_kind=domain_action` and `command_kind=shell_view`"),
                ("availability remains `handler_unavailable`", "availability remains `enabled`"),
                ("`expected_event_types=[]`", "`expected_event_types=[connection.changed]`"),
                ("`normalizes_to_contract` is the exact owner request schema pointer in its Contracts cell", "No contract binding"),
            ):
                with self.subTest(path=path, old=old, new=new):
                    documents = dict(self.documents)
                    # Restrict mutation to the bounded metadata, not older owner prose.
                    prefix, rest = documents[path].split(guard.START)
                    block, suffix = rest.split(guard.END)
                    self.assertIn(old, block)
                    documents[path] = prefix + guard.START + block.replace(old, new) + guard.END + suffix
                    self.assert_error("metadata_declaration", documents)

    def test_label_description_preconditions_and_consumers_are_required(self):
        for path in self.documents:
            for command in guard.COMMAND_OWNERS:
                for index in (1, 2, 3, 7):
                    with self.subTest(path=path, command=command, index=index):
                        self.assert_error("metadata_empty", self.change_cell(path, command, index, ""))

    def test_wrong_owner_or_handler_is_rejected_in_either_document(self):
        for path in self.documents:
            for command in guard.COMMAND_OWNERS:
                for index, value in ((4, "`Plans/Shared_Integration_Runtime.md#SIR-001`"),
                                     (5, "`handlers::wrong::target`")):
                    with self.subTest(path=path, command=command, index=index):
                        self.assert_error("binding_mismatch", self.change_cell(path, command, index, value))

    def test_all_five_contract_refs_must_be_present_and_exact(self):
        for path in self.documents:
            for command in guard.COMMAND_OWNERS:
                for field, ref in guard.expected_contracts(command).items():
                    for replacement in ("", "Plans/wrong.schema.json#/$defs/Wrong"):
                        with self.subTest(path=path, command=command, field=field, replacement=replacement):
                            row = self.row(path, command)
                            bad = row.replace(ref, replacement)
                            documents = dict(self.documents)
                            documents[path] = documents[path].replace(row, bad, 1)
                            self.assert_error("schema_mismatch", documents)

    def test_schema_definition_must_actually_resolve(self):
        original_read = Path.read_text
        schema_path = ROOT / "Plans/shared_integration_runtime.schema.json"
        for field, ref in guard.expected_contracts("cmd.integration.connection.add").items():
            with self.subTest(field=field):
                schema = json.loads(original_read(schema_path))
                del schema["$defs"][ref.split("/")[-1]]

                def read(path, *args, **kwargs):
                    return json.dumps(schema) if path == schema_path else original_read(path, *args, **kwargs)

                with mock.patch.object(Path, "read_text", read):
                    self.assert_error("schema_ref_unresolved")

    def test_compatibility_source_cannot_be_promoted_beside_target(self):
        for path in self.documents:
            documents = dict(self.documents)
            row = self.row(path, "cmd.integration.connection.add")
            alias = row.replace("`cmd.integration.connection.add`", "`cmd.cluster_connection.add`", 1)
            documents[path] = documents[path].replace(row, row + "\n" + alias, 1)
            self.assert_error("alias_promoted", documents)
        entries = copy.deepcopy(self.entries)
        row = copy.deepcopy(entries["catalog.integration_connection_add"])
        row["ui_command_id"] = "cmd.cluster_connection.add"
        entries["alias.add"] = row
        self.assert_error("alias_production_row", entries=entries)

    def test_missing_and_duplicate_production_rows_are_rejected(self):
        for key in self.entries:
            for mode in ("delete", "duplicate"):
                with self.subTest(key=key, mode=mode):
                    entries = copy.deepcopy(self.entries)
                    if mode == "delete":
                        del entries[key]
                    else:
                        entries[key + ".duplicate"] = copy.deepcopy(entries[key])
                    self.assert_error("production_row_count", entries=entries)

    def test_exact_production_bindings_cannot_drift(self):
        for key, row in self.entries.items():
            for field in guard.expected_binding(row["ui_command_id"]):
                with self.subTest(key=key, field=field):
                    entries = copy.deepcopy(self.entries)
                    entries[key][field] += "_wrong"
                    self.assert_error("production_binding", entries=entries)

    def test_production_cannot_claim_enabled_availability_or_events(self):
        for key in self.entries:
            entries = copy.deepcopy(self.entries)
            entries[key]["acceptance_checks"] = [text.replace("handler_unavailable", "enabled")
                                                   for text in entries[key]["acceptance_checks"]]
            self.assert_error("production_disabled_boundary", entries=entries)
            for value in (["connection.changed"], None):
                entries = copy.deepcopy(self.entries)
                entries[key]["expected_event_types"] = value
                self.assert_error("production_effect", entries=entries)
            entries = copy.deepcopy(self.entries)
            entries[key]["effect_contract"]["effect_kind"] = "event"
            self.assert_error("production_effect", entries=entries)

    def test_gate_invokes_guard_and_reports_its_failures(self):
        spec = importlib.util.spec_from_file_location("plans_verify_primary_test", ROOT / "scripts/pm-plans-verify.py")
        module = importlib.util.module_from_spec(spec)
        spec.loader.exec_module(module)
        sentinel = {"path": "Plans/UI_Command_Catalog.md", "error": "retained_primary_test_sentinel"}
        with mock.patch.object(guard, "validate_primary_command_catalog", return_value=[sentinel]) as validate:
            report = module.cmd_validate_wiring_matrix(argparse.Namespace())
        validate.assert_called_once()
        self.assertIn(sentinel, report["failures"])
        self.assertEqual(report["status"], "fail")

    def test_real_gate_rejects_missing_own_row_despite_alias_target_mentions(self):
        spec = importlib.util.spec_from_file_location("plans_verify_primary_negative", ROOT / "scripts/pm-plans-verify.py")
        module = importlib.util.module_from_spec(spec)
        spec.loader.exec_module(module)
        path = "Plans/UI_Command_Catalog.md"
        command = "cmd.integration.connection.add"
        text = self.documents[path].replace(self.row(path, command), "", 1)
        self.assertIn(f"`{command}`", text)
        original_read = Path.read_text

        def read(target, *args, **kwargs):
            return text if target == ROOT / path else original_read(target, *args, **kwargs)

        with mock.patch.object(Path, "read_text", read):
            report = module.cmd_validate_wiring_matrix(argparse.Namespace())
        self.assertEqual(report["status"], "fail")
        self.assertTrue(any(failure["error"] == "retained_primary_row_count"
                            and failure.get("command_id") == command
                            for failure in report["failures"]))


if __name__ == "__main__":
    unittest.main()
