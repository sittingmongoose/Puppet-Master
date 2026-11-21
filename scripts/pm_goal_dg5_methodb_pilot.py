#!/usr/bin/env python3
"""Two whole-definition Method B rows of goal_run.started at DG5 91a53cd4db.

Replays exact clause edits from the pinned DG5 matrix's reports, against the
actual validator used by a complete accepted call. There is no search, aliasing
of root inventories, or changed owner input during a row-cut replay.
"""
from __future__ import annotations

import argparse
import ast
from collections import Counter, defaultdict
import copy
import gzip
import hashlib
import inspect
import json
import multiprocessing
from pathlib import Path
import subprocess
import sys
import textwrap
import time
from unittest.mock import patch

import pm_goal_dg5_boundaries as bridge
import pm_goal_dg5_closure as closure
import pm_goal_dg5_matrix as matrix
import pm_goal_dg_s_oracles as original
import pm_goal_dg_s_world as world
import pm_goal_go_schema_closure as clauses
import pm_goal_guard_sweep as sweep
import pm_goal_guard_tables as tables
import pm_goal_oracle_common as common

ROOT = sweep.ROOT
FAMILY = 'goal_run.started'
REQUEST = 'dg5/read_current/request/schema'
PRODUCER = 'dg5/start/producer/schema'
ARGUMENT = 'dg5/start/argument/schema'
SITES = {
    REQUEST: ('scripts/pm_goal_dg_s_readers.py', 759),
    PRODUCER: ('scripts/pm_goal_dg_s_start.py', 980),
}
PREFIX = 'pm_goal_dg5_methodb_pilot_phase_'
MATRIX_SHA = '235c91905d72deb3359e56f844b15183623118ab51d1219b04a1ed3684098c78'
TOOL_PINS = {
    # Addendum 6: the stock judge port (KILLED_CODE tallies) changed the matrix tool; pinned to the ported file.
    'scripts/pm_goal_dg5_matrix.py': '9114e749122800a7b4e602fb94f332edba084c2b6258ae362a4f5b8d602b547d',
    'scripts/pm_guard_isolation.py': 'e8038992eabbe067c8bcba8d48824b97fbb6b5b7e69cbfe28a669f939a96c0b8',
    'scripts/pm_goal_dg_s_readers.py': '0898885a8c8240c917ca1483293b866e54f6756e8c20164038e1443ab07e22c1',
    'scripts/pm_goal_dg_s_start.py': '4e9232b6d298869c993a85f1c67e00936919a5ef515211d0f8d99928c8279203',
}


def require(condition, reason):
    if not condition:
        raise ValueError(reason)


def sha(path):
    return hashlib.sha256(path.read_bytes()).hexdigest()


def write(path, value):
    path.write_text(json.dumps(value, indent=2, sort_keys=True) + '\n')


def store(path):
    return bridge.manifest(bridge.file_state(path))


def schema_documents(bank, uri):
    """Locate the original whole document bytes bound to an installed resource."""
    digest, pointer = bank.original.resource_origins[uri]
    paths = sorted(path for path, raw in bank.original.raw.items() if hashlib.sha256(raw).hexdigest() == digest)
    require(paths, f'{uri}: no installed source document')
    return dict(uri=uri, paths=paths, sha256=digest, pointer=pointer)


def configure_tables():
    tables.PHASE_PREFIX = PREFIX
    tables._ROWS = {r: dict(table=sweep.table_id([r]), phase=True) for r in SITES}
    tables._PREDICATES.clear()


class SourceCall:
    """One existing reader or producer oracle with its own authentic Storage world."""

    def __init__(self, suite, row, edition):
        self.row = row
        self.edition = edition
        if row == REQUEST:
            self.world, _, _ = original.started(suite, edition)
            _, self.reader, _ = original.projected(self.world)
        else:
            self.world, self.handles = original.new_world(suite, edition)
        self.path = Path(self.world.work)
        self.before = store(self.path)
        self.clock_ns = time.time_ns()
        self.executions = []

    def call(self, mutation):
        if self.row == REQUEST:
            request = original.sreq(self.world)
            if mutation:
                request = clauses.apply(request, *mutation)
            return self.reader.read_current(request)
        edits = {} if mutation is None else {
            'submission': lambda submission: clauses.apply(submission, *mutation),
        }
        return self.world.start.commit_start(original.request(self.world), self.handles, edits=edits)

    def run(self, mutation, cut):
        """Fork the in-memory world. Replay leaves the durable preimage byte-exact."""
        require(store(self.path) == self.before, 'complete-call preimage changed')
        context = multiprocessing.get_context('fork')
        receive, send = context.Pipe(duplex=False)
        process = context.Process(target=self.child, args=(send, mutation, cut))
        process.start()
        send.close()
        try:
            result = receive.recv()
        finally:
            receive.close()
            process.join()
        require(process.exitcode == 0, 'complete-call child failed')
        self.executions.append(result)
        return result

    def child(self, send, mutation, cut):
        before = world.Bank.validate
        evidence = dict(cut=cut, mutation=mutation, before=self.before, observed=[])

        def validate(bank, ref, value, code='root'):
            row = bridge.PREFIX + code + '/schema'
            if row == ARGUMENT and self.row == PRODUCER:
                errors = bank.errors(ref, value)
                first = min(errors, key=lambda e: list(e.absolute_path)) if errors else None
                evidence['argument'] = dict(
                    schema_ref=ref, submission_sha256=sweep.digest(value['producer_submission']),
                    validation_message=first.message if first is not None else None,
                )
            if row != self.row:
                return before(bank, ref, value, code)
            frame = sys._getframe(1)
            site = (str(Path(frame.f_code.co_filename).relative_to(ROOT)), frame.f_lineno)
            require(site == SITES[self.row], f'unexpected schema call site {site}')
            validator = bank.original.validator(ref)
            errors = bank.errors(ref, value)
            first = min(errors, key=lambda e: list(e.absolute_path)) if errors else None
            registry = closure._registry_digest(validator)
            key = (type(validator).__module__ + '.' + type(validator).__qualname__,
                   json.dumps(validator.schema, sort_keys=True), registry, type(bank.original).__qualname__)
            evidence.update(root=closure.root_id(key), registry_sha256=registry, schema=validator.schema,
                            input=copy.deepcopy(value), site=site, schema_errors=closure._signature(errors),
                            validation_message=first.message if first is not None else None)
            evidence['observed'].append((self.row, not errors, site))
            predicate = tables.predicates(tables.rows()[self.row])[self.row]
            refusal = predicate({self.row: not errors}, None)
            require(refusal == (self.row if errors else None), 'gated predicate disagrees with owner bank')
            if refusal is not None and cut is None:
                return before(bank, ref, value, code)
            return value

        try:
            # The wall sample is a sealed test input. Storage still advances
            # its own monotonic clock and validates the resulting timestamp.
            with patch.object(world.Bank, 'validate', validate), patch.object(
                    original.S.time, 'time_ns', return_value=self.clock_ns):
                result = self.call(mutation)
            evidence.update(code=None, errors=[], result_sha256=sweep.digest(result))
        except world.REFUSALS as error:
            code = world.code_of(error)
            evidence.update(code=code, errors=[bridge.row(code)])
        except Exception as error:
            evidence.update(exception=type(error).__name__, detail=str(error)[:350])
        evidence['after'] = store(self.path)
        send.send(evidence)
        send.close()

    def record(self, collector, label, mutation=None, *, expected_code=None, disabled=False):
        label = f'Method B/{self.edition}/{label}'
        action = self.reader.read_current if self.row == REQUEST else self.world.start.commit_start
        original_call = action.__func__
        value = dict(edition=self.edition, mutation=mutation, store=self.before, wall_clock_ns=self.clock_ns,
                     caller=dict(path=str(Path(original_call.__code__.co_filename).relative_to(ROOT)),
                                 line=original_call.__code__.co_firstlineno),
                     arguments_sha256=bridge.descriptor_sha256(
                         original.sreq(self.world) if self.row == REQUEST else
                         (original.request(self.world), self.handles), self.world),
                     world_context_sha256=bridge.descriptor_sha256(vars(self.world), self.world))

        def evaluate(presented):
            require(sweep.digest(presented) == sweep.digest(value), 'changed replay input')
            require(not (tables.CUT - {self.row}), 'a cut outside the pilot row was requested')
            cut = self.row if self.row in tables.CUT else None
            if disabled:
                cut = self.row
            result = self.run(mutation, cut)
            result.update(label=label, input_sha256=sweep.digest(value))
            for name, holds, site in result['observed']:
                collector.observe(name, holds, site)
            require(len(result['observed']) == 1, 'target must be observed once in a complete call')
            require(result['before'] == result['after'] or
                    (self.row == PRODUCER and mutation is None and not result.get('errors')),
                    'passive or refused call changed the store')
            if 'exception' in result:
                raise ValueError(f"complete call raised {result['exception']}: {result['detail']}")
            if not collector.replaying:
                require(result['code'] == expected_code,
                        f"{label}: expected {expected_code!r}, observed {result['code']!r}")
            return result

        result = collector.invoke(label, evaluate, value, valid=mutation is None,
                                  target=self.row if mutation is not None else None, family=FAMILY)
        require(collector.ledger[-1]['outcome'] == ('control' if mutation is None else 'exact_expected'),
                f'{label}: exact complete-call verdict failed: {collector.ledger[-1]}')
        if mutation is not None:
            uncut, cut, restored = self.executions[-3:]
            for field in ('input_sha256', 'before', 'input', 'schema_errors', 'validation_message', 'observed', 'root'):
                require(uncut[field] == cut[field] == restored[field], f'{label}: replay changed {field}')
            require(uncut['code'] == restored['code'], f'{label}: original refusal code changed on restoration')
        return result


def baseline_inputs(path):
    require(sha(path) == MATRIX_SHA, 'started matrix pin mismatch')
    base = json.loads(path.read_text())
    rows = {r['row']: r for r in base['families'][FAMILY]['matrix']}
    files = sorted({report for r in rows.values() for root in (r['schema_closure'] or {}).get('roots', [])
                    for report in root['reports']})
    entries = {}
    for name in SITES:
        entries[name] = {}
        for root in rows[name]['schema_closure']['roots']:
            ident = root['root']
            for report in root['reports']:
                entry = json.loads(Path(report).read_text())['roots'][ident]
                existing = entries[name].setdefault(ident, entry)
                require(existing['clauses'].keys() == entry['clauses'].keys(), f'{ident}: historical inventory mismatch')
                require(existing['registry_sha256'] == entry['registry_sha256'], f'{ident}: historical registry mismatch')
    return base, files, entries


def clause_proof(bank, capture, baseline, row, *, disable_cut=False):
    """Reapply a fixed, already declared edit per exact clause, preserving its root."""
    ident = capture['root']
    require(capture['registry_sha256'] == baseline['registry_sha256'], f'{ident}: wrong registry')
    plain = bank.original.validator(capture['schema']['$ref'])
    require(closure._registry_digest(plain) == capture['registry_sha256'], f'{ident}: bank changed')
    validator = closure.closure_validator(plain, ident, bank.original)
    unresolved = len(clauses.UNRESOLVED)
    nodes = clauses.walk(validator)
    require(len(clauses.UNRESOLVED) == unresolved, f'{ident}: unresolved owner reference')
    inventory = defaultdict(list)
    for location, info in nodes.items():
        for keyword in clauses.clauses_of(info['node']):
            inventory[location + '/' + clauses.name_of(keyword)].append((keyword, info))
    historical = baseline['clauses']
    require(inventory.keys() == historical.keys(), f'{ident}: inventory drift '
            f'(missing={sorted(historical.keys() - inventory.keys())}, added={sorted(inventory.keys() - historical.keys())})')
    predicate = tables.predicates(tables.rows()[row])[row]
    base_value = capture['input']
    cases = {}
    collisions = {}
    for key, assertions in sorted(inventory.items()):
        if len(assertions) != 1:
            collisions[key] = literal_closure_cuts(validator, plain, assertions, historical[key], base_value)
            continue
        (keyword, info), = assertions
        previous = historical[key]
        if previous['cls'] == 'SELECTOR_OR_NEGATED':
            require(all(any(c[0] in clauses.APART for c in reach['ctx']) for reach in info['reach']),
                    f'{ident}: selector premise failed for {key}')
            cases[key] = dict(cls='SELECTOR_OR_NEGATED', contexts=sorted({c[0] for r in info['reach']
                              for c in r['ctx'] if c[0] in clauses.APART}))
            continue
        path = previous['path']
        edit = ast.literal_eval(previous['edit'])
        control = copy.deepcopy(base_value)
        control_kind = 'complete_call'
        if '/ProducerSubmission/allOf/0/then/' in key:
            control.update(scope_kind='application', project_id=None)
            control_kind = 'schema_branch_application'
        if path == ['payload', 'approval_refs'] and 'approval_refs' not in control['payload']:
            control['payload']['approval_refs'] = ['TEST_ONLY:approval:pilot']
            control_kind = 'schema_branch_approval'
        changed = clauses.apply(control, path, edit)
        # A root-level null is a real input. go.apply also returns None for an
        # unavailable path; accessing the old path first rules that case out.
        clauses.get(control, path)
        before = clauses.errors_of(validator, changed)
        actual = list(plain.iter_errors(changed))
        require(closure._signature(before) == closure._signature(actual), f'{ident}: validator drift for {key}')
        require(not list(plain.iter_errors(control)) and not clauses.errors_of(validator, control),
                f'{ident}: refused clause control for {key}')
        hits = clauses.locations(before)
        require((key, tuple(path)) in located_errors(before),
                f'{ident}: declared edit missed {key} at {path}: {sorted(hits)}')
        cut_id = common.schema_guard(info['node'], keyword)
        cut = clauses.errors_of(validator, changed, () if disable_cut else {cut_id})
        restored = clauses.errors_of(validator, changed)
        require(key not in clauses.locations(cut) and
                closure._signature(before) == closure._signature(restored) and hits == clauses.locations(restored),
                f'{ident}: own clause cut/restoration failed for {key}')
        require(predicate({row: not actual}, None) == row and predicate({row: True}, None) is None,
                f'{ident}: gated row disagrees at {key}')
        cases[key] = dict(cls='COVERED_LATER' if cut else 'KILLED', control=control_kind,
                          control_sha256=sweep.digest(control), input_sha256=sweep.digest(changed),
                          path=path, edit=previous['edit'], before=sorted(hits),
                          cut=sorted(clauses.locations(cut)), restored=sorted(clauses.locations(restored)))
    counts = Counter(c['cls'] for c in cases.values())
    return dict(rows=[row], families=[FAMILY], schema=json.dumps(capture['schema'], sort_keys=True),
                registry_sha256=capture['registry_sha256'], clauses=cases, counts=dict(counts),
                source=schema_documents(bank, capture['schema']['$ref'].split('#', 1)[0]),
                collisions=collisions, historical_clause_ids=sorted(historical),
                literal_assertions=sum(map(len, inventory.values())),
                verify=dict(passed=counts['KILLED'] + counts['COVERED_LATER'], failed=0, unverifiable=0))


def located_errors(errors):
    for error in errors:
        key = common._SCHEMA_LOCATIONS.get(getattr(error, 'oracle_guard', None))
        if key:
            yield key, tuple(error.absolute_path)
        yield from located_errors(error.context)


def literal_closure_cuts(validator, plain, assertions, historical, control):
    """Diagnose the producer's two distinct closure keywords under one DG5 key."""
    require({keyword for keyword, _ in assertions} == {'additionalProperties', 'unevaluatedProperties'},
            'unexpected inventory collision')
    changed = clauses.apply(control, historical['path'], ast.literal_eval(historical['edit']))
    before = clauses.errors_of(validator, changed)
    require(closure._signature(before) == closure._signature(plain.iter_errors(changed)),
            'producer collision diagnostic diverges from the owner validator')
    require(not clauses.errors_of(validator, control), 'producer collision control refused')
    results = []
    for keyword, info in assertions:
        node = info['node']
        require(node[keyword] is False and any(e.schema is node and e.validator == keyword for e in before),
                f'{keyword}: declared edit did not trigger the literal assertion')
        contents = dict(node)
        try:
            del node[keyword]
            cut = clauses.errors_of(validator, changed)
        finally:
            node.clear()
            node.update(contents)
        restored = clauses.errors_of(validator, changed)
        require(not any(e.schema is node and e.validator == keyword for e in cut) and
                closure._signature(before) == closure._signature(restored) and
                not clauses.errors_of(validator, control), f'{keyword}: literal cut/restoration failed')
        results.append(dict(owner=node['x-pm-oracle-id'] + '/' + keyword, before=closure._signature(before),
                            cut=closure._signature(cut), restored=closure._signature(restored)))
    return dict(control_sha256=sweep.digest(control), input_sha256=sweep.digest(changed),
                disposition='uncredited: distinct assertions share one DG5 inventory id', assertions=results)


def replay_request_clauses(call, entry, output):
    """Drive every request clause witness through the original accepted reader route."""
    ledger = []
    for key, evidence in entry['clauses'].items():
        require(evidence['cls'] == 'KILLED', f'{key}: the individual request rule cut must accept')
        mutation = (evidence['path'], ast.literal_eval(evidence['edit']))
        path = '/'.join(mutation[0])
        keyword = key.rsplit('/', 1)[-1]
        if keyword == 'closed_members':
            keyword = 'additionalProperties'
        expected = f'read_current/request/schema/{path}:{keyword}'
        result = call.run(mutation, None)
        require(result.get('code') == expected and result['errors'] == [REQUEST] and
                result['before'] == result['after'] and sweep.digest(result['input']) == evidence['input_sha256'],
                f'{key}: the complete reader did not refuse the exact clause edit')
        ledger.append(dict(clause=key, expected_code=expected, code=result['code'], errors=result['errors'],
                           validation_message=result['validation_message'],
                           input_sha256=evidence['input_sha256'], store_sha256=sweep.digest(result['before'])))
    write(output / 'request-clause-boundaries.json', ledger)

def producer_implication(bank, capture, *, disable_forwarding=False):
    """Verify forwarding of the same invalid submission to a required owner ref."""
    method = original.ST.StartOwner.commit_start
    source_lines, first_line = inspect.getsourcelines(method)
    source = textwrap.dedent(''.join(source_lines))
    if disable_forwarding:
        source = source.replace('producer_submission=submission', 'producer_submission={}', 1)
    tree = ast.parse(source)
    function = tree.body[0]
    context = next(s for s in function.body if isinstance(s, ast.With))
    statements = [ast.unparse(s) for s in context.body]
    first = statements.index("e.bank.validate(e.custody + '#/$defs/TypedProducerSubmission', submission, 'start/producer')")
    later = statements.index("e.bank.validate(e.custody + '#/$defs/OriginalWorkflowArgument', argument, 'start/argument')")
    span = context.body[first + 1:later]
    require(len(span) == 4 and isinstance(span[2], ast.Assign) and
            isinstance(span[2].value, ast.Call) and
            ast.unparse(span[2].targets[0]) == 'argument' and
            ast.unparse(span[2].value.func) == 'dict', 'producer forwarding shape changed')
    forwarding = [ast.unparse(k.value) for k in span[2].value.keywords if k.arg == 'producer_submission']
    require(forwarding == ['submission'] and
            ast.unparse(span[0]).startswith('S.validate_event_record(dict(submission, ') and
            ast.unparse(span[1]) == "require('start/replay_only_not_appendable', submission['replay_policy'] != 'projector_replay_only')" and
            ast.unparse(span[3]) == "if 'argument' in edits:\n    argument = edits['argument'](argument)",
            'producer forwarding premise changed')
    producer_ref = capture['schema']['$ref']
    argument_ref = producer_ref.replace('#/$defs/TypedProducerSubmission', '#/$defs/OriginalWorkflowArgument')
    definition = bank.lookup(argument_ref)
    argument = definition.contents
    member = argument['properties']['producer_submission']
    require(argument['type'] == 'object' and 'producer_submission' in argument['required'] and
            member == {'$ref': producer_ref},
            'OriginalWorkflowArgument does not require exactly the producer definition')
    resolved = definition.resolver.lookup(member['$ref'])
    require(resolved.contents is bank.lookup(producer_ref).contents,
            'producer and argument resolve different owner definitions')
    return dict(source_path=SITES[PRODUCER][0], source_sha256=TOOL_PINS[SITES[PRODUCER][0]],
                producer_site=SITES[PRODUCER][1], argument_site=first_line + context.body[later].lineno - 1,
                argument_constraint=argument_ref + '/properties/producer_submission',
                schema_source=schema_documents(bank, producer_ref.split('#', 1)[0]),
                producer_ref=producer_ref, registry_sha256=capture['registry_sha256'],
                condition='The submission is the only edited input. The argument edit seam is absent.',
                dependency=ARGUMENT)

def run_gates(collector, output, rows):
    proof = output / 'proof'
    table_dir = proof / 'tables'
    table_dir.mkdir(parents=True)
    require(not collector.failures, f'complete-call failures: {collector.failures}')
    summaries, results = [], []
    vectors = sweep.table_records(collector)
    for row in rows:
        ident = sweep.table_id([row])
        report = sweep.prove_table(collector, ident, [row], vectors, table_dir,
                                   module_name=PREFIX + ident)
        require(report['status'] == 'PASS' and report['proved'] == [row], f'gated table failed: {report}')
        summaries.append(report)
        results.append(dict(guard=row, table=ident, status='PASS', table_status='PASS'))
    write(table_dir / 'summary.json', summaries)
    write(table_dir / 'rows.json', results)
    write(proof / 'family-rows.json', {FAMILY: list(rows)})
    write(proof / 'collection.json', dict(calls=collector.calls, failures=collector.failures,
                                         rows={r: {'sites': sorted(collector.rows[r]['sites'])} for r in rows}))
    files = {'scripts/' + PREFIX + sweep.table_id([r]) + '.py' for r in rows}
    files.update(TOOL_PINS)
    files.update(str(Path(module.__file__).relative_to(ROOT)) for module in
                 (bridge, closure, original, world, clauses, sweep, tables, common))
    files.add(str(Path(__file__).relative_to(ROOT)))
    write(proof / 'source-bindings.json', {'files': {p: sha(ROOT / p) for p in sorted(files)}})
    for filename, value in (('ledger', collector.ledger), ('signatures', [sorted(s) for s in collector.signature_list])):
        with gzip.open(proof / (filename + '.json.gz'), 'wt') as stream:
            json.dump(value, stream, sort_keys=True)
    return proof


def run_matrix(base, files, proof, output):
    command = [sys.executable, '-B', matrix.__file__, *base['proof_dirs']]
    if proof:
        command.append(str(proof))
    command += ['--family', FAMILY, '--out', str(output)]
    for shared in base['shared_proof_dirs']:
        command += ['--shared-proof', shared]
    for file in files:
        command += ['--closure', str(file)]
    subprocess.run(command, cwd=ROOT, check=True)
    return {r['row']: r for r in json.loads(output.read_text())['families'][FAMILY]['matrix']}


def check_matrix_scope(baseline, combined, selected, proof):
    """Allow the stock matrix's extra replay citation, but give it no pilot credit."""
    require(baseline.keys() == combined.keys(), 'matrix row inventory changed')
    added_citations = []
    for name, before in baseline.items():
        after = combined[name]
        if name in selected or before == after:
            continue
        comparison = copy.deepcopy(after)
        justification = comparison.get('justification') or {}
        if justification.get('kind') == 'witness_bound_not_run':
            # At 91a53cd4db every family proof directory is listed in the
            # replay of this class. This directory contains only two rows.
            replay = justification['replay']
            scoped = [entry for entry in replay if entry['proof_dir'] == str(proof)]
            if scoped:
                justification['replay'] = [entry for entry in replay if entry not in scoped]
                added_citations.append(name)
        require(comparison == before, f'matrix changed outside the selected rows: {name}')
    return added_citations


def main():
    cli = argparse.ArgumentParser(description=__doc__)
    cli.add_argument('--matrix', type=Path, required=True)
    cli.add_argument('--out', type=Path, required=True)
    cli.add_argument('--only', choices=('request', 'producer', 'both'), default='both')
    cli.add_argument('--disable', choices=('request-row', 'producer-row', 'clause-cut', 'inventory', 'producer-forwarding'))
    args = cli.parse_args()
    require(all(sha(ROOT / path) == digest for path, digest in TOOL_PINS.items()), 'pinned checker or tool drift')
    configure_tables()
    base, files, inventory = baseline_inputs(args.matrix)
    args.out.mkdir(parents=True)
    scratch = args.out / 'stores'
    scratch.mkdir()
    suite = original.Suite(scratch)
    collector = sweep.Collector()
    selected = []
    captured = {}
    start = time.monotonic()
    row_seconds = {}
    implications = {}
    if args.only in ('request', 'both'):
        reader = SourceCall(suite, REQUEST, 'v3')
        reader.record(collector, 'StartedReaders.read_current/control')
        reader.record(collector, 'StartedReaders.read_current/extra_request_member',
                      ([], ('add', 'gc_extra_member')),
                      expected_code='read_current/request/schema/:additionalProperties',
                      disabled=args.disable == 'request-row')
        require(collector.ledger[-1]['kill'] == 'KILLED', 'request whole-row cut must accept')
        reader.record(collector, 'StartedReaders.read_current/restored_control')
        require(reader.executions[0]['result_sha256'] == reader.executions[-1]['result_sha256'],
                'restored reader control changed the result')
        captured[REQUEST] = [(reader, reader.executions[0])]
        write(args.out / 'request-calls.json', reader.executions)
        selected.append(REQUEST)
        row_seconds[REQUEST] = time.monotonic() - start
    if args.only in ('producer', 'both'):
        started = time.monotonic()
        for edition in ('v3', 'v7'):
            producer = SourceCall(suite, PRODUCER, edition)
            if edition == 'v3':
                mutation = (['payload', 'expected_goal_run_revision'], str(original.ST.BEFORE_REVISION))
                code = 'start/producer/schema/payload/expected_goal_run_revision:type'
            else:
                mutation = (['payload_schema_id'], 'pm.goal_runtime_event.goal_run_started.schema.v2')
                code = 'start/producer/schema/payload_schema_id:const'
            producer.record(collector, 'StartOwner.commit_start/authored_negative', mutation, expected_code=code,
                            disabled=args.disable == 'producer-row')
            refused, cut, restored = producer.executions[:3]
            require(collector.ledger[-1]['kill'] == 'COVERED_LATER' and
                    collector.ledger[-1]['cut_errors'] == [ARGUMENT] and
                    cut['code'] == code.replace('start/producer/schema/',
                                                'start/argument/schema/producer_submission/') and
                    'argument' not in refused and 'argument' not in restored and
                    cut['argument']['submission_sha256'] == sweep.digest(refused['input']) and
                    cut['argument']['validation_message'] == refused['validation_message'],
                    'producer cut must expose the exact argument-schema covering refusal')
            producer.record(collector, 'StartOwner.commit_start/control')
            captured.setdefault(PRODUCER, []).append((producer, producer.executions[-1]))
            write(args.out / f'producer-{edition}-calls.json', producer.executions)
        selected.append(PRODUCER)
        row_seconds[PRODUCER] = time.monotonic() - started
    report = {}
    missing = {}
    for row in selected:
        started = time.monotonic()
        seen = set()
        for call, capture in captured[row]:
            bank = call.world.edition.bank
            ident = capture['root']
            expected = copy.deepcopy(inventory[row][ident])
            if args.disable == 'inventory':
                expected['clauses'].pop(next(iter(expected['clauses'])))
            if row == PRODUCER:
                implications[ident] = producer_implication(bank, capture,
                                                           disable_forwarding=args.disable == 'producer-forwarding')
            try:
                entry = clause_proof(bank, capture, expected, row, disable_cut=args.disable == 'clause-cut')
            except (ValueError, KeyError) as error:
                if row == REQUEST:
                    raise
                entry = dict(rows=[row], families=[FAMILY], registry_sha256=capture['registry_sha256'],
                             error=str(error), historical_clause_ids=sorted(expected['clauses']))
            report[ident] = entry
            if row == REQUEST:
                replay_request_clauses(call, entry, args.out)
            seen.add(ident)
        missing[row] = sorted(set(inventory[row]) - seen)
        row_seconds[row] += time.monotonic() - started
    closure_output = args.out / 'clause-replay.json'
    write(args.out / 'clause-diagnostics.json', dict(roots=report, producer_implications=implications))
    write(closure_output, dict(roots={ident: entry for ident, entry in report.items()
                                    if not entry.get('collisions') and not entry.get('error')}))
    proof = run_gates(collector, args.out, selected)
    matrix_start = time.monotonic()
    # Include the existing inventory for every row. Replay reports contribute
    # only exact inventories, including roots with zero remaining clauses.
    baseline = run_matrix(base, files, None, args.out / 'baseline-matrix.json')
    provided = {r['row']: r for r in base['families'][FAMILY]['matrix']}
    require(baseline == provided, 'the supplied matrix cannot be reproduced from its cited reports')
    combined = run_matrix(base, [*files, closure_output], proof, args.out / 'matrix.json')
    scoped_citations = check_matrix_scope(baseline, combined, selected, proof)
    changed = sorted(name for name in baseline if baseline[name]['status'] != combined[name]['status'])
    require(changed == ([REQUEST] if REQUEST in selected else []), f'unexpected matrix status changes: {changed}')
    if REQUEST in selected:
        require(not missing[REQUEST] and combined[REQUEST]['status'] == 'CLOSED',
                'matrix did not close the reader with exact inventory')
    summary = dict(seconds=round(time.monotonic() - start, 3),
                   row_seconds={row: round(seconds, 3) for row, seconds in row_seconds.items()},
                   matrix_seconds=round(time.monotonic() - matrix_start, 3),
                   matrix_changes=changed, missing_root_replays=missing,
                   scoped_replay_citations_excluded=scoped_citations,
                   producer_dependency=combined.get(ARGUMENT, {}).get('status'),
                   results={row: combined[row] for row in selected})
    write(args.out / 'summary.json', summary)
    print(json.dumps({row: (combined[row]['status'], combined[row]['reason']) for row in selected}))
    return 0


if __name__ == '__main__':
    sys.exit(main())
