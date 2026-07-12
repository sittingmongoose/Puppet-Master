#!/usr/bin/env python3
"""Fail-closed verifier for the V32 exact-six activation transaction."""
from __future__ import annotations

import argparse
import hashlib
import json
import stat
from pathlib import Path


HERE = Path(__file__).resolve().parent
IDS = ["A005SA-0009", "A005SA-0010", "A005SA-0012", "A005SA-0013", "A005SA-0014", "A005SA-0016"]
EXPECTED_POLICY = "4826ade4c38db47ee184b34e5d7b7bd5ba6cabeecc9baa686cb9d99eeff8a3ed"


def sha(path: Path) -> str:
    return hashlib.sha256(path.read_bytes()).hexdigest()


def load(path: Path) -> object:
    return json.loads(path.read_text(encoding="utf-8"))


def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument("--mode", choices=("prelaunch", "launched"), default="prelaunch")
    args = parser.parse_args()
    errors: list[str] = []
    required = ["activation_core.json", "activation_envelope.json", "activation_manifest.jsonl", "prelaunch_verification.json", "receipt_contract_v32.json", "activation_tool_seal.json", "build_activation_v32.py", "verify_activation_v32.py"] + [f"authorizations/{aid}.json" for aid in IDS]
    for rel in required:
        path = HERE / rel
        if not path.is_file() or path.is_symlink() or path.stat().st_nlink != 1:
            errors.append(f"file:{rel}")
    if errors:
        print(json.dumps({"status": "fail_closed", "errors": errors}, sort_keys=True)); raise SystemExit(1)
    core = load(HERE / "activation_core.json")
    env = load(HERE / "activation_envelope.json")
    pre = load(HERE / "prelaunch_verification.json")
    seal = load(HERE / "activation_tool_seal.json")
    rows = [json.loads(line) for line in (HERE / "activation_manifest.jsonl").read_text().splitlines() if line]
    if core.get("status") != "ACTIVE_EXACTLY_6_FRESH_SOL_ULTRA_ATTEMPT_0002" or core.get("assignment_ids") != IDS or core.get("feature_count") != 687:
        errors.append("core")
    if env.get("status") != "SEALED_ACTIVE_EXACT6" or env.get("assignment_ids") != IDS or env.get("policy_v32_sha256") != EXPECTED_POLICY:
        errors.append("envelope")
    if pre.get("status") != "PASS_READY_EXACT6_ZERO_RESULTS_ZERO_RECEIPTS" or pre.get("errors") != []:
        errors.append("prelaunch")
    if len(rows) != 6 or [row.get("assignment_id") for row in rows] != IDS:
        errors.append("manifest")
    for row in rows:
        aid = row["assignment_id"]
        auth_path = HERE / "authorizations" / f"{aid}.json"
        auth = load(auth_path)
        if row["authorization"]["raw_sha256"] != sha(auth_path) or auth.get("activation_granted") is not True or auth.get("attempt_id") != "attempt-0002":
            errors.append(f"auth:{aid}")
        out = Path(auth["output_directory"])
        files = sorted(path.name for path in out.iterdir()) if out.is_dir() and not out.is_symlink() else ["invalid"]
        allowed = [] if args.mode == "prelaunch" else ["result.json", "terminal_receipt.json"]
        if any(name not in allowed for name in files) or (args.mode == "prelaunch" and files):
            errors.append(f"output:{aid}")
    for rel, expected in seal.get("files", {}).items():
        path = HERE / rel
        if not path.is_file() or sha(path) != expected:
            errors.append(f"seal:{rel}")
    capture = HERE / "runtime/native_capture.json"
    if args.mode == "prelaunch" and capture.exists():
        errors.append("capture-present-prelaunch")
    if args.mode == "launched" and not capture.is_file():
        errors.append("capture-missing-launched")
    errors = sorted(set(errors))
    print(json.dumps({"status": "pass_ready_exact6" if not errors else "fail_closed", "errors": errors, "mode": args.mode, "activation_sha256": sha(HERE / "activation_envelope.json"), "assignments": len(rows), "features": 687, "results": sum((Path(load(HERE / "authorizations" / f"{aid}.json")["result_path"]).is_file() for aid in IDS)), "terminal_receipts": sum((Path(load(HERE / "authorizations" / f"{aid}.json")["terminal_receipt_path"]).is_file() for aid in IDS), "credit": 0}, sort_keys=True))
    raise SystemExit(0 if not errors else 1)


if __name__ == "__main__":
    main()
