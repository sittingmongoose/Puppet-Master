#!/usr/bin/env python3
"""Thin five-row native/default Ox controller over frozen V7."""
from __future__ import annotations

import argparse
import contextlib
import os
import subprocess
import sys
from pathlib import Path
from typing import Any, Iterator

HERE = Path(__file__).resolve().parent
R10 = HERE.parent
V7 = R10 / "system_pipeline_sandbox_v7"
REPO = V7.parents[4]
sys.path.insert(0, str(V7))
import freeze_check  # type: ignore[import-not-found]  # noqa: E402
import omp_row_runner as base  # type: ignore[import-not-found]  # noqa: E402
import omp_session  # type: ignore[import-not-found]  # noqa: E402
import pipeline  # type: ignore[import-not-found]  # noqa: E402
import verify_matrix  # type: ignore[import-not-found]  # noqa: E402

CONTRACT_PATH = HERE / "reliability_contract.json"
EVIDENCE = HERE / "evidence"
SOURCE_NAMES = ("README.md", "reliability_contract.json", "controller.py", "selftest.py")
IDENTITY_FIELDS = ("ordinal", "pass_id", "route_id", "attempt_id", "nonce")
JOURNAL_FIELDS = {"schema_id", *IDENTITY_FIELDS, "started_at_utc", "launch_sha256", "omp_preflight_sha256", "popen_observed", "pid"}
ORIGINAL_ROW_PREFLIGHT = base.row_preflight
ORIGINAL_EXACT_RESULT = base.exact_result
ORIGINAL_VERIFY_SESSION = omp_session.verify_session
ORIGINAL_BASE_ARGV = base.expected_argv
ORIGINAL_VERIFY_ARGV = verify_matrix.expected_argv
ORIGINAL_TERMINAL_RESULT = verify_matrix.terminal_result

class ControllerError(RuntimeError):
    pass

class PermanentTerminalResultFailure(RuntimeError):
    pass

def require(condition: bool, message: str) -> None:
    if not condition:
        raise ControllerError(message)

def spec() -> dict[str, Any]:
    value = pipeline.load_json(CONTRACT_PATH)
    require(isinstance(value, dict), "contract object")
    return value

def rows() -> list[dict[str, Any]]:
    value = spec().get("rows")
    require(isinstance(value, list) and len(value) == 5, "five frozen rows")
    return value

def launch_plan_map() -> dict[tuple[str, str], dict[str, Any]]:
    return {(row["pass_id"], row["route_id"]): row for row in rows()}

def file_record(path: Path) -> dict[str, Any]:
    require(path.is_file() and not path.is_symlink(), f"regular file required: {path}")
    return {"path": path.relative_to(REPO).as_posix(), "bytes": path.stat().st_size, "sha256": pipeline.sha256_file(path)}

def run_git(*args: str, binary: bool = False) -> subprocess.CompletedProcess[Any]:
    return subprocess.run(["git", "-C", str(REPO), *args], check=False, capture_output=True, text=not binary)

def git_custody() -> dict[str, Any]:
    refs = [run_git("rev-parse", name).stdout.strip() for name in ("HEAD", "origin/main", "truenas-backup/main")]
    require(len(refs[0]) == 40 and refs[0] == refs[1] == refs[2], "dual-remote pushed HEAD custody")
    require(run_git("merge-base", "--is-ancestor", spec()["source_candidate_commit"], refs[0]).returncode == 0, "source commit ancestry")
    owned = []
    for name in SOURCE_NAMES:
        path, relative = HERE / name, (HERE / name).relative_to(REPO).as_posix()
        require(run_git("ls-files", "--error-unmatch", "--", relative).returncode == 0, f"untracked source: {name}")
        blob = run_git("show", f"HEAD:{relative}", binary=True)
        require(blob.returncode == 0 and blob.stdout == path.read_bytes(), f"unpushed source bytes: {name}")
        owned.append(file_record(path))
    return {"head": refs[0], "origin_main": refs[1], "truenas_backup_main": refs[2], "sources": owned}

def records(field: str) -> list[dict[str, Any]]:
    result = []
    for expected in spec()[field]:
        actual = file_record(REPO / expected["path"])
        require(actual == expected, f"{field} drift: {expected['path']}")
        result.append(actual)
    return result

def fail_fast_exact_result(text: str) -> None:
    try:
        ORIGINAL_EXACT_RESULT(text)
    except base.RunnerError as exc:
        raise PermanentTerminalResultFailure(str(exc)) from exc

def row_preflight(row_dir: Path, planned: dict[str, Any], route: dict[str, Any]) -> dict[str, Any]:
    receipt = ORIGINAL_ROW_PREFLIGHT(row_dir, planned, route)
    argv = ORIGINAL_BASE_ARGV(route, planned)
    require("--config" not in argv, "native/default argv forbids config overlay")
    receipt.update({
        "protocol_adapter": "native_default", "config_overlay": None,
        "row_time_budget_seconds": 3600, "expected_argv": argv,
        "dependencies": records("dependencies"), "replay_sources": records("replay_sources"),
        "owned_sources": [file_record(HERE / name) for name in SOURCE_NAMES],
        "reliability_contract": file_record(CONTRACT_PATH), "git_custody": git_custody(),
        "qualification_credit": 0,
    })
    base.atomic_json(row_dir / "omp_preflight.json", receipt)
    return receipt

def verify_receipt(row: dict[str, Any]) -> None:
    receipt = pipeline.load_json(EVIDENCE / row["pass_id"] / row["route_id"] / "omp_preflight.json")
    argv = ORIGINAL_BASE_ARGV(base.route_map()[row["route_id"]], row)
    require(receipt.get("protocol_adapter") == "native_default" and receipt.get("config_overlay") is None, "native/default preflight")
    require("--config" not in receipt.get("expected_argv", []) and receipt.get("expected_argv") == argv, "native argv preflight")
    require(receipt.get("row_time_budget_seconds") == 3600 and receipt.get("qualification_credit") == 0, "budget/credit preflight")
    require(receipt.get("dependencies") == records("dependencies") and receipt.get("replay_sources") == records("replay_sources"), "frozen preflight joins")
    owned = [file_record(HERE / name) for name in SOURCE_NAMES]
    custody = receipt.get("git_custody")
    require(receipt.get("owned_sources") == owned and receipt.get("reliability_contract") == file_record(CONTRACT_PATH), "owned preflight joins")
    require(isinstance(custody, dict) and custody.get("head") == custody.get("origin_main") == custody.get("truenas_backup_main") and custody.get("sources") == owned, "pushed preflight custody")

def generic_journal(reports: list[dict[str, Any]]) -> None:
    verified = sorted((row for report in reports for row in report["rows"]), key=lambda row: row["ordinal"])
    require([row["ordinal"] for row in verified] == list(range(1, len(verified) + 1)), "journal exact ordinal prefix")
    path = EVIDENCE / "launch_journal.jsonl"
    require(path.is_file() and not path.is_symlink(), "launch journal absent")
    journal = pipeline.load_jsonl(path)
    require(path.read_bytes() == pipeline.jsonl_bytes(journal) and len(journal) == len(verified), "canonical journal length")
    previous = ""
    for report, actual in zip(verified, journal, strict=True):
        frozen = rows()[report["ordinal"] - 1]
        require(set(actual) == JOURNAL_FIELDS and actual.get("schema_id") == "pm.r10.storage_pipeline.launch_journal.v2", "journal shape")
        require(all(actual.get(field) == frozen[field] for field in IDENTITY_FIELDS), "journal frozen identity")
        require(all(actual.get(field) == report[field] for field in ("started_at_utc", "launch_sha256", "omp_preflight_sha256", "pid")), "journal report join")
        require(actual.get("popen_observed") is True and isinstance(actual.get("pid"), int) and actual["pid"] > 0, "journal Popen/PID")
        require(actual["started_at_utc"] > previous, "strict launch chronology")
        previous = actual["started_at_utc"]

BINDINGS = (
    (base, "EVIDENCE", EVIDENCE), (base, "plan_rows", rows),
    (base, "row_preflight", row_preflight), (base, "exact_result", fail_fast_exact_result),
    (verify_matrix, "EVIDENCE", EVIDENCE), (verify_matrix, "launch_plan_map", launch_plan_map),
    (verify_matrix, "verify_launch_journal", generic_journal),
)

@contextlib.contextmanager
def installed() -> Iterator[None]:
    require(len(BINDINGS) == 7, "exactly seven adapter bindings")
    originals = [(module, name, getattr(module, name)) for module, name, _value in BINDINGS]
    try:
        for module, name, value in BINDINGS:
            setattr(module, name, value)
        yield
    finally:
        for module, name, value in reversed(originals):
            setattr(module, name, value)

def _prefix() -> dict[str, Any]:
    journal, frozen = base.journal_rows(), rows()
    require(len(journal) <= 5, "at most five journal rows")
    reports: list[dict[str, Any]] = []
    if not journal:
        require(not os.path.lexists(EVIDENCE), "zero prefix requires absent evidence root")
    else:
        routes = base.route_map()
        for row in frozen[:len(journal)]:
            report = verify_matrix.verify_row(row["pass_id"], routes[row["route_id"]])
            require(report.get("status") == "PASS", "fail-stop: prior row is not PASS")
            verify_receipt(row)
            reports.append({"pass_id": row["pass_id"], "rows": [report]})
        verify_matrix.verify_launch_journal(reports)
        verify_matrix.verify_evidence_tree(reports)
        verify_matrix.verify_global_uniqueness(reports)
        for row, report in zip(frozen, (item["rows"][0] for item in reports), strict=False):
            cwd, live = Path(row["cwd"]), base.session_file(Path(row["session_dir"]))
            require(cwd.is_dir() and not cwd.is_symlink() and not any(cwd.iterdir()), "completed cwd remains empty")
            require(live is not None and pipeline.sha256_file(live) == report["raw_primary_sha256"], "persistent/raw session join")
    for row in frozen[len(journal):]:
        leaf = EVIDENCE / row["pass_id"] / row["route_id"]
        require(not os.path.lexists(leaf) and not os.path.lexists(row["cwd"]) and not os.path.lexists(row["session_dir"]), "future row paths absent")
    complete = len(journal) == 5
    return {"status": "PASS_NATIVE_RELIABILITY_5_OF_5_ZERO_CREDIT" if complete else "PASS_NATIVE_RELIABILITY_PREFIX_ZERO_CREDIT", "row_count": len(journal), "required_rows": 5, "reliability_hypothesis_supported": complete, "subject_calls": 0, "qualification_credit": 0}

def verify_prefix() -> dict[str, Any]:
    with installed():
        return _prefix()

def prior_rows() -> Iterator[tuple[Path, dict[str, Any]]]:
    paths = [R10 / f"system_pipeline_sandbox_v{n}" / "launch_plan.json" for n in range(1, 8)]
    paths += [R10 / name / "probe_contract.json" for name in ("omp_tui_probe_001", "muse_owned_xml_probe_v1", "muse_owned_glm_probe_v1", "muse_owned_glm_probe_v2")]
    paths += [R10 / "ox_owned_glm_reliability_v3" / "reliability_contract.json"]
    for path in paths:
        for row in pipeline.load_json(path).get("rows", []):
            yield path.parent, row

def validate_static(*, unused: bool) -> dict[str, Any]:
    contract, frozen = spec(), rows()
    require(contract.get("schema_id") == "pm.r10.storage_pipeline.ox_native_reliability.v1", "native schema")
    require({path.name for path in HERE.iterdir()} in (set(SOURCE_NAMES), {*SOURCE_NAMES, "evidence"}), "package root roster")
    require(all((HERE / name).is_file() and not (HERE / name).is_symlink() for name in SOURCE_NAMES), "four regular owned files")
    require(contract.get("owned_file_roster") == list(SOURCE_NAMES), "contract source roster")
    limits = contract["architecture_limits"]
    metrics = {name: {"lines": len((HERE / name).read_bytes().splitlines()), "bytes": (HERE / name).stat().st_size} for name in SOURCE_NAMES}
    require(metrics["controller.py"]["lines"] <= limits["controller_max_physical_lines"] and metrics["controller.py"]["bytes"] <= limits["controller_max_bytes"], "controller budget")
    require(metrics["selftest.py"]["lines"] <= limits["selftest_max_physical_lines"] and metrics["selftest.py"]["bytes"] <= limits["selftest_max_bytes"], "selftest budget")
    python = [metrics[name] for name in ("controller.py", "selftest.py")]
    require(sum(item["lines"] for item in python) <= limits["all_python_max_physical_lines"] and sum(item["bytes"] for item in python) <= limits["all_python_max_bytes"], "Python budget")
    require(sum(item["lines"] for item in metrics.values()) <= limits["total_max_physical_lines"] and sum(item["bytes"] for item in metrics.values()) <= limits["total_max_bytes"], "total budget")
    require(contract.get("temporary_bindings") == [f"{module.__name__}.{name}" for module, name, _value in BINDINGS], "binding roster/order")
    require(contract.get("sole_behavioral_binding") == "omp_row_runner.exact_result" and len(BINDINGS) == 7, "sole behavior/count")
    require(omp_session.verify_session is ORIGINAL_VERIFY_SESSION and base.expected_argv is ORIGINAL_BASE_ARGV and verify_matrix.expected_argv is ORIGINAL_VERIFY_ARGV and verify_matrix.terminal_result is ORIGINAL_TERMINAL_RESULT, "unmodified V7 interfaces")
    require(records("dependencies") == contract["dependencies"] and records("replay_sources") == contract["replay_sources"], "frozen inputs")
    prompt = V7 / "prompts/omp.prompt.txt"
    require(prompt.stat().st_size == 3036 and pipeline.sha256_file(prompt) == "eff40a61579a080ce6e21bb71bcae2dd0640c100c9d61c199f45ac5dece43638", "unchanged prompt")
    route = base.route_map().get("omp_ox_alpha_free_max")
    require(route == {"id":"omp_ox_alpha_free_max", "surface":"omp_tui", "model":"opencode-go/ox-alpha-free", "thinking":"max"}, "exact Ox route")
    for ordinal, row in enumerate(frozen, 1):
        suffix = row["nonce"][:10]
        require((row["ordinal"], row["pass_id"], row["route_id"]) == (ordinal, f"native_{ordinal:02d}", route["id"]), "row order/route")
        require(row["attempt_id"] == f"ox-native-v1-{ordinal:02d}-{suffix}" and len(row["nonce"]) == 32 and set(row["nonce"]) <= set("0123456789abcdef"), "attempt/nonce")
        require(row["cwd"] == f"/tmp/pm-r10-storage-v7-ox-native-reliability-v1-{ordinal:02d}-{suffix}" and row["session_dir"] == f"/tmp/pm-r10-storage-v7-session-ox-native-reliability-v1-{ordinal:02d}-{suffix}", "runtime paths")
        require(row["evidence_path"] == f"evidence/{row['pass_id']}/{row['route_id']}" and row["prompt_utf8_bytes"] == 3036 and row["prompt_sha256"] == pipeline.sha256_file(prompt), "evidence/prompt")
        argv = ORIGINAL_BASE_ARGV(route, row)
        require("--config" not in argv and argv == ORIGINAL_VERIFY_ARGV(route, row["cwd"], row["session_dir"]), "native argv identity")
    for field in ("attempt_id", "nonce", "cwd", "session_dir", "evidence_path"):
        require(len({row[field] for row in frozen}) == 5, f"unique {field}")
    for root, prior in prior_rows():
        for row in frozen:
            require(all(row[field] != prior.get(field) for field in ("attempt_id", "nonce", "cwd", "session_dir")), "prior identity disjointness")
            require((HERE / row["evidence_path"]).resolve() != (root / prior.get("evidence_path", "")).resolve(), "prior evidence disjointness")
    authority, runtime, sequence = contract["authority"], contract["runtime"], contract["sequencing"]
    raw = authority["user_text_utf8"].encode()
    require(authority.get("source_thread_id") == "01a034b9-a1c8-7a80-937f-4e45e3f2ae45" and len(raw) == 69 and pipeline.sha256_bytes(raw) == "99df1f43d62da6ae6314c385f43208ac159374deed46c8b16382d3c9909d54e8", "authority bytes")
    require(runtime["protocol_adapter"] == "native_default" and runtime["config_overlay_present"] is False and runtime["config_flag_allowed"] is False and runtime["execution_host"] == "linux_isolated_profile_only", "native runtime")
    require(runtime["row_time_budget_seconds"] == 3600 and runtime["advisor_enabled"] is False and runtime["task_agent_advisor"] == {"task":"off"} and runtime["ordinary_tools_enabled"] is False and runtime["normal_exit_required"] is True, "runtime freeze")
    require(sequence["required_passes"] == sequence["required_rows"] == 5 and sequence["all_rows_count"] is True and sequence["fail_stop_on_first_failure_or_custody_mismatch"] is True and sequence["non_ox_mechanically_launchable_route_count"] == 0, "denominator")
    require(pipeline.preflight_inputs()["status"] == "PASS" and pipeline.omp_runtime_preflight()["status"] == "PASS_OMP_RUNTIME", "V7 preflights")
    require(pipeline.verify()["status"] == "PASS_VERIFIED_NO_WORKNODES" and freeze_check.verify_freeze()["status"] == "PASS_FROZEN_ZERO_SUBJECT", "V7 freeze")
    if unused:
        require(not os.path.lexists(EVIDENCE), "unused evidence absent")
        require(all(not os.path.lexists(row[field]) for row in frozen for field in ("cwd", "session_dir")), "unused runtime paths absent")
    return {"status":"PASS_LOCAL_NATIVE_ARCHITECTURE", "rows":5, "temporary_bindings":7, "metrics":metrics, "subject_calls":0, "qualification_credit":0}

def require_authority() -> None:
    authority = spec()["authority"]
    require(authority.get("all_five_current_rows_authorized_after_pushed_custody") is True, "five-row authority")
    require(authority.get("non_ox_or_paid_route_authorized") is False, "authority route ceiling")

def exact_reservation(row: dict[str, Any]) -> bool:
    path = EVIDENCE / row["pass_id"] / row["route_id"] / "reservation.json"
    if not path.is_file() or path.is_symlink():
        return False
    try:
        value = pipeline.load_json(path)
    except (OSError, ValueError, TypeError, KeyError, pipeline.PipelineError):
        return False
    return value.get("schema_id") == "pm.r10.storage_pipeline.reservation.v2" and all(value.get(field) == row[field] for field in IDENTITY_FIELDS)

def preserve_postfailure(row: dict[str, Any]) -> None:
    row_dir, session_dir = EVIDENCE / row["pass_id"] / row["route_id"], Path(row["session_dir"])
    source = base.session_file(session_dir) if session_dir.is_dir() else None
    if source is not None:
        pipeline.atomic_write(row_dir / "postfailure_session.raw.jsonl", source.read_bytes())

ERRORS = (ControllerError, PermanentTerminalResultFailure, base.RunnerError, omp_session.OmpSessionError, pipeline.PipelineError, subprocess.SubprocessError, OSError, ValueError, KeyError, TypeError, AssertionError)

def dispatch(argv: list[str] | None = None) -> int:
    parser = argparse.ArgumentParser()
    parser.add_argument("command", choices=("lint", "verify-prefix", "run"))
    parser.add_argument("ordinal", nargs="?", type=int, choices=range(1, 6))
    parser.add_argument("--max-seconds", type=int, default=3600)
    args = parser.parse_args(argv)
    try:
        require((args.command == "run") == (args.ordinal is not None), "ordinal only for run")
        static = validate_static(unused=args.command == "lint")
        if args.command == "lint":
            print(pipeline.canonical_json({"status":"PASS_ZERO_SUBJECT_LINT", **static})); return 0
        if args.command == "verify-prefix":
            print(pipeline.canonical_json(verify_prefix())); return 0
        require(args.max_seconds == 3600, "frozen 3600-second row budget")
        require_authority(); git_custody()
        row = rows()[args.ordinal - 1]
        with installed():
            prefix = _prefix()
            require(prefix["row_count"] == args.ordinal - 1 and prefix["row_count"] < 5, "only next ordinal may launch")
            try:
                terminal = base.run_row(row["pass_id"], row["route_id"], 3600)
                print(pipeline.canonical_json({"status":"PASS_ROW_ZERO_CREDIT", "ordinal":args.ordinal, "terminal":terminal, "qualification_credit":0})); return 0
            except base.ReservationConflict as exc:
                print(pipeline.canonical_json({"status":"FAIL_ALREADY_CONSUMED_NO_MUTATION", "error":f"{type(exc).__name__}: {exc}", "qualification_credit":0})); return 1
            except ERRORS as exc:
                if not exact_reservation(row):
                    raise
                try:
                    preserve_postfailure(row)
                except ERRORS as preserve_exc:
                    exc = ControllerError(f"{type(exc).__name__}: {exc}; postfailure preserve: {type(preserve_exc).__name__}: {preserve_exc}")
                base.record_failure(row["pass_id"], row["route_id"], exc)
                print(pipeline.canonical_json({"status":"FAIL_NATIVE_ROW_CONSUMED_STOP_ALL_REMAINING", "ordinal":args.ordinal, "error":f"{type(exc).__name__}: {exc}", "qualification_credit":0})); return 1
    except ERRORS as exc:
        print(pipeline.canonical_json({"status":"FAIL_PRELAUNCH_NO_MUTATION", "error":f"{type(exc).__name__}: {exc}", "qualification_credit":0})); return 1

if __name__ == "__main__":
    raise SystemExit(dispatch())
