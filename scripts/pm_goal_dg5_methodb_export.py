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
                       (a) a frame whose file is a Method B harness module (``HARNESS``), other than
                           the innermost (raising) frame, is marked as a checker frame (index 4): the harnesses patch the
                           owner validator with a pass-through observer, and that frame sits
                           between the owner's validation site and the owner validator's raise;
                           it is never the origin site (index 3 stays as the bridge computed it);
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


def origin(error, code, source=None):
    """bridge.refusal_origin with harness frames transparent and owner paths relative to `source`."""
    import pm_goal_dg5_boundaries as bridge
    out = bridge.refusal_origin(error, code)
    base = Path(source).resolve() if source is not None else None
    frames, harness, last = [], 0, len(out['frames']) - 1
    for index, (where, line, name, bridge_or_guard, checker) in enumerate(out['frames']):
        if base is not None:
            try:
                where = str(Path(where).resolve().relative_to(base))
            except ValueError:
                pass
        # Transparent only between the site and an owner raise: the innermost frame (the raise) never is, so a
        # refusal a harness frame raised itself stays opaque and owns nothing (fails closed).
        if Path(where).name.startswith(HARNESS) and index != last:
            checker, harness = True, harness + 1
        frames.append([where, line, name, bridge_or_guard, checker])
    site = out['site']
    if base is not None and site is not None:
        try:
            site = [str(Path(site[0]).resolve().relative_to(base)), site[1]]
        except ValueError:
            pass
    # The origin site stays the innermost frame outside the bridge and the guard helpers; a
    # harness observer frame is never innermost (the owner validator it calls raises).
    raised_in_harness = bool(frames) and Path(frames[-1][0]).name.startswith(HARNESS)
    return dict(out, site=site, frames=frames, harness_frames=harness, raised_in_harness=raised_in_harness)


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
    parent is `declared`, HEAD changes only JUDGE_FIX files, and each of the 13 files in the working tree is
    byte-identical to STOCK_JUDGE's. Returns the evidence; raises ValueError otherwise (the old judge in an
    unchanged declared source would ignore the export and reproduce the old verdicts).
    """
    import hashlib
    import subprocess
    git = lambda *a: subprocess.check_output(['git', '-C', str(source), *a], text=True).strip()
    head = git('rev-parse', 'HEAD')
    parent = git('rev-parse', 'HEAD^')
    changed = sorted(git('diff', '--name-only', declared, head).splitlines())
    actual = {path: hashlib.sha256((Path(source) / path).read_bytes()).hexdigest() for path in JUDGE_FIX}
    wrong = sorted(path for path, pin in JUDGE_FIX.items() if actual[path] != pin)
    if parent != declared or not set(changed) <= set(JUDGE_FIX) or wrong:
        raise ValueError('owner source %s is not %s plus the fixed stock judge %s: parent %s, changed outside '
                         'the judge %s, judge files differing %s' % (head, declared, STOCK_JUDGE[:10], parent,
                                                                     sorted(set(changed) - set(JUDGE_FIX)), wrong))
    return dict(head=head, declared=declared, stock_judge=STOCK_JUDGE, judge_files=len(JUDGE_FIX), changed=changed)
