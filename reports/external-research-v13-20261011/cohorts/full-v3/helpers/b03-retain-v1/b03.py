#!/usr/bin/env python3
"""Finite B03 retention operations. No dispatch, native calls, or Goal-state writes."""
from __future__ import annotations
import argparse, contextlib, datetime as dt, hashlib, importlib.util, io, json, os, shlex, sys, time
from pathlib import Path
from types import SimpleNamespace

HERE = Path(__file__).resolve().parent
PARENT = HERE.parent / 'materialize-er13-v1/sealed/full-v1'
PARENT_MANIFEST = 'ee5939ef2f60a70b966e7135ca9afe2771158f6bf062ff47604b81bf16b223d7'
UTC = dt.timezone.utc
SCIENCE = ('discovery.md', 'draft.md', 'source-map.json', 'revealed-plan.md', 'plan-reveal.json')

def fail(message):
    raise ValueError(message)

def now():
    return dt.datetime.now(UTC)

def iso(t):
    return t.astimezone(UTC).isoformat()

def parse(s):
    t = dt.datetime.fromisoformat(s.replace('Z', '+00:00'))
    if t.tzinfo is None: fail('timezone-aware UTC boundary required')
    return t.astimezone(UTC)

def regular(p):
    p = Path(p)
    if not p.is_absolute() or any(x.is_symlink() for x in (p, *p.parents)) or not p.is_file():
        fail('absolute regular nonsymlink file required: ' + str(p))
    return p

def read(p):
    return json.loads(regular(p).read_bytes())

def sha(p):
    return hashlib.sha256(regular(p).read_bytes()).hexdigest()

def save(p, obj):
    p.parent.mkdir(parents=True, exist_ok=True)
    raw = (json.dumps(obj, ensure_ascii=False, indent=2) + '\n').encode()
    # Publish complete bytes atomically, with an exclusive final pathname.
    tmp = p.with_name(p.name + '.partial')
    fd = os.open(tmp, os.O_CREAT | os.O_EXCL | os.O_WRONLY, 0o444)
    with os.fdopen(fd, 'wb') as f: f.write(raw)
    try: os.link(tmp, p)
    finally: tmp.unlink()
    return obj

def module(name, p):
    spec = importlib.util.spec_from_file_location(name, p)
    m = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(m)
    return m

def rows(root, names, sources=True):
    paths = [regular(root / n) for n in names]
    src = root / 'sources'
    if sources:
        if src.is_symlink() or not src.is_dir(): fail('source directory missing/nonregular')
        for p in sorted(src.rglob('*')):
            if p.is_symlink(): fail('symlink source rejected')
            if p.is_file(): paths.append(regular(p))
    if sources and any(p.stat().st_size == 0 for p in paths): fail('empty required artifact/source')
    return [{'relative_path': str(p.relative_to(root)), 'sha256': sha(p), 'bytes': p.stat().st_size} for p in paths]

def verify_rows(root, frozen, sources=True):
    for r in frozen:
        rel = Path(r['relative_path'])
        if rel.is_absolute() or '..' in rel.parts: fail('frozen member escapes root')
        p = regular(root / rel)
        if sha(p) != r['sha256'] or p.stat().st_size != r['bytes']: fail('frozen dependency changed: ' + str(rel))
    if sources:
        src = root / 'sources'
        if src.is_symlink() or not src.is_dir(): fail('source root changed')
        actual = sorted(str(p.relative_to(root)) for p in src.rglob('*') if p.is_file())
        if any(p.is_symlink() for p in src.rglob('*')) or actual != sorted(r['relative_path'] for r in frozen if r['relative_path'].startswith('sources/')):
            fail('frozen source inventory changed')

def check_parent():
    if sha(PARENT / 'bundle-manifest.json') != PARENT_MANIFEST: fail('pinned full-v1 manifest changed')
    verify_rows(PARENT, read(PARENT / 'bundle-manifest.json')['files'], sources=False)

def check_private(dest):
    m = read(dest / 'b03-manifest.json')
    verify_rows(dest, m['files'], sources=False)
    return m

def load(config):
    config = regular(Path(config).absolute())
    dest = config.parent.parent
    check_private(dest)
    base = module('b03_reference_prepare', dest / 'helpers/er12-screen-v1/prepare.py')
    c = base.load_config(str(config))
    c['_dest'] = dest
    c['_base'] = base
    c['_control'] = c['_root'] / 'control'
    return c

def prep(a):
    global PARENT
    if getattr(a, 'reference_directory', None): PARENT = Path(a.reference_directory).absolute()
    check_parent()
    if getattr(a, 'method', 'B03') != 'B03' or getattr(a, 'candidate', 'luna') != 'luna': fail('prospective B03 Luna retention only; no other-method/provider substitution')
    if getattr(a, 'stage_budgets_s', '1800,720,1080') != '1800,720,1080' or getattr(a, 'whole_budget_s', 3600) != 3600:
        fail('frozen B03 maxima are 30/12/18 clipped to original T0+60')
    # Parent stays immutable; its finite materializer copies a complete R0 closure.
    parent = module('b03_reference_materialize', PARENT / 'materialize.py')
    ns = SimpleNamespace(**vars(a))
    ns.method = 'R0'; ns.method_directory = None; ns.activation_capture_version = 'exact-capture-v21'
    ns.stage_budgets_s = '1800,720,1080'; ns.whole_budget_s = 3600; ns.candidate = 'luna'
    with contextlib.redirect_stdout(io.StringIO()): parent.materialize(ns)
    dest = Path(a.destination).absolute()
    config = dest / 'configs' / (a.run_id + '.json')
    local = dest / 'helpers/b03-retain-v1'
    local.mkdir(parents=True)
    for n in ('b03.py', 'method.json', 'author-ready.js', 'author-resume.js', 'author-complete.js', 'critic-complete.js'):
        (local / n).write_bytes(regular(HERE / n).read_bytes())
    cfg = read(config)
    cfg['public_recipe_choice'] = 'B03'
    cfg['b03_method_card'] = {'path': str(local / 'method.json'), 'sha256': sha(local / 'method.json')}
    cfg['retained_author'] = {'investigator_substantive_cap_s': 1800, 'critic_cap_s': 720, 'finalization_cap_s': 1080,
        'same_context_same_goal': True, 'completion_before_draft': False, 'known_release': str(dest / 'run' / a.run_id / 'control/critic-release.json')}
    cfg['final_stage'] = 'investigator/final'
    config.write_text(json.dumps(cfg, ensure_ascii=False, indent=2) + '\n')
    # Original bootstrap is preserved lineage; root uses finite requests below for B03.
    files = rows(dest, [str(p.relative_to(dest)) for p in sorted(dest.rglob('*')) if p.is_file()], sources=False)
    save(dest / 'b03-manifest.json', {'version': 'b03-retain-v1', 'parent_manifest_sha256': PARENT_MANIFEST,
        'files': files, 'mutable_runtime_excluded': 'run/', 'dispatches': 0, 'native_qualification': False})
    return {'config': str(config), 'method': 'B03', 'finite_prep': True, 'dispatches': 0}

def inv(c): return c['_root'] / 'stages/investigator'
def critic(c): return c['_root'] / 'stages/critic'
def ctl(c, name): return c['_control'] / name
def helper(c): return c['_dest'] / 'helpers/b03-retain-v1/b03.py'

def identity(raw):
    g = raw.get('goal', {})
    if not isinstance(g, dict) or not {'threadId', 'createdAt', 'objective', 'status'} <= g.keys(): fail('complete native Codex Goal identity required')
    # Native Codex exposes threadId + createdAt, not a separate opaque Goal UUID.
    return {k: g[k] for k in ('threadId', 'createdAt', 'objective')}

def goal_check(c, raw, stage, status='active', original=None):
    g = raw.get('goal', {})
    ident = identity(raw)
    if status == 'active':
        guard = module('b03_unchanged_guard', c['_dest'] / 'mechanics/exact-goal-binding-guard-v1/assert-active-goal.py')
        guard.check(stage, json.dumps(raw, ensure_ascii=False))
    elif g.get('status') != status: fail('native terminal status differs')
    if original is not None and ident != original: fail('original native Goal identity changed; no replacement')
    return ident

def active(c, p, stage=None):
    stage = stage or inv(c)
    original = goal_check(c, read(stage / 'native-goal-create.json'), stage)
    result = goal_check(c, read(p), stage, original=original)
    if (stage / 'native-goal-terminal.json').exists(): fail('Goal already terminal; retention refused')
    return result

def dispatch(c, stage):
    p = inv(c) if stage == 'investigator' else critic(c)
    return read(p / 'dispatch.json')['returned']

def structured(raw):
    if not isinstance(raw, dict) or raw.get('isError') is True: fail('successful complete tool response required')
    if isinstance(raw.get('structuredContent'), dict): return raw['structuredContent']
    if 'content' in raw:
        for item in raw['content']:
            if item.get('type') == 'text':
                result = json.loads(item['text'])
                if isinstance(result, dict): return result
        fail('tool response has no complete structured object')
    return raw

def task_match(c, stage, raw, running=False):
    raw = structured(raw)
    d = dispatch(c, stage)
    if raw.get('taskId') != d.get('taskId'): fail('exact returned task ID mismatch')
    if raw.get('childThreadId') is not None and raw['childThreadId'] != d.get('childThreadId'): fail('task backing context mismatch')
    if raw.get('hasPendingChildRuns') is not False: fail('explicitly zero child runs required')
    if running and raw.get('status') != 'running': fail('original author task must still be running')
    return d

def science(c):
    p = inv(c)
    r = read(p / 'plan-reveal.json')
    if r.get('single_use') is not True or r.get('run_id') != c['run_id']: fail('one-shot plan reveal missing')
    if sha(p / 'discovery.md') != r.get('discovery_sha256') or sha(p / 'revealed-plan.md') != r.get('plan_sha256'):
        fail('one-shot discovery/plan hashes differ')
    if sha(Path(c['plan_path'])) != r['plan_sha256']: fail('root-frozen exact plan changed')
    return rows(p, SCIENCE)

def freeze_author(c):
    p = inv(c); t = now()
    if t >= parse(read(p / 'freeze.json')['stage_deadline_utc']): fail('investigator substantive deadline expired; retain partial, no ready')
    ident = active(c, p / 'native-wait-active.json')
    d = dispatch(c, 'investigator')
    if not d.get('childThreadId'): fail('original returned T3 context identity missing')
    frozen = science(c)
    for r in frozen: (p / r['relative_path']).chmod(0o444)
    return save(ctl(c, 'author-ready.json'), {'version': 'b03.author-ready.v1', 'draft_frozen_at_utc': iso(t),
        'run_id': c['run_id'], 'taskId': d['taskId'], 't3_child_context': d['childThreadId'], 'native_identity': ident, 'native_active_sha256': sha(p / 'native-wait-active.json'),
        'native_create_sha256': sha(p / 'native-goal-create.json'), 'files': frozen, 'waiting_is_activity': False,
        'occupancy_counted_separately': True, 'goal_completion_claimed': False,
        'binding_basis': 'Original assigned capture path + unique frozen machine objective + direct full native responses; T3 and provider IDs are separate namespaces',
        'provider_session_mapping_independently_proved': False})

def frozen_author(c):
    r = read(ctl(c, 'author-ready.json'))
    verify_rows(inv(c), r['files']); science(c)
    if sha(inv(c) / 'native-wait-active.json') != r['native_active_sha256'] or sha(inv(c) / 'native-goal-create.json') != r['native_create_sha256']:
        fail('original active/create capture changed')
    active(c, inv(c) / 'native-wait-active.json')
    return r

def proc_token(pid):
    # Linux process birth token prevents recycled PID from proving a waiter.
    return Path('/proc/' + str(pid) + '/stat').read_text().rsplit(')', 1)[1].split()[19]

def observe(c, raw):
    r = frozen_author(c)
    d = task_match(c, 'investigator', raw, running=True)
    if d.get('childThreadId') != r['t3_child_context'] or d.get('taskId') != r['taskId']: fail('original returned task/context changed')
    w = verify_waiter(c)
    if now() >= c['_whole_deadline']: fail('whole deadline expired')
    return save(ctl(c, 'retained-ready.json'), {'root_observed_at_utc': iso(now()), 'author_ready_sha256': sha(ctl(c, 'author-ready.json')),
        'waiting_sha256': sha(ctl(c, 'waiting.json')), 'native_identity': r['native_identity'], 'task_status': structured(raw), 'task_status_raw': raw,
        'draft_source_plan_files': r['files'], 'predecessor_is_terminal': False, 'science_qualified': False})

def verify_waiter(c):
    if ctl(c, 'wait-ended.json').exists(): fail('original blocking waiter already ended')
    w = read(ctl(c, 'waiting.json'))
    if w.get('ready_sha256') != sha(ctl(c, 'author-ready.json')) or w.get('process_birth') != proc_token(w['pid']): fail('original waiter is not live/bound')
    cmd = Path('/proc/' + str(w['pid']) + '/cmdline').read_bytes().split(b'\0')
    if b'wait' not in cmd or str(helper(c)).encode() not in cmd or str(c['_config_path']).encode() not in cmd:
        fail('waiter command/context binding differs')
    return w

def verify_retained(c):
    r = read(ctl(c, 'retained-ready.json')); frozen_author(c)
    if r['author_ready_sha256'] != sha(ctl(c, 'author-ready.json')) or r['waiting_sha256'] != sha(ctl(c, 'waiting.json')):
        fail('root-observed retained dependency changed')
    return r

def prepare(c, stage, author_status=None):
    base = c['_base']; p = inv(c) if stage == 'investigator' else critic(c)
    if p.joinpath('dispatch.json').exists(): fail('already dispatched; reconcile exact task, never redispatch')
    if p.joinpath('request.json').exists():
        base.verify_saved_request(p, read(p / 'request.json'))
        if stage == 'critic':
            verify_retained(c); verify_waiter(c); task_match(c, 'investigator', author_status, running=True)
        return {'args': read(p / 'request.json')['args'], 'stageDir': str(p), 'retry': True}
    if stage == 'investigator':
        result = base.prepare(c, 'investigator')
        frozen = read(p / 'freeze.json'); im = read(p / 'input-map.json')
        text = (p / 'assignment.md').read_text()
        text = text.replace('investigator → independent critic → fresh complete reviser', 'retained investigator → independent fresh critic → SAME original investigator finalization')
        text = text.replace('Save all three required files before Goal completion.', 'Save discovery/source map/draft before freezing; KEEP THIS GOAL ACTIVE. Draft readiness is not Goal completion.')
        text += f'''\nB03 RETENTION REQUIREMENTS\nInvestigator substantive maximum 30 minutes, critic maximum 12, original-author finalization maximum 18, each clipped to original T0+60. Stop drafting at the investigator deadline above. The same Goal remains ACTIVE through waiting; do not call update_goal active, paused or complete at draft freeze. No newGoal/new context, no author delegation, no critic edits while waiting.\nActivate exactly once using the existing direct-capture snippet at {p / 'native-activate.js'}. Read and execute that snippet as functions.exec code; it machine-reads the frozen objective and saves the complete native response. Unknown activation means stop/reconcile, never retry creation.\nAfter one-shot plan reveal and complete draft/source science, run {c['_dest'] / 'helpers/b03-retain-v1/author-ready.js'} with stageDir={p} and config={c['_config_path']}. It directly captures get_goal, freezes exact science and starts the blocking known-path waiter. Retain and poll that SAME returned exec session with write_stdin until it completes; each poll no longer than 60 seconds. Keep native Goal ACTIVE and this actual context running. Waiter signals at {ctl(c, 'critic-release.json')} only; no directory search, no paid inference/science/author critique during waiting. Root observes frozen science + running task + live waiter before critic admission.\nOnly after successful wait, run author-resume.js in THIS SAME actual context/Goal. It checks root terminal/custody release and directly captured same active birth. Read only fixed frozen delivery paths and resume finalization. Independent critic agreement is not authority. Recheck governing primary evidence; accept/amend/reject/retain uncertainty for every issue; preserve full brief/exact plan, alternatives, supported conditions, owner decisions and proposed-versus-executed validation. Save complete self-contained final.md/source-map.json and sources under {p / 'final'} ONLY. Original discovery/draft/source/plan remain frozen. Finalization deadline is immutable min(root release preparation+18 minutes, original T0+60), including delay and delivery. Finish early.\nWhen full final is saved, run author-complete.js: one actual update_goal complete on THIS Goal only, then direct terminal capture. On failed/expired wait stop substantive work, retain partial, leave Goal status honest; do not claim complete or create replacement.\n'''
        frozen['native_goal_objective'] = f"ER13 B03 retained investigator and original-author finalization, run {c['run_id']}: execute {p / 'assignment.md'}; keep this SAME Goal active after draft freeze, wait for root-frozen fresh criticism, save complete final before completing SAME Goal by {iso(c['_whole_deadline'])}."
    else:
        base.init_run(c); verify_retained(c); verify_waiter(c)
        task_match(c, 'investigator', author_status, running=True)
        if now() >= c['_whole_deadline']: fail('whole deadline expired')
        p.mkdir(parents=True, exist_ok=False); (p / 'sources').mkdir()
        t = now(); deadline = min(t + dt.timedelta(seconds=720), c['_whole_deadline'])
        im = {'run_id': c['run_id'], 'stage': stage, 'brief': str(c['_root'] / 'inputs/brief.md'),
            'predecessors': [str(inv(c) / n) for n in SCIENCE], 'revealed_plan': str(inv(c) / 'revealed-plan.md'),
            'source_roots': [str(inv(c) / 'sources')], 'allowed_write_root': str(p),
            'stage_deadline_utc': iso(deadline), 'whole_deadline_utc': iso(c['_whole_deadline']), 'requested_route': c['provider']}
        text = base.make_prompt(c, stage, im, iso(deadline), iso(c['_whole_deadline']))
        text += f'\nB03: original investigator is waiting with ACTIVE Goal; root-observed frozen package is {ctl(c, "retained-ready.json")}. A completed investigator task is NOT required or claimed. You are genuinely fresh; author cannot delegate or critique during wait. Perform complete ordinary independent criticism. Save critique.md/source-map.json/sources, complete your own single Goal, capture terminal, then end this task. Root alone freezes your terminal package before releasing it to original author. Activate by executing {p / "native-activate.js"}.\n'
        frozen = {'prepared_at_utc': iso(t), 'stage': stage, 'stage_budget_s': 720, 'stage_deadline_utc': iso(deadline),
            'whole_deadline_utc': iso(c['_whole_deadline']), 'native_goal_objective': f"ER13 B03 independent critic, run {c['run_id']}: execute {p / 'assignment.md'} and save complete full-scope criticism before completing this Goal.",
            'retained_ready_sha256': sha(ctl(c, 'retained-ready.json'))}
        result = {'stageDir': str(p), 'retry': False}
    # All prompt/config method changes are prospective, before any native request.
    names = ('author-ready.js', 'author-resume.js', 'author-complete.js') if stage == 'investigator' else ('critic-complete.js',)
    for name in names:
            js = (c['_dest'] / 'helpers/b03-retain-v1' / name).read_text()
            js = js.replace('__STAGE_DIR_JSON__', json.dumps(str(p))).replace('__CONFIG_JSON__', json.dumps(str(c['_config_path']))).replace('__HELPER_JSON__', json.dumps(str(helper(c))))
            (p / name).write_text(js)
            text = text.replace(str(c['_dest'] / 'helpers/b03-retain-v1' / name), str(p / name))
    if stage == 'critic': text += f'\nAfter complete critique/source map/source index are saved, execute {p / "critic-complete.js"} as functions.exec for direct native terminal capture, then finish your T3 task. Root reads the exact saved native-goal-terminal.json and actual task_status; neither is invented.\n'
    im['fixed_critic_release'] = str(ctl(c, 'critic-release.json'))
    im['allowed_mechanics'] = [str(helper(c)), str(c['_config_path']), str(p / 'native-activate.js')]
    im['allowed_mechanics'] += [str(p / n) for n in names]
    if stage == 'investigator': im['allowed_mechanics'] += [str(c['_dest'] / 'helpers/er12-screen-v1/reveal.py')]
    for name, obj in [('input-map.json', im)]:
        (p / name).write_text(json.dumps(obj, indent=2) + '\n')
    (p / 'assignment.md').write_text(text)
    snippet = (c['_dest'] / 'mechanics/exact-activation-capture-v2-1/activation-snippet-template.js').read_text().replace('__STAGE_DIR_JSON__', json.dumps(str(p)))
    (p / 'native-activate.js').write_text(snippet)
    deps = [c['_root'] / 'inputs/brief.md', p / 'assignment.md', p / 'input-map.json', p / 'native-activate.js']
    deps += [p / n for n in names]
    if stage == 'critic': deps += [ctl(c, 'retained-ready.json'), *[inv(c) / r['relative_path'] for r in frozen_author(c)['files']]]
    frozen['frozen_inputs'] = [{'path': str(x), 'sha256': sha(x), 'bytes': x.stat().st_size} for x in deps]
    (p / 'freeze.json').write_text(json.dumps(frozen, indent=2) + '\n')
    rid = f"er13-b03-{c['run_id']}-{stage}-v1"
    args = {'clientRequestId': rid, 'mode': 'async', 'role': 'general', 'title': f"ER13 B03 {c['run_id']} {stage}",
        'target': c['provider'], 'runtimeMode': c.get('runtime_mode', 'full-access'), 'interactionMode': 'default',
        'task': f"Execute exactly {p / 'assignment.md'} and input-map.json. Native activation: read/execute {p / 'native-activate.js'} as functions.exec code. ONE native Goal only. No delegation, no parent/history/other-candidate input. Original author KEEP SAME Goal ACTIVE after draft freeze and block on the prescribed waiter; critic fresh/context separate. " + text.split('\n')[1]}
    (p / 'request.json').write_text(json.dumps({'requested_at_utc': frozen['prepared_at_utc'], 'clientRequestId': rid, 'args': args}, indent=2) + '\n')
    if stage == 'critic': save(ctl(c, 'critic-admission.json'), {'observed_at_utc': iso(now()), 'author_task_status': structured(author_status), 'author_task_status_raw': author_status, 'retained_ready_sha256': sha(ctl(c, 'retained-ready.json')), 'predecessor_is_terminal': False})
    result['args'] = args
    return result

def verify_stage_inputs(p):
    f = read(p / 'freeze.json')
    for row in f['frozen_inputs']:
        x = regular(row['path'])
        if sha(x) != row['sha256'] or x.stat().st_size != row['bytes']: fail('prepared dependency changed')
    return f

def deliver(c, raw):
    t = now(); verify_retained(c); verify_waiter(c)
    if t >= c['_whole_deadline']: fail('whole deadline expired; preserve critic partial, no resume')
    original_raw = raw; raw = structured(raw)
    p = critic(c); task_match(c, 'critic', raw)
    if raw.get('status') != 'completed': fail('critic failed/nonterminal; no scientific release')
    verify_stage_inputs(p)
    ident = goal_check(c, read(p / 'native-goal-create.json'), p)
    goal_check(c, read(p / 'native-goal-terminal.json'), p, status='complete', original=ident)
    d = dispatch(c, 'critic')
    if not d.get('childThreadId') or d['childThreadId'] == dispatch(c, 'investigator').get('childThreadId'): fail('critic T3 context is not fresh')
    if ident['threadId'] == read(ctl(c, 'author-ready.json'))['native_identity']['threadId']: fail('critic context is not fresh')
    if t >= parse(read(p / 'freeze.json')['stage_deadline_utc']): fail('critic delivery expired; no reset/late release')
    frozen = rows(p, ('critique.md', 'source-map.json', 'native-goal-create.json', 'native-goal-terminal.json'))
    # Existing pinned terminal handoff first; preserve actual status without faking author terminal.
    if (p / 'status.json').exists() and read(p / 'status.json') != raw: fail('first critic status record differs')
    if not (p / 'status.json').exists(): save(p / 'status.json', raw)
    handoff = module('b03_reference_handoff', c['_dest'] / 'helpers/er12-screen-v1/handoff.py')
    handoff.seal(p)
    target = ctl(c, 'critic-delivery'); target.mkdir(exist_ok=False); (target / 'sources').mkdir()
    for row in frozen:
        out = target / row['relative_path']; out.parent.mkdir(parents=True, exist_ok=True)
        out.write_bytes((p / row['relative_path']).read_bytes()); out.chmod(0o444)
    verify_rows(p, frozen); verify_rows(target, frozen)
    custody = save(ctl(c, 'critic-custody.json'), {'root_observed_at_utc': iso(now()), 'task_status': raw, 'task_status_raw': original_raw,
        'critic_native_identity': ident, 'retained_ready_sha256': sha(ctl(c, 'retained-ready.json')), 'delivery_files': frozen,
        'terminal_handoff_sha256': sha(ctl(c, 'terminal-handoffs/critic/manifest.json')), 'science_qualified': False})
    if now() >= min(c['_whole_deadline'], parse(read(p / 'freeze.json')['stage_deadline_utc'])):
        fail('critic custody copied after deadline; preserve partial, no scientific release')
    return save(ctl(c, 'critic-release.json'), {'version': 'b03.critic-release.v1', 'status': 'ready', 'release_prepared_at_utc': iso(t),
        'published_at_utc': iso(now()), 'finalization_deadline_utc': iso(min(t + dt.timedelta(seconds=1080), c['_whole_deadline'])),
        'custody_sha256': sha(ctl(c, 'critic-custody.json')), 'ready_sha256': sha(ctl(c, 'author-ready.json')),
        'fixed_critique_path': str(target / 'critique.md'), 'fixed_source_map': str(target / 'source-map.json'),
        'fixed_source_root': str(target / 'sources'), 'replacement_goal_permitted': False})

def critic_check(c):
    p = critic(c); f = verify_stage_inputs(p); verify_retained(c)
    if now() >= min(parse(f['stage_deadline_utc']), c['_whole_deadline']): fail('critic deadline expired')
    active(c, p / 'native-critic-complete-active.json', stage=p)
    return {'required_files': rows(p, ('critique.md', 'source-map.json')), 'goal_active_before_completion': True}

def release(c):
    r = read(ctl(c, 'critic-release.json'))
    if r.get('status') != 'ready': fail('critic failure/expiry signal; no revision')
    verify_retained(c)
    if r['custody_sha256'] != sha(ctl(c, 'critic-custody.json')) or r['ready_sha256'] != sha(ctl(c, 'author-ready.json')): fail('release custody changed')
    custody = read(ctl(c, 'critic-custody.json'))
    task_match(c, 'critic', custody['task_status'])
    if custody['task_status'].get('status') != 'completed': fail('critic not actually terminal')
    if custody['retained_ready_sha256'] != sha(ctl(c, 'retained-ready.json')): fail('retained-ready custody changed')
    if custody['terminal_handoff_sha256'] != sha(ctl(c, 'terminal-handoffs/critic/manifest.json')): fail('critic terminal custody changed')
    verify_rows(ctl(c, 'critic-delivery'), custody['delivery_files'])
    for key, name in [('fixed_critique_path', 'critique.md'), ('fixed_source_map', 'source-map.json'), ('fixed_source_root', 'sources')]:
        if r.get(key) != str(ctl(c, 'critic-delivery') / name): fail('release changed exact fixed critic path')
    if parse(r['finalization_deadline_utc']) > min(c['_whole_deadline'], parse(r['release_prepared_at_utc']) + dt.timedelta(seconds=1080)):
        fail('release extended finalization/common deadline')
    return r

def wait(c):
    frozen_author(c); t = now()
    save(ctl(c, 'waiting.json'), {'wait_started_at_utc': iso(t), 'pid': os.getpid(), 'process_birth': proc_token(os.getpid()),
        'ready_sha256': sha(ctl(c, 'author-ready.json')), 'whole_deadline_utc': iso(c['_whole_deadline']),
        'waiting_is_inference': False, 'resident_occupancy_is_free': False})
    reason = 'expired'; result = None
    try:
        while now() < c['_whole_deadline']:
            if ctl(c, 'critic-release.json').exists():
                result = release(c); reason = 'ready'; break
            time.sleep(min(1.0, max(0.0, (c['_whole_deadline'] - now()).total_seconds())))
    except (ValueError, OSError, KeyError) as exc:
        reason = 'failed'; result = {'error': str(exc)}
    ended = now()
    report = save(ctl(c, 'wait-ended.json'), {'reason': reason, 'wait_started_at_utc': iso(t), 'wait_ended_at_utc': iso(ended),
        'waiting_occupancy_seconds': (ended - t).total_seconds(), 'actual_provider_activity_seconds': None,
        'actual_provider_activity_explanation': 'Not inferred from residency; native counters/usage separately captured',
        'goal_state_written': False, 'result': result})
    if reason != 'ready': fail('retained wait ' + reason + '; preserve partial, no new Goal/completion')
    return report

def resume(c):
    r = release(c); t = now()
    if read(ctl(c, 'wait-ended.json')).get('reason') != 'ready': fail('original wait did not successfully end')
    ident = active(c, inv(c) / 'native-resume-active.json')
    if ident != read(ctl(c, 'author-ready.json'))['native_identity']: fail('same original Goal required')
    if t >= parse(r['finalization_deadline_utc']): fail('finalization expired; keep partial, no newGoal/clockreset')
    out = inv(c) / 'final'; out.mkdir(exist_ok=False); (out / 'sources').mkdir()
    return save(ctl(c, 'author-resumed.json'), {'resumed_at_utc': iso(t), 'native_identity': ident,
        'active_receipt_sha256': sha(inv(c) / 'native-resume-active.json'), 'release_sha256': sha(ctl(c, 'critic-release.json')),
        'finalization_deadline_utc': r['finalization_deadline_utc'], 'allowed_write_root': str(out),
        'waiting_seconds': read(ctl(c, 'wait-ended.json'))['waiting_occupancy_seconds'], 'new_goal_created': False})

def finish(c):
    r = release(c); frozen_author(c)
    resumed = read(ctl(c, 'author-resumed.json'))
    if resumed['release_sha256'] != sha(ctl(c, 'critic-release.json')): fail('resumed release changed')
    ident = active(c, inv(c) / 'native-complete-active.json')
    if ident != resumed['native_identity']: fail('same native Goal required before completion')
    if now() >= parse(r['finalization_deadline_utc']): fail('finalization expired; no successful completion claim')
    frozen = rows(inv(c) / 'final', ('final.md', 'source-map.json'))
    for row in frozen: (inv(c) / 'final' / row['relative_path']).chmod(0o444)
    return save(ctl(c, 'final-ready.json'), {'full_artifact_observed_at_utc': iso(now()), 'files': frozen,
        'same_native_identity': resumed['native_identity'], 'goal_still_active_before_completion': True,
        'scientific_quality': 'UNASSESSED', 'occupancy_separate_from_activity': True})

def terminal(c):
    r = read(ctl(c, 'final-ready.json'))
    verify_rows(inv(c) / 'final', r['files']); frozen_author_terminal = read(ctl(c, 'author-ready.json'))
    verify_rows(inv(c), frozen_author_terminal['files'])
    ident = goal_check(c, read(inv(c) / 'native-goal-terminal.json'), inv(c), status='complete', original=r['same_native_identity'])
    ended = now(); created = dt.datetime.fromtimestamp(ident['createdAt'], UTC)
    return save(ctl(c, 'author-terminal-observed.json'), {'observed_at_utc': iso(ended), 'native_identity': ident,
        'native_terminal_sha256': sha(inv(c) / 'native-goal-terminal.json'), 'resident_lifetime_observed_seconds': (ended - created).total_seconds(),
        'open_context_wait_seconds': read(ctl(c, 'wait-ended.json'))['waiting_occupancy_seconds'],
        'actual_activity_seconds': None, 'late_terminal_observation': ended >= c['_whole_deadline'],
        'delivery_time_eligibility_separate': True, 'science_qualified': False})

def main():
    ap = argparse.ArgumentParser(description=__doc__)
    ap.add_argument('action', choices=['prep', 'prepare', 'record', 'record-status', 'freeze-author', 'observe-ready', 'wait', 'deliver', 'critic-check', 'resume', 'finish', 'terminal', 'stop', 'verify'])
    ap.add_argument('--config'); ap.add_argument('--stage', choices=['investigator', 'critic']); ap.add_argument('--json-file')
    for n in ('destination', 'authorized-provider-instance', 'brief', 'plan', 'run-id', 'whole-deadline-utc', 't0-utc'):
        ap.add_argument('--' + n)
    ap.add_argument('--reason')
    ap.add_argument('--method', default='B03'); ap.add_argument('--candidate', default='luna')
    ap.add_argument('--stage-budgets-s', default='1800,720,1080'); ap.add_argument('--whole-budget-s', type=int, default=3600)
    ap.add_argument('--activation-capture-version', choices=['exact-capture-v21'], default='exact-capture-v21')
    ap.add_argument('--reference-directory', help='Exact relocated pinned full-v1 closure; default is the campaign sibling sealed/full-v1')
    a = ap.parse_args()
    try:
        if a.action == 'prep':
            if not all((a.destination, a.authorized_provider_instance, a.brief, a.plan, a.run_id, a.whole_deadline_utc, a.t0_utc)): fail('finite prep requires destination, authorized route, NEW brief/plan, unique run ID, original T0 and deadline')
            out = prep(a)
        else:
            if not a.config: fail('--config required')
            c = load(a.config)
            raw = read(Path(a.json_file).absolute()) if a.json_file else None
            if a.action == 'prepare': out = prepare(c, a.stage or 'investigator', raw)
            elif a.action == 'record': out = c['_base'].record_response(c, a.stage or 'investigator', raw)
            elif a.action == 'record-status': out = c['_base'].record_status(c, a.stage or 'investigator', raw)
            elif a.action == 'freeze-author': out = freeze_author(c)
            elif a.action == 'observe-ready': out = observe(c, raw)
            elif a.action == 'wait': out = wait(c)
            elif a.action == 'deliver': out = deliver(c, raw)
            elif a.action == 'critic-check': out = critic_check(c)
            elif a.action == 'resume': out = resume(c)
            elif a.action == 'finish': out = finish(c)
            elif a.action == 'terminal': out = terminal(c)
            elif a.action == 'stop': out = save(ctl(c, 'critic-release.json'), {'status': 'failed', 'observed_at_utc': iso(now()), 'reason': a.reason or 'dispatcher reports failure; retain partial', 'goal_state_written': False})
            else: out = {'verified': True, 'dispatches': 0}
        print(json.dumps(out, ensure_ascii=False))
    except (ValueError, OSError, KeyError, TypeError) as exc:
        ap.exit(2, str(exc) + '\n')

if __name__ == '__main__': main()
