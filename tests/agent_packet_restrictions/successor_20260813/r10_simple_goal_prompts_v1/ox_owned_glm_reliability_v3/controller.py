#!/usr/bin/env python3
"""Thin five-row Ox/GLM controller over the unchanged V7 transport and verifier."""

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

import glm_projection  # noqa: E402


CONTRACT_PATH = HERE / "reliability_contract.json"
OVERLAY = HERE / "tools_glm.config.yml"
EVIDENCE = HERE / "evidence"
SOURCE_NAMES = (
    "README.md", "reliability_contract.json", "controller.py",
    "glm_projection.py", "selftest.py", "tools_glm.config.yml",
)
IDENTITY_FIELDS = ("ordinal", "pass_id", "route_id", "attempt_id", "nonce")
JOURNAL_FIELDS = {
    "schema_id", *IDENTITY_FIELDS, "started_at_utc", "launch_sha256",
    "omp_preflight_sha256", "popen_observed", "pid",
}


class ControllerError(RuntimeError):
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


def route_map() -> dict[str, dict[str, Any]]:
    routes = pipeline.load_json(V7 / "matrix.json")["ordered_routes"]
    route = [row for row in routes if row["id"] == "omp_ox_alpha_free_max"]
    require(len(route) == 1, "one frozen Ox route")
    return {route[0]["id"]: route[0]}


def planned_row(pass_id: str, route_id: str) -> dict[str, Any]:
    matches = [row for row in rows() if (row["pass_id"], row["route_id"]) == (pass_id, route_id)]
    require(len(matches) == 1, "one planned reliability row")
    return matches[0]


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
    records = []
    for name in SOURCE_NAMES:
        path = HERE / name
        relative = path.relative_to(REPO).as_posix()
        require(run_git("ls-files", "--error-unmatch", "--", relative).returncode == 0, f"untracked source: {name}")
        blob = run_git("show", f"HEAD:{relative}", binary=True)
        require(blob.returncode == 0 and blob.stdout == path.read_bytes(), f"unpushed source bytes: {name}")
        records.append(file_record(path))
    return {"head": refs[0], "origin_main": refs[1], "truenas_backup_main": refs[2], "sources": records}


def dependency_records() -> list[dict[str, Any]]:
    result = []
    for expected in spec()["dependencies"]:
        path = REPO / expected["path"]
        actual = file_record(path)
        require(actual == expected, f"dependency drift: {expected['path']}")
        result.append(actual)
    return result


ORIGINAL_EXPECTED_ARGV = base.expected_argv


def expected_argv(route: dict[str, Any], planned: dict[str, Any]) -> list[str]:
    argv = ORIGINAL_EXPECTED_ARGV(route, planned)
    return [argv[0], "--config", str(OVERLAY), *argv[1:]]


def verifier_argv(route: dict[str, Any], cwd: str, session_dir: str) -> list[str]:
    matches = [row for row in rows() if row["cwd"] == cwd and row["session_dir"] == session_dir]
    require(len(matches) == 1, "argv row identity")
    return expected_argv(route, matches[0])


ORIGINAL_ROW_PREFLIGHT = base.row_preflight


def row_preflight(row_dir: Path, planned: dict[str, Any], route: dict[str, Any]) -> dict[str, Any]:
    receipt = ORIGINAL_ROW_PREFLIGHT(row_dir, planned, route)
    receipt.update({
        "tools_format_requested": "glm", "row_time_budget_seconds": 3600,
        "overlay": file_record(OVERLAY), "expected_argv": expected_argv(route, planned),
        "dependencies": dependency_records(), "owned_sources": [file_record(HERE / name) for name in SOURCE_NAMES],
        "reliability_contract": file_record(CONTRACT_PATH), "git_custody": git_custody(),
        "qualification_credit": 0,
    })
    base.atomic_json(row_dir / "omp_preflight.json", receipt)
    return receipt


def verify_receipt(row: dict[str, Any]) -> None:
    path = EVIDENCE / row["pass_id"] / row["route_id"] / "omp_preflight.json"
    receipt = pipeline.load_json(path)
    require(receipt.get("tools_format_requested") == "glm" and receipt.get("row_time_budget_seconds") == 3600, "GLM/budget preflight")
    require(receipt.get("overlay") == file_record(OVERLAY), "overlay preflight join")
    require(receipt.get("expected_argv") == expected_argv(route_map()[row["route_id"]], row), "argv preflight join")
    require(receipt.get("dependencies") == dependency_records(), "dependency preflight join")
    require(receipt.get("owned_sources") == [file_record(HERE / name) for name in SOURCE_NAMES], "source preflight join")
    custody = receipt.get("git_custody")
    require(isinstance(custody, dict) and set(custody) == {"head","origin_main","truenas_backup_main","sources"} and isinstance(custody.get("head"), str) and len(custody["head"]) == 40 and custody["head"] == custody.get("origin_main") == custody.get("truenas_backup_main"), "pushed preflight custody")
    require(custody.get("sources") == receipt.get("owned_sources") and receipt.get("reliability_contract") == file_record(CONTRACT_PATH) and receipt.get("qualification_credit") == 0, "pushed source/contract receipt join")


def generic_journal(reports: list[dict[str, Any]]) -> None:
    verified = sorted((row for report in reports for row in report["rows"]), key=lambda row: row["ordinal"])
    require([row["ordinal"] for row in verified] == list(range(1, len(verified) + 1)), "journal reports exact ordinal prefix")
    path = EVIDENCE / "launch_journal.jsonl"
    require(path.is_file() and not path.is_symlink(), "launch journal absent")
    journal = pipeline.load_jsonl(path)
    require(path.read_bytes() == pipeline.jsonl_bytes(journal) and len(journal) == len(verified), "exact canonical journal length")
    previous = ""
    for report, actual in zip(verified, journal, strict=True):
        frozen = rows()[report["ordinal"] - 1]
        require(set(actual) == JOURNAL_FIELDS and actual.get("schema_id") == "pm.r10.storage_pipeline.launch_journal.v2", "journal shape/schema")
        for field in IDENTITY_FIELDS:
            require(actual.get(field) == frozen[field], f"journal frozen join: {field}")
        for field in ("started_at_utc", "launch_sha256", "omp_preflight_sha256", "pid"):
            require(actual.get(field) == report[field], f"journal report join: {field}")
        require(actual.get("popen_observed") is True and isinstance(actual.get("pid"), int) and actual["pid"] > 0, "journal Popen/PID")
        require(actual["started_at_utc"] > previous, "strict launch chronology")
        previous = actual["started_at_utc"]


BINDINGS = (
    (omp_session, "verify_session", glm_projection.verify_session),
    (base, "EVIDENCE", EVIDENCE), (base, "route_map", route_map), (base, "plan_rows", rows),
    (base, "planned_row", planned_row), (base, "expected_argv", expected_argv), (base, "row_preflight", row_preflight),
    (verify_matrix, "EVIDENCE", EVIDENCE), (verify_matrix, "launch_plan_map", launch_plan_map),
    (verify_matrix, "expected_argv", verifier_argv), (verify_matrix, "verify_launch_journal", generic_journal),
)


@contextlib.contextmanager
def installed() -> Iterator[None]:
    require(len(BINDINGS) == 11, "exactly eleven adapter bindings")
    originals = [(module, name, getattr(module, name)) for module, name, _value in BINDINGS]
    try:
        for module, name, value in BINDINGS:
            setattr(module, name, value)
        yield
    finally:
        for module, name, value in reversed(originals):
            setattr(module, name, value)


def _prefix() -> dict[str, Any]:
    journal = base.journal_rows()
    require(len(journal) <= 5, "at most five journal rows")
    frozen = rows()
    if not journal:
        require(not os.path.lexists(EVIDENCE), "zero prefix requires absent evidence root")
        reports: list[dict[str, Any]] = []
    else:
        reports = []
        for row in frozen[: len(journal)]:
            report = verify_matrix.verify_row(row["pass_id"], route_map()[row["route_id"]])
            require(report.get("status") == "PASS", "fail-stop: prior row is not PASS")
            verify_receipt(row)
            reports.append({"pass_id": row["pass_id"], "rows": [report]})
        verify_matrix.verify_launch_journal(reports)
        verify_matrix.verify_evidence_tree(reports)
        verify_matrix.verify_global_uniqueness(reports)
        for row, report in zip(frozen, (item["rows"][0] for item in reports), strict=False):
            cwd, session_dir = Path(row["cwd"]), Path(row["session_dir"])
            require(cwd.is_dir() and not cwd.is_symlink() and not any(cwd.iterdir()), "completed cwd remains empty")
            live = base.session_file(session_dir)
            require(live is not None and pipeline.sha256_file(live) == report["raw_primary_sha256"], "persistent/raw session join")
    for row in frozen[len(journal) :]:
        leaf = EVIDENCE / row["pass_id"] / row["route_id"]
        require(not os.path.lexists(leaf) and not os.path.lexists(row["cwd"]) and not os.path.lexists(row["session_dir"]), "future row paths absent")
    complete = len(journal) == 5
    return {"status": "PASS_RELIABILITY_5_OF_5_ZERO_CREDIT" if complete else "PASS_RELIABILITY_PREFIX_ZERO_CREDIT", "row_count": len(journal), "required_rows": 5, "reliability_hypothesis_supported": complete, "subject_calls": 0, "qualification_credit": 0}


def verify_prefix() -> dict[str, Any]:
    with installed():
        return _prefix()


def prior_rows() -> Iterator[tuple[Path, dict[str, Any]]]:
    paths = [R10 / f"system_pipeline_sandbox_v{n}" / "launch_plan.json" for n in range(1, 8)]
    paths += [R10 / name / "probe_contract.json" for name in ("muse_owned_xml_probe_v1", "muse_owned_glm_probe_v1", "muse_owned_glm_probe_v2")]
    for path in paths:
        value = pipeline.load_json(path)
        for row in value["rows"]:
            yield path.parent, row


def validate_static(*, unused: bool) -> dict[str, Any]:
    contract = spec()
    require(contract.get("schema_id") == "pm.r10.storage_pipeline.owned_glm_ox_reliability.simple.v3", "simple architecture schema")
    require({path.name for path in HERE.iterdir()} in (set(SOURCE_NAMES), {*SOURCE_NAMES, "evidence"}), "package root roster")
    require(set(path.name for path in HERE.iterdir() if path.is_file() or path.is_symlink()) == set(SOURCE_NAMES), "exact six-file package roster")
    require(all((HERE / name).is_file() and not (HERE / name).is_symlink() for name in SOURCE_NAMES), "six regular owned files")
    require(contract.get("owned_file_roster") == list(SOURCE_NAMES), "contract six-file roster")
    require(contract.get("temporary_bindings") == [f"{module.__name__}.{name}" for module, name, _value in BINDINGS], "contract binding roster/order")
    require(OVERLAY.read_bytes() == b"tools:\n  format: glm\n" and file_record(OVERLAY)["sha256"] == "f1dfc8269d8f9e495d944f5319fbc6737339a27afe6445b64a50d1e5556995f9", "exact GLM overlay")
    require(dependency_records() == contract["dependencies"], "dependency freeze")
    prompt = V7 / "prompts" / "omp.prompt.txt"
    require(prompt.stat().st_size == 3036 and pipeline.sha256_file(prompt) == "eff40a61579a080ce6e21bb71bcae2dd0640c100c9d61c199f45ac5dece43638", "unchanged prompt")
    frozen = rows()
    for ordinal, row in enumerate(frozen, 1):
        suffix = row["nonce"][:10]
        require(row["ordinal"] == ordinal and row["pass_id"] == f"reliability_{ordinal:02d}" and row["route_id"] == "omp_ox_alpha_free_max", "row order/route")
        require(row["model"] == "opencode-go/ox-alpha-free" and row["thinking"] == "max" and row["surface"] == "omp_tui", "Ox/max tuple")
        require(row["attempt_id"] == f"ox-glm-v3-{ordinal:02d}-{suffix}" and len(row["nonce"]) == 32 and all(character in "0123456789abcdef" for character in row["nonce"]), "attempt/nonce join")
        require(row["cwd"] == f"/tmp/pm-r10-storage-v7-ox-glm-reliability-v3-{ordinal:02d}-{suffix}" and row["session_dir"] == f"/tmp/pm-r10-storage-v7-session-ox-glm-reliability-v3-{ordinal:02d}-{suffix}", "runtime identity join")
        require(row["prompt_utf8_bytes"] == 3036 and row["prompt_sha256"] == pipeline.sha256_file(prompt), "row prompt freeze")
        require(row["evidence_path"] == f"evidence/{row['pass_id']}/{row['route_id']}", "evidence identity")
    for field in ("attempt_id", "nonce", "cwd", "session_dir", "evidence_path"):
        require(len({row[field] for row in frozen}) == 5, f"unique current {field}")
    for root, prior in prior_rows():
        for row in frozen:
            require(all(row[field] != prior.get(field) for field in ("attempt_id", "nonce", "cwd", "session_dir")), "prior identity disjointness")
            require((HERE / row["evidence_path"]).resolve() != (root / prior["evidence_path"]).resolve(), "prior evidence disjointness")
    authority = contract["authority"]
    raw = authority["user_text_utf8"].encode()
    require(authority.get("source_thread_id") == "01a034b9-a1c8-7a80-937f-4e45e3f2ae45" and len(raw) == 69 and pipeline.sha256_bytes(raw) == "99df1f43d62da6ae6314c385f43208ac159374deed46c8b16382d3c9909d54e8", "standing authority thread/bytes")
    runtime, sequencing = contract["runtime"], contract["sequencing"]
    require(runtime["row_time_budget_seconds"] == 3600 and runtime["advisor_enabled"] is False and runtime["task_agent_advisor"] == {"task":"off"} and runtime["ordinary_tools_enabled"] is False and runtime["normal_exit_required"] is True and sequencing["required_passes"] == sequencing["required_rows"] == 5 and sequencing["all_rows_count"] is True and sequencing["fail_stop_on_first_failure_or_custody_mismatch"] is True and sequencing["non_ox_mechanically_launchable_route_count"] == 0, "runtime/denominator freeze")
    require(pipeline.verify()["status"] == "PASS_VERIFIED_NO_WORKNODES" and freeze_check.verify_freeze()["status"] == "PASS_FROZEN_ZERO_SUBJECT", "V7 frozen pipeline")
    if unused:
        require(not os.path.lexists(EVIDENCE), "unused evidence absent")
        for row in frozen:
            require(not os.path.lexists(row["cwd"]) and not os.path.lexists(row["session_dir"]), "unused runtime paths absent")
    return {"status": "PASS_LOCAL_SIMPLE_ARCHITECTURE", "rows": 5, "temporary_bindings": len(BINDINGS), "subject_calls": 0, "qualification_credit": 0}
def require_authority() -> None:
    authority = spec()["authority"]
    require(authority.get("all_five_current_rows_authorized_after_pushed_custody") is True, "five-row authority closed")
    require(authority.get("muse_cursor_codex_qwen_or_paid_route_authorized") is False and authority.get("further_dialect_authorized") is False, "authority route ceiling")


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


ERRORS = (ControllerError, base.RunnerError, omp_session.OmpSessionError, pipeline.PipelineError, subprocess.SubprocessError, OSError, ValueError, KeyError, TypeError, AssertionError)


def dispatch(argv: list[str] | None = None) -> int:
    parser = argparse.ArgumentParser()
    parser.add_argument("command", choices=("lint", "verify-prefix", "run"))
    parser.add_argument("ordinal", nargs="?", type=int, choices=range(1, 6))
    parser.add_argument("--max-seconds", type=int, default=3600)
    args = parser.parse_args(argv)
    try:
        require((args.command == "run") == (args.ordinal is not None), "ordinal only for run")
        validate_static(unused=args.command == "lint")
        if args.command == "lint":
            print(pipeline.canonical_json({"status": "PASS_ZERO_SUBJECT_LINT", "subject_calls": 0}))
            return 0
        if args.command == "verify-prefix":
            print(pipeline.canonical_json(verify_prefix()))
            return 0
        require(args.max_seconds == 3600, "frozen 3600-second row budget")
        require_authority()
        git_custody()
        row = rows()[args.ordinal - 1]
        with installed():
            prefix = _prefix()
            require(prefix["row_count"] == args.ordinal - 1 and prefix["row_count"] < 5, "only next ordinal may launch")
            try:
                terminal = base.run_row(row["pass_id"], row["route_id"], 3600)
                print(pipeline.canonical_json({"status": "PASS_ROW_ZERO_CREDIT", "ordinal": args.ordinal, "terminal": terminal, "qualification_credit": 0}))
                return 0
            except base.ReservationConflict as exc:
                print(pipeline.canonical_json({"status": "FAIL_ALREADY_CONSUMED_NO_MUTATION", "error": f"{type(exc).__name__}: {exc}", "qualification_credit": 0}))
                return 1
            except ERRORS as exc:
                if not exact_reservation(row):
                    raise
                try: preserve_postfailure(row)
                except ERRORS as preserve_exc: exc = ControllerError(f"{type(exc).__name__}: {exc}; postfailure preserve: {type(preserve_exc).__name__}: {preserve_exc}")
                base.record_failure(row["pass_id"], row["route_id"], exc)
                print(pipeline.canonical_json({"status": "FAIL_RELIABILITY_ROW_CONSUMED_STOP_ALL_REMAINING", "ordinal": args.ordinal, "error": f"{type(exc).__name__}: {exc}", "qualification_credit": 0}))
                return 1
    except ERRORS as exc:
        print(pipeline.canonical_json({"status": "FAIL_PRELAUNCH_NO_MUTATION", "error": f"{type(exc).__name__}: {exc}", "qualification_credit": 0}))
        return 1


if __name__ == "__main__":
    raise SystemExit(dispatch())
