#!/usr/bin/env python3
"""PNC-019 C12-GO2 (lane GO2): close the schema clauses of the two large frozen restore_point.deleted roots.

GO (scripts/pm_goal_go_schema_closure.py at 5f1f1829f2) left frozen:35d68755... (3,201 clauses) and
frozen:51a524bd... (11,747 clauses) bounded: 12,529 clauses never searched, 60 searched without a witness and
12 raising PointerToNowhere. GO2 changes nothing in GO's classes, defects, cut or proofs. It changes how fast a
validation runs and where the search starts:

  dump    run GO's collection once (authored seed policy) and pickle, per selected root, the exact validator
          inputs (runtime schema, registry resources, base URI, validator class) and the accepted authored seeds;
          later processes rebuild the same validator in seconds instead of re-running the sweep.
  agree   the memoizing validator (MemoValidator below) against the reference validator (the class GO ran) on
          accepted and refused instances: identical validity, identical error streams (path, schema path,
          keyword, oracle guard, recursively through every context), with and without a clause cut.
  bench   validations per second, reference and memoized, on the same instance stream.
  close   GO's close_root / search_clause unchanged, run with the memoized validator, controls that hold a clause
          at its own location tried first, and --carry of every witness class from earlier reports.

The memoizing validator is exact by construction: a (schema node, instance value, base URI, dynamic context)
result is reused only when it was 'no errors' (or, for is_valid, 'invalid'); every refusal stream is
recomputed by the reference keyword functions. Instance values are hash-consed (exact structural interning,
no probabilistic hash), recomputed for every top-level validation, so in-place edits between validations can
never reuse a stale entry.
"""
import argparse
import base64
import collections
import copy
import hashlib
import json
import os
import pickle
import random
import re
import sys
import time
import warnings
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(ROOT / 'scripts'))

warnings.filterwarnings('ignore', category=DeprecationWarning)

TOOL_SHA256 = hashlib.sha256(Path(__file__).read_bytes()).hexdigest()
TARGETS = ('35d68755', '51a524bd')


def sha(value):
    return hashlib.sha256(pickle.dumps(value, protocol=5)).hexdigest()


def value_sha(value):
    """A value fingerprint independent of object identity (GO's input_sha256 is a pickle hash, and pickle encodes which
    equal strings are one object, so an equal value rebuilt elsewhere can hash differently). JSON keeps 1, 1.0 and true
    apart and keeps member order."""
    try:
        text = json.dumps(value, ensure_ascii=False, separators=(',', ':'), allow_nan=True)
    except (TypeError, ValueError):
        text = repr(value)
    return hashlib.sha256(text.encode('utf-8', 'surrogatepass')).hexdigest()


# ---------------------------------------------------------------- dump / load

def dump(args):
    import pm_goal_go_schema_closure as cl
    import pm_goal_go_schema as schema_rows
    cl.SEED_POLICY[0] = 'authored'
    schema_rows.SEED_CAP = args.seed_cap
    import pm_goal_oracle_common as common
    start = time.monotonic()
    collector, roots = cl.collect()
    families = cl.family_roots(collector, roots)
    took = time.monotonic() - start
    out = {}
    for root, slot in sorted(roots.items()):
        if not any(t in root for t in args.roots):
            continue
        v = slot['validator']
        resolver = v._resolver
        resources = {}
        for uri, resource in resolver._registry._resources.items():
            resources[uri] = resource.contents
        cls = 'StrictValidator' if type(v) is common.StrictValidator else 'CurrentValidator' if type(v) is common.CurrentValidator else None
        if cls is None:
            raise SystemExit(f'{root}: unexpected validator class {type(v)!r}')
        seeds = list(slot['seeds'].values())
        reference = [signature(v, s) for s in seeds]
        out[root] = dict(schema=v.schema, base=resolver._base_uri, resources=resources, cls=cls, seeds=seeds,
                         seed_sha256=sorted(slot['seeds']), families=sorted(families.get(root, ())), rows=sorted(slot['rows']),
                         sites=sorted(map(list, slot['sites'])), kind=slot['kind'], reference_signatures=reference)
        print(f'{root[:80]}: seeds {len(seeds)} resources {len(resources)} base {resolver._base_uri!r} '
              f'valid {[not s for s in reference]}', file=sys.stderr, flush=True)
    meta = dict(collect_seconds=round(took, 1), seed_cap=args.seed_cap, seed_policy='authored', tool_sha256=TOOL_SHA256,
                calls=collector.calls)
    blob = pickle.dumps(dict(meta=meta, roots=out), protocol=5)
    args.out.write_bytes(blob)
    print(json.dumps(dict(meta, roots={r: len(e['seeds']) for r, e in out.items()}, sha256=hashlib.sha256(blob).hexdigest())))
    return 0


def rebuild(entry, memo=False):
    """The validator GO ran for a frozen root (pm_goal_deleted_external_oracles.Schema): the runtime schema over the
    closed registry, resolver bound to the original base URI, the shared format checker."""
    import pm_goal_oracle_common as common
    from referencing import Registry
    from referencing.jsonschema import DRAFT202012
    registry = Registry().with_resources((uri, DRAFT202012.create_resource(contents)) for uri, contents in entry['resources'].items())
    cls = getattr(common, entry['cls'])
    if memo:
        cls = memo_class(cls)
    return cls(entry['schema'], registry=registry, _resolver=registry.resolver(entry['base']), format_checker=common.FORMATS)


def load(path, root_filter=None):
    data = pickle.loads(Path(path).read_bytes())
    if root_filter:
        data['roots'] = {r: e for r, e in data['roots'].items() if any(t in r for t in root_filter)}
    return data


# ---------------------------------------------------------------- error signatures (the agreement relation)

def error_signature(error):
    return (tuple(map(str, error.absolute_path)), tuple(map(str, error.relative_schema_path)), str(error.validator),
            getattr(error, 'oracle_guard', None), tuple(error_signature(e) for e in (error.context or ())))


def signature(v, value, cut=frozenset()):
    import pm_goal_oracle_common as common
    token = common._SCHEMA_CONTEXT.set(('', frozenset(cut)))
    try:
        if isinstance(v, MEMO_TYPES):
            v.begin()
        return tuple(error_signature(e) for e in v.iter_errors(value))
    finally:
        common._SCHEMA_CONTEXT.reset(token)


# ---------------------------------------------------------------- the memoizing validator

MEMO_TYPES = ()
NONE = object()  # 'no candidate' (None is a value)
STATS = collections.Counter()
MEMO_RSS_MB = [1650]  # safety valve: clear the memo tables (always safe) when the process grows past this
MEMO_ENTRIES = [2500000]  # normal trigger: memo table entries


def rss_mb():
    try:
        return int(Path('/proc/self/statm').read_text().split()[1]) * os.sysconf('SC_PAGE_SIZE') // 2**20
    except OSError:
        return 0


class Interner:
    """Exact structural interning: equal JSON values (same types, same member order) get the same small integer."""

    def __init__(self):
        self.table = {}
        self.frame = {}  # id(container) -> (container, number), valid for one top-level validation only

    def begin(self):
        self.frame = {}

    def number(self, value):
        """Tags keep equal-comparing values of different JSON types apart (1, 1.0 and True; 0.0 and -0.0)."""
        frame, table = self.frame, self.table

        def rec(value):
            kind = type(value)
            if kind is str:
                key = value
            elif kind is dict:
                hit = frame.get(id(value))
                if hit is not None and hit[0] is value:
                    return hit[1]
                parts = [1]
                for k, x in value.items():
                    parts.append(k)
                    parts.append(rec(x))
                key = tuple(parts)
            elif kind is list:
                hit = frame.get(id(value))
                if hit is not None and hit[0] is value:
                    return hit[1]
                key = (2, *[rec(x) for x in value])
            elif kind is bool:
                key = (3, value)
            elif kind is int:
                key = (4, value)
            elif kind is float:
                key = (5, value.hex() if value == value else 'nan')
            elif value is None:
                key = (6,)
            else:  # any other Python object: never shared across validations
                number = -1 - len(frame)
                frame[id(value)] = (value, number)
                return number
            number = table.get(key)
            if number is None:
                number = table[key] = len(table)
            if kind is dict or kind is list:
                frame[id(value)] = (value, number)
            return number
        return rec(value)


def memo_class(base):
    """A subclass of the reference validator class whose descend / iter_errors / is_valid reuse exact results."""
    import pm_goal_oracle_common as common
    global MEMO_TYPES
    import referencing.exceptions
    interner = Interner()
    lookups = {}      # (registry id, base URI, dynamic scope id, ref) -> (registry, scope, Resolved): kept alive with the key
    valid = set()     # keys whose stream was fully drained with no error
    invalid = set()   # keys whose is_valid answered False (only is_valid reads it)
    keep = {}         # id(schema node) -> node, so a schema id is never reused while a key names it

    def ctx():
        return (common._SCHEMA_CONTEXT.get(), common.DATETIME_PROFILE.get())

    def key_of(schema, instance, base_uri):
        if type(schema) is not dict:
            return None
        if '$dynamicRef' in schema or '$recursiveRef' in schema:
            return None  # dynamic scope is not in the key: never memoize such a node
        keep.setdefault(id(schema), schema)
        return (id(schema), interner.number(instance), base_uri, ctx())

    import jsonschema
    jsonschema_dir = os.path.dirname(jsonschema.__file__) + os.sep
    nested_codes = set()

    def top_level(depth=2):
        """A call from outside the validator (closure code) starts a new top-level validation: the interning frame
        is reset. Only reference keyword code (the jsonschema package) and Memo.is_valid count as nested; any other
        caller resets, which can only cost time, never reuse a frame across an in-place edit."""
        code = sys._getframe(depth).f_code
        if code in nested_codes or code.co_filename.startswith(jsonschema_dir):
            return
        interner.begin()
        STATS['top_level'] += 1
        if STATS['top_level'] % 500 == 0 and (len(valid) + len(invalid) + len(interner.table) > MEMO_ENTRIES[0]
                                                or rss_mb() > MEMO_RSS_MB[0]):
            # Clearing is always safe (only time is lost). RSS rarely falls after a clear (the allocator keeps the
            # arenas), so the entry count is the normal trigger and RSS only a safety valve near the 2 GB scope.
            valid.clear(), invalid.clear(), interner.table.clear(), keep.clear()
            import gc
            gc.collect()
            STATS['memo_cleared'] += 1
            MEMO_RSS_MB[0] = max(MEMO_RSS_MB[0], rss_mb() + 150)

    class Memo(base):
        def begin(self):
            interner.begin()

        def descend(self, instance, schema, path=None, schema_path=None, resolver=None):
            if resolver is None and isinstance(schema, dict) and '$id' not in schema:
                base_uri = self._resolver._base_uri
            elif resolver is not None:
                base_uri = resolver._base_uri
            else:
                base_uri = None  # an inline $id: compute through the reference path, never memoized
            key = key_of(schema, instance, base_uri) if base_uri is not None else None
            if key is not None and key in valid:
                STATS['descend_hit'] += 1
                return
            STATS['descend_miss'] += 1
            failed = False
            for error in base.descend(self, instance, schema, path=path, schema_path=schema_path, resolver=resolver):
                failed = True
                yield error
            if not failed and key is not None:
                valid.add(key)

        def iter_errors(self, instance, _schema=None):
            assert self._ref_resolver is None
            top_level()
            schema = self.schema if _schema is None else _schema
            key = key_of(schema, instance, self._resolver._base_uri) if _schema is None else None
            if key is not None and key in valid:
                STATS['iter_hit'] += 1
                return
            STATS['iter_miss'] += 1
            failed = False
            for error in base.iter_errors(self, instance, _schema):
                failed = True
                yield error
            if not failed and key is not None:
                valid.add(key)

        def _validate_reference(self, ref, instance):
            """The reference keyword with the referencing lookup memoized: Resolver.lookup is a pure function of the
            resolver's registry, base URI and dynamic scope and the ref (its registry crawl on a miss is what made a
            51a5 validation cost 0.4 s); the resolved contents and resolver are reused, the descent is the reference's."""
            resolver = self._resolver
            if self._ref_resolver is not None:
                return base._validate_reference(self, ref, instance)
            key = (id(resolver._registry), resolver._base_uri, id(resolver._previous), ref)
            hit = lookups.get(key)
            if hit is None or hit[0] is not resolver._registry or hit[1] is not resolver._previous:
                try:
                    resolved = resolver.lookup(ref)
                except referencing.exceptions.Unresolvable as err:
                    raise jsonschema.exceptions._WrappedReferencingError(err)
                lookups[key] = hit = (resolver._registry, resolver._previous, resolved)
                STATS['lookup_miss'] += 1
            else:
                STATS['lookup_hit'] += 1
            resolved = hit[2]
            return self.descend(instance, resolved.contents, resolver=resolved.resolver)

        def is_valid(self, instance, _schema=None):
            top_level()
            if _schema is not None:
                return base.is_valid(self, instance, _schema)
            key = key_of(self.schema, instance, self._resolver._base_uri)
            if key is not None:
                if key in valid:
                    STATS['valid_hit'] += 1
                    return True
                if key in invalid:
                    STATS['invalid_hit'] += 1
                    return False
            error = next(self.iter_errors(instance), None)
            if error is not None and key is not None:
                invalid.add(key)
            return error is None

    nested_codes.add(Memo.is_valid.__code__)
    Memo.__name__ = 'Memo' + base.__name__
    Memo.memo_tables = (valid, invalid, interner, keep)
    MEMO_TYPES = MEMO_TYPES + (Memo,)
    return Memo


# ---------------------------------------------------------------- agreement and timing

def instance_stream(v, seeds, count, rng):
    """Accepted seeds and single-field edits of them (GO's own defects() at every reachable location), so the stream
    holds both accepted and refused instances at every depth."""
    import pm_goal_go_schema_closure as cl
    paths = []
    def collect_paths(value, path):
        paths.append(path)
        if isinstance(value, dict):
            for k, x in value.items():
                collect_paths(x, path + (k,))
        elif isinstance(value, list):
            for i, x in enumerate(value[:4]):
                collect_paths(x, path + (i,))
    per_seed = []
    for s in seeds:
        paths.clear()
        collect_paths(s, ())
        per_seed.append(list(paths))
    edits = [None, True, 7, 1.5, 'gc', [], {}, '', 'x' * 300, -1, 2**64, '2026-02-30T00:00:00Z', 'not-a-uuid', 0]
    out = [copy.deepcopy(s) for s in seeds]
    while len(out) < count:
        i = rng.randrange(len(seeds))
        value = copy.deepcopy(seeds[i])
        for _ in range(rng.choice((1, 1, 1, 2))):
            path = rng.choice(per_seed[i])
            try:
                here = cl.get(value, path)
            except (KeyError, IndexError, TypeError):
                continue
            choice = rng.random()
            if choice < 0.25 and isinstance(here, dict) and here:
                del here[rng.choice(list(here))]
            elif choice < 0.35 and isinstance(here, dict):
                here['gc_extra_member'] = 'gc'
            elif choice < 0.5 and isinstance(here, str):
                value = cl.put(value, path, rng.choice([here + 'x', here[:-1], here.upper(), here + '\n']))
            elif choice < 0.6 and type(here) is int:
                value = cl.put(value, path, rng.choice([here + 1, here - 1, -here, float(here)]))
            else:
                value = cl.put(value, path, copy.deepcopy(rng.choice(edits)))
        out.append(value)
    return out


def agree(args):
    import pm_goal_oracle_common as common
    data = load(args.dump, args.roots)
    report = dict(tool_sha256=TOOL_SHA256, roots={})
    for root, entry in data['roots'].items():
        ref = rebuild(entry)
        fast = rebuild(entry, memo=True)
        rng = random.Random(args.seed)
        stream = instance_stream(ref, entry['seeds'], args.count, rng)
        guards = set()  # cut guards: every guard the reference reports on the first refused instances of the stream
        for value in stream:
            if len(guards) >= 400:
                break
            guards |= _guards(ref, value)
        guards = sorted(guards)
        mismatches, accepted, refused, cuts, seed_match = [], 0, 0, 0, 0
        for number, s in enumerate(entry['seeds']):
            seed_match += signature(ref, s) == tuple(entry['reference_signatures'][number])
        start = time.monotonic()
        for number, value in enumerate(stream):
            cut = frozenset() if number % 3 else frozenset([guards[number % len(guards)]]) if guards else frozenset()
            cuts += bool(cut)
            a = signature(ref, value, cut)
            b = signature(fast, value, cut)
            if a != b:
                mismatches.append(dict(number=number, input_sha256=sha(value), cut=sorted(cut)))
            if not a:
                accepted += 1
            else:
                refused += 1
            if bool(a) != (not fast.is_valid(value)) and not cut:
                mismatches.append(dict(number=number, kind='is_valid', input_sha256=sha(value)))
        report['roots'][root] = dict(instances=len(stream), accepted=accepted, refused=refused, with_clause_cut=cuts, cut_guards=len(guards),
                                     mismatches=mismatches, seeds_match_dump=f'{seed_match}/{len(entry["seeds"])}',
                                     seconds=round(time.monotonic() - start, 1), memo_stats=dict(STATS))
        print(root[:60], json.dumps(report['roots'][root])[:400], file=sys.stderr, flush=True)
    Path(args.out).write_text(json.dumps(report, indent=1, sort_keys=True) + '\n')
    bad = sum(len(r['mismatches']) for r in report['roots'].values())
    return 1 if bad else 0


def _guards(v, value):
    out = set()
    def visit(errors):
        for e in errors:
            if getattr(e, 'oracle_guard', None):
                out.add(e.oracle_guard)
            visit(e.context or ())
    visit(v.iter_errors(value))
    return out


def bench(args):
    data = load(args.dump, args.roots)
    out = {}
    for root, entry in data['roots'].items():
        ref = rebuild(entry)
        fast = rebuild(entry, memo=True)
        rng = random.Random(args.seed)
        stream = instance_stream(ref, entry['seeds'], args.count, rng)
        row = {}
        for name, v in (('reference', ref), ('memo', fast)):
            start = time.perf_counter()
            for value in stream:
                list(v.iter_errors(value))
            took = time.perf_counter() - start
            row[name] = dict(validations=len(stream), seconds=round(took, 2), ms_per_validation=round(1000 * took / len(stream), 2))
        row['speedup'] = round(row['reference']['ms_per_validation'] / max(row['memo']['ms_per_validation'], 1e-6), 1)
        out[root] = row
        print(root[:60], json.dumps(row), file=sys.stderr, flush=True)
    Path(args.out).write_text(json.dumps(dict(tool_sha256=TOOL_SHA256, roots=out, memo_stats=dict(STATS)), indent=1) + '\n')
    return 0


# ---------------------------------------------------------------- close (GO's loop, memoized validator, reaching controls first)

SAMPLED = collections.Counter()
DONORS = [None]  # GO2: a Donors index in the residual pass
REACHING = [False]  # GO2: the clause being searched has a control that reaches it
RESIDUAL = [False]  # GO2: this is a residual pass
MISMATCHES = []
CONTROL_STORE = {}  # GO2: sha256 -> control, for every control a witness was found on (replayed on the reference validator)
ORDERING = collections.Counter()


def reaching(cl, v, control, reach, cache, ci):
    """GO2: does this control hold the reach's location with every union alternative and branch on the way taken (the
    clause node is evaluated there and its verdict counts)? Ordering only: the witness test is GO's, unchanged."""
    deepest = max([c[1] for c in reach['ctx']] or [0])
    ctx_id = tuple(cl.ctx_key(c) for c in reach['ctx'])
    for path in cl.concrete(control, reach['ipath']):
        key = (ci, ctx_id, path[:deepest])
        if key not in cache:
            ok = True
            for kind, depth, index, owner, resolver, obj in reach['ctx']:
                try:
                    at = cl.get(control, path[:depth])
                except (KeyError, IndexError, TypeError):
                    ok = False
                    break
                ORDERING['validations'] += 1
                if kind in ('anyOf', 'oneOf'):
                    ok = cl.holds(v, owner[kind][index], at, resolver)
                elif kind in ('then', 'else'):
                    ok = cl.holds(v, owner['if'], at, resolver) == (kind == 'then')
                else:
                    ok = False
                if not ok:
                    break
            cache[key] = ok
        if cache[key]:
            return True
    return False


def order(cl, v, pool, reaches, cache, ids, limit=80):
    """Controls holding one of the clause's reaches first (in their pool order), then the rest unchanged."""
    first, rest = [], []
    for number, control in enumerate(pool):
        ci = ids.setdefault(id(control), (control, len(ids)))[1]
        if number < limit and any(reaching(cl, v, control, r, cache, ci) for r in reaches):
            first.append(control)
        else:
            rest.append(control)
    ORDERING['reordered' if first else 'no_reaching_control'] += 1
    return first + rest, bool(first)


def search_clause(cl, clause, keyword, location, info, node, ident, v, nodes, seeds, controls, known, branch_controls, by_ipath,
                  budget, root0, deadline):
    """GO's search_clause (scripts/pm_goal_go_schema_closure.py at 5f1f1829f2), unchanged apart from the GO2 lines marked:
    a witness records the control's sha256 and the exact (path, edit) as a replay token, and the control is kept in
    CONTROL_STORE, so every witness can be rebuilt and judged again by the reference validator."""
    COUNT, CLAUSE_CAP, COVERED_EXTRA, APART = cl.COUNT, cl.CLAUSE_CAP, cl.COVERED_EXTRA, cl.APART
    best = None
    attempts = 0
    spent = 0
    start = COUNT[0]
    out_of_time = deadline is not None and time.monotonic() > deadline
    covered_at = None
    reaches = [r for r in info['reach'] if not any(c[0] in APART for c in r['ctx'])][:6] if not out_of_time else []
    donated = {}
    if DONORS[0] is not None and reaches and not REACHING[0]:  # GO2 addition: donor constructions for every reach first
        # (only for a clause no existing control reaches; a reaching control goes straight to GO's defects)
        # adaptive shares (what one reach leaves unused flows to the next); a residual pass gives the donor stage two
        # thirds of the cap, because GO's own pools already ran in full for these clauses in the earlier pass
        total = (2 * CLAUSE_CAP[0]) // 3 if RESIDUAL[0] else CLAUSE_CAP[0] // 3
        promise = {id(r): max([plausible(cl, c, r) for c in list(controls)[:120]] or [0]) for r in reaches}
        for number, reach in enumerate(sorted(reaches, key=lambda r: -promise[id(r)])):  # most promising reach first
            left = total - (COUNT[0] - start)
            if left <= 0:
                break
            try:
                share = min(left, max(left // (len(reaches) - number), 250))  # enough for one reach to finish an entry
                donated[id(reach)] = donor_controls(cl, v, reach, seeds, controls, DONORS[0], by_ipath, share)
            except Exception as exc:  # noqa: BLE001 - a failed construction attempt (counted)
                STATS['donor_error:' + type(exc).__name__] += 1
                donated[id(reach)] = []
            if donated[id(reach)]:
                break  # one reach with a built control is enough to test the clause's defects
    reaches = sorted(reaches, key=lambda r: not donated.get(id(r)))  # GO2: a reach with built controls is searched first
    pools_start = COUNT[0]  # GO2: GO's suite share (half the cap) is measured from here, after the donor pre-pass
    for reach in reaches:
        pools = [(c, 'donated') for c in donated.get(id(reach), [])] + [(c, None) for c in controls[:40]]
        for variant in range(4):
            for control in seeds[:6]:
                pools.append((control, variant))
        pools.append((None, 'swap'))
        position = -1
        for control, variant in pools:
            position += 1
            if COUNT[0] - root0 > budget or COUNT[0] - start > CLAUSE_CAP[0] or (
                    covered_at is not None and COUNT[0] - covered_at > COVERED_EXTRA):
                break
            if variant is None and COUNT[0] - pools_start > CLAUSE_CAP[0] // 2:
                continue
            if variant == 'swap':
                if best is None:
                    pools.extend((candidate, 'swapped') for candidate in cl.swap_candidates(v, controls, reach))
                continue
            if variant is None or variant in ('swapped', 'donated'):
                paths = list(cl.concrete(control, reach['ipath']))
                base = control
                if variant in ('swapped', 'donated'):
                    attempts += 1
                    fingerprint = hashlib.sha256(pickle.dumps(base, protocol=5)).hexdigest()
                    if fingerprint not in known:
                        known.add(fingerprint)
                        controls.append(base)
                        branch_controls.append(dict(clause=clause, variant='swap' if variant == 'swapped' else 'donor', sha256=fingerprint))
            else:
                attempts += 1
                try:
                    base, path = cl.realize(control, reach, variant, v)
                except Exception:  # noqa: BLE001
                    continue
                if base is None:
                    continue
                spent += 1
                if cl.errors_of(v, base):
                    parents = [(n, res) for loc2, n, res in by_ipath.get(reach['ipath'][:-1], []) if 'properties' in n]
                    realized = base
                    try:
                        base = cl.repair(v, base, path, parents)
                    except Exception:  # noqa: BLE001
                        base = None
                    spent += 8
                    if base is None:
                        try:
                            base = cl.error_repair(v, realized, path)
                            if base is None:
                                base = cl.flip_repair(v, realized, path, reach['ipath'], by_ipath)
                        except Exception:  # noqa: BLE001
                            base = None
                    if base is None:
                        continue
                paths = [path]
                fingerprint = hashlib.sha256(pickle.dumps(base, protocol=5)).hexdigest()
                if fingerprint not in known:
                    known.add(fingerprint)
                    controls.append(base)
                    branch_controls.append(dict(clause=clause, variant=variant, sha256=fingerprint))
            for path in paths[:2]:
                try:
                    here = cl.get(base, path)
                except (KeyError, IndexError, TypeError):
                    continue
                for edit in cl.defects(keyword, node, here) + cl.siblings(location, reach['ipath'], by_ipath):
                    mutated = cl.apply(base, path, edit)
                    if mutated is None:
                        continue
                    spent += 1
                    try:
                        errs = cl.errors_of(v, mutated)
                    except Exception:  # noqa: BLE001
                        continue
                    failing = cl.locations(errs)
                    if clause not in failing:
                        continue
                    cut = cl.errors_of(v, mutated, {ident})
                    tops = sorted({common_locations().get(getattr(e, 'oracle_guard', None)) for e in errs} - {None})
                    control_sha = hashlib.sha256(pickle.dumps(base, protocol=5)).hexdigest()  # GO2
                    witness = dict(path=[str(p) for p in path], edit=repr(edit)[:80], top_level=tops,
                                   input_sha256=hashlib.sha256(pickle.dumps(mutated, protocol=5)).hexdigest(),
                                   input_value_sha256=value_sha(mutated),  # GO2
                                   control='suite' if variant is None else 'swap' if variant == 'swapped' else 'donor' if variant == 'donated' else 'branch',
                                   control_sha256=control_sha,  # GO2
                                   replay=base64.b64encode(pickle.dumps((tuple(path), edit), protocol=5)).decode())  # GO2
                    if not cut:
                        restored = cl.errors_of(v, mutated)
                        if restored:
                            best = dict(cls='KILLED', **witness)
                            CONTROL_STORE.setdefault(control_sha, copy.deepcopy(base))  # GO2
                            break
                    elif best is None:
                        later = cl.locations(cut)
                        leaves = sorted(x for x in later if x.rsplit('/', 1)[-1] not in ('anyOf', 'oneOf') and not
                                        re.search(r'/(anyOf|oneOf)/\d+/type$', x))
                        covered_at = COUNT[0]
                        best = dict(cls='COVERED_LATER', still_refused_by=(leaves or sorted(later))[:4],
                                    same_node=any(x.rsplit('/', 1)[0] == location for x in leaves), **witness)
                        CONTROL_STORE.setdefault(control_sha, copy.deepcopy(base))  # GO2
                if best and best['cls'] == 'KILLED':
                    break
            if best and best['cls'] == 'KILLED':
                break
        if best and best['cls'] == 'KILLED':
            break
    if best is None:
        proof = cl.contradicted_branch(info, nodes) or cl.forbidden_member(info, nodes) or cl.excluded_by_cases(info, nodes)
        if proof:
            best = dict(cls='UNREACHABLE', proof=proof)
        else:
            pinned = cl.pinned_proof(info, nodes, v, keyword)
            if pinned:
                best = pinned
    return best or (dict(cls='UNCOVERED', not_searched='wall-clock budget (--root-seconds) spent before this clause')
                    if out_of_time else dict(cls='UNCOVERED', construction_attempts=attempts))


def install_fixes(cl):
    """GO2 fix (defect 1 of this lane): GO's deref() keeps the enclosing document's resolver when it steps onto a
    subschema that carries its own `$id`. JSON Schema 2020-12 section 8.2.1: "The presence of "$id" in a subschema
    indicates that the subschema constitutes a distinct schema resource" and its URI "serves as the base URI for
    relative URI-references in keywords within the schema resource"; section 8.2.3.1: `$ref` "Resolved against the
    current URI base, it produces the URI of the schema to apply." The validator does this (jsonschema descend:
    resolver.in_subresource(create_resource(schema))). GO's null_at (inside scope_of, used by every static proof)
    and gen/realize called deref with the parent base, so `#/$defs/CommandOutcomeRecord` inside the embedded
    `pm.storage_value.restore_point_create_result.v1` resource was looked up in pm.restore_point.retained_read.v1
    (PointerToNowhere: GO's 15 erroring clauses), and branch constructions under an embedded resource failed."""
    from urllib.parse import urljoin
    from referencing.jsonschema import DRAFT202012
    original = cl.deref

    def own(node, resolver):
        if isinstance(node, dict) and isinstance(node.get('$id'), str) and resolver is not None:
            if urljoin(resolver._base_uri, node['$id']) != resolver._base_uri:
                return resolver.in_subresource(DRAFT202012.create_resource(node))
        return resolver

    looked = {}

    def lookup(resolver, ref):  # the same pure-function memo as the validator's (tool side: construction and proofs)
        key = (id(resolver._registry), resolver._base_uri, id(resolver._previous), ref)
        hit = looked.get(key)
        if hit is None or hit[0] is not resolver._registry or hit[1] is not resolver._previous:
            hit = looked[key] = (resolver._registry, resolver._previous, resolver.lookup(ref))
        return hit[2]

    def deref(node, resolver, seen=None):
        seen = seen or set()
        resolver = own(node, resolver)
        while isinstance(node, dict) and '$ref' in node and len(node) <= 2:
            if node['$ref'] in seen:
                break
            seen.add(node['$ref'])
            resolved = lookup(resolver, node['$ref'])
            node, resolver = resolved.contents, own(resolved.contents, resolved.resolver)
        return node, resolver
    deref.go_original = original
    cl.deref = deref
    return deref


def self_test(args):
    """GO2 standing trials: the deref fix, the memo validator's frame reset, and the dangling-ref clauses' reach."""
    import pm_goal_go_schema_closure as cl
    import pm_goal_oracle_common as common
    from referencing import Registry
    from referencing.jsonschema import DRAFT202012
    out = {}
    # 1. an embedded resource with its own $defs: the reference validator resolves the inner ref against the inner base;
    #    GO's deref does not, the GO2 deref does.
    doc = {'$id': 'urn:outer', 'type': 'object', 'properties': {'x': {'$id': 'urn:inner', 'type': 'object',
           'properties': {'a': {'$ref': '#/$defs/A'}}, '$defs': {'A': {'type': 'string', 'minLength': 1}}}}}
    reg = Registry().with_resources([('urn:outer', DRAFT202012.create_resource(common.runtime_schema(doc)))])
    v = common.StrictValidator(common.runtime_schema(doc), registry=reg, _resolver=reg.resolver('urn:outer'), format_checker=common.FORMATS)
    assert v.is_valid({'x': {'a': 'z'}}) and not v.is_valid({'x': {'a': ''}}), 'validator: inner base'
    a_node = v.schema['properties']['x']['properties']['a']
    try:
        cl.deref(v.schema['properties']['x'], v._resolver)[0]
        cl.null_at(v.schema, v._resolver, ('x', 'a'))
        go_raises = False
    except Exception:  # noqa: BLE001
        go_raises = True
    fixed = install_fixes(cl)
    try:
        go_null = cl.null_at(v.schema, v._resolver, ('x', 'a'))
        target, res = fixed(a_node, fixed(v.schema['properties']['x'], v._resolver)[1])
        assert target.get('minLength') == 1 and res._base_uri == 'urn:inner'
    finally:
        cl.deref = fixed.go_original
    out['inline_id_deref'] = dict(go_null_at_raises=go_raises, go2_null_at=go_null, go2_target_base='urn:inner')
    assert go_raises and go_null is False
    # 2. memo frame reset: an in-place edit between two top-level validations is seen.
    memo = memo_class(common.StrictValidator)(common.runtime_schema({'type': 'object', 'properties': {'a': {'type': 'string'}}}),
                                              format_checker=common.FORMATS)
    value = {'a': 'x'}
    first = memo.is_valid(value)
    value['a'] = 7
    second = memo.is_valid(value)
    errors = list(memo.iter_errors(value))
    assert first and not second and errors, 'memo: in-place edit between validations'
    out['memo_in_place_edit'] = dict(before=first, after=second, errors=len(errors))
    # 3. type tags: 1, 1.0 and True are different instances to the interner.
    memo2 = memo_class(common.StrictValidator)(common.runtime_schema({'type': 'integer'}), format_checker=common.FORMATS)
    verdicts = [memo2.is_valid(x) for x in (1, 1.0, True, 1)]
    reference = [common.StrictValidator(common.runtime_schema({'type': 'integer'}), format_checker=common.FORMATS).is_valid(x)
                 for x in (1, 1.0, True, 1)]
    assert verdicts == reference, (verdicts, reference)
    out['memo_type_tags'] = dict(memo=verdicts, reference=reference)
    # 3b. the GO2 vacuous rules agree with the validator's own keyword functions on varied instances
    probes = [{}, {'a': 1}, [], [1, 1], [None, None], 'x', 7, None]
    for schema in ({'required': []}, {'uniqueItems': False}, {'dependentRequired': {'a': []}}):
        keyword = next(iter(schema))
        assert vacuous_go2(keyword, schema)
        vv = common.StrictValidator(common.runtime_schema(schema), format_checker=common.FORMATS)
        assert all(vv.is_valid(x) for x in probes), schema
    out['vacuous_rules'] = dict(schemas=3, probes=len(probes), all_valid=True)
    # 4. the 35d6 dangling-ref clauses: every authored seed validates through the embedded $ref, and a defect at
    #    original_command_outcome is refused inside CommandOutcomeRecord (the ref is evaluated, not dangling).
    if args.dump:
        data = load(args.dump, ['35d68755'])
        for root, entry in data['roots'].items():
            ref = rebuild(entry)
            seed = entry['seeds'][0]
            assert all(ref.is_valid(s) for s in entry['seeds'])
            mutated = copy.deepcopy(seed)
            mutated['creation_result']['value']['original_command_outcome'] = 7
            locs = sorted(cl.locations(cl.errors_of(ref, mutated)))
            hit = [x for x in locs if '$defs/CommandOutcomeRecord' in x]
            assert hit, locs[:5]
            out['dangling_ref_reached'] = dict(root=root, seeds_valid=len(entry['seeds']), refused_at=hit[:3])
    print(json.dumps(out, indent=1))
    if args.out:
        Path(args.out).write_text(json.dumps(dict(tool_sha256=TOOL_SHA256, trials=out, result='PASS'), indent=1) + '\n')
    return 0


def _intern_gc(value):
    if isinstance(value, dict):
        return {(sys.intern(k) if k == 'gc' else k): _intern_gc(x) for k, x in value.items()}
    if isinstance(value, list):
        return [_intern_gc(x) for x in value]
    return sys.intern(value) if value == 'gc' and isinstance(value, str) else value


def verify(args):
    """Replay every GO2 witness (a clause entry with a replay token) on the reference validator, with no memo:
    the control is accepted; control + (path, edit) rebuilds an input with the recorded sha256; the input is refused
    and the clause is among the refusing locations; KILLED: with only the clause cut it is accepted and restored it is
    refused again; COVERED_LATER: with the clause cut it is still refused, by the clauses named."""
    import gzip
    import pm_goal_go_schema_closure as cl
    import pm_goal_oracle_common as common
    report = json.loads(Path(args.report).read_text())
    store = pickle.loads(gzip.decompress(Path(str(args.report) + '.controls.pkl.gz').read_bytes()))
    data = load(args.dump, [report['root']])
    (root, entry), = data['roots'].items()
    ref = rebuild(entry)
    accepted_controls = {}
    rows = [(c, x) for c, x in sorted(report['clauses'].items()) if x.get('replay') and x['cls'] in ('KILLED', 'COVERED_LATER')]
    part, total = map(int, args.shard.split('/'))
    rows = rows[part::total]
    results = collections.Counter()
    fingerprints = collections.Counter()
    fingerprint_mismatch = []
    failures = []
    start = time.monotonic()
    for number, (clause, x) in enumerate(rows):
        problem = None
        control = store.get(x['control_sha256'])
        if control is None:
            problem = 'control not in store'
        else:
            if x['control_sha256'] not in accepted_controls:
                accepted_controls[x['control_sha256']] = not cl.errors_of(ref, control)
            if not accepted_controls[x['control_sha256']]:
                problem = 'control refused by the reference validator'
        if problem is None:
            path, edit = pickle.loads(base64.b64decode(x['replay']))
            mutated = cl.apply(control, path, edit)
            ident = common.guard_for_location(clause)
            if mutated is not None:  # the fingerprint is reported apart; the validity checks below always run
                if x.get('input_value_sha256'):
                    fingerprints[('value' if value_sha(mutated) == x['input_value_sha256'] else 'value_mismatch')] += 1
                elif sha(mutated) == x['input_sha256']:
                    fingerprints['pickle'] += 1
                elif sha(_intern_gc(mutated)) == x['input_sha256']:
                    fingerprints['pickle_after_interning_gc'] += 1
                else:
                    fingerprints['pickle_identity_mismatch'] += 1
                    fingerprint_mismatch.append(clause)
            if mutated is None:
                problem = 'replay token does not apply to the control'
            else:
                errs = cl.errors_of(ref, mutated)
                if not errs or clause not in cl.locations(errs):
                    problem = 'input not refused at the clause'
                else:
                    cut = cl.errors_of(ref, mutated, {ident})
                    if x['cls'] == 'KILLED':
                        if cut:
                            problem = 'cut does not accept'
                        elif not cl.errors_of(ref, mutated):
                            problem = 'restoration does not refuse'
                    elif not cut:
                        problem = 'COVERED_LATER but the cut accepts'
                    elif not set(x['still_refused_by']) <= cl.locations(cut):
                        problem = 'COVERED_LATER: named clauses not among the remaining refusals'
        results['fail' if problem else 'pass'] += 1
        results[x['cls'] + ('_fail' if problem else '_pass')] += 1
        if problem:
            failures.append(dict(clause=clause, cls=x['cls'], problem=problem))
        if number % 200 == 0:
            print(f'{number}/{len(rows)} {dict(results)} {time.monotonic() - start:.0f}s', file=sys.stderr, flush=True)
    out = dict(tool_sha256=TOOL_SHA256, report=str(args.report), report_sha256=hashlib.sha256(Path(args.report).read_bytes()).hexdigest(),
               root=root, shard=args.shard, validator='reference (no memo): ' + entry['cls'], witnesses=len(rows),
               controls_checked=len(accepted_controls), controls_accepted=sum(accepted_controls.values()), results=dict(results),
               input_fingerprints=dict(fingerprints), fingerprint_note='value: input_value_sha256 matches; pickle: GO\'s pickle '
               'input_sha256 matches; pickle_after_interning_gc: matches once equal \'gc\' strings are one object again (pickle '
               'encodes object identity); pickle_identity_mismatch: neither (validity checks still decide)',
               fingerprint_identity_mismatch=fingerprint_mismatch,
               failures=failures, seconds=round(time.monotonic() - start, 1))
    Path(args.out).write_text(json.dumps(out, indent=1, sort_keys=True) + '\n')
    print(json.dumps({k: v for k, v in out.items() if k != 'failures'}))
    return 1 if failures else 0


# ---------------------------------------------------------------- GO2 donor construction (residual clauses only)

class Donors:
    """Real accepted sub-values: every member value, at every depth, of every accepted authored seed of every dumped
    root (the frozen restore_point.deleted roots share their owner definitions), indexed by member name; distinct by
    sha256. A donor is only ever used where the owner node at that location accepts it (checked by validation)."""

    def __init__(self, seed_lists):
        self.by_name = collections.defaultdict(dict)
        self.items = collections.defaultdict(dict)
        for seeds in seed_lists:
            for seed in seeds:
                self._index(seed, None)

    def _index(self, value, name):
        if isinstance(value, dict):
            for k, x in value.items():
                self.by_name[k].setdefault(sha(x), x)
                self._index(x, k)
        elif isinstance(value, list):
            for x in value:
                if name is not None:
                    self.items[name].setdefault(sha(x), x)
                self._index(x, name)

    def candidates(self, name, limit=24):
        pool = list(self.by_name.get(name, {}).values()) if isinstance(name, str) else []
        return pool[:limit]


def donor_repair(cl, v, value, keep, donors, rounds=12, tries=24):
    """GO's error_repair with donors: each round takes the deepest failing nodes the owner validator reports; a missing
    required member is filled from donors of that member name the member's subschema accepts; an unexpected member is
    removed; any other failing node (outside the realized member `keep` and its ancestors) is replaced by the first
    donor of its member name the failing subschema accepts, else by GO's generated value. Returns an accepted value
    or None."""
    value = copy.deepcopy(value)
    keep = tuple(keep)
    for _ in range(rounds):
        errs = cl.errors_of(v, value)
        if not errs:
            return value
        changed = False
        for error in sorted(errs, key=lambda e: -len(e.absolute_path))[:8]:
            where = tuple(error.absolute_path)
            if where == keep[:len(where)] and error.validator not in ('required', 'additionalProperties', 'unevaluatedProperties'):
                continue
            node = error.schema if isinstance(error.schema, dict) else {}
            resolver = cl.RESOLVERS.get(id(node), v._resolver)
            try:
                target = cl.get(value, where)
            except (KeyError, IndexError, TypeError):
                continue
            if error.validator == 'required' and isinstance(target, dict):
                for name in error.validator_value:
                    if name in target:
                        continue
                    sub = node.get('properties', {}).get(name, {})
                    pick = next((d for d in donors.candidates(name, tries) if cl.holds(v, sub, d, cl.RESOLVERS.get(id(sub), resolver))), NONE)
                    target[name] = copy.deepcopy(pick) if pick is not NONE else cl.gen(sub, resolver, 0, 0)
                    changed = True
            elif error.validator in ('additionalProperties', 'unevaluatedProperties') and isinstance(target, dict):
                allowed = set(node.get('properties', {}))
                for name in [k for k in target if k not in allowed and not any(re.search(pat, k) for pat in node.get('patternProperties', {}))]:
                    if where + (name,) != keep[:len(where) + 1]:
                        del target[name]
                        changed = True
            elif where != keep[:len(where)] and where:
                name = where[-1]
                pick = next((d for d in donors.candidates(name, tries) if d != target and cl.holds(v, node, d, resolver)), NONE)
                replacement = copy.deepcopy(pick) if pick is not NONE else cl.gen(node, resolver, 0, 0)
                if replacement != target:
                    value = cl.put(value, where, replacement)
                    changed = True
        if not changed:
            return None
    return value if not cl.errors_of(v, value) else None


def takes(cl, v, value, reach):
    """The value holds the reach's location with every union alternative and conditional branch on the way taken."""
    for path in cl.concrete(value, reach['ipath']):
        ok = True
        for kind, depth, index, owner, resolver, obj in reach['ctx']:
            at = cl.get(value, path[:depth])
            if kind in ('anyOf', 'oneOf'):
                ok = cl.holds(v, owner[kind][index], at, resolver)
            elif kind in ('then', 'else'):
                ok = cl.holds(v, owner['if'], at, resolver) == (kind == 'then')
            if not ok:
                break
        if ok:
            return True
    return False


def donor_controls(cl, v, reach, seeds, controls, donors, by_ipath, budget_left, limit=4):
    """GO2 addition for a residual clause: GO's realize() (create the members on the way, force the conditions on the
    way) from real controls, then donor_repair; also selector flips on the way (GO's flip candidates) then donor_repair.
    Only values the whole definition accepts are returned."""
    out = []
    start = cl.COUNT[0]
    pool = list(seeds[:8]) + [c for c in controls[-8:] if all(c is not s for s in seeds[:8])]
    # GO2: branch entry from every distinct control (protected selectors), scored by the errors left; the three closest
    # are greedily repaired. Distinct: one control per signature of the enum/boolean members on the way.
    entered, signatures = [], set()
    ranked = diverse(cl, list(controls)[:400], reach)
    ranked = sorted(ranked, key=lambda c: -plausible(cl, c, reach))  # stable: diversity order within a score
    for control in ranked[:200]:
        if cl.COUNT[0] - start > (2 * budget_left) // 3:
            break
        try:
            built = enter_light(cl, v, control, reach, donors, by_ipath)
        except Exception:  # noqa: BLE001 - a failed construction attempt
            built = None
        if not built:
            continue
        base, protect = built
        signature = sha(base)
        if signature in signatures:
            continue
        signatures.add(signature)
        score, _ = _score(cl, v, base)
        entered.append((score, len(entered), base, protect))
        if score == (0, 0):
            break  # an entered control the definition already accepts
    for score, _, base, protect in sorted(entered, key=lambda x: (x[0], x[1]))[:3]:
        if cl.COUNT[0] - start > budget_left or len(out) >= limit:
            break
        try:
            built = base if score == (0, 0) else greedy_repair(cl, v, base, protect, donors,
                                                               budget=min(300, budget_left - (cl.COUNT[0] - start)))
        except Exception:  # noqa: BLE001
            built = None
        if built is not None and not cl.errors_of(v, built) and takes(cl, v, built, reach):
            out.append(built)
            break
    for control in pool:
        for variant in range(4):
            if cl.COUNT[0] - start > budget_left or len(out) >= limit:
                return out
            try:
                base, path = cl.realize(control, reach, variant, v)
                if base is None:
                    continue
                realized = base
                if cl.errors_of(v, base):
                    base = donor_repair(cl, v, base, path, donors)
                if base is None and variant == 0:  # GO's selector flips (ancestors of the realized member), then donors
                    for prefix, k, choices in cl.selectors_of(path, reach['ipath'], by_ipath)[:12]:
                        for choice in choices:
                            if cl.COUNT[0] - start > budget_left:
                                break
                            candidate = copy.deepcopy(realized)
                            try:
                                target = cl.get(candidate, prefix)
                            except (KeyError, IndexError, TypeError):
                                continue
                            if not isinstance(target, dict) or target.get(k) == choice:
                                continue
                            target[k] = copy.deepcopy(choice)
                            base = donor_repair(cl, v, candidate, path, donors, rounds=8)
                            if base is not None:
                                break
                        if base is not None:
                            break
            except Exception:  # noqa: BLE001 - a failed construction attempt
                base = None
            if base is not None and not cl.errors_of(v, base) and takes(cl, v, base, reach):
                out.append(base)
    return out


def merge_shards(args):
    """Join one root's shard reports into a GO-format closure report (one root), so GO's own `--merge` can combine it
    with GO's other roots; the controls stores are joined too (witness replay)."""
    import gzip
    reports = [json.loads(Path(x).read_text()) for x in args.reports]
    roots = {r['root'] for r in reports}
    if len(roots) != 1:
        raise SystemExit(f'reports name {len(roots)} roots')
    root = roots.pop()
    total = {r['clauses_in_root'] for r in reports}
    clauses = {}
    for r in reports:
        for c, x in r['clauses'].items():
            if c in clauses:
                raise SystemExit(f'clause in two shards: {c}')
            clauses[c] = dict(x, go2_report=Path(args.reports[reports.index(r)]).name)
    if len(total) != 1 or len(clauses) != total.pop():
        raise SystemExit(f'shards cover {len(clauses)} clauses, root has {reports[0]["clauses_in_root"]}')
    store = {}
    for x in args.reports:
        path = Path(str(x) + '.controls.pkl.gz')
        if path.exists():
            store.update(pickle.loads(gzip.decompress(path.read_bytes())))
    first = reports[0]
    base = json.loads(Path(args.base).read_text())
    counts = collections.Counter(x['cls'] for x in clauses.values())
    entry = dict(kind=first['kind'], rows=first['rows'], sites=first['sites'], families=first['families'], seeds=first['seeds'],
                 seed_sha256=first['seed_sha256'], seed_policy='authored', branch_controls=[b for r in reports for b in r['branch_controls']],
                 validations=sum(r['validations'] for r in reports), counts=dict(counts), clauses=clauses,
                 unresolved_refs=sorted({json.dumps(u, sort_keys=True) for r in reports for u in r['unresolved_refs']}),
                 search_limits=dict(clause_cap=first['args']['clause_cap'], root_seconds=0, distinct_from=first['args']['distinct_from'],
                                    note='GO2: no wall-clock bound; GC per-clause cap'),
                 budget_args=dict(per_clause=first['args']['clause_cap'], clause_cap=first['args']['clause_cap'], root_seconds=0,
                                  seed_cap=first['dump_meta']['seed_cap']),
                 go2=dict(reports=[dict(file=Path(x).name, sha256=hashlib.sha256(Path(x).read_bytes()).hexdigest(), shard=r['clause_shard'],
                                        tool_history=r.get('tool_history'), validator=r['validator'], seconds=r['seconds'],
                                        sampled_agreement=r.get('sampled_agreement'), memo_stats=r.get('memo_stats'), ordering=r.get('ordering'),
                                        args=r['args']) for x, r in zip(args.reports, reports)],
                          seconds=round(sum(r['seconds'] for r in reports), 1)))
    out = dict(method=base['method'], adapted_from=base['adapted_from'], calls=base.get('calls'), failures=base.get('failures'),
               roots={root: entry}, shard='go2:' + root[:24], all_roots=base['all_roots'], seed_policy='authored',
               closure_tool_sha256=TOOL_SHA256, native_execution='NOT_RUN')
    Path(args.out).write_text(json.dumps(out, indent=1, sort_keys=True, default=str) + '\n')
    Path(str(args.out) + '.controls.pkl.gz').write_bytes(gzip.compress(pickle.dumps(store, protocol=5)))
    print(json.dumps(dict(root=root[:40], clauses=len(clauses), counts=dict(counts), controls=len(store))))
    return 0


def spine_copy(value, path):
    """A copy of value in which only the containers on `path` (root included) are new; every other subtree is shared.
    Safe here because nothing mutates a shared subtree: the repair edits only the copied spine, and GO's constructions
    deep-copy a control before they edit it."""
    root = copy.copy(value)
    node = root
    for part in path:
        child = copy.copy(node[part])
        node[part] = child
        node = child
    return root


def _score(cl, v, value):
    errs = cl.errors_of(v, value)
    def size(es):
        return sum(1 + size(e.context or ()) for e in es)
    return (len(errs), size(errs)), errs


def _protected(where, protect):
    """A failing location the repair must not overwrite: a forced selector member, the realized member, or an ancestor."""
    return any(where == p[:len(where)] for p in protect)


def greedy_repair(cl, v, value, protect, donors, rounds=14, tries=10, budget=600):
    """GO2 addition: repair toward a value the whole definition accepts. Each round takes the deepest failing node not
    protected; candidates are the failing subschema's own const/enum values, null, removal of an optional member, real
    donor values of that member name and GO's generated values; the candidate leaving the fewest errors is kept, only if
    it lowers the error count. Returns (accepted value or None)."""
    start = cl.COUNT[0]
    value = copy.deepcopy(value)
    best, errs = _score(cl, v, value)
    for _ in range(rounds):
        if not errs:
            return copy.deepcopy(value)
        if cl.COUNT[0] - start > budget:
            return None
        improved = False
        leaves = []
        def flatten(es):  # a union's refusal is repaired through the failures inside its alternatives
            for e in es:
                if e.context and e.validator in ('anyOf', 'oneOf'):
                    flatten(e.context)
                else:
                    leaves.append(e)
        flatten(errs)
        for error in sorted(leaves, key=lambda e: -len(e.absolute_path))[:8]:
            where = tuple(error.absolute_path)
            node = error.schema if isinstance(error.schema, dict) else {}
            resolver = cl.RESOLVERS.get(id(node), v._resolver)
            try:
                target = cl.get(value, where)
            except (KeyError, IndexError, TypeError):
                continue
            options = []
            if error.validator == 'required' and isinstance(target, dict):
                for name in error.validator_value:
                    if name in target:
                        continue
                    sub = node.get('properties', {}).get(name, {})
                    for d in donors.candidates(name, tries) + [cl.gen(sub, resolver, 0, 0), cl.gen(sub, resolver, 0, 1), None]:
                        options.append(('set', where + (name,), d))
            elif error.validator in ('additionalProperties', 'unevaluatedProperties') and isinstance(target, dict):
                allowed = set(node.get('properties', {}))
                extra = [k for k in target if k not in allowed and not any(re.search(pat, k) for pat in node.get('patternProperties', {}))]
                options.append(('drop', where, extra))
            elif where and not _protected(where, protect):
                pool = []
                for word in ('const',):
                    if word in node:
                        pool.append(node[word])
                pool += list(node.get('enum', []))[:8]
                pool += [None] + donors.candidates(where[-1], tries)
                for variant in (0, 1):
                    try:
                        pool.append(cl.gen(node, resolver, 0, variant))
                    except Exception:  # noqa: BLE001
                        pass
                for d in pool:
                    if d != target:
                        options.append(('set', where, d))
                parent = cl.get(value, where[:-1]) if len(where) >= 1 else None
                if isinstance(parent, dict) and isinstance(where[-1], str):
                    options.append(('del', where, None))
            seen = set()
            for kind, at, payload in options[:3 * tries + 8]:
                key = (kind, at, sha(payload))
                if key in seen:
                    continue
                seen.add(key)
                try:
                    if kind == 'set':
                        if not at:
                            candidate = copy.deepcopy(payload)
                        else:
                            candidate = spine_copy(value, at[:-1])
                            cl.get(candidate, at[:-1])[at[-1]] = copy.deepcopy(payload)
                    elif kind == 'del':
                        candidate = spine_copy(value, at[:-1])
                        del cl.get(candidate, at[:-1])[at[-1]]
                    else:
                        candidate = spine_copy(value, at)
                        holder = cl.get(candidate, at)
                        for k in payload:
                            if at + (k,) not in protect:
                                del holder[k]
                except (KeyError, IndexError, TypeError):
                    continue
                score, cerrs = _score(cl, v, candidate)
                if score < best:
                    best, errs, value, improved = score, cerrs, candidate, True
                    if not cerrs:
                        return copy.deepcopy(value)
            if improved:
                break
        if not improved:
            return None
    return value if not errs else None


def _force(cl, v, target, condition, resolver, want, donors, prefix, member_schemas=None):
    """Set the members an `if` reads so it holds (want=True) or fails (want=False). Returns the forced member paths,
    or None when no candidate does it."""
    forced = []
    props = condition.get('properties', {})
    if want:
        for prop, sub in props.items():
            sub, sub_res = cl.deref(sub, resolver)
            if isinstance(target.get(prop), (dict, list, str, int, float, bool)) or target.get(prop) is None:
                if prop in target and cl.holds(v, sub, target.get(prop), sub_res):
                    continue
            if 'const' in sub or 'enum' in sub:
                target[prop] = copy.deepcopy(sub['const'] if 'const' in sub else sub['enum'][0])
            elif isinstance(sub.get('properties'), dict) and isinstance(target.get(prop), dict):
                target[prop] = copy.deepcopy(target[prop])  # never edit a subtree shared with the control
                inner = _force(cl, v, target[prop], sub, sub_res, True, donors, prefix + (prop,))
                if inner is None:
                    return None
                forced += inner
            else:
                pick = next((d for d in donors.candidates(prop) if cl.holds(v, sub, d, sub_res)), NONE)
                if pick is NONE:
                    return None
                target[prop] = copy.deepcopy(pick)
            forced.append(prefix + (prop,))
        for prop in condition.get('required', []):
            if prop not in target:
                return None
        return forced
    # want False: break one member the `if` reads; values the member's own property schemas accept come first
    for prop in list(condition.get('required', [])) + [p for p in props if p not in condition.get('required', [])]:
        sub, sub_res = cl.deref(props.get(prop, {}), resolver)
        own = [(n, r) for n, r in (member_schemas or {}).get(prop, [])]
        def fits_own(x):
            return not own or all(cl.holds(v, n, x, r) for n, r in own)
        pool = donors.candidates(prop, 12) + [None]
        for n, r in own:
            pool += list(cl.deref(n, r)[0].get('enum', []))[:8]
        ranked = sorted(pool, key=lambda x: not fits_own(x)) + ['__remove__']
        for candidate in ranked:
            trial = dict(target)  # only this object's own members change
            if candidate == '__remove__':
                if prop not in trial:
                    continue
                del trial[prop]
            else:
                trial[prop] = copy.deepcopy(candidate)
            if not cl.holds(v, condition, trial, resolver):
                target.clear()
                target.update(trial)
                return [prefix + (prop,)]
    return None


def plausible(cl, control, reach):
    """GO2 ordering only (no validation): how many of the reach's union alternatives and conditional branches this control
    already meets, read from its data (an `if` member's const/enum/null pin against the value there; an alternative's
    type, const or enum against the value at its location), plus how deep the reach's path exists in it."""
    path, node, depth_ok = (), control, 0
    for segment, _, _ in reach['steps']:
        if segment == '#' and isinstance(node, list) and node:
            node, path = node[0], path + (0,)
        elif segment == '*' and isinstance(node, dict) and node:
            key = next(iter(node))
            node, path = node[key], path + (key,)
        elif isinstance(node, dict) and segment in node:
            node, path = node[segment], path + (segment,)
        elif isinstance(node, list) and isinstance(segment, int) and len(node) > segment:
            node, path = node[segment], path + (segment,)
        else:
            break
        depth_ok += 1
    score = depth_ok
    def kind_of(x):
        return ('null' if x is None else 'boolean' if isinstance(x, bool) else 'integer' if type(x) is int else 'number'
                if isinstance(x, float) else 'string' if isinstance(x, str) else 'array' if isinstance(x, list) else 'object')
    for kind, depth, index, owner, resolver, obj in reach['ctx']:
        if depth > len(path):
            continue
        try:
            here = cl.get(control, path[:depth])
        except (KeyError, IndexError, TypeError):
            continue
        if kind in ('then', 'else') and isinstance(here, dict):
            props = cl.deref(owner['if'], resolver)[0].get('properties', {})
            hits = []
            for name, sub in props.items():
                sub = cl.deref(sub, resolver)[0]
                allowed = [sub['const']] if 'const' in sub else sub.get('enum') if isinstance(sub.get('enum'), list) else None
                if allowed is not None and name in here:
                    hits.append(here[name] in allowed)
                elif sub.get('type') and name in here:  # a type pin
                    types = sub['type'] if isinstance(sub['type'], list) else [sub['type']]
                    hits.append(kind_of(here[name]) in types or (kind_of(here[name]) == 'integer' and 'number' in types))
            if hits and (all(hits) if kind == 'then' else not all(hits)):
                score += 2
        elif kind in ('anyOf', 'oneOf'):
            alt = cl.deref(owner[kind][index], resolver)[0]
            kinds = alt.get('type') if isinstance(alt, dict) else None
            kinds = kinds if isinstance(kinds, list) else [kinds] if kinds else (['object'] if isinstance(alt, dict) and 'properties' in alt else [])
            if kinds and kind_of(here) in kinds:
                score += 2
            if isinstance(alt, dict) and isinstance(here, dict):
                for name, sub in alt.get('properties', {}).items():
                    sub = cl.deref(sub, resolver)[0]
                    if 'const' in sub and name in here:
                        score += 1 if here[name] == sub['const'] else -1
    return score


def diverse(cl, controls, reach):
    """Order construction starting points so each distinct selector signature comes first: the short scalar members
    (booleans, null, short strings, small integers) of every object on the reach's path, at depth one below it too."""
    def token(x):  # enum-like values only: booleans, null, short lowercase words (states, outcomes, kinds), never ids
        return x is None or isinstance(x, bool) or (isinstance(x, str) and len(x) <= 32 and re.fullmatch(r'[a-z][a-z_]*', x) is not None)

    near = max(0, len(reach['steps']) - 3)  # only the last three objects on the path: the clause's neighbourhood

    def signature(control):
        out = []
        node, here = control, ()
        for number, segment in enumerate(s for s, _, _ in reach['steps']):
            if isinstance(node, dict) and number >= near:
                for k, x in node.items():
                    if token(x):
                        out.append((here, k, x))
                    elif isinstance(x, dict):
                        out += [(here + (k,), k2, y) for k2, y in x.items() if token(y)]
            if segment in ('#', '*') or not isinstance(node, (dict, list)):
                break
            try:
                node = node[segment]
            except (KeyError, IndexError, TypeError):
                break
            here += (segment,)
        return sha(sorted(map(repr, out)))
    first, rest, seen = [], [], set()
    for control in controls:
        key = signature(control)
        (rest if key in seen else first).append(control)
        seen.add(key)
    return first + rest


def member_schemas(cl, by_ipath, ipath):
    """name -> [(property subschema, resolver)] of every object node reached at this instance path."""
    out = collections.defaultdict(list)
    for _, node, res in by_ipath.get(ipath, []):
        for name, sub in (node.get('properties', {}) if isinstance(node, dict) else {}).items():
            out[name].append((sub, res))
    return out


def _fill_branch(cl, v, target, branch, bres, selectors, at, donors):
    """The taken branch's own members that refuse their current value: a nested pin in place, else const/enum, null,
    a donor or a generated value the member's branch subschema accepts."""
    for q, sub in (branch.get('properties', {}) if isinstance(branch, dict) else {}).items():
        if q not in target or at + (q,) in selectors:
            continue
        sub, sres = cl.deref(sub, bres)
        if cl.holds(v, sub, target[q], sres):
            continue
        if isinstance(target[q], dict) and isinstance(sub.get('properties'), dict) and 'type' not in sub:
            trial = copy.deepcopy(target[q])
            if _force(cl, v, trial, sub, sres, True, donors, at + (q,)) is not None and cl.holds(v, sub, trial, sres):
                target[q] = trial
                continue
        pool = ([sub['const']] if 'const' in sub else []) + list(sub.get('enum', []))[:4] + [None]
        pool += [d for d in donors.candidates(q, 8)]
        try:
            pool.append(cl.gen(sub, sres, 0, 0))
        except Exception:  # noqa: BLE001
            pass
        pick = next((x for x in pool if cl.holds(v, sub, x, sres)), NONE)
        if pick is not NONE:
            target[q] = copy.deepcopy(pick)


def _enter_union(cl, v, value, reach, depth, owner, kind, index, resolver, path, donors, by_ipath, protect, selectors):
    """GO2: a union alternative on the way that the value does not take: a real donor of that member name the
    alternative accepts (else GO's generated alternative); then every conditional of the parent object whose branch
    constrains that member is steered to the branch that accepts it (its selector forced, its members filled)."""
    at = tuple(path[:depth])
    target = cl.get(value, at)
    alternative, ares = cl.deref(owner[kind][index], resolver)
    kinds = alternative.get('type') if isinstance(alternative, dict) else None
    kinds = kinds if isinstance(kinds, list) else [kinds] if kinds else []
    same_shape = (isinstance(target, dict) and ('object' in kinds or (not kinds and 'properties' in alternative))
                  or isinstance(target, list) and 'array' in kinds)
    shallow = False
    if same_shape:  # a container of the alternative's shape is kept unless it fails at the location or a direct member
        cl.COUNT[0] += 1
        try:
            failures = list(v.evolve(schema=alternative, _resolver=ares).iter_errors(target))
        except Exception:  # noqa: BLE001
            failures = []
        shallow = any(len(e.absolute_path) <= 1 for e in failures)
    if (not same_shape or shallow) and not cl.holds(v, alternative, target, ares):
        pool = (donors.candidates(at[-1], 24) if at and isinstance(at[-1], str) else [])
        for variant in (0, 1):
            try:
                pool.append(cl.gen(alternative, ares, 0, variant))
            except Exception:  # noqa: BLE001
                pass
        pick = next((x for x in pool if cl.holds(v, alternative, x, ares)), NONE)
        if pick is NONE and not same_shape:
            return None
        if pick is not NONE:
            value = cl.put(value, at, copy.deepcopy(pick))
        try:
            cl.get(value, tuple(path))
        except (KeyError, IndexError, TypeError):
            return None
    protect.add(at)
    if not at:
        return value
    parent = cl.get(value, at[:-1])
    member = at[-1]
    if not isinstance(parent, dict):
        return value
    _steer(cl, v, parent, member, tuple(reach['ipath'][:depth - 1]), at[:-1], donors, by_ipath, protect, selectors)
    return value


def _steer(cl, v, parent, member, parent_ipath, parent_at, donors, by_ipath, protect, selectors):
    """GO2: choose one value for a selector of the parent object so that, in every conditional of the parent, the branch
    that value decides accepts the member's current value; then fill each decided branch's members. Selectors are
    members the conditionals' `if` read (never the member itself); candidate values are the `if` const/enum values, the
    selector's own enum, its current value and donors; values the selector's own subschemas refuse are skipped."""
    conds = [(n, r) for _, n, r in by_ipath.get(parent_ipath, []) if isinstance(n.get('if'), dict)]
    if not conds:
        return
    own = member_schemas(cl, by_ipath, parent_ipath)

    def branch_of(node, nres, trial):
        condition, cres = cl.deref(node['if'], nres)
        kind = 'then' if cl.holds(v, condition, trial, cres) else 'else'
        return cl.deref(node[kind], nres) if isinstance(node.get(kind), dict) else (None, nres)

    def fits(trial):
        for node, nres in conds:
            branch, bres = branch_of(node, nres, trial)
            sub = branch.get('properties', {}).get(member) if isinstance(branch, dict) else None
            if sub is not None:
                sub, sres = cl.deref(sub, bres)
                if not cl.holds(v, sub, trial[member], sres):
                    return False
        return True
    if fits(parent):
        chosen = None
    else:
        chosen = None
        names = []
        for node, nres in conds:
            for name in cl.deref(node['if'], nres)[0].get('properties', {}):
                if name != member and name not in names:
                    names.append(name)
        for name in names:
            values = [parent.get(name)]
            for node, nres in conds:
                sub = cl.deref(cl.deref(node['if'], nres)[0].get('properties', {}).get(name, {}), nres)[0]
                values += ([sub['const']] if 'const' in sub else []) + list(sub.get('enum', []))
            for sub, res in own.get(name, []):
                values += list(cl.deref(sub, res)[0].get('enum', []))
            values += donors.candidates(name, 8)
            seen = set()
            for x in values:
                key = sha(x)
                if key in seen:
                    continue
                seen.add(key)
                if own.get(name) and not all(cl.holds(v, sub, x, res) for sub, res in own[name]):
                    continue
                trial = dict(parent)
                trial[name] = x
                if fits(trial):
                    chosen = (name, x)
                    break
            if chosen:
                break
        if chosen is None:
            return
        parent[chosen[0]] = copy.deepcopy(chosen[1])
        protect.add(parent_at + (chosen[0],))
        selectors.add(parent_at + (chosen[0],))
    for node, nres in conds:
        branch, bres = branch_of(node, nres, parent)
        if isinstance(branch, dict):
            _fill_branch(cl, v, parent, branch, bres, selectors | {parent_at + (member,)}, parent_at, donors)


def enter_light(cl, v, control, reach, donors, by_ipath=None):
    """GO2: the members on the way are created as GO's realize() creates them (generated from the step's subschema when
    missing or null), without re-applying every conditional of every object; then each conditional of the reach that is
    not yet taken is entered by _force. Returns (value, protected paths) or None."""
    value = copy.copy(control)  # GO2: copy only the containers on the reach's path (each is copied before it is edited)
    path = ()
    steps = reach['steps']
    for number, (segment, child, resolver) in enumerate(steps):
        here = cl.get(value, path)
        if number:
            here = copy.copy(here)
            value = cl.put(value, path, here) if path else here
        last = number == len(steps) - 1
        if segment == '#':
            if not isinstance(here, list):
                return None
            if not here:
                here.append(cl.gen(child, resolver, 0, 0))
            path += (0,)
        elif segment == '*':
            if not isinstance(here, dict):
                return None
            if not here:
                here['gc_key'] = cl.gen(child, resolver, 0, 0)
            path += (next(iter(here)),)
        elif isinstance(segment, int):
            if not isinstance(here, list) or len(here) <= segment:
                return None
            path += (segment,)
        else:
            if not isinstance(here, dict):
                return None
            if segment not in here or (not last and here[segment] is None):
                nxt = steps[number + 1][0] if not last else None
                pool = [d for d in donors.candidates(segment, 24)
                        if not last and (isinstance(d, dict) and (not isinstance(nxt, str) or nxt in d or nxt == '*')
                                         or isinstance(d, list) and nxt in ('#',) or isinstance(nxt, int) and isinstance(d, list))]
                pool.sort(key=lambda d: not cl.holds(v, child, d, resolver))  # donors the member's subschema accepts first
                here[segment] = copy.deepcopy(pool[0]) if pool else cl.gen(child, resolver, 0, 0)
            path += (segment,)
    protect = {path}
    selectors = set()
    for kind, depth, index, owner, resolver, obj in reach['ctx']:
        at = tuple(path[:depth])
        if kind in ('anyOf', 'oneOf') and by_ipath is not None:
            value = _enter_union(cl, v, value, reach, depth, owner, kind, index, resolver, path, donors, by_ipath, protect, selectors)
            if value is None:
                return None
            continue
        target = cl.get(value, at)
        if kind in ('then', 'else') and isinstance(target, dict):
            condition, cres = cl.deref(owner['if'], resolver)
            if cl.holds(v, condition, target, cres) != (kind == 'then'):
                forced = _force(cl, v, target, condition, cres, kind == 'then', donors, at,
                                member_schemas(cl, by_ipath, tuple(reach['ipath'][:depth])) if by_ipath is not None else None)
                if forced is None:
                    return None
                protect |= set(forced)
                selectors |= set(forced)
            else:
                taken = {at + (q,) for q in condition.get('properties', {}) if q in target}
                protect |= taken
                selectors |= taken
            # the taken branch's own members that refuse their current value: const/enum, null, a donor, a generated value
            branch, bres = cl.deref(owner.get(kind, {}), resolver)
            for q, sub in (branch.get('properties', {}) if isinstance(branch, dict) else {}).items():
                if q not in target or at + (q,) in selectors:
                    continue
                sub, sres = cl.deref(sub, bres)
                if cl.holds(v, sub, target[q], sres):
                    continue
                if isinstance(target[q], dict) and isinstance(sub.get('properties'), dict) and 'type' not in sub:
                    # a nested pin on an existing object: pin its members in place, never replace the object
                    trial = copy.deepcopy(target[q])
                    if _force(cl, v, trial, sub, sres, True, donors, at + (q,)) is not None and cl.holds(v, sub, trial, sres):
                        target[q] = trial
                        continue
                pool = ([sub['const']] if 'const' in sub else []) + list(sub.get('enum', []))[:4] + [None]
                pool += [d for d in donors.candidates(q, 8)]
                try:
                    pool.append(cl.gen(sub, sres, 0, 0))
                except Exception:  # noqa: BLE001
                    pass
                pick = next((x for x in pool if cl.holds(v, sub, x, sres)), NONE)
                if pick is not NONE:
                    target[q] = copy.deepcopy(pick)
    return value, protect


def enter_branch(cl, v, control, reach, donors, budget, repair=True):
    """GO2 addition: build a control holding the clause's location inside every union alternative and branch of its
    reach: GO's realize() (members on the way), then for each conditional on the way that is not yet taken, force the
    members its `if` reads (then: const/enum/nested pins or a donor the selector accepts; else: null, removal or a donor
    the selector refuses), protect those members, and greedy_repair everything else."""
    base, path = cl.realize(control, reach, 0, v)
    if base is None:
        return None
    protect = {tuple(path)}
    for kind, depth, index, owner, resolver, obj in reach['ctx']:
        at = tuple(path[:depth])
        try:
            target = cl.get(base, at)
        except (KeyError, IndexError, TypeError):
            return None
        if kind in ('then', 'else') and isinstance(target, dict):
            condition, cres = cl.deref(owner['if'], resolver)
            holds = cl.holds(v, condition, target, cres)
            if holds != (kind == 'then'):
                forced = _force(cl, v, target, condition, cres, kind == 'then', donors, at)
                if forced is None:
                    return None
                protect |= set(forced)
            else:
                protect |= {at + (p,) for p in condition.get('properties', {}) if p in target}
        # union alternatives on the way are GO's realize() business (a generated alternative when the location holds
        # no object); replacing the alternative here would undo the members realize() set inside it
    if not repair:
        return base, protect
    if not cl.errors_of(v, base):
        return base
    return greedy_repair(cl, v, base, protect, donors, budget=budget)


def vacuous_go2(keyword, node):
    """GO2 addition: assertion values no instance can fail, checked on the owner node (GO's VACUOUS rule covers only
    minItems/minLength/minProperties 0). JSON Schema 2020-12 Validation: required (6.5.3) holds when every listed name
    is a member, so an empty list is always satisfied; uniqueItems false (6.4.3) always validates; dependentRequired
    (6.5.4) with only empty lists likewise. The validator's own keyword functions agree (standing trial)."""
    value = node.get(keyword)
    if keyword == 'required' and value == []:
        return 'required is [] on the owner node: an object holds every member of an empty list (Validation 2020-12 6.5.3), no instance fails it'
    if keyword == 'uniqueItems' and value is False:
        return 'uniqueItems is false on the owner node: it always validates (Validation 2020-12 6.4.3), no instance fails it'
    if keyword == 'dependentRequired' and isinstance(value, dict) and all(x == [] for x in value.values()):
        return 'dependentRequired lists no member on the owner node (Validation 2020-12 6.5.4), no instance fails it'
    return None


def common_locations():
    import pm_goal_oracle_common as common
    return common._SCHEMA_LOCATIONS


def witnesses_from(paths, root):
    """--carry FILE@COMMIT (GO's rule): only witness classes, a KILLED witness beats COVERED_LATER, each with carried_from."""
    kept = {}
    for item in paths:
        path, _, commit = item.partition('@')
        if not commit:
            raise SystemExit('--carry needs FILE@TOOL_COMMIT')
        data = json.loads(Path(path).read_text())
        entry = data['roots'].get(root)
        if not entry or entry.get('error'):
            continue
        label = dict(report=Path(path).name, report_sha256=hashlib.sha256(Path(path).read_bytes()).hexdigest(),
                     closure_tool=entry.get('closure_tool') or commit)
        for c, x in entry['clauses'].items():
            if x['cls'] in ('KILLED', 'COVERED_LATER') and (c not in kept or (kept[c]['cls'] != 'KILLED' and x['cls'] == 'KILLED')):
                kept[c] = dict(x, carried_from=dict(x.get('carried_from') or label, cls=x['cls']))
    return kept


def searched_elsewhere(paths, root, families):
    """--distinct-from (GO's rule): a clause whose witness is held by another root of every family of this root."""
    witnessed = collections.defaultdict(dict)
    for item in paths:
        name = Path(item.partition('@')[0])
        data = json.loads(name.read_text())
        for other, entry in data['roots'].items():
            for c, x in entry['clauses'].items():
                if x['cls'] in ('KILLED', 'COVERED_LATER'):
                    for family in entry['families']:
                        witnessed[family].setdefault(c, f"{name.name}:{other} ({x['cls']})")
    if not families or not paths:
        return {}
    common_clauses = set.intersection(*(set(witnessed[f]) for f in families))
    return {c: witnessed[families[0]][c] for c in common_clauses if root not in witnessed[families[0]][c]}


def close(args):
    import pm_goal_go_schema_closure as cl
    data = load(args.dump, [args.root])
    if len(data['roots']) != 1:
        raise SystemExit(f'--root {args.root} selects {len(data["roots"])} roots')
    (root, entry), = data['roots'].items()
    v = rebuild(entry, memo=not args.reference)
    seeds = list(entry['seeds'])
    install_fixes(cl)  # GO2 defect 1: base switch at an inline $id in deref (null_at, gen, realize)
    if not args.reference and args.sample_every:  # GO2: in-run agreement on the search's own instances
        reference = rebuild(entry)
        go_errors_of = cl.errors_of
        def errors_of(v_, value, cut=frozenset()):
            errs = go_errors_of(v_, value, cut)
            if v_ is v:
                SAMPLED['calls'] += 1
                if SAMPLED['calls'] % args.sample_every == 0:
                    a = tuple(error_signature(e) for e in errs)
                    b = signature(reference, value, cut)
                    SAMPLED['compared'] += 1
                    SAMPLED['accepted' if not b else 'refused'] += 1
                    SAMPLED['with_cut'] += bool(cut)
                    if a != b:
                        SAMPLED['mismatch'] += 1
                        MISMATCHES.append(dict(input_sha256=sha(value), cut=sorted(cut)))
            return errs
        cl.errors_of = errors_of
    cl.CLAUSE_CAP[0] = args.clause_cap
    cl.CURRENT[0] = v
    cl.UNRESOLVED.clear()
    carried = witnesses_from(args.carry, root)
    elsewhere = {} if args.research_elsewhere else searched_elsewhere(args.distinct_from, root, entry['families'])
    nodes = cl.walk(v)
    by_ipath = collections.defaultdict(list)
    for location, info in nodes.items():
        for reach in info['reach']:
            if not any(c[0] in cl.APART for c in reach['ctx']):
                by_ipath[reach['ipath']].append((location, info['node'], info['resolver']))
    work = [(location, keyword) for location, info in nodes.items() for keyword in cl.clauses_of(info['node'])]
    if ':' in args.clause_shard:  # an explicit clause range a:b of the walk order (splits a slow block without overlap)
        lo, hi = map(int, args.clause_shard.split(':'))
        mine = work[lo:hi]
    else:
        part, total = map(int, args.clause_shard.split('/'))
        size = -(-len(work) // total)
        mine = work[part * size:(part + 1) * size]  # contiguous blocks keep structurally close clauses (and their branch controls) together
    state = dict(entries={}, controls=list(seeds), branch_controls=[], validations=0, seconds=0.0)
    checkpoint = Path(str(args.out) + '.ckpt')
    if args.resume and checkpoint.exists():
        state = pickle.loads(checkpoint.read_bytes())
        state['seconds'] = state.get('seconds_at_checkpoint', state['seconds'])
        CONTROL_STORE.update(state.get('store', {}))
        print(f'resumed {len(state["entries"])} clauses', file=sys.stderr, flush=True)
    state.setdefault('tool_history', []).append(dict(tool_sha256=TOOL_SHA256, at_clauses=len(state['entries'])))
    residual = {}
    RESIDUAL[0] = bool(args.residual)
    if args.residual:  # GO2 residual pass: every clause the earlier report classified other than UNCOVERED is kept as is
        earlier = json.loads(Path(args.residual).read_text())
        if earlier['root'] != root:
            raise SystemExit('--residual report is for another root')
        residual = earlier['clauses']
        mine_set = {location + '/' + cl.name_of(keyword) for location, keyword in mine}
        again = ('UNCOVERED', 'SEARCHED_ELSEWHERE') if args.research_elsewhere else ('UNCOVERED',)
        residual = {c: x for c, x in residual.items() if x['cls'] in again}  # the clauses this pass searches
        for clause, x in earlier['clauses'].items():
            if x['cls'] not in again and clause not in state['entries'] and clause in mine_set:
                state['entries'][clause] = dict(x, kept_from=dict(report=Path(args.residual).name,
                                                                  report_sha256=hashlib.sha256(Path(args.residual).read_bytes()).hexdigest()))
        import gzip
        store_path = Path(str(args.residual) + '.controls.pkl.gz')
        if store_path.exists():
            CONTROL_STORE.update(pickle.loads(gzip.decompress(store_path.read_bytes())))
        earlier_state = Path(str(args.residual) + '.ckpt')
        if earlier_state.exists() and not (args.resume and checkpoint.exists()):
            # the earlier pass's controls (seeds and every control it built) are this pass's starting pool
            have = {sha(c) for c in state['controls']}
            for c in pickle.loads(earlier_state.read_bytes())['controls']:
                if sha(c) not in have:
                    have.add(sha(c))
                    state['controls'].append(c)
    if args.donors:
        lists = []
        for path in args.donors:
            if str(path).endswith('.ckpt'):  # an earlier GO2 pass: its accepted controls (seeds and constructions)
                lists.append(pickle.loads(Path(path).read_bytes())['controls'])
            elif str(path).endswith('.controls.pkl.gz'):  # an earlier GO2 report's witness controls
                import gzip
                lists.append(list(pickle.loads(gzip.decompress(Path(path).read_bytes())).values()))
            else:
                lists += [e['seeds'] for e in load(path)['roots'].values()]
        DONORS[0] = Donors(lists)
    controls = state['controls']
    known = {sha(c) for c in controls}
    budget = 10**12  # GO's runs used --per-clause 900, so the root budget never bound; the per-clause cap does
    root0 = cl.COUNT[0] - state['validations']
    cache, ids = {}, {}
    started, last = time.monotonic(), time.monotonic()
    deadline = time.monotonic() + args.root_seconds if args.root_seconds else None
    for number, (location, keyword) in enumerate(mine):
        clause = location + '/' + cl.name_of(keyword)
        if clause in state['entries'] or (residual and clause not in residual):
            continue
        info, node = nodes[location], nodes[location]['node']
        if clause in carried:
            state['entries'][clause] = carried[clause]
            continue
        if clause in elsewhere:
            state['entries'][clause] = dict(cls='SEARCHED_ELSEWHERE', closed_in=elsewhere[clause])
            continue
        ident = cl.common.schema_guard(node, keyword)
        if all(r['empty_domain'] for r in info['reach']):
            state['entries'][clause] = dict(cls='UNREACHABLE', proof='every instance location of the clause is an item of an array '
                                            'whose owner node has maxItems 0 (' + info['reach'][0]['empty_domain'] + '): no valid instance holds an item')
            continue
        inside = sorted({c[0] for r in info['reach'] for c in r['ctx'] if c[0] in cl.APART})
        if inside and all(any(c[0] in cl.APART for c in r['ctx']) for r in info['reach']):
            state['entries'][clause] = dict(cls='SELECTOR_OR_NEGATED', inside=inside,
                                            note='inside an `if` selector, a `not` operand or a `contains` operand: it never refuses on its own')
            continue
        if keyword in cl.VACUOUS and node.get(keyword) == cl.VACUOUS[keyword]:
            state['entries'][clause] = dict(cls='VACUOUS', proof=f'{keyword} is 0: no instance can fail it (checked on the owner node)')
            continue
        proof = vacuous_go2(keyword, node)
        if proof:
            state['entries'][clause] = dict(cls='VACUOUS', proof=proof, go2_rule=True)
            continue
        reaches = [r for r in info['reach'] if not any(c[0] in cl.APART for c in r['ctx'])][:6]
        t0 = cl.COUNT[0]
        try:
            ordered, has_reaching = order(cl, v, controls, reaches, cache, ids) if not args.no_reorder else (list(controls), None)
            seeds_ordered, _ = order(cl, v, seeds, reaches, cache, ids) if not args.no_reorder else (seeds, None)
            before = len(ordered)
            REACHING[0] = bool(has_reaching)
            result = search_clause(cl, clause, keyword, location, info, node, ident, v, nodes, seeds_ordered, ordered, known,
                                   state['branch_controls'], by_ipath, budget, root0, deadline)
            controls.extend(ordered[before:])  # branch controls built for this clause join the root's pool
            result['validations'] = cl.COUNT[0] - t0
            if has_reaching is not None:
                result['reaching_control'] = has_reaching
        except Exception as exc:  # noqa: BLE001 - GO: one clause's failure is recorded on that clause, never the root
            result = dict(cls='UNCOVERED', error=(type(exc).__name__ + ': ' + str(exc))[:240])
        state['entries'][clause] = result
        if time.monotonic() - last > args.checkpoint_seconds:
            last = time.monotonic()
            state['validations'] = cl.COUNT[0] - root0
            state['store'] = CONTROL_STORE
            state['seconds_at_checkpoint'] = state['seconds'] + time.monotonic() - started
            tmp = checkpoint.with_suffix('.tmp')
            tmp.write_bytes(pickle.dumps(state, protocol=5))
            tmp.replace(checkpoint)
            counts = collections.Counter(e['cls'] for e in state['entries'].values())
            print(f'{root[:30]} {args.clause_shard}: {len(state["entries"])}/{len(mine)} {dict(counts)} validations '
                  f'{cl.COUNT[0] - root0} rss {rss_mb()}MB memo {dict(STATS)}', file=sys.stderr, flush=True)
    state['validations'] = cl.COUNT[0] - root0  # the final state too: a later residual pass starts from its controls
    state['store'] = CONTROL_STORE
    state['seconds_at_checkpoint'] = state['seconds'] + time.monotonic() - started
    tmp = checkpoint.with_suffix('.tmp')
    tmp.write_bytes(pickle.dumps(state, protocol=5))
    tmp.replace(checkpoint)
    counts = collections.Counter(e['cls'] for e in state['entries'].values())
    report = dict(tool='scripts/pm_goal_go2_closure.py', tool_sha256=TOOL_SHA256,
                  go_closure_sha256=cl.TOOL_SHA256, root=root, clause_shard=args.clause_shard, clauses_in_root=len(work),
                  clauses_in_shard=len(mine), validator='reference' if args.reference else 'memo',
                  args=dict(clause_cap=args.clause_cap, carry=args.carry, distinct_from=[str(x) for x in args.distinct_from],
                            residual=str(args.residual) if args.residual else None, donors=[str(x) for x in args.donors],
                            research_elsewhere=args.research_elsewhere,
                            root_seconds=args.root_seconds, reorder=not args.no_reorder),
                  families=entry['families'], rows=entry['rows'], sites=entry['sites'][:12], kind=entry['kind'],
                  seeds=len(seeds), seed_sha256=entry['seed_sha256'], seed_policy='authored', dump_meta=data['meta'],
                  branch_controls=state['branch_controls'], validations=cl.COUNT[0] - root0,
                  ordering=dict(ORDERING), memo_stats=dict(STATS), counts=dict(counts), clauses=state['entries'],
                  sampled_agreement=dict(SAMPLED, mismatches=MISMATCHES[:50], every=args.sample_every),
                  unresolved_refs=list(cl.UNRESOLVED), seconds=round(state['seconds'] + time.monotonic() - started, 1),
                  tool_history=state['tool_history'])
    args.out.write_text(json.dumps(report, indent=1, sort_keys=True, default=str) + '\n')
    store = Path(str(args.out) + '.controls.pkl.gz')
    import gzip
    store.write_bytes(gzip.compress(pickle.dumps(CONTROL_STORE, protocol=5)))
    print(json.dumps(dict(root=root[:40], shard=args.clause_shard, counts=dict(counts), validations=report['validations'],
                          seconds=report['seconds'])))
    return 0


def main():
    parser = argparse.ArgumentParser(description=__doc__.split('\n\n')[0])
    sub = parser.add_subparsers(dest='cmd', required=True)
    d = sub.add_parser('dump')
    d.add_argument('--out', type=Path, required=True)
    d.add_argument('--roots', nargs='*', default=list(TARGETS))
    d.add_argument('--seed-cap', type=int, default=8)
    for name in ('agree', 'bench'):
        a = sub.add_parser(name)
        a.add_argument('--dump', type=Path, required=True)
        a.add_argument('--out', type=Path, required=True)
        a.add_argument('--roots', nargs='*', default=list(TARGETS))
        a.add_argument('--count', type=int, default=1200 if name == 'agree' else 200)
        a.add_argument('--seed', type=int, default=20261115)
    c = sub.add_parser('close')
    c.add_argument('--dump', type=Path, required=True)
    c.add_argument('--root', required=True)
    c.add_argument('--out', type=Path, required=True)
    c.add_argument('--clause-shard', default='0/1')
    c.add_argument('--clause-cap', type=int, default=900)
    c.add_argument('--carry', nargs='*', default=[])
    c.add_argument('--distinct-from', nargs='*', default=[])
    c.add_argument('--root-seconds', type=int, default=0)
    c.add_argument('--checkpoint-seconds', type=int, default=120)
    c.add_argument('--resume', action='store_true')
    c.add_argument('--reference', action='store_true', help='run on the reference validator (no memo)')
    c.add_argument('--no-reorder', action='store_true')
    c.add_argument('--residual', type=Path, help='re-search only the clauses this earlier GO2 report left UNCOVERED')
    c.add_argument('--donors', nargs='*', default=[], type=Path, help='root dumps (their seeds) and earlier GO2 checkpoints (their accepted controls) feeding the donor construction')
    c.add_argument('--research-elsewhere', action='store_true', help='residual pass: also search, in this root, the clauses '
                   'an earlier pass recorded SEARCHED_ELSEWHERE (no witness of another root is relied on)')
    c.add_argument('--sample-every', type=int, default=400, help='compare every Nth memo validation with the reference')
    w = sub.add_parser('verify')
    w.add_argument('--dump', type=Path, required=True)
    w.add_argument('--report', type=Path, required=True)
    w.add_argument('--out', type=Path, required=True)
    w.add_argument('--shard', default='0/1')
    m = sub.add_parser('merge-shards')
    m.add_argument('--reports', nargs='+', required=True)
    m.add_argument('--base', required=True, help="GO's merged closure (method, all_roots)")
    m.add_argument('--out', type=Path, required=True)
    t = sub.add_parser('self-test')
    t.add_argument('--dump', type=Path)
    t.add_argument('--out', type=Path)
    args = parser.parse_args()
    return dict(dump=dump, agree=agree, bench=bench, close=close, verify=verify, **{'self-test': self_test, 'merge-shards': merge_shards})[args.cmd](args)


if __name__ == '__main__':
    sys.exit(main())
