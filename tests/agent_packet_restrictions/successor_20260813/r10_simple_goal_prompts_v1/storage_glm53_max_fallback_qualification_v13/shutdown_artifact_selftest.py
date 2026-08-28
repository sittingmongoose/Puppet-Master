#!/usr/bin/env python3
import copy, json, shutil, tempfile
from pathlib import Path

import controller as C

def require(value, message):
    if not value: raise RuntimeError(message)

source=Path("/tmp/pm-r10-storage-dev-20260828-runs/dev13/evidence/diagnostic_01/omp_glm53_flash_max/postfailure_session.raw.jsonl"); raw_lines=source.read_bytes().splitlines(keepends=True); title=raw_lines[0]; original=[json.loads(line) for line in raw_lines[1:]]; prompt=Path("/tmp/pm-r10-storage-dev-20260828-runs/dev13/evidence/diagnostic_01/omp_glm53_flash_max/stdin_prompt.raw").read_bytes(); header=original[0]; results={}

def rejected(name, mutate):
    root=Path(tempfile.mkdtemp(prefix=f"pm-r10-shutdown-{name}-")); directory=root/"row"; directory.mkdir(); (directory/"stdin_prompt.raw").write_bytes(prompt); entries=copy.deepcopy(original); mutate(entries); path=directory/"session.jsonl"; path.write_bytes(title+b"".join((json.dumps(item,separators=(",",":"))+"\n").encode() for item in entries)); contract=copy.deepcopy(C.spec()); row=contract["rows"][0]; row.update({"route_id":"omp_glm53_flash_max","model":"opencode-go/glm-5.3-flash","thinking":"max","cwd":str(root/"cwd"),"private_capture_dir":str(root/"private")}); (root/"cwd").mkdir(); old=(C.spec,C.G.spec,C.row_dir,C.G.row_dir,C.G.NORMALIZE); C.spec=lambda:contract; C.G.spec=C.spec; C.row_dir=lambda _row=None:directory; C.G.row_dir=lambda _row=None:directory; C.G.NORMALIZE=C.semantic_normalize
    try:
        try:
            with C.selected(row): C.G.verify_session(path,expected_cwd=header["cwd"],expected_provider="opencode-go",expected_selector=row["model"],expected_model="glm-5.3-flash",expected_thinking="max",expected_objective="IGNORED",require_exit=True)
        except Exception as exc: results[name]=f"{type(exc).__name__}: {exc}"
        else: raise RuntimeError(f"accepted shutdown mutation: {name}")
    finally:
        C.spec,C.G.spec,C.row_dir,C.G.row_dir,C.G.NORMALIZE=old; C.DB.cleanup(); shutil.rmtree(root)

def locate(rows):
    exit_index=next(i for i,x in enumerate(rows) if x.get("type")=="custom" and x.get("customType")=="session_exit"); return exit_index,exit_index+1

rejected("content",lambda r:r[locate(r)[1]]["message"].update(content=[{"type":"text","text":"x"}]))
rejected("tool",lambda r:r[locate(r)[1]]["message"].update(content=[{"type":"toolCall","name":"goal","arguments":{"op":"complete"},"id":"bad"}]))
rejected("candidate",lambda r:r[locate(r)[1]]["message"].update(content=[{"type":"text","text":"PM_RESULT {}"}]))
def multiple(r): r.append({**copy.deepcopy(r[-1]),"id":"extra-artifact","parentId":r[-1]["id"]})
rejected("multiple",multiple)
def different(r): r.append({"type":"custom","customType":"other","data":{},"id":"extra-event","parentId":r[-1]["id"],"timestamp":r[-1]["timestamp"]})
rejected("different_event",different)
def pre_exit(r):
    e,a=locate(r); exit_entry,artifact=r[e],r[a]; prior=exit_entry["parentId"]; artifact["parentId"]=prior; exit_entry["parentId"]=artifact["id"]; r[e],r[a]=artifact,exit_entry
rejected("pre_exit",pre_exit)
rejected("abnormal_exit",lambda r:r[locate(r)[0]]["data"].update(kind="signal",reason="sigterm"))
def missing_exit(r):
    e,a=locate(r); r[a]["parentId"]=r[e]["parentId"]; del r[e]
rejected("missing_exit",missing_exit)
require(len(results)==8 and all(value for value in results.values()),"all shutdown mutations rejected")
print(json.dumps({"status":"PASS_SHUTDOWN_ARTIFACT_NEGATIVES","subject_calls":0,"rejections":results},sort_keys=True))
