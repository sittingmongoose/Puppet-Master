#!/usr/bin/env python3
"""Build and verify the frozen storage-plan pre-WorkNode sandbox.

The canonical parser reads one full Plan document. Existing generated indexes are
comparison/registry inputs only; this script never writes under Plans/.
"""

from __future__ import annotations

import argparse
import hashlib
import importlib.util
import json
import math
import os
import shutil
import subprocess
import sys
import tempfile
from collections import Counter
from pathlib import Path
from typing import Any


HERE = Path(__file__).resolve().parent
REPO = HERE.parents[4]
MANIFEST_PATH = HERE / "source_manifest.json"
MATRIX_PATH = HERE / "matrix.json"
ORACLE_PATH = HERE / "oracle.json"
SCHEMA_PATH = HERE / "response.schema.json"
RUNTIME_PATH = HERE / "runtime_manifest.json"
HOST_OUTPUTS = HERE / "host_outputs"
PROMPTS = HERE / "prompts"
RESULT_PREFIX = "PM_RESULT "


class PipelineError(RuntimeError):
    pass


def _reject_constant(value: str) -> None:
    raise PipelineError(f"non-finite JSON constant: {value}")


def _finite_float(value: str) -> float:
    parsed = float(value)
    if not math.isfinite(parsed):
        raise PipelineError(f"non-finite JSON number: {value}")
    return parsed


def strict_loads(text: str) -> Any:
    def pairs(values: list[tuple[str, Any]]) -> dict[str, Any]:
        row: dict[str, Any] = {}
        for key, value in values:
            if key in row:
                raise PipelineError(f"duplicate JSON key: {key}")
            row[key] = value
        return row

    return json.loads(
        text,
        object_pairs_hook=pairs,
        parse_constant=_reject_constant,
        parse_float=_finite_float,
    )


def load_json(path: Path) -> Any:
    return strict_loads(path.read_text(encoding="utf-8"))


def load_jsonl(path: Path) -> list[Any]:
    return [strict_loads(line) for line in path.read_text(encoding="utf-8").splitlines() if line.strip()]


def canonical_json(value: Any) -> str:
    return json.dumps(value, sort_keys=True, ensure_ascii=False, separators=(",", ":"), allow_nan=False)


def pretty_json(value: Any) -> bytes:
    return (json.dumps(value, sort_keys=True, ensure_ascii=False, indent=2, allow_nan=False) + "\n").encode("utf-8")


def jsonl_bytes(rows: list[Any]) -> bytes:
    return ("\n".join(canonical_json(row) for row in rows) + "\n").encode("utf-8")


def strip_generated_timestamps(value: Any) -> Any:
    if isinstance(value, dict):
        return {
            key: strip_generated_timestamps(child)
            for key, child in value.items()
            if key != "generated_at_utc"
        }
    if isinstance(value, list):
        return [strip_generated_timestamps(child) for child in value]
    return value


def sha256_bytes(data: bytes) -> str:
    return hashlib.sha256(data).hexdigest()


def sha256_file(path: Path) -> str:
    digest = hashlib.sha256()
    with path.open("rb") as handle:
        for chunk in iter(lambda: handle.read(1024 * 1024), b""):
            digest.update(chunk)
    return digest.hexdigest()


def atomic_write(path: Path, data: bytes) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)
    temporary = path.with_name(path.name + ".tmp")
    with temporary.open("xb") as handle:
        handle.write(data)
        handle.flush()
        os.fsync(handle.fileno())
    os.replace(temporary, path)


def input_path(relative: str) -> Path:
    path = (REPO / relative).resolve()
    try:
        path.relative_to(REPO)
    except ValueError as exc:
        raise PipelineError(f"input escapes repository: {relative}") from exc
    return path


def preflight_inputs() -> dict[str, Any]:
    manifest = load_json(MANIFEST_PATH)
    source = manifest["source"]
    records = [source, *manifest["frozen_inputs"]]
    checked = []
    for record in records:
        path = input_path(record["path"])
        if not path.is_file() or path.is_symlink():
            raise PipelineError(f"frozen input absent or unsafe: {record['path']}")
        raw = path.read_bytes()
        actual = {"path": record["path"], "bytes": len(raw), "sha256": sha256_bytes(raw)}
        if actual["bytes"] != record.get("bytes", record.get("utf8_bytes")):
            raise PipelineError(f"frozen input byte drift: {record['path']}")
        if actual["sha256"] != record["sha256"]:
            raise PipelineError(f"frozen input hash drift: {record['path']}")
        checked.append(actual)
    source_text = input_path(source["path"]).read_text(encoding="utf-8")
    if len(source_text.splitlines()) != source["line_count"]:
        raise PipelineError("source line-count drift")
    return {"status": "PASS", "checked": checked}


def omp_runtime_preflight() -> dict[str, Any]:
    runtime = load_json(RUNTIME_PATH)["omp"]
    binary = Path(runtime["binary"])
    if not binary.is_file() or binary.is_symlink():
        raise PipelineError("OMP binary absent or unsafe")
    if binary.stat().st_size != runtime["binary_bytes"] or sha256_file(binary) != runtime["binary_sha256"]:
        raise PipelineError("OMP binary identity drift")
    environment = dict(os.environ)
    environment["PI_CODING_AGENT_DIR"] = runtime["profile_dir"]
    version = subprocess.run(
        [str(binary), "--version"],
        check=True,
        capture_output=True,
        text=True,
        env=environment,
        timeout=30,
    ).stdout.strip()
    if version != runtime["version"]:
        raise PipelineError("OMP version drift")
    observed: dict[str, Any] = {}
    for key, expected in runtime["effective_config"].items():
        raw = subprocess.run(
            [str(binary), "config", "get", key],
            check=True,
            capture_output=True,
            text=True,
            env=environment,
            timeout=30,
        ).stdout.strip()
        if raw in {"true", "false"} or raw.startswith(("{", "[", '"')):
            value = strict_loads(raw)
        else:
            value = raw
        if value != expected:
            raise PipelineError(f"OMP effective config drift: {key}")
        observed[key] = value
    return {"status": "PASS_OMP_RUNTIME", "version": version, "effective_config": observed, "subject_calls": 0}


def load_canonical_module() -> Any:
    script = input_path("scripts/pm-plan-index.py")
    name = f"pm_r10_storage_pipeline_{os.getpid()}"
    spec = importlib.util.spec_from_file_location(name, script)
    if spec is None or spec.loader is None:
        raise PipelineError("canonical parser import spec unavailable")
    module = importlib.util.module_from_spec(spec)
    sys.modules[name] = module
    spec.loader.exec_module(module)
    return module


def extract_one_plan() -> tuple[Any, list[dict[str, Any]], list[dict[str, Any]], list[dict[str, Any]]]:
    module = load_canonical_module()
    source = input_path(load_json(MANIFEST_PATH)["source"]["path"])
    with tempfile.TemporaryDirectory(prefix="pm-r10-storage-plan-") as temporary:
        root = Path(temporary)
        plans = root / "Plans"
        plans.mkdir()
        shutil.copyfile(source, plans / "storage-plan.md")
        module.ROOT = root
        module.PLANS = plans
        module.INDEX_DIR = plans / ".plan_index"
        module.MIGRATION_RUN = plans / ".plan_migration/pds-20260611-002-atomize-planunits"
        module.PNC019_CERTIFICATION_RECEIPT_PATH = plans / ".implementation_readiness/pnc019_certification_receipt.json"
        units, parse_errors, docs = module.extract_plan_units()
        units = sorted(units, key=module.unit_id)
        return module, units, parse_errors, docs


def stable_row_hash(rows: list[Any]) -> str:
    return sha256_bytes(jsonl_bytes(rows))


def derive() -> dict[str, bytes]:
    preflight_inputs()
    manifest = load_json(MANIFEST_PATH)
    denominator = manifest["comparison_denominator"]
    module, units, parse_errors, docs = extract_one_plan()
    if len(docs) != 1 or docs[0]["path"] != manifest["source"]["path"]:
        raise PipelineError("one-document extraction boundary")

    issues = module.collect_validation_issues(units, parse_errors, docs)
    local_graph = module.dependency_graph(units)
    accepts = module.acceptance_units(units)
    cards = strip_generated_timestamps(module.doc_cards(units, docs))

    global_units = load_jsonl(input_path("Plans/.plan_index/plan_units.jsonl"))
    global_ids = {str(row["plan_unit_id"]) for row in global_units}
    canonical_units = [
        row for row in global_units if row.get("source_location", {}).get("path") == manifest["source"]["path"]
    ]
    canonical_units.sort(key=lambda row: str(row["plan_unit_id"]))
    storage_ids = {str(row["plan_unit_id"]) for row in units}

    global_accepts = load_jsonl(input_path("Plans/.plan_index/acceptance_units.jsonl"))
    canonical_accepts = [row for row in global_accepts if str(row.get("plan_unit_id")) in storage_ids]
    canonical_accepts.sort(key=lambda row: str(row["acceptance_unit_id"]))

    if units != canonical_units:
        raise PipelineError("canonical PlanUnit comparison mismatch")
    if accepts != canonical_accepts:
        raise PipelineError("canonical acceptance-unit comparison mismatch")

    ids_text = "\n".join(row["plan_unit_id"] for row in units) + "\n"
    if sha256_bytes(ids_text.encode("utf-8")) != denominator["ordered_plan_unit_ids_sha256"]:
        raise PipelineError("ordered PlanUnit identity mismatch")

    edge_classes: Counter[str] = Counter()
    missing_targets: list[dict[str, str]] = []
    classified_edges: list[dict[str, str]] = []
    for row in units:
        source_id = str(row["plan_unit_id"])
        for field in ("depends_on", "unblocks"):
            values = row.get(field, [])
            if not isinstance(values, list):
                values = [values]
            for target in map(str, values):
                scope = "internal" if target in storage_ids else "external_known" if target in global_ids else "missing"
                edge_classes[f"{field}_{scope}"] += 1
                classified_edges.append({"edge_type": field, "from": source_id, "to": target, "target_scope": scope})
                if scope == "missing":
                    missing_targets.append({"edge_type": field, "from": source_id, "to": target})
    classified_edges.sort(key=lambda row: (row["edge_type"], row["from"], row["to"]))

    stored_graph = load_json(input_path("Plans/.plan_index/dependencies.json"))
    stored_storage_edges = [row for row in stored_graph["edges"] if str(row["from"]) in storage_ids]
    expected_plain_edges = [{key: row[key] for key in ("edge_type", "from", "to")} for row in classified_edges]
    expected_plain_edges.sort(key=lambda row: (row["edge_type"], row["from"], row["to"]))
    stored_storage_edges.sort(key=lambda row: (row["edge_type"], row["from"], row["to"]))
    if expected_plain_edges != stored_storage_edges:
        raise PipelineError("canonical dependency-edge comparison mismatch")

    # Re-execute the canonical pre-WorkNode runtime/currentness gate from the
    # frozen global index inputs. This does not reparse other Plan documents.
    stored_coverage = load_json(input_path("Plans/.plan_index/coverage_report.json"))
    stored_readiness = load_json(input_path("Plans/.plan_index/node_readiness_report.json"))
    module.ROOT = REPO
    module.PLANS = REPO / "Plans"
    module.INDEX_DIR = module.PLANS / ".plan_index"
    module.MIGRATION_RUN = module.PLANS / ".plan_migration/pds-20260611-002-atomize-planunits"
    module.PNC019_CERTIFICATION_RECEIPT_PATH = module.PLANS / ".implementation_readiness/pnc019_certification_receipt.json"
    expected_readiness = module.node_readiness_report(global_units, stored_coverage, stored_graph)
    actual_readiness_stable_sha = module.stable_payload_hash(stored_readiness)
    expected_readiness_stable_sha = module.stable_payload_hash(expected_readiness)
    baseline = manifest["preexisting_global_baseline"]
    if actual_readiness_stable_sha != baseline["actual_stable_sha256"]:
        raise PipelineError("canonical stored node-readiness stable hash drift")
    if expected_readiness_stable_sha != baseline["expected_stable_sha256"]:
        raise PipelineError("canonical recomputed node-readiness stable hash drift")
    runtime_status = expected_readiness.get("runtime_enablement_status", {})
    if expected_readiness.get("status") != baseline["node_readiness_status"]:
        raise PipelineError("canonical recomputed node-readiness status drift")
    if runtime_status.get("status") != baseline["node_readiness_status"]:
        raise PipelineError("canonical runtime-currentness status drift")
    if runtime_status.get("runtime_blocked_by_ref") != baseline["runtime_blocker_ref"]:
        raise PipelineError("canonical runtime blocker drift")

    migration_validation = load_json(
        input_path("Plans/.plan_migration/pds-20260611-002-atomize-planunits/validation_report.json")
    )
    migration_rows = [
        row
        for row in load_jsonl(
            input_path("Plans/.plan_migration/pds-20260611-002-atomize-planunits/coverage_map.jsonl")
        )
        if row.get("source_path") == manifest["source"]["path"]
    ]

    counts = {
        "plan_unit_count": len(units),
        "acceptance_unit_count": len(accepts),
        "gui_related_true_count": sum(row.get("gui_related") is True for row in units),
        "gui_related_false_count": sum(row.get("gui_related") is False for row in units),
        "reasoning_tier_high_count": sum(row.get("reasoning_tier") == "high" for row in units),
        "reasoning_tier_standard_count": sum(row.get("reasoning_tier") == "standard" for row in units),
        "migration_span_count": len(migration_rows),
        "dependency_edge_count": len(classified_edges),
        "depends_on_edge_count": sum(row["edge_type"] == "depends_on" for row in classified_edges),
        "unblocks_edge_count": sum(row["edge_type"] == "unblocks" for row in classified_edges),
        "internal_target_count": sum(row["target_scope"] == "internal" for row in classified_edges),
        "external_known_target_count": sum(row["target_scope"] == "external_known" for row in classified_edges),
        "missing_target_count": len(missing_targets),
    }
    for key, value in counts.items():
        if denominator[key] != value:
            raise PipelineError(f"comparison denominator mismatch: {key}")

    issue_counts = {
        key: len(value) for key, value in issues.items() if isinstance(value, list)
    }
    structural_pass = all(value == 0 for value in issue_counts.values())
    migration_pass = migration_validation.get("status") == "pass" and not migration_validation.get("failures") and len(migration_rows) == denominator["migration_span_count"]
    registry_pass = not missing_targets and stored_graph.get("summary", {}).get("unresolved_reference_count") == 0
    graph_pass = (
        local_graph.get("summary", {}).get("true_cycle_component_count") == 0
        and stored_graph.get("summary", {}).get("true_cycle_component_count") == 0
        and stored_graph.get("summary", {}).get("build_order_available") is True
    )
    if not (structural_pass and migration_pass and registry_pass and graph_pass):
        raise PipelineError("structural pipeline did not pass")

    comparison = {
        "schema_id": "pm.r10.storage_pipeline.comparison_report.v1",
        "status": "pass",
        "source_match": docs[0]["sha256"] == manifest["source"]["sha256"],
        "plan_units_exact_match": True,
        "acceptance_units_exact_match": True,
        "dependency_edges_exact_match": True,
        "counts": counts,
        "plan_units_canonical_jsonl_sha256": stable_row_hash(units),
        "acceptance_units_canonical_jsonl_sha256": stable_row_hash(accepts),
        "ordered_plan_unit_ids_sha256": denominator["ordered_plan_unit_ids_sha256"],
    }
    dependencies = {
        "schema_id": "pm.r10.storage_pipeline.scoped_dependencies.v1",
        "status": "resolved",
        "summary": {
            **counts,
            "internal_true_cycle_component_count": local_graph["summary"]["true_cycle_component_count"],
            "global_true_cycle_component_count": stored_graph["summary"]["true_cycle_component_count"],
            "global_build_order_available": stored_graph["summary"]["build_order_available"],
        },
        "class_counts": dict(sorted(edge_classes.items())),
        "missing_targets": missing_targets,
        "edges": classified_edges,
    }
    coverage = {
        "schema_id": "pm.r10.storage_pipeline.coverage_report.v1",
        "status": "pass",
        "source_scope": manifest["source"],
        "issue_counts": issue_counts,
        "migration_validation_status": migration_validation["status"],
        "migration_span_count": len(migration_rows),
        "canonical_comparison_status": comparison["status"],
        "dependency_registry_status": dependencies["status"],
        "notes": [
            "All source bytes were processed by the canonical PlanUnit parser.",
            "External plans were not reprocessed; dependency targets were resolved against the frozen existing PlanUnit registry.",
            "No WorkNodes, NodeSeeds, executable queues, or final node manifests were created.",
        ],
    }
    readiness = {
        "schema_id": "pm.r10.storage_pipeline.node_readiness_report.v1",
        "status": "blocked",
        "structural_pipeline_status": "pass",
        "canonical_global_validation_status": baseline["validation_status"],
        "canonical_currentness_function_executed": True,
        "stored_node_readiness_stable_sha256": actual_readiness_stable_sha,
        "recomputed_node_readiness_stable_sha256": expected_readiness_stable_sha,
        "blocker_codes": [
            "canonical_node_readiness_artifact_stale",
            "pnc019_runtime_certification_incomplete",
        ],
        "runtime_blocker_ref": baseline["runtime_blocker_ref"],
        "no_worknodes_created": True,
        "no_executable_build_tasks_created": True,
        "no_final_node_queues_created": True,
        "nodeseed_candidates_created": False,
        "next_action": "Stop before WorkNode creation; repair and independently validate canonical node-readiness currentness and PNC-019 executable runtime certification in their owner-governed lanes.",
    }
    pipeline_report = {
        "schema_id": "pm.r10.storage_pipeline.host_report.v1",
        "status": "PASS_STRUCTURAL_BLOCKED_PREWORKNODE",
        "source": manifest["source"],
        "counts": counts,
        "structural_checks": {
            "canonical_parser": "pass",
            "metadata": "pass",
            "acceptance_generation": "pass",
            "dependency_registry": "pass",
            "migration_coverage": "pass",
            "canonical_comparison": "pass",
            "canonical_currentness_execution": "pass_to_expected_blocked_state",
        },
        "pre_worknode_disposition": readiness["status"],
        "blocker_codes": readiness["blocker_codes"],
        "no_worknodes_created": True,
        "qualification_credit": 0,
    }
    capsule = {
        "schema_id": "pm.prompt_capsule.storage_pipeline_gate.v1",
        "work_unit_id": "storage_plan_preworknode_gate",
        "objective": "Audit the deterministic full-document receipts and report the only authorized pre-WorkNode disposition.",
        "sources": [
            {
                "source_id": "storage_source_receipt",
                "facts": manifest["source"],
            },
            {
                "source_id": "extraction_receipt",
                "facts": {
                    "canonical_parser": "scripts/pm-plan-index.py",
                    "plan_unit_count": counts["plan_unit_count"],
                    "acceptance_unit_count": counts["acceptance_unit_count"],
                    "parse_errors": issue_counts["parse_errors"],
                    "duplicate_plan_unit_ids": issue_counts["duplicate_plan_unit_ids"],
                    "missing_required_metadata": issue_counts["missing_required_metadata"],
                    "missing_gui_related_boolean": issue_counts["missing_gui_related_boolean"],
                    "gui_related_true_count": counts["gui_related_true_count"],
                    "reasoning_tier_high_count": counts["reasoning_tier_high_count"],
                },
            },
            {
                "source_id": "dependency_and_migration_receipt",
                "facts": {
                    "dependency_edge_count": counts["dependency_edge_count"],
                    "internal_target_count": counts["internal_target_count"],
                    "external_known_target_count": counts["external_known_target_count"],
                    "missing_target_count": counts["missing_target_count"],
                    "true_cycle_component_count": 0,
                    "migration_validation_status": migration_validation["status"],
                    "migration_span_count": len(migration_rows),
                },
            },
            {
                "source_id": "comparison_and_gate_receipt",
                "facts": {
                    "plan_units_exact_match": comparison["plan_units_exact_match"],
                    "acceptance_units_exact_match": comparison["acceptance_units_exact_match"],
                    "dependency_edges_exact_match": comparison["dependency_edges_exact_match"],
                    "canonical_global_validation_status": baseline["validation_status"],
                    "canonical_global_failure": baseline["failure_code"],
                    "canonical_global_failure_path": baseline["failure_path"],
                    "canonical_currentness_function_executed": True,
                    "stored_node_readiness_stable_sha256": actual_readiness_stable_sha,
                    "recomputed_node_readiness_stable_sha256": expected_readiness_stable_sha,
                    "node_readiness_status": baseline["node_readiness_status"],
                    "runtime_blocker_ref": baseline["runtime_blocker_ref"],
                    "no_worknodes_created": True,
                },
            },
        ],
        "constraints": [
            "Use only these admitted receipts.",
            "Do not infer readiness from structural extraction success.",
            "A failing canonical currentness check or incomplete runtime certification requires a blocked disposition.",
            "Do not create or propose WorkNodes, NodeSeeds, queues, implementation work, or Plan edits.",
        ],
    }

    capsule_text = canonical_json(capsule)
    field_order = (
        "schema_id,source_match,plan_unit_count,acceptance_unit_count,dependency_registry_status,"
        "migration_coverage_status,canonical_comparison_status,pre_worknode_disposition,blocker_codes,"
        "no_worknodes_created"
    )
    prompt_tail = (
        " one bounded storage-plan pipeline gate.\n\n"
        f"Admitted context:\n{capsule_text}\n\n"
        "Decide the final pre-WorkNode disposition from the receipts. Preserve structural success and blockers separately. "
        "Use no ordinary tools and do not access files. You may give a short explanation, but the final nonempty line must be exactly one "
        f"{RESULT_PREFIX}<minified JSON> line. Use fields in this exact order: {field_order}. "
        "Use the schema_id pm.r10.storage_pipeline.subject_result.v1, copy the two counts, use resolved/pass/pass when supported, "
        "use blocked when any admitted gate blocks, list the exact lowercase blocker codes represented by the two gate failures in receipt order, "
        "and report whether WorkNodes were created. No extra fields."
    )
    prompts = {
        "codex": ("Create a goal that audits" + prompt_tail).encode("utf-8"),
        "omp": ("/goal Audit" + prompt_tail).encode("utf-8"),
    }
    matrix = load_json(MATRIX_PATH)
    capsule_bytes = len(capsule_text.encode("utf-8"))
    if capsule_bytes > matrix["max_admitted_context_utf8_bytes"]:
        raise PipelineError("admitted-context byte ceiling")
    for surface, prompt in prompts.items():
        if len(prompt) > matrix["max_prompt_utf8_bytes"]:
            raise PipelineError(f"{surface} prompt byte ceiling")

    metrics = {
        "schema_id": "pm.r10.storage_pipeline.metrics.v1",
        "capsule_utf8_bytes": capsule_bytes,
        "capsule_sha256": sha256_bytes(capsule_text.encode("utf-8")),
        "codex_prompt_utf8_bytes": len(prompts["codex"]),
        "codex_prompt_sha256": sha256_bytes(prompts["codex"]),
        "omp_prompt_utf8_bytes": len(prompts["omp"]),
        "omp_prompt_sha256": sha256_bytes(prompts["omp"]),
        "oracle_utf8_bytes": len(ORACLE_PATH.read_bytes()),
        "oracle_sha256": sha256_file(ORACLE_PATH),
    }
    return {
        "host_outputs/plan_units.jsonl": jsonl_bytes(units),
        "host_outputs/acceptance_units.jsonl": jsonl_bytes(accepts),
        "host_outputs/doc_cards.json": pretty_json(cards),
        "host_outputs/scoped_dependencies.json": pretty_json(dependencies),
        "host_outputs/coverage_report.json": pretty_json(coverage),
        "host_outputs/node_readiness_report.json": pretty_json(readiness),
        "host_outputs/canonical_recomputed_node_readiness_report.json": pretty_json(strip_generated_timestamps(expected_readiness)),
        "host_outputs/comparison_report.json": pretty_json(comparison),
        "host_outputs/pipeline_report.json": pretty_json(pipeline_report),
        "host_outputs/capsule.json": pretty_json(capsule),
        "host_outputs/metrics.json": pretty_json(metrics),
        "prompts/codex.prompt.txt": prompts["codex"],
        "prompts/omp.prompt.txt": prompts["omp"],
    }


def build() -> dict[str, Any]:
    derived = derive()
    for relative, data in derived.items():
        destination = HERE / relative
        if destination.exists():
            destination.unlink()
        atomic_write(destination, data)
    return {"status": "PASS_BUILT_NO_WORKNODES", "files": len(derived), "qualification_credit": 0}


def verify() -> dict[str, Any]:
    derived = derive()
    expected = set(derived)
    actual = {
        path.relative_to(HERE).as_posix()
        for base in (HOST_OUTPUTS, PROMPTS)
        if base.exists()
        for path in base.rglob("*")
        if path.is_file()
    }
    if actual != expected:
        raise PipelineError(f"derived file roster mismatch: expected={sorted(expected)} actual={sorted(actual)}")
    for relative, data in derived.items():
        path = HERE / relative
        if path.is_symlink() or path.read_bytes() != data:
            raise PipelineError(f"derived byte mismatch: {relative}")
    oracle = load_json(ORACLE_PATH)
    schema = load_json(SCHEMA_PATH)
    try:
        import jsonschema
    except ImportError as exc:
        raise PipelineError("jsonschema unavailable") from exc
    jsonschema.Draft202012Validator.check_schema(schema)
    jsonschema.Draft202012Validator(schema).validate(oracle)
    if oracle["pre_worknode_disposition"] != "blocked" or oracle["no_worknodes_created"] is not True:
        raise PipelineError("oracle weakens stop boundary")
    return {"status": "PASS_VERIFIED_NO_WORKNODES", "files": len(derived), "qualification_credit": 0}


def main() -> int:
    parser = argparse.ArgumentParser()
    parser.add_argument("command", choices=("preflight", "runtime", "build", "verify", "metrics"))
    args = parser.parse_args()
    try:
        if args.command == "preflight":
            result = preflight_inputs()
        elif args.command == "runtime":
            result = omp_runtime_preflight()
        elif args.command == "build":
            result = build()
        elif args.command == "verify":
            result = verify()
        else:
            result = load_json(HOST_OUTPUTS / "metrics.json")
        print(canonical_json(result))
        return 0
    except (PipelineError, OSError, ValueError, KeyError, TypeError, AssertionError) as exc:
        print(canonical_json({"status": "FAIL", "error": f"{type(exc).__name__}: {exc}", "qualification_credit": 0}))
        return 1


if __name__ == "__main__":
    raise SystemExit(main())
