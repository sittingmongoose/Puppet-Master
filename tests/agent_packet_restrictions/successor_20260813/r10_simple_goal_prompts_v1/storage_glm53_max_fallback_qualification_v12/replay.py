#!/usr/bin/env python3
import json, shutil
from pathlib import Path
import controller as C
def require(value, message):
    if not value: raise RuntimeError(message)
RAW=Path("/tmp/pm-r10-storage-dev-20260828-v9-replay/submission_timeout_session.raw.jsonl")
PROMPT=Path("/tmp/pm-r10-storage-dev-20260828-v9-replay/stdin_prompt.raw").read_bytes()
WORK=Path("/tmp/pm-r10-storage-dev-20260828-v9-replay/work")
if WORK.exists(): shutil.rmtree(WORK)
WORK.mkdir(); (WORK/"stdin_prompt.raw").write_bytes(PROMPT)
rows=[json.loads(line) for line in RAW.read_text().splitlines()]
objective=PROMPT[6:-1].decode(); persisted=[row["data"]["goal"]["objective"] for row in rows if row.get("type")=="mode_change" and row.get("mode")=="goal"][0]
require(persisted==objective and PROMPT.startswith(b"/goal ") and PROMPT.endswith(b"\n"),"exact persisted transport objective")
assistants=[row["message"] for row in rows if row.get("type")=="message" and row.get("message",{}).get("role")=="assistant"]
texts=[block["text"] for message in assistants for block in message.get("content",[]) if block.get("type")=="text"]
candidate_text=next(text for text in texts if "PM_RESULT" in text)
marker=candidate_text.index("PM_RESULT")+len("PM_RESULT"); decoder=json.JSONDecoder(); start=marker
while candidate_text[start] in " \t\r\n": start+=1
candidate,_=decoder.raw_decode(candidate_text,start); oracle=C.P.load_json(C.V7/"oracle.json")
missing=sorted(set(oracle)-set(candidate)); extra=sorted(set(candidate)-set(oracle))
require(len(missing)==3 and len(extra)==11,"exact V9 schema delta")
semantic_error=None
try: C.semantic_normalize(RAW,{"assistant_message_count":len(assistants),"final_text":texts[-1]},oracle_path=C.V7/"oracle.json",schema_path=C.V7/"response.schema.json",max_text_block_utf8_bytes=8192)
except Exception as exc: semantic_error=f"{type(exc).__name__}: {exc}"
require(semantic_error and ("schema" in semantic_error.lower() or "keys" in semantic_error.lower()),"semantic rejection")
row=C.rows()[0]; old=(C.EVIDENCE,C.G.EVIDENCE,C.row_dir,C.G.row_dir,C.G.session_health)
C.EVIDENCE=WORK.parent; C.G.EVIDENCE=WORK.parent; C.row_dir=lambda _row=None:WORK; C.G.row_dir=lambda _row=None:WORK; C.G.session_health=lambda _path:True
structural_error=None
try:
    with C.selected(row): C.G.verify_session(RAW,expected_cwd=row["cwd"],expected_provider="opencode-zen",expected_selector=row["model"],expected_model="mimo-v2.5-free",expected_thinking=row["thinking"],expected_objective="WRONG_V7_OBJECTIVE",require_exit=True)
except Exception as exc: structural_error=f"{type(exc).__name__}: {exc}"
finally: C.EVIDENCE,C.G.EVIDENCE,C.row_dir,C.G.row_dir,C.G.session_health=old; C.DB.cleanup()
require(structural_error and ("exit" in structural_error.lower() or "terminal" in structural_error.lower()),f"abnormal exit rejection: {structural_error}")
print(json.dumps({"status":"PASS_V9_OFFLINE_REPLAY","objective_exact_transport_slice":True,"candidate_found":True,"missing_fields":missing,"missing_count":3,"extra_fields":extra,"extra_count":11,"semantic_rejection":semantic_error,"abnormal_exit_rejection":structural_error},sort_keys=True))
