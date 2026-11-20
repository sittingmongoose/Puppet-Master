"""Original shared Browser CLI failure controls for exact metadata defects."""
import copy
import json
from unittest.mock import patch
import pm_event_authority_ds_round3 as d3
from pm_ds_browser_harness_faults import cli,exact_diagnostic


def cases():
    gate,_,_=d3.bases()
    run=cli(gate);rows=[]
    def add(uid,label,path,change,diagnostic):
        original=gate.load_json
        document=copy.deepcopy(original(path));change(document)
        def load(name):return copy.deepcopy(document) if name==path else original(name)
        def broken():
            try:
                with patch.object(gate,'load_json',load):status,report=run()
            except Exception:return True
            return status!=1 or not exact_diagnostic(report['failures'],diagnostic)
        rows.append(('FAULT-'+uid+':shared:'+label,broken))
    wiring='Plans/Wiring_Matrix.production.json'
    def entry(doc):return next(v for v in doc['entries'].values() if v['ui_command_id']=='cmd.browser.workspace.create')
    add('U348','missing_wiring',wiring,lambda d:entry(d).__setitem__('ui_command_id','cmd.fixture.foreign'),'browser_wiring_count')
    add('U349','wrong_wiring_event',wiring,lambda d:entry(d).__setitem__('expected_event_types',[]),'browser_wiring_event_binding')
    add('U350','missing_admission_ref',wiring,
        lambda d:entry(d)['effect_contract'].__setitem__('receipt_or_event_refs',[]),'browser_wiring_missing_admission_ref')
    for field in ('state_selector','disabled_reason_projection'):
        add('U351','wrong_'+field,wiring,lambda d,f=field:entry(d).__setitem__(f,'fixture.foreign'),'browser_wiring_availability')
    add('U352','missing_native_proof_guard',wiring,
        lambda d:entry(d).__setitem__('acceptance_checks',[x for x in entry(d)['acceptance_checks'] if 'handler_unavailable' not in x]),
        'browser_wiring_native_proof_guard')
    add('U353','missing_prepared_guard',wiring,
        lambda d:entry(d).__setitem__('acceptance_checks',[x for x in entry(d)['acceptance_checks'] if not all(t in x for t in ('prepared_not_admitted','advance a checkpoint','one-family landing'))]),
        'browser_wiring_prepared_admission_guard')
    fixtures='Plans/browser_event_admission_fixtures.json'
    def duplicate_id(d):d['invalid'].append(copy.deepcopy(d['invalid'][0]))
    add('U345','duplicate_negative_id',fixtures,duplicate_id,'duplicate_fixture_identity')
    add('U361','wrong_negative_diagnostic',fixtures,
        lambda d:d['invalid'][0].__setitem__('expected_error','one-deliberately-wrong-diagnostic'),'negative_not_rejected_for_expected_reason')
    def bad_positive(d):
        row=next(c for c in d['valid'] if c['event_type']=='browser.workspace.created')
        row['payload']['unexpected_field']=True
    add('U358','bad_positive',fixtures,bad_positive,'positive_rejected')
    add('U359','bad_admitted_positive',fixtures,bad_positive,'admitted_positive_rejected')
    def missing_complete_cohort(d):
        chosen=d['valid'].pop()
        # Dependent negative observations follow the absent source; none is
        # left with an unrelated dangling base-case id.
        d['invalid']=[c for c in d['invalid'] if c['base_case_id']!=chosen['case_id']]
    add('U344','missing_complete_family_fixture_cohort',fixtures,missing_complete_cohort,'fixture_census_mismatch')
    admission='Plans/browser_event_admission.json'
    def repeated_family(d):
        prepared=[r for r in d['rows'] if r['admission_status']=='prepared_not_admitted']
        prepared[1]['family_id']=prepared[0]['family_id']
    add('U338','duplicate_prepared_family',admission,repeated_family,'duplicate_prepared_family_id')
    return rows
