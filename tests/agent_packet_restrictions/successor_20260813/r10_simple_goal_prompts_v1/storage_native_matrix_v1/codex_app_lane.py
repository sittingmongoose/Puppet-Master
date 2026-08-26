#!/usr/bin/env python3
import base64
import os
import re

UUID = re.compile(r"[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}\Z")
IDENTITY = ("pass_id", "route_id", "ordinal", "attempt_id", "nonce")

class LaneError(RuntimeError): pass

def require(value,message):
    if not value:
        raise LaneError(message)

def canonical_receipt(raw,P,tool,request):
    require(0 < len(raw) <= 4 * 1024 * 1024 and raw.endswith(b"\n"), "newline receipt")
    try:
        text = raw.decode("utf-8")
    except UnicodeDecodeError as exc:
        raise LaneError("receipt UTF-8") from exc
    value = P.strict_loads(text)
    require(isinstance(value, dict), "receipt object")
    require(raw == (P.canonical_json(value) + "\n").encode(), "canonical receipt")
    require(value.get("schema_id") == "pm.r10.storage_pipeline.codex_app_host_receipt.v1", "receipt schema")
    require(value.get("tool") == tool and value.get("request") == request, "tool/request")
    require(set(value) in ({"schema_id", "tool", "request", "result"}, {"schema_id", "tool", "request", "error"}), "result/error")
    if "error" in value:
        require(value["error"] not in (None, "", {}, []), "nonempty App error")
    return value

def create_request(row,prompt):
    return {"prompt": prompt, "target": {"type": "projectless", "directoryName": row["projectless_directory_name"]},
            "model": row["model"], "thinking": row["thinking"], "title": row["title"]}

def _create_result(value,row):
    require(isinstance(value, dict) and set(value) == {"threadId", "projectlessOutputDirectory", "hostId"}, "create shape")
    require(isinstance(value.get("threadId"), str) and UUID.fullmatch(value["threadId"]) is not None, "thread ID")
    require(isinstance(value.get("hostId"), str) and value["hostId"], "host ID")
    output = value.get("projectlessOutputDirectory")
    require(isinstance(output, str) and output and row["projectless_directory_name"] in output.replace("\\", "/").split("/"), "projectless output join")
    require(output.replace("\\", "/").rstrip("/").endswith("/outputs"), "outputs directory")
    return value

def wait_request(create,prior,timeout_ms):
    target = {"threadId": create["threadId"], "hostId": create["hostId"]}
    if prior:
        polls = prior[-1].get("result", {}).get("polls", [])
        if isinstance(polls, list) and polls and isinstance(polls[-1], dict) and isinstance(polls[-1].get("cursor"), str):
            target["afterCursor"] = polls[-1]["cursor"]
    return {"targets": [target], "timeoutMs": timeout_ms}

def wait_state(value,create):
    require(isinstance(value, dict) and set(value) == {"polls", "timedOut", "wake"}, "wait shape")
    require(isinstance(value["timedOut"], bool) and isinstance(value["polls"], list) and len(value["polls"]) == 1, "wait poll")
    poll = value["polls"][0]
    require(isinstance(poll, dict) and poll.get("schemaVersion") == 1, "poll schema")
    require(isinstance(poll.get("changed"), bool), "changed bool")
    require(isinstance(poll.get("revision"), int) and not isinstance(poll.get("revision"), bool) and poll["revision"] >= 0, "wait revision")
    require(isinstance(poll.get("cursor"), str) and poll["cursor"], "wait cursor")
    thread = poll.get("thread")
    require(isinstance(thread, dict) and thread.get("id") == create["threadId"] and thread.get("hostId") == create["hostId"], "wait thread")
    status, turn = thread.get("status"), poll.get("latestTurn")
    complete = isinstance(status, dict) and status.get("type") == "idle" and isinstance(turn, dict) and turn.get("status") == "completed" and turn.get("error") is None
    wake = value["wake"]
    require(wake is None or (isinstance(wake, dict) and wake.get("threadId") == create["threadId"] and wake.get("hostId") == create["hostId"]), "wait wake")
    return {"complete":complete and not value["timedOut"], "cursor":poll["cursor"], "revision":poll["revision"],
            "changed":poll["changed"], "timed_out":value["timedOut"]}

def validate_wait(value,create):
    return bool(wait_state(value, create)["complete"])

def read_request(create,contract):
    runtime = contract["runtime"]
    return {"threadId": create["threadId"], "hostId": create["hostId"], "includeOutputs": False,
            "maxOutputCharsPerItem": runtime["codex_read_max_output_chars_per_item"], "turnLimit": runtime["codex_read_turn_limit"]}

def item_text(item):
    if not isinstance(item, dict):
        return ""
    if isinstance(item.get("text"), str):
        return item["text"]
    return "".join(part.get("text", "") for part in item.get("content", []) if isinstance(part, dict) and isinstance(part.get("text"), str))

def validate_read(value,create,row,prompt,final,raw_turn_ids=None):
    require(isinstance(value, dict) and set(value) == {"schemaVersion", "thread", "page", "turns"} and value["schemaVersion"] == 1, "read shape")
    thread, page, turns = value["thread"], value["page"], value["turns"]
    require(isinstance(thread, dict) and thread.get("id") == create["threadId"] and thread.get("hostId") == create["hostId"], "read thread")
    require(thread.get("title") == row["title"] and isinstance(thread.get("status"), dict) and thread["status"].get("type") == "idle", "title/idle")
    if "cwd" in thread:
        require(isinstance(thread["cwd"], str) and row["projectless_directory_name"] in thread["cwd"].replace("\\", "/").split("/"), "cwd join")
    require(isinstance(page, dict) and page.get("order") == "newest_first" and page.get("hasMore") is False and page.get("nextCursor") is None, "read page")
    require(isinstance(turns, list) and turns and all(isinstance(turn, dict) and turn.get("status") == "completed" and turn.get("error") is None for turn in turns), "read turns")
    items = [item for turn in turns for item in turn.get("items", []) if isinstance(item, dict)]
    require([item_text(item) for item in items if item.get("type") == "userMessage"] == [prompt], "one user")
    answers = [item_text(item) for item in items if item.get("type") == "agentMessage"]
    require(answers and answers[-1] == final, "read final")
    if raw_turn_ids is not None:
        require([turn.get("id") for turn in turns] == list(reversed(raw_turn_ids)), "turn order")

def raw_projection(path,route,prompt,expected_session,directory,verify,launch,terminal):
    rows = verify.pipeline.load_jsonl(path)
    sessions = [r.get("payload") for r in rows if r.get("type") == "session_meta" and isinstance(r.get("payload"), dict)]
    require(len(sessions) == 1 and sessions[0].get("id", sessions[0].get("session_id")) == expected_session, "raw session")
    cwd = sessions[0].get("cwd")
    require(isinstance(cwd, str) and directory in cwd.replace("\\", "/").split("/"), "raw directory")
    exact_user = 0; ambient = 0; turn_ids = []
    for raw in rows:
        payload = raw.get("payload")
        if raw.get("type") == "turn_context" and isinstance(payload, dict):
            turn_id = payload.get("turn_id")
            require(isinstance(turn_id, str) and turn_id, "turn ID")
            if turn_id not in turn_ids: turn_ids.append(turn_id)
        if raw.get("type") == "response_item" and isinstance(payload, dict) and payload.get("type") == "message" and payload.get("role") == "user":
            text = verify.text_blocks(payload.get("content"))
            if text == prompt:
                exact_user += 1
            else:
                require(exact_user == 0 and ambient == 0 and text.startswith("<recommended_plugins>\n") and "</recommended_plugins>" in text and "<environment_context>" in text and text.endswith("</environment_context>"), "raw follow-up/additional user message")
                ambient += 1
        if raw.get("type") == "event_msg" and isinstance(payload, dict):
            item = payload.get("item")
            if isinstance(item, dict):
                kind = str(item.get("type", ""))
                require(not any(word in kind.lower() for word in ("tool", "call", "command", "mcp")), "event tool")
    require(exact_user == 1 and turn_ids, "raw denominator")
    observed = verify.verify_codex_raw(path.parent, route, launch, terminal)
    return {"session_id": observed, "external_prompt_count": 1, "ordinary_tool_calls": 0, "turn_ids":turn_ids}

def raw_request(row,create):
    return {"schema_id":"pm.r10.storage_pipeline.codex_raw_copy_request.v1", **{key:row[key] for key in IDENTITY},
            "threadId":create["threadId"], "hostId":create["hostId"], "requiredCopies":2,
            "sourceKind":"creating_host_persisted_session_jsonl"}

def raw_copy_receipt(raw,P,request,ordinal):
    require(0<len(raw)<=100*1024*1024 and raw.endswith(b"\n"),"raw receipt bound")
    try: value = P.strict_loads(raw.decode("utf-8"))
    except (UnicodeDecodeError, ValueError) as exc: raise LaneError("raw-copy receipt JSON") from exc
    require(isinstance(value,dict) and raw==(P.canonical_json(value)+"\n").encode(),"raw canonical")
    require(set(value)=={"schema_id","request","copyOrdinal","source","contentBase64"} and value.get("schema_id")=="pm.r10.storage_pipeline.codex_raw_copy_receipt.v1","raw shape")
    require(value.get("request")==request and value.get("copyOrdinal")==ordinal,"raw request/ordinal")
    source=value.get("source"); require(isinstance(source,dict) and set(source)=={"hostId","path","bytes","sha256","observedAtUtc"},"raw source shape")
    path=source.get("path"); require(source.get("hostId")==request["hostId"] and isinstance(path,str) and (path.startswith("/") or re.match(r"^[A-Za-z]:[\\/]",path)) and request["threadId"] in path and path.endswith(".jsonl") and "\x00" not in path and "\n" not in path,"raw source")
    try: content=base64.b64decode(value.get("contentBase64",""),validate=True)
    except (ValueError,TypeError) as exc: raise LaneError("raw-copy base64") from exc
    require(content and len(content)==source.get("bytes") and P.sha256_bytes(content)==source.get("sha256"),"raw bytes/hash")
    require(isinstance(source.get("observedAtUtc"),str) and source["observedAtUtc"].endswith("Z"),"raw UTC")
    return value,content

def file_record(path,d,P):
    require(path.is_file() and not path.is_symlink(), f"evidence file: {path.name}")
    return {"path": path.relative_to(d).as_posix(), "bytes": path.stat().st_size, "sha256": P.sha256_file(path)}

def write_terminal(d,row,route,P,*,status,final="",identity=None,failure=None,external_submissions=1):
    paths = sorted(path for path in d.iterdir() if path.is_file() and not path.is_symlink() and path.name != "terminal.json")
    terminal = {"schema_id":"pm.r10.storage_pipeline.terminal.v2", **{k:row[k] for k in IDENTITY},
                "surface":route["surface"], "model":route["model"], "thinking":route["thinking"], "status":status,
                "failure_code":failure, "goal_activation_observed":status == "PASS", "goal_complete_observed":status == "PASS",
                "final_assistant_text":final, "observed_non_goal_tool_calls":0 if status == "PASS" else None, "no_retry":True,
                "qualification_credit":0, "observed_identity":identity, "external_submission_count":external_submissions,
                "finished_at_utc":__import__("datetime").datetime.now(__import__("datetime").timezone.utc).isoformat(timespec="milliseconds").replace("+00:00", "Z"),
                "evidence":[file_record(path, d, P) for path in paths]}
    P.atomic_write(d / "terminal.json", P.pretty_json(terminal)); return terminal

def append_host_event(d,tool,request,receipt_path,P):
    path = d / "host_events.jsonl"; current = P.load_jsonl(path) if path.exists() else []
    event = {"ordinal":len(current) + 1, "tool":tool, "request_sha256":P.sha256_bytes((P.canonical_json(request)+"\n").encode()),
             "receipt_path":receipt_path.name, "receipt_bytes":receipt_path.stat().st_size, "receipt_sha256":P.sha256_file(receipt_path)}
    P.atomic_write(path, P.jsonl_bytes([*current, event]))

def verify_host_events(d,P):
    events = P.load_jsonl(d / "host_events.jsonl")
    tools = [event.get("tool") for event in events]
    require(tools and tools[0] == "create_thread" and tools[-1] == "read_thread", "host endpoints")
    require(tools.count("create_thread") == tools.count("read_thread") == 1, "denominator")
    require(all(tool == "wait_threads" for tool in tools[1:-1]), "host allowlist")
    require([event.get("ordinal") for event in events] == list(range(1, len(events) + 1)), "event order")

def verify_direct_evidence(d,row,prompt,contract,P,verify,launch,terminal):
    reservation=P.load_json(d/"reservation.json")
    require(set(reservation)=={"schema_id",*IDENTITY,"reserved_at_utc","retry_count","qualification_credit"} and reservation.get("schema_id")=="pm.r10.storage_pipeline.reservation.v2", "reservation shape")
    require(all(reservation.get(key)==row[key] for key in IDENTITY) and reservation.get("retry_count")==reservation.get("qualification_credit")==0, "reservation identity")
    require(verify.parse_utc(reservation["reserved_at_utc"])<=verify.parse_utc(launch["started_at_utc"]), "reservation time")
    create_request_expected=create_request(row,prompt)
    require(P.load_json(d/"create_request.json")==create_request_expected==launch.get("create_request"), "create request")
    create_receipt=canonical_receipt((d/"create_receipt.raw.json").read_bytes(),P,"create_thread",create_request_expected)
    require("result" in create_receipt,"create success"); create=_create_result(create_receipt["result"],row)
    events=P.load_jsonl(d/"host_events.jsonl"); verify_host_events(d,P); wait_count=len(events)-2
    require(1<=wait_count<=contract["runtime"]["codex_wait_max_receipts"], "wait count")
    requests=[create_request_expected]; paths=[d/"create_receipt.raw.json"]; states=[]; prior=[]
    for number in range(1,wait_count+1):
        request=wait_request(create,prior,contract["runtime"]["codex_wait_timeout_ms"]); path=d/f"wait_{number:03d}.raw.json"
        receipt=canonical_receipt(path.read_bytes(),P,"wait_threads",request); require("result" in receipt,"wait success")
        state=wait_state(receipt["result"],create); requests.append(request); paths.append(path); states.append(state); prior.append(receipt)
    require(all(not state["complete"] for state in states[:-1]) and states[-1]["complete"], "final wait")
    require(all(right["revision"]>=left["revision"] for left,right in zip(states,states[1:])), "wait revisions")
    read_expected=read_request(create,contract); read_path=d/"read_receipt.raw.json"; read_receipt=canonical_receipt(read_path.read_bytes(),P,"read_thread",read_expected)
    require("result" in read_receipt,"read success"); requests.append(read_expected); paths.append(read_path)
    for ordinal,(event,tool,request,path) in enumerate(zip(events,["create_thread",*["wait_threads"]*wait_count,"read_thread"],requests,paths,strict=True),1):
        expected={"ordinal":ordinal,"tool":tool,"request_sha256":P.sha256_bytes((P.canonical_json(request)+"\n").encode()),"receipt_path":path.name,"receipt_bytes":path.stat().st_size,"receipt_sha256":P.sha256_file(path)}
        require(event==expected and path.is_file() and not path.is_symlink(), "event receipt")
    raw_expected=raw_request(row,create); require(P.load_json(d/"raw_copy_request.json")==raw_expected, "raw request")
    copies=[raw_copy_receipt((d/f"raw_copy_{number}.receipt.json").read_bytes(),P,raw_expected,number) for number in (1,2)]
    stable_keys=("hostId","path","bytes","sha256"); require(all(copies[0][0]["source"][key]==copies[1][0]["source"][key] for key in stable_keys),"raw identity")
    first_time=verify.parse_utc(copies[0][0]["source"]["observedAtUtc"]); second_time=verify.parse_utc(copies[1][0]["source"]["observedAtUtc"])
    require(verify.parse_utc(launch["started_at_utc"])<=first_time<second_time<=verify.parse_utc(terminal["finished_at_utc"]),"raw chronology")
    first=(d/"rollout.read1.jsonl").read_bytes(); second=(d/"rollout.read2.jsonl").read_bytes(); authoritative=(d/"rollout.raw.jsonl").read_bytes()
    require(first==copies[0][1]==second==copies[1][1]==authoritative,"raw copies join")
    projection=raw_projection(d/"rollout.raw.jsonl",row,prompt,create["threadId"],row["projectless_directory_name"],verify,launch,terminal)
    validate_read(read_receipt["result"],create,row,prompt,terminal["final_assistant_text"],projection["turn_ids"])
    expected_names={"reservation.json","create_request.json","launch.json","create_receipt.raw.json","host_events.jsonl","read_receipt.raw.json","raw_copy_request.json","raw_copy_1.receipt.json","raw_copy_2.receipt.json","rollout.read1.jsonl","rollout.read2.jsonl","rollout.raw.jsonl","terminal.json",*[f"wait_{number:03d}.raw.json" for number in range(1,wait_count+1)]}
    require({path.name for path in d.iterdir()}==expected_names and all(path.is_file() and not path.is_symlink() for path in d.iterdir()),"App file roster")
    return projection

def reserve(d,row,prompt,P,utc_now):
    require(not os.path.lexists(d), "row consumed"); d.parent.mkdir(parents=True, exist_ok=True); d.mkdir()
    reservation = {"schema_id":"pm.r10.storage_pipeline.reservation.v2", **{k:row[k] for k in IDENTITY}, "reserved_at_utc":utc_now(), "retry_count":0, "qualification_credit":0}
    request = create_request(row, prompt)
    launch = {"schema_id":"pm.r10.storage_pipeline.launch.v2", **{k:row[k] for k in IDENTITY}, "surface":row["surface"], "model":row["model"],
              "thinking":row["thinking"], "prompt_utf8_bytes":len(prompt.encode()), "prompt_sha256":P.sha256_bytes(prompt.encode()),
              "external_prompt_count":1, "started_at_utc":utc_now(), "projectless_directory_name":row["projectless_directory_name"],
              "title":row["title"], "omp_preflight_bytes":None, "omp_preflight_sha256":None, "create_request":request}
    P.atomic_write(d / "reservation.json", P.pretty_json(reservation))
    P.atomic_write(d / "create_request.json", P.pretty_json(request))
    P.atomic_write(d / "launch.json", P.pretty_json(launch)); return launch
