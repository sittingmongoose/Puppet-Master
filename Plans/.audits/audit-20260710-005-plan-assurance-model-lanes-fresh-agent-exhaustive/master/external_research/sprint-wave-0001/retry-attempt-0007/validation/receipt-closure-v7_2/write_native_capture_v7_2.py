#!/usr/bin/env python3
from __future__ import annotations
import argparse,json,os,sys
from pathlib import Path
BASE=Path(__file__).resolve().parent;NS=BASE.parents[1];sys.path.insert(0,str(NS/'tools'))
import canonical_json,common
def paths(aid,fixture):return (Path(fixture)/f'{aid}-dispatch_receipt.json') if fixture else common.receipt_path(aid)
def main():
 ap=argparse.ArgumentParser();ap.add_argument('--native-state',type=Path,required=True);ap.add_argument('--sha256',required=True);ap.add_argument('--fixture-root');a=ap.parse_args()
 if common.sha(a.native_state)!=a.sha256:raise SystemExit('native state drift')
 if a.fixture_root:
  root=Path(a.fixture_root).resolve();allowed=(BASE/'fixture-sandbox').resolve()
  if os.environ.get('AUDIT005_V7_2_FIXTURE_MODE')!='1' or allowed not in [root,*root.parents]:raise SystemExit('fixture forbidden')
  out=root/'native_capture.json'
 else:out=common.capture_path()
 state=common.load(a.native_state);leaves=[]
 for native in state['leaves']:
  aid=native['assignment_id'];rp=paths(aid,a.fixture_root);rr=common.result_path(aid).read_bytes();pr=rp.read_bytes();rec=common.parse_standard_exact(pr)
  if rec.get('schema_version')!='external-research-dispatch-receipt-v7.2' or rec.get('native_child_thread_id')!=native['native_child_thread_id'] or rec.get('native_child_turn_id')!=native['native_child_turn_id']:raise SystemExit(aid+':receipt/native join')
  leaves.append({'assignment_id':aid,'agent_path':rec['agent_path'],'native_child_thread_id':native['native_child_thread_id'],'native_child_turn_id':native['native_child_turn_id'],'terminal_response_exact':'PMR1','result_file_sha256':common.sha_bytes(rr),'result_object_canonical_sha256':canonical_json.canonical_sha256_from_buffer(rr),'receipt_file_sha256':common.sha_bytes(pr),'receipt_object_canonical_sha256':canonical_json.canonical_sha256_from_buffer(pr),'output_tree_sha256':rec['output_tree_sha256'],'activation_core_file_sha256':rec['activation_core_file_sha256'],'activation_core_object_canonical_sha256':rec['activation_core_object_canonical_sha256'],'leaf_dispatch_authorization_file_sha256':rec['leaf_dispatch_authorization_file_sha256'],'leaf_dispatch_authorization_object_canonical_sha256':rec['leaf_dispatch_authorization_object_canonical_sha256']})
 cap={'schema_version':'external-research-native-capture-v7.2','attempt_id':'attempt-0007','controller_thread_id':common.CONTROLLER_THREAD_ID,'assignment_count':2,'native_state_path':str(a.native_state),'native_state_file_sha256':a.sha256,'digest_semantics_version':'raw-file-and-canonical-object-explicit-v7.2','leaves':leaves,'coverage_credit':0,'research_credit':0,'promotion_credit':0,'spec_credit':0,'merge_credit':0}
 errs=common.draft_errors(cap,common.load(BASE/'external_research_native_capture_v7_2.schema.json'))
 if errs:raise SystemExit(json.dumps({'status':'fail_closed','errors':errs},indent=2))
 common.write_exclusive(out,cap);print(json.dumps({'status':'pass','capture_path':str(out)},sort_keys=True))
if __name__=='__main__':main()
