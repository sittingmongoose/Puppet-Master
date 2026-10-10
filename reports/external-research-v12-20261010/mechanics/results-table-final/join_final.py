#!/usr/bin/env python3
"""Pinned legacy join plus frozen mechanical accounting; no scientific runner."""
import argparse, collections, copy, hashlib, importlib.util, json, math, re
from pathlib import Path
BASE = Path(__file__).resolve().parent
LEGACY = BASE.parent / 'results-table-v1/join.py'
PIN = 'a4e9f933b2260eeb12e6a4ad857289c7d92e884e20b66592a1b88ba2ac4ae4f8'
U = 'UNKNOWN'
MISSING = 'D-R1-03/treatment'
ATTR = ('phase','method','role','arm','actual_provider','requested_tier')
METRICS = ('attempt_terminal_latency_seconds','delivery_proxy_latency_seconds','observed_occupied_context_sum_seconds','complete_occupied_context_sum_seconds','observed_started_to_completed_context_sum_seconds','complete_started_to_completed_context_sum_seconds','observed_context_union_seconds','observed_overlap_seconds','observed_started_context_union_seconds','observed_started_context_overlap_seconds')
def need(ok, why):
    if not ok: raise ValueError(why)
def digest(p): return hashlib.sha256(Path(p).read_bytes()).hexdigest()
def numeric(v): return type(v) in (int,float) and math.isfinite(v) and v >= 0
def identity(r): return r['slot']+'/'+r['arm']
def unique(rows, key):
    ids=[key(r) for r in rows]
    need(len(ids)==80 and len(set(ids))==80, 'requires 80 unique assigned arms')
    return dict(zip(ids,rows))
def legacy_module():
    need(digest(LEGACY)==PIN,'legacy join SHA-256 changed')
    spec=importlib.util.spec_from_file_location('pinned_er12_legacy_join',LEGACY)
    mod=importlib.util.module_from_spec(spec); spec.loader.exec_module(mod)
    return mod

def enrich(legacy, acct):
    """Copy legacy rows; only the missing mechanical delivery label is overridden."""
    amap=unique(acct['logical_arms'],identity); rows=copy.deepcopy(legacy['rows'])
    for index,r in enumerate(rows):
        original=legacy['rows'][index]
        a=amap[identity(r)]
        need(set(a['attempt_task_ids'])=={t['task_id'] for t in r['attempts']},'accounting attempt inventory mismatch')
        r['final_accounting']=copy.deepcopy(a)
        r['mechanical_attempt_records']=[{'raw':copy.deepcopy(t),'provenance':{**acct['_snapshot_provenance'],'json_pointer':'/declared_tasks/'+str(i)}} for i,t in enumerate(acct.get('declared_tasks',[])) if t.get('category')=='candidate' and t.get('declaration',{}).get('taskId') in a['attempt_task_ids']]
        r['final_accounting_provenance']={**acct['_snapshot_provenance'],'json_pointer':'/logical_arms/'+str(acct['logical_arms'].index(a))}
        r['metric_completeness']={
            'created_context':'COMPLETE' if numeric(a.get('complete_occupied_context_sum_seconds')) and a.get('missing_context_lifetimes')==0 else 'PARTIAL',
            'started_context':'COMPLETE' if numeric(a.get('complete_started_to_completed_context_sum_seconds')) else 'PARTIAL',
            'attempt_terminal':'COMPLETE' if numeric(a.get('attempt_terminal_latency_seconds')) else U,
            'delivery_proxy':'OBSERVED_PROXY' if numeric(a.get('delivery_proxy_latency_seconds')) else U}
        if identity(r)==MISSING:
            need(r['source_judgment']==U and r['assessment_state']=='UNASSESSED','missing arm must remain UNKNOWN/UNASSESSED')
            r['delivery']='MISSING_PRE_INPUT_GUARD_FAILURE'
        need({k:v for k,v in r.items() if k in original} == {**original, **({'delivery':'MISSING_PRE_INPUT_GUARD_FAILURE'} if identity(r)==MISSING else {})}, 'legacy field modified')
    return rows

def aggregate(rs, metric):
    vals=[r['final_accounting'].get(metric,U) for r in rs]
    seen=[v for v in vals if numeric(v)]
    completeness_field = ('complete_started_to_completed_context_sum_seconds' if metric in ('observed_started_to_completed_context_sum_seconds','observed_started_context_union_seconds','observed_started_context_overlap_seconds') else 'complete_occupied_context_sum_seconds' if metric in ('observed_occupied_context_sum_seconds','observed_context_union_seconds','observed_overlap_seconds') else metric)
    complete=len(seen)==len(rs) and bool(rs) and all(numeric(r['final_accounting'].get(completeness_field,U)) for r in rs)
    if completeness_field=='complete_occupied_context_sum_seconds': complete=complete and all(r['final_accounting'].get('missing_context_lifetimes')==0 for r in rs)
    total=round(sum(seen),6) if complete else U
    passes=sum(r['source_judgment'] in ('PASS','PASS_WITH_LIMITATIONS') for r in rs)
    return {'assigned_arms':len(rs),'source_passing_outputs':passes,'observed_rows':len(seen),'missing_rows':len(vals)-len(seen),'complete':complete,'observed_partial_sum':round(sum(seen),6),'complete_total':total,'cost_per_source_passing_output':round(total/passes,6) if numeric(total) and passes else U,'denominator_label':'CONDITIONAL_SOURCE_CORRECTNESS; not production qualification','cross_arm_union_semantics':'sum of arm unions only; not campaign wall-clock union'}

def comparisons(rows):
    groups=collections.defaultdict(list)
    for r in rows: groups[tuple(r[k] for k in ATTR)].append(r)
    assigned=[{'attribution':dict(zip(ATTR,k)),'selection':'ALL_ASSIGNED_FAILURE_INCLUSIVE','metrics':{m:aggregate(rs,m) for m in METRICS}} for k,rs in sorted(groups.items())]
    paired=[]; pairgroups=collections.defaultdict(list)
    for slot in sorted({r['slot'] for r in rows}):
        p={r['arm']:r for r in rows if r['slot']==slot}
        if set(p)!= {'control','treatment'}: continue
        c,t=p['control'],p['treatment']
        if not all(r['source_judgment'] in ('PASS','PASS_WITH_LIMITATIONS') for r in (c,t)): continue
        metrics={}
        for m in METRICS:
            a,b=(r['final_accounting'].get(m,U) for r in (c,t))
            metrics[m]={'control':a,'treatment':b,'treatment_over_control':b/a if numeric(a) and a>0 and numeric(b) and aggregate([c],m)['complete'] and aggregate([t],m)['complete'] else U}
        paired.append({'slot':slot,'selection':'CONDITIONAL_BOTH_SOURCE_PASS_SURVIVORSHIP','control_attribution':{k:c[k] for k in ATTR},'treatment_attribution':{k:t[k] for k in ATTR},'metrics':metrics,'protocol_eligibility':U,'production_qualification':U})
        key=tuple(c[k] for k in ATTR)+tuple(t[k] for k in ATTR)
        pairgroups[key].append((c,t))
    paired_totals=[{'control_attribution':dict(zip(ATTR,k[:len(ATTR)])),'treatment_attribution':dict(zip(ATTR,k[len(ATTR):])),'selection':'CONDITIONAL_BOTH_SOURCE_PASS_SURVIVORSHIP','pair_count':len(ps),'control':{m:aggregate([p[0] for p in ps],m) for m in METRICS},'treatment':{m:aggregate([p[1] for p in ps],m) for m in METRICS}} for k,ps in sorted(pairgroups.items())]
    return {'all_assigned':assigned,'both_source_pass_pairs':paired,'both_source_pass_totals':paired_totals,'savings_claims':False,'eligibility':{'protocol':U,'time':U,'effective':U,'billing':U,'production':U}}

def validate(legacy, cp, acct, freeze, checkpoint, freeze_path):
    rows=unique(legacy['rows'],identity); arms=unique(freeze['arms'],lambda e:e['armId']); amap=unique(acct['logical_arms'],identity)
    need(set(rows)==set(arms)==set(amap),'arm coverage mismatch')
    need(freeze['schema']=='er12.global-root-science-freeze.v1' and acct['schema']=='er12.accounting-extractor.final.v2','unsupported schema')
    need(not legacy['sources_changed_during_join'] and not acct['sources_changed_during_extraction'],'inputs changed during prior extraction')
    need(freeze['input_hashes_before']==freeze['input_hashes_after']==freeze['input_hashes'],'freeze before/after hashes mismatch')
    inv={m['path']:m for m in freeze['input_hashes']}
    need(len(inv)==len(freeze['input_hashes']),'duplicate frozen hash paths')
    for m in inv.values(): need(Path(m['path']).is_absolute() and re.fullmatch('[0-9a-f]{64}',m['sha256']) and type(m['bytes']) is int,'invalid frozen hash metadata')
    for ref in (freeze['checkpoint'],acct['checkpoint']):
        need(ref['path']==str(checkpoint) and ref['sha256']==digest(checkpoint),'frozen checkpoint path/hash mismatch')
    need(acct.get('delivery_manifest',{}).get('valid') is True,'final accounting must use valid frozen delivery manifest')
    tasks=cp['candidateTasks']
    need(all(t.get('status') in ('completed','complete','failed','cancelled','canceled') and t.get('hasPendingChildRuns') is False for t in tasks),'candidate checkpoint not quiet')
    need(len({t.get('taskId') for t in tasks})==len(tasks),'duplicate candidate IDs')
    need({t['slot']+'/'+t['arm'] for t in tasks}==set(rows),'checkpoint candidate arm coverage')
    missing_tasks=[t for t in tasks if t['slot']+'/'+t['arm']==MISSING]
    need(len(missing_tasks)==1 and missing_tasks[0]['stage']=='investigator' ,'missing original failed investigator only')
    evals=cp['evaluationTasks']
    need(len(evals)==79 and all(t.get('status')=='completed' and t.get('hasPendingChildRuns') is False for t in evals),'requires 79 original quiet reviews')
    need(len({(t['slot'],t['arm']) for t in evals})==79 and all(t.get('key','').endswith('-v1') for t in evals),'original review identities')
    need({t['slot']+'/'+t['arm'] for t in evals}==set(rows)-{MISSING},'review arm coverage')
    need(sum(e['delivery']['disposition']=='DELIVERED' for e in arms.values())==79,'requires 79 delivered')
    for i,e in enumerate(freeze['arms']):
        aid=e['armId']; r=rows[aid]; a=amap[aid]; d=e['delivery']; review=e['original_assessment']
        need(e['final_role']==r['final_role'],'original final role changed')
        need(a['final_task_id']==r['final_attempt_id'],'accounting designated final mismatch')
        need(set(a['attempt_task_ids'])=={t['task_id'] for t in r['attempts']} and len(a['attempt_task_ids'])==len(set(a['attempt_task_ids'])),'accounting attempt inventory mismatch')
        need(d['armId']==aid and d['root_science_freeze_pointer']=={'path':str(freeze_path),'pointer':'/arms/'+str(i)},'global root pointer mismatch')
        need(a['delivery_disposition']==d['disposition'] and a['delivery_evidence']['raw']==d,'accounting delivery attestation mismatch')
        evidence=a['delivery_evidence']['provenance']; declared=acct['delivery_manifest']['provenance']
        need(evidence['path']==declared['path'] and evidence['sha256']==declared['sha256'] and evidence['json_pointer'].startswith('/rows/'),'accounting delivery provenance mismatch')
        def artifact(m):
            need(isinstance(m,dict) and inv.get(m.get('path'))==m,'artifact not in frozen hash inventory')
        def pointer(p):
            need(isinstance(p,dict) and set(p)=={'path','pointer'} and p['path'] in inv and isinstance(p['pointer'],str) and p['pointer'].startswith('/'),'unfrozen/malformed pointer')
        artifact(e['original_custody']['artifact']); pointer(e['original_custody_pointer'])
        artifact(e['actual_reconciliation']['artifact']); pointer(e['actual_reconciliation']['terminal_task_pointer'])
        need(d['terminal_task_status_pointer']==e['actual_reconciliation']['terminal_task_pointer'],'terminal pointer mismatch')
        if aid==MISSING:
            need(d['disposition']=='MISSING' and d['final_path'] is None and d['sha256'] is None and review['state']=='UNASSESSED_MISSING_FINAL','missing guard disposition')
            need(r['source_judgment']==U and r['assessment_state']=='UNASSESSED','missing scientific assessment changed')
            artifact(review['original_sidecar']); artifact(review['failure_evidence'])
            need(review['original_sidecar']['sha256']=='f14f237b2a4f1f5bdc302a957cc91d144105d40c2240b0ddda3bd5f186dc443d','missing sidecar pin mismatch')
            need(a['delivery_proxy_latency_seconds']==U and a['delivery_latency_seconds']==U and a['candidate_latency_seconds']==U,'missing arm cannot acquire delivery latency')
            need(a['observed_native_or_host_failure'] is True and numeric(a['observed_occupied_context_sum_seconds']) and a['observed_occupied_context_sum_seconds']>=197,'missing failed consumed cost erased')
        else:
            need(d['final_task_id']==r['final_attempt_id'],'root designated final mismatch')
            need(d['disposition']=='DELIVERED' and review['state']=='ASSESSED' and r['assessment_state']=='ASSESSED','delivered assessment absent')
            need(review['source_judgment']==r['source_judgment'],'original source label changed')
            artifact(review['artifact']); pointer(review['source_judgment_pointer'])
            need(r['source_judgment_provenance']['path']==review['artifact']['path'] and r['source_judgment_provenance']['sha256']==review['artifact']['sha256'] and r['source_judgment_provenance']['json_pointer']==review['source_judgment_pointer']['pointer'],'original source provenance mismatch')
            need(any(x['task_id']==review['evaluation_task_id'] and x['quiet'] for x in r['assessment_attempts']),'original quiet reviewer mismatch')
            final={m['path']:m for m in e['scientific_artifacts']}.get(d['final_path'])
            need(final and final['sha256']==d['sha256'] and final['bytes']>0,'final root hash/pointer missing')
            artifact(final)
    need(arms[MISSING]['delivery']['final_task_id']==missing_tasks[0]['taskId'],'missing failed task attestation mismatch')
    # Verify bytes consumed by the pinned join against freeze metadata where applicable.
    accounted={m['path']:m for m in acct['source_manifest']}
    need(len(accounted)==len(acct['source_manifest']),'duplicate accounting source paths')
    for path in set(accounted)&set(inv): need(accounted[path]==inv[path],'final accounting hash differs from root freeze')
    for m in legacy['source_manifest']:
        if m['path'] in inv: need(m==inv[m['path']], 'legacy consumed hash differs from freeze')
        if m['path'] in accounted: need(m==accounted[m['path']], 'legacy consumed hash differs from final accounting')
    for aid,r in rows.items():
        for a in r['attempts']:
            pr=a['route_provenance']
            if isinstance(pr,dict):
                need(pr['path'] in accounted and pr['sha256']==accounted[pr['path']]['sha256'],'route attribution not pinned in final accounting')

def build(runtime, checkpoint, accounting, freeze_path):
    manifest={}
    def load(p):
        b=p.read_bytes(); manifest[str(p)]={'path':str(p),'sha256':hashlib.sha256(b).hexdigest(),'bytes':len(b)}; return json.loads(b)
    cp=load(checkpoint); acct=load(accounting); freeze=load(freeze_path)
    need(checkpoint != runtime/'root-checkpoint.json','explicit frozen checkpoint copy required')
    old=legacy_module().build(runtime,checkpoint,accounting)
    validate(old,cp,acct,freeze,checkpoint,freeze_path)
    acct['_snapshot_provenance']=manifest[str(accounting)]
    rows=enrich(old,acct); metrics=comparisons(rows)
    for m in old['source_manifest']: manifest[m['path']]=m
    manifest[str(LEGACY)]={'path':str(LEGACY),'sha256':PIN,'bytes':LEGACY.stat().st_size}
    need(all(digest(p)==m['sha256'] for p,m in manifest.items()),'consumed input changed during join')
    provenance={'consumed_files':list(manifest.values()),'root_attested_science_inventory':freeze['input_hashes'],'science_bodies_read_by_wrapper':False,'science_hashes_independently_verified_by_wrapper':False,'accounting_read_errors':acct['read_errors'],'legacy_read_errors':old['read_errors'],'accounting_source_manifest':acct['source_manifest'],'root_freeze_summary':freeze['summary'],'failure_separation':acct['failure_separation'],'accounting_by_category':acct['accounting_by_category'],'native_goals_unsummed':acct['native_goals'],'authored_goal_records':acct['authored_goal_records']}
    table={'schema':'er12.results-table.final.v1','rows':rows,'scope':old['scope'],'legacy_product':'legacy-product.json','legacy_counts_unchanged':old['counts'],'metric_comparison':'metric-comparison.json','provenance':'provenance-manifest.json','no_new_grades':True,'mechanical_delivery_counts':dict(collections.Counter(r['delivery'] for r in rows))}
    return {'table.json':table,'legacy-product.json':old,'metric-comparison.json':metrics,'provenance-manifest.json':provenance}

def main():
    ap=argparse.ArgumentParser(description=__doc__)
    for k in ('runtime','checkpoint','accounting','science-freeze','output'): ap.add_argument('--'+k,required=True,type=Path)
    a=ap.parse_args(); output=a.output.absolute()
    try:
        need(output.parent==BASE and not output.exists() and not output.is_symlink(),'output must be a new named direct child of this bundle')
        need(all(p.is_absolute() for p in (a.runtime,a.checkpoint,a.accounting,a.science_freeze)),'explicit absolute inputs required')
        result=build(a.runtime.resolve(),a.checkpoint.resolve(),a.accounting.resolve(),a.science_freeze.resolve())
        output.mkdir()
        for name,obj in result.items(): (output/name).write_text(json.dumps(obj,indent=2,ensure_ascii=False)+'\n')
    except (ValueError,KeyError,TypeError,OSError) as e: ap.exit(2,'REFUSED: '+str(e)+'\n')
    print(json.dumps({'output':str(output),'rows':80,'campaign_run':'root-only after quiet freeze'}))
if __name__=='__main__': main()
