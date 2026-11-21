#!/usr/bin/env python3
"""After-state, refusal code and origin export for Method B harness trials (DG5 addendum 6).

pm-ea-lead 1121185216-eff8 (1): the Method B harnesses (Started w2 through
pm_goal_dg5_methodb_stage1.Example, Certified stage 5 through
pm_goal_dg5_methodb_stage3.OwnerCheck) call the stock collector with their own
evaluate. Before this module their result was only ``{'errors': [...]}``: no
refusal code, no origin frame, no after-state, so the fixed stock judge
(pm_goal_guard_sweep._judge) could not decide a later refusal (CANNOT_DECIDE).

Each harness trial now records, in the child process that ran the complete call,
the same fields pm_goal_dg5_boundaries.invoke records for a bridge call:

  refusal_code         the owner refusal code (the harness's own ``code`` / ``refusal``)
  refusal_origin       bridge.refusal_origin(error, code), with two harness rules:
                       (a) addendum 8 (pm-ea-lead 1121204741-b1bb (1)): only inside the segment between the
                           innermost frame at one of the row's refusing sites (``sites``) and the raise, a Method B
                           harness frame (``HARNESS``) is marked as a checker frame (index 4) exactly when its
                           function is on PURE_OBSERVERS: matched by file name, qualified name and the sha256 of its
                           source, each listed with path:line and why it only reads. Any other harness frame in that
                           segment is marked opaque (fails closed); frames outside the segment keep the bridge's
                           marking; the raising frame is never transparent;
                       (b) frame paths under the harness's owner source tree are written
                           relative to it (``scripts/...``), as the harness writes its sites.
  refusing_sites       [(row, [path, line])] for every observation of the row that refused
  store_after_sha256   sweep.digest of the trial's whole store manifest after the call
  owner_state          pm_goal_dg5_owner_state.owner_state_digest(family, world, arguments),
                       only when the judge asks for it (tables.AFTER_STATE), else 'not requested'

``evaluate_result`` turns a trial record into the dict the collector reads
(pm_goal_guard_sweep.after_state and Collector.invoke). A record without the
export gives no ``store_after_sha256``: after_state() is None and every later
refusal stays CANNOT_DECIDE.
"""
from pathlib import Path

# The judge modules are imported inside each function, never at import time: Stage 5's harness imports this
# module before it puts the owner source's scripts first on sys.path, and the judge must come from there.

HARNESS = 'pm_goal_dg5_methodb_'   # file-name prefix of every Method B harness module
# The fixed stock judge (fix/covered-later-stock-20261121): every file its commits 34f212d3fb..STOCK_JUDGE touched.
STOCK_JUDGE = '0dc66db2c94ae159c5d0b62e61c4c00c9e51ee20'
JUDGE_FIX = {
    'scripts/dg5_gate_e2/README.md': 'a47b80cb839f7213192b7e505f6f8cb2cad7343aeaf58f95429a85f211525c75',
    'scripts/dg5_gate_e2/code_sites.py': '4ffb2b834c95e5e229e66fc0012b8195238a9db4f57bfefee4d1c45f2a37ca2b',
    'scripts/dg5_gate_e2/proof_sources.py': '335bbb989dafa21df7510bda9182693a9231cf559d39b646a7752c7b40fd837e',
    'scripts/pm_goal_c12_matrix.py': 'd3e54e08545ddd1ceb4526d101dd2f7abf1b96e3a2b2ebcea33011467eae14b5',
    'scripts/pm_goal_dg5_boundaries.py': '37eeeb056c19d12e02d2a827f5b0f5e92a4cbf1dfa09b37c61f7e21bd80230c2',
    'scripts/pm_goal_dg5_covered_later_selftest.py': 'a87a843c84949ba71aa4689a2a29d5977e74f230221ce06c0e6cec119b76496c',
    'scripts/pm_goal_dg5_matrix.py': '073f824168fbf9237817c3776e935deb35ad28ce84bb565d417e28d38001a1ec',
    'scripts/pm_goal_dg5_matrix_compare.py': 'ebfe2b7b70657a39cadc0e07190ae6bcf221357c65aba114afa23349b1dc8898',
    'scripts/pm_goal_dg5_owner_state.py': '73e12d5b1d90ad6afb7c7de76eb5747c4b019f03601e73e0601fbb6a41626e15',
    'scripts/pm_goal_dg5_sites.py': 'e9ee043733c0a6b194484c608d504e8929b6c15fb0564d5c34edcad86f6be13f',
    'scripts/pm_goal_dg5_sweep.py': '01e3bdfecee57d32fc0fd475d26ec1cfc7a1e1ec4db85346f52940bdf7e94cf2',
    'scripts/pm_goal_go_matrix.py': '486efedf99bb85c3dd77b07dec17160154d2ce534da7dbf07bec611b94acad27',
    'scripts/pm_goal_guard_sweep.py': 'fafd9e7d1b74df40a914596a009f6d81ddd66dc6e2087731f3f744924fcb272a',}
OWNER_KEYS = ('schema', 'hook', 'sha256', 'reason', 'objects')
# Addendum 8 (1): the harness functions that may sit between a refusing site and the owner raise and still leave the
# refusal the owner's. Key: (file name, co_qualname, sha256 of inspect.getsource of the code object). A changed
# function is a different key and so is no longer listed (fails closed). Lines are at the heads named.
PURE_OBSERVERS = {
    ('pm_goal_dg5_methodb_stage1.py', 'Example.in_child.<locals>.observe',
     '9c316b355b9831cc3deaa7f4c5e6bcc0c360149e136ed64298263ebf800e4a79'):
        'pilot edition, stage1.py:127-147. Reads bank.original.validator(ref), closure._registry_digest, '
        'bank.errors (jsonschema iter_errors), deep copies, the phase-table predicate; appends to the harness record; '
        'calls the owner validate with the same (bank, ref, value, code) or returns value unchanged (the cut). '
        'Never writes the document, the store, owner state or the arguments.',
    ('pm_goal_dg5_methodb_stage1.py', 'Example.in_child.<locals>.observe',
     'caf779716dedda69a198fe2c32974583cef40f548d9fa543432af2cdc9b2daf5'):
        'W2 edition, stage1.py:127-150 (adds the admitted validation_site pass-through). Same reads as the pilot '
        'edition; never writes.',
    ('pm_goal_dg5_methodb_w2_forwarded.py', 'ForwardedCall.in_child.<locals>.observe',
     'c1ae8abed9760c3e25fc4136efcf97428d7e60229ed747debe66f1e4001069f0'):
        'w2_forwarded.py:100-162. bank.lookup / resolver.lookup, bank.errors, deep copies of values into harness '
        'lists, require (raises ValueError: a harness error, never a refusal); calls original_validate(bank, '
        'reference, value, prefix) unchanged. Never writes the document or owner state.',
    ('pm_goal_dg5_methodb_w2_forwarded.py', 'HistoricalOriginalCall.in_child.<locals>.observe',
     'a6977181e60c703b284dc6ec24c63826d5014b11c8ec9e65b37a68652647e2e5'):
        'w2_forwarded.py:208-237. Same pattern: lookups, bank.errors, deep copies into harness lists, require; '
        'calls validate(bank, reference, value, prefix) unchanged.',
    ('pm_goal_dg5_methodb_stage3.py', 'OwnerCheck.call.<locals>.observe',
     '16f7bc32898f41a3f194e0165ddb3e2672c82a9053f974fc2876109174b58277'):
        'stage3.py:815-904 at the addendum 8 pilot head. Since addendum 8 it no longer writes: it requires the '
        'defect to be in the document already (written before the owner call by an owner edit channel, or by '
        'observe_editing, which is not listed and so stays opaque); reads errors through bank.errors and '
        'closure.CAPTURE, deep copies into harness lists, records the observation; calls the owner validate with '
        'the same arguments or returns the document unchanged (the cut).',
}


def _source_sha256(code):
    import hashlib
    import inspect
    try:
        return hashlib.sha256(inspect.getsource(code).encode()).hexdigest()
    except (OSError, TypeError):
        return None


def _harness_codes(error):
    """(file name, line, function name) -> code object, for every traceback frame of the exception chain."""
    found, seen, current = {}, set(), error
    while current is not None and id(current) not in seen:
        seen.add(id(current))
        tb = current.__traceback__
        while tb is not None:
            code = tb.tb_frame.f_code
            found[(Path(code.co_filename).name, tb.tb_lineno, code.co_name)] = code
            tb = tb.tb_next
        current = current.__cause__ or current.__context__
    return found


def pure_observer(code):
    """The PURE_OBSERVERS entry this code object is, or None."""
    if code is None:
        return None
    key = (Path(code.co_filename).name, code.co_qualname, _source_sha256(code))
    return key if key in PURE_OBSERVERS else None


def origin(error, code, source=None, sites=()):
    """bridge.refusal_origin, owner paths relative to `source`, and rule (a) on the site-to-raise segment.

    `sites`: the row's refusing sites, (path, line) as the harness records them (relative to `source` when given)."""
    import pm_goal_dg5_boundaries as bridge
    out = bridge.refusal_origin(error, code)
    base = Path(source).resolve() if source is not None else None
    codes = _harness_codes(error)
    wanted = {(str(path), int(line)) for path, line in sites}
    frames = []
    for where, line, name, bridge_or_guard, checker in out['frames']:
        if base is not None:
            try:
                where = str(Path(where).resolve().relative_to(base))
            except ValueError:
                pass
        frames.append([where, line, name, bridge_or_guard, checker])
    last = len(frames) - 1
    matched = max((index for index, frame in enumerate(frames) if (frame[0], frame[1]) in wanted), default=None)
    segment, harness, opaque = [], 0, []
    if matched is not None:
        for index in range(matched + 1, last):
            frame = frames[index]
            if not Path(frame[0]).name.startswith(HARNESS):
                continue
            key = pure_observer(codes.get((Path(frame[0]).name, frame[1], frame[2])))
            frame[4] = key is not None
            segment.append(dict(frame=frame[:3], pure_observer=key is not None))
            if key is not None:
                harness += 1
            else:
                opaque.append(frame[:3])
    site = out['site']
    if base is not None and site is not None:
        try:
            site = [str(Path(site[0]).resolve().relative_to(base)), site[1]]
        except ValueError:
            pass
    # The origin site stays the innermost frame outside the bridge and the guard helpers; a
    # harness observer frame is never innermost (the owner validator it calls raises).
    raised_in_harness = bool(frames) and Path(frames[-1][0]).name.startswith(HARNESS)
    if raised_in_harness:
        frames[-1][4] = False
    return dict(out, site=site, frames=frames, harness_frames=harness, raised_in_harness=raised_in_harness,
                segment_matched=matched is not None, segment=segment, opaque_harness_frames=opaque)


def owner_state(family, world, arguments=None):
    import pm_goal_dg5_owner_state as owner
    import pm_goal_guard_tables as tables
    if not getattr(tables, 'AFTER_STATE', False):
        return dict(schema=owner.SCHEMA, hook=family, sha256=None, reason='not requested')
    try:
        state = owner.owner_state_digest(family, world, arguments)
    except Exception as error:  # noqa: BLE001 - no digest, never a guess
        state = dict(schema=owner.SCHEMA, hook=family, sha256=None,
                     reason='owner-state hook raised %s: %s' % (type(error).__name__, str(error)[:160]))
    return {k: v for k, v in state.items() if k in OWNER_KEYS}


def export(record, *, after, family, world, arguments=None, refusing_sites=()):
    """Add the after-state and refusing sites to a trial record, in the child, after the call."""
    import pm_goal_guard_sweep as sweep
    record['store_after_sha256'] = sweep.digest(after)
    record['owner_state'] = owner_state(family, world, arguments)
    record['refusing_sites'] = [[row, list(site)] for row, site in refusing_sites]
    return record


def evaluate_result(record, errors):
    """The collector's view of one exported trial (the keys bridge.invoke returns)."""
    result = dict(errors=list(errors))
    if 'store_after_sha256' not in record:
        return result   # no export: after_state() is None, a later refusal is CANNOT_DECIDE
    state = record.get('owner_state') or {}
    result.update(refusal_code=record.get('code', record.get('refusal')), refusal_origin=record.get('refusal_origin'),
                  refusing_sites=[tuple(item) for item in record.get('refusing_sites') or []],
                  store_after_sha256=record['store_after_sha256'], owner_state_sha256=state.get('sha256'),
                  owner_state={k: v for k, v in state.items() if k != 'sha256'})
    return result


def fixed_judge_source(source, declared):
    """Stage 5's harness loads its judge from the owner source (source/scripts first on sys.path).

    A re-judge source must be the declared owner revision plus the fixed stock judge and nothing else: HEAD's
    parent is `declared`, HEAD changes only JUDGE_FIX files, each of the 13 files in the working tree is
    byte-identical to STOCK_JUDGE's, and (addendum 8 (3)) ``git status --porcelain --untracked-files=all`` is empty
    except for untracked ``scripts/pm_goal_dg5_methodb_pilot_phase_*.py`` tables, which this harness writes into the
    source itself. Returns the evidence; raises ValueError otherwise (the old judge in an unchanged declared source
    would ignore the export and reproduce the old verdicts).
    """
    import re
    import hashlib
    import subprocess
    git = lambda *a: subprocess.check_output(['git', '-C', str(source), *a], text=True).strip()
    head = git('rev-parse', 'HEAD')
    parent = git('rev-parse', 'HEAD^')
    changed = sorted(git('diff', '--name-only', declared, head).splitlines())
    actual = {path: hashlib.sha256((Path(source) / path).read_bytes()).hexdigest() for path in JUDGE_FIX}
    wrong = sorted(path for path, pin in JUDGE_FIX.items() if actual[path] != pin)
    status = subprocess.check_output(['git', '-C', str(source), 'status', '--porcelain', '--untracked-files=all'],
                                     text=True).splitlines()
    phase = re.compile(r'\?\? scripts/pm_goal_dg5_methodb_pilot_phase_[0-9a-f]{16}\.py')
    dirty = [line for line in status if not phase.fullmatch(line)]
    if parent != declared or not set(changed) <= set(JUDGE_FIX) or wrong or dirty:
        raise ValueError('owner source %s is not %s plus the fixed stock judge %s: parent %s, changed outside '
                         'the judge %s, judge files differing %s, working tree not clean %s' % (
                             head, declared, STOCK_JUDGE[:10], parent, sorted(set(changed) - set(JUDGE_FIX)), wrong,
                             dirty[:10]))
    return dict(head=head, declared=declared, stock_judge=STOCK_JUDGE, judge_files=len(JUDGE_FIX), changed=changed,
                phase_tables=len(status) - len(dirty))
