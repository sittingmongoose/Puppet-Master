#!/usr/bin/env python3
"""Read-only offline original-assessment join; writes only beside this script."""
import argparse, collections, datetime, hashlib, json
from pathlib import Path
from urllib.parse import unquote
U = 'UNKNOWN'
OUT = Path(__file__).resolve().parent
RESOURCE = ['candidate_latency_seconds','observed_occupied_context_sum_seconds','observed_context_union_seconds','observed_overlap_seconds','missing_context_lifetimes','complete_occupied_context_sum_seconds']
ALIASES = {'coverage':['coverage','coverage_judgment','axis_coverage'], 'delivery':['delivery','delivery_judgment'], 'native':['native','native_lifecycle'], 'protocol':['protocol'], 'time':['time','timing','time_effective_and_billing','wall_time'], 'effective':['effective','effective_runtime','effective_execution','effective_route'], 'billing':['billing','route_and_billing','usage_billing']}
CONTAINERS = ['separate_dimensions','arm_records','mechanics','measurements','dimensions','per_arm_dimensions','operational_dimensions','per_arm','metrics','delivery_native_protocol_time','native_t3_protocol_time_effective_billing','native_t3_effective_billing','mechanics_separate_from_source_judgment']
PASS = {'PASS','PASS_WITH_LIMITATIONS'}

def source_pass(v):
    return isinstance(v,str) and v in PASS

def role(slot, arm):
    return 'role' if slot.startswith('B-') else 'investigator' if slot.startswith('A2-') and arm=='treatment' else 'critic-finalizer' if slot.startswith('A7-') and arm=='treatment' else 'reviser'

def quiet(t):
    return t.get('status')=='completed' and t.get('hasPendingChildRuns') is False

def label(v):
    if isinstance(v,(str,bool)): return v
    if isinstance(v,dict):
        vals=[v[k] for k in ['judgment','status','label','verdict'] if isinstance(v.get(k),(str,bool))]
        return vals[0] if len(set(map(str,vals)))==1 else U
    return U

def dimensions(v, prov):
    out={}; mismatches=[]
    containers=[('',v)]+[('/'+k,v[k]) for k in CONTAINERS if isinstance(v.get(k),dict)]
    for dim,keys in ALIASES.items():
        obs=[{'raw':d[k],'label':label(d[k]),'provenance':prov(ptr+'/'+k)} for ptr,d in containers for k in keys if k in d]
        labels={str(x['label']) for x in obs if x['label']!=U}
        out[dim]={'label':next(iter(labels)) if len(labels)==1 else U,'observations':obs}
        if not obs or len(labels)!=1: mismatches.append(dim+': absent/ambiguous/unlabelled; raw retained')
    return out,mismatches

def timely(obs):
    # Only explicit candidate-delivery booleans, never reviewer clocks or inferred timestamp math.
    keys={'delivery_within_deadline','delivery_before_deadline','within_candidate_deadline','candidate_science_present_before_deadline','whole_terminal_within_envelope','within_deadline','delivery_within_envelope'}
    vals=[]
    for o in obs:
        if isinstance(o['raw'],dict):
            vals += [v for k,v in o['raw'].items() if k in keys and isinstance(v,bool)]
    return vals[0] if vals and len(set(vals))==1 else U

def ratios(rows):
    pairs=[]
    for slot in sorted({r['slot'] for r in rows}):
        p={r['arm']:r for r in rows if r['slot']==slot}
        if set(p)!={'control','treatment'}: continue
        c,t=p['control'],p['treatment']; a,b=c['resources']['candidate_latency_seconds'],t['resources']['candidate_latency_seconds']
        if source_pass(c['source_judgment']) and source_pass(t['source_judgment']) and isinstance(a,(int,float)) and isinstance(b,(int,float)) and a>0 and b>=0:
            pairs.append({'slot':slot,'method':t['method'],'treatment_over_control_latency':b/a,'selection':'CONDITIONAL_BOTH_SOURCE_PASS_SURVIVORSHIP','protocol_eligibility':U,'latency_definition':'existing accounting request-to-quiet-final; no effective/billing equivalence','protocol_labels':[c['dimensions']['protocol']['label'],t['dimensions']['protocol']['label']],'resources_provenance':[c['resources_provenance'],t['resources_provenance']]})
    return pairs

def telemetry(obs, keys):
    known=[]
    def walk(v,ptr,pr):
        if isinstance(v,dict):
            for k,x in v.items():
                if k in keys and isinstance(x,(str,int,float)) and 'UNKNOWN' not in str(x).upper():known.append({'field':k,'value':x,'provenance':{**pr,'json_pointer':ptr+'/'+k}})
                elif isinstance(x,dict):walk(x,ptr+'/'+k,pr)
    for o in obs:walk(o['raw'],o['provenance']['json_pointer'],o['provenance'])
    return known or U

def build(runtime, checkpoint, accounting):
    manifest={}; errors=[]
    def load(p):
        p=Path(p).resolve()
        if not p.is_file(): errors.append({'path':str(p),'error':'ABSENT'}); return None
        b=p.read_bytes(); manifest[str(p)]={'path':str(p),'sha256':hashlib.sha256(b).hexdigest(),'bytes':len(b)}
        try: return json.loads(b)
        except ValueError: errors.append({'path':str(p),'error':'INVALID_JSON'}); return None
    def prov(p,ptr=''):
        return {**manifest[str(Path(p).resolve())],'json_pointer':ptr}
    c=load(checkpoint); acct=load(accounting); original=runtime/'mechanics/QUEUE_ORIGINAL.json'; queue=runtime/'mechanics/QUEUE.json'
    oq=load(original); q=load(queue); realloc=runtime/'mechanics/REALLOCATIONS-v1.json'; policy=runtime/'mechanics/PROGRESS_COUNT_POLICY.json'
    load(realloc); load(policy); code=runtime/'mechanics/accounting-extractor-v1/extract.py'; b=code.read_bytes(); manifest[str(code.resolve())]={'path':str(code.resolve()),'sha256':hashlib.sha256(b).hexdigest(),'bytes':len(b)}
    if not all(isinstance(v,dict) for v in [c,acct,oq,q]): raise ValueError('required JSON objects missing')
    amap={(a['slot'],a['arm']):(i,a) for i,a in enumerate(acct.get('logical_arms',[]))}
    qmap={s['slot_id']:(i,s) for i,s in enumerate(q['slots'])}; rows=[]
    for si,s in enumerate(oq['slots']):
        slot=s['slot_id']; qi,qs=qmap.get(slot,(-1,{}))
        for arm in ['control','treatment']:
            key=(slot,arm); rr=role(slot,arm); ts=[(i,t) for i,t in enumerate(c.get('candidateTasks',[])) if (t.get('slot'),t.get('arm'))==key]
            finals=[(i,t) for i,t in ts if t.get('stage')==rr]; final=finals[0][1] if finals else {}
            qa=next((x for x in qs.get('arms',[]) if x.get('arm_id')==slot+'/'+arm),{}); launched=bool(qa.get('task_id') or qa.get('reservation') or qa.get('state') in ['RUNNING','COMPLETED','FAILED'])
            delivery=('ABSENT_FROM_CHECKPOINT' if launched else 'UNSTARTED') if not ts else 'COMPLETED_QUIET' if final and quiet(final) and (not slot.startswith('A2-') or arm!='treatment' or all(quiet(t) for _,t in ts)) else 'STARTED_NOT_FINAL_QUIET'
            row={'slot':slot,'arm':arm,'phase':s['track'],'scope':'bounded_role' if s['track']=='B' else 'full_pipeline','method':s['contrast_id'],'declared_recipe':s.get(arm,{}).get('recipe',U),'role':slot.split('-')[1] if s['track']=='B' else rr,'final_role':rr,'final_attempt_id':final.get('taskId',U),'attempts':[],'delivery':delivery,'queue_arm_state':qa.get('state',U),'assessment_state':'UNASSESSED','assessment_attempts':[],'source_judgment':U,'source_judgment_provenance':U,'dimensions':{k:{'label':U,'observations':[]} for k in ALIASES},'timely_source_delivery':U,'actual_provider':U,'requested_tier':U,'effective_settings':U,'billing':U,'resources':{k:U for k in RESOURCE},'resources_provenance':U,'schema_mismatches':[],'provenance':{'assignment':prov(original,f'/slots/{si}'),'queue':prov(queue,f'/slots/{qi}') if qi>=0 else U,'reallocation':prov(realloc),'count_policy':prov(policy)}}
            for ti,t in ts:
                route=U; rp=U; aid=t.get('taskId',U); stage=runtime/'runs'/slot/arm/'stages'/t['stage']
                for p in sorted(stage.glob('request*.json')):
                    req=load(p)
                    if not isinstance(req,dict):continue
                    client=req.get('clientRequestId',req.get('args',{}).get('clientRequestId'))
                    if client and unquote(aid).endswith('delegate-task:'+client): route=req.get('args',{}).get('target',{});rp=prov(p,'/args/target');break
                ap=route.get('providerInstanceId',U) if isinstance(route,dict) else U
                tier=route.get('options',{}).get('serviceTier',U) if isinstance(route,dict) else U
                row['attempts'].append({'task_id':aid,'child_thread_id':t.get('childThreadId',U),'child_run_id':t.get('childRunId',U),'stage':t['stage'],'status':t.get('status',U),'actual_provider':ap,'returned_provider':t.get('providerInstanceId',U),'requested_tier':tier,'requested_route':route,'route_provenance':rp,'checkpoint_provenance':prov(checkpoint,f'/candidateTasks/{ti}')})
            for field,target in [('actual_provider','actual_provider'),('requested_tier','requested_tier')]:
                vals={a[field] for a in row['attempts']}; row[target]=next(iter(vals)) if len(vals)==1 else 'MIXED' if vals and U not in vals else U
            if key in amap:
                ai,a=amap[key];row['resources']={k:a.get(k,U) for k in RESOURCE};row['resources_provenance']=prov(accounting,f'/logical_arms/{ai}');row['accounting_attempt_ids']=a.get('attempt_task_ids',[])
                if a.get('final_task_id')!=row['final_attempt_id'] or set(a.get('attempt_task_ids',[]))!={t.get('taskId') for _,t in ts}:row['schema_mismatches'].append('accounting attempt inventory/final differs from checkpoint; latency suppressed, observed totals retain historical snapshot scope');row['resources']['candidate_latency_seconds']=U
                extra={t.get('taskId') for _,t in ts}-set(a.get('attempt_task_ids',[]))
                if extra:
                    row['resources']['complete_occupied_context_sum_seconds']=U
                    old=row['resources']['missing_context_lifetimes'];row['resources']['missing_context_lifetimes']=old+len(extra) if isinstance(old,int) else U
            all_es=[(i,t) for i,t in enumerate(c.get('evaluationTasks',[])) if (t.get('slot'),t.get('arm'))==key];row['assessment_attempts']=[{'task_id':t.get('taskId',U),'status':t.get('status',U),'quiet':quiet(t),'provenance':prov(checkpoint,f'/evaluationTasks/{i}')} for i,t in all_es];es=[(i,t) for i,t in all_es if quiet(t)]
            if es:
                # v1 original only; no later dispositions, revisions, shared outcome roster, or candidate bodies.
                p=runtime/'assessment'/slot/(arm+'-v1')/'assessment.json';v=load(p)
                row['evaluation_attempts']=[{'task_id':t.get('taskId',U),'provenance':prov(checkpoint,f'/evaluationTasks/{i}')} for i,t in es]
                row['assessment_state']='ABSENT' if v is None else 'ASSESSED'
                if v is not None and not isinstance(v,dict):row['schema_mismatches'].append('assessment is not a JSON object; no regrade')
                if isinstance(v,dict):
                    row['assessment_schema']=v.get('schema',v.get('schema_version',U));row['assessment_top_level_keys']=list(v)
                    row['source_judgment']=v.get('source_judgment',U);row['source_judgment_provenance']=prov(p,'/source_judgment') if 'source_judgment' in v else U
                    row['dimensions'],issues=dimensions(v,lambda ptr:prov(p,ptr));row['schema_mismatches'].extend(issues)
                    row['timely_source_delivery']=timely(row['dimensions']['time']['observations'])
                    row['effective_settings']=telemetry(row['dimensions']['effective']['observations'],{'effective_model','effective_service_tier','effective_reasoning_effort','effective_provider_api_model','provider_api_effective_options'})
                    row['billing']=telemetry(row['dimensions']['billing']['observations'],{'actual_billed_tokens','billed_tokens','billed_cost','invoice_total','cost_usd'})
                    if not isinstance(v.get('source_judgment'),str):row['schema_mismatches'].append('source_judgment absent/non-string: raw preserved; source-pass eligibility UNKNOWN')
                    if 'source_judgment' not in v:row['schema_mismatches'].append('missing source_judgment; no alternate field regrade')
            rows.append(row)
    counts=collections.Counter(r['phase'] for r in rows)
    if dict(counts)!={'A':32,'B':24,'C':8,'D':16}:raise ValueError('scope differs from A16/B12/C4/D8 pairs')
    groups=collections.defaultdict(list)
    for r in rows:groups[tuple(r[k] for k in ['phase','method','role','arm','actual_provider','requested_tier'])].append(r)
    totals=[]
    for key,rs in sorted(groups.items()):
        totals.append(dict(zip(['phase','method','role','arm','actual_provider','requested_tier'],key),assigned_source_denominator=len(rs),assigned_timely_source_denominator=len(rs),source_labels=dict(collections.Counter(str(r['source_judgment']) for r in rs)),dimension_labels={dim:dict(collections.Counter(r['dimensions'][dim]['label'] for r in rs)) for dim in ALIASES},delivery_labels=dict(collections.Counter(r['delivery'] for r in rs)),assessment_states=dict(collections.Counter(r['assessment_state'] for r in rs)),source_pass_family=sum(source_pass(r['source_judgment']) for r in rs),timely_source_pass=sum(source_pass(r['source_judgment']) and r['timely_source_delivery'] is True for r in rs),timeliness_unknown=sum(r['timely_source_delivery']==U for r in rs),resource_observations={k:sum(isinstance(r['resources'][k],(int,float)) for r in rs) for k in RESOURCE}))
    changed=[p for p,m in manifest.items() if hashlib.sha256(Path(p).read_bytes()).hexdigest()!=m['sha256']]
    return {'schema':'er12.results-table.v1','rows':rows,'scope':dict(counts),'counts':totals,'paired_latency_ratios':ratios(rows),'native_meters_summed':False,'billing_equated_across_vendors':False,'accounting_generated_at':acct.get('generated_at_utc',U),'accounting_checkpoint':acct.get('checkpoint',U),'checkpoint':prov(checkpoint),'read_errors':errors,'sources_changed_during_join':changed,'source_manifest':list(manifest.values())}

def main():
    ap=argparse.ArgumentParser();ap.add_argument('--runtime',type=Path,default=OUT.parent.parent);ap.add_argument('--checkpoint',type=Path);ap.add_argument('--accounting',type=Path);a=ap.parse_args()
    checkpoint=a.checkpoint or a.runtime/'root-checkpoint.json';accounting=a.accounting or a.runtime/'mechanics/accounting-extractor-v1/cohort3-thin-snapshot.json'
    result=build(a.runtime.resolve(),checkpoint.resolve(),accounting.resolve())
    for name,obj in [('table.json',result),('sourcehashmanifest.json',result['source_manifest']),('current-extract.json',{'rows':result['rows'],'checkpoint':result['checkpoint'],'accounting_generated_at':result['accounting_generated_at']})]:
        (OUT/name).write_text(json.dumps(obj,indent=2,ensure_ascii=False)+'\n')
    print(json.dumps({'rows':len(result['rows']),'scope':result['scope'],'source_labels':dict(collections.Counter(str(r['source_judgment']) for r in result['rows'])),'paired_ratios':len(result['paired_latency_ratios']),'sources_changed':result['sources_changed_during_join']}))
if __name__=='__main__':main()
