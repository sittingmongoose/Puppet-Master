
import hashlib, json

# W1: schema-inference divergence on one small column of string values
values = ["12", "3.5", "NA", "", "1,000", "42"]
def infer_naive(vs):
    typed = []
    for v in vs:
        if v in ("", "NA"):
            typed.append(None); continue
        try: typed.append(int(v))
        except ValueError:
            try: typed.append(float(v))
            except ValueError: typed.append(v)
    return typed
def infer_sample(vs, sample=2):
    # infer type from first `sample` rows, then force it on all rows;
    # uncoercible values go to quarantine records, never silently dropped
    head = infer_naive(vs[:sample])
    kind = type(head[0]) if head and head[0] is not None else str
    typed, quarantined = [], []
    for i, v in enumerate(vs):
        if v in ("", "NA"):
            typed.append(None); continue
        try:
            typed.append(int(v) if kind is int else (float(v) if kind is float else v))
        except ValueError:
            quarantined.append({"row": i, "raw": v, "expected": kind.__name__})
            typed.append(None)
    return typed, quarantined
naive = infer_naive(values)
sampled, quarantined = infer_sample(values)
s_naive = sum(x for x in naive if isinstance(x, (int, float)))
s_sampled = sum(x for x in sampled if isinstance(x, (int, float)))
print("W1 naive per-value types:", [type(x).__name__ for x in naive])
print("W1 sample-first per-value types:", [type(x).__name__ for x in sampled])
print("W1 sum naive vs sample-first:", s_naive, "vs", s_sampled)
print("W1 quarantine records (no silent drop):", json.dumps(quarantined))
assert s_naive != s_sampled, "expected divergent aggregates under different declared conversions"
assert any(q["row"] >= 2 for q in quarantined), "late-row failure beyond the inference sample must be caught by full validation"

# W2: content-addressed staleness ledger with upstream-edit and kernel-restart invalidation
def h(*parts): return hashlib.sha256("\x1f".join(parts).encode("utf-8")).hexdigest()[:16]
env = "py3.11+duckdb1.1"
src_v1, src_v2 = "datasetbytes-v1", "datasetbytes-v2"
ledger = {}
def run(cell_id, code, downstream, input_hash, exec_counter):
    ledger[(cell_id, downstream)] = {"cell": cell_id, "code_hash": h(code), "env_hash": h(env),
                                     "input_hash": h(input_hash), "exec": exec_counter, "status": "current"}
def recompute(cell_id, code, downstream, input_hash):
    r = ledger.get((cell_id, downstream))
    if r is None: return "unverified"
    if (r["code_hash"] != h(code) or r["env_hash"] != h(env) or r["input_hash"] != h(input_hash)):
        r["status"] = "stale"
    return r["status"]
run("c1", "df = read('d.csv')", False, src_v1, 1)
run("c2", "agg = df.sum()", True, src_v1, 2)
base_c1 = recompute("c1", "df = read('d.csv')", False, src_v1)
base_c2 = recompute("c2", "agg = df.sum()", True, src_v1)
after_src_c1 = recompute("c1", "df = read('d.csv')", False, src_v2)  # source data changed
after_src_c2 = recompute("c2", "agg = df.sum()", True, src_v2)
print("W2 baseline c1,c2:", base_c1, base_c2)
print("W2 after source-data change c1,c2:", after_src_c1, after_src_c2)
for r in ledger.values():          # kernel restart: nothing may remain labeled current
    r["status"] = "unverified"
print("W2 after kernel restart:", [r["status"] for r in ledger.values()])
assert (base_c1, base_c2) == ("current", "current")
assert after_src_c2 == "stale", "downstream output must go stale when upstream data changes"
assert all(r["status"] == "unverified" for r in ledger.values())

# W2b: stable vs deterministic ordering of duplicate keys
rows = [{"k": 2, "i": 0}, {"k": 1, "i": 1}, {"k": 2, "i": 2}]
stable = sorted(rows, key=lambda r: r["k"])
deterministic = sorted(rows, key=lambda r: (r["k"], r["i"]))
print("W2b stable order idx:", [r["i"] for r in stable], "deterministic:", [r["i"] for r in deterministic])
assert [r["i"] for r in stable] == [1, 0, 2] and [r["i"] for r in deterministic] == [1, 0, 2]
print("W1+W2+W2b OK exit 0")
