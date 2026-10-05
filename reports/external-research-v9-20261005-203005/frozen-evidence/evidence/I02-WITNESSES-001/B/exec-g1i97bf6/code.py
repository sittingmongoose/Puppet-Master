import json
from datetime import datetime

# Candidate data-contract check: declared schema, explicit coercion policy,
# quarantine (never silent drop, never mutate source) on tiny synthetic records.
schema = {
    "fields": {
        "id": {"type": "int64", "required": True},
        "v":  {"type": "utf8", "required": False},
        "ts": {"type": "timestamp", "required": False},
    },
    "coercion": "quarantine",
}

lines = [
    '{"id": 1, "v": "ok", "ts": "2026-01-02T03:04:05Z"}',
    '{"id": 2, "v": null}',
    '{"id": 3, "v": "naïve ✓"}',
    '{"id": "x", "v": 7}',
    '{"v": "missing id"}',
    'not json at all',
    '{"id": 4, "ts": "2026-13-99T00:00:00Z"}',
]

def coerce_int64(x):
    if isinstance(x, bool):
        raise ValueError("bool is not int64")
    if isinstance(x, int):
        return x
    s = str(x).strip()
    body = s[1:] if s[:1] in "+-" else s
    if body.isdigit():
        return int(s)
    raise ValueError(f"cannot coerce {x!r} to int64")

def coerce_utf8(x):
    if isinstance(x, str):
        return x
    raise ValueError(f"expected utf8 string, got {type(x).__name__}")

def coerce_ts(x):
    if not isinstance(x, str):
        raise ValueError("timestamp must be an ISO-8601 string")
    return datetime.fromisoformat(x.replace("Z", "+00:00")).isoformat()

COERCERS = {"int64": coerce_int64, "utf8": coerce_utf8, "timestamp": coerce_ts}

accepted, quarantined = [], []
for offset, line in enumerate(lines):
    try:
        obj = json.loads(line)
        if not isinstance(obj, dict):
            raise ValueError("record is not a JSON object")
        rec = {}
        for name, spec in schema["fields"].items():
            if name not in obj:
                if spec["required"]:
                    raise ValueError(f"missing required field {name!r}")
                rec[name] = None
                continue
            val = obj[name]
            rec[name] = None if val is None else COERCERS[spec["type"]](val)
        accepted.append({"offset": offset, "row": rec})
    except Exception as e:
        quarantined.append({"offset": offset,
                            "reason": f"{type(e).__name__}: {e}",
                            "raw_line_preserved": line})

result = {
    "accepted_count": len(accepted),
    "accepted": accepted,
    "quarantined_count": len(quarantined),
    "quarantined": quarantined,
    "unicode_preserved": any(r["row"]["v"] == "naïve ✓" for r in accepted),
    "nulls_allowed_for_optional_field": any(r["row"]["id"] == 2 and r["row"]["v"] is None for r in accepted),
    "original_source_untouched": lines[3] == '{"id": "x", "v": 7}' and lines[5] == 'not json at all',
}
print(json.dumps(result, indent=2, ensure_ascii=False))