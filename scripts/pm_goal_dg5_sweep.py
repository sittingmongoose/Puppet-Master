#!/usr/bin/env python3
"""C12-DG5 runner: GH1's Goal sweep machinery with DG5's own phase tables.

goal.created, restore_point.deleted and run.started are proved with exactly the
GH1 collector, kill judge, co-observation partition, real-vector gated proof
(004bdedd63) and fabricated-row standing negative (scripts/pm_goal_guard_sweep.py,
read-only here). Only the table namespace differs, so DG5 never regenerates the
shared GH1/GH2 inventory:

* manifest   scripts/pm_goal_dg5_rows.json      (GH1: scripts/pm_goal_guard_rows.json)
* tables     scripts/pm_goal_dg5_phase_<id>.py  (GH1: scripts/pm_goal_phase_<id>.py)

GH1's `--replace-generated` deletes only `pm_goal_phase_*`/`pm_goal_table_*`
files, so DG5 tables survive a GH1/GH2 regeneration, and GH1's committed proof
keeps replaying unchanged (no GH1 source is edited by GO).

Pass 1 (--generate) collects in discovery mode and writes the tables; pass 2 is a
fresh child process that dispatches every decision through the generated phase
predicates, re-runs the kill judge (declared targets, exact expected refusal,
uncached restoration) and feeds the gated tool the real observation vectors.
Native execution remains NOT_RUN.
"""
import argparse
import collections
import gzip
import hashlib
import json
import os
from pathlib import Path
import subprocess
import sys
import time

import pm_goal_guard_tables as tables
import pm_goal_guard_sweep as sweep

ROOT = Path(__file__).resolve().parents[1]


def _trim():
    """Return freed heap pages to the OS (deepcopy-heavy collection fragments glibc arenas;
    RSS otherwise tracks the high-water mark, which the systemd scope cap counts)."""
    import ctypes
    import gc
    gc.collect()
    try:
        ctypes.CDLL('libc.so.6').malloc_trim(0)
    except OSError:
        pass


def _release_pass1_state(collector):
    """Drop every pass-1 retention before the pass-2 child re-collects (DG5 memory bound).

    --prove-generated used to keep the whole pass-1 collector (ledger, sealed
    candidates, bridge bank/singleton memos, schema memo) resident in the parent
    while the child re-ran the same source with the kill judge, so the scope cap
    saw pass1 + pass2 peak (9/32: 1.6G parent + growing child, OOM at 2G and 4G).
    The child reads only the generated tables/manifest the parent already wrote,
    never the parent's collector, so releasing it changes no output byte
    (rows.json byte-identical on the adapter proof). Set PM_DG5_PASS2_RELEASE=0
    to keep the old behaviour.
    """
    import pm_goal_dg5_boundaries as bridge
    bridge.FROZEN.clear()
    bridge.FROZEN_PARTS.clear()
    bridge.MEMBERS.clear()
    bridge.CASE_BANKS.clear()
    tables._SCHEMAS.clear()
    tables._PREDICATES.clear()
    collector.ledger = []
    collector.signature_list = []
    collector.candidates = {}
    collector.snapshots = {}
    collector.schema_seeds = {}
    collector.store_snapshots = []
    collector.rows = {}
    _trim()


MANIFEST = ROOT / 'scripts/pm_goal_dg5_rows.json'
PREFIX = 'pm_goal_dg5_phase_'
SOURCES = ['pm_goal_dg5_u']
FAMILIES = ('goal.updated', 'goal.cancelled', 'goal_run.started', 'goal_run.cancelled', 'goal_run.certified')


def namespace(name):
    """Per-family table namespace: scripts/pm_goal_dg5_<name>_phase_<id>.py and pm_goal_dg5_<name>_rows.json."""
    global MANIFEST, PREFIX
    if name:
        MANIFEST = ROOT / f'scripts/pm_goal_dg5_{name}_rows.json'
        PREFIX = f'pm_goal_dg5_{name}_phase_'


def install(prove):
    """Point GH1's dispatch at DG5's namespace; pass 2 reads DG5's manifest only."""
    tables.PHASE_PREFIX = PREFIX
    tables._PREDICATES.clear()
    tables._ROWS = json.loads(MANIFEST.read_text()) if prove and MANIFEST.exists() else {}
    if not getattr(sweep.Collector, '_go_controls', False):
        import pm_goal_go_schema as schemas
        invoke = sweep.Collector.invoke

        def control_invoke(self, label, evaluate, value, valid=None, **kwargs):
            saved = schemas.CONTROL[0]
            schemas.CONTROL[0] = valid is True and not self.replaying
            try:
                return invoke(self, label, evaluate, value, valid, **kwargs)
            finally:
                schemas.CONTROL[0] = saved
                # GH1 keeps each row's first negative as (evaluate, value, label) and the same
                # sealed value again in snapshots, and never reads either again in this runner;
                # a DG5 evaluate closes over a whole world and its sealed value can pin a large
                # store manifest/owner state, so both are released once this invoke's judge has
                # finished. The ledger, input digest and row/site evidence remain. Each store
                # snapshot keeps its complete before/after manifest digests; the pickled manifest
                # copy GH1 also keeps per call is dropped (DG-R/CB hold thousands of calls).
                for snapshot in self.store_snapshots[getattr(self, '_dg5_slimmed', 0):]:
                    raw = snapshot.pop('snapshot_pickle_base64', None)
                    if raw is not None:
                        snapshot['manifest_pickle_sha256'] = hashlib.sha256(raw.encode()).hexdigest()
                self._dg5_slimmed = len(self.store_snapshots)
                if len(self.candidates) != getattr(self, '_dg5_released', 0):
                    for name, candidate in list(self.candidates.items()):
                        if candidate[0] is not None or candidate[1] is not None:
                            self.candidates[name] = (None, None) + tuple(candidate[2:])
                    self._dg5_released = len(self.candidates)
                for name in list(self.snapshots):
                    if self.snapshots[name] is not None:
                        self.snapshots[name] = None
                # Pass 2 replays each negative several times; return arena pages and
                # bound the pure-decision schema memo periodically (recomputed on
                # demand, so no verdict or output byte changes).
                if os.environ.get('PM_DG5_PASS2_RELEASE', '1') != '0' \
                        and self.calls - getattr(self, '_dg5_trimmed_at', 0) >= 250:
                    self._dg5_trimmed_at = self.calls
                    if len(tables._SCHEMAS) > 50000:
                        tables._SCHEMAS.clear()
                    _trim()
        sweep.Collector.invoke = control_invoke
        sweep.Collector._go_controls = True
    if not getattr(sweep.Collector, '_go_cut_sites', False):
        judge = sweep.Collector._judge

        def judged(self, record, evaluate, value):
            judge(self, record, evaluate, value)
            if record.get('kill') == 'CUT_EXCEPTION' and evaluate is not None:
                record['cut_exception_site'] = cut_site(self, evaluate, value, record['target'])
            if record.get('kill') in sweep.LATER_REFUSAL_CLASSES and evaluate is not None:
                # Evidence only, for every later-refusal class (COVERED_LATER, CUT_LEFT_EFFECT, CANNOT_DECIDE).
                record['dg5_chain'] = chain(self, evaluate, value, record['target'])
        sweep.Collector._judge = judged
        sweep.Collector._go_cut_sites = True


def chain(collector, evaluate, value, target, depth=5):
    """Evidence only (never credit): widen the cut by each later refusal until the complete
    call accepts, raises, or stops progressing. A duplicate set declared from this chain is
    credited only by a later run's judge (joint cut accepts, each site refuses alone)."""
    cut = {target} if isinstance(target, str) else set(target)
    steps = [sorted(cut)]
    for _ in range(depth):
        errors = collector._replay(evaluate, value, cut)
        if isinstance(errors, str):
            return dict(rows=steps, result='exception', detail=errors)
        if not errors:
            return dict(rows=steps, result='accepts')
        new = set(errors) - cut
        if not new:
            return dict(rows=steps, result='no_progress', errors=errors)
        cut |= new
        steps.append(sorted(new))
    return dict(rows=steps, result='depth_limit')


def cut_site(collector, evaluate, value, target):
    """Evidence only (never credit): where the complete checker raises with exactly `target` cut —
    the innermost frames in checker sources, with their source text."""
    import copy
    import linecache
    import traceback
    cut = {target} if isinstance(target, str) else set(target)
    saved = (tables.CUT, tables.NO_CACHE, collector.active, collector.replaying)
    tables.CUT, tables.NO_CACHE, collector.active, collector.replaying = frozenset(cut), True, [], True
    try:
        evaluate(copy.deepcopy(value))
        return None
    except Exception as exc:
        frames = [f for f in traceback.extract_tb(exc.__traceback__)
                  if 'PM-Experiments' in f.filename or '/scripts/pm_goal' in f.filename]
        return dict(exception=type(exc).__name__, detail=str(exc)[:160],
                    frames=[dict(file=f.filename, line=f.lineno, text=(linecache.getline(f.filename, f.lineno) or '').strip()[:240])
                            for f in frames[-3:]])
    finally:
        tables.CUT, tables.NO_CACHE, collector.active, collector.replaying = saved


def generate(collector):
    mapping = {}
    chunks = sweep.partition(collector)
    for names in chunks:
        ident = sweep.table_id(names)
        sites = {n: [sweep.site_location(s) for s in collector.rows[n]['sites']] for n in names}
        text = sweep.table_source(ident, names, sites).replace(
            'generated by pm_goal_guard_sweep.py --generate', 'generated by pm_goal_dg5_sweep.py --generate (C12-GO)')
        (ROOT / f'scripts/{PREFIX}{ident}.py').write_text(text)
        for index, name in enumerate(names):
            mapping[name] = dict(table=ident, phase=True, index=index, rows=len(names), sites=sorted(sites[name]))
    MANIFEST.write_text(json.dumps(mapping, indent=2, sort_keys=True) + '\n')
    keep = {PREFIX + row['table'] for row in mapping.values()}
    for path in (ROOT / 'scripts').glob(PREFIX + '*.py'):
        if path.stem not in keep and 'generated by pm_goal_dg5_sweep.py' in path.read_text().splitlines()[0]:
            path.unlink()
    return chunks


def prove_bounded(collector, out, only=None):
    """sweep.prove with each table proved in a forked child (DG5 memory bound).

    GH1 prove_table imports one generated module per table and runs the gated
    tool in-process; several helper judging runs kernel-OOMed at the 2G gate
    inside specific table sets. Forking per table bounds peak memory to the
    shared collector/by_sig pages plus one table's working set, with byte-
    identical reports (prove_table is pure per table). The summary/rows tail
    (including dominance/union/provider proofs) replicates sweep.prove exactly.
    Set PM_DG5_PROVE_FORK=0 to use the in-process GH1 path unchanged.
    """
    if os.environ.get('PM_DG5_PROVE_FORK', '1') == '0' or not hasattr(os, 'fork'):
        return sweep.prove(collector, out, only)
    out.mkdir(parents=True, exist_ok=True)
    manifest = tables.rows()
    grouped = collections.defaultdict(list)
    for name, spec in manifest.items():
        if name in collector.rows:
            grouped[spec['table']].append((spec.get('index', 0), name, spec))
    by_sig = sweep.table_records(collector)
    reports = []
    for ident in sorted(grouped):
        if only and ident not in only:
            continue
        entries = sorted(grouped[ident])
        names = [n for _, n, _ in entries]
        kwargs = {} if entries[0][2].get('phase') else dict(module_name=tables.PREFIX + ident)
        result_path = out / ('.prove-result-' + ident + '.json')
        pid = os.fork()
        if pid == 0:
            try:
                entry = sweep.prove_table(collector, ident, names, by_sig, out, **kwargs)
                with open(result_path, 'w') as handle:
                    json.dump(entry, handle, default=list)
            finally:
                os._exit(0)
        os.waitpid(pid, 0)
        reports.append(json.loads(result_path.read_text()))
        result_path.unlink()
        if len(reports) % 25 == 0:
            print(f'tables {len(reports)} proved {sum(len(x["proved"]) for x in reports)}',
                  file=sys.stderr, flush=True)
    (out / 'summary.json').write_text(json.dumps(reports, indent=1, default=list) + '\n')
    rows = []
    for entry in reports:
        for name in entry['rows']:
            rows.append(dict(guard=name, table=entry['table'],
                             status='PASS' if name in entry['proved'] else 'UNPROVED',
                             table_status=entry['status']))
    for row in rows:
        if row['status'] == 'UNPROVED':
            proof = sweep.dominance_proof(row['guard'], rows) or sweep.union_member_proof(row['guard'], rows)
            for provider in collector.proof_providers:
                if proof:
                    break
                candidate = provider(row['guard'], rows)
                if candidate:
                    earlier = candidate.get('earlier_guards', [])
                    if not earlier or any(
                            not any(r['guard'] == name and r['status'] == 'PASS' for r in rows)
                            for name in earlier):
                        raise ValueError('earlier-clause proof lacks a proved dependency: ' + row['guard'])
                    proof = candidate
            if proof:
                row['proof'] = proof
    (out / 'rows.json').write_text(json.dumps(rows, indent=1, default=list) + '\n')
    return reports, rows


def main():
    parser = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    parser.add_argument('--out', type=Path, required=True)
    parser.add_argument('--source', action='append')
    parser.add_argument('--generate', action='store_true')
    parser.add_argument('--prove-generated', action='store_true')
    parser.add_argument('--collect-only', action='store_true')
    parser.add_argument('--table', action='append')
    parser.add_argument('--namespace', help='per-family table namespace (u, s, ca, r, cf)')
    args = parser.parse_args()
    namespace(args.namespace)
    sweep.OUTPUT = args.out
    args.out.mkdir(parents=True, exist_ok=True)
    install(prove=not (args.generate or args.collect_only))
    source_paths = sorted((ROOT / 'scripts').glob('pm_goal*.py')) + [ROOT / 'scripts' / name for name in
        ('pm_guard_isolation.py', 'pm_event_numbers.py', 'pm_event_datetime.py', 'pm_event_numbers_corpus.py')]
    all_bindings = {str(p.relative_to(ROOT)): hashlib.sha256(p.read_bytes()).hexdigest() for p in source_paths}
    sources = args.source or SOURCES
    tables.DISCOVERY = bool(args.generate or args.collect_only)
    started = time.time()
    collector = sweep.collect(sources, fuzz=False, judge=not args.generate, keyword_witnesses=False)
    import pm_goal_dg5_boundaries as bridge
    bridge.settle_case_banks(None)
    collector.failures.extend(bridge.FAILURES)
    frozen = bridge.verify_frozen()
    if frozen['drift']:
        collector.failures.append(dict(kind='load_once_singleton_changed', drift=frozen['drift']))
    import pm_goal_oracle_common as common
    (args.out / 'schema-inventory.json').write_text(json.dumps(dict(types=common._SCHEMA_TYPES,
        inactive=common._SCHEMA_INACTIVE_TYPES, duplicates={k: sorted(v) for k, v in common._SCHEMA_DUPLICATES.items()},
        locations=common._SCHEMA_LOCATIONS, assertions=common._SCHEMA_ASSERTION_INFO), indent=1, default=str) + '\n')
    summary = dict(calls=collector.calls, guards=len(collector.rows), failures=collector.failures, load_once=frozen,
        store_snapshots=collector.store_snapshots, generator_stats=collector.generator_stats,
        replay_unknown_rows=sorted(collector.replay_unknown_rows), signatures=len(collector.signature_list),
        seconds=round(time.time() - started, 1), sources=sources,
        rows={name: {**{k: v for k, v in slot.items() if k != 'sites'}, 'sites': sorted(slot['sites'])}
              for name, slot in collector.rows.items()}, native_execution='NOT_RUN')
    (args.out / 'collection.json').write_text(json.dumps(summary, indent=1, default=str) + '\n')
    with gzip.open(args.out / 'ledger.json.gz', 'wt') as handle:
        json.dump(collector.ledger, handle, default=list)
    with gzip.open(args.out / 'signatures.json.gz', 'wt') as handle:
        json.dump([sorted(names) for names in collector.signature_list], handle)
    family_rows = collections.defaultdict(set)
    for record in collector.ledger:
        if record.get('sig') is not None:
            family_rows[record['family']].update(collector.signature_list[record['sig']])
    (args.out / 'store-snapshots.json').write_text(json.dumps(collector.store_snapshots, indent=0) + '\n')
    (args.out / 'number-corpus.json').write_text(json.dumps(dict(slots=bridge.SLOTS, results=bridge.CORPUS,
        summary={slot: dict(collections.Counter(r['verdict'] for r in bridge.CORPUS if r['slot'] == slot))
                 for slot in sorted({r['slot'] for r in bridge.CORPUS})}), indent=1, default=str) + '\n')
    (args.out / 'family-rows.json').write_text(json.dumps({f: sorted(v) for f, v in family_rows.items()}, indent=1) + '\n')
    extras = [getattr(sys.modules.get(name), 'DG5_EVIDENCE', None) for name in sources]
    (args.out / 'source-evidence.json').write_text(json.dumps({name: extra for name, extra in zip(sources, extras) if extra},
        indent=1, default=str) + '\n')
    if args.generate:
        chunks = generate(collector)
        print(json.dumps(dict(calls=collector.calls, guards=len(collector.rows), tables=len(chunks),
                              failures=len(collector.failures))), file=sys.stderr)
        if args.prove_generated:
            child = [sys.executable, '-B', __file__, '--out', str(args.out / 'proof')] + [x for s in sources for x in ('--source', s)]
            if args.namespace:
                child += ['--namespace', args.namespace]
            if os.environ.get('PM_DG5_PASS2_RELEASE', '1') != '0':
                _release_pass1_state(collector)
            return subprocess.call(child)
        return int(bool(collector.failures))
    failed = bool(collector.failures)
    bindings = {}
    if not args.collect_only:
        for name in collector.rows:
            spec = tables.rows().get(name)
            if spec is None:
                collector.failures.append(dict(kind='row_missing_from_go_manifest', row=name))
                continue
            path = ROOT / 'scripts' / (tables.module_name(spec) + '.py')
            bindings[str(path.relative_to(ROOT))] = hashlib.sha256(path.read_bytes()).hexdigest()
        bindings[str(MANIFEST.relative_to(ROOT))] = hashlib.sha256(MANIFEST.read_bytes()).hexdigest()
        reports, rows = prove_bounded(collector, args.out / 'tables', args.table)
        probe = sweep.fabricated_row_self_test(collector, args.out / 'tables', reports)
        (args.out / 'fabricated-row-self-test.json').write_text(json.dumps(probe, indent=1, default=str) + '\n')
        mutation = sweep.ledger_summary(collector, rows)
        (args.out / 'mutations.json').write_text(json.dumps(mutation, indent=1, default=str) + '\n')
        invalid = [r for r in collector.ledger if r.get('target') is not None and r.get('valid') is not True
                   and r.get('outcome') != 'exact_expected']
        with gzip.open(args.out / 'invalid-mutations.json.gz', 'wt') as handle:
            json.dump(invalid, handle, default=list)
        outcomes = collections.Counter(r.get('outcome') for r in collector.ledger)
        kills = collections.Counter(r.get('kill') for r in collector.ledger if r.get('kill'))
        print(json.dumps(dict(calls=collector.calls, guards=len(collector.rows), tables=len(reports),
            proved=sum(len(r['proved']) for r in reports),
            unproved_with_proof=sum(1 for r in rows if r['status'] != 'PASS' and r.get('proof')),
            unproved_without_proof=sum(1 for r in rows if r['status'] != 'PASS' and not r.get('proof')),
            outcomes=outcomes, kills=kills, fabricated_probe=probe['status'], failures=len(collector.failures))))
        failed = failed or probe['status'] != 'pass' or bool(collector.failures)
    for module in tuple(sys.modules.values()):
        filename = getattr(module, '__file__', None)
        if not filename:
            continue
        path = Path(filename).resolve()
        if path.is_relative_to(ROOT) and path.name.startswith('pm_goal') and path.suffix == '.py':
            relative = str(path.relative_to(ROOT))
            if relative not in bindings:
                if relative not in all_bindings:
                    raise ValueError('unbound late source: ' + relative)
                bindings[relative] = all_bindings[relative]
    for name in ('pm_guard_isolation.py', 'pm_event_numbers.py', 'pm_event_datetime.py', 'pm_event_numbers_corpus.py'):
        bindings['scripts/' + name] = all_bindings['scripts/' + name]
    source_bindings = {**bindings, **common.SOURCE_BINDINGS}
    drift = [path for path, sha in source_bindings.items()
             if not (ROOT / path).exists() or hashlib.sha256((ROOT / path).read_bytes()).hexdigest() != sha]
    (args.out / 'source-bindings.json').write_text(json.dumps(dict(files=source_bindings, changed_during_run=drift),
                                                               indent=1, sort_keys=True) + '\n')
    if drift:
        print('Source changed during run: ' + ', '.join(drift), file=sys.stderr)
    return int(failed or bool(drift))


if __name__ == '__main__':
    sys.exit(main())
