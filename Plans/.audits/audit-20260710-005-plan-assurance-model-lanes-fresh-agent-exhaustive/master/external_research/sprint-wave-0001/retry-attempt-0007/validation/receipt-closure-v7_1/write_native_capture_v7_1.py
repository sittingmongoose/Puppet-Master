#!/usr/bin/env python3
from __future__ import annotations
import argparse,hashlib,json,os,sys
from pathlib import Path
BASE=Path(__file__).resolve().parent;NS=BASE.parents[1];sys.path.insert(0,str(NS/'tools'))
import common,canonical_json
ACTUAL_CORE='043488cb83d6064068a887d484f22d19d6c158a2bc1d424798ed9611c9f58c83';ACTUAL_ENV='3dab3e76f915889be2c65710477ab1c860f42d57d34d836a3311bd93255ab406'
def main():
 ap=argparse.ArgumentParser();ap.add_argument('--native-state',type=Path,required=True);ap.add_argument('--sha256',required=True);a=ap.parse_args()
 if common.sha(a.native_state)!=a.sha256:raise SystemExit('native state drift')
 state=common.load(a.native_state);leaves=[]
 for native in state['leaves']:
  aid=native['assignment_id'];rr=common.result_path(aid).read_bytes();pr=common.receipt_path(aid).read_bytes();rec=common.parse_standard_exact(pr)
  if rec.get('activation_core_file_sha256')!=ACTUAL_CORE or rec.get('activation_envelope_file_sha256')!=ACTUAL_ENV:raise SystemExit(aid+':activation raw digest join')
  if rec.get('native_child_thread_id')!=native['native_child_thread_id'] or rec.get('native_child_turn_id')!=native['native_child_turn_id']:raise SystemExit(aid+':identity join')
  leaves.append({'assignment_id':aid,'agent_path':rec['agent_path'],'native_child_thread_id':native['native_child_thread_id'],'native_child_turn_id':native['native_child_turn_id'],'terminal_response_exact':'PMR1','result_file_sha256':common.sha_bytes(rr),'result_canonical_sha256':canonical_json.canonical_sha256_from_buffer(rr),'receipt_file_sha256':common.sha_bytes(pr),'receipt_canonical_sha256':canonical_json.canonical_sha256_from_buffer(pr),'output_tree_sha256':rec['output_tree_sha256'],'activation_core_file_sha256':ACTUAL_CORE,'activation_envelope_file_sha256':ACTUAL_ENV})
 cap={'schema_version':'external-research-native-capture-v7.1','attempt_id':'attempt-0007','controller_thread_id':common.CONTROLLER_THREAD_ID,'assignment_count':2,'native_state_path':str(a.native_state),'native_state_file_sha256':a.sha256,'digest_semantics_version':'raw-file-and-canonical-object-explicit-v7.1','leaves':leaves,'coverage_credit':0,'research_credit':0,'promotion_credit':0,'spec_credit':0,'merge_credit':0}
 errs=common.draft_errors(cap,common.load(BASE/'external_research_native_capture_v7_1.schema.json'))
 if errs:raise SystemExit(json.dumps({'status':'fail_closed','errors':errs},indent=2))
 common.write_exclusive(common.capture_path(),cap);print(json.dumps({'status':'pass','capture_path':str(common.capture_path())},sort_keys=True))
if __name__=='__main__':main()
