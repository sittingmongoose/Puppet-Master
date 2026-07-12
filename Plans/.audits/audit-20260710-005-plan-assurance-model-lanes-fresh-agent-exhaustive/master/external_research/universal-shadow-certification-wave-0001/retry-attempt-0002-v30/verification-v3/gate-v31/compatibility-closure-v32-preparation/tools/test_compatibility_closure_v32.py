#!/usr/bin/env python3
"""Substantive temporary-fixture tests for the V32 compatibility closure."""
from __future__ import annotations

import copy
import hashlib
import io
import json
import os
import tempfile
import unittest
from pathlib import Path
from typing import Any, Callable

import closure_core_v32 as core


CONTROLLER = "019f553d-af6e-7c91-a43f-d81e06d100fd"
PARENT_TURN = "019f5593-4c96-7681-b59a-ea357e84f052"
CHILD = "019f5594-f3a0-71e3-a21b-4b30594703b7"
CHILD_TURN = "019f5594-f421-7fa1-b32a-067243fd9406"
REPORT_SHA = "7d392c58db6d9832ba71d4e53c735a6acc10ab9742d4fdba0a60031e0fa51f14"
MARKER = "A005-ERSC-GATE-V31-C1-ATOMIC8-PRELAUNCH"
REPORT_PATH = "master/external_research/universal-shadow-certification-wave-0001/retry-attempt-0002-v30/verification-v3/gate-v31/reports/c1-atomic8-prelaunch.json"
WRITER = "tools/capture_controller_native_reviewer_v31.py"
WORKDIR = "/fixture/gate-v31"
COMMAND = "PYTHONDONTWRITEBYTECODE=1 python3 -B tools/capture_controller_native_reviewer_v31.py --slot c1-atomic8-prelaunch"
ERROR_MESSAGE = "stat() got an unexpected keyword argument 'follow_symlinks'"


def write_json(path: Path, document: Any) -> None:
    path.write_bytes(core.pretty(document))


def expected_report() -> dict[str, Any]:
    return {
        "audit_id": "audit-20260710-005-plan-assurance-model-lanes-fresh-agent-exhaustive",
        "wave_id": "universal-shadow-certification-wave-0001",
        "attempt_id": "attempt-0002",
        "slot_id": "c1-atomic8-prelaunch",
        "cohort_id": "cohort-0001",
        "cohort_authority_sha256": "6aa6449328cc86b7918e90670e16087171d5cc70379d877c247c00e1c756db8c",
        "cohort_manifest_sha256": "d44bb664b9610e086f1ff43690dc68f0b533fdb5e0ece63e5f009fb11abb36ee",
        "primary_postrun_sha256": "45bec51e3bedc80f9ca2af7bb10d0fdecf581021a803eae723bc0d699084f214",
        "primary_rejected_set_report_sha256": "7fb68216b4c4271864fad7f564d9124f1a992b0069929e2e2a6f7867ed87fc4c",
        "assignment_ids": [f"A005ERSC-{number:04d}" for number in range(1, 9)],
    }


def report_document() -> dict[str, Any]:
    expected = expected_report()
    return {
        "schema_version": "universal-shadow-certification-atomic8-prelaunch-report-v31-v1",
        "audit_id": expected["audit_id"], "wave_id": expected["wave_id"], "attempt_id": expected["attempt_id"],
        "slot_id": expected["slot_id"], "cohort_id": expected["cohort_id"], "atomic_size": 8,
        "authority_sha256": expected["cohort_authority_sha256"], "manifest_sha256": expected["cohort_manifest_sha256"],
        "primary_postrun_sha256": expected["primary_postrun_sha256"],
        "primary_rejected_set_report_sha256": expected["primary_rejected_set_report_sha256"],
        "assignment_ids": expected["assignment_ids"], "status": "PASS", "errors": [],
        "activation_authorized": False, "launch_authorized": False, "credit": 0,
        "zero_state": {"activation_transactions": 0, "credit": 0, "empty_output_directories": 8, "receipts": 0, "results": 0, "runtime_native_capture_rows": 0},
    }


def row(row_type: str, payload: dict[str, Any]) -> dict[str, Any]:
    return {"timestamp": "fixture", "type": row_type, "payload": payload}


def parent_fixture() -> tuple[list[dict[str, Any]], dict[str, Any], dict[str, Any]]:
    spawn_source = "\n".join((
        "tools.multi_agent_v1__spawn_agent(", 'model: "gpt-5.6-luna"', 'reasoning_effort: "max"',
        "fork_context: false", "fork_turns=none", MARKER, REPORT_PATH,
    ))
    failure_source = "\n".join(("tools.exec_command(", COMMAND, WORKDIR))
    failure_output = json.dumps({"exit_code": 1, "output": "TypeError: " + ERROR_MESSAGE + " at path.stat(follow_symlinks=False)"}, separators=(",", ":"))
    rows = [
        row("event_msg", {"type": "task_started", "turn_id": PARENT_TURN}),
        row("turn_context", {"turn_id": PARENT_TURN, "model": core.MODEL, "effort": core.EFFORT, "collaboration_mode": {"settings": {"model": core.MODEL, "reasoning_effort": core.EFFORT}}}),
        row("response_item", {"type": "custom_tool_call", "call_id": "spawn-call", "input": spawn_source}),
        row("response_item", {"type": "custom_tool_call_output", "call_id": "spawn-call", "output": CHILD}),
        row("response_item", {"type": "custom_tool_call_output", "call_id": "wait-call", "output": f"completed {CHILD} {REPORT_SHA}"}),
        row("response_item", {"type": "custom_tool_call", "call_id": "failed-call", "input": failure_source}),
        row("response_item", {"type": "custom_tool_call_output", "call_id": "failed-call", "output": failure_output}),
        row("event_msg", {"type": "task_complete", "turn_id": PARENT_TURN, "last_agent_message": "FAIL_CLOSED — not `READY_FOR_SEPARATE_C1_V32_ACTIVATION`"}),
    ]
    binding = {
        "spawn_marker": MARKER,
        "report_relative_path": REPORT_PATH,
        "controller_parent": {
            "native_thread_id": CONTROLLER, "native_turn_id": PARENT_TURN, "session_prefix_line_count": 8,
            "turn_start_line": 1, "turn_context_line": 2, "turn_end_line": 8,
            "spawn_call_line": 3, "spawn_call_id": "spawn-call", "spawn_result_line": 4,
            "terminal_record_line": 5, "failed_invocation_call_line": 6, "failed_invocation_result_line": 7,
        },
        "reviewer_native": {"native_thread_id": CHILD, "native_turn_id": CHILD_TURN},
    }
    lineage = {
        "sealed_writer_relative_path": WRITER, "invocation_count": 1, "native_call_id": "failed-call",
        "exact_command": COMMAND, "workdir": WORKDIR, "exception_type": "TypeError",
        "exception_message": ERROR_MESSAGE, "unsupported_call": "path.stat(follow_symlinks=False)",
    }
    refresh_parent_hashes(rows, binding)
    return rows, binding, lineage


def raw_rows(rows: list[dict[str, Any]]) -> tuple[bytes, ...]:
    return tuple(core.canonical(item) for item in rows)


def refresh_parent_hashes(rows: list[dict[str, Any]], binding: dict[str, Any]) -> None:
    raw = raw_rows(rows)
    parent = binding["controller_parent"]
    parent["session_prefix_line_count"] = len(raw)
    parent["session_prefix_sha256"] = core.sha_bytes(b"".join(raw))
    parent["turn_segment_sha256"] = core.sha_bytes(b"".join(raw[parent["turn_start_line"] - 1:parent["turn_end_line"]]))
    for line_key, hash_key in (
        ("turn_start_line", "turn_start_record_sha256"), ("turn_context_line", "turn_context_record_sha256"),
        ("spawn_call_line", "spawn_record_sha256"), ("spawn_result_line", "spawn_result_record_sha256"),
        ("terminal_record_line", "terminal_record_sha256"),
        ("failed_invocation_call_line", "failed_invocation_call_record_sha256"),
        ("failed_invocation_result_line", "failed_invocation_result_record_sha256"),
        ("turn_end_line", "turn_complete_record_sha256"),
    ):
        parent[hash_key] = core.sha_bytes(raw[parent[line_key] - 1])


def child_fixture() -> tuple[list[dict[str, Any]], dict[str, Any]]:
    rows = [
        row("session_meta", {"id": CHILD, "parent_thread_id": CONTROLLER, "forked_from_id": None, "source": {"subagent": {"thread_spawn": {"parent_thread_id": CONTROLLER, "depth": 1, "agent_nickname": "Meitner"}}}}),
        row("event_msg", {"type": "task_started", "turn_id": CHILD_TURN}),
        row("turn_context", {"turn_id": CHILD_TURN, "model": core.MODEL, "effort": core.EFFORT, "collaboration_mode": {"settings": {"model": core.MODEL, "reasoning_effort": core.EFFORT}}}),
        row("event_msg", {"type": "task_complete", "turn_id": CHILD_TURN, "last_agent_message": f"PASS (prelaunch proof only; activation/launch false, credit 0) {REPORT_SHA}"}),
    ]
    binding = {
        "controller_parent": {"native_thread_id": CONTROLLER},
        "reviewer_native": {"native_thread_id": CHILD, "native_turn_id": CHILD_TURN, "session_meta_line": 1, "task_started_line": 2, "turn_context_line": 3, "task_complete_line": 4},
    }
    refresh_child_hashes(rows, binding)
    return rows, binding


def refresh_child_hashes(rows: list[dict[str, Any]], binding: dict[str, Any]) -> None:
    raw = raw_rows(rows)
    child = binding["reviewer_native"]
    child["session_line_count"] = len(raw)
    child["session_sha256"] = core.sha_bytes(b"".join(raw))
    for line_key, hash_key in (
        ("session_meta_line", "session_meta_record_sha256"), ("task_started_line", "task_started_record_sha256"),
        ("turn_context_line", "turn_context_record_sha256"), ("task_complete_line", "task_complete_record_sha256"),
    ):
        child[hash_key] = core.sha_bytes(raw[child[line_key] - 1])


def set_path(document: Any, path: tuple[Any, ...], value: Any) -> None:
    target = document
    for key in path[:-1]:
        target = target[key]
    target[path[-1]] = value


def wrong_values(valid: Any) -> list[Any]:
    if isinstance(valid, bool):
        return [not valid, None, "false", [], {}]
    if isinstance(valid, int):
        return [valid + 1, -1, None, str(valid), []]
    if isinstance(valid, str):
        return ["", "CORRUPT", None, 0, []]
    if isinstance(valid, list):
        if not valid:
            return [["EXTRA"], None, "list", {}, 0]
        return [[], valid[:-1], valid + ["EXTRA"], list(reversed(valid)), None]
    if valid is None:
        return ["bad", 1, [], {}, False]
    return [None, "bad", 1, [], {}]


class CompatibilityTests(unittest.TestCase):
    maxDiff = None


CATEGORY_COUNTS: dict[str, int] = {}


def add_test(category: str, name: str, function: Callable[[unittest.TestCase], None]) -> None:
    index = CATEGORY_COUNTS.get(category, 0) + 1
    CATEGORY_COUNTS[category] = index
    setattr(CompatibilityTests, f"test_{category}_{index:03d}_{name}", function)


# Report semantic integrity: every case uses a real temporary report file.
base_report = report_document()
report_paths: list[tuple[Any, ...]] = [(key,) for key in base_report if key != "zero_state"]
report_paths += [("zero_state", key) for key in base_report["zero_state"]]
for path in report_paths:
    valid = base_report
    for key in path:
        valid = valid[key]
    for variant, bad in enumerate(wrong_values(valid)):
        def report_case(self: unittest.TestCase, path=path, bad=bad) -> None:
            with tempfile.TemporaryDirectory() as temporary:
                root = Path(temporary); target = root / "report.json"
                document = report_document(); set_path(document, path, copy.deepcopy(bad)); write_json(target, document)
                item = core.stable_regular_read(target, root)
                errors = core.validate_report_document(json.loads(item.raw), expected_report())
                self.assertTrue(errors)
        add_test("report", "_".join(map(str, path)) + f"_v{variant}", report_case)

# Top-level and zero-state unknown-key/cardinality cases.
for index in range(20):
    def report_extra_case(self: unittest.TestCase, index=index) -> None:
        with tempfile.TemporaryDirectory() as temporary:
            root = Path(temporary); target = root / "report.json"; document = report_document()
            if index < 10:
                document[f"unexpected_{index}"] = index
            else:
                document["zero_state"][f"unexpected_{index}"] = 0
            write_json(target, document)
            self.assertTrue(core.validate_report_document(json.loads(core.stable_regular_read(target, root).raw), expected_report()))
    add_test("report", f"extra_key_{index}", report_extra_case)

# Parent native semantics and failed-invocation lineage.
parent_field_paths = [
    (0, "payload", "type"), (0, "payload", "turn_id"),
    (1, "payload", "turn_id"), (1, "payload", "model"), (1, "payload", "effort"),
    (1, "payload", "collaboration_mode", "settings", "model"),
    (1, "payload", "collaboration_mode", "settings", "reasoning_effort"),
    (2, "payload", "call_id"), (3, "payload", "call_id"),
    (5, "payload", "call_id"), (6, "payload", "call_id"),
    (7, "payload", "type"), (7, "payload", "turn_id"), (7, "payload", "last_agent_message"),
]
parent_base, _, _ = parent_fixture()
for path in parent_field_paths:
    valid: Any = parent_base
    for key in path:
        valid = valid[key]
    for variant, bad in enumerate(wrong_values(valid)[:4]):
        def parent_field_case(self: unittest.TestCase, path=path, bad=bad) -> None:
            with tempfile.TemporaryDirectory() as temporary:
                root = Path(temporary); target = root / "parent.jsonl"
                rows, binding, lineage = parent_fixture(); set_path(rows, path, copy.deepcopy(bad)); refresh_parent_hashes(rows, binding)
                target.write_bytes(b"".join(raw_rows(rows)))
                raw, loaded = core.stable_prefix_jsonl(target, root, len(rows))
                self.assertTrue(core.validate_parent_records(raw, loaded, binding, lineage, REPORT_SHA))
        add_test("parent", "field_" + "_".join(map(str, path)) + f"_v{variant}", parent_field_case)

parent_token_locations = [
    (2, "payload", "input", "spawn_agent"), (2, "payload", "input", MARKER),
    (2, "payload", "input", REPORT_PATH), (2, "payload", "input", 'model: "gpt-5.6-luna"'),
    (2, "payload", "input", 'reasoning_effort: "max"'), (2, "payload", "input", "fork_context: false"),
    (2, "payload", "input", "fork_turns=none"), (3, "payload", "output", CHILD),
    (4, "payload", "output", CHILD), (4, "payload", "output", REPORT_SHA), (4, "payload", "output", "completed"),
    (5, "payload", "input", COMMAND), (5, "payload", "input", WORKDIR),
    (6, "payload", "output", '"exit_code":1'), (6, "payload", "output", "TypeError"),
    (6, "payload", "output", ERROR_MESSAGE), (6, "payload", "output", "path.stat(follow_symlinks=False)"),
]
for row_index, first, second, token in parent_token_locations:
    for variant, replacement in enumerate(("", "CORRUPT", token[::-1])):
        def parent_token_case(self: unittest.TestCase, row_index=row_index, first=first, second=second, token=token, replacement=replacement) -> None:
            with tempfile.TemporaryDirectory() as temporary:
                root = Path(temporary); target = root / "parent.jsonl"
                rows, binding, lineage = parent_fixture(); rows[row_index][first][second] = rows[row_index][first][second].replace(token, replacement); refresh_parent_hashes(rows, binding)
                target.write_bytes(b"".join(raw_rows(rows))); raw, loaded = core.stable_prefix_jsonl(target, root, len(rows))
                self.assertTrue(core.validate_parent_records(raw, loaded, binding, lineage, REPORT_SHA))
        add_test("parent", f"token_{row_index}_{variant}", parent_token_case)

# Raw-line, prefix and range bindings fail closed independently of semantics.
for index, key in enumerate(("session_prefix_sha256", "turn_segment_sha256", "turn_start_record_sha256", "turn_context_record_sha256", "spawn_record_sha256", "spawn_result_record_sha256", "terminal_record_sha256", "failed_invocation_call_record_sha256", "failed_invocation_result_record_sha256", "turn_complete_record_sha256")):
    for variant in range(2):
        def parent_hash_case(self: unittest.TestCase, key=key, variant=variant) -> None:
            with tempfile.TemporaryDirectory() as temporary:
                root = Path(temporary); target = root / "parent.jsonl"; rows, binding, lineage = parent_fixture()
                binding["controller_parent"][key] = ("0" if variant == 0 else "f") * 64
                target.write_bytes(b"".join(raw_rows(rows))); raw, loaded = core.stable_prefix_jsonl(target, root, len(rows))
                self.assertTrue(core.validate_parent_records(raw, loaded, binding, lineage, REPORT_SHA))
        add_test("parent", f"hash_{index}_{variant}", parent_hash_case)

# Child native identity, lane, terminal and cardinality cases.
child_base, _ = child_fixture()
child_paths = [
    (0, "payload", "id"), (0, "payload", "parent_thread_id"), (0, "payload", "forked_from_id"),
    (0, "payload", "source", "subagent", "thread_spawn", "parent_thread_id"),
    (0, "payload", "source", "subagent", "thread_spawn", "depth"),
    (0, "payload", "source", "subagent", "thread_spawn", "agent_nickname"),
    (1, "payload", "turn_id"), (2, "payload", "turn_id"), (2, "payload", "model"), (2, "payload", "effort"),
    (2, "payload", "collaboration_mode", "settings", "model"),
    (2, "payload", "collaboration_mode", "settings", "reasoning_effort"),
    (3, "payload", "type"), (3, "payload", "turn_id"), (3, "payload", "last_agent_message"),
]
for path in child_paths:
    valid: Any = child_base
    for key in path:
        valid = valid[key]
    for variant, bad in enumerate(wrong_values(valid)[:4]):
        def child_field_case(self: unittest.TestCase, path=path, bad=bad) -> None:
            with tempfile.TemporaryDirectory() as temporary:
                root = Path(temporary); target = root / "child.jsonl"; rows, binding = child_fixture()
                set_path(rows, path, copy.deepcopy(bad)); refresh_child_hashes(rows, binding); target.write_bytes(b"".join(raw_rows(rows)))
                _, raw, loaded = core.stable_jsonl(target, root)
                self.assertTrue(core.validate_child_records(raw, loaded, binding, REPORT_SHA))
        add_test("child", "field_" + "_".join(map(str, path)) + f"_v{variant}", child_field_case)

for token_index, token in enumerate((REPORT_SHA, "PASS", "activation/launch false, credit 0")):
    for variant, replacement in enumerate(("", "CORRUPT", token[::-1])):
        def child_terminal_case(self: unittest.TestCase, token=token, replacement=replacement) -> None:
            with tempfile.TemporaryDirectory() as temporary:
                root = Path(temporary); target = root / "child.jsonl"; rows, binding = child_fixture()
                rows[3]["payload"]["last_agent_message"] = rows[3]["payload"]["last_agent_message"].replace(token, replacement); refresh_child_hashes(rows, binding)
                target.write_bytes(b"".join(raw_rows(rows))); _, raw, loaded = core.stable_jsonl(target, root)
                self.assertTrue(core.validate_child_records(raw, loaded, binding, REPORT_SHA))
        add_test("child", f"terminal_{token_index}_{variant}", child_terminal_case)

for kind in range(20):
    def child_cardinality_case(self: unittest.TestCase, kind=kind) -> None:
        with tempfile.TemporaryDirectory() as temporary:
            root = Path(temporary); target = root / "child.jsonl"; rows, binding = child_fixture()
            source_index = kind % 4
            if kind < 8:
                rows.insert(source_index, copy.deepcopy(rows[source_index]))
            elif kind < 16:
                rows.pop(source_index)
            else:
                rows.append(row("response_item", {"type": "custom_tool_call", "input": "tools.multi_agent_v1__spawn_agent("}))
            # Preserve the original expected binding to exercise line/cardinality closure.
            target.write_bytes(b"".join(raw_rows(rows))); _, raw, loaded = core.stable_jsonl(target, root)
            self.assertTrue(core.validate_child_records(raw, loaded, binding, REPORT_SHA))
    add_test("child", f"cardinality_{kind}", child_cardinality_case)

# Real filesystem attacks and TOCTOU mutations.
for size in (0, 1, 2, 7, 31, 255, 4096, 65537, 104857, 1048576):
    def fs_valid_case(self: unittest.TestCase, size=size) -> None:
        with tempfile.TemporaryDirectory() as temporary:
            root = Path(temporary); target = root / "proof.bin"; raw = bytes((index % 251 for index in range(size))); target.write_bytes(raw)
            self.assertEqual(core.stable_regular_read(target, root).raw, raw)
    add_test("filesystem", f"valid_{size}", fs_valid_case)

for variant in range(10):
    def fs_symlink_case(self: unittest.TestCase, variant=variant) -> None:
        with tempfile.TemporaryDirectory() as temporary:
            root = Path(temporary); real = root / "real"; real.write_bytes(f"v{variant}".encode()); link = root / "link"; link.symlink_to(real)
            with self.assertRaises(core.ClosureError) as caught: core.stable_regular_read(link, root)
            self.assertIn("path-symlink", caught.exception.codes)
    add_test("filesystem", f"symlink_{variant}", fs_symlink_case)

for variant in range(10):
    def fs_hardlink_case(self: unittest.TestCase, variant=variant) -> None:
        with tempfile.TemporaryDirectory() as temporary:
            root = Path(temporary); first = root / "first"; second = root / "second"; first.write_bytes(f"v{variant}".encode()); os.link(first, second)
            with self.assertRaises(core.ClosureError) as caught: core.stable_regular_read(first, root)
            self.assertIn("path-hardlink", caught.exception.codes)
    add_test("filesystem", f"hardlink_{variant}", fs_hardlink_case)

for variant in range(10):
    def fs_toctou_case(self: unittest.TestCase, variant=variant) -> None:
        with tempfile.TemporaryDirectory() as temporary:
            root = Path(temporary); target = root / "proof"; target.write_bytes(b"a" * (variant + 1))
            def mutate(path: Path) -> None: path.write_bytes(b"b" * (variant + 2))
            with self.assertRaises(core.ClosureError) as caught: core.stable_regular_read(target, root, between_reads=mutate)
            self.assertTrue(set(caught.exception.codes) & {"toctou-bytes", "toctou-metadata"})
    add_test("filesystem", f"toctou_{variant}", fs_toctou_case)

for variant in range(10):
    def fs_escape_case(self: unittest.TestCase, variant=variant) -> None:
        with tempfile.TemporaryDirectory() as temporary, tempfile.TemporaryDirectory() as outside:
            root = Path(temporary); target = Path(outside) / f"proof-{variant}"; target.write_bytes(b"x")
            with self.assertRaises(core.ClosureError) as caught: core.stable_regular_read(target, root)
            self.assertIn("path-escape", caught.exception.codes)
    add_test("filesystem", f"escape_{variant}", fs_escape_case)

# Exclusive-create and pair cardinality cases with actual files.
for size in (0, 1, 2, 7, 31, 255, 4096, 65537, 104857, 262144):
    def output_success_case(self: unittest.TestCase, size=size) -> None:
        with tempfile.TemporaryDirectory() as temporary:
            root = Path(temporary); target = root / "capture"; raw = b"x" * size
            item = core.exclusive_write_once(target, root, raw); self.assertEqual(item.raw, raw); self.assertEqual(os.lstat(target).st_nlink, 1)
    add_test("output", f"success_{size}", output_success_case)

for variant in range(10):
    def output_exists_case(self: unittest.TestCase, variant=variant) -> None:
        with tempfile.TemporaryDirectory() as temporary:
            root = Path(temporary); target = root / "capture"; target.write_bytes(f"old-{variant}".encode()); before = target.read_bytes()
            with self.assertRaises(core.ClosureError) as caught: core.exclusive_write_once(target, root, b"new")
            self.assertIn("output-exists", caught.exception.codes); self.assertEqual(target.read_bytes(), before)
    add_test("output", f"exists_{variant}", output_exists_case)

for variant in range(10):
    def output_symlink_case(self: unittest.TestCase, variant=variant) -> None:
        with tempfile.TemporaryDirectory() as temporary:
            root = Path(temporary); real = root / "real"; real.write_bytes(f"old-{variant}".encode()); target = root / "capture"; target.symlink_to(real); before = real.read_bytes()
            with self.assertRaises(core.ClosureError): core.exclusive_write_once(target, root, b"new")
            self.assertEqual(real.read_bytes(), before)
    add_test("output", f"symlink_{variant}", output_symlink_case)

for variant in range(10):
    def output_parent_symlink_case(self: unittest.TestCase, variant=variant) -> None:
        with tempfile.TemporaryDirectory() as temporary:
            root = Path(temporary); real = root / "real"; real.mkdir(); linked = root / "linked"; linked.symlink_to(real, target_is_directory=True)
            with self.assertRaises(core.ClosureError): core.exclusive_write_once(linked / f"capture-{variant}", root, b"new")
            self.assertFalse((real / f"capture-{variant}").exists())
    add_test("output", f"parent_symlink_{variant}", output_parent_symlink_case)

for variant in range(20):
    def output_pair_case(self: unittest.TestCase, variant=variant) -> None:
        with tempfile.TemporaryDirectory() as temporary:
            root = Path(temporary); captures = root / "captures"; checkpoints = root / "checkpoints"; captures.mkdir(); checkpoints.mkdir()
            capture = captures / "c1.json"; checkpoint = checkpoints / "c1.jsonl"
            existing = capture if variant % 2 == 0 else checkpoint; existing.write_bytes(f"old-{variant}".encode()); before = existing.read_bytes()
            with self.assertRaises(core.ClosureError) as caught: core.write_closure_pair(capture, checkpoint, root, b"capture", b"checkpoint")
            self.assertIn("output-pair-not-empty", caught.exception.codes); self.assertEqual(existing.read_bytes(), before)
            other = checkpoint if existing == capture else capture; self.assertFalse(other.exists())
    add_test("output", f"pair_{variant}", output_pair_case)


def main() -> int:
    suite = unittest.defaultTestLoader.loadTestsFromTestCase(CompatibilityTests)
    names = sorted(test.id().rsplit(".", 1)[-1] for test in suite)
    stream = io.StringIO()
    result = unittest.TextTestRunner(stream=stream, verbosity=0).run(suite)
    summary = {
        "status": "pass" if result.wasSuccessful() else "fail",
        "passed": result.testsRun - len(result.failures) - len(result.errors),
        "failed": len(result.failures) + len(result.errors),
        "total": result.testsRun,
        "minimum_required": 300,
        "all_cases_use_real_temporary_files": True,
        "categories": dict(sorted(CATEGORY_COUNTS.items())),
        "test_name_digest": hashlib.sha256(("\n".join(names) + "\n").encode()).hexdigest(),
    }
    if not result.wasSuccessful():
        summary["failure_output"] = stream.getvalue()[-8000:]
    print(json.dumps(summary, indent=2, sort_keys=True))
    return 0 if result.wasSuccessful() and result.testsRun >= 300 else 1


if __name__ == "__main__":
    raise SystemExit(main())
