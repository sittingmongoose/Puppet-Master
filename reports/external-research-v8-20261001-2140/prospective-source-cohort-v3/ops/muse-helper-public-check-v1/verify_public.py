#!/usr/bin/env python3
"""verify_public.py: offline public evidence/declaration check only.
Verifies PUBLIC_EXPORT.json hashes and optional INPUT_MAP + manifest caps.
Does NOT replay native/runtime execution; does NOT assess research quality,
novelty, or correctness. Pass = files match hashes and declarations match caps."""
import argparse,hashlib,json,sys
from pathlib import Path
ROLES=("research-proposal","independent-candidate-critic","final-correction")
SECS=(1200,1200,900)
CAPS={"research_proposal_seconds":1200,"candidate_critic_seconds":1200,"final_correction_seconds":900,"summed_stage_hard_seconds":3300,"host_overhead_hard_seconds":300,"case_occupied_hard_seconds":5400}
def fail(m): print(f"FAIL: {m}",file=sys.stderr); raise SystemExit(1)
def safe_join(cohort,rel):
    if not isinstance(rel,str) or not rel or rel.startswith("/") or ".." in Path(rel).parts: fail(f"bad path: {rel!r}")
    cur=cohort
    for part in Path(rel).parts:
        cur=cur/part
        if cur.is_symlink(): fail(f"symlink: {rel!r}")
    r=(cohort/rel).resolve(); c=cohort.resolve()
    if r!=c and c not in r.parents: fail(f"escapes cohort: {rel!r}")
    return r
def verify_artifacts(cohort):
    try: doc=json.loads((cohort/"PUBLIC_EXPORT.json").read_text())
    except Exception as e: fail(f"PUBLIC_EXPORT unreadable: {e}")
    arts=doc.get("artifacts") if isinstance(doc,dict) else None
    if not isinstance(arts,list) or not arts: fail("no artifacts list")
    n=0
    for a in arts:
        if not isinstance(a,dict): fail("malformed artifact")
        rel,want=a.get("public_path"),a.get("public_sha256")
        if not isinstance(want,str) or len(want)!=64: fail(f"bad sha256: {rel!r}")
        p=safe_join(cohort,rel)
        if not p.is_file(): fail(f"missing: {rel!r}")
        if hashlib.sha256(p.read_bytes()).hexdigest().lower()!=want.lower(): fail(f"hash mismatch: {rel!r}")
        n+=1
    return n
def check_manifest(cohort,macro):
    if not isinstance(macro,str) or not macro.startswith("LAB_ROOT/"): fail(f"manifest must be LAB_ROOT/...: {macro!r}")
    try: m=json.loads(safe_join(cohort,macro[9:]).read_text())
    except SystemExit: raise
    except Exception as e: fail(f"manifest unreadable {macro!r}: {e}")
    st=m.get("stages")
    if not isinstance(st,list) or len(st)!=3: fail(f"stages!=3: {macro!r}")
    for s,role,sec in zip(st,ROLES,SECS):
        if not isinstance(s,dict) or not s.get("reservation_id","").endswith(role) or s.get("seconds")!=sec: fail(f"stage {role}: {macro!r}")
    caps=m.get("caps")
    if not isinstance(caps,dict): fail(f"missing caps: {macro!r}")
    for k,v in CAPS.items():
        if caps.get(k)!=v: fail(f"{k}!={v}: {macro!r}")
    if caps.get("case_wall_hard_seconds",caps.get("case_elapsed_hard_seconds"))!=3600: fail(f"wall/elapsed!=3600: {macro!r}")
    for k in ("research_response_cap","critic_response_cap","correction_response_cap"):
        if k in caps and caps[k]!=160: fail(f"{k}!=160: {macro!r}")
    return caps
def check_timing(cohort):
    imp=cohort/"dev/prospective-timing-v3/INPUT_MAP.json"
    if not imp.exists(): return None
    try: data=json.loads(imp.read_text())
    except Exception as e: fail(f"INPUT_MAP unreadable: {e}")
    items=data if isinstance(data,list) else next((data[k] for k in ("cases","assignments","case_assignments") if isinstance(data.get(k),list)),None) if isinstance(data,dict) else None
    if items is None:
        if isinstance(data,dict) and all(isinstance(v,dict) for v in data.values()): items=[{"case_id":k,**v} for k,v in data.items()]
        else: fail("malformed INPUT_MAP")
    if len(items)!=12: fail(f"need 12 cases, got {len(items)}")
    pairs={}
    for it in items:
        if not isinstance(it,dict): fail("malformed case")
        arm=it.get("arm",it.get("group",it.get("arm_name")))
        pid=it.get("pair_id",it.get("pair"))
        man=it.get("manifest",it.get("manifest_path",it.get("declaration",it.get("manifest_file"))))
        if arm not in ("control","treatment") or not pid or not man: fail(f"bad case: {it!r}")
        pairs.setdefault(pid,{})[arm]=check_manifest(cohort,man)
    if len(pairs)!=6 or any(set(v)!={"control","treatment"} for v in pairs.values()): fail("need 6 pairs x control/treatment")
    for pid,arms in pairs.items():
        if arms["control"]!=arms["treatment"]: fail(f"arm caps differ: {pid}")
    return True
def main():
    ap=argparse.ArgumentParser(description="verify public cohort (offline only)")
    ap.add_argument("cohort",type=Path); cohort=ap.parse_args().cohort
    if not cohort.is_dir(): fail("cohort dir missing")
    print(f"verified_artifacts={verify_artifacts(cohort)}")
    print("timing_declarations_ok: 12 cases, 6 pairs, caps 1200/1200/900" if check_timing(cohort) else "input_map_absent: artifact-hash verification only")
if __name__=="__main__": main()
