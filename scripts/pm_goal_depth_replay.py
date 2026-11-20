"""Run the original Goal checker with exactly one predicate disabled and restored.

The DG5 guard wrapper routes observed predicates by source site. Each call gets
its own byte-for-byte copy of a TEST_ONLY store. The caller supplies the exact
refusal and checks the observed ownership and effects on acceptance.
"""
import hashlib
import inspect
import json
from pathlib import Path
import shutil
from types import SimpleNamespace
from unittest.mock import patch

import pm_goal_dg5_boundaries as boundaries
import pm_goal_guard_sweep as sweep
import pm_goal_guard_tables as tables
from pm_goal_test_owner_adapters import AdapterRefusal


def check(condition, message):
    if not condition:
        raise AssertionError(message)


def store_image(root):
    return boundaries.manifest(boundaries.file_state(root))


def source_site(function, marker):
    lines, start = inspect.getsourcelines(function)
    matches = [start + n for n, line in enumerate(lines) if marker in line]
    check(len(matches) == 1, f"Expected one predicate matching {marker!r} in {function.__qualname__}")
    path = Path(inspect.getsourcefile(function)).relative_to(boundaries.ROOT)
    return str(path), matches[0]


def replay(root, *, seed, open_world, module, function, marker, code, control, negative, call, verify):
    """Observe an accepted call, the exact negative, the one-site cut and restoration."""
    site = source_site(function, marker)
    target = boundaries.site_name(*site)
    seed_image = store_image(seed)
    seed_digest = sweep.digest(seed_image)
    guarded = boundaries.guard_wrapper(module.require)
    runs = {}

    for label, args, cut in (
        ('control', control, ()),
        ('negative', negative, ()),
        ('disabled', negative, (target,)),
        ('restored', negative, ()),
    ):
        clone = shutil.copytree(seed, root / label)
        check(store_image(clone) == seed_image, f"{label}: copy differs from the original store")
        world = open_world(clone)
        check(store_image(clone) == seed_image, f"{label}: reopening changed the starting bytes")
        trace = []
        collector = SimpleNamespace(observe=lambda name, holds, where: trace.append((name, holds, where)))
        with patch.object(module, 'require', guarded), patch.object(boundaries, 'ACTIVE', [True]), \
                patch.object(boundaries, 'LAST_REFUSAL', [None]), patch.object(tables, 'COLLECTOR', collector), \
                patch.object(tables, 'DISCOVERY', True), patch.object(tables, 'CUT', frozenset(cut)), \
                patch.object(tables, 'NO_CACHE', True):
            try:
                value = call(world, args)
                refusal = None
                refused_row = None
            except AdapterRefusal as error:
                value = None
                refusal = str(error)
                refused_row = boundaries.refusal_row(error)
        expected = code if label in ('negative', 'restored') else None
        check(refusal == expected, f"{label}: expected {expected!r}, got {refusal!r}")
        if expected is not None:
            check(refused_row == target, f"{label}: refusal came from {refused_row}, expected {target}")
        observed = [holds for name, holds, _ in trace if name == target]
        check(bool(observed) and all(observed) == (label == 'control'), f"{label}: target observation changed")
        runs[label] = dict(
            input_sha256=sweep.digest(dict(arguments=args, store_manifest=seed_image)),
            arguments=args, store_before_sha256=seed_digest,
            store_after_sha256=sweep.digest(store_image(clone)), disabled_sites=list(cut),
            exact_refusal=refusal, refusing_site=refused_row, observed_target=observed,
            trace=trace, observation=verify(label, world, args, value),
        )

    refused = runs['negative']
    restored = runs['restored']
    disabled = runs['disabled']
    check(refused['input_sha256'] == restored['input_sha256'] == disabled['input_sha256'],
          "Negative, disabled and restored input bytes differ")
    check(refused['trace'] == restored['trace'], "Restored execution changed the checked predicates")
    check(disabled['trace'][:len(refused['trace'])] == refused['trace'],
          "Disabled execution diverged before the target refusal")
    check(store_image(seed) == seed_image, "Source store was changed by replay")
    spec = boundaries.ROOT / site[0]
    return dict(site=dict(path=site[0], line=site[1], sha256=hashlib.sha256(spec.read_bytes()).hexdigest(),
                          predicate=spec.read_text().splitlines()[site[1] - 1], row=target),
                seed_manifest=seed_image, runs=runs)


def write_evidence(path, payload):
    payload = dict(qualification='TEST_ONLY', native_execution='NOT_RUN', **payload)
    path.write_text(json.dumps(payload, ensure_ascii=False, indent=2, sort_keys=True) + '\n')
