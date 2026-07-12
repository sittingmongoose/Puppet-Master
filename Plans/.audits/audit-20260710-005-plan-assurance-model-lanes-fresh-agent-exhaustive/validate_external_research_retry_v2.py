#!/usr/bin/env python3
import argparse
import hashlib
import importlib.util
import json
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parent
VERIFY_PATH = ROOT / "verify_external_research_retry_v2.py"
spec = importlib.util.spec_from_file_location("retry_verify_v2", VERIFY_PATH)
verify = importlib.util.module_from_spec(spec)
spec.loader.exec_module(verify)

def sha256(path):
    return hashlib.sha256(Path(path).read_bytes()).hexdigest()

def result_binding_errors(result, assignment, index):
    errors = []
    aid = assignment["assignment_id"]
    expected = {
        "audit_id": verify.AUDIT_ID,
        "assignment_id": aid,
        "attempt_id": verify.ATTEMPT,
        "topic": assignment["topic"],
        "owner_domains": assignment["owner_domains"],
        "feature_refs": assignment["feature_refs"],
        "agent_path": verify.expected_agent(index),
        "model": verify.MODEL,
        "reasoning_effort": verify.EFFORT,
        "status": "completed",
    }
    for key, value in expected.items():
        if result.get(key) != value:
            errors.append(f"{aid}:result:{key}")
    if not result.get("task_thread_id"):
        errors.append(f"{aid}:result:task_thread_id")
    errors.extend(verify.result_semantic_errors(result, verify.load_json(verify.RETRY / "schema" / "external_research_result_v2.schema.json")))
    return sorted(set(errors))

def receipt_errors(receipt, assignment, index, packet_sha, result_sha):
    aid = assignment["assignment_id"]
    expected = {
        "audit_id": verify.AUDIT_ID,
        "sprint_id": verify.SPRINT,
        "attempt_id": verify.ATTEMPT,
        "assignment_id": aid,
        "controller_thread_id": verify.CONTROLLER,
        "agent_path": verify.expected_agent(index),
        "model": verify.MODEL,
        "reasoning_effort": verify.EFFORT,
        "fresh_child": True,
        "fork_turns": "none",
        "descendants_forbidden": True,
        "followup_messages_forbidden": True,
        "packet_sha256": packet_sha,
        "result_sha256": result_sha,
        "output_directory": str(verify.OUTPUT / aid / "attempts" / verify.ATTEMPT),
        "result_path": str(verify.OUTPUT / aid / "attempts" / verify.ATTEMPT / "result.json"),
        "terminal_turn_status": "completed",
        "terminal_response_prefix": "PMR1",
    }
    return [f"{aid}:receipt:{key}" for key, value in expected.items() if receipt.get(key) != value]

def main():
    parser = argparse.ArgumentParser()
    parser.add_argument("--allow-complete", action="store_true", help="Validate a future completed eight-leaf run instead of the current zero-launch state.")
    args = parser.parse_args()
    verifier_report = json.loads(__import__("subprocess").run([sys.executable, str(VERIFY_PATH)], capture_output=True, text=True).stdout)
    errors = [] if verifier_report.get("status") == "pass" else list(verifier_report.get("errors", ["verifier_failed"]))
    ids = [f"ER-{index:04d}" for index in range(1, 9)]
    manifest = verify.load_json(verify.RETRY / "manifest.json")
    assignments = {item["assignment_id"]: item for item in manifest["assignments"]}
    current = {"output_files": [], "receipt_ids": [], "result_ids": []}
    for index, aid in enumerate(ids):
        out_dir = verify.OUTPUT / aid / "attempts" / verify.ATTEMPT
        files = sorted(p for p in out_dir.rglob("*") if p.is_file()) if out_dir.is_dir() else []
        current["output_files"].extend(str(p.relative_to(out_dir)) for p in files)
        receipt_path = verify.RETRY / "dispatch" / aid / verify.ATTEMPT / "dispatch_receipt.json"
        result_path = out_dir / "result.json"
        if receipt_path.is_file():
            current["receipt_ids"].append(aid)
        if result_path.is_file():
            current["result_ids"].append(aid)
            if args.allow_complete:
                try:
                    result = verify.load_json(result_path)
                    errors.extend(result_binding_errors(result, assignments[aid], index))
                except Exception as exc:
                    errors.append(f"{aid}:result:unreadable:{exc}")
                if receipt_path.is_file():
                    try:
                        receipt = verify.load_json(receipt_path)
                        errors.extend(receipt_errors(receipt, assignments[aid], index, sha256(verify.RETRY / "packets" / f"{aid}.json"), sha256(result_path)))
                    except Exception as exc:
                        errors.append(f"{aid}:receipt:unreadable:{exc}")
    if not args.allow_complete:
        errors.extend(verify.validate_prelaunch_inventory(current["output_files"], current["receipt_ids"], current["result_ids"]))
    else:
        if current["result_ids"] != ids:
            errors.append("postrun:exactly_eight_results_required")
        if current["receipt_ids"] != ids:
            errors.append("postrun:exactly_eight_receipts_required")
        for aid in ids:
            out_dir = verify.OUTPUT / aid / "attempts" / verify.ATTEMPT
            extras = sorted(p.name for p in out_dir.iterdir() if p.is_file() and p.name != "result.json") if out_dir.is_dir() else []
            if extras:
                errors.append(f"{aid}:postrun:extra_output_files:{','.join(extras)}")
    report = {
        "checker": "external_research_retry_postrun_validator_v2",
        "status": "pass" if not errors else "fail",
        "mode": "postrun" if args.allow_complete else "prelaunch_zero_state",
        "errors": sorted(set(errors)),
        "verifier_status": verifier_report.get("status"),
        "counts": {
            "assignments": 8,
            "results": len(current["result_ids"]),
            "receipts": len(current["receipt_ids"]),
            "output_files": len(current["output_files"]),
        },
        "promotion_credit": 0,
        "research_credit": 0,
        "activation_granted": False,
    }
    print(json.dumps(report, sort_keys=True, separators=(",", ":")))
    return 0 if report["status"] == "pass" else 1

if __name__ == "__main__":
    sys.exit(main())

