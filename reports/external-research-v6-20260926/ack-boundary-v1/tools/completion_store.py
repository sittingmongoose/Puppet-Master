"""Offline successor receiver: native completion gates the frozen finding parser.

No model calls, transport, resume, semantic repair or changes to frozen I2.
Visibility discovers pending work; only correlated completed writes acknowledge it.
"""
from __future__ import annotations
import hashlib
import importlib.util
import json
from pathlib import Path

WRAPPER = Path(__file__).resolve().parents[2] / 'i2-prep/tools/research_store.py'
WRAPPER_SHA = '8cba600b240cddb6951aa600146e3b0ccc8d4d1ffcd7e90bedc5f99378b05762'
if hashlib.sha256(WRAPPER.read_bytes()).hexdigest() != WRAPPER_SHA:
    raise RuntimeError('frozen I2 parser wrapper changed')
spec = importlib.util.spec_from_file_location('ack_frozen_wrapper', WRAPPER)
wrapper = importlib.util.module_from_spec(spec); spec.loader.exec_module(wrapper)
base = wrapper.frozen_module()
write_json, sha, StructuralError = base.write_json, base.sha, base.StructuralError


class CompletionStore(base.Store):
    def __init__(self, workspace, archive, reader, max_attempts=64, max_bytes=32768):
        if max_attempts != 64 or max_bytes != 32768:
            raise ValueError('this bounded repair retains the I2 capacities')
        self.ws, self.archive = Path(workspace).resolve(), Path(archive).resolve()
        # A fresh receiver never reopens an old run or overwrites its evidence.
        self.archive.mkdir(parents=True, exist_ok=False)
        self.reader = reader
        self.payloads = self.ws / 'out/submissions'
        self.requests = self.ws / 'out/requests'
        self.feedback = self.ws / 'feedback'
        for p in (self.payloads, self.requests, self.feedback, self.archive / 'snapshots'):
            p.mkdir(parents=True, exist_ok=True)
        self.max_attempts, self.max_bytes = max_attempts, max_bytes
        self.state_path = self.archive / 'state.json'
        self.state = {'schema': 'finding-receipts/v2', 'receiver': 'native-completion/v1',
                      'attempts': [], 'next_id': 1, 'protocol_errors': [], 'closed': False,
                      'pending_submissions': {}, 'native_operations': [], 'native_stream_status': 'pending'}
        self._published_fingerprint = None
        self._published_bytes = {}
        self.publication_count = 0
        self.publish()

    def _safe_bytes(self, path):
        if path.is_symlink() or not path.is_file():
            raise StructuralError(f'missing/nonregular input: {path.name}')
        return path.read_bytes()

    def _check_integrity(self):
        for a in self.state['attempts']:
            for path, digest in ((self.payloads / (a['request'] + '.md'), a['raw_sha256']),
                                 (self.requests / a['request'], a['marker_sha256'])):
                if digest is None and not path.exists() and not path.is_symlink():
                    continue  # Missing at acceptance is already INVALID, not a later mutation.
                try:
                    if sha(self._safe_bytes(path)) != digest:
                        raise StructuralError('bytes changed')
                except (StructuralError, OSError):
                    self._record_error(f'acknowledged request/payload changed or removed: {a["request"]}')
                    a['invalidated'] = True
            for field, digest in (('snapshot', 'raw_sha256'), ('marker_snapshot', 'marker_sha256')):
                if a.get(field):
                    try:
                        if sha(self._safe_bytes(self.archive / a[field])) != a[digest]:
                            raise StructuralError('snapshot changed')
                    except (StructuralError, OSError):
                        self._record_error(f'accepted snapshot changed/missing: {a[field]}')
                        a['invalidated'] = True
            proof = self.reader.pair_proof(self.payloads / (a['request'] + '.md'), self.requests / a['request'])
            if proof != a['completion_proof']:
                self._record_error(f'acknowledged native provenance changed: {a["request"]}')
                a['invalidated'] = True

    def _names(self):
        names = set(self.state['pending_submissions'])
        names.update(p.name for p in self.requests.iterdir())
        names.update(p.name[:-3] for p in self.payloads.iterdir() if p.name.endswith('.md'))
        # Include failed native attempts even when they created no file.
        for operation in self.state['native_operations']:
            path = Path(operation.get('path', ''))
            if path.parent == self.requests:
                names.add(path.name)
            elif path.parent == self.payloads and path.name.endswith('.md'):
                names.add(path.name[:-3])
        return sorted(names)

    def poll(self):
        if self.state['closed']:
            raise StructuralError('store closed; no post-freeze submissions')
        return self._consume(self.reader.poll())

    @staticmethod
    def _lineage(proof):
        # Native attempted order is independent of filesystem discovery and
        # terminal completion order. Payload intent covers a missing marker.
        return max((proof.get(kind, {}).get('ordinal', 0)
                    for kind in ('payload', 'marker')), default=0)

    def _consume(self, observed):
        self.state['native_operations'] = observed.get('operations', [])
        self.state['native_stream_status'] = observed.get('status', 'pending')
        if observed.get('fault'):
            self._record_error('native event stream fault: ' + str(observed['fault']))
        self._check_integrity()
        acknowledged = {a['request'] for a in self.state['attempts']}
        offered = [(name, self.reader.pair_proof(self.payloads / (name + '.md'), self.requests / name))
                   for name in self._names() if name not in acknowledged]
        for name, proof in sorted(offered, key=lambda item: (self._lineage(item[1]), item[0])):
            if name in acknowledged:
                continue
            payload, marker = self.payloads / (name + '.md'), self.requests / name
            pending = {'request': name, 'status': proof['status'], 'completion_proof': proof,
                       'payload_visible': payload.exists() or payload.is_symlink(),
                       'marker_visible': marker.exists() or marker.is_symlink()}
            self.state['pending_submissions'][name] = pending
            if proof['status'] != 'complete':
                continue
            if len(self.state['attempts']) >= self.max_attempts:
                pending['status'] = 'over_limit'
                self._record_error(f'submission limit {self.max_attempts} exceeded')
                continue
            # Snapshot completed available bytes, including malformed bytes, before
            # acknowledging. A success-shaped event cannot bless mismatched bytes.
            self._acknowledge(name, proof)
            self.state['pending_submissions'].pop(name)
            acknowledged.add(name)
            self.publish()
            write_json(self.feedback / (name + '.json'), self.receipt(self.state['attempts'][-1]))
        return self.publish()

    def _acknowledge(self, name, proof):
        seq = len(self.state['attempts']) + 1
        a = {'sequence': seq, 'request': name, 'finding_id': None, 'status': 'INVALID',
             'diagnostics': [], 'raw_sha256': None, 'marker_sha256': None,
             'snapshot': None, 'marker_snapshot': None, 'finding': None,
             'change_reason': None, 'revision': None, 'changes': None,
             'completion_proof': proof, 'native_lineage_ordinal': self._lineage(proof)}
        self.state['attempts'].append(a)
        raw, marker = None, None
        # Preserve both available completed inputs even when one is malformed.
        for field, digest, path, suffix in (
                ('snapshot', 'raw_sha256', self.payloads / (name + '.md'), '.md'),
                ('marker_snapshot', 'marker_sha256', self.requests / name, '.request')):
            try:
                value = self._safe_bytes(path)
                dest = self.archive / 'snapshots' / (f'{seq:04d}' + suffix)
                dest.write_bytes(value); dest.chmod(0o444)
                a[field], a[digest] = str(dest.relative_to(self.archive)), sha(value)
                if field == 'snapshot': raw = value
                else: marker = value
            except (OSError, StructuralError) as exc:
                a['diagnostics'].append(str(exc))
        try:
            match = base.NAME.fullmatch(name)
            if not match:
                raise StructuralError('invalid request name; use new--slug or F0001--slug')
            target = match[1]
            if target == 'new':
                a['finding_id'] = f'F{self.state["next_id"]:04d}'
                self.state['next_id'] += 1
            elif target in {x['finding_id'] for x in self.state['attempts'][:-1]}:
                a['finding_id'] = target
            else:
                raise StructuralError(f'unknown finding identity: {target}')
            previous = [x for x in self.state['attempts'][:-1] if x['finding_id'] == a['finding_id']]
            a['revision'] = len(previous) + 1
            if raw is None or marker is None:
                raise StructuralError('completed native input is missing/nonregular')
            for key, value in (('payload', raw), ('marker', marker)):
                expected = proof[key]
                if len(value) != expected['content_bytes'] or sha(value) != expected['content_sha256']:
                    raise StructuralError(f'{key} bytes differ from completed native Write arguments')
            if marker != b'submit\n':
                raise StructuralError("request marker must contain exactly 'submit' plus newline")
            finding, reason = base.parse_finding(raw, a['finding_id'], target != 'new')
            a.update(status='VALID_UNVERIFIED', finding=finding, change_reason=reason)
            prior = next((x for x in reversed(previous) if x['finding'] is not None), None)
            before = {p['id']: p for p in prior['finding']['parts']} if prior else {}
            after = {p['id']: p for p in finding['parts']}
            a['changes'] = {'basis': 'last parsed record for byte comparison only; never a current fallback',
                            'previous_valid_attempt': prior['sequence'] if prior else None,
                            'added_parts': sorted(after.keys() - before.keys()),
                            'removed_parts': sorted(before.keys() - after.keys()),
                            'replaced_parts': sorted(k for k in after.keys() & before.keys() if after[k] != before[k]),
                            'title_changed': prior is not None and prior['finding']['title'] != finding['title']}
        except (StructuralError, OSError) as exc:
            a['diagnostics'].append(str(exc))

    def summary(self):
        # Reuse frozen structural checks, but project by attempted native order.
        # The immutable acknowledgement sequence/revision remains receipt order.
        # A late completion of an older attempt cannot become the current answer.
        view = object.__new__(base.Store)
        view.__dict__ = {**self.__dict__, 'state': {**self.state, 'attempts': sorted(
            self.state['attempts'], key=lambda a: (a['native_lineage_ordinal'], a['sequence']))}}
        result = base.Store.summary(view)
        pending = self.state.get('pending_submissions', {})
        # An attempted unfinished/failed latest revision cannot expose an older
        # accepted answer as if that attempted update had never happened.
        withheld = set()
        for name, item in pending.items():
            match = base.NAME.fullmatch(name)
            if match and match[1] != 'new' and match[1] in result['current_states']:
                fid = match[1]
                accepted = max(a['native_lineage_ordinal'] for a in self.state['attempts']
                               if a['finding_id'] == fid)
                native_order = self._lineage(item['completion_proof'])
                if native_order and native_order < accepted:
                    continue  # Earlier incomplete evidence remains; newer answer is current.
                withheld.add(fid)
                result['current_states'][fid] = {'status': 'INCOMPLETE_NATIVE_SUBMISSION',
                                                'latest_attempt': None, 'pending_request': name}
        result['findings'] = [f for f in result['findings'] if f['id'] not in withheld]
        result['native_pending'] = pending
        if pending or self.state.get('native_stream_status') in {'fault', 'incomplete', 'unqualified'}:
            result['complete'] = False; result['status'] = 'INCOMPLETE'
        return result

    def publish(self):
        # summary still checks every historical snapshot. Only unchanged derived
        # serialization/writes are skipped; this is not a file-stability commit test.
        summary = self.summary()
        fingerprint = sha(json.dumps([self.state, summary], sort_keys=True, ensure_ascii=False).encode())
        if fingerprint == self._published_fingerprint:
            return summary
        projection = base.legacy.project_current({'schema': base.legacy.SCHEMA_DRAFT,
                     'findings': summary['findings']}) if summary['findings'] else {
                     'schema': base.legacy.SCHEMA_CURRENT, 'status': 'UNVERIFIED', 'findings': []}
        projection['delivery_status'] = summary['status']
        projection['incomplete_records'] = {k: v for k, v in summary['current_states'].items()
                                            if v['status'] != 'VALID_UNVERIFIED'}
        body = base.legacy.render_current(projection)
        body += '\n## Structural delivery status\n\n' + summary['status'] + '\n'
        for fid, item in projection['incomplete_records'].items():
            body += f"\n- {fid}: {item['status']} (latest attempt {item['latest_attempt']}); older content is audit-only.\n"
        if (summary['unbound_invalid_attempts'] or summary['protocol_errors'] or
                summary['missing_or_corrupt_snapshots'] or summary['pending_inputs'] or summary['native_pending']):
            body += '\nUnresolved structural/chronology errors; inspect structural status and separate audit.\n'
        values = {self.state_path: self.state, self.archive / 'current.json': projection,
                  self.archive / 'history.json': {'attempts': self.state['attempts'],
                    'history_gaps': summary['missing_or_corrupt_snapshots'], 'pending_submissions': self.state['pending_submissions']},
                  self.feedback / 'status.json': {k: v for k, v in summary.items() if k != 'findings'}}
        for path, value in values.items(): write_json(path, value)
        (self.archive / 'current.md').write_text(body)
        self._published_bytes = {p: p.read_bytes() for p in [*values, self.archive / 'current.md']}
        self._published_fingerprint = fingerprint
        self.publication_count += 1
        return summary

    def close(self, reason='completed'):
        if self.state['closed']:
            raise StructuralError('already closed')
        if reason != 'completed':
            self._record_error('host receiver closed at ' + reason)
        # Final integrity checks include derived artifacts before any final publish.
        for path, raw in self._published_bytes.items():
            if not path.is_file() or path.is_symlink() or path.read_bytes() != raw:
                self._record_error(f'published artifact changed/missing: {path.name}')
        # Caller has stopped the writer. Finalization drains once and verifies
        # consumed event bytes before any final acknowledgements can be emitted.
        final = self.reader.finalize(reason)
        self._consume(final)
        self._check_integrity()
        for number, (name, pending) in enumerate(sorted(self.state['pending_submissions'].items()), 1):
            captured = {}
            for kind, path in (('payload', self.payloads / (name + '.md')), ('marker', self.requests / name)):
                try:
                    raw = self._safe_bytes(path)
                    dest = self.archive / 'pending' / f'{number:04d}.{kind}'
                    dest.parent.mkdir(exist_ok=True); dest.write_bytes(raw); dest.chmod(0o444)
                    captured[kind] = {'path': str(dest.relative_to(self.archive)), 'sha256': sha(raw), 'bytes': len(raw)}
                except (OSError, StructuralError) as exc:
                    captured[kind] = {'unavailable': str(exc)}
            pending.update(terminal_reason=reason, retained_evidence=captured)
            self._record_error(f'uncompleted submission at {reason}: {name}')
        # Preserve malformed names/extensions as orphan evidence as well. Never
        # coerce them into a finding or invent a positive completion boundary.
        recognized = {a['request'] + '.md' for a in self.state['attempts']} | {
            name + '.md' for name in self.state['pending_submissions']}
        orphans = []
        for number, path in enumerate(sorted(self.payloads.iterdir()), 1):
            if path.name in recognized:
                continue
            item = {'source_name': path.name}
            try:
                raw = self._safe_bytes(path)
                dest = self.archive / 'pending' / f'orphan-{number:04d}.payload'
                dest.parent.mkdir(exist_ok=True); dest.write_bytes(raw); dest.chmod(0o444)
                item.update(path=str(dest.relative_to(self.archive)), sha256=sha(raw), bytes=len(raw))
            except (OSError, StructuralError) as exc:
                item['unavailable'] = str(exc)
            orphans.append(item)
            self._record_error(f'unsubmitted payload: {path.name}')
        self.state['orphan_payloads'] = orphans
        self.state.update(closed=True, close_reason=reason, native_finalization=final)
        return self.publish()
