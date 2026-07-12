#!/usr/bin/env python3
from __future__ import annotations
import argparse,importlib.util,json,os,sys
from pathlib import Path
BASE=Path(__file__).resolve().parent;NS=BASE.parents[1];sys.path.insert(0,str(NS/'tools'));sys.path.insert(0,str(BASE))
import canonical_json,common,result_validator_v7_2 as RV
S=importlib.util.spec_from_file_location('v7',NS/'tools/write_positive_receipt.py');V7=importlib.util.module_from_spec(S);S.loader.exec_module(V7)
ACT={'core':'043488cb83d6064068a887d484f22d19d6c158a2bc1d424798ed9611c9f58c83','ER-0003':'a0cf53b81fe654c3cc460682da7ae6ae28dc6cca90d8e0f338258d596bc4e5c8','ER-0008':'34b9261297844b43aba855bed802a56f06f68596f81fc51295322a6bfd9e31f1','envelope':'3dab3e76f915889be2c65710477ab1c860f42d57d34d836a3311bd93255ab406'}
EMB={'core':'a12b9b867532f5ed887fe44fbdabfd530a603cdef2ddae1a53cb74f8e99b0b88','ER-0003':'455b640d680f85b0d0d23622f87ca79ecfa34d49b8728bf549656b80a52f833b','ER-0008':'d8d8a035f4f8f6b0951993de39aa0511396e412ec15932f46defeec6c54bce40'}
def target(aid,fixture):
 if fixture:
  root=Path(fixture).resolve();allowed=(BASE/'fixture-sandbox').resolve()
  if os.environ.get('AUDIT005_V7_2_FIXTURE_MODE')!='1' or allowed not in [root,*root.parents]:raise SystemExit('fixture mode/path forbidden')
  root.mkdir(parents=True,exist_ok=True);return root/f'{aid}-dispatch_receipt.json'
 return common.receipt_path(aid)
def main():
 ap=argparse.ArgumentParser();ap.add_argument('--assignment-id',choices=common.RECOVERY_IDS,required=True);ap.add_argument('--terminal-proof',type=Path,required=True);ap.add_argument('--terminal-proof-sha256',required=True);ap.add_argument('--fixture-root');a=ap.parse_args();aid=a.assignment_id
 core=common.load(common.core_path());auth=common.load(common.authorization_path(aid));env=common.load(common.envelope_path());actual_core=common.sha(common.core_path());actual_auth=common.sha(common.authorization_path(aid));actual_env=common.sha(common.envelope_path())
 if (actual_core,actual_auth,actual_env)!=(ACT['core'],ACT[aid],ACT['envelope']):raise SystemExit('activation raw file drift')
 if common.canonical_sha(core)!=EMB['core'] or common.canonical_sha(auth)!=EMB[aid]:raise SystemExit('historical canonical digest drift')
 if auth.get('activation_core_sha256')!=EMB['core'] or env.get('activation_core_sha256')!=EMB['core']:raise SystemExit('embedded core digest drift')
 erow=next(x for x in env['authorization_files'] if x['assignment_id']==aid)
 if erow.get('sha256')!=EMB[aid]:raise SystemExit('embedded authorization digest drift')
 assignment=next(x for x in common.load(NS/'manifest.json')['assignments'] if x['assignment_id']==aid);raw=common.result_path(aid).read_bytes();value,file_sha,canonical_sha,errors=RV.validate_result_buffer_v7_2(raw,assignment,core,auth,actual_core,actual_auth);proof=common.load(a.terminal_proof);errors+=V7.terminal_proof_errors(proof,aid,file_sha);inventory=common.output_tree_inventory(common.output_dir(aid));tree=common.canonical_sha(inventory)
 if [x['relative_path'] for x in inventory]!=['result.json']:errors.append('output-tree:not-exactly-result-json')
 if errors:raise SystemExit(json.dumps({'status':'fail_closed','errors':sorted(set(errors))},indent=2))
 rec=V7.build_receipt(assignment,core,auth,env,proof,a.terminal_proof,a.terminal_proof_sha256,file_sha,canonical_sha,len(raw),tree);rec.update({'schema_version':'external-research-dispatch-receipt-v7.2','digest_semantics_version':'raw-file-and-canonical-object-explicit-v7.2','activation_core_file_sha256':actual_core,'activation_core_object_canonical_sha256':common.canonical_sha(core),'activation_core_historical_embedded_pre_final_canonical_sha256':EMB['core'],'activation_core_historical_embedded_canonical_sha256':EMB['core'],'leaf_dispatch_authorization_file_sha256':actual_auth,'leaf_dispatch_authorization_object_canonical_sha256':common.canonical_sha(auth),'leaf_dispatch_authorization_historical_embedded_pre_final_canonical_sha256':EMB[aid],'leaf_dispatch_authorization_historical_embedded_canonical_sha256':EMB[aid],'activation_envelope_file_sha256':actual_env,'activation_envelope_object_canonical_sha256':common.canonical_sha(env),'isolated_result_validator_sha256':common.sha(BASE/'result_validator_v7_2.py'),'stale_common_result_errors_called':False,'phase_order_mismatch_reconciled_without_restamp':True})
 errs=common.draft_errors(rec,common.load(BASE/'external_research_dispatch_receipt_v7_2.schema.json'))
 if errs:raise SystemExit(json.dumps({'status':'fail_closed','errors':errs},indent=2))
 if common.result_path(aid).read_bytes()!=raw or common.output_tree_sha256(common.output_dir(aid))!=tree:raise SystemExit('TOCTOU prewrite')
 out=target(aid,a.fixture_root);common.write_exclusive(out,rec)
 if common.result_path(aid).read_bytes()!=raw or common.output_tree_sha256(common.output_dir(aid))!=tree:raise SystemExit('TOCTOU postwrite')
 print(json.dumps({'status':'pass','assignment_id':aid,'receipt_path':str(out),'result_file_sha256':file_sha,'result_canonical_sha256':canonical_sha},sort_keys=True))
if __name__=='__main__':main()
