#!/usr/bin/env python3
"""Offline mechanical accounting. No network, provider API, judgment or source writes."""
import argparse, collections, datetime as dt, hashlib, json
from pathlib import Path
U = 'UNKNOWN'

def utc(v):
    try: return dt.datetime.fromisoformat(v.replace('Z', '+00:00')).timestamp()
    except (ValueError, TypeError, AttributeError): return None

def span(a,b):
    x,y=utc(a),utc(b)
    return round(y-x,6) if x is not None and y is not None and y>=x else U

def union_seconds(intervals):
    rows=sorted((utc(a),utc(b)) for a,b in intervals if span(a,b)!=U)
    merged=[]
    for a,b in rows:
        if merged and a<=merged[-1][1]: merged[-1][1]=max(b,merged[-1][1])
        else: merged.append([a,b])
    return round(sum(b-a for a,b in merged),6)

def decoded(v):
    for _ in range(4):
        if not isinstance(v,str): break
        try: v=json.loads(v)
        except (ValueError,TypeError): break
    return v

def extract(checkpoint, runtime):
    runtime=Path(runtime).resolve(); checkpoint=Path(checkpoint).resolve()
    sources={}; errors=[]; hosts=collections.defaultdict(list); statuses=collections.defaultdict(list)
    goal_observations=[]; requests={}; stage_meta={}; stage_current_request_keys={}
    def load(p):
        p=Path(p).resolve()
        if not p.is_file(): errors.append({'path':str(p),'reason':'missing'});return None
        data=p.read_bytes(); h=hashlib.sha256(data).hexdigest()
        sources[str(p)]={'path':str(p),'sha256':h,'bytes':len(data)}
        try: return json.loads(data)
        except (ValueError,UnicodeError): errors.append({'path':str(p),'reason':'empty or non-JSON'});return None
    def prov(p,ptr): return {'path':str(Path(p).resolve()),'sha256':sources[str(Path(p).resolve())]['sha256'],'pointer':ptr}
    c=load(checkpoint)
    if not isinstance(c,dict): raise ValueError('checkpoint must be a JSON object')
    policies={}
    for name in ['SCIENTIFIC_PROGRESS.json','PROGRESS_COUNT_POLICY.json','STAGE_OVERRUN_ENFORCEMENT.json','service-tier-change/REVISION.json']:
        p=runtime/'mechanics'/name; policies[name]={'raw':load(p),'provenance':prov(p,'') if str(p) in sources else U}
    tasks=[{'declaration':{'taskId':U,'childThreadId':c.get('rootThreadId',U),'childRunId':U,'key':'campaign-root','status':U},'category':'root','declaration_provenance':prov(checkpoint,'/rootThreadId')}]
    for group,category in [('candidateTasks','candidate'),('setupTasks','preparation'),('evaluationTasks','evaluation')]:
        for i,t in enumerate(c.get(group,[])):
            category2=category
            if category=='preparation':
                key=t.get('key','').lower()
                category2='publication' if 'publication' in key else ('support' if any(x in key for x in ['observation','evidence','mechanics','accounting']) else 'preparation')
            tasks.append({'declaration':t,'category':category2,'declaration_provenance':prov(checkpoint,f'/{group}/{i}')})
    frozen_judgments=collections.defaultdict(list)
    frozen_native={}
    existing=load(runtime/'mechanics/native-observation-cohort2/OBSERVATIONS.json')
    if isinstance(existing,dict):
        for i,t in enumerate(existing.get('targets',[])):
            frozen_native[t.get('frozen',{}).get('taskId')]={'raw':t.get('native_lifecycle',U),'provenance':prov(runtime/'mechanics/native-observation-cohort2/OBSERVATIONS.json',f'/targets/{i}/native_lifecycle'),'authority':'existing frozen mechanics label; not newly adjudicated'}
    for p in sorted((runtime/'assessment').glob('*/*/assessment.json')):
        v=load(p)
        if isinstance(v,dict):
            frozen_judgments[(p.parent.parent.name,p.parent.name.split('-v')[0])].append({'labels':{k:v.get(k,U) for k in ['source_judgment','native','protocol','delivery','time','time_effective_and_billing']},'provenance':prov(p,''),'authority':'existing judgment joined unchanged; no grading by extractor'})
    def walk(v,p,ptr='',context=None,kind='local_receipt',depth=0):
        if depth>24: return
        if isinstance(v,dict):
            # Prefer the actual structured payload over its duplicate text serialization.
            if isinstance(v.get('structuredContent'),dict):
                walk(v['structuredContent'],p,ptr+'/structuredContent',context,kind,depth+1); return
            if isinstance(v.get('thread'),dict) and any(k in v for k in ['recentRuns','runs']):
                th=v['thread']; tid=th.get('threadId');context=tid
                hosts[tid].append({'thread':th,'runs':v.get('recentRuns',v.get('runs',[])), 'provenance':prov(p,ptr)})
            if 'taskId' in v and ('hasPendingChildRuns' in v or 'workState' in v):
                statuses[v['taskId']].append({'raw':{k:v.get(k,U) for k in ['status','workState','hasPendingChildRuns','latestTerminalStatus','latestTerminalRunId']},'provenance':prov(p,ptr)})
            if isinstance(v.get('creation_response'),dict) and v.get('threadId') and v.get('objective'):
                raw=v['creation_response']
                if raw.get('createdAt') is not None:
                    goal_observations.append({'identity_key':'native_thread_creation:'+str(v['threadId'])+':'+str(raw['createdAt']),'actual_goal_id':U,'native_thread_id':v['threadId'],'host_context':context or U,'evidence_kind':kind,'raw':raw,'provenance':prov(p,ptr+'/creation_response'),'identity_wrapper_provenance':prov(p,ptr),'wrapper_objective':v['objective']})
            if ('tokensUsed' in v or 'tokens_used' in v or 'timeUsedSeconds' in v) and ('objective' in v or 'goal_id' in v):
                gid=v.get('goal_id',v.get('goalId'))
                # Codex exposes a native thread identity plus creation epoch, not an explicit Goal ID.
                key=('goal_id:'+str(gid)) if gid else ('native_thread_creation:'+str(v.get('threadId'))+':'+str(v.get('createdAt'))) if v.get('threadId') and v.get('createdAt') is not None else None
                goal_observations.append({'identity_key':key or U,'actual_goal_id':gid or U,'native_thread_id':v.get('threadId',U),'host_context':context or U,'evidence_kind':kind,'raw':v,'provenance':prov(p,ptr)})
                return
            # Only goal tool outputs are decoded from activity text; prose claims are never meters.
            if v.get('type')=='dynamic_tool' and ('goal' in str(v.get('title','')) or 'goal' in str(v.get('text',''))):
                tool=decoded(v.get('text'))
                if isinstance(tool,dict) and 'goal' in str(tool.get('toolName',tool.get('name',v.get('title','')))).lower():
                    walk(decoded(tool.get('output')),p,ptr+'/text/decoded/output',v.get('sourceThreadId',context),'host_dynamic_tool',depth+1)
            for k,x in v.items():
                if k in ['text','summary','latestTerminalSummary','task','objective']: continue
                walk(x,p,ptr+'/'+k,context,kind,depth+1)
        elif isinstance(v,list):
            for i,x in enumerate(v): walk(x,p,ptr+'/'+str(i),context,kind,depth+1)
        elif isinstance(v,str) and v.lstrip().startswith(('{','[','"{')):
            z=decoded(v)
            if z!=v: walk(z,p,ptr+'/decoded',context,kind,depth+1)
    # Bounded local observation inventory only. No full-tree/native polling.
    for p in sorted((runtime/'assessment').glob('*/*/*goal*.json')):
        v=load(p)
        if v is not None: walk(v,p,kind='local_reviewer_receipt')
    dirs=['mechanics/native-observation-cohort2','mechanics/task-observations','observations','mechanics/observation-pass1','mechanics/terminal-evidence-pass2','mechanics/native-root-code-mode']
    files=set()
    for d in dirs:
        files.update((runtime/d).rglob('*.json'))
    for p in sorted(files):
        # Derived conclusions are not raw host proof. Their source raw files are read above.
        if p.name in ['OBSERVATIONS.json','TASKS.json','SHA256SUMS.json','ORIGINALS-HASHES.json'] or p.name.endswith('-supported.json') or 'provider-native-evidence' in p.name: continue
        v=load(p)
        if v is not None: walk(v,p,kind='raw_observation')
    for p in [runtime/'root-goal-observed.json', runtime/'mechanics/NATIVE_GOAL_ACTIVE.json',runtime/'mechanics/NATIVE_GOAL_TERMINAL.json']:
        v=load(p)
        if v is not None: walk(v,p)
    # Read only mechanical stage metadata and goal-named receipts; never science contents.
    for p in sorted((runtime/'runs').rglob('*.json')):
        if p.name in ['input-map.json','status.json'] or p.name.startswith(('dispatch','request')) or 'goal' in p.name.lower() or 'receipt' in p.name.lower():
            v=load(p)
            if v is None: continue
            if p.name=='input-map.json': stage_meta[str(p.parent)]={'raw':v,'provenance':prov(p,'')}
            if p.name.startswith(('dispatch','request')) and isinstance(v,dict):
                key=v.get('clientRequestId',v.get('args',{}).get('clientRequestId'))
                if key:
                    requests[key]={'raw':v,'provenance':prov(p,'')}
                    if p.name in ['dispatch.json','request.json']: stage_current_request_keys[str(p.parent)]=key
            walk(v,p)
    authored_goal_records=[]
    for p in sorted((runtime/'runs').rglob('*goal*.md')):
        data=p.read_bytes(); sources[str(p.resolve())]={'path':str(p.resolve()),'sha256':hashlib.sha256(data).hexdigest(),'bytes':len(data)}
        authored_goal_records.append({'text':data.decode('utf-8',errors='replace'),'provenance':prov(p,''),'native_proof':U,'meter_interpretation':U})
    results=[]
    for t in tasks:
        d=t['declaration']; tid=d.get('childThreadId'); taskid=d.get('taskId'); key=d.get('key',taskid.split('delegate-task%3A')[-1] if taskid else '')
        hs=hosts.get(tid,[]); runs=collections.defaultdict(list)
        for h in hs:
            for run in h['runs']: runs[run.get('runId',U)].append({'raw':run,'provenance':h['provenance']})
        intervals=[]
        for runid,obs in sorted(runs.items()):
            fields={}
            for field in ['requestedAt','startedAt','completedAt','status']:
                vals=sorted(set(str(o['raw'][field]) for o in obs if o['raw'].get(field) is not None))
                fields[field]=vals[0] if len(vals)==1 else U
                fields[field+'_values']=vals
            fields.update(run_id=runid,observations=obs)
            fields['request_to_start_seconds']=span(fields['requestedAt'],fields['startedAt'])
            fields['start_to_complete_seconds']=span(fields['startedAt'],fields['completedAt'])
            fields['request_to_complete_seconds']=span(fields['requestedAt'],fields['completedAt'])
            intervals.append(fields)
        starts=sorted(set(h['thread']['createdAt'] for h in hs if h['thread'].get('createdAt')))
        completed=[i['completedAt'] for i in intervals if utc(i['completedAt']) is not None]
        latest_host=max(hs,key=lambda h:utc(h['thread'].get('updatedAt')) or 0) if hs else None
        active=bool(latest_host and (latest_host['thread'].get('activeRunId') or latest_host['thread'].get('pendingRequestCount',latest_host['thread'].get('hasPendingRequest',0))))
        expected_runs=latest_host['thread'].get('runCount',U) if latest_host else U
        runs_complete=expected_runs!=U and expected_runs==len(intervals)
        quiet=bool(hs and not active and runs_complete and all(i['completedAt']!=U for i in intervals) and intervals)
        st=statuses.get(taskid,[])
        # Status receipts can establish a quiet label but cannot supply a completion timestamp.
        status_quiet=any(x['raw']['status']=='completed' and x['raw']['hasPendingChildRuns'] is False for x in st)
        end=max(completed,key=utc) if quiet else U
        start=starts[0] if len(starts)==1 else U
        request=requests.get(key); im=stage_meta.get(str(runtime/'runs'/str(d.get('slot'))/str(d.get('arm'))/'stages'/str(d.get('stage'))))
        current_stage_metadata=im or U
        metadata_bound=bool(im and stage_current_request_keys.get(str(runtime/'runs'/str(d.get('slot'))/str(d.get('arm'))/'stages'/str(d.get('stage'))))==key)
        if not metadata_bound: im=None
        route=(request or {}).get('raw',{}).get('args',{}).get('target',{}) or (im or {}).get('raw',{}).get('requested_route',{})
        tier=route.get('options',{}).get('serviceTier',U)
        if d.get('providerInstanceId') not in [None,'AUTHORIZED_PROVIDER_INSTANCE']: tier='vendor' if tier==U else tier
        deadline=(im or {}).get('raw',{}).get('stage_deadline_utc',U)
        late=span(deadline,end) if end!=U and utc(deadline) is not None and utc(end)>=utc(deadline) else 0 if end!=U and utc(deadline) is not None else U
        enforcement=[{'raw':e,'provenance':policies['STAGE_OVERRUN_ENFORCEMENT.json']['provenance']} for e in (policies['STAGE_OVERRUN_ENFORCEMENT.json']['raw'] or []) if e.get('task_id')==taskid]
        native=[g for g in goal_observations if (t['category']=='root' and g['native_thread_id']==c.get('goalNativeHarnessThreadId')) or (t['category']=='evaluation' and d.get('slot') and f"/assessment/{d['slot']}/{d.get('arm')}-v" in g['provenance']['path']) or g['host_context']==tid or (d.get('slot') and f"/runs/{d['slot']}/{d.get('arm')}/stages/{d.get('stage')}/" in g['provenance']['path'])]
        results.append({**t,'host_intervals':intervals,'host_thread_observations':hs,'host_status_observations':st,'host_proof_missing':not bool(hs),'expected_host_run_count':expected_runs,'host_run_inventory_complete':runs_complete,'quiet_label_observed':quiet or status_quiet,'quiet_final_at':end,'context_created_at':start,'occupied_context_seconds_including_waits':span(start,end),'requested_tier':tier,'requested_route':route or U,'request_provenance':(request or {}).get('provenance',U),'stage_metadata':im or U,'stage_metadata_binding':'current request key matches declared attempt' if metadata_bound else U,'current_stage_metadata_unbound':current_stage_metadata if not metadata_bound else U,'stage_lateness_seconds':late,'overrun_enforcement':enforcement,'native_association_limit':'Host-context matches are exact; local stage-path matches may span multiple attempts and are not original-Goal proof.','native_identity_keys':sorted(set(g['identity_key'] for g in native)),'native_proof':'HOST_GOAL_OUTPUT_OBSERVED' if any(g['evidence_kind']=='host_dynamic_tool' for g in native) else 'UNOBSERVED','original_failed_context':any(x['raw']['status'] in ['failed','cancelled','canceled'] for x in st) or d.get('status') in ['failed','cancelled','canceled'],'native_invalid_context':U,'frozen_native_lifecycle':frozen_native.get(taskid,U),'frozen_existing_judgments':frozen_judgments.get((d.get('slot'),d.get('arm')),[]) or U,'billing':U,'cached_input':U,'vendor_effective_settings':U})
    grouped=collections.defaultdict(list)
    for o in goal_observations:
        grouped[o['identity_key'] if o['identity_key']!=U else 'unidentified:'+o['provenance']['path']+o['provenance']['pointer']].append(o)
    goals=[]
    for key,obs in sorted(grouped.items()):
        raw_variants={json.dumps(o['raw'],sort_keys=True) for o in obs}
        goals.append({'accounting_categories':sorted(set(t['category'] for t in results if key in t['native_identity_keys'])) or [U],'associated_task_ids':[t['declaration'].get('taskId') for t in results if key in t['native_identity_keys']], 'identity_key':key,'actual_goal_id':next((o['actual_goal_id'] for o in obs if o['actual_goal_id']!=U),U),'identity_basis':'explicit native Goal ID' if key.startswith('goal_id:') else 'native thread + creation epoch; explicit Goal ID unavailable' if key.startswith('native_thread_creation:') else U,'objectives':sorted(set(str(o['raw'].get('objective',o.get('wrapper_objective',U))) for o in obs)),'observations':obs,'unique_raw_meter_records':len(raw_variants),'repeated_records':len(obs)-len(raw_variants),'terminal_observed':any(o['raw'].get('status')=='complete' for o in obs),'deduplicated_billable_usage':U,'meter_semantics':U,'meters_summed':False})
    arms=[]
    for slot,arm in sorted(set((t['declaration'].get('slot'),t['declaration'].get('arm')) for t in results if t['category']=='candidate' and t['declaration'].get('slot') and t['declaration'].get('arm'))):
        rs=[t for t in results if t['category']=='candidate' and t['declaration'].get('slot')==slot and t['declaration'].get('arm')==arm]
        finalrole='role' if slot.startswith('B-') else 'investigator' if slot.startswith('A2-') and arm=='treatment' else 'critic-finalizer' if slot.startswith('A7-') and arm=='treatment' else 'reviser'
        finals=[t for t in rs if t['declaration'].get('stage')==finalrole]
        # Original A2 investigator stays final; do not replace it with a latest critic.
        final=finals[0] if len(finals)==1 else None
        reqs=[i['requestedAt'] for t in rs for i in t['host_intervals'] if utc(i['requestedAt']) is not None]
        first=min(reqs,key=utc) if reqs and all(t['host_intervals'] for t in rs) else U
        end=final['quiet_final_at'] if final else U
        tiers={t['requested_tier'] for t in rs}
        tierclass='UNKNOWN' if U in tiers else 'mixed' if len(tiers)>1 else next(iter(tiers))
        pairs=[(t['context_created_at'],t['quiet_final_at']) for t in rs if t['occupied_context_seconds_including_waits']!=U]
        occupied=sum(t['occupied_context_seconds_including_waits'] for t in rs if t['occupied_context_seconds_including_waits']!=U)
        arms.append({'slot':slot,'arm':arm,'attempt_task_ids':[t['declaration'].get('taskId') for t in rs],'final_role':finalrole,'final_task_id':final['declaration'].get('taskId') if final else U,'first_request_at':first,'quiet_final_at':end,'candidate_latency_seconds':span(first,end),'observed_occupied_context_sum_seconds':round(occupied,6),'observed_context_union_seconds':union_seconds(pairs),'observed_overlap_seconds':round(occupied-union_seconds(pairs),6),'missing_context_lifetimes':sum(t['occupied_context_seconds_including_waits']==U for t in rs),'complete_occupied_context_sum_seconds':round(occupied,6) if len(pairs)==len(rs) else U,'tier_stratum':tierclass,'source_or_native_pass':U,'frozen_existing_judgment':frozen_judgments.get((slot,arm),[]) or U})
    categories={}
    for category in ['candidate','preparation','root','evaluation','publication','support']:
        rows=[t for t in results if t['category']==category]; pairs=[(t['context_created_at'],t['quiet_final_at']) for t in rows if t['occupied_context_seconds_including_waits']!=U]
        total=round(sum(t['occupied_context_seconds_including_waits'] for t in rows if t['occupied_context_seconds_including_waits']!=U),6)
        categories[category]={'declared_tasks':len(rows),'observed_context_sum_seconds':total if rows else U,'observed_context_union_seconds':union_seconds(pairs) if rows else U,'observed_overlap_seconds':round(total-union_seconds(pairs),6) if rows else U,'missing_context_lifetimes':sum(t['occupied_context_seconds_including_waits']==U for t in rows),'complete_context_sum_seconds':total if rows and len(rows)==len(pairs) else U}
    failure_separation={'host_failed_or_cancelled_task_ids':[t['declaration'].get('taskId') for t in results if t['original_failed_context']],'frozen_native_unqualified_task_ids':[t['declaration'].get('taskId') for t in results if isinstance(t['frozen_native_lifecycle'],dict) and t['frozen_native_lifecycle']['raw'].get('status')=='NATIVE_UNQUALIFIED_UNSUPPORTED'],'other_native_invalid_classification':U,'qualification':'Frozen labels only; unobserved native proof is not an invalid/PASS verdict. All contexts remain in accounting.'}
    changed=[]
    for item in sources.values():
        p=Path(item['path'])
        if not p.exists() or hashlib.sha256(p.read_bytes()).hexdigest()!=item['sha256']: changed.append(item['path'])
    return {'schema':'er12.accounting-extractor.v1','generated_at_utc':dt.datetime.now(dt.timezone.utc).isoformat(),'checkpoint':prov(checkpoint,''),'runtime':str(runtime),'policies':policies,'declared_tasks':results,'logical_arms':arms,'native_goals':goals,'authored_goal_records':authored_goal_records,'failure_separation':failure_separation,'sources_changed_during_extraction':changed,'accounting_by_category':categories,'root_native_meter_is_campaign_aggregate':False,'campaign_billable_tokens':U,'campaign_billing':U,'campaign_cached_input':U,'complete_campaign_context_lifetime_seconds':U,'source_or_native_pass_from_delivery_counts':False,'missing_values_encoding':U,'read_errors':errors,'source_manifest':sorted(sources.values(),key=lambda x:x['path'])}

def main():
    ap=argparse.ArgumentParser();ap.add_argument('--checkpoint',required=True);ap.add_argument('--runtime',required=True);ap.add_argument('--output',required=True)
    args=ap.parse_args(); output=Path(args.output).resolve(); allowed=Path(__file__).resolve().parent
    if output.parent!=allowed: ap.error('output must be directly inside accounting-extractor-v1; inputs are read-only')
    obj=extract(args.checkpoint,args.runtime); output.write_text(json.dumps(obj,indent=2,ensure_ascii=False)+'\n')
    print(json.dumps({'output':str(output),'tasks':len(obj['declared_tasks']),'logical_arms':len(obj['logical_arms']),'native_identity_groups':len(obj['native_goals']),'missing_host_proof':sum(t['host_proof_missing'] for t in obj['declared_tasks']),'source_files':len(obj['source_manifest'])}))
if __name__=='__main__':main()
