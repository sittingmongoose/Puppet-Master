import csv, io, json

# W1: data-contract hazards on malformed rows + special-value encoding.
rows = "a,b\n1,2\n3\n4,5,6\n,\"café, NA\"\n"
parsed = list(csv.DictReader(io.StringIO(rows)))

# Documented stdlib defaults: missing fields -> restval (None); extra fields -> restkey (None).
assert parsed[1] == {'a': '3', 'b': None}, parsed[1]
assert parsed[2].get(None) == ['6'], parsed[2]
assert parsed[3]['b'] == 'café, NA'

# Naive coercion attempt over heterogeneous column: must NOT be assumed to succeed.
coercion_errors = []
coerced = []
for i, x in enumerate(parsed):
    try:
        coerced.append((int(x['a']) if x['a'] else 0, float(x['b']) if x['b'] else float('nan')))
    except ValueError as e:
        coercion_errors.append((i, str(e)))
        coerced.append(None)

# json.dumps emits non-standard NaN token by default; strict JSON parsers reject it.
payload = {'v': float('nan'), 'u': 'café', 'ts': '2026-10-06T00:00:00Z'}
j = json.dumps(payload)
assert 'NaN' in j
try:
    json.loads(j, parse_constant=lambda s: (_ for _ in ()).throw(ValueError('non-standard constant ' + s)))
    strict_ok = True
except ValueError as e:
    strict_ok = False
    strict_err = str(e)

# Explicit contract check the product would run instead of silent coercion.
errors = []
for i, x in enumerate(parsed):
    if any(v is None for k, v in x.items() if k is not None):
        errors.append((i, 'short_row'))
    if None in x:
        errors.append((i, 'extra_fields'))

print("dict_rows:", json.dumps(parsed, ensure_ascii=False))
print("coercion_errors:", coercion_errors)
print("json_payload:", j)
print("strict_json_accepted:", strict_ok)
print("contract_errors:", errors)
print("W1_OK")
