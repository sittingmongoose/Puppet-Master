#!/usr/bin/env python3
"""Build and validate exhaustive, fail-closed packet-audit workbooks.

Packet content is consumed only through the custody manifest's <=220-line
slices.  The harness verifies continuous coverage and extracts stable audit
cases without treating source presence as implementation proof.
"""

from __future__ import annotations

import argparse
import datetime as dt
import hashlib
import json
import re
import sys
from pathlib import Path
from typing import Any, Iterable, Iterator

# Also support the existing importlib-based harness entry point.
if str(Path(__file__).resolve().parent) not in sys.path:
    sys.path.insert(0, str(Path(__file__).resolve().parent))
from pm_packet_audit_verdicts import validate_suite_case_verdicts
from pm_packet_audit_census import (
    CURRENT_SCHEMA, LEGACY_CASE_COUNT, build_census_contract,
    validate_manifest_census, validate_source_freeze,
)

ROOT = Path(__file__).resolve().parents[1]
SPEC_PATH = ROOT / "scripts" / "pm-integration-packet-audit.spec.json"
DEFAULT_OUT = ROOT / "scratchpad" / "approval-gated-packet-audit-20260831-001"
TOUCH_PATH = ROOT / "Plans" / "touch_closure.json"
COMPLETED_REPORT_NAME = "audit_report.completed.json"
EXPECTED_CASE_COUNT = LEGACY_CASE_COUNT  # Compatibility name for historical V1 harnesses only.
TERMINAL_CASE_STATUSES = {"pass", "partial", "fail", "blocked", "not_applicable"}
ALL_CASE_STATUSES = TERMINAL_CASE_STATUSES | {"not_run"}
TERMINAL_VERDICTS = {"pass", "fail", "blocked"}
ALL_VERDICTS = TERMINAL_VERDICTS | {"not_run"}
RESULT_KEYS = {
    "case_ref", "case_id", "source_identifier", "source_ref", "source_line",
    "suite", "applicability", "status", "evidence_refs", "findings",
    "residual_risk", "reviewer", "checked_at",
}
REPORT_KEYS = {
    "schema_id", "schema_version", "created_at", "manifest_sha256",
    "implementation_freeze_ref", "claim_boundary", "suite_verdicts", "case_results",
    "aggregate_verdict", "blockers", "unresolved_findings", "reviewers", "report_kind",
    "case_count",
}
PLACEHOLDER_REVIEWERS = {"unknown", "none", "n/a", "na", "tbd", "unassigned", "reviewer"}
PLACEHOLDER_EVIDENCE_PREFIXES = (
    "bulk:", "inferred:", "placeholder:", "same-as-above", "template:", "todo:", "tbd:",
)


class AuditError(RuntimeError):
    pass


def load_json(path: Path) -> Any:
    try:
        return json.loads(path.read_text(encoding="utf-8"))
    except (OSError, json.JSONDecodeError) as error:
        raise AuditError(f"cannot load JSON {path}: {error}") from error


def write_json(path: Path, value: Any) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)
    path.write_text(json.dumps(value, indent=2, sort_keys=True) + "\n", encoding="utf-8")


def sha256_bytes(value: bytes) -> str:
    return hashlib.sha256(value).hexdigest()


def sha256_file(path: Path) -> str:
    return sha256_bytes(path.read_bytes())


def sha256_values(values: Iterable[str]) -> str:
    material = "\n".join(sorted(values)).encode("utf-8")
    return sha256_bytes(material)


def utc_now() -> str:
    return dt.datetime.now(dt.timezone.utc).replace(microsecond=0).isoformat()


def is_nonempty_string(value: Any) -> bool:
    return isinstance(value, str) and bool(value.strip())


def is_timestamp(value: Any) -> bool:
    if not is_nonempty_string(value):
        return False
    normalized = value[:-1] + "+00:00" if value.endswith("Z") else value
    try:
        parsed = dt.datetime.fromisoformat(normalized)
    except ValueError:
        return False
    return parsed.tzinfo is not None and parsed.utcoffset() is not None


def is_reviewer(value: Any) -> bool:
    return is_nonempty_string(value) and value.strip().lower() not in PLACEHOLDER_REVIEWERS


def valid_source_line(value: Any) -> bool:
    return value is None or (
        isinstance(value, int) and not isinstance(value, bool) and value > 0
    )


def validate_string_list(value: Any, field: str, failures: list[str], *,
                         nonempty: bool = False) -> list[str]:
    if not isinstance(value, list) or any(not is_nonempty_string(item) for item in value):
        failures.append(f"{field} must be an array of non-empty strings")
        return []
    if nonempty and not value:
        failures.append(f"{field} must not be empty")
    return value


def is_placeholder_evidence(value: str) -> bool:
    normalized = value.strip().lower()
    return normalized in {"none", "n/a", "na", "tbd", "todo", "same as above"} or any(
        normalized.startswith(prefix) for prefix in PLACEHOLDER_EVIDENCE_PREFIXES
    )


def scalar_from_line(line: str, field: str) -> str | None:
    match = re.match(rf'^\s*"{re.escape(field)}"\s*:\s*("(?:[^"\\]|\\.)*")', line)
    if not match:
        return None
    try:
        value = json.loads(match.group(1))
    except json.JSONDecodeError:
        return None
    return value if isinstance(value, str) else None


class SliceCorpus:
    def __init__(self, custody_root: Path) -> None:
        self.root = custody_root
        coverage = load_json(custody_root / "slice_coverage.json")
        self.max_lines = coverage.get("max_lines_per_slice")
        self.overlap = coverage.get("overlap_lines")
        documents = coverage.get("documents")
        if not isinstance(documents, list):
            raise AuditError("slice_coverage.json documents must be an array")
        self.documents = {item["document_id"]: item for item in documents}

    def verify_all(self) -> dict[str, Any]:
        failures: list[str] = []
        slice_count = 0
        unique_line_count = 0
        for document_id in sorted(self.documents):
            document = self.documents[document_id]
            slices = document.get("slices", [])
            if not slices:
                failures.append(f"{document_id}: no slices")
                continue
            previous_end = 0
            emitted = 0
            for index, item in enumerate(slices):
                slice_count += 1
                start = item.get("start_line")
                end = item.get("end_line")
                count = item.get("line_count")
                if not all(isinstance(value, int) for value in (start, end, count)):
                    failures.append(f"{document_id}: non-integer slice range")
                    continue
                expected_start = 1 if index == 0 else previous_end - self.overlap + 1
                if start != expected_start:
                    failures.append(
                        f"{document_id}: discontinuous slice start {start}; expected {expected_start}"
                    )
                if count != end - start + 1 or count > self.max_lines:
                    failures.append(f"{document_id}: invalid slice line count at {start}-{end}")
                path = self.root / item["slice_relative_path"]
                if not path.is_file():
                    failures.append(f"{document_id}: missing slice {item['slice_relative_path']}")
                else:
                    data = path.read_bytes()
                    if sha256_bytes(data) != item.get("sha256"):
                        failures.append(f"{document_id}: slice hash mismatch {item['slice_relative_path']}")
                    physical_count = len(data.decode("utf-8").splitlines())
                    if physical_count != count:
                        failures.append(
                            f"{document_id}: physical line count {physical_count} != {count}"
                        )
                emitted += count if index == 0 else count - self.overlap
                previous_end = end
            if previous_end != document.get("source_line_count"):
                failures.append(f"{document_id}: final slice does not reach source EOF")
            if emitted != document.get("source_line_count"):
                failures.append(f"{document_id}: de-overlapped line count mismatch")
            unique_line_count += emitted
        return {
            "document_count": len(self.documents),
            "slice_count": slice_count,
            "unique_source_line_count": unique_line_count,
            "max_lines_per_slice": self.max_lines,
            "overlap_lines": self.overlap,
            "valid": not failures,
            "failures": failures,
        }

    def lines(self, document_id: str) -> Iterator[tuple[int, str]]:
        document = self.documents.get(document_id)
        if document is None:
            raise AuditError(f"unknown custody document_id: {document_id}")
        previous_end = 0
        for item in document["slices"]:
            path = self.root / item["slice_relative_path"]
            data = path.read_bytes()
            if sha256_bytes(data) != item["sha256"]:
                raise AuditError(f"slice hash mismatch while reading {path}")
            lines = data.decode("utf-8").splitlines()
            for line_number, line in enumerate(lines, start=item["start_line"]):
                if line_number > previous_end:
                    yield line_number, line
            previous_end = item["end_line"]

    def document_summary(self, document_id: str) -> dict[str, Any]:
        document = self.documents[document_id]
        return {
            "document_id": document_id,
            "logical_path": document["logical_path"],
            "source_line_count": document["source_line_count"],
            "source_sha256": document["source_sha256"],
            "slice_count": document["slice_count"],
        }


def line_case(group: dict[str, Any], corpus: SliceCorpus, line_number: int, text: str) -> dict[str, Any]:
    document = corpus.documents[group["document_id"]]
    return {
        "case_id": f"L{line_number:06d}",
        "source_identifier": f"line:{line_number}",
        "description": text.strip(),
        "source_ref": f"{document['logical_path']}:{line_number}",
        "source_line": line_number,
        "metadata": {},
    }


def extract_json_objects(group: dict[str, Any], corpus: SliceCorpus) -> list[dict[str, Any]]:
    identifier_field = group["identifier_field"]
    description_fields = group.get("description_fields", [])
    start_marker = group.get("start_marker")
    stop_marker = group.get("stop_marker")
    active = start_marker is None
    current: dict[str, Any] | None = None
    cases: list[dict[str, Any]] = []
    document = corpus.documents[group["document_id"]]

    def finish() -> None:
        nonlocal current
        if current is None:
            return
        descriptions = [current["metadata"].get(field) for field in description_fields]
        current["description"] = " | ".join(value for value in descriptions if value) or current["case_id"]
        cases.append(current)
        current = None

    for line_number, line in corpus.lines(group["document_id"]):
        if not active and start_marker and start_marker in line:
            active = True
            continue
        if active and stop_marker and stop_marker in line:
            finish()
            break
        if not active:
            continue
        identifier = scalar_from_line(line, identifier_field)
        if identifier is not None:
            finish()
            current = {
                "case_id": identifier,
                "source_identifier": identifier,
                "description": identifier,
                "source_ref": f"{document['logical_path']}:{line_number}",
                "source_line": line_number,
                "metadata": {},
            }
            continue
        if current is not None:
            for field in description_fields:
                if field not in current["metadata"]:
                    value = scalar_from_line(line, field)
                    if value is not None:
                        current["metadata"][field] = value
    finish()
    return cases


def extract_numbered(group: dict[str, Any], corpus: SliceCorpus) -> list[dict[str, Any]]:
    result = []
    for line_number, line in corpus.lines(group["document_id"]):
        match = re.match(r"^(\d+)\.\s+(.+)", line)
        if match:
            case = line_case(group, corpus, line_number, match.group(2))
            case["case_id"] = match.group(1)
            case["source_identifier"] = match.group(1)
            result.append(case)
    return result


def extract_markdown_table_ids(group: dict[str, Any], corpus: SliceCorpus) -> list[dict[str, Any]]:
    result = []
    document = corpus.documents[group["document_id"]]
    pattern = re.compile(r"^\|\s*([A-Z][A-Z0-9]+-[0-9]{3})\s*\|\s*([^|]+)")
    for line_number, line in corpus.lines(group["document_id"]):
        match = pattern.match(line)
        if match:
            result.append({
                "case_id": match.group(1),
                "source_identifier": match.group(1),
                "description": match.group(2).strip(),
                "source_ref": f"{document['logical_path']}:{line_number}",
                "source_line": line_number,
                "metadata": {},
            })
    return result


def extract_token_set(
    group: dict[str, Any], corpus: SliceCorpus, pattern: re.Pattern[str]
) -> list[dict[str, Any]]:
    first: dict[str, tuple[int, str]] = {}
    document = corpus.documents[group["document_id"]]
    for line_number, line in corpus.lines(group["document_id"]):
        for token in pattern.findall(line):
            first.setdefault(token, (line_number, line.strip()))
    return [{
        "case_id": token,
        "source_identifier": token,
        "description": source_text,
        "source_ref": f"{document['logical_path']}:{line_number}",
        "source_line": line_number,
        "metadata": {},
    } for token, (line_number, source_text) in sorted(first.items())]


def extract_markdown_obligations(group: dict[str, Any], corpus: SliceCorpus) -> list[dict[str, Any]]:
    result: list[dict[str, Any]] = []
    for line_number, line in corpus.lines(group["document_id"]):
        stripped = line.strip()
        text: str | None = None
        if re.match(r"^- \[[ xX]\]\s+", stripped):
            text = re.sub(r"^- \[[ xX]\]\s+", "", stripped)
        elif stripped.startswith("- "):
            text = stripped[2:].strip()
        elif re.match(r"^\d+\.\s+", stripped):
            text = re.sub(r"^\d+\.\s+", "", stripped)
        elif stripped.startswith("|") and stripped.endswith("|"):
            cells = [cell.strip() for cell in stripped.strip("|").split("|")]
            if cells and not all(re.fullmatch(r":?-+:?", cell or "-") for cell in cells):
                if not any(cell.lower() in {"id", "area", "topic", "requirement"} for cell in cells):
                    text = " | ".join(cells)
        if text:
            result.append(line_case(group, corpus, line_number, text))
    return result


def extract_json_leaf_lines(group: dict[str, Any], corpus: SliceCorpus) -> list[dict[str, Any]]:
    result = []
    for line_number, line in corpus.lines(group["document_id"]):
        stripped = line.strip().rstrip(",")
        if not stripped or stripped in {"{", "}", "[", "]", "}]", "}"}:
            continue
        scalar_property = re.match(r'^"[^"]+"\s*:\s*(?![\[{]).+', stripped)
        array_scalar = re.match(r'^"(?:[^"\\]|\\.)*"$', stripped)
        if scalar_property or array_scalar:
            result.append(line_case(group, corpus, line_number, stripped))
    return result


def extract_nonempty_prose(group: dict[str, Any], corpus: SliceCorpus) -> list[dict[str, Any]]:
    return [
        line_case(group, corpus, line_number, line)
        for line_number, line in corpus.lines(group["document_id"])
        if line.strip() and not line.lstrip().startswith("#")
    ]


def extract_benchmark_arms(group: dict[str, Any], corpus: SliceCorpus) -> list[dict[str, Any]]:
    result = []
    for line_number, line in corpus.lines(group["document_id"]):
        match = re.match(r"^([A-D])\.\s+(.+)", line)
        if match:
            case = line_case(group, corpus, line_number, match.group(2))
            case["case_id"] = match.group(1)
            case["source_identifier"] = match.group(1)
            result.append(case)
    return result


def extract_cases(group: dict[str, Any], corpus: SliceCorpus) -> list[dict[str, Any]]:
    extractor = group["extractor"]
    if extractor == "json_objects":
        return extract_json_objects(group, corpus)
    if extractor == "numbered_items":
        return extract_numbered(group, corpus)
    if extractor == "markdown_table_ids":
        return extract_markdown_table_ids(group, corpus)
    if extractor == "command_token_set":
        return extract_token_set(
            group, corpus, re.compile(r"(?<![A-Za-z0-9_])(cmd\.[a-z0-9_.]+)")
        )
    if extractor == "plan_ref_set":
        return extract_token_set(group, corpus, re.compile(r"Plans/[A-Za-z0-9_.-]+"))
    if extractor == "markdown_obligation":
        return extract_markdown_obligations(group, corpus)
    if extractor == "json_leaf_lines":
        return extract_json_leaf_lines(group, corpus)
    if extractor == "nonempty_prose":
        return extract_nonempty_prose(group, corpus)
    if extractor == "benchmark_arms":
        return extract_benchmark_arms(group, corpus)
    raise AuditError(f"unknown extractor: {extractor}")


def classify_case(group_id: str, case: dict[str, Any], spec: dict[str, Any]) -> str:
    identifier = case["source_identifier"]
    if identifier in spec.get("retired_bakeoff_cases", {}).get(group_id, []):
        return "retired_bakeoff_process_only"
    if identifier in spec.get("superseded_cases", {}).get(group_id, []):
        return "superseded"
    text = case["description"].lower()
    retired_phrases = (
        "do not choose a winner", "concept differentiation", "cloned layouts",
        "seven layouts are materially distinct", "concepts 05–11",
        "concepts 01–04", "per-concept blocker", "concepthub",
        "four-concept set collectively", "verify each concept individually",
        "another model folder", "assigned model folder",
    )
    if any(phrase in text for phrase in retired_phrases):
        return "retired_bakeoff_process_only"
    superseded_phrases = (
        "settings redesign remains unselected",
        "current settings style preserved; no final-redesign selection",
    )
    if any(phrase in text for phrase in superseded_phrases):
        return "superseded"
    if "variant" in text or "concept" in text:
        return "adapted_selected_implementation"
    return "retained"


def touch_cases(spec: dict[str, Any]) -> tuple[dict[str, Any], list[dict[str, Any]]]:
    registry = load_json(TOUCH_PATH)
    rows = registry.get("rows")
    columns = registry.get("row_columns")
    if rows is None:
        # Legacy v1 registries stored expanded objects under ``touches``.
        rows = registry.get("touches")
        columns = None
    if not isinstance(rows, list):
        raise AuditError("Plans/touch_closure.json rows/touches must be an array")
    if columns is not None:
        if not isinstance(columns, list) or not all(isinstance(column, str) for column in columns):
            raise AuditError("Plans/touch_closure.json row_columns must be a string array")
        if len(columns) != len(set(columns)):
            raise AuditError("Plans/touch_closure.json row_columns contains duplicates")
        if "touch_id" not in columns:
            raise AuditError("Plans/touch_closure.json row_columns is missing touch_id")
    dimensions = spec["touch_closure_dimensions"]
    if (not isinstance(dimensions, list) or not dimensions
            or any(not isinstance(value, str) or not value.strip() for value in dimensions)
            or len(set(dimensions)) != len(dimensions)):
        raise AuditError("Touch Closure dimensions must be nonempty unique strings")
    cases = []
    touch_ids: list[str] = []
    for row_index, raw_row in enumerate(rows):
        if columns is not None:
            if not isinstance(raw_row, list) or len(raw_row) != len(columns):
                raise AuditError(
                    f"Plans/touch_closure.json row {row_index} does not match row_columns"
                )
            row = dict(zip(columns, raw_row))
        else:
            if not isinstance(raw_row, dict):
                raise AuditError(f"Plans/touch_closure.json legacy touch {row_index} is not an object")
            row = raw_row
        touch_id = row.get("touch_id")
        if not isinstance(touch_id, str) or not touch_id.strip() or touch_id in touch_ids:
            raise AuditError("touch closure row has missing, empty, or duplicate touch_id")
        touch_ids.append(touch_id)
        for dimension in dimensions:
            cases.append({
                "case_id": f"{touch_id}/{dimension}",
                "source_identifier": touch_id,
                "description": f"{touch_id}: prove {dimension.replace('_', ' ')}",
                "source_ref": f"Plans/touch_closure.json#{touch_id}",
                "source_line": None,
                "metadata": {"dimension": dimension},
                "applicability": "retained",
            })
    return ({
        "path": "Plans/touch_closure.json",
        "sha256": sha256_file(TOUCH_PATH),
        "row_count": len(rows),
        "dimension_count": len(dimensions),
        "case_count": len(cases),
        "touch_ids": sorted(touch_ids),
        "dimensions": list(dimensions),
    }, cases)


def build_manifest() -> dict[str, Any]:
    spec = load_json(SPEC_PATH)
    custody_root = ROOT / spec["custody_root"]
    corpus = SliceCorpus(custody_root)
    coverage = corpus.verify_all()
    failures = list(coverage["failures"])
    groups = []
    all_refs: set[str] = set()
    for source_group in spec["source_groups"]:
        cases = extract_cases(source_group, corpus)
        for case in cases:
            case["applicability"] = classify_case(source_group["group_id"], case, spec)
        identifiers = [case["source_identifier"] for case in cases]
        if len(identifiers) != len(set(identifiers)):
            failures.append(f"{source_group['group_id']}: duplicate source identifiers")
        expected = source_group.get("expected_count")
        minimum = source_group.get("minimum_count")
        if expected is not None and len(cases) != expected:
            failures.append(
                f"{source_group['group_id']}: extracted {len(cases)} cases; expected {expected}"
            )
        if minimum is not None and len(cases) < minimum:
            failures.append(
                f"{source_group['group_id']}: extracted {len(cases)} cases; minimum {minimum}"
            )
        case_refs = [f"{source_group['group_id']}/{case['case_id']}" for case in cases]
        duplicates = all_refs.intersection(case_refs)
        if duplicates:
            failures.append(f"duplicate global case refs: {sorted(duplicates)[:5]}")
        all_refs.update(case_refs)
        groups.append({
            "group_id": source_group["group_id"],
            "suite": source_group["suite"],
            "extractor": source_group["extractor"],
            "expected_count": expected,
            "minimum_count": minimum,
            "actual_count": len(cases),
            "identifier_set_sha256": sha256_values(identifiers),
            "case_content_sha256": sha256_values(
                json.dumps(case, sort_keys=True, separators=(",", ":")) for case in cases
            ),
            "source": corpus.document_summary(source_group["document_id"]),
            "cases": cases,
        })
    touch_summary, touches = touch_cases(spec)
    groups.append({
        "group_id": "touch_closure_dimensions",
        "suite": "touch_closure",
        "extractor": "touch_closure_dimensions",
        "expected_count": touch_summary["case_count"],
        "minimum_count": None,
        "actual_count": len(touches),
        "identifier_set_sha256": sha256_values(case["case_id"] for case in touches),
        "case_content_sha256": sha256_values(
            json.dumps(case, sort_keys=True, separators=(",", ":")) for case in touches
        ),
        "source": touch_summary,
        "cases": touches,
    })
    suite_counts: dict[str, int] = {}
    applicability_counts: dict[str, int] = {}
    for group in groups:
        suite_counts[group["suite"]] = suite_counts.get(group["suite"], 0) + len(group["cases"])
        for case in group["cases"]:
            key = case["applicability"]
            applicability_counts[key] = applicability_counts.get(key, 0) + 1
    case_count = sum(len(group["cases"]) for group in groups)
    manifest = {
        "schema_id": CURRENT_SCHEMA,
        "schema_version": "2.0.0",
        "created_at": utc_now(),
        "spec_path": "scripts/pm-integration-packet-audit.spec.json",
        "spec_sha256": sha256_file(SPEC_PATH),
        "custody_root": spec["custody_root"],
        "source_coverage": coverage,
        "source_census_valid": not failures,
        "source_census_failures": failures,
        "implementation_verdict": "not_run",
        "claim_boundary": (
            "Verified source custody/census is not implementation, runtime, browser, native Slint, "
            "performance, accessibility, motion, readiness, or completion proof."
        ),
        "required_suite_verdicts": spec["required_suite_verdicts"],
        "suite_case_counts": suite_counts,
        "applicability_counts": applicability_counts,
        "group_count": len(groups),
        "case_count": case_count,
        "groups": groups,
        "census_contract": build_census_contract(groups, sha256_file(SPEC_PATH)),
    }
    failures.extend(validate_manifest_census(manifest))
    manifest["source_census_valid"] = not failures
    return manifest


def build_report_template(manifest: dict[str, Any]) -> dict[str, Any]:
    results = []
    for group in manifest["groups"]:
        for case in group["cases"]:
            applicability = case["applicability"]
            not_applicable = applicability in {"retired_bakeoff_process_only", "superseded"}
            results.append({
                "case_ref": f"{group['group_id']}/{case['case_id']}",
                "case_id": case["case_id"],
                "source_identifier": case["source_identifier"],
                "source_ref": case["source_ref"],
                "source_line": case["source_line"],
                "suite": group["suite"],
                "applicability": applicability,
                "status": "not_applicable" if not_applicable else "not_run",
                "evidence_refs": [
                    "user-approved-plan:retire-only-bakeoff-ranking-model-isolation"
                    if applicability == "retired_bakeoff_process_only"
                    else "user-approved-plan:newer-authority-and-k3-selection"
                ] if not_applicable else [],
                "findings": [],
                "residual_risk": (
                    "Substantive behavior remains covered by retained or adapted cases."
                    if not_applicable else "Implementation evidence has not been evaluated."
                ),
                "reviewer": "",
                "checked_at": "",
            })
    return {
        "schema_id": "pm.integration_packet_audit_report.v1",
        "schema_version": "1.0.0",
        "created_at": utc_now(),
        "manifest_sha256": "filled_after_manifest_write",
        "implementation_freeze_ref": "",
        "claim_boundary": (
            "Every pass requires exact admitted evidence. Static, concept, browser, native-runtime, "
            "visual, motion, performance, accessibility, and readiness claims remain separate."
        ),
        "suite_verdicts": {
            suite: {"verdict": "not_run", "evidence_refs": [], "residual_risk": "Audit not run."}
            for suite in manifest["required_suite_verdicts"]
        },
        "case_results": results,
        "aggregate_verdict": "not_run",
        "blockers": [],
        "unresolved_findings": [],
        "reviewers": [],
        "report_kind": "template",
        "case_count": manifest["case_count"],
    }


def build_reference_review(manifest: dict[str, Any]) -> dict[str, Any]:
    groups = {group["group_id"]: group for group in manifest["groups"]}
    passes = []
    for pass_id, group_ids, required_group_ids in (
        (
            "settings",
            [
                "settings_correction_readme", "settings_correction_decision_register",
                "settings_correction_goal", "settings_correction_manifest",
                "settings_correction_provider_policy", "settings_correction_checks",
            ],
            [
                "settings_correction_readme", "settings_correction_decision_register",
                "settings_correction_provider_policy", "settings_correction_checks",
            ],
        ),
        (
            "onboarding_doctor",
            [
                "onboarding_doctor_correction_readme",
                "onboarding_doctor_correction_decision_register",
                "onboarding_doctor_correction_goal", "onboarding_doctor_correction_manifest",
                "onboarding_doctor_correction_provider_policy",
                "onboarding_doctor_correction_checks",
            ],
            [
                "onboarding_doctor_correction_readme",
                "onboarding_doctor_correction_decision_register",
                "onboarding_doctor_correction_provider_policy",
                "onboarding_doctor_correction_checks",
            ],
        ),
    ):
        required_refs = [groups[group_id]["source"]["logical_path"] for group_id in required_group_ids]
        passes.append({
            "pass_id": pass_id,
            "implementation_review_status": "not_run",
            "source_documents_mechanically_censused": [groups[group_id]["source"] for group_id in group_ids],
            "required_correction_references": required_refs,
            "correction_references_opened_during_implementation_review": [],
            "prior_omissions": [],
            "affected_surfaces_or_states": [],
            "changes_made": [],
            "tests_rerun": [],
            "evidence_refs": [],
            "unresolved_owner_inputs": [],
            "material_effect": "not_evaluated",
            "reviewer": "",
            "checked_at": "",
        })
    return {
        "schema_id": "pm.reference_review_report.v1",
        "schema_version": "1.0.0",
        "created_at": utc_now(),
        "claim_boundary": (
            "Mechanical source census does not prove that correction references were reviewed "
            "against the frozen implementation."
        ),
        "correction_passes": passes,
        "overall_status": "not_run",
    }


def prepare(outdir: Path) -> dict[str, Any]:
    if outdir.exists():
        raise AuditError(f"refusing to overwrite retained evidence directory: {outdir}")
    manifest = build_manifest()
    outdir.mkdir(parents=True)
    manifest_path = outdir / "audit_manifest.json"
    write_json(manifest_path, manifest)
    report = build_report_template(manifest)
    report["manifest_sha256"] = sha256_file(manifest_path)
    write_json(outdir / "audit_report.template.json", report)
    write_json(outdir / "reference-review-report.json", build_reference_review(manifest))
    result = {
        "schema_id": "pm.integration_packet_audit_prepare_result.v1",
        "created_at": utc_now(),
        "source_census_valid": manifest["source_census_valid"],
        "implementation_verdict": "not_run",
        "manifest": manifest_path.relative_to(ROOT).as_posix(),
        "manifest_sha256": sha256_file(manifest_path),
        "case_count": manifest["case_count"],
        "group_count": manifest["group_count"],
        "suite_case_counts": manifest["suite_case_counts"],
        "source_census_failures": manifest["source_census_failures"],
    }
    write_json(outdir / "source_census_result.json", result)
    (outdir / "README.md").write_text(
        "# Approval-gated integration packet audit\n\n"
        "This subtree is retained evidence. `source_census_valid` verifies only custody, bounded "
        "slice continuity, identifier retention, and workbook shape. It does not claim that the "
        "implementation or any runtime/visual/motion/performance surface passes.\n\n"
        "After implementation evidence freezes, use `pm-integration-packet-audit-work.py` to "
        "prepare review chunks, collect case-by-case results, and merge them to "
        "`audit_report.completed.json`. Complete `reference-review-report.json`, then run:\n\n"
        "```sh\n"
        f"python3 scripts/pm-integration-packet-audit.py validate --dir {outdir.relative_to(ROOT)}\n"
        "```\n\n"
        "Never overwrite or delete this directory before explicit owner approval. Create a new "
        "timestamped output directory when the source or Touch Closure freeze changes.\n",
        encoding="utf-8",
    )
    return result


def validate_manifest_snapshot(manifest: Any) -> list[str]:
    failures: list[str] = []
    if not isinstance(manifest, dict):
        return ["audit manifest must be a JSON object"]
    if manifest.get("source_census_valid") is not True:
        failures.append("stored manifest source census is invalid")
    if manifest.get("source_census_failures") not in ([], None):
        failures.append("stored manifest retains source census failures")
    groups = manifest.get("groups")
    if not isinstance(groups, list):
        return failures + ["audit manifest groups must be an array"]
    seen_groups: set[str] = set()
    seen_refs: set[str] = set()
    suite_counts: dict[str, int] = {}
    applicability_counts: dict[str, int] = {}
    case_count = 0
    for group_index, group in enumerate(groups):
        if not isinstance(group, dict):
            failures.append(f"manifest group {group_index} must be an object")
            continue
        group_id, suite, cases = group.get("group_id"), group.get("suite"), group.get("cases")
        if not is_nonempty_string(group_id) or not is_nonempty_string(suite):
            failures.append(f"manifest group {group_index} has invalid group_id/suite")
            continue
        if group_id in seen_groups:
            failures.append(f"duplicate manifest group_id: {group_id}")
        seen_groups.add(group_id)
        if not isinstance(cases, list):
            failures.append(f"manifest group {group_id} cases must be an array")
            continue
        if group.get("actual_count") != len(cases):
            failures.append(f"manifest group {group_id} actual_count mismatch")
        identifiers: list[str] = []
        content_values: list[str] = []
        for case_index, case in enumerate(cases):
            case_count += 1
            if not isinstance(case, dict):
                failures.append(f"manifest group {group_id} case {case_index} must be an object")
                continue
            case_id = case.get("case_id")
            if not is_nonempty_string(case_id):
                failures.append(f"manifest group {group_id} case {case_index} has invalid case_id")
                continue
            ref = f"{group_id}/{case_id}"
            if ref in seen_refs:
                failures.append(f"duplicate manifest case_ref: {ref}")
            seen_refs.add(ref)
            source_identifier = case.get("source_identifier")
            if not is_nonempty_string(source_identifier):
                failures.append(f"{ref}: invalid source_identifier")
            else:
                identifiers.append(
                    case_id if group.get("extractor") == "touch_closure_dimensions"
                    else source_identifier
                )
            if not is_nonempty_string(case.get("source_ref")):
                failures.append(f"{ref}: invalid source_ref")
            if not valid_source_line(case.get("source_line")):
                failures.append(f"{ref}: invalid source_line")
            applicability = case.get("applicability")
            if not is_nonempty_string(applicability):
                failures.append(f"{ref}: invalid applicability")
            else:
                applicability_counts[applicability] = applicability_counts.get(applicability, 0) + 1
            content_values.append(json.dumps(case, sort_keys=True, separators=(",", ":")))
        if group.get("identifier_set_sha256") != sha256_values(identifiers):
            failures.append(f"manifest group {group_id} identifier_set_sha256 mismatch")
        if group.get("case_content_sha256") != sha256_values(content_values):
            failures.append(f"manifest group {group_id} case_content_sha256 mismatch")
        suite_counts[suite] = suite_counts.get(suite, 0) + len(cases)
    if manifest.get("group_count") != len(groups):
        failures.append("manifest group_count does not match groups array")
    if manifest.get("case_count") != case_count:
        failures.append("manifest case_count does not match groups")
    failures.extend(validate_manifest_census(manifest))
    if manifest.get("suite_case_counts") != suite_counts:
        failures.append("manifest suite_case_counts does not match cases")
    if manifest.get("applicability_counts") != applicability_counts:
        failures.append("manifest applicability_counts does not match cases")
    required = manifest.get("required_suite_verdicts")
    if (
        not isinstance(required, list)
        or any(not is_nonempty_string(suite) for suite in required)
        or len(required) != len(set(required))
    ):
        failures.append("manifest required_suite_verdicts must be unique non-empty strings")
    return failures


def validate_report(manifest: dict[str, Any], report: Any) -> list[str]:
    failures: list[str] = []
    expected_case_count = sum(len(group["cases"]) for group in manifest["groups"])
    if not isinstance(report, dict):
        return ["completed audit report must be a JSON object"]
    if set(report) != REPORT_KEYS:
        failures.append(f"completed audit report keys must be exactly {sorted(REPORT_KEYS)}")
    if report.get("schema_id") != "pm.integration_packet_audit_report.v1":
        failures.append("completed audit report schema_id mismatch")
    if report.get("schema_version") != "1.0.0":
        failures.append("completed audit report schema_version mismatch")
    if report.get("report_kind") != "completed":
        failures.append("report_kind must be completed; a template is not completion evidence")
    if report.get("case_count") != expected_case_count:
        failures.append(f"completed report case_count must be exactly {expected_case_count}")
    if not is_nonempty_string(report.get("implementation_freeze_ref")):
        failures.append("completed report implementation_freeze_ref must be non-empty")
    elif is_placeholder_evidence(report["implementation_freeze_ref"]):
        failures.append("completed report placeholder implementation_freeze_ref is rejected")
    if not is_timestamp(report.get("created_at")):
        failures.append("completed report created_at must be an ISO-8601 timestamp with timezone")
    expected: dict[str, tuple[str, dict[str, Any]]] = {}
    for group in manifest["groups"]:
        for case in group["cases"]:
            expected[f"{group['group_id']}/{case['case_id']}"] = (group["suite"], case)
    rows = report.get("case_results")
    if not isinstance(rows, list):
        return failures + ["audit report case_results must be an array"]
    if len(rows) != expected_case_count:
        failures.append(f"completed report must contain exactly {expected_case_count} case results")
    actual: dict[str, dict[str, Any]] = {}
    for position, row in enumerate(rows):
        if not isinstance(row, dict):
            failures.append(f"case_results[{position}] must be an object")
            continue
        if set(row) != RESULT_KEYS:
            failures.append(f"case_results[{position}] keys must be exactly {sorted(RESULT_KEYS)}")
        ref = row.get("case_ref")
        if not is_nonempty_string(ref):
            failures.append("case result missing case_ref")
            continue
        if ref in actual:
            failures.append(f"duplicate case result: {ref}")
        actual[ref] = row
    if set(actual) != set(expected):
        failures.append(
            f"case result set mismatch: missing={len(set(expected)-set(actual))} "
            f"extra={len(set(actual)-set(expected))}"
        )
    for ref, (suite, case) in expected.items():
        row = actual.get(ref)
        if row is None:
            continue
        applicability = case["applicability"]
        for field in ("case_id", "source_identifier", "source_ref", "source_line"):
            if row.get(field) != case.get(field):
                failures.append(f"{ref}: {field} drift")
        if row.get("suite") != suite or row.get("applicability") != applicability:
            failures.append(f"{ref}: suite/applicability drift")
        status = row.get("status")
        if status not in TERMINAL_CASE_STATUSES:
            failures.append(f"{ref}: invalid or non-terminal status {status!r}")
            continue
        evidence = validate_string_list(
            row.get("evidence_refs"), f"{ref}: evidence_refs", failures,
            nonempty=status in {"pass", "not_applicable"},
        )
        if any(is_placeholder_evidence(item) for item in evidence):
            failures.append(f"{ref}: placeholder/bulk/inferred evidence is rejected")
        findings = validate_string_list(row.get("findings"), f"{ref}: findings", failures)
        if status in {"partial", "fail", "blocked"} and not findings:
            failures.append(f"{ref}: {status} requires at least one named finding")
        if not is_nonempty_string(row.get("residual_risk")):
            failures.append(f"{ref}: residual_risk must be a non-empty string")
        if not is_reviewer(row.get("reviewer")):
            failures.append(f"{ref}: reviewer must be a non-placeholder identity")
        if not is_timestamp(row.get("checked_at")):
            failures.append(f"{ref}: checked_at must be an ISO-8601 timestamp with timezone")
        if status == "not_applicable":
            if applicability not in {"retired_bakeoff_process_only", "superseded"}:
                failures.append(f"{ref}: retained/adapted case cannot be not_applicable")
            if not evidence:
                failures.append(f"{ref}: not_applicable requires authority evidence")
    verdicts = report.get("suite_verdicts")
    if not isinstance(verdicts, dict):
        failures.append("suite_verdicts must be an object")
        verdicts = {}
    required_suites = set(manifest["required_suite_verdicts"])
    if set(verdicts) != required_suites:
        failures.append("suite_verdict keys do not match manifest required_suite_verdicts")
    failures.extend(validate_suite_case_verdicts(manifest, list(actual.values()), verdicts))
    for suite, item in verdicts.items():
        verdict = item.get("verdict") if isinstance(item, dict) else None
        if not isinstance(item, dict) or set(item) != {"verdict", "evidence_refs", "residual_risk"}:
            failures.append(f"suite {suite}: keys must be verdict, evidence_refs, residual_risk")
            continue
        if verdict not in TERMINAL_VERDICTS:
            failures.append(f"suite {suite}: invalid or non-terminal verdict {verdict!r}")
        suite_evidence = validate_string_list(
            item.get("evidence_refs"), f"suite {suite}: evidence_refs", failures,
            nonempty=verdict == "pass",
        )
        if any(is_placeholder_evidence(ref) for ref in suite_evidence):
            failures.append(f"suite {suite}: placeholder/bulk/inferred evidence is rejected")
        if not is_nonempty_string(item.get("residual_risk")):
            failures.append(f"suite {suite}: residual_risk must be non-empty")
        if verdict == "pass":
            if not item.get("evidence_refs"):
                failures.append(f"suite {suite}: pass requires aggregate evidence")
    aggregate = report.get("aggregate_verdict")
    if aggregate not in TERMINAL_VERDICTS:
        failures.append(f"invalid or non-terminal aggregate_verdict {aggregate!r}")
    blockers = validate_string_list(report.get("blockers"), "blockers", failures)
    unresolved = validate_string_list(
        report.get("unresolved_findings"), "unresolved_findings", failures
    )
    if aggregate == "pass":
        if any(
            not isinstance(item, dict) or item.get("verdict") != "pass"
            for item in verdicts.values()
        ):
            failures.append("aggregate pass requires every suite verdict to pass")
        if any(row.get("status") not in {"pass", "not_applicable"} for row in actual.values()):
            failures.append("aggregate pass conflicts with non-pass case results")
        if blockers or unresolved:
            failures.append("aggregate pass requires empty blockers and unresolved_findings")
    if aggregate == "blocked" and not blockers:
        failures.append("aggregate blocked requires at least one named blocker")
    if aggregate == "fail" and not (blockers or unresolved):
        failures.append("aggregate fail requires a named blocker or unresolved finding")
    reviewers = validate_string_list(report.get("reviewers"), "reviewers", failures, nonempty=True)
    if len(reviewers) != len(set(reviewers)):
        failures.append("reviewers must not contain duplicates")
    if any(not is_reviewer(reviewer) for reviewer in reviewers):
        failures.append("reviewers contains a placeholder identity")
    case_reviewers = {
        row.get("reviewer") for row in actual.values() if is_reviewer(row.get("reviewer"))
    }
    if set(reviewers) != case_reviewers:
        failures.append("reviewers must exactly equal the case reviewer set")
    return failures


def validate_reference_review(report: dict[str, Any]) -> list[str]:
    failures: list[str] = []
    if not isinstance(report, dict):
        return ["reference-review-report must be a JSON object"]
    passes = report.get("correction_passes")
    if (
        not isinstance(passes, list)
        or any(not isinstance(row, dict) for row in passes)
        or len(passes) != 2
        or {row.get("pass_id") for row in passes} != {"settings", "onboarding_doctor"}
    ):
        return ["reference-review-report must contain settings and onboarding_doctor passes"]
    for row in passes:
        status = row.get("implementation_review_status")
        if status not in {"complete", "blocked"}:
            failures.append(f"reference pass {row.get('pass_id')}: final review status must be complete or blocked")
        if len(row.get("required_correction_references", [])) != 4:
            failures.append(f"reference pass {row.get('pass_id')}: exactly four required references expected")
        if len(row.get("source_documents_mechanically_censused", [])) != 6:
            failures.append(f"reference pass {row.get('pass_id')}: six packet documents must be censused")
        if status == "complete":
            for field in (
                "correction_references_opened_during_implementation_review", "prior_omissions",
                "affected_surfaces_or_states", "changes_made", "tests_rerun", "evidence_refs",
            ):
                if not row.get(field):
                    failures.append(f"reference pass {row.get('pass_id')}: complete requires {field}")
            if not is_reviewer(row.get("reviewer")) or not is_timestamp(row.get("checked_at")):
                failures.append(
                    f"reference pass {row.get('pass_id')}: complete requires a reviewer identity "
                    "and timezone-aware checked_at"
                )
            required = set(row.get("required_correction_references", []))
            opened = set(row.get("correction_references_opened_during_implementation_review", []))
            if opened != required:
                failures.append(
                    f"reference pass {row.get('pass_id')}: opened reference set must exactly match required set"
                )
        if status == "blocked":
            if not row.get("unresolved_owner_inputs"):
                failures.append(
                    f"reference pass {row.get('pass_id')}: blocked requires unresolved_owner_inputs"
                )
            if not is_reviewer(row.get("reviewer")) or not is_timestamp(row.get("checked_at")):
                failures.append(
                    f"reference pass {row.get('pass_id')}: blocked requires reviewer and checked_at"
                )
            if not is_nonempty_string(row.get("material_effect")) or row.get("material_effect") == "not_evaluated":
                failures.append(
                    f"reference pass {row.get('pass_id')}: blocked requires a material_effect disposition"
                )
    statuses = {row.get("implementation_review_status") for row in passes}
    if statuses.issubset({"complete", "blocked"}):
        overall = report.get("overall_status")
        expected_overall = "blocked" if "blocked" in statuses else "complete"
        if overall != expected_overall:
            failures.append(
                f"reference-review-report overall_status must be {expected_overall!r} for its pass statuses"
            )
    return failures


def validate_directory(directory: Path) -> dict[str, Any]:
    manifest_path = directory / "audit_manifest.json"
    report_path = directory / COMPLETED_REPORT_NAME
    reference_path = directory / "reference-review-report.json"
    manifest = load_json(manifest_path)
    reference = load_json(reference_path)
    manifest_failures = validate_manifest_snapshot(manifest)
    failures = list(manifest_failures)
    report: dict[str, Any] = {}
    report_loaded = False
    if not report_path.is_file():
        failures.append(
            f"{COMPLETED_REPORT_NAME} is required for final validation; "
            "audit_report.template.json is not completion evidence"
        )
    elif report_path.is_symlink():
        failures.append(f"{COMPLETED_REPORT_NAME} must not be a symlink")
    else:
        loaded_report = load_json(report_path)
        if isinstance(loaded_report, dict):
            report = loaded_report
            report_loaded = True
        else:
            failures.append(f"{COMPLETED_REPORT_NAME} must be a JSON object")
    current = build_manifest()
    failures.extend(validate_source_freeze(manifest if isinstance(manifest, dict) else {}, current))
    if report_loaded:
        if report.get("manifest_sha256") != sha256_file(manifest_path):
            failures.append("completed audit report manifest_sha256 does not match audit_manifest.json")
        if not manifest_failures:
            failures.extend(validate_report(manifest, report))
    failures.extend(validate_reference_review(reference))
    return {
        "schema_id": "pm.integration_packet_audit_validation_result.v1",
        "validated_at": utc_now(),
        "structurally_valid": not failures,
        "implementation_verdict": report.get("aggregate_verdict", "not_run"),
        "failure_count": len(failures),
        "failures": failures,
        "case_count": manifest.get("case_count") if isinstance(manifest, dict) else None,
        "expected_case_count": current.get("case_count"),
        "completed_report": report_path.relative_to(ROOT).as_posix() if report_path.is_relative_to(ROOT) else str(report_path),
        "completed_report_present": report_path.is_file() and not report_path.is_symlink(),
        "source_census_valid": manifest.get("source_census_valid") if isinstance(manifest, dict) else False,
    }


def main() -> int:
    parser = argparse.ArgumentParser(description=__doc__)
    subparsers = parser.add_subparsers(dest="command", required=True)
    prepare_parser = subparsers.add_parser("prepare", help="create a new retained audit workbook")
    prepare_parser.add_argument("--outdir", type=Path, default=DEFAULT_OUT)
    subparsers.add_parser("census", help="inspect current source coverage without creating a review workbook")
    validate_parser = subparsers.add_parser("validate", help="validate census and a filled report")
    validate_parser.add_argument("--dir", type=Path, default=DEFAULT_OUT)
    validate_parser.add_argument(
        "--result-out", type=Path,
        help="optional new path for the validation receipt; an existing file is never overwritten",
    )
    args = parser.parse_args()
    try:
        if args.command == "census":
            manifest = build_manifest()
            contract = manifest["census_contract"]
            result = {
                "schema_id": "pm.integration_packet_audit_census_inspection.v1",
                "manifest_schema": manifest["schema_id"],
                "source_census_valid": manifest["source_census_valid"],
                "source_census_failures": manifest["source_census_failures"],
                "spec_sha256": manifest["spec_sha256"],
                "touch_source_sha256": contract["touch_source"]["sha256"],
                **{key: contract[key] for key in ("packet_case_count", "touch_row_count", "dimension_count", "touch_case_count", "total_case_count")},
                "packet_groups": contract["packet_groups"],
                "implementation_verdict": "not_run",
                "claim_boundary": "Read-only source census, not a review freeze, execution result, or implementation verdict.",
            }
            print(json.dumps(result, indent=2, sort_keys=True))
            return 0 if result["source_census_valid"] else 1
        if args.command == "prepare":
            outdir = args.outdir if args.outdir.is_absolute() else ROOT / args.outdir
            result = prepare(outdir)
            print(json.dumps(result, indent=2, sort_keys=True))
            return 0 if result["source_census_valid"] else 1
        directory = args.dir if args.dir.is_absolute() else ROOT / args.dir
        result = validate_directory(directory)
        if args.result_out is not None:
            result_out = args.result_out if args.result_out.is_absolute() else ROOT / args.result_out
            if result_out.exists():
                raise AuditError(f"refusing to overwrite retained validation receipt: {result_out}")
            write_json(result_out, result)
        print(json.dumps(result, indent=2, sort_keys=True))
        return 0 if result["structurally_valid"] else 1
    except AuditError as error:
        print(f"ERROR: {error}", file=sys.stderr)
        return 2


if __name__ == "__main__":
    raise SystemExit(main())
