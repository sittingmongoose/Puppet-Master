#!/usr/bin/env python3
"""Dialect adapter feeding positive pilot evidence into the frozen v2 normalizer."""

from __future__ import annotations

import argparse
import copy
import json
from pathlib import Path
from typing import Any

from macro_v2_common import (
    AUDIT_ID,
    DIMENSIONS,
    MACRO_ROOT,
    ROOT,
    load_jsonl,
    load_obj,
    result_file,
    selected_result_payload,
    sha,
    validate_result_bytes,
    write_obj,
)
from normalize_macro_results_v2 import normalize_payload as normalize_v2


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
    binding = adapted.get("source_binding")
    if isinstance(binding, dict):
        binding.setdefault("document_path", assignment["document_path"])

    attest = adapted.get("self_attestation")
    if isinstance(attest, dict):
        for key, value in list(attest.items()):
            lower = key.lower()
            if "prior" in lower and value is False:
                attest.setdefault("prior_audits_read", False)
            if "peer" in lower and value is False:
                attest.setdefault("peer_results_read", False)
            if "unrelated" in lower and value is False:
                attest.setdefault("unrelated_sources_read", False)
            if "external" in lower and value is False:
                attest.setdefault("external_research_performed", False)
            if "canonical" in lower:
                if ("unchanged" in lower and value is True) or ("edited" in lower and value is False):
                    attest.setdefault("canonical_plans_edited", False)
            if "terminal_seal" in lower and value is False:
                attest.setdefault("terminal_seal_written", False)
            if "exact" in lower and "lens" in lower and value is True:
                attest.setdefault("used_exact_behavior_lens", True)
            if "adversarial" in lower and "lens" in lower and value is True:
                attest.setdefault("used_adversarial_negative_space_lens", True)
        allowlist_flags = {
            "read_only_assigned_capsule", "read_only_dispatch_intent", "read_only_result_schema",
            "read_only_single_source_excerpt",
        }
        if allowlist_flags <= {key for key, value in attest.items() if value is True}:
            attest.setdefault("prior_audits_read", False)
            attest.setdefault("peer_results_read", False)
            attest.setdefault("unrelated_sources_read", False)
        scope = attest.get("read_scope")
        if isinstance(scope, list) and scope and all(
            isinstance(value, str)
            and any(token in value.lower() for token in ("intent", "capsule", "excerpt", "schema"))
            for value in scope
        ):
            attest.setdefault("prior_audits_read", False)
            attest.setdefault("peer_results_read", False)
            attest.setdefault("unrelated_sources_read", False)

    coverage = adapted.get("coverage")
    if isinstance(coverage, dict):
        required = None
        for key, value in coverage.items():
            if "required_dimensions" in key and isinstance(value, list) and set(value) == set(DIMENSIONS):
                required = value
        if required is not None and isinstance(attest, dict):
            attest.setdefault("all_required_dimensions_reviewed", True)

    items = adapted.get("items")
    if isinstance(items, list):
        lenses = {str(item.get("lens", "")).lower() for item in items if isinstance(item, dict)}
        if isinstance(attest, dict):
            if "both" in lenses or "exact" in lenses:
                attest.setdefault("used_exact_behavior_lens", True)
            if "both" in lenses or "adversarial" in lenses or "negative_space" in lenses:
                attest.setdefault("used_adversarial_negative_space_lens", True)
        type_aliases = {
            "gui_contract": "gui_truth", "decision": "contract", "constraint": "contract",
            "compatibility_disposition": "contract", "validation": "acceptance_oracle",
            "identity_contract": "contract", "conflict": "gap", "ambiguity": "unknown",
            "compatibility": "contract", "requirement": "contract", "policy": "authority",
        }
        for item in items:
            if not isinstance(item, dict):
                continue
            item["item_type"] = type_aliases.get(item.get("item_type"), item.get("item_type"))
            if item.get("severity") == "informational":
                item["severity"] = "info"
            confidence = item.get("confidence")
            if isinstance(confidence, str):
                lower = confidence.lower()
                if lower.startswith("high"):
                    item["confidence"] = "high"
                elif lower in {"medium_high", "medium-high"}:
                    item["confidence"] = "high"
                elif lower.startswith("medium"):
                    item["confidence"] = "medium"
                elif lower.startswith("low"):
                    item["confidence"] = "low"
            dims = item.get("dimensions")
            if isinstance(dims, list):
                filtered = list(dict.fromkeys(value for value in dims if value in DIMENSIONS))
                if filtered:
                    item["dimensions"] = filtered

    segments = adapted.get("segments")
    if isinstance(segments, list) and isinstance(attest, dict):
        if any(
            isinstance(segment, dict)
            and any("exact" in key and "lens" in key and isinstance(value, str) and value.strip() for key, value in segment.items())
            for segment in segments
        ):
            attest.setdefault("used_exact_behavior_lens", True)
        if any(
            isinstance(segment, dict)
            and any("adversarial" in key and "lens" in key and isinstance(value, str) and value.strip() for key, value in segment.items())
            for segment in segments
        ):
            attest.setdefault("used_adversarial_negative_space_lens", True)
    return normalize_v2(
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
        receipt = {
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
        write_obj(directory / "normalization_receipt.json", receipt, immutable=True)
        report.append({"assignment_id": assignment_id, "state": "normalized_zero_credit", "errors": []})
    counts: dict[str, int] = {}
    for row in report:
        counts[row["state"]] = counts.get(row["state"], 0) + 1
    print(json.dumps({"batch_id": args.batch_id, "counts": counts, "results": report}, indent=2, sort_keys=True))


if __name__ == "__main__":
    main()
