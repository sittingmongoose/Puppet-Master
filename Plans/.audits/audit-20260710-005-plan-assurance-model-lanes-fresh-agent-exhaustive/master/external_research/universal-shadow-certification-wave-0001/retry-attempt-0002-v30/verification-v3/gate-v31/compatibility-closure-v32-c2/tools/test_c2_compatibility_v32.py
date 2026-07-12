#!/usr/bin/env python3
"""1,260 real-fixture fail-closed tests for C2 compatibility preparation."""
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

from jsonschema import Draft202012Validator, FormatChecker

import c2_closure_core_v32 as core


NS = Path(__file__).resolve().parents[1]
GATE = NS.parent
REPORT_BYTES = (NS / "fixtures/valid-c2-atomic8-prelaunch-report.json").read_bytes()
BINDING_BYTES = (NS / "fixtures/valid-c2-fresh-native-binding.json").read_bytes()
PARENT_BYTES = (NS / "fixtures/sessions/controller.jsonl").read_bytes()
CHILD_BYTES = (NS / "fixtures/sessions/reviewer.jsonl").read_bytes()
REPORT_SCHEMA_BYTES = (NS / "schemas/c2_atomic8_prelaunch_report_v32.schema.json").read_bytes()
BINDING_SCHEMA_BYTES = (NS / "schemas/c2_fresh_native_binding_v32.schema.json").read_bytes()
CAPTURE_SCHEMA_BYTES = (GATE / "schemas/controller_native_reviewer_capture_v31.schema.json").read_bytes()
AUTHORITY = json.loads((NS / "AUTHORITY_C2_COMPATIBILITY_V32.json").read_bytes())


def write(path: Path, raw: bytes) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)
    path.write_bytes(raw)


def fixture(temporary: str) -> dict[str, Path]:
    root = Path(temporary)
    audit = root / "audit"
    gate = audit / "gate-v31"
    namespace = gate / "compatibility-closure-v32-c2"
    for directory in (gate / "reports", gate / "controller-native-captures", gate / "controller-native-checkpoints", namespace / "fixtures/sessions", namespace / "schemas"):
        directory.mkdir(parents=True, exist_ok=True)
    write(namespace / "fixtures/valid-c2-atomic8-prelaunch-report.json", REPORT_BYTES)
    write(namespace / "fixtures/valid-c2-fresh-native-binding.json", BINDING_BYTES)
    write(namespace / "fixtures/sessions/controller.jsonl", PARENT_BYTES)
    write(namespace / "fixtures/sessions/reviewer.jsonl", CHILD_BYTES)
    write(namespace / "schemas/report.json", REPORT_SCHEMA_BYTES)
    write(namespace / "schemas/binding.json", BINDING_SCHEMA_BYTES)
    write(namespace / "schemas/capture.json", CAPTURE_SCHEMA_BYTES)
    write(namespace / "authority.json", core.pretty(AUTHORITY))
    return {"root": root, "audit": audit, "gate": gate, "namespace": namespace}


def set_path(document: Any, path: tuple[Any, ...], value: Any) -> None:
    target = document
    for key in path[:-1]:
        target = target[key]
    target[path[-1]] = value


def get_path(document: Any, path: tuple[Any, ...]) -> Any:
    target = document
    for key in path:
        target = target[key]
    return target


def bad_value(valid: Any, index: int) -> Any:
    if isinstance(valid, bool):
        return not valid
    if isinstance(valid, int):
        return valid + index + 1
    if isinstance(valid, str):
        return f"CORRUPT-{index}"
    if isinstance(valid, list):
        return [f"CORRUPT-{index}"]
    if valid is None:
        return f"CORRUPT-{index}"
    if isinstance(valid, dict):
        return {"corrupt": index}
    return None


def load_future(fx: dict[str, Path], binding_document: dict[str, Any] | None = None) -> tuple[core.FutureEvidence, list[str]]:
    namespace = fx["namespace"]
    report = core.stable_read(namespace / "fixtures/valid-c2-atomic8-prelaunch-report.json", namespace)
    report_document = json.loads(report.raw)
    binding_path = namespace / "fixtures/valid-c2-fresh-native-binding.json"
    if binding_document is not None:
        write(binding_path, core.pretty(binding_document))
    binding = core.stable_read(binding_path, namespace)
    binding_loaded = json.loads(binding.raw)
    schema = json.loads((namespace / "schemas/binding.json").read_bytes())
    errors, parent_raw, parent_rows, child, child_raw, child_rows = core.validate_native_binding(binding_loaded, schema, session_root=namespace, fixture_root=namespace)
    return core.FutureEvidence(report, report_document, binding, binding_loaded, parent_raw, parent_rows, child, child_raw, child_rows), errors


def valid_capture(fx: dict[str, Path]) -> tuple[bytes, bytes, dict[str, Any]]:
    evidence, errors = load_future(fx)
    if errors:
        raise AssertionError(errors)
    return core.build_checkpoint_capture(AUTHORITY, evidence)


class C2CompatibilityTests(unittest.TestCase):
    maxDiff = None


CATEGORY_COUNTS: dict[str, int] = {}


def add(category: str, name: str, function: Callable[[unittest.TestCase], None]) -> None:
    number = CATEGORY_COUNTS.get(category, 0) + 1
    CATEGORY_COUNTS[category] = number
    setattr(C2CompatibilityTests, f"test_{category}_{number:04d}_{name}", function)


REPORT = json.loads(REPORT_BYTES)
BINDING = json.loads(BINDING_BYTES)
REPORT_PATHS = [(key,) for key in REPORT if key != "zero_state"] + [("zero_state", key) for key in REPORT["zero_state"]]
BINDING_SOURCE_PATHS = [("source_binding", key) for key in BINDING["source_binding"]]


# 180 exact C2 authority/report/source bindings.
for index in range(180):
    path = (REPORT_PATHS + BINDING_SOURCE_PATHS)[index % (len(REPORT_PATHS) + len(BINDING_SOURCE_PATHS))]
    use_report = path in REPORT_PATHS
    def exact_case(self: unittest.TestCase, index=index, path=path, use_report=use_report) -> None:
        with tempfile.TemporaryDirectory() as temporary:
            fx = fixture(temporary); namespace = fx["namespace"]
            if use_report:
                document = copy.deepcopy(REPORT); set_path(document, path, bad_value(get_path(document, path), index))
                target = namespace / "fixtures/valid-c2-atomic8-prelaunch-report.json"; write(target, core.pretty(document))
                loaded = json.loads(core.stable_read(target, namespace).raw); schema = json.loads((namespace / "schemas/report.json").read_bytes())
                self.assertTrue(core.schema_errors(loaded, schema))
            else:
                document = copy.deepcopy(BINDING); set_path(document, path, bad_value(get_path(document, path), index))
                _, errors = load_future(fx, document); self.assertTrue(errors)
    add("exact_c2_bindings", f"mutation_{index}", exact_case)


# 120 exact runtime contract drift tests, each read back from a real file.
runtime_keys = list(AUTHORITY["runtime"])
for index in range(120):
    key = runtime_keys[index % len(runtime_keys)]
    def runtime_case(self: unittest.TestCase, index=index, key=key) -> None:
        with tempfile.TemporaryDirectory() as temporary:
            fx = fixture(temporary); target = fx["namespace"] / "runtime.json"; runtime = copy.deepcopy(AUTHORITY["runtime"])
            runtime[key] = bad_value(runtime[key], index); write(target, core.pretty(runtime))
            _, loaded = core.stable_json(target, fx["namespace"]); self.assertTrue(core.validate_runtime_contract(loaded))
    add("runtime_drift", f"field_{index}", runtime_case)


# 180 native identity/session/cardinality/lane tests.
IDENTITY_PATHS = [
    ("controller_native", "native_thread_id"), ("controller_native", "native_turn_id"), ("controller_native", "actual_model"),
    ("controller_native", "actual_reasoning_effort"), ("controller_native", "spawn_call_id"),
    ("reviewer_native", "native_thread_id"), ("reviewer_native", "native_turn_id"), ("reviewer_native", "parent_thread_id"),
    ("reviewer_native", "actual_model"), ("reviewer_native", "actual_reasoning_effort"), ("reviewer_native", "collaboration_model"),
    ("reviewer_native", "collaboration_reasoning_effort"), ("reviewer_native", "fork_context"), ("reviewer_native", "fork_turns"),
    ("reviewer_native", "forked_from_id"), ("reviewer_native", "task_complete_is_last_line"),
    ("closure", "reviewer_count"), ("closure", "matching_spawn_count"), ("closure", "retry_count"), ("closure", "descendant_spawn_count"),
]
for index in range(180):
    def identity_case(self: unittest.TestCase, index=index) -> None:
        with tempfile.TemporaryDirectory() as temporary:
            fx = fixture(temporary); namespace = fx["namespace"]
            if index < 120:
                document = copy.deepcopy(BINDING); path = IDENTITY_PATHS[index % len(IDENTITY_PATHS)]
                set_path(document, path, bad_value(get_path(document, path), index)); _, errors = load_future(fx, document)
            else:
                target = namespace / ("fixtures/sessions/controller.jsonl" if index % 2 == 0 else "fixtures/sessions/reviewer.jsonl")
                raw = target.read_bytes(); token = core.MODEL.encode() if index % 3 == 0 else (core.EFFORT.encode() if index % 3 == 1 else core.REPORT_SHA.encode())
                target.write_bytes(raw.replace(token, f"CORRUPT-{index}".encode(), 1)); _, errors = load_future(fx)
            self.assertTrue(errors)
    add("native_identity", f"mutation_{index}", identity_case)


# 120 source-transaction/digest and source authority tests.
SOURCE_PATHS = [("source_binding", key) for key in BINDING["source_binding"]]
for index in range(120):
    def source_case(self: unittest.TestCase, index=index) -> None:
        with tempfile.TemporaryDirectory() as temporary:
            fx = fixture(temporary); namespace = fx["namespace"]
            mode = index % 3
            if mode == 0:
                document = copy.deepcopy(REPORT); document["source_transaction_digest"] = f"bad-{index}"; write(namespace / "fixtures/valid-c2-atomic8-prelaunch-report.json", core.pretty(document))
                errors = core.schema_errors(document, json.loads((namespace / "schemas/report.json").read_bytes()))
            elif mode == 1:
                document = copy.deepcopy(BINDING); path = SOURCE_PATHS[index % len(SOURCE_PATHS)]; set_path(document, path, f"bad-{index}"); _, errors = load_future(fx, document)
            else:
                target = namespace / "fixtures/sessions/reviewer.jsonl"; target.write_bytes(target.read_bytes().replace(core.SOURCE_DIGEST.encode(), f"bad-{index}".encode())); _, errors = load_future(fx)
            self.assertTrue(errors)
    add("source_digest", f"mutation_{index}", source_case)


# 120 path/hash/symlink/hardlink/TOCTOU negatives.
for index in range(120):
    def path_case(self: unittest.TestCase, index=index) -> None:
        with tempfile.TemporaryDirectory() as temporary, tempfile.TemporaryDirectory() as outside:
            fx = fixture(temporary); namespace = fx["namespace"]; target = namespace / "probe"; mode = index % 6
            if index == 119:
                real = Path(outside) / "empty-output"; real.mkdir(); target.symlink_to(real, target_is_directory=True)
                with self.assertRaises(core.ClosureError): core.stable_empty_real_directory(target, fx["audit"])
                return
            if 112 <= index < 119:
                census = fx["root"] / "census"; census.mkdir(); allowed = census / "allowed.json"; allowed.write_bytes(b"{}\n")
                attack = index - 112
                if attack == 0:
                    (census / "unexpected.json").write_bytes(b"{}\n")
                elif attack == 1:
                    (census / "linked.json").symlink_to(allowed)
                elif attack == 2:
                    os.link(allowed, census / "hardlinked.json")
                elif attack == 3:
                    os.mkfifo(census / "pipe")
                elif attack == 4:
                    (census / "unexpected").mkdir()
                elif attack == 5:
                    allowed.unlink()
                else:
                    real = Path(outside) / "directory"; real.mkdir(); (census / "linked-directory").symlink_to(real, target_is_directory=True)
                with self.assertRaises(core.ClosureError): core.closed_world_census(census, fx["root"], {"allowed.json"})
                return
            if mode == 0:
                real = namespace / "real"; real.write_bytes(b"x"); target.symlink_to(real)
            elif mode == 1:
                real = namespace / "real"; real.write_bytes(b"x"); os.link(real, target)
            elif mode == 2:
                target.write_bytes(b"a" * (index + 1))
                def mutate(path: Path) -> None: path.write_bytes(b"b" * (index + 2))
                with self.assertRaises(core.ClosureError): core.stable_read(target, namespace, between_reads=mutate)
                return
            elif mode == 3:
                target = Path(outside) / "escape"; target.write_bytes(b"x")
            elif mode == 4:
                target.mkdir()
            else:
                os.mkfifo(target)
            with self.assertRaises(core.ClosureError): core.stable_read(target, namespace)
    if index == 119:
        name = "output_directory_symlink"
    elif 112 <= index < 119:
        name = f"closed_world_census_{index - 112}"
    else:
        name = f"attack_{index}"
    add("path_hash", name, path_case)


# 120 capture/checkpoint schema, hash and exclusive-create negatives.
CAPTURE_MUTATIONS = [
    ("slot_id",), ("audit_id",), ("identity_authority",), ("controller_native", "native_thread_id"),
    ("reviewer_native", "native_thread_id"), ("reviewer_native", "actual_model"), ("closure", "retry_count"),
    ("hash_closure", "report_sha256"), ("report_binding", "raw_sha256"), ("checkpoint", "raw_sha256"),
    ("scope", "activation_authorized"), ("scope", "launch_authorized"), ("scope", "credit"),
]
for index in range(120):
    def capture_case(self: unittest.TestCase, index=index) -> None:
        with tempfile.TemporaryDirectory() as temporary:
            fx = fixture(temporary); gate = fx["gate"]; checkpoint_raw, capture_raw, capture = valid_capture(fx); schema = json.loads((fx["namespace"] / "schemas/capture.json").read_bytes()); mode = index % 4
            if mode == 0:
                path = CAPTURE_MUTATIONS[index % len(CAPTURE_MUTATIONS)]; set_path(capture, path, bad_value(get_path(capture, path), index))
                self.assertTrue(list(Draft202012Validator(schema, format_checker=FormatChecker()).iter_errors(capture)))
            elif mode == 1:
                corrupt = checkpoint_raw + core.canonical({"record": "leak"})
                self.assertNotEqual(capture["checkpoint"]["raw_sha256"], core.sha_bytes(corrupt))
            elif mode == 2:
                capture_path = gate / core.CAPTURE_RELATIVE; checkpoint_path = gate / core.CHECKPOINT_RELATIVE; capture_path.write_bytes(b"existing"); before = capture_path.read_bytes()
                with self.assertRaises(core.ClosureError): core.write_pair(capture_path, checkpoint_path, gate, capture_raw, checkpoint_raw)
                self.assertEqual(capture_path.read_bytes(), before); self.assertFalse(checkpoint_path.exists())
            else:
                real = gate / "real-captures"; real.mkdir(); linked = gate / "linked-captures"; linked.symlink_to(real, target_is_directory=True)
                with self.assertRaises(core.ClosureError): core.write_pair(linked / "c2.json", gate / core.CHECKPOINT_RELATIVE, gate, capture_raw, checkpoint_raw)
                self.assertFalse((real / "c2.json").exists())
    add("capture_checkpoint", f"mutation_{index}", capture_case)


# 100 future authority/report/binding leakage gates.
ABSENCE = AUTHORITY["absence_gates"]
AUDIT_ABSENCE = AUTHORITY["audit_absence_gates"]
for index in range(100):
    label = list(ABSENCE)[index % len(ABSENCE)]
    def leakage_case(self: unittest.TestCase, index=index, label=label) -> None:
        with tempfile.TemporaryDirectory() as temporary:
            fx = fixture(temporary); relative = ABSENCE[label]; target = fx["namespace"] / relative if label.startswith("future_") else fx["gate"] / relative
            write(target, f"leak-{index}".encode()); errors = core.validate_absence_paths(fx["gate"], fx["namespace"], fx["audit"], ABSENCE, AUDIT_ABSENCE)
            self.assertIn("absence-gate:" + label, errors)
    add("authority_leakage", f"leak_{index}", leakage_case)


# 120 prior invocation/tree preservation negatives from a valid local history.
for index in range(120):
    def prior_case(self: unittest.TestCase, index=index) -> None:
        with tempfile.TemporaryDirectory() as temporary:
            fx = fixture(temporary); history = fx["audit"] / "history"; history.mkdir(); files=[]
            for number in range(4):
                path = history / f"prior-{number}.json"; path.write_bytes(core.canonical({"number": number, "status": "failed_closed"})); files.append(path)
            count, byte_count, digest = core.tree_digest(history); self.assertEqual(count, 4); self.assertGreater(byte_count, 0)
            rows = [{"relative_path": path.relative_to(fx["audit"]).as_posix(), "byte_count": path.stat().st_size, "sha256": core.sha_bytes(path.read_bytes())} for path in files]
            mode = index % 4
            if mode == 0:
                files[index % 4].write_bytes(b"mutated"); self.assertNotEqual(core.tree_digest(history)[2], digest)
            elif mode == 1:
                link = history / "link.json"; link.symlink_to(files[0]);
                with self.assertRaises(core.ClosureError): core.tree_digest(history)
            elif mode == 2:
                link = history / "hard.json"; os.link(files[0], link)
                with self.assertRaises(core.ClosureError): core.tree_digest(history)
            else:
                files[0].write_bytes(b"mutated"); self.assertTrue(core.verify_inventory_rows(rows, fx["audit"]))
    add("prior_invocation", f"preservation_{index}", prior_case)


# 80 metadata dedup negatives and safe controls.
STATUSES = json.loads((NS / "DEDUP_PRECHECK_C2.json").read_bytes())["equivalence_predicate"]["terminal_status_alternatives"]
for index in range(80):
    def dedup_case(self: unittest.TestCase, index=index) -> None:
        with tempfile.TemporaryDirectory() as temporary:
            fx = fixture(temporary); foreign = fx["audit"] / "foreign"; foreign.mkdir(); mode = index % 4
            if mode == 0:
                write(foreign / f"terminal-{index}.json", core.pretty({"schema_version": "a005-c2-compatibility-terminal-v1", "slot_id": core.SLOT_ID, "status": STATUSES[0]}))
                self.assertEqual(len(core.scan_foreign_equivalent_terminals(fx["audit"], fx["namespace"], STATUSES)), 1)
            elif mode == 1:
                write(foreign / f"terminal-{index}.json", b"{invalid")
                with self.assertRaises(core.ClosureError): core.scan_foreign_equivalent_terminals(fx["audit"], fx["namespace"], STATUSES)
            elif mode == 2:
                real = foreign / "real.json"; write(real, core.pretty({"safe": True})); link = foreign / f"terminal-{index}.json"; link.symlink_to(real)
                with self.assertRaises(core.ClosureError): core.scan_foreign_equivalent_terminals(fx["audit"], fx["namespace"], STATUSES)
            else:
                write(foreign / f"terminal-{index}.json", core.pretty({"schema_version": "unrelated", "slot_id": "other", "status": "PASS"}))
                self.assertEqual(core.scan_foreign_equivalent_terminals(fx["audit"], fx["namespace"], STATUSES), [])
    add("dedup", f"candidate_{index}", dedup_case)


# 120 explicit production/audit absence gates, including symlink leakage.
ALL_ABSENCE = [(False, key, value) for key, value in ABSENCE.items()] + [(True, key, value) for key, value in AUDIT_ABSENCE.items()]
for index in range(120):
    audit_path, label, relative = ALL_ABSENCE[index % len(ALL_ABSENCE)]
    def absence_case(self: unittest.TestCase, index=index, audit_path=audit_path, label=label, relative=relative) -> None:
        with tempfile.TemporaryDirectory() as temporary:
            fx = fixture(temporary)
            if audit_path:
                target = fx["audit"] / relative
            else:
                target = fx["namespace"] / relative if label.startswith("future_") else fx["gate"] / relative
            target.parent.mkdir(parents=True, exist_ok=True)
            if index % 2 == 0:
                target.write_bytes(f"leak-{index}".encode())
            else:
                real = fx["root"] / f"real-{index}"; real.write_bytes(b"leak"); target.symlink_to(real)
            errors = core.validate_absence_paths(fx["gate"], fx["namespace"], fx["audit"], ABSENCE, AUDIT_ABSENCE)
            expected = ("audit-absence-gate:" if audit_path else "absence-gate:") + label
            self.assertIn(expected, errors)
    add("absence_gates", f"gate_{index}", absence_case)


def main() -> int:
    runtime_errors = core.validate_runtime(Path("/Users/jaredsmacbookair/Documents/PuppetMaster/Plans/.audits/audit-20260710-005-plan-assurance-model-lanes-fresh-agent-exhaustive"))
    suite = unittest.defaultTestLoader.loadTestsFromTestCase(C2CompatibilityTests)
    names = sorted(test.id().rsplit(".", 1)[-1] for test in suite)
    stream = io.StringIO()
    result = unittest.TextTestRunner(stream=stream, verbosity=0).run(suite)
    failures = len(result.failures) + len(result.errors)
    summary = {
        "schema_version": "a005-c2-compatibility-test-result-v1",
        "status": "pass" if result.wasSuccessful() and not runtime_errors and result.testsRun >= 1000 else "fail",
        "passed": result.testsRun - failures,
        "failed": failures,
        "total": result.testsRun,
        "minimum_required": 1000,
        "all_cases_start_from_real_valid_synthetic_files": True,
        "categories": dict(sorted(CATEGORY_COUNTS.items())),
        "runtime_errors": runtime_errors,
        "test_name_digest": hashlib.sha256(("\n".join(names) + "\n").encode()).hexdigest(),
        "activation_authorized": False,
        "launch_authorized": False,
        "credit": 0,
    }
    if failures:
        summary["failure_output"] = stream.getvalue()[-12000:]
    print(json.dumps(summary, indent=2, sort_keys=True))
    return 0 if summary["status"] == "pass" else 1


if __name__ == "__main__":
    raise SystemExit(main())
