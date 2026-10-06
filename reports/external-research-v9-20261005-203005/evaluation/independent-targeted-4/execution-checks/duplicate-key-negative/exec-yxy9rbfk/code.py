import hashlib
import json

rows = data["rows"]
code = data["transform_code"]
env = data["environment"]

def canonical(value):
    return json.dumps(value, sort_keys=True, separators=(",", ":"), ensure_ascii=False).encode("utf-8")

def digest(value):
    return hashlib.sha256(canonical(value)).hexdigest()

def cache_key(source_rows, transform_code, environment):
    return digest({"source": source_rows, "code": transform_code, "environment": environment})

# This synthetic contract sorts on an explicitly declared unique key; it preserves
# strings and distinguishes an absent field from an explicit JSON null.
assert len({row["id"] for row in rows}) == len(rows)
ordered = sorted(rows, key=lambda row: row["id"])
output = [{"id": row["id"], "timestamp": row["timestamp"], **({"note": row["note"]} if "note" in row else {})} for row in ordered]
assert [row["id"] for row in output] == [1, 2, 3]
assert output[0]["note"] is None
assert "note" not in output[1]
assert output[2]["note"] == "café 東京"

base = cache_key(rows, code, env)
assert base == cache_key(rows, code, env)
source_changed = cache_key(rows + [{"id": 4, "timestamp": "2025-02-04T00:00:00Z", "note": "added"}], code, env)
code_changed = cache_key(rows, code + "\n# changed", env)
env_changed = cache_key(rows, code, {**env, "lock": "lock-b"})
assert len({base, source_changed, code_changed, env_changed}) == 4

print(json.dumps({
    "synthetic_rows": len(rows),
    "sorted_ids": [row["id"] for row in output],
    "missing_distinct_from_null": ("note" not in output[1] and output[0]["note"] is None),
    "unicode_preserved": output[2]["note"],
    "source_code_environment_changes_invalidate_key": len({base, source_changed, code_changed, env_changed}) == 4,
    "output_sha256": hashlib.sha256(canonical(output)).hexdigest()
}, ensure_ascii=False, sort_keys=True))