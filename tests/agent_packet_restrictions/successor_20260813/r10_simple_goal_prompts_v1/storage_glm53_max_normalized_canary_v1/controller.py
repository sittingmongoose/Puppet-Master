#!/usr/bin/env python3
"""One pushed, one-use, zero-credit GLM53/max normalized Storage canary."""
from __future__ import annotations

import argparse
import contextlib
import copy
import importlib.util
import json
import os
import shutil
import stat
import subprocess
import sys
from pathlib import Path
from typing import Any, Iterator

HERE = Path(__file__).resolve().parent
R10 = HERE.parent
REPO = HERE.parents[4]
V7 = R10 / "system_pipeline_sandbox_v7"
NORMALIZER = R10 / "storage_glm53_normalized_canary_v2/result_normalizer.py"
sys.path.insert(0, str(V7))
import freeze_check  # type: ignore  # noqa: E402
import omp_row_runner as base  # type: ignore  # noqa: E402
import omp_session  # type: ignore  # noqa: E402
import pipeline as P  # type: ignore  # noqa: E402
import verify_matrix as V  # type: ignore  # noqa: E402

CONTRACT = HERE / "canary_contract.json"
EVIDENCE = HERE / "evidence"
SOURCES = ("README.md", "canary_contract.json", "controller.py", "selftest.py", "models.yml")
ROUTE_ID = "omp_glm53_flash_max"
ENDPOINT = "https://opencode.ai/zen/go/v1/chat/completions"
MODELS_BYTES = b"providers:\n  opencode-go:\n    modelOverrides:\n      glm-5.3-flash:\n        thinking:\n          mode: effort\n          efforts: [low, high, max]\n"
VISIBLE_MAX = "GLM-5.3-Flash (2x usage) · ◉ max ·".encode()
ORIGINAL_PREFLIGHT = base.row_preflight
ORIGINAL_COMPOSER = base.verify_composer_transition
ORIGINAL_ATOMIC = base.atomic_json
ORIGINAL_PREFIX = omp_session.verify_submission_prefix
ORIGINAL_SESSION = omp_session.verify_session
ORIGINAL_POPEN = subprocess.Popen
_spec = importlib.util.spec_from_file_location("glm53_max_normalizer", NORMALIZER)
if _spec is None or _spec.loader is None: raise RuntimeError("normalizer unavailable")
_normalizer = importlib.util.module_from_spec(_spec); sys.modules[_spec.name] = _normalizer; _spec.loader.exec_module(_normalizer); NORMALIZE = _normalizer.normalize_verified_session

class CanaryError(RuntimeError): pass
class PermanentCanaryError(RuntimeError): pass

def require(value: bool, message: str) -> None:
    if not value: raise CanaryError(message)

def permanent(value: bool, message: str) -> None:
    if not value: raise PermanentCanaryError(message)

def spec() -> dict[str, Any]: return P.load_json(CONTRACT)
def rows() -> list[dict[str, Any]]: return spec()["rows"]
def route_map() -> dict[str, dict[str, Any]]: return {ROUTE_ID: spec()["route"]}
def planned_row(pass_id: str, route_id: str) -> dict[str, Any]:
    found = [row for row in rows() if (row["pass_id"], row["route_id"]) == (pass_id, route_id)]
    require(len(found) == 1, "one planned row"); return found[0]
def launch_plan_map() -> dict[tuple[str, str], dict[str, Any]]: return {(r["pass_id"], r["route_id"]): r for r in rows()}
def row_dir() -> Path: return EVIDENCE / "pass_01" / ROUTE_ID
def file_record(path: Path, root: Path = REPO) -> dict[str, Any]:
    require(path.is_file() and not path.is_symlink(), f"regular file: {path}")
    return {"path": path.relative_to(root).as_posix(), "bytes": path.stat().st_size, "sha256": P.sha256_file(path)}
def row_record(path: Path) -> dict[str, Any]: return file_record(path, row_dir())
def write_once(path: Path, value: Any) -> None:
    require(not os.path.lexists(path), f"immutable receipt already exists: {path.name}"); P.atomic_write(path, P.pretty_json(value))

def run_git(*args: str, binary: bool = False) -> subprocess.CompletedProcess[Any]:
    return subprocess.run(["git", "-C", str(REPO), *args], check=False, capture_output=True, text=not binary)

def git_entry(relative: str, index: bool) -> tuple[str, str]:
    result = run_git(*( ("ls-files", "--stage", "--", relative) if index else ("ls-tree", "HEAD", "--", relative) ))
    lines = result.stdout.splitlines(); require(result.returncode == 0 and len(lines) == 1, f"one Git entry: {relative}")
    metadata, seen = lines[0].split("\t", 1); fields = metadata.split(); require(seen == relative and len(fields) == 3, "Git entry shape")
    if index: require(fields[2] == "0", "stage-0 index entry"); return fields[0], fields[1]
    require(fields[1] == "blob", "HEAD blob entry"); return fields[0], fields[2]

def git_file(relative: str) -> dict[str, Any]:
    path = REPO / relative; current = REPO
    for part in Path(relative).parts[:-1]: current /= part; require(current.is_dir() and not current.is_symlink(), "non-symlink source parents")
    mode = path.lstat().st_mode; require(stat.S_ISREG(mode) and not path.is_symlink(), "regular live source")
    index, head = git_entry(relative, True), git_entry(relative, False); require(index == head and head[0] in {"100644", "100755"}, "index/HEAD identity")
    blob = run_git("cat-file", "blob", head[1], binary=True); require(blob.returncode == 0 and blob.stdout == path.read_bytes(), "live/HEAD blob identity")
    require(bool(mode & 0o111) == (head[0] == "100755"), "live/HEAD executable bit")
    return {**file_record(path), "git_mode": head[0], "git_oid": head[1]}

def git_custody() -> dict[str, Any]:
    refs = [run_git("rev-parse", ref) for ref in ("HEAD", "origin/main", "truenas-backup/main")]; values = [r.stdout.strip() for r in refs]
    require(all(r.returncode == 0 for r in refs) and len(set(values)) == 1 and len(values[0]) == 40, "dual-pushed candidate")
    owned = [git_file((HERE / name).relative_to(REPO).as_posix()) for name in SOURCES]
    dependencies = [git_file(record["path"]) for record in spec()["dependencies"]]
    require([{k: r[k] for k in ("path", "bytes", "sha256")} for r in dependencies] == spec()["dependencies"], "dependency freeze")
    return {"candidate_commit": values[0], "head": values[0], "origin_main": values[1], "truenas_backup_main": values[2], "sources": owned, "dependencies": dependencies}

def runtime_manifest(path: Any) -> Any:
    value = P.load_json(path)
    if Path(path).resolve() == (V7 / "runtime_manifest.json").resolve():
        value = copy.deepcopy(value); value["omp"]["profile_dir"] = rows()[0]["profile_dir"]
    return value

class PipelineProxy:
    def __getattr__(self, name: str) -> Any: return runtime_manifest if name == "load_json" else getattr(P, name)

def prepare_profile() -> None:
    target = Path(rows()[0]["profile_dir"]); require(not os.path.lexists(target), "fresh disposable profile")
    source = Path(P.load_json(V7 / "runtime_manifest.json")["omp"]["profile_dir"]); require(source.is_dir() and not source.is_symlink(), "safe approved profile source"); target.mkdir(mode=0o700)
    for name in ("config.yml", "agent.db", "models.db"):
        path = source / name; require(path.is_file() and not path.is_symlink(), f"safe profile source: {name}"); shutil.copy2(path, target / name); os.chmod(target / name, 0o600)
    shutil.copy2(HERE / "models.yml", target / "models.yml"); os.chmod(target / "models.yml", 0o600)
    require({p.name for p in target.iterdir()} == {"config.yml", "agent.db", "models.db", "models.yml"}, "minimal profile roster")
    require((target / "models.yml").read_bytes() == MODELS_BYTES and b"!" not in (target / "config.yml").read_bytes() + MODELS_BYTES, "exact safe override")

DISPATCH_CUSTODY: dict[str, Any] | None = None

def row_preflight(path: Path, row: dict[str, Any], route: dict[str, Any]) -> dict[str, Any]:
    prepare_profile(); receipt = ORIGINAL_PREFLIGHT(path, row, route)
    require(git_custody() == DISPATCH_CUSTODY, "source custody changed before preflight")
    require(receipt["effective_config"]["advisor.enabled"] is False and receipt["effective_config"]["task.agentAdvisor"] == {"task": "off"}, "advisor controls off")
    receipt.update({"canary_contract": file_record(CONTRACT), "owned_sources": DISPATCH_CUSTODY["sources"], "dependency_custody": DISPATCH_CUSTODY["dependencies"], "git_custody": DISPATCH_CUSTODY, "models_override": file_record(HERE / "models.yml"), "private_http_capture": True, "raw_http_copied_to_evidence": False, "row_time_budget_seconds": 3600})
    base.atomic_json(path / "omp_preflight.json", receipt); return receipt

def composer_transition(before: bytes, after: bytes) -> dict[str, Any]:
    value = ORIGINAL_COMPOSER(before, after); rendered = base.strip_terminal(before)
    permanent(VISIBLE_MAX in rendered and b"xhigh" not in rendered.lower(), "visible GLM53 literal max selection")
    return {**value, "visible_model": "GLM-5.3-Flash (2x usage)", "visible_thinking": "max", "visible_selection_sha256": P.sha256_bytes(VISIBLE_MAX)}

def debug_entries(directory: Path) -> list[Path]:
    if not directory.is_dir(): return []
    entries = sorted(directory.iterdir()); permanent(all(p.is_file() and not p.is_symlink() and __import__("re").fullmatch(r"rr-session-[1-9][0-9]*(?:\.json|\.res\.log)", p.name) for p in entries), "request-debug cwd contamination")
    return entries

def safe_request(path: Path) -> dict[str, Any]:
    value = P.load_json(path); body = value.get("body"); permanent(isinstance(body, dict), "HTTP request body")
    tools = body.get("tools"); permanent(isinstance(tools, list) and len(tools) == 1, "sole native Goal tool")
    function = tools[0].get("function") if isinstance(tools[0], dict) else None; permanent(isinstance(function, dict) and function.get("name") == "goal", "native Goal tool")
    messages = body.get("messages"); permanent(tools[0].get("type") == "function" and isinstance(messages, list) and all(isinstance(m, dict) and isinstance(m.get("tool_calls", []), list) for m in messages) and all(isinstance(call, dict) for m in messages for call in m.get("tool_calls", [])), "HTTP message/tool shape")
    calls = [(call.get("id"), call.get("function", {}).get("name")) for m in messages if m.get("role") == "assistant" for call in m.get("tool_calls", []) if isinstance(call, dict)]; results = [m.get("tool_call_id") for m in messages if m.get("role") == "tool"]
    permanent(value.get("method") == "POST" and value.get("url") == ENDPOINT and body.get("model") == "glm-5.3-flash" and body.get("reasoning_effort") == "max", "exact GLM53/max HTTP request")
    permanent(all(isinstance(call_id, str) and call_id and name == "goal" for call_id, name in calls) and all(isinstance(call_id, str) and call_id for call_id in results), "HTTP prior Goal-call/result shape"); return {"name": path.name, "bytes": path.stat().st_size, "sha256": P.sha256_file(path), "endpoint": ENDPOINT, "method": "POST", "model": "glm-5.3-flash", "reasoning_effort": "max", "tool_names": ["goal"], "message_roles": [m.get("role") for m in messages], "prior_goal_call_ids": [item[0] for item in calls], "prior_goal_result_ids": results}

def safe_response(path: Path) -> dict[str, Any]:
    permanent(path.is_file() and not path.is_symlink(), "regular private HTTP response"); raw = path.read_bytes(); permanent(raw.startswith(b"HTTP 200 OK\r\n"), "HTTP response status"); text: list[str] = []; call_ids: list[str] = []; call_names: list[str] = []; arguments: list[str] = []; chunks = done = 0
    for line in raw.splitlines():
        if not line.startswith(b"data: "): continue
        payload = line[6:]
        if payload == b"[DONE]": done += 1; continue
        value = P.strict_loads(payload.decode("utf-8")); chunks += 1; permanent(isinstance(value, dict) and value.get("model") == "glm-5.3-flash" and isinstance(value.get("choices"), list), "exact response chunk model")
        for choice in value["choices"]:
            permanent(isinstance(choice, dict) and isinstance(choice.get("delta"), dict), "response choice/delta shape"); delta = choice["delta"]; content = delta.get("content")
            if content is not None: permanent(isinstance(content, str), "response text delta"); text.append(content)
            for call in delta.get("tool_calls", []):
                permanent(isinstance(call, dict) and isinstance(call.get("function", {}), dict), "response tool-call delta"); function = call.get("function", {}); call_id, name, fragment = call.get("id"), function.get("name"), function.get("arguments"); call_ids.extend([call_id] if call_id is not None else []); call_names.extend([name] if name is not None else []); arguments.extend([fragment] if fragment is not None else [])
    rendered = "".join(text).encode("utf-8"); permanent(chunks > 0 and done == 1 and all(isinstance(value, str) and value for value in [*call_ids,*call_names,*arguments]), "complete safe response projection"); return {"name":path.name,"bytes":len(raw),"sha256":P.sha256_bytes(raw),"status_line":"HTTP 200 OK","model":"glm-5.3-flash","sse_chunk_count":chunks,"done_count":done,"assistant_text_utf8_bytes":len(rendered),"assistant_text_sha256":P.sha256_bytes(rendered),"goal_call_ids":call_ids,"goal_call_names":call_names,"goal_call_arguments":"".join(arguments)}

def no_sensitive(value: Any) -> None:
    raw = P.canonical_json(value).lower(); permanent(not any(word in raw for word in ("authorization", "api-key", "x-api-key", "cookie", "bearer ", "access_token", "refresh_token")), "sensitive HTTP material in evidence projection")

def session_health(path: Path) -> bool:
    _slot, _header, entries, _raw = omp_session.load_physical_session(path); terminal = goal_complete = False
    for entry in entries:
        data = entry.get("data"); goal = data.get("goal") if isinstance(data, dict) else None; goal_complete |= isinstance(goal, dict) and goal.get("status") == "complete"; message = entry.get("message") if entry.get("type") == "message" else None
        if isinstance(message, dict) and message.get("role") == "assistant":
            permanent(message.get("retryRecovery") is None and message.get("stopReason") != "error", "retry/provider error is permanent")
            terminal |= message.get("stopReason") == "stop" and goal_complete
        terminal |= (entry.get("type") == "mode_change" and entry.get("mode") == "none") or (entry.get("type") == "custom" and entry.get("customType") == "session_exit")
    return terminal

def verify_submission_prefix(path: Path, **expected: Any) -> dict[str, Any]:
    session_health(path); projection = ORIGINAL_PREFIX(path, **expected); entries = debug_entries(Path(rows()[0]["cwd"])); requests = [p for p in entries if p.suffix == ".json"]; target = row_dir() / "http_prefix_receipt.json"
    if not requests and target.exists():
        private = Path(rows()[0]["private_capture_dir"]); request_path = private / "rr-session-1.json"; permanent(private.is_dir() and not private.is_symlink() and request_path.is_file() and not request_path.is_symlink(), "completed private HTTP prefix source"); request = safe_request(request_path); receipt = P.load_json(target); permanent(receipt == {"schema_id":"pm.r10.storage_pipeline.http_prefix_receipt.v1","phase":"active_goal_request_1","session_id":projection["session_id"],"goal_id":projection["goal_id"],"session_prefix_bytes":projection["session_prefix_bytes"],"session_prefix_sha256":projection["session_prefix_sha256"],"request":request,"sensitive_material_copied":False}, "completed immutable HTTP prefix receipt"); return projection
    if not requests: raise omp_session.OmpSessionError("waiting for immutable request-debug prefix")
    permanent(len(requests) == 1, "exactly one request at active-Goal prefix")
    try: request = safe_request(requests[0])
    except (P.PipelineError, OSError, UnicodeError, ValueError, KeyError, TypeError) as exc: raise omp_session.OmpSessionError("waiting for complete request-debug prefix") from exc
    receipt = {"schema_id": "pm.r10.storage_pipeline.http_prefix_receipt.v1", "phase": "active_goal_request_1", "session_id": projection["session_id"], "goal_id": projection["goal_id"], "session_prefix_bytes": projection["session_prefix_bytes"], "session_prefix_sha256": projection["session_prefix_sha256"], "request": request, "sensitive_material_copied": False}
    no_sensitive(receipt)
    if target.exists(): permanent(P.load_json(target) == receipt, "immutable HTTP prefix receipt")
    else: write_once(target, receipt)
    return projection

def final_http(structural: dict[str, Any]) -> dict[str, Any]:
    final_path = row_dir() / "http_final_receipt.json"; private = Path(rows()[0]["private_capture_dir"])
    if final_path.exists():
        receipt = P.load_json(final_path); validate_final_http(receipt, structural, private); return receipt
    entries = debug_entries(Path(rows()[0]["cwd"])); permanent(len(entries) == 4, "exactly two complete HTTP request pairs")
    requests = [p for p in entries if p.suffix == ".json"]; permanent(len(requests) == 2, "exactly two HTTP requests")
    assistants = [structural["entry_ids"]["goal_call_assistant"], structural["entry_ids"]["final_assistant"]]; pairs = []
    for index, request_path in enumerate(requests, 1):
        response = request_path.with_name(request_path.stem + ".res.log"); permanent(response in entries and response.stat().st_size > 0, "complete paired HTTP response")
        pairs.append({"pair_index": index, "assistant_entry_id": assistants[index - 1], "request": safe_request(request_path), "response": safe_response(response)})
    receipt = {"schema_id": "pm.r10.storage_pipeline.http_final_receipt.v1", "phase": "terminal_two_assistant_pairs", "request_pair_count": 2, "verified_assistant_turn_count": structural["assistant_message_count"], "pairs": pairs, "sensitive_material_copied": False}
    no_sensitive(receipt); prefix = P.load_json(row_dir() / "http_prefix_receipt.json"); permanent(prefix["request"] == pairs[0]["request"], "prefix/final request identity")
    write_once(final_path, receipt); private.mkdir(mode=0o700)
    for path in entries: path.replace(private / path.name)
    permanent(not any(Path(rows()[0]["cwd"]).iterdir()), "empty cwd after private capture move"); validate_final_http(receipt, structural, private); return receipt

def validate_final_http(receipt: Any, structural: dict[str, Any], private: Path) -> None:
    permanent(private.is_dir() and not private.is_symlink() and (private.stat().st_mode & 0o777) == 0o700 and isinstance(receipt, dict) and receipt.get("request_pair_count") == receipt.get("verified_assistant_turn_count") == structural.get("assistant_message_count") == 2, "private HTTP roster and assistant 1:1 count")
    assistants = [structural["entry_ids"]["goal_call_assistant"], structural["entry_ids"]["final_assistant"]]; permanent([p.get("assistant_entry_id") for p in receipt.get("pairs", [])] == assistants, "HTTP/assistant ordinal pairing")
    goal_call_id = structural["goal_tool_call_id"]; blocks = P.load_json(row_dir() / "normalized_projection.json")["verified_assistant_text_blocks"]; permanent(receipt["pairs"][0]["request"]["message_roles"] == ["system","user","user"] and receipt["pairs"][1]["request"]["message_roles"] == ["system","user","user","assistant","tool"] and receipt["pairs"][0]["request"]["prior_goal_call_ids"] == receipt["pairs"][0]["request"]["prior_goal_result_ids"] == [] and receipt["pairs"][1]["request"]["prior_goal_call_ids"] == receipt["pairs"][1]["request"]["prior_goal_result_ids"] == [goal_call_id] and len(blocks) == 2 and all((pair["response"]["assistant_text_utf8_bytes"],pair["response"]["assistant_text_sha256"]) == (blocks[index]["utf8_bytes"],blocks[index]["sha256"]) for index, pair in enumerate(receipt["pairs"])) and receipt["pairs"][0]["response"]["goal_call_ids"] == [goal_call_id] and receipt["pairs"][0]["response"]["goal_call_names"] == ["goal"] and receipt["pairs"][0]["response"]["goal_call_arguments"] == '{"op":"complete"}' and receipt["pairs"][1]["response"]["goal_call_ids"] == receipt["pairs"][1]["response"]["goal_call_names"] == [] and receipt["pairs"][1]["response"]["goal_call_arguments"] == "", "HTTP request/response/assistant causal pairing")
    expected = []
    for pair in receipt["pairs"]:
        permanent(pair["request"]["endpoint"] == ENDPOINT and pair["request"]["method"] == "POST" and pair["request"]["model"] == "glm-5.3-flash" and pair["request"]["reasoning_effort"] == "max" and pair["request"]["tool_names"] == ["goal"], "safe request projection")
        for record in (pair["request"], pair["response"]):
            path = private / record["name"]; permanent(path.is_file() and not path.is_symlink() and (path.stat().st_mode & 0o777) == 0o600 and path.stat().st_size == record["bytes"] and P.sha256_file(path) == record["sha256"] and (safe_request(path) if path.suffix == ".json" else safe_response(path)) == record, "private raw hash/projection join"); expected.append(record["name"])
    permanent(sorted(expected) == sorted(p.name for p in private.iterdir()), "private capture exact roster"); no_sensitive(receipt)

def verify_session(path: Path, **expected: Any) -> dict[str, Any]:
    terminal_hint = session_health(path)
    try: structural = ORIGINAL_SESSION(path, **expected)
    except omp_session.OmpSessionError as exc:
        if terminal_hint: raise PermanentCanaryError(f"terminal structural failure: {exc}") from exc
        raise
    normalized = NORMALIZE(path, structural, oracle_path=V7 / "oracle.json", schema_path=V7 / "response.schema.json", max_text_block_utf8_bytes=P.load_json(V7 / "matrix.json")["max_final_assistant_utf8_bytes"])
    if expected.get("require_exit") is True:
        for target, value in ((row_dir() / "structural_projection.json", structural), (row_dir() / "normalized_projection.json", normalized)):
            if target.exists(): permanent(P.load_json(target) == value, f"immutable {target.name}")
            else: write_once(target, value)
        final_http(structural)
    return normalized

def formal_chain() -> dict[str, Any]:
    names = ("reservation.json", "omp_preflight.json", "launch.json", "submission_acceptance.json", "session.raw.jsonl", "http_prefix_receipt.json", "http_final_receipt.json", "structural_projection.json", "normalized_projection.json")
    records = {name: row_record(row_dir() / name) for name in names}; launch, acceptance, prefix = (P.load_json(row_dir() / name) for name in ("launch.json", "submission_acceptance.json", "http_prefix_receipt.json"))
    permanent(launch["omp_preflight_sha256"] == records["omp_preflight.json"]["sha256"], "launch/preflight join")
    permanent(acceptance["session_prefix"]["sha256"] == prefix["session_prefix_sha256"] and acceptance["session_projection"]["session_id"] == prefix["session_id"], "acceptance/HTTP prefix join")
    return {"schema_id": "pm.r10.storage_pipeline.formal_terminal_chain.v1", "ordered_paths": list(names), "records": records}

def atomic_json(path: Path, value: Any) -> None:
    if path.name == "terminal.json" and isinstance(value, dict) and value.get("status") == "PASS":
        value = copy.deepcopy(value); value["formal_chain"] = formal_chain(); extras = ("http_prefix_receipt.json", "http_final_receipt.json", "structural_projection.json", "normalized_projection.json")
        value["evidence"] = [*value["evidence"], *(row_record(row_dir() / name) for name in extras)]
    ORIGINAL_ATOMIC(path, value)

class SubprocessProxy:
    def __getattr__(self, name: str) -> Any: return getattr(subprocess, name)
    def Popen(self, argv: Any, *args: Any, **kwargs: Any) -> Any:
        if isinstance(argv, list) and "--model" in argv:
            row = rows()[0]; permanent(argv == base.expected_argv(route_map()[ROUTE_ID], row) and "--config" not in argv, "exact native argv")
            permanent(DISPATCH_CUSTODY == git_custody(), "source custody changed before Popen"); permanent(not os.path.lexists(row["private_capture_dir"]), "fresh private capture")
            permanent(not debug_entries(Path(row["cwd"])), "empty cwd before Popen"); env = dict(kwargs["env"]); permanent(env.get("PI_CODING_AGENT_DIR") == row["profile_dir"], "disposable profile binding"); env["PI_REQ_DEBUG"] = "1"; kwargs["env"] = env
        return ORIGINAL_POPEN(argv, *args, **kwargs)

PROXY, SPROXY = PipelineProxy(), SubprocessProxy()
BINDINGS = ((base, "EVIDENCE", EVIDENCE), (base, "route_map", route_map), (base, "plan_rows", rows), (base, "planned_row", planned_row), (base, "row_preflight", row_preflight), (base, "verify_composer_transition", composer_transition), (base, "atomic_json", atomic_json), (base, "pipeline", PROXY), (base, "subprocess", SPROXY), (omp_session, "verify_submission_prefix", verify_submission_prefix), (omp_session, "verify_session", verify_session), (V, "EVIDENCE", EVIDENCE), (V, "launch_plan_map", launch_plan_map), (V, "pipeline", PROXY))

@contextlib.contextmanager
def installed() -> Iterator[None]:
    saved = [(module, name, getattr(module, name)) for module, name, _ in BINDINGS]
    try:
        for module, name, value in BINDINGS: setattr(module, name, value)
        yield
    finally:
        for module, name, value in reversed(saved): setattr(module, name, value)

def verify_formal(row: dict[str, Any], custody: dict[str, Any]) -> dict[str, Any]:
    directory = row_dir(); terminal = P.load_json(directory / "terminal.json"); permanent(terminal.get("formal_chain") == formal_chain(), "terminal formal chain")
    preflight = P.load_json(directory / "omp_preflight.json"); permanent(preflight.get("git_custody") == custody and preflight.get("owned_sources") == custody["sources"] and preflight.get("dependency_custody") == custody["dependencies"], "preflight pushed custody")
    permanent(file_record(HERE / "models.yml") == preflight.get("models_override"), "override receipt")
    profile = Path(row["profile_dir"]); override = profile / "models.yml"; permanent(profile.is_dir() and not profile.is_symlink() and override.is_file() and not override.is_symlink() and override.read_bytes() == MODELS_BYTES and (override.stat().st_mode & 0o777) == 0o600, "completed disposable profile custody")
    rendered = base.strip_terminal((directory / "pre_prompt.raw").read_bytes()); permanent(VISIBLE_MAX in rendered and b"xhigh" not in rendered.lower(), "visible max custody")
    structural, normalized = P.load_json(directory / "structural_projection.json"), P.load_json(directory / "normalized_projection.json"); validate_final_http(P.load_json(directory / "http_final_receipt.json"), structural, Path(row["private_capture_dir"]))
    permanent(normalized["result_normalization"]["canonical_text"] == terminal["final_assistant_text"] and normalized["raw_last_assistant_sha256"] == structural["final_text_sha256"], "normalization terminal/raw join")
    permanent(not any(Path(row["cwd"]).iterdir()), "completed cwd empty"); return terminal

def verify_prefix() -> dict[str, Any]:
    row = rows()[0]
    if not os.path.lexists(EVIDENCE):
        permanent(not any(os.path.lexists(row[name]) for name in ("cwd", "session_dir", "profile_dir", "private_capture_dir")), "empty prefix runtime absence")
        return {"status": "PASS_EMPTY_PREFIX_ZERO_CREDIT", "row_count": 0, "subject_calls": 0, "qualification_credit": 0}
    permanent(EVIDENCE.is_dir() and not EVIDENCE.is_symlink() and {p.name for p in EVIDENCE.iterdir()} == {"launch_journal.jsonl", "pass_01"}, "evidence root exact roster")
    pass_dir = EVIDENCE / "pass_01"; permanent(pass_dir.is_dir() and not pass_dir.is_symlink() and {p.name for p in pass_dir.iterdir()} == {ROUTE_ID}, "one-row pass evidence roster")
    terminal = P.load_json(row_dir() / "terminal.json"); permanent(terminal.get("status") == "PASS", "fail-stop consumed row")
    custody = git_custody()
    with installed(): report = V.verify_row("pass_01", route_map()[ROUTE_ID])
    verify_formal(row, custody); V.verify_launch_journal([{"pass_id": "pass_01", "rows": [report]}]); V.verify_global_uniqueness([{"pass_id": "pass_01", "rows": [report]}])
    return {"status": "PASS_GLM53_MAX_NORMALIZED_CANARY_ZERO_CREDIT", "row_count": 1, "subject_calls": 0, "qualification_credit": 0}

def validate_static(*, unused: bool = True) -> dict[str, Any]:
    contract = spec(); require(contract["schema_id"] == "pm.r10.storage_pipeline.glm53_max_normalized_canary.v1" and contract["owned_file_roster"] == list(SOURCES), "contract/roster")
    actual = {p.name for p in HERE.iterdir()}; require(actual == set(SOURCES) if unused else actual in (set(SOURCES), set(SOURCES) | {"evidence"}), "owned root roster")
    require(all((HERE / name).is_file() and not (HERE / name).is_symlink() for name in SOURCES), "regular owned files")
    metrics = {name: {"lines": len((HERE / name).read_bytes().splitlines()), "bytes": (HERE / name).stat().st_size} for name in SOURCES}; limits = contract["architecture_limits"]
    require(metrics["controller.py"]["lines"] <= limits["controller_max_lines"] and sum(v["lines"] for v in metrics.values()) <= limits["package_max_lines"], "lean line budgets")
    require((HERE / "models.yml").read_bytes() == MODELS_BYTES and file_record(HERE / "models.yml") == contract["models_override"], "exact models override")
    for record in contract["dependencies"]: require(file_record(REPO / record["path"]) == record, f"dependency drift: {record['path']}")
    row, route = rows()[0], route_map()[ROUTE_ID]; require(len(rows()) == 1 and row["ordinal"] == 1 and row["pass_id"] == "pass_01" and row["route_id"] == ROUTE_ID, "one frozen identity"); require(len(row["nonce"]) == 32 and row["attempt_id"].endswith(row["nonce"][:10]) and row["evidence_path"] == f"evidence/pass_01/{ROUTE_ID}" and row["cwd"].startswith("/tmp/pm-r10-storage-v7-") and row["session_dir"].startswith("/tmp/pm-r10-storage-v7-session-") and row["profile_dir"].startswith("/tmp/pm-r10-storage-v7-profile-") and row["private_capture_dir"].startswith("/tmp/pm-r10-storage-v7-http-"), "fresh frozen path scopes")
    require(route == {"id": ROUTE_ID, "surface": "omp_tui", "model": "opencode-go/glm-5.3-flash", "thinking": "max"} and row["model"] == route["model"] and row["thinking"] == "max", "one exact route"); authority = contract["authority"]; require(authority["authorized_attempt_ids"] == [row["attempt_id"]] and authority["authorized_selector"] == row["model"] and authority["authorized_thinking"] == row["thinking"] and all(authority[key] is False for key in ("retry_replacement_or_reuse_authorized","retro_credit_authorized","other_provider_model_matrix_or_route_authorized")) and all(authority[key] == 0 for key in ("qualification_credit","matrix_credit","production_credit")), "closed one-row zero-credit authority")
    prompt = V7 / "prompts/omp.prompt.txt"; require(prompt.stat().st_size == row["prompt_utf8_bytes"] == 3036 and P.sha256_file(prompt) == row["prompt_sha256"] == "eff40a61579a080ce6e21bb71bcae2dd0640c100c9d61c199f45ac5dece43638", "frozen prompt"); runtime, http = contract["runtime"], contract["http_receipts"]; require(runtime["row_time_budget_seconds"] == runtime["active_wait_seconds"] == 3600 and runtime["advisor_enabled"] is False and runtime["task_agent_advisor"] == {"task":"off"} and runtime["config_cli_overlay"] is None and runtime["ordinary_tools_enabled"] is False and runtime["external_goal_prompt_count"] == 1 and runtime["low_level_input_order"] == ["exact_3036_byte_prompt_without_terminator","standalone_CR"] and runtime["normal_exit_required"] is runtime["foreign_windows_omp_terminal_excluded"] is True and http["request_endpoint"] == ENDPOINT and http["request_method"] == "POST" and http["request_body_model"] == "glm-5.3-flash" and http["request_reasoning_effort"] == "max" and http["sole_tool"] == "goal" and http["response_status_line"] == "HTTP 200 OK" and http["response_stream"] == "data_json_plus_one_DONE" and http["response_pairing"] == "response1_goal_call_and_text_hash_response2_distinct_final_text_hash" and http["raw_request_response_storage"] == "private_runtime_path_only" and http["raw_authorization_headers_copied_to_repo_evidence"] is False and http["safe_evidence_projection_fields"] == ["name","bytes","sha256","endpoint","method","model","reasoning_effort","tool_names","message_roles","prior_goal_call_ids","prior_goal_result_ids","status_line","sse_chunk_count","done_count","assistant_text_utf8_bytes","assistant_text_sha256","goal_call_ids","goal_call_names","goal_call_arguments"] and http["prefix_request_pair_count"] == 1 and http["terminal_request_pair_count"] == http["verified_assistant_turn_count"] == 2, "closed runtime and HTTP contracts")
    for path in R10.rglob("*.json"):
        if path != CONTRACT: require(row["nonce"].encode() not in path.read_bytes() and row["attempt_id"].encode() not in path.read_bytes(), "fresh historical identity")
    if unused: require(not os.path.lexists(EVIDENCE) and not any(os.path.lexists(row[name]) for name in ("cwd", "session_dir", "profile_dir", "private_capture_dir")), "unused paths absent")
    verification = contract["verification"]; require(P.sha256_file(NORMALIZER) == "382cb5bb0b357bc223010a813dbef7e9c8daf8f952568db0ce4d5e1620129a43" and verification["structural_first"] == "system_pipeline_sandbox_v7.omp_session.verify_session" and verification["normalization_second"] == "storage_glm53_normalized_canary_v2.result_normalizer.normalize_verified_session" and verification["unchanged_scorer"] == "system_pipeline_sandbox_v7.omp_row_runner.exact_result" and verification["terminal_chain"] == ["reservation.json","omp_preflight.json","launch.json","submission_acceptance.json","session.raw.jsonl","http_prefix_receipt.json","http_final_receipt.json","structural_projection.json","normalized_projection.json"], "pushed structural/normalizer/scorer chain")
    require(P.verify()["status"] == "PASS_VERIFIED_NO_WORKNODES" and freeze_check.verify_freeze()["status"] == "PASS_FROZEN_ZERO_SUBJECT", "V7 freeze/pipeline")
    require(not list(HERE.rglob("*.pyc")) and not list(HERE.rglob("__pycache__")), "no bytecode cache")
    return {"status": "PASS_LOCAL_GLM53_MAX_NORMALIZED_CANARY", "metrics": metrics, "temporary_bindings": len(BINDINGS), "subject_calls": 0, "qualification_credit": 0}

def preserve_failure(row: dict[str, Any]) -> None:
    directory = row_dir(); directory.mkdir(parents=True, exist_ok=True)
    if not (directory / "reservation.json").exists(): write_once(directory / "reservation.json", {"schema_id": "pm.r10.storage_pipeline.partial_reservation_recovery.v1", **{k: row[k] for k in ("pass_id", "route_id", "ordinal", "attempt_id", "nonce")}, "qualification_credit": 0, "no_retry": True})
    live = base.session_file(Path(row["session_dir"])); target = directory / "postfailure_session.raw.jsonl"
    if live is not None and not target.exists(): P.atomic_write(target, live.read_bytes())

ERRORS = (CanaryError, PermanentCanaryError, _normalizer.NormalizationError, base.RunnerError, omp_session.OmpSessionError, V.VerifyError, P.PipelineError, subprocess.SubprocessError, OSError, ValueError, KeyError, TypeError, AssertionError)

def dispatch(argv: list[str] | None = None) -> int:
    global DISPATCH_CUSTODY
    parser = argparse.ArgumentParser(); parser.add_argument("command", choices=("lint", "verify-prefix", "run")); parser.add_argument("ordinal", nargs="?", type=int, choices=(1,)); parser.add_argument("--max-seconds", type=int, default=3600); args = parser.parse_args(argv)
    row = rows()[0]; before: tuple[bool, bool, bool] | None = None; os.umask(0o077)
    try:
        require((args.command == "run") == (args.ordinal is not None), "ordinal only for run")
        static = validate_static(unused=args.command == "lint")
        if args.command == "lint": print(P.canonical_json({"status": "PASS_ZERO_SUBJECT_LINT", **static})); return 0
        if args.command == "verify-prefix": print(P.canonical_json(verify_prefix())); return 0
        require(args.max_seconds == 3600 and spec()["authority"]["authorized_attempt_ids"] == [row["attempt_id"]], "exact one-use authority/budget")
        DISPATCH_CUSTODY = git_custody(); prefix = verify_prefix(); require(prefix["row_count"] == 0, "canary already consumed")
        before = tuple(os.path.lexists(path) for path in (EVIDENCE, row_dir().parent, row_dir()))
        with installed(): terminal = base.run_row("pass_01", ROUTE_ID, 3600)
    except base.ReservationConflict as exc: print(P.canonical_json({"status": "FAIL_ALREADY_CONSUMED_NO_MUTATION", "error": str(exc), "qualification_credit": 0})); return 1
    except ERRORS as exc:
        claimed = before is not None and any(os.path.lexists(path) != old or os.path.lexists(path) for path, old in zip((EVIDENCE, row_dir().parent, row_dir()), before, strict=True))
        if claimed:
            preserve_failure(row)
            with installed(): base.record_failure("pass_01", ROUTE_ID, exc)
        print(P.canonical_json({"status": "FAIL_GLM53_MAX_CANARY_CONSUMED_NO_RETRY" if claimed else "FAIL_PRELAUNCH_NO_MUTATION", "error": f"{type(exc).__name__}: {exc}", "qualification_credit": 0})); return 1
    finally: DISPATCH_CUSTODY = None
    print(P.canonical_json({"status": "PASS_GLM53_MAX_NORMALIZED_CANARY_ZERO_CREDIT", "terminal": terminal, "qualification_credit": 0})); return 0

if __name__ == "__main__": raise SystemExit(dispatch())
