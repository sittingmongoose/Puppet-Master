#!/usr/bin/env python3
"""Read-only deterministic checker for the 2026-08-13 successor preflight."""

from __future__ import annotations

import ast
import hashlib
import json
import sys
import zipfile
from pathlib import Path


OUTPUT_ROOT = Path(__file__).resolve().parent
REPO_ROOT = OUTPUT_ROOT.parents[2]
HISTORICAL_ROOT = OUTPUT_ROOT.parent
ZIP_PATH = Path("/home/sittingmongoose/.codex/attachments/e5971003-fd3c-4394-80e4-ffffac9cbfae/PM_Prompt_Complexity_Final_Course_Correction_2026-08-08.zip")
ALLOWED_IMPORTS = {"ast", "hashlib", "json", "sys", "zipfile", "pathlib", "__future__"}
REQUIRED_OUTPUTS = {
    "control_plane_defect-0001-successor-verifier-temp-write.md",
    "source_custody.json",
    "historical_artifact_disposition.json",
    "refreshed_surface_census.json",
    "process_contract.md",
    "test_design_questions.json",
    "deterministic_preflight_spec.json",
    "deterministic_preflight_report.json",
    "readiness_report.md",
    "deterministic_preflight.py",
}


def sha256_bytes(value: bytes) -> str:
    return hashlib.sha256(value).hexdigest()


def sha256_file(path: Path) -> str:
    return sha256_bytes(path.read_bytes())


def reject_constant(value: str) -> None:
    raise ValueError(f"nonfinite JSON constant: {value}")


def reject_duplicate_pairs(pairs: list[tuple[str, object]]) -> dict[str, object]:
    result: dict[str, object] = {}
    for key, value in pairs:
        if key in result:
            raise ValueError(f"duplicate JSON key: {key}")
        result[key] = value
    return result


def strict_loads(raw: str) -> object:
    return json.loads(
        raw,
        parse_constant=reject_constant,
        object_pairs_hook=reject_duplicate_pairs,
    )


def strict_load(path: Path) -> object:
    return strict_loads(path.read_text(encoding="utf-8"))


results: list[dict[str, object]] = []


def record(check_id: str, passed: bool, evidence: object) -> None:
    results.append({"check_id": check_id, "status": "pass" if passed else "fail", "evidence": evidence})


def main() -> int:
    source = strict_load(OUTPUT_ROOT / "source_custody.json")
    dispositions = strict_load(OUTPUT_ROOT / "historical_artifact_disposition.json")
    census = strict_load(OUTPUT_ROOT / "refreshed_surface_census.json")
    questions = strict_load(OUTPUT_ROOT / "test_design_questions.json")
    spec = strict_load(OUTPUT_ROOT / "deterministic_preflight_spec.json")
    report = strict_load(OUTPUT_ROOT / "deterministic_preflight_report.json")

    checker_tree = ast.parse(Path(__file__).read_text(encoding="utf-8"))
    imports: set[str] = set()
    for node in ast.walk(checker_tree):
        if isinstance(node, ast.Import):
            imports.update(alias.name.split(".")[0] for alias in node.names)
        elif isinstance(node, ast.ImportFrom) and node.module:
            imports.add(node.module.split(".")[0])
    record("DP-001", imports <= ALLOWED_IMPORTS, {"imports": sorted(imports), "allowlist": sorted(ALLOWED_IMPORTS)})

    json_names = {name for name in REQUIRED_OUTPUTS if name.endswith(".json")}
    strict_ok = True
    strict_errors: list[str] = []
    for name in sorted(json_names):
        try:
            strict_load(OUTPUT_ROOT / name)
        except Exception as exc:
            strict_ok = False
            strict_errors.append(f"{name}: {exc}")
    record("DP-002", strict_ok, {"files": sorted(json_names), "errors": strict_errors})

    binding_mismatches: list[dict[str, object]] = []
    for binding in source["hash_bindings"]:
        path = Path(binding["path"]) if binding["kind"] == "external_file" else REPO_ROOT / binding["path"]
        actual = sha256_file(path) if path.is_file() else None
        if actual != binding["sha256"]:
            binding_mismatches.append({"path": str(path), "expected": binding["sha256"], "actual": actual})
    record("DP-003", not binding_mismatches, {"bindings_checked": len(source["hash_bindings"]), "mismatches": binding_mismatches})

    archive = source["course_correction_archive"]
    expected_entries = {row["entry"]: row for row in archive["entry_hashes"]}
    zip_mismatches: list[object] = []
    with zipfile.ZipFile(ZIP_PATH) as handle:
        actual_names = set(handle.namelist())
        if actual_names != set(expected_entries):
            zip_mismatches.append({"entry_set_difference": sorted(actual_names ^ set(expected_entries))})
        for name, expected in expected_entries.items():
            raw = handle.read(name)
            if len(raw) != expected["bytes"] or sha256_bytes(raw) != expected["sha256"]:
                zip_mismatches.append({"entry": name, "bytes": len(raw), "sha256": sha256_bytes(raw)})
        manifest_name = next(name for name in actual_names if name.endswith("/PACKET_MANIFEST.json"))
        manifest = strict_loads(handle.read(manifest_name).decode("utf-8"))
        manifest_rows = manifest.get("files") or manifest.get("entries") or []
        manifest_ok = len(manifest_rows) == archive["manifest_row_count"]
    archive_flags_ok = (
        archive["archive_entry_count"] == len(expected_entries) == 26
        and archive["manifest_rows_verified"] == archive["manifest_row_count"] == 25
        and archive["manifest_self_entry_present"] is False
        and archive["provider_adjudication_entry_present"] is False
        and archive["provider_adjudication_supplied_separately"] is True
    )
    record("DP-004", not zip_mismatches and manifest_ok and archive_flags_ok, {"entries_checked": len(expected_entries), "manifest_rows": len(manifest_rows), "mismatches": zip_mismatches})

    expected_files = {row["path"]: row["sha256"] for row in dispositions["items"]}
    actual_paths = {
        path.relative_to(HISTORICAL_ROOT).as_posix(): path
        for path in HISTORICAL_ROOT.rglob("*")
        if path.is_file() and OUTPUT_ROOT not in path.parents
    }
    inherited_mismatches: list[object] = []
    if set(actual_paths) != set(expected_files):
        inherited_mismatches.append({"path_set_difference": sorted(set(actual_paths) ^ set(expected_files))})
    for rel, expected_hash in expected_files.items():
        path = actual_paths.get(rel)
        actual_hash = sha256_file(path) if path else None
        if actual_hash != expected_hash:
            inherited_mismatches.append({"path": rel, "expected": expected_hash, "actual": actual_hash})
    record("DP-005", len(expected_files) == 59 and not inherited_mismatches, {"classified_files": len(expected_files), "mismatches": inherited_mismatches})

    allowed = set(dispositions["allowed_dispositions"])
    recomputed_counts = {name: 0 for name in allowed}
    disposition_ok = len(expected_files) == len(dispositions["items"])
    for row in dispositions["items"]:
        disposition_ok = disposition_ok and row["disposition"] in allowed
        recomputed_counts[row["disposition"]] += 1
    declared_counts = dict(dispositions["counts"])
    disposition_ok = disposition_ok and declared_counts.get("total") == len(dispositions["items"])
    disposition_ok = disposition_ok and all(declared_counts.get(key) == value for key, value in recomputed_counts.items())
    record("DP-006", disposition_ok, {"declared": declared_counts, "recomputed": {"total": len(dispositions["items"]), **recomputed_counts}})

    baseline = strict_load(REPO_ROOT / census["baseline_inventory"]["path"])
    baseline_ids = {row["surface_id"] for row in baseline["rows"]}
    inherited_rows = [row for row in census["rows"] if row["source"] == "inherited_v2"]
    inherited_ids = {row["surface_id"] for row in inherited_rows}
    added_ids = {row["surface_id"] for row in census["rows"]} - inherited_ids
    class_counts: dict[str, int] = {}
    for row in census["rows"]:
        class_counts[row["current_testability_class"]] = class_counts.get(row["current_testability_class"], 0) + 1
    census_counts_ok = census["counts"]["total_rows"] == len(census["rows"]) == 56
    census_counts_ok = census_counts_ok and census["counts"]["inherited_rows_reopened"] == len(inherited_rows) == 54
    census_counts_ok = census_counts_ok and census["counts"]["new_rows_added"] == len(added_ids) == 2
    census_counts_ok = census_counts_ok and all(census["counts"].get(key) == value for key, value in class_counts.items())
    record("DP-007", baseline_ids == inherited_ids and added_ids == {"PROVIDER-001", "RUN-002"} and census_counts_ok, {"baseline_ids": len(baseline_ids), "inherited_ids": len(inherited_ids), "added_ids": sorted(added_ids), "class_counts": class_counts})

    boundaries = {row["boundary_id"]: row for row in census["direct_chat_boundaries"]}
    boundary_ok = set(boundaries) == {"CHAT-EX-001", "CHAT-EX-002"}
    boundary_ok = boundary_ok and boundaries["CHAT-EX-001"]["origin"] == "direct_assistant_chat"
    boundary_ok = boundary_ok and boundaries["CHAT-EX-002"]["origin"] == "chat_initiated_delegation"
    boundary_ok = boundary_ok and all(row.get("negative_rule") for row in boundaries.values())
    boundary_ok = boundary_ok and len(census["direct_chat_test_gaps"]) >= 4
    record("DP-008", boundary_ok, {"boundary_ids": sorted(boundaries), "gap_count": len(census["direct_chat_test_gaps"])})

    closeout = (HISTORICAL_ROOT / "reports/terminal_preflight_closeout-20260802.md").read_text(encoding="utf-8")
    zero_call_tokens = ["Status: `STOPPED_BEFORE_SUBJECT_LAUNCH`", "route canary: `0`", "pilot: `0`", "fleet: `0`", "total model/provider calls: `0`"]
    record("DP-009", all(token in closeout for token in zero_call_tokens), {"required_tokens_present": [token for token in zero_call_tokens if token in closeout]})

    defect = (HISTORICAL_ROOT / "charter/control_plane_defect-0004-v4-boundary-invalid.md").read_text(encoding="utf-8")
    scratch_paths = ["/tmp/apr_blocked_ids", "/tmp/apr_ig_ids", "/tmp/apr_all_ids", "/tmp/apr_dim_ids"]
    record("DP-010", "Status: `V4_PREFREEZE_INVALID`" in defect and all(path in defect for path in scratch_paths), {"status_preserved": "V4_PREFREEZE_INVALID" in defect, "scratch_paths_present": [path for path in scratch_paths if path in defect]})

    deterministic = strict_load(HISTORICAL_ROOT / "fixtures/deterministic_cases.v4.json")
    frozen = deterministic["frozen_counts"]
    deterministic_ok = frozen["main_fixtures"] == 67 and frozen["generated_subcases"] == 83 and frozen["scorer_checks"] == 72 and frozen["deterministic_checks_total"] == 222
    record("DP-011", deterministic_ok, {key: frozen[key] for key in ["main_fixtures", "generated_subcases", "scorer_checks", "deterministic_checks_total"]})

    semantic = strict_load(HISTORICAL_ROOT / "cases/semantic_cases.v4.json")
    semantic_cases = semantic["cases"]
    requirement_count = sum(len(case["packet"]["acceptance_group"]["requirements"]) for case in semantic_cases)
    claim_count = sum(len(case["packet"]["response_slots"]["claims"]) for case in semantic_cases)
    uncertainty_count = sum(len(case["packet"]["response_slots"]["uncertainties"]) for case in semantic_cases)
    schema_path = HISTORICAL_ROOT / semantic["response_schema_ref"]
    schema_hash = sha256_file(schema_path)
    render_group = next(group for group in deterministic["parameterized_fixture_groups"] if group["group_id"] == "PG-SUBJECT-RENDER-BOUNDARY-001")
    expected_schema_hash = render_group["response_contract_validation"]["schema_source_bytes_sha256"]
    semantic_ok = len(semantic_cases) == 7 and requirement_count == 33 and claim_count == 25 and uncertainty_count == 8 and schema_hash == expected_schema_hash
    record("DP-012", semantic_ok, {"cases": len(semantic_cases), "requirements": requirement_count, "claim_slots": claim_count, "uncertainty_slots": uncertainty_count, "schema_sha256": schema_hash})

    controller_text = (HISTORICAL_ROOT / "controller/controller.py").read_text(encoding="utf-8")
    v3_bound = all(token in controller_text for token in ["apr-method-v3.0.0", "semantic_cases.v3.json", "deterministic_cases.v3.json"])
    record("DP-013", v3_bound, {"controller_v3_bound": v3_bound, "v4_execution_attempted": False})

    duplicate_rejected = False
    nonfinite_rejected = False
    try:
        strict_loads('{"a":1,"a":2}')
    except ValueError:
        duplicate_rejected = True
    try:
        strict_loads('{"a":NaN}')
    except ValueError:
        nonfinite_rejected = True
    record("DP-014", duplicate_rejected and nonfinite_rejected, {"duplicate_key_rejected": duplicate_rejected, "nonfinite_number_rejected": nonfinite_rejected})

    precedence_group = next(group for group in deterministic["parameterized_fixture_groups"] if group["group_id"] == "PG-TERMINAL-PRECEDENCE-001")
    precedence = precedence_group["precedence"]
    order = {terminal: index for index, terminal in enumerate(precedence)}
    def reduce_terminals(values: list[str]) -> list[str]:
        return sorted(set(values), key=lambda terminal: order[terminal])
    terminal_samples = [precedence, list(reversed(precedence)), precedence[4:] + precedence[:4]]
    terminal_ok = all(reduce_terminals(sample) == precedence for sample in terminal_samples)
    record("DP-015", terminal_ok, {"precedence": precedence, "input_orders_tested": 3})

    capture = {"request_sha256": sha256_bytes(b"request"), "response_sha256": sha256_bytes(b"response"), "stdout_sha256": sha256_bytes(b"stdout"), "stderr_sha256": sha256_bytes(b"stderr"), "event_stream_sha256": sha256_bytes(b"events"), "exit_code": 0}
    def commitment(value: dict[str, object]) -> str:
        return sha256_bytes(json.dumps(value, sort_keys=True, separators=(",", ":"), allow_nan=False).encode("utf-8"))
    base_commitment = commitment(capture)
    mutation_changes: dict[str, bool] = {}
    for key in capture:
        mutated = dict(capture)
        mutated[key] = 1 if key == "exit_code" else sha256_bytes(f"mutated:{key}".encode("utf-8"))
        mutation_changes[key] = commitment(mutated) != base_commitment
    record("DP-016", all(mutation_changes.values()), {"synthetic_fields": sorted(capture), "all_one_field_mutations_detected": all(mutation_changes.values()), "filesystem_writes": 0})

    lineage_edges = ["ledger:evt-0028->custody", "plans:Prompt_Pipeline->surface:PP-001", "history:closeout->terminal:stopped"]
    def lineage_digest(edges: list[str]) -> str:
        return sha256_bytes(json.dumps(sorted(set(edges)), separators=(",", ":")).encode("utf-8"))
    lineage_base = lineage_digest(lineage_edges)
    lineage_reversed = lineage_digest(list(reversed(lineage_edges)))
    lineage_changed = lineage_digest(lineage_edges[:-1] + ["history:closeout->terminal:changed"])
    record("DP-017", lineage_base == lineage_reversed and lineage_base != lineage_changed, {"set_order_invariant": lineage_base == lineage_reversed, "edge_mutation_detected": lineage_base != lineage_changed})

    question_rows = questions["questions"]
    questions_ok = len(question_rows) > 0 and all(row["status"] == "requires_jared_decision" and row["answer"] is None and "selected_option" not in row for row in question_rows)
    record("DP-018", questions_ok, {"question_count": len(question_rows), "answered_count": sum(row["answer"] is not None for row in question_rows)})

    contract = (OUTPUT_ROOT / "process_contract.md").read_text(encoding="utf-8")
    contract_tokens = ["GPT-5.6 Sol at max reasoning, never ultra", "GPT-5.6 Sol medium", "GPT-5.6 Sol xhigh", str(OUTPUT_ROOT) + "/", "READY_FOR_JARED_TEST_PLAN", "NOT_READY", "Resumability", "no subject/provider call", "not empirical model success"]
    record("DP-019", all(token in contract for token in contract_tokens), {"required_tokens_present": [token for token in contract_tokens if token in contract]})

    actual_output_files = {path.name for path in OUTPUT_ROOT.iterdir() if path.is_file() or path.is_symlink()}
    boundary_issues: list[str] = []
    if actual_output_files != REQUIRED_OUTPUTS:
        boundary_issues.append(f"output file set difference: {sorted(actual_output_files ^ REQUIRED_OUTPUTS)}")
    for path in OUTPUT_ROOT.iterdir():
        if path.is_symlink():
            boundary_issues.append(f"symlink forbidden: {path.name}")
        try:
            path.resolve().relative_to(OUTPUT_ROOT)
        except ValueError:
            boundary_issues.append(f"resolved path escape: {path.name}")
    reported_boundary_status = report.get("write_boundary_observation", {}).get("status")
    boundary_passed = not boundary_issues and reported_boundary_status == "pass"
    record("DP-020", boundary_passed, {"files": sorted(actual_output_files), "issues": boundary_issues, "reported_boundary_status": reported_boundary_status, "defect_ref": report.get("write_boundary_observation", {}).get("defect_ref")})

    readiness = (OUTPUT_ROOT / "readiness_report.md").read_text(encoding="utf-8")
    report_limits = report.get("claim_boundary", {})
    limit_keys = ["empirical_model_success", "production_enforcement", "release_readiness", "safety_certification", "canonical_plans_compile_permission"]
    report_ok = report.get("terminal") == "NOT_READY"
    report_ok = report_ok and all(report_limits.get(key) is False for key in limit_keys)
    report_ok = report_ok and report.get("upstream_residuals", [{}])[0].get("observed_status") == "fail"
    report_ok = report_ok and "NOT_READY" in readiness and "Stop" in readiness and "failed" in readiness
    record("DP-021", report_ok, {"report_terminal": report.get("terminal"), "claim_limits_false": [key for key in limit_keys if report_limits.get(key) is False], "upstream_failure_preserved": report.get("upstream_residuals", [{}])[0].get("observed_status") == "fail"})

    failed = [row["check_id"] for row in results if row["status"] != "pass"]
    output = {
        "schema_id": "pm.prompt_complexity_successor.deterministic_preflight_run.v1",
        "spec_id": spec["spec_id"],
        "terminal": "READY_FOR_JARED_TEST_PLAN" if not failed else "NOT_READY",
        "subject_model_or_provider_calls": 0,
        "checks_total": len(results),
        "checks_passed": len(results) - len(failed),
        "checks_failed": len(failed),
        "failed_check_ids": failed,
        "results": results,
        "claim_boundary": "This run checks only deterministic custody and preflight-process properties; it is not empirical or production evidence."
    }
    print(json.dumps(output, sort_keys=True, separators=(",", ":"), allow_nan=False))
    return 0 if not failed else 1


if __name__ == "__main__":
    sys.exit(main())
