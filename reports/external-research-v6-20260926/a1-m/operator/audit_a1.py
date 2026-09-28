#!/usr/bin/env python3
"""Read-only A1-M mechanical audit. No inference, research or semantic grading."""
import argparse
import hashlib
import importlib.util
import json
import sys
from collections import Counter
from pathlib import Path

sys.dont_write_bytecode = True
SOURCE_COMMIT = '655fa669c71fa9832df479a16efd3b54f425dd08'
LAB = Path(__file__).resolve().parents[1]
PINS = {
    'ack-boundary-v1/tools/completion_store.py': 'a1e460bd38afa2fab09d28442a7b59d2ac295aaee8921f9c127b57946c20f909',
    'ack-boundary-v1/tools/native_completion.py': '83dac66a29bc0778ed0edfa134fd04db03eda34602e5c80d5938c17c4dc2fd38',
    'i2-prep/tools/research_store.py': '8cba600b240cddb6951aa600146e3b0ccc8d4d1ffcd7e90bedc5f99378b05762',
    'delivery-v2/tools/delivery_store.py': '81364fd1a4040ba457dd04779d096709c3524bee8704a2c8f453fb18264c85c7',
    'offline-repair-v1/tools/delivery.py': 'e1c7ea2e32bd00ef2606b5974b690a4537b6b200fd3c4e620880ae430b9ebe59',
}


def digest(raw):
    return hashlib.sha256(raw).hexdigest()


def raw(path):
    if path.is_symlink() or not path.is_file():
        raise ValueError('missing/nonregular file: ' + str(path))
    return path.read_bytes()


def load(path):
    return json.loads(raw(path))


def module(name, path):
    spec = importlib.util.spec_from_file_location(name, path)
    result = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(result)
    return result


def frames(path):
    data = raw(path)
    if data and not data.endswith(b'\n'):
        raise ValueError('unterminated native journal')
    for line in data.splitlines():
        frame = json.loads(line)
        if frame.get('retained_frame') == 'session_permission_transaction':
            for child in frame['children']:
                yield json.loads(child['record_json'])
        else:
            yield frame


def exact_path(value, ws):
    if not isinstance(value, str) or not value or '..' in Path(value).parts:
        raise ValueError('invalid native path')
    path = Path(value)
    path = path if path.is_absolute() else ws / path
    if not path.is_relative_to(ws):
        raise ValueError('native path outside workspace: ' + value)
    return str(path)


class Audit:
    def __init__(self, root):
        self.root = root.absolute()
        self.ws, self.store = self.root / 'ws', self.root / 'store'
        self.checks = {}

    def check(self, name, function):
        try:
            self.checks[name] = function()
        except (OSError, ValueError, KeyError, TypeError, IndexError, AttributeError) as exc:
            self.checks[name] = {'status': 'fail', 'errors': [type(exc).__name__ + ': ' + str(exc)]}

    @staticmethod
    def result(errors, **details):
        return {'status': 'fail' if errors else 'pass', 'errors': errors, **details}

    def sources(self):
        errors = [str(path) + ': pin mismatch' for path, expected in PINS.items()
                  if digest(raw(LAB / path)) != expected]
        if not errors:
            self.native = module('a1_native_reader', LAB / 'ack-boundary-v1/tools/native_completion.py')
            self.parser = module('a1_completion_store', LAB / 'ack-boundary-v1/tools/completion_store.py').base
        return self.result(errors, source_commit=SOURCE_COMMIT, checked_sha256=PINS)

    def inventory(self):
        self.state = load(self.store / 'state.json')
        self.current = load(self.store / 'current.json')
        self.history = load(self.store / 'history.json')
        raw(self.ws / 'task.txt')
        self.attempts = self.state['attempts']
        by_request = {a['request']: a for a in self.attempts}
        initial = ['new--batch-' + str(i).zfill(2) for i in range(1, 7)] + ['new--independent']
        fid = by_request['new--batch-01']['finding_id']
        self.expected = dict(zip(initial, ['inputs/' + str(i).zfill(2) + '.md' for i in range(1, 8)]))
        self.expected.update({fid + '--revision-1': 'inputs/revision-1.md', fid + '--revision-2': 'inputs/revision-2.md'})
        self.by_request, self.fid = by_request, fid
        errors = []
        if Counter(a['request'] for a in self.attempts) != Counter(self.expected.keys()):
            errors.append('expected exactly one acknowledgement for each of nine request names')
        if len({by_request[n]['finding_id'] for n in initial}) != 7:
            errors.append('seven initial records must have distinct finding identities')
        if self.state.get('protocol_errors') or self.state.get('pending_submissions') or self.state.get('orphan_payloads'):
            errors.append('protocol errors, pending submissions or orphan payloads retained')
        if self.state.get('closed') is not True or self.state.get('close_reason') != 'completed':
            errors.append('receiver did not close normally')
        if self.state.get('native_stream_status') != 'closed':
            errors.append('native stream did not finalize closed')
        for directory, names in ((self.ws / 'out/submissions', {n + '.md' for n in self.expected}),
                                 (self.ws / 'out/requests', set(self.expected))):
            if {p.name for p in directory.iterdir()} != names:
                errors.append('unexpected/missing submission paths: ' + str(directory))
        if [a['sequence'] for a in self.attempts] != list(range(1, 10)):
            errors.append('acknowledgement sequence must be contiguous 1..9')
        return self.result(errors, acknowledged=len(self.attempts), expected_requests=list(self.expected))

    def fidelity(self):
        errors, hashes = [], {}
        for name, template in self.expected.items():
            a = self.by_request[name]
            content = raw(self.ws / template)
            if len(content) > 4096:
                errors.append(name + ': template exceeds 4096 UTF-8 bytes')
            content.decode('utf-8')
            for kind, path, expected, hash_key in (
                    ('payload', self.ws / 'out/submissions' / (name + '.md'), content, 'raw_sha256'),
                    ('marker', self.ws / 'out/requests' / name, b'submit\n', 'marker_sha256')):
                snap_key = 'snapshot' if kind == 'payload' else 'marker_snapshot'
                snapshot = self.store / a[snap_key]
                if not snapshot.is_relative_to(self.store / 'snapshots') or '..' in Path(a[snap_key]).parts:
                    raise ValueError('snapshot outside expected directory')
                data, saved = raw(path), raw(snapshot)
                if data != expected or saved != expected or a[hash_key] != digest(expected):
                    errors.append(name + ': ' + kind + ' template/live/snapshot/hash mismatch')
                hashes[str(snapshot.relative_to(self.store))] = digest(saved)
            parsed, reason = self.parser.parse_finding(content, a['finding_id'], not name.startswith('new--'))
            if parsed != a['finding'] or reason != a['change_reason']:
                errors.append(name + ': parsed typed finding/change_reason differs from template')
            if a['status'] != 'VALID_UNVERIFIED' or a.get('invalidated') or a.get('diagnostics'):
                errors.append(name + ': invalid, mutated or diagnostic-bearing acknowledgement')
            receipt = load(self.ws / 'feedback' / (name + '.json'))
            for key in ('request', 'sequence', 'finding_id', 'revision', 'status', 'diagnostics', 'raw_sha256', 'snapshot'):
                if receipt.get(key) != a[key]:
                    errors.append(name + ': receipt field mismatch: ' + key)
            if receipt.get('structural_only') is not True or receipt.get('semantic_validation') != 'not_performed':
                errors.append(name + ': receipt structural scope mismatch')
        actual_snapshots = {str(p.relative_to(self.store)) for p in (self.store / 'snapshots').iterdir()}
        if len(hashes) != 18 or actual_snapshots != set(hashes):
            errors.append('expected exactly 18 distinct snapshot files')
        return self.result(errors, snapshot_count=len(hashes), snapshot_sha256=hashes,
                           preservation='Exact input bytes and typed parsed text, including quoted/code bodies; no marker-anywhere inference.')

    def lineage(self):
        errors = []
        if self.history.get('attempts') != self.attempts or self.history.get('history_gaps') or self.history.get('pending_submissions'):
            errors.append('history does not retain exact acknowledgement records without gaps')
        ordered = sorted(self.attempts, key=lambda a: (a['native_lineage_ordinal'], a['sequence']))
        latest = {}
        for a in ordered:
            latest[a['finding_id']] = a['finding']
        projected = self.parser.legacy.project_current({'schema': self.parser.legacy.SCHEMA_DRAFT, 'findings': list(latest.values())})
        projected.update(delivery_status='STRUCTURALLY_COMPLETE_UNVERIFIED', incomplete_records={})
        if self.current != projected:
            errors.append('current differs from latest native-order typed projection')
        trio = [self.by_request[n] for n in ('new--batch-01', self.fid + '--revision-1', self.fid + '--revision-2')]
        if [a['revision'] for a in trio] != [1, 2, 3] or not trio[0]['native_lineage_ordinal'] < trio[1]['native_lineage_ordinal'] < trio[2]['native_lineage_ordinal']:
            errors.append('batch-01 revision lineage is not initial→revision-1→revision-2')
        def body(finding):
            return (finding['title'], [(p['id'], p['type'], p['text'].rstrip('\r\n')) for p in finding['parts']])
        if body(trio[0]['finding']) != body(trio[2]['finding']) or body(trio[0]['finding']) == body(trio[1]['finding']):
            errors.append('revision-1 must change typed content and revision-2 must restore the initial typed finding')
        if not trio[1]['change_reason'] or not trio[2]['change_reason']:
            errors.append('both explicit revisions require retained change_reason')
        return self.result(errors, current_finding_count=len(self.current.get('findings', [])),
                           restoration_comparison='Typed title/part bodies, ignoring only terminal CR/LF before appended change_reason; raw/template comparison remains exact.',
                           revision_change_reasons=[a['change_reason'] for a in trio[1:]])

    def native_proof(self):
        binding = self.state['native_finalization'].get('binding')
        if not binding:
            raise ValueError('no final native session binding')
        self.session_id = binding['session_id']
        captured = self.root / 'native/muse-session.jsonl'
        journal = captured if captured.exists() else Path(binding['journal_path'])
        self.reader = self.native.CompletionReader(journal, session_id=self.session_id, workspace_root=self.ws)
        final = self.reader.finalize('completed')
        errors = []
        if final['status'] != 'closed' or final.get('fault'):
            errors.append('native reader finalization: ' + str(final))
        self.calls = {}
        self.results = {}
        for frame in frames(journal):
            payload = frame.get('payload', {})
            event = payload.get('event', {})
            if event.get('kind') == 'assistant_tool_calls_committed':
                for call in event['tool_calls']:
                    args = json.loads(call['args'])
                    path = exact_path(args['path'], self.ws) if 'path' in args else None
                    self.calls[call['call_id']] = {'name': call['name'], 'path': path, 'sequence': frame['sequence'],
                        'recorded_at': frame.get('recorded_at'), 'run_id': payload['run_id']}
                    if call['name'] not in {'read_file', 'write_file'}:
                        errors.append('tool outside permitted file catalogue: ' + call['name'])
                    if call['name'] == 'write_file' and (path is None or Path(path).parent not in {self.ws / 'out/submissions', self.ws / 'out/requests'}):
                        errors.append('native write outside exact submission directories')
            elif event.get('kind') == 'tool_result_batch_committed':
                for result in event['results']:
                    self.results.setdefault(result['tool_call_id'], []).append(result)
        native_paths = Counter(c['path'] for c in self.calls.values() if c['name'] == 'write_file')
        expected_paths = Counter(str(self.ws / 'out/submissions' / (n + '.md')) for n in self.expected)
        expected_paths.update(str(self.ws / 'out/requests' / n) for n in self.expected)
        if native_paths != expected_paths:
            errors.append('native writes must consist of exactly 18 expected exact paths once each')
        for name, a in self.by_request.items():
            proof = self.reader.pair_proof(self.ws / 'out/submissions' / (name + '.md'), self.ws / 'out/requests' / name)
            if proof != a['completion_proof'] or proof['status'] != 'complete':
                errors.append(name + ': retained completion proof differs from independently parsed native proof')
            if a['native_lineage_ordinal'] != max(proof[k].get('ordinal', 0) for k in ('payload', 'marker')):
                errors.append(name + ': native lineage ordinal mismatch')
        return self.result(errors, journal_path=str(journal), journal_sha256=digest(raw(journal)),
                           session_id=self.session_id, native_calls=len(self.calls), native_writes=sum(native_paths.values()))

    def batching(self):
        groups = {}
        for kind in ('payload', 'marker'):
            ops = [self.by_request['new--batch-' + str(i).zfill(2)]['completion_proof'][kind] for i in range(1, 7)]
            groups[kind] = {'call_sequences': sorted({o['call_sequence'] for o in ops}),
                            'call_ids': [o['call_id'] for o in ops]}
        batched = all(len(v['call_sequences']) == 1 for v in groups.values())
        return {'status': 'pass' if batched else 'inconclusive', 'groups': groups,
                'reason': None if batched else 'Six payload/marker calls were not each demonstrated in one native batch.'}

    def overlap(self):
        ops = [self.by_request['new--batch-' + str(i).zfill(2)]['completion_proof']['marker'] for i in range(1, 7)]
        pairs = [[a['call_id'], b['call_id']] for i, a in enumerate(ops) for b in ops[i + 1:]
                 if max(a['started_sequence'], b['started_sequence']) < min(a['terminal_sequence'], b['terminal_sequence'])]
        return {'status': 'pass' if pairs else 'inconclusive', 'overlapping_pairs': pairs,
                'reason': None if pairs else 'No overlap between two marker lifecycle intervals was observed.'}

    def receipt_order(self):
        path = self.root / 'receipt-order.jsonl'
        if not path.exists():
            return {'status': 'inconclusive', 'reason': 'Host receipt publication evidence unavailable.'}
        events = [json.loads(line) for line in raw(path).splitlines()]
        publications = [e for e in events if e.get('kind') == 'receipt_published']
        errors, unknown, evidence = [], [], []
        self.qualified_receipt_reads = {}
        if Counter(e['request'] for e in publications) != Counter(self.expected.keys()):
            errors.append('expected one host receipt publication per request')
        for name in self.expected:
            matching = [e for e in publications if e['request'] == name]
            if len(matching) != 1:
                continue
            publication = matching[0]
            a = self.by_request[name]
            receipt_path = self.ws / 'feedback' / (name + '.json')
            receipt_data = raw(receipt_path)
            for key in ('sequence', 'finding_id', 'revision', 'status'):
                if publication.get(key) != a[key]:
                    errors.append(name + ': publication ' + key + ' mismatch')
            if publication.get('receipt_sha256') != digest(receipt_data) or publication.get('snapshot_sha256') != a['raw_sha256'] or publication.get('marker_snapshot_sha256') != a['marker_sha256']:
                errors.append(name + ': host receipt/snapshot digest mismatch')
            if publication.get('snapshots_and_state_precede_receipt') is not True:
                errors.append(name + ': snapshots/state were not demonstrated before receipt')
            reads = [(cid, c) for cid, c in self.calls.items() if c['name'] == 'read_file' and c['path'] == str(receipt_path)]
            qualified, pending_attempts = [], []
            for cid, call in reads:
                op = self.reader.operations[cid]
                completed = op['status'] == 'complete' and len(self.results.get(cid, [])) == 1
                try:
                    # Native journal recorded_at is epoch microseconds; host uses nanoseconds.
                    later = int(call['recorded_at']) * 1000 >= int(publication['receipt_published_epoch_ns'])
                except (TypeError, ValueError, KeyError):
                    later = None
                if later is not True or not completed:
                    pending_attempts.append({'call_id': cid, 'completed': completed, 'post_publication_logtime': later})
                if completed and later is True:
                    qualified.append({'call_id': cid, 'call_sequence': call['sequence'],
                                      'complete_sequence': op['complete_sequence']})
            if not qualified:
                unknown.append(name + ': no completed receipt read with qualified publication/read logtime order')
            self.qualified_receipt_reads[name] = qualified
            evidence.append({'request': name, 'qualified_reads': qualified, 'pending_or_ambiguous_read_attempts': pending_attempts})
        return {'status': 'fail' if errors else 'inconclusive' if unknown else 'pass', 'errors': errors,
                'unknowns': unknown, 'reads': evidence, 'receipt_order_sha256': digest(raw(path)),
                'basis': 'Host wrapper validates state/snapshot files before publishing receipt; host post-write epoch-ns and native committed-call epoch-us logtimes establish bounded ordering, not syscall times.'}

    def goal_scope(self):
        receipt = load(self.root / 'native/receipt.json')
        host = load(self.root / 'host-receipt.json')
        errors = []
        if receipt.get('session_id') != self.session_id or receipt.get('goal_ack', {}).get('status') != 'accepted':
            errors.append('native launch receipt lacks matching session/single Goal acknowledgement')
        for key, expected in (('fresh_session', True), ('stop_reason', 'goal_complete'),
                              ('model_id', 'muse-spark-1.3-contributor'), ('effort_effective', 'max')):
            if receipt.get(key) != expected:
                errors.append('native receipt ' + key + ' mismatch')
        if receipt.get('caps') != {'seconds': 300, 'responses': 48} or not isinstance(receipt.get('native_responses'), int) or receipt['native_responses'] > 48:
            errors.append('native declared cap/observed response allocation mismatch')
        for key, expected in (('process_exit', 0), ('error', None), ('inputs_unchanged', True), ('structurally_complete', True)):
            if host.get(key) != expected:
                errors.append('host receipt ' + key + ' mismatch')
        if receipt.get('driver_error'):
            errors.append('native driver retained error')
        return self.result(errors, session_id=self.session_id, goal_ack=receipt.get('goal_ack'),
                           limitation='Receipt reads bind to the same fresh session and host single-Goal launch receipt; individual read events do not carry a Goal identity.')

    def prescribed_order(self):
        errors, unknown, evidence = [], [], {}
        batch = [self.by_request['new--batch-' + str(i).zfill(2)]['completion_proof'] for i in range(1, 7)]
        if max(p['payload']['complete_sequence'] for p in batch) >= min(p['marker']['call_sequence'] for p in batch):
            errors.append('marker batch committed before all six payload results')
        independent = self.by_request['new--independent']['completion_proof']
        if max(p['marker']['complete_sequence'] for p in batch) >= independent['payload']['call_sequence']:
            errors.append('independent payload committed before all six marker results')
        reads = getattr(self, 'qualified_receipt_reads', {})
        rev1, rev2 = self.fid + '--revision-1', self.fid + '--revision-2'
        for following, predecessors in ((rev1, [n for n in self.expected if n.startswith('new--')]), (rev2, [rev1])):
            call = self.by_request[following]['completion_proof']['payload']['call_sequence']
            evidence[following] = {'payload_call_sequence': call, 'predecessor_read_complete_sequences': {}}
            for name in predecessors:
                completions = [r['complete_sequence'] for r in reads.get(name, [])]
                evidence[following]['predecessor_read_complete_sequences'][name] = completions
                if not completions:
                    unknown.append(name + ': no qualified receipt read to compare with ' + following)
                elif min(completions) >= call:
                    errors.append(following + ': payload committed before qualified ' + name + ' receipt read completed')
        rev2_reads = [r['complete_sequence'] for r in reads.get(rev2, [])]
        status_reads = []
        for cid, call in self.calls.items():
            if call['name'] == 'read_file' and call['path'] == str(self.ws / 'feedback/status.json'):
                op = self.reader.operations[cid]
                if op['status'] == 'complete' and len(self.results.get(cid, [])) == 1:
                    status_reads.append(call['sequence'])
        if not rev2_reads or not status_reads:
            unknown.append('revision-2 receipt read and final completed status read not both demonstrated')
        elif not any(s > min(rev2_reads) for s in status_reads):
            errors.append('no final status read committed after revision-2 receipt read completed')
        evidence['final_status_call_sequences'] = status_reads
        return {'status': 'fail' if errors else 'inconclusive' if unknown else 'pass',
                'errors': errors, 'unknowns': unknown, 'native_sequence_evidence': evidence}

    def idle(self):
        host = load(self.root / 'host-receipt.json')
        evidence = host.get('idle_publication', {})
        if not evidence:
            return {'status': 'inconclusive', 'reason': 'Host idle-poll observation unavailable.'}
        errors = []
        if evidence.get('polls', 0) < 1 or evidence.get('publication_delta') != 0 or evidence.get('projection_bytes_unchanged') is not True:
            errors.append('unchanged idle polls did not preserve publication count and projection bytes')
        return self.result(errors, host_observation=evidence)

    def run(self):
        self.check('source_pins', self.sources)
        self.check('allocation_and_acknowledgements', self.inventory)
        for name, method in (('template_snapshots_receipts', self.fidelity), ('current_and_history', self.lineage),
                             ('native_completion_proofs', self.native_proof), ('native_batches', self.batching),
                             ('marker_overlap', self.overlap), ('receipt_read_order', self.receipt_order),
                             ('prescribed_native_order', self.prescribed_order),
                             ('same_session_goal_scope', self.goal_scope), ('unchanged_idle_polls', self.idle)):
            self.check(name, method)
        states = [c['status'] for c in self.checks.values()]
        status = 'fail' if 'fail' in states else 'inconclusive' if 'inconclusive' in states else 'pass'
        return {'schema': 'a1-m-mechanical-audit/v1', 'scope': 'structural_only', 'semantic_validation': 'not_performed',
                'root': str(self.root), 'status': status, 'checks': self.checks}


def main():
    cli = argparse.ArgumentParser(description=__doc__)
    cli.add_argument('run_root', type=Path)
    args = cli.parse_args()
    report = Audit(args.run_root).run()
    print(json.dumps(report, indent=2, ensure_ascii=False))
    return {'pass': 0, 'fail': 1, 'inconclusive': 2}[report['status']]


if __name__ == '__main__':
    raise SystemExit(main())
