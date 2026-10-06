import json
MISSING = object()

def classify(record, required, nullable, integer_fields):
    problems = []
    normalized = {}
    for key in required:
        value = record.get(key, MISSING)
        if value is MISSING:
            problems.append((key, "missing_field"))
            continue
        if value is None:
            if key not in nullable:
                problems.append((key, "null_not_allowed"))
            normalized[key] = None
            continue
        if key in integer_fields:
            try:
                normalized[key] = int(value)
            except (TypeError, ValueError):
                problems.append((key, "cast"))
        else:
            normalized[key] = value
    return normalized, problems

lines = data["lines"]
rejects = []
accepted = []
for line_no, raw in enumerate(lines, 1):
    try:
        obj = json.loads(raw)
        if not isinstance(obj, dict):
            raise ValueError("record_not_object")
    except (json.JSONDecodeError, ValueError) as exc:
        rejects.append({"line": line_no, "reason": "parse", "raw": raw})
        continue
    normalized, problems = classify(obj, ["id", "value"], {"value"}, {"id", "value"})
    if problems:
        rejects.append({"line": line_no, "reason": problems, "raw": raw})
    else:
        accepted.append((normalized["id"], normalized["value"]))

assert accepted == [(1, None), (3, 7)]
assert len(rejects) == 3
assert rejects[0]["reason"] == [("value", "missing_field")]
assert rejects[1]["reason"] == [("id", "cast")]
assert rejects[2]["reason"] == "parse"
print(json.dumps({"accepted": accepted, "rejects": rejects, "missing_distinct_from_null": True}, ensure_ascii=False, separators=(",", ":")))