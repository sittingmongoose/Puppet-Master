#!/usr/bin/env python3
"""Final pilot dialect adapter for explicit negative attestations and type aliases."""

from __future__ import annotations

import argparse
import copy
import json
from pathlib import Path
from typing import Any

from macro_v2_common import (
    AUDIT_ID, MACRO_ROOT, ROOT, load_jsonl, load_obj, result_file, selected_result_payload,
    sha, validate_result_bytes, write_obj,
)
from normalize_macro_results_v3 import normalize_payload as normalize_v3


def normalize_payload(
    raw_bytes: bytes,
    *,
    assignment: dict[str, Any],
    capsule: dict[str, Any],
    receipt: dict[str, Any],
) -> tuple[dict[str, Any] | None, list[str]]:
    try:
        raw = json.loads(raw_bytes)
    except Exception as exc:
        return None, [f"raw_json_parse:{type(exc).__name__}"]
    if not isinstance(raw, dict):
        return None, ["raw_not_object"]
    adapted = copy.deepcopy(raw)
    attest = adapted.get("self_attestation")
    if isinstance(attest, dict):
        for key, value in list(attest.items()):
            lower = key.lower()
            negative_assertion = value is False or (value is True and (lower.startswith("did_not_") or lower.startswith("no_")))
            if "prior" in lower and negative_assertion:
                attest.setdefault("prior_audits_read", False)
            if "peer" in lower and negative_assertion:
                attest.setdefault("peer_results_read", False)
            if "unrelated" in lower and negative_assertion:
                attest.setdefault("unrelated_sources_read", False)
            if ("external" in lower or "browse" in lower) and negative_assertion:
                attest.setdefault("external_research_performed", False)
            if "canonical" in lower and (
                (value is False and any(token in lower for token in ("edit", "modif", "wrote", "write")))
                or (value is True and any(token in lower for token in ("unchanged", "did_not", "no_")))
            ):
                attest.setdefault("canonical_plans_edited", False)
            if "terminal" in lower and "seal" in lower and negative_assertion:
                attest.setdefault("terminal_seal_written", False)
            if value is True and any(token in lower for token in ("used_only_assigned", "read_only_assigned_inputs_only", "read_only_assurance")):
                attest.setdefault("prior_audits_read", False)
                attest.setdefault("peer_results_read", False)
                attest.setdefault("unrelated_sources_read", False)
        if attest.get("peer_or_prior_audit_results_read") is False or attest.get("read_prior_audits_or_peer_results") is False:
            attest.setdefault("prior_audits_read", False)
            attest.setdefault("peer_results_read", False)

    items = adapted.get("items")
    aliases = {
        "route_contract": "contract", "state_contract": "state_transition",
        "compatibility_migration": "contract", "decision_record": "contract",
    }
    if isinstance(items, list):
        for item in items:
            if isinstance(item, dict):
                item["item_type"] = aliases.get(item.get("item_type"), item.get("item_type"))
    return normalize_v3(
        json.dumps(adapted, sort_keys=True).encode(), assignment=assignment, capsule=capsule, receipt=receipt
    )


def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument("--batch-id", required=True)
    parser.add_argument("--assignment-id", action="append", default=[])
    args = parser.parse_args()
    batch = MACRO_ROOT / "batches" / args.batch_id
    authority = load_obj(batch / "batch_authority.json")
    epoch = MACRO_ROOT / "frozen" / authority["epoch_id"]
    rows = load_jsonl(batch / "batch_manifest.jsonl")
    requested = set(args.assignment_id)
    if requested and not requested <= {row["assignment_id"] for row in rows}:
        raise RuntimeError("unknown normalization assignment")
    self_path = Path(__file__).resolve()
    report: list[dict[str, Any]] = []
    for assignment in rows:
        assignment_id = assignment["assignment_id"]
        if requested and assignment_id not in requested:
            continue
        output = ROOT / assignment["output_directory"]
        raw_path, file_errors = result_file(output)
        if raw_path is None:
            report.append({"assignment_id": assignment_id, "state": "not_ready", "errors": file_errors})
            continue
        _, existing_errors, existing_receipt = selected_result_payload(
            batch_id=args.batch_id, assignment=assignment, output_dir=output
        )
        if existing_receipt is not None:
            report.append({"assignment_id": assignment_id, "state": "already_normalized", "errors": existing_errors})
            continue
        dispatch_path = MACRO_ROOT / "dispatch" / args.batch_id / assignment_id / assignment["attempt_id"] / "dispatch_receipt.json"
        dispatch = load_obj(dispatch_path)
        capsule = load_obj(epoch / assignment["capsule_ref"])
        direct = validate_result_bytes(raw_path.read_bytes(), assignment=assignment, capsule=capsule, receipt=dispatch)
        if direct["state"] == "eligible":
            report.append({"assignment_id": assignment_id, "state": "already_canonical", "errors": []})
            continue
        normalized, errors = normalize_payload(
            raw_path.read_bytes(), assignment=assignment, capsule=capsule, receipt=dispatch
        )
        if normalized is None:
            report.append({"assignment_id": assignment_id, "state": "not_normalizable", "errors": errors})
            continue
        directory = MACRO_ROOT / "normalizations" / args.batch_id / assignment_id / assignment["attempt_id"]
        normalized_path = directory / "result.json"
        write_obj(normalized_path, normalized, immutable=True)
        normalization_receipt = {
            "audit_id": AUDIT_ID, "schema_version": "macro-normalization-receipt-v1",
            "batch_id": args.batch_id, "assignment_id": assignment_id, "attempt_id": assignment["attempt_id"],
            "status": "mechanically_normalized_zero_credit",
            "raw_result_ref": raw_path.relative_to(ROOT).as_posix(), "raw_result_sha256": sha(raw_path.read_bytes()),
            "normalized_result_ref": normalized_path.relative_to(ROOT).as_posix(),
            "normalized_result_sha256": sha(normalized_path.read_bytes()),
            "normalizer_ref": self_path.relative_to(ROOT).as_posix(), "normalizer_sha256": sha(self_path.read_bytes()),
            "dispatch_receipt_sha256": sha(dispatch_path.read_bytes()), "capsule_sha256": assignment["capsule_sha256"],
            "semantic_fields_added": False, "coverage_credit_before_dual_validation": 0,
        }
        write_obj(directory / "normalization_receipt.json", normalization_receipt, immutable=True)
        report.append({"assignment_id": assignment_id, "state": "normalized_zero_credit", "errors": []})
    counts: dict[str, int] = {}
    for row in report:
        counts[row["state"]] = counts.get(row["state"], 0) + 1
    print(json.dumps({"batch_id": args.batch_id, "counts": counts, "results": report}, indent=2, sort_keys=True))


if __name__ == "__main__":
    main()
