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

import pm_goal_dg5_boundaries as bridge
import pm_goal_guard_sweep as sweep
import pm_goal_guard_tables as tables

HARNESS = 'pm_goal_dg5_methodb_'   # file-name prefix of every Method B harness module
OWNER_KEYS = ('schema', 'hook', 'sha256', 'reason', 'objects')


def origin(error, code, source=None):
    """bridge.refusal_origin with harness frames transparent and owner paths relative to `source`."""
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
