import csv, hashlib, io, json

# W3 (rev 3): bounded streaming path over a synthetic CSV with malformed records and
# no mutation of the source. Malformed lines are recorded (store_rejects pattern),
# never silently dropped; the bounded preview is labelled a sample and shown NOT to
# prove a full-dataset property. Fixture sized to the sandbox file quota.
cfg = data if isinstance(data, dict) else json.loads(data)
rows = int(cfg["rows"]); chunk_bytes = int(cfg["chunk_hint_bytes"]); preview_n = int(cfg["preview_n"])
path = "source.csv"

malformed_at = (2 * rows) // 3
with open(path, "w", encoding="utf-8", newline="") as f:
    f.write("id,val,when,label\n")
    for i in range(rows):
        if i == malformed_at:
            f.write('"unclosed,"quote,2026-01-01T00:00:00Z,bad\n')  # field-count violation
            continue
        val = "" if i % 7 == 0 else "%.6f" % (0.5 + i / rows)  # missing fields + upward trend
        when = "2026-01-%02dT%02d:00:00Z" % ((i % 28) + 1, i % 24)
        f.write("%d,%s,%s,\u00e9\u9ad8\u6821-%d\n" % (i, val, when, i % 50))

with open(path, "rb") as fh:
    src_hash_before = hashlib.sha256(fh.read()).hexdigest()

ok = 0
rejected = []
vals_full = []
vals_preview = []
max_buffered_lines = 0
with open(path, "r", encoding="utf-8", newline="") as f:
    f.readline()  # header
    line_no = 1
    while True:
        chunk = f.readlines(chunk_bytes)
        if not chunk:
            break
        max_buffered_lines = max(max_buffered_lines, len(chunk))
        for raw in chunk:
            line_no += 1
            rec = next(csv.reader(io.StringIO(raw)), None)
            if rec is None or len(rec) != 4:
                rejected.append({"line": line_no, "reason": "field_count!=4", "raw_prefix": raw[:32]})
                continue
            ok += 1
            if rec[1] != "":
                v = float(rec[1])
                vals_full.append(v)
                if len(vals_preview) < preview_n:
                    vals_preview.append(v)

with open(path, "rb") as fh:
    src_hash_after = hashlib.sha256(fh.read()).hexdigest()

mean_full = sum(vals_full) / len(vals_full)
mean_preview = sum(vals_preview) / len(vals_preview)
gap = abs(mean_full - mean_preview)

assert ok + len(rejected) == rows, "every input line accounted for: ok + rejected == total"
assert len(rejected) == 1 and rejected[0]["line"] == malformed_at + 2, rejected
assert src_hash_after == src_hash_before, "source file untouched"
assert gap > 0.2, "bounded preview mean materially misleads here: gap=%.4f" % gap

print("W3 PASS")
print("rows total=%d ok=%d rejected=%d rejected_detail=%s" % (rows, ok, len(rejected), json.dumps(rejected)))
print("source sha256 unchanged after processing: True")
print("full-dataset val mean=%.4f (n=%d) vs %d-row preview mean=%.4f -> gap=%.4f" %
      (mean_full, len(vals_full), len(vals_preview), mean_preview, gap))
print("preview presented as sample only; it does not prove the full-dataset mean")
print("max lines buffered per chunk=%d (chunk hint %d bytes)" % (max_buffered_lines, chunk_bytes))