#!/usr/bin/env python3
"""TEST_ONLY loader for the shared NUMRULE number and date-time calls.

native evidence stays NOT_RUN and is a separate claim; a planning PASS must
never read as native proof.

The shared calls live in ``scripts/pm_event_numbers.py`` and
``scripts/pm_event_datetime.py`` on ``plans/ea-numrule-20261105``. This branch
is cut from the DG common base, which predates them, and the NUMRULE files are
never edited or copied here. The loader therefore imports the exact pinned
blobs:

1. If ``scripts/pm_event_numbers.py`` and ``scripts/pm_event_datetime.py`` sit
   beside this file (for example after a family lane merges NUMRULE), they are
   used only when their git blob ids equal the pins below.
2. Otherwise the pinned blobs are read from the local git object store
   (``git cat-file blob <id>``) into a private cache directory, their blob ids
   and SHA-256 are recomputed from the bytes, and the cache is imported.

Any other bytes refuse with ``numrule/pin``. No number cap, serializer or
date-time grammar is defined here; every wrapper forwards to the shared call
and maps its ``Refusal.reason`` into this package's refusal namespace.
"""
from __future__ import annotations

import hashlib
import importlib.util
import os
from pathlib import Path
import subprocess
import sys

QUALIFICATION = 'TEST_ONLY'
NATIVE_LINE = ('native evidence stays NOT_RUN and is a separate claim; '
               'a planning PASS must never read as native proof')
NUMRULE_COMMIT = '58c2816ff33365384d4039553f5efdb5370930e6'
NUMRULE_REF = 'origin/plans/ea-numrule-20261105'
# git blob id, SHA-256 of the exact bytes.
PINS = {
    'pm_event_index_binding.py': ('71d63474e26de4cea4914b03a4bd7eb86a77daec',
                                  '8e2c243f24e401e125e0af321cbb8dd76e2eca86742db84f2acafd91dc263e2f'),
    'pm_event_numbers.py': ('828449a760f42b92cf397d3aa9b8e0a02a9191a4',
                            '31ae47086bacad7f078239baa9e9ec3a5118472298a9e26e878dcf2534819444'),
    'pm_event_datetime.py': ('2b3a5b589e1eee1dea795f552f0be54be41f4f5d',
                             'e09d1a18b8c198dc4fc54d9b7017aff47eeaf3a02366c61c64c61e6df3b7995e'),
}
HERE = Path(__file__).resolve().parent
ROOT = HERE.parent


def _blob_id(raw: bytes) -> str:
    return hashlib.sha1(b'blob %d\0' % len(raw) + raw).hexdigest()


def _full_blob_ids():
    """Resolve each abbreviated pin to the full blob id at the pinned commit."""
    out = {}
    for name, (short, _) in PINS.items():
        try:
            full = subprocess.run(
                ['git', '-C', str(ROOT), 'rev-parse', f'{NUMRULE_COMMIT}:scripts/{name}'],
                check=True, capture_output=True, text=True).stdout.strip()
        except (OSError, subprocess.CalledProcessError):
            full = None
        if full is not None and not full.startswith(short):
            raise ImportError('numrule/pin/' + name)
        out[name] = full
    return out


def _beside_ok():
    for name, (short, _) in PINS.items():
        path = HERE / name
        if not path.exists():
            return False
        if not _blob_id(path.read_bytes()).startswith(short):
            return False
    return True


def _materialize():
    cache = Path(os.environ.get('PM_GOAL_TEST_NUMRULE_CACHE') or
                 Path(os.environ.get('XDG_CACHE_HOME', Path.home() / '.cache')) / 'pm-goal-test-numrule' / NUMRULE_COMMIT[:12])
    cache.mkdir(parents=True, exist_ok=True)
    full = _full_blob_ids()
    for name, (short, _) in PINS.items():
        target = cache / name
        if target.exists() and _blob_id(target.read_bytes()).startswith(short):
            continue
        blob = full.get(name)
        if blob is None:
            raise ImportError('numrule/unavailable/' + name + ': pinned commit ' + NUMRULE_COMMIT +
                              ' is not in the local object store; run git fetch origin')
        raw = subprocess.run(['git', '-C', str(ROOT), 'cat-file', 'blob', blob],
                             check=True, capture_output=True).stdout
        if _blob_id(raw) != blob:
            raise ImportError('numrule/pin/' + name)
        tmp = target.with_suffix('.tmp')
        tmp.write_bytes(raw)
        os.replace(tmp, target)
    return cache


def _load():
    directory = HERE if _beside_ok() else _materialize()
    records = {}
    for name, (short, _) in PINS.items():
        raw = (directory / name).read_bytes()
        if _blob_id(raw) != short or hashlib.sha256(raw).hexdigest() != PINS[name][1]:
            raise ImportError('numrule/pin/' + name)
        records[name] = dict(blob_id=_blob_id(raw), sha256=hashlib.sha256(raw).hexdigest(),
                             source=str(directory / name))
    modules = {}
    saved = list(sys.path)
    try:
        sys.path.insert(0, str(directory))
        for module in ('pm_event_index_binding', 'pm_event_numbers', 'pm_event_datetime'):
            existing = sys.modules.get(module)
            if existing is not None:
                origin = Path(getattr(existing, '__file__', '') or '')
                if origin.resolve() != (directory / (module + '.py')).resolve():
                    if _blob_id(origin.read_bytes()) != records[module + '.py']['blob_id']:
                        raise ImportError('numrule/foreign_module/' + module)
                modules[module] = existing
                continue
            spec = importlib.util.spec_from_file_location(module, directory / (module + '.py'))
            loaded = importlib.util.module_from_spec(spec)
            sys.modules[module] = loaded
            spec.loader.exec_module(loaded)
            modules[module] = loaded
    finally:
        sys.path[:] = saved
    return modules, records


_MODULES, PINNED = _load()
N = _MODULES['pm_event_numbers']
DT = _MODULES['pm_event_datetime']
NumRefusal = N.Refusal


class NumruleRefusal(Exception):
    """A shared-call refusal mapped into the adapter namespace (TEST_ONLY)."""

    def __init__(self, reason):
        super().__init__(reason)
        self.reason = reason


def _call(where, function, *args, **kwargs):
    try:
        return function(*args, **kwargs)
    except NumRefusal as error:
        raise NumruleRefusal(where + '/numrule/' + error.reason) from error


def uint64(value, where='uint64'):
    """Owner-declared Storage uint64 (sequence, generation, offset, revision)."""
    return _call(where, N.storage_uint64, value)


def integer(value, where='integer', *, minimum=None, maximum=None):
    return _call(where, N.current_integer, value, minimum=minimum, maximum=maximum)


def boolean(value, where='boolean'):
    return _call(where, N.exact_boolean, value)


def append_policy(value, where='append_policy'):
    """Current request gate only; never applied to a retained original."""
    return _call(where, N.current_append_policy, value)


def storage_time(value, where='storage_time'):
    """CV-253 storage_utc_z profile for Storage-assigned timestamps."""
    return _call(where, DT.date_time, value, profile=DT.STORAGE_UTC_Z)


def event_time(value, where='event_time'):
    """CV-1101 default event_record profile."""
    return _call(where, DT.date_time, value, profile=DT.EVENT_RECORD)


def event_value_bytes(value, where='event_value'):
    """SP-236 canonical MessagePack EventRecord/value bytes."""
    return _call(where, N.storage_value_bytes, value, profile=N.EVENT_VALUE)


def decode_event_value(raw, where='event_value'):
    return _call(where, N.decode_storage_value, raw, profile=N.EVENT_VALUE)


def binding_value_bytes(value, where='binding'):
    """SP-278 binding / CV-339 strict uint-and-string MessagePack arrays."""
    return _call(where, N.storage_value_bytes, value, profile=N.INDEX_BINDING)


def full_value_commitment(event, where='full_value'):
    return _call(where, N.full_value_commitment, event)


def producer_digest(event, where='producer'):
    return _call(where, N.producer_semantic_digest, event)


def verify_payload(raw, *, byte_size, payload_id, media_type, expected_media_type, inline=False,
                   where='payload'):
    return _call(where, N.verify_payload_bytes, raw, byte_size=byte_size, payload_id=payload_id,
                 media_type=media_type, expected_media_type=expected_media_type, inline=inline)


def describe():
    return dict(qualification=QUALIFICATION, numrule_commit=NUMRULE_COMMIT, numrule_ref=NUMRULE_REF,
                pinned=PINNED, native=NATIVE_LINE)


if __name__ == '__main__':
    import json
    print(json.dumps(describe(), indent=2, sort_keys=True))
