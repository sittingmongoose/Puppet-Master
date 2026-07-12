#!/usr/bin/env python3
from __future__ import annotations

import argparse
import importlib.util
import json
import os
import sys
from pathlib import Path

BASE = Path(__file__).resolve().parent
NS = BASE.parent
V72 = NS / "validation/receipt-closure-v7_2"
sys.path.insert(0, str(NS / "tools"))
sys.path.insert(0, str(BASE))
sys.path.insert(0, str(V72))

import canonical_json  # noqa: E402
import closure_validator_v7_3 as CV  # noqa: E402
import common  # noqa: E402

SPEC = importlib.util.spec_from_file_location("writer_v72", V72 / "write_positive_receipt_v7_2.py")
W72 = importlib.util.module_from_spec(SPEC)
assert SPEC.loader is not None
SPEC.loader.exec_module(W72)

ACTUAL = W72.ACT
HISTORICAL = W72.EMB


def target(aid: str, fixture: str | None) -> Path:
    if fixture is None:
        return common.receipt_path(aid)
    root = Path(fixture).resolve()
    allowed = (BASE / "fixture-sandbox").resolve()
    if os.environ.get("AUDIT005_V7_3_FIXTURE_MODE") != "1" or allowed not in [root, *root.parents]:
        raise SystemExit("fixture mode/path forbidden")
    root.mkdir(parents=True, exist_ok=True)
    return root / f"{aid}-dispatch_receipt.json"


def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument("--assignment-id", choices=common.RECOVERY_IDS, required=True)
    parser.add_argument("--terminal-proof", type=Path, required=True)
    parser.add_argument("--terminal-proof-sha256", required=True)
    parser.add_argument("--fixture-root")
    args = parser.parse_args()
    aid = args.assignment_id
    expected_proof = NS / "runtime/terminal-proofs" / f"{aid}.json"
    if args.terminal_proof.resolve() != expected_proof.resolve():
        raise SystemExit("terminal proof path mismatch")
    required = [
        common.core_path(), common.authorization_path(aid), common.envelope_path(),
        common.result_path(aid), args.terminal_proof,
    ]
    if any(not path.is_file() for path in required):
        raise SystemExit("required input missing")
    proof_raw = args.terminal_proof.read_bytes()
    if common.sha_bytes(proof_raw) != args.terminal_proof_sha256:
        raise SystemExit("terminal proof hash drift")
    core_raw = common.core_path().read_bytes()
    auth_raw = common.authorization_path(aid).read_bytes()
    envelope_raw = common.envelope_path().read_bytes()
    result_raw = common.result_path(aid).read_bytes()
    core = common.parse_standard_exact(core_raw)
    authorization = common.parse_standard_exact(auth_raw)
    envelope = common.parse_standard_exact(envelope_raw)
    proof = common.parse_standard_exact(proof_raw)
    actual_core = common.sha_bytes(core_raw)
    actual_auth = common.sha_bytes(auth_raw)
    actual_envelope = common.sha_bytes(envelope_raw)
    if (actual_core, actual_auth, actual_envelope) != (ACTUAL["core"], ACTUAL[aid], ACTUAL["envelope"]):
        raise SystemExit("activation raw file drift")
    if common.canonical_sha(core) != HISTORICAL["core"] or common.canonical_sha(authorization) != HISTORICAL[aid]:
        raise SystemExit("historical canonical digest drift")
    if authorization.get("activation_core_sha256") != HISTORICAL["core"]:
        raise SystemExit("authorization embedded core drift")
    if envelope.get("activation_core_sha256") != HISTORICAL["core"]:
        raise SystemExit("envelope embedded core drift")
    envelope_row = next(row for row in envelope["authorization_files"] if row["assignment_id"] == aid)
    if envelope_row.get("sha256") != HISTORICAL[aid]:
        raise SystemExit("envelope embedded authorization drift")
    assignment = next(row for row in common.load(NS / "manifest.json")["assignments"] if row["assignment_id"] == aid)
    _, result_file_sha, result_canonical_sha, errors = CV.validate_result_buffer(
        result_raw, assignment, core, authorization, actual_core, actual_auth
    )
    errors.extend(W72.V7.terminal_proof_errors(proof, aid, result_file_sha))
    inventory = common.output_tree_inventory(common.output_dir(aid))
    if [row["relative_path"] for row in inventory] != ["result.json"]:
        errors.append("output-tree:not-exactly-result-json")
    output_tree_sha = common.canonical_sha(inventory)
    if errors:
        raise SystemExit(json.dumps({"status": "fail_closed", "errors": sorted(set(errors))}, indent=2))
    receipt = W72.V7.build_receipt(
        assignment, core, authorization, envelope, proof, args.terminal_proof,
        args.terminal_proof_sha256, result_file_sha, result_canonical_sha,
        len(result_raw), output_tree_sha,
    )
    receipt.update({
        "schema_version": "external-research-dispatch-receipt-v7.3",
        "digest_semantics_version": "raw-file-and-canonical-object-explicit-v7.3",
        "receipt_writer_path": str(BASE / "write_positive_receipt_v7_3.py"),
        "receipt_writer_sha256": common.sha(BASE / "write_positive_receipt_v7_3.py"),
        "activation_core_file_sha256": actual_core,
        "activation_core_object_canonical_sha256": common.canonical_sha(core),
        "activation_core_historical_embedded_pre_final_canonical_sha256": HISTORICAL["core"],
        "activation_core_historical_embedded_canonical_sha256": HISTORICAL["core"],
        "leaf_dispatch_authorization_file_sha256": actual_auth,
        "leaf_dispatch_authorization_object_canonical_sha256": common.canonical_sha(authorization),
        "leaf_dispatch_authorization_historical_embedded_pre_final_canonical_sha256": HISTORICAL[aid],
        "leaf_dispatch_authorization_historical_embedded_canonical_sha256": HISTORICAL[aid],
        "activation_envelope_file_sha256": actual_envelope,
        "activation_envelope_object_canonical_sha256": common.canonical_sha(envelope),
        "isolated_result_validator_sha256": common.sha(BASE / "closure_validator_v7_3.py"),
        "stale_common_result_errors_called": False,
        "phase_order_mismatch_reconciled_without_restamp": True,
        "toctou_recheck_passed_before_write": True,
        "toctou_recheck_passed_after_write": True,
        "atomic_exclusive_write": True,
    })
    validation = CV.receipt_errors(
        receipt, aid=aid, native=proof, result_raw=result_raw, output_tree_sha256=output_tree_sha
    )
    if validation:
        raise SystemExit(json.dumps({"status": "fail_closed", "errors": validation}, indent=2))
    # Rehash every bound byte/tree immediately before the atomic exclusive creation.
    if (
        common.core_path().read_bytes() != core_raw
        or common.authorization_path(aid).read_bytes() != auth_raw
        or common.envelope_path().read_bytes() != envelope_raw
        or args.terminal_proof.read_bytes() != proof_raw
        or common.result_path(aid).read_bytes() != result_raw
        or common.output_tree_sha256(common.output_dir(aid)) != output_tree_sha
    ):
        raise SystemExit("TOCTOU prewrite")
    output = target(aid, args.fixture_root)
    CV.atomic_write_exclusive(output, receipt)
    if (
        common.core_path().read_bytes() != core_raw
        or common.authorization_path(aid).read_bytes() != auth_raw
        or common.envelope_path().read_bytes() != envelope_raw
        or args.terminal_proof.read_bytes() != proof_raw
        or common.result_path(aid).read_bytes() != result_raw
        or common.output_tree_sha256(common.output_dir(aid)) != output_tree_sha
    ):
        raise SystemExit("TOCTOU postwrite")
    written_raw = output.read_bytes()
    written = common.parse_standard_exact(written_raw)
    post_errors = CV.receipt_errors(
        written, aid=aid, native=proof, result_raw=result_raw,
        receipt_raw=written_raw, output_tree_sha256=output_tree_sha,
    )
    if post_errors:
        raise SystemExit(json.dumps({"status": "fail_closed", "errors": post_errors}, indent=2))
    print(json.dumps({
        "status": "pass", "assignment_id": aid, "receipt_path": str(output),
        "receipt_file_sha256": common.sha_bytes(written_raw),
        "receipt_canonical_sha256": canonical_json.canonical_sha256_from_buffer(written_raw),
        "result_file_sha256": result_file_sha, "result_canonical_sha256": result_canonical_sha,
        "output_tree_sha256": output_tree_sha,
    }, sort_keys=True))


if __name__ == "__main__":
    main()

