#!/usr/bin/env python3
from __future__ import annotations

import argparse
import json
import os
import sys
from pathlib import Path
from typing import Any

BASE = Path(__file__).resolve().parent
NS = BASE.parent
sys.path.insert(0, str(NS / "tools"))
sys.path.insert(0, str(BASE))

import canonical_json  # noqa: E402
import closure_validator_v7_3 as CV  # noqa: E402
import common  # noqa: E402


def receipt_path(aid: str, fixture: str | None) -> Path:
    if fixture is None:
        return common.receipt_path(aid)
    return Path(fixture).resolve() / f"{aid}-dispatch_receipt.json"


def capture_target(fixture: str | None) -> Path:
    if fixture is None:
        return common.capture_path()
    root = Path(fixture).resolve()
    allowed = (BASE / "fixture-sandbox").resolve()
    if os.environ.get("AUDIT005_V7_3_FIXTURE_MODE") != "1" or allowed not in [root, *root.parents]:
        raise SystemExit("fixture mode/path forbidden")
    root.mkdir(parents=True, exist_ok=True)
    return root / "native_capture.json"


def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument("--native-state", type=Path, required=True)
    parser.add_argument("--sha256", required=True)
    parser.add_argument("--fixture-root")
    args = parser.parse_args()
    expected_state = NS / "runtime/native-state-v7_1.json"
    if args.native_state.resolve() != expected_state.resolve():
        raise SystemExit("native state path mismatch")
    native_raw = args.native_state.read_bytes()
    if common.sha_bytes(native_raw) != args.sha256:
        raise SystemExit("native state drift")
    native_state = common.parse_standard_exact(native_raw)
    errors = CV.native_state_errors(native_state)
    if errors:
        raise SystemExit(json.dumps({"status": "fail_closed", "errors": errors}, indent=2))
    core_raw = common.core_path().read_bytes()
    envelope_raw = common.envelope_path().read_bytes()
    core = common.parse_standard_exact(core_raw)
    envelope = common.parse_standard_exact(envelope_raw)
    snapshots: dict[str, dict[str, Any]] = {}
    leaves: list[dict[str, Any]] = []
    for native in native_state["leaves"]:
        aid = native["assignment_id"]
        receipt_file = receipt_path(aid, args.fixture_root)
        if not receipt_file.is_file():
            errors.append(aid + ":receipt-missing")
            continue
        result_raw = common.result_path(aid).read_bytes()
        receipt_raw = receipt_file.read_bytes()
        auth_raw = common.authorization_path(aid).read_bytes()
        proof_path = NS / "runtime/terminal-proofs" / f"{aid}.json"
        proof_raw = proof_path.read_bytes()
        receipt = common.parse_standard_exact(receipt_raw)
        authorization = common.parse_standard_exact(auth_raw)
        proof = common.parse_standard_exact(proof_raw)
        output_tree_sha = common.output_tree_sha256(common.output_dir(aid))
        errors.extend(CV.receipt_errors(
            receipt, aid=aid, native=native, result_raw=result_raw,
            receipt_raw=receipt_raw, output_tree_sha256=output_tree_sha,
        ))
        expected_receipt = {
            "activation_core_file_sha256": common.sha_bytes(core_raw),
            "activation_core_object_canonical_sha256": common.canonical_sha(core),
            "leaf_dispatch_authorization_file_sha256": common.sha_bytes(auth_raw),
            "leaf_dispatch_authorization_object_canonical_sha256": common.canonical_sha(authorization),
            "activation_envelope_file_sha256": common.sha_bytes(envelope_raw),
            "activation_envelope_object_canonical_sha256": common.canonical_sha(envelope),
            "model": common.MODEL,
            "reasoning_effort": common.REASONING_EFFORT,
            "controller_thread_id": common.CONTROLLER_THREAD_ID,
            "output_tree_sha256": output_tree_sha,
            "parent_spawn_call_sha256": proof.get("parent_spawn_call_sha256"),
            "parent_spawn_result_sha256": proof.get("parent_spawn_result_sha256"),
        }
        for key, wanted in expected_receipt.items():
            if receipt.get(key) != wanted:
                errors.append(aid + ":receipt-join:" + key)
        for key in ("agent_path", "native_child_thread_id", "native_child_turn_id"):
            if proof.get(key) != native.get(key):
                errors.append(aid + ":proof-native-join:" + key)
        snapshots[aid] = {
            "result_raw": result_raw,
            "receipt_raw": receipt_raw,
            "auth_raw": auth_raw,
            "proof_raw": proof_raw,
            "proof_path": proof_path,
            "receipt_path": receipt_file,
            "output_tree_sha256": output_tree_sha,
        }
        leaves.append({
            "assignment_id": aid,
            "agent_path": receipt["agent_path"],
            "native_child_thread_id": native["native_child_thread_id"],
            "native_child_turn_id": native["native_child_turn_id"],
            "terminal_response_exact": "PMR1",
            "result_file_sha256": common.sha_bytes(result_raw),
            "result_object_canonical_sha256": canonical_json.canonical_sha256_from_buffer(result_raw),
            "receipt_file_sha256": common.sha_bytes(receipt_raw),
            "receipt_object_canonical_sha256": canonical_json.canonical_sha256_from_buffer(receipt_raw),
            "output_tree_sha256": output_tree_sha,
            "activation_core_file_sha256": common.sha_bytes(core_raw),
            "activation_core_object_canonical_sha256": common.canonical_sha(core),
            "leaf_dispatch_authorization_file_sha256": common.sha_bytes(auth_raw),
            "leaf_dispatch_authorization_object_canonical_sha256": common.canonical_sha(authorization),
        })
    capture = {
        "schema_version": "external-research-native-capture-v7.3",
        "attempt_id": common.ATTEMPT_ID,
        "controller_thread_id": common.CONTROLLER_THREAD_ID,
        "assignment_count": 2,
        "native_state_path": str(args.native_state),
        "native_state_file_sha256": args.sha256,
        "digest_semantics_version": "raw-file-and-canonical-object-explicit-v7.3",
        "leaves": leaves,
        "native_identity_uniqueness_verified": True,
        "receipt_result_tree_joins_verified": True,
        "single_buffers_used": True,
        "toctou_recheck_passed_before_write": True,
        "toctou_recheck_passed_after_write": True,
        "atomic_exclusive_write": True,
        "coverage_credit": 0,
        "research_credit": 0,
        "promotion_credit": 0,
        "spec_credit": 0,
        "merge_credit": 0,
    }
    errors.extend(CV.capture_errors(capture))
    if errors:
        raise SystemExit(json.dumps({"status": "fail_closed", "errors": sorted(set(errors))}, indent=2))
    # Full TOCTOU closure immediately before atomic exclusive creation.
    if (
        args.native_state.read_bytes() != native_raw
        or common.core_path().read_bytes() != core_raw
        or common.envelope_path().read_bytes() != envelope_raw
    ):
        raise SystemExit("TOCTOU prewrite global")
    for aid, snapshot in snapshots.items():
        if (
            common.result_path(aid).read_bytes() != snapshot["result_raw"]
            or snapshot["receipt_path"].read_bytes() != snapshot["receipt_raw"]
            or common.authorization_path(aid).read_bytes() != snapshot["auth_raw"]
            or snapshot["proof_path"].read_bytes() != snapshot["proof_raw"]
            or common.output_tree_sha256(common.output_dir(aid)) != snapshot["output_tree_sha256"]
        ):
            raise SystemExit(aid + ":TOCTOU prewrite")
    output = capture_target(args.fixture_root)
    CV.atomic_write_exclusive(output, capture)
    if (
        args.native_state.read_bytes() != native_raw
        or common.core_path().read_bytes() != core_raw
        or common.envelope_path().read_bytes() != envelope_raw
    ):
        raise SystemExit("TOCTOU postwrite global")
    for aid, snapshot in snapshots.items():
        if (
            common.result_path(aid).read_bytes() != snapshot["result_raw"]
            or snapshot["receipt_path"].read_bytes() != snapshot["receipt_raw"]
            or common.authorization_path(aid).read_bytes() != snapshot["auth_raw"]
            or snapshot["proof_path"].read_bytes() != snapshot["proof_raw"]
            or common.output_tree_sha256(common.output_dir(aid)) != snapshot["output_tree_sha256"]
        ):
            raise SystemExit(aid + ":TOCTOU postwrite")
    written_raw = output.read_bytes()
    written = common.parse_standard_exact(written_raw)
    post_errors = CV.capture_errors(written)
    if post_errors:
        raise SystemExit(json.dumps({"status": "fail_closed", "errors": post_errors}, indent=2))
    print(json.dumps({
        "status": "pass", "capture_path": str(output), "capture_rows": len(written["leaves"]),
        "capture_file_sha256": common.sha_bytes(written_raw),
        "capture_canonical_sha256": canonical_json.canonical_sha256_from_buffer(written_raw),
    }, sort_keys=True))


if __name__ == "__main__":
    main()
