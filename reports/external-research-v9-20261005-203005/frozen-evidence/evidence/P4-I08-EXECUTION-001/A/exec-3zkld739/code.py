import datetime, hashlib, json

raw = data["ndjson"].encode("utf-8")
source_digest = hashlib.sha256(raw).hexdigest()
accepted, rejected = [], []
for ordinal, line in enumerate(raw.decode("utf-8").splitlines(), 1):
    try:
        row = json.loads(line)
        if not isinstance(row, dict):
            raise ValueError("record must be an object")
        if "id" not in row:
            raise ValueError("required id missing")
        value = {"source_digest": source_digest, "record_ordinal": ordinal,
                 "id": row["id"], "optional_present": "optional" in row,
                 "optional": row.get("optional")}
        stamp = row.get("when")
        if stamp is not None:
            value["when_utc"] = datetime.datetime.fromisoformat(stamp.replace("Z", "+00:00")).astimezone(datetime.timezone.utc).isoformat()
        accepted.append(value)
    except Exception as exc:
        rejected.append({"source_digest": source_digest, "record_ordinal": ordinal,
                         "raw": line, "error": str(exc)})
assert len(accepted) == 2 and len(rejected) == 2
assert accepted[0]["optional_present"] and accepted[0]["optional"] is None
assert not accepted[1]["optional_present"]
assert accepted[0]["id"] == "雪 café ☕"
assert rejected[0]["raw"] == data["ndjson"].splitlines()[2]
assert rejected[1]["raw"] == data["ndjson"].splitlines()[3]
assert hashlib.sha256(raw).hexdigest() == source_digest

def digest(value):
    blob = json.dumps(value, ensure_ascii=False, sort_keys=True, separators=(",", ":")).encode("utf-8")
    return hashlib.sha256(blob).hexdigest()
base = {"cell": "source-v1", "data": source_digest, "contract": "schema-v1",
        "runtime": "lock-A", "engine": "duckdb-artifact-A", "parameters": {"seed": 7}}
key = digest(base)
assert digest(dict(base)) == key
for field, replacement in (("cell", "source-v2"), ("data", "other-sha"),
                           ("contract", "schema-v2"), ("runtime", "lock-B"),
                           ("engine", "duckdb-artifact-B")):
    changed = dict(base)
    changed[field] = replacement
    assert digest(changed) != key

print(json.dumps({"accepted": len(accepted), "rejected_raw_records_preserved": len(rejected),
                  "missing_distinct_from_null": True, "unicode_preserved": True,
                  "source_digest_stable": True, "provenance_key_changes_for_dependencies": True},
                 ensure_ascii=False, sort_keys=True))