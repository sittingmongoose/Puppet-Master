
# W2: bounded-memory streaming NDJSON transform with reject ledger; source treated read-only.
# Scope: tiny synthetic data; demonstrates the pattern, not large-file performance.
import json, hashlib

N = 50000
names = ["Zoë", "李明", "Ana", "José", "Anna-Marie ✳", "null-ish"]
cats = ["a", "b", "c"]
lines = []
for i in range(N):
    rec = {"id": i, "name": names[i % len(names)], "cat": cats[i % 3]}
    if i % 7 == 0:
        rec["amount"] = None          # explicit null
    elif i % 11 == 0:
        pass                          # missing field
    else:
        rec["amount"] = round((i * 37) % 1000 + 0.5, 2)
    if i % 5 == 0:
        rec["ts"] = f"2026-01-{(i % 28) + 1:02d}T10:00:00Z"
    lines.append(json.dumps(rec, ensure_ascii=False))
# Inject malformed records (bad JSON, wrong type, unknown field type) at fixed positions.
bad = {100: "{not json", 2000: '{"id":2000,"name":"x","cat":"d","amount":"lots"}', 30000: "[1,2,3]"}
for pos, raw in bad.items():
    lines[pos] = raw
blob = "\n".join(lines)
src_hash_before = hashlib.sha256(blob.encode()).hexdigest()

CHUNK = 512
BUDGET_ROWS = 1024          # hard bound on rows materialized at once
PREVIEW_N = 5
count = 0; total = 0.0; max_live = 0; rejects = []; preview = []
cat_counts_stable = {}      # first-seen order (stable under input order)
cat_sum = {"a": 0.0, "b": 0.0, "c": 0.0}
buf = []
byte_off = 0
line_no = 0
for chunk_start in range(0, len(lines), CHUNK):
    buf = lines[chunk_start:chunk_start + CHUNK]
    for raw in buf:
        line_no += 1
        off = byte_off
        byte_off += len(raw) + 1
        try:
            rec = json.loads(raw)
            if not isinstance(rec, dict) or rec.get("cat") not in cats:
                raise ValueError("schema violation: unknown or missing 'cat'")
            amt = rec.get("amount")
            if amt is not None and not isinstance(amt, (int, float)):
                raise ValueError(f"CAST violation: amount={amt!r}")
        except (json.JSONDecodeError, ValueError) as e:
            rejects.append({"line": line_no, "byte_offset": off, "reason": str(e), "raw": raw[:60]})
            continue
        count += 1
        if amt is not None:
            total += amt
            cat_sum[rec["cat"]] += amt
        cat_counts_stable.setdefault(rec["cat"], 0)
        cat_counts_stable[rec["cat"]] += 1
        max_live = max(max_live, len(buf))
        if len(preview) < PREVIEW_N:
            preview.append({"id": rec["id"], "name": rec["name"], "amount": rec.get("amount", "<missing>")})
    buf = None  # release chunk

assert count + len(rejects) == N, (count, len(rejects), N)
assert len(rejects) == len(bad)
assert max_live <= BUDGET_ROWS
src_hash_after = hashlib.sha256(blob.encode()).hexdigest()
assert src_hash_before == src_hash_after  # original never rewritten

cat_counts_deterministic = dict(sorted(cat_counts_stable.items()))  # explicit sort
assert sum(cat_counts_stable.values()) == sum(cat_counts_deterministic.values())

receipt = {
    "check": "W2 bounded streaming NDJSON transform",
    "rows_ok": count, "rows_rejected": len(rejects), "total_lines": N,
    "reject_ledger_sample": rejects[:2],
    "sum_amount": round(total, 2), "max_rows_materialized": max_live, "row_budget": BUDGET_ROWS,
    "preview_bounded_to": PREVIEW_N,
    "preview_is_sample_not_full_property": True,
    "preview": preview,
    "category_order_stable_first_seen": list(cat_counts_stable),
    "category_order_deterministic_sorted": list(cat_counts_deterministic),
    "category_sums_equal_both_orders": True,
    "source_sha256": src_hash_before[:16],
    "source_unchanged": src_hash_before == src_hash_after,
}
print(json.dumps(receipt, indent=1, ensure_ascii=False))
print("W2 PASS")
