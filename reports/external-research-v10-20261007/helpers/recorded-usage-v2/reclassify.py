#!/usr/bin/env python3
"""Rebuild role partitions from a frozen V2 capture/manifest; never recapture any source."""
import argparse
import collections
import copy
import datetime as dt
import hashlib
import importlib.util
import json
from pathlib import Path
import sys
sys.dont_write_bytecode=True
HERE=Path('/home/sittingmongoose/PM-Experiments/er10-20261007-5a126dd5/helpers/recorded-usage-v2')

def sha(raw):return hashlib.sha256(raw).hexdigest()
def main():
    parser=argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--capture',required=True,type=Path)
    parser.add_argument('--manifest',required=True,type=Path)
    parser.add_argument('--out',required=True,type=Path)
    args=parser.parse_args()
    if not args.out.resolve().is_relative_to(HERE):raise SystemExit('This metadata-only repair writes only under V2')
    capture_raw=args.capture.read_bytes();manifest_raw=args.manifest.read_bytes()
    initial=json.loads(capture_raw);manifest=json.loads(manifest_raw)
    if initial['authority_manifest']['sha256']!=sha(manifest_raw):raise SystemExit('Frozen manifest/capture mismatch')
    if initial['schema']!='ER10-role-separated-owned-recorded-SDK-usage-v2':raise SystemExit('Expected frozen V2 capture')
    deadline=dt.datetime.fromisoformat(initial['config']['deadline'])
    if dt.datetime.now(dt.timezone.utc)>=deadline:raise SystemExit('Own fixed deadline expired')
    spec=importlib.util.spec_from_file_location('v2_reader',HERE/'reader.py')
    r=importlib.util.module_from_spec(spec);spec.loader.exec_module(r)
    final=copy.deepcopy(initial);records=manifest['thread_metadata_records']
    for i in final['inventory']:i['role_mapping']=r.role_mapping(records[i['thread_id']],i['thread_id'])
    for s in final['sessions']:
        rows=[record for tid in s['thread_ids'] for record in records[tid]]
        s['role_mapping']=r.role_mapping(rows,r.ROOT_ID if s['thread_ids']==[r.ROOT_ID] else None)
    final['groups']=r.make_groups(final['sessions']);final['category_totals']=r.sum_categories(final['groups'])
    index={s['native_id']:s for s in final['sessions']};members=[n for g in final['groups'] for n in g['native_ids']]
    final['campaign_selected_quiet_SDK_work']={'native_ids':members,'unique_session_count':len(members),
        'field_sums':{f:sum(index[n]['reported_total_token_usage'][f] for n in members) for f in r.FIELDS} if members else None,
        'complete_campaign_total':False,'stage_groups_are_partition_not_additional_usage':True}
    final['common_seed_ledger']=[{'native_id':s['native_id'],'case':s['role_mapping']['case'],
        'stage':s['role_mapping']['stage'],'version':s['role_mapping']['version'],
        'measurement_status':s['measurement_status'],'included_once_in_campaign_sum':s['native_id'] in members,
        'reported_total_token_usage':s['reported_total_token_usage'],
        'presentation_only_cold_arm_charge_requires_explicit_root_policy':True,
        'ledger_is_reference_not_an_additional_sum':True}
        for s in final['sessions'] if s['role_mapping'].get('common_seed')]
    final['coverage']['role_categories']=dict(collections.Counter(s['role_mapping']['category'] for s in final['sessions']))
    final['coverage']['quiet_grouped_native_sessions']=len(members)
    final['coverage']['stage_role_model_groups']=len(final['groups'])
    before={s['native_id']:{k:v for k,v in s.items() if k!='role_mapping'} for s in initial['sessions']}
    after={s['native_id']:{k:v for k,v in s.items() if k!='role_mapping'} for s in final['sessions']}
    if before!=after:raise SystemExit('Reclassification tried to change captured telemetry/identity/liveness')
    if set(members)!=set(initial['campaign_selected_quiet_SDK_work']['native_ids']) or final['campaign_selected_quiet_SDK_work']['field_sums']!=initial['campaign_selected_quiet_SDK_work']['field_sums']:
        raise SystemExit('Campaign native partition/counters changed')
    final['captured_by_reader_sha256']=initial['reader_sha256']
    final['reader_sha256']=sha((HERE/'reader.py').read_bytes())
    final['metadata_only_role_reclassification']={'capture_path':str(args.capture.resolve()),
        'capture_sha256':sha(capture_raw),'capture_manifest_path':str(args.manifest.resolve()),
        'capture_manifest_sha256':sha(manifest_raw),'reclassifier_sha256':sha(Path(__file__).read_bytes()),
        'reason':'A quiet-gate receipt references the candidate being checked; its enclosing review directory does not bind the candidate output directory.',
        'session_data_identity_liveness_and_counter_bytes_unchanged':before==after,
        'campaign_native_partition_and_quantity_unchanged':True,
        'source_files_SQL_projections_session_files_recaptured':False}
    manifest['role_map']={i['thread_id']:i['role_mapping'] for i in final['inventory']}
    manifest['selection_rules']['quiet_gate_receipts_are_reference_only_for_role_attribution']=True
    manifest['mechanical_capture_manifest']={'path':str(args.manifest.resolve()),'sha256':sha(manifest_raw)}
    args.out.mkdir(parents=True,exist_ok=True)
    if any(args.out.glob('observation-*.json')):raise SystemExit('Final immutable observation already exists')
    mf=r.write_immutable(args.out/'authority-manifest.json',manifest)
    final['authority_manifest']=mf
    final['captured_finished_at_utc']=initial['finished_at_utc']
    final['finished_at_utc']=dt.datetime.now(dt.timezone.utc).isoformat()
    raw=json.dumps(final,indent=2,ensure_ascii=False).encode()+b'\n'
    dest=args.out/('observation-'+r.stamp(initial['observed_at_utc']).strftime('%Y%m%dT%H%M%SZ')+'-'+sha(raw)[:16]+'.json')
    result=r.write_immutable(dest,final)
    print(json.dumps({'observation':result,'manifest':mf,'coverage':final['coverage'],
                      'source_recapture':False,'session_telemetry_changed':False},indent=2))

if __name__=='__main__':main()
