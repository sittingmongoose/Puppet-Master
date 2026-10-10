#!/usr/bin/env python3
"""Actual immutable GitHub metadata/content readback, publication mechanics only."""
import argparse,base64,hashlib,json,subprocess,datetime
from pathlib import Path
REPO='sittingmongoose/Puppet-Master'
PREFIX='reports/external-research-v12-20261010/'
EMAIL='42017982+sittingmongoose@users.noreply.github.com'
def api(path):
    p=subprocess.run(['gh','api',f'repos/{REPO}/'+path],check=True,capture_output=True)
    return json.loads(p.stdout)
def main():
    a=argparse.ArgumentParser();a.add_argument('--commit',required=True);a.add_argument('--report',type=Path,required=True);a.add_argument('--output',type=Path,required=True);a.add_argument('--cleanup',action='store_true');x=a.parse_args()
    if x.output.exists():raise ValueError('unique readback record required')
    x.output.mkdir(parents=True)
    ref=api('git/ref/heads/research/er12-20261010')
    if ref['object']['sha']!=x.commit:raise ValueError('actual branch head differs')
    commit=api('git/commits/'+x.commit)
    for k in ('author','committer'):
        if commit[k]['email']!=EMAIL:raise ValueError('private or unexpected commit identity')
    tree=api('git/trees/'+commit['tree']['sha']+'?recursive=1')
    if tree['truncated']:raise ValueError('full GitHub tree truncated')
    blobs={n['path']:n for n in tree['tree'] if n['type']=='blob' and n['path'].startswith(PREFIX)}
    local={PREFIX+str(p.relative_to(x.report)):p for p in x.report.rglob('*') if p.is_file()}
    if set(blobs)!=set(local):raise ValueError('actual public blob coverage differs')
    for name,p in local.items():
        b=p.read_bytes();h=hashlib.sha1(b'blob '+str(len(b)).encode()+b'\0'+b).hexdigest()
        if h!=blobs[name]['sha']:raise ValueError('GitHub tree blob differs: '+name)
    selected=['README.md','analysis/FINAL/analysis.md','RESULTS.json','provenance/FINAL_WHITELIST.json','provenance/FINAL_METHOD_CASE_VERSION_MAP.json','mechanics/FINAL_SCIENCE_FREEZE.json','mechanics/results-table-final/table.json','runs/D-R2-03/treatment/stages/reviser/final.md','assessment/D-R2-03/treatment-v1/assessment.md','mechanics/D-R1-03-treatment-MISSING_FINAL.json','recipes/materialize-v3/README.md','recipes/materialize-v3/ROOT_VERIFICATION.json']
    if x.cleanup:selected+=['CLEANUP.md','provenance/CLEANUP_FINAL.json']
    contents=[]
    for rel in selected:
        name=PREFIX+rel
        if name not in blobs:raise ValueError('required readback file missing: '+name)
        raw=api('git/blobs/'+blobs[name]['sha']);b=base64.b64decode(raw['content'])
        if b!=local[name].read_bytes():raise ValueError('actual contents differ: '+name)
        contents.append({'path':name,'bytes':len(b),'sha256':hashlib.sha256(b).hexdigest(),'actual_api':'git/blobs/'+blobs[name]['sha'],'byte_equal':True})
    for name,obj in [('REF.json',ref),('COMMIT.json',commit),('TREE.json',tree)]:
        (x.output/name).write_text(json.dumps(obj,indent=2)+'\n')
    r={'schema':'er12.actual-github-readback.v1','observed_at_utc':datetime.datetime.now(datetime.timezone.utc).isoformat(),'actual_branch':'research/er12-20261010','commit':x.commit,'immutable_url':f'https://github.com/{REPO}/blob/{x.commit}/{PREFIX}README.md','actual_branch_sha_matches':True,'author_and_committer_noreply':True,'recursive_tree_truncated':False,'public_blob_count':len(blobs),'all_public_blob_hashes_match':True,'actual_content_readbacks':contents,'cleanup_included':x.cleanup,'raw_api_records':str(x.output),'all_remote_file_bodies_downloaded':False}
    (x.output/'VERIFIED.json').write_text(json.dumps(r,indent=2)+'\n');print(json.dumps(r))
if __name__=='__main__':main()
