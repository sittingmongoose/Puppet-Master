#!/usr/bin/env python3
"""Run exactly one fresh R8 candidate-2 subject task and emit one receipt.

The driver renders through the frozen harness, starts one fresh task, and
reopens its rollout.  Completed subject-controlled response nonconformance is
evidence, not a controller error.  The driver never scores, retries, or writes.
"""
from __future__ import annotations

import argparse
import hashlib
import json
import os
from pathlib import Path
import re
import select
import subprocess
import sys
import time
from typing import Any

sys.dont_write_bytecode = True
REPO = Path("/mnt/Cursor/PuppetMaster")
LANE = REPO / "tests/agent_packet_restrictions/successor_20260813/model_retest_r8_candidate_v2"
HARNESS = LANE / "r8_harness.py"
VERIFIER = LANE / "r8_run_verifier.py"
CANDIDATE_ID = "PW-R8-ITERATIVE-FIX-TWO-CLEAN-RUNS-20260815.CANDIDATE-2"
WRAPPER_SOURCE_THREAD_ID = "019ffbff-994a-76f0-9c06-57bab28b7ee3"
ROUTES = {
    "slot-alpha": ("gpt-5.4-mini", "xhigh"),
    "slot-bravo": ("gpt-5.4-mini", "medium"),
    "slot-charlie": ("gpt-5.6-luna", "medium"),
}
RUN_ID_RE = re.compile(r"^[A-Za-z0-9][A-Za-z0-9._-]{0,127}$")
PROHIBITED_ITEM_TYPES = {
    "function_call", "function_call_output", "web_search_call",
    "computer_tool_call", "image_generation_call",
}


class DriverError(RuntimeError):
    pass


def canonical(value: Any) -> bytes:
    return json.dumps(value, separators=(",", ":"), ensure_ascii=False).encode("utf-8")


def digest(data: bytes) -> dict[str, Any]:
    return {"sha256": hashlib.sha256(data).hexdigest(), "bytes": len(data)}


def send(proc: subprocess.Popen[str], message: dict[str, Any]) -> None:
    assert proc.stdin is not None
    proc.stdin.write(canonical(message).decode("utf-8") + "\n")
    proc.stdin.flush()


def next_message(proc: subprocess.Popen[str], deadline: float) -> dict[str, Any]:
    assert proc.stdout is not None
    while time.monotonic() < deadline:
        ready, _, _ = select.select([proc.stdout], [], [], min(30.0, max(0.0, deadline - time.monotonic())))
        if not ready:
            continue
        line = proc.stdout.readline()
        if line == "":
            raise DriverError(f"app-server exited before terminal, rc={proc.poll()}")
        try:
            value = json.loads(line)
        except json.JSONDecodeError:
            continue
        if isinstance(value, dict):
            return value
    raise DriverError("app-server event deadline exceeded")


def wait_response(proc: subprocess.Popen[str], request_id: int, deadline: float) -> dict[str, Any]:
    while True:
        message = next_message(proc, deadline)
        if message.get("id") != request_id:
            continue
        if "error" in message:
            raise DriverError(f"request {request_id} failed: {canonical(message['error']).decode()}")
        result = message.get("result")
        if not isinstance(result, dict):
            raise DriverError(f"request {request_id} returned non-object result")
        return result


def render(slot: str, cell: str, execution_root: Path) -> tuple[str, dict[str, Any]]:
    run = subprocess.run(
        [sys.executable, "-B", str(HARNESS), "render", "--slot", slot, "--cell", cell,
         "--execution-root", str(execution_root)],
        cwd=REPO, env={**os.environ, "PYTHONDONTWRITEBYTECODE": "1"},
        stdout=subprocess.PIPE, stderr=subprocess.PIPE, check=False,
    )
    if run.returncode != 0:
        raise DriverError(f"frozen render failed rc={run.returncode}: {run.stderr.decode(errors='replace').strip()}")
    storage = run.stdout
    if not storage.endswith(b"\n") or storage.endswith(b"\n\n"):
        raise DriverError("frozen renderer must have exactly one terminal storage LF")
    payload = storage[:-1]
    try:
        text = payload.decode("utf-8")
    except UnicodeDecodeError as exc:
        raise DriverError("frozen renderer output is not UTF-8") from exc
    return text, {
        "render_storage_sha256": hashlib.sha256(storage).hexdigest(),
        "render_storage_bytes": len(storage),
        "provider_visible_payload_sha256": hashlib.sha256(payload).hexdigest(),
        "provider_visible_payload_bytes": len(payload),
    }


def verify_admission(run_id: str, slot: str, cell: str, execution_root: Path) -> dict[str, Any]:
    run = subprocess.run(
        [sys.executable,"-B",str(VERIFIER),"--execution-root",str(execution_root),"admit","--slot",slot,"--cell",cell],
        cwd=REPO,env={**os.environ,"PYTHONDONTWRITEBYTECODE":"1"},stdout=subprocess.PIPE,stderr=subprocess.PIPE,check=False,
    )
    if run.returncode != 0 or not run.stdout.endswith(b"\n") or run.stdout.endswith(b"\n\n"):
        raise DriverError(f"closed-world admission failed rc={run.returncode}: {run.stdout.decode(errors='replace').strip()} {run.stderr.decode(errors='replace').strip()}")
    try: value=json.loads(run.stdout[:-1].decode("utf-8"))
    except (UnicodeDecodeError,json.JSONDecodeError) as exc: raise DriverError("closed-world admission receipt is invalid JSON") from exc
    if not isinstance(value,dict) or value.get("schema_id")!="pw-r8-cell-admission-v2" or value.get("candidate_id")!=CANDIDATE_ID or value.get("run_id")!=run_id or value.get("slot")!=slot or value.get("cell")!=cell or value.get("status")!="ADMIT_ONE_FRESH_FIRST_ATTEMPT":
        raise DriverError("closed-world admission identity/status mismatch")
    return value


def session_path(thread_id: str) -> Path:
    matches = list(Path("/home/sittingmongoose/.codex/sessions").rglob(f"*{thread_id}.jsonl"))
    if len(matches) != 1:
        raise DriverError(f"expected one rollout for {thread_id}, found {len(matches)}")
    return matches[0]


def wait_terminal(proc: subprocess.Popen[str], thread_id: str, turn_id: str, deadline: float) -> None:
    assert proc.stdout is not None
    while time.monotonic() < deadline:
        while select.select([proc.stdout], [], [], 0.0)[0]:
            if proc.stdout.readline() == "":
                break
        matches = list(Path("/home/sittingmongoose/.codex/sessions").rglob(f"*{thread_id}.jsonl"))
        if len(matches) == 1:
            try:
                rows = [json.loads(line) for line in matches[0].read_bytes().splitlines()]
            except (OSError, json.JSONDecodeError):
                rows = []
            if any(row.get("type") == "event_msg" and row.get("payload", {}).get("type") == "task_complete" and row["payload"].get("turn_id") == turn_id for row in rows):
                return
        time.sleep(0.05)
    raise DriverError("rollout task_complete deadline exceeded")


def reopen(thread_id: str, turn_id: str, wrapper: str, model: str, effort: str) -> dict[str, Any]:
    path = session_path(thread_id)
    storage = path.read_bytes()
    try:
        rows = [json.loads(line) for line in storage.splitlines()]
    except json.JSONDecodeError as exc:
        raise DriverError("rollout JSONL is not parseable") from exc
    metas = [r["payload"] for r in rows if r.get("type") == "session_meta"]
    turns = [r["payload"] for r in rows if r.get("type") == "turn_context" and r.get("payload", {}).get("turn_id") == turn_id]
    tasks = [r["payload"] for r in rows if r.get("type") == "event_msg" and r.get("payload", {}).get("type") == "task_complete" and r["payload"].get("turn_id") == turn_id]
    subject_inputs = [r["payload"] for r in rows if r.get("type") == "response_item" and r.get("payload", {}).get("type") == "message" and r["payload"].get("role") == "user" and r["payload"].get("content") and r["payload"]["content"][0].get("text", "").startswith("<codex_delegation>")]
    if not (len(metas) == len(turns) == len(tasks) == len(subject_inputs) == 1):
        raise DriverError("rollout identity/capture cardinality is uncertain")
    meta, turn, task = metas[0], turns[0], tasks[0]
    if subject_inputs[0]["content"][0].get("text") != wrapper:
        raise DriverError("subject input wrapper drift")
    if meta.get("model_provider") != "openai" or turn.get("model") != model or turn.get("effort") != effort:
        raise DriverError("provider or requested route identity drift")
    finals = [r["payload"] for r in rows if r.get("type") == "response_item" and r.get("payload", {}).get("type") == "message" and r["payload"].get("role") == "assistant" and r["payload"].get("phase") == "final_answer"]
    prohibited = [r["payload"] for r in rows if r.get("type") == "response_item" and r.get("payload", {}).get("type") in PROHIBITED_ITEM_TYPES]
    final_bytes = canonical(finals)
    prohibited_bytes = canonical(prohibited)
    single_text: str | None = None
    if len(finals) == 1:
        content = finals[0].get("content")
        if isinstance(content, list) and len(content) == 1 and isinstance(content[0], dict) and isinstance(content[0].get("text"), str):
            single_text = content[0]["text"]
    text_bytes = None if single_text is None else single_text.encode("utf-8")
    observations: list[str] = []
    if len(finals) != 1:
        observations.append("assistant_final_message_count_not_one")
    elif not isinstance(finals[0].get("content"), list):
        observations.append("assistant_final_content_not_array")
    elif len(finals[0]["content"]) != 1:
        observations.append("assistant_final_content_item_count_not_one")
    elif not isinstance(finals[0]["content"][0], dict) or not isinstance(finals[0]["content"][0].get("text"), str):
        observations.append("assistant_final_content_item_not_text")
    return {
        "rollout_path": str(path),
        "rollout_storage_sha256": hashlib.sha256(storage).hexdigest(),
        "rollout_storage_bytes": len(storage),
        "model_provider": meta["model_provider"],
        "turn_context_model": turn["model"],
        "turn_context_effort": turn["effort"],
        "turn_id": task["turn_id"],
        "started_at_epoch_seconds": task["started_at"],
        "completed_at_epoch_seconds": task["completed_at"],
        "duration_ms": task["duration_ms"],
        "assistant_final_messages": finals,
        "assistant_final_messages_sha256": digest(final_bytes)["sha256"],
        "assistant_final_messages_bytes": digest(final_bytes)["bytes"],
        "single_text_output_utf8": single_text,
        "single_text_output_sha256": None if text_bytes is None else digest(text_bytes)["sha256"],
        "single_text_output_bytes": None if text_bytes is None else digest(text_bytes)["bytes"],
        "prohibited_activity_items": prohibited,
        "prohibited_activity_items_sha256": digest(prohibited_bytes)["sha256"],
        "prohibited_activity_items_bytes": digest(prohibited_bytes)["bytes"],
        "prohibited_activity_item_types": [x.get("type") for x in prohibited],
        "conformance_observations": observations,
    }


def stop(proc: subprocess.Popen[str] | None) -> None:
    if proc is None:
        return
    if proc.stdin is not None:
        try: proc.stdin.close()
        except OSError: pass
    try: proc.wait(timeout=15)
    except subprocess.TimeoutExpired:
        proc.terminate()
        try: proc.wait(timeout=15)
        except subprocess.TimeoutExpired:
            proc.kill(); proc.wait(timeout=15)


def execute(args: argparse.Namespace) -> dict[str, Any]:
    if not RUN_ID_RE.fullmatch(args.run_id):
        raise DriverError("invalid run-id")
    execution_root = Path(args.execution_root).resolve()
    successor = LANE.parent.resolve()
    if not execution_root.is_relative_to(successor):
        raise DriverError("execution-root must be beneath successor_20260813")
    model, effort = ROUTES[args.slot]
    args._phase = "frozen_render"
    prompt, identities = render(args.slot, args.cell, execution_root)
    args._identities = identities
    args._phase = "closed_world_admission"
    args._admission = verify_admission(args.run_id,args.slot,args.cell,execution_root)
    wrapper = f"<codex_delegation>\n  <source_thread_id>{WRAPPER_SOURCE_THREAD_ID}</source_thread_id>\n  <input>{prompt}</input>\n</codex_delegation>"
    proc: subprocess.Popen[str] | None = None
    thread_id: str | None = None
    turn_id: str | None = None
    try:
        args._phase = "app_server_start"
        proc = subprocess.Popen(["codex", "app-server", "--listen", "stdio://"], cwd=REPO, stdin=subprocess.PIPE, stdout=subprocess.PIPE, stderr=subprocess.STDOUT, text=True, bufsize=1, env={**os.environ, "PYTHONDONTWRITEBYTECODE": "1"})
        deadline = time.monotonic() + args.timeout_seconds
        args._phase = "initialize"
        send(proc, {"method":"initialize","id":1,"params":{"clientInfo":{"name":"codex_vscode","title":"Codex Desktop","version":"0.147.0"},"capabilities":{"experimentalApi":True}}})
        wait_response(proc, 1, deadline); send(proc, {"method":"initialized","params":{}})
        args._phase = "thread_start"
        send(proc, {"method":"thread/start","id":2,"params":{"model":model,"modelProvider":"openai","cwd":str(REPO),"approvalPolicy":"never","approvalsReviewer":"user","sandbox":"danger-full-access","personality":"friendly","ephemeral":False,"threadSource":"subagent","allowProviderModelFallback":False}})
        thread_id = wait_response(proc, 2, deadline)["thread"]["id"]; args._thread_id = thread_id
        args._phase = "thread_name"
        send(proc, {"method":"thread/name/set","id":3,"params":{"threadId":thread_id,"name":f"R8 C2 {args.run_id} {args.slot} {args.cell}"}}); wait_response(proc, 3, deadline)
        args._phase = "turn_start"; args._subject_call_started = True
        send(proc, {"method":"turn/start","id":4,"params":{"threadId":thread_id,"input":[{"type":"text","text":wrapper}],"cwd":str(REPO),"approvalPolicy":"never","approvalsReviewer":"user","model":model,"effort":effort,"personality":"friendly","collaborationMode":{"mode":"default","settings":{"model":model,"reasoning_effort":effort,"developer_instructions":None}}}})
        turn_id = wait_response(proc, 4, deadline)["turn"]["id"]; args._turn_id = turn_id
        args._phase = "subject_execution"; wait_terminal(proc, thread_id, turn_id, deadline)
    finally:
        stop(proc)
    args._phase = "rollout_reopen"
    assert thread_id is not None and turn_id is not None
    reopened = reopen(thread_id, turn_id, wrapper, model, effort)
    return {
        "schema_id":"pw-r8-direct-appserver-subject-receipt-v2","candidate_id":CANDIDATE_ID,"run_id":args.run_id,
        "slot":args.slot,"cell":args.cell,"execution_root":str(execution_root),"requested_model":model,"requested_thinking":effort,
        "provider_effective_model":None,"provider_effective_thinking":None,"host_id":"remote-ssh-discovered:pm-dev",
        "thread_id":thread_id,"turn_id":turn_id,"status":"completed","subject_call_started":True,
        "fresh_context":True,"first_attempt_subject_call":True,"retry_count":0,"best_of":False,"replacement_result":False,
        "admission":args._admission,
        **identities, **reopened,
        "identity_limitation":"Requested route, openai provider, turn-context model/effort, and pm-dev thread/turn are observable; a separate provider-effective serving snapshot is not exposed."
    }


def main() -> int:
    p=argparse.ArgumentParser(); p.add_argument("--run-id",required=True); p.add_argument("--execution-root",required=True)
    p.add_argument("--slot",choices=tuple(ROUTES),required=True); p.add_argument("--cell",required=True); p.add_argument("--timeout-seconds",type=float,default=600.0)
    args=p.parse_args()
    if args.timeout_seconds <= 0 or args.timeout_seconds > 3600: p.error("timeout must be in (0,3600]")
    args._phase="argument_validation"; args._subject_call_started=False; args._thread_id=None; args._turn_id=None; args._identities={}; args._admission=None
    try: receipt=execute(args); rc=0
    except Exception as exc:
        model,effort=ROUTES[args.slot]
        receipt={"schema_id":"pw-r8-direct-appserver-controller-invalid-v2","candidate_id":CANDIDATE_ID,"run_id":args.run_id,"slot":args.slot,"cell":args.cell,"execution_root":str(Path(args.execution_root).resolve()),"requested_model":model,"requested_thinking":effort,"status":"controller_invalid","phase":args._phase,"subject_call_started":args._subject_call_started,"thread_id":args._thread_id,"turn_id":args._turn_id,"admission":args._admission,**args._identities,"error_type":type(exc).__name__,"error":str(exc),"empirical_credit":False,"driver_authorizes_recreation":False}
        rc=2
    sys.stdout.buffer.write(canonical(receipt)+b"\n"); return rc


if __name__ == "__main__": raise SystemExit(main())
