#!/usr/bin/env python3
import copy, json, shutil, tempfile
from pathlib import Path

import controller as C

def require(value, message):
    if not value: raise RuntimeError(message)
def rejects(call,message):
    try: call()
    except Exception: return
    raise RuntimeError(message)

source=Path("/tmp/pm-r10-storage-dev-20260828-runs/dev14/evidence/diagnostic_01/omp_glm53_flash_max")
http=Path("/tmp/pm-r10-storage-dev-20260828-runs/dev14/private_capture_fixture")
root=Path(tempfile.mkdtemp(prefix="pm-r10-storage-dev14-replay-")); directory=root/"evidence"/"diagnostic_01"/"omp_glm53_flash_max"; directory.mkdir(parents=True); cwd=root/"cwd"; cwd.mkdir(); private=root/"private"
session=directory/"session.raw.jsonl"; shutil.copy2(source/"postfailure_session.raw.jsonl",session); shutil.copy2(source/"stdin_prompt.raw",directory/"stdin_prompt.raw")
for item in http.iterdir(): shutil.copy2(item,cwd/item.name)
contract=copy.deepcopy(C.spec()); row=contract["rows"][0]; row.update({"route_id":"omp_glm53_flash_max","model":"opencode-go/glm-5.3-flash","thinking":"max","cwd":str(cwd),"private_capture_dir":str(private)}); contract["routes"]=[{"id":row["route_id"],"surface":"omp_tui","model":row["model"],"thinking":row["thinking"]}]; contract["route_order"]=[row["route_id"]]
header=json.loads(session.read_bytes().splitlines()[1]); actual_cwd=header["cwd"]
old=(C.spec,C.G.spec,C.EVIDENCE,C.G.EVIDENCE,C.row_dir,C.G.row_dir,C.G.NORMALIZE); C.spec=lambda:contract; C.G.spec=C.spec; C.EVIDENCE=root/"evidence"; C.G.EVIDENCE=C.EVIDENCE; C.row_dir=lambda _row=None:directory; C.G.row_dir=lambda _row=None:directory; C.G.NORMALIZE=C.semantic_normalize
try:
    response=cwd/"rr-session-1.res.log"; response_raw=response.read_bytes(); response.write_bytes(b""); rejects(lambda:C.G.verify_session(session,expected_cwd=actual_cwd,expected_provider="opencode-go",expected_selector=row["model"],expected_model="glm-5.3-flash",expected_thinking="max",expected_objective="IGNORED_FOR_EXACT_TRANSPORT",require_exit=True),"empty response accepted"); response.write_bytes(response_raw)
    response.unlink(); rejects(lambda:C.G.verify_session(session,expected_cwd=actual_cwd,expected_provider="opencode-go",expected_selector=row["model"],expected_model="glm-5.3-flash",expected_thinking="max",expected_objective="IGNORED_FOR_EXACT_TRANSPORT",require_exit=True),"missing response accepted"); response.write_bytes(response_raw)
    response.write_bytes(response_raw.replace(b"HTTP 200 OK",b"HTTP 201 OK",1)); rejects(lambda:C.G.verify_session(session,expected_cwd=actual_cwd,expected_provider="opencode-go",expected_selector=row["model"],expected_model="glm-5.3-flash",expected_thinking="max",expected_objective="IGNORED_FOR_EXACT_TRANSPORT",require_exit=True),"mismatched response accepted"); response.write_bytes(response_raw)
    with C.selected(row): result=C.G.verify_session(session,expected_cwd=actual_cwd,expected_provider="opencode-go",expected_selector=row["model"],expected_model="glm-5.3-flash",expected_thinking="max",expected_objective="IGNORED_FOR_EXACT_TRANSPORT",require_exit=True)
    artifact=result["post_exit_shutdown_tail"]; require(result["assistant_lifecycle_shape"]=="standard_single_turn_goal_complete" and result["assistant_message_count"]==1 and result["persisted_thinking_literal"]=="max","full core lifecycle")
    require(artifact["entry_count"]==1 and artifact["entries"][0]["thinking_block_count"]==0 and artifact["entries"][0]["stopReason"]=="aborted" and artifact["entries"][0]["errorMessage"]=="Request was aborted" and artifact["semantic_credit"] is artifact["lifecycle_credit"] is False and artifact["usage_credit"]==0,"bounded shutdown tail")
    require(result["result_normalization"]["candidate_count"]==1 and result["request_effort_receipt"]["post_exit_aborted_request_count"]==1 and all(item["reasoning_effort"]=="max" for item in result["request_effort_receipt"]["requests"]),"semantic/request max")
    require(not any(cwd.iterdir()) and {item.name for item in private.iterdir()}=={"rr-session-1.json","rr-session-1.res.log","rr-session-2.json"},"private raw custody")
    require((private.stat().st_mode&0o777)==0o700 and all((item.stat().st_mode&0o777)==0o600 and item.is_file() and not item.is_symlink() for item in private.iterdir()),"private capture modes")
    for item in private.iterdir(): item.unlink()
    private.rmdir()
    with C.selected(row): replayed=C.G.verify_session(session,expected_cwd=actual_cwd,expected_provider="opencode-go",expected_selector=row["model"],expected_model="glm-5.3-flash",expected_thinking="max",expected_objective="IGNORED_FOR_EXACT_TRANSPORT",require_exit=True)
    require(replayed==result and not private.exists() and not any(cwd.iterdir()),"pass cleanup fresh durable replay")
    receipt_path=directory/"request_response_projection.json"; receipt=C.P.load_json(receipt_path); forged=copy.deepcopy(receipt); forged["pairs"][0]["response"]["raw_response_sha256"]="0"*64; C.P.atomic_write(receipt_path,C.P.pretty_json(forged)); rejects(lambda:C.G.verify_session(session,expected_cwd=actual_cwd,expected_provider="opencode-go",expected_selector=row["model"],expected_model="glm-5.3-flash",expected_thinking="max",expected_objective="IGNORED_FOR_EXACT_TRANSPORT",require_exit=True),"forged durable response accepted"); C.P.atomic_write(receipt_path,C.P.pretty_json(receipt))
finally:
    C.spec,C.G.spec,C.EVIDENCE,C.G.EVIDENCE,C.row_dir,C.G.row_dir,C.G.NORMALIZE=old; C.DB.cleanup(); shutil.rmtree(root)
print(json.dumps({"status":"PASS_DEV14_FULL_CORE_OFFLINE_REPLAY","subject_calls":0,"assistant_message_count":result["assistant_message_count"],"goal_complete_once":True,"normal_exit":True,"durable_replay_after_private_cleanup":True,"http_negative_count":4,"shutdown_artifact":artifact,"request_efforts":[item["reasoning_effort"] for item in result["request_effort_receipt"]["requests"]]},sort_keys=True))
