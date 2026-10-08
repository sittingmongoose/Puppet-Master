#!/usr/bin/env python3
"""Freeze exact late M06-B metadata and source-scoped field bindings."""
from pathlib import Path
import copy
import hashlib
import json

R = Path('/home/sittingmongoose/PM-Experiments/er10-20261007-5a126dd5')
H = R / 'helpers/final-report'
OUT = H / 'future-closure-bindings-v1/M06B'

def main():
    OUT.mkdir(exist_ok=False)
    files, docs, rules = {}, {}, []
    def freeze(rel):
        sid = 'final_m06b/' + rel
        p = R / rel
        body = p.read_bytes()
        target = 'inputs/' + hashlib.sha256(sid.encode()).hexdigest() + '.json'
        (OUT / target).parent.mkdir(exist_ok=True)
        (OUT / target).write_bytes(body)
        files[sid] = dict(source=sid, original_path=str(p), bundle_path=target,
                          sha256=hashlib.sha256(body).hexdigest(), bytes=len(body))
        docs[sid] = json.loads(body)
        return sid
    def at(sid, pointer):
        cur = docs[sid]
        for t in pointer.split('/')[1:] if pointer else []:
            t = t.replace('~1','/').replace('~0','~')
            cur = cur[int(t)] if isinstance(cur,list) else cur[t]
        return cur
    def ref(sid, pointer):
        at(sid,pointer)
        return {**files[sid], 'pointer':pointer}
    def scope(sid, pointer):
        return {'original':ref(sid,pointer), 'exact_value':at(sid,pointer)}
    def rule(pointer, sid, source_pointer, op, **extra):
        rules.append(dict(output_pointer='/slots/11/'+pointer,
                          original=ref(sid,source_pointer), transformation=op,
                          scope='Exact original final M06-B diagnostic metadata. Science, process, witness validity, native identity and comparative qualification remain distinct.', **extra))
    review=freeze('reviews/targeted-cohort2/D-M06-B-v3/REVIEW.json')
    final=freeze('reviews/targeted-cohort2/D-M06-B-v3/FINAL_FREEZE.json')
    gate=freeze('jobs/D-M06-B/V3_DIAGNOSTIC_FULL_SOURCE_REVIEW_GATE.json')
    summary=freeze('helpers/targeted-cohort2/COMPARISONS-final-v3-corrected.json')
    old=freeze('helpers/targeted-cohort2/COMPARISONS.json')
    assert at(review,'/case_id')=='D-M06-B' and at(review,'/unassessed_remainder')==[]
    assert at(gate,'/active_absence_preserved') and at(gate,'/comparative_qualification')=='HOLD'
    for arm,label in [('control','Output1'),('treatment','Output2')]:
        prefix='arms/'+arm+'/'
        final_file=Path(at(review,'/frozen_outputs/'+label+'/final.md/path'))
        assert hashlib.sha256(final_file.read_bytes()).hexdigest()==at(review,'/frozen_outputs/'+label+'/final.md/sha256')
        rule(prefix+'candidate_final_delivery',review,'/frozen_outputs/'+label+'/final.md','declared_identity_present',critical=True)
        rule(prefix+'scientific_judgment_available',review,'/outputs/'+label,'declared_identity_present',critical=True)
        rule(prefix+'review_formal_output_delivery',final,'/files','declared_identity_present',critical=True)
        rule(prefix+'review_actual_timely_delivery',final,'/within_allowance','explicit_bool',critical=True)
        rule(prefix+'full_scientific_coverage',review,'/outputs/'+label+'/complete_scope_assessed','explicit_bool',critical=True,
             semantic_bindings=[scope(review,'/case_id'),scope(review,'/declared_scope'),scope(review,'/outputs/'+label+'/unassessed_remainder'),scope(review,'/review_type')])
        rule(prefix+'full_declared_primary_source_coverage',review,'/primary_sources','unknown',critical=True,
             reason='No original explicit primary-source coverage boolean; source identity and full scientific assessment do not substitute for it.')
        rule(prefix+'original_grade_string',review,'/outputs/'+label+'/source_quality','string_only',critical=True)
        rule(prefix+'original_grade_record',review,'/outputs/'+label,'identity',critical=True)
        for field in ['original_material_count','normalized_material_count']:
            rule(prefix+field,review,'/outputs/'+label+'/material_defect_ids','unknown',critical=True,
                 reason='Original records contain material-defect IDs but no numeric material count. Exact IDs remain in the original grade object; no count or ranking is invented.')
        for field,ptr in [('native_pipeline_qualified','/comparative_qualification'),('method_eligible','/comparative_qualification'),('provenance_eligible','/provenance')]:
            rule(prefix+field,gate,ptr,'enum_bool',critical=True,enum_map={at(gate,ptr):False},
                 semantic_bindings=[scope(gate,'/active_absence_preserved'),scope(gate,'/gate'),scope(gate,'/authority_sha')])
        rule(prefix+'time_eligible',summary,'/time_axis/M06_B_v3/arms/'+arm+'/cold_within_new_50min','explicit_bool',critical=True,
             semantic_bindings=[scope(summary,'/time_axis/M06_B_v3/new_limits_seconds'),scope(summary,'/time_axis/M06_B_v3/arms/'+arm+'/within_arm_ceiling'),scope(summary,'/time_axis/M06_B_v3/arms/'+arm+'/within_common_deadline')])
    patches={'D-M06-B':{'version_history':[{},{}],'review_history':[{}],
             'original_pair_context':[{},{}],'shared_and_failed_cost_references':[{},{}]}}
    assert at(old,'/cases/5/case_id')=='D-M06-B'
    for target,sid,ptr in [('version_history/0',old,'/cases/5'),('version_history/1',summary,''),
                           ('review_history/0',review,''),('original_pair_context/0',gate,''),
                           ('original_pair_context/1',summary,''),('shared_and_failed_cost_references/0',old,'/cases/5/seed_attempt'),
                           ('shared_and_failed_cost_references/1',summary,'/time_axis')]:
        rule(target,sid,ptr,'record_reference')
    rule('final_authorized_version',summary,'/quality_axis/M06_B_v3','constant_bound',constant='v3')
    rules.append(dict(output_pointer='/slots/11/paired/scientific_judgment_available',transformation='all_three_valued',critical=True,
                      components=['/slots/11/arms/control/scientific_judgment_available','/slots/11/arms/treatment/scientific_judgment_available']))
    rule('paired/method_eligible',gate,'/comparative_qualification','enum_bool',critical=True,enum_map={'HOLD':False},semantic_bindings=[scope(gate,'/gate'),scope(gate,'/active_absence_preserved')])
    rule('paired/quality_preserving_win_established',summary,'/quality_axis/M06_B_v3/method_winner','unknown',critical=True,reason='No explicit qualified paired win; different FAIL defects and diagnostic HOLD are retained.')
    # Add exact source-scoped declarations to prepared A rules in a NEW overlay.
    # Historical preparations and all scientific records remain byte-identical.
    failure=freeze('jobs/D-M06-A/V3_TERMINAL_DISPOSITION_GATE-final.json')
    for p in [H/'future-closure-bindings-v1/M06A/PREPARED_FIELD_BINDINGS.json',H/'closed-lineage-preparation-v1/PREPARED_LINEAGE_FIELD_BINDINGS.json']:
        for prior in json.loads(p.read_bytes())['entries']:
            if prior['transformation']=='enum_bool' and not prior.get('semantic_bindings'):
                v=copy.deepcopy(prior)
                v['semantic_bindings']=[scope(failure,'/case'),scope(failure,'/version'),scope(failure,'/science'),scope(failure,'/source_review_dispatched')]
                rules.append(v)
    for name,value in [('INPUT_IDENTITIES.json',{'schema':'ER10_ROOT_M06B_FINAL_METADATA_INPUTS_V1','files':list(files.values())}),
                       ('PREPARED_FIELD_BINDINGS.json',{'schema':'ER10_ROOT_M06B_FINAL_FIELD_BINDINGS_V1','entries':rules,'template_list_patches':patches,'original_scientific_records_modified':False})]:
        with (OUT/name).open('x') as f:json.dump(value,f,indent=2);f.write('\n')
    print(json.dumps({'frozen_files':len(files),'explicit_rules':len(rules),'original_science_modified':False}))

if __name__=='__main__':main()
