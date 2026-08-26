#!/usr/bin/env python3
"""Thin two-row owned-GLM diagnostic over frozen V7/V3/V2 mechanics."""

from __future__ import annotations

import argparse
import contextlib
import importlib.util
import os
import subprocess
import sys
from pathlib import Path
from typing import Any, Iterator


HERE = Path(__file__).resolve().parent
R10 = HERE.parent
REPO = HERE.parents[4]
V7 = R10 / "system_pipeline_sandbox_v7"
GLM_ROOT = R10 / "ox_owned_glm_reliability_v3"
V2_ROOT = R10 / "storage_native_matrix_v2"
sys.path.insert(0, str(V7))

import freeze_check  # type: ignore[import-not-found]  # noqa: E402
import omp_row_runner as base  # type: ignore[import-not-found]  # noqa: E402
import omp_session  # type: ignore[import-not-found]  # noqa: E402
import pipeline as P  # type: ignore[import-not-found]  # noqa: E402
import verify_matrix as V  # type: ignore[import-not-found]  # noqa: E402


def external(name: str, path: Path, search: Path) -> Any:
    module_spec = importlib.util.spec_from_file_location(name, path)
    if module_spec is None or module_spec.loader is None:
        raise RuntimeError(f"external module unavailable: {path}")
    module = importlib.util.module_from_spec(module_spec)
    sys.modules[name] = module
    sys.path.insert(0, str(search))
    try:
        module_spec.loader.exec_module(module)
    finally:
        sys.path.remove(str(search))
    return module


projection = external("r10_glm_projection_v3", GLM_ROOT / "glm_projection.py", GLM_ROOT)
v2 = external("r10_storage_matrix_v2_helpers", V2_ROOT / "controller.py", V2_ROOT)
CONTRACT = HERE / "diagnostic_contract.json"
OVERLAY = GLM_ROOT / "tools_glm.config.yml"
PROJECTION = GLM_ROOT / "glm_projection.py"
EVIDENCE = HERE / "evidence"
SOURCES = ("README.md", "diagnostic_contract.json", "controller.py", "selftest.py")
IDENTITY = ("ordinal", "pass_id", "route_id", "attempt_id", "nonce")
JOURNAL_FIELDS = {"schema_id", *IDENTITY, "started_at_utc", "launch_sha256", "omp_preflight_sha256", "popen_observed", "pid"}
ORIGINAL_ARGV = base.expected_argv
ORIGINAL_PREFLIGHT = base.row_preflight
DISPATCH_CUSTODY: dict[str, Any] | None = None


class ControllerError(RuntimeError):
    pass


def require(value: bool, message: str) -> None:
    if not value:
        raise ControllerError(message)


def spec() -> dict[str, Any]:
    value = P.load_json(CONTRACT)
    require(isinstance(value, dict), "contract object")
    return value


def rows() -> list[dict[str, Any]]:
    value = spec().get("rows")
    require(isinstance(value, list) and len(value) == 2, "two frozen rows")
    return value


def route_map() -> dict[str, dict[str, Any]]:
    wanted = ["omp_ox_alpha_free_max", "omp_muse_spark_xhigh"]
    routes = {row["id"]: row for row in P.load_json(V7 / "matrix.json")["ordered_routes"]}
    require(all(route_id in routes for route_id in wanted), "diagnostic routes")
    return {route_id: routes[route_id] for route_id in wanted}


def planned_row(pass_id: str, route_id: str) -> dict[str, Any]:
    matches = [row for row in rows() if (row["pass_id"], row["route_id"]) == (pass_id, route_id)]
    require(len(matches) == 1, "one planned diagnostic row")
    return matches[0]


def launch_plan_map() -> dict[tuple[str, str], dict[str, Any]]:
    return {(row["pass_id"], row["route_id"]): row for row in rows()}


def file_record(path: Path) -> dict[str, Any]:
    require(path.is_file() and not path.is_symlink(), f"regular file required: {path}")
    return {"path": path.relative_to(REPO).as_posix(), "bytes": path.stat().st_size, "sha256": P.sha256_file(path)}


def frozen_records(field: str) -> list[dict[str, Any]]:
    result = []
    for expected in spec()[field]:
        actual = file_record(REPO / expected["path"])
        require(actual == expected, f"{field} drift: {expected['path']}")
        result.append(actual)
    return result


@contextlib.contextmanager
def v2_scope() -> Iterator[None]:
    names = {"HERE": HERE, "REPO": REPO, "CONTRACT": CONTRACT, "EVIDENCE": EVIDENCE, "SOURCES": SOURCES}
    prior = {name: getattr(v2, name) for name in names}
    try:
        for name, value in names.items():
            setattr(v2, name, value)
        yield
    finally:
        for name, value in prior.items():
            setattr(v2, name, value)


def git_custody() -> dict[str, Any]:
    try:
        with v2_scope():
            return v2.git_custody()
    except v2.ControllerError as exc:
        raise ControllerError(f"pushed source custody: {exc}") from exc


def expected_argv(route: dict[str, Any], planned: dict[str, Any]) -> list[str]:
    argv = ORIGINAL_ARGV(route, planned)
    return [argv[0], "--config", str(OVERLAY), *argv[1:]]


def verifier_argv(route: dict[str, Any], cwd: str, session_dir: str) -> list[str]:
    matches = [row for row in rows() if (row["cwd"], row["session_dir"]) == (cwd, session_dir)]
    require(len(matches) == 1, "verifier argv row identity")
    return expected_argv(route, matches[0])


def row_preflight(row_dir: Path, planned: dict[str, Any], route: dict[str, Any]) -> dict[str, Any]:
    custody = git_custody()
    require(custody == DISPATCH_CUSTODY, "source custody changed before Popen")
    receipt = ORIGINAL_PREFLIGHT(row_dir, planned, route)
    config = receipt.get("effective_config", {})
    require(config.get("advisor.enabled") is False and config.get("task.agentAdvisor") == {"task": "off"}, "both advisor controls off")
    receipt.update({
        "diagnostic_contract": file_record(CONTRACT), "owned_sources": custody["sources"], "git_custody": custody,
        "protocol_adapter": "owned_glm", "config_overlay": file_record(OVERLAY), "glm_projection": file_record(PROJECTION),
        "expected_argv": expected_argv(route, planned), "dependencies": frozen_records("dependencies"),
        "row_time_budget_seconds": 3600, "qualification_credit": 0,
    })
    base.atomic_json(row_dir / "omp_preflight.json", receipt)
    return receipt


def verify_receipt(row: dict[str, Any], custody: dict[str, Any]) -> None:
    row_dir = EVIDENCE / row["pass_id"] / row["route_id"]
    receipt = P.load_json(row_dir / "omp_preflight.json")
    require(receipt.get("diagnostic_contract") == file_record(CONTRACT), "contract receipt")
    require(receipt.get("owned_sources") == custody["sources"] and receipt.get("git_custody") == custody, "exact pushed custody receipt")
    require(receipt.get("protocol_adapter") == "owned_glm" and receipt.get("config_overlay") == file_record(OVERLAY), "GLM overlay receipt")
    require(receipt.get("glm_projection") == file_record(PROJECTION) and receipt.get("dependencies") == frozen_records("dependencies"), "projection/dependency receipt")
    require(receipt.get("expected_argv") == expected_argv(route_map()[row["route_id"]], row), "argv receipt")
    config = receipt.get("effective_config", {})
    require(config.get("advisor.enabled") is False and config.get("task.agentAdvisor") == {"task": "off"}, "advisor receipt")
    require(receipt.get("row_time_budget_seconds") == 3600 and receipt.get("qualification_credit") == 0, "budget/credit receipt")
    terminal = P.load_json(row_dir / "terminal.json")
    session = terminal.get("session_projection", {})
    call, framing = session.get("owned_glm_goal_call", {}), session.get("owned_glm_post_call_framing", {})
    require(call.get("present") is True and isinstance(call.get("bytes"), int) and call["bytes"] > 0 and isinstance(call.get("sha256"), str) and len(call["sha256"]) == 64, "canonical GLM rawBlock receipt")
    require(framing.get("kind") in {"none", "ascii_whitespace", "observation_open"} and framing.get("present") is (framing.get("kind") != "none"), "closed GLM framing receipt")
    entry_ids = session.get("entry_ids", {})
    lifecycle = ("goal_active", "goal_call_assistant", "goal_tool_start", "goal_result", "goal_complete_mode", "goal_completed", "goal_exit", "final_assistant")
    require(session.get("assistant_lifecycle_shape") == "standard_tool_cycle" and all(isinstance(entry_ids.get(key), str) and entry_ids[key] for key in lifecycle), "native Goal call/start/success-result/complete lifecycle")
    require(entry_ids["goal_call_assistant"] != entry_ids["final_assistant"] and session.get("assistant_message_count", 0) >= 2, "distinct final assistant")
    require(terminal.get("goal_activation_observed") is True and terminal.get("goal_complete_observed") is True, "native Goal lifecycle receipt")
    require(terminal.get("observed_non_goal_tool_calls") == 0 and terminal.get("process_exit_code") == 0 and terminal.get("status") == "PASS", "tool/exit/PASS receipt")
    base.exact_result(terminal.get("final_assistant_text"))
    require(session.get("final_text_sha256") == P.sha256_bytes(terminal["final_assistant_text"].encode()), "distinct exact final receipt")


def generic_journal(reports: list[dict[str, Any]]) -> None:
    verified = sorted((row for report in reports for row in report["rows"]), key=lambda row: row["ordinal"])
    require([row["ordinal"] for row in verified] == list(range(1, len(verified) + 1)), "journal exact ordinal prefix")
    path = EVIDENCE / "launch_journal.jsonl"
    require(path.is_file() and not path.is_symlink(), "launch journal absent")
    journal = P.load_jsonl(path)
    require(path.read_bytes() == P.jsonl_bytes(journal) and len(journal) == len(verified), "canonical journal length")
    previous = ""
    for report, actual in zip(verified, journal, strict=True):
        frozen = rows()[report["ordinal"] - 1]
        require(set(actual) == JOURNAL_FIELDS and actual.get("schema_id") == "pm.r10.storage_pipeline.launch_journal.v2", "journal shape")
        require(all(actual.get(field) == frozen[field] for field in IDENTITY), "journal frozen identity")
        require(all(actual.get(field) == report[field] for field in ("started_at_utc", "launch_sha256", "omp_preflight_sha256", "pid")), "journal report joins")
        require(actual.get("popen_observed") is True and isinstance(actual.get("pid"), int) and actual["pid"] > 0, "journal Popen/PID")
        require(actual["started_at_utc"] > previous, "journal chronology")
        previous = actual["started_at_utc"]


BINDING_NAMES = (
    "omp_session.verify_session", "omp_row_runner.EVIDENCE", "omp_row_runner.route_map", "omp_row_runner.plan_rows",
    "omp_row_runner.planned_row", "omp_row_runner.expected_argv", "omp_row_runner.row_preflight", "verify_matrix.EVIDENCE",
    "verify_matrix.launch_plan_map", "verify_matrix.expected_argv", "verify_matrix.verify_launch_journal",
)


def bindings() -> tuple[tuple[Any, str, Any], ...]:
    return (
        (omp_session, "verify_session", projection.verify_session), (base, "EVIDENCE", EVIDENCE), (base, "route_map", route_map),
        (base, "plan_rows", rows), (base, "planned_row", planned_row), (base, "expected_argv", expected_argv),
        (base, "row_preflight", row_preflight), (V, "EVIDENCE", EVIDENCE), (V, "launch_plan_map", launch_plan_map),
        (V, "expected_argv", verifier_argv), (V, "verify_launch_journal", generic_journal),
    )


@contextlib.contextmanager
def installed() -> Iterator[None]:
    current = bindings()
    require(len(current) == 11, "exactly eleven adapter bindings")
    prior = [(module, name, getattr(module, name)) for module, name, _value in current]
    try:
        for module, name, value in current:
            setattr(module, name, value)
        yield
    finally:
        for module, name, value in reversed(prior):
            setattr(module, name, value)


def _prefix() -> dict[str, Any]:
    journal, frozen = base.journal_rows(), rows()
    require(len(journal) <= 2, "at most two journal rows")
    reports: list[dict[str, Any]] = []
    if not journal:
        require(not os.path.lexists(EVIDENCE), "zero prefix requires absent evidence root")
    else:
        custody = git_custody()
        verified = []
        for row in frozen[: len(journal)]:
            report = V.verify_row(row["pass_id"], route_map()[row["route_id"]])
            require(report.get("status") == "PASS", "fail-stop: prior row is not PASS")
            verify_receipt(row, custody)
            verified.append(report)
        reports = [{"pass_id": "diagnostic_01", "rows": verified}]
        V.verify_launch_journal(reports)
        V.verify_evidence_tree(reports)
        V.verify_global_uniqueness(reports)
        for row, report in zip(frozen, verified, strict=False):
            cwd, session_dir = Path(row["cwd"]), Path(row["session_dir"])
            require(cwd.is_dir() and not cwd.is_symlink() and not any(cwd.iterdir()), "completed cwd empty")
            live = base.session_file(session_dir)
            require(live is not None and P.sha256_file(live) == report["raw_primary_sha256"], "persistent/raw session join")
    for row in frozen[len(journal) :]:
        leaf = EVIDENCE / row["pass_id"] / row["route_id"]
        require(not os.path.lexists(leaf) and not os.path.lexists(row["cwd"]) and not os.path.lexists(row["session_dir"]), "future row paths absent")
    complete = len(journal) == 2
    return {"status": "PASS_TWO_ROW_GLM_DIAGNOSTIC_ZERO_CREDIT" if complete else "PASS_GLM_DIAGNOSTIC_PREFIX_ZERO_CREDIT", "row_count": len(journal), "required_rows": 2, "may_request_fresh_matrix_authority": complete, "subject_calls": 0, "qualification_credit": 0}


def verify_prefix() -> dict[str, Any]:
    with installed():
        return _prefix()


def prior_rows() -> Iterator[tuple[Path, dict[str, Any]]]:
    for record in spec()["historic_identity_manifests"]:
        path = REPO / record["path"]
        for row in P.load_json(path).get("rows", []):
            yield path.parent, row


def metric(path: Path) -> dict[str, int]:
    raw = path.read_bytes()
    return {"lines": len(raw.splitlines()), "bytes": len(raw)}


def validate_static(*, unused: bool) -> dict[str, Any]:
    contract, frozen = spec(), rows()
    require(contract.get("schema_id") == "pm.r10.storage_pipeline.storage_glm_adapter_diagnostic.v1", "schema")
    actual = {path.name for path in HERE.iterdir()}
    require(actual == set(SOURCES) if unused else actual in (set(SOURCES), set(SOURCES) | {"evidence"}), "package root roster")
    require(contract.get("owned_file_roster") == list(SOURCES) and all((HERE / name).is_file() and not (HERE / name).is_symlink() for name in SOURCES), "four regular sources")
    metrics = {name: metric(HERE / name) for name in SOURCES}
    limits = contract["architecture_limits"]
    require(metrics["controller.py"]["lines"] <= limits["controller_max_physical_lines"] and metrics["controller.py"]["bytes"] <= limits["controller_max_bytes"], "controller budget")
    require(metrics["selftest.py"]["lines"] <= limits["selftest_max_physical_lines"] and metrics["selftest.py"]["bytes"] <= limits["selftest_max_bytes"], "selftest budget")
    python = [metrics[name] for name in ("controller.py", "selftest.py")]
    require(sum(item["lines"] for item in python) <= limits["all_python_max_physical_lines"] and sum(item["bytes"] for item in python) <= limits["all_python_max_bytes"], "Python aggregate budget")
    require(sum(item["lines"] for item in metrics.values()) <= limits["total_max_physical_lines"] and sum(item["bytes"] for item in metrics.values()) <= limits["total_max_bytes"], "package budget")
    require(contract.get("temporary_bindings") == list(BINDING_NAMES) and limits["temporary_binding_count"] == 11, "binding freeze")
    require(frozen_records("dependencies") == contract["dependencies"] and frozen_records("historic_identity_manifests") == contract["historic_identity_manifests"], "dependency/history freeze")
    require(OVERLAY.read_bytes() == b"tools:\n  format: glm\n" and file_record(OVERLAY)["sha256"] == "f1dfc8269d8f9e495d944f5319fbc6737339a27afe6445b64a50d1e5556995f9", "exact GLM overlay")
    require(file_record(PROJECTION)["sha256"] == "32912b97875c83b9237f04ab0193710a85727c5fbb351d883c5333ef6b4fa0ec", "exact closed projection")
    prompt = V7 / "prompts" / "omp.prompt.txt"
    require(prompt.stat().st_size == 3036 and P.sha256_file(prompt) == "eff40a61579a080ce6e21bb71bcae2dd0640c100c9d61c199f45ac5dece43638", "exact V7 prompt")
    expected_routes = [("omp_ox_alpha_free_max", "opencode-go/ox-alpha-free", "max"), ("omp_muse_spark_xhigh", "opencode-go/muse-spark-1.2-contributor", "xhigh")]
    for ordinal, (row, expected) in enumerate(zip(frozen, expected_routes, strict=True), 1):
        suffix = row["nonce"][:10]
        require((row["ordinal"], row["pass_id"], row["route_id"], row["model"], row["thinking"]) == (ordinal, "diagnostic_01", *expected), "route order/tuple")
        require(row["surface"] == "omp_tui" and row["attempt_id"] == f"storage-glm-diag-v1-{ordinal:02d}-{suffix}", "surface/attempt join")
        require(len(row["nonce"]) == 32 and all(character in "0123456789abcdef" for character in row["nonce"]), "nonce shape")
        require(row["cwd"] == f"/tmp/pm-r10-storage-v7-glm-adapter-diagnostic-v1-{ordinal:02d}-{suffix}" and row["session_dir"] == f"/tmp/pm-r10-storage-v7-session-glm-adapter-diagnostic-v1-{ordinal:02d}-{suffix}", "runtime identity")
        require(row["evidence_path"] == f"evidence/diagnostic_01/{row['route_id']}" and row["prompt_utf8_bytes"] == 3036 and row["prompt_sha256"] == P.sha256_file(prompt), "evidence/prompt identity")
    for field in ("attempt_id", "nonce", "cwd", "session_dir", "evidence_path"):
        require(len({row[field] for row in frozen}) == 2, f"current {field} uniqueness")
    for root, prior in prior_rows():
        for row in frozen:
            require(all(field not in prior or row[field] != prior[field] for field in ("attempt_id", "nonce", "cwd", "session_dir")), "historic identity disjointness")
            if "evidence_path" in prior:
                require((HERE / row["evidence_path"]).resolve() != (root / prior["evidence_path"]).resolve(), "historic evidence disjointness")
    runtime, sequence = contract["runtime"], contract["sequencing"]
    binary = Path(runtime["binary"])
    require(binary.is_file() and not binary.is_symlink() and binary.stat().st_size == runtime["binary_bytes"] and P.sha256_file(binary) == runtime["binary_sha256"], "OMP binary freeze")
    require(runtime["row_time_budget_seconds"] == 3600 and runtime["advisor_enabled"] is False and runtime["task_agent_advisor"] == {"task": "off"} and runtime["ordinary_tools_enabled"] is False and runtime["external_goal_prompt_count"] == 1 and runtime["normal_exit_required"] is True and runtime["windows_omp_terminal_processes_are_foreign"] is True, "runtime freeze")
    require(sequence["exact_route_order"] == [item[0] for item in expected_routes] and sequence["row_2_requires_exact_row_1_pass"] is True and sequence["fail_stop_on_first_failure_or_custody_mismatch"] is True and sequence["retry_count"] == sequence["replacement_count"] == sequence["qualification_credit"] == 0, "sequence freeze")
    require(contract["source_candidate_commit"] is None and contract["pushed_custody_mode"].startswith("derive_equal_live_HEAD"), "non-self-referential custody")
    authority = contract["authority"]
    raw = authority["free_ox_user_text_utf8"].encode()
    require(authority["source_thread_id"] == "01a034b9-a1c8-7a80-937f-4e45e3f2ae45" and len(raw) == 69 and P.sha256_bytes(raw) == "99df1f43d62da6ae6314c385f43208ac159374deed46c8b16382d3c9909d54e8", "authority source/free Ox grant")
    require(authority["ox_control_authorized"] is True and authority["muse_row_authorized_by_passable_glm_pivot"] is True and authority["authorized_attempt_ids"] == [row["attempt_id"] for row in frozen], "exact two-row authority")
    require(authority["retry_replacement_reuse_or_retro_credit_authorized"] is False and authority["full_matrix_or_further_dialect_launch_authorized_by_this_contract"] is False and authority["paid_codex_cursor_qwen_or_other_route_authorized_by_this_contract"] is False, "authority ceiling")
    require(P.preflight_inputs()["status"] == "PASS" and P.verify()["status"] == "PASS_VERIFIED_NO_WORKNODES" and freeze_check.verify_freeze()["status"] == "PASS_FROZEN_ZERO_SUBJECT", "V7 pipeline/freeze")
    if unused:
        require(not os.path.lexists(EVIDENCE), "unused evidence absent")
        for row in frozen:
            require(not os.path.lexists(row["cwd"]) and not os.path.lexists(row["session_dir"]), "unused runtime paths absent")
    require(not list(HERE.rglob("*.pyc")) and not list(HERE.rglob("__pycache__")), "no cache")
    return {"status": "PASS_LOCAL_GLM_DIAGNOSTIC_PRELAUNCH", "rows": 2, "temporary_bindings": 11, "metrics": metrics, "subject_calls": 0, "qualification_credit": 0}


def require_authority(row: dict[str, Any]) -> None:
    authority = spec()["authority"]
    require(row["attempt_id"] in authority.get("authorized_attempt_ids", []), "row authority identity")
    require(authority.get("ox_control_authorized") is True if row["ordinal"] == 1 else authority.get("muse_row_authorized_by_passable_glm_pivot") is True, "route authority")
    require(authority.get("retry_replacement_reuse_or_retro_credit_authorized") is False and authority.get("full_matrix_or_further_dialect_launch_authorized_by_this_contract") is False, "authority cannot widen")


def claim_after_failure(row: dict[str, Any], before: tuple[bool, bool, bool] | None) -> bool:
    try:
        with v2_scope():
            return bool(v2.claim_after_failure(row, before))
    except v2.ControllerError as exc:
        raise ControllerError(f"failure claim: {exc}") from exc


def preserve_postfailure(row: dict[str, Any]) -> None:
    row_dir, session_dir = EVIDENCE / row["pass_id"] / row["route_id"], Path(row["session_dir"])
    source = base.session_file(session_dir) if session_dir.is_dir() else None
    if source is not None:
        P.atomic_write(row_dir / "postfailure_session.raw.jsonl", source.read_bytes())


ERRORS = (ControllerError, projection.ProjectionError, base.RunnerError, omp_session.OmpSessionError, V.VerifyError, P.PipelineError, subprocess.SubprocessError, OSError, ValueError, KeyError, TypeError, AssertionError)


def dispatch(argv: list[str] | None = None) -> int:
    global DISPATCH_CUSTODY
    parser = argparse.ArgumentParser()
    parser.add_argument("command", choices=("lint", "verify-prefix", "run"))
    parser.add_argument("ordinal", nargs="?", type=int, choices=(1, 2))
    parser.add_argument("--max-seconds", type=int, default=3600)
    args = parser.parse_args(argv)
    row = None
    before = None
    try:
        require((args.command == "run") == (args.ordinal is not None), "ordinal only for run")
        static = validate_static(unused=args.command == "lint")
        if args.command == "lint":
            print(P.canonical_json({"status": "PASS_ZERO_SUBJECT_LINT", **static}))
            return 0
        if args.command == "verify-prefix":
            print(P.canonical_json(verify_prefix()))
            return 0
        require(args.max_seconds == 3600, "frozen 3600-second row budget")
        row = rows()[args.ordinal - 1]
        require_authority(row)
        DISPATCH_CUSTODY = git_custody()
        with installed():
            prefix = _prefix()
            require(prefix["row_count"] == args.ordinal - 1 and prefix["row_count"] < 2, "only exact next ordinal may launch")
            row_dir = EVIDENCE / row["pass_id"] / row["route_id"]
            before = tuple(os.path.lexists(path) for path in (EVIDENCE, row_dir.parent, row_dir))
            terminal = base.run_row(row["pass_id"], row["route_id"], 3600)
    except base.ReservationConflict as exc:
        print(P.canonical_json({"status": "FAIL_ALREADY_CONSUMED_NO_MUTATION", "error": f"{type(exc).__name__}: {exc}", "qualification_credit": 0}))
        return 1
    except ERRORS as exc:
        claimed = row is not None and before is not None and claim_after_failure(row, before)
        if claimed:
            try:
                preserve_postfailure(row)
            except ERRORS as preserve_exc:
                exc = ControllerError(f"{type(exc).__name__}: {exc}; postfailure preserve: {type(preserve_exc).__name__}: {preserve_exc}")
            with installed():
                base.record_failure(row["pass_id"], row["route_id"], exc)
            terminal = P.load_json(EVIDENCE / row["pass_id"] / row["route_id"] / "terminal.json")
            require(terminal.get("status") == "FAIL" and terminal.get("no_retry") is True, "durable failure terminal")
        status = "FAIL_DIAGNOSTIC_ROW_CONSUMED_STOP_ALL_REMAINING" if claimed else "FAIL_PRELAUNCH_NO_MUTATION"
        print(P.canonical_json({"status": status, "error": f"{type(exc).__name__}: {exc}", "qualification_credit": 0}))
        return 1
    finally:
        DISPATCH_CUSTODY = None
    print(P.canonical_json({"status": "PASS_DIAGNOSTIC_ROW_ZERO_CREDIT", "ordinal": args.ordinal, "terminal": terminal, "qualification_credit": 0}))
    return 0


if __name__ == "__main__":
    raise SystemExit(dispatch())
