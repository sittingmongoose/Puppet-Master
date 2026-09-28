"""Narrow Muse result-grammar successor; all event/binding machinery stays pinned.

Only two observed text forms are recognized. Advisory text is retained verbatim,
separately from exact completion facts. This module has no native/provider calls.
"""
import hashlib
import importlib.util
import json
from pathlib import Path
import re

SOURCE = Path(__file__).resolve().parents[2] / 'ack-boundary-v1/tools/native_completion.py'
SOURCE_SHA = '83dac66a29bc0778ed0edfa134fd04db03eda34602e5c80d5938c17c4dc2fd38'
if hashlib.sha256(SOURCE.read_bytes()).hexdigest() != SOURCE_SHA:
    raise RuntimeError('frozen native reader source pin changed')
spec = importlib.util.spec_from_file_location('muse_result_v2_frozen_reader', SOURCE)
frozen = importlib.util.module_from_spec(spec)
spec.loader.exec_module(frozen)

# The filename slot is deliberately restricted to a single simple basename.
# Other filename spellings/annotations are unrecognized, never normalized.
NOTE = r'; note: near-duplicate sibling [A-Za-z0-9][A-Za-z0-9._-]* exists in this directory — verify this new file is intended'
# Used only to diagnose recognized differing facts. Known expected paths are
# matched literally below; exotic unknown shapes are not guessed into paths.
HEADER = r'wrote (?P<count>0|[1-9][0-9]*) bytes to (?P<path>/[^\s;\x00]+)'


def interpret_write_result(text, *, path, utf8_bytes):
    result = {'status': 'unrecognized', 'form': None, 'raw_text': text,
              'advisory_text': None, 'completion': None,
              'reason': 'unrecognized native Write result shape'}
    if not isinstance(text, str):
        return result
    expected = f'wrote {utf8_bytes} bytes to {path}'
    # fullmatch establishes the entire boundary, including the one allowed
    # advisory grammar. Prefix lookalikes and arbitrary suffixes cannot pass.
    match = re.fullmatch(re.escape(expected) + '(?P<advisory>' + NOTE + ')?', text)
    if match:
        advisory = match['advisory']
        return {**result, 'status': 'recognized',
                'form': 'near_duplicate_sibling' if advisory else 'plain',
                'advisory_text': advisory,
                'completion': {'path': path, 'utf8_bytes': utf8_bytes}, 'reason': None}
    different = re.fullmatch(HEADER + '(?P<advisory>' + NOTE + ')?', text)
    if different:
        return {**result, 'status': 'mismatch',
                'form': 'near_duplicate_sibling' if different['advisory'] else 'plain',
                'advisory_text': different['advisory'],
                'completion': {'path': different['path'], 'utf8_bytes': int(different['count'])},
                'reason': 'recognized native Write result disagrees with exact bound path/UTF-8 byte count'}
    return result


class CompletionReader(frozen.CompletionReader):
    def _result(self, result, run_id, sequence):
        # Preserve the frozen identity, terminal and duplicate/conflict checks.
        operation = self._operation(result['tool_call_id'], run_id)
        if result['tool_call_index'] != operation['call_index']:
            raise ValueError('native result call index mismatch')
        if not operation.get('terminal_sequence'):
            raise ValueError('native result before terminal')
        digest = frozen._digest(json.dumps(result, sort_keys=True, separators=(',', ':')).encode())
        if operation.get('result_sequence'):
            if operation.get('result_digest') == digest:
                return
            raise ValueError('conflicting native result')
        operation.update(result_sequence=sequence, result_digest=digest)
        if operation.get('qualifies_write'):
            interpretation = interpret_write_result(result.get('text'), path=operation['path'],
                                                     utf8_bytes=operation['content_bytes'])
            if set(result) != {'tool_call_id', 'tool_call_index', 'text'}:
                interpretation.update(status='unrecognized', reason='unrecognized native Write result envelope fields')
            # Keep the original record as data; never replace its text with a
            # scrubbed/canonical sentence before checking or retaining it.
            operation.update(native_result=dict(result), result_interpretation=interpretation)
            if operation['status'] == 'failed':
                return  # Success-shaped prose cannot overrule failed lifecycle.
            if interpretation['status'] == 'mismatch':
                raise ValueError(interpretation['reason'])
            if interpretation['status'] != 'recognized':
                operation['status'] = 'unrecognized'
                return
        if operation['status'] != 'failed':
            operation.update(status='complete', complete_sequence=sequence)

    def pair_proof(self, payload_path, marker_path):
        # Frozen ordering rule, with one additional explicitly blocked status.
        payload, marker = self.proof_for(payload_path), self.proof_for(marker_path)
        statuses = {payload['status'], marker['status']}
        status = next((s for s in ('fault', 'unqualified', 'failed', 'unrecognized', 'incomplete', 'pending')
                       if s in statuses), 'complete')
        reason = None
        if payload.get('path') == marker.get('path') and payload.get('path'):
            status, reason = 'fault', 'payload and marker must have distinct exact paths'
        if status == 'complete' and not payload['complete_sequence'] < marker['started_sequence']:
            status, reason = 'fault', 'payload completion did not precede marker start'
        return {'status': status, 'reason': reason, 'payload': payload, 'marker': marker}

    def _report(self, changed):
        report = super()._report(changed)
        unknown = [op['call_id'] for op in self.operations.values() if op['status'] == 'unrecognized']
        report['unrecognized_result_calls'] = unknown
        if self.closed_reason and unknown and report['status'] == 'closed':
            report.update(status='incomplete', reason='unrecognized native Write result shapes remain unresolved')
        return report


# Reuse the isolated frozen MSP bootstrap/feed unchanged. Its factory resolves
# CompletionReader in this private module, so both direct and live-feed routes
# use the successor. This does not modify a source file or a shared module.
frozen.CompletionReader = CompletionReader
MuseCompletionFeed = frozen.MuseCompletionFeed
