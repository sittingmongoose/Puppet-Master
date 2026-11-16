"""DG5 supplement negatives for goal_run.started (lead decision 1116061157-ad82, condition 4).

One authored single-defect negative per owner or shared site that no DG-S case
targets (or targets only with a coherent multi-defect case). Each case's
dg5_target is declared in TARGETS here, before it runs, with its reason in the
case comment. Cases use only the original suite's own world and fixture
helpers (pm_goal_dg_s_oracles) and coherent rewrites; formed events are never
edited. Registered as group 'S-DG5' by pm_goal_dg5_s.main; PM_DG5_S_MATCH
selects a substring subset for gated smokes (full runs register all).
"""
import copy
import os

import pm_goal_dg_s_oracles as O
import pm_goal_dg_s_readers as R
import pm_goal_dg_s_start as ST
import pm_goal_dg_s_world as W

TARGETS = {}
CASES = []
Z = '0' * 64
START = 'dg5/site/pm_goal_dg_s_start.py:'
READERS = 'dg5/site/pm_goal_dg_s_readers.py:'
WORLD = 'dg5/site/pm_goal_dg_s_world.py:'


def negative(name, expected, target):
    def deco(fn):
        CASES.append((name, expected, fn))
        TARGETS['S-DG5/' + name] = target
        return fn
    return deco


def cases(suite):
    match = os.environ.get('PM_DG5_S_MATCH')
    for name, expected, fn in CASES:
        if match and match not in name:
            continue
        suite.negative('S-DG5', name, (lambda fn=fn: fn(suite)), expected)


# ------------------------------------------------------------- S1-shaped helpers

def start_case(suite, *, edits=None, start_edits=None, handle_edit=None, request_edit=None, pre=None):
    """The S1 neg() shape: a valid world, one defect, commit_start refuses with no effect."""
    world, handles = O.new_world(suite, 'v3', edits)
    if handle_edit:
        handles = handle_edit(world, handles)
    req = O.request(world)
    if request_edit:
        req = request_edit(req)
    if pre:
        pre(world, handles)
    O.refuse_without_effect(world, lambda: world.start.commit_start(req, handles, edits=start_edits))


def lower_case(suite, tamper):
    """The coverage lower() shape: refusal after the append, prefix stays receipted."""
    world, handles = O.new_world(suite)
    try:
        world.start.commit_start(O.request(world), handles, edits=dict(union=lambda u: tamper(world, u)))
    except W.REFUSALS as error:
        r = world.start.recover_start(O.OP)
        W.require('lower/prefix', r['classification'] == 'receipted_unpublished' and
                  world.owners['native'].current()['body']['record']['revision'] == ST.BEFORE_REVISION)
        raise error


def at(path, value):
    def run(v):
        target = v
        for k in path[:-1]:
            target = target[k]
        target[path[-1]] = value(target[path[-1]]) if callable(value) else value
        return v
    return run


# ------------------------------------------------------------- producer single defects
# S1/producer_expected_revision stales expected and after revisions together
# (expected=before+1, after=before+2), so with :1056 cut :1058 refuses. Here only
# the expected revision is wrong; goal_run_revision stays before+1, rekeyed coherently.
@negative('producer_expected_revision_only', 'producer/expected_revision', START + '1056')
def _(suite):
    start_case(suite, start_edits=O.sub_edit(
        lambda s: s['payload'].update(expected_goal_run_revision=ST.BEFORE_REVISION - 1)))


# S1/producer_key_substituted substitutes both idempotency key copies, so with
# :1077 cut :1078 refuses. Here only the submission's outer copy is substituted;
# the payload copy still equals the recipe key, so :1078 and :1079 hold.
@negative('producer_idempotency_key_outer_only', 'producer/idempotency_key', START + '1077')
def _(suite):
    start_case(suite, start_edits=O.sub_edit(
        lambda s: s.update(idempotency_key='pm.goal-runtime-event.v3:' + Z), keyed=False))


# S1/producer_project_scope changes sub and payload project together, so the cut
# chain runs through :1053 and the key recipe sites. Here only the outer
# submission project is foreign; the payload, keys and event id stay the recipe's.
@negative('producer_scope_project_outer_only', 'producer/scope', START + '1051')
def _(suite):
    start_case(suite, start_edits=O.sub_edit(
        lambda s: s.update(project_id='TEST_ONLY-project-other'), keyed=False))


# ------------------------------------------------------------- goal association copies
# S1/goal_association_other_run changes the binding record and its association
# together, so with :895 cut :897 refuses. Binding-only: :897 still holds.
@negative('goal_association_binding_only', 'start/goal_association', START + '895')
def _(suite):
    start_case(suite, edits=dict(goal=at(['binding_revision', 'record', 'active_run_ref'],
                                         'TEST_ONLY:goal_run:other')))


# No authored case targets :897 alone. Association-only: the binding record at
# :895 still names this run, the single association does not.
@negative('goal_association_member_only', 'start/goal_association_member', START + '897')
def _(suite):
    start_case(suite, edits=dict(goal=at(['binding_revision', 'record', 'associations', 0, 'active_run_ref'],
                                         'TEST_ONLY:goal_run:other')))


# ------------------------------------------------------------- lower publisher partial rehash
# The coverage tampers replace one selector hash and stop, so every downstream
# selector of the tampered member also fails. These tampers re-derive every
# downstream selector hash (oracles.rehash's fields) except the target's own.
def _sel_hash(selector, value):
    out = dict(selector)
    out['physical_value_sha256'] = W.cdigest(value)
    return out


@negative('lower_control_commit_only', 'lower/control_commit', START + '1394')
def _(suite):
    def tamper(w, u):
        u['control']['record']['committed_start'] = dict(u['control']['record']['committed_start'],
                                                         physical_value_sha256=Z)
        u['origin']['record']['start_control'] = _sel_hash(u['origin']['record']['start_control'], u['control'])
        u['d01_origin']['record']['causation'] = _sel_hash(u['d01_origin']['record']['causation'], u['origin'])
        return u
    lower_case(suite, tamper)


@negative('lower_origin_commit_only', 'lower/origin_commit', START + '1396')
def _(suite):
    def tamper(w, u):
        u['origin']['record']['commit'] = dict(u['origin']['record']['commit'], physical_value_sha256=Z)
        u['d01_origin']['record']['causation'] = _sel_hash(u['d01_origin']['record']['causation'], u['origin'])
        return u
    lower_case(suite, tamper)


@negative('lower_origin_control_only', 'lower/origin_control', START + '1398')
def _(suite):
    def tamper(w, u):
        u['origin']['record']['start_control'] = dict(u['origin']['record']['start_control'],
                                                      physical_value_sha256=Z)
        u['d01_origin']['record']['causation'] = _sel_hash(u['d01_origin']['record']['causation'], u['origin'])
        return u
    lower_case(suite, tamper)


# ------------------------------------------------------------- selector duplicate cells
# The coverage selector cases zero the selector hash at issuance, so with the
# equality site cut resolve_selector's hash site (world :462) refuses later.
# Here the selector instead names a duplicate Storage cell holding the exact
# same value at a new key: equality with selector_for(original key) fails at
# the target alone, and independent resolution still passes.
def _dup_pre(owner_name, handle_name, table):
    def pre(w, h):
        value = w.owners[owner_name].resolve(h[handle_name][1])[1]
        W.put_values(w.ctx, [(table, value['physical_key'] + ':dup', value)])
    return pre


def _dup_selector(path):
    return at(path + ['physical_key'], lambda k: k + ':dup')


@negative('required_set_graph_duplicate_cell', 'start/required_set_graph', START + '862')
def _(suite):
    start_case(suite,
               edits=dict(required_set=_dup_selector(['record', 'installed_workgraph', 'source'])),
               pre=_dup_pre('materialization:graph', 'installed_graph', 'workflow_installed_graph'))


@negative('staging_required_set_duplicate_cell', 'start/staging_required_set', START + '878')
def _(suite):
    start_case(suite,
               edits=dict(staging=_dup_selector(['record', 'required_set', 'source'])),
               pre=_dup_pre('materialization:required_set', 'required_set', 'workflow_required_set'))


@negative('activation_receipt_required_set_duplicate_cell', 'start/activation_receipt_required_set',
          START + '881')
def _(suite):
    start_case(suite,
               edits=dict(activation_receipt=_dup_selector(['record', 'required_set', 'source'])),
               pre=_dup_pre('materialization:required_set', 'required_set', 'workflow_required_set'))


@negative('activation_receipt_graph_duplicate_cell', 'start/activation_receipt_graph', START + '883')
def _(suite):
    start_case(suite,
               edits=dict(activation_receipt=_dup_selector(['record', 'installed_workgraph', 'source'])),
               pre=_dup_pre('materialization:graph', 'installed_graph', 'workflow_installed_graph'))


@negative('activation_receipt_staging_duplicate_cell', 'start/activation_receipt_staging', START + '885')
def _(suite):
    start_case(suite,
               edits=dict(activation_receipt=_dup_selector(['record', 'entrypoints_staged', 'source'])),
               pre=_dup_pre('materialization:staging', 'staging', 'workflow_entrypoint_staging'))
