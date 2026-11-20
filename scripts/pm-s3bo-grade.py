#!/usr/bin/env python3
"""Re-anchor s3b's assessment, retain incomplete oracle grades, apply E8-5 B.

Every quote is checked against current source text. Only the expressly answered
quarantine custody cell changes status; a finite table proof cannot imply full
family coverage. Run after the implementation commit, before the report commit.
"""
import argparse
import collections
import copy
import difflib
import hashlib
import json
from pathlib import Path
import subprocess

ROOT=Path(__file__).resolve().parents[1]
BASE='reports/event-authority-20261114/depth-s3b-registered-families.json'
OUT='reports/event-authority-20261114/depth-s3bo-registered-families'
GAPS={
 'platform.capability_evaluated':'Complete CAP-POS/CAP-NEG source-context and decision/read joins; the bounded schema/read-output checks do not execute the complete family boundary.',
 'restore_point.applied':'Complete original Chat materialization/preflight/result/crash cases, including source custody and every refused/failed path.',
 'restore_point.corrupt':'All four corruption/reason-precedence branches and terminal-exclusion paths with complete FileSafe evidence joins.',
 'restore_point.created':'ACD-465 original capture constructor: history-property to category mapping, full category coverage and lawful emptiness.',
 'restore_point.expired':'Refreeze the SP-275 pinned v5 expiry package for the DL-076 nine-field stored token; its contradictory old stored snapshot is not superseded here.',
 'safe_point.recovery_unavailable':'Every reason/action/pre-attempt/post-attempt and anchor-resolution/withdrawal path with original episode custody.',
 'seglog.event_appended':'Refreeze the SP-270 pinned relational/prefix/retention package for DL-076; the new token tests alone do not supersede it.',
 'storage.boot_recovery':'Complete original post-restore producer admission, earliest-floor and cardinality paths beyond the bounded epoch/anchor comparisons.',
 'storage.compaction_lifecycle_changed':'SP-295..297 original source/effect/settlement negatives remain unexecuted; the new checker proves passive history and common guards only.',
 'storage.deletion_lifecycle_changed':'Complete failed-retry re-admission, all lifecycle/effect/tombstone/compaction paths and original purge completion custody.',
 'storage.integrity_detected':'SP-279 full-u64 semantic success adapter and exact_event corroboration; current-JCS refusal is not a successful downstream adapter.',
 'storage.recovery_applied':'Every SP-293 passive-read health path and complete aftermath/checkpoint transition coverage.',
 'storage.retention_hold_changed':'Complete SIR command/acknowledgement, hold-union, source, backup and restore paths beyond closed-value fixtures and bounded fresh-admission comparisons.',
 'storage.value_quarantine_changed':'Complete class/state/re-detection/recovery/effect/custody cases; E8-5 deletion/resolution/hold examples pass separately.',
}


def evidence(path,unit,quote,near=0):
    text=(ROOT/path).read_text();hits=[];pos=text.find(quote)
    while pos>=0:
        start=text.count('\n',0,pos)+1;end=text.count('\n',0,pos+len(quote))+1
        hits.append((start,end));pos=text.find(quote,pos+1)
    if not hits:raise ValueError('Missing exact quote in '+path+': '+quote)
    start,end=min(hits,key=lambda x:abs(x[0]-near)) if near else hits[0]
    excerpt='\n'.join(text.split('\n')[start-1:end])
    assert quote in excerpt
    return dict(path=path,unit=unit,line_start=start,line_end=end,quote=quote,
                excerpt_sha256=hashlib.sha256(excerpt.encode()).hexdigest(),quote_check='exact')


def main():
    parser=argparse.ArgumentParser();parser.add_argument('--commit',required=True);args=parser.parse_args()
    report=json.loads((ROOT/BASE).read_text());report=copy.deepcopy(report)
    shifts={}
    def anchor(ev):
        path=ev['path']
        if path not in shifts:
            old=subprocess.check_output(['git','show','5f0726c0f0:'+path],cwd=ROOT,text=True).splitlines()
            new=(ROOT/path).read_text().splitlines();mapping={}
            for match in difflib.SequenceMatcher(a=old,b=new,autojunk=True).get_matching_blocks():
                for i in range(match.size):mapping[match.a+i+1]=match.b+i+1
            shifts[path]=mapping
        return evidence(path,ev['unit'],ev['quote'],shifts[path].get(ev['line_start'],ev['line_start']))
    total=0;counts=collections.Counter();by_criterion={}
    for row in report['rows']:
        for criterion,cell in row['cells'].items():
            if criterion=='positive_negative_oracles':
                cell['finding']='ATS-2206 binds the bounded executable checker and its guard/mutation proof. Complete family-boundary coverage remains unfinished; the proof does not refreeze contradictory pinned packages or fill missing source constructors. Criterion 12 stays PARTIAL.'
                cell['evidence']=[evidence('Plans/Automated_Testing_System.md','ATS-2206',
                     'These are bounded executable checks, not complete criterion-12 closure for the fourteen families.')]
                cell['prior']={'source':BASE,'status':'PARTIAL'};cell['change']='carried'
                cell['change_reason']='An executable bounded checker now exists, but ATS-2206 explicitly preserves the remaining complete-family coverage gaps.'
            elif criterion=='redaction_custody' and row['event_type']=='storage.value_quarantine_changed':
                cell.update(status='PASS',representation='exact_normative_owner',
                   finding='SP-2201 retains source permissions, protected export, mandatory-backup custody and read-time deletion checks. SP-2211 applies signed E8-5 B: deleted-scope raw bytes remain until resolution, then are deleted subject to holds. S3B-Q1 is resolved; oracle completeness is graded separately.',
                   evidence=[evidence('Plans/storage-plan.md','SP-2201','raw bytes stay in quarantine custody, inherit their source\'s permissions'),
                             evidence('Plans/storage-plan.md','SP-2201','Backup and restore keep `storage_quarantine_record` under its mandatory-backup recovery anchor'),
                             evidence('Plans/storage-plan.md','SP-2211','When a thread or Project is deleted, its quarantined raw bytes stay in their existing quarantine custody until the quarantine resolves.'),
                             evidence('Plans/storage-plan.md','SP-2211','An active hold keeps those bytes even after resolution.')],
                   prior={'source':BASE,'status':'PARTIAL'},change='upgraded',
                   change_reason='Jared answered E8-5 B; SP-2211 applies the signed decision and executable thread/Project examples cover resolution and holds.')
            else:
                cell['evidence']=[anchor(ev) for ev in cell['evidence']]
            total+=len(cell['evidence']);counts[cell['status']]+=1
            by_criterion.setdefault(criterion,collections.Counter())[cell['status']]+=1
        if row['event_type']=='storage.value_quarantine_changed':
            row['remaining_gaps']=[g for g in row['remaining_gaps'] if 'S3B-Q1' not in g]
            row['current_owner_units']=list(dict.fromkeys(row.get('current_owner_units',[])+['SP-2211']))
            row['contingency_questions']=[]
        row['remaining_gaps']=['Criterion 12: '+GAPS[row['event_type']],
                               'ATS-2206: the entire shared corpus through every complete family boundary remains unfinished.']
        row['static_checks_seen']=list(dict.fromkeys(row.get('static_checks_seen',[])+['scripts/pm-s3bo-check.py matrix / batteries / guards']))
        row['pass_count']=sum(cell['status']=='PASS' for cell in row['cells'].values())
        row['normative_depth_complete']=row['pass_count']==12
        if 'disposition_evidence' in row:
            row['disposition_evidence']=[anchor(ev) for ev in row['disposition_evidence']]
            total+=len(row['disposition_evidence'])
    report.update(assessment_id='EA-PNC019-S3BO-20261114',
                  assessed_tree={'branch':'plans/ea-pnc-s3bo-20261114','commit':args.commit,
                                 'note':'Bounded executable oracle evidence and E8-5 B custody application; criterion-12 closure remains incomplete.'},
                  supersedes={'path':BASE,'note':'Supersedes these 14 rows only, retaining every incomplete oracle cell.'},
                  status_counts=dict(counts),status_counts_by_criterion={k:dict(v) for k,v in by_criterion.items()},
                  normative_depth_complete_families=[],
                  pass_counts={r['event_type']:sum(c['status']=='PASS' for c in r['cells'].values()) for r in report['rows']},
                  evidence_items=total,quote_check={'exact':total},
                  method={'rubric':report['method']['rubric'],'grading':'All prior quotes re-anchored and exact-checked; only the signed E8-5 B custody answer changes a status. Complete oracle coverage is not inferred from bounded proof.'},
                  note='Criterion 12 remains PARTIAL for all 14 families. Quarantine custody is PASS after SP-2211. Native execution remains NOT_RUN.')
    (ROOT/(OUT+'.json')).write_text(json.dumps(report,indent=1)+'\n')
    lines=['# PNC-019 s3bo depth re-grade','','Implementation: `'+args.commit+'`. Every quote is exact-checked against this tree.',
           '', '| Family | PASS cells | Criterion 12 | Custody |','|---|---:|---|---|']
    for row in report['rows']:
        lines.append('| `'+row['event_type']+'` | '+str(report['pass_counts'][row['event_type']])+'/12 | '+row['cells']['positive_negative_oracles']['status']+' | '+row['cells']['redaction_custody']['status']+' |')
    lines+=['','Totals: '+str(dict(counts))+'. All 14 oracle cells remain PARTIAL. E8-5 B closes only the quarantine custody gap.',
            '','No family reaches 12/12. Native execution is NOT_RUN. Detailed evidence and remaining gaps are in the JSON companion.','']
    (ROOT/(OUT+'.md')).write_text('\n'.join(lines))
    print(json.dumps({'status_counts':dict(counts),'exact_quotes':total,'pass_counts':report['pass_counts']}))


if __name__=='__main__':main()
