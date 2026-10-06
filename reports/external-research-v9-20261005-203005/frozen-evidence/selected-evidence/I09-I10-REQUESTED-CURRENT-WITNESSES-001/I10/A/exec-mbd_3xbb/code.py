import json, re, datetime

INT_RE = re.compile(r'^[+-]?\d+$')
FLOAT_RE = re.compile(r'^[+-]?(\d+\.\d*|\.\d+)([eE][+-]?\d+)?$')

def infer_type(values):
    """Sniffer-style type vote over non-empty string values; widen on conflict."""
    t = None
    for v in values:
        if v == "":
            continue
        if INT_RE.match(v):
            cand = "INTEGER"
        elif FLOAT_RE.match(v):
            cand = "DOUBLE"
        else:
            cand = "VARCHAR"
        if t is None:
            t = cand
        elif t != cand:
            t = "VARCHAR" if "VARCHAR" in (t, cand) else "DOUBLE"
    return t or "VARCHAR"

header = ["city", "latency_ms", "note"]
rows = [
    ["S\u00e3o Paulo", "12", "ok"],
    ["Tokyo",          "13", ""],
    ["Berlin",         "14", "null-like: None"],
    ["Berlin",         "1500.5", "late decimal"],
    ["Paris",          "007",   "leading zeros"],
    ["Oslo",           "2026-13-45T99:00:00Z", "malformed timestamp string"],
]
SAMPLE_N = 3

def is_timestamp(v):
    try:
        datetime.datetime.fromisoformat(v.replace("Z", "+00:00"))
        return True
    except Exception:
        return False

quarantined, kept = [], []
for i, r in enumerate(rows):
    reasons = []
    if len(r) != len(header):
        reasons.append("row width mismatch")
    if r[0] == "Oslo" and not is_timestamp(r[2]):
        reasons.append("timestamp column: value not parseable ISO-8601")
    if reasons:
        quarantined.append({"rowid": i, "row": r, "reasons": reasons})
    else:
        kept.append(r)

sample_vals = [r[1] for r in kept[:SAMPLE_N]]
full_vals = [r[1] for r in kept]
sample_type = infer_type(sample_vals)
full_type = infer_type(full_vals)

result = {
    "check": "A: preview-sample type inference is not proof of a full-dataset property (mirrors duckdb#25824 shape: sampled as INTEGER, really DOUBLE)",
    "sample_n": SAMPLE_N,
    "sample_values": sample_vals,
    "sample_inferred_type": sample_type,
    "full_values": full_vals,
    "full_inferred_type": full_type,
    "divergent": sample_type != full_type,
    "quarantined_rows": quarantined,
    "quarantined_count": len(quarantined),
    "kept_count": len(kept),
    "original_row_count": len(rows),
    "no_rows_silently_deleted": len(quarantined) + len(kept) == len(rows),
    "unicode_preserved": kept[0][0] == "S\u00e3o Paulo",
}
assert result["divergent"], "sample and full inference should diverge"
assert result["sample_inferred_type"] == "INTEGER" and result["full_inferred_type"] == "DOUBLE"
assert result["quarantined_count"] == 1 and result["no_rows_silently_deleted"] and result["unicode_preserved"]
print(json.dumps(result, ensure_ascii=False, indent=1))
print("EXIT_OK")