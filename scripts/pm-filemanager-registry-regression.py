#!/usr/bin/env python3
"""Replay DFM B4 through the complete family checker, with real pinned-realm validation."""
import contextlib
import hashlib
import importlib.util
import io
import json
from pathlib import Path
from unittest.mock import patch

ROOT = Path(__file__).resolve().parents[1]


def main():
    spec = importlib.util.spec_from_file_location(
        "dfm_registry_regression", ROOT / "scripts/pm-filemanager-event-contracts.py")
    checker = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(checker)
    registry = json.loads((ROOT / "Plans/storage_value_registry.json").read_text())
    path = ROOT / "Plans/event_record.schema.json"
    original = path.read_bytes()
    # Removing this redundant assertion preserves the instance language but breaks SP-310's
    # complete-document pin. The negative changes no registry row, resource pin or validator.
    needle = b'"schema_id": {\n      "type": "string",'
    if original.count(needle) != 1:
        raise AssertionError("B4 regression needs the original EventRecord schema_id assertion")
    mutant = original.replace(needle, b'"schema_id": {', 1)
    failures = checker._codec.storage_value_registry_data_failures(
        registry, path_label="Plans/storage_value_registry.json")
    if failures:
        raise AssertionError("invalid B4 control: " + json.dumps(failures))
    control_stdout = io.StringIO()
    with contextlib.redirect_stdout(control_stdout):
        if checker.main("file.copied") != 0:
            raise AssertionError("complete B4 control failed")

    read_bytes = Path.read_bytes

    def substituted_bytes(target):
        return mutant if target == path else read_bytes(target)

    with patch.object(Path, "read_bytes", substituted_bytes):
        failures = checker._codec.storage_value_registry_data_failures(
            registry, path_label="Plans/storage_value_registry.json")
        if (len(failures) != 28 or any(
                failure.get("family_id") != "goal_cancel_progress" or
                failure["error"] != "storage_value_registry_stored_profile_union_reference_unresolved" or
                "complete_document_sha256" not in failure.get("detail", "")
                for failure in failures)):
            raise AssertionError("B4 negative must expose exactly 28 pinned reference failures: " +
                                 json.dumps(failures))
        try:
            with contextlib.redirect_stdout(io.StringIO()):
                checker.main("file.copied")
        except checker.TableRefusal as error:
            # Since sweep part 2A every product refusal is a guard-table row: the aggregate registry data
            # contract refuses through RF01_registry_data with the legacy message (it was an AssertionError).
            prefix = "Storage registry contract failures: "
            if error.row != "RF01_registry_data" or not str(error).startswith(prefix):
                raise
            if json.loads(str(error)[len(prefix):]) != failures:
                raise AssertionError("complete checker omitted a registry failure") from error
        else:
            raise AssertionError("complete checker accepted B4's shared-schema byte mutation")

    # Restoration uses the actual repository bytes and the same aggregate validator.
    restored = checker._codec.storage_value_registry_data_failures(
        registry, path_label="Plans/storage_value_registry.json")
    if restored or path.read_bytes() != original:
        raise AssertionError("B4 restoration failed")
    print(json.dumps({"status": "pass", "control": json.loads(control_stdout.getvalue()),
                      "original_sha256": hashlib.sha256(original).hexdigest(),
                      "mutant_sha256": hashlib.sha256(mutant).hexdigest(),
                      "negative_reference_failures": len(failures),
                      "negative_family": "goal_cancel_progress",
                      "complete_checker": "refused all 28 failures",
                      "restored_registry_failures": len(restored),
                      "native_execution": "NOT_RUN"}))
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
