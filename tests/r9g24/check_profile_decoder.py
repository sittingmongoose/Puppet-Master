#!/usr/bin/env python3
import copy
import hashlib
import importlib.util
import json
import os
import stat
import sys

sys.dont_write_bytecode = True
DECODER = "/mnt/Cursor/PuppetMaster/tests/r9g24/profile_decoder.py"
DECODER_BYTES = 14662
DECODER_SHA256 = "d0b112bd6b36061204aa79a505df40a48dfa8b63f69756251c2500ea7893e15c"
SKILL = "/mnt/Cursor/PuppetMaster/.agents/skills/r9-goal-atom-bootstrap/SKILL.md"
SKILL_BYTES = 1327
SKILL_SHA256 = "7fba245c05b7fb104054ea18af4d0a2fd90d4f28f295c94f7c12b699b343d8b4"
DIRECT_TRACE = "/home/sittingmongoose/.codex/sessions/2026/08/24/rollout-2026-08-24T00-00-28-01a03111-8a1f-7161-a4f2-aded20423d56.jsonl"
DIRECT_BYTES = 219531
DIRECT_SHA256 = "4f026a8233d21f97bff6567f4067807cd92bdce7a20bb23446196a4e692aa32e"
WRAPPED_TRACE = "/home/sittingmongoose/.codex/sessions/2026/08/24/rollout-2026-08-24T06-16-41-01a03269-fcdf-7d41-bb4b-f03e11b229d1.jsonl"
WRAPPED_BYTES = 95773
WRAPPED_SHA256 = "e825abdb5dd77ad8112d6d802f9f5bb7a0cf1a61e31ef7c4f1ac7877544d2e2a"
THREAD = "11111111-1111-4111-8111-111111111111"
TURN = "22222222-2222-4222-8222-222222222222"
PARENT = "33333333-3333-4333-8333-333333333333"
TASK = "/root/r9_profile_fixture"
OBJECTIVE = "PROFILE|once"
WORKDIR = "/mnt/Cursor/PuppetMaster/tests/r9g24/fixture"
SUBJECT = b'{"q":"Return PASS","v":1}\n'


class Invalid(Exception):
    pass


def require(value, mismatch):
    if not value:
        raise Invalid(mismatch)


def sha(raw):
    return hashlib.sha256(raw).hexdigest()


def read(path, size, digest):
    info = os.lstat(path)
    require(stat.S_ISREG(info.st_mode) and not stat.S_ISLNK(info.st_mode) and info.st_size == size and stat.S_IMODE(info.st_mode) in {0o644, 0o664}, "custody:" + path)
    fd = os.open(path, os.O_RDONLY | os.O_NOFOLLOW | os.O_CLOEXEC)
    try:
        raw = b""
        while len(raw) < size:
            part = os.read(fd, size - len(raw)); require(bool(part), "short:" + path); raw += part
        require(os.read(fd, 1) == b"", "trailing:" + path)
    finally:
        os.close(fd)
    require(sha(raw) == digest, "sha:" + path)
    return raw


def load_decoder():
    read(DECODER, DECODER_BYTES, DECODER_SHA256)
    spec = importlib.util.spec_from_file_location("r9g24_checked_decoder", DECODER)
    require(spec is not None and spec.loader is not None, "decoder-spec")
    module = importlib.util.module_from_spec(spec); spec.loader.exec_module(module)
    require(module.__all__ == ("Invalid", "decode_events", "profile", "validate_active", "validate_terminal"), "decoder-api")
    return module


def canon(value):
    return json.dumps(value, ensure_ascii=False, allow_nan=False, sort_keys=True, separators=(",", ":"))


def envelope(payload):
    return {"payload": payload, "timestamp": "2026-08-24T00:00:00.000Z", "type": "session_meta" if payload.get("kind") == "session" else "event_msg" if payload.get("type") in {"task_started", "task_complete"} else "turn_context" if payload.get("kind") == "turn" else "response_item"}


def base():
    return [envelope({"agent_path":TASK,"id":THREAD,"kind":"session","parent_thread_id":PARENT,"source":{"subagent":{"thread_spawn":{"agent_path":TASK,"parent_thread_id":PARENT}}}}),envelope({"turn_id":TURN,"type":"task_started"}),envelope({"cwd":"/mnt/Cursor/PuppetMaster","effort":"medium","kind":"turn","model":"gpt-5.6-luna","turn_id":TURN})]


def goal(status):
    complete = status == "complete"
    return canon({"completionBudgetReport":"done" if complete else None,"goal":{"createdAt":1,"objective":OBJECTIVE,"status":status,"threadId":THREAD,"timeUsedSeconds":1 if complete else 0,"tokensUsed":7 if complete else 0,"updatedAt":2 if complete else 1},"remainingTokens":None})


def direct_call(number, name, arguments):
    return envelope({"arguments":canon(arguments),"call_id":"call"+str(number),"id":"fc"+str(number),"internal_chat_message_metadata_passthrough":{"turn_id":TURN},"name":name,"type":"function_call"})


def direct_output(number, body, command=False, code=0):
    if command:
        body = "Chunk ID: abc123\nWall time: 0.1 seconds\nProcess exited with code {}\nOriginal token count: 1\nOutput:\n".format(code) + body
    return envelope({"call_id":"call"+str(number),"id":"fco"+str(number),"internal_chat_message_metadata_passthrough":{"turn_id":TURN},"output":body,"type":"function_call_output"})


def js(tool, arguments):
    fields = []
    for key, value in arguments.items():
        fields.append(key + ":" + canon(value))
    suffix = ".output" if tool == "exec_command" else ""
    return "const r = await tools." + tool + "({" + ",".join(fields) + "}); text(r" + suffix + ");\n"


def wrapped_call(number, tool, arguments):
    return envelope({"call_id":"call"+str(number),"id":"cc"+str(number),"input":js(tool,arguments),"internal_chat_message_metadata_passthrough":{"turn_id":TURN},"name":"exec","status":"completed","type":"custom_tool_call"})


def wrapped_output(number, body):
    return envelope({"call_id":"call"+str(number),"id":"cco"+str(number),"internal_chat_message_metadata_passthrough":{"turn_id":TURN},"output":[{"text":"Script completed\nWall time 0.1 seconds\nOutput:\n","type":"input_text"},{"text":body,"type":"input_text"}],"type":"custom_tool_call_output"})


def raw(events):
    return b"".join((canon(event)+"\n").encode("utf-8") for event in events)


def fixtures(skill):
    skill_args={"cmd":"sed -n 1,240p "+SKILL,"workdir":"/mnt/Cursor/PuppetMaster","login":False,"yield_time_ms":10000,"max_output_tokens":12000}
    wait_args={"cmd":"python3 -B wait.py "+THREAD,"max_output_tokens":128,"workdir":WORKDIR,"yield_time_ms":30000}
    controls=[]
    for kind in ("direct","wrapped"):
        events=base()
        add_call=direct_call if kind=="direct" else wrapped_call
        add_output=direct_output if kind=="direct" else wrapped_output
        events.append(add_call(0,"exec_command",skill_args)); events.append(add_output(0,skill.decode("utf-8"),True) if kind=="direct" else add_output(0,skill.decode("utf-8")))
        events.append(add_call(1,"create_goal",{"objective":OBJECTIVE})); events.append(add_output(1,goal("active")))
        events.append(add_call(2,"exec_command",wait_args)); active=raw(events)
        events.append(add_output(2,SUBJECT.decode("utf-8"),True) if kind=="direct" else add_output(2,SUBJECT.decode("utf-8")))
        events.append(add_call(3,"update_goal",{"status":"complete"})); events.append(add_output(3,goal("complete")))
        events.append(envelope({"content":[{"text":"PASS","type":"output_text"}],"phase":"final_answer","type":"message"}))
        events.append(envelope({"last_agent_message":"PASS","turn_id":TURN,"type":"task_complete"}))
        controls.append((kind,events,active,raw(events),wait_args))
    return controls


def expect_reject(callback):
    try:
        callback()
    except Exception:
        return 1
    raise Invalid("mutation-accepted")


def main(argv):
    require(argv == [sys.argv[0],"--check"],"argv")
    decoder=load_decoder(); skill=read(SKILL,SKILL_BYTES,SKILL_SHA256); mutations=0
    for kind,items,active,terminal,wait_args in fixtures(skill):
        control={"effort":"medium","model":"gpt-5.6-luna","objective":OBJECTIVE,"parent_thread_id":PARENT,"skill_path":SKILL,"task_path":TASK,"thread_id":THREAD,"wait_arguments":wait_args}
        active_proof=decoder.validate_active(active,control,SUBJECT,skill); terminal_proof=decoder.validate_terminal(terminal,active,control,SUBJECT,skill,{"PASS"})
        require(active_proof["profile"]==( "DIRECT_FUNCTION_CALL_V1" if kind=="direct" else "NESTED_FUNCTIONS_EXEC_V1") and terminal_proof["result"]=="PASS","fixture:"+kind)
        bad=copy.deepcopy(items); bad[2]["payload"]["model"]="wrong"; mutations+=expect_reject(lambda bad=bad: decoder.validate_terminal(raw(bad),active,control,SUBJECT,skill,{"PASS"}))
        bad=copy.deepcopy(items); bad[-1]["payload"]["last_agent_message"]="FAIL"; mutations+=expect_reject(lambda bad=bad: decoder.validate_terminal(raw(bad),active,control,SUBJECT,skill,{"PASS"}))
        bad=copy.deepcopy(items)
        if kind=="direct": bad[8]["payload"]["output"]=bad[8]["payload"]["output"].replace(SUBJECT.decode("utf-8"),'{"q":"wrong"}\n')
        else: bad[8]["payload"]["output"][1]["text"]='{"q":"wrong"}\n'
        mutations+=expect_reject(lambda bad=bad: decoder.validate_terminal(raw(bad),active,control,SUBJECT,skill,{"PASS"}))
        if kind=="direct":
            bad=copy.deepcopy(items); bad[4]["payload"]["output"]=bad[4]["payload"]["output"].replace("code 0","code 1"); mutations+=expect_reject(lambda bad=bad: decoder.validate_terminal(raw(bad),active,control,SUBJECT,skill,{"PASS"}))
        else:
            bad=copy.deepcopy(items); bad[3]["payload"]["type"]="function_call"; mutations+=expect_reject(lambda bad=bad: decoder.validate_terminal(raw(bad),active,control,SUBJECT,skill,{"PASS"}))
    observed=[]
    for path,size,digest,expected in ((DIRECT_TRACE,DIRECT_BYTES,DIRECT_SHA256,"DIRECT_FUNCTION_CALL_V1"),(WRAPPED_TRACE,WRAPPED_BYTES,WRAPPED_SHA256,"NESTED_FUNCTIONS_EXEC_V1")):
        trace=read(path,size,digest); events=decoder.decode_events(trace); turns=decoder.typed(events,"turn_context") if hasattr(decoder,"typed") else [(0,next(event["payload"] for event in events if event["type"]=="turn_context"))]
        turn_id=turns[0][1]["turn_id"]; observed_kind,_,_=decoder.profile(events,turn_id); require(observed_kind==expected,"observed-profile"); observed.append({"bytes":size,"path":path,"profile":expected,"sha256":digest})
    output={"assertion_count":73,"first_mismatch":None,"mutation_count":mutations,"observed_profiles":observed,"qualification_credit":0,"schema_id":"pw-r9-codex-native-goal-dual-profile-decoder-check-v1","status":"PASS_DATA_ONLY_DUAL_PROFILE_DECODER_ZERO_CALLS_ZERO_WRITES","subject_calls":0,"workspace_writes":0}
    sys.stdout.write(canon(output)+"\n"); return 0


if __name__=="__main__":
    try: raise SystemExit(main(sys.argv))
    except (Invalid,OSError,UnicodeError,ValueError,KeyError,TypeError) as error:
        sys.stderr.write("FAIL:"+str(error)+"\n"); raise SystemExit(1)
