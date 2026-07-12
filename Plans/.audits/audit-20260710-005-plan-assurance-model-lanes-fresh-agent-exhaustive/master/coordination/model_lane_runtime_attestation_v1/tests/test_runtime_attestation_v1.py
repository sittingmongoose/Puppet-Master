#!/usr/bin/env python3
from __future__ import annotations

import copy
import hashlib
import importlib.util
import json
from pathlib import Path


NS = Path(__file__).resolve().parents[1]
VALIDATOR = NS / "tools" / "validate_runtime_attestation_v1.py"
spec = importlib.util.spec_from_file_location("runtime_attestation_validator", VALIDATOR)
module = importlib.util.module_from_spec(spec)
assert spec.loader
spec.loader.exec_module(module)


def load_actual() -> dict:
    return json.loads((NS / "evidence" / "runtime_spawn_evidence.json").read_text())


def valid_fixture() -> dict:
    e = load_actual()
    e["parent_spawn"]["arguments"]["model"] = "gpt-5.6-luna"
    e["parent_spawn"]["arguments"]["reasoning_effort"] = "max"
    e["child_native_session"]["actual_model"] = "gpt-5.6-luna"
    e["child_native_session"]["actual_reasoning_effort"] = "max"
    return e


def mutate(base: dict, path: tuple[str, ...], value: object, delete: bool = False) -> dict:
    e = copy.deepcopy(base)
    node = e
    for key in path[:-1]:
        node = node[key]
    if delete:
        node.pop(path[-1], None)
    else:
        node[path[-1]] = value
    return e


def main() -> None:
    passed = 0
    failures: list[str] = []
    digests: list[str] = []

    def check(name: str, condition: bool) -> None:
        nonlocal passed
        digests.append(hashlib.sha256(name.encode()).hexdigest())
        if condition:
            passed += 1
        else:
            failures.append(name)

    base = valid_fixture()
    check("valid_synthetic_flow", module.validate_evidence(base) == [])
    actual_errors = module.validate_evidence(load_actual())
    check("actual_fails", bool(actual_errors))
    for expected in [
        "spawn_argument_model_missing",
        "spawn_argument_reasoning_effort_missing",
        "child_runtime_model",
        "child_runtime_reasoning_effort",
    ]:
        check(f"actual_error_{expected}", expected in actual_errors)

    direct = [
        (("schema_version",), "wrong", False),
        (("parent_spawn", "call_count"), 0, False),
        (("parent_spawn", "arguments", "task_name"), "wrong", False),
        (("parent_spawn", "arguments", "fork_turns"), "all", False),
        (("parent_spawn_result", "task_name"), "/root/wrong", False),
        (("parent_spawn_result", "call_id"), "wrong", False),
        (("terminal_mapping", "sender"), "/root/wrong", False),
        (("terminal_mapping", "payload"), "OTHER", False),
        (("terminal_mapping", "count"), 2, False),
        (("child_native_session", "agent_path"), "/root/wrong", False),
        (("child_native_session", "native_child_thread_id"), "", False),
        (("child_native_session", "native_child_thread_id_count"), 2, False),
        (("child_native_session", "parent_thread_id"), "wrong", False),
        (("child_native_session", "terminal_status"), "errored", False),
        (("child_native_session", "terminal_response"), "NOT-PMR1", False),
        (("child_native_session", "task_complete_is_last_line"), False, False),
        (("closure", "original_turn_segment_closed"), False, False),
        (("closure", "parent_task_complete_after_terminal"), False, False),
        (("closure", "same_path_spawn_count"), 2, False),
        (("closure", "followup_count"), 1, False),
        (("closure", "message_count"), 1, False),
        (("closure", "descendant_spawn_count"), 1, False),
        (("closure", "retry_count"), 1, False),
        (("closure", "post_terminal_reuse_actions"), [{"tool": "followup_task"}], False),
    ]
    for i, (path, value, delete) in enumerate(direct):
        check(f"direct_{i}_{'_'.join(path)}", bool(module.validate_evidence(mutate(base, path, value, delete))))

    model_variants = [
        "gpt-5.6-sol", "gpt-5.6", "luna", "LUNA", "gpt-5.6-luna-max", "gpt-5.6-luna ",
        " gpt-5.6-luna", "gpt_5_6_luna", "openai/gpt-5.6-luna", "default", "inherited", "auto",
        "none", "", None, 0, False, [], {}, "gpt-5.5-luna",
    ]
    for i, value in enumerate(model_variants):
        check(f"spawn_model_variant_{i}", bool(module.validate_evidence(mutate(base, ("parent_spawn", "arguments", "model"), value))))
        check(f"child_model_variant_{i}", bool(module.validate_evidence(mutate(base, ("child_native_session", "actual_model"), value))))
    check("spawn_model_omitted", "spawn_argument_model_missing" in module.validate_evidence(mutate(base, ("parent_spawn", "arguments", "model"), None, True)))

    effort_variants = [
        "xhigh", "high", "medium", "low", "MAX", "max ", " max", "maximum", "reasoning:max",
        "default", "inherited", "auto", "none", "", None, 0, False, [], {}, "ultra",
    ]
    for i, value in enumerate(effort_variants):
        check(f"spawn_effort_variant_{i}", bool(module.validate_evidence(mutate(base, ("parent_spawn", "arguments", "reasoning_effort"), value))))
        check(f"child_effort_variant_{i}", bool(module.validate_evidence(mutate(base, ("child_native_session", "actual_reasoning_effort"), value))))
    check("spawn_effort_omitted", "spawn_argument_reasoning_effort_missing" in module.validate_evidence(mutate(base, ("parent_spawn", "arguments", "reasoning_effort"), None, True)))

    # Hash closure must be exact 64-character strings; exercise missing, short,
    # long, non-string, and malformed values for every bound record.
    hash_keys = ["parent_turn_segment_sha256", "spawn_record_sha256", "spawn_result_record_sha256", "terminal_record_sha256", "child_session_sha256"]
    bad_hashes = ["", "0" * 63, "0" * 65, None, 1, False, [], {}, "not-a-hash"]
    for key in hash_keys:
        for i, value in enumerate(bad_hashes):
            check(f"hash_{key}_{i}", bool(module.validate_evidence(mutate(base, ("hash_closure", key), value))))
        check(f"hash_{key}_missing", bool(module.validate_evidence(mutate(base, ("hash_closure", key), None, True))))

    # Reuse/replay cardinalities and terminal mapping variants.
    for i in range(2, 22):
        check(f"spawn_replay_{i}", "spawn_replay" in module.validate_evidence(mutate(base, ("closure", "same_path_spawn_count"), i)))
    for field, err in [("followup_count", "followup"), ("message_count", "message_reuse"), ("descendant_spawn_count", "descendants"), ("retry_count", "retry")]:
        for i in range(1, 16):
            check(f"{field}_{i}", err in module.validate_evidence(mutate(base, ("closure", field), i)))

    # A forged prompt/self-attestation field can never cure absent native args.
    forged = mutate(base, ("parent_spawn", "arguments", "model"), None, True)
    forged = mutate(forged, ("parent_spawn", "arguments", "reasoning_effort"), None, True)
    forged["self_attestation"] = {"model": "gpt-5.6-luna", "reasoning_effort": "max"}
    forged["prompt_claim"] = "I am Luna Max"
    forged_errors = module.validate_evidence(forged)
    check("forged_self_attestation_model_rejected", "spawn_argument_model_missing" in forged_errors)
    check("forged_self_attestation_effort_rejected", "spawn_argument_reasoning_effort_missing" in forged_errors)

    total = passed + len(failures)
    report = {
        "schema_version": "audit005-model-lane-runtime-attestation-tests-v1",
        "status": "pass" if not failures and total >= 150 else "fail",
        "total": total,
        "passed": passed,
        "failed": len(failures),
        "minimum_required": 150,
        "negative_test_count": total - 1,
        "failures": failures,
        "test_name_digest": hashlib.sha256("\n".join(digests).encode()).hexdigest(),
    }
    print(json.dumps(report, indent=2, sort_keys=True))
    raise SystemExit(0 if report["status"] == "pass" else 1)


if __name__ == "__main__":
    main()
