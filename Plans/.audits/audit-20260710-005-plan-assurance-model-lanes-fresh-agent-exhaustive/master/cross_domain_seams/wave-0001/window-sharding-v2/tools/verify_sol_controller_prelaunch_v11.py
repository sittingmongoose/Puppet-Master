#!/usr/bin/env python3
from __future__ import annotations

import hashlib
import json
import subprocess
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[5]
NS = ROOT / "master/cross_domain_seams/wave-0001/window-sharding-v2"
REPORT = NS / "validation/luna-independent-prelaunch-v3.json"
OUTPUT = NS / "validation/sol-controller-prelaunch-v11-v2.json"
PYTHON = Path("/Users/jaredsmacbookair/.cache/codex-runtimes/codex-primary-runtime/dependencies/python/bin/python3")
V11 = "6717f715c8a32dea88d7e79e70fca87aeb4a0b637853da3742c5c6e6a0c9a086"
ROUTING = "9105752f30b42d482454e8df7782bda95992d94ae7b149977e280ac83df83544"
CHANGE = "b227f14a04aae9ddce62440002af2c76528a1433c4e440df613490865f9f444e"
TERMINAL = "1e8af80b32fb1d998d4f1bdb24f049f26f93b6c25892a60b96982bd17bc052c9"
CACHE = "bfb3a7fc8a3723994f23930085f5989848c1aac85b4a6b39ed4dc0d15e0b3782"
LUNA_REPORT = "a2913d9a26bc2ada12e72347b6bdf4d167e43644d713a5060f82b132f4bc3207"
PARENT_ID = "019f5078-6501-7223-b52f-2251010bdc41"
CHILD_ID = "019f53bd-8fbd-7ee3-8ee5-3bf6fb54134b"


def sha(path: Path) -> str:
    return hashlib.sha256(path.read_bytes()).hexdigest()


def digest(value) -> str:
    return hashlib.sha256(json.dumps(value, sort_keys=True, separators=(",", ":"), ensure_ascii=False).encode()).hexdigest()


def jsonl(path: Path):
    return [json.loads(line) for line in path.read_text().splitlines() if line.strip()]


def frozen_run(script: str) -> dict:
    import os
    env = os.environ.copy()
    env.update({"PYTHONNOUSERSITE": "1", "PYTHONDONTWRITEBYTECODE": "1"})
    proc = subprocess.run([str(PYTHON), "-S", "-B", str(NS / "tools" / script)], text=True, capture_output=True, env=env)
    if proc.returncode:
        return {"status": "fail", "errors": [proc.stdout, proc.stderr]}
    return json.loads(proc.stdout)


def native_routing_evidence() -> tuple[dict, list[str]]:
    errors = []
    parent_matches = list(Path("/Users/jaredsmacbookair/.codex/sessions").rglob(f"*{PARENT_ID}*.jsonl"))
    child_matches = list(Path("/Users/jaredsmacbookair/.codex/sessions").rglob(f"*{CHILD_ID}*.jsonl"))
    if len(parent_matches) != 1 or len(child_matches) != 1:
        return {}, ["native-session-cardinality"]
    parent_raw = parent_matches[0].read_bytes(); parent_rows = [json.loads(x) for x in parent_raw.splitlines()]
    spawn = []
    for index, row in enumerate(parent_rows):
        payload = row.get("payload", {})
        if row.get("type") == "response_item" and payload.get("type") == "custom_tool_call":
            text = payload.get("input", "")
            if text.lstrip().startswith("const r=await tools.multi_agent_v1__spawn_agent") and "luna-independent-prelaunch-v3.json" in text:
                spawn.append((index, row, text))
    if len(spawn) != 1:
        return {}, ["parent-spawn-cardinality"]
    index, spawn_row, text = spawn[0]
    for needle, label in [
        ('model:"gpt-5.6-luna"', "spawn-model"), ('reasoning_effort:"max"', "spawn-effort"),
        ("fork_context:false", "spawn-fork"), ("no descendants", "spawn-no-descendants"),
    ]:
        if needle not in text:
            errors.append(label)
    call_id = spawn_row["payload"]["call_id"]
    outputs = [row for row in parent_rows if row.get("type") == "response_item" and row.get("payload", {}).get("type") == "custom_tool_call_output" and row.get("payload", {}).get("call_id") == call_id]
    if len(outputs) != 1:
        errors.append("parent-spawn-result-cardinality")
        output_row = {}
    else:
        output_row = outputs[0]
        output_text = "".join(part.get("text", "") for part in output_row.get("payload", {}).get("output", []) if isinstance(part, dict))
        if CHILD_ID not in output_text:
            errors.append("parent-spawn-result-child-id")
    child_raw = child_matches[0].read_bytes(); child_rows = [json.loads(x) for x in child_raw.splitlines()]
    meta = child_rows[0].get("payload", {})
    contexts = [row["payload"] for row in child_rows if row.get("type") == "turn_context"]
    completes = [(i + 1, row["payload"]) for i, row in enumerate(child_rows) if row.get("type") == "event_msg" and row.get("payload", {}).get("type") == "task_complete"]
    if len(contexts) != 1 or contexts[0].get("model") != "gpt-5.6-luna" or contexts[0].get("effort") != "max":
        errors.append("child-runtime-lane")
    if meta.get("id") != CHILD_ID or meta.get("parent_thread_id") != PARENT_ID:
        errors.append("child-parent-identity")
    if len(completes) != 1 or completes[0][0] != len(child_rows) or completes[0][1].get("last_agent_message") != "PMR1":
        errors.append("child-terminal")
    child_calls = []
    for i, row in enumerate(child_rows, 1):
        payload = row.get("payload", {})
        if row.get("type") == "response_item" and payload.get("type") in {"function_call", "custom_tool_call"}:
            body = str(payload.get("arguments", payload.get("input", "")))
            if any(token in body for token in ["spawn_agent", "followup_task", "send_message"]):
                child_calls.append(i)
    if child_calls:
        errors.append("child-descendant-or-followup")
    evidence = {
        "parent_thread_id": PARENT_ID, "child_thread_id": CHILD_ID,
        "parent_session_path": str(parent_matches[0]), "parent_session_capture_sha256": hashlib.sha256(parent_raw).hexdigest(),
        "parent_spawn_record_sha256": hashlib.sha256((json.dumps(spawn_row, sort_keys=True, separators=(",", ":")) + "\n").encode()).hexdigest(),
        "parent_spawn_result_record_sha256": hashlib.sha256((json.dumps(output_row, sort_keys=True, separators=(",", ":")) + "\n").encode()).hexdigest() if output_row else None,
        "explicit_model": "gpt-5.6-luna", "explicit_reasoning_effort": "max", "fork_context": False,
        "child_session_path": str(child_matches[0]), "child_session_sha256": hashlib.sha256(child_raw).hexdigest(),
        "child_runtime_model": contexts[0].get("model") if contexts else None,
        "child_runtime_reasoning_effort": contexts[0].get("effort") if contexts else None,
        "child_terminal_status": "completed" if completes else None, "child_terminal_response": completes[0][1].get("last_agent_message") if completes else None,
        "child_task_complete_is_last_record": bool(completes and completes[0][0] == len(child_rows)),
        "descendant_or_followup_call_count": len(child_calls),
    }
    return evidence, errors


def main() -> None:
    errors = []
    expected_files = {
        ROOT / "master/coordination/CONCURRENCY_POLICY_V11.json": V11,
        ROOT / "master/coordination/MODEL_LANE_ROUTING_POLICY_V2.json": ROUTING,
        ROOT / "master/coordination/CONCURRENT_CANONICAL_CHANGE_POLICY_V1.json": CHANGE,
        NS / "validation/terminal-sol-preparation-report.json": TERMINAL,
        ROOT / "master/dependencies/jsonschema-draft202012-v1/cache-reconciliation-v2/validation/terminal-cache-reconciliation-v2.json": CACHE,
        REPORT: LUNA_REPORT,
    }
    for path, expected in expected_files.items():
        if not path.is_file() or sha(path) != expected:
            errors.append("hash:" + str(path))
    report = json.loads(REPORT.read_text())
    if report.get("status") != "READY_FOR_SOL_LAUNCH" or report.get("gate_passed") is not True or report.get("errors") != []:
        errors.append("luna-report-status")
    if report.get("counts") != {"activation_files":0,"assignments":64,"cohort_size":16,"cohorts":4,"conflicts":178,"edges":9365,"empty_outputs":64,"intents":64,"native_capture_rows":0,"packet_local_feature_rows":8345,"packets":64,"pairs":11,"quarantines":10,"receipts":0,"results":0,"source_features":2495,"unique_edges":9365}:
        errors.append("luna-report-counts")
    probes = report.get("targeted_probe_suite", {})
    if probes.get("status") != "pass" or probes.get("total") != 53840 or probes.get("passed") != 53840 or probes.get("failed") != 0 or probes.get("negative_probe_count") != 768:
        errors.append("luna-report-probes")
    frozen = report.get("frozen_test_suite", [])
    if not any(row.get("suite") == "window-sharding-v2" and row.get("passed") == 909 and row.get("failed") == 0 for row in frozen):
        errors.append("luna-report-frozen-tests")
    routing, routing_errors = native_routing_evidence(); errors.extend(routing_errors)
    parent_claim = report.get("parent_routing_evidence", {})
    if parent_claim.get("routing_policy_sha256") != ROUTING or parent_claim.get("spawn_call", {}).get("model") != "gpt-5.6-luna" or parent_claim.get("spawn_call", {}).get("reasoning_effort") != "max":
        errors.append("luna-report-routing-proof")
    for group_name in ["core_bound_hashes"]:
        for name, row in report.get("immutable_input_hash_closure", {}).get(group_name, {}).items():
            path = ROOT / row.get("path", "")
            if not path.is_file() or sha(path) != row.get("expected_sha256") or row.get("matches") is not True:
                errors.append("luna-input:" + name)
    frozen_verify = frozen_run("verify_prelaunch_v2.py")
    frozen_tests = frozen_run("test_window_sharding_v2.py")
    if frozen_verify.get("status") != "pass" or frozen_verify.get("errors") != []:
        errors.append("fresh-frozen-verifier")
    if frozen_tests.get("status") != "pass" or frozen_tests.get("counts") != {"total":909,"passed":909,"failed":0}:
        errors.append("fresh-frozen-tests")
    rows = jsonl(NS / "manifest.jsonl")
    if len(rows) != 64 or len({row["assignment_id"] for row in rows}) != 64:
        errors.append("manifest-cardinality")
    edge_ids = []; features = set(); packet_shas = []; intent_shas = []; packet_bytes = []
    for row in rows:
        packet_path = Path(row["packet_path"]); intent_path = Path(row["dispatch_intent_path"])
        if sha(packet_path) != row["packet_sha256"]: errors.append("packet-hash:" + row["assignment_id"])
        if sha(intent_path) != row["dispatch_intent_sha256"]: errors.append("intent-hash:" + row["assignment_id"])
        packet = json.loads(packet_path.read_text()); intent = json.loads(intent_path.read_text())
        ids = [seam["normalized_edge_id"] for seam in packet["seams"]]
        edge_ids.extend(ids); features.update(item["provisional_feature_ref"] for item in packet["feature_records"])
        if len(ids) != row["edge_count"] or packet["assignment_id"] != row["assignment_id"]: errors.append("packet-membership:" + row["assignment_id"])
        if Path(row["output_directory"]).is_dir() is not True or any(Path(row["output_directory"]).iterdir()): errors.append("output-state:" + row["assignment_id"])
        if (Path(row["output_directory"]) / "result.json").exists(): errors.append("result-state:" + row["assignment_id"])
        if Path(intent["dispatch_receipt_ref"]).exists(): errors.append("receipt-state:" + row["assignment_id"])
        packet_shas.append(row["packet_sha256"]); intent_shas.append(row["dispatch_intent_sha256"]); packet_bytes.append(packet_path.stat().st_size)
    if len(edge_ids) != 9365 or len(set(edge_ids)) != 9365: errors.append("edge-union")
    if len(features) != 2495: errors.append("feature-union")
    if min(packet_bytes) != 626266 or max(packet_bytes) != 701967: errors.append("packet-byte-range")
    if digest(packet_shas) != report.get("digests", {}).get("packet_root"): errors.append("packet-root")
    if digest(intent_shas) != report.get("digests", {}).get("intent_root"): errors.append("intent-root")
    cohort_rows = report.get("cohort_readiness", [])
    if len(cohort_rows) != 4 or any(row.get("ready") is not True or row.get("prelaunch_readiness") is not True or row.get("readiness_errors") != [] for row in cohort_rows):
        errors.append("cohort-readiness")
    if any((NS / f"cohorts/cohort-{index:04d}/activation.v2.json").exists() for index in range(1,5)):
        errors.append("activation-zero-state")
    decision = {
        "schema_version": "cross-domain-seam-window-v2-sol-controller-prelaunch-v11",
        "supersedes_zero_credit_local_report": {
            "path": str(NS / "validation/sol-controller-prelaunch-v11.json"),
            "failure_classes": ["wrapper PATH stripped", "stored prompt array misclassified as native spawn"],
        },
        "status": "PASS_READY_TO_ACTIVATE_TWO_SEPARATE_EXACT16_COHORTS" if not errors else "FAIL_CLOSED_LAUNCH_ZERO",
        "gate_passed": not errors, "errors": sorted(set(errors)),
        "luna_readiness_report_path": str(REPORT), "luna_readiness_report_sha256": sha(REPORT),
        "native_routing_evidence": routing,
        "policies": {"v11_sha256":V11,"routing_v2_sha256":ROUTING,"concurrent_change_sha256":CHANGE},
        "frozen_inputs": {"terminal_report_sha256":TERMINAL,"cache_reconciliation_report_sha256":CACHE},
        "fresh_frozen_verifier": frozen_verify,
        "fresh_frozen_tests": {"status":frozen_tests.get("status"),"counts":frozen_tests.get("counts"),"test_digest":frozen_tests.get("test_digest")},
        "reconstruction": {"assignments":len(rows),"packets":len(packet_shas),"intents":len(intent_shas),"edges":len(edge_ids),"unique_edges":len(set(edge_ids)),"source_features":len(features),"packet_bytes_min":min(packet_bytes),"packet_bytes_max":max(packet_bytes),"packet_root":digest(packet_shas),"intent_root":digest(intent_shas)},
        "zero_state": {"empty_outputs":sum(not any(Path(row["output_directory"]).iterdir()) for row in rows),"results":0,"receipts":0,"activations":0,"native_capture_rows":0,"credit":0},
        "authorized_cohorts": ["cohort-0001","cohort-0002"] if not errors else [],
        "atomic_transaction_size": 16, "atomic32_forbidden": True,
        "cohorts_0003_0004_untouched": True, "activation_granted": False,
        "credits": {"coverage":0,"research":0,"spec":0,"merge":0,"promotion":0},
    }
    raw = (json.dumps(decision, indent=2, sort_keys=True) + "\n").encode()
    OUTPUT.parent.mkdir(parents=True, exist_ok=True)
    if OUTPUT.exists() and OUTPUT.read_bytes() != raw:
        raise SystemExit("existing controller decision drift")
    OUTPUT.write_bytes(raw)
    print(json.dumps({"status":decision["status"],"decision_sha256":sha(OUTPUT),"errors":decision["errors"],"routing":routing,"reconstruction":decision["reconstruction"]},indent=2,sort_keys=True))
    raise SystemExit(0 if not errors else 1)


if __name__ == "__main__":
    main()
