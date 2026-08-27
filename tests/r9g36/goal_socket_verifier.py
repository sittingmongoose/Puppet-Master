#!/usr/bin/env python3
import hashlib
import importlib.util
import json
import math
import os
import re
import stat
import sys

sys.dont_write_bytecode = True
SELF = "/mnt/Cursor/PuppetMaster/tests/r9g36/goal_socket_verifier.py"
ATTESTOR = "/mnt/Cursor/PuppetMaster/tests/r9g36/goal_db_attestor.py"
ATTESTOR_BYTES = 9118
ATTESTOR_SHA256 = "274b818da6ae51fb7c01608c4b3aca2e0d3f69a74bfb9815db816aa57b38bcc6"
SKILL = "/mnt/Cursor/PuppetMaster/.agents/skills/r9-goal-atom-bootstrap/SKILL.md"
SKILL_BYTES = 1327
SKILL_SHA256 = "7fba245c05b7fb104054ea18af4d0a2fd90d4f28f295c94f7c12b699b343d8b4"
HEX = re.compile(r"^[0-9a-f]{64}$")
UUID = re.compile(r"^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$")
TOKEN = re.compile(r"^[A-Za-z0-9._:-]{1,48}$")
DIRECT = re.compile(r"Chunk ID: [0-9a-f]+\nWall time: (?:0|[1-9][0-9]*)(?:\.[0-9]+)? seconds\nProcess exited with code (-?[0-9]+)\nOriginal token count: [0-9]+\nOutput:\n([\s\S]*)")
ROSTER = {
    "alpha": {"model": "gpt-5.4-mini", "reasoning_effort": "xhigh"},
    "bravo": {"model": "gpt-5.4-mini", "reasoning_effort": "medium"},
    "charlie": {"model": "gpt-5.6-luna", "reasoning_effort": "medium"},
}


class Invalid(Exception):
    pass


def require(value, mismatch):
    if not value:
        raise Invalid(mismatch)


def pairs(items):
    value = {}
    for key, item in items:
        require(key not in value, "duplicate-key:" + key)
        value[key] = item
    return value


def finite(value):
    if isinstance(value, float): return math.isfinite(value)
    if isinstance(value, list): return all(finite(item) for item in value)
    if isinstance(value, dict): return all(isinstance(key, str) and finite(item) for key, item in value.items())
    return True


def parse(raw):
    value = json.loads(raw.decode("utf-8"), object_pairs_hook=pairs, parse_constant=lambda token: (_ for _ in ()).throw(Invalid("nonfinite:" + token)))
    require(finite(value), "finite")
    return value


def canonical(value):
    return json.dumps(value, ensure_ascii=False, allow_nan=False, separators=(",", ":"), sort_keys=True).encode("utf-8") + b"\n"


def sha(raw): return hashlib.sha256(raw).hexdigest()


def read_exact(path, mode, size=None, digest=None, cap=None):
    before = os.lstat(path)
    require(stat.S_ISREG(before.st_mode) and not stat.S_ISLNK(before.st_mode), "kind:" + path)
    require(stat.S_IMODE(before.st_mode) == mode and before.st_uid == os.getuid() and before.st_nlink == 1, "custody:" + path)
    require(size is None or before.st_size == size, "size:" + path)
    require(cap is None or before.st_size <= cap, "cap:" + path)
    fd = os.open(path, os.O_RDONLY | os.O_NOFOLLOW | os.O_CLOEXEC)
    try:
        raw = b""
        while len(raw) < before.st_size:
            part = os.read(fd, before.st_size - len(raw)); require(bool(part), "short:" + path); raw += part
        require(os.read(fd, 1) == b"", "trailing:" + path)
        after = os.fstat(fd)
    finally: os.close(fd)
    current = os.lstat(path)
    require((before.st_dev, before.st_ino, before.st_size) == (after.st_dev, after.st_ino, after.st_size) == (current.st_dev, current.st_ino, current.st_size), "race:" + path)
    require(digest is None or sha(raw) == digest, "digest:" + path)
    return raw


def read_json(path, mode=0o444, cap=1000000):
    raw = read_exact(path, mode, cap=cap); value = parse(raw); require(raw == canonical(value), "canonical:" + path); return raw, value


def directory(path):
    info = os.lstat(path); require(stat.S_ISDIR(info.st_mode) and not stat.S_ISLNK(info.st_mode) and stat.S_IMODE(info.st_mode) == 0o700 and info.st_uid == os.getuid(), "directory:" + path)


def binding(path):
    raw = read_exact(path, 0o644, cap=500000); return {"bytes": len(raw), "mode": "0644", "path": path, "sha256": sha(raw)}


def validate_binding(item):
    require(set(item) == {"bytes", "mode", "path", "sha256"} and item["mode"] == "0644" and os.path.isabs(item["path"]) and HEX.fullmatch(item["sha256"] or ""), "binding")
    read_exact(item["path"], 0o644, item["bytes"], item["sha256"])


def load_plan(path):
    require(os.path.isabs(path) and os.path.realpath(path) == path and path.startswith("/mnt/Cursor/PuppetMaster/tests/r9g36/"), "plan-path")
    raw = read_exact(path, 0o444, cap=1000000); plan = parse(raw); require(raw == canonical(plan), "plan-canonical")
    require(set(plan) == {"authority", "bindings", "experiment", "failure_contract", "qualification", "rows", "schema_id", "status"}, "plan-shape")
    require(plan["schema_id"] == "pw-r9-codex-native-goal-db-socket-canary-plan-v1" and plan["status"] == "FROZEN_ZERO_CREDIT_NO_MATRIX_OR_QUALIFICATION_AUTHORITY", "plan-id")
    require(plan["authority"] == {"canary_launch": False, "matrix_launch": False, "qualification": False, "qualification_credit": 0}, "authority")
    require(plan["failure_contract"] == {"best_of": 0, "relaunch": 0, "replacement": 0, "resend": 0, "retry": 0, "reuse": 0}, "failure")
    require(plan["qualification"] == {"clean_full_matrix_streak": 0, "credit": "0/2", "required_consecutive_clean_full_matrices": 2}, "qualification")
    require(set(plan["bindings"]) == {"attestor", "broker", "controller", "offline_verifier", "skill"}, "bindings")
    for item in plan["bindings"].values(): validate_binding(item)
    require(plan["bindings"]["attestor"] == binding(ATTESTOR) and plan["bindings"]["offline_verifier"] == binding(SELF) and plan["bindings"]["skill"] == binding(SKILL), "own-bindings")
    exp = plan["experiment"]
    require(set(exp) == {"id", "parent_goal_thread_id", "root", "socket_name", "stop_at_first_nonpass"} and UUID.fullmatch(exp["parent_goal_thread_id"] or "") and exp["socket_name"] == "goal_subject.sock" and exp["stop_at_first_nonpass"] is True, "experiment")
    require(os.path.isabs(exp["root"]) and os.path.realpath(exp["root"]) == exp["root"] and exp["root"].startswith("/mnt/Cursor/PuppetMaster/tests/r9g36/"), "root")
    require(isinstance(plan["rows"], list) and len(plan["rows"]) == 3, "rows")
    for index, row in enumerate(plan["rows"]):
        route = ("alpha", "bravo", "charlie")[index]
        require(set(row) == {"expected_result", "goal_objective", "model", "reasoning_effort", "route", "subject", "task_name", "task_path"} and row["route"] == route, "row-shape")
        require({"model": row["model"], "reasoning_effort": row["reasoning_effort"]} == ROSTER[route], "roster")
        require(row["task_path"] == "/root/" + row["task_name"] and re.fullmatch(r"r9_gdb6_[0-9a-f]{64}", row["task_name"] or ""), "task")
        for key in ("subject", "expected_result"):
            item = row[key]; require(set(item) == {"bytes", "sha256"} and type(item["bytes"]) is int and item["bytes"] > 0 and HEX.fullmatch(item["sha256"] or ""), "commitment")
    return raw, plan


def load_attestor():
    read_exact(ATTESTOR, 0o644, ATTESTOR_BYTES, ATTESTOR_SHA256)
    spec = importlib.util.spec_from_file_location("r9g36_verify_attestor", ATTESTOR); require(spec is not None and spec.loader is not None, "attestor-spec")
    module = importlib.util.module_from_spec(spec); spec.loader.exec_module(module)
    require(module.__all__ == ("Invalid", "active", "canonical", "parse", "terminal_absent"), "attestor-api")
    return module


def body(payload):
    output = payload.get("output")
    if payload.get("type") == "custom_tool_call_output":
        require(isinstance(output, list) and len(output) == 2 and all(isinstance(item, dict) and set(item) == {"text", "type"} and item["type"] == "input_text" for item in output), "wrapped-output")
        return output[1]["text"]
    require(payload.get("type") == "function_call_output" and isinstance(output, str), "direct-output")
    match = DIRECT.fullmatch(output)
    if match:
        require(int(match.group(1)) == 0, "exec-code"); return match.group(2)
    return output


def trace_result(raw, row, active, subject):
    require(raw.endswith(b"\n") and b"\r" not in raw, "trace-framing")
    events = []
    for index, line in enumerate(raw.splitlines(keepends=True)):
        require(line.endswith(b"\n") and line.count(b"\n") == 1, "trace-line:" + str(index)); event = parse(line); require(set(event) == {"payload", "timestamp", "type"}, "trace-event"); events.append(event)
    metas = [e["payload"] for e in events if e["type"] == "session_meta"]
    thread_id = active["attestation"]["goal"]["thread_id"]
    require(len(metas) == 1 and metas[0].get("id") == thread_id and metas[0].get("agent_path") == row["task_path"], "session")
    dc = [(i,e["payload"]) for i,e in enumerate(events) if e["type"] == "response_item" and e["payload"].get("type") == "function_call"]
    do = [(i,e["payload"]) for i,e in enumerate(events) if e["type"] == "response_item" and e["payload"].get("type") == "function_call_output"]
    wc = [(i,e["payload"]) for i,e in enumerate(events) if e["type"] == "response_item" and e["payload"].get("type") == "custom_tool_call"]
    wo = [(i,e["payload"]) for i,e in enumerate(events) if e["type"] == "response_item" and e["payload"].get("type") == "custom_tool_call_output"]
    require(not (dc and wc) and not (do and wo), "mixed")
    calls, outputs = (dc,do) if dc else (wc,wo); require(len(calls) == 4 and len(outputs) == 4, "tool-count")
    if dc: require([item["name"] for _,item in calls] == ["exec_command","create_goal","exec_command","update_goal"], "direct-sequence")
    else:
        for _,item in calls:
            source=item.get("input"); require(isinstance(source,str) and source.count("tools.")==1, "wrapped-single-tool"); require(not any(token in source for token in ("tools[","ALL_TOOLS","globalThis","eval(","Function(","store(","load(","notify(")), "wrapped-hidden")
    by={item["call_id"]:(index,body(item)) for index,item in outputs}; bodies=[]
    for ci,call in calls:
        require(call["call_id"] in by and ci < by[call["call_id"]][0], "pair"); bodies.append(by[call["call_id"]])
    require(bodies[0][1] == read_exact(SKILL,0o644,SKILL_BYTES,SKILL_SHA256).decode(), "skill")
    ag=parse(bodies[1][1].encode())["goal"]; cg=parse(bodies[3][1].encode())["goal"]
    require(ag["threadId"]==thread_id and ag["objective"]==row["goal_objective"] and ag["status"]=="active", "active-output")
    require(cg["threadId"]==thread_id and cg["objective"]==row["goal_objective"] and cg["status"]=="complete", "complete-output")
    require(bodies[2][1].encode()==subject, "subject-output")
    finals=[e["payload"] for e in events if e["type"]=="response_item" and e["payload"].get("type")=="message" and e["payload"].get("phase")=="final_answer"]
    require(len(finals)==1 and len(finals[0].get("content",[]))==1 and finals[0]["content"][0].get("type")=="output_text", "final")
    result=finals[0]["content"][0].get("text"); require(isinstance(result,str) and TOKEN.fullmatch(result), "token")
    completes=[(i,e["payload"]) for i,e in enumerate(events) if e["type"]=="event_msg" and e["payload"].get("type")=="task_complete"]
    require(len(completes)==1 and completes[0][0]==len(events)-1 and completes[0][1].get("last_agent_message")==result, "task-complete")
    return result.encode()


def inventory(root):
    rows=[]
    for current,dirs,files in os.walk(root,topdown=True,followlinks=False):
        dirs.sort(); files.sort(); directory(current)
        rows.append({"kind":"d","path":os.path.relpath(current,root)})
        for name in files:
            path=os.path.join(current,name); info=os.lstat(path); raw=read_exact(path,stat.S_IMODE(info.st_mode),cap=2500000)
            rows.append({"bytes":len(raw),"kind":"f","mode":stat.S_IMODE(info.st_mode),"path":os.path.relpath(path,root),"sha256":sha(raw)})
    return sha(canonical(rows))


def verify(plan):
    root=plan["experiment"]["root"]; directory(root); before=inventory(root)
    require(not os.path.lexists(os.path.join(root,plan["experiment"]["socket_name"])), "socket-present")
    require(set(os.listdir(root))=={"accounting.json","broker_ready.json","broker_terminal.json","canary_terminal.json","prepared.json","rows"}, "root-inventory")
    _,prepared=read_json(os.path.join(root,"prepared.json")); require(prepared["status"]=="PASS_PREPARED_WITH_ZERO_SUBJECT_BYTES_ON_DISK", "prepared")
    _,broker_terminal=read_json(os.path.join(root,"broker_terminal.json")); require(broker_terminal["delivered_routes"]==["alpha","bravo","charlie"], "broker")
    attestor=load_attestor(); seen_threads=set(); results={}
    for row in plan["rows"]:
        workdir=os.path.join(root,"rows",row["route"]); directory(workdir)
        require(set(os.listdir(workdir))=={"active_goal.json","launch_intent.json","predeclaration.json","result.txt","settlement.json","spawn_prompt.txt","subject.txt","terminal_goal.json","terminal_trace.jsonl","wait.py"}, "row-inventory")
        _,active=read_json(os.path.join(workdir,"active_goal.json"),cap=32768); proof=active["attestation"]; thread_id=proof["goal"]["thread_id"]
        require(thread_id not in seen_threads and proof["goal"]["status"]=="active" and proof["goal"]["objective"]==row["goal_objective"] and active["route"]==row["route"], "active")
        seen_threads.add(thread_id)
        subject=read_exact(os.path.join(workdir,"subject.txt"),0o444,row["subject"]["bytes"],row["subject"]["sha256"],384)
        trace=read_exact(os.path.join(workdir,"terminal_trace.jsonl"),0o444,cap=2000000); result=trace_result(trace,row,active,subject)
        require(len(result)==row["expected_result"]["bytes"] and sha(result)==row["expected_result"]["sha256"], "expected")
        require(read_exact(os.path.join(workdir,"result.txt"),0o444,len(result),sha(result),48)==result, "result-copy")
        terminal=attestor.terminal_absent(thread_id,plan["experiment"]["parent_goal_thread_id"],row["task_path"],row["model"],row["reasoning_effort"])
        _,terminal_file=read_json(os.path.join(workdir,"terminal_goal.json"),cap=32768); require(terminal_file["database_terminal"]==terminal and terminal_file["status"]=="PASS_GOAL_ACTIVE_THROUGH_SUBJECT_AND_COMPLETE", "terminal")
        _,settlement=read_json(os.path.join(workdir,"settlement.json")); require(settlement["goal_thread_id"]==thread_id and settlement["status"]=="PASS_PROTOCOL_ZERO_CREDIT", "settlement")
        results[row["route"]]=result.decode()
    _,canary=read_json(os.path.join(root,"canary_terminal.json")); require(canary=={"experiment_id":plan["experiment"]["id"],"qualification_credit":0,"results":results,"schema_id":"pw-r9-codex-native-goal-db-socket-canary-terminal-v1","status":"PASS_CANARY_ZERO_CREDIT"}, "canary")
    _,accounting=read_json(os.path.join(root,"accounting.json")); require(accounting=={"clean_full_matrix_streak":0,"fresh_goal_count":3,"full_matrix_count":0,"qualification_credit":0,"qualification_score":"0/2","required_consecutive_clean_full_matrices":2,"schema_id":"pw-r9-codex-native-goal-db-socket-canary-accounting-v1","status":"SEALED_CANARY_ZERO_CREDIT"}, "accounting")
    accounting_time=os.lstat(os.path.join(root,"accounting.json")).st_mtime_ns
    require(all(os.lstat(os.path.join(cur,name)).st_mtime_ns<=accounting_time for cur,_,files in os.walk(root) for name in files), "accounting-last")
    after=inventory(root); require(before==after, "workspace-writes")
    return {"first_mismatch":None,"fresh_goal_count":3,"inventory_sha256":after,"qualification_credit":0,"status":"PASS_CANARY_ZERO_CREDIT","workspace_writes":0}


def main(argv):
    require(len(argv)==3 and argv[1] in {"--check","--verify"}, "argv"); _,plan=load_plan(os.path.realpath(argv[2]))
    if argv[1]=="--check":
        require(not os.path.lexists(plan["experiment"]["root"]), "root-exists"); result={"first_mismatch":None,"qualification_credit":0,"status":"PASS_DATA_ONLY_ZERO_WRITES","workspace_writes":0}
    else: result=verify(plan)
    sys.stdout.buffer.write(canonical(result)); return 0


if __name__=="__main__":
    try: raise SystemExit(main(sys.argv))
    except (Invalid,OSError,UnicodeError,ValueError,KeyError,TypeError,json.JSONDecodeError) as error:
        sys.stdout.buffer.write(canonical({"first_mismatch":str(error),"qualification_credit":0,"status":"FAIL","workspace_writes":0})); raise SystemExit(1)
