"""Read-only bounded A1-M/I2 journal replay; never constructs a Store."""
import hashlib
import json
from pathlib import Path
import sys
sys.dont_write_bytecode = True
from native_completion import CompletionReader

LAB = Path(__file__).resolve().parents[2]
def sha(path):
    return hashlib.sha256(path.read_bytes()).hexdigest()


def replay(root, journal_relative, store_relative):
    journal, state_path = root / journal_relative, root / store_relative
    state = json.loads(state_path.read_text())
    if state.get('native_finalization', {}).get('binding'):
        binding = state['native_finalization']['binding']
        session_id = binding['session_id']
    else:
        session_id = json.loads((root / 'runs/I2-M-maintained/native/receipt.json').read_text())['session_id']
    ws = root / ('ws' if root.name.startswith('a1-m-') else 'runs/I2-M-maintained/ws')
    before = {str(p): sha(p) for p in [journal, state_path]}
    reader = CompletionReader(journal, session_id=session_id, workspace_root=ws)
    final = reader.finalize('read_only_stopped_replay')
    writes = []
    for operation in reader.operations.values():
        if operation['tool_name'] != 'write_file':
            continue
        path = Path(operation['path'])
        proof = reader.proof_for(path)
        writes.append({'path': str(path), 'proof': proof,
                       'live_sha256': sha(path) if path.is_file() else None,
                       'live_bytes_match_arguments': path.is_file() and sha(path) == operation['content_sha256']})
    after = {p: sha(Path(p)) for p in before}
    return {'journal': {'path': str(journal), 'sha256': sha(journal)},
            'original_state': {'path': str(state_path), 'sha256': sha(state_path)},
            'reader_final_status': final['status'], 'reader_fault': final['fault'],
            'native_operation_count': final['native_attempts'], 'writes': writes,
            'source_files_unchanged': before == after,
            'acknowledgements_created': 0, 'store_instantiated': False}


def main():
    a1 = replay(LAB / 'a1-m-20260928', 'native/muse-session.jsonl', 'store/state.json')
    i2 = replay(LAB / 'i2-20260928', 'runs/I2-M-maintained/native/muse-session.jsonl',
                'runs/I2-M-maintained/store/state.json')
    a1_payloads = [x for x in a1['writes'] if '/out/submissions/' in x['path']]
    a1_markers = [x for x in a1['writes'] if '/out/requests/' in x['path']]
    assert len(a1_payloads) == 6 and not a1_markers
    assert all(x['proof']['status'] == 'complete' and x['live_bytes_match_arguments']
               and x['proof']['result_interpretation']['form'] == 'near_duplicate_sibling' for x in a1_payloads)
    assert len(i2['writes']) == 36 and all(x['proof']['status'] == 'complete' for x in i2['writes'])
    forms = {}
    for x in a1['writes'] + i2['writes']:
        name = x['proof']['result_interpretation']['form']
        forms[name] = forms.get(name, 0) + 1
    print(json.dumps({'schema': 'muse-result-v2-read-only-replay/v1',
                      'scope': 'stopped journals only; not an acknowledgement replay or live qualification',
                      'A1_M_disposition': 'unchanged FAIL/INCOMPLETE',
                      'a1_completed_payload_proofs': len(a1_payloads), 'a1_marker_operations': len(a1_markers),
                      'acknowledgements_created': 0, 'observed_result_forms': forms,
                      'a1': a1, 'prior_plain_i2': i2}, indent=2, ensure_ascii=False))


if __name__ == '__main__':
    main()
