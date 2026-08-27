#!/usr/bin/env python3
"""One-use, zero-credit MiMo/high normalized Storage canary on current OMP."""
from __future__ import annotations

import argparse
import contextlib
import copy
import importlib.util
import os
import re
import shutil
import stat
import subprocess
import sys
import types
from pathlib import Path
from typing import Any, Iterator

HERE = Path(__file__).resolve().parent
R10 = HERE.parent
REPO = HERE.parents[4]
V7 = R10 / "system_pipeline_sandbox_v7"
LEGACY_ROOT = R10 / "storage_mimo_native_canary_v1"
NORMALIZER = HERE / "result_normalizer.py"
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


legacy = external("r10_mimo_native_canary_v1_helpers_v2", LEGACY_ROOT / "controller.py", LEGACY_ROOT)
_normalizer = external("r10_mimo_semantic_normalizer_v2", NORMALIZER, HERE)
NORMALIZE = _normalizer.normalize_verified_session
CONTRACT = HERE / "canary_contract.json"
EVIDENCE = HERE / "evidence"
SOURCES = ("README.md", "canary_contract.json", "controller.py", "result_normalizer.py", "selftest.py")
ROUTE_ID = "omp_mimo_v25_free_high"
PROMPT_READY = "❯".encode()
MCP_SENTINEL = b"MCP finished"
VISIBLE_SELECTION = "⬢ MiMo V2.5 Free · ◒ high".encode()
ENV_PATHS = {
    "HOME": "home_dir",
    "XDG_CONFIG_HOME": "xdg_config_home",
    "XDG_CACHE_HOME": "xdg_cache_home",
    "XDG_DATA_HOME": "xdg_data_home",
    "CLAUDE_CONFIG_DIR": "claude_config_dir",
    "COPILOT_HOME": "copilot_home",
}
IDENTITY = ("ordinal", "pass_id", "route_id", "attempt_id", "nonce")
JOURNAL_FIELDS = {"schema_id", *IDENTITY, "started_at_utc", "launch_sha256", "omp_preflight_sha256", "popen_observed", "pid"}
ORIGINAL_PREFLIGHT = base.row_preflight
ORIGINAL_ATOMIC = base.atomic_json
ORIGINAL_EXPECTED_ARGV = base.expected_argv
ORIGINAL_VERIFY_ARGV = V.expected_argv
ORIGINAL_RUN_ROW = base.run_row
ORIGINAL_VERIFY_OMP_RAW = V.verify_omp_raw
ORIGINAL_PREFIX = omp_session.verify_submission_prefix
ORIGINAL_SESSION = omp_session.verify_session
ORIGINAL_POPEN = subprocess.Popen
ORIGINAL_RUN = subprocess.run
DISPATCH_CUSTODY: dict[str, Any] | None = None
AUTHORITY_CANONICAL_SHA256 = "22ac6abe42cfe3f35da496a71fdd0d4b1f76ff8899f3add1331d609497edf0cf"


class ControllerError(RuntimeError):
    pass


class PermanentCanaryError(RuntimeError):
    pass


def require(value: bool, message: str) -> None:
    if not value:
        raise ControllerError(message)


def permanent(value: bool, message: str) -> None:
    if not value:
        raise PermanentCanaryError(message)


def spec() -> dict[str, Any]:
    value = P.load_json(CONTRACT)
    require(isinstance(value, dict), "contract object")
    return value


def rows() -> list[dict[str, Any]]:
    value = spec().get("rows")
    require(isinstance(value, list) and len(value) == 1, "one frozen MiMo row")
    return value


def route_map() -> dict[str, dict[str, Any]]:
    route = spec().get("route")
    require(isinstance(route, dict) and route.get("id") == ROUTE_ID, "one MiMo route")
    return {ROUTE_ID: route}


def planned_row(pass_id: str, route_id: str) -> dict[str, Any]:
    found = [row for row in rows() if (row["pass_id"], row["route_id"]) == (pass_id, route_id)]
    require(len(found) == 1, "one planned row")
    return found[0]


def launch_plan_map() -> dict[tuple[str, str], dict[str, Any]]:
    return {(row["pass_id"], row["route_id"]): row for row in rows()}


def row_dir() -> Path:
    return EVIDENCE / "pass_01" / ROUTE_ID


def file_record(path: Path, root: Path = REPO) -> dict[str, Any]:
    require(path.is_file() and not path.is_symlink(), f"regular file: {path}")
    return {"path": path.relative_to(root).as_posix(), "bytes": path.stat().st_size, "sha256": P.sha256_file(path)}


def runtime_record(path: Path) -> dict[str, Any]:
    require(path.is_file() and not path.is_symlink(), f"regular runtime file: {path}")
    return {"path": str(path), "bytes": path.stat().st_size, "sha256": P.sha256_file(path), "mode": oct(path.stat().st_mode & 0o777)}


def row_record(path: Path) -> dict[str, Any]:
    return file_record(path, row_dir())


def frozen_records(field: str) -> list[dict[str, Any]]:
    records = [file_record(REPO / record["path"]) for record in spec()[field]]
    require(records == spec()[field], f"{field} drift")
    return records


@contextlib.contextmanager
def legacy_scope() -> Iterator[None]:
    values = {"HERE": HERE, "REPO": REPO, "CONTRACT": CONTRACT, "EVIDENCE": EVIDENCE, "SOURCES": SOURCES, "DISPATCH_CUSTODY": DISPATCH_CUSTODY}
    saved = {name: getattr(legacy, name) for name in values}
    try:
        for name, value in values.items():
            setattr(legacy, name, value)
        yield
    finally:
        for name, value in saved.items():
            setattr(legacy, name, value)


def convert(call: Any, *args: Any, **kwargs: Any) -> Any:
    try:
        with legacy_scope():
            return call(*args, **kwargs)
    except legacy.ControllerError as exc:
        raise ControllerError(str(exc)) from exc


def run_git(*args: str, binary: bool = False) -> subprocess.CompletedProcess[Any]:
    return ORIGINAL_RUN(["git", "-C", str(REPO), *args], check=False, capture_output=True, text=not binary)


def git_entry(relative: str, index: bool) -> tuple[str, str]:
    argv = ("ls-files", "--stage", "--", relative) if index else ("ls-tree", "HEAD", "--", relative)
    result = run_git(*argv)
    lines = result.stdout.splitlines()
    require(result.returncode == 0 and len(lines) == 1, f"one Git entry: {relative}")
    metadata, seen = lines[0].split("\t", 1)
    fields = metadata.split()
    require(seen == relative and len(fields) == 3, "Git entry shape")
    if index:
        require(fields[2] == "0", "stage-0 Git entry")
        return fields[0], fields[1]
    require(fields[1] == "blob", "HEAD blob entry")
    return fields[0], fields[2]


def git_file(relative: str) -> dict[str, Any]:
    path, current = REPO / relative, REPO
    for part in Path(relative).parts[:-1]:
        current /= part
        require(current.is_dir() and not current.is_symlink(), "non-symlink source parents")
    mode = path.lstat().st_mode
    require(stat.S_ISREG(mode) and not path.is_symlink(), "regular live source")
    index, head = git_entry(relative, True), git_entry(relative, False)
    require(index == head and head[0] in {"100644", "100755"}, "index/HEAD identity")
    blob = run_git("cat-file", "blob", head[1], binary=True)
    require(blob.returncode == 0 and blob.stdout == path.read_bytes(), "live/HEAD blob identity")
    require(bool(mode & 0o111) == (head[0] == "100755"), "live/HEAD executable bit")
    return {**file_record(path), "git_mode": head[0], "git_oid": head[1]}


def git_custody() -> dict[str, Any]:
    refs = [run_git("rev-parse", ref) for ref in ("HEAD", "origin/main", "truenas-backup/main")]
    values = [result.stdout.strip() for result in refs]
    require(all(result.returncode == 0 for result in refs) and len(set(values)) == 1 and len(values[0]) == 40, "dual-pushed candidate")
    sources = [git_file((HERE / name).relative_to(REPO).as_posix()) for name in SOURCES]
    dependencies = [git_file(record["path"]) for record in spec()["dependencies"]]
    require([{key: record[key] for key in ("path", "bytes", "sha256")} for record in dependencies] == spec()["dependencies"], "pushed dependency freeze")
    return {"candidate_commit": values[0], "head": values[0], "origin_main": values[1], "truenas_backup_main": values[2], "sources": sources, "dependencies": dependencies}


def prior_rows() -> list[tuple[Path, dict[str, Any]]]:
    return convert(lambda: list(legacy.prior_rows()))


def raw_record(raw: bytes) -> dict[str, Any]:
    return legacy.raw_record(raw)


def catalog_projection(raw: bytes) -> dict[str, Any]:
    return convert(legacy.catalog_projection, raw)


def validate_catalog_projection(value: Any) -> None:
    convert(legacy.validate_catalog_projection, value)


def catalog_digest(value: dict[str, Any]) -> str:
    return P.sha256_bytes((P.canonical_json(value) + "\n").encode())


def runtime_paths(row: dict[str, Any]) -> list[str]:
    return [row[name] for name in ("cwd", "session_dir", "profile_dir", *ENV_PATHS.values())]


def isolated_env(source: dict[str, str]) -> dict[str, str]:
    row, environment = rows()[0], dict(source)
    environment["PI_CODING_AGENT_DIR"] = row["profile_dir"]
    for key, field in ENV_PATHS.items():
        environment[key] = row[field]
    environment["OMP_PROFILE"] = environment["PI_PROFILE"] = "default"
    return environment


def prepare_profile() -> dict[str, Any]:
    row, target = rows()[0], Path(rows()[0]["profile_dir"])
    roots = [Path(row[field]) for field in ENV_PATHS.values()]
    require(not any(os.path.lexists(path) for path in [target, *roots]), "fresh isolated profile/environment roots")
    source = Path(spec()["runtime"]["source_profile_dir"])
    require(source.is_dir() and not source.is_symlink(), "safe approved source profile")
    target.mkdir(mode=0o700)
    origins, seeds = [], []
    for name in ("config.yml", "agent.db", "models.db"):
        path = source / name
        require(path.is_file() and not path.is_symlink(), f"safe profile source: {name}")
        origins.append(runtime_record(path))
        shutil.copy2(path, target / name)
        os.chmod(target / name, 0o600)
        seeds.append(runtime_record(target / name))
    for path in roots:
        path.mkdir(mode=0o700)
    require({path.name for path in target.iterdir()} == {"config.yml", "agent.db", "models.db"}, "exact three-file profile seed")
    require(all(not any(path.iterdir()) for path in roots), "empty isolated environment roots")
    config = (target / "config.yml").read_bytes()
    require(b"!" not in config and b"agentAdvisor" in config and b"enabled: false" in config, "safe advisor-off profile seed")
    return {"source_profile": str(source), "source_records": origins, "seed_records": seeds, "seed_roster": ["agent.db", "config.yml", "models.db"], "mcp_tool_extension_seed_files": 0, "environment_roots": {key: row[field] for key, field in ENV_PATHS.items()}, "environment_roots_initially_empty": True, "omp_profile": "default", "pi_profile": "default"}


def forced_catalog_refresh() -> dict[str, Any]:
    gate = spec()["catalog_gate"]
    started = base.utc_now()
    timed_out = False
    try:
        result = ORIGINAL_RUN(gate["argv"], cwd=str(HERE), env=isolated_env(dict(os.environ)), capture_output=True, text=False, timeout=gate["command_timeout_seconds"], check=False)
        exit_code, stdout, stderr = result.returncode, result.stdout, result.stderr
    except subprocess.TimeoutExpired as exc:
        timed_out, exit_code = True, None
        stdout = exc.stdout if isinstance(exc.stdout, bytes) else b""
        stderr = exc.stderr if isinstance(exc.stderr, bytes) else b""
    finished = base.utc_now()
    projection, projection_error = None, None
    try:
        projection = catalog_projection(stdout)
    except (ControllerError, P.PipelineError, V.VerifyError, ValueError, TypeError) as exc:
        projection_error = f"{type(exc).__name__}: {exc}"
    return {"schema_id": "pm.r10.storage_pipeline.omp_catalog_refresh_preflight.v2", "name": "forced_catalog_refresh", "started_at_utc": started, "finished_at_utc": finished, "duration_ms": int((V.parse_utc(finished) - V.parse_utc(started)).total_seconds() * 1000), "argv": gate["argv"], "cwd": str(HERE), "profile_dir": rows()[0]["profile_dir"], "profile_environment": {"PI_CODING_AGENT_DIR": rows()[0]["profile_dir"], "OMP_PROFILE": "default", "PI_PROFILE": "default"}, "forced_online": True, "extensions_disabled": True, "timeout_seconds": gate["command_timeout_seconds"], "timed_out": timed_out, "exit_code": exit_code, "stdout": raw_record(stdout), "stderr": raw_record(stderr), "projection": projection, "projection_error": projection_error}


def validate_catalog_receipt(receipt: Any, launch_time: str | None = None) -> None:
    gate = spec()["catalog_gate"]
    keys = {"schema_id", "name", "started_at_utc", "finished_at_utc", "duration_ms", "argv", "cwd", "profile_dir", "profile_environment", "forced_online", "extensions_disabled", "timeout_seconds", "timed_out", "exit_code", "stdout", "stderr", "projection", "projection_error"}
    require(isinstance(receipt, dict) and set(receipt) == keys, "catalog receipt shape")
    require(receipt["schema_id"] == "pm.r10.storage_pipeline.omp_catalog_refresh_preflight.v2" and receipt["name"] == "forced_catalog_refresh", "catalog receipt identity")
    require(receipt["argv"] == gate["argv"] and receipt["cwd"] == str(HERE) and receipt["profile_dir"] == rows()[0]["profile_dir"], "catalog command/profile")
    require(receipt["profile_environment"] == {"PI_CODING_AGENT_DIR": rows()[0]["profile_dir"], "OMP_PROFILE": "default", "PI_PROFILE": "default"}, "catalog isolated profiles")
    stdout = legacy.raw_bytes(receipt["stdout"], "catalog stdout")
    stderr = legacy.raw_bytes(receipt["stderr"], "catalog stderr")
    require(receipt["forced_online"] is receipt["extensions_disabled"] is True and receipt["timeout_seconds"] == gate["command_timeout_seconds"] and receipt["timed_out"] is False and receipt["exit_code"] == 0 and stderr == b"", "catalog clean forced refresh")
    require(receipt["projection_error"] is None and receipt["projection"] == catalog_projection(stdout), "catalog projection receipt")
    validate_catalog_projection(receipt["projection"])
    started, finished = V.parse_utc(receipt["started_at_utc"]), V.parse_utc(receipt["finished_at_utc"])
    require(receipt["duration_ms"] == int((finished - started).total_seconds() * 1000) and 0 <= receipt["duration_ms"] <= gate["command_timeout_seconds"] * 1000, "catalog chronology")
    if launch_time is not None:
        age = (V.parse_utc(launch_time) - finished).total_seconds()
        require(0 <= age <= gate["freshness_to_popen_max_seconds"], "catalog freshness to Popen")


def runtime_manifest(path: Any) -> Any:
    value = P.load_json(path)
    if Path(path).resolve() == (V7 / "runtime_manifest.json").resolve():
        value = copy.deepcopy(value)
        runtime = spec()["runtime"]
        for key in ("binary", "binary_bytes", "binary_sha256", "version"):
            value["omp"][key] = runtime[key]
        value["omp"]["profile_dir"] = rows()[0]["profile_dir"]
    return value


class PipelineProxy:
    def __getattr__(self, name: str) -> Any:
        return runtime_manifest if name == "load_json" else getattr(P, name)


def with_no_extensions(argv: list[str]) -> list[str]:
    permanent("--config" not in argv and "--no-extensions" not in argv and argv.count("--cwd") == 1, "base native argv")
    index = argv.index("--cwd")
    return [*argv[:index], "--no-extensions", *argv[index:]]


def expected_argv(route: dict[str, Any], row: dict[str, Any]) -> list[str]:
    return with_no_extensions(ORIGINAL_EXPECTED_ARGV(route, row))


def verify_expected_argv(route: dict[str, Any], cwd: str, session_dir: str) -> list[str]:
    return with_no_extensions(ORIGINAL_VERIFY_ARGV(route, cwd, session_dir))


def literal_clone(function: Any, replacements: dict[Any, Any], label: str) -> Any:
    code = function.__code__
    for old in replacements:
        permanent(sum(value == old for value in code.co_consts) == 1, f"one {label} literal")
    patched = code.replace(co_consts=tuple(replacements.get(value, value) for value in code.co_consts))
    clone = types.FunctionType(patched, function.__globals__, function.__name__, function.__defaults__, function.__closure__)
    clone.__kwdefaults__ = function.__kwdefaults__
    return clone


PROMPT_READY_RUN_ROW = literal_clone(ORIGINAL_RUN_ROW, {MCP_SENTINEL: PROMPT_READY}, "runner prompt-ready")
PROMPT_READY_VERIFY_OMP_RAW = literal_clone(ORIGINAL_VERIFY_OMP_RAW, {MCP_SENTINEL: PROMPT_READY, "mcp_startup_finished": "prompt_ready_observed"}, "verifier prompt-ready")


def composer_transition(before: bytes, after: bytes) -> dict[str, Any]:
    permanent(isinstance(before, bytes) and isinstance(after, bytes) and before and after.startswith(before), "composer snapshot contamination")
    pre, post, delta = base.strip_terminal(before), base.strip_terminal(after), base.strip_terminal(after[len(before):])
    markers = ("📄 #1".encode(), b"/goal Audit", "❯ 📄 #1".encode())
    prompt = V7 / "prompts/omp.prompt.txt"
    submitted = row_dir() / "stdin_prompt.raw"
    permanent(submitted.is_file() and not submitted.is_symlink() and submitted.read_bytes() == prompt.read_bytes(), "exact prompt bytes before composer")
    permanent(PROMPT_READY in pre and MCP_SENTINEL not in pre and MCP_SENTINEL not in post and VISIBLE_SELECTION in pre and all(marker not in pre for marker in markers), "safe MiMo prompt-ready state")
    previews = re.findall(rb"/goal ([A-Za-z]+)", delta)
    cards = re.findall("📄 #([0-9]+)".encode(), delta)
    ready = all(marker in post for marker in markers) and len(after) > len(before)
    permanent(all(b"Audit".startswith(value) for value in previews) and all(value == b"1" for value in cards) and (not ready or (previews[-1:] == [b"Audit"] and cards[-1:] == [b"1"])), "composer contradiction")
    if not ready:
        raise base.RunnerError("prompt-specific composer transition pending")
    return {"mcp_startup_finished": False, "mcp_finished_banner_observed": False, "prompt_ready_observed": True, "prompt_ready_glyph": "❯", "prompt_card": "📄 #1", "prompt_preview": "/goal Audit", "composer_state": "❯ 📄 #1", "pre_prompt_bytes": len(before), "pre_prompt_sha256": P.sha256_bytes(before), "new_raw_bytes": len(after) - len(before), "visible_model": "MiMo V2.5 Free", "visible_thinking": "high", "visible_selection_sha256": P.sha256_bytes(VISIBLE_SELECTION)}


def verify_omp_raw(path: Path, route: dict[str, Any], launch: dict[str, Any], terminal: dict[str, Any]) -> str:
    receipt = P.load_json(path / "composer_ack.json")
    pre = base.strip_terminal((path / "pre_prompt.raw").read_bytes())
    composer = base.strip_terminal((path / "composer_ack.raw").read_bytes())
    permanent(receipt.get("prompt_ready_observed") is True and receipt.get("mcp_startup_finished") is False and receipt.get("mcp_finished_banner_observed") is False, "truthful empty-MCP readiness")
    permanent(MCP_SENTINEL not in pre and MCP_SENTINEL not in composer and VISIBLE_SELECTION in pre, "MiMo selection/MCP raw custody")
    return PROMPT_READY_VERIFY_OMP_RAW(path, route, launch, terminal)


def session_health(path: Path) -> bool:
    _slot, _header, entries, _raw = omp_session.load_physical_session(path)
    explicit_exit = False
    for entry in entries:
        message = entry.get("message") if entry.get("type") == "message" else None
        if isinstance(message, dict) and message.get("role") == "assistant":
            permanent(message.get("retryRecovery") is None and message.get("stopReason") != "error", "retry/provider error is permanent")
        explicit_exit |= entry.get("type") == "custom" and entry.get("customType") == "session_exit"
    return explicit_exit


def verify_submission_prefix(path: Path, **expected: Any) -> dict[str, Any]:
    session_health(path)
    return ORIGINAL_PREFIX(path, **expected)


def assistant_api(path: Path, structural: dict[str, Any]) -> dict[str, Any]:
    _slot, _header, entries, _raw = omp_session.load_physical_session(path)
    assistants = [entry["message"] for entry in entries if entry.get("type") == "message" and isinstance(entry.get("message"), dict) and entry["message"].get("role") == "assistant"]
    expected = spec()["catalog_gate"]["expected_assistant_api"]
    permanent(len(assistants) == structural.get("assistant_message_count") and assistants and all(message.get("api") == expected for message in assistants), "MiMo assistant API exact")
    return {"assistant_api": expected, "assistant_api_message_count": len(assistants)}


def write_once(path: Path, value: Any) -> None:
    require(not os.path.lexists(path), f"immutable receipt exists: {path.name}")
    P.atomic_write(path, P.pretty_json(value))


def verify_session(path: Path, **expected: Any) -> dict[str, Any]:
    terminal_hint = session_health(path)
    try:
        structural = ORIGINAL_SESSION(path, **expected)
    except omp_session.OmpSessionError as exc:
        if terminal_hint:
            raise PermanentCanaryError(f"terminal structural failure: {exc}") from exc
        raise
    structural.update(assistant_api(path, structural))
    normalized = NORMALIZE(path, structural, oracle_path=V7 / "oracle.json", schema_path=V7 / "response.schema.json", max_text_block_utf8_bytes=P.load_json(V7 / "matrix.json")["max_final_assistant_utf8_bytes"])
    if expected.get("require_exit") is True:
        for target, value in ((row_dir() / "structural_projection.json", structural), (row_dir() / "normalized_projection.json", normalized)):
            if target.exists():
                permanent(P.load_json(target) == value, f"immutable {target.name}")
            else:
                write_once(target, value)
    return normalized


def row_preflight(path: Path, row: dict[str, Any], route: dict[str, Any]) -> dict[str, Any]:
    seed = prepare_profile()
    receipt = ORIGINAL_PREFLIGHT(path, row, route)
    require(git_custody() == DISPATCH_CUSTODY, "source custody changed before catalog")
    config = receipt.get("effective_config", {})
    require(config == spec()["runtime"]["effective_config"], "full current Goal/advisor/safety compatibility config")
    catalog = forced_catalog_refresh()
    receipt.update({"catalog_refresh": catalog, "catalog_refresh_sha256": catalog_digest(catalog)})
    base.atomic_json(path / "omp_preflight.json", receipt)
    validate_catalog_receipt(catalog)
    require(git_custody() == DISPATCH_CUSTODY, "source custody changed during catalog")
    receipt.update({"canary_contract": file_record(CONTRACT), "owned_sources": DISPATCH_CUSTODY["sources"], "dependency_custody": DISPATCH_CUSTODY["dependencies"], "git_custody": DISPATCH_CUSTODY, "dependencies": frozen_records("dependencies"), "frozen_storage_artifacts": frozen_records("frozen_storage_artifacts"), "profile_seed": seed, "protocol_adapter": "native_default", "config_overlay": None, "expected_argv": expected_argv(route, row), "normalizer": file_record(NORMALIZER), "row_time_budget_seconds": 3600, "qualification_credit": 0, "matrix_credit": 0})
    base.atomic_json(path / "omp_preflight.json", receipt)
    return receipt


def formal_chain() -> dict[str, Any]:
    names = ("reservation.json", "omp_preflight.json", "launch.json", "submission_acceptance.json", "session.raw.jsonl", "structural_projection.json", "normalized_projection.json")
    records = {name: row_record(row_dir() / name) for name in names}
    launch, acceptance, structural = (P.load_json(row_dir() / name) for name in ("launch.json", "submission_acceptance.json", "structural_projection.json"))
    permanent(launch["omp_preflight_sha256"] == records["omp_preflight.json"]["sha256"], "launch/preflight join")
    permanent(acceptance["session_projection"]["session_id"] == structural["session_id"] and acceptance["session_projection"]["goal_id"] == structural["goal_id"], "acceptance/final identity join")
    permanent(structural["session_file_sha256"] == records["session.raw.jsonl"]["sha256"], "structural/raw session join")
    return {"schema_id": "pm.r10.storage_pipeline.mimo_normalized_formal_chain.v2", "ordered_paths": list(names), "records": records}


def atomic_json(path: Path, value: Any) -> None:
    if path.name == "terminal.json" and isinstance(value, dict) and value.get("status") == "PASS":
        value = copy.deepcopy(value)
        value["formal_chain"] = formal_chain()
        value["evidence"] = [*value["evidence"], row_record(row_dir() / "structural_projection.json"), row_record(row_dir() / "normalized_projection.json")]
    ORIGINAL_ATOMIC(path, value)


class SubprocessProxy:
    def __getattr__(self, name: str) -> Any:
        return getattr(subprocess, name)

    def run(self, argv: Any, *args: Any, **kwargs: Any) -> Any:
        if isinstance(argv, list) and argv and argv[0] == spec()["runtime"]["binary"]:
            kwargs["env"] = isolated_env(dict(kwargs.get("env") or os.environ))
        return ORIGINAL_RUN(argv, *args, **kwargs)

    def Popen(self, argv: Any, *args: Any, **kwargs: Any) -> Any:
        if isinstance(argv, list) and "--model" in argv:
            row = rows()[0]
            permanent(argv == expected_argv(route_map()[ROUTE_ID], row) and "--config" not in argv and "--no-extensions" in argv, "exact MiMo native argv")
            permanent(DISPATCH_CUSTODY == git_custody(), "pushed custody before Popen")
            validate_catalog_receipt(P.load_json(row_dir() / "omp_preflight.json")["catalog_refresh"], base.utc_now())
            environment = isolated_env(dict(kwargs["env"]))
            permanent(environment["PI_CODING_AGENT_DIR"] == row["profile_dir"] and environment["OMP_PROFILE"] == environment["PI_PROFILE"] == "default", "isolated subject environment")
            permanent(not os.path.lexists(Path(row["home_dir"]) / ".cursor"), "foreign host Cursor config excluded")
            kwargs["env"] = environment
        return ORIGINAL_POPEN(argv, *args, **kwargs)


PROXY, SPROXY = PipelineProxy(), SubprocessProxy()
BINDINGS = (
    (base, "EVIDENCE", EVIDENCE), (base, "route_map", route_map), (base, "plan_rows", rows), (base, "planned_row", planned_row),
    (base, "expected_argv", expected_argv), (base, "row_preflight", row_preflight), (base, "verify_composer_transition", composer_transition),
    (base, "run_row", PROMPT_READY_RUN_ROW), (base, "atomic_json", atomic_json), (base, "pipeline", PROXY), (base, "subprocess", SPROXY),
    (omp_session, "verify_submission_prefix", verify_submission_prefix), (omp_session, "verify_session", verify_session),
    (V, "EVIDENCE", EVIDENCE), (V, "launch_plan_map", launch_plan_map), (V, "expected_argv", verify_expected_argv),
    (V, "verify_omp_raw", verify_omp_raw), (V, "pipeline", PROXY),
)


@contextlib.contextmanager
def installed() -> Iterator[None]:
    saved = [(module, name, getattr(module, name)) for module, name, _value in BINDINGS]
    try:
        for module, name, value in BINDINGS:
            setattr(module, name, value)
        yield
    finally:
        for module, name, value in reversed(saved):
            setattr(module, name, value)


def generic_journal(reports: list[dict[str, Any]]) -> None:
    verified = [row for report in reports for row in report["rows"]]
    require(len(verified) == 1 and verified[0]["ordinal"] == 1, "journal one-row prefix")
    path = EVIDENCE / "launch_journal.jsonl"
    require(path.is_file() and not path.is_symlink(), "launch journal absent")
    journal = P.load_jsonl(path)
    require(path.read_bytes() == P.jsonl_bytes(journal) and len(journal) == 1, "canonical journal length")
    frozen, report, actual = rows()[0], verified[0], journal[0]
    require(set(actual) == JOURNAL_FIELDS and actual.get("schema_id") == "pm.r10.storage_pipeline.launch_journal.v2", "journal shape")
    require(all(actual.get(field) == frozen[field] for field in IDENTITY), "journal identity")
    require(all(actual.get(field) == report[field] for field in ("started_at_utc", "launch_sha256", "omp_preflight_sha256", "pid")), "journal report joins")
    require(actual.get("popen_observed") is True and isinstance(actual.get("pid"), int) and actual["pid"] > 0, "journal Popen/PID")


def verify_formal(row: dict[str, Any], custody: dict[str, Any]) -> dict[str, Any]:
    directory = row_dir()
    terminal = P.load_json(directory / "terminal.json")
    permanent(terminal.get("formal_chain") == formal_chain(), "terminal formal chain")
    preflight, launch = (P.load_json(directory / name) for name in ("omp_preflight.json", "launch.json"))
    require(preflight.get("git_custody") == custody and preflight.get("owned_sources") == custody["sources"] and preflight.get("dependency_custody") == custody["dependencies"], "preflight pushed source/dependency custody")
    require(preflight.get("dependencies") == frozen_records("dependencies") and preflight.get("frozen_storage_artifacts") == frozen_records("frozen_storage_artifacts"), "preflight dependencies")
    require(preflight["profile_seed"]["seed_roster"] == ["agent.db", "config.yml", "models.db"] and preflight["profile_seed"]["mcp_tool_extension_seed_files"] == 0, "isolated profile seed")
    require(preflight.get("expected_argv") == expected_argv(route_map()[ROUTE_ID], row) == launch.get("argv"), "argv receipt")
    require(preflight.get("protocol_adapter") == "native_default" and preflight.get("config_overlay") is None and "--config" not in launch["argv"], "native/default receipt")
    validate_catalog_receipt(preflight["catalog_refresh"], launch["started_at_utc"])
    require(preflight.get("catalog_refresh_sha256") == catalog_digest(preflight["catalog_refresh"]), "catalog digest")
    rendered = base.strip_terminal((directory / "pre_prompt.raw").read_bytes())
    permanent(PROMPT_READY in rendered and MCP_SENTINEL not in rendered and VISIBLE_SELECTION in rendered, "MiMo prompt-ready raw")
    structural, normalized = P.load_json(directory / "structural_projection.json"), P.load_json(directory / "normalized_projection.json")
    session = directory / "session.raw.jsonl"
    recomputed = NORMALIZE(session, structural, oracle_path=V7 / "oracle.json", schema_path=V7 / "response.schema.json", max_text_block_utf8_bytes=P.load_json(V7 / "matrix.json")["max_final_assistant_utf8_bytes"])
    permanent(recomputed == normalized, "current semantic normalizer replay")
    result = normalized["result_normalization"]
    permanent(result["canonical_text"] == terminal["final_assistant_text"] and normalized["raw_last_assistant_sha256"] == structural["final_text_sha256"], "normalized/raw terminal join")
    permanent(terminal.get("status") == "PASS" and terminal.get("process_exit_code") == 0 and terminal.get("no_retry") is True and terminal.get("observed_non_goal_tool_calls") == 0, "PASS/normal-exit/no-tool/no-retry")
    require(not any(Path(row["cwd"]).iterdir()), "completed cwd empty")
    return terminal


def verify_prefix() -> dict[str, Any]:
    row = rows()[0]
    if not os.path.lexists(EVIDENCE):
        require(not any(os.path.lexists(path) for path in runtime_paths(row)), "empty prefix runtime absence")
        return {"status": "PASS_EMPTY_MIMO_NORMALIZED_CANARY_V2_PREFIX", "row_count": 0, "required_rows": 1, "subject_calls": 0, "qualification_credit": 0}
    require(EVIDENCE.is_dir() and not EVIDENCE.is_symlink() and {path.name for path in EVIDENCE.iterdir()} == {"launch_journal.jsonl", "pass_01"}, "evidence root roster")
    pass_dir = EVIDENCE / "pass_01"
    require(pass_dir.is_dir() and not pass_dir.is_symlink() and {path.name for path in pass_dir.iterdir()} == {ROUTE_ID}, "one row evidence")
    require(P.load_json(row_dir() / "terminal.json").get("status") == "PASS", "one-row fail-stop terminal")
    custody = git_custody()
    with installed():
        report = V.verify_row("pass_01", route_map()[ROUTE_ID])
        reports = [{"pass_id": "pass_01", "rows": [report]}]
        verify_formal(row, custody)
        generic_journal(reports)
        V.verify_evidence_tree(reports)
        V.verify_global_uniqueness(reports)
    live = base.session_file(Path(row["session_dir"]))
    require(live is not None and P.sha256_file(live) == report["raw_primary_sha256"], "persistent/raw session join")
    return {"status": "PASS_MIMO_NORMALIZED_CANARY_V2_ZERO_CREDIT", "row_count": 1, "required_rows": 1, "subject_calls": 0, "qualification_credit": 0}


def historical_identity_clean(row: dict[str, Any]) -> None:
    for path in R10.rglob("*.json"):
        if HERE not in path.parents:
            raw = path.read_bytes()
            require(row["nonce"].encode() not in raw and row["attempt_id"].encode() not in raw, "fresh historical identity")


def current_runtime_preflight() -> dict[str, Any]:
    runtime = spec()["runtime"]
    binary, profile = Path(runtime["binary"]), Path(runtime["source_profile_dir"])
    require(binary.is_file() and not binary.is_symlink() and stat.S_ISREG(binary.lstat().st_mode), "current OMP binary absent or unsafe")
    require(binary.stat().st_size == runtime["binary_bytes"] and P.sha256_file(binary) == runtime["binary_sha256"] and oct(binary.stat().st_mode & 0o777) == runtime["binary_mode"], "current OMP binary identity")
    require(profile.is_dir() and not profile.is_symlink(), "approved profile absent or unsafe")
    environment = dict(os.environ)
    environment["PI_CODING_AGENT_DIR"] = str(profile)
    environment["OMP_PROFILE"] = environment["PI_PROFILE"] = "default"
    version = ORIGINAL_RUN([str(binary), "--version"], check=False, capture_output=True, text=True, env=environment, timeout=30)
    require(version.returncode == 0 and version.stdout.strip() == runtime["version"], "current OMP version")
    observed, commands = {}, []
    for key, expected in runtime["effective_config"].items():
        process = ORIGINAL_RUN([str(binary), "config", "get", key], check=False, capture_output=True, text=True, env=environment, timeout=30)
        raw = process.stdout.strip()
        require(process.returncode == 0, f"current OMP config command: {key}")
        value = P.strict_loads(raw) if raw in {"true", "false"} or raw.startswith(("{", "[", '"')) else raw
        require(value == expected, f"current OMP config drift: {key}")
        observed[key] = value
        commands.append({"key": key, "exit_code": process.returncode, "stdout": raw})
    return {"status": "PASS_OMP_RUNTIME_18_0_7", "binary": str(binary), "binary_bytes": binary.stat().st_size, "binary_sha256": P.sha256_file(binary), "binary_mode": oct(binary.stat().st_mode & 0o777), "version": version.stdout.strip(), "profiles": {"OMP_PROFILE": "default", "PI_PROFILE": "default"}, "effective_config": observed, "commands": commands, "subject_calls": 0}


def validate_static(*, unused: bool = True) -> dict[str, Any]:
    contract, row, route = spec(), rows()[0], route_map()[ROUTE_ID]
    require(contract.get("schema_id") == "pm.r10.storage_pipeline.storage_mimo_normalized_canary.v2" and contract.get("owned_file_roster") == list(SOURCES), "contract/roster")
    actual = {path.name for path in HERE.iterdir()}
    require(actual == set(SOURCES) if unused else actual in (set(SOURCES), set(SOURCES) | {"evidence"}), "package root roster")
    require(all((HERE / name).is_file() and not (HERE / name).is_symlink() for name in SOURCES), "regular sources")
    metrics = {name: {"lines": len((HERE / name).read_bytes().splitlines()), "bytes": (HERE / name).stat().st_size} for name in SOURCES}
    limits = contract["architecture_limits"]
    require(metrics["controller.py"]["lines"] <= limits["controller_max_lines"] and metrics["selftest.py"]["lines"] <= limits["selftest_max_lines"] and sum(value["lines"] for value in metrics.values()) <= limits["package_max_lines"] and sum(value["bytes"] for value in metrics.values()) <= limits["package_max_bytes"], "architecture budget")
    frozen_records("dependencies")
    artifacts = frozen_records("frozen_storage_artifacts")
    require(file_record(NORMALIZER) == contract["result_normalizer"] and P.sha256_file(NORMALIZER) == "0832c205a2b62917ffb874838c84159d358c78f79bbad6c9f4ec8fccbd637c9f", "current semantic normalizer")
    prompt = V7 / "prompts/omp.prompt.txt"
    require(artifacts[0] == file_record(prompt) and prompt.stat().st_size == row["prompt_utf8_bytes"] == 3036 and P.sha256_file(prompt) == row["prompt_sha256"] == "eff40a61579a080ce6e21bb71bcae2dd0640c100c9d61c199f45ac5dece43638", "exact frozen prompt")
    suffix = row["nonce"][:10]
    require((row["ordinal"], row["pass_id"], row["route_id"], row["surface"], row["model"], row["thinking"]) == (1, "pass_01", ROUTE_ID, "omp_tui", "opencode-zen/mimo-v2.5-free", "high"), "exact row")
    require(route == {"id": ROUTE_ID, "surface": "omp_tui", "model": row["model"], "thinking": "high"}, "route join")
    require(row["attempt_id"] == f"storage-mimo-normalized-canary-v2-01-{suffix}" and len(row["nonce"]) == 32, "fresh attempt/nonce")
    expected_paths = {"cwd": f"/tmp/pm-r10-storage-v7-mimo-normalized-canary-v2-cwd-{suffix}", "session_dir": f"/tmp/pm-r10-storage-v7-session-mimo-normalized-canary-v2-{suffix}", "profile_dir": f"/tmp/pm-r10-storage-v7-profile-mimo-normalized-canary-v2-{suffix}", "home_dir": f"/tmp/pm-r10-storage-v7-home-mimo-normalized-canary-v2-{suffix}", "xdg_config_home": f"/tmp/pm-r10-storage-v7-xdg-config-mimo-normalized-canary-v2-{suffix}", "xdg_cache_home": f"/tmp/pm-r10-storage-v7-xdg-cache-mimo-normalized-canary-v2-{suffix}", "xdg_data_home": f"/tmp/pm-r10-storage-v7-xdg-data-mimo-normalized-canary-v2-{suffix}", "claude_config_dir": f"/tmp/pm-r10-storage-v7-claude-mimo-normalized-canary-v2-{suffix}", "copilot_home": f"/tmp/pm-r10-storage-v7-copilot-mimo-normalized-canary-v2-{suffix}"}
    require(all(row[key] == value for key, value in expected_paths.items()) and len(set(runtime_paths(row))) == len(runtime_paths(row)), "fresh exact runtime paths")
    require(row["evidence_path"] == f"evidence/pass_01/{ROUTE_ID}" and expected_argv(route, row)[-4:] == ["--model", row["model"], "--thinking", "high"], "evidence/argv")
    argv = expected_argv(route, row)
    require("--config" not in argv and all(flag in argv for flag in ("--no-tools", "--no-skills", "--no-rules", "--no-extensions")), "native restrictions")
    historical_identity_clean(row)
    authority = contract["authority"]
    require(P.sha256_bytes(P.canonical_json(authority).encode()) == AUTHORITY_CANONICAL_SHA256 and authority["authorized_attempt_ids"] == [row["attempt_id"]] and authority["authorized_selector"] == row["model"] and authority["authorized_thinking"] == "high", "literal-bound one-row authority")
    require(authority["runtime_launch_authorized_by_active_objective"] is True and authority["separate_review_before_launch_required"] is True and all(authority[key] is False for key in ("retry_replacement_reuse_or_retro_credit_authorized", "other_route_or_subject_authorized", "matrix_launch_authorized_by_canary", "windows_omp_interaction_authorized")), "authority ceiling")
    goal = contract["governance_goal_receipt"]
    objective = goal["objective_utf8"].encode()
    require(len(objective) == goal["objective_utf8_bytes"] == 2703 and P.sha256_bytes(objective) == goal["objective_sha256"] == "560a6b2e6852f351fd5d95e1ed44ec0f5044dab367318b20458c3cd76139c406" and "First qualify exactly one fresh zero-credit normalized native OMP Goal canary" in goal["objective_utf8"], "active objective receipt")
    require(goal["source_thread_id"] == goal["goal_thread_id"] == authority["source_thread_id"] and goal["status"] == "active" and goal["created_at"] == 1787781232 and goal["updated_at"] == authority["current_goal_updated_at_observation"] == 1787861158, "current re-anchor Goal identity/state")
    require(goal["tokens_used_observation"] == 1562040 and goal["remaining_tokens_observation"] is None and goal["token_usage_is_semantic_authority"] is False, "Goal token usage observation is non-authoritative")
    runtime, gate = contract["runtime"], contract["catalog_gate"]
    effective = {"advisor.enabled": False, "task.agentAdvisor": {"task": "off"}, "goal.enabled": True, "goal.continuationModes": ["interactive"], "plan.defaultOnStartup": False, "memory.backend": "off", "autolearn.enabled": False, "mcp.enableProjectConfig": False, "tools.approvalMode": "yolo"}
    require(runtime == {"binary": "/home/sittingmongoose/.local/bin/omp", "binary_bytes": 183686344, "binary_sha256": "4e2468ad6974e6a2edea621da82abca8c95ec62a8354630381c353dc08c7769b", "binary_mode": "0o755", "version": "omp/18.0.7", "source_profile_dir": "/home/sittingmongoose/.omp/pmdev-r10-simple-canary-v1", "effective_config": effective, "row_time_budget_seconds": 3600, "active_wait_seconds": 3600, "ordinary_tools_enabled": False, "skills_enabled": False, "rules_enabled": False, "extensions_enabled": False, "config_overlay": None, "external_goal_prompt_count": 1, "standalone_enter_count": 1, "ctrl_d_after_stable_structural_and_normalized_success_count": 1, "normal_exit_required": True, "isolated_linux_only": True, "foreign_windows_omp_terminal_boundary": "DO_NOT_INSPECT_FOCUS_INJECT_SIGNAL_REUSE_CLOSE_OR_CLEANUP", "pre_submission_jsonl_required": False}, "closed current runtime")
    expected_model = {"provider": "opencode-zen", "id": "mimo-v2.5-free", "selector": row["model"], "name": "MiMo V2.5 Free", "contextWindow": 200000, "maxTokens": 32000, "reasoning": True, "thinking": ["low", "medium", "high"], "input": ["text", "image"], "cost": {"input": 0, "output": 0, "cacheRead": 0, "cacheWrite": 0}}
    require(gate["argv"] == [runtime["binary"], "models", "refresh", "opencode-zen", "--json", "--no-extensions"] and gate["expected_model"] == expected_model and gate["expected_assistant_api"] == "openai-completions" and gate["freshness_to_popen_max_seconds"] == 60, "exact MiMo catalog gate")
    verification = contract["verification"]
    require(verification == {"structural_first": "unmodified_v7_omp_session.verify_session", "normalization_second": "v2_local_result_normalizer.normalize_verified_session", "candidate_marker_grammar": "ascii_horizontal_outer_whitespace_then_PM_RESULT_then_one_or_more_ascii_horizontal_separators_then_strict_json_payload", "canonical_output_object_order": "frozen_oracle_schema_defined", "input_object_key_order": "semantically_irrelevant", "meaningful_list_order": "exact", "inline_prose_marker_authoritative": False, "raw_session_preserved": True, "raw_tui_transcript_preserved": True, "native_goal_complete_required": True, "distinct_final_assistant_required": True, "normalized_exact_result_required": True, "raw_final_assistant_may_be_non_authoritative_prose": True, "normal_exit_required": True, "pre_submission_jsonl_required": False, "retry_or_provider_error_permanent": True, "structural_terminal_error_permanent_only_after_explicit_session_exit": True}, "verification contract")
    for record in contract["prior_failure_custody"]:
        require(file_record(REPO / record["path"]) == record, f"prior failure preserved: {record['path']}")
    require(freeze_check.verify_freeze()["status"] == "PASS_FROZEN_ZERO_SUBJECT", "V7 frozen dependency package")
    if unused:
        require(not os.path.lexists(EVIDENCE) and not any(os.path.lexists(path) for path in runtime_paths(row)), "unused paths absent")
    require(not list(HERE.rglob("*.pyc")) and not list(HERE.rglob("__pycache__")), "no cache")
    runtime_report = current_runtime_preflight() if unused and not os.path.lexists(EVIDENCE) else {"status": "NOT_RUN_AFTER_RESERVATION", "subject_calls": 0}
    return {"status": "PASS_LOCAL_MIMO_NORMALIZED_CANARY_V2_PRELAUNCH", "metrics": metrics, "temporary_bindings": len(BINDINGS), "subject_calls": 0, "qualification_credit": 0, "runtime_preflight": runtime_report}


def claim_after_failure(row: dict[str, Any], before: tuple[bool, bool, bool] | None) -> bool:
    return convert(legacy.claim_after_failure, row, before)


def preserve_failure(row: dict[str, Any]) -> None:
    target = row_dir() / "postfailure_session.raw.jsonl"
    live = base.session_file(Path(row["session_dir"])) if Path(row["session_dir"]).is_dir() else None
    if live is not None and not os.path.lexists(target):
        P.atomic_write(target, live.read_bytes())


ERRORS = (ControllerError, PermanentCanaryError, _normalizer.NormalizationError, base.RunnerError, omp_session.OmpSessionError, V.VerifyError, P.PipelineError, subprocess.SubprocessError, OSError, ValueError, KeyError, TypeError, AssertionError)


def dispatch(argv: list[str] | None = None) -> int:
    global DISPATCH_CUSTODY
    parser = argparse.ArgumentParser()
    parser.add_argument("command", choices=("lint", "verify-prefix", "run"))
    parser.add_argument("ordinal", nargs="?", type=int, choices=(1,))
    parser.add_argument("--max-seconds", type=int, default=3600)
    args = parser.parse_args(argv)
    row, before = rows()[0], None
    os.umask(0o077)
    try:
        require((args.command == "run") == (args.ordinal is not None), "ordinal only for run")
        static = validate_static(unused=args.command == "lint")
        if args.command == "lint":
            print(P.canonical_json({"status": "PASS_ZERO_SUBJECT_LINT", **static}))
            return 0
        if args.command == "verify-prefix":
            print(P.canonical_json(verify_prefix()))
            return 0
        require(args.max_seconds == 3600 and spec()["authority"]["runtime_launch_authorized_by_active_objective"] is True, "exact one-use authority/budget")
        DISPATCH_CUSTODY = git_custody()
        prefix = verify_prefix()
        require(prefix["row_count"] == 0, "canary already consumed")
        runtime = current_runtime_preflight()
        require(runtime["status"] == "PASS_OMP_RUNTIME_18_0_7" and runtime["subject_calls"] == 0 and git_custody() == DISPATCH_CUSTODY, "pre-reservation runtime/custody")
        before = tuple(os.path.lexists(path) for path in (EVIDENCE, row_dir().parent, row_dir()))
        with installed():
            terminal = base.run_row("pass_01", ROUTE_ID, 3600)
        result = verify_prefix()
        require(result["row_count"] == 1, "post-PASS exact prefix")
    except base.ReservationConflict as exc:
        print(P.canonical_json({"status": "FAIL_ALREADY_CONSUMED_NO_MUTATION", "error": str(exc), "qualification_credit": 0}))
        return 1
    except ERRORS as exc:
        claimed = claim_after_failure(row, before)
        if claimed:
            terminal_path = row_dir() / "terminal.json"
            preserve_error = None
            if os.path.lexists(terminal_path):
                try:
                    closed = P.load_json(terminal_path)
                    if closed.get("status") != "PASS":
                        exc = ControllerError(f"{type(exc).__name__}: {exc}; existing non-PASS terminal remains immutable")
                except ERRORS as terminal_error:
                    exc = ControllerError(f"{type(exc).__name__}: {exc}; existing terminal inspection: {type(terminal_error).__name__}: {terminal_error}")
            else:
                try:
                    preserve_failure(row)
                except ERRORS as failure:
                    preserve_error = failure
                if preserve_error is not None:
                    exc = ControllerError(f"{type(exc).__name__}: {exc}; postfailure preserve: {type(preserve_error).__name__}: {preserve_error}")
                with installed():
                    base.record_failure("pass_01", ROUTE_ID, exc)
        print(P.canonical_json({"status": "FAIL_MIMO_NORMALIZED_CANARY_V2_CONSUMED_NO_RETRY" if claimed else "FAIL_PRELAUNCH_NO_MUTATION", "error": f"{type(exc).__name__}: {exc}", "qualification_credit": 0}))
        return 1
    finally:
        DISPATCH_CUSTODY = None
    print(P.canonical_json({"status": "PASS_MIMO_NORMALIZED_CANARY_V2_ZERO_CREDIT", "terminal": terminal, "qualification_credit": 0}))
    return 0


if __name__ == "__main__":
    raise SystemExit(dispatch())
