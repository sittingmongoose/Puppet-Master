import hashlib, json
from datetime import datetime

def transform(raw):
    digest = hashlib.sha256(raw).hexdigest()
    out = []
    for line_no, line in enumerate(raw.splitlines(), 1):
        try:
            row = json.loads(line.decode('utf-8'))
        except Exception as exc:
            raise ValueError(f'line {line_no}: invalid NDJSON: {exc}') from None
        if not isinstance(row, dict):
            raise ValueError(f'line {line_no}: expected an object')
        if 'when' in row and row['when'] is not None:
            try:
                parsed = datetime.fromisoformat(row['when'].replace('Z', '+00:00'))
                if parsed.tzinfo is None:
                    raise ValueError('timestamp has no timezone')
            except Exception as exc:
                raise ValueError(f'line {line_no}, field when: {exc}') from None
        out.append({'row_id': f'{digest}:{line_no}', 'present': sorted(row), 'row': row})
    return out

good = data['valid'].encode('utf-8')
first = transform(good)
second = transform(good)
assert first == second
assert first[0]['row']['label'] == '雪'
assert 'label' not in first[1]['row']
assert 'label' in first[2]['row'] and first[2]['row']['label'] is None
bad = data['malformed'].encode('utf-8')
before = hashlib.sha256(bad).hexdigest()
try:
    transform(bad)
except ValueError as exc:
    error = str(exc)
else:
    raise AssertionError('malformed timestamp unexpectedly accepted')
assert error.startswith('line 2, field when:')
assert hashlib.sha256(bad).hexdigest() == before
print(json.dumps({'valid_rows': len(first), 'unicode_preserved': first[0]['row']['label'], 'missing_label_is_absent': 'label' not in first[1]['row'], 'explicit_null_is_present': 'label' in first[2]['row'] and first[2]['row']['label'] is None, 'repeat_stable': first == second, 'malformed_error': error, 'source_bytes_unchanged': hashlib.sha256(bad).hexdigest() == before}, ensure_ascii=False, sort_keys=True))