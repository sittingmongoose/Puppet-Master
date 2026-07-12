#!/usr/bin/env python3
"""Build the one authorized V32 exact-six scenario-repair activation."""
from __future__ import annotations

import hashlib
import json
import os
import stat
import subprocess
from pathlib import Path


AUDIT = Path("/Users/jaredsmacbookair/Documents/PuppetMaster/Plans/.audits/audit-20260710-005-plan-assurance-model-lanes-fresh-agent-exhaustive")
HERE = Path(__file__).resolve().parent
GATE = AUDIT / "master/scenario_adversarial/wave-0001/cohorts/cohort-0002/semantic-repair-attempt-0002-gate-v31"
POLICY = AUDIT / "master/coordination/CONCURRENCY_POLICY_V32.json"
PYTHON = Path("/Users/jaredsmacbookair/.cache/codex-runtimes/codex-primary-runtime/dependencies/python/bin/python3")
SITE = AUDIT / "master/dependencies/jsonschema-draft202012-v1/site-packages"
IDS = ["A005SA-0009", "A005SA-0010", "A005SA-0012", "A005SA-0013", "A005SA-0014", "A005SA-0016"]
TX = "SCENARIO-C2-SEMANTIC-REPAIR-ATTEMPT-0002-V32-EXACT6"
EXPECTED = {
    "policy": "4826ade4c38db47ee184b34e5d7b7bd5ba6cabeecc9baa686cb9d99eeff8a3ed",
    "luna_review": "c5c80b27154c4e39831a32dee8c116a3097f4ca6feade83da5faa54c89abe94c",
    "parent_capture": "034756c6134cb8119d0b593959123478ab60025a484fdac8bcdbfda4f73eb925",
    "immutable_authority": "45dadd69bd049298c2d551fcb58a916952a355a22c02f6c2f8be6ddf673517e1",
    "v31_2_supplement": "10f7753f9133b744a073ae5755397093ff980b3b544365dd8fb8f670c33339b5",
    "v31_2_test_report": "e5f1daeecb60aade80cebebb726d4019bb1a9f90992141e13f5a58e902f6c233",
    "gate_manifest": "85ceb853501881fb23dc7a6ce8dfb0d1700555ed8c15f2930a8424408701c1f0",
    "result_schema": "da13752427a3ade2339bbefddf660b4f72aba3bb158a85a2fe413b8b28ad76d2",
    "leaf_prompt": "f218d13e51951ee7e9ecbfd38ce03a475579672defe324c746a654c595ed7c85",
    "popper": "bd0a749e597fcb74c5347c85865c552c3f4a99a88543d754cf94ef7624fdd932",
}


def sha(path: Path) -> str:
    return hashlib.sha256(path.read_bytes()).hexdigest()


def canonical(value: object) -> bytes:
    return (json.dumps(value, ensure_ascii=False, sort_keys=True, separators=(",", ":")) + "\n").encode()


def load(path: Path) -> object:
    return json.loads(path.read_text(encoding="utf-8"), object_pairs_hook=_unique)


def _unique(pairs: list[tuple[str, object]]) -> dict[str, object]:
    out: dict[str, object] = {}
    for key, value in pairs:
        if key in out:
            raise ValueError(f"duplicate key: {key}")
        out[key] = value
    return out


def write_once(path: Path, payload: bytes) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)
    fd = os.open(path, os.O_WRONLY | os.O_CREAT | os.O_EXCL, 0o444)
    try:
        view = memoryview(payload)
        while view:
            view = view[os.write(fd, view):]
        os.fsync(fd)
    finally:
        os.close(fd)
    os.chmod(path, 0o444)


def binding(path: Path) -> dict[str, object]:
    return {"path": str(path), "raw_sha256": sha(path), "byte_count": path.stat().st_size}


def run_gate() -> tuple[dict[str, object], str]:
    env = {
        "HOME": "/Users/jaredsmacbookair",
        "PATH": str(PYTHON.parent) + ":/usr/bin:/bin",
        "PYTHONPATH": str(SITE),
        "PYTHONNOUSERSITE": "1",
        "PYTHONDONTWRITEBYTECODE": "1",
        "PYTHONHASHSEED": "0",
        "LC_ALL": "C",
        "TZ": "UTC",
    }
    proc = subprocess.run([str(PYTHON), "-S", "-B", str(GATE / "verify_gate_v31_2.py")], cwd=GATE, env=env, capture_output=True, check=False)
    if proc.returncode != 0 or proc.stderr:
        raise RuntimeError(f"gate verifier failed: {proc.returncode}: {proc.stderr.decode(errors='replace')}")
    report = json.loads(proc.stdout)
    if report.get("status") != "pass_blocked" or report.get("errors") != []:
        raise RuntimeError(f"gate not pass_blocked: {report}")
    if report.get("fresh_luna_review") != "present_valid" or report.get("parent_native_capture") != "present_valid":
        raise RuntimeError("fresh Luna/capture not live-valid")
    if report.get("blocking_reasons") != ["activation_false", "separate_future_v32_activation_transaction_required"]:
        raise RuntimeError("unexpected gate blockers")
    counts = report.get("counts", {})
    if counts != {"credit": 0, "empty_output_directories": 6, "features": 687, "receipts": 0, "repair_assignments": 6, "results": 0, "sol_native_capture_rows": 0, "spawned_children": 0, "tests": 348}:
        raise RuntimeError(f"unexpected gate counts: {counts}")
    return report, hashlib.sha256(proc.stdout).hexdigest()


def main() -> None:
    pins = {
        "policy": POLICY,
        "luna_review": GATE / "validation/luna-prelaunch-review-v31_2.json",
        "parent_capture": GATE / "validation/controller-parent-native-identity-capture-v31_2.json",
        "immutable_authority": GATE / "IMMUTABLE_AUTHORITY.json",
        "v31_2_supplement": GATE / "AUTHORITY_SUPPLEMENT_V31_2.json",
        "v31_2_test_report": GATE / "validation/test-report-v31_2.json",
        "gate_manifest": GATE / "gate_manifest.jsonl",
        "result_schema": GATE / "schema/result.schema.json",
        "leaf_prompt": GATE / "leaf_prompt.json",
        "popper": AUDIT / "master/scenario_adversarial/wave-0001/postrun-validator-v29-ultra/independent-execution/cohort-0002-luna-postrun.json",
    }
    for label, path in pins.items():
        if sha(path) != EXPECTED[label]:
            raise RuntimeError(f"pin drift: {label}")
    gate_report, gate_stdout_sha = run_gate()
    rows = [json.loads(line) for line in (GATE / "gate_manifest.jsonl").read_text().splitlines() if line]
    if [row["assignment_id"] for row in rows] != IDS or sum(row["feature_count"] for row in rows) != 687:
        raise RuntimeError("manifest exact-six mismatch")
    for row in rows:
        out = Path(row["output_tree"]["path"])
        if not out.is_dir() or out.is_symlink() or any(out.iterdir()):
            raise RuntimeError(f"output not empty: {out}")
        intent = Path(row["v31_intent"]["path"])
        if sha(intent) != row["v31_intent"]["raw_sha256"]:
            raise RuntimeError(f"intent drift: {row['assignment_id']}")
        data = load(intent)
        if data["runtime"]["model"] != "gpt-5.6-sol" or data["runtime"]["reasoning_effort"] != "ultra" or data["runtime"]["fork_turns"] != "none":
            raise RuntimeError("runtime contract drift")

    receipt_contract = {
        "schema_version": "scenario-repair-terminal-receipt-contract-v32-v1",
        "audit_id": AUDIT.name,
        "transaction_id": TX,
        "controller_task_path": "/root/sol_controller_v29",
        "terminal_response": "PMR1",
        "write_order": ["result.json", "terminal_receipt.json", "PMR1"],
        "result_count_per_leaf": 1,
        "terminal_receipt_count_per_leaf": 1,
        "receipts_before_result_forbidden": True,
        "followups_forbidden": True,
        "retries_forbidden": True,
        "descendants_forbidden": True,
        "required_receipt_keys": ["audit_id", "transaction_id", "assignment_id", "attempt_id", "canonical_agent_path", "result_path", "result_sha256", "receipt_path", "terminal_status", "terminal_response", "model", "reasoning_effort", "fork_turns", "followups", "retries", "descendants"],
    }
    write_once(HERE / "receipt_contract_v32.json", canonical(receipt_contract))

    core = {
        "schema_version": "scenario-repair-activation-core-v32-exact6-v1",
        "audit_id": AUDIT.name,
        "transaction_id": TX,
        "status": "ACTIVE_EXACTLY_6_FRESH_SOL_ULTRA_ATTEMPT_0002",
        "activation_authorized": True,
        "launch_authorized": True,
        "assignment_ids": IDS,
        "assignment_count": 6,
        "feature_count": 687,
        "model": "gpt-5.6-sol",
        "reasoning_effort": "ultra",
        "fork_turns": "none",
        "controller_task_path": "/root/sol_controller_v29",
        "concurrency_exclusions": ["certification_c1", "certification_c2", "scenario_late_cohorts", "all_other_semantic_transactions"],
        "gate_verification": {"status": gate_report["status"], "errors": [], "stdout_sha256": gate_stdout_sha, "tests": 348},
        "bindings": {label: binding(path) for label, path in pins.items()},
        "receipt_contract": binding(HERE / "receipt_contract_v32.json"),
        "prior_popper_scope": {"raw_sha256": EXPECTED["popper"], "authority_scope": "exact_rejected_set_only", "gate_prelaunch_authority": False},
        "credit": 0,
        "postrun_required_before_credit": True,
        "fresh_luna_postrun_authorized": False,
    }
    write_once(HERE / "activation_core.json", canonical(core))

    manifest_lines: list[bytes] = []
    for row in rows:
        aid = row["assignment_id"]
        out = Path(row["output_tree"]["path"])
        auth = {
            "schema_version": "scenario-repair-leaf-authorization-v32-v1",
            "audit_id": AUDIT.name,
            "transaction_id": TX,
            "activation_granted": True,
            "assignment_id": aid,
            "attempt_id": "attempt-0002",
            "feature_count": row["feature_count"],
            "feature_refs_digest": row["feature_refs_digest"],
            "canonical_agent_path": row["fresh_identity_path"],
            "model": "gpt-5.6-sol",
            "reasoning_effort": "ultra",
            "fork_turns": "none",
            "fresh_child": True,
            "descendants_forbidden": True,
            "followups_forbidden": True,
            "retries_forbidden": True,
            "packet": row["packet"],
            "intent": row["v31_intent"],
            "activation_core": binding(HERE / "activation_core.json"),
            "receipt_contract": binding(HERE / "receipt_contract_v32.json"),
            "result_schema": binding(GATE / "schema/result.schema.json"),
            "leaf_prompt": binding(GATE / "leaf_prompt.json"),
            "output_directory": str(out),
            "result_path": str(out / "result.json"),
            "terminal_receipt_path": str(out / "terminal_receipt.json"),
            "terminal_response": "PMR1",
            "read_forbidden": ["canonical Plans prose", "attempt-0001 result body", "peer results"],
            "live_public_web_research_required": True,
            "credit": 0,
        }
        auth_path = HERE / "authorizations" / f"{aid}.json"
        write_once(auth_path, canonical(auth))
        mrow = {"sequence": len(manifest_lines) + 1, "assignment_id": aid, "authorization": binding(auth_path), "result_path": auth["result_path"], "terminal_receipt_path": auth["terminal_receipt_path"], "canonical_agent_path": auth["canonical_agent_path"]}
        manifest_lines.append(canonical(mrow))
    write_once(HERE / "activation_manifest.jsonl", b"".join(manifest_lines))

    prelaunch = {
        "schema_version": "scenario-repair-activation-prelaunch-v32-v1",
        "status": "PASS_READY_EXACT6_ZERO_RESULTS_ZERO_RECEIPTS",
        "errors": [],
        "activation_core": binding(HERE / "activation_core.json"),
        "activation_manifest": binding(HERE / "activation_manifest.jsonl"),
        "authorization_count": 6,
        "output_directories_empty": 6,
        "native_capture_rows": 0,
        "results": 0,
        "terminal_receipts": 0,
        "credit": 0,
    }
    write_once(HERE / "prelaunch_verification.json", canonical(prelaunch))
    envelope = {
        "schema_version": "scenario-repair-activation-envelope-v32-exact6-v1",
        "status": "SEALED_ACTIVE_EXACT6",
        "transaction_id": TX,
        "activation_authorized": True,
        "launch_authorized": True,
        "activation_core": binding(HERE / "activation_core.json"),
        "activation_manifest": binding(HERE / "activation_manifest.jsonl"),
        "prelaunch_verification": binding(HERE / "prelaunch_verification.json"),
        "authorization_root_sha256": hashlib.sha256(b"".join(manifest_lines)).hexdigest(),
        "assignment_ids": IDS,
        "policy_v32_sha256": EXPECTED["policy"],
        "no_other_semantic_transaction_authorized": True,
        "credit": 0,
    }
    write_once(HERE / "activation_envelope.json", canonical(envelope))
    seal = {
        "schema_version": "scenario-repair-activation-tool-seal-v32-v1",
        "status": "SEALED_ACTIVE_EXACT6",
        "activation_sha256": sha(HERE / "activation_envelope.json"),
        "files": {str(path.relative_to(HERE)): sha(path) for path in sorted(HERE.rglob("*")) if path.is_file() and path.name != "activation_tool_seal.json"},
        "native_capture_state": "required_after_spawn_absent",
        "credit": 0,
    }
    write_once(HERE / "activation_tool_seal.json", canonical(seal))
    for path in (HERE / "build_activation_v32.py", HERE / "verify_activation_v32.py"):
        os.chmod(path, 0o444)
    print(json.dumps({"status": "SEALED_ACTIVE_EXACT6", "activation_sha256": sha(HERE / "activation_envelope.json"), "tool_seal_sha256": sha(HERE / "activation_tool_seal.json")}, sort_keys=True))


if __name__ == "__main__":
    main()
