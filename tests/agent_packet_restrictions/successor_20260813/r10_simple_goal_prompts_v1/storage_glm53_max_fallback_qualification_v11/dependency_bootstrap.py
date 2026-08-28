#!/usr/bin/env python3
"""Stdlib-only Git-object bootstrap for the closed V7 dependency root."""
from __future__ import annotations
import atexit, hashlib, json, os, stat, subprocess, sys
from pathlib import Path

HERE=Path(__file__).resolve().parent
REPO=HERE.parents[4]
COMMIT="c71705e045480f7a73a0d7449d0cf7df048a9bc9"
TREE="facc375e2335350d557eb9e51ccd0b076bbdba00"
PREFIX="tests/agent_packet_restrictions/successor_20260813/r10_simple_goal_prompts_v1/system_pipeline_sandbox_v7"
BASE=Path("/tmp/pm-r10-storage-v11-dependencies-a91d773a5e264c8182a0bfc91e71d40b")
ROOT=BASE/PREFIX
ROSTER_SHA256="30138176b7cb5d3ba9b6071af6b9b7df2a1f0a33a56d96d7d80e9e9c94b188e3"
CONTENT_ROSTER_SHA256="4e8e5bfd875c45562eb83086c86683dc08ff0468eb2c4336696d7628befa84e8"
FILES=(
("ARCHITECTURE.md","100644","8159a92c97d0518d1b4a5f0255ad0f3fda6fbc7e",8832,"31d8ce7bab020f31f6e3058a5d9bf9c2ed37f0aa60f776e953e3678b269d4bff"),
("README.md","100644","42af9af15eb8076bb4d6a1a9b56061faa5977d81",3748,"67c9e1857363fa0a2be3fe382a4ea15f8c565ce7f69babb7ea7ab175b0e1fa01"),
("freeze_check.py","100644","641c45759bf276e2589abe7a57b49ebeff0efc28",1788,"170680502462ac6066077dcd43ab69b1838e986cc268590d9784bea3520a452e"),
("host_outputs/acceptance_units.jsonl","100644","7883acbade88ac4ce36c9f4a097d0e753eff8d3a",710989,"fdaf1175c68606d0136b062f4ad5a7dad18242429cda6e05f0afcf75b8c0550f"),
("host_outputs/canonical_recomputed_node_readiness_report.json","100644","d181eaea628da56ef72e081ea47b258091e68533",1083415,"088a07e68cc433dd47724d3d64ec1d8a05177e9dcea8d189ea7028e9ec020b18"),
("host_outputs/capsule.json","100644","e5b8fc1493a1386db0aabf15996d1e762627faa3",2909,"1d384296b6b8e648915281b2ffdeb1bdfdfb991e3525ff10809badc1ebd003ca"),
("host_outputs/comparison_report.json","100644","aaaac4b133a36843db55359fb98fca5b4bcda80f",1013,"888cf95f45e33a3805c78148b133a7f4aa4a55cb2fffcc495f3454593fa99e74"),
("host_outputs/coverage_report.json","100644","12dd02126142d52357f35f567bf4bf4fa777e0bb",958,"1c47f81685e940462b1b98d6258025ca5160f42ea5c3ebd11c72424ebea3a134"),
("host_outputs/doc_cards.json","100644","05507f91dc91598691995bb66291a58cb561ca0c",13318,"a63176d8f6785437159fef7368fcac11cf3c3c9b89306b420d28f39f17cab568"),
("host_outputs/metrics.json","100644","cce7a97cabaddfd8fc2e04b65b740e04ca8cc8d9",541,"27dd7279db34354f1720c618011ffc36b7043a60681cae411c4b6f3aa470fe3a"),
("host_outputs/node_readiness_report.json","100644","66a88e131a8b7c5fa215b06cedf35959aed6f2e7",964,"a5530f5895d1b82ace286a6c4731f90db6a6830a2de6953d17ebbb545b25678b"),
("host_outputs/pipeline_report.json","100644","d46e44d8d671d2f3ab483619a246b1426e33028e",1287,"337fe8f46416f21e28dcf9cb73de6409bcaddfbd0508a7e6078b6aed214dd2d1"),
("host_outputs/plan_units.jsonl","100644","d6f3e6ca99654c86aa23cc4e75c218b57528ae86",696250,"540cd5e7a0a2b0f7e131fe5cfb92677dff303dc3621b691278a4d214af454bda"),
("host_outputs/scoped_dependencies.json","100644","81ef3b739ed30a094cbeee5b8a2f448dfe738a03",138353,"cdefe5297b963f48b52e65dd43f461a50741b4a6c1b5114b92014cf3f52292df"),
("launch_plan.json","100644","10776f41865942c89e3e020c5b0bf9b5661644cc",14899,"891de844cb697d3207d49b63d5c04f907950d0ffe373deadf27e2de78fc5d247"),
("matrix.json","100644","47a2b63df965fae5c826c4aba0ee40c7a8881d9d",2370,"70adc74155e652808d1c9ede781698c3f5675a58e094e8b3a0d93ce9e827957e"),
("omp_row_runner.py","100644","f8ded70b04acc9497bfb983023cb15182b278010",41009,"decb8c826419945a2d892490b473b20ea1353093eb2b3c9bb52286673338afb1"),
("omp_session.py","100644","a51947c83e0bfdc2b231819e6a9a0fba2510218c",37909,"1a578d20678b7d360d0bafdc94c26661ea9f4ae2318e97ba1f67e6a1a6f9280e"),
("oracle.json","100644","4fdb09a66be20e26640905ecc3d6e985fa6c607e",407,"f11f136b271d739e8b1108cce38ab52dbd0258357f9a591da1c5c1ba69e36bdf"),
("pipeline.py","100644","525c11585b6042289a17287d100e7a3f60dc2c9e",29419,"e240db07e8de31f7fa7294c5f722b9a63b90f634a86d00fe976deee63a8e1708"),
("prompts/codex.prompt.txt","100644","ce2210ce95713a4aafd04a09701c682cd09291a5",3050,"15242f325366e8f66e485ca80f03d239c0ab2b6d1e450e08e77d888ef5d14c38"),
("prompts/omp.prompt.txt","100644","bdb6707283dc2f88f18cdf1adf88152d94a33f24",3036,"eff40a61579a080ce6e21bb71bcae2dd0640c100c9d61c199f45ac5dece43638"),
("response.schema.json","100644","f8b9c6211d9c8692b73a2d91949cf195f566b0cb",1142,"64484356c062ddda98385c35dfa51328744a8a5b36320df4bb24e9852a6aca97"),
("runtime_manifest.json","100644","da183fc8fb1016feeddc32a06850dcc9558a976e",1335,"56943ce8625c6ce7e3d621323d382d8db8f10f2b8f2c0970193ca97f89d726ba"),
("selftest.py","100644","c6074789e3a16960605af540dd773d7854f36909",58033,"fb47411b2db6db849c54290604ab28ae6076d9b5b99cb3003fb33839c1e23b5a"),
("source_manifest.json","100644","c8971f7b129c7772bf63a4430d15e0a5e5f3391a",3171,"b4950627ff8b4d417325dadb3a0099065253970b0bca1c6a5d2997669ba88b9d"),
("verify_matrix.py","100644","0ba24c93bcefa1889fb59cbbd70461c8f4c05448",35041,"e6ecb3deb51643f7ee2b4785b30272169dbaaba924a3a87e4bb7acfec1a389f8"),
("freeze_manifest.json","100644","beb93118f2393985d5d0ccea420e384a602c2e44",4443,"cb5f6500ea1d2bc95bd13dcf5d329146c1929b3e8740d0a1114464f4f81412a3"),)
MODULES=("freeze_check","omp_row_runner","omp_session","pipeline","verify_matrix")
_RECEIPT=None

def _run(*args:str, binary:bool=False):
    return subprocess.run(["git","-C",str(REPO),*args],capture_output=True,check=False,text=not binary)
def _sha(raw:bytes)->str: return hashlib.sha256(raw).hexdigest()
def _records(): return [{"path":p,"mode":m,"blob":b,"bytes":n,"sha256":s} for p,m,b,n,s in FILES]
def _digests(records:list[dict])->tuple[str,str]:
    roster="".join(json.dumps(item,sort_keys=True,separators=(",",":"))+"\n" for item in records).encode()
    content=b"".join((item["path"]+"\0"+item["sha256"]+"\0"+str(item["bytes"])+"\n").encode() for item in records)
    return _sha(roster),_sha(content)
def _cleanup_tree()->None:
    def remove(path:Path)->None:
        mode=os.lstat(path).st_mode
        if not stat.S_ISDIR(mode): os.unlink(path); return
        flags=os.O_RDONLY|getattr(os,"O_NOFOLLOW",0)
        descriptor=os.open(path,flags|getattr(os,"O_DIRECTORY",0)); os.fchmod(descriptor,0o700); os.close(descriptor)
        for entry in os.scandir(path): remove(Path(entry.path))
        os.rmdir(path)
    if os.path.lexists(BASE): remove(BASE)
def cleanup()->None:
    global _RECEIPT
    _cleanup_tree(); _RECEIPT=None
def _git_blob(record:dict)->bytes:
    relative=f"{PREFIX}/{record['path']}"; listing=_run("ls-tree",COMMIT,"--",relative)
    lines=listing.stdout.splitlines();
    if listing.returncode or len(lines)!=1: raise RuntimeError("dependency Git entry")
    metadata,seen=lines[0].split("\t",1); mode,kind,blob=metadata.split()
    if (seen,mode,kind,blob)!=(relative,record["mode"],"blob",record["blob"]): raise RuntimeError("dependency Git metadata")
    result=_run("cat-file","blob",blob,binary=True); raw=result.stdout
    if result.returncode or len(raw)!=record["bytes"] or _sha(raw)!=record["sha256"]: raise RuntimeError("dependency Git blob")
    return raw
def _receipt()->dict:
    return {"schema_id":"pm.r10.storage_pipeline.dependency_snapshot.v10","commit":COMMIT,"tree_oid":TREE,"root":str(ROOT),"file_count":28,"files":_records(),"roster_sha256":ROSTER_SHA256,"content_roster_sha256":CONTENT_ROSTER_SHA256,"git_objects_only":True,"live_tree_reads":0,"directory_mode":"0555","regular_mode":"0444","executable_mode":"0555"}
def verify()->dict:
    if _RECEIPT is None or _RECEIPT!=_receipt(): raise RuntimeError("dependency receipt unavailable")
    if len(FILES)!=28 or _digests(_records())!=(ROSTER_SHA256,CONTENT_ROSTER_SHA256): raise RuntimeError("dependency roster digests")
    tree=_run("rev-parse",f"{COMMIT}:{PREFIX}")
    if tree.returncode or tree.stdout.strip()!=TREE: raise RuntimeError("dependency tree custody")
    if not ROOT.is_dir() or ROOT.is_symlink() or stat.S_IMODE(ROOT.stat().st_mode)!=0o555: raise RuntimeError("dependency root custody")
    expected={r["path"] for r in _RECEIPT["files"]}; actual=set()
    for path in ROOT.rglob("*"):
        if path.is_symlink(): raise RuntimeError("dependency symlink")
        relative=path.relative_to(ROOT).as_posix()
        if path.is_file():
            actual.add(relative); record=next((r for r in _RECEIPT["files"] if r["path"]==relative),None)
            if record is None or stat.S_IMODE(path.stat().st_mode)!=(0o555 if record["mode"]=="100755" else 0o444): raise RuntimeError("dependency file mode/roster")
            raw=path.read_bytes()
            if len(raw)!=record["bytes"] or _sha(raw)!=record["sha256"] or _git_blob(record)!=raw: raise RuntimeError("dependency file custody")
        elif not path.is_dir() or stat.S_IMODE(path.stat().st_mode)!=0o555: raise RuntimeError("dependency directory custody")
    if actual!=expected: raise RuntimeError("dependency exact roster")
    return _RECEIPT
def materialize()->dict:
    global _RECEIPT
    if _RECEIPT is not None or os.path.lexists(BASE): raise RuntimeError("fresh dependency root required")
    if any(name in sys.modules for name in MODULES): raise RuntimeError("preloaded dependency module")
    tree=_run("rev-parse",f"{COMMIT}:{PREFIX}")
    if tree.returncode or tree.stdout.strip()!=TREE: raise RuntimeError("pinned dependency tree")
    try:
        ROOT.mkdir(mode=0o700,parents=True)
        for record in _records():
            target=ROOT/record["path"]; target.parent.mkdir(mode=0o700,parents=True,exist_ok=True)
            with target.open("xb") as handle: handle.write(_git_blob(record))
            os.chmod(target,0o555 if record["mode"]=="100755" else 0o444)
        for directory,dirs,files in os.walk(BASE,topdown=False): os.chmod(directory,0o555)
        _RECEIPT=_receipt(); return verify()
    except BaseException:
        _cleanup_tree(); _RECEIPT=None; raise
def verified_root()->Path:
    verify(); return ROOT
def verify_modules()->None:
    root=verified_root().resolve()
    for name in MODULES:
        module=sys.modules.get(name); path=Path(getattr(module,"__file__","")).resolve()
        if module is None or root not in path.parents or path.name!=name+".py": raise RuntimeError("dependency module origin")
        record=next(r for r in _records() if r["path"]==name+".py")
        if _sha(path.read_bytes())!=record["sha256"]: raise RuntimeError("dependency module blob")
atexit.register(cleanup)
