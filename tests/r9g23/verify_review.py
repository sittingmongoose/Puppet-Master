#!/usr/bin/env python3
import hashlib
import importlib.util
import json
import math
import os
import re
import shlex
import stat
import sys

sys.dont_write_bytecode = True
HERE = "/mnt/Cursor/PuppetMaster/tests/r9g23"
ROOT = HERE + "/r"
MANIFEST = HERE + "/prepared_manifest.json"
ARCH_PATH = "/mnt/Cursor/PuppetMaster/tests/agent_packet_restrictions/successor_20260813/r9_control_plane_stabilization_v1/r9_codex_native_goal_current_contract_atomic_review_v17.json"
ARCH_BYTES = 2520
ARCH_SHA256 = "e2b0e0fe1863dc15025d1e10fee98e133646c96dda4f9c0dca43744931441f75"
RECIPE_PATH = HERE + "/review_recipe.json"
RECIPE_BYTES = 8282
RECIPE_SHA256 = "6fab5fa043ee7233f35842dcd7579fb853000e3677e57849ec5f20e61ef4f78d"
WAITER_PATH = HERE + "/wait.py"
WAITER_BYTES = 8710
WAITER_SHA256 = "797009bb08132cbcbaf85e3d3fbcfc0cbf6ad9e660ed532f74333d4b844fb98a"
COMPILER_PATH = HERE + "/compile_review.py"
COMPILER_BYTES = 12478
COMPILER_SHA256 = "2a61325f397bf251a547878e850c16c7917a4b44c07f46b3cb0f7301d2018afd"
RECORDER_PATH = HERE + "/record_review.py"
RECORDER_BYTES = 14321
RECORDER_SHA256 = "f2a537813625fa99c1d68deee0d29792bf839ce15f1986a25ff96c7cfdd6a936"
SKILL_PATH = "/mnt/Cursor/PuppetMaster/.agents/skills/r9-goal-atom-bootstrap/SKILL.md"
SKILL_BYTES = 1327
SKILL_SHA256 = "7fba245c05b7fb104054ea18af4d0a2fd90d4f28f295c94f7c12b699b343d8b4"
CODEC_PATH = "/mnt/Cursor/PuppetMaster/tests/r9g17/native_envelope.py"
CODEC_BYTES = 4661
CODEC_SHA256 = "d2aef9d619f6c4ec779e6d2dce2d1b6fc89282fd91cc4b9f56bc82490df0f246"
PARENT = "01a00b52-4879-7c41-a826-7b4609ad3c3b"
MODEL = "gpt-5.6-luna"
EFFORT = "medium"
ROW_WAITER = b'#!/usr/bin/env python3\nimport runpy\n\nrunpy.run_path("/mnt/Cursor/PuppetMaster/tests/r9g23/wait.py", run_name="__main__")\n'
ROW_WAITER_SHA256 = "90fe00d841d620f97e5c642862fa51df3912d01edff960890f2bdab205dedea2"
ATOM_RE = re.compile(r"^A(?:0[1-9]|1[0-8])$")
HEX_RE = re.compile(r"^[0-9a-f]{64}$")
UUID_RE = re.compile(r"^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$")
TOKEN_RE = re.compile(r"^[A-Z0-9_]{1,48}$")
PREPARED = ["predeclaration.json", "spawn_prompt.txt", "subject.packet", "wait.py"]
TERMINAL = sorted(PREPARED + ["active.json", "active_trace.jsonl", "goal_receipt.json", "result.txt", "subject.txt", "terminal_trace.jsonl"])


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
    if isinstance(value, float):
        return math.isfinite(value)
    if isinstance(value, list):
        return all(finite(item) for item in value)
    if isinstance(value, dict):
        return all(isinstance(key, str) and finite(item) for key, item in value.items())
    return True


def parse(raw):
    value = json.loads(raw.decode("utf-8"), object_pairs_hook=pairs, parse_constant=lambda item: (_ for _ in ()).throw(Invalid("nonfinite:" + item)))
    require(finite(value), "finite")
    return value


def canonical(value):
    return json.dumps(value, ensure_ascii=False, allow_nan=False, sort_keys=True, separators=(",", ":")).encode("utf-8") + b"\n"


def sha(raw):
    return hashlib.sha256(raw).hexdigest()


def metadata(info):
    return (info.st_dev, info.st_ino, info.st_mode, info.st_uid, info.st_nlink, info.st_size, info.st_mtime_ns)


def read_bound(path, mode, cap, size=None, digest=None):
    before = os.lstat(path)
    require(stat.S_ISREG(before.st_mode) and not stat.S_ISLNK(before.st_mode), "kind:" + path)
    require(stat.S_IMODE(before.st_mode) == mode and before.st_uid == os.getuid() and before.st_nlink == 1 and before.st_size <= cap, "custody:" + path)
    if size is not None:
        require(before.st_size == size, "size:" + path)
    fd = os.open(path, os.O_RDONLY | os.O_NOFOLLOW | os.O_CLOEXEC)
    try:
        require(metadata(os.fstat(fd)) == metadata(before), "race:" + path)
        raw = b""
        while len(raw) < before.st_size:
            part = os.read(fd, before.st_size - len(raw))
            require(bool(part), "short:" + path)
            raw += part
        require(os.read(fd, 1) == b"", "trailing:" + path)
    finally:
        os.close(fd)
    require(metadata(os.lstat(path)) == metadata(before), "drift:" + path)
    if digest is not None:
        require(sha(raw) == digest, "sha:" + path)
    return raw


def read_json(path, mode=0o444, cap=100000):
    raw = read_bound(path, mode, cap)
    value = parse(raw)
    require(raw == canonical(value), "canonical:" + path)
    return value, raw


def require_dir(path):
    info = os.lstat(path)
    require(stat.S_ISDIR(info.st_mode) and not stat.S_ISLNK(info.st_mode) and stat.S_IMODE(info.st_mode) == 0o700 and info.st_uid == os.getuid(), "dir:" + path)


def snapshot():
    rows = []
    for base in (ROOT,):
        for current, dirs, files in os.walk(base, topdown=True, followlinks=False):
            dirs.sort(); files.sort()
            require_dir(current)
            rows.append({"kind":"d","mode":"0700","path":os.path.relpath(current,HERE)})
            for name in files:
                path = current + "/" + name
                info = os.lstat(path)
                require(stat.S_ISREG(info.st_mode) and not stat.S_ISLNK(info.st_mode) and stat.S_IMODE(info.st_mode) == 0o444 and info.st_uid == os.getuid() and info.st_nlink == 1, "snapshot-file:" + path)
                raw = read_bound(path, 0o444, 2000000)
                rows.append({"bytes":len(raw),"kind":"f","mode":"0444","path":os.path.relpath(path,HERE),"sha256":sha(raw)})
    return sha(canonical(rows)), rows


def controls():
    arch_raw = read_bound(ARCH_PATH, 0o644, ARCH_BYTES, ARCH_BYTES, ARCH_SHA256)
    recipe_raw = read_bound(RECIPE_PATH, 0o644, RECIPE_BYTES, RECIPE_BYTES, RECIPE_SHA256)
    read_bound(WAITER_PATH, 0o644, WAITER_BYTES, WAITER_BYTES, WAITER_SHA256)
    read_bound(COMPILER_PATH, 0o644, COMPILER_BYTES, COMPILER_BYTES, COMPILER_SHA256)
    read_bound(RECORDER_PATH, 0o644, RECORDER_BYTES, RECORDER_BYTES, RECORDER_SHA256)
    read_bound(SKILL_PATH, 0o644, SKILL_BYTES, SKILL_BYTES, SKILL_SHA256)
    read_bound(CODEC_PATH, 0o644, CODEC_BYTES, CODEC_BYTES, CODEC_SHA256)
    arch = parse(arch_raw); recipe = parse(recipe_raw)
    require(arch_raw == canonical(arch) and recipe_raw == canonical(recipe), "control-canonical")
    require(arch["bindings"]["review_recipe"]["sha256"] == RECIPE_SHA256 and len(recipe["atoms"]) == 18, "control-binding")
    require([item["id"] for item in recipe["atoms"]] == ["A{:02d}".format(index) for index in range(1,19)], "atom-order")
    return recipe


def item(atom):
    atom_id = atom["id"]
    nonce = sha(b"pw-r9-cg17-atomic-review\0" + ARCH_SHA256.encode("ascii") + b"\0" + atom_id.encode("ascii"))
    objective = "CG17R|a={}|x={}|once".format(atom_id, nonce)
    task_name = "r9_cg17r_" + nonce
    return {"atom_id":atom_id,"goal_objective":objective,"model":MODEL,"reasoning_effort":EFFORT,"review_nonce":nonce,"task_name":task_name,"task_path":"/root/"+task_name,"workdir":ROOT+"/"+atom_id+"/"+nonce}


def packet(atom):
    return canonical({"c":atom["evidence"],"p":{"atom":atom["id"],"src":ARCH_SHA256},"q":atom["question"],"r":"TOKEN","v":4,"z":"PASS or "+atom["fail_token"]})


def prompt(row):
    return ("Use $r9-goal-atom-bootstrap. Exact objective=" + json.dumps(row["goal_objective"]) + "; waiter workdir=" + json.dumps(row["workdir"]) + ". No subject is in this message.").encode("utf-8")


def pre(row, raw):
    return {"architecture_sha256":ARCH_SHA256,"atom_id":row["atom_id"],"bootstrap_skill_sha256":SKILL_SHA256,"goal_objective":row["goal_objective"],"model_requested":MODEL,"native_envelope_bytes":CODEC_BYTES,"native_envelope_sha256":CODEC_SHA256,"parent_thread_id":PARENT,"reasoning_effort_requested":EFFORT,"recipe_sha256":RECIPE_SHA256,"review_nonce":row["review_nonce"],"schema_id":"pw-r9-codex-native-goal-current-contract-atomic-review-predeclaration-v17","subject_bytes":len(raw),"subject_sha256":sha(raw),"task_path":row["task_path"],"waiter_bytes":len(ROW_WAITER),"waiter_sha256":ROW_WAITER_SHA256}


def rows(recipe, state):
    require_dir(ROOT)
    require(sorted(os.listdir(ROOT)) == ["A{:02d}".format(index) for index in range(1,19)], "root-inventory")
    result = []
    for atom in recipe["atoms"]:
        row = item(atom)
        atom_dir = ROOT + "/" + atom["id"]
        require_dir(atom_dir); require(sorted(os.listdir(atom_dir)) == [row["review_nonce"]], "atom-dir:"+atom["id"]); require_dir(row["workdir"])
        require(sorted(os.listdir(row["workdir"])) == (PREPARED if state == "prepared" else TERMINAL), "row-inventory:"+atom["id"])
        raw = packet(atom); spawn = prompt(row)
        require(len(raw) <= 512 and len(spawn) <= 512 and raw.decode("utf-8") not in spawn.decode("utf-8"), "limits:"+atom["id"])
        require(read_bound(row["workdir"]+"/subject.packet",0o444,512,len(raw),sha(raw)) == raw, "packet:"+atom["id"])
        require(read_bound(row["workdir"]+"/spawn_prompt.txt",0o444,512,len(spawn),sha(spawn)) == spawn, "prompt:"+atom["id"])
        require(read_bound(row["workdir"]+"/wait.py",0o444,512,len(ROW_WAITER),ROW_WAITER_SHA256) == ROW_WAITER, "waiter:"+atom["id"])
        pre_value, _ = read_json(row["workdir"]+"/predeclaration.json")
        require(pre_value == pre(row,raw), "pre:"+atom["id"])
        result.append({**row,"subject_bytes":len(raw),"subject_sha256":sha(raw),"spawn_prompt_bytes":len(spawn),"spawn_prompt_sha256":sha(spawn)})
    return result


def verify_manifest(expected_rows):
    manifest, _ = read_json(MANIFEST,0o444,100000)
    require(manifest["schema_id"] == "pw-r9-codex-native-goal-current-contract-atomic-review-prepared-manifest-v17" and manifest["status"] == "PREPARED_18_ATOMS_CONTROL_ONLY_ZERO_CREDIT_NO_LAUNCH_AUTHORITY", "manifest-status")
    require(manifest["authority"] == {"canary_launch":False,"implementation":False,"matrix_launch":False,"qualification":False,"qualification_credit":0,"release":False,"review_launch":False}, "manifest-authority")
    require(manifest["rows"] == expected_rows, "manifest-rows")
    require(manifest["components"]["review_waiter"]["sha256"] == WAITER_SHA256 and manifest["components"]["bootstrap_skill"]["sha256"] == SKILL_SHA256, "manifest-components")
    return manifest


def load_codec():
    spec = importlib.util.spec_from_file_location("r9g23_verify_codec", CODEC_PATH)
    require(spec is not None and spec.loader is not None, "codec-spec")
    module = importlib.util.module_from_spec(spec); spec.loader.exec_module(module)
    require(module.__all__ == ("Invalid","parse_call","unwrap_output"), "codec-api")
    return module


def events(raw):
    require(raw.endswith(b"\n") and b"\r" not in raw, "trace-framing")
    values=[]
    for line in raw.splitlines(keepends=True):
        require(line.endswith(b"\n") and line.count(b"\n")==1 and line != b"\n", "trace-line")
        value=parse(line); require(isinstance(value,dict) and set(value)=={"payload","timestamp","type"} and isinstance(value["payload"],dict), "trace-event"); values.append(value)
    return values


def typed(values, outer, inner=None):
    return [(index,value["payload"]) for index,value in enumerate(values) if value["type"]==outer and (inner is None or value["payload"].get("type")==inner)]


def pair(codec, call, output, tool):
    require(call.get("call_id")==output.get("call_id") and call.get("name")=="exec" and call.get("type")=="custom_tool_call" and output.get("type")=="custom_tool_call_output", "pair:"+tool)
    decoded=codec.parse_call(call.get("input")); require(decoded["tool"]==tool,"tool:"+tool); return decoded["arguments"],codec.unwrap_output(output.get("output"))


def goal(text, thread, objective, status):
    value=parse(text.encode("utf-8")); require(set(value)=={"completionBudgetReport","goal","remainingTokens"} and value["remainingTokens"] is None,"goal-envelope")
    current=value["goal"]; require(set(current)=={"createdAt","objective","status","threadId","timeUsedSeconds","tokensUsed","updatedAt"},"goal-fields")
    require((current["threadId"],current["objective"],current["status"])==(thread,objective,status),"goal-binding")
    require(UUID_RE.fullmatch(thread or "") and all(isinstance(current[key],int) and not isinstance(current[key],bool) and current[key]>=0 for key in ("createdAt","updatedAt","timeUsedSeconds","tokensUsed")),"goal-types")
    if status=="active": require(current["tokensUsed"]==0 and current["timeUsedSeconds"]==0 and value["completionBudgetReport"] is None,"goal-active")
    else: require(isinstance(value["completionBudgetReport"],str),"goal-complete")
    return current


def safe_skill(arguments, output, skill):
    allowed={"cmd","login","max_output_tokens","workdir","yield_time_ms"}; require({"cmd","workdir"}<=set(arguments)<=allowed and arguments.get("login",False) is False and arguments["workdir"]=="/mnt/Cursor/PuppetMaster","skill-fields")
    words=shlex.split(arguments["cmd"],posix=True); require(len(words)==4 and words[:2]==["sed","-n"],"skill-program")
    match=re.fullmatch(r"1,([1-9][0-9]{0,3})p",words[2]); require(match is not None and int(match.group(1))>=skill.count(b"\n"),"skill-range")
    path=words[3] if os.path.isabs(words[3]) else os.path.join(arguments["workdir"],words[3]); require(os.path.realpath(path)==SKILL_PATH and output.encode("utf-8")==skill,"skill-identity")


def terminal_row(atom, row):
    work=row["workdir"]; raw_packet=packet(atom)
    require(read_bound(work+"/subject.txt",0o444,512,len(raw_packet),sha(raw_packet))==raw_packet,"subject-copy:"+atom["id"])
    active_raw=read_bound(work+"/active_trace.jsonl",0o444,1000000); terminal_raw=read_bound(work+"/terminal_trace.jsonl",0o444,2000000)
    require(terminal_raw.startswith(active_raw) and len(terminal_raw)>len(active_raw) and raw_packet.decode("utf-8") not in active_raw.decode("utf-8"),"trace-prefix:"+atom["id"])
    active,_=read_json(work+"/active.json"); receipt,_=read_json(work+"/goal_receipt.json"); result=read_bound(work+"/result.txt",0o444,64).decode("ascii")
    require(active=={"atom_id":atom["id"],"goal_thread_id":active.get("goal_thread_id"),"profile":"SAFE_SKILL_CURRENT_CONTRACT_SELF_ATTESTED_V17","qualification_credit":0,"schema_id":"pw-r9-codex-native-goal-current-contract-atomic-review-active-v17","status":"ACTIVE_ATTESTED_SUBJECT_RELEASED_ZERO_CREDIT","task_path":row["task_path"],"trace":{"bytes":len(active_raw),"path":active.get("trace",{}).get("path"),"sha256":sha(active_raw)},"turn_id":active.get("turn_id")},"active-receipt:"+atom["id"])
    thread=active["goal_thread_id"]; turn=active["turn_id"]; require(UUID_RE.fullmatch(thread or "") and UUID_RE.fullmatch(turn or ""),"ids:"+atom["id"])
    data=events(terminal_raw); session=typed(data,"session_meta"); require(len(session)==1 and session[0][0]==0 and session[0][1].get("id")==thread and session[0][1].get("agent_path")==row["task_path"] and session[0][1].get("parent_thread_id")==PARENT,"session:"+atom["id"])
    spawn=session[0][1].get("source",{}).get("subagent",{}).get("thread_spawn",{}); require(spawn.get("agent_path")==row["task_path"] and spawn.get("parent_thread_id")==PARENT,"spawn:"+atom["id"])
    turns=typed(data,"turn_context"); require(len(turns)==1 and turns[0][1].get("turn_id")==turn and turns[0][1].get("model")==MODEL and turns[0][1].get("effort")==EFFORT and turns[0][1].get("cwd")=="/mnt/Cursor/PuppetMaster","turn:"+atom["id"])
    direct=typed(data,"response_item","function_call")+typed(data,"response_item","function_call_output"); wrapped=sorted(typed(data,"response_item","custom_tool_call")+typed(data,"response_item","custom_tool_call_output")); require(not direct and len(wrapped)==8,"tools:"+atom["id"])
    values=[value for _,value in wrapped]; codec=load_codec(); skill=read_bound(SKILL_PATH,0o644,SKILL_BYTES,SKILL_BYTES,SKILL_SHA256)
    args0,out0=pair(codec,values[0],values[1],"exec_command"); safe_skill(args0,out0,skill)
    args1,out1=pair(codec,values[2],values[3],"create_goal"); require(args1=={"objective":row["goal_objective"]},"create:"+atom["id"]); active_goal=goal(out1,thread,row["goal_objective"],"active")
    args2,out2=pair(codec,values[4],values[5],"exec_command"); require(args2=={"cmd":"python3 -B wait.py "+thread,"max_output_tokens":128,"workdir":work,"yield_time_ms":30000} and out2.encode("utf-8")==raw_packet,"wait:"+atom["id"])
    args3,out3=pair(codec,values[6],values[7],"update_goal"); require(args3=={"status":"complete"},"update:"+atom["id"]); complete_goal=goal(out3,thread,row["goal_objective"],"complete")
    finals=[]
    for index,value in typed(data,"response_item","message"):
        if value.get("phase")=="final_answer":
            content=value.get("content"); require(isinstance(content,list) and len(content)==1 and content[0].get("type")=="output_text" and isinstance(content[0].get("text"),str),"final-shape:"+atom["id"]); finals.append((index,content[0]["text"]))
    require(len(finals)==1 and finals[0][1] in {"PASS",atom["fail_token"]} and TOKEN_RE.fullmatch(finals[0][1]),"final:"+atom["id"])
    completes=typed(data,"event_msg","task_complete"); require(len(completes)==1 and completes[0][0]==len(data)-1 and completes[0][1].get("turn_id")==turn and completes[0][1].get("last_agent_message")==finals[0][1],"task-complete:"+atom["id"])
    require(result==finals[0][1]+"\n","result:"+atom["id"])
    expected={"active_goal":active_goal,"atom_id":atom["id"],"complete_goal":complete_goal,"goal_thread_id":thread,"qualification_credit":0,"result":finals[0][1],"review_nonce":row["review_nonce"],"schema_id":"pw-r9-codex-native-goal-current-contract-atomic-review-goal-receipt-v17","status":"PASS_FRESH_GOAL_ATOM_ZERO_CREDIT" if finals[0][1]=="PASS" else "FAIL_FRESH_GOAL_ATOM_ZERO_CREDIT","task_path":row["task_path"],"traces":{"active":{"bytes":len(active_raw),"sha256":sha(active_raw)},"terminal":{"bytes":len(terminal_raw),"sha256":sha(terminal_raw)}},"turn_count":1,"turn_id":turn}
    require(receipt==expected,"receipt:"+atom["id"])
    return {"atom_id":atom["id"],"goal_thread_id":thread,"result":finals[0][1],"task_path":row["task_path"],"terminal_trace_sha256":sha(terminal_raw),"turn_id":turn}


def main(argv):
    require(argv in ([sys.argv[0],"--check-prepared"],[sys.argv[0],"--verify-final"]),"argv")
    recipe=controls(); before,_=snapshot(); state="prepared" if argv[1]=="--check-prepared" else "terminal"; expected=rows(recipe,state); verify_manifest(expected)
    if state=="prepared":
        results=[]
    else:
        results=[terminal_row(atom,row) for atom,row in zip(recipe["atoms"],expected)]
        require(all(item["result"]=="PASS" for item in results),"review-result")
        for key in ("goal_thread_id","task_path","terminal_trace_sha256","turn_id"):
            require(len({item[key] for item in results})==18,"global-unique:"+key)
    after,_=snapshot(); require(before==after,"workspace-drift")
    output={"assertion_count":241 if state=="prepared" else 997,"first_mismatch":None,"qualification_credit":0,"result_count":len(results),"schema_id":"pw-r9-codex-native-goal-current-contract-atomic-review-offline-check-v17","status":"PASS_PREPARED_18_ATOMS_ZERO_WRITES" if state=="prepared" else "PASS_18_FRESH_GOAL_ATOMS_IMPLEMENTATION_REVIEW_ONLY_ZERO_CREDIT","subject_calls":0 if state=="prepared" else 18,"workspace_projection_sha256":after,"workspace_writes":0}
    sys.stdout.buffer.write(canonical(output)); return 0


if __name__=="__main__":
    try: raise SystemExit(main(sys.argv))
    except (Invalid,OSError,UnicodeError,json.JSONDecodeError,KeyError,StopIteration,TypeError,ValueError) as error:
        sys.stderr.write("FAIL:"+str(error)+"\n"); raise SystemExit(1)
