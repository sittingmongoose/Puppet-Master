#!/usr/bin/env python3
"""Append-only verification supersession for the exact-six V32 activation."""
from __future__ import annotations

import ast
import hashlib
import json
from pathlib import Path


HERE = Path(__file__).resolve().parents[1]
AUDIT = Path("/Users/jaredsmacbookair/Documents/PuppetMaster/Plans/.audits/audit-20260710-005-plan-assurance-model-lanes-fresh-agent-exhaustive")
GATE = AUDIT / "master/scenario_adversarial/wave-0001/cohorts/cohort-0002/semantic-repair-attempt-0002-gate-v31"
IDS = ["A005SA-0009", "A005SA-0010", "A005SA-0012", "A005SA-0013", "A005SA-0014", "A005SA-0016"]
EXPECTED = {
    "activation": "4a6ddbddfb45812831b44124e224b9adcfaec13e77714523675b27584181932c",
    "policy": "4826ade4c38db47ee184b34e5d7b7bd5ba6cabeecc9baa686cb9d99eeff8a3ed",
    "luna": "c5c80b27154c4e39831a32dee8c116a3097f4ca6feade83da5faa54c89abe94c",
    "capture": "034756c6134cb8119d0b593959123478ab60025a484fdac8bcdbfda4f73eb925",
}


def sha(path: Path) -> str:
    return hashlib.sha256(path.read_bytes()).hexdigest()


def load(path: Path) -> dict:
    return json.loads(path.read_text(encoding="utf-8"))


def main() -> None:
    checks: dict[str, bool] = {}
    core = load(HERE / "activation_core.json")
    envelope = load(HERE / "activation_envelope.json")
    prelaunch = load(HERE / "prelaunch_verification.json")
    seal = load(HERE / "activation_tool_seal.json")
    contract = load(HERE / "receipt_contract_v32.json")
    rows = [json.loads(line) for line in (HERE / "activation_manifest.jsonl").read_text().splitlines() if line]

    checks["activation-sha"] = sha(HERE / "activation_envelope.json") == EXPECTED["activation"]
    checks["policy"] = envelope.get("policy_v32_sha256") == EXPECTED["policy"]
    checks["exact-six"] = envelope.get("assignment_ids") == IDS and core.get("assignment_ids") == IDS and [row.get("assignment_id") for row in rows] == IDS
    checks["exact-counts"] = core.get("assignment_count") == 6 and core.get("feature_count") == 687 and len(rows) == 6
    checks["runtime"] = core.get("model") == "gpt-5.6-sol" and core.get("reasoning_effort") == "ultra" and core.get("fork_turns") == "none"
    checks["exclusive-semantic"] = core.get("concurrency_exclusions") == ["certification_c1", "certification_c2", "scenario_late_cohorts", "all_other_semantic_transactions"] and envelope.get("no_other_semantic_transaction_authorized") is True
    checks["prelaunch"] = prelaunch.get("status") == "PASS_READY_EXACT6_ZERO_RESULTS_ZERO_RECEIPTS" and prelaunch.get("errors") == [] and prelaunch.get("results") == 0 and prelaunch.get("terminal_receipts") == 0
    checks["receipt-order"] = contract.get("write_order") == ["result.json", "terminal_receipt.json", "PMR1"] and contract.get("terminal_response") == "PMR1"
    checks["luna-binding"] = core.get("bindings", {}).get("luna_review", {}).get("raw_sha256") == EXPECTED["luna"] and sha(GATE / "validation/luna-prelaunch-review-v31_2.json") == EXPECTED["luna"]
    checks["capture-binding"] = core.get("bindings", {}).get("parent_capture", {}).get("raw_sha256") == EXPECTED["capture"] and sha(GATE / "validation/controller-parent-native-identity-capture-v31_2.json") == EXPECTED["capture"]
    checks["popper-scope"] = core.get("prior_popper_scope", {}).get("authority_scope") == "exact_rejected_set_only" and core.get("prior_popper_scope", {}).get("gate_prelaunch_authority") is False
    checks["credit-zero"] = core.get("credit") == 0 and envelope.get("credit") == 0 and prelaunch.get("credit") == 0

    authorization_ok = True
    output_ok = True
    paths: set[str] = set()
    for row in rows:
        aid = row["assignment_id"]
        auth_path = HERE / "authorizations" / f"{aid}.json"
        auth = load(auth_path)
        authorization_ok &= row.get("authorization", {}).get("raw_sha256") == sha(auth_path)
        authorization_ok &= auth.get("assignment_id") == aid and auth.get("attempt_id") == "attempt-0002" and auth.get("activation_granted") is True
        authorization_ok &= auth.get("model") == "gpt-5.6-sol" and auth.get("reasoning_effort") == "ultra" and auth.get("fork_turns") == "none"
        authorization_ok &= auth.get("followups_forbidden") is True and auth.get("retries_forbidden") is True and auth.get("descendants_forbidden") is True
        authorization_ok &= auth.get("terminal_response") == "PMR1"
        paths.add(auth["canonical_agent_path"])
        out = Path(auth["output_directory"])
        output_ok &= out.is_dir() and not out.is_symlink() and not any(out.iterdir())
        output_ok &= Path(auth["result_path"]).parent == out and Path(auth["terminal_receipt_path"]).parent == out
    checks["authorizations"] = bool(authorization_ok)
    checks["unique-agent-paths"] = len(paths) == 6 and paths == {f"/root/sol_controller_v29/a005_scenario_adversarial_{aid[-4:]}_semantic_repair_attempt_0002_ultra_v31" for aid in IDS}
    checks["outputs-empty"] = bool(output_ok)
    checks["native-capture-absent"] = not (HERE / "runtime/native_capture.json").exists()

    sealed_ok = True
    for relative, expected in seal.get("files", {}).items():
        path = HERE / relative
        sealed_ok &= path.is_file() and sha(path) == expected
    checks["original-seal-closure"] = bool(sealed_ok)
    try:
        ast.parse((HERE / "verify_activation_v32.py").read_text(encoding="utf-8"))
        syntax_failed = False
    except SyntaxError:
        syntax_failed = True
    checks["failed-verifier-lineage"] = syntax_failed
    checks["supersession-self-syntax"] = bool(ast.parse(Path(__file__).read_text(encoding="utf-8")))

    errors = sorted(name for name, passed in checks.items() if not passed)
    report = {
        "schema_version": "scenario-repair-activation-verification-v32-v2",
        "status": "pass_ready_exact6_v2" if not errors else "fail_closed",
        "errors": errors,
        "checks": checks,
        "check_count": len(checks),
        "activation_sha256": EXPECTED["activation"],
        "assignments": 6,
        "features": 687,
        "results": 0,
        "terminal_receipts": 0,
        "native_capture_rows": 0,
        "credit": 0,
    }
    print(json.dumps(report, indent=2, sort_keys=True))
    raise SystemExit(0 if not errors else 1)


if __name__ == "__main__":
    main()
