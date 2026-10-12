#!/usr/bin/env python3
"""Focused synthetic successor API checks; no historical suite or paid native probe."""
import datetime as dt
import hashlib
import importlib.util
import json
import shutil
import subprocess
import sys
import tempfile
from pathlib import Path

HERE = Path(__file__).absolute().parent
ROOT = HERE.parents[1]
STATE = ROOT / 'state/c-successor-materializer-v1'
PARENT = HERE.parent / 'materialize-er13-v1/sealed/full-v1'
CAPTURE = HERE.parent / 'prospective-capture-v1'
checks = []


def sha(p):
    return hashlib.sha256(p.read_bytes()).hexdigest()


def check(name, ok):
    checks.append({'name': name, 'passed': bool(ok)})
    if not ok:
        raise AssertionError(name)


def load(p, name):
    spec = importlib.util.spec_from_file_location(name, p)
    m = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(m)
    return m


def run(args):
    return subprocess.run(args, capture_output=True, text=True)


def main():
    capture_manifest = json.loads((CAPTURE / 'MANIFEST.json').read_bytes())
    check('accepted capture manifest exact', sha(CAPTURE / 'MANIFEST.json') == '24ff3ed714c7108a49a2614d0afbda003fdac0bed50044a9952c3f77860d29ba')
    for row in capture_manifest['files']:
        check('accepted capture byte pin ' + row['relative_path'], sha(CAPTURE / row['relative_path']) == row['sha256'])
    # Import the existing MOCK harness constants only. Never invoke its old suite.
    mock = load(CAPTURE / 'tests.py', 'accepted_mock_constants')
    capture = load(CAPTURE / 'install.py', 'accepted_capture_install')
    materializer = load(HERE / 'materialize.py', 'c_successor_materializer')
    parent_sources = json.loads((PARENT / 'public-input-dependency-manifest.json').read_bytes())
    check('entire inherited source inventory byte unchanged', (HERE / 'public-input-dependency-manifest.json').read_bytes() == (PARENT / 'public-input-dependency-manifest.json').read_bytes() and all(sha(HERE / row['relative_path']) == row['sha256'] for row in parent_sources['files']))
    generic = (PARENT / 'sources/methods/B10/critic_prompt_delta.txt').read_bytes()
    check('both final critic files exact existing generic B10', all((HERE / 'methods' / v / 'critic_prompt_delta.txt').read_bytes() == generic for v in ('C-S1-v2', 'C-S2-v2')))
    check('both investigator/reviser supplemental files empty', all((HERE / 'methods' / v / (role + '_prompt_delta.txt')).read_bytes() == b'' for v in ('C-S1-v2','C-S2-v2') for role in ('investigator','reviser')))
    for p in (HERE / 'materialize.py', HERE / 'c-checks.py'):
        compile(p.read_bytes(), str(p), 'exec')
    check('actual successor source Python compiles', True)
    with tempfile.TemporaryDirectory(prefix='.offline-smoke-', dir=STATE) as td:
        scratch = Path(td)
        brief = scratch / 'brief.md'; plan = scratch / 'plan.md'
        brief.write_text('SYNTHETIC_BRIEF_ONLY_BOUNDARY\n' + materializer.TIME_CONTRACT)
        plan.write_text('SYNTHETIC_PLAN_NOT_RELEASED_SENTINEL\n' + materializer.TIME_CONTRACT)
        boot_h = scratch / 'bootstrap.cjs'; boot_h.write_text(mock.BOOT)
        seq_h = scratch / 'sequence.cjs'; seq_h.write_text(mock.BOOT.replace("throw Error('unexpected bootstrap completion')", "process.stdout.write('MOCK sequence complete')"))
        native_h = scratch / 'native.cjs'; native_h.write_text(mock.NATIVE)
        shim = (CAPTURE / 'captureSpec-shim.js').read_text().replace('__HELPER_DIR_JSON__', json.dumps(str(CAPTURE)))
        budgets_for = {'R0':{'investigator':1800,'critic':720,'reviser':1080}, 'B02':{'investigator':1800,'critic':1800}, 'B06':{'investigator':1800,'critic-breadth':360,'critic-truth':360,'reviser':1080}}

        def arguments(label, method, card=None):
            t0 = dt.datetime.now(dt.timezone.utc)
            args = [sys.executable, '-B', str(HERE / 'materialize.py'), '--destination', str(scratch / label), '--brief', str(brief), '--plan', str(plan), '--run-id', label, '--authorized-provider-instance', 'MOCK_AUTHORIZED_ROUTE', '--method', method, '--stage-budgets-s', ','.join(map(str, budgets_for[method].values())), '--whole-budget-s', '3600', '--t0-utc', t0.isoformat(), '--whole-deadline-utc', (t0+dt.timedelta(seconds=3599)).isoformat()]
            return args + (['--method-directory', str(card)] if card else [])

        for method, version in (('R0',None), ('B02','C-S1-v2'), ('B06','C-S2-v2')):
            label = 'synthetic-' + method
            r = run(arguments(label, method, HERE / 'methods' / version if version else None))
            check(method + ' actual CLI materializes ' + r.stderr, r.returncode == 0)
            dest = scratch / label; config_path = next((dest / 'configs').glob('*.json'))
            cfg = json.loads(config_path.read_bytes()); original_config = config_path.read_bytes()
            check(method + ' exact topology budgets/full hour', cfg['stage_budgets_s'] == budgets_for[method] and cfg['whole_budget_s'] == 3600)
            check(method + ' same Max/Standard route and common capture version', cfg['provider'] == {'providerInstanceId':'MOCK_AUTHORIZED_ROUTE','model':'gpt-6-luna','options':{'reasoningEffort':'max','serviceTier':'default'}} and cfg['activation_capture_version'] == 'exact-capture-v21')
            expected_stage = {'B02':'critic','B06':'critic-truth'}.get(method)
            check(method + ' delta mapped ONLY declared critic', cfg['stage_prompt_deltas'] == ({expected_stage:generic.decode()} if expected_stage else {}) and set(cfg['method_delta_files']) == ({expected_stage} if expected_stage else set()))
            if version:
                check(method + ' root card exact bytes/hash and unused markings', (dest / 'control-inputs/method/method.json').read_bytes() == (HERE / 'methods' / version / 'method.json').read_bytes() and sha(dest / 'control-inputs/method/method.json') == cfg['method_card_file']['sha256'] and 'reviser' in cfg['neutral_or_unused_method_deltas'])
            if method == 'B02':
                check('B02 same critic final selection only two contexts', cfg['final_stage'] == 'critic' and cfg['output_selection']['critic'] == ['source-map.json','critique.md','final.md'] and 'reviser' not in cfg['output_selection'])
            if method == 'B06':
                check('B06 summed critics720/fresh reviser/four contexts', sum(v for k,v in cfg['stage_budgets_s'].items() if k.startswith('critic')) == 720 and cfg['final_stage'] == 'reviser' and len(cfg['output_selection']) == 4)
            check(method + ' materialized private source closure verifies', run([sys.executable,'-B',str(HERE / 'materialize.py'),'--verify',str(dest)]).returncode == 0)
            for p in dest.rglob('*.py'):
                compile(p.read_bytes(), str(p), 'exec')
            check(method + ' ALL actual generated Python compiles', True)
            bootstrap = (dest / 'helpers/er12-screen-v1/bootstrap.js').read_text()
            marker = '// Paste into T3 functions code mode.'
            check(method + ' unique existing root shim marker', bootstrap.count(marker) == 1)
            bp = scratch / 'bootstrap.js'; bp.write_text(bootstrap.replace(marker, shim + '\n' + marker))
            r = run(['node',str(boot_h),str(bp)])
            check(method + ' real generated root bootstrap+accepted shim reaches mock boundary ' + r.stderr, r.returncode == 0 and json.loads(r.stdout)['actualNativeCalls'] == 0)
            m = load(dest / 'helpers/er12-screen-v1/prepare.py', 'prepared_' + method)
            c = m.load_config(config_path)
            # Only predecessor native custody is MOCKed; the actual prepare,
            # exact method/source binding, overlays and save guard run unchanged.
            m.get_deps = lambda c,stage: []
            m.verify_terminal_status = lambda root,deps: None
            predecessor = scratch / 'synthetic-predecessor.txt'; predecessor.write_text('SYNTHETIC_PREDECESSOR_INPUT')
            m.verify_predecessors = lambda root,stage: [predecessor]
            for role in budgets_for[method]:
                prepared = m.prepare(c, role); sd = Path(prepared['stageDir'])
                before = json.loads((sd / 'freeze.json').read_bytes())
                if role != 'investigator':
                    seq = scratch / 'sequence.js'
                    seq.write_text(bootstrap.split(marker)[0] + '\n' + shim + '\nawait captureSpec(await exactSpec(await clarifySpec(await standardSpec(' + json.dumps(prepared) + '))));')
                    r = run(['node',str(seq_h),str(seq)])
                    check(method + ' ' + role + ' actual prepare/overlays/shim ' + r.stderr, r.returncode == 0 and r.stdout == 'MOCK sequence complete')
                frozen = json.loads((sd / 'freeze.json').read_bytes()); request = json.loads((sd / 'request.json').read_bytes())
                assignment = (sd / 'assignment.md').read_text(); im = json.loads((sd / 'input-map.json').read_bytes())
                check(method + ' ' + role + ' original objective/route/deadline/cap unchanged', all(frozen[k] == before[k] for k in ('native_goal_objective','requested_route','stage_deadline_utc','whole_deadline_utc','stage_budget_s')) and frozen['stage_budget_s'] == budgets_for[method][role])
                assignment_row = next(row for row in frozen['frozen_inputs'] if row['path'] == str(sd / 'assignment.md'))
                check(method + ' ' + role + ' request+assignment hashes binding exact', frozen['request_sha256'] == sha(sd / 'request.json') and assignment_row['sha256'] == sha(sd / 'assignment.md') and assignment_row['bytes'] == (sd / 'assignment.md').stat().st_size and request['args']['target'] == frozen['requested_route'] and request['args']['clientRequestId'] == request['clientRequestId'])
                check(method + ' ' + role + ' original max/no minimum and full scope', materializer.TIME_CONTRACT in assignment and 'full original brief and its exact released plan' in assignment and 'Keep proposed validations distinct from checks actually run' in assignment)
                check(method + ' ' + role + ' exact generic delta occurrence only chosen critic', assignment.count(generic.decode()) == (1 if role == expected_stage else 0) and frozen['stage_prompt_delta'] == (generic.decode() if role == expected_stage else None))
                if role == 'investigator':
                    check(method + ' brief-only until original release', 'revealed_plan' not in im and cfg['plan_path'] not in json.dumps(im) and all(row['path'] != cfg['plan_path'] for row in frozen['frozen_inputs']) and 'SYNTHETIC_PLAN_NOT_RELEASED_SENTINEL' not in assignment and not (sd / 'plan-reveal.json').exists() and 'Discover independently from that brief alone' in assignment)
                else:
                    row = next(x for x in frozen['frozen_inputs'] if x['path'] == str(predecessor))
                    check(method + ' ' + role + ' actual predecessor bytes/hash frozen', row['sha256'] == sha(predecessor) and row['bytes'] == predecessor.stat().st_size)
                    saved = predecessor.read_bytes(); predecessor.write_bytes(saved + b' CHANGED')
                    try:
                        m.prepare(c, role); check(method + ' ' + role + ' changed predecessor stops saved request reuse', False)
                    except SystemExit:
                        check(method + ' ' + role + ' changed predecessor stops saved request reuse', True)
                    except ValueError:
                        check(method + ' ' + role + ' changed predecessor stops saved request reuse', True)
                    predecessor.write_bytes(saved)
                if method == 'B02' and role == 'critic':
                    check('B02 generic B10 is before same-Goal finalization', assignment.index(generic.decode()) < assignment.index('B02 CRITIC ALSO FINALIZES'))
                    axes = ('check governing primary evidence yourself','all original obligations and exact plan dispositions','useful discovery and alternatives','conditions/applicability','preservation','proposed vs executed validation')
                    check('B02 full six ordinary review axes + same Goal final retained', all(x in assignment for x in axes) and 'same stage and SAME Goal' in assignment and 'No fresh reviser is dispatched' in assignment)
                if method == 'B06' and role == 'reviser':
                    check('B06 full coverage/disagreement/overlap + both critics retained', 'BOTH exact complementary' in assignment and 'disagreement/overlap and full coverage checks' in assignment and 'Do not discard uncovered ordinary review obligations' in assignment)
                program = sd / 'native-capture.js'; out = json.loads((sd / 'prospective-capture-v1.json').read_bytes())
                check(method + ' ' + role + ' unchanged capture template and native guard pins', out['template_sha256'] == 'e4c4b1e96308cee17a548a03ed507a3aedd2249c364d83c8b2c6c300bac6f412' and out['guard_sha256'] == '4a61deec5eb0ca5eca149f0e1f30c55c3e90b5a6ad0557fc98946d340cae99ed' and out['program_sha256'] == sha(program))
                lp = scratch / 'candidate-loader.js'; lp.write_text(capture.loader(program, out['program_sha256']))
                r = run(['node',str(native_h),str(lp),str(sd),'success'])
                result = json.loads(r.stdout) if r.returncode == 0 else {}
                check(method + ' ' + role + ' full nested native MOCK once/raw JSON/direct guard/no retry ' + r.stderr, result.get('first') is True and result['second'] is False and result['creates'] == result['afterFirst'] == 1 and result['gets'] == result['updates'] == 0 and result['createRaw'] == result['activeRaw'] == result['expected'] == result['texts'][0])
            check(method + ' config/original T0 unchanged through all roles', config_path.read_bytes() == original_config)
            if expected_stage:
                p = Path(cfg['method_delta_files'][expected_stage]['path']); saved = p.read_bytes(); p.write_bytes(saved+b' changed')
                try:
                    m.load_config(config_path); check(method + ' exact method delta drift refusal', False)
                except (SystemExit, ValueError):
                    check(method + ' exact method delta drift refusal', True)
                p.write_bytes(saved)

        # Card/API refusals occur before destination creation, not as paid retries.
        for label, method, mutation in (
                ('wrong-truth-map','B06',('critic_delta_stage','critic-breadth')),
                ('extra-context','B02',('candidate_contexts',3)),
                ('wrong-budget','B06',('stage_maxima_seconds',{'investigator':1800,'critic-breadth':361,'critic-truth':360,'reviser':1080})),
                ('weakened-scope','B02',('full_obligations_retained',False)),
                ('partial-scope','B06',('scope','PARTIAL')),
                ('investigator-added','B02',('file','investigator_prompt_delta.txt')),
                ('reviser-added','B06',('file','reviser_prompt_delta.txt')),
                ('critic-retyped','B02',('file','critic_prompt_delta.txt'))):
            version = 'C-S1-v2' if method == 'B02' else 'C-S2-v2'
            bad = scratch / ('bad-' + label); shutil.copytree(HERE / 'methods' / version, bad)
            if mutation[0] == 'file':
                p=bad/mutation[1];p.chmod(0o644);p.write_bytes(p.read_bytes()+b' forbidden change')
            else:
                p=bad/'method.json';p.chmod(0o644);card=json.loads(p.read_bytes());card[mutation[0]]=mutation[1];p.write_text(json.dumps(card))
            r = run(arguments(label, method, bad))
            check(label + ' refused before materialization/no native call', r.returncode == 2 and not (scratch / label).exists())
        r = run(arguments('optional-plain-B02','B02'))
        cfg = json.loads(next((scratch/'optional-plain-B02/configs').glob('*.json')).read_bytes())
        check('B02 no-card compatibility remains ordinary/unpromoted', r.returncode == 0 and cfg['stage_prompt_deltas'] == {} and cfg['stage_budgets_s'] == budgets_for['B02'])
    check('original parent materializer and capture seals remain exact', sha(PARENT / 'materialize.py') == '5ce745901f3ba5a2af2b7c3d4624f4b83ea95f66d74df84e30e41dc4c5bdc3f2' and sha(CAPTURE / 'MANIFEST.json') == '24ff3ed714c7108a49a2614d0afbda003fdac0bed50044a9952c3f77860d29ba')
    report={'schema':'er13.c_successor_focused_offline_checks.v1','checks':checks,'passed':len(checks),'failed':0,'actual_native_calls':0,'actual_candidate_dispatches':0,'historical_suites_run':False,'real_case_plan_evaluator_contents_read':False,'synthetic_inputs_only':True,'scratch_removed':True}
    (STATE / 'CHECKS.json').write_text(json.dumps(report,ensure_ascii=False,indent=2)+'\n')
    print(json.dumps({k:v for k,v in report.items() if k != 'checks'}))


if __name__ == '__main__':
    try:
        main()
    except Exception as exc:
        (STATE / 'CHECKS.failed.json').write_text(json.dumps({'checks':checks,'error':repr(exc),'actual_native_calls':0},indent=2)+'\n')
        raise
