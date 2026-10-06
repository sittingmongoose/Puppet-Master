import json

# W3: a bounded preview cannot prove a full-dataset property (deterministic synthetic data, stdlib only)
N, PREVIEW = 10000, 500
rows = []
state = 123456789
for i in range(N):
    state = (state * 1103515245 + 12345) % (2 ** 31)
    v = state % 1000
    if i == 7777:
        v = -1  # a negative value appears far beyond the preview window
    rows.append(v)

preview = rows[:PREVIEW]
full = rows

def claim(seq):
    return {"n_seen": len(seq), "min": min(seq), "has_negative": any(x < 0 for x in seq)}

p, f = claim(preview), claim(full)
result = {
    "preview_claim": p,
    "full_scan_fact": f,
    "preview_supports_full_claim": (p["has_negative"] == f["has_negative"] and p["min"] == f["min"]),
}
assert f["has_negative"] is True and p["has_negative"] is False
assert result["preview_supports_full_claim"] is False
assert f["n_seen"] == N and p["n_seen"] == PREVIEW

# deterministic replay of the same computation must be bit-identical (stable ordering, deterministic function)
again = []
state = 123456789
for i in range(N):
    state = (state * 1103515245 + 12345) % (2 ** 31)
    v = state % 1000
    if i == 7777:
        v = -1
    again.append(v)
assert again == rows, "recomputation diverged"
result["deterministic_replay_identical"] = True
# stable ordering demo: sorted output is well-defined even when input order is not unique-identifying
result["sorted_first3"] = sorted(rows)[:3]
print(json.dumps(result, indent=1))
print("W3 OK: preview (first 500 rows) says 'no negative values'; full scan refutes it — a bounded preview must never be surfaced as proof of a full-dataset property; deterministic recomputation is byte-identical")
