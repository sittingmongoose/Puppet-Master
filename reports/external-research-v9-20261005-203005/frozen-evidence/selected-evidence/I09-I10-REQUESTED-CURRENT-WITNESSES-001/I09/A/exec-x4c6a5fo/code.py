import json, struct

# Discriminating check W1: stored-coordinate precision contract.
# Claims tested:
#  (a) Python float (IEEE-754 binary64) values round-trip EXACTLY through JSON text.
#  (b) Coercion to float32 (binary32) is lossy at ~1e-7 relative error.
coords = [123456.123456789, 0.1 + 0.2, 100000.25, 0.04999999999]
rows = []
for c in coords:
    rt = json.loads(json.dumps(c))  # shortest-round-trip decimal text
    f32 = struct.unpack('f', struct.pack('f', c))[0]
    rows.append({
        "value": repr(c),
        "json_roundtrip_exact": (rt == c),
        "float32_value": repr(f32),
        "float32_abs_err": abs(f32 - c),
        "float32_rel_err": abs(f32 - c) / abs(c) if c else 0.0,
    })
ok = all(r["json_roundtrip_exact"] for r in rows)
max_rel = max(r["float32_rel_err"] for r in rows)
print(json.dumps({"json_exact_for_all": ok, "max_float32_rel_err": max_rel, "rows": rows}, indent=1))
print("EXIT_OK" if ok else "EXIT_FAIL")