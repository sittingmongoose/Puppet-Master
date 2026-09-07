#!/usr/bin/env python3
"""Refresh derived planning currentness without changing product specifications or readiness.

Explicitly authorized by Jared on 2026-09-07 after Assistant v3 c998721.
Uses existing generators; historical evidence, ledgers and PNC-019 receipts stay immutable.
"""
from __future__ import annotations
import argparse, hashlib, importlib.util, json, subprocess, sys, time
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
BASE = 'c99872170dab69b46d82f0d0f0abb1e8d408fc1f'
OUT = ROOT / 'Plans/.audits/assistant-settings-v3/currentness-20260907'
LIVE = 'Plans/.evidence/pm7-usage-recovery-plan-sharding-2026-08-29/evidence.json'
GEN = str(Path(LIVE).with_name('shard_report.json'))
CHECK = str(Path(LIVE).with_name('shard-check-report.json'))
INDEX = ['Plans/.plan_index/' + n for n in ['plan_units.jsonl','doc_cards.json','dependencies.json','acceptance_units.jsonl','coverage_report.json','node_readiness_report.json']]

def digest(p): return hashlib.sha256(p.read_bytes()).hexdigest()
def read(p): return json.loads(p.read_text(encoding='utf-8'))
def dump(p, d):
    p.parent.mkdir(parents=True, exist_ok=True)
    p.write_text(json.dumps(d, indent=2, sort_keys=True, ensure_ascii=False)+'\n', encoding='utf-8')
def run(label, args, required=False, report=False):
    argv=[sys.executable, *args]
    rp=OUT/(label+'.json')
    if report: argv += ['--report', str(rp.relative_to(ROOT))]
    started=time.monotonic()
    p=subprocess.run(argv,cwd=ROOT,text=True,capture_output=True,timeout=1500)
    if not report:
        try: data=json.loads(p.stdout)
        except json.JSONDecodeError: data={'stdout':p.stdout,'stderr':p.stderr}
        dump(rp,data)
    row={'label':label,'command':[sys.executable.replace(sys.executable,'python3'),*argv[1:]],'exit_code':p.returncode,'seconds':round(time.monotonic()-started,3),'report':str(rp.relative_to(ROOT)),'report_sha256':digest(rp)}
    rows.append(row);dump(OUT/'command-results.json',rows)
    print(label, 'exit='+str(p.returncode), flush=True)
    if required and p.returncode: raise RuntimeError(label+' failed; inspect '+str(rp))
    return read(rp)

def failures(data):
    return [{'check':x.get('check',x.get('name',x.get('error'))),'path':x.get('path'),'error':x.get('error',x.get('reason'))} for x in data.get('failures',[])]

rows=[]
def main():
    ap=argparse.ArgumentParser();ap.add_argument('--full-gates',action='store_true');a=ap.parse_args()
    OUT.mkdir(parents=True,exist_ok=True)
    protected=[p for p in (ROOT/'Plans').glob('*.md')]
    protected += [p for name in ['ledgers','.pipeline','.implementation_readiness'] for p in (ROOT/'Plans'/name).rglob('*') if p.is_file()]
    modes=read(ROOT/'Plans/evidence_artifact_binding_modes.json')
    protected += [ROOT/e['path'] for e in modes['entries'] if e['mode']=='historical_snapshot' and (ROOT/e['path']).is_file()]
    before={str(p.relative_to(ROOT)):digest(p) for p in protected}
    prior_index={p:digest(ROOT/p) for p in INDEX}
    before_index=run('index-before',['scripts/pm-plan-index.py','validate'])
    run('lock-before',['scripts/pm-plans-verify.py','verify-spec-lock'],report=True)
    if a.full_gates: run('gates-before',['scripts/pm-plans-verify.py','run-gates'],report=True)
    generated=run('index-generate',['scripts/pm-plan-index.py','generate'],required=True)
    current=run('index-after',['scripts/pm-plan-index.py','validate'],required=True)
    readiness=read(ROOT/INDEX[-1]);rs=readiness['runtime_enablement_status']
    assert rs.get('runtime_enabled') is False and rs.get('ordinary_product_worknodes_allowed') is False
    assert readiness.get('nodeseed_candidates_created') is False
    run('shards-generate',['scripts/pm-shard-plans.py','--generate','--report',GEN],required=True)
    run('shards-check',['scripts/pm-shard-plans.py','--check','--report',CHECK],required=True)
    run('shard-evidence-sync',['scripts/pm-governance-seal.py','sync-plan-sharding-evidence','--evidence',LIVE,'--report',GEN],required=True)
    gr=read(ROOT/GEN);cr=read(ROOT/CHECK)
    assert gr['status']=='pass' and cr['status']=='pass' and cr.get('body_reconstruction_mismatches')==0
    # Mechanical report generation from successfully executed commands, not hand edits.
    ev=read(ROOT/LIVE);n=gr['source_count'];s=gr['shards_generated'];pu=current['summary']['plan_unit_count'];ac=current['summary']['acceptance_unit_count']
    ev['summary']=f'Live-current authorized Assistant v3 governance inventory: {n} source documents, {s} source-exact shards; {pu} PlanUnits and {ac} acceptance units. Runtime readiness remains blocked.'
    ev['reproducibility']={'snapshot_ref':BASE,'note':'Derived from the pinned accepted product specifications plus the named generators. Historical evidence remains immutable. Full gate results are reported separately and are not inferred from index validity.'}
    ev['files_changed']=[{'path':'Plans/_shards/**','change_type':'modified','note':f'Generator-owned manifests and bodies for {n} source documents.'},{'path':GEN,'change_type':'modified'},{'path':CHECK,'change_type':'modified'}]
    ev['commands_run']=[{'cmd':'python3 scripts/pm-plan-index.py validate','exit_code':0,'stdout_excerpt':f'status=pass; plan_unit_count={pu}; acceptance_unit_count={ac}; runtime_enabled=false'}, {'cmd':'python3 scripts/pm-shard-plans.py --generate --report '+GEN,'exit_code':0,'stdout_excerpt':f'status=pass; source_count={n}; shards_generated={s}'},{'cmd':'python3 scripts/pm-shard-plans.py --check --report '+CHECK,'exit_code':0,'stdout_excerpt':f'status=pass; shards_checked={cr["shards_checked"]}; body_reconstruction_mismatches=0'}]
    ev['checks']=[{'name':'plan-index-validate','result':'PASS','details':f'{pu} PlanUnits and {ac} acceptance units match live specifications.'},{'name':'plan-shard-generate','result':'PASS','details':f'{n} documents; {s} shards.'},{'name':'plan-shard-check','result':'PASS','details':'Exact source bodies, references and path case pass.'},{'name':'implementation-readiness-boundary','result':'FAIL','details':'PNC-019 remains blocked. No runtime/readiness certification is granted by this evidence.'}]
    decision_id='dec-2026-09-07-assistant-v3-index-currentness'
    ev['events']={'event_refs':[{'source':'jsonl','ref':'Plans/auto_decisions.jsonl#'+decision_id,'note':'Explicit user-authorized derived currentness update; not a product runtime event.'}]}
    dump(ROOT/LIVE,ev)
    run('lock-refresh',['scripts/pm-governance-seal.py','refresh','--spec-lock','Plans/Spec_Lock.json'],required=True)
    spec=importlib.util.spec_from_file_location('seal',ROOT/'scripts/pm-governance-seal.py');mod=importlib.util.module_from_spec(spec);spec.loader.exec_module(mod)
    decision=mod.upsert_auto_decision(ROOT/'Plans/auto_decisions.jsonl',decision_id=decision_id,scope='plans.assistant_v3.derived_currentness',decision='regenerate_planunit_index_and_live_governance_evidence_without_runtime_enablement',rationale='Jared explicitly requested the formerly deferred PlanUnit-index/governance currentness work on 2026-09-07. Stable accepted Plans are the source; generators replace stale derivatives; historical evidence and executable readiness remain unchanged.',applied_to=INDEX+[GEN,CHECK,LIVE],contract_refs=['PolicyRule:Decision_Policy.md#spec-lock-update-protocol','ContractName:Plans/Plan_Document_System.md','ContractName:Plans/Plan_To_Node_Compilation.md','SchemaID:pm.auto_decisions.schema.v1'])
    dump(OUT/'decision-result.json',decision)
    for label,cmd in [('lock-after','verify-spec-lock'),('decisions-after','validate-auto-decisions'),('graph-after','validate-plan-graph'),('evidence-after','validate-evidence')]:
        run(label,['scripts/pm-plans-verify.py',cmd],required=True,report=True)
    if a.full_gates:
        run('gates-after',['scripts/pm-plans-verify.py','run-gates'],report=True)
        run('governance-after',['scripts/pm-plans-verify.py','audit-governance'],report=True)
    changed_protected=[p for p,h in before.items() if not (ROOT/p).is_file() or digest(ROOT/p)!=h]
    assert not changed_protected, changed_protected
    summary={'source_commit':BASE,'authorization':'Explicit user request dated 2026-09-07; index and derived governance only','index_before':before_index['summary'],'index_after':current['summary'],'index_currentness':'PASS','shards_currentness':'PASS','source_documents':n,'shards':s,'spec_lock_currentness':'PASS','evidence_currentness':'PASS','plan_graph_currentness':'PASS','protected_inputs_unchanged':len(before),'runtime_enabled':False,'ordinary_product_worknodes_allowed':False,'demo_acceptance_not_implied':True,'full_gates_executed':a.full_gates,'index_hashes':{p:{'before':prior_index[p],'after':digest(ROOT/p)} for p in INDEX},'commands':rows}
    if a.full_gates:
        summary['full_gates_before']=read(OUT/'gates-before.json')['status'];summary['full_gates_after']=read(OUT/'gates-after.json')['status'];summary['governance_aggregate_after']=read(OUT/'governance-after.json')['status'];summary['remaining_failures_before']=failures(read(OUT/'gates-before.json'));summary['remaining_failures_after']=failures(read(OUT/'gates-after.json'))
    dump(OUT/'RESULT.json',summary)
    print(json.dumps({k:v for k,v in summary.items() if k not in ['commands','index_hashes']},indent=2))
    return 0
if __name__=='__main__': raise SystemExit(main())
