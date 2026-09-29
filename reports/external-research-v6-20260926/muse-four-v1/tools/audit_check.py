#!/usr/bin/env python3
"""Read-only four-submission structural audit; no inference or semantic grade.

Reuse the pinned A1/A2 checks and result reader. Only the four-input inventory,
sequence, positive Goal completion, and observational batching boundary differ.
"""
import argparse
import hashlib
import importlib.util
import json
import sys
from collections import Counter
from pathlib import Path

sys.dont_write_bytecode = True
HERE = Path(__file__).resolve().parent
LAB = HERE.parents[1]
BASE = LAB / 'muse-result-v2/tools/audit_check.py'
BASE_SHA256 = 'b6e285d446f74024a3f413d461d2ed13c2386934c191b6bdcf9d8bda9f8e6b83'
INPUT_MANIFEST_SHA256 = '50f4a7a0c2908e84c211f2d4b2e443ee1295b1301c23863898988b64b67c8ea0'
if hashlib.sha256(BASE.read_bytes()).hexdigest() != BASE_SHA256:
    raise RuntimeError('pinned predecessor audit changed')
spec = importlib.util.spec_from_file_location('muse_four_base_audit', BASE)
base = importlib.util.module_from_spec(spec)
spec.loader.exec_module(base)
original = base.original
raw, load, digest = original.raw, original.load, original.digest
frames, exact_path = original.frames, original.exact_path
INITIAL = ['new--batch-01', 'new--independent']


class Audit(base.Audit):
    def sources(self):
        result = super().sources()
        manifest_path = HERE.parent / 'input-manifest.json'
        errors = result['errors']
        if digest(raw(manifest_path)) != INPUT_MANIFEST_SHA256:
            errors.append('four-input manifest pin mismatch')
        manifest = load(manifest_path)
        expected = {'task.txt', 'inputs/01.md', 'inputs/07.md',
                    'inputs/revision-1.md', 'inputs/revision-2.md'}
        if set(manifest) != expected:
            errors.append('four-input packet inventory differs')
        for name, entry in manifest.items():
            if name not in expected:
                continue
            if digest(raw(self.ws / name)) != entry['sha256']:
                errors.append(name + ': run input differs from frozen packet')
        if {p.name for p in (self.ws / 'inputs').iterdir()} != {Path(n).name for n in expected if n != 'task.txt'}:
            errors.append('run inputs contain missing/extra template files')
        if raw(self.root / 'launch-objective.txt') != raw(self.ws / 'task.txt').strip():
            errors.append('native launch objective differs from task')
        result.update(status='fail' if errors else 'pass',
                      four_input_manifest_sha256=INPUT_MANIFEST_SHA256,
                      predecessor_audit_sha256=BASE_SHA256)
        return result

    def inventory(self):
        self.state = load(self.store / 'state.json')
        self.current = load(self.store / 'current.json')
        self.history = load(self.store / 'history.json')
        self.attempts = self.state['attempts']
        if not isinstance(self.attempts, list) or any(not isinstance(a, dict) for a in self.attempts):
            raise ValueError('acknowledgement records unavailable or malformed')
        by_request = {a.get('request'): a for a in self.attempts}
        fid = by_request.get(INITIAL[0], {}).get('finding_id')
        expected = dict(zip(INITIAL, ['inputs/01.md', 'inputs/07.md']))
        if isinstance(fid, str) and fid:
            expected.update({fid + '--revision-1': 'inputs/revision-1.md',
                             fid + '--revision-2': 'inputs/revision-2.md'})
        missing = [name for name in expected if name not in by_request]
        malformed = [i for i, a in enumerate(self.attempts)
                     if not isinstance(a.get('request'), str) or not a.get('finding_id')]
        errors = []
        if len(expected) != 4 or missing or malformed or Counter(a.get('request') for a in self.attempts) != Counter(expected.keys()):
            errors.append('expected exactly one acknowledgement for each of four request names')
            return self.result(errors, acknowledged=len(self.attempts), expected_count=4,
                               known_expected_requests=list(expected), missing_requests=missing,
                               malformed_record_indexes=malformed,
                               protocol_errors=self.state.get('protocol_errors', []))
        self.by_request, self.fid, self.expected = by_request, fid, expected
        if len({by_request[n]['finding_id'] for n in INITIAL}) != 2:
            errors.append('target and independent must have distinct finding identities')
        if any(by_request[n]['finding_id'] != fid for n in expected if n not in INITIAL):
            errors.append('both revision acknowledgements must use the actual target identity')
        if self.state.get('protocol_errors') or self.state.get('pending_submissions') or self.state.get('orphan_payloads'):
            errors.append('protocol errors, pending submissions or orphan payloads retained')
        if self.state.get('closed') is not True or self.state.get('close_reason') != 'completed':
            errors.append('receiver did not close normally')
        if self.state.get('native_stream_status') != 'closed':
            errors.append('native stream did not finalize closed')
        for directory, names in ((self.ws / 'out/submissions', {n + '.md' for n in expected}),
                                 (self.ws / 'out/requests', set(expected))):
            if {p.name for p in directory.iterdir()} != names:
                errors.append('unexpected/missing submission paths: ' + str(directory))
        if [a['sequence'] for a in self.attempts] != list(range(1, 5)):
            errors.append('acknowledgement sequence must be contiguous 1..4')
        return self.result(errors, acknowledged=len(self.attempts), expected_requests=list(expected))

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
        if len(hashes) != 8 or actual_snapshots != set(hashes):
            errors.append('expected exactly 8 distinct snapshot files')
        return self.result(errors, snapshot_count=len(hashes), snapshot_sha256=hashes,
                           preservation='Exact input bytes and typed parsed text, including quoted/code bodies; no marker-anywhere inference.')

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
            errors.append('native writes must consist of exactly 8 expected exact paths once each')
        for name, a in self.by_request.items():
            proof = self.reader.pair_proof(self.ws / 'out/submissions' / (name + '.md'), self.ws / 'out/requests' / name)
            if proof != a['completion_proof'] or proof['status'] != 'complete':
                errors.append(name + ': retained completion proof differs from independently parsed native proof')
            if a['native_lineage_ordinal'] != max(proof[k].get('ordinal', 0) for k in ('payload', 'marker')):
                errors.append(name + ': native lineage ordinal mismatch')
        return self.result(errors, journal_path=str(journal), journal_sha256=digest(raw(journal)),
                           session_id=self.session_id, native_calls=len(self.calls), native_writes=sum(native_paths.values()))

    def prescribed_order(self):
        errors, unknown, evidence = [], [], {}
        batch = [self.by_request[n]['completion_proof'] for n in INITIAL]
        if max(p['payload']['complete_sequence'] for p in batch) >= min(p['marker']['call_sequence'] for p in batch):
            errors.append('marker batch committed before both initial payload results')
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

    def lineage(self):
        result = super().lineage()
        independent = self.by_request['new--independent']
        if independent['revision'] != 1 or len(self.current.get('findings', [])) != 2:
            result['errors'].append('independent must remain revision 1 alongside only the current target')
        result['status'] = 'fail' if result['errors'] else 'pass'
        result['independent_finding_id'] = independent['finding_id']
        result['target_finding_id'] = self.fid
        return result

    def batching(self):
        groups = {}
        for kind in ('payload', 'marker'):
            ops = [self.by_request[n]['completion_proof'][kind] for n in INITIAL]
            groups[kind] = {'call_sequences': sorted({o['call_sequence'] for o in ops}),
                            'call_ids': [o['call_id'] for o in ops]}
        return {'status': 'observed', 'groups': groups,
                'initial_batches_observed': all(len(v['call_sequences']) == 1 for v in groups.values()),
                'scope': 'Initial batching is recorded; the old six-marker gate does not apply.'}

    def overlap(self):
        ops = [self.by_request[n]['completion_proof']['marker'] for n in INITIAL]
        pairs = [[a['call_id'], b['call_id']] for i, a in enumerate(ops) for b in ops[i + 1:]
                 if max(a['started_sequence'], b['started_sequence']) < min(a['terminal_sequence'], b['terminal_sequence'])]
        return {'status': 'observed', 'overlapping_pairs': pairs,
                'scope': 'Initial overlap is observational; absent overlap cannot fail this reduced task.'}

    def goal_scope(self):
        result = super().goal_scope()
        receipt = load(self.root / 'native/receipt.json')
        if receipt.get('goal_status_final') != 'complete':
            result['errors'].append('native Goal final status is not complete')
        count = receipt.get('native_responses')
        if type(count) is not int or not 1 <= count <= 48:
            result['errors'].append('completed parent response count must be 1..48')
        result['status'] = 'fail' if result['errors'] else 'pass'
        return result

    def run(self):
        report = super().run()
        report.update(schema='muse-four-mechanical-audit/v1', successor='muse-four-v1',
                      required_acknowledgements=4, required_snapshots=8,
                      retrospective_nine_submission_pass=False)
        return report


def main():
    cli = argparse.ArgumentParser(description=__doc__)
    cli.add_argument('run_root', type=Path)
    report = Audit(cli.parse_args().run_root).run()
    print(json.dumps(report, indent=2, ensure_ascii=False))
    return {'pass': 0, 'fail': 1, 'inconclusive': 2}[report['status']]


if __name__ == '__main__':
    raise SystemExit(main())
