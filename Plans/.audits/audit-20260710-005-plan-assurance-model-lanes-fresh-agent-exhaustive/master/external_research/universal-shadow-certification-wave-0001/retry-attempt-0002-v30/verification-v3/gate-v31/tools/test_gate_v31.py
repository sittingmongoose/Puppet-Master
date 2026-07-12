#!/usr/bin/env python3
"""825 preserved cases plus exactly 142 V31 controller-native cases."""
from __future__ import annotations

import copy
import hashlib
import importlib.util
import json
from pathlib import Path
from typing import Any


HERE = Path(__file__).resolve().parents[1]
VERIFIER = HERE / "tools/verify_gate_v31.py"
spec = importlib.util.spec_from_file_location("gate_v31_verifier", VERIFIER)
module = importlib.util.module_from_spec(spec)
assert spec.loader
spec.loader.exec_module(module)


def mutate(value: dict[str, Any], path: tuple[str, ...], replacement: Any = None, *, delete: bool = False, add: bool = False) -> dict[str, Any]:
    result = copy.deepcopy(value)
    node: dict[str, Any] = result
    for key in path[:-1]:
        node = node[key]
    if delete:
        node.pop(path[-1], None)
    else:
        node[path[-1]] = replacement
    return result


def build_fixtures(authority: dict[str, Any]) -> dict[str, dict[str, Any]]:
    c1 = module.load(HERE / authority["slots"]["c1-primary-rejected-set-postrun"]["capture_path"])
    c2 = module.load(HERE / authority["slots"]["c2-primary-rejected-set-postrun"]["capture_path"])
    fixtures = {
        "c1-primary-rejected-set-postrun": c1,
        "c2-primary-rejected-set-postrun": c2,
    }
    future_specs = {
        "c1-atomic8-prelaunch": {
            "source": c1,
            "thread": "019f6000-0001-7001-8001-000000000001",
            "turn": "019f6000-0001-7002-8002-000000000002",
            "session": "1" * 64,
            "report": "2" * 64,
            "checkpoint": "3" * 64,
        },
        "c2-atomic8-prelaunch": {
            "source": c2,
            "thread": "019f6000-0002-7003-8003-000000000003",
            "turn": "019f6000-0002-7004-8004-000000000004",
            "session": "4" * 64,
            "report": "5" * 64,
            "checkpoint": "6" * 64,
        },
    }
    for slot_id, values in future_specs.items():
        slot = authority["slots"][slot_id]
        capture = copy.deepcopy(values["source"])
        capture["slot_id"] = slot_id
        capture["reviewer_native"]["native_thread_id"] = values["thread"]
        capture["reviewer_native"]["native_turn_id"] = values["turn"]
        capture["reviewer_native"]["session_sha256"] = values["session"]
        capture["reviewer_native"]["terminal_report_sha256"] = values["report"]
        capture["report_binding"]["relative_path"] = slot["report_path"]
        capture["report_binding"]["raw_sha256"] = values["report"]
        capture["report_binding"]["terminal_sender_native_thread_id"] = values["thread"]
        capture["report_binding"]["terminal_report_sha256"] = values["report"]
        capture["report_binding"]["semantic_status"] = "PASS"
        capture["checkpoint"]["relative_path"] = slot["checkpoint_path"]
        capture["checkpoint"]["raw_sha256"] = values["checkpoint"]
        capture["hash_closure"]["report_sha256"] = values["report"]
        capture["hash_closure"]["checkpoint_sha256"] = values["checkpoint"]
        capture["hash_closure"]["child_session_sha256"] = values["session"]
        fixtures[slot_id] = capture
    return fixtures


def expected_for(slot: dict[str, Any], capture: dict[str, Any]) -> dict[str, Any]:
    expected = dict(slot)
    expected["native_thread_id"] = capture["reviewer_native"]["native_thread_id"]
    expected["native_turn_id"] = capture["reviewer_native"]["native_turn_id"]
    return expected


def main() -> None:
    authority = module.load(HERE / "AUTHORITY_V31.json")
    schema = module.load(HERE / "schemas/controller_native_reviewer_capture_v31.schema.json")
    fixtures = build_fixtures(authority)
    slots = authority["slots"]
    slot_ids = list(slots)
    failures: list[str] = []
    added_passed = 0
    names: list[str] = []

    def check(name: str, condition: bool) -> None:
        nonlocal added_passed
        names.append(name)
        if condition:
            added_passed += 1
        else:
            failures.append(name)

    baseline_rc, baseline, baseline_stderr, baseline_stdout_sha = module.run_baseline()
    baseline_tests = baseline.get("tests", {})

    # Six baseline preservation checks.
    check("baseline_exit_zero", baseline_rc == 0)
    check("baseline_status_pass", baseline.get("status") == "pass")
    check("baseline_errors_empty", baseline.get("errors") == [])
    check("baseline_exact_825", baseline_tests.get("passed") == baseline_tests.get("total") == 825 and baseline_tests.get("failed") == 0)
    check("baseline_807_plus_18", baseline_tests.get("wrapped_cases") == 807 and baseline_tests.get("wrapper_cases") == 18)
    check("baseline_stdout_and_stderr", baseline_stdout_sha == module.EXPECTED_BASELINE_STDOUT_SHA256 and baseline_stderr == "")

    # Five positive controller-native cases.
    for slot_id in slot_ids:
        capture = fixtures[slot_id]
        check(
            "valid_capture_" + slot_id,
            module.validate_capture_document(capture, slot_id, slots[slot_id], schema, expected_for(slots[slot_id], capture)) == [],
        )
    check("valid_four_identity_aggregate", module.validate_capture_set(fixtures, set(slot_ids)) == [])

    # Twelve missing/cardinality cases.
    for missing in slot_ids:
        reduced = {key: value for key, value in fixtures.items() if key != missing}
        check("missing_capture_" + missing, bool(module.validate_capture_set(reduced, set(slot_ids))))
    for slot_id in slot_ids:
        capture = mutate(fixtures[slot_id], ("report_binding",), delete=True)
        check("missing_report_binding_" + slot_id, bool(module.validate_capture_document(capture, slot_id, slots[slot_id], schema, expected_for(slots[slot_id], fixtures[slot_id]))))
    check("empty_capture_set", bool(module.validate_capture_set({}, set(slot_ids))))
    with_extra = dict(fixtures)
    with_extra["unknown-fifth-slot"] = copy.deepcopy(fixtures[slot_ids[0]])
    check("unexpected_fifth_capture", bool(module.validate_capture_set(with_extra, set(slot_ids))))
    duplicate = mutate(fixtures[slot_ids[0]], ("slot_id",), slot_ids[1])
    check("duplicate_slot_identity", bool(module.validate_capture_document(duplicate, slot_ids[0], slots[slot_ids[0]], schema, expected_for(slots[slot_ids[0]], fixtures[slot_ids[0]]))))
    unknown = mutate(fixtures[slot_ids[0]], ("slot_id",), "unknown-slot")
    check("unknown_slot_identity", bool(module.validate_capture_document(unknown, slot_ids[0], slots[slot_ids[0]], schema, expected_for(slots[slot_ids[0]], fixtures[slot_ids[0]]))))

    # Twenty-four arbitrary path/ID/self-attestation cases: six per slot.
    for slot_id in slot_ids:
        base = fixtures[slot_id]
        expected = expected_for(slots[slot_id], base)
        mutations = [
            ("arbitrary_thread", mutate(base, ("reviewer_native", "native_thread_id"), "019f7777-0001-7001-8001-000000000001")),
            ("arbitrary_turn", mutate(base, ("reviewer_native", "native_turn_id"), "019f7777-0001-7002-8002-000000000002")),
            ("arbitrary_report_path", mutate(base, ("report_binding", "relative_path"), "master/arbitrary/self-attested.json")),
            ("arbitrary_logical_path", mutate(base, ("logical_agent_path",), "/root/luna-self-attested", add=True)),
            ("self_attestation", mutate(base, ("self_attestation",), {"fresh": True, "model": "gpt-5.6-luna"}, add=True)),
            ("arbitrary_parent", mutate(base, ("controller_native", "native_thread_id"), "019f7777-0001-7003-8003-000000000003")),
        ]
        for label, candidate in mutations:
            check(f"{slot_id}_{label}", bool(module.validate_capture_document(candidate, slot_id, slots[slot_id], schema, expected)))

    # Twenty native model/effort/fork cases: five per slot.
    for slot_id in slot_ids:
        base = fixtures[slot_id]
        expected = expected_for(slots[slot_id], base)
        mutations = [
            ("wrong_model", mutate(base, ("reviewer_native", "actual_model"), "gpt-5.6-sol")),
            ("missing_model", mutate(base, ("reviewer_native", "actual_model"), delete=True)),
            ("wrong_effort", mutate(base, ("reviewer_native", "actual_reasoning_effort"), "xhigh")),
            ("missing_effort", mutate(base, ("reviewer_native", "actual_reasoning_effort"), delete=True)),
            ("fork_context_true", mutate(base, ("reviewer_native", "fork_context"), True)),
        ]
        for label, candidate in mutations:
            check(f"{slot_id}_{label}", bool(module.validate_capture_document(candidate, slot_id, slots[slot_id], schema, expected)))

    # Twenty-four isolation/reuse cases: six per slot.
    isolation_fields = [
        "followup_task_count",
        "send_message_count",
        "interrupt_count",
        "retry_count",
        "descendant_spawn_count",
        "matching_spawn_count",
    ]
    for slot_id in slot_ids:
        base = fixtures[slot_id]
        expected = expected_for(slots[slot_id], base)
        for field in isolation_fields:
            candidate = mutate(base, ("closure", field), 2 if field == "matching_spawn_count" else 1)
            check(f"{slot_id}_isolation_{field}", bool(module.validate_capture_document(candidate, slot_id, slots[slot_id], schema, expected)))

    # Thirty-two hash-closure cases: eight per slot.
    hash_fields = [
        "child_session_sha256",
        "parent_session_prefix_sha256",
        "parent_turn_segment_sha256",
        "spawn_record_sha256",
        "spawn_result_record_sha256",
        "terminal_record_sha256",
        "checkpoint_sha256",
        "report_sha256",
    ]
    for slot_id in slot_ids:
        base = fixtures[slot_id]
        expected = expected_for(slots[slot_id], base)
        for field in hash_fields:
            candidate = mutate(base, ("hash_closure", field), "0" * 64)
            check(f"{slot_id}_hash_{field}", bool(module.validate_capture_document(candidate, slot_id, slots[slot_id], schema, expected)))

    # Twelve terminal/task-closure cases: three per slot.
    for slot_id in slot_ids:
        base = fixtures[slot_id]
        expected = expected_for(slots[slot_id], base)
        terminal_mutations = [
            ("task_complete_not_last", mutate(base, ("reviewer_native", "task_complete_is_last_line"), False)),
            ("terminal_sender_wrong", mutate(base, ("report_binding", "terminal_sender_native_thread_id"), "019f7777-0001-7004-8004-000000000004")),
            ("terminal_report_sha_wrong", mutate(base, ("reviewer_native", "terminal_report_sha256"), "f" * 64)),
        ]
        for label, candidate in terminal_mutations:
            check(f"{slot_id}_{label}", bool(module.validate_capture_document(candidate, slot_id, slots[slot_id], schema, expected)))

    # Seven scope/path/TOCTOU cases.
    base = fixtures[slot_ids[0]]
    expected = expected_for(slots[slot_ids[0]], base)
    final_mutations = [
        ("activation_true", mutate(base, ("scope", "activation_authorized"), True)),
        ("launch_true", mutate(base, ("scope", "launch_authorized"), True)),
        ("spawn_enabled", mutate(base, ("scope", "spawn"), "allowed")),
        ("credit_nonzero", mutate(base, ("scope", "credit"), 1)),
        ("result_nonzero", mutate(base, ("scope", "result_count"), 1)),
        ("path_symlink", mutate(base, ("hash_closure", "path_symlink"), True)),
        ("toctou_unstable", mutate(base, ("hash_closure", "stable_double_read"), False)),
    ]
    for label, candidate in final_mutations:
        check(label, bool(module.validate_capture_document(candidate, slot_ids[0], slots[slot_ids[0]], schema, expected)))

    if len(names) != 142:
        failures.append(f"internal-added-case-count:{len(names)}")
    baseline_passed = baseline_tests.get("passed", 0) if baseline_rc == 0 else 0
    total = baseline_tests.get("total", 0) + len(names)
    passed = baseline_passed + added_passed
    report = {
        "schema_version": "universal-shadow-certification-controller-native-gate-v31-tests-v1",
        "status": "pass" if not failures and total >= 967 and passed == total else "fail_closed",
        "errors": failures,
        "tests": {
            "passed": passed,
            "failed": total - passed,
            "total": total,
            "preserved_v30_cases": baseline_tests.get("total"),
            "added_v31_cases": len(names),
            "added_v31_passed": added_passed,
            "new_negative_cases": 131,
        },
        "test_name_digest": hashlib.sha256("\n".join(names).encode()).hexdigest(),
        "baseline_stdout_sha256": baseline_stdout_sha,
        "activation_authorized": False,
        "launch_authorized": False,
        "spawn": "none",
        "spawn_count": 0,
        "credit": 0,
    }
    print(json.dumps(report, indent=2, sort_keys=True))
    raise SystemExit(0 if report["status"] == "pass" else 1)


if __name__ == "__main__":
    main()
