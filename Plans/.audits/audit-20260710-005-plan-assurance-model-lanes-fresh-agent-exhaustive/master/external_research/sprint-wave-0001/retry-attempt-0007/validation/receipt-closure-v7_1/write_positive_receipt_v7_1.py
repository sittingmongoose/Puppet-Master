#!/usr/bin/env python3
from __future__ import annotations
import argparse,importlib.util,json,os,sys
from pathlib import Path
BASE=Path(__file__).resolve().parent;NS=BASE.parents[1];sys.path.insert(0,str(NS/'tools'))
import common
SPEC=importlib.util.spec_from_file_location('v7_writer',NS/'tools/write_positive_receipt.py');V7=importlib.util.module_from_spec(SPEC);SPEC.loader.exec_module(V7)
ACTUAL={'core':'043488cb83d6064068a887d484f22d19d6c158a2bc1d424798ed9611c9f58c83','ER-0003':'a0cf53b81fe654c3cc460682da7ae6ae28dc6cca90d8e0f338258d596bc4e5c8','ER-0008':'34b9261297844b43aba855bed802a56f06f68596f81fc51295322a6bfd9e31f1','envelope':'3dab3e76f915889be2c65710477ab1c860f42d57d34d836a3311bd93255ab406'}
EMBEDDED={'core':'a12b9b867532f5ed887fe44fbdabfd530a603cdef2ddae1a53cb74f8e99b0b88','ER-0003':'455b640d680f85b0d0d23622f87ca79ecfa34d49b8728bf549656b80a52f833b','ER-0008':'d8d8a035f4f8f6b0951993de39aa0511396e412ec15932f46defeec6c54bce40'}
def main():
 ap=argparse.ArgumentParser();ap.add_argument('--assignment-id',choices=common.RECOVERY_IDS,required=True);ap.add_argument('--terminal-proof',type=Path,required=True);ap.add_argument('--terminal-proof-sha256',required=True);a=ap.parse_args();aid=a.assignment_id
 core=common.load(common.core_path());auth=common.load(common.authorization_path(aid));env=common.load(common.envelope_path())
 if common.sha(common.core_path())!=ACTUAL['core'] or common.sha(common.authorization_path(aid))!=ACTUAL[aid] or common.sha(common.envelope_path())!=ACTUAL['envelope']:raise SystemExit('actual activation file drift')
 if auth.get('activation_core_sha256')!=EMBEDDED['core'] or env.get('activation_core_sha256')!=EMBEDDED['core']:raise SystemExit('historical embedded core digest drift')
 erow=next(x for x in env['authorization_files'] if x['assignment_id']==aid)
 if erow.get('sha256')!=EMBEDDED[aid]:raise SystemExit('historical embedded authorization digest drift')
 assignment=next(x for x in common.load(NS/'manifest.json')['assignments'] if x['assignment_id']==aid);raw=common.result_path(aid).read_bytes();result,file_sha,canonical_sha,errors=common.validate_result_buffer(raw,assignment,core,auth);proof=common.load(a.terminal_proof);errors+=V7.terminal_proof_errors(proof,aid,file_sha);inventory=common.output_tree_inventory(common.output_dir(aid));tree=common.canonical_sha(inventory)
 if [x['relative_path'] for x in inventory]!=['result.json']:errors.append('output-tree:not-exactly-result-json')
 if errors:raise SystemExit(json.dumps({'status':'fail_closed','errors':sorted(set(errors))},indent=2))
 rec=V7.build_receipt(assignment,core,auth,env,proof,a.terminal_proof,a.terminal_proof_sha256,file_sha,canonical_sha,len(raw),tree)
 rec.update({'schema_version':'external-research-dispatch-receipt-v7.1','activation_core_file_sha256':ACTUAL['core'],'activation_core_historical_embedded_canonical_sha256':EMBEDDED['core'],'leaf_dispatch_authorization_file_sha256':ACTUAL[aid],'leaf_dispatch_authorization_historical_embedded_canonical_sha256':EMBEDDED[aid],'activation_envelope_file_sha256':ACTUAL['envelope'],'digest_semantics_version':'raw-file-and-canonical-object-explicit-v7.1','phase_order_mismatch_reconciled_without_restamp':True})
 schema=common.load(BASE/'external_research_dispatch_receipt_v7_1.schema.json');errs=common.draft_errors(rec,schema)
 if errs:raise SystemExit(json.dumps({'status':'fail_closed','errors':errs},indent=2))
 if common.result_path(aid).read_bytes()!=raw:raise SystemExit('TOCTOU result mutation')
 common.write_exclusive(common.receipt_path(aid),rec);print(json.dumps({'status':'pass','assignment_id':aid,'receipt_path':str(common.receipt_path(aid))},sort_keys=True))
if __name__=='__main__':main()
