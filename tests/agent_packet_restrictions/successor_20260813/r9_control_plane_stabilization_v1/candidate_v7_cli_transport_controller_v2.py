#!/usr/bin/env python3
import argparse
import ast
import datetime as dt
import hashlib
import json
import os
import pathlib
import re
import select
import shutil
import signal
import stat
import subprocess
import sys
import time

sys.dont_write_bytecode = True

WORKSPACE = pathlib.Path("/mnt/Cursor/PuppetMaster")
EXPECTED_HOME = "/home/sittingmongoose"
EXPECTED_CODEX_HOME = "/home/sittingmongoose/.codex"
ENV_BIND_KEYS = ("HOME", "CODEX_HOME", "PATH", "LANG", "LC_ALL", "LC_CTYPE")
CANDIDATE = WORKSPACE / "tests/agent_packet_restrictions/successor_20260813/r9_control_plane_stabilization_v1/formal_candidate_v7"
COMPONENTS = {
    "semantic_bundle.json": "11139c2b52a2fe900f2976a34f7712d8f05d5b2991ce8cc26d5cfc4e1ef871c2",
    "runner.py": "3d773914f3be5eac06d73f7a4e27c25bfea212aa1baa9c399e06200211199469",
    "evidence_recorder.py": "7f8ca2d19750a65ac71b711f13ed4fb1205eab0711b945463561a5f3f35a9e52",
    "offline_verifier.py": "7cea3258b0928430b6064ae48c9a3b296ed024f196c972184b779f938279c569",
}
ROUTES = {
    "slot-alpha": ("gpt-5.4-mini", "xhigh"),
    "slot-bravo": ("gpt-5.4-mini", "medium"),
    "slot-charlie": ("gpt-5.6-luna", "medium"),
}
CLI_VERSION = "codex-cli 0.148.0"
CLI_BINARY_SHA256 = "ac2cfed85fb647d61e0150b8548102b330e4799d9d81ad5d354de701edf6b074"
CLI_BINARY_BYTES = 251271488
CLI_REQUIRED_HELP = ("--ephemeral", "--strict-config", "--json", "--output-last-message")
CONFIG_PATHS = (
    pathlib.Path(EXPECTED_CODEX_HOME) / "config.toml",
    WORKSPACE / ".codex/config.toml",
    pathlib.Path("/etc/codex/config.toml"),
    pathlib.Path("/etc/codex/managed_config.toml"),
    pathlib.Path("/etc/codex/requirements.toml"),
)
EXPECTED_CONFIG_IDENTITY = {
    "/home/sittingmongoose/.codex/config.toml": {"present": True, "bytes": 1890,
        "sha256": "e77a3ebfee3eb9a80a3b7bdba5d1f2596dbf5c053b881a3ef3db502a29d8e8cd"},
    "/mnt/Cursor/PuppetMaster/.codex/config.toml": {"present": True, "bytes": 0,
        "sha256": "e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855"},
    "/etc/codex/config.toml": {"present": False},
    "/etc/codex/managed_config.toml": {"present": False},
    "/etc/codex/requirements.toml": {"present": False},
}
CONTROLLER_REVISION = "USER_AUTHORIZED_CANDIDATE_V7_CODEX_CLI_CONTROLLER_V2"
CHECK_SCHEMA = "pw-r9-candidate-v7-cli-controller-check-v2"
TERMINAL_SCHEMA = "pw-r9-candidate-v7-cli-controller-terminal-v2"
ERROR_SCHEMA = "pw-r9-candidate-v7-cli-controller-error-v2"
TRANSPORT_REVISION = "USER_AUTHORIZED_CANDIDATE_V7_CODEX_CLI_EPHEMERAL_TRANSPORT_V2"
PROTECTED_RUN_IDS = frozenset(("candidate-v7-matrix-005", "candidate-v7-matrix-006"))
CONSUMED_RUN_IDS = frozenset(("candidate-v7-matrix-005", "candidate-v7-matrix-006",
                              "candidate-v7-cli-canary-001"))
PROTECTED_RUN_ROOTS = tuple(
    WORKSPACE / "tests/agent_packet_restrictions/successor_20260813/r9_control_plane_stabilization_v1/empirical_evidence_v1" / run_id
    for run_id in sorted(PROTECTED_RUN_IDS)
)
PROTECTED_EXPECTED = {
    str(PROTECTED_RUN_ROOTS[0]): {"present": True, "file_count": 452,
        "directory_count": 78, "aggregate_file_bytes": 1357086,
        "rows_sha256": "ff3e3e1d56946da3bfaeb64320d9d7986eb769988c1d6a9145a0548ac408c010",
        "rows_bytes": 74150, "root_mode": 0o755},
    str(PROTECTED_RUN_ROOTS[1]): {"present": False},
}
PROTECTED_CANARY_ROOTS = (
    WORKSPACE / "tests/agent_packet_restrictions/successor_20260813/r9_control_plane_stabilization_v1/empirical_evidence_v1/candidate-v7-cli-canary-001",
    WORKSPACE / "tests/agent_packet_restrictions/successor_20260813/r9_control_plane_stabilization_v1/cli_transport_captures_v1/candidate-v7-cli-canary-001",
)
PROTECTED_CANARY_EXPECTED = {
    str(PROTECTED_CANARY_ROOTS[0]): {"present": True, "file_count": 11,
        "directory_count": 4, "aggregate_file_bytes": 16376,
        "rows_sha256": "2d634bfb08125076351f78cb4b7be0fa23ad8c4077437ec0538348397a16d05a",
        "rows_bytes": 1850, "root_mode": 0o755},
    str(PROTECTED_CANARY_ROOTS[1]): {"present": True, "file_count": 21,
        "directory_count": 1, "aggregate_file_bytes": 40128,
        "rows_sha256": "39f81375010b5afd97a82f2fef8b6f26321eb99348a0c9325c5c5106a53978ec",
        "rows_bytes": 3256, "root_mode": 0o777},
}
PROTECTED_CANARY_FAILURE_RECEIPT = WORKSPACE / "tests/agent_packet_restrictions/successor_20260813/r9_control_plane_stabilization_v1/r9_candidate_v7_cli_canary_001_failure_receipt_v1.json"
PROTECTED_CANARY_FAILURE_RECEIPT_EXPECTED = {
    "bytes": 12329,
    "sha256": "64b3f7dc467a39b65edaa9c35e72394b5916e65db8c39c106b0b6e4cb6fe065d",
    "mode": 0o644,
}
RUN_KINDS = frozenset(("run-canary", "run-matrix"))
OBSERVATION_BASIS = "ROOT_VISIBLE_COLLABORATION_DELIVERIES"
MAX_LINE = 4 * 1024 * 1024
SAFE_ID = re.compile(r"[A-Za-z0-9][A-Za-z0-9_.-]{0,191}\Z")
HEX = re.compile(r"[0-9a-f]{64}\Z")
THREAD_ID = re.compile(r"[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}\Z")
FAILURE_SCHEMA = "pw-r9-subagent-transport-failure-event-v1"
RECEIPT_SCHEMA = "pw-r9-subagent-spawn-receipt-event-v1"
DELIVERY_SCHEMA = "pw-r9-subagent-terminal-delivery-event-v1"
REQUEST_SCHEMA = "pw-r9-subagent-spawn-request-v1"
REQUEST_FIELDS = frozenset("schema_id run_id run_kind mode slot cell index ordinal nonce invocation_id task_name expected_canonical_task_path agent_type fork_turns model reasoning_effort packet_sha256 packet_bytes message_utf8 message_sha256 message_bytes attempt_sha256 attempt_bytes".split())
ATTEMPT_SCHEMA = "pw-r9-attempt-v4"
ATTEMPT_FIELDS = frozenset("schema_id run_id run_kind mode row_id slot cell index ordinal nonce invocation_id task_name expected_canonical_task_path agent_type fork_turns model reasoning_effort causal_inputs packet_sha256 packet_bytes message_sha256 message_bytes attempt retry_count best_of replacement_result no_retry no_relaunch admission_state".split())
ACTIVITY_CAPTURE_SCHEMA = "pw-r9-cli-observed-activity-v1"


class Invalid(RuntimeError):
    pass


def sha(data):
    return hashlib.sha256(data).hexdigest()


def canon(value):
    try:
        return json.dumps(value, ensure_ascii=False, allow_nan=False, sort_keys=True,
                          separators=(",", ":")).encode("utf-8")
    except (TypeError, ValueError, UnicodeEncodeError) as exc:
        raise Invalid(f"not canonical JSON: {exc}") from exc


def pairs(items):
    result = {}
    for key, value in items:
        if key in result:
            raise Invalid(f"duplicate JSON key: {key}")
        result[key] = value
    return result


def parse_object(data, label, canonical=False):
    try:
        value = json.loads(data.decode("utf-8"), object_pairs_hook=pairs,
                           parse_constant=lambda item: (_ for _ in ()).throw(Invalid(item)))
    except (UnicodeDecodeError, json.JSONDecodeError, Invalid) as exc:
        raise Invalid(f"{label}: invalid UTF-8 JSON: {exc}") from exc
    if not isinstance(value, dict):
        raise Invalid(f"{label}: JSON value is not an object")
    if canonical and canon(value) != data:
        raise Invalid(f"{label}: object is not canonical sorted minified JSON")
    return value


def utc_now():
    return dt.datetime.now(dt.timezone.utc).isoformat(timespec="microseconds").replace("+00:00", "Z")


def fsync_dir(path):
    fd = os.open(path, os.O_RDONLY | getattr(os, "O_DIRECTORY", 0))
    try:
        os.fsync(fd)
    finally:
        os.close(fd)


def mkdir_exclusive(path):
    path.mkdir(mode=0o700)
    fsync_dir(path.parent)


def write_exclusive(path, data, mode=0o600):
    fd = os.open(path, os.O_WRONLY | os.O_CREAT | os.O_EXCL, mode)
    try:
        view = memoryview(data)
        while view:
            count = os.write(fd, view)
            if count <= 0:
                raise Invalid(f"short write: {path}")
            view = view[count:]
        os.fsync(fd)
    finally:
        os.close(fd)
    fsync_dir(path.parent)


def write_json(path, value):
    write_exclusive(path, canon(value) + b"\n")


def fsync_existing(path):
    fd = os.open(path, os.O_RDONLY | getattr(os, "O_NOFOLLOW", 0))
    try:
        if not stat.S_ISREG(os.fstat(fd).st_mode):
            raise Invalid(f"not a regular capture file: {path}")
        os.fsync(fd)
    finally:
        os.close(fd)
    fsync_dir(path.parent)


def read_regular(path):
    fd = os.open(path, os.O_RDONLY | getattr(os, "O_NOFOLLOW", 0))
    try:
        if not stat.S_ISREG(os.fstat(fd).st_mode):
            raise Invalid(f"not a regular capture file: {path}")
        chunks = []
        while True:
            part = os.read(fd, 65536)
            if not part:
                return b"".join(chunks)
            chunks.append(part)
    finally:
        os.close(fd)


def identity(path):
    info = path.lstat()
    if not stat.S_ISREG(info.st_mode):
        raise Invalid(f"not a regular file: {path}")
    data = path.read_bytes()
    return {"bytes": len(data), "sha256": sha(data)}


def runtime_identity(path):
    fd = os.open(path, os.O_RDONLY | getattr(os, "O_NOFOLLOW", 0))
    try:
        before = os.fstat(fd)
        if not stat.S_ISREG(before.st_mode):
            raise Invalid(f"runtime input is not a regular nonlink file: {path}")
        chunks = []
        while True:
            part = os.read(fd, 65536)
            if not part:
                break
            chunks.append(part)
        after = os.fstat(fd)
        if (before.st_dev, before.st_ino, before.st_size, before.st_mtime_ns) != (after.st_dev, after.st_ino, after.st_size, after.st_mtime_ns):
            raise Invalid(f"runtime input changed while hashing: {path}")
    finally:
        os.close(fd)
    data = b"".join(chunks)
    return {"bytes": len(data), "sha256": sha(data), "device": before.st_dev,
            "inode": before.st_ino, "mode": stat.S_IMODE(before.st_mode),
            "mtime_ns": before.st_mtime_ns}


def config_identity():
    result = {}
    for path in CONFIG_PATHS:
        try:
            got = runtime_identity(path)
            result[str(path)] = {"present": True, "bytes": got["bytes"],
                                 "sha256": got["sha256"]}
        except FileNotFoundError:
            result[str(path)] = {"present": False}
    return result


def assert_config_baseline(state):
    if state != EXPECTED_CONFIG_IDENTITY:
        raise Invalid("Codex CLI same-config / Chronicle-enabled baseline mismatch")
    return state


def environment_identity():
    if os.environ.get("HOME") != EXPECTED_HOME or os.environ.get("CODEX_HOME") != EXPECTED_CODEX_HOME:
        raise Invalid("effective HOME/CODEX_HOME differs from the accepted same-config envelope")
    result = {}
    for key in ENV_BIND_KEYS:
        value = os.environ.get(key)
        if value is None:
            result[key] = {"present": False}
            continue
        data = value.encode("utf-8")
        result[key] = {"present": True, "bytes": len(data), "sha256": sha(data)}
    return result


def component_identity():
    result = {}
    for name, expected in COMPONENTS.items():
        got = runtime_identity(CANDIDATE / name)
        if got["sha256"] != expected:
            raise Invalid(f"Candidate V7 identity drift: {name}:{got['sha256']}")
        result[name] = {"bytes": got["bytes"], "sha256": got["sha256"]}
    return result


def load_bundle(component):
    data = read_regular(CANDIDATE / "semantic_bundle.json")
    if sha(data) != component["semantic_bundle.json"]["sha256"]:
        raise Invalid("semantic bundle changed after identity check")
    bundle = parse_object(data, "semantic bundle")
    routes = {}
    for route in bundle.get("routes", []):
        if not isinstance(route, dict):
            raise Invalid("semantic route is not an object")
        routes[route.get("slot")] = (route.get("model"), route.get("reasoning_effort"))
    if routes != ROUTES:
        raise Invalid(f"route/model/effort drift: {routes!r}")
    cells = bundle.get("cells")
    if not isinstance(cells, list) or len(cells) != 97:
        raise Invalid("semantic cell inventory drift")
    by_id = {}
    cell_order = []
    for expected_index, cell in enumerate(cells):
        if not isinstance(cell, dict) or not isinstance(cell.get("cell"), str):
            raise Invalid("malformed semantic cell")
        if cell.get("index") != expected_index:
            raise Invalid(f"semantic cell index drift: {cell.get('cell')}")
        expected = cell.get("expected_output_utf8")
        render = cell.get("render_utf8")
        dependency_gate = cell.get("dependency_gate")
        if not isinstance(expected, str):
            raise Invalid(f"missing expected output: {cell.get('cell')}")
        if not isinstance(render, str):
            raise Invalid(f"missing frozen render: {cell.get('cell')}")
        expected_bytes = expected.encode("utf-8")
        render_bytes = render.encode("utf-8")
        if (cell.get("expected_output_sha256"), cell.get("expected_output_bytes"),
                cell.get("expected_output_storage_sha256"), cell.get("expected_output_storage_bytes")) != (
                sha(expected_bytes), len(expected_bytes), sha(expected_bytes + b"\n"), len(expected_bytes) + 1):
            raise Invalid(f"expected output identity drift: {cell.get('cell')}")
        if (cell.get("render_utf8_sha256"), cell.get("render_utf8_bytes")) != (sha(render_bytes), len(render_bytes)):
            raise Invalid(f"frozen render identity drift: {cell.get('cell')}")
        if not render_bytes.endswith(b"\n") or render_bytes.endswith(b"\n\n") or b"\r" in render_bytes:
            raise Invalid(f"frozen render framing drift: {cell.get('cell')}")
        if (not isinstance(dependency_gate, dict)
                or set(dependency_gate) != {"required_pass_cells", "required_stage_artifacts", "rule"}
                or dependency_gate.get("rule") != "pw-r9-exact-input-frozen-artifact-v1"
                or not isinstance(dependency_gate.get("required_pass_cells"), list)
                or not all(isinstance(item, str) for item in dependency_gate["required_pass_cells"])
                or len(set(dependency_gate["required_pass_cells"])) != len(dependency_gate["required_pass_cells"])
                or not isinstance(dependency_gate.get("required_stage_artifacts"), list)
                or not all(isinstance(item, str) for item in dependency_gate["required_stage_artifacts"])
                or len(set(dependency_gate["required_stage_artifacts"])) != len(dependency_gate["required_stage_artifacts"])):
            raise Invalid(f"dependency gate drift: {cell.get('cell')}")
        by_id[cell["cell"]] = {"expected_output": expected_bytes, "render": render_bytes,
                               "dependency_gate": dependency_gate}
        cell_order.append(cell["cell"])
    if len(by_id) != 97:
        raise Invalid("duplicate semantic cell identity")
    transport = bundle.get("transport")
    if not isinstance(transport, dict) or transport.get("spawn_request_schema_id") != REQUEST_SCHEMA:
        raise Invalid("semantic spawn-request schema drift")
    instruction = transport.get("instruction_utf8")
    if not isinstance(instruction, str):
        raise Invalid("semantic transport instruction missing")
    instruction_bytes = instruction.encode("utf-8")
    if (transport.get("instruction_sha256"), transport.get("instruction_bytes")) != (sha(instruction_bytes), len(instruction_bytes)):
        raise Invalid("semantic transport instruction identity drift")
    return by_id, cell_order, instruction_bytes


def cli_identity():
    located = shutil.which("codex")
    if not located:
        raise Invalid("codex binary not installed")
    invoked = pathlib.Path(located).absolute()
    resolved = pathlib.Path(os.path.realpath(invoked))
    got = runtime_identity(resolved)
    if (got["sha256"], got["bytes"]) != (CLI_BINARY_SHA256, CLI_BINARY_BYTES):
        raise Invalid("Codex CLI exact binary identity mismatch")
    version_run = subprocess.run([str(resolved), "--version"], stdin=subprocess.DEVNULL,
                                 stdout=subprocess.PIPE, stderr=subprocess.PIPE, check=False)
    version = version_run.stdout.decode("utf-8", "strict").rstrip("\n")
    if version_run.returncode or version != CLI_VERSION or version_run.stderr:
        raise Invalid(f"Codex CLI version mismatch: rc={version_run.returncode}, version={version!r}")
    help_run = subprocess.run([str(resolved), "exec", "--help"], stdin=subprocess.DEVNULL,
                              stdout=subprocess.PIPE, stderr=subprocess.PIPE, check=False)
    help_text = help_run.stdout.decode("utf-8", "strict")
    if help_run.returncode or any(token not in help_text for token in CLI_REQUIRED_HELP):
        raise Invalid("Codex CLI exec help lacks required 0.148.0 capabilities")
    return {"invoked_path": str(invoked), "resolved_path": str(resolved),
            "bytes": got["bytes"], "sha256": got["sha256"], "version": version}


def assert_execution_inputs_stable(cli, config, environment):
    located = shutil.which("codex")
    if not located or str(pathlib.Path(located).absolute()) != cli["invoked_path"]:
        raise Invalid("Codex CLI invoked path changed during run")
    if os.path.realpath(located) != cli["resolved_path"]:
        raise Invalid("Codex CLI resolved path changed during run")
    got = runtime_identity(pathlib.Path(cli["resolved_path"]))
    if (got["sha256"], got["bytes"]) != (cli["sha256"], cli["bytes"]):
        raise Invalid("Codex CLI binary changed during run")
    if config_identity() != config:
        raise Invalid("Codex CLI configuration changed during run")
    if environment_identity() != environment:
        raise Invalid("controller/CLI inherited environment changed during run")


def ast_self_check():
    source = pathlib.Path(__file__).read_bytes()
    tree = ast.parse(source.decode("utf-8"), filename=__file__)
    assigned = {node.targets[0].id for node in tree.body
                if isinstance(node, ast.Assign) and len(node.targets) == 1
                and isinstance(node.targets[0], ast.Name)}
    required = {"WORKSPACE", "EXPECTED_HOME", "EXPECTED_CODEX_HOME", "ENV_BIND_KEYS", "CANDIDATE",
                "COMPONENTS", "ROUTES", "CLI_VERSION",
                "CLI_BINARY_SHA256", "CLI_BINARY_BYTES",
                "CONFIG_PATHS", "EXPECTED_CONFIG_IDENTITY", "CONTROLLER_REVISION", "CHECK_SCHEMA", "TERMINAL_SCHEMA",
                "ERROR_SCHEMA", "TRANSPORT_REVISION", "PROTECTED_RUN_IDS",
                "CONSUMED_RUN_IDS",
                "PROTECTED_RUN_ROOTS", "PROTECTED_EXPECTED", "PROTECTED_CANARY_ROOTS",
                "PROTECTED_CANARY_EXPECTED", "PROTECTED_CANARY_FAILURE_RECEIPT",
                "PROTECTED_CANARY_FAILURE_RECEIPT_EXPECTED", "OBSERVATION_BASIS", "REQUEST_SCHEMA",
                "REQUEST_FIELDS", "ATTEMPT_SCHEMA", "ATTEMPT_FIELDS",
                "ACTIVITY_CAPTURE_SCHEMA"}
    if not required <= assigned:
        raise Invalid(f"controller AST constants missing: {sorted(required - assigned)}")
    return {"bytes": len(source), "sha256": sha(source), "required_constants": sorted(required)}


def clean_activity():
    return {"tool_calls": 0, "file_accesses": 0, "browsing": 0,
            "network_accesses": 0, "delegations": 0, "memory_accesses": 0,
            "followup_turns": 0, "nonterminal_messages": [],
            "observation_basis": OBSERVATION_BASIS}


def receipt(request):
    path = request["expected_canonical_task_path"]
    return {"schema_id": RECEIPT_SCHEMA, "invocation_id": request["invocation_id"],
            "spawn_request_sha256": sha(canon(request)), "tool_result": {"task_name": path},
            "returned_identity_kind": "canonical_task_path",
            "returned_canonical_task_path": path}


def delivery(request, final_bytes, activity):
    return {"schema_id": DELIVERY_SCHEMA, "invocation_id": request["invocation_id"],
            "returned_canonical_task_path": request["expected_canonical_task_path"],
            "message_type": "FINAL_ANSWER", "final_utf8": final_bytes.decode("utf-8", "strict"),
            "observed_activity": activity, "terminal_status": "FINAL_RETURNED"}


def failure(request, phase, failure_type, detail):
    if phase not in ("SPAWN_ATTEMPT", "TERMINAL_DRAIN"):
        raise Invalid("invalid failure phase")
    if not re.fullmatch(r"[A-Z][A-Z0-9_]{0,127}", failure_type) or not detail:
        raise Invalid("invalid typed transport failure")
    return {"schema_id": FAILURE_SCHEMA, "invocation_id": request["invocation_id"],
            "phase": phase, "failure_type": failure_type, "detail": detail}


def same_final_representation(event_bytes, file_bytes):
    return event_bytes == file_bytes or event_bytes + b"\n" == file_bytes or file_bytes + b"\n" == event_bytes


def item_kind(item):
    value = item.get("type")
    if not isinstance(value, str):
        raise Invalid("JSONL item lacks string type")
    return value


def classify_tool(kind, item, activity):
    text = canon(item).decode("utf-8").lower()
    activity["tool_calls"] += 1
    if kind in {"file_change", "file_read", "file_write", "apply_patch"}:
        activity["file_accesses"] += 1
    elif kind in {"web_search", "web_fetch", "browser", "browser_action"}:
        activity["browsing"] += 1
        activity["network_accesses"] += 1
    elif kind in {"collaboration_tool_call", "agent_call", "subagent_call"}:
        activity["delegations"] += 1
    elif kind in {"memory_search", "memory_read", "memory_write", "memory_access"}:
        activity["memory_accesses"] += 1
    elif kind in {"command_execution", "shell_command", "mcp_tool_call", "custom_tool_call",
                  "image_generation", "computer_action"}:
        # These generic events do not expose a trustworthy capability subtype.
        # Count their opaque file/network potential conservatively rather than
        # asserting false zeroes; tool_calls remains the exact observed count.
        activity["file_accesses"] += 1
        activity["network_accesses"] += 1
        if "browser" in text or "web_search" in text or kind == "computer_action":
            activity["browsing"] += 1
        if any(word in text for word in ("collaboration", "spawn_agent", "subagent")):
            activity["delegations"] += 1
        if "memory" in text:
            activity["memory_accesses"] += 1
        if kind == "command_execution" and any(word in text for word in ("cat ", "sed ", "rg ", "path", "file")):
            activity["file_accesses"] += 1
    else:
        raise Invalid(f"unknown JSONL item type: {kind}")


def parse_jsonl(raw, final_file):
    activity = clean_activity()
    state = "EXPECT_THREAD"
    thread_id = None
    messages = []
    counted = set()
    if not raw or not raw.endswith(b"\n") or b"\r" in raw:
        return {"ok": False, "started": False, "failure_type": "JSONL_FRAMING_INVALID",
                "detail": "CLI JSONL is empty or lacks exact LF framing", "activity": activity,
                "thread_id": None}
    try:
        for sequence, line in enumerate(raw.splitlines(), 1):
            if not line:
                raise Invalid(f"JSONL line {sequence} is empty")
            event = parse_object(line, f"JSONL line {sequence}")
            event_type = event.get("type")
            if state == "DONE":
                raise Invalid("JSONL event follows turn.completed")
            if event_type == "thread.started":
                if (state != "EXPECT_THREAD" or sequence != 1
                        or not isinstance(event.get("thread_id"), str)
                        or not THREAD_ID.fullmatch(event["thread_id"])):
                    raise Invalid("thread.started cardinality/identity invalid")
                thread_id = event["thread_id"]
                state = "EXPECT_TURN"
            elif event_type == "turn.started":
                if state != "EXPECT_TURN":
                    raise Invalid("turn.started lifecycle/cardinality invalid")
                state = "IN_TURN"
            elif event_type == "turn.completed":
                if state != "IN_TURN" or not messages:
                    raise Invalid("turn.completed precedes completed agent_message")
                state = "DONE"
            elif event_type in {"turn.failed", "error"}:
                raise Invalid(f"CLI error event: {canon(event).decode('utf-8')[:512]}")
            elif event_type in {"item.started", "item.updated", "item.completed"}:
                if state != "IN_TURN":
                    raise Invalid(f"{event_type} occurs outside the active turn")
                item = event.get("item")
                if not isinstance(item, dict):
                    raise Invalid(f"{event_type} lacks item")
                kind = item_kind(item)
                if kind == "reasoning":
                    continue
                if kind == "agent_message":
                    if event_type == "item.completed":
                        text = item.get("text")
                        if not isinstance(text, str):
                            raise Invalid("completed agent_message lacks text")
                        messages.append(text.encode("utf-8"))
                    continue
                key = (item.get("id", f"line-{sequence}"), kind)
                if key not in counted:
                    classify_tool(kind, item, activity)
                    counted.add(key)
            else:
                raise Invalid(f"unknown JSONL event type: {event_type!r}")
        if state == "EXPECT_THREAD":
            raise Invalid("thread.started missing")
        if state != "DONE":
            raise Invalid("exact one-turn lifecycle did not complete")
        file_bytes = read_regular(final_file)
        file_bytes.decode("utf-8", "strict")
        if not same_final_representation(messages[-1], file_bytes):
            raise Invalid("output-last-message differs from last completed agent_message")
        for number, message in enumerate(messages[:-1], 1):
            activity["nonterminal_messages"].append({"sequence": number, "message_type": "MESSAGE",
                "utf8": message.decode("utf-8"), "sha256": sha(message), "bytes": len(message)})
        return {"ok": True, "started": True, "activity": activity, "final_bytes": file_bytes,
                "agent_message_count": len(messages), "thread_id": thread_id}
    except (Invalid, UnicodeDecodeError, OSError) as exc:
        return {"ok": False, "started": state != "EXPECT_THREAD", "failure_type": "CLI_OUTPUT_INVALID",
                "detail": f"{type(exc).__name__}:{exc}", "activity": activity,
                "thread_id": thread_id}


def activity_prohibited(activity):
    counters = ("tool_calls", "file_accesses", "browsing", "network_accesses",
                "delegations", "memory_accesses", "followup_turns")
    return any(activity[key] for key in counters) or bool(activity["nonterminal_messages"])


def validate_activity(activity):
    expected = set(clean_activity())
    if not isinstance(activity, dict) or set(activity) != expected:
        raise Invalid("observed activity exact fields mismatch")
    for key in ("tool_calls", "file_accesses", "browsing", "network_accesses",
                "delegations", "memory_accesses", "followup_turns"):
        if not nonnegative_int(activity[key]):
            raise Invalid(f"observed activity counter malformed: {key}")
    if activity["observation_basis"] != OBSERVATION_BASIS or not isinstance(activity["nonterminal_messages"], list):
        raise Invalid("observed activity basis/messages malformed")
    for sequence, message in enumerate(activity["nonterminal_messages"], 1):
        if not isinstance(message, dict) or set(message) != {"sequence", "message_type", "utf8", "sha256", "bytes"}:
            raise Invalid("nonterminal message exact fields mismatch")
        data = message.get("utf8")
        if not isinstance(data, str):
            raise Invalid("nonterminal message UTF-8 value malformed")
        encoded = data.encode("utf-8")
        if (message.get("sequence"), message.get("message_type"), message.get("sha256"), message.get("bytes")) != (sequence, "MESSAGE", sha(encoded), len(encoded)):
            raise Invalid("nonterminal message identity mismatch")
    return activity


def activity_capture(process_started, observation_complete, failure_type, thread_id, activity):
    validate_activity(activity)
    if not isinstance(process_started, bool) or not isinstance(observation_complete, bool):
        raise Invalid("activity capture state malformed")
    if failure_type is not None and (not isinstance(failure_type, str)
                                     or not re.fullmatch(r"[A-Z][A-Z0-9_]{0,127}", failure_type)):
        raise Invalid("activity capture failure type malformed")
    if thread_id is not None and (not isinstance(thread_id, str) or not THREAD_ID.fullmatch(thread_id)):
        raise Invalid("activity capture CLI thread identity malformed")
    if observation_complete and thread_id is None:
        raise Invalid("complete activity capture lacks CLI thread identity")
    return {"schema_id": ACTIVITY_CAPTURE_SCHEMA, "process_started": process_started,
            "observation_complete": observation_complete, "failure_type": failure_type,
            "cli_thread_id": thread_id, "activity": activity}


def normalized_final(data):
    return data[:-1] if data.endswith(b"\n") else data


def nonnegative_int(value):
    return isinstance(value, int) and not isinstance(value, bool) and value >= 0


def validate_request(raw, ordinal, run_id, run_kind, expected_cell):
    request = parse_object(raw, "spawn request", canonical=True)
    if set(request) != REQUEST_FIELDS:
        raise Invalid("spawn request exact fields mismatch")
    row_id = f"row-{ordinal:03d}"
    if request.get("schema_id") != REQUEST_SCHEMA:
        raise Invalid("spawn request schema mismatch")
    if not nonnegative_int(request.get("ordinal")) or not nonnegative_int(request.get("index")) or request.get("ordinal") != ordinal or request.get("index") != ordinal:
        raise Invalid("spawn request ordinal/index mismatch")
    if request.get("run_id") != run_id or request.get("run_kind") != run_kind or request.get("mode") != "actual":
        raise Invalid("spawn request run binding mismatch")
    if request.get("cell") != expected_cell:
        raise Invalid("spawn request cell/schedule mismatch")
    if request.get("slot") not in ROUTES or (request.get("model"), request.get("reasoning_effort")) != ROUTES[request["slot"]]:
        raise Invalid("spawn request route binding mismatch")
    nonce = request.get("nonce")
    if not isinstance(nonce, str) or not HEX.fullmatch(nonce):
        raise Invalid("spawn request nonce malformed")
    expected_nonce = sha(canon([run_id, ordinal, request.get("slot"), expected_cell]))
    if nonce != expected_nonce:
        raise Invalid("spawn request nonce derivation mismatch")
    if request.get("task_name") != f"r9_{nonce}" or request.get("expected_canonical_task_path") != f"/root/r9_{nonce}" or request.get("invocation_id") != f"r9-invocation:{nonce}":
        raise Invalid("spawn request compatibility identity mismatch")
    if request.get("agent_type") != "default" or request.get("fork_turns") != "none":
        raise Invalid("spawn request same-config identity mismatch")
    message = request.get("message_utf8")
    if not isinstance(message, str):
        raise Invalid("spawn request message_utf8 missing")
    message_bytes = message.encode("utf-8")
    if not nonnegative_int(request.get("message_bytes")) or request.get("message_sha256") != sha(message_bytes) or request.get("message_bytes") != len(message_bytes):
        raise Invalid("spawn request message identity mismatch")
    if not nonnegative_int(request.get("packet_bytes")) or not isinstance(request.get("packet_sha256"), str) or not HEX.fullmatch(request["packet_sha256"]):
        raise Invalid("spawn request packet byte count malformed")
    if not nonnegative_int(request.get("attempt_bytes")) or not isinstance(request.get("attempt_sha256"), str) or not HEX.fullmatch(request["attempt_sha256"]):
        raise Invalid("spawn request attempt identity malformed")
    return row_id, request, message_bytes


def expected_causal_inputs(attempt, cell_spec, cell_order, evidence_run, run_kind):
    actual = attempt.get("causal_inputs")
    if not isinstance(actual, list):
        raise Invalid("attempt causal_inputs is not a list")
    gate = cell_spec["dependency_gate"]
    expected_keys = [("PASS_CELL", item) for item in gate["required_pass_cells"]]
    expected_keys += [("STAGE_ARTIFACT", item) for item in gate["required_stage_artifacts"]]
    expected_keys.sort()
    if len(actual) != len(expected_keys):
        raise Invalid("attempt causal input cardinality mismatch")
    order = {cell: index for index, cell in enumerate(cell_order)}
    slot = attempt["slot"]
    slot_offset = 0 if run_kind == "run-canary" else list(ROUTES).index(slot) * len(cell_order)
    rebuilt = []
    for value, (kind, identity) in zip(actual, expected_keys):
        if not isinstance(value, dict) or set(value) != {"kind", "id", "path", "sha256", "bytes"}:
            raise Invalid("attempt causal input exact fields mismatch")
        if kind == "PASS_CELL":
            if identity not in order:
                raise Invalid(f"unknown causal PASS cell: {identity}")
            ordinal = slot_offset + order[identity]
            relative = f"rows/row-{ordinal:03d}/completion.json"
        else:
            relative = f"artifacts/{slot}/{identity}.json"
        path = evidence_run / relative
        data = read_regular(path)
        expected = {"kind": kind, "id": identity, "path": relative,
                    "sha256": sha(data), "bytes": len(data)}
        if value != expected:
            raise Invalid(f"attempt causal input binding mismatch: {kind}/{identity}")
        rebuilt.append(expected)
    if actual != sorted(rebuilt, key=lambda item: (item["kind"], item["id"], item["path"])):
        raise Invalid("attempt causal input order mismatch")
    return actual


def validate_attempt(raw, request, row_id, cell_spec, cell_order, evidence_run):
    if not raw.endswith(b"\n") or b"\n" in raw[:-1] or b"\r" in raw:
        raise Invalid("attempt storage framing mismatch")
    attempt = parse_object(raw[:-1], "attempt", canonical=True)
    if set(attempt) != ATTEMPT_FIELDS:
        raise Invalid("attempt exact fields mismatch")
    causal_inputs = expected_causal_inputs(attempt, cell_spec, cell_order, evidence_run,
                                           request["run_kind"])
    expected = {"schema_id": ATTEMPT_SCHEMA, "run_id": request["run_id"],
                "run_kind": request["run_kind"], "mode": request["mode"],
                "row_id": row_id, "slot": request["slot"], "cell": request["cell"],
                "index": request["index"], "ordinal": request["ordinal"],
                "nonce": request["nonce"], "invocation_id": request["invocation_id"],
                "task_name": request["task_name"],
                "expected_canonical_task_path": request["expected_canonical_task_path"],
                "agent_type": request["agent_type"], "fork_turns": request["fork_turns"],
                "model": request["model"], "reasoning_effort": request["reasoning_effort"],
                "causal_inputs": causal_inputs, "packet_sha256": request["packet_sha256"],
                "packet_bytes": request["packet_bytes"], "message_sha256": request["message_sha256"],
                "message_bytes": request["message_bytes"], "attempt": 1, "retry_count": 0,
                "best_of": False, "replacement_result": False, "no_retry": True,
                "no_relaunch": True, "admission_state": "FUSED_BEFORE_SPAWN"}
    if attempt != expected:
        raise Invalid("attempt/request/frozen-schedule binding mismatch")
    return attempt


def emit(runner, row_dir, number, event):
    data = canon(event) + b"\n"
    write_exclusive(row_dir / f"emitted_event_{number:03d}.json", data)
    runner.stdin.write(data)
    runner.stdin.flush()


def read_line_with_timeout(stream, timeout, label):
    fd = stream.fileno()
    deadline = time.monotonic() + timeout
    buffered = bytearray()
    while b"\n" not in buffered and len(buffered) <= MAX_LINE:
        remaining = deadline - time.monotonic()
        if remaining <= 0:
            raise Invalid(f"{label} timed out after {timeout} seconds with {len(buffered)} partial bytes")
        ready, _, _ = select.select([fd], [], [], remaining)
        if not ready:
            raise Invalid(f"{label} timed out after {timeout} seconds with {len(buffered)} partial bytes")
        part = os.read(fd, min(65536, MAX_LINE + 2 - len(buffered)))
        if not part:
            return bytes(buffered)
        buffered.extend(part)
    if b"\n" in buffered:
        end = buffered.index(10) + 1
        if end != len(buffered):
            raise Invalid(f"{label} included unexpected bytes after its first LF")
    return bytes(buffered)


def kill_and_drain(process, timeout=30, process_group=False):
    group_kill_sent = False
    if process_group:
        try:
            os.killpg(process.pid, signal.SIGKILL)
            group_kill_sent = True
        except ProcessLookupError:
            pass
    else:
        process.kill()
    try:
        return (*process.communicate(timeout=timeout), False, group_kill_sent)
    except subprocess.TimeoutExpired as exc:
        stdout = exc.output or b""
        stderr = exc.stderr or b""
        for pipe in (process.stdout, process.stderr):
            if pipe is not None:
                pipe.close()
        try:
            process.wait(timeout=timeout)
        except subprocess.TimeoutExpired:
            return stdout, stderr, True, group_kill_sent
        return stdout, stderr, True, group_kill_sent


def clear_residual_process_group(process_group_id, timeout=5):
    try:
        os.killpg(process_group_id, 0)
    except ProcessLookupError:
        return {"detected": False, "kill_sent": False, "clear": True}
    detected = True
    kill_sent = False
    try:
        os.killpg(process_group_id, signal.SIGKILL)
        kill_sent = True
    except ProcessLookupError:
        return {"detected": detected, "kill_sent": False, "clear": True}
    deadline = time.monotonic() + timeout
    while time.monotonic() < deadline:
        try:
            os.killpg(process_group_id, 0)
        except ProcessLookupError:
            return {"detected": detected, "kill_sent": kill_sent, "clear": True}
        time.sleep(0.05)
    return {"detected": detected, "kill_sent": kill_sent, "clear": False}


def subject_cli_argv(cli, request, final_path):
    return [cli["resolved_path"], "exec", "--ephemeral", "--strict-config", "-C",
            str(WORKSPACE), "--sandbox", "read-only", "--color", "never", "--json",
            "-m", request["model"],
            "-c", f'model_reasoning_effort="{request["reasoning_effort"]}"',
            "-c", "suppress_unstable_features_warning=true",
            "-o", str(final_path), "-"]


def run_cli(cli, request, message, row_dir, timeout):
    final_path = row_dir / "cli_output_last_message.bin"
    argv = subject_cli_argv(cli, request, final_path)
    write_json(row_dir / "cli_argv.json", argv)
    started_utc = utc_now()
    write_json(row_dir / "cli_launch_attempt.json", {
        "argv": argv, "cwd": str(WORKSPACE), "attempted_utc": started_utc,
        "stdin_bytes": len(message), "stdin_sha256": sha(message)})
    try:
        process = subprocess.Popen(argv, cwd=WORKSPACE, stdin=subprocess.PIPE,
                                   stdout=subprocess.PIPE, stderr=subprocess.PIPE,
                                   start_new_session=True)
    except OSError as exc:
        ended_utc = utc_now()
        stderr = str(exc).encode("utf-8")
        write_exclusive(row_dir / "cli_stdout.jsonl", b"")
        write_exclusive(row_dir / "cli_stderr.bin", stderr)
        write_json(row_dir / "cli_process.json", {
            "argv": argv, "cwd": str(WORKSPACE), "ended_utc": ended_utc, "pid": None,
            "returncode": None, "started_utc": started_utc, "process_started": False,
            "timed_out": False, "drain_timed_out": False,
            "start_new_session": True, "process_group_id": None, "group_kill_sent": False,
            "stdin_bytes": len(message), "stdin_sha256": sha(message)})
        activity = clean_activity()
        write_json(row_dir / "cli_observed_activity.json",
                   activity_capture(False, False, "CLI_START_FAILED", None, activity))
        return {"ok": False, "started": False, "process_started": False,
                "failure_type": "CLI_START_FAILED",
                "detail": stderr.decode("utf-8", "replace") or "Popen failed",
                "activity": activity}
    try:
        write_json(row_dir / "cli_process_started.json", {
            "pid": process.pid, "process_group_id": process.pid,
            "start_new_session": True, "started_utc": started_utc})
    except Exception:
        kill_and_drain(process, process_group=True)
        raise
    io_error = None
    try:
        stdout, stderr = process.communicate(input=message, timeout=timeout)
        timed_out = False
        drain_timed_out = False
        group_kill_sent = False
    except subprocess.TimeoutExpired:
        stdout, stderr, drain_timed_out, group_kill_sent = kill_and_drain(
            process, process_group=True)
        timed_out = True
    except Exception as exc:
        stdout, stderr, drain_timed_out, group_kill_sent = kill_and_drain(
            process, process_group=True)
        timed_out = False
        io_error = f"{type(exc).__name__}:{exc}"
    residual_group = clear_residual_process_group(process.pid)
    group_kill_sent = group_kill_sent or residual_group["kill_sent"]
    rc = process.returncode
    ended_utc = utc_now()
    write_exclusive(row_dir / "cli_stdout.jsonl", stdout)
    write_exclusive(row_dir / "cli_stderr.bin", stderr)
    if final_path.exists():
        fsync_existing(final_path)
    process_record = {"argv": argv, "cwd": str(WORKSPACE), "ended_utc": ended_utc,
                      "pid": process.pid, "returncode": rc, "started_utc": started_utc,
                      "process_started": True,
                      "timed_out": timed_out, "drain_timed_out": drain_timed_out,
                      "start_new_session": True, "process_group_id": process.pid,
                      "group_kill_sent": group_kill_sent,
                      "residual_group": residual_group,
                      "stdin_bytes": len(message),
                      "stdin_sha256": sha(message)}
    write_json(row_dir / "cli_process.json", process_record)
    parsed = parse_jsonl(stdout, final_path)
    observation_complete = bool(parsed["ok"])
    parsed["process_started"] = True
    if io_error is not None:
        parsed.update(ok=False, failure_type="CLI_IO_ERROR", detail=io_error)
        observation_complete = False
    elif residual_group["detected"]:
        parsed.update(ok=False, failure_type="CLI_DESCENDANT_RESIDUAL",
                      detail=f"CLI process group remained after direct process exit; clear={residual_group['clear']}")
        observation_complete = False
    elif timed_out:
        detail = f"CLI exceeded {timeout} seconds"
        if drain_timed_out:
            detail += "; output pipes remained open after SIGKILL"
        parsed.update(ok=False, failure_type="CLI_TIMEOUT", detail=detail)
        observation_complete = False
    elif rc != 0:
        parsed.update(ok=False, failure_type="CLI_NONZERO", detail=f"CLI exited with returncode {rc}")
    validate_activity(parsed["activity"])
    write_json(row_dir / "cli_observed_activity.json",
               activity_capture(True, observation_complete, parsed.get("failure_type"),
                                parsed.get("thread_id"), parsed["activity"]))
    return parsed


def inventory(root, excluded=()):
    excluded = set(excluded)
    rows = []
    for path in sorted(root.rglob("*")):
        relative = path.relative_to(root).as_posix()
        if relative in excluded:
            continue
        info = path.lstat()
        if stat.S_ISDIR(info.st_mode):
            continue
        if not stat.S_ISREG(info.st_mode):
            raise Invalid(f"inventory member not regular: {path}")
        data = read_regular(path)
        rows.append({"path": relative, "sha256": sha(data), "bytes": len(data)})
    return rows


def tree_binding(root):
    try:
        root_info = root.lstat()
    except FileNotFoundError:
        return {"present": False}
    if not stat.S_ISDIR(root_info.st_mode) or root.is_symlink():
        raise Invalid(f"protected root is not a regular directory: {root}")
    rows = []
    file_count = directory_count = aggregate_file_bytes = 0
    for path in sorted(root.rglob("*")):
        info = path.lstat()
        relative = path.relative_to(root).as_posix()
        if stat.S_ISDIR(info.st_mode):
            rows.append({"path": relative, "type": "directory", "mode": stat.S_IMODE(info.st_mode)})
            directory_count += 1
        elif stat.S_ISREG(info.st_mode):
            data = read_regular(path)
            rows.append({"path": relative, "type": "file", "mode": stat.S_IMODE(info.st_mode),
                         "sha256": sha(data), "bytes": len(data)})
            file_count += 1
            aggregate_file_bytes += len(data)
        else:
            raise Invalid(f"protected root contains nonregular entry: {path}")
    payload = canon(rows)
    return {"present": True, "file_count": file_count, "directory_count": directory_count,
            "aggregate_file_bytes": aggregate_file_bytes, "rows_sha256": sha(payload),
            "rows_bytes": len(payload), "root_mode": stat.S_IMODE(root_info.st_mode)}


def protected_run_state():
    return {str(root): tree_binding(root) for root in PROTECTED_RUN_ROOTS}


def assert_protected_baseline(state):
    if state != PROTECTED_EXPECTED:
        raise Invalid("protected Matrix005 failure / Matrix006 absence baseline mismatch")
    return state


def protected_canary_state():
    receipt = runtime_identity(PROTECTED_CANARY_FAILURE_RECEIPT)
    return {
        "roots": {str(root): tree_binding(root) for root in PROTECTED_CANARY_ROOTS},
        "failure_receipt": {"bytes": receipt["bytes"], "sha256": receipt["sha256"],
                            "mode": receipt["mode"]},
    }


def assert_protected_canary_baseline(state):
    expected = {"roots": PROTECTED_CANARY_EXPECTED,
                "failure_receipt": PROTECTED_CANARY_FAILURE_RECEIPT_EXPECTED}
    if state != expected:
        raise Invalid("protected Canary001 roots / failure receipt baseline mismatch")
    return state


def derive_capture_counts(capture):
    request_files = sorted(capture.glob("row-*/spawn_request.json"))
    attempt_files = sorted(capture.glob("row-*/cli_launch_attempt.json"))
    process_files = sorted(capture.glob("row-*/cli_process_started.json"))
    activity_files = sorted(capture.glob("row-*/cli_observed_activity.json"))
    event_files = sorted(capture.glob("row-*/emitted_event_*.json"))
    typed_failures = valid_deliveries = 0
    for path in event_files:
        raw = read_regular(path)
        if not raw.endswith(b"\n") or b"\n" in raw[:-1]:
            raise Invalid(f"emitted event capture framing invalid: {path}")
        value = parse_object(raw[:-1], "emitted event capture", canonical=True)
        if value.get("schema_id") == FAILURE_SCHEMA:
            typed_failures += 1
        elif value.get("schema_id") == DELIVERY_SCHEMA:
            valid_deliveries += 1
    if {path.parent for path in activity_files} != {path.parent for path in attempt_files}:
        raise Invalid("activity capture / CLI launch-attempt row set mismatch")
    return {"spawn_requests": len(request_files), "cli_launch_attempts": len(attempt_files),
            "cli_processes": len(process_files), "emitted_events": len(event_files),
            "activity_captures": len(activity_files),
            "valid_terminal_deliveries": valid_deliveries,
            "typed_transport_failures": typed_failures}


def recount_activity(capture):
    totals = clean_activity()
    complete_rows = []
    incomplete_rows = []
    for path in sorted(capture.glob("row-*/cli_observed_activity.json")):
        raw = read_regular(path)
        if not raw.endswith(b"\n") or b"\n" in raw[:-1] or b"\r" in raw:
            raise Invalid(f"activity capture framing invalid: {path}")
        value = parse_object(raw[:-1], "activity capture", canonical=True)
        if set(value) != {"schema_id", "process_started", "observation_complete",
                          "failure_type", "cli_thread_id", "activity"} or value.get("schema_id") != ACTIVITY_CAPTURE_SCHEMA:
            raise Invalid(f"activity capture exact fields/schema mismatch: {path}")
        activity_capture(value.get("process_started"), value.get("observation_complete"),
                         value.get("failure_type"), value.get("cli_thread_id"),
                         value.get("activity"))
        activity = value["activity"]
        for key in ("tool_calls", "file_accesses", "browsing", "network_accesses",
                    "delegations", "memory_accesses", "followup_turns"):
            totals[key] += activity[key]
        totals["nonterminal_messages"].extend(activity["nonterminal_messages"])
        row_id = path.parent.name
        (complete_rows if value["observation_complete"] else incomplete_rows).append(row_id)
    return totals, complete_rows, incomplete_rows


def planned_slots(run_kind):
    if run_kind == "run-canary":
        return ["slot-alpha", "slot-bravo", "slot-charlie"]
    return [slot for slot in ROUTES for _ in range(97)]


def should_close(ordinal, failed_slots, slots):
    return all(slot in failed_slots for slot in slots[ordinal + 1:])


def assert_run_id_available(run_id):
    if run_id in CONSUMED_RUN_IDS:
        raise Invalid(f"consumed prior run_id may not be reused: {run_id}")
    return run_id


def self_tests():
    request = {key: None for key in REQUEST_FIELDS}
    request.update(invocation_id="r9-invocation:" + "a" * 64,
                   expected_canonical_task_path="/root/r9_" + "a" * 64)
    good = receipt(request)
    if parse_object(canon(good), "receipt", canonical=True) != good:
        raise Invalid("canonical event self-test failed")
    if same_final_representation(b"x\n\n", b"x") or not same_final_representation(b"x", b"x\n"):
        raise Invalid("message identity rejection self-test failed")
    sample = clean_activity()
    classify_tool("web_search", {"type": "web_search", "id": "1"}, sample)
    if (sample["tool_calls"], sample["browsing"], sample["network_accesses"]) != (1, 1, 1):
        raise Invalid("JSONL activity mapping self-test failed")
    slots = planned_slots("run-matrix")
    if should_close(194, {"slot-alpha", "slot-bravo"}, slots) or not should_close(194, {"slot-alpha", "slot-bravo", "slot-charlie"}, slots):
        raise Invalid("EOF decision self-test failed")
    if not should_close(290, set(), slots):
        raise Invalid("last-row EOF self-test failed")
    argv = subject_cli_argv({"resolved_path": "/tmp/codex-stub"},
                            {"model": "stub-model", "reasoning_effort": "medium"},
                            pathlib.Path("/tmp/final-stub"))
    config_values = [argv[index + 1] for index, value in enumerate(argv[:-1]) if value == "-c"]
    if config_values != ['model_reasoning_effort="medium"',
                         "suppress_unstable_features_warning=true"]:
        raise Invalid("per-subject CLI config argv self-test failed")
    if any(value == "features.chronicle=false" for value in config_values):
        raise Invalid("Chronicle disablement argv self-test failed")
    for consumed_run_id in CONSUMED_RUN_IDS:
        try:
            assert_run_id_available(consumed_run_id)
        except Invalid:
            pass
        else:
            raise Invalid(f"consumed run-id rejection self-test failed: {consumed_run_id}")
    if assert_run_id_available("candidate-v7-fresh-id-self-test") != "candidate-v7-fresh-id-self-test":
        raise Invalid("fresh run-id admission self-test failed")
    return {"canonical_events": "PASS", "message_identity_rejection": "PASS",
            "jsonl_activity_mapping": "PASS", "eof_decision": "PASS",
            "subject_warning_suppression_argv": "PASS", "chronicle_enabled": "PASS",
            "consumed_run_ids_rejected": "PASS", "fresh_run_id_admitted": "PASS"}


def do_check():
    component = component_identity()
    load_bundle(component)
    environment = environment_identity()
    cli = cli_identity()
    config = assert_config_baseline(config_identity())
    protected = assert_protected_baseline(protected_run_state())
    protected_canary = assert_protected_canary_baseline(protected_canary_state())
    ast_check = ast_self_check()
    tests = self_tests()
    return {"schema_id": CHECK_SCHEMA, "controller_revision": CONTROLLER_REVISION,
            "transport_revision": TRANSPORT_REVISION, "status": "PASS",
            "read_only": True, "output_writes": 0, "runner_launches": 0, "subject_calls": 0,
            "provider_calls": 0, "existing_run_launches": 0, "component_identity": component,
            "routes": {key: {"model": value[0], "reasoning_effort": value[1]} for key, value in ROUTES.items()},
            "cli": cli, "config_identity": config, "environment_identity": environment,
            "protected_run_state": protected,
            "protected_canary_state": protected_canary,
            "ast": ast_check, "self_tests": tests,
            "protected_run_ids": sorted(PROTECTED_RUN_IDS),
            "consumed_run_ids": sorted(CONSUMED_RUN_IDS)}


def do_run(args):
    assert_run_id_available(args.run_id)
    evidence = pathlib.Path(args.evidence_root)
    capture = pathlib.Path(args.capture_root)
    if not evidence.is_absolute() or not capture.is_absolute():
        raise Invalid("evidence-root and capture-root must be absolute")
    if not SAFE_ID.fullmatch(args.run_id):
        raise Invalid("run-id is not a safe single path component")
    if not evidence.is_dir():
        raise Invalid("evidence-root must be an existing directory")
    evidence_run = evidence / args.run_id
    resolved_capture = capture.resolve(strict=False)
    resolved_run = evidence_run.resolve(strict=False)
    if resolved_capture == resolved_run or resolved_capture in resolved_run.parents or resolved_run in resolved_capture.parents:
        raise Invalid("capture-root and evidence run root must not overlap")
    for protected in PROTECTED_RUN_ROOTS:
        resolved_protected = protected.resolve(strict=False)
        for target, label in ((resolved_capture, "capture-root"), (resolved_run, "evidence run root")):
            if target == resolved_protected or target in resolved_protected.parents or resolved_protected in target.parents:
                raise Invalid(f"{label} overlaps protected Matrix005/006 root: {protected}")
    for protected in PROTECTED_CANARY_ROOTS:
        resolved_protected = protected.resolve(strict=False)
        for target, label in ((resolved_capture, "capture-root"), (resolved_run, "evidence run root")):
            if target == resolved_protected or target in resolved_protected.parents or resolved_protected in target.parents:
                raise Invalid(f"{label} overlaps protected Canary001 root: {protected}")
    if evidence_run.exists():
        raise Invalid("runner evidence run root already exists")
    if capture.exists():
        raise Invalid("capture-root already exists")
    component_before = component_identity()
    cell_expected, cell_order, instruction = load_bundle(component_before)
    environment_before = environment_identity()
    cli = cli_identity()
    config_before = assert_config_baseline(config_identity())
    protected_before = assert_protected_baseline(protected_run_state())
    protected_canary_before = assert_protected_canary_baseline(protected_canary_state())
    self_tests()
    mkdir_exclusive(capture)
    stderr_path = capture / "runner_stderr.bin"
    stderr_fd = os.open(stderr_path, os.O_WRONLY | os.O_CREAT | os.O_EXCL, 0o600)
    env = os.environ.copy()
    env["PW_R9_EVIDENCE_ROOT"] = str(evidence)
    runner_argv = ["python3", "-B", "runner.py", args.run_kind, "--run-root", args.run_id]
    started_utc = utc_now()
    runner = subprocess.Popen(runner_argv, cwd=CANDIDATE, env=env, stdin=subprocess.PIPE,
                              stdout=subprocess.PIPE, stderr=stderr_fd,
                              start_new_session=True)
    requests = events = cli_launch_attempts = cli_processes = typed_failures = valid_deliveries = 0
    failed_slots = set()
    slots = planned_slots(args.run_kind)
    closed = False
    controller_error = None
    try:
        ordinal = 0
        while ordinal < len(slots):
            while ordinal < len(slots) and slots[ordinal] in failed_slots:
                ordinal += 1
            if ordinal == len(slots):
                if runner.stdin and not runner.stdin.closed:
                    runner.stdin.close()
                closed = True
                break
            raw_line = read_line_with_timeout(runner.stdout, args.runner_request_timeout_seconds,
                                              f"runner request ordinal {ordinal}")
            if not raw_line:
                raise Invalid(f"runner stdout EOF before request ordinal {ordinal}")
            if len(raw_line) > MAX_LINE + 1 or not raw_line.endswith(b"\n") or b"\n" in raw_line[:-1] or b"\r" in raw_line:
                raise Invalid(f"runner request line framing invalid at ordinal {ordinal}")
            raw = raw_line[:-1]
            expected_cell = cell_order[0] if args.run_kind == "run-canary" else cell_order[ordinal % len(cell_order)]
            row_id, request, message = validate_request(raw, ordinal, args.run_id, args.run_kind,
                                                        expected_cell)
            if request["slot"] != slots[ordinal]:
                raise Invalid(f"runner schedule slot mismatch at ordinal {ordinal}")
            row_dir = capture / row_id
            mkdir_exclusive(row_dir)
            write_exclusive(row_dir / "spawn_request.json", raw_line)
            requests += 1
            runner_message = evidence / args.run_id / "rows" / row_id / "spawn_message.txt"
            runner_packet = evidence / args.run_id / "rows" / row_id / "provider_input.txt"
            runner_attempt = evidence / args.run_id / "rows" / row_id / "attempt.json"
            message_on_disk = read_regular(runner_message)
            packet_on_disk = read_regular(runner_packet)
            attempt_on_disk = read_regular(runner_attempt)
            write_exclusive(row_dir / "request_message.bin", message)
            write_exclusive(row_dir / "runner_spawn_message.bin", message_on_disk)
            write_exclusive(row_dir / "runner_provider_input.bin", packet_on_disk)
            write_exclusive(row_dir / "runner_attempt.json", attempt_on_disk)
            cell_spec = cell_expected.get(request["cell"])
            if cell_spec is None:
                raise Invalid(f"request cell absent from frozen semantic bundle: {request['cell']}")
            attempt_value = validate_attempt(attempt_on_disk, request, row_id, cell_spec,
                                             cell_order, evidence_run)
            request_binding_valid = (
                message_on_disk == message
                and sha(message_on_disk) == request["message_sha256"]
                and len(message_on_disk) == request["message_bytes"]
                and packet_on_disk == cell_spec["render"]
                and sha(packet_on_disk) == request["packet_sha256"]
                and len(packet_on_disk) == request["packet_bytes"]
                and packet_on_disk.endswith(b"\n")
                and b"\r" not in packet_on_disk
                and message == instruction + packet_on_disk[:-1]
                and sha(attempt_on_disk) == request["attempt_sha256"]
                and len(attempt_on_disk) == request["attempt_bytes"]
                and attempt_value["message_sha256"] == sha(message)
            )
            if not request_binding_valid:
                emit(runner, row_dir, 1, failure(request, "SPAWN_ATTEMPT", "MESSAGE_IDENTITY_INVALID",
                                                  f"runner request storage/fusion identity mismatch: {row_id}"))
                events += 1
                typed_failures += 1
                runner.stdin.close()
                closed = True
                break
            write_json(row_dir / "message_identity.json", {"bytes": len(message), "sha256": sha(message),
                                                            "runner_path": str(runner_message)})
            component_identity()
            assert_execution_inputs_stable(cli, config_before, environment_before)
            if protected_run_state() != protected_before:
                raise Invalid("protected Matrix005/006 state changed before subject launch")
            if protected_canary_state() != protected_canary_before:
                raise Invalid("protected Canary001 state changed before subject launch")
            cli_launch_attempts += 1
            outcome = run_cli(cli, request, message, row_dir, args.cli_timeout_seconds)
            cli_processes += int(outcome.get("process_started", False))
            assert_execution_inputs_stable(cli, config_before, environment_before)
            if protected_run_state() != protected_before:
                raise Invalid("protected Matrix005/006 state changed during subject launch")
            if protected_canary_state() != protected_canary_before:
                raise Invalid("protected Canary001 state changed during subject launch")
            if not outcome["started"]:
                emit(runner, row_dir, 1, failure(request, "SPAWN_ATTEMPT",
                                                  outcome["failure_type"], outcome["detail"]))
                events += 1
                typed_failures += 1
                closed = True
            else:
                emit(runner, row_dir, 1, receipt(request))
                events += 1
                if outcome["ok"]:
                    final_bytes = outcome["final_bytes"]
                    event = delivery(request, final_bytes, outcome["activity"])
                    emit(runner, row_dir, 2, event)
                    events += 1
                    valid_deliveries += 1
                    expected = cell_spec["expected_output"]
                    if activity_prohibited(outcome["activity"]) or normalized_final(final_bytes) != expected:
                        failed_slots.add(request["slot"])
                    closed = should_close(ordinal, failed_slots, slots)
                else:
                    emit(runner, row_dir, 2, failure(request, "TERMINAL_DRAIN",
                                                      outcome["failure_type"], outcome["detail"]))
                    events += 1
                    typed_failures += 1
                    closed = True
            if closed:
                runner.stdin.close()
                break
            ordinal += 1
        if not closed:
            runner.stdin.close()
            closed = True
    except Exception as exc:
        controller_error = f"{type(exc).__name__}:{exc}"
        if runner.stdin and not runner.stdin.closed:
            runner.stdin.close()
        closed = True
    runner.stdin = None
    runner_group_kill_sent = False
    try:
        final_stdout, _ = runner.communicate(timeout=120)
    except subprocess.TimeoutExpired:
        final_stdout, _, drain_timed_out, runner_group_kill_sent = kill_and_drain(
            runner, process_group=True)
        detail = "Invalid:runner did not terminate after stdin EOF"
        if drain_timed_out:
            detail += "; output pipe remained open after SIGKILL"
        controller_error = controller_error or detail
    runner_residual_group = clear_residual_process_group(runner.pid)
    runner_group_kill_sent = runner_group_kill_sent or runner_residual_group["kill_sent"]
    if runner_residual_group["detected"]:
        controller_error = controller_error or (
            f"Invalid:runner process group remained after direct process exit; "
            f"clear={runner_residual_group['clear']}")
    ended_utc = utc_now()
    os.fsync(stderr_fd)
    os.close(stderr_fd)
    fsync_dir(capture)
    write_exclusive(capture / "runner_stdout_terminal.bin", final_stdout)
    runner_record = {"argv": runner_argv, "cwd": str(CANDIDATE), "ended_utc": ended_utc,
                     "pid": runner.pid, "returncode": runner.returncode, "started_utc": started_utc,
                     "start_new_session": True, "process_group_id": runner.pid,
                     "group_kill_sent": runner_group_kill_sent,
                     "residual_group": runner_residual_group,
                     "stdin_closed": closed, "environment_binding": {"PW_R9_EVIDENCE_ROOT": str(evidence)}}
    write_json(capture / "runner_process.json", runner_record)
    runner_result = None
    try:
        if not final_stdout.endswith(b"\n") or b"\n" in final_stdout[:-1] or b"\r" in final_stdout:
            raise Invalid("runner terminal output framing invalid")
        runner_result = parse_object(final_stdout[:-1], "runner terminal result", canonical=True)
    except Exception as exc:
        controller_error = controller_error or f"{type(exc).__name__}:{exc}"
    write_json(capture / "runner_result_capture.json", {"parsed": runner_result,
                                                         "returncode": runner.returncode,
                                                         "controller_error": controller_error})
    try:
        component_after = component_identity()
        if component_before != component_after:
            controller_error = controller_error or "Invalid:Candidate V7 identity changed during run"
    except Exception as exc:
        component_after = {"unavailable": True, "error": f"{type(exc).__name__}:{exc}"}
        controller_error = controller_error or f"POSTFLIGHT_COMPONENT_IDENTITY:{type(exc).__name__}:{exc}"
    try:
        config_after = config_identity()
        if config_before != config_after:
            controller_error = controller_error or "Invalid:Codex CLI configuration changed during run"
    except Exception as exc:
        config_after = {"unavailable": True, "error": f"{type(exc).__name__}:{exc}"}
        controller_error = controller_error or f"POSTFLIGHT_CONFIG_IDENTITY:{type(exc).__name__}:{exc}"
    try:
        assert_execution_inputs_stable(cli, config_before, environment_before)
    except Exception as exc:
        controller_error = controller_error or f"{type(exc).__name__}:{exc}"
    try:
        environment_after = environment_identity()
        if environment_before != environment_after:
            controller_error = controller_error or "Invalid:controller/CLI inherited environment changed during run"
    except Exception as exc:
        environment_after = {"unavailable": True, "error": f"{type(exc).__name__}:{exc}"}
        controller_error = controller_error or f"POSTFLIGHT_ENVIRONMENT_IDENTITY:{type(exc).__name__}:{exc}"
    try:
        protected_after = protected_run_state()
        if protected_before != protected_after:
            controller_error = controller_error or "Invalid:protected Matrix005/006 state changed during run"
    except Exception as exc:
        protected_after = {"unavailable": True, "error": f"{type(exc).__name__}:{exc}"}
        controller_error = controller_error or f"POSTFLIGHT_PROTECTED_STATE:{type(exc).__name__}:{exc}"
    try:
        protected_canary_after = protected_canary_state()
        if protected_canary_before != protected_canary_after:
            controller_error = controller_error or "Invalid:protected Canary001 state changed during run"
    except Exception as exc:
        protected_canary_after = {"unavailable": True, "error": f"{type(exc).__name__}:{exc}"}
        controller_error = controller_error or f"POSTFLIGHT_PROTECTED_CANARY_STATE:{type(exc).__name__}:{exc}"
    try:
        durable_counts = derive_capture_counts(capture)
    except Exception as exc:
        controller_error = controller_error or f"{type(exc).__name__}:{exc}"
        durable_counts = {"spawn_requests": requests, "cli_launch_attempts": cli_launch_attempts,
                          "cli_processes": cli_processes, "emitted_events": events,
                          "valid_terminal_deliveries": valid_deliveries,
                          "typed_transport_failures": typed_failures}
    try:
        evidence_files = inventory(evidence_run) if evidence_run.is_dir() else []
    except Exception as exc:
        evidence_files = [{"unavailable": True, "error": f"{type(exc).__name__}:{exc}"}]
        controller_error = controller_error or f"POSTFLIGHT_EVIDENCE_INVENTORY:{type(exc).__name__}:{exc}"
    try:
        capture_files = inventory(capture, excluded=("terminal_controller_receipt.json",))
    except Exception as exc:
        capture_files = [{"unavailable": True, "error": f"{type(exc).__name__}:{exc}"}]
        controller_error = controller_error or f"POSTFLIGHT_CAPTURE_INVENTORY:{type(exc).__name__}:{exc}"
    try:
        activity_counts, activity_complete_rows, activity_incomplete_rows = recount_activity(capture)
    except Exception as exc:
        controller_error = controller_error or f"{type(exc).__name__}:{exc}"
        activity_counts, activity_complete_rows, activity_incomplete_rows = clean_activity(), [], []
    qualification = runner_result if isinstance(runner_result, dict) else None
    status = "COMPLETE" if controller_error is None and qualification is not None else "CONTROLLER_INVALID"
    terminal = {"schema_id": TERMINAL_SCHEMA, "controller_revision": CONTROLLER_REVISION,
        "status": status,
        "run_id": args.run_id, "run_kind": args.run_kind, "evidence_root": str(evidence),
        "capture_root": str(capture), "controller_error": controller_error,
        "counts": {"planned_rows": len(slots), **durable_counts,
                   "retry_count": 0, "relaunch_count": 0, "replacement_count": 0,
                   "best_of_count": 0},
        "observed_activity_totals": activity_counts,
        "activity_observation_complete_rows": activity_complete_rows,
        "activity_observation_incomplete_rows": activity_incomplete_rows,
        "component_identity_before": component_before,
        "component_identity_after": component_after, "cli": cli,
        "config_identity_before": config_before, "config_identity_after": config_after,
        "environment_identity_before": environment_before,
        "environment_identity_after": environment_after,
        "protected_run_state_before": protected_before, "protected_run_state_after": protected_after,
        "protected_canary_state_before": protected_canary_before,
        "protected_canary_state_after": protected_canary_after,
        "runner_process": runner_record,
        "runner_result_is_sole_qualification_authority": True, "qualification_authority": qualification,
        "compatibility_label_disclosure": "Request-derived /root/... task paths are compatibility labels only; they are not platform collaboration attestations.",
        "transport_revision": TRANSPORT_REVISION,
        "transport_nonclaims": {"self_certification": False, "platform_task_path_attestation": False,
                                "atomic_runtime_input_snapshot_attestation": False,
                                "session_persistence": False,
                                "cloud_managed_policy_stability_attestation": False,
                                "detached_descendant_containment_attestation": False,
                                "unrecorded_inherited_environment_attestation": False},
        "activity_subtype_policy": "Exact tool-call cardinality; opaque command/MCP/custom/computer actions are conservatively counted as file and network access rather than false-zero subtype claims.",
        "capture_inventory_scope": "all regular files below capture_root before terminal_controller_receipt.json",
        "capture_inventory": capture_files, "evidence_inventory_scope": "all regular files below evidence_root/run_id",
        "evidence_inventory": evidence_files}
    write_json(capture / "terminal_controller_receipt.json", terminal)
    return terminal, (runner.returncode if status == "COMPLETE" else 2)


def parse_args(argv):
    parser = argparse.ArgumentParser()
    sub = parser.add_subparsers(dest="command", required=True)
    sub.add_parser("check")
    run = sub.add_parser("run")
    run.add_argument("--run-kind", choices=sorted(RUN_KINDS), required=True)
    run.add_argument("--run-id", required=True)
    run.add_argument("--evidence-root", required=True)
    run.add_argument("--capture-root", required=True)
    run.add_argument("--cli-timeout-seconds", type=int, default=900)
    run.add_argument("--runner-request-timeout-seconds", type=int, default=900)
    args = parser.parse_args(argv)
    if getattr(args, "cli_timeout_seconds", 1) <= 0:
        parser.error("--cli-timeout-seconds must be positive")
    if getattr(args, "runner_request_timeout_seconds", 1) <= 0:
        parser.error("--runner-request-timeout-seconds must be positive")
    return args


def main(argv=None):
    try:
        args = parse_args(sys.argv[1:] if argv is None else argv)
        if args.command == "check":
            result, rc = do_check(), 0
        else:
            result, rc = do_run(args)
        sys.stdout.buffer.write(canon(result) + b"\n")
        sys.stdout.buffer.flush()
        return rc
    except Exception as exc:
        result = {"schema_id": ERROR_SCHEMA, "controller_revision": CONTROLLER_REVISION,
                  "transport_revision": TRANSPORT_REVISION,
                  "status": "CONTROLLER_INVALID", "error_type": type(exc).__name__, "error": str(exc),
                  "runner_launches": 0 if "args" not in locals() or getattr(args, "command", None) == "check" else None,
                  "subject_calls": 0 if "args" not in locals() or getattr(args, "command", None) == "check" else None}
        sys.stdout.buffer.write(canon(result) + b"\n")
        sys.stdout.buffer.flush()
        return 2


if __name__ == "__main__":
    raise SystemExit(main())
