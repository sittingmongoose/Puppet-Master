import json, hashlib

# W2 (fixed): staleness propagates transitively through dependency edges
def h(s):
    return hashlib.sha256(s.encode()).hexdigest()[:16]

cells = {
    "A": {"source": "df = read_csv('data.csv')", "deps": [], "reads_data": True},
    "B": {"source": "out = df.groupby('k').sum()", "deps": ["A"], "reads_data": False},
}
env = {"python": "3.12.3", "duckdb": "1.3.0"}
data_hash = h("raw-bytes-of-data.csv")

def run(exec_order):
    rec = {}
    for seq, cid in enumerate(exec_order, start=1):
        c = cells[cid]
        rec[cid] = {
            "code_hash": h(c["source"]),
            "dep_hashes": {d: h(cells[d]["source"]) for d in c["deps"]},
            "data_hash": data_hash if c["reads_data"] else None,
            "env_hash": h(json.dumps(env, sort_keys=True)),
            "exec_seq": seq,
            "output": "result-bytes-" + cid,
        }
    return rec

def status(cid, rec, state, kernel_alive):
    r = rec[cid]
    if not kernel_alive:
        return "unverified"  # kernel restarted: stored outputs not known to match live state
    if r["code_hash"] != h(cells[cid]["source"]):
        return "stale"
    if r["data_hash"] is not None and r["data_hash"] != state["data_hash"]:
        return "stale"
    if r["env_hash"] != h(json.dumps(state["env"], sort_keys=True)):
        return "stale"
    for d in cells[cid]["deps"]:
        if status(d, rec, state, kernel_alive) != "current":
            return "stale"   # upstream stale -> downstream stale even if hashes here still match
    return "current"

base_state = {"env": env, "data_hash": data_hash}
rec = run(["A", "B"])
r1 = [status(c, rec, base_state, True) for c in ("A", "B")]
assert r1 == ["current", "current"], r1

cells["A"] = dict(cells["A"], source="df = read_csv('data_v2.csv')")
r2 = [status(c, rec, base_state, True) for c in ("A", "B")]
assert r2 == ["stale", "stale"], r2

cells["A"]["source"] = "df = read_csv('data.csv')"
r3 = [status(c, rec, base_state, True) for c in ("A", "B")]
assert r3 == ["current", "current"], r3

state_ds = dict(base_state, data_hash=h("different-bytes"))
r4 = [status(c, rec, state_ds, True) for c in ("A", "B")]
assert r4 == ["stale", "stale"], r4  # dataset change reaches B transitively via A

state_env = {"env": {"python": "3.13.1", "duckdb": "1.3.0"}, "data_hash": data_hash}
r5 = [status(c, rec, state_env, True) for c in ("A", "B")]
assert r5 == ["stale", "stale"], r5

r6 = [status(c, rec, base_state, False) for c in ("A", "B")]
assert r6 == ["unverified", "unverified"], r6

rec2 = run(["B", "A"])  # messy session: B executed before A
o1 = (rec["A"]["exec_seq"], rec["B"]["exec_seq"])
o2 = (rec2["A"]["exec_seq"], rec2["B"]["exec_seq"])
assert o1 == (1, 2) and o2 == (2, 1), (o1, o2)

print(json.dumps({
    "baseline": r1, "after_edit_upstream": r2, "after_restore": r3,
    "after_source_dataset_change": r4, "after_env_change": r5,
    "after_kernel_restart": r6,
    "exec_seq_run1_displayAB": o1, "exec_seq_run2_displayAB": o2,
}, indent=1))
print("W2 OK: current/stale/unverified derived from recorded code+dep+data+env hashes; dataset change propagates transitively; restart -> unverified (never silently current); execution order kept separately from display order")
