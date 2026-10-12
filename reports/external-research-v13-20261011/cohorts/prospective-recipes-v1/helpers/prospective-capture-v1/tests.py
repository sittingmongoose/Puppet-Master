#!/usr/bin/env python3
"""Offline actual materializer/bootstrap + MOCK native tools. No paid diagnostics."""
import datetime as dt
import hashlib
import importlib.util
import json
import os
import re
import subprocess
import sys
import tempfile
from pathlib import Path

HERE = Path(__file__).absolute().parent
STATE = HERE.parents[1] / 'state/prospective-capture-v1'
BASE = HERE.parent / 'materialize-er13-v1/sealed/full-v1'
checks = []


def load(p, name):
    spec = importlib.util.spec_from_file_location(name, p)
    m = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(m)
    return m


def check(name, value):
    checks.append({'name': name, 'passed': bool(value)})
    if not value:
        raise AssertionError(name)


def run(args):
    return subprocess.run(args, capture_output=True, text=True)


BOOT = r'''const fs=require('fs'),cp=require('child_process');
const A=Object.getPrototypeOf(async function(){}).constructor;
let delegated=0;const tools={exec_command:async a=>{const p=cp.spawnSync('bash',['-c',a.cmd],{encoding:'utf8'});return {exit_code:p.status,output:p.stdout+p.stderr}},mcp__t3_code__orchestrator_capabilities:async()=>({structuredContent:{providers:[{providerInstanceId:'MOCK_AUTHORIZED_ROUTE',canRunChildTask:true,models:[{id:'gpt-6-luna',options:[{id:'reasoningEffort',options:[{id:'max'}]},{id:'serviceTier',options:[{id:'priority'},{id:'default'}]}]}]}]}}),mcp__t3_code__delegate_task:async()=>{delegated++;throw Error('MOCK_STOP_BEFORE_DISPATCH')}};
(async()=>{try{await new A('tools','text',fs.readFileSync(process.argv[2],'utf8'))(tools,()=>{});throw Error('unexpected bootstrap completion')}catch(e){if(e.message!=='MOCK_STOP_BEFORE_DISPATCH'){process.stderr.write(String(e));process.exitCode=3}else process.stdout.write(JSON.stringify({mockBoundaryCount:delegated,actualNativeCalls:0}))}})();'''

NATIVE = r'''const fs=require('fs'),cp=require('child_process');
const A=Object.getPrototypeOf(async function(){}).constructor;
const stage=process.argv[3], mode=process.argv[4], loader=fs.readFileSync(process.argv[2],'utf8');
const objective=JSON.parse(fs.readFileSync(stage+'/freeze.json','utf8')).native_goal_objective;
const response={goal:{threadId:'MOCK_ONLY',objective:objective+(mode==='wrongobjective'?' changed':''),status:'active',createdAt:'MOCK_T0',updatedAt:'MOCK_T0',tokensUsed:0,timeUsedSeconds:0,optional:{quote:'"',apostrophe:"'",newline:'\n',unicode:'Ω🙂',data:[null,false,0,{nested:{more:['雪','end']}}]}},remainingTokens:null,completionBudgetReport:null,unknownFutureEnvelope:{deep:[{a:false},null,'\n',"$(`literal`) '"]}};
let creates=0,gets=0,updates=0,execs=0,saves=0;const texts=[],errors=[];
const tools={create_goal:async a=>{creates++;if(a.objective!==objective)throw Error('bad objective');if(mode==='unknown')throw Error('MOCK unknown native outcome');if(mode==='unsupported')return 'MOCK unsupported';return response},get_goal:async()=>{gets++;throw Error('get forbidden')},update_goal:async()=>{updates++;throw Error('update forbidden')},exec_command:async a=>{execs++;if(a.cmd.includes('native-goal-create.json')&&a.cmd.includes('for name in')){saves++;if(mode==='savefail')return {exit_code:1,output:'MOCK failed receipt save'};if(mode==='partialsave')fs.writeFileSync(stage+'/native-goal-active.json','MOCK race existing');}const p=cp.spawnSync('bash',['-c',a.cmd],{encoding:'utf8'});return {exit_code:p.status,output:p.stdout+p.stderr}}};
async function invoke(){try{await new A('tools','text',loader)(tools,x=>texts.push(x));return true}catch(e){errors.push(String(e));return false}}
(async()=>{const first=await invoke();const afterFirst=creates;const second=await invoke();const exists=n=>fs.existsSync(stage+'/'+n);const raw=n=>exists(n)?fs.readFileSync(stage+'/'+n,'utf8'):null;
process.stdout.write(JSON.stringify({first,second,creates,afterFirst,gets,updates,execs,saves,texts,errors,expected:JSON.stringify(response),createRaw:raw('native-goal-create.json'),activeRaw:raw('native-goal-active.json'),attempt:exists('native-goal-attempt.json')}))})();'''


def main():
    install = load(HERE / 'install.py', 'new_install')
    for p in (HERE / 'install.py', HERE / 'tests.py', BASE / 'materialize.py'):
        compile(p.read_bytes(), str(p), 'exec')
        check('actual Python compiles ' + p.name, True)
    old = (BASE / 'sources/mechanics/exact-activation-capture-v2-1/activation-snippet-template.js').read_text()
    for name in ('readObjective', 'save'):
        body = json.loads(re.search(r'const ' + name + r' = (".*");', old).group(1))
        compile(body, 'sealed-v21-' + name, 'exec')
        check('sealed v21 ' + name + ' compiles and has no try', 'try:' not in body)
    diagnostic_root = HERE.parents[1] / 'mechanics/dispatch-v1/frozen/B11-P02-control-terminal-mechanics-supplement'
    mp = diagnostic_root / 'authored-manifest.json'
    check('original diagnostic manifest exact pin', install.sha(mp.read_bytes()) == 'dedaad957567598c9ca5494b4f0265542ab178ce9f9c9bcdbc6065f72c0fc10b')
    manifest = json.loads(mp.read_bytes()); row = manifest['files'][0]; diagnostic = diagnostic_root / row['path']
    check('sole diagnostic exact size/hash', len(manifest['files']) == 1 and diagnostic.stat().st_size == row['bytes'] and install.sha(diagnostic.read_bytes()) == row['sha256'])
    bad = next(s.strip() for s in diagnostic.read_text().splitlines() if s.strip().startswith('import os,sys;'))
    try:
        compile(bad, 'exact-original-diagnostic-command', 'exec')
        check('original SyntaxError reproduced', False)
    except SyntaxError:
        check('original SyntaxError reproduced and command differs', bad != json.loads(re.search(r'const save = (".*");', old).group(1)))
    with tempfile.TemporaryDirectory(prefix='.offline-smoke-', dir=STATE) as td:
        scratch = Path(td); bootstrap_h = scratch / 'bootstrap.cjs'; bootstrap_h.write_text(BOOT)
        native_h = scratch / 'native.cjs'; native_h.write_text(NATIVE)
        contract = load(BASE / 'materialize.py', 'base_materializer').TIME_CONTRACT
        brief = scratch / 'brief.md'; plan = scratch / 'plan.md'
        brief.write_text('Generic offline fixture brief.\n' + contract)
        plan.write_text('Generic offline fixture plan.\n' + contract)

        def prepare(label, method='R0'):
            dest = scratch / label
            t0 = dt.datetime.now(dt.timezone.utc)
            budgets = {'B02':'1800,1800','B06':'1800,360,360,1080'}.get(method, '1800,720,1080')
            args = [sys.executable, '-B', str(BASE / 'materialize.py'), '--destination', str(dest), '--authorized-provider-instance', 'MOCK_AUTHORIZED_ROUTE', '--brief', str(brief), '--plan', str(plan), '--run-id', label, '--method', method, '--t0-utc', t0.isoformat(), '--whole-deadline-utc', (t0 + dt.timedelta(seconds=3599)).isoformat(), '--stage-budgets-s', budgets, '--whole-budget-s', '3600']
            r = run(args); check(label + ' actual existing materializer API', r.returncode == 0)
            r = run(['node', str(bootstrap_h), str(dest / 'helpers/er12-screen-v1/bootstrap.js')])
            check(label + ' actual generated bootstrap stops before real dispatch ' + r.stderr, r.returncode == 0 and json.loads(r.stdout)['actualNativeCalls'] == 0)
            stage = dest / 'run' / label / 'stages/investigator'
            return dest, stage

        # Common install is identical in both recipes and preserves their science/topology.
        for method in ('R0', 'A8', 'B02', 'B06'):
            dest, stage = prepare('symmetry-' + method, method)
            before = {n: (stage / n).read_bytes() for n in install.NAMES}
            cfg = next((dest / 'configs').glob('*.json')).read_bytes()
            output = install.transform(stage)
            check(method + ' unused repeat is idempotent', install.transform(stage)['idempotent'])
            after = json.loads((stage / 'freeze.json').read_bytes()); original = json.loads(before['freeze.json'])
            check(method + ' original clocks route scope budget exact', all(after[k] == v for k,v in original.items() if k not in ('request_sha256', 'assignment_sha256', 'frozen_inputs')))
            check(method + ' config T0/topology/route unchanged', cfg == next((dest / 'configs').glob('*.json')).read_bytes())
            check(method + ' original substantive task/assignment prefix exact', (stage / 'assignment.md').read_bytes().split(b'\nPROSPECTIVE CAPTURE')[0] == before['assignment.md'].split(b'\nEXACT ACTIVATION CAPTURE v2.1')[0] and json.loads((stage / 'request.json').read_bytes())['args']['task'].split('\nPROSPECTIVE CAPTURE')[0] == json.loads(before['request.json'])['args']['task'].split('\nEXACT ACTIVATION CAPTURE v2.1')[0])
            check(method + ' request target/client key preserved', json.loads(before['request.json'])['args']['target'] == output['args']['target'] and json.loads(before['request.json'])['clientRequestId'] == json.loads((stage / 'request.json').read_bytes())['clientRequestId'])
            program = (stage / install.PROGRAM).read_text()
            for name in ('readObjective', 'save'):
                compile(re.search(r'const ' + name + r' = `([\s\S]*?)`;', program).group(1), 'generated-' + name, 'exec')
                check(method + ' actual generated Python compiles ' + name, True)
            r = run(['node', '-e', "const fs=require('fs');const A=Object.getPrototypeOf(async function(){}).constructor;new A('tools','text',fs.readFileSync(process.argv[1],'utf8'));", str(stage / install.PROGRAM)])
            check(method + ' actual generated JavaScript compiles', r.returncode == 0)
            check(method + ' program immutable mode and exact pin', (stage / install.PROGRAM).stat().st_mode & 0o222 == 0 and install.sha((stage / install.PROGRAM).read_bytes()) == output['program_sha256'])
            (stage / 'dispatch.json').write_text('MOCK used stage')
            try:
                install.transform(stage); check(method + ' dispatched stage refusal', False)
            except ValueError:
                check(method + ' dispatched stage refusal', True)
            (stage / 'dispatch.json').unlink()
            overlay = dest / 'mechanics/exact-activation-capture-v2-1/overlay.py'
            overlay_bytes = overlay.read_bytes()
            overlay.write_text("raise RuntimeError('MUST NEVER IMPORT THIS CHANGED OVERLAY')")
            try:
                install.transform(stage); check(method + ' changed overlay refused before import', False)
            except ValueError:
                check(method + ' changed overlay refused before import', True)
            overlay.write_bytes(overlay_bytes)
            # Use actual generated bootstrap with in-memory shim; no old seal edit.
            bootstrap = (dest / 'helpers/er12-screen-v1/bootstrap.js').read_text()
            marker = '// Paste into T3 functions code mode.'
            check(method + ' one root bootstrap injection marker', bootstrap.count(marker) == 1)
            shim = (HERE / 'captureSpec-shim.js').read_text().replace('__HELPER_DIR_JSON__', json.dumps(str(HERE)))
            bp = scratch / 'shimmed-bootstrap.js'; bp.write_text(bootstrap.replace(marker, shim + '\n' + marker))
            r = run(['node', str(bootstrap_h), str(bp)])
            check(method + ' actual shimmed bootstrap idempotent before mock dispatch ' + r.stderr, r.returncode == 0)
            # Prepare downstream roles through the original helper API with only
            # synthetic predecessor custody mocked; no scientific input inspected.
            cfg_path = next((dest / 'configs').glob('*.json'))
            m = load(dest / 'helpers/er12-screen-v1/prepare.py', 'downstream_' + method)
            c = m.load_config(cfg_path)
            m.get_deps = lambda config, stage: []
            m.verify_terminal_status = lambda root, deps: None
            generic = scratch / 'generic-predecessor.txt'; generic.write_text('Synthetic predecessor only.')
            m.verify_predecessors = lambda root, stage: [generic]
            for role in json.loads(cfg)['stage_budgets_s']:
                if role == 'investigator': continue
                prepared = m.prepare(c, role)
                sd = Path(prepared['stageDir'])
                prefix = bootstrap.split(marker)[0]
                seq = scratch / 'downstream.js'
                seq.write_text(prefix + '\n' + shim + '\nawait captureSpec(await exactSpec(await clarifySpec(await standardSpec(' + json.dumps(prepared) + '))));')
                sequence_h = scratch / 'sequence.cjs'
                sequence_h.write_text(BOOT.replace("throw Error('unexpected bootstrap completion')", "process.stdout.write('MOCK sequence complete')"))
                r = run(['node', str(sequence_h), str(seq)])
                check(method + ' ' + role + ' actual preparation API + shim ' + r.stderr, r.returncode == 0 and r.stdout == 'MOCK sequence complete')
                frozen = json.loads((sd / 'freeze.json').read_bytes())
                check(method + ' ' + role + ' same route and original clipped cap', frozen['stage_budget_s'] <= json.loads(cfg)['stage_budgets_s'][role] and frozen['requested_route'] == after['requested_route'])
                program = (sd / install.PROGRAM).read_text()
                for name in ('readObjective','save'):
                    compile(re.search(r'const ' + name + r' = `([\s\S]*?)`;', program).group(1), method + role + name, 'exec')
                r = run(['node', '-e', "const fs=require('fs');const A=Object.getPrototypeOf(async function(){}).constructor;new A('tools','text',fs.readFileSync(process.argv[1],'utf8'));", str(sd / install.PROGRAM)])
                check(method + ' ' + role + ' actual generated Python + JavaScript compiles', r.returncode == 0)

        for mode in ('success', 'wronghash', 'existing', 'savefail', 'partialsave', 'unknown', 'unsupported', 'wrongobjective', 'expired', 'changedfreeze', 'guardhash'):
            dest, stage = prepare('native-' + mode)
            out = install.transform(stage)
            js = install.loader(stage / install.PROGRAM, out['program_sha256'])
            if mode == 'wronghash': js = install.loader(stage / install.PROGRAM, '0' * 64)
            if mode == 'existing': (stage / 'native-goal-create.json').write_text('MOCK original receipt')
            if mode in ('expired', 'changedfreeze'):
                f = json.loads((stage / 'freeze.json').read_bytes())
                f['stage_deadline_utc' if mode == 'expired' else 'native_goal_objective'] = '2000-01-01T00:00:00Z' if mode == 'expired' else 'MOCK changed objective'
                (stage / 'freeze.json').write_text(json.dumps(f))
            if mode == 'guardhash':
                (dest / 'mechanics/exact-goal-binding-guard-v1/assert-active-goal.py').write_text('# MOCK changed guard')
            lp = scratch / 'loader.js'; lp.write_text(js)
            r = run(['node', str(native_h), str(lp), str(stage), mode])
            check(mode + ' real shell/Python mock harness returns', r.returncode == 0)
            result = json.loads(r.stdout)
            calls = 0 if mode in ('wronghash', 'existing', 'expired', 'changedfreeze', 'guardhash') else 1
            check(mode + ' exact native counter no retry/get/update', result['creates'] == calls and result['afterFirst'] == calls and result['gets'] == result['updates'] == 0 and not result['second'])
            check(mode + ' expected guard success/stop', result['first'] == (mode == 'success'))
            if mode in ('success', 'wrongobjective'):
                check(mode + ' full nested native JSON bytes preserved twice + raw output', result['createRaw'] == result['activeRaw'] == result['expected'] and result['texts'][0] == result['expected'])
            if mode == 'savefail':
                check('failed save keeps raw response/attempt and no receipt', result['texts'][0] == result['expected'] and result['attempt'] and result['createRaw'] is None and result['activeRaw'] is None)
            if mode == 'partialsave':
                check('partial save preserves first receipt/raced second + stops', result['createRaw'] == result['expected'] and result['activeRaw'] == 'MOCK race existing' and result['texts'][0] == result['expected'])
            if mode in ('unknown', 'unsupported'):
                check(mode + ' creation unknown never fabricates receipt', result['attempt'] and result['createRaw'] is None and result['activeRaw'] is None)
            if mode == 'existing':
                check('existing receipt unchanged', result['createRaw'] == 'MOCK original receipt' and not result['attempt'])
    report = {'schema': 'er13.prospective_capture_offline_checks.v1', 'checks': checks, 'passed': len(checks), 'failed': 0,
              'actual_native_calls': 0, 'actual_candidate_dispatches': 0, 'synthetic_inputs_only': True, 'scratch_removed': True}
    (STATE / 'CHECKS.json').write_bytes(install.encode(report))
    print(json.dumps({k:v for k,v in report.items() if k != 'checks'}))


if __name__ == '__main__':
    try:
        main()
    except Exception as exc:
        (STATE / 'CHECKS.failed.json').write_text(json.dumps({'checks': checks, 'error': repr(exc), 'actual_native_calls': 0}, indent=2) + '\n')
        raise
