#!/usr/bin/env python3
"""One pushed, one-use, zero-credit GLM53/max normalized Storage canary V6."""
from __future__ import annotations
import argparse
import contextlib
import copy
import importlib.util
import json
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
NORMALIZER = HERE / "result_normalizer.py"
sys.path.insert(0, str(V7))
import freeze_check  # type: ignore  # noqa: E402
import omp_row_runner as base  # type: ignore  # noqa: E402
import omp_session  # type: ignore  # noqa: E402
import pipeline as P  # type: ignore  # noqa: E402
import verify_matrix as V  # type: ignore  # noqa: E402
CONTRACT = HERE / "canary_contract.json"
EVIDENCE = HERE / "evidence"
SOURCES = ("README.md", "canary_contract.json", "controller.py", "selftest.py", "models.yml", "result_normalizer.py")
ROUTE_ID = "omp_glm53_flash_max"
ENDPOINT = "https://opencode.ai/zen/go/v1/chat/completions"
HTTP_FINAL_SCHEMA = "pm.r10.storage_pipeline.http_final_receipt.v6"
HTTP_FINAL_PHASE = "post_structural_order_sensitive_normalized_normal_exit_complete_pairs"
HTTP_FINAL_KEYS = {"schema_id","phase","request_pair_count","verified_assistant_turn_count","pairs","sensitive_material_copied"}
MODELS_BYTES = b"providers:\n  opencode-go:\n    modelOverrides:\n      glm-5.3-flash:\n        thinking:\n          mode: effort\n          efforts: [low, high, max]\n"
VISIBLE_MAX = "GLM-5.3-Flash (2x usage) · ◉ max ·".encode()
PROMPT_READY = "❯".encode()
MCP_SENTINEL = b"MCP finished"
ENV_PATHS = {"HOME":"home_dir","XDG_CONFIG_HOME":"xdg_config_home","XDG_CACHE_HOME":"xdg_cache_home","XDG_DATA_HOME":"xdg_data_home","CLAUDE_CONFIG_DIR":"claude_config_dir","COPILOT_HOME":"copilot_home"}
ORIGINAL_PREFLIGHT = base.row_preflight
ORIGINAL_ATOMIC = base.atomic_json
ORIGINAL_EXPECTED_ARGV = base.expected_argv
ORIGINAL_VERIFY_ARGV = V.expected_argv
ORIGINAL_RUN_ROW, ORIGINAL_VERIFY_OMP_RAW = base.run_row, V.verify_omp_raw
ORIGINAL_PREFIX = omp_session.verify_submission_prefix
ORIGINAL_SESSION = omp_session.verify_session
ORIGINAL_POPEN, ORIGINAL_RUN = subprocess.Popen, subprocess.run
_spec = importlib.util.spec_from_file_location("glm53_max_normalizer_v6", NORMALIZER)
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
    return {"path":path.relative_to(root).as_posix(),"bytes":path.stat().st_size,"sha256":P.sha256_file(path)}
def runtime_record(path: Path) -> dict[str, Any]:
    require(path.is_file() and not path.is_symlink(), f"regular runtime file: {path}")
    return {"path":str(path),"bytes":path.stat().st_size,"sha256":P.sha256_file(path),"mode":oct(path.stat().st_mode & 0o777)}
def row_record(path: Path) -> dict[str, Any]: return file_record(path, row_dir())
def write_once(path: Path, value: Any) -> None:
    require(not os.path.lexists(path), f"immutable receipt already exists: {path.name}"); P.atomic_write(path, P.pretty_json(value))
def run_git(*args: str, binary: bool = False) -> subprocess.CompletedProcess[Any]:
    return ORIGINAL_RUN(["git","-C",str(REPO),*args], check=False, capture_output=True, text=not binary)
def git_entry(relative: str, index: bool) -> tuple[str, str]:
    result = run_git(*( ("ls-files","--stage","--",relative) if index else ("ls-tree","HEAD","--",relative) ))
    lines = result.stdout.splitlines(); require(result.returncode == 0 and len(lines) == 1, f"one Git entry: {relative}")
    metadata, seen = lines[0].split("\t",1); fields = metadata.split(); require(seen == relative and len(fields) == 3, "Git entry shape")
    if index: require(fields[2] == "0", "stage-0 index entry"); return fields[0], fields[1]
    require(fields[1] == "blob", "HEAD blob entry"); return fields[0], fields[2]
def git_file(relative: str) -> dict[str, Any]:
    path, current = REPO / relative, REPO
    for part in Path(relative).parts[:-1]: current /= part; require(current.is_dir() and not current.is_symlink(), "non-symlink source parents")
    mode = path.lstat().st_mode; require(stat.S_ISREG(mode) and not path.is_symlink(), "regular live source")
    index, head = git_entry(relative, True), git_entry(relative, False); require(index == head and head[0] in {"100644","100755"}, "index/HEAD identity")
    blob = run_git("cat-file","blob",head[1],binary=True); require(blob.returncode == 0 and blob.stdout == path.read_bytes(), "live/HEAD blob identity")
    require(bool(mode & 0o111) == (head[0] == "100755"), "live/HEAD executable bit"); return {**file_record(path),"git_mode":head[0],"git_oid":head[1]}
def git_custody() -> dict[str, Any]:
    refs = [run_git("rev-parse",ref) for ref in ("HEAD","origin/main","truenas-backup/main")]; values = [r.stdout.strip() for r in refs]
    require(all(r.returncode == 0 for r in refs) and len(set(values)) == 1 and len(values[0]) == 40, "dual-pushed candidate")
    owned = [git_file((HERE / name).relative_to(REPO).as_posix()) for name in SOURCES]; dependencies = [git_file(record["path"]) for record in spec()["dependencies"]]
    require([{k:r[k] for k in ("path","bytes","sha256")} for r in dependencies] == spec()["dependencies"], "dependency freeze")
    return {"candidate_commit":values[0],"head":values[0],"origin_main":values[1],"truenas_backup_main":values[2],"sources":owned,"dependencies":dependencies}
def runtime_manifest(path: Any) -> Any:
    value = P.load_json(path)
    if Path(path).resolve() == (V7 / "runtime_manifest.json").resolve():
        value = copy.deepcopy(value); runtime = spec()["runtime"]
        for key in ("binary","binary_bytes","binary_sha256","version"): value["omp"][key] = runtime[key]
        value["omp"]["profile_dir"] = rows()[0]["profile_dir"]
    return value
class PipelineProxy:
    def __getattr__(self, name: str) -> Any: return runtime_manifest if name == "load_json" else getattr(P, name)
def prepare_profile() -> dict[str, Any]:
    row, target = rows()[0], Path(rows()[0]["profile_dir"]); roots = [Path(row[field]) for field in ENV_PATHS.values()]
    require(not any(os.path.lexists(path) for path in [target,*roots]), "fresh isolated profile/environment roots")
    source = Path(P.load_json(V7 / "runtime_manifest.json")["omp"]["profile_dir"]); require(source.is_dir() and not source.is_symlink(), "safe approved profile source")
    target.mkdir(mode=0o700)
    origins, seeds = [], []
    for name in ("config.yml","agent.db","models.db"):
        path = source / name; require(path.is_file() and not path.is_symlink(), f"safe profile source: {name}"); origins.append(runtime_record(path)); shutil.copy2(path,target / name); os.chmod(target / name,0o600); seeds.append(runtime_record(target / name))
    shutil.copy2(HERE / "models.yml",target / "models.yml"); os.chmod(target / "models.yml",0o600); seeds.append(runtime_record(target / "models.yml"))
    for path in roots: path.mkdir(mode=0o700)
    require({p.name for p in target.iterdir()} == {"config.yml","agent.db","models.db","models.yml"} and all(not any(path.iterdir()) for path in roots), "exact four-file seed and empty environment roots")
    require((target / "models.yml").read_bytes() == MODELS_BYTES and b"!" not in (target / "config.yml").read_bytes() + MODELS_BYTES, "exact safe override/no command config")
    return {"source_profile":str(source),"source_records":origins,"seed_records":seeds,"seed_roster":["agent.db","config.yml","models.db","models.yml"],"mcp_tool_extension_seed_files":0,"environment_roots":{key:row[field] for key,field in ENV_PATHS.items()},"environment_roots_initially_empty":True,"omp_profile":"default","pi_profile":"default"}
def isolated_env(source: dict[str, str]) -> dict[str, str]:
    row, env = rows()[0], dict(source); env["PI_CODING_AGENT_DIR"] = row["profile_dir"]
    for key, field in ENV_PATHS.items(): env[key] = row[field]
    env["OMP_PROFILE"] = env["PI_PROFILE"] = "default"; return env
def with_no_extensions(argv: list[str]) -> list[str]:
    permanent("--config" not in argv and "--no-extensions" not in argv and argv.count("--cwd") == 1, "base native argv")
    index = argv.index("--cwd"); return [*argv[:index],"--no-extensions",*argv[index:]]
def expected_argv(route: dict[str, Any], row: dict[str, Any]) -> list[str]: return with_no_extensions(ORIGINAL_EXPECTED_ARGV(route,row))
def verify_expected_argv(route: dict[str, Any], cwd: str, session_dir: str) -> list[str]: return with_no_extensions(ORIGINAL_VERIFY_ARGV(route,cwd,session_dir))
def prompt_ready_run_row() -> Any:
    code = ORIGINAL_RUN_ROW.__code__; permanent(sum(item == MCP_SENTINEL for item in code.co_consts) == 1, "one V7 MCP sentinel constant")
    patched = code.replace(co_consts=tuple(PROMPT_READY if item == MCP_SENTINEL else item for item in code.co_consts))
    function = types.FunctionType(patched,ORIGINAL_RUN_ROW.__globals__,ORIGINAL_RUN_ROW.__name__,ORIGINAL_RUN_ROW.__defaults__,ORIGINAL_RUN_ROW.__closure__)
    function.__kwdefaults__ = ORIGINAL_RUN_ROW.__kwdefaults__; return function
PROMPT_READY_RUN_ROW = prompt_ready_run_row()
def prompt_ready_verify_omp_raw_clone() -> Any:
    code = ORIGINAL_VERIFY_OMP_RAW.__code__; permanent(sum(item == MCP_SENTINEL for item in code.co_consts) == 1 and sum(item == "mcp_startup_finished" for item in code.co_consts) == 1, "one V7 verifier sentinel/key pair")
    patched = code.replace(co_consts=tuple(PROMPT_READY if item == MCP_SENTINEL else "prompt_ready_observed" if item == "mcp_startup_finished" else item for item in code.co_consts)); return types.FunctionType(patched,ORIGINAL_VERIFY_OMP_RAW.__globals__,ORIGINAL_VERIFY_OMP_RAW.__name__,ORIGINAL_VERIFY_OMP_RAW.__defaults__,ORIGINAL_VERIFY_OMP_RAW.__closure__)
PROMPT_READY_VERIFY_OMP_RAW = prompt_ready_verify_omp_raw_clone()
def verify_omp_raw(path: Path, route: dict[str, Any], launch: dict[str, Any], terminal: dict[str, Any]) -> str:
    receipt, pre, composer = P.load_json(path / "composer_ack.json"), base.strip_terminal((path / "pre_prompt.raw").read_bytes()), base.strip_terminal((path / "composer_ack.raw").read_bytes()); permanent(receipt.get("prompt_ready_observed") is True and receipt.get("mcp_startup_finished") is False and receipt.get("mcp_finished_banner_observed") is False and MCP_SENTINEL not in pre and MCP_SENTINEL not in composer, "truthful empty-MCP prompt readiness"); return PROMPT_READY_VERIFY_OMP_RAW(path,route,launch,terminal)
DISPATCH_CUSTODY: dict[str, Any] | None = None
def row_preflight(path: Path, row: dict[str, Any], route: dict[str, Any]) -> dict[str, Any]:
    seed = prepare_profile(); receipt = ORIGINAL_PREFLIGHT(path,row,route); require(git_custody() == DISPATCH_CUSTODY, "source custody changed before preflight")
    require(receipt["effective_config"]["advisor.enabled"] is False and receipt["effective_config"]["task.agentAdvisor"] == {"task":"off"}, "advisor controls off")
    receipt.update({"canary_contract":file_record(CONTRACT),"owned_sources":DISPATCH_CUSTODY["sources"],"dependency_custody":DISPATCH_CUSTODY["dependencies"],"git_custody":DISPATCH_CUSTODY,"models_override":file_record(HERE / "models.yml"),"profile_seed":seed,"private_http_capture":True,"raw_http_copied_to_evidence":False,"row_time_budget_seconds":3600})
    base.atomic_json(path / "omp_preflight.json",receipt); return receipt
def composer_transition(before: bytes, after: bytes) -> dict[str, Any]:
    permanent(isinstance(before,bytes) and isinstance(after,bytes) and before and after.startswith(before), "composer snapshot contamination"); pre, post, delta = base.strip_terminal(before), base.strip_terminal(after), base.strip_terminal(after[len(before):])
    markers = ("📄 #1".encode(),b"/goal Audit","❯ 📄 #1".encode()); submitted, prompt = row_dir() / "stdin_prompt.raw", V7 / "prompts/omp.prompt.txt"; permanent(submitted.is_file() and not submitted.is_symlink() and submitted.read_bytes() == prompt.read_bytes() and PROMPT_READY in pre and MCP_SENTINEL not in pre and MCP_SENTINEL not in post and all(marker not in pre for marker in markers) and VISIBLE_MAX in pre and b"xhigh" not in post.lower(), "permanent pre-composer custody")
    previews, cards = re.findall(rb"/goal ([A-Za-z]+)",delta), re.findall("📄 #([0-9]+)".encode(),delta); ready = all(marker in post for marker in markers) and len(after) > len(before); permanent(all(b"Audit".startswith(value) for value in previews) and all(value == b"1" for value in cards) and (not ready or (previews[-1:] == [b"Audit"] and cards[-1:] == [b"1"])), "permanent composer contradiction")
    if not ready: raise base.RunnerError("prompt-specific composer transition pending")
    return {"mcp_startup_finished":False,"mcp_finished_banner_observed":False,"prompt_ready_observed":True,"prompt_ready_glyph":"❯","prompt_card":"📄 #1","prompt_preview":"/goal Audit","composer_state":"❯ 📄 #1","pre_prompt_bytes":len(before),"pre_prompt_sha256":P.sha256_bytes(before),"new_raw_bytes":len(after)-len(before),"visible_model":"GLM-5.3-Flash (2x usage)","visible_thinking":"max","visible_selection_sha256":P.sha256_bytes(VISIBLE_MAX)}

def debug_entries(directory: Path) -> list[Path]:
    if not directory.is_dir(): return []
    entries = sorted(directory.iterdir()); permanent(all(p.is_file() and not p.is_symlink() and re.fullmatch(r"rr-session-[1-9][0-9]*(?:\.json|\.res\.log)",p.name) for p in entries), "request-debug cwd contamination"); return entries
def safe_request(path: Path) -> dict[str, Any]:
    value = P.load_json(path); body = value.get("body"); permanent(isinstance(body,dict), "HTTP request body")
    tools = body.get("tools"); permanent(isinstance(tools,list) and len(tools) == 1 and isinstance(tools[0],dict), "sole native Goal tool"); function = tools[0].get("function")
    permanent(tools[0].get("type") == "function" and isinstance(function,dict) and function.get("name") == "goal", "native Goal tool")
    messages = body.get("messages"); permanent(isinstance(messages,list) and all(isinstance(m,dict) and isinstance(m.get("tool_calls",[]),list) for m in messages), "HTTP message shape")
    calls = [(call.get("id"),call.get("function",{}).get("name"),call.get("function",{}).get("arguments")) for m in messages if m.get("role") == "assistant" for call in m.get("tool_calls",[]) if isinstance(call,dict)]
    results = [m.get("tool_call_id") for m in messages if m.get("role") == "tool"]; texts = [m.get("content") for m in messages if m.get("role") == "assistant"]
    permanent(all(text is None or isinstance(text,str) for text in texts) and all(isinstance(i,str) and i and name == "goal" and isinstance(arguments,str) for i,name,arguments in calls) and all(isinstance(i,str) and i for i in results), "HTTP prior assistant/Goal history"); call_records = [{"id":i,"name":name,"arguments":P.strict_loads(arguments)} for i,name,arguments in calls]; permanent(all(isinstance(call["arguments"],dict) for call in call_records), "HTTP prior Goal arguments")
    permanent(value.get("method") == "POST" and value.get("url") == ENDPOINT and body.get("model") == "glm-5.3-flash" and body.get("reasoning_effort") == "max", "exact GLM53/max HTTP request")
    roles = [m.get("role") for m in messages]; permanent(roles and roles[0] == "system" and all(role in {"system","user","assistant","tool"} for role in roles), "HTTP bounded message roles")
    return {"name":path.name,"bytes":path.stat().st_size,"sha256":P.sha256_file(path),"endpoint":ENDPOINT,"method":"POST","model":"glm-5.3-flash","reasoning_effort":"max","tool_names":["goal"],"message_roles":roles,"prior_assistant_text_sha256":[P.sha256_bytes((text or "").encode()) for text in texts],"prior_goal_call_ids":[item["id"] for item in call_records],"prior_goal_calls":call_records,"prior_goal_result_ids":results}
def safe_usage(value: Any) -> dict[str, int]:
    keys = {"prompt_tokens","completion_tokens","total_tokens","prompt_tokens_details","completion_tokens_details"}; permanent(isinstance(value,dict) and set(value) == keys and isinstance(value["prompt_tokens_details"],dict) and set(value["prompt_tokens_details"]) == {"cached_tokens"} and isinstance(value["completion_tokens_details"],dict) and set(value["completion_tokens_details"]) == {"reasoning_tokens"}, "complete response usage shape")
    result = {"prompt_tokens":value["prompt_tokens"],"completion_tokens":value["completion_tokens"],"total_tokens":value["total_tokens"],"cached_tokens":value["prompt_tokens_details"]["cached_tokens"],"reasoning_tokens":value["completion_tokens_details"]["reasoning_tokens"]}
    permanent(all(type(item) is int and item >= 0 for item in result.values()) and result["total_tokens"] == result["prompt_tokens"] + result["completion_tokens"] and result["cached_tokens"] <= result["prompt_tokens"], "complete response usage values"); return result
def safe_response(path: Path) -> dict[str, Any]:
    permanent(path.is_file() and not path.is_symlink(), "regular private HTTP response"); raw = path.read_bytes(); permanent(raw.count(b"\r\n\r\n") == 1, "one HTTP header/body boundary"); header, body = raw.split(b"\r\n\r\n",1)
    permanent(header.startswith(b"HTTP 200 OK\r\n") and body.endswith(b"\n\n") and b"\r" not in body, "HTTP response status/complete blank-line boundary"); frames = body.split(b"\n\n"); permanent(frames[-1] == b"" and all(frame.startswith(b"data: ") and b"\n" not in frame for frame in frames[:-1]), "strict data-only SSE frames")
    payloads = [frame[6:] for frame in frames[:-1]]; done_positions = [index for index,payload in enumerate(payloads) if payload == b"[DONE]"]; permanent(len(done_positions) <= 1 and (not done_positions or done_positions == [len(payloads)-1]), "optional one final DONE")
    values = [P.strict_loads(payload.decode()) for payload in payloads if payload != b"[DONE]"]; permanent(values, "response JSON events")
    text: list[str] = []; call_ids: list[str] = []; call_names: list[str] = []; arguments: list[str] = []; terminals: list[tuple[int,str]] = []; usages: list[tuple[int,dict[str,int]]] = []; choice_indices: list[int] = []
    for index, value in enumerate(values):
        permanent(isinstance(value,dict) and value.get("model") == "glm-5.3-flash" and isinstance(value.get("choices"),list) and len(value["choices"]) <= 1, "exact response chunk model/choices")
        if value.get("usage") is not None: usages.append((index,safe_usage(value["usage"])))
        for choice in value["choices"]:
            permanent(isinstance(choice,dict) and choice.get("index") == 0 and isinstance(choice.get("delta"),dict), "response choice/delta shape"); choice_indices.append(index); delta = choice["delta"]; finish = choice.get("finish_reason"); permanent(finish is None or finish in {"tool_calls","stop"}, "bounded finish reason")
            if finish is not None: terminals.append((index,finish))
            content = delta.get("content"); permanent(content is None or isinstance(content,str), "response text delta"); text.extend([content] if isinstance(content,str) else [])
            calls = delta.get("tool_calls",[]); permanent(isinstance(calls,list), "response tool-call list")
            for call in calls:
                permanent(isinstance(call,dict) and isinstance(call.get("function",{}),dict), "response tool-call delta"); function = call["function"]
                for target, item, required in ((call_ids,call.get("id"),True),(call_names,function.get("name"),True),(arguments,function.get("arguments"),False)):
                    if item is not None: permanent(isinstance(item,str) and (bool(item) or not required), "response tool-call field"); target.append(item)
    permanent(len(terminals) == len(usages) == 1 and choice_indices and terminals[0][0] == choice_indices[-1], "one terminal finish and usage at final choice event"); terminal_index, finish_reason = terminals[0]; usage_index, usage = usages[0]
    permanent((usage_index == terminal_index == len(values)-1) or (usage_index == terminal_index + 1 == len(values)-1 and values[usage_index]["choices"] == []), "usage on terminal or one subsequent final usage-only event")
    rendered = "".join(text).encode(); done = len(done_positions); return {"name":path.name,"bytes":len(raw),"sha256":P.sha256_bytes(raw),"status_line":"HTTP 200 OK","model":"glm-5.3-flash","sse_chunk_count":len(values),"done_count":done,"termination_basis":"done_sentinel" if done else "finish_reason_and_usage","finish_reason":finish_reason,"terminal_json_index":terminal_index+1,"usage_json_index":usage_index+1,"usage":usage,"assistant_text_utf8_bytes":len(rendered),"assistant_text_sha256":P.sha256_bytes(rendered),"goal_call_ids":call_ids,"goal_call_names":call_names,"goal_call_arguments":"".join(arguments)}
def no_sensitive(value: Any) -> None:
    raw = P.canonical_json(value).lower(); permanent(not any(word in raw for word in ("authorization","api-key","x-api-key","cookie","bearer ","access_token","refresh_token")), "sensitive HTTP material in evidence projection")

def session_health(path: Path) -> bool:
    _slot, _header, entries, _raw = omp_session.load_physical_session(path); explicit_exit = False
    for entry in entries:
        message = entry.get("message") if entry.get("type") == "message" else None
        if isinstance(message,dict) and message.get("role") == "assistant": permanent(message.get("retryRecovery") is None and message.get("stopReason") != "error", "retry/provider error is permanent")
        explicit_exit |= entry.get("type") == "custom" and entry.get("customType") == "session_exit"
    return explicit_exit
def verify_submission_prefix(path: Path, **expected: Any) -> dict[str, Any]: session_health(path); return ORIGINAL_PREFIX(path,**expected)

def assistant_receipts(path: Path, structural: dict[str, Any]) -> list[dict[str, Any]]:
    _slot, _header, entries, _raw = omp_session.load_physical_session(path); result = []
    for index, entry in enumerate(entries):
        message = entry.get("message") if entry.get("type") == "message" else None
        if not isinstance(message,dict) or message.get("role") != "assistant": continue
        content, usage, stop = message.get("content"), message.get("usage"), message.get("stopReason"); permanent(isinstance(content,list) and isinstance(usage,dict) and stop in {"toolUse","stop"}, "assistant content/stop/usage for HTTP join"); text = "".join(block["text"] for block in content if isinstance(block,dict) and block.get("type") == "text" and isinstance(block.get("text"),str)).encode(); safe = {key:usage.get(key) for key in ("input","output","cacheRead","totalTokens","reasoningTokens")}
        permanent(all(type(item) is int and item >= 0 for item in safe.values()) and safe["totalTokens"] == safe["input"] + safe["cacheRead"] + safe["output"], "assistant usage values"); result.append({"assistant_ordinal":len(result)+1,"entry_index":index,"entry_id":entry.get("id"),"text_utf8_bytes":len(text),"text_sha256":P.sha256_bytes(text),"stopReason":stop,"usage":safe})
    permanent(len(result) == structural.get("assistant_message_count") and len(result) in (2,3), "verified standard assistant count")
    ids = [item["entry_id"] for item in result]; permanent(ids[-1] == structural["entry_ids"]["final_assistant"] and ids.count(structural["entry_ids"]["goal_call_assistant"]) == 1, "assistant structural identity/order"); return result
def validate_http_envelope(receipt: Any, count: int) -> None:
    permanent(isinstance(receipt,dict) and set(receipt) == HTTP_FINAL_KEYS and receipt.get("schema_id") == HTTP_FINAL_SCHEMA and receipt.get("phase") == HTTP_FINAL_PHASE and type(receipt.get("request_pair_count")) is int and receipt.get("request_pair_count") == receipt.get("verified_assistant_turn_count") == count and isinstance(receipt.get("pairs"),list) and len(receipt["pairs"]) == count and receipt.get("sensitive_material_copied") is False, "exact final HTTP receipt envelope")
def validate_final_http(receipt: Any, structural: dict[str, Any], private: Path, session_path: Path) -> None:
    assistants = assistant_receipts(session_path,structural); count = len(assistants); validate_http_envelope(receipt,count); call_index = [a["entry_id"] for a in assistants].index(structural["entry_ids"]["goal_call_assistant"]); goal_id = structural["goal_tool_call_id"]
    permanent(private.is_dir() and not private.is_symlink() and (private.stat().st_mode & 0o777) == 0o700, "private HTTP roster")
    permanent([pair.get("assistant") for pair in receipt["pairs"]] == assistants, "HTTP/assistant ordinal pairing")
    expected_names: list[str] = []
    for index, pair in enumerate(receipt["pairs"]):
        request, response, assistant = pair["request"], pair["response"], assistants[index]; prior_hashes = [a["text_sha256"] for a in assistants[:index]]; prior_calls = [] if index <= call_index else [{"id":goal_id,"name":"goal","arguments":{"op":"complete"}}]; prior_ids = [call["id"] for call in prior_calls]
        expected_calls = [goal_id] if index == call_index else []; expected_names_call = ["goal"] if index == call_index else []; expected_args = '{"op":"complete"}' if index == call_index else ""
        expected_finish = {"toolUse":"tool_calls","stop":"stop"}[assistant["stopReason"]]; session_usage = assistant["usage"]; expected_usage = {"prompt_tokens":session_usage["input"]+session_usage["cacheRead"],"completion_tokens":session_usage["output"],"total_tokens":session_usage["totalTokens"],"cached_tokens":session_usage["cacheRead"],"reasoning_tokens":session_usage["reasoningTokens"]}
        permanent(pair.get("pair_index") == index + 1 and request["name"] == f"rr-session-{index+1}.json" and response["name"] == f"rr-session-{index+1}.res.log", "contiguous request pair names")
        permanent(request["endpoint"] == ENDPOINT and request["method"] == "POST" and request["model"] == "glm-5.3-flash" and request["reasoning_effort"] == "max" and request["tool_names"] == ["goal"], "safe request projection")
        permanent(request["prior_assistant_text_sha256"] == prior_hashes and request["prior_goal_calls"] == prior_calls and request["prior_goal_call_ids"] == request["prior_goal_result_ids"] == prior_ids, "ordered request assistant/Goal history")
        permanent((response["assistant_text_utf8_bytes"],response["assistant_text_sha256"]) == (assistant["text_utf8_bytes"],assistant["text_sha256"]) and response["goal_call_ids"] == expected_calls and response["goal_call_names"] == expected_names_call and response["goal_call_arguments"] == expected_args, "ordered response assistant/Goal history")
        permanent(response["finish_reason"] == expected_finish and response["usage"] == expected_usage and response["termination_basis"] in {"finish_reason_and_usage","done_sentinel"}, "response finish/usage/session join")
        for record in (request,response):
            raw = private / record["name"]; permanent(raw.is_file() and not raw.is_symlink() and (raw.stat().st_mode & 0o777) == 0o600 and raw.stat().st_size == record["bytes"] and P.sha256_file(raw) == record["sha256"] and (safe_request(raw) if raw.suffix == ".json" else safe_response(raw)) == record, "private raw hash/projection join"); expected_names.append(record["name"])
    permanent(sorted(expected_names) == sorted(path.name for path in private.iterdir()), "private capture exact roster"); no_sensitive(receipt)
def final_http(structural: dict[str, Any], session_path: Path) -> dict[str, Any]:
    target, private, cwd = row_dir() / "http_final_receipt.json", Path(rows()[0]["private_capture_dir"]), Path(rows()[0]["cwd"])
    if target.exists(): receipt = P.load_json(target); validate_final_http(receipt,structural,private,session_path); return receipt
    assistants = assistant_receipts(session_path,structural); count = len(assistants); entries = debug_entries(cwd); expected = [cwd / f"rr-session-{index}{suffix}" for index in range(1,count+1) for suffix in (".json",".res.log")]
    permanent(not os.path.lexists(private) and set(entries) == set(expected), "contiguous complete terminal request roster")
    pairs = []
    for index in range(1,count+1): pairs.append({"pair_index":index,"assistant":assistants[index-1],"request":safe_request(cwd / f"rr-session-{index}.json"),"response":safe_response(cwd / f"rr-session-{index}.res.log")})
    receipt = {"schema_id":HTTP_FINAL_SCHEMA,"phase":HTTP_FINAL_PHASE,"request_pair_count":count,"verified_assistant_turn_count":count,"pairs":pairs,"sensitive_material_copied":False}; no_sensitive(receipt); write_once(target,receipt)
    private.mkdir(mode=0o700)
    for path in entries: path.replace(private / path.name); os.chmod(private / path.name,0o600)
    permanent(not any(cwd.iterdir()), "empty cwd after private capture move"); validate_final_http(receipt,structural,private,session_path); return receipt

def verify_session(path: Path, **expected: Any) -> dict[str, Any]:
    terminal_hint = session_health(path)
    try: structural = ORIGINAL_SESSION(path,**expected)
    except omp_session.OmpSessionError as exc:
        if terminal_hint: raise PermanentCanaryError(f"terminal structural failure: {exc}") from exc
        raise
    normalized = NORMALIZE(path,structural,oracle_path=V7 / "oracle.json",schema_path=V7 / "response.schema.json",max_text_block_utf8_bytes=P.load_json(V7 / "matrix.json")["max_final_assistant_utf8_bytes"])
    if expected.get("require_exit") is True:
        for target, value in ((row_dir() / "structural_projection.json",structural),(row_dir() / "normalized_projection.json",normalized)):
            if target.exists(): permanent(P.load_json(target) == value, f"immutable {target.name}")
            else: write_once(target,value)
        final_http(structural,path)
    return normalized

def formal_chain() -> dict[str, Any]:
    names = ("reservation.json","omp_preflight.json","launch.json","submission_acceptance.json","session.raw.jsonl","http_final_receipt.json","structural_projection.json","normalized_projection.json"); records = {name:row_record(row_dir() / name) for name in names}
    launch, acceptance, structural = (P.load_json(row_dir() / name) for name in ("launch.json","submission_acceptance.json","structural_projection.json"))
    permanent(launch["omp_preflight_sha256"] == records["omp_preflight.json"]["sha256"], "launch/preflight join")
    permanent(acceptance["session_projection"]["session_id"] == structural["session_id"] and acceptance["session_projection"]["goal_id"] == structural["goal_id"] and structural["session_file_sha256"] == records["session.raw.jsonl"]["sha256"], "acceptance/final session join")
    return {"schema_id":"pm.r10.storage_pipeline.formal_terminal_chain.v6","ordered_paths":list(names),"records":records}
def atomic_json(path: Path, value: Any) -> None:
    if path.name == "terminal.json" and isinstance(value,dict) and value.get("status") == "PASS":
        value = copy.deepcopy(value); value["formal_chain"] = formal_chain(); extras = ("http_final_receipt.json","structural_projection.json","normalized_projection.json"); value["evidence"] = [*value["evidence"],*(row_record(row_dir() / name) for name in extras)]
    ORIGINAL_ATOMIC(path,value)

class SubprocessProxy:
    def __getattr__(self, name: str) -> Any: return getattr(subprocess,name)
    def run(self, argv: Any, *args: Any, **kwargs: Any) -> Any:
        if isinstance(argv,list) and argv and argv[0] == P.load_json(V7 / "runtime_manifest.json")["omp"]["binary"]: kwargs["env"] = isolated_env(dict(kwargs.get("env") or os.environ))
        return ORIGINAL_RUN(argv,*args,**kwargs)
    def Popen(self, argv: Any, *args: Any, **kwargs: Any) -> Any:
        if isinstance(argv,list) and "--model" in argv:
            row = rows()[0]; permanent(argv == expected_argv(route_map()[ROUTE_ID],row) and "--config" not in argv and "--no-extensions" in argv, "exact native no-extension argv")
            permanent(DISPATCH_CUSTODY == git_custody() and not os.path.lexists(row["private_capture_dir"]) and not debug_entries(Path(row["cwd"])), "custody/fresh request capture before Popen")
            env = isolated_env(dict(kwargs["env"])); permanent(env["PI_CODING_AGENT_DIR"] == row["profile_dir"] and env["OMP_PROFILE"] == env["PI_PROFILE"] == "default", "disposable default profile binding"); permanent(not os.path.lexists(Path(row["home_dir"]) / ".cursor"), "host Cursor config excluded"); env["PI_REQ_DEBUG"] = "1"; kwargs["env"] = env
        return ORIGINAL_POPEN(argv,*args,**kwargs)

PROXY, SPROXY = PipelineProxy(), SubprocessProxy()
BINDINGS = ((base,"EVIDENCE",EVIDENCE),(base,"route_map",route_map),(base,"plan_rows",rows),(base,"planned_row",planned_row),(base,"row_preflight",row_preflight),(base,"verify_composer_transition",composer_transition),(base,"expected_argv",expected_argv),(base,"run_row",PROMPT_READY_RUN_ROW),(base,"atomic_json",atomic_json),(base,"pipeline",PROXY),(base,"subprocess",SPROXY),(omp_session,"verify_submission_prefix",verify_submission_prefix),(omp_session,"verify_session",verify_session),(V,"EVIDENCE",EVIDENCE),(V,"launch_plan_map",launch_plan_map),(V,"expected_argv",verify_expected_argv),(V,"verify_omp_raw",verify_omp_raw),(V,"pipeline",PROXY))
@contextlib.contextmanager
def installed() -> Iterator[None]:
    saved = [(module,name,getattr(module,name)) for module,name,_ in BINDINGS]
    try:
        for module,name,value in BINDINGS: setattr(module,name,value)
        yield
    finally:
        for module,name,value in reversed(saved): setattr(module,name,value)

def verify_formal(row: dict[str, Any], custody: dict[str, Any]) -> dict[str, Any]:
    directory = row_dir(); terminal = P.load_json(directory / "terminal.json"); permanent(terminal.get("formal_chain") == formal_chain(), "terminal formal chain")
    preflight = P.load_json(directory / "omp_preflight.json"); permanent(preflight.get("git_custody") == custody and preflight.get("owned_sources") == custody["sources"] and preflight.get("dependency_custody") == custody["dependencies"], "preflight pushed custody")
    permanent(file_record(HERE / "models.yml") == preflight.get("models_override") and preflight["profile_seed"]["seed_roster"] == ["agent.db","config.yml","models.db","models.yml"] and preflight["profile_seed"]["mcp_tool_extension_seed_files"] == 0, "four-file profile seed receipt")
    rendered = base.strip_terminal((directory / "pre_prompt.raw").read_bytes()); permanent(PROMPT_READY in rendered and MCP_SENTINEL not in rendered and VISIBLE_MAX in rendered and b"xhigh" not in rendered.lower(), "empty-MCP prompt/max custody")
    structural, normalized = P.load_json(directory / "structural_projection.json"), P.load_json(directory / "normalized_projection.json"); session = directory / "session.raw.jsonl"; recomputed = NORMALIZE(session,structural,oracle_path=V7 / "oracle.json",schema_path=V7 / "response.schema.json",max_text_block_utf8_bytes=P.load_json(V7 / "matrix.json")["max_final_assistant_utf8_bytes"]); permanent(recomputed == normalized, "V6-local terminal normalizer replay")
    validate_final_http(P.load_json(directory / "http_final_receipt.json"),structural,Path(row["private_capture_dir"]),session); permanent(normalized["result_normalization"]["canonical_text"] == terminal["final_assistant_text"] and normalized["raw_last_assistant_sha256"] == structural["final_text_sha256"], "normalization terminal/raw join"); permanent(not any(Path(row["cwd"]).iterdir()), "completed cwd empty"); return terminal
def runtime_paths(row: dict[str, Any]) -> list[str]: return [row[name] for name in ("cwd","session_dir","profile_dir","private_capture_dir",*ENV_PATHS.values())]
def verify_prefix() -> dict[str, Any]:
    row = rows()[0]
    if not os.path.lexists(EVIDENCE): permanent(not any(os.path.lexists(path) for path in runtime_paths(row)), "empty prefix runtime absence"); return {"status":"PASS_EMPTY_PREFIX_ZERO_CREDIT","row_count":0,"subject_calls":0,"qualification_credit":0}
    permanent(EVIDENCE.is_dir() and not EVIDENCE.is_symlink() and {p.name for p in EVIDENCE.iterdir()} == {"launch_journal.jsonl","pass_01"}, "evidence root exact roster"); pass_dir = EVIDENCE / "pass_01"
    permanent(pass_dir.is_dir() and not pass_dir.is_symlink() and {p.name for p in pass_dir.iterdir()} == {ROUTE_ID} and P.load_json(row_dir() / "terminal.json").get("status") == "PASS", "one-row fail-stop evidence")
    custody = git_custody()
    with installed():
        report = V.verify_row("pass_01",route_map()[ROUTE_ID]); reports = [{"pass_id":"pass_01","rows":[report]}]; verify_formal(row,custody); V.verify_launch_journal(reports); V.verify_evidence_tree(reports); V.verify_global_uniqueness(reports); return {"status":"PASS_GLM53_MAX_NORMALIZED_CANARY_V6_ZERO_CREDIT","row_count":1,"subject_calls":0,"qualification_credit":0}
def historical_identity_clean(row: dict[str, Any], root: Path = R10, current: Path = HERE) -> None:
    for path in root.rglob("*.json"):
        if current not in path.parents: require(row["nonce"].encode() not in path.read_bytes() and row["attempt_id"].encode() not in path.read_bytes(), "fresh historical identity")
def current_runtime_preflight() -> dict[str, Any]:
    runtime = spec()["runtime"]; binary, profile = Path(runtime["binary"]), Path(runtime["source_profile_dir"])
    require(binary.is_file() and not binary.is_symlink() and stat.S_ISREG(binary.lstat().st_mode), "current OMP binary absent or unsafe")
    require(binary.stat().st_size == runtime["binary_bytes"] and P.sha256_file(binary) == runtime["binary_sha256"] and oct(binary.stat().st_mode & 0o777) == runtime["binary_mode"], "current OMP binary identity")
    require(profile.is_dir() and not profile.is_symlink(), "approved source profile absent or unsafe"); environment = dict(os.environ); environment["PI_CODING_AGENT_DIR"] = str(profile); environment["OMP_PROFILE"] = environment["PI_PROFILE"] = "default"
    version = ORIGINAL_RUN([str(binary),"--version"],check=False,capture_output=True,text=True,env=environment,timeout=30); require(version.returncode == 0 and version.stdout.strip() == runtime["version"], "current OMP version")
    observed: dict[str, Any] = {}; commands = []
    for key, expected in runtime["effective_config"].items():
        process = ORIGINAL_RUN([str(binary),"config","get",key],check=False,capture_output=True,text=True,env=environment,timeout=30); raw = process.stdout.strip(); require(process.returncode == 0, f"current OMP config command: {key}")
        value = P.strict_loads(raw) if raw in {"true","false"} or raw.startswith(("{","[",'"')) else raw; require(value == expected, f"current OMP effective config drift: {key}"); observed[key] = value; commands.append({"key":key,"exit_code":process.returncode,"stdout":raw})
    return {"status":"PASS_OMP_RUNTIME_18_0_7","binary":str(binary),"binary_bytes":binary.stat().st_size,"binary_sha256":P.sha256_file(binary),"binary_mode":oct(binary.stat().st_mode & 0o777),"version":version.stdout.strip(),"profiles":{"OMP_PROFILE":"default","PI_PROFILE":"default"},"effective_config":observed,"commands":commands,"subject_calls":0}
def validate_static(*, unused: bool = True) -> dict[str, Any]:
    contract = spec(); require(contract["schema_id"] == "pm.r10.storage_pipeline.glm53_max_normalized_canary.v6" and contract["owned_file_roster"] == list(SOURCES), "contract/roster")
    actual = {p.name for p in HERE.iterdir()}; require(actual == set(SOURCES) if unused else actual in (set(SOURCES),set(SOURCES)|{"evidence"}), "owned root roster"); require(all((HERE / name).is_file() and not (HERE / name).is_symlink() for name in SOURCES), "regular owned files")
    metrics = {name:{"lines":len((HERE / name).read_bytes().splitlines()),"bytes":(HERE / name).stat().st_size} for name in SOURCES}; limits = contract["architecture_limits"]; require(metrics["controller.py"]["lines"] <= limits["controller_max_lines"] and sum(v["lines"] for v in metrics.values()) <= limits["package_max_lines"], "lean line budgets")
    require((HERE / "models.yml").read_bytes() == MODELS_BYTES and file_record(HERE / "models.yml") == contract["models_override"], "exact models override")
    require(file_record(NORMALIZER) == contract["result_normalizer"], "exact V6-local order-sensitive normalizer")
    for record in [*contract["dependencies"],*contract["predecessor_v2_sources"]["records"],*contract["predecessor_v3_sources"]["records"],*contract["predecessor_v4_sources"]["records"],*contract["predecessor_v5_sources"]["records"],*contract["consumed_v2_failure_replay"]["records"],*contract["consumed_v3_failure_replay"]["records"],*contract["consumed_v4_pass_replay"]["records"],*contract["consumed_v5_pass_replay"]["records"]]: require(file_record(REPO / record["path"]) == record, f"frozen path drift: {record['path']}")
    row, route = rows()[0], route_map()[ROUTE_ID]; require(len(rows()) == 1 and row["ordinal"] == 1 and row["pass_id"] == "pass_01" and row["route_id"] == ROUTE_ID, "one frozen identity")
    require(len(row["nonce"]) == 32 and row["attempt_id"].endswith(row["nonce"][:10]) and row["evidence_path"] == f"evidence/pass_01/{ROUTE_ID}" and len(set(runtime_paths(row))) == len(runtime_paths(row)) and all(path.startswith("/tmp/pm-r10-storage-v7-") for path in runtime_paths(row)), "fresh frozen path scopes")
    require(route == {"id":ROUTE_ID,"surface":"omp_tui","model":"opencode-go/glm-5.3-flash","thinking":"max"} and row["model"] == route["model"] and row["thinking"] == "max", "one exact route")
    authority = contract["authority"]; require(authority["authorized_attempt_ids"] == [row["attempt_id"]] and authority["authorized_selector"] == row["model"] and authority["authorized_thinking"] == row["thinking"] and all(authority[key] is False for key in ("retry_replacement_or_reuse_authorized","retro_credit_authorized","other_provider_model_matrix_or_route_authorized")) and all(authority[key] == 0 for key in ("qualification_credit","matrix_credit","production_credit")), "closed one-row zero-credit authority")
    prompt = V7 / "prompts/omp.prompt.txt"; require(prompt.stat().st_size == row["prompt_utf8_bytes"] == 3036 and P.sha256_file(prompt) == row["prompt_sha256"] == "eff40a61579a080ce6e21bb71bcae2dd0640c100c9d61c199f45ac5dece43638", "frozen prompt")
    runtime, http = contract["runtime"], contract["http_receipts"]; completion = http["response_completion"]; require(runtime["binary"] == "/home/sittingmongoose/.local/bin/omp" and runtime["binary_bytes"] == 183686344 and runtime["binary_sha256"] == "4e2468ad6974e6a2edea621da82abca8c95ec62a8354630381c353dc08c7769b" and runtime["binary_mode"] == "0o755" and runtime["version"] == "omp/18.0.7" and runtime["row_time_budget_seconds"] == runtime["active_wait_seconds"] == 3600 and runtime["advisor_enabled"] is False and runtime["task_agent_advisor"] == {"task":"off"} and runtime["ordinary_tools_enabled"] is False and runtime["extensions_enabled"] is False and runtime["profile_seed_roster"] == ["agent.db","config.yml","models.db","models.yml"] and runtime["profile_seed_mcp_tool_extension_files"] == 0 and runtime["environment_profiles"] == {"OMP_PROFILE":"default","PI_PROFILE":"default"} and runtime["startup_readiness"]["transient_partial_snapshots"] == "inherited_RunnerError_continues_inherited_poll" and http["terminal_request_pair_count"] == "equals_verified_assistant_count_2_or_3" and http["phase_named_immutable_receipts"] == ["http_final_receipt.json"] and http["submission_acceptance_http_dependency"] is False and http["raw_request_response_storage"] == "private_runtime_path_only" and completion["strict_data_only_sse_frames"] is completion["complete_blank_line_boundary"] is completion["session_stop_usage_text_and_goal_join"] is True and completion["done_count_allowed"] == [0,1] and completion["termination_basis_values"] == ["finish_reason_and_usage","done_sentinel"], "closed reset runtime/HTTP contracts")
    historical_identity_clean(row)
    if unused: require(not os.path.lexists(EVIDENCE) and not any(os.path.lexists(path) for path in runtime_paths(row)), "unused paths absent")
    verification = contract["verification"]; require(P.sha256_file(NORMALIZER) == "47945d59cfcf4eb5defdc38736c29e661bdcfb843352cc7a32e5d69ce56adedd" and NORMALIZE.__module__ == "glm53_max_normalizer_v6" and verification["normalization_second"] == "storage_glm53_max_normalized_canary_v6.result_normalizer.normalize_verified_session" and verification["dict_key_order"] == "recursive_insertion_sequence_exact" and verification["distinct_final_assistant_required"] is verification["normalized_exact_result_required"] is verification["raw_final_assistant_may_be_non_authoritative_prose"] is verification["structural_terminal_error_permanent_only_after_explicit_session_exit"] is True and verification["normalizer_binding_scope"] == ["pre_exit_require_exit_false","post_exit_require_exit_true","terminal_formal_projection_verification"] and verification["live_runtime_preflight_scope"] == "unused_evidence_absent_prelaunch_only" and verification["fresh_run_runtime_preflight_order"] == "after_exact_empty_prefix_before_reservation_and_Popen" and verification["post_reservation_runtime_authority"] == "captured_omp_preflight_and_contract_no_current_OMP_or_profile_call" and verification["terminal_chain"] == ["reservation.json","omp_preflight.json","launch.json","submission_acceptance.json","session.raw.jsonl","http_final_receipt.json","structural_projection.json","normalized_projection.json"] and verification["composer_polling"] == {"ordinary_incomplete_or_partial":"RunnerError","caught_by_inherited_poll":True,"permanent_error_class":"PermanentCanaryError"} and verification["post_pass_scope"] == {"historical_identity_scan":"all_R10_json_outside_current_V6_root","current_root_and_planned_identity_self_inclusion":"excluded_only_from_historical_reuse_scan","installed_binding_lifetime":"row_formal_chain_journal_evidence_tree_global_uniqueness_prefix_result","restoration":"finally_after_prefix_result"}, "local structural/normalizer/scorer chain")
    v1 = contract["consumed_v1_failure_replay"]; v1_path = REPO / v1["path"]; v2,v3,v4,v5 = (contract[name] for name in ("consumed_v2_failure_replay","consumed_v3_failure_replay","consumed_v4_pass_replay","consumed_v5_pass_replay")); require("v5_zero_subject_replay" not in contract and "http_runtime" not in v3 and "http_runtime" not in v4, "no vanished temporary replay prerequisite"); v3_terminal,v4_terminal,v5_terminal = (REPO / item["terminal_path"] if "terminal_path" in item else REPO / item["records"][1]["path"] for item in (v3,v4,v5)); terminal,passed,corrected = P.load_json(v3_terminal),P.load_json(v4_terminal),P.load_json(v5_terminal); require(v1_path.stat().st_size == v1["bytes"] and P.sha256_file(v1_path) == v1["sha256"] and v1["status"] == v2["status"] == v3["status"] == "FAIL_NO_RETRY_ZERO_CREDIT" and v4["status"] == "PASS_SUBJECT_ZERO_CREDIT_POSTPASS_WRAPPER_HOLD_NO_RETRO_CREDIT" and v5["status"] == "PASS_SUBJECT_ZERO_CREDIT_CORRECTED_REPLAY_ONLY" and v2["failure"].endswith("PermanentCanaryError: prompt-specific composer transition") and v3["failure"] == "PermanentCanaryError: complete safe response projection" and terminal["status"] == "FAIL" and passed["status"] == corrected["status"] == "PASS" and corrected["no_retry"] is True and corrected["process_exit_code"] == corrected["qualification_credit"] == 0 and len(terminal["evidence"]) == v3["terminal_evidence_join_count"] and len(passed["evidence"]) == v4["terminal_evidence_join_count"] and len(corrected["evidence"]) == v5["terminal_evidence_join_count"] and all(file_record(v3_terminal.parent / item["path"],v3_terminal.parent) == item for item in terminal["evidence"]) and all(file_record(v4_terminal.parent / item["path"],v4_terminal.parent) == item for item in passed["evidence"]) and all(file_record(v5_terminal.parent / item["path"],v5_terminal.parent) == item for item in corrected["evidence"]) and len([path for path in v4_terminal.parent.iterdir() if path.is_file()]) == v4["leaf_file_count"] and len([path for path in v5_terminal.parent.iterdir() if path.is_file()]) == v5["leaf_file_count"], "consumed V1/V2/V3 and V4/V5 PASS immutable replays")
    require(all(run_git("merge-base","--is-ancestor",contract[name]["commit"],"HEAD").returncode == 0 for name in ("predecessor_v2_sources","predecessor_v3_sources","predecessor_v4_sources","predecessor_v5_sources")), "predecessor ancestry")
    require(P.verify()["status"] == "PASS_VERIFIED_NO_WORKNODES" and freeze_check.verify_freeze()["status"] == "PASS_FROZEN_ZERO_SUBJECT", "V7 freeze/pipeline"); require(not list(HERE.rglob("*.pyc")) and not list(HERE.rglob("__pycache__")), "no bytecode cache")
    runtime_report = current_runtime_preflight() if unused and not os.path.lexists(EVIDENCE) else {"status":"NOT_RUN_POST_RESERVATION_USES_CAPTURED_PREFLIGHT","subject_calls":0}
    return {"status":"PASS_LOCAL_GLM53_MAX_NORMALIZED_CANARY_V6","metrics":metrics,"temporary_bindings":len(BINDINGS),"subject_calls":0,"qualification_credit":0,"runtime_preflight":runtime_report}

def preserve_failure(row: dict[str, Any]) -> None:
    directory = row_dir(); directory.mkdir(parents=True,exist_ok=True)
    if not (directory / "reservation.json").exists(): write_once(directory / "reservation.json",{"schema_id":"pm.r10.storage_pipeline.partial_reservation_recovery.v6",**{k:row[k] for k in ("pass_id","route_id","ordinal","attempt_id","nonce")},"qualification_credit":0,"no_retry":True})
    live = base.session_file(Path(row["session_dir"])); target = directory / "postfailure_session.raw.jsonl"
    if live is not None and not target.exists(): P.atomic_write(target,live.read_bytes())
ERRORS = (CanaryError,PermanentCanaryError,_normalizer.NormalizationError,base.RunnerError,omp_session.OmpSessionError,V.VerifyError,P.PipelineError,subprocess.SubprocessError,OSError,ValueError,KeyError,TypeError,AssertionError)
def dispatch(argv: list[str] | None = None) -> int:
    global DISPATCH_CUSTODY
    parser = argparse.ArgumentParser(); parser.add_argument("command",choices=("lint","verify-prefix","run")); parser.add_argument("ordinal",nargs="?",type=int,choices=(1,)); parser.add_argument("--max-seconds",type=int,default=3600); args = parser.parse_args(argv); row = rows()[0]; before: tuple[bool,bool,bool] | None = None; os.umask(0o077)
    try:
        require((args.command == "run") == (args.ordinal is not None), "ordinal only for run"); static = validate_static(unused=args.command == "lint")
        if args.command == "lint": print(P.canonical_json({"status":"PASS_ZERO_SUBJECT_LINT",**static})); return 0
        if args.command == "verify-prefix": print(P.canonical_json(verify_prefix())); return 0
        require(args.max_seconds == 3600 and spec()["authority"]["authorized_attempt_ids"] == [row["attempt_id"]], "exact one-use authority/budget"); DISPATCH_CUSTODY = git_custody(); prefix = verify_prefix(); require(prefix["row_count"] == 0, "canary already consumed"); runtime = current_runtime_preflight(); require(runtime["status"] == "PASS_OMP_RUNTIME_18_0_7" and runtime["subject_calls"] == 0, "fresh pre-reservation runtime preflight")
        before = tuple(os.path.lexists(path) for path in (EVIDENCE,row_dir().parent,row_dir()))
        with installed(): terminal = base.run_row("pass_01",ROUTE_ID,3600)
    except base.ReservationConflict as exc: print(P.canonical_json({"status":"FAIL_ALREADY_CONSUMED_NO_MUTATION","error":str(exc),"qualification_credit":0})); return 1
    except ERRORS as exc:
        claimed = before is not None and any(os.path.lexists(path) != old or os.path.lexists(path) for path,old in zip((EVIDENCE,row_dir().parent,row_dir()),before,strict=True))
        if claimed:
            preserve_failure(row)
            with installed(): base.record_failure("pass_01",ROUTE_ID,exc)
        print(P.canonical_json({"status":"FAIL_GLM53_MAX_CANARY_V6_CONSUMED_NO_RETRY" if claimed else "FAIL_PRELAUNCH_NO_MUTATION","error":f"{type(exc).__name__}: {exc}","qualification_credit":0})); return 1
    finally: DISPATCH_CUSTODY = None
    print(P.canonical_json({"status":"PASS_GLM53_MAX_NORMALIZED_CANARY_V6_ZERO_CREDIT","terminal":terminal,"qualification_credit":0})); return 0

if __name__ == "__main__": raise SystemExit(dispatch())
