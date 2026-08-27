#!/usr/bin/env python3
"""Thin 24-row normalized Storage matrix adapter over pushed V2/V5/V7 code."""
from __future__ import annotations

import argparse
import contextlib
import copy
import importlib.util
import os
import re
import stat
import subprocess
import sys
from pathlib import Path
from typing import Any, Iterator

HERE = Path(__file__).resolve().parent
R10 = HERE.parent
REPO = HERE.parents[4]
V7 = R10 / "system_pipeline_sandbox_v7"
V2 = R10 / "storage_native_matrix_v2"
V5 = R10 / "storage_glm53_max_normalized_canary_v5"
NORMALIZER = R10 / "storage_glm53_normalized_canary_v2/result_normalizer.py"
for _path in (V2, V7):
    sys.path.insert(0, str(_path))

def _load(name: str, path: Path) -> Any:
    spec = importlib.util.spec_from_file_location(name, path)
    if spec is None or spec.loader is None:
        raise RuntimeError(f"module unavailable: {path}")
    module = importlib.util.module_from_spec(spec)
    sys.modules[name] = module
    spec.loader.exec_module(module)
    return module

M = _load("storage_native_matrix_v2_base", V2 / "controller.py")
G = _load("storage_glm53_max_canary_v5_base", V5 / "controller.py")
P, V, base, omp_session, freeze_check = M.P, M.V, M.base, M.omp_session, M.freeze_check
N = G._normalizer
CONTRACT = HERE / "matrix_contract.json"
EVIDENCE = HERE / "evidence"
SOURCES = ("README.md", "matrix_contract.json", "controller.py", "selftest.py")
IDENTITY = ("ordinal", "pass_id", "route_id", "attempt_id", "nonce")
GLM_ROUTE = "omp_glm53_flash_max"
ENV_FIELDS = tuple(G.ENV_PATHS.values())
ORIGINAL_CODEX_RAW = V.verify_codex_raw
ORIGINAL_APP_WRITE = M.app.write_terminal
ORIGINAL_APP_DIRECT = M.app.verify_direct_evidence
ORIGINAL_APP_APPEND = M.append_app_journal
ISSUED = "create_request_issued.json"
CURRENT_ROW: dict[str, Any] | None = None
DISPATCH_CUSTODY: dict[str, Any] | None = None
class MatrixError(RuntimeError):
    pass
class PermanentMatrixError(RuntimeError):
    pass
class AlreadyIssuedNoMutation(RuntimeError): pass
def require(value: bool, message: str) -> None:
    if not value:
        raise MatrixError(message)
def permanent(value: bool, message: str) -> None:
    if not value:
        raise PermanentMatrixError(message)
def spec() -> dict[str, Any]:
    value = P.load_json(CONTRACT)
    require(isinstance(value, dict), "contract object")
    return value
def rows() -> list[dict[str, Any]]:
    value = spec().get("rows")
    require(isinstance(value, list) and len(value) == 24, "24 frozen rows")
    return value
def route_map() -> dict[str, dict[str, Any]]:
    routes = spec().get("routes")
    require(isinstance(routes, list) and len(routes) == 12, "12 routes")
    return {route["id"]: route for route in routes}
def launch_plan_map() -> dict[tuple[str, str], dict[str, Any]]:
    return {(row["pass_id"], row["route_id"]): row for row in rows()}
def planned_row(pass_id: str, route_id: str) -> dict[str, Any]:
    matches = [row for row in rows() if row["pass_id"] == pass_id and row["route_id"] == route_id]
    require(len(matches) == 1, "one planned row")
    return matches[0]
def selected_row() -> dict[str, Any]:
    require(CURRENT_ROW is not None, "selected row")
    return CURRENT_ROW
def row_dir(row: dict[str, Any] | None = None) -> Path:
    item = row or selected_row()
    return EVIDENCE / item["pass_id"] / item["route_id"]
def file_record(path: Path, root: Path = REPO) -> dict[str, Any]:
    require(path.is_file() and not path.is_symlink(), f"regular file: {path}")
    return {"path": path.relative_to(root).as_posix(), "bytes": path.stat().st_size, "sha256": P.sha256_file(path)}
def expected_records(field: str, root: Path = REPO) -> list[dict[str, Any]]:
    result = []
    for expected in spec()[field]:
        path = root / expected["path"]
        actual = file_record(path, root)
        require(actual == expected, f"{field} drift: {expected['path']}")
        result.append(actual)
    return result
def run_git(*args: str, binary: bool = False) -> subprocess.CompletedProcess[Any]:
    return subprocess.run(["git", "-C", str(REPO), *args], check=False, capture_output=True, text=not binary)
def git_entry(relative: str, *, index: bool) -> tuple[str, str]:
    result = run_git(*( ("ls-files", "--stage", "--", relative) if index else ("ls-tree", "HEAD", "--", relative) ))
    lines = result.stdout.splitlines()
    require(result.returncode == 0 and len(lines) == 1, f"one Git entry: {relative}")
    metadata, seen = lines[0].split("\t", 1)
    fields = metadata.split()
    require(seen == relative and len(fields) == 3, f"Git entry shape: {relative}")
    if index:
        require(fields[2] == "0", f"stage zero: {relative}")
        return fields[0], fields[1]
    require(fields[1] == "blob", f"HEAD blob: {relative}")
    return fields[0], fields[2]

def git_file(relative: str) -> dict[str, Any]:
    path = REPO / relative
    current = REPO
    for part in Path(relative).parts[:-1]:
        current /= part
        require(current.is_dir() and not current.is_symlink(), f"nonsymlink parent: {relative}")
    mode = path.lstat().st_mode
    require(stat.S_ISREG(mode) and not path.is_symlink(), f"regular Git file: {relative}")
    index, head = git_entry(relative, index=True), git_entry(relative, index=False)
    require(index == head and head[0] in {"100644", "100755"}, f"index/HEAD join: {relative}")
    blob = run_git("cat-file", "blob", head[1], binary=True)
    require(blob.returncode == 0 and blob.stdout == path.read_bytes(), f"live/HEAD bytes: {relative}")
    require(bool(mode & 0o111) == (head[0] == "100755"), f"live/HEAD mode: {relative}")
    record = file_record(path)
    record.update(git_mode=head[0], git_oid=head[1])
    return record

def git_custody() -> dict[str, Any]:
    refs = [run_git("rev-parse", ref) for ref in ("HEAD", "origin/main", "truenas-backup/main")]
    values = [result.stdout.strip() for result in refs]
    require(all(result.returncode == 0 for result in refs) and all(len(value) == 40 for value in values), "Git refs")
    require(values[0] == values[1] == values[2], "dual-pushed candidate")
    owned = [git_file((HERE / name).relative_to(REPO).as_posix()) for name in SOURCES]
    dependencies = [git_file(record["path"]) for record in spec()["dependencies"]]
    require([{key: item[key] for key in ("path", "bytes", "sha256")} for item in dependencies] == spec()["dependencies"], "dependency custody")
    return {"candidate_commit": values[0], "head": values[0], "origin_main": values[1], "truenas_backup_main": values[2], "sources": owned, "dependencies": dependencies}

def runtime_paths(row: dict[str, Any]) -> list[str]:
    fields = ("cwd", "session_dir", "profile_dir", "private_capture_dir", *ENV_FIELDS)
    return [row[field] for field in fields if row.get(field)]

def historical_identity_clean(frozen: list[dict[str, Any]]) -> None:
    needles = []
    for row in frozen:
        needles.extend(str(row[field]).encode() for field in ("attempt_id", "nonce", "cwd", "session_dir", "profile_dir", "private_capture_dir", *ENV_FIELDS, "projectless_directory_name") if row.get(field))
    require(len(needles) == len(set(needles)), "globally unique planned identities")
    for path in R10.rglob("*.json"):
        if HERE in path.parents:
            continue
        raw = path.read_bytes()
        require(not any(needle in raw for needle in needles), f"historical identity reuse: {path}")

def metric(path: Path) -> dict[str, int]:
    return {"lines": len(path.read_bytes().splitlines()), "bytes": path.stat().st_size}

def verified_authority() -> dict[str, Any]:
    authority, frozen = spec()["authority"], rows()
    require(P.sha256_bytes(P.canonical_json(authority).encode()) == "d85ef64da68aed67ec403263f04c0b1d6f471707271215b0fb2a9d37b1dd368f", "closed post-canary authority")
    require(authority["authorized_attempt_ids"] == [row["attempt_id"] for row in frozen] and authority["authorized_passes"] == ["pass_01", "pass_02"] and authority["authorized_row_count"] == 24, "exact authorized rows")
    require(P.sha256_bytes(P.canonical_json(frozen).encode()) == authority["authorized_rows_canonical_sha256"] and P.sha256_bytes(P.canonical_json(authority["authorized_attempt_ids"]).encode()) == authority["authorized_attempt_ids_canonical_sha256"], "authorized identity digests")
    canary = authority["v5_canary_pass"]; keys = ("terminal", "launch_journal", "session", "session_prefix", "submission_acceptance", "omp_preflight", "launch", "http_final_receipt", "structural_projection", "normalized_projection")
    require(all(file_record(REPO / canary[key]["path"]) == canary[key] for key in keys), "V5 authority receipts")
    terminal = P.load_json(REPO / canary["terminal"]["path"]); leaf = (REPO / canary["terminal"]["path"]).parent
    require(all(terminal[key] == value for key, value in {"status": "PASS", "attempt_id": canary["attempt_id"], "nonce": canary["nonce"], "model": canary["model"], "thinking": canary["thinking"], "goal_activation_observed": True, "goal_complete_observed": True, "process_exit_code": 0, "no_retry": True, "qualification_credit": 0}.items()), "V5 terminal PASS")
    require(len(terminal["evidence"]) == canary["terminal_evidence_join_count"] == 18 and all(file_record(leaf / item["path"], leaf) == item for item in terminal["evidence"]), "V5 terminal evidence joins")
    journal = P.load_jsonl(REPO / canary["launch_journal"]["path"]); require(len(journal) == 1 and all(journal[0][key] == value for key, value in {"ordinal": 1, "pass_id": "pass_01", "route_id": "omp_glm53_flash_max", "attempt_id": canary["attempt_id"], "nonce": canary["nonce"], "popen_observed": True, "omp_preflight_sha256": canary["omp_preflight"]["sha256"], "launch_sha256": canary["launch"]["sha256"]}.items()) and type(journal[0]["pid"]) is int, "V5 journal join")
    prefix = P.canonical_json(canary["prefix_verification"]).encode(); require((len(prefix), P.sha256_bytes(prefix)) == (canary["prefix_verification_utf8_bytes"], canary["prefix_verification_sha256"]), "V5 prefix PASS")
    return authority

class AppEvidencePath(type(Path())):
    def iterdir(self) -> Iterator[Path]:
        return (path for path in super().iterdir() if path.name != ISSUED)

def verify_issued(directory: Path, row: dict[str, Any], custody: dict[str, Any]) -> dict[str, Any]:
    path = directory / ISSUED; require(path.is_file() and not path.is_symlink(), "immutable create issuance marker")
    value, request = P.load_json(path), M.app.create_request(row, (V7 / "prompts/codex.prompt.txt").read_text()); raw = (P.canonical_json(request) + "\n").encode()
    require(set(value) == {"schema_id", *IDENTITY, "issued_at_utc", "request", "request_utf8_bytes", "request_sha256", "git_custody"} and value["schema_id"] == "pm.r10.storage_pipeline.codex_create_request_issued.v1", "issuance marker shape")
    require(all(value[key] == row[key] for key in IDENTITY) and value["request"] == request and (value["request_utf8_bytes"], value["request_sha256"]) == (len(raw), P.sha256_bytes(raw)) and value["git_custody"] == custody, "issuance marker joins")
    launch = P.load_json(directory / "launch.json"); record = file_record(path, directory)
    require(launch.get("create_request_issued") == record and launch.get("git_custody") == custody and V.parse_utc(launch["started_at_utc"]) <= V.parse_utc(value["issued_at_utc"]), "issuance launch/time join")
    return {"record": record, "request": request, "value": value}

def atomic_issue(path: Path, raw: bytes) -> None:
    if os.path.lexists(path): raise AlreadyIssuedNoMutation("ALREADY_ISSUED_NO_MUTATION")
    temporary = path.with_name(f".{ISSUED}.{os.getpid()}.{id(raw)}.tmp"); require(not os.path.lexists(temporary), "fresh issuance temporary")
    P.atomic_write(temporary, raw)
    try:
        try: os.link(temporary, path, follow_symlinks=False)
        except FileExistsError as exc: raise AlreadyIssuedNoMutation("ALREADY_ISSUED_NO_MUTATION") from exc
    finally:
        if os.path.lexists(temporary): os.unlink(temporary)

def issue_create(directory: Path, row: dict[str, Any], custody: dict[str, Any]) -> dict[str, Any]:
    path = directory / ISSUED
    require(git_custody() == custody, "custody at create issuance"); request = M.app.create_request(row, (V7 / "prompts/codex.prompt.txt").read_text()); raw = (P.canonical_json(request) + "\n").encode()
    value = {"schema_id": "pm.r10.storage_pipeline.codex_create_request_issued.v1", **{key: row[key] for key in IDENTITY}, "issued_at_utc": base.utc_now(), "request": request, "request_utf8_bytes": len(raw), "request_sha256": P.sha256_bytes(raw), "git_custody": custody}
    atomic_issue(path, P.pretty_json(value)); launch = P.load_json(directory / "launch.json"); require("create_request_issued" not in launch, "one launch issuance join")
    launch["create_request_issued"] = file_record(path, directory); P.atomic_write(directory / "launch.json", P.pretty_json(launch)); verify_issued(directory, row, custody)
    return request

def emittable_create(directory: Path, row: dict[str, Any], custody: dict[str, Any]) -> str:
    closed = (directory / "terminal.json", directory / "runner_failure.json")
    if any(os.path.lexists(path) for path in closed): raise AlreadyIssuedNoMutation("ALREADY_TERMINAL_NO_MUTATION")
    issued = verify_issued(directory, row, custody); payload = P.canonical_json(issued["request"]) + "\n"
    if any(os.path.lexists(path) for path in closed): raise AlreadyIssuedNoMutation("ALREADY_TERMINAL_NO_MUTATION")
    return payload

def app_append_journal(row: dict[str, Any], directory: Path) -> None:
    ORIGINAL_APP_APPEND(row, directory); journal = P.load_jsonl(EVIDENCE / "launch_journal.jsonl"); issued = verify_issued(directory, row, P.load_json(directory / "launch.json")["git_custody"])
    journal[-1]["create_request_issued"] = issued["record"]; P.atomic_write(EVIDENCE / "launch_journal.jsonl", P.jsonl_bytes(journal))

def verify_issued_journal(journal: list[dict[str, Any]], row: dict[str, Any], issued: dict[str, Any]) -> None:
    require(len(journal) >= row["ordinal"] and journal[row["ordinal"] - 1].get("create_request_issued") == issued["record"], "issuance journal join")

def validate_static(*, unused: bool = True) -> dict[str, Any]:
    contract, frozen, routes = spec(), rows(), list(route_map().values())
    require(contract.get("schema_id") == "pm.r10.storage_pipeline.normalized_matrix.v1", "schema")
    actual = {path.name for path in HERE.iterdir()}
    require(actual == set(SOURCES) if unused else actual in (set(SOURCES), set(SOURCES) | {"evidence"}), "root roster")
    require(contract.get("owned_file_roster") == list(SOURCES) and all((HERE / name).is_file() and not (HERE / name).is_symlink() for name in SOURCES), "owned roster")
    metrics = {name: metric(HERE / name) for name in SOURCES}
    limits = contract["architecture_limits"]
    require(metrics["controller.py"]["lines"] <= limits["controller_max_lines"] and metrics["selftest.py"]["lines"] <= limits["selftest_max_lines"], "file budgets")
    require(sum(item["lines"] for item in metrics.values()) <= limits["package_max_lines"] and sum(item["bytes"] for item in metrics.values()) <= limits["package_max_bytes"], "package budget")
    require(len(expected_records("dependencies")) == contract["dependency_count"], "dependencies")
    freeze = contract["v7_freeze_manifest"]
    require((V7 / "freeze_manifest.json").stat().st_size == freeze["bytes"] and P.sha256_file(V7 / "freeze_manifest.json") == freeze["sha256"], "V7 freeze manifest")
    require(len(expected_records("immutable_v7_files", V7)) == 10 and len(expected_records("declared_inputs")) == 10, "10 immutable inputs")
    derived = P.derive()
    outputs = expected_records("derived_outputs", V7)
    require(len(outputs) == len(derived) == 13 and all(len(derived[item["path"]]) == item["bytes"] and P.sha256_bytes(derived[item["path"]]) == item["sha256"] for item in outputs), "13 derived outputs")
    for kind, expected in contract["prompts"].items():
        path = V7 / expected["path"]
        require(file_record(path, V7) == expected, f"{kind} prompt")
    capsule = contract["capsule"]
    require(file_record(V7 / capsule["path"], V7) == {key: capsule[key] for key in ("path", "bytes", "sha256")}, "capsule bytes")
    capsule_value = P.load_json(V7 / capsule["path"])
    capsule_canonical = P.canonical_json(capsule_value).encode()
    require(len(capsule_canonical) == capsule["canonical_bytes"] and P.sha256_bytes(capsule_canonical) == capsule["canonical_sha256"], "canonical capsule")
    replay = contract["diagnostic_replays"]
    require(all(file_record(REPO / item["path"]) == item for item in replay["v5_glm_pass_and_v7_cursor_pass"]), "real OMP replay custody")
    require(file_record(REPO / replay["codex_goal_fixture_source"]["path"]) == replay["codex_goal_fixture_source"], "Codex fixture custody")
    route_ids = [route["id"] for route in routes]
    expected_order = ["omp_glm53_flash_max", "omp_cursor_default_auto", "omp_muse_spark_xhigh", "omp_deepseek_v4_flash_max", "omp_gemini_37_flash_high", "codex_luna_max", "codex_luna_medium", "codex_gpt54_xhigh", "codex_gpt54_medium", "codex_gpt54mini_xhigh", "codex_gpt54mini_medium", "omp_qwen38_max_xhigh"]
    require(route_ids == expected_order and [row["route_id"] for row in frozen[:12]] == route_ids == [row["route_id"] for row in frozen[12:]], "exact route order twice")
    expected_routes = [("omp_glm53_flash_max", "omp_tui", "opencode-go/glm-5.3-flash", "max"), ("omp_cursor_default_auto", "omp_tui", "cursor/default", "auto"), ("omp_muse_spark_xhigh", "omp_tui", "opencode-go/muse-spark-1.2-contributor", "xhigh"), ("omp_deepseek_v4_flash_max", "omp_tui", "opencode-go/deepseek-v4-flash", "max"), ("omp_gemini_37_flash_high", "omp_tui", "google-antigravity/gemini-3.7-flash", "high"), ("codex_luna_max", "codex_app", "gpt-5.6-luna", "max"), ("codex_luna_medium", "codex_app", "gpt-5.6-luna", "medium"), ("codex_gpt54_xhigh", "codex_app", "gpt-5.4", "xhigh"), ("codex_gpt54_medium", "codex_app", "gpt-5.4", "medium"), ("codex_gpt54mini_xhigh", "codex_app", "gpt-5.4-mini", "xhigh"), ("codex_gpt54mini_medium", "codex_app", "gpt-5.4-mini", "medium"), ("omp_qwen38_max_xhigh", "omp_tui", "alibaba-token-plan/qwen3.8-max", "xhigh")]
    require([(route["id"], route["surface"], route["model"], route["thinking"]) for route in routes] == expected_routes, "exact route/model/effort tuples")
    require([row["ordinal"] for row in frozen] == list(range(1, 25)) and [row["pass_id"] for row in frozen] == ["pass_01"] * 12 + ["pass_02"] * 12, "ordinal/pass order")
    for row in frozen:
        route, suffix = route_map()[row["route_id"]], row["nonce"][:10]
        require(all(row[key] == route[key] for key in ("surface", "model", "thinking")), "route identity")
        require(row["attempt_id"] == f"storage-normalized-matrix-v1-{row['pass_id']}-{row['ordinal']:02d}-{suffix}", "attempt identity")
        prompt = contract["prompts"]["omp" if row["surface"] == "omp_tui" else "codex"]
        require((row["prompt_utf8_bytes"], row["prompt_sha256"]) == (prompt["bytes"], prompt["sha256"]), "row prompt")
        require(row["evidence_path"] == f"evidence/{row['pass_id']}/{row['route_id']}", "evidence identity")
        if row["surface"] == "omp_tui":
            require(len(runtime_paths(row)) in {9, 10} and all(path.startswith("/tmp/pm-r10-storage-normalized-matrix-v1-") for path in runtime_paths(row)), "isolated OMP paths")
            argv = expected_argv(route, row)
            require("--config" not in argv and all(flag in argv for flag in ("--no-tools", "--no-skills", "--no-rules", "--no-extensions")), "OMP argv")
        else:
            request = M.app.create_request(row, (V7 / "prompts/codex.prompt.txt").read_text())
            require(set(request) == {"prompt", "target", "model", "thinking", "title"} and request["prompt"].startswith("Create a goal that"), "Codex create request")
    for field in ("attempt_id", "nonce", "evidence_path"):
        require(len({row[field] for row in frozen}) == 24, f"unique {field}")
    historical_identity_clean(frozen)
    verified_authority()
    runtime = contract["runtime"]
    require(runtime["row_time_budget_seconds"] == 3600 and runtime["advisor_enabled"] is False and runtime["task_agent_advisor"] == {"task": "off"}, "OMP runtime")
    require(runtime["ordinary_tools_enabled"] is runtime["skills_enabled"] is runtime["rules_enabled"] is runtime["extensions_enabled"] is False, "OMP exclusions")
    require(runtime["codex_parent_allowed_calls"] == ["create_thread", "wait_threads", "read_thread"] and runtime["normalizer_sha256"] == "382cb5bb0b357bc223010a813dbef7e9c8daf8f952568db0ce4d5e1620129a43", "App/normalizer")
    require(runtime["codex_create_request_issue_marker"] == "atomic_row_bound_immutable_before_stdout" and runtime["codex_create_request_reemit_allowed"] is False and contract["codex_tool_contracts"]["create_request_issued"] == ["schema_id", "pass_id", "route_id", "ordinal", "attempt_id", "nonce", "issued_at_utc", "request", "request_utf8_bytes", "request_sha256", "git_custody"] and contract["sequencing"]["codex_create_request_issued_once_before_create"] is True, "immutable App issuance contract")
    require(runtime["normalization_scope"] == "all_verified_assistant_text_candidates" and runtime["codex_normalization"] == "structural_raw_first_then_all_admitted_assistant_text_normalizer" and runtime["codex_terminal_final_rule"] == "exactly_one_final_answer_last_assistant_terminal_after_goal_complete", "Codex assistant-history contract")
    require(P.preflight_inputs()["status"] == "PASS" and P.omp_runtime_preflight()["status"] == "PASS_OMP_RUNTIME", "pipeline preflights")
    require(P.verify()["status"] == "PASS_VERIFIED_NO_WORKNODES" and freeze_check.verify_freeze()["status"] == "PASS_FROZEN_ZERO_SUBJECT", "V7 freeze/verify")
    if unused:
        require(not os.path.lexists(EVIDENCE), "evidence absent")
        for row in frozen:
            require(not os.path.lexists(HERE / row["evidence_path"]), "row evidence absent")
            require(not any(os.path.lexists(path) for path in runtime_paths(row)), "runtime paths absent")
    require(not list(HERE.rglob("*.pyc")) and not list(HERE.rglob("__pycache__")), "cache absent")
    return {"status": "PASS_LOCAL_NORMALIZED_MATRIX_PRELAUNCH", "rows": 24, "subject_calls": 0, "qualification_credit": 0, "metrics": metrics}

@contextlib.contextmanager
def selected(row: dict[str, Any]) -> Iterator[None]:
    global CURRENT_ROW
    prior = CURRENT_ROW
    CURRENT_ROW = row
    try:
        yield
    finally:
        CURRENT_ROW = prior

def glm_rows() -> list[dict[str, Any]]:
    return [selected_row()]

def expected_argv(route: dict[str, Any], row: dict[str, Any]) -> list[str]:
    return G.with_no_extensions(G.ORIGINAL_EXPECTED_ARGV(route, row))

def verify_expected_argv(route: dict[str, Any], cwd: str, session_dir: str) -> list[str]:
    return G.with_no_extensions(G.ORIGINAL_VERIFY_ARGV(route, cwd, session_dir))

class SubprocessProxy:
    def __getattr__(self, name: str) -> Any:
        return getattr(subprocess, name)

    def run(self, argv: Any, *args: Any, **kwargs: Any) -> Any:
        if isinstance(argv, list) and argv and argv[0] == P.load_json(V7 / "runtime_manifest.json")["omp"]["binary"]:
            kwargs["env"] = G.isolated_env(dict(kwargs.get("env") or os.environ))
        return G.ORIGINAL_RUN(argv, *args, **kwargs)

    def Popen(self, argv: Any, *args: Any, **kwargs: Any) -> Any:
        if isinstance(argv, list) and "--model" in argv:
            row, route = selected_row(), route_map()[selected_row()["route_id"]]
            permanent(argv == expected_argv(route, row) and "--config" not in argv and "--no-extensions" in argv, "exact OMP argv")
            permanent(DISPATCH_CUSTODY == git_custody(), "custody before Popen")
            env = G.isolated_env(dict(kwargs["env"]))
            permanent(env["PI_CODING_AGENT_DIR"] == row["profile_dir"] and env["OMP_PROFILE"] == env["PI_PROFILE"] == "default", "isolated profile")
            permanent(not os.path.lexists(Path(row["home_dir"]) / ".cursor"), "host Cursor excluded")
            if row["route_id"] == GLM_ROUTE:
                permanent(not os.path.lexists(row["private_capture_dir"]) and not G.debug_entries(Path(row["cwd"])), "fresh private capture")
                env["PI_REQ_DEBUG"] = "1"
            else:
                env.pop("PI_REQ_DEBUG", None)
            kwargs["env"] = env
        return G.ORIGINAL_POPEN(argv, *args, **kwargs)

SPROXY = SubprocessProxy()

def row_preflight(path: Path, row: dict[str, Any], route: dict[str, Any]) -> dict[str, Any]:
    seed = G.prepare_profile()
    receipt = G.ORIGINAL_PREFLIGHT(path, row, route)
    require(DISPATCH_CUSTODY is not None and git_custody() == DISPATCH_CUSTODY, "custody before preflight")
    require(receipt["effective_config"]["advisor.enabled"] is False and receipt["effective_config"]["task.agentAdvisor"] == {"task": "off"}, "advisor controls off")
    adapter = "glm53_max_formal_normalized_v5" if row["route_id"] == GLM_ROUTE else "native_default_empty_mcp_normalized_v1"
    receipt.update({"matrix_contract": file_record(CONTRACT), "owned_sources": DISPATCH_CUSTODY["sources"], "dependency_custody": DISPATCH_CUSTODY["dependencies"], "git_custody": DISPATCH_CUSTODY, "models_override": file_record(V5 / "models.yml"), "profile_seed": seed, "protocol_adapter": adapter, "config_overlay": None, "private_http_capture": row["route_id"] == GLM_ROUTE, "raw_http_copied_to_evidence": False, "row_time_budget_seconds": 3600, "expected_argv": expected_argv(route, row), "qualification_credit": 0})
    G.ORIGINAL_ATOMIC(path / "omp_preflight.json", receipt)
    return receipt

def composer_transition(before: bytes, after: bytes) -> dict[str, Any]:
    permanent(isinstance(before, bytes) and isinstance(after, bytes) and before and after.startswith(before), "composer snapshot")
    pre, post, delta = base.strip_terminal(before), base.strip_terminal(after), base.strip_terminal(after[len(before):])
    markers = ("📄 #1".encode(), b"/goal Audit", "❯ 📄 #1".encode())
    submitted = row_dir() / "stdin_prompt.raw"
    permanent(submitted.is_file() and not submitted.is_symlink() and submitted.read_bytes() == (V7 / "prompts/omp.prompt.txt").read_bytes(), "submitted prompt")
    permanent(G.PROMPT_READY in pre and G.MCP_SENTINEL not in pre and G.MCP_SENTINEL not in post and all(marker not in pre for marker in markers), "empty-MCP pre-composer")
    previews, cards = re.findall(rb"/goal ([A-Za-z]+)", delta), re.findall("📄 #([0-9]+)".encode(), delta)
    ready = all(marker in post for marker in markers) and len(after) > len(before)
    permanent(all(b"Audit".startswith(value) for value in previews) and all(value == b"1" for value in cards) and (not ready or (previews[-1:] == [b"Audit"] and cards[-1:] == [b"1"])), "composer contradiction")
    if not ready:
        raise base.RunnerError("prompt-specific composer transition pending")
    return {"mcp_startup_finished": False, "mcp_finished_banner_observed": False, "prompt_ready_observed": True, "prompt_ready_glyph": "❯", "prompt_card": "📄 #1", "prompt_preview": "/goal Audit", "composer_state": "❯ 📄 #1", "pre_prompt_bytes": len(before), "pre_prompt_sha256": P.sha256_bytes(before), "new_raw_bytes": len(after) - len(before)}

def verify_session(path: Path, **expected: Any) -> dict[str, Any]:
    if selected_row()["route_id"] == GLM_ROUTE:
        return G.verify_session(path, **expected)
    terminal_hint = G.session_health(path)
    try:
        structural = G.ORIGINAL_SESSION(path, **expected)
    except omp_session.OmpSessionError as exc:
        if terminal_hint:
            raise PermanentMatrixError(f"terminal structural failure: {exc}") from exc
        raise
    return N.normalize_verified_session(path, structural, oracle_path=V7 / "oracle.json", schema_path=V7 / "response.schema.json", max_text_block_utf8_bytes=P.load_json(V7 / "matrix.json")["max_final_assistant_utf8_bytes"])

def verify_omp_raw(path: Path, route: dict[str, Any], launch: dict[str, Any], terminal: dict[str, Any]) -> str:
    return G.verify_omp_raw(path, route, launch, terminal)

def atomic_json(path: Path, value: Any) -> None:
    if selected_row()["route_id"] == GLM_ROUTE:
        G.atomic_json(path, value)
    else:
        G.ORIGINAL_ATOMIC(path, value)

def normalize_codex(path: Path, raw_final: str) -> dict[str, Any]:
    raw_rows = P.load_jsonl(path)
    assistants = []
    finals = []
    response_indices = []
    complete_call_ids = []
    output_indices = {}
    for index, item in enumerate(raw_rows):
        payload = item.get("payload")
        if item.get("type") != "response_item" or not isinstance(payload, dict):
            continue
        response_indices.append(index)
        if payload.get("type") == "message" and payload.get("role") == "assistant":
            content = payload.get("content")
            require(isinstance(content, list) and content, "Codex assistant content")
            blocks = []
            for block in content:
                require(isinstance(block, dict) and block.get("type") in {"output_text", "text"} and isinstance(block.get("text"), str), "Codex assistant text block")
                blocks.append({"type": "text", "text": block["text"]})
            record = (index, payload, blocks)
            assistants.append(record)
            if payload.get("phase") == "final_answer":
                finals.append(record)
        elif payload.get("type") == "custom_tool_call" and payload.get("name") == "exec" and isinstance(payload.get("input"), str):
            kind, _objective = V.parse_goal_wrapper(payload["input"])
            if kind == "update_goal":
                complete_call_ids.append(payload.get("call_id"))
        elif payload.get("type") == "custom_tool_call_output":
            output_indices[payload.get("call_id")] = index
    require(assistants and len(finals) == 1, "one verified Codex final")
    index, payload, blocks = finals[0]
    require(index == assistants[-1][0] == response_indices[-1], "Codex final is last assistant terminal")
    require(len(complete_call_ids) == 1 and output_indices.get(complete_call_ids[0], index) < index, "Codex final after Goal complete")
    require(V.text_blocks(payload["content"]) == raw_final, "verified Codex final capture")
    entries = [{} for _ in range(index + 1)]
    for assistant_index, assistant, assistant_blocks in assistants:
        entries[assistant_index] = {"type": "message", "id": assistant.get("id"), "message": {"role": "assistant", "id": assistant.get("id"), "content": assistant_blocks}}
    structural = {"assistant_message_count": len(assistants), "final_text": raw_final}
    original = N.omp_session.load_physical_session
    try:
        N.omp_session.load_physical_session = lambda _path: (None, None, entries, path.read_bytes())
        return N.normalize_verified_session(path, structural, oracle_path=V7 / "oracle.json", schema_path=V7 / "response.schema.json", max_text_block_utf8_bytes=P.load_json(V7 / "matrix.json")["max_final_assistant_utf8_bytes"])
    finally:
        N.omp_session.load_physical_session = original

def verify_codex_raw(path: Path, route: dict[str, Any], launch: dict[str, Any], terminal: dict[str, Any]) -> str:
    raw_terminal = copy.deepcopy(terminal)
    raw_terminal["final_assistant_text"] = terminal.get("raw_final_assistant_text", terminal.get("final_assistant_text"))
    session_id = ORIGINAL_CODEX_RAW(path, route, launch, raw_terminal)
    normalized = normalize_codex(path / "rollout.raw.jsonl", raw_terminal["final_assistant_text"])
    if "result_normalization" in terminal:
        require(all(terminal.get(key) == normalized[key] for key in ("assistant_message_count", "verified_assistant_text_blocks", "verified_assistant_text_utf8_bytes", "result_normalization")), "Codex raw/history normalization join")
    return session_id

def verify_codex_candidate(directory: Path, row: dict[str, Any], create: dict[str, Any], prompt: str, final: str) -> dict[str, Any]:
    launch = P.load_json(directory / "launch.json")
    provisional = {"final_assistant_text": final}
    projection = M.app.raw_projection(directory / "rollout.raw.jsonl", route_map()[row["route_id"]], prompt, create["threadId"], row["projectless_directory_name"], V, launch, provisional)
    normalized = normalize_codex(directory / "rollout.raw.jsonl", final)
    V.terminal_result(normalized["final_text"])
    projection.update({"raw_final_assistant_sha256": P.sha256_bytes(final.encode()), **{key: normalized[key] for key in ("assistant_message_count", "verified_assistant_text_blocks", "verified_assistant_text_utf8_bytes", "result_normalization", "final_text", "final_text_sha256")}})
    return projection

def app_write_terminal(directory: Path, row: dict[str, Any], route: dict[str, Any], pipeline: Any, *, status: str, final: str = "", identity: Any = None, failure: Any = None, external_submissions: int = 1) -> dict[str, Any]:
    issued = verify_issued(directory, row, P.load_json(directory / "launch.json")["git_custody"]) if status == "PASS" else None
    normalized = normalize_codex(directory / "rollout.raw.jsonl", final) if status == "PASS" else None
    terminal = ORIGINAL_APP_WRITE(directory, row, route, pipeline, status=status, final=normalized["final_text"] if normalized else final, identity=identity, failure=failure, external_submissions=external_submissions)
    if normalized:
        terminal.update({"raw_final_assistant_text": final, "raw_final_assistant_sha256": P.sha256_bytes(final.encode()), **{key: normalized[key] for key in ("assistant_message_count", "verified_assistant_text_blocks", "verified_assistant_text_utf8_bytes", "result_normalization")}})
    marker = directory / ISSUED
    if marker.is_file() and not marker.is_symlink(): terminal["create_request_issued"] = issued["record"] if issued else file_record(marker, directory)
    P.atomic_write(directory / "terminal.json", P.pretty_json(terminal))
    return terminal

def app_verify_direct(directory: Path, row: dict[str, Any], prompt: str, contract: dict[str, Any], pipeline: Any, verify: Any, launch: dict[str, Any], terminal: dict[str, Any]) -> dict[str, Any]:
    issued = verify_issued(directory, row, launch["git_custody"])
    raw_terminal = copy.deepcopy(terminal)
    raw_terminal["final_assistant_text"] = terminal.get("raw_final_assistant_text")
    projection = ORIGINAL_APP_DIRECT(AppEvidencePath(directory), row, prompt, contract, pipeline, verify, launch, raw_terminal)
    normalized = normalize_codex(directory / "rollout.raw.jsonl", raw_terminal["final_assistant_text"])
    raw_time = P.load_json(directory / "raw_copy_1.receipt.json")["source"]["observedAtUtc"]
    require(terminal.get("create_request_issued") == issued["record"] and issued["record"] in terminal["evidence"] and V.parse_utc(issued["value"]["issued_at_utc"]) <= V.parse_utc(raw_time) <= V.parse_utc(terminal["finished_at_utc"]) and terminal.get("final_assistant_text") == normalized["final_text"] and all(terminal.get(key) == normalized[key] for key in ("assistant_message_count", "verified_assistant_text_blocks", "verified_assistant_text_utf8_bytes", "result_normalization")), "Codex issuance/normalization join")
    return projection

def bindings() -> tuple[tuple[Any, str, Any], ...]:
    return (
        (base, "EVIDENCE", EVIDENCE), (base, "route_map", route_map), (base, "plan_rows", rows), (base, "planned_row", planned_row),
        (base, "row_preflight", row_preflight), (base, "verify_composer_transition", composer_transition), (base, "expected_argv", expected_argv),
        (base, "run_row", G.PROMPT_READY_RUN_ROW), (base, "atomic_json", atomic_json), (base, "pipeline", G.PROXY), (base, "subprocess", SPROXY),
        (omp_session, "verify_submission_prefix", G.verify_submission_prefix), (omp_session, "verify_session", verify_session),
        (V, "EVIDENCE", EVIDENCE), (V, "launch_plan_map", launch_plan_map), (V, "expected_argv", verify_expected_argv),
        (V, "verify_omp_raw", verify_omp_raw), (V, "verify_codex_raw", verify_codex_raw), (V, "pipeline", G.PROXY),
        (M, "HERE", HERE), (M, "CONTRACT", CONTRACT), (M, "EVIDENCE", EVIDENCE), (M, "SOURCES", SOURCES),
        (M, "spec", spec), (M, "rows", rows), (M, "route_map", route_map), (M, "launch_plan_map", launch_plan_map), (M, "git_custody", git_custody),
        (M, "verify_codex_candidate", verify_codex_candidate), (M, "append_app_journal", app_append_journal),
        (M.app, "write_terminal", app_write_terminal), (M.app, "verify_direct_evidence", app_verify_direct),
        (G, "EVIDENCE", EVIDENCE), (G, "CONTRACT", CONTRACT), (G, "rows", glm_rows), (G, "row_dir", row_dir), (G, "git_custody", git_custody),
    )

@contextlib.contextmanager
def installed() -> Iterator[None]:
    items = bindings()
    saved = [(module, name, getattr(module, name)) for module, name, _value in items]
    try:
        for module, name, value in items:
            setattr(module, name, value)
        yield
    finally:
        for module, name, value in reversed(saved):
            setattr(module, name, value)

def verify_omp_receipt(row: dict[str, Any], custody: dict[str, Any]) -> None:
    directory = row_dir(row)
    receipt = P.load_json(directory / "omp_preflight.json")
    adapter = "glm53_max_formal_normalized_v5" if row["route_id"] == GLM_ROUTE else "native_default_empty_mcp_normalized_v1"
    require(receipt.get("matrix_contract") == file_record(CONTRACT) and receipt.get("owned_sources") == custody["sources"] and receipt.get("dependency_custody") == custody["dependencies"], "OMP source/dependency receipt")
    require(receipt.get("git_custody") == custody and receipt.get("protocol_adapter") == adapter and receipt.get("row_time_budget_seconds") == 3600, "OMP custody/adapter")
    require(receipt.get("config_overlay") is None and "--config" not in receipt.get("expected_argv", []) and "--no-extensions" in receipt.get("expected_argv", []), "OMP config/argv")
    require(receipt.get("profile_seed", {}).get("seed_roster") == ["agent.db", "config.yml", "models.db", "models.yml"] and receipt.get("models_override") == file_record(V5 / "models.yml"), "OMP isolated profile")
    if row["route_id"] == GLM_ROUTE:
        G.verify_formal(row, custody)

def verify_prefix() -> dict[str, Any]:
    journal_path = EVIDENCE / "launch_journal.jsonl"
    journal = P.load_jsonl(journal_path) if journal_path.is_file() and not journal_path.is_symlink() else []
    frozen, routes = rows(), route_map()
    require(len(journal) <= 24, "journal maximum")
    reports: list[dict[str, Any]] = []
    custody = git_custody() if journal else None
    if not journal:
        require(not os.path.lexists(EVIDENCE), "empty prefix evidence absence")
    else:
        with installed():
            for row in frozen[:len(journal)]:
                with selected(row):
                    report = V.verify_row(row["pass_id"], routes[row["route_id"]])
                    require(report["status"] == "PASS", "fail-stop prior row")
                    if row["surface"] == "omp_tui":
                        verify_omp_receipt(row, custody)
                    else:
                        directory = row_dir(row)
                        launch = M.verify_app_launch(row, custody)
                        issued = verify_issued(directory, row, custody); verify_issued_journal(journal, row, issued)
                        M.app.verify_direct_evidence(directory, row, (V7 / "prompts/codex.prompt.txt").read_text(), spec(), P, V, launch, P.load_json(directory / "terminal.json"))
                    reports.append(report)
            M.mixed_journal(journal, reports)
            grouped = [{"pass_id": pass_id, "rows": [report for report in reports if frozen[report["ordinal"] - 1]["pass_id"] == pass_id]} for pass_id in ("pass_01", "pass_02")]
            grouped = [group for group in grouped if group["rows"]]
            V.verify_launch_journal(grouped)
            V.verify_evidence_tree(grouped)
            V.verify_global_uniqueness(grouped)
    for row in frozen[len(journal):]:
        require(not os.path.lexists(row_dir(row)), "future evidence absent")
        require(not any(os.path.lexists(path) for path in runtime_paths(row)), "future runtime absent")
    complete = len(journal) == 24
    return {"status": "PASS_TWO_CLEAN_NORMALIZED_PASSES" if complete else "PASS_EXACT_PREFIX_ZERO_CREDIT", "row_count": len(journal), "required_rows": 24, "qualification_credit": 1 if complete else 0, "subject_calls": 0}

def require_launch_authority(row: dict[str, Any]) -> None:
    authority = verified_authority()
    require(authority["runtime_launch_authorized"] is True and authority["provider_calls_authorized"] is True and authority["exact_ordinal_prefix_fail_stop_required"] is True, "runtime/provider authority not frozen")
    if row["surface"] == "codex_app":
        require(authority["codex_app_creation_authorized"] is True, "Codex App authority not frozen")
    require(row["attempt_id"] in authority["authorized_attempt_ids"] and len([item for item in rows() if all(item[key] == row[key] for key in (*IDENTITY, "surface", "model", "thinking"))]) == 1, "one exact authorized row")

def next_row(ordinal: int, prefix_count: int) -> dict[str, Any]:
    require(ordinal == prefix_count + 1 and 1 <= ordinal <= 24, "exact next ordinal")
    return rows()[ordinal - 1]

ERRORS = (MatrixError, PermanentMatrixError, G.CanaryError, G.PermanentCanaryError, N.NormalizationError, M.ControllerError, M.PermanentTerminalResultFailure, M.app.LaneError, base.RunnerError, omp_session.OmpSessionError, V.VerifyError, P.PipelineError, subprocess.SubprocessError, OSError, ValueError, KeyError, TypeError, AssertionError)
COMMANDS = ("lint", "verify-prefix", "run-omp", "codex-reserve", "codex-create-request", "codex-wait-request", "codex-read-request", "codex-raw-request", "codex-ingest-create", "codex-ingest-wait", "codex-ingest-read", "codex-ingest-raw1", "codex-ingest-raw2")

def dispatch(argv: list[str] | None = None) -> int:
    global DISPATCH_CUSTODY
    parser = argparse.ArgumentParser()
    parser.add_argument("command", choices=COMMANDS)
    parser.add_argument("ordinal", nargs="?", type=int, choices=range(1, 25))
    parser.add_argument("--max-seconds", type=int, default=3600)
    args = parser.parse_args(argv)
    row = None
    claim_before = None
    output: dict[str, Any] | None = None
    rc = 0
    try:
        require((args.command in {"lint", "verify-prefix"}) == (args.ordinal is None), "ordinal command shape")
        static = validate_static(unused=args.command == "lint")
        if args.command == "lint":
            output = {"status": "PASS_ZERO_SUBJECT_LINT", **static}
        elif args.command == "verify-prefix":
            output = verify_prefix()
        else:
            if args.command in {"run-omp", "codex-reserve"}:
                prefix = verify_prefix()
                row = next_row(args.ordinal, prefix["row_count"])
            else:
                row = rows()[args.ordinal - 1]
            require_launch_authority(row)
            custody = git_custody()
            directory = row_dir(row)
            claim_before = tuple(os.path.lexists(path) for path in (EVIDENCE, directory.parent, directory))
            with installed(), selected(row):
                if args.command == "run-omp":
                    require(args.max_seconds == 3600 and row["surface"] == "omp_tui", "frozen OMP command")
                    DISPATCH_CUSTODY = custody
                    G.DISPATCH_CUSTODY = custody
                    try:
                        terminal = base.run_row(row["pass_id"], row["route_id"], 3600)
                    finally:
                        DISPATCH_CUSTODY = None
                        G.DISPATCH_CUSTODY = None
                    post = verify_prefix()
                    require(post["row_count"] == row["ordinal"], "post-row prefix")
                    output = {"status": "PASS_OMP_ROW_ZERO_CREDIT", "terminal": terminal, "prefix": post, "qualification_credit": 0}
                else:
                    require(row["surface"] == "codex_app", "Codex command requires App row")
                    if args.command == "codex-reserve":
                        launch = M.reserve_app(directory, row, custody)
                        output = {"status": "RESERVED_CONSUMED_AWAIT_CREATE", **{key: row[key] for key in IDENTITY}, "reservation": file_record(directory / "reservation.json", directory), "launch": file_record(directory / "launch.json", directory), "qualification_credit": 0}
                    else:
                        require(M.exact_reservation(row) and not (directory / "terminal.json").exists(), "exact unterminated App reservation")
                        launch = M.verify_app_launch(row, custody)
                        M.app_budget(directory)
                        if args.command == "codex-create-request":
                            require(not (directory / "create_receipt.raw.json").exists(), "create receipt absent")
                            output = issue_create(directory, row, custody)
                        elif args.command == "codex-wait-request":
                            verify_issued(directory, row, custody)
                            create = M.app_created(directory, row); prior = M.app_waits(directory, create)
                            require(len(prior) < spec()["runtime"]["codex_wait_max_receipts"] and (not prior or not M.app.validate_wait(prior[-1]["result"], create)), "wait open")
                            output = M.app.wait_request(create, prior, spec()["runtime"]["codex_wait_timeout_ms"])
                        elif args.command == "codex-read-request":
                            verify_issued(directory, row, custody)
                            create = M.app_created(directory, row); prior = M.app_waits(directory, create)
                            require(prior and M.app.validate_wait(prior[-1]["result"], create) and not (directory / "read_receipt.raw.json").exists(), "read ready")
                            output = M.app.read_request(create, spec())
                        elif args.command == "codex-raw-request":
                            verify_issued(directory, row, custody)
                            create = M.app_created(directory, row); output = M.app.raw_request(row, create)
                            require(P.load_json(directory / "raw_copy_request.json") == output, "raw request join")
                        else:
                            verify_issued(directory, row, custody)
                            output = M.ingest(row, args.command.removeprefix("codex-ingest-"), sys.stdin.buffer.read())
                            if args.command == "codex-ingest-raw2":
                                post = verify_prefix(); require(post["row_count"] == row["ordinal"], "post-App prefix"); output["prefix"] = post
    except AlreadyIssuedNoMutation:
        return 2
    except base.ReservationConflict as exc:
        output, rc = {"status": "FAIL_ALREADY_CONSUMED_NO_MUTATION", "error": f"{type(exc).__name__}: {exc}", "qualification_credit": 0}, 1
    except ERRORS as exc:
        claimed = False
        if row is not None:
            with installed(), selected(row):
                claimed = M.claim_after_failure(row, claim_before)
                if claimed:
                    if row["surface"] == "codex_app":
                        M.fail_app(row, exc)
                    else:
                        base.record_failure(row["pass_id"], row["route_id"], exc)
        output, rc = {"status": "FAIL_CONSUMED_STOP_SUFFIX" if claimed else "FAIL_PRELAUNCH_NO_MUTATION", "error": f"{type(exc).__name__}: {exc}", "qualification_credit": 0}, 1
    finally:
        DISPATCH_CUSTODY = None
        G.DISPATCH_CUSTODY = None
    try:
        if row is not None and args.command == "codex-create-request" and rc == 0: sys.stdout.write(emittable_create(row_dir(row), row, git_custody()))
        else: print(P.canonical_json(output))
    except AlreadyIssuedNoMutation:
        return 2
    except Exception as exc:
        if row is not None and row.get("surface") == "codex_app" and os.path.lexists(row_dir(row) / ISSUED) and not (row_dir(row) / "terminal.json").exists():
            with installed(), selected(row): M.fail_app(row, exc)
        return 1
    return rc

if __name__ == "__main__":
    raise SystemExit(dispatch())
