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
    interner = Interner()
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
    for reach in [r for r in info['reach'] if not any(c[0] in APART for c in r['ctx'])][:6] if not out_of_time else []:
        pools = [(c, None) for c in controls[:40]]
        for variant in range(4):
            for control in seeds[:6]:
                pools.append((control, variant))
        pools.append((None, 'swap'))
        for control, variant in pools:
            if COUNT[0] - root0 > budget or COUNT[0] - start > CLAUSE_CAP[0] or (
                    covered_at is not None and COUNT[0] - covered_at > COVERED_EXTRA):
                break
            if variant is None and COUNT[0] - start > CLAUSE_CAP[0] // 2:
                continue
            if variant == 'swap':
                if best is None:
                    pools.extend((candidate, 'swapped') for candidate in cl.swap_candidates(v, controls, reach))
                continue
            if variant is None or variant == 'swapped':
                paths = list(cl.concrete(control, reach['ipath']))
                base = control
                if variant == 'swapped':
                    attempts += 1
                    fingerprint = hashlib.sha256(pickle.dumps(base, protocol=5)).hexdigest()
                    if fingerprint not in known:
                        known.add(fingerprint)
                        controls.append(base)
                        branch_controls.append(dict(clause=clause, variant='swap', sha256=fingerprint))
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
                                   control='suite' if variant is None else 'swap' if variant == 'swapped' else 'branch',
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

    def deref(node, resolver, seen=None):
        seen = seen or set()
        resolver = own(node, resolver)
        while isinstance(node, dict) and '$ref' in node and len(node) <= 2:
            if node['$ref'] in seen:
                break
            seen.add(node['$ref'])
            resolved = resolver.lookup(node['$ref'])
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
            if mutated is None or sha(mutated) != x['input_sha256']:
                problem = 'rebuilt input sha256 differs'
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
               failures=failures, seconds=round(time.monotonic() - start, 1))
    Path(args.out).write_text(json.dumps(out, indent=1, sort_keys=True) + '\n')
    print(json.dumps({k: v for k, v in out.items() if k != 'failures'}))
    return 1 if failures else 0


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
    elsewhere = searched_elsewhere(args.distinct_from, root, entry['families'])
    nodes = cl.walk(v)
    by_ipath = collections.defaultdict(list)
    for location, info in nodes.items():
        for reach in info['reach']:
            if not any(c[0] in cl.APART for c in reach['ctx']):
                by_ipath[reach['ipath']].append((location, info['node'], info['resolver']))
    work = [(location, keyword) for location, info in nodes.items() for keyword in cl.clauses_of(info['node'])]
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
    controls = state['controls']
    known = {sha(c) for c in controls}
    budget = 10**12  # GO's runs used --per-clause 900, so the root budget never bound; the per-clause cap does
    root0 = cl.COUNT[0] - state['validations']
    cache, ids = {}, {}
    started, last = time.monotonic(), time.monotonic()
    deadline = time.monotonic() + args.root_seconds if args.root_seconds else None
    for number, (location, keyword) in enumerate(mine):
        clause = location + '/' + cl.name_of(keyword)
        if clause in state['entries']:
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
        reaches = [r for r in info['reach'] if not any(c[0] in cl.APART for c in r['ctx'])][:6]
        t0 = cl.COUNT[0]
        try:
            ordered, has_reaching = order(cl, v, controls, reaches, cache, ids) if not args.no_reorder else (list(controls), None)
            seeds_ordered, _ = order(cl, v, seeds, reaches, cache, ids) if not args.no_reorder else (seeds, None)
            before = len(ordered)
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
    counts = collections.Counter(e['cls'] for e in state['entries'].values())
    report = dict(tool='scripts/pm_goal_go2_closure.py', tool_sha256=TOOL_SHA256,
                  go_closure_sha256=cl.TOOL_SHA256, root=root, clause_shard=args.clause_shard, clauses_in_root=len(work),
                  clauses_in_shard=len(mine), validator='reference' if args.reference else 'memo',
                  args=dict(clause_cap=args.clause_cap, carry=args.carry, distinct_from=[str(x) for x in args.distinct_from],
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
    c.add_argument('--sample-every', type=int, default=400, help='compare every Nth memo validation with the reference')
    w = sub.add_parser('verify')
    w.add_argument('--dump', type=Path, required=True)
    w.add_argument('--report', type=Path, required=True)
    w.add_argument('--out', type=Path, required=True)
    w.add_argument('--shard', default='0/1')
    t = sub.add_parser('self-test')
    t.add_argument('--dump', type=Path)
    t.add_argument('--out', type=Path)
    args = parser.parse_args()
    return dict(dump=dump, agree=agree, bench=bench, close=close, verify=verify, **{'self-test': self_test})[args.cmd](args)


if __name__ == '__main__':
    sys.exit(main())
