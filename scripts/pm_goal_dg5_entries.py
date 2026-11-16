"""Shared entry observation plumbing for DG5's original family suites."""
import functools
import hashlib
import inspect
import os
from pathlib import Path

import pm_goal_dg5_boundaries as bridge
import pm_goal_guard_tables as tables


def case_shard_selected(case_id, spec=None):
    """Whether `case_id` belongs to shard ``i/n`` (``PM_DG5_CASE_SHARD`` when unset).

    The shard is a stable hash partition over whole authored case ids only: every
    complete call of a selected case runs in one process, and no schema root or
    case is split. The union of shards ``0/n .. (n-1)/n`` is the full case set.
    """
    raw = os.environ.get('PM_DG5_CASE_SHARD', '') if spec is None else spec
    if raw in (None, ''):
        return True
    try:
        index_text, total_text = str(raw).split('/', 1)
        index, total = int(index_text), int(total_text)
    except (ValueError, AttributeError) as error:
        raise ValueError('PM_DG5_CASE_SHARD must be i/n, got %r' % (raw,)) from error
    if total <= 0 or not 0 <= index < total:
        raise ValueError('PM_DG5_CASE_SHARD must be i/n with 0 <= i < n, got %r' % (raw,))
    return int.from_bytes(hashlib.sha256(case_id.encode()).digest()[:8], 'big') % total == index


def world_root(world):
    for key in ('work', 'tmp', 'root'):
        path = getattr(world, key, None)
        if isinstance(path, (str, Path)):
            return Path(path)
    return world.storage.root


def entries(cls, methods, family):
    for name in methods:
        original = getattr(cls, name)
        if getattr(original, '_dg5_entry', False):
            continue

        def bind(original=original, entry=cls.__name__ + '.' + name):
            @functools.wraps(original)
            def call(self, *args, **kwargs):
                if bridge.ACTIVE[0] or bridge.PARENT_CALL[0] or bridge.CASE[0] is None:
                    return original(self, *args, **kwargs)
                world = getattr(self, 'world', None) or getattr(self, 'w', None)
                if world is None and hasattr(self, 'storage') and hasattr(self, 'recorder'):
                    world = self  # a world-level original method (the receiver is the world)
                import pm_goal_test_storage as storage_module
                store_type = storage_module.TestOwnerStorage
                if world is None and isinstance(self, store_type):
                    world = self  # a shared Storage entry (or subclass): its own root is the complete store
                if world is None and isinstance(getattr(self, 'storage', None), store_type):
                    world = self.storage  # a shared owner/source entry over one Storage
                ctx_storage = getattr(getattr(self, 'ctx', None), 'storage', None)
                if world is None and isinstance(ctx_storage, store_type):
                    world = ctx_storage  # a context-bound owner (DG-S issuance): its run's complete store
                lower_storage = getattr(getattr(self, 'lower', None), 'storage', None)
                if world is None and isinstance(lower_storage, store_type):
                    world = lower_storage  # a projector over a lower Storage participant (DG-CF3)
                if world is None:
                    raise ValueError('entry has no original world: ' + entry)
                case = bridge.CASE[0]
                expected = case.get('expected')
                from pm_goal_dg5_declarations import target
                return bridge.entry_call(case, case['id'] + '/' + entry, family,
                                         lambda: original(self, *args, **kwargs), world_root(world), world=world,
                                         arguments=dict(receiver=self, args=args, kwargs=kwargs), original=original,
                                         target=target(case, bridge.target_rows(expected), case['id'] + '/' + entry))
            call._dg5_entry = True
            return call
        setattr(cls, name, bind())


def schema_entry(cls):
    """Observe a whole-root schema check without changing its validator."""
    original = cls.validate
    if getattr(original, '_dg5_schema', False):
        return

    @functools.wraps(original)
    def validate(self, root, value, code='root'):
        if not bridge.ACTIVE[0]:
            return original(self, root, value, code)
        errors = self.errors(root, value)
        frame = inspect.currentframe().f_back
        site = (str(Path(frame.f_code.co_filename).relative_to(bridge.ROOT)), frame.f_lineno)
        if tables.decide(bridge.PREFIX + code + '/schema', not errors, site=site) is not None:
            # The schema row is the refusing row; the bank's own routed refusal inside
            # validate (SHARED-ROUTE) is its mechanism and must not replace it.
            saved = bridge.ROUTING[0]
            bridge.ROUTING[0] = True
            try:
                return original(self, root, value, code)
            finally:
                bridge.ROUTING[0] = saved
        return value
    validate._dg5_schema = True
    cls.validate = validate


def suite_cases(cls):
    original = cls._run

    @functools.wraps(original)
    def run(self, group, kind, case_id, fn, expected):
        saved = bridge.CASE[0]
        bridge.CASE[0] = dict(id=group + '/' + case_id, expected=expected)
        try:
            return original(self, group, kind, case_id, fn, expected)
        finally:
            bridge.CASE[0] = saved
    cls._run = run
