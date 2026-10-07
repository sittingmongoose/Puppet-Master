#!/usr/bin/env python3
"""Independent numeric/partition checks plus in-memory adversarial mechanics; no recapture."""
import argparse
import collections
import datetime as dt
import hashlib
import importlib.util
import io
import json
from pathlib import Path
import stat
import sys
sys.dont_write_bytecode=True
HERE=Path('/home/sittingmongoose/PM-Experiments/er10-20261007-5a126dd5/helpers/recorded-usage-v2')
FIELDS=('input_tokens','cached_input_tokens','cache_write_input_tokens','output_tokens','reasoning_output_tokens','total_tokens')

def digest(raw):return hashlib.sha256(raw).hexdigest()
def load_reader():
    p=HERE/'reader.py';spec=importlib.util.spec_from_file_location('role_separated_reader',p)
    r=importlib.util.module_from_spec(spec);spec.loader.exec_module(r);return r

def mechanical_checks(r):
    checks=[]
    def ok(name, condition):
        checks.append({'check':name,'passed':bool(condition)})
        if not condition:raise AssertionError(name)
    def record(directory,**fields):
        return {'fields':fields,'field_sources':{},'source':{'path':'SYNTHETIC','sha256':'SYNTHETIC','json_pointer':'/receipt/childThreadId'},'receipt_output_directory':str(r.ROOT/directory)}
    candidate=r.role_mapping([record('jobs/C-TEST/control/critic-v3',case='C-TEST',arm='control',stage='critic-v3')])
    review=r.role_mapping([record('reviews/test/C-TEST/control/source-review-v3',case='C-TEST',arm='control',stage='source-review-v3')])
    paired=r.role_mapping([record('reviews/test/C-TEST-v3/J1',case='C-TEST-v3',role='review')])
    masked=r.role_mapping([record('reviews/test/C-TEST/X/review-v3',case='C-TEST',arm='X',role='review')])
    seed=r.role_mapping([record('jobs/C-TEST/common/seed-v3',case='C-TEST',arm='common',stage='seed-v3')])
    conflict=r.role_mapping([record('jobs/C-TEST/control/research-v3',role='independent_review')])
    absent=r.role_mapping([{'fields':{'taskId':'synthetic-candidate-control-research-v9'},'source':{'path':'SYNTHETIC'},'field_sources':{}}])
    ok('jobs_critic_is_candidate_not_independent_review',candidate['category']=='candidate')
    ok('reviews_source_review_is_separate_category',review['category']=='independent_source_review')
    ok('J_neutral_reviewer_remains_paired_not_copied_to_arms',paired['arm']=='paired_or_unattributed' and paired['category']=='independent_source_review')
    ok('X_masked_reviewer_not_invented_candidate_arm',masked['arm']=='paired_or_unattributed')
    ok('common_seed_explicit_once_reference',seed['common_seed'] and seed['arm']=='common')
    ok('conflicting_path_and_explicit_review_role_HOLD',conflict['category']=='unattributed' and conflict['status'].startswith('HOLD'))
    ok('task_name_never_invents_labels_or_ID',absent['category']=='unattributed')
    referenced=record('reviews/test/C-TEST/source-review-v3',case='C-TEST')
    referenced['source']['json_pointer']='/slots/0/review/gate/receipts/0/childThreadId'
    original_candidate=record('jobs/C-TEST/control/research-v3',case='C-TEST',arm='control',stage='research-v3')
    gate_case=r.role_mapping([referenced,original_candidate])
    ok('review_quiet_gate_candidate_reference_does_not_inherit_review_directory',gate_case['category']=='candidate' and not gate_case['conflicts'] and gate_case['review_labels']==[])
    def session(n,m,inp,out,status='QUIET_SESSION_OBSERVED'):
        return {'native_id':n,'role_mapping':m,'measurement_status':status,'recorded_models':['model-test'],
                'reported_total_token_usage':dict(zip(FIELDS,(inp,1,0,out,1,inp+out)))}
    cases=[session('candidate',candidate,10,2),session('review',review,20,3),session('paired',paired,30,4),session('seed',seed,40,5),session('live',candidate,999,9,'SKIP_live_or_unknown_no_body_read')]
    groups=r.make_groups(cases)
    ok('mixed_roles_not_combined_even_same_case_arm_version',len(groups)==4 and len({g['category'] for g in groups})==2)
    ok('native_session_partition_live_exclusion_seed_not_copied',sorted(n for g in groups for n in g['native_ids'])==['candidate','paired','review','seed'])
    ok('fixed_expected_arithmetic_uses_final_once_not_subsets',sum(g['field_sums']['total_tokens'] for g in groups)==114)
    try:r.make_groups(cases+[cases[0]])
    except ValueError:duplicate=True
    else:duplicate=False
    ok('duplicate_native_session_rejected_before_sums',duplicate)
    original=r.original_functions()
    malformed={'input_tokens':10,'cached_input_tokens':11,'cache_write_input_tokens':0,'output_tokens':2,'reasoning_output_tokens':3,'total_tokens':13}
    ok('independent_invalid_subset_and_total_vectors_detected',set(original.usage_issues(malformed))=={'input_plus_output_ne_total','cache_gt_input','reasoning_gt_output'})
    ok('missing_usage_field_is_not_zero',original.usage_issues({'input_tokens':10})==['missing:'+f for f in FIELDS if f!='input_tokens'])
    t=dt.datetime(2026,10,7,23,0,tzinfo=dt.timezone.utc)
    cfg={'campaign_root':str(r.ROOT),'root_owner':r.ROOT_ID,'predispatch_at':t.isoformat(),
         'deadline':(t+dt.timedelta(minutes=30)).isoformat(),'writing_reserve_seconds':300,
         'max_sessions':500,'max_file_bytes':268435456,'max_total_selected_bytes':2147483648,'max_line_bytes':8388608}
    ok('fixed_30minute_config_accepts_before_reserve',r.config_check(cfg,HERE,t+dt.timedelta(minutes=24))==t+dt.timedelta(minutes=25))
    refused=0
    for when in (t-dt.timedelta(seconds=1),t+dt.timedelta(minutes=25),t+dt.timedelta(minutes=31)):
        try:r.config_check(cfg,HERE,when)
        except ValueError:refused+=1
    ok('future_reserve_and_expired_configs_refused',refused==3)
    f=r.DeadlineFile(io.BytesIO(b'line\n'),t)
    try:f.readline(100)
    except r.ReadingCutoff:stopped=True
    else:stopped=False
    ok('stream_respects_absolute_reading_cutoff',stopped)
    # Genuine syntax fixture exercises the reused streaming whitelist without disk or transcript retention.
    native='00000000-0000-0000-0000-000000000001'
    token={'input_tokens':10,'cached_input_tokens':4,'cache_write_input_tokens':0,'output_tokens':2,'reasoning_output_tokens':1,'total_tokens':12}
    events=[{'timestamp':'2026-10-07T23:00:00Z','type':'session_meta','payload':{'id':native,'cwd':'/synthetic','creator_account_id':'synthetic-route-transient'}},
            {'timestamp':'2026-10-07T23:00:01Z','type':'response_item','payload':{'text':'SYNTHETIC_TRANSCRIPT_SENTINEL'}},
            {'timestamp':'2026-10-07T23:00:02Z','type':'turn_context','payload':{'model':'model-test','effort':'xhigh','secret_text':'SYNTHETIC_TRANSCRIPT_SENTINEL'}},
            {'timestamp':'2026-10-07T23:00:03Z','type':'event_msg','payload':{'type':'token_count','info':{'total_token_usage':token,'last_token_usage':token},'rate_limits':{'secret':'SYNTHETIC_TRANSCRIPT_SENTINEL'}}}]
    raw=b''.join(json.dumps(x,separators=(',',':')).encode()+b'\n' for x in events)
    class FakeStat:
        st_size=len(raw);st_mtime_ns=1;st_dev=1;st_ino=1
    class FakePath:
        def stat(self):return FakeStat()
        def open(self,mode):return io.BytesIO(raw)
        def __str__(self):return '/synthetic/rollout-'+native+'.jsonl'
    selected,transient=original.read_session(FakePath(),native,'/synthetic','synthetic-route-transient')
    retained=json.dumps(selected)
    ok('whitelist_ignores_messages_tooltext_rate_limits_and_creator',all(x not in retained for x in ('SYNTHETIC_TRANSCRIPT_SENTINEL','creator_account_id','synthetic-route-transient','rate_limits','secret_text')))
    ok('actual_syntax_final_cumulative_first_last_one_snapshot',selected['reported_total_token_usage']==token and selected['token_count_event_count']==1 and not selected['issues'])
    # Vary actual cumulative/last-event syntax, rather than mirroring the grouping implementation.
    def stream_case(totals,lasts):
        data=events[:3]+[{'timestamp':'2026-10-07T23:00:03Z','type':'event_msg','payload':{'type':'token_count','info':{'total_token_usage':a,'last_token_usage':b}}} for a,b in zip(totals,lasts)]
        payload=b''.join(json.dumps(x,separators=(',',':')).encode()+b'\n' for x in data)
        class P:
            def stat(self):
                class S:st_size=len(payload);st_mtime_ns=1;st_dev=1;st_ino=1
                return S()
            def open(self,mode):return io.BytesIO(payload)
            def __str__(self):return '/synthetic/variation.jsonl'
        return original.read_session(P(),native,'/synthetic','synthetic-route-transient')[0]
    next_total=dict(zip(FIELDS,(20,8,0,4,2,24)))
    repeated=stream_case([token,token,next_total],[token,token,token])
    ok('repeated_cumulative_snapshots_not_additive',repeated['reported_total_token_usage']['total_tokens']==24 and repeated['repeated_cumulative_snapshot_count']==1 and not repeated['issues'])
    decreasing=stream_case([token,next_total,token],[token,token,token])
    ok('counter_reset_nonmonotonic_HOLD_evidence',any(x.startswith('cumulative_decrease:input_tokens') for x in decreasing['issues']))
    carry=stream_case([next_total],[token])
    ok('initialcarry_not_assumed_fresh', 'initial_context_carry_or_cumulative_origin_ambiguous' in carry['issues'])
    broken_last=dict(token,total_tokens=999)
    last_bad=stream_case([token,next_total],[token,broken_last])
    ok('last_event_arithmetic_ambiguity_preserved_HOLD', 'last_token_usage:input_plus_output_ne_total' in last_bad['issues'] and last_bad['last_token_count_event']['info']['last_token_usage']['total_tokens']==999)
    return checks


def validate(observation):
    r=load_reader();checks=mechanical_checks(r);failures=[]
    def check(name,condition):
        checks.append({'check':name,'passed':bool(condition)})
        if not condition:failures.append(name)
    raw=observation.read_bytes();v=json.loads(raw)
    manifest_path=Path(v['authority_manifest']['path']);mraw=manifest_path.read_bytes();m=json.loads(mraw)
    check('immutable_observation_and_manifest_mode',stat.S_IMODE(observation.stat().st_mode)==0o444 and stat.S_IMODE(manifest_path.stat().st_mode)==0o444)
    check('manifest_hash_matches_frozen_observation',digest(mraw)==v['authority_manifest']['sha256'])
    check('reader_hash_matches_observation',digest((HERE/'reader.py').read_bytes())==v['reader_sha256'])
    check('original_reader_pinned_verified_hash',v['original_reader_sha256']==r.OLD_SHA and digest(r.OLD.read_bytes())==r.OLD_SHA)
    ss=v['sessions'];index={s['native_id']:s for s in ss}
    check('session_inventory_unique_native',len(ss)==len(index))
    group_members=[n for g in v['groups'] for n in g['native_ids']]
    check('each_native_once_across_all_role_stage_model_groups',len(group_members)==len(set(group_members)))
    expected_sums={f:0 for f in FIELDS};by_category=collections.defaultdict(lambda:{f:0 for f in FIELDS})
    all_groups=True;group_status=True;role_consistent=True;paired_safe=True;candidate_safe=True
    for g in v['groups']:
        numeric={f:0 for f in FIELDS}
        for n in g['native_ids']:
            s=index[n];a=s['role_mapping'];u=s['reported_total_token_usage']
            group_status &= s['measurement_status']=='QUIET_SESSION_OBSERVED' and s['liveness']=='quiet_terminal_runs_and_bindings' and not s['issues']
            role_consistent &= a['category']==g['category'] and a['stage']==g['stage'] and a['case']==g['case'] and a['arm']==g['scientific_arm'] and a['version']==g['version']
            candidate_safe &= not (g['category']=='candidate' and a['review_track'] is not None)
            if a['review_labels'] and any(x not in ('control','treatment') for x in a['review_labels']):paired_safe &= g['scientific_arm']=='paired_or_unattributed' and g['category']=='independent_source_review'
            for f in FIELDS:
                numeric[f]+=u[f];expected_sums[f]+=u[f];by_category[g['category']][f]+=u[f]
        all_groups &= numeric==g['field_sums'] and len(g['native_ids'])==g['unique_session_count']
    check('independent_all_subgroup_numeric_sums',all_groups)
    check('live_or_telemetry_HOLD_never_in_completed_sums',group_status)
    check('single_category_stage_case_arm_version_per_group',role_consistent)
    check('candidate_groups_contain_no_review_directory_sessions',candidate_safe)
    check('paired_neutral_reviews_never_copied_or_split',paired_safe)
    check('independent_campaign_selected_sum',v['campaign_selected_quiet_SDK_work']['field_sums']==(expected_sums if group_members else None))
    check('campaign_sum_partition_equals_groups',set(v['campaign_selected_quiet_SDK_work']['native_ids'])==set(group_members))
    for category,record in v['category_totals'].items():
        ns=[n for g in v['groups'] if g['category']==category for n in g['native_ids']]
        check('category_sum_'+category,record['unique_session_count']==len(ns) and record['field_sums']==(dict(by_category[category]) if ns else None))
    seeds=v['common_seed_ledger']
    check('common_seed_ledger_unique_and_reference_only',len(seeds)==len({x['native_id'] for x in seeds}) and all(x['ledger_is_reference_not_an_additional_sum'] and x['included_once_in_campaign_sum']==(x['native_id'] in group_members) and group_members.count(x['native_id'])<=1 for x in seeds))
    check('exact_C02_five_final_events_hashes_counters_and_arm_sums',v['C02_comparison']['exact_match_count']==5 and v['C02_comparison']['sums_equal_original_reference'] and v['account_route_qualification']['five_strong_independent_bindings_same_transient_route'])
    # Read only the original numeric qualification, never session files or scientific comparison contents.
    qpath=r.ROOT/'state/C-02-actual-Codex-session-usage-observation-v1.json'
    q=json.loads(qpath.read_bytes());gold_sums={};gold_exact=True
    for e in q['sessions']:
        s=index.get(e['native_id']) or {}
        gold_exact &= s.get('reported_total_token_usage')==e['reported_total_token_usage'] and s.get('token_count_event_count')==e['token_count_event_count']
        gold_exact &= s.get('snapshot',{}).get('sha256')==e['raw_session_snapshot_sha256'] and s.get('snapshot',{}).get('bytes')==e['snapshot_bytes']
        for event in ('first_token_count_event','last_token_count_event'):
            actual=s.get(event) or {};gold_exact &= actual.get('timestamp')==e[event]['timestamp'] and actual.get('info')==e[event]['info']
        if s.get('reported_total_token_usage'):
            total=gold_sums.setdefault(e['arm'],{f:0 for f in FIELDS})
            for f in FIELDS:total[f]+=s['reported_total_token_usage'][f]
    check('independent_original_C02_numeric_and_snapshot_reproduction',gold_exact and len(q['sessions'])==5 and gold_sums==q['recorded_session_field_sums_by_arm'])
    old=v['immutable_original_inputs']
    check('original_reader_config_README_observation_and_inputs_unchanged',old['before']==old['after'] and old['all_unchanged'])
    check('original_comparison_sha_unchanged_no_decode_grade',old['comparison_reference_sha256']==old['comparison_before_sha256']==old['comparison_after_sha256'] and not old['comparison_content_decoded_or_graded'])
    check('actual_executor_provider_model_effort_priority_verified',v['executor_configuration_check']['exact_match'])
    check('authority_500_threads_64MiB_bounds',len(m['explicit_thread_ids'])<=500 and m['authority_bytes']<=64*1024*1024)
    check('session_500_2GiB_bounds',len(ss)<=500 and v['selected_session_bytes']<=v['limits']['max_total_selected_bytes'])
    check('deadline_and_reserve_obeyed',r.stamp(v['reading_finished_at_utc'])<r.stamp(v['config']['protected_reading_cutoff']) and r.stamp(v['finished_at_utc'])<r.stamp(v['config']['deadline']))
    check('config_bytes_frozen_through_observation',v['config']['unchanged_through_observation'])
    joined=True;null_non_codex=True;live_skipped=True
    for i in v['inventory']:
        if i['disposition']=='OWNED_strong_binding_inventory':
            joined &= i['thread']['lineage']['rootThreadId']==r.ROOT_ID and (i['thread_id']==r.ROOT_ID or i['thread']['lineage']['parentThreadId'] in m['explicit_thread_ids'])
        if i['disposition'].startswith('INVENTORY_'):null_non_codex &= i['SDK_quantities'] is None
    for s in ss:
        if s['liveness']!='quiet_terminal_runs_and_bindings' and s['role_mapping']['category']!='root_partial':
            live_skipped &= s['measurement_status']=='SKIP_live_or_unknown_no_body_read' and 'snapshot' not in s and s['reported_total_token_usage'] is None
    check('all_body_reads_owned_lineage_and_explicit_parent',joined)
    check('non_Codex_inventory_only_quantities_null',null_non_codex)
    check('live_non_root_bodies_not_read',live_skipped)
    subsets_valid=True;ambiguous_held=True
    def numeric_valid(u):
        return isinstance(u,dict) and all(type(u.get(f)) is int and u[f]>=0 for f in FIELDS) and u['total_tokens']==u['input_tokens']+u['output_tokens'] and u['cached_input_tokens']<=u['input_tokens'] and u['cache_write_input_tokens']<=u['input_tokens'] and u['reasoning_output_tokens']<=u['output_tokens']
    for s in ss:
        if s['measurement_status']=='QUIET_SESSION_OBSERVED':subsets_valid &= numeric_valid(s['reported_total_token_usage'])
        for event in ('first_token_count_event','last_token_count_event'):
            if s.get(event):
                info=s[event]['info']
                if not all(numeric_valid(info.get(k)) for k in ('total_token_usage','last_token_usage')):
                    ambiguous_held &= s['measurement_status'].startswith('HOLD') and s['native_id'] not in group_members
    check('independent_subset_and_total_arithmetic_all_eligible_sessions',subsets_valid)
    check('actual_first_final_event_ambiguities_held_never_repaired',ambiguous_held)
    path_bound=True
    for n in group_members:
        s=index[n];category=s['role_mapping']['category'];dirs=[]
        for tid in s['thread_ids']:
            for rec in m['thread_metadata_records'].get(tid,[]):
                segments=rec.get('source',{}).get('json_pointer','').split('/')
                if 'gate' in segments or any('quiet_gate' in x for x in segments):continue
                if rec.get('receipt_output_directory'):dirs.append(rec['receipt_output_directory'])
                for k in ('directory','output_dir','output_directory','config_path','request_path'):
                    x=rec['fields'].get(k)
                    if isinstance(x,str):dirs.append(str(Path(x).parent) if k.endswith('_path') else x)
        roots={Path(d).relative_to(r.ROOT).parts[0] for d in dirs if Path(d).is_absolute() and Path(d).is_relative_to(r.ROOT) and Path(d).relative_to(r.ROOT).parts}
        if category=='candidate':path_bound &= 'jobs' in roots and 'reviews' not in roots
        if category=='independent_source_review' and 'reviews' in roots:path_bound &= 'jobs' not in roots
    check('independent_role_directory_binding_no_candidate_review_path_mix',path_bound)
    forbidden={'creator_account_id','account_id','credentials','access_token','refresh_token','rate_limits','credits','prompt','task','answer','findings','messages','toolargs','tool_arguments','tool_results','source_content','raw_transcript','body'}
    offending=[]
    def walk(x,p=''):
        if isinstance(x,dict):
            for k,val in x.items():
                if k in forbidden:offending.append(p+'/'+k)
                walk(val,p+'/'+k)
        elif isinstance(x,list):
            for j,val in enumerate(x):walk(val,p+'/'+str(j))
    walk(v);walk(m)
    check('metadata_and_telemetry_redaction_no_raw_transcripts_account_or_quota',not offending)
    check('no_native_Goal_usage_or_billing_scientific_total_claim',not v['native_Goal_or_context_cumulative_usage_used'] and not v['financial_rates_billing_quota_or_scientific_claim'] and v['not_complete_campaign_or_final_count_report'])
    result={'schema':'ER10-recorded-usage-v2-independent-mechanical-validation','validated_at_utc':dt.datetime.now(dt.timezone.utc).isoformat(),
        'observation':{'path':str(observation),'sha256':digest(raw),'bytes':len(raw)},
        'authority_manifest':{'path':str(manifest_path),'sha256':digest(mraw)},
        'reader_sha256':digest((HERE/'reader.py').read_bytes()),'validator_sha256':digest(Path(__file__).read_bytes()),
        'checks':checks,'check_count':len(checks),'passed_count':sum(c['passed'] for c in checks),
        'failures':failures,'forbidden_paths':offending,'coverage':v['coverage'],
        'C02_exact_match_count':v['C02_comparison']['exact_match_count'],'root_final_count_report_is_separate':True,
        'validation_did_not_read_session_files_or_recapture_projections':True}
    dest=observation.parent/'validation.json'
    with dest.open('x') as fp:json.dump(result,fp,indent=2);fp.write('\n')
    dest.chmod(0o444)
    print(json.dumps({'path':str(dest),'sha256':digest(dest.read_bytes()),'checks':len(checks),'passed':sum(c['passed'] for c in checks),'failures':failures},indent=2))
    return bool(failures)

if __name__=='__main__':
    parser=argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--mechanical-only',action='store_true')
    parser.add_argument('--observation',type=Path)
    args=parser.parse_args()
    if args.mechanical_only:
        checks=mechanical_checks(load_reader());print(json.dumps({'checks':len(checks),'passed':sum(c['passed'] for c in checks)},indent=2))
    elif args.observation:sys.exit(validate(args.observation))
    else:parser.error('choose --mechanical-only or --observation')
