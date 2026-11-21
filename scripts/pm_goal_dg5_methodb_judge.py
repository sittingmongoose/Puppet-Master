#!/usr/bin/env python3
"""Forked Method B judge for goal_run.cancelled schema rows (DG5).

Runs W3's Method B harness (pm_goal_dg5_methodb_cancelled.py) with the stock
collector (pm_goal_guard_sweep.Collector.invoke/_replay/_judge), but no
complete call ever runs in the judging process:

1. Fork per complete trial. The world is built once. Every complete call
   (control, defect, each cut, restoration, every joint-cut member) runs in its
   own child forked from the same untouched parent. Before the call the child
   clears `success` and zeroes `hits`/`misses` on every
   pm_goal_dg_int_schema_cache.Roots instance (enumerated with gc in the parent
   at fork time, and checked against a walk of the world). The child ships back
   the trial record and its collector observations; the parent replays those
   into the stock collector, rebuilds `observed` from realm/ref/document/binding
   and asserts that its store, bound arguments, schema caches and world
   attributes are unchanged.
2. `edit_path` (declaration): the extra member is placed in the object at this
   JSON path of the checked document (list of keys/indices or a JSON Pointer).
   Default: the document root, which is W3's placement.
3. `edit_placement: pre|post` (declaration, default post = W3). `pre` adds the
   member before Roots._checked computes its cache key, through the owner knob
   named by `edit_knob` when given, otherwise by editing the value on entry to
   the cached wrapper. Every trial records the cache key digest seen at the
   selected check.
4. `joint_cut: [rows...]` and/or `site_cut: "path:line"` (declaration). The
   selected row and the listed rows (or every schema row decided at that site)
   form one cut set. An uncredited probe first checks the lead's rule 2: every
   member must apply the same resolved schema node (sha256 of canonical node
   JSON, resolved base URI) to the same value (sha256 of the canonical value) at
   the defect. Otherwise the result is IDENTITY_MISMATCH and nothing is judged.
   The verdict is KILLED only if the defect refuses at the selected row, the
   joint cut accepts, every member refuses alone with the others cut (stock
   duplicate-set site cuts), every member cut alone still refuses, and the
   restoration refuses at the selected row; every one a separate fork.
5. After-state (rulings 1121112536-0b66 (3), 1121115610-7650). Every trial
   child, after its call and before it exits, takes the trial's after-state:
   the store digest (the copy's manifest on write routes, `store_state` on the
   others) and the Run Cancelled hook's digest of the owners' in-memory state
   (pm_goal_dg5_owner_state). A COVERED_LATER route is accepted only when the
   cut trial's after-state equals the intact defect trial's and the restoration
   repeats it (`covered_later_check`); otherwise the row is CANNOT_DECIDE and
   not covered.
6. KILLED_CODE (addendum 1, pm-ea-lead 1121124828-43f4 (1)), judged before 5:
   a later refusal is KILLED_CODE, a kill, when the declared target is the
   row's own guard with its own code (the route's declared refusal code, and
   `row(code)` is the row), the intact defect trial is exact, the cut refuses
   with a DIFFERENT owner refusal code, and the uncached restoration repeats
   the intact result. Own guard (addendum 11, pm-ea-lead 1121131008-95db) is
   not taken from the code-matched errors: the intact trial's refusal origin
   (`refusal_origin`, recorded in the child where the harness turns the error
   into its code) must be the route's declared site. A different-code refusal missing a condition is
   CANNOT_DECIDE, never COVERED_LATER. The verdict replaces the source stock
   judge's COVERED_LATER in the ledger record (`kill`, `killed_code_check`).

Same command line and output folder as W3's run (result.json, closure.json,
inventory.json, proof/). result.json adds `judge`.
"""

import argparse
import copy
import gc
import hashlib
import json
import os
import pickle
import shutil
import sys
import time
import traceback
import types
from contextlib import ExitStack
from itertools import count
from pathlib import Path
from unittest.mock import patch
from uuid import UUID

HERE = Path(__file__).resolve().parent
if str(HERE) not in sys.path:
    sys.path.insert(0, str(HERE))

import pm_goal_dg5_methodb_cancelled as w3  # noqa: E402
import pm_goal_dg5_owner_state as owner_state  # noqa: E402 - this judge's copy, before --source joins sys.path
from pm_goal_dg5_methodb_stage3 import require, sha, write  # noqa: E402

FAMILY = w3.FAMILY
MARKER = 'methodb_extra'
DEFAULTS = dict(edit_path=[], edit_placement='post', edit_knob=None, joint_cut=None, site_cut=None)
CLOSED_WORDS = ('additionalProperties', 'unevaluatedProperties')
ORIGINAL_FIXTURE = w3.fixture
STORE_COPIES = count()
JUDGE = dict(module='scripts/pm_goal_dg5_methodb_judge.py', module_sha256=sha(Path(__file__).resolve()),
             harness='scripts/pm_goal_dg5_methodb_cancelled.py', harness_sha256=sha(Path(w3.__file__).resolve()),
             owner_state_module='scripts/pm_goal_dg5_owner_state.py',
             owner_state_sha256=sha(Path(owner_state.__file__).resolve()),
             mode='fork-per-trial', trials=[], covered_later=[], later_refusals=[])


# Frames between the owner's check site and the raise that are this judge, the harness, the
# bridge, or a schema bank's validate path (the bank raises on the owner's behalf).
BANK_FILES = ('pm_goal_dg_r_world.py', 'pm_goal_dg_s_world.py', 'pm_goal_own_c_roots.py',
              'pm_goal_dg_int_schema_cache.py', 'pm_goal_test_owner_adapters.py', 'pm_goal_test_storage.py')
BANK_FUNCTIONS = ('validate', '_checked', 'check', 'errors', 'require', 'guard', 'refuse', 'halt',
                  'shared_require', 'shared_refuse')


def refusal_origin(error, code, source):
    """The refusal's origin (addendum 11 (1)): the deepest chained exception carrying `code`
    unchanged, and its innermost frame outside this judge, the harness, the bridge and a bank's
    validate path, as [path relative to the owner source, line]."""
    import pm_goal_dg5_boundaries as bridge

    chain, seen, current = [], set(), error
    while current is not None and id(current) not in seen:
        seen.add(id(current))
        chain.append(current)
        current = current.__cause__ or current.__context__
    origin, depth = error, 0
    for number, earlier in enumerate(chain[1:], 1):
        try:
            same = isinstance(earlier, Exception) and bridge.refusal_code(earlier) == code
        except Exception:  # noqa: BLE001
            same = False
        if not same:
            break
        origin, depth = earlier, number
    frames = []
    for frame in traceback.extract_tb(origin.__traceback__):
        try:
            where = str(Path(frame.filename).resolve().relative_to(Path(source).resolve()))
        except ValueError:
            where = frame.filename
        frames.append([where, frame.lineno, frame.name, _helper_frame(frame)])
    site = next(([f[0], f[1]] for f in reversed(frames) if not f[3]), None)
    return dict(site=site, chain_depth=depth, origin_type=type(origin).__name__, frames=frames[-8:])


def _helper_frame(frame):
    """A frame between the owner's check and the raise: this judge, the harness, the bridge, or a bank's validate path."""
    name = Path(frame.filename).name
    mine = {Path(__file__).resolve().name, Path(w3.__file__).resolve().name, 'pm_goal_dg5_boundaries.py'}
    return name in mine or (name in BANK_FILES and frame.name in BANK_FUNCTIONS) or frame.name == '<lambda>'


def origin_at(origin, site):
    """Addendum 11 (1) for a Method B route: the declared site is in the origin traceback, and only
    helper frames (judge, harness, bridge, bank validate path) lie between it and the raise."""
    for where, line, _, helper in reversed((origin or {}).get('frames') or []):
        if [where, line] == list(site):
            return True
        if not helper:
            return False
    return False


class IdentityMismatch(ValueError):
    """Rule 2 refused a joint cut: the members do not check one node on one value."""


# ---------------------------------------------------------------- declaration options

def pointer_tokens(text):
    require(text == '' or text.startswith('/'), f'edit_path {text!r} is not a JSON Pointer')
    return [part.replace('~1', '/').replace('~0', '~') for part in text.split('/')[1:]]


def options_of(declare):
    options = {key: copy.deepcopy(declare.get(key, value)) for key, value in DEFAULTS.items()}
    path = options['edit_path']
    if isinstance(path, str):
        path = pointer_tokens(path)
    require(isinstance(path, list) and all(type(part) in (str, int) for part in path), 'edit_path must be a list')
    options['edit_path'] = path
    require(options['edit_placement'] in ('pre', 'post'), 'edit_placement must be pre or post')
    require(options['edit_knob'] is None or (options['edit_placement'] == 'pre' and isinstance(options['edit_knob'], str)),
            'edit_knob needs edit_placement pre')
    joint = options['joint_cut']
    require(joint is None or (isinstance(joint, list) and joint and all(
        isinstance(row, str) and row.startswith('dg5/') and row.endswith('/schema') for row in joint)),
        'joint_cut must list dg5 schema rows')
    site = options['site_cut']
    if site is not None:
        require(isinstance(site, str) and ':' in site, 'site_cut must be "path:line"')
        where, line = site.rsplit(':', 1)
        options['site_cut'] = [where, int(line)]
    return options


def nondefault(options):
    return {key: value for key, value in options.items() if value != DEFAULTS[key]}


# ---------------------------------------------------------------- documents

def step(container, part):
    if isinstance(container, list):
        return container[int(part)]
    require(isinstance(container, dict) and part in container, f'edit path member {part!r} is missing')
    return container[part]


def resolve_path(document, path):
    node = document
    for part in path:
        node = step(node, part)
    return node


def marker_paths(value, marker=MARKER, here=()):
    found = []
    if isinstance(value, dict):
        if marker in value:
            found.append(list(here))
        for key, item in value.items():
            found.extend(marker_paths(item, marker, here + (key,)))
    elif isinstance(value, list):
        for index, item in enumerate(value):
            found.extend(marker_paths(item, marker, here + (index,)))
    return found


def value_digest(value):
    """The schema cache's own key digest (canonical MessagePack, sha256)."""
    import pm_goal_test_storage as S
    try:
        return hashlib.sha256(S.canonical(value)).hexdigest()
    except Exception:
        return None


def node_digest(node):
    return hashlib.sha256(json.dumps(node, sort_keys=True, separators=(',', ':'), ensure_ascii=False).encode()).hexdigest()


def additions(before, after, here=()):
    """Every member path present in `after` and not in `before`, and every changed leaf."""
    if isinstance(before, dict) and isinstance(after, dict):
        out = [list(here) + [key] for key in after if key not in before]
        out += [list(here) + [key] for key in before if key not in after]
        for key in before.keys() & after.keys():
            out += additions(before[key], after[key], here + (key,))
        return out
    if isinstance(before, list) and isinstance(after, list) and len(before) == len(after):
        out = []
        for index, (a, b) in enumerate(zip(before, after)):
            out += additions(a, b, here + (index,))
        return out
    return [] if before == after and type(before) is type(after) else [list(here)]


# ---------------------------------------------------------------- schema caches

def cache_module():
    return sys.modules.get('pm_goal_dg_int_schema_cache')


def cache_instances():
    module = cache_module()
    if module is None:
        return []
    found = [item for item in gc.get_objects() if isinstance(item, module.Roots)]
    return sorted(found, key=id)


def cache_stats(instances):
    return [dict(id=id(item), bank=type(item.original).__module__ + '.' + type(item.original).__qualname__,
                 hits=item.hits, misses=item.misses, entries=len(item.success)) for item in instances]


def entries_digest(success):
    return hashlib.sha256('\n'.join(sorted(repr(item) for item in success.items())).encode()).hexdigest()


def reachable_caches(world, module, limit=3_000_000):
    """Independent enumeration: every cache instance reachable from the world's attributes."""
    skip = (type, types.ModuleType, types.FunctionType, types.BuiltinFunctionType, types.MethodType, str, bytes,
            int, float, bool, type(None))
    seen, found, stack = set(), [], [world]
    while stack and len(seen) < limit:
        item = stack.pop()
        if isinstance(item, skip) or id(item) in seen:
            continue
        seen.add(id(item))
        if isinstance(item, module.Roots):
            found.append(item)
        if isinstance(item, dict):
            stack.extend(item.values())
        elif isinstance(item, (list, tuple, set, frozenset)):
            stack.extend(item)
        elif hasattr(item, '__dict__'):
            try:
                stack.extend(vars(item).values())
            except TypeError:
                pass
    return found, len(seen), bool(stack)


# ---------------------------------------------------------------- rule 2: one node, one value

def capturing_validator(plain, captured):
    """The bank's validator with its closed-object keywords observed (node, base URI, error)."""
    import attrs
    import jsonschema

    classes = {}

    def wrap(word, function):
        def run(validator, expected, instance, schema):
            for error in function(validator, expected, instance, schema):
                if isinstance(instance, dict) and MARKER in instance and MARKER in str(error.message):
                    captured.append((error, schema, str(validator._resolver._base_uri), word))
                yield error
        return run

    def guarded(original):
        if original in classes.values():
            return original
        if original not in classes:
            overrides = {word: wrap(word, method) for word, method in original.VALIDATORS.items() if word in CLOSED_WORDS}
            extended = jsonschema.validators.extend(original, overrides)

            def evolve(instance, **changes):
                prototype = original.evolve(instance, **changes)
                return instantiate(guarded(type(prototype)), prototype)

            extended.evolve = evolve
            classes[original] = extended
        return classes[original]

    def instantiate(cls, prototype):
        return cls(**{field.alias: getattr(prototype, field.name)
                      for field in attrs.fields(type(prototype)) if field.init})

    return instantiate(guarded(type(plain)), plain)


def member_identity(plain, document):
    """Which resolved node refuses the defect, at which base URI, applied to which value."""
    paths = marker_paths(document)
    if len(paths) != 1:
        return dict(error=f'{len(paths)} defect locations in the checked document', marker_paths=paths)
    path, = paths
    captured = []
    list(capturing_validator(plain, captured).iter_errors(document))
    marked = set()
    on_path = [entry for entry in captured if list(entry[0].absolute_path) == path]
    for error, *_ in on_path:
        while error is not None:
            marked.add(id(error))
            error = error.parent
    nodes, excluded = {}, []
    for error, node, base, word in on_path:
        independent, child = None, error
        while child.parent is not None:
            parent = child.parent
            if parent.validator in ('oneOf', 'anyOf'):
                branch = child.relative_schema_path[0] if child.relative_schema_path else None
                siblings = [c for c in parent.context
                            if (c.relative_schema_path[0] if c.relative_schema_path else None) == branch]
                if any(id(c) not in marked for c in siblings):
                    independent = [list(parent.absolute_schema_path), branch]
                    break
            child = parent
        if independent:
            excluded.append(dict(combinator=independent[0], branch=independent[1], node_sha256=node_digest(node)))
            continue
        nodes[(node_digest(node), base)] = dict(node_sha256=node_digest(node), base_uri=base, keyword=word,
                                                node_object_id=id(node))
    if not nodes:
        return dict(error='no closed-object rule refuses the defect here', path=path, excluded=excluded)
    return dict(path=path, nodes=[nodes[key] for key in sorted(nodes)], value_sha256=value_digest(resolve_path(document, path)),
                excluded_branches=excluded)


def identity_verdict(entries):
    """entries: [dict(row, site, identity)]; equal (node set, base, value) for every member and occurrence."""
    def signature(identity):
        return (tuple((n['node_sha256'], n['base_uri']) for n in identity['nodes']), identity['value_sha256'])

    problems = [f"{e['row']}: {e['identity']['error']}" for e in entries if 'error' in e['identity']]
    rows = sorted({e['row'] for e in entries})
    if problems:
        return dict(ok=False, reason='; '.join(problems), rows=rows)
    signatures = {signature(e['identity']) for e in entries}
    if len(signatures) != 1:
        nodes = {e['row']: [n['node_sha256'][:16] for n in e['identity']['nodes']] for e in entries}
        values = {e['row']: e['identity']['value_sha256'][:16] for e in entries}
        what = []
        if len({s[0] for s in signatures}) > 1:
            what.append(f'different schema node or base: {nodes}')
        if len({s[1] for s in signatures}) > 1:
            what.append(f'different value: {values}')
        return dict(ok=False, reason='; '.join(what), rows=rows)
    (nodes, value), = signatures
    same_object = len({n['node_object_id'] for e in entries for n in e['identity']['nodes']}) == len(nodes)
    return dict(ok=True, reason=None, rows=rows, nodes=[dict(node_sha256=n, base_uri=b) for n, b in nodes],
                value_sha256=value, same_node_object=same_object)


# ---------------------------------------------------------------- fork

def fork_run(child):
    """Run child() in a process forked from this one; return (pid, payload). The child never returns."""
    sys.stdout.flush()
    sys.stderr.flush()
    read_fd, write_fd = os.pipe()
    pid = os.fork()
    if pid == 0:
        status = 0
        try:
            os.close(read_fd)
            try:
                payload = dict(ok=True, value=child())
            except BaseException as error:  # noqa: BLE001 - shipped to the parent
                payload = dict(ok=False, type=type(error).__name__, error=str(error),
                               trace=traceback.format_exc()[-6000:])
            try:
                data = pickle.dumps(payload, protocol=5)
            except BaseException as error:  # noqa: BLE001
                data = pickle.dumps(dict(ok=False, type='PicklingError', error=repr(error)[:500]), protocol=5)
            with os.fdopen(write_fd, 'wb') as stream:
                stream.write(data)
            sys.stdout.flush()
            sys.stderr.flush()
        except BaseException:  # noqa: BLE001
            status = 3
        finally:
            os._exit(status)
    os.close(write_fd)
    with os.fdopen(read_fd, 'rb') as stream:
        data = stream.read()
    _, status = os.waitpid(pid, 0)
    code = os.waitstatus_to_exitcode(status)
    require(code == 0 and data, f'trial child {pid} exited with status {code}')
    return pid, pickle.loads(data)


def pin_ids(stack):
    """Deterministic uuid4 and token_hex for one trial child (same sequence in every child)."""
    import secrets
    import uuid

    ids = count(UUID('a36fc6e5-1e3b-4e27-8200-100000000001').int)
    tokens = count(1)

    def token_hex(nbytes=32):
        seed = next(tokens).to_bytes(8, 'big')
        data = b''.join(hashlib.sha256(b'mbjudge-token' + seed + bytes([i])).digest() for i in range(nbytes // 32 + 1))
        return data[:nbytes].hex()

    stack.enter_context(patch.object(uuid, 'uuid4', side_effect=lambda: UUID(int=next(ids))))
    stack.enter_context(patch.object(secrets, 'token_hex', side_effect=token_hex))


def child_error(payload):
    kind = type(payload.get('type') or 'ChildError', (ValueError,), {})
    return kind(f"{payload.get('error')} [in trial child]")


def find_object(ident, kind):
    found = [item for item in gc.get_objects() if id(item) == ident]
    require(len(found) == 1 and type(found[0]).__module__ + '.' + type(found[0]).__qualname__ == kind,
            f'the checked bank {kind} is not an object of the parent world')
    return found[0]


# ---------------------------------------------------------------- the forked example

class ForkedExample(w3.OwnerExample):
    def __init__(self, source, row, route, collector, disabled_check, *, options=None, index=0):
        super().__init__(source, row, route, collector, disabled_check)
        self.options = options if options is not None else options_of({})
        self.index = index
        self.label = f"{index}:{route['edition']}/{route['call']}"
        self.members = sorted({row, *(self.options['joint_cut'] or [])})
        self.joint = len(self.members) > 1 or self.options['site_cut'] is not None
        # The current cancelled view mints fresh IDs inside every call (generic projection storage, seeds); give
        # every child the same ones, as W3 does for its write routes.
        self.pin_ids = route.get('pin_ids', route['call'] == 'current_cancelled')
        require(not (self.pin_ids and self.writes), 'write routes pin their IDs in the copy (W3)')
        self.forks = []
        self.after_states = []  # one per credited trial, parallel to self.trials
        self.origins = []       # the refusal origin of each credited trial (None when it accepted)
        self.walk_owners = False
        self.digest0 = None
        self.cache_audit = None
        self.joint_report = None
        self.probe = None
        self.child = None
        special = self.preserved_head or self.filesafe_effects
        require(not (special and (self.options['edit_path'] or self.options['edit_placement'] != 'post')),
                'this route places its defect through the presentation; edit options do not apply')
        require(not (self.joint and (self.pointer or self.stop or self.writes or special)),
                'joint cuts are judged on passive owner reads of the cancellation banks')

    # -- W3 hooks ------------------------------------------------------------------
    def filler(self):
        return 'example' if not self.checkpoint or self.route['edition'] == 'integrated_native' else 'x' * 16384

    def place_edit(self, value, edit, filler):
        holder = resolve_path(value, self.options['edit_path'])
        require(isinstance(holder, dict), 'the edit path does not name an object')
        if self.child is not None and self.child['placed']:
            require(holder.get(edit) == filler, 'the defect placed before the cache key is not in the checked value')
            return
        if self.child is not None and self.options['edit_placement'] == 'pre':
            require(not self.child['cached'], 'the pre-key defect did not reach the cached check')
            self.child['pre_equals_post'] = True
        require(edit not in holder, 'test example already has the extra member')
        holder[edit] = filler

    def edit_returned(self, returned, edit):
        if self.route['call'] == 'current_cancelled':
            # The current view returns the combined read, not the checked document.
            if self.child is not None:
                self.child['returned_marker_paths'] = marker_paths(returned)
            return True
        try:
            holder = resolve_path(returned, self.options['edit_path'])
        except (ValueError, LookupError, TypeError):
            return False
        return isinstance(holder, dict) and holder.get(edit) == 'example'

    # -- parent state -------------------------------------------------------------
    def parent_digest(self, world, inputs):
        import pm_goal_dg5_boundaries as bridge

        caches = sorted((type(item.original).__qualname__, item.hits, item.misses, entries_digest(item.success))
                        for item in cache_instances())
        shallow = sorted((name, type(value).__module__, type(value).__qualname__, id(value))
                         for name, value in vars(world).items())
        state = dict(store=self.store_state(world), arguments=bridge.context_value(inputs, world), caches=caches,
                     world=shallow)
        return hashlib.sha256(pickle.dumps(state, protocol=5)).hexdigest()

    def ensure_parent(self, world, inputs):
        if self.digest0 is not None:
            return
        module = cache_module()
        instances = cache_instances()
        reached, visited, truncated = ([], 0, False) if module is None else reachable_caches(world, module)
        require(all(any(item is known for known in instances) for item in reached),
                'a schema cache reachable from the world is missing from the gc enumeration')
        if module is not None and isinstance(getattr(world, 'roots', None), module.Roots):
            require(any(world.roots is known for known in instances), 'the world schema cache was not enumerated')
        self.cache_audit = dict(route=self.label, gc_instances=cache_stats(instances), reachable_from_world=len(reached),
                                objects_walked=visited, walk_truncated=truncated)
        self.digest0 = self.parent_digest(world, inputs)

    # -- one complete call --------------------------------------------------------
    def fork_trial(self, world, action, inputs, edit, initial, kind, *, credited=True, identity=False,
                   site_cut_all=False):
        import pm_goal_dg5_boundaries as bridge
        import pm_goal_guard_tables as tables

        self.ensure_parent(world, inputs)
        instances = cache_instances()
        inherited = cache_stats(instances)
        cut = sorted(tables.CUT)
        store_copy = None
        if self.writes:
            store_copy = world.tmp / f'mbjudge-store-{os.getpid()}-{next(STORE_COPIES)}'
            shutil.copytree(world.storage.root, store_copy)
            require(bridge.manifest(bridge.file_state(store_copy)) == initial, 'test Storage copy differs from original')
        started = time.monotonic()
        try:
            pid, payload = fork_run(lambda: self.child_trial(world, action, inputs, edit, initial, instances, store_copy,
                                                             identity, site_cut_all))
        finally:
            if store_copy is not None:
                shutil.rmtree(store_copy, ignore_errors=True)
        if not payload['ok']:
            raise child_error(payload)
        out = payload['value']
        if credited:
            for name, holds, site in out['observes']:
                self.collector.observe(name, holds, site)
        record = dict(route=self.label, kind=kind, edit=edit, cut=cut, pid=pid, cache_inherited=inherited,
                      cache_start=out['cache_start'], cache_end=out['cache_end'], keys=out['keys'],
                      seconds=round(time.monotonic() - started, 3), credited=credited,
                      after_state=out.get('after_state'), refusal_origins=out.get('refusal_origins'))
        for key in ('pre_equals_post', 'returned_marker_paths', 'knob_calls', 'ids_pinned'):
            if key in out:
                record[key] = out[key]
        if 'error' in out:
            record['error'] = out['error']
        require(self.parent_digest(world, inputs) == self.digest0,
                'the parent world, store or schema caches changed during a forked trial')
        record['parent_unchanged'] = True
        self.forks.append(record)
        JUDGE['trials'].append(record)
        if 'error' in out:
            raise child_error(dict(type=out['error_type'], error=out['error']))
        result = out['result']
        if credited:
            self.trials.append(result)
            self.after_states.append(out.get('after_state'))
            self.origins.append((out.get('refusal_origins') or [None])[-1])
            if edit is None and out.get('observed') is not None:
                self.rebuild_observed(out['observed'])
        return result, out

    def rebuild_observed(self, shipped):
        import pm_goal_dg5_closure as closure

        bank = find_object(shipped['bank_id'], shipped['bank_type'])
        validator = bank.validator(shipped['ref']) if shipped['realm'] is None else \
            bank.validator(shipped['realm'], shipped['ref'])
        require(w3.root_binding(closure, bank, validator)[1] == shipped['binding'],
                'the parent validator binding differs from the child observation')
        self.observed = validator, bank, shipped['document'], shipped['binding']

    def child_trial(self, world, action, inputs, edit, initial, instances, store_copy, identity, site_cut_all):
        observes = []
        out = dict(observes=observes, keys=[], members=[])
        for item in instances:
            item.success.clear()
            item.hits = 0
            item.misses = 0
        require(all(not item.success and item.hits == 0 and item.misses == 0 for item in instances),
                'a schema cache kept state in the trial child')
        out['cache_start'] = cache_stats(instances)
        self.collector = types.SimpleNamespace(observe=lambda name, holds, site: observes.append(
            (name, holds, tuple(site))))
        self.child = dict(placed=False, cached=False, seen=0, knob_calls=0)
        try:
            with ExitStack() as stack:
                if self.pin_ids:
                    pin_ids(stack)
                    out['ids_pinned'] = True
                self.install_child(stack, world, edit, out, identity, site_cut_all)
                if self.writes:
                    out['result'] = self.call_on_copy(world, action, inputs, edit, initial, store_copy)
                else:
                    out['result'] = self.call(world, action, inputs, edit)
            out['after_state'] = self.after_state(world, inputs, edit)
            if edit is None and self.observed is not None:
                plain, bank, document, binding = self.observed
                observation = out['result']['observations'][-1]
                out['observed'] = dict(bank_id=id(bank), bank_type=type(bank).__module__ + '.' + type(bank).__qualname__,
                                       realm=observation['realm'], ref=observation['ref'], document=document,
                                       binding=binding)
            if identity:
                out['target_identity'] = self.target_identity(world, out['result'])
        except Exception as error:
            out['error'], out['error_type'] = f'{type(error).__name__}: {error}', type(error).__name__
            out['trace'] = traceback.format_exc()[-4000:]
        out['cache_end'] = cache_stats(instances)
        for key in ('pre_equals_post', 'returned_marker_paths'):
            if key in self.child:
                out[key] = self.child[key]
        if self.options['edit_knob']:
            out['knob_calls'] = self.child['knob_calls']
        return out

    def after_state(self, world, inputs, edit):
        """This trial's store digest and owner in-memory digest, taken in the child after the call.

        The owner walk runs only when `self.walk_owners` is set: in the three repeated
        trials `owner_states()` runs for a same-code later refusal. Every other trial records
        its store digest only (owner_reason 'not requested'); on the largest worlds (about
        3 million objects) a walk in every trial does not fit the 2 GiB scope.
        """
        import pm_goal_dg5_boundaries as bridge

        if self.writes:
            store = self.child.get('store_after_sha256')
        else:
            store = hashlib.sha256(pickle.dumps(self.store_state(world), protocol=5)).hexdigest()
        if edit is None or not self.walk_owners:
            return dict(store_sha256=store, owner_sha256=None, owner_hook=FAMILY, owner_reason='not requested',
                        owner_objects=None)
        saved = bridge.ACTIVE[0]
        bridge.ACTIVE[0] = False
        try:
            owner = owner_state.owner_state_digest(FAMILY, world, inputs)
        except Exception as error:  # noqa: BLE001 - no digest, never a guess
            owner = dict(hook=FAMILY, sha256=None, reason=f'owner-state hook raised {type(error).__name__}: {error}'[:240])
        finally:
            bridge.ACTIVE[0] = saved
        return dict(store_sha256=store, owner_sha256=owner.get('sha256'), owner_hook=owner.get('hook'),
                    owner_reason=owner.get('reason'), owner_objects=owner.get('objects'))

    def install_child(self, stack, world, edit, out, identity, site_cut_all):
        import pm_goal_guard_tables as tables

        import pm_goal_dg5_boundaries as bridge

        original_code = bridge.refusal_code

        def recording_code(error):
            code_of = original_code(error)
            out.setdefault('refusal_origins', []).append(refusal_origin(error, code_of, self.source))
            return code_of

        stack.enter_context(patch.object(bridge, 'refusal_code', recording_code))
        module = cache_module()
        code = self.row.removeprefix('dg5/').removesuffix('/schema')
        checks = self.route.get('checks', 1)
        state = self.child
        pre = bool(edit) and self.options['edit_placement'] == 'pre'
        knob = self.options['edit_knob']
        path = self.options['edit_path']

        def put(value):
            holder = resolve_path(value, path)
            require(isinstance(holder, dict) and edit not in holder, 'the pre-key edit path is not a fresh object')
            holder[edit] = self.filler()
            state['placed'] = True

        if module is not None:
            original_checked = module.Roots._checked

            def checked(cache, method, realm, ref, value, *args):
                if method == 'validate' and args and args[0] == code:
                    state['seen'] += 1
                    state['cached'] = True
                    if pre and not knob and state['seen'] == checks:
                        put(value)
                    digest = value_digest(value)
                    key = None if digest is None else (method, realm, ref, bytes.fromhex(digest))
                    out['keys'].append(dict(occurrence=state['seen'], realm=realm, ref=ref, key_sha256=digest,
                                            hit=key is not None and key in cache.success, cache_id=id(cache)))
                return original_checked(cache, method, realm, ref, value, *args)

            stack.enter_context(patch.object(module.Roots, '_checked', checked))
        if pre and knob:
            knobs = dict(getattr(world, 'knobs', None) or {})
            require(knob not in knobs, f'the world already sets knob {knob}')

            def editor(value):
                state['knob_calls'] += 1
                if state['knob_calls'] == checks:
                    put(value)

            knobs[knob] = editor
            stack.enter_context(patch.object(world, 'knobs', knobs))
        if self.joint or identity:
            import pm_goal_dg_r_world as RW

            inner = RW.Roots.validate
            members = set(self.members)
            site_cut = self.options['site_cut']
            source = str(self.source) + os.sep
            mine = {str(Path(w3.__file__).resolve()), str(Path(__file__).resolve())}

            def where(frame):
                name = frame.f_code.co_filename
                return [name[len(source):] if name.startswith(source) else name, frame.f_lineno]

            def sites():
                """(caller of the bank's validate, first owner frame outside the schema cache)."""
                frame = sys._getframe(2)
                while frame is not None and frame.f_code.co_filename in mine:
                    frame = frame.f_back
                site = where(frame)
                while frame is not None and (frame.f_code.co_filename in mine or
                                             frame.f_code.co_filename.endswith('pm_goal_dg_int_schema_cache.py')):
                    frame = frame.f_back
                return site, where(frame) if frame is not None else site

            def validate(bank, realm, ref, value, label):
                row = 'dg5/' + label + '/schema'
                if row == self.row:
                    return inner(bank, realm, ref, value, label)
                site, owner_site = sites()
                at_site = site_cut is not None and site_cut in (site, owner_site)
                if row in members or at_site:
                    record = dict(row=row, realm=realm, ref=ref, site=site, owner_site=owner_site,
                                  marker_paths=marker_paths(value), cut=False)
                    if identity:
                        record['identity'] = member_identity(bank.validator(realm, ref), value)
                        record['document'] = copy.deepcopy(value)
                        record['bank'] = [id(bank), type(bank).__module__ + '.' + type(bank).__qualname__]
                    out['members'].append(record)
                    if row in tables.CUT or (site_cut_all and at_site):
                        if bank.errors(realm, ref, value):
                            record['cut'] = True
                            return value
                return inner(bank, realm, ref, value, label)

            stack.enter_context(patch.object(RW.Roots, 'validate', validate))

    def target_identity(self, world, result):
        import pm_goal_dg5_closure as closure

        module = cache_module()
        bank = world.roots.original if module is not None and isinstance(world.roots, module.Roots) else world.roots
        observation = result['observations'][-1]
        plain = bank.validator(observation['realm'], observation['ref'])
        require(w3.root_binding(closure, bank, plain)[1] == observation['binding'],
                'the selected check did not use the world bank')
        return dict(row=self.row, site=observation['site'], identity=member_identity(plain, observation['document']),
                    realm=observation['realm'], ref=observation['ref'], document=observation['document'],
                    bank=[id(bank), type(bank).__module__ + '.' + type(bank).__qualname__])

    def call_on_copy(self, world, action, inputs, edit, initial, path):
        """W3's issue_on_copy child, run in this trial's fork (no second fork)."""
        import pm_goal_dg5_boundaries as bridge
        from pm_goal_dg_r_world import uuid
        from pm_goal_test_storage import secrets

        target = inputs[0]
        before = copy.deepcopy(world.storage.cell(*target))
        ids = count(UUID('a36fc6e5-1e3b-4e27-8200-000000000001').int)
        with ExitStack() as stack:
            stack.enter_context(patch.object(world.storage, 'root', path))
            stack.enter_context(patch.object(uuid, 'uuid4', side_effect=lambda: UUID(int=next(ids))))
            if self.checkpoint:
                require('13' * 32 not in world.storage.seeds, 'the fixture seed is already in use')
                stack.enter_context(patch.object(secrets, 'token_hex', return_value='13' * 32))
            result = self.call(world, action, inputs, edit)
        current = world.storage.cell(*target)
        published = current != before
        require(published != bool(result['errors']), 'target publication does not match the verdict')
        result['target_published'] = published
        # The copy's whole manifest digest (the after-state), kept beside the result so the
        # trial results compared below stay the call's own outcome.
        self.child['store_after_sha256'] = hashlib.sha256(
            pickle.dumps(bridge.manifest(bridge.file_state(path)), protocol=5)).hexdigest()
        return result

    # -- proofs ---------------------------------------------------------------------
    def value_of(self, initial, bound_inputs, edit):
        value = dict(store=initial, route=self.route, arguments=bound_inputs, edit=edit)
        extra = nondefault(self.options)
        if extra:
            value['judge_options'] = extra
        return value

    def prove(self, world, action, inputs):
        if self.joint:
            return self.prove_joint(world, action, inputs)
        import pm_goal_dg5_boundaries as bridge
        import pm_goal_guard_tables as tables

        initial = self.store_state(world)
        bound_inputs = bridge.context_value(inputs, world)
        extra = MARKER
        for edit in (None, extra, None):
            value = self.value_of(initial, bound_inputs, edit)
            kinds = iter(('control',) if edit is None else ('defect', 'cut', 'restoration'))

            def evaluate(document, value=value, edit=edit, kinds=kinds):
                require(document == value, 'complete-call inputs changed')
                require(not tables.CUT - {self.row}, 'more than the selected validation rule was disabled')
                require(bridge.context_value(inputs, world) == bound_inputs, 'original owner arguments changed')
                result, _ = self.fork_trial(world, action, inputs, edit, initial, next(kinds, 'replay'))
                require(self.store_state(world) == initial, 'passive call changed the original store')
                return result

            label = f"Method B/{self.route['edition']}/{self.route['call']}"
            self.collector.invoke(label, evaluate, value, edit is None, target=self.row if edit else None,
                                  family=FAMILY)
            record = self.collector.ledger[-1]
            require(not self.collector.failures, self.collector.failures)
            require(record['outcome'] == ('exact_expected' if edit else 'control'), record)
            if edit:
                before, disabled, restored = self.trials[-3:]
                if record['kill'] == 'COVERED_LATER':   # the source stock judge: any later refusal
                    verdict = self.later_refusal(record, before, disabled, restored,
                                                 rerun=lambda: self.owner_states(world, action, inputs, initial))
                    record['kill'] = verdict
                    require(verdict in ('KILLED_CODE', 'COVERED_LATER'),
                            f"{verdict}: {record.get('cannot_decide_reason')} (route {self.label})")
                if self.checkpoint and self.route['edition'] == 'integrated_native':
                    require(record['kill'] in ('COVERED_LATER', 'KILLED_CODE') and disabled['later_checkpoint_matches']
                            and disabled['refusal'] == 'checkpoint/wrapper/schema/'
                            and disabled['detail'] == before['detail'],
                            'the later checkpoint check must refuse the same invalid afterimage')
                elif self.preserved_issued:
                    from pm_goal_dg5_proofs_r import RETAINED

                    field = self.row.split('/')[-2]
                    require(record['kill'] in ('COVERED_LATER', 'KILLED_CODE')
                            and disabled['refusal'] == RETAINED[field].later,
                            'the preserved reader must refuse at its bound original-document check')
                else:
                    require(record['kill'] == 'KILLED' and not disabled['errors'],
                            f"single-check trial {record['kill']}: {record.get('cut_errors')}")
                require(before == restored and before['observations'] == disabled['observations'],
                        'the same invalid document and message must be restored')
                if self.preserved_head or self.filesafe_effects or self.route['call'] in (
                        'read_c3_proof', 'read_request', 'decode_projection'):
                    require(disabled['value_sha256'] == self.trials[0]['value_sha256'],
                            'the accepted read must return the original retained value')
                require(before['refusal'] == self.route['refusal'] and before['detail'] == self.route['detail'],
                        f"unexpected validation message: {before['refusal']} {before['detail']}")
        require(self.trials[0] == self.trials[-1], 'the restored valid call changed')
        return self.observed, initial, bound_inputs

    def owner_states(self, world, action, inputs, initial):
        """The defect, its cut and its restoration again, uncredited, each walking the owners.

        Each repeat must return the trial result it returned when judged (else no state is
        returned and the verdict is CANNOT_DECIDE)."""
        import pm_goal_guard_tables as tables

        states, same = [], True
        self.walk_owners = True
        try:
            for kind, cut, earlier in (('defect-state', (), -3), ('cut-state', (self.row,), -2),
                                       ('restoration-state', (), -1)):
                saved = tables.CUT, tables.NO_CACHE
                tables.CUT, tables.NO_CACHE = frozenset(cut), True
                try:
                    result, out = self.fork_trial(world, action, inputs, MARKER, initial, kind, credited=False)
                finally:
                    tables.CUT, tables.NO_CACHE = saved
                same = same and result == self.trials[earlier]
                states.append(out.get('after_state'))
        finally:
            self.walk_owners = False
        return states if same else None

    def later_refusal(self, record, before, disabled, restored, rerun=None):
        """KILLED_CODE first, then the after-state rule (rulings 1121112536-0b66 (3), 1121115610-7650, addendum 1)."""
        import pm_goal_dg5_boundaries as bridge

        intact_code, cut_code = before.get('refusal'), disabled.get('refusal')
        origin = self.origins[-3] if len(self.origins) >= 3 else None
        code_matches = (isinstance(intact_code, str) and intact_code == self.route['refusal']
                        and bridge.row(intact_code) == self.row)
        origin_at_site = origin_at(origin, self.route['site'])
        own = code_matches and origin_at_site
        different = isinstance(cut_code, str) and bool(cut_code) and cut_code != intact_code
        repeats = restored == before
        code = dict(intact_code=intact_code, cut_code=cut_code, restoration_code=restored.get('refusal'),
                    different_code=different,
                    own_guard=dict(own=own, code_matches=code_matches, route_refusal=self.route['refusal'],
                                   route_site=list(self.route['site']), origin=origin,
                                   verified_by='origin frame at the route site' if own else None),
                    restoration_repeats=repeats, exact=record['outcome'] == 'exact_expected')
        entry = dict(route=self.label, ledger_id=record['id'], killed_code_check=code)
        if different:
            if own and repeats and code['exact']:
                code.update(verdict='KILLED_CODE', reason=None)
                verdict = 'KILLED_CODE'
            else:
                why = (('declared target is not the row guard with its own code' if not code_matches else
                        f"refusal origin is not the row's guard (origin {(origin or {}).get('site')})") if not own else
                       'restoration did not repeat the intact result' if not repeats else 'intact run not exact')
                code.update(verdict=None, reason=why)
                verdict = 'CANNOT_DECIDE'
                record['cannot_decide_reason'] = 'different-code later refusal: ' + why
        else:
            code.update(verdict=None, reason='same code')
            states = rerun() if rerun is not None else self.after_states[-3:]
            if states is None:
                check = dict(intact=None, restoration=None, cut=None, verdict='CANNOT_DECIDE',
                             reason='a repeated trial returned another result than when it was judged')
            else:
                intact, cut, again = states
                check = owner_state.covered_later_check(intact, again, cut)
            record['covered_later_check'] = check
            entry['covered_later_check'] = check
            JUDGE['covered_later'].append(dict(route=self.label, ledger_id=record['id'], **check))
            verdict = check['verdict']
            if verdict == 'CANNOT_DECIDE':
                record['cannot_decide_reason'] = check['reason']
        record['killed_code_check'] = code
        entry['verdict'] = verdict
        JUDGE['later_refusals'].append(entry)
        return verdict

    def prove_joint(self, world, action, inputs):
        import pm_goal_dg5_boundaries as bridge
        import pm_goal_guard_tables as tables

        initial = self.store_state(world)
        bound_inputs = bridge.context_value(inputs, world)
        extra = MARKER
        site_cut = self.options['site_cut']
        # Rule 2 before anything is judged: one uncredited probe with every member cut.
        saved = tables.CUT, tables.NO_CACHE
        tables.CUT, tables.NO_CACHE = frozenset(self.members), True
        try:
            probe, out = self.fork_trial(world, action, inputs, extra, initial, 'identity-probe', credited=False,
                                         identity=True, site_cut_all=site_cut is not None)
        finally:
            tables.CUT, tables.NO_CACHE = saved
        self.probe = out
        if site_cut is not None:
            decided = {m['row'] for m in out['members'] if site_cut in (m['site'], m['owner_site'])}
            self.members = sorted({self.row, *(self.options['joint_cut'] or []), *decided})
        entries = [out['target_identity']] + [dict(row=m['row'], site=m['site'], identity=m['identity'])
                                              for m in out['members'] if m['row'] in self.members]
        missing = sorted(set(self.members) - {e['row'] for e in entries})
        identity = identity_verdict(entries) if not missing else dict(
            ok=False, reason=f'members never checked the defect: {missing}', rows=sorted({e['row'] for e in entries}))
        identity['members'] = [dict(row=e['row'], site=e['site'], **{k: v for k, v in e['identity'].items()
                                                                     if k != 'excluded_branches'},
                                    excluded_branches=e['identity'].get('excluded_branches', []))
                               for e in entries]
        self.joint_report = dict(route=self.label, members=self.members, site_cut=site_cut, identity=identity,
                                 probe=dict(errors=probe['errors'], refusal=probe.get('refusal'),
                                            member_checks=[{k: v for k, v in m.items()
                                                            if k not in ('identity', 'document', 'bank')}
                                                           for m in out['members']]))
        if not identity['ok']:
            self.joint_report['verdict'] = 'IDENTITY_MISMATCH'
            raise IdentityMismatch(f'IDENTITY_MISMATCH: {identity["reason"]}')
        members = list(self.members)
        for edit in (None, extra, None):
            value = self.value_of(initial, bound_inputs, edit)
            value['joint_cut'] = members

            def evaluate(document, value=value, edit=edit):
                require(document == value, 'complete-call inputs changed')
                require(tables.CUT <= set(members), 'a row outside the joint set was disabled')
                require(bridge.context_value(inputs, world) == bound_inputs, 'original owner arguments changed')
                if edit is None:
                    kind = 'control'
                elif tables.CUT:
                    kind = 'cut:' + ','.join(sorted(tables.CUT))
                else:
                    kind = 'defect' if not any(f['kind'] == 'defect' for f in self.forks) else 'restoration'
                result, _ = self.fork_trial(world, action, inputs, edit, initial, kind)
                require(self.store_state(world) == initial, 'passive call changed the original store')
                return result

            label = f"Method B joint/{self.route['edition']}/{self.route['call']}"
            self.collector.invoke(label, evaluate, value, edit is None, target=members if edit else None,
                                  family=FAMILY)
            record = self.collector.ledger[-1]
            require(not self.collector.failures, self.collector.failures)
            if edit is None:
                require(record['outcome'] == 'control', record)
                continue
            alone = {member: self.collector._replay(evaluate, value, {member}) for member in members}
            sites = record.get('site_cuts', {})
            checks = dict(
                refuses_at_selected_row=record['errors'] == [self.row],
                joint_cut_accepts=record.get('cut_errors') == [],
                each_member_refuses_alone=record.get('kill') in ('DUPLICATE_SET_KILLED', 'KILLED') and all(
                    isinstance(v, list) and v for v in sites.values()),
                each_member_cut_alone_refuses=all(isinstance(v, list) and v for v in alone.values()),
                restoration_refuses_at_selected_row=record.get('restoration_errors') == [self.row])
            verdict = 'KILLED' if all(checks.values()) else 'NOT_KILLED'
            self.joint_report.update(ledger_id=record['id'], outcome=record['outcome'], kill=record.get('kill'),
                                     errors=record['errors'], cut_errors=record.get('cut_errors'),
                                     restoration_errors=record.get('restoration_errors'), site_cuts=sites,
                                     member_cut_alone=alone, checks=checks, verdict=verdict)
            require(verdict == 'KILLED', f'joint cut {verdict}: {checks}')
        require(self.trials[0] == self.trials[-1],
                f'the restored valid call changed at {additions(self.trials[0], self.trials[-1])[:8]}')
        return self.observed, initial, bound_inputs


# ---------------------------------------------------------------- fixture and run

def judge_fixture(declare, route, directory):
    """W3's fixtures, plus `current_cancelled`: the projector's current cancelled view after project and cutover."""
    if route['call'] != 'current_cancelled':
        return ORIGINAL_FIXTURE(declare, route, directory)
    import pm_goal_dg_r_projector as projector

    world, _, _ = ORIGINAL_FIXTURE(declare, dict(route, call='current_started'), directory)
    owner = getattr(world, 'projector_class', projector.Projector)(world)
    owner.project()
    owner.cutover()
    return world, owner.read_current_cancelled, owner.request()


def run(args):
    declare = json.loads(args.declaration.read_text())
    options = options_of(declare)
    examples = []
    JUDGE.update(row=declare.get('row'), options=options, trials=[])

    def factory(source, row, route, collector, disabled_check):
        example = ForkedExample(source, row, route, collector, disabled_check, options=options, index=len(examples))
        examples.append(example)
        return example

    with patch.object(w3, 'OwnerExample', factory), patch.object(w3, 'fixture', judge_fixture):
        code = w3.run(args)
    path = args.out / 'result.json'
    result = json.loads(path.read_text())
    mismatch = any(e.joint_report and e.joint_report.get('verdict') == 'IDENTITY_MISMATCH' for e in examples)
    if mismatch:
        result['status'] = 'IDENTITY_MISMATCH'
        code = 1
    result['judge'] = dict(JUDGE, cache_audit=[e.cache_audit for e in examples],
                           joint=[e.joint_report for e in examples if e.joint_report],
                           trial_count=len(JUDGE['trials']), pids=sorted({t['pid'] for t in JUDGE['trials']}))
    write(path, result)
    print(json.dumps(dict(judge=JUDGE['module_sha256'], status=result['status'], trials=len(JUDGE['trials']),
                          reason=result.get('reason')), sort_keys=True), flush=True)
    return code


if __name__ == '__main__':
    parser = argparse.ArgumentParser(description=__doc__.split('\n\n')[0])
    parser.add_argument('--source', type=Path, required=True)
    parser.add_argument('--census', type=Path, required=True)
    parser.add_argument('--declaration', type=Path, required=True)
    parser.add_argument('--fresh-reference', type=Path, action='append')
    parser.add_argument('--out', type=Path, required=True)
    parser.add_argument('--disable-check', choices=('inventory', 'rule', 'row'))
    sys.exit(run(parser.parse_args()))
