"""Single-fault fixture controls through the original Browser CLI blocks."""
import ast
import contextlib
import copy
import io
import json
import sys
from pathlib import Path
from unittest.mock import patch
import pm_event_authority_ds_round2 as ds
import pm_event_authority_ds_round3 as d3
import pm_browser_workspace_created as created
import pm_browser_workspace_reset as reset


def exact_diagnostic(value,wanted):
    if isinstance(value,dict):return any(exact_diagnostic(v,wanted) for v in value.values())
    if isinstance(value,list):return any(exact_diagnostic(v,wanted) for v in value)
    return type(value) is str and value==wanted


def cli(module):
    tree=ast.parse(Path(module.__file__).read_text())
    block=next(n for n in tree.body if isinstance(n,ast.If) and ast.unparse(n.test)=="__name__ == '__main__'")
    code=compile(ast.Module(body=block.body,type_ignores=[]),module.__file__,'exec')
    def run():
        output=io.StringIO()
        with patch.object(sys,'argv',[module.__file__]),contextlib.redirect_stdout(output):
            try:exec(code,module.__dict__)
            except SystemExit as exc:exit_code=int(bool(exc.code))
            else:exit_code=0
        return exit_code,json.loads(output.getvalue())
    return run


def cases():
    gate,_,_=d3.bases()
    rows=[]
    for module in (created,reset):
        fixture=module.load(module.FIXTURE_PATH)
        run=cli(module)
        def add(uid,label,change,diagnostic,m=module,fixture=fixture,run=run):
            changed=copy.deepcopy(fixture);change(changed)
            original=m.load
            def load(path,root=ds.ROOT):
                return copy.deepcopy(changed) if path==m.FIXTURE_PATH else original(path,root)
            def broken():
                try:
                    with patch.object(m,'load',load):status,report=run()
                except Exception:return True
                failures=report['failures']
                # A single fault can be checked at several same-input sites;
                # the table separately records those named duplicates.
                return status!=1 or not exact_diagnostic(failures,diagnostic)
            rows.append(('FAULT-'+uid+':'+m.EVENT_TYPE+':'+label,broken))
        if module is created:
            add('U227','missing_source',lambda f:f['creation_fixture'].__setitem__('event_case_id','absent-source'),
                'creation_fixture_source_identity')
            add('U228','invalid_positive_witness',lambda f:f['creation_fixture']['witness'].__setitem__('scope_current',False),
                'creation_positive')
            add('U229','invalid_positive_checkpoint',lambda f:f['checkpoint_fixture'].__setitem__('unexpected',True),
                'checkpoint_positive')
            add('U230','empty_creation_cohort',lambda f:f.__setitem__('creation_invalid',[]),
                'fixture_identity_or_empty_negative_cohort')
            add('U230','empty_checkpoint_cohort',lambda f:f.__setitem__('checkpoint_invalid',[]),
                'fixture_identity_or_empty_negative_cohort')
            add('U230','duplicate_negative_id',lambda f:f['creation_invalid'].append(copy.deepcopy(f['creation_invalid'][0])),
                'fixture_identity_or_empty_negative_cohort')
            add('U231','invalid_checkpoint_snapshot',lambda f:f['observation_fixture'].__setitem__('source_verified',False),
                'checkpoint_snapshot_positive')
            for uid,key in [('U232','creation_invalid'),('U233','checkpoint_invalid')]:
                add(uid,'wrong_expected_diagnostic:'+key,lambda f,k=key:f[k][0].__setitem__('expected_error','one-deliberately-wrong-diagnostic'),
                    'one-deliberately-wrong-diagnostic')
        else:
            add('U267','empty_negative_cohort',lambda f:f.__setitem__('reset_invalid',[]),
                'negative_case_identity_or_empty')
            add('U267','duplicate_negative_id',lambda f:f['reset_invalid'].append(copy.deepcopy(f['reset_invalid'][0])),
                'negative_case_identity_or_empty')
            add('U268','invalid_positive_witness',lambda f:f['reset_fixture']['witness'].__setitem__('scope_valid_at_transition',False),
                'reset_positive')
            add('U269','wrong_expected_diagnostic',lambda f:f['reset_invalid'][0].__setitem__('expected_error','one-deliberately-wrong-diagnostic'),
                'one-deliberately-wrong-diagnostic')
    return rows


def source_identity_controls():
    """Original full CLI: one missing/duplicate/wrong-family source definition."""
    rows=[]
    def make(module,variant):
        run=cli(module);original=module.load
        fixture=original(module.FIXTURE_PATH)
        key='creation_fixture' if module is created else 'reset_fixture'
        source_id=fixture[key]['event_case_id']
        gate=module.candidate_gate(ds.ROOT)[0] if module is created else None
        source_load=gate.load_json if gate is not None else lambda path:original(path,ds.ROOT)
        document=copy.deepcopy(source_load('Plans/browser_event_admission_fixtures.json'))
        selected=next(c for c in document['valid'] if c['case_id']==source_id)
        if variant=='duplicate':document['valid'].append(copy.deepcopy(selected))
        elif variant=='missing':document['valid'].remove(selected)
        else:selected['event_type']='browser.workspace.closed'
        def load_json(path):return copy.deepcopy(document) if path=='Plans/browser_event_admission_fixtures.json' else source_load(path)
        def load(path,root=ds.ROOT):return copy.deepcopy(document) if path=='Plans/browser_event_admission_fixtures.json' else original(path,root)
        def broken():
            with patch.object(gate,'load_json',load_json) if gate is not None else patch.object(module,'load',load):
                try:status,report=run()
                except ValueError as exc:
                    return module is not reset or str(exc)!='reset fixture source identity'
                except Exception:return True
            return status!=1 or not exact_diagnostic(report['failures'],'creation_fixture_source_identity')
        return broken
    for module,uid in ((created,'U227'),(reset,'U266')):
        for variant in ('missing','duplicate','wrong_family'):
            rows.append(('FAULT-'+uid+':'+module.EVENT_TYPE+':source_identity:'+variant,make(module,variant)))
    return rows
