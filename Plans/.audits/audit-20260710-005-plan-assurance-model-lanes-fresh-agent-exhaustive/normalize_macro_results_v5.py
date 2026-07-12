#!/usr/bin/env python3
"""Deterministically canonicalize evidence coordinates/quotes without changing audit claims."""

from __future__ import annotations

import argparse
import copy
import difflib
import json
import re
import unicodedata
from pathlib import Path
from typing import Any

from macro_v2_common import (
    AUDIT_ID,
    MACRO_ROOT,
    REPO,
    ROOT,
    load_jsonl,
    load_obj,
    result_file,
    selected_result_payload,
    sha,
    validate_result_bytes,
    write_obj,
)


EVIDENCE_ONLY_ERROR = re.compile(
    r"^item:\d+:evidence:\d+:(?:exact_quote_mismatch|outside_assigned_core|invalid_range)$"
)


def comparison_text(value: str) -> str:
    value = unicodedata.normalize("NFKC", value)
    value = value.replace("\r", " ")
    value = re.sub(r"(?m)^\s*(?:[-+*]|\d+[.)])\s+", "", value)
    value = re.sub(r"[*_`#>]", "", value)
    value = re.sub(r"\s+", " ", value).strip().casefold()
    return value


def candidate_spans(source_lines: list[str], ranges: list[tuple[int, int]]) -> list[tuple[int, int, str]]:
    spans: list[tuple[int, int, str]] = []
    for core_start, core_end in ranges:
        for start in range(core_start, core_end + 1):
            for end in range(start, min(core_end, start + 2) + 1):
                spans.append((start, end, "".join(source_lines[start - 1 : end]).rstrip("\n")))
    return spans


def locate_quote(
    quote: str,
    declared_start: Any,
    declared_end: Any,
    spans: list[tuple[int, int, str]],
) -> tuple[int, int, str] | None:
    if not isinstance(quote, str) or not quote.strip():
        return None
    normalized_quote = comparison_text(quote)
    if isinstance(declared_start, int) and isinstance(declared_end, int):
        local = [
            row for row in spans
            if row[0] == declared_start and row[1] == declared_end
        ]
        if len(local) == 1:
            normalized_candidate = comparison_text(local[0][2])
            ratio = difflib.SequenceMatcher(None, normalized_quote, normalized_candidate).ratio()
            containment = (
                normalized_quote in normalized_candidate
                and len(normalized_quote) >= 24
                and len(normalized_quote) / len(normalized_candidate) >= 0.65
            )
            if normalized_quote == normalized_candidate or containment or ratio >= 0.92:
                return local[0]
    exact = [row for row in spans if quote in row[2]]
    if len(exact) == 1:
        return exact[0]
    if exact:
        if isinstance(declared_start, int) and isinstance(declared_end, int):
            ranked = sorted(exact, key=lambda row: abs(row[0] - declared_start) + abs(row[1] - declared_end))
            if len(ranked) == 1 or (
                abs(ranked[0][0] - declared_start) + abs(ranked[0][1] - declared_end)
                < abs(ranked[1][0] - declared_start) + abs(ranked[1][1] - declared_end)
            ):
                return ranked[0]
        return None

    if len(normalized_quote) < 24:
        return None
    scored: list[tuple[float, int, int, str, int]] = []
    for start, end, candidate in spans:
        if not isinstance(declared_start, int) or abs(start - declared_start) > 2:
            continue
        normalized_candidate = comparison_text(candidate)
        if not normalized_candidate:
            continue
        ratio = difflib.SequenceMatcher(None, normalized_quote, normalized_candidate).ratio()
        containment = (
            normalized_quote in normalized_candidate
            and len(normalized_quote) / len(normalized_candidate) >= 0.65
        )
        score = 1.0 if normalized_quote == normalized_candidate else (0.97 if containment else ratio)
        if score < 0.92:
            continue
        distance = (
            abs(start - declared_start) + abs(end - declared_end)
            if isinstance(declared_start, int) and isinstance(declared_end, int)
            else 10**9
        )
        scored.append((score, start, end, candidate, distance))
    if not scored:
        return None
    scored.sort(key=lambda row: (-row[0], row[4], row[1], row[2]))
    best = scored[0]
    if len(scored) > 1:
        second = scored[1]
        if best[0] - second[0] < 0.03 and best[4] >= second[4]:
            return None
    return best[1], best[2], best[3]


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
    direct = validate_result_bytes(raw_bytes, assignment=assignment, capsule=capsule, receipt=receipt)
    direct_errors = direct.get("errors", [])
    if not direct_errors:
        return copy.deepcopy(raw), []
    if any(not EVIDENCE_ONLY_ERROR.fullmatch(error) for error in direct_errors):
        return None, [f"non_evidence_error:{error}" for error in direct_errors]

    source_lines = (REPO / assignment["document_path"]).read_text(encoding="utf-8").splitlines(keepends=True)
    ranges = [tuple(segment["core_range"]) for segment in capsule.get("segments", [])]
    spans = candidate_spans(source_lines, ranges)
    normalized = copy.deepcopy(raw)
    changes = 0
    for item_index, item in enumerate(normalized.get("items", [])):
        if not isinstance(item, dict):
            return None, [f"item_not_object:{item_index}"]
        retained_evidence: list[dict[str, Any]] = []
        unresolved: list[int] = []
        for evidence_index, entry in enumerate(item.get("evidence", [])):
            if not isinstance(entry, dict):
                return None, [f"evidence_not_object:{item_index}:{evidence_index}"]
            start, end, quote = entry.get("line_start"), entry.get("line_end"), entry.get("exact_quote")
            already_valid = False
            if isinstance(start, int) and isinstance(end, int) and start <= end:
                in_core = any(core_start <= start <= end <= core_end for core_start, core_end in ranges)
                if in_core and isinstance(quote, str):
                    already_valid = quote in "".join(source_lines[start - 1 : end])
            if already_valid:
                retained_evidence.append(entry)
                continue
            located = locate_quote(quote, start, end, spans)
            if located is None:
                unresolved.append(evidence_index)
                continue
            entry["line_start"], entry["line_end"], entry["exact_quote"] = located
            retained_evidence.append(entry)
            changes += 1
        if unresolved:
            if not retained_evidence:
                return None, [
                    f"evidence_not_uniquely_canonicalizable:{item_index}:{evidence_index}"
                    for evidence_index in unresolved
                ]
            item["evidence"] = retained_evidence
            changes += len(unresolved)
    if changes == 0:
        return None, ["no_evidence_change_made"]
    validation = validate_result_bytes(
        (json.dumps(normalized, indent=2, sort_keys=True) + "\n").encode(),
        assignment=assignment,
        capsule=capsule,
        receipt=receipt,
    )
    if validation["state"] != "eligible":
        return None, [f"post_normalization:{error}" for error in validation["errors"]]
    return normalized, []


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
        dispatch_path = (
            MACRO_ROOT / "dispatch" / args.batch_id / assignment_id / assignment["attempt_id"]
            / "dispatch_receipt.json"
        )
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
            "audit_id": AUDIT_ID,
            "schema_version": "macro-normalization-receipt-v1",
            "batch_id": args.batch_id,
            "assignment_id": assignment_id,
            "attempt_id": assignment["attempt_id"],
            "status": "mechanically_normalized_zero_credit",
            "raw_result_ref": raw_path.relative_to(ROOT).as_posix(),
            "raw_result_sha256": sha(raw_path.read_bytes()),
            "normalized_result_ref": normalized_path.relative_to(ROOT).as_posix(),
            "normalized_result_sha256": sha(normalized_path.read_bytes()),
            "normalizer_ref": self_path.relative_to(ROOT).as_posix(),
            "normalizer_sha256": sha(self_path.read_bytes()),
            "dispatch_receipt_sha256": sha(dispatch_path.read_bytes()),
            "capsule_sha256": assignment["capsule_sha256"],
            "semantic_fields_added": False,
            "coverage_credit_before_dual_validation": 0,
        }
        write_obj(directory / "normalization_receipt.json", normalization_receipt, immutable=True)
        report.append({"assignment_id": assignment_id, "state": "normalized_zero_credit", "errors": []})
    counts: dict[str, int] = {}
    for row in report:
        counts[row["state"]] = counts.get(row["state"], 0) + 1
    print(json.dumps({"batch_id": args.batch_id, "counts": counts, "results": report}, indent=2, sort_keys=True))


if __name__ == "__main__":
    main()
