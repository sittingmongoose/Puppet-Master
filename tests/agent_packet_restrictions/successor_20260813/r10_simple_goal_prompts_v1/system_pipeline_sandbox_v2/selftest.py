#!/usr/bin/env python3
"""Zero-subject checks for the storage-plan pipeline and result scorer."""

from __future__ import annotations

import copy
import json
import tempfile
from pathlib import Path

import jsonschema

import pipeline
import freeze_check
import verify_matrix


def expect_failure(callable_obj, label: str) -> None:
    try:
        callable_obj()
    except Exception:
        return
    raise AssertionError(f"expected failure: {label}")


def check(condition: bool, label: str) -> None:
    if not condition:
        raise AssertionError(label)


def main() -> int:
    checks = 0
    check(pipeline.preflight_inputs()["status"] == "PASS", "input preflight"); checks += 1
    check(pipeline.omp_runtime_preflight()["status"] == "PASS_OMP_RUNTIME", "OMP runtime preflight"); checks += 1
    check(pipeline.verify()["status"] == "PASS_VERIFIED_NO_WORKNODES", "derived verification"); checks += 1
    check(freeze_check.verify_freeze()["status"] == "PASS_FROZEN_ZERO_SUBJECT", "freeze verification"); checks += 1
    matrix = pipeline.load_json(pipeline.MATRIX_PATH)
    check(len(matrix["ordered_routes"]) == 12, "route count"); checks += 1
    check(matrix["ordered_routes"][0]["id"] == "omp_ox_alpha_free_max", "Ox first"); checks += 1
    check(matrix["ordered_routes"][1]["id"] == "omp_cursor_default_auto", "Cursor second"); checks += 1
    check(matrix["ordered_routes"][-1]["id"] == "omp_qwen3_8_max_xhigh", "Qwen last"); checks += 1
    check(len({(row["surface"], row["model"], row["thinking"]) for row in matrix["ordered_routes"]}) == 12, "unique route tuples"); checks += 1
    launch_plan = pipeline.load_json(pipeline.HERE / "launch_plan.json")
    check(launch_plan["pass_order"] == ["pass_01", "pass_02"] and launch_plan["row_count"] == 24, "launch plan pass/row contract"); checks += 1
    check(len({row["attempt_id"] for row in launch_plan["rows"]}) == 24 and len({row["nonce"] for row in launch_plan["rows"]}) == 24, "launch identity uniqueness"); checks += 1
    omp = (pipeline.PROMPTS / "omp.prompt.txt").read_text(); codex = (pipeline.PROMPTS / "codex.prompt.txt").read_text()
    check(omp.startswith("/goal ") and codex.startswith("Create a goal that "), "native prefixes"); checks += 1
    check("Create a goal that" not in omp and not codex.startswith("/goal "), "surface isolation"); checks += 1
    oracle = pipeline.load_json(pipeline.ORACLE_PATH); schema = pipeline.load_json(pipeline.SCHEMA_PATH)
    capsule = pipeline.load_json(pipeline.HOST_OUTPUTS / "capsule.json")
    jsonschema.Draft202012Validator.check_schema(schema); jsonschema.validate(oracle, schema); checks += 1
    projection = pipeline.verify_typed_projection(capsule, oracle)
    check(projection == {key: value for key, value in oracle.items() if key != "schema_id"}, "typed projection covers oracle"); checks += 1
    check(pipeline.ORACLE_PATH.read_text().strip() not in omp and pipeline.ORACLE_PATH.read_text().strip() not in codex, "full oracle not admitted"); checks += 1
    swapped = copy.deepcopy(capsule)
    next(source["facts"] for source in swapped["sources"] if source["source_id"] == "comparison_and_gate_receipt")["blocker_codes"].reverse()
    expect_failure(lambda: pipeline.verify_typed_projection(swapped, oracle), "swapped blocker projection"); checks += 1
    wrong_type = copy.deepcopy(capsule)
    next(source["facts"] for source in wrong_type["sources"] if source["source_id"] == "comparison_and_gate_receipt")["source_match"] = "true"
    expect_failure(lambda: pipeline.verify_typed_projection(wrong_type, oracle), "wrong projection type"); checks += 1
    missing = copy.deepcopy(capsule)
    del next(source["facts"] for source in missing["sources"] if source["source_id"] == "comparison_and_gate_receipt")["pre_worknode_disposition"]
    expect_failure(lambda: pipeline.verify_typed_projection(missing, oracle), "missing projection field"); checks += 1
    aliased = copy.deepcopy(capsule)
    facts = next(source["facts"] for source in aliased["sources"] if source["source_id"] == "comparison_and_gate_receipt")
    facts["public_blockers"] = facts.pop("blocker_codes")
    expect_failure(lambda: pipeline.verify_typed_projection(aliased, oracle), "aliased projection field"); checks += 1
    exact = "brief\n" + pipeline.RESULT_PREFIX + pipeline.ORACLE_PATH.read_text().strip()
    check(verify_matrix.terminal_result(exact) == oracle, "positive typed result"); checks += 1
    expect_failure(lambda: verify_matrix.terminal_result(exact + "\nextra"), "nonterminal result"); checks += 1
    expect_failure(lambda: verify_matrix.terminal_result(exact + "\n" + pipeline.RESULT_PREFIX + pipeline.ORACLE_PATH.read_text().strip()), "duplicate result"); checks += 1
    wrong = copy.deepcopy(oracle); wrong["pre_worknode_disposition"] = "ready"
    expect_failure(lambda: verify_matrix.terminal_result(pipeline.RESULT_PREFIX + json.dumps(wrong, separators=(",", ":"))), "readiness widening"); checks += 1
    expect_failure(lambda: pipeline.strict_loads('{"a":1,"a":2}'), "duplicate JSON key"); checks += 1
    expect_failure(lambda: pipeline.strict_loads('{"a":NaN}'), "nonfinite JSON"); checks += 1
    check(verify_matrix.parse_goal_wrapper('const r=await tools.create_goal({objective:"storage pipeline"}); text(r)') == ("create_goal", "storage pipeline"), "safe create wrapper"); checks += 1
    check(verify_matrix.parse_goal_wrapper('const result = await tools.update_goal({status: "complete"});\ntext(result);') == ("update_goal", None), "safe update wrapper"); checks += 1
    expect_failure(lambda: verify_matrix.parse_goal_wrapper("await tools['create_goal']({})"), "computed Goal access"); checks += 1
    expect_failure(lambda: verify_matrix.parse_goal_wrapper('const r=await tools.create_goal({objective:"storage pipeline"}); await tools.exec_command({}); text(r)'), "mixed wrapper"); checks += 1
    expect_failure(lambda: verify_matrix.parse_goal_wrapper('const t=tools; const r=await t.exec_command({}); "tools.create_goal({})"; text(r)'), "aliased wrapper bypass"); checks += 1
    first = launch_plan["rows"][0]
    runtime = pipeline.load_json(pipeline.RUNTIME_PATH)["omp"]
    receipt = {
        "schema_id": "pm.r10.storage_pipeline.omp_preflight.v1",
        **{key: first[key] for key in ("pass_id", "route_id", "ordinal", "attempt_id", "nonce")},
        "observed_at_utc": "2026-08-25T14:59:00Z",
        "binary": runtime["binary"],
        "binary_bytes": runtime["binary_bytes"],
        "binary_sha256": runtime["binary_sha256"],
        "version_stdout": runtime["version"],
        "profile_dir": runtime["profile_dir"],
        "config_commands": [
            {"key": key, "exit_code": 0, "stdout": json.dumps(value, separators=(",", ":")) if not isinstance(value, str) else value}
            for key, value in runtime["effective_config"].items()
        ],
    }
    with tempfile.TemporaryDirectory(prefix="pm-r10-omp-preflight-test-") as temporary:
        path = Path(temporary) / "omp_preflight.json"
        path.write_bytes(pipeline.pretty_json(receipt))
        launch = {
            "started_at_utc": "2026-08-25T14:59:30Z",
            "omp_preflight_bytes": path.stat().st_size,
            "omp_preflight_sha256": pipeline.sha256_file(path),
        }
        check(verify_matrix.verify_omp_preflight(path.parent, launch, first) == launch["omp_preflight_sha256"], "row-bound OMP preflight"); checks += 1
        receipt["config_commands"][0]["stdout"] = "true"
        path.write_bytes(pipeline.pretty_json(receipt))
        launch["omp_preflight_bytes"] = path.stat().st_size
        launch["omp_preflight_sha256"] = pipeline.sha256_file(path)
        expect_failure(lambda: verify_matrix.verify_omp_preflight(path.parent, launch, first), "advisor-on OMP preflight"); checks += 1
    check(oracle["blocker_codes"] == ["canonical_node_readiness_artifact_stale", "pnc019_runtime_certification_incomplete"], "blocker order"); checks += 1
    check(oracle["no_worknodes_created"] is True, "stop boundary"); checks += 1
    print(pipeline.canonical_json({"status": "PASS", "checks": checks, "subject_calls": 0, "qualification_credit": 0}))
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
