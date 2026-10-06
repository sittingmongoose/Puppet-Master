import csv, hashlib, io, json

before = hashlib.sha256(data["csv"].encode("utf-8")).hexdigest()
raw_lines = data["csv"].splitlines()
rows = list(csv.reader(io.StringIO(data["csv"], newline="")))
header = rows[0]
accepted = []
rejects = []
for line_no, row in enumerate(rows[1:], start=2):
    raw = raw_lines[line_no - 1]
    if len(row) != len(header):
        rejects.append({"line": line_no, "type": "MISSING_COLUMNS", "raw": raw})
        continue
    if row[1] == r"\N":
        score = None
    else:
        try:
            score = int(row[1])
        except ValueError:
            rejects.append({"line": line_no, "type": "CAST", "raw": raw})
            continue
    accepted.append({"id": row[0], "score": score, "note": row[2]})
after = hashlib.sha256(data["csv"].encode("utf-8")).hexdigest()
preview = accepted[:2]
assert [r["id"] for r in accepted] == ["r1", "r2", "r4"]
assert rejects == [
    {"line": 4, "type": "MISSING_COLUMNS", "raw": "r3,8"},
    {"line": 6, "type": "CAST", "raw": "r5,bad,broken"},
]
assert accepted[0]["score"] is None and accepted[0]["note"] == "café"
assert accepted[1]["note"] == ""
assert accepted[2]["note"] == "NULL"
assert [r["id"] for r in preview] == ["r1", "r2"] and len(preview) < len(accepted)
assert before == after
print(json.dumps({
    "ok": True,
    "accepted_ids": [r["id"] for r in accepted],
    "rejects": rejects,
    "preview": {"ids": [r["id"] for r in preview], "is_sample": True},
    "source_unchanged": before == after,
    "null_empty_literal_distinct": [accepted[0]["score"] is None, accepted[1]["note"] == "", accepted[2]["note"] == "NULL"]
}, ensure_ascii=False, separators=(",", ":")))