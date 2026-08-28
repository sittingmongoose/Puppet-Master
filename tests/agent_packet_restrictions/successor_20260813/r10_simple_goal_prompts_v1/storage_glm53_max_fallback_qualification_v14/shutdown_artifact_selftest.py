#!/usr/bin/env python3
import copy, json, shutil, tempfile
from pathlib import Path
import controller as C

DEV13=Path("/tmp/pm-r10-storage-dev-20260828-runs/dev13/evidence/diagnostic_01/omp_glm53_flash_max")
V13=C.R10/"storage_glm53_max_fallback_qualification_v13/evidence/qualification_01/omp_glm53_flash_max"
results={}
def require(value,message):
    if not value: raise RuntimeError(message)
def fixture(source):
    raw=(source/"postfailure_session.raw.jsonl").read_bytes(); lines=raw.splitlines(keepends=True)
    return raw,lines[0],[json.loads(line) for line in lines[1:]],(source/"stdin_prompt.raw").read_bytes()
def run(name,source,mutate,accept=False,preserve_raw=False):
    raw,title,original,prompt=fixture(source); root=Path(tempfile.mkdtemp(prefix=f"pm-r10-tail-{name}-")); directory=root/"row"; directory.mkdir(); (directory/"stdin_prompt.raw").write_bytes(prompt); entries=copy.deepcopy(original); mutate(entries); path=directory/"session.jsonl"; path.write_bytes(raw if preserve_raw else title+b"".join((json.dumps(item,separators=(",",":"))+"\n").encode() for item in entries)); contract=copy.deepcopy(C.spec()); row=contract["rows"][0]; row.update({"route_id":"omp_glm53_flash_max","model":"tail-fixture-no-http","thinking":"max","cwd":str(root/"cwd"),"private_capture_dir":str(root/"private")}); (root/"cwd").mkdir(); header=entries[0]
    old=(C.spec,C.G.spec,C.row_dir,C.G.row_dir,C.G.NORMALIZE); C.spec=lambda:contract; C.G.spec=C.spec; C.row_dir=lambda _row=None:directory; C.G.row_dir=lambda _row=None:directory; C.G.NORMALIZE=C.semantic_normalize
    try:
        try:
            with C.selected(row): value=C.G.verify_session(path,expected_cwd=header["cwd"],expected_provider="opencode-go",expected_selector="opencode-go/glm-5.3-flash",expected_model="glm-5.3-flash",expected_thinking="max",expected_objective="IGNORED",require_exit=True)
        except Exception as exc:
            if accept: raise RuntimeError(f"rejected admitted tail {name}: {type(exc).__name__}: {exc}") from exc
            results[name]=f"{type(exc).__name__}: {exc}"
        else:
            if not accept: raise RuntimeError(f"accepted teardown mutation: {name}")
            tail=value["post_exit_shutdown_tail"]; require(tail["entry_count"]==len(tail["entries"]) and tail["semantic_credit"] is tail["lifecycle_credit"] is False and tail["usage_credit"]==0,"tail never credited"); results[name]={"entry_count":tail["entry_count"],"raw_jsonl_bytes":tail["raw_jsonl_bytes"],"raw_jsonl_sha256":tail["raw_jsonl_sha256"]}
    finally:
        C.spec,C.G.spec,C.row_dir,C.G.row_dir,C.G.NORMALIZE=old; shutil.rmtree(root)
def locate(rows):
    index=next(i for i,item in enumerate(rows) if item.get("type")=="custom" and item.get("customType")=="session_exit"); return index,index+1

run("dev13_observed",DEV13,lambda _r:None,True,True)
run("v13_observed",V13,lambda _r:None,True,True)
def admitted_error(rows):
    _e,a=locate(rows); rows[a]["message"].update(stopReason="error",errorMessage="bounded teardown error")
run("bounded_error",V13,admitted_error,True)
def admitted_chain(rows):
    _e,a=locate(rows); extra=copy.deepcopy(rows[a]); extra["id"]="tail-second"; extra["parentId"]=rows[a]["id"]; extra["timestamp"]="2026-08-28T10:58:03.683Z"; extra["message"]["timestamp"]+=1; rows.append(extra)
run("bounded_two_entry_chain",V13,admitted_chain,True)
run("visible_text",DEV13,lambda r:r[locate(r)[1]]["message"].update(content=[{"type":"text","text":"visible"}]))
run("ordinary_tool",DEV13,lambda r:r[locate(r)[1]]["message"].update(content=[{"type":"toolCall","name":"read","arguments":{},"id":"bad"}]))
run("goal_call",DEV13,lambda r:r[locate(r)[1]]["message"].update(content=[{"type":"toolCall","name":"goal","arguments":{"op":"complete"},"id":"bad"}]))
def goal_state(rows):
    _e,a=locate(rows); rows[a]={"type":"mode_change","mode":"goal","data":{"goal":{"status":"complete"}},"id":rows[a]["id"],"parentId":rows[a]["parentId"],"timestamp":rows[a]["timestamp"]}
run("goal_state",DEV13,goal_state)
run("user_message",DEV13,lambda r:r[locate(r)[1]]["message"].update(role="user"))
run("pm_result",V13,lambda r:r[locate(r)[1]]["message"]["content"][0].update(thinking="private inline PM_RESULT token"))
def too_many(rows):
    _e,a=locate(rows)
    while len(rows)-a<5:
        extra=copy.deepcopy(rows[-1]); extra["parentId"]=rows[-1]["id"]; extra["id"]=f"tail-{len(rows)-a+1}"; rows.append(extra)
run("too_many",DEV13,too_many)
run("too_large",V13,lambda r:r[locate(r)[1]]["message"]["content"][0].update(thinking="x"*9000))
run("wrong_time",DEV13,lambda r:r[locate(r)[1]].update(timestamp="2026-08-28T05:41:39.000Z"))
run("wrong_session_chain",DEV13,lambda r:r[locate(r)[1]].update(parentId="foreign-session"))
def second_exit(rows):
    _e,a=locate(rows); rows.append({"type":"custom","customType":"session_exit","data":{"reason":"dispose","kind":"normal","recordedAt":rows[a]["timestamp"]},"id":"second-exit","parentId":rows[a]["id"],"timestamp":rows[a]["timestamp"]})
run("additional_exit",DEV13,second_exit)
def arbitrary(rows):
    _e,a=locate(rows); rows[a]={"type":"custom","customType":"other","data":{},"id":rows[a]["id"],"parentId":rows[a]["parentId"],"timestamp":rows[a]["timestamp"]}
run("arbitrary_event",DEV13,arbitrary)
run("system_message",DEV13,lambda r:r[locate(r)[1]]["message"].update(role="system"))
run("missing_error",DEV13,lambda r:r[locate(r)[1]]["message"].update(errorMessage=""))
require(len(results)==18 and all(results.values()),"complete tail replay matrix")
C.DB.cleanup()
print(json.dumps({"status":"PASS_POST_EXIT_SEMANTIC_TAIL","subject_calls":0,"qualification_credit":0,"variants":{key:results[key] for key in ("dev13_observed","v13_observed","bounded_error","bounded_two_entry_chain")},"negative_count":14},sort_keys=True))
