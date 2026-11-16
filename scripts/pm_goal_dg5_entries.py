"""Shared entry observation plumbing for DG5's original family suites."""
import functools
import inspect
from pathlib import Path

import pm_goal_dg5_boundaries as bridge
import pm_goal_guard_tables as tables


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
                if world is None and type(self).__name__ == 'TestOwnerStorage':
                    world = self  # a shared Storage entry: its own root is the complete store
                if world is None and type(getattr(self, 'storage', None)).__name__ == 'TestOwnerStorage':
                    world = self.storage  # a shared owner/source entry over one Storage
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
            return original(self, root, value, code)
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
