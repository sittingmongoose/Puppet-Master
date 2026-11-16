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


# ------------------------------------------------------------- readers / projector helpers

def make(suite):
    world, handles, _ = O.started(suite)
    projector, readers, gid = O.projected(world)
    return world, projector, readers, gid


def _delete_cell(world, table, key):
    cell = world.storage.cell(table, key)
    world.storage.transact([dict(table=table, key=key, expected=cell['version'], delete=True)])


def _bump_start_control_epoch(world):
    cell = world.owners['native'].start_control()
    value = copy.deepcopy(cell['value'])
    value['record']['epoch'] += 1
    world.storage.transact([dict(table='workflow_start_control', key=value['physical_key'],
                                  expected=cell['version'], value=value)])


def _change_ico_time(world):
    key = world.ctx.run_key('workflow_start_control_origin.v1')
    cell = world.storage.cell('workflow_start_control_origin', key)
    value = copy.deepcopy(cell['value'])
    old = value['record']['issued_at_utc']
    value['record']['issued_at_utc'] = ('1999' + old[4:]) if old[:4] != '1999' else ('1998' + old[4:])
    world.storage.transact([dict(table='workflow_start_control_origin', key=key,
                                  expected=cell['version'], value=value)])


def _flip_dataset(value):
    name = value['dataset_name']
    value['dataset_name'] = name[:-1] + ('0' if name[-1] != '0' else '1')
    return value


def _rewrite_current_row_dataset(world, projector):
    cell, logical, gen, row = projector.current_row()
    value = _flip_dataset(copy.deepcopy(row['value']))
    gens = copy.deepcopy(logical['generations'])
    gens[logical['current_generation_id']]['processed']['row_sha256'] = W.cdigest(value)
    ck = projector.rep.encode_checkpoint(projector._logical(gens, logical['current_generation_id']))
    world.storage.transact([dict(table=gen['dataset_name'], key=projector.rep.projection_key(),
                                  expected=row['version'], value=value),
                             dict(table='checkpoints', key=projector.rep.checkpoint_key(),
                                  expected=cell['version'], value=ck)])


# The relations bundle at readers:258 has no authored negative. Bumping only the
# start-control epoch fails relations (control/epoch; the origin's control
# selector is the same require site) and nothing earlier in retained_native.
@negative('original_relation_control_epoch', 'read_historical/original/relation/control/epoch',
          READERS + '258')
def _(suite):
    world, projector, readers, gid = make(suite)
    _bump_start_control_epoch(world)
    readers.read_historical(O.sreq(world))


# Native body join: revision/status/activation untouched, one identity field of
# the stored current body substituted, so only the digest join at :837 refuses.
@negative('current_native_body_join', 'read_current/native_body_join', READERS + '837')
def _(suite):
    world, projector, readers, gid = make(suite)
    native = world.owners['native']
    body = copy.deepcopy(native.current()['body'])
    body['record']['identity']['workgraph_ref'] = 'TEST_ONLY:workgraph-ref:other'
    cell = W.read_value(world.storage, 'workflow_goal_run_body', body['physical_key'])
    world.storage.transact([dict(table='workflow_goal_run_body', key=body['physical_key'],
                                  expected=cell['version'], value=W.cell_value(world.storage, body))])
    readers.read_current(O.sreq(world))


@negative('checkpoint_wrapper_storage_substituted', 'checkpoint/storage', READERS + '522')
def _(suite):
    world, projector, readers, gid = make(suite)
    cell, logical = projector.checkpoint()
    wrapper = copy.deepcopy(cell['value'])
    wrapper['storage_instance_id'] = '00000000-0000-4000-8000-000000000000'
    world.storage.transact([dict(table='checkpoints', key=projector.rep.checkpoint_key(),
                                  expected=cell['version'], value=wrapper)])
    readers.read_historical(O.sreq(world))


# Cutover row join: the staged row's dataset name only (last hex digit), with
# the checkpoint prefix left stale, mirroring row_without_checkpoint_join but
# record-external so decode still passes with the site cut.
@negative('cutover_row_join_dataset_only', 'cutover/row_missing', READERS + '709')
def _(suite):
    world, handles, _ = O.started(suite)
    projector = R.StartedProjector(world.registry, world=world)
    projector.install()
    gid = projector.stage()
    projector.replay(gid)
    cell, logical = projector.checkpoint()
    gen = logical['generations'][gid]
    row = world.storage.cell(gen['dataset_name'], projector.rep.projection_key())
    world.storage.transact([dict(table=gen['dataset_name'], key=projector.rep.projection_key(),
                                  expected=row['version'], value=_flip_dataset(copy.deepcopy(row['value'])))])
    projector.cutover(gid)


# Presence witnesses (CUT_EXCEPTION by design): each guarded member is
# dereferenced on the next line, which the matrix presence justification binds.
@negative('historical_without_checkpoint', 'read_historical/no_checkpoint', READERS + '725')
def _(suite):
    world, handles, _ = O.started(suite)
    projector = R.StartedProjector(world.registry, world=world)
    projector.install()
    R.StartedReaders(world.registry, world=world, projector=projector).read_historical(O.sreq(world))


@negative('projector_withdraw_before_install', 'projector/not_installed', READERS + '572')
def _(suite):
    world, handles = O.new_world(suite)
    R.StartedProjector(world.registry, world=world).withdraw()


@negative('retained_control_missing', 'read_historical/original/control_missing', READERS + '74')
def _(suite):
    world, projector, readers, gid = make(suite)
    _delete_cell(world, 'workflow_start_control', world.owners['native'].start_control_key())
    readers.read_historical(O.sreq(world))


@negative('retained_origin_missing', 'read_historical/original/origin_missing', READERS + '82')
def _(suite):
    world, projector, readers, gid = make(suite)
    _delete_cell(world, 'workflow_start_origin', R.op_keys(world, O.OP)['origin'])
    readers.read_historical(O.sreq(world))


@negative('retained_d01_missing', 'read_historical/original/d01_missing', READERS + '87')
def _(suite):
    world, projector, readers, gid = make(suite)
    fam = ST.d01_families(world.edition)
    _delete_cell(world, fam['workflow_update'], R.op_keys(world, O.OP)['update'])
    readers.read_historical(O.sreq(world))


@negative('retained_initial_origin_missing', 'read_historical/original/initial_origin_missing',
          READERS + '91')
def _(suite):
    world, projector, readers, gid = make(suite)
    _delete_cell(world, 'workflow_start_control_origin',
                 world.ctx.run_key('workflow_start_control_origin.v1'))
    readers.read_historical(O.sreq(world))


# Transaction id: a Storage transaction from encode_checkpoint (the
# stale_checkpoint_cas racing shape, on the installation cell only) moves the
# joint transaction past the id predicted at readers:681.
@negative('projector_transaction_id_raced', 'projector/transaction_id', READERS + '690')
def _(suite):
    world, handles, _ = O.started(suite)
    projector = R.StartedProjector(world.registry, world=world)
    projector.install()
    gid = projector.stage()
    original = projector.rep.encode_checkpoint

    def racing(logical, **kw):
        out = original(logical, **kw)
        if kw.get('store') is not False and not getattr(racing, 'done', False):
            racing.done = True
            projector.install()
        return out
    projector.rep.encode_checkpoint = racing
    projector.replay(gid)


# Final fences: one coherent change between the helper and its final
# re-acquisition, through the suite's own hook points.
@negative('retained_final_fence_control_epoch', 'read_retained_native/final_fence', READERS + '870')
def _(suite):
    world, projector, readers, gid = make(suite)
    readers.read_retained_native(O.sreq(world), hooks=dict(after_retained=_bump_start_control_epoch))


@negative('inspect_final_fence_origin_time', 'inspect_original/final_fence', READERS + '884')
def _(suite):
    world, projector, readers, gid = make(suite)
    readers.inspect_original(O.sreq(world), hooks=dict(after_generic=_change_ico_time))


@negative('historical_final_fence_origin_time', 'read_historical/final_fence', READERS + '902')
def _(suite):
    world, projector, readers, gid = make(suite)
    readers.read_historical(O.sreq(world), hooks=dict(after_projection=_change_ico_time))


@negative('current_final_original_origin_time', 'read_current/final_original', READERS + '928')
def _(suite):
    world, projector, readers, gid = make(suite)
    readers.read_current(O.sreq(world), hooks=dict(after_current_goal=_change_ico_time))


@negative('inspect_final_generic_extra_event', 'inspect_original/final_generic', READERS + '886')
def _(suite):
    world, projector, readers, gid = make(suite)
    readers.inspect_original(O.sreq(world),
                               hooks=dict(after_generic=lambda w: O.extra_event(w, 'dg5late')))


@negative('current_final_generic_extra_event', 'read_current/final_generic', READERS + '930')
def _(suite):
    world, projector, readers, gid = make(suite)
    readers.read_current(O.sreq(world),
                           hooks=dict(after_current_goal=lambda w: O.extra_event(w, 'dg5late')))


@negative('historical_final_projection_row_rewrite', 'read_historical/final_projection', READERS + '904')
def _(suite):
    world, projector, readers, gid = make(suite)
    readers.read_historical(O.sreq(world),
                              hooks=dict(after_projection=lambda w: _rewrite_current_row_dataset(w, projector)))


@negative('current_final_projection_row_rewrite', 'read_current/final_projection', READERS + '932')
def _(suite):
    world, projector, readers, gid = make(suite)
    readers.read_current(O.sreq(world),
                           hooks=dict(after_current_goal=lambda w: _rewrite_current_row_dataset(w, projector)))


# Incomplete generic coverage: garbage after the last valid group makes the
# snapshot's scan tail a defect over the same rows, coverage and token.
@negative('current_incomplete_coverage_segment_tail', 'read_current/incomplete_coverage', READERS + '917')
def _(suite):
    world, projector, readers, gid = make(suite)
    event_id = R.original_started(world)['original_append']['event']['event_id']
    generation = world.storage.events[event_id]['segment_generation']
    path = world.storage._segment_path(generation)
    with open(path, 'ab') as handle:
        handle.write(b'\xff' * 32)
    readers.read_current(O.sreq(world))


# ------------------------------------------------------------- start / world single defects

class _Handles(dict):
    pass


class _Pair(tuple):
    pass


# type(handles) is dict / type(entry) is tuple are exact-type predicates: a
# dict/tuple subclass carrying the same items refuses there alone and works
# everywhere else in acquire_all.
@negative('handles_dict_subclass', 'start/handles_type', START + '794')
def _(suite):
    start_case(suite, handle_edit=lambda w, h: _Handles(h))


@negative('handle_entry_tuple_subclass', 'start/handle_shape/d01_current', START + '798')
def _(suite):
    start_case(suite, handle_edit=lambda w, h: dict(h, d01_current=_Pair(h['d01_current'])))


@negative('native_body_cell_deleted', 'native/body_unavailable', START + '227')
def _(suite):
    def pre(w, h):
        _delete_cell(w, 'workflow_goal_run_body', w.owners['native'].current()['body']['physical_key'])
    start_case(suite, pre=pre)


@negative('native_start_control_cell_deleted', 'native/start_control_unavailable', START + '232')
def _(suite):
    def pre(w, h):
        _delete_cell(w, 'workflow_start_control', w.owners['native'].start_control_key())
    start_case(suite, pre=pre)


@negative('staging_dispatch_released', 'start/staging_not_released', START + '880')
def _(suite):
    start_case(suite, edits=dict(staging=at(['record', 'dispatch_released'], True)))


# The authentic submission appended raw first (the S3 raw-start shape), so the
# held commit_start appends the same event identity and Storage does not append.
@negative('append_outcome_duplicate_raw_first', 'start/dedupe_unavailable', START + '1022')
def _(suite):
    world, handles = O.new_world(suite)
    sub = world.start.producer_submission(world.start.acquire_all(handles)[0],
                                          world.owners['native'].current(), world.ctx.now())
    world.appender.append_original('TEST_ONLY:op:dg5-raw', dict(tag='raw'), [sub])
    O.refuse_without_effect(world, lambda: world.start.commit_start(O.request(world), handles))


@negative('dedupe_control_operation_substituted', 'start/dedupe_unavailable', START + '1328')
def _(suite):
    world, handles, _ = O.started(suite)
    cell = world.owners['native'].start_control()
    value = copy.deepcopy(cell['value'])
    value['record']['original_operation_id'] = 'TEST_ONLY:start-op:substituted'
    world.storage.transact([dict(table='workflow_start_control', key=value['physical_key'],
                                  expected=cell['version'], value=value)])
    world.start.commit_start(O.request(world), handles)


@negative('lower_after_control_only', 'lower/after_control', START + '1388')
def _(suite):
    def tamper(w, u):
        u['after_control'] = copy.deepcopy(u['after_control'])
        u['after_control']['record']['revision'] += 1
        u['commit_argument']['native_candidates']['control'] = u['after_control']
        return u
    lower_case(suite, tamper)


@negative('lower_candidate_control_only', 'lower/candidate_control', START + '1391')
def _(suite):
    def tamper(w, u):
        u['candidate']['record']['candidate_control']['physical_value_sha256'] = Z
        return O.rehash(w, u)
    lower_case(suite, tamper)


# selector_for reads the graph cell it names: rewriting that cell at rest (the
# born_worknode_substituted_at_rest shape) fails cell_value alone, because the
# presented graph handle value is unchanged and selector_for derives the
# selector hash from the presented value once the site is cut.
@negative('selector_cell_value_graph_substituted', 'selector/cell_value', WORLD + '448')
def _(suite):
    def pre(w, h):
        graph = w.owners['materialization:graph'].resolve(h['installed_graph'][1])[1]
        cell = W.read_value(w.storage, 'workflow_installed_graph', graph['physical_key'])
        value = copy.deepcopy(cell['value'])
        value['record']['source_dependency_edges'] = []
        w.storage.transact([dict(table='workflow_installed_graph', key=graph['physical_key'],
                                  expected=cell['version'], value=W.cell_value(w.storage, value))])
    start_case(suite, pre=pre)


@negative('selector_cell_present_graph_deleted', 'selector/cell_present', WORLD + '447')
def _(suite):
    def pre(w, h):
        graph = w.owners['materialization:graph'].resolve(h['installed_graph'][1])[1]
        _delete_cell(w, 'workflow_installed_graph', graph['physical_key'])
    start_case(suite, pre=pre)
