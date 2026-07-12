#!/usr/bin/env python3
"""Data-driven positive/negative suite for V31 late-cohort preparation."""
from __future__ import annotations

import copy
import hashlib
import importlib.util
import json
import tempfile
from pathlib import Path
from typing import Callable

HERE = Path(__file__).resolve().parent
spec = importlib.util.spec_from_file_location("late_v31", HERE / "verify_late_cohorts_v31.py")
late = importlib.util.module_from_spec(spec)
assert spec and spec.loader
spec.loader.exec_module(late)


def main() -> None:
    cases: list[tuple[str, bool]] = []

    def case(label: str, passed: bool) -> None:
        cases.append((label, bool(passed)))

    baseline = late.verify_preparation()
    case("positive:live-preparation-pass-blocked", baseline.get("status") == "pass_blocked" and baseline.get("errors") == [])
    case("positive:exact-two-atomic8", baseline.get("counts", {}).get("atomic_transactions") == 2 and baseline["counts"].get("atomic_size_each") == 8)
    case("positive:zero-state", all(baseline.get("counts", {}).get(key) == 0 for key in ("results", "receipts", "native_capture_rows", "activation_transactions", "credit")))

    intent_mutations: list[tuple[str, Callable[[dict], None]]] = [
        ("status", lambda value: value.__setitem__("status", "active")),
        ("cohort", lambda value: value.__setitem__("cohort_id", "cohort-0001")),
        ("assignment", lambda value: value.__setitem__("assignment_id", "A005SA-9999")),
        ("attempt", lambda value: value.__setitem__("attempt_id", "attempt-0002")),
        ("activation", lambda value: value.__setitem__("activation", True)),
        ("activation-authorized", lambda value: value.__setitem__("activation_authorized", True)),
        ("launch-authorized", lambda value: value.__setitem__("launch_authorized", True)),
        ("spawn", lambda value: value.__setitem__("spawn", "atomic8")),
        ("spawn-count", lambda value: value.__setitem__("spawn_count", 8)),
        ("model", lambda value: value.__setitem__("model", "gpt-5.6-luna")),
        ("effort", lambda value: value.__setitem__("reasoning_effort", "xhigh")),
        ("controller", lambda value: value.__setitem__("controller_agent_path", "/root")),
        ("controller-thread", lambda value: value.__setitem__("controller_thread_id", "01900000-0000-7000-8000-000000000000")),
        ("agent-path", lambda value: value.__setitem__("prospective_agent_path", "/root/a005_scenario_adversarial_0001_attempt_0001_terminal")),
        ("identity-state", lambda value: value.__setitem__("fresh_identity_state", "allocated")),
        ("native-thread", lambda value: value.__setitem__("native_child_thread_id", "01900000-0000-7000-8000-000000000001")),
        ("native-turn", lambda value: value.__setitem__("native_turn_id", "01900000-0000-7000-8000-000000000002")),
        ("fork", lambda value: value.__setitem__("fork_turns", "all")),
        ("fresh", lambda value: value.__setitem__("fresh_direct_leaf_required", False)),
        ("descendants", lambda value: value.__setitem__("descendants_forbidden", False)),
        ("followups", lambda value: value.__setitem__("followups_forbidden", False)),
        ("retries", lambda value: value.__setitem__("retries_forbidden", False)),
        ("old-intent", lambda value: value.__setitem__("original_intent_sha256", "0" * 64)),
        ("old-mutated", lambda value: value.__setitem__("original_xhigh_intent_mutated", True)),
        ("packet-path", lambda value: value.__setitem__("packet_path", "/tmp/packet.json")),
        ("packet-sha", lambda value: value.__setitem__("packet_sha256", "0" * 64)),
        ("feature-count", lambda value: value.__setitem__("feature_count", 0)),
        ("feature-digest", lambda value: value.__setitem__("feature_refs_digest_sha256", "0" * 64)),
        ("output", lambda value: value.__setitem__("output_directory", "/tmp/output")),
        ("tree-digest", lambda value: value.__setitem__("output_tree_sha256", "0" * 64)),
        ("result-path", lambda value: value.__setitem__("future_result_path", "/tmp/result.json")),
        ("credit", lambda value: value.__setitem__("candidate_credit", 1)),
    ]
    auth_mutations: list[tuple[str, Callable[[dict], None]]] = [
        ("status", lambda value: value.__setitem__("status", "authorized")),
        ("cohort", lambda value: value.__setitem__("cohort_id", "cohort-0001")),
        ("assignment", lambda value: value.__setitem__("assignment_id", "A005SA-9999")),
        ("attempt", lambda value: value.__setitem__("attempt_id", "attempt-0002")),
        ("activation", lambda value: value.__setitem__("activation", True)),
        ("activation-authorized", lambda value: value.__setitem__("activation_authorized", True)),
        ("launch-authorized", lambda value: value.__setitem__("launch_authorized", True)),
        ("spawn", lambda value: value.__setitem__("spawn", "atomic8")),
        ("spawn-count", lambda value: value.__setitem__("spawn_count", 8)),
        ("agent-path", lambda value: value.__setitem__("agent_path", "/root/wrong")),
        ("model", lambda value: value.__setitem__("model", "gpt-5.6-luna")),
        ("effort", lambda value: value.__setitem__("reasoning_effort", "xhigh")),
        ("fork", lambda value: value.__setitem__("fork_turns", "all")),
        ("descendants", lambda value: value.__setitem__("descendants_forbidden", False)),
        ("followups", lambda value: value.__setitem__("followups_forbidden", False)),
        ("retries", lambda value: value.__setitem__("retries_forbidden", False)),
        ("intent-path", lambda value: value.__setitem__("intent_path", "/tmp/intent.json")),
        ("intent-sha", lambda value: value.__setitem__("intent_sha256", "0" * 64)),
        ("packet-path", lambda value: value.__setitem__("packet_path", "/tmp/packet.json")),
        ("packet-sha", lambda value: value.__setitem__("packet_sha256", "0" * 64)),
        ("output", lambda value: value.__setitem__("output_directory", "/tmp/output")),
        ("luna-required", lambda value: value.__setitem__("fresh_luna_prelaunch_required", False)),
        ("luna-present", lambda value: value.__setitem__("fresh_luna_prelaunch_present", True)),
        ("checkpoint-required", lambda value: value.__setitem__("prior_cohorts_cumulative_terminal_checkpoint_required", False)),
        ("checkpoint-present", lambda value: value.__setitem__("prior_cohorts_cumulative_terminal_checkpoint_present", True)),
        ("credit", lambda value: value.__setitem__("candidate_credit", 1)),
    ]

    for cohort_id in late.COHORTS:
        for row in late.jsonl(late.tx_root(cohort_id) / "transaction_manifest.jsonl"):
            intent = late.load(Path(row["intent_path"]))
            auth = late.load(Path(row["authorization_path"]))
            case(f"positive:{row['assignment_id']}:intent", late.intent_contract_errors(intent, row) == [])
            case(f"positive:{row['assignment_id']}:authorization", late.authorization_contract_errors(auth, row) == [])
            for label, mutate in intent_mutations:
                value = copy.deepcopy(intent)
                mutate(value)
                case(f"negative:{row['assignment_id']}:intent:{label}", bool(late.intent_contract_errors(value, row)))
            for label, mutate in auth_mutations:
                value = copy.deepcopy(auth)
                mutate(value)
                case(f"negative:{row['assignment_id']}:authorization:{label}", bool(late.authorization_contract_errors(value, row)))

    with tempfile.TemporaryDirectory(prefix="a005-v31-late-") as tmp:
        root = Path(tmp)
        regular = root / "bound.json"
        regular.write_text("{}\n", encoding="utf-8")
        correct = hashlib.sha256(regular.read_bytes()).hexdigest()
        case("positive:binding:regular", late.binding_errors({"path": str(regular), "sha256": correct}, "fixture") == [])
        case("negative:binding:wrong-sha", bool(late.binding_errors({"path": str(regular), "sha256": "0" * 64}, "fixture")))
        case("negative:binding:missing", bool(late.binding_errors({"path": str(root / "missing"), "sha256": correct}, "fixture")))
        case("negative:binding:shape", bool(late.binding_errors({"path": str(regular)}, "fixture")))
        link = root / "link.json"
        link.symlink_to(regular)
        case("negative:binding:symlink", bool(late.binding_errors({"path": str(link), "sha256": correct}, "fixture")))
        output = root / "output"
        output.mkdir()
        case("positive:output:empty", not any(output.iterdir()))
        (output / ".hidden").write_text("x", encoding="utf-8")
        case("negative:output:hidden", any(output.iterdir()))

    labels = [label for label, _ in cases]
    failed = [label for label, passed in cases if not passed]
    report = {
        "schema_version": "scenario-late-cohorts-v31-ultra-tests-v1",
        "status": "pass" if not failed and len(cases) >= 900 else "fail_closed",
        "errors": failed + ([] if len(cases) >= 900 else ["case-count-below-900"]),
        "tests": {"passed": sum(passed for _, passed in cases), "failed": len(failed), "total": len(cases)},
        "case_id_digest": hashlib.sha256(("\n".join(labels) + "\n").encode()).hexdigest(),
        "mutation_groups": {"intent_per_assignment": len(intent_mutations), "authorization_per_assignment": len(auth_mutations), "assignments": 16},
        "activation": False,
        "launch_authorized": False,
        "spawn": "none",
        "credit": 0,
    }
    print(json.dumps(report, indent=2, sort_keys=True))
    raise SystemExit(0 if report["status"] == "pass" else 1)


if __name__ == "__main__":
    main()
