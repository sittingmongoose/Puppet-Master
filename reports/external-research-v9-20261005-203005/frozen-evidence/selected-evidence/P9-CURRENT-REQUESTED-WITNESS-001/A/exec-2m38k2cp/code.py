import json, hashlib

# W2: cell-level staleness/invalidation witness (execution order vs display order, env/data/code hashes, restart -> unverified)
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
            "cid": cid,
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
        return "unverified"            # kernel restarted: stored outputs are not known to match live state
    if r["exec_state"] == "interrupted":
        return "failed"
    if r["code_hash"] != h(cells[cid]["source"]):
        return "stale"
    if any(r["dep_hashes"][d] != h(cells[d]["source"]) for d in r["dep_hashes"]):
        return "stale"
    if r["data_hash"] is not None and r["data_hash"] != state["data_hash"]:
        return "stale"
    if r["env_hash"] != h(json.dumps(state["env"], sort_keys=True)):
        return "stale"
    return "current"

base_state = {"env": env, "data_hash": data_hash}
rec = run(["A", "B"])                  # clean run in display order
for cid in rec:
    rec[cid]["exec_state"] = "done"

r1 = [status(c, rec, base_state, True) for c in ("A", "B")]
assert r1 == ["current", "current"], r1

rec["B"]["output"] = "result-bytes-B"  # saved output identical
cells["A"] = dict(cells["A"], source="df = read_csv('data_v2.csv')")  # edit upstream cell
r2 = [status(c, rec, base_state, True) for c in ("A", "B")]
assert r2 == ["stale", "stale"], r2   # A's code changed; B depends on A

cells["A"]["source"] = "df = read_csv('data.csv')"
r3 = [status(c, rec, base_state, True) for c in ("A", "B")]
assert r3 == ["current", "current"], r3

state_ds = dict(base_state, data_hash=h("different-bytes"))
r4 = [status(c, rec, state_ds, True) for c in ("A", "B")]
assert r4 == ["stale", "stale"], r4   # source dataset changed -> downstream stale even though A owns the read

state_env = {"env": {"python": "3.13.1", "duckdb": "1.3.0"}, "data_hash": data_hash}
r5 = [status(c, rec, state_env, True) for c in ("A", "B")]
assert r5 == ["stale", "stale"], r5   # environment dependency changed

r6 = [status(c, rec, base_state, False) for c in ("A", "B")]
assert r6 == ["unverified", "unverified"], r6  # kernel restart: must NOT silently label outputs current

rec2 = run(["B", "A"])                 # user ran B before A in a messy session
for cid in rec2:
    rec2[cid]["exec_state"] = "done"
display_order = ["A", "B"]
exec_orders = [rec["A"]["exec_seq"], rec["B"]["exec_seq"]], [rec2["A"]["exec_seq"], rec2["B"]["exec_seq"]]
assert exec_orders == [(1, 2), (2, 1)], exec_orders  # provenance distinguishes actual execution order from display order

print(json.dumps({
    "baseline": r1, "after_edit_upstream": r2, "restored": r3,
    "after_source_dataset_change": r4, "after_env_change": r5,
    "after_kernel_restart": r6,
    "exec_seq_run1": exec_orders[0], "exec_seq_run2": exec_orders[1],
}, indent=1))
print("W2 OK: status current/stale/unverified derived from recorded code+dep+data+env hashes; restart -> unverified; execution order kept separately from display order")
