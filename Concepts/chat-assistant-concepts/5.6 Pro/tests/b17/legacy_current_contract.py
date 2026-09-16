#!/usr/bin/env python3
"""Hash-pinned current-owner adaptations of TWO retained historical tests.

Never edits the retained corpus or application. The external scratch copy changes:
B01: safe-stop expects Building… + Paused until a new revision is accepted.
B02: prove approved-tree immutability, then inject a detached corrupt binding to
exercise the original stale-hash refusals. No refusal assertion is removed.
The receipt records every change and all original hashes; fails on unknown source.
"""
from __future__ import annotations
import argparse, difflib, hashlib, json, shutil, subprocess, sys, time
from pathlib import Path

ROOT = Path(__file__).resolve().parents[2]
EXPECTED = {
    'regression-batch1.py': '90b5ce14c1cf3e4b6beba9d5f2759eff644503aebe5e0b5b2379e93b14af60a9',
    'regression-batch2.py': '6ec21f9e5921e6850dc30990e70697ec593c80228d4006e119ce5feada082e5d',
}
PIN = 'b66529d97e8c90c13b17dcfed52653a80908c543'
def digest(data: bytes) -> str:
    return hashlib.sha256(data).hexdigest()

def replace_once(text: str, old: str, new: str) -> str:
    if text.count(old) != 1:
        raise ValueError('Expected exactly one source span; historical test changed')
    return text.replace(old, new, 1)

def adapt(name: str, raw: bytes) -> bytes:
    if digest(raw) != EXPECTED[name]:
        raise ValueError(f'Unknown historical source: {name}; review before adapting')
    text = raw.decode('utf-8')
    if name == 'regression-batch1.py':
        text = replace_once(text,
            "check('Manual stop enters ready',pg.evaluate('(id)=>PM56_PLANS.get(id).status',pid)=='ready')",
            "check('Manual stop keeps Building until a revision is accepted',pg.evaluate('(id)=>PM56_PLANS.get(id).status',pid)=='building')\n"
            " check('Stopped V1 has Paused secondary truth and exact revision target',pg.evaluate('''id=>{const p=PM56_PLANS.get(id),a=PM56_PLANS.attention(id);return a.line==='Paused'&&p.revisionStop.version===1&&p.revisionStop.plan_run_id===p.approved.plan_run_id&&p.revisionStop.epoch===p.runEpoch;}''',pid))")
    else:
        helper = """def corrupt_detached_revision(page,suffix):
 # Test-only corruption. Prove the supported object resists in-place mutation
 # before replacing a detached reference at the explicit fault-injection seam.
 result=page.evaluate('''suffix=>{const p=PM56_PLANS.get(PM56_SCHEDULE_DEMOS.snapshot().planId),before=JSON.stringify(p.revisions[1]),frozen=Object.isFrozen(p.revisions[1])&&Object.isFrozen(p.revisions[1][1]);try{p.revisions[1][1].text+=suffix;}catch(_){}const unchanged=JSON.stringify(p.revisions[1])===before;const copy=JSON.parse(before);copy[1].text+=suffix;p.revisions={...p.revisions,1:copy};return {frozen,unchanged,injected:JSON.stringify(p.revisions[1])!==before};}''',suffix)
 check('Approved revision rejects in-place mutation before detached fault',result['frozen'] and result['unchanged'],result)
 check('Detached stale binding is actually injected',result['injected'],result)

"""
        text = replace_once(text, 'def due(page,offset=0,revision=None):', helper+'def due(page,offset=0,revision=None):')
        text = replace_once(text,
            '''page.evaluate("PM56_PLANS.get(PM56_SCHEDULE_DEMOS.snapshot().planId).revisions[1][1].text+=' Changed outside draft.'")''',
            "corrupt_detached_revision(page,' Changed outside draft.')")
        text = replace_once(text,
            '''page.evaluate("PM56_PLANS.get(PM56_SCHEDULE_DEMOS.snapshot().planId).revisions[1][1].text+=' same version, new bytes'")''',
            "corrupt_detached_revision(page,' same version, new bytes')")
    return text.encode('utf-8')

def prepare(source: Path, out: Path) -> Path:
    source, out = source.resolve(), out.resolve()
    if source == out or source in out.parents:
        raise ValueError('Scratch and evidence must be outside concept source')
    if out.exists():
        raise FileExistsError('Use a fresh scratch output path')
    original = {name:(source/'tests/b10/qa'/name).read_bytes() for name in EXPECTED}
    adapted = {name:adapt(name,raw) for name,raw in original.items()}
    files = {}
    for p in sorted(source.rglob('*')):
        if p.is_symlink():
            raise ValueError(f'Symlink in source: {p}')
        if p.is_file() and '__pycache__' not in p.parts and p.suffix not in {'.pyc','.pyo'}:
            files[p.relative_to(source).as_posix()] = digest(p.read_bytes())
    dest = out/'repo/Concepts/chat-assistant-concepts/5.6 Pro'
    for rel in files:
        target=dest/rel;target.parent.mkdir(parents=True,exist_ok=True);shutil.copyfile(source/rel,target)
    edits=[]
    for name,data in adapted.items():
        rel='tests/b10/qa/'+name;(dest/rel).write_bytes(data)
        edits.append({'path':rel,'original_sha256':digest(original[name]),'adapted_sha256':digest(data),
            'diff': ''.join(difflib.unified_diff(original[name].decode().splitlines(True),data.decode().splitlines(True),fromfile='retained/'+name,tofile='scratch-current-contract/'+name))})
    changed={x['path'] for x in edits}
    for rel,sha in files.items():
        if rel not in changed and digest((dest/rel).read_bytes())!=sha:
            raise ValueError('Copy changed an unadapted file: '+rel)
    receipt={'status':'prepared_not_executed','repository_pin':PIN,'source_files':files,
        'source_unchanged':all(digest((source/rel).read_bytes())==sha for rel,sha in files.items()),
        'html_sha256':digest((dest/'index.html').read_bytes()),'edits':edits,
        'owner_refs':['Plans/Assistant_Plan_Runtime.md#PFAIL-001..009','Plans/Assistant_Plan_Runtime.md#PDET-004..008'],
        'scope':'Only exact two historical test adaptations. Application source/HTML unchanged; no assertion removed. Native and formal audit not claimed.'}
    (out/'ADAPTATION.json').write_text(json.dumps(receipt,indent=2)+'\n')
    return dest

def main() -> int:
    ap=argparse.ArgumentParser(description=__doc__);ap.add_argument('--source',type=Path,default=ROOT);ap.add_argument('--outdir',type=Path,required=True);ap.add_argument('--prepare-only',action='store_true');args=ap.parse_args()
    dest=prepare(args.source,args.outdir);out=args.outdir.resolve()
    if args.prepare_only:
        print(dest);return 0
    qa=out/'qa';qa.mkdir()
    r={'status':'running','html_sha256':digest((dest/'index.html').read_bytes()),'commands':[],'adaptation':'ADAPTATION.json'}
    def save(): (out/'RESULT.json').write_text(json.dumps(r,indent=2)+'\n')
    save()
    for name in EXPECTED:
        shutil.copyfile(dest/'tests/b10/qa'/name,qa/name);start=time.monotonic()
        with (out/(name+'.log')).open('w') as log:
            try:p=subprocess.run([sys.executable,str(qa/name)],cwd=out,stdout=log,stderr=log,timeout=360);code=p.returncode
            except subprocess.TimeoutExpired:code=124
        r['commands'].append({'name':name,'exit_code':code,'seconds':time.monotonic()-start});save()
    r['html_unchanged']=digest((dest/'index.html').read_bytes())==r['html_sha256']
    r['status']='pass' if all(x['exit_code']==0 for x in r['commands']) and r['html_unchanged'] else 'fail';save();print(json.dumps(r));return 0 if r['status']=='pass' else 1
if __name__=='__main__':raise SystemExit(main())
